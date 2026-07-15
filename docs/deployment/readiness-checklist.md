# Deployment Readiness Checklist

更新日期：2026-07-06

## 2026-07-15 当前覆盖口径

GOAL-021 / TASK-022 已将 `customer-pm-confirmations` 从九项统一 `BLOCKED` 校正为分类后的 `PARTIAL`：2项产品确认、1份客户模板、1包标准工时业务数据（提供方待指定），其余分别为已确认基准、一期范围外、培训证据或真实环境证据。PRD逐功能签字为0项。真实上线仍需代码缺口、2026-07-06 表外范围、跨项门禁、真实环境和总体验收证据；原 PRD 38行状态见 `docs/acceptance/prd-v2-38-item-acceptance-audit-20260715.md`。下文旧阶段文字保留历史记录，如冲突以本节为准。Task 8 仍保持 `NOT_READY`。

## 总结

2026-07-07 部署 / 运维本地补强由 `GOAL-020` / `TASK-021` 承接，并新增 `npm run check:deployment-ops-local-hardening` 与 `npm run dry-run:phase-one-release-rollback`。本 checklist 继续作为上线 readiness 缺口来源；本阶段只补 `docs/deployment/phase-one-local-ops-dry-run.md`、本地 release / rollback dry-run、备份 / 恢复 dry-run 模板第一段、日志留存 / 监控告警配置模板第一段、compose / env / Nginx / healthcheck 静态检查和 readiness 联动。`deployment-infrastructure` 与 `operations-manuals` 仍为 `PARTIAL`，真实服务器、HTTPS、备份恢复、日志留存、监控告警、发布回滚演练、正式客户培训签收、客户 / PM 签字和真实环境验收仍未完成，Task 8 仍保持 `NOT_READY`。

2026-07-07 AI 生产治理本地补强由 `GOAL-019` / `TASK-020` 承接，并新增 `npm run check:ai-production-governance-local-hardening`。本 checklist 继续作为上线 readiness 缺口来源；本阶段只补本地只读治理总览、提示词版本、输出安全边界、预算 / 熔断、AI-3 安全矩阵、AI-5 默认模板边界和真实外部集成待验状态，`ai-production-governance` 仍为 `PARTIAL`，不代表真实 DeepSeek key、生产 webhook、客户 AI-5 正式模板、客户签字或真实环境验收完成，Task 8 仍保持 `NOT_READY`。

2026-07-07 本地 12 步主链路验收增强由 `goals/GOAL-018-local-main-chain-acceptance-hardening-20260707.md` / `tasks/TASK-019-local-main-chain-acceptance-hardening-20260707.md` 承接，并新增 `npm run check:local-main-chain-acceptance-hardening`。本 checklist 继续作为上线 readiness 缺口来源；本阶段只增强订单主链路本地固定演示数据和角色边界断言，不代表客户签字、真实支付、真实物流、真实电子签章、真实 DeepSeek key、真实 webhook 或真实环境验收完成，Task 8 仍保持 `NOT_READY`。

2026-07-07 四端前端产品化体验收口由 `goals/GOAL-017-frontend-productization-closure-20260707.md` / `tasks/TASK-018-frontend-productization-closure-20260707.md` 承接，并新增 `npm run check:frontend-productization-closure`。本 checklist 继续作为上线 readiness 缺口来源；`frontend-business-pages` 仍为 `PARTIAL`，本阶段只补本地前端体验第一段，不代表真实支付、真实物流、真实电子签章、真实 DeepSeek key、真实 webhook、客户签字或真实环境验收完成，Task 8 仍保持 `NOT_READY`。

2026-07-07 权限 / DataScope 生产化补强 B 由 `goals/GOAL-016-auth-datascope-production-closure-b-20260707.md` / `tasks/TASK-017-auth-datascope-production-closure-b-20260707.md` 承接，并新增 `npm run check:auth-datascope-prod-closure-b`。本 checklist 继续作为上线 readiness 缺口来源；refresh token 轮换已完成本地补强，但完整 Spring Security/JWT、完整 RuoYi DataScope、通用 SQL DataScope 拦截器、access token 黑名单、多设备会话策略和真实环境验收仍未完成，Task 8 仍保持 `NOT_READY`。

2026-07-07 操作手册 / 回滚 / 培训材料本地收口由 `goals/GOAL-015-operations-rollback-training-closure-20260707.md` / `tasks/TASK-016-operations-rollback-training-closure-20260707.md` 承接，并新增 `npm run check:operations-rollback-training-closure`。本 checklist 继续作为上线 readiness 缺口来源；`operations-manuals` 仍为 `PARTIAL`，真实发布回滚演练、备份恢复演练、日志留存、监控告警、正式客户培训签收、客户 / PM 签字和真实环境验收仍未完成，Task 8 仍保持 `NOT_READY`。

2026-07-07 四端业务页面与客户验收 smoke 收口由 `goals/GOAL-013-frontend-customer-smoke-closure-20260707.md` / `tasks/TASK-014-frontend-customer-smoke-closure-20260707.md` 承接，并新增 `npm run check:frontend-customer-smoke-closure`。本 checklist 继续作为上线 readiness 缺口来源；`frontend-business-pages` 仍为 `PARTIAL`，客户签字、真实支付 / 物流平台、真实电子签章、真实 DeepSeek key、真实 webhook、真实部署环境、HTTPS、备份监控和客户 / PM 确认仍未完成，Task 8 仍保持 `NOT_READY`。

2026-07-07 权限 / DataScope 生产化收口第一段由 `goals/GOAL-012-auth-datascope-production-closure-20260707.md` / `tasks/TASK-013-auth-datascope-production-closure-20260707.md` 承接，并新增 `npm run check:auth-datascope-prod-closure`。本 checklist 继续作为上线 readiness 缺口来源；完整 Spring Security/JWT、完整 RuoYi DataScope、通用 SQL DataScope 拦截器、access token 黑名单、多设备会话策略和真实环境验收仍未完成，Task 8 仍保持 `NOT_READY`。

2026-07-07 客户 / PM 确认项与真实环境 AI 验收收口由 `goals/GOAL-011-real-acceptance-confirmation-20260707.md` / `tasks/TASK-012-real-acceptance-confirmation-20260707.md` 承接，并新增 `npm run check:real-acceptance-confirmation`。本 checklist 继续作为上线 readiness 缺口来源；真实 key、webhook、服务器、HTTPS、备份监控和客户签字仍为待填写 / 待确认，Task 8 仍保持 `NOT_READY`。

2026-07-07 RepoFrame 文档校准由 `goals/GOAL-003-repoframe-doc-hydration-20260707.md` / `tasks/TASK-004-repoframe-doc-hydration-20260707.md` 承接。本 checklist 继续保留该历史锚点。

当前项目不能部署正式生产环境。Task 8A/8B/9A/9B.1/9B.2/9B.3/9B.4/9B.5/9B.6/9B.7/9B.8/9C.1/9C.2/9C.3/9D.1/9D.2/9D.3/9D.4/9D.5/9D.6/9D.7/9D.8/9D.9/9D.10/9D.11/9D.12/9D.13/9D.14/9D.15/9D.16/9D.17/9D.18/9D.19/9D.20/9D.21/9D.22/9D.23/9D.24/9D.25/9D.35/9D.37/9D.38/9D.39/9D.40/9D.41/9D.42/9D.43/9D.44/9D.45/9D.46/9D.47/9D.48/9D.48.1/9D.48.2/9D.55/9D.56/9D.57/9D.58/9D.59 的结论是：后端多条最小业务链路已有自动化和 smoke 基线，当前后端基线 OpenAPI 已二次冻结，服务端 Bearer 身份基线、后端集中权限守卫、数据库化 RBAC/DataScope 基础、菜单/部门/岗位与前端权限路由第一增量、权限注解/统一拦截器、订单/工序实例 SQL DataScope 第一增量、文件/协同/AI DataScope 扩展、生产鉴权启动门禁第一增量、Refresh Token/logout 第一增量、四入口登录页与角色端口校验第一增量、WebSocket 通知第一增量、通知未读/已读 REST、前端消息中心入口、Redis 广播代码路径第一增量、医生订单工作台第一增量、医生下单第一增量、医生订单草稿/补资料第一增量、动态表单 CRUD 第一增量、设计稿多文件/多版本第一增量、终检发货拦截第一增量、终检报告第一增量、返工关闭/责任分类第一增量、返工字典第一增量、返工字典后台维护第一增量、终检专用角色 / 附件第一增量、返工通知联动第一增量、复杂返工影响范围第一增量、绩效归因联动第一增量、返工影响审计可视化第一增量、返工影响筛选第一增量、返工影响图形化第一增量、客服协同闭环第一增量、客服资料缺失提示与 AI 翻译草稿确认第一增量、绩效明细第一增量、真实 DeepSeek 接入第一增量、AI 预算熔断/降级第一增量、AI 预算外部告警待发送事实第一增量、AI 分角色预算第一增量、AI 分模型预算第一增量、AI 提示词版本与输出防护第一增量、AI 外部告警发送器第一增量、AI 成本趋势第一增量、AI 真实外部渠道适配第一增量、AI 外部告警调度器第一增量、AI 外部告警重试/死信第一增量、AI 外部告警幂等/并发领取第一增量、AI 外部告警 webhook 签名/鉴权第一增量、AI 外部告警监控/运维可观察第一增量、AI 外部告警 outbox 列表/筛选第一增量、AI 外部告警失败/死信可见性第一增量、客服初审第一增量、生产审核第一增量、生产任务入口第一增量、入检/出检/工时操作页面第一增量、绩效管理页面第一增量、生产看板第一增量、返工终检第一增量、Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器上传 smoke 已落地；正式上线仍需要先补齐完整 RuoYi 管理 UI、完整前端业务页面、WebSocket 生产网关/真实多实例验收、生产级 AI 治理、真实外部服务配置和客户确认项。

