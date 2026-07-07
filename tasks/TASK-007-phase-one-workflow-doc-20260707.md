# TASK-007 Phase One Workflow Doc

Status: `completed`

Goal: `goals/GOAL-006-phase-one-workflow-doc-20260707.md`

## Summary

Create a project-local workflow document that makes phase-one closure run as stage-level goals instead of isolated small-task suggestions.

## Scope

- Add `docs/development/workflow.md`.
- Add `docs/development/stage-goal-window-guide.md`.
- Add `scripts/check-phase-one-workflow.mjs`.
- Add `scripts/check-stage-goal-window-guide.mjs`.
- Add `check:phase-one-workflow` to `package.json`.
- Add `check:stage-goal-window` to `package.json`.
- Update `acceptance.json`, `STATUS.md`, `tasks/README.md`, `README.md`, and `DECISIONS.md`.

## Non-goals

- No backend business code changes.
- No frontend business code changes.
- No OpenAPI changes.
- No database migration changes.
- No real DeepSeek key, webhook, customer template, customer signature, or real environment acceptance.
- No git staging, commit, or push.
- No restoration of global Yuri workflow/SOP.

## Acceptance

- Workflow is located at `docs/development/workflow.md`.
- Workflow explicitly says default goal granularity is stage-level.
- Window guide includes the startup prompt for one-stage-goal-per-window execution.
- Workflow includes the confirmed stop conditions and completion standard.
- Workflow includes verification matrix and output rules.
- Workflow says Task 8 remains `NOT_READY`.
- Machine check verifies the workflow and forbids fake-completion claims.

## Verification

```bash
npm run check:phase-one-workflow
npm run check:stage-goal-window
npm run check:phase-one-closure-plan
npm run check:repoframe-docs
python3 /Users/yuri/.codex/skills/repo-init/scripts/lint_acceptance.py --repo .
npm run acceptance
git diff --check
```

## Assumption Checks

- Confirmed: default goal granularity is phase/stage-level.
- Confirmed: Codex should self-split checklist items inside the execution task.
- Confirmed: the listed stop conditions are enough.
- Confirmed: a stage-level goal is complete only after local checklist items, verification, and documentation writeback are done.
- Confirmed: this workflow is only for the current project.
- Confirmed: external SOP is temporarily unused for this project workflow.

## Downstream Impact

- Future tasks should not stop after a small checklist item just to suggest the next small task.
- Future execution should track progress against the current stage-level goal until completion or real blocker.
- Future Codex windows should start from `docs/development/stage-goal-window-guide.md`.
- RepoFrame remains the collaboration layer; global Yuri workflow/SOP remains paused for this project.

## Completion Record

- Created `docs/development/workflow.md`.
- Created `docs/development/stage-goal-window-guide.md`.
- Added `scripts/check-phase-one-workflow.mjs`.
- Added `scripts/check-stage-goal-window-guide.mjs`.
- Updated RepoFrame entry documents and acceptance checks.
- Task 8 remains `NOT_READY`.
