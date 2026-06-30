# Task 8A Regression Record

更新日期：2026-07-01

## 本轮回归范围

Task 8A 只记录当前 readiness audit 的真实验证结果，不补业务功能。验证范围包括：

- 静态/机器检查：acceptance、toolchain、Compose 配置、OpenAPI、前端构建、后端测试、diff 空白检查。
- 后端 HTTP/SQL smoke：health、ADMIN login、workflow chains/nodes、医生端脱敏、AI-3 安全拒绝和审计。
- 既有专项测试证据：状态投影、文件权限、Workflow Runtime、入检/出检/返工/工时绩效、协同通知、AI Gateway。

## 自动化测试记录

| 命令 | 结果 | 记录 |
| --- | --- | --- |
| `npm run acceptance` | PASS | `acceptance.json valid`；已包含 Task 8A 验收矩阵、回归记录、上线清单文档存在与关键标题检查，以及 9C/9D 关键检查；9D.10 已纳入 Multipart pending 恢复候选检查。 |
| `npm run check:toolchain` | PASS | JDK 21.0.11、Maven 3.9.16、Node 24.16.0、npm 11.13.0、pnpm 11.7.0 可用；Docker context 可见。 |
| `npm run compose:config` | PASS | MySQL、Redis、MinIO Compose 配置可渲染；仍为本地占位凭据。 |
| `npm run check:openapi` | PASS | `openapi contract ok`，`paths=61`，`operations=72`，`operationIds=72`；Swagger validate 和 Redocly lint 通过。 |
| `npm run build:frontend` | PASS_WITH_WARNINGS | Vite build 成功；保留 VueUse PURE comment warning 与单个大 chunk warning，未阻断构建。 |
| `npm run check:task9d1` | PASS | 医生订单工作台、`loadDoctorOrders`、`loadDoctorOrderWorkspace`、医生 AI、确认收货和 Vite `/orders` `/ai` 代理关键检查通过。 |
| `npm run check:task9d2` | PASS | 医生新建订单面板、动态表单读取、提交订单、附件 `file_id` 输入和 Vite `/files` 代理关键检查通过。 |
| `npm run check:task9d3` | PASS | 客服初审入口、`internal_status` 待审过滤、`reviewInternalOrder` 和 `/orders/{orderId}/review` 关键检查通过。 |
| `npm run check:task9d4` | PASS | 生产审核入口、`PENDING_PRODUCTION_REVIEW` 待审过滤、`reviewProductionOrder`、`/workflow-chains` 和 `/orders/{orderId}/production-review` 关键检查通过。 |
| `npm run check:task9d5` | PASS | 工序实例、派工转派、我的任务、`/tasks` 和 `/process-instance` 代理关键检查通过。 |
| `npm run check:task9d6` | PASS | 入检出检、工时记录、`/check-records` 和 `/work-logs` 代理关键检查通过。 |
| `npm run check:task9d7` | PASS | 绩效统计页面、`PerformanceStatsResponse`、`loadPerformanceStats`、`/performance` 代理和 `/performance` OpenAPI schema 关键检查通过。 |
| `npm run check:task9d8` | PASS | 生产看板页面、跨状态生产检索、节点进度、V9 菜单迁移和复用 `/orders` / `/orders/{orderId}/process-instance` 契约关键检查通过。 |
| `npm run check:task9d10` | PASS | Multipart 上传、status 恢复、pending 恢复候选、100MB+ smoke 脚本、server-resume smoke 脚本、interrupted-resume smoke 脚本、OpenAPI 和 V11 迁移关键检查通过。 |
| `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test` | PASS_WITH_WARNINGS | `platform-server` 53 tests / 0 failures / 0 errors；Flyway 校验 11 个 migration；MySQL 8.4 新于当前 Flyway 已测试版本，保留 warning。 |
| `git diff --check` | PASS | 最终空白检查通过。 |

