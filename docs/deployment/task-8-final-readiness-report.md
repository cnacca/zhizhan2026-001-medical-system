# Task 8 Final Readiness Report

状态：NOT_READY。

生成时间：2026-07-05。

资料来源：

- `docs/deployment/readiness-checklist.md`
- `docs/acceptance/task-8-acceptance-matrix.md`

本报告是 Task 8 readiness 终检报告第一增量，只整理上线前缺口，不新增业务功能，不把 Task 8 标完成。

验收矩阵机器可读缺口清单第一增量已同步到 `acceptance.json` 的 `task8_readiness_gaps`，可通过 `npm run check:task8-readiness-gaps` 列出当前关键上线缺口。

9D.68 已新增 `docs/acceptance/phase-one-main-chain-customer-acceptance.md`，把 12 步主链路固定演示数据整理为客户验收版 PASS/FAIL 记录。该记录仍是第一增量，不代表客户/PM 已签字，Task 8 仍为 `NOT_READY`。

9D.69 已新增一期后端/前端 Dockerfile、Nginx API/WebSocket 代理、`deploy/docker-compose.phase-one.yml`、`deploy/env/phase-one.prod.example` 和 `docs/deployment/phase-one-docker-env.md`。该记录只代表部署基础设施第一段可静态检查，不代表真实生产部署完成。

9D.70 已新增四端操作手册、故障处理清单和交付材料索引：`docs/operations/phase-one-role-operation-manual.md`、`docs/operations/phase-one-troubleshooting-guide.md`、`docs/operations/phase-one-delivery-materials-index.md`。该记录只代表操作手册第一段，不代表客户培训签收完成。

9D.71 已新增 AI 外部告警接收端验签 / 防重放第一段：`/ai/external-alerts/receive` 默认关闭，显式启用并注入 receiver signing secret 后校验 timestamp 时间窗、nonce 重放和 HMAC 签名。该记录只代表本地验收桩，不代表真实生产 webhook 联调完成。

9D.72 已新增客户 / PM 确认项清单第一段：`docs/acceptance/phase-one-customer-pm-confirmations.md` 记录付款状态口径、动态表单最终字段、AI-5 生产备注模板、标准工时与绩效公式口径、Multipart 上传限制、真实电子签章 / 终检报告模板、真实物流平台 / 运单同步、客户培训与签收、真实环境上线验收边界。该记录只建立确认追踪，不代表客户或 PM 已签字。

9D.73 付款状态第一段已新增 `order_bill.payment_status`、`/orders/{orderId}/bill/payment-status` 和前端人工维护付款状态入口；医生端可只读查看付款状态。该记录只代表人工付款状态第一段，不代表真实支付系统或财务审批完成。

9D.74 绩效标准工时与完整公式口径第一段已新增 `performance_formula_version=PHASE_ONE_DEFAULT_V1`、标准工时覆盖率、标准工时缺失数量和默认绩效分；前端绩效页只读展示公式版本、标准工时覆盖率和默认绩效分。该记录只代表 CP-004 开发默认公式第一段，不代表客户 / PM 已确认正式绩效口径，也不作为工资或奖惩结算依据。

9D.75 正式鉴权与 DataScope 收口第一段已新增 `APP_AUTH_ALLOW_ROLE_FALLBACK` 权限码优先模式；生产 profile、一期 compose 和生产 env 示例固定为 `false`，声明权限码的接口必须由 Bearer token 中的权限码放行，角色-only token 返回 403。该记录只代表生产鉴权收口第一段，不代表完整 Spring Security/JWT、完整 RuoYi 管理 UI 或通用 SQL DataScope 已完成。

9D.76 WebSocket / 通知生产验收第一段已新增 `npm run check:task9d76`，并在一期 Nginx 生产骨架补 `/notifications` REST 代理，保留 `/ws/` WebSocket upgrade 代理；该检查还串联 compose Redis/后端依赖、Redis 广播代码路径、通知 REST 隔离/已读测试、WebSocket 脱敏测试和 Redis 远端广播测试。该记录不代表真实双实例 Redis 联调、Nginx HTTPS 验收或真实生产 webhook 联调完成。

