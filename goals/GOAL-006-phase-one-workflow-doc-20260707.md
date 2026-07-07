# GOAL-006 Phase One Workflow Doc

Status: `completed`

Mode: `repo-hydrate`

## Summary

Create a project-local phase-one closure workflow that converts the technical plan into execution rules for stage-level goals.

This goal does not restart the project, restore Yuri workflow/SOP, or change business scope. Task 8 remains `NOT_READY`.

## Scope

- Create `docs/development/workflow.md`.
- Create `docs/development/stage-goal-window-guide.md`.
- Define stage-level goal execution as the default workflow.
- Add `npm run check:phase-one-workflow`.
- Add `npm run check:stage-goal-window`.
- Update RepoFrame entry documents and `acceptance.json`.
- Keep GOAL-005 / TASK-006 as the technical-plan integration evidence.

## Non-goals

- Do not run `initialize_repo.py`.
- Do not modify backend business code, frontend business code, database migrations, OpenAPI contracts, or real deployment configuration.
- Do not touch `/Users/yuri/Documents/AI智能下单平台`.
- Do not `git add`, commit, or push.
- Do not weaken `acceptance.json`.
- Do not restore global Yuri workflow/SOP.

## Acceptance

- `docs/development/workflow.md` exists and is project-local.
- The workflow uses stage-level goals by default.
- The window guide provides the exact startup prompt for one-stage-goal-per-window execution.
- The workflow says Codex should not stop after each small task to suggest the next small task.
- The workflow includes source-of-truth files, execution loop, task template, completion standard, stop conditions, verification matrix, output rules, and RepoFrame file rules.
- Task 8 remains `NOT_READY`.

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

## Observation Ledger

- 2026-07-07: User confirmed default goal granularity should be stage-level, Codex should self-split checklist items, stop conditions listed by the assistant are enough, and next-step output should be only next large goal after the stage-level goal completes.
- 2026-07-07: The workflow is project-local and must not revive the paused global workflow/SOP.
- 2026-07-07: User confirmed external SOP is temporarily unused; each new Codex window should start from the project-local stage-goal window guide.

## Replan Notes

Future phase-one execution should create a stage-level goal and one execution-batch task, then track small items as checklist entries inside that task unless they are large enough to require independent files.
