# DECISIONS

## D-077 AI 预算告警先落为可追踪治理审计

状态：已确认。

决策：

- 真实模型成功调用导致近 24 小时估算成本从低于预算阈值变为达到或超过阈值时，写入 `ai_audit_log.result_status=AI_BUDGET_EXCEEDED`。
- `AI_BUDGET_EXCEEDED` 使用 `ai-governance-budget-exceeded` 虚拟模型名，估算成本为 0，避免告警审计重复计费。
- `/ai/governance/summary` 新增 `budget_alert_count` 和 `latest_budget_alert_at`，供内部端追踪预算跨线告警。
- 本增量不拦截 AI 请求、不发送外部通知、不自动降级模型。

影响：

- 9D.32 把预算阈值从只读标记推进到可审计的告警触发点。
- 后续仍需预算通知推送、分角色/分模型预算、熔断/降级、提示词版本、输出防护和真实 key 环境联调记录。

## D-076 AI 预算阈值先作为治理摘要标记

状态：已确认。

决策：

- 新增 `AI_DAILY_BUDGET_MICROUSD` / `app.ai.daily-budget-microusd`，默认 0 表示不启用预算阈值。
- 预算阈值先作用于 `/ai/governance/summary`，返回 `daily_budget_microusd` 和 `budget_exceeded`。
- `budget_exceeded` 仅表示近 24 小时估算成本达到或超过阈值，不拦截请求、不发送通知、不自动降级模型。
- 预算金额继续使用微美元整数，沿用 9D.27 的可配置 token 成本估算，不内置供应商实时价格。

影响：

- 9D.31 把生产级 AI 治理从“能看成本摘要”推进到“能看到预算阈值是否触发”的第一增量。
- 后续仍需预算告警推送、分角色/分模型预算、熔断/降级、提示词版本、输出防护和真实 key 环境联调记录。

## D-075 AI 治理先提供审计摘要只读入口

状态：已确认。

决策：

- 新增 `GET /ai/governance/summary`，供 CS / ADMIN 查看近 24 小时 AI 调用治理摘要。
- 摘要直接基于 `ai_audit_log` 聚合，不新增汇总表或后台配置项。
- 第一增量只返回成功、安全拒绝、限流、模型失败、估算成本和最近模型失败时间。
- 接口不返回 prompt 原文、不返回供应商错误正文、不触发告警或熔断动作。

影响：

- 9D.30 把生产级 AI 治理从“单次审计可追溯”推进到“内部人员能看到最小失败/成本摘要”。
- 后续仍需预算阈值、告警推送、熔断/降级、提示词版本、输出防护和真实 key 环境联调记录。

## D-074 真实 AI 模型失败必须可审计且对外返回受控错误

状态：已确认。

决策：

- 真实模型重试耗尽或遇到不可恢复异常时，接口返回 503。
- 后端使用独立事务写入 `ai_audit_log.result_status=AI_MODEL_FAILED`。
- 对外错误信息保持通用，不暴露 DeepSeek 或上游供应商返回的原始错误正文。

影响：

- 9D.29 只完成失败审计第一增量，不等于熔断、告警或降级完成。
- 后续仍需补失败重试次数统计、熔断策略、降级告警和真实 key 环境联调记录。

## D-073 真实 AI 模型调用先补短暂失败重试

状态：已确认。

决策：

- 真实模型调用在 5xx 或连接类异常时按 `AI_MODEL_MAX_RETRIES` 做有限重试。
- 默认重试 1 次，避免本地/CI 因真实模型治理配置产生额外外部依赖。
- 重试成功后只写一条 `SUCCESS` 审计；失败重试审计、熔断、告警和降级留到后续增量。

影响：

- 9D.28 只提升短暂 5xx/网络抖动容错，不等于生产级 AI 治理完成。
- 真实 key 联调、提示词版本、输出防护、预算告警、熔断和降级仍是 Task 8 上线缺口。

## D-001 一期采用 9 条预定义工序链

状态：已确认。

依据：PRD/TRD 明确一期 9 条工序链由开发人员初始化到数据库，不提供后台动态编辑。

决策：

- 使用 `workflow_chain`、`workflow_node`、`workflow_edge` 表保存定义层。
- 使用 `order_process_instance`、`order_process_node`、`order_process_edge` 保存订单快照层。
- 后台只做只读查看、派工、转派，不做拖拽编辑器。

影响：

- M1 必须先产出 9 链初始化脚本。
- 后续修改模板必须通过新版本和迁移脚本，不直接覆盖历史。

## D-002 医生端必须使用外部状态和脱敏 VO

状态：已确认。

决策：

- 订单维护 `internal_status` 和 `external_status`。
- 医生端只展示 `external_status`。
- 医生端响应使用 `OrderDoctorVO`。
- 内部端响应使用 `OrderInternalDTO`。
- 医生端和 AI-3 使用 `order_external_projection` / `DoctorOrderAssistantReadModel`，只能包含外部状态、物流、账单状态和医生端可见消息。

影响：

- 脱敏不是前端隐藏按钮，而是服务端查询层、DTO/VO、AI 上下文共同隔离。
- 医生端不得访问 process-instance、check-records、performance 等内部接口。
- 医生端 WebSocket 和文件访问也必须走同一外部投影/权限边界。

## D-003 AI 服务不得直连业务数据库

状态：已确认。

决策：

- Spring Boot 主服务负责鉴权、数据范围过滤、查询、脱敏、审计。
- AI Service 只接收过滤后的上下文和用户问题。
- 所有 AI 调用写 `ai_audit_log`。

影响：

- AI 接入应晚于权限和上下文服务设计。
- 医生端 AI 输出必须做敏感词/字段防护。

## D-004 状态更新统一走 OrderStatusService

状态：已确认。

决策：

- 不允许 Controller 直接写订单状态字段。
- 状态变更和业务操作在同一事务中完成。
- 所有状态变更写 `order_status_history`。

影响：

- 客服审核、生产审核、工序实例化、终检、发货、确认收货都必须走统一状态服务。

## D-005 文件访问先校验业务权限再签名

状态：已确认。

决策：

- MinIO 使用私有桶。
- 前端不直接拿 object_key。
- 每次预览/下载先执行 `FileAccessPolicy`。
- 预览 URL 默认 15 分钟，下载 URL 默认 2 小时。
- 文件上传、预览、下载写审计日志。

影响：

- 文件模块不能只做简单上传；必须和订单、消息、设计稿、账单的可见性绑定。

## D-006 待确认决策

状态：待 PM/客户确认。

- Multipart 阈值、文件大小、文件类型、文件数量限制。
- 动态表单字段清单是否已有客户最终确认版。
- 是否允许 ADMIN 调整进行中订单节点；默认不允许增删节点，只允许员工绑定/转派。
- 贴面路线、种植基台路线等分支是否完全由生产审核时补充 `branch_params`；默认医生端不感知内部路线。
- 设计稿医生确认是否阻塞后续生产。
- AI-5 生产备注模板。
- 标准工时、预计发货算法、付款状态。

## D-007 稳定 OpenAPI 契约路径

状态：已确认。

决策：

- 以 `docs/api/openapi.yaml` 作为仓库内稳定 OpenAPI 契约来源。
- `.local-context/API规范_OpenAPI3.0.yaml` 只作为本地源材料，不作为后续联调入口。
- 任务 0 仅做契约修复与冻结，不生成业务代码，不初始化前后端工程。

影响：

- 后续前后端联调、SDK 生成或接口评审均优先读取 `docs/api/openapi.yaml`。
- 修改接口契约时必须先更新该文件，并重新运行 README 中记录的解析和模块覆盖检查。

## D-008 采用 TRD V1.1 作为开发计划修订依据

状态：已确认。

决策：

- 以项目资料包中的 `TRD_AI智能下单与生产协同平台_一期_V1.1_深度研究优化版.docx` 作为当前任务拆解和技术口径的最新 TRD。
- PRD 一期范围优先于深度研究建议；深度研究中属于实现方式、数据一致性、安全边界、测试验收的内容纳入一期，属于新增功能或复杂平台的内容只做二期规划。
- 新增「任务 0.1：TRD V1.1 对齐与开发计划冻结」，在继续初始化工程前先对齐项目计划、决策和验收矩阵。

影响：

- 原任务 1-5 需要按 V1.1 重新拆分，不直接按旧计划进入代码实现。
- 文件上传、AI 适配层、可选节点、质检/发货权限归属等已有默认执行口径，只有阈值、模板、字段清单等细节继续待确认。

## D-009 一期采用模块化单体和自研轻量 DAG

状态：已确认。

决策：

- 一期使用 Spring Boot / RuoYi-Vue-Pro 模块化单体承载核心业务，不拆订单、工序、工时、返工、状态投影为独立微服务。
- 工艺流运行时采用自研轻量 DAG，使用 `workflow_edge` / `order_process_edge` 表达前后置、分支、并联汇合和可选节点。
- Flowable、Camunda、LiteFlow 不作为一期主流程引擎。

影响：

- 数据库模型必须包含定义层边表与订单实例边表。
- Workflow Runtime 必须实现节点激活、并联汇合、可选节点跳过、返工影响范围和幂等控制。

## D-010 文件上传默认 Uppy + MinIO 预签名/Multipart

状态：已确认。

决策：

- 一期文件上传默认使用 Uppy + MinIO 私有桶 + 后端预签名参数，按文件大小阈值启用 S3 Multipart 或预留 Multipart。
- 不默认部署 Tus/tusd 独立服务，不做秒传、文件去重、冷热归档。
- 前端上传完成后必须调用后端 complete；后端通过 `statObject` 校验对象存在、大小、类型、etag 后写入完成状态。

