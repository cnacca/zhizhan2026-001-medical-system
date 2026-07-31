# TASK-032 产品目录 V2 与病例订单组全链执行批次

Status: `in_progress`

Goal: `goals/GOAL-031-product-ordering-v2-case-group-20260731.md`

## Why

现有系统按 `orders.product_type` 一单一产品，产品目录、动态字段、价格快照和医生向导均围绕单产品构建，无法可靠承载客户已提供的多产品下单表、材料/配件条件、共享/专属资料、版本化报价和隐形正畸方案/批次。只把产品选择改为多选会造成产品、工序、文件、价格和审核事实混写，因此需要按 D-174 的“病例订单组 + 产品子订单”做非破坏性扩展，并按 D-175 交付可持续维护的产品配置中心和版本化标准工时后台。

## Scope

- 在保留所有现有用户/其他窗口修改的前提下，执行 A→H 八个批次。
- 每批先补迁移/契约/测试，再实现，再做浏览器复验。
- 所有历史订单兼容逻辑为增量 backfill，不删除数据、不重建现有事实链。
- 每批完成后更新本文件 checklist、验证结果和剩余风险。

## Non-goals

- 不 reset/checkout/clean 当前工作树，不清理未跟踪文件。
- 不在本任务提交、推送或直接修改生产数据。
- 不覆盖独立 M2 worktree 已有的 RuoYi 兼容、SQL DataScope、受控操作审计或 M3 九链基线。
- 不实现积分、患者绑定、佩戴建议、高级 Web 3D、自动支付、真实物流 API。
- 不伪造价格、交期、客户签字、真实环境或最终上线证据。

## Checklist

### A. 需求基线与产品目录标准化

Scope：

- 将《动态下单表最终版》整理为字段、牙位、上传、确认、交期和价格规则矩阵。
- 将《产品内容》整理为 category → product → variant → material → accessory → tooth rule → upload rule → pricing component。
- 输出稳定 code、别名、去重、来源、状态和待确认项；普通产品与隐形正畸边界分开。

Acceptance：

- [x] 每个目录项具备稳定 code、显示名、类别、状态和来源。
- [x] `Full Denture / Complete Denture` 只映射到“全口义齿”一个 SKU。
- [x] `Lucitone 199` 只作为材料品牌/规格。
- [x] 文档中没有正式价格的项目全部为“待报价”，没有虚构金额。

Verification：

```bash
npm run check:product-ordering-v2
git diff --check
```

### B. 病例订单组与兼容数据模型

Scope：

- 新增 `order_case_group`，为 `orders` 增加 `group_id`、`line_no`、`product_id`、关联类型和冻结快照字段。
- 为历史订单一组一子单非破坏回填；保持所有现有业务外键继续指向 `orders.id`。
- 实现组状态派生、医生外部投影、事务和幂等。

Acceptance：

- [x] 历史订单列表、详情和主链回归不变。
- [x] 新订单组可含多个子订单，子订单状态互不串联。
- [x] 重复请求不会重复创建组或子订单。
- [x] 回滚只停用新入口，不删除历史数据。

Verification：

```bash
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderCaseGroupTests,OrderStatusProjectionTests test
npm run check:openapi
```

### C. 产品目录 V2、动态表单 V2、计价与文件规则

Scope：

- 新增管理端“产品配置中心”，覆盖分类、产品、变体/SKU、别名、材料、材料品牌/规格/语义色号、配件、绑定、字段 schema、牙位、上传、价格、交期与工序映射。
- 支持新增、修改、逻辑停用、恢复、排序、复制、预览和发布；发布生成不可变版本。
- 只有从未发布且未引用的草稿可物理删除；已发布或已引用实体/绑定的删除返回 409。
- 绑定保存必选、单/多选、默认值、数量上下限、适用产品/变体/牙位、价格增量、排序、状态和生效版本。
- 动态值支持 string/number/boolean/array/object/quantity，由后端按 schema version 校验。
- 统一单文件 500MB；订单组共享资料与子订单资料分别鉴权。
- 增加 `catalog:manage`、`catalog:publish` 兼容迁移、完整前后值审计、搜索/筛选/完整度提示，以及稳定批量导入/导出模板和校验接口。

Acceptance：

