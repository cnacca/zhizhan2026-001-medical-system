package com.yuri.aiorder.patient;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public record PatientRecordResponse(
        @JsonProperty("patient_id") long patientId,
        @JsonProperty("clinic_id") long clinicId,
        @JsonProperty("doctor_user_id") long doctorUserId,
        @JsonProperty("patient_name") String patientName,
        @JsonProperty("patient_age") Integer patientAge,
        @JsonProperty("patient_gender") String patientGender,
        @JsonProperty("oral_description") String oralDescription,
        @JsonProperty("order_count") long orderCount,
        @JsonProperty("latest_order_at") LocalDateTime latestOrderAt,
        @JsonProperty("created_at") LocalDateTime createdAt,
        @JsonProperty("updated_at") LocalDateTime updatedAt) {
}
