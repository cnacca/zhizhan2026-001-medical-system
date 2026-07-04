# DECISIONS

## D-107 任务 9D.61 账单预览复用文件签名 URL 且物流继续走既有发货门禁

状态：已确认并执行。

决策：

- 账单物流预览/录入闭环第一增量不新增后端接口，复用既有 `POST /orders/{orderId}/bill`、`GET /orders/{orderId}/bill`、`GET /orders/{orderId}/logistics` 和 `GET /files/{fileId}/preview-url`。
- 客服/内部订单页先提供最小账单 `file_id` 上传入口；医生端账单物流页按需生成短时效账单预览链接。
- 物流录入继续复用生产看板既有 `POST /orders/{orderId}/logistics`，并保留 9D.14 的终检 `OUT/PASS` 发货门禁。
- 本轮不做真实物流平台、支付系统、付款状态流转、财务审批、账单金额结构化或自动对账。

影响：

- T4 账单物流闭环进入第一增量，医生端可查看账单文件预览链接，客服/内部端可绑定账单文件。
- Task 8 仍保持 `in-progress / NOT_READY`；后续仍需账单金额/付款状态、完整物流页面、终检 PDF/签名和 12 步浏览器验收。

## D-106 任务 9D.60 复用文件预览签名 URL 聚合设计稿预览入口

状态：已确认并执行。

决策：

- 设计稿预览 URL 聚合第一增量不新增后端接口，复用既有 `GET /files/{fileId}/preview-url` 生成短时效签名 URL。
- 前端医生端设计稿版本列表按 `file_ids` 聚合预览链接，点击后为每个设计稿文件拉取授权预览 URL 并展示外链。
- 预览 URL 仅按需生成，不写入 `DesignDraftResponse`，避免把短时效签名 URL 固化进设计稿列表响应或文档样例。
- 本轮不做在线 CAD 预览器、批注标注、三轮驳回重构、完整设计稿审批重构或客服端设计稿管理大页面。

影响：

- T3.3 设计稿预览 URL 聚合进入第一增量，医生端可从设计稿版本看到授权预览入口。
- Task 8 仍保持 `in-progress / NOT_READY`；后续仍需客服端设计稿审核预览增强、账单物流闭环、终检 PDF/签名和完整 12 步浏览器验收。

## D-105 任务 9D.59 客服 AI 草稿必须人工确认后写入生产备注

状态：已确认并执行。

决策：

- 客服资料缺失提示复用既有 `POST /ai/check-missing`，只展示必填资料缺失项和提示，不自动驳回订单。
- AI 翻译复用既有 `POST /ai/translate`，只生成草稿；只有客服点击“写入生产备注”后才把草稿合并到 `production_note`。
- 最终保存仍复用客服初审 `POST /orders/{orderId}/review`，通过初审时由客服确认后的 `production_note` 写入订单。
- 本轮不做 AI 自动审核、自动发送、自动驳回，不新增后端 schema，不接完整 CRM、客服工单或物流平台 API。

影响：

- T2.4/T2.5 客服资料缺失提示与 AI 翻译草稿确认进入第一增量，补齐客服初审页面的 AI 辅助操作入口。
- Task 8 仍保持 `in-progress / NOT_READY`；后续仍需设计稿预览 URL 聚合、账单物流闭环、完整客服 smoke 和 12 步主链路验收。

## D-104 任务 9D.58 客服协同台复用既有消息审核接口

状态：已确认并执行。

决策：

- 客服协同闭环第一增量先只补客服端 `/collaboration` 页面，不新增后端表或新业务接口。
- 页面复用既有 `GET /messages/pending-review`、`GET /orders/{orderId}/messages` 和 `POST /messages/{msgId}/review`，让 ADMIN / CS 可查看待审核消息、按订单 ID 查看消息上下文，并审核通过或驳回生产发给医生的消息。
- 响应与页面只展示现有消息安全字段，不新增密钥、webhook、prompt 原文、模型原始响应或内部生产敏感详情。
- 本轮不做完整 CRM、客户画像、物流平台 API 自动同步、AI 自动审核/发送、消息人工重放、复杂客服工单或新后端 schema。

影响：

- T2 客服协同闭环进入第一增量，补齐一期 12 步主链路中“生产端发医生前客服审核”的前端操作入口。
- Task 8 仍保持 `in-progress / NOT_READY`；后续仍需资料缺失提示嵌入客服页面、AI 翻译草稿确认写入生产指令、设计稿预览 URL 聚合、账单物流闭环和完整 12 步浏览器验收。

## D-103 任务 9D.57 返工影响图采用前端只读可视化

状态：已确认并执行。

决策：

- 返工影响图形化第一增量复用既有 `/reworks` 返回的 `impacted_node_count` 和 `impacted_node_instance_ids`，不新增后端表、不调整返工状态机、不改派工和排产。
- 前端在生产端返工终检页增加只读影响图：返工目标节点作为起点，受影响后续节点以横向节点链路展示，并保留无影响节点时的空状态。
- 该图只面向内部生产/管理上下文；医生端仍不能看到内部返工、工序节点、员工、工时或绩效信息。
- 本轮不做复杂甘特、拖拽排产、自动重新派工、返工审批流或绩效申诉。

影响：

- T1 返工影响图形化第一增量进入开发基线，补齐生产端“返工处理与生产流转”可读性缺口。
- Task 8 仍保持 `in-progress / NOT_READY`；后续仍需客服协同闭环、设计稿预览 URL 聚合、账单物流闭环、终检 PDF/签名、绩效完整公式/周期和 12 步浏览器真实点击验收。

## D-102 任务 9D.56 终检报告采用专用权限与内部附件绑定

状态：已确认。

决策：

- 终检报告生成从通用 WORKER 入口收口为 `final-inspection:manage` 专用权限；ADMIN 仍保留本地 bootstrap fallback，便于现有 smoke 和管理端验收。
- 终检附件第一增量只绑定已存在的 `file_resource.file_id`，并要求同订单、`upload_status=COMPLETED`、`status=ACTIVE`、`visibility=INTERNAL`。
- 终检报告请求和响应新增 `attachment_file_ids`，前端只提供最小 file_id 输入与展示；不在本轮新增文件上传区、PDF 签章、报告模板、真实物流平台或人工复核流。
- 医生端仍禁止读取终检报告，也不能读取内部终检附件预览 URL。

影响：

- 终检发货硬缺口中的“终检专用角色 / 附件第一增量”已关闭，但终检 PDF、签名、真实物流平台、完整发货验收仍未完成。
- Task 8 仍保持 `in-progress / NOT_READY`；后续仍需补终检 PDF、签名、真实物流平台和完整发货验收。

## D-101 当前目标收束为一期交付并新增前端对齐检查

状态：已确认。

决策：