影响：

- 文件模块不再因 tusd vs Multipart 阻塞。
- 任务 4 应覆盖 `file_resource.upload_status`、`FileAccessPolicy`、`file_access_audit` 和上传完成确认。

## D-011 AI 默认以后端 ai-gateway 模块承载

状态：已确认。

决策：

- 一期 AI 适配层默认放在后端 `ai-gateway` 模块中，负责上下文构造、工具白名单、模型调用、输出防护和审计。
- 如 PM 指定独立 LangChain 服务，再单独容器化部署，但 AI 服务仍不得直连业务库。
- AI-3 只能读取 `DoctorOrderAssistantReadModel`，不得读取工序、员工、入检/出检、工时、绩效、返工、责任分类。

影响：

- AI 接入不能晚于权限和安全读模型设计。
- 5 个 AI 智能体必须有工具白名单和 `ai_audit_log`。

## D-012 通知先落库再 WebSocket 推送

状态：已确认。

决策：

- `notification_event` 是通知事实来源。
- WebSocket 只负责在线推送，`user_notification` 用于未读补偿。
- 医生端只接收公开事件，不接收内部任务、返工、工时、绩效事件。

影响：

- 消息、设计稿、账单物流、状态变更都应写通知事件。
- WebSocket 验收必须覆盖医生端 payload 脱敏。

## D-013 任务 1 后端构建路线

状态：已确认并执行。

背景：

- 任务 1 的验收标准要求本地能启动前后端，并能登录至少 ADMIN 测试账号。
- 当前本机没有 Java Runtime、Maven、Gradle。
- 用户选择路线 A。
- 当前本机 JDK 21、Maven、Node/npm/pnpm、Docker CLI 和 Colima 可用。
- Colima 已启动，Docker Compose 基础服务可运行。

可选路线：

- 路线 A：使用本机 JDK 21 + Maven 启动 Spring Boot 骨架，Docker/Colima 承载 MySQL、Redis、MinIO。

影响：

- 项目命令通过 `scripts/with-jdk21.sh` 显式使用 JDK 21，避免 Maven 使用 Homebrew 额外安装的 OpenJDK 26。
- 任务 2 可以基于已可编译后端骨架继续设计数据库迁移。

## D-014 任务 1 推荐后端基线

状态：已确认。

决策建议：

- 后端优先按 RuoYi-Vue-Pro `master-jdk17` 系列的 JDK/Spring Boot 口径建设。
- JDK 优先使用 21；如兼容性需要，可退到 17。
- Maven 版本不低于 `3.5.4`。

依据：

- RuoYi-Vue-Pro 官方仓库说明 `master-jdk17` 分支支持 JDK 17/21 和 Spring Boot 3.5。
- RuoYi-Vue-Pro 官方快速启动文档要求 Maven 大于等于 `3.5.4`。
- 当前项目是新建一期系统，没有历史 JDK 8 包袱；采用 JDK 17/21 线更利于后续 Spring Boot 3.x 生态和安全维护。

影响：

- 如果用户确认该基线，任务 1 可直接按路线 A 安装/使用 JDK + Maven，或按路线 B 容器化 Maven 构建。
- 如果用户要求兼容 JDK 8，则需要重新评估 RuoYi-Vue-Pro 分支、依赖版本和后续维护成本。

## D-015 数据库迁移采用 Flyway SQL

状态：已确认并执行。

决策：

- 使用 Flyway SQL 管理一期数据库基线迁移。
- 迁移文件放在 `backend/platform-server/src/main/resources/db/migration/`。
- `platform-server` 负责启动时执行迁移，默认连接本地 Docker Compose MySQL。

影响：

- 本地后端测试和启动前需要先启动 MySQL：`npm run compose:up`。
- 后续表结构和种子数据变更通过新增 Flyway 版本，不直接改已执行迁移。
- 当前 MySQL 8.4 会触发 Flyway 兼容性 warning，但任务 2 迁移已在本机通过。

## D-016 9 条工序链种子数据以生产流程原文为准

状态：已确认并执行。

决策：

- 9 条工序链种子数据以 `.local-context/生产流程.docx` 为准，TRD V1.1 的摘要表只做校验。
- `standard_duration` 暂无真实来源，先允许为空，不编造标准工时。
- 取模路线写入 `branch_group=intake`、`branch_key=IMPRESSION/SCAN`。
- 种植基台、贴面路线等内部路线写入独立 `branch_group`，后续由生产审核补充 `branch_params` 决定。
- 源文档里的孤立重复箭头、贴面/隐形流程排版不连续，按源文档节点顺序标准化为顺序边；不在任务 2 中发明额外节点。

影响：

- Workflow Definition 只读查询可以先验收 9 条链、节点、边、分支和可选节点。
- Workflow Runtime 实例化时需要基于 `branch_params` 过滤不适用分支。
- 如客户后续修订生产流程，应通过新增链版本和迁移脚本发布。

## D-017 任务 2 只实现最小只读 Workflow API

状态：已确认并执行。

决策：

- 本轮只实现 `GET /workflow-chains` 和 `GET /workflow-chains/{chainId}/nodes`。
- 返回字段保持 `docs/api/openapi.yaml` 已冻结契约，不扩展公开 DTO。
- 不实现工序实例化、派工、转派、工时、入检/出检、返工等运行时能力。

影响：

- 任务 2 可以完成“9 条工序链可查询”的验收。
- 任务 3 继续做状态投影和医生端脱敏，任务 5A 再进入 Workflow Runtime。

## D-018 任务 3 状态投影基础边界

状态：已确认并执行。

决策：

- `internal_status` 使用 `InternalOrderStatus` 枚举，`external_status` 使用 OpenAPI 已冻结的 7 个医生端状态。
- `external_status` 不接受前端直接传值，由 `OrderStatusService` 调用 `OrderStatusProjector` 统一计算、写 `orders`、写 `order_status_history`、刷新 `order_external_projection`。
- `DRAFT` 不作为医生端公开进度；提交后的默认公开状态为 `PENDING_REVIEW`。
- `PROCESS_INSTANCE_CREATED` 和 `ASSIGNED` 在任务 3 暂按 `PRODUCING` 投影；后续 Workflow Runtime 可根据首个有效节点阶段细化为 `DESIGNING` 或 `PRODUCING`。

影响：

- 后续客服审核、生产审核、发货、确认收货等业务操作必须复用 `OrderStatusService`。
- 后续不得在 Controller 或前端直接写 `external_status`。
- 任务 5A 接入工序实例化时，只需要扩展投影判断，不应绕开当前服务。

## D-019 任务 3 医生端与 AI-3 读取安全模型

状态：已确认并执行。

决策：

- 医生端详情使用 `DoctorOrderVO`，只返回订单号、产品类型、`external_status`、医生可见 `form_data`、公开提示、账单/物流公开字段。
- 内部角色详情使用 `OrderInternalDTO`，内部字段只在内部 DTO 出现。
- AI-3 使用 `DoctorOrderAssistantReadModel`，只读外部状态、账单物流、医生端可见消息摘要；当前回答为 deterministic 安全占位，不接真实模型。
- 医生访问 `/orders/{orderId}/process-instance` 返回 403；内部角色完整工序实例留到 Workflow Runtime。
- 当前 `X-Bootstrap-*` 请求头仅用于本地烟测角色/数据范围，正式权限接入后由 RuoYi RBAC/DataScope 替换。

影响：

- 后续接入 DeepSeek/LangChain 时，AI-3 只能拿 `DoctorOrderAssistantReadModel`，不得查询工序、员工、入检/出检、工时、绩效、返工。
- 文件、WebSocket、消息、设计稿等医生端通道必须复用同一脱敏口径。

## D-020 任务 4 文件上传与访问权限基础

状态：已确认并执行。

决策：

- 后端接入 MinIO Java SDK，使用私有桶和短时效预签名 URL，不把永久 `object_key` 返回给前端。
- `POST /files/upload-token` 创建 `file_resource` 的 `PENDING` 记录，并返回 `file_id`、预签名 PUT URL 和过期秒数。
- `POST /files/{fileId}/complete` 通过 MinIO `statObject` 校验对象存在、大小、content type，并保存 etag 到 `checksum`，再把 `upload_status` 置为 `COMPLETED`。
- `GET /files/{fileId}/preview-url` 和 `GET /files/{fileId}/download-url` 每次先执行文件访问策略，再返回短时效 GET URL。
- 医生只能访问本人/本诊所订单下，且 `visibility` 为 `DOCTOR`、`DOCTOR_CS`、`ALL` 的已完成文件；内部入检/出检等 `INTERNAL` 文件默认拒绝医生端访问。
- 上传 token、complete、preview、download 和拒绝访问均写 `file_access_audit`。
- 当前默认：上传/预览 URL 15 分钟，下载 URL 2 小时，最大文件 200MB；Multipart 分片完整流程留到文件限制最终确认后实现。

影响：

- 文件模块已具备后端最小验收链路，后续前端 Uppy 可直接调用 token/complete/签名 URL 接口。
- 正式 RBAC/DataScope 接入后，当前 `X-Bootstrap-*` 头应替换为真实登录态，但医生端文件可见性边界不能放宽。
- `docs/api/openapi.yaml` 后续需要补齐 complete、签名 URL 和错误响应契约。

## D-021 任务 5A Workflow Runtime 基础状态机

状态：已确认并执行。

决策：

