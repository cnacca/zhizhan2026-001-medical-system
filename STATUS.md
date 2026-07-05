# STATUS

## 项目目标

完成「AI 智能下单与生产协同平台」一期交付：医生在线下单、客服审核协同、生产工序流转、入检/出检、返工、工时绩效、账单物流、通知、5 个 AI 智能体、文件安全和医生端脱敏必须围绕 12 步主链路形成可验收闭环。

## 当前状态

- 仓库是本地 Git 仓库；夜间开发 worktree 使用分支 `codex/nightly-task8-readiness`，基于 `feature/project-skeleton` 隔离推进 Task 8 readiness。
- 2026-07-04 本轮上传状态：`feature/project-skeleton` 已推送到 GitHub；本轮业务开发基线为 `5e9ee18`，后续文档回补提交不改变业务代码边界。本轮按边界拆分为生产汇总、AI 治理、Task 8 文档回写和 workflow helper 整理提交；工作区只剩未跟踪 `test-results/` 运行产物，未纳入提交。
- 2026-07-01 上传交接状态：已确认本地 `feature/project-skeleton` 与 `origin/feature/project-skeleton` 对齐；上传后产生的未提交后续试验改动已撤回。本次只做文档总结回写，不继续推进业务代码。
- 2026-07-01 新版 PRD/TRD/API 对齐决策已确认：以新资料为最新业务准绳，保留当前已验证增量，OpenAPI 后续按差异合并维护。
- Active goal: `goals/GOAL-001-scope-clarified-for.md`
- Active task: `tasks/README.md` 的「任务 8：专项验收矩阵与上线准备」，状态为 `next/t2-customer-service-collaboration`
- 当前总目标已从“继续推进 9D 小增量”收束为“完成一期交付”；9D 任务只作为补齐一期上线缺口的执行单元。前端匹配一期范围见 `docs/acceptance/phase-one-frontend-alignment.md`；后续按端口拆一期任务、处理已完成和超一期入口时使用 `docs/acceptance/phase-one-frontend-task-scope.md`。
- 本轮 9D.71 AI 外部告警接收端验签 / 防重放第一段已完成：发送侧签名启用时会发送 `X-AI-Alert-Timestamp`、`X-AI-Alert-Nonce` 和 `X-AI-Alert-Signature`，签名基串为 `timestamp.nonce.requestBody`；新增默认关闭的 `/ai/external-alerts/receive` 本地接收端验收桩，显式启用并注入接收端 secret 后校验 timestamp 时间窗、nonce 重放和 HMAC 签名。本轮不接真实外部 webhook，不提交真实 secret，不做分布式 nonce 存储或生产联调。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.72 客户 / PM 确认项清单第一段已完成：新增 `docs/acceptance/phase-one-customer-pm-confirmations.md`，把付款状态口径、动态表单最终字段、AI-5 生产备注模板、标准工时与绩效公式口径、Multipart 上传限制、真实电子签章 / 终检报告模板、真实物流平台 / 运单同步、客户培训与签收、真实环境上线验收边界纳入确认表。本轮只建立追踪，不替代客户或 PM 书面确认，不关闭 Task 8。
- 本轮 9D.73 账单 / 付款状态 / 物流一期闭环第一段已完成：新增 `order_bill.payment_status`、`PaymentStatusRequest`、`/orders/{orderId}/bill/payment-status` 和前端客服人工维护付款状态入口；医生端账单物流页只读展示付款状态。付款状态仅采用 9D.72 / CP-001 默认人工口径，不接真实支付系统，不做财务审批或支付渠道对账，物流发货仍沿用终检 `OUT/PASS` 门禁。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.74 绩效标准工时与完整公式口径第一段已完成：`/performance` 新增 `performance_formula_version=PHASE_ONE_DEFAULT_V1`、标准工时合计、标准工时覆盖数量、缺失数量、覆盖率和默认绩效分；前端绩效页只读展示公式版本、标准工时覆盖率和默认绩效分。该公式仅为 CP-004 开发默认口径，不作为工资、奖金或奖惩结算依据，不替代客户 / PM 书面确认。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.75 正式鉴权与 DataScope 收口第一段已完成：新增 `APP_AUTH_ALLOW_ROLE_FALLBACK`，本地默认保留角色兜底以兼容 smoke，`prod` profile 和一期 compose 生产骨架固定为 `false`；`@RequirePermission` 写了权限码的接口在严格模式下必须由 Bearer token 中的权限码放行，角色-only token 不再绕过权限码。新增 `StrictPermissionModeTests` 和 prod 启动门禁测试。本轮不重写 Spring Security/JWT，不做完整 RuoYi 管理 UI、通用 SQL DataScope、access token 黑名单、refresh token 轮换或多设备会话策略。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.76 WebSocket / 通知生产验收第一段已完成：新增 `npm run check:task9d76`，并在一期 Nginx 配置中补 `/notifications` REST 代理，避免生产前端通知中心落到 SPA fallback；同一检查串联 `/ws/` upgrade 代理、compose Redis/后端依赖、后端 Redis 广播代码路径、通知 REST 隔离/已读测试、单实例 WebSocket 脱敏测试和 Redis 远端广播测试。本轮不启动真实生产环境，不做真实双实例 Redis 联调、Nginx HTTPS 验收或真实生产 webhook 联调。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段已完成：新增 `docs/acceptance/task-9d78-bucket-isolation-readiness.md` 和 `npm run check:task9d78`，检查本地 `.env.example` 的 `MINIO_BUCKET=ai-order-private` 与一期生产 env 占位 bucket 不同、生产 bucket 仍为占位示例、一期 compose 要求外部注入 `MINIO_BUCKET`，并同步 readiness / acceptance 证据。本轮不接真实生产对象存储，不提交真实 MinIO 密钥、真实 bucket 名称或生产 URL，不替代客户 / PM 书面确认。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.79 真实环境文件上传人工验收记录模板第一段已完成：新增 `docs/acceptance/task-9d79-real-env-file-upload-manual-acceptance.md` 和 `npm run check:task9d79`，提供真实测试环境/正式环境文件上传人工验收模板，覆盖测试 bucket、正式 bucket、对象存储账号隔离、文件限制、弱网、跨设备、越权读取和客户/PM 签字状态。模板默认 `待填写` / `待确认`，不填写真实密钥，不代表真实环境已验收。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段已完成：新增 `docs/acceptance/task-9d80-ai-production-integration-acceptance.md` 和 `npm run check:task9d80`，提供真实测试/正式环境 AI 真实 key、生产 webhook、发送侧签名、接收端验签 / 防重放、预算熔断、输出防护和审计留痕的人工验收模板。模板默认 `待填写` / `待确认`，不填写真实密钥，不填写真实 webhook URL，不代表真实 key 或生产 webhook 已联调完成。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.70 操作手册与交付材料第一段已完成：新增 `docs/operations/phase-one-role-operation-manual.md`、`docs/operations/phase-one-troubleshooting-guide.md` 和 `docs/operations/phase-one-delivery-materials-index.md`，覆盖医生端、客服端、生产端、管理端最小操作路径、首版故障处理清单和交付材料索引。本轮不替代正式客户培训签收，不关闭客户/PM 确认项。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.69 部署基础设施第一段已完成：新增后端 `backend/platform-server/Dockerfile`、前端 `frontend/Dockerfile`、Nginx SPA/API/WebSocket 代理配置、`deploy/docker-compose.phase-one.yml`、`deploy/env/phase-one.prod.example` 和 `docs/deployment/phase-one-docker-env.md`；`npm run compose:phase-one:config` 已能用占位 env 展开 full-stack compose 配置。本轮不写真实密钥、不启动真实生产环境、不做 HTTPS/镜像仓库/备份/监控/真实环境联调。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.68 12 步主链路客户验收版收敛已完成：新增 `docs/acceptance/phase-one-main-chain-customer-acceptance.md`，把 9D.62 到 9D.63 的固定演示数据 smoke 证据整理为客户/PM 可读 PASS/FAIL 清单，记录固定演示订单 `ORD20260704-C230B9CA90`、返工记录 `678`、物流单号 `SF-9D62-1783175824632`、最终外部状态 `COMPLETED` 和剩余上线缺口。本轮不新增业务功能、不新增接口、不替代客户签字。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.67 文件上传限制与 bucket 隔离第一段已完成：`/files/upload-token` 和 `/files/multipart/initiate` 在发放预签名或初始化 Multipart 前统一校验 `FILE_MAX_FILE_SIZE_BYTES`、`FILE_ALLOWED_CONTENT_TYPES` 和 `FILE_MAX_FILES_PER_ORDER`；医生端上传选择增加同口径的大小、类型、数量提示；`.env.example`、OpenAPI、acceptance、readiness 和前端范围文档已同步测试/正式 `MINIO_BUCKET` 隔离边界。本轮不做真实弱网限速/断网全量验收、完整跨设备续传、独立文件中心、Tus/tusd、真实电子签章平台或真实物流平台。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.66 绩效周期筛选第一段已完成：`/performance` 和 `/performance/details` 新增 `start_date` / `end_date`，按 `work_log.finished_at` 日期闭区间过滤统计与明细；返工归因和出检通过率同步按对应事实创建时间过滤。前端绩效页新增开始/结束日期输入，OpenAPI、acceptance 和文档已同步。本轮不做标准工时后台配置、完整绩效公式、绩效申诉、导出、工资发放或全员绩效大屏。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.65 终检 PDF/签名第一段已完成：终检报告新增 `pdf_file_id`、`signature_status`、`signed_by_user_id`、`signed_at`，可绑定同订单已完成上传、`INTERNAL` 可见且 `application/pdf` 的终检 PDF 文件，并默认返回 `signature_status=PENDING` 的签名占位。前端返工终检页新增终检 PDF file_id 输入和签名状态展示，OpenAPI、acceptance 和文档已同步。本轮不接真实电子签章平台、不生成复杂 PDF 模板、不做签章流转/归档状态机、不改变医生端不可读终检报告和内部 PDF 的安全边界。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.64 客服端设计稿审核预览增强第一段已完成：客服初审 / 内部订单设计稿页现在会在选中订单后加载该订单设计稿版本列表，客服可按设计稿文件 ID 调用既有 `/files/{fileId}/preview-url` 获取短时效授权预览链接。本轮不新增后端接口、不新增数据库字段、不新增 OpenAPI 契约，不做复杂在线审稿、批注、三轮驳回/重传完整回归、设计稿阻塞生产规则、终检 PDF/签名或真实物流平台。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.63 返工异常路径数据闭环第一段已完成：`npm run smoke:task9d62` 现在会在固定演示订单的首个已完成节点上提交出检失败，创建返工记录，确认目标节点回到 READY，再重做该节点并关闭返工。本轮真实 smoke 证据：`order_id=6838`、`order_no=ORD20260704-C230B9CA90`、`instance_id=2818`、`rework_id=678`、`target_node_instance_id=4389`、`status=DONE`、最终 `external_status=COMPLETED`。本轮不新增后端接口、不新增数据库字段、不新增演示种子数据，不做复杂返工看板、绩效申诉、真实通知压测、终检 PDF/签名或医生端返工可见。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.62.5 终检后发货与医生确认收货数据闭环第一段已完成：`npm run smoke:task9d62` 现在会在固定演示订单完成账单预览后，循环处理剩余 READY 工序节点直到工序实例 `COMPLETED`，再录入物流发货并由医生确认收货，断言医生端外部状态从 `SHIPPED` 进入 `COMPLETED`。本轮真实 smoke 证据：`order_id=6730`、`order_no=ORD20260704-63614EB7F3`、`instance_id=2772`、`completed_nodes=23`、`tracking_no=SF-9D62-1783174965185`、`external_status=COMPLETED`。本轮不新增后端接口、不新增数据库字段、不做真实物流平台、支付系统、付款状态流转、财务审批、终检 PDF/签名或返工异常路径。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.62.4 账单/物流数据闭环第一段已完成：`npm run smoke:task9d62` 现在会在固定演示订单完成设计稿确认后，由 CS 通过真实文件签名 URL 上传账单文件到 MinIO，绑定订单账单，医生读取账单并获取短时效预览 URL，同时断言未完成全链路终检前物流发货返回 409 门禁。本轮不新增后端接口、不新增数据库字段、不做真实物流平台、支付系统、付款状态流转、财务审批或终检 PDF/签名。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.62.3 设计稿确认数据闭环第一段已完成：`npm run smoke:task9d62` 现在会在固定演示订单完成首个派工节点出检通过后，由 worker 通过真实文件签名 URL 上传设计稿文件到 MinIO，绑定设计稿版本，CS 审核通过，医生读取设计稿列表、获取短时效预览 URL 并确认设计稿，再继续跑 12 步四端入口浏览器 smoke。本轮不新增后端接口、不新增数据库字段、不做在线 CAD、复杂批注、三轮驳回/重传完整回归或设计稿阻塞生产规则。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.62.2 派工与工序操作数据闭环第一段已完成：`npm run smoke:task9d62` 现在会在固定演示订单生产审核通过后，读取工序实例首个 `READY` 节点，管理员派工给 worker，断言 worker 任务池可见，提交入检通过，完成开工、工时开始/完成、完工和出检通过，再继续跑 12 步四端入口浏览器 smoke。本轮不新增后端接口、不新增数据库字段、不做完整工艺链全节点执行、设计稿/账单/物流/确认收货完整数据动作。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.62.1 固定演示数据闭环第一段已完成：`npm run smoke:task9d62` 现在会先通过真实 API 登录医生/客服账号，创建固定演示订单，完成客服初审通过和生产审核通过，并断言 `PROCESS_INSTANCE_CREATED` 与 `instance_id` 后，再继续跑 12 步四端入口浏览器 smoke。本轮不新增后端接口、不新增数据库字段、不做派工/工时/设计稿/账单/物流/确认收货完整数据动作。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.62 12 步主链路浏览器 smoke 第一增量已完成：新增 `scripts/smoke-task-9d62-main-chain.spec.mjs`、`scripts/check-task-9d62-main-chain-browser-smoke.mjs`、`npm run check:task9d62` 和 `npm run smoke:task9d62`，先固定 PRD/TRD 12 步主链路的四端浏览器入口和页面/控件可达断言。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.61 账单物流预览/录入闭环第一增量已完成：客服/内部订单页新增最小账单 `file_id` 上传入口，医生端账单物流页新增“获取账单预览链接”，复用既有 `/orders/{orderId}/bill`、`/orders/{orderId}/logistics` 和 `/files/{fileId}/preview-url`；物流录入继续走生产看板并保留终检发货门禁。本轮不新增后端接口、不做真实物流平台、支付系统或财务审批流。Task 8 总体仍保持 `NOT READY`。
- 本轮 9D.60 设计稿预览 URL 聚合第一增量已完成：医生端设计稿版本列表新增“获取设计稿预览链接”，按设计稿 `file_ids` 调用既有 `/files/{fileId}/preview-url` 获取短时效签名 URL 并展示为外链；本轮不新增后端接口、不把预览 URL 固化进设计稿响应、不做在线 CAD 预览器或完整设计稿审批重构。Task 8 总体仍保持 `NOT READY`。
- 本轮 9D.59 客服资料缺失提示与 AI 翻译草稿确认第一增量已完成：客服初审页新增资料缺失提示、AI 翻译草稿和“写入生产备注”人工确认入口，复用既有 `/ai/check-missing`、`/ai/translate` 和 `/orders/{orderId}/review`；本轮不新增后端 schema、不做 AI 自动审核/发送/驳回。Task 8 总体仍保持 `NOT READY`。
- 本轮 9D.58 客服协同闭环第一增量已完成：客服端 `/collaboration` 从占位入口升级为客服协同台，复用既有消息审核接口展示待审核消息、按订单 ID 查看订单消息上下文，并支持通过/驳回生产发给医生的消息；本轮不新增后端 schema、不做完整 CRM、物流平台 API、AI 自动审核/发送或复杂客服工单。Task 8 总体仍保持 `NOT READY`。
- 本轮 9D.57 返工影响图形化第一增量已完成：生产端返工终检页新增只读返工影响图，把既有 `target_node_instance_id`、`target_process_name`、`impacted_node_count` 和 `impacted_node_instance_ids` 转成可读的“返工目标 -> 后续重置节点”路径；已用浏览器真实点击验证生产端从“看返工”进入返工终检可见影响图，医生端不可见该内部图。本轮不新增后端接口、不做复杂甘特、拖拽排产、重新派工或医生端返工可见。Task 8 总体仍保持 `NOT READY`。
- 本轮 9D.56 终检专用角色 / 附件第一增量已完成：新增 `final-inspection:manage` 专用权限、`final_inspection_report_file` 绑定表和终检报告附件 `attachment_file_ids`；终检报告生成只允许具备专用权限的内部账号，附件必须是同订单、已完成上传、`INTERNAL` 可见文件，医生端不能读取终检报告或内部附件预览 URL。Task 8 总体仍保持 `NOT READY`。
- 9D.55 开源底座复用清单与返工字典后台维护第一增量已完成：新增 `docs/development/open-source-foundation-reuse-gap-list.md`，按 RuoYi-Vue-Pro / 若依 Pro 的字典/CRUD/菜单/权限范式，把返工原因和责任类型从后端固定字典推进到 ADMIN 后台可维护、可停用的数据库字典。
- 本轮验收矩阵机器可读缺口清单第一增量已完成；`acceptance.json` 新增 `task8_readiness_gaps`，并新增 `npm run check:task8-readiness-gaps` 列出当前上线缺口。Task 8 总体仍保持 `NOT READY`。
- 本轮提交边界：`1895f79 feat(production): add summary dashboards`、`f395584 feat(ai): add external alert governance controls`、`c781eae docs: refresh task 8 readiness handoff`、`5e9ee18 refactor(workflow): group final inspection helpers`。
- 已按 RepoFrame + Yuri 工作流创建项目上下文文档。
- 已完成任务 0：接口契约与项目基线。
- 已完成任务 0.1：按 TRD V1.1 深度研究优化版对齐开发计划。
- 已完成任务 1 前置预检：确认本机 Node/npm/pnpm/Docker CLI/Colima 可用，Docker daemon 当前未运行，Java Runtime/Maven/Gradle 不可用，并整理任务 1 三条执行路线。
- 已按路线 A 初始化前后端工程骨架；当前仅包含框架启动壳、模块边界占位和 ADMIN 登录烟测，不包含订单、工序、文件、AI、绩效等业务实现。
- 本机 JDK 21、Maven、Node/npm/pnpm、Docker CLI/Colima 可用；Docker daemon 已通过 Colima 启动。