- 后续项目文档和开发优先级默认围绕「完成一期交付」组织，不再把 9D 编号本身当成目标。
- 一期完成口径以 `PROJECT.md` 的 P0 主业务链路、`docs/acceptance/task-8-acceptance-matrix.md` 的 12 步验收链路和 `docs/deployment/readiness-checklist.md` 的上线硬缺口为准。
- 新增 `docs/acceptance/phase-one-frontend-alignment.md`，专门记录前端与一期范围的匹配情况，区分真实接口链路、第一增量、只读汇总和演示占位。
- 新增 `docs/acceptance/phase-one-frontend-task-scope.md`，作为后续按医生端、客服端、生产端、管理端拆一期前端任务的入口，并记录已完成、演示增强、超过一期范围内容的处理方式。
- 前端验收不能只看导航是否有入口；必须看真实用户路径、接口接入、权限边界和 12 步主链路是否可完成。

影响：

- 后续前端开发按 `phase-one-frontend-task-scope.md` 收口，优先补返工影响图形化、客服协同、12 步主链路浏览器 smoke、文件与设计稿体验、绩效与管理侧收口等一期硬缺口。
- `STATUS.md`、`tasks/README.md` 和 `README.md` 已增加该口径入口；Task 8 仍保持 `in-progress / NOT_READY`。

## D-100 任务 9D.55 返工字典后台维护采用底座字典管理第一增量

状态：已确认。

决策：

- 一期后续通用后台维护能力优先复用 RuoYi-Vue-Pro / 若依 Pro 的字典、CRUD、菜单和权限码范式，不再为每个后台配置项手写一套独立模式。
- 返工原因和责任类型从 9D.18 的后端固定字典推进为 `rework_dictionary_item` 数据库字典，并新增 `rework:dictionary:manage` 权限和 `/system/rework-dictionaries` 管理菜单。
- ADMIN 可通过 `/reworks/dictionaries/items` 新增、编辑和停用返工字典项；生产端关闭返工仍只接受 ACTIVE 字典项，停用项不能继续用于关闭返工。
- 本增量不做删除、批量导入、审计日志、审批流、字典分组 UI 或完整 RuoYi 代码生成器迁移。

影响：

- `docs/development/open-source-foundation-reuse-gap-list.md` 成为后续判断“哪些能力该复用底座、哪些属于牙科生产自研”的清单入口。
- Task 8 仍保持 `in-progress / NOT_READY`；下一轮唯一推荐目标是终检专用角色 / 附件第一增量。

## D-099 验收矩阵机器可读缺口清单第一增量

状态：已确认。

决策：

- 在 `acceptance.json` 新增 `task8_readiness_gaps`，把 Task 8 仍未 READY 的关键上线缺口转成机器可读结构。
- 每个缺口记录 `id`、`status`、`source`、`current_evidence`、`remaining_reason`、`minimum_closure_loop` 和 `verification`。
- 新增 `npm run check:task8-readiness-gaps`，用于校验缺口字段完整，并在命令输出中列出当前缺口。

影响：

- 后续开发可以通过命令直接发现 Task 8 仍未关闭的上线缺口，不再只靠人工阅读长矩阵。
- Task 8 仍保持 `in-progress / NOT_READY`；下一轮唯一推荐目标是 AI 外部告警接收端 webhook 验签/防重放第一增量。

## D-098 部署安全与环境变量 readiness 检查第一增量

状态：已确认。

决策：

- 新增 `npm run check:deployment-env`，静态检查 README、`.env.example`、`application.yml`、`application-prod.yml` 和 readiness checklist 的生产安全门禁文本。
- `.env.example` 只保留本地占位值，`DEEPSEEK_API_KEY` 在提交模板中保持空值，真实 key 只能通过本地 shell、部署平台或密钥系统外部注入。
- 生产 profile 继续通过 `application-prod.yml` 固定 `allow-bootstrap-headers=false`，`APP_AUTH_TOKEN_SECRET` 不提供本地 fallback。
- AI 真实模型、外部 webhook、外部告警调度器和 webhook 签名默认关闭，只有显式环境变量开启并安全注入相关 secret 后才启用。

影响：

- 该增量把生产环境必须外部注入变量、默认关闭能力和禁止提交真实密钥转成可运行检查。
- Task 8 仍保持 `in-progress / NOT_READY`；下一轮唯一推荐目标是验收矩阵机器可读缺口清单第一增量。

## D-097 Task 8 readiness 终检报告第一增量

状态：已确认。

决策：

- 新增 `docs/deployment/task-8-final-readiness-report.md` 作为 Task 8 上线前缺口清单第一增量。
- 报告只汇总 `docs/deployment/readiness-checklist.md` 和 `docs/acceptance/task-8-acceptance-matrix.md` 中仍为 PARTIAL / NOT_READY 的关键项，不新增业务功能。
- 每个缺口必须包含缺口名称、当前证据、未完成原因、需要补的最小闭环和推荐验证方式。

影响：

- Task 8 仍保持 `in-progress / NOT_READY`，但上线前缺口从分散矩阵收敛为可接力的报告入口。
- 下一轮唯一推荐目标是部署安全 / 环境变量 readiness 检查第一增量。

## D-096 AI 外部告警失败/死信只读可见性第一增量

状态：已确认。

决策：

- 9D.48.2 在 `GET /ai/governance/external-alerts` 列表基础上，为 FAILED / DEAD_LETTER 排查补充只读可见信息。
- 列表记录新增 `attempts`、脱敏 `last_error` 和 `last_attempted_at`；`last_error` 不返回真实 webhook URL、密钥、Bearer token、prompt 原文、模型原始响应或上游敏感响应。
- `last_error` 仅作为失败/死信只读摘要使用；本增量不新增重试按钮、死信恢复、人工处理状态、人工关闭、编辑、告警抑制或真实 webhook 联调。

影响：

- 9D.48.2 把 outbox 运维视图从“知道有失败”推进到“能安全定位失败原因摘要”的最小上线准备闭环。
- Task 8 仍保持 `in-progress / NOT READY`；下一轮唯一推荐目标是 Task 8 readiness 终检报告第一增量。

## D-095 AI 外部告警列表只读筛选第一增量

状态：已确认。

决策：

- 9D.48.1 新增 AI 外部告警 outbox 只读列表第一增量，入口为 `GET /ai/governance/external-alerts`。
- 该入口仅允许 CS / ADMIN 访问，支持 `send_status`、`event_type`、`created_at_from`、`created_at_to` 和 `limit` 最小筛选。
- 响应只返回 `alert_id`、`event_type`、`send_status`、`created_at`、`updated_at` 安全元数据；不返回 payload、last_error、真实 webhook URL、密钥、prompt 原文、模型原始响应或内部生产敏感详情。
- 本增量不做人工重放、人工编辑、人工关闭、告警抑制、生产 webhook 联调或真实渠道密钥配置。

影响：

- 9D.48.1 把 9D.48 的聚合监控推进到可定位具体 outbox 记录的最小只读视图。
- Task 8 仍保持 `in-progress / NOT READY`；下一轮唯一推荐目标是 9D.48.2 AI 外部告警失败/死信可见性第一增量。

## D-094 AI 外部告警监控只读化第一增量

状态：已确认。

决策：

