# 管理端剩余页面批量实施准备清单

> 日期：2026-07-17
> 状态：`LOCAL_IMPLEMENTATION_BROWSER_ACCEPTED`
> 上位规格：`ADMIN-UI-BASELINE-V1.18`
> 实施范围：客户管理至智能服务共 13 个剩余页面；工作台、订单管理、沟通中心和人员管理只做最终回归

## 1. 本轮统一执行口径

- 用户确认剩余页面连续完成，不再每完成一页停下来等待确认；全部页面完成后统一提交验收。
- 本轮只按管理员账号完成页面、真实数据、权限反馈和双视口验收；经理、主管的真实权限与数据范围不作为本轮完成项。
- 不修改后端。现有数据只能支撑总体情况时，页面展示真实总体情况，并使用客户可理解的业务说明；不得出现“接口缺失、后端未实现、字段缺少、API、TODO、占位页”等技术语言。
- 不用演示行、假数字、假成功或本地缓存记录填满页面；没有明细时直接显示真实业务空态。
- 旧实现与本文件冲突时替换旧实现：外协不再冒充成本登记，质量管理不再登记客服外返，工艺生产不再显示独立派工页签或固定工艺链按钮，产品总览/通知中心/智能服务使用确认后的名称和职责。
- Task 8 保持 `NOT_READY`，批量本地验收不得描述为正式上线。

## 2. 面向客户的缺口表达

| 场景 | 页面允许文案 | 禁止文案 |
| --- | --- | --- |
| 只有总体情况 | 当前仅展示总体情况，明细记录将在业务数据完善后显示 | 后端只有 summary 接口 |
| 国内/国外无法归类 | 订单尚未维护配送地区，暂时无法归入国内或国外业务 | 缺少 destination 字段 |
| 没有外协履约记录 | 当前还没有可查看的外协进度记录 | 外协实体/API 未实现 |
| 没有设备清单或审批记录 | 当前仅有设备总体情况，设备明细和审批记录尚未纳入 | 设备列表/审批接口缺失 |
| 没有物料异常明细 | 当前仅有物料异常总体情况，明细记录尚未纳入 | 缺少 list/detail API |
| 没有安环任务与规则 | 当前仅有安环总体情况，检查计划和整改明细尚未纳入 | 定时任务和规则模型未实现 |
| 没有成本明细 | 当前仅有成本总体情况，成本明细尚未纳入 | 成本列表接口缺失 |
| 不能修改外返责任 | 当前责任信息以客服登记结果为准 | 更新责任字段不支持 |
| 预算未设置 | 暂未设置每日预算 | daily_budget_microusd=0 |
| 请求失败 | 数据暂时无法加载，请稍后重试 | 请求失败 500 / API error |

## 3. 全量区域、参考与真实数据映射

