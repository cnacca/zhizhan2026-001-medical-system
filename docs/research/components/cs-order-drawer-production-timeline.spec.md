# 客服订单抽屉制作时间线规格

## 概览

- 目标文件：`frontend/src/components/CsPortalPages.vue`
- 样式文件：`frontend/src/cs-rebuilt-pages.css`
- 权威参考：`frontend/public/reference/cs-portal.html` 第 3320 行附近的 `Production Timeline`
- 参考截图：`docs/design-references/cs-portal/order-drawer-20260720/reference-order-drawer-1280x720.png`
- 交互模型：八条主流程纵向时间线，随抽屉整页滚动；每条主流程可独立展开真实内部工序，不分页、不切换页签。

## DOM 结构

1. 小节标题：“制作时间线”与主流程完成数。
2. 纵向时间线容器。
3. 最多八条主流程：订单接收、信息与数据审核、入厂收货、种植部件制作、CAD设计与切削、金属与瓷层加工、上釉/抛光与质检、账单核对与发货。
4. 不适用于当前产品且没有真实节点的主流程自动隐藏。
5. 每条主流程由24px圆点、1px连接线和右侧正文组成，正文显示状态与已处理内部工序数。
6. 点击“查看N道内部工序”后，显示对应真实工序名、图形、负责人、状态和时间。
7. 当前主流程增加浅紫说明卡，指出当前真实内部工序。
8. 无生产实例时展示中文空态。

## 参考计算样式

### 小节标题

- font-size: `10px`
- font-weight: `700`
- letter-spacing: `.6px`
- color: `#94a3b8`
- margin-bottom: `10px`
- 完成数：`10px / 700 / #7c3aed`

### 时间线行

- display: `flex`
- gap: `11px`
- position: `relative`
- padding-bottom: `14px`，末项为 `0`
- 跳过节点：`opacity:.32`

### 连接线

- position: `absolute`
- width: `1px`
- left: `12px`
- top: `24px`
- bottom: `0`
- background: `#eef2f8`
- 最后一项不显示

### 圆点

- width/height: `24px`
- border-radius: `50%`
- border: `2px solid`
- font-size: `9px`
- flex-shrink: `0`
- 已完成：边框 `#ddd6fe`，底色 `#f5f3ff`，文字 `#7c3aed`，内容为 `✓`
- 进行中：边框/底色 `#7c3aed`，文字 `#fff`，`box-shadow:0 0 0 4px rgba(124,58,237,.15)`
- 待处理：边框 `#e2e8f0`，底色 `#fff`，文字 `#94a3b8`

### 主流程正文

- 正文容器：`flex:1; padding-top:3px; min-width:0`
- 主流程名称：`12px / 600 / #0f172a`；已完成与待处理使用 `#94a3b8`
- 主流程说明：`10px / 400 / #94a3b8`
- 内部工序完成数：`11px / 400 / #94a3b8; margin-top:1px`
- 当前节点说明：`margin-top:5px; padding:6px 10px; border-radius:7px; border-left:2px solid #7c3aed; background:#f5f3ff; color:#475569; font-size:11px`

### 展开的内部工序

- 容器：`margin-top:8px; padding:2px 9px; border:1px solid #eef2f8; border-radius:8px; background:#f8fafc`
- 图形圆点：`18px × 18px`
- 工序名称：`11px / 600 / #475569`
- 阶段、负责人和时间：`10px / 400 / #94a3b8`
- 状态：`9px / 700 / #94a3b8`，进行中使用 `#7c3aed`

## 数据与状态

- 内部节点顺序严格使用后端 `step_order`。
- 主流程分组使用后端稳定的 `stage_name` 和少量明确工序边界，不改变、删除或伪造真实节点。
- 当前订单有对应真实节点时最多显示八条主流程；无真实节点的主流程不显示。
- 已完成：`node_status === COMPLETED`。
- 进行中：`IN_PROGRESS / PROCESSING / RUNNING`。
- 跳过：`SKIPPED`。
- 其他状态统一作为待处理，不泄漏英文枚举。
- Emoji 必须通过 `PROCESS_NODE_VISUAL_GROUPS` 对全部九类工艺链的真实工序名进行显式映射：接收 `📥`、审核 `🔎`、数据 `💾`、设计 `✏️`、确认 `🔍`、制作 `⚙️`、上色 `🎨`、质检 `✅`、账单 `💳`、发货 `🚀`。
- 不允许再根据关键词临时猜测，也不允许在无法匹配时显示节点序号；未来新增工序在映射补齐前使用中性的制作图形 `⚙️`。
- 时间只使用 `completed_at / started_at / deadline_at`，没有时间则显示“时间尚未安排”。
- 主时间线不再平铺28个或更多内部工序；真实工序只在对应主流程展开区域显示。

## 响应式

- 1440/768：保持 24px 圆点、11px 间距、14px 行距。
- 390：抽屉宽 `100vw`，时间线规格不缩小，只允许右侧正文自然换行。

## 资产

- 无图片、视频或外部 SVG。
- 使用参考文件同款 Emoji 与 CSS 圆点/连接线，不新增图标库。
