# 管理端冻结规格实施与真实 Chrome 验收报告

> 日期：2026-07-16  
> 规格：`ADMIN-UI-BASELINE-V1.0` / `CONFIRMED_AND_FROZEN`  
> 范围：管理端前端；工作台仅回归查看，不修改业务内容

## 实施结果

- 人员管理已替换为 V2：左侧组织筛选、右侧人员名单、单一人员/权限抽屉。
- 已移除旧人员指标卡、人员三页签、常驻权限关系带和导出入口。
- 人员搜索、层级、状态、部门筛选均使用真实数据；当前接口返回 5 人，不用虚构数据补足行数。
- 普通员工沿用真实新增/编辑接口；管理员合成行只读；经理、主管因后端暂无持久化能力而禁用写操作并明确提示。
- 部门与岗位弹窗只读展示真实部门和在用岗位，不伪造保存能力。
- 17 个一级入口、8 个页内标签、9 条固定工艺链均按冻结规格保留；固定工艺链只读。
- 工作台业务内容未修改。

## 构建与静态校验

| 检查 | 结果 |
| --- | --- |
| `npm run build:frontend` | PASS；`vue-tsc` 与 Vite 构建通过，仅有既有 chunk 大小与 Rollup PURE 注释警告 |
| `npm run acceptance` | PASS；`acceptance.json valid` |
| `git diff --check` | PASS |

两个历史阶段检查仍与当前 HEAD 的既有实现不一致，未通过且本轮未通过向界面塞入过时文案规避：

- `npm run check:task9d36`：要求当前 HEAD 已不存在的“账号权限 / 账号切换 / 管理员可输入员工编号”等旧文案。
- `npm run check:frontend-productization-closure`：要求当前 HEAD 已不存在的旧状态条类名及“权限拒绝态 / 加载态 / 空态 / 错误态”等字面量。

## 真实 Chrome 验收

### 人员管理双视口

| CSS 视口 | 页面结果 | 数据结果 | 截图文件像素 |
| --- | --- | --- | --- |
| 1440×900 | 页面、工作区均无横向溢出；人员区完整落在视口内 | 5 条真实人员全部可见 | 1920×1200 |
| 1280×800 | 页面、工作区均无横向溢出；响应式布局正常 | 5 条真实人员全部可见 | 1707×1067 |

已实际操作并通过：部门筛选、关键字搜索、层级与状态组合筛选、人员查看/编辑抽屉、Esc 关闭抽屉、部门与岗位只读弹窗、Esc 关闭弹窗、新增人员默认普通员工。未提交测试数据。

截图：

- `docs/quality/admin-personnel-v2/screenshots/personnel-management-v2-implementation-1440x900.png`
- `docs/quality/admin-personnel-v2/screenshots/personnel-management-v2-implementation-1280x800.png`

### 全量入口与页签

- 17 个一级入口逐项点击通过：工作台、订单管理、沟通中心、客户管理、账单配送、外协管理、工艺生产、质量管理、人员管理、绩效统计、设备管理、物料管理、安环管理、成本管控、产品配置、审计通知、AI 治理。
- 8 个页内标签均已覆盖：订单列表 / 文件资料、消息处理 / 沟通管理、工序进度 / 员工派工、动态表单 / 返工字典。
- 每个入口的活动菜单状态正确，页面未出现横向溢出或可见错误态。
- 截图位于 `docs/quality/admin-portal-implementation/screenshots/`，按 `01` 至 `17` 编号；4 个备用标签截图以 `tab-` 开头。

### 固定工艺链

- 已打开固定工艺链抽屉并确认 9 条链：常规冠修复、种植类修复、精密附件、套筒冠、贴面修复、活动件-钢托、活动件-胶托、活动件-隐形、正畸。
- 实际切换到“种植类修复”并加载真实节点。
- 抽屉中无新增、编辑、删除、复制、拖拽、保存或发布入口。
- 证据：`docs/quality/admin-portal-implementation/screenshots/fixed-workflow-chains-readonly.png`。

### 控制台与网络

- 干净重载后记录 49 个网络事件：无 `Network.loadingFailed`，无 HTTP 4xx/5xx。
- 全量入口、页签和工艺链交互阶段记录 54 个网络事件：无失败请求，无 HTTP 4xx/5xx。
- 干净重载后的 localhost 应用控制台无 warning / error。
- 前端重启期间曾出现一次 Vite 连接中断和 `Failed to fetch`；服务恢复并干净重载后未复现，不计为当前应用缺陷。

## 边界

- 本报告只证明本地管理端冻结规格的实现和真实 Chrome 回归，不代表真实生产环境、客户签字或上线 readiness 已完成。
- Task 8 继续保持 `NOT_READY`。