- [x] 管理端完成分类、产品、变体、材料、配件、绑定和规则的 CRUD/逻辑停用/复制/排序/预览/发布。
- [x] 新增一个材料并绑定两个产品后，医生端仅在适用产品看到；停用后新草稿不可选，历史订单按快照展示。
- [x] 已发布或已引用实体非法物理删除返回 409；未发布且未引用草稿可删除。
- [x] 发布前预览、发布后不可变版本、维护/发布权限和新增/修改/绑定/解绑/发布/停用/恢复/排序/改价审计通过。
- [x] 单选、多选、数量、条件字段、牙位、颜色、文件和价格组合有后端测试。
- [x] 医生多产品向导分别渲染单选/多选/number/quantity/boolean/object，object 非法 JSON 阻止保存；草稿已填值和提交可见必填项均由服务端按冻结 schema 校验。
- [x] AI 缺失检查读取 V2 `form_values` 并遵循 `visible_when`，不会把隐藏条件字段误报为缺失。
- [x] FORM_SCHEMA 创建、修改和发布前均校验支持类型、唯一 key、options、visible_when、数值/数量/集合边界；非法发布返回 400 且版本保持 DRAFT。
- [x] 字段停用为逻辑停用，历史快照不变。
- [x] 未配正式价格返回“待报价”。
- [x] 前端、后端、Nginx/MinIO 配置和 OpenAPI 对单文件 500MB 一致。

Verification：

```bash
./scripts/with-jdk21.sh mvn -f backend/platform-server/pom.xml -Dtest=ProductCatalogV2Tests,OrderCaseGroupTests,AiGatewayTests,FileAccessTests test
npm run check:openapi
```

### C2. 工序标准工时维护

Scope：

- 保留“标准工时”数据库、API、权限、版本、导入和审计底座，按产品/现有九条工序链/节点统一以分钟存储。
- 支持空值、单项填写、批量填写/导入、复制上一版本、生效时间、停用和审计。
- 客户正式分钟到位并显式启用后，生产审核实例化工序时才把有效分钟快照到 `order_process_node.standard_duration`。
- 标准工时只用于预计完成、产能/绩效参考，员工实际工时继续由 `work_log` 开始/暂停/继续/完成采集。
- 预留产品/材料时间修正扩展点，第一阶段不写死未确认公式。
- 使用 `workflow:standard-time:manage`；ADMIN/授权工艺管理员可维护，CS/普通 WORKER/DOCTOR 禁止。
- 客户尚未提供正式标准工时：管理端隐藏菜单，`WORKFLOW_STANDARD_TIME_FORMAL_ENABLED` 默认关闭，禁止发布和业务计算；17/19 分钟验收值转为 INACTIVE，只保留技术证据。

Non-goals：

- 不开放工序链节点新增、删除、排序、拖拽或 DAG 编辑。
- 不新增普通员工手填实际工时。

Acceptance：

- [x] 页面按客户现有九条工序链展示完整节点。
- [x] 发布标准分钟后，新实例获得快照；修改并发布新版本后，旧实例不变、新实例使用新版本。
- [x] 空值允许；负数、异常大值、并发版本冲突和越权更新被服务端拒绝。
- [x] 数据库/API/权限/审计底座保留，正式数据未启用时菜单隐藏、发布返回 409、新实例/截止时间/生产超时/绩效不消费验收分钟。
- [x] OpenAPI、权限种子和操作手册同步；17/19 分钟验收版本非破坏转为 INACTIVE，不冒充正式分钟。

Verification：

- 本项菜单隐藏按用户要求不执行专门自动化或真实浏览器验收，由用户自行查看。
- 仅执行后端编译、前端构建、OpenAPI 和文档一致性等必要检查。

### D. 订单组 API 与医生端多产品向导

Scope：

- 实现新建、保存草稿、更新、提交、增删/复制子产品、逐子项校验和整体幂等提交。
- 保留旧单产品 API 兼容层。
- 医生向导改为病例 → 多产品 → 逐产品配置 → 共享/专属资料 → 汇总/价格 → 提交，只读取已发布配置，不写死客户当前材料。

Acceptance：

- [x] 一个病例至少添加两个普通产品并提交。
- [x] 刷新、返回、重入、删除、复制和快速多击不丢数据、不重复建单、不留孤儿文件。
- [x] 每个子订单显示完成度、错误定位、真实编号和状态。
- [x] 旧单产品订单仍可查看和继续原流程。

Verification：

```bash
npm run build:frontend
npm run check:doctor-portal-v2
npm run check:product-ordering-v2
```

### E. 普通产品目录与现有闭环接入

Scope：

