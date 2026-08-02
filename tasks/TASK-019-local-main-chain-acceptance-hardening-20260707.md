# TASK-019 Local Main Chain Acceptance Hardening

Status: `completed`

Goal: `goals/GOAL-018-local-main-chain-acceptance-hardening-20260707.md`

## Summary

Execute 本地 12 步主链路验收增强 as one batch task. This task keeps the work as one checklist instead of creating separate tasks for smoke diagnostics, role assertions, customer-readable records, and readiness writeback.

## Scope

- Add a stage-level machine check before implementation and writeback.
- Harden the local 12-step fixed-demo smoke with role-boundary assertions and clearer diagnostics.
- Update customer-readable main-chain acceptance evidence without claiming customer signature.
- Repoint active RepoFrame metadata from GOAL-017 to GOAL-018.
- Update project entry docs, acceptance docs, deployment docs, and `acceptance.json`.

## Non-goals

- No real customer acceptance, customer / PM signature, or real environment acceptance.
- No real DeepSeek key, webhook URL / secret, payment platform, logistics platform, e-signature, HTTPS, production deployment, backup monitoring, production host, certificate, token, or customer private data.
- No Task 8 READY claim.
- No git staging, commit, or push.

## Acceptance

- This task file contains checklist items with Scope / Non-goals / Acceptance / Verification.
- `check:local-main-chain-acceptance-hardening` validates this stage.
- `smoke:task9d62` includes doctor safe projection, CS internal visibility, worker task scope, and admin assignment / reassignment assertions.
- Project entry docs point to GOAL-018 / TASK-019 and record this as local main-chain acceptance hardening, not complete customer acceptance.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:local-main-chain-acceptance-hardening
npm run check:task9d62
npm run smoke:task9d62
npm run check:task9d68
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

## Checklist

- [x] Stage machine check.
  - Scope: add `scripts/check-local-main-chain-acceptance-hardening.mjs` and `check:local-main-chain-acceptance-hardening` to validate GOAL-018 / TASK-019, active RepoFrame pointers, smoke role-boundary assertions, docs writeback, readiness gaps, and fake READY language.
  - Non-goals: do not weaken existing GOAL-013 / GOAL-017 checks; do not close unrelated external blockers; do not mark customer acceptance complete.
  - Acceptance: the check fails before implementation / writeback and passes after all checklist items are complete.
  - Verification: `npm run check:local-main-chain-acceptance-hardening`.

- [x] 12-step smoke diagnostics and role assertions.
  - Scope: extend `scripts/smoke-task-9d62-main-chain.spec.mjs` with local fixed-demo assertions for doctor safe projection, CS internal visibility, worker assigned-task scope, and admin assignment / reassignment; extend `check:task9d62` to guard those fragments.
  - Non-goals: do not add new business endpoints; do not require real customer accounts, production data, real payment, real logistics, or real e-signature.
  - Acceptance: `smoke:task9d62` still covers doctor order -> CS review -> production review -> process instance -> assignment -> in/out checks / worklog -> rework -> design draft -> bill / logistics -> final inspection completion -> shipping -> doctor receipt, with added role-boundary diagnostics.
  - Verification: `npm run check:task9d62`; `npm run smoke:task9d62`; `npm run check:local-main-chain-acceptance-hardening`.

- [x] Customer-readable acceptance record writeback.
  - Scope: update `docs/acceptance/phase-one-main-chain-customer-acceptance.md` with GOAL-018 local hardening evidence, role-boundary diagnostics, and rerun commands.
  - Non-goals: do not write customer / PM signature, real environment result, real key, real webhook, real payment / logistics platform, or real e-signature as complete.
  - Acceptance: the record remains `FIRST_INCREMENT / NOT_READY`, describes local hardening only, and continues to list remaining customer / real-environment gaps.
  - Verification: `npm run check:task9d68`; `npm run check:local-main-chain-acceptance-hardening`.

- [x] Task 8 readiness boundary writeback.
  - Scope: update `acceptance.json`, `STATUS.md`, `PROJECT.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, PRD V2 matrix, Task 8 matrix, readiness checklist, and final readiness report.
  - Non-goals: do not weaken acceptance gaps; do not mark Task 8 READY; do not close customer signature, real external services, or real environment blockers.
  - Acceptance: project docs point to GOAL-018 / TASK-019 and record local 12-step main-chain hardening while keeping Task 8 as `NOT_READY` and readiness gaps as `PARTIAL` / `BLOCKED`.
  - Verification: `npm run check:local-main-chain-acceptance-hardening`; `npm run check:task8-readiness-gaps`; `npm run acceptance`; `git diff --check`.

## Assumption Checks

- GOAL-017 remains completed and continues to guard local frontend productization history.
- GOAL-013 remains completed and continues to guard four-end page evidence and customer smoke consolidation history.
- Current `smoke:task9d62` may append local test data and must not reset Docker volumes, delete historical data, or require real external services.
- Task 8 cannot become READY without real customer / PM confirmation and real environment evidence.

## Downstream Impact

- Later acceptance work can focus on customer click-through evidence, real environment smoke, real payment / logistics integration, real electronic signature, or customer / PM signed closure.

## Completion Record

- Added `npm run check:local-main-chain-acceptance-hardening`.
- Repointed active RepoFrame metadata from GOAL-017 to GOAL-018.
- Hardened `smoke:task9d62` with doctor safe projection, CS internal visibility, worker task scope, and admin assignment / reassignment diagnostics.
- Updated the customer-readable 12-step acceptance record while keeping it as local FIRST_INCREMENT / NOT_READY evidence.
- Updated project and readiness docs while keeping all real external blockers open and Task 8 as `NOT_READY`.

## Remaining Work

- Real customer / PM click-through acceptance remains open.
- Real payment and logistics platform integration remain open.
- Real e-signature / complex final report template remains open.
- Real DeepSeek key, production webhook, HTTPS, backup monitoring, customer signature, and real environment acceptance remain external blockers.
