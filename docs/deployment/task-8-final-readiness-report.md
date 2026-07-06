# Task 8 Final Readiness Report

状态：NOT_READY。

生成时间：2026-07-05。

资料来源：

- `docs/deployment/readiness-checklist.md`
- `docs/acceptance/task-8-acceptance-matrix.md`
- `docs/acceptance/prd-v2-gap-matrix.md`

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

9D.82 最新 PRD V2.0 差异对齐矩阵第一段已新增 `docs/acceptance/prd-v2-gap-matrix.md` 和 `npm run check:task9d82`，把最新版 PRD 正文 `V2.0 / 2026-07-04` 拆成一期已覆盖、部分覆盖、缺失、BLOCKED 和二期项。该记录把患者管理基础版、人工支付流水 / 收支记录、客户 / 诊所档案与偏好、人员档案 / 工作量看板、质量记录 CRUD / 外返登记、客服订单 / 沟通完整可见性 smoke、医生账户设置基础闭环、设备 / 物料 / 安环 / 成本 / 奖惩完整闭环和 LangChain + DeepSeek AI 底座对齐列为后续本地可关闭缺口。

9D.83 患者管理基础版第一增量已新增 `patient_record`、`orders.patient_id`、`patient:manage-doctor`、`/patients`、`/patients/{patientId}/orders` 和医生端 `/doctor/patients` 最小入口。该记录覆盖基础患者档案、订单绑定、本人数据隔离和患者历史订单第一段，不代表真实客户数据导入、高级标签、批量检索或 AI 历史方案推荐完成。

9D.84 人工支付流水 / 收支记录第一增量已新增 `order_payment_record`、`/orders/{orderId}/payments`、客服端人工收款记录入口和医生端只读流水展示。该记录不代表真实支付网关、退款、对账、发票、财务审批或月结自动归集完成。

9D.85 客户 / 诊所档案与偏好第一增量已新增 `/clinics`、`/clinics/{clinicId}`、`/clinics/{clinicId}/preference`、客服端 `/customers`、管理端 `/admin/clinics` 和医生端 `/doctor/account/clinic`。该记录覆盖诊所档案与 6 个一期客户偏好字段第一段，不代表客户开户审批、定价体系、真实客户数据导入、复杂 CRM 或客户 / PM 字段最终确认完成。

9D.86 人员档案 / 工作量看板第一增量已新增 `/staff/workload`、生产端 `/production/staff` 和管理端 `/admin/staff`。该记录覆盖员工档案、部门岗位、角色摘要和工作量统计第一段，不代表完整 HR、人员 CRUD、岗位能力矩阵、排班、薪酬或绩效申诉完成。

9D.87 质量记录 CRUD / 外返登记第一增量已新增 `/quality-records`、`/quality-records/external-returns` 和生产端 `/production/quality` 外返质量记录入口。该记录复用 `check_record` + `rework_record` 完成外返登记和列表第一段，不代表独立质量记录事实表、完整状态工作流、编辑/删除、投诉/退货系统或客户最终质量口径确认完成。

9D.88 客服订单 / 沟通完整可见性 smoke 已扩展 `MessageResponse`，新增 `order_no`、`product_type`、`external_status`，客服待审核队列和订单消息上下文可识别订单上下文；目标测试覆盖生产端消息待审核、客服驳回、医生隐藏和生产端驳回通知。该记录不代表消息附件 URL 聚合、AI 自动审核、复杂客服工单或真实外部通知完成。

9D.89 医生账户设置基础闭环已新增 V33 账户设置字段、`/doctor/account/settings`、`/doctor/account/password` 和医生端账户设置页。该记录覆盖医生本人联系方式、收货地址、消息推送开关和当前密码修改登录密码第一增量，不代表短信 / 邮箱真实验证、多地址簿、二次认证、登录记录审计或客户最终字段确认完成。

9D.90 产品参数 / 价格体系一期最小后台已新增 V34 `product_catalog`、`product:manage`、`/products`、`/products/{productId}` 和产品管理页基础价维护入口。该记录覆盖 CS / ADMIN 人工维护产品类型、材料规格和基础价第一增量，不代表自动报价、客户分层价格、价格审批、价格历史生效规则、账单重算、真实财务结算或客户 / PM 价格字段最终确认完成。

