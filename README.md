# AI 智能下单与生产协同平台

牙科定制工厂一期系统：医生在线下单，客服审核协同，工厂按预定义工艺流生产，逐道工序入检/出检/记工时，客户只能查看外部简化进度。

## 当前仓库状态

当前已完成项目工作流初始化、任务 0：接口契约与项目基线、任务 0.1：TRD V1.1 对齐与开发计划冻结、任务 1：项目骨架初始化、任务 2：数据库模型与 9 条工序链初始化、任务 3：订单状态投影与医生端脱敏基础、任务 4：文件上传与访问权限、任务 5A：Workflow Runtime 与工序节点状态机、任务 5B：入检 / 出检 / 返工 / 工时绩效、任务 6：消息、设计稿、账单物流与通知、任务 7：AI Gateway 与 5 个 AI 智能体、任务 8A readiness audit、任务 8B OpenAPI 二次契约、任务 9A Bearer 身份基线、任务 9B.1 后端权限/DataScope 守卫第一增量、任务 9B.2 数据库化 RBAC/DataScope 基础、任务 9B.3 权限注解/统一拦截器、任务 9B.4 DataScope SQL 过滤第一增量、任务 9B.5 文件/协同/AI DataScope 扩展、任务 9B.6 菜单/部门/岗位/前端权限路由第一增量、任务 9B.7 生产鉴权启动门禁第一增量、任务 9C.1 WebSocket 通知第一增量、任务 9C.2 通知未读/已读第一增量、任务 9C.3 通知实时前端/Redis 广播第一增量、任务 9D.1 医生订单工作台第一增量、任务 9D.2 医生下单第一增量、任务 9D.3 客服初审第一增量、任务 9D.4 生产审核第一增量、任务 9D.5 生产任务入口第一增量、任务 9D.6 入检/出检/工时操作页面第一增量、任务 9D.7 绩效管理页面第一增量、任务 9D.8 生产看板第一增量、任务 9D.9 返工终检第一增量、任务 9D.10 Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器上传 smoke。

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
tasks/README.md -> 任务 8：专项验收矩阵与上线准备
docs/acceptance/task-8-acceptance-matrix.md
docs/deployment/readiness-checklist.md
```

## 技术方向

```text
Frontend: Vue3 + Element Plus + Uppy
Backend: Spring Boot + RuoYi-Vue-Pro
Database: MySQL + Redis
File: MinIO private bucket + signed URL
AI: backend ai-gateway + DeepSeek
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
```

## 环境变量

环境变量模板位于 `.env.example`。该文件只包含本地占位值；任何真实数据库密码、MinIO 密钥、DeepSeek API Key、生产 JWT/Token 密钥都不得提交进仓库。AI Gateway 当前使用 deterministic 安全占位，不读取真实模型密钥。

后端当前会在启动时通过 Flyway 连接 MySQL；Docker Compose 同时使用 Redis、MinIO 变量启动本地基础服务。常用本地变量：

```text
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=ai_order_platform
MYSQL_USER=ai_order
MYSQL_PASSWORD=change-me
APP_AUTH_TOKEN_SECRET=local-dev-change-me-auth-secret
APP_AUTH_TOKEN_TTL_SECONDS=7200
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
```

本地开发账号由 Flyway `V6__auth_rbac_datascope_foundation.sql` 初始化，仅用于本地验收：

```text
admin / change-me-admin
cs / change-me-cs
worker / change-me-worker
doctor / change-me-doctor
```

这些账号密码是本地占位值，数据库中存储 PBKDF2-SHA256 hash；正式环境必须替换为真实账号体系和安全密钥。

生产 profile 使用 `backend/platform-server/src/main/resources/application-prod.yml`。当 `spring.profiles.active=prod` 时，后端启动门禁会强制关闭 `X-Bootstrap-*` 本地兼容，并要求外部注入非本地占位的 `APP_AUTH_TOKEN_SECRET`。

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

说明：任务 9D.10 后，当前契约已覆盖 61 个 path / 72 个 operation，包含唯一 `operationId`、统一错误响应、`/auth/me` 菜单权限响应、通知未读/已读 REST、`/reworks`、Multipart 文件上传、status 恢复和 pending 恢复候选接口；Swagger validate 与 Redocly lint 均通过。

## 检查命令

```bash
npm run acceptance
npm run compose:up
npm run check:openapi
npm run smoke:task9d10-large-upload
npm run test:backend
npm run build:frontend
npm run compose:config
```

说明：`npm run test:backend` 会加载 Spring Boot 上下文并执行 Flyway 校验，运行前需要本地 MySQL 可用。

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

任务 9D.10 100MB+ Multipart 浏览器 smoke：

```bash
npm run compose:up
npm run dev:backend
npm run dev:frontend
npm run smoke:task9d10-large-upload
npm run smoke:task9d10-server-resume
npm run smoke:task9d10-interrupted-resume
```

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
后端最小链路已有 smoke 基线，OpenAPI 当前后端基线已二次冻结，Bearer 身份基线、后端集中权限守卫、数据库化 RBAC/DataScope 基础、菜单/部门/岗位与前端权限路由第一增量、权限注解/统一拦截器、订单/工序实例 DataScope SQL 第一增量、文件/协同/AI DataScope 扩展、生产鉴权启动门禁第一增量、WebSocket 通知第一增量、通知未读/已读第一增量、通知实时前端/Redis 广播第一增量、医生订单工作台第一增量、医生下单第一增量、客服初审第一增量、生产审核第一增量、生产任务入口第一增量、入检/出检/工时操作页面第一增量、绩效管理页面第一增量、生产看板第一增量、返工终检第一增量、Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器上传 smoke 已落地。
正式上线仍缺完整 RuoYi 管理 UI、通用 DataScope SQL 拦截器、真实弱网/跨设备续传、返工关闭/责任分类/终检发货拦截/管理绩效等完整前端业务页面、WebSocket 生产网关/真实多实例验收、真实 DeepSeek、HTTPS/备份/监控/操作手册等硬条件。
```

