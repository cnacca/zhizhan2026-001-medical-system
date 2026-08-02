# Production Board Action Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the production-board's generic status chips with real-time, grouped action and progress summaries that filter the visible Kanban cards.

**Architecture:** Keep the change inside the existing Vue single-file app. Add a production-board-only summary model derived from the already computed Kanban cards and an in-memory summary filter, leaving `prototypeQueueChips` for the production-review page. Use a focused static acceptance check plus the existing frontend build.

**Tech Stack:** Vue 3, TypeScript, Element Plus, Vite, Node.js static acceptance script.

## Global Constraints

- Do not modify backend API contracts or production-review-page chip behavior.
- Summary counts must derive from `productionBoardKanbanCards`; no fixed display counts.
- All five summary items must be interactive filters and retain the existing date, keyword, and status controls.

---

### Task 1: Add a Failing Acceptance Check

**Files:**
- Create: `scripts/check-production-board-action-summary.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `frontend/src/App.vue` source text.
- Produces: `npm run check:production-board-action-summary`, which exits nonzero until the required production-board-only model and UI fragments exist.

- [x] **Step 1: Write the failing check**

Create a Node script that reads `frontend/src/App.vue` and requires these fragments:

```js
const requiredFragments = [
  "const productionBoardActionSummaryFilter = ref<ProductionBoardActionSummaryKey>('all')",
  'const productionBoardActionSummaryGroups = computed(() =>',
  "label: '工序超时'",
  "label: '返工处理中'",
  "label: '医生待确认'",
  "label: '在制订单'",
  "label: '待派工'",
  'productionBoardActionSummaryFilter.value ===',
  'v-for="group in productionBoardActionSummaryGroups"',
  'v-for="item in group.items"'
]
```

Also fail if the production-board section still renders `v-for="chip in prototypeQueueChips"` or contains `生产异常`.

- [x] **Step 2: Run the check and verify it fails**

Run: `node scripts/check-production-board-action-summary.mjs`

Expected: nonzero exit with a missing required fragment because the production-board-only summary does not yet exist.

### Task 2: Implement the Action Summary Model and Filtering

**Files:**
- Modify: `frontend/src/App.vue:1600-1610`
- Modify: `frontend/src/App.vue:3473-3485`
- Modify: `frontend/src/App.vue:7584-7598`

**Interfaces:**
- Consumes: `productionBoardKanbanCards`, each card's `risk`, `order.internal_status`, `node`, and `syncState`.
- Produces: `productionBoardActionSummaryGroups`, `selectProductionBoardActionSummary`, and a filtered card set used by the board columns.

- [x] **Step 1: Add types and reactive filter state**

Add a union for `all | dispatch | overdue | rework | confirm` and a summary item/group shape. Store the current action filter in `productionBoardActionSummaryFilter`, defaulting to `all`.

- [x] **Step 2: Derive the five real-time summary items**

Compute the items from the unfiltered active cards: `工序超时` matches `risk === 'overdue'`; `返工处理中` matches `risk === 'rework'` or `REWORKING`; `医生待确认` matches confirmation risk or `PENDING_DOCTOR_CONFIRM`; `待派工` matches `PROCESS_INSTANCE_CREATED` with a synchronized process and no current node; `在制订单` includes all active cards.

- [x] **Step 3: Apply the selected action summary filter locally**

Filter the base Kanban cards before building columns. Keep the server status select independent, so changing either control only narrows the current result set. Add `selectProductionBoardActionSummary(key)` to update only the action filter.

- [x] **Step 4: Reset the action filter when a new server status is selected**

Use a small production-board status-change handler that resets the action summary filter to `all` before calling `loadProductionBoardOrders`.

### Task 3: Render and Style the Grouped Controls

**Files:**
- Modify: `frontend/src/App.vue:9645-9657`
- Modify: `frontend/src/styles.css:1148-1195`

**Interfaces:**
- Consumes: `productionBoardActionSummaryGroups` and `productionBoardActionSummaryFilter`.
- Produces: two labelled groups, each with clickable count buttons and active styles.

- [x] **Step 1: Replace the shared fixed chip row in the production-board template**

Render each group label and its item buttons. Bind classes for the item tone and active filter. Remove the shared `prototypeQueueChips` loop only from the production-board route.

- [x] **Step 2: Add compact grouped-summary styles**

Add scoped production-board summary selectors for a wrapping group row, muted group labels, stable-height buttons, and high-contrast risk tones. Preserve existing summary-card and mobile overflow behavior.

### Task 4: Verify the Production-Board Path

**Files:**
- Read: `frontend/src/App.vue`
- Read: `frontend/src/styles.css`
- Run: `scripts/check-production-board-action-summary.mjs`
- Run: `pnpm --filter ai-order-platform-frontend build`

**Interfaces:**
- Consumes: the completed summary model, template, styles, and static check.
- Produces: build evidence and a clean diff.

- [x] **Step 1: Run the action-summary acceptance check**

Run: `npm run check:production-board-action-summary`

Expected: `生产看板待办概览检查通过`.

- [x] **Step 2: Build the frontend**

Run: `pnpm --filter ai-order-platform-frontend build`

Expected: Vue type check and Vite build exit with code 0.

- [x] **Step 3: Verify interaction in the browser**

Open `/production/board` as a production user and confirm the two groups display. Click `工序超时`, `返工处理中`, `医生待确认`, `在制订单`, and `待派工`; each should change the visible Kanban cards without changing the selected date. Confirm the production-review page still uses its existing chips.

- [x] **Step 4: Check the diff**

Run: `git diff --check`

Expected: no output and exit code 0.
