package com.yuri.aiorder.workflow.execution;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public record ReworkRecordResponse(
        @JsonProperty("rework_id") long reworkId,
        @JsonProperty("order_id") long orderId,
        @JsonProperty("order_no") String orderNo,
        @JsonProperty("source_check_id") long sourceCheckId,
        @JsonProperty("from_node_instance_id") Long fromNodeInstanceId,
        @JsonProperty("from_process_name") String fromProcessName,
        @JsonProperty("target_node_instance_id") Long targetNodeInstanceId,
        @JsonProperty("target_process_name") String targetProcessName,
        @JsonProperty("target_node_status") String targetNodeStatus,
        @JsonProperty("assigned_user_id") Long assignedUserId,
        @JsonProperty("reason_detail") String reasonDetail,
        String status,
        @JsonProperty("created_at") LocalDateTime createdAt) {
}
