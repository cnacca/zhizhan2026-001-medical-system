package com.yuri.aiorder.order.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OrderCancellationRequest(
        @NotBlank
        @Size(min = 2, max = 500)
        String reason) {
}
