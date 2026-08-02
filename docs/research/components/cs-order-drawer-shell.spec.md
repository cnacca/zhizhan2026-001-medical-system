# 客服订单抽屉外壳与业务摘要规格

## 概览

- 目标文件：`frontend/src/components/CsPortalPages.vue`
- 样式文件：`frontend/src/cs-rebuilt-pages.css`
- 权威参考：`frontend/public/reference/cs-portal.html#cs-drawer`
- 参考截图：`docs/design-references/cs-portal/order-drawer-20260720/reference-order-drawer-1280x720.png`
- 改造前截图：`docs/design-references/cs-portal/order-drawer-20260720/before-order-drawer-1280x720.png`
- 交互模型：点击订单行从右侧滑入；抽屉整体纵向滚动；顶部吸顶；遮罩或关闭按钮退出。

## 结构顺序

1. 61px 吸顶顶部：“订单详情”眉题、订单号、真实信息审核入口、关闭按钮。
2. 双列摘要：患者、产品、客户、医生、牙位、色号、金额、客服负责人、订单创建、最近更新、生产创建、登记/阶段状态。
3. 真实状态提示：新订单、驳回、设计待确认、待补资料等状态才出现。
4. 制作时间线：按参考文件的纵向节点、圆点、连接线和当前节点说明卡，展示全部真实 `process-instance` 节点。
5. 订单资料。
6. 文件与设计稿。
7. 沟通信息与发送框。
8. 订单记录时间线。

以上区块全部处于同一个文档流中，按顺序连续向下滚动；不使用页签、切换面板或固定底栏。

## 精确计算样式

### 抽屉

- width: `540px`
- height: `100vh`
- position: 右侧抽屉定位
- background: `#ffffff`
- border-left: `1.5px solid #e2e8f0`
- box-shadow: `-8px 0 32px rgba(30,27,75,.1)`
- overflow-y: `auto`
- transition: `transform .28s cubic-bezier(.4,0,.2,1)`
- 遮罩：`rgba(30,27,75,.15)`

### 顶部

- position: `sticky`; top: `0`; z-index: `2`
- height: `61px`
- padding: `14px 20px`
- border-bottom: `1.5px solid #e2e8f0`
- 眉题：`9px / 700 / 1px letter-spacing / #94a3b8`
- 订单号：Lora，`14px / 600 / #0f172a`
- 关闭按钮：`26px × 26px`，无边框，`6px` 圆角，hover 背景 `#f1f5f9`

### 正文与摘要

- body padding: `16px 20px`
- 摘要：两列，参考基准 `gap: 10px`；中文长文案可收紧为 `10px 24px`
- 标签：`10px / 700 / .5px letter-spacing / #94a3b8`
- 值：`12px / 500 / #0f172a`
- 小节标题：`10px / 700 / .6px letter-spacing / #94a3b8`
- 区块分隔：`margin-top:16px; padding-top:14px; border-top:1.5px solid #f1f5f9`

## 状态与行为

- 打开：右向左滑入，`.28s cubic-bezier(.4,0,.2,1)`。
- 滚动：抽屉容器滚动，顶部保持在 `y=0`；不使用当前“正文单独滚动 + 底部固定”。
- 状态提示：根据真实订单状态选择紫/橙/红语义色；无异常时不伪造提示。
- 节点：严格使用参考时间线的客服紫状态体系；已完成为浅紫圆点，进行中为紫色实心并有 4px 外环，未开始为白底灰边，跳过整体透明度 `.32`。
- 所有操作必须调用现有路由或真实 API，不使用前端假成功。

## 文案与数据

- 全部界面标签使用中文。
- 订单号、运单号、真实文件名、专有材料/品牌名保留原值。
- 产品类型、状态、文件来源和可见范围禁止直接显示英文枚举。

## 响应式

- 1440/1280：固定 `540px`。
- 768：保持 `540px`，遮罩剩余页面。
- 390：安全适配为 `100vw`，双列根据内容降为单列；这是必要响应式差异。

## 资产

- 参考抽屉无传统图片和视频；视觉资产为 Emoji、CSS 圆点/连线/胶囊与文件类型图形。
- 不下载新资产，不替换成通用图标库。