## 已完成

- 9D.33 已补 AI 预算超限内部通知第一增量：预算跨线后写入 `AI_BUDGET_EXCEEDED` 通知事实，只通知 ACTIVE 的 ADMIN / CS 数据库账号，并复用现有通知中心和 WebSocket 本地推送；不通知 DOCTOR / WORKER，不做外部告警或熔断。
- 9D.34 已补 AI 预算通知策略开关第一增量：新增 `AI_BUDGET_NOTIFICATION_ENABLED`，默认开启；关闭后预算跨线仍写 `AI_BUDGET_EXCEEDED` 治理审计，但不写内部通知事实、不触发本地推送。
- 9D.35 AI 预算熔断/降级第一增量已补：新增 `AI_BUDGET_CIRCUIT_BREAKER_ENABLED`，默认关闭；开启后预算已超限时真实模型调用返回 deterministic fallback，并写入 `AI_BUDGET_CIRCUIT_OPEN` 治理审计。
- 9D.36 已按客户旧版医生端、客服端、生产端 HTML 原型完成前端全页面视觉第一增量，并已追加 product design 精修：登录页改为深蓝窄卡片端口入口，登录后侧栏改为品牌区/身份块/分组菜单/底部说明，业务状态码和产品类型前端显示中文化；保留现有 Vue 路由、RBAC 菜单、接口调用和服务端权限边界。
- 9D.36 已按客户展示视频反馈追加前端展示清理：工作台不再展示 `ADMIN/WORKER` 等角色码、路由路径、组件名、权限码条或图标字体英文兜底；客服端工作台补订单管理、沟通中心、客户管理、产品管理、配送管理、账单管理、外协管理；生产端工作台补人员管理、设备管理、物料异常等客户反馈入口。
- 9D.36 已按客户二次反馈追加导航结构修正：四个端口的工作台卡片与左侧栏共用 `displayNavigationConfig`，主功能含子功能；工作台名称与左侧栏一致；未接接口的新功能进入中文占位页；医生端订单管理拆成新建订单、我的订单、设计稿确认、账单物流、沟通留言、订单助手子栏目；管理端点击工艺、权限、人员、设备、外协等功能时保持管理端菜单模板。
- 9D.36 已按客户三次反馈追加版式修正：左侧栏固定到页面顶部并合并为单一“AI智能下单平台”标题；登录后右侧内容网格改为自然内容高度，避免侧栏高度撑开顶部说明卡和功能卡之间的间距。
- 9D.36 已按客户旧版三端 HTML 原型追加四端视觉主题锁定：医生端复刻医生蓝，客服端复刻客服紫，生产端复刻生产青，管理端采用深石墨管理蓝；入口主题由登录端口决定，点击左侧任一功能后侧栏结构、颜色和整体版式保持不变。
- 9D.36 已按客户确认追加原型工作台复刻：工作台不再重复左侧栏功能入口，改为医生/客服/生产/管理四端业务仪表盘；订单、生产、设计稿/数据处理类页面补原型式快速筛选 chip、队列卡片、彩色状态 badge 和高密度表格视觉。
- 9D.36 已按客户最新反馈追加工作台交互修正：四入口登录后默认进入工作台；工作台 KPI 卡片移除黑色图标；快速筛选 chip 增加点击选中态，并在生产看板、我的任务、内部订单等已有筛选接口上联动加载；工作台新增演示级趋势图表。
- 9D.36 已按客户生产端展示反馈追加模块陈列并二次收敛命名：生产端左侧导航保留安环管理、成本管理、质量与返工、奖惩管理、设备管理、物料异常等正式入口；质量与返工子功能收敛为质量总览、返工管理、终检报告，内返率和外返率放入页面指标与工作台趋势展示；生产工作台 7 个指标卡改为紧凑网格，避免长条卡片撑高页面；四端左上角身份区新增账号管理/账号切换弹出面板，账号切换复用现有退出登录逻辑，不改后端接口和权限校验。
- 9D.37 已补 AI 预算外部告警待发送事实第一增量：新增 `ai_external_alert_outbox`，预算跨线和预算熔断命中后分别写入 `AI_BUDGET_EXCEEDED` / `AI_BUDGET_CIRCUIT_OPEN` 的 `PENDING` 外部告警事实；本轮不接真实外部发送器。
- 9D.38 已补 AI 分角色预算第一增量：新增 `ai_audit_log.actor_role` 和四个角色日预算变量，预算熔断开启且角色预算超限时返回 deterministic fallback，写入 `AI_BUDGET_ROLE_CIRCUIT_OPEN` 治理审计和外部告警 outbox。
- 9D.39 已补 AI 分模型预算第一增量：新增 `AI_DEEPSEEK_DAILY_BUDGET_MICROUSD`，预算熔断开启且当前 `AI_DEEPSEEK_MODEL` 预算超限时返回 deterministic fallback，写入 `AI_BUDGET_MODEL_CIRCUIT_OPEN` 治理审计和外部告警 outbox。
- 9D.40 已补 AI 提示词版本与输出防护第一增量：新增 Flyway `V21__ai_prompt_version_output_guard.sql`，AI 审计写入 `prompt_version`；真实模型输出命中敏感密钥、审计表、文件表、系统账号等模式时返回安全保护文案，并写入 `AI_OUTPUT_GUARDED`。
- 9D.41 已补 AI 外部告警发送器第一增量：新增本地 dry-run 发送器，`PENDING` outbox 可推进到 `SENT` / `FAILED`，并记录 `attempts` 和 `last_error`；本轮不接真实短信、邮件、企业微信或其他外部渠道密钥。
- 9D.42 已补 AI 成本趋势第一增量：新增 `/ai/governance/cost-trend` 和 `AiGovernanceCostTrendResponse`，按天聚合成功模型调用的 `estimated_cost_microusd`、`success_count` 与 `model_count`；本轮不做图表 UI、导出、真实账单对账或预算策略管理。
- 9D.43 已补 AI 真实外部渠道适配第一增量：`EXTERNAL_ALERT` 默认仍 dry-run；显式启用 `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=true` 并配置 `AI_EXTERNAL_ALERT_WEBHOOK_URL` 后，发送器会以 `application/json` POST outbox payload；9D.45 后，非 2xx 或连接异常进入有限重试/死信链路。本轮不提交真实 webhook、短信、邮件或企业微信密钥，不做签名或生产联调。
- 9D.44 已补 AI 外部告警调度器第一增量：新增默认关闭的调度器、`AI_EXTERNAL_ALERT_SCHEDULER_*` 环境变量和调度器测试；显式启用后按批次调用既有 sender，默认不自动处理 outbox；本轮不做分布式锁、复杂重试、死信、真实渠道密钥或生产 webhook 联调。
- 9D.45 已补 AI 外部告警重试/死信第一增量：新增 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS`，webhook 失败会累计 `attempts/last_error`；未达上限保持 `PENDING`，达到上限进入 `DEAD_LETTER`，避免无限重试。
- 9D.46 已补 AI 外部告警幂等/并发领取第一增量：sender 先领取 `PENDING -> SENDING` 后再 dry-run 或 webhook 外呼，重复触发和并发 sender 不会重复发送同一条 outbox。
- 9D.47 已补 AI 外部告警 webhook 签名/鉴权第一增量：签名默认关闭；启用签名且注入 secret 后，请求携带 `X-AI-Alert-Signature` HMAC-SHA256 签名；不提交真实 secret。
- 9D.48 已补 AI 外部告警监控/运维可观察第一增量：新增 `/ai/governance/external-alerts/summary`，CS / ADMIN 可只读查看 `PENDING/SENDING/SENT/FAILED/DEAD_LETTER` 数量分布、最近一条失败/死信错误和最老待发送时间；本轮不做 webhook 联调、真实渠道密钥、人工重放或告警抑制。
- 9D.48.1 已补 AI 外部告警 outbox 列表/筛选第一增量：新增 `/ai/governance/external-alerts`，CS / ADMIN 可只读查看 `alert_id/event_type/send_status/created_at/updated_at` 安全元数据，并按状态、事件类型、创建时间范围和 limit 筛选；本轮不返回 payload、last_error、密钥、真实 webhook URL、prompt 原文或模型原始响应。
- 9D.48.2 已补 AI 外部告警失败/死信可见性第一增量：`/ai/governance/external-alerts` 对 FAILED / DEAD_LETTER 记录返回 `attempts`、脱敏 `last_error` 和 `last_attempted_at`，不返回真实 webhook URL、密钥、Bearer token、prompt 原文、模型原始响应或上游敏感响应；本轮不做重试按钮、死信恢复、人工处理状态或生产 webhook 联调。
- Task 8 readiness 终检报告第一增量已补：新增 `docs/deployment/task-8-final-readiness-report.md`，按缺口名称、当前证据、未完成原因、最小补齐闭环和推荐验证方式收敛上线前缺口；不改变 Task 8 `NOT_READY` 状态。
- 部署安全 / 环境变量 readiness 检查第一增量已补：新增 `scripts/check-deployment-env-readiness.mjs` 和 `npm run check:deployment-env`，检查 README、`.env.example`、`application.yml`、`application-prod.yml` 和 readiness checklist 的外部注入变量、默认关闭能力、`APP_AUTH_ALLOW_ROLE_FALLBACK=false` 生产边界和禁止提交真实密钥说明。
- 验收矩阵机器可读缺口清单第一增量已补：`acceptance.json` 新增 `task8_readiness_gaps`，覆盖正式鉴权、前端业务页面、WebSocket/通知、文件上传、AI 治理、部署基础设施、操作手册和客户/PM 确认项；`npm run check:task8-readiness-gaps` 可列出当前缺口。
- 9D.49 已补生产端质量与返工汇总后端适配第一增量：新增 `ProductionQualitySummaryResponse` 和 `/production/quality/summary`，按出检订单数汇总总返工率、内返率、外返率、一次通过率和终检通过率；投诉率/退货率因缺少事实表当前返回 0 并在 OpenAPI 说明；前端生产端质量总览接入真实接口，Vite 补 `/production` 代理。
- 9D.50 已补生产端设备管理汇总后端适配第一增量：新增 `ProductionEquipmentSummaryResponse`、`/production/equipment/summary` 和 Flyway `V22__production_equipment_foundation.sql`，按设备台账和设备事件汇总设备状态、待处理保养、故障报修、停机时长和平均设备稼动率；前端生产端设备管理接入真实汇总，医生端访问该内部生产接口返回 403。
- 9D.51 已补生产端物料异常汇总后端适配第一增量：新增 `ProductionMaterialExceptionSummaryResponse`、`/production/material-exceptions/summary` 和 Flyway `V23__production_material_exception_foundation.sql`，按物料异常事实表汇总缺料、错料、批次异常、材料损耗、处理状态和责任归属；前端生产端物料异常接入真实汇总，医生端访问该内部生产接口返回 403。
- 9D.52 已补生产端安环管理汇总后端适配第一增量：新增 `ProductionSafetyEnvironmentSummaryResponse`、`/production/safety-environment/summary` 和 Flyway `V24__production_safety_event_foundation.sql`，按安环事件事实表汇总安全巡检、隐患整改、环境记录、PPE/设备安全提醒、待办状态、超期和高风险事件；前端生产端安环管理接入真实汇总，医生端访问该内部生产接口返回 403。
- 9D.53 已补生产端成本管理汇总后端适配第一增量：新增 `ProductionCostSummaryResponse`、`/production/cost-management/summary` 和 Flyway `V25__production_cost_record_foundation.sql`，按成本记录事实表汇总工序成本、材料成本、人工成本、返工成本、外协成本和成本异常预警；前端生产端成本管理/外协成本接入真实汇总，医生端访问该内部生产接口返回 403。
- 9D.54 已补生产端奖惩管理汇总后端适配第一增量：新增 `ProductionRewardPenaltySummaryResponse`、`/production/reward-penalty/summary` 和 Flyway `V26__production_reward_penalty_foundation.sql`，按奖惩记录事实表汇总奖励、扣罚、待审批、已通过、已驳回、已生效、关联订单/工序/员工和本月金额；前端生产端奖惩管理接入真实汇总，医生端访问该内部生产接口返回 403。
- 9D.55 已补开源底座复用清单与返工字典后台维护第一增量：新增 `rework_dictionary_item`、`rework:dictionary:manage`、`/system/rework-dictionaries` 和 `/reworks/dictionaries/items` 管理接口；ADMIN 可新增、编辑、停用返工原因/责任类型，关闭返工只接受 ACTIVE 字典项，医生端不能管理内部返工字典。
- 9D.57 已补返工影响图形化第一增量：在 `/rework-final` 页面把返工目标节点和受影响后续节点渲染为只读影响图，帮助生产端理解后续工序重置关系；真实浏览器点击已覆盖生产端“看返工”进入返工终检、医生端无返工影响图；本轮不改变返工状态机、派工或医生端可见性。
- 9D.58 已补客服协同闭环第一增量：客服端 `/collaboration` 复用 `/messages/pending-review`、`/orders/{orderId}/messages` 和 `/messages/{msgId}/review`，支持查看待审核消息、订单消息上下文并审核通过/驳回；本轮不新增后端接口、不做完整 CRM、物流平台 API 自动同步、AI 自动审核/发送或复杂客服工单。
- 9D.59 已补客服资料缺失提示与 AI 翻译草稿确认第一增量：客服初审页复用 `/ai/check-missing` 展示资料缺失提示，复用 `/ai/translate` 生成翻译草稿，并要求客服点击“写入生产备注”后才随通过初审写入 `production_note`。
- 9D.60 已补设计稿预览 URL 聚合第一增量：医生端设计稿版本列表复用 `/files/{fileId}/preview-url` 按需为 `file_ids` 获取短时效预览链接；本轮不新增后端接口或在线 CAD 预览器。
- 9D.61 已补账单物流预览/录入闭环第一增量：客服/内部订单页可上传账单 `file_id`，医生端可按需获取账单短时效预览链接；物流发货仍由生产看板执行并保留终检门禁。
- 9D.62 已补 12 步主链路浏览器 smoke 第一增量：新增 `phaseOneMainChainSteps`、`npm run smoke:task9d62` 和 `npm run check:task9d62`，先覆盖四端主链路入口可达。
- 9D.62.1 已补固定演示数据闭环第一段：`npm run smoke:task9d62` 默认 `TASK9D62_DATA_MODE=fixed-demo-first-three`，先创建真实医生订单并完成客服初审、生产审核和工序实例化断言，再跑 12 步入口 smoke。
- 9D.62.2 已补派工与工序操作数据闭环第一段：同一 smoke 会把首个 READY 工序节点派给 worker，并完成任务池可见、入检、开工、工时、完工和出检通过；完整设计稿、账单物流、确认收货和返工异常数据动作仍留作后续增量。
- 9D.62.3 已补设计稿确认数据闭环第一段：同一 smoke 会用真实文件签名 URL 上传设计稿文件，完成设计稿上传、客服审核、医生预览 URL 获取和医生确认；完整账单物流、确认收货、返工异常和全工艺链节点数据动作仍留作后续增量。
- 9D.62.4 已补账单/物流数据闭环第一段：同一 smoke 会用真实文件签名 URL 上传账单文件，完成账单绑定、医生账单预览 URL 获取，并断言未完成全链路终检前物流发货 409 门禁；终检后发货、确认收货和全工艺链节点数据动作已由 9D.62.5 补齐，返工异常仍留作后续增量。
- 9D.62.5 已补终检后发货与医生确认收货数据闭环第一段：同一 smoke 会完成剩余 READY 工序节点直到实例完成，录入物流发货并由医生确认收货；返工异常、终检 PDF/签名、付款状态和真实物流平台仍留作后续增量。
- 9D.63 已补返工异常路径数据闭环第一段：同一 smoke 会提交出检失败、创建返工记录、重做目标节点并关闭返工；终检 PDF/签名、付款状态、真实物流平台、绩效完整公式/周期/申诉和真实弱网/跨设备上传仍留作后续增量。
- 9D.64 已补客服端设计稿审核预览增强第一段：客服端内部订单设计稿页可加载当前订单设计稿版本，并复用文件预览签名 URL 获取客服设计稿预览链接；终检 PDF/签名、付款状态、真实物流平台、绩效完整公式/周期/申诉和真实弱网/跨设备上传仍留作后续增量。
- 9D.65 已补终检 PDF/签名第一段：终检报告可绑定内部 PDF file_id 并返回签名占位状态；真实电子签章、复杂报告模板、付款状态、真实物流平台、绩效完整公式/周期/申诉和真实弱网/跨设备上传仍留作后续增量。
- 9D.66 已补绩效周期筛选第一段：`/performance` 与 `/performance/details` 支持 `start_date` / `end_date`，前端绩效页可按日期范围查询统计卡片和工时明细；标准工时配置、完整公式、申诉、导出和工资发放仍留作后续增量。
- 9D.56 已补终检专用角色 / 附件第一增量：新增 `final-inspection:manage`、`final_inspection_report_file`、终检报告 `attachment_file_ids` 请求/响应和前端最小 file_id 输入；终检报告生成前仍要求最后工序 `OUT/PASS`，生成报告只允许专用权限内部账号，医生端读取报告和内部附件预览均返回 403。
- 明确项目技术方向：Vue3 + Element Plus + Spring Boot + RuoYi-Vue-Pro + MySQL + Redis + MinIO + Uppy + 后端 ai-gateway + DeepSeek。
- 明确一期口径：9 条预定义工序链写入数据库，不做后台拖拽编辑器。
- 从 `.local-context/API规范_OpenAPI3.0.yaml` 修复并冻结稳定 OpenAPI 契约到 `docs/api/openapi.yaml`。
- 已修复 `duration_efficiency` 和 `standard_duration` 缺少冒号后空格导致的 YAML/OpenAPI 解析问题。
- 已合并重复 `/form-configs` path，保留 GET 和 POST。
- 已验证接口契约可被 Swagger/OpenAPI 工具解析，且 56 个 operation 覆盖既定模块。
- 已读取新版 TRD V1.1，确认其作为当前开发计划修订依据。
- 已将文件上传、AI 适配层、轻量 DAG、通知事实来源、专项测试矩阵等默认执行口径写入项目计划。
- 已新增 `docs/development/task-1-preflight.md`，记录任务 1 的本机环境预检、路线选择和验收边界。
- 已新增 `docs/development/task-1-execution-checklist.md`，记录任务 1 推荐基线、三条路线的开始检查、验收命令和禁止事项。
- 已新增 `tasks/TASK-002-project-skeleton-initialization.md`，把任务 1 拆成可执行任务文件，并加入 RepoFrame machine acceptance。
- 已执行任务 1 路线 A：安装 Homebrew `openjdk@21` 与 `maven`，并通过 `scripts/with-jdk21.sh` 固定项目命令使用 JDK 21。
- 已新增后端 Maven 多模块骨架：`backend/`，包含 `platform-server` 和 TRD V1.1 规划的 13 个模块边界。
- 已新增前端 Vue3 + Element Plus 骨架：`frontend/`。
- 已新增 `compose.yaml`、`.env.example`、根目录 `package.json`、`pnpm-workspace.yaml` 和工具脚本。
- 已启动 Colima，并通过 Docker Compose 拉起 MySQL、Redis、MinIO，三者均 healthy。
- 已完成任务 2：后端接入 MySQL + Flyway SQL，新增 TRD V1.1 核心表迁移和 9 条工序链种子数据。
- 已实现最小只读 Workflow API：`GET /workflow-chains`、`GET /workflow-chains/{chainId}/nodes`。
- 已按 `.local-context/生产流程.docx` 初始化 9 条工艺链，支持取模分支、贴面路线分支、种植基台分支和可选节点表达。
- 已完成任务 3：新增订单内部/外部状态枚举、`OrderStatusService`、`OrderStatusProjector`、医生端 `DoctorOrderVO`、内部端 `OrderInternalDTO`、AI-3 `DoctorOrderAssistantReadModel`。
- 已新增 Flyway `V3__order_status_projection_foundation.sql`，补齐订单状态投影基础字段、索引和外部状态默认值。
- 已实现最小订单详情、医生确认收货、医生端 AI-3 查询和医生访问工序实例 403 的烟测接口。
- 已用自动化测试和 HTTP smoke 验证医生端不返回 `internal_status`、`production_note`、`cs_user_id`、工序/员工/返工/工时等内部字段。
- 已完成任务 4：接入 MinIO Java SDK，新增文件上传 token、complete、预览/下载签名 URL 和医生端文件访问策略。
- 已新增 Flyway `V4__file_upload_access_foundation.sql`，为 `file_resource` 增加 `upload_status` 和查询索引。
- 已实现医生端文件访问边界：医生只能访问本人/本诊所且 `visibility` 为 `DOCTOR`、`DOCTOR_CS`、`ALL` 的已完成文件。
- 已验证上传 token、complete、preview、download 和拒绝访问均写入 `file_access_audit`。
- 已完成任务 5A：新增生产审核触发工序实例化、实例节点/边快照、节点 READY/IN_PROGRESS/COMPLETED/SKIPPED 状态机、派工/转派和我的任务池。
- 已新增 Flyway `V5__workflow_runtime_skip_metadata.sql`，为可选节点跳过记录 `skipped_at` 和 `skip_reason`。
- 已实现 DAG 激活规则：无前置节点初始 READY；后置节点只有在全部前置节点 COMPLETED 或 SKIPPED 后才进入 READY。
- 已验证医生端访问工序实例仍返回 403，模板变更不会影响已生成实例快照。
- 已完成任务 5B：新增入检/出检记录、出检失败返工、工时开始/暂停/继续/完成、绩效统计的最小只读接口。
- 已实现入检门禁：`need_in_check=1` 的节点必须存在通过的入检记录，才能从 `READY` 开工。
- 已实现出检时序：出检只允许在节点 `COMPLETED` 后提交；出检失败会写 `rework_record`，并把返工目标节点重新置为 `READY`，不删除历史 `check_record` / `work_log`。
- 已实现服务端工时计算：暂停段写入 `work_log_pause_segment`，完成工时时扣除暂停时长；同一节点返工后会生成新的 `work_log`，不覆盖原记录。
- 已实现绩效只读统计：WORKER 查询强制限定本人，ADMIN 可按 `user_id` 查询指定员工。
- 已完成任务 6：新增消息、设计稿、账单、物流和通知事实落库的后端最小链路。
- 已实现生产端消息待客服审核、审核后医生可见；医生端只读取已审核或直达的公开消息。
- 已实现设计稿上传、客服审核、医生确认/驳回的最小状态流转，并按事件写入 `notification_event` / `user_notification`。
- 已实现账单上传与物流发货；物流发货会通过 `OrderStatusService` 把医生端外部状态更新为 `SHIPPED`。
- 已验证医生端消息、设计稿、账单物流和订单详情不返回内部生产备注、内部状态等敏感字段。
- 已完成任务 7：新增后端最小 AI Gateway，覆盖 AI-1 翻译助手、AI-2 客服查询助手、AI-3 客户订单助手、AI-4 资料缺失检查助手、AI-5 生产备注助手。
- 已实现 5 个 AI 智能体的角色白名单、固定上下文类型、deterministic 安全占位输出和 `ai_audit_log` 审计落库。
- 已把 AI-3 接入 `DoctorOrderAssistantReadModel`，医生询问内部工序、员工、返工、工时、绩效等问题时返回安全拒绝，只补充公开状态/账单/物流/公开消息。
- 已实现 AI-4 基于 `form_field_config.required_flag` 与订单 `form_data` 的资料缺失检查，并保留医生端数据范围校验。
- 已启动任务 8A：依据 PRD 12 步主链路、TRD V1.1 专项测试矩阵和团队文档 M6 标准，新增专项验收矩阵、回归记录和上线 readiness 清单。
- 已新增 `docs/acceptance/task-8-acceptance-matrix.md`，用 `PASS / PARTIAL / BLOCKED / NOT_STARTED` 客观标注当前验收状态。
- 已新增 `docs/acceptance/task-8-regression-record.md`，记录本轮自动化检查、HTTP/SQL smoke 与既有测试覆盖。
- 已新增 `docs/deployment/readiness-checklist.md`，明确正式上线前必须补齐 RBAC/DataScope、WebSocket、前端页面、真实密钥配置、HTTPS、备份、MinIO 隔离、DeepSeek 接入等缺口。
- 已完成 Task 8A 本轮回归：acceptance、toolchain、Compose config、OpenAPI、前端 build、后端 Maven test 和 HTTP/SQL smoke 均已记录；正式上线结论保持 `NOT READY`。
- 已完成任务 8B：`docs/api/openapi.yaml` 已同步任务 4-7 当前后端基线，补齐 60 个唯一 `operationId`、统一 4xx/503/default 错误响应、文件 complete、工序节点 start/complete/skip 等缺失契约。
- 已新增 `scripts/check-openapi-contract.rb`，并把 `npm run check:openapi` 升级为自定义契约检查 + Swagger validate + Redocly lint；当前 Redocly warning 已清零。
- 已启动任务 9A：新增服务端签发 HMAC Bearer token、请求级身份上下文和 Bearer 身份 filter；接口优先使用 `Authorization: Bearer ...` 身份，`X-Bootstrap-*` 仅保留为本地烟测兼容路径。
- 已新增 `BearerIdentityTests`，验证 Bearer 医生身份下的医生端脱敏、跨医生 403，以及关闭 bootstrap header 后缺少 Bearer token 返回 401。
- 已推进任务 9B 第一增量：新增 `AccessControlService`，集中后端角色权限和数据范围守卫。
- 已修复派工/转派接口不读取当前身份的问题；现在仅 CS/ADMIN 可派工、转派和跳过可选节点。
- 已收紧内部检查记录与绩效范围：医生端不得读取 `check_record`，WORKER 只能看本人绩效，ADMIN 才能按 `user_id` 查询，CS/医生不能查绩效。
- 已新增 Bearer 回归：WORKER Bearer token 不能派工/跳过节点，DOCTOR Bearer token 不能读入检/出检记录，CS Bearer token 不能查员工绩效。
- 已推进任务 9B.2：新增 Flyway `V6__auth_rbac_datascope_foundation.sql`，建立 `system_user`、`system_role`、`system_permission`、`system_user_role`、`system_role_permission` 过渡表和本地种子账号。
- 登录接口已从硬编码 ADMIN 改为数据库账号校验；本地种子账号使用 PBKDF2-SHA256 hash，占位密码仅用于本地开发。
- Bearer token 已携带数据库解析出的 `username`、`user_id`、`clinic_id`、`permissions` 和 `data_scope`；`/api/auth/me` 可返回当前账号权限信息。
- 前端骨架登录 smoke 已改为显示真实登录账号、角色和 data scope。
- 已完成任务 9B.3：新增 `@RequirePermission`、`PermissionInterceptor`、`PermissionWebConfiguration`，将订单、文件、AI、Workflow Runtime、Check/WorkLog/Performance、消息、设计稿、账单物流等 Controller 入口纳入统一权限注解校验。
- 已新增 `PermissionInterceptorTests`，覆盖数据库医生账号可读本人脱敏订单但不能访问客服 AI、数据库工人账号不能派工且绩效强制本人、数据库客服账号不能读绩效。
- 已推进任务 9B.4 第一增量：新增 `BootstrapIdentityArgumentResolver`，业务 Controller 不再直接声明 `X-Bootstrap-*` 参数，兼容逻辑收口到统一身份解析器。
- 已将订单详情 / AI-3 安全读模型 / 内部订单详情 / 工序实例读取改为查询级 DataScope 过滤：`ALL` 可读全部，`CLINIC` 限定诊所或医生本人，`SELF` 限定医生/客服本人或已分配工序节点。
- 已补充 `PermissionInterceptorTests` 的数据库工人 SELF DataScope 回归：未分配节点时读取订单和工序实例返回 403，分配节点后允许读取。
- 已完成任务 9B.5 第一增量：文件读取/预览、上传 token 订单范围、消息/设计稿/账单物流订单范围、AI 内部上下文读取均加入查询级 DataScope 过滤。
- 已补充 `PermissionInterceptorTests` 的数据库工人 SELF DataScope 回归：未分配节点时读取消息和文件预览返回 403，分配节点后允许读取。
- 已完成任务 9B.6 第一增量：新增 RuoYi 风格 `system_dept`、`system_post`、`system_menu`、`system_role_menu`、`system_user_post` 基础表和种子数据。
- 登录与 `/api/auth/me` 已返回当前账号可见菜单；前端骨架已按后端菜单权限显示工作入口，医生账号不会显示内部订单或系统权限入口。
- 已完成任务 9B.7 第一增量：新增生产鉴权启动门禁，`prod` profile 禁止启用 `X-Bootstrap-*` 本地兼容，并要求 `APP_AUTH_TOKEN_SECRET` 使用非本地占位密钥。
- 已新增 `application-prod.yml`，生产 profile 默认 `allow-bootstrap-headers=false` 且不提供 token secret 默认值；新增 `AuthStartupValidatorTests` 覆盖生产门禁和非生产开关同步。
- 已完成任务 9C.1 第一增量：新增真实 WebSocket 通知通道 `/ws/connect?token=...`，握手时校验 Bearer token，在线用户收到 `notification_event` 脱敏 payload 后写 `user_notification.delivered_at`。
- 已新增 `NotificationWebSocketTests`，覆盖医生 Bearer token 建立 WebSocket、账单通知在线推送、内部备注不出现在 payload、送达时间落库。
- 已完成任务 9C.2 第一增量：新增通知列表、未读数、单条已读、全部已读 REST 接口，并按当前用户 `user_notification.user_id` 强制隔离。
- 已新增 `NotificationRestTests`，覆盖当前用户只读本人通知、未读数、单条已读、全部已读和他人通知隔离。
- 前端骨架已新增登录后的「通知中心」入口，支持未读徽标、刷新、单条已读和全部已读。
- `docs/api/openapi.yaml` 已同步 9B.8 Refresh Token/logout 契约；当前为 61 个 path / 72 个 operation / 72 个唯一 `operationId`。
- 已完成任务 9C.3 第一增量：前端通知中心登录后建立 `/ws/connect` WebSocket，收到实时通知后刷新通知列表和未读数，并显示连接状态。
- 已新增 Redis 通知广播第一增量：`NotificationBroadcaster`、`NotificationRedisBroadcaster`、`NotificationRedisBroadcastListener` 和条件化 Redis listener container；默认关闭，通过 `NOTIFICATION_REDIS_BROADCAST_ENABLED=true` 开启。
- 已新增 `NotificationBroadcastTests`，覆盖本机无在线 session 时仍发布广播、远端广播不会自回环且会触发本机投递。
- 已完成本地真实 `/ws` 代理 smoke：doctor 通过 Vite `/api/auth/login` 登录并连接 `ws://localhost:5173/ws/connect`，admin 调用 `/orders/{orderId}/bill` 后收到 `BILL_UPLOADED` 实时 payload。
- 已完成任务 9D.1 第一增量：实现 `GET /orders` 后端订单列表，医生端列表强制限定本人订单并返回脱敏 `DoctorOrderVO`；前端新增「医生订单工作台」，可读取订单列表/详情、公开消息、设计稿、账单物流，并可调用医生 AI、确认收货和处理待确认设计稿。
- 已新增 `scripts/check-task-9d1-frontend.mjs` 和 `npm run check:task9d1`，并把 9D.1 后端列表、前端工作台和 Vite `/orders`、`/ai` 代理纳入 `acceptance.json` 关键检查。
- 已按本轮交接要求回写 `STATUS.md`、`DECISIONS.md`、`tasks/README.md`、`README.md`：明确 9D.1 是医生订单读取侧第一增量，下一步锁定 9D.2 医生下单/动态表单/上传入口第一增量，Task 8 总体仍保持 `NOT READY`。
- 已完成任务 9D.2 第一增量：新增 `GET /form-configs` 只读动态表单、`POST /orders` 医生提交订单、本人已完成医生可见文件绑定校验、`V8__doctor_order_entry_form_seed.sql` 默认表单字段、前端「新建订单」面板和 `npm run check:task9d2`。
- 9D.2 提交订单后进入 `PENDING_CS_REVIEW` / `PENDING_REVIEW`，响应保持医生端脱敏；9D.2 当时不实现草稿、真实上传、客服审核、生产审核或工序实例化。
- 已完成任务 9D.3 第一增量：新增 `POST /orders/{orderId}/review` 客服初审通过/驳回接口、`GET /orders?internal_status=PENDING_CS_REVIEW` 内部待审过滤、状态历史和医生通知事实；前端 `/orders/internal` 复用内部订单菜单新增「客服初审」最小页面。
- 9D.3 审核通过仅进入 `PENDING_PRODUCTION_REVIEW` / `PENDING_REVIEW`，不触发生产审核、不实例化工序；驳回进入 `CS_REJECTED` / `PENDING_REVIEW`，医生端仍只看外部投影。
- 已完成任务 9D.4 第一增量：生产审核接口新增状态门禁，仅允许 `PENDING_PRODUCTION_REVIEW` 订单进入生产审核；前端 `/workflow/review` 新增「生产审核」最小页面，可按待生产审核列表选择订单、选择工序链、填写入口路线/分支参数并触发工序实例化或驳回。
- 9D.4 审核通过进入 `PROCESS_INSTANCE_CREATED` / `PRODUCING` 并生成工序实例快照；本轮不实现生产任务池页面、派工页面、入检/出检/工时页面、复杂 Uppy 上传或真实 DeepSeek。
- 已完成任务 9D.5 第一增量：前端 `/workflow/process-instance` 新增工序实例详情、`/workflow/assign` 新增派工/转派、`/tasks/mine` 新增工人任务池；复用既有 `GET /orders/{orderId}/process-instance`、派工/转派和 `GET /tasks/mine` / 节点 start/complete 接口。
- 9D.5 只覆盖已实例化订单的工序查看、节点绑定员工和工人 READY/IN_PROGRESS/COMPLETED/PENDING 任务列表；本轮不实现入检/出检页面、工时暂停/继续/完成页面、返工处理页面或完整生产看板。
- 已完成任务 9D.6 第一增量：前端 `/checks` 新增入检/出检操作页，复用 worker 任务池选节点并调用 `/check-records`；前端 `/worklogs/self` 新增工时操作页，支持对本人进行中任务开始、暂停、继续和完成工时。
- 9D.6 只覆盖质检/工时页面级最小闭环；本轮不实现完整返工处理台、责任分类字典、绩效看板、生产通知联动或复杂生产看板。
- 已完成任务 9D.7 第一增量：前端 `/performance` 新增绩效统计页，复用既有 `GET /performance`，WORKER 留空查本人，ADMIN 可输入 `user_id` 查询指定员工。
- 9D.7 只展示后端当前返回的完成工序、有效工时、返工次数、准时率、通过率和工时效率；本轮不实现绩效明细、筛选周期、标准工时配置、申诉/补录或完整公式调整。
- 已完成任务 9D.8 第一增量：前端 `/production/board` 新增生产看板页，复用既有 `GET /orders` 跨内部状态检索订单，并读取 `GET /orders/{orderId}/process-instance` 展示节点进度快照。
- 9D.8 新增 `V9__production_board_menu_seed.sql` 为 ADMIN/CS 增加「生产看板」菜单；本轮不实现拖拽看板、实时推送、复杂筛选、节点编辑、终检或生产排产。
- 已完成任务 9D.9 第一增量：后端新增 `GET /reworks` 返工记录只读列表，WORKER 限定本人来源/目标节点，医生端禁止读取；前端 `/rework-final` 新增「返工终检」页面，可查看待返工记录并对已完成节点提交终检出检。
- 9D.9 新增 `V10__rework_final_menu_seed.sql` 为 ADMIN 和具备 `check:write` 的角色增加「返工终检」菜单；本轮不实现返工责任分类、返工关闭、终检报告、出货前拦截或真实 DeepSeek。
- 已完成任务 9D.10 第一增量：后端新增 MinIO Multipart 初始化、分片签名、complete 和 abort 接口，`file_resource` 记录 `upload_mode`、`multipart_upload_id`、分片大小和分片数；前端医生订单页新增最小 Uppy 文件选择、分片上传并回填 `file_id` 的入口。
- 已完成任务 9D.10 后续第一增量：后端新增 `GET /files/{fileId}/multipart/status`，返回已完成分片列表；前端医生上传入口新增本地恢复会话，重试时读取 status 并跳过已上传分片，同时保留手动取消未完成上传入口。
- 已完成任务 9D.10 后续第二增量：新增 Playwright 100MB+ 浏览器上传 smoke，`npm run smoke:task9d10-large-upload` 已通过，`file_id=457` 核验为 `COMPLETED / 110100480 bytes / MULTIPART / 21 parts`。
- 已完成任务 9D.10 后续第三增量：后端新增 `GET /files/multipart/pending?order_id=...`，按当前订单列出本人未完成 Multipart 候选且不暴露 `object_key`；前端医生上传入口在没有本地 `localStorage` 会话时，可按同订单、同文件名、同大小从服务端恢复 `file_id/upload_id` 后再读取 status。
- 已完成任务 9D.10 后续第四增量：新增 Playwright 上传中断后恢复 smoke，`npm run smoke:task9d10-interrupted-resume` 已通过，验证第 2 个分片人为中断后可保留本地 `doctor-order-upload:` 会话、读取服务端 `multipart/status`，并复用同一 `file_id=537` 继续完成上传。
- 已完成任务 9D.10 后续第四增量：新增 Playwright 服务端候选恢复 smoke，`npm run smoke:task9d10-server-resume` 已通过，确认无本地上传会话时浏览器复用预创建 pending Multipart；本轮记录 `file_id=514`、`order_id=1439`。
- 9D.10 仍只覆盖已选择/已创建订单的附件上传和绑定，不实现草稿上传、完整 Uppy Dashboard、真实弱网注入、完整跨设备浏览器验收或文件类型/数量最终限制。
- 已修复本地浏览器 smoke 阻塞：默认 CORS 同时允许 `http://localhost:5173` 与 `http://127.0.0.1:5173`，避免 Vite Local URL 登录时返回 `Invalid CORS request`；`BearerIdentityTests#databaseLoginAllowsLocalhostAndLoopbackViteOrigins` 已覆盖。
- 已修复 9D.2 动态表单浏览器读取缺口：`/form-configs` 已加入 Vite proxy，`npm run check:task9d2` 和 `acceptance.json` 已纳入代理检查。
- 本轮浏览器 smoke 已覆盖 doctor 在 `http://127.0.0.1:5173` 登录、进入「医生订单」、读取 REGULAR_CROWN 动态表单，并创建订单 `ORD20260630-9D94797093`，页面显示 `PENDING_REVIEW` 和医生端脱敏资料。
- 已确认 2026-07 新版资料默认对齐方案：不直接覆盖当前 OpenAPI/实现，保留 `/auth/me`、通知 REST、Multipart 断点恢复、返工接口、节点 start/complete/skip 等已验证增量；下一阶段优先补草稿/补资料闭环。
- 已完成任务 9D.11 第一增量：`POST /orders` 支持医生保存草稿，`PUT /orders/{orderId}` 支持医生本人编辑草稿、提交草稿和对 `CS_REJECTED / PRODUCTION_REJECTED` 订单补资料重新提交；前端医生订单工作台新增保存草稿、继续编辑/补资料和提交草稿/补资料入口。
- 9D.11 浏览器 smoke 已覆盖 doctor 在 `http://127.0.0.1:5173` 登录、保存草稿并提交草稿，测试订单 `ORD20260701-E172DF6DD8` 从 `DRAFT` 进入 `PENDING_REVIEW`。
- 已完成任务 9B.8 Refresh Token/logout 第一增量：新增 `auth_refresh_token` 哈希存储表；登录返回 `refreshToken` / `refreshExpiresAt`；`POST /api/auth/refresh` 可用有效 refresh token 换新 access token；`POST /api/auth/logout` 可吊销 refresh token；前端骨架新增「刷新 Token」和「退出登录」入口；浏览器 smoke 已覆盖 doctor 登录后刷新 Token 并退出回登录页。
- 已完成任务 9D.12 动态表单 CRUD 第一增量：新增 ADMIN `form:manage` 权限、`POST /form-configs`、`PUT /form-configs/{fieldId}`、逻辑停用 `status=INACTIVE`、后台「动态表单」菜单和前端最小新增/编辑/停用入口；医生端仍只读取 `ACTIVE` 字段。
- 9D.12 浏览器 smoke 已覆盖 admin 在 `http://127.0.0.1:5173` 登录、进入「动态表单」、创建字段、更新字段并停用字段，测试产品 `SMOKE_1782885092995` / 字段 `smoke_field_1782885092995` 最终从医生可读活动列表移除。
- 已完成任务 9D.13 设计稿多文件/多版本第一增量：新增 `design_draft_file` 关联表，保留 `design_draft.file_id` 作为兼容主文件；`POST /orders/{orderId}/design-drafts` 可把多个 `file_ids` 绑定到同一版本，响应新增 `file_ids` / `file_count`。
- 9D.13 前端第一增量已补：内部订单页可输入多个已完成 `file_id` 上传新版设计稿，医生订单工作台可显示同一版本多个文件 ID 和文件数；浏览器 smoke 已覆盖订单 `9D13-1782887063685`、文件 `761/762`，医生端可见且未泄露 `9D13_INTERNAL_NOTE_DO_NOT_LEAK`。
- 已完成任务 9D.14 终检发货拦截第一增量：`POST /orders/{orderId}/logistics` 发货前必须存在订单最后一道工序节点的 `OUT/PASS` 终检出检记录；缺失时返回 409，且不写物流、不更新 `SHIPPED`、不发送发货通知。
- 9D.14 前端第一增量已补：生产看板详情新增承运商、物流单号和「录入物流并发货」入口，后端 409 时展示“终检出检通过后才能发货”。
- 9D.14 浏览器 smoke 已覆盖 admin 在生产看板搜索订单 `9D14-1939db70751a`，录入物流 `SF-1782889291788` 后页面显示发货成功，数据库核验订单和物流均为 `SHIPPED`。
- 已完成任务 9D.15 真实 DeepSeek 接入第一增量：新增 `app.ai` 配置、`DeepSeekAiModelClient`、OpenAI-compatible `/chat/completions` 调用、AI-1/AI-2/AI-3 公开问答/AI-5 的真实模型适配，以及无 key/未启用时的 deterministic 安全回退。
- 9D.15 安全边界已补：AI-3 仍只使用 `DoctorOrderAssistantReadModel` 的外部状态、公开消息、账单和物流字段；医生询问内部工序/员工/工时等问题时继续本地 `SAFE_REFUSAL`，不向模型发送内部上下文。
- 9D.15 验收已补：`AiGatewayDeepSeekTests` 使用本地 stub 验证 DeepSeek 请求、Bearer key、模型名审计、completion tokens 和 AI-3 脱敏上下文；`npm run check:task9d15` 已纳入静态验收。
- 已完成任务 9D.16 终检报告第一增量：新增 `final_inspection_report` 表、`POST /final-inspection-reports` 和 `GET /final-inspection-reports/{orderId}`，生成报告前必须存在订单最后一道工序节点 `OUT/PASS` 终检出检记录。
- 9D.16 前端第一增量已补：在「返工终检」页面的终检入口增加报告摘要、生成终检报告按钮和报告结果展示；本地 Vite 已代理 `/final-inspection-reports`。
- 9D.16 验收已补：`CheckWorklogPerformanceTests#finalInspectionReportRequiresFinalOutPassAndIsInternalOnly` 先红后绿，覆盖缺终检通过 409、终检后生成报告、内部读取和医生端 403；`npm run check:task9d16` 已纳入静态验收。
- 已完成任务 9D.17 返工关闭 / 责任分类第一增量：新增 `V16__rework_close_metadata.sql`、`POST /reworks/{reworkId}/close` 和前端「关闭返工」最小入口；关闭前必须存在返工目标节点在来源失败检查之后重新 `OUT/PASS`。
- 9D.17 验收已补：`CheckWorklogPerformanceTests#reworkCanCloseOnlyAfterTargetOutPassAndKeepsResponsibilityClassification` 先红后绿，覆盖未重新出检通过 409、重新出检通过后关闭、写入原因分类/责任类型/关闭备注和 `DONE` 列表查询；`npm run check:task9d17` 已纳入静态验收。
- 已完成任务 9D.18 返工原因 / 责任类型字典第一增量：新增 `GET /reworks/dictionaries`，后端固定返回关闭返工可用 code，并在 `closeRework` 中拒绝未列入字典的原因分类或责任类型。
- 9D.18 前端第一增量已补：`/rework-final` 页面加载后端返工字典，关闭返工下拉选项不再硬编码在模板里；`npm run check:task9d18` 已纳入静态验收。
- 已完成任务 9D.19 返工通知联动第一增量：出检失败生成返工记录时写入 `REWORK_CREATED` 通知给目标 WORKER，返工关闭后写入 `REWORK_CLOSED` 通知给订单 CS。
- 9D.19 安全边界已补：返工通知只进入内部 `notification_event` / `user_notification`，测试覆盖医生用户不收到 `REWORK_CREATED` / `REWORK_CLOSED`。
- 已完成任务 9D.20 复杂返工影响范围第一增量：后道出检失败返到前道节点时，沿 `order_process_edge` 递归重置返工目标后续 `READY/COMPLETED` 节点为 `PENDING`，保留历史检查、工时和返工记录。

