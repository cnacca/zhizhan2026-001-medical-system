# Latest PRD V2.0 Gap Matrix

状态：baseline-aligned / NOT_READY。

更新日期：2026-07-07。

RepoFrame 当前入口：`goals/GOAL-020-deployment-ops-local-hardening-20260707.md` / `tasks/TASK-021-deployment-ops-local-hardening-20260707.md` 已完成部署 / 运维本地补强，并新增 `npm run check:deployment-ops-local-hardening` 与 `npm run dry-run:phase-one-release-rollback`。本阶段只补本地 release / rollback dry-run、备份 / 恢复 dry-run 模板第一段、日志留存 / 监控告警配置模板第一段、compose / env / Nginx / healthcheck 静态检查和 readiness 联动；`deployment-infrastructure` 与 `operations-manuals` 仍为 `PARTIAL`，不代表真实服务器、HTTPS、备份恢复、日志留存、监控告警、发布回滚演练、正式客户培训签收、客户签字或真实环境验收完成，Task 8 仍保持 `NOT_READY`。

RepoFrame 当前入口：`goals/GOAL-019-ai-production-governance-local-hardening-20260707.md` / `tasks/TASK-020-ai-production-governance-local-hardening-20260707.md` 已完成 AI 生产治理本地补强，并新增 `npm run check:ai-production-governance-local-hardening`。本阶段只补 `local-hardening` 本地只读治理总览、提示词版本、输出安全边界、预算 / 熔断、AI-3 安全矩阵、AI-5 默认模板边界和真实外部集成待验状态；`ai-production-governance` 仍为 `PARTIAL`，不代表真实 DeepSeek key、生产 webhook、客户 AI-5 正式模板、客户签字或真实环境验收完成，Task 8 仍保持 `NOT_READY`。

RepoFrame 当前入口：`goals/GOAL-018-local-main-chain-acceptance-hardening-20260707.md` / `tasks/TASK-019-local-main-chain-acceptance-hardening-20260707.md` 正在执行本地 12 步主链路验收增强，并新增 `npm run check:local-main-chain-acceptance-hardening`。本阶段只增强订单主链路本地固定演示数据 smoke 与客户可读记录：医生端脱敏、客服端可见性、生产端任务范围、管理端派工 / 转派断言；订单主链路、`frontend-business-pages` 和 `prd-v2-local-feature-gaps` 仍为 `PARTIAL`，不代表客户签字、真实支付、真实物流、真实签章、真实 key、真实 webhook 或真实环境验收完成，Task 8 仍保持 `NOT_READY`。

RepoFrame 当前入口：`goals/GOAL-017-frontend-productization-closure-20260707.md` / `tasks/TASK-018-frontend-productization-closure-20260707.md` 正在执行四端前端产品化体验收口，并新增 `npm run check:frontend-productization-closure`。本阶段只关闭本地可开发的前端体验第一段：客服设计稿 / 账单入口复用已有本地链路，生产 C 类入口升级为本地第一增量汇总 / 表单，管理端补账号 / 角色 / 权限库存入口；`frontend-business-pages` 仍为 `PARTIAL`，不恢复医生文件独立模块，不扩大 C 类为完整闭环，不代表真实支付、真实物流、真实签章、真实 key、真实 webhook、客户签字或真实环境验收完成，Task 8 仍保持 `NOT_READY`。

RepoFrame 当前入口：`goals/GOAL-016-auth-datascope-production-closure-b-20260707.md` / `tasks/TASK-017-auth-datascope-production-closure-b-20260707.md` 已完成权限 / DataScope 生产化补强 B，并新增 `npm run check:auth-datascope-prod-closure-b`。本阶段只关闭 refresh token 轮换本地补强：`/api/auth/refresh` 返回新 access token 和轮换后的 refresh token，旧 refresh token 立即吊销并拒绝复用；完整 Spring Security/JWT、完整 RuoYi DataScope、通用 SQL DataScope、access token 黑名单、多设备会话策略、客户签字和真实环境验收仍未完成，Task 8 仍保持 `NOT_READY`。

RepoFrame 当前入口：`goals/GOAL-015-operations-rollback-training-closure-20260707.md` / `tasks/TASK-016-operations-rollback-training-closure-20260707.md` 已完成操作手册 / 回滚 / 培训材料本地收口，并新增 `npm run check:operations-rollback-training-closure`。本阶段只聚合 9D.70 操作手册证据、发布回滚手册本地模板、四端培训材料 / 签收模板和 `operations-manuals` readiness 指针；真实发布回滚演练、备份恢复演练、日志留存、监控告警、正式客户培训签收、客户签字和真实环境验收仍未完成，Task 8 仍保持 `NOT_READY`。

RepoFrame 当前入口：`goals/GOAL-014-websocket-notification-readiness-closure-20260707.md` / `tasks/TASK-015-websocket-notification-readiness-closure-20260707.md` 已完成 WebSocket / 通知生产 readiness 收口，并新增 `npm run check:websocket-notification-readiness-closure`。本阶段只聚合 9D.76 通知网关本地证据、真实环境验收记录模板和 `websocket-notification-prod` readiness 指针；真实双实例 Redis、Nginx HTTPS、生产 webhook、监控告警、客户签字和真实环境验收仍未完成，Task 8 仍保持 `NOT_READY`。

