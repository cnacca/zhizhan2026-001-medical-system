# 管理端沟通中心重构与验收记录

- 日期：2026-07-16
- 状态：严格参考映射缺口已补齐，本地真实 Chrome 复验完成，用户已确认
- 范围：管理端“消息处理 / 沟通管理”两个页内标签；不修改工作台业务内容，不修改后端

## 编码前区域与视觉资产映射

| 管理端区域 | 参考 HTML 定位 | 要复刻的几何 / 交互 | 图片 / Emoji / SVG | 真实字段 / API | 允许差异 | 缺失能力 |
| --- | --- | --- | --- | --- | --- | --- |
| 页面顶部 | 人员管理已确认顶部 | 56px 顶栏、眉题、一级标题、说明、刷新动作、下划线页签 | 管理端统一线性 SVG | 当前路由与真实刷新状态 | 客服紫改管理蓝 | 无真实更新时间时隐藏 |
| 消息线程 | `cs-portal.html#page-comms .msg-layout`、`#comms-thread-list` | 固定 290px 线程栏、搜索、三项快捷筛选、独立滚动、选中反馈 | 搜索 SVG、待处理状态点、数量胶囊 | `/messages/pending-review` 按订单聚合；发送方角色来自接口 | “Awaiting Reply / Doctor Reply”按当前真实审核语义改为“全部待审 / 医生回复 / 生产待审” | 消息接口无已读字段，使用“待处理”状态点，不伪造未读状态 |
| 会话头部 | `cs-portal.html#page-comms .chat-head`、医生端 `#page-messages` | 订单号、产品、诊所、参与人、审核状态、查看订单 | 智能状态点、参与方标记 | 真实订单、消息数量、`/orders/{id}/message-mentionable-users` | AI 状态无真实来源时使用灰色状态点并显示“暂未提供” | 后端未提供 AI 翻译运行状态 |
| 消息正文 | `cs-portal.html#page-comms #comms-messages`、医生/生产 `#page-messages` | 角色头像、消息正文、可见范围与审核状态、独立滚动 | 角色头像块、选中强调 | `/orders/{id}/messages` | 时间位置保留并显示“时间暂未提供” | `MessageItem` 无创建时间与附件字段 |
| 快捷回复与发送 | `cs-portal.html#page-comms .chat-input-area` | 快捷回复、@参与人、附件位置、发送箭头、禁用/提交中状态 | 回形针 SVG、发送箭头 SVG | `POST /orders/{id}/messages`、真实 `mention_user_ids` | 附件按钮保留位置并禁用，明确“附件暂未提供” | 当前消息写接口不支持附件上传 |
| 沟通管理提示 | `factory-portal.html#page-messages`、`#cs-pending-badge` | 真实审核规则提示条与待审核数量 | 警告三角 SVG、数量状态胶囊 | `/messages/pending-review` | 生产青 / 客服紫改管理蓝与风险语义色 | 无待审数据时显示真实 0 条状态 |
| 待审核队列 | `cs-portal.html#page-datacenter`、`#data-tbody` | 待处理事项、订单、发起方、等待时间、责任人、状态、查看上下文 | 角色头像、待处理状态点、右箭头 | 待审核消息与订单字段 | 无真实字段的位置显示“暂未提供” | 后端未提供等待时长和当前责任人 |
| 上下文抽屉 | 生产端 560px 抽屉体量、三端消息上下文 | 560px 右侧抽屉、订单摘要、完整会话、审核动作、关闭 / 遮罩 / Esc | 角色头像与状态层级 | `/orders/{id}/messages`、`/orders/{id}/message-mentionable-users`、`POST /messages/{id}/review` | 无待审核消息时可按真实订单只读打开 | 当前本地 0 条待审核消息，未执行审核写操作 |

后端当前 `MessageItem` 没有消息创建时间、等待时长和附件字段，因此对应位置明确显示“时间暂未提供”或禁用说明，没有推断、伪造时间或创建演示消息。当前本地环境返回 `0` 条待审核消息，页面展示真实空状态。

## 实现边界

- “消息处理”使用真实待审核消息形成订单线程，并接入真实订单消息上下文、参与人、发送和审核接口。
- 没有选中订单时，快捷回复、正文输入、附件、@参与人和发送动作均安全禁用。
- 智能辅助状态没有真实接口来源，保留参考状态点位置并显示“暂未提供”，不制造已开启状态。
- 消息附件写能力缺失，回形针按钮禁用并说明原因，不绕过文件鉴权。
- “沟通管理”使用真实审核提示、待审核队列和 560px 上下文抽屉；按订单主动查看只读取真实消息。
- 退回审核必须填写调整内容；审核结果仍由后端权限和审计闭环校验。

## 真实 Chrome 最终复验

- 管理员真实登录后，`1440×900` 验证“消息处理”：页面 `clientWidth=1159`、`scrollWidth=1159`；消息布局宽 `1123px`，线程栏精确为 `290px`；整页 `scrollWidth=1440`。
- `1280×800` 验证“消息处理”：页面 `clientWidth=999`、`scrollWidth=999`；消息布局宽 `963px`，线程栏仍为 `290px`；工作区 `clientWidth=670`、`scrollWidth=670`。
- 两个视口均只有一个一级标题“沟通中心”；搜索、三项真实角色筛选、智能状态缺失说明、附件禁用说明和发送箭头可见。
- `1440×900`、`1280×800` 均验证“沟通管理”：真实审核提示、六列处理队列、按订单查看入口和真实空状态可见，页面无横向溢出。
- 在 `1280×800` 选择真实订单 `ORD20260713-0C16212340`，打开上下文抽屉；抽屉宽度 `560px`，正文 `clientWidth=560`、`scrollWidth=560`，无内部横向溢出。
- `GET /orders/10551/messages`、`GET /orders/10551/message-mentionable-users`、`GET /messages/pending-review` 均返回 `200 OK`。
- 当前真实订单无沟通记录，抽屉如实显示“0 条真实记录”和真实可提及人员数量；未发送、审核或修改任何真实消息。
- Chrome 控制台无应用错误或警告。
- `npm run build:frontend` 与 `git diff --check` 通过；仅有既有 Rollup `#__PURE__` 注释与大 chunk 提示，不影响构建。

当前环境没有待审核消息，因此“队列行点击后执行审核”的写路径未做真实提交；其展示、禁用、退回说明必填和后端接口绑定已完成，但最终写操作仍需在有受控待审样本时验收。

## 最终截图

- `screenshots/final-message-processing-1440x900-20260716.png`
- `screenshots/final-message-processing-1280x800-20260716.png`
- `screenshots/final-communication-management-1440x900-20260716.png`
- `screenshots/final-communication-management-1280x800-20260716.png`
- `screenshots/final-communication-context-drawer-1280x800-20260716.png`

以下旧截图保留为标题、颜色和文本调整过程证据，不再作为最终视口证据：

- `screenshots/message-processing-1440x900-20260716.png`
- `screenshots/message-processing-1280x800-20260716.png`
- `screenshots/message-processing-title-aligned-1440x900-20260716.png`
- `screenshots/message-processing-color-aligned-1440x900-20260716.png`
- `screenshots/message-processing-text-aligned-1440x900-20260716.png`
- `screenshots/message-processing-order-title-colors-fixed-1440x900-20260716.png`
