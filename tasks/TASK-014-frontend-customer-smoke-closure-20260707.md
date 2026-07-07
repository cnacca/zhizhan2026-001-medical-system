# TASK-014 Frontend Customer Smoke Closure

Status: `completed`

Goal: `goals/GOAL-013-frontend-customer-smoke-closure-20260707.md`

## Summary

Execute 四端业务页面与客户验收 smoke 收口 as one batch task. This task keeps the work as one checklist instead of creating separate tasks for each smoke, page group, or document.

## Scope

- Add a stage-level machine check before documentation writeback.
- Consolidate four-end page evidence from existing four-portal login, four-end display, operations manual, and frontend alignment artifacts.
- Consolidate customer acceptance smoke evidence from the existing 12-step browser smoke and customer-readable PASS/FAIL record.
- Repoint active RepoFrame metadata from GOAL-012 to GOAL-013.
- Update project entry docs, acceptance docs, deployment docs, and `acceptance.json`.

## Non-goals

- No real customer signature or customer / PM confirmation.
- No real DeepSeek key, webhook, signing secret, receiver secret, production host, certificate, or real credential.
- No real payment platform, logistics platform, electronic signature, HTTPS, backup recovery, monitoring, or production environment acceptance.
- No new backend migration or architecture change.
- No complete Spring Security/JWT, generic SQL DataScope, RuoYi management UI, token blacklist, refresh rotation, or multi-device session policy.
- No Task 8 READY claim.
- No git staging, commit, or push.

## Acceptance

- This task file contains checklist items with Scope / Non-goals / Acceptance / Verification.
- `check:frontend-customer-smoke-closure` validates this stage.
- Four-end page evidence remains connected to `check:task9d24`, `check:task9d36`, `smoke:task9d24`, `smoke:task9d36`, `check:task9d70`, frontend alignment docs, and operations manual docs.
- Customer acceptance smoke evidence remains connected to `check:task9d62`, `smoke:task9d62`, `check:task9d68`, and `docs/acceptance/phase-one-main-chain-customer-acceptance.md`.
- Project entry docs point to GOAL-013 / TASK-014 and record this as a frontend / customer-smoke consolidation stage, not real customer acceptance.
- `frontend-business-pages` remains `PARTIAL`.
- `customer-pm-confirmations` remains `BLOCKED`.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:frontend-customer-smoke-closure
npm run check:task9d24
npm run check:task9d36
npm run check:task9d62
npm run check:task9d68
npm run check:task9d70
npm run check:task8-readiness-gaps
npm run acceptance
npm run build:frontend
git diff --check
```

Optional real browser smoke when local services are available:

```bash
npm run smoke:task9d24
npm run smoke:task9d36
npm run smoke:task9d62
```

## Checklist

- [x] Stage machine check.
  - Scope: add `scripts/check-frontend-customer-smoke-closure.mjs` and `check:frontend-customer-smoke-closure` to validate GOAL-013 / TASK-014, four-end evidence, customer smoke evidence, active RepoFrame pointers, readiness gaps, and fake READY language.
  - Non-goals: do not add browser automation here; do not weaken existing 9D checks; do not remove external blockers.
  - Acceptance: the check fails before the script / entry exists and passes after writeback.
  - Verification: `npm run check:frontend-customer-smoke-closure`.

- [x] Four-end page evidence consolidation.
  - Scope: point current docs and `acceptance.json` to existing four-portal login, four-end display, operations manual, frontend alignment, and role entry evidence.
  - Non-goals: do not redesign pages, add new UI modules, restore out-of-scope doctor file center, or mark placeholders as complete.
  - Acceptance: checks for `check:task9d24`, `check:task9d36`, `check:task9d70`, `smoke:task9d24`, and `smoke:task9d36` remain present; docs state the stage is first-increment / PARTIAL.
  - Verification: `npm run check:frontend-customer-smoke-closure`; `npm run check:task9d24`; `npm run check:task9d36`; `npm run check:task9d70`.

- [x] Customer acceptance smoke consolidation.
  - Scope: connect current docs and `acceptance.json` to `smoke:task9d62`, `check:task9d62`, `check:task9d68`, and `phase-one-main-chain-customer-acceptance.md`.
  - Non-goals: do not write customer signature, do not fill real environment fields, and do not claim the 12-step record is a final customer acceptance.
  - Acceptance: customer smoke docs retain PASS / PARTIAL / BLOCKED wording, remaining gaps, recommended commands, and Task 8 `NOT_READY`.
  - Verification: `npm run check:frontend-customer-smoke-closure`; `npm run check:task9d62`; `npm run check:task9d68`.

- [x] RepoFrame and readiness writeback.
  - Scope: update `acceptance.json`, `STATUS.md`, `PROJECT.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, PRD V2 matrix, Task 8 matrix, readiness checklist, and final readiness report.
  - Non-goals: do not weaken acceptance gaps; do not mark Task 8 READY; do not close real payment / logistics, real AI key / webhook, customer signature, real deployment, or production auth blockers.
  - Acceptance: project docs point to GOAL-013 / TASK-014 and record this as frontend / customer-smoke consolidation with external blockers preserved.
  - Verification: `npm run check:frontend-customer-smoke-closure`; `npm run check:task8-readiness-gaps`; `npm run acceptance`; `git diff --check`.

## Assumption Checks

- GOAL-012 remains completed and continues to guard auth / DataScope production-hardening history.
- 9D.24, 9D.36, 9D.62, 9D.68, and 9D.70 remain the source evidence for four-end pages and customer-readable smoke.
- Local smoke evidence is not a substitute for customer / PM signature or real environment acceptance.

## Downstream Impact

- Future customer acceptance work can start from one current GOAL-013 pointer instead of reassembling four-end page and smoke evidence from scattered 9D records.
- Future real acceptance work still needs real environment inputs and customer / PM decisions.

## Completion Record

- Added `npm run check:frontend-customer-smoke-closure`.
- Repointed active RepoFrame metadata from GOAL-012 to GOAL-013.
- Consolidated four-end page and 12-step customer smoke evidence in entry docs and readiness docs.
- Re-ran real browser smoke: four-portal login passed, four-end theme stability passed, and 12-step main-chain smoke completed with `order_no=ORD20260707-BA11CBB264`, `order_id=9494`, `instance_id=4082`, `rework_id=1042`, and final `external_status=COMPLETED`.
- Kept `frontend-business-pages` as `PARTIAL`, `customer-pm-confirmations` as `BLOCKED`, and Task 8 as `NOT_READY`.

## Remaining Work

- Customer / PM signature and CP-001 to CP-009 confirmation remain open.
- Real DeepSeek key and production webhook integration remain open.
- Real deployment, HTTPS, backup recovery, monitoring, and production smoke remain open.
- Real payment / logistics platforms and electronic signature remain open or external.
- Complete production auth strategy and full RuoYi management UI remain open.