RepoFrame 当前入口：`goals/GOAL-013-frontend-customer-smoke-closure-20260707.md` / `tasks/TASK-014-frontend-customer-smoke-closure-20260707.md` 已完成四端业务页面与客户验收 smoke 收口，并新增 `npm run check:frontend-customer-smoke-closure`。本阶段只聚合四端页面和客户 smoke 证据；`frontend-business-pages` 继续保持 `PARTIAL`，客户签字、真实支付 / 物流平台、真实 DeepSeek key、真实 webhook 和真实环境验收仍未完成，Task 8 仍保持 `NOT_READY`。

RepoFrame 当前入口：`goals/GOAL-012-auth-datascope-production-closure-20260707.md` / `tasks/TASK-013-auth-datascope-production-closure-20260707.md` 已完成权限 / DataScope 生产化收口第一段，并新增 `npm run check:auth-datascope-prod-closure`。`goals/GOAL-011-real-acceptance-confirmation-20260707.md` / `tasks/TASK-012-real-acceptance-confirmation-20260707.md` 已完成客户 / PM 确认项与真实环境 AI 验收收口，并新增 `npm run check:real-acceptance-confirmation`。`goals/GOAL-010-prd-v2-local-gap-closure-d-20260707.md` / `tasks/TASK-011-prd-v2-local-gap-closure-d-20260707.md` 已完成 PRD V2 本地功能差异收口 D。`goals/GOAL-009-prd-v2-local-gap-closure-c-20260707.md` / `tasks/TASK-010-prd-v2-local-gap-closure-c-20260707.md` 已完成 PRD V2 本地功能差异收口 C。`goals/GOAL-008-prd-v2-local-gap-closure-b-20260707.md` / `tasks/TASK-009-prd-v2-local-gap-closure-b-20260707.md` 已完成 PRD V2 本地功能差异收口 B。`goals/GOAL-007-prd-v2-local-gap-closure-a-20260707.md` / `tasks/TASK-008-prd-v2-local-gap-closure-a-20260707.md` 已完成 PRD V2 本地功能差异收口 A。`goals/GOAL-004-phase-one-ab-data-closure-20260707.md` / `tasks/TASK-005-phase-one-ab-data-closure-20260707.md` 已完成 A/B 类数据收口。本矩阵仍是 PRD V2 本地差异和 Task 8 缺口来源，不代表 Task 8 可上线。

## 来源与版本

- 最新输入文件：`AI下单平台_PRD_V1.0.docx`。
- 文档正文标题：`家红隐形正畸 AI 智能下单一体化管理平台`。
- 文档正文版本：`V2.0 | 更新日期：2026-07-04`。
- 版本风险：文件名仍含 `PRD_V1.0`，正文末尾存在 `V1.1` 字样；项目后续统一以正文 `PRD V2.0 / 2026-07-04` 作为最新一期 PRD 基线，直到 PM 或客户给出新的书面版本。
- 2026-07-06 内部确认基准：见 `docs/acceptance/phase-one-scope-baseline-20260706.md`。该基准覆盖此前把 C 类设备、物料、安环、成本、奖惩继续扩成一期完整管理闭环的旧口径。

本矩阵只做最新版 PRD 对齐与差异拆解，不新增业务功能，不替代客户 / PM 书面确认，不把 Task 8 标完成。

一期收口执行顺序以 `docs/development/phase-one-closure-technical-plan.md` 为准：先做状态基线校准，再优先推进真实客户 / PM 确认项与真实环境 AI 验收收口，随后处理 PRD V2 本地功能差异和生产支持模块 PARTIAL 收口。

## 判定规则

| 状态 | 含义 |
| --- | --- |
| ALIGNED | 当前代码或文档已覆盖 PRD 一期要求，并有自动化或 smoke 证据。 |
| PARTIAL | 已有第一增量或局部实现，但仍缺完整页面、接口、数据模型、验收或客户确认。 |
| MISSING | PRD 一期要求明确存在，当前项目尚未形成可验收闭环。 |
| BLOCKED | 需要客户 / PM、真实环境、真实密钥、真实外部服务或书面确认，开发侧不能自行关闭。 |
| PHASE_TWO | 最新 PRD 明确标为二期 / 远期，不应作为一期 READY 阻塞项。 |

## 一期范围对齐

