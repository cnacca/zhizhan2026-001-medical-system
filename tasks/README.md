# Tasks

## 当前里程碑

任务 8：专项验收矩阵与上线准备。

当前目标是清理上线前硬缺口：已完成 readiness audit、OpenAPI 二次契约、Bearer 身份基线、后端权限守卫、数据库化 RBAC/DataScope 基础、权限注解/统一拦截器、订单/工序实例 DataScope SQL 第一增量、文件/协同/AI DataScope 扩展、菜单/部门/岗位/前端权限路由第一增量、生产鉴权启动门禁第一增量、Refresh Token/logout 第一增量、WebSocket 通知第一增量、通知未读/已读第一增量、通知实时前端/Redis 广播第一增量、医生订单工作台第一增量、医生下单/动态表单第一增量、客服初审第一增量、生产审核第一增量、生产任务入口第一增量、质检工时第一增量、绩效管理第一增量、生产看板第一增量、返工终检第一增量、Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke、100MB+ 浏览器上传 smoke、医生订单草稿/补资料第一增量、动态表单 CRUD 第一增量、设计稿多文件多版本第一增量、终检发货拦截第一增量、真实 DeepSeek 接入第一增量、终检报告第一增量、返工关闭/责任分类第一增量、返工字典第一增量、返工通知联动第一增量、复杂返工影响范围第一增量、绩效归因联动第一增量、返工影响审计可视化第一增量、返工影响筛选第一增量、四入口登录页第一增量、绩效明细第一增量、AI 调用限流第一增量、AI 成本审计第一增量、AI 模型重试第一增量、AI 模型失败审计第一增量、AI 治理摘要第一增量、AI 预算阈值第一增量、AI 预算超限审计第一增量、AI 预算超限内部通知第一增量、AI 预算通知策略开关第一增量、AI 预算熔断/降级第一增量、AI 预算外部告警待发送事实第一增量、AI 分角色预算第一增量、AI 分模型预算第一增量、AI 提示词版本与输出防护第一增量、AI 外部告警发送器第一增量、AI 成本趋势第一增量、AI 真实外部渠道适配第一增量、AI 外部告警调度器第一增量、AI 外部告警重试/死信第一增量、AI 外部告警幂等/并发领取第一增量、AI 外部告警 webhook 签名/鉴权第一增量、生产端质量与返工汇总后端适配第一增量、生产端设备管理汇总后端适配第一增量、生产端物料异常汇总后端适配第一增量、生产端安环管理汇总后端适配第一增量、生产端成本管理汇总后端适配第一增量和生产端奖惩管理汇总后端适配第一增量。生产端新增展示模块第一轮真实汇总接口已收口；后续优先补演示种子数据、录入/审批/CRUD 闭环，或转回 9D.48 AI 外部告警监控/运维可观察第一增量。

当前计划已按 TRD V1.1 深度研究优化版和 2026-07 新版资料差异重排。任务 0、0.1、1、2、3、4、5A、5B、6、7、8A、8B、9A 已完成；9B.1 到 9B.8、9C.1 到 9C.3、9D.1 到 9D.25 第一增量已完成；任务 8 总体仍进行中，正式上线缺口未完成。

2026-07-01 已确认新版 PRD/TRD/API 的默认对齐策略：以新资料为最新业务准绳，保留当前仓库已验证增量，OpenAPI 后续按“新版 API 业务口径 + 当前已实现增量”合并维护。草稿/补资料闭环、Refresh Token/logout、动态表单 CRUD 第一增量、设计稿多文件多版本第一增量、终检发货拦截第一增量、真实 DeepSeek 接入第一增量、终检报告第一增量、返工关闭/责任分类第一增量、返工字典第一增量、返工通知联动第一增量、复杂返工影响范围第一增量、绩效归因联动第一增量、返工影响审计可视化第一增量、返工影响筛选第一增量、四入口登录页第一增量和绩效明细第一增量已完成；后续优先级调整为：绩效周期筛选 / 返工影响图形化 -> 生产级 AI 治理 -> 生产部署与弱网验收。

## 当前交接摘要

- 2026-07-01 已确认上传基线为 `feature/project-skeleton`，本地分支与 `origin/feature/project-skeleton` 对齐。
- 当前上传基线包含 9D.10 的同浏览器恢复、服务端 pending 候选恢复、上传中断后恢复和 100MB+ 浏览器上传 smoke；不包含后续未提交的返工关闭、发货拦截、责任分类、跨设备恢复 smoke 或限速上传 smoke。
- Task 8 仍是 `in-progress / NOT READY`，不要标完成。
- 9D.24 四入口登录页与角色端口校验第一增量已完成；登录页展示医生端、客服端、生产端、管理端四入口，登录请求携带 `portal`，后端拒绝账号角色与所选入口不匹配的登录。
- 9D.47 AI 外部告警 webhook 签名/鉴权第一增量已完成；下一轮唯一推荐目标是 9D.48 AI 外部告警监控/运维可观察第一增量。
- 9D.49 生产端质量与返工汇总后端适配第一增量已完成；新增 `/production/quality/summary`，生产/客服/管理可读，医生端拒绝；前端生产端质量总览已接真实汇总，明确展示内返率和外返率。
- 9D.50 生产端设备管理汇总后端适配第一增量已完成；新增 `/production/equipment/summary`，生产/客服/管理可读，医生端拒绝；前端生产端设备管理已接真实汇总，展示设备台账、设备状态、保养计划、故障报修、停机时长和设备稼动率。
- 9D.51 生产端物料异常汇总后端适配第一增量已完成；新增 `/production/material-exceptions/summary`，生产/客服/管理可读，医生端拒绝；前端生产端物料异常已接真实汇总，展示缺料、错料、批次异常、材料损耗、处理状态和责任归属。
- 9D.52 生产端安环管理汇总后端适配第一增量已完成；新增 `/production/safety-environment/summary`，生产/客服/管理可读，医生端拒绝；前端生产端安环管理已接真实汇总，展示安全巡检、隐患整改、环境记录、PPE/设备安全提醒、安环事件统计和高风险待办。
- 9D.53 生产端成本管理汇总后端适配第一增量已完成；新增 `/production/cost-management/summary`，生产/客服/管理可读，医生端拒绝；前端生产端成本管理/外协成本已接真实汇总，展示工序成本、材料成本、人工成本、返工成本、外协成本和成本异常预警。
- 9D.54 生产端奖惩管理汇总后端适配第一增量已完成；新增 `/production/reward-penalty/summary`，生产/客服/管理可读，医生端拒绝；前端生产端奖惩管理已接真实汇总，展示奖惩记录、奖惩原因、关联对象、审批状态、月度汇总和绩效影响。
- 继续开发前先复核 `STATUS.md`、`docs/acceptance/task-8-acceptance-matrix.md` 和 `docs/deployment/readiness-checklist.md`，并按 TDD 先补红灯测试。
- 本轮 9D.25 状态：completed-first-increment；已通过 TDD 后端测试、Check/Worklog 模块回归、OpenAPI、frontend build、acceptance 和静态检查。本轮新增 `/performance/details` 绩效工时明细接口，并在绩效页展示最近完成明细。未完成原因：仍缺终检专用角色/附件、绩效完整公式/周期筛选/标准工时配置/申诉闭环、返工影响图形化、生产级 AI 治理、设计稿预览 URL 聚合、完整弱网/跨设备续传和部署交付材料。
- 本轮 9D.24 状态：completed-first-increment；已通过 TDD 后端测试、四入口登录静态检查、OpenAPI、frontend build、acceptance 和登录相关后端回归。未完成原因：仍缺生产级 Spring Security/JWT、完整 RuoYi 管理 UI、refresh token 轮换、access token 黑名单、多设备会话策略和正式环境浏览器全链路验收。
- 本轮 9D.34 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标 AI 通知策略测试、OpenAPI、acceptance 和静态检查。本轮新增 `AI_BUDGET_NOTIFICATION_ENABLED`，默认开启；关闭后预算跨线仍写 `AI_BUDGET_EXCEEDED` 审计，但不写内部通知事实。后续已继续补外部告警 outbox、分角色/分模型预算、提示词版本审计、输出防护和外部告警发送器本地 dry-run 状态机，真实外部渠道适配第一增量已由 9D.43 补齐，调度器第一增量已由 9D.44 补齐，当前仍缺真实 key 环境联调和部署交付材料。
- 本轮 9D.35 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标 AI 预算熔断测试、OpenAPI、acceptance 和静态检查。本轮新增 `AI_BUDGET_CIRCUIT_BREAKER_ENABLED`，默认关闭；开启后预算已超限时真实模型调用返回 deterministic fallback，并写 `AI_BUDGET_CIRCUIT_OPEN` 审计。后续已继续补外部告警 outbox、分角色/分模型预算、提示词版本审计、输出防护和外部告警发送器本地 dry-run 状态机，真实外部渠道适配第一增量已由 9D.43 补齐，调度器第一增量已由 9D.44 补齐，当前仍缺真实 key 环境联调和部署交付材料。
- 本轮 9D.36 状态：completed-first-increment；已按客户旧版医生端、客服端、生产端 HTML 原型完成当前前端全页面视觉第一增量，并按客户看完展示视频后的反馈追加清理工作台技术英文、补业务入口陈列、修正导航结构、锁定四端主题和复刻业务工作台。医生端使用医生蓝，客服端使用客服紫，生产端使用生产青，管理端使用深石墨管理蓝；工作台不再重复左侧栏功能入口，改为四端业务仪表盘；四入口登录后默认进入工作台；订单、生产、设计稿/数据处理类页面补快速筛选 chip、队列卡片、彩色状态 badge 和高密度表格视觉；快速筛选 chip 已补点击选中态和已有接口筛选联动；工作台已补演示级趋势图并移除 KPI 黑色图标；本轮追加生产端安环管理、成本管理、质量与返工、奖惩管理、设备管理、物料异常等前端陈列和占位页，质量与返工左侧子功能收敛为质量总览、返工管理、终检报告，内返率和外返率放入页面指标与工作台趋势；生产工作台 7 个指标卡已改为紧凑网格，并在四端左上角新增账号管理/账号切换弹出面板。已通过 `npm run check:task9d36`、`npm run build:frontend`、`npm run check:task9d24`、`npm run acceptance`、`git diff --check`、`npm run smoke:task9d24` 和 `npm run smoke:task9d36`。未完成原因：生产端质量、设备、物料、安环、成本、奖惩已由 9D.49 到 9D.54 接入真实只读汇总，但仍缺录入/审批/CRUD、演示种子数据、工作台趋势真实统计、完整空状态、更多分页面精修、正式录屏和完整业务验收用例。
- 本轮 9D.37 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标 AI 外部告警 outbox 测试、静态检查、OpenAPI、acceptance 和后端回归。本轮新增 `ai_external_alert_outbox`，预算跨线和预算熔断命中都会写入 `PENDING` 待发送事实。后续已继续补分角色/分模型预算、提示词版本审计、输出防护和外部告警发送器本地 dry-run 状态机，真实外部渠道适配第一增量已由 9D.43 补齐，调度器第一增量已由 9D.44 补齐，重试/死信第一增量已由 9D.45 补齐，幂等/并发领取第一增量已由 9D.46 补齐，发送侧签名第一增量已由 9D.47 补齐，当前仍缺接收端验签/防重放联调、渠道配置、真实 key 环境联调和部署交付材料。
- 本轮 9D.38 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标 AI 分角色预算测试、静态检查、OpenAPI、acceptance 和后端回归。本轮新增 `ai_audit_log.actor_role`、四个角色日预算变量和 `AI_BUDGET_ROLE_CIRCUIT_OPEN` 治理审计 / outbox。后续已继续补分模型预算、提示词版本审计、输出防护和外部告警发送器本地 dry-run 状态机，真实外部渠道适配第一增量已由 9D.43 补齐，调度器第一增量已由 9D.44 补齐，当前仍缺预算策略管理页面、真实 key 环境联调和部署交付材料。
- 本轮 9D.39 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标 AI 分模型预算测试、静态检查、OpenAPI、acceptance 和后端回归。本轮新增 `AI_DEEPSEEK_DAILY_BUDGET_MICROUSD` 和 `AI_BUDGET_MODEL_CIRCUIT_OPEN` 治理审计 / outbox。后续已由 9D.40 补提示词版本审计和输出防护第一增量，由 9D.41 补外部告警发送器本地 dry-run 状态机，并由 9D.42 补成本趋势第一增量；真实外部渠道适配第一增量已由 9D.43 补齐，调度器第一增量已由 9D.44 补齐，当前仍缺预算策略管理页面、真实 key 环境联调和部署交付材料。
- 本轮 9D.40 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标 AI 提示词版本与输出防护测试、静态检查、OpenAPI、acceptance 和后端回归。本轮新增 `ai_audit_log.prompt_version`、固定提示词版本映射、`AI_OUTPUT_GUARDED` 治理审计和真实模型输出出口防护。后续已由 9D.41 补外部告警发送器本地 dry-run 状态机，并由 9D.42 补成本趋势第一增量；未完成原因：真实外部渠道适配第一增量已由 9D.43 补齐，调度器第一增量已由 9D.44 补齐，仍缺预算策略管理页面、提示词后台管理、流式输出过滤、真实 key 环境联调和部署交付材料。
- 本轮 9D.41 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标 AI 外部告警发送器测试、静态检查、OpenAPI、acceptance 和后端回归。本轮新增 `AiExternalAlertSenderService`，支持 `PENDING -> SENT/FAILED`、`attempts` 累计和 `last_error` 留痕。后续已由 9D.42 补成本趋势第一增量，9D.43 补真实外部渠道适配第一增量，9D.44 补调度器第一增量，9D.45 补重试/死信第一增量，9D.46 补幂等/并发领取第一增量，9D.47 补发送侧签名第一增量；未完成原因：仍缺接收端验签/防重放联调、真实 key 环境联调和部署交付材料。
- 本轮 9D.42 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标 AI 成本趋势测试、静态检查、OpenAPI、acceptance 和后端回归。本轮新增 `/ai/governance/cost-trend` 和 `AiGovernanceCostTrendResponse`，CS / ADMIN 可查看最近 1-31 天按日聚合的成功调用成本、成功次数和模型数量。未完成原因：真实外部渠道适配第一增量已由 9D.43 补齐，调度器第一增量已由 9D.44 补齐，仍缺生产成本看板、真实计费对账、提示词后台管理、流式输出过滤、真实 key 环境联调和部署交付材料。
- 本轮 9D.43 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标 AI 外部告警 webhook 测试、静态检查、OpenAPI、acceptance 和后端回归。本轮新增 `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED`、`AI_EXTERNAL_ALERT_WEBHOOK_URL` 和 webhook POST 边界；默认仍 dry-run，显式启用后发送 outbox payload；9D.45 后 webhook 失败进入有限重试/死信链路，9D.46 后并发领取不会重复外呼，9D.47 后可选 HMAC 签名。未完成原因：仍缺接收端验签/防重放联调、生产 webhook 联调、真实 key 环境联调和部署交付材料。
- 本轮 9D.44 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标 AI 外部告警调度器测试、静态检查、OpenAPI、acceptance 和后端回归。本轮新增 `AiExternalAlertScheduler`、`@EnableScheduling` 和 `AI_EXTERNAL_ALERT_SCHEDULER_*` 配置；默认关闭，显式启用后按批次调用既有 sender。未完成原因：重试/死信第一增量已由 9D.45 补齐，幂等/并发领取第一增量已由 9D.46 补齐，发送侧签名第一增量已由 9D.47 补齐，仍缺接收端验签/防重放联调、生产 webhook 联调、真实 key 环境联调和部署交付材料。
- 本轮 9D.45 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标 AI 外部告警重试/死信测试、静态检查、OpenAPI、acceptance 和后端回归。本轮新增 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS` 和 `DEAD_LETTER` 状态；webhook 失败未达上限保持 `PENDING`，达到上限进入死信，避免无限重试。未完成原因：幂等/并发领取第一增量已由 9D.46 补齐，发送侧签名第一增量已由 9D.47 补齐，仍缺接收端验签/防重放联调、生产 webhook 联调、真实 key 环境联调和部署交付材料。
- 本轮 9D.46 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标 AI 外部告警幂等/并发领取测试、静态检查、OpenAPI、acceptance 和后端回归。本轮新增事务内 `SENDING` 领取态和 `claimAlert` 条件更新；sender 领取成功后才允许 dry-run 或 webhook 外呼，避免重复触发或并发 sender 重复发送同一条 outbox。未完成原因：发送侧签名第一增量已由 9D.47 补齐，仍缺接收端验签/防重放联调、生产 webhook 联调、真实 key 环境联调、监控告警和部署交付材料。
- 本轮 9D.47 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标 AI 外部告警 webhook 签名测试、静态检查、OpenAPI、acceptance 和后端回归。本轮新增 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED` / `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET`，启用后 sender 会按 request body 发送 `X-AI-Alert-Signature: sha256=<HMAC-SHA256>`。未完成原因：仍缺接收端验签/防重放联调、生产 webhook 联调、真实 key 环境联调、监控告警和部署交付材料。
- 本轮 9D.49 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标质量汇总后端测试、静态检查、OpenAPI、frontend build 和真实浏览器点击。新增 `/production/quality/summary`、`ProductionQualitySummaryResponse`、OpenAPI schema/path、`npm run check:task9d49`，并让生产端质量总览加载真实总返工率、内返率、外返率、一次通过率和终检通过率。未完成原因：投诉率/退货率因缺少投诉/退货事实表当前返回 0；设备、物料、安环、成本、奖惩等生产展示模块后续已由 9D.50 到 9D.54 逐项补齐只读汇总接口。
- 本轮 9D.50 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标设备汇总后端测试、静态检查、OpenAPI、frontend build、acceptance 和真实浏览器点击。新增 `/production/equipment/summary`、`ProductionEquipmentSummaryResponse`、Flyway `V22__production_equipment_foundation.sql`、OpenAPI schema/path、`npm run check:task9d50`，并让生产端设备管理加载真实设备台账、设备状态、保养计划、故障报修、停机时长和设备稼动率。未完成原因：当前只做设备只读汇总，不做设备 CRUD、保养/报修审批流或真实现场设备联动；物料、安环、成本、奖惩后续已由 9D.51 到 9D.54 逐项补齐只读汇总接口。
- 本轮 9D.51 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标物料异常汇总后端测试、静态检查、OpenAPI、frontend build、acceptance 和真实浏览器点击。新增 `/production/material-exceptions/summary`、`ProductionMaterialExceptionSummaryResponse`、Flyway `V23__production_material_exception_foundation.sql`、OpenAPI schema/path、`npm run check:task9d51`，并让生产端物料异常加载真实缺料、错料、批次异常、材料损耗、处理状态和责任归属汇总。未完成原因：当前只做物料异常只读汇总，不做异常登记/编辑/审批流、库存扣减或供应商联动；安环、成本、奖惩后续已由 9D.52 到 9D.54 逐项补齐只读汇总接口。
- 本轮 9D.52 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标安环汇总后端测试、静态检查、OpenAPI、frontend build、acceptance 和真实浏览器点击。新增 `/production/safety-environment/summary`、`ProductionSafetyEnvironmentSummaryResponse`、Flyway `V24__production_safety_event_foundation.sql`、OpenAPI schema/path、`npm run check:task9d52`，并让生产端安环管理加载真实安全巡检、隐患整改、环境记录、PPE/设备安全提醒、安环事件统计和高风险待办汇总。未完成原因：当前只做安环事件只读汇总，不做巡检登记、整改审批、复查闭环、PPE 发放或环境采集联动；成本和奖惩后续已由 9D.53、9D.54 补齐只读汇总接口。
- 本轮 9D.53 状态：completed-first-increment；已通过 TDD 红灯/绿灯、目标成本汇总后端测试、静态检查、OpenAPI、frontend build、acceptance 和真实浏览器点击。新增 `/production/cost-management/summary`、`ProductionCostSummaryResponse`、Flyway `V25__production_cost_record_foundation.sql`、OpenAPI schema/path、`npm run check:task9d53`，并让生产端成本管理和外协成本加载真实工序成本、材料成本、人工成本、返工成本、外协成本和成本异常预警汇总。未完成原因：当前只做成本记录只读汇总，不做成本录入、核算规则配置、审批流、供应商结算或财务系统联动；奖惩管理真实汇总已由 9D.54 补齐。

## 任务 9D.54：生产端奖惩管理汇总后端适配第一增量

状态：completed-first-increment。

目标：

- 让生产端“奖惩管理”不再只是前端占位，先接入一条真实后端汇总链路。
- 覆盖客户要求的奖惩记录、奖惩原因、关联订单/工序/员工、审批状态和月度汇总展示。
- 保持医生端内部生产奖惩与绩效相关数据隔离。

范围：

- 后端新增 `GET /production/reward-penalty/summary`，权限为 WORKER / CS / ADMIN，DOCTOR 访问返回 403。
- 新增 Flyway `V26__production_reward_penalty_foundation.sql`，建立 `production_reward_penalty_record` 基础事实表。
- 汇总来源限定奖惩记录事实表：奖励、扣罚、待审批、已通过、已驳回、已生效、关联订单数、关联工序数、关联员工数和本月已生效金额。
- 前端生产端奖惩管理页接入真实接口，新增“真实奖惩汇总”卡片区和刷新按钮；已接真实汇总的页面不再显示“后续再接接口和数据表”的误导提示。

验收结果：

- TDD 红灯：`ProductionRewardPenaltySummaryTests` 首次稳定失败于 `/production/reward-penalty/summary` 404 和 `production_reward_penalty_record` 表不存在，确认后端缺口。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=ProductionRewardPenaltySummaryTests test`：PASS，2 tests / 0 failures / 0 errors。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=ProductionRewardPenaltySummaryTests,ProductionCostSummaryTests,ProductionSafetyEnvironmentSummaryTests,ProductionMaterialExceptionSummaryTests,ProductionEquipmentSummaryTests test`：PASS，10 tests / 0 failures / 0 errors。
- `npm run check:task9d54`：PASS。
- `npm run check:openapi`：PASS，73 paths / 84 operations / 84 operationIds。
- `npm run check:task9d36`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- `npm run acceptance`：PASS。
- `git diff --check`：PASS。
- 真实浏览器点击：本地后端启动后，选择“生产端”入口，用 `worker/change-me-worker` 登录，点击左侧“奖惩管理”，页面出现“真实奖惩汇总”“奖惩记录”“奖惩原因”“关联对象”“审批状态”“月度汇总”“绩效影响”，且不出现 `Unexpected token '<'` 或“奖惩汇总加载失败”。

未完成原因：

- 当前只完成奖惩管理只读汇总第一增量，不新增奖惩录入、审批流、申诉、绩效结算或通知联动。
- 测试环境浏览器看到的奖惩数量和金额来自本地测试插入数据；正式演示如需稳定样例，可后续设计专门的演示种子数据或后台录入路径。
- 生产端新增展示模块第一轮真实汇总已覆盖质量、设备、物料异常、安环、成本和奖惩，但仍不是完整生产管理闭环。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.53：生产端成本管理汇总后端适配第一增量

状态：completed-first-increment。

目标：

- 让生产端“成本管理 / 外协成本”不再只是前端占位，先接入一条真实后端汇总链路。
- 覆盖客户要求的工序成本、材料成本、人工成本、返工成本、外协成本和成本异常预警展示。
- 保持医生端内部生产成本数据隔离。

范围：

- 后端新增 `GET /production/cost-management/summary`，权限为 WORKER / CS / ADMIN，DOCTOR 访问返回 403。
- 新增 Flyway `V25__production_cost_record_foundation.sql`，建立 `production_cost_record` 基础事实表。
- 汇总来源限定成本记录事实表：工序成本、材料成本、人工成本、返工成本、外协成本、成本合计和异常预警数。
- 前端生产端成本管理和外协成本页接入真实接口，新增“真实成本汇总”卡片区和刷新按钮；已接真实汇总的页面不再显示“后续再接接口和数据表”的误导提示。

验收结果：

- TDD 红灯：`ProductionCostSummaryTests` 首次稳定失败于 `/production/cost-management/summary` 404 和 `production_cost_record` 表不存在，确认后端缺口。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=ProductionCostSummaryTests test`：PASS，2 tests / 0 failures / 0 errors。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=ProductionCostSummaryTests,ProductionSafetyEnvironmentSummaryTests,ProductionMaterialExceptionSummaryTests,ProductionEquipmentSummaryTests test`：PASS，8 tests / 0 failures / 0 errors。
- `npm run check:task9d53`：PASS。
- `npm run check:openapi`：PASS，72 paths / 83 operations / 83 operationIds。
- `npm run check:task9d36`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- `npm run acceptance`：PASS。
- `git diff --check`：PASS。
- 真实浏览器点击：重启本地后端后，选择“生产端”入口，用 `worker/change-me-worker` 登录，点击左侧“成本管理”，页面出现“真实成本汇总”“工序成本”“材料成本”“人工成本”“返工成本”“外协成本”“成本异常预警”，且不出现 `Unexpected token '<'` 或“成本汇总加载失败”。

未完成原因：

- 当前只完成成本管理只读汇总第一增量，不新增成本录入、核算规则配置、成本审批、供应商结算或财务系统联动。
- 测试环境浏览器看到的成本金额来自本地测试插入数据；正式演示如需稳定样例，可后续设计专门的演示种子数据或后台录入路径。
- 奖惩管理真实只读汇总已由 9D.54 补齐。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.52：生产端安环管理汇总后端适配第一增量

状态：completed-first-increment。

目标：

- 让生产端“安环管理”不再只是前端占位，先接入一条真实后端汇总链路。
- 覆盖客户要求的安全巡检、隐患整改、环境记录、PPE/设备安全提醒和安环事件统计展示。
- 保持医生端内部生产安环数据隔离。

范围：

- 后端新增 `GET /production/safety-environment/summary`，权限为 WORKER / CS / ADMIN，DOCTOR 访问返回 403。
- 新增 Flyway `V24__production_safety_event_foundation.sql`，建立 `production_safety_event` 基础事实表。
- 汇总来源限定安环事件事实表：安全巡检、隐患整改、环境记录、PPE/设备安全提醒、待处理、处理中、已关闭、超期和高风险事件。
- 前端生产端安环管理页接入真实接口，新增“真实安环汇总”卡片区和刷新按钮；已接真实汇总的页面不再显示“后续再接接口和数据表”的误导提示。

验收结果：

- TDD 红灯：`ProductionSafetyEnvironmentSummaryTests` 首次稳定失败于 `/production/safety-environment/summary` 404 和 `production_safety_event` 表不存在，确认后端缺口。
- 绿灯前修正：测试中一条超期样本只减 3 小时，受数据库当前时区影响不稳定，已改成明确早于当前时间的日期。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=ProductionSafetyEnvironmentSummaryTests test`：PASS，2 tests / 0 failures / 0 errors。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=ProductionSafetyEnvironmentSummaryTests,ProductionMaterialExceptionSummaryTests,ProductionEquipmentSummaryTests test`：PASS，6 tests / 0 failures / 0 errors。
- `npm run check:task9d52`：PASS。
- `npm run check:openapi`：PASS，71 paths / 82 operations / 82 operationIds。
- `npm run check:task9d36`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- `npm run acceptance`：PASS。
- `git diff --check`：PASS。
- 真实浏览器点击：重启本地后端后，选择“生产端”入口，用 `worker/change-me-worker` 登录，点击左侧“安环管理”，页面出现“真实安环汇总”“安全巡检”“隐患整改”“环境记录”“PPE/设备安全提醒”“安环事件统计”，且不出现 `Unexpected token '<'` 或“安环汇总加载失败”。

未完成原因：

- 当前只完成安环管理只读汇总第一增量，不新增巡检登记、整改审批、复查闭环、PPE 发放、设备安全采集或环境传感器联动。
- 测试环境浏览器看到的安环事件数量来自本地测试插入数据；正式演示如需稳定样例，可后续设计专门的演示种子数据或后台录入路径。
- 成本管理和奖惩管理真实只读汇总已由 9D.53、9D.54 补齐。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.51：生产端物料异常汇总后端适配第一增量

状态：completed-first-increment。

目标：

- 让生产端“物料异常”不再只是前端占位，先接入一条真实后端汇总链路。
- 覆盖客户要求的缺料、错料、批次异常、材料损耗、异常处理状态和责任归属展示。
- 保持医生端内部生产物料异常数据隔离。

范围：

- 后端新增 `GET /production/material-exceptions/summary`，权限为 WORKER / CS / ADMIN，DOCTOR 访问返回 403。
- 新增 Flyway `V23__production_material_exception_foundation.sql`，建立 `production_material_exception` 基础事实表。
- 汇总来源限定物料异常事实表：缺料、错料、批次异常、材料损耗、待处理、处理中、已关闭、已填写责任归属和损耗数量合计。
- 前端生产端物料异常页接入真实接口，新增“真实物料异常汇总”卡片区和刷新按钮；已接真实汇总的页面不再显示“后续再接接口和数据表”的误导提示。

验收结果：

