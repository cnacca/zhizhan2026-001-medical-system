package com.yuri.aiorder.workflow.runtime;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

public record AssignmentCandidateResponse(
        @JsonProperty("user_id") @JsonSerialize(using = ToStringSerializer.class) long userId,
        @JsonProperty("display_name") String displayName,
        @JsonProperty("dept_id") Long deptId,
        @JsonProperty("dept_name") String deptName,
        @JsonProperty("active_node_count") long activeNodeCount) {
}