- 生产端审核通过使用 `POST /orders/{orderId}/production-review`，传入 `chain_id`、`intake_branch` 和 `branch_params`，触发工序实例化。
- 实例化时从 `workflow_node` / `workflow_edge` 复制快照到 `order_process_node` / `order_process_edge`；后续模板改名或改边不影响历史订单实例。
- `branch_group` / `branch_key` 节点只有在 `branch_params` 或 `intake_branch` 匹配时生成；条件不满足的分支节点默认不生成。
- 节点状态采用 `PENDING`、`READY`、`IN_PROGRESS`、`COMPLETED`、`SKIPPED`；无前置节点初始进入 `READY`。
- DAG 激活规则：候选节点的全部前置节点均为 `COMPLETED` 或 `SKIPPED` 时，才从 `PENDING` 进入 `READY`。
- 可选节点允许人工跳过，跳过时写 `skipped_at` 和 `skip_reason`；非可选节点不允许跳过。
- 任务 5A 只实现工序实例化、派工、转派、任务池和节点状态流转；入检/出检、返工、工时、绩效留到任务 5B。

影响：

- 后续入检/出检和工时模块必须基于 `order_process_node.node_status`，不能绕开 Workflow Runtime 直接改状态。
- 医生端仍不得访问 `process-instance`，AI-3 也不能读取工序实例。
- `docs/api/openapi.yaml` 后续需要补齐节点 start/complete/skip 等任务 5A 新增运行时接口。

## D-022 任务 5B 入检出检、返工、工时绩效执行规则

状态：已确认并执行。

决策：

- `need_in_check=1` 的节点必须先存在 `check_record.check_type='IN'` 且 `result='PASS'` 的记录，才能从 `READY` 开工。
- 出检使用 `check_record.check_type='OUT'`；节点未 `COMPLETED` 时不允许提交出检。
- 出检失败时写入 `rework_record`，并把 `rework_to_node_id` 指向的目标节点重新置为 `READY`；历史 `check_record`、`rework_record`、`work_log` 不删除、不覆盖。
- 工时记录由服务端创建和计算，暂停段写入 `work_log_pause_segment`；完成工时时用服务端时间扣除暂停时长，客户端不传有效工时。
- 同一节点返工后再次开工会生成新的 `work_log`；已完成的旧工时保留为历史。
- WORKER 查询绩效时强制使用当前登录用户，忽略请求里的 `user_id`；ADMIN 可按 `user_id` 查询指定员工。
- 任务 5B 只实现最小后端执行链路，不扩展新的公开 OpenAPI 契约；后续接口二次评审统一补齐 DTO、4xx 响应和 operationId。

影响：

- 后续前端质检和工时页面必须按“节点状态 + 入检/出检记录 + 工时记录”组合驱动，不得直接写节点状态或工时字段。
- 返工影响范围目前是指定目标节点重新进入 `READY`；更复杂的 DAG 回滚、责任分类和返工原因字典留到业务细化后新增。
- 正式 RBAC/DataScope 接入后必须保留 WORKER 只能看本人绩效、医生端不得访问检查/返工/工时/绩效的边界。

## D-023 任务 6 协同事件先落库，WebSocket 后接入

状态：已确认并执行。

决策：

- 消息、设计稿、账单上传、物流发货先写 `notification_event` 作为通知事实来源，并按明确用户写 `user_notification` 做未读补偿。
- 本轮任务 6 不引入真实 WebSocket 长连接和 Redis 在线会话；在线推送后续从 `notification_event` 派发，不改变事实来源。
- WORKER 发送给医生可见范围的消息必须先进入 `PENDING_REVIEW`，客服审核通过或编辑通过后医生端才可见。
- 医生端消息列表只返回 `DIRECT` / `APPROVED` 且可见范围包含医生的消息；内部生产备注、内部任务、返工、工时、绩效事件不进入医生端接口。
- 设计稿上传后先进入 `PENDING_CS_REVIEW`；医生端只可见 `PENDING_DOCTOR_CONFIRM`、`DOCTOR_CONFIRMED`、`DOCTOR_REJECTED` 的设计稿。
- 物流发货必须通过 `OrderStatusService` 更新订单状态为 `SHIPPED`，确保医生端外部投影和状态历史同步。
- 当前数据库 `design_draft` 仍是一条设计稿绑定单个 `file_id`；OpenAPI 请求中的 `file_ids` 本轮先取首个文件，完整多文件设计稿需后续迁移扩展。

影响：

- 后续 WebSocket 模块只负责读取/推送/标记通知，不应绕开 `notification_event`。
- 前端消息、设计稿、账单物流页面必须复用当前医生端脱敏边界。
- 后续接口二次评审需要补齐任务 6 的 DTO、错误响应、设计稿多文件能力和通知读取/已读接口。

## D-024 任务 7 AI Gateway 先做安全占位与审计闭环

状态：已确认并执行。

决策：

- 本轮 AI Gateway 不接入真实 DeepSeek API，不写入任何订单字段，不自动审核、自动驳回、自动发送、自动下发生产指令。
- 5 个 AI 智能体先按 OpenAPI 既有端点实现 deterministic 安全占位：`/ai/translate`、`/ai/cs-query`、`/ai/order-query`、`/ai/check-missing`、`/ai/production-note`。
- 每个智能体固定角色白名单和上下文类型；成功回答和安全拒绝均写入 `ai_audit_log`，`model_name` 暂记为 `deterministic-placeholder`。
- AI-3 必须只调用 `DoctorOrderAssistantReadModel`；当医生询问内部工序、员工、入检/出检、返工、工时、绩效、责任等问题时，返回安全拒绝并只补充公开状态、账单、物流和公开消息。
- AI-4 资料缺失检查基于 `form_field_config.required_flag` 和订单 `form_data` 生成缺失项清单，只返回建议，不执行退回或驳回。
- AI-1 翻译、AI-2 客服查询、AI-5 生产备注均只返回草稿或查询结果，必须由人工确认后再进入正式业务操作。

影响：

- 后续接入真实模型时只能替换模型适配层，不能绕过当前角色白名单、上下文构造、输出防护和 `ai_audit_log`。
- AI-3 的安全边界由后端查询层和 service 共同保证，不能依赖前端 prompt 或页面隐藏。
- 后续需要补充真实模型配置、提示词版本、限流/重试/成本统计、输出校验、流式响应和更完整的 AI-2/AI-5 上下文模板。

## D-025 任务 8A 先做客观 Readiness Audit

状态：已确认并执行。

决策：

- 任务 8 拆成先审计、再补缺口；本轮 8A 只冻结验收矩阵、回归记录和上线缺口清单。
- 验收项统一使用 `PASS / PARTIAL / BLOCKED / NOT_STARTED` 标注，不把后端最小链路等同于产品级上线通过。
- `PASS` 必须有当前自动化测试和 HTTP/SQL smoke 或既有明确 smoke 记录支撑；只有后端最小链路但缺前端、正式 RBAC/WebSocket/真实模型/完整契约时标 `PARTIAL`。
- 需要客户/PM 或外部环境确认的项目标 `BLOCKED`；尚未实现的产品能力标 `NOT_STARTED`。
- 本轮不补业务功能，不接正式 RBAC/DataScope、WebSocket、前端页面、DeepSeek 或生产部署配置。

影响：

- 后续上线推进必须先清理 Task 8A 文档中的 `PARTIAL`、`BLOCKED`、`NOT_STARTED` 项，或形成客户/PM 签字豁免。
- `docs/acceptance/task-8-acceptance-matrix.md` 成为后续测试工程师和修复任务拆分的入口。
- `docs/deployment/readiness-checklist.md` 成为正式上线前的硬门禁清单。

## D-026 任务 8B OpenAPI 二次契约按当前后端基线冻结

状态：已确认并执行。

决策：

- `docs/api/openapi.yaml` 从任务 0 的“可解析稳定契约”升级为任务 8B 的“当前后端基线契约”。
- 本轮补齐任务 4-7 已实现接口的契约缺口：文件 `complete`、工序节点 `start` / `complete` / `skip`、AI、协同、工时、质检、运行时 DTO/schema。
- 8B 当时的 61 个 operation 全部拥有唯一 `operationId`，所有 operation 统一包含 `400 / 401 / 403 / 404 / 409 / 503 / default` 错误响应引用；9C.2 后当前契约已更新为 65 个 operation。
- `npm run check:openapi` 升级为三段检查：自定义契约检查、Swagger validate、Redocly lint；Redocly warning 清零作为 8B 验收要求。
- 当前契约仍描述正式 Bearer/JWT 形态；`X-Bootstrap-*` 只保留为本地烟测实现细节，不进入生产契约。

影响：

- 后续新增或变更后端接口时，必须同步更新 `docs/api/openapi.yaml` 并确保 `npm run check:openapi` 通过。
- 任务 8 的 OpenAPI 硬缺口已关闭；后续上线缺口优先转向正式 RBAC/DataScope、前端业务页面、WebSocket、真实 DeepSeek 和部署/操作手册。

## D-027 任务 9A 先落服务端签发 Bearer 身份层

状态：已确认并执行。

决策：

- 在正式 RuoYi-Vue-Pro RBAC/DataScope 完整接入前，先把后端身份来源从“任意 `X-Bootstrap-*` header”推进到“服务端签发 HMAC Bearer token”。
- 新增 `BearerTokenService`、`BearerIdentityFilter` 和 `IdentityContext`：请求携带 `Authorization: Bearer ...` 时，服务端校验签名、过期时间、角色、用户与诊所范围，并优先使用 token 身份。
- `BootstrapIdentity.fromHeaders` 仍保留本地烟测 header 兼容，但受 `app.auth.allow-bootstrap-headers` 控制；该开关可在非本地环境关闭，关闭后缺少 Bearer token 会返回 401。
- 本轮不引入 Spring Security/JWT 第三方依赖，不伪装成完整 RuoYi RBAC；它只是任务 9 的第一阶段服务端身份基线。