- TDD 红灯：`ProductionMaterialExceptionSummaryTests` 首次稳定失败于 `/production/material-exceptions/summary` 404 和 `production_material_exception` 表不存在，确认后端缺口。
- 绿灯前修正：损耗数量不应复用设备稼动率的一位小数格式，已改为两位小数汇总。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=ProductionMaterialExceptionSummaryTests test`：PASS，2 tests / 0 failures / 0 errors。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=ProductionMaterialExceptionSummaryTests,ProductionEquipmentSummaryTests test`：PASS，4 tests / 0 failures / 0 errors。
- `npm run check:task9d51`：PASS。
- `npm run check:openapi`：PASS，70 paths / 81 operations / 81 operationIds。
- `npm run check:task9d36`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- `npm run acceptance`：PASS。
- `git diff --check`：PASS。
- 真实浏览器点击：重启本地后端后，选择“生产端”入口，用 `worker/change-me-worker` 登录，点击左侧“物料异常”，页面出现“真实物料异常汇总”“缺料”“错料”“批次异常”“材料损耗”“责任归属”，且不出现 `Unexpected token '<'` 或“物料异常汇总加载失败”。

未完成原因：

- 当前只完成物料异常只读汇总第一增量，不新增异常登记、编辑、审批、库存扣减、采购补料或供应商协同接口。
- 测试环境浏览器看到的物料异常数量来自本地测试插入数据；正式演示如需稳定样例，可后续设计专门的演示种子数据或后台录入路径。
- 安环管理、成本管理和奖惩管理真实只读汇总已由 9D.52 到 9D.54 补齐。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.50：生产端设备管理汇总后端适配第一增量

状态：completed-first-increment。

目标：

- 让生产端“设备管理”不再只是前端占位，先接入一条真实后端汇总链路。
- 覆盖客户要求的设备台账、设备状态、保养计划、故障报修、停机时长和设备稼动率展示。
- 保持医生端内部生产设备数据隔离。

范围：

- 后端新增 `GET /production/equipment/summary`，权限为 WORKER / CS / ADMIN，DOCTOR 访问返回 403。
- 新增 Flyway `V22__production_equipment_foundation.sql`，建立 `production_equipment` 和 `production_equipment_event` 基础表。
- 汇总来源限定设备台账和设备事件：运行中、待机、保养、故障、待处理保养计划、待处理故障报修、累计停机分钟数和平均设备稼动率。
- 前端生产端设备管理页接入真实接口，新增“真实设备汇总”卡片区和刷新按钮；已接真实汇总的页面不再显示“后续再接接口和数据表”的误导提示。

验收结果：

- TDD 红灯：`ProductionEquipmentSummaryTests` 首次稳定失败于 `/production/equipment/summary` 404 和 `production_equipment` 表不存在，确认后端缺口。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=ProductionEquipmentSummaryTests test`：PASS，2 tests / 0 failures / 0 errors。
- `npm run check:task9d50`：PASS。
- `npm run check:openapi`：PASS，69 paths / 80 operations / 80 operationIds。
- `npm run check:task9d36`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- `npm run acceptance`：PASS。
- `git diff --check`：PASS。
- 真实浏览器点击：重启本地后端后，选择“生产端”入口，用 `worker/change-me-worker` 登录，点击左侧“设备管理”，页面出现“真实设备汇总”“设备台账”“故障报修”“设备稼动率”，且不出现 `Unexpected token '<'` 或“设备汇总加载失败”。

未完成原因：

- 当前只完成设备管理只读汇总第一增量，不新增设备 CRUD、保养计划编辑、故障报修审批、现场设备采集或真实 IoT/设备联动。
- 测试环境浏览器看到的设备数量来自本地测试插入数据；正式演示如需稳定样例，可后续设计专门的演示种子数据或后台录入路径。
- 物料异常、安环管理、成本管理和奖惩管理真实只读汇总已由 9D.51 到 9D.54 补齐。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.49：生产端质量与返工汇总后端适配第一增量

状态：completed-first-increment。

目标：

- 让生产端“质量与返工 / 质量总览”不再只是前端占位，先接入一条真实后端汇总链路。
- 明确区分内返率和外返率，避免只显示单一“返工率”。
- 保持医生端内部生产质量数据隔离。

范围：

- 后端新增 `GET /production/quality/summary`，权限为 WORKER / CS / ADMIN，DOCTOR 访问返回 403。
- 汇总来源限定已有 `check_record`、`rework_record` 和 `orders`：按出检订单数计算总返工率、内返率、外返率、一次通过率、终检通过率。
- `responsibility_type=WORKER` 归为内返，`DOCTOR/CS` 归为外返；未归类或系统责任单独计数。
- 投诉率和退货率当前无事实表，返回 0，并在 OpenAPI 与前端文案标注“待接入”。
- 前端生产端质量总览接入真实接口，新增刷新按钮和真实质量汇总卡片；Vite 增加 `/production` 代理。

验收结果：

- TDD 红灯：`CheckWorklogPerformanceTests#productionQualitySummarySplitsInternalAndExternalReworkRates` 首次稳定失败于 `/production/quality/summary` 404，确认后端缺口。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#productionQualitySummarySplitsInternalAndExternalReworkRates+doctorCannotReadProductionQualitySummary test`：PASS，2 tests / 0 failures / 0 errors。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test`：PASS，16 tests / 0 failures / 0 errors。
- `npm run check:task9d49`：PASS。
- `npm run check:task9d36`：PASS。
- `npm run check:openapi`：PASS，68 paths / 79 operations / 79 operationIds。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- 真实浏览器点击：重启本地 8080/5173 后，选择“生产端”入口，用 `worker/change-me-worker` 登录，展开“质量与返工”，点击“质量总览”，页面出现“真实质量汇总”“内返率”“外返率”，且不再出现 `Unexpected token '<'` 或“质量汇总加载失败”。

未完成原因：

- 当前只完成质量与返工汇总第一增量，不新增投诉/退货事实表，不新增设备、物料、安环、成本、奖惩表结构或假接口。
- 前端生产工作台趋势图仍是演示级数据，后续可继续把生产端设备、物料异常、安环、成本、奖惩模块逐项接入真实只读汇总接口。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.47：AI 外部告警 webhook 签名/鉴权第一增量

状态：completed-first-increment。

来源：

- 9D.43 已新增 webhook 真实发送边界。
- 9D.45 已新增 webhook 失败重试/死信。
- 9D.46 已新增并发领取幂等。
- 9D.46 后 webhook 仍是裸 `application/json` POST，缺少最小共享密钥签名边界。

目标：

- 默认不改变本地 dry-run 和未签名 webhook 行为。
- 显式启用 webhook 签名并注入 secret 后，请求携带可校验的 HMAC-SHA256 签名头。
- 签名启用但 secret 为空时，不发送未签名 webhook。

范围：

- 新增 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED`，默认 `false`。
- 新增 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET`，默认空字符串；真实 secret 必须外部注入，不写入仓库。
- 新增 `X-AI-Alert-Signature: sha256=<hex>` 请求头，签名内容为 webhook request body。
- 新增 `AiExternalAlertSenderTests#senderSignsWebhookRequestWhenSigningIsEnabled`。
- 新增 `scripts/check-task-9d47-ai-external-alert-webhook-signing.mjs` 和 `npm run check:task9d47`。
- 同步 OpenAPI、acceptance、readiness 和 README。

非目标：

- 不新增迁移。
- 不做 timestamp、nonce、防重放窗口或接收端验签服务。
- 不接短信、邮件、企业微信、飞书或其他 SDK。
- 不提交真实 webhook URL、密钥、token 或签名 secret。
- 不做生产 webhook 联调。
- 不把 Task 8 标为完成。

验收标准：

- 默认关闭签名时，既有 webhook 成功路径不携带 `X-AI-Alert-Signature`。
- 开启签名并提供 secret 时，webhook 请求携带 `X-AI-Alert-Signature`。
- 签名值等于 `sha256=` + `HMAC-SHA256(secret, requestBody)`。

验收结果：

- TDD 红灯：新增签名测试后编译失败，原因是 `ExternalAlert#setWebhookSigningEnabled` / `setWebhookSigningSecret` 尚不存在。
- TDD 绿灯：新增签名配置和发送侧 HMAC header 后，目标测试通过。
- `AiExternalAlertSenderTests`：PASS。

建议验证命令：

```bash
npm run check:task9d47
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiExternalAlertSenderTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 已新增默认关闭的 webhook 签名开关。
- 已验证启用签名后请求头可由接收端按共享 secret 复算。
- 已验证默认未启用签名时不改变现有 webhook 成功路径。

剩余风险：

- 当前不是生产级外部告警体系；仍缺接收端验签/防重放联调、监控、告警抑制和操作手册。
- 尚未做真实 webhook / 真实 key 环境联调。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.46：AI 外部告警幂等/并发领取第一增量

状态：completed-first-increment。

来源：

- 9D.43 已新增 webhook 真实发送边界。
- 9D.44 已新增默认关闭的调度器。
- 9D.45 已新增 webhook 失败重试/死信。
- 9D.45 后 sender 仍是先查 `PENDING` 再外呼；并发触发时可能重复发送同一条 outbox。

目标：

- 重复触发或并发 sender 不会对同一条 `PENDING` outbox 造成重复外呼。
- 保持默认 dry-run、webhook 成功、失败重试和死信语义不变。

范围：

- 新增事务内 `SENDING` 领取态。
- 新增 `AiExternalAlertSenderService#claimAlert` 条件更新，只有 `PENDING -> SENDING` 成功后才发送。
- 将 `SENT`、`FAILED`、`PENDING`、`DEAD_LETTER` 的最终更新限定为从 `SENDING` 推进。
- 新增 `AiExternalAlertSenderTests#senderClaimsPendingAlertBeforeWebhookCallToAvoidDuplicateExternalSend`。
- 新增 `scripts/check-task-9d46-ai-external-alert-claim-idempotency.mjs` 和 `npm run check:task9d46`。
- 同步 OpenAPI、acceptance、readiness 和 README。

非目标：

- 不新增迁移；`SENDING` 复用既有 `send_status` 字符串字段。
- 不做 webhook 签名/鉴权、退避调度、告警抑制、监控指标或死信管理页面。
- 不接短信、邮件、企业微信、飞书或其他 SDK。
- 不提交真实 webhook URL、密钥、token 或签名。
- 不做生产 webhook 联调。
- 不把 Task 8 标为完成。

验收标准：

- 第一个 sender 已开始 webhook 发送但未结束时，第二个 sender 不能对同一条 outbox 发起第二次 webhook。
- 并发后该 outbox 最终只累计一次 `attempts`，成功路径为 `SENT`。
- 默认 dry-run、unsupported channel、webhook 失败重试和死信测试继续通过。

验收结果：

- TDD 红灯：新增并发测试后失败，原因是第二个 sender 捕获到了第二次 webhook 请求。
- TDD 绿灯：新增 `claimAlert` 和事务内 `SENDING` 领取态后，目标测试通过。
- `AiExternalAlertSenderTests`：PASS。

建议验证命令：

```bash
npm run check:task9d46
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiExternalAlertSenderTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 已新增事务内领取态 `SENDING`。
- 已验证重复触发 sender 不会重复发送同一条 outbox。
- 已验证并发场景最终只产生一次 webhook 请求和一次 attempts 累计。

剩余风险：

- 当前不是生产级外部告警体系；尚无签名/鉴权、退避策略、告警抑制、监控和操作手册。
- 尚未做真实 webhook / 真实 key 环境联调。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.45：AI 外部告警重试/死信第一增量

状态：completed-first-increment。

来源：

- 9D.43 已新增 webhook 真实发送边界。
- 9D.44 已新增默认关闭的调度器。
- 9D.44 后 webhook 失败会导致调度器后续无法形成可控重试/终止语义，需补 9D.45 有限重试/死信边界。

目标：

- webhook 失败后不会无限重试。
- 未达到最大尝试次数时保留 `PENDING`，等待下次调度。
- 达到最大尝试次数后进入可识别的 `DEAD_LETTER` 状态。

范围：

- 新增 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS` / `app.ai.external-alert.max-attempts`，默认 3。
- 扩展 `AiExternalAlertSenderService` 的 webhook 失败状态机。
- 新增 `AiExternalAlertSenderTests#senderKeepsWebhookFailurePendingBeforeMaxAttempts`。
- 新增 `AiExternalAlertSenderTests#senderMovesWebhookFailureToDeadLetterAtMaxAttempts`。
- 新增 `scripts/check-task-9d45-ai-external-alert-retry-dead-letter.mjs` 和 `npm run check:task9d45`。
- 同步 OpenAPI、acceptance、readiness 和 README。

非目标：

- 不做分布式锁、并发领取、退避调度或告警抑制。
- 不做死信管理页面、人工重放、批量恢复或运维控制台。
- 不接短信、邮件、企业微信、飞书或其他 SDK。
- 不提交真实 webhook URL、密钥、token 或签名。
- 不做生产 webhook 联调。
- 不把 Task 8 标为完成。

验收标准：

- webhook 失败且当前 attempts 未达 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS` 时，outbox 保持 `PENDING`，`attempts` 增加并记录 `last_error`。
- webhook 失败且达到 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS` 时，outbox 标记 `DEAD_LETTER`，`attempts` 增加并记录 `last_error`。
- 成功发送仍标记 `SENT`，默认未启用 webhook 时仍保持 dry-run。

验收结果：

- TDD 红灯：目标测试先编译失败，原因是 `ExternalAlert#setMaxAttempts` 不存在。
- TDD 绿灯：新增 `maxAttempts` 配置和 webhook 失败状态机后，目标测试通过。
- `AiExternalAlertSenderTests`：PASS。

建议验证命令：

```bash
npm run check:task9d45
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiExternalAlertSenderTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 已新增 AI 外部告警最大尝试次数配置。
- 已验证 webhook 失败未达上限时保持 `PENDING`。
- 已验证 webhook 失败达到上限时进入 `DEAD_LETTER`。

剩余风险：

- 当前不是生产级外部告警体系；幂等/并发领取第一增量已由 9D.46 补齐，发送侧签名第一增量已由 9D.47 补齐，仍缺接收端验签/防重放联调、退避策略、告警抑制、监控和操作手册。
- 尚未做真实 webhook / 真实 key 环境联调。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.44：AI 外部告警调度器第一增量

状态：completed-first-increment。

来源：

- 9D.37 已新增 `ai_external_alert_outbox`。
- 9D.41 已新增本地 dry-run 发送器。
- 9D.43 已新增显式启用的 webhook 发送边界。
- Task 8 上线准备仍缺自动触发 sender 的调度入口。

目标：

- 新增默认关闭的 AI 外部告警调度器。
- 默认配置不自动处理 outbox，不依赖外部网络。
- 显式启用后按批次调用现有 sender 处理 `PENDING` outbox。

范围：

- 新增 `AiExternalAlertScheduler`。
- 在应用入口启用 Spring scheduling。
- 新增 `AI_EXTERNAL_ALERT_SCHEDULER_ENABLED`、`AI_EXTERNAL_ALERT_SCHEDULER_BATCH_SIZE`、固定延迟和初始延迟环境变量。
- 新增 `AiExternalAlertSenderTests#schedulerDoesNothingWhenExternalAlertSchedulingIsDisabled`。
- 新增 `AiExternalAlertSenderTests#schedulerDispatchesPendingAlertsWhenExternalAlertSchedulingIsEnabled`。
- 新增 `scripts/check-task-9d44-ai-external-alert-scheduler.mjs` 和 `npm run check:task9d44`。
- 同步 OpenAPI、acceptance、readiness 和 README。

非目标：

- 不做分布式锁、复杂重试、死信队列、告警抑制或监控指标。
- 不接短信、邮件、企业微信、飞书或其他 SDK。
- 不提交真实 webhook URL、密钥、token 或签名。
- 不做生产 webhook 联调。
- 不把 Task 8 标为完成。

验收标准：

- 默认 `AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false` 时，调度方法返回 0，`PENDING` outbox 不被处理。
- 设置 scheduler enabled 后，调度器按 `schedulerBatchSize` 调用 sender。
- 调度器复用既有 sender 的 dry-run/webhook 行为，不绕过 9D.43 的安全门禁。

验收结果：

- TDD 红灯：目标测试先编译失败，原因是 `AiExternalAlertScheduler` 和 scheduler 配置方法不存在。
- TDD 绿灯：新增调度器、配置字段、YAML/env 映射和 Spring scheduling 后，目标测试通过。
- `npm run check:task9d44`、`npm run acceptance`、`npm run check:openapi`：PASS。
- `AiExternalAlertSenderTests`：PASS。
- `platform-server test`、`npm run build:frontend`、`git diff --check`：PASS。

建议验证命令：

```bash
npm run check:task9d44
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiExternalAlertSenderTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 已新增默认关闭的 AI 外部告警调度器。
- 已验证默认关闭时不会处理 `PENDING` outbox。
- 已验证显式启用后会调用既有 sender 推进 outbox。

剩余风险：

- 当前不是生产级外部告警体系；重试/死信第一增量已由 9D.45 补齐，幂等/并发领取第一增量已由 9D.46 补齐，发送侧签名第一增量已由 9D.47 补齐，仍缺接收端验签/防重放联调、告警抑制、监控和操作手册。
- 尚未做真实 webhook / 真实 key 环境联调。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.43：AI 真实外部渠道适配第一增量

状态：completed-first-increment。

来源：

- 9D.37 已新增 `ai_external_alert_outbox` 待发送事实。
- 9D.41 已新增本地 dry-run 发送器，可推进 `PENDING -> SENT/FAILED`。
- Task 8 上线准备仍缺真实外部发送边界，但不能提交真实短信、邮件、企业微信或 webhook 密钥。

目标：

- 给 `EXTERNAL_ALERT` 增加默认关闭的 webhook 发送能力。
- 本地/CI 默认保持 dry-run，不依赖外部网络。
- 显式启用 webhook 后，把 outbox payload 以 `application/json` POST 到外部 webhook。
- webhook 失败时记录安全错误摘要；9D.45 后失败不再直接进入 `FAILED`，而是按最大尝试次数决定继续 `PENDING` 或进入 `DEAD_LETTER`。

范围：

- 新增 `AiGatewayProperties.ExternalAlert` 配置。
- 新增 `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED`、`AI_EXTERNAL_ALERT_WEBHOOK_URL`、连接/读取超时环境变量。
- 扩展 `AiExternalAlertSenderService#sendPendingAlerts` 读取 payload，并在显式启用时调用 webhook。
- 新增 `AiExternalAlertSenderTests#senderPostsPendingExternalAlertToConfiguredWebhookWhenEnabled`。
- 新增 `AiExternalAlertSenderTests#senderKeepsWebhookFailurePendingBeforeMaxAttempts`，验证失败留痕会进入 9D.45 有限重试链路。
- 新增 `scripts/check-task-9d43-ai-external-alert-webhook.mjs` 和 `npm run check:task9d43`。
- 同步 OpenAPI、acceptance、readiness 和 README。

非目标：

- 不接短信、邮件、企业微信、飞书或其他 SDK。
- 不提交真实 webhook URL、密钥、token 或签名。
- 不做定时调度、并发领取锁、重试/死信、签名认证、渠道管理页面或生产 webhook 联调。
- 不把 Task 8 标为完成。

验收标准：

- 默认配置下 `EXTERNAL_ALERT` 仍按本地 dry-run 标记 `SENT`。
- `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=true` 且 `AI_EXTERNAL_ALERT_WEBHOOK_URL` 非空时，发送器 POST outbox payload。
- webhook 返回 2xx 时 outbox 标记 `SENT`，`last_error=NULL`。
- webhook 返回非 2xx 或连接异常时写入 `last_error`；9D.45 后未达上限保持 `PENDING`，达到上限进入 `DEAD_LETTER`。

验收结果：

- TDD 红灯：目标测试先编译失败，原因是 `AiGatewayProperties#getExternalAlert()` 不存在。
- TDD 绿灯：新增配置对象、YAML/env 映射和 webhook 发送路径后，目标测试通过。
- `npm run check:task9d43`、`npm run acceptance`、`npm run check:openapi`：PASS。
- `AiExternalAlertSenderTests`：PASS。
- `platform-server test`、`npm run build:frontend`、`git diff --check`：PASS。

建议验证命令：

```bash
npm run check:task9d43
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiExternalAlertSenderTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 已新增默认关闭的 AI 外部告警 webhook 配置。
- 已验证启用 webhook 后会发送 outbox payload。
- 已验证 webhook 失败会记录 `last_error`，并在 9D.45 后进入有限重试/死信链路。

剩余风险：

- 当前不是生产级外部告警体系；调度器第一增量已由 9D.44 补齐，重试/死信第一增量已由 9D.45 补齐，幂等/并发领取第一增量已由 9D.46 补齐，发送侧签名第一增量已由 9D.47 补齐，仍缺接收端验签/防重放联调、渠道管理、监控和操作手册。
- 尚未做真实 webhook / 真实 key 环境联调。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.42：AI 成本趋势第一增量

状态：completed-first-increment。

来源：

- 9D.27 已有单次 AI 成本审计，9D.30 到 9D.41 已补治理摘要、预算、通知、熔断、outbox、角色/模型预算、输出防护和本地发送状态机。
- Task 8 上线准备仍缺成本变化趋势，只能看到当前窗口汇总，无法判断成本是否持续上升。

目标：

- 提供后端只读 AI 成本趋势接口。
- CS / ADMIN 可按最近 1-31 天查看每日成功调用成本、成功次数和模型数量。
- 医生端和生产端不可访问成本趋势。

范围：

- 新增 `AiGovernanceCostTrendResponse`。
- 新增 `AiGatewayService#governanceCostTrend`，按 `ai_audit_log.result_status=SUCCESS` 聚合。
- 新增 `GET /ai/governance/cost-trend?days=7`。
- 新增 `AiGatewayTests#aiGovernanceCostTrendGroupsRecentSuccessCostByDayForInternalUsers`。
- 新增 `AiGatewayTests#aiGovernanceCostTrendRejectsDoctorUsers`。
- 新增 `scripts/check-task-9d42-ai-cost-trend.mjs` 和 `npm run check:task9d42`。
- 同步 OpenAPI、acceptance 和 readiness 文档。

非目标：

- 不新增表结构或迁移。
- 不接真实计费账单或云厂商账单。
- 不做前端图表 UI、报表导出、预算策略管理页面或真实 key 联调。
- 不把 Task 8 标为完成。

验收标准：

- CS / ADMIN 请求 `/ai/governance/cost-trend?days=7` 返回 `days`、`points`、`total_success_count`、`total_estimated_cost_microusd`。
- `points` 按天返回 `date`、`success_count`、`estimated_cost_microusd`、`model_count`。
- 只统计 `result_status=SUCCESS` 的 AI 审计成本，失败/限流/熔断等治理审计不计入成本趋势。
- DOCTOR 请求成本趋势接口返回 403。

验收结果：

- TDD 红灯：目标测试先失败，原因是 `/ai/governance/cost-trend` 不存在，返回 404。
- TDD 绿灯：新增响应 DTO、Service 聚合查询和 Controller 入口后，目标测试通过。
- `npm run check:task9d42`、`npm run acceptance`、`npm run check:openapi`：PASS。
- `AiGatewayTests` 目标测试：PASS。
- `platform-server test`、`npm run build:frontend`、`git diff --check`：PASS。

建议验证命令：

```bash
npm run check:task9d42
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests#aiGovernanceCostTrendGroupsRecentSuccessCostByDayForInternalUsers+aiGovernanceCostTrendRejectsDoctorUsers test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 已新增 AI 成本趋势后端只读接口。
- 已验证按日聚合成功调用成本、成功次数和模型数量。
- 已验证医生端不可访问成本趋势。

剩余风险：

- 当前只是审计表估算成本趋势，不是 DeepSeek 官方账单对账。
- 尚无前端图表、导出、异常成本检测和成本预算策略管理页面。
- 真实 key 环境联调和部署交付材料仍未完成。

## 任务 9D.41：AI 外部告警发送器第一增量

状态：completed-first-increment。

来源：

- 9D.37 已新增 `ai_external_alert_outbox` 待发送事实，但只能停留在 `PENDING`。
- Task 8 上线准备仍缺外部告警发送器的最小状态机和失败留痕。

目标：

- 支持服务端领取 `PENDING` 外部告警 outbox。
- 本地 dry-run 发送成功后标记 `SENT`。
- 不支持的通道标记 `FAILED`，累计 `attempts` 并记录 `last_error`。

范围：

- 新增 `AiExternalAlertSenderService#sendPendingAlerts`。
- `EXTERNAL_ALERT` 通道作为本地 dry-run，不调用真实外部服务。
- 未支持通道写 `FAILED` 和 `unsupported external alert channel`。
- 新增 `AiExternalAlertSenderTests#senderMarksPendingExternalAlertAsSentWithoutRealChannel`。
- 新增 `AiExternalAlertSenderTests#senderMarksUnsupportedPendingAlertFailedAndRecordsError`。
- 新增 `scripts/check-task-9d41-ai-external-alert-sender.mjs` 和 `npm run check:task9d41`。

非目标：

- 不接真实短信、邮件、企业微信或其他外部渠道。
- 不新增真实密钥或环境变量。
- 不做定时调度、分布式锁、死信队列或渠道管理页面。
- 不把 Task 8 标为完成。

验收标准：

- `PENDING` + `channel=EXTERNAL_ALERT` 的 outbox 可被发送器领取并标记 `SENT`。
- 成功处理时 `attempts=attempts+1`，`last_error=NULL`。
- 未支持通道被标记 `FAILED`，`attempts=attempts+1`，`last_error` 记录错误原因。
- 本轮不产生任何真实外部请求，不需要真实外部渠道密钥。

验收结果：

- TDD 红灯：新增目标测试先编译失败，原因是 `AiExternalAlertSenderService` 不存在。
- TDD 绿灯：新增发送器服务后，目标测试通过；测试兼容本地历史 PENDING outbox，不清理数据库。
- `npm run check:task9d41`、`npm run acceptance`、`npm run check:openapi`：PASS。
- `AiExternalAlertSenderTests`：PASS。
- `platform-server test`、`npm run build:frontend`、`git diff --check`：PASS。

建议验证命令：

```bash
npm run check:task9d41
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiExternalAlertSenderTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 已新增本地 dry-run 发送器。
- 已验证 `PENDING` 外部告警可推进到 `SENT`。
- 已验证未知通道可推进到 `FAILED` 并记录 `last_error`。

剩余风险：

- 当前不是生产级真实外部渠道发送器。
- 调度器第一增量已由 9D.44 补齐，重试/死信第一增量已由 9D.45 补齐，幂等/并发领取第一增量已由 9D.46 补齐，发送侧签名第一增量已由 9D.47 补齐，仍缺接收端验签/防重放联调、渠道配置和监控告警。
- 真实 key 环境联调和部署交付材料仍未完成。

## 任务 9D.40：AI 提示词版本与输出防护第一增量

状态：completed-first-increment。

来源：

- 9D.15 已接入真实 DeepSeek 第一增量，9D.26 到 9D.39 已补限流、成本、重试、失败审计、治理摘要、预算、通知、熔断、外部告警 outbox、角色预算和模型预算。
- 当前 AI 审计仍不能追踪某次输出对应的提示词版本；真实模型输出也缺少统一出口防护。

目标：

- AI 审计记录固定提示词版本，便于后续追溯和回滚。
- 真实模型输出命中敏感泄露模式时，不返回原始内容，改为人工复核提示。
- 输出防护命中写入可查询的治理审计。

范围：

- 新增 Flyway `V21__ai_prompt_version_output_guard.sql`，为 `ai_audit_log` 增加 `prompt_version` 和索引。
- `AiGatewayService#audit` 写入 `AI_TRANSLATE_V1`、`AI_CS_QUERY_V1`、`AI_DOCTOR_ORDER_QUERY_V1`、`AI_CHECK_MISSING_V1`、`AI_PRODUCTION_NOTE_V1`。
- `AiGatewayService#completeWithModel` 对真实模型输出做统一防护，命中后写 `AI_OUTPUT_GUARDED` / `ai-governance-output-guard` 并返回安全保护文案。
- 新增 `AiGatewayDeepSeekTests#deepSeekProviderAuditsPromptVersionForAiTranslate` 和 `#deepSeekProviderGuardsSensitiveModelOutputAndAuditsIt`。
- 新增 `scripts/check-task-9d40-ai-prompt-output-guard.mjs` 和 `npm run check:task9d40`。

非目标：

- 不做提示词后台管理、动态发布或 A/B 实验。
- 不做流式输出逐 token 防护。
- 不接真实外部告警发送器。
- 不提交真实 DeepSeek key 或外部渠道密钥。
- 不把 Task 8 标为完成。

验收标准：

- `ai_audit_log` 存在 `prompt_version` 字段。
- AI-1 翻译真实模型成功调用后，审计写入 `prompt_version=AI_TRANSLATE_V1`。
- 真实模型返回包含密钥、token、内部表名或明确内部泄露模式时，HTTP 响应不包含原始敏感文本。
- 输出防护命中时写入 `AI_OUTPUT_GUARDED` 治理审计，`model_name=ai-governance-output-guard`。

验收结果：

- TDD 红灯：目标测试先失败，原因是 `prompt_version` 列不存在且敏感模型输出原样返回。
- TDD 绿灯：新增 V21 迁移、提示词版本写入和输出防护后，目标测试通过。
- `npm run check:task9d40`、`npm run acceptance`、`npm run check:openapi`：PASS。
- `AiGatewayDeepSeekTests`：PASS。
- `platform-server test`、`npm run build:frontend`、`git diff --check`：PASS。

建议验证命令：