## 正在做什么

项目处于任务 8 上线准备阶段：接口契约、数据库基线、状态投影、文件权限、Workflow Runtime、入检/出检、返工、工时绩效、消息、设计稿、账单物流、通知事实表和最小 AI Gateway 已完成后端 smoke 基线；OpenAPI 二次契约硬缺口已关闭；当前结论仍是“后端最小链路可回归，产品级正式上线仍 NOT READY”。

Task 8 已完成 8A readiness audit、8B OpenAPI 二次契约、9A/9B/9C 身份权限与通知基线、9D.1 到 9D.25 的核心业务第一增量、9D.26 到 9D.48.2 的 AI 治理第一轮、9D.49 到 9D.54 的生产端质量/设备/物料异常/安环/成本/奖惩六类展示模块真实汇总接口第一轮适配、9D.55 返工字典后台维护第一增量、9D.56 终检专用角色 / 附件第一增量、9D.57 返工影响图形化第一增量、9D.58 客服协同闭环第一增量、9D.59 客服资料缺失提示与 AI 翻译草稿确认第一增量、9D.60 设计稿预览 URL 聚合第一增量和 9D.61 账单物流预览/录入闭环第一增量。任务 8 总体不标完成，后续仍需补完整 CRUD/审批/录入路径、演示种子数据、真实弱网限速/断网、完整跨设备续传、12 步主链路浏览器 smoke、绩效完整公式/周期、终检 PDF/签名/真实物流、通用 DataScope 覆盖、外部告警防重放/生产 webhook 联调、提示词后台管理、流式输出过滤、真实 key 联调、部署/操作手册等上线硬缺口。