- 落地固定、种植、活动、常规正畸和设计服务目录、牙位、材料、配件、试戴/过程确认与上传规则。
- 子订单独立进入客服、生产审核、设计、生产、质检、账单和物流。
- 增加订单组聚合页与批量入口，但不合并业务事实。

Acceptance：

- [x] 固定、种植、活动各至少一条真实浏览器路径；固定类以 `ORD20260731-6622BC4A2A` 补齐医生提交、客服初审、授权生产审核与独立常规冠工序实例证据。
- [x] 工序链继续由子订单 `product_type` 选择，不受同组其他产品状态影响。
- [x] 共享资料只上传一次且每个合法子订单可按规则读取。

Verification：

```bash
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderCaseGroupWorkflowTests,WorkflowRuntimeTests test
npm run build:frontend
```

### F. 隐形正畸专项模块

Scope：

- 实现七步医生向导、病例、处方/诊断、方案版本、内部审核、医生确认/修改、阶段、生产批次和阶段调整/后续加工申请。
- A 型由配置启用，支持未来多类型；联合矫治以同组关联子订单表达。
- 复用现有设计文件/版本能力，不引入高级 Web 3D。

Acceptance：

- [x] A 型由配置启用且代码中无永久写死限制。
- [x] 方案驳回、修改、确认和阶段调整均保留历史。
- [x] 生产批次包含总步数、批次号、起止步和数量。
- [x] 非正畸产品流程不受影响。

Verification：

```bash
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrthodonticCaseTests,OrthodonticPlanVersionTests,OrthodonticBatchTests test
npm run build:frontend
```

### G. 权限、DataScope、状态聚合、审计和消息

Scope：

- 把 D-173 应用到订单组、子订单和正畸流程。
- 防止组级消息/共享文件跨子订单、跨诊所越权。
- 对增删子项、提交、改价、审核、版本、批次、调整和 ADMIN 兜底写审计。

Acceptance：

- [x] DOCTOR、CS、授权审核员、普通 WORKER、ADMIN 权限矩阵和 DataScope 测试齐全。
- [x] 病例订单组所有写接口要求 `order:write-doctor`；严格模式下仅有 `order:read-doctor` 的医生读取仍可用、写入返回 403。
- [x] ADMIN 生产审核兜底必须填写原因并记录审计。
- [x] 医生端、WebSocket 和 AI 不返回内部字段。
- [x] 正畸内审、医生确认和生产审核是独立门禁。

Verification：

```bash
./scripts/with-jdk21.sh mvn -f backend/platform-server/pom.xml -Dtest=PermissionInterceptorTests,StrictPermissionModeTests,OrderCaseGroupTests,FileAccessTests test
npm run check:openapi
```

### H. 迁移、契约、自动化、真实浏览器和交付

Scope：

- 完成 Flyway、OpenAPI、PRD/范围基线、操作手册、菜单、权限种子、自动化和项目文档。
- 在当前标准演示环境用新测试订单完成普通多产品和隐形正畸全链真实点击。
- 检查网络、控制台、1280px 布局、刷新恢复和重复点击。

Acceptance：

- [x] 非破坏迁移和历史 backfill 在 MySQL 真实执行通过。
- [x] 目录/schema、事务幂等、价格快照、500MB 门禁、文件权限、状态聚合、正畸版本/批次、D-173 和旧接口兼容自动化通过。
- [x] 医生多产品、客服逐子单初审、授权生产审核、设计内审/医生确认、派工、入检/工时/出检/返工/终检、账单物流/收货真实点击通过；`ORD20260731-9A5DE848E7` 同一新订单已逐节点完成到医生确认收货。
- [x] 隐形正畸七步、方案 V1 驳回、V2 追加/确认和首批 1～6 步生产批次真实点击通过，旧版本保留。
- [x] 浏览器新增/绑定/停用材料后，新草稿可选范围正确且历史订单快照不变；非法删除显示 409 业务提示并保留审计。
- [x] 历史浏览器验收曾验证 #221=17 分钟、`ORD20260731-7B1FB1CB5A`=19 分钟的新旧实例隔离；D-176 后两版本仅保留为 INACTIVE 技术证据，正式运行时默认不消费。
- [x] Task 8 保持 `NOT_READY`。

Verification：

```bash
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -am test
npm run check:openapi
npm run build:frontend
npm run check:product-ordering-v2
npm run acceptance
git diff --check
```

## Assumption Checks

### Validated

