# 三端参考页面像素级复刻研究基线

> 状态：已完成首轮真实 Chrome 研究与静态结构核对
> 研究日期：2026-07-15
> 适用对象：医生端、客服端、生产端后续视觉复刻与交互复刻
> 权威来源：`frontend/public/reference/` 下的三个 HTML 文件及本页记录的 SHA-256

## 1. 文档用途

本文件用于保存三个参考 HTML 的视觉语言、页面拓扑、角色差异、交互模型、资源形态和验收方法。后续开始任何一个端口的复刻前，先核对源文件哈希；哈希未变化时可直接沿用本基线，哈希变化时必须把文件当作新版参考重新研究。

“像素级复刻”不能只理解为颜色和布局相似。交付范围至少包括：

- 页面骨架、尺寸、间距、字体、颜色、边框、阴影和响应式行为；
- 菜单、标签、状态、表格、卡片、抽屉、弹窗、Toast 等全部可见状态；
- 点击、悬停、输入、筛选、切换、滚动、打开与关闭等交互；
- 内联 SVG、Emoji、符号、CSS 图形、渐变和纹理；
- 不同账号或角色所看到的菜单、数据范围和操作能力；
- 构建检查、真实浏览器交互检查、截图对照和差异记录。

## 2. 参考文件锁定

| 端口 | 参考文件 | 大小 | 行数 | SHA-256 |
| --- | --- | ---: | ---: | --- |
| 医生端 | [doctor-portal.html](../../../frontend/public/reference/doctor-portal.html) | 291,508 bytes | 4,347 | `7405750c10c613ebe6c1b995c74da9f7b82157ae9e3c6ed59390f4c2a5a59bf2` |
| 客服端 | [cs-portal.html](../../../frontend/public/reference/cs-portal.html) | 264,054 bytes | 3,547 | `035c43e735fe73badbcc0612e176c4a974057c2d1418470b0c72ac089a7f304d` |
| 生产端 | [factory-portal.html](../../../frontend/public/reference/factory-portal.html) | 297,915 bytes | 4,103 | `0f1544c41764bce5cb5017fc6c816b540c389dbe825ea76dd7285cfa5676c27e` |

开始复刻前执行：

```bash
shasum -a 256 \
  frontend/public/reference/doctor-portal.html \
  frontend/public/reference/cs-portal.html \
  frontend/public/reference/factory-portal.html
```

不要用临时部署地址代替本地文件作为视觉标准。首轮研究曾把三个文件原样部署到临时 HTTPS 地址，以便在真实 Chrome 中打开；部署内容与本地哈希一致，但临时站点可能失效或被清理。

## 3. 研究方法与证据等级

本轮不是只读 HTML 得出的结论，已使用真实 Chrome 完成登录、切页、抽屉和角色切换等代表性路径，并同时使用源文件核对完整结构。

证据按以下优先级使用：

1. 本地参考 HTML 与锁定哈希；
2. 同一尺寸下真实 Chrome 的可见结果和计算样式；
3. 已保存的参考截图；
4. 源文件中的 DOM、CSS、脚本、事件和响应式规则；
5. 现有产品实现截图只用于说明业务数据差异，不反向覆盖参考视觉。

真实 Chrome 已走过的路径：

- 医生端：登录页 → Demo Accounts → Dr. James Chen → Dashboard → My Cases → 打开 `PDL-0476` 订单详情抽屉；
- 客服端：Wang Fang Manager → Dashboard → Order Details → 打开 `PDL-0476` 详情抽屉；
- 生产端：Wang Li Manager → Dashboard → Kanban Board → Staff & Workload → 切换 Chen Wei CAD Lead → 切换 Liu Hao Employee；
- 三个页面浏览器控制台均未发现 warning 或 error。

本轮尚未完成的证据：

- 没有逐一点击约 150 个内联 `onclick` 状态；
- 没有穷举全部 hover、focus、disabled、empty、loading 和 error 状态；
- 没有完成 768px 与 390px 的整站响应式截图巡检；
- 客服端尚未把完整参考截图集持久化到仓库；
- 三端通过 `localStorage` 进行的跨页同步只确认了机制，未穷举所有业务组合。

因此，本页是后续实施的高可信基线，但不能代替每个端口实施阶段的按钮级交互矩阵和最终截图验收。

## 4. 三端共同的设计语言

### 4.1 页面骨架

