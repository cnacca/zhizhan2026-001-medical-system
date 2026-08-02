# TASK-006 Phase One Closure Plan Integration

Status: `completed`

Goal: `goals/GOAL-005-phase-one-closure-plan-integration-20260707.md`

## Summary

Bring the discussed phase-one closure technical plan into the handoff RepoFrame layer and make it machine-checkable.

## Scope

- Import `docs/development/phase-one-closure-technical-plan.md` into the handoff worktree.
- Add RepoFrame integration metadata to the plan.
- Add a package script and checker: `npm run check:phase-one-closure-plan`.
- Update RepoFrame entry documents and `acceptance.json`.

## Non-goals

- No backend business changes.
- No frontend business changes.
- No database migration changes.
- No OpenAPI contract changes.
- No real DeepSeek key, webhook, customer template, customer signature, payment/logistics platform, object storage, or production deployment acceptance.
- No git staging, commit, or push.

## Acceptance

- The plan exists at `docs/development/phase-one-closure-technical-plan.md`.
- The plan names GOAL-005 / TASK-006 and the handoff worktree path.
- The checker verifies required sections, gap ids, 9D.90 / 9D.91 / 9D.92 / 9D.97 / 9D.98 status wording, hard boundaries, and forbidden fake-completion claims.
- `STATUS.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, and `acceptance.json` reference this task.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:phase-one-closure-plan
python3 /Users/yuri/.codex/skills/repo-init/scripts/lint_acceptance.py --repo .
npm run check:repoframe-docs
npm run acceptance
git diff --check
```

## Assumption Checks

- Confirmed: the source plan was found at `/Users/yuri/Documents/AI智能下单平台/docs/development/phase-one-closure-technical-plan.md`.
- Confirmed: the handoff worktree did not already contain this file.
- Confirmed: integration should happen in `/Users/yuri/Documents/AI智能下单平台-handoff-20260706`, not the original main directory.
- Confirmed: this task is documentation and non-business checks only.

## Downstream Impact

- Future phase-one closure tasks can cite this technical plan as the umbrella execution plan.
- GOAL-004 / TASK-005 remains the completed A/B second-segment evidence.
- The next implementation task should be split from the plan and tied to one or more `acceptance.json` gap ids.

## Completion Record

- Imported and annotated `docs/development/phase-one-closure-technical-plan.md`.
- Added `scripts/check-phase-one-closure-plan.mjs` and `check:phase-one-closure-plan`.
- Updated RepoFrame entry documents and acceptance checks.
- Task 8 remains `NOT_READY`.
