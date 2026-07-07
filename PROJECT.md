# PROJECT - AI 智能下单与生产协同平台

## 一句话定位

给牙科定制工厂搭建一套「医生在线下单 + 客服审核协同 + 工厂生产流程管理 + 客户进度查询」的一期系统。

医生只能看到外部简化进度；工厂内部工序、员工、工时、入检/出检、返工、绩效等信息必须对医生端和医生端 AI 隔离。

## 当前依据

- 2026-07-07 部署 / 运维本地补强：当前 active goal 为 `GOAL-020`，active task 为 `TASK-021`；本轮新增 `check:deployment-ops-local-hardening` 和 `dry-run:phase-one-release-rollback`，统一校验 GOAL-020 / TASK-021、本地 release / rollback dry-run、备份 / 恢复 dry-run 模板第一段、日志留存 / 监控告警配置模板第一段、compose / env / Nginx / healthcheck 静态检查、9D.81 模板联动和禁止伪造 READY 边界。该阶段只做本地可开发补强，不代表真实服务器、HTTPS、备份恢复、日志留存、监控告警、发布回滚演练、正式客户培训签收、客户签字或真实环境验收完成。`deployment-infrastructure` 和 `operations-manuals` 仍保持 `PARTIAL`，Task 8 仍保持 `NOT_READY`。
- 2026-07-07 AI 生产治理本地补强：当前 active goal 为 `GOAL-019`，active task 为 `TASK-020`；本轮新增 `check:ai-production-governance-local-hardening`，统一校验 GOAL-019 / TASK-020、本地只读治理接口、管理端 AI 治理页、OpenAPI、AI-3 安全矩阵、文档回写和禁止伪造 READY 边界。该阶段只做本地可开发补强：提示词版本只读目录、输出安全边界、预算 / 熔断策略展示、AI-3 安全矩阵、AI-5 默认模板未确认提示和真实 key / webhook 待验状态。真实 DeepSeek key、真实 webhook、客户正式 AI-5 模板、客户签字和真实环境验收仍未完成，Task 8 仍保持 `NOT_READY`。
- 2026-07-07 本地 12 步主链路验收增强：当前 active goal 为 `GOAL-018`，active task 为 `TASK-019`；本轮新增 `check:local-main-chain-acceptance-hardening`，统一校验 GOAL-018 / TASK-019、`smoke:task9d62` 角色边界增强、客户验收记录、Task 8 readiness 边界和禁止伪造 READY 边界。该阶段只补本地固定演示数据验收增强：医生端脱敏、客服端可见性、生产端任务范围、管理端派工 / 转派断言和客户可读证据回写。真实支付 / 物流 / 签章 / key / webhook / 客户签字 / 真实环境验收仍未完成，Task 8 仍保持 `NOT_READY`。
- 2026-07-07 四端前端产品化体验收口：当前 active goal 为 `GOAL-017`，active task 为 `TASK-018`；本轮新增 `check:frontend-productization-closure`，统一校验 GOAL-017 / TASK-018、四端本地产品化入口、统一前端状态表面、`frontend-business-pages` readiness 边界和禁止伪造 READY 边界。该阶段只补本地可开发的前端体验收口：医生端继续保持订单中心八大模块，客服设计稿 / 账单入口复用已有订单详情与配送账单链路，生产 C 类入口升级为本地第一增量汇总 / 表单，管理端补账号 / 角色 / 权限清单入口。`frontend-business-pages` 仍为 `PARTIAL`，不恢复医生文件独立模块，不扩大 C 类为完整闭环，真实支付 / 物流 / 签章 / key / webhook / 客户签字 / 真实环境验收仍未完成，Task 8 仍保持 `NOT_READY`。
- 2026-07-07 权限 / DataScope 生产化补强 B：当前 active goal 为 `GOAL-016`，active task 为 `TASK-017`；本轮新增 `check:auth-datascope-prod-closure-b`，统一校验 GOAL-016 / TASK-017、refresh token 轮换目标测试、后端轮换实现、OpenAPI 语义、入口文档和禁止伪造 READY 边界。该阶段已完成本地 refresh token 轮换补强，但 `auth-datascope-prod` 仍为 `PARTIAL`，完整 Spring Security/JWT、完整 RuoYi DataScope、通用 SQL DataScope、access token 黑名单、多设备会话策略和真实环境验收仍未完成，Task 8 仍保持 `NOT_READY`。
- 2026-07-07 操作手册 / 回滚 / 培训材料本地收口：当前 active goal 为 `GOAL-015`，active task 为 `TASK-016`；本轮新增 `check:operations-rollback-training-closure`，统一校验 GOAL-015 / TASK-016、操作手册、故障处理清单、发布回滚手册本地模板、培训材料 / 签收模板、交付材料索引、`operations-manuals` readiness 边界和禁止伪造 READY 边界。该阶段已完成本地收口，但 `operations-manuals` 仍为 `PARTIAL`，真实发布回滚演练、备份恢复演练、日志留存、监控告警、正式客户培训签收、客户 / PM 签字和真实环境验收仍未完成，Task 8 仍保持 `NOT_READY`。
- 2026-07-07 WebSocket / 通知生产 readiness 收口：当前 active goal 为 `GOAL-014`，active task 为 `TASK-015`；本轮新增 `check:websocket-notification-readiness-closure`，统一校验 WebSocket / 通知生产 readiness 收口、真实环境验收记录模板、9D.76 通知网关证据、RepoFrame 指针和禁止伪造 READY 边界。该阶段已完成本地收口，但 `websocket-notification-prod` 仍为 `PARTIAL`，真实双实例 Redis、Nginx HTTPS、生产 webhook、监控告警、客户 / PM 签字和真实环境验收仍未完成，Task 8 仍保持 `NOT_READY`。
- 2026-07-07 四端业务页面与客户验收 smoke 收口：当前 active goal 为 `GOAL-013`，active task 为 `TASK-014`；本轮新增 `check:frontend-customer-smoke-closure`，统一校验四端业务页面证据、12 步 smoke、客户验收版 PASS/FAIL 文档、操作手册、RepoFrame 指针和禁止伪造 READY 边界。`frontend-business-pages` 仍为 `PARTIAL`，`customer-pm-confirmations` 仍为 `BLOCKED`，Task 8 仍保持 `NOT_READY`。
- 2026-07-07 权限 / DataScope 生产化收口第一段：当前 active goal 为 `GOAL-012`，active task 为 `TASK-013`；本轮补严格权限模式目标测试、roles-only 权限注解清零、V36 权限码种子和 `check:auth-datascope-prod-closure`。Task 8 仍保持 `NOT_READY`。
- 2026-07-07 客户 / PM 确认项与真实环境 AI 验收收口：`GOAL-011` / `TASK-012` 已完成为外部确认闸门；真实 key、webhook、客户签字和真实环境验收仍未完成。
- 2026-07-07 RepoFrame hydration 校准：`GOAL-003` / `TASK-004` 已完成，只作为历史校准证据保留；当前不重新初始化项目，不改变一期业务范围。
- 2026-07 最新 PRD V2.0 / 2026-07-04：最新一期产品范围边界；源文件名仍含 `PRD_V1.0`，正文末尾存在 `V1.1` 字样，后续以正文版本 `V2.0` 为准，差异基线见 `docs/acceptance/prd-v2-gap-matrix.md`。
- 2026-07 新版 TRD V1.0.1：最新技术执行口径。
- 2026-07 新版 API 规范：最新业务接口口径，不直接覆盖仓库当前稳定契约。
- 生产流程文档：9 类牙科产品工艺路线来源。
- OpenAPI YAML：接口契约，稳定版位于 `docs/api/openapi.yaml`，后续按“新版 API 业务口径 + 当前已实现增量”合并维护。