```bash
npm run check:task9d40
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderAuditsPromptVersionForAiTranslate+deepSeekProviderGuardsSensitiveModelOutputAndAuditsIt test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 已新增提示词版本审计字段和固定版本映射。
- 已验证 DeepSeek stub 返回敏感输出时，响应只返回安全保护文案。
- 已验证输出防护写入 `AI_OUTPUT_GUARDED` 和 `ai-governance-output-guard`。

剩余风险：

- 输出防护当前为服务端固定敏感模式，不是完整 DLP/内容安全策略。
- 流式输出尚未实现逐 token 防护。
- 提示词版本尚无后台管理、灰度、回滚或人工确认页面。
- 真实外部渠道适配第一增量已由 9D.43 补齐，调度器第一增量已由 9D.44 补齐；真实 key 环境联调和部署交付材料仍未完成。

## 任务 9D.39：AI 分模型预算第一增量

状态：completed-first-increment。

来源：

- 9D.35 已完成全局预算熔断，9D.38 已完成角色预算。
- 当前真实模型成本仍无法按模型名设置阈值，不利于后续多模型接入时分层控费。

目标：

- 支持 DeepSeek 当前配置模型的模型级日预算阈值。
- 当预算熔断总开关开启且当前模型预算已超限时，不外呼真实模型，返回 deterministic fallback，并写治理审计和 outbox。
- outbox payload 带 `model=deepseek-chat` 等模型字段，便于后续发送器和运维排查。

范围：

- 新增 `AI_DEEPSEEK_DAILY_BUDGET_MICROUSD`，默认 0。
- `AiGatewayService#completeWithModel` 在角色预算后、全局预算前检查当前 `AI_DEEPSEEK_MODEL` 的模型预算。
- 模型预算熔断命中写入 `AI_BUDGET_MODEL_CIRCUIT_OPEN` 和 `ai-governance-budget-model-circuit-open`。
- 新增 `AiGatewayDeepSeekTests#deepSeekProviderFallsBackWhenDeepSeekModelBudgetCircuitBreakerIsOpen`。
- 新增 `scripts/check-task-9d39-ai-model-budget.mjs` 和 `npm run check:task9d39`。

非目标：

- 不做通用多模型预算策略表。
- 不新增预算策略管理页面。
- 不接真实外部告警发送器。
- 不提交真实 DeepSeek key 或任何外部告警密钥。
- 不把 Task 8 标为完成。

验收标准：

- 默认模型预算为 0 时，不改变现有真实模型调用行为。
- `AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 且当前 `AI_DEEPSEEK_MODEL` 预算为正数并已超限时，不访问 DeepSeek。
- 熔断命中时写入 `AI_BUDGET_MODEL_CIRCUIT_OPEN` 治理审计，`model_name=ai-governance-budget-model-circuit-open`。
- 熔断命中时写入 `ai_external_alert_outbox.alert_type=AI_BUDGET_MODEL_CIRCUIT_OPEN`，payload 带 `model=deepseek-chat` 等模型字段。

验收结果：

- TDD 红灯：目标测试先编译失败，原因是 `AiGatewayProperties.DeepSeek` 尚无 `setDailyBudgetMicrousd`。
- TDD 绿灯：新增 DeepSeek 模型预算属性和服务写入/熔断逻辑后，目标测试通过。
- `npm run check:task9d39`、`npm run acceptance`、`npm run check:openapi`：PASS。
- `AiGatewayDeepSeekTests`：PASS。
- `platform-server test`、`npm run build:frontend`、`git diff --check`：PASS。

建议验证命令：

```bash
npm run check:task9d39
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderFallsBackWhenDeepSeekModelBudgetCircuitBreakerIsOpen test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 已新增 DeepSeek 当前配置模型预算变量。
- 已验证 `deepseek-chat` 模型预算超限时不访问 DeepSeek，返回 deterministic fallback。
- 已验证模型预算熔断写入 `AI_BUDGET_MODEL_CIRCUIT_OPEN` 审计和外部告警 outbox。

剩余风险：

- 当前只覆盖 DeepSeek 当前配置模型，不是完整多模型预算策略后台。
- 当前仍只是 outbox 待发送事实，不代表外部告警已发送。
- 成本趋势第一增量已由 9D.42 补齐；仍缺提示词后台管理、流式输出过滤、真实 key 联调和部署交付材料。

## 任务 9D.38：AI 分角色预算第一增量

状态：completed-first-increment。

来源：

- 9D.35 已完成全局预算熔断，9D.37 已完成预算治理外部告警待发送事实。
- 当前 AI 预算仍只有全局阈值，无法按医生端、客服端、生产端、管理端分别控制真实模型成本。

目标：

- 让 AI 审计记录调用者角色，形成按角色聚合预算的基础。
- 支持 ADMIN / CS / DOCTOR / WORKER 四类角色独立配置日预算阈值。
- 当预算熔断总开关开启且当前角色预算已超限时，不外呼真实模型，返回 deterministic fallback，并写治理审计和 outbox。

范围：

- 新增 Flyway `V20__ai_audit_actor_role.sql`，为 `ai_audit_log` 增加 `actor_role` 和角色查询索引。
- 新增 `AI_ADMIN_DAILY_BUDGET_MICROUSD`、`AI_CS_DAILY_BUDGET_MICROUSD`、`AI_DOCTOR_DAILY_BUDGET_MICROUSD`、`AI_WORKER_DAILY_BUDGET_MICROUSD`，默认均为 0。
- `AiGatewayService#completeWithModel` 在全局预算熔断前检查当前角色预算。
- 角色预算熔断命中写入 `AI_BUDGET_ROLE_CIRCUIT_OPEN` 和 `ai-governance-budget-role-circuit-open`。
- 新增 `AiGatewayDeepSeekTests#deepSeekProviderFallsBackWhenCsRoleBudgetCircuitBreakerIsOpen`。
- 新增 `scripts/check-task-9d38-ai-role-budget.mjs` 和 `npm run check:task9d38`。

非目标：

- 不做分模型预算。
- 不新增预算策略管理页面。
- 不接真实外部告警发送器。
- 不提交真实 DeepSeek key 或任何外部告警密钥。
- 不把 Task 8 标为完成。

验收标准：

- 默认角色预算为 0 时，不改变现有真实模型调用行为。
- `AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 且当前角色预算为正数并已超限时，不访问 DeepSeek。
- 熔断命中时写入 `AI_BUDGET_ROLE_CIRCUIT_OPEN` 治理审计，`model_name=ai-governance-budget-role-circuit-open`。
- 熔断命中时写入 `ai_external_alert_outbox.alert_type=AI_BUDGET_ROLE_CIRCUIT_OPEN`，payload 带 `role=CS` 等角色字段。

验收结果：

- TDD 红灯 1：目标测试先编译失败，原因是 `AiGatewayProperties` 尚无 `setCsDailyBudgetMicrousd`。
- TDD 红灯 2：补最小属性后，目标测试失败于 `Unknown column 'actor_role'`，证明缺少角色审计字段。
- TDD 绿灯：新增 Flyway V20、角色预算属性和服务写入/熔断逻辑后，目标测试通过。
- `npm run check:task9d38`、`npm run acceptance`、`npm run check:openapi`：PASS。
- `AiGatewayDeepSeekTests`：PASS。
- `platform-server test`、`npm run build:frontend`、`git diff --check`：PASS。

建议验证命令：

```bash
npm run check:task9d38
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderFallsBackWhenCsRoleBudgetCircuitBreakerIsOpen test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 已新增角色预算配置和审计角色列。
- 已验证 CS 角色预算超限时不访问 DeepSeek，返回 deterministic fallback。
- 已验证角色预算熔断写入 `AI_BUDGET_ROLE_CIRCUIT_OPEN` 审计和外部告警 outbox。

剩余风险：

- 历史 `ai_audit_log` 记录的 `actor_role` 为空，只能从本迁移后的新审计开始做角色预算统计。
- 分模型预算已由 9D.39 补齐，成本趋势第一增量已由 9D.42 补齐；仍缺策略管理页面。
- 当前仍只是 outbox 待发送事实，不代表外部告警已发送。

## 任务 9D.37：AI 预算外部告警待发送事实第一增量

状态：completed-first-increment。

来源：

- 9D.32 到 9D.35 已完成预算跨线审计、内部通知、通知策略开关和预算熔断/降级。
- readiness 清单仍把外部告警、分角色/分模型预算、提示词版本和输出防护列为生产级 AI 治理缺口。

目标：

- 先把外部告警落为可消费、可追踪的 outbox 待发送事实。
- 预算跨线和预算熔断命中后都生成 `PENDING` 记录，供后续真实发送器消费。
- 不调用真实外部服务，不提交密钥，不改变现有内部通知开关语义。

范围：

- 新增 Flyway `V19__ai_external_alert_outbox.sql`，创建 `ai_external_alert_outbox`。
- `AiGatewayService` 在 `AI_BUDGET_EXCEEDED` 和 `AI_BUDGET_CIRCUIT_OPEN` 路径写入外部告警 outbox。
- 新增 `AiGatewayDeepSeekTests#deepSeekProviderCreatesExternalAlertOutboxWhenDailyBudgetIsReached`。
- 新增 `AiGatewayDeepSeekTests#deepSeekProviderCreatesExternalAlertOutboxWhenBudgetCircuitBreakerOpens`。
- 新增 `scripts/check-task-9d37-ai-external-alert-outbox.mjs` 和 `npm run check:task9d37`。

非目标：

- 不接短信、邮件、企业微信、飞书或其他真实外部渠道。
- 不新增真实发送器、重试队列、死信处理或管理页面。
- 不提交真实 DeepSeek key 或任何外部告警密钥。
- 不把 Task 8 标为完成。

验收标准：

- 预算跨线时写入 `AI_BUDGET_EXCEEDED` 治理审计，并新增 `ai_external_alert_outbox.alert_type=AI_BUDGET_EXCEEDED`。
- 预算熔断命中时不访问 DeepSeek，写入 `AI_BUDGET_CIRCUIT_OPEN` 治理审计，并新增 `ai_external_alert_outbox.alert_type=AI_BUDGET_CIRCUIT_OPEN`。
- outbox 记录 `send_status=PENDING`，payload 不包含 prompt、模型原始响应或密钥。
- `AI_BUDGET_NOTIFICATION_ENABLED=false` 只影响内部通知，不影响外部告警 outbox。

验收结果：

- TDD 红灯：新增两个目标测试先失败，原因是 `ai_external_alert_outbox` 表不存在。
- TDD 绿灯：新增 Flyway V19 和服务写入逻辑后，两个目标测试通过。
- `npm run check:task9d37`、`npm run acceptance`、`npm run check:openapi`：PASS。
- `AiGatewayDeepSeekTests`：PASS。
- `platform-server test`、`npm run build:frontend`、`git diff --check`：PASS。

建议验证命令：

```bash
npm run check:task9d37
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderCreatesExternalAlertOutboxWhenDailyBudgetIsReached+deepSeekProviderCreatesExternalAlertOutboxWhenBudgetCircuitBreakerOpens test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 已新增外部告警 outbox 表和索引。
- 已验证预算跨线会产生 `AI_BUDGET_EXCEEDED` 待发送事实。
- 已验证预算熔断命中会产生 `AI_BUDGET_CIRCUIT_OPEN` 待发送事实。
- 已验证 payload 不包含测试 prompt 文本。

剩余风险：

- 当前只是待发送事实，不代表外部告警已发送。
- 真实外部渠道适配第一增量已由 9D.43 补齐；调度器第一增量已由 9D.44 补齐，重试/死信第一增量已由 9D.45 补齐，幂等/并发领取第一增量已由 9D.46 补齐，发送侧签名第一增量已由 9D.47 补齐，仍缺接收端验签/防重放联调、渠道配置、告警抑制和生产级监控。
- 仍缺分角色/分模型预算、提示词版本、输出防护和真实 key 环境联调记录。

## 任务 9D.36：三端 / 管理端前端视觉改造第一增量

状态：completed-first-increment。

来源：

- 客户要求前端按旧版医生端、客服端、生产端 HTML 原型设计。
- 已确认页面中文为主，品牌使用项目自有名称“AI智能下单平台”。
- 已确认按“四入口登录页保留 -> 三端框架 -> 全页面视觉适配”顺序推进，并覆盖当前所有已实现前端页面。

目标：

- 在不改变服务端权限、接口契约和业务状态机的前提下，统一登录后全页面视觉。
- 医生端、客服端、生产端、管理端登录后呈现不同角色气质，但共享可维护的门户壳层。
- 让当前最小业务页面具备客户演示时可识别的工作台风格。

范围：

- `frontend/src/App.vue`：新增角色主题识别、页面说明数据、菜单图标映射、管理端总览卡片。
- `frontend/src/styles.css`：新增深色侧栏、顶部状态栏、页面说明区、业务卡片、列表、表单、管理端快捷入口和角色主题色样式。
- 继续复用现有登录接口、`portal` 字段、RBAC 菜单、通知中心和各页面数据加载函数。

非目标：

- 不新增后端接口。
- 不调整 RBAC 菜单和医生端脱敏边界。
- 不直接搬运旧 HTML 原型里的 mock 数据、localStorage 同步或模拟账号逻辑。
- 不把 Task 8 标为完成。

验收结果：

- `npm run build:frontend`：PASS。
- `npm run check:task9d24`：PASS。
- `npm run acceptance`：PASS。
- `git diff --check`：PASS。
- 真实浏览器 smoke：医生端、客服端、生产端、管理端四入口均可点击登录并进入对应页面；医生账号选择管理端被拒绝并显示“账号角色与所选入口不匹配”。
- 2026-07-02 追加修正：左侧栏移除英文品牌副标题、英文角色/数据范围、英文图标 ligature 和 `Token` 文案；菜单中的 AI 入口显示为中文“助手”。浏览器复测四入口左侧栏 `latin=false`。
- 2026-07-02 追加修正：订单页内容区补充 `min-width: 0`、卡片宽度约束和小屏 Tab 换行；浏览器复测医生订单页 390 / 760 / 1280 宽度均无横向越界元素。
- 2026-07-02 追加修正：左侧栏菜单项由中文短标恢复为内置 SVG 图标，避免文字落在图标框下方；四入口共用同一套侧栏和功能区蓝色模板，浏览器复测 `--portal-accent=#1296db` 且 `.menu-mark` 数量为 0。
- 2026-07-02 追加修正：补齐后端真实菜单 route 的专属 SVG 映射，覆盖医生文件、医生助手、文件中心、协同、客服 AI、生产 AI、系统权限等入口；四入口浏览器复测 `fallbackCount=0`、`duplicateSvgCount=0`，避免菜单项显示为圆圈兜底图标。
- 2026-07-02 追加设计精修：按 product design 评审口径复刻三个旧版 HTML 原型的后台密度和入口样式；登录页改为深蓝窄卡片端口入口，登录后侧栏改为“品牌区 / 身份块 / 分组菜单 / 底部说明”，主体状态码和产品类型补中文映射。浏览器复测四入口 `sidebarWidth=236`、`latinInSidebar=false`、`rawStatus=null`、无横向溢出。
- 2026-07-03 追加客户反馈修正：工作台 fallback 页面移除客户可见的权限码条、组件名、路由路径和角色英文码，改为中文业务总览和业务快捷入口；客服端工作台陈列订单管理、沟通中心、客户管理、产品管理、配送管理、账单管理、外协管理；生产端工作台陈列人员管理、设备管理、物料异常；登录后页头和登录页图标改用内置 SVG，避免图标字体未加载时出现英文 ligature。新增 `scripts/check-task-9d36-frontend-display-cleanup.mjs` 和 `npm run check:task9d36`。真实浏览器四入口文本 smoke 复测无 `ADMIN/DOCTOR/WORKER`、路由、权限码、组件名、`dashboard/person/lock` 等英文兜底。
- 2026-07-03 二次客户反馈修正：左侧栏和工作台快捷入口统一从前端展示导航配置派生，工作台卡片名称与左侧栏一致；主功能补子菜单；医生端订单管理拆成新建订单、我的订单、设计稿确认、账单物流、沟通留言、订单助手子栏目；客服端、生产端、管理端未接接口的新入口进入中文占位页，不再复用无关页面；管理端点击工艺、权限、人员、设备、物料、外协、AI 治理等功能时侧栏仍保持管理端模板。已更新 `scripts/check-task-9d36-frontend-display-cleanup.mjs` 覆盖 `displayNavigationConfig`、`el-sub-menu`、占位页和客户反馈功能名；已更新 `scripts/smoke-task-9d24-four-portal-login.spec.mjs` 适配中文登录状态与管理端工作台标题。真实 Playwright 点击矩阵覆盖四入口登录、客服端订单/沟通/客户/产品/设计稿/账单/配送/外协/智能助手、医生端文件资料和订单子栏目、生产端生产订单/消息/人员/设备/物料/设计稿/生产助手、管理端用户/角色/人员/设备/物料/外协/工序进度/员工派工/AI 治理。
- 2026-07-03 视觉间距微调：合并顶部与侧栏重复平台标题，左侧栏固定到页面顶部并保持整块深蓝功能区；登录后内容网格改为自然内容高度，避免侧栏 `100vh` 撑开右侧两行导致顶部说明卡与功能卡之间出现大段空白。Playwright 量化复测管理端 AI 治理/用户管理、客服客户管理、医生文件资料、生产设备管理页面，顶部说明卡到底部功能卡间距均为 10px，侧栏顶部为 0。
- 2026-07-03 四端原型配色锁定：医生端使用 `#0f2554/#2563eb`，客服端使用 `#1e1b4b/#7c3aed`，生产端使用 `#0c2340/#0d9488`，管理端使用 `#111827/#1296db`；侧栏背景、选中态、说明卡、占位页、订单/工序选中态统一改用 `--portal-*` 主题变量，避免局部组件写死医生蓝。新增 `scripts/smoke-task-9d36-portal-theme-stability.spec.mjs` 和 `npm run smoke:task9d36`，真实浏览器逐一登录四入口并点击多个侧栏功能，确认主题类、主色和侧栏色不随路由切换改变。
- 2026-07-03 工作台与队列页复刻：按客户确认，工作台不再承载左侧栏已有功能入口，改为四端业务驾驶舱。医生端展示今日订单、生产中、即将送达、待回复、设计确认、延期提醒；客服端展示今日新订单、待审核、沟通、设计更新、延期、发货、账单异常、投诉返工；生产端展示实时同步条、生产中、待审核、完成、延期、返工和待派工；管理端展示订单、异常、账号、生产、AI 和预算治理。四入口登录后默认进入工作台；工作台 KPI 卡片移除黑色图标并增加演示级趋势图表；医生订单、客服初审、生产审核、我的任务、生产看板补原型式快速筛选 chip，chip 已有点击选中态，并在生产看板、我的任务、内部订单等已有筛选接口上联动加载；设计稿/数据处理类演示入口补队列表格、彩色状态 badge 和行内动作按钮。`npm run smoke:task9d36` 已增加断言：四端点击“工作台”后必须出现 `prototype-dashboard-panel`、`prototype-line-chart`，且不再出现旧的功能入口卡片网格和 `prototype-stat-icon`。
- 2026-07-03 生产端模块与账号面板追加：按客户要求只改前端展示，不改后端接口和权限逻辑。生产端导航拆为生产执行、质量与返工、人员绩效、设备物料、经营成本、安全合规、协同消息分组，新增安环管理、成本管理、质量与返工、奖惩管理、设备管理、物料异常等入口；未接接口项均为中文占位页，页面内陈列未来核心管理内容。2026-07-04 二次收敛后，质量与返工左侧只保留质量总览、返工管理、终检报告，内返率和外返率放入页面指标、返工管理内容和工作台趋势；生产端工作台 7 个指标卡改为紧凑网格，避免看板纵向过长。四端左上角身份区新增账号管理弹出面板和账号切换入口；账号切换复用现有 logout 回登录页，医生端账号面板不展示内部生产岗位、工序、绩效等信息。`npm run smoke:task9d36` 已覆盖四端账号面板可打开、生产端新增模块点击后主题不变。

剩余风险：

- 目前是全局视觉第一增量，工作台已有演示级趋势图，但尚未接入后端真实统计数据；右侧详情抽屉、生产效率图、客服消息审核流和演示录屏仍未完成。
- 当前前端仍是大型单文件 `App.vue`，后续若继续精修，建议按医生/客服/生产/管理页面拆组件。

## 任务 9D.35：AI 预算熔断/降级第一增量

状态：completed-first-increment。

来源：

- 9D.32 到 9D.34 已完成预算跨线审计、内部通知和通知策略开关，但预算超限后仍会继续外呼真实模型。
- readiness 清单仍把熔断/降级、外部告警和生产级 AI 治理列为上线硬缺口。

目标：

- 新增可配置 AI 预算熔断开关，默认关闭，避免影响现有真实模型调用。
- 开启开关且近 24 小时成功调用估算成本已达到预算阈值时，不再外呼真实模型。
- 熔断命中后返回 deterministic fallback，并写入 `AI_BUDGET_CIRCUIT_OPEN` 治理审计。

范围：

- 新增 `AI_BUDGET_CIRCUIT_BREAKER_ENABLED` / `app.ai.budget-circuit-breaker-enabled`，默认 `false`。
- `AiGatewayService#completeWithModel` 在真实模型调用前检查预算熔断。
- 熔断命中时写入 `ai_audit_log.result_status=AI_BUDGET_CIRCUIT_OPEN`，`model_name=ai-governance-budget-circuit-open`，成本为 0。
- 新增 `AiGatewayDeepSeekTests#deepSeekProviderFallsBackWhenBudgetCircuitBreakerIsEnabledAndBudgetAlreadyExceeded`。
- `.env.example`、OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不发送短信、邮件、企业微信等外部告警。
- 不做分角色/分模型预算。
- 不做管理页面、熔断恢复 UI 或人工审批流程。
- 不提交真实 DeepSeek key，不把 Task 8 标为完成。

验收标准：

- 默认配置下，真实模型调用行为不变。
- `AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 且预算已超限时，不访问 DeepSeek。
- 熔断命中时仍返回 deterministic fallback，并写入 `AI_BUDGET_CIRCUIT_OPEN` 治理审计。

验收结果：

- TDD 红灯：目标测试先编译失败，原因是 `AiGatewayProperties` 尚无 `setBudgetCircuitBreakerEnabled`。
- TDD 绿灯：`AiGatewayDeepSeekTests#deepSeekProviderFallsBackWhenBudgetCircuitBreakerIsEnabledAndBudgetAlreadyExceeded` 通过。
- `npm run check:task9d35`、`npm run acceptance`、`npm run check:openapi`：PASS。
- `AiGatewayDeepSeekTests`：PASS，9 tests。
- `platform-server test`：PASS，81 tests。
- `npm run build:frontend`、`git diff --check`：PASS。

建议验证命令：

```bash
npm run check:task9d35
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderFallsBackWhenBudgetCircuitBreakerIsEnabledAndBudgetAlreadyExceeded test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
git diff --check
```

完成记录：

- 已新增预算熔断开关，默认关闭。
- 已验证开启开关且预算已超限时，DeepSeek stub 不收到请求，接口返回 deterministic fallback。
- 已验证熔断命中写入 `AI_BUDGET_CIRCUIT_OPEN` 治理审计。

剩余风险：

- 仍缺外部告警、分角色/分模型预算、提示词版本、输出防护、真实 key 联调和生产部署。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.34：AI 预算通知策略开关第一增量

状态：completed-first-increment。

来源：

- 9D.33 已能在预算跨线时给 ACTIVE ADMIN / CS 写内部通知，但生产环境还缺通知策略配置入口。
- readiness 清单仍把外部告警、熔断/降级和生产级 AI 治理列为上线硬缺口。

目标：

- 新增可配置预算通知开关，允许部署环境临时关闭内部预算通知。
- 关闭通知时仍保留 `AI_BUDGET_EXCEEDED` 治理审计，保证预算跨线可追踪。
- 默认保持 9D.33 行为，不破坏既有内部通知路径。

范围：

- 新增 `AI_BUDGET_NOTIFICATION_ENABLED` / `app.ai.budget-notification-enabled`，默认 `true`。
- `AiGatewayService#auditBudgetExceededIfCrossed` 在开关关闭时跳过 `emitBudgetExceededNotification`。
- 新增 `AiGatewayDeepSeekTests#deepSeekProviderSkipsBudgetNotificationWhenNotificationStrategyIsDisabled`。
- `.env.example`、OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不拦截 AI 请求。
- 不发送短信、邮件、企业微信等外部告警。
- 不做分角色/分模型预算、不做熔断/降级、不新增管理页面。
- 不把 Task 8 标为完成。

验收标准：

- 默认配置下，预算跨线仍按 9D.33 写内部通知。
- `AI_BUDGET_NOTIFICATION_ENABLED=false` 时，预算跨线仍写 `AI_BUDGET_EXCEEDED` 治理审计。
- `AI_BUDGET_NOTIFICATION_ENABLED=false` 时，不写 `notification_event` / `user_notification`，不触发本地推送。

验收结果：

- TDD 红灯：目标测试先编译失败，原因是 `AiGatewayProperties` 尚无 `setBudgetNotificationEnabled`。
- TDD 绿灯：`AiGatewayDeepSeekTests#deepSeekProviderSkipsBudgetNotificationWhenNotificationStrategyIsDisabled` 通过。
- `npm run check:task9d34`、`npm run acceptance`、`npm run check:openapi`：PASS。
- `AiGatewayDeepSeekTests`：PASS，8 tests。
- `platform-server test`：PASS，80 tests。
- `npm run build:frontend`、`git diff --check`：PASS。

建议验证命令：

```bash
npm run check:task9d34
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderSkipsBudgetNotificationWhenNotificationStrategyIsDisabled test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
git diff --check
```

完成记录：

- 已新增预算通知策略开关，默认开启。
- 已验证关闭开关后预算跨线审计仍写入，但内部通知事实不新增。

剩余风险：

- 仍缺外部告警、分角色/分模型预算、熔断/降级、提示词版本、输出防护、真实 key 联调和生产部署。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.33：AI 预算超限内部通知第一增量

状态：completed-first-increment。

来源：

- 9D.32 已能在预算跨线时写入 `AI_BUDGET_EXCEEDED` 治理审计，但内部人员还不能通过通知中心看到预算超限事件。
- readiness 清单仍把预算通知策略、外部告警、熔断/降级和生产级 AI 治理列为上线硬缺口。

目标：

- 真实模型成功调用导致近 24 小时估算成本跨过预算阈值时，除治理审计外写入内部通知事实。
- 通知只发给 ACTIVE 的 ADMIN / CS 数据库账号，避免医生端或生产员工看到 AI 预算治理信息。
- 复用现有通知中心和本地 WebSocket 推送路径，为后续通知策略配置、外部告警和熔断/降级保留触发点。

范围：

- `AiGatewayService#auditBudgetExceededIfCrossed` 在写入 `AI_BUDGET_EXCEEDED` 治理审计后创建 `notification_event`。
- `user_notification` 收件人限定为 ACTIVE ADMIN / CS。
- 调用 `NotificationPushService` 复用现有在线推送。
- 新增 `AiGatewayDeepSeekTests#deepSeekProviderNotifiesInternalUsersWhenDailyBudgetIsReached`。
- OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不拦截 AI 请求。
- 不发送短信、邮件、企业微信等外部告警。
- 不做分角色/分模型预算、不做熔断/降级、不新增管理页面。
- 不把 Task 8 标为完成。

验收标准：

- 配置预算阈值后，真实模型成功调用若让近 24 小时估算成本跨过阈值，会写入 `AI_BUDGET_EXCEEDED` 内部通知事件。
- ADMIN / CS 可在 `/notifications` 看到该通知。
- DOCTOR / WORKER 不会收到该通知。

验收结果：

- TDD 红灯：目标测试先失败，原因是预算跨线后没有 `AI_BUDGET_EXCEEDED` 内部通知。
- TDD 绿灯：`AiGatewayDeepSeekTests#deepSeekProviderNotifiesInternalUsersWhenDailyBudgetIsReached` 通过。
- `npm run check:task9d33`、`npm run acceptance`、`npm run check:openapi`：PASS。

建议验证命令：

```bash
npm run check:task9d33
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderNotifiesInternalUsersWhenDailyBudgetIsReached test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests,AiGatewayDeepSeekTests,NotificationRestTests,NotificationWebSocketTests,NotificationBroadcastTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认真实模型成功调用跨过预算阈值后没有内部通知。
- 已在预算跨线审计后写入内部通知事件，并给 ACTIVE ADMIN / CS 建立用户通知。
- 已验证医生和工人账号不会收到该预算通知。

剩余风险：

- 仍缺通知策略配置、外部告警、分角色/分模型预算、熔断/降级、提示词版本、输出防护、真实 key 联调和生产部署。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.32：AI 预算超限审计第一增量

状态：completed-first-increment。

来源：

- 9D.31 已能在治理摘要中标记 `budget_exceeded`，但预算跨线没有可追踪的告警审计事件。
- readiness 清单仍把预算告警推送、熔断/降级和生产级 AI 治理列为上线硬缺口。

目标：

- 真实模型成功调用导致近 24 小时估算成本跨过预算阈值时，写入可追踪治理审计。
- 治理摘要返回预算告警次数和最近预算告警时间。
- 形成后续通知推送、熔断或降级策略的稳定触发点。

范围：

- 新增 `AI_BUDGET_EXCEEDED` 审计状态和 `ai-governance-budget-exceeded` 虚拟模型名。
- `AiGatewayService#auditBudgetExceededIfCrossed` 只在真实模型成功调用让成本从低于阈值跨到达到/超过阈值时写入审计。
- `AiGovernanceSummaryResponse` 新增 `budget_alert_count` 和 `latest_budget_alert_at`。
- 新增 `AiGatewayDeepSeekTests#deepSeekProviderAuditsBudgetExceededWhenDailyBudgetIsReached`。
- OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不拦截 AI 请求。
- 不发送外部通知或 WebSocket 通知。
- 不做分角色/分模型预算、不做熔断/降级、不新增管理页面。
- 不把 Task 8 标为完成。