9D.91 客服配送管理页 / 物流异常跟进第一增量已新增 `/logistics/orders`、`/orders/{orderId}/logistics/exception` 和客服端 `/delivery` 配送管理页。该记录复用 `order_logistics.logistics_status` 与 `order_message` 内部消息，覆盖 CS / ADMIN 人工查看配送列表、筛选物流状态和记录内部异常跟进第一增量，不代表真实物流 API、电子面单、自动轨迹同步、签收回调、物流平台 webhook 或客户 / PM 物流口径确认完成。

9D.92 AI-2 客服查询助手完整入口第一增量已新增客服端 `/ai/cs` 查询助手入口，复用既有 `/ai/cs-query` 后端能力。该记录覆盖 CS / ADMIN 输入订单 ID 和问题生成内部只读草稿第一增量，不代表真实 key 环境、完整客服知识上下文、消息附件聚合、引用数据说明或客户 / PM AI-2 口径确认完成。

9D.93.1 PRD V2 范围纠偏第一闭环已更新 `npm run check:task9d93`，移除医生端独立 `/doctor/files` / `doctor-files` 入口的结论保持不变；用户已确认设备 / 物料 / 安环 / 成本 / 奖惩属于一期开发功能，不能再按二期储备或历史展示处理。用户也已确认所有 AI 智能体使用 LangChain + DeepSeek。

9D.94 LangChain + DeepSeek AI 底座对齐第一增量已新增 `npm run check:task9d94`、LangChain4j 依赖、`AI_PROVIDER=langchain-deepseek`、`AI_LANGCHAIN_ENABLED=false` 默认关闭配置和 `LangChainDeepSeekAiModelClient`。目标后端测试覆盖 AI-1 / AI-2 / AI-3 公开查询 / AI-5 在显式启用 LangChain + DeepSeek 时经 LangChain4j 调用 DeepSeek，AI-3 内部问题仍本地 `SAFE_REFUSAL` 且不外呼。该记录不代表真实 key、生产 webhook、流式输出、RAG、复杂 agent tool calling 或客户 / PM AI 验收已完成。

9D.95 设备 / 物料 / 安环 / 成本 / 奖惩一期闭环拆解第一增量已新增 `docs/acceptance/phase-one-production-support-closure-plan.md`、`scripts/check-task-9d95-production-support-closure-plan.mjs` 和 `npm run check:task9d95`。该记录把 9D.50-9D.54 只读汇总拆成五个后续闭环，不代表五类模块已 READY。

9D.95.1 设备台账 / 设备事件录入第一增量已新增设备台账 / 设备事件人工登记接口、生产端“登记设备 / 登记事件”最小入口和 `npm run check:task9d951`。该记录不代表设备管理全部 READY，不接 IoT、真实设备联网或保养审批流。

9D.95.2 物料异常登记 / 处理状态第一增量已新增物料异常人工登记接口、处理状态更新接口、生产端“登记物料异常 / 更新处理状态”最小入口和 `npm run check:task9d952`。该记录不代表物料异常管理全部 READY，不接库存扣减、采购补料、供应商协同或 WMS。

9D.95.3 安环巡检 / 隐患整改第一增量已新增安环事件人工登记接口、整改状态更新接口、生产端“登记安环事件 / 更新整改状态”最小入口和 `npm run check:task9d953`。该记录不代表安环管理全部 READY，不接真实环境采集硬件、PPE 发放系统或完整安环审批流。

9D.95.4 成本记录维护 / 趋势口径第一增量已新增成本记录人工登记接口、生产端“登记成本记录”最小入口和 `npm run check:task9d954`。该记录不代表成本管理全部 READY，不接真实财务系统、发票、付款、对账或自动成本分摊。

9D.95.5 奖惩记录 / 审批状态第一增量已新增奖惩记录人工登记接口、审批状态更新接口、生产端“登记奖惩记录 / 更新审批状态”最小入口和 `npm run check:task9d955`。该记录不代表奖惩管理全部 READY，不作为工资发放结果，不做绩效申诉闭环、薪酬结算或复杂审批引擎。

