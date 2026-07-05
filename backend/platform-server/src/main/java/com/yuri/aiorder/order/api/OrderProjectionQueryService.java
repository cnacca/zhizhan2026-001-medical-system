package com.yuri.aiorder.order.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.auth.AccessControlService;
import java.util.ArrayList;
import java.util.List;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderProjectionQueryService {

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;
    private final AccessControlService accessControlService;

    public OrderProjectionQueryService(
            JdbcClient jdbcClient, ObjectMapper objectMapper, AccessControlService accessControlService) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
        this.accessControlService = accessControlService;
    }

    public DoctorOrderVO getDoctorOrder(long orderId, BootstrapIdentity identity) {
        OrderReadRow row = loadOrder(orderId, identity, "doctor cannot access this order");
        return toDoctorOrder(row);
    }

    public OrderInternalDTO getInternalOrder(long orderId, BootstrapIdentity identity) {
        OrderReadRow row = loadOrder(orderId, identity, "identity cannot access this order");
        return toInternalOrder(row);
    }

    public OrderListResponse<?> listOrders(
            BootstrapIdentity identity, String externalStatus, String internalStatus, String keyword, int page, int size) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(1, Math.min(size, 100));
        int offset = (safePage - 1) * safeSize;
        String dataScope = accessControlService.effectiveDataScope(identity);
        accessControlService.requireScopedIdentity(identity, dataScope);

        List<String> filters = new ArrayList<>();
        filters.add(scopedWhereClause(identity));
        if (externalStatus != null && !externalStatus.isBlank()) {
            filters.add("o.external_status = :externalStatus");
        }
        if (!identity.isDoctor() && internalStatus != null && !internalStatus.isBlank()) {
            filters.add("o.internal_status = :internalStatus");
        }
        if (keyword != null && !keyword.isBlank()) {
            filters.add("(o.order_no LIKE :keyword OR JSON_UNQUOTE(JSON_EXTRACT(o.form_data, '$.patient_name')) LIKE :keyword)");
        }
        String whereClause = "WHERE " + String.join(" AND ", filters);

        List<OrderReadRow> rows = bindListParams(queryOrderRows(whereClause), identity, dataScope, externalStatus, internalStatus, keyword)
                .param("limit", safeSize)
                .param("offset", offset)
                .query(this::mapOrder)
                .list();
        long total = bindListParams(countOrders(whereClause), identity, dataScope, externalStatus, internalStatus, keyword)
                .query(Long.class)
                .single();

        if (identity.isDoctor()) {
            return new OrderListResponse<>(rows.stream().map(this::toDoctorOrder).toList(), total, safePage, safeSize);
        }
        return new OrderListResponse<>(rows.stream().map(this::toInternalOrder).toList(), total, safePage, safeSize);
    }

    public DoctorOrderAssistantReadModel getAssistantReadModel(long orderId, BootstrapIdentity identity) {
        OrderReadRow row = loadOrder(orderId, identity, "doctor cannot access this order");
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

    private OrderReadRow loadOrder(long orderId, BootstrapIdentity identity, String forbiddenMessage) {
        String dataScope = accessControlService.effectiveDataScope(identity);
        accessControlService.requireScopedIdentity(identity, dataScope);
        try {
            return queryOrder("""
                            WHERE o.order_id = :orderId
                              AND %s
                            """.formatted(scopedWhereClause(identity)), orderId, identity, dataScope);
        } catch (EmptyResultDataAccessException ex) {
            if (orderExists(orderId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, forbiddenMessage, ex);
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found", ex);
        }
    }

    private String scopedWhereClause(BootstrapIdentity identity) {
        if (identity.isDoctor()) {
            return "o.doctor_user_id = :userId";
        }
        return """
                (
                    :dataScope = 'ALL'
                    OR (:dataScope = 'CLINIC'
                        AND (o.clinic_id = :clinicId OR o.doctor_user_id = :userId))
                    OR (:dataScope = 'SELF'
                        AND (
                            o.doctor_user_id = :userId
                            OR o.cs_user_id = :userId
                            OR EXISTS (
                                SELECT 1
                                FROM order_process_instance scoped_i
                                JOIN order_process_node scoped_n
                                  ON scoped_n.instance_id = scoped_i.instance_id
                                WHERE scoped_i.order_id = o.order_id
                                  AND scoped_n.assigned_user_id = :userId
                            )
                        ))
                )
                """;
    }

    private JdbcClient.StatementSpec queryOrderRows(String whereClause) {
        return jdbcClient.sql("""
                        %s
                        %s
                        ORDER BY o.created_at DESC, o.order_id DESC
                        LIMIT :limit OFFSET :offset
                        """.formatted(baseOrderSelect(), whereClause));
    }

    private JdbcClient.StatementSpec countOrders(String whereClause) {
        return jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM orders o
                        %s
                        """.formatted(whereClause));
    }

    private JdbcClient.StatementSpec bindListParams(
            JdbcClient.StatementSpec spec,
            BootstrapIdentity identity,
            String dataScope,
            String externalStatus,
            String internalStatus,
            String keyword) {
        spec = spec.param("dataScope", dataScope)
                .param("userId", identity.userId())
                .param("clinicId", identity.clinicId());
        if (externalStatus != null && !externalStatus.isBlank()) {
            spec = spec.param("externalStatus", externalStatus);
        }
        if (!identity.isDoctor() && internalStatus != null && !internalStatus.isBlank()) {
            spec = spec.param("internalStatus", internalStatus.trim());
        }
        if (keyword != null && !keyword.isBlank()) {
            spec = spec.param("keyword", "%" + keyword.trim() + "%");
        }
        return spec;
    }

    private OrderReadRow loadOrder(long orderId) {
        try {
            return queryOrder("WHERE o.order_id = :orderId", orderId, null, null);
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found", ex);
        }
    }

    private OrderReadRow queryOrder(
            String whereClause,
            long orderId,
            BootstrapIdentity identity,
            String dataScope) {
        JdbcClient.StatementSpec spec = jdbcClient.sql("""
                        %s
                        %s
                        """.formatted(baseOrderSelect(), whereClause))
                .param("orderId", orderId);
        if (identity != null) {
            spec = spec.param("dataScope", dataScope)
                    .param("userId", identity.userId())
                    .param("clinicId", identity.clinicId());
        }
        return spec.query(this::mapOrder).single();
    }

    private String baseOrderSelect() {
        return """
                SELECT
                    o.order_id,
                    o.order_no,
                    o.clinic_id,
                    c.clinic_name,
                    o.doctor_user_id,
                    o.patient_id,
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
                """;
    }

    private OrderReadRow mapOrder(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new OrderReadRow(
                rs.getLong("order_id"),
                rs.getString("order_no"),
                rs.getLong("clinic_id"),
                rs.getString("clinic_name"),
                rs.getObject("doctor_user_id", Long.class),
                rs.getObject("patient_id", Long.class),
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
                rs.getString("tracking_no"));
    }

    private DoctorOrderVO toDoctorOrder(OrderReadRow row) {
        return new DoctorOrderVO(
                row.orderId(),
                row.orderNo(),
                row.patientId(),
                row.productType(),
                row.externalStatus(),
                readJson(row.formData()),
                row.publicMessage(),
                row.billStatus(),
                row.logisticsStatus(),
                row.trackingNo());
    }

    private OrderInternalDTO toInternalOrder(OrderReadRow row) {
        return new OrderInternalDTO(
                row.orderId(),
                row.orderNo(),
                row.clinicId(),
                row.clinicName(),
                row.doctorUserId(),
                row.patientId(),
                row.csUserId(),
                row.productType(),
                row.internalStatus(),
                row.externalStatus(),
                row.productionNote(),
                row.rejectReason(),
                readJson(row.formData()));
    }

    private boolean orderExists(long orderId) {
        return jdbcClient.sql("SELECT COUNT(*) FROM orders WHERE order_id = :orderId")
                .param("orderId", orderId)
                .query(Long.class)
                .single() > 0;
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
            Long patientId,
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

    public record OrderListResponse<T>(List<T> items, long total, int page, int size) {
    }
}