## 目标用户

- 医生 / 诊所账号：下单、上传文件、查看外部状态、确认设计稿、查看账单物流、确认收货、使用客户订单助手。
- 客服 / CS：订单初审、AI 翻译校对、资料缺失检查、客户档案与偏好、消息审核、设计稿审核、账单上传、物流录入、客服查询助手。
- 技工 / 生产人员：生产数据审核、我的任务池、入检、工序执行、工时计时、出检、返工、终检、设计稿上传、生产备注助手。
- 超级管理员：用户角色、诊所账号、9 条工序链只读查看、订单工序实例查看、派工、转派、全量绩效与审计。

## 一期必须交付

- 账号、登录、JWT / Refresh Token、RBAC 权限。
- 医生端在线下单、动态表单、草稿/补资料、文件上传、订单列表/详情、外部进度、设计稿确认、基础患者管理、基础支付流水 / 账单查看、账户设置、线上沟通、通知中心、AI 订单助手。
- 客服端订单初审、AI 翻译、资料缺失检查、客户档案与偏好、产品参数 / 价格体系维护、订单消息审核、设计稿审核、账单 / 人工支付流水、物流录入 / 异常跟进、客服查询助手；外协管理为一期选做，需 PM 确认是否纳入硬交付。
- 生产端数据审核、工序任务池、入检、出检、返工、工时、绩效、终检、人员档案 / 工作量看板、专项质量管理；设备 / 物料 / 安环 / 成本 / 奖惩按 2026-07-06 基准只保留 C 类入口、基础台账、基础登记、状态更新或架构预留。
- 管理端 9 条工序链只读查看、订单工序实例查看、派工、转派、审计。
- 5 个 AI 智能体：翻译助手、客服查询助手、客户订单助手、资料缺失助手、生产备注助手。
- MinIO 私有桶、短时效签名 URL、WebSocket 通知、Docker 部署。
- 既有技术红线：订单外部投影、AI-3 安全读模型、文件服务端鉴权后签名、AI 工具白名单、通知先落库再推送、权限/文件/AI/状态专项测试。

