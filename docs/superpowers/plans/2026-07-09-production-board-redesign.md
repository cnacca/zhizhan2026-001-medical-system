# Production Board Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the production-side `/production/board` page into a manager-style production dispatch board while preserving the existing menu name, route, data functions, order search, process-instance detail, and shipping gate.

**Architecture:** Keep the implementation scoped to the existing Vue single-file app and existing backend APIs for this phase. The page will transform the current order list into grouped process queues using front-end derived data from `productionBoardOrders` and `productionBoardInstance`, with optional query-param seeding from the dashboard department table. No new backend endpoint is required for this second step.

**Tech Stack:** Vue 3 Composition API, Element Plus, existing `apiFetch`, existing `/orders` and `/orders/{orderId}/process-instance` APIs, local static check scripts, `pnpm build`.

---

## Scope

This plan implements **Step 2: production board main redesign**.

It does:
- Keep menu name `生产看板`.
- Keep route `/production/board`.
- Keep page title `生产看板`.
- Add the main working title `工序队列`.
- Keep production as a single manager-style view, with no worker/supervisor/manager role-specific page split.
- Preserve existing production board capabilities: cross-status order search, selected order detail, process-node progress, logistics shipping form, and the final-inspection shipping gate.
- Reuse the current `factory-portal.html` visual language: white cards, light gray borders, subtle shadow, teal primary color, orange/red risk color, compact back-office density.

It does not:
- Add drag-and-drop scheduling.
- Add WebSocket realtime refresh.
- Add a new backend aggregation API.
- Add new route/menu/permission names.
- Delete the existing order list/detail logic.
- Rebuild production task execution, inspection, rework, or shipping flows.

## Current Code Map

**Primary file**
- Modify: `frontend/src/App.vue`
  - State currently lives near `productionBoardOrders`, `productionBoardStatus`, `productionBoardInstance`, `productionBoardKeyword`.
  - Production board route block starts at `v-else-if="isProductionBoardRoute"`.
  - Existing functions include `loadProductionBoardOrders`, `selectProductionBoardOrder`, `loadProductionBoardInstance`, and `shipProductionBoardOrder`.

**Style file**
- Modify: `frontend/src/styles.css`
  - Add scoped styles for the redesigned board workspace, queue columns, order cards, filter bar, and detail panel.

**Checks**
- Modify: `scripts/check-task-9d8-frontend.mjs`
  - Keep the existing first-increment checks.
  - Add checks for the redesigned terms and CSS hooks.

**Optional browser smoke**
- Create: `scripts/smoke-production-board-redesign.spec.mjs`
  - Only if a local browser smoke is practical in the implementation round.
  - Validate that the production board renders the queue shell and still supports selecting an order.

---

## Design Decisions

1. **Route and naming**
   - Left menu stays `生产看板`.
   - Route stays `/production/board`.
   - Page heading stays `生产看板`.
   - Main board title becomes `工序队列`.

2. **Page structure**
   - Top: compact summary and filter area.
   - Middle: process queue board.
   - Right: selected order detail and process-node progress.
   - Existing shipping form remains in the detail area.

3. **Queue grouping**
   - Use a fixed department/process definition on the frontend for this step:
     - 数据处理
     - CAD
     - 种植
     - 车金切削
     - 3D打印
     - 车瓷
     - 上瓷上釉
     - 钢托
     - 胶托
     - 隐形
     - 正畸
     - 质检
     - 包装出货
   - Because existing `/orders` list data does not reliably expose each current process department, assign orders to queue buckets with a conservative helper:
     - If selected order has process-node detail, use current active node names when available.
     - Otherwise infer from product type/status text.
     - Fall back to `数据处理`.
   - This keeps Step 2 visual/interaction-focused without adding a backend endpoint.

4. **Dashboard linkage preparation**
   - The route may accept `department` query param later.
   - Implement support in Step 2 so `/production/board?department=CAD` preselects the CAD queue filter when possible.
   - Workbench click-to-board wiring can be done after the board accepts the parameter.

5. **No role split**
   - The production board presents a manager-style overview for the production side.
   - Do not render different boards for worker, supervisor, or manager.

---

## Task 1: Add Board View State And Derived Queue Data

**Files:**
- Modify: `frontend/src/App.vue`

- [ ] **Step 1: Add queue type definitions near existing production board types**