Task 8 readiness 终检报告第一增量已生成：`docs/deployment/task-8-final-readiness-report.md`。该报告把本 checklist 和 acceptance matrix 中仍为 PARTIAL / NOT_READY 的关键项整理为上线前缺口清单，Task 8 状态仍为 `NOT_READY`。

9D.82 最新 PRD V2.0 差异对齐矩阵第一段已补：`docs/acceptance/prd-v2-gap-matrix.md` 将最新版 PRD 正文 `V2.0 / 2026-07-04` 拆成一期已覆盖、部分覆盖、缺失、BLOCKED 和二期项，`npm run check:task9d82` 可检查矩阵、项目入口文档和 acceptance 证据。2026-07-06 内部确认基准已新增 `docs/acceptance/phase-one-scope-baseline-20260706.md`：A 类全部一期修正，B 类做基础版，C 类设备 / 物料 / 安环 / 成本 / 奖惩 / 行政 / 财务只保留入口、基础台账、基础登记、状态更新或架构预留，不再把完整管理闭环列为一期本地必做。

9D.94 LangChain + DeepSeek AI 底座对齐第一增量已补：后端新增 LangChain4j DeepSeek 适配，默认 `AI_PROVIDER=deterministic`、`AI_LANGCHAIN_ENABLED=false`；只有显式 `AI_PROVIDER=langchain-deepseek`、`AI_LANGCHAIN_ENABLED=true`、`AI_LANGCHAIN_PROVIDER=deepseek`、`AI_DEEPSEEK_ENABLED=true` 且外部注入 DeepSeek key 时，AI-1 / AI-2 / AI-3 公开查询 / AI-5 才通过 LangChain4j 调用 DeepSeek。该记录不代表真实 key、生产 webhook、流式输出、RAG、复杂 agent tool calling 或客户 / PM AI 验收已完成。

9D.95 设备 / 物料 / 安环 / 成本 / 奖惩基础台账拆解记录已按 2026-07-06 基准改为历史索引：`docs/acceptance/phase-one-production-support-closure-plan.md` 保留 9D.50-9D.54 与 9D.95.1-9D.95.5 的基础能力证据，不再作为一期完整管理闭环排期。该记录不代表五类模块已 READY，不接 IoT、真实财务系统或工资发放。

9D.95.1 设备台账 / 设备事件录入第一增量已补：新增 `POST /production/equipment`、`POST /production/equipment/{equipmentCode}/events`、生产端“登记设备 / 登记事件”最小入口和 `npm run check:task9d951`。本轮不新增迁移，不接 IoT，不做保养审批流、复杂设备履历或真实设备联网；设备管理仍为 PARTIAL，Task 8 仍保持 NOT_READY。

9D.95.2 物料异常登记 / 处理状态第一增量已补：新增 `POST /production/material-exceptions`、`PUT /production/material-exceptions/{exceptionNo}/status`、生产端“登记物料异常 / 更新处理状态”最小入口和 `npm run check:task9d952`。本轮不新增迁移，不接库存扣减、采购补料、供应商协同或 WMS；物料异常管理仍为 PARTIAL，Task 8 仍保持 NOT_READY。

9D.95.3 安环巡检 / 隐患整改第一增量已补：新增 `POST /production/safety-environment/events`、`PUT /production/safety-environment/events/{eventNo}/status`、生产端“登记安环事件 / 更新整改状态”最小入口和 `npm run check:task9d953`。本轮不新增迁移，不接真实环境采集硬件、PPE 发放系统或完整安环审批流；安环管理仍为 PARTIAL，Task 8 仍保持 NOT_READY。

9D.95.4 成本记录维护 / 趋势口径第一增量已补：新增 `POST /production/cost-management/records`、生产端“登记成本记录”最小入口和 `npm run check:task9d954`。本轮不新增迁移，不接真实财务系统、发票、付款、对账或自动成本分摊；成本管理仍为 PARTIAL，Task 8 仍保持 NOT_READY。

9D.95.5 奖惩记录 / 审批状态第一增量已补：新增 `POST /production/reward-penalty/records`、`PUT /production/reward-penalty/records/{recordNo}/status`、生产端“登记奖惩记录 / 更新审批状态”最小入口和 `npm run check:task9d955`。本轮不新增迁移，不作为工资发放结果，不做绩效申诉闭环、薪酬结算或复杂审批引擎；奖惩管理仍为 PARTIAL，Task 8 仍保持 NOT_READY。

9D.96 医生提交前 AI-4 资料缺失自动触发体验第一增量已补：医生端提交订单 / 补资料前先保存草稿并自动调用 `/ai/check-missing`；缺失时展示“AI-4 资料缺失检查”和缺失清单，阻断正式提交。新增 `npm run check:task9d96`。本轮不新增后端接口，不做 AI 自动驳回订单，不接真实 DeepSeek key；AI-4 仍为 PARTIAL，Task 8 仍保持 NOT_READY。

9D.83 患者管理基础版第一增量已补：`patient_record`、`orders.patient_id`、`patient:manage-doctor`、患者档案接口、患者历史订单接口和医生端 `/doctor/patients` 最小入口。该记录关闭本地基础闭环，不代表真实客户数据导入、高级标签、批量检索或 AI 历史方案推荐已完成。

9D.84 人工支付流水 / 收支记录第一增量已补：`order_payment_record` 和 `/orders/{orderId}/payments`，CS / ADMIN 可录入人工收款流水，医生只读查看本人订单流水。该记录不代表真实支付网关、退款、对账、发票或月结自动归集完成。

9D.85 客户 / 诊所档案与偏好第一增量已补：`/clinics`、`/clinics/{clinicId}`、`/clinics/{clinicId}/preference`、客服端 `/customers`、管理端 `/admin/clinics`、医生端 `/doctor/account/clinic` 和 `npm run check:task9d85`。CS / ADMIN 可维护一期客户偏好，医生只能只读本人诊所偏好。该记录不代表客户开户审批、定价体系、真实客户数据导入、复杂 CRM 或客户 / PM 字段最终确认完成。

9D.86 人员档案 / 工作量看板第一增量已补：`/staff/workload`、生产端 `/production/staff`、管理端 `/admin/staff` 和 `npm run check:task9d86`。ADMIN / CS 可查看内部员工档案和工作量，WORKER 只返回本人，DOCTOR 拒绝访问。该记录不代表完整 HR、人员 CRUD、岗位能力矩阵、排班、薪酬或绩效申诉完成。

9D.87 质量记录 CRUD / 外返登记第一增量已补：`/quality-records`、`/quality-records/external-returns`、生产端 `/production/quality` 和 `npm run check:task9d87`。CS / ADMIN 可登记外返质量记录并查看内部质量记录，DOCTOR 拒绝访问。PRD V2 本地功能差异收口 B 已新增 `quality_record` 独立事实表、`/quality-records/{qualityRecordId}/status` 状态更新接口、生产端状态更新入口和 `npm run check:prd-v2-gap-closure-b`。该记录不代表编辑/删除、投诉/退货系统、质量复盘完整流程或客户最终质量口径确认完成。

9D.88 客服订单 / 沟通完整可见性 smoke 已补：`MessageResponse` 新增 `order_no`、`product_type`、`external_status`，客服待审核队列和订单消息上下文可识别订单上下文，`npm run check:task9d88` 可检查后端、前端、OpenAPI 和文档证据。该记录不代表消息附件 URL 聚合、AI 自动审核、复杂客服工单或真实外部通知完成。

9D.89 医生账户设置基础闭环已补：V33 为 `system_user` 增加账户设置字段，新增 `/doctor/account/settings`、`/doctor/account/password`、医生端 `/doctor/account/settings` 页面和 `npm run check:task9d89`。该记录不代表短信 / 邮箱真实验证、多地址簿、二次认证、登录记录审计或客户最终字段确认完成。

9D.90 产品参数 / 价格体系一期最小后台已补：V34 新增 `product_catalog`，新增 `product:manage`、`/products`、`/products/{productId}`、产品管理页基础价维护入口和 `npm run check:task9d90`。该记录不代表自动报价、客户分层价格、价格审批、价格历史生效规则、账单重算、真实财务结算或客户 / PM 价格字段最终确认完成。

