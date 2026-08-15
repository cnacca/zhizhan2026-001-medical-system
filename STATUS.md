# STATUS

> **本文件是追加式日志（600+ 行）。** 最新状态在下方「当前状态」章节的**第一条**；
> 再往下的 `9D.xx` 段落全部是一期历史执行明细，不代表当前状态。
> 新会话请先读 **`docs/INDEX.md`**，交付缺口看 **`docs/DELIVERY-GAP.md`**。

## 项目目标

在保留一期已验证业务基础的前提下，按二期 M2 / M3 / M6 完成技术底座、完整业务闭环和上线交付；一期 Task 8 与二期里程碑分别验收。

## 当前状态

- 2026-08-15 D-190 医生端产品优先下单修复已通过 PR #14 合并 `dev`、PR #15 合并 `main`，正式发布版本为 `4c414779fc86e12e5854c721cc8e84cc4a76ddd2`。GitHub Actions `Deploy production` 运行 #31872065473 完成发布门禁、不可变镜像构建、发布包校验、服务器上传、部署前数据库备份、前后端容器更新及首页/后端健康检查，结果为 `success`。正式域名真实浏览器已确认新文案生效，未选患者时可暂选“打印氧化锆冠”，已选清单明确显示尚未保存且点击下一步后才创建产品订单，再次点击可取消；控制台无错误/警告，全程未点击下一步、未创建验收订单。该结果只代表本次局部修复已部署，不改变一期 Task 8 `NOT_READY`。

- 2026-08-15 已按 D-190 修复医生端新建订单的产品选择顺序：未选患者时可先选择一个或多个具体产品，选择仅暂存在前端；再次点击可取消，随后选择患者不会丢失待选结果。点击下一步且患者、产品、到货日期及条件必填运输信息齐全后，才创建病例订单组并逐项写入产品子订单；中途失败保留已成功草稿与未完成待选项供安全重试。AI 推荐采用入口复用同一暂选规则。新增 `check:doctor-order-product-first`，前端生产构建和差异检查通过；本地真实浏览器验证未选患者可暂选、取消、选择患者后仍保留，控制台无错误/警告，且未点击下一步、未创建验收订单。正式网站尚未部署，Task 8 保持 `NOT_READY`。

- 2026-08-15 已按 D-189 完成客服工作台卡片导航：8 张指标卡、信息评审双入口、需要关注事项、发货/账单面板标题、空状态和具体订单均可点击；目标页会应用对应筛选，具体事项会打开同一订单详情，定位上下文使用后立即清除。新增客服“投诉/返工”只读跟进页，复用 `/quality-records` 展示客户外返、原因、责任与状态，不新增写操作。同步修正“待回复”误用通知未读数、订单总量误用本月统计以及发货待办混入物流异常的旧口径。`check:customer-dashboard-attention` 已校准，新增 `check:cs-dashboard-navigation`；质量记录、物流异常专项检查、前端生产构建和差异检查通过。真实浏览器确认资料待审、待回复、发货空状态、具体账单抽屉、投诉/返工待跟进及定位不残留，控制台无新增错误。未修改业务数据、未部署正式网站，Task 8 保持 `NOT_READY`。

- 2026-08-14 按 D-188 增加正式站临时演示账号预填：四端入口仅在 `VITE_TEMP_DEMO_LOGIN_PREFILL_ENABLED=true` 的构建中带入 `change-me-*` 演示账号，生产自动部署由仓库变量 `TEMP_DEMO_LOGIN_PREFILL_ENABLED` 控制；正式账号启用时必须关闭变量、轮换或停用演示账号并重新部署。该模式公开演示凭据，只允许演示验收，不得录入真实业务数据；Task 8 保持 `NOT_READY`。

- 2026-08-14 已按 D-187 完成内部订单业务可读标识并校准患者姓名范围：客服、生产与管理端高频队列不再把随机系统订单号作为第一识别信息，统一优先显示“客户 · 患者 · 牙位”；客服与管理端显示完整患者姓名，生产端普通人员显示脱敏姓名。页面同时补充产品、材料、色号、交期、客户单号（已有病例号／委托单号时）和系统尾号；完整 `order_no` 继续保留在辅助行／详情中作为唯一追踪号。前端本地搜索及后端 `/orders?keyword=` 已扩展到患者、病例号、牙位、材料、色号、产品、客户和系统号。本次复用订单快照，不新增字段、不改历史数据或权限。前端生产构建、订单标识／客服初审／客户特殊要求静态检查、acceptance 和开发库接口搜索通过；真实浏览器确认客服信息审核、管理订单列表及色号搜索生效，生产端在当前普通技工 `SELF` 范围下队列为空，仅确认新表头与空态。新增后端目标测试已编译，但当前测试库因既有 V73 Flyway 校验和不一致而在启动阶段阻塞，未擅自 repair。未部署正式网站，Task 8 保持 `NOT_READY`。

- 2026-08-14 已按 D-186 完成客户特殊生产要求自动带入客服初审：客户档案在原有制作偏好上补“咬合”大类，并统一按邻接、咬合、颜色、材料、边缘、形态和其他要求维护；客服选择待初审订单后会按 `clinic_id` 自动读取并生成纯业务生产信息，同时显示来源分类。通过初审后最终文本写入 `orders.production_note` 形成订单快照，档案后续修改不改变历史订单。AI-5 重新整理已禁止把模板版本、数据库字段、知识上下文或审计说明写进生产文本；待初审订单如仍保存 9D.98 旧技术模板，会在页面端识别为遗留草稿并根据当前客户档案重新生成，不覆盖真正的人工生产备注。全新隔离库迁移至 V85，AI 目标测试 26 项及客户偏好/快照专项 4 项通过，前端生产构建、客户管理/客服初审/专项静态检查、OpenAPI 和 `git diff --check` 通过；本地开发后端已按当前源码重启，启动时将本地开发库从 V84 正常迁移到 V85。浏览器已在订单 `ORD20260729-BA117F4F4C` 上实际点击“根据档案重新整理”，返回内容不再包含 `PHASE_ONE_DEFAULT_V1` 或 `orders.*`，控制台 0 error / 0 warning。本轮未修改正式客户数据、未部署正式网站，Task 8 保持 `NOT_READY`。

- 2026-08-14 已修复客服端订单详情进入“信息审核”时跳到其他订单的问题：根因是工作台待办留下的 `focusOrderId` 在普通导航后仍持续生效，覆盖了订单详情中刚选中的订单。现由订单详情显式传递当前订单 ID，普通导航和退出登录会清理旧聚焦上下文，工作台待办的单次定向跳转仍保留。客服工作台与初审专项检查、前端生产构建和 `git diff --check` 通过；本地真实浏览器已复现“先聚焦订单 A，再从订单 B 进入信息审核”并确认最终仍为订单 B，控制台 0 error / 0 warning。**本条只完成本地代码与回归，尚未合并或部署到正式网站**；Task 8 保持 `NOT_READY`。

- 2026-08-11 GOAL-035 / TASK-036 已完成 8088 部署缺陷的**本地代码与自动化收口**：登录 CORS 改为消费真实 `APP_CORS_ALLOWED_ORIGIN`；软删除文件不再签发新预览/下载 URL；MinIO 拆分容器内部读写地址与浏览器可达签名地址；医生下单向导增加当前步骤必填门禁和统一互斥锁；9D.4 校验已对齐现行权限码模型；BUG-015 固定表格布局/两行备注保持并纳入回归；生产前端不再预填或打包演示密码。独立全新数据库与 MinIO bucket 上后端 336 tests 全绿，前端生产构建及部署专项、9D.4、9D.69、部署环境、9D.78、compose、acceptance 检查通过。**线上 8088 尚未用本批重新部署**，仍需注入浏览器可达的 `MINIO_PUBLIC_ENDPOINT`、开放对应端口/域名、轮换正式账号并按 `docs/deployment/8088-redeployment-checklist-20260811.md` 复测；Task 8 保持 `NOT_READY`。

- 2026-08-04 GOAL-033 / TASK-034 六个批次（A 授权底座、B 细分角色、C 管理端 RBAC、D 账号交接、E 导出管控、F 下单规则后端化）全部完成并推送 `origin/dev`，GOAL-033 已关闭。后端 333 项测试在干净测试库上全绿，迁移到 V83，OpenAPI 194 paths / 223 operations。期间修掉两个部署级缺陷：**业务时区未固定**（MySQL 与 JVM 各按 UTC/本地算「今天」，生产环境「今日」指标与交期会错一天，D-183）与**前后端代理前缀漂移**（生产 nginx 只代理 3 个后端前缀而前端用 30 个，管理端 RBAC 控制台在浏览器里一直是坏的，D-184）。当前执行指针转入**部署**：客户服务器为 Windows Server 2016 / Xeon E-2314 4 核 4 线程 / 32GB，经查证必须用 Hyper-V + Ubuntu 24.04 虚机承载现有容器栈。上线方案见 `docs/deployment/go-live-plan-20260804.md`，待客户确认 20 项见 `docs/deployment/customer-confirmation-checklist-20260804.md`，新会话从 `docs/deployment/SESSION-HANDOVER-deployment.md` 开始。Task 8 保持 `NOT_READY`。

- 2026-08-01 已按 D-182 接通医生端隐形正畸下单：V76 从当前 ACTIVE 目录复制新不可变版本，新增正式产品 `CLEAR_ALIGNER_BRACELESS / 无托槽隐形矫治器`，原“隐形正畸 A 型”继续停用且历史数据不改写。医生端现可选择全颌／上颌／下颌、常规／联合矫治，上传正畸资料并进入既有七步处方；联合矫治只能关联同一病例中的其他产品，处方未提交时病例订单仍被后端门禁阻止。前端正式构建、隔离库 V75→V76 迁移、产品目录/正畸流程 13 项测试及医生真实浏览器“选产品→牙颌/方式→七步处方”路径通过；当前 `15173 / 18080` 演示环境也已升级至 V76，只读浏览器复验显示“隐形正畸 · 1 项产品 / 无托槽隐形矫治器”。价格和最终文件必传规则仍待业务维护，Task 8 保持 `NOT_READY`。

- 2026-08-01 已按 D-181 在“下单内容设置／产品内容”补充分类维护表：编辑版本中的分类可直接改名、停用或恢复；没有产品的新增分类可确认后删除，仍有产品时页面显示引用数量并阻止误删。分类预览同时补齐 `config_version_id / lock_version`，修复分类保存请求缺少乐观锁版本而返回 400 的问题。产品目录后端测试 8 项、前端正式构建及隔离环境真实浏览器“新增分类→改名→删除”路径均通过；已发布目录、历史订单和正式数据未改动。

- 2026-08-01 已按 D-180 优化管理端配置操作与文案：已发布的“下单内容设置”现在提供“一键开始编辑”，点击后自动复制当前内容并进入可编辑状态；分类、产品和材料的内部编号自动生成，版本状态与生产类型改为中文展示。另修复复制后仍保留旧版本内部选中值导致分类框空白的问题，新版本会重新匹配有效分类、产品、材料和配件；编辑状态下新增按钮保持可点击，缺少内容时明确提示必填项。工序工时页的长技术提示已改为业务说明，页面不再暴露运行开关、接口状态码、服务端校验、内部工序代码、快照、DAG 或 JSON Schema 等后端文字。隔离环境真实浏览器已通过“已发布版本→开始编辑→必填提示→新增/修改/删除产品→新增/修改材料→绑定→工时页文案/视觉”路径，正式数据和历史订单未改动。

- 2026-08-01 已按 D-179 修正“下单内容设置”默认版本：页面不再优先打开包含 `BROWSER_ACCEPTANCE_` 验收假产品的旧草稿，而是默认读取 `ACTIVE` 当前发布目录；当前 `15173 / 18080` 演示环境只读复验显示 `V20260731 · 客户产品目录首版 · ACTIVE`、95 个产品，并确认页面未显示验收假产品。写入型目录 smoke 新增隔离门禁，必须显式声明 `ADMIN_CONFIG_ALLOW_WRITES=isolated`，且禁止对共享端口运行。本次未删除历史草稿、未改发布目录或历史订单；正式资料仍待团队持续确认，Task 8 保持 `NOT_READY`。

- 2026-08-01 已按 D-178 在管理端开放“下单内容设置”：复用既有版本化产品目录底座，按“产品内容 / 材料维护 / 适用绑定 / 更多配置”分区；草稿中可新增、修改、停用或安全删除未引用产品与材料，并维护产品－材料绑定，历史订单继续读取提交时快照。产品预览接口补齐 `config_version_id / lock_version`，使前端乐观锁修改真实可用。该页与“工序工时设置”统一为管理端蓝色紧凑视觉，控件高 34px、卡片标题 13px、表格紧凑且 1440px 无页面横向溢出。V75 全新库迁移、产品/工时目标测试 23 项、前端正式构建、OpenAPI、产品 V2 检查和真实浏览器“新增产品→修改→安全删除→新增/修改材料→绑定→切换工时页视觉”均通过；正式业务数据仍需团队逐步维护，Task 8 保持 `NOT_READY`。

- 2026-08-01 已按用户重新提供的《生产流程》恢复管理端“工序工时设置”草稿入口：现有九条固定工序链结构不变，V74 将菜单恢复为 ACTIVE，并在没有可编辑版本时建立全节点空值草稿；管理员可逐项填写标准分钟、批量保存或导入 CSV，空值继续表示“待设置”。前端会读取正式标准工时开关并明确提示当前仅保存草稿；`WORKFLOW_STANDARD_TIME_FORMAL_ENABLED` 仍默认关闭，未确认分钟不能发布，也不进入新工序实例、交期/超时、产能或绩效计算。17/19 分钟验收版本保持 INACTIVE。全新隔离库已从 V1 完整迁移到 V74，`WorkflowRuntimeTests` 16 项、前端正式构建、OpenAPI 校验、产品 V2 检查和真实浏览器“登录→打开菜单→填写 23 分钟草稿→保存→刷新回读→发布禁用”均通过；Task 8 保持 `NOT_READY`。

- 2026-07-31 GOAL-031 / TASK-032 最终校验增量（覆盖下一条中的 V60～V72 / 252 项阶段口径）：动态表单 V2 除运行期类型/选项/边界校验外，现已在 FORM_SCHEMA 创建、编辑和发布前拒绝未知类型、重复 key、非法 options/visible_when 与错误边界，直接注入的遗留坏规则也不能发布为 ACTIVE；后端全套更新为 253 项零失败，OpenAPI 仍为 159 paths / 183 operations，前端正式构建及阶段专项检查通过。并发新增的 V73 已兼容核验：只发布客户资料中可确认的产品名称与工作流映射，价格保持 `PENDING_QUOTE`、隐形 A 型保持 INACTIVE，不补造材料/配件、交期、文件或工时数据。尚待客户/PM 确认并发布正式材料/配件绑定、价格、交期、文件规则与标准工时，并形成正式验收证据；D-176、标准工时菜单隐藏和 Task 8 `NOT_READY` 边界不变。

- 2026-07-31 GOAL-031 / TASK-032 最新收口（覆盖下方同日阶段记录）：V60～V72 已完成本阶段增量迁移与 D-176 停用门禁；产品配置中心真实浏览器已完成材料新增、绑定两个产品、发布、医生新草稿适用范围、停用后不可选、历史订单快照不变和非法删除 409 审计；同一新订单 `ORD20260731-9A5DE848E7` 已逐节点完成生产、客服基台/账单门禁、终检、验收 PDF 账单、验收收款、物流发货和医生确认收货，页面最终回读“已完成”。固定类新增病例组 `CASE20260731-9D821AA4A9` / 子订单 `ORD20260731-6622BC4A2A`，已由医生提交、客服初审和授权生产角色审核，系统按 `REGULAR_CROWN` 创建独立常规冠工序实例并进入设计；结合既有种植、活动证据，三类本地真实浏览器路径已覆盖。收口审计另修复动态表单多选/object 渲染、草稿类型/选项/边界校验、条件必填、AI V2 `form_values` 缺失检查和病例订单组写权限误用读取权限等缺口；所有写接口现统一要求 `order:write-doctor`，严格回归确认只有读取权限的医生写入返回 403。账单、收款、测试备注和 17/19 分钟均为本地浏览器验收数据，不代表客户正式财务、工艺或工时业务。客户尚未提供正式标准工时；按 D-176，管理端隐藏“标准工时”菜单，V72 将未确认 ACTIVE 验收版本非破坏转为 INACTIVE 并留审计，`WORKFLOW_STANDARD_TIME_FORMAL_ENABLED` 默认关闭；正式数据到位前禁止发布，新实例不快照标准分钟，不生成标准截止/超时，也不计算标准工时覆盖、准时率、效率或绩效分，接口返回 `STANDARD_TIME_PENDING`。后端/数据库维护底座保留，不开放工序链结构编辑；此菜单隐藏按用户要求不做专项自动化或浏览器验收。后端全套 252 项、前端 typecheck/正式构建、OpenAPI 159 paths / 183 operations、产品 V2、RepoFrame、M2 兼容、设计协同、9D.4 和主链检查已通过。客户正式产品/材料/价格/交期/文件/标准工时与各产品正式证据仍待补，Task 8 保持 `NOT_READY`。

- 2026-07-31 GOAL-031 / TASK-032 的 A～G 本地实现与自动化已完成，H 已完成当前可用配置下的核心真实浏览器闭环：按 D-174 采用“病例订单组 + 产品子订单”，V60～V69 已增量落地病例订单组、产品配置中心、目录/动态表单/计价/文件快照、版本化标准工时、医生多产品向导、隐形正畸追加式方案/批次和 D-173 权限审计；不开放工序链节点/DAG 结构编辑。后端全套 250 项、前端 typecheck/正式构建、OpenAPI 158 paths / 182 operations、产品 V2、RepoFrame、设计协同、9D.4、客服协同、医生端和主链检查均通过。现有 `15173/18080` 标准演示环境真实创建病例组 `CASE20260731-6CE2B613B8`，种植、活动和正畸三个子订单 `ORD20260731-9A5DE848E7` / `ORD20260731-C81900416F` / `ORD20260731-D34A24B95F` 已完成医生提交、客服逐单初审和授权生产审核；普通产品完成设计内审/医生确认、派工、入检、工时、出检失败返工、重新生产、出检通过和返工关闭，既有完成单 `ORD20260730-FB367E5A0C` 衔接终检报告/账单物流尾段，医生端以 `ORD20260708-1006` 真实确认收货并回读“已完成”。正畸完成七步处方、V1 医生驳回、V2 追加上传/内审/确认和首批 1～6 步生产批次，V1 历史保留。标准工时验收版本从 17 分钟升级为 19 分钟后，旧实例订单 #221 保持 17、新实例订单 `ORD20260731-7B1FB1CB5A` 使用 19；这些值均明确为浏览器验收配置，不冒充客户正式工时。复验中修复医生端物流真实装配/确认收货接口以及 952px 生产端导航消失问题，窄屏下已实际切换到“质量与返工 / 内返管理”。尚未完成的是客户正式固定/种植/活动全量目录值、材料停用/非法删除 409 的完整浏览器矩阵及同一新订单逐节点跑完整条九链；正式价格、材料、交期、格式和标准工时仍待业务数据，Task 8 保持 `NOT_READY`。

- 2026-07-30 已在现有 `15173/18080` 演示环境完成非隔离真实浏览器复验，不新建数据库或测试环境：生产端“生产审核”8 单队列长备注保持 314px 列宽、34px 两行摘要，整页无横向溢出，审核抽屉正常；管理端“生产审核监控”显示同一 8 单队列，并提供通过 / 驳回兜底动作；生产人员当前订单 `ORD20260730-F5F0DC4BCD` 在“我的任务”显示节点 278 待入检，点击“去扫码入检”可准确定位入检表单，不再出现“无可执行工序”死路；客服信息审核逐项点击结果为未进入 37、待初审 3、已初审 32、已退回 0，合计 72。真实发送并审核消息 `#13 / #14` 后，正常“问单沟通”队列由待审核 1 回到 0。复验中另发现并修复两项前端问题：审核后已清空选中会话却残留消息正文的异步竞态，以及“我的任务 / 扫码登记 / 工时 / 终检”混入下单、客服初审和账单历史节点；同时将扫码与管理消息审核的 Element Plus 单选按钮迁移到 `value` API。9D.5 / 9D.6 / 9D.58 / 9D.62 检查、前端正式构建和再次真实浏览器复验通过，最终控制台 0 error / 0 warning。除两条带“验收测试”标记且已审核通过的消息外，本轮未提交生产审核、入检、派工或工序完成动作；Task 8 保持 `NOT_READY`。

- 2026-07-30 已按正式复核修复 BUG-016 / BUG-017 / BUG-018，并复核 BUG-015：V59 对仍处于活动态且被历史 `ORDER_INTAKE / REVIEW` 快照根节点阻塞的实例做保留审计式修复，将错误根节点标记为系统跳过、补齐并关联设计门禁，再恢复合法生产根节点的前置关系，不删除历史工序；客服正常“问单沟通”菜单已可处理生产待审消息；“信息审核/翻译”改为“未进入 / 待初审 / 已初审 / 已退回”四个互斥分类，全部数量可严格对账；生产审核长备注继续使用已完成的固定列宽与两行摘要实现。31 项目标后端测试、9D.4 / 9D.58 / 9D.62 / 客服初审 / OpenAPI / 二期设计协同检查、前端正式构建和完整隔离主链浏览器 smoke 均通过；隔离订单 `ORD20260730-FB367E5A0C` 已验证设计门禁、22 道生产节点、返工、终检、账单物流、收货和客服正常菜单消息审核。当前 `15173` 页面只读复验显示信息审核 `72 = 37 + 3 + 32 + 0`、问单沟通“待审核 0”，控制台无 error / warn；演示后端已重启并确认 Flyway V59 成功，前后端均就绪。原录屏订单 `ORD20260729-83592A54F9` 不在当前演示库，其所在环境启动新版后端时会自动执行同一迁移；Task 8 继续保持 `NOT_READY`。

- 2026-07-30 已补齐生产端“生产审核”页面的独立视觉实现：修复审核页复用管理端结构但未命中 `.portal-admin` 样式作用域，导致筛选控件退化、客户 / 产品 / 状态列压成竖排和超长生产备注撑高整行的问题。生产端现按自身青绿色视觉规范展示筛选卡、队列标签、固定列宽表格、两行备注摘要和审核按钮；9D.4 静态检查增加生产端样式契约，主链浏览器 smoke 增加列宽、备注截断、控件高度、按钮外观和页面溢出断言，并真实验证已派工节点重复派工 409、无理由转派 400、带理由转派后恢复原执行人。1280×720 真实浏览器复验中页面无横向溢出，列宽为 190 / 150 / 130 / 140 / 314 / 76px，备注高度 34px，审核抽屉可正常展开；隔离演示订单 `ORD20260730-F2864FE2F7` 已完成当前主链数据与全部页面入口 smoke，1 项测试通过。该演示数据变更仅发生在隔离环境，Task 8 继续保持 `NOT_READY`。

- 2026-07-30 已按 PRD / 二期确认基线完成生产审核与主流程口径纠偏，本条覆盖 2026-07-29 的临时录屏口径：具有 `workflow:review-production` 直接权限的生产人员主责生产审核，ADMIN 使用“生产审核监控”查看同一队列并异常兜底，普通 WORKER 与 CS 均不可见、不可调用；审核通过后先进入设计任务领取、版本上传、授权组长内审和医生确认门禁，再由 ADMIN 派工。普通员工只读取本人已派工节点或本人领取的设计任务，不再共享未分配 READY 生产池；派工只接受启用的 WORKER，已有执行人必须走有理由转派，可选节点仅 ADMIN 可跳过，派工 / 转派均留审计并通知。OpenAPI、操作手册、菜单过滤、权限种子、V56–V58 迁移、acceptance 和主链自动化已同步；两批目标后端测试共 118 项、OpenAPI / 二期专项 / acceptance / RepoFrame 检查、后端编译、前端正式构建均通过。隔离演示订单 `ORD20260730-EC31EC97EA` 已由真实浏览器和 API 完成医生提交、客服初审、生产角色审核、设计闭环、管理员派工、22 道生产节点、返工、终检、账单物流和确认收货；普通技工 `demo_cad` 与 CS 均无生产审核菜单，授权技工和 ADMIN 分别显示“生产审核 / 生产审核监控”。该结果不代表正式上线，一期 Task 8 继续保持 `NOT_READY`。

- 2026-07-29 **历史临时口径（已被 D-173 / V56 取代）**：当日关闭 6 项录屏阻塞缺陷时，生产审核曾临时收敛为 ADMIN 管理职责，客服初审后、管理审核前生产端不再提前看到订单，管理审核创建工序后生产端仍可读取未分配 READY 生产池；医生非草稿提交新增服务端“至少一份已完成 STL”门禁；下单向导增加保存/上传/提交重入保护，三连点只生成一张草稿；医生消息中心装配真实订单消息与患者姓名；管理端沟通中心只按真实待审消息计数并支持患者搜索。全新独立库 `ai_order_platform_bugfix_20260729`、前端 `15177`、后端 `18084` 的真实浏览器主链以订单 `ORD20260729-940F23D973` 验证：生产端审核前 0 单、审核后 1 单，消息待办审核前 1、审核后 0，医生端最终展示已批准消息。后端 59 项目标测试、医生端专项检查、前端正式构建和差异检查通过，14 张截图及证明包位于 `docs/quality/evidence/bugfix-20260729-recording-blockers/`。该结果仅保留为历史证据；当前生产审核规则以 D-173 为准，也不代表正式上线或一期 Task 8 完成，Task 8 保持 `NOT_READY`。