- 本阶段启动时主工作树为 `feature/project-skeleton@8f90c47e0fa912db621b5afaafc44814151f1613`；当前 HEAD 已随用户/其他窗口提交前进到 `429879ad`，本任务未 reset/checkout/清理并持续保留这些改动。
- 当前主工作树已有 V55～V59 未提交迁移、生产审核 D-173 纠偏和 BUG-015～018 修复，必须保留。
- 独立 M2 worktree 已占用 GOAL-027～030、TASK-028～031，并修改权限、审计、DataScope 和 M3 文档/测试。
- 两份客户资料已重新核验 SHA-256 和全部渲染页。

### Open

- H 的本地核心浏览器闭环已完成；完整正式矩阵仍未关闭：固定/种植/活动三类需等客户正式配置后分别形成正式证据，客户正式标准工时数据也未提供。17/19 分钟仅为 INACTIVE 技术证据；Task 8 保持 `NOT_READY`。

## Execution Log

- 2026-07-31 / A：完成动态字段矩阵、产品目录标准化说明及机器可读来源基线；`npm run check:product-ordering-v2`、`npm run check:repoframe-docs`、JSON 解析和目标 `git diff --check` 通过。
- 2026-07-31 / A：来源基线现包含 6 个分类、96 个产品候选、17 个材料、17 个配件和 62 个正畸补充术语；未确认项维持 `DRAFT` / `PENDING_QUOTE`，未直接灌库。
- 2026-07-31 / B～G 与 D-176：V60～V73、目录/订单组/正畸/标准工时底座与停用门禁、已确认产品名称/工序映射首版、四端接线、权限种子、审计和 OpenAPI 已完成；价格仍为待报价、隐形 A 型仍停用，最终后端全套 253 项通过。
- 2026-07-31 / H（已完成部分）：前端正式构建、OpenAPI 158 paths / 182 operations、`check:product-ordering-v2`、RepoFrame、设计协同、9D.4、acceptance 通过。
- 2026-07-31 / H（真实浏览器）：在现有 `15173/18080` 标准演示环境创建 `CASE20260731-039EC65F92`，提交 `ORD20260731-D4ED706388` / `ORD20260731-329E4DF261` 两个子订单，完成客服逐单初审、授权生产审核、设计版本上传、管理员内审、医生确认、管理员派工、节点 429 入检和生产人员开工。管理端“生产审核监控”只作监控/异常兜底；生产端授权角色主审。
- 2026-07-31 / H（扩展真实浏览器）：新病例组 `CASE20260731-6CE2B613B8` 的种植、活动、正畸三个子订单完成提交、客服初审和授权生产审核；普通订单完成设计、派工、入检/工时、一次出检失败返工、重做通过和返工关闭。既有完成单用于终检报告/账单物流尾段，医生在 `ORD20260708-1006` 真实确认收货并回读“已完成”。
- 2026-07-31 / H（正畸）：七步处方完成，方案 V1 经医生驳回后保留，V2 重新上传、内审并由医生确认，随后创建总步数内首批 1～6 步生产批次；三种门禁未混用。
- 2026-07-31 / H（标准工时）：验收配置 V2/V3 从 17 调整为 19 分钟，旧实例订单 #221 保持 17、新实例 `ORD20260731-7B1FB1CB5A` 使用 19；该配置明确标为浏览器验收值，不作为客户正式工时。
- 2026-07-31 / H（材料配置）：真实浏览器新增 `BROWSER_ACCEPTANCE_LUCITONE_199`，绑定两个适用产品并发布；医生新草稿仅在适用产品显示，停用后新草稿不可选，历史订单仍显示冻结快照；草稿非法删除返回 409 且数据/审计保留。
- 2026-07-31 / H（同单全链）：`ORD20260731-9A5DE848E7` 的全部生产节点、客服基台/账单门禁、终检、验收账单 PDF、验收收款、物流发货和医生确认收货均通过真实页面完成；工序实例与订单最终为 COMPLETED。
- 2026-07-31 / H（D-176 收口）：完成标准工时菜单隐藏，V72 将未确认 ACTIVE 版本转为 INACTIVE 并留审计；正式开关默认关闭，禁止发布、实例快照、截止时间/生产超时和绩效计算。本项按用户要求不另做菜单浏览器或专项自动化验收。
- 2026-07-31 / H（前端修复）：医生端改为加载真实物流并调用真实确认收货接口；确认后物流冻结为 `DELIVERED`、订单完成。生产端在 952px 隐藏侧栏时新增同权限菜单来源的窄屏导航，真实切换到“质量与返工 / 内返管理”通过。
- 2026-07-31 / H（验证）：后端全套 253 项、前端 typecheck/正式构建、OpenAPI 159 paths / 183 operations、产品 V2、RepoFrame、M2 兼容、9D.4、设计协同、主链脚本和最终 `git diff --check` 均通过。
- 2026-07-31 / E（固定类真实浏览器补证）：在现有 `15173/18080` 标准演示环境由医生提交病例组 `CASE20260731-9D821AA4A9` 的固定类子订单 `ORD20260731-6622BC4A2A`，客服完成翻译整理与初审，具备 `workflow:review-production` 的生产审核账号选择口扫入口并通过；系统独立生成 `REGULAR_CROWN` 常规冠工序实例，订单进入设计，操作历史记录审核人为生产角色。至此固定、种植、活动三类本地真实浏览器路径齐全；测试备注和当前目录显示名不代表客户正式工艺、价格或发布数据。
- 2026-07-31 / C/G（收口审计）：补齐医生向导 `multi_select`、object JSON 编辑和 number/quantity 边界；服务端对草稿已填值及提交可见必填项执行冻结 schema 的类型、选项、数值/集合边界校验；AI 缺失检查改读 V2 `form_values` 并遵循 `visible_when`。病例订单组写接口由误用的 `order:read-doctor` 统一改为 `order:write-doctor`，严格权限目标回归 30 项通过，只有读权限的医生写入返回 403。
- 2026-07-31 / C（发布校验）：新增 `CatalogRuleSchemaValidator`，FORM_SCHEMA 创建、更新和发布前复核均拒绝未知类型、重复 key、非法 options/visible_when 和倒置/负数边界；直接注入的遗留坏规则也无法发布，配置版本保持 DRAFT。
- 2026-07-31 / A/E（并发兼容）：只读核验其他窗口新增的 V73，仅发布客户资料中可确认的产品名称与工作流映射；`PENDING_QUOTE`、隐形 A 型 INACTIVE 和材料/工时待确认边界保持不变，本任务未覆盖该迁移。