9D.100 A/B 类一期范围对齐第二段已补：客服 / 生产工作台统计复用现有本地接口，新增 `loadPhaseOneAbDashboardData` 和 `npm run check:task9d100`。客服侧复用订单列表、待审消息、通知未读、物流人工状态和质量外返汇总；生产侧复用订单列表、待审消息、人员工作量、质量返工、物流人工状态以及设备 / 物料 / 安环 / 成本 / 奖惩基础汇总。该记录不代表月度趋势、真实账期逾期、真实支付平台、真实物流平台或客户 / PM 最终统计口径已完成，Task 8 仍保持 `NOT_READY`。

PRD V2 本地功能差异收口 A 已完成为 GOAL-007 / TASK-008，并新增 `npm run check:prd-v2-gap-closure-a`。本批次只把 9D.100 之后的本地差异队列和 readiness 指针校准为可验证状态：质量记录独立模型 / 状态工作流第一段列为下一批本地优先闭环，月度趋势 / 客户排名完整口径确认和 AI-2 消息附件预览聚合 / 更完整知识上下文继续保留 PARTIAL / BLOCKED 边界。该记录不代表业务代码实现、真实外部服务或真实环境验收完成，Task 8 仍保持 `NOT_READY`。

PRD V2 本地功能差异收口 B 已推进为 GOAL-008 / TASK-009，并新增 `npm run check:prd-v2-gap-closure-b`。本批次补齐质量记录独立模型 / 状态工作流第一段的本地实现证据：V35 `quality_record`、目标测试、OpenAPI、前端状态更新入口和文档回写。该记录不代表客户最终质量口径、真实支付 / 物流平台、真实 key、真实 webhook、客户签字或真实环境验收完成，Task 8 仍保持 `NOT_READY`。

PRD V2 本地功能差异收口 C 已推进为 GOAL-009 / TASK-010，并新增 `npm run check:prd-v2-gap-closure-c`。本批次补齐 AI-2 消息附件预览聚合 / 更完整知识上下文第一段：`/ai/cs-query` 响应新增 `attachment_contexts`，后端通过既有文件权限校验生成短时效预览 URL，客服端 `/ai/cs` 展示“附件预览上下文”，OpenAPI 新增 `AiAttachmentContext`。该记录不代表真实 DeepSeek key、RAG / tool calling、生产 webhook、客户 AI-2 口径、客户签字或真实环境验收完成，Task 8 仍保持 `NOT_READY`。

PRD V2 本地功能差异收口 D 已推进为 GOAL-010 / TASK-011，并新增 `npm run check:prd-v2-gap-closure-d`。本批次补齐月度趋势 / 客户排名聚合第一段：`/dashboards/phase-one-ab` 返回本地当前月 / 上月订单与件数、月度差值、Top 客户、生产异常、待问异常、出货率和完成率，客服 / 生产工作台消费该聚合，OpenAPI 新增 `PhaseOneAbDashboardResponse`。该记录不代表真实支付平台、真实物流平台、客户最终统计口径、客户签字或真实环境验收完成，Task 8 仍保持 `NOT_READY`。

部署安全 / 环境变量 readiness 检查第一增量已补：`npm run check:deployment-env` 会检查 README、`.env.example`、`application.yml`、`application-prod.yml` 和本 checklist 中的生产环境变量边界、默认关闭能力和禁止提交真实密钥说明。

验收矩阵机器可读缺口清单第一增量已补：`acceptance.json` 维护 `task8_readiness_gaps`，`npm run check:task8-readiness-gaps` 可列出当前仍未 READY 的关键上线缺口。本 checklist 仍保持 Task 8 `NOT_READY`。

12 步主链路浏览器 smoke 第一增量已补：`npm run smoke:task9d62` 固定 PRD/TRD 12 步主链路的四端浏览器入口和页面/控件可达断言；9D.62.1 已追加默认固定演示数据模式，先创建真实医生订单并完成客服初审、生产审核和工序实例化断言；9D.62.2 已继续完成管理员派工、worker 任务池可见、入检、开工、工时、完工和出检通过；9D.62.3 已继续完成真实签名 URL 设计稿文件上传、设计稿版本绑定、客服审核、医生预览 URL 获取和医生确认；9D.62.4 已继续完成真实签名 URL 账单文件上传、账单绑定、医生账单预览 URL 获取，并断言未完成全链路终检前物流发货 409 门禁；9D.62.5 已继续处理剩余 READY 工序节点直到工序实例完成，再录入物流发货并由医生确认收货；9D.63 已继续提交一次出检失败、创建返工记录、重做目标节点并关闭返工；9D.64 已补客服端设计稿版本列表和客服设计稿预览链接；9D.65 已补终检报告内部 PDF file_id 和签名占位字段；9D.66 绩效周期筛选第一段已补绩效统计和工时明细的开始/结束日期筛选；9D.67 文件上传限制与 bucket 隔离第一段已补文件大小、类型、数量限制和配置边界。当前仍未覆盖真实电子签章/复杂报告模板、付款状态和真实物流平台等完整上线闭环。

9D.68 12 步主链路客户验收版收敛已补：新增 `docs/acceptance/phase-one-main-chain-customer-acceptance.md`，把固定演示订单、12 步 PASS/FAIL、剩余缺口和推荐复跑命令整理为客户/PM 可读记录；该记录不等于客户签字，Task 8 仍保持 `NOT_READY`。

9D.69 部署基础设施第一段已补：新增 `backend/platform-server/Dockerfile`、`frontend/Dockerfile`、`frontend/nginx.conf`、`deploy/docker-compose.phase-one.yml`、`deploy/env/phase-one.prod.example` 和 `docs/deployment/phase-one-docker-env.md`；`npm run check:task9d69` 和 `npm run compose:phase-one:config` 可静态验证一期 Docker / compose / env 隔离骨架。该记录不等于真实生产部署，Task 8 仍保持 `NOT_READY`。

9D.70 操作手册与交付材料第一段已补：新增 `docs/operations/phase-one-role-operation-manual.md`、`docs/operations/phase-one-troubleshooting-guide.md` 和 `docs/operations/phase-one-delivery-materials-index.md`；`npm run check:task9d70` 可检查四端操作手册、故障处理清单和交付材料索引。该记录不等于客户培训签收，Task 8 仍保持 `NOT_READY`。

9D.71 AI 外部告警接收端验签 / 防重放第一段已补：发送侧签名启用时发送 `X-AI-Alert-Timestamp`、`X-AI-Alert-Nonce` 和 `X-AI-Alert-Signature`，接收端新增默认关闭的 `/ai/external-alerts/receive` 本地验收桩；`npm run check:task9d71` 可检查接收端验签、防重放、OpenAPI、环境变量和文档证据。该记录不等于真实生产 webhook 联调，Task 8 仍保持 `NOT_READY`。

9D.72 客户 / PM 确认项清单第一段已补：新增 `docs/acceptance/phase-one-customer-pm-confirmations.md`，把付款状态口径、动态表单最终字段、AI-5 生产备注模板、标准工时与绩效公式口径、Multipart 上传限制、真实电子签章 / 终检报告模板、真实物流平台 / 运单同步、客户培训与签收、真实环境上线验收边界纳入可追踪确认表；`npm run check:task9d72` 可检查确认清单和项目文档证据。该记录只建立确认追踪，不代表客户或 PM 已签字，Task 8 仍保持 `NOT_READY`。

9D.73 付款状态第一段已补：新增 `order_bill.payment_status`、`/orders/{orderId}/bill/payment-status`、OpenAPI 契约和前端客服人工维护付款状态入口；医生端账单物流页只读展示付款状态。该记录只代表 CP-001 默认人工付款状态第一段，不代表接入真实支付系统、财务审批或支付对账，Task 8 仍保持 `NOT_READY`。

9D.74 绩效标准工时与完整公式口径第一段已补：`/performance` 新增 `performance_formula_version=PHASE_ONE_DEFAULT_V1`、标准工时合计、标准工时覆盖率、标准工时缺失数量和默认绩效分；前端绩效页只读展示公式版本、覆盖率和默认绩效分。该记录只代表 CP-004 开发默认公式第一段，不代表客户 / PM 已确认正式绩效口径，也不作为工资、奖金或奖惩结算依据，Task 8 仍保持 `NOT_READY`。

9D.75 正式鉴权与 DataScope 收口第一段已补：新增 `APP_AUTH_ALLOW_ROLE_FALLBACK`，本地默认兼容角色兜底，`prod` profile、一期 compose 和生产 env 示例固定为 `false`；严格权限模式下，声明权限码的接口必须由 Bearer token 中的权限码放行，角色-only token 返回 403。该记录不等于完整 Spring Security/JWT 或完整 RuoYi DataScope，Task 8 仍保持 `NOT_READY`。

