# DECISIONS

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