影响：

- 任务 9B 已将业务 Controller 中的 `X-Bootstrap-*` 兼容参数迁移到统一身份注入/权限注解；后续仍需接入完整 RuoYi 菜单权限、前端权限路由、通用 DataScope，并在正式环境关闭本地兼容。
- 后续正式环境必须设置真实 `APP_AUTH_TOKEN_SECRET`，并关闭 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS`。
- 医生端脱敏、文件越权、AI 越权和 WORKER 绩效范围都要用 Bearer token 回归，不能只依赖本地 header smoke。

## D-028 任务 9B 先收拢后端权限与数据范围守卫

状态：已确认并执行第一增量。

决策：

- 任务 9B 不直接重写整套 RuoYi 权限体系；先新增 `AccessControlService`，把医生订单范围、内部角色访问、生产审核、流程派工、节点操作、工时绩效等高风险权限判断集中到后端守卫。
- `POST /orders/{orderId}/process-instance/assign` 和 `POST /orders/{orderId}/process-instance/nodes/{nodeInstanceId}/reassign` 必须读取当前身份；仅 CS/ADMIN 可派工/转派。
- `POST /process-instance/nodes/{nodeInstanceId}/skip` 仅 CS/ADMIN 可执行；WORKER 只能开工/完工/工时操作自己被分配的节点。
- `GET /check-records/{nodeInstanceId}` 归为内部数据，医生端不得读取入检/出检记录。
- `GET /performance` 保持 WORKER 只能看本人，ADMIN 才能按 `user_id` 查询；CS/医生不得查询绩效。

影响：

- 这一步关闭了任务 8 权限红线中的若干后端漏洞，但仍不是完整 RuoYi RBAC/DataScope。
- 后续仍需接入 RuoYi 账号表、JWT/登录态、菜单权限、权限注解和正式 DataScope，并逐步移除 controller 对 `X-Bootstrap-*` 参数的兼容。
- 后续权限回归必须继续使用 Bearer token 或正式账号体系覆盖医生端脱敏、文件越权、AI 越权、检查记录、派工、工时和绩效范围。

## D-029 任务 9B.2 先落数据库化账号/角色/权限基础

状态：已确认并执行。

决策：

- 在完整 RuoYi-Vue-Pro 权限体系接入前，先用 Flyway 建立数据库化账号、角色、权限和 DataScope 基础表：`system_user`、`system_role`、`system_permission`、`system_user_role`、`system_role_permission`。
- `/api/auth/login` 不再使用硬编码 ADMIN 账号，改为 `DatabaseAuthService` 从数据库读取用户、角色、权限和 data scope，并校验密码 hash。
- 本地种子账号仅用于开发验收：`admin/change-me-admin`、`cs/change-me-cs`、`worker/change-me-worker`、`doctor/change-me-doctor`；密码以 PBKDF2-SHA256 hash 存储，不提交真实凭据。
- Bearer token 继续由后端 HMAC 签发，但 payload 已包含数据库解析出的 `username`、`user_id`、`clinic_id`、`permissions` 和 `data_scope`。
- 本轮不新增 Spring Security 依赖；首次尝试新增 `spring-security-crypto` 因 Maven Central 连接超时失败，改为 JDK 内置 PBKDF2 校验，保持本地构建可重复。

影响：

- 任务 9B 从“本地角色 header + 守卫”推进到“数据库账号登录 + 权限码 + data scope”阶段。
- 这一步当时仍不是完整 RuoYi RBAC/DataScope；任务 9B.3 已补权限注解和统一拦截器，但仍缺菜单/部门/岗位等 RuoYi 完整模型、正式 DataScope SQL 过滤和前端权限路由。
- 任务 9B.4 已开始补 DataScope SQL/查询级过滤，并已将业务 Controller 的 `X-Bootstrap-*` 参数收口到统一身份解析器；后续仍需扩大 DataScope 覆盖。

## D-030 任务 9B.3 先用权限注解和统一拦截器收口 HTTP 入口

状态：已确认并执行。

决策：

- 在完整 RuoYi-Vue-Pro 权限体系接入前，先新增轻量 `@RequirePermission` 注解和 `PermissionInterceptor`，把订单、文件、AI、Workflow Runtime、Check/WorkLog/Performance、消息、设计稿、账单物流等高风险 Controller 入口统一纳入权限校验。
- 数据库 Bearer token 优先按 `permissions` 权限码校验；本地 `X-Bootstrap-*` 兼容路径暂时保留角色 fallback，便于已有 smoke 和本地开发继续运行。
- 入口权限注解只负责“能不能调用这个端点”；订单归属、医生诊所范围、WORKER 本人绩效、节点分配等业务数据范围仍由 `AccessControlService` 和各 service 层守卫兜底。
- 本轮不引入 Spring Security，不伪装成完整 RuoYi RBAC/DataScope，也不新增公开 API 契约。

影响：

- 任务 9B 从“数据库账号 + 权限码可被签发”推进到“权限码真正参与 HTTP 入口拦截”阶段。
- 这一步降低了遗漏 controller 权限判断的风险；9B.6 已补菜单/部门/岗位和前端权限路由第一增量，但正式上线仍需补完整 RuoYi 管理 UI、正式 DataScope SQL 过滤，并最终关闭 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS`。
- 任务 9B.4 已实现订单/工序实例 DataScope SQL 第一增量，并移除业务 Controller 对 `X-Bootstrap-*` 参数的直接依赖；后续应扩展文件、AI、协同、账单物流的 Bearer 越权矩阵。

## D-031 任务 9B.4 先做查询级 DataScope 与统一身份参数

状态：已确认并执行第一增量。

决策：

- 不在本轮引入完整 RuoYi DataScope SQL 拦截器或 MyBatis 插件；当前项目仍以 Spring `JdbcClient` 为主，先在高风险查询服务中显式落查询级 DataScope 条件。
- 新增 `BootstrapIdentityArgumentResolver`，让业务 Controller 直接接收 `BootstrapIdentity`，不再逐个声明 `X-Bootstrap-*` header；本地 header 兼容只保留在统一解析器和 `PermissionInterceptor` 中。
- 订单读取入口按 `data_scope` 执行 SQL 过滤：`ALL` 可读全部；`CLINIC` 限定同诊所或医生本人；`SELF` 限定医生本人、客服本人或存在分配给当前员工的工序节点。
- 工序实例读取入口按 `data_scope` 执行 SQL 过滤：`ALL` 可读全部；`CLINIC` 限定同诊所或医生本人；`SELF` 必须存在分配给当前员工的工序节点。

影响：

- 任务 9B 从“入口权限码拦截”推进到“关键读模型查询本身带 DataScope 条件”，降低先读出内部数据再判断的风险。
- 这仍不是完整 RuoYi DataScope：文件、消息、设计稿、账单物流、AI 内部聚合等更多查询还需要继续覆盖；正式环境仍必须关闭 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS`。
- 9B.5 已继续扩大 DataScope 覆盖；后续可以选择 9B.6 补完整 RuoYi 菜单/部门/岗位/前端权限路由，也可以进入业务页面，但上线清单里的 RBAC/DataScope 状态仍只能保持 `PARTIAL`。

## D-032 任务 9B.5 将文件、协同和 AI 上下文纳入查询级 DataScope

状态：已确认并执行第一增量。

决策：

- 在正式 RuoYi DataScope SQL 拦截器接入前，继续沿用 9B.4 的显式查询级 DataScope 方案，先覆盖文件、协同和 AI 内部上下文读取。
- `FileResourceService` 在上传 token 的订单读取、文件 complete、预览和下载前执行 SQL DataScope：`ALL` 可访问全部；`CLINIC` 只能访问同诊所/本人且医生可见文件；`SELF` 只能访问本人上传文件或已分配节点所在订单文件。
- `CollaborationService` 的消息、设计稿、账单物流等订单级操作先按订单 DataScope 过滤，再保留医生可见性、消息审核状态等业务过滤。
- `AiGatewayService` 的 AI-1/AI-2/AI-4/AI-5 内部订单上下文读取也按订单 DataScope 过滤；AI-3 继续只读 `DoctorOrderAssistantReadModel`。
- 本轮不新增公开 API 契约，不引入新依赖，也不把当前实现宣称为完整 RuoYi RBAC/DataScope。

影响：

- 任务 9B 从订单/工序实例 DataScope 扩展到文件、协同和 AI 上下文，降低内部文件、内部消息、设计稿、账单物流和 AI 内部摘要被越权读取的风险。
- 旧测试中 WORKER 直接操作订单的场景已补充“存在已分配节点”的真实业务前提；未分配 WORKER 访问消息和文件预览返回 403。
- 上线清单中的 RBAC/DataScope 仍为 `PARTIAL`：还缺完整 RuoYi 管理 UI、通用 SQL 拦截器、正式关闭本地 bootstrap header。

## D-033 任务 9B.6 先补 RuoYi 风格菜单/部门/岗位和前端菜单权限

状态：已确认并执行第一增量。

决策：

- 在完整 RuoYi-Vue-Pro 权限体系接入前，先新增 RuoYi 风格基础表：`system_dept`、`system_post`、`system_user_post`、`system_menu`、`system_role_menu`，并给本地 ADMIN/CS/WORKER/DOCTOR 账号补部门、岗位和可见菜单。
- 登录和 `/api/auth/me` 返回当前账号的 `menus`，前端骨架只按后端返回菜单展示入口；前端隐藏入口只作为体验优化，后端 `@RequirePermission` 和 service DataScope 仍是安全边界。
- 不在本轮引入完整 RuoYi 管理 UI、Spring Security/JWT、新依赖或生产账号体系；不新增业务页面实现。
- OpenAPI 同步新增 `AuthMenu` / `CurrentUserResponse`，并补 `GET /auth/me` 契约。

影响：

- 任务 9B 从“后端权限码 + DataScope”推进到“菜单权限可驱动前端入口”阶段，医生账号前端不显示内部订单和系统权限入口。
- 上线清单中的 RBAC/DataScope 仍为 `PARTIAL`：仍需完整 RuoYi 管理页面、部门/岗位维护、通用 DataScope SQL、正式关闭 bootstrap header、真实生产密钥和更完整前端业务路由。

## D-034 任务 9B.7 生产 profile 必须关闭本地 bootstrap 身份兼容

状态：已确认并执行第一增量。

决策：

- 保留 `X-Bootstrap-*` 作为本地 smoke 兼容路径，默认开发配置仍可通过 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=true` 使用。
- 新增 `application-prod.yml`，生产 profile 固定 `app.auth.allow-bootstrap-headers=false`，并要求 `APP_AUTH_TOKEN_SECRET` 从外部安全注入，不提供本地默认值。
- 新增 `AuthStartupValidator`，应用启动时如果 active profile 包含 `prod` 且仍启用 bootstrap header，或 token secret 为空/仍是 `local-dev-change-me-auth-secret`，则 fail-fast。
- 本轮不引入完整 Spring Security/JWT，不删除本地 smoke 机制，不实现正式账号管理 UI。