- 2026-07-28 已完成二期需求冻结和 GOAL-026 / TASK-027 的 M2 RuoYi 运行时渐进桥接第一批：D-171 固定无独立优先级、任一授权组长首个有效内审、无主动放弃/自动超时、RuoYi 渐进桥接四项口径；新增 M2/M3/M6 差异矩阵。固定 RuoYi 源码中的 `WebFilterOrderEnum` 已通过独立 `ruoyi-runtime-bridge` 模块进入现有 Maven reactor，现有 Bearer 身份过滤器真实使用其顺序常量；13 项目标测试和 17 模块后端 package 通过。标准本地后端重启后，真实 `/actuator/info` 返回固定提交、`mode=incremental`、`bearerFilterOrder=-99` 和 `replacesExistingAuth=false`；目标环境启动脚本的非零退出码问题同时修复并复跑通过。该结果只关闭 M2-08 第一小段，完整权限、DataScope、审计、管理 UI、M2/M3/M6 和一期 Task 8 均未完成。

- 2026-07-28 已关闭本轮三项紧急缺陷：医生新建订单移除已上传文件时立即同步草稿，服务端将被移除附件标记为 `DELETED` 并记录删除审计，后续复核只保留仍选中的文件；生产端新增最小消息操作权限，沟通页按生产账号合法可见范围加载订单，不再被默认“待客服初审”筛选清空，待生产审核 / 未派工订单仍受 `SELF` 范围约束；管理端生产审核支持订单号、诊所、产品、状态和备注的即时模糊过滤，沟通中心合并真实待审核消息与未完结订单，并恢复左侧待处理状态和多字段搜索。隔离演示环境以订单 `ORD20260728-9A7E186618` 真实完成医生上传 / 删除、客服初审、生产发送消息 `#10`、管理员审核通过；生产消息 GET / POST 与审核接口均返回 200。生产审核搜索由 6 单即时收敛为 1 单，沟通中心显示 46 个待处理订单与 1 条生产待审并可搜索到目标订单。后端 33 项目标测试、医生端 / 管理端专项检查、前端正式构建、差异检查和真实浏览器截图验收通过，证据位于 `docs/quality/evidence/bugfix-20260728-urgent/`，Task 8 保持 `NOT_READY`。

- 2026-07-28 已收口生产端订单列表、看板摘要和 STL 下载：生产备注限制为两行并将有数据订单行统一为 `64px`；看板“待派工”按活动工序实例中的未分配 `READY / PENDING` 节点统计，“生产中”同时识别进行中节点与生产状态，不再把真实队列显示为 0；生产审核员对未派工 `READY` 订单附件新增预览 / 下载只读权限，不允许完成上传，工序派给其他员工后立即恢复 `SELF` 隔离。演示订单 `ORD20260728-D8B5FD2179` 的 STL 下载接口与抽屉点击均不再返回 403；真实页面确认 12 行均为 64px、长备注两行截断，看板显示待生产审核 4 / 待派工 5 / 生产中 3。后端 39 项测试、看板专项检查、前端构建、差异检查和真实浏览器回归通过，Task 8 保持 `NOT_READY`。

- 2026-07-28 已修复生产审核通过后未派工订单在生产端消失的问题：生产审核员在 `SELF` 数据范围下可读取当前存在未派工 `READY` 工序的订单、工序实例和看板卡片；工序一旦派给其他员工，该订单仍按原权限隐藏，不扩大为全部订单。看板订单可见性与工段归类已解耦，无法映射固定工段的订单不再被整单丢弃。演示订单 `ORD20260728-D8B5FD2179` 已在生产订单搜索和 2026-07-28 生产看板 `CAD审核/扫描` 列真实可见；后端 27 项回归、生产看板专项检查、前端正式构建、差异检查和浏览器控制台检查通过，演示后端已重启加载修复，业务数据未改写，Task 8 保持 `NOT_READY`。

- 2026-07-28 已修复 BUG-014（客服初审后生产端待审核订单不可见）：客服初审仍只将订单推进至 `PENDING_PRODUCTION_REVIEW`，不提前生成工序；生产账号新增既有“生产审核”职责，并在保持 `SELF` 数据范围的前提下仅额外可读取待生产审核队列，其他未派工订单不因此暴露。生产看板汇总把尚未创建工序的待审核订单纳入可见订单集合，生产订单抽屉提供“去生产审核”入口，审核通过后继续复用既有工序实例生成与后续流程。`OrderStatusProjectionTests`（含生产审核员订单列表、看板可见和审核权限）15 项、`WorkflowRuntimeTests` 11 项、生产看板专项检查、前端正式构建与差异检查通过。当前 `18080` 演示后端由外部进程托管，未强制接管重启；需按正常发布/重启流程加载 V53 后，以订单 `ORD20260728-2E8F7414FE` 从客服初审节点重新做真实浏览器回归，Task 8 保持 `NOT_READY`。

- 2026-07-28 已纠正管理端账单配送的地区导航：前端恢复“国内业务 / 国外业务”，并增加独立“待归类”数据补全入口；地区筛选先于“账单与收款 / 配送跟踪”二级视图及各自状态筛选执行。页面只识别订单接口真实返回的 `delivery_region=DOMESTIC / INTERNATIONAL`，缺失或未知值统一进入待归类，不按地址、币种或客户名称猜测。本轮仅完成管理端前端三态展示与筛选，订单级配送地区字段的后端维护入口仍待后续实现。