| 页面 | 管理端区域 | 参考 HTML 精确定位 | 几何 / 交互与视觉资产 | 真实数据 | 允许差异与业务空态 |
| --- | --- | --- | --- | --- | --- |
| 客户管理 | 客户目录 | `doctor-portal.html#page-patients .tw`、`.th`、`#ptbody`；客服客户卡 `cs-portal.html#page-clients #client-alerts`、`#client-grid`、`renderClients()` | 48px 下划线页签；52px 行；搜索 SVG、状态筛选、状态胶囊、行 hover；560px 只读详情 | `/clinics`、`/clinics/{id}`、`/clinics/{id}/preference` | 去除新增患者/客户、编辑、付款政策和合同；客户级金额显示“暂未统计” |
| 客户管理 | 客户贡献 | `cs-portal.html#page-dashboard` Monthly KPIs、`#top-clients-chart`、`renderTopClients()`；销售趋势仅取金额层级 | 主体内 72px 销售背景带；排名横条、真实周期和生成时间 | `/dashboards/sales`、`/dashboards/phase-one-ab` | 不复制完整工作台和年度趋势图；平台金额不得写到单个客户 |
| 客户管理 | 客户详情 | `doctor-portal.html#page-settings #tab-clinic`、`#tab-prefs` 的信息分组 | 560px 抽屉；诊所信息与制作偏好分组；保留 🏥 等分组识别语义但全部只读 | 诊所详情与偏好接口 | 不显示团队、证照上传、通知设置、保存和跟进任务 |
| 账单配送 | 账单与收款 | `cs-portal.html#page-billing #billing-qf`、`#billing-tbody`、`renderBillingQF()`、`renderBilling()`；医生 `#page-billing #btbody`、`#mtbody` 只校验公开字段层级 | 48px 国内/国外主切换 + 40px 账单/配送切换；48px 行；账单、付款状态胶囊；560px 统一详情 | `/orders`、逐订单 `/bill`、`/payments` | 不复制逾期、月结、在线支付、信用余额和下载全部；无法分区时显示配送地区尚未维护 |
| 账单配送 | 配送跟踪 | `cs-portal.html#page-billing #tracking-list`；医生账单页公开物流层级 | 包裹/承运状态图形、跟进状态、行 hover；国内国外共用同一布局 | `/logistics/orders`、`/orders/{id}/logistics` | 只显示人工维护状态；不显示实时轨迹、预计送达、清关、地图或签收回调 |
| 外协管理 | 外协队列 | `factory-portal.html#page-datacenter #dc-filter-row`、`#dc-tbody`、`#dc-count`、`renderDCQueue()` | 48px 行；发出/预计返回/实际返回、红色超时行、状态胶囊、进度视觉；560px 时间线详情 | 当前无外协履约明细；仅保留真实业务空态 | 不复制 `#dc-sites` 在线合作方、聊天、文件、召回和外部请求；不使用成本记录冒充外协进度 |
| 工艺生产 | 订单工序表 | `factory-portal.html#page-orders #order-qf`、`#order-tbody`、`renderOrders()`；`#page-workorders #wo-list`、`renderWorkOrders()` | 单页订单主表；48px 行；当前节点、节点进度、负责人、时限和异常；560px 节点时间线 | `/orders`、逐订单 `/process-instance`、`/staff/workload` | 不复制生产端 13 列横向表；不显示固定工艺链按钮或独立派工页签 |
| 工艺生产 | 节点派工 | `factory-portal.html#page-workstation #ws-body`、`renderLeadAssign()` | 派工只附着在节点；员工下拉显示真实待处理/进行中/已完成数量；提交中、失败和无权状态 | `/process-instance/assign`、节点 `/reassign` | 不显示容量百分比、预计空闲时间；管理端不开始、完成或跳过工序 |
| 质量管理 | 质量指标与问题队列 | `factory-portal.html#page-dashboard` 异常语法；`#page-scan #audit-list`、`renderAuditList()`；`#page-workorders` 与 `#page-workstation #ws-qc-pending` | 72px 指标带；48px 合并问题表；返工、投诉、内返状态标签；560px 详情 | `/production/quality/summary`、`/reworks`、`/quality-records`、终检报告查询 | 管理端不登记外返、不执行入检/出检；外返责任显示客服登记结果 |
| 质量管理 | 返工原因与责任 | 医生/客服 `#page-settings` 的行式设置语法 | 标题区 34px 次按钮；560px 设置抽屉；管理员真实增改 | `/reworks/dictionaries/items` | 使用业务名称，不显示“字典”、数据库编码或技术说明 |
| 绩效统计 | 员工横向对比 | `factory-portal.html#page-workstation #ws-body`、`renderLeadStats()`；个人详情参考 `renderMyStats()`；字段取舍参考 `#page-staff` | 48px 行；员工头像、指标强调线、趋势/质量状态色；560px 详情 | `/staff/workload`、逐员工 `/performance`、详情 `/performance/details` | 去除工资、计件单价、目标线和演示排名；单行加载失败不显示为 0 |
| 设备管理 | 设备清单 / 审批事项 | 无直接页面；密度参考 `factory-portal.html#page-orders`，状态摘要参考 `#page-datacenter` 卡片语法 | 48px 页签、72px 状态带、48px 行、设备状态点和历史时间线 | `/production/equipment/summary` | 当前只展示真实总体情况；设备明细、历史和审批记录使用业务说明，不显示登记或审批假按钮 |
| 物料管理 | 异常监督 | 无直接页面；责任记录参考 `factory-portal.html#page-scan #audit-list`，异常状态参考 `#page-orders` | 72px 摘要、48px 异常表、责任与状态标记、560px 时间线详情 | `/production/material-exceptions/summary` | 当前只展示真实总体情况；不显示库存、采购、出入库或本地新增记录 |
| 安环管理 | 检查监督 / 检查规则 | 无直接页面；异常与状态参考 `factory-portal.html#page-scan #audit-list`、Dashboard Needs Attention；设置参考医生/客服 `#page-settings` | 48px 页签、72px 摘要、48px 监督/规则表、逾期和高风险状态 | `/production/safety-environment/summary` | 当前只展示真实总体情况；不使用浏览器定时器生成任务，不显示规则保存假按钮 |
| 成本管控 | 分类成本与异常 | 无直接页面；指标参考 `renderLeadStats()`；金额层级参考 `cs-portal.html#page-billing`；外协关联参考 `factory #page-datacenter` | 72px 分类指标带、44px 成本表、异常红色行、560px 详情 | `/production/cost-management/summary` | 当前只展示真实总体情况；不显示利润、收入、工资、换汇、假阈值和本地新增记录 |
| 产品总览 | 产品列表与详情 | `doctor-portal.html#mo-order #mo-sidebar` 的产品名称/类别/材料表达；医生/客服 `#page-settings` 的资料分组 | 48px 行；搜索、状态筛选、产品状态；560px 只读详情 | `/products` | 不显示下单字段、必填/选填、编辑、停用和模板导入；未确认价格显示“价格待确认” |
| 通知中心 | 当前账号通知 | 三端 Dashboard Needs Attention / 通知摘要；客服 `#page-settings #stab-notifications` 仅取通知语义 | 56px 行；全部/未读、未读点、状态与关联订单；实时刷新不改变滚动位置 | `/notifications`、`/notifications/unread-count`、已读接口、WebSocket | 不显示审计、安全事件、日志或详情抽屉；未知类型显示“业务通知” |
| 智能服务 | 全平台运行、风险和预算 | 三端 Dashboard 紧凑状态卡与 `trend-svg` 动态图表语法 | 72px 四项汇总带；下方约 2:1 趋势/状态区；风险项 50px；无抽屉 | `/ai/governance/summary`、`/ai/governance/cost-trend?days=7` | 不显示五项智能能力、按能力拆分、外部提醒技术队列、模型或配置；预算为 0 显示“暂未设置每日预算” |

