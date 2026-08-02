# 客服工作台待办与跨端沟通中心 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将客服端“需要关注”改为独立、可处理的待办区，并让四端通过订单沟通中心发送消息、`@` 当前订单参与人并收到可进入会话的通知。

**Architecture:** 复用现有订单消息、通知事件与通知中心。后端为消息增加受订单参与人范围限制的提及收件人，并将提及状态作为待办来源；前端把工作台的待办区消费该来源，同时把现有客服协同页泛化为四端共用的沟通中心。

**Tech Stack:** Vue 3、Element Plus、Spring Boot、JdbcClient、Flyway、JUnit、Playwright。

## Global Constraints

- 保留客服端现有九宫格统计卡片的布局、数值与交互；卡片标题使用“信息评审”。
- “需要关注”不重复展示上方统计卡片的待审、翻译待审、待回复、设计更新、延期提醒、账单超期或投诉返工数据。
- `@` 仅允许当前订单的医生、客服及已指派生产人员；不得向无订单访问权限的用户暴露人员或订单信息。
- 生产端发给医生的消息继续遵守客服审核；审核前不得给医生发送提及通知。
- 待办完成后从当前用户的待办列表消失，数量随之减少；Task 8 保持 `NOT_READY`。

---

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

### Task 2: 四端共用沟通中心与通知跳转

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/styles.css`
- Test: `scripts/smoke-customer-attention-and-collaboration.spec.mjs`

**Interfaces:**
- Consumes: Task 1 message, mentionable-user, attention-list, and resolve endpoints.
- Produces: `/collaboration` as a shared route for doctor、客服、生产和管理端；notification click opens the corresponding order conversation.

- [ ] **Step 1: Write the failing browser smoke**

```js
await page.getByTestId('portal-card-cs').click()
await page.getByTestId('login-submit').click()
await expect(page.getByTestId('customer-attention-panel')).toBeVisible()
await page.getByTestId('customer-attention-item').first().click()
await expect(page.getByTestId('collaboration-composer')).toBeVisible()
```

The test must also assert that the attention panel does not contain `资料初审` or `翻译待审`, and that the composer exposes a mention selector.

- [ ] **Step 2: Run the browser smoke and verify it fails**

Run: `pnpm exec playwright test scripts/smoke-customer-attention-and-collaboration.spec.mjs --browser=chromium --workers=1`

Expected: FAIL because no independent attention panel or shared composer exists.

- [ ] **Step 3: Implement the smallest shared interaction**

```ts
const customerAttentionItems = ref<MessageAttentionItem[]>([])
const collaborationMentionableUsers = ref<MentionableUser[]>([])
const collaborationMentionUserIds = ref<number[]>([])

async function resolveAttentionAndOpenConversation(item: MessageAttentionItem) {
  await apiFetch(`/messages/attention-items/${item.message_id}/resolve`, { method: 'POST' })
  customerCollaborationOrderId.value = String(item.order_id)
  activeRoute.value = '/collaboration'
  await loadCustomerCollaborationOrderMessages()
}
```

Keep the existing metric grid intact. Render a separate `data-testid="customer-attention-panel"` below it, showing at most three unresolved mention items and a “查看全部” state. Reuse `/collaboration` for every portal, show review controls only to customer service and administrators, and show a message composer plus mention selector to every authorized portal. Clicking a mention notification marks it read and opens the linked order conversation.

- [ ] **Step 4: Run the browser smoke and frontend build**

Run: `pnpm exec playwright test scripts/smoke-customer-attention-and-collaboration.spec.mjs --browser=chromium --workers=1`

Expected: PASS.

Run: `pnpm --filter ai-order-platform-frontend build`

Expected: PASS.

### Task 3: Regression checks and real interaction path

**Files:**
- Modify: `package.json`
- Modify: `scripts/check-task-9d58-customer-collaboration.mjs`
- Modify: `scripts/smoke-task-9d24-four-portal-login.spec.mjs`

**Interfaces:**
- Consumes: Tasks 1 and 2.
- Produces: a repeatable structural check and four-portal navigation coverage for the shared communication center.

- [ ] **Step 1: Extend the existing structural check**

```js
const required = [
  'message-mentionable-users',
  'messages/attention-items',
  'customer-attention-panel',
  'collaboration-composer',
  'MESSAGE_MENTIONED'
]
```

- [ ] **Step 2: Add a package script and run it**

Run: `npm run check:task9d58`

Expected: PASS and confirms that attention and mention implementations remain wired.

- [ ] **Step 3: Verify the real interaction path**

Run: `npm run smoke:task9d24`

Expected: PASS after each portal can navigate to its communication-center entry without changing its portal shell.

- [ ] **Step 4: Review scope and whitespace**

Run: `git diff --check`

Expected: PASS; only the mention/attention and collaboration-center implementation files change.
