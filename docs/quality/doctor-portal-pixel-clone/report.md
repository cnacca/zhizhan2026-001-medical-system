# 医生端像素级视觉复刻交付报告

## 范围与隔离

- Worktree：`/Users/yuri/Documents/AI智能下单平台-doctor-ui`
- 分支：`feature/doctor-portal-pixel-clone`
- 基线提交：`cafae896df0eb71259ef4c116eacaf921070692f`
- 唯一参考：`frontend/public/reference/doctor-portal.html`
- 本轮只修改医生端呈现；医生工作台通过 `isDoctorPortalClone` 路由作用域排除在新样式之外。
- 未修改后端、管理端、生产端或客服端业务代码；未合并、未推送。

## 参考页面映射

| 参考状态 | 当前路由 / 状态 | 当前实现 | 真实数据 / 接口来源 | 结果 |
| --- | --- | --- | --- | --- |
| Dashboard | `/dashboard` | `App.vue` 医生工作台 | `/dashboards/phase-one-ab`、通知与医生既有工作台数据 | 保持不动，仅截图确认 |
| My Cases | `/doctor/orders` / `list` | 医生订单表格、筛选面板、详情抽屉 | `GET /orders`、`GET /orders/{id}` | 已复刻；不展示内部字段 |
| New Case Order | `/doctor/orders` / `create` | 全屏新建订单、动态表单、附件区、完整性检查 | `/form-configs`、`POST /orders`、文件上传既有接口、`POST /ai/check-missing` | 已复刻；未提交测试订单 |
| Case Drawer | 订单列表“查看” | 医生安全详情抽屉 | 订单详情、公开消息、设计稿、账单、付款流水、物流 | 代码完成；最终测试账号无稳定订单，完整 1440×900 复测受阻 |
| Design Review | `/doctor/orders` / `design` | 订单选择、版本列表、签名预览、确认 / 驳回 | `GET /orders/{id}/design-drafts`、`GET /files/{id}/preview-url`、医生确认接口 | 已复刻；最终无可用设计稿数据 |
| Billing | `/doctor/orders` / `bill` | 汇总能力占位、真实单据 / 收款 / 物流详情 | `GET /orders/{id}/bill`、`payments`、`logistics`、文件预览 | 已复刻；汇总接口未开放，不伪造金额 |
| Patients | `/doctor/patients` | 患者表格、新建弹窗、详情抽屉 | `GET/POST /patients`、`GET /patients/{id}/orders` | 已复刻；最终账号返回 0 条患者 |
| Settings / Clinic Profile | `/doctor/account/settings`、`/doctor/account/clinic` | 账户设置卡片、诊所与偏好只读卡片 | `/doctor/account/settings`、`/doctor/account/password`、`/clinics/{id}`、`preference` | 已复刻并验证刷新 / 保存同值 / 开关恢复 |
| Team Members | `/doctor/account/members` | 参考设置页风格的待开放页 | 尚缺诊所成员只读接口和菜单权限 | 视觉入口保留，不伪造成员 |
| Preferences | `/doctor/account/notifications` | 参考设置页风格的待开放页 | 尚缺渠道偏好接口、短信 / 邮件 / 企业微信服务 | 视觉入口保留，不伪造保存 |
| Password Security | `/doctor/account/security` | 参考设置页风格的待开放页 | 独立登录记录 / 安全提醒接口未开放；改密仍在账户设置真实接口 | 视觉入口保留 |
| Messages | `/collaboration` | 订单会话栏、消息区、@ 参与人、发送区 | `/orders/{id}/messages`、`message-mentionable-users` | 已复刻；最终无可沟通订单，发送保持禁用 |
| Notifications | `/notifications` | 消息页视觉语言的通知列表 | `/notifications`、未读数、已读接口、WebSocket | 已复刻；刷新通过，最终未读为 0 |
| Order Assistant | `/doctor/orders` / `ai` | 医生订单选择与问答区 | `POST /ai/order-query`，仅医生安全读模型 | 已复刻；无订单时不允许伪造回答 |

## 修改文件

### 医生端专属

- `frontend/src/doctor-portal.css`：医生端非工作台页面的参考色板、壳层、表格、筛选、抽屉、弹窗、消息、账单、空状态与响应式样式。
- `docs/quality/doctor-portal-pixel-clone/`：截图、映射、视觉差异和交互验收证据。

### 共享文件（后续集成需人工审阅）

- `frontend/src/App.vue`：增加医生端路由作用域、医生页结构、真实数据映射、页面级交互；没有改变其他端的业务分支。
- `frontend/src/main.ts`：仅新增医生端专属样式入口 `./doctor-portal.css`。

## 截图证据

浏览器视口在截图时通过页面校验确认为 `1440 × 900`。实现截图均为 1440×900；参考页部分截图因参考 HTML 自身固定滚动条由浏览器输出为 1435×897，但浏览器视口仍为 1440×900。