权限 / DataScope 生产化收口第一段已补：GOAL-012 / TASK-013 新增 `npm run check:auth-datascope-prod-closure`，补严格权限模式目标测试、clinic / doctor account / notification 入口权限码、V36 权限码种子，并清零主代码 roles-only `@RequirePermission` 注解。该记录不等于完整 Spring Security/JWT、完整 RuoYi DataScope、通用 SQL DataScope 拦截器、refresh token 轮换、access token 黑名单或多设备会话策略，Task 8 仍保持 `NOT_READY`。

9D.76 WebSocket / 通知生产验收第一段已补：一期 Nginx 生产骨架新增 `/notifications` REST 代理，并保留 `/ws/` WebSocket upgrade 代理；`npm run check:task9d76` 可检查通知 REST 网关、WebSocket 网关、compose Redis/后端依赖、Redis 广播代码路径、通知 REST 隔离/已读测试、WebSocket 脱敏测试和 Redis 远端广播测试。该记录不代表真实双实例 Redis 联调、Nginx HTTPS 验收或真实生产 webhook 联调完成，Task 8 仍保持 `NOT_READY`。

GOAL-014 / TASK-015 WebSocket / 通知生产 readiness 收口已补 `docs/deployment/websocket-notification-production-readiness.md` 和 `npm run check:websocket-notification-readiness-closure`，把 `websocket-notification-prod` 的真实双后端实例 Redis 联调、心跳 / 重连压测、Nginx HTTPS WebSocket 网关、浏览器通知权限、完整业务页面联动、生产 webhook、监控告警和发布回滚整理为待填写 / 待确认模板。该记录不填写真实密钥、真实 webhook URL、真实主机、证书私钥、token 或客户隐私数据，不代表真实环境通知验收完成，Task 8 仍保持 `NOT_READY`。

## 必须完成后才能上线