9D.96 医生提交前 AI-4 资料缺失自动触发体验第一增量已新增医生端提交前自动检查：先保存草稿，再调用既有 `/ai/check-missing`，缺失时展示“AI-4 资料缺失检查”和缺失清单并阻断正式提交。该记录不代表 AI-4 全部 READY，不新增后端接口，不做 AI 自动驳回订单，不接真实 DeepSeek key。

## 上线前缺口清单

| 缺口名称 | 当前证据 | 未完成原因 | 需要补的最小闭环 | 推荐验证命令或验收方式 |
| --- | --- | --- | --- | --- |
| 正式鉴权与 DataScope 收口 | readiness checklist 中“正式鉴权与数据范围”为 PARTIAL；已具备数据库账号、权限码、data_scope、Bearer token、refresh/logout、Controller 权限注解、部分 SQL DataScope、prod 关闭 bootstrap header 门禁和 9D.75 权限码优先模式。 | 9D.75 已关闭生产角色兜底第一段，但尚未完整接入 RuoYi-Vue-Pro 管理 UI、生产级 Spring Security/JWT、通用 DataScope SQL、refresh token 轮换、access token 黑名单和多设备会话策略。 | 后续补生产级 Spring Security/JWT 或通用 SQL DataScope 第一段；本轮下一优先级转向 WebSocket / 通知生产验收。 | `npm run check:task9d75`；`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=StrictPermissionModeTests,AuthStartupValidatorTests,BearerIdentityTests,PermissionInterceptorTests test`；生产 profile 启动门禁 smoke；医生/客服/生产/管理四角色越权矩阵。 |
| 前端业务页面完整度 | readiness checklist 中“前端业务页面”为 PARTIAL；已具备四入口登录、医生下单、客服初审、客服协同台消息审核、客服资料缺失提示、AI 翻译草稿确认、设计稿预览 URL 聚合、客服端设计稿审核预览增强第一段、账单物流预览/录入、人工付款状态、生产审核、工序实例、质检工时、绩效、绩效周期筛选第一段、绩效标准工时与完整公式口径第一段、生产看板、返工、返工影响图形化、终检报告、终检专用角色 / 附件第一增量、终检 PDF/签名第一段、9D.62 12 步主链路浏览器 smoke 第一增量、9D.62.1 固定演示数据前 3 步、9D.62.2 首个派工节点工序操作数据动作、9D.62.3 设计稿确认数据动作、9D.62.4 账单/物流第一段数据动作、9D.62.5 终检后发货/确认收货第一段数据动作、9D.63 返工异常路径数据动作和 9D.67 文件上传限制与 bucket 隔离第一段。 | 9D.74 已让绩效接口和前端展示默认公式版本、标准工时覆盖率和默认绩效分；仍缺实时自动保存、真实支付系统、真实物流平台、真实电子签章/复杂报告模板、客户/PM 对 CP-004 的正式确认、绩效申诉/导出/工资发放等完整页面闭环。 | 下一段补正式鉴权与 DataScope 收口第一段。 | `npm run check:task9d74`；`npm run build:frontend`；后端目标测试；客户按 12 步主链路点击验收。 |
| WebSocket / 通知生产验收 | readiness checklist 和 acceptance matrix 中 WebSocket / 通知仍为 PARTIAL；已完成单实例 WebSocket、通知 REST、前端通知中心、Redis 广播代码路径、AI 外部告警 outbox 监控/列表/失败可见性、9D.71 接收端验签 / 防重放本地验收桩，以及 9D.76 Nginx 通知 REST / WebSocket 生产网关 readiness 第一段。 | 缺真实双后端实例 Redis 联调、心跳/重连压测、Nginx HTTPS 生产网关验收、生产 webhook 联调和完整业务页面联动。 | 后续在具备真实环境后补双实例 Redis WebSocket 联调记录、Nginx HTTPS smoke 或生产 webhook 联调记录。 | `npm run check:task9d76`；`NotificationWebSocketTests`；`NotificationRestTests`；`NotificationBroadcastTests`；双实例本地 compose 验收记录；Nginx HTTPS smoke。 |
| 文件上传真实上线边界 | readiness checklist 中“文件上传”为 PARTIAL；105MB Multipart、本地恢复、服务端候选恢复和中断恢复浏览器 smoke 已通过；9D.67 文件上传限制与 bucket 隔离第一段已补 `FILE_MAX_FILE_SIZE_BYTES`、`FILE_ALLOWED_CONTENT_TYPES`、`FILE_MAX_FILES_PER_ORDER` 和测试/正式 `MINIO_BUCKET` 配置边界；9D.77 已补本地弱网 / 跨设备恢复第一段；9D.78 已补测试 / 正式对象存储 bucket 隔离验收记录第一段；9D.79 已补真实环境文件上传人工验收记录模板第一段。 | 仍缺真实弱网物理网络、真实跨设备实机、真实测试 bucket、真实正式 bucket、对象存储账号隔离、真实对象存储联调、客户最终 Multipart 限制签字和客户 / PM 书面确认。 | 真实测试环境具备后，按 9D.79 模板填写人工验收记录并由客户 / PM 确认；本地下一优先级转向 AI 真实 key / 生产 webhook 联调记录模板第一段。 | `npm run check:task9d67`；`npm run check:task9d77`；`npm run check:task9d78`；`npm run check:task9d79`；`npm run smoke:task9d10-large-upload`、`npm run smoke:task9d10-server-resume`、`npm run smoke:task9d10-interrupted-resume`、`npm run smoke:task9d77-file-upload-resilience`。 |
| AI 生产治理剩余项 | readiness checklist 中“AI 接入”为 PARTIAL；已完成 DeepSeek 默认关闭、LangChain4j + DeepSeek 底座第一增量、限流、成本审计、重试、失败审计、治理摘要、预算阈值、熔断、分角色/分模型预算、提示词版本、输出防护、外部告警发送/调度/重试/死信/幂等/签名/监控/列表/失败可见性、9D.71 接收端验签 / 防重放本地验收桩和 9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段。 | 仍缺真实 key 环境联调、生产 webhook 联调、提示词后台管理、流式输出过滤、RAG / tool calling 如需、生产级成本看板、更完整输出策略和客户 / PM 书面确认。 | 真实 AI 验收环境具备后，按 9D.80 模板填写真实 key / 生产 webhook 联调记录并由客户 / PM 确认；本地下一优先级转向 9D.95.3 安环巡检 / 隐患整改第一增量。 | `npm run check:task9d71`；`npm run check:task9d80`；`npm run check:task9d94`；`npm run check:openapi`；AI gateway tests、DeepSeek tests；启用环境变量的本地 dry-run/联调记录；确认无真实 key 入库。 |
| 订单主链路完整端到端 | acceptance matrix 中医生下单、客服审核、生产审核、设计稿、账单物流、确认收货多项仍为 PARTIAL；9D.62 已补 12 步入口 smoke，9D.62.1 已补固定演示数据前 3 步，9D.62.2 已补首个派工节点入检/开工/工时/完工/出检通过，9D.62.3 已补设计稿上传、客服审核、医生预览和确认数据动作，9D.62.4 已补账单文件上传、医生预览和终检前发货门禁数据动作，9D.62.5 已补剩余工序完成、物流发货和医生确认收货数据动作，9D.63 已补出检失败、返工记录、目标节点重做和返工关闭数据动作，9D.64 已补客服端设计稿预览链接，9D.65 已补终检 PDF file_id 和签名占位，9D.66 已补绩效周期筛选，9D.67 已补文件上传限制，9D.73 已补人工付款状态第一段，9D.74 已补绩效公式默认口径第一段。 | 已有大量后端和页面第一增量，但缺实时自动保存、真实物流平台、真实支付系统、真实电子签章/复杂报告模板和客户验收版完整 12 步端到端记录。 | 下一段补正式鉴权与 DataScope 收口第一段。 | `npm run smoke:task9d62`；`npm run build:frontend`；`platform-server test`；客户按矩阵逐项签字。 |
| 返工 / 绩效 / 终检业务完整度 | acceptance matrix 中返工流程、绩效统计、终检发货仍为 PARTIAL；9D.55 已补返工字典后台维护第一增量，9D.56 已补终检专用角色 / 附件第一增量，9D.57 已补返工影响图形化第一增量，9D.65 已补终检 PDF/签名第一段，9D.66 已补绩效周期筛选第一段，9D.74 已补绩效标准工时与完整公式口径第一段。 | 已有返工关闭、责任分类、字典后台维护、影响范围、影响图、绩效归因、绩效明细、绩效周期、标准工时覆盖率、开发默认绩效分、终检报告、内部附件绑定、内部 PDF 绑定和签名占位第一增量，但缺标准工时配置、客户/PM 公式确认、绩效申诉/导出/工资发放、真实电子签章/复杂报告模板和真实物流平台。 | 后续从正式鉴权与 DataScope 收口继续补，不一次扩展到真实电子签章或真实物流。 | `CheckWorklogPerformanceTests`；`npm run check:task9d74`；前端 smoke；OpenAPI 检查；客户验收公式/字段。 |
| 部署基础设施 | readiness checklist 中“部署基础设施”为 PARTIAL；9D.69 已补后端/前端 Dockerfile、full-stack compose 示例、生产 env 占位示例和 Docker/env 隔离文档，`npm run compose:phase-one:config` 已通过；9D.81 已补部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段。 | 仍缺真实服务器部署、HTTPS、镜像仓库、测试/正式环境真实联调、数据库备份恢复演练、日志留存、监控告警、发布回滚和客户 / PM 书面确认。 | 真实部署环境具备后，按 9D.81 模板填写部署 smoke / HTTPS / 备份监控验收记录并由客户 / PM 确认；本地下一优先级转向客户培训签收 / 交付确认记录模板第一段。 | `npm run check:task9d69`；`npm run compose:phase-one:config`；`npm run check:deployment-env`；`npm run check:task9d81`；后续真实环境 smoke。 |
| 操作手册 | readiness checklist 中“操作手册”为 PARTIAL；9D.70 已补四端最小操作手册、首版故障处理清单和交付材料索引，9D.72 已把培训签收纳入 CP-008。 | 仍缺正式客户培训签收、真实生产部署手册、备份恢复演练、日志留存、监控告警和发布回滚手册。 | 后续按 CP-008 补客户培训签收记录，或在真实环境具备后补生产部署/回滚/值班手册。 | `npm run check:task9d70`；按手册完成一次本地演示；客户/PM 确认。 |
| 客户 / PM 确认项 | 9D.72 已新增 `docs/acceptance/phase-one-customer-pm-confirmations.md`，把付款状态、动态表单、AI-5 模板、标准工时、Multipart、签章、物流、培训签收和真实环境边界列为可追踪项。 | 这些仍是产品/业务口径问题，当前只有默认方案和负责人占位，不能由开发直接关闭。 | PM 指定每项负责人和目标日期，客户 / PM 逐项书面确认或修改默认方案。 | `npm run check:task9d72`；客户/PM 签字或书面确认；同步更新 `PROJECT.md`、`DECISIONS.md`、OpenAPI 和验收矩阵。 |
| PRD V2.0 本地功能差异 | 9D.82 已新增 `docs/acceptance/prd-v2-gap-matrix.md`，9D.83 已补患者管理基础版，9D.84 已补人工支付流水，9D.85 已补客户 / 诊所档案与偏好，9D.86 已补人员档案 / 工作量看板，9D.87 已补质量记录 CRUD / 外返登记第一增量，9D.88 已补客服订单 / 沟通完整可见性 smoke，9D.89 已补医生账户设置基础闭环，9D.90 已补产品参数 / 价格体系一期最小后台，9D.91 已补客服配送管理页 / 物流异常跟进第一增量，9D.92 已补 AI-2 客服查询助手完整入口第一增量，9D.93.1 已补 PRD V2 范围纠偏第一闭环，9D.94 已补 LangChain + DeepSeek AI 底座对齐第一增量，9D.95 已补设备 / 物料 / 安环 / 成本 / 奖惩一期闭环拆解第一增量，9D.95.1 已补设备台账 / 设备事件录入第一增量，9D.95.2 已补物料异常登记 / 处理状态第一增量，9D.95.3 已补安环巡检 / 隐患整改第一增量，9D.95.4 已补成本记录维护 / 趋势口径第一增量，9D.95.5 已补奖惩记录 / 审批状态第一增量，9D.96 已补医生提交前 AI-4 资料缺失自动触发体验第一增量，9D.97 已补 AI-2 客服查询引用数据说明 / 知识上下文补强第一增量，9D.98 已补 AI-5 生产备注客户模板 / 知识上下文补强第一增量，`/ai/production-note/confirm` 支持人工确认后写入生产备注。 | 医生文件模块已移除为独立入口，但质量记录仍缺完整独立模型和状态工作流，生产支撑模块仍缺编辑 / 历史 / 完整审批或处理状态 / 趋势闭环，真实 AI key、生产联调、客户 / PM 生产备注模板最终确认和客户签字仍未完成。 | 下一步按矩阵补真实客户 / PM 确认项与真实环境 AI 验收收口。 | `npm run check:task9d98`；后续每个功能闭环目标测试、OpenAPI、前端 build、acceptance。 |

