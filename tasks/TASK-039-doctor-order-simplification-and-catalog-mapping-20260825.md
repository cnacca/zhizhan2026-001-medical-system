# 医生下单精简与产品目录映射执行批次

<!-- repo-init:managed -->

## Metadata

- ID: `TASK-039`
- Status: `in_progress`
- Owner: `shared`
- Goal: `GOAL-037-phase-one-report-followup-closure-20260825.md`
- Created: `2026-08-25`
- Updated: `2026-08-25`

## Goal

先完成医生下单 6 → 4 步精简及完整回归，再核对产品目录“推簧”的准确映射；每一项都保持现有字段、校验、权限、文件规则和历史快照边界。

## Scope

- 第 1 项：医生多产品下单向导步骤合并、导航、缺项定位、草稿恢复和中英文回归。
- 第 1 项实施期间用户确认的设计服务闭环：通用资料、牙位、设计备注、医生确认、付款后下载，不进入实体生产和物流。
- 第 1 项追加缺陷：全部产品类别的制作要求、材料工艺和动态补充字段采用单一编辑归属。
- 第 4 项：产品来源基线、已发布目录和现有弹簧相关产品／配件的映射核对与最小必要调整。
- 专项检查、前端构建、目标测试、隔离浏览器回归和项目文档回写。

## Non-goals

- 不删除字段，不放宽必填、资料完整性或最终提交服务端校验。
- 不改文件数量、大小、类型、存储、权限和审计规则。
- 不实现完整 CRM／客户关怀提醒；转入二期。
- 不实现 STL 直接打开 CAD／设计软件；转入二期。
- 不在映射结论不明确时新增或重命名正式产品。
- 不修改正式业务数据，不把 Task 8 标记为 `READY`。

## Checklist

### A. 实施基线与红灯 —— `COMPLETED`

- [x] 固定当前 6 步与目标 4 步的映射。
- [x] 列出步骤编号硬编码、验证定位、草稿和回归影响面。
- [x] 固定“字段不删、校验不降级、后端模型默认不改”的约束。
- [x] 新增或校准专项静态检查，先证明旧 6 步实现不能满足目标。

Acceptance：实施者可直接按明确映射改造，不需要重新解释范围；旧 6 步应触发专项红灯。

Verification：`docs/development/doctor-order-wizard-simplification-plan-20260825.md`；`npm run check:doctor-order-four-step-design-service`。

### B. 6 → 4 步实现 —— `COMPLETED`

- [x] 把步骤标题改为 `基础信息与产品`、`制作配置`、`资料上传`、`复核与提交`。
- [x] 将原第 2、3 步合并到新第 2 步，将原第 5、6 步合并到新第 4 步。
- [x] 统一迁移页面条件、前进／返回、步骤校验、服务端错误映射和“去填写”定位编号。
- [x] 步骤状态只在组件内保存，最大值归一化为 4；旧业务草稿恢复不依赖旧 UI 步骤编号。
- [x] 同步中英文文案和无障碍步骤提示。

Acceptance：界面仅显示 4 步，原字段和产品级内容全部可编辑；任一缺项都能正确定位。

Verification：专项检查、`check:doctor-order-product-first`、`check:doctor-order-final-confirmation`、`check:doctor-portal-i18n`、前端生产构建。

### C. 关键业务回归 —— `COMPLETED`

- [x] 普通产品与多产品草稿的前进、返回、保存和恢复契约检查。
- [x] 动态表单可见条件、产品字段、牙位、材料／工艺和试戴／过程确认检查。
- [x] 共享／专属文件、V1／V2／V3 历史草稿兼容和扫描资料完整性回归。
- [x] 正畸产品处方与版本／批次入口静态兼容检查。
- [x] 最终确认、价格占位、周期确认、询问客服和提交门禁回归。
- [x] 设计服务通用扫描资料、牙位／备注必填、数字工作流完成及付款下载门禁回归。

Acceptance：步骤精简不造成字段丢失、草稿重置、附件错绑、定位错误或提交校验放宽。

Verification：目标自动化及隔离浏览器四步全路径；不在正式环境创建验收订单。

### D. 第 1 项收口 —— `COMPLETED`

- [x] 更新实现事实、回归证据和 Remaining Work。
- [x] 第 1 项已完成本地实现与回归，第 4 项继续按队列单独核对。

Acceptance：第 1 项有机器检查和浏览器证据，且 Task 8 仍为 `NOT_READY`。

Verification：RepoFrame、acceptance、构建和差异检查。

### D1. 制作配置字段去重 —— `COMPLETED`

- [x] 审计固定修复、活动义齿、种植修复、常规正畸、隐形正畸和设计服务的固定字段与动态字段。
- [x] 种植系统、直径／长度、穿龈高度、连接和固位统一归“种植参数”，保留原字段与校验。
- [x] 页面固定字段不再由动态“补充要求”重复渲染，跨目录规则同 key 字段只显示一次。
- [x] 固定修复两个边缘维度区分命名；设计服务隐藏空材料区。
- [x] 新增跨产品字段归属机器检查并完成前端构建和既有下单回归。

