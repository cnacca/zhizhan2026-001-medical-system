package com.yuri.aiorder.quality;

import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.AccessControlService;
import com.yuri.aiorder.order.api.OrderProjectionQueryService.OrderListResponse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class QualityRecordService {

    private static final String EXTERNAL_RETURN = "EXTERNAL_RETURN";
    private static final String REASON_CATEGORY = "REASON_CATEGORY";
    private static final String RESPONSIBILITY_TYPE = "RESPONSIBILITY_TYPE";

    private final JdbcClient jdbcClient;
    private final AccessControlService accessControlService;

    public QualityRecordService(JdbcClient jdbcClient, AccessControlService accessControlService) {
        this.jdbcClient = jdbcClient;
        this.accessControlService = accessControlService;
    }

    public OrderListResponse<QualityRecordResponse> listQualityRecords(
            BootstrapIdentity identity,
            String recordType,
            String status,
            String responsibilityType,
            Long orderId,
            int page,
            int size) {
        accessControlService.requireAnyRole(
                identity, java.util.EnumSet.of(UserRole.ADMIN, UserRole.CS), "quality records are internal only");
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(1, Math.min(size, 100));
        int offset = (safePage - 1) * safeSize;
        String normalizedRecordType = normalizeOptional(recordType);
        if (normalizedRecordType != null && !EXTERNAL_RETURN.equals(normalizedRecordType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unsupported quality record type");
        }
        String normalizedStatus = normalizeOptional(status);
        String normalizedResponsibilityType = normalizeOptional(responsibilityType);
        if (normalizedResponsibilityType != null) {
            requireActiveDictionaryValue(normalizedResponsibilityType, RESPONSIBILITY_TYPE, "unsupported responsibility_type");
        }

        List<String> filters = new ArrayList<>();
        if (normalizedRecordType != null) {
            filters.add("c.check_type = :recordType");
        }
        if (normalizedStatus != null) {
            filters.add("r.status = :status");
        }
        if (normalizedResponsibilityType != null) {
            filters.add("r.responsibility_type = :responsibilityType");
        }
        if (orderId != null) {
            filters.add("c.order_id = :orderId");
        }
        String whereClause = filters.isEmpty() ? "" : " WHERE " + String.join(" AND ", filters) + " ";

        JdbcClient.StatementSpec dataSpec = bindFilters(jdbcClient.sql("""
                        SELECT
                            c.check_id,
                            c.check_type,
                            c.result,
                            c.created_at,
                            o.order_id,
                            o.order_no,
                            o.product_type,
                            cl.clinic_name,
                            r.rework_id,
                            r.reason_category,
                            r.reason_detail,
                            r.responsibility_type,
                            r.status,
                            r.updated_at
                        FROM check_record c
                        JOIN orders o ON o.order_id = c.order_id
                        JOIN clinic cl ON cl.clinic_id = o.clinic_id
                        LEFT JOIN rework_record r ON r.source_check_id = c.check_id
                        """ + whereClause + """
                        ORDER BY c.created_at DESC, c.check_id DESC
                        LIMIT :limit OFFSET :offset
                        """), normalizedRecordType, normalizedStatus, normalizedResponsibilityType, orderId)
                .param("limit", safeSize)
                .param("offset", offset);

        List<QualityRecordResponse> items = dataSpec.query((rs, rowNum) -> new QualityRecordResponse(
                        rs.getLong("check_id"),
                        rs.getString("check_type"),
                        rs.getLong("order_id"),
                        rs.getString("order_no"),
                        rs.getString("product_type"),
                        rs.getString("clinic_name"),
                        rs.getLong("check_id"),
                        rs.getString("result"),
                        rs.getObject("rework_id", Long.class),
                        rs.getString("reason_category"),
                        rs.getString("reason_detail"),
                        rs.getString("responsibility_type"),
                        rs.getString("status"),
                        rs.getObject("created_at", LocalDateTime.class),
                        rs.getObject("updated_at", LocalDateTime.class)))
                .list();

        long total = bindFilters(jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM check_record c
                        LEFT JOIN rework_record r ON r.source_check_id = c.check_id
                        """ + whereClause), normalizedRecordType, normalizedStatus, normalizedResponsibilityType, orderId)
                .query(Long.class)
                .single();
        return new OrderListResponse<>(items, total, safePage, safeSize);
    }

    @Transactional
    public QualityRecordResponse createExternalReturn(
            BootstrapIdentity identity, ExternalReturnQualityRecordRequest request) {
        accessControlService.requireAnyRole(
                identity, java.util.EnumSet.of(UserRole.ADMIN, UserRole.CS), "external return registration is CS/ADMIN only");
        if (request.orderId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "order_id is required");
        }
        String reasonCategory = normalizeRequired(request.reasonCategory(), "reason_category");
        String responsibilityType = normalizeRequired(request.responsibilityType(), "responsibility_type");
        String reasonDetail = normalizeRequired(request.reasonDetail(), "reason_detail");
        requireActiveDictionaryValue(reasonCategory, REASON_CATEGORY, "unsupported reason_category");
        requireActiveDictionaryValue(responsibilityType, RESPONSIBILITY_TYPE, "unsupported responsibility_type");
        requireOrder(request.orderId());

        jdbcClient.sql("""
                        INSERT INTO check_record
                            (order_id, node_instance_id, check_type, result, checker_user_id, note)
                        VALUES
                            (:orderId, NULL, :checkType, 'FAIL', :checkerUserId, :note)
                        """)
                .param("orderId", request.orderId())
                .param("checkType", EXTERNAL_RETURN)
                .param("checkerUserId", identity.userId())
                .param("note", reasonDetail)
                .update();
        long checkId = lastInsertId();

        jdbcClient.sql("""
                        INSERT INTO rework_record
                            (order_id, source_check_id, reason_category, reason_detail, responsibility_type, status)
                        VALUES
                            (:orderId, :sourceCheckId, :reasonCategory, :reasonDetail, :responsibilityType, 'PENDING')
                        """)
                .param("orderId", request.orderId())
                .param("sourceCheckId", checkId)
                .param("reasonCategory", reasonCategory)
                .param("reasonDetail", reasonDetail)
                .param("responsibilityType", responsibilityType)
                .update();
        return requireQualityRecord(checkId);
    }

    private QualityRecordResponse requireQualityRecord(long checkId) {
        try {
            return jdbcClient.sql("""
                            SELECT
                                c.check_id,
                                c.check_type,
                                c.result,
                                c.created_at,
                                o.order_id,
                                o.order_no,
                                o.product_type,
                                cl.clinic_name,
                                r.rework_id,
                                r.reason_category,
                                r.reason_detail,
                                r.responsibility_type,
                                r.status,
                                r.updated_at
                            FROM check_record c
                            JOIN orders o ON o.order_id = c.order_id
                            JOIN clinic cl ON cl.clinic_id = o.clinic_id
                            LEFT JOIN rework_record r ON r.source_check_id = c.check_id
                            WHERE c.check_id = :checkId
                            """)
                    .param("checkId", checkId)
                    .query((rs, rowNum) -> new QualityRecordResponse(
                            rs.getLong("check_id"),
                            rs.getString("check_type"),
                            rs.getLong("order_id"),
                            rs.getString("order_no"),
                            rs.getString("product_type"),
                            rs.getString("clinic_name"),
                            rs.getLong("check_id"),
                            rs.getString("result"),
                            rs.getObject("rework_id", Long.class),
                            rs.getString("reason_category"),
                            rs.getString("reason_detail"),
                            rs.getString("responsibility_type"),
                            rs.getString("status"),
                            rs.getObject("created_at", LocalDateTime.class),
                            rs.getObject("updated_at", LocalDateTime.class)))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "quality record not found", ex);
        }
    }

    private JdbcClient.StatementSpec bindFilters(
            JdbcClient.StatementSpec spec,
            String recordType,
            String status,
            String responsibilityType,
            Long orderId) {
        if (recordType != null) {
            spec = spec.param("recordType", recordType);
        }
        if (status != null) {
            spec = spec.param("status", status);
        }
        if (responsibilityType != null) {
            spec = spec.param("responsibilityType", responsibilityType);
        }
        if (orderId != null) {
            spec = spec.param("orderId", orderId);
        }
        return spec;
    }

    private void requireOrder(long orderId) {
        boolean exists = jdbcClient.sql("SELECT COUNT(*) FROM orders WHERE order_id = :orderId")
                .param("orderId", orderId)
                .query(Long.class)
                .single() > 0;
        if (!exists) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "order not found");
        }
    }

    private void requireActiveDictionaryValue(String value, String dictionaryType, String message) {
        boolean exists = jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM rework_dictionary_item
                        WHERE dictionary_type = :dictionaryType
                          AND item_code = :itemCode
                          AND status = 'ACTIVE'
                        """)
                .param("dictionaryType", dictionaryType)
                .param("itemCode", value)
                .query(Long.class)
                .single() > 0;
        if (!exists) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private String normalizeRequired(String value, String fieldName) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim().toUpperCase(Locale.ROOT);
    }

    private long lastInsertId() {
        return jdbcClient.sql("SELECT LAST_INSERT_ID()")
                .query(Long.class)
                .single();
    }
}
