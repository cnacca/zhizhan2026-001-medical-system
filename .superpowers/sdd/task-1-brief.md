### Task 1: 后端订单参与人提及与待办 API

**Files:**
- Create: `backend/platform-server/src/main/resources/db/migration/V38__order_message_mentions.sql`
- Create: `backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/MentionableUserResponse.java`
- Create: `backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/MessageAttentionItemResponse.java`
- Modify: `backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/MessageRequest.java`
- Modify: `backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/MessageResponse.java`
- Modify: `backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/CollaborationController.java`
- Modify: `backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/CollaborationService.java`
- Test: `backend/platform-server/src/test/java/com/yuri/aiorder/collaboration/MessageDesignBillNotificationTests.java`

**Interfaces:**
- Consumes: `POST /orders/{orderId}/messages` with optional JSON `mention_user_ids: number[]`.
- Produces: `GET /orders/{orderId}/message-mentionable-users`, `GET /messages/attention-items`, and `POST /messages/attention-items/{messageId}/resolve`.
- Produces: `MessageResponse.mention_user_ids` so every portal can render persisted mentions.

- [ ] **Step 1: Write failing backend tests**

```java
mockMvc.perform(post("/orders/{orderId}/messages", orderId)
        .header("X-Bootstrap-Role", "CS")
        .header("X-Bootstrap-User-Id", CS_USER_ID)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"content\":\"请确认交期\",\"mention_user_ids\":[" + DOCTOR_USER_ID + "]}"))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.data.mention_user_ids[0]").value(DOCTOR_USER_ID));

mockMvc.perform(get("/messages/attention-items")
        .header("X-Bootstrap-Role", "DOCTOR")
        .header("X-Bootstrap-User-Id", DOCTOR_USER_ID))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.data[0].message_id").isNumber());
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `scripts/with-jdk21.sh mvn -f backend/platform-server/pom.xml -Dtest=MessageDesignBillNotificationTests test`

Expected: FAIL because `mention_user_ids` and the attention endpoint do not exist.

- [ ] **Step 3: Add minimal persistence and scope checks**

```sql
CREATE TABLE order_message_mention (
  message_id BIGINT NOT NULL,
  mentioned_user_id BIGINT NOT NULL,
  resolved_at DATETIME(3) NULL,
  PRIMARY KEY (message_id, mentioned_user_id),
  KEY idx_order_message_mention_user_open (mentioned_user_id, resolved_at),
  CONSTRAINT fk_order_message_mention_message FOREIGN KEY (message_id) REFERENCES order_message(message_id),
  CONSTRAINT fk_order_message_mention_user FOREIGN KEY (mentioned_user_id) REFERENCES system_user(user_id)
);
```

Validate each recipient against the order doctor, assigned customer-service user, and process-node assignees; exclude the sender. Persist mentions with the message. Emit `MESSAGE_MENTIONED` user notifications immediately for direct messages and only after approval for production messages. Return only the current user’s unresolved, visible mentions from the attention endpoint; resolving must update only that user’s mention record.

- [ ] **Step 4: Run the focused backend test and verify it passes**

Run: `scripts/with-jdk21.sh mvn -f backend/platform-server/pom.xml -Dtest=MessageDesignBillNotificationTests test`

Expected: PASS with mention persistence, notification, attention listing, and resolution coverage.

