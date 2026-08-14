package com.yuri.aiorder.order.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record DeleteDraftOrdersRequest(
        @JsonProperty("order_ids")
        @NotEmpty
        @Size(max = 50)
        List<Long> orderIds) {
}