- 9D.48 新增 AI 外部告警 outbox 运维可观察第一增量，入口为 `GET /ai/governance/external-alerts/summary`。
- 该入口仅允许 CS / ADMIN 只读访问，返回 `PENDING/SENDING/SENT/FAILED/DEAD_LETTER` 数量分布、最近一条 FAILED/DEAD_LETTER 错误和最老 PENDING 创建时间。
- 返回的 `last_error` 只做基础错误摘要，服务端会脱敏 URL/token/secret/key/signature 形式内容；接口不返回真实 webhook URL、密钥、prompt 原文、模型原始响应或内部生产敏感详情。
- 本增量不做真实 webhook 联调，不接短信、邮件、企业微信，不新增人工重放、人工关闭、告警抑制或复杂运维后台。

影响：

- 9D.48 把外部告警从发送侧状态机推进到上线前可观察的只读运维视图。
- Task 8 仍保持 `in-progress / NOT READY`；后续继续补 outbox 列表/筛选、失败/死信可见性、接收端验签/防重放联调、生产 webhook 联调和部署安全检查。

## D-093 Task 8 后续提交按任务边界拆分并保持运行产物不入库

状态：已确认。

决策：

- 2026-07-04 本轮将 `feature/project-skeleton` 推送到 GitHub；本轮业务开发基线为 `5e9ee18`，后续文档回补提交不改变业务代码边界。
- 提交按边界拆分：生产汇总组 `1895f79`、AI 治理组 `f395584`、Task 8 文档回写 `c781eae`、workflow helper 整理 `5e9ee18`。
- 本轮只提交可复现的代码、配置、迁移、OpenAPI、检查脚本和项目文档；`test-results/` 作为本地运行产物保持未跟踪，不纳入提交。
- 后续继续使用小提交边界，不把前端展示、AI 治理、生产模块和运行产物混成一个提交。

影响：

- 新会话接手时以远程 `origin/feature/project-skeleton` 最新 HEAD 为当前上传基线，并以 `5e9ee18` 作为本轮业务开发边界核对点。
- Task 8 仍保持 `in-progress / NOT READY`；下一轮唯一推荐目标是 9D.48.1 AI 外部告警 outbox 列表/筛选第一增量。

## D-092 AI 外部告警 webhook 签名默认关闭

状态：已确认。

决策：

- 9D.47 新增外部告警 webhook HMAC 签名第一增量，默认 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED=false`。
- 只有显式启用签名并通过安全渠道注入 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET` 时，sender 才会给 webhook 请求增加 `X-AI-Alert-Signature`。
- 签名格式固定为 `sha256=<hex>`，内容为对 webhook request body 执行 HMAC-SHA256；本轮不新增 timestamp、nonce、重放窗口或接收端验签服务。
- 签名启用但 secret 为空时，sender 不发送未签名 webhook，请求进入既有失败/重试/死信链路。
- 本增量不提交真实 secret，不做短信、邮件、企业微信 SDK，不做生产 webhook 联调。

影响：

- 9D.47 把 9D.43 webhook 外呼从“裸 POST”推进到可由接收端共享密钥验签的最小鉴权边界。
- 后续仍需接收端验签联调、timestamp/nonce 防重放、告警监控指标、操作手册、告警抑制和生产 webhook 联调。

## D-091 AI 外部告警先用事务内领取态避免重复外呼

状态：已确认。

决策：

- 9D.46 新增 sender 领取保护：处理每条 outbox 前，先用条件更新把 `send_status=PENDING` 领取为事务内 `SENDING`。
- 只有领取成功的 sender 才允许执行 dry-run 或 webhook 外呼；重复触发或并发 sender 领取失败时跳过该 outbox。
- 发送成功后从 `SENDING` 更新为 `SENT`；未知通道从 `SENDING` 更新为 `FAILED`；webhook 失败从 `SENDING` 更新为 `PENDING` 或 `DEAD_LETTER`。
- 本增量不新增迁移，复用既有 `send_status` 字符串字段；`SENDING` 是发送事务内的领取态。
- 本增量不做 webhook 签名/鉴权、退避调度、告警抑制、死信管理页面、监控指标或生产 webhook 联调。

影响：

- 9D.46 把 9D.44 调度器和 9D.45 重试/死信补成最小幂等发送链路，避免同一条 `PENDING` outbox 被并发 sender 重复外呼。
- 后续仍需 webhook 签名/鉴权、真实生产 webhook 联调、监控指标、操作手册、告警抑制和生产级运维闭环。

## D-090 AI 外部告警 webhook 失败先做有限重试与死信

状态：已确认。

决策：

