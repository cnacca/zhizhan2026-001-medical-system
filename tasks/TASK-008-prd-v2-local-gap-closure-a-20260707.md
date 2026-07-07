# TASK-008 PRD V2 Local Gap Closure A

Status: `completed`

Goal: `goals/GOAL-007-prd-v2-local-gap-closure-a-20260707.md`

## Summary

Execute the PRD V2 local feature gap closure A batch. This task keeps the work as one batch with checklist items instead of creating one task per small item.

## Scope

- Establish the GOAL-007 / TASK-008 RepoFrame entry.
- Align the next local PRD V2 gap queue after 9D.100.
- Update acceptance and deployment documentation without changing business code.
- Add a machine check for this stage.

## Non-goals

- No backend business implementation.
- No frontend business implementation.
- No database migration.
- No OpenAPI contract change.
- No real DeepSeek key, webhook, payment platform, logistics platform, customer signature, or real environment acceptance.
- No Task 8 READY claim.
- No git staging, commit, or push.

## Acceptance

- This task file contains checklist items with Scope / Non-goals / Acceptance / Verification.
- `acceptance.json` active goal is GOAL-007.
- `package.json` contains `check:prd-v2-gap-closure-a`.
- PRD V2 matrix and readiness docs name the local closure A queue and keep external blockers explicit.
- Project entry docs point to GOAL-007 / TASK-008.

## Verification

```bash
npm run check:prd-v2-gap-closure-a
npm run check:task8-readiness-gaps
npm run check:task9d82
npm run acceptance
git diff --check
```

## Checklist

- [x] Stage container and machine check.
  - Scope: create GOAL-007, create TASK-008, add `scripts/check-prd-v2-local-gap-closure-a.mjs`, add `check:prd-v2-gap-closure-a`, and update `acceptance.json` active goal/checks.
  - Non-goals: no business code, no OpenAPI changes, no database migrations, no real external service configuration, no git staging or commit.
  - Acceptance: GOAL-007 / TASK-008 exist, acceptance points to GOAL-007, and the check script verifies required texts plus no fake READY claims.
  - Verification: `npm run check:prd-v2-gap-closure-a`; `npm run acceptance`.

- [x] PRD V2 local gap queue alignment.
  - Scope: update `docs/acceptance/prd-v2-gap-matrix.md` so closure A records the next local implementation-ready queue after 9D.100: quality record model/status workflow first, monthly trend/customer ranking only after PM confirms statistics rules, and AI-2 attachment preview / richer context as AI local follow-up.
  - Non-goals: do not implement those queues in this stage; do not treat real payment, logistics, DeepSeek, webhook, electronic signature, customer template, or customer signature as done.
  - Acceptance: matrix says 9D.83-9D.100 evidence remains valid, `prd-v2-local-feature-gaps` remains PARTIAL, customer / PM and true environment items remain BLOCKED or PARTIAL, and Task 8 remains NOT_READY.
  - Verification: `npm run check:prd-v2-gap-closure-a`; `npm run check:task9d82`.

- [x] Readiness and entry document writeback.
  - Scope: update `STATUS.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, `docs/acceptance/task-8-acceptance-matrix.md`, and `docs/deployment/readiness-checklist.md` with the closure A status, verification entry, and remaining blockers.
  - Non-goals: do not rewrite the full context pack; do not change confirmed product decisions; do not mark Task 8 READY.
  - Acceptance: entry documents point to GOAL-007 / TASK-008 and `check:prd-v2-gap-closure-a`; readiness keeps Task 8 NOT_READY and names external blockers.
  - Verification: `npm run check:prd-v2-gap-closure-a`; `npm run check:task8-readiness-gaps`; `git diff --check`.

## Assumption Checks

- Confirmed by source files: current workflow requires a stage-level goal and one execution-batch task.
- Confirmed by technical plan: this closure pass may be documentation and machine-check only.
- Confirmed by acceptance baseline: Task 8 must remain `NOT_READY`.
- Assumption: suffix `A` means the first closure pass for PRD V2 local gap alignment after A/B data closure, not a production implementation of all remaining local gaps.

## Downstream Impact

- Later implementation windows can choose one item from the queue without rediscovering the PRD V2 local gap state.
- Task 8 readiness checks remain conservative and should not allow fake external completion.
- `acceptance.json` now reflects the current active RepoFrame stage rather than the already completed workflow documentation stage.

## Completion Record

- Created GOAL-007 / TASK-008 as the current stage-level RepoFrame entry.
- Added `scripts/check-prd-v2-local-gap-closure-a.mjs` and `npm run check:prd-v2-gap-closure-a`.
- Updated `acceptance.json` active goal and GOAL-007 checks.
- Updated PRD V2 gap matrix, Task 8 acceptance matrix, readiness checklist, STATUS, tasks, README, and DECISIONS.
- Repaired the stale 9D.82 check assertion so it no longer points to the already completed A/B second segment.
- Task 8 remains `NOT_READY`.

## Remaining Work

- Implement the next local feature gap in a later stage-level goal if requested; recommended first local implementation candidate is quality record independent model / status workflow first segment.
- Customer / PM confirmation, true DeepSeek key, true webhook, true payment/logistics platforms, true electronic signature, and real environment acceptance remain external blockers.

## Known Risks

- Quality record independent model / workflow could become a real implementation task in a later window; if it expands beyond one local closure, it should receive its own implementation task or stage-level goal.
- Monthly trend and customer ranking are partly product-statistics questions; customer / PM confirmation may be required before implementation.
- Real key, webhook, deployment, payment, logistics, electronic signature, and customer signature blockers cannot be closed locally.
