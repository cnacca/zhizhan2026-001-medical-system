package com.yuri.aiorder.order.api;

import jakarta.validation.constraints.Size;

public record OrderSupplementReviewRequest(
        @Size(max = 16) String action,
        @Size(max = 500) String reason) {
}
