package com.yuri.aiorder.order.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record OrderSupplementCreateRequest(
        @NotEmpty @JsonProperty("file_ids") List<Long> fileIds,
        @Size(max = 64) @JsonProperty("material_type") String materialType,
        @Size(max = 16) @JsonProperty("attachment_scope") String attachmentScope,
        @JsonProperty("product_order_id") Long productOrderId,
        @Size(max = 500) String note) {
}
