package com.yuri.aiorder.workflow.execution;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public record FinalInspectionReportResponse(
        @JsonProperty("report_id") long reportId,
        @JsonProperty("order_id") long orderId,
        @JsonProperty("report_no") String reportNo,
        @JsonProperty("final_node_instance_id") long finalNodeInstanceId,
        @JsonProperty("final_check_id") long finalCheckId,
        String conclusion,
        String summary,
        @JsonProperty("inspector_user_id") Long inspectorUserId,
        String status,
        @JsonProperty("created_at") LocalDateTime createdAt) {
}
