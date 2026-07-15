# AI 智能下单与生产协同平台

牙科定制工厂一期系统：医生在线下单，客服审核协同，工厂按预定义工艺流生产，逐道工序入检/出检/记工时，客户只能查看外部简化进度。

## 当前仓库状态

2026-07-15 最新完成阶段为 `goals/GOAL-022-prd-v2-p0-local-closure-20260715.md` / `tasks/TASK-023-prd-v2-p0-local-closure-20260715.md`。本阶段关闭 workflow 定义/实例内部访问边界、loopback 登录 CORS、按产品类型自动选链、设计确认/OUT-PASS 生产门禁，以及管理员创建/编辑技工账号并登录的本地闭环。原 PRD 验收表38项入口为 `docs/acceptance/prd-v2-38-item-acceptance-audit-20260715.md`，当前重算为21 PASS、8 PARTIAL、1 MISSING、8 EXTERNAL_ACCEPTANCE；表外 A/B/C 范围、剩余页面分支、无 token 读取边界和上线 readiness 仍独立跟踪，不能只凭38项宣称整个一期完成。Task 8 继续保持 `NOT_READY`；真实支付、物流 API、电子签章、STL 在线查看器、RAG 和 tool calling 不作为一期 P0 阻塞。

下方 2026-07-07 各段出现的 handoff 工作区路径和“当前 active goal”都是阶段历史记录，不再代表当前工作区或执行指针；当前工作区为 `/Users/yuri/Documents/AI智能下单平台`，如有冲突以 GOAL-021 / TASK-022、D-162 和 38 项审计矩阵为准。

当前工作区为 `/Users/yuri/Documents/AI智能下单平台-handoff-20260706`，属于已有项目的 RepoFrame `repo-hydrate` 后续执行，不是重新初始化。当前 active goal 是 `goals/GOAL-020-deployment-ops-local-hardening-20260707.md`，active task 是 `tasks/TASK-021-deployment-ops-local-hardening-20260707.md`，正在执行部署 / 运维本地补强：新增 `npm run check:deployment-ops-local-hardening` 和 `npm run dry-run:phase-one-release-rollback`，并补 `docs/deployment/phase-one-local-ops-dry-run.md`、本地 release / rollback dry-run、备份 / 恢复 dry-run 模板第一段、日志留存 / 监控告警配置模板第一段、compose / env / Nginx / healthcheck 静态检查和 readiness 联动。Task 8 继续保持 `NOT_READY`；本阶段不声明真实服务器 / HTTPS / 备份恢复 / 日志留存 / 监控告警 / 发布回滚演练 / 客户培训签收 / 客户签字 / 真实环境验收完成。

当前工作区为 `/Users/yuri/Documents/AI智能下单平台-handoff-20260706`，属于已有项目的 RepoFrame `repo-hydrate` 后续执行，不是重新初始化。当前 active goal 是 `goals/GOAL-019-ai-production-governance-local-hardening-20260707.md`，active task 是 `tasks/TASK-020-ai-production-governance-local-hardening-20260707.md`，正在执行 AI 生产治理本地补强：新增 `npm run check:ai-production-governance-local-hardening`，并补 `GET /ai/governance/local-hardening`、管理端 `/admin/ai-governance` 只读页面、AI-3 安全矩阵回归、OpenAPI 和验收 / readiness 文档回写。Task 8 继续保持 `NOT_READY`；本阶段不声明真实 key / webhook / 客户正式模板 / 客户签字 / 真实环境验收完成。

当前工作区为 `/Users/yuri/Documents/AI智能下单平台`，属于已有项目的后续执行，不是重新初始化。当前 active goal 是 `goals/GOAL-023-prd-v2-local-remainder-closure-20260715.md`，active task 是 `tasks/TASK-024-prd-v2-local-remainder-closure-20260715.md`：本地 PRD V2 原38项已收敛为 **30 PASS / 1 PARTIAL / 0 MISSING / 7 EXTERNAL_ACCEPTANCE**，并已在隔离 demo 跑通种植订单 + 真实 STL 的12步主链。Task 8 继续保持 `NOT_READY`；本阶段不声明真实支付 / 物流 / 签章 / key / webhook / 客户签字 / 真实环境验收完成。

当前工作区为 `/Users/yuri/Documents/AI智能下单平台-handoff-20260706`，属于已有项目的 RepoFrame `repo-hydrate` 后续执行，不是重新初始化。GOAL-017 / TASK-018 已完成四端前端产品化体验收口：新增 `npm run check:frontend-productization-closure`，把客服设计稿 / 账单入口、生产 C 类本地第一增量入口、管理端账号 / 角色 / 权限入口和统一加载态 / 空态 / 错误态 / 权限拒绝态收拢为本阶段入口。`frontend-business-pages` 继续保持 `PARTIAL`，Task 8 继续保持 `NOT_READY`；本阶段不恢复医生文件独立模块，不扩大 C 类为完整闭环，不声明真实支付 / 物流 / 签章 / key / webhook / 客户签字 / 真实环境验收完成。

当前工作区为 `/Users/yuri/Documents/AI智能下单平台-handoff-20260706`，属于已有项目的 RepoFrame `repo-hydrate` 后续执行，不是重新初始化。当前 active goal 是 `goals/GOAL-016-auth-datascope-production-closure-b-20260707.md`，active task 是 `tasks/TASK-017-auth-datascope-production-closure-b-20260707.md`，已完成权限 / DataScope 生产化补强 B：新增 `npm run check:auth-datascope-prod-closure-b`，把 refresh token 轮换目标测试、后端轮换实现、OpenAPI 语义、`auth-datascope-prod` readiness 边界和 RepoFrame 指针收拢为当前阶段入口。`auth-datascope-prod` 继续保持 `PARTIAL`；GOAL-015 / TASK-016 操作手册 / 回滚 / 培训材料本地收口、GOAL-014 / TASK-015 WebSocket / 通知生产 readiness 收口、GOAL-013 / TASK-014 四端业务页面与客户验收 smoke 收口、GOAL-012 / TASK-013 权限 / DataScope 生产化收口第一段仍作为已完成历史保留。Task 8 继续保持 `NOT_READY`。

历史阶段锚点保留：GOAL-014 / TASK-015 的 `check:websocket-notification-readiness-closure` 继续约束 `websocket-notification-prod` 为 `PARTIAL`；GOAL-013 / TASK-014 继续约束 `frontend-business-pages` 为 `PARTIAL`，不把本地 smoke 写成客户签字或真实环境验收。

当前总目标是严格按照最新版 PRD V2.0 / 2026-07-04 完成一期交付。后续所有 9D 小任务都只作为补齐一期 12 步主链路、PRD V2.0 差异矩阵和上线硬缺口的执行单元；最新版 PRD 差异基线见 `docs/acceptance/prd-v2-gap-matrix.md`，前端是否匹配一期范围见 `docs/acceptance/phase-one-frontend-alignment.md`，按端口拆任务、处理已完成和超一期入口时使用 `docs/acceptance/phase-one-frontend-task-scope.md`。

一期收口伞形技术方案已纳入 `docs/development/phase-one-closure-technical-plan.md`，由 GOAL-005 / TASK-006 管理，并通过 `npm run check:phase-one-closure-plan` 检查。后续拆任务时优先对齐该方案的阶段、`acceptance.json` gap id、PRD V2 差异矩阵和 Task 8 readiness 缺口。

一期收口执行 workflow 已纳入 `docs/development/workflow.md`，每窗口阶段级 goal 启动模板已纳入 `docs/development/stage-goal-window-guide.md`，由 GOAL-006 / TASK-007 管理，并通过 `npm run check:phase-one-workflow` 与 `npm run check:stage-goal-window` 检查。当前 GOAL-016 / TASK-017 延续该规则，在执行批次 task 内拆 checklist，并新增 `npm run check:auth-datascope-prod-closure-b` 检查权限 / DataScope 生产化补强 B、refresh token 轮换、RepoFrame 指针、`auth-datascope-prod` 边界和 Task 8 `NOT_READY`。

GOAL-009 / TASK-010 PRD V2 本地功能差异收口 C 已完成，历史检查入口为 `npm run check:prd-v2-gap-closure-c`。GOAL-008 / TASK-009 PRD V2 本地功能差异收口 B 已完成，历史检查入口为 `npm run check:prd-v2-gap-closure-b`。GOAL-007 / TASK-008 PRD V2 本地功能差异收口 A 已完成，历史检查入口为 `npm run check:prd-v2-gap-closure-a`。

GOAL-009 / TASK-010 的历史完成项为 AI-2 `/ai/cs-query` `attachment_contexts` 附件预览上下文第一段；GOAL-010 / TASK-011 在此之后完成 PRD V2 本地功能差异收口 D：本地月度趋势 / 客户排名聚合第一段，历史检查入口为 `npm run check:prd-v2-gap-closure-d`；GOAL-011 / TASK-012 在本地 PRD V2 队列收口后建立客户 / PM 确认项与真实环境 AI 验收收口闸门，历史检查入口为 `npm run check:real-acceptance-confirmation`；GOAL-012 / TASK-013 已完成权限 / DataScope 生产化收口第一段，历史检查入口为 `npm run check:auth-datascope-prod-closure`；GOAL-015 / TASK-016 已完成操作手册 / 回滚 / 培训材料本地收口，历史检查入口为 `npm run check:operations-rollback-training-closure`，并继续约束 `operations-manuals` 为 `PARTIAL`；GOAL-016 / TASK-017 已完成权限 / DataScope 生产化补强 B，历史检查入口为 `npm run check:auth-datascope-prod-closure-b`。

当前已完成项目工作流初始化、任务 0 到任务 8B 基线、任务 9A 到 9B.8 权限/DataScope 第一轮、任务 9C.1 到 9C.3 通知第一轮，以及任务 9D.1 到 9D.100 的多条一期硬缺口第一增量；其中 9D.83 已补患者管理基础版，9D.84 已补人工支付流水 / 收支记录，9D.85 已补客户 / 诊所档案与偏好，9D.86 已补人员档案 / 工作量看板，9D.87 已补质量记录 CRUD / 外返登记，PRD V2 本地功能差异收口 B 已补 `quality_record` 独立事实表和质量记录状态工作流第一段，9D.88 已补客服订单 / 沟通完整可见性 smoke，9D.89 已补医生账户设置基础闭环，9D.90 已补产品参数 / 价格体系一期最小后台，9D.99 已补 A/B 类一期范围对齐第一段，9D.100 已补 A/B 类一期范围对齐第二段。9D.100 新增 `npm run check:task9d100`，并让客服 / 生产工作台统计复用现有本地接口：订单列表、待审消息、质量返工、账单 / 物流人工状态、人员工作量和生产支持汇总。2026-07-13 追加 `/dashboards/sales` 经营金额聚合与账单最终应收金额录入：客服 / 管理工作台展示本年接单金额、出货金额、去年同期、同比、覆盖率和四线月度趋势，医生端只读查看本订单应收金额。真实支付平台、真实物流平台、客户 / PM 最终统计口径和客户最终质量口径仍为 PARTIAL / BLOCKED。Task 8 总体仍为 `NOT_READY`。

2026-07-05 交接摘要：Task 8 总体仍为 `NOT_READY`；9D.48、9D.48.1、9D.48.2 已完成 AI 外部告警 outbox 监控、列表筛选和失败/死信可见性第一增量；Task 8 readiness 终检报告、部署安全 / 环境变量 readiness 检查和验收矩阵机器可读缺口清单第一增量已完成；9D.55 已按 RuoYi-Vue-Pro / 若依 Pro 的字典、CRUD、菜单、权限码范式补返工字典后台维护第一增量；9D.56 已补 `final-inspection:manage`、`final_inspection_report_file` 和终检报告 `attachment_file_ids`；9D.57 已补 `/rework-final` 返工影响只读图；9D.58 客服协同闭环第一增量已补客服端 `/collaboration` 待审核消息、订单消息上下文和消息通过/驳回入口；9D.59 客服资料缺失提示与 AI 翻译草稿确认第一增量已补客服初审页资料缺失提示、AI 翻译草稿和人工写入生产备注入口；9D.60 设计稿预览 URL 聚合第一增量已补医生端设计稿版本按需预览链接；9D.61 账单物流预览/录入闭环第一增量已补客服/内部账单文件绑定和医生端账单预览链接；9D.62 到 9D.63 已把 12 步主链路 smoke 推进到固定演示订单、派工、入检/工时/出检、设计稿、账单物流、确认收货和返工异常路径；9D.64 客服端设计稿审核预览增强第一段已补客服端设计稿版本列表和客服设计稿预览链接；9D.65 已补终检报告内部 PDF file_id 绑定和 `signature_status=PENDING` 签名占位；9D.66 已补绩效周期筛选第一段；9D.67 文件上传限制与 bucket 隔离第一段已补 `FILE_MAX_FILE_SIZE_BYTES`、`FILE_ALLOWED_CONTENT_TYPES`、`FILE_MAX_FILES_PER_ORDER` 服务端校验和医生端选择提示；9D.68 12 步主链路客户验收版收敛已新增 `docs/acceptance/phase-one-main-chain-customer-acceptance.md`；9D.69 部署基础设施第一段已新增 `backend/platform-server/Dockerfile`、`frontend/Dockerfile`、`deploy/docker-compose.phase-one.yml`、`deploy/env/phase-one.prod.example` 和 `docs/deployment/phase-one-docker-env.md`；9D.70 操作手册与交付材料第一段已新增 `docs/operations/phase-one-role-operation-manual.md`、`docs/operations/phase-one-troubleshooting-guide.md` 和 `docs/operations/phase-one-delivery-materials-index.md`；9D.71 AI 外部告警接收端验签 / 防重放第一段已新增 `/ai/external-alerts/receive` 本地接收端验收桩和 timestamp / nonce 签名口径；9D.72 客户 / PM 确认项清单第一段已新增 `docs/acceptance/phase-one-customer-pm-confirmations.md`；9D.73 账单 / 付款状态 / 物流一期闭环第一段已新增 `order_bill.payment_status`、`/orders/{orderId}/bill/payment-status` 和前端人工维护付款状态入口；9D.74 绩效标准工时与完整公式口径第一段已新增 `performance_formula_version=PHASE_ONE_DEFAULT_V1`、标准工时覆盖率和默认绩效分；9D.75 正式鉴权与 DataScope 收口第一段已新增 `APP_AUTH_ALLOW_ROLE_FALLBACK`，生产环境固定权限码优先，角色-only token 不再绕过声明权限码的接口。`acceptance.json` 现在维护 `task8_readiness_gaps`、9D.55 到 9D.75 必备文本检查，可通过 `npm run check:task8-readiness-gaps` 查看当前上线缺口。下一轮唯一推荐目标是 WebSocket / 通知生产验收第一段。继续开发前请从 `STATUS.md` 和 `tasks/README.md` 的当前交接摘要开始。