验收标准：

- 配置预算阈值后，真实模型成功调用若让近 24 小时估算成本跨过阈值，会额外写入一条 `AI_BUDGET_EXCEEDED`。
- `AI_BUDGET_EXCEEDED` 不重复计入估算成本。
- `/ai/governance/summary` 返回 `budget_alert_count` 和 `latest_budget_alert_at`。

验收结果：

- TDD 红灯：`AiGatewayDeepSeekTests#deepSeekProviderAuditsBudgetExceededWhenDailyBudgetIsReached` 先失败，原因是真实模型成功后没有 `AI_BUDGET_EXCEEDED`。
- TDD 绿灯：目标测试通过。
- `AiGatewayTests,AiGatewayDeepSeekTests`：PASS，11 tests。
- `platform-server test`：PASS，78 tests。
- `npm run check:task9d32`、`npm run acceptance`、`npm run check:openapi`、`npm run build:frontend`：PASS。

建议验证命令：

```bash
npm run check:task9d32
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderAuditsBudgetExceededWhenDailyBudgetIsReached test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests,AiGatewayDeepSeekTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认真实模型成功调用后没有 `AI_BUDGET_EXCEEDED` 审计。
- 已在成功审计后检测近 24 小时预算跨线，并写入成本为 0 的治理审计。
- 治理摘要已同步预算告警次数和最近预算告警时间。

未完成原因：

- 仍缺预算通知推送、分角色/分模型预算、熔断/降级、提示词版本、输出防护、真实 key 联调和生产部署。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.24：四入口登录页与角色端口校验

状态：completed-first-increment。

来源：

- PRD 表 0 要求医生端、客服端、生产端、管理端存在明确使用入口。
- 用户确认当前先不拆四套 TCP 端口或四个前端部署，登录页显示四个入口即可。

目标：

- 登录页先选择医生端、客服端、生产端或管理端，再输入账号密码。
- `/auth/login` 请求携带 `portal`，服务端校验账号角色是否匹配所选入口。
- 登录成功后按入口优先跳到对应默认页面，同时继续复用现有 RBAC 菜单。

范围：

- 前端登录页新增四张入口卡片、返回入口选择、入口默认账号提示和入口默认跳转。
- 后端 `LoginRequest` 新增 `portal`，允许 `DOCTOR`、`CS`、`PRODUCTION`、`ADMIN`。
- 入口角色映射为 `DOCTOR -> DOCTOR`、`CS -> CS`、`PRODUCTION -> WORKER`、`ADMIN -> ADMIN`。
- OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不拆四个独立部署端口。
- 不新增角色、不调整现有菜单权限、不重构业务页面。
- 不放宽 ADMIN 到客服端或生产端登录。

验收标准：

- 缺少或非法 `portal` 返回 400。
- 账号密码错误仍返回 401。
- 账号角色与入口不匹配返回 403，并给出清晰错误提示。
- doctor/cs/worker/admin 分别选择医生端/客服端/生产端/管理端可登录成功。

建议验证命令：

```bash
npm run check:task9d24
npm run smoke:task9d24
npm run acceptance
npm run check:openapi
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests,PermissionInterceptorTests,FormConfigManagementTests test
git diff --check
```

完成记录：

- TDD 红灯先确认缺少 `portal` 时旧登录接口仍会放行。
- 后端已在账号密码校验通过后执行入口角色匹配，角色不匹配返回 403。
- 前端已新增四入口登录页、`portal` 请求字段、403 错误提示和入口默认跳转。
- OpenAPI 已同步 `LoginRequest.portal` 枚举和登录接口说明。
- 新增 `scripts/check-task-9d24-four-portal-login.mjs`、`npm run check:task9d24`，并纳入 `acceptance.json`。
- 新增 `scripts/smoke-task-9d24-four-portal-login.spec.mjs`、`npm run smoke:task9d24`，固化真实 Chrome 四入口登录 smoke。

验收结果：

- `BearerIdentityTests#databaseLoginRequiresPortalAndMatchesRoleToPortal`：PASS。
- `npm run check:task9d24`：PASS。
- `npm run smoke:task9d24`：PASS，医生端、客服端、生产端、管理端四入口分别登录到医生订单工作台、客服初审、我的任务和工作台；doctor 选择管理端被拒并提示“账号角色与所选入口不匹配”。

剩余风险：

- 正式鉴权仍需接入生产级 Spring Security/JWT、完整 RuoYi 管理 UI、refresh token 轮换、access token 黑名单和多设备会话策略。
- 本轮 smoke 依赖本机已安装 Chrome、已启动后端和 Vite 前端；CI 若无 Chrome 需设置 `TASK9D24_BROWSER_CHANNEL` 或安装 Playwright 浏览器。

## 任务 9D.25：绩效明细第一增量

状态：completed-first-increment。

来源：

- 9D.7 已有绩效汇总卡片，9D.21 已补返工责任归因，但管理端仍不能看到汇总背后的完成工时明细。
- Task 8 readiness 仍把绩效完整公式、周期、明细和申诉闭环列为上线前缺口。

目标：

- 在既有绩效汇总旁增加最近完成工时明细。
- 保持 WORKER 只能看本人，ADMIN 可按 `user_id` 查询指定员工。
- 前端绩效页展示明细表，便于后续接周期筛选、公式和申诉。

范围：

- 新增 `GET /performance/details`，返回最近 100 条已完成 work log 明细。
- 新增 `PerformanceDetailResponse`，包含订单号、工序、有效工时、标准工时、是否准时和完成时间。
- 新增 `CheckWorklogPerformanceTests#performanceDetailsListCompletedWorkLogsForResolvedUser`。
- 前端绩效页在汇总卡片下展示“工时明细”表。
- OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不实现绩效奖金/扣罚完整公式。
- 不实现周期筛选、标准工时后台配置、绩效申诉/补录或明细导出。
- 不改变既有 `/performance` 汇总统计口径。
- 不把 Task 8 标为完成。

验收标准：

- `/performance/details` 只返回已完成 work log 明细。
- WORKER 即使传入他人 `user_id`，也只返回本人明细。
- 明细返回有效工时分钟、标准工时分钟和准时判断。
- 前端绩效页能在查询汇总时同步加载明细。

建议验证命令：

```bash
npm run check:task9d25
npm run acceptance
npm run check:openapi
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#performanceDetailsListCompletedWorkLogsForResolvedUser test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认 `/performance/details` 返回 404。
- 后端已新增绩效明细响应、Controller 入口和 Service 查询。
- 前端绩效页已同步加载 `/performance` 与 `/performance/details` 并展示明细表。
- OpenAPI 已同步 `/performance/details` 和 `PerformanceDetail` schema。
- 新增 `scripts/check-task-9d25-performance-details.mjs`、`npm run check:task9d25`，并纳入 `acceptance.json`。

验收结果：

- `CheckWorklogPerformanceTests#performanceDetailsListCompletedWorkLogsForResolvedUser`：PASS。
- `CheckWorklogPerformanceTests`：PASS。
- `platform-server` 后端测试：PASS。
- `npm run check:task9d25`、`npm run acceptance`、`npm run check:openapi`、`npm run build:frontend`、`git diff --check`：PASS。

剩余风险：

- 仍缺绩效周期筛选、完整奖金/扣罚公式、标准工时配置、申诉/补录和明细导出。
- 仍缺返工影响范围图形化、终检专用角色/附件和生产级 AI 治理。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.23：返工影响筛选第一增量

状态：completed-first-increment。

来源：

- 9D.22 已在返工记录中保存影响后续节点数量和 ID，但内部人员仍只能浏览混合列表，不能快速筛出“影响过后续工序”的返工。
- Task 8 readiness 仍把返工影响图形化/筛选列为完整返工闭环缺口之一。

目标：

- 在既有 `/reworks` 列表上增加影响后续节点筛选参数。
- 前端「返工终检」页面提供“仅看影响后续工序”最小筛选入口。
- 保持医生端不可见内部返工信息，Task 8 不标完成。

范围：

- `GET /reworks` 新增可选查询参数 `has_impacted_nodes`。
- `WorkflowExecutionService#getReworks` 根据 `impacted_node_count > 0` 或 `= 0` 过滤。
- 新增 `CheckWorklogPerformanceTests#reworkListCanFilterRecordsThatImpactedDownstreamNodes`，覆盖有影响和无影响返工的 true/false 筛选。
- 前端返工终检工具栏新增 `reworkOnlyImpacted` 开关，开启后请求 `has_impacted_nodes=true`。
- OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不新增公开 API path。
- 不做 DAG 图形化、导出、复杂筛选组合或 `IN_PROGRESS` 后续节点冲突确认。
- 不改变返工创建、关闭、通知或绩效公式。
- 不把 Task 8 标为完成。

验收标准：

- `has_impacted_nodes=true` 只返回 `impacted_node_count > 0` 的返工记录。
- `has_impacted_nodes=false` 只返回 `impacted_node_count = 0` 的返工记录。
- 不传该参数时保持既有列表行为。
- 前端能一键筛出影响后续工序的返工记录。

建议验证命令：

```bash
npm run check:task9d23
npm run acceptance
npm run check:openapi
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#reworkListCanFilterRecordsThatImpactedDownstreamNodes test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认 `/reworks?has_impacted_nodes=true` 仍返回无影响返工。
- 后端已透传 `has_impacted_nodes` 并按 `impacted_node_count` 过滤。
- 前端返工终检页已新增“仅看影响后续工序”筛选开关。
- OpenAPI 已同步 `/reworks` 查询参数。
- 新增 `scripts/check-task-9d23-rework-impact-filter.mjs`、`npm run check:task9d23`，并纳入 `acceptance.json`。

验收结果：

- `CheckWorklogPerformanceTests#reworkListCanFilterRecordsThatImpactedDownstreamNodes`：PASS。
- `CheckWorklogPerformanceTests`：PASS。
- `platform-server` 后端测试：PASS。
- `npm run check:task9d23`、`npm run acceptance`、`npm run check:openapi`、`npm run build:frontend`、`git diff --check`：PASS。

剩余风险：

- 仍缺返工影响范围图形化、导出和 `IN_PROGRESS` 后续节点冲突处理。
- 仍缺绩效完整公式、周期筛选、管理端明细、申诉闭环和标准工时配置。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.22：返工影响审计可视化第一增量

状态：completed-first-increment。

来源：

- 9D.20 已能在后道失败返前道时把目标后续 `READY/COMPLETED` 节点重置为 `PENDING`，但返工记录列表没有留存“本次返工影响了哪些后续节点”。
- Task 8 readiness 仍把返工影响审计/可视化列为完整返工闭环缺口之一。

目标：

- 在创建返工时记录本次实际被重置的后续节点数量和节点 ID。
- 在既有 `/reworks` 列表响应中返回影响范围审计字段。
- 前端「返工终检」页面展示影响后续节点数量和节点 ID。

范围：

- 新增 Flyway `V17__rework_impact_audit.sql`，为 `rework_record` 增加 `impacted_node_count` 和 `impacted_node_instance_ids`。
- `WorkflowExecutionService#createRework` 在重置后续节点前计算实际可重置的后续节点，并写入返工记录。
- `ReworkRecordResponse`、`loadRework` 和 `getReworks` 返回审计字段。
- 新增 `CheckWorklogPerformanceTests#reworkListExposesImpactedDownstreamNodesForAudit`。
- 前端返工列表和详情展示影响范围审计信息。
- OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不新增公开 API path。
- 不做图形化 DAG 展示、影响范围筛选、审计导出或人工确认冲突流程。
- 不处理 `IN_PROGRESS` 后续节点冲突确认。
- 不把 Task 8 标为完成。

验收标准：

- 后道出检失败返到前道节点时，返工记录保存实际被重置的后续节点数量。
- `/reworks` 返回 `impacted_node_count` 和 `impacted_node_instance_ids`。
- 前端返工终检页面能看到影响后续节点数量和 ID。
- 历史检查、工时和返工记录不删除、不覆盖。

建议验证命令：

```bash
npm run check:task9d22
npm run acceptance
npm run check:openapi
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#reworkListExposesImpactedDownstreamNodesForAudit test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认 `/reworks` 缺少 `impacted_node_count`。
- 返工创建时已写入实际受影响后续节点数量和 JSON 节点 ID 列表。
- 前端返工终检页已展示影响后续节点数量和 ID。
- OpenAPI `ReworkRecordResponse` schema 已同步新增字段。
- 新增 `scripts/check-task-9d22-rework-impact-audit.mjs`、`npm run check:task9d22`，并纳入 `acceptance.json`。

验收结果：

- `CheckWorklogPerformanceTests#reworkListExposesImpactedDownstreamNodesForAudit`：PASS。
- `CheckWorklogPerformanceTests`：PASS。
- `platform-server` 后端测试：PASS。
- `npm run check:task9d22`、`npm run acceptance`、`npm run check:openapi`、`npm run build:frontend`、`git diff --check`：PASS。

剩余风险：

- 仍缺返工影响范围图形化、筛选、导出和 `IN_PROGRESS` 后续节点冲突处理。
- 仍缺绩效完整公式、周期筛选、管理端明细、申诉闭环和标准工时配置。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.21：绩效归因联动第一增量

状态：completed-first-increment。

来源：

- 9D.17 到 9D.20 已完成返工关闭、责任分类、字典、通知和复杂影响范围重置，但绩效统计仍只暴露总返工次数，无法区分生产人员责任和非生产责任。
- Task 8 readiness 仍把绩效归因联动列为正式上线前管理端硬缺口之一。

目标：

- 在既有 `/performance` 统计中拆分返工责任归因字段。
- 保留 `rework_count` 作为目标节点返工总数。
- 新增生产责任返工、非生产责任返工和未归因返工三个只读统计字段。
- 前端绩效管理页面展示新增归因卡片。

范围：

- `PerformanceStatsResponse` 新增 `responsible_rework_count`、`non_worker_responsibility_rework_count`、`unclassified_rework_count`。
- `WorkflowExecutionService#getPerformance` 基于 `rework_record.responsibility_type` 统计 `WORKER`、`DOCTOR/CS/SYSTEM` 和 `NULL` 三类。
- 新增 `CheckWorklogPerformanceTests#performanceSeparatesReworkResponsibilityAttribution`，覆盖同一 worker 目标节点下 WORKER 与 DOCTOR 责任返工的拆分。
- 前端绩效卡片展示“生产责任返工 / 非生产责任返工 / 未归因返工”。
- OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不新增公开 API path，不新增 DB migration。
- 不实现绩效奖金公式、周期筛选、绩效明细导出、申诉流程或标准工时配置。
- 不改变返工责任字典后台维护方式。
- 不把 Task 8 标为完成。

验收标准：

- 已关闭且责任类型为 `WORKER` 的返工计入 `responsible_rework_count`。
- 已关闭且责任类型为 `DOCTOR/CS/SYSTEM` 的返工计入 `non_worker_responsibility_rework_count`。
- 未关闭或未设置责任类型的返工计入 `unclassified_rework_count`。
- `rework_count` 继续返回同一目标节点的返工总数。
- WORKER 本人范围与 ADMIN 指定员工范围沿用既有权限规则。

建议验证命令：

```bash
npm run check:task9d21
npm run acceptance
npm run check:openapi
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#performanceSeparatesReworkResponsibilityAttribution test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认 `/performance` 缺少 `responsible_rework_count`。
- 后端响应和查询已补三类责任归因统计。
- 前端绩效页面新增三张归因卡片。
- OpenAPI `PerformanceStats` schema 已同步新增字段。
- 新增 `scripts/check-task-9d21-performance-attribution.mjs`、`npm run check:task9d21`，并纳入 `acceptance.json`。

验收结果：

- `CheckWorklogPerformanceTests#performanceSeparatesReworkResponsibilityAttribution`：PASS。
- `CheckWorklogPerformanceTests`：PASS。
- `platform-server` 后端测试：PASS。
- `npm run check:task9d21`、`npm run acceptance`、`npm run check:openapi`、`npm run build:frontend`、`git diff --check`：PASS。

剩余风险：

- 仍缺绩效奖金/扣罚公式、周期筛选、管理端明细、申诉闭环和标准工时配置。
- 返工责任字典仍是后端固定字典，未做后台维护。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.20：复杂返工影响范围第一增量

状态：completed-first-increment。

来源：

- 9D.17 到 9D.19 已完成返工关闭、字典和通知，但出检失败返到前道节点时，后续已完成节点仍停留在 `COMPLETED`，不能表达需要重新执行的影响范围。
- Task 8 readiness 仍把复杂返工影响范围列为完整返工闭环缺口之一。

目标：

- 出检失败指定返工到前道节点时，后端基于订单实例边表计算返工目标的后续节点影响范围。
- 返工目标节点仍进入 `READY`。
- 已经处于 `READY` 或 `COMPLETED` 的后续受影响节点重置为 `PENDING`，等待目标节点返工完成后由既有 DAG 激活规则重新进入 `READY`。
- 保留历史 `check_record`、`work_log` 和 `rework_record`，不删除、不覆盖。

范围：

- `WorkflowExecutionService#createRework` 新增 `resetImpactedDownstreamNodes`。
- 使用 `order_process_edge` 的递归 CTE 查找同一实例内从返工目标可达的后续节点。
- 新增 `CheckWorklogPerformanceTests#failedOutCheckResetsTargetAndCompletedDownstreamNodesForReworkImpact` 两节点链回归。
- 新增 `scripts/check-task-9d20-rework-impact.mjs`、`npm run check:task9d20`，并纳入 `acceptance.json`。

非目标：

- 不新增公开 API 或前端入口；OpenAPI 不变。
- 不处理正在 `IN_PROGRESS` 的后续节点自动终止、暂停工时或人工冲突确认。
- 不做返工影响范围审计表、可视化、绩效明细归因或完整返工处理台。
- 不调整责任字典后台维护、终检专用角色或生产通知网关。

验收标准：

- 两节点链路中，后道节点 `OUT/FAIL` 并返到前道节点后，前道节点为 `READY`。
- 同一实例内从前道可达且已经完成的后道节点重置为 `PENDING`。
- 前道返工重新完成后，后道节点通过既有 DAG 激活规则重新进入 `READY`。
- 历史检查、工时和返工记录不删除。

建议验证命令：

```bash
npm run check:task9d20
npm run acceptance
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#failedOutCheckResetsTargetAndCompletedDownstreamNodesForReworkImpact test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
git diff --check
```

完成记录：

- `createRework` 在写入返工记录后，会调用 `resetImpactedDownstreamNodes`。
- `resetImpactedDownstreamNodes` 使用 `WITH RECURSIVE impacted_nodes` 递归查找返工目标后续节点，并把 `READY/COMPLETED` 的后续节点重置为 `PENDING`。
- 目标节点仍单独置为 `READY`，并清空其本轮 `started_at/completed_at`。
- 本轮不新增 DB migration，不改变既有响应 schema。

验收结果：

- TDD 红灯：`CheckWorklogPerformanceTests#failedOutCheckResetsTargetAndCompletedDownstreamNodesForReworkImpact` 首次失败于后道节点仍为 `COMPLETED`，确认返工影响范围缺失。
- 精准后端回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#failedOutCheckResetsTargetAndCompletedDownstreamNodesForReworkImpact test`：PASS，1 test / 0 failures / 0 errors。
- Check/Worklog 模块回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test`：PASS，10 tests / 0 failures / 0 errors。

未完成原因：

- 当前只处理 `READY/COMPLETED` 后续节点的状态重置，不处理正在执行的后续节点人工冲突确认。
- 当前没有影响范围审计表或前端可视化。
- 绩效仍未按返工影响范围做明细归因。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.19：返工通知联动第一增量

状态：completed-first-increment。

来源：

- 9D.17/9D.18 已能关闭返工并收紧责任字典，但返工创建和返工关闭不会通知相关内部人员。
- Task 8 readiness 仍把返工通知联动列为完整返工闭环缺口之一。

目标：

- 出检失败生成返工记录时，给返工目标节点分配技工写入内部通知。
- 返工关闭后，给订单客服写入内部通知。
- 返工通知不进入医生端通知，避免泄露内部返工、工序、责任分类等信息。

范围：

- `WorkflowExecutionService` 复用 `notification_event` / `user_notification` 和 `NotificationPushService`。
- 新增 `REWORK_CREATED` 和 `REWORK_CLOSED` 事件。
- 通知 payload 只包含 event、orderId、orderNo、message、reworkId、targetNodeInstanceId。
- OpenAPI WebSocket 事件说明、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不做完整返工处理台。
- 不做复杂 DAG 回滚或影响范围计算。
- 不做绩效明细归因、责任归因报表或消息模板后台维护。
- 不做真实双实例 Redis / Nginx / HTTPS 生产通知验收。

验收标准：

- 出检失败生成返工记录后，存在 `REWORK_CREATED` / `WORKER` 通知事件，并给目标技工写 `user_notification`。
- 返工关闭后，存在 `REWORK_CLOSED` / `CS` 通知事件，并给订单客服写 `user_notification`。
- 医生用户没有 `REWORK_CREATED` / `REWORK_CLOSED` 的 `user_notification`。
- OpenAPI WebSocket 事件表包含 `REWORK_CREATED` 和 `REWORK_CLOSED`。

建议验证命令：

```bash
npm run check:task9d19
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#reworkLifecycleEmitsInternalNotificationsWithoutDoctorRecipient test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
git diff --check
```

完成记录：

- `WorkflowExecutionService` 注入 `ObjectMapper` 和 `NotificationPushService`，新增 `emitReworkNotification`。
- 出检失败创建返工后写入 `REWORK_CREATED`，目标用户为返工目标节点 `assigned_user_id`。
- 返工关闭后写入 `REWORK_CLOSED`，目标用户为订单 `cs_user_id`。
- 医生端不会收到返工通知的 `user_notification`。
- OpenAPI `/ws/connect` 事件说明已补 `REWORK_CREATED` / `REWORK_CLOSED`。
- 新增 `scripts/check-task-9d19-rework-notifications.mjs`、`npm run check:task9d19`，并纳入 `acceptance.json`。

验收结果：

- TDD 红灯：`CheckWorklogPerformanceTests#reworkLifecycleEmitsInternalNotificationsWithoutDoctorRecipient` 首次失败于 `REWORK_CREATED` 通知数为 0，确认返工通知联动缺失。
- 精准后端回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#reworkLifecycleEmitsInternalNotificationsWithoutDoctorRecipient test`：PASS，1 test / 0 failures / 0 errors。
- Check/Worklog 模块回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test`：PASS，9 tests / 0 failures / 0 errors。
- 后端模块全量回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test`：PASS，65 tests / 0 failures / 0 errors。
- `npm run check:task9d19`：PASS。
- `npm run acceptance`：PASS，`acceptance.json valid`。
- `npm run check:openapi`：PASS，65 paths / 76 operations / 76 operationIds。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- `git diff --check`：PASS。

未完成原因：

- 当前只做返工创建/关闭的内部通知事实，不做复杂影响范围、绩效归因或完整返工处理台。
- 当前未做真实双实例 Redis 广播、生产网关和前端点击级通知联动验收。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.18：返工原因 / 责任类型字典第一增量

状态：completed-first-increment。

来源：

- 9D.17 已能关闭返工并写入原因分类、责任类型，但前端仍硬编码选项，后端也只做自由文本持久化。
- Task 8 readiness 仍把责任分类 / 返工原因的生产级后台维护和治理列为上线前生产规则缺口；本增量先补接口、固定 code 和关闭校验。

目标：

- 后端提供关闭返工可用的原因分类和责任类型字典。
- 关闭返工时拒绝未列入字典的分类 code。
- 前端关闭返工下拉选项从后端字典读取，不再写死在模板里。

范围：

- 新增 `ReworkDictionaryOption`、`ReworkDictionariesResponse`。
- 新增 `GET /reworks/dictionaries`，权限复用 `check:read-internal`。
- `closeRework` 校验 `reason_category` 和 `responsibility_type` 必须来自后端固定字典。
- 前端 `/rework-final` 页面新增 `loadReworkDictionaries`，并用后端返回值渲染下拉选项。
- 更新 OpenAPI、acceptance、`package.json` 和静态检查脚本。

非目标：

- 不做字典后台 CRUD、数据库化字典或 RuoYi 字典表接入。
- 不做复杂返工影响范围、通知联动或绩效明细归因。
- 不改变 9D.17 关闭返工的 `OUT/PASS` 门禁。

验收标准：

- `GET /reworks/dictionaries` 返回 `reason_categories` 和 `responsibility_types`。
- `POST /reworks/{reworkId}/close` 使用未列入字典的原因分类或责任类型时返回 400。
- 使用字典内 code 关闭返工保持 9D.17 行为不变。
- 前端「返工终检」页关闭返工选项来自 `/reworks/dictionaries`。

建议验证命令：

```bash
npm run check:task9d18
npm run check:openapi
npm run acceptance
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#reworkCloseUsesServerDictionaryAndRejectsUnsupportedClassification test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 新增后端固定字典：原因分类 `FIT_ISSUE`、`MATERIAL_ISSUE`、`DESIGN_ISSUE`、`OTHER`；责任类型 `WORKER`、`DOCTOR`、`CS`、`SYSTEM`。
- 新增 `GET /reworks/dictionaries`，内部角色可读取。
- `closeRework` 新增字典校验，非法 `reason_category` 或 `responsibility_type` 返回 400。
- 前端关闭返工表单通过 `loadReworkDictionaries` 读取字典，`el-option` 改为后端返回值渲染。
- `docs/api/openapi.yaml` 已新增 `/reworks/dictionaries` 和 `ReworkDictionariesResponse`；当前为 65 paths / 76 operations / 76 operationIds。
- 新增 `scripts/check-task-9d18-rework-dictionaries.mjs`、`npm run check:task9d18`，并纳入 `acceptance.json`。

验收结果：

- TDD 红灯：`CheckWorklogPerformanceTests#reworkCloseUsesServerDictionaryAndRejectsUnsupportedClassification` 首次失败于 `/reworks/dictionaries` 返回 404，确认返工字典接口缺失。
- 精准后端回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#reworkCloseUsesServerDictionaryAndRejectsUnsupportedClassification test`：PASS，1 test / 0 failures / 0 errors。
- Check/Worklog 模块回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test`：PASS，8 tests / 0 failures / 0 errors。
- 后端模块全量回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test`：PASS，64 tests / 0 failures / 0 errors。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- 静态检查：`npm run check:task9d18`、`npm run acceptance`、`npm run check:openapi` 已通过；OpenAPI 为 65 paths / 76 operations / 76 operationIds。
- `git diff --check`：PASS。

未完成原因：

- 字典仍是后端固定列表，不是数据库化、可审计、可后台维护的 RuoYi 字典。
- 尚未做责任归因报表、绩效明细联动、复杂 DAG 影响范围或完整返工处理台。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.17：返工关闭 / 责任分类第一增量

状态：completed-first-increment。

来源：

- Task 8 readiness 把完整返工闭环列为正式上线前生产端硬缺口。
- 9D.9 已能查看返工记录和提交终检出检，9D.16 已能生成终检报告，但返工记录仍缺关闭动作和责任归类留痕。

目标：

- 后端提供关闭返工接口。
- 关闭前必须确认返工目标节点在来源失败检查之后重新 `OUT/PASS`。
- 关闭时写入原因分类、责任类型、关闭备注、关闭人和关闭时间。
- 前端在现有「返工终检」页提供最小关闭入口。

范围：

- 新增 Flyway `V16__rework_close_metadata.sql`。
- 新增 `ReworkCloseRequest`，扩展 `ReworkRecordResponse`。
- 新增 `POST /reworks/{reworkId}/close`。
- `WorkflowExecutionService` 增加返工锁定、目标节点权限校验、重新出检通过门禁和关闭写入。
- 前端「返工终检」页新增原因分类、责任类型、关闭备注和「关闭返工」按钮。
- 更新 OpenAPI、acceptance、`package.json` 和静态检查脚本。

非目标：

- 不做责任分类字典后台管理。
- 不做复杂 DAG 回滚策略或跨节点影响范围分析。
- 不新增终检专用角色/权限点，第一增量复用 `check:write`。
- 不做返工通知联动、绩效明细归因或完整返工处理台。

验收标准：

- 目标节点未在来源失败检查后重新提交 `OUT/PASS` 时，`POST /reworks/{reworkId}/close` 返回 409。
- 目标节点重新 `OUT/PASS` 后，WORKER/ADMIN 可关闭返工，响应 `status=DONE`。
- 响应和列表查询能返回 `reason_category`、`responsibility_type`、`close_note` 和 `closed_at`。
- 前端能在「返工终检」页填写关闭信息并点击「关闭返工」。

建议验证命令：

