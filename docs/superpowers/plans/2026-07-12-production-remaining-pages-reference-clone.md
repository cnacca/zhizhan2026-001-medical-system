# 生产端其余页面参考页复刻 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Do not dispatch subagents unless the user explicitly authorizes delegation.

**Goal:** 以 `frontend/public/reference/factory-portal.html` 为唯一视觉与交互标准，在不改变菜单、路由、权限、接口和业务状态流转的前提下，逐页复刻除“生产工作台”和“生产看板”以外的生产端页面。

**Architecture:** 保留 `frontend/src/App.vue` 中现有状态、加载函数和业务操作，通过 `activeNavId` 在共享路由下选择不同生产视图；新增样式全部使用 `factory-*` 命名并限制在 `.portal-production` 下。真实接口始终是页面数据来源；缺少明细接口时保留稳定页面结构和业务空态，不生成模拟数据。

**Tech Stack:** Vue 3、TypeScript、Element Plus、Uppy、CSS、Playwright、现有 Spring Boot API。

## Global Constraints

- 参考文件 `frontend/public/reference/factory-portal.html` 是唯一视觉与交互标准。
- 左侧菜单结构、菜单项、路由、权限和账号弹窗页面不变。
- 生产工作台和生产看板冻结，仅允许避免全局样式回归所必需的极小修正。
- 不改变真实接口、字段、状态流转、DataScope、文件能力和消息审核规则。
- 不加入模拟数据或演示模式，不根据汇总数据生成虚假明细。
- 所有用户可见文案使用中文，不出现接口名、字段名、状态码、“待映射”“待同步”“本地第一增量”“PARTIAL”等技术文案。
- 缺失文本显示“暂无信息”或更具体的业务表达；缺失日期显示“未设置”；缺失负责人显示“待分配”；未知数值不得伪装成 `0`。
- 1440×900 是像素级验收视口；1280px 和 1024px 只要求功能完整、无重叠并支持必要横向滚动。
- 页面内容区按参考页保留对应 emoji；左侧菜单继续使用现有 SVG。
- 不新增前端依赖，不重构业务状态到新模块，不提交或覆盖用户当前未提交改动。

## File Map

- Modify: `frontend/src/App.vue` — 菜单上下文判断、生产页面模板、真实数据展示适配、抽屉与弹窗触发。
- Modify: `frontend/src/styles.css` — 生产端参考视觉变量、页面结构、表格、卡片、筛选、消息、抽屉、弹窗和响应式规则。
- Modify: `package.json` — 新增生产端参考复刻静态检查与浏览器验收命令。
- Create: `scripts/check-production-reference-pages.mjs` — 检查页面分流、中文文案、样式隔离和冻结页面边界。
- Create: `scripts/smoke-production-reference-pages.spec.mjs` — 登录生产端、逐页交互、1440×900 截图和主要业务路径验收。
- Create: `docs/quality/production-reference-pages/README.md` — 每页参考图、实现图、已对齐项和剩余差异索引。
- Preserve: `docs/superpowers/specs/2026-07-12-production-board-reference-clone-design.md` — 现有生产看板方案，不覆盖。

## Shared View Contracts

在 `frontend/src/App.vue` 增加以下只读页面上下文；它们只决定模板呈现，不改变 URL：

```ts
const isProductionOrdersView = computed(() => activeNavId.value === 'production-orders')
const isProductionKanbanView = computed(() => activeNavId.value === 'production-board')
const isInternalReworkView = computed(() => activeNavId.value === 'production-internal-rework-management')
const isExternalReworkView = computed(() => activeNavId.value === 'production-external-rework-management')
const isFinalReportView = computed(() => activeNavId.value === 'production-final-report')
const isCostOverviewView = computed(() => activeNavId.value === 'production-cost')
const isOutsourcingCostView = computed(() => activeNavId.value === 'production-cost-outsourcing')
const isProductionCommunicationView = computed(() => portalTone.value === 'production' && activeNavId.value === 'production-message')
const isProductionCloudDataView = computed(() => portalTone.value === 'production' && activeNavId.value === 'production-cloud-data')
```

直接访问共享路由时使用父级默认视图：`/production/board` 默认生产看板，`/rework-final` 默认内返管理，`/production/cost-management` 默认成本总览。

---