9D.57 返工影响图形化第一增量：已补 `/rework-final` 返工影响只读图。

2026-07-04 上传交接摘要：`feature/project-skeleton` 已推送到 GitHub；本轮业务开发基线为 `5e9ee18`，后续文档回补提交不改变业务代码边界。本轮提交已按边界拆分：`1895f79` 生产汇总、`f395584` AI 治理、`c781eae` Task 8 文档回写、`5e9ee18` workflow helper 整理。当前工作区只剩未跟踪 `test-results/` 运行产物，未纳入提交。9D.49 到 9D.54 已完成生产端质量、设备、物料异常、安环、成本、奖惩六类真实只读汇总第一增量；后续仍缺录入/审批/CRUD、演示种子数据、工作台趋势真实统计和完整业务验收用例。

2026-07-03 前端演示交接摘要：9D.36 已按客户反馈完成四端导航结构修正，左侧栏和工作台快捷入口同源，主功能包含子功能；医生端订单页已拆出新建订单、我的订单、设计稿确认、账单物流、沟通留言、订单助手子栏目；客服端、生产端、管理端新增演示入口走中文占位页，管理端点击复用业务 route 时仍保持管理端菜单模板。追加按旧版 HTML 原型锁定四端主题：医生蓝、客服紫、生产青、管理端深石墨管理蓝；点击侧栏功能不会改变当前端口的侧栏结构和颜色。最新追加：四入口登录后默认进入工作台；工作台不再重复左侧栏功能入口，改为四端业务仪表盘；KPI 黑色图标已移除；工作台新增演示级趋势图；订单、生产、设计稿/数据处理类页面补快速筛选 chip、队列卡片、彩色状态 badge 和高密度表格视觉，chip 已补点击选中态和已有接口筛选联动。已通过 `npm run check:task9d36`、`npm run check:task9d24`、`npm run acceptance`、`npm run build:frontend`、`npm run smoke:task9d24`、`npm run smoke:task9d36`、`git diff --check` 和四端真实点击矩阵。

接手请先读：

```text
AGENTS.md
STATUS.md
PROJECT.md
DECISIONS.md
tasks/README.md
.repo-init/README.md
```

RepoFrame 生成的 `AGENT.md` 和 `.agent/` 保留为协作细则入口；Codex 默认以 `AGENTS.md` 为项目规则入口。

当前任务入口：

```text
goals/GOAL-004-phase-one-ab-data-closure-20260707.md
tasks/TASK-005-phase-one-ab-data-closure-20260707.md
goals/GOAL-005-phase-one-closure-plan-integration-20260707.md
tasks/TASK-006-phase-one-closure-plan-integration-20260707.md
goals/GOAL-006-phase-one-workflow-doc-20260707.md
tasks/TASK-007-phase-one-workflow-doc-20260707.md
goals/GOAL-007-prd-v2-local-gap-closure-a-20260707.md
tasks/TASK-008-prd-v2-local-gap-closure-a-20260707.md
goals/GOAL-008-prd-v2-local-gap-closure-b-20260707.md
tasks/TASK-009-prd-v2-local-gap-closure-b-20260707.md
goals/GOAL-009-prd-v2-local-gap-closure-c-20260707.md
tasks/TASK-010-prd-v2-local-gap-closure-c-20260707.md
goals/GOAL-010-prd-v2-local-gap-closure-d-20260707.md
tasks/TASK-011-prd-v2-local-gap-closure-d-20260707.md
goals/GOAL-012-auth-datascope-production-closure-20260707.md
tasks/TASK-013-auth-datascope-production-closure-20260707.md
goals/GOAL-016-auth-datascope-production-closure-b-20260707.md
tasks/TASK-017-auth-datascope-production-closure-b-20260707.md
goals/GOAL-018-local-main-chain-acceptance-hardening-20260707.md
tasks/TASK-019-local-main-chain-acceptance-hardening-20260707.md
goals/GOAL-013-frontend-customer-smoke-closure-20260707.md
tasks/TASK-014-frontend-customer-smoke-closure-20260707.md
goals/GOAL-015-operations-rollback-training-closure-20260707.md
tasks/TASK-016-operations-rollback-training-closure-20260707.md
docs/development/phase-one-closure-technical-plan.md
docs/development/workflow.md
docs/development/stage-goal-window-guide.md
tasks/README.md -> 任务 8：专项验收矩阵与上线准备
docs/acceptance/prd-v2-gap-matrix.md
docs/acceptance/task-8-acceptance-matrix.md
docs/acceptance/phase-one-frontend-alignment.md
docs/acceptance/phase-one-frontend-task-scope.md
docs/deployment/readiness-checklist.md
```

## 技术方向

```text
Frontend: Vue3 + Element Plus + Uppy
Backend: Spring Boot + RuoYi-Vue-Pro
Database: MySQL + Redis
File: MinIO private bucket + signed URL
AI: 所有 AI 智能体使用 LangChain + DeepSeek；9D.94 已补后端 LangChain4j + DeepSeek 底座第一增量，默认关闭真实外呼，真实 key / 生产验收仍需外部环境确认
Deploy: Nginx + Docker / Docker Compose
```

## 本地启动

首次准备：

```bash
brew install openjdk@21 maven
npm run install:frontend
```

工具链检查：

```bash
npm run check:toolchain
```

启动基础服务：

```bash
colima start
npm run compose:up
docker compose ps
```

### 一键后台运行（本地开发）

日常开发可在 Codex 下方终端执行：

```bash
npm run local:start
```

该命令会在后台保持 MySQL、Redis、MinIO、Spring Boot 后端和 Vite 前端运行；浏览器访问 `http://localhost:5173`。若 Docker 尚未运行且已安装 Colima，脚本会先启动 Colima。

```bash
npm run local:status  # 查看容器、前端和后端状态
npm run local:stop    # 仅停止本工具启动的前端和后端
```

前后端日志与 PID 保存在 `.local-runtime/`；该目录不会纳入 Git。每次启动都会记录一次性运行标识和进程身份，`local:stop` 只处理匹配该记录的完整前后端进程树，不会停止 Docker 基础服务、删除本地数据或终止其他程序。若端口 5173 或 8080 被其他程序占用，脚本会提示占用情况而不会接管该程序。

### 客户演示环境

客户演示使用独立数据库 `ai_order_platform_demo`、独立 MinIO bucket `ai-order-demo-private` 和独立端口 `15173/18080`，不会向主展示库或自动化测试库造数。

```bash
npm run demo:prepare  # 启动、生成 7 个阶段场景并校验
npm run demo:status
npm run demo:check
npm run demo:stop
```

浏览器访问 `http://127.0.0.1:15173`。需要让当前终端以前台方式持续守护演示服务时，可运行 `npm run demo:serve`。完整场景、幂等造数和受保护重置说明见 `docs/operations/demo-data-runbook.md`。

一期 Docker / Compose 配置静态验收：

```bash
npm run check:task9d69
npm run compose:phase-one:config
```

`deploy/env/phase-one.prod.example` 只包含占位示例值。正式环境必须通过部署平台 secret、服务器环境变量或不入库 env 文件注入真实值；不要把真实数据库密码、MinIO 密钥、DeepSeek API Key、webhook secret 或生产域名提交到仓库。

一期操作手册与交付材料：

```text
docs/operations/phase-one-role-operation-manual.md
docs/operations/phase-one-troubleshooting-guide.md
docs/operations/phase-one-delivery-materials-index.md
docs/acceptance/phase-one-customer-pm-confirmations.md
```

检查命令：

```bash
npm run check:task9d70
npm run check:task9d72
npm run check:task9d73
npm run check:task9d74
npm run check:task9d75
npm run check:task9d76
npm run check:task9d82
npm run check:task9d88
npm run check:task9d89
npm run check:task9d90
npm run check:task9d93
npm run check:task9d99
npm run check:task9d100
npm run check:local-main-chain-acceptance-hardening
npm run check:deployment-ops-local-hardening
npm run dry-run:phase-one-release-rollback
npm run check:frontend-customer-smoke-closure
npm run check:phase-one-closure-plan
npm run check:phase-one-workflow
npm run check:stage-goal-window
npm run check:prd-v2-gap-closure-a
npm run check:prd-v2-gap-closure-b
npm run check:prd-v2-gap-closure-c
```

启动后端：

```bash
npm run compose:up
npm run dev:backend
```

启动前端：

```bash
npm run dev:frontend
```

默认访问：

```text
Frontend: http://localhost:5173
Backend health: http://localhost:8080/api/bootstrap/health
Workflow chains: http://localhost:8080/workflow-chains
MinIO console: http://localhost:9001
WebSocket notification: ws://localhost:8080/ws/connect?token={access_token}
Phase-one Nginx notification gateway readiness: npm run check:task9d76
```

## 环境变量

环境变量模板位于 `.env.example`。该文件只包含本地占位值；任何真实数据库密码、MinIO 密钥、DeepSeek API Key、生产 JWT/Token 密钥都不得提交进仓库。AI Gateway 默认使用 deterministic 安全占位；只有显式启用 DeepSeek 并通过环境安全注入真实 key 时才外呼模型。

2026-07-01 Refresh Token/logout 第一增量新增 `APP_AUTH_REFRESH_TOKEN_TTL_SECONDS`；当前启动方式仍沿用 `.env.example` 和下列本地占位配置。

后端当前会在启动时通过 Flyway 连接 MySQL；Docker Compose 同时使用 Redis、MinIO 变量启动本地基础服务。常用本地变量：

```text
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=ai_order_platform
MYSQL_USER=ai_order
MYSQL_PASSWORD=change-me
APP_AUTH_TOKEN_SECRET=local-dev-change-me-auth-secret
APP_AUTH_TOKEN_TTL_SECONDS=7200
APP_AUTH_REFRESH_TOKEN_TTL_SECONDS=2592000
APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=true
REDIS_PORT=6379
REDIS_HOST=127.0.0.1
APP_INSTANCE_ID=local-ai-order-1
NOTIFICATION_REDIS_BROADCAST_ENABLED=false
NOTIFICATION_REDIS_CHANNEL=ai-order:notifications
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=change-me-minio
MINIO_ENDPOINT=http://127.0.0.1:9000
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_BUCKET=ai-order-private
FILE_UPLOAD_URL_TTL_SECONDS=900
FILE_PREVIEW_URL_TTL_SECONDS=900
FILE_DOWNLOAD_URL_TTL_SECONDS=7200
FILE_MAX_FILE_SIZE_BYTES=209715200
FILE_ALLOWED_CONTENT_TYPES=application/pdf,model/stl,application/sla,application/octet-stream,text/plain,image/png,image/jpeg,application/zip,application/x-zip-compressed
FILE_MAX_FILES_PER_ORDER=30
AI_PROVIDER=deterministic
AI_MAX_REQUESTS_PER_USER_HOUR=120
AI_MODEL_MAX_RETRIES=1
AI_INPUT_TOKEN_COST_MICROUSD=0
AI_OUTPUT_TOKEN_COST_MICROUSD=0
AI_DAILY_BUDGET_MICROUSD=0
AI_ADMIN_DAILY_BUDGET_MICROUSD=0
AI_CS_DAILY_BUDGET_MICROUSD=0
AI_DOCTOR_DAILY_BUDGET_MICROUSD=0
AI_WORKER_DAILY_BUDGET_MICROUSD=0
AI_BUDGET_NOTIFICATION_ENABLED=true
AI_BUDGET_CIRCUIT_BREAKER_ENABLED=false
AI_DEEPSEEK_ENABLED=false
AI_DEEPSEEK_BASE_URL=https://api.deepseek.com
AI_DEEPSEEK_MODEL=deepseek-chat
AI_DEEPSEEK_DAILY_BUDGET_MICROUSD=0
AI_DEEPSEEK_TEMPERATURE=0.2
AI_DEEPSEEK_MAX_TOKENS=800
AI_DEEPSEEK_CONNECT_TIMEOUT_SECONDS=10
AI_DEEPSEEK_READ_TIMEOUT_SECONDS=45
AI_LANGCHAIN_ENABLED=false
AI_LANGCHAIN_PROVIDER=deepseek
DEEPSEEK_API_KEY=replace-with-local-dev-key
AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=false
AI_EXTERNAL_ALERT_WEBHOOK_URL=
AI_EXTERNAL_ALERT_WEBHOOK_CONNECT_TIMEOUT_SECONDS=5
AI_EXTERNAL_ALERT_WEBHOOK_READ_TIMEOUT_SECONDS=10
AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false
AI_EXTERNAL_ALERT_SCHEDULER_BATCH_SIZE=50
AI_EXTERNAL_ALERT_SCHEDULER_FIXED_DELAY_MILLIS=60000
AI_EXTERNAL_ALERT_SCHEDULER_INITIAL_DELAY_MILLIS=60000
AI_EXTERNAL_ALERT_MAX_ATTEMPTS=3
AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED=false
AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET=
AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED=false
AI_EXTERNAL_ALERT_RECEIVER_SIGNING_SECRET=
AI_EXTERNAL_ALERT_RECEIVER_REPLAY_WINDOW_SECONDS=300
```

DeepSeek 第一增量启用方式：设置 `AI_PROVIDER=deepseek`、`AI_DEEPSEEK_ENABLED=true`，并通过安全渠道注入真实 `DEEPSEEK_API_KEY`。本地/CI 默认保持 `deterministic`，不依赖外部网络或真实 key。