Add these types near the current `ProductionBoardStatusOption` / production-board state area:

```ts
type ProductionQueueTone = 'teal' | 'sky' | 'amber' | 'orange' | 'rose' | 'green' | 'violet'

type ProductionQueueDefinition = {
  key: string
  label: string
  subtitle: string
  tone: ProductionQueueTone
}

type ProductionQueueOrderCard = {
  queueKey: string
  order: InternalOrderItem
  statusLabel: string
  externalStatusLabel: string
  productLabel: string
  riskLabel: string
  riskTone: ProductionQueueTone
}

type ProductionQueueGroup = ProductionQueueDefinition & {
  orders: ProductionQueueOrderCard[]
  activeCount: number
  riskCount: number
}
```

- [ ] **Step 2: Add fixed queue definitions**

Add this constant near `productionBoardStatusOptions`:

```ts
const productionQueueDefinitions: ProductionQueueDefinition[] = [
  { key: 'DATA_REVIEW', label: '数据处理', subtitle: '资料、口扫、订单数据', tone: 'teal' },
  { key: 'CAD', label: 'CAD', subtitle: '固定/活动/种植设计', tone: 'sky' },
  { key: 'IMPLANT', label: '种植', subtitle: '种植设计与修复', tone: 'violet' },
  { key: 'MILLING', label: '车金切削', subtitle: '切削、研磨、车金', tone: 'orange' },
  { key: 'PRINTING_3D', label: '3D打印', subtitle: '打印、模型、树脂件', tone: 'teal' },
  { key: 'PORCELAIN', label: '车瓷', subtitle: '车瓷与瓷修整', tone: 'green' },
  { key: 'STAINING', label: '上瓷上釉', subtitle: '上瓷、上釉、染色', tone: 'amber' },
  { key: 'STEEL_FRAMEWORK', label: '钢托', subtitle: '钢托与支架', tone: 'sky' },
  { key: 'ACRYLIC', label: '胶托', subtitle: '胶托与基托', tone: 'violet' },
  { key: 'FLEXIBLE', label: '隐形', subtitle: '隐形义齿与保持器', tone: 'green' },
  { key: 'ORTHO', label: '正畸', subtitle: '正畸与矫治器', tone: 'teal' },
  { key: 'QC', label: '质检', subtitle: '入检、出检、终检', tone: 'rose' },
  { key: 'DISPATCH', label: '包装出货', subtitle: '包装、物流、发货', tone: 'amber' }
]
```

- [ ] **Step 3: Add queue filter state**

Add these refs near `productionBoardKeyword`:

```ts
const productionBoardDepartmentFilter = ref('ALL')
const productionBoardRiskFilter = ref('ALL')
```

- [ ] **Step 4: Add status/risk helper functions**

Add these functions near `productionBoardNodeStats`:

```ts
function inferProductionQueueKey(order: InternalOrderItem) {
  const text = `${order.product_type ?? ''} ${order.internal_status ?? ''} ${order.external_status ?? ''}`.toUpperCase()
  if (text.includes('IMPLANT') || text.includes('种植')) return 'IMPLANT'
  if (text.includes('ORTHO') || text.includes('正畸')) return 'ORTHO'
  if (text.includes('3D') || text.includes('PRINT')) return 'PRINTING_3D'
  if (text.includes('PORCELAIN') || text.includes('瓷')) return 'PORCELAIN'
  if (text.includes('SHIPPED') || text.includes('COMPLETED')) return 'DISPATCH'
  if (text.includes('REWORK') || text.includes('QUALITY')) return 'QC'
  if (text.includes('CAD') || text.includes('DESIGN')) return 'CAD'
  return 'DATA_REVIEW'
}

function productionBoardRisk(order: InternalOrderItem): { label: string; tone: ProductionQueueTone } {
  if (order.internal_status === 'PENDING_DOCTOR_CONFIRM') {
    return { label: '待医生确认', tone: 'violet' }
  }
  if (order.internal_status === 'PRODUCING') {
    return { label: '生产中', tone: 'teal' }
  }
  if (order.internal_status === 'PROCESS_INSTANCE_CREATED') {
    return { label: '待派工', tone: 'sky' }
  }
  if (order.external_status === 'SHIPPED') {
    return { label: '已发货', tone: 'green' }
  }
  return { label: '正常', tone: 'teal' }
}
```