| PRD 模块 | 最新 PRD 要求 | 当前状态 | 当前证据 | 需要修改 / 下一步 |
| --- | --- | --- | --- | --- |
| 四端独立登录 | 医生端、客服端、生产端、管理端四个独立入口；不设统一单一登录页；医生 / 诊所不可自注册。 | PARTIAL | 四入口登录页和角色端口校验已完成第一增量；`APP_AUTH_ALLOW_ROLE_FALLBACK=false` 生产严格模式已完成第一段；权限 / DataScope 生产化收口第一段已关闭主代码 roles-only 权限注解并补 V36 权限码种子；权限 / DataScope 生产化补强 B 已补 refresh token 轮换。 | 继续保留四入口；后续补完整 RuoYi-Vue-Pro / JWT / RBAC / DataScope 管理 UI、access token 黑名单和多设备会话策略。 |
| 医生端看板 | 展示订单统计、待确认方案、补资料、账单、物流等待办。 | PARTIAL | 医生订单工作台、通知中心、账单物流、设计稿待确认已有第一增量。 | 需要按 PRD 八大模块重排医生端验收，不再只用 12 步 smoke 表述。 |
| 医生在线下单 | 产品类型、动态表单、文件上传、草稿、AI 缺失检查。 | PARTIAL | 动态表单 CRUD、医生提交订单、草稿 / 补资料、Multipart、文件限制已落地。 | 动态表单最终字段、客户偏好自动填充、提交前 AI 缺失检查体验仍需收敛；字段清单仍需客户确认。 |
| 医生患者管理 | 一期基础患者档案、绑定历史病例、患者列表检索。 | PARTIAL | 9D.83 已新增 `patient_record`、`orders.patient_id`、`patient:manage-doctor`、`/patients`、`/patients/{patientId}/orders` 和医生端 `/doctor/patients`，覆盖患者档案、订单绑定、本人数据隔离和列表检索第一增量。 | 仍缺真实客户数据导入、患者高级标签、批量检索、AI 历史方案推荐和客户 / PM 对患者字段口径确认；下一步转向人工支付流水 / 收支记录第一增量。 |
| 医生文件模块 | 最新 PRD 明确“医生文件”模块不属于项目需求范围，不开发；订单相关文件只归入医生订单 / 病例附件链路。 | ALIGNED | 9D.93 已移除医生端独立 `/doctor/files` / `doctor-files` 入口，并把 9D.36 smoke 改为点击患者管理、订单助手、通知中心。 | 医生文件模块不属于项目需求范围，不开发；后续不得恢复独立文件中心或网盘式入口，除非客户 / PM 书面变更范围。 |
| 医生支付管理 | 一期基础账单查看、支付流水；真实支付网关、电子发票、月结自动归集为二期。 | PARTIAL | 账单文件、账单预览、人工付款状态已有第一段；9D.84 已补 `order_payment_record` 和医生端只读人工收款流水。 | 仍缺真实客户支付口径确认；真实微信 / 支付宝 / Stripe、电子发票和月结自动归集保持二期。 |
| 医生账户设置 | 修改密码、绑定邮箱电话、收货地址、消息推送开关。 | PARTIAL | 9D.89 已新增 `/doctor/account/settings`、`/doctor/account/password`、V33 账户设置字段和医生端账户设置页，覆盖联系方式、收货地址、消息推送开关和当前密码修改登录密码第一增量。 | 仍缺短信 / 邮箱真实验证、多地址簿、二次认证、登录记录审计和客户 / PM 最终字段确认。 |
| 医生线上沟通 | 医生 -> 客服直达；生产端消息须客服审核后医生可见；消息绑定订单 / 病例。 | PARTIAL | 消息审核、客服协同台、通知中心、医生公开消息已有第一段；9D.88 已补待审核队列订单上下文、驳回后医生不可见和生产端驳回通知目标测试。 | 仍缺消息附件 URL 聚合、病例上下文最终字段、完整浏览器 smoke 和客户 / PM 沟通口径确认。 |
| 医生通知中心 | 系统节点通知、未读红点、历史通知归档。 | PARTIAL | 通知 REST、未读 / 已读、WebSocket、Redis 广播代码路径已有第一段。 | 仍缺真实双实例 Redis、心跳 / 重连、Nginx HTTPS 网关和完整业务页面联动验收。 |
| 医生 AI | 独立 AI 订单助手，只读本人外部状态与物流；不得暴露内部信息。 | PARTIAL | AI-3 安全读模型、DeepSeek 默认关闭第一增量、越权拒答已覆盖；9D.94 已补 LangChain + DeepSeek 底座第一增量。 | 仍需真实 key 环境、客户 / PM AI 验收、流式输出过滤和更完整生产级输出策略；医生内部问题继续本地安全拒答。 |
| 客服订单管理 | 全量订单查看、初审、AI 翻译、资料缺失、驳回补资料。 | PARTIAL | 客服初审、AI 翻译草稿、资料缺失提示已有第一增量；9D.88 已补客服待审核消息的订单号、产品类型和外部状态上下文。 | 仍需补按 PRD 字段筛选、订单详情入口和客服页面完整浏览器 smoke。 |
| 客服沟通中心 | 三方沟通中转、待审核消息队列、AI 客服查询。 | PARTIAL | 客服协同台第一增量可审核消息并看订单上下文；9D.88 已补生产端消息待审核、客服驳回、医生隐藏和生产端驳回通知 smoke；9D.92 已补客服端 `/ai/cs` AI-2 查询助手入口；PRD V2 本地功能差异收口 C 已补 AI-2 `attachment_contexts` 附件预览上下文和客服端展示。 | 仍需补完整客服知识上下文聚合、真实浏览器可见范围矩阵、真实 key 验收和客户 / PM 确认。 |
| 客服客户管理 | 客户档案、客户偏好、客户开户、定价权限。 | PARTIAL | 9D.85 已复用 `clinic` / `customer_preference`，新增 `/clinics`、`/clinics/{clinicId}/preference` 和客服端 / 管理端 / 医生端最小入口，覆盖诊所档案与 6 个一期偏好字段第一增量。 | 仍缺客户开户审批、定价体系、价格权限、真实客户数据导入、复杂 CRM 和客户 / PM 对偏好字段最终确认；下一步转客服订单 / 沟通完整可见性 smoke。 |
| 客服产品管理 | 产品参数、材料规格、价格体系维护。 | PARTIAL | 9D.90 已新增 `product_catalog`、`/products`、`/products/{productId}` 和产品管理页基础价维护入口，CS / ADMIN 可维护产品类型、材料规格和人工基础价。 | 仍缺客户分层价格、定价权限、价格审批、自动报价、价格历史生效规则和客户 / PM 价格字段最终确认。 |
| 客服配送管理 | 人工录入承运商和运单号；真实物流 API 二期。 | PARTIAL | 物流录入和终检发货门禁已有第一段；9D.91 客服配送管理页 / 物流异常跟进第一增量已新增客服端 `/delivery` 配送管理页、`/logistics/orders` 配送列表和 `/orders/{orderId}/logistics/exception` 人工异常跟进，内部跟进说明不返回医生端。 | 仍缺真实物流 API、电子面单、自动轨迹同步、签收回调、物流平台 webhook、物流字段客户 / PM 最终确认和真实浏览器完整验收；不接真实 DHL / FedEx / 顺丰 API。 |
| 客服账单管理 | 账单上传、收支流水记录；月度账单自动归集二期。 | PARTIAL | 账单上传、付款状态已有第一段；9D.84 已补 CS / ADMIN 录入人工收款流水。 | 月结自动归集、退款、对账、发票保持二期或外部系统项。 |
| 客服外协管理 | 一期选做，资源不足可二期。 | BLOCKED | 文档未把外协作为当前完成项。 | 需要 PM 明确一期是否必须做；未确认前不作为 READY 硬阻塞。 |
| 工序链 | 9 条预定义工序链固定入库，管理端只查看和绑定员工，不后台动态编辑。 | ALIGNED | 工序链定义、实例快照、DAG 并联汇合、分支参数已落地。 | 保持“不做后台工序链编辑器”；人工分支由生产审核决定。 |
| 生产资料审核 | 生产审核通过实例化工序链，不通过退回补资料。 | PARTIAL | 生产审核、工序实例化、状态门禁已有第一增量。 | 需补生产端完整审核页验收和资料不可开工升级处理。 |
| 工序执行 / 工时 | 任务池、入检、开工、暂停、继续、完成、出检。 | PARTIAL | 入检 / 出检 / 工时 / 任务池已有自动化和前端第一增量。 | 需补更细幂等测试、工时历史和通知联动。 |
| 质检 / 发货 | 终检、包装发货、物流信息同步到医生端。 | PARTIAL | 终检报告、终检 PDF file_id、签名 PENDING 占位、发货门禁、物流发货已有第一段。 | 真实电子签章、复杂 PDF 模板、真实物流平台均不能伪装完成；签名占位必须继续标 PENDING。 |
| 人员管理 | 员工档案、岗位权限、工作量监控。 | PARTIAL | 9D.86 已复用 `system_user`、`system_dept`、`system_post`、`system_user_post`、`system_user_role`、`work_log` 和 `rework_record`，新增 `/staff/workload`、生产端 `/production/staff`、管理端 `/admin/staff`，覆盖员工档案、部门岗位、角色摘要和工作量统计第一增量。 | 仍缺完整 HR、人员 CRUD、岗位能力矩阵编辑、排班、薪酬、绩效申诉和客户 / PM 对人员字段口径确认；下一步转客服订单 / 沟通完整可见性 smoke。 |
| 专项质量管理 | 内返、外返、质量统计看板，内返率 / 外返率分开。 | PARTIAL | 返工、内返率 / 外返率只读汇总第一增量已有；9D.87 已复用 `check_record` + `rework_record`，新增 `/quality-records`、`/quality-records/external-returns` 和生产端 `/production/quality` 外返登记 / 列表入口；PRD V2 本地功能差异收口 B 已新增 `quality_record` 独立事实表、`/quality-records/{qualityRecordId}/status` 状态更新接口和生产端状态更新入口。 | 独立模型 / 状态工作流第一段已完成，但仍缺客户确认的最终质量记录模型、编辑/删除、质量复盘、投诉/退货系统、完整浏览器验收和客户 / PM 质量口径确认。 |
| 绩效统计 | 完成数量、有效工时、返工次数、准时率、通过率、工时效率。 | PARTIAL | 绩效周期、公式版本、标准工时覆盖率、默认绩效分已有第一段。 | 标准工时与公式仍需客户 / PM 确认；申诉、导出、工资结算不纳入一期必做。 |
| 设备 / 物料 / 安环 / 成本 / 奖惩 | 2026-07-06 基准判定为 C 类：一期保留入口、基础台账、基础登记、状态更新或架构预留，不继续扩成完整管理闭环。 | PARTIAL / C_BASELINE | 当前已有 9D.50-9D.54 只读汇总第一增量；9D.95.1 已补设备台账 / 设备事件录入第一增量；9D.95.2 已补物料异常登记 / 处理状态第一增量；9D.95.3 已补安环巡检 / 隐患整改第一增量；9D.95.4 已补成本记录维护 / 趋势口径第一增量；9D.95.5 已补奖惩记录 / 审批状态第一增量。 | 保留现有基础能力，不再把设备编辑、完整事件历史、安环完整审批、成本审批 / 真实趋势、奖惩复杂审批和完整管理闭环列为一期本地必做缺口；真实财务、工资、IoT、供应商协同仍后置或 BLOCKED。 |
| AI-1 翻译助手 | 客服触发，生成中文生产指令草稿，确认后写入。 | PARTIAL | 翻译接口、客服初审页草稿确认已有第一段；9D.94 已补显式 LangChain + DeepSeek provider。 | 仍缺真实 DeepSeek key 环境、牙科术语词库优化和客户 / PM 验收。 |
| AI-2 客服查询助手 | 客服读内部数据，自然语言查询，不自动对外发送。 | PARTIAL | AI-2 后端能力和权限边界已有第一增量；9D.92 AI-2 客服查询助手完整入口第一增量已补客服端 `/ai/cs` 完整入口，调用 `/ai/cs-query` 并展示人工复核提示；9D.94 已补显式 LangChain + DeepSeek provider；9D.97 已补 AI-2 客服查询引用数据说明 / 知识上下文补强第一增量，`/ai/cs-query` 返回 `reference_data_notes`；PRD V2 本地功能差异收口 C 已补 `attachment_contexts` 附件预览上下文，客服端展示“附件预览上下文”。 | AI-2 附件预览上下文第一段已补；仍需真实 key 验收、RAG / tool calling 如需、客户 / PM AI-2 口径确认和更完整生产级输出策略。 |
| AI-3 客户订单助手 | 医生只读外部状态 / 物流，不暴露内部信息。 | PARTIAL | 安全读模型、拒答测试和 9D.94 LangChain + DeepSeek provider 下内部问题不外呼测试已覆盖。 | 需继续复测所有医生端 API / WebSocket / AI payload 脱敏和真实 key 环境。 |
| AI-4 资料缺失助手 | 医生提交前自动触发，客服审核时可手动触发。 | PARTIAL | 后端缺失检查和客服页手动触发已有；9D.96 已补医生提交前自动触发体验第一增量。 | 仍需补更完整的资料缺失解释、附件类型细分、客户 / PM 确认和真实 key 环境验收；9D.96 不做 AI 自动驳回。 |
| AI-5 生产备注助手 | 客服 / 生产端整理生产备注；模板由客户另行提供。 | PARTIAL / BLOCKED | 已有通用生产备注草稿第一段；9D.94 已补显式 LangChain + DeepSeek provider；9D.98 已补 AI-5 生产备注客户模板 / 知识上下文补强第一增量，`/ai/production-note` 返回 `PHASE_ONE_DEFAULT_V1` 默认模板版本、知识上下文说明和客户模板未确认标记，`/ai/production-note/confirm` 支持人工确认后写入生产备注。 | 客户模板仍待客户 / PM 最终确认；真实 DeepSeek key、生产联调和客户签字未完成前不能标最终 READY。 |
| API 合同 | PRD 提供 `/v1` API、JWT Bearer、用户 / 诊所 / 员工 / 质量 / 账单物流等接口。 | PARTIAL | 当前 `docs/api/openapi.yaml` 覆盖已实现基线。 | 需做 PRD API vs 当前 OpenAPI 合同差异专项；特别是 patient、clinic preference、staff、quality records、payment ledger。 |
| 部署 / 安全 | JWT + Refresh Token、RuoYi RBAC、MinIO 私有桶、签名 URL、审计、Docker / Nginx。 | PARTIAL | 部署骨架、env 检查、权限门禁、文件审计、通知网关 readiness 已有第一段；GOAL-016 / TASK-017 已补 refresh token 轮换和 `check:auth-datascope-prod-closure-b`。 | 仍缺完整 Spring Security/JWT、完整 RuoYi 管理 UI、通用 SQL DataScope、access token 黑名单、多设备会话策略、真实服务器、HTTPS、备份恢复、监控告警、真实密钥外部注入验收。 |

