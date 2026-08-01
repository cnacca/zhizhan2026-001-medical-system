# PROJECT - AI 智能下单与生产协同平台

## 一句话定位

给牙科定制工厂搭建一套「医生在线下单 + 客服审核协同 + 工厂生产流程管理 + 客户进度查询」的平台；一期业务基础已形成，当前按二期 M2 / M3 / M6 增量交付。

医生只能看到外部简化进度；工厂内部工序、员工、工时、入检/出检、返工、绩效等信息必须对医生端和医生端 AI 隔离。

## 当前依据

- 2026-08-01 D-178 将既有版本化目录能力以管理端“下单内容设置”开放：产品和材料可在草稿中新增、修改、停用或安全删除未引用项，并维护产品－材料适用绑定；配置页与工序工时页统一管理端蓝色紧凑视觉，历史订单快照不变，Task 8 保持 `NOT_READY`。
- 2026-08-01 D-177 恢复管理端“工序工时设置”草稿入口，继续按现有《生产流程》九条固定工序链填写；空值为待设置，正式运行时开关仍关闭，草稿不进入交期、产能或绩效，Task 8 保持 `NOT_READY`。
- 2026-07-31 D-176 收口：客户正式标准工时未提供，管理端菜单隐藏，17/19 分钟验收版本转为 INACTIVE，正式运行时开关默认关闭；维护底座保留，验收分钟不用于交期、产能或绩效。材料运行期边界和同一新订单 `ORD20260731-9A5DE848E7` 的生产到收货浏览器链已完成；Task 8 保持 `NOT_READY`。
- 2026-07-31 GOAL-031 / TASK-032 产品目录 V2 与病例订单组改造已完成 A～G 本地实现和当前可用配置下的 H 核心浏览器闭环，批准口径见 D-174/D-175，实施方案见 `docs/development/product-ordering-v2-implementation-plan-20260731.md`。本阶段保留 `orders` 作为产品子订单，已落地资料标准化、兼容模型、可持续维护的产品配置中心、动态表单/价格/文件、现有九条工序链节点的版本化标准工时、多产品向导、普通产品、隐形正畸和权限审计；后端 250 项、前端构建、OpenAPI 和阶段专项检查通过。客户正式业务值与完整外部/UI 验收仍未齐，不开放工序链结构编辑，Task 8 保持 `NOT_READY`。
- 2026-07-28 二期需求已完成冻结：四项产品/技术口径见 `D-171`，里程碑现状与缺口见 `docs/acceptance/phase-two-milestone-gap-matrix-20260728.md`。GOAL-026 / TASK-027 已完成 M2 的 RuoYi 真实运行时渐进桥接第一批；下一批优先做权限/DataScope 只读兼容适配。M2、M3、M6 和一期 Task 8 均未完成。
- 2026-07-26 二期设计协作第一批：`GOAL-025` / `TASK-026` 已完成。本阶段在一期事实表上增量实现设计任务自主领取、管理员有理由转派、多文件版本、个体组长内审、医生确认 / 驳回、文件隔离和生产门禁，并接通生产端、管理端与 Doctor Portal V2；目标测试、OpenAPI、前端构建和本地真实浏览器 smoke 通过。该结果不代表 M2 / M3 / M6、正式部署、客户确认或四份 PDF 手册完成，一期 Task 8 保持 `NOT_READY`。
- 2026-07-24 RuoYi 核心源码基础：`GOAL-024` / `TASK-025` 已完成。官方 `master-jdk17` 固定到提交 `ec3f7cbf73e88514a70a6b59d365092ee470603d`，真实 dependencies/framework/infra/system/server 源码以隔离 reactor 引入并通过 21 模块构建；无关模块、硬编码示例凭据和完整 seed 数据未引入。当时只完成隔离源码基础；GOAL-026 已在不改变现有登录、Token、菜单、DataScope 或业务授权结果的前提下增加第一条运行时桥接。
- 2026-07-15 本地剩余项收口：GOAL-023 / TASK-024 已完成 Bearer 默认边界、质量日期趋势、设计稿驳回原因/三版本、种植产品动态表单基线和隔离种植 STL 12步 smoke。原 PRD 38项当前为30 PASS、1 PARTIAL、0 MISSING、7 EXTERNAL_ACCEPTANCE；标准工时业务数据与真实环境验收仍未完成，Task 8 保持 `NOT_READY`。
- 2026-07-15 P0 本地代码收口：GOAL-022 / TASK-023 已关闭 workflow definition/实例内部读取边界、loopback 登录 CORS、产品类型自动选链、设计确认和 OUT/PASS 生产门禁以及 ADMIN 技工账号创建/编辑/登录闭环。原 PRD 38项当前为21 PASS、8 PARTIAL、1 MISSING、8 EXTERNAL_ACCEPTANCE；Task 8 仍保持 `NOT_READY`。
- 2026-07-15 验收口径校正：GOAL-021 / TASK-022 以原始 PRD V2 和 2026-07-06 已确认范围为准，废止“CP-001 到 CP-009 全部逐项书面确认”的活动口径。当前只有动态表单最终字段、文件限制 2 项待客户 / PM 产品确认；AI-5 模板和标准工时属于输入资料，培训、真实环境和总体验收属于后置证据。PRD 明确逐功能签字为 0 项。38 项逐项状态见 `docs/acceptance/prd-v2-38-item-acceptance-audit-20260715.md`；Task 8 仍保持 `NOT_READY`。

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
- 客服 / CS：订单初审、AI 翻译校对、资料缺失检查、客户档案与偏好、消息审核、查看医生可见设计版本与进度、账单上传、物流录入、客服查询助手；不执行技术设计内审。
- 技工 / 生产人员：生产数据审核、设计任务自主领取、设计稿上传；拥有内审权限的组长可执行设计内审；后续生产任务仍由管理员派工，并覆盖入检、执行与工时、出检、返工、终检。
- 超级管理员：用户角色、诊所账号、9 条工序链只读查看、订单工序实例查看、派工、转派、全量绩效与审计。