## 一期明确不做

- 不做后台动态编辑工序链模板。
- 不做工序链拖拽编辑器。
- 不做物流平台 API 自动同步，只预留字段。
- 不做 AI 自动审核、自动驳回、自动发送、自动医疗判断。
- 不用复杂 BPM 引擎替代牙科生产工序流转；生产工序引擎自研。
- 不默认部署 Tus/tusd 独立上传服务；使用 Uppy + MinIO 预签名/Multipart。
- 不引入 Kafka/RabbitMQ/Redis Streams 作为一期消息事实来源；一期使用数据库通知表 + WebSocket。
- 不做复杂多 Agent 自动编排或 AI 自动决策；AI 只做辅助、草稿和查询。
- 不把真实支付网关、电子发票、月结账期自动归集、真实物流 API、STL 三维在线浏览器、语音下单、高级患者管理、AI 风险预警 / 历史方案推荐、SaaS 多租户、AI 报价、AI 获客或售后回访纳入一期 READY 硬阻塞。

## P0 主业务链路

医生下单 -> 客服审核/AI 翻译 -> 生产审核 -> 实例化工序链 -> 管理员派工 -> 技工入检 -> 工时计时 -> 出检 -> 返工或流转下一节点 -> 终检 -> 客服录入物流 -> 医生查看物流 -> 医生确认收货。

## 关键技术边界

