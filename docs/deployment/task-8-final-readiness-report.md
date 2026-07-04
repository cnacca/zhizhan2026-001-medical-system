# Task 8 Final Readiness Report

状态：NOT_READY。

生成时间：2026-07-04。

资料来源：

- `docs/deployment/readiness-checklist.md`
- `docs/acceptance/task-8-acceptance-matrix.md`

本报告是 Task 8 readiness 终检报告第一增量，只整理上线前缺口，不新增业务功能，不把 Task 8 标完成。

验收矩阵机器可读缺口清单第一增量已同步到 `acceptance.json` 的 `task8_readiness_gaps`，可通过 `npm run check:task8-readiness-gaps` 列出当前关键上线缺口。

## 上线前缺口清单

| 缺口名称 | 当前证据 | 未完成原因 | 需要补的最小闭环 | 推荐验证命令或验收方式 |
| --- | --- | --- | --- | --- |
| 正式鉴权与 DataScope 收口 | readiness checklist 中“正式鉴权与数据范围”为 PARTIAL；已具备数据库账号、权限码、data_scope、Bearer token、refresh/logout、Controller 权限注解和部分 SQL DataScope。 | 尚未完整接入 RuoYi-Vue-Pro 管理 UI、生产级 Spring Security/JWT、通用 DataScope SQL、refresh token 轮换、access token 黑名单和多设备会话策略。 | 先做生产级 JWT/Spring Security 第一增量：关闭生产 profile 下 `X-Bootstrap-*` 兼容路径，保留本地 smoke 兼容，补关键接口 Bearer 回归。 | `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test`；生产 profile 启动门禁 smoke；医生/客服/生产/管理四角色越权矩阵。 |
| 前端业务页面完整度 | readiness checklist 中“前端业务页面”为 PARTIAL；已具备四入口登录、医生下单、客服初审、客服协同台消息审核、客服资料缺失提示、AI 翻译草稿确认、生产审核、工序实例、质检工时、绩效、生产看板、返工、返工影响图形化、终检报告和终检专用角色 / 附件第一增量。 | 仍缺实时自动保存、完整账单物流、设计稿预览 URL 聚合、绩效周期筛选/公式/申诉等完整页面闭环。 | 下一步做设计稿预览 URL 聚合第一增量，让医生端/客服端设计稿版本展示授权预览链接。 | `npm run build:frontend`；对应 smoke；后端目标测试；客户按 12 步主链路点击验收。 |
| WebSocket / 通知生产验收 | readiness checklist 和 acceptance matrix 中 WebSocket / 通知仍为 PARTIAL；已完成单实例 WebSocket、通知 REST、前端通知中心、Redis 广播代码路径、AI 外部告警 outbox 监控/列表/失败可见性。 | 缺真实双后端实例 Redis 联调、心跳/重连压测、Nginx/HTTPS 生产网关验收、接收端 webhook 验签/防重放和生产 webhook 联调。 | 先做 webhook 接收端验签/防重放第一增量，或双实例 Redis WebSocket 联调脚本第一增量。 | `NotificationWebSocketTests`、`NotificationBroadcastTests`、AI external alert sender tests；双实例本地 compose 验收记录；Nginx/HTTPS smoke。 |
| 文件上传真实上线边界 | readiness checklist 中“文件上传”为 PARTIAL；105MB Multipart、本地恢复、服务端候选恢复和中断恢复浏览器 smoke 已通过。 | 缺真实弱网限速/断网、完整跨设备浏览器续传、文件大小/类型/数量最终限制和测试/正式 bucket 隔离验收。 | 先补文件限制与 bucket 环境隔离第一增量，再补弱网/跨设备 smoke。 | `npm run smoke:task9d10-large-upload`、`npm run smoke:task9d10-server-resume`、`npm run smoke:task9d10-interrupted-resume`；新增弱网/跨设备记录。 |
| AI 生产治理剩余项 | readiness checklist 中“AI 接入”为 PARTIAL；已完成 DeepSeek 默认关闭、限流、成本审计、重试、失败审计、治理摘要、预算阈值、熔断、分角色/分模型预算、提示词版本、输出防护、外部告警发送/调度/重试/死信/幂等/签名/监控/列表/失败可见性。 | 仍缺真实 key 环境联调、接收端验签/防重放联调、生产 webhook 联调、提示词后台管理、流式输出过滤、生产级成本看板和更完整输出策略。 | 先做 AI 外部告警接收端验签/防重放第一增量；真实 key 仍只允许外部注入，不提交。 | `npm run check:openapi`、AI gateway tests、DeepSeek tests；启用环境变量的本地 dry-run/联调记录；确认无真实 key 入库。 |
| 订单主链路完整端到端 | acceptance matrix 中医生下单、客服审核、生产审核、设计稿、账单物流、确认收货多项仍为 PARTIAL。 | 已有大量后端和页面第一增量，但缺完整 12 步端到端页面验收、实时自动保存、完整客服协同、账单/物流平台、付款状态和设计稿多轮回归。 | 先产出 12 步主链路 e2e smoke 第一增量，固定最小演示数据和验收脚本。 | Playwright 端到端 smoke；`npm run build:frontend`；`platform-server test`；客户按矩阵逐项签字。 |
| 返工 / 绩效 / 终检业务完整度 | acceptance matrix 中返工流程、绩效统计、终检发货仍为 PARTIAL；9D.55 已补返工字典后台维护第一增量，9D.56 已补终检专用角色 / 附件第一增量，9D.57 已补返工影响图形化第一增量。 | 已有返工关闭、责任分类、字典后台维护、影响范围、影响图、绩效归因、绩效明细、终检报告和内部附件绑定第一增量，但缺标准工时、绩效完整公式/周期/申诉、终检 PDF/签名和真实物流平台。 | 后续从绩效周期筛选或客服协同闭环继续补，不一次扩展到 PDF 签章或真实物流。 | `CheckWorklogPerformanceTests`；前端 smoke；OpenAPI 检查；客户验收公式/字段。 |
| 部署基础设施 | readiness checklist 中“部署基础设施”为 NOT_READY。 | 仍缺 Nginx HTTPS、Docker 镜像构建、测试/正式环境隔离、生产 `.env` 注入、数据库备份、日志留存和监控告警。 | 先做部署安全 / 环境变量 readiness 检查第一增量，明确必须外部注入变量和默认关闭能力。 | `npm run acceptance`；新增部署安全静态检查；`docker compose config`；生产 profile 启动门禁检查。 |
| 操作手册 | readiness checklist 中“操作手册”为 NOT_READY。 | 管理员、客服、生产、医生端操作手册和故障处理手册尚未编写。 | 先做医生/客服/生产/管理四端最小操作手册目录和首版故障处理清单。 | 文档评审；按手册完成一次本地演示；客户/PM 确认。 |
| 客户 / PM 确认项 | acceptance matrix 明确动态表单最终字段、AI-5 模板、标准工时、付款状态、Multipart 限制等仍需确认。 | 这些是产品/业务口径问题，不能仅靠开发补齐。 | 建立确认表，逐项记录负责人、决策日期、默认方案和未决风险。 | 客户/PM 签字或书面确认；同步更新 `PROJECT.md`、`DECISIONS.md`、OpenAPI 和验收矩阵。 |

## 当前结论

Task 8 仍为 `in-progress / NOT_READY`。当前代码和文档已经具备多条最小链路的自动化证据，但正式上线仍卡在生产级鉴权、完整业务前端、真实环境联调、文件/AI/通知生产验收、部署安全和操作交付材料。

下一轮唯一推荐目标：设计稿预览 URL 聚合第一增量。
