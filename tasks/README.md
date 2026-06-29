# Tasks

## 当前里程碑

M1：需求与架构冻结。

目标不是写业务页面，而是冻结接口、数据模型、状态机、权限脱敏和工艺流基础。

当前计划已按 TRD V1.1 深度研究优化版重排。后续不要直接从旧任务 1 进入业务代码；应从任务 1 的骨架初始化开始，再按任务 2-8 推进。

## 任务 0：接口契约与项目基线

状态：已完成。

目标：

- 修复 OpenAPI YAML，使其能被 Swagger / SDK 工具解析。
- 建立稳定的接口契约来源。
- 明确后续前后端联调按该契约执行。

范围：

- 修复 `duration_efficiency` 缺空格问题。
- 修复 `standard_duration` 同类缺空格问题。
- 合并重复的 `/form-configs` path 定义。
- 检查 56 个接口是否按模块保留。
- 把修复版 API 放入仓库稳定路径：`docs/api/openapi.yaml`。

验收结果：

- OpenAPI 文件可被解析器读取。已通过。
- `/form-configs` 同时包含 GET 和 POST。已通过。
- 接口模块仍覆盖 Auth、User、Clinic、OrderForm、File、Order、Workflow、Check、WorkLog、Performance、Message、DesignDraft、Bill、AI、Notification。已通过。

验证命令：

```bash
ruby -ryaml -e "data=YAML.load_file('docs/api/openapi.yaml'); puts 'parsed ok'; puts \"paths=#{data['paths'].length}\"; puts \"form-configs=#{data['paths']['/form-configs'].keys.sort.join(',')}\""
npx --yes @apidevtools/swagger-cli validate docs/api/openapi.yaml
npx --yes @redocly/cli lint docs/api/openapi.yaml --max-problems 5
```

完成记录：

- 稳定契约文件：`docs/api/openapi.yaml`。
- 解析结果：45 个 path，56 个 operation。
- `/form-configs` 已合并为单一 path，并同时保留 `get` 与 `post`。
- Redocly 仍提示 lint warning，主要是缺少 `operationId`、4xx 响应和 license 字段；这些属于后续契约细化，不阻塞当前解析冻结。

## 任务 0.1：TRD V1.1 对齐与开发计划冻结

状态：已完成。

目标：

- 读取并吸收 TRD V1.1 深度研究优化版。
- 将开发计划从旧任务 1-5 重排为可执行的 M1-M6 任务链。
- 明确默认执行口径，减少不必要阻塞。

验收结果：

- 文档明确采用 TRD V1.1 作为当前开发计划修订依据。
- 旧的“文件上传方案未确认”不再阻塞任务 4，改为默认 Uppy + MinIO 预签名/Multipart。
- 任务拆分覆盖模块化单体、轻量 DAG、状态投影、医生端脱敏、文件鉴权、AI 工具白名单、通知先落库、专项测试矩阵。
- 待确认问题只保留客户/PM 真正需要拍板的业务细节。

## 任务 1：项目骨架初始化

状态：已完成 HTTP/API 烟测。

详细任务文件：`tasks/TASK-002-project-skeleton-initialization.md`。

目标：

- 初始化模块化单体后端和 Vue3 前端。
- 建立本地开发命令、环境变量模板、Docker Compose 基础服务。

范围：

- 后端 Spring Boot / RuoYi-Vue-Pro 基线。
- 前端 Vue3 + Element Plus 基线。
- MySQL、Redis、MinIO 本地服务。
- `.env.example`，不包含真实密钥。
- 基础登录和角色可运行。
- 后端模块目录按 V1.1 划分：system-auth、clinic-user、order-form、order-status、workflow-definition、workflow-runtime、check-rework、worklog-performance、file-center、message-design、bill-logistics、ai-gateway、notification-ws。

非目标：

- 不做业务模块。
- 不接真实 DeepSeek Key。

验收标准：