## HTTP/SQL Smoke 记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| 后端 health | PASS | 后端启动成功，Flyway schema version 8 up to date；`GET /api/bootstrap/health` 返回 `status=ok`。 |
| ADMIN login | PASS | `POST /api/auth/login` 使用数据库账号 `admin/change-me-admin` 返回服务端签发 Bearer token；本地账号仅用于开发 smoke。 |
| Workflow chains/nodes | PASS_WITH_NOTICE | `GET /workflow-chains` 当前本地返回 41 条，其中 9 条预定义链全部存在；总数大于 9 是历史 smoke/测试追加链未清理导致。`GET /workflow-chains/1/nodes` 返回常规冠修复 30 个节点。 |
| 医生端订单详情脱敏 | PASS | 本轮追加本地测试订单 `order_id=124`；医生读取本人订单只返回外部状态 `QC`，不含 `internal_status` 和 `production_note`；跨医生访问返回 403。 |
| AI-3 安全拒绝与审计 | PASS | 医生询问“谁在做/返工责任/工时绩效”返回“只能回答公开进度”并包含公开状态 `QC`；未泄露内部备注；`ai_audit_log` 写入 `SAFE_REFUSAL` 1 条。 |
| 任务 6 协同链路 | 已有证据 | `MessageDesignBillNotificationTests` 覆盖消息、设计稿、账单物流、通知事实和医生端脱敏。 |
| 任务 9D.1 医生订单工作台 | PASS | 真实后端 + Vite dev server 下，doctor 读取 smoke 订单 `9D1-SMOKE-1782811019788` 的列表、详情、消息、设计稿、账单、物流和 AI 回答；响应和页面均未泄露内部备注、`internal_status`、`production_note`。 |
| 任务 9D.3 客服初审 | PASS | HTTP smoke：doctor 创建订单 `ORD20260630-1E844940B0`，CS 通过 `internal_status=PENDING_CS_REVIEW` 查到 1 条并审核通过，状态变为 `PENDING_PRODUCTION_REVIEW/PENDING_REVIEW`。浏览器 smoke：CS 登录 Vite，进入「内部订单」/「客服初审」，点击 `ORD20260630-99C60FD3DF` 的「通过初审」后该单从待审列表消失；SQL 确认为 `PENDING_PRODUCTION_REVIEW/PENDING_REVIEW`。 |
| 任务 9D.4 生产审核 | PASS | TDD 红灯确认 `PENDING_CS_REVIEW` 可直接生产审核的缺口；修复后 `WorkflowRuntimeTests` 覆盖仅 `PENDING_PRODUCTION_REVIEW` 可生产审核。浏览器 smoke：CS 登录 Vite，进入「生产审核」，选择待审订单、工序链和路线，点击「通过生产审核」后订单进入 `PROCESS_INSTANCE_CREATED/PRODUCING` 且生成 `order_process_instance`。 |
| 任务 9D.5 生产任务入口 | PASS | TDD 红灯：`node scripts/check-task-9d5-frontend.mjs` 首次失败于缺工序实例/派工/我的任务入口和 `/tasks`、`/process-instance` 代理。浏览器 smoke：API 准备订单 `ORD20260630-0F7516BF76` 并实例化为 `330`；CS 进入「派工转派」给 worker `9601` 绑定节点；worker 进入「我的任务」看到该订单 READY 任务；API 复核 `tasks/mine?status=READY` 返回 `task_node=714`。 |
| 任务 9D.6 入检/出检与工时操作 | PASS | TDD 红灯：`npm run check:task9d6` 首次失败于缺 `/checks`、`/worklogs/self`、`CheckRecordResponse`、`WorkLogResponse`、`/check-records` 和 `/work-logs` 代理。浏览器 smoke：API 准备订单 `ORD20260630-66BFFF5129` 并派工节点 `792` 给 worker `9601`；worker 登录 `http://localhost:5173`，进入「入检出检」提交入检通过；进入「我的任务」开始任务；进入「工时记录」完成 start/pause/resume/finish；API 完工节点后，页面切到 `COMPLETED / 出检` 并提交出检通过；后端复核节点 `792` 有 `IN/PASS` 和 `OUT/PASS` 两条检查记录，work log `#59` 为 `COMPLETED`。 |
| 任务 9D.7 绩效管理页面 | PASS | TDD 红灯：`npm run check:task9d7` 首次失败于缺绩效页面入口、`PerformanceStatsResponse`、`loadPerformanceStats`、`/performance` 代理和相关 UI 文案。浏览器 smoke：worker 登录 `http://localhost:5173` 进入「绩效统计」后默认展示员工 `9601` 的完成工序、有效工时、返工次数、准时率、通过率和工时效率；admin 登录后进入「绩效统计」，指定 `user_id=9601` 查询并看到同一组绩效卡片。 |
| 任务 9D.8 生产看板 | PASS | TDD 红灯：`npm run check:task9d8` 首次失败于缺生产看板页面入口、`productionBoardOrders`、`productionBoardStatus`、`loadProductionBoardOrders`、`isProductionBoardRoute`、`/production/board` 和 V9 菜单迁移。浏览器 smoke：admin 登录 `http://localhost:5173` 后看到「生产看板」菜单，进入后显示生产订单列表、跨状态生产检索输入、READY/IN_PROGRESS/COMPLETED 节点统计和「节点进度」。 |

## 已知测试覆盖

| 测试类 | 覆盖重点 |
| --- | --- |
| `OrderStatusProjectionTests` | 状态投影、医生端脱敏、医生跨订单拒绝、AI-3 安全读模型基础；9D.1 覆盖医生订单列表脱敏；9D.2 覆盖动态表单读取、医生提交订单、状态历史和文件绑定越权拒绝；9D.3 覆盖客服待审列表过滤、通过/驳回、错误状态和医生端脱敏。 |
| `FileAccessTests` | MinIO 上传 token、complete、签名 URL、跨诊所/内部文件拒绝、文件审计；9D.10 覆盖 Multipart initiate/part-url/status/pending/complete/abort、恢复候选隔离和不暴露 `object_key`。 |
| `WorkflowRuntimeTests` | 工序实例化、生产审核状态门禁、DAG 激活、并联汇合、可选节点跳过、派工/任务池、医生端拒绝。 |
| `CheckWorklogPerformanceTests` | 入检门禁、出检时序、返工、工时暂停扣除、绩效数据范围。 |
| `MessageDesignBillNotificationTests` | 消息审核、设计稿审核/医生确认、账单物流、通知事实和医生端脱敏。 |
| `AiGatewayTests` | 5 个 AI 端点、AI-3 安全拒绝、AI-4 缺失项检查、AI 审计。 |
| `BearerIdentityTests` | Bearer 身份、医生端脱敏、跨医生拒绝、禁用 bootstrap header 后 401、数据库账号登录和 `/api/auth/me` claims。 |
| `PermissionInterceptorTests` | 权限注解/统一拦截器、统一身份参数解析和 DataScope 增量，覆盖数据库医生、工人、客服账号的端点权限边界，以及 WORKER SELF 对未分配/已分配订单、工序实例、消息和文件预览的查询范围。 |
| `AuthStartupValidatorTests` | 生产 profile 鉴权门禁：禁止生产启用 bootstrap header，禁止生产使用本地 token secret，占位兼容只允许本地 smoke。 |
| `NotificationWebSocketTests` | WebSocket 通知：Bearer token 握手、在线推送账单通知、payload 不泄露内部备注、送达时间落库。 |
| `NotificationRestTests` | 通知 REST：当前用户只读本人通知、未读数、单条已读、全部已读、他人通知隔离。 |
| `NotificationBroadcastTests` | 通知广播：本地无 session 仍发布广播、远端广播不自回环且触发本机投递。 |

