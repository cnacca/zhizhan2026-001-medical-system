# TASK-016 Operations / Rollback / Training Closure

Status: `completed`

Goal: `goals/GOAL-015-operations-rollback-training-closure-20260707.md`

## Summary

Execute 操作手册 / 回滚 / 培训材料本地收口 as one batch task. This task keeps the work as one checklist instead of creating separate tasks for operation manual refresh, rollback template, training template, and document writeback.

## Scope

- Add a stage-level machine check before documentation writeback.
- Refresh current 9D.70 operation manual and troubleshooting guide with training and rollback boundaries.
- Add sanitized rollback and training templates for later true external verification.
- Repoint active RepoFrame metadata from GOAL-014 to GOAL-015.
- Update project entry docs, acceptance docs, deployment docs, operations docs, and `acceptance.json`.

## Non-goals

- No real production rollback rehearsal.
- No real server address, secret, production URL, certificate material, token, or customer private data.
- No customer training signoff or customer / PM signature claim.
- No real backup restore, monitoring alert, log retention, or release rollback acceptance claim.
- No new backend migration, frontend feature, deployment system, or architecture change.
- No Task 8 READY claim.
- No git staging, commit, or push.

## Acceptance

- This task file contains checklist items with Scope / Non-goals / Acceptance / Verification.
- `check:operations-rollback-training-closure` validates this stage.
- Existing 9D.70 evidence remains connected to `check:task9d70`.
- `docs/operations/phase-one-rollback-runbook.md` and `docs/operations/phase-one-training-materials.md` exist and keep true environment / customer signoff fields as `待填写` / `待确认`.
- Project entry docs point to GOAL-015 / TASK-016 and record this as operations / rollback / training local closure, not real production acceptance.
- `operations-manuals` remains `PARTIAL`.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:operations-rollback-training-closure
npm run check:task9d70
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

## Checklist

- [x] Stage machine check.
  - Scope: add `scripts/check-operations-rollback-training-closure.mjs` and `check:operations-rollback-training-closure` to validate GOAL-015 / TASK-016, operations docs, rollback template, training template, active RepoFrame pointers, readiness gaps, and fake READY language.
  - Non-goals: do not add browser automation here; do not weaken 9D.70 checks; do not remove external blockers.
  - Acceptance: the check fails before GOAL-015 / TASK-016 / template writeback and passes after writeback.
  - Verification: `npm run check:operations-rollback-training-closure`.

- [x] Operation manual refresh.
  - Scope: refresh the existing role operation manual and troubleshooting guide with local demo paths, training instructor checks, and release / rollback boundaries.
  - Non-goals: do not turn smoke accounts, local passwords, real customer examples, or true production runbooks into repository content.
  - Acceptance: the manual states the current paths are local first increments and do not represent customer training signoff.
  - Verification: `npm run check:operations-rollback-training-closure`; `npm run check:task9d70`.

- [x] Rollback and deployment runbook.
  - Scope: create `docs/operations/phase-one-rollback-runbook.md` with release prechecks, rollback triggers, rollback steps, data protection, evidence table, and blocked true-environment fields.
  - Non-goals: do not fill real hosts, real secrets, real backup paths, real registry credentials, real certificate material, or customer private data; do not claim the runbook has been exercised in production.
  - Acceptance: all true environment result cells remain `待填写` / `待确认`; boundary text says it does not represent real rollback rehearsal completion.
  - Verification: `npm run check:operations-rollback-training-closure`.

- [x] Training materials and signoff template.
  - Scope: create `docs/operations/phase-one-training-materials.md` with doctor, CS, production, admin, trainer checklist, attendance, and customer / PM signoff placeholders.
  - Non-goals: do not fill real attendee names, signatures, customer private data, or signed acceptance outcomes.
  - Acceptance: all signoff fields remain `待填写` / `待确认`; boundary text says it does not represent formal customer training signoff.
  - Verification: `npm run check:operations-rollback-training-closure`.

- [x] RepoFrame and readiness writeback.
  - Scope: update `acceptance.json`, `STATUS.md`, `PROJECT.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, PRD V2 matrix, Task 8 matrix, readiness checklist, final readiness report, and delivery material index.
  - Non-goals: do not weaken acceptance gaps; do not mark Task 8 READY; do not close real rollback rehearsal, customer training signoff, real deployment, backup restore, monitoring, customer signature, or real environment blockers.
  - Acceptance: project docs point to GOAL-015 / TASK-016 and record this as operations / rollback / training local closure with external blockers preserved.
  - Verification: `npm run check:operations-rollback-training-closure`; `npm run check:task8-readiness-gaps`; `npm run acceptance`; `git diff --check`.

## Assumption Checks

- GOAL-014 remains completed and continues to guard WebSocket / notification readiness history.
- 9D.70 remains the source evidence for current operation manual and delivery material first increment.
- Local templates are not substitutes for real rollback rehearsal, backup restore, monitoring alert acceptance, customer training signoff, customer / PM signature, or real environment acceptance.

## Downstream Impact

- Future customer training can start from one current GOAL-015 pointer and one sanitized training template.
- Future production deployment / rollback work can start from one sanitized rollback runbook template.
- Future real environment work still needs actual infrastructure, external secret injection, backup / monitoring evidence, and customer / PM decisions.

## Completion Record

- Added `npm run check:operations-rollback-training-closure`.
- Added `docs/operations/phase-one-rollback-runbook.md` as the sanitized rollback runbook template.
- Added `docs/operations/phase-one-training-materials.md` as the sanitized training and signoff template.
- Refreshed the role operation manual, troubleshooting guide, and delivery material index.
- Repointed active RepoFrame metadata from GOAL-014 to GOAL-015.
- Consolidated `operations-manuals` evidence in entry docs, acceptance docs, deployment docs, and `acceptance.json`.
- Verified `check:operations-rollback-training-closure`, `check:task9d70`, readiness gaps, acceptance JSON validity, and diff whitespace.
- Kept `operations-manuals` as `PARTIAL` and Task 8 as `NOT_READY`.

## Remaining Work

- Formal customer training session and signoff remain open.
- Real production rollback rehearsal remains open.
- Backup restore drill remains open.
- Log retention and monitoring alert acceptance remain open.
- Customer / PM signature and real environment acceptance remain open.
