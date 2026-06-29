# STATUS

## 项目目标

初始化「AI 智能下单与生产协同平台」仓库，使后续开发可以按 PRD/TRD/API/生产流程继续推进，而不是只依赖聊天记录。

## 当前状态

- 仓库是本地 Git 仓库，当前分支 `feature/project-skeleton`，跟踪远程 `origin/feature/project-skeleton`。
- Active goal: `goals/GOAL-001-scope-clarified-for.md`
- Active task: `tasks/README.md` 的「任务 4：文件上传与访问权限」，状态为 `completed-with-file-access-smoke`
- 已按 RepoFrame + Yuri 工作流创建项目上下文文档。
- 已完成任务 0：接口契约与项目基线。
- 已完成任务 0.1：按 TRD V1.1 深度研究优化版对齐开发计划。
- 已完成任务 1 前置预检：确认本机 Node/npm/pnpm/Docker CLI/Colima 可用，Docker daemon 当前未运行，Java Runtime/Maven/Gradle 不可用，并整理任务 1 三条执行路线。
- 已按路线 A 初始化前后端工程骨架；当前仅包含框架启动壳、模块边界占位和 ADMIN 登录烟测，不包含订单、工序、文件、AI、绩效等业务实现。
- 本机 JDK 21、Maven、Node/npm/pnpm、Docker CLI/Colima 可用；Docker daemon 已通过 Colima 启动。

## 已完成

- 明确项目技术方向：Vue3 + Element Plus + Spring Boot + RuoYi-Vue-Pro + MySQL + Redis + MinIO + Uppy + 后端 ai-gateway + DeepSeek。
- 明确一期口径：9 条预定义工序链写入数据库，不做后台拖拽编辑器。
- 从 `.local-context/API规范_OpenAPI3.0.yaml` 修复并冻结稳定 OpenAPI 契约到 `docs/api/openapi.yaml`。
- 已修复 `duration_efficiency` 和 `standard_duration` 缺少冒号后空格导致的 YAML/OpenAPI 解析问题。
- 已合并重复 `/form-configs` path，保留 GET 和 POST。
- 已验证接口契约可被 Swagger/OpenAPI 工具解析，且 56 个 operation 覆盖既定模块。
- 已读取新版 TRD V1.1，确认其作为当前开发计划修订依据。
- 已将文件上传、AI 适配层、轻量 DAG、通知事实来源、专项测试矩阵等默认执行口径写入项目计划。
- 已新增 `docs/development/task-1-preflight.md`，记录任务 1 的本机环境预检、路线选择和验收边界。
- 已新增 `docs/development/task-1-execution-checklist.md`，记录任务 1 推荐基线、三条路线的开始检查、验收命令和禁止事项。
- 已新增 `tasks/TASK-002-project-skeleton-initialization.md`，把任务 1 拆成可执行任务文件，并加入 RepoFrame machine acceptance。
- 已执行任务 1 路线 A：安装 Homebrew `openjdk@21` 与 `maven`，并通过 `scripts/with-jdk21.sh` 固定项目命令使用 JDK 21。
- 已新增后端 Maven 多模块骨架：`backend/`，包含 `platform-server` 和 TRD V1.1 规划的 13 个模块边界。
- 已新增前端 Vue3 + Element Plus 骨架：`frontend/`。
- 已新增 `compose.yaml`、`.env.example`、根目录 `package.json`、`pnpm-workspace.yaml` 和工具脚本。
- 已启动 Colima，并通过 Docker Compose 拉起 MySQL、Redis、MinIO，三者均 healthy。
- 已完成任务 2：后端接入 MySQL + Flyway SQL，新增 TRD V1.1 核心表迁移和 9 条工序链种子数据。
- 已实现最小只读 Workflow API：`GET /workflow-chains`、`GET /workflow-chains/{chainId}/nodes`。
- 已按 `.local-context/生产流程.docx` 初始化 9 条工艺链，支持取模分支、贴面路线分支、种植基台分支和可选节点表达。
- 已完成任务 3：新增订单内部/外部状态枚举、`OrderStatusService`、`OrderStatusProjector`、医生端 `DoctorOrderVO`、内部端 `OrderInternalDTO`、AI-3 `DoctorOrderAssistantReadModel`。
- 已新增 Flyway `V3__order_status_projection_foundation.sql`，补齐订单状态投影基础字段、索引和外部状态默认值。
- 已实现最小订单详情、医生确认收货、医生端 AI-3 查询和医生访问工序实例 403 的烟测接口。
- 已用自动化测试和 HTTP smoke 验证医生端不返回 `internal_status`、`production_note`、`cs_user_id`、工序/员工/返工/工时等内部字段。
- 已完成任务 4：接入 MinIO Java SDK，新增文件上传 token、complete、预览/下载签名 URL 和医生端文件访问策略。
- 已新增 Flyway `V4__file_upload_access_foundation.sql`，为 `file_resource` 增加 `upload_status` 和查询索引。
- 已实现医生端文件访问边界：医生只能访问本人/本诊所且 `visibility` 为 `DOCTOR`、`DOCTOR_CS`、`ALL` 的已完成文件。
- 已验证上传 token、complete、preview、download 和拒绝访问均写入 `file_access_audit`。