## Task 8B OpenAPI 二次契约记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| 当前后端基线路径同步 | PASS | `docs/api/openapi.yaml` 当前为 61 个 path / 72 个 operation，补齐 `POST /files/{fileId}/complete`、工序节点 `start` / `complete` / `skip`、`GET /auth/me`、4 个通知 REST 接口、`/reworks`、Multipart status 和 pending 恢复候选接口。 |
| operationId 唯一性 | PASS | `scripts/check-openapi-contract.rb` 验证 72 个 operation 均有唯一 `operationId`。 |
| 统一错误响应 | PASS | 所有 operation 均包含 `400 / 401 / 403 / 404 / 409 / 503 / default` 错误响应引用。 |
| Swagger 校验 | PASS | `npx --yes @apidevtools/swagger-cli validate docs/api/openapi.yaml` 通过。 |
| Redocly lint | PASS | `npx --yes @redocly/cli lint docs/api/openapi.yaml` 通过，Redocly warning 清零。 |

## Task 9A Bearer 身份基线记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| Bearer 医生身份脱敏 | PASS | `BearerIdentityTests` 使用服务端签发的 DOCTOR Bearer token 访问本人订单，响应不含 `internal_status`、`production_note`。 |
| Bearer 医生数据范围 | PASS | `BearerIdentityTests` 使用其他医生 Bearer token 访问订单返回 403。 |
| 禁用本地 header 兼容 | PASS | `BearerIdentityTests` 关闭 bootstrap header 后，只有 `X-Bootstrap-*` 且无 Bearer token 的请求返回 401。 |
| Auth HTTP smoke | PASS | 真实后端启动后，`POST /api/auth/login` 返回非静态 Bearer token，`GET /api/auth/me` 可解析为 `ADMIN`，无效 token 返回 401。 |
| 后端全量回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml test` 通过，16 个模块成功，`platform-server` 26 tests / 0 failures / 0 errors。 |

## Task 9B.1 权限/DataScope 守卫记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| 集中权限守卫 | PASS | 新增 `AccessControlService`，订单、文件、AI、Workflow Runtime、Check/WorkLog/Performance 的高风险角色与数据范围判断已迁入统一守卫。 |
| 派工/转派身份校验 | PASS | `WorkflowRuntimeTests` 覆盖 WORKER Bearer token 调用派工接口返回 403；派工/转派接口已读取当前身份，仅 CS/ADMIN 可执行。 |
| 可选节点跳过权限 | PASS | `WorkflowRuntimeTests` 覆盖 WORKER Bearer token 跳过可选节点返回 403；跳过节点仅 CS/ADMIN 可执行。 |
| 医生检查记录拒绝 | PASS | `CheckWorklogPerformanceTests` 覆盖 DOCTOR Bearer token 读取 `/check-records/{nodeInstanceId}` 返回 403。 |
| 绩效数据范围 | PASS | `CheckWorklogPerformanceTests` 覆盖 WORKER 只能返回本人绩效、ADMIN 可查指定员工、CS Bearer token 查询绩效返回 403。 |
| 权限专项回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests,WorkflowRuntimeTests,CheckWorklogPerformanceTests test` 通过，10 tests / 0 failures / 0 errors。 |

## Task 9B.2 数据库化 RBAC/DataScope 基础记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| Flyway auth migration | PASS | `V6__auth_rbac_datascope_foundation.sql` 与 `V7__auth_menu_dept_post_foundation.sql` 已在本地 MySQL 应用；Flyway 当前校验 7 个 migration。 |
| 数据库登录 | PASS | `BearerIdentityTests` 覆盖 `admin/change-me-admin` 登录返回 `userId=8001`、`roles=ADMIN`、`permissions` 含 `workflow:assign`、`dataScope=ALL`。 |
| `/api/auth/me` claims | PASS | `BearerIdentityTests` 和 HTTP smoke 覆盖 `/api/auth/me` 可从 Bearer token 返回 `admin/ADMIN/ALL` 与权限码。 |
| 医生数据库账号范围 | PASS | `BearerIdentityTests` 覆盖 `doctor/change-me-doctor` 登录后访问本人订单，响应不含内部字段。 |
| 错误密码 | PASS | `BearerIdentityTests` 和 HTTP smoke 覆盖错误密码返回 401。 |
| HTTP auth smoke | PASS | 真实后端启动后，`POST /api/auth/login` 返回数据库账号 Bearer token，`GET /api/auth/me` 返回 `admin/ADMIN/ALL`，错误密码返回 401。 |