- 9D.45 新增 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS`，默认 3，控制 webhook 失败后的最大尝试次数。
- webhook 返回非 2xx 或连接异常时，sender 会累计 `attempts` 并写 `last_error`。
- 未达到最大尝试次数时，outbox 保持 `send_status=PENDING`，等待下一次调度或人工触发继续发送。
- 达到最大尝试次数后，outbox 标记为 `DEAD_LETTER`，避免同一失败告警无限重试。
- 未支持通道仍按不可发送错误标记 `FAILED`；本增量只改变 webhook 失败路径。
- 本增量不做分布式领取锁、退避调度、告警抑制、死信管理页面、签名认证或生产 webhook 联调。

影响：

- 9D.45 把 9D.44 调度器补成可控失败闭环，避免 webhook 故障时无限重复发送。
- 幂等/并发领取第一增量已由 9D.46 补齐；后续仍需签名/鉴权、退避策略、死信运维入口、生产 webhook 联调、监控指标和操作手册。

## D-089 AI 外部告警调度器默认关闭，显式启用后复用 sender

状态：已确认。

决策：

- 9D.44 新增 `AiExternalAlertScheduler`，只负责把 `PENDING` outbox 批量交给既有 `AiExternalAlertSenderService`。
- 调度器默认关闭，`AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false` 时即使调度方法被调用也不会处理 outbox。
- 显式设置 `AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=true` 后，调度器按 `AI_EXTERNAL_ALERT_SCHEDULER_BATCH_SIZE` 调用发送器；实际发送仍复用 9D.43 的 dry-run/webhook 门禁。
- Spring scheduling 已在应用入口启用，但调度方法通过业务开关保护，默认不依赖外部网络、不触发真实 webhook。
- 本增量不做分布式领取锁、复杂重试、死信、签名认证、渠道管理页面或生产 webhook 联调。

影响：

- 9D.44 把外部告警从“需要人工调用 sender”推进到“可配置自动调度”的第一增量。
- 重试/死信已由 9D.45 补齐，幂等/并发领取第一增量已由 9D.46 补齐；后续仍需签名/鉴权、告警抑制、监控指标、生产 webhook 联调和操作手册。

## D-088 AI 外部告警真实渠道先接 webhook 且默认关闭

状态：已确认。

决策：

- 9D.43 不直接接短信、邮件、企业微信 SDK，也不提交任何外部渠道密钥；第一增量只支持通用 HTTP webhook。
- `EXTERNAL_ALERT` 通道默认保持 9D.41 的本地 dry-run 行为，继续把 `PENDING` 标记为 `SENT`，保证本地/CI 不依赖外网。
- 只有显式设置 `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=true` 且提供 `AI_EXTERNAL_ALERT_WEBHOOK_URL` 时，`AiExternalAlertSenderService` 才会把 outbox payload 以 `application/json` POST 到 webhook。
- webhook 返回非 2xx 或连接异常时，outbox 标记 `FAILED`，累计 `attempts`，并写入不包含真实 URL/密钥的 `last_error`。
- 本增量不做定时调度、并发领取锁、重试/死信、签名认证或生产 webhook 联调。

影响：

- 9D.43 把外部告警从本地状态机推进到可配置的真实外部发送边界，同时保持默认安全和可离线验收。
- 调度器已由 9D.44 补齐，重试/死信已由 9D.45 补齐，幂等/并发领取第一增量已由 9D.46 补齐；后续仍需签名/鉴权、生产 webhook 联调、监控告警和操作手册。

## D-087 AI 成本趋势先做后端只读按日聚合

状态：已确认。

决策：

- 9D.42 新增 `GET /ai/governance/cost-trend`，复用 AI 治理权限，仅 CS / ADMIN 可访问。
- 第一增量按 `ai_audit_log.result_status=SUCCESS` 聚合最近 1-31 天的成功模型调用，不统计失败、熔断、限流或输出防护审计为成本趋势点。
- 响应返回每天的 `success_count`、`estimated_cost_microusd`、`model_count`，以及窗口总成功次数和总估算成本。
- 本轮不新增表结构，不接真实计费账单，不做前端图表、导出、预算策略管理页面或真实 key 联调。

影响：

- 9D.42 把已有 AI 成本审计推进到可观察趋势，为上线前判断成本变化提供后端只读入口。
- 后续仍需真实外部渠道适配、调度器、提示词后台管理、流式输出过滤、真实 key 环境验收和生产级成本看板。

## D-086 AI 外部告警发送器先做本地 dry-run 状态机

状态：已确认。

决策：

- 9D.41 不接真实短信、邮件、企业微信或其他外部告警渠道，不新增密钥或环境变量。
- 新增 `AiExternalAlertSenderService#sendPendingAlerts`，从 `ai_external_alert_outbox` 领取 `send_status=PENDING` 的待发送事实。
- 当前 `EXTERNAL_ALERT` 通道作为本地 dry-run，发送成功口径是标记 `send_status=SENT`、`attempts=attempts+1`、`last_error=NULL`。
- 未支持的通道标记 `send_status=FAILED`、`attempts=attempts+1`，并在 `last_error` 记录错误原因。
- 本增量不做定时调度、不做分布式锁、不做真实渠道重试策略；后续接真实渠道前必须确认密钥注入、重试/死信和监控告警策略。

影响：

- 9D.41 把 9D.37 的 outbox 待发送事实推进到可消费、可观察的状态机。
- 真实外部渠道适配已由 9D.43 补齐，调度器已由 9D.44 补齐，重试/死信已由 9D.45 补齐，幂等/并发领取第一增量已由 9D.46 补齐；后续仍需签名/鉴权、渠道配置和生产环境联调。

## D-085 AI 提示词版本与输出防护先做服务端固定版本第一增量

状态：已确认。

决策：

- 新增 `ai_audit_log.prompt_version`，所有 AI 审计按 `agent_code` 写入固定版本号，例如 `AI_TRANSLATE_V1`、`AI_CS_QUERY_V1`、`AI_DOCTOR_ORDER_QUERY_V1`、`AI_CHECK_MISSING_V1`、`AI_PRODUCTION_NOTE_V1`。
- 提示词版本本轮不做后台配置或动态发布，先把版本随服务端代码和审计记录固化，便于后续追踪某次 AI 输出对应的提示词口径。
- 真实模型输出统一经过服务端出口防护；命中密钥、token、系统表、文件表、审计表或明确内部泄露模式时，不返回模型原文，改为人工复核提示。
- 输出防护命中时写入 `ai_audit_log.result_status=AI_OUTPUT_GUARDED`，`model_name=ai-governance-output-guard`；随后业务成功审计记录 deterministic 安全提示，避免泄露内容进入响应。
- 本增量不接真实外部告警发送器、不做提示词管理页面、不做流式输出过滤、不提交真实 DeepSeek key。

影响：

- 9D.40 把 AI 治理从预算/成本扩展到可追溯提示词版本和最小输出防护。
- 后续仍需真实外部渠道适配、调度器、成本趋势、提示词后台管理、流式输出过滤、人工确认页面和真实 key 环境验收。

## D-084 AI 预算继续按模型维度做熔断第一增量

状态：已确认。

决策：

- 新增 `AI_DEEPSEEK_DAILY_BUDGET_MICROUSD` / `app.ai.deepseek.daily-budget-microusd`，默认 0，不启用模型预算。
- 模型预算复用 `AI_BUDGET_CIRCUIT_BREAKER_ENABLED` 总开关；只有开关开启且 DeepSeek 模型预算为正数时才会阻止真实模型调用。
- 当前第一增量按 `AI_DEEPSEEK_MODEL` 的模型名聚合 `ai_audit_log.model_name` 近 24 小时成功调用估算成本。
- 模型预算熔断命中时返回 deterministic fallback，写入 `ai_audit_log.result_status=AI_BUDGET_MODEL_CIRCUIT_OPEN`，并写入 `ai_external_alert_outbox.send_status=PENDING`，payload 带 `model` 字段。
- 本增量只做 DeepSeek 当前配置模型维度，不做预算策略管理页面、成本趋势、真实外部发送器或真实 key 联调。

影响：

- 9D.39 把 AI 预算治理从全局预算、角色预算推进到模型预算，后续可以针对不同真实模型设置成本边界。
- 后续仍需提示词版本、输出防护、成本趋势、预算策略管理页面、真实外部渠道适配、调度器和生产环境验收。

## D-083 AI 预算先按角色维度做熔断第一增量

状态：已确认。

决策：

- 新增 `ai_audit_log.actor_role`，后续 AI 审计写入调用者角色，支持按 ADMIN / CS / DOCTOR / WORKER 聚合近 24 小时成本。
- 新增 `AI_ADMIN_DAILY_BUDGET_MICROUSD`、`AI_CS_DAILY_BUDGET_MICROUSD`、`AI_DOCTOR_DAILY_BUDGET_MICROUSD`、`AI_WORKER_DAILY_BUDGET_MICROUSD`，默认均为 0，不启用角色预算。
- 角色预算复用 `AI_BUDGET_CIRCUIT_BREAKER_ENABLED` 总开关；只有开关开启且对应角色预算为正数时才会阻止真实模型调用。
- 角色预算熔断命中时返回 deterministic fallback，写入 `ai_audit_log.result_status=AI_BUDGET_ROLE_CIRCUIT_OPEN`，并写入 `ai_external_alert_outbox.send_status=PENDING`。
- 本增量只做角色维度，不做模型维度、管理 UI、真实外部发送器或真实 key 联调。

