# Deployment Readiness Checklist

更新日期：2026-07-01

## 总结

当前项目不能部署正式生产环境。Task 8A/8B/9A/9B.1/9B.2/9B.3/9B.4/9B.5/9B.6/9B.7/9C.1/9C.2/9C.3/9D.1/9D.2/9D.3/9D.4/9D.5/9D.6/9D.7/9D.8/9D.9/9D.10 的结论是：后端多条最小业务链路已有自动化和 smoke 基线，当前后端基线 OpenAPI 已二次冻结，服务端 Bearer 身份基线、后端集中权限守卫、数据库化 RBAC/DataScope 基础、菜单/部门/岗位与前端权限路由第一增量、权限注解/统一拦截器、订单/工序实例 SQL DataScope 第一增量、文件/协同/AI DataScope 扩展、生产鉴权启动门禁第一增量、WebSocket 通知第一增量、通知未读/已读 REST、前端消息中心入口、Redis 广播代码路径第一增量、医生订单工作台第一增量、医生下单第一增量、客服初审第一增量、生产审核第一增量、生产任务入口第一增量、入检/出检/工时操作页面第一增量、绩效管理页面第一增量、生产看板第一增量、返工终检第一增量、Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器上传 smoke 已落地；正式上线仍需要先补齐完整 RuoYi 管理 UI、完整前端业务页面、WebSocket 生产网关/真实多实例验收、真实外部服务配置和客户确认项。

## 必须完成后才能上线