## 需要从一期 READY 中移出的二期项

以下内容最新版 PRD 明确标为二期 / 远期，不应继续作为一期 READY 阻塞项：

- STL 三维模型在线浏览器。
- 语音下单。
- 真实支付网关：微信支付 / 支付宝 / Stripe。
- 电子发票。
- 月结账期自动归集。
- 物流 API 自动同步：DHL / FedEx / 顺丰。
- 患者管理高级功能：自定义标签、批量检索、历史方案智能推荐。
- AI 病例风险预警和历史优质方案推荐。
- SaaS 多租户、AI 报价、AI 获客、售后回访。
- DAG 可视化编辑器。
- 工序链并联“任一分支完成即可继续”；一期仍按“全部完成才汇合”。

## 下一批本地可关闭缺口建议

GOAL-011 / TASK-012 已把下一阶段从“继续造本地 PRD V2 闭环”切到客户 / PM 确认项与真实环境 AI 验收收口。`check:real-acceptance-confirmation` 只验证确认表和真实验收模板仍为待填写 / 待确认，不代表真实环境已经验收。

| 顺序 | 最小闭环 | 原因 | 验收命令建议 |
| --- | --- | --- | --- |
| 1 | 真实客户 / PM 确认项与真实环境 AI 验收收口 | 9D.98 已补 AI-5 生产备注客户模板 / 知识上下文补强第一增量；AI-5 仍受客户模板、真实 key、生产联调和客户签字约束。 | 真实环境验收记录、客户 / PM 确认记录、AI 生产联调记录 |
| 2 | 月度趋势 / 客户排名完整口径确认 | PRD V2 本地功能差异收口 D 已完成本地月度趋势 / 客户排名聚合第一段；客户 / PM 最终统计口径仍待确认。 | 客户 / PM 确认；真实经营统计验收记录 |
| 3 | AI-2 真实 key / RAG / 客户口径验收 | AI-2 `attachment_contexts` 附件预览上下文第一段已由 PRD V2 本地功能差异收口 C 完成；真实 key 环境、RAG / tool calling 如需和客户 / PM AI-2 口径仍未关闭。 | 真实环境验收记录、客户 / PM 确认记录、AI 生产联调记录 |