### Task 1: 建立冻结保护和参考视觉基础层

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/styles.css`
- Create: `scripts/check-production-reference-pages.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `portalTone`、`activeNavId`、现有生产菜单配置。
- Produces: 共享视图 computed、`factory-reference-page` 页面根类、`factory-*` 视觉基础类、静态检查命令。

- [x] **Step 1: 写失败的静态检查**

检查以下事实：共享路由视图 computed 存在；生产看板根类与模板仍存在；新增样式均受 `.portal-production` 限制；生产页面模板不含禁止技术文案。

```js
const requiredApp = [
  'isProductionOrdersView',
  'isInternalReworkView',
  'isExternalReworkView',
  'isFinalReportView',
  'isCostOverviewView',
  'isOutsourcingCostView',
  'isProductionCommunicationView',
  'isProductionCloudDataView'
]
const forbiddenCopy = ['工序待同步', '工序待映射', '本地第一增量', 'PARTIAL']
```

- [x] **Step 2: 运行红灯检查**

Run: `node scripts/check-production-reference-pages.mjs`

Expected: FAIL，指出首个缺失的共享视图或参考样式。

- [x] **Step 3: 增加页面上下文和参考变量**

在 `.portal-production` 下定义参考页颜色、文字、边框、阴影、圆角、层级和动画变量；不修改 `.nav-panel`、生产工作台和生产看板既有规则。

```css
.portal-production {
  --factory-page: #f7f9fc;
  --factory-surface: #ffffff;
  --factory-text: #0f172a;
  --factory-muted: #64748b;
  --factory-subtle: #94a3b8;
  --factory-border: #e2e8f0;
  --factory-teal: #0d9488;
  --factory-teal-soft: #f0fdfa;
  --factory-radius-card: 14px;
  --factory-shadow-sm: 0 1px 3px rgba(12, 35, 64, 0.06);
}
```

- [x] **Step 4: 增加统一显示适配函数**

```ts
function factoryText(value: string | number | null | undefined, empty = '暂无信息') {
  return value === null || value === undefined || value === '' ? empty : String(value)
}

function factoryDate(value: string | null | undefined) {
  return value ? compactDateTime(value) : '未设置'
}
```

- [x] **Step 5: 运行基础检查与构建**

Run: `npm run check:production-board-reference-clone && npm run build:frontend && node scripts/check-production-reference-pages.mjs`

Expected: 三项均 PASS；生产看板结构检查继续通过。

- [x] **Step 6: Review checkpoint**

检查 `git diff -- frontend/src/App.vue frontend/src/styles.css`，确认没有菜单删改、路由变更或生产看板模板重写。本阶段不提交，保留用户当前工作树。

### Task 2: 完成“生产订单”校准页

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/styles.css`
- Modify: `scripts/check-production-reference-pages.mjs`
- Create: `docs/quality/production-reference-pages/production-orders-differences.md`

**Interfaces:**
- Consumes: 现有生产订单加载结果、生产看板订单详情数据和抽屉操作。
- Produces: `factory-orders-page`、真实状态筛选、页面内选择状态、选中订单打印和订单详情抽屉入口。

- [x] **Step 1: 扩展静态检查并确认红灯**

要求模板包含 `factory-orders-page`、`factory-filter-chip`、`factory-data-table`、`factory-table-scroll` 和订单抽屉触发；运行检查应因模板尚未实现而失败。

- [x] **Step 2: 实现生产订单与生产看板同路由分流**

`production-orders` 显示订单列表；`production-board` 保持现有 `factory-kanban-*` 模板。直接刷新 `/production/board` 时默认看板。

- [x] **Step 3: 实现真实筛选和稳定字段槽位**

筛选项使用真实订单状态、异常、待发货和待确认数据；缺失负责人显示“待分配”，缺失日期显示“未设置”。整行点击复用生产看板订单抽屉。

- [x] **Step 4: 实现页面内全选与打印**

选择状态只存在前端内存；“打印已选”调用浏览器打印样式，不写后端、不创建业务记录。

- [x] **Step 5: 运行校准页检查**

Run: `node scripts/check-production-reference-pages.mjs && npm run build:frontend && npm run check:production-board-reference-clone`

Expected: 全部 PASS。

- [x] **Step 6: 生成校准截图**

使用 1440×900 捕获参考订单页、实现订单页和实现抽屉；长内容追加 1440px 宽全页截图。

- [x] **Step 7: 填写差异报告并暂停**

`production-orders-differences.md` 固定包含：已对齐项、剩余差异、差异原因、下一轮修正。把截图与差异交给用户确认，未确认前不推进 Task 3。

### Task 3: 我的任务与扫码登记

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/styles.css`
- Modify: `scripts/check-production-reference-pages.mjs`
- Modify: `scripts/smoke-production-reference-pages.spec.mjs`