- 2026-07-27 已完成管理端页面逻辑专项验收与第一批修复：员工派工不再只查询 `PROCESS_INSTANCE_CREATED`，同时纳入 `PRODUCING / IN_PRODUCTION`，并按“存在未安排生产节点”过滤；工序快照在裁剪未选分支节点时会跨过被裁剪路径连接前后保留节点，V51 仅补缺失依赖并把被错误提前激活的 `READY` 节点退回 `PENDING`，不改写已开工或已完成历史；V52 按原始《生产流程》把 6 条产品链的“收发出货 / 出货检验”归回印模分支，现有口扫快照保留数据库审计行并系统跳过，接口不再作为口扫工序返回；管理端账单 / 配送和设备 / 物料 / 安环 / 成本筛选改为各自真实后端状态，未维护配送地区前移除无效的国内 / 国外筛选；补齐产品与订单状态中文映射、完成订单异常判断和连续工序序号。`WorkflowRuntimeTests` 11 项、V51 / V52 MySQL 8.4 真实迁移、9D.5 / 9D.50–9D.53 专项检查、前端正式构建与差异检查通过；演示环境已升级到 V52，真实浏览器确认工序进度待派工 5 单与员工派工 5 单一致，目标口扫订单从错误的 23 道 / 含收发出货校准为 22 道 / 不含该印模节点，账单 / 配送和四类生产辅助页筛选均按真实状态生效，Task 8 保持 `NOT_READY`。
- 2026-07-27 已校准管理端“工序进度”的默认队列：不再只截取最新 15 个订单，而是读取当前订单集后逐单识别真实生产工序；默认仅展示“已生成工序”，并按待派工、生产中、已完成排序，尚未生成工序保留为独立筛选项。无工序订单的生产进度和执行人统一显示“未开始”，不再显示容易误解的 `0/0 · 0%` 或“待派工”。9D.5 专项检查、前端正式构建、目标文件差异检查和真实浏览器验收通过；本轮未修改订单、工序或派工数据，Task 8 保持 `NOT_READY`。
- 2026-07-27 已关闭医生端新建订单 P1 阻塞：Doctor Portal V2 的附件上传改为逐文件完成即写回向导状态，保留已完成文件并按文件签名避免重复上传；草稿保存回填真实 `order_id` 并显式传入后续保存 / 提交，提供可见反馈；提交按钮在保存、上传、提交中或缺少 STL / 其他必填资料时真实禁用。隔离演示环境已用 PNG、PDF、STL 完整点击验证上传、返回上一步、再次进入复核、保存草稿和提交，复核页保持“3 个（STL 1）”；订单 `ORD20260727-0384C949A3` 已生成且医生列表可见，后端 3 个附件均为 `COMPLETED`。随后以草稿 `ORD20260727-25A7C1F479`（ID 183）再次复验，最终提交仍为同订单号 / 同 ID，未生成重复订单，STL 状态为 `COMPLETED`。`check:doctor-portal-v2`、前端正式构建、`OrderStatusProjectionTests`、`FileAccessTests` 共 25 项和目标文件 `git diff --check` 通过；该修复只关闭医生下单本地 P1，一期 Task 8 仍为 `NOT_READY`。
- 2026-07-27 已按用户确认将“工序进度”统一收敛为纯生产口径：工序实例接口补充 `node_category`，前端新增统一生产节点筛选与完成率计算，客服下单/信息初审、客服定基台和账单核对等业务节点不再进入生产进度、当前生产工序、生产看板、员工派工或客服只读生产时间线。目标演示订单 `ORD20260726-5FBA9389DD` 由原始全部节点 `0/26` 校准为实际生产节点 `0/23`，仍为 `0%`，因为尚无真实生产节点完成；详情确认 23 道且不再包含三类客服业务节点。专项检查、9D.5 检查、OpenAPI、前端正式构建、`WorkflowRuntimeTests`、差异检查和真实 Chrome 控制台检查通过；演示环境 `15173/18080` 已重启并就绪，订单与工序数据未修改，Task 8 保持 `NOT_READY`。
- 2026-07-27 已调整管理端生产审核队列：默认首先展示“待生产审核”，切换“全部订单”时一次读取当前完整订单集，并将真正可执行审核的订单置顶，其余订单按订单 ID 倒序；非待审核订单操作统一显示“查看”。补齐 `NEEDS_INFO`、`DESIGNING`、`QC` 等状态中文映射，未知技术状态码不再直接暴露英文。9D.4 专项检查、Vite 正式打包、目标文件 `git diff --check` 和真实浏览器验收通过；演示环境全部 30 单中 4 条待生产审核订单完整排在前四位，审核队列计数为待审核 4 / 全部 30，页面控制台无 error / warn。本轮未提交审核或改变订单数据。完整 `npm run build:frontend` 的 `vue-tsc` 阶段被工作区并行修改的 `AdminRemainingPages.vue` 既有类型错误拦截，本轮未越界修改该文件，Task 8 保持 `NOT_READY`。
- 2026-07-27 已将管理端“生产审核”和“员工派工”从常驻左侧订单列表 / 右侧详情改为统一的“全宽订单表格 + 按需右侧抽屉”：筛选、状态和操作列与其他管理页面保持同一密度，生产审核抽屉按“订单资料 → 生产配置 → 审核动作”连续编排，员工派工抽屉按“订单摘要 → 执行人 → 生产工序”编排，并明确支持按实际进度逐工序安排、无需一次派完。9D.4 / 9D.5 专项检查、前端正式构建与目标文件 `git diff --check` 通过；1280px 真实浏览器验证两页表格均占满 1002px 内容区、页面无横向溢出，两个 780px 抽屉贴右展开，订单 `ORD20260726-5FBA9389DD` 的 26 道工序可在抽屉内独立滚动。本轮只查看页面，未执行生产审核或员工派工，订单与工序数据未改变，Task 8 保持 `NOT_READY`。
- 2026-07-27 已补齐管理端“工艺生产”的员工派工入口：将既有 `/workflow/assign` 归入“工艺生产”父菜单，并新增“工序进度 / 员工派工”页内标签，管理员可从现有进度页直接进入真实派工界面。同步校准 9D.5 专项检查到当前页面文案，并增加父菜单映射与页签回归门禁。`npm run check:task9d5`、前端正式构建和目标文件 `git diff --check` 通过；真实浏览器已验证管理员登录、两页签往返、订单 `ORD20260726-5FBA9389DD` 的 26 道工序、员工选择器与“安排员工”入口，控制台无 error / warn。本轮未实际执行派工，不改变订单或工序数据，Task 8 保持 `NOT_READY`。
- 2026-07-27 已修复管理端“设计任务”页面被 CSS Grid 自动排入左侧导航列的问题：设计任务根组件接入现有 `route-panel` 主内容列契约，并在二期设计协作专项检查中增加布局回归门禁。1280×720 真实浏览器复验中，组件由修复前 `x=0 / width=230 / grid-column=auto` 恢复为 `x=254 / width=1002 / grid-column=2`，任务卡片、管理员转派表单和版本记录入口均正常可见，页面 `scrollWidth=clientWidth=1280`、控制台无 error / warn。专项检查、前端正式构建与目标文件 `git diff --check` 均通过；本轮未执行领取、转派或审核等数据动作，Task 8 保持 `NOT_READY`。
- 2026-07-27 已将生产审核配置从技术字段改为业务化操作：工序链按订单产品类型自动匹配并锁定，`BOTH` 以“口扫或印模”中文能力说明展示，双路线订单必须由审核员按真实资料来源二选一，单一路线自动锁定；原“分支参数 JSON”已移除，普通产品显示无需额外参数，种植修复改为“成品基台 / 个性化基台”，贴面修复改为“CAD 切削 / 传统蜡型”，缺少路线或必要业务分支时禁止通过。`check:task9d4`、OpenAPI 校验、前端正式构建、目标文件 `git diff --check` 通过；真实浏览器已验证普通牙冠自动匹配、JSON 隐藏、入口路线门禁，以及种植订单中文基台选项和双条件门禁，控制台无 error / warn，未实际提交审核、未改变订单状态，Task 8 保持 `NOT_READY`。
- 2026-07-27 已补齐管理端生产审核入口：在“生产运营”下新增固定“生产审核”菜单，待生产审核订单的只读详情抽屉新增“去生产审核”快捷按钮，点击后复用既有审核页面并保持当前订单选中；其他状态订单不显示该快捷按钮。同步将审核页入口路线单选项更新为 Element Plus 当前 `value` API。`check:task9d4`、前端正式构建、目标文件 `git diff --check` 和真实浏览器验收通过；已验证固定菜单、订单 `ORD20260726-5FBA9389DD` 快捷跳转、同单定位、审核表单及通过按钮可用，本轮未实际提交审核，不改变订单状态，Task 8 保持 `NOT_READY`。
- 2026-07-27 已按用户确认完成客服初审最小改动闭环：保留客服端现有“信息审核/翻译”页面和订单抽屉，不新增工作台、不删除原页面；原“人工确认”动作调整为“确认并通过客服初审”，提交前强制检查必填资料，外文指示必须先形成并核对翻译稿，成功后写入人工确认生产信息并将订单从 `PENDING_CS_REVIEW` 推进到 `PENDING_PRODUCTION_REVIEW`。队列和处理记录统一显示“待客服初审 / 客服初审已通过 / 客服初审已退回”。浏览器验收订单 `ORD20260713-12539FDACD` 已真实完成流转，待初审计数 `3→2`、已初审 `17→18`，数据库事件为 `CS_APPROVE_ORDER`；验收中另修复历史超长生产备注被写入 255 字符状态原因导致 500 的问题，生产备注继续完整保存，状态历史只记录固定摘要。前端构建、专项检查、acceptance JSON、长备注后端回归和真实浏览器控制台检查通过；本轮不代表生产审核、M2 / M3 / M6 或正式上线完成，Task 8 保持 `NOT_READY`。
- 2026-07-26 已补标准本地 / 隔离演示双环境统一运行入口：`npm run env:open|start|status|stop` 固定管理 `5173/8080` 与 `15173/18080`，使用独立持久终端会话托管，按前端代理健康接口和真实监听端口识别状态，不再只依赖 PID 文件。已停止占用 `15173` 且代理失效的旧 `ai-order-remote-demo-frontend` 容器（容器和数据未删除），当前 `15173` 明确代理到有 24 条订单的 `18080` 演示后端。静态检查、两套健康检查、登录接口和真实 Chrome 管理端登录通过；演示订单管理显示 24 单。完整 `demo:check` 仍有既有 AI 七天趋势证据缺失，本轮不宣称该项关闭，Task 8 保持 `NOT_READY`。
- 2026-07-26 已完成 GOAL-025 / TASK-026 二期设计协作第一批本地开发闭环：在一期订单、文件和 `design_draft` 事实表上增量增加设计任务、个体权限、并发领取、管理员有理由转派、追加式多文件版本、组长内审、医生确认 / 驳回、文件可见性隔离和生产首节点门禁；生产端、管理端与 Doctor Portal V2 已接真实 API。医生上传支持 Multipart 待续传恢复，确认成功后的回读异常会保留提交结果并再次对账。目标后端 8 个测试类共 86 项、OpenAPI 118 paths / 136 operations、专项检查、前端生产构建、项目 acceptance 和差异检查通过；本地真实浏览器覆盖管理端设计任务、普通技工任务池 / 我的任务及权限隔离、医生订单列表 / 详情，控制台无 error / warn。本阶段不代表 M2 / M3 / M6、正式部署、客户确认或四份 PDF 手册完成，一期 Task 8 继续保持 `NOT_READY`。
- 2026-07-24 已完成 GOAL-024 / TASK-025 真实 RuoYi-Vue-Pro 核心源码引入：固定官方 `master-jdk17` 提交 `ec3f7cbf73e88514a70a6b59d365092ee470603d`，引入 dependencies/framework/infra/system/server 默认核心及必要的 `lombok.config` 构建契约，排除商城、ERP、WMS、MES、AI 等无关模块。上游示例配置和完整 seed SQL 因含硬编码示例凭据未进入仓库，改为无凭据环境变量配置和 schema-only DDL；预签名 URL 示例已脱敏。21 个上游核心 Maven 模块在 JDK 21 下 `clean package` 成功，现有后端 16 模块 / 192 测试及前端生产构建通过。本批次只建立隔离源码与构建基础，没有修改 `backend/`、`frontend/` 业务代码，不接管现有运行时，不改变现有业务权限结果；角色权限分配按用户要求暂缓。Task 8 继续保持 `NOT_READY`。
- 2026-07-21 医生端患者管理已按用户提供的 `Patients` 参考图完成本地全栈增强：列表映射患者、诊所、医生、最近产品、建档日期、订单数、治疗状态和疗程，新增患者采用居中双列表单，详情继续使用右抽屉并保留订单历史、历史病例参考和“为患者新建订单”；新增出生日期、电话、邮箱、病史/用药/过敏、标签、治疗状态与疗程日期持久化，以及患者详情 / 更新接口。诊所和负责医生继续由当前医生身份锁定，医生不能跨诊所或跨医生读取、更新患者。前端正式构建、患者后端测试、OpenAPI、医生端静态门禁、`git diff --check` 和 1280×720 真实浏览器列表/弹窗/抽屉/编辑/筛选验收通过，控制台无错误。本轮不代表真实客户患者数据已导入或 AI 历史方案推荐已完成，Task 8 仍保持 `NOT_READY`。
- 2026-07-20 生产端已按 `frontend/public/reference/factory-portal.html` 完成全页面视觉收口，角色菜单、账号权限和后端业务边界保持不变。订单、看板、任务、扫码、质量/内返/外返/终检、员工、绩效、奖惩、设备、物料、成本/外协、安环、沟通、通知和订单文件中心统一采用深色生产侧栏、青绿色操作语义、紧凑业务卡片与真实空态；登记类表单改为右侧操作面板，订单与看板详情统一为结构化右抽屉，沟通中心改为订单列表与会话双栏。`npm run build:frontend`、生产看板两项专项检查、生产端剩余页面 Playwright smoke 和 `git diff --check` 通过；真实浏览器覆盖 1440px 全页面，以及 1280px 有数据订单抽屉与任务卡片，均无页面级横向溢出。演示环境完整检查仍有既有 AI safe refusal evidence 缺失，本轮未扩展 C 类后端能力，Task 8 保持 `NOT_READY`。
- 2026-07-20 客户管理已由基础诊所档案扩展为可操作的本地全栈版本：列表支持客户编码、名称、联系人、电话和业务员查询，完整档案按单页连续编排客户主档、开票、收货地址、主要医生、资质合同、客户专属产品价、四类打印模板、制作偏好、黑名单和操作记录；订单创建/更新保存基础价或客户价快照，黑名单与停用客户由服务端统一阻断下单。视觉继续采用客服端紫色体系、Lora 标题、Plus Jakarta Sans / 中文回退正文、1.5px 边框和参考页业务图形。定向后端 22 项测试、客户管理测试连续两次复跑、OpenAPI、客户管理专项静态门禁、前端正式构建、主工作树真实浏览器桌面 / 1024px 验收均通过；真实医生请求在黑名单状态返回 409，解除后状态恢复，控制台无错误。本轮不代表电子税票、外部打印服务、价格审批或正式客户数据已接入，Task 8 仍保持 `NOT_READY`。
- 2026-07-20 客服端七类详情已按客户视角完成第四轮单页化收口：订单、设计、产品、账单、配送、外协继续使用 `540px` 参考抽屉，客户详情使用 `860px` 弹窗，但全部取消详情内部导航页签并按业务顺序连续展示；订单详情最底部新增参考式消息气泡、回复输入框和发送按钮，复用真实订单消息接口并在发送后刷新记录。Emoji、CSS 时间线、彩色告警、状态卡和 `1.5px` 方框体系继续对齐 `frontend/public/reference/cs-portal.html`；设计审核、人工收款、发货和只读边界仍按真实状态门禁。`npm run build:frontend`、增强后的 `check-cs-portal-pixel-smoke.mjs` 和 `1440×900` 真实浏览器验收通过，客户五类内容同页且详情页签数为 0，订单底部回复空内容禁用；验收只填入并清空草稿，没有发送演示消息。本轮未补自动月结、客户成员/商务条款、地址、外协写入和完整审计后端，因此 Task 8 仍保持 `NOT_READY`。
- 2026-07-20 医生端独立工作树中的非抽屉前端内容已选择性合并到主工作树，登录页与主工作树现有订单 / 患者 / 通知 / 物流抽屉实现均保持不变。合并范围包括 `224px / 58px / 14px` 壳层基线、工作台配送追踪、订单高级筛选、患者状态筛选、账单 KPI 与下载、消息快捷交互、横向诊所设置，以及六类产品目录、32 牙位图和拖放上传的新建订单向导。`check:doctor-portal-v2` 与前端正式构建已通过；医生端脱敏和权限边界未放宽，Task 8 仍保持 `NOT_READY`。
- 2026-07-20 客服端订单抽屉已按 `frontend/public/reference/cs-portal.html` 完成第三轮专项复刻：保留 `540px` 整容器滚动与 `61px` 吸顶头部，取消四页签及其状态逻辑，正文改为“制作时间线 → 订单资料 → 文件与设计稿 → 订单时间线 → 底部沟通回复”的单页连续滚动。制作时间线按真实 `step_order` 全量展示，使用参考文件的 24px 圆点、1px 连线、14px 间距及浅紫/实心紫/灰白/低透明度状态；不使用参考固定 12 步替换项目 24/28 个真实节点。沟通发送、文件授权预览、STL 查看和各区展开能力保持不变。专项验收实测桌面宽 `540px`、连续页高 `3644px`、移动端宽 `390px` 且无横向溢出；前端构建、抽屉专项、客服端 11 页冒烟与 `git diff --check` 通过。Task 8 仍保持 `NOT_READY`。
- 2026-07-19 管理端工作台已在三端视觉收口后完成组合重排：不映射 `06-admin-overview.html`，顶部继承医生 / 客服端的动态问候、日期、数据范围和统计时间；原有 10 项管理指标保留为两行五列；新增的“全局运营待办”只聚合现有客服、生产、返工、配送、物料和成本数据并跳转已有管理入口；本月 / 上月订单、件数、接单金额和出货金额收紧为右侧对比卡，原有运营效率、两张金额趋势图、账单覆盖信息和十大客户排名均保留。`check:admin-dashboard-workbench`、生产工作台回归门禁、`vue-tsc -b`、Vite 正式构建与 `git diff --check` 已通过；本轮按用户要求不代做视觉验收。Task 8 仍保持 `NOT_READY`。
- 2026-07-19 医生端、客服端和生产端工作台已完成首批视觉统一：分别以 `frontend/public/reference/doctor-portal.html#page-dashboard`、`cs-portal.html#page-dashboard`和 `factory-portal.html#page-dashboard` 作为唯一视觉参考，保留现有 Vue 数据、业务文案、权限和交互，未引入 HTML 演示数据或本地状态逻辑。三端分别收拢为 6 / 8 / 6 张高密度指标卡，按参考页重排待办、右侧提醒、月度对比、部门表和趋势区；额外业务内容通过纵向延长保留，不拉伸单卡。`Lora` 与 `Plus Jakarta Sans` 改为本地依赖，Vite 开发态与生产构建均能正常加载。真实浏览器专项验收覆盖 `1440×900` 与 `1280×800`，三端均无页面横向滚动；医生端和客服端工作台无运行时错误，生产端保留了现有通用 `/orders` 请求被生产角色拒绝的 403 权限告警。管理端本轮未改，且不映射 `06-admin-overview.html`；待三端视觉反馈收口后，再按共同设计语言单独处理。Task 8 仍保持 `NOT_READY`。
- 2026-07-18 客服端已按 `frontend/public/reference/cs-portal.html` 完成进入端口后的前端重构、HTML 像素校准与真实浏览器验收；登录和端口选择不在本轮范围，工作台主体保持不变。左侧统一为 11 个业务页面，通知、帮助、全局搜索只保留顶栏入口；在 `1440×900` 下逐页完成筛选、标签、会话快捷填充后清空、详情抽屉、月结真实空态、帮助分类和搜索结果跳转，14 张截图均无横向溢出，`consoleErrors=[]`、`pageErrors=[]`、`blockedMutations=[]`；另有 3 条 Google Fonts 网络中断警告，页面使用基线规定的中文回退字体。验收中修复信息审核/翻译工作区高度、表格工具栏、`540px` 抽屉和本地 Vite WebSocket 代理 403；`npm run check:cs-portal-pixel-smoke`、`npm run build:frontend`、`check:task9d24`、`check:task9d64`、`check:task9d91`、`vue-tsc --noEmit` 与 `git diff --check` 通过。方案、验收记录及逐页证据见 `docs/design/cs-portal/CS_PORTAL_FINAL_SPEC.md`、`docs/design/cs-portal/CS_PORTAL_FRONTEND_ACCEPTANCE_REPORT.md` 和 `docs/design-references/cs-portal/implementation-20260718/`。岗位权限、登记事实、翻译任务模型、自动月结、客户分配、外协写入及跨端越权验收仍未完成，Task 8 保持 `NOT_READY`。
- 2026-07-17 管理端工作台已按用户确认完成局部调整：顶部标题区的高度、字体、字号和颜色与其他管理页面统一，重复的“管理经营驾驶舱”说明区及孤立“查看”按钮已移除，指标区保留 14px 标准间距；“出货份数/异常率”替换为“待发货订单/订单完成率”，“当日效率统计”调整为“本月运营效率”；接单与出货金额由去年同期改为本月截至今日与上月同期的真实日累计对比。隔离演示库补上月接单与出货样本，`SalesDashboardTests`、前端构建、工作台静态门禁和 `demo:check` 通过；真实 Chrome 在 1440×900、1280×800 下从侧边栏往返验收，页面无整体横向滚动、控制台无报错、相关请求均为 200。证据见 `docs/quality/admin-remaining-pages/README.md`。本轮仍是本地实现与验收，Task 8 保持 `NOT_READY`。
- 2026-07-17 管理端 13 个剩余页面已补齐可操作的隔离演示数据和薄弱模块真实后端能力：V44 增加设备审批元数据、安环周期规则与外协批次；设备、物料异常、安环、成本和外协已支持真实列表/详情，管理员可在演示库审批设备、推进物料/安环状态、确认成本，通知支持真实单条/全部已读。`demo:seed` 仅允许 `_demo` 数据库且可幂等恢复操作前状态，`demo:check` 已验证 5 客户、6 员工、15 物流、3 外协、4 设备、4 物料异常、3 安环规则、4 安环任务、5 类成本、4 产品、3 通知和 7 天智能趋势。目标后端测试、前端构建、真实 Chrome 侧栏逐页操作、冻结页回归和控制台检查通过；证据见 `docs/quality/admin-remaining-pages/README.md`。本轮仅为本地全栈实现与隔离演示验收，Task 8 仍保持 `NOT_READY`。
- 2026-07-16 管理端冻结规格已完成实施与真实 Chrome 验收：主工作树中的人员管理已替换为“左侧组织筛选 + 右侧人员名单 + 单一人员/权限抽屉”V2，旧指标卡、三页签、常驻权限关系带和导出入口已移除；部门与岗位只读弹窗、人员筛选、普通员工真实新增/编辑链路均保留，经理/主管因后端未支持持久化继续禁用写操作。前端构建和 `acceptance.json` 校验通过；真实 Chrome 已覆盖 1440×900、1280×800、17 个一级入口、8 个页内标签和 9 条固定只读工艺链，干净重载后未发现应用控制台错误、失败请求或 HTTP 4xx/5xx。工作台仅做回归查看，未修改其业务内容。证据见 `docs/quality/admin-portal-implementation/report.md`；Task 8 仍保持 `NOT_READY`。
- 2026-07-16 管理端前端信息架构与剩余页面已完成第一增量：左侧收敛为业务协同、生产运营、系统治理 3 组共 17 个一级入口，订单、沟通、工艺生产和产品配置使用页内页签承载细分功能。人员管理旧版指标卡和三页签方案已废止，用户已确认“左侧组织筛选 + 右侧人员名单 + 单一人员/权限抽屉”的 V2 参考稿；下一执行窗口按冻结规格替换旧实现。人员层级统一表达“管理员 → 经理 → 主管 → 普通员工”，但当前后端仅支持普通员工账号及部门/岗位的真实保存，经理、主管层级的持久化未启用，前端不伪造保存结果。9 条既定工艺链仅供查看，不提供新增、删除、拖拽或改链；本轮按确认边界不改工作台内容。真实浏览器验收范围锁定为管理员登录、17 个入口逐项点击、8 个页内标签、人员权限和固定工艺链查看交互，以及 1440×900 / 1280×800 视口下的布局、控制台与网络错误检查；未经实际记录不宣称验收通过。Task 8 仍保持 `NOT_READY`。
- 2026-07-15 已完成 GOAL-023 / TASK-024 一期本地剩余项收口：默认运行关闭 bootstrap header/角色兜底，HTTP CORS 和 WebSocket 握手均接受 localhost/127.0.0.1 开发入口，质量统计支持日期范围和日趋势，设计稿双端驳回原因及 V1/V2/V3 回归已补齐；活动产品均有最小动态表单基线。隔离 demo 以 `IMPLANT_RESTORATION` 和真实 STL 跑完 `smoke:task9d62` 的订单完成链路及12步页面入口，完整后端回归 189 项通过。原 PRD 38项重算为 30 `PASS`、1 `PARTIAL`、0 `MISSING`、7 `EXTERNAL_ACCEPTANCE`。仅剩 CP-004 标准工时业务数据及真实环境验收，Task 8 保持 `NOT_READY`。
- 2026-07-15 已完成 GOAL-022 / TASK-023 一期 P0 本地代码收口：workflow definition 读取增加内部权限门禁，`/api/auth/login` 同时允许 localhost/127.0.0.1 Vite 入口；生产审核按订单产品类型自动匹配预定义工序链，设计稿存在时必须由医生确认后才能启动首个生产节点，需出检节点只有 OUT/PASS 后才激活后继并允许实例完成；管理端已可创建、编辑技工账号、选择部门/岗位并使用生产端登录。24 项目标后端测试与前端构建通过。原 PRD 38项重算为 21 `PASS`、8 `PARTIAL`、1 `MISSING`、8 `EXTERNAL_ACCEPTANCE`；无 token 订单读取边界、页面分支验收和真实环境工作仍未关闭，Task 8 保持 `NOT_READY`。
- 2026-07-15 已完成 GOAL-021 / TASK-022 客户 / PM 确认口径校正与验收重算：原 CP-001 到 CP-009 不再整体作为九项书面签字阻塞，当前严格口径为 2 项待产品确认、0 项 PRD 逐功能签字、1 份 AI-5 客户模板输入、1 包标准工时业务数据（提供方待项目方指定）。`docs/acceptance/prd-v2-38-item-acceptance-audit-20260715.md` 将原 PRD 38项重算为 18 `PASS`、8 `PARTIAL`、4 `MISSING`、8 `EXTERNAL_ACCEPTANCE`；2026-07-06 A/B/C 表外范围和两条跨项流程门禁继续独立跟踪。最高风险本地缺口是医生可读取内部 workflow 接口、工序链未自动匹配、员工账号创建闭环缺失、设计确认生产门禁和出检通过后继激活门禁缺失；另有 loopback CORS 目标测试回归。Task 8 仍保持 `NOT_READY`，但原因已从“等待九项签字”改为真实代码、真实环境和最终验收缺口。
- 2026-07-14 已完成 1013 浏览器人工验收反馈的 5 项修复和真实浏览器回归：生产端严格选择 STL 并新增可交互 3D 查看器；完成订单不再显示补资料入口；医生/客服详情补原始附件区；医生留言历史前后端可见性修复；生产端牙位读取 `tooth_position`。用户补充的原 3 个 STL 已上传到隔离演示订单 #7，三角色读取、签名 URL、大小/SHA-256 和 `STLLoader` 解析均通过；真实浏览器逐个打开三个不同模型并完成 Normal Bite 旋转/缩放，医生/客服准确显示三个原始附件，医生/客服均回显脱敏留言，三端控制台 0 错误。回归过程中另修复高分屏 WebGL 画布裁切和异步签名地址弹窗拦截。BUG-005 至 BUG-009 全部关闭；Task 8 仍保持 `NOT_READY`。
- 2026-07-13 客户演示数据环境已落地：新增独立 `ai_order_platform_demo` 数据库、`ai-order-demo-private` bucket、`15173/18080` 演示端口，以及 `demo:start|serve|seed|check|prepare|stop|reset` 入口。造数脚本复用真实 12 步 API 链路并支持按阶段停留，已生成并校验 7 条脱敏场景订单：待客服审核、待生产审核、生产待办、返工处理中、待设计确认、待发货、已完成；重复执行会按 `DEMO_DATA_V1` 场景标识跳过已有订单。验证已通过 `check:demo-data-tooling`、前端构建、7 场景 API 检查和独立演示环境 12 步浏览器 smoke。重置仅允许 `_demo` 数据库与含独立 `demo` 分段的 bucket，并要求显式确认；本轮不清理或改写主展示库、测试库和正式数据。Task 8 仍保持 `NOT_READY`。
- 2026-07-13 客服 / 管理工作台经营金额同比已完成：新增 `GET /dashboards/sales`，按“客服审核通过时间（历史缺失时回退订单创建时间）”统计接单金额、按实际发货时间统计出货金额，统一取人民币账单金额并返回本年累计、去年同期、同比、金额覆盖率和 12 个月趋势；客服账单上传同步补最终应收金额录入，医生端只读展示。接口仅允许 CS / ADMIN，WORKER / DOCTOR 拒绝访问；十大客户排名保持原口径不变。组合后端测试、OpenAPI、前端构建与真实浏览器验收已通过。Task 8 仍保持 `NOT_READY`。
- 2026-07-07 部署 / 运维本地补强已建立阶段级 RepoFrame goal：当前 goal 记录为 `goals/GOAL-020-deployment-ops-local-hardening-20260707.md`，执行批次 task 为 `tasks/TASK-021-deployment-ops-local-hardening-20260707.md`。本批次围绕 `deployment-infrastructure` 和 `operations-manuals` 缺口补 `npm run check:deployment-ops-local-hardening`、`npm run dry-run:phase-one-release-rollback`、`docs/deployment/phase-one-local-ops-dry-run.md` 本地 release / rollback dry-run、备份 / 恢复 dry-run 模板第一段、日志留存 / 监控告警配置模板第一段、compose / env / Nginx / healthcheck 静态检查和 readiness 联动。本批次不启动真实生产环境，不填写真实服务器、HTTPS 证书、数据库密码、MinIO 密钥、DeepSeek key、webhook secret、监控接收人、客户名单或客户隐私数据，不声明真实服务器部署、HTTPS、备份恢复、日志留存、监控告警、发布回滚演练、正式客户培训签收、客户签字或真实环境验收完成。`deployment-infrastructure` 和 `operations-manuals` 仍保持 `PARTIAL`，`customer-pm-confirmations` 仍保持 `BLOCKED`，Task 8 仍保持 `NOT_READY`。
- 2026-07-07 AI 生产治理本地补强已建立阶段级 RepoFrame goal：当前 goal 记录为 `goals/GOAL-019-ai-production-governance-local-hardening-20260707.md`，执行批次 task 为 `tasks/TASK-020-ai-production-governance-local-hardening-20260707.md`。本批次围绕 `ai-production-governance` 缺口补 `npm run check:ai-production-governance-local-hardening`、`GET /ai/governance/local-hardening` 本地只读治理总览、管理端 `/admin/ai-governance` 只读页面、AI-3 安全矩阵回归、OpenAPI 和验收 / readiness 文档回写；覆盖提示词版本、输出安全边界、预算 / 熔断策略、AI-3 安全矩阵、AI-5 默认模板未确认和真实外部联调待完成状态。本批次不接真实 DeepSeek key，不填写真实 webhook，不把 `PHASE_ONE_DEFAULT_V1` 写成客户正式模板，不自动外发或自动写订单，不伪造客户签字或真实环境验收。`ai-production-governance` 仍保持 `PARTIAL`，`customer-pm-confirmations` 仍保持 `BLOCKED`，Task 8 仍保持 `NOT_READY`。
- 2026-07-07 本地 12 步主链路验收增强已建立阶段级 RepoFrame goal：当前 goal 记录为 `goals/GOAL-018-local-main-chain-acceptance-hardening-20260707.md`，执行批次 task 为 `tasks/TASK-019-local-main-chain-acceptance-hardening-20260707.md`。本批次围绕本地 12 步主链路自动化与验收记录补 `npm run check:local-main-chain-acceptance-hardening`，并增强 `smoke:task9d62` 的医生端脱敏、客服端可见性、生产端任务范围和管理端派工 / 转派角色边界断言；同步回写客户可读验收记录、Task 8 matrix、readiness 和 acceptance 指针。本批次只增强本地固定演示数据与验收记录，不做真实客户验收，不填写真实 key、真实 webhook、客户签字、真实支付 / 物流 / 电子签章或真实环境验收。`frontend-business-pages` 和 `prd-v2-local-feature-gaps` 仍保持 `PARTIAL`，`customer-pm-confirmations` 仍保持 `BLOCKED`，Task 8 仍保持 `NOT_READY`。
- 2026-07-07 四端前端产品化体验收口已建立阶段级 RepoFrame goal：当前 goal 记录为 `goals/GOAL-017-frontend-productization-closure-20260707.md`，执行批次 task 为 `tasks/TASK-018-frontend-productization-closure-20260707.md`。本批次围绕 `frontend-business-pages` 缺口补 `npm run check:frontend-productization-closure`、客服设计稿 / 账单入口产品化、生产 C 类本地第一增量入口产品化、管理端账号 / 角色 / 权限清单入口和统一加载态 / 空态 / 错误态 / 权限拒绝态提示；不恢复医生文件独立模块，不扩大设备 / 物料 / 安环 / 成本 / 奖惩为完整一期闭环，不声明真实支付、真实物流、真实电子签章、真实 DeepSeek key、真实 webhook、客户签字或真实环境验收完成。`frontend-business-pages` 仍保持 `PARTIAL`，Task 8 仍保持 `NOT_READY`。
- 2026-07-07 权限 / DataScope 生产化补强 B 已完成阶段级 RepoFrame goal：当前 goal 记录为 `goals/GOAL-016-auth-datascope-production-closure-b-20260707.md`，执行批次 task 为 `tasks/TASK-017-auth-datascope-production-closure-b-20260707.md`。本批次围绕 `auth-datascope-prod` 缺口补 refresh token 轮换目标测试、后端轮换实现、OpenAPI 语义和阶段级机器检查，新增 `npm run check:auth-datascope-prod-closure-b`，并把 active RepoFrame 指针从 GOAL-015 切到 GOAL-016。`/api/auth/refresh` 现在会返回新的 access token 和轮换后的 refresh token，旧 refresh token 立即吊销并拒绝复用。本批次只关闭本地可开发的 refresh token 轮换补强，不声明完整 Spring Security/JWT、完整 RuoYi DataScope、通用 SQL DataScope 拦截器、access token 黑名单、多设备会话策略或真实环境验收完成。`auth-datascope-prod` 仍保持 `PARTIAL`，Task 8 仍保持 `NOT_READY`。
- 2026-07-07 操作手册 / 回滚 / 培训材料本地收口已完成阶段级 RepoFrame goal：当前 goal 记录为 `goals/GOAL-015-operations-rollback-training-closure-20260707.md`，执行批次 task 为 `tasks/TASK-016-operations-rollback-training-closure-20260707.md`。本批次围绕 `operations-manuals` 缺口补阶段级机器检查、发布回滚手册本地模板、四端培训材料 / 签收模板、操作手册和交付材料索引回写，新增 `npm run check:operations-rollback-training-closure`，并把 active RepoFrame 指针从 GOAL-014 切到 GOAL-015。该批次只收拢本地可交付材料，不启动真实生产环境，不填写真实服务器地址、真实密钥、真实签名、真实客户名单或客户隐私数据，不声明真实发布回滚演练、备份恢复演练、监控告警验收、正式客户培训签收或客户 / PM 签字完成。`operations-manuals` 仍保持 `PARTIAL`，Task 8 仍保持 `NOT_READY`。
- 2026-07-07 WebSocket / 通知生产 readiness 收口已完成阶段级 RepoFrame goal：当前 goal 记录为 `goals/GOAL-014-websocket-notification-readiness-closure-20260707.md`，执行批次 task 为 `tasks/TASK-015-websocket-notification-readiness-closure-20260707.md`。本批次围绕 `websocket-notification-prod` 缺口补阶段级机器检查、真实环境通知验收记录模板和 readiness 指针回写，新增 `npm run check:websocket-notification-readiness-closure`，并把 active RepoFrame 指针从 GOAL-013 切到 GOAL-014。该批次只收拢已有 9D.76 本地证据与真实环境待验模板，不启动真实生产环境，不填写真实 webhook、secret、生产主机、证书或客户隐私数据，不声明真实双后端实例 Redis 联调、Nginx HTTPS、生产 webhook、监控告警或客户 / PM 签字完成。`websocket-notification-prod` 仍保持 `PARTIAL`，Task 8 仍保持 `NOT_READY`。
- 2026-07-07 四端业务页面与客户验收 smoke 收口已完成阶段级 RepoFrame goal：当前 goal 记录为 `goals/GOAL-013-frontend-customer-smoke-closure-20260707.md`，执行批次 task 为 `tasks/TASK-014-frontend-customer-smoke-closure-20260707.md`。本批次只把四端业务页面证据、12 步浏览器 smoke、客户可读 PASS/FAIL 验收记录、操作手册和 readiness 边界收拢为一个阶段入口，新增 `npm run check:frontend-customer-smoke-closure`，并把 active RepoFrame 指针从 GOAL-012 切到 GOAL-013。`frontend-business-pages` 仍保持 `PARTIAL`，`customer-pm-confirmations` 仍保持 `BLOCKED`；本轮不伪造客户签字、真实 DeepSeek key、真实 webhook、真实支付 / 物流平台、真实电子签章、HTTPS、备份监控或真实环境验收。Task 8 仍保持 `NOT_READY`。
- 2026-07-07 权限 / DataScope 生产化收口第一段已完成阶段级 RepoFrame goal：当前 goal 记录为 `goals/GOAL-012-auth-datascope-production-closure-20260707.md`，执行批次 task 为 `tasks/TASK-013-auth-datascope-production-closure-20260707.md`。本批次补严格权限模式目标测试、关闭 clinic / doctor account / notification 入口的 roles-only `@RequirePermission` 注解，新增 V36 权限码种子和 `npm run check:auth-datascope-prod-closure`，并把 active RepoFrame 指针从 GOAL-011 切到 GOAL-012。该批次只关闭 `auth-datascope-prod` 的本地生产化第一段，不声明完整 Spring Security/JWT、完整 RuoYi DataScope、通用 SQL DataScope 拦截器、refresh token 轮换、access token 黑名单、多设备会话策略或真实环境验收完成。Task 8 仍保持 `NOT_READY`。
- 2026-07-07 客户 / PM 确认项与真实环境 AI 验收收口已完成阶段级 RepoFrame goal：当前 goal 记录为 `goals/GOAL-011-real-acceptance-confirmation-20260707.md`，执行批次 task 为 `tasks/TASK-012-real-acceptance-confirmation-20260707.md`。本批次只建立确认 / 真实验收闸门和机器检查，新增 `npm run check:real-acceptance-confirmation`，复核 9D.72 客户 / PM 确认项、9D.80 AI 真实 key / 生产 webhook 联调记录模板、9D.81 部署真实环境 smoke / HTTPS / 备份监控验收记录模板，并把 active RepoFrame 指针从 GOAL-010 切到 GOAL-011。该批次不填写真实 DeepSeek key、不填写真实 webhook、不填写真实服务器地址、不把 CP-001 到 CP-009 写成 CONFIRMED、不伪造客户签字或真实环境验收。Task 8 仍保持 `NOT_READY`。
- 2026-07-07 PRD V2 本地功能差异收口 D 已完成阶段级 RepoFrame goal：当前 goal 记录为 `goals/GOAL-010-prd-v2-local-gap-closure-d-20260707.md`，执行批次 task 为 `tasks/TASK-011-prd-v2-local-gap-closure-d-20260707.md`。本批次补 `/dashboards/phase-one-ab` 本地月度趋势 / 客户排名第一段，返回 current-month / previous-month 订单与件数、月度差值、Top 客户、生产异常、待问异常、出货率和完成率；客服 / 管理 / 生产员工按既有 DataScope 读取，医生端拒绝访问；客服 / 生产工作台改为消费该本地聚合，OpenAPI 和 `npm run check:prd-v2-gap-closure-d` 已同步。该批次把当前本地可开发的 PRD V2 月度趋势 / 客户排名缺口收口；真实支付、真实物流、真实 DeepSeek key、真实 webhook、客户最终统计口径、客户签字和真实环境验收仍为外部 / 确认阻塞。Task 8 仍保持 `NOT_READY`。
- 2026-07-07 PRD V2 本地功能差异收口 C 已完成阶段级 RepoFrame goal：当前 goal 记录为 `goals/GOAL-009-prd-v2-local-gap-closure-c-20260707.md`，执行批次 task 为 `tasks/TASK-010-prd-v2-local-gap-closure-c-20260707.md`。本批次在 9D.97 AI-2 引用数据说明基础上补 `/ai/cs-query` 的 `attachment_contexts` 附件预览上下文、客服端 `/ai/cs` 附件预览上下文展示、OpenAPI 契约和 `npm run check:prd-v2-gap-closure-c`；附件预览通过既有文件权限校验生成短时效 URL，只供客服人工复核，不自动发送、不写入订单、不接真实 DeepSeek key、不接真实 webhook、不伪造客户 AI-2 口径、客户签字或真实环境验收。Task 8 仍保持 `NOT_READY`。
- 2026-07-07 PRD V2 本地功能差异收口 B 已完成阶段级 RepoFrame goal：当前 goal 记录为 `goals/GOAL-008-prd-v2-local-gap-closure-b-20260707.md`，执行批次 task 为 `tasks/TASK-009-prd-v2-local-gap-closure-b-20260707.md`。本批次在 9D.87 基础上补 `quality_record` 独立事实表第一段、质量记录状态工作流、生产端质量页状态更新入口、OpenAPI 契约和 `npm run check:prd-v2-gap-closure-b`；保留 `check_record` / `rework_record` 历史事实，不接真实 DeepSeek key、不接真实 webhook、不接真实支付 / 物流平台、不伪造客户最终质量口径、客户签字或真实环境验收。Task 8 仍保持 `NOT_READY`。
- 2026-07-07 PRD V2 本地功能差异收口 A 已完成阶段级 RepoFrame goal：当前 goal 记录为 `goals/GOAL-007-prd-v2-local-gap-closure-a-20260707.md`，执行批次 task 为 `tasks/TASK-008-prd-v2-local-gap-closure-a-20260707.md`。本批次只校准 PRD V2 本地差异队列、acceptance/readiness 指针和机器检查，新增 `npm run check:prd-v2-gap-closure-a`；不改后端业务代码、不改前端业务代码、不新增迁移、不接真实 DeepSeek key、不接真实 webhook、不伪造客户签字或真实环境验收。Task 8 仍保持 `NOT_READY`。
- 2026-07-07 一期收口 workflow 已纳入 RepoFrame：`docs/development/workflow.md` 已建立为当前项目专用执行规则，`docs/development/stage-goal-window-guide.md` 已补每个 Codex 窗口的阶段级 goal 启动模板，明确默认使用阶段级 goal、task 内 checklist、自行推进到整个阶段完成或真实阻塞才停，不恢复 Yuri workflow/SOP，不启用外部 SOP，不按小任务完成后只建议下一步小任务的方式执行；当前记录为 `goals/GOAL-006-phase-one-workflow-doc-20260707.md` / `tasks/TASK-007-phase-one-workflow-doc-20260707.md`，新增 `npm run check:phase-one-workflow` 和 `npm run check:stage-goal-window`。本轮只整理文档和非业务检查，不改业务代码、不提交。Task 8 仍保持 `NOT_READY`。
- 2026-07-07 一期收口技术方案已纳入 RepoFrame：`docs/development/phase-one-closure-technical-plan.md` 已从主目录只读导入 handoff worktree，并通过 `goals/GOAL-005-phase-one-closure-plan-integration-20260707.md` / `tasks/TASK-006-phase-one-closure-plan-integration-20260707.md` 记录为当前伞形计划入口；新增 `npm run check:phase-one-closure-plan`。本轮只整理文档和非业务检查，不改前后端业务代码、不接真实外部服务、不提交。Task 8 仍保持 `NOT_READY`。
- 2026-07-07 9D.100 A/B 类一期范围对齐第二段已完成：客服 / 生产工作台统计从 9D.99 的展示口径推进到复用现有本地接口的数据闭环。前端新增 `loadPhaseOneAbDashboardData`，复用 `/orders?page=1&size=100`、`/messages/pending-review`、`/production/quality/summary`、`/logistics/orders?limit=50`、`/staff/workload?page=1&size=50` 以及设备 / 物料 / 安环 / 成本 / 奖惩汇总 API；新增 `npm run check:task9d100`。本轮不新增后端接口、不新增迁移、不接真实支付 / 物流平台、不伪造真实经营统计或客户签字。Task 8 仍保持 `NOT_READY`。
- 2026-07-07 RepoFrame 文档校准已完成：当前 goal 记录为 `goals/GOAL-003-repoframe-doc-hydration-20260707.md`，完成任务为 `tasks/TASK-004-repoframe-doc-hydration-20260707.md`。本轮只校准 RepoFrame 文档、`acceptance.json` 和非业务检查脚本，明确不写业务代码，未运行 `initialize_repo.py`，未改业务代码，未提交。
- GOAL-001 现在只作为历史初始化证据；GOAL-002 / TASK-003 继续作为 2026-07-06 intake 的 superseded 证据。当前不是重新开始项目，而是已有 handoff worktree 的 RepoFrame `repo-hydrate` 后续校准。
- 2026-07-06 接手工作区已创建：当前开发目录为 `/Users/yuri/Documents/AI智能下单平台-handoff-20260706`，分支为 `codex/continue-phase-one-20260706`，从 `8cacf352` 继续接手现有代码和历史，不重新开始项目。
- 2026-07-06 新需求范围已按用户确认的默认口径冻结，见 `docs/acceptance/phase-one-scope-baseline-20260706.md` 和 `docs/customer-confirmation/AI智能下单平台_2026-07-06_新需求范围内部确认版.docx`。当前基准为：A 类四端菜单 / 命名 / 边界 / Manager 总览全部一期修正；B 类客服统计、生产异常、内外返、部门对比和客户排名做一期基础版；C 类设备、物料、安环、成本、奖惩、行政、财务只做入口、基础台账或架构预留，不继续扩成一期完整管理闭环。
- 该 2026-07-06 基准覆盖 9D.93.1 和 9D.95 中“设备 / 物料 / 安环 / 成本 / 奖惩属于一期完整闭环继续开发”的旧口径。已完成的 9D.50-9D.54 汇总能力和 9D.95.1-9D.95.5 基础登记 / 状态增量保留，不删除；后续不再把设备编辑、物料处理历史、安环完整审批、成本审批 / 真实趋势、奖惩复杂审批作为一期本地必做缺口。
- 本轮 GOAL-004 / TASK-005 在 handoff worktree 内完成 A/B 第二段本地数据源收口；不接真实 DeepSeek key，不接真实 webhook，不伪装客户模板、客户签字或真实环境验收。
- 仓库是本地 Git 仓库；夜间开发 worktree 使用分支 `codex/nightly-task8-readiness`，基于 `feature/project-skeleton` 隔离推进 Task 8 readiness。
- 2026-07-04 本轮上传状态：`feature/project-skeleton` 已推送到 GitHub；本轮业务开发基线为 `5e9ee18`，后续文档回补提交不改变业务代码边界。本轮按边界拆分为生产汇总、AI 治理、Task 8 文档回写和 workflow helper 整理提交；工作区只剩未跟踪 `test-results/` 运行产物，未纳入提交。
- 2026-07-01 上传交接状态：已确认本地 `feature/project-skeleton` 与 `origin/feature/project-skeleton` 对齐；上传后产生的未提交后续试验改动已撤回。本次只做文档总结回写，不继续推进业务代码。
- 2026-07-01 新版 PRD/TRD/API 对齐决策已确认：以新资料为最新业务准绳，保留当前已验证增量，OpenAPI 后续按差异合并维护。
- 本轮 9D.82 最新 PRD V2.0 差异对齐矩阵第一段已完成：新增 `docs/acceptance/prd-v2-gap-matrix.md` 和 `npm run check:task9d82`，确认最新 PRD 正文为 `V2.0 / 2026-07-04`，但源文件名仍含 `PRD_V1.0` 且正文末尾存在 `V1.1` 字样；项目后续以正文 `PRD V2.0 / 2026-07-04` 为一期范围基线。矩阵已把医生患者管理、基础支付流水、客服客户 / 产品管理、人员档案、专项质量管理、设备 / 物料 / 安环 / 成本 / 奖惩列为一期待补缺口。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.83 患者管理基础版第一增量已完成：新增 `patient_record`、`orders.patient_id`、`patient:manage-doctor`、`/patients`、`/patients/{patientId}/orders`、医生端 `/doctor/patients` 最小入口和订单 `patient_id` 绑定校验。医生只能创建、检索、绑定、查看本人 + 本诊所患者档案，患者历史订单只返回外部状态，不返回 `internal_status`、`production_note` 等内部字段。本轮不做患者自定义标签、批量检索、AI 历史方案推荐、跨诊所共享或真实客户数据导入。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.84 人工支付流水 / 收支记录第一增量已完成：新增 `order_payment_record`、`/orders/{orderId}/payments` GET/POST、`PaymentRecordRequest` / `PaymentRecordResponse`、客服端账单物流页人工收款记录入口和医生端账单物流页只读流水展示。CS / ADMIN 可录入人工收款事实，医生只能查看本人订单流水。本轮不接真实支付网关，不做退款、自动对账、电子发票、财务审批或月结自动归集。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.85 客户 / 诊所档案与偏好第一增量已完成：复用 `clinic` 和 `customer_preference` 基础表，新增 `/clinics`、`/clinics/{clinicId}`、`/clinics/{clinicId}/preference` 后端实现、`ClinicPreferenceTests`、客服端 `/customers`、管理端 `/admin/clinics`、医生端 `/doctor/account/clinic` 真实入口和 `npm run check:task9d85`。CS / ADMIN 可查看/创建诊所并维护 6 个一期偏好字段，DOCTOR 只能读取本人诊所偏好，WORKER 访问返回 403。本轮不做客户开户审批、定价体系、真实客户数据导入、复杂 CRM、价格权限或客户 / PM 字段最终确认。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.86 人员档案 / 工作量看板第一增量已完成：复用 `system_user`、`system_dept`、`system_post`、`system_user_post`、`system_user_role`、`work_log` 和 `rework_record`，新增 `/staff/workload`、`StaffWorkloadTests`、生产端 `/production/staff`、管理端 `/admin/staff` 真实入口和 `npm run check:task9d86`。ADMIN / CS 可查看内部员工基础档案、部门岗位、角色摘要和工作量统计，WORKER 只返回本人，DOCTOR 访问返回 403；响应不返回 `password_hash`、token、薪酬、工资结算或客户隐私。本轮不做完整 HR、工资、排班、请假、绩效申诉、薪酬结算、岗位能力矩阵编辑或人员 CRUD。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.87 质量记录 CRUD / 外返登记第一增量已完成，后续 PRD V2 本地功能差异收口 B 已补独立模型第一段：新增 `quality_record` 独立事实表、`/quality-records/{qualityRecordId}/status` 状态更新接口和生产端 `/production/quality` 状态更新表单；创建外返时继续写 `check_record` / `rework_record` 兼容证据。CS / ADMIN 可登记、查看、更新内部质量记录状态，DOCTOR 禁止访问。本轮仍不做编辑/删除、投诉/退货系统、质量复盘完整流程或客户最终质量口径确认。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.88 客服订单 / 沟通完整可见性 smoke 已完成：不新增数据库迁移，扩展既有 `order_message` 响应，新增 `order_no`、`product_type`、`external_status` 订单上下文字段；客服待审核队列和订单消息上下文可显示订单号、产品类型和医生端外部状态。目标测试覆盖生产端消息进入 `PENDING_REVIEW`、客服可见订单上下文、驳回后医生端不可见、生产端收到驳回通知；前端客服协同页同步展示订单上下文。本轮不做消息附件 URL 聚合、AI 自动审核、复杂客服工单或真实外部通知。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.89 医生账户设置基础闭环已完成：新增 V33 非破坏性迁移，在 `system_user` 上补 `contact_email`、`contact_phone`、`shipping_address`、`notification_push_enabled`；新增 `/doctor/account/settings` GET/PUT 和 `/doctor/account/password`，医生可维护本人姓名、邮箱、电话、收货地址、消息推送开关并用当前密码修改登录密码，CS 等非医生角色访问返回 403；医生端新增 `/doctor/account/settings` 真实页面。本轮不接短信/邮箱真实验证、不做多地址簿、二次认证、登录记录审计或客户最终字段确认。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.90 产品参数 / 价格体系一期最小后台已完成：新增 V34 非破坏性迁移创建 `product_catalog`，新增 `product:manage`、`/products` GET/POST 和 `/products/{productId}` PUT；CS / ADMIN 可维护产品类型、产品名称、材料规格、人工基础价、币种、状态和价格备注，DOCTOR 禁止读取内部基础价；前端 `/system/form-configs` 产品管理页上半区新增产品目录 / 基础价维护。本轮不做自动报价、客户分层价格、价格审批、价格历史生效规则、账单重算或真实财务结算。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.93.1 PRD V2 范围纠偏第一闭环已完成：当时按用户旧确认把设备 / 物料 / 安环 / 成本 / 奖惩恢复为一期开发功能；该口径已被 2026-07-06 内部确认基准覆盖。当前只保留入口、基础台账和已完成的最小记录能力，不继续扩成一期完整闭环。所有 AI 智能体使用 LangChain + DeepSeek 的口径仍保留；医生文件独立模块仍不属于项目需求范围，病例、口扫、图片、处方等文件继续归入医生订单附件与病例资料链路。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.94 LangChain + DeepSeek AI 底座对齐第一增量已完成：新增 LangChain4j OpenAI-compatible ChatModel 依赖、`AI_PROVIDER=langchain-deepseek` 显式 provider、`AI_LANGCHAIN_ENABLED=false` 默认关闭开关和 `LangChainDeepSeekAiModelClient`。显式启用 `AI_PROVIDER=langchain-deepseek`、`AI_LANGCHAIN_ENABLED=true`、`AI_LANGCHAIN_PROVIDER=deepseek`、`AI_DEEPSEEK_ENABLED=true` 且外部注入 `DEEPSEEK_API_KEY` 时，AI-1 / AI-2 / AI-3 公开查询 / AI-5 经 LangChain4j 调用 DeepSeek；AI-3 内部问题仍本地安全拒答，不外呼模型。本轮不提交真实 key，不做真实环境联调，不实现流式输出、RAG、复杂多 agent 或工具调用。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.95 设备 / 物料 / 安环 / 成本 / 奖惩拆解第一增量已完成：新增 `docs/acceptance/phase-one-production-support-closure-plan.md` 和 `npm run check:task9d95`。该文档现在只作为历史拆解记录和已完成基础能力索引；2026-07-06 后不再继续推进为一期完整闭环。本轮不接 IoT、真实财务系统或工资发放。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.95.1 设备台账 / 设备事件录入第一增量已完成：复用 9D.50 的 `production_equipment` 和 `production_equipment_event`，新增 `/production/equipment` 与 `/production/equipment/{equipmentCode}/events`，WORKER / ADMIN 可人工登记设备台账和设备事件，DOCTOR 写入返回 403；生产端设备管理页新增“登记设备”和“登记事件”最小表单，提交后刷新既有真实设备汇总。本轮不新增迁移，不接 IoT，不做保养审批流、复杂设备履历或真实设备联网。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.95.2 物料异常登记 / 处理状态第一增量已完成：复用 9D.51 的 `production_material_exception`，新增 `/production/material-exceptions` 与 `/production/material-exceptions/{exceptionNo}/status`，WORKER / ADMIN 可人工登记缺料、错料、批次异常或材料损耗，并更新 `PENDING / IN_PROGRESS / CLOSED` 处理状态，DOCTOR 写入返回 403；生产端物料异常页新增“登记物料异常”和“更新处理状态”最小表单，提交后刷新既有真实物料异常汇总。本轮不新增迁移，不接库存扣减、采购补料、供应商协同或 WMS。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.95.3 安环巡检 / 隐患整改第一增量已完成：复用 9D.52 的 `production_safety_event`，新增 `/production/safety-environment/events` 与 `/production/safety-environment/events/{eventNo}/status`，WORKER / ADMIN 可人工登记安全巡检、隐患整改、环境记录或 PPE / 设备安全提醒，并更新 `PENDING / IN_PROGRESS / CLOSED` 整改状态，DOCTOR 写入返回 403；生产端安环管理页新增“登记安环事件”和“更新整改状态”最小表单，提交后刷新既有真实安环汇总。本轮不新增迁移，不接真实环境采集硬件、PPE 发放系统或完整安环审批流。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.95.4 成本记录维护 / 趋势口径第一增量已完成：复用 9D.53 的 `production_cost_record`，新增 `/production/cost-management/records`，WORKER / ADMIN 可人工登记 `PROCESS / MATERIAL / LABOR / REWORK / OUTSOURCING` 成本记录，成本汇总会同步反映新增记录和 `WARNING` 异常预警；DOCTOR 写入返回 403。生产端成本管理页新增“登记成本记录”最小表单，提交后刷新既有真实成本汇总。本轮不新增迁移，不接真实财务系统、发票、对账或自动成本分摊。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.95.5 奖惩记录 / 审批状态第一增量已完成：复用 9D.54 的 `production_reward_penalty_record`，新增 `/production/reward-penalty/records` 与 `/production/reward-penalty/records/{recordNo}/status`，WORKER / ADMIN 可人工登记 `REWARD / PENALTY` 奖惩记录并更新 `PENDING / APPROVED / REJECTED / EFFECTIVE` 审批状态；DOCTOR 写入和更新返回 403。生产端奖惩管理页新增“登记奖惩记录”和“更新审批状态”最小表单，提交后刷新既有真实奖惩汇总。本轮不新增迁移，不作为工资发放结果，不做薪酬结算、绩效申诉闭环或复杂审批引擎。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.96 医生提交前 AI-4 资料缺失自动触发体验第一增量已完成：医生端提交订单 / 提交草稿补资料前，会先把当前表单保存为草稿并调用既有 `/ai/check-missing`；如果 AI-4 规则检查返回必填资料缺失，则停留在编辑状态并展示“AI-4 资料缺失检查”提示和缺失项清单，不进入客服审核队列。资料完整时再提交订单。本轮不新增后端接口，不做 AI 自动驳回订单，不接真实 DeepSeek key 或新外部服务。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.97 AI-2 客服查询引用数据说明 / 知识上下文补强第一增量已完成：`/ai/cs-query` 响应新增 `reference_data_notes`，后端按客服权限范围汇总订单基础、生产上下文、沟通消息、附件、账单和物流只读来源说明；客服端 `/ai/cs` 展示“引用数据说明”。本轮不新增数据库迁移，不接真实 DeepSeek key，不做 RAG / tool calling，不自动发送消息、不自动写订单、生产备注或客服沟通记录。Task 8 仍保持 `NOT_READY`。
- 历史 9D.98 曾提供 AI-5 默认模板、知识上下文和独立人工确认入口；该交互与验收口径现已被 D-186 的“客户档案分类要求自动带入 + 初审通过冻结订单快照”取代。`check:task9d98` 已退役，当前使用 `npm run check:customer-special-requirements`、`AiGatewayTests` 和 `ClinicPreferenceTests` 验收；历史记录保留，不作为当前门禁。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.99 A/B 类一期范围对齐第一段已完成：前端四端展示按 2026-07-06 基准完成第一段命名和基础统计收口，生产端删除独立“工作单”入口，生产展示“生产中”改为“生产异常”，菜单“物料异常”改为“物料管理”，并补“待问异常”；客服工作台补客服统计基础版：翻译待审、账单超期、本月 / 上月对比、订单数量 / 件数和十大客户排名；生产工作台补生产统计基础版：生产异常、待问异常、员工异常、部门今日 vs 上月平均、返工率、出货率、完成率和内返 / 外返拆分；新增 `npm run check:task9d99`。本轮不新增后端接口、不新增迁移、不接真实支付 / 物流平台、不伪造真实经营统计。Task 8 仍保持 `NOT_READY`。
- 本轮 9D.100 A/B 类一期范围对齐第二段已完成：客服工作台订单数量 / 件数、待审核、翻译待审、待回复、设计更新、延期提醒、今日发货、账单超期和投诉 / 返工改为复用现有订单、待审消息、通知、物流人工状态和质检外返汇总；生产工作台生产异常、待问异常、员工异常、质量与返工、设备异常、物料管理、成本预警、安环待办、奖惩待审和趋势图改为复用现有订单、待审消息、人员工作量、质量返工、物流和生产支持汇总接口。月度趋势、真实支付平台、真实物流平台和客户 / PM 最终统计口径仍为 PARTIAL / BLOCKED。Task 8 仍保持 `NOT_READY`。
- Active goal: `goals/GOAL-008-prd-v2-local-gap-closure-b-20260707.md`，状态为 `completed`
- Active task: `tasks/TASK-009-prd-v2-local-gap-closure-b-20260707.md`，状态为 `completed`
- 当前总目标已从“继续推进 9D 小增量”收束为“完成一期交付”；9D 任务只作为补齐一期上线缺口的执行单元。前端匹配一期范围见 `docs/acceptance/phase-one-frontend-alignment.md`；后续按端口拆一期任务、处理已完成和超一期入口时使用 `docs/acceptance/phase-one-frontend-task-scope.md`。
- Latest Feedback: 一期收口 workflow 已整理进 handoff RepoFrame；后续每个 Codex 窗口应使用 `docs/development/stage-goal-window-guide.md` 启动一个阶段级 goal，在一个执行批次 task 内拆 checklist，不因单个小项完成就停止建议下一步小任务。
- Task Impact: GOAL-003=completed；GOAL-004=completed；GOAL-005=completed；GOAL-006=completed；TASK-004=completed；TASK-005=completed；TASK-006=completed；TASK-007=completed；Task 8=keep `NOT_READY`。
- Recommended Replan: 下一轮优先按 docs/development/workflow.md 启动阶段级 goal，建议从一期收口技术方案第一段“客户 / PM 确认项与真实环境 AI 验收收口”建立执行批次 task；真实客户 / PM 确认、真实支付 / 物流平台、真实 DeepSeek key、真实 webhook 和真实环境验收仍保持阻塞项，不能由本地代码或文档伪装完成。
- 本轮 9D.71 AI 外部告警接收端验签 / 防重放第一段已完成：发送侧签名启用时会发送 `X-AI-Alert-Timestamp`、`X-AI-Alert-Nonce` 和 `X-AI-Alert-Signature`，签名基串为 `timestamp.nonce.requestBody`；新增默认关闭的 `/ai/external-alerts/receive` 本地接收端验收桩，显式启用并注入接收端 secret 后校验 timestamp 时间窗、nonce 重放和 HMAC 签名。本轮不接真实外部 webhook，不提交真实 secret，不做分布式 nonce 存储或生产联调。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.72 客户 / PM 确认项清单第一段已完成：新增 `docs/acceptance/phase-one-customer-pm-confirmations.md`，把付款状态口径、动态表单最终字段、AI-5 生产备注模板、标准工时与绩效公式口径、Multipart 上传限制、真实电子签章 / 终检报告模板、真实物流平台 / 运单同步、客户培训与签收、真实环境上线验收边界纳入确认表。本轮只建立追踪，不替代客户或 PM 书面确认，不关闭 Task 8。
- 本轮 9D.73 账单 / 付款状态 / 物流一期闭环第一段已完成：新增 `order_bill.payment_status`、`PaymentStatusRequest`、`/orders/{orderId}/bill/payment-status` 和前端客服人工维护付款状态入口；医生端账单物流页只读展示付款状态。付款状态仅采用 9D.72 / CP-001 默认人工口径，不接真实支付系统，不做财务审批或支付渠道对账，物流发货仍沿用终检 `OUT/PASS` 门禁。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.74 绩效标准工时与完整公式口径第一段已完成：`/performance` 新增 `performance_formula_version=PHASE_ONE_DEFAULT_V1`、标准工时合计、标准工时覆盖数量、缺失数量、覆盖率和默认绩效分；前端绩效页只读展示公式版本、标准工时覆盖率和默认绩效分。该公式仅为 CP-004 开发默认口径，不作为工资、奖金或奖惩结算依据，不替代客户 / PM 书面确认。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.75 正式鉴权与 DataScope 收口第一段已完成：新增 `APP_AUTH_ALLOW_ROLE_FALLBACK`，本地默认保留角色兜底以兼容 smoke，`prod` profile 和一期 compose 生产骨架固定为 `false`；`@RequirePermission` 写了权限码的接口在严格模式下必须由 Bearer token 中的权限码放行，角色-only token 不再绕过权限码。新增 `StrictPermissionModeTests` 和 prod 启动门禁测试。本轮不重写 Spring Security/JWT，不做完整 RuoYi 管理 UI、通用 SQL DataScope、access token 黑名单、refresh token 轮换或多设备会话策略。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.76 WebSocket / 通知生产验收第一段已完成：新增 `npm run check:task9d76`，并在一期 Nginx 配置中补 `/notifications` REST 代理，避免生产前端通知中心落到 SPA fallback；同一检查串联 `/ws/` upgrade 代理、compose Redis/后端依赖、后端 Redis 广播代码路径、通知 REST 隔离/已读测试、单实例 WebSocket 脱敏测试和 Redis 远端广播测试。本轮不启动真实生产环境，不做真实双实例 Redis 联调、Nginx HTTPS 验收或真实生产 webhook 联调。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段已完成：新增 `docs/acceptance/task-9d78-bucket-isolation-readiness.md` 和 `npm run check:task9d78`，检查本地 `.env.example` 的 `MINIO_BUCKET=ai-order-private` 与一期生产 env 占位 bucket 不同、生产 bucket 仍为占位示例、一期 compose 要求外部注入 `MINIO_BUCKET`，并同步 readiness / acceptance 证据。本轮不接真实生产对象存储，不提交真实 MinIO 密钥、真实 bucket 名称或生产 URL，不替代客户 / PM 书面确认。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.79 真实环境文件上传人工验收记录模板第一段已完成：新增 `docs/acceptance/task-9d79-real-env-file-upload-manual-acceptance.md` 和 `npm run check:task9d79`，提供真实测试环境/正式环境文件上传人工验收模板，覆盖测试 bucket、正式 bucket、对象存储账号隔离、文件限制、弱网、跨设备、越权读取和客户/PM 签字状态。模板默认 `待填写` / `待确认`，不填写真实密钥，不代表真实环境已验收。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段已完成：新增 `docs/acceptance/task-9d80-ai-production-integration-acceptance.md` 和 `npm run check:task9d80`，提供真实测试/正式环境 AI 真实 key、生产 webhook、发送侧签名、接收端验签 / 防重放、预算熔断、输出防护和审计留痕的人工验收模板。模板默认 `待填写` / `待确认`，不填写真实密钥，不填写真实 webhook URL，不代表真实 key 或生产 webhook 已联调完成。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.81 部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段已完成：新增 `docs/deployment/task-9d81-production-deployment-acceptance.md` 和 `npm run check:task9d81`，提供真实测试/正式环境 Docker Compose、Nginx、HTTPS、镜像仓库、生产环境变量、数据库备份、备份恢复演练、日志留存、监控告警和发布回滚验收模板。模板默认 `待填写` / `待确认`，不填写真实密钥或真实服务器地址，不代表真实服务器、HTTPS、备份恢复或监控告警已验收完成。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.70 操作手册与交付材料第一段已完成：新增 `docs/operations/phase-one-role-operation-manual.md`、`docs/operations/phase-one-troubleshooting-guide.md` 和 `docs/operations/phase-one-delivery-materials-index.md`，覆盖医生端、客服端、生产端、管理端最小操作路径、首版故障处理清单和交付材料索引。本轮不替代正式客户培训签收，不关闭客户/PM 确认项。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.69 部署基础设施第一段已完成：新增后端 `backend/platform-server/Dockerfile`、前端 `frontend/Dockerfile`、Nginx SPA/API/WebSocket 代理配置、`deploy/docker-compose.phase-one.yml`、`deploy/env/phase-one.prod.example` 和 `docs/deployment/phase-one-docker-env.md`；`npm run compose:phase-one:config` 已能用占位 env 展开 full-stack compose 配置。本轮不写真实密钥、不启动真实生产环境、不做 HTTPS/镜像仓库/备份/监控/真实环境联调。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.68 12 步主链路客户验收版收敛已完成：新增 `docs/acceptance/phase-one-main-chain-customer-acceptance.md`，把 9D.62 到 9D.63 的固定演示数据 smoke 证据整理为客户/PM 可读 PASS/FAIL 清单，记录固定演示订单 `ORD20260704-C230B9CA90`、返工记录 `678`、物流单号 `SF-9D62-1783175824632`、最终外部状态 `COMPLETED` 和剩余上线缺口。本轮不新增业务功能、不新增接口、不替代客户签字。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.67 文件上传限制与 bucket 隔离第一段已完成：`/files/upload-token` 和 `/files/multipart/initiate` 在发放预签名或初始化 Multipart 前统一校验 `FILE_MAX_FILE_SIZE_BYTES`、`FILE_ALLOWED_CONTENT_TYPES` 和 `FILE_MAX_FILES_PER_ORDER`；医生端上传选择增加同口径的大小、类型、数量提示；`.env.example`、OpenAPI、acceptance、readiness 和前端范围文档已同步测试/正式 `MINIO_BUCKET` 隔离边界。本轮不做真实弱网限速/断网全量验收、完整跨设备续传、独立文件中心、Tus/tusd、真实电子签章平台或真实物流平台。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.66 绩效周期筛选第一段已完成：`/performance` 和 `/performance/details` 新增 `start_date` / `end_date`，按 `work_log.finished_at` 日期闭区间过滤统计与明细；返工归因和出检通过率同步按对应事实创建时间过滤。前端绩效页新增开始/结束日期输入，OpenAPI、acceptance 和文档已同步。本轮不做标准工时后台配置、完整绩效公式、绩效申诉、导出、工资发放或全员绩效大屏。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.65 终检 PDF/签名第一段已完成：终检报告新增 `pdf_file_id`、`signature_status`、`signed_by_user_id`、`signed_at`，可绑定同订单已完成上传、`INTERNAL` 可见且 `application/pdf` 的终检 PDF 文件，并默认返回 `signature_status=PENDING` 的签名占位。前端返工终检页新增终检 PDF file_id 输入和签名状态展示，OpenAPI、acceptance 和文档已同步。本轮不接真实电子签章平台、不生成复杂 PDF 模板、不做签章流转/归档状态机、不改变医生端不可读终检报告和内部 PDF 的安全边界。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.64 客服端设计稿审核预览增强第一段已完成：客服初审 / 内部订单设计稿页现在会在选中订单后加载该订单设计稿版本列表，客服可按设计稿文件 ID 调用既有 `/files/{fileId}/preview-url` 获取短时效授权预览链接。本轮不新增后端接口、不新增数据库字段、不新增 OpenAPI 契约，不做复杂在线审稿、批注、三轮驳回/重传完整回归、设计稿阻塞生产规则、终检 PDF/签名或真实物流平台。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.63 返工异常路径数据闭环第一段已完成：`npm run smoke:task9d62` 现在会在固定演示订单的首个已完成节点上提交出检失败，创建返工记录，确认目标节点回到 READY，再重做该节点并关闭返工。本轮真实 smoke 证据：`order_id=6838`、`order_no=ORD20260704-C230B9CA90`、`instance_id=2818`、`rework_id=678`、`target_node_instance_id=4389`、`status=DONE`、最终 `external_status=COMPLETED`。本轮不新增后端接口、不新增数据库字段、不新增演示种子数据，不做复杂返工看板、绩效申诉、真实通知压测、终检 PDF/签名或医生端返工可见。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.62.5 终检后发货与医生确认收货数据闭环第一段已完成：`npm run smoke:task9d62` 现在会在固定演示订单完成账单预览后，循环处理剩余 READY 工序节点直到工序实例 `COMPLETED`，再录入物流发货并由医生确认收货，断言医生端外部状态从 `SHIPPED` 进入 `COMPLETED`。本轮真实 smoke 证据：`order_id=6730`、`order_no=ORD20260704-63614EB7F3`、`instance_id=2772`、`completed_nodes=23`、`tracking_no=SF-9D62-1783174965185`、`external_status=COMPLETED`。本轮不新增后端接口、不新增数据库字段、不做真实物流平台、支付系统、付款状态流转、财务审批、终检 PDF/签名或返工异常路径。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.62.4 账单/物流数据闭环第一段已完成：`npm run smoke:task9d62` 现在会在固定演示订单完成设计稿确认后，由 CS 通过真实文件签名 URL 上传账单文件到 MinIO，绑定订单账单，医生读取账单并获取短时效预览 URL，同时断言未完成全链路终检前物流发货返回 409 门禁。本轮不新增后端接口、不新增数据库字段、不做真实物流平台、支付系统、付款状态流转、财务审批或终检 PDF/签名。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.62.3 设计稿确认数据闭环第一段已完成：`npm run smoke:task9d62` 现在会在固定演示订单完成首个派工节点出检通过后，由 worker 通过真实文件签名 URL 上传设计稿文件到 MinIO，绑定设计稿版本，CS 审核通过，医生读取设计稿列表、获取短时效预览 URL 并确认设计稿，再继续跑 12 步四端入口浏览器 smoke。本轮不新增后端接口、不新增数据库字段、不做在线 CAD、复杂批注、三轮驳回/重传完整回归或设计稿阻塞生产规则。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.62.2 派工与工序操作数据闭环第一段已完成：`npm run smoke:task9d62` 现在会在固定演示订单生产审核通过后，读取工序实例首个 `READY` 节点，管理员派工给 worker，断言 worker 任务池可见，提交入检通过，完成开工、工时开始/完成、完工和出检通过，再继续跑 12 步四端入口浏览器 smoke。本轮不新增后端接口、不新增数据库字段、不做完整工艺链全节点执行、设计稿/账单/物流/确认收货完整数据动作。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.62.1 固定演示数据闭环第一段已完成：`npm run smoke:task9d62` 现在会先通过真实 API 登录医生/客服账号，创建固定演示订单，完成客服初审通过和生产审核通过，并断言 `PROCESS_INSTANCE_CREATED` 与 `instance_id` 后，再继续跑 12 步四端入口浏览器 smoke。本轮不新增后端接口、不新增数据库字段、不做派工/工时/设计稿/账单/物流/确认收货完整数据动作。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.62 12 步主链路浏览器 smoke 第一增量已完成：新增 `scripts/smoke-task-9d62-main-chain.spec.mjs`、`scripts/check-task-9d62-main-chain-browser-smoke.mjs`、`npm run check:task9d62` 和 `npm run smoke:task9d62`，先固定 PRD/TRD 12 步主链路的四端浏览器入口和页面/控件可达断言。Task 8 总体仍保持 `NOT_READY`。
- 本轮 9D.61 账单物流预览/录入闭环第一增量已完成：客服/内部订单页新增最小账单 `file_id` 上传入口，医生端账单物流页新增“获取账单预览链接”，复用既有 `/orders/{orderId}/bill`、`/orders/{orderId}/logistics` 和 `/files/{fileId}/preview-url`；物流录入继续走生产看板并保留终检发货门禁。本轮不新增后端接口、不做真实物流平台、支付系统或财务审批流。Task 8 总体仍保持 `NOT READY`。
- 本轮 9D.60 设计稿预览 URL 聚合第一增量已完成：医生端设计稿版本列表新增“获取设计稿预览链接”，按设计稿 `file_ids` 调用既有 `/files/{fileId}/preview-url` 获取短时效签名 URL 并展示为外链；本轮不新增后端接口、不把预览 URL 固化进设计稿响应、不做在线 CAD 预览器或完整设计稿审批重构。Task 8 总体仍保持 `NOT READY`。
- 本轮 9D.59 客服资料缺失提示与 AI 翻译草稿确认第一增量已完成：客服初审页新增资料缺失提示、AI 翻译草稿和“写入生产备注”人工确认入口，复用既有 `/ai/check-missing`、`/ai/translate` 和 `/orders/{orderId}/review`；本轮不新增后端 schema、不做 AI 自动审核/发送/驳回。Task 8 总体仍保持 `NOT READY`。
- 本轮 9D.58 客服协同闭环第一增量已完成：客服端 `/collaboration` 从占位入口升级为客服协同台，复用既有消息审核接口展示待审核消息、按订单 ID 查看订单消息上下文，并支持通过/驳回生产发给医生的消息；本轮不新增后端 schema、不做完整 CRM、物流平台 API、AI 自动审核/发送或复杂客服工单。Task 8 总体仍保持 `NOT READY`。
- 本轮 9D.57 返工影响图形化第一增量已完成：生产端返工终检页新增只读返工影响图，把既有 `target_node_instance_id`、`target_process_name`、`impacted_node_count` 和 `impacted_node_instance_ids` 转成可读的“返工目标 -> 后续重置节点”路径；已用浏览器真实点击验证生产端从“看返工”进入返工终检可见影响图，医生端不可见该内部图。本轮不新增后端接口、不做复杂甘特、拖拽排产、重新派工或医生端返工可见。Task 8 总体仍保持 `NOT READY`。
- 本轮 9D.56 终检专用角色 / 附件第一增量已完成：新增 `final-inspection:manage` 专用权限、`final_inspection_report_file` 绑定表和终检报告附件 `attachment_file_ids`；终检报告生成只允许具备专用权限的内部账号，附件必须是同订单、已完成上传、`INTERNAL` 可见文件，医生端不能读取终检报告或内部附件预览 URL。Task 8 总体仍保持 `NOT READY`。
- 9D.55 开源底座复用清单与返工字典后台维护第一增量已完成：新增 `docs/development/open-source-foundation-reuse-gap-list.md`，按 RuoYi-Vue-Pro / 若依 Pro 的字典/CRUD/菜单/权限范式，把返工原因和责任类型从后端固定字典推进到 ADMIN 后台可维护、可停用的数据库字典。
- 本轮验收矩阵机器可读缺口清单第一增量已完成；`acceptance.json` 新增 `task8_readiness_gaps`，并新增 `npm run check:task8-readiness-gaps` 列出当前上线缺口。Task 8 总体仍保持 `NOT READY`。
- 本轮提交边界：`1895f79 feat(production): add summary dashboards`、`f395584 feat(ai): add external alert governance controls`、`c781eae docs: refresh task 8 readiness handoff`、`5e9ee18 refactor(workflow): group final inspection helpers`。
- 已按 RepoFrame + Yuri 工作流创建项目上下文文档。
- 已完成任务 0：接口契约与项目基线。
- 已完成任务 0.1：按 TRD V1.1 深度研究优化版对齐开发计划。
- 已完成任务 1 前置预检：确认本机 Node/npm/pnpm/Docker CLI/Colima 可用，Docker daemon 当前未运行，Java Runtime/Maven/Gradle 不可用，并整理任务 1 三条执行路线。
- 已按路线 A 初始化前后端工程骨架；当前仅包含框架启动壳、模块边界占位和 ADMIN 登录烟测，不包含订单、工序、文件、AI、绩效等业务实现。
- 本机 JDK 21、Maven、Node/npm/pnpm、Docker CLI/Colima 可用；Docker daemon 已通过 Colima 启动。