- [ ] **Step 5: Add derived queue groups**

Add this computed block near `productionBoardNodeStats`:

```ts
const productionBoardDepartmentOptions = computed(() => [
  { label: '全部工序', value: 'ALL' },
  ...productionQueueDefinitions.map((queue) => ({ label: queue.label, value: queue.key }))
])

const productionBoardQueueGroups = computed<ProductionQueueGroup[]>(() => {
  const groups = new Map<string, ProductionQueueGroup>()
  for (const definition of productionQueueDefinitions) {
    groups.set(definition.key, {
      ...definition,
      orders: [],
      activeCount: 0,
      riskCount: 0
    })
  }

  for (const order of productionBoardOrders.value) {
    const risk = productionBoardRisk(order)
    const queueKey = inferProductionQueueKey(order)
    const group = groups.get(queueKey) ?? groups.get('DATA_REVIEW')
    if (!group) continue
    if (productionBoardDepartmentFilter.value !== 'ALL' && productionBoardDepartmentFilter.value !== group.key) {
      continue
    }
    if (productionBoardRiskFilter.value === 'RISK' && risk.label === '正常') {
      continue
    }
    group.orders.push({
      queueKey: group.key,
      order,
      statusLabel: statusLabel(order.internal_status),
      externalStatusLabel: statusLabel(order.external_status),
      productLabel: productTypeLabel(order.product_type),
      riskLabel: risk.label,
      riskTone: risk.tone
    })
    group.activeCount += 1
    if (risk.label !== '正常') {
      group.riskCount += 1
    }
  }

  return Array.from(groups.values()).filter((group) =>
    productionBoardDepartmentFilter.value === 'ALL' || group.key === productionBoardDepartmentFilter.value
  )
})
```

- [ ] **Step 6: Run frontend typecheck/build**

Run:

```bash
cd frontend
pnpm build
```

Expected: `vue-tsc -b` passes. If TypeScript complains about `InternalOrderItem` fields, inspect the existing type and adjust helper field access to fields that exist in the local type.

---

## Task 2: Redesign Production Board Template

**Files:**
- Modify: `frontend/src/App.vue`

- [ ] **Step 1: Replace the current board heading copy**

Inside the `v-else-if="isProductionBoardRoute"` section, keep:

```vue
<h2>生产看板</h2>
```

Add below it a compact descriptive line:

```vue
<p>工序队列按当前生产订单、状态和异常集中展示。</p>
```

- [ ] **Step 2: Extend the toolbar with department and risk filters**

Keep existing `productionBoardStatus`, `productionBoardKeyword`, and query button. Add:

```vue
<el-select v-model="productionBoardDepartmentFilter" placeholder="全部工序">
  <el-option
    v-for="option in productionBoardDepartmentOptions"
    :key="option.value"
    :label="option.label"
    :value="option.value"
  />
</el-select>

<el-select v-model="productionBoardRiskFilter" placeholder="异常筛选">
  <el-option label="全部订单" value="ALL" />
  <el-option label="只看异常/待处理" value="RISK" />
</el-select>
```

- [ ] **Step 3: Replace list/detail workspace with queue/detail workspace**

Replace the current `production-board-workspace` children with:

```vue
<div class="production-dispatch-workspace">
  <section class="production-queue-shell">
    <div class="production-board-section-head">
      <div>
        <h3>工序队列</h3>
        <small>按工序查看当前订单，点击订单查看节点进度。</small>
      </div>
      <el-tag round>{{ productionBoardOrders.length }} 单</el-tag>
    </div>

    <div class="production-queue-board">
      <article
        v-for="queue in productionBoardQueueGroups"
        :key="queue.key"
        class="production-queue-column"
        :class="`tone-${queue.tone}`"
      >
        <div class="production-queue-head">
          <div>
            <strong>{{ queue.label }}</strong>
            <small>{{ queue.subtitle }}</small>
          </div>
          <span>{{ queue.activeCount }}</span>
        </div>

        <button
          v-for="card in queue.orders"
          :key="card.order.order_id"
          type="button"
          class="production-order-card"
          :class="[{ active: selectedProductionBoardOrder?.order_id === card.order.order_id }, `tone-${card.riskTone}`]"
          @click="selectProductionBoardOrder(card.order)"
        >
          <span class="production-order-card-no">{{ card.order.order_no }}</span>
          <strong>{{ card.productLabel }}</strong>
          <small>{{ card.order.clinic_name }}</small>
          <span class="production-order-card-meta">
            <b>{{ card.statusLabel }}</b>
            <em>{{ card.riskLabel }}</em>
          </span>
        </button>

        <div v-if="queue.orders.length === 0" class="production-queue-empty">
          暂无订单
        </div>
      </article>
    </div>
  </section>

  <section class="production-dispatch-detail">
    <!-- move the existing selected order summary, node stats, shipping form, and node progress here -->
  </section>
</div>
```

