# Repo Init Document Design 2026-07-06

状态：active-doc-design / NOT_READY。

本文件说明当前 handoff worktree 的文档层怎么设计，供新窗口接手时快速判断应该读哪里、改哪里、不要改哪里。

## 为什么不重跑 repo-init

当前仓库已经完成 RepoFrame / repo-init 接手，并且后续已经推进到 2026-07-06 范围基线和 9D.99 A/B 类一期范围对齐第一段。

2026-07-07 后，RepoFrame 文档校准入口为 `goals/GOAL-003-repoframe-doc-hydration-20260707.md` 和 `tasks/TASK-004-repoframe-doc-hydration-20260707.md`；该校准已完成。这是已有 worktree 的 `repo-hydrate` 后续校准，不是重新初始化。

因此本轮不重跑 `initialize_repo.py`，原因是：

- 仓库不是空项目，也不是重新开始开发。
- `README.md`、`STATUS.md`、`PROJECT.md`、`DECISIONS.md`、`tasks/README.md` 和 `acceptance.json` 已有大量真实执行记录。
- 重跑初始化可能把已完成的验收矩阵、README 和任务指针压回“澄清优先”的低置信状态。
- 当前正确动作是“补文档架构说明 + 标记旧 repo-init 澄清任务已 superseded”，而不是重新生成项目。

## 文档分层

### 1. 项目入口层

新窗口先读：

1. `STATUS.md`
2. `tasks/README.md`
3. `acceptance.json`
4. `goals/GOAL-003-repoframe-doc-hydration-20260707.md`
5. `tasks/TASK-004-repoframe-doc-hydration-20260707.md`
6. `PROJECT.md`
7. `DECISIONS.md`
8. `docs/acceptance/phase-one-scope-baseline-20260706.md`

用途：

- `STATUS.md` 只放当前状态、阻塞、下一步和最近完成项。
- `PROJECT.md` 放稳定项目定义、一期范围、非目标和下一阶段优先级。
- `DECISIONS.md` 只追加已确认的产品 / 技术决策，不写临时想法。
- `tasks/README.md` 是主任务账本和执行记录。
- `acceptance.json` 是机器可读验收入口。

### 2. 范围基线层

当前范围基准是：

- `docs/acceptance/phase-one-scope-baseline-20260706.md`
- `docs/customer-confirmation/AI智能下单平台_2026-07-06_新需求范围内部确认版.docx`

规则：

- A 类全部一期修正。
- B 类做一期基础版。
- C 类只保留入口、基础台账、基础登记、状态更新或架构预留。
- 设备 / 物料 / 安环 / 成本 / 奖惩不再继续扩成一期完整管理闭环。
- Task 8 仍保持 `NOT_READY`。
- 真实 DeepSeek key、真实 webhook、真实客户模板、客户签字和真实环境验收不能由本地文档伪装完成。

### 3. 执行层

当前真实执行指针：

- GOAL-003 / TASK-004 RepoFrame 文档校准已完成。
- 9D.99 A/B 类一期范围对齐第一段已完成。
- 下一步是 A/B 类一期范围对齐第二段。

第二段建议目标：

- 把客服统计、生产统计、内返 / 外返、账单 / 物流人工状态从展示口径推进到真实接口或可复用现有接口的数据闭环。
- 先补机器检查，再做最小实现。
- 每个闭环都要有目标测试或脚本检查。

### 4. 验收层

当前机器检查入口：

```bash
npm run check:scope-baseline-20260706
npm run check:repoframe-docs
npm run check:task9d99
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

后续涉及接口或前端时，再追加：

```bash
npm run check:openapi
npm run build:frontend
```

### 5. RepoFrame 层

`.repo-init/`、`goals/GOAL-001-scope-clarified-for.md`、`goals/GOAL-002-scope-clarified-for.md` 和 `tasks/TASK-003-clarify-source-bundle-and-recover-missing-scope.md` 是 repo-init 接手与历史初始化阶段产物。

当前处理：

- 保留这些文件作为初始化证据。
- GOAL-001 不再作为当前执行入口，只保留为历史初始化证据。
- GOAL-002 / TASK-003 不再作为当前执行入口。
- 当前执行以 `STATUS.md`、`tasks/README.md`、`acceptance.json`、GOAL-003 和 TASK-004 为准。

## 后续文档改动规则

- 改范围：先改 `docs/acceptance/phase-one-scope-baseline-20260706.md`，再同步 `PROJECT.md`、`STATUS.md`、`DECISIONS.md`、`tasks/README.md` 和 `acceptance.json`。
- 改下一步：先改 `STATUS.md` 和 `tasks/README.md`，再同步 readiness / final report。
- 新增验收：先加脚本或目标测试，再把命令写进 `package.json`、`acceptance.json` 和任务记录。
- 外部阻塞：只写 BLOCKED，不写完成。
- 历史任务：保留历史事实，但必须写清楚是否被新基准覆盖。

## 新窗口推荐开场

先运行：

```bash
pwd
git status --short --branch
npm run check:scope-baseline-20260706
npm run check:repoframe-docs
npm run check:task9d99
```

然后只读检查 A/B 类第二段相关代码和文档，再决定目标测试和实现边界。
