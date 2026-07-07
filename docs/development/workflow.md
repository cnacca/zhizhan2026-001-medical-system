# AI 智能下单平台一期收口 Workflow

状态：ACTIVE / PROJECT_LOCAL。

更新日期：2026-07-07。

## Purpose

本 workflow 只适用于当前项目和当前 handoff worktree：

```text
/Users/yuri/Documents/AI智能下单平台-handoff-20260706
```

它服务于一期收口，不是全局开发 SOP，不恢复 Yuri workflow/SOP，不重新初始化项目，不运行 `initialize_repo.py`。

本 workflow 的核心目的：默认按阶段级 goal 推进。Codex 不应在完成一个小任务后停止并只建议下一个小任务，而应在用户确认阶段级 goal 后，自行拆 checklist、逐项验证和回写，直到整个阶段级 goal 满足完成标准或遇到真实阻塞。

每个新窗口必须先确认阶段级 goal，并可直接使用 `docs/development/stage-goal-window-guide.md` 的启动模板。当前项目暂不启用外部 SOP；新窗口只按本项目 workflow、一期收口技术方案和 RepoFrame 文件执行。

## Source Of Truth

执行一期收口时，按以下顺序取准：

1. `docs/development/phase-one-closure-technical-plan.md`
2. `acceptance.json`
3. `docs/acceptance/prd-v2-gap-matrix.md`
4. `docs/acceptance/task-8-acceptance-matrix.md`
5. `docs/deployment/readiness-checklist.md`
6. `STATUS.md`
7. `tasks/README.md`
8. `DECISIONS.md`

如果这些文件之间冲突，并且无法从当前证据判断哪个为准，必须停下来报告，不得自行编造状态。

## Default Goal Granularity

默认 goal 粒度是阶段级，不是单个小功能。

阶段级 goal 来自一期收口技术方案：

- 第零段：状态基线校准
- 第一段：客户 / PM 确认项与真实环境 AI 验收收口
- 第二段：PRD V2 本地功能差异收口
- 第三段：生产支持模块 PARTIAL 收口
- 第四段：统一验收与文档回写

默认不把每个 checklist 项都拆成独立 task 文件。只有当某个 checklist 项很大、跨多轮、或者有独立验收矩阵时，才拆成新的 task 文件。

## Execution Loop

当用户确认一个阶段级 goal 后，Codex 应按以下顺序执行：

1. 建立或更新当前 RepoFrame goal。
2. 建立一个执行批次 task。
3. 在 task 内拆 checklist。
4. 为每个 checklist 项写清 Scope / Non-goals / Acceptance / Verification。
5. 先补机器检查或目标测试。
6. 再执行文档、检查脚本或业务实现调整。
7. 每完成一个 checklist 项，运行对应验证。
8. 执行中只汇报 checklist 进度，不输出“下一步小任务建议”。
9. 直到整个阶段级 goal 完成，或遇到真实阻塞。

阶段级 goal 完成后，最终输出才可以给出下一大目标建议。若被真实阻塞，输出阻塞项、已完成内容、未完成原因和阻塞解除后继续的 checklist 项。

## Window Startup Contract

每个新 Codex 窗口应使用 `docs/development/stage-goal-window-guide.md` 中的启动模板，明确本窗口只执行一个阶段级 goal，不做单个小任务闭环。

窗口启动后必须先读取 source-of-truth 文件，再建立或更新阶段级 RepoFrame goal 和一个执行批次 task。task 内 checklist 可以包含多个小闭环；不要在完成单个 checklist 项后停止并只建议下一步。

多个 Codex 窗口同时开发时，不要共用同一个 worktree 写文件。并行窗口必须使用独立 worktree 或独立分支；顺序接力时可以继续使用当前 handoff worktree。

## Task Template

执行批次 task 必须包含：

- Goal
- Scope
- Non-goals
- Acceptance
- Verification
- Assumption Checks
- Downstream Impact
- Completion Record
- Remaining Work

checklist 项可以写在同一个 task 文件内；除非该项需要跨多轮推进，否则不要制造过多 task 文件。

## Completion Standard

阶段级 goal 只有满足以下条件才算完成：

- 所有本地可完成 checklist 项完成。
- 每个 checklist 项都有目标测试或机器检查。
- `acceptance.json` 没有被削弱。
- `STATUS.md` 已回写。
- `tasks/README.md` 已回写。
- `README.md` 已回写。
- `DECISIONS.md` 已回写。
- 相关 `docs/acceptance` 已回写。
- 相关 `docs/deployment` 已回写。
- 统一验收命令已运行。
- 外部阻塞明确列出。
- Task 8 仍保持 `NOT_READY`。

## Stop Conditions

遇到以下情况必须停下来报告，不能绕过：

- 需要真实 DeepSeek key。
- 需要真实 webhook URL / secret。
- 需要声明客户正式生产备注模板已经确认。
- 需要声明客户 / PM 签字完成。
- 需要把 Task 8 改成 READY。
- 需要动主目录 `/Users/yuri/Documents/AI智能下单平台`。
- 需要 `git add` / commit / push。
- 需要新增较重依赖或改变架构。
- 文档、代码、验收矩阵冲突，且无法判断哪个是准的。

## Hard Boundaries

- 不把 `PARTIAL` 写成 `DONE`。
- 不把 `BLOCKED` 写成已解决。
- 不把默认模板写成客户正式模板。
- 不把本地检查通过写成真实环境验收通过。
- 不把阶段内 checklist 完成误写成一期整体 READY。
- 不伪造真实 DeepSeek key。
- 不伪造真实 webhook。
- 不伪造客户生产备注模板。
- 不伪造客户签字。
- 不伪造真实环境验收。

## Verification Matrix

文档 / RepoFrame 类任务至少运行：

```bash
npm run check:phase-one-closure-plan
npm run check:phase-one-workflow
npm run check:stage-goal-window
npm run check:repoframe-docs
python3 /Users/yuri/.codex/skills/repo-init/scripts/lint_acceptance.py --repo .
npm run acceptance
git diff --check
```

涉及 OpenAPI 时增加：

```bash
npm run check:openapi
```

涉及前端时增加：

```bash
npm run build:frontend
```

涉及 Task 8 readiness 时增加：

```bash
npm run check:task8-readiness-gaps
```

涉及客户 / PM 确认项与真实环境 AI 验收材料时优先运行：

```bash
npm run check:task9d72
npm run check:task9d80
npm run check:task9d81
npm run check:task8-readiness-gaps
```

## Output Rules

阶段级 goal 执行中：

- 只汇报当前 checklist 进度和验证结果。
- 不把单个 checklist 项完成当成整个 goal 完成。
- 不输出“下一步小任务建议”。

阶段级 goal 完成后，最终输出：

- 完成了什么。
- 验证命令和结果。
- 未完成原因或外部阻塞。
- 下一大目标建议。

真实阻塞时，最终输出：

- 阻塞项。
- 已完成内容。
- 未完成原因。
- 阻塞解除后继续哪个 checklist 项。

## RepoFrame File Rules

- `goals/GOAL-xxx.md` 记录阶段级大目标。
- `tasks/TASK-xxx.md` 记录该阶段的一次执行批次。
- checklist 写在 task 文件内。
- 只有跨多轮、风险较高或有独立验收矩阵的 checklist 项才拆新 task 文件。

当前 workflow 纳入记录：

- `goals/GOAL-006-phase-one-workflow-doc-20260707.md`
- `tasks/TASK-007-phase-one-workflow-doc-20260707.md`
- `docs/development/stage-goal-window-guide.md`
- `npm run check:phase-one-workflow`
- `npm run check:stage-goal-window`