| 页面 / 状态 | 参考截图 | 实现截图 |
| --- | --- | --- |
| 医生工作台（未改） | `screenshots/reference/dashboard-baseline-1440x900.png` | `screenshots/implementation/dashboard-unchanged-1440x900.png` |
| 我的订单 | `screenshots/reference/cases-1440x900.png` | `screenshots/implementation/orders-1440x900.png` |
| 新建订单 | `screenshots/reference/new-order-1440x900.png` | `screenshots/implementation/new-order-1440x900.png` |
| 订单详情抽屉 | `screenshots/reference/order-detail-drawer-1440x900.png` | 最终账号无稳定订单；早期瞬时数据证据不作为 1440×900 完成证明 |
| 设计稿确认 | `screenshots/reference/cases-1440x900.png` | `screenshots/implementation/design-review-1440x900.png` |
| 账单物流 | `screenshots/reference/billing-1440x900.png` | `screenshots/implementation/billing-1440x900.png` |
| 患者管理 | `screenshots/reference/patients-1440x900.png` | `screenshots/implementation/patients-1440x900.png` |
| 新建患者弹窗 | `screenshots/reference/patient-create-modal-1440x900.png` | `screenshots/implementation/patient-create-modal-1440x900.png` |
| 账户设置 | `screenshots/reference/settings-1440x900.png` | `screenshots/implementation/settings-1440x900.png` |
| 诊所信息 | `screenshots/reference/settings-1440x900.png` | `screenshots/implementation/clinic-info-1440x900.png` |
| 成员账号 | `screenshots/reference/settings-1440x900.png` | `screenshots/implementation/account-members-1440x900.png` |
| 通知偏好 | `screenshots/reference/settings-1440x900.png` | `screenshots/implementation/account-notification-preferences-1440x900.png` |
| 密码安全 | `screenshots/reference/settings-1440x900.png` | `screenshots/implementation/account-security-1440x900.png` |
| 消息中心 | `screenshots/reference/messages-1440x900.png` | `screenshots/implementation/messages-1440x900.png` |
| 订单留言 | `screenshots/reference/messages-1440x900.png` | `screenshots/implementation/order-messages-1440x900.png` |
| 通知中心 | `screenshots/reference/messages-1440x900.png` | `screenshots/implementation/notifications-1440x900.png` |
| 订单助手 | `screenshots/reference/cases-1440x900.png` | `screenshots/implementation/order-assistant-1440x900.png` |

## 仍存在的视觉差异

1. 参考订单列表包含诊所、标签、内部式阶段点、创建 / 交付日期和金额；当前医生安全列表接口不返回这些字段。本轮不从内部接口补取、不伪造数据，改为真实公开状态、账单、物流和运单列。
2. 参考订单筛选包含医生、标签和日期；医生端只能查询本人，标签 / 日期筛选接口尚未开放。本轮保留禁用视觉入口和自然中文说明，真实可用筛选为关键词、公开状态、产品类型。
3. 参考账单页有跨订单汇总金额和月结单；当前仅有单订单账单、付款流水与物流接口。本轮用“—”保留汇总卡位，并明确接口开放后显示，未填入模拟金额。
4. 参考新建订单按六类产品做多步向导；当前业务以服务端动态表单和已配置产品类型为准。本轮复刻全屏层级、步骤栏、表单与附件区，不虚构未配置产品类别。
5. 参考消息页含示例会话、3D 设计预览和设计接受 / 驳回；当前最终测试账号没有可沟通订单。本轮保留真实会话结构，发送和 @ 在未选订单时禁用。
6. 参考设置页将诊所、成员和偏好置于同页标签；当前项目已有独立账户菜单路由，按要求不改变菜单结构，因此复用同一视觉语言而不合并路由。
7. 订单详情抽屉代码与早期瞬时真实数据路径已通过，但最终验收时医生账号 `GET /orders` 返回 0，无法形成稳定的 1440×900 实现抽屉截图；不据此宣称该状态完成。

## 真实能力与安全边界

- 保留 Bearer 登录、菜单 / 角色 / 数据范围、医生订单安全投影、消息可见性、文件短时效签名 URL、设计稿确认、账单物流、通知 WebSocket、患者档案和 AI 医生安全读模型。
- 医生页面未新增 `internal_status`、生产员工、入检 / 出检、工时、绩效、返工责任等内部字段来源。
- 暂未接入的成员、通知渠道、汇总账单、日期 / 标签筛选均只保留视觉入口；后续需对应后端接口、医生权限码和 OpenAPI 契约后启用。
- 详细按钮级结果见 `interaction-matrix.md`。

## 验证结果

- `pnpm --filter ai-order-platform-frontend build`：通过（含 `vue-tsc -b` 与 Vite build）。
- `git diff --check`：通过。
- 相关后端安全回归：63 tests，0 failures，0 errors。
- 通过：`check:task9d2`、`check:task9d11`、`check:task9d13`、`check:task9d24`、`check:task9d61`、`check:auth-refresh`。
- 基线文档型检查失败：`check:task9d1` 仍要求旧文案“医生 AI”；`check:task9d58/60/67/83/85/89/96` 依赖当前 `acceptance.json` 或历史文档中已不存在的旧验收标记。未修改验收矩阵、未通过补假标记使检查变绿。
- 前端包没有独立 `lint` 或 `test` script；以 typecheck/build、现有静态检查、后端安全测试和真实浏览器验收替代。

## 风险与未验证项

- 最终医生测试账号返回 0 个患者、0 个订单；订单详情、上传绑定、下载 / 预览、设计稿确认 / 驳回、账单预览、AI 提问、消息发送无法在最终稳定数据状态下走到成功结果。
- 删除、撤销、确认收货等会改变业务状态的动作未执行；没有可明确销毁的测试订单。
- 未验证真实大文件上传、跨设备续传、外部短信 / 邮件 / 企业微信、真实支付、真实物流平台和真实 AI key。