## Task 9B.3 权限注解与统一拦截器记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| Controller 权限注解 | PASS | 新增 `@RequirePermission`，订单、文件、AI、Workflow Runtime、Check/WorkLog/Performance、消息、设计稿、账单物流等 Controller 已声明权限码和本地兼容角色。 |
| 统一拦截器 | PASS | 新增 `PermissionInterceptor` 和 `PermissionWebConfiguration`；Bearer 数据库身份优先按权限码校验，`X-Bootstrap-*` 仅作为本地 smoke 角色 fallback。 |
| 医生账号权限边界 | PASS | `PermissionInterceptorTests` 覆盖 `doctor/change-me-doctor` 可读本人脱敏订单，调用 `/ai/cs-query` 返回 403。 |
| 工人账号权限边界 | PASS | `PermissionInterceptorTests` 覆盖 `worker/change-me-worker` 调用派工接口返回 403，查询他人绩效时服务端强制返回本人 `user_id=9601`。 |
| 客服账号权限边界 | PASS | `PermissionInterceptorTests` 覆盖 `cs/change-me-cs` 调用 `/performance` 返回 403。 |
| 权限专项回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests,PermissionInterceptorTests,WorkflowRuntimeTests,CheckWorklogPerformanceTests,AiGatewayTests test` 通过，19 tests / 0 failures / 0 errors。 |
| 全量回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml test` 通过，16 个模块成功，`platform-server` 29 tests / 0 failures / 0 errors。 |

## Task 9B.4 统一身份参数与 DataScope SQL 第一增量记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| 业务 Controller 身份收口 | PASS | 新增 `BootstrapIdentityArgumentResolver`；订单、文件、AI、Workflow Runtime、Check/WorkLog/Performance、消息、设计稿、账单物流 Controller 不再直接声明 `X-Bootstrap-*` 参数。 |
| 订单读取 SQL DataScope | PASS | `OrderProjectionQueryService` 对订单详情、内部订单详情和 AI-3 安全读模型执行 SQL DataScope 过滤：`ALL / CLINIC / SELF`。 |
| 工序实例 SQL DataScope | PASS | `WorkflowRuntimeService#getProcessInstance` 执行 SQL DataScope 过滤；WORKER SELF 必须存在已分配节点。 |
| WORKER SELF 回归 | PASS | `PermissionInterceptorTests` 覆盖数据库工人未分配节点时读取订单和工序实例返回 403，分配节点后读取成功。 |
| 权限专项回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=PermissionInterceptorTests,BearerIdentityTests,WorkflowRuntimeTests,CheckWorklogPerformanceTests,AiGatewayTests test` 通过，20 tests / 0 failures / 0 errors。 |

## Task 9B.5 文件、协同与 AI DataScope 扩展记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| 文件 SQL DataScope | PASS | `FileResourceService` 对上传 token 订单读取、文件 complete、预览、下载执行 SQL DataScope；医生只允许医生可见文件，WORKER SELF 只允许本人文件或已分配订单文件。 |
| 协同订单 SQL DataScope | PASS | `CollaborationService` 对消息、设计稿、账单物流的订单级操作先执行订单 DataScope，再保留医生可见性、消息审核状态等业务过滤。 |
| AI 内部上下文 SQL DataScope | PASS | `AiGatewayService` 的 AI-1/AI-2/AI-4/AI-5 内部订单上下文读取加入订单 DataScope；AI-3 继续只读 `DoctorOrderAssistantReadModel`。 |
| WORKER SELF 文件/消息回归 | PASS | `PermissionInterceptorTests` 覆盖数据库工人未分配节点时读取消息和文件预览返回 403，分配节点后读取成功。 |
| 旧协同/AI 业务路径 | PASS | `MessageDesignBillNotificationTests` 与 `AiGatewayTests` 已补 WORKER 已分配节点前提，生产消息、设计稿上传、AI-5 生产备注路径继续通过。 |
| 权限专项回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=PermissionInterceptorTests,AiGatewayTests,MessageDesignBillNotificationTests,FileAccessTests test` 通过，12 tests / 0 failures / 0 errors。 |

## Task 9B.6 菜单、部门、岗位与前端权限路由记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| RuoYi 风格基础表 | PASS | 新增 `V7__auth_menu_dept_post_foundation.sql`，建立 `system_dept`、`system_post`、`system_user_post`、`system_menu`、`system_role_menu`，并为本地账号补部门、岗位、菜单。 |
| 登录返回菜单 | PASS | `BearerIdentityTests` 覆盖 ADMIN 登录返回 `system-rbac`、`internal-orders` 菜单；DOCTOR 登录返回 `doctor-orders`、`ai-doctor`，且不返回 `internal-orders`。 |
| `/api/auth/me` 返回菜单 | PASS | `BearerIdentityTests` 覆盖 Bearer token 访问 `/api/auth/me` 返回当前用户菜单。 |
| 前端菜单权限 | PASS | `frontend/src/App.vue` 按后端 `menus` 渲染入口；医生账号页面显示医生订单/医生 AI，不显示内部订单/系统权限。 |
| 浏览器 smoke | PASS | Playwright 使用本机 Chrome 打开 `http://localhost:5173`，医生账号登录后验证 DOM 菜单权限边界，并生成截图。 |
| 权限专项回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests,PermissionInterceptorTests test` 通过，10 tests / 0 failures / 0 errors。 |

## Task 9B.7 生产鉴权门禁记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| prod profile 关闭本地 header | PASS | 新增 `application-prod.yml`，`app.auth.allow-bootstrap-headers=false`，生产 profile 默认不接受 `X-Bootstrap-*`。 |
| 生产 token secret 门禁 | PASS | `AuthStartupValidator` 在 prod profile 下拒绝空 token secret 和 `local-dev-change-me-auth-secret` 本地占位值。 |
| 启动 fail-fast 回归 | PASS | `AuthStartupValidatorTests` 覆盖 prod profile 启用 bootstrap header、使用本地 token secret 均抛出 `IllegalStateException`。 |
| 本地兼容不破坏 | PASS | `BearerIdentityTests` 与 `PermissionInterceptorTests` 继续通过；本地 smoke 仍可通过默认配置使用 `X-Bootstrap-*`。 |
| 权限专项回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AuthStartupValidatorTests,BearerIdentityTests,PermissionInterceptorTests test` 通过，13 tests / 0 failures / 0 errors。 |