## 当前结论

Task 8 仍为 `in-progress / NOT_READY`。当前代码和文档已经具备多条最小链路的自动化证据，但正式上线仍卡在生产级鉴权、完整业务前端、真实环境联调、文件/AI/通知生产验收、部署安全和操作交付材料。

下一轮唯一推荐目标：真实客户 / PM 确认项与真实环境 AI 验收收口。9D.98 已补 AI-5 生产备注客户模板 / 知识上下文补强第一增量，但客户正式模板、真实 DeepSeek key、生产 webhook / 真实环境联调和客户签字仍不能由本地代码替代。Task 8 仍保持 `NOT_READY`。

## 9D.77 文件上传弱网 / 跨设备验收第一段

9D.77 已新增 `scripts/smoke-task-9d77-file-upload-resilience.spec.mjs`、`npm run check:task9d77` 和 `npm run smoke:task9d77-file-upload-resilience`。当前证据覆盖设备 A 弱网延迟 + 断网中断、服务端 Multipart pending 状态、设备 B 无本地 localStorage 后通过服务端候选恢复并完成同一 `file_id`。本轮仍不关闭真实弱网物理网络、真实跨设备实机、客户 Multipart 限制签字和测试/正式 bucket 实际隔离缺口。Task 8 仍保持 `NOT_READY`。