| 类别 | 当前状态 | 必须完成项 |
| --- | --- | --- |
| 正式鉴权与数据范围 | PARTIAL | 已支持数据库账号、角色、权限码、data scope、基础菜单/部门/岗位、前端菜单权限、服务端签发 HMAC Bearer token、refresh token 哈希存储/刷新/logout 吊销、refresh token 轮换、后端 `AccessControlService` 集中守卫、`@RequirePermission` / `PermissionInterceptor` 入口权限校验、业务 Controller 统一身份参数解析、订单/工序实例/文件/协同订单范围/AI 内部上下文 SQL DataScope 过滤、9D.24 四入口登录页与角色端口校验、prod profile 启动门禁、9D.75 `APP_AUTH_ALLOW_ROLE_FALLBACK=false` 权限码优先模式第一段，以及 GOAL-016 / TASK-017 权限 / DataScope 生产化补强 B；仍需接入 RuoYi-Vue-Pro 完整管理 UI、通用 DataScope SQL 覆盖、生产级 Spring Security/JWT、access token 黑名单和多设备会话策略。 |
| 前端业务页面 | PARTIAL | 已有医生订单读取工作台第一增量、医生下单第一增量、医生订单草稿/补资料第一增量、四入口登录页第一增量、动态表单 CRUD 第一增量、设计稿多文件/多版本第一增量、设计稿预览 URL 聚合第一增量、客服端设计稿审核预览增强第一段、账单物流预览/录入闭环第一增量、付款状态第一段、终检发货拦截第一增量、终检报告第一增量、返工关闭/责任分类第一增量、返工字典第一增量、返工字典后台维护第一增量、终检专用角色 / 附件第一增量、返工通知联动第一增量、复杂返工影响范围第一增量、绩效归因联动第一增量、绩效明细第一增量、绩效标准工时与完整公式口径第一段、返工影响审计可视化第一增量、返工影响筛选第一增量、返工影响图形化第一增量、客服协同闭环第一增量、客服资料缺失提示与 AI 翻译草稿确认第一增量、客服初审第一增量、生产审核第一增量、生产任务入口第一增量、质检工时第一增量、绩效管理第一增量、生产看板第一增量、返工终检第一增量、Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器上传 smoke：订单列表/详情、公开消息、医生可见设计稿、设计稿多文件版本展示、医生设计稿预览链接、客服设计稿预览链接、账单文件绑定、账单预览链接、人工付款状态、账单物流、医生 AI、确认收货、四入口登录、动态表单读取、后台动态表单新增/编辑/停用、返工字典新增/编辑/停用、提交订单、保存草稿、继续编辑/补资料、已完成 file_id 绑定入口、医生端最小 Uppy 文件选择/上传并回填绑定、本地恢复上传、无本地会话候选恢复、中断恢复、105MB 浏览器 Multipart smoke、客服待审列表和通过/驳回表单、客服协同台待审核消息、订单消息上下文、消息通过/驳回、客服资料缺失提示、AI 翻译草稿、人工写入生产备注、内部订单页多文件设计稿上传、客服端设计稿版本列表、生产待审列表、工序链实例化入口、工序实例详情、派工转派、worker 我的任务、入检/出检提交、工时 start/pause/resume/finish、绩效统计快照、绩效责任归因卡片、绩效工时明细、绩效公式版本、标准工时覆盖率、默认绩效分、跨状态生产检索、节点进度、待返工记录、终检出检入口、返工影响节点审计、返工影响筛选、返工影响图、返工关闭入口、返工关闭字典下拉、返工创建/关闭内部通知、返工目标后续节点状态重置、终检报告生成入口和生产看板最小发货入口；本轮已补 `127.0.0.1:5173` 本地登录 CORS、`/form-configs` Vite proxy、医生下单浏览器 smoke、9D.11 草稿提交浏览器 smoke、9D.12 动态表单 CRUD 浏览器 smoke、9D.13 设计稿多文件浏览器 smoke、9D.14 发货前终检门禁、9D.16 终检报告接口/前端入口、9D.17 返工关闭入口、9D.18 返工字典入口、9D.19 返工通知事实、9D.20 返工影响范围后端第一增量、9D.21 绩效归因联动第一增量、9D.22 返工影响审计可视化第一增量、9D.23 返工影响筛选第一增量、9D.24 四入口登录页与真实 Chrome smoke、9D.25 绩效明细第一增量、9D.55 返工字典后台维护第一增量、9D.56 终检专用角色 / 附件第一增量、9D.57 返工影响图形化第一增量、9D.58 客服协同闭环第一增量、9D.59 客服资料缺失提示与 AI 翻译草稿确认第一增量、9D.60 设计稿预览 URL 聚合第一增量、9D.61 账单物流预览/录入闭环第一增量、9D.64 客服端设计稿审核预览增强第一段、9D.73 付款状态第一段、9D.74 绩效公式第一段、9D.99 A/B 类一期范围对齐第一段和 9D.100 A/B 类一期范围对齐第二段；仍缺实时自动保存、真实弱网/跨设备浏览器续传、真实支付系统、真实物流平台、真实电子签章/复杂报告模板、客户/PM 对 CP-004 的正式确认、月度趋势 / 客户排名完整口径、绩效申诉/导出/工资发放。 |
| WebSocket / 通知 | PARTIAL | 已实现 `/ws/connect?token=...` 单实例在线推送，基于 `notification_event` / `user_notification` 派发脱敏 payload，并写 `delivered_at`；已实现通知列表、未读数、单条已读、全部已读 REST 接口、前端通知中心实时刷新、Redis 广播代码路径、AI 预算超限内部通知第一增量、预算通知策略开关第一增量、外部告警待发送事实第一增量、AI 外部告警发送器第一增量、AI 真实外部渠道适配第一增量、AI 外部告警调度器第一增量、AI 外部告警重试/死信第一增量、AI 外部告警幂等/并发领取第一增量、AI 外部告警 webhook 签名/鉴权第一增量、AI 外部告警监控/运维可观察第一增量、AI 外部告警 outbox 列表/筛选第一增量、AI 外部告警失败/死信可见性第一增量、AI 外部告警接收端验签 / 防重放第一段，以及 9D.76 Nginx 通知 REST / WebSocket 生产网关 readiness 第一段；GOAL-014 / TASK-015 已补 `docs/deployment/websocket-notification-production-readiness.md` 和 `check:websocket-notification-readiness-closure` 作为真实环境待验模板。仍需真实双后端实例 Redis 联调、心跳/重连压测、Nginx HTTPS 生产验收、浏览器通知权限、完整业务页面联动、生产 webhook 联调和监控告警。 |
| OpenAPI 契约 | READY_FOR_CURRENT_BASELINE | 当前 path / operation 数量以 `npm run check:openapi` 输出为准；已补唯一 `operationId`、统一 4xx/503/default、关键 DTO/schema、license；9B.8 已补 `/auth/refresh`、`/auth/logout`、`RefreshTokenRequest`、`refreshToken` 和 `refreshExpiresAt`；9D.1 已补 `/orders` 当前实现响应 schema，9D.9 已补 `/reworks` 和 `ReworkRecordResponse`，9D.10 已补 Multipart 文件上传、status 恢复与 pending 候选接口，9D.11 已补 `DRAFT` 外部状态、`UpdateOrderRequest` 和 `PUT /orders/{orderId}` 草稿/补资料契约；9D.12 已补动态表单 `status`、create/update 响应和逻辑停用描述；9D.13 已补设计稿 `file_ids/file_count` 响应；9D.14 已补 `/orders/{orderId}/logistics` 发货前终检 `OUT/PASS` 门禁描述；9D.15 已补 AI 端点 DeepSeek 适配、deterministic fallback 和 AI-3 `SAFE_REFUSAL` 描述；9D.16/9D.56 已补 `/final-inspection-reports`、`/final-inspection-reports/{orderId}`、终检报告 schema、`attachment_file_ids` 和 `final-inspection:manage` 专用权限说明；9D.17 已补 `/reworks/{reworkId}/close` 和 `ReworkCloseRequest`；9D.18 已补 `/reworks/dictionaries` 和 `ReworkDictionariesResponse`；9D.19 已补 `REWORK_CREATED` / `REWORK_CLOSED` 通知事件说明；9D.21 已补 `PerformanceStats` 绩效责任归因字段；9D.22 已补 `ReworkRecordResponse` 返工影响审计字段；9D.23 已补 `/reworks` 的 `has_impacted_nodes` 查询参数；9D.24 已补 `LoginRequest.portal` 登录入口枚举和 `/auth/login` 入口角色匹配说明；9D.25 已补 `/performance/details` 和 `PerformanceDetail` schema；9D.42 已补 `/ai/governance/cost-trend` 和 `AiGovernanceCostTrendResponse`；9D.43 已补 `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED` / `AI_EXTERNAL_ALERT_WEBHOOK_URL` webhook 发送说明；9D.44 已补 `AI_EXTERNAL_ALERT_SCHEDULER_ENABLED` 调度器说明；9D.45 已补 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS` 和 `DEAD_LETTER` 说明；9D.46 已补 `SENDING` 领取态和重复触发不重复外呼说明；9D.47 已补 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED` / `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET` 和 `X-AI-Alert-Signature` HMAC 签名说明；9D.48 已补 `/ai/governance/external-alerts/summary` 和 `AiExternalAlertSummaryResponse`；9D.48.1 已补 `/ai/governance/external-alerts` 和 `AiExternalAlertListResponse`；9D.48.2 已补 `AiExternalAlertRecord.attempts`、脱敏 `last_error` 和 `last_attempted_at`；Swagger validate 与 Redocly lint 通过。后续新增接口必须持续同步。 |
| 文件上传 | PARTIAL | 已实现 MinIO Multipart 初始化、分片签名、status、pending、complete/abort、审计和医生写路径越权拒绝，前端已有最小 Uppy 文件选择/上传、本地恢复上传、服务端候选恢复并回填 `file_id`；`npm run smoke:task9d10-large-upload` 已通过本地 105MB 浏览器上传，`file_id=457` 为 21 个分片完成；`npm run smoke:task9d10-server-resume` 已通过无本地上传会话时复用 pending `file_id=514` 的浏览器 smoke；`npm run smoke:task9d10-interrupted-resume` 已通过第 2 个分片中断后复用同一 `file_id=537` 的浏览器 smoke；9D.67 文件上传限制与 bucket 隔离第一段已补 `FILE_MAX_FILE_SIZE_BYTES`、`FILE_ALLOWED_CONTENT_TYPES`、`FILE_MAX_FILES_PER_ORDER` 服务端校验和医生端选择提示；9D.77 已补本地弱网 / 跨设备恢复 smoke 第一段；9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段已补 `npm run check:task9d78`，检查本地 bucket 与生产占位 bucket 不同、一期 compose 要求外部注入 `MINIO_BUCKET` 和 bucket 隔离记录已回写；9D.79 已补 `docs/acceptance/task-9d79-real-env-file-upload-manual-acceptance.md` 和 `npm run check:task9d79`，提供真实环境人工验收记录模板。仍需真实弱网物理网络、真实跨设备实机、真实测试/正式 bucket 实际创建与账号隔离、客户最终 Multipart 限制签字、真实对象存储联调和客户 / PM 书面确认。 |
| AI 接入 | PARTIAL | 已完成 DeepSeek OpenAI-compatible `/chat/completions` 适配第一增量，默认关闭真实模型，本地/CI 使用 deterministic fallback；9D.94 已补 LangChain4j + DeepSeek 底座对齐第一增量，显式启用 `AI_PROVIDER=langchain-deepseek`、`AI_LANGCHAIN_ENABLED=true`、`AI_LANGCHAIN_PROVIDER=deepseek`、`AI_DEEPSEEK_ENABLED=true` 且外部注入 DeepSeek key 时，AI-1/AI-2/AI-3 公开问答/AI-5 通过 LangChainDeepSeekAiModelClient 调用 DeepSeek，AI-3 内部问题继续本地 `SAFE_REFUSAL`；9D.26 到 9D.48.2 已补限流、成本审计、模型重试、失败审计、治理摘要、预算阈值、预算跨线审计、预算超限内部通知第一增量、预算通知策略开关第一增量、预算熔断/降级第一增量、外部告警待发送事实第一增量、分角色预算第一增量、分模型预算第一增量、提示词版本审计、输出防护第一增量、外部告警发送器第一增量、成本趋势第一增量、AI 真实外部渠道适配第一增量、AI 外部告警调度器第一增量、AI 外部告警重试/死信第一增量、AI 外部告警幂等/并发领取第一增量、AI 外部告警 webhook 签名/鉴权第一增量、AI 外部告警监控/运维可观察第一增量、AI 外部告警 outbox 列表/筛选第一增量和 AI 外部告警失败/死信可见性第一增量。预算跨线后默认给 ACTIVE ADMIN / CS 写 `AI_BUDGET_EXCEEDED` 内部通知；`AI_BUDGET_NOTIFICATION_ENABLED=false` 时只保留治理审计；`AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 且全局预算已超限时不外呼真实模型，返回 deterministic fallback 并写 `AI_BUDGET_CIRCUIT_OPEN`；配置角色预算且当前角色已超限时写 `AI_BUDGET_ROLE_CIRCUIT_OPEN`；配置 DeepSeek 模型预算且当前模型已超限时写 `AI_BUDGET_MODEL_CIRCUIT_OPEN`；输出防护命中时写 `AI_OUTPUT_GUARDED`；预算事件新增 `ai_external_alert_outbox.send_status=PENDING`，9D.41 可推进到 `SENT/FAILED` 并记录 `attempts/last_error`；9D.42 可通过 `/ai/governance/cost-trend` 查看成功调用按日成本趋势；9D.43 默认仍 dry-run，显式启用 `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=true` 且配置 `AI_EXTERNAL_ALERT_WEBHOOK_URL` 后会 POST webhook；9D.44 默认不自动调度，显式启用 `AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=true` 后才按批次触发 sender；9D.45 webhook 失败未达 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS` 时保持 `PENDING`，达到上限进入 `DEAD_LETTER`；9D.46 sender 先领取 `PENDING -> SENDING` 后外呼，避免重复触发或并发 sender 重复发送同一条 outbox；9D.47/9D.71 默认不签名，显式启用 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED=true` 并注入 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET` 后会发送 timestamp / nonce / signature；9D.71 新增默认关闭的 `/ai/external-alerts/receive` 接收端验签 / 防重放验收桩，显式启用 `AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED=true` 并注入 `AI_EXTERNAL_ALERT_RECEIVER_SIGNING_SECRET` 后校验时间窗、nonce 和 HMAC；9D.48 可通过 `/ai/governance/external-alerts/summary` 查看 outbox 状态分布、最近失败/死信错误和最老待发送时间；9D.48.1 可通过 `/ai/governance/external-alerts` 筛选安全元数据列表；9D.48.2 可查看 FAILED / DEAD_LETTER 的 `attempts`、脱敏 `last_error` 和 `last_attempted_at`；9D.80 已补 AI 真实 key / 生产 webhook 联调记录模板第一段；9D.98 已补 AI-5 生产备注默认模板、知识上下文说明和人工确认写入链路。仍需真实 key 环境联调、生产 webhook 联调、客户 / PM 生产备注模板最终确认、提示词后台管理、流式输出过滤、RAG / tool calling 如需、生产级成本看板、更完整输出策略和客户 / PM 书面确认；复测 AI-3 越权。 |
| 部署基础设施 | PARTIAL | 9D.69 已补一期后端/前端 Dockerfile、Nginx `/api/` 和 `/ws/` 代理、full-stack compose 示例、生产 env 占位示例、Docker/env 隔离说明、`npm run check:task9d69` 和 `npm run compose:phase-one:config`；prod profile 仍要求 `APP_AUTH_TOKEN_SECRET` 外部注入且关闭 bootstrap headers；9D.81 已补 `docs/deployment/task-9d81-production-deployment-acceptance.md` 和 `npm run check:task9d81`，提供真实部署 smoke / HTTPS / 备份监控验收记录模板。仍缺真实服务器部署、HTTPS、镜像仓库、测试/正式环境真实联调、数据库备份恢复演练、日志留存、监控告警、发布回滚和客户 / PM 书面确认。 |
| 订单主链路 | PARTIAL | 已有医生订单读取、公开协同信息、医生 AI、确认收货、医生提交订单、医生保存草稿、继续编辑/补资料、Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、上传中断后恢复浏览器 smoke、100MB+ 浏览器上传 smoke、客服初审、客服协同、客服资料缺失提示、设计稿预览、设计稿真实签名 URL 上传、设计稿版本绑定、设计稿客服审核、客服设计稿预览 URL 获取、医生设计稿预览 URL 获取和确认、账单文件绑定、账单真实签名 URL 上传、账单绑定、医生账单预览 URL 获取、终检前发货门禁断言、剩余工序节点完成、物流发货、医生确认收货、出检失败、返工记录、目标节点重做、返工关闭、生产审核、工序实例详情、派工、worker 任务池、入检/出检、工时、绩效、绩效归因联动第一增量、绩效明细第一增量、返工影响审计可视化第一增量、返工影响筛选第一增量、返工影响图形化第一增量、生产看板、返工终检页面级第一增量、返工关闭/责任分类第一增量、返工字典第一增量、返工通知联动第一增量、复杂返工影响范围第一增量、发货前终检 `OUT/PASS` 门禁第一增量、终检报告第一增量、终检专用角色 / 附件第一增量、终检 PDF/签名第一段、12 步入口 smoke、固定演示数据前 3 步、首个派工节点工序操作数据动作、设计稿确认数据动作、账单/物流第一段数据动作、终检后发货/确认收货第一段数据动作和返工异常路径数据动作；仍需补实时自动保存、真实弱网/跨设备浏览器续传、绩效完整公式/周期/申诉、真实电子签章/复杂报告模板、付款状态和真实物流平台。 |
| 生产规则 | PARTIAL | 已补返工关闭、责任类型留痕、返工字典后台维护第一增量、返工创建/关闭内部通知、复杂返工影响范围第一增量、绩效归因联动第一增量、绩效明细第一增量、绩效周期筛选第一段、绩效标准工时与完整公式口径第一段、返工影响审计可视化第一增量、返工影响筛选第一增量和返工影响图形化第一增量；仍需补标准工时配置、客户/PM 公式确认、绩效申诉/导出/工资发放和生产通知联动。 |
| 操作手册 | PARTIAL | 9D.70 已补医生端、客服端、生产端、管理端最小操作手册、首版故障处理清单和交付材料索引；仍缺正式客户培训签收、真实生产部署手册、备份恢复演练、日志留存、监控告警和发布回滚手册。 |
| 客户 / PM 确认项 | BLOCKED | 9D.72 已补 `docs/acceptance/phase-one-customer-pm-confirmations.md` 第一段，逐项记录付款状态口径、动态表单最终字段、AI-5 模板、标准工时、Multipart 限制、真实电子签章、真实物流、客户培训签收和真实环境上线边界；仍需客户 / PM 书面确认后才能关闭。 |
| PRD V2.0 本地功能差异 | PARTIAL | 9D.82 已补 `docs/acceptance/prd-v2-gap-matrix.md`，2026-07-06 基准已补 `docs/acceptance/phase-one-scope-baseline-20260706.md`，9D.83 已补患者管理基础版，9D.84 已补人工支付流水，9D.85 已补客户 / 诊所档案与偏好，9D.86 已补人员档案 / 工作量看板，9D.87 已补质量记录 CRUD / 外返登记第一增量，PRD V2 本地功能差异收口 B 已补 `quality_record` 独立事实表和状态工作流第一段，9D.88 已补客服订单 / 沟通完整可见性 smoke，9D.89 已补医生账户设置基础闭环，9D.90 已补产品参数 / 价格体系一期最小后台，9D.91 已补客服配送管理页 / 物流异常跟进，9D.92 已补 AI-2 客服查询入口，9D.93.1 已保留医生文件模块不独立开发和 AI 使用 LangChain + DeepSeek 的判断，9D.94 已补 LangChain + DeepSeek AI 底座对齐第一增量，9D.95.1-9D.95.5 作为 C 类基础台账 / 基础登记 / 状态更新证据保留，9D.96 已补医生提交前 AI-4 自动资料缺失检查，9D.97 已补 AI-2 引用数据说明，9D.98 已补 AI-5 生产备注客户模板 / 知识上下文补强第一增量，9D.99 已补 A/B 类一期范围对齐第一段；质量记录完整编辑/删除、客户最终质量口径、A/B 类真实数据闭环、真实 AI 环境联调和客户 / PM 确认仍需继续关闭。 |