- 左侧固定深色侧栏，带轻微斜线或纹理背景；
- 侧栏包含品牌区、分组菜单、数字徽标、底部账号卡片；
- 顶部为吸顶工具栏，承载页面标题、全局搜索、通知、帮助等入口；
- 内容区使用浅灰蓝背景，白色圆角卡片承载统计、表格、图表和详情；
- 模态框采用半透明遮罩与背景模糊；
- 详情通常使用右侧抽屉，表格行和卡片具有 hover 反馈；
- 状态使用语义色胶囊标签，操作结果使用 Toast；
- 页面切换带轻微向上淡入动画。

### 4.2 共用视觉令牌

| 项目 | 参考值 |
| --- | --- |
| 页面背景 | `#f7f9fc` |
| 正文主色 | `#0f172a` |
| 主字体 | `"Plus Jakarta Sans", sans-serif`，正文基准 `14px` |
| 辅助衬线字体 | `Lora` regular / 600 / italic |
| 卡片背景 | `#ffffff` |
| 卡片边框 | `1.5px solid #e2e8f0` |
| 卡片圆角 | `14px` |

参考 HTML 会请求 Google Fonts。正式实现必须提供可靠的中文系统字体回退，离线或网络受限时不能因远程字体失败导致排版塌陷。

### 4.3 图像、符号与图形资源

三个参考文件都没有 `<img>` 或视频资源。可见图形主要来自：

- 内联 SVG；
- Emoji 和文本符号；
- CSS 渐变、纹理、状态点和装饰图形；
- JavaScript 动态生成的图表、趋势图或牙位图。

| 端口 | 内联 SVG 数量 | 典型内容 |
| --- | ---: | --- |
| 医生端 | 7 | 趋势图、牙位图和业务图形 |
| 客服端 | 8 | 趋势、牙位、资料处理相关图形 |
| 生产端 | 4 | 生产统计、状态和角色相关图形 |

复刻时应提取并复用原有 SVG 形状与比例，保留 Emoji/符号的视觉语义；不要用风格不一致的第三方图标库随意替换。

### 4.4 交互体量

以下数据由源 HTML 固定字符串统计，用于估算后续交互验收工作量：

| 端口 | Button | Input | Select | Textarea | `onclick` | `onchange` | `addEventListener` |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 医生端 | 71 | 55 | 70 | 8 | 150 | 12 | 10 |
| 客服端 | 90 | 61 | 45 | 5 | 154 | 1 | 7 |
| 生产端 | 117 | 22 | 16 | 9 | 153 | 11 | 8 |

这说明三个页面都不是静态效果图。实施时必须覆盖导航、搜索、筛选、Tab、弹窗、抽屉、Toast、语言切换、角色切换、状态更新、分配/审批、消息、模拟预览/下载/3D 查看、打印和图表状态。

### 4.5 数据同步模型

三个参考 HTML 使用以下 `localStorage` 键模拟端口间联动：

- `pdl_orders`
- `pdl_messages`
- `pdl_events`
- `pdl_ping`

页面同时监听 `storage` 事件并按约 2 秒间隔轮询。它们表达的是交互原型中的联动预期，不代表正式系统应继续采用 `localStorage`。产品实现应接真实 API、WebSocket 和权限校验，且不能为了复刻演示效果绕过认证或数据范围。

## 5. 医生端基线

### 5.1 视觉身份

| 项目 | 参考值 |
| --- | --- |
| 侧栏宽度 | `224px` |
| 侧栏背景 | `#0f2554` |
| 顶栏高度 | `58px` |
| 主强调色 | `#2563eb` |
| 激活菜单 | 宽 `204px`、高约 `37px`、圆角 `8px`、左侧内描边 `#60a5fa 3px` |
| 卡片阴影 | `rgba(15,37,84,.06) 0 1px 3px` 与 `rgba(15,37,84,.04) 0 1px 2px` |

### 5.2 页面拓扑

| 分组 | 菜单/页面 |
| --- | --- |
| Main | Dashboard、My Cases、Patients、Billing |
| Account | Settings、Messages |
| 页面标识 | `dashboard`、`cases`、`patients`、`billing`、`settings`、`messages` |

登录页包含 Sign In 和 Demo Accounts，演示角色包括 Doctor、Reception、Admin、Nurse。后续正式医生端只能把这些角色当作界面状态参考，不能保留无需认证的演示切换。

### 5.3 响应式事实

- `<= 960px` 和 `<= 700px` 存在响应式规则；
- 窄屏下侧栏隐藏，详情抽屉转为全宽；
- 消息页面在窄屏下简化布局。

已有证据：

- [医生端复刻报告](../../quality/doctor-portal-pixel-clone/report.md)
- [医生端交互矩阵](../../quality/doctor-portal-pixel-clone/interaction-matrix.md)
- [医生端 1440×900 参考截图](../../quality/doctor-portal-pixel-clone/screenshots/reference/dashboard-baseline-1440x900.png)

