# 生产看板未完成订单结转 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让生产看板按订单展示截至选中日期的累计未完成存量，并让当日完成订单在次日退出。

**Architecture:** 后端 `/production/kanban` 作为日期快照的唯一口径，按订单去重计算未完成、当日完成、超时、待问和内返。前端继续复用现有订单与流程读取，但根据后端返回的可见订单 ID 过滤卡片，使顶部数字与下方列一致。

**Tech Stack:** Spring Boot 3.5, JdbcClient, MySQL 8, JUnit 5/MockMvc, Vue 3, TypeScript.

## Global Constraints

- 统计单位是订单，不是节点。
- 前一日未完成订单必须结转到后一日。
- 当日完成订单在完成日保留，次日退出。
- 保留 WORKER SELF 与 ADMIN/CS ALL 的现有 DataScope。
- 不删除历史订单、工时、返工、设计稿或审计数据。

---

### Task 1: 后端滚动积压快照

**Files:**
- Modify: `backend/platform-server/src/test/java/com/yuri/aiorder/workflow/runtime/WorkflowRuntimeTests.java`
- Modify: `backend/platform-server/src/main/java/com/yuri/aiorder/workflow/runtime/ProductionKanbanSummaryResponse.java`
- Modify: `backend/platform-server/src/main/java/com/yuri/aiorder/workflow/runtime/WorkflowRuntimeService.java`

**Interfaces:**
- Consumes: `GET /production/kanban?date=YYYY-MM-DD`
- Produces: `ProductionKanbanSummaryResponse.visibleOrderIds()` 和按订单去重的 `stages`

- [ ] **Step 1: Write the failing carryover test**

在 `WorkflowRuntimeTests` 构造一个前一日开始但未完成的订单，断言它在次日的 `visible_order_ids` 和工段 `unfinished_count` 中仍存在。

- [ ] **Step 2: Run the test and verify RED**

Run: `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=WorkflowRuntimeTests#productionKanbanCarriesUnfinishedOrdersForwardAndDropsThemTheDayAfterCompletion test`

Expected: FAIL because `visible_order_ids` / `unfinished_count` 尚未实现。

- [ ] **Step 3: Implement the order snapshot query**

将节点级直接 `SUM` 改为按 `order_id` 去重的快照查询：纳入截至 `asOf` 仍未完成的订单，以及 `completed_at >= startAt AND completed_at < endExclusive` 的当日完成订单；返回同一查询口径下的 `visible_order_ids`。

- [ ] **Step 4: Verify GREEN and DataScope regression**

Run: `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=WorkflowRuntimeTests test`

Expected: PASS; WORKER 不能读取非本人订单。

### Task 2: 前端统一统计与卡片

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `scripts/check-production-board-reference-clone.mjs`

**Interfaces:**
- Consumes: `ProductionKanbanSummaryResponse.visible_order_ids` and stage `unfinished_count`
- Produces: 同一日期快照下的顶部统计、工段列和订单卡片

- [ ] **Step 1: Extend the static regression check and verify RED**

断言 `App.vue` 消费 `visible_order_ids`，且工段指标文案为“未完成”。

- [ ] **Step 2: Implement minimal frontend filtering**

扩展 `ProductionKanbanSummaryResponse` TypeScript 类型，在 `loadProductionBoardKanbanSummary()` 保存可见订单 ID，并让 `visibleProductionBoardOrders` 按该集合过滤；日期变化后同时刷新统计和卡片。

- [ ] **Step 3: Verify frontend checks**

Run: `npm run check:production-board-reference-clone && npm run check:production-kanban-redesign && npm run build:frontend`

Expected: PASS.

### Task 3: 真实浏览器日期结转验收

**Files:**
- Verify only: `frontend/src/App.vue`

**Interfaces:**
- Consumes: 本地生产端页面与已启动后端
- Produces: 前一日、当日和完成次日的可见性证据

- [ ] **Step 1: Open the production Kanban as WORKER**
- [ ] **Step 2: Select consecutive dates and verify unfinished carryover**
- [ ] **Step 3: Complete one local demo order and verify completion-day visibility**
- [ ] **Step 4: Select the next day and verify the completed order exits**
- [ ] **Step 5: Run `git diff --check` and record remaining warnings**