PRD V2 本地功能差异收口 C readiness 说明：GOAL-009 / TASK-010 已把 AI-2 `attachment_contexts` 附件预览上下文、客服端 `/ai/cs` 展示、OpenAPI `AiAttachmentContext` 和 `check:prd-v2-gap-closure-c` 纳入当前 evidence。`frontend-business-pages`、`ai-production-governance`、`prd-v2-local-feature-gaps` 和校正后的 `customer-pm-confirmations` 均保持 PARTIAL。Task 8 仍保持 `NOT_READY`；真实 key / webhook 和真实环境验收仍待执行，RAG / tool calling 不属于一期 P0。

PRD V2 本地功能差异收口 D readiness 说明：GOAL-010 / TASK-011 已把 `/dashboards/phase-one-ab`、本地月度趋势 / 客户排名、客服 / 生产工作台消费、OpenAPI `PhaseOneAbDashboardResponse` 和 `check:prd-v2-gap-closure-d` 纳入当前 evidence。`frontend-business-pages`、`prd-v2-local-feature-gaps` 和校正后的 `customer-pm-confirmations` 继续保持 PARTIAL；真实支付 / 物流 API 属二期，不阻塞一期。Task 8 仍保持 `NOT_READY`，因为本地 P0、安全和真实环境验收仍未关闭。

## 环境变量与密钥边界

