package com.yuri.aiorder.collaboration;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MessageResponse(
        @JsonProperty("msg_id") long msgId,
        @JsonProperty("order_id") long orderId,
        @JsonProperty("sender_user_id") Long senderUserId,
        @JsonProperty("sender_role") String senderRole,
        String content,
        @JsonProperty("visible_to") String visibleTo,
        @JsonProperty("review_status") String reviewStatus) {
}