## 上线前缺口清单

| 缺口名称 | 当前证据 | 未完成原因 | 需要补的最小闭环 | 推荐验证命令或验收方式 |
| --- | --- | --- | --- | --- |
| 正式鉴权与 DataScope 收口 | readiness checklist 中“正式鉴权与数据范围”为 PARTIAL；已具备数据库账号、权限码、data_scope、Bearer token、refresh/logout、Controller 权限注解、部分 SQL DataScope、prod 关闭 bootstrap header 门禁和 9D.75 权限码优先模式。 | 9D.75 已关闭生产角色兜底第一段，但尚未完整接入 RuoYi-Vue-Pro 管理 UI、生产级 Spring Security/JWT、通用 DataScope SQL、refresh token 轮换、access token 黑名单和多设备会话策略。 | 后续补生产级 Spring Security/JWT 或通用 SQL DataScope 第一段；本轮下一优先级转向 WebSocket / 通知生产验收。 | `npm run check:task9d75`；`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=StrictPermissionModeTests,AuthStartupValidatorTests,BearerIdentityTests,PermissionInterceptorTests test`；生产 profile 启动门禁 smoke；医生/客服/生产/管理四角色越权矩阵。 |
| 前端业务页面完整度 | readiness checklist 中“前端业务页面”为 PARTIAL；已具备四入口登录、医生下单、客服初审、客服协同台消息审核、客服资料缺失提示、AI 翻译草稿确认、设计稿预览 URL 聚合、客服端设计稿审核预览增强第一段、账单物流预览/录入、人工付款状态、生产审核、工序实例、质检工时、绩效、绩效周期筛选第一段、绩效标准工时与完整公式口径第一段、生产看板、返工、返工影响图形化、终检报告、终检专用角色 / 附件第一增量、终检 PDF/签名第一段、9D.62 12 步主链路浏览器 smoke 第一增量、9D.62.1 固定演示数据前 3 步、9D.62.2 首个派工节点工序操作数据动作、9D.62.3 设计稿确认数据动作、9D.62.4 账单/物流第一段数据动作、9D.62.5 终检后发货/确认收货第一段数据动作、9D.63 返工异常路径数据动作和 9D.67 文件上传限制与 bucket 隔离第一段。 | 9D.74 已让绩效接口和前端展示默认公式版本、标准工时覆盖率和默认绩效分；仍缺实时自动保存、真实支付系统、真实物流平台、真实电子签章/复杂报告模板、客户/PM 对 CP-004 的正式确认、绩效申诉/导出/工资发放等完整页面闭环。 | 下一段补正式鉴权与 DataScope 收口第一段。 | `npm run check:task9d74`；`npm run build:frontend`；后端目标测试；客户按 12 步主链路点击验收。 |
| WebSocket / 通知生产验收 | readiness checklist 和 acceptance matrix 中 WebSocket / 通知仍为 PARTIAL；已完成单实例 WebSocket、通知 REST、前端通知中心、Redis 广播代码路径、AI 外部告警 outbox 监控/列表/失败可见性、9D.71 接收端验签 / 防重放本地验收桩，以及 9D.76 Nginx 通知 REST / WebSocket 生产网关 readiness 第一段。 | 缺真实双后端实例 Redis 联调、心跳/重连压测、Nginx HTTPS 生产网关验收、生产 webhook 联调和完整业务页面联动。 | 后续在具备真实环境后补双实例 Redis WebSocket 联调记录、Nginx HTTPS smoke 或生产 webhook 联调记录。 | `npm run check:task9d76`；`NotificationWebSocketTests`；`NotificationRestTests`；`NotificationBroadcastTests`；双实例本地 compose 验收记录；Nginx HTTPS smoke。 |
| 文件上传真实上线边界 | readiness checklist 中“文件上传”为 PARTIAL；105MB Multipart、本地恢复、服务端候选恢复和中断恢复浏览器 smoke 已通过；9D.67 文件上传限制与 bucket 隔离第一段已补 `FILE_MAX_FILE_SIZE_BYTES`、`FILE_ALLOWED_CONTENT_TYPES`、`FILE_MAX_FILES_PER_ORDER` 和测试/正式 `MINIO_BUCKET` 配置边界；9D.77 已补本地弱网 / 跨设备恢复第一段；9D.78 已补测试 / 正式对象存储 bucket 隔离验收记录第一段。 | 仍缺真实弱网物理网络、真实跨设备实机、真实测试/正式 bucket 实际创建与账号隔离、客户最终 Multipart 限制签字和真实对象存储联调。 | 后续补真实环境文件上传人工验收记录模板第一段，或在真实测试环境补弱网/跨设备人工验收记录。 | `npm run check:task9d67`；`npm run check:task9d77`；`npm run check:task9d78`；`npm run smoke:task9d10-large-upload`、`npm run smoke:task9d10-server-resume`、`npm run smoke:task9d10-interrupted-resume`、`npm run smoke:task9d77-file-upload-resilience`。 |
| AI 生产治理剩余项 | readiness checklist 中“AI 接入”为 PARTIAL；已完成 DeepSeek 默认关闭、限流、成本审计、重试、失败审计、治理摘要、预算阈值、熔断、分角色/分模型预算、提示词版本、输出防护、外部告警发送/调度/重试/死信/幂等/签名/监控/列表/失败可见性和 9D.71 接收端验签 / 防重放本地验收桩。 | 仍缺真实 key 环境联调、生产 webhook 联调、提示词后台管理、流式输出过滤、生产级成本看板和更完整输出策略。 | 后续补真实 key / 生产 webhook 联调记录；AI-5 模板引用 CP-003 确认结果。 | `npm run check:task9d71`；`npm run check:openapi`；AI gateway tests、DeepSeek tests；启用环境变量的本地 dry-run/联调记录；确认无真实 key 入库。 |
| 订单主链路完整端到端 | acceptance matrix 中医生下单、客服审核、生产审核、设计稿、账单物流、确认收货多项仍为 PARTIAL；9D.62 已补 12 步入口 smoke，9D.62.1 已补固定演示数据前 3 步，9D.62.2 已补首个派工节点入检/开工/工时/完工/出检通过，9D.62.3 已补设计稿上传、客服审核、医生预览和确认数据动作，9D.62.4 已补账单文件上传、医生预览和终检前发货门禁数据动作，9D.62.5 已补剩余工序完成、物流发货和医生确认收货数据动作，9D.63 已补出检失败、返工记录、目标节点重做和返工关闭数据动作，9D.64 已补客服端设计稿预览链接，9D.65 已补终检 PDF file_id 和签名占位，9D.66 已补绩效周期筛选，9D.67 已补文件上传限制，9D.73 已补人工付款状态第一段，9D.74 已补绩效公式默认口径第一段。 | 已有大量后端和页面第一增量，但缺实时自动保存、真实物流平台、真实支付系统、真实电子签章/复杂报告模板和客户验收版完整 12 步端到端记录。 | 下一段补正式鉴权与 DataScope 收口第一段。 | `npm run smoke:task9d62`；`npm run build:frontend`；`platform-server test`；客户按矩阵逐项签字。 |
| 返工 / 绩效 / 终检业务完整度 | acceptance matrix 中返工流程、绩效统计、终检发货仍为 PARTIAL；9D.55 已补返工字典后台维护第一增量，9D.56 已补终检专用角色 / 附件第一增量，9D.57 已补返工影响图形化第一增量，9D.65 已补终检 PDF/签名第一段，9D.66 已补绩效周期筛选第一段，9D.74 已补绩效标准工时与完整公式口径第一段。 | 已有返工关闭、责任分类、字典后台维护、影响范围、影响图、绩效归因、绩效明细、绩效周期、标准工时覆盖率、开发默认绩效分、终检报告、内部附件绑定、内部 PDF 绑定和签名占位第一增量，但缺标准工时配置、客户/PM 公式确认、绩效申诉/导出/工资发放、真实电子签章/复杂报告模板和真实物流平台。 | 后续从正式鉴权与 DataScope 收口继续补，不一次扩展到真实电子签章或真实物流。 | `CheckWorklogPerformanceTests`；`npm run check:task9d74`；前端 smoke；OpenAPI 检查；客户验收公式/字段。 |
| 部署基础设施 | readiness checklist 中“部署基础设施”为 PARTIAL；9D.69 已补后端/前端 Dockerfile、full-stack compose 示例、生产 env 占位示例和 Docker/env 隔离文档，`npm run compose:phase-one:config` 已通过。 | 仍缺 Nginx HTTPS、镜像仓库、真实服务器部署、测试/正式环境真实联调、数据库备份恢复演练、日志留存、监控告警和发布回滚手册。 | 下一段补操作手册与交付材料第一段，或在具备真实环境后补 HTTPS/备份/监控 smoke。 | `npm run check:task9d69`；`npm run compose:phase-one:config`；后续真实环境 smoke。 |
| 操作手册 | readiness checklist 中“操作手册”为 PARTIAL；9D.70 已补四端最小操作手册、首版故障处理清单和交付材料索引，9D.72 已把培训签收纳入 CP-008。 | 仍缺正式客户培训签收、真实生产部署手册、备份恢复演练、日志留存、监控告警和发布回滚手册。 | 后续按 CP-008 补客户培训签收记录，或在真实环境具备后补生产部署/回滚/值班手册。 | `npm run check:task9d70`；按手册完成一次本地演示；客户/PM 确认。 |
| 客户 / PM 确认项 | 9D.72 已新增 `docs/acceptance/phase-one-customer-pm-confirmations.md`，把付款状态、动态表单、AI-5 模板、标准工时、Multipart、签章、物流、培训签收和真实环境边界列为可追踪项。 | 这些仍是产品/业务口径问题，当前只有默认方案和负责人占位，不能由开发直接关闭。 | PM 指定每项负责人和目标日期，客户 / PM 逐项书面确认或修改默认方案。 | `npm run check:task9d72`；客户/PM 签字或书面确认；同步更新 `PROJECT.md`、`DECISIONS.md`、OpenAPI 和验收矩阵。 |

