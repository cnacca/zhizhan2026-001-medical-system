package com.yuri.aiorder.workflow.execution;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public record ProductionQualitySummaryResponse(
        @JsonProperty("product_type") String productType,
        @JsonProperty("inspected_order_count") long inspectedOrderCount,
        @JsonProperty("total_rework_count") long totalReworkCount,
        @JsonProperty("internal_rework_count") long internalReworkCount,
        @JsonProperty("external_rework_count") long externalReworkCount,
        @JsonProperty("unclassified_rework_count") long unclassifiedReworkCount,
        @JsonProperty("total_rework_rate") double totalReworkRate,
        @JsonProperty("internal_rework_rate") double internalReworkRate,
        @JsonProperty("external_rework_rate") double externalReworkRate,
        @JsonProperty("first_pass_rate") double firstPassRate,
        @JsonProperty("final_pass_rate") double finalPassRate,
        @JsonProperty("complaint_rate") double complaintRate,
        @JsonProperty("return_rate") double returnRate,
        @JsonProperty("generated_at") LocalDateTime generatedAt) {
}