当前已上传基线停在上述 9D.10 范围：同浏览器恢复、服务端 pending 候选恢复、上传中断后恢复和 100MB+ 浏览器 smoke 已作为可追溯结果保留；返工关闭/发货拦截、责任分类、跨设备恢复 smoke、限速上传 smoke 等后续尝试没有纳入当前上传基线。

本轮已完成 9D.36 三端/管理端前端视觉改造第一增量：依据客户旧版医生端、客服端、生产端 HTML 原型，把当前 Vue 单文件前端的登录后全页面统一为深色侧栏、顶部状态栏、角色主题色、页面说明区、业务卡片/列表/表单的工作台风格；2026-07-02 追加 product design 精修后，登录页更接近旧原型的深蓝窄卡片入口，侧栏增加中文分组菜单，主体常见后端状态码和产品类型已显示为中文。医生端、客服端、生产端、管理端四入口真实浏览器点击均已通过，错入口登录仍被服务端拒绝。本轮不新增后端接口、不调整权限、不搬运旧原型 mock/localStorage 逻辑；下一项开发入口建议继续做客户演示级业务细节、图表/空状态/录屏，或转回绩效周期筛选、返工影响图形化、生产级 AI 治理和部署交付材料。

本轮已完成 9D.37 AI 预算外部告警待发送事实第一增量：新增 Flyway `V19__ai_external_alert_outbox.sql` 和 `ai_external_alert_outbox` 表；预算跨线写入 `AI_BUDGET_EXCEEDED` 后、预算熔断命中写入 `AI_BUDGET_CIRCUIT_OPEN` 后，均生成 `send_status=PENDING` 的外部告警事实。payload 仅包含订单号、事件类型、预算阈值、近 24 小时估算成本和脱敏消息，不包含 prompt、模型响应、密钥或内部生产详情。本轮不接真实外部渠道、不写发送器、不新增环境变量。

