package com.yuri.aiorder.workflow.runtime;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ReassignRequest(
        @JsonProperty("new_user_id") long newUserId,
        String reason) {
}