```bash
npm run check:task9d17
npm run check:openapi
npm run acceptance
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#reworkCanCloseOnlyAfterTargetOutPassAndKeepsResponsibilityClassification test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 新增 `V16__rework_close_metadata.sql`，为 `rework_record` 增加 `close_note`、`closed_by_user_id`、`closed_at` 和关闭状态索引。
- `closeRework` 会锁定返工记录和目标节点，要求目标节点对当前 WORKER 可操作，且存在来源失败检查之后的 `OUT/PASS` 记录。
- 关闭后写入 `DONE`、原因分类、责任类型、关闭备注、关闭人和关闭时间。
- 前端 `/rework-final` 页面新增关闭表单和 `data-testid="rework-close-button"`。
- `docs/api/openapi.yaml` 已新增 `/reworks/{reworkId}/close` 和 `ReworkCloseRequest`；当前为 64 paths / 75 operations / 75 operationIds。
- 新增 `scripts/check-task-9d17-rework-close.mjs`、`npm run check:task9d17`，并纳入 `acceptance.json`。

验收结果：

- TDD 红灯：`CheckWorklogPerformanceTests#reworkCanCloseOnlyAfterTargetOutPassAndKeepsResponsibilityClassification` 首次失败于 `/reworks/{reworkId}/close` 返回 404，确认返工关闭接口缺失。
- 精准后端回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#reworkCanCloseOnlyAfterTargetOutPassAndKeepsResponsibilityClassification test`：PASS，1 test / 0 failures / 0 errors。

未完成原因：

- 责任分类仍是输入值持久化，尚未做字典、校验、报表和责任归因规则。
- 返工关闭只校验目标节点重新 `OUT/PASS`，尚未实现复杂 DAG 影响范围、通知联动或绩效明细归因。
- Task 8 总体仍保持 `NOT READY`，仍缺完整弱网/跨设备续传、生产级 AI 治理、终检专用角色/附件、部署/操作手册和完整浏览器 12 步验收。

## 任务 9D.16：终检报告第一增量

状态：completed-first-increment。

来源：

- Task 8 readiness 把终检报告列为正式上线前生产端硬缺口。
- 9D.14 已实现发货前必须有最后一道工序 `OUT/PASS` 终检出检记录，但没有可留存、可读取的终检报告。

目标：

- 后端建立终检报告表，保证一单一份报告。
- 生成报告前必须存在订单最后一道工序节点的 `OUT/PASS` 终检出检记录。
- 内部角色可读取终检报告，医生端禁止读取。
- 前端在现有「返工终检」页提供最小报告生成入口。

范围：

- 新增 Flyway `V15__final_inspection_report.sql`。
- 新增 `FinalInspectionReportRequest`、`FinalInspectionReportResponse`。
- 新增 `POST /final-inspection-reports` 和 `GET /final-inspection-reports/{orderId}`。
- `WorkflowExecutionService` 增加最后工序识别、终检通过门禁和报告幂等生成。
- 前端「返工终检」页新增报告摘要、生成终检报告按钮和报告结果展示。
- 更新 OpenAPI、acceptance、`package.json` 和静态检查脚本。

非目标：

- 不做终检附件上传、电子签名或 PDF 导出。
- 不新增终检专用角色/权限点，第一增量复用 `check:write` / `check:read-internal`。
- 不关闭返工记录，不做责任分类或复杂 DAG 返工影响范围。
- 不改变 9D.14 发货门禁逻辑。

验收标准：

- 缺少最后工序 `OUT/PASS` 终检出检记录时，`POST /final-inspection-reports` 返回 409。
- 补齐终检通过后，WORKER/ADMIN 可生成终检报告，响应包含 `report_id`、`report_no`、`final_node_instance_id`、`final_check_id` 和 `conclusion=PASS`。
- `GET /final-inspection-reports/{orderId}` 可读取已生成报告。
- 医生 Bearer token 访问终检报告返回 403。
- 前端能在「返工终检」页填写报告摘要并点击「生成终检报告」。

建议验证命令：

```bash
npm run check:task9d16
npm run check:openapi
npm run acceptance
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#finalInspectionReportRequiresFinalOutPassAndIsInternalOnly test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 新增 `final_inspection_report`，按 `order_id` 唯一约束一单一份报告，并关联最终节点与终检出检记录。
- `createFinalInspectionReport` 会定位订单最后一道工序节点，缺少该节点 `OUT/PASS` 检查时返回 409；重复生成返回已有报告。
- `getFinalInspectionReport` 复用内部检查记录读取权限；WORKER 只能读取本人分配最终节点的报告，医生端被权限拦截。
- 前端 `/rework-final` 页面新增终检报告摘要、生成按钮和报告结果展示；Vite 代理新增 `/final-inspection-reports`。
- `docs/api/openapi.yaml` 已新增 2 个 path 和 `FinalInspectionReportRequest/Response` schema；当前为 63 paths / 74 operations / 74 operationIds。
- 新增 `scripts/check-task-9d16-final-report.mjs`、`npm run check:task9d16`，并纳入 `acceptance.json`。

验收结果：

- TDD 红灯：`CheckWorklogPerformanceTests#finalInspectionReportRequiresFinalOutPassAndIsInternalOnly` 首次失败于 `/final-inspection-reports` 返回 404，确认终检报告接口缺失。
- 精准后端回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#finalInspectionReportRequiresFinalOutPassAndIsInternalOnly test`：PASS，1 test / 0 failures / 0 errors。
- 执行模块回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test`：PASS，6 tests / 0 failures / 0 errors。
- `npm run check:task9d16`：PASS。
- `npm run check:openapi`：PASS，63 paths / 74 operations / 74 operationIds。
- `npm run acceptance`：PASS，`acceptance.json valid`。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。

未完成原因：

- 当前只做终检报告表、接口和页面级最小入口，不做终检附件、PDF、电子签名或专用角色。
- 当前不自动关闭返工，不补责任分类或复杂返工影响范围。
- Task 8 总体仍保持 `NOT READY`，下一轮优先补完整返工闭环或生产级 AI 治理。

## 任务 9D.15：真实 DeepSeek 接入第一增量

状态：completed-first-increment。

来源：

- Task 8 readiness 把“真实 DeepSeek / 模型适配层”列为上线硬缺口。
- 任务 7 只实现 deterministic 安全占位，`ai_audit_log.model_name` 固定为 `deterministic-placeholder`。

目标：

- 在不提交真实密钥的前提下，后端支持通过 DeepSeek OpenAI-compatible `/chat/completions` 生成 AI-1、AI-2、AI-3 公开问答和 AI-5 草稿。
- 未启用 DeepSeek 或未配置真实 key 时，继续使用 deterministic 安全占位，不影响本地开发和测试。
- AI-3 继续只使用 `DoctorOrderAssistantReadModel` 脱敏上下文；内部问题仍本地安全拒绝，不外呼模型。
- AI 调用审计记录真实 `model_name`、输入 token 和输出 token。

范围：

- 新增 `AiGatewayProperties`、`AiModelClient`、`AiModelResult`、`DeepSeekAiModelClient` 和配置入口。
- `AiGatewayService` 接入模型适配层，保留 deterministic fallback。
- 新增 `AiGatewayDeepSeekTests`，用本地 stub 验证真实适配路径和 AI-3 脱敏上下文。
- 更新 `.env.example`、`application.yml`、OpenAPI、acceptance 和检查脚本。
- 前端继续复用既有医生订单工作台「医生 AI」入口；真实模型由后端配置切换，不需要前端传密钥。

非目标：

- 不提交真实 DeepSeek API Key。
- 不做流式输出、重试、限流、成本统计、提示词版本管理或生产告警。
- 不让 AI 自动审核、自动发送、自动写入订单字段或自动下发生产指令。
- 不让 AI-3 读取内部工序、员工、入检/出检、返工、工时、绩效等字段。

验收标准：

- 启用 DeepSeek 配置并注入 key 时，AI-1/AI-2/AI-3 公开问答/AI-5 会调用 `/chat/completions`。
- DeepSeek 请求带 `Authorization: Bearer ...`，请求体包含 `model=deepseek-chat`。
- AI-3 发送给模型的上下文不包含内部生产备注。
- 医生询问内部问题时返回 `SAFE_REFUSAL`，且不调用 DeepSeek。
- `ai_audit_log` 对真实模型调用记录 `model_name=deepseek-chat` 和输出 token。
- 默认配置仍为 deterministic，本地无 key 不外呼。

建议验证命令：

```bash
npm run check:task9d15
npm run check:openapi
npm run acceptance
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests,AiGatewayDeepSeekTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 新增 DeepSeek 配置：`AI_PROVIDER`、`AI_DEEPSEEK_ENABLED`、`AI_DEEPSEEK_BASE_URL`、`AI_DEEPSEEK_MODEL`、`AI_DEEPSEEK_TEMPERATURE`、`AI_DEEPSEEK_MAX_TOKENS`、连接/读取超时和 `DEEPSEEK_API_KEY`。
- `DeepSeekAiModelClient` 使用 Spring `RestClient` 调用 OpenAI-compatible `/chat/completions`，解析 `choices[0].message.content` 与 `usage.prompt_tokens/completion_tokens`。
- `AiGatewayService` 在 AI-1、AI-2、AI-3 公开问答和 AI-5 中接入模型适配；AI-4 继续规则化检查缺失资料。
- AI-3 内部问题仍本地拒绝，不调用模型；公开问答只发送 `DoctorOrderAssistantReadModel` 公开上下文。
- `docs/api/openapi.yaml` 已标注 9D.15 DeepSeek 适配、deterministic fallback 和 AI-3 `SAFE_REFUSAL` 语义。
- 新增 `scripts/check-task-9d15-deepseek.mjs`、`npm run check:task9d15`，并纳入 `acceptance.json`。

验收结果：

- TDD 红灯：`AiGatewayDeepSeekTests#enabledDeepSeekProviderCallsOpenAiCompatibleEndpointAndAuditsRealModel` 首次失败于启用 DeepSeek 后仍返回 deterministic 翻译草稿，确认真实适配缺失。
- 精准后端回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test`：PASS，1 test / 0 failures / 0 errors。
- AI 模块回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests test`：PASS，3 tests / 0 failures / 0 errors。
- `npm run check:task9d15`：PASS。

未完成原因：

- 当前只完成模型适配第一增量，没有真实 key 环境联调记录。
- 当前未实现流式输出、重试、限流、成本统计、提示词版本管理、生产告警或更细输出防护。
- 当前不自动写入订单字段，仍需人工确认页面和业务写入接口配套。
- Task 8 总体仍保持 `NOT READY`，下一轮优先补终检报告 / 完整返工闭环或生产级 AI 治理。

## 任务 9D.14：终检发货拦截第一增量

状态：completed-first-increment。

来源：

- 任务 8 readiness 明确正式上线前必须防止未终检订单被客服直接发货。
- 现有 `POST /orders/{orderId}/logistics` 会直接写物流并把外部状态更新为 `SHIPPED`，没有校验终检出检记录。

目标：

- 发货前必须存在订单最后一道工序节点的 `OUT/PASS` 终检出检记录。
- 缺少终检通过记录时返回 409，不写物流、不更新 `SHIPPED`、不发送发货通知。
- 前端提供最小发货入口，并把 409 转成用户可读的终检阻断提示。

范围：

- 后端 `CollaborationService#shipOrder` 增加发货前终检门禁。
- `MessageDesignBillNotificationTests` 增加红灯测试，覆盖未终检阻断和终检通过后发货。
- 生产看板详情新增承运商、物流单号和「录入物流并发货」入口。
- OpenAPI、acceptance、`package.json` 和静态检查同步。

非目标：

- 不新增终检报告表或附件上传。
- 不新增终检专用角色/权限点。
- 不关闭返工记录、不做责任分类。
- 不做真实物流平台对接。

验收标准：

- 未存在最后一道工序 `OUT/PASS` 检查记录时，`POST /orders/{orderId}/logistics` 返回 409。
- 阻断时不生成 `ORDER_SHIPPED` 通知。
- 补齐最后一道工序 `OUT/PASS` 后，同一接口可发货并返回 `SHIPPED`。
- 医生订单详情外部状态更新为 `SHIPPED`。
- 生产看板发货入口遇到 409 时显示“终检出检通过后才能发货”。

建议验证命令：

```bash
npm run check:task9d14
npm run check:openapi
npm run acceptance
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=MessageDesignBillNotificationTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- `CollaborationService` 新增 `requireFinalOutCheckPass`，发货前检查订单最后 `step_order` 节点均有 `check_record.check_type='OUT' AND result='PASS'`。
- `MessageDesignBillNotificationTests#shipmentRequiresFinalOutCheckPassBeforeUpdatingExternalProjection` 先红后绿，覆盖阻断、无通知、补终检后发货和医生外部状态。
- 前端生产看板新增 `shipProductionBoardOrder`、承运商/物流单号输入、发货按钮和 409 友好提示。
- `docs/api/openapi.yaml` 已标注 9D.14 发货前置条件和 409 语义。
- 新增 `scripts/check-task-9d14-shipping-gate.mjs`、`npm run check:task9d14`，并纳入 `acceptance.json`。

验收结果：

- TDD 红灯：`MessageDesignBillNotificationTests#shipmentRequiresFinalOutCheckPassBeforeUpdatingExternalProjection` 首次失败于期望 409 但当前返回 200，确认缺发货门禁。
- 精准后端回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=MessageDesignBillNotificationTests#shipmentRequiresFinalOutCheckPassBeforeUpdatingExternalProjection test`：PASS。
- 协同模块回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=MessageDesignBillNotificationTests test`：PASS，5 tests / 0 failures / 0 errors。
- `npm run check:task9d14`：PASS。
- `npm run check:openapi`：PASS，61 paths / 72 operations / 72 operationIds。
- `npm run acceptance`：PASS，`acceptance.json valid`。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- 浏览器 smoke：临时启动后端和 Vite，admin 在生产看板搜索订单 `9D14-1939db70751a`，录入物流 `SF-1782889291788` 后页面显示发货成功；数据库核验 `orders.internal_status/external_status` 与 `order_logistics.logistics_status` 均为 `SHIPPED`。

未完成原因：

- 当前只做发货前服务端硬门禁和生产看板最小入口，不做终检报告、终检附件、终检专用角色或完整物流平台接入。
- 当前只要求最后一道工序存在 `OUT/PASS`，复杂返工关闭和责任分类仍未完成。
- Task 8 总体仍保持 `NOT READY`，下一轮优先补终检报告 / 完整返工闭环或生产级 AI 治理。

## 任务 9D.13：设计稿多文件/多版本第一增量

状态：completed-first-increment。

来源：

- 2026-07 新版资料要求设计稿多文件、多版本。
- 当前任务 6 / 9D.1 只支持 `design_draft.file_id` 单文件结构，医生端仅展示单个 `file_id`。

目标：

- 同一设计稿版本可绑定多个文件。
- 同一订单重复上传设计稿时继续生成递增版本号。
- 医生端只看到客服审核通过后的多文件版本。
- 保留旧 `file_id` 响应兼容。

范围：

- 新增设计稿文件关联表和旧数据回填迁移。
- 后端上传设计稿时写入全部 `file_ids`。
- 响应新增 `file_ids` 和 `file_count`。
- 内部订单页提供多个 `file_id` 上传新版设计稿的最小入口。
- 医生订单工作台展示同一版本多个文件 ID 和文件数。
- OpenAPI、acceptance 和静态检查同步。

非目标：

- 不做完整 Uppy 设计稿上传 Dashboard。
- 不做签名预览 URL 聚合。
- 不做三轮驳回/重传专用页面。
- 不做设计稿确认是否阻塞生产节点的业务规则。

验收标准：

- 上传 `file_ids=[a,b]` 后，响应 `file_id=a`、`file_ids=[a,b]`、`file_count=2`。
- 同一订单再次上传设计稿生成 `version=2`。
- 客服审核通过前医生不可见；审核通过后医生端可见多文件列表。
- 响应不泄露内部备注。

建议验证命令：

```bash
npm run check:task9d13
npm run check:openapi
npm run acceptance
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=MessageDesignBillNotificationTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 新增 Flyway `V14__design_draft_multi_file.sql`，建立 `design_draft_file`，并把历史 `design_draft.file_id` 回填为关联记录。
- `DesignDraftResponse` 新增 `file_ids`、`file_count`，保留 `file_id` 作为兼容主文件。
- `CollaborationService` 上传设计稿时规范化多个 `file_id`，写入关联表，并在列表/详情响应中按上传顺序返回。
- `MessageDesignBillNotificationTests` 新增多文件/多版本红灯测试。
- 前端内部订单页新增设计稿 `file_id` 输入与上传按钮；医生订单工作台展示多个文件 ID 和文件数。
- `docs/api/openapi.yaml`、`acceptance.json`、`package.json` 和 `scripts/check-task-9d13-design-drafts.mjs` 已同步。
- 修正 `.route-panel` 布局，让登录后的业务页面跨导航右侧两列，避免表单在默认宽度下被挤压不可操作。

验收结果：

- TDD 红灯：`MessageDesignBillNotificationTests#designDraftUploadKeepsMultipleFilesPerVersionAndIncrementsVersions` 首次失败于响应缺少 `$.data.file_ids[0]`。
- 精准后端回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=MessageDesignBillNotificationTests#designDraftUploadKeepsMultipleFilesPerVersionAndIncrementsVersions test`：PASS。
- 协同模块回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=MessageDesignBillNotificationTests test`：PASS，4 tests / 0 failures / 0 errors。
- 后端模块全量回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test`：PASS，59 tests / 0 failures / 0 errors。
- `npm run check:task9d13`：PASS。
- `npm run check:openapi`：PASS，61 paths / 72 operations / 72 operationIds。
- `npm run acceptance`：PASS，`acceptance.json valid`。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- 浏览器 smoke：CS 在内部订单页为订单 `9D13-1782887063685` 上传 `file_id=761,762` 的多文件设计稿，审核通过后 doctor 在医生订单工作台看到 `文件 ID：761, 762` 和 `文件数：2`，且未泄露 `9D13_INTERNAL_NOTE_DO_NOT_LEAK`。

未完成原因：

- 当前只支持输入已完成 `file_id`，不做完整设计稿文件上传 Dashboard。
- 当前不聚合预览/下载签名 URL。
- 当前未补三轮驳回、重传、确认的完整浏览器回归。
- Task 8 总体仍保持 `NOT READY`，下一轮优先补终检报告 / 完整返工闭环或生产级 AI 治理。

## 任务 9D.12：动态表单 CRUD 第一增量

状态：completed-first-increment。

来源：

- 2026-07 新版资料把动态表单配置维护列为上线前硬缺口。
- 9D.2 已有医生端只读动态表单和下单读取链路，但后台没有创建、编辑、停用字段能力。

目标：

- ADMIN 可以在后台创建、编辑、停用动态表单字段。
- 医生端继续只读取 `ACTIVE` 字段。
- 动态表单字段停用采用逻辑停用，不删除历史配置。
- OpenAPI、acceptance 和前端最小入口同步。

范围：

- 后端 `POST /form-configs` 新增字段。
- 后端 `PUT /form-configs/{fieldId}` 编辑字段名、必填、选项、排序和状态。
- 新增 `form:manage` 权限和后台「动态表单」菜单。
- 前端后台最小新增、编辑、停用入口。
- 后端 TDD 测试、OpenAPI 和静态检查。

非目标：

- 不做面向医生的复杂表单设计器。
- 不做拖拽排序、条件联动、版本发布或客户字段最终确认。
- 不做客服审核、生产审核、工序实例化、完整 Uppy 或真实 DeepSeek。

验收标准：

- 医生账号调用动态表单管理接口返回 403。
- ADMIN 可创建字段，医生只读接口可以读到新建 `ACTIVE` 字段。
- ADMIN 可更新字段标签、选项、必填、排序和状态。
- 字段停用后，医生只读接口不再返回该字段。
- OpenAPI 与 acceptance 同步，前端后台入口可完成新增、编辑和停用。

建议验证命令：

```bash
npm run check:task9d12
npm run check:openapi
npm run acceptance
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=FormConfigManagementTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- 新增 `CreateFormFieldRequest`、`UpdateFormFieldRequest`，`FormFieldConfigResponse` 增加 `status`。
- `FormConfigService` 新增创建、更新、字段类型校验、状态校验、选项 JSON 读写和重复字段 409。
- `FormConfigController` 新增 `POST /form-configs`、`PUT /form-configs/{fieldId}`，统一要求 `form:manage` / ADMIN。
- 新增 Flyway `V13__form_config_management_menu.sql`，补 `form:manage` 权限、ADMIN 授权和「动态表单」后台菜单。
- 前端新增 `/system/form-configs` 后台页面，可筛选产品、创建字段、编辑字段和停用字段。
- `docs/api/openapi.yaml` 已同步动态表单 `status`、create/update 请求响应和 `status=INACTIVE` 逻辑停用描述。
- 新增 `scripts/check-task-9d12-form-crud.mjs`、`npm run check:task9d12`，并把 9D.12 关键文本纳入 `acceptance.json`。

验收结果：

- TDD 红灯：新增 `FormConfigManagementTests` 后首次运行失败于 `POST /form-configs` 返回 405，确认管理接口缺失。
- 精准后端回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=FormConfigManagementTests test`：PASS，1 test / 0 failures / 0 errors。
- 后端模块全量回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test`：PASS，58 tests / 0 failures / 0 errors。
- `npm run check:task9d12`：PASS。
- `npm run check:openapi`：PASS，61 paths / 72 operations / 72 operationIds。
- `npm run acceptance`：PASS，`acceptance.json valid`。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- `git diff --check`：PASS。
- 9D.12 浏览器 smoke：临时启动后端和 Vite，用系统 Chrome 跑 Playwright；admin 创建、更新并停用测试字段成功，测试产品 `SMOKE_1782885092995`，字段 `smoke_field_1782885092995`。

未完成原因：

- 当前只完成后台 CRUD 第一增量，未确认客户最终字段清单。
- 当前不做复杂表单设计器、条件联动、版本发布、字段变更历史 UI 或批量排序。
- Task 8 总体仍保持 `NOT READY`，下一轮优先补终检报告 / 完整返工闭环或生产级 AI 治理。

## 任务 9B.8：Refresh Token / logout 第一增量

状态：completed-first-increment。

来源：

- 2026-07 新版资料把 JWT / Refresh Token / logout 列为账号登录硬缺口。
- 9A/9B 已有 HMAC Bearer access token，但没有服务端 refresh token 持久化和登出吊销。

目标：

- 登录返回 `accessToken`、`refreshToken` 和 `refreshExpiresAt`。
- 有效 refresh token 可以刷新 access token。
- logout 可以吊销 refresh token，吊销后 refresh 返回 401。
- 前端有最小刷新和退出登录入口。

范围：

- 后端 refresh token 哈希存储、刷新、吊销。
- OpenAPI refresh/logout schema。
- 前端登录态刷新和退出登录按钮。
- acceptance 静态检查。

非目标：

- 不做 refresh token 轮换。
- 不做 access token 服务端黑名单；已签发 access token 仍等待自然过期。
- 不接完整 Spring Security/JWT 或多设备会话管理 UI。
- 不做本地存储持久化。

验收标准：

- `BearerIdentityTests` 覆盖登录、refresh、logout、logout 后 refresh 401。
- refresh token 明文不入库，只保存 hash。
- 前端提供刷新 Token 和退出登录按钮。
- OpenAPI 和 acceptance 同步。

建议验证命令：

```bash
npm run check:auth-refresh
npm run check:openapi
npm run acceptance
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests,AuthStartupValidatorTests,PermissionInterceptorTests test
npm run build:frontend
```

完成记录：

- 新增 `auth_refresh_token` 表，只保存 SHA-256 token hash，并记录 `created_at`、`expires_at`、`last_used_at`、`revoked_at`。
- `/api/auth/login` 返回 `refreshToken` 与 `refreshExpiresAt`。
- 新增 `POST /api/auth/refresh`，使用有效 refresh token 换发新的 access token；第一增量不轮换 refresh token。
- 新增 `POST /api/auth/logout`，吊销 refresh token；吊销后的 refresh 返回 401。
- 前端骨架登录态新增「刷新 Token」和「退出登录」按钮。
- `docs/api/openapi.yaml` 已同步 `RefreshTokenRequest`、`refreshToken`、`refreshExpiresAt`、`/auth/refresh` 和 `/auth/logout`。
- 新增 `scripts/check-auth-refresh.mjs`、`npm run check:auth-refresh`，并把 9B.8 关键文本纳入 `acceptance.json`。

验收结果：

- TDD 红灯：`BearerIdentityTests#refreshTokenCanIssueNewAccessTokenAndLogoutRevokesIt` 首次运行失败于登录响应缺少 `$.refreshToken`，确认 refresh/logout 能力缺口存在。
- 精准后端回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests#refreshTokenCanIssueNewAccessTokenAndLogoutRevokesIt test`：PASS。
- 鉴权回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests,AuthStartupValidatorTests,PermissionInterceptorTests test`：PASS，15 tests / 0 failures / 0 errors。
- `npm run check:auth-refresh`：PASS。
- `npm run check:openapi`：PASS。
- `npm run acceptance`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- 浏览器 smoke：临时启动后端和 Vite 后，doctor 登录成功，点击「刷新 Token」返回新的 `accessToken` 且保留 `refreshToken/refreshExpiresAt`，点击「退出登录」后回到登录页。

未完成原因：

- 当前只完成可吊销 refresh token 第一增量，不做 refresh token 轮换。
- logout 只吊销 refresh token，不做 access token 服务端黑名单。
- 当前没有多设备会话管理 UI、登录态本地持久化或完整 Spring Security/JWT 接入。
- Task 8 总体仍保持 `NOT READY`，下一轮优先补终检报告 / 完整返工闭环或生产级 AI 治理。

## 任务 9D.11：医生订单草稿/补资料闭环

状态：completed-first-increment。

来源：

- 2026-07 新版 PRD/API 明确医生下单支持实时保存草稿、保存草稿、驳回后补资料并重新提交。
- 当前 9D.2 第一增量只支持直接提交订单，`OrderCreationService` 对 `is_draft=true` 返回 400。

目标：

- 支持医生创建草稿、编辑草稿、提交草稿。
- 支持 `CS_REJECTED` / `PRODUCTION_REJECTED` 后医生补资料并重新提交。
- 保持医生端脱敏、文件归属校验、状态历史和通知事实表一致。

范围：

- 后端订单草稿/补资料状态流。
- `PUT /orders/{orderId}` 的草稿编辑和补资料语义。
- 前端医生下单页保存草稿、继续编辑、重新提交入口。
- OpenAPI 合并更新与测试。

非目标：

- 不做实时自动保存。
- 不做完整 Uppy Dashboard。
- 不做客户最终动态表单字段确认。
- 不接真实 DeepSeek。

验收标准：

- 医生保存草稿后订单内部状态为 `DRAFT`，不进入客服审核队列。
- 医生只能查看和编辑本人草稿。
- 医生提交草稿后进入 `PENDING_CS_REVIEW` / `PENDING_REVIEW`，并写状态历史和通知。
- 客服驳回后，医生可修改 `form_data` / `file_ids` 并重新提交。
- 医生端响应仍不包含内部字段。
- 跨诊所或非本人草稿编辑返回 403 或 404。

建议验证命令：

```bash
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests,PermissionInterceptorTests test
npm run check:task9d11
npm run build:frontend
```

完成记录：

- `POST /orders` 已支持 `is_draft=true` 保存医生草稿，草稿允许缺必填字段，不进入客服审核队列，不写 `DOCTOR_SUBMIT_ORDER` 状态历史。
- 新增 `UpdateOrderRequest` 和 `PUT /orders/{orderId}`，仅允许医生本人更新 `DRAFT / CS_REJECTED / PRODUCTION_REJECTED` 订单。
- `submit=true` 时校验动态表单必填字段，并把草稿提交或驳回单重新提交到 `PENDING_CS_REVIEW / PENDING_REVIEW`。
- 文件绑定仍要求本人、已完成、医生可见；已绑定到该订单的 `file_id` 可重复提交。
- 前端医生订单工作台新增保存草稿、继续编辑/补资料、提交草稿/补资料和取消编辑入口。
- `docs/api/openapi.yaml` 已同步 `DRAFT` 外部状态、`UpdateOrderRequest` 和 `PUT /orders/{orderId}` 当前响应 schema。
- 新增 `scripts/check-task-9d11-frontend.mjs` 和 `npm run check:task9d11`，并把 9D.11 后端、前端、OpenAPI 关键文本纳入 `acceptance.json`。

验收结果：

- TDD 红灯：新增 9D.11 测试后首次运行失败于 `is_draft=true` 返回 400，以及 `PUT /orders/{orderId}` 返回 405，确认缺草稿和补资料接口。
- 后端回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests test`：PASS，14 tests / 0 failures / 0 errors。
- 后端权限回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests,PermissionInterceptorTests test`：PASS，18 tests / 0 failures / 0 errors。
- `npm run check:task9d11`：PASS。
- `npm run check:task9d2`：PASS。
- `npm run check:openapi`：PASS，61 paths / 72 operations / 72 operationIds。
- `npm run acceptance`：PASS，`acceptance.json valid`。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- 后端模块全量回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test`：PASS，56 tests / 0 failures / 0 errors。
- 9D.11 浏览器 smoke：临时启动后端和 Vite 后，doctor 保存草稿并提交草稿成功，订单 `ORD20260701-E172DF6DD8` 从 `DRAFT` 进入 `PENDING_REVIEW`。