## 当前结论

Task 8 仍为 `in-progress / NOT_READY`。当前代码和文档已经具备多条最小链路的自动化证据，但正式上线仍卡在生产级鉴权、完整业务前端、真实环境联调、文件/AI/通知生产验收、部署安全和操作交付材料。

下一轮唯一推荐目标：真实环境文件上传人工验收记录模板第一段；9D.78 已补测试 / 正式对象存储 bucket 隔离验收记录第一段，真实弱网实机、真实生产对象存储和客户/PM 确认仍留在 BLOCKED 清单。

## 9D.77 文件上传弱网 / 跨设备验收第一段

9D.77 已新增 `scripts/smoke-task-9d77-file-upload-resilience.spec.mjs`、`npm run check:task9d77` 和 `npm run smoke:task9d77-file-upload-resilience`。当前证据覆盖设备 A 弱网延迟 + 断网中断、服务端 Multipart pending 状态、设备 B 无本地 localStorage 后通过服务端候选恢复并完成同一 `file_id`。本轮仍不关闭真实弱网物理网络、真实跨设备实机、客户 Multipart 限制签字和测试/正式 bucket 实际隔离缺口。Task 8 仍保持 `NOT_READY`。

## 9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段

9D.78 已新增 `docs/acceptance/task-9d78-bucket-isolation-readiness.md`、`scripts/check-task-9d78-bucket-isolation-readiness.mjs` 和 `npm run check:task9d78`。当前证据覆盖本地 `.env.example` bucket 与一期生产 env 示例 bucket 不同、生产 bucket 仍为占位示例、一期 compose 要求外部注入 `MINIO_BUCKET`，并把该边界写入 acceptance / readiness 文档。本轮不接真实生产对象存储，不提交真实 MinIO 密钥、真实 bucket 名称或生产 URL。真实测试 / 正式 bucket 创建、对象存储账号隔离、真实网络访问和客户 / PM 确认仍未关闭。Task 8 仍保持 `NOT_READY`。
