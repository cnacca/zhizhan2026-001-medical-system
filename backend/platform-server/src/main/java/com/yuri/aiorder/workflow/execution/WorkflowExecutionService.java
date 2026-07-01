package com.yuri.aiorder.workflow.execution;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.auth.AccessControlService;
import com.yuri.aiorder.notification.NotificationPushService;
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

    private static final List<ReworkDictionaryOption> REWORK_REASON_CATEGORIES = List.of(
            new ReworkDictionaryOption("FIT_ISSUE", "适配问题"),
            new ReworkDictionaryOption("MATERIAL_ISSUE", "材料问题"),
            new ReworkDictionaryOption("DESIGN_ISSUE", "设计问题"),
            new ReworkDictionaryOption("OTHER", "其他"));
    private static final List<ReworkDictionaryOption> REWORK_RESPONSIBILITY_TYPES = List.of(
            new ReworkDictionaryOption("WORKER", "生产"),
            new ReworkDictionaryOption("DOCTOR", "医生"),
            new ReworkDictionaryOption("CS", "客服"),
            new ReworkDictionaryOption("SYSTEM", "系统"));

    private final JdbcClient jdbcClient;
    private final AccessControlService accessControlService;
    private final ObjectMapper objectMapper;
    private final NotificationPushService notificationPushService;

    public WorkflowExecutionService(
            JdbcClient jdbcClient,
            AccessControlService accessControlService,
            ObjectMapper objectMapper,
            NotificationPushService notificationPushService) {
        this.jdbcClient = jdbcClient;
        this.accessControlService = accessControlService;
        this.objectMapper = objectMapper;
        this.notificationPushService = notificationPushService;
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
                            r.reason_category,
                            r.reason_detail,
                            r.responsibility_type,
                            r.close_note,
                            r.closed_by_user_id,
                            r.closed_at,
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
                        rs.getString("reason_category"),
                        rs.getString("reason_detail"),
                        rs.getString("responsibility_type"),
                        rs.getString("close_note"),
                        rs.getObject("closed_by_user_id", Long.class),
                        rs.getObject("closed_at", LocalDateTime.class),
                        rs.getString("status"),
                        rs.getObject("created_at", LocalDateTime.class)))
                .list();
    }

    public ReworkDictionariesResponse getReworkDictionaries(BootstrapIdentity identity) {
        accessControlService.requireCheckRecordRead(identity);
        return new ReworkDictionariesResponse(REWORK_REASON_CATEGORIES, REWORK_RESPONSIBILITY_TYPES);
    }

    @Transactional
    public ReworkRecordResponse closeRework(long reworkId, ReworkCloseRequest request, BootstrapIdentity identity) {
        ReworkRow rework = lockRework(reworkId);
        NodeRow targetNode = lockNode(rework.targetNodeInstanceId());
        requireWorkerAssignment(targetNode, identity);
        if ("DONE".equals(rework.status())) {
            return loadRework(reworkId);
        }
        boolean hasReworkOutPass = jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM check_record
                        WHERE node_instance_id = :targetNodeInstanceId
                          AND check_type = 'OUT'
                          AND result = 'PASS'
                          AND check_id > :sourceCheckId
                        """)
                .param("targetNodeInstanceId", rework.targetNodeInstanceId())
                .param("sourceCheckId", rework.sourceCheckId())
                .query(Long.class)
                .single() > 0;
        if (!hasReworkOutPass) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "rework target OUT/PASS check is required before closing rework");
        }
        String reasonCategory = normalizeDictionaryValue(
                request.reasonCategory(), REWORK_REASON_CATEGORIES, "unsupported rework reason category");
        String responsibilityType = normalizeDictionaryValue(
                request.responsibilityType(), REWORK_RESPONSIBILITY_TYPES, "unsupported rework responsibility type");
        jdbcClient.sql("""
                        UPDATE rework_record
                        SET reason_category = :reasonCategory,
                            responsibility_type = :responsibilityType,
                            close_note = :closeNote,
                            closed_by_user_id = :closedByUserId,
                            closed_at = CURRENT_TIMESTAMP(3),
                            status = 'DONE'
                        WHERE rework_id = :reworkId
                        """)
                .param("reasonCategory", reasonCategory)
                .param("responsibilityType", responsibilityType)
                .param("closeNote", blankToNull(request.closeNote()))
                .param("closedByUserId", identity.userId())
                .param("reworkId", reworkId)
                .update();
        ReworkRecordResponse closed = loadRework(reworkId);
        ReworkNotificationRow notification = loadReworkNotification(reworkId);
        emitReworkNotification(
                notification,
                "REWORK_CLOSED",
                "CS",
                notification.csUserId(),
                "返工已关闭");
        return closed;
    }

    @Transactional
    public FinalInspectionReportResponse createFinalInspectionReport(
            FinalInspectionReportRequest request, BootstrapIdentity identity) {
        if (request.orderId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "order_id is required");
        }
        NodeRow finalNode = lockFinalNode(request.orderId());
        requireWorkerAssignment(finalNode, identity);
        FinalCheckRow finalCheck = findLatestFinalOutPass(finalNode.nodeInstanceId());
        FinalInspectionReportResponse existing = findFinalInspectionReport(request.orderId());
        if (existing != null) {
            return existing;
        }
        String summary = request.summary() == null || request.summary().isBlank()
                ? "终检通过"
                : request.summary().trim();
        String reportNo = "FIR-" + request.orderId() + "-" + finalCheck.checkId();
        jdbcClient.sql("""
                        INSERT INTO final_inspection_report
                            (order_id, report_no, final_node_instance_id, final_check_id,
                             conclusion, summary, inspector_user_id, status)
                        VALUES
                            (:orderId, :reportNo, :finalNodeInstanceId, :finalCheckId,
                             'PASS', :summary, :inspectorUserId, 'ISSUED')
                        """)
                .param("orderId", request.orderId())
                .param("reportNo", reportNo)
                .param("finalNodeInstanceId", finalNode.nodeInstanceId())
                .param("finalCheckId", finalCheck.checkId())
                .param("summary", summary)
                .param("inspectorUserId", identity.userId())
                .update();
        return loadFinalInspectionReportById(lastInsertId());
    }

    public FinalInspectionReportResponse getFinalInspectionReport(long orderId, BootstrapIdentity identity) {
        accessControlService.requireCheckRecordRead(identity);
        FinalInspectionReportResponse report = findFinalInspectionReport(orderId);
        if (report == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "final inspection report not found");
        }
        if (identity.role() == com.yuri.aiorder.common.UserRole.WORKER) {
            NodeRow finalNode = loadFinalNode(orderId);
            requireWorkerAssignment(finalNode, identity);
        }
        return report;
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
        emitReworkNotification(
                loadReworkNotification(reworkId),
                "REWORK_CREATED",
                "WORKER",
                target.assignedUserId(),
                "返工待处理");
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

    private ReworkNotificationRow loadReworkNotification(long reworkId) {
        return jdbcClient.sql("""
                        SELECT
                            r.rework_id,
                            r.order_id,
                            o.order_no,
                            o.cs_user_id,
                            r.target_node_instance_id
                        FROM rework_record r
                        JOIN orders o ON o.order_id = r.order_id
                        WHERE r.rework_id = :reworkId
                        """)
                .param("reworkId", reworkId)
                .query((rs, rowNum) -> new ReworkNotificationRow(
                        rs.getLong("rework_id"),
                        rs.getLong("order_id"),
                        rs.getString("order_no"),
                        rs.getObject("cs_user_id", Long.class),
                        rs.getLong("target_node_instance_id")))
                .single();
    }

    private void emitReworkNotification(
            ReworkNotificationRow rework, String eventType, String audienceRole, Long userId, String message) {
        String payload = reworkPayload(rework, eventType, message);
        jdbcClient.sql("""
                        INSERT INTO notification_event
                            (order_id, event_type, audience_role, payload, delivery_status)
                        VALUES
                            (:orderId, :eventType, :audienceRole, CAST(:payload AS JSON), 'PENDING')
                        """)
                .param("orderId", rework.orderId())
                .param("eventType", eventType)
                .param("audienceRole", audienceRole)
                .param("payload", payload)
                .update();
        long eventId = lastInsertId();
        if (userId == null) {
            return;
        }
        jdbcClient.sql("""
                        INSERT IGNORE INTO user_notification (event_id, user_id)
                        VALUES (:eventId, :userId)
                        """)
                .param("eventId", eventId)
                .param("userId", userId)
                .update();
        notificationPushService.pushToUser(userId, eventId, payload);
    }

    private String reworkPayload(ReworkNotificationRow rework, String eventType, String message) {
        try {
            return objectMapper.writeValueAsString(new ReworkNotificationPayload(
                    eventType,
                    rework.orderId(),
                    rework.orderNo(),
                    message,
                    rework.reworkId(),
                    rework.targetNodeInstanceId()));
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "failed to build rework notification payload", ex);
        }
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

    private ReworkRow lockRework(long reworkId) {
        try {
            return jdbcClient.sql("""
                            SELECT rework_id, source_check_id, target_node_instance_id, status
                            FROM rework_record
                            WHERE rework_id = :reworkId
                            FOR UPDATE
                            """)
                    .param("reworkId", reworkId)
                    .query((rs, rowNum) -> new ReworkRow(
                            rs.getLong("rework_id"),
                            rs.getLong("source_check_id"),
                            rs.getLong("target_node_instance_id"),
                            rs.getString("status")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "rework record not found", ex);
        }
    }

    private ReworkRecordResponse loadRework(long reworkId) {
        try {
            return jdbcClient.sql("""
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
                                r.reason_category,
                                r.reason_detail,
                                r.responsibility_type,
                                r.close_note,
                                r.closed_by_user_id,
                                r.closed_at,
                                r.status,
                                r.created_at
                            FROM rework_record r
                            JOIN orders o ON o.order_id = r.order_id
                            LEFT JOIN order_process_node from_node
                              ON from_node.node_instance_id = r.from_node_instance_id
                            LEFT JOIN order_process_node target_node
                              ON target_node.node_instance_id = r.target_node_instance_id
                            WHERE r.rework_id = :reworkId
                            """)
                    .param("reworkId", reworkId)
                    .query((rs, rowNum) -> new ReworkRecordResponse(
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
                            rs.getString("reason_category"),
                            rs.getString("reason_detail"),
                            rs.getString("responsibility_type"),
                            rs.getString("close_note"),
                            rs.getObject("closed_by_user_id", Long.class),
                            rs.getObject("closed_at", LocalDateTime.class),
                            rs.getString("status"),
                            rs.getObject("created_at", LocalDateTime.class)))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "rework record not found", ex);
        }
    }

    private NodeRow lockFinalNode(long orderId) {
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
                            WHERE i.order_id = :orderId
                              AND n.step_order = (
                                  SELECT MAX(last_node.step_order)
                                  FROM order_process_node last_node
                                  JOIN order_process_instance last_instance
                                    ON last_instance.instance_id = last_node.instance_id
                                  WHERE last_instance.order_id = :orderId
                              )
                            ORDER BY n.node_instance_id DESC
                            LIMIT 1
                            FOR UPDATE
                            """)
                    .param("orderId", orderId)
                    .query((rs, rowNum) -> new NodeRow(
                            rs.getLong("node_instance_id"),
                            rs.getLong("instance_id"),
                            rs.getLong("order_id"),
                            rs.getObject("assigned_user_id", Long.class),
                            rs.getString("node_status")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "final process node not found", ex);
        }
    }

    private NodeRow loadFinalNode(long orderId) {
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
                            WHERE i.order_id = :orderId
                              AND n.step_order = (
                                  SELECT MAX(last_node.step_order)
                                  FROM order_process_node last_node
                                  JOIN order_process_instance last_instance
                                    ON last_instance.instance_id = last_node.instance_id
                                  WHERE last_instance.order_id = :orderId
                              )
                            ORDER BY n.node_instance_id DESC
                            LIMIT 1
                            """)
                    .param("orderId", orderId)
                    .query((rs, rowNum) -> new NodeRow(
                            rs.getLong("node_instance_id"),
                            rs.getLong("instance_id"),
                            rs.getLong("order_id"),
                            rs.getObject("assigned_user_id", Long.class),
                            rs.getString("node_status")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "final process node not found", ex);
        }
    }

    private FinalCheckRow findLatestFinalOutPass(long finalNodeInstanceId) {
        return jdbcClient.sql("""
                        SELECT check_id
                        FROM check_record
                        WHERE node_instance_id = :nodeInstanceId
                          AND check_type = 'OUT'
                          AND result = 'PASS'
                        ORDER BY check_id DESC
                        LIMIT 1
                        """)
                .param("nodeInstanceId", finalNodeInstanceId)
                .query((rs, rowNum) -> new FinalCheckRow(rs.getLong("check_id")))
                .optional()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT, "final OUT/PASS check is required before final inspection report"));
    }

    private FinalInspectionReportResponse findFinalInspectionReport(long orderId) {
        return jdbcClient.sql("""
                        SELECT report_id, order_id, report_no, final_node_instance_id, final_check_id,
                               conclusion, summary, inspector_user_id, status, created_at
                        FROM final_inspection_report
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .query((rs, rowNum) -> new FinalInspectionReportResponse(
                        rs.getLong("report_id"),
                        rs.getLong("order_id"),
                        rs.getString("report_no"),
                        rs.getLong("final_node_instance_id"),
                        rs.getLong("final_check_id"),
                        rs.getString("conclusion"),
                        rs.getString("summary"),
                        rs.getObject("inspector_user_id", Long.class),
                        rs.getString("status"),
                        rs.getObject("created_at", LocalDateTime.class)))
                .optional()
                .orElse(null);
    }

    private FinalInspectionReportResponse loadFinalInspectionReportById(long reportId) {
        return jdbcClient.sql("""
                        SELECT report_id, order_id, report_no, final_node_instance_id, final_check_id,
                               conclusion, summary, inspector_user_id, status, created_at
                        FROM final_inspection_report
                        WHERE report_id = :reportId
                        """)
                .param("reportId", reportId)
                .query((rs, rowNum) -> new FinalInspectionReportResponse(
                        rs.getLong("report_id"),
                        rs.getLong("order_id"),
                        rs.getString("report_no"),
                        rs.getLong("final_node_instance_id"),
                        rs.getLong("final_check_id"),
                        rs.getString("conclusion"),
                        rs.getString("summary"),
                        rs.getObject("inspector_user_id", Long.class),
                        rs.getString("status"),
                        rs.getObject("created_at", LocalDateTime.class)))
                .single();
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

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String normalizeDictionaryValue(
            String value, List<ReworkDictionaryOption> options, String unsupportedMessage) {
        String normalized = blankToNull(value);
        if (normalized == null) {
            return null;
        }
        String upper = normalized.toUpperCase();
        boolean supported = options.stream().anyMatch((option) -> option.code().equals(upper));
        if (!supported) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, unsupportedMessage);
        }
        return upper;
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

    private record ReworkRow(
            long reworkId,
            long sourceCheckId,
            long targetNodeInstanceId,
            String status) {
    }

    private record ReworkNotificationRow(
            long reworkId,
            long orderId,
            String orderNo,
            Long csUserId,
            long targetNodeInstanceId) {
    }

    private record ReworkNotificationPayload(
            String event,
            long orderId,
            String orderNo,
            String message,
            long reworkId,
            long targetNodeInstanceId) {
    }

    private record FinalCheckRow(long checkId) {
    }
}