**Interfaces:**
- Consumes: `workerTasks`、现有任务开始/完成函数、`checkTasks`、检查记录和入检/出检提交函数。
- Produces: 参考式任务卡、订单详情抽屉、订单号/节点编号定位和双栏检查工作区。

- [x] **Step 1: 写任务卡与扫码页失败断言**

检查 `factory-task-grid`、`factory-task-card`、`factory-scan-layout`、`factory-check-history` 和中文空态。

- [x] **Step 2: 重组“我的任务”模板**

按待开工、进行中、已完成、待处理筛选；卡片继续调用 `operateWorkerTask`，详情继续复用现有抽屉。

- [x] **Step 3: 重组“扫码登记”模板**

输入订单号或节点编号只定位当前账号可访问的真实任务；成功后显示现有入检/出检表单和检查记录。不接摄像头，不伪装硬件扫码。

- [x] **Step 4: 验证业务动作与视觉状态**

Run: `npm run build:frontend && npm run check:task9d3 && npm run check:task9d4 && node scripts/check-production-reference-pages.mjs`

Expected: 构建、任务/检查业务检查和参考页结构检查全部 PASS。

- [x] **Step 5: 截图并记录差异**

分别捕获任务列表、进行中任务、扫码定位成功、出检不通过表单和检查历史；追加每页差异记录。

### Task 4: 质量总览、内返、外返和终检报告

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/styles.css`
- Modify: `scripts/check-production-reference-pages.mjs`
- Modify: `scripts/smoke-production-reference-pages.spec.mjs`

**Interfaces:**
- Consumes: `productionQualitySummary`、`qualityRecords`、`reworkRecords`、`finalInspectionTasks`、现有质量/返工/终检操作函数。
- Produces: 四个按菜单项分流的质量视图、参考式详情抽屉和操作弹窗。

- [x] **Step 1: 写四视图分流失败断言**

要求 `/production/quality` 显示质量总览；`/rework-final` 根据 `activeNavId` 显示内返、外返或终检，不允许三个菜单继续落到完全相同模板。

- [x] **Step 2: 实现质量总览**

六个指标槽位保持稳定；未知投诉率/退货率显示“暂无统计”，不得显示虚假 `0%`。质量记录使用真实表格，登记和状态更新移入弹窗。

- [x] **Step 3: 实现内返与外返分视图**

内返以返工列表、影响流程和关闭操作为主；外返以外返质量记录、责任、原因和状态为主。工序名称为主信息，内部节点编号为辅助信息。

- [x] **Step 4: 实现终检报告视图**

保持现有终检提交、报告生成、附件、PDF 和签名状态逻辑；页面使用任务选择、报告区、检查历史和文件区。

- [x] **Step 5: 运行质量回归**

Run: `npm run check:task9d49 && npm run check:task9d57 && npm run check:prd-v2-gap-closure-b && npm run build:frontend`

Expected: 质量汇总、返工影响、质量状态工作流和前端构建全部 PASS。

- [x] **Step 6: 截图并记录差异**

四个视图分别捕获首屏、详情抽屉/操作弹窗和长页；记录真实数据差异与视觉差异。

### Task 5: 员工、绩效与奖惩

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/styles.css`
- Modify: `scripts/check-production-reference-pages.mjs`
- Modify: `scripts/smoke-production-reference-pages.spec.mjs`

**Interfaces:**
- Consumes: `staffWorkloadItems`、`performanceStats`、`performanceDetails`、`productionRewardPenaltySummary` 和现有奖惩写操作。
- Produces: 员工卡片、绩效总览/明细、奖惩汇总/弹窗和权限感知操作入口。

- [x] **Step 1: 写员工卡与绩效布局失败断言**

检查 `factory-staff-grid`、`factory-staff-card`、`factory-performance-hero`、`factory-performance-table` 和 `factory-reward-page`。

- [x] **Step 2: 实现员工管理**

只使用真实人员、部门、岗位、任务、工时和返工数据；不显示参考页模拟工资。新增员工入口说明需到管理端维护，导出入口在无能力时禁用。

