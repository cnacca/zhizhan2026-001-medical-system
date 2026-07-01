package com.yuri.aiorder.workflow.execution;

import com.fasterxml.jackson.annotation.JsonProperty;

public record FinalInspectionReportRequest(
        @JsonProperty("order_id") Long orderId,
        String summary) {
}
