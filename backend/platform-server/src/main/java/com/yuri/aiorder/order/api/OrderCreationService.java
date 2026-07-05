package com.yuri.aiorder.order.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.auth.AccessControlService;
import com.yuri.aiorder.order.status.InternalOrderStatus;
import com.yuri.aiorder.order.status.OrderStatusService;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderCreationService {

    private static final Set<String> DOCTOR_VISIBLE_FILE_VISIBILITIES = Set.of("DOCTOR", "DOCTOR_CS", "ALL");

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;
    private final AccessControlService accessControlService;
    private final OrderStatusService statusService;

    public OrderCreationService(
            JdbcClient jdbcClient,
            ObjectMapper objectMapper,
            AccessControlService accessControlService,
            OrderStatusService statusService) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
        this.accessControlService = accessControlService;
        this.statusService = statusService;
    }

    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest request, BootstrapIdentity identity) {
        accessControlService.requireDoctorOnly(identity, "only doctors can create orders");
        accessControlService.requireScopedIdentity(identity, "CLINIC");

        String productType = normalizeProductType(request.productType());
        boolean draft = Boolean.TRUE.equals(request.draft());
        validateFormData(productType, request.formData(), !draft);
        validateOwnedPatient(request.patientId(), identity);
        List<Long> fileIds = normalizedFileIds(request.fileIds());
        fileIds.forEach((fileId) -> validateBindableDoctorFile(fileId, identity, null));

        String orderNo = nextOrderNo();
        jdbcClient.sql("""
                        INSERT INTO orders
                            (order_no, clinic_id, doctor_user_id, patient_id, product_type, form_data,
                             internal_status, external_status)
                        VALUES
                            (:orderNo, :clinicId, :doctorUserId, :patientId, :productType, CAST(:formData AS JSON),
                             'DRAFT', 'DRAFT')
                        """)
                .param("orderNo", orderNo)
                .param("clinicId", identity.clinicId())
                .param("doctorUserId", identity.userId())
                .param("patientId", request.patientId())
                .param("productType", productType)
                .param("formData", writeJson(request.formData()))
                .update();
        long orderId = jdbcClient.sql("SELECT order_id FROM orders WHERE order_no = :orderNo")
                .param("orderNo", orderNo)
                .query(Long.class)
                .single();

        bindFilesToOrder(orderId, fileIds);

        if (draft) {
            return new CreateOrderResponse(orderId, orderNo, productType, "DRAFT", request.formData());
        }

        String externalStatus = statusService.updateOrderState(
                        orderId,
                        InternalOrderStatus.PENDING_CS_REVIEW,
                        "DOCTOR_SUBMIT_ORDER",
                        identity.userId(),
                        "doctor submitted order")
                .name();
        return new CreateOrderResponse(orderId, orderNo, productType, externalStatus, request.formData());
    }

    @Transactional
    public CreateOrderResponse updateDoctorOrder(long orderId, UpdateOrderRequest request, BootstrapIdentity identity) {
        accessControlService.requireDoctorOnly(identity, "only doctors can update orders");
        accessControlService.requireScopedIdentity(identity, "CLINIC");

        DoctorEditableOrder order = loadDoctorEditableOrder(orderId, identity);
        boolean submit = Boolean.TRUE.equals(request.submit());
        String productType = normalizeProductType(request.productType());
        validateEditableStatus(order.internalStatus(), submit);
        validateFormData(productType, request.formData(), submit);
        validateOwnedPatient(request.patientId(), identity);
        List<Long> fileIds = normalizedFileIds(request.fileIds());
        fileIds.forEach((fileId) -> validateBindableDoctorFile(fileId, identity, orderId));

        jdbcClient.sql("""
                        UPDATE orders
                        SET product_type = :productType,
                            patient_id = :patientId,
                            form_data = CAST(:formData AS JSON),
                            reject_reason = CASE WHEN :submit THEN NULL ELSE reject_reason END
                        WHERE order_id = :orderId
                        """)
                .param("productType", productType)
                .param("patientId", request.patientId())
                .param("formData", writeJson(request.formData()))
                .param("submit", submit)
                .param("orderId", orderId)
                .update();
        bindFilesToOrder(orderId, fileIds);

        String externalStatus = order.externalStatus();
        if (submit) {
            String eventType = "DRAFT".equals(order.internalStatus())
                    ? "DOCTOR_SUBMIT_ORDER"
                    : "DOCTOR_RESUBMIT_ORDER";
            externalStatus = statusService.updateOrderState(
                            orderId,
                            InternalOrderStatus.PENDING_CS_REVIEW,
                            eventType,
                            identity.userId(),
                            "doctor submitted order")
                    .name();
        }
        return new CreateOrderResponse(orderId, order.orderNo(), productType, externalStatus, request.formData());
    }

    private void validateFormData(String productType, JsonNode formData, boolean requireRequiredFields) {
        if (formData == null || !formData.isObject()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "form_data must be an object");
        }
        List<FormFieldRequirement> fields = jdbcClient.sql("""
                        SELECT field_key, required_flag
                        FROM form_field_config
                        WHERE product_type = :productType
                          AND status = 'ACTIVE'
                        ORDER BY sort_order, field_id
                        """)
                .param("productType", productType)
                .query((rs, rowNum) -> new FormFieldRequirement(
                        rs.getString("field_key"),
                        rs.getInt("required_flag") == 1))
                .list();
        if (fields.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "active form config not found");
        }
        for (FormFieldRequirement field : fields) {
            if (requireRequiredFields && field.required() && isMissing(formData.get(field.fieldKey()))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "missing required field: " + field.fieldKey());
            }
        }
    }

    private boolean isMissing(JsonNode value) {
        return value == null
                || value.isNull()
                || (value.isTextual() && value.asText().isBlank())
                || (value.isArray() && value.isEmpty());
    }

    private List<Long> normalizedFileIds(List<Long> fileIds) {
        if (fileIds == null || fileIds.isEmpty()) {
            return List.of();
        }
        return new LinkedHashSet<>(fileIds).stream().toList();
    }

    private void validateBindableDoctorFile(long fileId, BootstrapIdentity identity, Long targetOrderId) {
        try {
            BindableFile file = jdbcClient.sql("""
                            SELECT file_id, order_id, owner_user_id, visibility, upload_status, status
                            FROM file_resource
                            WHERE file_id = :fileId
                            """)
                    .param("fileId", fileId)
                    .query((rs, rowNum) -> new BindableFile(
                            rs.getLong("file_id"),
                            rs.getObject("order_id", Long.class),
                            rs.getObject("owner_user_id", Long.class),
                            rs.getString("visibility"),
                            rs.getString("upload_status"),
                            rs.getString("status")))
                    .single();
            if (!identity.userId().equals(file.ownerUserId())
                    || !DOCTOR_VISIBLE_FILE_VISIBILITIES.contains(file.visibility())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "doctor cannot bind this file");
            }
            if (!"ACTIVE".equals(file.status())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "file is not active");
            }
            if (file.orderId() != null && !file.orderId().equals(targetOrderId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "file is already bound to an order");
            }
            if (!"COMPLETED".equals(file.uploadStatus())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "file upload is not completed");
            }
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "file not found", ex);
        }
    }

    private void validateOwnedPatient(Long patientId, BootstrapIdentity identity) {
        if (patientId == null) {
            return;
        }
        boolean owned = jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM patient_record
                        WHERE patient_id = :patientId
                          AND clinic_id = :clinicId
                          AND doctor_user_id = :doctorUserId
                          AND status = 'ACTIVE'
                        """)
                .param("patientId", patientId)
                .param("clinicId", identity.clinicId())
                .param("doctorUserId", identity.userId())
                .query(Long.class)
                .single() > 0;
        if (!owned) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "doctor cannot bind this patient");
        }
    }

    private void bindFilesToOrder(long orderId, List<Long> fileIds) {
        for (Long fileId : fileIds) {
            jdbcClient.sql("""
                            UPDATE file_resource
                            SET order_id = :orderId,
                                source_type = 'ORDER_ATTACHMENT'
                            WHERE file_id = :fileId
                            """)
                    .param("orderId", orderId)
                    .param("fileId", fileId)
                    .update();
        }
    }

    private DoctorEditableOrder loadDoctorEditableOrder(long orderId, BootstrapIdentity identity) {
        try {
            return jdbcClient.sql("""
                            SELECT order_id, order_no, doctor_user_id, internal_status, external_status
                            FROM orders
                            WHERE order_id = :orderId
                              AND doctor_user_id = :doctorUserId
                              AND clinic_id = :clinicId
                            FOR UPDATE
                            """)
                    .param("orderId", orderId)
                    .param("doctorUserId", identity.userId())
                    .param("clinicId", identity.clinicId())
                    .query((rs, rowNum) -> new DoctorEditableOrder(
                            rs.getLong("order_id"),
                            rs.getString("order_no"),
                            rs.getObject("doctor_user_id", Long.class),
                            rs.getString("internal_status"),
                            rs.getString("external_status")))
                    .single();
        } catch (EmptyResultDataAccessException ex) {
            if (orderExists(orderId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "doctor cannot update this order", ex);
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

    private void validateEditableStatus(String internalStatus, boolean submit) {
        Set<String> editableStatuses = Set.of(
                InternalOrderStatus.DRAFT.name(),
                InternalOrderStatus.CS_REJECTED.name(),
                InternalOrderStatus.PRODUCTION_REJECTED.name());
        if (!editableStatuses.contains(internalStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "order is not editable by doctor");
        }
        if (!submit && !InternalOrderStatus.DRAFT.name().equals(internalStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "rejected orders must be resubmitted");
        }
    }

    private String nextOrderNo() {
        String date = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase(Locale.ROOT);
        return "ORD" + date + "-" + suffix;
    }

    private String normalizeProductType(String productType) {
        return productType.trim().toUpperCase(Locale.ROOT);
    }

    private String writeJson(JsonNode formData) {
        try {
            return objectMapper.writeValueAsString(formData);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid form_data", ex);
        }
    }

    private record FormFieldRequirement(String fieldKey, boolean required) {
    }

    private record BindableFile(
            long fileId,
            Long orderId,
            Long ownerUserId,
            String visibility,
            String uploadStatus,
            String status) {
    }

    private record DoctorEditableOrder(
            long orderId,
            String orderNo,
            Long doctorUserId,
            String internalStatus,
            String externalStatus) {
    }
}
