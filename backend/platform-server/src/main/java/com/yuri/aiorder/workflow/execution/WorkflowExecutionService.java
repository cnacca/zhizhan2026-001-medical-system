package com.yuri.aiorder.workflow.execution;

import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.auth.AccessControlService;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class WorkflowExecutionService {

    private final JdbcClient jdbcClient;
    private final AccessControlService accessControlService;

    public WorkflowExecutionService(JdbcClient jdbcClient, AccessControlService accessControlService) {
        this.jdbcClient = jdbcClient;
        this.accessControlService = accessControlService;
    }

    @Transactional
    public CheckRecordResponse submitCheck(CheckRecordRequest request, BootstrapIdentity identity) {
        if (request.nodeInstanceId() == null || request.checkType() == null || request.isPass() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "node_instance_id, check_type and is_pass are required");
        }
        NodeRow node = lockNode(request.nodeInstanceId());
        requireWorkerAssignment(node, identity);
        String checkType = normalizeCheckType(request.checkType());
        if ("IN".equals(checkType) && !"READY".equals(node.nodeStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "in-check requires ready node");
        }
        if ("OUT".equals(checkType) && !"COMPLETED".equals(node.nodeStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "out-check requires completed node");
        }
        String result = Boolean.TRUE.equals(request.isPass()) ? "PASS" : "FAIL";
        jdbcClient.sql("""
                        INSERT INTO check_record
                            (order_id, node_instance_id, check_type, result, checker_user_id, note)
                        VALUES
                            (:orderId, :nodeInstanceId, :checkType, :result, :checkerUserId, :note)
                        """)
                .param("orderId", node.orderId())
                .param("nodeInstanceId", node.nodeInstanceId())
                .param("checkType", checkType)
                .param("result", result)
                .param("checkerUserId", identity.userId())
                .param("note", request.remark())
                .update();
        long checkId = lastInsertId();
        Long reworkId = null;
        if ("OUT".equals(checkType) && "FAIL".equals(result)) {
            reworkId = createRework(node, checkId, request);
        }
        return new CheckRecordResponse(checkId, node.nodeInstanceId(), request.checkType(), result, reworkId);
    }

    public List<CheckRecordResponse> getChecks(long nodeInstanceId, BootstrapIdentity identity) {
        accessControlService.requireCheckRecordRead(identity);
        return jdbcClient.sql("""
                        SELECT check_id, node_instance_id, check_type, result
                        FROM check_record
                        WHERE node_instance_id = :nodeInstanceId
                        ORDER BY check_id
                        """)
                .param("nodeInstanceId", nodeInstanceId)
                .query((rs, rowNum) -> new CheckRecordResponse(
                        rs.getLong("check_id"),
                        rs.getLong("node_instance_id"),
                        denormalizeCheckType(rs.getString("check_type")),
                        rs.getString("result"),
                        null))
                .list();
    }

    public List<ReworkRecordResponse> getReworks(String status, Long orderId, BootstrapIdentity identity) {
        accessControlService.requireCheckRecordRead(identity);
        String normalizedStatus = status == null || status.isBlank() ? null : status.trim().toUpperCase();
        String statusClause = normalizedStatus == null ? "" : " AND r.status = :status";
        String orderClause = orderId == null ? "" : " AND r.order_id = :orderId";
        String workerClause = identity.role() == com.yuri.aiorder.common.UserRole.WORKER
                ? " AND (target_node.assigned_user_id = :workerUserId OR from_node.assigned_user_id = :workerUserId)"
                : "";
        JdbcClient.StatementSpec spec = jdbcClient.sql("""
                        SELECT
                            r.rework_id,
                            r.order_id,
                            o.order_no,
                            r.source_check_id,
                            r.from_node_instance_id,
                            from_node.process_name AS from_process_name,
                            r.target_node_instance_id,
                            target_node.process_name AS target_process_name,
                            target_node.node_status AS target_node_status,
                            target_node.assigned_user_id,
                            r.reason_detail,
                            r.status,
                            r.created_at
                        FROM rework_record r
                        JOIN orders o ON o.order_id = r.order_id
                        LEFT JOIN order_process_node from_node
                          ON from_node.node_instance_id = r.from_node_instance_id
                        LEFT JOIN order_process_node target_node
                          ON target_node.node_instance_id = r.target_node_instance_id
                        WHERE 1 = 1
                        %s
                        %s
                        %s
                        ORDER BY r.created_at DESC, r.rework_id DESC
                        LIMIT 100
                        """.formatted(statusClause, orderClause, workerClause));
        if (normalizedStatus != null) {
            spec = spec.param("status", normalizedStatus);
        }
        if (orderId != null) {
            spec = spec.param("orderId", orderId);
        }
        if (identity.role() == com.yuri.aiorder.common.UserRole.WORKER) {
            if (identity.userId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "worker user id is required");
            }
            spec = spec.param("workerUserId", identity.userId());
        }
        return spec.query((rs, rowNum) -> new ReworkRecordResponse(
                        rs.getLong("rework_id"),
                        rs.getLong("order_id"),
                        rs.getString("order_no"),
                        rs.getLong("source_check_id"),
                        rs.getObject("from_node_instance_id", Long.class),
                        rs.getString("from_process_name"),
                        rs.getObject("target_node_instance_id", Long.class),
                        rs.getString("target_process_name"),
                        rs.getString("target_node_status"),
                        rs.getObject("assigned_user_id", Long.class),
                        rs.getString("reason_detail"),
                        rs.getString("status"),
                        rs.getObject("created_at", LocalDateTime.class)))
                .list();
    }

    @Transactional
    public WorkLogResponse startWorkLog(WorkLogStartRequest request, BootstrapIdentity identity) {
        if (request.nodeInstanceId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "node_instance_id is required");
        }
        NodeRow node = lockNode(request.nodeInstanceId());
        requireWorkerAssignment(node, identity);
        if (!"IN_PROGRESS".equals(node.nodeStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "work log can start only for in-progress node");
        }
        Long existing = jdbcClient.sql("""
                        SELECT work_log_id
                        FROM work_log
                        WHERE node_instance_id = :nodeInstanceId
                          AND worker_user_id = :workerUserId
                          AND status IN ('IN_PROGRESS', 'PAUSED')
                        ORDER BY work_log_id DESC
                        LIMIT 1
                        """)
                .param("nodeInstanceId", node.nodeInstanceId())
                .param("workerUserId", identity.userId())
                .query(Long.class)
                .optional()
                .orElse(null);
        if (existing != null) {
            return loadWorkLog(existing, true);
        }
        jdbcClient.sql("""
                        INSERT INTO work_log
                            (order_id, node_instance_id, worker_user_id, started_at, status)
                        VALUES
                            (:orderId, :nodeInstanceId, :workerUserId, CURRENT_TIMESTAMP(3), 'IN_PROGRESS')
                        """)
                .param("orderId", node.orderId())
                .param("nodeInstanceId", node.nodeInstanceId())
                .param("workerUserId", identity.userId())
                .update();
        return loadWorkLog(lastInsertId(), true);
    }

    @Transactional
    public WorkLogResponse pauseWorkLog(long workLogId, BootstrapIdentity identity) {
        WorkLogRow workLog = lockWorkLog(workLogId);
        requireWorkLogOwner(workLog, identity);
        if ("IN_PROGRESS".equals(workLog.status())) {
            boolean hasOpenPause = hasOpenPause(workLogId);
            if (!hasOpenPause) {
                jdbcClient.sql("""
                                INSERT INTO work_log_pause_segment (work_log_id, paused_at)
                                VALUES (:workLogId, CURRENT_TIMESTAMP(3))
                                """)
                        .param("workLogId", workLogId)
                        .update();
            }
            jdbcClient.sql("UPDATE work_log SET status = 'PAUSED' WHERE work_log_id = :workLogId")
                    .param("workLogId", workLogId)
                    .update();
        }
        return loadWorkLog(workLogId, true);
    }

    @Transactional
    public WorkLogResponse resumeWorkLog(long workLogId, BootstrapIdentity identity) {
        WorkLogRow workLog = lockWorkLog(workLogId);
        requireWorkLogOwner(workLog, identity);
        if ("PAUSED".equals(workLog.status())) {
            closeOpenPause(workLogId);
            jdbcClient.sql("UPDATE work_log SET status = 'IN_PROGRESS' WHERE work_log_id = :workLogId")
                    .param("workLogId", workLogId)
                    .update();
        }
        return loadWorkLog(workLogId, true);
    }

    @Transactional
    public WorkLogResponse finishWorkLog(long workLogId, BootstrapIdentity identity) {
        WorkLogRow workLog = lockWorkLog(workLogId);
        requireWorkLogOwner(workLog, identity);
        if ("COMPLETED".equals(workLog.status())) {
            return loadWorkLog(workLogId, true);
        }
        if ("PAUSED".equals(workLog.status())) {
            closeOpenPause(workLogId);
        }
        jdbcClient.sql("""
                        UPDATE work_log
                        SET finished_at = CURRENT_TIMESTAMP(3),
                            effective_duration_seconds = GREATEST(
                                TIMESTAMPDIFF(SECOND, started_at, CURRENT_TIMESTAMP(3)) - pause_duration_seconds,
                                0
                            ),
                            status = 'COMPLETED'
                        WHERE work_log_id = :workLogId
                        """)
                .param("workLogId", workLogId)
                .update();
        return loadWorkLog(workLogId, true);
    }

    public PerformanceStatsResponse getPerformance(Long requestedUserId, BootstrapIdentity identity) {
        Long targetUserId = accessControlService.resolvePerformanceTargetUserId(identity, requestedUserId);
        long completedCount = countLong("""
                        SELECT COUNT(*)
                        FROM work_log
                        WHERE worker_user_id = :userId
                          AND status = 'COMPLETED'
                        """, targetUserId);
        long effectiveSeconds = countLong("""
                        SELECT COALESCE(SUM(effective_duration_seconds), 0)
                        FROM work_log
                        WHERE worker_user_id = :userId
                          AND status = 'COMPLETED'
                        """, targetUserId);
        long reworkCount = countLong("""
                        SELECT COUNT(*)
                        FROM rework_record r
                        JOIN order_process_node n ON n.node_instance_id = r.target_node_instance_id
                        WHERE n.assigned_user_id = :userId
                        """, targetUserId);
        long outCheckTotal = countLong("""
                        SELECT COUNT(*)
                        FROM check_record c
                        JOIN order_process_node n ON n.node_instance_id = c.node_instance_id
                        WHERE n.assigned_user_id = :userId
                          AND c.check_type = 'OUT'
                        """, targetUserId);
        long outCheckPass = countLong("""
                        SELECT COUNT(*)
                        FROM check_record c
                        JOIN order_process_node n ON n.node_instance_id = c.node_instance_id
                        WHERE n.assigned_user_id = :userId
                          AND c.check_type = 'OUT'
                          AND c.result = 'PASS'
                        """, targetUserId);
        long onTimeCount = countLong("""
                        SELECT COUNT(*)
                        FROM work_log w
                        JOIN order_process_node n ON n.node_instance_id = w.node_instance_id
                        WHERE w.worker_user_id = :userId
                          AND w.status = 'COMPLETED'
                          AND n.standard_duration IS NOT NULL
                          AND w.effective_duration_seconds <= n.standard_duration
                        """, targetUserId);
        long standardSeconds = countLong("""
                        SELECT COALESCE(SUM(n.standard_duration), 0)
                        FROM work_log w
                        JOIN order_process_node n ON n.node_instance_id = w.node_instance_id
                        WHERE w.worker_user_id = :userId
                          AND w.status = 'COMPLETED'
                          AND n.standard_duration IS NOT NULL
                        """, targetUserId);
        return new PerformanceStatsResponse(
                targetUserId,
                completedCount,
                effectiveSeconds / 60,
                reworkCount,
                percent(onTimeCount, completedCount),
                percent(outCheckPass, outCheckTotal),
                effectiveSeconds == 0 ? 0 : Math.toIntExact(Math.round((standardSeconds * 100.0) / effectiveSeconds)));
    }

    private Long createRework(NodeRow node, long checkId, CheckRecordRequest request) {
        if (request.reworkToNodeId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "rework_to_node_id is required when out-check fails");
        }
        NodeRow target = lockNode(request.reworkToNodeId());
        if (target.orderId() != node.orderId()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "rework target must belong to same order");
        }
        jdbcClient.sql("""
                        INSERT INTO rework_record
                            (order_id, source_check_id, from_node_instance_id, target_node_instance_id,
                             reason_detail, status)
                        VALUES
                            (:orderId, :sourceCheckId, :fromNodeInstanceId, :targetNodeInstanceId,
                             :reasonDetail, 'PENDING')
                        """)
                .param("orderId", node.orderId())
                .param("sourceCheckId", checkId)
                .param("fromNodeInstanceId", node.nodeInstanceId())
                .param("targetNodeInstanceId", target.nodeInstanceId())
                .param("reasonDetail", request.remark())
                .update();
        long reworkId = lastInsertId();
        jdbcClient.sql("""
                        UPDATE order_process_node
                        SET node_status = 'READY',
                            started_at = NULL,
                            completed_at = NULL
                        WHERE node_instance_id = :nodeInstanceId
                        """)
                .param("nodeInstanceId", target.nodeInstanceId())
                .update();
        jdbcClient.sql("""
                        UPDATE order_process_instance
                        SET instance_status = 'ACTIVE'
                        WHERE instance_id = :instanceId
                        """)
                .param("instanceId", target.instanceId())
                .update();
        return reworkId;
    }

    private void closeOpenPause(long workLogId) {
        jdbcClient.sql("""
                        UPDATE work_log w
                        JOIN work_log_pause_segment p ON p.work_log_id = w.work_log_id
                        SET w.pause_duration_seconds = w.pause_duration_seconds
                                + GREATEST(TIMESTAMPDIFF(SECOND, p.paused_at, CURRENT_TIMESTAMP(3)), 0),
                            p.resumed_at = CURRENT_TIMESTAMP(3)
                        WHERE w.work_log_id = :workLogId
                          AND p.resumed_at IS NULL
                        """)
                .param("workLogId", workLogId)
                .update();
    }

    private boolean hasOpenPause(long workLogId) {
        return jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM work_log_pause_segment
                        WHERE work_log_id = :workLogId
                          AND resumed_at IS NULL
                        """)
                .param("workLogId", workLogId)
                .query(Long.class)
                .single() > 0;
    }

    private WorkLogResponse loadWorkLog(long workLogId, boolean requireExisting) {
        try {
            return jdbcClient.sql("""
                            SELECT work_log_id, node_instance_id, worker_user_id, status,
                                   pause_duration_seconds, effective_duration_seconds
                            FROM work_log
                            WHERE work_log_id = :workLogId
                            """)
                    .param("workLogId", workLogId)
                    .query((rs, rowNum) -> new WorkLogResponse(
                            rs.getLong("work_log_id"),
                            rs.getLong("node_instance_id"),
                            rs.getLong("worker_user_id"),
                            rs.getString("status"),
                            rs.getInt("pause_duration_seconds"),
                            rs.getObject("effective_duration_seconds", Integer.class)))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            if (requireExisting) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "work log not found", ex);
            }
            return null;
        }
    }

    private NodeRow lockNode(long nodeInstanceId) {
        try {
            return jdbcClient.sql("""
                            SELECT
                                n.node_instance_id,
                                n.instance_id,
                                i.order_id,
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
                            rs.getObject("assigned_user_id", Long.class),
                            rs.getString("node_status")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "process node not found", ex);
        }
    }

    private WorkLogRow lockWorkLog(long workLogId) {
        try {
            return jdbcClient.sql("""
                            SELECT work_log_id, worker_user_id, status, started_at
                            FROM work_log
                            WHERE work_log_id = :workLogId
                            FOR UPDATE
                            """)
                    .param("workLogId", workLogId)
                    .query((rs, rowNum) -> new WorkLogRow(
                            rs.getLong("work_log_id"),
                            rs.getLong("worker_user_id"),
                            rs.getString("status"),
                            rs.getObject("started_at", LocalDateTime.class)))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "work log not found", ex);
        }
    }

    private void requireWorkerAssignment(NodeRow node, BootstrapIdentity identity) {
        accessControlService.requireAssignedWorkerOrAdmin(identity, node.assignedUserId(), "worker cannot operate this node");
    }

    private void requireWorkLogOwner(WorkLogRow workLog, BootstrapIdentity identity) {
        accessControlService.requireAssignedWorkerOrAdmin(
                identity, workLog.workerUserId(), "worker cannot operate this work log");
    }

    private String normalizeCheckType(int checkType) {
        return switch (checkType) {
            case 1 -> "IN";
            case 2 -> "OUT";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unsupported check_type");
        };
    }

    private Integer denormalizeCheckType(String checkType) {
        if ("IN".equals(checkType)) {
            return 1;
        }
        if ("OUT".equals(checkType)) {
            return 2;
        }
        return null;
    }

    private long lastInsertId() {
        return jdbcClient.sql("SELECT LAST_INSERT_ID()")
                .query(Long.class)
                .single();
    }

    private long countLong(String sql, Long userId) {
        return jdbcClient.sql(sql)
                .param("userId", userId)
                .query(Long.class)
                .single();
    }

    private int percent(long part, long total) {
        if (total == 0) {
            return 0;
        }
        return Math.toIntExact(Math.round((part * 100.0) / total));
    }

    private record NodeRow(
            long nodeInstanceId,
            long instanceId,
            long orderId,
            Long assignedUserId,
            String nodeStatus) {
    }

    private record WorkLogRow(
            long workLogId,
            long workerUserId,
            String status,
            LocalDateTime startedAt) {
    }
}