## PRD V2 本地功能差异收口 A

RepoFrame 记录：`goals/GOAL-007-prd-v2-local-gap-closure-a-20260707.md` / `tasks/TASK-008-prd-v2-local-gap-closure-a-20260707.md`。

本批次只做本地差异队列、acceptance/readiness 指针和机器检查收口，不实现业务代码，不新增迁移，不改 OpenAPI，不接真实外部服务。Task 8 仍保持 `in-progress / NOT_READY`。

收口 A 后的本地实现队列：

| 顺序 | 最小闭环 | 当前判定 | 验收边界 |
| --- | --- | --- | --- |
| 1 | 质量记录独立模型 / 状态工作流第一段 | 已由 PRD V2 本地功能差异收口 B 推进；9D.87 质量记录 CRUD / 外返登记第一增量保留为历史入口，B 批次新增 `quality_record` 独立事实表和状态处理第一段。 | 客户最终质量口径未确认前只能标 PARTIAL；编辑/删除、质量复盘、投诉/退货系统后续再拆。 |
| 2 | 月度趋势 / 客户排名完整口径确认 | 9D.99 / 9D.100 已完成基础展示和现有接口复用；专门月度聚合、真实账期逾期和客户排名规则仍依赖 PM/客户统计口径。 | 先走客户 / PM 口径确认；不把本地推算写成真实经营统计。 |
| 3 | AI-2 附件预览上下文后续 | AI-2 `attachment_contexts` 附件预览上下文第一段已由 PRD V2 本地功能差异收口 C 推进；真实 key 环境和客户 / PM AI-2 口径仍未关闭。 | 真实 key、RAG / tool calling 和客户验收仍保持 BLOCKED/PARTIAL。 |

