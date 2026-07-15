# 管理端前端下一窗口执行交接

> 日期：2026-07-16
> 状态：`READY_FOR_IMPLEMENTATION`

## 新窗口第一读取顺序

1. `docs/design/admin-portal/IMPLEMENTATION_BASELINE.md`
2. `docs/design/admin-portal/reference/personnel-management-v2-reference.md`
3. `docs/design/admin-portal/components/admin-personnel-v2.spec.md`
4. `docs/design/reference-portals/README.md`
5. `git status --short --branch` 与当前未提交差异

## 已确认结论

- 管理端总规格为 `ADMIN-UI-BASELINE-V1.0`，状态 `CONFIRMED_AND_FROZEN`；
- 左侧固定 3 组 17 个一级入口；
- 人员管理 V2 已由用户确认；
- 人员页固定为“左侧组织筛选 + 右侧人员名单 + 单一人员/权限抽屉”；
- 不恢复四张人员指标卡、人员三页签、独立账号权限或常驻权限关系带；
- 权限层级为管理员 → 经理 → 主管 → 普通员工，并受后端权限和数据范围约束；
- 固定 9 条工艺链只读；
- 设备管理、物料管理、安环管理、成本管控保留独立入口；
- 外协管理使用独立页面；
- 工作台业务内容不修改。

## 下一窗口首个实施任务

在主工作树中，用已确认的人员管理 V2 替换 `frontend/src/App.vue` 和 `frontend/src/admin-portal.css` 中的旧人员页实现；保留真实人员接口和已有用户改动。经理、主管保存接口尚未具备时必须禁用对应写操作，不得伪造成功。

完成后先运行前端构建，再用真实 Chrome 验证 `1440×900` 与 `1280×800`，保存新的实现截图并与 V2 参考图对照。人员页通过后，才按总规格逐入口构建其余管理端页面。

## 工作树注意事项

当前主工作树路径为 `/Users/yuri/Documents/AI智能下单平台`，当前分支名为 `feature/project-skeleton`。工作区已有未提交修改与未跟踪设计文件；不得重置、覆盖或清理这些改动，必须先检查差异并在其上继续。
