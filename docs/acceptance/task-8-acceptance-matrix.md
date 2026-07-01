# Task 8A Acceptance Matrix

更新日期：2026-07-01

## 判定规则

| 状态 | 含义 |
| --- | --- |
| PASS | 已有自动化测试和本轮或既有 HTTP/SQL smoke 覆盖，且符合当前后端最小验收范围。 |
| PARTIAL | 后端最小链路或数据模型已具备，但缺前端页面、正式 RBAC/DataScope、WebSocket、真实模型、完整契约或客户确认。 |
| BLOCKED | 需要客户/PM/外部环境确认，当前不能仅靠开发补齐。 |
| NOT_STARTED | 当前仓库尚未实现该产品能力。 |

## 依据

- PRD V1.0：12 步主链路、主链路验收、脱敏验收、权限验收、AI 功能验收、设计稿补充验收。
- TRD V1.1：12 步验收点、专项测试矩阵、M6 联调测试上线标准。
- 团队执行文档：M6 要求“专项测试通过，回归通过，部署正式环境，12 步验收清单逐条过，操作手册交付”。
- 当前实现证据：`OrderStatusProjectionTests`、`FileAccessTests`、`WorkflowRuntimeTests`、`CheckWorklogPerformanceTests`、`MessageDesignBillNotificationTests`、`AiGatewayTests` 和既有 HTTP/SQL smoke 记录。

## PRD / TRD 12 步主链路