影响：

- 9D.38 把 AI 预算治理从全局预算推进到按角色可控，便于后续按客服、医生、生产和管理端分别设定成本边界。
- 后续仍需分模型预算、预算策略管理页面、真实外部渠道适配、调度器、提示词版本、输出防护和生产环境验收。

## D-082 AI 外部告警先落 outbox 待发送事实

状态：已确认。

决策：

- 新增 `ai_external_alert_outbox` 表作为外部告警待发送事实，当前只持久化，不调用短信、邮件、企业微信或其他外部服务。
- 预算跨线写入 `AI_BUDGET_EXCEEDED` 治理审计后，同步写入 `ai_external_alert_outbox.send_status=PENDING`。
- 预算熔断命中写入 `AI_BUDGET_CIRCUIT_OPEN` 治理审计后，同步写入 `ai_external_alert_outbox.send_status=PENDING`。
- outbox payload 只包含订单号、事件类型、预算阈值、近 24 小时估算成本和脱敏消息，不写 prompt、模型原始响应、API key 或内部生产详情。
- `AI_BUDGET_NOTIFICATION_ENABLED` 只控制内部通知事实，不影响外部告警 outbox；真实外部渠道发送、重试策略和渠道配置后续单独实现。

影响：

- 9D.37 把 AI 预算治理从“内部通知/熔断审计”推进到“外部告警可被异步发送器消费”。
- 后续仍需真实外部渠道适配、调度器、分角色/分模型预算、成本趋势、提示词版本、输出防护、真实 key 环境联调和生产部署验收。

## D-081 前端全页面视觉先按客户旧原型做统一壳层改造

状态：已确认。

决策：

- 以客户旧版医生端、客服端、生产端 HTML 原型作为视觉和信息架构参考，但不直接搬运原型里的 localStorage/mock JS。
- 当前先在现有 Vue 前端中保留真实登录、RBAC 菜单、数据接口和服务端权限校验，只统一四入口登录后的门户壳层、深色侧边栏、顶部页面说明、业务面板、列表、表单和卡片视觉。
- 页面文案中文为主，品牌使用项目自有名称“AI智能下单平台”。
- 医生端、客服端、生产端和管理端用不同主题强调角色差异，但医生端内部敏感信息隔离仍由服务端 VO/DataScope/权限控制承担。

影响：

- 9D.36 是前端体验改造第一增量，覆盖当前单文件 Vue 应用里的所有已实现 route 面板。
- 本增量不新增后端接口、不调整菜单权限、不放宽医生端脱敏、不重构为多文件组件。
- 后续若继续提升到客户演示级，需要再补业务页面细节、空状态、图表、批量操作和录屏脚本。

## D-080 AI 预算熔断先做可选降级第一增量

状态：已确认。

决策：

- 新增 `AI_BUDGET_CIRCUIT_BREAKER_ENABLED` / `app.ai.budget-circuit-breaker-enabled`，默认 `false`，避免影响现有真实模型调用。
- 当开关为 `true` 且近 24 小时成功调用估算成本已达到 `AI_DAILY_BUDGET_MICROUSD` 时，AI Gateway 不再外呼真实模型，返回 deterministic fallback。
- 熔断命中时写入 `ai_audit_log.result_status=AI_BUDGET_CIRCUIT_OPEN`，模型名为 `ai-governance-budget-circuit-open`，估算成本为 0。
- 本增量不发送外部告警，不做分角色/分模型预算，不做管理页面，不提交真实 key。

影响：

- 9D.35 把 AI 预算治理从“可审计、可通知”推进到“可选阻止继续消耗真实模型成本”。
- 后续仍需外部告警、分角色/分模型预算、提示词版本、输出防护、成本趋势、真实 key 环境联调和生产部署验收。

## D-079 AI 预算通知策略先做开关化第一增量

状态：已确认。

决策：

- 新增 `AI_BUDGET_NOTIFICATION_ENABLED` / `app.ai.budget-notification-enabled`，默认 `true`，保持 9D.33 的内部通知行为。
- 当开关为 `false` 时，预算跨线仍写入 `AI_BUDGET_EXCEEDED` 治理审计，但不写 `notification_event` / `user_notification`，也不触发本地 WebSocket 推送。
- 本增量只做内部通知策略开关，不做外部短信/邮件/企业微信告警，不做分角色/分模型预算，也不做熔断/降级。

影响：

- 9D.34 让生产环境可以按部署策略临时关闭预算通知，同时保留审计证据。
- 后续仍需通知策略分级、外部告警、分角色/分模型预算、熔断/降级、提示词版本、输出防护和真实 key 环境联调记录。

## D-078 AI 预算通知先复用内部通知事实表

状态：已确认。

决策：

- 预算跨线后的第一增量通知复用 `notification_event` / `user_notification` 和 `NotificationPushService`。
- 收件人限定为数据库中 ACTIVE 的 ADMIN / CS 账号，不通知 DOCTOR / WORKER。
- 通知事件类型继续使用 `AI_BUDGET_EXCEEDED`，payload 只包含订单号、预算阈值、近 24 小时估算成本和脱敏消息。
- 本增量不做外部短信/邮件/企业微信告警，不做熔断/降级，也不新增管理页面。

影响：

- 9D.33 把预算跨线从“可审计”推进到“内部人员可在通知中心看到”。
- 后续仍需分角色/分模型预算、通知策略配置、熔断/降级、提示词版本、输出防护和真实 key 环境联调记录。

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

## D-054 上传基线冻结在 9D.10 已完成范围

状态：已确认。

决策：

- 当前 GitHub 上传基线以 `feature/project-skeleton` / `origin/feature/project-skeleton` 对齐状态为准。
- 上传基线包含任务 9D.10 已完成的 Multipart 第一增量、本地恢复上传、服务端 pending 候选恢复、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器上传 smoke。
- 上传后出现的未提交后续试验改动已撤回；返工关闭/发货拦截、责任分类、跨设备恢复 smoke 和限速上传 smoke 不计入当前基线。
- 本轮只做项目文档交接回写，不继续推进业务代码、OpenAPI 契约或测试脚本。

影响：

- 新会话接手时，应把当前 Task 8 视为 `in-progress / NOT READY`，从 `STATUS.md` 和 `tasks/README.md` 的交接摘要继续。
- 下一轮如继续开发，应重新选择一个窄切方向并按 TDD 先补红灯测试；不要把已撤回的后续试验当作已完成任务。

## D-055 2026-07 新资料采用差异合并策略

状态：已确认。

背景：

- 2026-07-01 收到新版 `智能下单平台_PRD_V1.0.docx`、`TRD_AI智能下单平台V1_0_1_.docx`、`API规范.yaml`。
- 新资料是最新业务口径，但仓库当前 `docs/api/openapi.yaml` 和实现已经包含后续增量，例如 `/auth/me`、通知 REST、Multipart 断点恢复、返工记录、节点 start/complete/skip 等。

决策：

