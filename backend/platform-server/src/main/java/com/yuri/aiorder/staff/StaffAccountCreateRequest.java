package com.yuri.aiorder.staff;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record StaffAccountCreateRequest(
        @NotBlank String username,
        @NotBlank @JsonProperty("initial_password") String initialPassword,
        @NotBlank @JsonProperty("display_name") String displayName,
        @NotNull @JsonProperty("dept_id") Long deptId,
        @NotNull @JsonProperty("post_id") Long postId) {
}