本轮已完成 9D.38 AI 分角色预算第一增量：新增 Flyway `V20__ai_audit_actor_role.sql`，AI 审计开始记录 `actor_role`；新增 ADMIN / CS / DOCTOR / WORKER 四个角色日预算环境变量，默认 0 不启用；当 `AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 且对应角色近 24 小时成功调用估算成本达到角色阈值时，不外呼真实模型，返回 deterministic fallback，并写入 `AI_BUDGET_ROLE_CIRCUIT_OPEN` 治理审计和 `ai_external_alert_outbox` 待发送事实。本轮只做角色预算，不做分模型预算或管理 UI。

本轮已完成 9D.39 AI 分模型预算第一增量：新增 `AI_DEEPSEEK_DAILY_BUDGET_MICROUSD`，默认 0 不启用；当 `AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 且当前 `AI_DEEPSEEK_MODEL` 近 24 小时成功调用估算成本达到模型阈值时，不外呼真实模型，返回 deterministic fallback，并写入 `AI_BUDGET_MODEL_CIRCUIT_OPEN` 治理审计和 `ai_external_alert_outbox` 待发送事实。本轮只做 DeepSeek 当前配置模型的预算熔断，不做预算策略管理页面、成本趋势、真实外部发送器或真实 key 联调。

本轮已完成 9D.40 AI 提示词版本与输出防护第一增量：新增 `ai_audit_log.prompt_version` 和索引，AI-1/AI-2/AI-3/AI-4/AI-5 的审计均写入固定版本号；真实模型输出命中密钥、token、系统表、文件表或明确内部泄露模式时，不向调用方返回原文，改为“AI 输出已触发安全保护，请人工复核后再使用。”，并写入 `AI_OUTPUT_GUARDED` / `ai-governance-output-guard` 治理审计。本轮只做服务端固定版本和输出出口防护，不做提示词后台管理、流式输出过滤或真实外部告警发送器。

