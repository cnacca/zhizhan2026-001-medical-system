# 医生端订单抽屉复刻规格

## 范围

- 权威参考：`frontend/public/reference/doctor-portal.html` 的 `#drawer`、`.dh`、`.db`、`.dgrid`、`.tl`。
- 参考截图：`docs/quality/doctor-portal-pixel-clone/screenshots/reference/order-detail-drawer-1440x900.png`。
- 实现目标：`frontend/src/doctor/DoctorPortalV2.vue` 的 `data-testid="doctor-order-drawer"`。
- 复刻原则：视觉、尺寸、滚动层级和交互语言按参考 HTML；字段、状态、文件、消息和操作继续使用项目真实数据；不复制参考原型里的内部生产细节。

## 交互模型

- 抽屉从右侧以 `0.28s cubic-bezier(0.4,0,0.2,1)` 滑入。
- 抽屉自身是唯一的页面级滚动容器，`overflow-y:auto`。
- 只有标题栏吸顶；订单摘要、进度、资料、文件、时间线、沟通和操作区随抽屉整体滚动。
- 点击关闭按钮或抽屉外区域关闭，订单列表保持原滚动位置。
- 文件预览、设计确认和消息发送沿用真实 Vue 交互。

## DOM 顺序

1. 吸顶标题栏：小标题、订单号、关闭按钮。
2. 两列订单摘要：患者、牙位、产品、诊所、医生、金额、创建时间、到期时间、公开状态、标签。
3. 当前需要医生处理的提示，仅在存在待办时展示。
4. 公开进度纵向时间线。
5. 当前待办与锁定说明。
6. 订单资料、牙位、临床规格和医生说明。
7. 医生可见文件与图片。
8. 公开订单时间线。
9. 消息与设计确认记录、输入框。
10. 普通流式底部操作区。

## 精确几何与样式

### 抽屉

- `position:fixed; top:0; right:0`
- `width:500px; height:100vh`
- `display:block`
- `overflow-y:auto; overflow-x:hidden`
- `background:#fff`
- `border-left:1.5px solid #e2e8f0`
- `box-shadow:-8px 0 32px rgba(15,37,84,.1)`
- `font-family:"Plus Jakarta Sans", sans-serif`
- `z-index:200`

### 标题栏

- `position:sticky; top:0; z-index:2`
- `display:flex; align-items:center; justify-content:space-between`
- `min-height:65px; padding:16px 20px`
- `background:#fff`
- `border-bottom:1.5px solid #e2e8f0`
- 小标题：`9px / 700 / 1px letter-spacing / uppercase / #94a3b8`
- 订单号：`14px / 600 / Lora`
- 关闭按钮：`26px × 26px`，`6px` 圆角，透明背景；hover 为 `#f1f5f9`。

### 连续正文

- 参考 `.db`：`padding:18px 20px; overflow:visible`。
- 摘要使用两列网格：`grid-template-columns:1fr 1fr; gap:11px 24px`。
- 字段标题：`10px / 700 / .5px letter-spacing / uppercase / #94a3b8`。
- 字段值：`13px / 500–600 / #1e293b`。
- 相邻大区块以 `14–16px` 间距和 `1.5px #f1f5f9` 分隔。

### 公开进度

- 纵向 flex 时间线，节点行 `display:flex; gap:12px; padding-bottom:16px`。
- 圆点 `26px × 26px`，默认 `2px #e2e8f0` 边框。
- 完成节点：`#eff6ff` 背景、`#bfdbfe` 边框、`#2563eb` 文字。
- 当前节点：`#2563eb` 背景和边框、白色图标、`0 0 0 4px rgba(59,130,246,.15)` 外环，并使用参考的 2 秒呼吸动画。
- 连接线：`1px #f1f5f9`，从圆点中心下方延伸。
- 标题 `12px / 600`，状态或时间 `11px / #94a3b8`。
- 当前说明：`11px`，`#eff6ff` 背景，`6px` 圆角，`5px 9px` 内边距，左侧 `2px #93c5fd`。
- 节点仍使用真实医生公开状态，不显示内部工序、员工、入检/出检、工时、返工、绩效和责任分类。

### 资料、文件与沟通

- 牙位卡、临床说明：`#f8fafc` 背景、`1.5px #e2e8f0` 边框、`10px` 圆角、`12px 14px` 内边距。
- 文件行：`#f8fafc` 背景、`1.5px #e2e8f0` 边框、`8px` 圆角、`8px 12px` 内边距。
- 消息列表：最大高度 `280px`，独立内部滚动，`#f8fafc` 背景、`9px` 圆角、`10px 12px` 内边距。
- 回复区：输入框与发送按钮同行，`7px` 间距；输入框 `1.5px #e2e8f0`、`8px` 圆角，按钮使用 `#2563eb`。

## 响应式

- 桌面端保持 `500px` 宽。
- `<=700px` 时抽屉宽度切换为 `100%`。
- 移动端继续使用抽屉自身滚动，标题栏保持吸顶，正文和操作区不得另建固定滚动层。

## 素材

- 此组件不依赖外部图片或字体文件。
- 保留参考 HTML 使用的 Emoji、CSS 圆点、连接线、状态胶囊和内联业务图形语义。