- 本地能启动前后端。
- 能登录至少 ADMIN 测试账号。
- MySQL、Redis、MinIO 均可连通。
- README 更新真实运行命令。

当前环境风险：

- 本机缺少 Java Runtime 和 Maven/Gradle。若不先安装 JDK/Maven，则只能创建后端文件结构，不能本机编译运行后端。
- Docker CLI 和 Colima 可用，但当前 Docker daemon 未运行。如选择容器化后端构建，还需在任务 1 开始时启动 Colima 或切换到可用 Docker context。

完成记录：

- 已选择并执行路线 A：本机 JDK 21 + Maven。
- 已安装 Homebrew `openjdk@21` 和 `maven`。
- 已新增后端 Maven 多模块骨架：`backend/`。
- 已新增前端 Vue3 + Element Plus 骨架：`frontend/`。
- 已新增 MySQL、Redis、MinIO 的 `compose.yaml`。
- 已新增 `.env.example`、根目录 `package.json`、`pnpm-workspace.yaml`、`scripts/with-jdk21.sh`、`scripts/check-toolchain.sh`。

验收结果：

- `npm run check:toolchain`：通过。
- `npm run test:backend`：通过，16 个 Maven 模块成功。
- `npm run install:frontend`：通过。
- `npm run build:frontend`：通过。
- `npm run compose:config`：通过。
- `npm run compose:up`：通过，MySQL、Redis、MinIO 均 healthy。
- 后端 health、ADMIN login、`/auth/me` API：通过。
- 前端 dev server 首页 HTTP 加载：通过。
- Vite `/api` 代理 health/login：通过。

机器验收：

- `acceptance.json` 已新增 `TASK-002` 文件存在和关键章节检查。

剩余限制：

- 当前 ADMIN 登录为骨架烟测，不是正式 RuoYi-Vue-Pro 权限体系。
- 后端尚未连接 MySQL、Redis、MinIO。
- 浏览器点击级 smoke 未自动化执行；当前完成的是构建、HTML 加载、API 和 Vite 代理级验收。

## 任务 2：数据库模型与 9 条工序链初始化

状态：下一步开始。

目标：

- 建立 TRD V1.1 核心业务表与索引。
- 初始化 9 条预定义工序链。

范围：

- 用户权限复用 RuoYi；新增或扩展 clinic、customer_preference、orders、order_status_history、order_external_projection、form_field_config。
- 工艺流定义：`workflow_chain`、`workflow_node`、`workflow_edge`。
- 工序实例：`order_process_instance`、`order_process_node`、`order_process_edge`。
- 检查返工：`check_record`、`rework_record`。
- 工时绩效：`work_log`，`work_log_pause_segment` 作为建议项，排期紧可先累计 pause_duration。
- 文件、消息、设计稿、账单物流、AI、通知相关表：`file_resource`、`file_access_audit`、`order_message`、`message_review_log`、`design_draft`、`order_bill`、`order_logistics`、`ai_audit_log`、`notification_event`、`user_notification`。
- 9 条工艺链的 chain/node/edge 种子数据。
- Flyway 或 Liquibase 迁移方案。

验收标准：

- 9 条工序链可查询。
- 每条链有节点和边。
- 支持分支、并联、可选节点的数据表达。
- 订单实例可引用 `chain_version`。
- 表结构包含状态投影、实例边表、返工、文件审计、AI 审计、通知事实来源。

## 任务 3：订单状态投影与医生端脱敏基础

状态：待任务 2 后开始。

目标：

- 实现 `internal_status` / `external_status` 状态模型。
- 建立 `OrderStatusProjector`、医生端外部投影和安全读模型。

范围：

- `OrderStatusService`。
- `OrderStatusProjector`。
- `order_status_history`。
- `order_external_projection`。
- `OrderDoctorVO`。
- `OrderInternalDTO`。
- `DoctorOrderAssistantReadModel`。
- 医生端接口、医生端 WebSocket、医生端文件访问、AI-3 的统一脱敏测试。

