# Deployment Readiness Checklist

> 9D.75 正式鉴权与 DataScope 收口第一段：prod 必须 `APP_AUTH_ALLOW_ROLE_FALLBACK=false`，角色-only token 不得绕过声明权限码的接口；完整 Spring Security/JWT 和通用 DataScope 仍未完成。

> 9D.69 部署基础设施第一段：Docker / Compose / env 示例骨架已补，但真实服务器、HTTPS、镜像仓库、备份恢复、日志留存和监控告警仍未完成。

> 9D.71 AI 外部告警接收端验签 / 防重放第一段：receiver 默认关闭，真实 secret 必须外部注入；仍不代表真实 webhook 或生产外部服务联调完成。

> 9D.73 付款状态第一段：一期账单 / 物流闭环已补人工付款状态；仍不得写成真实支付系统、财务审批、对账或发票能力完成。

更新日期：2026-07-04

## 总结

当前项目不能部署正式生产环境。Task 8A/8B/9A/9B.1/9B.2/9B.3/9B.4/9B.5/9B.6/9B.7/9B.8/9C.1/9C.2/9C.3/9D.1/9D.2/9D.3/9D.4/9D.5/9D.6/9D.7/9D.8/9D.9/9D.10/9D.11/9D.12/9D.13/9D.14/9D.15/9D.16/9D.17/9D.18/9D.19/9D.20/9D.21/9D.22/9D.23/9D.24/9D.25/9D.35/9D.37/9D.38/9D.39/9D.40/9D.41/9D.42/9D.43/9D.44/9D.45/9D.46/9D.47/9D.48/9D.48.1/9D.48.2/9D.55/9D.56/9D.57/9D.58/9D.59 的结论是：后端多条最小业务链路已有自动化和 smoke 基线，当前后端基线 OpenAPI 已二次冻结，服务端 Bearer 身份基线、后端集中权限守卫、数据库化 RBAC/DataScope 基础、菜单/部门/岗位与前端权限路由第一增量、权限注解/统一拦截器、订单/工序实例 SQL DataScope 第一增量、文件/协同/AI DataScope 扩展、生产鉴权启动门禁第一增量、Refresh Token/logout 第一增量、四入口登录页与角色端口校验第一增量、WebSocket 通知第一增量、通知未读/已读 REST、前端消息中心入口、Redis 广播代码路径第一增量、医生订单工作台第一增量、医生下单第一增量、医生订单草稿/补资料第一增量、动态表单 CRUD 第一增量、设计稿多文件/多版本第一增量、终检发货拦截第一增量、终检报告第一增量、返工关闭/责任分类第一增量、返工字典第一增量、返工字典后台维护第一增量、终检专用角色 / 附件第一增量、返工通知联动第一增量、复杂返工影响范围第一增量、绩效归因联动第一增量、返工影响审计可视化第一增量、返工影响筛选第一增量、返工影响图形化第一增量、客服协同闭环第一增量、客服资料缺失提示与 AI 翻译草稿确认第一增量、绩效明细第一增量、真实 DeepSeek 接入第一增量、AI 预算熔断/降级第一增量、AI 预算外部告警待发送事实第一增量、AI 分角色预算第一增量、AI 分模型预算第一增量、AI 提示词版本与输出防护第一增量、AI 外部告警发送器第一增量、AI 成本趋势第一增量、AI 真实外部渠道适配第一增量、AI 外部告警调度器第一增量、AI 外部告警重试/死信第一增量、AI 外部告警幂等/并发领取第一增量、AI 外部告警 webhook 签名/鉴权第一增量、AI 外部告警监控/运维可观察第一增量、AI 外部告警 outbox 列表/筛选第一增量、AI 外部告警失败/死信可见性第一增量、客服初审第一增量、生产审核第一增量、生产任务入口第一增量、入检/出检/工时操作页面第一增量、绩效管理页面第一增量、生产看板第一增量、返工终检第一增量、Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器上传 smoke 已落地；正式上线仍需要先补齐完整 RuoYi 管理 UI、完整前端业务页面、WebSocket 生产网关/真实多实例验收、生产级 AI 治理、真实外部服务配置和客户确认项。

