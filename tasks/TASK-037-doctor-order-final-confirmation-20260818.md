# 医生下单最终确认与共享资料上传执行批次

<!-- repo-init:managed -->

## Metadata

- ID: `TASK-037`
- Status: `completed`
- Owner: `shared`
- Goal: `GOAL-036-doctor-order-final-confirmation-20260818.md`
- Created: `2026-08-18`
- Updated: `2026-08-21`

## Goal

在一个执行批次内完成 GOAL-036 的实现、机器验证、浏览器验收和项目文档回写。

## Scope

- 医生多产品向导的共享资料上传槽位、拖拽上传和必传状态。
- 最终确认页的产品级完整摘要与价格占位。
- 最终页询问客服的上下文联动，且不影响提交按钮。
- 必要的后端校验、前端构建、浏览器回归和机器检查。

## Non-goals

- 不实现正式计价。
- 不改变当前文件技术参数或安全边界。
- 不建立问题解决状态机。
- 不部署、提交或推送代码。
- 不修改正式数据，不把 Task 8 标记为 READY。

## Checklist

### A. 基线与机器红灯

- [x] 固定用户确认口径与代码影响面。
- [x] 新增 `check:doctor-order-final-confirmation` 并先确认旧实现不能满足检查。

Acceptance：检查覆盖固定共享槽位、拖拽、价格占位、最终确认摘要、询问不阻断和文档边界。

Verification：`npm run check:doctor-order-final-confirmation` 先失败、实现后通过。

### B. 共享资料与拖拽上传

- [x] 将上颌、下颌、咬合固定为病例共享必传槽位。
- [x] 其他资料保持选传并继续沿用当前文件标准。
- [x] 为固定槽位增加拖拽上传、状态反馈和现有操作入口。
- [x] 前后端提交校验复用共享资料，不要求多产品重复上传。

Acceptance：三个必传槽位缺失时按现有必传规则提示；选传资料缺失不阻止；多产品共享同一组扫描文件。

Verification：前端构建、目标测试、浏览器拖拽与多产品复用验收。

### B2. 共享默认与产品专属覆盖

- [x] 病例共享区和每个产品专属区统一提供六类资料槽位。
- [x] 每个产品的上颌扫描、下颌扫描、咬合扫描允许由共享或专属资料满足，后三类保持选传。
- [x] 产品专属文件存在时仅当前产品优先使用；否则显示继承的共享文件名。
- [x] 后端按子订单校验共享／专属最终组合，保持 `FIXED_SHARED_V1` 历史草稿兼容。

Acceptance：医生能明确判断每个产品实际使用共享还是专属文件；无需重复上传共享资料，也不能在产品最终缺少三项扫描时提交。

Verification：专项检查、前端构建、全新隔离数据库 `OrderCaseGroupTests`、本地浏览器视觉与交互回归。

### B3. 下一步与提交缺项反馈

- [x] 点击“下一步”后持续显示当前步骤的具体缺项，不只依赖短时消息。
- [x] 多产品缺项标明产品名称和字段／资料类型，并提供“去填写”定位。
- [x] 资料上传缺项明确说明可由共享资料或产品专属资料补齐。
- [x] 最终提交按钮允许点击后展示完整缺项清单，但不放宽任何提交校验。

Acceptance：医生点击后一定得到可持续查看的原因说明；可以从缺项清单进入对应步骤和产品；补齐后再次点击会更新或清除清单。

Verification：专项检查、前端构建、本地隔离浏览器第一步／产品字段／最终确认缺项交互和控制台检查。

### C. 最终确认页

- [x] 产品卡片展示产品、数量、制作要求、默认要求、附加要求、附件、制作周期和价格占位。
- [x] 顶部展示病例与共享资料汇总。
- [x] 价格不显示零元，不描述为提交后客服报价。

Acceptance：摘要来自当前草稿事实；无正式价格时稳定显示“价格待配置”。

Verification：机器检查、前端构建、浏览器视觉与数据回显验收。

### D. 询问客服

- [x] 最终确认页提供带病例、产品、字段上下文的询问入口。
- [x] 复用现有订单消息链路，不新增问题解决状态机。
- [x] 消息发送、未回复和未读状态均不影响提交可用性。