## 正在做什么

项目处于 M1/M2 交界准备阶段：接口契约已冻结，TRD V1.1 的技术口径已落入开发计划，任务 1 项目骨架、任务 2 数据库基线、任务 3 状态投影与医生端脱敏、任务 4 文件上传与访问权限均已完成烟测。下一步可进入任务 5A：Workflow Runtime 与工序节点状态机。

## 未完成事项

- 对齐 OpenAPI 与 TRD V1.1 的二次契约细化：operationId、统一 4xx、关键 DTO/schema、上传 complete、AI-3 安全读模型等。
- 明确 Multipart 阈值、动态表单字段最终清单、AI-5 模板等客户/PM 仍需确认项。
- 后续实现订单生产审核后的工序实例化、派工、工时、入检/出检、返工；任务 2 只完成表结构、种子数据和只读链查询。
- 后续把 Redis 接入通知/会话等业务模块；MinIO 已在任务 4 接入文件模块的最小链路。
- 后续接入正式 RuoYi-Vue-Pro 权限体系；任务 3 的 `X-Bootstrap-*` 头仅用于本地烟测角色/数据范围，不是生产鉴权。
- 后续把 AI-3 从 deterministic 安全占位回答接入正式 ai-gateway/DeepSeek，但必须继续只读 `DoctorOrderAssistantReadModel`。
- 后续补前端 Uppy 页面与完整 Multipart 分片流程；任务 4 仅实现单对象预签名 PUT，并预留阈值配置。

## 已知问题 / 阻塞

