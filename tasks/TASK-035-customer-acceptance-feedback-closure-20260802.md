# TASK-035 客户验收反馈统一收口执行批次

Status: `in_progress`

Goal: `goals/GOAL-034-customer-acceptance-feedback-closure-20260802.md`

## Why

客户 2026-08-02 验收标记的五条「部分满足」中，大部分不是功能缺失，而是**后端数据已具备、前端没接线**。逐条核查见 GOAL-034 的定性表，此处不重复。

核查中额外发现 `complaint_rate` / `return_rate` 在后端写死 `0.0`——生产工作台的「客诉率」和客服周环比的「投诉率」永远显示 0%。这是演示时最危险的一类问题：看起来有数据，实际是常量。

## 执行顺序与依赖

```
G1（前端展示欠账）──▶ G2（指标真实化）
G3（AI 增强）—— 与 G1/G2 无依赖，可并行
G4（客服端设置）—— 依赖 TASK-034 A 批次的角色级 data_scope
```

G1 / G2 客户马上看得见，先做；G4 排在 TASK-034 A 之后。

## 通用规则

- 不为任何缺少可信口径的指标虚构基准值。宁可显式标注「口径未启用」，也不用 0 冒充。
- 每批结束跑 `npm run check:goal-034-dashboard-metrics` 与 `npm run check:status-vocabulary`。
- 契约变更必须同步 `docs/api/openapi.yaml` 并跑 `npm run check:openapi`。

---

## G1. 前端展示欠账 —— `COMPLETED`（2026-08-02）

Scope：

- [x] CS 周环比接线：`csWeekOnWeekRates` 删除三处 `'上周口径待接入'`，接 `productionPreviousWeekQualitySummary`（返工率 / 投诉率）与 `previous_week_shipping_rate`（发货率）。三者原本就已在 `loadPhaseOneAbDashboardData` 中对 cs 端加载，属纯接线。
- [x] 新增 `weekOnWeekDirection` / `weekOnWeekLabel`：模板已按 `direction` 渲染箭头，文案不再自带箭头，避免双箭头。
- [x] 部门效能表补上月对照：任务量（今日 / 上月日均）、内返率（今日 / 上月）、出货率（今日 / 上月），完成达成率标注「今日」。
- [x] 部门表移除两处硬编码「待接入」；外返 / 客诉按订单登记、不绑定工序节点，无法归属部门，改为表下注释说明，只在全厂指标中统计。
- [x] 新增独立「本月 vs 上月」对比图（`csMonthOverMonthBars`）：订单数 / 件数 / 发货率三项，均有后端真实上月值。完成达成率无上月同口径基准，明确不纳入。

Verification：

```bash
npm run build:frontend
npm run check:goal-034-dashboard-metrics
```

结果：`vue-tsc -b` 通过；`check:goal-034-dashboard-metrics` 通过；`check:customer-dashboard-attention`、`check:admin-dashboard-workbench`、`check:production-kanban-redesign`、`check:prd-v2-gap-closure-d` 均无回归。

---

## G2. 指标真实化 —— `COMPLETED`（2026-08-02）

Scope：

- [x] 客诉率接真实事实表：`quality_record.record_type = 'EXTERNAL_RETURN'`（客服登记的外返）计数 ÷ 出检订单数。与 `external_rework_rate`（按 `rework_record.responsibility_type` 分类）是不同事实，不重复。
- [x] 新增 `complaint_count` 字段，便于核对分子。
- [x] 退货率显式置空：`return_rate` 改为可空并固定返回 `null`，前端显示「口径未启用」。所依赖的「退货订单」类型要到 TASK-034 F 才引入。
- [x] 前端新增 `formatOptionalRate`（App.vue）与 `optionalRate`（AdminRemainingPages.vue），null 一律显示「口径未启用」，不退化成 0%。
- [x] Top10 客户带上月对照：`topCustomers` 改为单次查询覆盖上月 + 本月两个窗口，新增 `previous_month_order_count` / `previous_month_item_count` / `order_count_delta` / `item_count_delta`。排名仍按本月（一期 B 类口径），`HAVING order_count > 0` 保证榜单语义不变。
- [x] 修正把假数据锁死的既有测试：`CheckWorklogPerformanceTests` 原本断言 `complaint_rate = 0` 且 `return_rate = 0`。
- [x] 新增 `productionQualitySummaryComputesComplaintRateFromRegisteredExternalReturns`：登记外返前后各查一次汇总，证明客诉率随真实数据变化。
- [x] `PhaseOneDashboardTests` 新增上月对照断言。
- [x] 同步 `docs/api/openapi.yaml`。

Verification：

```bash
npm run check:openapi
npm run check:goal-034-dashboard-metrics
```