Task 8 readiness 终检报告第一增量已生成：`docs/deployment/task-8-final-readiness-report.md`。该报告把本 checklist 和 acceptance matrix 中仍为 PARTIAL / NOT_READY 的关键项整理为上线前缺口清单，Task 8 状态仍为 `NOT_READY`。

部署安全 / 环境变量 readiness 检查第一增量已补：`npm run check:deployment-env` 会检查 README、`.env.example`、`application.yml`、`application-prod.yml` 和本 checklist 中的生产环境变量边界、默认关闭能力和禁止提交真实密钥说明。

验收矩阵机器可读缺口清单第一增量已补：`acceptance.json` 维护 `task8_readiness_gaps`，`npm run check:task8-readiness-gaps` 可列出当前仍未 READY 的关键上线缺口。本 checklist 仍保持 Task 8 `NOT_READY`。

12 步主链路浏览器 smoke 第一增量已补：`npm run smoke:task9d62` 固定 PRD/TRD 12 步主链路的四端浏览器入口和页面/控件可达断言；当前仍是入口 smoke，不代表完整业务数据端到端已全部跑通。

## 必须完成后才能上线

| 类别 | 当前状态 | 必须完成项 |
| --- | --- | --- |
| 正式鉴权与数据范围 | PARTIAL | 已支持数据库账号、角色、权限码、data scope、基础菜单/部门/岗位、前端菜单权限、服务端签发 HMAC Bearer token、refresh token 哈希存储/刷新/logout 吊销、后端 `AccessControlService` 集中守卫、`@RequirePermission` / `PermissionInterceptor` 入口权限校验、业务 Controller 统一身份参数解析、订单/工序实例/文件/协同订单范围/AI 内部上下文 SQL DataScope 过滤、9D.24 四入口登录页与角色端口校验，以及 prod profile 启动门禁；仍需接入 RuoYi-Vue-Pro 完整管理 UI、通用 DataScope SQL 覆盖、生产级 Spring Security/JWT、refresh token 轮换、access token 黑名单和多设备会话策略。 |
| 前端业务页面 | PARTIAL | 已有医生订单读取工作台第一增量、医生下单第一增量、医生订单草稿/补资料第一增量、四入口登录页第一增量、动态表单 CRUD 第一增量、设计稿多文件/多版本第一增量、设计稿预览 URL 聚合第一增量、账单物流预览/录入闭环第一增量、终检发货拦截第一增量、终检报告第一增量、返工关闭/责任分类第一增量、返工字典第一增量、返工字典后台维护第一增量、终检专用角色 / 附件第一增量、返工通知联动第一增量、复杂返工影响范围第一增量、绩效归因联动第一增量、绩效明细第一增量、返工影响审计可视化第一增量、返工影响筛选第一增量、返工影响图形化第一增量、客服协同闭环第一增量、客服资料缺失提示与 AI 翻译草稿确认第一增量、客服初审第一增量、生产审核第一增量、生产任务入口第一增量、质检工时第一增量、绩效管理第一增量、生产看板第一增量、返工终检第一增量、Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器上传 smoke：订单列表/详情、公开消息、医生可见设计稿、设计稿多文件版本展示、设计稿预览链接、账单文件绑定、账单预览链接、账单物流、医生 AI、确认收货、四入口登录、动态表单读取、后台动态表单新增/编辑/停用、返工字典新增/编辑/停用、提交订单、保存草稿、继续编辑/补资料、已完成 file_id 绑定入口、医生端最小 Uppy 文件选择/上传并回填绑定、本地恢复上传、无本地会话候选恢复、中断恢复、105MB 浏览器 Multipart smoke、客服待审列表和通过/驳回表单、客服协同台待审核消息、订单消息上下文、消息通过/驳回、客服资料缺失提示、AI 翻译草稿、人工写入生产备注、内部订单页多文件设计稿上传、生产待审列表、工序链实例化入口、工序实例详情、派工转派、worker 我的任务、入检/出检提交、工时 start/pause/resume/finish、绩效统计快照、绩效责任归因卡片、绩效工时明细、跨状态生产检索、节点进度、待返工记录、终检出检入口、返工影响节点审计、返工影响筛选、返工影响图、返工关闭入口、返工关闭字典下拉、返工创建/关闭内部通知、返工目标后续节点状态重置、终检报告生成入口和生产看板最小发货入口；本轮已补 `127.0.0.1:5173` 本地登录 CORS、`/form-configs` Vite proxy、医生下单浏览器 smoke、9D.11 草稿提交浏览器 smoke、9D.12 动态表单 CRUD 浏览器 smoke、9D.13 设计稿多文件浏览器 smoke、9D.14 发货前终检门禁、9D.16 终检报告接口/前端入口、9D.17 返工关闭入口、9D.18 返工字典入口、9D.19 返工通知事实、9D.20 返工影响范围后端第一增量、9D.21 绩效归因联动第一增量、9D.22 返工影响审计可视化第一增量、9D.23 返工影响筛选第一增量、9D.24 四入口登录页与真实 Chrome smoke、9D.25 绩效明细第一增量、9D.55 返工字典后台维护第一增量、9D.56 终检专用角色 / 附件第一增量、9D.57 返工影响图形化第一增量、9D.58 客服协同闭环第一增量、9D.59 客服资料缺失提示与 AI 翻译草稿确认第一增量、9D.60 设计稿预览 URL 聚合第一增量和 9D.61 账单物流预览/录入闭环第一增量；仍缺实时自动保存、真实弱网/跨设备浏览器续传、付款状态、真实物流平台、终检 PDF/签名、绩效周期筛选、完整公式和申诉闭环。 |
| WebSocket / 通知 | PARTIAL | 已实现 `/ws/connect?token=...` 单实例在线推送，基于 `notification_event` / `user_notification` 派发脱敏 payload，并写 `delivered_at`；已实现通知列表、未读数、单条已读、全部已读 REST 接口、前端通知中心实时刷新、Redis 广播代码路径、AI 预算超限内部通知第一增量、预算通知策略开关第一增量、外部告警待发送事实第一增量、AI 外部告警发送器第一增量、AI 真实外部渠道适配第一增量、AI 外部告警调度器第一增量、AI 外部告警重试/死信第一增量、AI 外部告警幂等/并发领取第一增量、AI 外部告警 webhook 签名/鉴权第一增量、AI 外部告警监控/运维可观察第一增量、AI 外部告警 outbox 列表/筛选第一增量和 AI 外部告警失败/死信可见性第一增量。仍需真实双后端实例 Redis 联调、心跳/重连压测、Nginx/HTTPS 生产验收、接收端验签/防重放联调、生产 webhook 联调和完整业务页面联动。 |
| OpenAPI 契约 | READY_FOR_CURRENT_BASELINE | 当前 path / operation 数量以 `npm run check:openapi` 输出为准；已补唯一 `operationId`、统一 4xx/503/default、关键 DTO/schema、license；9B.8 已补 `/auth/refresh`、`/auth/logout`、`RefreshTokenRequest`、`refreshToken` 和 `refreshExpiresAt`；9D.1 已补 `/orders` 当前实现响应 schema，9D.9 已补 `/reworks` 和 `ReworkRecordResponse`，9D.10 已补 Multipart 文件上传、status 恢复与 pending 候选接口，9D.11 已补 `DRAFT` 外部状态、`UpdateOrderRequest` 和 `PUT /orders/{orderId}` 草稿/补资料契约；9D.12 已补动态表单 `status`、create/update 响应和逻辑停用描述；9D.13 已补设计稿 `file_ids/file_count` 响应；9D.14 已补 `/orders/{orderId}/logistics` 发货前终检 `OUT/PASS` 门禁描述；9D.15 已补 AI 端点 DeepSeek 适配、deterministic fallback 和 AI-3 `SAFE_REFUSAL` 描述；9D.16/9D.56 已补 `/final-inspection-reports`、`/final-inspection-reports/{orderId}`、终检报告 schema、`attachment_file_ids` 和 `final-inspection:manage` 专用权限说明；9D.17 已补 `/reworks/{reworkId}/close` 和 `ReworkCloseRequest`；9D.18 已补 `/reworks/dictionaries` 和 `ReworkDictionariesResponse`；9D.19 已补 `REWORK_CREATED` / `REWORK_CLOSED` 通知事件说明；9D.21 已补 `PerformanceStats` 绩效责任归因字段；9D.22 已补 `ReworkRecordResponse` 返工影响审计字段；9D.23 已补 `/reworks` 的 `has_impacted_nodes` 查询参数；9D.24 已补 `LoginRequest.portal` 登录入口枚举和 `/auth/login` 入口角色匹配说明；9D.25 已补 `/performance/details` 和 `PerformanceDetail` schema；9D.42 已补 `/ai/governance/cost-trend` 和 `AiGovernanceCostTrendResponse`；9D.43 已补 `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED` / `AI_EXTERNAL_ALERT_WEBHOOK_URL` webhook 发送说明；9D.44 已补 `AI_EXTERNAL_ALERT_SCHEDULER_ENABLED` 调度器说明；9D.45 已补 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS` 和 `DEAD_LETTER` 说明；9D.46 已补 `SENDING` 领取态和重复触发不重复外呼说明；9D.47 已补 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED` / `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET` 和 `X-AI-Alert-Signature` HMAC 签名说明；9D.48 已补 `/ai/governance/external-alerts/summary` 和 `AiExternalAlertSummaryResponse`；9D.48.1 已补 `/ai/governance/external-alerts` 和 `AiExternalAlertListResponse`；9D.48.2 已补 `AiExternalAlertRecord.attempts`、脱敏 `last_error` 和 `last_attempted_at`；Swagger validate 与 Redocly lint 通过。后续新增接口必须持续同步。 |
| 文件上传 | PARTIAL | 已实现 MinIO Multipart 初始化、分片签名、status、pending、complete/abort、审计和医生写路径越权拒绝，前端已有最小 Uppy 文件选择/上传、本地恢复上传、服务端候选恢复并回填 `file_id`；`npm run smoke:task9d10-large-upload` 已通过本地 105MB 浏览器上传，`file_id=457` 为 21 个分片完成；`npm run smoke:task9d10-server-resume` 已通过无本地上传会话时复用 pending `file_id=514` 的浏览器 smoke；`npm run smoke:task9d10-interrupted-resume` 已通过第 2 个分片中断后复用同一 `file_id=537` 的浏览器 smoke。仍需确认文件大小/类型/数量限制、真实弱网/跨设备浏览器续传和测试/正式 bucket 隔离。 |
| AI 接入 | PARTIAL | 已完成 DeepSeek OpenAI-compatible `/chat/completions` 适配第一增量，默认关闭真实模型，本地/CI 使用 deterministic fallback；启用时 AI-1/AI-2/AI-3 公开问答/AI-5 可调用 DeepSeek，AI-3 内部问题继续本地 `SAFE_REFUSAL`；9D.26 到 9D.48.2 已补限流、成本审计、模型重试、失败审计、治理摘要、预算阈值、预算跨线审计、预算超限内部通知第一增量、预算通知策略开关第一增量、预算熔断/降级第一增量、外部告警待发送事实第一增量、分角色预算第一增量、分模型预算第一增量、提示词版本审计、输出防护第一增量、外部告警发送器第一增量、成本趋势第一增量、AI 真实外部渠道适配第一增量、AI 外部告警调度器第一增量、AI 外部告警重试/死信第一增量、AI 外部告警幂等/并发领取第一增量、AI 外部告警 webhook 签名/鉴权第一增量、AI 外部告警监控/运维可观察第一增量、AI 外部告警 outbox 列表/筛选第一增量和 AI 外部告警失败/死信可见性第一增量。预算跨线后默认给 ACTIVE ADMIN / CS 写 `AI_BUDGET_EXCEEDED` 内部通知；`AI_BUDGET_NOTIFICATION_ENABLED=false` 时只保留治理审计；`AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 且全局预算已超限时不外呼真实模型，返回 deterministic fallback 并写 `AI_BUDGET_CIRCUIT_OPEN`；配置角色预算且当前角色已超限时写 `AI_BUDGET_ROLE_CIRCUIT_OPEN`；配置 DeepSeek 模型预算且当前模型已超限时写 `AI_BUDGET_MODEL_CIRCUIT_OPEN`；输出防护命中时写 `AI_OUTPUT_GUARDED`；预算事件新增 `ai_external_alert_outbox.send_status=PENDING`，9D.41 可推进到 `SENT/FAILED` 并记录 `attempts/last_error`；9D.42 可通过 `/ai/governance/cost-trend` 查看成功调用按日成本趋势；9D.43 默认仍 dry-run，显式启用 `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=true` 且配置 `AI_EXTERNAL_ALERT_WEBHOOK_URL` 后会 POST webhook；9D.44 默认不自动调度，显式启用 `AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=true` 后才按批次触发 sender；9D.45 webhook 失败未达 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS` 时保持 `PENDING`，达到上限进入 `DEAD_LETTER`；9D.46 sender 先领取 `PENDING -> SENDING` 后外呼，避免重复触发或并发 sender 重复发送同一条 outbox；9D.47 默认不签名，显式启用 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED=true` 并注入 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET` 后会发送 `X-AI-Alert-Signature`；9D.48 可通过 `/ai/governance/external-alerts/summary` 查看 outbox 状态分布、最近失败/死信错误和最老待发送时间；9D.48.1 可通过 `/ai/governance/external-alerts` 筛选安全元数据列表；9D.48.2 可查看 FAILED / DEAD_LETTER 的 `attempts`、脱敏 `last_error` 和 `last_attempted_at`。仍需真实 key 环境联调、接收端验签/防重放联调、生产 webhook 联调、提示词后台管理、流式输出过滤、生产级成本看板和更完整输出策略；复测 AI-3 越权。 |
| 订单主链路 | PARTIAL | 已有医生订单读取、公开协同信息、医生 AI、确认收货、医生提交订单、医生保存草稿、继续编辑/补资料、Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、上传中断后恢复浏览器 smoke、100MB+ 浏览器上传 smoke、客服初审、客服协同、客服资料缺失提示、设计稿预览、账单文件绑定、账单预览、生产审核、工序实例详情、派工、worker 任务池、入检/出检、工时、绩效、绩效归因联动第一增量、绩效明细第一增量、返工影响审计可视化第一增量、返工影响筛选第一增量、返工影响图形化第一增量、生产看板、返工终检页面级第一增量、返工关闭/责任分类第一增量、返工字典第一增量、返工通知联动第一增量、复杂返工影响范围第一增量、发货前终检 `OUT/PASS` 门禁第一增量、终检报告第一增量和终检专用角色 / 附件第一增量；仍需补实时自动保存、真实弱网/跨设备浏览器续传、12 步主链路浏览器 smoke、绩效完整公式/周期/申诉、终检 PDF/签名、付款状态。 |
| 生产规则 | PARTIAL | 已补返工关闭、责任类型留痕、返工字典后台维护第一增量、返工创建/关闭内部通知、复杂返工影响范围第一增量、绩效归因联动第一增量、绩效明细第一增量、返工影响审计可视化第一增量、返工影响筛选第一增量和返工影响图形化第一增量；仍需补标准工时、绩效完整公式/周期和申诉闭环。 |
| 部署基础设施 | NOT_READY | Nginx HTTPS、Docker 镜像构建、测试/正式环境隔离、生产 `.env` 注入、数据库备份、日志留存、监控告警。 |
| 操作手册 | NOT_READY | 编写管理员、客服、生产、医生端操作手册和故障处理手册。 |