影响：

- 任务 9B 从“文档要求生产关闭 bootstrap header”推进到“生产 profile 启动时有机器门禁”。
- 本地 smoke 和既有测试仍可运行；正式环境必须使用 Bearer token / 数据库账号体系，并配置真实 `APP_AUTH_TOKEN_SECRET`。
- 上线清单中的 RBAC/DataScope 仍为 `PARTIAL`：仍缺完整 RuoYi 管理 UI、通用 DataScope SQL 拦截器、生产部署脚本和更完整前端业务路由。

## D-035 任务 9C.1 WebSocket 推送以通知事实表为唯一来源

状态：已确认并执行第一增量。

决策：

- 新增最小真实 WebSocket 通道 `/ws/connect?token={access_token}`，握手阶段用现有 `BearerTokenService` 校验 token；无效 token 或无 `user_id` 的 token 拒绝连接。
- WebSocket 不直接生成业务通知；业务模块仍先写 `notification_event` 和 `user_notification`，再由 `NotificationPushService` 对当前在线用户尝试推送。
- 推送 payload 复用 `notification_event.payload`，该 payload 由业务服务生成，不能包含内部生产备注、工时、返工、绩效等医生端禁用字段。
- 在线推送成功后写 `user_notification.delivered_at`，并把当前事件 `delivery_status` 标为 `DELIVERED`；用户离线时保持未送达记录，后续由未读补偿接口处理。
- 本轮不引入 Redis 广播、不实现前端消息中心和未读/已读 REST 接口，不把 WebSocket 模块标为完整上线就绪。

影响：

- WebSocket 缺口从 `NOT_READY` 推进到 `PARTIAL`：单实例在线推送可用，但多实例广播、前端接入和未读/已读仍需后续补齐。
- 后续 Redis 或消息队列接入时必须继续以 `notification_event` 为事实来源，不得让 WebSocket 变成唯一通知记录。
- 医生端通知脱敏边界继续由后端 payload 构造和角色可见性控制，不能依赖前端隐藏。

## D-036 任务 9C.2 通知未读/已读 REST 只操作当前用户通知

状态：已确认并执行第一增量。

决策：

- 新增通知 REST 接口：`GET /notifications`、`GET /notifications/unread-count`、`POST /notifications/{notificationId}/read`、`POST /notifications/read-all`。
- 通知查询和已读更新都强制限定 `user_notification.user_id = 当前 Bearer 身份 user_id`；当前用户不能列出或标记其他用户通知。
- 响应只从 `notification_event.payload` 取公开字段 `orderNo`、`message`，并返回事件类型、订单 id、送达时间、已读时间等通知元数据；不关联内部订单备注、工时、返工、绩效等敏感字段。
- 前端骨架新增登录后的「通知中心」入口，使用 Bearer token 调用未读数、列表、单条已读和全部已读接口；该入口只作为 Task 9C.2 验收骨架，不代表完整医生/客服/生产业务页面。
- OpenAPI 同步新增 4 个通知 REST operation，并把 `scripts/check-openapi-contract.rb` 的必备 path 扩展到 9C.2 通知接口。

影响：

- 通知缺口从“仅有单实例在线推送”推进到“离线补偿列表 + 未读/已读 REST + 前端入口”。
- 正式通知上线能力仍为 `PARTIAL`：9C.2 当时还缺浏览器 WebSocket 实时接入、Redis 多实例广播、心跳重连、Nginx/HTTPS 验收和完整业务页面联动；D-037 已补实时前端和 Redis 广播第一增量，但生产级验收仍未完成。
- 后续扩展通知字段时必须继续以脱敏 payload 为边界，不得让前端靠隐藏字段防泄漏。

## D-037 任务 9C.3 通知实时接入与 Redis 广播按开关启用

状态：已确认并执行第一增量。

决策：

- 前端通知中心登录成功后建立 `WebSocket` 到 `/ws/connect?token={access_token}`；收到推送 payload 后刷新通知列表和未读数，并显示连接状态与最新实时通知。
- Vite 本地开发代理新增 `/ws`，支持前端通过同源地址连接后端 WebSocket。
- 后端新增 `spring-boot-starter-data-redis` 和通知广播抽象：本实例先做本地 WebSocket 投递，再把 `NotificationBroadcastMessage` 发布到 Redis channel，其他实例收到后只做本机投递。
- Redis 广播通过 `NOTIFICATION_REDIS_BROADCAST_ENABLED=true` 条件启用，默认本地关闭；`APP_INSTANCE_ID` 用于避免本实例消息自回环，`NOTIFICATION_REDIS_CHANNEL` 用于配置广播 channel。
- `notification_event` / `user_notification` 仍是通知事实来源；Redis 只负责跨实例在线分发，不承担持久化、不替代未读补偿。

影响：

- 通知能力从“REST 未读补偿 + 后端单实例 WebSocket”推进到“前端实时刷新 + Redis 跨实例广播代码路径”。
- 本地开发验收以 Vite 同源 `/ws` 代理覆盖浏览器连接路径；生产仍需单独配置并验收 Nginx/HTTPS WebSocket。
- 正式通知上线能力仍为 `PARTIAL`：还缺真实双后端实例联调、生产 Nginx/HTTPS WebSocket 配置、心跳/重连策略压测、监控告警和完整业务页面联动。
- Redis 不可用时不得阻断业务写通知；本地投递和数据库未读记录仍保留兜底。

## D-038 任务 9D.1 先补医生订单读取工作台

状态：已确认并执行第一增量。

决策：

- Task 8 的前端业务页面缺口先从医生端订单读取侧切入，不在本轮实现完整医生下单、动态表单、Uppy 上传或客服审核。
- 后端补齐已冻结契约中的 `GET /orders` 当前基线实现：医生端列表强制限定 `doctor_user_id = 当前用户`，返回脱敏 `DoctorOrderVO`；内部角色仍返回内部订单 DTO。
- 前端「医生订单工作台」复用现有后端接口：`GET /orders`、`GET /orders/{orderId}`、消息、设计稿、账单、物流、`/ai/order-query` 和确认收货接口。
- Vite 本地开发代理新增 `/orders` 与 `/ai`，医生订单页不走未定义的 `/api/orders`。
- `docs/api/openapi.yaml` 保持 54 path / 65 operation 不变，只补 `OrderListResponse` / `DoctorOrderSummary` 响应 schema，使 `/orders` 当前实现不再停留在泛化 `PageResult`。

影响：

- 前端业务页面状态从 `NOT_READY` 推进到 `PARTIAL`：医生可读订单列表/详情、公开消息、医生可见设计稿、账单物流，并可在页面上调用医生 AI 和确认收货。
- 医生下单、动态表单、Uppy 上传、客服审核、生产/质检/工时/绩效页面仍未完成，Task 8 总体仍为 `NOT READY`。
- 医生订单列表/详情必须继续保持脱敏红线，不得返回 `internal_status`、`production_note`、`cs_user_id` 等内部字段。

## D-039 任务 9D.2 先补医生下单第一增量

状态：已确认并执行第一增量。

决策：

- Task 8 的下一块前端业务缺口选择 9D.2：医生下单/动态表单/上传入口第一增量，而不是继续扩大只读工作台。
- 9D.2 范围保持窄切：读取 `form_field_config` 动态表单配置、医生创建订单、绑定本人已完成且医生可见的未绑定文件、提交后进入 `PENDING_CS_REVIEW` / `PENDING_REVIEW`。
- 本轮新增 `V8__doctor_order_entry_form_seed.sql`，仅提供 `REGULAR_CROWN` 的本地第一增量默认字段；动态表单最终字段清单仍待 PM/客户确认。
- 本轮不实现草稿；`is_draft=true` 明确返回 400，避免在未设计草稿状态机时扩大业务面。
- 本轮前端上传入口采用已完成 `file_id` 绑定输入，验证后端文件绑定边界；完整 Uppy/Multipart 选择、断点续传和上传体验留给后续任务。
- `docs/api/openapi.yaml` 已同步 `FormFieldConfig`、`CreateOrderRequest`、`CreateOrderResponse`，并写明 9D.2 暂不支持草稿。

