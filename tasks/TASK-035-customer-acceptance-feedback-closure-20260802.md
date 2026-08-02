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

## G3. AI 能力增强（AI-6 FAQ / AI-7 智能推荐）—— `COMPLETED`（2026-08-02）

前提：真实模型链路已通。`.env` 中 `AI_PROVIDER=langchain-deepseek`、`AI_DEEPSEEK_ENABLED=true`、`AI_LANGCHAIN_ENABLED=true`、`DEEPSEEK_API_KEY` 已配置（`application.yml:73` 绑定），TASK-033 已修掉 demo 脚本内联覆盖 `AI_PROVIDER` 的问题。

Scope：

- [x] **AI-6 牙科 FAQ**：新增 `POST /ai/faq` 与 `ai_faq_entry` 表（V77），种子 10 条我方拟定的牙科通用条目，全部标记 `SAMPLE_PENDING_CUSTOMER_CONFIRMATION`。命中条目拼入 system prompt 作为知识上下文，模型只允许基于条目作答；无命中返回 `NO_MATCH` 并引导联系客服，且不调用模型。
- [x] 医生端订单助手在问题定位不到订单时兜底转 FAQ，不再直接报「请选择订单」。
- [x] **AI-7 智能推荐产品**：新增 `POST /ai/product-recommendation`。候选集只来自当前生效目录版本（`publication_status = 'ACTIVE'`），上下文含诊所历史下单分布与病例描述。
- [x] 两者复用 `AiGatewayService` 既有骨架：`enforceAiRateLimit` → `completeWithModel`（含 deterministic fallback）→ 审计写入 → `OUTPUT_GUARD_PATTERNS`。
- [x] 治理链路的 `orderId` 由 `long` 放宽为 `Long`：`ai_audit_log.order_id` 与 `notification_event.order_id` 本就可空，只是此前没有不依附订单的智能体。`loadOrderNo` 已加空值分支。
- [x] 医生端入口继续受 `DOCTOR_INTERNAL_KEYWORDS` 约束：命中内部关键词时本地拒答并留审计，**不向模型发送任何上下文**。
- [x] 前端：医生端订单助手新增常见问题快捷入口；下单向导新增「智能推荐」卡片，推荐项须点击「采用」才加入订单。
- [x] 同步 `docs/api/openapi.yaml`（`postAiFaq` / `postAiProductRecommendation` 及四个 schema）。

Acceptance：

- [x] 真实 key 环境联调记录见 `docs/acceptance/goal-034-ai-faq-and-recommendation-real-model-record.md`；`ai_audit_log.model_name = langchain-deepseek-chat` 证明走的是真实 DeepSeek 而非兜底桩。
- [x] 越权测试：`workerCannotUseFaqOrProductRecommendation`（403）、`doctorFaqRefusesInternalQuestionsWithoutCallingTheModel`（SAFE_REFUSAL + 审计）。
- [x] key 未启用时走 deterministic fallback，不抛 500（测试环境即为该路径，26 项 AiGatewayTests 全绿）。
- [x] FAQ 示例条目通过 `requires_customer_confirmation` 标记，界面追加「以上内容引自常见问题库的示例语料，待甲方确认」。

**防幻觉设计**：模型被要求末尾输出 `RECOMMENDED_IDS: <编号>` 一行，服务端解析后**与候选集取交集**才生成推荐卡片，不在候选集内的编号一律丢弃；模型未给出可用编号时退回「按诊所历史下单分布排序」的服务端规则。该行在返回前剥离，不出现在界面文案。首轮联调曾出现卡片与说明给出两套不同产品，已按此收口为一致结果。

Verification：

```bash
npm run check:goal-034-ai-knowledge
npm run check:openapi
```

结果：`AiGatewayTests` 26 项、`AiGatewayDeepSeekTests` 16 项、`AiExternalAlertSenderTests` 9 项全绿；OpenAPI 校验通过；前端 `vue-tsc -b` 通过。

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