本批次保持以下状态不变：`prd-v2-local-feature-gaps` 为 `PARTIAL`，`frontend-business-pages` 为 `PARTIAL`，`ai-production-governance` 为 `PARTIAL`，`customer-pm-confirmations` 为 `BLOCKED`。真实支付、真实物流 API、真实电子签章、真实 DeepSeek key、真实 webhook、客户生产备注模板和客户签字均不能由本地文档关闭。

## PRD V2 本地功能差异收口 B

RepoFrame 记录：`goals/GOAL-008-prd-v2-local-gap-closure-b-20260707.md` / `tasks/TASK-009-prd-v2-local-gap-closure-b-20260707.md`。

本批次实现质量记录独立模型 / 状态工作流第一段：新增 `quality_record` 独立事实表，外返登记继续写 `check_record` / `rework_record` 兼容证据，同时写入 `quality_record`；新增 `/quality-records/{qualityRecordId}/status` 状态更新接口；生产端 `/production/quality` 增加状态更新表单；OpenAPI 和检查脚本同步。目标验证包括 `QualityRecordTests`、`npm run check:task9d87`、`npm run check:openapi`、`npm run build:frontend` 和 `npm run check:prd-v2-gap-closure-b`。

收口 B 后的本地实现队列：

| 顺序 | 最小闭环 | 当前判定 | 验收边界 |
| --- | --- | --- | --- |
| 1 | 月度趋势 / 客户排名完整口径确认 | 9D.99 / 9D.100 已完成基础展示和现有接口复用；专门月度聚合、真实账期逾期和客户排名规则仍依赖 PM/客户统计口径。 | 先走客户 / PM 口径确认；不把本地推算写成真实经营统计。 |
| 2 | AI-2 附件预览上下文后续 | AI-2 `attachment_contexts` 附件预览上下文第一段已由 PRD V2 本地功能差异收口 C 推进；真实 key 环境和客户 / PM AI-2 口径仍未关闭。 | 真实 key、RAG / tool calling 和客户验收仍保持 BLOCKED/PARTIAL。 |
| 3 | 质量记录完整闭环后续 | `quality_record` 独立事实表和状态工作流第一段已完成。 | 编辑/删除、质量复盘、投诉/退货系统和客户最终质量口径仍需客户 / PM 确认后再拆。 |

本批次保持以下状态不变：`prd-v2-local-feature-gaps` 为 `PARTIAL`，`frontend-business-pages` 为 `PARTIAL`，`ai-production-governance` 为 `PARTIAL`，`customer-pm-confirmations` 为 `BLOCKED`。真实支付、真实物流 API、真实电子签章、真实 DeepSeek key、真实 webhook、客户生产备注模板、客户最终质量口径和客户签字均不能由本地代码或文档关闭。Task 8 仍保持 `in-progress / NOT_READY`。

## PRD V2 本地功能差异收口 C

RepoFrame 记录：`goals/GOAL-009-prd-v2-local-gap-closure-c-20260707.md` / `tasks/TASK-010-prd-v2-local-gap-closure-c-20260707.md`。

本批次实现 AI-2 消息附件预览聚合 / 更完整知识上下文第一段：`/ai/cs-query` 响应新增 `attachment_contexts`，后端在当前订单和现有文件权限范围内聚合最多 5 条已完成附件上下文，通过 `FileResourceService.createPreviewUrl` 生成短时效预览 URL，并返回人工复核说明；客服端 `/ai/cs` 展示“附件预览上下文”；OpenAPI 新增 `AiAttachmentContext`；新增 `npm run check:prd-v2-gap-closure-c`。本批次不自动发送消息、不写订单、不向医生暴露内部附件上下文。