| 类别 | 当前状态 | 必须完成项 |
| --- | --- | --- |
| 正式鉴权与数据范围 | PARTIAL | 已支持数据库账号、角色、权限码、data scope、基础菜单/部门/岗位、前端菜单权限、服务端签发 HMAC Bearer token、后端 `AccessControlService` 集中守卫、`@RequirePermission` / `PermissionInterceptor` 入口权限校验、业务 Controller 统一身份参数解析、订单/工序实例/文件/协同订单范围/AI 内部上下文 SQL DataScope 过滤，以及 prod profile 启动门禁；仍需接入 RuoYi-Vue-Pro 完整管理 UI、通用 DataScope SQL 覆盖和生产级 Spring Security/JWT。 |
| 前端业务页面 | PARTIAL | 已有医生订单读取工作台第一增量、医生下单第一增量、客服初审第一增量、生产审核第一增量、生产任务入口第一增量、质检工时第一增量、绩效管理第一增量、生产看板第一增量、返工终检第一增量、Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器上传 smoke：订单列表/详情、公开消息、医生可见设计稿、账单物流、医生 AI、确认收货、动态表单读取、提交订单、已完成 file_id 绑定入口、医生端最小 Uppy 文件选择/上传并回填绑定、本地恢复上传、无本地会话候选恢复、中断恢复、105MB 浏览器 Multipart smoke、客服待审列表和通过/驳回表单、生产待审列表、工序链实例化入口、工序实例详情、派工转派、worker 我的任务、入检/出检提交、工时 start/pause/resume/finish、绩效统计快照、跨状态生产检索、节点进度、待返工记录和终检出检入口；本轮已补 `127.0.0.1:5173` 本地登录 CORS 和 `/form-configs` Vite proxy 并完成医生下单浏览器 smoke；仍缺草稿上传、真实弱网/跨设备浏览器续传、完整客服消息/账单物流、返工关闭/责任分类、终检报告/发货前拦截和管理端绩效明细。 |
| WebSocket / 通知 | PARTIAL | 已实现 `/ws/connect?token=...` 单实例在线推送，基于 `notification_event` / `user_notification` 派发脱敏 payload，并写 `delivered_at`；已实现通知列表、未读数、单条已读、全部已读 REST 接口、前端通知中心实时刷新、Redis 广播代码路径和返工通知联动第一增量。仍需真实双后端实例 Redis 联调、心跳/重连压测、Nginx/HTTPS 生产验收、监控告警和完整业务页面联动。 |
| OpenAPI 契约 | READY_FOR_CURRENT_BASELINE | 当前 61 个 path / 72 个 operation 已补唯一 `operationId`、统一 4xx/503/default、关键 DTO/schema、license；9D.1 已补 `/orders` 当前实现响应 schema，9D.9 已补 `/reworks` 和 `ReworkRecordResponse`，9D.10 已补 Multipart 文件上传、status 恢复与 pending 候选接口；Swagger validate 与 Redocly lint 通过。后续新增接口必须持续同步。 |
| 文件上传 | PARTIAL | 已实现 MinIO Multipart 初始化、分片签名、status、pending、complete/abort、审计和医生写路径越权拒绝，前端已有最小 Uppy 文件选择/上传、本地恢复上传、服务端候选恢复并回填 `file_id`；`npm run smoke:task9d10-large-upload` 已通过本地 105MB 浏览器上传，`file_id=457` 为 21 个分片完成；`npm run smoke:task9d10-server-resume` 已通过无本地上传会话时复用 pending `file_id=514` 的浏览器 smoke；`npm run smoke:task9d10-interrupted-resume` 已通过第 2 个分片中断后复用同一 `file_id=537` 的浏览器 smoke。仍需确认文件大小/类型/数量限制、真实弱网/跨设备浏览器续传和测试/正式 bucket 隔离。 |
| AI 接入 | PARTIAL | 接入真实 DeepSeek 或确认模型适配层；补 API Key 环境变量、限流、重试、成本统计、提示词版本、输出防护；复测 AI-3 越权。 |
| 订单主链路 | PARTIAL | 已有医生订单读取、公开协同信息、医生 AI、确认收货、医生提交订单、Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、上传中断后恢复浏览器 smoke、100MB+ 浏览器上传 smoke、客服初审、生产审核、工序实例详情、派工、worker 任务池、入检/出检、工时、绩效、生产看板和返工终检页面级第一增量；仍需补草稿/补资料、真实弱网/跨设备浏览器续传、返工关闭/责任分类、终检报告/发货前拦截、付款状态。 |
| 生产规则 | PARTIAL | 补责任分类、返工原因字典、复杂 DAG 回滚策略、标准工时和绩效完整公式。 |
| 部署基础设施 | NOT_READY | Nginx HTTPS、Docker 镜像构建、测试/正式环境隔离、生产 `.env` 注入、数据库备份、日志留存、监控告警。 |
| 操作手册 | NOT_READY | 编写管理员、客服、生产、医生端操作手册和故障处理手册。 |

## 环境变量与密钥边界

- 仓库只保留 `.env.example` 占位值，不提交真实密钥。
- 正式环境需要通过部署平台或服务器安全注入以下变量：数据库账号密码、Redis、MinIO access/secret、DeepSeek API Key、`APP_AUTH_TOKEN_SECRET` 或正式 JWT 密钥、HTTPS 证书路径或托管配置。
- 正式环境必须使用 `spring.profiles.active=prod`，通过 `application-prod.yml` 和启动校验固定关闭本地烟测 header；如果 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=true` 或 `APP_AUTH_TOKEN_SECRET` 仍是本地占位值，后端应启动失败。
- 测试环境和正式环境必须使用不同数据库、不同 MinIO bucket、不同对象存储凭据。

## 上线前建议命令

```bash
npm run acceptance
npm run check:toolchain
npm run compose:config
npm run check:openapi
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
- 用浏览器完成 PRD 12 步主链路，保留截图、订单号、日志和数据库核验记录。
- 对 100MB+ STL 文件继续做真实弱网限速/断网和跨设备浏览器续传验收；当前中断恢复 smoke 已覆盖本地第 2 分片失败后的同浏览器续传。
- 对 WebSocket 做在线推送、离线未读补偿、已读同步、多实例广播和网关代理验收。