## 环境变量与密钥边界

- 仓库只保留 `.env.example` 占位值，禁止提交真实密钥。
- 正式环境必须外部注入以下变量：数据库账号密码、Redis、MinIO access/secret、DeepSeek API Key、`APP_AUTH_TOKEN_SECRET` 或正式 JWT 密钥、`APP_AUTH_REFRESH_TOKEN_TTL_SECONDS`、AI 外部 webhook URL、AI 外部 webhook signing secret、HTTPS 证书路径或托管配置。
- DeepSeek 第一增量默认 `AI_PROVIDER=deterministic`、`AI_DEEPSEEK_ENABLED=false`；测试/正式环境启用真实模型时必须通过外部密钥系统注入 `DEEPSEEK_API_KEY`，不得把真实 key 写入 `.env.example`、README、测试或代码。
- AI 外部 webhook 第一增量默认 `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=false`、`AI_EXTERNAL_ALERT_WEBHOOK_URL=`；测试/正式环境启用时只能通过部署平台安全配置 webhook URL，不得把带密钥或客户信息的真实 URL 提交到仓库。
- AI 外部 webhook 签名第一增量默认 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED=false`、`AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET=`；测试/正式环境启用时只能通过部署平台安全配置 signing secret，不得把真实 secret 提交到仓库。
- AI 外部告警调度器第一增量默认 `AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false`；测试/正式环境确认 webhook、重试、死信、幂等领取和监控策略后，才可显式启用并配置 `AI_EXTERNAL_ALERT_SCHEDULER_BATCH_SIZE`、`AI_EXTERNAL_ALERT_SCHEDULER_FIXED_DELAY_MILLIS`、`AI_EXTERNAL_ALERT_SCHEDULER_INITIAL_DELAY_MILLIS` 和 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS`。
- 正式环境必须使用 `spring.profiles.active=prod`，通过 `application-prod.yml` 和启动校验固定关闭本地烟测 header；如果 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=true` 或 `APP_AUTH_TOKEN_SECRET` 仍是本地占位值，后端应启动失败。
- 测试环境和正式环境必须使用不同数据库、不同 MinIO bucket、不同对象存储凭据。

## 上线前建议命令

```bash
npm run acceptance
npm run check:toolchain
npm run compose:config
npm run check:openapi
npm run check:auth-refresh
npm run check:task9d12
npm run check:task9d13
npm run check:task9d14
npm run check:task9d15
npm run check:task9d16
npm run check:task9d17
npm run check:task9d18
npm run check:task9d19
npm run check:task9d20
npm run check:task9d21
npm run check:task9d22
npm run check:task9d23
npm run check:task9d25
npm run check:task9d33
npm run check:task9d34
npm run check:task9d35
npm run check:task9d37
npm run check:task9d38
npm run check:task9d39
npm run check:task9d40
npm run check:task9d41
npm run check:task9d42
npm run check:task9d43
npm run check:task9d44
npm run check:task9d45
npm run check:task9d46
npm run check:task9d47
npm run check:task9d48
npm run check:task9d48-1
npm run check:task9d58
npm run check:task9d59
npm run check:task9d62
npm run smoke:task9d62
npm run smoke:task9d10-large-upload
npm run smoke:task9d10-server-resume
npm run smoke:task9d10-interrupted-resume
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml test
git diff --check
```

## 上线前人工验收

- 按 `docs/acceptance/task-8-acceptance-matrix.md` 逐项把 `PARTIAL`、`BLOCKED`、`NOT_STARTED` 清零或形成客户签字豁免。
- 用 Bearer token / 正式账号体系而不是 `X-Bootstrap-*` 复测医生端脱敏、文件越权、AI-3 越权、检查记录、派工/转派、WORKER 绩效范围。
- 复测后台动态表单创建、编辑、停用和医生端只读 `ACTIVE` 字段，客户最终字段清单确认前不要视为完整上线验收。
- 用浏览器完成 PRD 12 步主链路，保留截图、订单号、日志和数据库核验记录。
- 对 100MB+ STL 文件继续做真实弱网限速/断网和跨设备浏览器续传验收；当前中断恢复 smoke 已覆盖本地第 2 分片失败后的同浏览器续传。
- 对 WebSocket 做在线推送、离线未读补偿、已读同步、多实例广播和网关代理验收。
- 对 AI 预算通知做 ADMIN / CS 收件、DOCTOR / WORKER 隔离、`AI_BUDGET_NOTIFICATION_ENABLED=false` 策略开关、`AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 全局/角色/模型预算熔断降级、`AI_BUDGET_ROLE_CIRCUIT_OPEN`、`AI_BUDGET_MODEL_CIRCUIT_OPEN`、`AI_OUTPUT_GUARDED`、`prompt_version`、`ai_external_alert_outbox` 外部告警待发送事实、`SENT/FAILED/DEAD_LETTER`、`SENDING` 领取态、`attempts/last_error`、`/ai/governance/cost-trend` 成本趋势、`/ai/governance/external-alerts/summary` 监控摘要、`/ai/governance/external-alerts` 列表筛选和失败/死信只读可见性、`AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=true` webhook 发送/失败留痕、`AI_EXTERNAL_ALERT_MAX_ATTEMPTS` 重试/死信、`AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED=true` 签名头、真实 key 环境联调验收；当前 9D.43 已完成 webhook 第一增量，调度器第一增量已由 9D.44 补齐，重试/死信第一增量已由 9D.45 补齐，幂等/并发领取第一增量已由 9D.46 补齐，签名/鉴权第一增量已由 9D.47 补齐，监控摘要第一增量已由 9D.48 补齐，列表筛选第一增量已由 9D.48.1 补齐，失败/死信可见性第一增量已由 9D.48.2 补齐，仍缺接收端验签/防重放联调、生产 webhook 联调、流式输出过滤、提示词后台管理和生产级联调。