## 9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段

9D.78 已新增 `docs/acceptance/task-9d78-bucket-isolation-readiness.md`、`scripts/check-task-9d78-bucket-isolation-readiness.mjs` 和 `npm run check:task9d78`。当前证据覆盖本地 `.env.example` bucket 与一期生产 env 示例 bucket 不同、生产 bucket 仍为占位示例、一期 compose 要求外部注入 `MINIO_BUCKET`，并把该边界写入 acceptance / readiness 文档。本轮不接真实生产对象存储，不提交真实 MinIO 密钥、真实 bucket 名称或生产 URL。真实测试 / 正式 bucket 创建、对象存储账号隔离、真实网络访问和客户 / PM 确认仍未关闭。Task 8 仍保持 `NOT_READY`。

## 9D.79 真实环境文件上传人工验收记录模板第一段

9D.79 已新增 `docs/acceptance/task-9d79-real-env-file-upload-manual-acceptance.md`、`scripts/check-task-9d79-real-env-file-upload-acceptance.mjs` 和 `npm run check:task9d79`。模板覆盖真实测试环境 / 正式环境基本信息、测试 bucket、正式 bucket、对象存储账号隔离、文件大小 / 类型 / 数量限制、100MB+ 上传、弱网中断、跨设备恢复、越权读取、bucket 写入位置和客户/PM 签字状态。本轮只提供记录模板，所有真实环境字段均为 `待填写` 或 `待确认`，不填写真实密钥，不代表真实环境已验收，不代表生产对象存储已联调完成。Task 8 仍保持 `NOT_READY`。