- 新 PRD/TRD/API 作为最新业务准绳。
- 不直接用新 `API规范.yaml` 覆盖 `docs/api/openapi.yaml`，后续按“新业务口径 + 当前已实现增量”合并维护。
- 保留当前 Spring Boot 模块化单体、Vue3 前端、MinIO Multipart、WebSocket 通知、数据库通知事实表和后端 `ai-gateway` 架构。
- 暂不拆独立 LangChain 服务；后端 `ai-gateway` 后续直接接 DeepSeek/模型适配，除非 PM/客户明确要求独立 AI 服务。
- Workflow Runtime 内部保留 `READY` 作为可执行技术状态；对外业务口径可映射为 `PENDING/待处理`。
- 可选节点 skip 接口优先保留当前 `/process-instance/nodes/{nodeInstanceId}/skip`，如客户或外部联调强依赖新版 API 路径，再兼容 `/orders/{orderId}/process-instance/nodes/{nodeInstanceId}/skip`。
- 设计稿后续按多文件、多版本方向补齐。
- 生产节点默认强制入检/出检；只有客户明确给出免检清单时才允许例外。

影响：

- 草稿/补资料闭环、Refresh Token/logout、动态表单 CRUD 第一增量、设计稿多文件多版本第一增量、终检发货拦截第一增量和真实 DeepSeek 接入第一增量现已完成；下一阶段优先级顺延为：终检报告/完整返工闭环、生产级 AI 治理、生产部署与弱网验收。
- 当前任务 8 继续保持 `in-progress / NOT READY`，不因资料更新而标完成。
- 后续每次修改接口都必须同步 `docs/api/openapi.yaml` 并运行 `npm run check:openapi`。

## D-056 任务 9D.11 草稿/补资料先复用订单状态流

状态：已确认并执行第一增量。

决策：

- 医生草稿/补资料不新增独立草稿表，复用 `orders.internal_status=DRAFT`、既有 `form_data` 和 `file_resource.order_id` 绑定关系。
- `POST /orders` 支持 `is_draft=true` 保存草稿；草稿允许缺少必填字段，不进入客服审核队列，不写 `DOCTOR_SUBMIT_ORDER` 状态历史。
- 新增 `PUT /orders/{orderId}`，仅允许医生本人更新 `DRAFT / CS_REJECTED / PRODUCTION_REJECTED` 订单；`submit=true` 时校验必填字段，并提交或重新提交到 `PENDING_CS_REVIEW / PENDING_REVIEW`。
- 草稿提交使用 `DOCTOR_SUBMIT_ORDER` 状态历史；驳回后补资料重新提交使用 `DOCTOR_RESUBMIT_ORDER` 状态历史。
- 前端先在医生订单工作台做最小入口：保存草稿、继续编辑/补资料、提交草稿/补资料；不做实时自动保存或完整 Uppy Dashboard。

影响：

- 9D.11 关闭了 9D.2 留下的医生草稿/补资料第一缺口，医生端响应继续保持脱敏，不返回 `internal_status`。
- Task 8 总体仍保持 `NOT READY`；生产级 AI 治理、生产级鉴权细化、终检报告/完整返工闭环和生产部署仍需后续补齐。

## D-057 任务 9B.8 Refresh Token/logout 先做可吊销 refresh token

状态：已确认并执行第一增量。

决策：

- access token 继续沿用当前 HMAC Bearer 短时效 token；本增量不引入服务端 access token 黑名单。
- 新增 `auth_refresh_token` 表，仅保存 refresh token 的 SHA-256 hash，并记录过期、最后使用和吊销时间。
- 登录返回 `refreshToken` 与 `refreshExpiresAt`；`/api/auth/refresh` 用有效 refresh token 换发新的 access token。
- 第一增量不轮换 refresh token；refresh 成功后仍返回同一个 refresh token。
- `/api/auth/logout` 只吊销 refresh token；已签发 access token 等待自然过期。
- 前端先提供手动「刷新 Token」和「退出登录」按钮，不做本地持久化、多设备会话管理或完整 Spring Security/JWT 接入。

影响：

- Refresh Token/logout 从 Task 8 硬缺口推进到可验收第一增量。
- Task 8 总体仍保持 `NOT READY`；后续仍需 refresh token 轮换、access token 黑名单或服务端会话策略、多设备管理 UI、完整 RuoYi/Spring Security 接入、生产级 AI 治理、终检报告/完整返工闭环和生产部署。

## D-058 任务 9D.12 动态表单 CRUD 采用后台管理 + 逻辑停用

状态：已确认并执行第一增量。

决策：

- 动态表单 CRUD 第一增量只做内部后台管理入口，不做面向医生的表单设计器。
- 新增 `form:manage` 权限，当前仅 ADMIN 可创建、编辑和停用字段；医生端仍只能调用只读 `GET /form-configs`。
- 字段删除采用 `status=INACTIVE` 逻辑停用，不物理删除历史配置；医生下单读取继续限定 `ACTIVE` 字段。
- `POST /form-configs` 支持新增字段；`PUT /form-configs/{fieldId}` 支持编辑字段名、必填、选项、排序和状态。
- 前端先在后台「动态表单」菜单提供最小新增、编辑、停用入口，不做复杂拖拽设计器、条件联动、版本发布或客户最终字段确认。

影响：

- 9D.12 关闭了 2026-07 优先级里的动态表单 CRUD 第一缺口，医生下单仍复用活动字段读取链路。
- Task 8 总体仍保持 `NOT READY`；后续仍需动态表单最终字段清单确认、生产级 AI 治理、终检报告/完整返工闭环、完整弱网/跨设备续传和生产部署。

## D-059 任务 9D.13 设计稿多文件采用关联表并保留兼容主文件

状态：已确认并执行第一增量。

决策：

- 不直接删除或替换 `design_draft.file_id`，继续把它作为该版本第一个设计稿文件的兼容字段。
- 新增 `design_draft_file` 关联表，按 `sort_order` 保存同一设计稿版本的多个 `file_id`。
- 旧数据通过 V14 迁移自动把 `design_draft.file_id` 回填为一条关联记录。
- `DesignDraftResponse` 新增 `file_ids` 和 `file_count`；医生端仍只可见 `PENDING_DOCTOR_CONFIRM / DOCTOR_CONFIRMED / DOCTOR_REJECTED` 状态的版本。
- 前端第一增量只做内部订单页输入多个已完成 `file_id` 上传新版设计稿，以及医生订单工作台展示多文件版本；不做预览 URL 聚合、完整 Uppy 设计稿上传区或三轮版本专用流程。
- 9D.13 同时修正登录后业务页面布局：`.route-panel` 跨导航右侧两列，避免内部订单等表单在默认 1120px 宽度下被挤到不可操作。

影响：

- 设计稿从单文件雏形推进到多文件、多版本可验收第一增量，同时保持既有单文件响应兼容。
- Task 8 总体仍保持 `NOT READY`；后续仍需设计稿预览 URL 聚合、三轮版本回归、终检报告/完整返工闭环、生产级 AI 治理、完整弱网/跨设备续传和生产部署。

## D-060 任务 9D.14 发货前必须校验最后工序 OUT/PASS 终检