收口 C 后的本地实现队列：

| 顺序 | 最小闭环 | 当前判定 | 验收边界 |
| --- | --- | --- | --- |
| 1 | 月度趋势 / 客户排名完整口径确认 | 9D.99 / 9D.100 已完成基础展示和现有接口复用；专门月度聚合、真实账期逾期和客户排名规则仍依赖 PM/客户统计口径。 | 先走客户 / PM 口径确认；不把本地推算写成真实经营统计。 |
| 2 | AI-2 真实 key / RAG / 客户口径验收 | `attachment_contexts` 附件预览上下文第一段已完成。 | 真实 key、RAG / tool calling 和客户验收仍保持 BLOCKED/PARTIAL。 |
| 3 | 质量记录完整闭环后续 | `quality_record` 独立事实表和状态工作流第一段已完成。 | 编辑/删除、质量复盘、投诉/退货系统和客户最终质量口径仍需客户 / PM 确认后再拆。 |

本批次保持以下状态不变：`prd-v2-local-feature-gaps` 为 `PARTIAL`，`frontend-business-pages` 为 `PARTIAL`，`ai-production-governance` 为 `PARTIAL`，`customer-pm-confirmations` 为 `BLOCKED`。真实支付、真实物流 API、真实电子签章、真实 DeepSeek key、真实 webhook、客户生产备注模板、客户最终质量口径、客户 AI-2 口径和客户签字均不能由本地代码或文档关闭。Task 8 仍保持 `in-progress / NOT_READY`。

## PRD V2 本地功能差异收口 D

RepoFrame 记录：`goals/GOAL-010-prd-v2-local-gap-closure-d-20260707.md` / `tasks/TASK-011-prd-v2-local-gap-closure-d-20260707.md`。

本批次实现月度趋势 / 客户排名聚合接口第一段：新增 `GET /dashboards/phase-one-ab`，返回当前月 / 上月订单数和件数、月度差值、Top 客户、生产异常、待问异常、出货率和完成率；后端使用既有身份与 DataScope 边界，CS / ADMIN / WORKER 可读，DOCTOR 403；客服 / 生产工作台消费该本地聚合；OpenAPI 新增 `PhaseOneAbDashboardResponse`、`PhaseOneAbMonthSummary` 和 `PhaseOneAbCustomerRanking`；新增 `npm run check:prd-v2-gap-closure-d`。

收口 D 后的本地实现队列：

| 顺序 | 最小闭环 | 当前判定 | 验收边界 |
| --- | --- | --- | --- |
| 1 | 当前本地可开发 PRD V2 差异队列 | 已完成本批次可落地项。 | 后续进入客户 / PM 统计口径确认、真实支付 / 物流、真实 AI key / webhook 和真实环境验收。 |
| 2 | 月度趋势 / 客户排名最终口径 | 本地聚合第一段已完成。 | 客户 / PM 确认前不能写成正式经营 BI、财务月结或物流平台统计。 |
| 3 | 质量、AI、C 类模块后续完整闭环 | 已有第一段能力或基础台账。 | 编辑/删除、复盘、RAG / tool calling、真实 key、IoT、财务、工资和完整管理闭环均需另行确认。 |

本批次保持以下状态不变：`prd-v2-local-feature-gaps` 为 `PARTIAL`，`frontend-business-pages` 为 `PARTIAL`，`ai-production-governance` 为 `PARTIAL`，`customer-pm-confirmations` 为 `BLOCKED`。真实支付、真实物流 API、真实电子签章、真实 DeepSeek key、真实 webhook、客户生产备注模板、客户统计口径、客户 AI-2 口径和客户签字均不能由本地代码或文档关闭。Task 8 仍保持 `in-progress / NOT_READY`。

## 9D.93.1 PRD V2 范围纠偏记录

- 医生文件模块不属于项目需求范围，不开发；已移除医生端独立 `/doctor/files` / `doctor-files` 入口，订单附件、病例资料、口扫、图片和处方继续归入医生订单链路。
- 2026-07-06 内部确认基准已覆盖本记录中的旧 C 类判断：设备 / 物料 / 安环 / 成本 / 奖惩保留现有基础台账、基础登记、状态更新和汇总能力，不再继续拆编辑、历史、完整审批、真实趋势或完整管理闭环作为一期本地必做。
- 所有 AI 智能体使用 LangChain + DeepSeek 实现；9D.94 已完成显式 `AI_PROVIDER=langchain-deepseek` 的底座第一增量，但真实 key、真实生产验收和更完整 AI 能力仍未完成。
- 新增 `npm run check:task9d93` 固定上述范围返工检查。

## 9D.95 设备 / 物料 / 安环 / 成本 / 奖惩基础台账拆解记录

- `docs/acceptance/phase-one-production-support-closure-plan.md` 现在作为历史拆解和基础能力索引保留，不能继续解读为一期完整管理闭环排期。
- 当前 9D.50-9D.54 汇总和 9D.95.1-9D.95.5 基础登记 / 状态更新均为 C 类基础能力证据，不能写成五类模块 READY。
- A/B 类菜单 / 基础统计 / 本地接口复用已由 9D.99 和 9D.100 收口；C 类若客户另行确认完整闭环，再单独重开需求、PRD、验收与工程量评估。
- 本轮不接 IoT，不接真实财务系统，不把奖惩作为工资发放结果，不伪装客户确认。