影响：

- PRD 12 步主链路中的“医生在线下单”从 `NOT_STARTED` 推进到 `PARTIAL`：已有后端创建订单和前端最小入口，但不是完整上传/草稿/客服审核链路。
- 医生下单响应继续保持脱敏，不返回 `internal_status`；内部真实状态通过数据库和状态历史记录验证。
- 任务 8 总体仍保持 `NOT READY`；9D.2 之后仍需客服审核、生产/质检/工时页面、真实 DeepSeek、生产级通知和部署交付材料。

## D-040 任务 9D.3 客服初审只推进到生产审核前

状态：已确认并执行第一增量。

决策：

- Task 8 的下一块前端业务缺口选择 9D.3：客服审核/驳回页面与接口第一增量。
- 9D.3 范围保持窄切：内部待审列表支持 `internal_status=PENDING_CS_REVIEW` 过滤；客服 `POST /orders/{orderId}/review` 可 `APPROVE` 或 `REJECT`。
- 审核通过写入内部 `production_note`，通过 `OrderStatusService` 推进到 `PENDING_PRODUCTION_REVIEW` / `PENDING_REVIEW`；本轮不触发 `production-review`，不实例化工序链。
- 审核驳回要求 `reject_reason`，通过 `OrderStatusService` 推进到 `CS_REJECTED` / `PENDING_REVIEW`；医生端仍只读外部投影，不暴露 `internal_status` 或 `reject_reason`。
- 前端复用已有 `/orders/internal` 菜单作为客服初审入口，不新增权限迁移；后端仍以 `@RequirePermission(value = "order:read-internal", roles = {ADMIN, CS})` 和查询级 DataScope 为安全边界。
- 本轮只把审核结果写入医生通知事实，不实现完整客服消息/账单/物流工作台，不接 AI-1 翻译草稿写入生产指令，也不实现驳回后医生补资料再提交。

影响：

- PRD 12 步主链路中的“客服审核通过/驳回”从缺正式接口和页面推进到 `PARTIAL`：已有后端状态流转、历史记录、通知事实、前端最小审核入口和浏览器 smoke。
- 生产审核仍由既有 `POST /orders/{orderId}/production-review` 承担；下一步可做 9D.4，把 `PENDING_PRODUCTION_REVIEW` 的订单串到生产审核页面和工序实例化。
- Task 8 总体仍保持 `NOT READY`；仍缺完整 Uppy/Multipart、生产/质检/工时页面、真实 DeepSeek、生产级通知和部署交付材料。

## D-041 任务 9D.4 生产审核只推进到工序实例化入口

状态：已确认并执行第一增量。

决策：

- Task 8 的下一块前端业务缺口选择 9D.4：生产审核页面与既有工序实例化接口串联第一增量。
- 9D.4 范围保持窄切：内部待审列表使用 `internal_status=PENDING_PRODUCTION_REVIEW` 过滤；前端 `/workflow/review` 可选择订单、选择工序链、填写 `intake_branch` / `branch_params`，并调用 `POST /orders/{orderId}/production-review`。
- 生产审核服务端新增状态门禁：只有 `PENDING_PRODUCTION_REVIEW` 订单可执行生产审核；未经过客服初审的 `PENDING_CS_REVIEW` 订单返回 409 且不得创建 `order_process_instance`。
- 审核通过进入 `PROCESS_INSTANCE_CREATED` / `PRODUCING` 并生成工序实例快照；审核驳回进入 `PRODUCTION_REJECTED` / `PENDING_REVIEW`。
- 本轮不实现生产任务池页面、工序实例详情可视化、派工/转派页面、入检/出检/工时页面，也不补完整 Uppy/Multipart 或真实 DeepSeek。

影响：

- PRD 12 步主链路中的“生产审核通过，自动生成订单工序实例快照”从后端 PASS 推进到页面级 `PARTIAL`：已有最小前端入口、状态门禁、工序链选择和浏览器 smoke。
- 生产端下一步应继续 9D.5，补生产任务池 / 工序实例详情 / 派工页面第一增量；Task 8 总体仍保持 `NOT READY`。

## D-042 任务 9D.5 生产任务入口只覆盖实例、派工和我的任务

状态：已确认并执行第一增量。

决策：

- Task 8 的下一块前端业务缺口选择 9D.5：生产任务池 / 工序实例详情 / 派工页面第一增量。
- 9D.5 不新增后端业务模型，复用既有 Workflow Runtime：`GET /orders/{orderId}/process-instance`、`POST /orders/{orderId}/process-instance/assign`、`POST /orders/{orderId}/process-instance/nodes/{nodeInstanceId}/reassign`、`GET /tasks/mine` 和节点 start/complete。
- 前端新增三个菜单落地页面：`/workflow/process-instance` 查看已实例化订单节点，`/workflow/assign` 对节点绑定/转派员工，`/tasks/mine` 让工人按状态查看本人任务并触发最小开工/完工。
- 本轮只筛选 `PROCESS_INSTANCE_CREATED` 订单作为工序实例/派工入口；进入生产中后的完整生产看板、跨状态实例检索和多条件筛选后续再补。
- 本轮不实现入检/出检页面、工时暂停/继续/完成页面、返工处理页面、生产通知联动、复杂生产看板或绩效管理页面。
- `docs/api/openapi.yaml` 同步当前事实：派工/转派权限为 CS / ADMIN，`GET /tasks/mine` 状态过滤包含 `READY`。

影响：

- PRD 12 步主链路中的“管理员绑定员工，员工在任务池收到任务”从只有后端接口推进到页面级 `PARTIAL`：已有工序实例详情、派工/转派和 worker 我的任务页面，并有浏览器 smoke。
- 生产端下一步应继续 9D.6，补入检/出检 / 工时操作页面第一增量；Task 8 总体仍保持 `NOT READY`。

## D-043 任务 9D.6 质检工时页面只做执行入口第一增量

状态：已确认并执行第一增量。

决策：

- Task 8 的下一块前端业务缺口选择 9D.6：入检/出检 / 工时操作页面第一增量。
- 9D.6 不新增后端业务模型，复用任务 5B 既有执行接口：`POST /check-records`、`GET /check-records/{nodeInstanceId}`、`POST /work-logs/start`、`POST /work-logs/{workLogId}/pause|resume|finish`，并复用 `GET /tasks/mine` 作为 worker 节点选择入口。
- 前端新增两个菜单落地页面：`/checks` 用于按本人任务节点提交入检或出检，`/worklogs/self` 用于对本人进行中节点开始、暂停、继续和完成工时。
- 工时页面只在节点已由 Workflow Runtime 进入 `IN_PROGRESS` 后启动计时；节点开工和完工仍由 `/tasks/mine` 的最小任务操作承担，不绕过 `order_process_node.node_status`。
- 本轮不实现完整返工处理台、责任分类字典、绩效看板、生产通知联动、复杂生产看板、完整 Uppy/Multipart 或真实 DeepSeek。

影响：

- PRD 12 步主链路中的“工序入检、开工、暂停、继续、完成”和“出检”从只有后端接口推进到页面级第一增量：已有入检/出检提交入口、检查记录查看入口和工时 start/pause/resume/finish 操作入口。
- 生产端下一步可继续 9D.7，补绩效管理页面第一增量，或回到 9D.2 后续补真实 Uppy 上传体验；Task 8 总体仍保持 `NOT READY`。

## D-044 任务 9D.7 绩效管理页面只展示当前统计快照

状态：已确认并执行第一增量。

决策：

- Task 8 的下一块前端业务缺口选择 9D.7：绩效管理页面第一增量。
- 9D.7 不新增后端业务模型，复用既有 `GET /performance`。WORKER 不传 `user_id` 时只能返回本人数据；ADMIN 可输入 `user_id` 查询指定员工。
- 前端 `/performance` 只展示当前后端返回的 6 个指标：完成工序、有效工时、返工次数、准时率、通过率、工时效率。
- 本轮不实现时间范围筛选、绩效明细列表、标准工时配置、绩效申诉/补录、导出报表、公式调整或完整管理端绩效看板。

影响：

- PRD 主链路里的“工时绩效”从后端最小接口推进到页面级第一增量：worker/admin 可以在前端读取绩效统计快照。
- 生产端下一步可继续 9D.8，补完整生产看板 / 跨状态生产检索第一增量，或回到 9D.2 后续补真实 Uppy 上传体验；Task 8 总体仍保持 `NOT READY`。

## D-045 任务 9D.8 生产看板复用现有订单与工序实例接口

状态：已确认并执行第一增量。

决策：

- Task 8 的下一块前端业务缺口选择 9D.8：生产看板 / 跨状态生产检索第一增量。
- 9D.8 不新增后端业务接口，复用 `GET /orders` 的 `internal_status` / `keyword` 过滤，以及 `GET /orders/{orderId}/process-instance` 的工序实例节点快照。
- 前端新增 `/production/board` 页面，支持按 `PENDING_PRODUCTION_REVIEW`、`PROCESS_INSTANCE_CREATED`、`PRODUCING`、`SHIPPED`、`COMPLETED` 或全部状态检索订单；选中已实例化订单后展示 READY、IN_PROGRESS、COMPLETED、SKIPPED/PENDING 节点统计和节点进度。
- 新增 `V9__production_board_menu_seed.sql` 只给 ADMIN 和具备 `order:read-internal` 的角色追加「生产看板」菜单。
- 本轮不实现拖拽看板、实时 WebSocket 刷新、复杂多条件筛选、排产、节点编辑、返工处理台或终检页面。

