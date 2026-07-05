package com.yuri.aiorder.clinic;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record CreateClinicRequest(
        @JsonProperty("clinic_name") @NotBlank String clinicName,
        @JsonProperty("contact_name") String contactName,
        @JsonProperty("contact_phone") String contactPhone) {}
