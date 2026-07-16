# 客服端参考规范

> 权威源：[cs-portal.html](../../../frontend/public/reference/cs-portal.html)
> SHA-256：`035c43e735fe73badbcc0612e176c4a974057c2d1418470b0c72ac089a7f304d`
> 最近浏览器复核：2026-07-16，目标视口 `1440×900`

## 1. 定位

客服端是高密度运营工作台，承担订单信息审核、资料处理、跨端沟通、客户账号、账单和配送。视觉身份为深紫侧栏配紫色主操作色；相比医生端，它有更多快捷筛选、状态标签、表格操作和异常处理入口。

参考 HTML 中的账号选择器用于展示角色与客户范围，正式实现必须使用真实认证、数据范围和审计能力。

## 2. 核心视觉参数

| 项目 | 参考值或实测值 |
| --- | --- |
| 页面背景 | `#f7f9fc` |
| 侧栏 | `236px`，`#1e1b4b`，固定定位 |
| 顶栏 | `56px`，白色，吸顶 |
| 主操作色 | `#7c3aed` |
| 正文字体 | `Plus Jakarta Sans`，基准 `14px` |
| 标题字体 | `Lora` |
| 卡片 | 白色、浅灰边框、圆角和深紫低透明阴影 |
| 详情面板 | `#cs-drawer`，右侧固定，`540px`，全高 |
| 页面切换 | 轻微上移淡入 |

2026-07-16 实测 `1440×900` 时，滚动条约占 `4px`；页面计算宽度约 `1436px`，主内容区约 `1200px`。

## 3. 页面拓扑

| 页面 ID | 菜单名称 | 主要内容 |
| --- | --- | --- |
| `page-dashboard` | Dashboard | 当日指标、Needs Attention、配送、逾期客户、趋势和客户排行 |
| `page-orders` | Order Details | 快捷筛选、订单表格、回复和订单详情面板 |
| `page-datacenter` | Data Processing | 资料处理、文件审核、翻译和信息整理 |
| `page-comms` | Comms Centre | 会话、订单沟通、快捷回复和消息发送 |
| `page-clients` | Client Management | 客户、诊所账号、医生账号和付款条款 |
| `page-billing` | Billing & Dispatch | 账单、承运商、预约取件和物流追踪 |
| `page-settings` | Settings & Accounts | 客服团队、偏好与通知 |

## 4. 角色与数据范围

| 角色 | 示例 | 可见能力 |
| --- | --- | --- |
| Manager | Wang Fang | 全部页面、全部客户 |
| Senior CS | Xiao Li | 除设置外的主要页面；Bright Smile Dental、Nordic Smile Clinic |
| Specialist | Wang Fang / Chen Mei | Dashboard、Orders、Data Processing、Comms；仅分配客户 |
| Translator | Liu Yang | Data Processing、Comms；全部客户 |

Manager 之外的账号会写入自己的客户范围。正式实现时，列表、搜索、消息、导出和详情接口都必须应用相同的数据范围，不能只隐藏导航。

## 5. 关键组件

- 账号选择层：按 Management、Senior CS、Specialists、Translation 分组。
- 高密度统计卡：桌面端八列，强调每日运营数据和异常数。
- Needs Attention：异常列表、时间、动作按钮和语义状态点。
- 快捷筛选：订单、资料、账单分别维护一组 pill 条件。
- 订单表格：优先级、阶段、客服状态、负责人、View 和 Reply。
- 订单详情面板：订单摘要、双语工序时间线、编辑、消息和阶段操作。
- 通信中心：线程列表、选中态、聊天正文、快捷回复和输入区。
- 客户管理：诊所资料、医生账号创建、密码重置/停用模拟、付款条款和历史订单。
- 账单配送：承运商选择、预约、跟踪和外部物流入口。
- 通用反馈：Modal、Toast、Tab、表单、文件预览和语言切换。

## 6. 必须保留的交互

1. 账号选择与切换；角色变化后导航和客户范围变化。
2. Dashboard 异常动作、配送动作和客户逾期动作。
3. Order Details 快捷筛选、搜索、导出、行选择、View 和 Reply。
4. 点击订单打开 `540px` 详情面板，编辑与关闭状态可用。
5. Data Processing 的文件审核、翻译审核和资料状态更新。
6. Comms Centre 的线程切换、快捷语句、发送和已读状态。
7. Client Management 的筛选、新增诊所、医生账号、付款条款和订单历史。
8. Billing & Dispatch 的承运商选择、预约取件、追踪和详情查看。
9. Settings 页签、语言切换、Toast 与 Modal 遮罩关闭。

源码中约有 `154` 个内联 `onclick`。DHL、FedEx、UPS、EMS 跳转属于外部动作；正式产品接入前要明确权限、参数和打开方式。

## 7. 响应式边界

客服端参考文件没有屏幕宽度媒体查询。当前只把桌面 `1440×900` 作为像素级权威基准。

如果产品要求 `1280px` 或移动端可用，应作为新增设计层单独验收：可以改变列数和滚动策略，但不能把新增响应式结果描述成参考 HTML 的原生行为。

## 8. 后续实现最小验收集

- 账号选择页；
- Manager Dashboard；
- Order Details 默认、至少一个快捷筛选和 `PDL-0476` 详情面板；
- Data Processing；
- Comms Centre 线程切换与消息发送；
- Client Management 的诊所、医生账号和付款条款；
- Billing & Dispatch 的承运商和追踪；
- Settings；
- Manager、Specialist、Translator 三类范围对比；
- `1440×900` 参考图与实现图同尺寸差异比对。