## 已完成

- 9D.33 已补 AI 预算超限内部通知第一增量：预算跨线后写入 `AI_BUDGET_EXCEEDED` 通知事实，只通知 ACTIVE 的 ADMIN / CS 数据库账号，并复用现有通知中心和 WebSocket 本地推送；不通知 DOCTOR / WORKER，不做外部告警或熔断。
- 9D.34 已补 AI 预算通知策略开关第一增量：新增 `AI_BUDGET_NOTIFICATION_ENABLED`，默认开启；关闭后预算跨线仍写 `AI_BUDGET_EXCEEDED` 治理审计，但不写内部通知事实、不触发本地推送。
- 9D.35 AI 预算熔断/降级第一增量已补：新增 `AI_BUDGET_CIRCUIT_BREAKER_ENABLED`，默认关闭；开启后预算已超限时真实模型调用返回 deterministic fallback，并写入 `AI_BUDGET_CIRCUIT_OPEN` 治理审计。
- 9D.36 已按客户旧版医生端、客服端、生产端 HTML 原型完成前端全页面视觉第一增量，并已追加 product design 精修：登录页改为深蓝窄卡片端口入口，登录后侧栏改为品牌区/身份块/分组菜单/底部说明，业务状态码和产品类型前端显示中文化；保留现有 Vue 路由、RBAC 菜单、接口调用和服务端权限边界。
- 9D.36 已按客户展示视频反馈追加前端展示清理：工作台不再展示 `ADMIN/WORKER` 等角色码、路由路径、组件名、权限码条或图标字体英文兜底；客服端工作台补订单管理、沟通中心、客户管理、产品管理、配送管理、账单管理、外协管理；生产端工作台补人员管理、设备管理、物料异常等客户反馈入口。
- 9D.36 已按客户二次反馈追加导航结构修正：四个端口的工作台卡片与左侧栏共用 `displayNavigationConfig`，主功能含子功能；工作台名称与左侧栏一致；未接接口的新功能进入中文占位页；医生端订单管理拆成新建订单、我的订单、设计稿确认、账单物流、沟通留言、订单助手子栏目；管理端点击工艺、权限、人员、设备、外协等功能时保持管理端菜单模板。
- 9D.36 已按客户三次反馈追加版式修正：左侧栏固定到页面顶部并合并为单一“AI智能下单平台”标题；登录后右侧内容网格改为自然内容高度，避免侧栏高度撑开顶部说明卡和功能卡之间的间距。
- 9D.36 已按客户旧版三端 HTML 原型追加四端视觉主题锁定：医生端复刻医生蓝，客服端复刻客服紫，生产端复刻生产青，管理端采用深石墨管理蓝；入口主题由登录端口决定，点击左侧任一功能后侧栏结构、颜色和整体版式保持不变。
- 9D.36 已按客户确认追加原型工作台复刻：工作台不再重复左侧栏功能入口，改为医生/客服/生产/管理四端业务仪表盘；订单、生产、设计稿/数据处理类页面补原型式快速筛选 chip、队列卡片、彩色状态 badge 和高密度表格视觉。
- 9D.36 已按客户最新反馈追加工作台交互修正：四入口登录后默认进入工作台；工作台 KPI 卡片移除黑色图标；快速筛选 chip 增加点击选中态，并在生产看板、我的任务、内部订单等已有筛选接口上联动加载；工作台新增演示级趋势图表。
- 9D.36 已按客户生产端展示反馈追加模块陈列并二次收敛命名：生产端左侧导航保留安环管理、成本管理、质量与返工、奖惩管理、设备管理、物料异常等正式入口；质量与返工子功能收敛为质量总览、返工管理、终检报告，内返率和外返率放入页面指标与工作台趋势展示；生产工作台 7 个指标卡改为紧凑网格，避免长条卡片撑高页面；四端左上角身份区新增账号管理/账号切换弹出面板，账号切换复用现有退出登录逻辑，不改后端接口和权限校验。
- 9D.37 已补 AI 预算外部告警待发送事实第一增量：新增 `ai_external_alert_outbox`，预算跨线和预算熔断命中后分别写入 `AI_BUDGET_EXCEEDED` / `AI_BUDGET_CIRCUIT_OPEN` 的 `PENDING` 外部告警事实；本轮不接真实外部发送器。
- 9D.38 已补 AI 分角色预算第一增量：新增 `ai_audit_log.actor_role` 和四个角色日预算变量，预算熔断开启且角色预算超限时返回 deterministic fallback，写入 `AI_BUDGET_ROLE_CIRCUIT_OPEN` 治理审计和外部告警 outbox。
- 9D.39 已补 AI 分模型预算第一增量：新增 `AI_DEEPSEEK_DAILY_BUDGET_MICROUSD`，预算熔断开启且当前 `AI_DEEPSEEK_MODEL` 预算超限时返回 deterministic fallback，写入 `AI_BUDGET_MODEL_CIRCUIT_OPEN` 治理审计和外部告警 outbox。
- 9D.40 已补 AI 提示词版本与输出防护第一增量：新增 Flyway `V21__ai_prompt_version_output_guard.sql`，AI 审计写入 `prompt_version`；真实模型输出命中敏感密钥、审计表、文件表、系统账号等模式时返回安全保护文案，并写入 `AI_OUTPUT_GUARDED`。
- 9D.41 已补 AI 外部告警发送器第一增量：新增本地 dry-run 发送器，`PENDING` outbox 可推进到 `SENT` / `FAILED`，并记录 `attempts` 和 `last_error`；本轮不接真实短信、邮件、企业微信或其他外部渠道密钥。
- 9D.42 已补 AI 成本趋势第一增量：新增 `/ai/governance/cost-trend` 和 `AiGovernanceCostTrendResponse`，按天聚合成功模型调用的 `estimated_cost_microusd`、`success_count` 与 `model_count`；本轮不做图表 UI、导出、真实账单对账或预算策略管理。
- 9D.43 已补 AI 真实外部渠道适配第一增量：`EXTERNAL_ALERT` 默认仍 dry-run；显式启用 `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=true` 并配置 `AI_EXTERNAL_ALERT_WEBHOOK_URL` 后，发送器会以 `application/json` POST outbox payload；9D.45 后，非 2xx 或连接异常进入有限重试/死信链路。本轮不提交真实 webhook、短信、邮件或企业微信密钥，不做签名或生产联调。
- 9D.44 已补 AI 外部告警调度器第一增量：新增默认关闭的调度器、`AI_EXTERNAL_ALERT_SCHEDULER_*` 环境变量和调度器测试；显式启用后按批次调用既有 sender，默认不自动处理 outbox；本轮不做分布式锁、复杂重试、死信、真实渠道密钥或生产 webhook 联调。
- 9D.45 已补 AI 外部告警重试/死信第一增量：新增 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS`，webhook 失败会累计 `attempts/last_error`；未达上限保持 `PENDING`，达到上限进入 `DEAD_LETTER`，避免无限重试。
- 9D.46 已补 AI 外部告警幂等/并发领取第一增量：sender 先领取 `PENDING -> SENDING` 后再 dry-run 或 webhook 外呼，重复触发和并发 sender 不会重复发送同一条 outbox。
- 9D.47 已补 AI 外部告警 webhook 签名/鉴权第一增量：签名默认关闭；启用签名且注入 secret 后，请求携带 `X-AI-Alert-Signature` HMAC-SHA256 签名；不提交真实 secret。
- 9D.48 已补 AI 外部告警监控/运维可观察第一增量：新增 `/ai/governance/external-alerts/summary`，CS / ADMIN 可只读查看 `PENDING/SENDING/SENT/FAILED/DEAD_LETTER` 数量分布、最近一条失败/死信错误和最老待发送时间；本轮不做 webhook 联调、真实渠道密钥、人工重放或告警抑制。
- 9D.48.1 已补 AI 外部告警 outbox 列表/筛选第一增量：新增 `/ai/governance/external-alerts`，CS / ADMIN 可只读查看 `alert_id/event_type/send_status/created_at/updated_at` 安全元数据，并按状态、事件类型、创建时间范围和 limit 筛选；本轮不返回 payload、last_error、密钥、真实 webhook URL、prompt 原文或模型原始响应。
- 9D.48.2 已补 AI 外部告警失败/死信可见性第一增量：`/ai/governance/external-alerts` 对 FAILED / DEAD_LETTER 记录返回 `attempts`、脱敏 `last_error` 和 `last_attempted_at`，不返回真实 webhook URL、密钥、Bearer token、prompt 原文、模型原始响应或上游敏感响应；本轮不做重试按钮、死信恢复、人工处理状态或生产 webhook 联调。
- Task 8 readiness 终检报告第一增量已补：新增 `docs/deployment/task-8-final-readiness-report.md`，按缺口名称、当前证据、未完成原因、最小补齐闭环和推荐验证方式收敛上线前缺口；不改变 Task 8 `NOT_READY` 状态。
- 部署安全 / 环境变量 readiness 检查第一增量已补：新增 `scripts/check-deployment-env-readiness.mjs` 和 `npm run check:deployment-env`，检查 README、`.env.example`、`application.yml`、`application-prod.yml` 和 readiness checklist 的外部注入变量、默认关闭能力、`APP_AUTH_ALLOW_ROLE_FALLBACK=false` 生产边界和禁止提交真实密钥说明。
- 验收矩阵机器可读缺口清单第一增量已补：`acceptance.json` 新增 `task8_readiness_gaps`，覆盖正式鉴权、前端业务页面、WebSocket/通知、文件上传、AI 治理、部署基础设施、操作手册和客户/PM 确认项；`npm run check:task8-readiness-gaps` 可列出当前缺口。
- 9D.49 已补生产端质量与返工汇总后端适配第一增量：新增 `ProductionQualitySummaryResponse` 和 `/production/quality/summary`，按出检订单数汇总总返工率、内返率、外返率、一次通过率和终检通过率；投诉率/退货率因缺少事实表当前返回 0 并在 OpenAPI 说明；前端生产端质量总览接入真实接口，Vite 补 `/production` 代理。
- 9D.50 已补生产端设备管理汇总后端适配第一增量：新增 `ProductionEquipmentSummaryResponse`、`/production/equipment/summary` 和 Flyway `V22__production_equipment_foundation.sql`，按设备台账和设备事件汇总设备状态、待处理保养、故障报修、停机时长和平均设备稼动率；前端生产端设备管理接入真实汇总，医生端访问该内部生产接口返回 403。
- 9D.51 已补生产端物料异常汇总后端适配第一增量：新增 `ProductionMaterialExceptionSummaryResponse`、`/production/material-exceptions/summary` 和 Flyway `V23__production_material_exception_foundation.sql`，按物料异常事实表汇总缺料、错料、批次异常、材料损耗、处理状态和责任归属；前端生产端物料异常接入真实汇总，医生端访问该内部生产接口返回 403。
- 9D.52 已补生产端安环管理汇总后端适配第一增量：新增 `ProductionSafetyEnvironmentSummaryResponse`、`/production/safety-environment/summary` 和 Flyway `V24__production_safety_event_foundation.sql`，按安环事件事实表汇总安全巡检、隐患整改、环境记录、PPE/设备安全提醒、待办状态、超期和高风险事件；前端生产端安环管理接入真实汇总，医生端访问该内部生产接口返回 403。
- 9D.53 已补生产端成本管理汇总后端适配第一增量：新增 `ProductionCostSummaryResponse`、`/production/cost-management/summary` 和 Flyway `V25__production_cost_record_foundation.sql`，按成本记录事实表汇总工序成本、材料成本、人工成本、返工成本、外协成本和成本异常预警；前端生产端成本管理/外协成本接入真实汇总，医生端访问该内部生产接口返回 403。
- 9D.54 已补生产端奖惩管理汇总后端适配第一增量：新增 `ProductionRewardPenaltySummaryResponse`、`/production/reward-penalty/summary` 和 Flyway `V26__production_reward_penalty_foundation.sql`，按奖惩记录事实表汇总奖励、扣罚、待审批、已通过、已驳回、已生效、关联订单/工序/员工和本月金额；前端生产端奖惩管理接入真实汇总，医生端访问该内部生产接口返回 403。
- 9D.55 已补开源底座复用清单与返工字典后台维护第一增量：新增 `rework_dictionary_item`、`rework:dictionary:manage`、`/system/rework-dictionaries` 和 `/reworks/dictionaries/items` 管理接口；ADMIN 可新增、编辑、停用返工原因/责任类型，关闭返工只接受 ACTIVE 字典项，医生端不能管理内部返工字典。
- 9D.57 已补返工影响图形化第一增量：在 `/rework-final` 页面把返工目标节点和受影响后续节点渲染为只读影响图，帮助生产端理解后续工序重置关系；真实浏览器点击已覆盖生产端“看返工”进入返工终检、医生端无返工影响图；本轮不改变返工状态机、派工或医生端可见性。
- 9D.58 已补客服协同闭环第一增量：客服端 `/collaboration` 复用 `/messages/pending-review`、`/orders/{orderId}/messages` 和 `/messages/{msgId}/review`，支持查看待审核消息、订单消息上下文并审核通过/驳回；本轮不新增后端接口、不做完整 CRM、物流平台 API 自动同步、AI 自动审核/发送或复杂客服工单。
- 9D.59 已补客服资料缺失提示与 AI 翻译草稿确认第一增量：客服初审页复用 `/ai/check-missing` 展示资料缺失提示，复用 `/ai/translate` 生成翻译草稿，并要求客服点击“写入生产备注”后才随通过初审写入 `production_note`。
- 9D.60 已补设计稿预览 URL 聚合第一增量：医生端设计稿版本列表复用 `/files/{fileId}/preview-url` 按需为 `file_ids` 获取短时效预览链接；本轮不新增后端接口或在线 CAD 预览器。
- 9D.61 已补账单物流预览/录入闭环第一增量：客服/内部订单页可上传账单 `file_id`，医生端可按需获取账单短时效预览链接；物流发货仍由生产看板执行并保留终检门禁。
- 9D.62 已补 12 步主链路浏览器 smoke 第一增量：新增 `phaseOneMainChainSteps`、`npm run smoke:task9d62` 和 `npm run check:task9d62`，先覆盖四端主链路入口可达。
- 9D.62.1 已补固定演示数据闭环第一段：`npm run smoke:task9d62` 默认 `TASK9D62_DATA_MODE=fixed-demo-first-three`，先创建真实医生订单并完成客服初审、生产审核和工序实例化断言，再跑 12 步入口 smoke。
- 9D.62.2 已补派工与工序操作数据闭环第一段：同一 smoke 会把首个 READY 工序节点派给 worker，并完成任务池可见、入检、开工、工时、完工和出检通过；完整设计稿、账单物流、确认收货和返工异常数据动作仍留作后续增量。
- 9D.62.3 已补设计稿确认数据闭环第一段：同一 smoke 会用真实文件签名 URL 上传设计稿文件，完成设计稿上传、客服审核、医生预览 URL 获取和医生确认；完整账单物流、确认收货、返工异常和全工艺链节点数据动作仍留作后续增量。
- 9D.62.4 已补账单/物流数据闭环第一段：同一 smoke 会用真实文件签名 URL 上传账单文件，完成账单绑定、医生账单预览 URL 获取，并断言未完成全链路终检前物流发货 409 门禁；终检后发货、确认收货和全工艺链节点数据动作已由 9D.62.5 补齐，返工异常仍留作后续增量。
- 9D.62.5 已补终检后发货与医生确认收货数据闭环第一段：同一 smoke 会完成剩余 READY 工序节点直到实例完成，录入物流发货并由医生确认收货；返工异常、终检 PDF/签名、付款状态和真实物流平台仍留作后续增量。
- 9D.63 已补返工异常路径数据闭环第一段：同一 smoke 会提交出检失败、创建返工记录、重做目标节点并关闭返工；终检 PDF/签名、付款状态、真实物流平台、绩效完整公式/周期/申诉和真实弱网/跨设备上传仍留作后续增量。
- 9D.64 已补客服端设计稿审核预览增强第一段：客服端内部订单设计稿页可加载当前订单设计稿版本，并复用文件预览签名 URL 获取客服设计稿预览链接；终检 PDF/签名、付款状态、真实物流平台、绩效完整公式/周期/申诉和真实弱网/跨设备上传仍留作后续增量。
- 9D.65 已补终检 PDF/签名第一段：终检报告可绑定内部 PDF file_id 并返回签名占位状态；真实电子签章、复杂报告模板、付款状态、真实物流平台、绩效完整公式/周期/申诉和真实弱网/跨设备上传仍留作后续增量。
- 9D.66 已补绩效周期筛选第一段：`/performance` 与 `/performance/details` 支持 `start_date` / `end_date`，前端绩效页可按日期范围查询统计卡片和工时明细；标准工时配置、完整公式、申诉、导出和工资发放仍留作后续增量。
- 9D.56 已补终检专用角色 / 附件第一增量：新增 `final-inspection:manage`、`final_inspection_report_file`、终检报告 `attachment_file_ids` 请求/响应和前端最小 file_id 输入；终检报告生成前仍要求最后工序 `OUT/PASS`，生成报告只允许专用权限内部账号，医生端读取报告和内部附件预览均返回 403。
- 明确项目技术方向：Vue3 + Element Plus + Spring Boot + RuoYi-Vue-Pro + MySQL + Redis + MinIO + Uppy + 后端 ai-gateway + DeepSeek。
- 明确一期口径：9 条预定义工序链写入数据库，不做后台拖拽编辑器。
- 从 `.local-context/API规范_OpenAPI3.0.yaml` 修复并冻结稳定 OpenAPI 契约到 `docs/api/openapi.yaml`。
- 已修复 `duration_efficiency` 和 `standard_duration` 缺少冒号后空格导致的 YAML/OpenAPI 解析问题。
- 已合并重复 `/form-configs` path，保留 GET 和 POST。
- 已验证接口契约可被 Swagger/OpenAPI 工具解析，且 56 个 operation 覆盖既定模块。
- 已读取新版 TRD V1.1，确认其作为当前开发计划修订依据。
- 已将文件上传、AI 适配层、轻量 DAG、通知事实来源、专项测试矩阵等默认执行口径写入项目计划。
- 已新增 `docs/development/task-1-preflight.md`，记录任务 1 的本机环境预检、路线选择和验收边界。
- 已新增 `docs/development/task-1-execution-checklist.md`，记录任务 1 推荐基线、三条路线的开始检查、验收命令和禁止事项。
- 已新增 `tasks/TASK-002-project-skeleton-initialization.md`，把任务 1 拆成可执行任务文件，并加入 RepoFrame machine acceptance。
- 已执行任务 1 路线 A：安装 Homebrew `openjdk@21` 与 `maven`，并通过 `scripts/with-jdk21.sh` 固定项目命令使用 JDK 21。
- 已新增后端 Maven 多模块骨架：`backend/`，包含 `platform-server` 和 TRD V1.1 规划的 13 个模块边界。
- 已新增前端 Vue3 + Element Plus 骨架：`frontend/`。
- 已新增 `compose.yaml`、`.env.example`、根目录 `package.json`、`pnpm-workspace.yaml` 和工具脚本。
- 已启动 Colima，并通过 Docker Compose 拉起 MySQL、Redis、MinIO，三者均 healthy。
- 已完成任务 2：后端接入 MySQL + Flyway SQL，新增 TRD V1.1 核心表迁移和 9 条工序链种子数据。
- 已实现最小只读 Workflow API：`GET /workflow-chains`、`GET /workflow-chains/{chainId}/nodes`。
- 已按 `.local-context/生产流程.docx` 初始化 9 条工艺链，支持取模分支、贴面路线分支、种植基台分支和可选节点表达。
- 已完成任务 3：新增订单内部/外部状态枚举、`OrderStatusService`、`OrderStatusProjector`、医生端 `DoctorOrderVO`、内部端 `OrderInternalDTO`、AI-3 `DoctorOrderAssistantReadModel`。
- 已新增 Flyway `V3__order_status_projection_foundation.sql`，补齐订单状态投影基础字段、索引和外部状态默认值。
- 已实现最小订单详情、医生确认收货、医生端 AI-3 查询和医生访问工序实例 403 的烟测接口。
- 已用自动化测试和 HTTP smoke 验证医生端不返回 `internal_status`、`production_note`、`cs_user_id`、工序/员工/返工/工时等内部字段。
- 已完成任务 4：接入 MinIO Java SDK，新增文件上传 token、complete、预览/下载签名 URL 和医生端文件访问策略。
- 已新增 Flyway `V4__file_upload_access_foundation.sql`，为 `file_resource` 增加 `upload_status` 和查询索引。
- 已实现医生端文件访问边界：医生只能访问本人/本诊所且 `visibility` 为 `DOCTOR`、`DOCTOR_CS`、`ALL` 的已完成文件。
- 已验证上传 token、complete、preview、download 和拒绝访问均写入 `file_access_audit`。
- 已完成任务 5A：新增生产审核触发工序实例化、实例节点/边快照、节点 READY/IN_PROGRESS/COMPLETED/SKIPPED 状态机、派工/转派和我的任务池。
- 已新增 Flyway `V5__workflow_runtime_skip_metadata.sql`，为可选节点跳过记录 `skipped_at` 和 `skip_reason`。
- 已实现 DAG 激活规则：无前置节点初始 READY；后置节点只有在全部前置节点 COMPLETED 或 SKIPPED 后才进入 READY。
- 已验证医生端访问工序实例仍返回 403，模板变更不会影响已生成实例快照。
- 已完成任务 5B：新增入检/出检记录、出检失败返工、工时开始/暂停/继续/完成、绩效统计的最小只读接口。
- 已实现入检门禁：`need_in_check=1` 的节点必须存在通过的入检记录，才能从 `READY` 开工。
- 已实现出检时序：出检只允许在节点 `COMPLETED` 后提交；出检失败会写 `rework_record`，并把返工目标节点重新置为 `READY`，不删除历史 `check_record` / `work_log`。
- 已实现服务端工时计算：暂停段写入 `work_log_pause_segment`，完成工时时扣除暂停时长；同一节点返工后会生成新的 `work_log`，不覆盖原记录。
- 已实现绩效只读统计：WORKER 查询强制限定本人，ADMIN 可按 `user_id` 查询指定员工。
- 已完成任务 6：新增消息、设计稿、账单、物流和通知事实落库的后端最小链路。
- 已实现生产端消息待客服审核、审核后医生可见；医生端只读取已审核或直达的公开消息。
- 已实现设计稿上传、客服审核、医生确认/驳回的最小状态流转，并按事件写入 `notification_event` / `user_notification`。
- 已实现账单上传与物流发货；物流发货会通过 `OrderStatusService` 把医生端外部状态更新为 `SHIPPED`。
- 已验证医生端消息、设计稿、账单物流和订单详情不返回内部生产备注、内部状态等敏感字段。
- 已完成任务 7：新增后端最小 AI Gateway，覆盖 AI-1 翻译助手、AI-2 客服查询助手、AI-3 客户订单助手、AI-4 资料缺失检查助手、AI-5 生产备注助手。
- 已实现 5 个 AI 智能体的角色白名单、固定上下文类型、deterministic 安全占位输出和 `ai_audit_log` 审计落库。
- 已把 AI-3 接入 `DoctorOrderAssistantReadModel`，医生询问内部工序、员工、返工、工时、绩效等问题时返回安全拒绝，只补充公开状态/账单/物流/公开消息。
- 已实现 AI-4 基于 `form_field_config.required_flag` 与订单 `form_data` 的资料缺失检查，并保留医生端数据范围校验。
- 已启动任务 8A：依据 PRD 12 步主链路、TRD V1.1 专项测试矩阵和团队文档 M6 标准，新增专项验收矩阵、回归记录和上线 readiness 清单。
- 已新增 `docs/acceptance/task-8-acceptance-matrix.md`，用 `PASS / PARTIAL / BLOCKED / NOT_STARTED` 客观标注当前验收状态。
- 已新增 `docs/acceptance/task-8-regression-record.md`，记录本轮自动化检查、HTTP/SQL smoke 与既有测试覆盖。
- 已新增 `docs/deployment/readiness-checklist.md`，明确正式上线前必须补齐 RBAC/DataScope、WebSocket、前端页面、真实密钥配置、HTTPS、备份、MinIO 隔离、DeepSeek 接入等缺口。
- 已完成 Task 8A 本轮回归：acceptance、toolchain、Compose config、OpenAPI、前端 build、后端 Maven test 和 HTTP/SQL smoke 均已记录；正式上线结论保持 `NOT READY`。
- 已完成任务 8B：`docs/api/openapi.yaml` 已同步任务 4-7 当前后端基线，补齐 60 个唯一 `operationId`、统一 4xx/503/default 错误响应、文件 complete、工序节点 start/complete/skip 等缺失契约。
- 已新增 `scripts/check-openapi-contract.rb`，并把 `npm run check:openapi` 升级为自定义契约检查 + Swagger validate + Redocly lint；当前 Redocly warning 已清零。
- 已启动任务 9A：新增服务端签发 HMAC Bearer token、请求级身份上下文和 Bearer 身份 filter；接口优先使用 `Authorization: Bearer ...` 身份，`X-Bootstrap-*` 仅保留为本地烟测兼容路径。
- 已新增 `BearerIdentityTests`，验证 Bearer 医生身份下的医生端脱敏、跨医生 403，以及关闭 bootstrap header 后缺少 Bearer token 返回 401。
- 已推进任务 9B 第一增量：新增 `AccessControlService`，集中后端角色权限和数据范围守卫。
- 已修复派工/转派接口不读取当前身份的问题；现在仅 CS/ADMIN 可派工、转派和跳过可选节点。
- 已收紧内部检查记录与绩效范围：医生端不得读取 `check_record`，WORKER 只能看本人绩效，ADMIN 才能按 `user_id` 查询，CS/医生不能查绩效。
- 已新增 Bearer 回归：WORKER Bearer token 不能派工/跳过节点，DOCTOR Bearer token 不能读入检/出检记录，CS Bearer token 不能查员工绩效。
- 已推进任务 9B.2：新增 Flyway `V6__auth_rbac_datascope_foundation.sql`，建立 `system_user`、`system_role`、`system_permission`、`system_user_role`、`system_role_permission` 过渡表和本地种子账号。
- 登录接口已从硬编码 ADMIN 改为数据库账号校验；本地种子账号使用 PBKDF2-SHA256 hash，占位密码仅用于本地开发。
- Bearer token 已携带数据库解析出的 `username`、`user_id`、`clinic_id`、`permissions` 和 `data_scope`；`/api/auth/me` 可返回当前账号权限信息。
- 前端骨架登录 smoke 已改为显示真实登录账号、角色和 data scope。
- 已完成任务 9B.3：新增 `@RequirePermission`、`PermissionInterceptor`、`PermissionWebConfiguration`，将订单、文件、AI、Workflow Runtime、Check/WorkLog/Performance、消息、设计稿、账单物流等 Controller 入口纳入统一权限注解校验。
- 已新增 `PermissionInterceptorTests`，覆盖数据库医生账号可读本人脱敏订单但不能访问客服 AI、数据库工人账号不能派工且绩效强制本人、数据库客服账号不能读绩效。
- 已推进任务 9B.4 第一增量：新增 `BootstrapIdentityArgumentResolver`，业务 Controller 不再直接声明 `X-Bootstrap-*` 参数，兼容逻辑收口到统一身份解析器。
- 已将订单详情 / AI-3 安全读模型 / 内部订单详情 / 工序实例读取改为查询级 DataScope 过滤：`ALL` 可读全部，`CLINIC` 限定诊所或医生本人，`SELF` 限定医生/客服本人或已分配工序节点。
- 已补充 `PermissionInterceptorTests` 的数据库工人 SELF DataScope 回归：未分配节点时读取订单和工序实例返回 403，分配节点后允许读取。
- 已完成任务 9B.5 第一增量：文件读取/预览、上传 token 订单范围、消息/设计稿/账单物流订单范围、AI 内部上下文读取均加入查询级 DataScope 过滤。
- 已补充 `PermissionInterceptorTests` 的数据库工人 SELF DataScope 回归：未分配节点时读取消息和文件预览返回 403，分配节点后允许读取。
- 已完成任务 9B.6 第一增量：新增 RuoYi 风格 `system_dept`、`system_post`、`system_menu`、`system_role_menu`、`system_user_post` 基础表和种子数据。
- 登录与 `/api/auth/me` 已返回当前账号可见菜单；前端骨架已按后端菜单权限显示工作入口，医生账号不会显示内部订单或系统权限入口。
- 已完成任务 9B.7 第一增量：新增生产鉴权启动门禁，`prod` profile 禁止启用 `X-Bootstrap-*` 本地兼容，并要求 `APP_AUTH_TOKEN_SECRET` 使用非本地占位密钥。
- 已新增 `application-prod.yml`，生产 profile 默认 `allow-bootstrap-headers=false` 且不提供 token secret 默认值；新增 `AuthStartupValidatorTests` 覆盖生产门禁和非生产开关同步。
- 已完成任务 9C.1 第一增量：新增真实 WebSocket 通知通道 `/ws/connect?token=...`，握手时校验 Bearer token，在线用户收到 `notification_event` 脱敏 payload 后写 `user_notification.delivered_at`。
- 已新增 `NotificationWebSocketTests`，覆盖医生 Bearer token 建立 WebSocket、账单通知在线推送、内部备注不出现在 payload、送达时间落库。
- 已完成任务 9C.2 第一增量：新增通知列表、未读数、单条已读、全部已读 REST 接口，并按当前用户 `user_notification.user_id` 强制隔离。
- 已新增 `NotificationRestTests`，覆盖当前用户只读本人通知、未读数、单条已读、全部已读和他人通知隔离。
- 前端骨架已新增登录后的「通知中心」入口，支持未读徽标、刷新、单条已读和全部已读。
- `docs/api/openapi.yaml` 已同步 9B.8 Refresh Token/logout 契约；当前为 61 个 path / 72 个 operation / 72 个唯一 `operationId`。
- 已完成任务 9C.3 第一增量：前端通知中心登录后建立 `/ws/connect` WebSocket，收到实时通知后刷新通知列表和未读数，并显示连接状态。
- 已新增 Redis 通知广播第一增量：`NotificationBroadcaster`、`NotificationRedisBroadcaster`、`NotificationRedisBroadcastListener` 和条件化 Redis listener container；默认关闭，通过 `NOTIFICATION_REDIS_BROADCAST_ENABLED=true` 开启。
- 已新增 `NotificationBroadcastTests`，覆盖本机无在线 session 时仍发布广播、远端广播不会自回环且会触发本机投递。
- 已完成本地真实 `/ws` 代理 smoke：doctor 通过 Vite `/api/auth/login` 登录并连接 `ws://localhost:5173/ws/connect`，admin 调用 `/orders/{orderId}/bill` 后收到 `BILL_UPLOADED` 实时 payload。
- 已完成任务 9D.1 第一增量：实现 `GET /orders` 后端订单列表，医生端列表强制限定本人订单并返回脱敏 `DoctorOrderVO`；前端新增「医生订单工作台」，可读取订单列表/详情、公开消息、设计稿、账单物流，并可调用医生 AI、确认收货和处理待确认设计稿。
- 已新增 `scripts/check-task-9d1-frontend.mjs` 和 `npm run check:task9d1`，并把 9D.1 后端列表、前端工作台和 Vite `/orders`、`/ai` 代理纳入 `acceptance.json` 关键检查。
- 已按本轮交接要求回写 `STATUS.md`、`DECISIONS.md`、`tasks/README.md`、`README.md`：明确 9D.1 是医生订单读取侧第一增量，下一步锁定 9D.2 医生下单/动态表单/上传入口第一增量，Task 8 总体仍保持 `NOT READY`。
- 已完成任务 9D.2 第一增量：新增 `GET /form-configs` 只读动态表单、`POST /orders` 医生提交订单、本人已完成医生可见文件绑定校验、`V8__doctor_order_entry_form_seed.sql` 默认表单字段、前端「新建订单」面板和 `npm run check:task9d2`。
- 9D.2 提交订单后进入 `PENDING_CS_REVIEW` / `PENDING_REVIEW`，响应保持医生端脱敏；9D.2 当时不实现草稿、真实上传、客服审核、生产审核或工序实例化。
- 已完成任务 9D.3 第一增量：新增 `POST /orders/{orderId}/review` 客服初审通过/驳回接口、`GET /orders?internal_status=PENDING_CS_REVIEW` 内部待审过滤、状态历史和医生通知事实；前端 `/orders/internal` 复用内部订单菜单新增「客服初审」最小页面。
- 9D.3 审核通过仅进入 `PENDING_PRODUCTION_REVIEW` / `PENDING_REVIEW`，不触发生产审核、不实例化工序；驳回进入 `CS_REJECTED` / `PENDING_REVIEW`，医生端仍只看外部投影。
- 已完成任务 9D.4 第一增量：生产审核接口新增状态门禁，仅允许 `PENDING_PRODUCTION_REVIEW` 订单进入生产审核；前端 `/workflow/review` 新增「生产审核」最小页面，可按待生产审核列表选择订单、选择工序链、填写入口路线/分支参数并触发工序实例化或驳回。
- 9D.4 审核通过进入 `PROCESS_INSTANCE_CREATED` / `PRODUCING` 并生成工序实例快照；本轮不实现生产任务池页面、派工页面、入检/出检/工时页面、复杂 Uppy 上传或真实 DeepSeek。
- 已完成任务 9D.5 第一增量：前端 `/workflow/process-instance` 新增工序实例详情、`/workflow/assign` 新增派工/转派、`/tasks/mine` 新增工人任务池；复用既有 `GET /orders/{orderId}/process-instance`、派工/转派和 `GET /tasks/mine` / 节点 start/complete 接口。
- 9D.5 只覆盖已实例化订单的工序查看、节点绑定员工和工人 READY/IN_PROGRESS/COMPLETED/PENDING 任务列表；本轮不实现入检/出检页面、工时暂停/继续/完成页面、返工处理页面或完整生产看板。
- 已完成任务 9D.6 第一增量：前端 `/checks` 新增入检/出检操作页，复用 worker 任务池选节点并调用 `/check-records`；前端 `/worklogs/self` 新增工时操作页，支持对本人进行中任务开始、暂停、继续和完成工时。
- 9D.6 只覆盖质检/工时页面级最小闭环；本轮不实现完整返工处理台、责任分类字典、绩效看板、生产通知联动或复杂生产看板。
- 已完成任务 9D.7 第一增量：前端 `/performance` 新增绩效统计页，复用既有 `GET /performance`，WORKER 留空查本人，ADMIN 可输入 `user_id` 查询指定员工。
- 9D.7 只展示后端当前返回的完成工序、有效工时、返工次数、准时率、通过率和工时效率；本轮不实现绩效明细、筛选周期、标准工时配置、申诉/补录或完整公式调整。
- 已完成任务 9D.8 第一增量：前端 `/production/board` 新增生产看板页，复用既有 `GET /orders` 跨内部状态检索订单，并读取 `GET /orders/{orderId}/process-instance` 展示节点进度快照。
- 9D.8 新增 `V9__production_board_menu_seed.sql` 为 ADMIN/CS 增加「生产看板」菜单；本轮不实现拖拽看板、实时推送、复杂筛选、节点编辑、终检或生产排产。
- 已完成任务 9D.9 第一增量：后端新增 `GET /reworks` 返工记录只读列表，WORKER 限定本人来源/目标节点，医生端禁止读取；前端 `/rework-final` 新增「返工终检」页面，可查看待返工记录并对已完成节点提交终检出检。
- 9D.9 新增 `V10__rework_final_menu_seed.sql` 为 ADMIN 和具备 `check:write` 的角色增加「返工终检」菜单；本轮不实现返工责任分类、返工关闭、终检报告、出货前拦截或真实 DeepSeek。
- 已完成任务 9D.10 第一增量：后端新增 MinIO Multipart 初始化、分片签名、complete 和 abort 接口，`file_resource` 记录 `upload_mode`、`multipart_upload_id`、分片大小和分片数；前端医生订单页新增最小 Uppy 文件选择、分片上传并回填 `file_id` 的入口。
- 已完成任务 9D.10 后续第一增量：后端新增 `GET /files/{fileId}/multipart/status`，返回已完成分片列表；前端医生上传入口新增本地恢复会话，重试时读取 status 并跳过已上传分片，同时保留手动取消未完成上传入口。
- 已完成任务 9D.10 后续第二增量：新增 Playwright 100MB+ 浏览器上传 smoke，`npm run smoke:task9d10-large-upload` 已通过，`file_id=457` 核验为 `COMPLETED / 110100480 bytes / MULTIPART / 21 parts`。
- 已完成任务 9D.10 后续第三增量：后端新增 `GET /files/multipart/pending?order_id=...`，按当前订单列出本人未完成 Multipart 候选且不暴露 `object_key`；前端医生上传入口在没有本地 `localStorage` 会话时，可按同订单、同文件名、同大小从服务端恢复 `file_id/upload_id` 后再读取 status。
- 已完成任务 9D.10 后续第四增量：新增 Playwright 上传中断后恢复 smoke，`npm run smoke:task9d10-interrupted-resume` 已通过，验证第 2 个分片人为中断后可保留本地 `doctor-order-upload:` 会话、读取服务端 `multipart/status`，并复用同一 `file_id=537` 继续完成上传。
- 已完成任务 9D.10 后续第四增量：新增 Playwright 服务端候选恢复 smoke，`npm run smoke:task9d10-server-resume` 已通过，确认无本地上传会话时浏览器复用预创建 pending Multipart；本轮记录 `file_id=514`、`order_id=1439`。
- 9D.10 仍只覆盖已选择/已创建订单的附件上传和绑定，不实现草稿上传、完整 Uppy Dashboard、真实弱网注入、完整跨设备浏览器验收或文件类型/数量最终限制。
- 已修复本地浏览器 smoke 阻塞：默认 CORS 同时允许 `http://localhost:5173` 与 `http://127.0.0.1:5173`，避免 Vite Local URL 登录时返回 `Invalid CORS request`；`BearerIdentityTests#databaseLoginAllowsLocalhostAndLoopbackViteOrigins` 已覆盖。
- 已修复 9D.2 动态表单浏览器读取缺口：`/form-configs` 已加入 Vite proxy，`npm run check:task9d2` 和 `acceptance.json` 已纳入代理检查。
- 本轮浏览器 smoke 已覆盖 doctor 在 `http://127.0.0.1:5173` 登录、进入「医生订单」、读取 REGULAR_CROWN 动态表单，并创建订单 `ORD20260630-9D94797093`，页面显示 `PENDING_REVIEW` 和医生端脱敏资料。
- 已确认 2026-07 新版资料默认对齐方案：不直接覆盖当前 OpenAPI/实现，保留 `/auth/me`、通知 REST、Multipart 断点恢复、返工接口、节点 start/complete/skip 等已验证增量；下一阶段优先补草稿/补资料闭环。
- 已完成任务 9D.11 第一增量：`POST /orders` 支持医生保存草稿，`PUT /orders/{orderId}` 支持医生本人编辑草稿、提交草稿和对 `CS_REJECTED / PRODUCTION_REJECTED` 订单补资料重新提交；前端医生订单工作台新增保存草稿、继续编辑/补资料和提交草稿/补资料入口。
- 9D.11 浏览器 smoke 已覆盖 doctor 在 `http://127.0.0.1:5173` 登录、保存草稿并提交草稿，测试订单 `ORD20260701-E172DF6DD8` 从 `DRAFT` 进入 `PENDING_REVIEW`。
- 已完成任务 9B.8 Refresh Token/logout 第一增量：新增 `auth_refresh_token` 哈希存储表；登录返回 `refreshToken` / `refreshExpiresAt`；`POST /api/auth/refresh` 可用有效 refresh token 换新 access token；`POST /api/auth/logout` 可吊销 refresh token；前端骨架新增「刷新 Token」和「退出登录」入口；浏览器 smoke 已覆盖 doctor 登录后刷新 Token 并退出回登录页。
- 已完成任务 9D.12 动态表单 CRUD 第一增量：新增 ADMIN `form:manage` 权限、`POST /form-configs`、`PUT /form-configs/{fieldId}`、逻辑停用 `status=INACTIVE`、后台「动态表单」菜单和前端最小新增/编辑/停用入口；医生端仍只读取 `ACTIVE` 字段。
- 9D.12 浏览器 smoke 已覆盖 admin 在 `http://127.0.0.1:5173` 登录、进入「动态表单」、创建字段、更新字段并停用字段，测试产品 `SMOKE_1782885092995` / 字段 `smoke_field_1782885092995` 最终从医生可读活动列表移除。
- 已完成任务 9D.13 设计稿多文件/多版本第一增量：新增 `design_draft_file` 关联表，保留 `design_draft.file_id` 作为兼容主文件；`POST /orders/{orderId}/design-drafts` 可把多个 `file_ids` 绑定到同一版本，响应新增 `file_ids` / `file_count`。
- 9D.13 前端第一增量已补：内部订单页可输入多个已完成 `file_id` 上传新版设计稿，医生订单工作台可显示同一版本多个文件 ID 和文件数；浏览器 smoke 已覆盖订单 `9D13-1782887063685`、文件 `761/762`，医生端可见且未泄露 `9D13_INTERNAL_NOTE_DO_NOT_LEAK`。
- 已完成任务 9D.14 终检发货拦截第一增量：`POST /orders/{orderId}/logistics` 发货前必须存在订单最后一道工序节点的 `OUT/PASS` 终检出检记录；缺失时返回 409，且不写物流、不更新 `SHIPPED`、不发送发货通知。
- 9D.14 前端第一增量已补：生产看板详情新增承运商、物流单号和「录入物流并发货」入口，后端 409 时展示“终检出检通过后才能发货”。
- 9D.14 浏览器 smoke 已覆盖 admin 在生产看板搜索订单 `9D14-1939db70751a`，录入物流 `SF-1782889291788` 后页面显示发货成功，数据库核验订单和物流均为 `SHIPPED`。
- 已完成任务 9D.15 真实 DeepSeek 接入第一增量：新增 `app.ai` 配置、`DeepSeekAiModelClient`、OpenAI-compatible `/chat/completions` 调用、AI-1/AI-2/AI-3 公开问答/AI-5 的真实模型适配，以及无 key/未启用时的 deterministic 安全回退。
- 9D.15 安全边界已补：AI-3 仍只使用 `DoctorOrderAssistantReadModel` 的外部状态、公开消息、账单和物流字段；医生询问内部工序/员工/工时等问题时继续本地 `SAFE_REFUSAL`，不向模型发送内部上下文。
- 9D.15 验收已补：`AiGatewayDeepSeekTests` 使用本地 stub 验证 DeepSeek 请求、Bearer key、模型名审计、completion tokens 和 AI-3 脱敏上下文；`npm run check:task9d15` 已纳入静态验收。
- 已完成任务 9D.16 终检报告第一增量：新增 `final_inspection_report` 表、`POST /final-inspection-reports` 和 `GET /final-inspection-reports/{orderId}`，生成报告前必须存在订单最后一道工序节点 `OUT/PASS` 终检出检记录。
- 9D.16 前端第一增量已补：在「返工终检」页面的终检入口增加报告摘要、生成终检报告按钮和报告结果展示；本地 Vite 已代理 `/final-inspection-reports`。
- 9D.16 验收已补：`CheckWorklogPerformanceTests#finalInspectionReportRequiresFinalOutPassAndIsInternalOnly` 先红后绿，覆盖缺终检通过 409、终检后生成报告、内部读取和医生端 403；`npm run check:task9d16` 已纳入静态验收。
- 已完成任务 9D.17 返工关闭 / 责任分类第一增量：新增 `V16__rework_close_metadata.sql`、`POST /reworks/{reworkId}/close` 和前端「关闭返工」最小入口；关闭前必须存在返工目标节点在来源失败检查之后重新 `OUT/PASS`。
- 9D.17 验收已补：`CheckWorklogPerformanceTests#reworkCanCloseOnlyAfterTargetOutPassAndKeepsResponsibilityClassification` 先红后绿，覆盖未重新出检通过 409、重新出检通过后关闭、写入原因分类/责任类型/关闭备注和 `DONE` 列表查询；`npm run check:task9d17` 已纳入静态验收。
- 已完成任务 9D.18 返工原因 / 责任类型字典第一增量：新增 `GET /reworks/dictionaries`，后端固定返回关闭返工可用 code，并在 `closeRework` 中拒绝未列入字典的原因分类或责任类型。
- 9D.18 前端第一增量已补：`/rework-final` 页面加载后端返工字典，关闭返工下拉选项不再硬编码在模板里；`npm run check:task9d18` 已纳入静态验收。
- 已完成任务 9D.19 返工通知联动第一增量：出检失败生成返工记录时写入 `REWORK_CREATED` 通知给目标 WORKER，返工关闭后写入 `REWORK_CLOSED` 通知给订单 CS。
- 9D.19 安全边界已补：返工通知只进入内部 `notification_event` / `user_notification`，测试覆盖医生用户不收到 `REWORK_CREATED` / `REWORK_CLOSED`。
- 已完成任务 9D.20 复杂返工影响范围第一增量：后道出检失败返到前道节点时，沿 `order_process_edge` 递归重置返工目标后续 `READY/COMPLETED` 节点为 `PENDING`，保留历史检查、工时和返工记录。

