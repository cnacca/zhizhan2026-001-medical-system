package com.yuri.aiorder.patient;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record CreatePatientRequest(
        @JsonProperty("patient_name") @NotBlank String patientName,
        @JsonProperty("patient_age") Integer patientAge,
        @JsonProperty("patient_gender") String patientGender,
        @JsonProperty("oral_description") String oralDescription) {
}