| 步骤 | 验收点 | 当前状态 | 当前证据 | 上线缺口 |
| --- | --- | --- | --- | --- |
| 1 | 医生选择产品类型、填写动态表单、上传文件、提交订单。 | PARTIAL | 文件上传 token/complete/签名 URL 已由 `FileAccessTests` 覆盖；9D.2 已实现 `GET /form-configs`、医生 `POST /orders`、本人已完成医生可见文件绑定校验和前端新建订单面板；9D.10 已实现 MinIO Multipart 初始化、分片签名、complete/abort/status/pending 和医生端最小 Uppy 文件选择上传并回填 `file_id`，并补同一浏览器本地恢复上传、无本地会话服务端候选恢复和上传中断后恢复第一增量；`npm run smoke:task9d10-large-upload` 已完成 105MB 浏览器 Multipart smoke，`file_id=457` 核验为 `COMPLETED / 110100480 bytes / MULTIPART / 21 parts`；`npm run smoke:task9d10-server-resume` 已验证无本地上传会话时复用 pending `file_id=514`；`npm run smoke:task9d10-interrupted-resume` 已验证第 2 个分片中断后复用同一 `file_id=537` 完成；`OrderStatusProjectionTests` 覆盖动态表单读取、提交订单、状态历史和文件绑定越权拒绝；本轮补 `127.0.0.1:5173` CORS 与 `/form-configs` Vite proxy 后，浏览器 smoke 已创建 `ORD20260630-9D94797093` 并进入 `PENDING_REVIEW`。 | 动态表单最终字段仍待确认；当前上传入口要求先选择/创建订单后绑定文件，仍缺草稿上传、真实弱网限速/断网、完整跨设备浏览器续传和完整端到端 smoke。 |
| 2 | 客服审核、AI 翻译草稿、资料缺失提示、通过/驳回。 | PARTIAL | AI-1/AI-4 已由 `AiGatewayTests` 覆盖；9D.3 已实现 `POST /orders/{orderId}/review`、待审列表 `internal_status=PENDING_CS_REVIEW` 过滤、通过/驳回状态历史、医生通知事实和前端「客服初审」最小页面；`OrderStatusProjectionTests` 覆盖通过、驳回、错误状态和医生脱敏。 | 缺 AI 翻译草稿写入生产指令页面、资料缺失提示嵌入客服页面、驳回后医生补资料再提交、完整客服协同工作台。 |
| 3 | 生产审核通过，自动生成订单工序实例快照。 | PARTIAL | `WorkflowRuntimeTests` 覆盖 `POST /orders/{orderId}/production-review`、状态门禁、实例快照、分支过滤和模板变更隔离；9D.4 已新增前端「生产审核」最小页面，浏览器 smoke 覆盖从 `PENDING_PRODUCTION_REVIEW` 触发实例化；9D.5 已新增「工序实例」页面查看实例节点；9D.6 已补入检/出检和工时操作页面第一增量；9D.8 已新增「生产看板」第一增量，可跨状态检索并查看节点进度；9D.9 已补返工记录和终检出检入口第一增量。 | 仍缺拖拽/泳道看板、生产通知联动、终检发货拦截和完整生产端验收。 |
| 4 | 管理员绑定员工，员工在任务池收到任务。 | PARTIAL | `WorkflowRuntimeTests` 覆盖派工、转派和 `GET /tasks/mine`；9B.1 已补 WORKER Bearer token 不能派工/跳过节点；9B.3 已用 `@RequirePermission` / `PermissionInterceptor` 将派工入口纳入权限码校验；9B.4/9B.5 已补 WORKER SELF 读取工序实例、消息和文件预览的 SQL DataScope 过滤；9B.6 已补菜单权限驱动的前端入口；9D.5 已新增「派工转派」和「我的任务」页面，浏览器 smoke 覆盖 CS 绑定 worker 后 worker 任务池出现 READY 任务。 | 缺真实通知推送、完整前端任务池、完整 RuoYi 管理 UI、员工选择器/负载提示与通用 DataScope SQL。 |
| 5 | 工序入检、开工、暂停、继续、完成。 | PASS | `CheckWorklogPerformanceTests` 覆盖入检门禁、开工、暂停、继续、完工和暂停扣时；9D.6 已新增前端「入检出检」和「工时记录」第一增量；9D.8 生产看板可只读查看节点进度。 | 产品级仍需工时历史、生产通知联动和正式 RBAC/DataScope。 |
| 6 | 出检通过推进后续节点；并联全部完成才汇合。 | PASS | `WorkflowRuntimeTests` 覆盖并联汇合 READY 规则；`CheckWorklogPerformanceTests` 覆盖出检时序；9D.6 已新增出检提交入口；9D.9 已新增终检出检入口。 | 复杂 DAG 回滚、完整返工处理闭环和更多业务字典未实现。 |
| 7 | 出检不通过进入返工，记录原因、责任分类、返工工时。 | PARTIAL | `CheckWorklogPerformanceTests` 覆盖出检失败写返工、目标节点重新 READY、返工后新工时；9D.9 新增 `/reworks` 返工记录列表和前端「待返工记录」视图。 | 责任分类字典、返工状态关闭和复杂返工影响范围未完整实现。 |
| 8 | 设计稿上传、客服审核、医生确认/驳回，版本保留。 | PARTIAL | `MessageDesignBillNotificationTests` 覆盖上传、CS 审核、医生确认和医生端状态隔离；9D.1 医生订单工作台可读取医生可见设计稿并处理待确认版本。 | 当前 `design_draft` 只绑定单个 `file_id`；缺多文件设计稿、三轮版本回归、预览 URL 聚合和完整前端页面。 |
| 9 | 消息按角色可见；生产端发医生前客服审核。 | PARTIAL | `MessageDesignBillNotificationTests` 覆盖 WORKER 消息待审、CS 审核后医生可见、内部备注不泄露；`NotificationWebSocketTests` 覆盖在线通知推送；`NotificationRestTests` 覆盖通知列表、未读数和已读隔离；`NotificationBroadcastTests` 覆盖 Redis 广播代码路径；前端骨架已有通知中心和 WebSocket 实时刷新入口；9D.1 医生订单工作台可读公开消息并发送给客服。 | 缺完整消息附件 URL 聚合、真实双实例 Redis 联调和生产网关验收。 |
| 10 | 账单上传、物流录入，医生端状态变为已发货。 | PARTIAL | `MessageDesignBillNotificationTests` 覆盖账单上传、物流发货、`external_status=SHIPPED`；9D.1 医生订单工作台可读账单物流。 | 缺账单预览 URL 聚合、付款状态和物流平台接入。 |
| 11 | 医生端 AI 只能回答外部状态/物流/账单，不泄露内部信息。 | PASS | `AiGatewayTests` 覆盖 AI-3 安全拒绝、只读 `DoctorOrderAssistantReadModel`、写 `ai_audit_log`。 | 真实 DeepSeek 接入后仍需复测提示词、输出防护和审计。 |
| 12 | 医生确认收货，订单完成；审计与通知记录完整。 | PARTIAL | `OrderStatusProjectionTests` 覆盖确认收货；通知事实表在任务 6 覆盖；9D.1 医生订单工作台已有确认收货按钮和浏览器 smoke。 | 缺完整端到端主链路、操作审计完整覆盖和真实通知推送生产验收。 |

