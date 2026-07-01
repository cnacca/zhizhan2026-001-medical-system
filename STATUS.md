# STATUS

## 项目目标

初始化「AI 智能下单与生产协同平台」仓库，使后续开发可以按 PRD/TRD/API/生产流程继续推进，而不是只依赖聊天记录。

## 当前状态

- 仓库是本地 Git 仓库，当前分支 `feature/project-skeleton`，跟踪远程 `origin/feature/project-skeleton`。
- Active goal: `goals/GOAL-001-scope-clarified-for.md`
- Active task: `tasks/README.md` 的「任务 8：专项验收矩阵与上线准备」，状态为 `in-progress/rework-final-entry-added`
- 已按 RepoFrame + Yuri 工作流创建项目上下文文档。
- 已完成任务 0：接口契约与项目基线。
- 已完成任务 0.1：按 TRD V1.1 深度研究优化版对齐开发计划。
- 已完成任务 1 前置预检：确认本机 Node/npm/pnpm/Docker CLI/Colima 可用，Docker daemon 当前未运行，Java Runtime/Maven/Gradle 不可用，并整理任务 1 三条执行路线。
- 已按路线 A 初始化前后端工程骨架；当前仅包含框架启动壳、模块边界占位和 ADMIN 登录烟测，不包含订单、工序、文件、AI、绩效等业务实现。
- 本机 JDK 21、Maven、Node/npm/pnpm、Docker CLI/Colima 可用；Docker daemon 已通过 Colima 启动。

## 已完成