## 9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段

9D.80 已新增 `docs/acceptance/task-9d80-ai-production-integration-acceptance.md`、`scripts/check-task-9d80-ai-production-integration-acceptance.mjs` 和 `npm run check:task9d80`。模板覆盖 DeepSeek key 外部注入、`AI_PROVIDER=deepseek`、`AI_DEEPSEEK_ENABLED=true`、`DEEPSEEK_API_KEY`、AI-3 脱敏与拒答、AI-5 文本整理、预算 / 熔断 / 输出防护、生产 webhook、发送侧签名、接收端验签 / 防重放和客户/PM 签字状态。本轮只提供记录模板，所有真实环境字段均为 `待填写` 或 `待确认`，不填写真实密钥，不填写真实 webhook URL，不代表真实 key 已联调完成，不代表生产 webhook 已联调完成。Task 8 仍保持 `NOT_READY`。

## 9D.81 部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段

9D.81 已新增 `docs/deployment/task-9d81-production-deployment-acceptance.md`、`scripts/check-task-9d81-deployment-production-acceptance.mjs` 和 `npm run check:task9d81`。模板覆盖 Docker Compose、Nginx、HTTPS、镜像仓库、生产环境变量、数据库备份、备份恢复演练、日志留存、监控告警、发布回滚和客户/PM 签字状态。本轮只提供记录模板，所有真实环境字段均为 `待填写` 或 `待确认`，真实密钥必须外部注入，不填写真实密钥，不填写真实服务器地址，不代表真实服务器已部署完成，不代表 HTTPS 已验收完成。Task 8 仍保持 `NOT_READY`。

