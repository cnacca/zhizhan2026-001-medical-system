# AI 智能下单平台一期收口技术方案

状态：EXECUTABLE_DRAFT / NOT_READY。

更新日期：2026-07-07。

## Summary

本方案是一期收口的可执行稿，不是方向稿。目标是把当前一期收口工作拆成可验证、可回写、可交接的执行阶段：先校准状态基线，再优先处理客户 / PM 确认项与真实环境 AI 验收材料，随后关闭 PRD V2 本地可完成差异，最后统一验收和文档回写。

Task 8 继续保持 `NOT_READY`。真实 DeepSeek key、真实 webhook、客户生产备注模板、客户签字、真实部署和真实对象存储验收没有完成前，不允许写成 READY。

本方案只要求改文档、验收矩阵和检查脚本；不要求改后端业务代码、前端业务代码、数据库迁移或真实环境配置。

## RepoFrame 纳入状态

本文件已于 2026-07-07 作为一期收口伞形技术方案纳入 handoff worktree：`/Users/yuri/Documents/AI智能下单平台-handoff-20260706`。

RepoFrame 记录：

- 纳入目标：`goals/GOAL-005-phase-one-closure-plan-integration-20260707.md`
- 纳入任务：`tasks/TASK-006-phase-one-closure-plan-integration-20260707.md`
- 机器检查：`npm run check:phase-one-closure-plan`

本文件不是重新初始化项目，也不是声明一期已完成。它用于约束后续任务拆解、验收命令和硬边界。GOAL-004 / TASK-005 已在本方案讨论后完成 A/B 类一期范围对齐第二段；后续任务应继续从本文档的阶段、`acceptance.json` 的 gap id、PRD V2 差异矩阵和 Task 8 readiness 缺口中拆分。

## Current Baseline

当前仓库以 `/Users/yuri/Documents/AI智能下单平台-handoff-20260706` 为准，文档基线包括：

- `STATUS.md`
- `tasks/README.md`
- `README.md`
- `DECISIONS.md`
- `acceptance.json`
- `docs/acceptance`
- `docs/deployment`

当前一期主要缺口按 `acceptance.json` 的 gap id 对齐：

| gap id | 当前状态 | 执行含义 |
| --- | --- | --- |
| `customer-pm-confirmations` | `BLOCKED` | 客户 / PM 确认项仍未书面关闭，开发侧只能维护确认表、阻塞状态和检查脚本。 |
| `ai-production-governance` | `PARTIAL` | 已有本地治理、LangChain + DeepSeek 底座、AI-5 默认模板和验收模板，但真实 key / webhook 未联调。 |
| `prd-v2-local-feature-gaps` | `PARTIAL` | 本地第一增量较完整，但质量模型、生产支撑模块完整闭环、AI 真实环境和客户确认仍未完成。 |
| `frontend-business-pages` | `PARTIAL` | 页面具备演示和多段真实接口第一增量，但仍缺真实外部服务、完整客户验收和若干管理闭环。 |

状态基线特别要求：

- 9D.90 产品参数 / 价格体系一期最小后台：已完成第一增量，不能再写成下一步。
- 9D.91 客服配送管理页 / 物流异常跟进：已完成第一增量，不能再写成下一步。
- 9D.92 AI-2 客服查询助手完整入口：已完成第一增量，不能再写成下一步。
- 9D.97 AI-2 客服查询引用数据说明 / 知识上下文补强：已完成第一增量。
- 9D.98 AI-5 生产备注客户模板 / 知识上下文补强：已完成第一增量，但客户正式模板、真实 key、webhook 和签字仍是阻塞项。

## Execution Phases

### 第零段：状态基线校准

目标：先只做文档和验收矩阵一致性校准，不实现新业务功能。

执行内容：