Acceptance：医生能从最终确认页进入沟通并看见上下文；提交按钮只受既有业务/技术校验影响。

Verification：机器检查与浏览器交互验收。

### E. 统一验收与文档回写

- [x] 运行目标测试、前端构建、RepoFrame、acceptance 和差异检查。
- [x] 回写 `STATUS.md`、`tasks/README.md`、`README.md`、`DECISIONS.md`、`acceptance.json` 和相关验收文档。
- [x] 保持 Task 8 `NOT_READY`，如实记录未提供的正式价格和真实环境文件验收。

## Verification Commands

```bash
npm run check:doctor-order-final-confirmation
npm run build:frontend
npm run check:phase-one-closure-plan
npm run check:phase-one-workflow
npm run check:stage-goal-window
npm run check:repoframe-docs
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

涉及后端时追加目标测试；涉及 OpenAPI 时追加 `npm run check:openapi`。

## Assumption Checks

### Validated

- 病例订单组已有共享文件 ID 与产品专属上传槽位。
- 后端已有价格状态、金额和币种字段；正式数据尚未提供。
- 订单消息接口允许医生与客服围绕草稿产品子订单沟通。

### Invalidated

- “所有资料都必须上传”不成立；只有上颌、下颌和咬合扫描是固定必传。
- “医生询问后系统必须阻止提交直到问题解决”不成立。
- “价格提交后由客服受理才显示”不成立；最终目标是在提交前展示，本轮仅占位。

### Still Open

- 正式价目表及完整价格规则仍待提供。
- 真实环境文件上传与客户/PM 最终文件限制验收仍未完成。

## Downstream Impact

- 影响医生端中文和英文下单向导，必须同步维护文案。
- 不得改变医生端数据隔离、文件权限和历史订单快照规则。
- 后续价格接入应复用本轮展示结构，不重做最终确认页。

## Completion Record

- 2026-08-21 追加完成下单缺项清单：第一步可同时列出患者、产品、到货日期；产品步骤显示“产品名：具体字段”；资料步骤按产品列出缺失扫描；最终提交点击后列出未勾选确认。每条均可“去填写”，最终按钮不再因缺项静默禁用，提交校验未放宽。
- 2026-08-21 追加完成 `FIXED_LAYERED_V2`：六类共享／产品专属槽位同构，三项必传按产品由共享或专属满足，专属同类文件仅覆盖当前产品；前端生产构建和全新隔离数据库 `OrderCaseGroupTests` 9/9 通过。
- 实现文件：`DoctorCaseGroupWizard.vue`、`CaseGroupDraftService.java`、`OrderCaseGroupTests.java`、`smoke-clear-aligner-doctor-ordering.spec.mjs`。
- 红灯证据：新增专项检查后，旧实现因固定槽位、拖拽、最终摘要、价格占位和询问标记均缺失而失败；实现后通过。
- 绿灯证据：`check:doctor-order-final-confirmation`、`check:doctor-order-product-first`、`check:doctor-portal-i18n`、`build:frontend`、后端 compile、全部 `OrderCaseGroupTests` 9/9、`npm run acceptance` 和 `git diff --check` 通过。
- 后端目标测试使用新建隔离数据库与测试 bucket；默认测试库因既有 V73 Flyway checksum 不一致在启动前阻断，未擅自 repair。
- 本地隔离浏览器已实传 3 个病例共享 STL，两个产品均显示三项“继承共享资料”；再为“全瓷冠”实传 1 个专属 STL 后，仅该产品上颌槽位显示“使用专属资料”，另一产品继续继承共享。最终页分别显示“共享 3 个，专属 0 个”和“共享 3 个，专属 1 个”，控制台无错误；最终提交未点击。
- 缺项反馈浏览器验收覆盖：第一步 3 项待补、打印氧化锆冠咬合缺失、“去填写”定位及补齐后清单消失、最终两项确认待补；控制台无错误，未提交测试订单。
- 未变更 OpenAPI、未提交/推送/部署，Task 8 保持 `NOT_READY`。

## Remaining Work

- 最终提交及询问客服不阻断提交仍由现有后端目标测试和静态检查覆盖；如需浏览器级提交证据，应继续使用隔离库并明确保留或清理测试订单。
- 正式价目表、完整价格规则和真实环境文件限制的客户/PM验收仍待外部输入。