## 9D.70 操作手册与交付材料第一段

9D.70 操作手册与交付材料第一段已补：新增 `docs/operations/phase-one-role-operation-manual.md`、`docs/operations/phase-one-troubleshooting-guide.md` 和 `docs/operations/phase-one-delivery-materials-index.md`；`npm run check:task9d70` 可检查四端操作手册、故障处理清单和交付材料索引。该记录不等于客户培训签收，Task 8 仍保持 NOT_READY。

## 9D.68 12 步主链路客户验收版收敛

9D.68 12 步主链路客户验收版收敛已补 `docs/acceptance/phase-one-main-chain-customer-acceptance.md`，用于客户/PM 阅读固定演示数据 PASS/FAIL 证据；该记录不替代客户签字，Task 8 仍保持 NOT_READY。

## 9D.72 客户 / PM 确认项清单第一段

9D.72 客户 / PM 确认项清单第一段已补 `docs/acceptance/phase-one-customer-pm-confirmations.md`；该文档只是待确认清单，不代表客户 / PM 已签字。Task 8 仍保持 NOT_READY。

## 9D.64 客服端设计稿审核预览增强第一段

客服端设计稿审核预览增强第一段已补：客服可在内部订单设计稿页查看版本并获取短时效预览链接。Task 8 仍保持 NOT_READY。

## 9D.66 绩效周期筛选第一段

9D.66 绩效周期筛选第一段已补；仍缺标准工时配置、完整公式、申诉、导出和工资发放。Task 8 仍保持 NOT_READY。

## 9D.74 绩效标准工时与完整公式口径第一段

9D.74 绩效标准工时与完整公式口径第一段已补；仍需客户 / PM 确认 CP-004、标准工时配置、申诉、导出和工资发放边界。Task 8 仍保持 NOT_READY。

## 9D.67 文件上传限制与 bucket 隔离第一段

9D.67 文件上传限制与 bucket 隔离第一段已补 `FILE_ALLOWED_CONTENT_TYPES`、`FILE_MAX_FILES_PER_ORDER` 和 `MINIO_BUCKET` 配置说明；真实生产 bucket/凭据必须外部注入。Task 8 仍保持 NOT_READY。