- 对齐 `STATUS.md`、`tasks/README.md`、`README.md`、`DECISIONS.md`、`acceptance.json`、`docs/acceptance`、`docs/deployment`。
- 修正“已完成项还写成下一步”的问题，特别是 9D.90、9D.91、9D.92、9D.97、9D.98。
- 检查 `acceptance.json` 中 `frontend-business-pages`、`prd-v2-local-feature-gaps`、`ai-production-governance`、`customer-pm-confirmations` 的状态和 next loop 是否仍指向旧任务。
- 补 `npm run check:phase-one-closure-plan`，让上述状态基线可机器检查。
- Task 8 保持 `NOT_READY`，不得改成 READY。

验收方式：

- `npm run check:phase-one-closure-plan`
- `npm run check:task8-readiness-gaps`
- `npm run acceptance`
- `git diff --check`

### 第一段：客户 / PM 确认项与真实环境 AI 验收收口

目标：把当前下一步指针提前到客户 / PM 确认项与真实环境 AI 验收收口。只做确认表、验收记录模板、阻塞状态和检查脚本，不伪装真实外部验收。

对应 gap id：

- `customer-pm-confirmations`
- `ai-production-governance`

执行内容：

- 复核 `docs/acceptance/phase-one-customer-pm-confirmations.md`，确保 CP-001 到 CP-009 都有负责人、确认状态、阻塞原因和后续动作。
- 复核 `docs/acceptance/task-9d80-ai-production-integration-acceptance.md`，保持真实 DeepSeek key、真实 webhook、signing secret、receiver secret、客户 / PM 签字为 `待填写` / `待确认`。
- 复核 `docs/deployment/task-9d81-production-deployment-acceptance.md`，保持真实服务器、HTTPS、备份恢复、日志留存、监控告警、发布回滚为 `待填写` / `待确认`。
- 复核 AI-5 生产备注模板状态，保持 `requires_customer_template_confirmation` 和“客户模板未确认”语义，不把 `PHASE_ONE_DEFAULT_V1` 写成客户正式模板。

验收命令：

```bash
npm run check:task9d72
npm run check:task9d80
npm run check:task9d81
npm run check:task8-readiness-gaps
```

本阶段不做：

- 不接入真实 DeepSeek key。
- 不填写真实 webhook URL 或 signing secret。
- 不把客户生产备注模板写成已确认。
- 不把客户 / PM 签字写成已完成。

### 第二段：PRD V2 本地功能差异收口

目标：不使用 A/B 类口径，直接按 PRD V2 和 `acceptance.json` gap id 收口。每个小任务必须明确目标接口、页面、OpenAPI、检查脚本、后端测试或前端 smoke。

对应 gap id：

- `prd-v2-local-feature-gaps`
- `frontend-business-pages`
- `ai-production-governance`

当前必须保持一致的本地完成项：

| 小任务 | 目标接口 | 目标页面 | OpenAPI | 检查脚本 | 后端测试 / smoke |
| --- | --- | --- | --- | --- | --- |
| 9D.90 产品参数 / 价格体系 | `GET /products`、`POST /products`、`PUT /products/{productId}` | `/system/form-configs` 产品目录 / 基础价维护 | 已同步 `docs/api/openapi.yaml` | `npm run check:task9d90` | `ProductCatalogTests`、`npm run build:frontend` |
| 9D.91 配送管理 / 异常跟进 | `GET /logistics/orders`、`POST /orders/{orderId}/logistics/exception` | `/delivery` | 已同步 `docs/api/openapi.yaml` | `npm run check:task9d91` | `MessageDesignBillNotificationTests`、`npm run build:frontend` |
| 9D.92 AI-2 客服查询入口 | `POST /ai/cs-query` | `/ai/cs` | 复用既有 AI-2 契约 | `npm run check:task9d92` | 前端静态检查、`npm run build:frontend` |
| 9D.97 AI-2 引用数据说明 | `POST /ai/cs-query`，响应含 `reference_data_notes` | `/ai/cs` 展示“引用数据说明” | 已同步 `docs/api/openapi.yaml` | `npm run check:task9d97` | `AiGatewayTests#csQueryReturnsReferenceDataNotesForAuditableInternalSources` |
| 9D.98 AI-5 模板上下文 / 人工确认 | `POST /ai/production-note`、`POST /ai/production-note/confirm` | 客服初审页 AI-5 草稿和人工确认写入入口 | 已同步 `docs/api/openapi.yaml` | `npm run check:task9d98` | `AiGatewayTests#productionNoteDraftUsesDefaultTemplateAndHumanConfirmationWritesOrderNote` |