## Task 9C.1 WebSocket 通知记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| WebSocket 依赖 | PASS | 新增 `spring-boot-starter-websocket`，后端注册 `/ws/connect`。 |
| 握手鉴权 | PASS | `NotificationWebSocketAuthInterceptor` 使用 Bearer token 校验连接，token 无效或缺少 `user_id` 时拒绝连接。 |
| 在线推送 | PASS | `NotificationPushService` 在 `user_notification` 写入后对在线用户推送 `notification_event.payload`。 |
| 送达落库 | PASS | 在线推送成功后写 `user_notification.delivered_at`，并把 `notification_event.delivery_status` 标为 `DELIVERED`。 |
| WebSocket 回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=NotificationWebSocketTests,MessageDesignBillNotificationTests test` 通过，4 tests / 0 failures / 0 errors。 |

## Task 9C.2 通知未读/已读记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| 通知 REST 接口 | PASS | 新增 `GET /notifications`、`GET /notifications/unread-count`、`POST /notifications/{notificationId}/read`、`POST /notifications/read-all`，均使用 Bearer 当前用户身份。 |
| 当前用户隔离 | PASS | `NotificationRestTests` 覆盖当前用户只能列出和标记自己的 `user_notification`，响应不包含他人通知。 |
| 已读状态 | PASS | `NotificationRestTests` 覆盖单条已读写入 `read_at`，全部已读返回 `updated_count`，`unread_only=true` 已读后为空。 |
| 前端通知中心入口 | PASS | `frontend/src/App.vue` 登录后增加「通知中心」入口，支持未读徽标、刷新、单条已读和全部已读；`npm run build:frontend` 通过。 |
| Vite 代理 smoke | PASS | 真实后端 + Vite dev server 下，通过 `http://localhost:5173/api/auth/login` 登录 doctor，再经 `http://localhost:5173/notifications` 路径读取 smoke 通知、查询未读数、标记单条已读和全部已读，均通过。 |
| OpenAPI 同步 | PASS | `docs/api/openapi.yaml` 已补 4 个通知 REST operation；`npm run check:openapi` 通过，54 paths / 65 operations / 65 operationIds。 |
| 通知专项回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=NotificationRestTests,NotificationWebSocketTests test` 通过，3 tests / 0 failures / 0 errors。 |

## Task 9C.3 通知实时前端与 Redis 广播记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| TDD 红灯 | PASS | `NotificationBroadcastTests` 首次运行失败于缺少 `NotificationBroadcaster`、`NotificationBroadcastMessage`、`NotificationRedisBroadcastListener` 和 `pushLocalToUser`。 |
| Redis 广播代码路径 | PASS | 新增 `NotificationRedisBroadcaster` / `NotificationRedisBroadcastListener` / `NotificationRedisBroadcastConfiguration`，通过 `NOTIFICATION_REDIS_BROADCAST_ENABLED=true` 条件启用，默认本地关闭。 |
| 跨实例投递边界 | PASS | `NotificationBroadcastTests` 覆盖本机无在线 session 时仍发布广播，远端广播忽略自身 origin 后触发本机 `pushLocalToUser`。 |
| 前端实时接入 | PASS | `frontend/src/App.vue` 登录后建立 `/ws/connect` WebSocket，收到推送后刷新通知列表和未读数，并显示连接状态和最新实时通知。 |
| Vite WebSocket 代理 | PASS | `frontend/vite.config.ts` 新增 `/ws` proxy 且 `ws: true`。 |
| Vite WebSocket 代理 smoke | PASS | 真实后端 + Vite dev server 下，doctor 经 `ws://localhost:5173/ws/connect` 建立连接，admin 上传账单后收到 `{"event":"BILL_UPLOADED","orderId":606,"orderNo":"WS-SMOKE-1782809858059","message":"账单已上传"}`。 |
| 通知专项回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=NotificationBroadcastTests,NotificationWebSocketTests,NotificationRestTests test` 通过，5 tests / 0 failures / 0 errors。 |
| 前端构建 | PASS_WITH_WARNINGS | `npm run build:frontend` 通过；保留既有 VueUse PURE comment 与大 chunk warning。 |

## Task 9D.1 医生订单工作台记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| TDD 红灯 | PASS | `OrderStatusProjectionTests#doctorOrderListUsesDataScopeAndDesensitizedProjection` 首次运行失败于 `GET /orders` 404。 |
| 订单列表后端 | PASS | 新增 `GET /orders`，支持 `page`、`size`、`keyword`、`external_status`；医生列表强制限定本人订单并返回脱敏 `DoctorOrderVO`。 |
| 前端工作台 | PASS | `frontend/src/App.vue` 新增医生订单工作台，覆盖订单列表/详情、消息、设计稿、账单物流、医生 AI、确认收货入口。 |
| Vite 代理 | PASS | `frontend/vite.config.ts` 新增 `/orders` 和 `/ai` 代理。 |
| OpenAPI schema | PASS | `docs/api/openapi.yaml` 补 `OrderListResponse` / `DoctorOrderSummary`，当前仍为 54 paths / 65 operations / 65 operationIds。 |
| 前端机器检查 | PASS | `npm run check:task9d1` 通过。 |
| 后端专项回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests,PermissionInterceptorTests,AiGatewayTests,MessageDesignBillNotificationTests test` 通过，15 tests / 0 failures / 0 errors。 |
| API smoke | PASS | doctor 经 Vite `/api/auth/login` 登录后，通过 `/orders`、订单详情、消息、设计稿、账单、物流、`/ai/order-query` 读取 smoke 订单 `9D1-SMOKE-1782811019788`，未泄露内部备注和内部字段。 |
| 浏览器 smoke | PASS | 本机 Chrome 打开 `http://localhost:5173`，doctor 登录后进入「医生订单」，搜索 `9D1-SMOKE-1782811019788`，页面显示医生订单工作台、公开消息、账单物流，未出现内部字段。 |

