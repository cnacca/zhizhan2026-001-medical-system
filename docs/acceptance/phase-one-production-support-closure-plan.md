# 9D.95 设备 / 物料 / 安环 / 成本 / 奖惩基础台账拆解记录

状态：completed-first-increment / PARTIAL。

更新日期：2026-07-06。

2026-07-06 范围基准更新：本文件保留为 9D.50-9D.54 和 9D.95.1-9D.95.5 的历史拆解与基础能力索引，不再作为一期继续扩展完整管理闭环的排期依据。最新范围基准见 `docs/acceptance/phase-one-scope-baseline-20260706.md`。

## 目标

记录设备、物料、安环、成本、奖惩从“只读汇总第一增量”推进到基础台账、基础登记和状态更新的证据，并明确这些能力只算 C 类一期基础能力。

当前 9D.50-9D.54 汇总和 9D.95.1-9D.95.5 基础增量不能写成五类模块 READY，也不能继续被解释为一期必须补完整编辑、完整历史、完整审批、真实趋势或完整管理闭环。

当前 9D.95.1 到 9D.95.5 只能标记为“一期基础可演示闭环 / PARTIAL”：允许表达基础台账或记录录入、状态更新第一增量、只读汇总、权限隔离、前端入口可演示和本地检查脚本可验证；不得写成 READY。

仍缺内容必须保留在后续缺口中：设备编辑 / 事件状态更新、物料编辑 / 处理历史、安环复查 / 完整审批、成本编辑 / 审批、奖惩编辑 / 复杂审批、真实趋势和完整验收。是否继续补到 READY，必须依赖客户 / PM 是否把这些列为一期硬交付；未确认前不扩大范围。

## 非目标

- 不新增数据库迁移。
- 不实现 CRUD。
- 不接 IoT、传感器、设备联网或环境采集硬件。
- 不接真实财务系统、ERP、采购系统或供应商协同。
- 不把成本或奖惩作为工资发放结果。
- 不做完整审批流引擎、复杂 BI、移动扫码或外部通知联动。
- 不把 Task 8 标完成。
- 不继续把 C 类完整管理闭环列为一期本地必做，除非客户 / PM 另行书面确认范围变更。

## 模块拆解

| 模块 | 当前证据 | 2026-07-06 基准定位 | 已保留的一期基础能力 | 非目标 | 验收方式 |
| --- | --- | --- | --- | --- | --- |
| 设备管理 | 9D.50 已有 `/production/equipment/summary`、设备台账 / 事件基础迁移和生产端只读汇总。 | C 类基础台账，不继续扩完整设备管理。 | 9D.95.1 已补内部设备台账和设备事件人工登记，医生端不可写。 | 不接 IoT，不做保养审批流，不做设备联网，不做复杂设备履历，不补完整编辑历史作为一期硬缺口。 | 目标后端测试、`npm run check:task9d951`、`npm run check:openapi`、`npm run build:frontend`。 |
| 物料异常 | 9D.51 已有 `/production/material-exceptions/summary`、物料异常基础迁移和生产端只读汇总。 | C 类基础异常台账，不继续扩完整物料管理。 | 9D.95.2 已补内部异常登记和处理状态更新。 | 不做库存扣减，不做采购补料，不做供应商协同，不接 WMS，不补完整处理历史作为一期硬缺口。 | 目标后端测试、`npm run check:task9d952`、OpenAPI、前端 build。 |
| 安环管理 | 9D.52 已有 `/production/safety-environment/summary`、安环事件基础迁移和生产端只读汇总。 | C 类基础巡检 / 隐患台账，不继续扩完整安环审批。 | 9D.95.3 已补巡检 / 隐患记录创建和整改状态更新。 | 不接真实环境采集硬件，不做 PPE 发放系统，不做完整安环审批流。 | 目标后端测试、`npm run check:task9d953`、OpenAPI、前端 build。 |
| 成本管理 | 9D.53 已有 `/production/cost-management/summary`、成本记录基础迁移和生产端只读汇总。 | C 类基础成本记录，不继续扩真实财务或完整成本审批。 | 9D.95.4 已补人工成本记录创建和本地汇总口径。 | 不接真实财务系统，不做发票 / 付款 / 对账，不做成本自动分摊，不把真实趋势列为一期硬缺口。 | 目标后端测试、`npm run check:task9d954`、OpenAPI、前端 build。 |
| 奖惩管理 | 9D.54 已有 `/production/reward-penalty/summary`、奖惩记录基础迁移和生产端只读汇总。 | C 类基础奖惩记录，不继续扩复杂审批或工资发放闭环。 | 9D.95.5 已补奖惩记录创建、状态更新和内部列表。 | 不作为工资发放结果，不做绩效申诉闭环，不做薪酬结算，不做复杂审批引擎。 | 目标后端测试、`npm run check:task9d955`、OpenAPI、前端 build。 |

## 历史实现顺序

1. 9D.95.1 设备台账 / 设备事件录入第一增量。
2. 9D.95.2 物料异常登记 / 处理状态第一增量。
3. 9D.95.3 安环巡检 / 隐患整改第一增量。
4. 9D.95.4 成本记录维护 / 趋势口径第一增量。
5. 9D.95.5 奖惩记录 / 审批状态第一增量。

上述顺序只说明历史增量完成次序，不再作为后续一期排期。下一批开发应优先处理 A/B 类明确范围。

## 共享边界

