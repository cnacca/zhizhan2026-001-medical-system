package com.yuri.aiorder.workflow.runtime;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record AssignmentRequest(List<AssignmentItem> assignments) {

    public record AssignmentItem(
            @JsonProperty("node_instance_id") long nodeInstanceId,
            @JsonProperty("user_id") long userId) {
    }
}
