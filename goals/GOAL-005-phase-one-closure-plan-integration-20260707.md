# GOAL-005 Phase One Closure Plan Integration

Status: `completed`

Mode: `repo-hydrate`

## Summary

Integrate `docs/development/phase-one-closure-technical-plan.md` into the current RepoFrame collaboration layer so the phase-one closure plan is a tracked project entry, not a loose document copied from another workspace.

Task 8 remains `NOT_READY`. This goal does not claim real DeepSeek keys, real webhook integration, customer production-note template approval, customer signature, payment/logistics platform integration, object storage acceptance, or production deployment acceptance.

## Scope

- Import the phase-one closure technical plan into the handoff worktree.
- Mark the plan as a RepoFrame-managed umbrella plan through GOAL-005 / TASK-006.
- Add `npm run check:phase-one-closure-plan`.
- Update `STATUS.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, and `acceptance.json`.
- Keep GOAL-004 / TASK-005 as completed A/B second-segment evidence.

## Non-goals

- Do not run `initialize_repo.py`.
- Do not modify backend business code, frontend business code, database migrations, OpenAPI contracts, or real deployment configuration.
- Do not touch `/Users/yuri/Documents/AI智能下单平台` except for read-only source inspection.
- Do not `git add`, commit, or push.
- Do not weaken `acceptance.json`.

## Acceptance

- `docs/development/phase-one-closure-technical-plan.md` exists in the handoff worktree and points to `/Users/yuri/Documents/AI智能下单平台-handoff-20260706`.
- The plan includes Summary, Current Baseline, Execution Phases, Test Plan, Hard Boundaries, and Remaining Blockers.
- The plan references the active gap ids: `customer-pm-confirmations`, `ai-production-governance`, `prd-v2-local-feature-gaps`, and `frontend-business-pages`.
- Project entry documents reference GOAL-005 / TASK-006 and `npm run check:phase-one-closure-plan`.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:phase-one-closure-plan
python3 /Users/yuri/.codex/skills/repo-init/scripts/lint_acceptance.py --repo .
npm run check:repoframe-docs
npm run acceptance
git diff --check
```

## Observation Ledger

- 2026-07-07: The source plan existed only in the original main project directory. It was imported into the handoff worktree as a preserved user-authored plan, then lightly annotated with RepoFrame integration metadata and the handoff worktree path.
- 2026-07-07: GOAL-004 / TASK-005 remains completed; GOAL-005 / TASK-006 only integrates the umbrella plan and does not change business implementation status.

## Replan Notes

Future phase-one work should derive tasks from this technical plan, `acceptance.json` gap ids, `docs/acceptance/prd-v2-gap-matrix.md`, and Task 8 readiness gaps. Remaining real external confirmations must stay BLOCKED / PARTIAL until the external evidence exists.
