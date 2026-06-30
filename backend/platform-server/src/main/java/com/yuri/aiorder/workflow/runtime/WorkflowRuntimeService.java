package com.yuri.aiorder.workflow.runtime;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.AccessControlService;
import com.yuri.aiorder.order.status.ExternalOrderStatus;
import com.yuri.aiorder.order.status.InternalOrderStatus;
import com.yuri.aiorder.order.status.OrderStatusService;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class WorkflowRuntimeService {

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;
    private final OrderStatusService orderStatusService;
    private final AccessControlService accessControlService;

    public WorkflowRuntimeService(
            JdbcClient jdbcClient,
            ObjectMapper objectMapper,
            OrderStatusService orderStatusService,
            AccessControlService accessControlService) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
        this.orderStatusService = orderStatusService;
        this.accessControlService = accessControlService;
    }

    @Transactional
    public ProductionReviewResponse reviewProduction(
            long orderId, ProductionReviewRequest request, BootstrapIdentity identity) {
        accessControlService.requireProductionReview(identity);
        requirePendingProductionReview(orderId);
        String action = normalize(request.action());
        if ("REJECT".equals(action)) {
            jdbcClient.sql("""
                            UPDATE orders
                            SET reject_reason = :rejectReason
                            WHERE order_id = :orderId
                            """)
                    .param("rejectReason", request.rejectReason())
                    .param("orderId", orderId)
                    .update();
            ExternalOrderStatus external = orderStatusService.updateOrderState(
                    orderId, InternalOrderStatus.PRODUCTION_REJECTED, "PRODUCTION_REJECT", identity.userId(), request.rejectReason());
            return new ProductionReviewResponse(orderId, null, InternalOrderStatus.PRODUCTION_REJECTED.name(), external.name());
        }
        if (!"APPROVE".equals(action)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unsupported production review action");
        }
        if (request.chainId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "chain_id is required when approving production review");
        }
        long instanceId = instantiateIfAbsent(orderId, request);
        ExternalOrderStatus external = orderStatusService.updateOrderState(
                orderId,
                InternalOrderStatus.PROCESS_INSTANCE_CREATED,
                "PRODUCTION_REVIEW_APPROVE",
                identity.userId(),
                "process instance created");
        return new ProductionReviewResponse(
                orderId, instanceId, InternalOrderStatus.PROCESS_INSTANCE_CREATED.name(), external.name());
    }

    private void requirePendingProductionReview(long orderId) {
        String currentStatus;
        try {
            currentStatus = jdbcClient.sql("""
                            SELECT internal_status
                            FROM orders
                            WHERE order_id = :orderId
                            FOR UPDATE
                            """)
                    .param("orderId", orderId)
                    .query(String.class)
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found", ex);
        }
        if (!InternalOrderStatus.PENDING_PRODUCTION_REVIEW.name().equals(currentStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "order is not pending production review");
        }
    }

    public ProcessInstanceResponse getProcessInstance(long orderId, BootstrapIdentity identity) {
        accessControlService.requireInternalAccess(identity, "doctor cannot access process instance");
        InstanceRow instance = loadInstanceByOrder(orderId, identity);
        return new ProcessInstanceResponse(
                instance.instanceId(),
                instance.orderId(),
                instance.instanceStatus(),
                loadNodes(instance.instanceId()),
                loadEdges(instance.instanceId()));
    }

    @Transactional
    public void assign(long orderId, AssignmentRequest request, BootstrapIdentity identity) {
        accessControlService.requireProcessManagement(identity);
        ensureInstanceForOrder(orderId);
        if (request.assignments() == null || request.assignments().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "assignments is required");
        }
        for (AssignmentRequest.AssignmentItem item : request.assignments()) {
            int updated = jdbcClient.sql("""
                            UPDATE order_process_node n
                            JOIN order_process_instance i ON i.instance_id = n.instance_id
                            SET n.assigned_user_id = :userId
                            WHERE i.order_id = :orderId
                              AND n.node_instance_id = :nodeInstanceId
                              AND n.node_status IN ('PENDING', 'READY', 'IN_PROGRESS')
                            """)
                    .param("userId", item.userId())
                    .param("orderId", orderId)
                    .param("nodeInstanceId", item.nodeInstanceId())
                    .update();
            if (updated == 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "node cannot be assigned");
            }
        }
    }

    @Transactional
    public void reassign(long orderId, long nodeInstanceId, ReassignRequest request, BootstrapIdentity identity) {
        accessControlService.requireProcessManagement(identity);
        ensureInstanceForOrder(orderId);
        int updated = jdbcClient.sql("""
                        UPDATE order_process_node n
                        JOIN order_process_instance i ON i.instance_id = n.instance_id
                        SET n.assigned_user_id = :userId
                        WHERE i.order_id = :orderId
                          AND n.node_instance_id = :nodeInstanceId
                          AND n.node_status IN ('PENDING', 'READY', 'IN_PROGRESS')
                        """)
                .param("userId", request.newUserId())
                .param("orderId", orderId)
                .param("nodeInstanceId", nodeInstanceId)
                .update();
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "node cannot be reassigned");
        }
    }

    @Transactional
    public NodeActionResponse startNode(long nodeInstanceId, BootstrapIdentity identity) {
        NodeRow node = lockNode(nodeInstanceId);
        requireWorkerAssignment(node, identity);
        if (!"READY".equals(node.nodeStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "node is not ready to start");
        }
        if (node.needInCheck() == 1 && !hasPassedCheck(nodeInstanceId, "IN")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "node must pass in-check before start");
        }
        jdbcClient.sql("""
                        UPDATE order_process_node
                        SET node_status = 'IN_PROGRESS',
                            started_at = COALESCE(started_at, CURRENT_TIMESTAMP(3))
                        WHERE node_instance_id = :nodeInstanceId
                        """)
                .param("nodeInstanceId", nodeInstanceId)
                .update();
        orderStatusService.updateOrderState(
                node.orderId(), InternalOrderStatus.IN_PRODUCTION, "PROCESS_NODE_START", identity.userId(), node.processName());
        return new NodeActionResponse(nodeInstanceId, "IN_PROGRESS");
    }

    @Transactional
    public NodeActionResponse completeNode(long nodeInstanceId, BootstrapIdentity identity) {
        NodeRow node = lockNode(nodeInstanceId);
        requireWorkerAssignment(node, identity);
        if (!"IN_PROGRESS".equals(node.nodeStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "node is not in progress");
        }
        jdbcClient.sql("""
                        UPDATE order_process_node
                        SET node_status = 'COMPLETED',
                            completed_at = CURRENT_TIMESTAMP(3)
                        WHERE node_instance_id = :nodeInstanceId
                        """)
                .param("nodeInstanceId", nodeInstanceId)
                .update();
        activateReadyNodes(node.instanceId());
        completeInstanceIfDone(node.instanceId());
        return new NodeActionResponse(nodeInstanceId, "COMPLETED");
    }

    @Transactional
    public NodeActionResponse skipNode(long nodeInstanceId, SkipNodeRequest request, BootstrapIdentity identity) {
        accessControlService.requireProcessManagement(identity);
        NodeRow node = lockNode(nodeInstanceId);
        if (node.isOptional() != 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "only optional nodes can be skipped");
        }
        if (!List.of("PENDING", "READY").contains(node.nodeStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "node cannot be skipped in current status");
        }
        jdbcClient.sql("""
                        UPDATE order_process_node
                        SET node_status = 'SKIPPED',
                            skipped_at = CURRENT_TIMESTAMP(3),
                            skip_reason = :reason
                        WHERE node_instance_id = :nodeInstanceId
                        """)
                .param("reason", request == null ? null : request.reason())
                .param("nodeInstanceId", nodeInstanceId)
                .update();
        activateReadyNodes(node.instanceId());
        completeInstanceIfDone(node.instanceId());
        return new NodeActionResponse(nodeInstanceId, "SKIPPED");
    }

    public List<MyTaskResponse> getMyTasks(BootstrapIdentity identity, String status) {
        accessControlService.requireAnyRole(
                identity, EnumSet.of(UserRole.WORKER, UserRole.ADMIN), "tasks/mine requires WORKER or ADMIN role");
        if (identity.userId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "worker user id is required");
        }
        String normalizedStatus = status == null || status.isBlank() ? null : normalize(status);
        return jdbcClient.sql("""
                        SELECT
                            n.node_instance_id,
                            i.order_id,
                            o.order_no,
                            n.process_name,
                            n.node_status,
                            n.standard_duration
                        FROM order_process_node n
                        JOIN order_process_instance i ON i.instance_id = n.instance_id
                        JOIN orders o ON o.order_id = i.order_id
                        WHERE n.assigned_user_id = :userId
                          AND (:status IS NULL OR n.node_status = :status)
                        ORDER BY n.updated_at DESC, n.node_instance_id DESC
                        """)
                .param("userId", identity.userId())
                .param("status", normalizedStatus)
                .query((rs, rowNum) -> new MyTaskResponse(
                        rs.getLong("node_instance_id"),
                        rs.getLong("order_id"),
                        rs.getString("order_no"),
                        rs.getString("process_name"),
                        rs.getString("node_status"),
                        rs.getObject("standard_duration", Integer.class)))
                .list();
    }

    private long instantiateIfAbsent(long orderId, ProductionReviewRequest request) {
        Long existing = jdbcClient.sql("""
                        SELECT instance_id
                        FROM order_process_instance
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .query(Long.class)
                .optional()
                .orElse(null);
        if (existing != null) {
            return existing;
        }
        ChainRow chain = loadChain(request.chainId());
        String branchParams = branchParamsJson(request);
        jdbcClient.sql("""
                        INSERT INTO order_process_instance
                            (order_id, chain_id, chain_version, intake_branch_used, branch_params, instance_status)
                        VALUES
                            (:orderId, :chainId, :chainVersion, :intakeBranch, CAST(:branchParams AS JSON), 'ACTIVE')
                        """)
                .param("orderId", orderId)
                .param("chainId", chain.chainId())
                .param("chainVersion", chain.version())
                .param("intakeBranch", request.intakeBranch())
                .param("branchParams", branchParams)
                .update();
        long instanceId = jdbcClient.sql("SELECT instance_id FROM order_process_instance WHERE order_id = :orderId")
                .param("orderId", orderId)
                .query(Long.class)
                .single();
        copyNodes(instanceId, chain.chainId(), request);
        copyEdges(instanceId, chain.chainId());
        activateReadyNodes(instanceId);
        return instanceId;
    }

    private void copyNodes(long instanceId, long chainId, ProductionReviewRequest request) {
        List<DefinitionNode> nodes = jdbcClient.sql("""
                        SELECT
                            node_id,
                            node_code,
                            process_name,
                            stage_name,
                            step_order,
                            is_optional,
                            branch_group,
                            branch_key,
                            standard_duration,
                            default_role,
                            node_category,
                            need_in_check,
                            need_out_check
                        FROM workflow_node
                        WHERE chain_id = :chainId
                        ORDER BY step_order, node_id
                        """)
                .param("chainId", chainId)
                .query((rs, rowNum) -> new DefinitionNode(
                        rs.getLong("node_id"),
                        rs.getString("node_code"),
                        rs.getString("process_name"),
                        rs.getString("stage_name"),
                        rs.getInt("step_order"),
                        rs.getInt("is_optional"),
                        rs.getString("branch_group"),
                        rs.getString("branch_key"),
                        rs.getObject("standard_duration", Integer.class),
                        rs.getString("default_role"),
                        rs.getString("node_category"),
                        rs.getInt("need_in_check"),
                        rs.getInt("need_out_check")))
                .list();
        for (DefinitionNode node : nodes) {
            if (!branchMatches(node.branchGroup(), node.branchKey(), request)) {
                continue;
            }
            jdbcClient.sql("""
                            INSERT INTO order_process_node
                                (instance_id, source_node_id, node_code, process_name, stage_name, step_order,
                                 is_optional, branch_group, branch_key, standard_duration, default_role,
                                 node_category, need_in_check, need_out_check, node_status)
                            VALUES
                                (:instanceId, :sourceNodeId, :nodeCode, :processName, :stageName, :stepOrder,
                                 :isOptional, :branchGroup, :branchKey, :standardDuration, :defaultRole,
                                 :nodeCategory, :needInCheck, :needOutCheck, 'PENDING')
                            """)
                    .param("instanceId", instanceId)
                    .param("sourceNodeId", node.nodeId())
                    .param("nodeCode", node.nodeCode())
                    .param("processName", node.processName())
                    .param("stageName", node.stageName())
                    .param("stepOrder", node.stepOrder())
                    .param("isOptional", node.isOptional())
                    .param("branchGroup", node.branchGroup())
                    .param("branchKey", node.branchKey())
                    .param("standardDuration", node.standardDuration())
                    .param("defaultRole", node.defaultRole())
                    .param("nodeCategory", node.nodeCategory())
                    .param("needInCheck", node.needInCheck())
                    .param("needOutCheck", node.needOutCheck())
                    .update();
        }
    }

    private void copyEdges(long instanceId, long chainId) {
        jdbcClient.sql("""
                        INSERT INTO order_process_edge
                            (instance_id, from_node_instance_id, to_node_instance_id, edge_type, condition_key)
                        SELECT
                            :instanceId,
                            from_node.node_instance_id,
                            to_node.node_instance_id,
                            e.edge_type,
                            e.condition_key
                        FROM workflow_edge e
                        JOIN order_process_node from_node
                          ON from_node.instance_id = :instanceId
                         AND from_node.source_node_id = e.from_node_id
                        JOIN order_process_node to_node
                          ON to_node.instance_id = :instanceId
                         AND to_node.source_node_id = e.to_node_id
                        WHERE e.chain_id = :chainId
                        """)
                .param("instanceId", instanceId)
                .param("chainId", chainId)
                .update();
    }

    private void activateReadyNodes(long instanceId) {
        jdbcClient.sql("""
                        UPDATE order_process_node target
                        JOIN (
                            SELECT ready_nodes.node_instance_id
                            FROM (
                                SELECT candidate.node_instance_id
                                FROM order_process_node candidate
                                WHERE candidate.instance_id = :instanceId
                                  AND candidate.node_status = 'PENDING'
                                  AND NOT EXISTS (
                                      SELECT 1
                                      FROM order_process_edge incoming
                                      JOIN order_process_node predecessor
                                        ON predecessor.node_instance_id = incoming.from_node_instance_id
                                      WHERE incoming.instance_id = candidate.instance_id
                                        AND incoming.to_node_instance_id = candidate.node_instance_id
                                        AND predecessor.node_status NOT IN ('COMPLETED', 'SKIPPED')
                                  )
                            ) ready_nodes
                        ) selected ON selected.node_instance_id = target.node_instance_id
                        SET target.node_status = 'READY'
                        """)
                .param("instanceId", instanceId)
                .update();
    }

    private void completeInstanceIfDone(long instanceId) {
        long openCount = jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM order_process_node
                        WHERE instance_id = :instanceId
                          AND node_status NOT IN ('COMPLETED', 'SKIPPED')
                        """)
                .param("instanceId", instanceId)
                .query(Long.class)
                .single();
        if (openCount == 0) {
            jdbcClient.sql("""
                            UPDATE order_process_instance
                            SET instance_status = 'COMPLETED'
                            WHERE instance_id = :instanceId
                            """)
                    .param("instanceId", instanceId)
                    .update();
        }
    }

    private boolean branchMatches(String branchGroup, String branchKey, ProductionReviewRequest request) {
        if (branchGroup == null || branchGroup.isBlank() || branchKey == null || branchKey.isBlank()) {
            return true;
        }
        if ("intake".equalsIgnoreCase(branchGroup) && request.intakeBranch() != null) {
            return branchKey.equalsIgnoreCase(request.intakeBranch());
        }
        JsonNode params = request.branchParams();
        if (params == null || !params.has(branchGroup)) {
            return false;
        }
        return branchKey.equalsIgnoreCase(params.path(branchGroup).asText());
    }

    private String branchParamsJson(ProductionReviewRequest request) {
        JsonNode params = request.branchParams();
        if (params == null || params.isNull()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(params);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid branch_params", ex);
        }
    }

    private void requireWorkerAssignment(NodeRow node, BootstrapIdentity identity) {
        accessControlService.requireAssignedWorkerOrAdmin(identity, node.assignedUserId(), "worker cannot operate this node");
    }

    private boolean hasPassedCheck(long nodeInstanceId, String checkType) {
        return jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM check_record
                        WHERE node_instance_id = :nodeInstanceId
                          AND check_type = :checkType
                          AND result = 'PASS'
                        """)
                .param("nodeInstanceId", nodeInstanceId)
                .param("checkType", checkType)
                .query(Long.class)
                .single() > 0;
    }

    private ChainRow loadChain(long chainId) {
        try {
            return jdbcClient.sql("""
                            SELECT chain_id, version
                            FROM workflow_chain
                            WHERE chain_id = :chainId
                              AND status = 1
                            """)
                    .param("chainId", chainId)
                    .query((rs, rowNum) -> new ChainRow(rs.getLong("chain_id"), rs.getInt("version")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "workflow chain not found", ex);
        }
    }

    private InstanceRow loadInstanceByOrder(long orderId) {
        try {
            return jdbcClient.sql("""
                            SELECT instance_id, order_id, instance_status
                            FROM order_process_instance
                            WHERE order_id = :orderId
                            """)
                    .param("orderId", orderId)
                    .query((rs, rowNum) -> new InstanceRow(
                            rs.getLong("instance_id"),
                            rs.getLong("order_id"),
                            rs.getString("instance_status")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "process instance not found", ex);
        }
    }

    private InstanceRow loadInstanceByOrder(long orderId, BootstrapIdentity identity) {
        String dataScope = accessControlService.effectiveDataScope(identity);
        accessControlService.requireScopedIdentity(identity, dataScope);
        try {
            return jdbcClient.sql("""
                            SELECT i.instance_id, i.order_id, i.instance_status
                            FROM order_process_instance i
                            JOIN orders o ON o.order_id = i.order_id
                            WHERE i.order_id = :orderId
                              AND (
                                  :dataScope = 'ALL'
                                  OR (:dataScope = 'CLINIC'
                                      AND (o.clinic_id = :clinicId OR o.doctor_user_id = :userId))
                                  OR (:dataScope = 'SELF'
                                      AND EXISTS (
                                          SELECT 1
                                          FROM order_process_node scoped_n
                                          WHERE scoped_n.instance_id = i.instance_id
                                            AND scoped_n.assigned_user_id = :userId
                                      ))
                              )
                            """)
                    .param("orderId", orderId)
                    .param("dataScope", dataScope)
                    .param("userId", identity.userId())
                    .param("clinicId", identity.clinicId())
                    .query((rs, rowNum) -> new InstanceRow(
                            rs.getLong("instance_id"),
                            rs.getLong("order_id"),
                            rs.getString("instance_status")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            if (processInstanceExists(orderId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "identity cannot access process instance", ex);
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "process instance not found", ex);
        }
    }

    private void ensureInstanceForOrder(long orderId) {
        loadInstanceByOrder(orderId);
    }

    private boolean processInstanceExists(long orderId) {
        return jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM order_process_instance
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .query(Long.class)
                .single() > 0;
    }

    private NodeRow lockNode(long nodeInstanceId) {
        try {
            return jdbcClient.sql("""
                            SELECT
                                n.node_instance_id,
                                n.instance_id,
                                i.order_id,
                                n.process_name,
                                n.is_optional,
                                n.need_in_check,
                                n.assigned_user_id,
                                n.node_status
                            FROM order_process_node n
                            JOIN order_process_instance i ON i.instance_id = n.instance_id
                            WHERE n.node_instance_id = :nodeInstanceId
                            FOR UPDATE
                            """)
                    .param("nodeInstanceId", nodeInstanceId)
                    .query((rs, rowNum) -> new NodeRow(
                            rs.getLong("node_instance_id"),
                            rs.getLong("instance_id"),
                            rs.getLong("order_id"),
                            rs.getString("process_name"),
                            rs.getInt("is_optional"),
                            rs.getInt("need_in_check"),
                            rs.getObject("assigned_user_id", Long.class),
                            rs.getString("node_status")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "process node not found", ex);
        }
    }

    private List<ProcessNodeResponse> loadNodes(long instanceId) {
        return jdbcClient.sql("""
                        SELECT
                            node_instance_id,
                            node_code,
                            process_name,
                            step_order,
                            is_optional,
                            branch_group,
                            assigned_user_id,
                            node_status,
                            standard_duration
                        FROM order_process_node
                        WHERE instance_id = :instanceId
                        ORDER BY step_order, node_instance_id
                        """)
                .param("instanceId", instanceId)
                .query((rs, rowNum) -> new ProcessNodeResponse(
                        rs.getLong("node_instance_id"),
                        rs.getString("node_code"),
                        rs.getString("process_name"),
                        rs.getInt("step_order"),
                        rs.getInt("is_optional"),
                        rs.getString("branch_group"),
                        rs.getObject("assigned_user_id", Long.class),
                        rs.getString("node_status"),
                        rs.getObject("standard_duration", Integer.class)))
                .list();
    }

    private List<ProcessEdgeResponse> loadEdges(long instanceId) {
        return jdbcClient.sql("""
                        SELECT
                            edge_instance_id,
                            from_node_instance_id,
                            to_node_instance_id,
                            edge_type
                        FROM order_process_edge
                        WHERE instance_id = :instanceId
                        ORDER BY edge_instance_id
                        """)
                .param("instanceId", instanceId)
                .query((rs, rowNum) -> new ProcessEdgeResponse(
                        rs.getLong("edge_instance_id"),
                        rs.getLong("from_node_instance_id"),
                        rs.getLong("to_node_instance_id"),
                        rs.getString("edge_type")))
                .list();
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    private record ChainRow(long chainId, int version) {
    }

    private record InstanceRow(long instanceId, long orderId, String instanceStatus) {
    }

    private record NodeRow(
            long nodeInstanceId,
            long instanceId,
            long orderId,
            String processName,
            int isOptional,
            int needInCheck,
            Long assignedUserId,
            String nodeStatus) {
    }

    private record DefinitionNode(
            long nodeId,
            String nodeCode,
            String processName,
            String stageName,
            int stepOrder,
            int isOptional,
            String branchGroup,
            String branchKey,
            Integer standardDuration,
            String defaultRole,
            String nodeCategory,
            int needInCheck,
            int needOutCheck) {
    }
}
