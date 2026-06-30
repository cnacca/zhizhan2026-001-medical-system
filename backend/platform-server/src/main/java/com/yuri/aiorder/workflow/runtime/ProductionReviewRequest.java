package com.yuri.aiorder.workflow.runtime;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

public record ProductionReviewRequest(
        String action,
        @JsonProperty("chain_id") Long chainId,
        @JsonProperty("intake_branch") String intakeBranch,
        @JsonProperty("branch_params") JsonNode branchParams,
        @JsonProperty("reject_reason") String rejectReason) {
}