- 仓库只保留 `.env.example` 占位值，禁止提交真实密钥。
- 正式环境必须外部注入以下变量：数据库账号密码、Redis、MinIO access/secret、DeepSeek API Key、`APP_AUTH_TOKEN_SECRET` 或正式 JWT 密钥、`APP_AUTH_REFRESH_TOKEN_TTL_SECONDS`、AI 外部 webhook URL、AI 外部 webhook signing secret、HTTPS 证书路径或托管配置。
- DeepSeek 第一增量默认 `AI_PROVIDER=deterministic`、`AI_DEEPSEEK_ENABLED=false`；测试/正式环境启用真实模型时必须通过外部密钥系统注入 `DEEPSEEK_API_KEY`，不得把真实 key 写入 `.env.example`、README、测试或代码。
- AI 外部 webhook 第一增量默认 `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=false`、`AI_EXTERNAL_ALERT_WEBHOOK_URL=`；测试/正式环境启用时只能通过部署平台安全配置 webhook URL，不得把带密钥或客户信息的真实 URL 提交到仓库。
- AI 外部 webhook 签名第一增量默认 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED=false`、`AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET=`；测试/正式环境启用时只能通过部署平台安全配置 signing secret，不得把真实 secret 提交到仓库。
- AI 外部 webhook 接收端验签 / 防重放第一增量默认 `AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED=false`、`AI_EXTERNAL_ALERT_RECEIVER_SIGNING_SECRET=`；测试/正式环境启用时只能通过部署平台安全配置 receiver signing secret，并按需要设置 `AI_EXTERNAL_ALERT_RECEIVER_REPLAY_WINDOW_SECONDS`，不得把真实 secret 提交到仓库。

## 9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段

9D.78 已新增 `docs/acceptance/task-9d78-bucket-isolation-readiness.md` 和 `npm run check:task9d78`。当前检查确认 `.env.example` 只保留本地开发 bucket，`deploy/env/phase-one.prod.example` 只保留正式环境 bucket 占位示例，`deploy/docker-compose.phase-one.yml` 要求外部注入 `MINIO_BUCKET`。本轮不接真实生产对象存储，不提交真实 MinIO 密钥、真实 bucket 名称或生产 URL。真实测试 / 正式 bucket 创建、对象存储账号隔离、真实网络访问和客户 / PM 确认仍未关闭，Task 8 仍保持 `NOT_READY`。

## 9D.79 真实环境文件上传人工验收记录模板第一段

9D.79 已新增 `docs/acceptance/task-9d79-real-env-file-upload-manual-acceptance.md` 和 `npm run check:task9d79`。当前模板覆盖真实测试环境 / 正式环境基本信息、测试 bucket、正式 bucket、对象存储账号隔离、文件大小 / 类型 / 数量限制、100MB+ 上传、弱网中断、跨设备恢复、越权读取、bucket 写入位置和客户/PM 签字状态。本轮只提供可填写模板，不填写真实密钥，不代表真实环境已验收，不代表生产对象存储已联调完成；真实环境字段仍为 `待填写` 或 `待确认`。Task 8 仍保持 `NOT_READY`。

## 9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段

9D.80 已新增 `docs/acceptance/task-9d80-ai-production-integration-acceptance.md` 和 `npm run check:task9d80`。当前模板覆盖 DeepSeek key 外部注入、`AI_PROVIDER=deepseek`、`AI_DEEPSEEK_ENABLED=true`、`DEEPSEEK_API_KEY`、生产 webhook、`AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=true`、发送侧签名、接收端验签 / 防重放、预算熔断、输出防护、审计留痕和客户/PM 签字状态。本轮只提供可填写模板，不填写真实密钥，不填写真实 webhook URL，不代表真实 key 已联调完成，不代表生产 webhook 已联调完成；真实环境字段仍为 `待填写` 或 `待确认`。Task 8 仍保持 `NOT_READY`。

## 9D.81 部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段

9D.81 已新增 `docs/deployment/task-9d81-production-deployment-acceptance.md` 和 `npm run check:task9d81`。当前模板覆盖 Docker Compose、Nginx、HTTPS、镜像仓库、`APP_AUTH_TOKEN_SECRET`、`MINIO_ACCESS_KEY`、`DEEPSEEK_API_KEY`、数据库备份、备份恢复演练、日志留存、监控告警、发布回滚和客户/PM 签字状态。本轮只提供可填写模板，真实密钥必须外部注入，不填写真实密钥，不填写真实服务器地址，不代表真实服务器已部署完成，不代表 HTTPS 已验收完成；真实环境字段仍为 `待填写` 或 `待确认`。Task 8 仍保持 `NOT_READY`。
- AI 外部告警调度器第一增量默认 `AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false`；测试/正式环境确认 webhook、重试、死信、幂等领取和监控策略后，才可显式启用并配置 `AI_EXTERNAL_ALERT_SCHEDULER_BATCH_SIZE`、`AI_EXTERNAL_ALERT_SCHEDULER_FIXED_DELAY_MILLIS`、`AI_EXTERNAL_ALERT_SCHEDULER_INITIAL_DELAY_MILLIS` 和 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS`。
- 正式环境必须使用 `spring.profiles.active=prod`，通过 `application-prod.yml` 和启动校验固定关闭本地烟测 header 与角色兜底权限；如果 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=true`、`APP_AUTH_ALLOW_ROLE_FALLBACK=true` 或 `APP_AUTH_TOKEN_SECRET` 仍是本地占位值，后端应启动失败。
- 测试环境和正式环境必须使用不同数据库、不同 MinIO bucket、不同对象存储凭据。
- 9D.67 后，文件上传限制由 `FILE_MAX_FILE_SIZE_BYTES`、`FILE_ALLOWED_CONTENT_TYPES` 和 `FILE_MAX_FILES_PER_ORDER` 外部配置；测试环境和正式环境必须分别设置独立 `MINIO_BUCKET`，不得共用生产对象存储凭据。

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
npm run check:task9d66
npm run check:task9d67
npm run check:task9d68
npm run check:task9d69
npm run check:task9d70
npm run check:task9d71
npm run check:task9d72
npm run check:task9d73
npm run check:task9d74
npm run check:task9d75
npm run check:task9d76
npm run check:task9d77
npm run check:task9d91
npm run check:task9d92
npm run check:task9d93
npm run check:task9d94
npm run check:task9d95
npm run check:task9d954
npm run check:task9d955
npm run check:task9d96
npm run smoke:task9d62
npm run smoke:task9d10-large-upload
npm run smoke:task9d10-server-resume
npm run smoke:task9d10-interrupted-resume
npm run smoke:task9d77-file-upload-resilience
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml test
git diff --check
```

## 上线前人工验收