## 正在做什么

**当前执行指针为「部署到客户自有服务器」，卡在阶段一「本地全链路演练」尚未开始。**
这一步不依赖客户任何输入，可立即开工；目标是把 `deploy/docker-compose.phase-one.yml`
整套真跑起来、四端用浏览器点一遍。理由是这套部署产物**从未被完整跑起来过**——
2026-08-03 才发现生产 nginx 只代理了 3 个后端前缀而前端用 30 个，
管理端 RBAC 控制台在浏览器里一直是坏的而后端测试全绿。预期还会暴露同类问题，
不能放到客户机器上调试。详见 `docs/deployment/SESSION-HANDOVER-deployment.md`。

以下 GOAL-026 / TASK-027 段落是历史执行明细，不再代表当前执行指针。

当前执行指针为 GOAL-026 / TASK-027，已完成二期 M2 RuoYi 运行时渐进桥接第一批。后续本地开发优先接入现有权限/DataScope 与 RuoYi 规则接口的只读兼容适配；真实测试环境、Key、对象存储、标准工时、四份 PDF 手册和客户确认继续作为外部门禁。

以下按 9D 编号记录的内容是一期历史执行明细，不再代表当前 active goal。

Task 8 已完成 8A readiness audit、8B OpenAPI 二次契约、9A/9B/9C 身份权限与通知基线、9D.1 到 9D.25 的核心业务第一增量、9D.26 到 9D.48.2 的 AI 治理第一轮、9D.49 到 9D.54 的生产端质量/设备/物料异常/安环/成本/奖惩六类展示模块真实汇总接口第一轮适配、9D.55 返工字典后台维护第一增量、9D.56 终检专用角色 / 附件第一增量、9D.57 返工影响图形化第一增量、9D.58 客服协同闭环第一增量、9D.59 客服资料缺失提示与 AI 翻译草稿确认第一增量、9D.60 设计稿预览 URL 聚合第一增量和 9D.61 账单物流预览/录入闭环第一增量。任务 8 总体不标完成，后续仍需补完整 CRUD/审批/录入路径、演示种子数据、真实弱网限速/断网、完整跨设备续传、12 步主链路浏览器 smoke、绩效完整公式/周期、终检 PDF/签名/真实物流、通用 DataScope 覆盖、外部告警防重放/生产 webhook 联调、提示词后台管理、流式输出过滤、真实 key 联调、部署/操作手册等上线硬缺口。

