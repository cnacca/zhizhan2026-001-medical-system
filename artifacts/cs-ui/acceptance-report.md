# 客服端其余页面像素级复刻验收报告

## 范围与结论

- 独立工作树：`/Users/yuri/Documents/AI智能下单平台-cs-ui`
- 分支：`feature/cs-portal-pixel-clone`
- 唯一参考：`frontend/public/reference/cs-portal.html`
- 客服工作台：未进入 `cs-reference-mode`，页面结构与业务代码保持不动；仅共享字体/基础主题继续沿用原全局样式。
- 管理端、生产端、医生端：未改页面代码；生产端仅用于真实双向消息验收。
- 视觉策略：在 `frontend/src/cs-portal.css` 内增加客服端非工作台专属样式，通过 `cs-reference-mode` 与 `cs-page-*` 精确限定，不重做菜单、路由、权限或接口。

## 参考页—路由—组件—接口映射

| 参考页母版 | 当前客服入口 / 路由 | 当前实现区块 | 真实数据与接口 |
|---|---|---|---|
| Order Details | 订单管理、待审核订单、全部订单、设计稿管理、翻译助手、生产备注助手 / `/orders/internal` | `internal-order-panel` | `GET /orders`、订单初审、`/ai/check-missing`、`/ai/translate`、`/ai/production-note`、设计稿、账单、付款接口 |
| Data Processing Centre | 设计稿管理、翻译助手、生产备注助手 / `/orders/internal` | 订单详情内审核、设计稿与 AI 标签页 | `/orders/{id}/design-drafts`、`/files/{id}/preview-url`、AI 草稿与人工确认接口 |
| Communications Centre | 沟通中心、订单消息、待审核消息 / `/collaboration` | `customer-collaboration-panel` | `/orders/{id}/messages`、`message-mentionable-users`、`/messages/pending-review`、消息审核、通知事实表与 WebSocket |
| Client Management | 客户管理 / `/customers` | `clinic-preference-panel` | `/clinics`、`/clinics/{id}/preference` |
| Billing & Dispatch | 账单管理、配送管理 / `/delivery` | `cs-delivery-management-panel` | `/logistics/orders`、账单、人工付款、物流、物流异常跟进接口 |
| Settings & Accounts | 产品管理 / `/system/form-configs`；通知中心 / `/notifications`；客服账号弹层与四个账号入口 | `form-config-panel`、`notification-panel`、账号弹层、`placeholder-panel` | `/products`、`/form-configs`、`/notifications`、`/api/auth/refresh`、`/api/auth/logout` |
| Billing/Data table 延伸 | 外协管理 / `/production/cost-management` | 现有成本汇总与登记区块 | `/production/cost-management/summary`、`/records` |
| Communications 延伸 | 客服查询助手 / `/ai/cs` | `cs-ai-query-panel` | `/ai/cs-query`，含附件授权预览上下文 |

参考文件没有与当前菜单逐项一一对应的“产品管理、外协管理、AI 查询、通知中心”独立页面；本轮没有猜造新业务，而是复用六个参考母版的壳层、卡片、表格、消息与设置语言，并保留当前真实路由和接口。

## 页面截图与差异

| 当前页面 | 参考截图 | 实现截图 | 仍存在的差异及原因 |
|---|---|---|---|
| 客服工作台（未改） | `reference/dashboard.png` | `implementation/dashboard-untouched.png` | 按要求保持现有真实统计工作台，不复刻参考固定样例数据。 |
| 订单管理 | `reference/orders.png` | `implementation/orders.png` | 参考含患者、金额、负责人、交期等固定样例列；当前 DTO 未完整提供这些字段，因此仅展示真实订单号、诊所/产品和状态，详情动作保留在下方真实标签页。 |
| 设计稿管理 / 数据处理 | `reference/data-processing.png` | `implementation/designs.png` | 参考为固定处理队列；当前使用真实订单与设计稿记录。运行后端缺少文件上传入口，真实上传/预览本轮阻塞。 |
| 沟通中心 | `reference/communications.png` | `implementation/communications.png` | 参考有模拟会话列表与气泡；当前只显示真实订单消息，空数据时使用中文空状态，并保留审核与 @ 参与人机制。 |
| 客户管理 | `reference/clients.png` | `implementation/clients.png` | 参考含合同、信用额度、逾期等未接业务字段；当前只显示真实诊所、联系人和六项客户偏好。 |
| 产品管理 | `reference/settings-accounts.png` | `implementation/products.png` | 参考设置页没有产品目录；当前采用其表单卡片语言展示真实产品目录和动态表单。 |
| 账单管理 | `reference/billing-dispatch.png` | `implementation/billing.png` | 当前运行数据无配送订单，展示真实空状态；未伪造发票、金额或物流轨迹。 |
| 配送管理 | `reference/billing-dispatch.png` | `implementation/delivery.png` | 未接真实物流平台、轨迹与电子面单；保留人工状态与异常跟进入口。 |
| 外协管理 | `reference/billing-dispatch.png` | `implementation/outsourcing.png` | 复用现有外协成本事实接口；复杂审批和供应商结算未开放。 |
| 客服查询助手 | `reference/communications.png` | `implementation/ai-query.png` | 参考为聊天式翻译辅助；当前 AI-2 为真实只读查询草稿，不能自动发送或写订单。 |
| 通知中心 | `reference/settings-accounts.png` | `implementation/notifications.png` | 参考设置页仅有通知偏好；当前展示真实通知事实、未读数和 WebSocket 状态。技术事件码已转中文。 |
| 客服账号菜单 | `reference/settings-accounts.png` | `implementation/account-menu.png` | 当前账号团队、客户分配、常用回复、偏好接口尚未开放，保持入口并显示自然中文说明。 |
| 客服账号页 | `reference/settings-accounts.png` | `implementation/account-profile.png` | 未伪造团队成员或分配数据；显示“业务接口、权限与数据范围开放后启用”。 |