本轮已完成 9D.41 AI 外部告警发送器第一增量：新增 `AiExternalAlertSenderService#sendPendingAlerts`，按 `created_at, alert_id` 领取 `ai_external_alert_outbox` 的 `PENDING` 记录；`EXTERNAL_ALERT` 通道作为本地 dry-run 标记 `SENT` 并清空 `last_error`，未知通道标记 `FAILED` 并写入 `unsupported external alert channel` 错误，同时两类结果都会累计 `attempts`。本轮不接真实外部渠道、不新增密钥或环境变量、不做定时调度。

本轮已完成 9D.42 AI 成本趋势第一增量：新增 `GET /ai/governance/cost-trend?days=7`，复用 AI 治理权限，仅 CS / ADMIN 可访问；服务端按 `ai_audit_log.result_status=SUCCESS` 的成功模型调用聚合最近 1-31 天的 `success_count`、`estimated_cost_microusd` 和 `model_count`，并返回窗口总成功次数和总估算成本。本轮只做后端只读聚合和 OpenAPI 契约，不新增前端图表、不做导出、不接真实计费账单、不调整预算策略。

本轮已完成 9D.43 AI 真实外部渠道适配第一增量：新增 `app.ai.external-alert` 配置和 `AI_EXTERNAL_ALERT_WEBHOOK_*` 环境变量；`EXTERNAL_ALERT` 默认仍不外呼，显式启用 webhook 后才 POST outbox payload，发送成功标记 `SENT`。9D.45 后，非 2xx 或连接异常已改为有限重试/死信状态机。本轮只做通用 webhook 边界，不提交真实 webhook URL 或密钥，不接短信、邮件、企业微信 SDK，不做签名认证或生产联调。

本轮已完成 9D.44 AI 外部告警调度器第一增量：新增 `AiExternalAlertScheduler`、`@EnableScheduling` 和 `AI_EXTERNAL_ALERT_SCHEDULER_*` 配置。默认 `AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false`，即使调度方法被调用也不处理 outbox；显式启用后按 `AI_EXTERNAL_ALERT_SCHEDULER_BATCH_SIZE` 调用既有 sender 处理 `PENDING` outbox。本轮不做分布式锁、复杂重试、死信、签名认证、真实渠道密钥或生产 webhook 联调。

