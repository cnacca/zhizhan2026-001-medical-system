package com.yuri.aiorder.collaboration;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DesignDraftReviewRequest(
        String action,
        @JsonProperty("cs_reject_reason") String csRejectReason) {
}
