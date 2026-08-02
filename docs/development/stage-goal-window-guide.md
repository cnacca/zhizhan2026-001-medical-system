# Codex Stage Goal Window Guide

状态：ACTIVE / PROJECT_LOCAL。

更新日期：2026-07-07。

## Purpose

本指南用于每个新的 Codex 窗口接手当前 handoff worktree 时启动阶段级 goal。

当前项目不按单个 9D 小任务作为默认执行粒度。每个窗口应只认领一个阶段级 goal，并在该 goal 下建立或更新一个执行批次 task，再把本轮要做的多个小闭环写成 task 内 checklist。

本指南只依赖当前项目文档：

- `docs/development/workflow.md`
- `docs/development/phase-one-closure-technical-plan.md`
- `acceptance.json`
- `docs/acceptance/prd-v2-gap-matrix.md`
- `docs/acceptance/task-8-acceptance-matrix.md`
- `docs/deployment/readiness-checklist.md`

不启用外部 SOP，不重新初始化项目，不运行 `initialize_repo.py`。

## Window Startup Prompt

新窗口启动时使用以下提示：

```text
请在 /Users/yuri/Documents/AI智能下单平台-handoff-20260706 接手当前项目。

本窗口只执行一个阶段级 goal，不做单个小任务闭环。请严格按 docs/development/workflow.md 和 docs/development/phase-one-closure-technical-plan.md 执行。

本窗口目标是：[填阶段名，例如“第二段：PRD V2 本地功能差异收口”]。

要求：
1. 先读取 STATUS.md、docs/development/workflow.md、docs/development/phase-one-closure-technical-plan.md、acceptance.json、docs/acceptance/prd-v2-gap-matrix.md、docs/acceptance/task-8-acceptance-matrix.md、docs/deployment/readiness-checklist.md。
2. 建立或更新一个阶段级 RepoFrame goal。
3. 建立一个执行批次 task，并在 task 内拆 checklist。
4. 不要把每个 checklist 项拆成独立 task，除非它跨多轮或风险很高。
5. 不要完成一个小项就停止建议下一步；要持续推进，直到整个阶段级 goal 完成或遇到真实阻塞。
6. 每个 checklist 项必须有 Scope / Non-goals / Acceptance / Verification。
7. 每完成一个 checklist 项就运行对应验证。
8. 结束前必须回写 STATUS.md、tasks/README.md、README.md、DECISIONS.md、acceptance.json 和相关 docs/acceptance、docs/deployment。
9. Task 8 必须保持 NOT_READY，不能伪造真实 key、真实 webhook、客户签字或真实环境验收。
10. 最终输出完成内容、验证命令、剩余阻塞和接力摘要。
```

## Execution Rules

- 一个窗口只执行一个阶段级 goal。
- 一个阶段级 goal 下只建立一个执行批次 task。
- checklist 写在该 task 内，除非某项跨多轮、风险很高或已有独立验收矩阵。
- Codex 应自行拆解 checklist、逐项实现、逐项验证和回写。
- 完成单个 checklist 项不等于完成阶段级 goal。
- 阶段级 goal 完成前，不输出“下一步小任务建议”。
- 只有阶段级 goal 完成后，才输出下一大目标建议。

## Parallel Window Rules

- 多个 Codex 窗口同时开发时，不要共用同一个 worktree 写文件。
- 并行窗口必须使用独立 worktree 或独立分支，避免互相覆盖。
- 如果只在当前 handoff worktree 顺序接力，则一个窗口完成一个阶段级 goal 后，再开下一个窗口继续。

## Required Verification

每个阶段至少运行：

```bash
npm run check:phase-one-closure-plan
npm run check:phase-one-workflow
npm run check:repoframe-docs
npm run acceptance
git diff --check
```

按内容追加：

```bash
npm run check:task8-readiness-gaps
npm run check:openapi
npm run build:frontend
npm run check:task9d72
npm run check:task9d80
npm run check:task9d81
```

## Hard Boundaries

- 不把 Task 8 写成 READY。
- 不伪造真实 DeepSeek key。
- 不伪造真实 webhook。
- 不伪造客户 / PM 签字。
- 不伪造真实服务器、HTTPS、对象存储、AI 联调或生产验收。
- 不动主目录 `/Users/yuri/Documents/AI智能下单平台`。
- 不 `git add`、commit 或 push，除非用户明确要求。
