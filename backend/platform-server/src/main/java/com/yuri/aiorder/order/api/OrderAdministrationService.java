package com.yuri.aiorder.order.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yuri.aiorder.common.BootstrapIdentity;
import java.util.Locale;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderAdministrationService {

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;

    public OrderAdministrationService(JdbcClient jdbcClient, ObjectMapper objectMapper) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void updateBoxNo(long orderId, String requestedBoxNo, String reason, BootstrapIdentity identity) {
        String before = jdbcClient.sql("SELECT box_no FROM orders WHERE order_id = :orderId FOR UPDATE")
                .param("orderId", orderId)
                .query(String.class)
                .optional()
                .orElse(null);
        String after = normalizeBoxNo(requestedBoxNo);
        if (java.util.Objects.equals(before, after)) {
            return;
        }
        releaseActiveBoxAssignment(orderId, identity.userId(), "BOX_NUMBER_CHANGED");
        if (after != null) {
            try {
                jdbcClient.sql("""
                                INSERT INTO order_box_assignment
                                    (order_id, box_no, assigned_by_user_id)
                                VALUES (:orderId, :boxNo, :actorUserId)
                                """)
                        .param("orderId", orderId)
                        .param("boxNo", after)
                        .param("actorUserId", identity.userId())
                        .update();
            } catch (DuplicateKeyException ex) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "box_no is currently used by another unshipped order", ex);
            }
        }
        jdbcClient.sql("UPDATE orders SET box_no = :boxNo WHERE order_id = :orderId")
                .param("boxNo", after)
                .param("orderId", orderId)
                .update();
        audit(orderId, "UPDATE_BOX_NO", auditField("box_no", before), auditField("box_no", after),
                identity.userId(), blankToNull(reason));
    }

    @Transactional
    public void updateProductionOrderNo(
            long orderId, String requestedProductionOrderNo, String reason, BootstrapIdentity identity) {
        String before = jdbcClient.sql("SELECT production_order_no FROM orders WHERE order_id = :orderId FOR UPDATE")
                .param("orderId", orderId)
                .query(String.class)
                .optional()
                .orElse(null);
        String after = normalizeIdentifier(requestedProductionOrderNo, "production_order_no");
        if (before != null && after == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "production_order_no cannot be cleared once assigned");
        }
        if (java.util.Objects.equals(before, after)) {
            return;
        }
        if (before != null && blankToNull(reason) == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "reason is required when correcting production_order_no");
        }
        try {
            jdbcClient.sql("UPDATE orders SET production_order_no = :productionOrderNo WHERE order_id = :orderId")
                    .param("productionOrderNo", after)
                    .param("orderId", orderId)
                    .update();
        } catch (DuplicateKeyException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "production_order_no has already been used", ex);
        }
        audit(orderId, before == null ? "ASSIGN_PRODUCTION_ORDER_NO" : "CORRECT_PRODUCTION_ORDER_NO",
                auditField("production_order_no", before), auditField("production_order_no", after),
                identity.userId(), blankToNull(reason));
    }

    @Transactional
    public void releaseBoxAssignment(long orderId, Long actorUserId, String reason) {
        releaseActiveBoxAssignment(orderId, actorUserId, reason);
    }

    @Transactional
    public void reactivateBoxAssignment(long orderId, Long actorUserId) {
        String boxNo = jdbcClient.sql("SELECT box_no FROM orders WHERE order_id = :orderId FOR UPDATE")
                .param("orderId", orderId)
                .query(String.class)
                .optional()
                .orElse(null);
        if (boxNo == null || jdbcClient.sql("""
                        SELECT COUNT(*) FROM order_box_assignment
                        WHERE order_id = :orderId AND released_at IS NULL
                        """)
                .param("orderId", orderId)
                .query(Long.class)
                .single() > 0) {
            return;
        }
        try {
            jdbcClient.sql("""
                            INSERT INTO order_box_assignment
                                (order_id, box_no, assigned_by_user_id)
                            VALUES (:orderId, :boxNo, :actorUserId)
                            """)
                    .param("orderId", orderId)
                    .param("boxNo", boxNo)
                    .param("actorUserId", actorUserId)
                    .update();
        } catch (DuplicateKeyException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "shipment cannot be reversed because this box_no is already reused by another order",
                    ex);
        }
    }

    private void releaseActiveBoxAssignment(long orderId, Long actorUserId, String reason) {
        jdbcClient.sql("""
                        UPDATE order_box_assignment
                        SET released_at = CURRENT_TIMESTAMP(3),
                            released_by_user_id = :actorUserId,
                            release_reason = :reason
                        WHERE order_id = :orderId
                          AND released_at IS NULL
                        """)
                .param("actorUserId", actorUserId)
                .param("reason", reason)
                .param("orderId", orderId)
                .update();
    }

    public void auditDeliveryDate(
            long orderId,
            java.time.LocalDate before,
            java.time.LocalDate after,
            String reason,
            BootstrapIdentity identity) {
        audit(orderId, "OVERRIDE_SYSTEM_ESTIMATED_DELIVERY_DATE",
                auditField("computed_delivery_date", before),
                auditField("computed_delivery_date", after),
                identity.userId(), reason.trim());
    }

    private String normalizeBoxNo(String value) {
        return normalizeIdentifier(value, "box_no");
    }

    private String normalizeIdentifier(String value, String fieldName) {
        String normalized = blankToNull(value);
        if (normalized == null) {
            return null;
        }
        if (normalized.length() > 64) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " exceeds 64 characters");
        }
        return normalized.toUpperCase(Locale.ROOT);
    }

    private void audit(
            long orderId,
            String action,
            Map<String, Object> before,
            Map<String, Object> after,
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
                .param("beforeValue", json(before))
                .param("afterValue", json(after))
                .param("actorUserId", actorUserId)
                .param("reason", reason)
                .update();
    }

    private String json(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "cannot serialize order audit", ex);
        }
    }

    private Map<String, Object> auditField(String name, Object value) {
        Map<String, Object> field = new LinkedHashMap<>();
        field.put(name, value);
        return field;
    }

    private String blankToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
