package com.yuri.aiorder.order.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public record OrderSupplementResponse(
        @JsonProperty("supplement_id") long supplementId,
        @JsonProperty("order_id") long orderId,
        @JsonProperty("file_id") long fileId,
        @JsonProperty("original_filename") String originalFilename,
        @JsonProperty("content_type") String contentType,
        @JsonProperty("file_size") Long fileSize,
        @JsonProperty("material_type") String materialType,
        @JsonProperty("attachment_scope") String attachmentScope,
        @JsonProperty("product_order_id") Long productOrderId,
        String note,
        @JsonProperty("display_note") String displayNote,
        @JsonProperty("version_no") int versionNo,
        @JsonProperty("approval_status") String approvalStatus,
        @JsonProperty("uploaded_by_user_id") long uploadedByUserId,
        @JsonProperty("approved_by_user_id") Long approvedByUserId,
        @JsonProperty("approved_at") LocalDateTime approvedAt,
        @JsonProperty("created_at") LocalDateTime createdAt) {
}