未完成原因：

- 当前只做手动保存草稿和手动重新提交，不实现实时自动保存。
- 当前仍沿用医生订单工作台单文件 Vue 页面，不拆组件、不做页面级 E2E。
- 当前不实现完整 Uppy Dashboard、草稿上传临时文件池、动态表单字段最终确认或真实 DeepSeek。

## 任务 0：接口契约与项目基线

状态：已完成。

目标：

- 修复 OpenAPI YAML，使其能被 Swagger / SDK 工具解析。
- 建立稳定的接口契约来源。
- 明确后续前后端联调按该契约执行。

范围：

- 修复 `duration_efficiency` 缺空格问题。
- 修复 `standard_duration` 同类缺空格问题。
- 合并重复的 `/form-configs` path 定义。
- 检查 56 个接口是否按模块保留。
- 把修复版 API 放入仓库稳定路径：`docs/api/openapi.yaml`。

验收结果：

- OpenAPI 文件可被解析器读取。已通过。
- `/form-configs` 同时包含 GET 和 POST。已通过。
- 接口模块仍覆盖 Auth、User、Clinic、OrderForm、File、Order、Workflow、Check、WorkLog、Performance、Message、DesignDraft、Bill、AI、Notification。已通过。

验证命令：

```bash
npm run check:openapi
```

完成记录：

- 稳定契约文件：`docs/api/openapi.yaml`。
- 任务 0 解析结果：45 个 path，56 个 operation；任务 8B 二次冻结后更新为 49 个 path，60 个 operation；任务 9B.6 后为 50 个 path，61 个 operation；任务 9C.2 后为 54 个 path，65 个 operation；任务 9D.10 后为 61 个 path，72 个 operation；任务 9B.8 后当前契约仍为 61 个 path，72 个 operation。
- `/form-configs` 已合并为单一 path，并同时保留 `get` 与 `post`。
- Redocly lint warning 已在任务 8B 清零；`npm run check:openapi` 现在同时校验 operationId、统一错误响应、Swagger validate 和 Redocly lint。

## 任务 0.1：TRD V1.1 对齐与开发计划冻结

状态：已完成。

目标：

- 读取并吸收 TRD V1.1 深度研究优化版。
- 将开发计划从旧任务 1-5 重排为可执行的 M1-M6 任务链。
- 明确默认执行口径，减少不必要阻塞。

验收结果：

- 文档明确采用 TRD V1.1 作为当前开发计划修订依据。
- 旧的“文件上传方案未确认”不再阻塞任务 4，改为默认 Uppy + MinIO 预签名/Multipart。
- 任务拆分覆盖模块化单体、轻量 DAG、状态投影、医生端脱敏、文件鉴权、AI 工具白名单、通知先落库、专项测试矩阵。
- 待确认问题只保留客户/PM 真正需要拍板的业务细节。

## 任务 1：项目骨架初始化

状态：已完成 HTTP/API 烟测。

详细任务文件：`tasks/TASK-002-project-skeleton-initialization.md`。

目标：

- 初始化模块化单体后端和 Vue3 前端。
- 建立本地开发命令、环境变量模板、Docker Compose 基础服务。

范围：

- 后端 Spring Boot / RuoYi-Vue-Pro 基线。
- 前端 Vue3 + Element Plus 基线。
- MySQL、Redis、MinIO 本地服务。
- `.env.example`，不包含真实密钥。
- 基础登录和角色可运行。
- 后端模块目录按 V1.1 划分：system-auth、clinic-user、order-form、order-status、workflow-definition、workflow-runtime、check-rework、worklog-performance、file-center、message-design、bill-logistics、ai-gateway、notification-ws。

非目标：

- 不做业务模块。
- 不接真实 DeepSeek Key。

验收标准：

- 本地能启动前后端。
- 能登录至少 ADMIN 测试账号。
- MySQL、Redis、MinIO 均可连通。
- README 更新真实运行命令。

当前环境风险：

- 本机缺少 Java Runtime 和 Maven/Gradle。若不先安装 JDK/Maven，则只能创建后端文件结构，不能本机编译运行后端。
- Docker CLI 和 Colima 可用，但当前 Docker daemon 未运行。如选择容器化后端构建，还需在任务 1 开始时启动 Colima 或切换到可用 Docker context。

完成记录：

- 已选择并执行路线 A：本机 JDK 21 + Maven。
- 已安装 Homebrew `openjdk@21` 和 `maven`。
- 已新增后端 Maven 多模块骨架：`backend/`。
- 已新增前端 Vue3 + Element Plus 骨架：`frontend/`。
- 已新增 MySQL、Redis、MinIO 的 `compose.yaml`。
- 已新增 `.env.example`、根目录 `package.json`、`pnpm-workspace.yaml`、`scripts/with-jdk21.sh`、`scripts/check-toolchain.sh`。

验收结果：

- `npm run check:toolchain`：通过。
- `npm run test:backend`：通过，16 个 Maven 模块成功。
- `npm run install:frontend`：通过。
- `npm run build:frontend`：通过。
- `npm run compose:config`：通过。
- `npm run compose:up`：通过，MySQL、Redis、MinIO 均 healthy。
- 后端 health、ADMIN login、`/auth/me` API：通过。
- 前端 dev server 首页 HTTP 加载：通过。
- Vite `/api` 代理 health/login：通过。

机器验收：

- `acceptance.json` 已新增 `TASK-002` 文件存在和关键章节检查。

剩余限制：

- 当前 ADMIN 登录为骨架烟测，不是正式 RuoYi-Vue-Pro 权限体系。
- 后端已在任务 2 接入 MySQL/Flyway；Redis、MinIO 尚未接入业务模块。
- 浏览器点击级 smoke 未自动化执行；当前完成的是构建、HTML 加载、API 和 Vite 代理级验收。

## 任务 2：数据库模型与 9 条工序链初始化

状态：已完成数据库和 HTTP 烟测。

目标：

- 建立 TRD V1.1 核心业务表与索引。
- 初始化 9 条预定义工序链。

范围：

- 用户权限复用 RuoYi；新增或扩展 clinic、customer_preference、orders、order_status_history、order_external_projection、form_field_config。
- 工艺流定义：`workflow_chain`、`workflow_node`、`workflow_edge`。
- 工序实例：`order_process_instance`、`order_process_node`、`order_process_edge`。
- 检查返工：`check_record`、`rework_record`。
- 工时绩效：`work_log`，`work_log_pause_segment` 作为建议项，排期紧可先累计 pause_duration。
- 文件、消息、设计稿、账单物流、AI、通知相关表：`file_resource`、`file_access_audit`、`order_message`、`message_review_log`、`design_draft`、`order_bill`、`order_logistics`、`ai_audit_log`、`notification_event`、`user_notification`。
- 9 条工艺链的 chain/node/edge 种子数据。
- Flyway SQL 迁移方案。

验收标准：

- 9 条工序链可查询。
- 每条链有节点和边。
- 支持分支、并联、可选节点的数据表达。
- 订单实例可引用 `chain_version`。
- 表结构包含状态投影、实例边表、返工、文件审计、AI 审计、通知事实来源。

完成记录：

- 已选择并执行 Flyway SQL，迁移文件位于 `backend/platform-server/src/main/resources/db/migration/`。
- `V1__create_core_schema.sql` 已创建 TRD V1.1 核心业务表、工艺定义/实例表、返工、工时、文件审计、AI 审计、通知事实来源等结构。
- `V2__seed_workflow_chains.sql` 已按 `.local-context/生产流程.docx` 初始化 9 条工序链、节点和边。
- 已实现最小只读接口：`GET /workflow-chains`、`GET /workflow-chains/{chainId}/nodes`。
- `standard_duration` 暂无真实标准工时，已按计划保留为空。

验收结果：

- `docker compose up -d mysql redis minio`：通过，基础服务运行中。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml test`：通过，16 个 Maven 模块成功，Spring Boot 上下文加载并执行 Flyway v1/v2。
- SQL 验收：`workflow_chain` 为 9 条；每条链均有节点和边；查询到 `intake`、`implant_abutment`、`veneer_route` 分支；可选节点为 10 个；重复工序名均有唯一 `node_code`。
- HTTP 验收：`GET /workflow-chains` 返回 9 条；`GET /workflow-chains/1/nodes` 返回常规冠修复 30 个节点，并按 `step_order` 排序。

剩余限制：

- 任务 2 不实现订单生产审核后的工序实例化，不实现派工、转派、工时、入检/出检、返工。
- 源生产流程存在孤立重复箭头和局部排版不连续，本轮按节点顺序标准化为顺序边；如客户提供修订版，应新增链版本迁移。
- Flyway 对 MySQL 8.4 有兼容性 warning，但本轮迁移和测试已在本机 MySQL 8.4 通过。

## 任务 3：订单状态投影与医生端脱敏基础

状态：已完成状态投影和脱敏烟测。

目标：

- 实现 `internal_status` / `external_status` 状态模型。
- 建立 `OrderStatusProjector`、医生端外部投影和安全读模型。

范围：

- `OrderStatusService`。
- `OrderStatusProjector`。
- `order_status_history`。
- `order_external_projection`。
- `OrderDoctorVO`。
- `OrderInternalDTO`。
- `DoctorOrderAssistantReadModel`。
- 医生端接口、医生端 WebSocket、医生端文件访问、AI-3 的统一脱敏测试。

验收标准：

- 状态变更统一走服务。
- `external_status` 不允许前端传值，也不允许业务模块随意写。
- 内部状态变化后能刷新外部投影。
- 医生端响应不含内部字段。
- 跨诊所访问返回 403 或空数据。
- AI-3 只能读取医生端安全读模型。

完成记录：

- 已新增 `InternalOrderStatus` / `ExternalOrderStatus` 枚举。
- 已新增 `OrderStatusService` 和 `OrderStatusProjector`，状态变更会写 `order_status_history` 并刷新 `order_external_projection`。
- 已新增 Flyway `V3__order_status_projection_foundation.sql`，补齐 `orders.version`、`cs_user_id`、`production_note`、`reject_reason`、状态索引，并把公开状态默认值调整为 `PENDING_REVIEW`。
- 已新增 `DoctorOrderVO`、`OrderInternalDTO`、`DoctorOrderAssistantReadModel`。
- 已实现最小接口：`GET /orders/{orderId}`、`POST /orders/{orderId}/confirm-receipt`、`POST /ai/order-query`、医生端访问 `GET /orders/{orderId}/process-instance` 返回 403。

验收结果：

- `npm run compose:up && scripts/with-jdk21.sh mvn -f backend/pom.xml test`：通过，5 个测试通过，Flyway 校验 3 个迁移。
- SQL 验收：`flyway_schema_history` v1/v2/v3 均成功；`orders` 与 `order_external_projection` 中可查到 `PRODUCING` / `QC` 等投影结果。
- HTTP 验收：医生端 `GET /orders/{orderId}` 只返回 `external_status` 等公开字段，不含 `internal_status`、`production_note`、`cs_user_id`；管理员详情包含内部字段；医生访问 `process-instance` 返回 403；AI-3 回答只含外部状态。

剩余限制：

- 本轮不实现正式 RuoYi-Vue-Pro RBAC/DataScope；`X-Bootstrap-*` 头只用于本地烟测。
- 本轮不实现订单列表、下单、客服审核、生产审核、工序实例化、设计稿、账单物流完整业务。
- AI-3 当前是安全占位回答，后续接入真实模型时必须继续只读 `DoctorOrderAssistantReadModel`。

## 任务 4：文件上传与访问权限

状态：已完成文件上传与访问权限烟测。

目标：

- 支持医生下单附件、消息附件、设计稿、账单文件。

范围：

- MinIO 私有桶。
- Uppy 上传。
- 后端生成预签名上传参数；大文件按阈值启用或预留 S3 Multipart。
- 上传完成后调用 complete，后端 `statObject` 校验对象存在、大小、类型、etag。
- `file_resource.upload_status`。
- 预览/下载签名 URL。
- 文件访问策略。
- 文件审计日志。

待确认：

- Multipart 阈值、文件大小、类型、数量限制。

验收标准：

- 文件上传、预览、下载均写审计。
- 医生不能访问其他诊所文件，不能访问内部入检/出检附件。
- 前端不能直接拿永久 object_key。

完成记录：

- 已在 `platform-server` 接入 MinIO Java SDK。
- 已新增 `V4__file_upload_access_foundation.sql`，为 `file_resource` 增加 `upload_status`，并补上传状态/归属查询索引。
- 已新增 `POST /files/upload-token`，返回 `file_id`、预签名 PUT URL、过期秒数，不返回永久 `object_key`。
- 已新增 `POST /files/{fileId}/complete`，通过 MinIO `statObject` 校验对象存在、大小、content type 和 etag，并写入 `COMPLETED`。
- 已新增 `GET /files/{fileId}/preview-url`、`GET /files/{fileId}/download-url`，返回短时效签名 URL。
- 已实现医生端文件访问边界：仅允许本人/本诊所访问 `DOCTOR`、`DOCTOR_CS`、`ALL` 可见文件，拒绝 `INTERNAL` 和跨诊所/跨医生访问。
- 已实现 `file_access_audit` 写入：上传 token、complete、preview、download、拒绝访问均有记录。

验收结果：

- TDD 红灯：`FileAccessTests` 首次运行失败于 `/files/upload-token` 404 和 `upload_status` 列不存在，确认测试覆盖任务缺口。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=FileAccessTests test`：通过，2 个文件访问测试通过。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml test`：通过，16 个 Maven 模块成功，7 个测试通过，Flyway 校验 4 个迁移。
- HTTP/SQL smoke：真实后端启动后，`upload-token -> curl PUT presigned URL -> complete -> preview-url -> download-url` 通过；审计表查到 `UPLOAD_TOKEN`、`COMPLETE`、`PREVIEW`、`DOWNLOAD` 的 `ALLOWED` 记录。
- 拒绝访问 smoke：其他医生/诊所访问同一文件返回 403，并写入 `PREVIEW / DENIED` 审计记录。

剩余限制：

- 本轮不实现前端 Uppy 页面。
- 本轮不实现完整 S3 Multipart 分片创建、分片签名、合并流程；当前为单对象预签名 PUT，并保留阈值配置。
- 文件类型、大小、数量限制仍需 PM/客户最终确认；当前本地默认最大 200MB。
- 正式 RuoYi-Vue-Pro RBAC/DataScope 尚未接入；`X-Bootstrap-*` 头只用于本地烟测。
- `docs/api/openapi.yaml` 后续需要同步 complete、签名 URL 和错误响应契约。

## 任务 5A：Workflow Runtime 与工序节点状态机

状态：已完成 Workflow Runtime 基础烟测。

目标：

- 实现订单工序实例化、任务池、派工转派、DAG 激活、并联汇合和可选节点。

验收标准：

- 并联节点必须全部完成或跳过，汇合节点才进入 READY。
- 条件不满足的可选节点默认不生成；人工跳过才生成 SKIPPED 并记录原因。
- 模板变更不影响历史订单实例。

完成记录：

- 已新增 `POST /orders/{orderId}/production-review`，生产审核通过后按指定 `chain_id` 实例化工序链。
- 已复制定义层节点/边到订单实例快照，保留 `chain_version`，模板后续变更不影响历史实例。
- 已实现 `branch_params` / `intake_branch` 分支过滤，未匹配分支节点默认不生成。
- 已实现节点状态：`PENDING`、`READY`、`IN_PROGRESS`、`COMPLETED`、`SKIPPED`。
- 已实现 DAG 激活：无前置节点初始 READY；并联汇合节点等待全部前置节点完成或跳过。
- 已实现派工、转派、任务池：`process-instance/assign`、`nodes/{nodeInstanceId}/reassign`、`GET /tasks/mine`。
- 已实现节点 start / complete / skip 内部接口，并为可选节点跳过记录 `skipped_at`、`skip_reason`。
- 已把 `GET /orders/{orderId}/process-instance` 从内部 501 占位改为真实内部查询，同时医生端仍返回 403。

验收结果：

- TDD 红灯：`WorkflowRuntimeTests` 首次运行失败于 `/orders/{orderId}/production-review` 404，确认测试覆盖任务缺口。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=WorkflowRuntimeTests test`：通过，2 个 Workflow Runtime 测试通过。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml test`：通过，16 个 Maven 模块成功，9 个测试通过，Flyway 校验 5 个迁移。
- HTTP/SQL smoke：真实后端启动后，`production-review -> process-instance -> assign -> start -> complete -> skip -> tasks/mine` 通过；汇合节点在一个前置完成且另一个可选节点未跳过时保持 `PENDING`，跳过后进入 `READY`。

剩余限制：

- 本轮不实现入检/出检、返工、工时、暂停、绩效统计。
- 本轮不实现前端生产看板、任务池页面和 WebSocket 通知。
- 本轮仍使用 `X-Bootstrap-*` 本地烟测角色/用户头，正式 RBAC/DataScope 待接入。
- `docs/api/openapi.yaml` 后续需要补齐节点 start/complete/skip 接口和 4xx 响应。

## 任务 5B：入检 / 出检 / 返工 / 工时绩效

状态：已完成后端最小执行链路和 HTTP/SQL 烟测。

目标：

- 实现生产执行闭环、返工影响范围、服务端工时与绩效统计。

验收标准：

- 未入检不能开工；未完工不能出检。
- 出检不通过生成返工记录，历史不删除。
- 返工产生新的 work_log，不能覆盖原工时。
- 工时由服务端计算，暂停不计入有效工时。
- 重复点击开始/暂停/继续/完成不会重复记录。
- WORKER 只能看本人绩效，ADMIN 看全量。

完成记录：

- 已新增 `workflow/execution` 后端最小执行模块。
- 已实现 `POST /check-records`：入检/出检记录写入 `check_record`，`check_type=1` 映射入检，`check_type=2` 映射出检。
- 已在节点开工前加入入检门禁：`need_in_check=1` 的节点必须有 `IN/PASS` 检查记录。
- 已实现出检时序约束：节点未 `COMPLETED` 时提交出检返回 409。
- 已实现出检失败返工：写 `rework_record`，返工目标节点重新置为 `READY`，历史检查和工时记录不删除。
- 已实现 `POST /work-logs/start`、`/work-logs/{id}/pause`、`/resume`、`/finish`，工时由服务端时间计算，暂停段通过 `work_log_pause_segment` 扣除。
- 已实现 `GET /performance`：WORKER 强制只看本人绩效，ADMIN 可按 `user_id` 查询指定员工。
- 已把任务 5A 测试链的入/出检需求显式设为 0，避免任务 5B 门禁反向污染 5A 的 DAG 测试。

验收结果：

- TDD 红灯：`CheckWorklogPerformanceTests` 首次运行失败于 `/check-records` 404 和未入检仍可开工，确认测试覆盖任务缺口。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test`：通过，2 个测试覆盖入检门禁、出检时序、返工、暂停扣时、重复返工工时和绩效范围。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml test`：通过，16 个 Maven 模块成功，11 个测试通过，Flyway 校验 5 个迁移。
- HTTP/SQL smoke：真实后端启动后，`production-review -> assign -> start(409 before in-check) -> in-check -> start -> work-log start/pause/resume/finish -> complete -> out-check fail -> rework -> restart -> second work-log -> performance` 通过；本轮 smoke 记录有效工时 480 秒，返工后生成第二条 `work_log`。

剩余限制：

- 本轮不实现前端入检/出检、返工、工时、绩效页面。
- 本轮不实现完整责任分类、返工原因字典、返工影响范围的复杂 DAG 回滚策略；当前按指定目标节点重新置为 `READY`。
- 本轮不实现正式 RuoYi-Vue-Pro RBAC/DataScope；`X-Bootstrap-*` 头仍仅用于本地烟测。
- `standard_duration` 仍暂无真实客户标准，绩效中的效率类指标只按已有字段计算，不补造标准工时。
- `docs/api/openapi.yaml` 后续需要同步任务 5A/5B 新增运行时接口的 4xx 响应和 DTO 细节。

## 任务 6：消息、设计稿、账单物流与通知

状态：已完成后端最小协同链路和 HTTP/SQL 烟测。

目标：

- 跑通消息、设计稿、账单物流和 WebSocket 通知主链路。

验收标准：

- 医生只收到公开事件。
- 内部任务、返工、工时、绩效事件不推送给医生。
- 账单物流状态能更新医生端外部投影。

完成记录：

- 已新增 `collaboration` 后端最小模块，覆盖消息、设计稿、账单、物流和通知事实落库。
- 已实现 `GET/POST /orders/{orderId}/messages`，WORKER 消息默认 `PENDING_REVIEW`，医生端审核前不可见。
- 已实现 `POST /messages/{msgId}/review` 和 `GET /messages/pending-review`，客服审核通过或编辑通过后医生端可见公开消息。
- 已实现 `GET/POST /orders/{orderId}/design-drafts`、客服审核和医生确认/驳回接口；医生端只看 `PENDING_DOCTOR_CONFIRM`、`DOCTOR_CONFIRMED`、`DOCTOR_REJECTED` 状态的设计稿。
- 已实现 `GET/POST /orders/{orderId}/bill` 和 `GET/POST /orders/{orderId}/logistics`；物流发货后通过 `OrderStatusService` 更新订单外部状态为 `SHIPPED`。
- 已实现通知事实写入：公开消息、设计稿、账单上传、订单发货均写 `notification_event`，指定用户写 `user_notification` 作为未读补偿。
- 已保持医生端脱敏边界：医生端接口不返回内部状态、内部生产备注、内部任务、返工、工时或绩效。

验收结果：

- TDD 红灯：`MessageDesignBillNotificationTests` 首次运行失败于 `/orders/{orderId}/messages`、`/design-drafts`、`/bill` 404，确认测试覆盖任务缺口。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=MessageDesignBillNotificationTests test`：通过，3 个测试覆盖消息审核、设计稿审核/医生确认、账单物流和医生端通知边界。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml test`：通过，16 个 Maven 模块成功，14 个测试通过，Flyway 校验 5 个迁移。
- HTTP/SQL smoke：真实后端启动后，`worker message -> CS review -> doctor messages -> design upload -> CS approve -> doctor confirm -> bill upload -> logistics ship -> doctor order detail` 通过；本轮 smoke 写入 7 条通知事实事件，医生端 4 条未读补偿，订单外部状态为 `SHIPPED`。

剩余限制：

- 本轮不实现真实 WebSocket 长连接在线推送；通知事实来源和未读补偿已落库，在线推送留给后续通知模块细化。
- 本轮不实现前端消息中心、设计稿确认、账单物流页面。
- 本轮设计稿表仍沿用当前 `design_draft.file_id` 单文件结构；OpenAPI 的 `file_ids` 暂取首个文件，完整多文件版本需后续迁移扩展。
- 本轮不实现消息附件 URL 拼装、设计稿文件预览 URL 聚合和账单预览 URL 聚合；文件签名 URL 能力已由任务 4 提供。
- 本轮不实现正式 RuoYi-Vue-Pro RBAC/DataScope；`X-Bootstrap-*` 头仍仅用于本地烟测。

## 任务 7：AI Gateway 与 5 个 AI 智能体

状态：已完成后端最小 AI Gateway 和 HTTP/SQL 烟测。

目标：

- 实现 AI 上下文构造、工具白名单、模型调用、输出防护和审计。

验收标准：

- AI-3 只能使用 `DoctorOrderAssistantReadModel`。
- AI-3 被询问内部工序、员工、返工、工时、绩效时，只能拒绝或回答公开状态。
- 所有 AI 调用写 `ai_audit_log`。
- AI 输出只做草稿或查询结果，不自动审核、自动驳回、自动发送、自动下发正式指令。

完成记录：

- 已新增 `ai` 后端最小模块，覆盖 OpenAPI 既有 5 个 AI 端点：`POST /ai/translate`、`POST /ai/cs-query`、`POST /ai/order-query`、`POST /ai/check-missing`、`POST /ai/production-note`。
- 已把 AI-1 / AI-2 / AI-4 / AI-5 接入统一 `AiGatewayService`，AI-3 的既有 `/ai/order-query` 改为走同一个 service。
- 已实现角色白名单：AI-1/AI-2 为 CS/ADMIN，AI-3 为 DOCTOR，AI-4 为 DOCTOR/CS/ADMIN，AI-5 为 CS/WORKER/ADMIN。
- 已实现固定上下文类型和审计落库，成功回答与 AI-3 安全拒绝均写 `ai_audit_log`，`model_name=deterministic-placeholder`。
- 已实现 AI-3 内部问题识别：医生询问内部工序、员工、入检/出检、返工、工时、绩效、责任等信息时，只返回安全拒绝和公开状态/账单/物流/公开消息。
- 已实现 AI-4 基于 `form_field_config.required_flag` 和订单 `form_data` 的资料缺失检查，医生端访问仍校验本人/本诊所范围。
- 已保持 AI 输出只做草稿或查询结果，不自动写订单字段、不自动发送消息、不自动驳回或下发生产指令。

验收结果：

- TDD 红灯：`AiGatewayTests` 首次运行失败于 `/ai/translate`、`/ai/check-missing` 404，以及 AI-3 内部问题未安全拒绝，确认测试覆盖任务缺口。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests test`：通过，3 个测试覆盖 5 个 AI 端点、AI-3 安全拒绝、AI-4 缺失项检查、医生跨诊所拒绝和 `ai_audit_log`。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml test`：通过，16 个 Maven 模块成功，17 个测试通过，Flyway 校验 5 个迁移。
- HTTP/SQL smoke：真实后端启动后，`translate -> cs-query -> doctor order-query safe-refusal -> check-missing -> production-note` 通过；本轮 smoke 写入 5 条 AI 审计记录，其中 1 条 `SAFE_REFUSAL`，1 条 `DOCTOR_ORDER_ASSISTANT_READ_MODEL` 上下文。
- `npm run acceptance`：通过，`acceptance.json valid`。
- `git diff --check`：通过。

剩余限制：

- 本轮不接入真实 DeepSeek API、流式输出、模型重试、限流、成本统计和提示词版本管理。
- AI-2 当前只返回最小内部订单摘要，尚未聚合完整工序实例、消息、文件、质检、返工、工时等客服知识上下文。
- AI-5 客户模板未确认，当前只生成通用生产备注草稿，不写入订单字段。
- 本轮仍使用 `X-Bootstrap-*` 本地烟测角色/数据范围，正式 RBAC/DataScope 待接入。
- `docs/api/openapi.yaml` 后续需要补齐 Task 7 的 4xx 响应、operationId、审计语义和真实模型错误响应。

## 任务 8：专项验收矩阵与上线准备

状态：进行中；8A readiness audit、8B OpenAPI 二次契约、9C.2 通知未读/已读、9C.3 通知实时前端/Redis 广播第一增量和 9D.1 医生订单工作台第一增量已落地，正式上线缺口未完成。

目标：

- 按 TRD V1.1 测试矩阵完成回归、部署和交付准备。

验收标准：

- PRD 12 步主链路通过。
- 所有专项测试通过。
- 部署正式环境前完成操作手册和回归记录。

## 任务 8A：专项验收矩阵与上线缺口冻结

状态：`in-progress/readiness-audit-complete`。

目标：

- 不补业务功能，先客观冻结 PRD 12 步主链路、TRD 专项测试、设计稿补充验收、权限/脱敏/文件/AI/状态机红线的当前状态。
- 给后续上线冲刺提供明确入口：哪些已通过，哪些只是后端最小链路，哪些被客户/PM 确认阻塞，哪些尚未实现。

完成记录：

- 已新增 `docs/acceptance/task-8-acceptance-matrix.md`，按 `PASS / PARTIAL / BLOCKED / NOT_STARTED` 标注当前验收状态。
- 已新增 `docs/acceptance/task-8-regression-record.md`，记录本轮实际检查、HTTP/SQL smoke 和已有自动化测试覆盖。
- 已新增 `docs/deployment/readiness-checklist.md`，列出正式上线前必须补齐的硬门禁。
- 已增强 `acceptance.json`，新增 Task 8A 三份文档存在和关键标题检查；未削弱既有 RepoFrame 检查。

验收结果：

- `npm run acceptance`：PASS。
- `npm run check:toolchain`：PASS。
- `npm run compose:config`：PASS。
- `npm run check:openapi`：PASS，OpenAPI 可解析，`/form-configs` GET/POST 保留。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留 VueUse PURE comment 与大 chunk warning。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml test`：PASS_WITH_WARNINGS，16 个模块成功，`platform-server` 17 tests 通过；保留 MySQL 8.4 / Flyway 支持 warning。
- HTTP/SQL smoke：PASS_WITH_NOTICE。Health、ADMIN login、9 条预定义链存在、常规冠节点查询、医生端脱敏、跨医生 403、AI-3 安全拒绝与 `ai_audit_log` 均通过；本地历史测试数据导致 `/workflow-chains` 总数为 41，不代表种子数据错误。

剩余限制：

- 任务 8A 不是正式上线完成；当前上线结论为 `NOT READY`。
- 后续至少需要拆出 OpenAPI 二次契约、正式 RBAC/DataScope、WebSocket、前端业务页面、真实 DeepSeek/模型适配、Multipart/大文件验收、部署手册与操作手册等任务。
- `X-Bootstrap-*` 仍只是本地烟测机制，不能作为生产鉴权。

## 任务 8B：OpenAPI 二次契约与错误响应冻结