## PRD 主链路验收

| 验收项 | 当前状态 | 当前证据 | 上线缺口 |
| --- | --- | --- | --- |
| 医生下单全流程 | PARTIAL | 9D.2 已实现医生读取动态表单、提交订单进入 `PENDING_REVIEW`、绑定本人已完成文件和前端最小新建订单面板；9D.10 已补医生端最小 Uppy 文件选择、Multipart 上传、status 查询、本地恢复上传、服务端候选恢复、中断恢复并回填 `file_id`；9D.3 浏览器 smoke 已覆盖医生创建订单后 CS 在客服初审页面处理该订单；本轮浏览器 smoke 覆盖 `127.0.0.1:5173` 医生登录、动态表单读取和创建订单 `ORD20260630-9D94797093`；100MB+ 上传 smoke 覆盖医生浏览器创建测试订单并上传 105MB 附件；服务端候选恢复 smoke 覆盖无本地会话时复用 pending `file_id=514`；中断恢复 smoke 覆盖第 2 个分片失败后复用同一 `file_id=537` 完成。 | 缺草稿、驳回后补资料再提交、动态表单最终字段、真实弱网限速/断网、完整跨设备浏览器恢复和完整端到端验收。 |
| 大文件上传 | PARTIAL | `FileAccessTests` 覆盖 MinIO 预签名 PUT、Multipart initiate/part-url/status/pending/complete/abort、审计、status/pending 不泄露 `object_key`、医生写路径越权拒绝和 pending 只列当前医生本人候选；前端 9D.10 已接入最小 Uppy 文件选择、分片直传、本地恢复会话、服务端候选恢复和手动取消入口；`npm run smoke:task9d10-large-upload` 通过本地 105MB 浏览器 Multipart smoke，数据库核验 `file_id=457` 为 21 个分片完成；`npm run smoke:task9d10-server-resume` 通过，确认完成的 `file_id=514` 等于预创建 pending `file_id`；`npm run smoke:task9d10-interrupted-resume` 通过，确认中断后 `multipart/status` 保留 1 个已完成分片并复用同一 `file_id=537` 完成。 | 缺真实弱网限速/断网、完整跨设备浏览器续传、文件类型/数量最终限制和测试/正式 bucket 隔离验收。 |
| 客服审核通过 | PARTIAL | 9D.3 已实现 CS/ADMIN 审核接口、前端「客服初审」入口、状态历史和医生通知事实；浏览器 smoke 覆盖 CS 点击「通过初审」后订单进入 `PENDING_PRODUCTION_REVIEW`，9D.4 已串到生产审核第一增量。 | 缺 AI 翻译草稿确认写入生产指令、完整客服订单详情和补资料再提交链路。 |
| 外文翻译 | PARTIAL | `AiGatewayTests` 覆盖 AI-1 草稿，不自动写入。 | 缺客服确认后写入生产指令接口。 |
| 工序链实例化 | PARTIAL | `WorkflowRuntimeTests` 覆盖实例化和快照；9D.4 前端「生产审核」可选择工序链并触发实例化；9D.5 已补工序实例详情、任务池和派工页面第一增量；9D.6 已补入检/出检和工时操作页面第一增量；9D.8 已补跨状态生产看板第一增量；9D.9 已补返工终检第一增量。 | 缺实时生产通知联动、终检发货拦截和完整生产端验收。 |
| 工序链自动匹配 | PASS | `WorkflowRuntimeTests` 覆盖 `intake_branch` / `branch_params` 分支过滤。 | 贴面/种植等内部路线仍需客户确认。 |
| 并联节点执行 | PASS | `WorkflowRuntimeTests` 覆盖并联汇合。 | 缺前端并行任务可视化。 |
| 入检出检强制 | PASS | `CheckWorklogPerformanceTests` 覆盖未入检不能开工、未完成不能出检；9D.6 已新增页面级入检/出检提交入口；9D.9 已新增终检出检入口。 | 缺完整返工闭环、终检报告和出货前拦截。 |
| 返工流程 | PARTIAL | `CheckWorklogPerformanceTests` 覆盖返工记录和重新开工；9D.9 已新增 `/reworks` 只读列表、WORKER 本人范围过滤和待返工记录页面。 | 缺责任分类、返工关闭和复杂 DAG 回滚策略。 |
| 工时计算 | PASS | `CheckWorklogPerformanceTests` 覆盖暂停段扣除。 | 标准工时仍待客户确认。 |
| 绩效统计 | PARTIAL | `CheckWorklogPerformanceTests` 覆盖最小只读统计、WORKER 本人范围、ADMIN 查询指定员工，以及 CS Bearer token 403；9D.7 已新增前端绩效统计第一增量，展示完成工序、有效工时、返工次数、准时率、通过率和工时效率。 | 缺 6 项指标完整公式、绩效明细、周期筛选、标准工时配置和正式管理看板。 |
| 终检发货 | PARTIAL | 物流发货更新 `SHIPPED` 已覆盖；9D.9 已新增复用 `/check-records` 的终检出检第一增量。 | 缺终检专用角色/权限点、终检报告和出货前强制拦截。 |
| 医生确认收货 | PASS | `OrderStatusProjectionTests` 覆盖 `COMPLETED` 投影；9D.1 医生订单工作台已有页面入口。 | 仍需完整 12 步端到端页面验收。 |