- [ ] **Step 4: Move existing detail content without deleting behavior**

Inside `production-dispatch-detail`, move the current:
- `selectedProductionBoardOrder` summary
- `productionBoardStats`
- shipping `review-form`
- `process-node-list`
- empty state

Do not change:
- `data-testid="production-board-logistics-carrier"`
- `data-testid="production-board-logistics-tracking-no"`
- `data-testid="production-board-ship-button"`
- `data-testid="production-board-shipping-result"`
- `shipProductionBoardOrder`

- [ ] **Step 5: Keep current chip row behavior**

Do not remove the current `prototype-chip-row`. It can remain above the toolbar as quick status filters.

- [ ] **Step 6: Run the existing static check**

Run:

```bash
npm run check:task9d8
```

Expected: `task 9D.8 frontend check ok`.

---

## Task 3: Add Factory-Portal-Aligned Styles

**Files:**
- Modify: `frontend/src/styles.css`

- [ ] **Step 1: Add dispatch workspace grid**

Add near existing production board styles:

```css
.production-dispatch-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(360px, 0.72fr);
  gap: 14px;
  align-items: start;
}

.production-queue-shell,
.production-dispatch-detail {
  min-width: 0;
  overflow: hidden;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: var(--portal-shadow-sm);
}
```

- [ ] **Step 2: Add queue section header**

```css
.production-board-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 64px;
  padding: 14px 16px;
  border-bottom: 1.5px solid #e2e8f0;
}

.production-board-section-head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
}

.production-board-section-head small {
  display: block;
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 800;
}
```

- [ ] **Step 3: Add queue board and columns**

```css
.production-queue-board {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(240px, 1fr);
  gap: 12px;
  overflow-x: auto;
  padding: 14px;
}

.production-queue-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 420px;
  padding: 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.production-queue-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.production-queue-head strong,
.production-order-card strong {
  color: #0f172a;
  font-weight: 900;
}

.production-queue-head small {
  display: block;
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 800;
}

.production-queue-head span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 24px;
  border-radius: 999px;
  background: #ccfbf1;
  color: #0f766e;
  font-size: 12px;
  font-weight: 900;
}
```

- [ ] **Step 4: Add order cards**

```css
.production-order-card {
  display: grid;
  gap: 6px;
  width: 100%;
  padding: 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.06);
}

.production-order-card:hover,
.production-order-card.active {
  border-color: #14b8a6;
  background: #f0fdfa;
}

.production-order-card-no {
  color: #0f766e;
  font-size: 12px;
  font-weight: 900;
}

.production-order-card small {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.production-order-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.production-order-card-meta b,
.production-order-card-meta em {
  font-size: 12px;
  font-style: normal;
  font-weight: 900;
}

.production-order-card.tone-rose .production-order-card-meta em,
.production-order-card.tone-orange .production-order-card-meta em {
  color: #e11d48;
}

.production-queue-empty {
  display: grid;
  place-items: center;
  min-height: 90px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 800;
}
```

- [ ] **Step 5: Add responsive stacking**

```css
@media (max-width: 980px) {
  .production-dispatch-workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .production-queue-board {
    grid-auto-columns: minmax(220px, 82vw);
  }
}
```

- [ ] **Step 6: Run frontend build**

Run:

```bash
cd frontend
pnpm build
```

Expected: build passes. Rollup chunk-size warnings are acceptable if they match the existing project behavior.

---

## Task 4: Update Static Checks

**Files:**
- Modify: `scripts/check-task-9d8-frontend.mjs`

- [ ] **Step 1: Add required fragments**

Extend `requiredAppFragments` with:

