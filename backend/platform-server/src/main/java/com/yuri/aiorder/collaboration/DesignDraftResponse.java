package com.yuri.aiorder.collaboration;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DesignDraftResponse(
        @JsonProperty("draft_id") long draftId,
        @JsonProperty("order_id") long orderId,
        int version,
        @JsonProperty("uploader_user_id") Long uploaderUserId,
        @JsonProperty("file_id") Long fileId,
        String status) {
}