## 6. 客服端基线

### 6.1 视觉身份

| 项目 | 参考值 |
| --- | --- |
| 侧栏宽度 | `236px` |
| 侧栏背景 | `#1e1b4b` |
| 顶栏高度 | `56px` |
| 主强调色 | `#7c3aed` |
| 激活菜单 | 宽 `220px`、高约 `33.5px`、圆角 `7px`、左侧内描边 `#a78bfa 3px` |
| 阴影倾向 | 深紫色低透明阴影 |

### 6.2 页面拓扑

| 分组 | 菜单/页面 |
| --- | --- |
| Overview | Dashboard |
| Order Management | Order Details、Data Processing |
| Communication | Comms Centre |
| Account Management | Client Management、Billing & Dispatch |
| System | Settings & Accounts |
| 页面标识 | `dashboard`、`orders`、`datacenter`、`comms`、`clients`、`billing`、`settings` |

演示账号角色包括 Manager、Senior CS、Specialist、Translator。客服端参考文件没有屏幕宽度媒体查询，后续若要求移动端可用，需要在不破坏桌面基线的前提下另行设计，而不能声称参考文件本身已有移动适配。

客服端本轮已在真实 Chrome 中完成核心路径验证，但参考截图集尚未写入仓库。下一次实施客服端时，应把登录、Dashboard、Order Details、订单详情抽屉、Data Processing、Comms Centre、Client Management、Billing & Dispatch、Settings & Accounts 全部补成固定尺寸证据。

## 7. 生产端基线

### 7.1 视觉身份

| 项目 | 参考值 |
| --- | --- |
| 侧栏宽度 | `230px` |
| 侧栏背景 | `#0c2340` |
| 顶栏高度 | `54px`，下方另有青绿色实时同步提示条 |
| 主强调色 | `#0d9488` |
| 卡片阴影 | `rgba(12,35,64,.06) 0 1px 3px` |

### 7.2 角色驱动的菜单拓扑

生产端不是一套固定菜单，而是由角色动态生成：

| 角色 | 主要入口 |
| --- | --- |
| Manager | Dashboard、Production Orders、Kanban、Work Orders、Staff & Workload、Scan / Check-in、Messages、Cloud Data Centre |
| Lead | Dashboard、Department Orders、Kanban、Work Orders、Assign Orders、Department Statistics、Team、Workstation、Messages |
| Staff | Workstation、My Statistics、Messages |

页面标识包括：`dashboard`、`orders`、`kanban`、`workorders`、`staff`、`scan`、`messages`、`datacenter`、`workstation`。

真实 Chrome 已确认：经理看到跨部门管理入口，主管只看到部门范围入口，普通员工聚焦个人工作站与个人统计。后续复刻必须同时实现菜单差异、数据范围差异和操作权限差异，不能只隐藏菜单。

### 7.3 响应式事实

生产端参考文件没有针对屏幕宽度的响应式媒体查询，仅有打印样式。因此桌面像素级复刻和额外的移动端可用性应作为两个验收层级分别处理。

已有证据：

- [生产端参考页面验收索引](../../quality/production-reference-pages/README.md)
- [生产端 1440 参考截图](../../quality/production-reference-pages/factory-portal-reference-1440.png)
- [生产端参考与真实数据差异](../../quality/production-reference-pages/production-operations-collaboration-differences.md)

## 8. 管理端可复用的已确认决策

三个端口的视觉语言可以作为管理端外壳与组件设计的参照，但管理端业务信息架构按以下用户确认结果执行。

### 8.1 左侧菜单

| 分组 | 一级入口 |
| --- | --- |
| 业务协同 | 工作台、订单管理、沟通中心、客户管理、账单配送、外协管理 |
| 生产运营 | 工艺生产、质量管理、人员管理、绩效统计、设备管理、物料管理、安环管理、成本管控 |
| 系统治理 | 产品配置、审计通知、AI 治理 |

设备管理、物料管理、安环管理和成本管控暂时保留为独立入口，不在本轮重新拆分或改名。外协管理必须是独立路由和独立页面，不能与成本管控共用页面。

### 8.2 页面内部合并

| 一级入口 | 内部页签/能力 |
| --- | --- |
| 订单管理 | 订单列表、文件资料 |
| 沟通中心 | 消息处理、沟通管理 |
| 人员管理 | 单页人员名单；左侧组织筛选；账号、组织归属与职责权限合并在人员抽屉；部门与岗位使用页内弹窗或抽屉 |
| 工艺生产 | 工序进度、员工派工；固定 9 条工艺链通过只读抽屉查看 |
| 产品配置 | 动态表单、返工字典 |