状态：已完成。

目标：

- 将任务 4-7 新增接口、统一 4xx、operationId、关键 DTO/schema 和 AI/文件/Workflow runtime 错误响应同步到 `docs/api/openapi.yaml`。

完成记录：

- 已将 `docs/api/openapi.yaml` 从 45 个 path / 56 个 operation 更新为 49 个 path / 60 个 operation；任务 9B.6 后为 50 个 path / 61 个 operation；任务 9C.2 后为 54 个 path / 65 个 operation；任务 9D.10 后为 61 个 path / 72 个 operation；任务 9B.8 后当前仍为 61 个 path / 72 个 operation。
- 已补齐缺失接口：`POST /files/{fileId}/complete`、`POST /process-instance/nodes/{nodeInstanceId}/start`、`POST /process-instance/nodes/{nodeInstanceId}/complete`、`POST /process-instance/nodes/{nodeInstanceId}/skip`。
- 已为全部 72 个 operation 补唯一 `operationId`。
- 已为全部 operation 补统一 `400 / 401 / 403 / 404 / 409 / 503 / default` 错误响应引用。
- 已补齐任务 4-7 当前实现相关 schema：文件上传/签名、生产审核、工序实例、节点动作、入检/出检、工时、消息、设计稿、账单物流、AI 请求响应。
- 已新增 `scripts/check-openapi-contract.rb`，并把 `npm run check:openapi` 升级为自定义契约检查 + Swagger validate + Redocly lint。

验收结果：

- `npm run check:openapi`：PASS，输出 `openapi contract ok`、`paths=60`、`operations=71`、`operationIds=71`；Swagger validate 通过；Redocly lint 通过且无 warning。

剩余限制：

- 本任务只冻结当前后端基线契约，不代表产品级上线完成。
- 后续新增正式 RBAC/DataScope、WebSocket、前端页面、真实 DeepSeek、大文件断点续传等接口时，仍需同步更新 OpenAPI 并保持 `npm run check:openapi` 通过。

## 任务 9：正式 RuoYi RBAC/DataScope 接入

状态：进行中；9A Bearer 身份基线、9B.1 后端权限守卫、9B.2 数据库化 RBAC/DataScope 基础、9B.3 权限注解/统一拦截器、9B.4 DataScope SQL 过滤第一增量、9B.5 文件/协同/AI DataScope 扩展、9B.6 菜单/部门/岗位/前端权限路由第一增量、9B.7 生产鉴权门禁第一增量和 9B.8 Refresh Token/logout 第一增量已落地，完整 RuoYi RBAC/DataScope 未完成。

目标：

- 用正式登录态、角色权限和数据范围替换 `X-Bootstrap-*` 本地烟测头，并重跑医生端脱敏、文件越权、AI 越权和 WORKER 绩效范围专项测试。

### 任务 9A：服务端签发 Bearer 身份基线

状态：已完成。

范围：

- 新增服务端签发 HMAC Bearer token，不再返回固定静态 token。
- 请求携带 `Authorization: Bearer ...` 时，由服务端校验签名、过期时间、角色、用户和诊所范围，并写入请求级身份上下文。
- 业务层 `BootstrapIdentity.fromHeaders` 优先使用 Bearer token 身份。
- `X-Bootstrap-*` 暂时保留为本地烟测兼容路径，并受 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS` 开关控制。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests test`：PASS，3 个测试通过。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml test`：PASS，16 个模块成功，`platform-server` 26 tests 通过。
- `npm run check:openapi`：PASS，登录响应 schema 已同步为当前 `accessToken / username / roles / expiresAt`。

剩余限制：

- 9A 不是完整 RuoYi RBAC；尚未接入 RuoYi 账号表、菜单权限、角色权限、权限注解和完整 DataScope。
- 业务 controller 仍保留 `X-Bootstrap-*` 兼容参数；正式环境必须关闭 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS`。

### 任务 9B：正式 RuoYi RBAC/DataScope 接入

状态：进行中；9B.1、9B.2、9B.3、9B.4、9B.5、9B.6 第一增量已完成，完整 RuoYi 接入未完成。

目标：

- 接入正式 RuoYi 账号、角色、权限和 DataScope。
- 逐步移除业务接口对 `X-Bootstrap-*` 的依赖。
- 用 Bearer token 重跑医生端脱敏、文件越权、AI 越权和 WORKER 绩效范围专项测试。

#### 任务 9B.1：后端权限/DataScope 守卫第一增量

状态：已完成。

范围：

- 新增 `AccessControlService`，集中后端角色权限和数据范围守卫。
- 把医生订单范围、AI 角色白名单、文件医生范围、Workflow Runtime、Check/WorkLog/Performance 的高风险判断迁入统一守卫。
- 修复派工/转派接口未读取当前身份的问题；派工、转派、跳过可选节点仅允许 CS/ADMIN。
- `GET /check-records/{nodeInstanceId}` 改为内部数据接口，医生端 Bearer token 返回 403。
- `GET /performance` 收紧为 WORKER 只能看本人，ADMIN 可按 `user_id` 查询；CS/医生返回 403。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests,WorkflowRuntimeTests,CheckWorklogPerformanceTests test`：PASS，10 个测试通过。
- `WorkflowRuntimeTests` 新增 WORKER Bearer token 不能派工/跳过节点回归。
- `CheckWorklogPerformanceTests` 新增 DOCTOR Bearer token 不能读入检/出检记录、CS Bearer token 不能查绩效回归。

未完成原因：

- 9B.1 仍不是完整 RuoYi RBAC/DataScope；没有接入 RuoYi 账号表、菜单权限、权限注解、正式 DataScope 或 Spring Security。
- controller 仍保留 `X-Bootstrap-*` 本地兼容参数；正式环境仍必须设置 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=false`。
- 文件越权、AI 越权和更多业务接口还需要继续用 Bearer token/正式账号体系做更完整回归。

#### 任务 9B.2：数据库化账号/角色/权限/DataScope 基础

状态：已完成。

范围：

- 新增 Flyway `V6__auth_rbac_datascope_foundation.sql`。
- 建立 `system_user`、`system_role`、`system_permission`、`system_user_role`、`system_role_permission` 过渡表。
- 初始化本地开发账号：`admin/change-me-admin`、`cs/change-me-cs`、`worker/change-me-worker`、`doctor/change-me-doctor`。
- 本地账号密码以 PBKDF2-SHA256 hash 存储，不写明文密码到数据库。
- `/api/auth/login` 改为数据库登录，聚合 roles、permissions、dataScope 后签发 Bearer token。
- `/api/auth/me` 返回 token 中的 `username`、`userId`、`clinicId`、`roles`、`permissions`、`dataScope`。
- `docs/api/openapi.yaml` 的 `LoginResponse` 已同步新增 `userId`、`clinicId`、`permissions`、`dataScope` 字段。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests test`：PASS，6 个测试通过；V6 migration 已应用。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml test`：PASS，16 个模块成功，`platform-server` 26 tests / 0 failures / 0 errors。
- `npm run check:openapi`：PASS，49 paths / 60 operations / 60 operationIds。
- `npm run build:frontend`：PASS，前端登录 smoke 类型已同步。
- HTTP smoke：真实后端启动后，`admin/change-me-admin` 登录成功，`/api/auth/me` 返回 `admin/ADMIN/ALL`，错误密码返回 401。

未完成原因：

- 9B.2 仍不是完整 RuoYi RBAC/DataScope；尚未接入 RuoYi 完整菜单、部门、岗位、数据权限 SQL 拦截和权限注解。
- controller 仍保留 `X-Bootstrap-*` 本地兼容参数；正式环境仍必须设置 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=false`。
- 任务 9B.4 第一增量已在权限注解/统一拦截器基础上补订单和工序实例查询级 DataScope 过滤；后续仍需用数据库账号 Bearer token 重跑文件、AI、消息、设计稿、账单物流等越权矩阵。

#### 任务 9B.3：权限注解与统一拦截器

状态：已完成。

范围：

- 新增 `@RequirePermission` 注解，支持声明权限码和本地兼容角色 fallback。
- 新增 `PermissionInterceptor` 和 `PermissionWebConfiguration`，统一拦截带注解的 Controller 入口。
- 对订单、文件、AI、Workflow Runtime、Check/WorkLog/Performance、消息、设计稿、账单物流等当前业务 Controller 增加权限注解。
- 数据库 Bearer token 优先按 `permissions` 权限码放行；`X-Bootstrap-*` 仅保留本地 smoke 兼容角色 fallback。
- 保留 service 层 `AccessControlService` 作为订单归属、医生诊所范围、WORKER 本人绩效、节点分配等数据范围兜底。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests,PermissionInterceptorTests,WorkflowRuntimeTests,CheckWorklogPerformanceTests,AiGatewayTests test`：PASS，19 tests / 0 failures / 0 errors。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml test`：PASS，16 个模块成功，`platform-server` 29 tests / 0 failures / 0 errors。
- `npm run acceptance`：PASS，`acceptance.json valid`。
- `npm run check:openapi`：PASS，49 paths / 60 operations / 60 operationIds，Swagger validate 和 Redocly lint 通过。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留 VueUse PURE comment 与大 chunk warning。
- `npm run compose:config`：PASS。
- `git diff --check`：PASS。

未完成原因：

- 9B.3 仍不是完整 RuoYi RBAC/DataScope；9B.6 已补菜单/部门/岗位/前端权限路由第一增量，但仍缺完整管理 UI、正式 DataScope SQL 拦截和生产级 Spring Security/JWT。
- `X-Bootstrap-*` 仍保留为本地 smoke 兼容路径；正式环境仍必须设置 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=false`。
- 9B.4 第一增量已补订单和工序实例查询级 DataScope 过滤；后续需要继续用数据库账号 Bearer token 扩展文件、AI、消息、设计稿、账单物流等越权矩阵。

#### 任务 9B.4：统一身份参数与查询级 DataScope 第一增量

状态：已完成第一增量；完整 RuoYi DataScope 未完成。

范围：

- 新增 `BootstrapIdentityArgumentResolver`，业务 Controller 直接接收 `BootstrapIdentity`，不再逐个声明 `X-Bootstrap-*` header。
- `PermissionWebConfiguration` 注册统一身份参数解析器；本地 `X-Bootstrap-*` 兼容只保留在解析器和权限拦截器中。
- `OrderProjectionQueryService` 对订单详情、内部订单详情、AI-3 安全读模型统一加入 SQL DataScope 过滤。
- `WorkflowRuntimeService#getProcessInstance` 对工序实例读取加入 SQL DataScope 过滤。
- DataScope 规则：`ALL` 可读全部；`CLINIC` 限定诊所或医生本人；`SELF` 限定医生本人、客服本人或已分配给当前员工的工序节点。
- 不新增公开 API；OpenAPI 不变。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=PermissionInterceptorTests,BearerIdentityTests,WorkflowRuntimeTests,CheckWorklogPerformanceTests,AiGatewayTests test`：PASS，20 tests / 0 failures / 0 errors。
- `PermissionInterceptorTests` 新增数据库工人 SELF DataScope 回归：未分配节点时读取订单和工序实例返回 403，分配节点后可读取。
- 业务 Controller 源码中不再直接出现 `X-Bootstrap-*` 或 `@RequestHeader` 解析本地身份；仅统一解析器、权限拦截器和 `/api/auth/me` 的 Authorization header 保留 header 读取。

未完成原因：

- 9B.4 第一增量仍不是完整 RuoYi DataScope；9B.6 已补菜单/部门/岗位/前端权限路由第一增量，但仍未实现通用 SQL 拦截器和完整 RuoYi 管理 UI。
- 9B.5 已继续覆盖文件、消息、设计稿、账单物流、AI 内部查询聚合；仍需后续补通用 SQL 拦截器、部门/岗位模型、前端权限路由。
- `X-Bootstrap-*` 仍保留为统一解析器中的本地 smoke 兼容路径；正式环境仍必须设置 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=false`。

#### 任务 9B.5：文件、协同与 AI 查询级 DataScope 扩展

状态：已完成第一增量；完整 RuoYi DataScope 未完成。

范围：

- `FileResourceService` 的上传 token 订单读取、文件 complete、预览、下载加入查询级 DataScope。
- 文件规则：`ALL` 可访问全部；`CLINIC` 只能访问同诊所/医生本人且医生可见文件；`SELF` 只能访问本人上传文件或已分配节点所在订单文件。
- `CollaborationService` 的消息、设计稿、账单物流等订单级操作先执行订单 DataScope，再执行医生可见性、审核状态等业务过滤。
- `AiGatewayService` 的 AI-1/AI-2/AI-4/AI-5 内部订单上下文读取加入订单 DataScope；AI-3 继续只读 `DoctorOrderAssistantReadModel`。
- 不新增公开 API；OpenAPI 不变。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=PermissionInterceptorTests,AiGatewayTests,MessageDesignBillNotificationTests,FileAccessTests test`：PASS，12 tests / 0 failures / 0 errors。
- `PermissionInterceptorTests` 扩展数据库工人 SELF DataScope 回归：未分配节点时读取消息和文件预览返回 403，分配节点后可读取。
- `MessageDesignBillNotificationTests` 和 `AiGatewayTests` 已补充 WORKER 已分配节点的真实业务前提，保持生产协同和 AI-5 生产备注路径可用。

未完成原因：

- 9B.5 仍不是完整 RuoYi DataScope；9B.6 已补菜单/部门/岗位/前端权限路由第一增量，但仍未实现通用 SQL 拦截器和完整 RuoYi 管理 UI。
- `X-Bootstrap-*` 仍保留为统一解析器中的本地 smoke 兼容路径；正式环境仍必须设置 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=false`。
- 仍需前端页面、WebSocket、真实 DeepSeek、部署/运维手册等 Task 8 上线缺口。

#### 任务 9B.6：菜单、部门、岗位与前端权限路由第一增量

状态：已完成第一增量；完整 RuoYi RBAC/DataScope 未完成。

范围：

- 新增 Flyway `V7__auth_menu_dept_post_foundation.sql`。
- 建立 RuoYi 风格基础表：`system_dept`、`system_post`、`system_user_post`、`system_menu`、`system_role_menu`。
- 为本地 ADMIN/CS/WORKER/DOCTOR 账号补部门、岗位和角色菜单种子数据。
- 登录和 `/api/auth/me` 返回 `menus`；前端骨架按后端菜单显示可访问入口。
- 医生账号前端不显示内部订单和系统权限入口；后端权限注解和 DataScope 仍是安全边界。
- `docs/api/openapi.yaml` 新增 `AuthMenu` / `CurrentUserResponse`，并补 `GET /auth/me` 契约。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests,PermissionInterceptorTests test`：PASS，10 tests / 0 failures / 0 errors。
- `npm run check:openapi`：PASS，50 paths / 61 operations / 61 operationIds。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- HTTP smoke：医生账号通过 Vite `/api/auth/login` 登录后只返回 `dashboard`、`doctor-orders`、`doctor-files`、`ai-doctor` 菜单，不返回 `internal-orders`。
- 浏览器 smoke：Playwright 使用本机 Chrome 登录医生账号，页面显示医生订单/医生 AI，不显示内部订单/系统权限。

未完成原因：

- 9B.6 仍不是完整 RuoYi-Vue-Pro；尚未实现部门/岗位/菜单管理页面、角色授权 UI、通用 DataScope SQL 拦截器或正式 Spring Security/JWT。
- `X-Bootstrap-*` 仍保留为统一解析器中的本地 smoke 兼容路径；正式环境仍必须设置 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=false`。
- 仍需前端业务页面、WebSocket、真实 DeepSeek、部署/运维手册等 Task 8 上线缺口。

#### 任务 9B.7：生产鉴权门禁第一增量

状态：已完成第一增量；完整生产鉴权仍未完成。

范围：

- 新增 `AuthStartupValidator`，启动时同步 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS` 到统一身份解析器。
- active profile 包含 `prod` 时，禁止 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=true`。
- active profile 包含 `prod` 时，禁止 `APP_AUTH_TOKEN_SECRET` 为空或仍使用 `local-dev-change-me-auth-secret`。
- 新增 `application-prod.yml`，生产 profile 默认关闭 `X-Bootstrap-*` 本地兼容，并要求 token secret 外部注入。
- 新增 acceptance 机器检查，确保生产门禁代码、prod 配置和测试文件存在。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AuthStartupValidatorTests,BearerIdentityTests,PermissionInterceptorTests test`：PASS，13 tests / 0 failures / 0 errors。
- `AuthStartupValidatorTests` 覆盖 prod profile 启用 bootstrap header 会 fail-fast、prod profile 使用本地 token secret 会 fail-fast、非生产环境可同步关闭本地 header 并返回 401。
- `BearerIdentityTests` 继续覆盖关闭 bootstrap header 后，只有 `X-Bootstrap-*` 且无 Bearer token 的请求返回 401。

未完成原因：

- 9B.7 只完成生产启动门禁，不等于完整 Spring Security/JWT 或完整 RuoYi-Vue-Pro 生产鉴权。
- `X-Bootstrap-*` 仍保留为本地 smoke 兼容路径；生产 profile 有 fail-fast 门禁，正式环境仍必须通过部署平台安全注入真实 `APP_AUTH_TOKEN_SECRET`。
- 仍需完整 RuoYi 管理 UI、通用 DataScope SQL 拦截器、前端业务页面、WebSocket、真实 DeepSeek 和部署/运维手册等 Task 8 上线缺口。

#### 任务 9C.1：WebSocket 通知第一增量

状态：已完成第一增量；完整通知上线能力仍未完成。

范围：

- 新增 `spring-boot-starter-websocket`，用于后端真实 WebSocket 通道。
- 新增 `/ws/connect?token={access_token}`，握手阶段校验 Bearer token，token 无效或缺少 `user_id` 时拒绝连接。
- 新增 `NotificationPushService`，以 `notification_event` / `user_notification` 为事实来源，只对当前在线用户推送已生成的脱敏 payload。
- 在线推送成功后写 `user_notification.delivered_at` 并更新 `notification_event.delivery_status='DELIVERED'`。
- `CollaborationService` 仍先落通知事实，再尝试在线推送；离线用户继续依赖未读补偿数据。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=NotificationWebSocketTests,MessageDesignBillNotificationTests test`：PASS，4 tests / 0 failures / 0 errors。
- `NotificationWebSocketTests` 使用真实随机端口 Tomcat + `StandardWebSocketClient`，覆盖医生 Bearer token 建立 WebSocket、账单通知在线推送、payload 不含内部备注、送达状态落库。
- `MessageDesignBillNotificationTests` 继续通过，证明原消息/设计稿/账单物流事实落库链路未被破坏。

未完成原因：

- 9C.1 是单实例在线推送第一增量；9C.2 已补通知列表、未读/已读 REST 接口和前端通知中心入口，但仍未实现 Redis 多实例广播、浏览器 WebSocket 实时接入和医生端完整业务页面验收。
- WebSocket payload 目前复用通知事实 payload；后续若扩展字段，必须继续保持医生端脱敏红线。
- 正式上线仍需把 WebSocket 纳入 Nginx/HTTPS、心跳、重连、监控和压测策略。

#### 任务 9C.2：通知未读/已读接口与前端消息中心入口

状态：已完成第一增量；完整通知上线能力仍未完成。

范围：

- 新增 `GET /notifications`，按当前 Bearer 身份列出本人通知，支持 `unread_only` 和 `limit`。
- 新增 `GET /notifications/unread-count`，返回当前用户未读通知数。
- 新增 `POST /notifications/{notificationId}/read`，只允许当前用户标记本人通知已读。
- 新增 `POST /notifications/read-all`，只更新当前用户自己的未读通知。
- 前端骨架新增登录后的「通知中心」入口，显示未读徽标、通知列表、刷新、单条已读和全部已读。
- Vite 本地开发代理新增 `/notifications` 到后端，通知中心按冻结契约访问通知 REST，不走不存在的 `/api/notifications`。
- `docs/api/openapi.yaml` 同步 4 个通知 REST operation，当前契约为 54 paths / 65 operations / 65 operationIds。
- `acceptance.json` 新增 9C.2 后端文件、关键逻辑、前端入口和 OpenAPI path 检查。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=NotificationRestTests,NotificationWebSocketTests test`：PASS，3 tests / 0 failures / 0 errors。
- `NotificationRestTests` 覆盖当前用户只读本人通知、不返回他人通知、未读数、单条已读、全部已读和已读后 unread-only 为空。
- `npm run check:openapi`：PASS，54 paths / 65 operations / 65 operationIds；Swagger validate 和 Redocly lint 通过。
- `npm run acceptance`：PASS，`acceptance.json valid`。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- Vite 代理 smoke：真实后端 + Vite dev server 下，doctor 登录后经 `/notifications` 路径读取 smoke 通知、查询未读数、标记单条已读和全部已读均通过。

未完成原因：

- 9C.2 只完成通知 REST 和前端骨架入口，不等于完整消息/通知业务页面。
- 9C.3 已补真实 WebSocket 连接、自动刷新、断线重连骨架和 Redis 广播代码路径；仍缺浏览器通知权限、真实双实例联调、通知定时补偿任务、Nginx/HTTPS WebSocket 配置和生产压测。

#### 任务 9C.3：前端 WebSocket 实时接入与 Redis 广播第一增量

状态：已完成第一增量；完整通知生产验收仍未完成。

范围：

- 前端通知中心登录后建立 `/ws/connect?token=...` WebSocket，连接状态显示为未连接/连接中/已连接/已断开。
- 收到实时推送后刷新通知列表和未读数，并显示最新实时通知摘要。
- Vite 本地开发代理新增 `/ws` WebSocket 代理。
- 后端新增 `spring-boot-starter-data-redis`，以及 `NotificationBroadcaster`、`NotificationRedisBroadcaster`、`NotificationRedisBroadcastListener`、`NotificationRedisBroadcastConfiguration`。
- `NotificationPushService` 先做本机投递，再发布 Redis 广播；监听器忽略本实例消息，只对远端实例消息触发本机投递。
- 新增环境变量：`APP_INSTANCE_ID`、`NOTIFICATION_REDIS_BROADCAST_ENABLED`、`NOTIFICATION_REDIS_CHANNEL`、`REDIS_HOST`。

验收结果：

- TDD 红灯：`NotificationBroadcastTests` 首次运行失败于缺少 `NotificationBroadcaster`、`NotificationBroadcastMessage`、`NotificationRedisBroadcastListener` 和 `pushLocalToUser`。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=NotificationBroadcastTests,NotificationWebSocketTests,NotificationRestTests test`：PASS，5 tests / 0 failures / 0 errors。
- `NotificationBroadcastTests` 覆盖本机无在线 session 时仍发布广播、远端广播不自回环且触发本机投递。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- Vite `/ws` 代理 smoke：真实后端 + Vite dev server 下，doctor 经 `ws://localhost:5173/ws/connect` 建立 WebSocket，admin 上传账单后收到 `BILL_UPLOADED` payload（smoke 订单 `WS-SMOKE-1782809858059`）。
- `acceptance.json` 已新增 9C.3 后端广播文件、配置、前端 WebSocket 和 Vite `/ws` 代理检查。

未完成原因：

- 9C.3 仍不是完整生产通知验收；本轮未启动两个后端实例做 Redis 端到端联调。
- 仍需 Nginx/HTTPS WebSocket 代理配置、心跳/重连策略压测、监控告警、浏览器通知权限和完整消息业务页面联动。
- Redis 广播默认关闭，正式或联调环境需显式设置 `NOTIFICATION_REDIS_BROADCAST_ENABLED=true` 并配置唯一 `APP_INSTANCE_ID`。

#### 任务 9D.1：医生订单工作台第一增量

状态：已完成第一增量；完整前端业务页面仍未完成。

范围：

- 后端补齐当前 OpenAPI 已冻结的 `GET /orders` 最小实现，支持 `page`、`size`、`keyword`、`external_status`。
- 医生端订单列表强制限定本人订单，返回脱敏 `DoctorOrderVO`；不返回 `internal_status`、`production_note`、`cs_user_id`。
- 前端新增「医生订单工作台」，医生可读取订单列表/详情、公开消息、医生可见设计稿、账单物流。
- 前端支持医生发送给客服的消息、确认/驳回待确认设计稿、调用医生 AI 查询订单公开状态、确认收货。
- Vite 本地代理新增 `/orders` 和 `/ai`；新增 `scripts/check-task-9d1-frontend.mjs` 与 `npm run check:task9d1`。
- `docs/api/openapi.yaml` 补 `OrderListResponse` / `DoctorOrderSummary`，当前仍为 54 paths / 65 operations / 65 operationIds。

验收结果：

- TDD 红灯：`OrderStatusProjectionTests#doctorOrderListUsesDataScopeAndDesensitizedProjection` 首次运行失败于 `GET /orders` 404。
- 红绿后同一测试通过，覆盖医生订单列表本人范围、外部状态、脱敏字段和内部备注不泄露。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests,PermissionInterceptorTests,AiGatewayTests,MessageDesignBillNotificationTests test`：PASS，15 tests / 0 failures / 0 errors。
- `npm run check:task9d1`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- Vite 代理 API smoke：doctor 经 `http://localhost:5173/api/auth/login` 登录后，通过 `/orders`、订单详情、消息、设计稿、账单、物流、`/ai/order-query` 读取 smoke 订单 `9D1-SMOKE-1782811019788`，未泄露 `TASK9D1_INTERNAL_NOTE_DO_NOT_LEAK`、`internal_status`、`production_note`。
- 浏览器 smoke：本机 Chrome 打开 `http://localhost:5173`，doctor 登录后进入「医生订单」，搜索 `9D1-SMOKE-1782811019788`，页面显示医生订单工作台、公开消息、账单物流，且未出现内部字段。

未完成原因：

- 9D.1 只是医生订单读取侧页面第一增量，不包含医生下单、动态表单、Uppy 上传、Multipart、客服审核、生产审核、生产任务池、质检工时或管理绩效页面。
- 医生端设计稿仍只展示 `file_id`，未聚合预览 URL；账单也未聚合签名预览 URL。
- 当前页面仍在单文件 Vue 骨架中实现，后续前端工程扩大时需要拆组件、补路由和页面级测试。

#### 任务 9D.2：医生下单 / 动态表单 / 上传入口第一增量

状态：已完成第一增量；完整医生下单与上传体验仍未完成。

目标：

- 补齐 PRD 12 步主链路中的“医生在线下单”第一可验收路径。
- 让医生端可以基于后端动态表单配置创建订单，并把本人已完成上传文件绑定到订单。

范围：

- `GET /form-configs?product_type=...` 返回有效表单字段，前端按字段渲染医生下单表单。
- `POST /orders` 仅允许医生创建本人订单，提交后进入 `PENDING_CS_REVIEW` / `PENDING_REVIEW`；本轮明确不支持草稿，`is_draft=true` 返回 400。
- 文件绑定只允许本人、已完成、医生可见的文件；不得允许医生绑定他人文件、内部文件或未完成上传文件。
- 前端先做医生端下单面板和 `file_id` 绑定入口；真实 Multipart 上传后续由 9D.10 第一增量补齐，客服审核和生产审核不并入本任务。

完成记录：

- 已新增 `V8__doctor_order_entry_form_seed.sql`，为 `REGULAR_CROWN` 提供第一增量默认动态表单字段：患者姓名、牙位、材料、色号、医生备注。
- 已新增 `FormConfigController` / `FormConfigService`，实现 `GET /form-configs` 只读动态表单配置。
- 已新增 `OrderCreationService`、`CreateOrderRequest`、`CreateOrderResponse`，实现医生 `POST /orders` 提交订单，并绑定本人已完成且医生可见的未绑定文件。
- 提交后通过 `OrderStatusService` 写入 `PENDING_CS_REVIEW` / `PENDING_REVIEW` 和 `order_status_history`，医生响应不返回 `internal_status`。
- 已补后端 TDD 回归：`OrderStatusProjectionTests#doctorCanReadDynamicFormAndCreateSubmittedOrderWithOwnCompletedFiles` 和 `#doctorCannotBindOtherUnfinishedOrInternalFilesWhenCreatingOrder`。
- 前端「医生订单工作台」已新增「新建订单」面板，动态读取表单、提交订单，并支持用逗号分隔的已完成 `file_id` 绑定附件。
- 已新增 `scripts/check-task-9d2-frontend.mjs`、`npm run check:task9d2`，并把 9D.2 后端、前端、OpenAPI 关键文本纳入 `acceptance.json`。
- `docs/api/openapi.yaml` 已同步 `FormFieldConfig`、`CreateOrderRequest` 和 `CreateOrderResponse`。
- 已修复 9D.2 浏览器验收回归：`/form-configs` 补入 Vite proxy，`scripts/check-task-9d2-frontend.mjs` 与 `acceptance.json` 纳入代理检查，避免动态表单请求落到 Vite HTML fallback。
- 已修复本地浏览器登录 CORS 回归：默认允许 `http://localhost:5173` 和 `http://127.0.0.1:5173`，并用 `BearerIdentityTests#databaseLoginAllowsLocalhostAndLoopbackViteOrigins` 覆盖。

验收结果：

