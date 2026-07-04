package com.yuri.aiorder.workflow.execution;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record FinalInspectionReportRequest(
        @JsonProperty("order_id") Long orderId,
        String summary,
        @JsonProperty("attachment_file_ids") List<Long> attachmentFileIds) {
}