所有上表参考与实现主截图均为 1440×900；通信过程证据另存于 `implementation/communication-*.png`。

## 真实交互测试矩阵

| 入口 | 操作 | 预期 | 实际 | 结果 |
|---|---|---|---|---|
| 登录 | 客服端真实账号登录 | 进入客服工作台 | 成功，真实菜单/权限加载 | PASS |
| 左侧菜单 | 逐项点击工作台、订单、沟通、客户、产品、设计稿、账单、配送、外协、智能助手、通知 | 路由、选中态与主题稳定 | 全部可达；非工作台进入客服参考模式 | PASS |
| 顶栏搜索 | 输入关键词并回车 | 调用当前页真实查询 | 订单/客户/产品路由分别绑定现有查询；运行后端订单列表刷新为空 | PASS（真实空结果） |
| 订单筛选 | 点击队列筛选、查询 | 筛选状态和结果刷新 | 入口可用；新会话运行后端返回空订单列表 | PASS（空状态） |
| 订单详情标签 | 订单资料、审核、设计稿、账单物流 | 有订单时切换真实详情 | 初始缓存会话可见；刷新后无订单，未能完成最终复测 | BLOCKED |
| 沟通查询 | 输入订单 ID 10483 并查询 | 加载订单参与人与历史消息 | 成功 | PASS |
| 客服发送 | 不 @ 生产发送消息 | 默认按现有规则医生/客服可见 | 成功，`visibility=DOCTOR_CS`；生产不可见，符合后端现有规则 | PASS |
| 客服定向生产 | 选择“本地生产员工”后发送 | 生产端可见 | 成功，`visibility=CS_WORKER` | PASS |
| 生产接收 | 生产端真实登录、查询同订单 | 看到客服定向消息 | 成功 | PASS |
| 生产回复 | 生产端发送回复 | 客服待审核队列收到 | 成功，生成 `PENDING_REVIEW` | PASS |
| 客服审核 | 点击“通过” | 待审核数归零、历史保留 | 成功 | PASS |
| 刷新持久化 | 生产端刷新、重新登录、再次查询 | 历史消息仍存在 | 客服定向消息与生产回复均存在 | PASS |
| 未读状态 | 查询 CS/WORKER 通知事实 | 各自收到未读补偿 | CS 收到 `MESSAGE_PENDING_REVIEW`，WORKER 收到 `MESSAGE_MENTIONED`，`read_at=null` | PASS |
| 客户管理 | 查询、选择客户 | 详情与偏好刷新 | 成功，1 家真实诊所 | PASS |
| 客户偏好保存 | 点击保存 | 会修改现有测试诊所偏好 | 未执行，避免覆盖现有数据 | NOT_RUN |
| 产品管理 | 刷新、选择产品 | 列表与编辑表单同步 | 成功，1 条真实产品记录 | PASS |
| 产品新增/停用 | 新增、保存、停用 | 会修改产品目录 | 未执行，避免改变现有产品配置 | NOT_RUN |
| 配送筛选 | 选择“物流异常”、刷新 | 真实筛选并显示列表/空态 | 成功，真实空状态 | PASS |
| 配送跟进 | 保存内部跟进 | 需要可用配送订单 | 当前无配送订单，未执行 | BLOCKED |
| AI-2 | 输入订单 10483 与问题并生成 | 返回内部只读草稿 | 成功，结果卡显示 | PASS |
| 通知中心 | 刷新列表 | 列表、状态、WebSocket 文案正常 | 成功；当前前 50 条均已读 | PASS |
| 账号弹层 | 打开四个账号入口 | 弹层与自然空状态可用 | 客服账号页已验证 | PASS |
| 账号切换 | 点击账号切换 | 回到客服登录页 | 成功 | PASS |
| 新建订单 | 查看顶栏入口 | 不伪造未开放能力 | 按参考保留按钮并禁用，提示接口开放后启用 | PASS |
| 上传/预览/下载 | 安全 txt 文件走上传 token | 上传完成并获取授权预览 | 运行中的 8080 后端对源码已有 `POST /files/upload-token` 返回 404；MinIO 健康 200 | BLOCKED |
| 删除/撤销 | 危险动作只到确认并取消 | 不改变数据 | 本轮页面无可安全定位的删除/撤销入口 | NOT_APPLICABLE |