## 4. 实施与统一验收

1. 在当前主工作树连续完成全部 13 页，不创建 worktree，不重置或清理既有改动。
2. 内部按页面拆分代码和样式作用域，每页完成后立即运行必要的局部检查，但不等待用户逐页确认。
3. 全部页面完成后统一运行前端构建和 `git diff --check`。
4. 使用真实 Chrome 依次覆盖 1440×900 与 1280×800 的全部管理菜单、页签、筛选、抽屉、加载、空、失败和无权限状态。
5. 最终统一提交页面截图、控制台与网络检查、允许差异和真实业务能力说明。

## 5. 2026-07-17 实施结果

- 13 个页面已由 `frontend/src/components/AdminRemainingPages.vue` 和独立样式承载，旧页面保留作其他端兼容，不再接管管理员目标路由。
- 真实 Chrome 管理员登录后从侧边栏逐页完成 `1440×900`、`1280×800`、页签、筛选、表格内部滚动、560px 抽屉、空状态和请求失败恢复检查。
- 人员管理 V2、订单管理 820px 抽屉、沟通中心双页签与冻结工作台均完成回归，没有被本轮路由或样式覆盖。
- 完整证据和业务限制见 `docs/quality/admin-remaining-pages/README.md`。
- 本结论仅代表本地前端实现与真实浏览器验收；Task 8 仍为 `NOT_READY`，不代表正式环境上线。