- 按 `docs/acceptance/prd-v2-38-item-acceptance-audit-20260715.md` 关闭本地 `PARTIAL` / `MISSING`，并在真实条件下完成 `EXTERNAL_ACCEPTANCE`；不再使用“客户逐项签字豁免”替代未完成代码。
- 用 Bearer token / 正式账号体系而不是 `X-Bootstrap-*` 复测医生端脱敏、文件越权、AI-3 越权、检查记录、派工/转派、WORKER 绩效范围。
- 复测后台动态表单创建、编辑、停用和医生端只读 `ACTIVE` 字段，客户最终字段清单确认前不要视为完整上线验收。
- 用浏览器完成 PRD 12 步主链路，保留截图、订单号、日志和数据库核验记录。
- 按 `docs/deployment/task-9d81-production-deployment-acceptance.md` 填写真实部署 smoke、HTTPS、Nginx、Docker Compose、数据库备份、备份恢复、日志留存、监控告警和发布回滚记录；当前模板不代表真实部署已完成。
- 对 100MB+ STL 文件继续做真实弱网限速/断网和跨设备浏览器续传验收；当前中断恢复 smoke 已覆盖本地第 2 分片失败后的同浏览器续传，9D.77 已补本地双 browser context 的弱网 / 跨设备恢复第一段，9D.79 已提供真实环境人工验收记录模板。
- 对 WebSocket 做在线推送、离线未读补偿、已读同步、多实例广播和网关代理验收。
- 对客服配送管理做人工异常跟进验收：CS / ADMIN 可在 `/delivery` 查看配送列表、按物流状态筛选、记录异常 / 跟进中 / 已解决，医生端物流详情不得返回内部跟进说明；真实 DHL / FedEx / 顺丰 API、电子面单、自动轨迹同步、签收回调和物流平台 webhook 仍需另行真实环境验收。
- 对 AI-2 客服查询助手做客服端入口验收：CS / ADMIN 可在 `/ai/cs` 输入订单 ID 和问题，调用 `/ai/cs-query` 返回内部只读草稿；结果不得自动发送给医生、不得自动写入订单，真实 key 环境和客户 / PM 口径确认仍需另行验收。
- 对 AI 预算通知做 ADMIN / CS 收件、DOCTOR / WORKER 隔离、`AI_BUDGET_NOTIFICATION_ENABLED=false` 策略开关、`AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 全局/角色/模型预算熔断降级、`AI_BUDGET_ROLE_CIRCUIT_OPEN`、`AI_BUDGET_MODEL_CIRCUIT_OPEN`、`AI_OUTPUT_GUARDED`、`prompt_version`、`ai_external_alert_outbox` 外部告警待发送事实、`SENT/FAILED/DEAD_LETTER`、`SENDING` 领取态、`attempts/last_error`、`/ai/governance/cost-trend` 成本趋势、`/ai/governance/external-alerts/summary` 监控摘要、`/ai/governance/external-alerts` 列表筛选和失败/死信只读可见性、`AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=true` webhook 发送/失败留痕、`AI_EXTERNAL_ALERT_MAX_ATTEMPTS` 重试/死信、`AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED=true` timestamp / nonce 签名头、`AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED=true` 接收端验签 / 防重放验收桩、真实 key 环境联调验收；当前 9D.43 已完成 webhook 第一增量，调度器第一增量已由 9D.44 补齐，重试/死信第一增量已由 9D.45 补齐，幂等/并发领取第一增量已由 9D.46 补齐，签名/鉴权第一增量已由 9D.47 补齐，监控摘要第一增量已由 9D.48 补齐，列表筛选第一增量已由 9D.48.1 补齐，失败/死信可见性第一增量已由 9D.48.2 补齐，接收端验签 / 防重放第一段已由 9D.71 补齐，真实 key / 生产 webhook 联调记录模板第一段已由 9D.80 补齐，仍缺真实 key 与生产 webhook 实际联调、流式输出过滤、提示词后台管理和生产级联调。

## 9D.77 文件上传弱网 / 跨设备验收第一段

9D.77 已补 `npm run check:task9d77` 和 `npm run smoke:task9d77-file-upload-resilience`，用两个 Playwright browser context 模拟设备 A 弱网断网、设备 B 无 localStorage 后通过服务端 pending Multipart 候选恢复同一 `file_id`。本轮不代表真实弱网物理网络、真实跨设备实机、客户 Multipart 限制签字或测试/正式 bucket 实际隔离完成。Task 8 仍保持 NOT_READY。

## 9D.91 客服配送管理页 / 物流异常跟进第一增量

9D.91 已补 `npm run check:task9d91`、`/logistics/orders`、`/orders/{orderId}/logistics/exception` 和客服端 `/delivery` 配送管理页。CS / ADMIN 可人工查看配送列表、筛选物流状态并记录内部异常跟进；医生端物流详情不返回内部跟进说明，医生不能写入异常跟进。本轮不新增迁移，不接真实物流 API、电子面单、自动轨迹同步、签收回调、物流平台 webhook 或真实物流密钥。Task 8 仍保持 NOT_READY。

## 9D.92 AI-2 客服查询助手完整入口第一增量

9D.92 已补 `npm run check:task9d92` 和客服端 `/ai/cs` 查询助手入口，复用既有 `/ai/cs-query` 后端能力。CS / ADMIN 可输入订单 ID 和问题生成内部只读草稿，页面明确对外发送前需人工确认。本轮不新增后端接口、不接真实 key、不自动外发、不自动写订单。Task 8 仍保持 NOT_READY。

## 9D.93.1 PRD V2 范围纠偏第一闭环

9D.93.1 已补 `npm run check:task9d93`，医生端独立 `/doctor/files` / `doctor-files` 入口仍移除；病例、口扫、图片、处方和设计稿文件继续归入医生订单链路。2026-07-06 基准覆盖旧 C 类判断：设备 / 物料 / 安环 / 成本 / 奖惩保留现有基础台账、基础登记、状态更新和汇总能力，不再继续补完整编辑、历史、完整审批、真实趋势或完整管理闭环作为一期本地必做。所有 AI 智能体使用 LangChain + DeepSeek 实现。Task 8 仍保持 NOT_READY。

## 9D.94 LangChain + DeepSeek AI 底座对齐第一增量

9D.94 已补 `npm run check:task9d94`、LangChain4j 依赖、`AI_LANGCHAIN_ENABLED=false` 默认关闭配置、`AI_PROVIDER=langchain-deepseek` 显式 provider、`LangChainDeepSeekAiModelClient` 和目标后端测试。当前证据覆盖 AI-1 / AI-2 / AI-3 公开查询 / AI-5 在显式启用 LangChain + DeepSeek 时经 LangChain4j 调用 DeepSeek，AI-3 内部问题仍本地 `SAFE_REFUSAL` 且不外呼。本轮不提交真实 key，不做生产真实联调，不补流式输出、RAG、复杂 agent tool calling、提示词后台、AI-2 知识上下文补强或 AI-4 提交前自动触发体验。Task 8 仍保持 NOT_READY。

## 9D.95 设备 / 物料 / 安环 / 成本 / 奖惩基础台账拆解记录

9D.95 已保留 `docs/acceptance/phase-one-production-support-closure-plan.md` 作为历史拆解和基础能力索引。当前证据说明 9D.50-9D.54 只读汇总和 9D.95.1 设备台账 / 设备事件录入、9D.95.2 物料异常登记 / 处理状态、9D.95.3 安环巡检 / 隐患整改、9D.95.4 成本记录维护 / 趋势口径、9D.95.5 奖惩记录 / 审批状态均为 C 类基础能力。本轮不新增接口、不新增迁移、不做 CRUD，不接 IoT、真实财务系统、工资发放或复杂审批平台。Task 8 仍保持 NOT_READY。

## 9D.95.1 设备台账 / 设备事件录入第一增量

9D.95.1 已补 `npm run check:task9d951`，后端新增设备台账和设备事件人工登记接口，生产端设备管理页新增“登记设备”和“登记事件”最小表单。目标测试覆盖 WORKER 可写、DOCTOR 403、故障事件进入设备汇总。本轮不新增迁移，不接 IoT，不做保养审批流、复杂设备履历或真实设备联网。Task 8 仍保持 NOT_READY；下一步推荐 9D.95.2 物料异常登记 / 处理状态第一增量。

## 9D.95.2 物料异常登记 / 处理状态第一增量

9D.95.2 已补 `npm run check:task9d952`，后端新增物料异常人工登记和处理状态更新接口，生产端物料异常页新增“登记物料异常”和“更新处理状态”最小表单。目标测试覆盖 WORKER 登记、ADMIN 更新关闭、DOCTOR 403 和汇总变化。本轮不新增迁移，不接库存扣减、采购补料、供应商协同或 WMS。Task 8 仍保持 NOT_READY；下一步推荐 9D.95.3 安环巡检 / 隐患整改第一增量。

## 9D.95.3 安环巡检 / 隐患整改第一增量

9D.95.3 已补 `npm run check:task9d953`，后端新增安环事件人工登记和整改状态更新接口，生产端安环管理页新增“登记安环事件”和“更新整改状态”最小表单。目标测试覆盖 WORKER 登记、ADMIN 更新关闭、DOCTOR 403 和汇总变化。本轮不新增迁移，不接真实环境采集硬件、PPE 发放系统或完整安环审批流。Task 8 仍保持 NOT_READY；下一步推荐 9D.95.4 成本记录维护 / 趋势口径第一增量。

## 9D.95.4 成本记录维护 / 趋势口径第一增量

9D.95.4 已补 `npm run check:task9d954`，后端新增成本记录人工登记接口，生产端成本管理页新增“登记成本记录”最小表单。目标测试覆盖 WORKER 登记、DOCTOR 403 和汇总变化。本轮不新增迁移，不接真实财务系统、发票、付款、对账或自动成本分摊。Task 8 仍保持 NOT_READY；随后已推进 9D.95.5 奖惩记录 / 审批状态第一增量。

## 9D.95.5 奖惩记录 / 审批状态第一增量

9D.95.5 已补 `npm run check:task9d955`，后端新增奖惩记录人工登记和审批状态更新接口，生产端奖惩管理页新增“登记奖惩记录”和“更新审批状态”最小表单。目标测试覆盖 WORKER 登记、ADMIN 更新审批状态、DOCTOR 403 和汇总变化。本轮不新增迁移，不作为工资发放结果，不做绩效申诉闭环、薪酬结算或复杂审批引擎。Task 8 仍保持 NOT_READY；随后已推进医生提交前 AI-4 资料缺失自动触发体验。

## 9D.96 医生提交前 AI-4 资料缺失自动触发体验第一增量

9D.96 已补 `npm run check:task9d96`，医生端提交订单 / 补资料前先保存草稿并自动调用 `/ai/check-missing`；缺失时展示“AI-4 资料缺失检查”和缺失清单，阻断正式提交。目标检查覆盖前端状态、调用路径、提示文案、文档和 acceptance 回写。本轮不新增后端接口，不做 AI 自动驳回订单，不接真实 DeepSeek key。Task 8 仍保持 NOT_READY；随后已推进 AI-2 客服查询引用数据说明 / 知识上下文补强。

## 9D.97 AI-2 客服查询引用数据说明 / 知识上下文补强第一增量

9D.97 已补 `npm run check:task9d97`，`/ai/cs-query` 响应新增 `reference_data_notes`，后端按客服权限范围汇总订单基础、生产上下文、沟通消息、附件、账单和物流只读来源说明；客服端 `/ai/cs` 展示“引用数据说明”。目标测试覆盖 CS / ADMIN 查询返回可审计来源说明。本轮不新增数据库迁移，不接真实 DeepSeek key，不做 RAG / tool calling，不自动发送消息，不自动写入订单、生产备注或客服沟通记录。Task 8 仍保持 NOT_READY；随后 PRD V2 本地功能差异收口 C 已推进 AI-2 `attachment_contexts` 附件预览上下文第一段。

## PRD V2 本地功能差异收口 C

GOAL-009 / TASK-010 已补 `npm run check:prd-v2-gap-closure-c`，`/ai/cs-query` 响应新增 `attachment_contexts`，后端按当前订单聚合已完成附件并通过既有 `FileResourceService.createPreviewUrl` 生成短时效预览 URL；客服端 `/ai/cs` 展示“附件预览上下文”；OpenAPI 新增 `AiAttachmentContext`。本轮不新增迁移，不接真实 DeepSeek key，不接真实 webhook，不做 RAG / tool calling，不自动发送消息，不自动写入订单或客服沟通记录，不向医生暴露内部附件上下文。客户 AI-2 口径、真实 key 环境和真实环境验收仍未关闭，Task 8 仍保持 `NOT_READY`。

## PRD V2 本地功能差异收口 D

GOAL-010 / TASK-011 已补 `npm run check:prd-v2-gap-closure-d`，新增 `/dashboards/phase-one-ab` 本地月度趋势 / 客户排名聚合接口，后端按既有身份与 DataScope 约束返回 current-month / previous-month 汇总、月度差值、Top 客户、生产异常、待问异常、出货率和完成率；客服 / 生产工作台消费该聚合；OpenAPI 新增 `PhaseOneAbDashboardResponse`、`PhaseOneAbMonthSummary` 和 `PhaseOneAbCustomerRanking`。本轮不新增真实外部平台接入，不做真实账期逾期，不把本地聚合写成客户最终统计口径，不替代客户签字或真实环境验收。Task 8 仍保持 `NOT_READY`。

## 9D.98 AI-5 生产备注客户模板 / 知识上下文补强第一增量

9D.98 已补 `npm run check:task9d98`，`/ai/production-note` 响应新增 `template_version=PHASE_ONE_DEFAULT_V1`、`knowledge_context_notes` 和 `requires_customer_template_confirmation`，明确默认模板不是客户最终模板；新增 `/ai/production-note/confirm`，CS / WORKER / ADMIN 在订单数据范围内人工确认后才追加写入 `orders.production_note` 并写 AI 审计；客服初审页新增 AI-5 草稿、上下文说明和人工确认写入入口。本轮不新增迁移，不接真实 DeepSeek key，不伪装真实客户模板或客户签字，不自动下发生产指令。客户模板仍待客户 / PM 最终确认；Task 8 仍保持 `NOT_READY`。