## 一期必须交付

- 账号、登录、JWT / Refresh Token、RBAC 权限。
- 医生端在线下单、动态表单、草稿/补资料、文件上传、订单列表/详情、外部进度、设计稿确认、基础患者管理、基础支付流水 / 账单查看、账户设置、线上沟通、通知中心、AI 订单助手。
- 客服端订单初审、AI 翻译、资料缺失检查、客户档案与偏好、产品参数 / 价格体系维护、订单消息审核、医生可见设计稿与业务进度只读、账单 / 人工支付流水、物流录入 / 异常跟进、客服查询助手；外协管理按 2026-07-06 基准纳入一期基础登记和状态，完整成本核算另行评估。
- 生产端由单独授权人员执行生产数据审核；设计人员自主领取设计任务并上传版本，授权组长执行设计内审；普通生产员工只处理管理员派给本人的工序任务，以及入检、出检、返工、工时、绩效和终检。设备 / 物料 / 安环 / 成本 / 奖惩按 2026-07-06 基准只保留 C 类入口、基础台账、基础登记、状态更新或架构预留。
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

医生下单 -> 客服审核/AI 翻译 -> 授权生产人员审核 -> 实例化工序链并创建设计任务 -> 设计员领取/上传/提交 -> 授权组长内审 -> 医生确认设计稿 -> 管理员派工 -> 技工入检 -> 工时计时 -> 出检 -> 返工或流转下一节点 -> 终检 -> 客服录入物流 -> 医生查看物流 -> 医生确认收货。

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
- AI-5 生产备注模板何时由客户提供；这是资料输入，不是需求签字，未提供前仅做通用规范化草稿。
- 各工序标准工时属于业务数据输入，不是需求签字；PRD 未指定提供方，由项目方指定负责人并协调业务方提供。

二期设计任务的优先级、组长内审、技工放弃/超时以及 RuoYi 采用方式已按 D-171 关闭，不再列为开放问题。真实 URL、真实 Key、对象存储账号、标准工时、四份 PDF 手册和客户确认属于外部输入或后置证据，不阻塞本地可实现缺口继续开发。

以下事项已由 PRD / 2026-07-06 基准确定，不再列为待确认：进行中订单一期不增删节点、仅派工/转派；医生确认设计稿后才进入后续生产；九条工艺链和强制入检/出检直接按文档实施；一期付款和物流均为人工状态。

## 下一阶段优先级

1. 二期 M2：按渐进桥接方式让至少一项 RuoYi 权限、DataScope、审计或管理能力进入现有真实运行路径。
2. 二期 M3：把设计任务、派工、入检、执行与工时、出检、返工和终检串成统一验收路径。
3. 二期 AI：统一验证五个助手的业务入口、人工确认和安全边界；真实模型质量留待真实 Key 环境。
4. 二期 M6：准备真实环境、专项测试、四份中文 PDF 手册和客户确认。
5. 一期 Task 8 与二期里程碑分别跟踪，未满足真实外部条件前保持 `NOT_READY`。