- TDD 红灯：新增测试首次运行失败于 `GET /form-configs` 404 和 `POST /orders` 405，确认缺口存在。
- TDD 红灯：`BearerIdentityTests#databaseLoginAllowsLocalhostAndLoopbackViteOrigins` 首次运行失败于 `127.0.0.1:5173` Origin 返回 403，确认本地浏览器 CORS 缺口存在。
- TDD 红灯：`npm run check:task9d2` 收紧后首次失败于缺少 `frontend/vite.config.ts -> '/form-configs'`，确认动态表单 Vite 代理缺口存在。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests test`：PASS，7 tests / 0 failures / 0 errors。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests#databaseLoginAllowsLocalhostAndLoopbackViteOrigins test`：PASS，1 test / 0 failures / 0 errors。
- `npm run check:task9d2`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- `npm run check:openapi`：PASS，54 paths / 65 operations / 65 operationIds。
- `npm run acceptance`：PASS，`acceptance.json valid`。
- 运行态代理 smoke：带 `Origin: http://127.0.0.1:5173` 的 `/api/auth/login` 经 Vite 返回 200；`/form-configs?product_type=REGULAR_CROWN` 经 Vite 返回 `application/json`。
- 浏览器 smoke：doctor 在 `http://127.0.0.1:5173` 登录，进入「医生订单」，动态表单显示患者姓名、牙位、材料、色号、医生备注；填写必填项后创建订单 `ORD20260630-9D94797093`，页面显示 `PENDING_REVIEW`。

未完成原因：

- 9D.2 当时的上传入口只支持绑定已完成 `file_id`；9D.10 已补 Multipart 文件选择上传、本地恢复上传、服务端候选恢复和 100MB+ 浏览器上传 smoke 第一增量，但仍不是草稿上传、完整弱网/跨设备浏览器续传或完整 Uppy Dashboard。
- 本轮不实现草稿、生产审核、工序实例化或完整客服协同页面。
- 动态表单字段最终清单、完整弱网/跨设备续传、文件类型/数量限制仍需后续任务或 PM/客户确认。

#### 任务 9D.3：客服审核 / 驳回页面与接口第一增量

状态：已完成第一增量；完整客服工作台仍未完成。

目标：

- 补齐 PRD 12 步主链路中的“客服初审通过/驳回”第一可验收路径。
- 让客服能从待审订单列表进入订单初审，并把医生提交订单推进到生产审核前状态或驳回补资料状态。

范围：

- `GET /orders?internal_status=PENDING_CS_REVIEW` 支持内部角色按内部状态过滤待审订单；医生端仍不返回内部字段。
- `POST /orders/{orderId}/review` 支持 CS/ADMIN 对 `PENDING_CS_REVIEW` 订单执行 `APPROVE` 或 `REJECT`。
- 审核通过写入 `production_note`，通过 `OrderStatusService` 进入 `PENDING_PRODUCTION_REVIEW` / `PENDING_REVIEW`，不触发生产审核、不实例化工序。
- 审核驳回要求 `reject_reason`，通过 `OrderStatusService` 进入 `CS_REJECTED` / `PENDING_REVIEW`；医生端仍只看外部投影。
- 前端复用 `/orders/internal` 内部订单菜单，新增「客服初审」列表、订单资料和通过/驳回表单。

完成记录：

- 已新增 `OrderReviewRequest` / `OrderReviewService`，并在 `OrderController` 暴露 `POST /orders/{orderId}/review`。
- 已扩展 `OrderProjectionQueryService#listOrders` 和 `OrderController#listOrders`，支持内部角色使用 `internal_status` 过滤待审订单。
- 审核通过/驳回均写入 `order_status_history`，并写 `notification_event` / `user_notification` 医生通知事实。
- 已新增 `scripts/check-task-9d3-frontend.mjs`、`npm run check:task9d3`，并把 9D.3 后端、前端、OpenAPI 关键文本纳入 `acceptance.json`。
- `docs/api/openapi.yaml` 已同步 `OrderReviewRequest`、`internal_status` 列表过滤参数和 `/orders/{orderId}/review` 响应 schema。

验收结果：

- TDD 红灯：新增测试首次运行失败于 `/orders/{orderId}/review` 404；待审列表过滤测试首次收紧后失败于返回 2 条，确认 `internal_status` 过滤缺口存在。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests test`：PASS，11 tests / 0 failures / 0 errors。
- `npm run check:task9d3`：PASS。
- `npm run check:openapi`：PASS，54 paths / 65 operations / 65 operationIds。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- HTTP smoke：doctor 创建订单 `ORD20260630-1E844940B0`，CS 通过 `internal_status=PENDING_CS_REVIEW` 列表查到 1 条并审核通过，状态变为 `PENDING_PRODUCTION_REVIEW/PENDING_REVIEW`。
- 浏览器 smoke：CS 登录 `http://localhost:5173`，进入「内部订单」的「客服初审」，页面显示订单 `ORD20260630-99C60FD3DF` 的动态表单字段，点击「通过初审」后该订单从待审列表消失；SQL 确认状态为 `PENDING_PRODUCTION_REVIEW/PENDING_REVIEW`。

未完成原因：

- 当前只做订单初审，不实现生产审核页面、工序实例化页面或完整客服订单详情。
- AI-1 翻译草稿和 AI-4 缺资料检查已存在后端最小能力，但本轮未把它们嵌入客服初审页面，也未实现“人工确认后写入生产指令”的完整交互。
- 驳回后的医生补资料 / 再提交链路仍未实现；`CS_REJECTED` 医生端仍只表现为 `PENDING_REVIEW` 外部投影。
- 客服消息、设计稿、账单物流仍在既有后端最小接口中，未合并成完整客服工作台页面。

## 任务 9D.4：生产审核页面与工序实例化串联第一增量

状态：completed-first-increment。

目标：

- 让内部角色能从待生产审核订单列表进入生产审核，并把 `PENDING_PRODUCTION_REVIEW` 订单推进到工序实例化状态或生产驳回状态。

范围：

- `GET /orders?internal_status=PENDING_PRODUCTION_REVIEW` 作为生产审核待办列表；医生端仍不返回内部字段。
- `POST /orders/{orderId}/production-review` 只允许处理 `PENDING_PRODUCTION_REVIEW` 订单；未经过客服初审的订单返回 409，且不得创建工序实例。
- 前端新增 `/workflow/review`「生产审核」最小页面，支持待审核订单列表、订单资料、工序链选择、入口路线、分支参数 JSON、通过生产审核和驳回生产审核。
- 审核通过进入 `PROCESS_INSTANCE_CREATED` / `PRODUCING`，并复用既有 Workflow Runtime 创建 `order_process_instance`、节点快照和边快照。

完成记录：

- `WorkflowRuntimeService` 新增 `requirePendingProductionReview` 状态门禁，生产审核前使用 `FOR UPDATE` 读取订单状态；订单不存在返回 404，状态不匹配返回 409。
- `WorkflowRuntimeTests` 新增 `productionReviewRejectsOrdersThatHaveNotPassedCsReview`，TDD 红灯确认 `PENDING_CS_REVIEW` 曾可直接实例化，修复后通过。
- `frontend/src/App.vue` 新增生产审核页面状态、`loadProductionReviewOrders`、`loadWorkflowChains`、`reviewProductionOrder` 和 `/workflow/review` 页面分支。
- `frontend/vite.config.ts` 新增 `/workflow-chains` 代理。
- 已新增 `scripts/check-task-9d4-frontend.mjs`、`npm run check:task9d4`，并把 9D.4 后端、前端、OpenAPI 关键文本纳入 `acceptance.json`。
- `docs/api/openapi.yaml` 已同步生产审核状态门禁、权限描述和 `internal_status` 过滤说明。

验收结果：

- TDD 红灯：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=WorkflowRuntimeTests test` 首次失败于 `productionReviewRejectsOrdersThatHaveNotPassedCsReview` 期望 409 但实际 200，确认未过客服初审也能实例化的缺口存在。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=WorkflowRuntimeTests test`：PASS，4 tests / 0 failures / 0 errors。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests,WorkflowRuntimeTests test`：PASS，15 tests / 0 failures / 0 errors。
- `npm run check:task9d4`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- HTTP/browser smoke：doctor 创建订单并由 CS 初审通过后，CS 在 `http://localhost:5173` 进入「生产审核」，选择待审订单、工序链和路线，点击「通过生产审核」；SQL 确认订单进入 `PROCESS_INSTANCE_CREATED/PRODUCING`，并存在 `order_process_instance`。

未完成原因：

- 当前只做生产审核入口，不实现生产任务池、派工/转派页面、工序实例详情可视化、节点入检/出检、工时和绩效页面。
- 分支参数仍采用 JSON 文本输入，贴面、种植基台等内部路线参数是否完全由生产审核补充仍需 PM/客户确认。
- 生产审核通过后未做前端任务池通知联动；仍依赖后续生产任务池页面和通知联调。

## 任务 9D.5：生产任务池 / 工序实例详情 / 派工页面第一增量

状态：completed-first-increment。

目标：

- 让 CS/ADMIN 能查看已生成的工序实例并给节点绑定员工；让 WORKER 能在页面看到分配给自己的任务。

范围：

- 前端 `/workflow/process-instance`：按 `PROCESS_INSTANCE_CREATED` 订单读取工序实例详情，展示实例状态、节点数、边数和节点列表。
- 前端 `/workflow/assign`：复用工序实例列表和节点详情，对选中节点调用派工/转派接口。
- 前端 `/tasks/mine`：WORKER 按 `READY / IN_PROGRESS / COMPLETED / PENDING` 过滤本人任务，并提供最小 `开始任务` / `完成任务` 按钮。
- Vite 代理新增 `/tasks` 和 `/process-instance`。
- `docs/api/openapi.yaml` 校正派工/转派权限说明为 CS / ADMIN，并补 `tasks/mine` 的 `READY` 状态枚举。

完成记录：

- 已新增 `ProcessInstanceDetail`、`ProcessNodeItem`、`WorkerTaskItem` 等前端类型和生产任务相关状态。
- 已新增 `loadProcessInstancePage`、`loadProcessInstanceOrders`、`loadProcessInstanceDetail`、`assignSelectedProcessNode`、`loadWorkerTasks`、`operateWorkerTask`。
- 已新增 `/workflow/process-instance`、`/workflow/assign`、`/tasks/mine` 三个前端页面分支，并复用现有菜单权限种子。
- 已新增 `scripts/check-task-9d5-frontend.mjs`、`npm run check:task9d5`，并把 9D.5 前端和 OpenAPI 关键文本纳入 `acceptance.json`。

验收结果：

- TDD 红灯：`node scripts/check-task-9d5-frontend.mjs` 首次失败，确认缺 `ProcessInstanceDetail`、`loadProcessInstancePage`、`assignSelectedProcessNode`、`loadWorkerTasks`、`/tasks` 和 `/process-instance` 代理等关键入口。
- `npm run check:task9d5`：PASS。
- `npm run check:task9d1 && npm run check:task9d2 && npm run check:task9d3 && npm run check:task9d4 && npm run check:task9d5`：PASS。
- `npm run check:openapi`：PASS，54 paths / 65 operations / 65 operationIds。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=WorkflowRuntimeTests,PermissionInterceptorTests test`：PASS，8 tests / 0 failures / 0 errors。
- 浏览器 smoke：API 准备订单 `ORD20260630-0F7516BF76` 并实例化为 `330`；CS 登录 `http://localhost:5173` 进入「派工转派」，搜索订单并点击「绑定员工」给 `9601`；worker 登录「我的任务」看到该订单 READY 任务和「开始任务」入口。API 复核 `tasks/mine?status=READY` 返回 `task_node=714`。

未完成原因：

- 当前工序实例/派工入口只筛选 `PROCESS_INSTANCE_CREATED` 订单；进入 `IN_PRODUCTION` 后的跨状态生产看板和多条件筛选未做。
- `我的任务` 只做最小开工/完工入口；未嵌入入检/出检、工时暂停/继续/完成、返工和质检页面。
- 派工员工仍输入 `user_id`，未接正式员工选择器、班组/岗位筛选或工作负载提示。

## 任务 9D.6：入检 / 出检 / 工时操作页面第一增量

状态：completed-first-increment。

目标：

- 让 WORKER 能在页面上对本人任务节点提交入检/出检记录，并对进行中任务执行工时开始、暂停、继续和完成。

范围：

- 前端 `/checks`：复用 `GET /tasks/mine` 按状态筛选本人节点，选中节点后读取 `GET /check-records/{nodeInstanceId}`，并调用 `POST /check-records` 提交入检/出检。
- 前端 `/worklogs/self`：复用 `GET /tasks/mine` 按状态筛选本人节点，对 `IN_PROGRESS` 节点调用 `POST /work-logs/start`，并对当前工时记录调用暂停、继续、完成接口。
- Vite 代理新增 `/check-records` 和 `/work-logs`。
- 新增 `scripts/check-task-9d6-frontend.mjs` 和 `npm run check:task9d6`，并把 9D.6 前端入口纳入 `acceptance.json`。

完成记录：

- 已新增 `CheckRecordResponse`、`WorkLogResponse` 前端类型和 `checkTasks` / `worklogTasks` 等页面状态。
- 已新增 `loadCheckTasks`、`selectCheckTask`、`loadCheckRecords`、`submitCheckRecord`、`loadWorklogTasks`、`selectWorklogTask`、`startSelectedWorkLog`、`operateWorkLog`。
- 已新增 `/checks` 入检出检页面分支和 `/worklogs/self` 工时记录页面分支，复用既有菜单权限种子。
- 已新增质检/工时页面样式和 Vite 代理。

验收结果：

- TDD 红灯：`npm run check:task9d6` 首次失败，确认缺 `CheckRecordResponse`、`loadCheckTasks`、`submitCheckRecord`、`loadWorklogTasks`、`startSelectedWorkLog`、`/checks`、`/worklogs/self`、`/check-records` 和 `/work-logs` 等关键入口。
- `npm run check:task9d6`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。

未完成原因：

- 质检页面只做节点级入检/出检提交，不做完整返工处理台、责任分类字典或复杂 DAG 返工影响范围配置。
- 工时页面只做当前 work log 的 start/pause/resume/finish，不做历史工时列表、批量补录、异常申诉或绩效公式展示。
- 仍缺生产通知联动、完整生产看板、终检专用页面和管理绩效页面。

## 任务 9D.7：绩效管理页面第一增量

状态：completed-first-increment。

目标：

- 让 WORKER 能读取本人绩效统计，让 ADMIN 能输入员工 `user_id` 查询指定员工绩效快照。

范围：

- 前端 `/performance`：复用 `GET /performance`，展示 `completed_count`、`effective_duration`、`rework_count`、`on_time_rate`、`pass_rate`、`duration_efficiency`。
- WORKER 留空查询本人绩效；ADMIN 可填 `user_id` 查询指定员工。
- Vite 代理新增 `/performance`。
- 新增 `scripts/check-task-9d7-frontend.mjs` 和 `npm run check:task9d7`，并把 9D.7 前端入口纳入 `acceptance.json`。

完成记录：

- 已新增 `PerformanceStatsResponse` 前端类型和 `performanceStats` / `performanceUserId` 等页面状态。
- 已新增 `loadPerformanceStats`，对非法 `user_id` 做正整数校验后调用 `/performance`。
- 已新增 `/performance` 页面分支，展示完成工序、有效工时、返工次数、准时率、通过率和工时效率。
- 已新增绩效卡片样式和 Vite 代理。

验收结果：

- TDD 红灯：`npm run check:task9d7` 首次失败，确认缺 `PerformanceStatsResponse`、`loadPerformanceStats`、`isPerformanceRoute`、`/performance` 页面和代理等关键入口。
- `npm run check:task9d7`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。

未完成原因：

- 绩效页面只展示当前统计快照，不做时间范围筛选、历史明细列表、导出报表或绩效申诉/补录。
- 标准工时仍待客户确认，当前仅展示后端现有最小公式结果。
- 仍缺完整管理端绩效看板、生产看板联动和正式 RuoYi DataScope SQL 覆盖。

## 任务 9D.8：生产看板 / 跨状态生产检索第一增量

状态：completed-first-increment。

目标：

- 让 ADMIN/CS 能在一个生产看板入口按内部状态和关键词检索生产订单，并查看已实例化订单的节点进度快照。

范围：

- 前端 `/production/board`：复用 `GET /orders`，支持 `PENDING_PRODUCTION_REVIEW`、`PROCESS_INSTANCE_CREATED`、`PRODUCING`、`SHIPPED`、`COMPLETED` 和全部状态检索。
- 选中已实例化订单后复用 `GET /orders/{orderId}/process-instance` 展示节点统计和节点进度。
- 新增 `V9__production_board_menu_seed.sql`，为 ADMIN 和具备 `order:read-internal` 的角色追加「生产看板」菜单。
- 新增 `scripts/check-task-9d8-frontend.mjs` 和 `npm run check:task9d8`，并把 9D.8 前端入口纳入 `acceptance.json`。

完成记录：

- 已新增 `productionBoardOrders`、`productionBoardStatus`、`productionBoardInstance` 等页面状态。
- 已新增 `loadProductionBoardOrders`、`selectProductionBoardOrder`、`loadProductionBoardInstance`。
- 已新增 `/production/board` 页面分支，展示跨状态生产检索、订单状态、节点统计和节点进度。
- 已新增生产看板响应式样式和菜单种子迁移；本轮未新增 OpenAPI path，复用既有 `/orders` 与 `/orders/{orderId}/process-instance` 契约。

验收结果：

- TDD 红灯：`npm run check:task9d8` 首次失败，确认缺 `productionBoardOrders`、`productionBoardStatus`、`loadProductionBoardOrders`、`isProductionBoardRoute`、`/production/board`、生产看板菜单迁移等关键入口。
- `npm run check:task9d8`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。

未完成原因：

- 生产看板只展示当前订单列表与工序实例快照，不做拖拽/泳道看板、实时 WebSocket 刷新、排产或节点编辑。
- 待生产审核订单尚未生成工序实例，只显示订单状态和提示。
- 仍缺完整返工处理台、终检入口、复杂多条件筛选、生产通知联动和正式 RuoYi DataScope SQL 覆盖。

## 任务 9D.9：返工处理台 / 终检入口第一增量

状态：completed-first-increment。

目标：

- 让 WORKER/ADMIN 能在页面看到待返工记录，并从已完成节点提交最小终检出检记录。

范围：

- 后端新增 `GET /reworks` 只读列表，支持按 `status` 和 `order_id` 筛选。
- WORKER 只能读取来源节点或目标节点分配给本人的返工记录；CS/ADMIN 可读取内部返工记录，医生端禁止读取。
- 前端新增 `/rework-final`「返工终检」页面：左侧查看待返工记录，右侧读取本人已完成节点作为终检入口，并复用 `POST /check-records` 提交终检出检通过。
- 新增 `V10__rework_final_menu_seed.sql`，为 ADMIN 和具备 `check:write` 的角色追加「返工终检」菜单。
- 新增 `scripts/check-task-9d9-frontend.mjs` 和 `npm run check:task9d9`，并把 9D.9 前端入口、菜单迁移和 OpenAPI 契约纳入 `acceptance.json`。

完成记录：

- 已新增 `ReworkRecordResponse` 和 `WorkflowExecutionService.getReworks`，返回返工 ID、订单号、来源节点、目标节点、目标节点状态、原因、状态和创建时间。
- 已新增 `GET /reworks` 控制器入口，并使用 `@RequirePermission(value = "check:read-internal", roles = {ADMIN, CS, WORKER})` 做入口权限校验。
- `CheckWorklogPerformanceTests` 新增返工列表回归：出检失败后 WORKER 本人可查到 PENDING 返工记录，其他 worker 返回空列表，医生 Bearer token 访问 `/reworks` 返回 403。
- 前端新增 `ReworkRecordResponse`、`reworkRecords`、`finalInspectionTasks`、`loadReworkRecords`、`loadFinalInspectionTasks`、`submitFinalInspectionCheck` 和 `/rework-final` 页面分支。
- `docs/api/openapi.yaml` 已同步 `/reworks` 和 `ReworkRecordResponse`，并校正 `/check-records` 当前状态门禁描述。

验收结果：

- TDD 红灯：`npm run check:task9d9` 首次失败，确认缺前端返工终检入口、V10 菜单迁移和 `/reworks` OpenAPI 契约。
- TDD 红灯：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test` 首次失败于 `/reworks` 404，确认后端缺返工列表接口。
- `npm run check:task9d9`：PASS。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test`：PASS，5 tests / 0 failures / 0 errors。

未完成原因：

- 当前只做返工记录只读和终检出检第一增量，不实现返工责任分类字典、返工处理状态关闭、复杂 DAG 回滚策略或终检专用角色/权限点。
- 终检入口复用已完成节点和 `POST /check-records`，尚未引入独立终检业务表、终检报告、出货前拦截或生产通知联动。
- Task 8 总体仍保持 `NOT READY`，仍缺完整弱网/跨设备续传、生产级 AI 治理、完整客服协同、生产网关通知验收、部署/操作手册和完整浏览器 12 步验收；100MB+ 浏览器上传 smoke 已在 9D.10 后续补齐。

## 任务 9D.10：Multipart 上传 / 医生附件上传绑定第一增量

状态：completed-first-increment。

目标：

- 让医生端具备真实文件选择上传入口，并把上传完成的附件 `file_id` 回填到医生下单绑定字段。

范围：

- 后端新增 MinIO Multipart 生命周期接口：初始化、分片签名、完成、取消。
- `file_resource` 增加 Multipart 元数据字段，保留单对象预签名 PUT 兼容路径。
- 医生 Multipart 写路径限定为上传资源创建者本人，避免同诊所其他医生 abort/complete 他人上传。
- 前端医生订单页新增最小 Uppy 文件选择入口，按后端返回 `part_size` 分片 PUT 到 MinIO，完成后回填 `doctorOrderFileIds`。
- OpenAPI 同步新增 Multipart 请求/响应 schema、status/pending 恢复 schema 和 6 个文件接口。
- 新增 `scripts/check-task-9d10-frontend.mjs` 和 `npm run check:task9d10`，并把 9D.10 后端、前端、迁移和 OpenAPI 关键文本纳入 `acceptance.json`。

完成记录：

- 已新增 `V11__file_multipart_upload_metadata.sql`，记录 `upload_mode`、`multipart_upload_id`、`multipart_part_size`、`multipart_part_count`。
- 已新增 `MultipartInitiateRequest/Response`、`MultipartPartUrlRequest/Response`、`MultipartCompleteRequest`、`MultipartAbortRequest`。
- `FileController` 已新增 `/files/multipart/initiate`、`/files/{fileId}/multipart/part-url`、`/files/{fileId}/multipart/complete`、`/files/{fileId}/multipart/abort`。
- `FileResourceService` 使用同步 MinIO client 处理现有 stat/presign，使用 `MinioAsyncClient` 处理 SDK 暴露的 Multipart create/complete/abort。
- `FileAccessTests` 新增 Multipart 回归：医生可 initiate、上传分片、complete 并写审计；其他医生不能 abort 本人上传；本人可 abort。
- 前端新增 `@uppy/core`，并在医生订单页增加 `选择附件`、`上传并绑定`、进度和完成 file_id 标签。
- 后续第一增量已新增 `GET /files/{fileId}/multipart/status` 和 `MultipartStatusResponse`，返回 MinIO 已完成分片列表，供浏览器恢复上传时跳过已传分片。
- 前端医生订单页已新增本地 `doctorUploadResumeSessions`，异常中断后保留 `file_id/upload_id/part_size/part_count`，重试时先读取 `multipart/status` 并复用已完成分片；同时提供「取消未完成上传」手动 abort 入口。
- 已新增 `scripts/smoke-task-9d10-large-upload.spec.mjs` 和 `npm run smoke:task9d10-large-upload`，用 Playwright + 系统 Chrome 跑医生浏览器登录、创建订单、100MB+ Multipart 上传、完成 `file_id` 回填和预览权限校验。
- 后续第三增量已新增 `GET /files/multipart/pending?order_id=...` 和 `MultipartPendingUploadsResponse`，医生只能列出本人在当前订单下的未完成 Multipart 候选，不暴露 `object_key`。
- 前端医生订单页已新增 `doctorUploadServerResumeCandidates`：没有本地会话时，按当前订单、同文件名、同文件大小匹配服务端候选，恢复 `file_id/upload_id` 后再读取 status。
- 已新增 `scripts/smoke-task-9d10-server-resume.spec.mjs` 和 `npm run smoke:task9d10-server-resume`，用浏览器创建订单、API 预创建 pending Multipart、清理本地上传会话，再验证浏览器完成上传时复用同一个 pending `file_id`。

验收结果：

- TDD 红灯：`npm run check:task9d10` 首次失败，确认缺前端 Multipart 入口、OpenAPI、迁移和 Uppy 依赖。
- TDD 红灯：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=FileAccessTests test` 首次失败于 `/files/multipart/initiate` 404，确认后端缺 Multipart 接口。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=FileAccessTests test`：PASS，5 tests / 0 failures / 0 errors。
- `npm run check:task9d10`：PASS。
- `npm run check:openapi`：PASS；后续补 pending 恢复候选后当前为 61 paths / 72 operations / 72 operationIds。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- TDD 红灯：`FileAccessTests#multipartUploadStatusListsUploadedPartsForResume` 首次失败于 `/files/{fileId}/multipart/status` 404，确认缺恢复上传状态接口。
- TDD 红灯：`npm run check:task9d10` 首次失败，确认缺 `multipart/status`、本地恢复会话和 OpenAPI 状态 schema。
- TDD 红灯：加强 `npm run check:task9d10` 后首次失败，确认缺 100MB+ 浏览器 smoke 脚本、npm 入口和上传 UI 稳定 selector。
- 机制 smoke：`TASK9D10_UPLOAD_SIZE_BYTES=1048576 npm run smoke:task9d10-large-upload` 通过，确认脚本可穿过医生登录、创建订单、浏览器上传、完成回填和预览权限校验。
- 100MB+ 浏览器 smoke：`npm run smoke:task9d10-large-upload` 通过，生成 `file_id=457`；SQL 核验 `file_resource.upload_status=COMPLETED`、`file_size=110100480`、`upload_mode=MULTIPART`、`multipart_part_count=21`。
- TDD 红灯：`FileAccessTests#multipartPendingUploadsListsOnlyCurrentDoctorRowsForCrossDeviceResume` 首次失败于 `/files/multipart/pending` 404，确认缺服务端恢复候选列表。
- TDD 红灯：加强 `npm run check:task9d10` 后首次失败，确认缺 `files/multipart/pending`、`doctorUploadServerResumeCandidates`、`loadDoctorPendingMultipartUploads` 和 OpenAPI pending schema。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=FileAccessTests test`：PASS，6 tests / 0 failures / 0 errors。
- `npm run check:openapi`：PASS，61 paths / 72 operations / 72 operationIds。
- TDD 红灯：再次加强 `npm run check:task9d10` 后首次失败，确认缺 `smoke:task9d10-server-resume` 和 `scripts/smoke-task-9d10-server-resume.spec.mjs`。
- 脚本排障：首次运行失败于稀疏文件 header 长度写死；修复后又发现浏览器完成了新 `file_id`，未复用 pending，最终改为读取浏览器真实 `File.type` 后再预创建 pending 候选。
- 服务端候选恢复浏览器 smoke：`npm run smoke:task9d10-server-resume` 通过，生成并复用 `file_id=514`，对应 `order_id=1439`。
- TDD 红灯：再次加强 `npm run check:task9d10` 后首次失败，确认缺 `smoke:task9d10-interrupted-resume` 和上传中断恢复浏览器 smoke 脚本。
- 脚本排障：首次运行中断恢复 smoke 时等待中文错误文案超时，实际浏览器显示 `Failed to fetch`；修正断言后复跑通过。
- 上传中断后恢复浏览器 smoke：`npm run smoke:task9d10-interrupted-resume` 通过，模拟第 2 个分片 PUT 断网，确认本地 `doctor-order-upload:` 会话保留 1 个已完成分片，服务端 `multipart/status` 返回 `PENDING`，第二次点击上传复用同一 `file_id=537` 完成。

未完成原因：

- 当前上传入口要求先选择或创建订单后上传并回填 `file_id`，不做草稿订单、临时文件池或驳回补资料上传流程。
- 当前已具备“同一浏览器本地会话 + 服务端已完成分片查询 + 无本地会话服务端候选匹配 + 上传中断后恢复”的恢复上传第一增量，并已通过本地 105MB 浏览器 Multipart smoke、服务端候选恢复浏览器 smoke 和中断恢复浏览器 smoke；但仍未覆盖真实跨设备浏览器验收、并发调优、完整 Uppy Dashboard 或真实弱网限速/断网注入。
- 文件类型、文件数量、分片大小阈值和生产 bucket 隔离仍需 PM/客户和部署方案最终确认。
- Task 8 总体仍保持 `NOT READY`，仍缺复杂返工影响范围、责任分类字典、终检专用角色/附件、生产级 AI 治理、生产网关通知验收、部署/操作手册和完整浏览器 12 步验收。

## 当前开放问题

- Multipart 阈值、文件大小、文件类型、文件数量限制，以及是否必须支持完整弱网/跨设备续传。
- 动态表单字段清单是否已有客户最终确认版。
- 是否允许 ADMIN 调整进行中订单节点；默认不允许增删节点，只允许员工绑定/转派。
- 贴面路线、种植基台路线等分支是否完全由生产审核时补充 `branch_params`。
- 设计稿确认是否阻塞生产。
- AI-5 模板。
- 标准工时和预计发货算法。
- 付款状态。