## TRD 专项测试矩阵

| 专项 | 当前状态 | 当前证据 | 上线缺口 |
| --- | --- | --- | --- |
| 权限脱敏 | PASS | `OrderStatusProjectionTests`、`MessageDesignBillNotificationTests`、`AiGatewayTests` 覆盖医生端不返回内部字段；`BearerIdentityTests` 覆盖 Bearer 医生 token 下的脱敏与跨医生 403；9B.1 新增 `AccessControlService` 并覆盖医生不能读检查记录、WORKER 不能派工/跳过、CS 不能查绩效；9B.2 覆盖数据库账号登录、权限码、data scope 和医生账号范围；9B.3 新增 `@RequirePermission` / `PermissionInterceptor` 并用 `PermissionInterceptorTests` 覆盖医生、工人、客服账号入口权限边界；9B.4 覆盖业务 Controller 身份收口和订单/工序实例 SQL DataScope；9B.5 覆盖文件、协同订单范围和 AI 内部上下文 SQL DataScope；9B.6 覆盖菜单权限与医生端前端入口隐藏。 | 完整 RuoYi RBAC/DataScope 接入后必须重跑全矩阵。 |
| 文件越权 | PASS | `FileAccessTests` 覆盖跨医生/跨诊所/INTERNAL 文件拒绝和审计。 | 仍需 Bearer token 多文件场景和正式 RuoYi 登录态复测。 |
| AI 越权 | PASS | `AiGatewayTests` 覆盖 AI-3 内部问题安全拒绝。 | 接入真实模型后必须重跑。 |
| 状态投影 | PASS | `OrderStatusProjectionTests` 覆盖 `OrderStatusService`、历史记录和外部投影。 | 更多业务事件映射需在完整主链路中复测。 |
| 并联汇合 | PASS | `WorkflowRuntimeTests` 覆盖未全部完成时汇合节点不 READY。 | 复杂链路可补更多产品类型回归。 |
| 入检/出检 | PASS | `CheckWorklogPerformanceTests` 覆盖入检门禁、出检时序、返工、`/reworks` WORKER 范围和 DOCTOR Bearer token 403；9D.9 已新增终检出检入口。 | 终检报告、发货前拦截和正式 RuoYi 角色权限点待补。 |
| 工时幂等 | PARTIAL | `CheckWorklogPerformanceTests` 覆盖最小重复返工工时不覆盖历史。 | 重复点击 start/pause/resume/finish 的幂等边界需补更细测试。 |
| WebSocket / 通知 | PARTIAL | 任务 6 已落库 `notification_event` / `user_notification`；任务 9C.1 已实现 `/ws/connect?token=...` 单实例在线推送，并覆盖医生 payload 不泄露内部备注；任务 9C.2 已实现通知列表、未读/已读 REST 与前端通知中心入口；任务 9C.3 已实现前端 WebSocket 实时刷新和 Redis 广播代码路径。 | 缺真实双后端实例 Redis 联调、心跳/重连压测、Nginx/HTTPS 生产验收和监控告警。 |
| API YAML | PASS | `npm run check:openapi` 覆盖自定义契约检查、Swagger validate、Redocly lint；当前 61 个 path / 72 个 operation / 72 个唯一 `operationId`，Redocly warning 清零；9D.1 已补 `/orders` 响应 schema，9D.2 已补下单 schema，9D.3 已补客服审核请求/响应和 `internal_status` 过滤参数，9D.4 已校正生产审核状态门禁和权限描述，9D.5 已校正派工/转派权限和 `tasks/mine` 的 `READY` 过滤；9D.9 已补 `/reworks`，9D.10 已补 Multipart 6 个文件接口和 schema。 | 后续新增正式 RBAC/DataScope、WebSocket 生产接入、真实模型、前端配套接口时必须继续同步契约。 |