影响：

- PRD 主链路里的“生产端看订单与工序进度”从分散页面推进到一个可检索的生产看板第一增量。
- Task 8 总体仍保持 `NOT READY`，下一步可继续 9D.9 返工处理台 / 终检入口第一增量，或回到 9D.2 补完整 Uppy/Multipart。

## D-046 任务 9D.9 返工终检先补只读记录和最小终检入口

状态：已确认并执行第一增量。

决策：

- Task 8 的下一块前端业务缺口选择 9D.9：返工处理台 / 终检入口第一增量。
- 后端新增 `GET /reworks` 只读列表，复用既有 `rework_record` 数据，不在本轮新增返工关闭、责任分类或复杂状态机。
- 返工列表入口继续沿用 `check:read-internal` 权限；WORKER 查询限定来源节点或目标节点分配给本人，医生端禁止读取。
- 前端新增 `/rework-final` 页面，左侧展示待返工记录，右侧复用 `GET /tasks/mine?status=COMPLETED` 和 `POST /check-records` 提交终检出检通过。
- 新增 `V10__rework_final_menu_seed.sql`，只给 ADMIN 和具备 `check:write` 的角色追加「返工终检」菜单，避免只读 CS 进入带写操作的页面。
- 本轮不实现返工责任分类字典、返工状态 DONE、终检报告、出货前强制拦截、生产通知联动、完整 Uppy/Multipart 或真实 DeepSeek。

影响：

- PRD 主链路里的“返工”和“终检”从后端最小记录推进到页面级第一增量：可以看待返工记录，并对已完成节点提交终检出检。
- Task 8 总体仍保持 `NOT READY`；后续仍需补完整返工处理闭环、终检发货拦截、完整 Uppy/Multipart、真实模型和部署交付材料。

## D-047 任务 9D.10 Multipart 先补后端闭环和医生端最小上传绑定

状态：已确认并执行第一增量。

决策：

- Task 8 的下一块上线硬缺口选择 9D.10：医生端真实上传入口与 MinIO Multipart 第一增量。
- 后端新增 Multipart 生命周期接口：`POST /files/multipart/initiate`、`POST /files/{fileId}/multipart/part-url`、`POST /files/{fileId}/multipart/complete`、`POST /files/{fileId}/multipart/abort`。
- `file_resource` 增加 `upload_mode`、`multipart_upload_id`、`multipart_part_size`、`multipart_part_count`，用 V11 Flyway 迁移保存 Multipart 元数据。
- 医生 Multipart 写路径收紧为上传资源创建者本人可操作；内部角色仍按现有文件权限处理，避免同诊所其他医生 abort/complete 他人上传。
- 前端医生订单页只做最小 Uppy 文件选择、按后端 `part_size` 分片直传、complete 后回填 `doctorOrderFileIds`；上传要求先选择/创建订单，不引入草稿订单或临时文件池。
- 本轮不实现完整 Uppy Dashboard、断点续传/弱网恢复、100MB+ 浏览器验收、草稿上传、客服/生产审核、返工关闭、终检报告或真实 DeepSeek。

影响：

- 文件上传从单对象预签名 PUT 推进到 Multipart 第一增量，后端已有自动化覆盖 initiate、part-url、complete、abort、审计和医生写路径越权拒绝。
- Task 8 总体仍保持 `NOT READY`；后续仍需补断点续传/大文件弱网验收、文件类型/数量限制、完整业务页面和部署交付材料。

## D-048 本地浏览器验收同时支持 localhost 与 127.0.0.1

状态：已确认并执行。

决策：

- 本地开发默认 CORS 同时允许 `http://localhost:5173` 和 `http://127.0.0.1:5173`，避免 in-app browser 或 Vite Local URL 使用 `127.0.0.1` 时登录被 Spring MVC 判定为 `Invalid CORS request`。
- `.env.example` 与 `application.yml` 保持一致；生产环境仍需显式注入真实允许源，不依赖本地默认值。
- 前端新增后端根路径时，必须同步 `frontend/vite.config.ts` 的 Vite proxy，并在对应 `check:task9d*` 脚本里加入代理检查。
- 9D.2 的 `/form-configs` 动态表单路径已补 Vite proxy，并纳入 `npm run check:task9d2` 和 `acceptance.json`。

影响：

- 浏览器 smoke 可以用 `http://127.0.0.1:5173` 或 `http://localhost:5173` 登录并读取动态表单。
- Task 8 总体仍保持 `NOT READY`；该决策只解决本地验收入口稳定性，不代表生产 CORS、HTTPS、Nginx 或大文件上传验收完成。

## D-049 任务 9D.10 后续先补 Multipart 状态查询和本地恢复上传

状态：已确认并执行第一增量。

决策：

- 9D.10 后续不直接扩大到完整 Uppy Dashboard 或 100MB+ 浏览器实测，先补恢复上传所需的服务端事实接口和前端最小重试能力。
- 后端新增 `GET /files/{fileId}/multipart/status?upload_id=...`，只允许有权操作该 Multipart 上传的用户读取，并返回 `file_id`、`upload_id`、`upload_status`、`part_size`、`part_count` 和 MinIO 已完成分片列表。
- 前端医生订单页使用本地 `doctorUploadResumeSessions` 保存未完成上传的 `file_id/upload_id/part_size/part_count`；重新点击上传时先读取 status，跳过已完成分片后再 complete。
- 前端提供「取消未完成上传」显式 abort，不再在普通上传异常时自动 abort，以便保留可恢复现场。

影响：

- 当前已经覆盖同一浏览器本地会话的恢复上传第一增量，并有后端自动化验证 status 不泄露 `object_key`。
- Task 8 总体仍保持 `NOT READY`；100MB+ 浏览器实测已由 D-050 补为本地 smoke，后续仍需弱网注入、跨设备恢复策略、文件类型/数量限制和测试/正式 bucket 隔离验收。

## D-050 任务 9D.10 用 Playwright 固化 100MB+ 浏览器上传 smoke

状态：已确认并执行第一增量。

决策：

- 100MB+ 浏览器验收先固化为本地可重复 smoke：`npm run smoke:task9d10-large-upload`。
- smoke 使用 Playwright Test 和本机 Chrome channel，避免依赖 Playwright 自带 Chromium 下载；如本机没有 Chrome，可通过 `TASK9D10_BROWSER_CHANNEL` 覆盖。
- smoke 默认生成 105MB 稀疏 STL 测试文件，走医生浏览器登录、进入医生订单、创建测试订单、选择文件、点击「上传并绑定」、等待完成 `file_id`，再用医生 Bearer token 校验预览权限。
- smoke 只追加本地测试订单和文件，不删除数据、不重置迁移、不清理 MinIO 或 Docker volume。

影响：

- 大文件上传从“尚未浏览器实测”推进到“本地 105MB 浏览器 Multipart smoke 已通过”；本轮记录 `file_id=457`，数据库核验为 `COMPLETED / 110100480 bytes / MULTIPART / 21 parts`。
- Task 8 总体仍保持 `NOT READY`；弱网注入、跨设备恢复、文件类型/数量限制、测试/正式 bucket 隔离和生产 Nginx/HTTPS 上传链路仍需后续补齐。

## D-051 任务 9D.10 后续先补服务端恢复候选列表

状态：已确认并执行第一增量。

决策：

- 9D.10 后续不直接扩成完整跨设备 Dashboard 或弱网注入方案，先补无本地 `localStorage` 时可恢复的服务端事实入口。
- 后端新增 `GET /files/multipart/pending?order_id=...`，只返回当前订单下仍为 `PENDING/MULTIPART` 的候选；医生只能看到本人创建且医生可见的候选。
- pending 响应仅包含恢复所需的 `file_id`、`upload_id`、订单、文件名、大小、类型、分片大小和分片数，不暴露 `object_key`、bucket 内部路径或永久凭据。
- 前端医生上传入口在找不到本地恢复会话时，按当前订单、同文件名、同文件大小匹配服务端候选，恢复 `file_id/upload_id` 后继续读取 multipart status。
- 本轮不实现完整 Uppy Dashboard、真实弱网注入、跨设备手工浏览器验收、并发调优、草稿上传或文件类型/数量最终限制。

影响：

- Multipart 恢复能力从“只能同一浏览器 localStorage 恢复”推进到“无本地会话时也能由服务端候选恢复第一增量”。
- Task 8 总体仍保持 `NOT READY`；后续仍需补完整弱网/跨设备浏览器验收、上传限制、测试/正式 bucket 隔离和生产 Nginx/HTTPS 上传链路。

## D-052 任务 9D.10 用浏览器 smoke 固化服务端候选恢复路径

状态：已确认并执行第一增量。

决策：

- 服务端 pending 候选恢复不能只靠静态检查和后端单测，补一个真实浏览器 smoke：`npm run smoke:task9d10-server-resume`。
- smoke 默认生成 6MB 稀疏文件，先在医生浏览器创建订单，再用 API 为同订单预创建 pending Multipart 候选。
- smoke 会清理 `doctor-order-upload:` 本地恢复会话键，然后选择同名同大小文件并点击上传；验收点是完成的 `file_id` 必须等于预创建 pending 的 `file_id`。
- smoke 使用浏览器真实 `File.type` 创建 pending 候选，避免浏览器 MIME 推断和 API 预创建类型不一致导致误判。
- 本轮 smoke 不覆盖真实断网/限速、不同设备手工操作、并发调优或完整 Uppy Dashboard。