```js
'工序队列',
'production-dispatch-workspace',
'production-queue-board',
'productionQueueDefinitions',
'productionBoardQueueGroups',
'productionBoardDepartmentFilter',
'productionBoardRiskFilter'
```

- [ ] **Step 2: Add required style fragments**

Add a `styles` read:

```js
const styles = fs.readFileSync('frontend/src/styles.css', 'utf8')
```

Add:

```js
const requiredStyleFragments = [
  '.production-dispatch-workspace',
  '.production-queue-board',
  '.production-queue-column',
  '.production-order-card',
  '.production-dispatch-detail'
]
```

Merge into `missing`:

```js
...requiredStyleFragments
  .filter((fragment) => !styles.includes(fragment))
  .map((fragment) => `frontend/src/styles.css -> ${fragment}`)
```

- [ ] **Step 3: Run check**

Run:

```bash
npm run check:task9d8
```

Expected: `task 9D.8 frontend check ok`.

---

## Task 5: Browser Acceptance Smoke

**Files:**
- No code changes unless adding an optional Playwright smoke.

- [ ] **Step 1: Start or reuse local frontend/backend**

Use the project’s current local setup. If `http://127.0.0.1:5173/` is already running, reuse it.

- [ ] **Step 2: Log in through production portal**

In browser:
1. Open `http://127.0.0.1:5173/`.
2. Select `生产端`.
3. Log in with the existing local test account shown by the app.
4. Open `生产看板`.

- [ ] **Step 3: Verify visual and interaction requirements**

Expected:
- Page title remains `生产看板`.
- Main section title shows `工序队列`.
- Top quick chips still exist.
- Status search still works.
- Department filter exists.
- Risk filter exists.
- Queue columns render with production department names.
- Clicking an order card loads the right-side detail panel.
- Node progress still renders.
- `录入物流并发货` form still exists.
- No visible `Department Kanban` or English placeholder title.
- No horizontal page overflow.

- [ ] **Step 4: Verify no feature regression**

Expected:
- `productionBoardOrders` still loads from `/orders`.
- `productionBoardInstance` still loads from `/orders/{orderId}/process-instance`.
- Shipping form still calls the existing shipping path and still shows `终检出检通过后才能发货` on 409.

---

## Task 6: Documentation Note

**Files:**
- Modify only if the implementation round is substantial:
  - `STATUS.md`
  - `tasks/README.md`

- [ ] **Step 1: Add a short implementation record**

If code is implemented, add a brief record:

```md
- 生产看板主体重设计第一段已完成：`/production/board` 保持菜单名和路由不变，主区域改为 `工序队列` 调度台，复用既有 `/orders` 与 `/orders/{orderId}/process-instance`，保留节点进度和终检发货门禁。本轮不做拖拽排产、实时刷新或新增后端聚合接口。
```

- [ ] **Step 2: Do not update Task 8 readiness to READY**

Task 8 still remains not ready for production deployment unless separate real-environment acceptance is completed.

---

## Final Verification Commands

Run these before claiming implementation complete:

```bash
npm run check:task9d8
```

Expected:

```text
task 9D.8 frontend check ok
```

Run:

```bash
cd frontend
pnpm build
```

Expected:
- `vue-tsc -b` passes.
- Vite build completes.
- Existing chunk-size warning is acceptable.

Run:

```bash
git diff --check -- frontend/src/App.vue frontend/src/styles.css scripts/check-task-9d8-frontend.mjs
```

Expected: no output.

---

## Third Step Boundary

Do not include these in Step 2 implementation:
- Backend production-board aggregation API.
- Realtime WebSocket production board refresh.
- Drag-and-drop scheduling.
- Capacity planning / shift planning.
- Automatic production bottleneck algorithm.
- Node operation redesign for start/complete/inspection/rework.

These belong to **Step 3: production dispatch closed loop**, after the Step 2 board shell and manager-style interaction are accepted.

## Self-Review

- Spec coverage: the plan covers route/name preservation, manager-only display, process queues, filters, order detail preservation, visual style, mobile stacking, static checks, and browser acceptance.
- Placeholder scan: no task relies on unspecified UI text or unnamed files.
- Type consistency: `productionBoardDepartmentFilter`, `productionBoardRiskFilter`, `productionQueueDefinitions`, and `productionBoardQueueGroups` are introduced before template usage.
- Scope check: Step 3 realtime/drag/drop/backend aggregation is explicitly excluded.