当前已上传基线停在上述 9D.10 范围：同浏览器恢复、服务端 pending 候选恢复、上传中断后恢复和 100MB+ 浏览器 smoke 已作为可追溯结果保留；返工关闭/发货拦截、责任分类、跨设备恢复 smoke、限速上传 smoke 等后续尝试没有纳入当前上传基线。

本轮已完成 9D.36 三端/管理端前端视觉改造第一增量：依据客户旧版医生端、客服端、生产端 HTML 原型，把当前 Vue 单文件前端的登录后全页面统一为深色侧栏、顶部状态栏、角色主题色、页面说明区、业务卡片/列表/表单的工作台风格；2026-07-02 追加 product design 精修后，登录页更接近旧原型的深蓝窄卡片入口，侧栏增加中文分组菜单，主体常见后端状态码和产品类型已显示为中文。医生端、客服端、生产端、管理端四入口真实浏览器点击均已通过，错入口登录仍被服务端拒绝。本轮不新增后端接口、不调整权限、不搬运旧原型 mock/localStorage 逻辑；下一项开发入口建议继续做客户演示级业务细节、图表/空状态/录屏，或转回绩效周期筛选、返工影响图形化、生产级 AI 治理和部署交付材料。

本轮已完成 9D.37 AI 预算外部告警待发送事实第一增量：新增 Flyway `V19__ai_external_alert_outbox.sql` 和 `ai_external_alert_outbox` 表；预算跨线写入 `AI_BUDGET_EXCEEDED` 后、预算熔断命中写入 `AI_BUDGET_CIRCUIT_OPEN` 后，均生成 `send_status=PENDING` 的外部告警事实。payload 仅包含订单号、事件类型、预算阈值、近 24 小时估算成本和脱敏消息，不包含 prompt、模型响应、密钥或内部生产详情。本轮不接真实外部渠道、不写发送器、不新增环境变量。

