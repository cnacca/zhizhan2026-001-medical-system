package com.yuri.aiorder.workflow.runtime;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record ProcessInstanceResponse(
        @JsonProperty("instance_id") long instanceId,
        @JsonProperty("order_id") long orderId,
        @JsonProperty("instance_status") String instanceStatus,
        List<ProcessNodeResponse> nodes,
        List<ProcessEdgeResponse> edges) {
}
