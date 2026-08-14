package com.yuri.aiorder.order.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record DeleteDraftOrdersResponse(
        @JsonProperty("deleted_count") int deletedCount,
        @JsonProperty("order_ids") List<Long> orderIds) {
}