- 9D.19 返工通知联动第一增量：出检失败生成返工记录时写入 REWORK_CREATED 给目标 WORKER，返工关闭后写入 REWORK_CLOSED 给订单 CS，并验证医生用户不会收到返工内部通知。
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
- 已完成任务 5A：新增生产审核触发工序实例化、实例节点/边快照、节点 READY/IN_PROGRESS/COMPLETED/SKIPPED 状态机、派工/转派和我的任务池。
- 已新增 Flyway `V5__workflow_runtime_skip_metadata.sql`，为可选节点跳过记录 `skipped_at` 和 `skip_reason`。
- 已实现 DAG 激活规则：无前置节点初始 READY；后置节点只有在全部前置节点 COMPLETED 或 SKIPPED 后才进入 READY。
- 已验证医生端访问工序实例仍返回 403，模板变更不会影响已生成实例快照。
- 已完成任务 5B：新增入检/出检记录、出检失败返工、工时开始/暂停/继续/完成、绩效统计的最小只读接口。
- 已实现入检门禁：`need_in_check=1` 的节点必须存在通过的入检记录，才能从 `READY` 开工。
- 已实现出检时序：出检只允许在节点 `COMPLETED` 后提交；出检失败会写 `rework_record`，并把返工目标节点重新置为 `READY`，不删除历史 `check_record` / `work_log`。
- 已实现服务端工时计算：暂停段写入 `work_log_pause_segment`，完成工时时扣除暂停时长；同一节点返工后会生成新的 `work_log`，不覆盖原记录。
- 已实现绩效只读统计：WORKER 查询强制限定本人，ADMIN 可按 `user_id` 查询指定员工。
- 已完成任务 6：新增消息、设计稿、账单、物流和通知事实落库的后端最小链路。
- 已实现生产端消息待客服审核、审核后医生可见；医生端只读取已审核或直达的公开消息。
- 已实现设计稿上传、客服审核、医生确认/驳回的最小状态流转，并按事件写入 `notification_event` / `user_notification`。
- 已实现账单上传与物流发货；物流发货会通过 `OrderStatusService` 把医生端外部状态更新为 `SHIPPED`。
- 已验证医生端消息、设计稿、账单物流和订单详情不返回内部生产备注、内部状态等敏感字段。
- 已完成任务 7：新增后端最小 AI Gateway，覆盖 AI-1 翻译助手、AI-2 客服查询助手、AI-3 客户订单助手、AI-4 资料缺失检查助手、AI-5 生产备注助手。
- 已实现 5 个 AI 智能体的角色白名单、固定上下文类型、deterministic 安全占位输出和 `ai_audit_log` 审计落库。
- 已把 AI-3 接入 `DoctorOrderAssistantReadModel`，医生询问内部工序、员工、返工、工时、绩效等问题时返回安全拒绝，只补充公开状态/账单/物流/公开消息。
- 已实现 AI-4 基于 `form_field_config.required_flag` 与订单 `form_data` 的资料缺失检查，并保留医生端数据范围校验。
- 已启动任务 8A：依据 PRD 12 步主链路、TRD V1.1 专项测试矩阵和团队文档 M6 标准，新增专项验收矩阵、回归记录和上线 readiness 清单。
- 已新增 `docs/acceptance/task-8-acceptance-matrix.md`，用 `PASS / PARTIAL / BLOCKED / NOT_STARTED` 客观标注当前验收状态。
- 已新增 `docs/acceptance/task-8-regression-record.md`，记录本轮自动化检查、HTTP/SQL smoke 与既有测试覆盖。
- 已新增 `docs/deployment/readiness-checklist.md`，明确正式上线前必须补齐 RBAC/DataScope、WebSocket、前端页面、真实密钥配置、HTTPS、备份、MinIO 隔离、DeepSeek 接入等缺口。
- 已完成 Task 8A 本轮回归：acceptance、toolchain、Compose config、OpenAPI、前端 build、后端 Maven test 和 HTTP/SQL smoke 均已记录；正式上线结论保持 `NOT READY`。
- 已完成任务 8B：`docs/api/openapi.yaml` 已同步任务 4-7 当前后端基线，补齐 60 个唯一 `operationId`、统一 4xx/503/default 错误响应、文件 complete、工序节点 start/complete/skip 等缺失契约。
- 已新增 `scripts/check-openapi-contract.rb`，并把 `npm run check:openapi` 升级为自定义契约检查 + Swagger validate + Redocly lint；当前 Redocly warning 已清零。
- 已启动任务 9A：新增服务端签发 HMAC Bearer token、请求级身份上下文和 Bearer 身份 filter；接口优先使用 `Authorization: Bearer ...` 身份，`X-Bootstrap-*` 仅保留为本地烟测兼容路径。
- 已新增 `BearerIdentityTests`，验证 Bearer 医生身份下的医生端脱敏、跨医生 403，以及关闭 bootstrap header 后缺少 Bearer token 返回 401。
- 已推进任务 9B 第一增量：新增 `AccessControlService`，集中后端角色权限和数据范围守卫。
- 已修复派工/转派接口不读取当前身份的问题；现在仅 CS/ADMIN 可派工、转派和跳过可选节点。
- 已收紧内部检查记录与绩效范围：医生端不得读取 `check_record`，WORKER 只能看本人绩效，ADMIN 才能按 `user_id` 查询，CS/医生不能查绩效。
- 已新增 Bearer 回归：WORKER Bearer token 不能派工/跳过节点，DOCTOR Bearer token 不能读入检/出检记录，CS Bearer token 不能查员工绩效。
- 已推进任务 9B.2：新增 Flyway `V6__auth_rbac_datascope_foundation.sql`，建立 `system_user`、`system_role`、`system_permission`、`system_user_role`、`system_role_permission` 过渡表和本地种子账号。
- 登录接口已从硬编码 ADMIN 改为数据库账号校验；本地种子账号使用 PBKDF2-SHA256 hash，占位密码仅用于本地开发。
- Bearer token 已携带数据库解析出的 `username`、`user_id`、`clinic_id`、`permissions` 和 `data_scope`；`/api/auth/me` 可返回当前账号权限信息。
- 前端骨架登录 smoke 已改为显示真实登录账号、角色和 data scope。
- 已完成任务 9B.3：新增 `@RequirePermission`、`PermissionInterceptor`、`PermissionWebConfiguration`，将订单、文件、AI、Workflow Runtime、Check/WorkLog/Performance、消息、设计稿、账单物流等 Controller 入口纳入统一权限注解校验。
- 已新增 `PermissionInterceptorTests`，覆盖数据库医生账号可读本人脱敏订单但不能访问客服 AI、数据库工人账号不能派工且绩效强制本人、数据库客服账号不能读绩效。
- 已推进任务 9B.4 第一增量：新增 `BootstrapIdentityArgumentResolver`，业务 Controller 不再直接声明 `X-Bootstrap-*` 参数，兼容逻辑收口到统一身份解析器。
- 已将订单详情 / AI-3 安全读模型 / 内部订单详情 / 工序实例读取改为查询级 DataScope 过滤：`ALL` 可读全部，`CLINIC` 限定诊所或医生本人，`SELF` 限定医生/客服本人或已分配工序节点。
- 已补充 `PermissionInterceptorTests` 的数据库工人 SELF DataScope 回归：未分配节点时读取订单和工序实例返回 403，分配节点后允许读取。
- 已完成任务 9B.5 第一增量：文件读取/预览、上传 token 订单范围、消息/设计稿/账单物流订单范围、AI 内部上下文读取均加入查询级 DataScope 过滤。
- 已补充 `PermissionInterceptorTests` 的数据库工人 SELF DataScope 回归：未分配节点时读取消息和文件预览返回 403，分配节点后允许读取。
- 已完成任务 9B.6 第一增量：新增 RuoYi 风格 `system_dept`、`system_post`、`system_menu`、`system_role_menu`、`system_user_post` 基础表和种子数据。
- 登录与 `/api/auth/me` 已返回当前账号可见菜单；前端骨架已按后端菜单权限显示工作入口，医生账号不会显示内部订单或系统权限入口。
- 已完成任务 9B.7 第一增量：新增生产鉴权启动门禁，`prod` profile 禁止启用 `X-Bootstrap-*` 本地兼容，并要求 `APP_AUTH_TOKEN_SECRET` 使用非本地占位密钥。
- 已新增 `application-prod.yml`，生产 profile 默认 `allow-bootstrap-headers=false` 且不提供 token secret 默认值；新增 `AuthStartupValidatorTests` 覆盖生产门禁和非生产开关同步。
- 已完成任务 9C.1 第一增量：新增真实 WebSocket 通知通道 `/ws/connect?token=...`，握手时校验 Bearer token，在线用户收到 `notification_event` 脱敏 payload 后写 `user_notification.delivered_at`。
- 已新增 `NotificationWebSocketTests`，覆盖医生 Bearer token 建立 WebSocket、账单通知在线推送、内部备注不出现在 payload、送达时间落库。
- 已完成任务 9C.2 第一增量：新增通知列表、未读数、单条已读、全部已读 REST 接口，并按当前用户 `user_notification.user_id` 强制隔离。
- 已新增 `NotificationRestTests`，覆盖当前用户只读本人通知、未读数、单条已读、全部已读和他人通知隔离。
- 前端骨架已新增登录后的「通知中心」入口，支持未读徽标、刷新、单条已读和全部已读。
- `docs/api/openapi.yaml` 已同步 9C.2 通知 REST 契约；9D.10 后当前为 61 个 path / 72 个 operation / 72 个唯一 `operationId`。
- 已完成任务 9C.3 第一增量：前端通知中心登录后建立 `/ws/connect` WebSocket，收到实时通知后刷新通知列表和未读数，并显示连接状态。
- 已新增 Redis 通知广播第一增量：`NotificationBroadcaster`、`NotificationRedisBroadcaster`、`NotificationRedisBroadcastListener` 和条件化 Redis listener container；默认关闭，通过 `NOTIFICATION_REDIS_BROADCAST_ENABLED=true` 开启。
- 已新增 `NotificationBroadcastTests`，覆盖本机无在线 session 时仍发布广播、远端广播不会自回环且会触发本机投递。
- 已完成本地真实 `/ws` 代理 smoke：doctor 通过 Vite `/api/auth/login` 登录并连接 `ws://localhost:5173/ws/connect`，admin 调用 `/orders/{orderId}/bill` 后收到 `BILL_UPLOADED` 实时 payload。
- 已完成任务 9D.1 第一增量：实现 `GET /orders` 后端订单列表，医生端列表强制限定本人订单并返回脱敏 `DoctorOrderVO`；前端新增「医生订单工作台」，可读取订单列表/详情、公开消息、设计稿、账单物流，并可调用医生 AI、确认收货和处理待确认设计稿。
- 已新增 `scripts/check-task-9d1-frontend.mjs` 和 `npm run check:task9d1`，并把 9D.1 后端列表、前端工作台和 Vite `/orders`、`/ai` 代理纳入 `acceptance.json` 关键检查。
- 已按本轮交接要求回写 `STATUS.md`、`DECISIONS.md`、`tasks/README.md`、`README.md`：明确 9D.1 是医生订单读取侧第一增量，下一步锁定 9D.2 医生下单/动态表单/上传入口第一增量，Task 8 总体仍保持 `NOT READY`。
- 已完成任务 9D.2 第一增量：新增 `GET /form-configs` 只读动态表单、`POST /orders` 医生提交订单、本人已完成医生可见文件绑定校验、`V8__doctor_order_entry_form_seed.sql` 默认表单字段、前端「新建订单」面板和 `npm run check:task9d2`。
- 9D.2 提交订单后进入 `PENDING_CS_REVIEW` / `PENDING_REVIEW`，响应保持医生端脱敏；9D.2 当时不实现草稿、真实上传、客服审核、生产审核或工序实例化。
- 已完成任务 9D.3 第一增量：新增 `POST /orders/{orderId}/review` 客服初审通过/驳回接口、`GET /orders?internal_status=PENDING_CS_REVIEW` 内部待审过滤、状态历史和医生通知事实；前端 `/orders/internal` 复用内部订单菜单新增「客服初审」最小页面。
- 9D.3 审核通过仅进入 `PENDING_PRODUCTION_REVIEW` / `PENDING_REVIEW`，不触发生产审核、不实例化工序；驳回进入 `CS_REJECTED` / `PENDING_REVIEW`，医生端仍只看外部投影。
- 已完成任务 9D.4 第一增量：生产审核接口新增状态门禁，仅允许 `PENDING_PRODUCTION_REVIEW` 订单进入生产审核；前端 `/workflow/review` 新增「生产审核」最小页面，可按待生产审核列表选择订单、选择工序链、填写入口路线/分支参数并触发工序实例化或驳回。
- 9D.4 审核通过进入 `PROCESS_INSTANCE_CREATED` / `PRODUCING` 并生成工序实例快照；本轮不实现生产任务池页面、派工页面、入检/出检/工时页面、复杂 Uppy 上传或真实 DeepSeek。
- 已完成任务 9D.5 第一增量：前端 `/workflow/process-instance` 新增工序实例详情、`/workflow/assign` 新增派工/转派、`/tasks/mine` 新增工人任务池；复用既有 `GET /orders/{orderId}/process-instance`、派工/转派和 `GET /tasks/mine` / 节点 start/complete 接口。
- 9D.5 只覆盖已实例化订单的工序查看、节点绑定员工和工人 READY/IN_PROGRESS/COMPLETED/PENDING 任务列表；本轮不实现入检/出检页面、工时暂停/继续/完成页面、返工处理页面或完整生产看板。
- 已完成任务 9D.6 第一增量：前端 `/checks` 新增入检/出检操作页，复用 worker 任务池选节点并调用 `/check-records`；前端 `/worklogs/self` 新增工时操作页，支持对本人进行中任务开始、暂停、继续和完成工时。
- 9D.6 只覆盖质检/工时页面级最小闭环；本轮不实现完整返工处理台、责任分类字典、绩效看板、生产通知联动或复杂生产看板。
- 已完成任务 9D.7 第一增量：前端 `/performance` 新增绩效统计页，复用既有 `GET /performance`，WORKER 留空查本人，ADMIN 可输入 `user_id` 查询指定员工。
- 9D.7 只展示后端当前返回的完成工序、有效工时、返工次数、准时率、通过率和工时效率；本轮不实现绩效明细、筛选周期、标准工时配置、申诉/补录或完整公式调整。
- 已完成任务 9D.8 第一增量：前端 `/production/board` 新增生产看板页，复用既有 `GET /orders` 跨内部状态检索订单，并读取 `GET /orders/{orderId}/process-instance` 展示节点进度快照。
- 9D.8 新增 `V9__production_board_menu_seed.sql` 为 ADMIN/CS 增加「生产看板」菜单；本轮不实现拖拽看板、实时推送、复杂筛选、节点编辑、终检或生产排产。
- 已完成任务 9D.9 第一增量：后端新增 `GET /reworks` 返工记录只读列表，WORKER 限定本人来源/目标节点，医生端禁止读取；前端 `/rework-final` 新增「返工终检」页面，可查看待返工记录并对已完成节点提交终检出检。
- 9D.9 新增 `V10__rework_final_menu_seed.sql` 为 ADMIN 和具备 `check:write` 的角色增加「返工终检」菜单；本轮不实现返工责任分类、返工关闭、终检报告、出货前拦截或真实 DeepSeek。
- 已完成任务 9D.10 第一增量：后端新增 MinIO Multipart 初始化、分片签名、complete 和 abort 接口，`file_resource` 记录 `upload_mode`、`multipart_upload_id`、分片大小和分片数；前端医生订单页新增最小 Uppy 文件选择、分片上传并回填 `file_id` 的入口。
- 已完成任务 9D.10 后续第一增量：后端新增 `GET /files/{fileId}/multipart/status`，返回已完成分片列表；前端医生上传入口新增本地恢复会话，重试时读取 status 并跳过已上传分片，同时保留手动取消未完成上传入口。
- 已完成任务 9D.10 后续第二增量：新增 Playwright 100MB+ 浏览器上传 smoke，`npm run smoke:task9d10-large-upload` 已通过，`file_id=457` 核验为 `COMPLETED / 110100480 bytes / MULTIPART / 21 parts`。
- 已完成任务 9D.10 后续第三增量：后端新增 `GET /files/multipart/pending?order_id=...`，按当前订单列出本人未完成 Multipart 候选且不暴露 `object_key`；前端医生上传入口在没有本地 `localStorage` 会话时，可按同订单、同文件名、同大小从服务端恢复 `file_id/upload_id` 后再读取 status。
- 已完成任务 9D.10 后续第四增量：新增 Playwright 上传中断后恢复 smoke，`npm run smoke:task9d10-interrupted-resume` 已通过，验证第 2 个分片人为中断后可保留本地 `doctor-order-upload:` 会话、读取服务端 `multipart/status`，并复用同一 `file_id=537` 继续完成上传。
- 已完成任务 9D.10 后续第四增量：新增 Playwright 服务端候选恢复 smoke，`npm run smoke:task9d10-server-resume` 已通过，确认无本地上传会话时浏览器复用预创建 pending Multipart；本轮记录 `file_id=514`、`order_id=1439`。
- 9D.10 仍只覆盖已选择/已创建订单的附件上传和绑定，不实现草稿上传、完整 Uppy Dashboard、真实弱网注入、完整跨设备浏览器验收或文件类型/数量最终限制。
- 已修复本地浏览器 smoke 阻塞：默认 CORS 同时允许 `http://localhost:5173` 与 `http://127.0.0.1:5173`，避免 Vite Local URL 登录时返回 `Invalid CORS request`；`BearerIdentityTests#databaseLoginAllowsLocalhostAndLoopbackViteOrigins` 已覆盖。
- 已修复 9D.2 动态表单浏览器读取缺口：`/form-configs` 已加入 Vite proxy，`npm run check:task9d2` 和 `acceptance.json` 已纳入代理检查。
- 本轮浏览器 smoke 已覆盖 doctor 在 `http://127.0.0.1:5173` 登录、进入「医生订单」、读取 REGULAR_CROWN 动态表单，并创建订单 `ORD20260630-9D94797093`，页面显示 `PENDING_REVIEW` 和医生端脱敏资料。

