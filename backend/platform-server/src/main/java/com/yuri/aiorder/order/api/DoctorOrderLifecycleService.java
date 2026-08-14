package com.yuri.aiorder.order.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.auth.AccessControlService;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DoctorOrderLifecycleService {

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;
    private final AccessControlService accessControlService;

    public DoctorOrderLifecycleService(
            JdbcClient jdbcClient,
            ObjectMapper objectMapper,
            AccessControlService accessControlService) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
        this.accessControlService = accessControlService;
    }

    @Transactional
    public DeleteDraftOrdersResponse deleteDraft(long orderId, BootstrapIdentity identity) {
        return deleteDrafts(List.of(orderId), identity);
    }

    @Transactional
    public DeleteDraftOrdersResponse deleteDrafts(List<Long> requestedOrderIds, BootstrapIdentity identity) {
        requireDoctorWrite(identity);
        List<Long> orderIds = normalizeOrderIds(requestedOrderIds);

        // 排序加锁，批量操作要么全部成功，要么全部回滚，避免部分草稿被删。
        List<DoctorOrderRow> locked = orderIds.stream()
                .sorted()
                .map(orderId -> lockOwnedOrder(orderId, identity))
                .toList();
        locked.forEach(this::requireDeletableSingleItemDraft);
        locked.forEach(order -> softDeleteDraft(order, identity));
        return new DeleteDraftOrdersResponse(locked.size(), locked.stream().map(DoctorOrderRow::orderId).toList());
    }

    @Transactional
    public OrderCancellationResponse requestCancellation(
            long orderId,
            OrderCancellationRequest request,
            BootstrapIdentity identity) {
        requireDoctorWrite(identity);
        DoctorOrderRow order = lockOwnedOrder(orderId, identity);
        if (order.draftDeletedAt() != null) {
            throw conflict("deleted draft cannot request cancellation");
        }
        if (!List.of("PENDING_CS_REVIEW", "PENDING_PRODUCTION_REVIEW").contains(order.internalStatus())) {
            throw conflict("only an order pending review can request cancellation");
        }

        OrderCancellationResponse existing = findPendingCancellation(orderId);
        if (existing != null) {
            return existing;
        }
        jdbcClient.sql("""
                        INSERT INTO order_cancellation_request
                            (order_id, requester_user_id, reason, request_status)
                        VALUES (:orderId, :requesterUserId, :reason, 'PENDING')
                        """)
                .param("orderId", orderId)
                .param("requesterUserId", identity.userId())
                .param("reason", request.reason().trim())
                .update();
        return findPendingCancellation(orderId);
    }

    private void requireDoctorWrite(BootstrapIdentity identity) {
        accessControlService.requireDoctorPortalAction(
                identity, "order:write-doctor", "only doctors can manage doctor orders");
        accessControlService.requireScopedIdentity(identity, "CLINIC");
    }

    private List<Long> normalizeOrderIds(List<Long> requestedOrderIds) {
        if (requestedOrderIds == null || requestedOrderIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "order_ids must not be empty");
        }
        LinkedHashSet<Long> unique = new LinkedHashSet<>();
        for (Long orderId : requestedOrderIds) {
            if (orderId == null || orderId <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "order_ids must contain positive ids");
            }
            unique.add(orderId);
        }
        if (unique.size() > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "at most 50 drafts can be deleted at once");
        }
        return List.copyOf(unique);
    }

    private DoctorOrderRow lockOwnedOrder(long orderId, BootstrapIdentity identity) {
        try {
            return jdbcClient.sql("""
                            SELECT order_id, order_no, group_id, doctor_user_id, clinic_id,
                                   internal_status, external_status, draft_deleted_at
                            FROM orders
                            WHERE order_id = :orderId
                              AND doctor_user_id = :doctorUserId
                              AND clinic_id = :clinicId
                            FOR UPDATE
                            """)
                    .param("orderId", orderId)
                    .param("doctorUserId", identity.userId())
                    .param("clinicId", identity.clinicId())
                    .query((rs, rowNum) -> new DoctorOrderRow(
                            rs.getLong("order_id"),
                            rs.getString("order_no"),
                            rs.getObject("group_id", Long.class),
                            rs.getLong("doctor_user_id"),
                            rs.getLong("clinic_id"),
                            rs.getString("internal_status"),
                            rs.getString("external_status"),
                            rs.getObject("draft_deleted_at", LocalDateTime.class)))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            if (orderExists(orderId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "doctor cannot manage this order", ex);
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found", ex);
        }
    }

    private void requireDeletableSingleItemDraft(DoctorOrderRow order) {
        if (order.draftDeletedAt() != null) {
            throw conflict("draft was already deleted");
        }
        if (!"DRAFT".equals(order.internalStatus()) || !"DRAFT".equals(order.externalStatus())) {
            throw conflict("only draft orders can be deleted");
        }
        if (order.groupId() != null) {
            long groupItemCount = jdbcClient.sql("SELECT COUNT(*) FROM orders WHERE group_id = :groupId AND draft_deleted_at IS NULL")
                    .param("groupId", order.groupId())
                    .query(Long.class)
                    .single();
            if (groupItemCount != 1L) {
                throw conflict("multi-product draft must be managed in the case group editor");
            }
        }
    }

    private void softDeleteDraft(DoctorOrderRow order, BootstrapIdentity identity) {
        Map<String, Object> before = Map.of(
                "order_id", order.orderId(),
                "order_no", order.orderNo(),
                "internal_status", order.internalStatus(),
                "external_status", order.externalStatus());
        if (order.groupId() != null) {
            jdbcClient.sql("""
                            INSERT INTO order_case_group_audit
                                (group_id, order_id, action_type, before_value,
                                 after_value, operator_user_id, reason)
                            VALUES
                                (:groupId, :orderId, 'DELETE_DRAFT', CAST(:beforeValue AS JSON),
                                 NULL, :operatorUserId, 'doctor deleted draft from order list')
                            """)
                    .param("groupId", order.groupId())
                    .param("orderId", order.orderId())
                    .param("beforeValue", writeJson(before))
                    .param("operatorUserId", identity.userId())
                    .update();
        }
        List<Long> activeFileIds = jdbcClient.sql("""
                        SELECT file_id
                        FROM file_resource
                        WHERE order_id = :orderId
                          AND owner_user_id = :operatorUserId
                          AND status = 'ACTIVE'
                        FOR UPDATE
                        """)
                .param("orderId", order.orderId())
                .param("operatorUserId", identity.userId())
                .query(Long.class)
                .list();
        for (Long fileId : activeFileIds) {
            jdbcClient.sql("""
                            UPDATE file_resource
                            SET status = 'DELETED'
                            WHERE file_id = :fileId
                              AND status = 'ACTIVE'
                            """)
                    .param("fileId", fileId)
                    .update();
            jdbcClient.sql("""
                            INSERT INTO file_access_audit
                                (file_id, order_id, actor_user_id, action, access_result, reason)
                            VALUES
                                (:fileId, :orderId, :operatorUserId, 'DELETE', 'ALLOWED',
                                 'doctor deleted draft order')
                            """)
                    .param("fileId", fileId)
                    .param("orderId", order.orderId())
                    .param("operatorUserId", identity.userId())
                    .update();
        }
        jdbcClient.sql("""
                        UPDATE orders
                        SET draft_deleted_at = CURRENT_TIMESTAMP(3),
                            draft_deleted_by = :operatorUserId
                        WHERE order_id = :orderId
                          AND internal_status = 'DRAFT'
                          AND draft_deleted_at IS NULL
                        """)
                .param("operatorUserId", identity.userId())
                .param("orderId", order.orderId())
                .update();
        if (order.groupId() != null) {
            jdbcClient.sql("""
                            UPDATE order_case_group
                            SET lifecycle_status = 'CANCELLED',
                                draft_version = draft_version + 1
                            WHERE group_id = :groupId
                              AND lifecycle_status = 'DRAFT'
                            """)
                    .param("groupId", order.groupId())
                    .update();
        }
    }

    private OrderCancellationResponse findPendingCancellation(long orderId) {
        return jdbcClient.sql("""
                        SELECT request_id, order_id, request_status, created_at
                        FROM order_cancellation_request
                        WHERE order_id = :orderId
                          AND request_status = 'PENDING'
                        ORDER BY request_id DESC
                        LIMIT 1
                        """)
                .param("orderId", orderId)
                .query((rs, rowNum) -> new OrderCancellationResponse(
                        rs.getLong("request_id"),
                        rs.getLong("order_id"),
                        rs.getString("request_status"),
                        rs.getObject("created_at", LocalDateTime.class)))
                .optional()
                .orElse(null);
    }

    private boolean orderExists(long orderId) {
        return jdbcClient.sql("SELECT COUNT(*) FROM orders WHERE order_id = :orderId")
                .param("orderId", orderId)
                .query(Long.class)
                .single() > 0;
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("failed to serialize draft audit", ex);
        }
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    private record DoctorOrderRow(
            long orderId,
            String orderNo,
            Long groupId,
            long doctorUserId,
            long clinicId,
            String internalStatus,
            String externalStatus,
            LocalDateTime draftDeletedAt) {
    }
}