- [x] **Step 3: 实现绩效管理**

生产人员默认本人；有权限账号保留人员选择。将“默认绩效分”展示为“综合绩效参考分”，并显示“不作为工资结算结果”。

- [x] **Step 4: 实现奖惩管理**

汇总使用真实接口；登记和审批状态放入弹窗；没有明细查询接口时显示稳定业务空态，不生成员工记录。

- [x] **Step 5: 运行人员绩效回归**

Run: `npm run check:task9d54 && npm run check:task9d86 && npm run build:frontend && node scripts/check-production-reference-pages.mjs`

Expected: 奖惩、人员工作量、构建和参考结构检查全部 PASS。

- [x] **Step 6: 截图并记录差异**

捕获员工卡片、绩效总览/表格、奖惩空态和登记/审批弹窗。

### Task 6: 设备、物料、安环、成本与外协成本

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/styles.css`
- Modify: `scripts/check-production-reference-pages.mjs`
- Modify: `scripts/smoke-production-reference-pages.spec.mjs`

**Interfaces:**
- Consumes: 五类真实汇总、已有登记函数和已有状态更新函数。
- Produces: 五个完整参考式页面、真实汇总、业务空态和权限感知弹窗。

- [x] **Step 1: 写五类页面失败断言**

检查每页标题、汇总卡、台账结构、空态、弹窗和成本/外协分流；禁止合作工厂模拟卡和虚假在线状态。

- [x] **Step 2: 实现设备与物料页面**

设备提供汇总、登记设备、登记事件；物料提供汇总、登记异常、更新状态。明细表格无接口时显示空态。

- [x] **Step 3: 实现安环页面**

突出高风险、超期和整改状态；登记事件与更新整改状态使用弹窗。

- [x] **Step 4: 实现成本与外协成本分视图**

成本构成只由真实汇总金额计算；外协视图只显示真实外协金额和登记入口，登记时固定成本类型为 `OUTSOURCING`。不生成供应商、合作工厂或跨厂进度。

- [x] **Step 5: 运行生产支持回归**

Run: `npm run check:task9d50 && npm run check:task9d51 && npm run check:task9d52 && npm run check:task9d53 && npm run check:task9d54 && npm run check:task9d951 && npm run check:task9d952 && npm run check:task9d953 && npm run check:task9d954 && npm run check:task9d955 && npm run build:frontend`

Expected: 所有现有生产支持检查和构建 PASS。

- [x] **Step 6: 截图并记录差异**

每页捕获汇总、台账空态、登记弹窗和状态更新弹窗；外协页额外确认无模拟合作工厂。

### Task 7: 沟通中心与云端数据中心

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/styles.css`
- Modify: `scripts/check-production-reference-pages.mjs`
- Modify: `scripts/smoke-production-reference-pages.spec.mjs`

**Interfaces:**
- Consumes: 真实订单消息、可 @ 参与人、订单提醒、设计稿、订单附件、预览/下载 URL 和现有上传函数。
- Produces: 生产角色专属 Messages 视图和 Cloud Data Centre 文件视图；客服共享路由页面不变。

- [x] **Step 1: 写角色分流失败断言**

生产角色必须出现 `factory-message-layout` 与 `factory-cloud-page`；客服角色仍出现原客服协同/订单页面，不得套用生产样式。

- [x] **Step 2: 实现真实生产—客服消息界面**

会话列表来自生产人员可访问的真实订单/任务；选择会话后请求订单消息与可 @ 人员。生产发送状态显示“待客服审核”，生产端不显示审核按钮。

- [x] **Step 3: 实现云端文件视图**

只展示真实设计稿和附件；预览/下载继续使用短时效 URL；已有上传能力使用参考式上传弹窗。外协入口跳转到外协成本，不展示合作工厂模拟数据。

- [x] **Step 4: 运行沟通专项测试**

Run: `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=MessageDesignBillNotificationTests test`

Expected: `Tests run: 14, Failures: 0, Errors: 0`。

- [x] **Step 5: 运行前端回归与截图**

Run: `npm run build:frontend && node scripts/check-production-reference-pages.mjs`

捕获会话列表、生产发信待审核、客服回复、@ 客服选择、文件列表、预览/下载和上传弹窗。

### Task 8: 统一浏览器验收与视觉证据