影响：

- 服务端候选恢复从“代码路径存在”推进到“真实浏览器可复用 pending Multipart 的本地 smoke 已通过”；本轮记录 `file_id=514`、`order_id=1439`。
- Task 8 总体仍保持 `NOT READY`；完整弱网和跨设备浏览器验收仍需后续补齐。

## D-053 任务 9D.10 用浏览器 smoke 固化上传中断后恢复路径

状态：已确认并执行第一增量。

决策：

- Multipart 中断恢复不能只靠后端 `status` 单测和静态检查，补一个真实浏览器 smoke：`npm run smoke:task9d10-interrupted-resume`。
- smoke 默认生成 6MB 稀疏文件，在医生浏览器创建订单后选择附件并开始上传。
- smoke 通过 Playwright `route` 拦截第 2 个分片 PUT 并 `abort`，模拟浏览器上传中断；验收点是本地 `doctor-order-upload:` 会话保留、服务端 `multipart/status` 显示 1 个已完成分片且仍为 `PENDING`。
- 第二次点击「上传并绑定」必须复用同一 `file_id/upload_id`，跳过已完成分片并完成上传；完成后本地恢复会话必须清除。
- 本轮不等同于真实弱网限速、跨设备手工验收、完整 Uppy Dashboard 或生产 Nginx/HTTPS 上传链路验收。

影响：

- 上传恢复能力从“本地会话代码路径存在”推进到“真实浏览器中断后可复用同一 Multipart `file_id` 完成上传”；本轮记录 `file_id=537`、`put_count=3`。
- Task 8 总体仍保持 `NOT READY`；真实弱网限速/断网、完整跨设备浏览器验收、文件类型/数量限制和测试/正式 bucket 隔离仍需后续补齐。

## D-066 任务 9D.20 返工影响范围先重置目标后续已执行节点

状态：已确认并执行第一增量。

决策：

- 出检失败创建返工记录后，除了把返工目标节点置为 `READY`，还要基于订单实例 `order_process_edge` 递归计算目标节点的后续影响范围。
- 第一增量仅把同一实例内受影响且状态为 `READY` 或 `COMPLETED` 的后续节点重置为 `PENDING`，等待返工目标重新完成后由既有 DAG 激活规则重新进入 `READY`。
- 历史 `check_record`、`work_log`、`rework_record` 不删除、不覆盖，保证质检、工时和返工留痕可追溯。
- 本轮不新增公开 API、表结构或前端入口；OpenAPI 不变。

影响：

- 返工从“只重做目标节点”推进到“能阻断并重新激活后续已执行节点”的影响范围第一增量。
- 本轮不处理正在 `IN_PROGRESS` 的后续节点冲突确认、不做影响范围审计表/可视化，也不做绩效明细归因。
- Task 8 总体仍保持 `NOT READY`；后续仍需绩效归因联动、返工影响审计/可视化、终检专用角色/附件、生产级 AI 治理、真实弱网/跨设备续传和生产部署。

## D-067 任务 9D.21 绩效统计先拆分返工责任归因字段

状态：已确认并执行第一增量。

决策：

- 任务 9D.21 先扩展既有 `/performance` 响应，不新增公开 API path，不新增 DB migration。
- `rework_count` 继续表示目标节点返工总数。
- 新增 `responsible_rework_count` 统计责任类型为 `WORKER` 的返工。
- 新增 `non_worker_responsibility_rework_count` 统计责任类型为 `DOCTOR/CS/SYSTEM` 的返工。
- 新增 `unclassified_rework_count` 统计未关闭或未设置责任类型的返工。
- 前端绩效页面同步展示三张归因卡片，OpenAPI 和 acceptance 同步。

影响：

- 绩效归因联动从 Task 8 上线硬缺口推进到可验收第一增量。
- 本轮不做绩效奖金/扣罚公式、周期筛选、绩效明细、标准工时配置或申诉闭环。
- Task 8 总体仍保持 `NOT READY`；后续仍需绩效完整公式、返工影响审计/可视化、生产级 AI 治理、真实弱网/跨设备续传和生产部署。

## D-068 任务 9D.22 返工影响审计先落受影响节点清单

状态：已确认并执行第一增量。

决策：

- 任务 9D.22 先扩展既有 `/reworks` 响应，不新增公开 API path。
- 新增 `V17__rework_impact_audit.sql`，在 `rework_record` 上保存 `impacted_node_count` 和 `impacted_node_instance_ids`。
- 出检失败创建返工时，在重置后续节点前计算同一实例内从返工目标可达且状态为 `READY/COMPLETED` 的后续节点，并把这些实际受影响节点写入返工记录。
- 前端「返工终检」页面先展示影响后续节点数量和节点 ID，作为可视化第一增量。

影响：

- 返工影响范围从“只执行状态重置”推进到“可在返工记录中审计本次影响节点”的第一增量。
- 本轮不做图形化 DAG、影响范围筛选、审计导出或 `IN_PROGRESS` 后续节点冲突确认。
- Task 8 总体仍保持 `NOT READY`；后续仍需返工影响图形化/筛选、绩效完整公式、生产级 AI 治理、真实弱网/跨设备续传和生产部署。

## D-069 任务 9D.23 返工影响筛选先复用既有返工列表

状态：已确认并执行第一增量。

决策：

- 任务 9D.23 先扩展既有 `/reworks` 列表查询，不新增公开 API path。
- 新增可选查询参数 `has_impacted_nodes`，为 `true` 时仅返回 `impacted_node_count > 0` 的返工记录，为 `false` 时仅返回 `impacted_node_count = 0` 的返工记录。
- 前端「返工终检」页面先提供“仅看影响后续工序”筛选开关，不引入图形库或复杂筛选器。
- 医生端仍不得读取返工列表、影响节点、责任分类等内部信息。

影响：

- 返工影响审计从“能看单条影响节点”推进到“能快速筛出影响后续工序的返工”第一增量。
- 本轮不做 DAG 图形化、导出、复杂组合筛选或 `IN_PROGRESS` 后续节点冲突确认。
- Task 8 总体仍保持 `NOT READY`；后续仍需返工影响图形化、绩效完整公式、生产级 AI 治理、真实弱网/跨设备续传和生产部署。

## D-070 任务 9D.25 绩效明细先暴露完成工时来源

状态：已确认并执行第一增量。

决策：

- 任务 9D.25 新增 `/performance/details`，不改变既有 `/performance` 汇总口径。
- 明细第一增量只返回最近 100 条已完成 `work_log`，包含订单号、工序、有效工时、标准工时、是否准时和完成时间。
- 权限沿用绩效汇总规则：WORKER 只能看本人，ADMIN 可按 `user_id` 查询指定员工。
- 前端绩效页在汇总卡片下展示“工时明细”表，作为后续周期筛选、完整公式和申诉闭环的基础。

影响：

- 绩效从“只看汇总和责任归因”推进到“可核对汇总来源明细”的第一增量。
- 本轮不做周期筛选、标准工时后台配置、奖金/扣罚完整公式、绩效申诉/补录或明细导出。
- Task 8 总体仍保持 `NOT READY`；后续仍需绩效周期筛选、完整公式、标准工时配置、申诉闭环、返工影响图形化、生产级 AI 治理和生产部署。

## D-071 任务 9D.26 AI 调用限流先约束真实模型入口

状态：已确认并执行第一增量。

决策：

- 新增 `AI_MAX_REQUESTS_PER_USER_HOUR` / `app.ai.max-requests-per-user-hour`，默认每用户每小时 120 次真实模型调用；配置小于等于 0 时关闭该限流。
- 限流只在真实模型启用时生效；默认 deterministic 占位输出不消耗外部模型额度。
- 限流统计复用 `ai_audit_log` 中近一小时 `model_name != deterministic-placeholder` 且 `result_status=SUCCESS` 的记录，不新增表。
- 超额请求返回 HTTP 429，且通过独立事务写入 `ai_audit_log.result_status=AI_RATE_LIMITED`，避免异常回滚吞掉治理审计。

影响：

- 生产级 AI 治理从“真实 DeepSeek 可接入”推进到“真实模型调用有最小额度保护和拒绝审计”。
- 本轮不做分角色额度、成本预算、重试/熔断、提示词版本、告警或管理后台配置。
- Task 8 总体仍保持 `NOT READY`；后续仍需成本统计、提示词版本、输出防护、降级告警和真实环境联调记录。

## D-072 任务 9D.27 AI 成本审计采用可配置微美元估算

状态：已确认并执行第一增量。

决策：

- 新增 `ai_audit_log.estimated_cost_microusd`，以微美元整数记录单次 AI 调用的估算成本。
- 新增 `AI_INPUT_TOKEN_COST_MICROUSD` 和 `AI_OUTPUT_TOKEN_COST_MICROUSD` 配置，默认均为 0；仓库不内置 DeepSeek 或任何供应商的实时价格。
- 成本估算公式为 `input_token_count * inputTokenCostMicrousd + output_token_count * outputTokenCostMicrousd`，缺失输出 token 时按 0 计算。
- 成本记录继续复用既有 `ai_audit_log`，不新增成本汇总表或管理后台。

影响：

- 生产级 AI 治理从“限流和调用审计”推进到“每次调用有可配置成本估算”。
- 本轮不做按日/月聚合、预算告警、供应商价格自动同步、币种汇率转换或管理端图表。
- Task 8 总体仍保持 `NOT READY`；后续仍需成本汇总、提示词版本、输出防护、重试/熔断、降级告警和真实环境联调记录。