## 9D.91 客服配送管理页 / 物流异常跟进第一增量

9D.91 已新增 `scripts/check-task-9d91-logistics-exception.mjs`、`npm run check:task9d91`、`/logistics/orders`、`/orders/{orderId}/logistics/exception` 和客服端 `/delivery` 配送管理页。当前证据覆盖 CS / ADMIN 人工查看配送列表、筛选异常单、记录内部异常跟进、医生端不返回内部跟进说明和医生禁止写入。本轮不新增迁移，不接真实物流 API、电子面单、自动轨迹同步、签收回调、物流平台 webhook 或真实物流密钥；物流外显口径和真实环境验收仍需客户 / PM 确认。Task 8 仍保持 `NOT_READY`。

## 9D.92 AI-2 客服查询助手完整入口第一增量

9D.92 已新增 `scripts/check-task-9d92-cs-ai-query-entry.mjs`、`npm run check:task9d92` 和客服端 `/ai/cs` 查询助手入口。当前证据覆盖 CS / ADMIN 输入订单 ID 和问题、调用 `/ai/cs-query`、展示内部只读草稿和人工确认提示。本轮不新增后端接口、不新增迁移、不接真实 key、不自动外发、不自动写订单；后续 9D.97 已补引用数据说明第一段，完整客服知识上下文、消息附件聚合和客户 / PM 确认仍未关闭。Task 8 仍保持 `NOT_READY`。

## 9D.93.1 PRD V2 范围纠偏第一闭环

9D.93.1 已更新 `scripts/check-task-9d93-prd-v2-scope-rework.mjs` 和 `npm run check:task9d93`。当前证据覆盖医生端独立 `/doctor/files` / `doctor-files` 入口移除、医生文件模块不开发、设备 / 物料 / 安环 / 成本 / 奖惩属于一期开发功能，以及所有 AI 智能体使用 LangChain + DeepSeek 实现。本轮不新增后端接口、不新增迁移、不实现 LangChain 服务、不新增依赖。Task 8 仍保持 `NOT_READY`。

## 9D.94 LangChain + DeepSeek AI 底座对齐第一增量

9D.94 已新增 `scripts/check-task-9d94-langchain-deepseek-foundation.mjs`、`npm run check:task9d94`、LangChain4j 依赖、`AI_PROVIDER=langchain-deepseek`、`AI_LANGCHAIN_ENABLED=false` 默认关闭配置和 `LangChainDeepSeekAiModelClient`。当前证据覆盖 AI-1 / AI-2 / AI-3 公开查询 / AI-5 在显式启用 LangChain + DeepSeek 时经 LangChain4j 调用 DeepSeek，AI-3 内部问题仍本地 `SAFE_REFUSAL` 且不外呼。本轮不提交真实 key，不做生产真实联调，不补流式输出、RAG、复杂 agent tool calling、提示词后台、AI-2 知识上下文补强或 AI-4 提交前自动触发体验。Task 8 仍保持 `NOT_READY`。

## 9D.95 设备 / 物料 / 安环 / 成本 / 奖惩一期闭环拆解第一增量

