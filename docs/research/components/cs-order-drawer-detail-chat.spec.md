# 客服订单抽屉资料、文件与聊天规格

## 概览

- 目标文件：`frontend/src/components/CsPortalPages.vue`
- 样式文件：`frontend/src/cs-rebuilt-pages.css`
- 参考内容：`renderOrderDetail(..., 'cs')` 和 `#cs-drawer-msgs-section`
- 交互模型：静态资料 + 点击文件预览 + 文本输入发送真实订单消息。

## 结构顺序

本规格中的四个内容区不再是页签，按以下顺序放入同一个抽屉文档流：

1. 订单资料：产品、牙位、色号、最多 6 项参数、临床说明；完整牙位图仍可按需展开。
2. 文件与设计：默认最近 3 个附件与最近 2 个设计版本，可展开全部附件。
3. 沟通信息：默认最近 5 条真实消息、输入框和发送按钮，可展开全部消息。
4. 订单记录：默认最近 5 条真实时间线，可展开全部记录。

区块之间使用 `margin-top:16px; padding-top:14px; border-top:1.5px solid #f1f5f9`。不显示四页签导航，不使用 `role=tab/tabpanel`，滚动抽屉即可依次查看。

## 精确视觉规格

### 牙位图

- container: `padding:12px 14px; border:1.5px solid #e2e8f0; border-radius:10px; background:#f8fafc`
- 标题：`10px / 700 / .6px letter-spacing / #64748b`
- 牙位格：`24px × 24px; border-radius:4px; gap:2px`
- 选中：蓝底 `#dbeafe`、蓝边 `#3b82f6`、文字 `#1d4ed8`
- 桥体产品可使用黄底 `#fef3c7`和黄边 `#f59e0b`

### 临床参数与说明

- 参数网格：`repeat(2, minmax(0,1fr)); gap:8px`
- 参数卡：`padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:8px; background:#fff`
- label: `9px / 700 / .4px letter-spacing / #94a3b8`
- value: `12px / 500`
- 种植参数：`#f5f3ff` 底、`#c4b5fd` 边、`#7c3aed` 标题
- 临床说明：`padding:12px 14px; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; line-height:1.7`

### 文件和设计稿

- 文件卡：最小 `58px`，三列 `38px minmax(0,1fr) auto`，`padding:9px 10px`，`8px` 圆角
- 类型图形：`36px × 36px`，紫色浅底，使用中文“图片/模型/文档/文件”
- 文件卡整体可点击，hover 边框转紫且背景转 `#faf5ff`
- 设计稿卡：`padding:10px 11px; border:1px solid #e2e8f0; border-radius:8px; background:#fafbfc`

### 聊天

- 历史区最大高度 `220px`，内部纵向滚动
- 单条消息：`grid-template-columns:28px minmax(0,1fr); gap:9px`
- 头像：`28px × 28px; border-radius:8px`
- 气泡：`padding:9px 10px; border:1px solid #e2e8f0; border-radius:0 8px 8px 8px; background:#f8fafc`
- 客服自己：头像浅绿，气泡浅紫 `#f5f3ff`
- 输入行：`display:flex; gap:7px; margin-top:10px`
- 输入框：`min-height:34px; padding:7px 11px; border:1.5px solid #e2e8f0; border-radius:8px; background:#f8fafc; font-size:12px`
- 发送：`min-width:58px`，紫色主按钮，发送中和空文本时禁用

### 单页分节标题

- 眉题：`10px / 700 / .6px letter-spacing / #94a3b8`
- 主标题：`13px / 700 / #1e293b`
- 计数：`10px / 700 / #7c3aed`
- 分节之间不使用卡片大边框，保持参考文件的连续文档流。

## 交互与真实数据

- 发送调用 `POST /orders/{orderId}/messages`，默认 `visible_to=DOCTOR_CS`；成功后清空输入并重读消息列表。
- 失败保留草稿，就地显示中文错误，不假成功。
- 文件预览调用 `GET /files/{fileId}/preview-url`；图片/文档显示真实授权地址，STL 复用现有 3D 查看器。
- 未知英文字段名不显示；已配置中文标签或中文键可显示。
- 医生、生产人员、客服的真实可见范围继续由后端判定。

## 状态

- 聊天：加载、空、有历史、发送中、发送失败、发送成功后刷新。
- 文件：无文件、授权地址读取中、图片/文本/PDF 预览、STL 3D 预览、授权失败。
- 资料：有牙位/无牙位、通用产品、种植产品、正畸产品、无临床说明。

## 响应式

- 540px 抽屉中保持双列参数卡。
- 小于 520px 时，摘要和参数网格降为单列，牙位格自动换行，操作按钮可换行。

## 资产

- 无需下载参考图片。
- 复用项目 `StlViewerDialog.vue`、Emoji 和 CSS 图形。
