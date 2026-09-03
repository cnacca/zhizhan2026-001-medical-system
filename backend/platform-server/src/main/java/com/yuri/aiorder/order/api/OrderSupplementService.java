package com.yuri.aiorder.order.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.notification.NotificationPushService;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderSupplementService {

    private static final Set<String> TERMINAL_STATUSES = Set.of("SHIPPED", "COMPLETED");
    private static final Set<String> PRE_CS_REVIEW_STATUSES = Set.of("PENDING_CS_REVIEW", "CS_REJECTED");
    private static final Set<String> PRODUCTION_STARTED_STATUSES = Set.of(
            "PROCESS_INSTANCE_CREATED", "ASSIGNED", "IN_DESIGN", "IN_PRODUCTION", "IN_QC", "QC_PASSED");

    private final JdbcClient jdbcClient;
    private final OrderProjectionQueryService queryService;
    private final ObjectMapper objectMapper;
    private final NotificationPushService notificationPushService;

    public OrderSupplementService(
            JdbcClient jdbcClient,
            OrderProjectionQueryService queryService,
            ObjectMapper objectMapper,
            NotificationPushService notificationPushService) {
        this.jdbcClient = jdbcClient;
        this.queryService = queryService;
        this.objectMapper = objectMapper;
        this.notificationPushService = notificationPushService;
    }

    @Transactional
    public List<OrderSupplementResponse> create(
            long orderId, OrderSupplementCreateRequest request, BootstrapIdentity identity) {
        queryService.getDoctorOrder(orderId, identity);
        OrderRow order = lockOrder(orderId);
        if ("DRAFT".equals(order.internalStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "draft records must be updated in the order editor");
        }
        if (TERMINAL_STATUSES.contains(order.internalStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "completed or shipped orders cannot accept supplemental files");
        }
        String materialType = normalizeRequired(request.materialType(), "material_type");
        String scope = normalizeRequired(request.attachmentScope(), "attachment_scope");
        if (!Set.of("SHARED", "PRODUCT").contains(scope)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "attachment_scope must be SHARED or PRODUCT");
        }
        Long productOrderId = "PRODUCT".equals(scope)
                ? requireProductOrder(order, request.productOrderId())
                : null;
        String note = blankToNull(request.note());
        String displayNote = note == null ? "医生补充资料" : note;
        String approvalStatus = PRE_CS_REVIEW_STATUSES.contains(order.internalStatus())
                ? "EFFECTIVE"
                : "PENDING_CS_APPROVAL";

        int nextVersion = jdbcClient.sql("""
                        SELECT version_no
                        FROM order_supplement_file
                        WHERE order_id = :orderId
                        ORDER BY version_no DESC
                        LIMIT 1
                        FOR UPDATE
                        """)
                .param("orderId", orderId)
                .query(Integer.class)
                .optional()
                .orElse(0) + 1;
        int version = nextVersion;
        for (Long fileId : new LinkedHashSet<>(request.fileIds())) {
            if (fileId == null || fileId <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "file_ids contains an invalid file id");
            }
            requireDoctorUploadedFile(orderId, fileId, identity.userId());
            jdbcClient.sql("""
                            INSERT INTO order_supplement_file
                                (order_id, file_id, material_type, attachment_scope, product_order_id,
                                 note, display_note, version_no, approval_status, uploaded_by_user_id)
                            VALUES
                                (:orderId, :fileId, :materialType, :attachmentScope, :productOrderId,
                                 :note, :displayNote, :versionNo, :approvalStatus, :uploadedByUserId)
                            """)
                    .param("orderId", orderId)
                    .param("fileId", fileId)
                    .param("materialType", materialType)
                    .param("attachmentScope", scope)
                    .param("productOrderId", productOrderId, java.sql.Types.BIGINT)
                    .param("note", note, java.sql.Types.VARCHAR)
                    .param("displayNote", displayNote)
                    .param("versionNo", version++)
                    .param("approvalStatus", approvalStatus)
                    .param("uploadedByUserId", identity.userId())
                    .update();
        }
        audit(orderId, "DOCTOR_ADD_SUPPLEMENT", null, Map.of(
                "file_ids", request.fileIds(),
                "attachment_scope", scope,
                "approval_status", approvalStatus), identity.userId(), note);
        return list(orderId, identity);
    }

    public List<OrderSupplementResponse> list(long orderId, BootstrapIdentity identity) {
        if (identity.isDoctor()) {
            queryService.getDoctorOrder(orderId, identity);
        } else {
            queryService.getInternalOrder(orderId, identity);
        }
        return jdbcClient.sql("""
                        SELECT supplement.supplement_id, supplement.order_id, supplement.file_id,
                               file.original_filename, file.content_type, file.file_size,
                               supplement.material_type, supplement.attachment_scope,
                               supplement.product_order_id, supplement.note, supplement.display_note,
                               supplement.version_no, supplement.approval_status,
                               supplement.uploaded_by_user_id, supplement.approved_by_user_id,
                               supplement.approved_at, supplement.created_at
                        FROM order_supplement_file supplement
                        JOIN file_resource file ON file.file_id = supplement.file_id
                        WHERE supplement.order_id = :orderId
                        ORDER BY supplement.version_no DESC
                        """)
                .param("orderId", orderId)
                .query((rs, rowNum) -> new OrderSupplementResponse(
                        rs.getLong("supplement_id"),
                        rs.getLong("order_id"),
                        rs.getLong("file_id"),
                        rs.getString("original_filename"),
                        rs.getString("content_type"),
                        rs.getObject("file_size", Long.class),
                        rs.getString("material_type"),
                        rs.getString("attachment_scope"),
                        rs.getObject("product_order_id", Long.class),
                        rs.getString("note"),
                        rs.getString("display_note"),
                        rs.getInt("version_no"),
                        rs.getString("approval_status"),
                        rs.getLong("uploaded_by_user_id"),
                        rs.getObject("approved_by_user_id", Long.class),
                        rs.getObject("approved_at", LocalDateTime.class),
                        rs.getObject("created_at", LocalDateTime.class)))
                .list();
    }

    @Transactional
    public OrderSupplementResponse review(
            long orderId,
            long supplementId,
            OrderSupplementReviewRequest request,
            BootstrapIdentity identity) {
        queryService.getInternalOrder(orderId, identity);
        String action = normalizeRequired(request.action(), "action");
        if (!Set.of("APPROVE", "REJECT").contains(action)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "action must be APPROVE or REJECT");
        }
        if ("REJECT".equals(action) && blankToNull(request.reason()) == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "reason is required when rejecting supplemental files");
        }
        SupplementRow before = lockSupplement(orderId, supplementId);
        if (!"PENDING_CS_APPROVAL".equals(before.approvalStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "supplemental file is not pending CS approval");
        }
        String afterStatus = "APPROVE".equals(action) ? "APPROVED" : "REJECTED";
        jdbcClient.sql("""
                        UPDATE order_supplement_file
                        SET approval_status = :approvalStatus,
                            approved_by_user_id = :actorUserId,
                            approved_at = CURRENT_TIMESTAMP(3)
                        WHERE supplement_id = :supplementId
                        """)
                .param("approvalStatus", afterStatus)
                .param("actorUserId", identity.userId())
                .param("supplementId", supplementId)
                .update();
        audit(orderId, "APPROVE".equals(action) ? "CS_APPROVE_SUPPLEMENT" : "CS_REJECT_SUPPLEMENT",
                Map.of("approval_status", before.approvalStatus()),
                Map.of("approval_status", afterStatus), identity.userId(), blankToNull(request.reason()));
        if ("APPROVE".equals(action) && PRODUCTION_STARTED_STATUSES.contains(lockOrder(orderId).internalStatus())) {
            notifyProduction(orderId, before.originalFilename());
        }
        return list(orderId, identity).stream()
                .filter(item -> item.supplementId() == supplementId)
                .findFirst()
                .orElseThrow();
    }

    private Long requireProductOrder(OrderRow source, Long productOrderId) {
        if (productOrderId == null || productOrderId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "product_order_id is required for PRODUCT scope");
        }
        long count = jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM orders target
                        WHERE target.order_id = :productOrderId
                          AND target.doctor_user_id = :doctorUserId
                          AND (
                              target.order_id = :sourceOrderId
                              OR (:groupId IS NOT NULL AND target.group_id = :groupId)
                          )
                        """)
                .param("productOrderId", productOrderId)
                .param("doctorUserId", source.doctorUserId())
                .param("sourceOrderId", source.orderId())
                .param("groupId", source.groupId(), java.sql.Types.BIGINT)
                .query(Long.class)
                .single();
        if (count == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "product_order_id is outside this case group");
        }
        return productOrderId;
    }

    private void requireDoctorUploadedFile(long orderId, long fileId, Long doctorUserId) {
        long count = jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM file_resource
                        WHERE file_id = :fileId
                          AND order_id = :orderId
                          AND owner_user_id = :doctorUserId
                          AND source_type = 'ORDER_ATTACHMENT'
                          AND upload_status = 'COMPLETED'
                          AND status = 'ACTIVE'
                        """)
                .param("fileId", fileId)
                .param("orderId", orderId)
                .param("doctorUserId", doctorUserId)
                .query(Long.class)
                .single();
        if (count == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "file is not a completed doctor upload for this order");
        }
    }

    private OrderRow lockOrder(long orderId) {
        try {
            return jdbcClient.sql("""
                            SELECT order_id, order_no, group_id, doctor_user_id, internal_status
                            FROM orders
                            WHERE order_id = :orderId
                            FOR UPDATE
                            """)
                    .param("orderId", orderId)
                    .query((rs, rowNum) -> new OrderRow(
                            rs.getLong("order_id"),
                            rs.getString("order_no"),
                            rs.getObject("group_id", Long.class),
                            rs.getObject("doctor_user_id", Long.class),
                            rs.getString("internal_status")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found", ex);
        }
    }

    private SupplementRow lockSupplement(long orderId, long supplementId) {
        try {
            return jdbcClient.sql("""
                            SELECT supplement.approval_status, file.original_filename
                            FROM order_supplement_file supplement
                            JOIN file_resource file ON file.file_id = supplement.file_id
                            WHERE supplement.supplement_id = :supplementId
                              AND supplement.order_id = :orderId
                            FOR UPDATE
                            """)
                    .param("supplementId", supplementId)
                    .param("orderId", orderId)
                    .query((rs, rowNum) -> new SupplementRow(
                            rs.getString("approval_status"),
                            rs.getString("original_filename")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "supplemental file not found", ex);
        }
    }

    private void notifyProduction(long orderId, String filename) {
        OrderRow order = lockOrder(orderId);
        Set<Long> recipients = new LinkedHashSet<>(jdbcClient.sql("""
                        SELECT DISTINCT node.assigned_user_id
                        FROM order_process_instance instance
                        JOIN order_process_node node ON node.instance_id = instance.instance_id
                        WHERE instance.order_id = :orderId
                          AND node.assigned_user_id IS NOT NULL
                        """)
                .param("orderId", orderId)
                .query(Long.class)
                .list());
        if (!recipients.isEmpty()) {
            recipients.addAll(jdbcClient.sql("""
                            SELECT DISTINCT lead.user_id
                            FROM system_user lead
                            JOIN system_user_role lead_role ON lead_role.user_id = lead.user_id
                            JOIN system_role role ON role.role_id = lead_role.role_id
                            WHERE lead.status = 'ACTIVE'
                              AND role.role_code = 'PROD_TEAM_LEAD'
                              AND lead.dept_id IN (
                                  SELECT DISTINCT worker.dept_id
                                  FROM system_user worker
                                  WHERE worker.user_id IN (:recipientIds)
                              )
                            """)
                    .param("recipientIds", recipients)
                    .query(Long.class)
                    .list());
        }
        String payload = json(Map.of(
                "event_type", "ORDER_SUPPLEMENT_APPROVED",
                "order_id", orderId,
                "order_no", order.orderNo(),
                "message", "医生补充资料已由客服审核通过：" + filename));
        jdbcClient.sql("""
                        INSERT INTO notification_event
                            (order_id, event_type, audience_role, payload, delivery_status)
                        VALUES
                            (:orderId, 'ORDER_SUPPLEMENT_APPROVED', 'WORKER', CAST(:payload AS JSON), 'PENDING')
                        """)
                .param("orderId", orderId)
                .param("payload", payload)
                .update();
        long eventId = jdbcClient.sql("SELECT LAST_INSERT_ID()").query(Long.class).single();
        for (Long userId : recipients) {
            jdbcClient.sql("INSERT IGNORE INTO user_notification (event_id, user_id) VALUES (:eventId, :userId)")
                    .param("eventId", eventId)
                    .param("userId", userId)
                    .update();
            notificationPushService.pushToUser(userId, eventId, payload);
        }
    }

    private void audit(
            long orderId,
            String action,
            Object before,
            Object after,
            Long actorUserId,
            String reason) {
        jdbcClient.sql("""
                        INSERT INTO order_business_audit
                            (order_id, action_code, before_value, after_value, actor_user_id, reason)
                        VALUES
                            (:orderId, :action, CAST(:beforeValue AS JSON), CAST(:afterValue AS JSON), :actorUserId, :reason)
                        """)
                .param("orderId", orderId)
                .param("action", action)
                .param("beforeValue", before == null ? null : json(before), java.sql.Types.VARCHAR)
                .param("afterValue", after == null ? null : json(after), java.sql.Types.VARCHAR)
                .param("actorUserId", actorUserId)
                .param("reason", reason, java.sql.Types.VARCHAR)
                .update();
    }

    private String json(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "cannot serialize supplement payload", ex);
        }
    }

    private String normalizeRequired(String value, String fieldName) {
        String normalized = blankToNull(value);
        if (normalized == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }
        return normalized.toUpperCase(Locale.ROOT);
    }

    private String blankToNull(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }

    private record OrderRow(
            long orderId, String orderNo, Long groupId, Long doctorUserId, String internalStatus) {
    }

    private record SupplementRow(String approvalStatus, String originalFilename) {
    }
}