本轮已完成 9D.45 AI 外部告警重试/死信第一增量：新增 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS`，默认 3；webhook 失败时累计 `attempts` 并写 `last_error`，未达上限保持 `PENDING`，达到上限标记 `DEAD_LETTER`，避免调度器无限重复发送。本轮不做分布式锁、退避调度、死信管理页面、真实渠道密钥或生产 webhook 联调。

本轮已完成 9D.46 AI 外部告警幂等/并发领取第一增量：新增事务内 `SENDING` 领取态和 `claimAlert` 条件更新；sender 只有成功把 `PENDING` 领取为 `SENDING` 后才会 dry-run 或 webhook 外呼。并发测试覆盖第一条 webhook 被阻塞时第二个 sender 不会重复发送同一条 outbox。本轮不做签名/鉴权、退避调度、告警抑制、监控指标、真实渠道密钥或生产 webhook 联调。

本轮已完成 9D.47 AI 外部告警 webhook 签名/鉴权第一增量：新增 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED` 和 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET`；默认关闭签名，启用签名且 secret 非空时，sender 会按 request body 生成 `X-AI-Alert-Signature: sha256=<HMAC-SHA256>`。签名开启但 secret 为空时不会发送未签名 webhook，而是进入既有失败/重试/死信链路。本轮不提交真实 secret，不做 timestamp/nonce 防重放、接收端验签服务、生产 webhook 联调或真实外部渠道 SDK。

本轮已完成 9D.48 AI 外部告警监控/运维可观察第一增量：新增 `GET /ai/governance/external-alerts/summary`，复用 AI 治理权限，仅 CS / ADMIN 可访问；服务端按 `ai_external_alert_outbox.send_status` 聚合 `PENDING/SENDING/SENT/FAILED/DEAD_LETTER` 数量分布，返回最近一条 FAILED/DEAD_LETTER 错误和最老 PENDING 创建时间，并对错误摘要做基础脱敏。本轮不做真实 webhook 联调、短信/邮件/企业微信、人工重放、人工关闭、告警抑制或复杂运维后台。

本轮已完成 9D.48.1 AI 外部告警 outbox 列表/筛选第一增量：新增 `GET /ai/governance/external-alerts`，复用 AI 治理权限，仅 CS / ADMIN 可访问；支持 `send_status`、`event_type`、`created_at_from`、`created_at_to` 和 `limit` 最小筛选。响应只返回安全元数据，不返回 payload、last_error、真实 webhook URL、密钥、prompt 原文、模型原始响应或内部生产敏感详情。本轮不做人工重放、编辑、关闭或告警抑制。

本轮已完成 9D.48.2 AI 外部告警失败/死信可见性第一增量：`GET /ai/governance/external-alerts` 对 FAILED / DEAD_LETTER 记录返回 `attempts`、脱敏 `last_error` 和 `last_attempted_at`，用于 CS / ADMIN 安全排查失败/死信原因；脱敏覆盖真实 webhook URL、query token、Bearer token 和 `sk-*` 形式密钥。本轮不做重试按钮、死信恢复、人工处理状态、编辑、关闭、告警抑制或生产 webhook 联调。

本轮已完成 9D.54 生产端奖惩管理汇总后端适配第一增量：新增 Flyway `V26__production_reward_penalty_foundation.sql`、`production_reward_penalty_record` 事实表、`GET /production/reward-penalty/summary`、`ProductionRewardPenaltySummaryResponse`、OpenAPI 契约、前端“真实奖惩汇总”卡片区和 `npm run check:task9d54` 静态检查。生产/客服/管理可读，医生端访问返回 403；真实浏览器已覆盖生产端入口登录、点击左侧“奖惩管理”，页面显示奖惩记录、奖惩原因、关联对象、审批状态、月度汇总和绩效影响，且无汇总加载失败或 HTML 解析错误。本轮只做只读汇总，不新增奖惩录入、审批流、申诉、绩效结算或正式演示种子数据。

## 未完成事项

- 明确 Multipart 阈值、动态表单字段最终清单、AI-5 模板等客户/PM 仍需确认项；动态表单后台 CRUD 第一增量已完成，但字段最终清单和复杂表单设计器不在本轮范围。
- 后续补完整返工处理台、绩效完整公式/周期/申诉/标准工时配置、终检 PDF/签名/真实物流和完整生产看板；任务 5B 已完成后端最小执行接口和烟测，任务 9D.5 已补生产任务池和派工第一增量，任务 9D.6 已补入检/出检和工时操作页面第一增量，任务 9D.7 已补绩效管理页面第一增量，任务 9D.8 已补跨状态生产看板第一增量，任务 9D.9 已补返工记录只读和终检出检入口第一增量，任务 9D.14 已补发货前终检出检通过门禁第一增量，任务 9D.16 已补终检报告生成/读取第一增量，任务 9D.17 已补返工关闭/原因分类/责任类型第一增量，任务 9D.18 已补后端固定返工字典和关闭校验第一增量，任务 9D.19 已补返工创建/关闭内部通知第一增量，任务 9D.20 已补返工目标后续 `READY/COMPLETED` 节点重置第一增量，任务 9D.22 已补返工影响节点审计字段第一增量，任务 9D.23 已补返工影响筛选第一增量，任务 9D.25 已补绩效明细第一增量，任务 9D.56 已补终检专用权限和内部附件绑定第一增量，任务 9D.57 已补返工影响图形化第一增量。
- 后续把 WebSocket 通知接入生产级 Nginx/HTTPS、压测、监控和真实多实例联调；任务 6 已完成通知事实表和未读补偿的最小链路，任务 9C.1 已完成单实例 WebSocket 在线推送，任务 9C.2 已完成通知 REST 与前端入口，任务 9C.3 已完成前端实时刷新、Vite `/ws` 代理 smoke 和 Redis 广播代码路径第一增量。
- 后续接入正式 RuoYi-Vue-Pro 权限体系；当前已支持数据库账号登录、服务端签发 Bearer token、refresh token 哈希存储/刷新/logout 吊销、权限码/data_scope、基础菜单/部门/岗位表、前端按菜单权限显示入口、集中式后端权限守卫、Controller 权限注解拦截，以及订单、工序实例、文件、协同订单范围、AI 内部上下文的部分 SQL DataScope 过滤；`X-Bootstrap-*` 仍作为统一解析器中的本地烟测兼容路径存在，但生产 profile 已新增启动门禁，要求关闭该兼容路径并配置真实 token secret。
- 后续把 AI Gateway 的第一增量 DeepSeek 适配升级为生产级模型治理：9D.26 到 9D.48.2 已补每用户小时限流、单次成本审计、短暂失败重试、模型失败审计、治理摘要、预算阈值、预算跨线审计、内部通知第一增量、通知策略开关、预算熔断/降级第一增量、外部告警待发送事实第一增量、分角色预算第一增量、分模型预算第一增量、提示词版本审计、输出防护第一增量、外部告警发送器本地 dry-run 状态机、成本趋势第一增量、webhook 真实发送边界、默认关闭调度器、有限重试/死信、幂等/并发领取、webhook HMAC 签名、outbox 监控摘要、outbox 列表筛选和失败/死信只读可见性第一增量；仍缺接收端验签/防重放联调、提示词后台管理、流式输出过滤、生产 webhook 联调和真实 key 环境验收。AI-3 必须继续只读 `DoctorOrderAssistantReadModel`。
- 后续补 AI-1/AI-2/AI-5 更完整的模板和人工确认页面；当前只返回草稿或查询结果，不自动写业务字段。
- 后续补真实弱网限速/断网、完整跨设备续传、文件类型/数量最终限制和完整草稿上传体验；任务 9D.10 已完成 Multipart 第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器 smoke，任务 9D.11 已补医生订单草稿/补资料第一增量，但仍不是完整大文件上传上线验收。
- 后续把 Workflow Runtime 接入正式 RuoYi DataScope SQL 过滤、通知事件、前端任务池和生产看板。
- 后续把 Check/WorkLog/Performance 接入正式 RuoYi DataScope SQL 过滤、通知事件和更完整的绩效维度。
- 后续补完整客服协同页面、完整返工/终检闭环和正式生产看板等业务页面；任务 9D.1 已补医生订单读取工作台，任务 9D.2 已补医生下单第一增量，任务 9D.3 已补客服初审第一增量，任务 9D.4 已补生产审核第一增量，任务 9D.5 已补生产任务入口第一增量，任务 9D.6 已补质检工时第一增量，任务 9D.7 已补绩效管理第一增量，任务 9D.8 已补生产看板第一增量，任务 9D.9 已补返工终检第一增量，任务 9D.10 已补 Multipart 上传第一增量、本地恢复上传第一增量和服务端候选恢复第一增量，任务 9D.12 已补动态表单后台 CRUD 第一增量，任务 9D.13 已补设计稿多文件/多版本第一增量，任务 9D.14 已补生产看板最小发货入口和服务端终检门禁，但仍不是完整业务前端。
- 任务 9D.2/9D.10/9D.11 尚未覆盖真实弱网限速/断网、完整跨设备浏览器验收、实时自动保存和完整 Uppy Dashboard；100MB+ 本地浏览器 smoke、无本地会话服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke、医生草稿和补资料重新提交第一增量已补。
- 任务 9D.3 尚未覆盖 AI 翻译草稿写入生产指令、资料缺失提示页面和完整客服消息/账单物流页面；补资料再提交第一增量已由 9D.11 补齐。
- 任务 9D.7/9D.21/9D.25/9D.66/9D.74 已覆盖绩效汇总、责任归因、最近完成工时明细、周期筛选、标准工时覆盖率和开发默认公式第一增量，尚未覆盖标准工时配置、客户/PM 正式公式确认、绩效申诉/补录、导出、工资发放和生产通知联动；任务 9D.8 尚未覆盖拖拽/泳道生产看板、复杂筛选、实时刷新和排产；任务 9D.9/9D.14/9D.16/9D.56 已覆盖返工责任分类、返工关闭、终检报告、终检专用权限和内部附件绑定第一增量，但仍缺终检 PDF/签名、真实物流平台和生产通知联动。
- 后续清理 Task 8A 矩阵里的 `PARTIAL`、`BLOCKED`、`NOT_STARTED` 项，优先级建议为正式 RBAC/DataScope、WebSocket 通知、医生/客服/生产/管理端页面、终检报告/完整返工闭环和生产级 AI 治理。
- 后续把 `docs/acceptance/task-8-acceptance-matrix.md` 转成测试工程师可逐项执行的浏览器用例和缺陷追踪清单。

## 已知问题 / 阻塞

- 本机已安装 Homebrew `openjdk@21` 和 `maven`；同时 Homebrew 也安装了 `openjdk` 26 作为 Maven 依赖。项目命令通过 `scripts/with-jdk21.sh` 显式使用 JDK 21。
- 浏览器点击级验收已覆盖医生菜单权限、通知中心、9D.1 医生订单工作台、9D.2 医生动态表单/下单、9D.7 绩效统计、9D.8 生产看板、9D.11 医生草稿/补资料和 9D.12 动态表单 CRUD 第一增量；完整 12 步主链路浏览器验收仍未完成。
- Docker Compose 基础服务使用占位密码，仅用于本地开发；真实凭据不得提交。
- Flyway 启动时提示 MySQL 8.4 新于当前 Flyway 已测试版本，属于兼容性 warning；本轮迁移与测试已在本机 MySQL 8.4 通过。
- `standard_duration` 暂无客户真实标准工时，本轮迁移允许为空，不伪造工时。
- `.local-context/生产流程.docx` 中存在孤立重复箭头和贴面/隐形流程排版不连续；本轮已按源文档节点顺序标准化为顺序边，并保留分支字段表达。
- 当前医生端/内部端订单详情接口仍是最小验收实现；已覆盖订单列表、医生创建、客服初审、生产审核和生产任务入口第一增量，但尚未覆盖设计稿、账单物流完整业务页面。
- `GET /orders/{orderId}/process-instance` 已实现内部角色查询、医生端 403 和 WORKER SELF SQL DataScope；业务 Controller 不再直接解析 `X-Bootstrap-*`。
- `POST /check-records`、`POST /work-logs/*`、`GET /performance` 已实现后端最小链路；业务 Controller 不再直接解析 `X-Bootstrap-*`，但统一身份解析器仍保留本地 smoke 兼容。
- `POST /orders/{orderId}/messages`、`POST /messages/{msgId}/review`、`POST /orders/{orderId}/design-drafts`、`POST /orders/{orderId}/bill`、`POST /orders/{orderId}/logistics` 已实现后端最小链路；业务 Controller 不再直接解析 `X-Bootstrap-*`，协同类订单范围已加入查询级 DataScope 过滤，但仍未接入通用 RuoYi DataScope SQL 拦截器。
- Multipart 阈值、文件大小/类型/数量限制仍需 PM/客户最终确认；当前本地默认最大文件 200MB，预签名上传/预览 15 分钟，下载 2 小时。
- 任务 9C.1 已实现单实例 WebSocket 长连接推送，任务 9C.2 已实现通知列表、未读/已读 REST 接口和前端通知中心入口，任务 9C.3 已实现浏览器 WebSocket 实时接入、Vite `/ws` 代理 smoke 和 Redis 广播代码路径；仍未完成真实双后端实例 Redis 联调、生产 Nginx/HTTPS、心跳策略、监控和压测，正式在线通知仍为 `PARTIAL`。
- 任务 9D.1 已实现 `GET /orders` 列表和医生订单工作台第一增量；任务 9D.2 已实现医生读取动态表单、提交订单和绑定本人已完成文件的第一增量；任务 9D.3 已实现客服待审过滤、通过/驳回和前端客服初审入口第一增量；任务 9D.4 已实现生产待审过滤页面、工序链选择和生产审核触发工序实例化第一增量；任务 9D.5 已实现工序实例详情、派工/转派和工人任务池第一增量；任务 9D.6 已实现入检/出检和工时操作页面第一增量；任务 9D.7 已实现绩效统计页面第一增量；任务 9D.8 已实现生产看板跨状态检索和节点进度第一增量；任务 9D.9 已实现返工记录只读列表和终检出检入口第一增量；任务 9D.10 已实现 Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器 smoke；任务 9D.11 已实现医生草稿/补资料第一增量；任务 9D.12 已实现动态表单后台 CRUD 第一增量；任务 9D.13 已实现设计稿多文件/多版本第一增量；任务 9D.14 已实现发货前终检出检通过门禁第一增量；任务 9D.15 已实现真实 DeepSeek 接入第一增量；任务 9D.16 已实现终检报告第一增量；任务 9D.17 已实现返工关闭/原因分类/责任类型第一增量；任务 9D.18 已实现返工字典接口和关闭校验第一增量；任务 9D.19 已实现返工创建/关闭内部通知第一增量；任务 9D.20 已实现返工目标后续节点影响范围重置第一增量；任务 9D.21 已实现绩效归因联动第一增量；任务 9D.22 已实现返工影响审计可视化第一增量；任务 9D.23 已实现返工影响筛选第一增量；任务 9D.25 已实现绩效明细第一增量；任务 9D.56 已实现终检专用权限和内部附件绑定第一增量；任务 9D.57 已实现返工影响图形化第一增量；任务 9D.60 已实现医生端设计稿预览 URL 聚合第一增量；医生列表/详情/下单、上传、客服初审、生产审核、派工任务池、质检工时、绩效、绩效责任归因、绩效工时明细、返工影响审计字段、返工影响筛选、返工影响图、生产看板、返工终检入口、返工关闭、返工通知、返工影响范围重置、终检报告、终检附件、动态表单后台管理、设计稿多文件版本、设计稿预览链接、发货门禁、AI DeepSeek 适配、OpenAPI、前端构建和浏览器 smoke 部分已通过，但完整弱网/跨设备续传、完整客服协同、账单物流闭环、绩效完整公式/周期/申诉/标准工时配置、终检 PDF/签名、生产级 AI 治理和正式生产看板仍未完成。
- 任务 9D.15 已补 DeepSeek OpenAI-compatible 适配和 model_name/token 审计第一增量；9D.26 到 9D.48 已补限流、成本、重试、失败审计、治理摘要、预算阈值、预算跨线审计、内部通知第一增量、通知策略开关、预算熔断/降级、外部告警待发送事实第一增量、分角色预算第一增量、分模型预算第一增量、提示词版本审计、输出防护第一增量、外部告警发送器本地 dry-run 状态机、成本趋势第一增量、webhook 真实发送边界、默认关闭调度器、有限重试/死信、幂等/并发领取、webhook HMAC 签名和 outbox 监控摘要第一增量；仍未实现 outbox 列表/筛选、失败/死信详情可见性、流式输出、提示词后台管理、真实 key 联调记录和更完整的生产级输出策略。
- 本轮任务 7 的 AI-2 内部查询仍是最小订单摘要，尚未接入完整客服知识上下文、工序实例明细聚合或消息/文件预览 URL 聚合。
- 本轮任务 7 的 AI-5 生产备注模板仍未收到客户最终版，当前只生成通用草稿，不写入订单字段。
- Task 8A 已明确当前不能正式上线：仍缺完整 RuoYi RBAC/DataScope、完整前端业务页面、WebSocket 生产网关/真实多实例验收、生产级 AI 治理、完整弱网/跨设备续传、生产级部署配置和操作手册；9D.1/9D.2/9D.3/9D.4/9D.5/9D.6/9D.7/9D.8/9D.9/9D.10/9D.11/9D.12/9D.13/9D.14/9D.15/9D.16 只推进了医生端订单读取、医生下单、客服初审、生产审核、生产任务入口、质检工时、绩效管理、生产看板、返工终检、Multipart 上传、本地恢复上传、服务端候选恢复、上传中断后恢复、100MB+ 浏览器 smoke、医生草稿/补资料、动态表单 CRUD、设计稿多文件/多版本、终检发货拦截、DeepSeek 适配和终检报告第一增量。
- 任务 9A/9B.1/9B.2/9B.3/9B.4/9B.5/9B.6/9B.7/9B.8 第一增量已完成服务端 Bearer 身份基线、后端集中权限守卫、数据库化账号/角色/权限/DataScope 基础、基础菜单/部门/岗位、前端权限路由、权限注解统一拦截器、统一身份参数解析、部分查询级 DataScope 过滤、生产鉴权启动门禁和 refresh token/logout 第一增量；尚未接入完整 RuoYi 管理 UI、通用 SQL 拦截器、refresh token 轮换/accessToken 黑名单/多设备会话管理和生产级 Spring Security/JWT，正式环境必须关闭 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS` 并配置真实 `APP_AUTH_TOKEN_SECRET`。
- 本机数据库保留历史 smoke/测试追加数据，`GET /workflow-chains` 当前总数大于 9；Task 8A 已按“不清理数据库”的约束验收 9 条预定义链存在，正式验收应在干净测试库或固定快照库复跑。
- 动态表单字段最终清单、设计稿阻塞关系、AI-5 模板、标准工时和预计发货算法仍需 PM/客户确认。
- 进行中订单是否允许 ADMIN 调整节点仍需确认；默认不允许增删节点，只允许员工绑定/转派。
- `docs/api/openapi.yaml` 当前已通过自定义契约检查、Swagger validate 和 Redocly lint；9D.48 后已补 Multipart 上传、status 恢复、pending 恢复候选接口、refresh/logout 接口、`LoginRequest.portal` 登录入口枚举、动态表单 create/update/status schema、设计稿多文件、终检发货门禁、DeepSeek 适配、终检报告接口、返工关闭接口、返工字典接口、`REWORK_CREATED` / `REWORK_CLOSED` 通知事件说明、`AI_BUDGET_EXCEEDED` 预算通知、`AI_BUDGET_NOTIFICATION_ENABLED=false` 策略说明、`AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 熔断降级说明、`AI_BUDGET_CIRCUIT_OPEN` 治理审计说明、`ai_external_alert_outbox` 外部告警待发送事实和 `SENT/FAILED/DEAD_LETTER/SENDING`、`attempts`、`last_error` 发送器状态机说明、`AI_BUDGET_ROLE_CIRCUIT_OPEN` 和角色预算环境变量说明、`AI_BUDGET_MODEL_CIRCUIT_OPEN` 和 `AI_DEEPSEEK_DAILY_BUDGET_MICROUSD` 模型预算说明、`prompt_version` 与 `AI_OUTPUT_GUARDED` 输出防护说明、`/ai/governance/cost-trend` 成本趋势接口、`/ai/governance/external-alerts/summary` 监控摘要接口、`AI_EXTERNAL_ALERT_WEBHOOK_ENABLED` / `AI_EXTERNAL_ALERT_WEBHOOK_URL` webhook 发送说明、`AI_EXTERNAL_ALERT_SCHEDULER_ENABLED` 调度器说明、`AI_EXTERNAL_ALERT_MAX_ATTEMPTS` 重试/死信说明、AI 外部告警幂等/并发领取说明、`AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED` / `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET` 和 `X-AI-Alert-Signature` HMAC 签名说明、`PerformanceStats` 绩效责任归因字段、`ReworkRecordResponse` 返工影响审计字段、`/reworks` 的 `has_impacted_nodes` 筛选参数、`/performance/details` 绩效明细接口、9D.74 的 `performance_formula_version` / `standard_coverage_rate` / `performance_score` 绩效公式字段，以及 AI 治理摘要的 `daily_budget_microusd`、`budget_exceeded`、`budget_alert_count`、`latest_budget_alert_at` 字段；path / operation 数量以 `npm run check:openapi` 输出为准，后续新增接口时必须继续同步契约并保持检查通过。

## 重要文件

- `AGENTS.md`：Codex 接手规则。
- `AGENT.md`：RepoFrame 细则入口。
- `PROJECT.md`：产品目标、范围、边界和验收红线。
- `DECISIONS.md`：已确认决策。
- `tasks/README.md`：Yuri 风格任务拆解和下一步。
- `tasks/TASK-001-clarify-source-bundle-and-recover-missing-scope.md`：RepoFrame 初始澄清任务，已被 `tasks/README.md` 的 V1.1 计划取代。
- `tasks/TASK-002-project-skeleton-initialization.md`：任务 1 的详细执行任务，等待路线确认。
- `.repo-init/README.md` / `.repo-init/init-report.md`：初始化依据和证据。
- `docs/api/openapi.yaml`：已修复并完成任务 8B 二次冻结的当前后端基线 OpenAPI 契约。
- `scripts/check-openapi-contract.rb`：任务 8B 自定义 OpenAPI 契约检查，覆盖 operationId、标准错误响应和关键新增 path。
- `docs/source/README.md`：源文档路径和作用。
- `docs/development/task-1-preflight.md`：任务 1 前置预检与路线选择。
- `docs/development/task-1-execution-checklist.md`：任务 1 开工清单和验收边界。
- `docs/acceptance/task-8-acceptance-matrix.md`：任务 8A 专项验收矩阵和上线结论。
- `docs/acceptance/task-8-regression-record.md`：任务 8A 回归命令、HTTP/SQL smoke 和测试覆盖记录。
- `docs/deployment/readiness-checklist.md`：正式上线前 readiness 缺口清单。
- `backend/`：Spring Boot / Maven 多模块后端骨架。
- `backend/platform-server/src/main/resources/db/migration/`：Flyway 迁移，包含核心表和 9 条工艺链种子数据。
- `backend/platform-server/src/main/java/com/yuri/aiorder/workflow/definition/`：最小只读 Workflow API。
- `backend/platform-server/src/main/java/com/yuri/aiorder/order/status/`：任务 3 状态枚举、状态服务和投影服务。
- `backend/platform-server/src/main/java/com/yuri/aiorder/order/api/`：任务 3 医生端脱敏 VO、内部 DTO、AI-3 安全读模型和最小订单接口。
- `backend/platform-server/src/test/java/com/yuri/aiorder/order/OrderStatusProjectionTests.java`：任务 3 状态投影与脱敏边界测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/file/api/`：任务 4 MinIO 配置、文件服务、上传/签名接口和访问策略。
- `backend/platform-server/src/test/java/com/yuri/aiorder/file/FileAccessTests.java`：任务 4 文件上传、签名 URL、审计和医生端拒绝访问测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/workflow/runtime/`：任务 5A 工序实例化、节点状态机、任务池和运行时接口。
- `backend/platform-server/src/test/java/com/yuri/aiorder/workflow/runtime/WorkflowRuntimeTests.java`：任务 5A DAG 激活、并联汇合、可选节点跳过、任务池和医生端拒绝访问测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/`：任务 5B 入检/出检、返工、工时和绩效接口。
- `backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java`：任务 5B 入检门禁、出检时序、返工工时和绩效范围测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/`：任务 6 消息、设计稿、账单物流和通知事实接口。
- `backend/platform-server/src/test/java/com/yuri/aiorder/collaboration/MessageDesignBillNotificationTests.java`：任务 6 医生端脱敏、消息审核、设计稿确认、账单物流和通知事实测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/ai/`：任务 7 AI Gateway、工具白名单、上下文构造、输出防护和审计落库。
- `backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayTests.java`：任务 7 五个 AI 端点、AI-3 安全拒绝、资料缺失检查和审计测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/`：任务 9A Bearer token 签发、校验、filter 和身份上下文。
- `backend/platform-server/src/test/java/com/yuri/aiorder/auth/BearerIdentityTests.java`：任务 9A Bearer 身份、医生端脱敏、跨医生拒绝和禁用 bootstrap header 后 401 测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/AccessControlService.java`：任务 9B.1 后端集中权限与数据范围守卫。
- `backend/platform-server/src/main/resources/db/migration/V6__auth_rbac_datascope_foundation.sql`：任务 9B.2 数据库化账号、角色、权限和 data scope 基础。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/DatabaseAuthService.java`：任务 9B.2 数据库登录、角色权限聚合和身份构造。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/PasswordHashService.java`：任务 9B.2 PBKDF2-SHA256 密码 hash 校验。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/RequirePermission.java`：任务 9B.3 Controller 权限注解。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/PermissionInterceptor.java`：任务 9B.3 统一权限拦截器，优先使用数据库 Bearer 权限码，兼容本地角色 fallback。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/PermissionWebConfiguration.java`：任务 9B.3 MVC 拦截器注册。
- `backend/platform-server/src/test/java/com/yuri/aiorder/auth/PermissionInterceptorTests.java`：任务 9B.3 数据库账号权限码和角色边界回归测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/BootstrapIdentityArgumentResolver.java`：任务 9B.4 统一身份参数解析器。
- `backend/platform-server/src/main/java/com/yuri/aiorder/order/api/OrderProjectionQueryService.java`：任务 9B.4 订单读取 SQL DataScope 过滤。
- `backend/platform-server/src/main/java/com/yuri/aiorder/workflow/runtime/WorkflowRuntimeService.java`：任务 9B.4 工序实例读取 SQL DataScope 过滤。
- `backend/platform-server/src/main/java/com/yuri/aiorder/file/api/FileResourceService.java`：任务 9B.5 文件上传订单范围和文件读取 SQL DataScope 过滤。
- `backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/CollaborationService.java`：任务 9B.5 消息、设计稿、账单物流订单范围 SQL DataScope 过滤。
- `backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java`：任务 9B.5 AI 内部上下文读取 SQL DataScope 过滤。
- `backend/platform-server/src/main/resources/db/migration/V7__auth_menu_dept_post_foundation.sql`：任务 9B.6 菜单、部门、岗位和角色菜单基础迁移。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/AuthMenu.java`：任务 9B.6 登录态菜单 DTO。
- `frontend/src/App.vue`：任务 9B.6 前端按后端菜单权限渲染工作入口；任务 9D.1 医生订单工作台、9D.2 医生下单、9D.3 客服初审、9D.4 生产审核、9D.5 生产任务入口第一增量。
- `scripts/check-task-9d1-frontend.mjs`：任务 9D.1 前端工作台与 Vite 代理关键文本检查。
- `scripts/check-task-9d2-frontend.mjs`：任务 9D.2 医生下单与动态表单关键文本检查。
- `scripts/check-task-9d3-frontend.mjs`：任务 9D.3 客服初审关键文本检查。
- `scripts/check-task-9d4-frontend.mjs`：任务 9D.4 生产审核关键文本检查。
- `scripts/check-task-9d5-frontend.mjs`：任务 9D.5 工序实例、派工转派和我的任务关键文本检查。
- `scripts/check-task-9d6-frontend.mjs`：任务 9D.6 入检出检和工时操作关键文本检查。
- `scripts/check-task-9d7-frontend.mjs`：任务 9D.7 绩效统计关键文本检查。
- `scripts/check-task-9d8-frontend.mjs`：任务 9D.8 生产看板关键文本检查。
- `backend/platform-server/src/main/resources/db/migration/V9__production_board_menu_seed.sql`：任务 9D.8 生产看板菜单种子迁移。
- `scripts/check-task-9d9-frontend.mjs`：任务 9D.9 返工终检关键文本检查。
- `backend/platform-server/src/main/resources/db/migration/V10__rework_final_menu_seed.sql`：任务 9D.9 返工终检菜单种子迁移。
- `scripts/check-task-9d10-frontend.mjs`：任务 9D.10 Multipart 上传关键文本检查。
- `backend/platform-server/src/main/resources/db/migration/V11__file_multipart_upload_metadata.sql`：任务 9D.10 文件 Multipart 元数据迁移。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/AuthStartupValidator.java`：任务 9B.7 生产鉴权启动门禁。
- `backend/platform-server/src/main/resources/application-prod.yml`：任务 9B.7 生产 profile 鉴权配置。
- `backend/platform-server/src/test/java/com/yuri/aiorder/auth/AuthStartupValidatorTests.java`：任务 9B.7 生产门禁回归测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/RefreshTokenService.java`：任务 9B.8 refresh token 哈希存储、刷新和 logout 吊销服务。
- `backend/platform-server/src/main/resources/db/migration/V12__auth_refresh_token.sql`：任务 9B.8 refresh token 持久化表迁移。
- `scripts/check-auth-refresh.mjs`：任务 9B.8 Refresh Token/logout 关键文本检查。
- `backend/platform-server/src/main/java/com/yuri/aiorder/notification/`：任务 9C.1 WebSocket 通知配置、鉴权拦截器、连接处理器和在线推送服务。
- `backend/platform-server/src/test/java/com/yuri/aiorder/notification/NotificationWebSocketTests.java`：任务 9C.1 WebSocket 在线推送回归测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/notification/NotificationController.java`：任务 9C.2 通知列表、未读数、单条已读和全部已读 REST 接口。
- `backend/platform-server/src/main/java/com/yuri/aiorder/notification/NotificationService.java`：任务 9C.2 当前用户通知隔离、已读状态更新和公开 payload 查询。
- `backend/platform-server/src/test/java/com/yuri/aiorder/notification/NotificationRestTests.java`：任务 9C.2 通知未读/已读和当前用户隔离回归测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/notification/NotificationRedisBroadcaster.java`：任务 9C.3 Redis 通知广播发布器，按开关启用。
- `backend/platform-server/src/main/java/com/yuri/aiorder/notification/NotificationRedisBroadcastListener.java`：任务 9C.3 Redis 广播监听器，忽略本实例消息并触发本机投递。
- `backend/platform-server/src/test/java/com/yuri/aiorder/notification/NotificationBroadcastTests.java`：任务 9C.3 Redis 广播和远端本机投递回归测试。
- `backend/platform-server/src/test/java/com/yuri/aiorder/workflow/runtime/WorkflowRuntimeTests.java`：任务 9B.1 覆盖 WORKER Bearer token 不能派工/跳过节点。
- `backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java`：任务 9B.1 覆盖医生不能读检查记录、CS 不能查绩效、WORKER 只能看本人绩效。
- `frontend/`：Vue3 + Element Plus 前端骨架。
- `compose.yaml`：MySQL、Redis、MinIO 本地基础服务。
- `.env.example`：本地环境变量模板。

## 下一步

下一轮唯一推荐目标：补部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段。9D.80 已补 AI 真实 key / 生产 webhook 联调记录模板第一段；真实 key、真实 webhook、真实生产服务器和客户/PM 确认仍属于上线缺口，待真实环境具备后按模板填写。Task 8 总体仍保持 `NOT_READY`。

## 9D.77 文件上传弱网 / 跨设备验收第一段

本轮已完成 9D.77 文件上传弱网 / 跨设备验收第一段：新增 `scripts/smoke-task-9d77-file-upload-resilience.spec.mjs`、`npm run check:task9d77` 和 `npm run smoke:task9d77-file-upload-resilience`，用两个 Playwright browser context 模拟设备 A 弱网中断、设备 B 无本地 localStorage 后通过服务端 pending Multipart 候选恢复同一 `file_id`。本轮不接真实生产对象存储，不代表真实弱网物理网络、真实跨设备实机、客户 Multipart 限制签字或测试/正式 bucket 实际隔离已完成。Task 8 仍保持 NOT_READY。

## 9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段

本轮已完成 9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段：新增 `docs/acceptance/task-9d78-bucket-isolation-readiness.md`、`scripts/check-task-9d78-bucket-isolation-readiness.mjs` 和 `npm run check:task9d78`。检查覆盖本地 bucket 与生产占位 bucket 不同、生产 bucket 仍为占位示例、一期 compose 要求外部注入 `MINIO_BUCKET`，以及 readiness / acceptance 文档已回写。本轮不接真实生产对象存储，不提交真实 MinIO 密钥、真实 bucket 名称或生产 URL。真实测试/正式对象存储账号隔离、真实网络访问和客户 / PM 书面确认仍未完成。Task 8 仍保持 NOT_READY。

## 9D.79 真实环境文件上传人工验收记录模板第一段

本轮已完成 9D.79 真实环境文件上传人工验收记录模板第一段：新增 `docs/acceptance/task-9d79-real-env-file-upload-manual-acceptance.md`、`scripts/check-task-9d79-real-env-file-upload-acceptance.mjs` 和 `npm run check:task9d79`。模板覆盖真实环境基本信息、测试 / 正式 bucket、对象存储账号隔离、文件大小 / 类型 / 数量限制、100MB+ 上传、弱网中断、跨设备恢复、越权读取、bucket 写入位置和客户 / PM 签字状态。本轮只提供模板，所有真实环境字段均为 `待填写` 或 `待确认`，不填写真实密钥，不代表真实环境已验收。Task 8 仍保持 NOT_READY。

## 9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段

本轮已完成 9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段：新增 `docs/acceptance/task-9d80-ai-production-integration-acceptance.md`、`scripts/check-task-9d80-ai-production-integration-acceptance.mjs` 和 `npm run check:task9d80`。模板覆盖 DeepSeek key 外部注入、AI-3 脱敏与拒答、AI-5 文本整理、预算 / 熔断 / 输出防护、生产 webhook、发送侧签名、接收端验签 / 防重放和客户 / PM 签字状态。本轮只提供模板，所有真实环境字段均为 `待填写` 或 `待确认`，不填写真实密钥，不填写真实 webhook URL，不代表真实 key 或生产 webhook 已联调完成。Task 8 仍保持 NOT_READY。