## 正在做什么

项目处于任务 8 上线准备阶段：接口契约、数据库基线、状态投影、文件权限、Workflow Runtime、入检/出检、返工、工时绩效、消息、设计稿、账单物流、通知事实表和最小 AI Gateway 已完成后端 smoke 基线；OpenAPI 二次契约硬缺口已关闭；当前结论仍是“后端最小链路可回归，产品级正式上线仍 NOT READY”。

Task 8 已完成 8A readiness audit、8B OpenAPI 二次契约、9A Bearer 身份基线、9B.1 后端权限守卫、9B.2 数据库化 RBAC/DataScope 基础、9B.3 权限注解/统一拦截器、9B.4 DataScope SQL 过滤第一增量、9B.5 文件/协同/AI DataScope 扩展、9B.6 菜单/部门/岗位/前端权限路由第一增量、9B.7 生产鉴权门禁第一增量、9C.1 WebSocket 通知第一增量、9C.2 通知未读/已读第一增量、9C.3 通知实时前端/Redis 广播第一增量、9D.1 医生订单工作台第一增量、9D.2 医生下单第一增量、9D.3 客服初审第一增量、9D.4 生产审核第一增量、9D.5 生产任务入口第一增量、9D.6 入检/出检/工时操作页面第一增量、9D.7 绩效管理页面第一增量、9D.8 生产看板第一增量、9D.9 返工终检第一增量、9D.10 Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器 smoke；任务 8 总体不标完成，后续需要继续补真实弱网限速/断网、完整跨设备续传、完整返工处理闭环、终检发货拦截、通用 DataScope 覆盖、真实 DeepSeek、部署/操作手册等上线硬缺口。