## Task 9D.2 医生下单第一增量记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| TDD 红灯 | PASS | 新增测试首次运行失败于 `GET /form-configs` 404 和 `POST /orders` 405。 |
| 动态表单后端 | PASS | 新增 `GET /form-configs`，按 `product_type` 返回 `form_field_config` 中 ACTIVE 字段；`V8__doctor_order_entry_form_seed.sql` 提供 `REGULAR_CROWN` 第一增量默认字段。 |
| 医生提交订单 | PASS | 新增 `POST /orders`，仅允许医生创建本人订单；提交后通过 `OrderStatusService` 进入 `PENDING_CS_REVIEW` / `PENDING_REVIEW`，并写 `order_status_history`。 |
| 文件绑定边界 | PASS | `OrderStatusProjectionTests` 覆盖本人已完成医生可见文件可绑定；他人文件、未完成文件、内部文件分别返回拒绝。 |
| 前端新建订单 | PASS | `frontend/src/App.vue` 在医生订单工作台新增「新建订单」面板，读取动态表单、提交订单，并支持已完成 `file_id` 绑定输入。 |
| 本地 CORS 回归 | PASS | `BearerIdentityTests#databaseLoginAllowsLocalhostAndLoopbackViteOrigins` 覆盖 `http://localhost:5173` 与 `http://127.0.0.1:5173` Origin 登录请求；运行态 Vite `/api/auth/login` 带 `Origin: http://127.0.0.1:5173` 返回 200。 |
| Vite 动态表单代理 | PASS | `/form-configs` 已加入 Vite proxy，`scripts/check-task-9d2-frontend.mjs` 与 `acceptance.json` 已要求该代理；运行态 `/form-configs?product_type=REGULAR_CROWN` 经 Vite 返回 `application/json`。 |
| WebSocket loopback origin | PASS | `NotificationWebSocketTests#websocketAllowsLoopbackViteOrigin` 覆盖 `Origin: http://127.0.0.1:5173` 的 `/ws/connect` 握手可打开。 |
| OpenAPI schema | PASS | `docs/api/openapi.yaml` 补 `FormFieldConfig`、`CreateOrderRequest`、`CreateOrderResponse`，并写明 9D.2 暂不支持草稿。 |
| 前端机器检查 | PASS | `npm run check:task9d2` 通过。 |
| 后端专项回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests test` 通过，7 tests / 0 failures / 0 errors。 |
| 浏览器 smoke | PASS | doctor 在 `http://127.0.0.1:5173` 登录，进入「医生订单」，动态表单显示患者姓名、牙位、材料、色号、医生备注；填写必填项后创建订单 `ORD20260630-9D94797093`，页面显示 `PENDING_REVIEW`。 |
| 全量平台回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test` 通过，51 tests / 0 failures / 0 errors。 |
| 前端构建 | PASS_WITH_WARNINGS | `npm run build:frontend` 通过；保留既有 VueUse PURE comment 与大 chunk warning。 |

## Task 9D.3 客服初审第一增量记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| TDD 红灯 | PASS | 新增审核测试首次运行失败于 `/orders/{orderId}/review` 404；待审列表过滤测试收紧后失败于返回 2 条，确认 `internal_status` 过滤缺口存在。 |
| 客服初审后端 | PASS | 新增 `POST /orders/{orderId}/review`，CS/ADMIN 可通过或驳回 `PENDING_CS_REVIEW` 订单；通过进入 `PENDING_PRODUCTION_REVIEW`，驳回进入 `CS_REJECTED`，均保持医生端 `PENDING_REVIEW` 外部投影。 |
| 待审列表过滤 | PASS | `GET /orders?internal_status=PENDING_CS_REVIEW` 对内部角色生效；医生端仍不返回内部字段。 |
| 状态历史与通知事实 | PASS | 审核通过/驳回写 `order_status_history`，并写入医生 `notification_event` / `user_notification`。 |
| 前端客服初审 | PASS | `frontend/src/App.vue` 复用 `/orders/internal` 菜单新增「客服初审」列表、订单资料、生产备注、驳回原因和通过/驳回按钮。 |
| OpenAPI schema | PASS | `docs/api/openapi.yaml` 补 `OrderReviewRequest`、`internal_status` 列表过滤参数和 `/orders/{orderId}/review` 响应 schema。 |
| 前端机器检查 | PASS | `npm run check:task9d3` 通过。 |
| 后端专项回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests test` 通过，11 tests / 0 failures / 0 errors。 |
| HTTP/browser smoke | PASS | 真实后端 + Vite 下完成医生创建待审订单、CS 待审列表过滤、CS 页面点击通过初审和 SQL 状态确认。 |