结果：OpenAPI 159 paths / 183 operations 校验通过（swagger-cli + Redocly）；目标后端测试 `PhaseOneDashboardTests` 2 项、`CheckWorklogPerformanceTests` 21 项全部通过。

**未做且不打算做**：部门级外返率 / 客诉率。外返登记创建的 `rework_record` 的 `from_node_instance_id` / `target_node_instance_id` 均为 `NULL`，`check_record.node_instance_id` 同样为 `NULL`，当前数据模型无法把外返归属到部门。若客户确需部门拆分，须先在外返登记表单增加「责任部门 / 工序」字段，属业务语义变更，另立需求。

---

## G3. AI 能力增强（AI-6 FAQ / AI-7 智能推荐）—— `planned`

前提：真实模型链路已通。`.env` 中 `AI_PROVIDER=langchain-deepseek`、`AI_DEEPSEEK_ENABLED=true`、`AI_LANGCHAIN_ENABLED=true`、`DEEPSEEK_API_KEY` 已配置（`application.yml:73` 绑定），TASK-033 已修掉 demo 脚本内联覆盖 `AI_PROVIDER` 的问题。

Scope：

- [ ] **AI-6 牙科 FAQ**：新增 `POST /ai/faq`。新建 `ai_faq_entry` 表（问题 / 答案 / 分类 / 状态 / 排序 / 版本），管理端可维护；按分类取条目拼入 system prompt 作为知识上下文，模型只允许基于给定条目作答，无命中回「该问题需联系客服」。医生端 `POST /ai/order-query` 在订单问题无命中时兜底转 FAQ。
- [ ] **AI-7 智能推荐产品**：新增 `POST /ai/product-recommendation`。上下文 = 诊所历史下单产品分布 + `product_catalog` 正式目录 + 当前病例已填字段；输出结构化 top-N 推荐与理由，只作建议，医生显式选择才生效，不自动填表。
- [ ] 两者复用 `AiGatewayService` 既有骨架：`enforceAiRateLimit` → `completeWithModel`（含 deterministic fallback）→ 审计写入 → `OUTPUT_GUARD_PATTERNS` 输出防护。
- [ ] 医生端入口继续受 `DOCTOR_INTERNAL_KEYWORDS` 的 AI-3 安全读边界约束，不得因新增入口绕开内部信息拒答。

Acceptance：

- [ ] FAQ 与推荐在真实 key 环境各留一份问答记录到 `docs/acceptance/`。
- [ ] 越权测试：医生通过 FAQ 入口拿不到内部工序 / 员工 / 返工 / 绩效信息。
- [ ] key 失效时返回 deterministic fallback，不抛 500。
- [ ] FAQ 示例条目在界面标注「示例内容，待甲方确认」。

---

## G4. 客服端设置落地 —— `blocked`（等 TASK-034 A 批次）

Scope：

- [ ] **客户分配**：`clinic` 增加 `owner_cs_user_id`（外键 `system_user`）；新建 `clinic_assignment_history`（客户 / 原负责人 / 新负责人 / 操作人 / 时间 / 原因）。分配与批量转移 API 走独立权限码 `clinic:assign`。替换 `CsPortalPages.vue` 的占位块，摘掉 `App.vue` 中 `cs-account-assignment` 的 `placeholder: true`。
- [ ] 为「高级客服 = 分配客户」新增 `data_scope` 档位 `ASSIGNED`，过滤条件接进 `PhaseOneDashboardService.scopedWhereClause()` 等既有链路。**必须在 TASK-034 A 把 `data_scope` 提到角色级之后做**，否则要在用户级和角色级各写一遍。
- [ ] 转移语义与 TASK-034 D 一致：只改当前负责关系，历史记录保留原责任人。
- [ ] **常用回复**：新建 `quick_reply` 表（团队 / 个人范围、分类、内容、状态、排序、创建人）+ CRUD API + 客服端维护界面；医生端 `DoctorPortalV2.vue` 的三条硬编码快捷回复改为读接口。快捷回复只填入输入框，不自动发送。

Acceptance：

- [ ] 无 `clinic:assign` 权限码的账号调用分配接口返回 403。
- [ ] 普通客服看不到未分配给自己的客户。
- [ ] 转移后历史节点仍显示原责任人。
- [ ] 医生端与客服端的快捷回复全部来自接口，代码中无硬编码话术。

---

## 待甲方确认

1. **客诉率口径**：当前按「客服登记的外返」计算，分母为出检订单数。需甲方确认。
2. **退货率**：一期置空。若一期就要数值，需先引入「退货订单」类型（TASK-034 F）。
3. **部门级外返 / 客诉**：当前数据模型无法归属部门。若确需，须在外返登记增加责任部门 / 工序字段。
4. **FAQ 正式语料**：结构本批建好，正式条目待甲方提供。
