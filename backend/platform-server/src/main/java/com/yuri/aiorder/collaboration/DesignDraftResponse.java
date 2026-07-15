package com.yuri.aiorder.collaboration;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record DesignDraftResponse(
        @JsonProperty("draft_id") long draftId,
        @JsonProperty("order_id") long orderId,
        int version,
        @JsonProperty("uploader_user_id") Long uploaderUserId,
        @JsonProperty("file_id") Long fileId,
        @JsonProperty("file_ids") List<Long> fileIds,
        @JsonProperty("file_count") int fileCount,
        String status,
        @JsonProperty("cs_reject_reason") String csRejectReason,
        @JsonProperty("doctor_reject_reason") String doctorRejectReason) {
}