LangChain + DeepSeek 第一增量启用方式：设置 `AI_PROVIDER=langchain-deepseek`、`AI_LANGCHAIN_ENABLED=true`、`AI_LANGCHAIN_PROVIDER=deepseek`、`AI_DEEPSEEK_ENABLED=true`，并通过安全渠道注入真实 `DEEPSEEK_API_KEY`。该路径通过 LangChain4j OpenAI-compatible ChatModel 调用 DeepSeek；默认关闭，不提交真实 key，不代表真实环境联调完成。

AI 外部告警 webhook 第一增量启用方式：默认 `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=false`，发送器只做本地 dry-run；测试/正式环境需要真实 webhook 时，设置 `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=true` 并通过安全渠道注入 `AI_EXTERNAL_ALERT_WEBHOOK_URL`。不要把带密钥、签名或客户信息的真实 URL 写入仓库。

AI 外部告警 webhook 签名第一增量启用方式：默认 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED=false`；测试/正式环境需要发送签名时，设置 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED=true` 并通过安全渠道注入 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET`。9D.71 后，sender 会发送 `X-AI-Alert-Timestamp`、`X-AI-Alert-Nonce` 和 `X-AI-Alert-Signature: sha256=<HMAC-SHA256(timestamp.nonce.requestBody)>`；不要把真实 signing secret 写入仓库。

AI 外部告警接收端验签 / 防重放第一段启用方式：默认 `AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED=false`，`/ai/external-alerts/receive` 返回 503；本地或测试环境需要验证接收端时，设置 `AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED=true`，并通过安全渠道注入 `AI_EXTERNAL_ALERT_RECEIVER_SIGNING_SECRET`，可按 `AI_EXTERNAL_ALERT_RECEIVER_REPLAY_WINDOW_SECONDS` 控制时间窗。该入口不保存原始 payload，不接真实外部服务，不提交真实 secret。

AI 外部告警调度器第一增量启用方式：默认 `AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false`，不会自动消费 `PENDING` outbox；测试/正式环境确认 webhook、重试和监控策略后，才可显式设置 `AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=true`，并按容量配置批量大小和调度间隔。9D.45 后 webhook 失败会按 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS` 控制重试，达到上限后进入 `DEAD_LETTER`；第一增量不包含分布式锁、退避调度或生产 webhook 联调。

AI 外部告警监控第一增量：`GET /ai/governance/external-alerts/summary` 仅 CS / ADMIN 可读，用于查看 outbox 状态分布、最近失败/死信错误和最老待发送时间；本接口不触发外呼，不提供人工重放或编辑，不返回真实 webhook URL、密钥、prompt 原文、模型原始响应或内部生产敏感详情。

AI 外部告警 outbox 列表与失败/死信可见性第一增量：`GET /ai/governance/external-alerts` 仅 CS / ADMIN 可读，支持 `send_status`、`event_type`、`created_at_from`、`created_at_to`、`limit` 查询最近记录；FAILED / DEAD_LETTER 记录额外返回 `attempts`、脱敏 `last_error` 和 `last_attempted_at`。响应不返回 payload、真实 webhook URL、密钥、Bearer token、prompt 原文、模型原始响应或上游敏感响应。

9D.67 文件上传限制与 bucket 隔离第一段：`/files/upload-token` 和 `/files/multipart/initiate` 在发放预签名或初始化 Multipart 前校验 `FILE_MAX_FILE_SIZE_BYTES`、`FILE_ALLOWED_CONTENT_TYPES` 和 `FILE_MAX_FILES_PER_ORDER`；医生端选择附件时也按同口径给出大小、类型、数量提示。测试环境和正式环境必须配置不同 `MINIO_BUCKET`、对象存储账号和数据库，不得把真实 bucket 凭据或生产配置提交到仓库。

本地开发账号由 Flyway `V6__auth_rbac_datascope_foundation.sql` 初始化，仅用于本地验收：

```text
admin / change-me-admin
cs / change-me-cs
worker / change-me-worker
doctor / change-me-doctor
```

这些账号密码是本地占位值，数据库中存储 PBKDF2-SHA256 hash；正式环境必须替换为真实账号体系和安全密钥。

生产 profile 使用 `backend/platform-server/src/main/resources/application-prod.yml`。当 `spring.profiles.active=prod` 时，后端启动门禁会强制关闭 `X-Bootstrap-*` 本地兼容，固定 `APP_AUTH_ALLOW_ROLE_FALLBACK=false`，并要求外部注入非本地占位的 `APP_AUTH_TOKEN_SECRET`。严格权限模式下，声明权限码的接口必须由 Bearer token 中的权限码放行，角色-only token 不再绕过权限码。

## OpenAPI 契约

稳定接口契约位于：

```text
docs/api/openapi.yaml
```

该文件从 `.local-context/API规范_OpenAPI3.0.yaml` 修复并冻结而来。后续前后端联调、接口评审、SDK 生成应优先使用 `docs/api/openapi.yaml`。

验证命令：

```bash
npm run check:openapi
```

