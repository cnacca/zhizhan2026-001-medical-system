# 管理端客户只读分析页重构与验收记录

- 日期：2026-07-16
- 状态：`SUPERSEDED_BY_CONFIRMED_DESIGN_PENDING_IMPLEMENTATION`
- 范围：管理端 `/admin/clinics`；客户资料维护继续由客服端 `/customers` 承担；不修改后端

## 最新产品边界

> 2026-07-16 更新：用户已确认新的“客户目录 / 客户贡献”目标设计，当前文档下方截图与验收结果对应旧实现，只作为历史本地证据，不代表新方案已经实施或通过验收。新方案详见 `docs/design/admin-portal/PAGE_COMPOSITION_MAPPING.md` 5.4。

目标形态确定为“只读分析 + 轻量跟进管理”，但本轮只实施第一阶段只读分析。第二阶段的跟进事项、负责人、期限、状态、结果和审计模型暂不开发，也不在前端展示待开放按钮。

管理端当前允许查看客户结构、月度贡献、诊所客户清单和只读详情；不允许新增或编辑诊所、联系人、制作偏好，也不承担日常客户沟通。客服端现有录入与偏好维护功能保持不变。

## 编码前区域与真实能力映射

| 管理端区域 | 参考 HTML 定位 | 几何 / 交互 | 图片 / Emoji / SVG | 真实字段 / API | 允许差异 | 禁止扩展 |
| --- | --- | --- | --- | --- | --- | --- |
| 页面顶部 | 已确认人员管理顶部 | 眉题、标题、说明；无页面级写操作 | 管理端统一线性 SVG | 当前路由 | 无可靠刷新时间时不显示 | 不显示新增/编辑 |
| 总体概况 | `cs-portal.html#page-dashboard` Monthly KPIs | 四张紧凑指标卡 | CSS 强调线 | `/clinics.total`、`current_month`、`top_customers[0]` | 客服紫改管理蓝/青/紫 | 不加入演示收入、活跃或风险 |
| 月度表现 | 同一 Dashboard 的 This Month vs Last Month | 本月/上月订单与件数对照、真实差值 | `📊` + CSS 状态 | `current_month`、`previous_month`、两个 delta | 只显示接口月份 | 不前端推算增长率 |
| 客户排名 | `#top-clients-chart`、`renderTopClients()` | 排名、客户、横向贡献条、订单数、件数 | `🏆` + CSS 横向条 | `top_customers` | 参考收入条改为真实件数贡献条 | 不展示演示收入或增长率 |
| 客户清单 | `doctor-portal.html#page-patients` | 卡片内高密度表格、关键词查询、行点击 | `🏥` + 状态点 | `GET /clinics` | 患者字段改为诊所档案字段 | 不推导最近下单、医生团队或负责客服 |
| 只读详情 | `doctor-portal.html#page-settings` Clinic Profile / Preferences | 560px 抽屉、档案/贡献/偏好分组 | `🏥`、`📊`、`🦷` | `GET /clinics/{id}`、`GET /clinics/{id}/preference` | 编辑表单改为只读信息格 | 不显示保存、跟进或 CRM 动作 |
| 数据说明 | 聚合卡片底部 | 来源与生成时间 | 无 | `source_note`、`generated_at` | 明确本地第一段口径 | 不描述为正式 BI |
| 空/失败 | 三块区域分别处理 | 页内空状态、错误提示 | 无额外装饰图 | 真实响应 | 排名外客户显示“未进入本月排名” | 不把排名外解释为零订单 |

## 真实接口与能力边界

- 页面加载：`GET /dashboards/phase-one-ab`、`GET /clinics?page=1&size=100`。
- 搜索：`GET /clinics?page=1&size=100&keyword=...`。
- 打开详情：`GET /clinics/{clinicId}`、`GET /clinics/{clinicId}/preference`。
- 不请求订单明细、销售金额或其他客户经营接口。
- 不调用任何客户写接口；不显示新增、编辑、偏好保存、发起跟进、转派或关闭事项。
- 当前接口不提供客户级长期趋势、最近下单、医生团队、负责客服、返工率、投诉率、交付问题或账单风险；页面不推断、不伪造。

## 实现结果

- 顶部概况展示客户总数、本月订单、本月件数和本月领先客户。
- 月度表现展示本月/上月订单与件数及真实差值。
- 客户排名保留参考页横向贡献条，按接口真实件数排序。
- 诊所客户清单展示联系人、合作状态、偏好数量、Top 排名映射和最近维护时间，支持诊所/联系人真实搜索。
- 点击客户打开 560px 只读详情，展示本月 Top 贡献、基础档案和六项制作偏好。
- 排名外客户不显示零订单，只说明当前聚合未提供其单独订单与件数。
- 客服端 `/customers` 的创建诊所与偏好维护代码保持不变。

## 真实 Chrome 验收

- `1440×900`：页面 `clientWidth=scrollWidth=1159`，文档 `clientWidth=scrollWidth=1440`，页面完整落在 900px 视口内。
- `1280×800`：页面 `clientWidth=scrollWidth=999`，文档 `clientWidth=scrollWidth=1280`；客户清单卡 `clientWidth=scrollWidth=960`，无页面级横向溢出。
- 560px 客户详情抽屉 `clientWidth=scrollWidth=560`，内部 `input/select/textarea=0`。
- 页面基础请求 `GET /dashboards/phase-one-ab` 与 `GET /clinics?page=1&size=100` 均返回 `200 OK`。
- 详情请求 `GET /clinics/211` 与 `GET /clinics/211/preference` 均返回 `200 OK`。
- 关键词无结果状态已验证；清空并重新查询后真实列表恢复。
- CDP 记录中没有 `Runtime.exceptionThrown` 或 `Log.entryAdded` 错误/警告。
- `npm run build:frontend` 与 `git diff --check` 通过；仅有既有 Rollup PURE 注释和大分包提示。

## 最终截图

- `screenshots/final-client-readonly-analysis-1440x900-20260716.png`
- `screenshots/final-client-readonly-analysis-1280x800-20260716.png`
- `screenshots/final-client-readonly-detail-1280x800-20260716.png`

目录内此前的纯汇总页、客户卡片和旧抽屉截图均对应已撤回口径，不再作为当前验收证据。

当前旧实现已被新确认设计取代，等待后续按新方案重新编码和验收；现阶段继续讨论下一页面设计。Task 8 继续保持 `NOT_READY`。