验收标准：

- 状态变更统一走服务。
- `external_status` 不允许前端传值，也不允许业务模块随意写。
- 内部状态变化后能刷新外部投影。
- 医生端响应不含内部字段。
- 跨诊所访问返回 403 或空数据。
- AI-3 只能读取医生端安全读模型。

## 任务 4：文件上传与访问权限

状态：待任务 1 后可开始。

目标：

- 支持医生下单附件、消息附件、设计稿、账单文件。

范围：

- MinIO 私有桶。
- Uppy 上传。
- 后端生成预签名上传参数；大文件按阈值启用或预留 S3 Multipart。
- 上传完成后调用 complete，后端 `statObject` 校验对象存在、大小、类型、etag。
- `file_resource.upload_status`。
- 预览/下载签名 URL。
- 文件访问策略。
- 文件审计日志。

待确认：

- Multipart 阈值、文件大小、类型、数量限制。

验收标准：

- 文件上传、预览、下载均写审计。
- 医生不能访问其他诊所文件，不能访问内部入检/出检附件。
- 前端不能直接拿永久 object_key。

## 任务 5A：Workflow Runtime 与工序节点状态机

状态：待任务 2 和任务 3 后开始。

目标：

- 实现订单工序实例化、任务池、派工转派、DAG 激活、并联汇合和可选节点。

验收标准：

- 并联节点必须全部完成或跳过，汇合节点才进入 READY。
- 条件不满足的可选节点默认不生成；人工跳过才生成 SKIPPED 并记录原因。
- 模板变更不影响历史订单实例。

## 任务 5B：入检 / 出检 / 返工 / 工时绩效

状态：待任务 5A 后开始。

目标：

- 实现生产执行闭环、返工影响范围、服务端工时与绩效统计。

验收标准：

- 未入检不能开工；未完工不能出检。
- 出检不通过生成返工记录，历史不删除。
- 返工产生新的 work_log，不能覆盖原工时。
- 工时由服务端计算，暂停不计入有效工时。
- 重复点击开始/暂停/继续/完成不会重复记录。
- WORKER 只能看本人绩效，ADMIN 看全量。

## 任务 6：消息、设计稿、账单物流与通知

状态：待任务 3 后开始。

目标：

- 跑通消息、设计稿、账单物流和 WebSocket 通知主链路。

验收标准：

- 医生只收到公开事件。
- 内部任务、返工、工时、绩效事件不推送给医生。
- 账单物流状态能更新医生端外部投影。

## 任务 7：AI Gateway 与 5 个 AI 智能体

状态：待任务 3 后开始，AI-3 必须晚于医生端安全读模型。

目标：

- 实现 AI 上下文构造、工具白名单、模型调用、输出防护和审计。

验收标准：

- AI-3 只能使用 `DoctorOrderAssistantReadModel`。
- AI-3 被询问内部工序、员工、返工、工时、绩效时，只能拒绝或回答公开状态。
- 所有 AI 调用写 `ai_audit_log`。
- AI 输出只做草稿或查询结果，不自动审核、自动驳回、自动发送、自动下发正式指令。

## 任务 8：专项验收矩阵与上线准备

状态：待核心链路完成后开始。

目标：

- 按 TRD V1.1 测试矩阵完成回归、部署和交付准备。

验收标准：

- PRD 12 步主链路通过。
- 所有专项测试通过。
- 部署正式环境前完成操作手册和回归记录。

## 当前开放问题

- Multipart 阈值、文件大小、文件类型、文件数量限制。
- 动态表单字段清单是否已有客户最终确认版。
- 是否允许 ADMIN 调整进行中订单节点；默认不允许增删节点，只允许员工绑定/转派。
- 贴面路线、种植基台路线等分支是否完全由生产审核时补充 `branch_params`。
- 设计稿确认是否阻塞生产。
- AI-5 模板。
- 标准工时和预计发货算法。
- 付款状态。