状态：已确认并执行第一增量。

决策：

- `POST /orders/{orderId}/logistics` 不再只凭 CS/ADMIN 权限直接发货；发货前必须存在该订单最后一道工序节点的 `OUT/PASS` 检查记录。
- 最后一段工序按 `order_process_node.step_order` 最大值识别；若最后 step 存在多个节点，则第一增量要求这些节点均已有 `check_record.check_type='OUT' AND result='PASS'`。
- 缺少终检通过记录时返回 409，并且不写 `order_logistics`、不调用 `OrderStatusService` 更新 `SHIPPED`、不发送 `ORDER_SHIPPED` 通知。
- 前端先在生产看板详情提供最小发货入口，并把 409 转为“终检出检通过后才能发货”的用户提示。

影响：

- 终检发货拦截从 Task 8 上线硬缺口推进到可验收第一增量。
- 本轮不新增终检报告表、终检附件、终检专用角色、返工关闭或真实物流平台对接。
- Task 8 总体仍保持 `NOT READY`；后续继续保留终检报告/完整返工闭环、生产级 AI 治理、弱网/跨设备续传和生产部署缺口。

## D-061 任务 9D.15 DeepSeek 接入采用后端适配层和默认关闭策略

状态：已确认并执行第一增量。

决策：

- DeepSeek 接入继续放在后端 `ai-gateway` 内，不拆独立 AI 服务，不让前端或 AI 服务直连业务数据库。
- 新增 `app.ai` 配置：默认 `AI_PROVIDER=deterministic`、`AI_DEEPSEEK_ENABLED=false`，只有显式切到 `deepseek`、启用开关并注入非占位 `DEEPSEEK_API_KEY` 时才调用真实模型。
- DeepSeek 使用 OpenAI-compatible `/chat/completions`，当前默认模型为 `deepseek-chat`。
- AI-1、AI-2、AI-3 公开问答和 AI-5 可走真实模型；AI-4 资料缺失检查继续使用规则化必填字段判断。
- AI-3 真实模型上下文只允许包含 `DoctorOrderAssistantReadModel` 的外部状态、公开消息、账单和物流字段；医生询问内部工序、员工、返工、工时、绩效等问题时继续本地 `SAFE_REFUSAL`，不调用模型。
- 所有 AI 调用继续写 `ai_audit_log`；真实模型调用记录 `model_name`、输入 token 和输出 token，未启用模型时记录 `deterministic-placeholder`。

影响：

- 仓库仍不能提交真实 DeepSeek API Key；`.env.example` 只能保留占位值。
- 本地开发和 CI 默认不依赖外部网络或真实 key。
- Task 8 总体仍保持 `NOT READY`；后续仍需生产级限流、重试、降级告警、成本统计、提示词版本管理、真实 key 环境联调记录、输出防护策略和人工确认页面。

## D-062 任务 9D.16 终检报告采用一单一份内部报告第一增量

状态：已确认并执行第一增量。

决策：

- 新增 `final_inspection_report` 表，以 `order_id` 唯一约束保证一单一份终检报告。
- 生成终检报告前必须存在订单最后一道工序节点的 `OUT/PASS` 终检出检记录；缺失时返回 409。
- 报告生成接口 `POST /final-inspection-reports` 复用 `check:write`，读取接口 `GET /final-inspection-reports/{orderId}` 复用 `check:read-internal`。
- 医生端不允许读取终检报告；第一增量只面向内部生产/管理验收。
- 前端先复用「返工终检」页面提供报告摘要、生成按钮和结果展示，不新增独立终检报告模块。

影响：

- 终检材料从“只有检查记录/发货门禁”推进到可留存、可读取的报告第一增量。
- 本轮不新增终检附件、PDF 导出、电子签名、终检专用角色，也不关闭返工记录或补责任分类。
- Task 8 总体仍保持 `NOT READY`；后续仍需完整返工闭环、终检专用角色/附件、生产级 AI 治理、真实弱网/跨设备续传和生产部署。

## D-063 任务 9D.17 返工关闭采用目标节点重新 OUT/PASS 后人工关闭第一增量

状态：已确认并执行第一增量。

决策：

- 返工关闭先做内部生产人工关闭动作，不引入自动关闭或复杂工作流引擎。
- 新增 `POST /reworks/{reworkId}/close`，复用 `check:write`，WORKER 必须是返工目标节点分配人，ADMIN 可操作。
- 关闭前必须存在返工目标节点在来源失败检查之后重新提交的 `OUT/PASS` 检查记录；缺失时返回 409。
- 关闭时写入 `status=DONE`、`reason_category`、`responsibility_type`、`close_note`、`closed_by_user_id` 和 `closed_at`。
- 前端先复用「返工终检」页面提供原因分类、责任类型、关闭备注和关闭按钮。

影响：

- 返工从“只读记录 + 终检入口”推进到可关闭、可留痕的第一增量。
- 本轮不做责任分类字典、复杂 DAG 回滚策略、返工通知联动、绩效明细归因或完整返工处理台。
- Task 8 总体仍保持 `NOT READY`；后续仍需复杂返工影响范围后续增量、终检专用角色/附件、生产级 AI 治理、真实弱网/跨设备续传和生产部署。

## D-064 任务 9D.18 返工字典先采用后端固定字典和关闭校验

状态：已确认并执行第一增量。

决策：

- 新增 `GET /reworks/dictionaries` 返回关闭返工可用的原因分类和责任类型 code。
- 字典第一增量先采用后端固定列表，不引入数据库迁移、RuoYi 字典表或后台 CRUD。
- `POST /reworks/{reworkId}/close` 只接受字典内的 `reason_category` 和 `responsibility_type`；非法 code 返回 400。
- 前端「返工终检」页面不再硬编码关闭返工下拉选项，改为加载 `/reworks/dictionaries`。

影响：

- 9D.17 的自由文本责任字段被收紧为后端定义的有限 code，减少上线前数据污染。
- 本轮不做字典后台维护、责任归因规则、绩效明细联动、返工通知联动或复杂 DAG 影响范围。
- Task 8 总体仍保持 `NOT READY`；后续仍需复杂返工影响范围后续增量、生产级 AI 治理、真实弱网/跨设备续传和生产部署。

## D-065 任务 9D.19 返工通知联动先复用内部通知事实表

状态：已确认并执行第一增量。

决策：

- 返工通知第一增量不新增表，不引入消息队列，复用既有 `notification_event` / `user_notification` 和 `NotificationPushService`。
- 出检失败生成返工记录后写 `REWORK_CREATED`，目标用户为返工目标节点 `assigned_user_id`。
- 返工关闭后写 `REWORK_CLOSED`，目标用户为订单 `cs_user_id`。
- 通知 payload 只包含 `event`、`orderId`、`orderNo`、`message`、`reworkId`、`targetNodeInstanceId`。
- 医生用户不接收返工通知，医生端通知与 WebSocket 仍不得暴露内部返工信息。

影响：

