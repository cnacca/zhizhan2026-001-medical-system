package com.yuri.aiorder.collaboration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.AccessControlService;
import com.yuri.aiorder.notification.NotificationPushService;
import com.yuri.aiorder.order.status.InternalOrderStatus;
import com.yuri.aiorder.order.status.OrderStatusService;
import java.util.List;
import java.util.Locale;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CollaborationService {

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;
    private final OrderStatusService orderStatusService;
    private final AccessControlService accessControlService;
    private final NotificationPushService notificationPushService;

    public CollaborationService(
            JdbcClient jdbcClient,
            ObjectMapper objectMapper,
            OrderStatusService orderStatusService,
            AccessControlService accessControlService,
            NotificationPushService notificationPushService) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
        this.orderStatusService = orderStatusService;
        this.accessControlService = accessControlService;
        this.notificationPushService = notificationPushService;
    }

    public List<MessageResponse> listMessages(long orderId, BootstrapIdentity identity) {
        OrderRow order = loadOrder(orderId, identity, "identity cannot access this order");
        if (identity.isDoctor()) {
            identity.requireDoctorScope(order.doctorUserId(), order.clinicId());
            return queryMessages(orderId, "AND visibility IN ('DOCTOR', 'DOCTOR_CS', 'ALL') AND review_status IN ('DIRECT', 'APPROVED')");
        }
        if (identity.role() == UserRole.WORKER) {
            return queryMessages(orderId, "AND visibility IN ('CS_WORKER', 'ALL') AND review_status <> 'REJECTED'");
        }
        return queryMessages(orderId, "");
    }

    @Transactional
    public MessageResponse sendMessage(long orderId, MessageRequest request, BootstrapIdentity identity) {
        if (request.content() == null || request.content().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "content is required");
        }
        OrderRow order = loadOrder(orderId, identity, "identity cannot access this order");
        String reviewStatus;
        String visibility;
        if (identity.role() == UserRole.DOCTOR) {
            identity.requireDoctorScope(order.doctorUserId(), order.clinicId());
            reviewStatus = "DIRECT";
            visibility = "CS_ONLY";
        } else if (identity.role() == UserRole.WORKER) {
            reviewStatus = "PENDING_REVIEW";
            visibility = "ALL";
        } else {
            reviewStatus = "DIRECT";
            visibility = normalizeOrDefault(request.visibleTo(), "DOCTOR_CS");
        }
        jdbcClient.sql("""
                        INSERT INTO order_message
                            (order_id, sender_user_id, sender_role, content, visibility, review_status)
                        VALUES
                            (:orderId, :senderUserId, :senderRole, :content, :visibility, :reviewStatus)
                        """)
                .param("orderId", orderId)
                .param("senderUserId", identity.userId())
                .param("senderRole", identity.role().name())
                .param("content", request.content())
                .param("visibility", visibility)
                .param("reviewStatus", reviewStatus)
                .update();
        long messageId = lastInsertId();
        if ("PENDING_REVIEW".equals(reviewStatus)) {
            emit(order, "MESSAGE_PENDING_REVIEW", "CS", order.csUserId(), "生产端消息待审核");
        } else if (doctorVisible(visibility)) {
            emit(order, "MESSAGE_RECEIVED", "DOCTOR", order.doctorUserId(), request.content());
        }
        return loadMessage(messageId);
    }

    @Transactional
    public MessageResponse reviewMessage(long messageId, MessageReviewRequest request, BootstrapIdentity identity) {
        requireCsOrAdmin(identity);
        MessageRow message = loadMessageRow(messageId);
        OrderRow order = loadOrder(message.orderId(), identity, "identity cannot access this order");
        String action = normalizeOrDefault(request.action(), "");
        String fromStatus = message.reviewStatus();
        String toStatus;
        String content = message.content();
        if ("APPROVE".equals(action)) {
            toStatus = "APPROVED";
        } else if ("EDIT_AND_APPROVE".equals(action)) {
            if (request.editedContent() == null || request.editedContent().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "edited_content is required");
            }
            toStatus = "APPROVED";
            content = request.editedContent();
        } else if ("REJECT".equals(action)) {
            toStatus = "REJECTED";
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unsupported review action");
        }
        jdbcClient.sql("""
                        UPDATE order_message
                        SET content = :content,
                            review_status = :toStatus
                        WHERE message_id = :messageId
                        """)
                .param("content", content)
                .param("toStatus", toStatus)
                .param("messageId", messageId)
                .update();
        jdbcClient.sql("""
                        INSERT INTO message_review_log
                            (message_id, reviewer_user_id, from_status, to_status, reason)
                        VALUES
                            (:messageId, :reviewerUserId, :fromStatus, :toStatus, :reason)
                        """)
                .param("messageId", messageId)
                .param("reviewerUserId", identity.userId())
                .param("fromStatus", fromStatus)
                .param("toStatus", toStatus)
                .param("reason", request.reviewNote())
                .update();
        if ("APPROVED".equals(toStatus) && doctorVisible(message.visibility())) {
            emit(order, "MESSAGE_RECEIVED", "DOCTOR", order.doctorUserId(), content);
        }
        if ("REJECTED".equals(toStatus)) {
            emit(order, "MESSAGE_REVIEW_REJECTED", message.senderRole(), message.senderUserId(), "消息审核未通过");
        }
        return loadMessage(messageId);
    }

    public List<MessageResponse> pendingMessages(BootstrapIdentity identity) {
        requireCsOrAdmin(identity);
        return queryMessages(null, "AND review_status = 'PENDING_REVIEW'");
    }

    public List<DesignDraftResponse> listDesignDrafts(long orderId, BootstrapIdentity identity) {
        OrderRow order = loadOrder(orderId, identity, "identity cannot access this order");
        String doctorFilter = "";
        if (identity.isDoctor()) {
            identity.requireDoctorScope(order.doctorUserId(), order.clinicId());
            doctorFilter = "AND draft_status IN ('PENDING_DOCTOR_CONFIRM', 'DOCTOR_CONFIRMED', 'DOCTOR_REJECTED')";
        }
        return jdbcClient.sql("""
                        SELECT design_draft_id, order_id, version_no, uploaded_by_user_id, file_id, draft_status
                        FROM design_draft
                        WHERE order_id = :orderId
                        %s
                        ORDER BY version_no, design_draft_id
                        """.formatted(doctorFilter))
                .param("orderId", orderId)
                .query((rs, rowNum) -> new DesignDraftResponse(
                        rs.getLong("design_draft_id"),
                        rs.getLong("order_id"),
                        rs.getInt("version_no"),
                        rs.getObject("uploaded_by_user_id", Long.class),
                        rs.getObject("file_id", Long.class),
                        rs.getString("draft_status")))
                .list();
    }

    @Transactional
    public DesignDraftResponse uploadDesignDraft(long orderId, DesignDraftRequest request, BootstrapIdentity identity) {
        if (identity.role() == UserRole.DOCTOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "doctor cannot upload design draft");
        }
        if (request.fileIds() == null || request.fileIds().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "file_ids is required");
        }
        OrderRow order = loadOrder(orderId, identity, "identity cannot access this order");
        int nextVersion = jdbcClient.sql("""
                        SELECT COALESCE(MAX(version_no), 0) + 1
                        FROM design_draft
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .query(Integer.class)
                .single();
        jdbcClient.sql("""
                        INSERT INTO design_draft
                            (order_id, file_id, version_no, draft_status, uploaded_by_user_id)
                        VALUES
                            (:orderId, :fileId, :versionNo, 'PENDING_CS_REVIEW', :uploadedByUserId)
                        """)
                .param("orderId", orderId)
                .param("fileId", request.fileIds().get(0))
                .param("versionNo", nextVersion)
                .param("uploadedByUserId", identity.userId())
                .update();
        long draftId = lastInsertId();
        emit(order, "DESIGN_DRAFT_UPLOADED", "CS", order.csUserId(), "设计稿待客服审核");
        return loadDesignDraft(draftId);
    }

    @Transactional
    public DesignDraftResponse reviewDesignDraft(
            long orderId, long draftId, DesignDraftReviewRequest request, BootstrapIdentity identity) {
        requireCsOrAdmin(identity);
        DesignDraftRow draft = loadDesignDraftRow(orderId, draftId);
        OrderRow order = loadOrder(orderId, identity, "identity cannot access this order");
        String action = normalizeOrDefault(request.action(), "");
        String targetStatus;
        if ("APPROVE".equals(action)) {
            targetStatus = "PENDING_DOCTOR_CONFIRM";
        } else if ("REJECT".equals(action)) {
            targetStatus = "CS_REJECTED";
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unsupported design draft review action");
        }
        jdbcClient.sql("""
                        UPDATE design_draft
                        SET draft_status = :targetStatus
                        WHERE design_draft_id = :draftId
                        """)
                .param("targetStatus", targetStatus)
                .param("draftId", draftId)
                .update();
        if ("PENDING_DOCTOR_CONFIRM".equals(targetStatus)) {
            emit(order, "DESIGN_DRAFT_CS_APPROVED", "DOCTOR", order.doctorUserId(), "设计稿待医生确认");
        } else {
            emit(order, "DESIGN_DRAFT_CS_REJECTED", "WORKER", draft.uploadedByUserId(), "设计稿客服审核未通过");
        }
        return loadDesignDraft(draftId);
    }

    @Transactional
    public DesignDraftResponse doctorConfirmDesignDraft(
            long orderId, long draftId, DoctorDraftConfirmRequest request, BootstrapIdentity identity) {
        if (!identity.isDoctor()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "only doctor can confirm design draft");
        }
        OrderRow order = loadOrder(orderId, identity, "identity cannot access this order");
        identity.requireDoctorScope(order.doctorUserId(), order.clinicId());
        DesignDraftRow draft = loadDesignDraftRow(orderId, draftId);
        if (!"PENDING_DOCTOR_CONFIRM".equals(draft.draftStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "design draft is not waiting for doctor confirmation");
        }
        String action = normalizeOrDefault(request.action(), "");
        String targetStatus;
        String eventType;
        if ("CONFIRM".equals(action)) {
            targetStatus = "DOCTOR_CONFIRMED";
            eventType = "DESIGN_DRAFT_CONFIRMED";
        } else if ("REJECT".equals(action)) {
            targetStatus = "DOCTOR_REJECTED";
            eventType = "DESIGN_DRAFT_REJECTED";
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unsupported doctor confirmation action");
        }
        jdbcClient.sql("""
                        UPDATE design_draft
                        SET draft_status = :targetStatus,
                            doctor_confirmed_at = CASE WHEN :targetStatus = 'DOCTOR_CONFIRMED' THEN CURRENT_TIMESTAMP(3) ELSE doctor_confirmed_at END
                        WHERE design_draft_id = :draftId
                        """)
                .param("targetStatus", targetStatus)
                .param("draftId", draftId)
                .update();
        emit(order, eventType, "CS", order.csUserId(), "医生已处理设计稿");
        return loadDesignDraft(draftId);
    }

    public BillResponse getBill(long orderId, BootstrapIdentity identity) {
        OrderRow order = loadOrder(orderId, identity, "identity cannot access this order");
        requireDoctorScopeIfNeeded(order, identity);
        return jdbcClient.sql("""
                        SELECT bill_id, order_id, bill_status, file_id
                        FROM order_bill
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .query((rs, rowNum) -> new BillResponse(
                        rs.getObject("bill_id", Long.class),
                        rs.getLong("order_id"),
                        rs.getString("bill_status"),
                        rs.getObject("file_id", Long.class)))
                .optional()
                .orElse(new BillResponse(null, orderId, "PENDING", null));
    }

    @Transactional
    public BillResponse uploadBill(long orderId, BillRequest request, BootstrapIdentity identity) {
        requireCsOrAdmin(identity);
        if (request.fileId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "file_id is required");
        }
        OrderRow order = loadOrder(orderId, identity, "identity cannot access this order");
        jdbcClient.sql("""
                        INSERT INTO order_bill (order_id, bill_status, file_id)
                        VALUES (:orderId, 'UPLOADED', :fileId)
                        ON DUPLICATE KEY UPDATE
                            bill_status = 'UPLOADED',
                            file_id = VALUES(file_id),
                            updated_at = CURRENT_TIMESTAMP(3)
                        """)
                .param("orderId", orderId)
                .param("fileId", request.fileId())
                .update();
        emit(order, "BILL_UPLOADED", "DOCTOR", order.doctorUserId(), "账单已上传");
        return getBill(orderId, identity);
    }

    public LogisticsResponse getLogistics(long orderId, BootstrapIdentity identity) {
        OrderRow order = loadOrder(orderId, identity, "identity cannot access this order");
        requireDoctorScopeIfNeeded(order, identity);
        return jdbcClient.sql("""
                        SELECT logistics_id, order_id, carrier_name, tracking_no, logistics_status
                        FROM order_logistics
                        WHERE order_id = :orderId
                        """)
                .param("orderId", orderId)
                .query((rs, rowNum) -> new LogisticsResponse(
                        rs.getObject("logistics_id", Long.class),
                        rs.getLong("order_id"),
                        rs.getString("carrier_name"),
                        rs.getString("tracking_no"),
                        rs.getString("logistics_status")))
                .optional()
                .orElse(new LogisticsResponse(null, orderId, null, null, "PENDING"));
    }

    @Transactional
    public LogisticsResponse shipOrder(long orderId, LogisticsRequest request, BootstrapIdentity identity) {
        requireCsOrAdmin(identity);
        if (request.carrier() == null || request.carrier().isBlank() || request.trackingNo() == null || request.trackingNo().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "carrier and tracking_no are required");
        }
        OrderRow order = loadOrder(orderId, identity, "identity cannot access this order");
        jdbcClient.sql("""
                        INSERT INTO order_logistics
                            (order_id, carrier_name, tracking_no, logistics_status, shipped_at)
                        VALUES
                            (:orderId, :carrier, :trackingNo, 'SHIPPED', CURRENT_TIMESTAMP(3))
                        ON DUPLICATE KEY UPDATE
                            carrier_name = VALUES(carrier_name),
                            tracking_no = VALUES(tracking_no),
                            logistics_status = 'SHIPPED',
                            shipped_at = COALESCE(shipped_at, CURRENT_TIMESTAMP(3)),
                            updated_at = CURRENT_TIMESTAMP(3)
                        """)
                .param("orderId", orderId)
                .param("carrier", request.carrier())
                .param("trackingNo", request.trackingNo())
                .update();
        orderStatusService.updateOrderState(orderId, InternalOrderStatus.SHIPPED, "ORDER_SHIPPED", identity.userId(), request.trackingNo());
        emit(order, "ORDER_SHIPPED", "DOCTOR", order.doctorUserId(), "订单已发货");
        return getLogistics(orderId, identity);
    }

    private List<MessageResponse> queryMessages(Long orderId, String extraWhere) {
        String orderFilter = orderId == null ? "" : "AND order_id = :orderId";
        JdbcClient.StatementSpec spec = jdbcClient.sql("""
                        SELECT message_id, order_id, sender_user_id, sender_role, content, visibility, review_status
                        FROM order_message
                        WHERE 1 = 1
                        %s
                        %s
                        ORDER BY created_at, message_id
                        """.formatted(orderFilter, extraWhere));
        if (orderId != null) {
            spec = spec.param("orderId", orderId);
        }
        return spec.query((rs, rowNum) -> new MessageResponse(
                        rs.getLong("message_id"),
                        rs.getLong("order_id"),
                        rs.getObject("sender_user_id", Long.class),
                        rs.getString("sender_role"),
                        rs.getString("content"),
                        rs.getString("visibility"),
                        rs.getString("review_status")))
                .list();
    }

    private MessageResponse loadMessage(long messageId) {
        MessageRow row = loadMessageRow(messageId);
        return new MessageResponse(
                row.messageId(), row.orderId(), row.senderUserId(), row.senderRole(), row.content(), row.visibility(), row.reviewStatus());
    }

    private MessageRow loadMessageRow(long messageId) {
        try {
            return jdbcClient.sql("""
                            SELECT message_id, order_id, sender_user_id, sender_role, content, visibility, review_status
                            FROM order_message
                            WHERE message_id = :messageId
                            """)
                    .param("messageId", messageId)
                    .query((rs, rowNum) -> new MessageRow(
                            rs.getLong("message_id"),
                            rs.getLong("order_id"),
                            rs.getObject("sender_user_id", Long.class),
                            rs.getString("sender_role"),
                            rs.getString("content"),
                            rs.getString("visibility"),
                            rs.getString("review_status")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "message not found", ex);
        }
    }

    private DesignDraftResponse loadDesignDraft(long draftId) {
        return jdbcClient.sql("""
                        SELECT design_draft_id, order_id, version_no, uploaded_by_user_id, file_id, draft_status
                        FROM design_draft
                        WHERE design_draft_id = :draftId
                        """)
                .param("draftId", draftId)
                .query((rs, rowNum) -> new DesignDraftResponse(
                        rs.getLong("design_draft_id"),
                        rs.getLong("order_id"),
                        rs.getInt("version_no"),
                        rs.getObject("uploaded_by_user_id", Long.class),
                        rs.getObject("file_id", Long.class),
                        rs.getString("draft_status")))
                .single();
    }

    private DesignDraftRow loadDesignDraftRow(long orderId, long draftId) {
        try {
            return jdbcClient.sql("""
                            SELECT design_draft_id, order_id, uploaded_by_user_id, draft_status
                            FROM design_draft
                            WHERE order_id = :orderId
                              AND design_draft_id = :draftId
                            """)
                    .param("orderId", orderId)
                    .param("draftId", draftId)
                    .query((rs, rowNum) -> new DesignDraftRow(
                            rs.getLong("design_draft_id"),
                            rs.getLong("order_id"),
                            rs.getObject("uploaded_by_user_id", Long.class),
                            rs.getString("draft_status")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "design draft not found", ex);
        }
    }

    private OrderRow loadOrder(long orderId, BootstrapIdentity identity, String forbiddenMessage) {
        String dataScope = accessControlService.effectiveDataScope(identity);
        accessControlService.requireScopedIdentity(identity, dataScope);
        try {
            return jdbcClient.sql("""
                            SELECT order_id, order_no, clinic_id, doctor_user_id, cs_user_id
                            FROM orders
                            WHERE order_id = :orderId
                              AND (
                                  :dataScope = 'ALL'
                                  OR (:dataScope = 'CLINIC'
                                      AND (clinic_id = :clinicId OR doctor_user_id = :userId))
                                  OR (:dataScope = 'SELF'
                                      AND (
                                          doctor_user_id = :userId
                                          OR cs_user_id = :userId
                                          OR EXISTS (
                                              SELECT 1
                                              FROM order_process_instance scoped_i
                                              JOIN order_process_node scoped_n
                                                ON scoped_n.instance_id = scoped_i.instance_id
                                              WHERE scoped_i.order_id = orders.order_id
                                                AND scoped_n.assigned_user_id = :userId
                                          )
                                      ))
                              )
                            """)
                    .param("orderId", orderId)
                    .param("dataScope", dataScope)
                    .param("userId", identity.userId())
                    .param("clinicId", identity.clinicId())
                    .query((rs, rowNum) -> new OrderRow(
                            rs.getLong("order_id"),
                            rs.getString("order_no"),
                            rs.getLong("clinic_id"),
                            rs.getObject("doctor_user_id", Long.class),
                            rs.getObject("cs_user_id", Long.class)))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            if (orderExists(orderId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, forbiddenMessage, ex);
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found", ex);
        }
    }

    private boolean orderExists(long orderId) {
        return jdbcClient.sql("SELECT COUNT(*) FROM orders WHERE order_id = :orderId")
                .param("orderId", orderId)
                .query(Long.class)
                .single() > 0;
    }

    private void emit(OrderRow order, String eventType, String audienceRole, Long userId, String message) {
        String payload = payload(order, eventType, message);
        jdbcClient.sql("""
                        INSERT INTO notification_event
                            (order_id, event_type, audience_role, payload, delivery_status)
                        VALUES
                            (:orderId, :eventType, :audienceRole, CAST(:payload AS JSON), 'PENDING')
                        """)
                .param("orderId", order.orderId())
                .param("eventType", eventType)
                .param("audienceRole", audienceRole)
                .param("payload", payload)
                .update();
        long eventId = lastInsertId();
        if (userId != null) {
            jdbcClient.sql("""
                            INSERT IGNORE INTO user_notification (event_id, user_id)
                            VALUES (:eventId, :userId)
                            """)
                    .param("eventId", eventId)
                    .param("userId", userId)
                    .update();
            notificationPushService.pushToUser(userId, eventId, payload);
        }
    }

    private String payload(OrderRow order, String eventType, String message) {
        try {
            return objectMapper.writeValueAsString(new NotificationPayload(
                    eventType, order.orderId(), order.orderNo(), message));
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "failed to build notification payload", ex);
        }
    }

    private void requireDoctorScopeIfNeeded(OrderRow order, BootstrapIdentity identity) {
        if (identity.isDoctor()) {
            identity.requireDoctorScope(order.doctorUserId(), order.clinicId());
        }
    }

    private void requireCsOrAdmin(BootstrapIdentity identity) {
        if (identity.role() != UserRole.CS && identity.role() != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "CS or ADMIN role is required");
        }
    }

    private boolean doctorVisible(String visibility) {
        return List.of("DOCTOR", "DOCTOR_CS", "ALL").contains(visibility);
    }

    private String normalizeOrDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value.trim().toUpperCase(Locale.ROOT);
    }

    private long lastInsertId() {
        return jdbcClient.sql("SELECT LAST_INSERT_ID()")
                .query(Long.class)
                .single();
    }

    private record OrderRow(long orderId, String orderNo, long clinicId, Long doctorUserId, Long csUserId) {
    }

    private record MessageRow(
            long messageId,
            long orderId,
            Long senderUserId,
            String senderRole,
            String content,
            String visibility,
            String reviewStatus) {
    }

    private record DesignDraftRow(long draftId, long orderId, Long uploadedByUserId, String draftStatus) {
    }

    private record NotificationPayload(String event, long orderId, String orderNo, String message) {
    }
}
