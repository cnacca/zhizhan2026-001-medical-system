package com.yuri.aiorder.order.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public record OrderCancellationResponse(
        @JsonProperty("request_id") long requestId,
        @JsonProperty("order_id") long orderId,
        @JsonProperty("request_status") String requestStatus,
        @JsonProperty("created_at") LocalDateTime createdAt) {
}