## Task 9D.9 返工终检第一增量记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| TDD 红灯 | PASS | `npm run check:task9d9` 首次失败，确认缺前端返工终检入口、V10 菜单迁移、Vite `/reworks` 代理和 OpenAPI `/reworks` 契约。 |
| 后端红灯 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test` 首次失败于 `/reworks` 404。 |
| 返工列表后端 | PASS | 新增 `GET /reworks`，支持 `status` / `order_id` 过滤；WORKER 只读来源节点或目标节点分配给本人的返工记录，医生 Bearer token 访问返回 403。 |
| 前端返工终检入口 | PASS | `frontend/src/App.vue` 新增 `/rework-final` 页面，可查看待返工记录，并复用已完成任务和 `/check-records` 提交终检出检。 |
| 菜单与代理 | PASS | 新增 `V10__rework_final_menu_seed.sql`，为 ADMIN 和具备 `check:write` 的角色增加「返工终检」菜单；Vite 新增 `/reworks` 代理。 |
| OpenAPI 同步 | PASS | `docs/api/openapi.yaml` 新增 `/reworks` 和 `ReworkRecordResponse`；`npm run check:openapi` 通过，55 paths / 66 operations / 66 operationIds。 |
| 前端机器检查 | PASS | `npm run check:task9d9` 通过。 |
| 后端专项回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test` 通过，5 tests / 0 failures / 0 errors。 |
| 全量平台回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test` 通过，47 tests / 0 failures / 0 errors。 |
| 前端构建 | PASS_WITH_WARNINGS | `npm run build:frontend` 通过；保留既有 VueUse PURE comment 与大 chunk warning。 |
| 浏览器 smoke | PASS | 真实后端 + Vite 下 admin 登录后菜单出现「返工终检」，进入页面可见「待返工记录」和「终检入口」，浏览器 console 无 error。当前 smoke 数据下未选中已完成节点，因此未显示「提交终检出检」按钮；提交路径由后端测试和前端构建覆盖。 |

## Task 9D.10 Multipart 上传第一增量记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| 前端/契约红灯 | PASS | `npm run check:task9d10` 首次失败，确认缺前端 Multipart 入口、OpenAPI、V11 迁移和 `@uppy/core` 依赖。 |
| 后端红灯 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=FileAccessTests test` 首次失败于 `/files/multipart/initiate` 404。 |
| Multipart 后端 | PASS | 新增 `/files/multipart/initiate`、`/files/{fileId}/multipart/part-url`、`/files/{fileId}/multipart/complete`、`/files/{fileId}/multipart/abort`，并通过 V11 记录 Multipart 元数据。 |
| Multipart 权限 | PASS | `FileAccessTests` 覆盖医生可 initiate/part-url/complete/abort 自己的 Multipart 上传；同诊所其他医生 abort 返回 403。 |
| 前端上传入口 | PASS | `frontend/src/App.vue` 新增最小 Uppy 文件选择、分片上传、complete 后回填 `doctorOrderFileIds`，并展示上传进度和完成 `file_id`。 |
| OpenAPI 同步 | PASS | `docs/api/openapi.yaml` 新增 Multipart 请求/响应 schema 和文件接口；后续补 status/pending 恢复接口后，`npm run check:openapi` 通过，61 paths / 72 operations / 72 operationIds。 |
| 前端机器检查 | PASS | `npm run check:task9d10` 通过。 |
| 后端专项回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=FileAccessTests test` 通过，4 tests / 0 failures / 0 errors。 |
| 前端构建 | PASS_WITH_WARNINGS | `npm run build:frontend` 通过；保留既有 VueUse PURE comment 与大 chunk warning。 |

## Task 9D.10 后续：本地恢复上传第一增量记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| 后端红灯 | PASS | `FileAccessTests#multipartUploadStatusListsUploadedPartsForResume` 首次失败于 `/files/{fileId}/multipart/status` 404，确认缺恢复上传状态接口。 |
| 前端/契约红灯 | PASS | `npm run check:task9d10` 首次失败，确认缺 `multipart/status`、本地恢复会话和 `MultipartStatusResponse` OpenAPI schema。 |
| Multipart 状态查询 | PASS | 新增 `GET /files/{fileId}/multipart/status?upload_id=...`，返回已完成分片、`part_size`、`part_count` 和状态，不返回 `object_key`。 |
| 前端恢复上传 | PASS | 医生订单页新增 `doctorUploadResumeSessions`，重试时读取 status 并跳过已上传分片；异常不自动 abort，保留本地恢复现场。 |
| 手动取消 | PASS | 医生订单页新增「取消未完成上传」，通过 `/files/{fileId}/multipart/abort` 显式取消本地未完成会话。 |
| OpenAPI 同步 | PASS | `docs/api/openapi.yaml` 新增 `MultipartStatusResponse` 和 `/files/{fileId}/multipart/status`；后续 pending 候选接口补齐后，`npm run check:openapi` 通过，61 paths / 72 operations / 72 operationIds。 |
| 前端机器检查 | PASS | `npm run check:task9d10` 通过。 |
| 后端专项回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=FileAccessTests test` 通过，5 tests / 0 failures / 0 errors。 |
| 前端构建 | PASS_WITH_WARNINGS | `npm run build:frontend` 通过；保留既有 VueUse PURE comment 与大 chunk warning。 |

## Task 9D.10 后续：服务端恢复候选第一增量记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| 后端红灯 | PASS | `FileAccessTests#multipartPendingUploadsListsOnlyCurrentDoctorRowsForCrossDeviceResume` 首次失败于 `/files/multipart/pending` 404，确认缺服务端恢复候选列表。 |
| 前端/契约红灯 | PASS | 加强 `npm run check:task9d10` 后首次失败，确认缺 `files/multipart/pending`、`doctorUploadServerResumeCandidates`、`loadDoctorPendingMultipartUploads`、`findDoctorServerResumeCandidate` 和 `MultipartPendingUploadsResponse`。 |
| pending 候选接口 | PASS | 新增 `GET /files/multipart/pending?order_id=...`，只返回当前订单下 `PENDING/MULTIPART` 候选；医生只能列出本人创建且医生可见的候选，不返回 `object_key`。 |
| 前端候选恢复 | PASS | 医生订单页在没有本地恢复会话时，按当前订单、同文件名、同文件大小匹配服务端候选，恢复 `file_id/upload_id` 后继续读取 multipart status。 |
| OpenAPI 同步 | PASS | `docs/api/openapi.yaml` 新增 `/files/multipart/pending`、`MultipartPendingUpload` 和 `MultipartPendingUploadsResponse`；`npm run check:openapi` 通过，61 paths / 72 operations / 72 operationIds。 |
| 前端机器检查 | PASS | `npm run check:task9d10` 通过。 |
| 后端专项回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=FileAccessTests test` 通过，6 tests / 0 failures / 0 errors。 |
| 全量平台回归 | PASS | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test` 通过，53 tests / 0 failures / 0 errors。 |
| 前端构建 | PASS_WITH_WARNINGS | `npm run build:frontend` 通过；保留既有 VueUse PURE comment 与大 chunk warning。 |
| 浏览器 smoke 红灯 | PASS | 再次加强 `npm run check:task9d10` 后首次失败，确认缺 `smoke:task9d10-server-resume` 和 `scripts/smoke-task-9d10-server-resume.spec.mjs`。 |
| smoke 脚本排障 | PASS | 首次运行失败于稀疏文件 header 长度写死；修复后发现浏览器完成了新 `file_id`，说明未复用 pending；最终改为先让浏览器选择文件并读取真实 `File.type`，再用该类型预创建 pending 候选。 |
| 服务端候选恢复 smoke | PASS | `npm run smoke:task9d10-server-resume` 通过，浏览器无本地上传会话时复用 pending Multipart，完成 `file_id=514`，对应 `order_id=1439`。 |
| 中断恢复 smoke 红灯 | PASS | 再次加强 `npm run check:task9d10` 后首次失败，确认缺 `smoke:task9d10-interrupted-resume` 和 `scripts/smoke-task-9d10-interrupted-resume.spec.mjs`。 |
| 中断恢复脚本排障 | PASS | 首次运行等待中文错误文案超时，实际浏览器错误为 `Failed to fetch`；修正断言后复跑通过。 |
| 上传中断后恢复 smoke | PASS | `npm run smoke:task9d10-interrupted-resume` 通过，模拟第 2 个分片 PUT 断网，本地 session 和服务端 status 保留 1 个已完成分片，第二次上传复用同一 `file_id=537` 完成。 |

