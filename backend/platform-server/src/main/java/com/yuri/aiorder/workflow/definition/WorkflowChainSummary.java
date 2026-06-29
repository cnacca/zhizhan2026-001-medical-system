package com.yuri.aiorder.workflow.definition;

import com.fasterxml.jackson.annotation.JsonProperty;

public record WorkflowChainSummary(
        @JsonProperty("chain_id") long chainId,
        @JsonProperty("chain_name") String chainName,
        @JsonProperty("intake_branch") String intakeBranch,
        int status) {
}