- 本机已安装 Homebrew `openjdk@21` 和 `maven`；同时 Homebrew 也安装了 `openjdk` 26 作为 Maven 依赖。项目命令通过 `scripts/with-jdk21.sh` 显式使用 JDK 21。
- 浏览器点击级验收未自动化执行；已完成前端构建、首页 HTTP 加载、后端 API、Vite `/api` 代理登录烟测。
- Docker Compose 基础服务使用占位密码，仅用于本地开发；真实凭据不得提交。
- Flyway 启动时提示 MySQL 8.4 新于当前 Flyway 已测试版本，属于兼容性 warning；本轮迁移与测试已在本机 MySQL 8.4 通过。
- `standard_duration` 暂无客户真实标准工时，本轮迁移允许为空，不伪造工时。
- `.local-context/生产流程.docx` 中存在孤立重复箭头和贴面/隐形流程排版不连续；本轮已按源文档节点顺序标准化为顺序边，并保留分支字段表达。
- 当前医生端/内部端订单详情接口是任务 3 最小验收实现，尚未覆盖订单列表、创建、客服审核、生产审核、设计稿、账单物流完整业务。
- `GET /orders/{orderId}/process-instance` 仅实现医生端 403 防护；内部角色暂返回 501，完整工序实例接口留到 Workflow Runtime。
- Multipart 阈值、文件大小/类型/数量限制仍需 PM/客户最终确认；当前本地默认最大文件 200MB，预签名上传/预览 15 分钟，下载 2 小时。
- `docs/api/openapi.yaml` 仍未同步任务 4 的 complete 和签名 URL 细节；后续接口二次评审时统一更新。
- 动态表单字段最终清单、设计稿阻塞关系、AI-5 模板、标准工时和预计发货算法仍需 PM/客户确认。
- 进行中订单是否允许 ADMIN 调整节点仍需确认；默认不允许增删节点，只允许员工绑定/转派。
- `docs/api/openapi.yaml` 可被 Swagger/OpenAPI 工具解析，但 Redocly 仍有 lint warning：缺少 `operationId`、4xx 响应和 license 字段。该问题不阻塞任务 0，但后续生成 SDK 或正式接口评审前应细化。

## 重要文件

- `AGENTS.md`：Codex 接手规则。
- `AGENT.md`：RepoFrame 细则入口。
- `PROJECT.md`：产品目标、范围、边界和验收红线。
- `DECISIONS.md`：已确认决策。
- `tasks/README.md`：Yuri 风格任务拆解和下一步。
- `tasks/TASK-001-clarify-source-bundle-and-recover-missing-scope.md`：RepoFrame 初始澄清任务，已被 `tasks/README.md` 的 V1.1 计划取代。
- `tasks/TASK-002-project-skeleton-initialization.md`：任务 1 的详细执行任务，等待路线确认。
- `.repo-init/README.md` / `.repo-init/init-report.md`：初始化依据和证据。
- `docs/api/openapi.yaml`：已修复并冻结的稳定 OpenAPI 契约。
- `docs/source/README.md`：源文档路径和作用。
- `docs/development/task-1-preflight.md`：任务 1 前置预检与路线选择。
- `docs/development/task-1-execution-checklist.md`：任务 1 开工清单和验收边界。
- `backend/`：Spring Boot / Maven 多模块后端骨架。
- `backend/platform-server/src/main/resources/db/migration/`：Flyway 迁移，包含核心表和 9 条工艺链种子数据。
- `backend/platform-server/src/main/java/com/yuri/aiorder/workflow/definition/`：最小只读 Workflow API。
- `backend/platform-server/src/main/java/com/yuri/aiorder/order/status/`：任务 3 状态枚举、状态服务和投影服务。
- `backend/platform-server/src/main/java/com/yuri/aiorder/order/api/`：任务 3 医生端脱敏 VO、内部 DTO、AI-3 安全读模型和最小订单接口。
- `backend/platform-server/src/test/java/com/yuri/aiorder/order/OrderStatusProjectionTests.java`：任务 3 状态投影与脱敏边界测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/file/api/`：任务 4 MinIO 配置、文件服务、上传/签名接口和访问策略。
- `backend/platform-server/src/test/java/com/yuri/aiorder/file/FileAccessTests.java`：任务 4 文件上传、签名 URL、审计和医生端拒绝访问测试。
- `frontend/`：Vue3 + Element Plus 前端骨架。
- `compose.yaml`：MySQL、Redis、MinIO 本地基础服务。
- `.env.example`：本地环境变量模板。

## 下一步

建议下一轮进入 `tasks/README.md` 的「任务 5A：Workflow Runtime 与工序节点状态机」。开始前应基于任务 2 的链定义和任务 3 的状态投影，设计订单生产审核后的实例化、节点 READY/IN_PROGRESS/COMPLETED/SKIPPED 状态、DAG 激活和并联汇合规则。