前端业务页判定规则：

- 能调用真实接口并有检查脚本或 smoke 的页面，写成“真实接口第一增量 / PARTIAL”。
- 仍依赖演示数据、真实外部服务、客户签字或真实环境的页面，写成“仍待验收 / PARTIAL”或 `BLOCKED`。
- 不允许把真实支付系统、真实物流平台、真实电子签章、真实 DeepSeek key、真实 webhook 或客户签字写成已完成。

### 第三段：生产支持模块 PARTIAL 收口

目标：设备、物料、安环、成本、奖惩只能写成“一期基础可演示闭环 / PARTIAL”，不能写成 READY。

当前允许表达为已完成的内容：

- 基础台账或记录录入。
- 状态更新的第一增量。
- 只读汇总。
- 权限隔离。
- 前端入口可演示。
- 本地检查脚本可验证。

仍缺内容必须保留：

- 设备编辑 / 事件状态更新。
- 物料编辑 / 处理历史。
- 安环复查 / 完整审批。
- 成本编辑 / 审批。
- 奖惩编辑 / 复杂审批。
- 真实趋势和完整验收。

是否继续补到 READY，必须依赖客户 / PM 是否把这些列为一期硬交付；未确认前不扩大范围。

对应文档：

- `docs/acceptance/phase-one-production-support-closure-plan.md`
- `docs/acceptance/prd-v2-gap-matrix.md`
- `docs/deployment/readiness-checklist.md`
- `docs/deployment/task-8-final-readiness-report.md`

### 第四段：统一验收与文档回写

目标：每个阶段结束后同步记录完成内容、未完成原因、验证命令、外部阻塞和下一步建议。

回写对象：

- `STATUS.md`
- `tasks/README.md`
- `README.md`
- `DECISIONS.md`
- `acceptance.json`
- `docs/acceptance/*`
- `docs/deployment/*`

统一验收前必须确认：

- 文档不再把 9D.90、9D.91、9D.92、9D.97、9D.98 写成下一步。
- `customer-pm-confirmations` 仍为 `BLOCKED`。
- `ai-production-governance`、`prd-v2-local-feature-gaps`、`frontend-business-pages` 仍为 `PARTIAL`。
- Task 8 仍为 `NOT_READY`。

## Test Plan

统一验收命令清单：

```bash
npm run check:phase-one-closure-plan
npm run check:task9d72
npm run check:task9d80
npm run check:task9d81
npm run check:task9d97
npm run check:task9d98
npm run check:task8-readiness-gaps
npm run check:openapi
npm run build:frontend
npm run acceptance
git diff --check
```

如涉及具体页面或接口，还要补充对应后端目标测试、前端 smoke 或检查脚本。任何失败都先定位原因，再决定是否修复或标记为真实外部阻塞。

## Hard Boundaries

- 不 `git add` / commit / push。
- 不接入或伪造真实 DeepSeek key。
- 不伪造真实 webhook。
- 不伪造客户生产备注模板。
- 不伪造客户签字。
- 不把 Task 8 标成 READY。
- 不把真实环境部署、对象存储、AI 联调、webhook 联调写成已完成。
- 不回滚已有用户改动。

## Remaining Blockers

- 客户 / PM 尚未书面确认 CP-001 到 CP-009。
- 真实 DeepSeek key 尚未在真实环境联调。
- 真实 webhook、signing secret、接收端验签 / 防重放尚未生产联调。
- 真实测试 / 正式对象存储 bucket、弱网、跨设备验收尚未完成。
- 真实服务器、HTTPS、备份恢复、监控告警、发布回滚尚未验收。
- 设备、物料、安环、成本、奖惩是否必须补到一期 READY，仍依赖客户 / PM 最终范围确认。