- 正式价格、币种生效日期、标准交期、完整文件格式/数量、订单组总容量和部分产品/九链映射仍需业务数据。
- 隐形正畸参考平台只提供范围参考，具体字段以本 Goal 批准规则和可配置模型为准。
- 独立 M2 worktree 合并时可能与权限/审计文件发生三方冲突，相关改动延后到 G 批次并做兼容接入。

## Downstream Impact

- 数据库从 V60 起增加非破坏迁移。
- 医生端订单创建契约从单产品扩展为病例订单组，但旧接口保留。
- 产品与表单配置由 `product_type` 平铺升级为产品/版本化模型。
- 客服、生产和管理端增加组上下文；业务执行仍以子订单为准。
- OpenAPI、操作手册、菜单、权限种子、自动化和验收矩阵必须同步。

## Completion Record

- A～G 本地实现与自动化已完成；H 已完成当前可用配置下的多产品/正畸/材料停用与 409/同一新订单全生产、账单物流和收货核心真实浏览器闭环，E 的固定、种植、活动三类本地路径也已齐全。V73 已发布可确认的产品名称与工作流映射首版；正式材料/配件绑定、价格、交期、文件规则、标准工时数据及完整正式验收仍未完成，因此任务和 Goal 继续保持 `in_progress`，Task 8 保持 `NOT_READY`。

## Remaining Work

- 客户/PM 补齐并发布固定、种植、活动和正畸的正式材料/配件绑定、价格、交期与文件规则，并确认 V73 产品/工作流映射首版后，分别形成同一新订单从提交到收货的完整正式证据。
- 客户提供正式标准工时后，在草稿复核完整九链分钟，授权发布并显式开启正式运行时开关；此前不展示菜单、不参与业务计算。

## Execution Log

- 2026-07-31：用户明确批准本任务的产品规则、架构、执行顺序和非目标。
- 2026-07-31：实时核对编号后使用 GOAL-031/TASK-032，避免与独立 M2 worktree 的 GOAL-027～030、TASK-028～031 冲突。
- 2026-07-31：建立任务基线，保持 Task 8 `NOT_READY`。
- 2026-07-31：客户追加确认产品/材料可持续维护中心与标准工时版本化维护；C 批次扩为完整后台，新增 C2，工序链结构编辑继续为非目标。