## 未完成事项

- 明确 Multipart 阈值、动态表单字段最终清单、AI-5 模板等客户/PM 仍需确认项。
- 后续补完整返工处理台、责任分类、返工关闭、绩效明细、终检发货拦截和完整生产看板；任务 5B 已完成后端最小执行接口和烟测，任务 9D.5 已补生产任务池和派工第一增量，任务 9D.6 已补入检/出检和工时操作页面第一增量，任务 9D.7 已补绩效管理页面第一增量，任务 9D.8 已补跨状态生产看板第一增量，任务 9D.9 已补返工记录只读和终检出检入口第一增量。
- 后续把 WebSocket 通知接入生产级 Nginx/HTTPS、压测、监控和真实多实例联调；任务 6 已完成通知事实表和未读补偿的最小链路，任务 9C.1 已完成单实例 WebSocket 在线推送，任务 9C.2 已完成通知 REST 与前端入口，任务 9C.3 已完成前端实时刷新、Vite `/ws` 代理 smoke 和 Redis 广播代码路径第一增量。
- 后续接入正式 RuoYi-Vue-Pro 权限体系；当前已支持数据库账号登录、服务端签发 Bearer token、权限码/data_scope、基础菜单/部门/岗位表、前端按菜单权限显示入口、集中式后端权限守卫、Controller 权限注解拦截，以及订单、工序实例、文件、协同订单范围、AI 内部上下文的部分 SQL DataScope 过滤；`X-Bootstrap-*` 仍作为统一解析器中的本地烟测兼容路径存在，但生产 profile 已新增启动门禁，要求关闭该兼容路径并配置真实 token secret。
- 后续把 AI Gateway 从 deterministic 安全占位回答接入正式 DeepSeek/模型适配，但 AI-3 必须继续只读 `DoctorOrderAssistantReadModel`。
- 后续补 AI-1/AI-2/AI-5 更完整的模板、提示词、输出校验和人工确认页面；当前只返回草稿或查询结果，不自动写业务字段。
- 后续补真实弱网限速/断网、完整跨设备续传、文件类型/数量最终限制和草稿上传；任务 9D.10 已完成 Multipart 第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器 smoke，但仍不是完整大文件上传上线验收。
- 后续把 Workflow Runtime 接入正式 RuoYi DataScope SQL 过滤、通知事件、前端任务池和生产看板。
- 后续把 Check/WorkLog/Performance 接入正式 RuoYi DataScope SQL 过滤、通知事件和更完整的绩效维度。
- 后续补完整客服协同页面、完整返工/终检闭环和正式生产看板等业务页面；任务 9D.1 已补医生订单读取工作台，任务 9D.2 已补医生下单第一增量，任务 9D.3 已补客服初审第一增量，任务 9D.4 已补生产审核第一增量，任务 9D.5 已补生产任务入口第一增量，任务 9D.6 已补质检工时第一增量，任务 9D.7 已补绩效管理第一增量，任务 9D.8 已补生产看板第一增量，任务 9D.9 已补返工终检第一增量，任务 9D.10 已补 Multipart 上传第一增量、本地恢复上传第一增量和服务端候选恢复第一增量，但仍不是完整业务前端。
- 任务 9D.2/9D.10 尚未覆盖草稿上传、真实弱网限速/断网、完整跨设备浏览器验收和完整 Uppy Dashboard；100MB+ 本地浏览器 smoke、无本地会话服务端候选恢复浏览器 smoke 与上传中断后恢复浏览器 smoke 已补。
- 任务 9D.3 尚未覆盖 AI 翻译草稿写入生产指令、资料缺失提示页面、补资料重新提交和完整客服消息/账单物流页面。
- 任务 9D.7 尚未覆盖绩效明细列表、周期筛选、标准工时配置、绩效申诉/补录和生产通知联动；任务 9D.8 尚未覆盖拖拽/泳道生产看板、复杂筛选、实时刷新和排产；任务 9D.9 尚未覆盖返工责任分类、返工关闭、终检报告、出货前拦截和生产通知联动。
- 后续清理 Task 8A 矩阵里的 `PARTIAL`、`BLOCKED`、`NOT_STARTED` 项，优先级建议为正式 RBAC/DataScope、WebSocket 通知、医生/客服/生产/管理端页面和真实 DeepSeek 接入。
- 后续把 `docs/acceptance/task-8-acceptance-matrix.md` 转成测试工程师可逐项执行的浏览器用例和缺陷追踪清单。