- 只能面向 ADMIN / CS / WORKER 内部角色，DOCTOR 必须 403 或不可见。
- 新增接口必须同步 `docs/api/openapi.yaml`。
- 新增页面必须沿用生产端现有导航和中文业务语言。
- 若客户 / PM 后续把任一 C 类完整闭环重新纳入一期，必须先补新 PRD、任务、工程量和验收矩阵，再按目标静态检查、后端测试、OpenAPI、前端 build 和文档回写推进。
- 真实外部系统、真实密钥、真实财务、真实工资、真实设备联网全部保持 BLOCKED 或后置，不可伪装完成。

## 本轮验收

- 本轮只更新范围基线和机器检查，不新增业务接口、不新增数据库迁移、不新增前端页面。
- `npm run check:scope-baseline-20260706` 用于检查本文件、项目入口文档、acceptance 和下一步指针是否一致。
- Task 8 仍保持 NOT_READY。

## 9D.95.1 设备台账 / 设备事件录入第一增量

状态：completed-first-increment / PARTIAL。

9D.95.1 已把设备管理从只读汇总推进到一期最小人工录入闭环：复用 9D.50 的 `production_equipment` 和 `production_equipment_event`，新增 `POST /production/equipment` 与 `POST /production/equipment/{equipmentCode}/events`。WORKER / ADMIN 可登记设备台账和设备事件，DOCTOR 写入返回 403；生产端设备管理页新增“登记设备”和“登记事件”最小表单，提交后刷新既有真实设备汇总。

本增量不新增数据库迁移，不接 IoT，不做保养审批流、复杂设备履历或真实设备联网；设备管理仍未全部 READY。Task 8 仍保持 NOT_READY。下一步推荐 9D.95.2 物料异常登记 / 处理状态第一增量。

## 9D.95.2 物料异常登记 / 处理状态第一增量

状态：completed-first-increment / PARTIAL。

9D.95.2 已把物料异常从只读汇总推进到一期最小人工登记 / 状态处理闭环：复用 9D.51 的 `production_material_exception`，新增 `POST /production/material-exceptions` 与 `PUT /production/material-exceptions/{exceptionNo}/status`。WORKER / ADMIN 可登记缺料、错料、批次异常、材料损耗，并更新 `PENDING / IN_PROGRESS / CLOSED` 处理状态；DOCTOR 写入和更新返回 403。生产端物料异常页新增“登记物料异常”和“更新处理状态”最小表单，提交后刷新既有真实物料异常汇总。

本增量不新增数据库迁移，不接库存扣减、采购补料、供应商协同或 WMS；物料异常管理仍未全部 READY。Task 8 仍保持 NOT_READY。下一步推荐 9D.95.3 安环巡检 / 隐患整改第一增量。

## 9D.95.3 安环巡检 / 隐患整改第一增量

9D.95.3 已把安环管理从只读汇总推进到一期最小人工登记 / 整改状态处理闭环：复用 9D.52 的 `production_safety_event`，新增 `POST /production/safety-environment/events` 与 `PUT /production/safety-environment/events/{eventNo}/status`。WORKER / ADMIN 可登记安全巡检、隐患整改、环境记录、PPE / 设备安全提醒，并更新 `PENDING / IN_PROGRESS / CLOSED` 整改状态；DOCTOR 写入和更新返回 403。生产端安环管理页新增“登记安环事件”和“更新整改状态”最小表单，提交后刷新既有真实安环汇总。

本增量不新增数据库迁移，不接真实环境采集硬件、PPE 发放系统或完整安环审批流；安环管理仍未全部 READY。Task 8 仍保持 NOT_READY。下一步推荐 9D.95.4 成本记录维护 / 趋势口径第一增量。

## 9D.95.4 成本记录维护 / 趋势口径第一增量

状态：completed-first-increment / PARTIAL。

9D.95.4 已把成本管理从只读汇总推进到一期最小人工记录维护闭环：复用 9D.53 的 `production_cost_record`，新增 `POST /production/cost-management/records`。WORKER / ADMIN 可登记 `PROCESS / MATERIAL / LABOR / REWORK / OUTSOURCING` 成本记录，成本状态限定为 `NORMAL / WARNING / CONFIRMED`，`WARNING` 会计入既有成本异常预警汇总；DOCTOR 写入返回 403。生产端成本管理页新增“登记成本记录”最小表单，提交后刷新既有真实成本汇总。

本增量不新增数据库迁移，不接真实财务系统、发票、付款、对账、自动成本分摊、供应商结算或工资发放；成本管理仍未全部 READY。Task 8 仍保持 NOT_READY。随后已推进 9D.95.5 奖惩记录 / 审批状态第一增量。

## 9D.95.5 奖惩记录 / 审批状态第一增量

状态：completed-first-increment / PARTIAL。

9D.95.5 已把奖惩管理从只读汇总推进到一期最小人工登记 / 审批状态处理闭环：复用 9D.54 的 `production_reward_penalty_record`，新增 `POST /production/reward-penalty/records` 与 `PUT /production/reward-penalty/records/{recordNo}/status`。WORKER / ADMIN 可登记奖励或扣罚记录，并更新 `PENDING / APPROVED / REJECTED / EFFECTIVE` 审批状态；DOCTOR 写入和更新返回 403。生产端奖惩管理页新增“登记奖惩记录”和“更新审批状态”最小表单，提交后刷新既有真实奖惩汇总。

本增量不新增数据库迁移，不作为工资发放结果，不做绩效申诉闭环、薪酬结算或复杂审批引擎；奖惩管理仍未全部 READY。Task 8 仍保持 NOT_READY。随后已推进医生提交前 AI-4 资料缺失自动触发体验。