## Task 9D.10 后续：100MB+ 浏览器上传 smoke 记录

| 场景 | 结果 | 记录 |
| --- | --- | --- |
| 前端 smoke 红灯 | PASS | 加强 `npm run check:task9d10` 后首次失败，确认缺 100MB+ 浏览器 smoke 脚本、npm 入口和上传 UI 稳定 selector。 |
| Playwright 入口排障 | PASS | 初始 `npx --package=playwright node ...` 无法解析包；改为根 devDependency `@playwright/test` 和 `playwright test` 本地 bin。Playwright 自带 Chromium 下载卡住，改用本机 Chrome channel。 |
| 页面路径排障 | PASS | 初始 smoke 假设医生登录后默认进入订单页而失败；修正为显式点击「医生订单」。Element Plus 动态字段未透传 `data-testid` 到真实 input，改用可访问标签名填写「患者姓名」「牙位」。 |
| smoke 脚本 | PASS | 新增 `scripts/smoke-task-9d10-large-upload.spec.mjs`，覆盖医生浏览器登录、创建订单、选择附件、Multipart 上传、完成 `file_id` 回填和预览权限校验。 |
| 机制 smoke | PASS | `TASK9D10_UPLOAD_SIZE_BYTES=1048576 npm run smoke:task9d10-large-upload` 通过，生成 `file_id=456`。 |
| 100MB+ smoke | PASS | `npm run smoke:task9d10-large-upload` 通过，生成 `file_id=457`，页面完成上传并通过预览权限校验。 |
| SQL 核验 | PASS | `file_resource` 中 `file_id=457` 为 `COMPLETED`、`110100480` bytes、`MULTIPART`、`multipart_part_count=21`。 |

## 回归结论

- 后端最小链路可继续作为 M3/M4/M5 的 smoke 基线。
- OpenAPI 硬缺口已按当前后端基线关闭，可作为后续前后端联调和 SDK 生成前置契约。
- Bearer 身份基线、后端权限守卫、数据库化 RBAC/DataScope 基础、菜单/部门/岗位与前端权限路由第一增量、权限注解/统一拦截器、统一身份参数解析、订单/工序实例 SQL DataScope 第一增量、文件/协同/AI DataScope 扩展、生产鉴权启动门禁第一增量、WebSocket 通知第一增量、通知未读/已读第一增量、通知实时前端/Redis 广播第一增量、医生订单工作台第一增量、医生下单第一增量、客服初审第一增量、生产审核第一增量、生产任务入口第一增量、质检工时第一增量、绩效管理第一增量、生产看板第一增量、返工终检第一增量、Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器上传 smoke 已落地，但完整 RuoYi RBAC/DataScope、真实弱网/跨设备浏览器续传、返工闭环、终检发货拦截、真实双实例通知联调和生产网关验收仍未完成。
- 产品级上线仍为 `NOT READY`，原因见 `docs/deployment/readiness-checklist.md`。
- 本轮 smoke 仅追加本地测试数据，不删除、不重置数据库；因此本地 `workflow_chain` 总数包含历史测试链，正式验收应在干净测试库或固定快照库中复跑。