- 订单必须维护 `internal_status` 和 `external_status` 两套状态。
- 登录当前采用短时效 HMAC Bearer access token + 可吊销并轮换的 refresh token；refresh token 只保存 hash，refresh 成功后旧 refresh token 立即吊销并返回新 refresh token，logout 吊销当前 refresh token。后续仍需确认 access token 黑名单、多设备会话策略或完整 Spring Security/JWT 策略。
- 医生端只能使用 `external_status`。
- 状态更新必须统一封装在 `OrderStatusService`。
- 所有内部状态和工序节点状态变化后，由 `OrderStatusProjector` 统一刷新 `external_status` 与 `order_external_projection`。
- 医生端订单详情、医生端 AI、医生端 WebSocket 必须读取 `order_external_projection` 或医生端安全读模型。
- 工艺流采用「定义表 + 边表 + 订单快照表」表达 DAG、分支、并联、可选节点。
- Workflow Runtime 内部保留 `READY` 作为可执行技术状态；对外业务文案和 API 评审可映射为 `PENDING/待处理`。
- 生产节点默认强制入检/出检；除非客户给出明确免检清单，否则不跳过检查流程。
- 生产审核通过时生成订单工序实例，订单实例必须和后续模板修改解耦。
- 所有 AI 智能体使用 LangChain + DeepSeek 实现；9D.94 已补后端 LangChain4j + DeepSeek 底座第一增量，真实 key / 生产验收、流式输出、RAG 或复杂 tool calling 仍需后续按 PRD 和客户确认单独拆分。AI 服务不得直连 MySQL。
- 文件上传默认 Uppy + MinIO 私有桶 + 服务端预签名参数；大文件按阈值启用 S3 Multipart，上传完成后必须调用后端 complete 并校验对象存在、大小、类型、etag。
- 动态表单后台 CRUD 第一增量采用 ADMIN `form:manage` 管理权限；医生端只读 `ACTIVE` 字段，字段停用采用 `status=INACTIVE` 逻辑停用，不物理删除历史配置。
- 设计稿多文件第一增量保留 `design_draft.file_id` 作为兼容主文件，同时使用 `design_draft_file` 关联表保存同一版本的多个文件。
- WebSocket 推送不是事实来源；通知事件先写 `notification_event`，再在线推送并通过 `user_notification` 做未读补偿。

## 验收红线

- 医生账号抓包时不能出现 `internal_status`、`node_instance_id`、`process_name`、`assigned_username`、`check_record`、`work_log`、`performance`、`rework` 等内部字段。
- 跨诊所访问必须返回 403 或空数据。
- WORKER 只能看本人任务和本人绩效。
- AI-3 不能回答内部工序、员工、返工、工时、绩效等信息。
- 文件预览和下载必须先做业务权限校验，再生成签名 URL，并写审计日志。
- 医生端 WebSocket payload 不能包含内部工序、任务、返工、工时、绩效事件。
- 并联分支未全部完成时，汇合节点不能进入 READY。
- 未入检不能开工；未完工不能出检；出检不通过必须进入返工并保留历史。
- 工时开始/暂停/继续/完成必须幂等，重复点击不能重复记录。

## 未确认问题

- Multipart 阈值、文件大小、文件类型、文件数量限制。
- 动态表单字段清单是否已有客户最终确认版。
- 是否允许 ADMIN 调整进行中订单节点；默认不允许增删节点，只允许员工绑定/转派。
- 贴面路线、种植基台路线等分支是否完全由生产审核时补充 `branch_params`；默认医生端不感知内部路线。
- 设计稿医生确认是否阻塞后续生产节点。
- AI-5 生产备注模板何时由客户提供；未提供前仅做通用规范化草稿。
- 标准工时、预计发货算法、付款状态仍需确认。

## 下一阶段优先级

1. 完成 RepoFrame 文档校准与验收入口收口：GOAL-003 / TASK-004。
2. 另起 RepoFrame task 继续 A/B 类一期范围对齐第二段：客服统计、生产统计、内返 / 外返和账单 / 物流人工状态的数据闭环。
3. 真实客户 / PM 确认项与真实环境 AI 验收：只在真实模板、真实 key、生产 webhook、真实环境和签字具备后关闭。
4. 部署 / 通知 / 文件真实环境验收：继续保持测试环境与正式环境隔离，不提交真实密钥。