## 生产—客服双向通信证据

- 测试订单：`artifacts/cs-ui/communication-test-order.json`（订单 10483 / `ORD20260713-B06D720629`）。
- 通知与未读：`artifacts/cs-ui/communication-notification-evidence.json`。
- 客服发送：`implementation/communication-cs-sent.png`、`implementation/communication-cs-directed-worker.png`。
- 生产接收与回复：`implementation/communication-production-directed-history.png`。
- 客服接收与审核：`implementation/communication-cs-received-production-reply.png`、`implementation/communication-cs-approved-history.png`。
- 刷新持久化：`implementation/communication-after-refresh.png`。

结论：真实消息表、订单关联、参与人 @、生产消息审核、通知事实、未读补偿和刷新持久化均通过。第一次客服消息未 @ 生产时生产不可见，确认是后端既定默认 `DOCTOR_CS` 可见性；选择订单内生产参与人后自动使用 `CS_WORKER`，双向链路通过，无需改后端业务逻辑。

## 保留能力、Bug 与阻塞

保留的真实能力：登录与权限菜单、DataScope、订单初审、资料缺失检查、翻译/生产备注草稿、消息与审核、@ 参与人、通知/WebSocket、客户偏好、产品目录/动态表单、设计稿记录、账单付款、物流异常、外协成本、AI-2 查询。

本轮修正：

1. 客服非工作台从通用大卡片壳层改为参考页的深紫侧栏、56px 顶栏、紧凑筛选/表格/双栏消息/卡片密度。
2. 客服工作台通过模式条件隔离，未被专属样式影响。
3. 通知事件码、消息可见范围、消息审核状态和产品类型改为中文显示。
4. 未接账号功能移除“演示入口/技术状态”措辞，统一为自然中文开放说明。
5. 顶栏全局搜索连接订单、客户、产品与沟通真实查询；新建订单入口保持禁用，不伪造成功。

阻塞与风险：

1. 当前运行中的后端缺少源码已有的 `/files/upload-token` 路由，见 `file-upload-blocker.json`；需要在后续集成窗口重启/更新后端并复测上传、预览、下载及审计。
2. 新会话的 `GET /orders` 对 CS 返回空列表，但订单详情/消息接口可访问测试订单；本轮不改业务查询/DataScope，建议后续核对运行后端版本和订单列表查询条件。
3. 参考页使用固定模拟患者、金额、合同、发票和轨迹；当前接口没有的字段均未伪造，因此部分列数、弹窗和图表内容无法一比一呈现。
4. `check:task9d58`、`check:task9d90`、`check:task9d92` 的历史静态检查与当前 `acceptance.json`/累计文档基线不一致；未为变绿而回填或削弱验收文档。

## 验证结果

- `pnpm --filter ai-order-platform-frontend build`：PASS（含 `vue-tsc -b`）。
- `npm run check:task9d36`：PASS。
- `npm run check:task9d64`：PASS。
- `npm run check:task9d91`：PASS。
- `npm run check:frontend-customer-smoke-closure`：PASS。
- `npm run check:task9d97`：PASS。
- `npm run acceptance`：PASS。
- `git diff --check`：PASS。
- `TASK9D36_FRONTEND_URL=http://127.0.0.1:57210 npm run smoke:task9d36`：FAIL；在医生端工作台缺少脚本要求的 `.prototype-chart-card` 时中止，尚未进入客服端断言，与本轮客服专属样式无关。
- `npm run check:frontend-productization-closure`：FAIL；基线 `App.vue` 缺脚本要求的旧状态表面标识（`frontendProductizationStateCopy` 等）。
- `npm run check:task9d85`：FAIL；脚本仍要求旧 `localhost:8080` 文本和已从当前 acceptance 清理的历史条目。
- `npm run check:task9d88`：FAIL；基线 `acceptance.json` 缺历史标识 `task-9d88-customer-collaboration-visibility-required-text`。
- `npm run check:task9d59`：FAIL；基线 `acceptance.json` 缺历史标识 `task-9d59-cs-ai-missing-translation-required-text`。
- `check:task9d58`：FAIL，基线 `acceptance.json` 缺历史标识 `task-9d58-customer-collaboration-required-text`。
- `check:task9d90`：FAIL，累计文档缺脚本要求的旧文本“产品参数 / 价格体系一期最小后台”。
- `check:task9d92`：FAIL，基线 `acceptance.json` 缺历史标识 `task-9d92-cs-ai-query-entry-required-text`。
- 文件上传浏览器验收：BLOCKED，运行后端接口 404；MinIO 健康检查 200。