本轮已完成 9D.38 AI 分角色预算第一增量：新增 Flyway `V20__ai_audit_actor_role.sql`，AI 审计开始记录 `actor_role`；新增 ADMIN / CS / DOCTOR / WORKER 四个角色日预算环境变量，默认 0 不启用；当 `AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 且对应角色近 24 小时成功调用估算成本达到角色阈值时，不外呼真实模型，返回 deterministic fallback，并写入 `AI_BUDGET_ROLE_CIRCUIT_OPEN` 治理审计和 `ai_external_alert_outbox` 待发送事实。本轮只做角色预算，不做分模型预算或管理 UI。

本轮已完成 9D.39 AI 分模型预算第一增量：新增 `AI_DEEPSEEK_DAILY_BUDGET_MICROUSD`，默认 0 不启用；当 `AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 且当前 `AI_DEEPSEEK_MODEL` 近 24 小时成功调用估算成本达到模型阈值时，不外呼真实模型，返回 deterministic fallback，并写入 `AI_BUDGET_MODEL_CIRCUIT_OPEN` 治理审计和 `ai_external_alert_outbox` 待发送事实。本轮只做 DeepSeek 当前配置模型的预算熔断，不做预算策略管理页面、成本趋势、真实外部发送器或真实 key 联调。

本轮已完成 9D.40 AI 提示词版本与输出防护第一增量：新增 `ai_audit_log.prompt_version` 和索引，AI-1/AI-2/AI-3/AI-4/AI-5 的审计均写入固定版本号；真实模型输出命中密钥、token、系统表、文件表或明确内部泄露模式时，不向调用方返回原文，改为“AI 输出已触发安全保护，请人工复核后再使用。”，并写入 `AI_OUTPUT_GUARDED` / `ai-governance-output-guard` 治理审计。本轮只做服务端固定版本和输出出口防护，不做提示词后台管理、流式输出过滤或真实外部告警发送器。

本轮已完成 9D.41 AI 外部告警发送器第一增量：新增 `AiExternalAlertSenderService#sendPendingAlerts`，按 `created_at, alert_id` 领取 `ai_external_alert_outbox` 的 `PENDING` 记录；`EXTERNAL_ALERT` 通道作为本地 dry-run 标记 `SENT` 并清空 `last_error`，未知通道标记 `FAILED` 并写入 `unsupported external alert channel` 错误，同时两类结果都会累计 `attempts`。本轮不接真实外部渠道、不新增密钥或环境变量、不做定时调度。

本轮已完成 9D.42 AI 成本趋势第一增量：新增 `GET /ai/governance/cost-trend?days=7`，复用 AI 治理权限，仅 CS / ADMIN 可访问；服务端按 `ai_audit_log.result_status=SUCCESS` 的成功模型调用聚合最近 1-31 天的 `success_count`、`estimated_cost_microusd` 和 `model_count`，并返回窗口总成功次数和总估算成本。本轮只做后端只读聚合和 OpenAPI 契约，不新增前端图表、不做导出、不接真实计费账单、不调整预算策略。

本轮已完成 9D.43 AI 真实外部渠道适配第一增量：新增 `app.ai.external-alert` 配置和 `AI_EXTERNAL_ALERT_WEBHOOK_*` 环境变量；`EXTERNAL_ALERT` 默认仍不外呼，显式启用 webhook 后才 POST outbox payload，发送成功标记 `SENT`。9D.45 后，非 2xx 或连接异常已改为有限重试/死信状态机。本轮只做通用 webhook 边界，不提交真实 webhook URL 或密钥，不接短信、邮件、企业微信 SDK，不做签名认证或生产联调。

本轮已完成 9D.44 AI 外部告警调度器第一增量：新增 `AiExternalAlertScheduler`、`@EnableScheduling` 和 `AI_EXTERNAL_ALERT_SCHEDULER_*` 配置。默认 `AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false`，即使调度方法被调用也不处理 outbox；显式启用后按 `AI_EXTERNAL_ALERT_SCHEDULER_BATCH_SIZE` 调用既有 sender 处理 `PENDING` outbox。本轮不做分布式锁、复杂重试、死信、签名认证、真实渠道密钥或生产 webhook 联调。