固定 9 条工艺链不提供新增、删除、编辑或拖拽排序入口。医生/诊所账号归入客户管理，不混入内部人员管理。

人员管理旧版“四张指标卡 + 用户管理/角色权限/组织岗位三页签 + 常驻权限关系带”已于 2026-07-16 废止。用户同日确认 V2 稿，见 `docs/design/admin-portal/reference/personnel-management-v2-concept.html` 和 `personnel-management-v2-1440x900.png`；后续必须按 V2 实施，不得恢复旧稿结构。

### 8.3 权限分配规则

- Admin 可分配 Manager、Supervisor、Staff；
- Manager 只能在自己管理范围内分配 Supervisor、Staff；
- Supervisor 只能在本部门或本班组分配 Staff；
- Staff 没有授权能力；
- 任何人都不能授予同级或更高级角色、自己不拥有的权限，或超出自身组织/数据范围的权限；
- 权限规则必须由后端强制执行，所有授权和变更进入审计记录；
- 管理端使用真实认证，不保留参考 HTML 中面向演示的角色切换入口。

### 8.4 管理端视觉边界

- 以管理蓝为主身份色，吸收三端的统一骨架和组件语言，不直接复制任一端的角色色；
- 管理端界面只显示中文；
- 工作台内容暂不修改，但全局侧栏、顶栏和页面外壳可以统一；
- 桌面基准为 `1440×900`，`1280px` 保持可用，移动端当前只要求不崩坏；用户对具体端口另有尺寸要求时，以当次确认范围为准。

## 9. 下一次像素级复刻的固定流程

### 9.1 开始前

1. 核对三个源文件哈希；变化即建立新版基线。
2. 每个端口使用独立 `git worktree` 和功能分支，避免三个端口互相污染。
3. 只把参考 HTML 放到经用户授权的本地或临时 HTTPS 浏览环境中。
4. 在同一个受控 Chrome 标签页中逐个端口取证，不用多个窗口并行截图。
5. 每次截图前同时记录 `window.innerWidth`、`window.innerHeight` 和最终图片像素尺寸。

### 9.2 编码前规格

每个端口先形成至少四份内容：

- 页面/路由/角色拓扑；
- 视觉令牌与关键组件计算样式；
- 资源清单，包括 SVG、Emoji、CSS 图形和动态绘图；
- 按钮级交互与状态矩阵，包括默认、hover、focus、active、disabled、loading、empty、error。

### 9.3 实施与验收

1. 先复刻全局外壳，再复刻通用组件，最后逐页接业务数据。
2. 区分参考 HTML 中的演示模拟和正式产品能力；正式实现接真实 API 与权限。
3. 运行 lint、typecheck、build 和相关测试。
4. 用真实浏览器逐页点击、悬停、输入、筛选、滚动和切换角色。
5. 按固定视口保存参考图、实现图和必要的差异图。
6. 验收默认至少覆盖桌面基准；若当次要求响应式，再补 `768px` 与 `390px`。
7. 最终报告列出已一致项、允许的真实业务差异、未完成项和风险。

不能仅凭“读过 HTML”“构建通过”或“首页看起来相似”宣称像素级复刻完成。

## 10. 截图尺寸注意事项

首轮真实浏览器研究中发现：Chrome 设置为 `1440×900` 时，受固定滚动条和浏览器截图实现影响，医生端实际截图曾得到 `1435×897`；同时使用多个窗口还会出现其他标签保留 `1720×1000` 的尺寸漂移。

后续必须采用以下规则：

- 在同一 Chrome 标签页顺序完成各端取证；
- 每次切页、登录或角色切换后重新检查视口；
- 文件名同时体现目标视口，报告中记录实际图片尺寸；
- 尺寸不一致的截图不得标记为同一基准组；
- 自动差异图必须使用完全相同的实际像素尺寸。

## 11. 完成定义

单个端口只有同时满足以下条件，才能标记“像素级复刻完成”：

- 已核对参考文件版本与哈希；
- 所有目标页面与角色状态均有映射；
- 主要视觉尺寸、字体、颜色、间距、边框、阴影和图形资源已对齐；
- 交互矩阵中的关键路径在真实浏览器通过；
- 构建与相关静态检查通过；
- 固定视口的参考图和实现图已完成对照；
- 允许差异与未覆盖项已显式记录；
- 没有通过绕过认证、权限、数据范围或文件访问校验来模拟结果。