Acceptance：任一页面固定字段只有一个编辑入口；动态表单仍能显示未被固定控件接管的真实补充字段；原值、字段 key 和必填校验不变。

Verification：`npm run check:doctor-order-field-ownership`、既有医生下单专项、`check:product-ordering-v2`、前端缺陷回归和前端生产构建。

### D2. 设计备注选填与复核页对齐 —— `COMPLETED`

- [x] 设计服务备注取消前端必填提示和缺项校验，不增加替代选项。
- [x] 新增 V91，将全部现有设计服务目录规则的 `case_note.required` 改为 `false`。
- [x] 保持牙位、通用口扫资料、设计确认和付款下载门禁不变，并补“缺牙位拒绝、空备注可提交”后端回归。
- [x] 复核页上下区块统一右侧内容列起点、宽度和窄屏退化规则。

Acceptance：设计服务备注为空不会阻止保存或提交；其他门禁不变；第 4 步上下内容区左右边界一致。

Verification：`OrderCaseGroupTests`、`check:doctor-order-four-step-design-service`、前端生产构建、只读浏览器草稿恢复和差异检查。

### E. “推簧”目录映射 —— `QUEUED_AFTER_D`

- [ ] 对照原始产品资料、目录基线、当前发布目录和已有订单快照核对术语。
- [ ] 若为同义词：增加可追溯的别名／检索映射，不重复创建 SKU。
- [ ] 若为独立产品：通过管理端版本化目录草稿／发布流程新增，并补产品－表单－工序映射与回归。
- [ ] 若证据仍不足：记录为待业务术语确认，不猜测写入正式目录。

Acceptance：医生能按业务用语找到正确产品，目录无重复或错误映射，历史订单快照不变。

Verification：产品目录目标测试、`check:product-ordering-v2`、前端构建、隔离目录／医生下单浏览器回归。

## Verification Commands

```bash
npm run check:doctor-order-product-first
npm run check:doctor-order-final-confirmation
npm run check:doctor-order-four-step-design-service
npm run check:doctor-order-field-ownership
npm run check:doctor-portal-i18n
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/platform-server/pom.xml -Dtest=OrderCaseGroupTests,FileAccessTests,DesignTaskCollaborationTests test
npm run check:phase-one-closure-plan
npm run check:phase-one-workflow
npm run check:stage-goal-window
npm run check:repoframe-docs
npm run check:acceptance-baseline
npm run acceptance
git diff --check
```

第 4 项发生目录实现改动时追加产品目录后端目标测试、`npm run check:product-ordering-v2` 和必要 OpenAPI 检查。

## Assumption Checks

### Validated

- 当前步骤定义为 6 项，页面中存在 `step: 1／3／4／6` 和 `step === 1...5` 等硬编码，不能只改标题数组。
- 合并步骤只改变信息架构，不需要删除业务字段或改变后端提交模型。
- 当前目录存在“弹簧矫正器”“螺旋扩弓器”和配件“加弹簧”，没有“推簧”的已证实等价映射。

### Invalidated

- “把步骤标题从 6 个改成 4 个即可完成”不成立；页面分支、校验、错误定位和草稿恢复必须一起迁移。
- “推簧必然等于弹簧矫正器或加弹簧”证据不足，不能直接落正式目录。

### Still Open

- “推簧”的最终业务含义；该问题只阻塞第 4 项，不阻塞第 1 项。

## Downstream Impact

- 医生端中文和英文必须同步；客服／生产读取订单内容的契约不应变化。
- 文件规则、产品快照、DataScope、医生端脱敏和审计保持原边界。
- 若第 4 项需要新增独立产品，必须检查动态表单、工序链和历史目录版本的兼容性。

## Completion Record

- 2026-08-25：完成执行文档和第 1 项 6 → 4 步影响面整理；尚未修改业务代码、运行回归、提交、推送或部署。
- 2026-08-25：完成第 1 项本地实现与回归。医生端已改为四步；设计服务首步不再要求实体出货／运输，保持通用扫描资料并要求牙位、设计备注；医生确认后数字流程结束，付款后方可下载原文件。前端生产构建、专项检查、既有下单检查和差异检查通过，后端三个目标测试类 43 项通过，本地医生端浏览器确认四步和数字交付文案且控制台无错误。未创建／提交浏览器验收订单，未提交、推送、热更新或修改正式数据，Task 8 保持 `NOT_READY`。
- 2026-08-25：完成 D1 字段归属修复。种植重复字段统一移入“种植参数”，固定／动态字段和动态规则之间按 key 去重，固定修复边缘维度改为可区分文案，设计服务隐藏空材料区。新增字段归属检查，专项、目录、前端回归和生产构建通过；本地浏览器只读确认向导正常打开且控制台无错误，未创建患者或订单草稿。
- 2026-08-25：完成 D2。设计服务备注改为选填，V91 同步目录规则；后端证明空备注可提交且缺牙位仍拒绝。复核页上下区块统一右侧内容基线和宽度。目标后端 11 项、专项检查与前端构建通过；只读恢复现有草稿，未保存或提交。

## Remaining Work

- 执行 E 批次，核对并处理“推簧”目录映射。
- 第 2、3 项按 D-207 留在二期；提交、推送与热更新需用户另行确认。