**Files:**
- Create: `scripts/smoke-production-reference-pages.spec.mjs`
- Modify: `package.json`
- Create: `docs/quality/production-reference-pages/README.md`

**Interfaces:**
- Consumes: 已完成的所有生产页面和本地真实后端数据。
- Produces: 可重复运行的生产端浏览器验收和逐页视觉证据索引。

- [x] **Step 1: 编写生产端登录与导航 helper**

复用现有 smoke 的生产账号环境变量：

```js
const frontendUrl = process.env.PRODUCTION_REFERENCE_FRONTEND_URL ?? 'http://127.0.0.1:5173'
const username = process.env.TASK9D24_WORKER_USERNAME ?? 'worker'
const password = process.env.TASK9D24_WORKER_PASSWORD ?? 'change-me-worker'
test.use({ viewport: { width: 1440, height: 900 }, channel: 'chrome' })
```

- [x] **Step 2: 为每个菜单编写真实点击路径**

依次点击生产订单、我的任务、扫码登记、质量总览、内返管理、外返管理、终检报告、员工管理、绩效管理、奖惩管理、设备管理、物料管理、成本管理、外协成本、安环管理、沟通中心和云端数据中心；每页断言标题、核心内容、空态/数据态和样式根类。

- [x] **Step 3: 捕获标准截图**

每页至少保存 `reference.png`、`implementation.png`；长页保存 `implementation-full.png`；存在抽屉或弹窗时保存交互截图。

- [x] **Step 4: 建立差异索引**

`README.md` 每页固定四栏：已对齐项、剩余差异、差异原因、下一轮修正。真实数据与参考模拟数据不同只能列为内容差异，不能掩盖布局差异。

- [x] **Step 5: 添加执行命令**

```json
{
  "check:production-reference-pages": "node scripts/check-production-reference-pages.mjs",
  "smoke:production-reference-pages": "playwright test scripts/smoke-production-reference-pages.spec.mjs --browser=chromium --workers=1"
}
```

- [x] **Step 6: 运行浏览器验收**

Run: `npm run smoke:production-reference-pages`

Expected: 所有生产菜单可进入，主要筛选/抽屉/弹窗可操作，截图文件完整生成。

### Task 9: 最终回归与交付

**Files:**
- Verify only: 当前变更文件和视觉证据。

**Interfaces:**
- Consumes: Tasks 1–8 全部产物。
- Produces: 可交付的生产端视觉复刻结果和明确剩余差异。

- [ ] **Step 1: 运行静态与构建检查**

Run: `npm run check:production-reference-pages && npm run check:production-board-reference-clone && npm run check:production-workbench-home-layout && npm run build:frontend`

Expected: 全部 PASS。

- [ ] **Step 2: 运行既有生产页面检查**

Run: `npm run check:task9d36 && npm run check:frontend-productization-closure && npm run check:task9d62`

Expected: 菜单、主题、主链路和产品化边界不回退。

- [ ] **Step 3: 运行工作台与看板回归截图**

在 1440×900 下重新捕获工作台和生产看板；与改造前截图比较，确认没有非必要变化。

- [ ] **Step 4: 检查其他端口共享路由**

登录客服端验证 `/collaboration` 和 `/orders/internal` 仍显示客服原页面；医生端和管理端至少各走一次菜单导航，确认生产样式未泄漏。

- [ ] **Step 5: 检查工作树质量**

Run: `git diff --check && git diff --stat && git status --short`

Expected: 无空白错误；只包含本轮计划内文件和用户原有未提交修改，不覆盖无关文件。

- [ ] **Step 6: 输出最终逐页报告**

逐页列出完成状态、真实交互验证、截图路径和仍存在的视觉差异；未完成差异不得写成已完成。Task 8 保持 `NOT_READY`。

## Final Acceptance

1. 左侧菜单、路由、权限和账号弹窗结构没有变化。
2. 工作台与生产看板没有非必要改动。
3. 其余生产菜单均具有独立、完整、统一的参考页式视觉视图。
4. 页面只使用真实接口数据；无数据时保持自然完整的空态。
5. 生产人员与客服可围绕订单真实双向沟通，生产外发医生消息继续经过客服审核。
6. 共享路由按菜单项正确分流，客服/医生/管理端不受生产样式影响。
7. 每页都有 1440×900 对比证据和剩余差异记录。
8. 构建、生产端相关检查、沟通专项测试、浏览器主路径和 `git diff --check` 全部通过。
