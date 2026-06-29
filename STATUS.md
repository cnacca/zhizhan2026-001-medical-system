# STATUS

## 项目目标

初始化「AI 智能下单与生产协同平台」仓库，使后续开发可以按 PRD/TRD/API/生产流程继续推进，而不是只依赖聊天记录。

## 当前状态

- 仓库是本地 Git 仓库，当前分支 `main`，跟踪远程 `origin/main`。
- Active goal: `goals/GOAL-001-scope-clarified-for.md`
- Active task: `tasks/TASK-002-project-skeleton-initialization.md`，状态为 `completed-with-http-smoke`
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

## 正在做什么

项目处于 M1/M2 交界准备阶段：接口契约已冻结，TRD V1.1 的技术口径已落入开发计划，任务 1 项目骨架已按路线 A 初始化并完成 HTTP/API 烟测。下一步进入任务 2：数据库模型与 9 条工序链初始化。

## 未完成事项

- 产出数据库迁移方案和 TRD V1.1 核心业务表的建表脚本。
- 整理 9 条工序链的 chain/node/edge 初始化数据。
- 对齐 OpenAPI 与 TRD V1.1 的二次契约细化：operationId、统一 4xx、关键 DTO/schema、上传 complete、AI-3 安全读模型等。
- 明确 Multipart 阈值、动态表单字段最终清单、AI-5 模板等客户/PM 仍需确认项。
- 后续接入正式 RuoYi-Vue-Pro 权限体系；当前 ADMIN 登录只是骨架烟测，不是正式鉴权实现。
- 后续把后端连接到 MySQL/Redis/MinIO；当前基础服务已启动，但后端骨架暂未连接数据库。

## 已知问题 / 阻塞

- 本机已安装 Homebrew `openjdk@21` 和 `maven`；同时 Homebrew 也安装了 `openjdk` 26 作为 Maven 依赖。项目命令通过 `scripts/with-jdk21.sh` 显式使用 JDK 21。
- 浏览器点击级验收未自动化执行；已完成前端构建、首页 HTTP 加载、后端 API、Vite `/api` 代理登录烟测。
- Docker Compose 基础服务使用占位密码，仅用于本地开发；真实凭据不得提交。
- Multipart 阈值、文件大小/类型/数量限制仍需确认。
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
- `frontend/`：Vue3 + Element Plus 前端骨架。
- `compose.yaml`：MySQL、Redis、MinIO 本地基础服务。
- `.env.example`：本地环境变量模板。

## 下一步

进入 `tasks/README.md` 的「任务 2：数据库模型与 9 条工序链初始化」。开始写迁移前，应先设计核心表、索引、状态枚举、9 条 workflow chain/node/edge 种子数据，并继续保证不把医生端内部字段暴露给外部接口或 AI-3。