说明：任务 9D.57 后，当前契约已覆盖 auth refresh/logout、`LoginRequest.portal` 登录入口枚举、`refreshToken` / `refreshExpiresAt`、动态表单 create/update/status、设计稿 `file_ids/file_count`、发货前终检 `OUT/PASS` 门禁说明、DeepSeek 适配与 AI-3 `SAFE_REFUSAL` 语义、终检报告生成/读取接口、终检报告 `attachment_file_ids` 和 `final-inspection:manage` 专用权限说明、返工关闭接口、返工字典接口、返工字典后台维护接口 `/reworks/dictionaries/items` 与 `ReworkDictionaryItemResponse`、返工通知事件说明、`AI_BUDGET_EXCEEDED` 预算通知说明、`AI_BUDGET_NOTIFICATION_ENABLED=false` 通知策略说明、`AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 熔断降级说明、`AI_BUDGET_CIRCUIT_OPEN` / `AI_BUDGET_ROLE_CIRCUIT_OPEN` / `AI_BUDGET_MODEL_CIRCUIT_OPEN` / `AI_OUTPUT_GUARDED` 治理审计说明、`AI_ADMIN_DAILY_BUDGET_MICROUSD` / `AI_CS_DAILY_BUDGET_MICROUSD` / `AI_DOCTOR_DAILY_BUDGET_MICROUSD` / `AI_WORKER_DAILY_BUDGET_MICROUSD` 角色预算说明、`AI_DEEPSEEK_DAILY_BUDGET_MICROUSD` 模型预算说明、`prompt_version` 提示词版本审计、`ai_external_alert_outbox` 外部告警待发送事实和 `SENT/FAILED/DEAD_LETTER/SENDING`、`attempts`、`last_error` 发送器状态机说明、`/ai/governance/cost-trend` 成本趋势接口、`AiGovernanceCostTrendResponse`、`AI_EXTERNAL_ALERT_WEBHOOK_ENABLED` / `AI_EXTERNAL_ALERT_WEBHOOK_URL` webhook 发送说明、`AI_EXTERNAL_ALERT_SCHEDULER_ENABLED` 调度器说明、`AI_EXTERNAL_ALERT_MAX_ATTEMPTS` 重试/死信说明、AI 外部告警幂等/并发领取说明、`AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED` / `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET` 与 `X-AI-Alert-Signature` HMAC 签名说明、`/ai/governance/external-alerts/summary` 和 `AiExternalAlertSummaryResponse` 监控摘要接口、`/ai/governance/external-alerts` 和 `AiExternalAlertListResponse` 列表筛选接口、`PerformanceStats` 绩效责任归因字段、`PerformanceDetail` 绩效明细 schema、`ReworkRecordResponse` 返工影响审计字段、`/reworks` 的 `has_impacted_nodes` 筛选参数、`/performance/details` 绩效明细接口、AI 治理摘要的 `daily_budget_microusd` / `budget_exceeded` / `budget_alert_count` / `latest_budget_alert_at` 字段、OpenAPI path / operation 数量以 `npm run check:openapi` 输出为准，包含唯一 `operationId`、统一错误响应、`/auth/me` 菜单权限响应、通知未读/已读 REST、Multipart 文件上传、status 恢复和 pending 恢复候选接口；9D.57 为前端只读可视化增量，不新增 OpenAPI 契约；Swagger validate 与 Redocly lint 均通过。

## 检查命令

```bash
npm run acceptance
npm run compose:up
npm run check:openapi
npm run check:auth-refresh
npm run check:task9d12
npm run check:task9d13
npm run check:task9d14
npm run check:task9d15
npm run check:task9d16
npm run check:task9d17
npm run check:task9d18
npm run check:task9d19
npm run check:task9d20
npm run check:task9d21
npm run check:task9d22
npm run check:task9d23
npm run check:task9d24
npm run check:task9d25
npm run check:task9d36
npm run check:task9d35
npm run check:task9d37
npm run check:task9d38
npm run check:task9d39
npm run check:task9d40
npm run check:task9d41
npm run check:task9d42
npm run check:task9d43
npm run check:task9d44
npm run check:task9d45
npm run check:task9d46
npm run check:task9d47
npm run check:task9d55
npm run check:task9d56
npm run check:task9d57
npm run check:task9d58
npm run check:task9d59
npm run check:task9d60
npm run check:task9d61
npm run check:task9d62
npm run check:task9d64
npm run check:task9d65
npm run check:task9d66
npm run check:task9d67
npm run check:task9d68
npm run check:task9d93
npm run smoke:task9d24
npm run smoke:task9d62
npm run smoke:task9d10-large-upload
npm run smoke:task9d10-server-resume
npm run smoke:task9d10-interrupted-resume
npm run check:task9d11
npm run test:backend
npm run build:frontend
npm run compose:config
```

说明：`npm run test:backend` 会加载 Spring Boot 上下文并执行 Flyway 校验。首次运行前执行 `scripts/ensure-test-database.sh`；测试固定使用仅获授权访问 `*_test` 库的 `ai_order_test` 账号、Redis DB 15 和测试 MinIO bucket，启动时还会拒绝非测试库、Redis DB 或 bucket。`npm run smoke:task9d62` 会创建完整订单链路，只允许在明确标记的独立环境运行：须设置 `TASK9D62_ISOLATED_ENV=true` 和 `TASK9D62_FRONTEND_URL`，否则会在写入前退出。三条 `smoke:task9d10-*` 会追加订单/文件，须设置 `TASK9D10_ISOLATED_ENV=true` 和 `TASK9D10_FRONTEND_URL`；`smoke:task9d77-file-upload-resilience` 须设置 `TASK9D77_ISOLATED_ENV=true` 和 `TASK9D77_FRONTEND_URL`。这些命令均不会清理数据，缺少独立环境标记、地址或仍指向共享本地端口时会在写入前退出。

任务 9A/9B 权限专项回归：

```bash
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests,PermissionInterceptorTests,WorkflowRuntimeTests,CheckWorklogPerformanceTests,AiGatewayTests,MessageDesignBillNotificationTests,FileAccessTests test
```

HTTP smoke：

```bash
curl -sS http://localhost:8080/api/bootstrap/health
curl -sS -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{"username":"admin","password":"change-me-admin"}'
TOKEN=$(curl -sS -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{"username":"admin","password":"change-me-admin"}' | node -e 'const fs=require("fs"); console.log(JSON.parse(fs.readFileSync(0,"utf8")).accessToken)')
curl -sS -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/auth/me
curl -sS http://localhost:8080/workflow-chains
curl -sS http://localhost:8080/workflow-chains/1/nodes
curl -sS http://localhost:5173/api/bootstrap/health
```

任务 3 脱敏 smoke 可用本地测试数据执行：

```bash
ORDER_ID=$(docker exec ai-order-mysql mysql --default-character-set=utf8mb4 -N -B -uai_order -pchange-me ai_order_platform -e "SELECT order_id FROM orders WHERE doctor_user_id=9001 ORDER BY order_id DESC LIMIT 1")
curl -sS -H 'X-Bootstrap-Role: DOCTOR' -H 'X-Bootstrap-User-Id: 9001' "http://localhost:8080/orders/$ORDER_ID"
curl -sS -H 'X-Bootstrap-Role: ADMIN' "http://localhost:8080/orders/$ORDER_ID"
curl -sS -o /dev/null -w '%{http_code}\n' -H 'X-Bootstrap-Role: DOCTOR' -H 'X-Bootstrap-User-Id: 9001' "http://localhost:8080/orders/$ORDER_ID/process-instance"
curl -sS -X POST -H 'Content-Type: application/json' -H 'X-Bootstrap-Role: DOCTOR' -H 'X-Bootstrap-User-Id: 9001' -d "{\"order_id\":$ORDER_ID,\"question\":\"我的订单在哪？\"}" http://localhost:8080/ai/order-query
```

说明：`X-Bootstrap-*` 请求头仅用于本地烟测角色/数据范围，正式权限体系仍待 RuoYi-Vue-Pro RBAC/DataScope 接入。

任务 4 文件 smoke 的最小路径：

```bash
npm run compose:up
npm run dev:backend

# 另开终端：准备本地订单数据后调用 /files/upload-token。
# 返回的 upload_url 用 curl -X PUT 上传文件；上传后调用 /files/{fileId}/complete。
# 然后调用 /files/{fileId}/preview-url 和 /files/{fileId}/download-url，并查询 file_access_audit。
```

任务 4 已由自动化测试覆盖真实 MinIO 预签名 PUT：

```bash
scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=FileAccessTests test
```

任务 5A Workflow Runtime 自动化测试：

```bash
scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=WorkflowRuntimeTests test
```

任务 5A 的真实 HTTP smoke 可按以下路径执行：

```text
POST /orders/{orderId}/production-review
GET /orders/{orderId}/process-instance
POST /orders/{orderId}/process-instance/assign
POST /process-instance/nodes/{nodeInstanceId}/start
POST /process-instance/nodes/{nodeInstanceId}/complete
POST /process-instance/nodes/{nodeInstanceId}/skip
GET /tasks/mine?status=READY
```

任务 5B 入检 / 出检 / 返工 / 工时绩效自动化测试：

```bash
scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
```

任务 5B 的真实 HTTP/SQL smoke 可按以下路径执行：

```text
POST /orders/{orderId}/production-review
POST /orders/{orderId}/process-instance/assign
POST /process-instance/nodes/{nodeInstanceId}/start  # 入检前应返回 409
POST /check-records                                  # check_type=1 入检通过
POST /process-instance/nodes/{nodeInstanceId}/start
POST /work-logs/start
POST /work-logs/{workLogId}/pause
POST /work-logs/{workLogId}/resume
POST /work-logs/{workLogId}/finish
POST /process-instance/nodes/{nodeInstanceId}/complete
POST /check-records                                  # check_type=2 出检失败并指定 rework_to_node_id
POST /process-instance/nodes/{nodeInstanceId}/start
POST /work-logs/start                                # 返工后产生新的 work_log
GET /performance
```

任务 5B 验收重点：

```text
未入检不能开工；未完工不能出检。
出检失败写 rework_record，历史检查和工时不删除。
暂停时间不计入 effective_duration_seconds。
WORKER 查询 /performance 时只能看到本人数据，ADMIN 可按 user_id 查询。
```

任务 6 消息 / 设计稿 / 账单物流 / 通知自动化测试：

```bash
scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=MessageDesignBillNotificationTests test
```

任务 6 的真实 HTTP/SQL smoke 可按以下路径执行：

```text
POST /orders/{orderId}/messages                  # WORKER 消息进入 PENDING_REVIEW
GET /orders/{orderId}/messages                   # 医生端审核前不可见
POST /messages/{msgId}/review                    # CS 审核或编辑通过后医生端可见
POST /orders/{orderId}/design-drafts             # 上传设计稿，通知 CS
POST /orders/{orderId}/design-drafts/{draftId}/cs-review
POST /orders/{orderId}/design-drafts/{draftId}/doctor-confirm
POST /orders/{orderId}/bill                      # 上传账单，通知医生
POST /orders/{orderId}/logistics                 # 发货，external_status=SHIPPED
GET /orders/{orderId}                            # 医生端只看外部状态和物流
```

任务 6 验收重点：

```text
医生只收到公开事件，内部任务、返工、工时、绩效不推送给医生。
notification_event 是通知事实来源，user_notification 做未读补偿。
物流发货后医生端订单详情 external_status 为 SHIPPED。
```

任务 7 AI Gateway 自动化测试：

```bash
scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests test
```

任务 7 的真实 HTTP/SQL smoke 可按以下路径执行：

```text
POST /ai/translate          # CS/ADMIN，返回翻译草稿，不写订单字段
POST /ai/cs-query           # CS/ADMIN，返回客服查询草稿
POST /ai/order-query        # DOCTOR，只读 DoctorOrderAssistantReadModel
POST /ai/check-missing      # DOCTOR/CS/ADMIN，只返回缺失项清单
POST /ai/production-note    # CS/WORKER/ADMIN，返回生产备注草稿
SELECT * FROM ai_audit_log WHERE order_id = ...
```

任务 7 验收重点：

```text
5 个 AI 端点均写 ai_audit_log。
AI-3 询问内部工序、员工、入检/出检、返工、工时、绩效、责任时返回安全拒绝。
AI 输出只做草稿或查询结果，不自动审核、自动驳回、自动发送、自动写订单字段。
```

任务 8A readiness audit 文档入口：

```text
docs/acceptance/task-8-acceptance-matrix.md
docs/acceptance/task-8-regression-record.md
docs/deployment/readiness-checklist.md
```

任务 8 检查命令：

```bash
npm run acceptance
npm run check:toolchain
npm run compose:config
npm run check:openapi
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml test
git diff --check
```

任务 9C 通知专项检查：

```bash
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=NotificationBroadcastTests,NotificationRestTests,NotificationWebSocketTests test
npm run check:openapi
npm run build:frontend
```

任务 9D.1 医生订单工作台检查：

```bash
npm run check:task9d1
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests,PermissionInterceptorTests,AiGatewayTests,MessageDesignBillNotificationTests test
npm run check:openapi
npm run build:frontend
```

任务 9D.1 本地 smoke 验收方式：

```text
1. 启动 MySQL / Redis / MinIO、后端和 Vite。
2. doctor 通过 http://localhost:5173/api/auth/login 登录。
3. 进入「医生订单」，用订单号搜索本地 smoke 订单。
4. 页面可查看订单详情、公开消息、医生可见设计稿、账单物流，并可调用医生 AI。
5. 页面和接口响应不得出现 internal_status、production_note、cs_user_id 或内部生产备注。
```

任务 9D.2 医生下单第一增量检查：

```bash
npm run check:task9d2
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests test
npm run check:openapi
npm run build:frontend
```

任务 9D.2 本地 smoke 验收方式：

```text
1. 启动 MySQL / Redis / MinIO、后端和 Vite。
2. doctor 通过 http://localhost:5173 或 http://127.0.0.1:5173 登录。
3. 进入「医生订单」，确认「新建订单」面板能读取 REGULAR_CROWN 动态表单。
4. 填写必填字段，按需输入本人已完成且医生可见的 file_id，提交订单。
5. 新订单进入 PENDING_REVIEW，页面可读取订单详情，响应不得出现 internal_status、production_note、cs_user_id。
```

任务 9B.8 Refresh Token/logout 第一增量检查：

```bash
npm run check:auth-refresh
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests,AuthStartupValidatorTests,PermissionInterceptorTests test
npm run check:openapi
npm run build:frontend
```

任务 9D.11 医生订单草稿/补资料第一增量检查：

```bash
npm run check:task9d11
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests,PermissionInterceptorTests test
npm run check:openapi
npm run build:frontend
```

任务 9D.11 本地 smoke 验收方式：

```text
1. 启动 MySQL / Redis / MinIO、后端和 Vite。
2. doctor 通过 http://127.0.0.1:5173 登录。
3. 进入「医生订单」，填写患者姓名后点击「保存草稿」，页面显示 DRAFT。
4. 补齐牙位后点击「提交草稿/补资料」，页面显示 PENDING_REVIEW。
5. 本轮 smoke 订单：ORD20260701-E172DF6DD8。
```

任务 9D.12 动态表单 CRUD 第一增量检查：

```bash
npm run check:task9d12
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=FormConfigManagementTests test
npm run check:openapi
npm run build:frontend
```

任务 9D.12 本地 smoke 验收方式：

```text
1. 启动 MySQL / Redis / MinIO、后端和 Vite。
2. admin 通过 http://127.0.0.1:5173 登录。
3. 进入「动态表单」，筛选或填写产品类型。
4. 新增字段后列表出现 ACTIVE 字段；编辑字段名后列表更新。
5. 点击「停用」后字段变为 INACTIVE，并从医生端只读 ACTIVE 列表移除。
6. 本轮 smoke 字段：SMOKE_1782885092995 / smoke_field_1782885092995。
```

任务 9D.13 设计稿多文件/多版本第一增量检查：

```bash
npm run check:task9d13
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=MessageDesignBillNotificationTests test
npm run check:openapi
npm run build:frontend
```

任务 9D.13 本地 smoke 验收方式：

```text
1. 启动 MySQL / Redis / MinIO、后端和 Vite。
2. 准备一条医生可见订单和两个已完成 DESIGN_DRAFT / DOCTOR_CS 文件。
3. cs 通过 http://127.0.0.1:5173 登录，进入「内部订单」，搜索订单并在「设计稿」页签输入多个 file_id。
4. 上传后接口返回新版设计稿，file_count 为 2；客服审核通过后医生可见。
5. doctor 登录「医生订单」，进入同一订单的「设计稿」页签，可看到两个文件 ID 和文件数。
6. 本轮 smoke：订单 9D13-1782887063685，文件 761/762。
```

任务 9D.14 终检发货拦截第一增量检查：

```bash
npm run check:task9d14
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=MessageDesignBillNotificationTests test
npm run check:openapi
npm run build:frontend
```

任务 9D.14 验收口径：

```text
1. CS/ADMIN 调用 POST /orders/{orderId}/logistics 前，订单最后一道工序节点必须已有 OUT/PASS 检查记录。
2. 缺少终检通过记录时返回 409，不写物流、不更新 SHIPPED、不发送 ORDER_SHIPPED 通知。
3. 生产看板详情提供承运商、物流单号和「录入物流并发货」入口；遇到 409 时显示“终检出检通过后才能发货”。
4. 本轮浏览器 smoke：admin 搜索订单 `9D14-1939db70751a`，录入物流 `SF-1782889291788` 后页面显示发货成功，数据库核验订单与物流均为 `SHIPPED`。
```

任务 9D.15 真实 DeepSeek 接入第一增量检查：

```bash
npm run check:task9d15
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests,AiGatewayDeepSeekTests test
npm run check:openapi
npm run build:frontend
```

任务 9D.15 验收口径：

```text
1. 默认配置 AI_PROVIDER=deterministic / AI_DEEPSEEK_ENABLED=false，本地无真实 key 时不外呼模型。
2. 启用 AI_PROVIDER=deepseek、AI_DEEPSEEK_ENABLED=true 并注入 DEEPSEEK_API_KEY 后，AI-1/AI-2/AI-3 公开问答/AI-5 通过 OpenAI-compatible /chat/completions 调用 DeepSeek。
3. AI-3 发送给模型的上下文只包含 DoctorOrderAssistantReadModel 公开字段；医生问内部工序/员工/工时等问题时返回 SAFE_REFUSAL，且不调用模型。
4. ai_audit_log 记录真实 model_name、输入 token 和输出 token；AI-4 资料缺失检查继续走规则判断。
```

任务 9D.16 终检报告第一增量检查：

```bash
npm run check:task9d16
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
npm run check:openapi
npm run build:frontend
```

任务 9D.16 验收口径：

```text
1. POST /final-inspection-reports 生成报告前，订单最后一道工序节点必须已有 OUT/PASS 终检出检记录；缺失时返回 409。
2. 终检通过后可生成一单一份终检报告，返回 report_no、final_node_instance_id、final_check_id 和 conclusion=PASS。
3. GET /final-inspection-reports/{orderId} 只允许内部角色读取；医生 Bearer token 返回 403。
4. 返工终检页面提供报告摘要和「生成终检报告」最小入口。
```

任务 9D.17 返工关闭 / 责任分类第一增量检查：

```bash
npm run check:task9d17
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#reworkCanCloseOnlyAfterTargetOutPassAndKeepsResponsibilityClassification test
npm run check:openapi
npm run build:frontend
```

任务 9D.17 验收口径：

```text
1. POST /reworks/{reworkId}/close 关闭返工前，目标节点必须在来源失败检查之后重新 OUT/PASS；缺失时返回 409。
2. 关闭成功后返回 status=DONE，并写入 reason_category、responsibility_type、close_note、closed_by_user_id 和 closed_at。
3. GET /reworks?status=DONE 可读到关闭后的原因分类和责任类型。
4. 返工终检页面提供原因分类、责任类型、关闭备注和「关闭返工」最小入口。
```

任务 9D.18 返工原因 / 责任类型字典第一增量检查：

```bash
npm run check:task9d18
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#reworkCloseUsesServerDictionaryAndRejectsUnsupportedClassification test
npm run check:openapi
npm run build:frontend
```

任务 9D.18 验收口径：

```text
1. GET /reworks/dictionaries 返回 reason_categories 和 responsibility_types。
2. POST /reworks/{reworkId}/close 使用未列入字典的 reason_category 或 responsibility_type 时返回 400。
3. 返工终检页面关闭返工的原因分类和责任类型下拉来自后端字典。
4. 当前第一增量是后端固定字典，不是后台可维护字典。
```

任务 9D.19 返工通知联动第一增量检查：

```bash
npm run check:task9d19
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#reworkLifecycleEmitsInternalNotificationsWithoutDoctorRecipient test
npm run check:openapi
```

任务 9D.19 验收口径：

```text
1. 出检失败生成返工记录后，写入 REWORK_CREATED / WORKER 通知事件，并给目标技工写 user_notification。
2. 返工关闭后，写入 REWORK_CLOSED / CS 通知事件，并给订单客服写 user_notification。
3. 医生用户不收到 REWORK_CREATED / REWORK_CLOSED。
4. 当前第一增量只做内部通知事实，不做复杂 DAG 影响范围、绩效归因或生产网关验收。
```

任务 9D.20 复杂返工影响范围第一增量检查：

```bash
npm run check:task9d20
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#failedOutCheckResetsTargetAndCompletedDownstreamNodesForReworkImpact test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
```

任务 9D.20 验收口径：

```text
1. 后道出检失败返到前道节点时，返工目标节点进入 READY。
2. 同一实例内从返工目标可达且已 READY/COMPLETED 的后续节点重置为 PENDING。
3. 返工目标重新完成后，后续节点通过既有 DAG 激活规则重新 READY。
4. 当前第一增量不删除历史检查、工时或返工记录，不新增公开 API，不处理 IN_PROGRESS 后续节点冲突确认。
```

任务 9D.21 绩效归因联动第一增量检查：

```bash
npm run check:task9d21
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#performanceSeparatesReworkResponsibilityAttribution test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
```

任务 9D.21 验收口径：

```text
1. /performance 保留 rework_count 作为目标节点返工总数。
2. responsible_rework_count 统计责任类型 WORKER 的返工。
3. non_worker_responsibility_rework_count 统计 DOCTOR / CS / SYSTEM 责任返工。
4. unclassified_rework_count 统计未关闭或未设置责任类型的返工。
5. 当前第一增量不做奖金公式、周期筛选、明细报表或申诉闭环。
```

任务 9D.22 返工影响审计可视化第一增量检查：

```bash
npm run check:task9d22
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#reworkListExposesImpactedDownstreamNodesForAudit test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
```

任务 9D.22 验收口径：

```text
1. 创建返工时记录本次实际受影响的后续节点数量和节点 ID。
2. /reworks 返回 impacted_node_count 和 impacted_node_instance_ids。
3. 返工终检页面展示影响后续节点数量和 ID。
4. 当前第一增量不做图形化 DAG、筛选、导出或 IN_PROGRESS 后续节点冲突确认。
```

任务 9D.23 返工影响筛选第一增量检查：

```bash
npm run check:task9d23
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#reworkListCanFilterRecordsThatImpactedDownstreamNodes test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
```

任务 9D.23 验收口径：

```text
1. /reworks?has_impacted_nodes=true 只返回 impacted_node_count > 0 的返工。
2. /reworks?has_impacted_nodes=false 只返回 impacted_node_count = 0 的返工。
3. 返工终检页面提供“仅看影响后续工序”筛选开关。
4. 当前第一增量不做图形化 DAG、导出或 IN_PROGRESS 后续节点冲突确认。
```

任务 9D.24 四入口登录页与角色端口校验检查：

```bash
npm run check:task9d24
npm run smoke:task9d24
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests#databaseLoginRequiresPortalAndMatchesRoleToPortal test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests test
```

任务 9D.24 验收口径：

```text
1. 登录页显示医生端、客服端、生产端、管理端四入口。
2. 登录请求必须携带 portal，缺失或非法 portal 返回 400。
3. 账号角色与入口不匹配返回 403，前端提示“账号角色与所选入口不匹配”。
4. 登录成功后继续复用现有 RBAC 菜单，并统一默认进入工作台。
5. `npm run smoke:task9d24` 通过真实 Chrome 依次点击四入口，并验证 doctor 不能从管理端入口登录。
```

任务 9D.36 客户演示前端展示清理检查：

```bash
npm run check:task9d36
npm run smoke:task9d36
npm run build:frontend
```

任务 9D.36 追加验收口径：

```text
1. 工作台不展示权限码、组件名、路由路径或角色英文码。
2. 客服端工作台展示订单管理、沟通中心、客户管理、产品管理、配送管理、账单管理、外协管理。
3. 生产端工作台展示人员管理、设备管理、物料异常等客户反馈入口。
4. 登录后页头和登录页图标使用内置 SVG，不依赖图标字体英文 ligature 兜底。
5. 医生端、客服端、生产端、管理端主题由登录入口锁定；点击侧栏功能后侧栏结构和颜色不变。
6. 工作台不重复左侧栏功能入口，必须呈现业务仪表盘和趋势图；KPI 卡片不得显示黑色 SVG 图标；订单/队列类页面使用可点击快速筛选 chip、高密度表格和彩色状态 badge。
```

任务 9D.25 绩效明细第一增量检查：

```bash
npm run check:task9d25
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#performanceDetailsListCompletedWorkLogsForResolvedUser test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
```

任务 9D.25 验收口径：

```text
1. /performance/details 返回最近 100 条已完成 work log 明细。
2. WORKER 即使传入他人 user_id，也只返回本人绩效明细。
3. 明细包含订单号、工序、有效工时、标准工时、准时判断和完成时间。
4. 绩效页在汇总卡片下展示“工时明细”表。
5. 当前第一增量不做周期筛选、完整奖金/扣罚公式、标准工时后台配置或申诉闭环。
```

任务 9D.32 AI 预算超限审计第一增量检查：

```bash
npm run check:task9d32
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderAuditsBudgetExceededWhenDailyBudgetIsReached test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests,AiGatewayDeepSeekTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
```

任务 9D.32 环境变量：

```text
AI_DAILY_BUDGET_MICROUSD=0
```

说明：默认 0 不启用预算阈值。配置为正整数后，真实模型成功调用如果让近 24 小时估算成本从低于阈值跨到达到或超过阈值，会写入 `AI_BUDGET_EXCEEDED` 治理审计。该审计成本为 0，不拦截请求、不发送外部通知、不自动降级模型。

任务 9D.32 验收口径：

```text
1. 配置预算阈值后，真实模型成功调用跨过近 24 小时预算阈值，会额外写入 AI_BUDGET_EXCEEDED。
2. AI_BUDGET_EXCEEDED 使用 ai-governance-budget-exceeded 虚拟模型名，estimated_cost_microusd 为 0。
3. /ai/governance/summary 返回 budget_alert_count 和 latest_budget_alert_at。
4. 本轮不发送 WebSocket/外部通知，不做分角色/分模型预算，不做熔断/降级。
```

任务 9D.33 AI 预算超限内部通知第一增量检查：

```bash
npm run check:task9d33
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderNotifiesInternalUsersWhenDailyBudgetIsReached test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests,AiGatewayDeepSeekTests,NotificationRestTests,NotificationWebSocketTests,NotificationBroadcastTests test
```

任务 9D.33 环境变量：

```text
AI_DAILY_BUDGET_MICROUSD=0
```

说明：默认 0 不启用预算阈值。配置为正整数后，真实模型成功调用如果让近 24 小时估算成本从低于阈值跨到达到或超过阈值，会先写入 `AI_BUDGET_EXCEEDED` 治理审计，再写入内部通知事实。真实模型仍需显式 `AI_PROVIDER=deepseek`、`AI_DEEPSEEK_ENABLED=true` 和外部注入 `DEEPSEEK_API_KEY`；不要把真实 key 写入仓库。

任务 9D.33 验收口径：

```text
1. 预算跨线后写入 AI_BUDGET_EXCEEDED 内部通知事件。
2. ACTIVE ADMIN / CS 可在 /notifications 看到该通知。
3. DOCTOR / WORKER 不会收到该通知。
4. 本轮不发送短信、邮件、企业微信等外部告警，不做熔断/降级，不新增管理页面。
```

任务 9D.34 AI 预算通知策略开关第一增量检查：

```bash
npm run check:task9d34
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderSkipsBudgetNotificationWhenNotificationStrategyIsDisabled test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
```

任务 9D.34 环境变量：

```text
AI_BUDGET_NOTIFICATION_ENABLED=true
```

说明：默认 `true`，预算跨线按 9D.33 写内部通知。配置为 `false` 时，预算跨线仍写 `AI_BUDGET_EXCEEDED` 治理审计，但不写 `notification_event` / `user_notification`，也不触发本地 WebSocket 推送。

任务 9D.34 验收口径：

```text
1. 默认配置下，预算跨线仍写内部通知。
2. AI_BUDGET_NOTIFICATION_ENABLED=false 时，预算跨线仍写 AI_BUDGET_EXCEEDED 审计。
3. AI_BUDGET_NOTIFICATION_ENABLED=false 时，不新增 notification_event / user_notification。
4. 本轮不发送短信、邮件、企业微信等外部告警，不做熔断/降级，不新增管理页面。
```

任务 9D.37 AI 预算外部告警待发送事实第一增量检查：

```bash
npm run check:task9d37
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderCreatesExternalAlertOutboxWhenDailyBudgetIsReached+deepSeekProviderCreatesExternalAlertOutboxWhenBudgetCircuitBreakerOpens test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
```

说明：9D.37 不新增环境变量，不调用真实外部渠道。预算跨线和预算熔断命中后会写入 `ai_external_alert_outbox`，`send_status=PENDING`，供后续真实外部发送器消费。payload 不包含 prompt、模型原始响应、密钥或内部生产详情。

任务 9D.37 验收口径：

```text
1. 预算跨线时写入 AI_BUDGET_EXCEEDED 治理审计，并新增 AI_BUDGET_EXCEEDED 外部告警 outbox。
2. 预算熔断命中时不访问 DeepSeek，写入 AI_BUDGET_CIRCUIT_OPEN 治理审计，并新增 AI_BUDGET_CIRCUIT_OPEN 外部告警 outbox。
3. outbox 记录 send_status=PENDING。
4. 本轮不发送短信、邮件、企业微信等真实外部告警，不新增发送器或管理页面。
```

任务 9D.38 AI 分角色预算第一增量检查：

```bash
npm run check:task9d38
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderFallsBackWhenCsRoleBudgetCircuitBreakerIsOpen test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
```

说明：四个角色日预算变量默认均为 0，不启用角色预算。启用 `AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 且对应角色预算为正数时，后端按 `ai_audit_log.actor_role` 聚合近 24 小时成功调用成本；当前角色超限后不访问 DeepSeek，返回 deterministic fallback，并写 `AI_BUDGET_ROLE_CIRCUIT_OPEN` 审计和 outbox。

任务 9D.38 验收口径：

```text
1. 新 AI 审计记录写入 actor_role。
2. CS 角色预算超限且预算熔断开启时，不访问 DeepSeek。
3. 角色预算熔断写入 AI_BUDGET_ROLE_CIRCUIT_OPEN 和 ai-governance-budget-role-circuit-open。
4. 角色预算熔断写入 ai_external_alert_outbox，payload 包含 role=CS。
5. 本轮不做分模型预算、不新增管理页面、不接真实外部发送器。
```

任务 9D.39 AI 分模型预算第一增量检查：

```bash
npm run check:task9d39
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderFallsBackWhenDeepSeekModelBudgetCircuitBreakerIsOpen test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
```

说明：DeepSeek 模型日预算变量默认 0，不启用模型预算。启用 `AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 且 `AI_DEEPSEEK_DAILY_BUDGET_MICROUSD` 为正数时，后端按当前 `AI_DEEPSEEK_MODEL` 聚合 `ai_audit_log.model_name` 近 24 小时成功调用成本；当前模型超限后不访问 DeepSeek，返回 deterministic fallback，并写 `AI_BUDGET_MODEL_CIRCUIT_OPEN` 审计和 outbox。

任务 9D.39 验收口径：

```text
1. DeepSeek 模型预算默认 0，不改变现有调用行为。
2. deepseek-chat 模型预算超限且预算熔断开启时，不访问 DeepSeek。
3. 模型预算熔断写入 AI_BUDGET_MODEL_CIRCUIT_OPEN 和 ai-governance-budget-model-circuit-open。
4. 模型预算熔断写入 ai_external_alert_outbox，payload 包含 model=deepseek-chat。
5. 本轮不做预算策略管理页面、不接真实外部发送器、不提交真实 key。
```

任务 9D.40 AI 提示词版本与输出防护第一增量检查：

```bash
npm run check:task9d40
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderAuditsPromptVersionForAiTranslate+deepSeekProviderGuardsSensitiveModelOutputAndAuditsIt test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
```

说明：9D.40 新增 `ai_audit_log.prompt_version`，AI 审计按 `agent_code` 写入固定版本号。真实模型输出命中密钥、token、系统表、文件表、审计表或明确内部泄露模式时，后端不返回原始模型文本，改为安全保护文案，并写入 `AI_OUTPUT_GUARDED` / `ai-governance-output-guard` 治理审计。

任务 9D.40 验收口径：

```text
1. AI 审计存在 prompt_version。
2. AI_TRANSLATE 成功审计写入 AI_TRANSLATE_V1。
3. 敏感模型输出不进入 HTTP 响应。
4. 输出防护命中写入 AI_OUTPUT_GUARDED 和 ai-governance-output-guard。
5. 本轮不做提示词后台管理、不做流式输出过滤、不接真实外部发送器。
```

任务 9D.41 AI 外部告警发送器第一增量检查：

```bash
npm run check:task9d41
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiExternalAlertSenderTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
```

说明：9D.41 新增 `AiExternalAlertSenderService#sendPendingAlerts`。本地 `EXTERNAL_ALERT` 通道作为 dry-run 发送成功，标记 `SENT`、累计 `attempts` 并清空 `last_error`；未知通道标记 `FAILED`、累计 `attempts` 并写入 `last_error`。本轮不调用真实外部渠道，不需要短信、邮件、企业微信或其他密钥。

任务 9D.41 验收口径：

```text
1. PENDING + EXTERNAL_ALERT outbox 可推进为 SENT。
2. SENT 时 attempts 累计，last_error 清空。
3. 未支持通道推进为 FAILED。
4. FAILED 时 attempts 累计，last_error 记录错误原因。
5. 本轮不接真实外部渠道、不新增密钥、不做定时调度。
```

任务 9D.42 AI 成本趋势第一增量检查：

```bash
npm run check:task9d42
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests#aiGovernanceCostTrendGroupsRecentSuccessCostByDayForInternalUsers+aiGovernanceCostTrendRejectsDoctorUsers test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
```

说明：9D.42 新增 `GET /ai/governance/cost-trend?days=7`。接口只对 CS / ADMIN 开放，按 `ai_audit_log.result_status=SUCCESS` 的成功模型调用聚合最近 1-31 天每日 `success_count`、`estimated_cost_microusd` 和 `model_count`，并返回窗口总成功次数和总估算成本。

任务 9D.42 验收口径：

```text
1. CS / ADMIN 可读取 AI 成本趋势。
2. DOCTOR 访问成本趋势返回 403。
3. points 按日期聚合成功调用成本、成功次数和模型数量。
4. 失败、限流、熔断等治理审计不计入成本趋势。
5. 本轮不做前端图表、不接真实账单、不新增密钥。
```

任务 9D.43 AI 真实外部渠道适配第一增量检查：

```bash
npm run check:task9d43
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiExternalAlertSenderTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
```

说明：9D.43 新增默认关闭的外部告警 webhook 配置。`EXTERNAL_ALERT` 默认仍按本地 dry-run 标记 `SENT`；只有设置 `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=true` 且提供 `AI_EXTERNAL_ALERT_WEBHOOK_URL` 时，发送器才会把 outbox payload 以 `application/json` POST 到 webhook。9D.45 后，非 2xx 或连接异常会写入 `last_error`，未达 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS` 保持 `PENDING`，达到上限进入 `DEAD_LETTER`。

任务 9D.43 验收口径：

```text
1. 默认配置不外呼，仍兼容 9D.41 dry-run。
2. 显式启用 webhook 后会发送 outbox payload。
3. webhook 2xx 时 outbox 标记 SENT。
4. webhook 非 2xx 或连接异常时写 last_error，并由 9D.45 负责有限重试/死信。
5. 本轮不提交真实 webhook、短信、邮件、企业微信密钥，不做调度器或死信。
```

任务 9D.44 AI 外部告警调度器第一增量检查：

```bash
npm run check:task9d44
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiExternalAlertSenderTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
```

说明：9D.44 新增默认关闭的 `AiExternalAlertScheduler`。`AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false` 时，即使调度方法被调用也不处理 outbox；显式设置为 `true` 后，调度器按 `AI_EXTERNAL_ALERT_SCHEDULER_BATCH_SIZE` 批量调用既有 sender。实际发送仍复用 9D.43 的 dry-run/webhook 门禁。

任务 9D.44 验收口径：

```text
1. 默认配置不自动调度 PENDING outbox。
2. 显式启用 scheduler 后按批次调用既有 sender。
3. 调度器不绕过 9D.43 的 webhook 默认关闭与外部 URL 安全注入边界。
4. `.env.example`、application.yml、OpenAPI、acceptance 和 README 均同步 scheduler 配置。
5. 本轮不做分布式锁、复杂重试、死信、真实短信/邮件/企业微信密钥或生产 webhook 联调。
```

任务 9D.45 AI 外部告警重试/死信第一增量检查：

```bash
npm run check:task9d45
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiExternalAlertSenderTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
```

说明：9D.45 新增 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS`，默认 3。webhook 失败时会累计 `attempts` 并写 `last_error`；未达到最大尝试次数时保持 `PENDING` 等待下次调度，达到上限后标记 `DEAD_LETTER`，避免调度器无限重复发送。

任务 9D.45 验收口径：

```text
1. webhook 失败且未达最大尝试次数时，outbox 保持 PENDING。
2. webhook 失败达到最大尝试次数时，outbox 进入 DEAD_LETTER。
3. 每次失败都会累计 attempts 并记录 last_error。
4. 默认 dry-run 和 webhook 成功路径仍保持 SENT。
5. 本轮不做分布式锁、退避调度、死信管理页面、真实短信/邮件/企业微信密钥或生产 webhook 联调。
```

任务 9D.46 AI 外部告警幂等/并发领取第一增量检查：

```bash
npm run check:task9d46
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiExternalAlertSenderTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
```

说明：9D.46 新增事务内 `SENDING` 领取态。sender 会先用条件更新把 `PENDING` outbox 领取为 `SENDING`，领取成功后才允许 dry-run 或 webhook 外呼；重复触发或并发 sender 不会重复发送同一条 outbox。

任务 9D.46 验收口径：

```text
1. 第一个 sender 已开始 webhook 发送但未结束时，第二个 sender 不会对同一条 outbox 发起第二次 webhook。
2. 并发后 outbox 最终只累计一次 attempts，成功路径为 SENT。
3. 默认 dry-run、unsupported channel、webhook 失败重试和死信路径仍保持原语义。
4. 本轮不做签名/鉴权、退避调度、告警抑制、监控指标、真实短信/邮件/企业微信密钥或生产 webhook 联调。
```

任务 9D.47 AI 外部告警 webhook 签名/鉴权第一增量检查：

```bash
npm run check:task9d47
npm run check:task9d71
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests,AiExternalAlertSenderTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
```

说明：9D.47 新增默认关闭的 webhook HMAC 签名；9D.71 把签名基串升级为 `timestamp.nonce.requestBody`，并新增默认关闭的接收端验签 / 防重放验收桩。显式设置发送侧 signing secret 但 secret 为空时，不发送未签名 webhook，而是进入既有失败/重试/死信链路；显式启用接收端但接收端 secret 为空时，接收端返回 503。

任务 9D.47 验收口径：

```text
1. 默认关闭签名时，既有 webhook 成功路径不携带 X-AI-Alert-Signature。
2. 9D.71 后，开启签名并提供 secret 时，webhook 请求携带 X-AI-Alert-Timestamp、X-AI-Alert-Nonce 和 X-AI-Alert-Signature。
3. 签名值等于 sha256= + HMAC-SHA256(secret, timestamp.nonce.requestBody)。
4. 9D.71 已补本地接收端验签 / 防重放验收桩；仍不做真实短信/邮件/企业微信密钥或生产 webhook 联调。
```

任务 9D.48 AI 外部告警监控/运维可观察第一增量检查：

```bash
npm run check:task9d48
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests#aiExternalAlertMonitorSummarizesOutboxForInternalUsers test
```

说明：9D.48 新增只读 outbox 监控摘要。CS / ADMIN 可查看 `PENDING/SENDING/SENT/FAILED/DEAD_LETTER` 状态分布、最近一条 FAILED / DEAD_LETTER 错误和最老 PENDING 创建时间；医生端访问返回 403。

任务 9D.48 验收口径：

```text
1. CS / ADMIN 可读取 AI 外部告警 outbox 监控摘要。
2. 响应包含状态数量分布、最近失败/死信错误和最老待发送时间。
3. last_error 做基础脱敏，不返回真实 webhook URL、密钥、prompt 原文、模型原始响应或内部生产敏感详情。
4. 本轮不做 outbox 列表筛选、人工重放、人工关闭、告警抑制、短信/邮件/企业微信或生产 webhook 联调。
```

任务 9D.48.1 AI 外部告警 outbox 列表/筛选第一增量检查：

```bash
npm run check:task9d48-1
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests#aiExternalAlertListFiltersRecentOutboxWithoutSensitivePayloadForInternalUsers test
```

说明：9D.48.1 新增只读 outbox 列表。CS / ADMIN 可按 `send_status`、`event_type`、`created_at_from`、`created_at_to` 和 `limit` 查询安全元数据；医生端访问返回 403。

任务 9D.48.1 验收口径：

```text
1. CS / ADMIN 可读取 AI 外部告警 outbox 最近记录列表。
2. 支持 send_status、event_type、created_at 起止范围和 limit 最小筛选。
3. 响应不返回 payload、last_error、真实 webhook URL、密钥、prompt 原文、模型原始响应或内部生产敏感详情。
4. 本轮不做人工重放、编辑、关闭、死信恢复、告警抑制或生产 webhook 联调。
```

任务 9D.48.2 AI 外部告警失败/死信可见性第一增量检查：

```bash
npm run check:task9d48-2
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests#aiExternalAlertListShowsSanitizedFailureMetadataForFailedAndDeadLetterRecords test
```

说明：9D.48.2 在只读 outbox 列表中为 FAILED / DEAD_LETTER 增加安全失败排查字段。CS / ADMIN 可查看 `attempts`、脱敏 `last_error` 和 `last_attempted_at`；医生端仍无权访问。

任务 9D.48.2 验收口径：

```text
1. CS / ADMIN 可在 outbox 列表中读取 FAILED / DEAD_LETTER 的 attempts、last_error 和 last_attempted_at。
2. last_error 必须脱敏，不暴露真实 webhook URL、密钥、Bearer token、prompt 原文、模型原始响应或上游敏感响应。
3. 本轮不做重试按钮、死信恢复、人工处理状态、编辑、关闭、告警抑制或生产 webhook 联调。
```

任务 9D.10 100MB+ Multipart 浏览器 smoke：

```bash
npm run compose:up
npm run dev:backend
npm run dev:frontend
npm run smoke:task9d10-large-upload
npm run smoke:task9d10-server-resume
npm run smoke:task9d10-interrupted-resume
```

Task 8 readiness 终检报告第一增量检查：

```bash
npm run check:task8-final-readiness
npm run acceptance
```

说明：终检报告位于 `docs/deployment/task-8-final-readiness-report.md`，只整理上线前缺口，不把 Task 8 标完成。

部署安全 / 环境变量 readiness 检查第一增量：

```bash
npm run check:deployment-env
npm run acceptance
```

说明：正式环境必须外部注入数据库密码、Redis/MinIO 凭据、`APP_AUTH_TOKEN_SECRET`、`DEEPSEEK_API_KEY`、`AI_EXTERNAL_ALERT_WEBHOOK_URL`、`AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET`、`AI_EXTERNAL_ALERT_RECEIVER_SIGNING_SECRET` 和 HTTPS/部署平台密钥。仓库只保留 `.env.example` 占位值，禁止提交真实密钥。AI 默认保持 `AI_PROVIDER=deterministic`、`AI_DEEPSEEK_ENABLED=false`、`AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=false`、`AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false`、`AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED=false`，真实模型、外部 webhook、调度器和接收端验签必须显式开启。

验收矩阵机器可读缺口清单第一增量：

```bash
npm run check:task8-readiness-gaps
npm run acceptance
```

说明：`acceptance.json` 的 `task8_readiness_gaps` 维护 Task 8 当前仍未 READY 的关键缺口，包括正式鉴权、前端业务页面、WebSocket/通知、文件上传、AI 治理、部署基础设施、操作手册和客户/PM 确认项。该命令只做缺口索引检查，不代表 Task 8 已可上线。

说明：`smoke:task9d10-large-upload` 使用 Playwright Test + 本机 Chrome channel，默认生成 105MB 稀疏 STL 文件，通过医生浏览器登录、创建测试订单、选择附件、Multipart 上传、完成 `file_id` 回填和预览权限校验。快速排错可临时调小 `TASK9D10_UPLOAD_SIZE_BYTES`；正式验收保持默认 100MB+。`smoke:task9d10-server-resume` 默认生成 6MB 文件，预创建 pending Multipart 并清理本地上传会话，验证浏览器最终完成的 `file_id` 等于 pending `file_id`。`smoke:task9d10-interrupted-resume` 默认生成 6MB 文件，模拟第 2 个分片 PUT 断网，验证第二次点击上传可读取本地 session 和服务端 status，并复用同一 `file_id` 完成上传。

任务 9D.3 客服初审第一增量检查：

```bash
npm run check:task9d3
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests test
npm run check:openapi
npm run build:frontend
```

任务 9D.3 本地 smoke 验收方式：

```text
1. 启动 MySQL / Redis / MinIO、后端和 Vite。
2. doctor 创建一条订单，使其进入 PENDING_CS_REVIEW / PENDING_REVIEW。
3. cs 通过 http://localhost:5173 登录，进入「内部订单」。
4. 「客服初审」列表按 PENDING_CS_REVIEW 过滤，选择订单后可查看订单资料。
5. 点击「通过初审」后订单进入 PENDING_PRODUCTION_REVIEW / PENDING_REVIEW，且不会实例化工序；点击「驳回」需填写驳回原因并进入 CS_REJECTED / PENDING_REVIEW。
```

任务 9D.4 生产审核第一增量检查：

```bash
npm run check:task9d4
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=WorkflowRuntimeTests test
npm run check:openapi
npm run build:frontend
```

任务 9D.4 本地 smoke 验收方式：

```text
1. 启动 MySQL / Redis / MinIO、后端和 Vite。
2. doctor 创建一条订单，cs 在「客服初审」通过，使订单进入 PENDING_PRODUCTION_REVIEW / PENDING_REVIEW。
3. cs 进入「生产审核」页面，列表按 PENDING_PRODUCTION_REVIEW 过滤。
4. 选择订单、工序链、入口路线和分支参数，点击「通过生产审核」。
5. 订单进入 PROCESS_INSTANCE_CREATED / PRODUCING，并生成 order_process_instance；未经过客服初审的订单调用生产审核应返回 409。
```

任务 9D.5 生产任务入口第一增量检查：

```bash
npm run check:task9d5
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=WorkflowRuntimeTests,PermissionInterceptorTests test
npm run check:openapi
npm run build:frontend
```

任务 9D.5 本地 smoke 验收方式：

```text
1. 启动 MySQL / Redis / MinIO、后端和 Vite。
2. 准备一条已生产审核通过的订单，使其进入 PROCESS_INSTANCE_CREATED 并生成工序实例。
3. cs 进入「派工转派」，搜索订单号，选择节点，填写 worker 的 user_id，点击「绑定员工」或「转派员工」。
4. worker 登录后进入「我的任务」，按 READY 查看本人任务，能看到刚才分配的订单和节点。
5. 「工序实例」页面可查看同一订单的节点列表、实例状态、节点数和边数。
```

任务 9C.3 本地 smoke 验收方式：

```text
1. 启动 MySQL / Redis / MinIO、后端和 Vite。
2. doctor 通过 http://localhost:5173/api/auth/login 获取 Bearer token。
3. doctor 连接 ws://localhost:5173/ws/connect?token={accessToken}。
4. admin 调用 POST http://localhost:8080/orders/{orderId}/bill 触发账单通知。
5. WebSocket 收到 BILL_UPLOADED payload，且 payload 只包含公开 orderId/orderNo/message。
```

当前上线结论：

```text
NOT READY。
后端最小链路已有 smoke 基线，OpenAPI 当前后端基线已二次冻结，Bearer 身份基线、后端集中权限守卫、数据库化 RBAC/DataScope 基础、菜单/部门/岗位与前端权限路由第一增量、权限注解/统一拦截器、订单/工序实例 DataScope SQL 第一增量、文件/协同/AI DataScope 扩展、生产鉴权启动门禁第一增量、Refresh Token/logout 第一增量、WebSocket 通知第一增量、通知未读/已读第一增量、通知实时前端/Redis 广播第一增量、医生订单工作台第一增量、医生下单第一增量、客服初审第一增量、生产审核第一增量、生产任务入口第一增量、入检/出检/工时操作页面第一增量、绩效管理页面第一增量、生产看板第一增量、返工终检第一增量、Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke、100MB+ 浏览器上传 smoke、医生订单草稿/补资料第一增量、动态表单 CRUD 第一增量、设计稿多文件/多版本第一增量、终检发货拦截第一增量、真实 DeepSeek 接入第一增量、终检报告第一增量、返工关闭/责任分类第一增量、返工字典第一增量、返工通知联动第一增量、复杂返工影响范围第一增量、绩效归因联动第一增量、返工影响审计可视化第一增量、返工影响筛选第一增量、绩效明细第一增量、AI 分角色预算第一增量、AI 分模型预算第一增量、AI 提示词版本与输出防护第一增量、AI 外部告警发送器第一增量、AI 成本趋势第一增量、AI 真实外部渠道适配第一增量、AI 外部告警调度器第一增量、AI 外部告警重试/死信第一增量、AI 外部告警幂等/并发领取第一增量和 AI 外部告警 webhook 签名/鉴权第一增量已落地。
正式上线仍缺完整 RuoYi 管理 UI、通用 DataScope SQL 拦截器、真实弱网/跨设备续传、完整客服协同、账单物流闭环、绩效完整公式/周期/申诉/标准工时配置、终检 PDF/签名/真实物流/管理绩效等完整前端业务页面、WebSocket 生产网关/真实多实例验收、外部告警接收端验签/防重放/生产联调、提示词后台管理、流式输出过滤、真实 key 联调、HTTPS/备份/监控/操作手册等硬条件。
```

鉴权说明：

```text
登录接口当前返回服务端签发的 Bearer access token、refresh token 和 `refreshExpiresAt`。
登录接口当前读取数据库账号、角色、权限、data scope 和可见菜单；Bearer token payload 包含 `username`、`user_id`、`clinic_id`、`permissions` 和 `data_scope`。
Refresh token 只以 SHA-256 hash 形式保存到 `auth_refresh_token`；`/api/auth/refresh` 可换发新的 access token，并轮换 refresh token，客户端必须用响应里的新 `refreshToken` 替换本地保存值；旧 refresh token 会立即吊销，复用旧 token 返回 401。`/api/auth/logout` 会吊销当前 refresh token；当前仍不做 access token 服务端黑名单，已签发 access token 等待自然过期。
后端已有 `AccessControlService` 集中守卫，覆盖派工/转派/跳过节点、医生检查记录拒绝、WORKER/ADMIN 绩效范围等高风险点。
后端已有 `@RequirePermission` 与 `PermissionInterceptor`，对当前业务 Controller 入口做权限码校验；本地 `X-Bootstrap-*` 兼容路径仅作为 smoke 角色 fallback。
后端已有 `BootstrapIdentityArgumentResolver`，业务 Controller 不再直接解析 `X-Bootstrap-*`；订单详情、AI-3 安全读模型、工序实例、文件读取、协同订单范围和 AI 内部上下文读取已加入 SQL DataScope 过滤；前端骨架会按后端 `menus` 渲染入口。
APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=true 仅用于本地烟测兼容 X-Bootstrap-*；prod profile 已通过 application-prod.yml 固定关闭，若生产仍启用会启动失败。
APP_AUTH_TOKEN_SECRET 在正式环境必须使用安全注入的真实密钥，不得提交；prod profile 不提供本地默认值，若仍使用 local-dev-change-me-auth-secret 会启动失败。
WebSocket 通知使用 /ws/connect?token={accessToken}；服务端校验 Bearer token 后才登记在线用户。前端通知中心登录后会建立 WebSocket，收到推送后刷新通知列表和未读数。
通知 REST 已提供 /notifications、/notifications/unread-count、/notifications/{notificationId}/read、/notifications/read-all；前端骨架登录后有「通知中心」入口，支持未读数、列表、单条已读和全部已读。
本地 Vite 已代理 `/notifications` 和 `/ws` 到后端，通知中心不走 `/api/notifications`；一期 Nginx 生产骨架也必须代理 `/notifications` 和 `/ws/`，可通过 `npm run check:task9d76` 静态检查。
Redis 多实例广播默认关闭；需要联调多实例时设置 `NOTIFICATION_REDIS_BROADCAST_ENABLED=true`，并为每个后端实例配置不同 `APP_INSTANCE_ID`。
医生订单工作台使用 `/orders`、`/form-configs`、`/files/multipart/*`、`/files/{fileId}/multipart/status`、`/orders/{orderId}/messages`、`/orders/{orderId}/design-drafts`、`/orders/{orderId}/bill`、`/orders/{orderId}/logistics` 和 `/ai/order-query`；客服初审入口使用 `/orders?internal_status=PENDING_CS_REVIEW`、`/orders/{orderId}/review` 和 `/orders/{orderId}/design-drafts` 多文件设计稿上传；客服协同台使用 `/messages/pending-review`、`/orders/{orderId}/messages` 和 `/messages/{msgId}/review` 查看待审核消息、订单消息上下文并通过/驳回；生产审核入口使用 `/orders?internal_status=PENDING_PRODUCTION_REVIEW`、`/workflow-chains` 和 `/orders/{orderId}/production-review`；生产任务入口使用 `/orders?internal_status=PROCESS_INSTANCE_CREATED`、`/orders/{orderId}/process-instance`、派工/转派接口、`/tasks/mine` 和 `/process-instance/nodes/{nodeInstanceId}/start|complete`；质检工时入口使用 `/tasks/mine`、`/check-records` 和 `/work-logs/*`；绩效入口使用 `/performance` 和 `/performance/details`；生产看板入口使用 `/orders` 跨内部状态检索和 `/orders/{orderId}/process-instance` 查看节点进度；返工终检入口使用 `/reworks`、`/reworks/{reworkId}/close`、`/tasks/mine?status=COMPLETED`、`/check-records` 和 `/final-inspection-reports`；AI-1/AI-2/AI-3/AI-5 的真实模型由后端 `app.ai` 配置切换，前端不接触 DeepSeek Key；本地 Vite 已代理 `/api`、`/notifications`、`/ws`、`/orders`、`/files`、`/form-configs`、`/workflow-chains`、`/tasks`、`/process-instance`、`/check-records`、`/reworks`、`/final-inspection-reports`、`/work-logs`、`/performance` 与 `/ai`。
```

OpenAPI 二次契约验收口径：

```text
npm run check:openapi 会执行自定义契约检查、Swagger validate 和 Redocly lint。
当前契约 path / operation / operationId 数量以 `npm run check:openapi` 输出为准；Redocly warning 已清零；9B.8 已补 `/auth/refresh`、`/auth/logout`、`RefreshTokenRequest`、`refreshToken` 和 `refreshExpiresAt`；9D.1 已补 `/orders` 当前实现的 `OrderListResponse` / `DoctorOrderSummary` schema，9D.2 已补 `FormFieldConfig` / `CreateOrderRequest` / `CreateOrderResponse`，9D.3 已补 `OrderReviewRequest`、`internal_status` 列表过滤参数和 `/orders/{orderId}/review` 响应 schema，9D.4 已校正生产审核状态门禁和权限描述，9D.5 已校正派工/转派权限说明和 `tasks/mine` 的 `READY` 状态过滤；9D.6 复用既有 `/check-records` 与 `/work-logs/*` 契约，9D.7 复用既有 `/performance` 契约，9D.8 复用既有 `/orders` 与 `/orders/{orderId}/process-instance` 契约，9D.9 新增 `/reworks` 和 `ReworkRecordResponse` 契约，9D.10 新增 Multipart 文件上传、status 恢复、pending 恢复候选接口和 schema，9D.11 已校正 `DRAFT` 外部状态、`UpdateOrderRequest` 和 `PUT /orders/{orderId}` 草稿/补资料契约，9D.12 已补动态表单 `status`、create/update 响应和 `status=INACTIVE` 逻辑停用描述，9D.14 已补 `/orders/{orderId}/logistics` 发货前终检 `OUT/PASS` 门禁描述，9D.15 已补 AI 端点 DeepSeek 适配、deterministic fallback 和 AI-3 `SAFE_REFUSAL` 描述，9D.16/9D.56 已补 `/final-inspection-reports`、`/final-inspection-reports/{orderId}`、终检报告 schema、`attachment_file_ids` 和 `final-inspection:manage` 专用权限说明，9D.17 已补 `/reworks/{reworkId}/close` 和 `ReworkCloseRequest`，9D.18 已补 `/reworks/dictionaries` 和 `ReworkDictionariesResponse`，9D.19 已补 `REWORK_CREATED` / `REWORK_CLOSED` 通知事件说明，9D.21 已补 `PerformanceStats` 绩效责任归因字段，9D.22 已补 `ReworkRecordResponse` 返工影响审计字段，9D.23 已补 `/reworks` 的 `has_impacted_nodes` 筛选参数，9D.25 已补 `/performance/details` 和 `PerformanceDetail` schema，9D.42 已补 `/ai/governance/cost-trend`，9D.43 已补 AI 外部告警 webhook 配置说明，9D.44 已补 AI 外部告警调度器配置说明，9D.45 已补 AI 外部告警重试/死信说明，9D.46 已补 AI 外部告警幂等/并发领取说明，9D.47 已补 AI 外部告警 webhook HMAC 签名说明，9D.48 已补 `/ai/governance/external-alerts/summary` 和 `AiExternalAlertSummaryResponse`，9D.48.1 已补 `/ai/governance/external-alerts` 和 `AiExternalAlertListResponse`，9D.55 已补 `/reworks/dictionaries/items`、`CreateReworkDictionaryItemRequest`、`UpdateReworkDictionaryItemRequest` 和 `ReworkDictionaryItemResponse`；9D.57 与 9D.58 均不新增后端接口。
```

Task 8A smoke 注意事项：

```text
本地数据库可能包含历史 smoke/测试追加数据；不要用 /workflow-chains 总数判断种子链是否只有 9 条。
本轮验收口径是：9 条预定义链全部存在，且常规冠修复节点可查询。
正式上线验收应在干净测试库或固定快照库复跑。
```

## 下一步开发入口

优先处理 `tasks/README.md`：

1. 下一轮唯一推荐目标：客服配送管理页 / 物流异常跟进第一增量。
2. 9D.83 已补患者管理基础版，9D.84 已补人工支付流水 / 收支记录，9D.85 已补客户 / 诊所档案与偏好，9D.86 已补人员档案 / 工作量看板，9D.87 已补质量记录 / 外返登记，9D.88 已补客服订单 / 沟通完整可见性，9D.89 已补医生账户设置，9D.90 已补产品参数 / 价格体系一期最小后台；下一步继续按 `docs/acceptance/prd-v2-gap-matrix.md` 关闭 PRD V2.0 本地可实现的一期缺口。
3. 不做独立网盘、Tus/tusd 独立服务、真实弱网全量验收、跨设备复杂续传、真实电子签章平台、物流平台 API 自动同步、支付系统、复杂 CRM、自动报价或 AI 自动审核/发送；每补一个缺口，都要回写 `docs/acceptance/task-8-acceptance-matrix.md` 和 `docs/deployment/readiness-checklist.md` 的状态。

## 9D.77 文件上传弱网 / 跨设备验收第一段

检查命令：

```bash
npm run check:task9d77
npm run smoke:task9d77-file-upload-resilience
```

`smoke:task9d77-file-upload-resilience` 使用两个 Playwright browser context 模拟跨设备续传：设备 A 在弱网延迟下中断 Multipart 上传，设备 B 不共享 localStorage，通过服务端 pending 候选恢复并完成同一 `file_id`。该 smoke 会写入本地测试库和 MinIO，不代表真实生产对象存储联调完成。

## 9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段

检查命令：

```bash
npm run check:task9d78
npm run check:deployment-env
```

`check:task9d78` 检查 `.env.example` 的本地开发 bucket 与 `deploy/env/phase-one.prod.example` 的正式环境 bucket 占位值不同，确认一期 compose 要求外部注入 `MINIO_BUCKET`，并确认 `docs/acceptance/task-9d78-bucket-isolation-readiness.md`、readiness 和 acceptance 文档已记录测试 / 正式对象存储 bucket 隔离边界。该检查不接真实生产对象存储，不代表真实测试 / 正式 bucket 已实际创建或联调完成。

## 9D.79 真实环境文件上传人工验收记录模板第一段

检查命令：

```bash
npm run check:task9d79
```

`check:task9d79` 检查 `docs/acceptance/task-9d79-real-env-file-upload-manual-acceptance.md` 是否保留真实环境文件上传验收模板、待填写字段、测试 / 正式 bucket、对象存储账号隔离、弱网、跨设备、越权读取和客户/PM 签字状态，并禁止把真实环境写成已验收。该模板不填写真实密钥，不代表真实环境已验收。

## 9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段

检查命令：

```bash
npm run check:task9d80
```

`check:task9d80` 检查 `docs/acceptance/task-9d80-ai-production-integration-acceptance.md` 是否保留 AI 真实 key / 生产 webhook 联调记录模板、待填写字段、DeepSeek key 外部注入、生产 webhook、发送侧签名、接收端验签 / 防重放、预算熔断、输出防护和客户/PM 签字状态，并禁止把真实 key 或生产 webhook 写成已联调完成。该模板不填写真实密钥，不填写真实 webhook URL，不代表真实 key 或生产 webhook 已联调完成。

## 9D.81 部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段

检查命令：

```bash
npm run check:task9d81
```

`check:task9d81` 检查 `docs/deployment/task-9d81-production-deployment-acceptance.md` 是否保留部署真实环境 smoke / HTTPS / 备份监控验收记录模板、待填写字段、Docker Compose、Nginx、HTTPS、镜像仓库、生产环境变量、数据库备份、备份恢复演练、日志留存、监控告警、发布回滚和客户/PM 签字状态，并禁止把真实服务器、HTTPS、备份恢复或监控告警写成已验收完成。该模板不填写真实密钥，不填写真实服务器地址，不代表真实部署已完成。

## 9D.83 患者管理基础版第一增量

检查命令：

```bash
npm run check:task9d83
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=PatientManagementTests test
npm run check:openapi
npm run build:frontend
```

9D.83 新增医生端患者管理基础版：`patient_record`、`orders.patient_id`、`patient:manage-doctor`、`/patients`、`/patients/{patientId}/orders` 和医生端 `/doctor/patients` 最小入口。医生只能管理本人 + 本诊所患者，患者历史订单只返回外部状态。本轮不做真实客户数据导入、高级标签、批量检索或 AI 历史方案推荐。

## 9D.84 人工支付流水 / 收支记录第一增量

检查命令：

```bash
npm run check:task9d84
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=MessageDesignBillNotificationTests test
npm run check:openapi
npm run build:frontend
```

9D.84 新增 `order_payment_record`、`PaymentRecordRequest` / `PaymentRecordResponse` 和 `/orders/{orderId}/payments`。CS / ADMIN 可录入人工收款流水，医生只读查看本人订单流水。本轮不接真实支付网关，不做退款、自动对账、电子发票、财务审批或月结自动归集。

## 9D.85 客户 / 诊所档案与偏好第一增量

检查命令：

```bash
npm run check:task9d85
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=ClinicPreferenceTests test
npm run check:openapi
npm run build:frontend
```

9D.85 复用 `clinic` 和 `customer_preference`，新增 `ClinicPreferenceTests`、`/clinics`、`/clinics/{clinicId}`、`/clinics/{clinicId}/preference`、客服端 `/customers`、管理端 `/admin/clinics`、医生端 `/doctor/account/clinic` 和 `npm run check:task9d85`。CS / ADMIN 可创建基础诊所档案并维护客户偏好，医生只能只读查看本人诊所偏好，WORKER 不能访问。本轮不做客户开户审批、定价体系、真实客户数据导入、复杂 CRM 或客户 / PM 字段最终确认。

## 9D.86 人员档案 / 工作量看板第一增量

检查命令：

```bash
npm run check:task9d86
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=StaffWorkloadTests test
npm run check:openapi
npm run build:frontend
```

9D.86 复用 `system_user`、`system_dept`、`system_post`、`system_user_post`、`system_user_role`、`work_log` 和 `rework_record`，新增 `/staff/workload`、`StaffWorkloadTests`、生产端 `/production/staff`、管理端 `/admin/staff` 和 `npm run check:task9d86`。ADMIN / CS 可查看内部员工档案和工作量，WORKER 只返回本人，DOCTOR 禁止访问。本轮不做完整 HR、工资、排班、请假、绩效申诉、薪酬结算、岗位能力矩阵编辑或人员 CRUD。

## 9D.87 质量记录 CRUD / 外返登记第一增量

检查命令：

```bash
npm run check:task9d87
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=QualityRecordTests test
npm run check:openapi
npm run build:frontend
```

9D.87 先复用 `check_record` 和 `rework_record`，新增 `/quality-records`、`/quality-records/external-returns`、`QualityRecordTests`、生产端 `/production/quality` 质量记录列表 / 外返登记入口和 `npm run check:task9d87`。PRD V2 本地功能差异收口 B 在此基础上新增 `quality_record` 独立事实表、`/quality-records/{qualityRecordId}/status` 状态更新接口、生产端状态更新表单和 `npm run check:prd-v2-gap-closure-b`。CS / ADMIN 可登记、查看、更新内部质量记录状态，DOCTOR 禁止访问；创建外返继续保留 `check_record` / `rework_record` 兼容证据。本轮仍不做编辑/删除、投诉/退货系统、质量复盘完整流程或客户最终质量口径确认。

## 9D.90 产品参数 / 价格体系一期最小后台

检查命令：

```bash
npm run check:task9d90
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=ProductCatalogTests test
npm run check:openapi
npm run build:frontend
```

9D.90 新增 `product_catalog`、`product:manage`、`/products`、`/products/{productId}`、`ProductCatalogTests`、`npm run check:task9d90` 和产品管理页基础价维护入口。CS / ADMIN 可维护产品类型、产品名称、材料规格、人工基础价、币种、状态和价格备注，DOCTOR 禁止读取内部基础价。本轮不做自动报价、客户分层价格、价格审批、账单重算、真实财务结算或客户 / PM 价格口径最终确认。

## 9D.91 客服配送管理页 / 物流异常跟进第一增量

检查命令：

```bash
npm run check:task9d91
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=MessageDesignBillNotificationTests test
npm run check:openapi
npm run build:frontend
```

9D.91 新增 `/logistics/orders`、`/orders/{orderId}/logistics/exception`、`DeliveryOrderResponse`、`LogisticsExceptionRequest`、`npm run check:task9d91` 和客服端 `/delivery` 配送管理页。CS / ADMIN 可查看配送列表、按物流状态筛选并记录内部异常跟进；医生端物流详情不返回内部跟进说明，医生禁止写入异常跟进。本轮不新增迁移，不接真实物流 API、电子面单、自动轨迹同步、签收回调、物流平台 webhook 或真实物流密钥。

## 9D.92 AI-2 客服查询助手完整入口第一增量

检查命令：

```bash
npm run check:task9d92
npm run build:frontend
```

9D.92 复用既有 `/ai/cs-query` 后端能力，在客服端 `/ai/cs` 新增客服查询助手入口。CS / ADMIN 可输入订单 ID 和问题生成内部只读查询草稿；页面明确结果不自动发送给医生、不自动写入订单，对外发送前需人工确认。本轮不新增后端接口、不新增迁移、不接真实 key、不做自动审核或自动外发。

## 9D.93.1 PRD V2 范围纠偏第一闭环

检查命令：

```bash
npm run check:task9d93
npm run check:task9d36
npm run build:frontend
```

9D.93.1 的医生文件模块判断继续保留：医生端独立 `/doctor/files` / `doctor-files` 入口仍移除，病例、口扫、图片、处方和设计稿文件继续归入医生订单链路。2026-07-06 内部确认基准已覆盖旧 C 类判断：设备 / 物料 / 安环 / 成本 / 奖惩只保留入口、基础台账、基础登记、状态更新或架构预留，不再继续扩成一期完整管理闭环。所有 AI 智能体使用 LangChain + DeepSeek。9D.94 已补 LangChain + DeepSeek AI 底座对齐第一增量，但真实 key、生产联调、流式输出、RAG、复杂 tool calling 和客户 / PM AI 验收仍未关闭。Task 8 仍保持 NOT_READY。

## 9D.94 LangChain + DeepSeek AI 底座对齐第一增量

检查命令：

```bash
npm run check:task9d94
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#enabledLangChainDeepSeekProviderRoutesAllAiAgentsThroughLangChain test
```

9D.94 已新增 LangChain4j OpenAI-compatible ChatModel 依赖和 `LangChainDeepSeekAiModelClient`，显式 `AI_PROVIDER=langchain-deepseek`、`AI_LANGCHAIN_ENABLED=true`、`AI_DEEPSEEK_ENABLED=true` 且外部注入 `DEEPSEEK_API_KEY` 时，AI-1 / AI-2 / AI-3 公开查询 / AI-5 经 LangChain4j 调用 DeepSeek；AI-3 内部问题仍本地安全拒答，不外呼模型。默认仍关闭，不提交真实 key，不代表真实环境联调完成。

## 9D.95 设备 / 物料 / 安环 / 成本 / 奖惩基础台账拆解记录

检查命令：

```bash
npm run check:task9d95
```

9D.95 的 `docs/acceptance/phase-one-production-support-closure-plan.md` 现在保留为历史拆解和基础能力索引。9D.50-9D.54 的只读汇总，以及 9D.95.1 设备台账 / 设备事件录入、9D.95.2 物料异常登记 / 处理状态、9D.95.3 安环巡检 / 隐患整改、9D.95.4 成本记录维护 / 趋势口径、9D.95.5 奖惩记录 / 审批状态，均作为 C 类基础能力证据保留，不再解读为一期继续补完整闭环的排期。本轮不新增业务接口、不新增数据库迁移、不做 CRUD，不接 IoT、真实财务系统或工资发放。Task 8 仍保持 NOT_READY。

## 9D.95.1 设备台账 / 设备事件录入第一增量

检查命令：

```bash
npm run check:task9d951
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=ProductionEquipmentManagementTests,ProductionEquipmentSummaryTests test
npm run check:openapi
npm run build:frontend
```

9D.95.1 复用 9D.50 的设备台账和设备事件基础表，新增 `POST /production/equipment` 与 `POST /production/equipment/{equipmentCode}/events`。WORKER / ADMIN 可人工登记设备台账和保养计划、故障报修、停机事件；DOCTOR 写入返回 403。生产端设备管理页新增“登记设备”和“登记事件”最小表单，提交后刷新既有真实设备汇总。本轮不新增迁移，不接 IoT，不做保养审批流或真实设备联网。Task 8 仍保持 NOT_READY。

## 9D.95.2 物料异常登记 / 处理状态第一增量

检查命令：

```bash
npm run check:task9d952
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=ProductionMaterialExceptionManagementTests,ProductionMaterialExceptionSummaryTests test
npm run check:openapi
npm run build:frontend
```

9D.95.2 复用 9D.51 的物料异常基础事实表，新增 `POST /production/material-exceptions` 与 `PUT /production/material-exceptions/{exceptionNo}/status`。WORKER / ADMIN 可人工登记缺料、错料、批次异常、材料损耗，并更新 `PENDING / IN_PROGRESS / CLOSED` 处理状态；DOCTOR 写入和更新返回 403。生产端物料异常页新增“登记物料异常”和“更新处理状态”最小表单，提交后刷新既有真实物料异常汇总。本轮不新增迁移，不接库存扣减、采购补料、供应商协同或 WMS。Task 8 仍保持 NOT_READY。

## 9D.95.3 安环巡检 / 隐患整改第一增量

检查命令：

```bash
npm run check:task9d953
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=ProductionSafetyEnvironmentManagementTests,ProductionSafetyEnvironmentSummaryTests test
npm run check:openapi
npm run build:frontend
```

9D.95.3 复用 9D.52 的安环事件基础事实表，新增 `POST /production/safety-environment/events` 与 `PUT /production/safety-environment/events/{eventNo}/status`。WORKER / ADMIN 可人工登记安全巡检、隐患整改、环境记录、PPE / 设备安全提醒，并更新 `PENDING / IN_PROGRESS / CLOSED` 整改状态；DOCTOR 写入和更新返回 403。生产端安环管理页新增“登记安环事件”和“更新整改状态”最小表单，提交后刷新既有真实安环汇总。本轮不新增迁移，不接真实环境采集硬件、PPE 发放系统或完整安环审批流。Task 8 仍保持 NOT_READY。

## 9D.95.4 成本记录维护 / 趋势口径第一增量

检查命令：

```bash
npm run check:task9d954
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=ProductionCostSummaryTests test
npm run check:openapi
npm run build:frontend
```

9D.95.4 复用 9D.53 的成本记录基础事实表，新增 `POST /production/cost-management/records`。WORKER / ADMIN 可人工登记工序、材料、人工、返工和外协成本记录，`WARNING` 状态计入既有成本异常预警汇总；DOCTOR 写入返回 403。生产端成本管理页新增“登记成本记录”最小表单，提交后刷新既有真实成本汇总。本轮不新增迁移，不接真实财务系统、发票、付款、对账或自动成本分摊。Task 8 仍保持 NOT_READY。

## 9D.95.5 奖惩记录 / 审批状态第一增量

检查命令：

```bash
npm run check:task9d955
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=ProductionRewardPenaltySummaryTests test
npm run check:openapi
npm run build:frontend
```

9D.95.5 复用 9D.54 的奖惩记录基础事实表，新增 `POST /production/reward-penalty/records` 与 `PUT /production/reward-penalty/records/{recordNo}/status`。WORKER / ADMIN 可人工登记奖励或扣罚记录，并更新待审批、已通过、已驳回、已生效状态；DOCTOR 写入和更新返回 403。生产端奖惩管理页新增“登记奖惩记录”和“更新审批状态”最小表单，提交后刷新既有真实奖惩汇总。本轮不新增迁移，不作为工资发放结果，不做薪酬结算、绩效申诉闭环或复杂审批引擎。Task 8 仍保持 NOT_READY。

## 9D.96 医生提交前 AI-4 资料缺失自动触发体验第一增量

检查命令：

```bash
npm run check:task9d96
npm run build:frontend
npm run acceptance
```

9D.96 复用既有 `/ai/check-missing`。医生端点击“提交订单”或“提交草稿/补资料”时，会先把当前表单保存为草稿，再自动触发 AI-4 资料缺失检查；如返回缺失项，页面展示“AI-4 资料缺失检查”和缺失清单，并阻断正式提交。资料完整时才继续提交到客服审核。本轮不新增后端接口，不做 AI 自动驳回订单，不接真实 DeepSeek key 或新外部服务。Task 8 仍保持 NOT_READY。

## 9D.97 AI-2 客服查询引用数据说明 / 知识上下文补强第一增量

检查命令：

```bash
npm run check:task9d97
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests#csQueryReturnsReferenceDataNotesForAuditableInternalSources test
npm run check:openapi
npm run build:frontend
```

9D.97 继续复用 `/ai/cs-query`，响应新增 `reference_data_notes`。CS / ADMIN 查询时，后端按客服权限范围返回订单基础、生产上下文、沟通消息、附件、账单和物流只读来源说明；客服端 `/ai/cs` 展示“引用数据说明”。本轮不新增数据库迁移，不接真实 DeepSeek key，不做 RAG / tool calling，不自动发送医生消息，不自动写入订单、生产备注、客服消息或审核结论。Task 8 仍保持 NOT_READY。

## 9D.98 AI-5 生产备注客户模板 / 知识上下文补强第一增量

检查命令：

```bash
npm run check:task9d98
./scripts/with-jdk21.sh mvn -f backend/platform-server/pom.xml -Dtest=AiGatewayTests#productionNoteDraftUsesDefaultTemplateAndHumanConfirmationWritesOrderNote test
npm run check:openapi
npm run build:frontend
npm run acceptance
```

9D.98 继续复用 `/ai/production-note` 生成生产备注草稿，响应新增 `template_version=PHASE_ONE_DEFAULT_V1`、`knowledge_context_notes` 和 `requires_customer_template_confirmation`。新增 `/ai/production-note/confirm`，CS / WORKER / ADMIN 在订单数据范围内人工确认后才追加写入 `orders.production_note` 并写 AI 审计。客服初审页新增 AI-5 生产备注草稿、知识上下文说明和人工确认写入入口；`npm run check:task9d98` 同时复核 AI-1、AI-2、AI-4 和 AI-5 入口。本轮不新增数据库迁移，不接真实 DeepSeek key，不伪装真实客户模板或客户签字，不自动下发生产指令。Task 8 仍保持 NOT_READY。

## Codex Token 成本治理

检查命令：

```bash
npm run codex:token-report
npm run check:codex-token-cost
```

`npm run codex:token-report` 会读取本机 `~/.codex/sessions`，按请求级 token 统计最近 session 的总量、cached input、最大 session、大工具输出和高风险命令。`npm run check:codex-token-cost` 用于确认治理文档、AGENTS 规则、审计脚本和 package 入口没有丢失。详细规则见 `docs/development/codex-token-cost-control.md`。

默认轻量模式用于状态查询、下一步确认、简短方案和 token 排查；只有明确实现 / 修复 / 落地时进入标准模式，完整审查、上线前检查、长跑执行或安全 / 权限 / 生产 / 数据风险任务才进入重型模式。重型模式必须新会话开始并先运行 token report。

## 安全说明

不要提交任何真实密钥、Token、数据库连接串、MinIO 凭据、DeepSeek API Key 或客户隐私数据。