## 已知问题 / 阻塞

- 本机已安装 Homebrew `openjdk@21` 和 `maven`；同时 Homebrew 也安装了 `openjdk` 26 作为 Maven 依赖。项目命令通过 `scripts/with-jdk21.sh` 显式使用 JDK 21。
- 浏览器点击级验收已覆盖医生菜单权限、通知中心、9D.1 医生订单工作台、9D.2 医生动态表单/下单、9D.7 绩效统计和 9D.8 生产看板第一增量；完整 12 步主链路浏览器验收仍未完成。
- Docker Compose 基础服务使用占位密码，仅用于本地开发；真实凭据不得提交。
- Flyway 启动时提示 MySQL 8.4 新于当前 Flyway 已测试版本，属于兼容性 warning；本轮迁移与测试已在本机 MySQL 8.4 通过。
- `standard_duration` 暂无客户真实标准工时，本轮迁移允许为空，不伪造工时。
- `.local-context/生产流程.docx` 中存在孤立重复箭头和贴面/隐形流程排版不连续；本轮已按源文档节点顺序标准化为顺序边，并保留分支字段表达。
- 当前医生端/内部端订单详情接口仍是最小验收实现；已覆盖订单列表、医生创建、客服初审、生产审核和生产任务入口第一增量，但尚未覆盖设计稿、账单物流完整业务页面。
- `GET /orders/{orderId}/process-instance` 已实现内部角色查询、医生端 403 和 WORKER SELF SQL DataScope；业务 Controller 不再直接解析 `X-Bootstrap-*`。
- `POST /check-records`、`POST /work-logs/*`、`GET /performance` 已实现后端最小链路；业务 Controller 不再直接解析 `X-Bootstrap-*`，但统一身份解析器仍保留本地 smoke 兼容。
- `POST /orders/{orderId}/messages`、`POST /messages/{msgId}/review`、`POST /orders/{orderId}/design-drafts`、`POST /orders/{orderId}/bill`、`POST /orders/{orderId}/logistics` 已实现后端最小链路；业务 Controller 不再直接解析 `X-Bootstrap-*`，协同类订单范围已加入查询级 DataScope 过滤，但仍未接入通用 RuoYi DataScope SQL 拦截器。
- Multipart 阈值、文件大小/类型/数量限制仍需 PM/客户最终确认；当前本地默认最大文件 200MB，预签名上传/预览 15 分钟，下载 2 小时。
- 任务 9C.1 已实现单实例 WebSocket 长连接推送，任务 9C.2 已实现通知列表、未读/已读 REST 接口和前端通知中心入口，任务 9C.3 已实现浏览器 WebSocket 实时接入、Vite `/ws` 代理 smoke 和 Redis 广播代码路径；仍未完成真实双后端实例 Redis 联调、生产 Nginx/HTTPS、心跳策略、监控和压测，正式在线通知仍为 `PARTIAL`。
- 任务 9D.1 已实现 `GET /orders` 列表和医生订单工作台第一增量；任务 9D.2 已实现医生读取动态表单、提交订单和绑定本人已完成文件的第一增量；任务 9D.3 已实现客服待审过滤、通过/驳回和前端客服初审入口第一增量；任务 9D.4 已实现生产待审过滤页面、工序链选择和生产审核触发工序实例化第一增量；任务 9D.5 已实现工序实例详情、派工/转派和工人任务池第一增量；任务 9D.6 已实现入检/出检和工时操作页面第一增量；任务 9D.7 已实现绩效统计页面第一增量；任务 9D.8 已实现生产看板跨状态检索和节点进度第一增量；任务 9D.9 已实现返工记录只读列表和终检出检入口第一增量；任务 9D.10 已实现 Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器 smoke；医生列表/详情/下单、上传、客服初审、生产审核、派工任务池、质检工时、绩效、生产看板、返工终检入口、OpenAPI、前端构建和浏览器 smoke 部分已通过，但完整弱网/跨设备续传、返工闭环、终检发货拦截和正式生产看板仍未完成。
- 本轮任务 7 未接入真实 DeepSeek API、流式输出、重试、限流、成本统计和提示词版本管理；当前模型名记录为 `deterministic-placeholder`。
- 本轮任务 7 的 AI-2 内部查询仍是最小订单摘要，尚未接入完整客服知识上下文、工序实例明细聚合或消息/文件预览 URL 聚合。
- 本轮任务 7 的 AI-5 生产备注模板仍未收到客户最终版，当前只生成通用草稿，不写入订单字段。
- Task 8A 已明确当前不能正式上线：仍缺完整 RuoYi RBAC/DataScope、完整前端业务页面、WebSocket 生产网关/真实多实例验收、终检发货拦截、真实 DeepSeek、完整弱网/跨设备续传、生产级部署配置和操作手册；9D.1/9D.2/9D.3/9D.4/9D.5/9D.6/9D.7/9D.8/9D.9/9D.10 只推进了医生端订单读取、医生下单、客服初审、生产审核、生产任务入口、质检工时、绩效管理、生产看板、返工终检、Multipart 上传、本地恢复上传、服务端候选恢复、上传中断后恢复和 100MB+ 浏览器 smoke 第一增量。
- 任务 9A/9B.1/9B.2/9B.3/9B.4/9B.5/9B.6/9B.7 第一增量已完成服务端 Bearer 身份基线、后端集中权限守卫、数据库化账号/角色/权限/DataScope 基础、基础菜单/部门/岗位、前端权限路由、权限注解统一拦截器、统一身份参数解析、部分查询级 DataScope 过滤和生产鉴权启动门禁；尚未接入完整 RuoYi 管理 UI、通用 SQL 拦截器和生产级 Spring Security/JWT，正式环境必须关闭 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS` 并配置真实 `APP_AUTH_TOKEN_SECRET`。
- 本机数据库保留历史 smoke/测试追加数据，`GET /workflow-chains` 当前总数大于 9；Task 8A 已按“不清理数据库”的约束验收 9 条预定义链存在，正式验收应在干净测试库或固定快照库复跑。
- 动态表单字段最终清单、设计稿阻塞关系、AI-5 模板、标准工时和预计发货算法仍需 PM/客户确认。
- 进行中订单是否允许 ADMIN 调整节点仍需确认；默认不允许增删节点，只允许员工绑定/转派。
- `docs/api/openapi.yaml` 当前已通过自定义契约检查、Swagger validate 和 Redocly lint；9D.10 后当前为 61 个 path / 72 个 operation / 72 个唯一 `operationId`，并已补 Multipart 上传、status 恢复、pending 恢复候选接口和 schema；后续新增接口时必须继续同步契约并保持 `npm run check:openapi` 通过。

## 重要文件

- `AGENTS.md`：Codex 接手规则。
- `AGENT.md`：RepoFrame 细则入口。
- `PROJECT.md`：产品目标、范围、边界和验收红线。
- `DECISIONS.md`：已确认决策。
- `tasks/README.md`：Yuri 风格任务拆解和下一步。
- `tasks/TASK-001-clarify-source-bundle-and-recover-missing-scope.md`：RepoFrame 初始澄清任务，已被 `tasks/README.md` 的 V1.1 计划取代。
- `tasks/TASK-002-project-skeleton-initialization.md`：任务 1 的详细执行任务，等待路线确认。
- `.repo-init/README.md` / `.repo-init/init-report.md`：初始化依据和证据。
- `docs/api/openapi.yaml`：已修复并完成任务 8B 二次冻结的当前后端基线 OpenAPI 契约。
- `scripts/check-openapi-contract.rb`：任务 8B 自定义 OpenAPI 契约检查，覆盖 operationId、标准错误响应和关键新增 path。
- `docs/source/README.md`：源文档路径和作用。
- `docs/development/task-1-preflight.md`：任务 1 前置预检与路线选择。
- `docs/development/task-1-execution-checklist.md`：任务 1 开工清单和验收边界。
- `docs/acceptance/task-8-acceptance-matrix.md`：任务 8A 专项验收矩阵和上线结论。
- `docs/acceptance/task-8-regression-record.md`：任务 8A 回归命令、HTTP/SQL smoke 和测试覆盖记录。
- `docs/deployment/readiness-checklist.md`：正式上线前 readiness 缺口清单。
- `backend/`：Spring Boot / Maven 多模块后端骨架。
- `backend/platform-server/src/main/resources/db/migration/`：Flyway 迁移，包含核心表和 9 条工艺链种子数据。
- `backend/platform-server/src/main/java/com/yuri/aiorder/workflow/definition/`：最小只读 Workflow API。
- `backend/platform-server/src/main/java/com/yuri/aiorder/order/status/`：任务 3 状态枚举、状态服务和投影服务。
- `backend/platform-server/src/main/java/com/yuri/aiorder/order/api/`：任务 3 医生端脱敏 VO、内部 DTO、AI-3 安全读模型和最小订单接口。
- `backend/platform-server/src/test/java/com/yuri/aiorder/order/OrderStatusProjectionTests.java`：任务 3 状态投影与脱敏边界测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/file/api/`：任务 4 MinIO 配置、文件服务、上传/签名接口和访问策略。
- `backend/platform-server/src/test/java/com/yuri/aiorder/file/FileAccessTests.java`：任务 4 文件上传、签名 URL、审计和医生端拒绝访问测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/workflow/runtime/`：任务 5A 工序实例化、节点状态机、任务池和运行时接口。
- `backend/platform-server/src/test/java/com/yuri/aiorder/workflow/runtime/WorkflowRuntimeTests.java`：任务 5A DAG 激活、并联汇合、可选节点跳过、任务池和医生端拒绝访问测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/`：任务 5B 入检/出检、返工、工时和绩效接口。
- `backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java`：任务 5B 入检门禁、出检时序、返工工时和绩效范围测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/`：任务 6 消息、设计稿、账单物流和通知事实接口。
- `backend/platform-server/src/test/java/com/yuri/aiorder/collaboration/MessageDesignBillNotificationTests.java`：任务 6 医生端脱敏、消息审核、设计稿确认、账单物流和通知事实测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/ai/`：任务 7 AI Gateway、工具白名单、上下文构造、输出防护和审计落库。
- `backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayTests.java`：任务 7 五个 AI 端点、AI-3 安全拒绝、资料缺失检查和审计测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/`：任务 9A Bearer token 签发、校验、filter 和身份上下文。
- `backend/platform-server/src/test/java/com/yuri/aiorder/auth/BearerIdentityTests.java`：任务 9A Bearer 身份、医生端脱敏、跨医生拒绝和禁用 bootstrap header 后 401 测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/AccessControlService.java`：任务 9B.1 后端集中权限与数据范围守卫。
- `backend/platform-server/src/main/resources/db/migration/V6__auth_rbac_datascope_foundation.sql`：任务 9B.2 数据库化账号、角色、权限和 data scope 基础。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/DatabaseAuthService.java`：任务 9B.2 数据库登录、角色权限聚合和身份构造。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/PasswordHashService.java`：任务 9B.2 PBKDF2-SHA256 密码 hash 校验。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/RequirePermission.java`：任务 9B.3 Controller 权限注解。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/PermissionInterceptor.java`：任务 9B.3 统一权限拦截器，优先使用数据库 Bearer 权限码，兼容本地角色 fallback。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/PermissionWebConfiguration.java`：任务 9B.3 MVC 拦截器注册。
- `backend/platform-server/src/test/java/com/yuri/aiorder/auth/PermissionInterceptorTests.java`：任务 9B.3 数据库账号权限码和角色边界回归测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/BootstrapIdentityArgumentResolver.java`：任务 9B.4 统一身份参数解析器。
- `backend/platform-server/src/main/java/com/yuri/aiorder/order/api/OrderProjectionQueryService.java`：任务 9B.4 订单读取 SQL DataScope 过滤。
- `backend/platform-server/src/main/java/com/yuri/aiorder/workflow/runtime/WorkflowRuntimeService.java`：任务 9B.4 工序实例读取 SQL DataScope 过滤。
- `backend/platform-server/src/main/java/com/yuri/aiorder/file/api/FileResourceService.java`：任务 9B.5 文件上传订单范围和文件读取 SQL DataScope 过滤。
- `backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/CollaborationService.java`：任务 9B.5 消息、设计稿、账单物流订单范围 SQL DataScope 过滤。
- `backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java`：任务 9B.5 AI 内部上下文读取 SQL DataScope 过滤。
- `backend/platform-server/src/main/resources/db/migration/V7__auth_menu_dept_post_foundation.sql`：任务 9B.6 菜单、部门、岗位和角色菜单基础迁移。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/AuthMenu.java`：任务 9B.6 登录态菜单 DTO。
- `frontend/src/App.vue`：任务 9B.6 前端按后端菜单权限渲染工作入口；任务 9D.1 医生订单工作台、9D.2 医生下单、9D.3 客服初审、9D.4 生产审核、9D.5 生产任务入口第一增量。
- `scripts/check-task-9d1-frontend.mjs`：任务 9D.1 前端工作台与 Vite 代理关键文本检查。
- `scripts/check-task-9d2-frontend.mjs`：任务 9D.2 医生下单与动态表单关键文本检查。
- `scripts/check-task-9d3-frontend.mjs`：任务 9D.3 客服初审关键文本检查。
- `scripts/check-task-9d4-frontend.mjs`：任务 9D.4 生产审核关键文本检查。
- `scripts/check-task-9d5-frontend.mjs`：任务 9D.5 工序实例、派工转派和我的任务关键文本检查。
- `scripts/check-task-9d6-frontend.mjs`：任务 9D.6 入检出检和工时操作关键文本检查。
- `scripts/check-task-9d7-frontend.mjs`：任务 9D.7 绩效统计关键文本检查。
- `scripts/check-task-9d8-frontend.mjs`：任务 9D.8 生产看板关键文本检查。
- `backend/platform-server/src/main/resources/db/migration/V9__production_board_menu_seed.sql`：任务 9D.8 生产看板菜单种子迁移。
- `scripts/check-task-9d9-frontend.mjs`：任务 9D.9 返工终检关键文本检查。
- `backend/platform-server/src/main/resources/db/migration/V10__rework_final_menu_seed.sql`：任务 9D.9 返工终检菜单种子迁移。
- `scripts/check-task-9d10-frontend.mjs`：任务 9D.10 Multipart 上传关键文本检查。
- `backend/platform-server/src/main/resources/db/migration/V11__file_multipart_upload_metadata.sql`：任务 9D.10 文件 Multipart 元数据迁移。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/AuthStartupValidator.java`：任务 9B.7 生产鉴权启动门禁。
- `backend/platform-server/src/main/resources/application-prod.yml`：任务 9B.7 生产 profile 鉴权配置。
- `backend/platform-server/src/test/java/com/yuri/aiorder/auth/AuthStartupValidatorTests.java`：任务 9B.7 生产门禁回归测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/notification/`：任务 9C.1 WebSocket 通知配置、鉴权拦截器、连接处理器和在线推送服务。
- `backend/platform-server/src/test/java/com/yuri/aiorder/notification/NotificationWebSocketTests.java`：任务 9C.1 WebSocket 在线推送回归测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/notification/NotificationController.java`：任务 9C.2 通知列表、未读数、单条已读和全部已读 REST 接口。
- `backend/platform-server/src/main/java/com/yuri/aiorder/notification/NotificationService.java`：任务 9C.2 当前用户通知隔离、已读状态更新和公开 payload 查询。
- `backend/platform-server/src/test/java/com/yuri/aiorder/notification/NotificationRestTests.java`：任务 9C.2 通知未读/已读和当前用户隔离回归测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/notification/NotificationRedisBroadcaster.java`：任务 9C.3 Redis 通知广播发布器，按开关启用。
- `backend/platform-server/src/main/java/com/yuri/aiorder/notification/NotificationRedisBroadcastListener.java`：任务 9C.3 Redis 广播监听器，忽略本实例消息并触发本机投递。
- `backend/platform-server/src/test/java/com/yuri/aiorder/notification/NotificationBroadcastTests.java`：任务 9C.3 Redis 广播和远端本机投递回归测试。
- `backend/platform-server/src/test/java/com/yuri/aiorder/workflow/runtime/WorkflowRuntimeTests.java`：任务 9B.1 覆盖 WORKER Bearer token 不能派工/跳过节点。
- `backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java`：任务 9B.1 覆盖医生不能读检查记录、CS 不能查绩效、WORKER 只能看本人绩效。
- `frontend/`：Vue3 + Element Plus 前端骨架。
- `compose.yaml`：MySQL、Redis、MinIO 本地基础服务。
- `.env.example`：本地环境变量模板。

## 下一步

建议下一轮继续做真实弱网限速/断网和跨设备浏览器续传验收，或扩展 9D.9 后续的返工关闭 / 责任分类 / 终检发货拦截；同时保留 Task 8 总体 `NOT READY` 结论，直到完整前端业务页面、真实 DeepSeek 和部署交付材料补齐。

- 已完成任务 9D.20 复杂返工影响范围第一增量：后道出检失败返到前道节点时，沿 `order_process_edge` 递归重置返工目标后续 `READY/COMPLETED` 节点为 `PENDING`。
