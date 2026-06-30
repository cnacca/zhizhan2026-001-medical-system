package com.yuri.aiorder.workflow.runtime;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ProcessNodeResponse(
        @JsonProperty("node_instance_id") long nodeInstanceId,
        @JsonProperty("node_code") String nodeCode,
        @JsonProperty("process_name") String processName,
        @JsonProperty("step_order") int stepOrder,
        @JsonProperty("is_optional") int isOptional,
        @JsonProperty("branch_group") String branchGroup,
        @JsonProperty("assigned_user_id") Long assignedUserId,
        @JsonProperty("node_status") String nodeStatus,
        @JsonProperty("standard_duration") Integer standardDuration) {
}
