# 管理端剩余页面重构下一窗口交接

> 日期：2026-07-16
> 状态：`ORDER_FINAL_ACCEPTANCE_PENDING`

> 2026-07-16 最新确认：只将人员管理页面顶部作为统一设计基线；剩余管理页面主体需要逐页完整重构。详细方案见 `docs/design/admin-portal/REMAINING_PAGES_REFACTOR_PLAN.md`。

## 新窗口第一读取顺序

1. `docs/design/admin-portal/IMPLEMENTATION_BASELINE.md`
2. `docs/design/admin-portal/REMAINING_PAGES_REFACTOR_PLAN.md`
3. `docs/quality/admin-order-page/README.md`
4. `docs/design/reference-portals/README.md`
5. `git status --short --branch` 与当前未提交差异

## 已确认结论

- 管理端总规格为 `ADMIN-UI-BASELINE-V1.1`，状态 `CONFIRMED_AND_FROZEN`；
- 左侧固定 3 组 17 个一级入口；
- 人员管理 V2 已由用户确认；只有其页面顶部是其他管理页面的统一视觉基线；
- 人员页固定为“左侧组织筛选 + 右侧人员名单 + 单一人员/权限抽屉”；
- 不恢复四张人员指标卡、人员三页签、独立账号权限或常驻权限关系带；
- 权限层级为管理员 → 经理 → 主管 → 普通员工，并受后端权限和数据范围约束；
- 固定 9 条工艺链只读；
- 设备管理、物料管理、安环管理、成本管控保留独立入口；
- 外协管理使用独立页面；
- 工作台业务内容不修改。
- 订单两行筛选是订单页专属设计，不得复制到其他页面；
- 剩余管理页面需要完整重构主体，不是只换顶部。

## 当前订单页状态

当前订单顶部和两行筛选已经写入 `frontend/src/App.vue` 与 `frontend/src/admin-order-page.css`。前端构建和 `git diff --check` 已通过，真实 Chrome 1440×900 已完成；截图为 `docs/quality/admin-order-page/screenshots/final-order-top-personnel-style-1440x900.png`。

尚未完成：1280×800、文件资料页签、最终控制台检查、验收记录更新。订单表格、文件资料主体和 820px 详情抽屉保持原实现，本轮不得改抽屉宽度。

## 下一窗口首个实施任务

1. 不重新设计订单页；先完成订单剩余真实 Chrome 验收和证据收口；
2. 将订单最终结果交用户确认；
3. 订单通过后，按 `REMAINING_PAGES_REFACTOR_PLAN.md` 从“沟通中心”开始完整重构主体；
4. 沟通中心通过后才进入客户管理，保持逐页验收门禁。

## 工作树注意事项

当前主工作树路径为 `/Users/yuri/Documents/AI智能下单平台`，当前分支名为 `feature/project-skeleton`。工作区已有未提交修改与未跟踪设计文件；不得重置、覆盖或清理这些改动，必须先检查差异并在其上继续。不得修改工作台业务内容，不得把本地视觉验收描述为正式上线完成。