## 9D.95.1 设备台账 / 设备事件录入第一增量

- 9D.95.1 已补 `POST /production/equipment` 和 `POST /production/equipment/{equipmentCode}/events`，生产端设备管理页新增“登记设备”和“登记事件”最小表单。
- 后端测试覆盖 WORKER / ADMIN 设备写入、设备事件登记、汇总变化和 DOCTOR 写入 403；`npm run check:task9d951` 检查代码、OpenAPI、前端、文档和 acceptance 回写。
- 本轮不新增迁移，不接 IoT，不做保养审批流、复杂设备履历或真实设备联网。设备管理仍为 PARTIAL，Task 8 仍保持 NOT_READY。

## 9D.95.2 物料异常登记 / 处理状态第一增量

- 9D.95.2 已补 `POST /production/material-exceptions` 和 `PUT /production/material-exceptions/{exceptionNo}/status`，生产端物料异常页新增“登记物料异常”和“更新处理状态”最小表单。
- 后端测试覆盖 WORKER 登记物料异常、ADMIN 更新关闭状态、汇总变化和 DOCTOR 写入 / 更新 403；`npm run check:task9d952` 检查代码、OpenAPI、前端、文档和 acceptance 回写。
- 本轮不新增迁移，不接库存扣减、采购补料、供应商协同或 WMS。物料异常管理仍为 PARTIAL，Task 8 仍保持 NOT_READY。

## 9D.95.3 安环巡检 / 隐患整改第一增量

- 9D.95.3 已补 `POST /production/safety-environment/events` 和 `PUT /production/safety-environment/events/{eventNo}/status`，生产端安环管理页新增“登记安环事件”和“更新整改状态”最小表单。
- 后端测试覆盖 WORKER 登记安环事件、ADMIN 更新关闭整改状态、汇总变化和 DOCTOR 写入 / 更新 403；`npm run check:task9d953` 检查代码、OpenAPI、前端、文档和 acceptance 回写。
- 本轮不新增迁移，不接真实环境采集硬件、PPE 发放系统或完整安环审批流。安环管理仍为 PARTIAL，Task 8 仍保持 NOT_READY。

## 9D.95.4 成本记录维护 / 趋势口径第一增量

- 9D.95.4 已补 `POST /production/cost-management/records`，生产端成本管理页新增“登记成本记录”最小表单。
- 后端测试覆盖 WORKER 登记成本记录、汇总随新增记录变化和 DOCTOR 写入 403；`npm run check:task9d954` 检查代码、OpenAPI、前端、文档和 acceptance 回写。
- 本轮不新增迁移，不接真实财务系统、发票、付款、对账或自动成本分摊。成本管理仍为 PARTIAL，Task 8 仍保持 NOT_READY。

## 9D.95.5 奖惩记录 / 审批状态第一增量

- 9D.95.5 已补 `POST /production/reward-penalty/records` 和 `PUT /production/reward-penalty/records/{recordNo}/status`，生产端奖惩管理页新增“登记奖惩记录”和“更新审批状态”最小表单。
- 后端测试覆盖 WORKER 登记奖惩记录、ADMIN 更新审批状态、汇总随状态变化和 DOCTOR 写入 / 更新 403；`npm run check:task9d955` 检查代码、OpenAPI、前端、文档和 acceptance 回写。
- 本轮不新增迁移，不作为工资发放结果，不做绩效申诉闭环、薪酬结算或复杂审批引擎。奖惩管理仍为 PARTIAL，Task 8 仍保持 NOT_READY。

## 9D.96 医生提交前 AI-4 资料缺失自动触发体验第一增量

- 9D.96 已在医生端提交订单 / 补资料前自动触发既有 `/ai/check-missing`：先保存当前表单为草稿，再检查必填资料缺失。
- 如果 AI-4 返回缺失项，医生端展示“AI-4 资料缺失检查”和缺失清单，并阻断正式提交；资料完整时继续提交到客服审核。
- 本轮不新增后端接口，不接真实 DeepSeek key，不做 AI 自动驳回订单。AI-4 仍为 PARTIAL，Task 8 仍保持 NOT_READY。

## BLOCKED 清单

- 客户 / PM 确认动态表单最终字段。
- 客户提供 AI-5 生产备注标准模板。
- 客户 / PM 确认标准工时和绩效公式。
- 客户 / PM 确认文件大小、类型、数量限制。
- 真实 DeepSeek key 和真实生产 webhook 联调。
- 真实服务器、HTTPS、备份恢复、监控告警和生产部署验收。
- 真实支付、真实物流 API、真实电子签章均为二期或外部环境项，不可由本地开发伪装完成。

## 当前结论

当前项目不是“离正式上线只差签收模板”，而是需要继续按 2026-07-06 内部确认基准关闭一期缺口。Task 8 仍保持 `in-progress / NOT_READY`。9D.83 到 9D.100 的本地第一增量证据保留；9D.95.1 到 9D.95.5 作为 C 类基础台账 / 基础登记 / 状态更新证据保留，但不再代表一期还要继续补完整编辑、历史、审批、真实趋势或完整管理闭环。A/B 类一期范围对齐第一段和第二段已分别由 9D.99、9D.100 完成；月度趋势、真实支付 / 物流平台和客户 / PM 最终统计口径仍保持 PARTIAL / BLOCKED。