- 返工从“可创建/可关闭”推进到“内部相关人有通知事实”的第一增量。
- 本轮不做复杂 DAG 回滚、返工影响范围计算、绩效归因报表、消息模板后台维护、双实例 Redis 联调或生产网关验收。
- Task 8 总体仍保持 `NOT READY`；后续仍需复杂返工影响范围后续增量、终检专用角色/附件、生产级 AI 治理、真实弱网/跨设备续传和生产部署。

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

## D-070 任务 9D.24 四入口登录页先复用同一前端站点

状态：已确认并执行第一增量。

决策：

- PRD 表 0 中的医生端、客服端、生产端、管理端“使用入口/对应端口”，本轮按同一前端站点登录页四个入口处理，不拆四个 TCP 端口或四套前端部署。
- 登录请求新增 `portal` 字段，取值为 `DOCTOR`、`CS`、`PRODUCTION`、`ADMIN`。
- 后端在账号密码校验通过后继续校验入口与账号角色匹配：`DOCTOR -> DOCTOR`、`CS -> CS`、`PRODUCTION -> WORKER`、`ADMIN -> ADMIN`。
- 角色不匹配返回 403，缺少或非法 `portal` 返回 400，账号密码错误仍返回 401。

影响：

- 前端隐藏入口不再是唯一防线，服务端会拒绝错入口登录。
- 登录成功后仍复用现有 RBAC 菜单和权限路由，不新增角色、不重构菜单。
- Task 8 总体仍保持 `NOT READY`；后续仍需生产级 Spring Security/JWT、完整 RuoYi 管理 UI、refresh token 轮换、access token 黑名单、多设备会话策略和正式环境浏览器验收。

## D-071 任务 9D.36 客户演示界面不展示技术标识

状态：已确认并执行追加修正。

决策：

- 客户演示版前端工作台只展示中文业务语言，不展示权限码、组件名、路由路径、角色英文码或图标字体英文 ligature。
- 代码中的 `portal`、route、permission、component 等技术字段继续保留，用于登录、菜单权限、路由和接口调用，但不得直接渲染到客户可见页面。
- 客服端按客户反馈陈列订单管理、沟通中心、客户管理、产品管理、配送管理、账单管理、外协管理。
- 生产端按客户反馈陈列人员管理、设备管理、物料异常等入口。
- 外协管理、设备管理、物料异常、生产端人员管理本轮作为客户演示级前端入口陈列，不新增后端接口、不调整 RBAC、不声明为 PRD 原有 P0 完整交付。

影响：

- 解决展示视频中工作台暴露 `/dashboard`、`DashboardView`、权限码和 `ADMIN/WORKER` 等技术标识的问题。
- 后续若客户确认这些新增入口进入正式范围，需要单独补 PRD/任务拆分、权限点、接口、数据表和验收用例。
- Task 8 总体仍保持 `NOT READY`；本轮只处理客户演示前端展示质量。

## D-072 任务 9D.36 前端演示导航使用同源展示配置

状态：已确认并执行追加修正。

决策：

- 四个端口的左侧栏和工作台快捷入口统一从 `displayNavigationConfig` 派生，避免工作台功能名与侧栏功能名不一致。
- 左侧栏主功能允许包含子功能；父级用于归类，子功能负责进入具体页面或演示占位页。
- 未接入后端接口的客户新增功能本轮只进入中文占位页，不复用无关页面，也不展示 route、permission、component 等工程字段。
- 医生端订单管理内聚为新建订单、我的订单、设计稿确认、账单物流、沟通留言、订单助手子栏目，避免多个入口都无区分地跳到同一订单页。
- 管理端进入工艺、权限、人员、设备、物料、外协、AI 治理等功能后继续保持管理端导航模板，不再因复用业务 route 切换成其他端口菜单。

影响：

- 解决客服端、医生端、生产端、管理端中“多个入口进入同一页面”“工作台按钮点击不了”“左侧栏与工作台名称不一致”“管理端点击后菜单种类变化”等客户反馈问题。
- 占位页仅代表前端演示导航已纳入范围；正式交付前仍需为客户管理、外协管理、账单管理、设备管理、物料异常、AI 治理等模块补 PRD、接口、权限、数据表和验收用例。

## D-073 任务 9D.36 四端视觉主题由登录入口锁定

状态：已确认并执行追加修正。

决策：

- 四端口复刻旧版 HTML 原型的角色色彩：医生端使用医生蓝，客服端使用客服紫，生产端使用生产青。
- 管理端采用深石墨侧栏加管理蓝强调色，保持后台控制台气质，同时避免与医生端蓝色完全混同。
- 前端主题由登录时选择的入口写入 `activePortalTone`，点击后续功能或进入复用 route 时不得根据 route 改变侧栏模板或颜色。
- 侧栏、功能选中态、说明卡、占位页、订单/工序选中态统一使用 `--portal-*` CSS 变量，禁止局部组件写死某一端口颜色。
- 新增真实浏览器 smoke `npm run smoke:task9d36`，逐一登录四入口并点击多个侧栏功能，校验主题类、主色和侧栏色保持稳定。

影响：

- 解决“进入不同入口后点击功能区颜色模板不统一、管理端点击后侧栏变动”的演示问题。
- 本轮只锁定前端视觉主题和演示一致性，不新增业务接口、不调整 RBAC、不改变服务端入口角色校验。

## D-074 任务 9D.36 工作台复刻为业务仪表盘而非功能入口页

状态：已确认并执行追加修正。

决策：

- 工作台不再重复左侧栏已有功能入口；左侧栏负责“去哪儿”，工作台负责“今天先处理什么、哪里有异常、整体状态怎么样”。
- 四端工作台按旧版 HTML 原型复刻为业务驾驶舱：顶部 KPI、核心待办/异常面板、趋势/效率卡片和端口主操作按钮。
- 四入口登录成功后统一进入 `/dashboard`，让客户看到的第一屏就是对应端口工作台，再由左侧栏进入具体功能。
- 工作台 KPI 卡片不显示右上角黑色图标，避免视觉干扰；趋势区先做演示级 SVG 折线图，正式经营统计后续再接后端统计接口。
- 医生端聚焦我的订单、设计确认、补资料、沟通、账单物流和到货延期。
- 客服端聚焦订单审核、资料处理、客户沟通、账单物流、客户异常和投诉返工。
- 生产端聚焦实时同步、生产异常、待派工、返工终检、医生待确认和产能效率。
- 管理端按同一视觉体系做后台总览，聚焦订单、异常、账号权限、生产瓶颈、AI 治理和预算告警。
- 订单/队列类页面复刻 HTML 的高密度表格语言：快速筛选 chip、白色队列卡片、彩色状态 badge、等待对象、等待天数和行内动作按钮；chip 必须有点击选中态，已有真实筛选字段的页面同步联动接口参数。

影响：

- 解决“工作台放左侧栏已有功能没有意义”的产品问题，让客户演示第一屏更像真实业务系统。
- 本轮仍只改前端展示组织、视觉和已有前端筛选交互，不新增后端接口、不改变现有真实功能、权限、数据加载和服务端校验。
