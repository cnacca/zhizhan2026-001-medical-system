package com.yuri.aiorder.order.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yuri.aiorder.common.BootstrapIdentity;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderProjectionQueryService {

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;

    public OrderProjectionQueryService(JdbcClient jdbcClient, ObjectMapper objectMapper) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
    }

    public DoctorOrderVO getDoctorOrder(long orderId, BootstrapIdentity identity) {
        OrderReadRow row = loadOrder(orderId);
        identity.requireDoctorScope(row.doctorUserId(), row.clinicId());
        return new DoctorOrderVO(
                row.orderId(),
                row.orderNo(),
                row.productType(),
                row.externalStatus(),
                readJson(row.formData()),
                row.publicMessage(),
                row.billStatus(),
                row.logisticsStatus(),
                row.trackingNo());
    }

    public OrderInternalDTO getInternalOrder(long orderId) {
        OrderReadRow row = loadOrder(orderId);
        return new OrderInternalDTO(
                row.orderId(),
                row.orderNo(),
                row.clinicId(),
                row.clinicName(),
                row.doctorUserId(),
                row.csUserId(),
                row.productType(),
                row.internalStatus(),
                row.externalStatus(),
                row.productionNote(),
                row.rejectReason(),
                readJson(row.formData()));
    }

    public DoctorOrderAssistantReadModel getAssistantReadModel(long orderId, BootstrapIdentity identity) {
        OrderReadRow row = loadOrder(orderId);
        identity.requireDoctorScope(row.doctorUserId(), row.clinicId());
        return new DoctorOrderAssistantReadModel(
                row.orderId(),
                row.orderNo(),
                row.externalStatus(),
                row.publicMessage(),
                row.billStatus(),
                row.logisticsStatus(),
                row.trackingNo(),
                doctorVisibleMessageSummary(orderId));
    }

    private OrderReadRow loadOrder(long orderId) {
        try {
            return jdbcClient.sql("""
                            SELECT
                                o.order_id,
                                o.order_no,
                                o.clinic_id,
                                c.clinic_name,
                                o.doctor_user_id,
                                o.cs_user_id,
                                o.product_type,
                                o.internal_status,
                                o.external_status,
                                o.production_note,
                                o.reject_reason,
                                o.form_data,
                                p.public_message,
                                b.bill_status,
                                l.logistics_status,
                                l.tracking_no
                            FROM orders o
                            JOIN clinic c ON c.clinic_id = o.clinic_id
                            LEFT JOIN order_external_projection p ON p.order_id = o.order_id
                            LEFT JOIN order_bill b ON b.order_id = o.order_id
                            LEFT JOIN order_logistics l ON l.order_id = o.order_id
                            WHERE o.order_id = :orderId
                            """)
                    .param("orderId", orderId)
                    .query((rs, rowNum) -> new OrderReadRow(
                            rs.getLong("order_id"),
                            rs.getString("order_no"),
                            rs.getLong("clinic_id"),
                            rs.getString("clinic_name"),
                            rs.getObject("doctor_user_id", Long.class),
                            rs.getObject("cs_user_id", Long.class),
                            rs.getString("product_type"),
                            rs.getString("internal_status"),
                            rs.getString("external_status"),
                            rs.getString("production_note"),
                            rs.getString("reject_reason"),
                            rs.getString("form_data"),
                            rs.getString("public_message"),
                            rs.getString("bill_status"),
                            rs.getString("logistics_status"),
                            rs.getString("tracking_no")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found", ex);
        }
    }

    private String doctorVisibleMessageSummary(long orderId) {
        return jdbcClient.sql("""
                        SELECT GROUP_CONCAT(content ORDER BY created_at SEPARATOR '；')
                        FROM order_message
                        WHERE order_id = :orderId
                          AND visibility IN ('DOCTOR', 'DOCTOR_CS', 'ALL')
                          AND review_status IN ('DIRECT', 'APPROVED')
                        """)
                .param("orderId", orderId)
                .query(String.class)
                .optional()
                .orElse(null);
    }

    private JsonNode readJson(String json) {
        if (json == null || json.isBlank()) {
            return objectMapper.createObjectNode();
        }
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "invalid stored order json", ex);
        }
    }

    private record OrderReadRow(
            long orderId,
            String orderNo,
            long clinicId,
            String clinicName,
            Long doctorUserId,
            Long csUserId,
            String productType,
            String internalStatus,
            String externalStatus,
            String productionNote,
            String rejectReason,
            String formData,
            String publicMessage,
            String billStatus,
            String logisticsStatus,
            String trackingNo) {
    }
}
