# RepoFrame doc hydration for phase-one handoff

<!-- repo-init:managed -->

## Metadata

- ID: `GOAL-003`
- Status: `completed`
- Type: `milestone`
- Mode: `repo-hydrate`
- Source: `handoff worktree / 2026-07-06 scope baseline / user-approved RepoFrame calibration plan`
- Created: `2026-07-07`
- Updated: `2026-07-07`

## Final Outcome

The handoff worktree has a consistent RepoFrame collaboration layer for continuing Task 8 phase-one closure without reinitializing the project.

The active entry points are `STATUS.md`, `tasks/README.md`, `acceptance.json`, this goal, and `tasks/TASK-004-repoframe-doc-hydration-20260707.md`.

## Human Acceptance

- A human can open `AGENTS.md`, `AGENT.md`, `README.md`, `PROJECT.md`, `STATUS.md`, `DECISIONS.md`, `goals/`, `tasks/`, `.repo-init/init-report.md`, and `acceptance.json` and see the same current execution state.
- The repository is clearly described as an existing handoff worktree, not a new project and not a fresh `initialize_repo.py` run.
- GOAL-001 remains historical, GOAL-002 / TASK-003 remain superseded, and GOAL-003 / TASK-004 are the current RepoFrame hydration route.
- Task 8 remains `NOT_READY`.
- Real DeepSeek key, real webhook, customer production-note template, customer signature, and real environment acceptance remain external blockers unless actually confirmed outside the repo.

## Machine Acceptance

- See `acceptance.json` goal `GOAL-003`.
- Primary verification: `python3 /Users/yuri/.codex/skills/repo-init/scripts/lint_acceptance.py --repo .`
- Project verification: `npm run check:repoframe-docs`, `npm run check:scope-baseline-20260706`, `npm run check:task9d99`, `npm run check:task8-readiness-gaps`, `npm run acceptance`, and `git diff --check`.

## Constraints

- Work only inside `/Users/yuri/Documents/AI智能下单平台-handoff-20260706`.
- Do not touch `/Users/yuri/Documents/AI智能下单平台`.
- Do not run `initialize_repo.py` for this already-initialized worktree.
- Do not change backend or frontend business code for this goal.
- Do not `git add`, commit, or push.
- Do not weaken real acceptance by claiming external work is complete.

## Current Strategy

- Treat this as RepoFrame `repo-hydrate` follow-through.
- Preserve existing project history while correcting active pointers.
- Replace stale initialization-era acceptance checks with current, machine-checkable RepoFrame hydration checks.
- Keep feature work for A/B class phase-one closure second increment as the next development route after this documentation calibration.

## Planned Tasks

- `tasks/TASK-004-repoframe-doc-hydration-20260707.md`: calibrate RepoFrame documents, acceptance entry, and non-business check script.

## Recommended Start

- Start with `tasks/TASK-004-repoframe-doc-hydration-20260707.md`.

## Observation Ledger

- Date=2026-07-07; Source=user-approved-plan; Observation=User confirmed this work must use RepoFrame only, target the handoff worktree, calibrate old acceptance checks, and stay within documentation plus non-business checks; Impact=revise-acceptance; Follow-up=Execute TASK-004.
- Date=2026-07-07; Source=TASK-004; Observation=RepoFrame documents, active pointers, acceptance checks, and `check:repoframe-docs` passed verification; Impact=keep; Follow-up=Start a separate RepoFrame task for A/B class phase-one closure second increment.

## Replan History

- 2026-07-07: Created GOAL-003 to supersede GOAL-001 as the active execution goal for RepoFrame document hydration while preserving GOAL-001 as historical initialization evidence.
- 2026-07-07: Completed GOAL-003 after RepoFrame linter, project checks, OpenAPI, acceptance, and `git diff --check` passed.

## Completion Record

- Completed: `2026-07-07`.
- Verification passed:
  - `python3 /Users/yuri/.codex/skills/repo-init/scripts/doctor.py`
  - `python3 /Users/yuri/.codex/skills/repo-init/scripts/lint_acceptance.py --repo .`
  - `npm run check:repoframe-docs`
  - `npm run check:scope-baseline-20260706`
  - `npm run check:task9d99`
  - `npm run check:task8-readiness-gaps`
  - `npm run acceptance`
  - `npm run check:openapi`
  - `git diff --check`
- Task 8 remains `NOT_READY`.

## Assumptions

- The 2026-07-06 scope baseline remains authoritative for current phase-one closure.
- 9D.99 remains the latest local A/B class display alignment increment.
- Task 8 cannot become READY without real external confirmations and real environment acceptance.