本轮已完成 9D.45 AI 外部告警重试/死信第一增量：新增 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS`，默认 3；webhook 失败时累计 `attempts` 并写 `last_error`，未达上限保持 `PENDING`，达到上限标记 `DEAD_LETTER`，避免调度器无限重复发送。本轮不做分布式锁、退避调度、死信管理页面、真实渠道密钥或生产 webhook 联调。

本轮已完成 9D.46 AI 外部告警幂等/并发领取第一增量：新增事务内 `SENDING` 领取态和 `claimAlert` 条件更新；sender 只有成功把 `PENDING` 领取为 `SENDING` 后才会 dry-run 或 webhook 外呼。并发测试覆盖第一条 webhook 被阻塞时第二个 sender 不会重复发送同一条 outbox。本轮不做签名/鉴权、退避调度、告警抑制、监控指标、真实渠道密钥或生产 webhook 联调。

本轮已完成 9D.47 AI 外部告警 webhook 签名/鉴权第一增量：新增 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED` 和 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET`；默认关闭签名，启用签名且 secret 非空时，sender 会按 request body 生成 `X-AI-Alert-Signature: sha256=<HMAC-SHA256>`。签名开启但 secret 为空时不会发送未签名 webhook，而是进入既有失败/重试/死信链路。本轮不提交真实 secret，不做 timestamp/nonce 防重放、接收端验签服务、生产 webhook 联调或真实外部渠道 SDK。

本轮已完成 9D.48 AI 外部告警监控/运维可观察第一增量：新增 `GET /ai/governance/external-alerts/summary`，复用 AI 治理权限，仅 CS / ADMIN 可访问；服务端按 `ai_external_alert_outbox.send_status` 聚合 `PENDING/SENDING/SENT/FAILED/DEAD_LETTER` 数量分布，返回最近一条 FAILED/DEAD_LETTER 错误和最老 PENDING 创建时间，并对错误摘要做基础脱敏。本轮不做真实 webhook 联调、短信/邮件/企业微信、人工重放、人工关闭、告警抑制或复杂运维后台。

本轮已完成 9D.48.1 AI 外部告警 outbox 列表/筛选第一增量：新增 `GET /ai/governance/external-alerts`，复用 AI 治理权限，仅 CS / ADMIN 可访问；支持 `send_status`、`event_type`、`created_at_from`、`created_at_to` 和 `limit` 最小筛选。响应只返回安全元数据，不返回 payload、last_error、真实 webhook URL、密钥、prompt 原文、模型原始响应或内部生产敏感详情。本轮不做人工重放、编辑、关闭或告警抑制。

本轮已完成 9D.48.2 AI 外部告警失败/死信可见性第一增量：`GET /ai/governance/external-alerts` 对 FAILED / DEAD_LETTER 记录返回 `attempts`、脱敏 `last_error` 和 `last_attempted_at`，用于 CS / ADMIN 安全排查失败/死信原因；脱敏覆盖真实 webhook URL、query token、Bearer token 和 `sk-*` 形式密钥。本轮不做重试按钮、死信恢复、人工处理状态、编辑、关闭、告警抑制或生产 webhook 联调。

本轮已完成 9D.54 生产端奖惩管理汇总后端适配第一增量：新增 Flyway `V26__production_reward_penalty_foundation.sql`、`production_reward_penalty_record` 事实表、`GET /production/reward-penalty/summary`、`ProductionRewardPenaltySummaryResponse`、OpenAPI 契约、前端“真实奖惩汇总”卡片区和 `npm run check:task9d54` 静态检查。生产/客服/管理可读，医生端访问返回 403；真实浏览器已覆盖生产端入口登录、点击左侧“奖惩管理”，页面显示奖惩记录、奖惩原因、关联对象、审批状态、月度汇总和绩效影响，且无汇总加载失败或 HTML 解析错误。本轮只做只读汇总，不新增奖惩录入、审批流、申诉、绩效结算或正式演示种子数据。

## 未完成事项

- 明确 Multipart 阈值、动态表单字段最终清单、AI-5 模板等客户/PM 仍需确认项；动态表单后台 CRUD 第一增量已完成，但字段最终清单和复杂表单设计器不在本轮范围。
- 后续补完整返工处理台、绩效完整公式/周期/申诉/标准工时配置、终检 PDF/签名/真实物流和完整生产看板；任务 5B 已完成后端最小执行接口和烟测，任务 9D.5 已补生产任务池和派工第一增量，任务 9D.6 已补入检/出检和工时操作页面第一增量，任务 9D.7 已补绩效管理页面第一增量，任务 9D.8 已补跨状态生产看板第一增量，任务 9D.9 已补返工记录只读和终检出检入口第一增量，任务 9D.14 已补发货前终检出检通过门禁第一增量，任务 9D.16 已补终检报告生成/读取第一增量，任务 9D.17 已补返工关闭/原因分类/责任类型第一增量，任务 9D.18 已补后端固定返工字典和关闭校验第一增量，任务 9D.19 已补返工创建/关闭内部通知第一增量，任务 9D.20 已补返工目标后续 `READY/COMPLETED` 节点重置第一增量，任务 9D.22 已补返工影响节点审计字段第一增量，任务 9D.23 已补返工影响筛选第一增量，任务 9D.25 已补绩效明细第一增量，任务 9D.56 已补终检专用权限和内部附件绑定第一增量，任务 9D.57 已补返工影响图形化第一增量。
- 后续把 WebSocket 通知接入生产级 Nginx/HTTPS、压测、监控和真实多实例联调；任务 6 已完成通知事实表和未读补偿的最小链路，任务 9C.1 已完成单实例 WebSocket 在线推送，任务 9C.2 已完成通知 REST 与前端入口，任务 9C.3 已完成前端实时刷新、Vite `/ws` 代理 smoke 和 Redis 广播代码路径第一增量。
- 后续接入正式 RuoYi-Vue-Pro 权限体系；当前已支持数据库账号登录、服务端签发 Bearer token、refresh token 哈希存储/刷新/logout 吊销、权限码/data_scope、基础菜单/部门/岗位表、前端按菜单权限显示入口、集中式后端权限守卫、Controller 权限注解拦截，以及订单、工序实例、文件、协同订单范围、AI 内部上下文的部分 SQL DataScope 过滤；`X-Bootstrap-*` 仍作为统一解析器中的本地烟测兼容路径存在，但生产 profile 已新增启动门禁，要求关闭该兼容路径并配置真实 token secret。
- 后续把 AI Gateway 的第一增量 DeepSeek 适配升级为生产级模型治理：9D.26 到 9D.48.2 已补每用户小时限流、单次成本审计、短暂失败重试、模型失败审计、治理摘要、预算阈值、预算跨线审计、内部通知第一增量、通知策略开关、预算熔断/降级第一增量、外部告警待发送事实第一增量、分角色预算第一增量、分模型预算第一增量、提示词版本审计、输出防护第一增量、外部告警发送器本地 dry-run 状态机、成本趋势第一增量、webhook 真实发送边界、默认关闭调度器、有限重试/死信、幂等/并发领取、webhook HMAC 签名、outbox 监控摘要、outbox 列表筛选和失败/死信只读可见性第一增量；仍缺接收端验签/防重放联调、提示词后台管理、流式输出过滤、生产 webhook 联调和真实 key 环境验收。AI-3 必须继续只读 `DoctorOrderAssistantReadModel`。
- 后续补 AI-1/AI-2/AI-5 更完整的模板和人工确认页面；当前只返回草稿或查询结果，不自动写业务字段。
- 后续补真实弱网限速/断网、完整跨设备续传、文件类型/数量最终限制和完整草稿上传体验；任务 9D.10 已完成 Multipart 第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器 smoke，任务 9D.11 已补医生订单草稿/补资料第一增量，但仍不是完整大文件上传上线验收。
- 后续把 Workflow Runtime 接入正式 RuoYi DataScope SQL 过滤、通知事件、前端任务池和生产看板。
- 后续把 Check/WorkLog/Performance 接入正式 RuoYi DataScope SQL 过滤、通知事件和更完整的绩效维度。
- 后续补完整客服协同页面、完整返工/终检闭环和正式生产看板等业务页面；任务 9D.1 已补医生订单读取工作台，任务 9D.2 已补医生下单第一增量，任务 9D.3 已补客服初审第一增量，任务 9D.4 已补生产审核第一增量，任务 9D.5 已补生产任务入口第一增量，任务 9D.6 已补质检工时第一增量，任务 9D.7 已补绩效管理第一增量，任务 9D.8 已补生产看板第一增量，任务 9D.9 已补返工终检第一增量，任务 9D.10 已补 Multipart 上传第一增量、本地恢复上传第一增量和服务端候选恢复第一增量，任务 9D.12 已补动态表单后台 CRUD 第一增量，任务 9D.13 已补设计稿多文件/多版本第一增量，任务 9D.14 已补生产看板最小发货入口和服务端终检门禁，但仍不是完整业务前端。
- 任务 9D.2/9D.10/9D.11 尚未覆盖真实弱网限速/断网、完整跨设备浏览器验收、实时自动保存和完整 Uppy Dashboard；100MB+ 本地浏览器 smoke、无本地会话服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke、医生草稿和补资料重新提交第一增量已补。
- 任务 9D.3 尚未覆盖 AI 翻译草稿写入生产指令、资料缺失提示页面和完整客服消息/账单物流页面；补资料再提交第一增量已由 9D.11 补齐。
- 任务 9D.7/9D.21/9D.25/9D.66/9D.74 已覆盖绩效汇总、责任归因、最近完成工时明细、周期筛选、标准工时覆盖率和开发默认公式第一增量，尚未覆盖标准工时配置、客户/PM 正式公式确认、绩效申诉/补录、导出、工资发放和生产通知联动；任务 9D.8 尚未覆盖拖拽/泳道生产看板、复杂筛选、实时刷新和排产；任务 9D.9/9D.14/9D.16/9D.56 已覆盖返工责任分类、返工关闭、终检报告、终检专用权限和内部附件绑定第一增量，但仍缺终检 PDF/签名、真实物流平台和生产通知联动。
- 后续清理 Task 8A 矩阵里的 `PARTIAL`、`BLOCKED`、`NOT_STARTED` 项，优先级建议为正式 RBAC/DataScope、WebSocket 通知、医生/客服/生产/管理端页面、终检报告/完整返工闭环和生产级 AI 治理。
- 后续把 `docs/acceptance/task-8-acceptance-matrix.md` 转成测试工程师可逐项执行的浏览器用例和缺陷追踪清单。

## 已知问题 / 阻塞

- 本机已安装 Homebrew `openjdk@21` 和 `maven`；同时 Homebrew 也安装了 `openjdk` 26 作为 Maven 依赖。项目命令通过 `scripts/with-jdk21.sh` 显式使用 JDK 21。
- 浏览器点击级验收已覆盖医生菜单权限、通知中心、9D.1 医生订单工作台、9D.2 医生动态表单/下单、9D.7 绩效统计、9D.8 生产看板、9D.11 医生草稿/补资料和 9D.12 动态表单 CRUD 第一增量；完整 12 步主链路浏览器验收仍未完成。
- Docker Compose 基础服务使用占位密码，仅用于本地开发；真实凭据不得提交。
- Flyway 启动时提示 MySQL 8.4 新于当前 Flyway 已测试版本，属于兼容性 warning；本轮迁移与测试已在本机 MySQL 8.4 通过。
- `standard_duration` 暂无客户真实标准工时，本轮迁移允许为空，不伪造工时。
- `.local-context/生产流程.docx` 中存在孤立重复箭头和贴面/隐形流程排版不连续；本轮已按源文档节点顺序标准化为顺序边，并保留分支字段表达。
- 当前医生端/内部端订单详情接口仍是最小验收实现；已覆盖订单列表、医生创建、客服初审、生产审核和生产任务入口第一增量，但尚未覆盖设计稿、账单物流完整业务页面。
- `GET /orders/{orderId}/process-instance` 已实现内部角色查询、医生端 403 和 WORKER SELF SQL DataScope；业务 Controller 不再直接解析 `X-Bootstrap-*`。
- `POST /check-records`、`POST /work-logs/*`、`GET /performance` 已实现后端最小链路；业务 Controller 不再直接解析 `X-Bootstrap-*`，但统一身份解析器仍保留本地 smoke 兼容。
- `POST /orders/{orderId}/messages`、`POST /messages/{msgId}/review`、`POST /orders/{orderId}/design-drafts`、`POST /orders/{orderId}/bill`、`POST /orders/{orderId}/logistics` 已实现后端最小链路；业务 Controller 不再直接解析 `X-Bootstrap-*`，协同类订单范围已加入查询级 DataScope 过滤，但仍未接入通用 RuoYi DataScope SQL 拦截器。
- Multipart 阈值、文件大小/类型/数量限制仍需 PM/客户最终确认；当前本地默认最大文件 200MB，预签名上传/预览 15 分钟，下载 2 小时。
- 任务 9C.1 已实现单实例 WebSocket 长连接推送，任务 9C.2 已实现通知列表、未读/已读 REST 接口和前端通知中心入口，任务 9C.3 已实现浏览器 WebSocket 实时接入、Vite `/ws` 代理 smoke 和 Redis 广播代码路径；仍未完成真实双后端实例 Redis 联调、生产 Nginx/HTTPS、心跳策略、监控和压测，正式在线通知仍为 `PARTIAL`。
- 任务 9D.1 已实现 `GET /orders` 列表和医生订单工作台第一增量；任务 9D.2 已实现医生读取动态表单、提交订单和绑定本人已完成文件的第一增量；任务 9D.3 已实现客服待审过滤、通过/驳回和前端客服初审入口第一增量；任务 9D.4 已实现生产待审过滤页面、工序链选择和生产审核触发工序实例化第一增量；任务 9D.5 已实现工序实例详情、派工/转派和工人任务池第一增量；任务 9D.6 已实现入检/出检和工时操作页面第一增量；任务 9D.7 已实现绩效统计页面第一增量；任务 9D.8 已实现生产看板跨状态检索和节点进度第一增量；任务 9D.9 已实现返工记录只读列表和终检出检入口第一增量；任务 9D.10 已实现 Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke 和 100MB+ 浏览器 smoke；任务 9D.11 已实现医生草稿/补资料第一增量；任务 9D.12 已实现动态表单后台 CRUD 第一增量；任务 9D.13 已实现设计稿多文件/多版本第一增量；任务 9D.14 已实现发货前终检出检通过门禁第一增量；任务 9D.15 已实现真实 DeepSeek 接入第一增量；任务 9D.16 已实现终检报告第一增量；任务 9D.17 已实现返工关闭/原因分类/责任类型第一增量；任务 9D.18 已实现返工字典接口和关闭校验第一增量；任务 9D.19 已实现返工创建/关闭内部通知第一增量；任务 9D.20 已实现返工目标后续节点影响范围重置第一增量；任务 9D.21 已实现绩效归因联动第一增量；任务 9D.22 已实现返工影响审计可视化第一增量；任务 9D.23 已实现返工影响筛选第一增量；任务 9D.25 已实现绩效明细第一增量；任务 9D.56 已实现终检专用权限和内部附件绑定第一增量；任务 9D.57 已实现返工影响图形化第一增量；任务 9D.60 已实现医生端设计稿预览 URL 聚合第一增量；医生列表/详情/下单、上传、客服初审、生产审核、派工任务池、质检工时、绩效、绩效责任归因、绩效工时明细、返工影响审计字段、返工影响筛选、返工影响图、生产看板、返工终检入口、返工关闭、返工通知、返工影响范围重置、终检报告、终检附件、动态表单后台管理、设计稿多文件版本、设计稿预览链接、发货门禁、AI DeepSeek 适配、OpenAPI、前端构建和浏览器 smoke 部分已通过，但完整弱网/跨设备续传、完整客服协同、账单物流闭环、绩效完整公式/周期/申诉/标准工时配置、终检 PDF/签名、生产级 AI 治理和正式生产看板仍未完成。
- 任务 9D.15 已补 DeepSeek OpenAI-compatible 适配和 model_name/token 审计第一增量；9D.26 到 9D.48 已补限流、成本、重试、失败审计、治理摘要、预算阈值、预算跨线审计、内部通知第一增量、通知策略开关、预算熔断/降级、外部告警待发送事实第一增量、分角色预算第一增量、分模型预算第一增量、提示词版本审计、输出防护第一增量、外部告警发送器本地 dry-run 状态机、成本趋势第一增量、webhook 真实发送边界、默认关闭调度器、有限重试/死信、幂等/并发领取、webhook HMAC 签名和 outbox 监控摘要第一增量；仍未实现 outbox 列表/筛选、失败/死信详情可见性、流式输出、提示词后台管理、真实 key 联调记录和更完整的生产级输出策略。
- 本轮任务 7 的 AI-2 内部查询仍是最小订单摘要，尚未接入完整客服知识上下文、工序实例明细聚合或消息/文件预览 URL 聚合。
- 本轮任务 7 的 AI-5 生产备注模板仍未收到客户最终版，当前只生成通用草稿，不写入订单字段。
- Task 8A 已明确当前不能正式上线：仍缺完整 RuoYi RBAC/DataScope、完整前端业务页面、WebSocket 生产网关/真实多实例验收、生产级 AI 治理、完整弱网/跨设备续传、生产级部署配置和操作手册；9D.1/9D.2/9D.3/9D.4/9D.5/9D.6/9D.7/9D.8/9D.9/9D.10/9D.11/9D.12/9D.13/9D.14/9D.15/9D.16 只推进了医生端订单读取、医生下单、客服初审、生产审核、生产任务入口、质检工时、绩效管理、生产看板、返工终检、Multipart 上传、本地恢复上传、服务端候选恢复、上传中断后恢复、100MB+ 浏览器 smoke、医生草稿/补资料、动态表单 CRUD、设计稿多文件/多版本、终检发货拦截、DeepSeek 适配和终检报告第一增量。
- 任务 9A/9B.1/9B.2/9B.3/9B.4/9B.5/9B.6/9B.7/9B.8 第一增量已完成服务端 Bearer 身份基线、后端集中权限守卫、数据库化账号/角色/权限/DataScope 基础、基础菜单/部门/岗位、前端权限路由、权限注解统一拦截器、统一身份参数解析、部分查询级 DataScope 过滤、生产鉴权启动门禁和 refresh token/logout 第一增量；尚未接入完整 RuoYi 管理 UI、通用 SQL 拦截器、refresh token 轮换/accessToken 黑名单/多设备会话管理和生产级 Spring Security/JWT，正式环境必须关闭 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS` 并配置真实 `APP_AUTH_TOKEN_SECRET`。
- 本机数据库保留历史 smoke/测试追加数据，`GET /workflow-chains` 当前总数大于 9；Task 8A 已按“不清理数据库”的约束验收 9 条预定义链存在，正式验收应在干净测试库或固定快照库复跑。
- 动态表单字段最终清单、设计稿阻塞关系、AI-5 模板、标准工时和预计发货算法仍需 PM/客户确认。
- 进行中订单是否允许 ADMIN 调整节点仍需确认；默认不允许增删节点，只允许员工绑定/转派。
- `docs/api/openapi.yaml` 当前已通过自定义契约检查、Swagger validate 和 Redocly lint；9D.48 后已补 Multipart 上传、status 恢复、pending 恢复候选接口、refresh/logout 接口、`LoginRequest.portal` 登录入口枚举、动态表单 create/update/status schema、设计稿多文件、终检发货门禁、DeepSeek 适配、终检报告接口、返工关闭接口、返工字典接口、`REWORK_CREATED` / `REWORK_CLOSED` 通知事件说明、`AI_BUDGET_EXCEEDED` 预算通知、`AI_BUDGET_NOTIFICATION_ENABLED=false` 策略说明、`AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 熔断降级说明、`AI_BUDGET_CIRCUIT_OPEN` 治理审计说明、`ai_external_alert_outbox` 外部告警待发送事实和 `SENT/FAILED/DEAD_LETTER/SENDING`、`attempts`、`last_error` 发送器状态机说明、`AI_BUDGET_ROLE_CIRCUIT_OPEN` 和角色预算环境变量说明、`AI_BUDGET_MODEL_CIRCUIT_OPEN` 和 `AI_DEEPSEEK_DAILY_BUDGET_MICROUSD` 模型预算说明、`prompt_version` 与 `AI_OUTPUT_GUARDED` 输出防护说明、`/ai/governance/cost-trend` 成本趋势接口、`/ai/governance/external-alerts/summary` 监控摘要接口、`AI_EXTERNAL_ALERT_WEBHOOK_ENABLED` / `AI_EXTERNAL_ALERT_WEBHOOK_URL` webhook 发送说明、`AI_EXTERNAL_ALERT_SCHEDULER_ENABLED` 调度器说明、`AI_EXTERNAL_ALERT_MAX_ATTEMPTS` 重试/死信说明、AI 外部告警幂等/并发领取说明、`AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED` / `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET` 和 `X-AI-Alert-Signature` HMAC 签名说明、`PerformanceStats` 绩效责任归因字段、`ReworkRecordResponse` 返工影响审计字段、`/reworks` 的 `has_impacted_nodes` 筛选参数、`/performance/details` 绩效明细接口、9D.74 的 `performance_formula_version` / `standard_coverage_rate` / `performance_score` 绩效公式字段，以及 AI 治理摘要的 `daily_budget_microusd`、`budget_exceeded`、`budget_alert_count`、`latest_budget_alert_at` 字段；path / operation 数量以 `npm run check:openapi` 输出为准，后续新增接口时必须继续同步契约并保持检查通过。

## 重要文件

- `AGENTS.md`：Codex 接手规则。
- `AGENT.md`：RepoFrame 细则入口。
- `PROJECT.md`：产品目标、范围、边界和验收红线。
- `DECISIONS.md`：已确认决策。
- `tasks/README.md`：Yuri 风格任务拆解和下一步。
- `tasks/TASK-001-clarify-source-bundle-and-recover-missing-scope.md`：RepoFrame 初始澄清任务，已被 `tasks/README.md` 的 V1.1 计划取代。
- `tasks/TASK-002-project-skeleton-initialization.md`：任务 1 的详细执行任务，等待路线确认。
- `.repo-init/README.md` / `.repo-init/init-report.md`：初始化依据和证据。
- `docs/api/openapi.yaml`：已修复并完成任务 8B 二次冻结的当前后端基线 OpenAPI 契约。
- `scripts/check-openapi-contract.rb`：任务 8B 自定义 OpenAPI 契约检查，覆盖 operationId、标准错误响应和关键新增 path。
- `docs/source/README.md`：源文档路径和作用。
- `docs/development/task-1-preflight.md`：任务 1 前置预检与路线选择。
- `docs/development/task-1-execution-checklist.md`：任务 1 开工清单和验收边界。
- `docs/acceptance/task-8-acceptance-matrix.md`：任务 8A 专项验收矩阵和上线结论。
- `docs/acceptance/task-8-regression-record.md`：任务 8A 回归命令、HTTP/SQL smoke 和测试覆盖记录。
- `docs/deployment/readiness-checklist.md`：正式上线前 readiness 缺口清单。
- `backend/`：Spring Boot / Maven 多模块后端骨架。
- `backend/platform-server/src/main/resources/db/migration/`：Flyway 迁移，包含核心表和 9 条工艺链种子数据。
- `backend/platform-server/src/main/java/com/yuri/aiorder/workflow/definition/`：最小只读 Workflow API。
- `backend/platform-server/src/main/java/com/yuri/aiorder/order/status/`：任务 3 状态枚举、状态服务和投影服务。
- `backend/platform-server/src/main/java/com/yuri/aiorder/order/api/`：任务 3 医生端脱敏 VO、内部 DTO、AI-3 安全读模型和最小订单接口。
- `backend/platform-server/src/test/java/com/yuri/aiorder/order/OrderStatusProjectionTests.java`：任务 3 状态投影与脱敏边界测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/file/api/`：任务 4 MinIO 配置、文件服务、上传/签名接口和访问策略。
- `backend/platform-server/src/test/java/com/yuri/aiorder/file/FileAccessTests.java`：任务 4 文件上传、签名 URL、审计和医生端拒绝访问测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/workflow/runtime/`：任务 5A 工序实例化、节点状态机、任务池和运行时接口。
- `backend/platform-server/src/test/java/com/yuri/aiorder/workflow/runtime/WorkflowRuntimeTests.java`：任务 5A DAG 激活、并联汇合、可选节点跳过、任务池和医生端拒绝访问测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/`：任务 5B 入检/出检、返工、工时和绩效接口。
- `backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java`：任务 5B 入检门禁、出检时序、返工工时和绩效范围测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/`：任务 6 消息、设计稿、账单物流和通知事实接口。
- `backend/platform-server/src/test/java/com/yuri/aiorder/collaboration/MessageDesignBillNotificationTests.java`：任务 6 医生端脱敏、消息审核、设计稿确认、账单物流和通知事实测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/ai/`：任务 7 AI Gateway、工具白名单、上下文构造、输出防护和审计落库。
- `backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayTests.java`：任务 7 五个 AI 端点、AI-3 安全拒绝、资料缺失检查和审计测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/`：任务 9A Bearer token 签发、校验、filter 和身份上下文。
- `backend/platform-server/src/test/java/com/yuri/aiorder/auth/BearerIdentityTests.java`：任务 9A Bearer 身份、医生端脱敏、跨医生拒绝和禁用 bootstrap header 后 401 测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/AccessControlService.java`：任务 9B.1 后端集中权限与数据范围守卫。
- `backend/platform-server/src/main/resources/db/migration/V6__auth_rbac_datascope_foundation.sql`：任务 9B.2 数据库化账号、角色、权限和 data scope 基础。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/DatabaseAuthService.java`：任务 9B.2 数据库登录、角色权限聚合和身份构造。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/PasswordHashService.java`：任务 9B.2 PBKDF2-SHA256 密码 hash 校验。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/RequirePermission.java`：任务 9B.3 Controller 权限注解。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/PermissionInterceptor.java`：任务 9B.3 统一权限拦截器，优先使用数据库 Bearer 权限码，兼容本地角色 fallback。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/PermissionWebConfiguration.java`：任务 9B.3 MVC 拦截器注册。
- `backend/platform-server/src/test/java/com/yuri/aiorder/auth/PermissionInterceptorTests.java`：任务 9B.3 数据库账号权限码和角色边界回归测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/BootstrapIdentityArgumentResolver.java`：任务 9B.4 统一身份参数解析器。
- `backend/platform-server/src/main/java/com/yuri/aiorder/order/api/OrderProjectionQueryService.java`：任务 9B.4 订单读取 SQL DataScope 过滤。
- `backend/platform-server/src/main/java/com/yuri/aiorder/workflow/runtime/WorkflowRuntimeService.java`：任务 9B.4 工序实例读取 SQL DataScope 过滤。
- `backend/platform-server/src/main/java/com/yuri/aiorder/file/api/FileResourceService.java`：任务 9B.5 文件上传订单范围和文件读取 SQL DataScope 过滤。
- `backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/CollaborationService.java`：任务 9B.5 消息、设计稿、账单物流订单范围 SQL DataScope 过滤。
- `backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java`：任务 9B.5 AI 内部上下文读取 SQL DataScope 过滤。
- `backend/platform-server/src/main/resources/db/migration/V7__auth_menu_dept_post_foundation.sql`：任务 9B.6 菜单、部门、岗位和角色菜单基础迁移。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/AuthMenu.java`：任务 9B.6 登录态菜单 DTO。
- `frontend/src/App.vue`：任务 9B.6 前端按后端菜单权限渲染工作入口；任务 9D.1 医生订单工作台、9D.2 医生下单、9D.3 客服初审、9D.4 生产审核、9D.5 生产任务入口第一增量。
- `scripts/check-task-9d1-frontend.mjs`：任务 9D.1 前端工作台与 Vite 代理关键文本检查。
- `scripts/check-task-9d2-frontend.mjs`：任务 9D.2 医生下单与动态表单关键文本检查。
- `scripts/check-task-9d3-frontend.mjs`：任务 9D.3 客服初审关键文本检查。
- `scripts/check-task-9d4-frontend.mjs`：任务 9D.4 生产审核关键文本检查。
- `scripts/check-task-9d5-frontend.mjs`：任务 9D.5 工序实例、派工转派和我的任务关键文本检查。
- `scripts/check-task-9d6-frontend.mjs`：任务 9D.6 入检出检和工时操作关键文本检查。
- `scripts/check-task-9d7-frontend.mjs`：任务 9D.7 绩效统计关键文本检查。
- `scripts/check-task-9d8-frontend.mjs`：任务 9D.8 生产看板关键文本检查。
- `backend/platform-server/src/main/resources/db/migration/V9__production_board_menu_seed.sql`：任务 9D.8 生产看板菜单种子迁移。
- `scripts/check-task-9d9-frontend.mjs`：任务 9D.9 返工终检关键文本检查。
- `backend/platform-server/src/main/resources/db/migration/V10__rework_final_menu_seed.sql`：任务 9D.9 返工终检菜单种子迁移。
- `scripts/check-task-9d10-frontend.mjs`：任务 9D.10 Multipart 上传关键文本检查。
- `backend/platform-server/src/main/resources/db/migration/V11__file_multipart_upload_metadata.sql`：任务 9D.10 文件 Multipart 元数据迁移。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/AuthStartupValidator.java`：任务 9B.7 生产鉴权启动门禁。
- `backend/platform-server/src/main/resources/application-prod.yml`：任务 9B.7 生产 profile 鉴权配置。
- `backend/platform-server/src/test/java/com/yuri/aiorder/auth/AuthStartupValidatorTests.java`：任务 9B.7 生产门禁回归测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/RefreshTokenService.java`：任务 9B.8 refresh token 哈希存储、刷新和 logout 吊销服务。
- `backend/platform-server/src/main/resources/db/migration/V12__auth_refresh_token.sql`：任务 9B.8 refresh token 持久化表迁移。
- `scripts/check-auth-refresh.mjs`：任务 9B.8 Refresh Token/logout 关键文本检查。
- `backend/platform-server/src/main/java/com/yuri/aiorder/notification/`：任务 9C.1 WebSocket 通知配置、鉴权拦截器、连接处理器和在线推送服务。
- `backend/platform-server/src/test/java/com/yuri/aiorder/notification/NotificationWebSocketTests.java`：任务 9C.1 WebSocket 在线推送回归测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/notification/NotificationController.java`：任务 9C.2 通知列表、未读数、单条已读和全部已读 REST 接口。
- `backend/platform-server/src/main/java/com/yuri/aiorder/notification/NotificationService.java`：任务 9C.2 当前用户通知隔离、已读状态更新和公开 payload 查询。
- `backend/platform-server/src/test/java/com/yuri/aiorder/notification/NotificationRestTests.java`：任务 9C.2 通知未读/已读和当前用户隔离回归测试。
- `backend/platform-server/src/main/java/com/yuri/aiorder/notification/NotificationRedisBroadcaster.java`：任务 9C.3 Redis 通知广播发布器，按开关启用。
- `backend/platform-server/src/main/java/com/yuri/aiorder/notification/NotificationRedisBroadcastListener.java`：任务 9C.3 Redis 广播监听器，忽略本实例消息并触发本机投递。
- `backend/platform-server/src/test/java/com/yuri/aiorder/notification/NotificationBroadcastTests.java`：任务 9C.3 Redis 广播和远端本机投递回归测试。
- `backend/platform-server/src/test/java/com/yuri/aiorder/workflow/runtime/WorkflowRuntimeTests.java`：任务 9B.1 覆盖 WORKER Bearer token 不能派工/跳过节点。
- `backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java`：任务 9B.1 覆盖医生不能读检查记录、CS 不能查绩效、WORKER 只能看本人绩效。
- `frontend/`：Vue3 + Element Plus 前端骨架。
- `compose.yaml`：MySQL、Redis、MinIO 本地基础服务。
- `.env.example`：本地环境变量模板。

## 下一步

1. **阶段一：本地全链路演练**（不依赖客户，立即可做）——起整套 compose、四端浏览器走查、
   补 compose 资源限制与后端 JVM 堆参数。退出条件：四端页面均有真实数据、
   Network 面板无返回 `text/html` 的接口请求。
2. 待客户回复三项阻塞输入（磁盘容量/类型/RAID、局域网还是公网访问、域名与 HTTPS 证书）。
3. 阶段二/三：客户服务器开 Hyper-V + Ubuntu 虚机，离线镜像包远程部署。
4. **上线前两个硬门槛**：HTTPS（现在只有 `listen 80`）与备份（现在完全没有，且需真实恢复演练）。
5. 各产品标准制作周期等业务数据由客户提供后走管理端配置转正，不改代码。

以下为历史内容，不再代表当前下一步。

下一开发批次优先完成现有权限/DataScope 与 RuoYi 规则接口的只读兼容适配，并以权限结果一致、可关闭回滚、医生端和 `SELF` 数据范围不扩大为验收门。随后再推进 M3 统一全链验收和五个 AI 助手矩阵；M6 外部条件继续并行收集。一期 Task 8 仍保持 `NOT_READY`。

## Codex Token 成本治理

本轮已落地 Codex Token 成本治理第一版：新增 `docs/development/codex-token-cost-control.md`、`scripts/codex-token-report.mjs`、`scripts/check-codex-token-cost-control.mjs`，并在 `AGENTS.md` 固定会话边界、文件读取、验证分层和超阈值停止规则。后续继续下一步前可运行 `npm run codex:token-report` 查看最近请求级 token、最大 session、大工具输出和高风险命令；机器验收入口为 `npm run check:codex-token-cost`。2026-07-06 基准后，下一轮唯一推荐目标改为 A/B 类一期范围对齐第一段；真实客户 / PM 确认项与真实环境 AI 验收继续作为外部阻塞项记录，不能由本地代码或文档伪装关闭。

本轮追加 SOP / Superpowers 分级启用规则：默认轻量模式只查必要片段，不展开完整 SOP / spec / plan；标准模式用于明确实现、修复、落地和文档回写；重型模式用于完整审查、上线前检查、长跑执行、复杂故障和安全 / 权限 / 生产 / 数据风险任务，且必须新会话开始并先运行 token report。

## 9D.77 文件上传弱网 / 跨设备验收第一段

本轮已完成 9D.77 文件上传弱网 / 跨设备验收第一段：新增 `scripts/smoke-task-9d77-file-upload-resilience.spec.mjs`、`npm run check:task9d77` 和 `npm run smoke:task9d77-file-upload-resilience`，用两个 Playwright browser context 模拟设备 A 弱网中断、设备 B 无本地 localStorage 后通过服务端 pending Multipart 候选恢复同一 `file_id`。本轮不接真实生产对象存储，不代表真实弱网物理网络、真实跨设备实机、客户 Multipart 限制签字或测试/正式 bucket 实际隔离已完成。Task 8 仍保持 NOT_READY。

## 9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段

本轮已完成 9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段：新增 `docs/acceptance/task-9d78-bucket-isolation-readiness.md`、`scripts/check-task-9d78-bucket-isolation-readiness.mjs` 和 `npm run check:task9d78`。检查覆盖本地 bucket 与生产占位 bucket 不同、生产 bucket 仍为占位示例、一期 compose 要求外部注入 `MINIO_BUCKET`，以及 readiness / acceptance 文档已回写。本轮不接真实生产对象存储，不提交真实 MinIO 密钥、真实 bucket 名称或生产 URL。真实测试/正式对象存储账号隔离、真实网络访问和客户 / PM 书面确认仍未完成。Task 8 仍保持 NOT_READY。

## 9D.79 真实环境文件上传人工验收记录模板第一段

本轮已完成 9D.79 真实环境文件上传人工验收记录模板第一段：新增 `docs/acceptance/task-9d79-real-env-file-upload-manual-acceptance.md`、`scripts/check-task-9d79-real-env-file-upload-acceptance.mjs` 和 `npm run check:task9d79`。模板覆盖真实环境基本信息、测试 / 正式 bucket、对象存储账号隔离、文件大小 / 类型 / 数量限制、100MB+ 上传、弱网中断、跨设备恢复、越权读取、bucket 写入位置和客户 / PM 签字状态。本轮只提供模板，所有真实环境字段均为 `待填写` 或 `待确认`，不填写真实密钥，不代表真实环境已验收。Task 8 仍保持 NOT_READY。

## 9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段

本轮已完成 9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段：新增 `docs/acceptance/task-9d80-ai-production-integration-acceptance.md`、`scripts/check-task-9d80-ai-production-integration-acceptance.mjs` 和 `npm run check:task9d80`。模板覆盖 DeepSeek key 外部注入、AI-3 脱敏与拒答、AI-5 文本整理、预算 / 熔断 / 输出防护、生产 webhook、发送侧签名、接收端验签 / 防重放和客户 / PM 签字状态。本轮只提供模板，所有真实环境字段均为 `待填写` 或 `待确认`，不填写真实密钥，不填写真实 webhook URL，不代表真实 key 或生产 webhook 已联调完成。Task 8 仍保持 NOT_READY。

## 9D.81 部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段

本轮已完成 9D.81 部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段：新增 `docs/deployment/task-9d81-production-deployment-acceptance.md`、`scripts/check-task-9d81-deployment-production-acceptance.mjs` 和 `npm run check:task9d81`。模板覆盖 Docker Compose、Nginx、HTTPS、镜像仓库、生产环境变量、数据库备份、备份恢复演练、日志留存、监控告警、发布回滚和客户 / PM 签字状态。本轮只提供模板，所有真实环境字段均为 `待填写` 或 `待确认`，不填写真实密钥，不填写真实服务器地址，不代表真实服务器、HTTPS、备份恢复或监控告警已验收完成。Task 8 仍保持 NOT_READY。

## 9D.91 客服配送管理页 / 物流异常跟进第一增量

本轮已完成 9D.91 客服配送管理页 / 物流异常跟进第一增量：复用 `order_logistics.logistics_status` 和 `order_message` 客服内部消息，不新增迁移；新增 `/logistics/orders` 配送列表、`/orders/{orderId}/logistics/exception` 人工异常跟进、`DeliveryOrderResponse` / `LogisticsExceptionRequest`、客服端 `/delivery` 页面和 `npm run check:task9d91`。测试覆盖 CS 标记物流异常、配送列表筛选异常单、医生端物流详情不返回内部跟进说明且医生不能写异常跟进。本轮不接真实物流 API、电子面单、自动轨迹同步、签收回调或物流平台 webhook，不代表真实 DHL / FedEx / 顺丰联调完成。Task 8 仍保持 NOT_READY。

## 9D.92 AI-2 客服查询助手完整入口第一增量

本轮已完成 9D.92 AI-2 客服查询助手完整入口第一增量：复用既有 `/ai/cs-query` 后端能力，客服端 `/ai/cs` 从占位页改为可输入订单 ID 和问题的只读查询助手页，返回结果固定提示“对外发送前需人工确认”。新增 `npm run check:task9d92`，检查前端入口、文档和 acceptance 关键文本。本轮不新增后端接口、不新增迁移、不接真实 key、不自动发送消息、不自动写入订单或生产备注，不代表完整客服知识上下文、消息附件聚合或客户 / PM AI-2 口径确认完成。Task 8 仍保持 NOT_READY。

## 生产端前端真实路径只读巡检（2026-07-13）

已完成生产端所有可安全读取、查询、刷新、筛选、菜单、弹窗和本地草稿表单的真实浏览器巡检；每次交互均检查页面状态、4xx/5xx 网络响应和控制台错误。修复了工作台异常卡片错跳、通知铃铛无法进入通知中心、刷新令牌重置同路由子视图、终检任务异步串位、协同订单清空后残留旧上下文、外协成本入口保留人工成本类型、外返页错误加载终检数据和终检报告缺失处理等问题，并补充 favicon 以消除 `/favicon.ico` 404。

验证：完整 `smoke-task-9d24-four-portal-login.spec.mjs` 14 项通过、`npm run build:frontend`、`npm run check:openapi`，以及终检相关后端聚焦测试通过。未点击任何会写入生产数据或不可逆的控件；后续“开始/完成工序、提交入检/出检、关闭返工、提交终检、生成报告、发送消息、通知标记已读、设备/物料/成本/安环/奖惩登记或状态更新、上传/打印”等操作须先取得用户确认。Task 8 保持 `NOT_READY`。

## 生产端测试数据隔离与流程展示修复（2026-07-13）

在用户确认后，已按外键从子表到父表清除本地展示库中全部可识别的测试订单、工序、检查、消息、工时和关联文件元数据；保留诊所、账号等基础登录种子。复核 `ai_order_platform` 中订单、工序实例和生产人员待开工任务均为 0。Maven 集成测试改为强制 `test` profile，固定使用仅授予 `*_test` 库权限的测试账号、Redis DB 15 和测试 MinIO bucket，并在 Spring 上下文启动时拒绝非测试库、Redis DB 或 bucket；所有会写订单/文件的 9D.10、9D.62、9D.77 smoke 也要求显式独立环境标记与 URL，且拒绝共享本地端口。

生产任务和看板接口新增 `can_start` / `start_block_reason`，入检未通过时前端禁用“开始工作”、说明前置条件并提供“去扫码入检”，后端仍保留 409 状态机门禁。流程抽屉不再显示模板内部 `step_order`（10、20、100…），改为本单的“第 N 步”，同序节点标识“并行”，并显示口扫/印模、基台方案、贴面路线等实际已选分支。默认工艺模板本身未被当作真实工厂 SOP 改写，后续仍需工厂确认各真实工序与入检规则。

验证：`scripts/ensure-test-database.sh` 建好独立库、bucket 和测试账号；聚焦 Maven 测试 6 项通过，确认连接 `ai_order_platform_test`；`npm run build:frontend`、`npm run check:openapi`、完整 `smoke-task-9d24-four-portal-login.spec.mjs` 15 项均通过。8080 本地后端已重启并通过 `/api/bootstrap/health`；真实浏览器使用生产账号重新登录后，生产订单与我的任务均显示空态、无 409 或控制台错误；最终数据库复核主展示库和测试库的订单、流程实例、流程节点、文件元数据均为 0。Task 8 保持 `NOT_READY`。
