package com.yuri.aiorder.order.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;

public record OrderInternalDTO(
        @JsonProperty("order_id") long orderId,
        @JsonProperty("order_no") String orderNo,
        @JsonProperty("clinic_id") long clinicId,
        @JsonProperty("clinic_name") String clinicName,
        @JsonProperty("doctor_user_id") Long doctorUserId,
        @JsonProperty("doctor_name") String doctorName,
        @JsonProperty("patient_id") Long patientId,
        @JsonProperty("patient_name") String patientName,
        @JsonProperty("cs_user_id") Long csUserId,
        @JsonProperty("product_type") String productType,
        @JsonProperty("internal_status") String internalStatus,
        @JsonProperty("external_status") String externalStatus,
        @JsonProperty("production_note") String productionNote,
        @JsonProperty("reject_reason") String rejectReason,
        @JsonProperty("form_schema_snapshot") JsonNode formSchemaSnapshot,
        @JsonProperty("form_data") JsonNode formData,
        @JsonProperty("created_at") LocalDateTime createdAt,
        @JsonProperty("updated_at") LocalDateTime updatedAt) {
}