9D.95 已新增 `docs/acceptance/phase-one-production-support-closure-plan.md`、`scripts/check-task-9d95-production-support-closure-plan.mjs` 和 `npm run check:task9d95`。当前证据把 9D.50-9D.54 只读汇总拆成 9D.95.1 设备台账 / 设备事件录入、9D.95.2 物料异常登记 / 处理状态、9D.95.3 安环巡检 / 隐患整改、9D.95.4 成本记录维护 / 趋势口径、9D.95.5 奖惩记录 / 审批状态。本轮不新增业务接口、不新增数据库迁移、不做 CRUD，不接 IoT、真实财务系统、工资发放或复杂审批平台。Task 8 仍保持 `NOT_READY`。

## 9D.95.1 设备台账 / 设备事件录入第一增量

9D.95.1 已新增 `ProductionEquipmentManagementTests`、设备台账 / 设备事件请求响应 DTO、两个 POST 接口、OpenAPI 契约、生产端“登记设备 / 登记事件”最小入口、`scripts/check-task-9d951-production-equipment-management.mjs` 和 `npm run check:task9d951`。本轮复用 V22 表，不新增迁移，不接 IoT，不做保养审批流、复杂设备履历或真实设备联网。Task 8 仍保持 `NOT_READY`。

## 9D.95.2 物料异常登记 / 处理状态第一增量

9D.95.2 已新增 `ProductionMaterialExceptionManagementTests`、物料异常请求 / 状态更新 / 响应 DTO、POST 登记接口、PUT 状态更新接口、OpenAPI 契约、生产端“登记物料异常 / 更新处理状态”最小入口、`scripts/check-task-9d952-production-material-exception-management.mjs` 和 `npm run check:task9d952`。本轮复用 V23 表，不新增迁移，不接库存扣减、采购补料、供应商协同或 WMS。Task 8 仍保持 `NOT_READY`。

## 9D.95.3 安环巡检 / 隐患整改第一增量

9D.95.3 已新增 `ProductionSafetyEnvironmentManagementTests`、安环事件请求 / 状态更新 / 响应 DTO、POST 登记接口、PUT 状态更新接口、OpenAPI 契约、生产端“登记安环事件 / 更新整改状态”最小入口、`scripts/check-task-9d953-production-safety-environment-management.mjs` 和 `npm run check:task9d953`。本轮复用 V24 表，不新增迁移，不接真实环境采集硬件、PPE 发放系统或完整安环审批流。Task 8 仍保持 `NOT_READY`。

## 9D.95.4 成本记录维护 / 趋势口径第一增量

9D.95.4 已新增 `ProductionCostRecordRequest`、`ProductionCostRecordResponse`、成本记录 POST 登记接口、OpenAPI 契约、生产端“登记成本记录”最小入口、`scripts/check-task-9d954-production-cost-management.mjs` 和 `npm run check:task9d954`。本轮复用 V25 表，不新增迁移，不接真实财务系统、发票、付款、对账或自动成本分摊。Task 8 仍保持 `NOT_READY`。

## 9D.95.5 奖惩记录 / 审批状态第一增量

9D.95.5 已新增 `ProductionRewardPenaltyRecordRequest`、`ProductionRewardPenaltyStatusRequest`、`ProductionRewardPenaltyRecordResponse`、奖惩记录 POST 登记接口、审批状态 PUT 更新接口、OpenAPI 契约、生产端“登记奖惩记录 / 更新审批状态”最小入口、`scripts/check-task-9d955-production-reward-penalty-management.mjs` 和 `npm run check:task9d955`。本轮复用 V26 表，不新增迁移，不作为工资发放结果，不做绩效申诉闭环、薪酬结算或复杂审批引擎。Task 8 仍保持 `NOT_READY`。

## 9D.96 医生提交前 AI-4 资料缺失自动触发体验第一增量

9D.96 已新增医生端提交前自动触发 AI-4：提交订单或补资料时先保存草稿，再调用 `/ai/check-missing`；缺失时展示“AI-4 资料缺失检查”和缺失清单，并阻断正式提交。新增 `scripts/check-task-9d96-doctor-ai4-pre-submit-missing.mjs` 和 `npm run check:task9d96`。本轮不新增后端接口，不做 AI 自动驳回订单，不接真实 DeepSeek key 或新外部服务。Task 8 仍保持 `NOT_READY`。