## 设计稿补充验收

| 验收项 | 当前状态 | 当前证据 | 上线缺口 |
| --- | --- | --- | --- |
| 设计稿上传 | PARTIAL | `MessageDesignBillNotificationTests` 覆盖单文件设计稿上传。 | 缺多文件设计稿、前端上传区和预览 URL 聚合。 |
| 客服审核通过 | PASS | `MessageDesignBillNotificationTests` 覆盖 `PENDING_DOCTOR_CONFIRM` 和医生通知；通知中心入口和未读/已读 REST 已完成第一增量。 | WebSocket 已有后端单实例第一增量；仍缺浏览器实时接入和完整设计稿页面。 |
| 客服驳回 | PARTIAL | service 支持 reject 分支，当前测试主覆盖 approve。 | 需补客服驳回自动化和上传人通知 smoke。 |
| 医生确认 | PASS | `MessageDesignBillNotificationTests` 覆盖 `DOCTOR_CONFIRMED`；9D.1 医生订单工作台已有待确认设计稿处理入口。 | 仍需补多轮版本和预览 URL 页面验收。 |
| 医生驳回 | PARTIAL | service 支持 reject 分支，当前测试主覆盖 confirm。 | 需补医生驳回原因和通知 smoke。 |
| 版本记录 | PARTIAL | service 使用 `version_no=max+1`。 | 缺三轮驳回-重传回归和不可删除验收。 |
| 医生端隔离 | PASS | `MessageDesignBillNotificationTests` 覆盖医生不可见 `PENDING_CS_REVIEW`。 | 需补 `CS_REJECTED` 显式回归。 |

## 上线结论

当前不能进入正式上线。原因不是底层链路全部失败，而是产品级上线仍缺以下硬条件：

- 正式 RuoYi-Vue-Pro RBAC/DataScope 尚未完全替换 `X-Bootstrap-*` 本地烟测头；9B.1/9B.2/9B.3/9B.4/9B.5/9B.6/9B.7 已完成后端集中权限守卫、数据库化 RBAC/DataScope 基础、菜单/部门/岗位和前端权限路由第一增量、权限注解/统一拦截器、统一身份参数解析、订单/工序实例 SQL DataScope 第一增量、文件/协同/AI DataScope 扩展和生产鉴权启动门禁，但仍缺完整 RuoYi 管理 UI、生产级 Spring Security/JWT 和通用 DataScope SQL 覆盖。
- 医生端订单读取工作台、医生下单第一增量、客服初审第一增量、生产审核第一增量、生产任务入口第一增量、质检/工时第一增量、绩效统计第一增量和生产看板第一增量已完成；管理端大部分业务页面仍未实现，客服端也仍缺完整协同工作台。
- 终检第一增量、Multipart 第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器上传 smoke 已补，但终检报告/出货前拦截、真实 DeepSeek、真实弱网/跨设备浏览器续传仍未完成；通知未读/已读 REST、前端通知中心、浏览器 WebSocket 实时接入和 Redis 广播代码路径已完成第一增量，但真实双实例 Redis 联调、生产网关验收和完整业务页面仍未达到上线标准。
- OpenAPI 已完成当前后端基线二次冻结；后续新增接口仍需持续同步。
- 客户/PM 仍需确认动态表单字段、AI-5 模板、标准工时、付款状态、Multipart 限制等。

- 9D.20 已补复杂返工影响范围第一增量：返工目标后续 READY/COMPLETED 节点会重置为 PENDING。