鉴权说明：

```text
登录接口当前返回服务端签发的 Bearer token。
登录接口当前读取数据库账号、角色、权限、data scope 和可见菜单；Bearer token payload 包含 `username`、`user_id`、`clinic_id`、`permissions` 和 `data_scope`。
后端已有 `AccessControlService` 集中守卫，覆盖派工/转派/跳过节点、医生检查记录拒绝、WORKER/ADMIN 绩效范围等高风险点。
后端已有 `@RequirePermission` 与 `PermissionInterceptor`，对当前业务 Controller 入口做权限码校验；本地 `X-Bootstrap-*` 兼容路径仅作为 smoke 角色 fallback。
后端已有 `BootstrapIdentityArgumentResolver`，业务 Controller 不再直接解析 `X-Bootstrap-*`；订单详情、AI-3 安全读模型、工序实例、文件读取、协同订单范围和 AI 内部上下文读取已加入 SQL DataScope 过滤；前端骨架会按后端 `menus` 渲染入口。
APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=true 仅用于本地烟测兼容 X-Bootstrap-*；prod profile 已通过 application-prod.yml 固定关闭，若生产仍启用会启动失败。
APP_AUTH_TOKEN_SECRET 在正式环境必须使用安全注入的真实密钥，不得提交；prod profile 不提供本地默认值，若仍使用 local-dev-change-me-auth-secret 会启动失败。
WebSocket 通知使用 /ws/connect?token={accessToken}；服务端校验 Bearer token 后才登记在线用户。前端通知中心登录后会建立 WebSocket，收到推送后刷新通知列表和未读数。
通知 REST 已提供 /notifications、/notifications/unread-count、/notifications/{notificationId}/read、/notifications/read-all；前端骨架登录后有「通知中心」入口，支持未读数、列表、单条已读和全部已读。
本地 Vite 已代理 `/notifications` 和 `/ws` 到后端，通知中心不走 `/api/notifications`。
Redis 多实例广播默认关闭；需要联调多实例时设置 `NOTIFICATION_REDIS_BROADCAST_ENABLED=true`，并为每个后端实例配置不同 `APP_INSTANCE_ID`。
医生订单工作台使用 `/orders`、`/form-configs`、`/files/multipart/*`、`/files/{fileId}/multipart/status`、`/orders/{orderId}/messages`、`/orders/{orderId}/design-drafts`、`/orders/{orderId}/bill`、`/orders/{orderId}/logistics` 和 `/ai/order-query`；客服初审入口使用 `/orders?internal_status=PENDING_CS_REVIEW` 和 `/orders/{orderId}/review`；生产审核入口使用 `/orders?internal_status=PENDING_PRODUCTION_REVIEW`、`/workflow-chains` 和 `/orders/{orderId}/production-review`；生产任务入口使用 `/orders?internal_status=PROCESS_INSTANCE_CREATED`、`/orders/{orderId}/process-instance`、派工/转派接口、`/tasks/mine` 和 `/process-instance/nodes/{nodeInstanceId}/start|complete`；质检工时入口使用 `/tasks/mine`、`/check-records` 和 `/work-logs/*`；绩效入口使用 `/performance`；生产看板入口使用 `/orders` 跨内部状态检索和 `/orders/{orderId}/process-instance` 查看节点进度；返工终检入口使用 `/reworks`、`/tasks/mine?status=COMPLETED` 和 `/check-records`；本地 Vite 已代理 `/api`、`/notifications`、`/ws`、`/orders`、`/files`、`/form-configs`、`/workflow-chains`、`/tasks`、`/process-instance`、`/check-records`、`/reworks`、`/work-logs`、`/performance` 与 `/ai`。
```

OpenAPI 二次契约验收口径：

```text
npm run check:openapi 会执行自定义契约检查、Swagger validate 和 Redocly lint。
当前契约为 61 个 path、72 个 operation、72 个唯一 operationId，Redocly warning 已清零；9D.1 已补 `/orders` 当前实现的 `OrderListResponse` / `DoctorOrderSummary` schema，9D.2 已补 `FormFieldConfig` / `CreateOrderRequest` / `CreateOrderResponse`，9D.3 已补 `OrderReviewRequest`、`internal_status` 列表过滤参数和 `/orders/{orderId}/review` 响应 schema，9D.4 已校正生产审核状态门禁和权限描述，9D.5 已校正派工/转派权限说明和 `tasks/mine` 的 `READY` 状态过滤；9D.6 复用既有 `/check-records` 与 `/work-logs/*` 契约，9D.7 复用既有 `/performance` 契约，9D.8 复用既有 `/orders` 与 `/orders/{orderId}/process-instance` 契约，9D.9 新增 `/reworks` 和 `ReworkRecordResponse` 契约，9D.10 新增 Multipart 文件上传、status 恢复、pending 恢复候选接口和 schema。
```

Task 8A smoke 注意事项：

```text
本地数据库可能包含历史 smoke/测试追加数据；不要用 /workflow-chains 总数判断种子链是否只有 9 条。
本轮验收口径是：9 条预定义链全部存在，且常规冠修复节点可查询。
正式上线验收应在干净测试库或固定快照库复跑。
```

## 下一步开发入口

优先处理 `tasks/README.md`：

1. 基于「任务 8A」矩阵选择一个上线硬缺口继续。
2. 推荐继续「任务 9D.10 后续：真实弱网限速/断网 / 跨设备浏览器续传验收」，或扩展「任务 9D.9 后续：返工关闭 / 责任分类 / 终检发货拦截」；如果先处理安全硬缺口，则切回「任务 9B.8：补正式 RBAC/DataScope 的下一块硬缺口」。
3. 每补一个缺口，都要回写 `docs/acceptance/task-8-acceptance-matrix.md` 和 `docs/deployment/readiness-checklist.md` 的状态。

## 安全说明

不要提交任何真实密钥、Token、数据库连接串、MinIO 凭据、DeepSeek API Key 或客户隐私数据。

## 任务 9D.21 绩效归因联动第一增量检查

```bash
npm run check:task9d21
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#performanceSeparatesReworkResponsibilityAttribution test
```

验收口径：`/performance` 新增 `responsible_rework_count`、`non_worker_responsibility_rework_count` 和 `unclassified_rework_count`，Task 8 仍保持 NOT READY。


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
4. 登录成功后继续复用现有 RBAC 菜单，并按入口优先跳转到默认页面。
5. `npm run smoke:task9d24` 通过真实 Chrome 依次点击四入口，并验证 doctor 不能从管理端入口登录。
```

## 任务 9D.25 绩效明细第一增量检查

任务 9D.25 新增 `/performance/details` 和前端绩效页“工时明细”表，用于核对最近 100 条已完成工时来源。Task 8 仍保持 `NOT READY`。

建议验证：

```bash
npm run check:task9d25
npm run acceptance
npm run check:openapi
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#performanceDetailsListCompletedWorkLogsForResolvedUser test
```

## 任务 9D.26 AI 调用限流第一增量检查

任务 9D.26 新增 `AI_MAX_REQUESTS_PER_USER_HOUR`，对真实模型调用做每用户每小时限流；超额返回 429，并写入 `ai_audit_log.result_status=AI_RATE_LIMITED`。Task 8 仍保持 `NOT READY`。

建议验证：

```bash
npm run check:task9d26
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
```

## 任务 9D.27 AI 成本审计第一增量检查

任务 9D.27 新增 `ai_audit_log.estimated_cost_microusd`，并通过 `AI_INPUT_TOKEN_COST_MICROUSD` / `AI_OUTPUT_TOKEN_COST_MICROUSD` 配置按 token usage 估算单次调用成本。仓库不内置真实供应商价格，Task 8 仍保持 `NOT READY`。

建议验证：

```bash
npm run check:task9d27
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
```

## 任务 9D.28 AI 模型重试第一增量检查

任务 9D.28 新增 `AI_MODEL_MAX_RETRIES`，真实模型调用遇到短暂 5xx 或连接类异常时可有限重试；默认重试 1 次，成功后仍只写一条 `SUCCESS` 审计。Task 8 仍保持 `NOT READY`。

建议验证：

```bash
npm run check:task9d28
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
```
