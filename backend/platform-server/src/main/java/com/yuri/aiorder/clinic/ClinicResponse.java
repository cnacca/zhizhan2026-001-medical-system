package com.yuri.aiorder.clinic;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public record ClinicResponse(
        @JsonProperty("clinic_id") long clinicId,
        @JsonProperty("clinic_name") String clinicName,
        @JsonProperty("contact_name") String contactName,
        @JsonProperty("contact_phone") String contactPhone,
        String status,
        @JsonProperty("preference_count") long preferenceCount,
        @JsonProperty("created_at") LocalDateTime createdAt,
        @JsonProperty("updated_at") LocalDateTime updatedAt) {}
