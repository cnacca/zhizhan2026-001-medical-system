# TASK-018 Frontend Productization Closure

Status: `completed`

Goal: `goals/GOAL-017-frontend-productization-closure-20260707.md`

## Summary

Execute 四端前端产品化体验收口 as one batch task. This task keeps the work as one checklist instead of creating separate tasks for each portal, state surface, check, and documentation writeback.

## Scope

- Add a stage-level machine check before implementation and writeback.
- Productize locally available four-portal frontend entry points without claiming real external acceptance.
- Keep doctor file handling inside order attachments and design / bill flows.
- Keep equipment, material, safety, cost, and reward/penalty as local first-increment / PARTIAL.
- Repoint active RepoFrame metadata from GOAL-016 to GOAL-017.
- Update project entry docs, acceptance docs, deployment docs, and `acceptance.json`.

## Non-goals

- No independent doctor files module.
- No complete C-class equipment / material / safety / cost / reward closure.
- No real payment platform, real logistics platform, real e-signature, real DeepSeek key, real webhook, HTTPS, backup monitoring, customer signature, or real environment acceptance.
- No Task 8 READY claim.
- No git staging, commit, or push.

## Acceptance

- This task file contains checklist items with Scope / Non-goals / Acceptance / Verification.
- `check:frontend-productization-closure` validates this stage.
- Frontend productized entry points use current local APIs or explicit local-first-increment surfaces instead of generic demo placeholder language.
- Unified loading / empty / error / permission-denied state language is present in the frontend shell.
- Project entry docs point to GOAL-017 / TASK-018 and record this as local frontend productization, not complete customer acceptance.
- `frontend-business-pages` remains `PARTIAL`.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:frontend-productization-closure
npm run check:frontend-customer-smoke-closure
npm run build:frontend
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

## Checklist

- [x] Stage machine check.
  - Scope: add `scripts/check-frontend-productization-closure.mjs` and `check:frontend-productization-closure` to validate GOAL-017 / TASK-018, active RepoFrame pointers, frontend productization fragments, docs writeback, readiness gaps, and fake READY language.
  - Non-goals: do not replace existing GOAL-013 smoke closure checks; do not weaken readiness gaps; do not close unrelated external blockers.
  - Acceptance: the check fails before implementation / writeback and passes after all checklist items are complete.
  - Verification: `npm run check:frontend-productization-closure`.

- [x] Doctor and CS productization.
  - Scope: ensure doctor eight-module navigation remains order-centered and safe; productize CS order detail, initial review, collaboration, design / bill / delivery-facing entries using existing local routes and state language.
  - Non-goals: do not restore doctor files; do not connect real payment, real logistics, or real e-signature.
  - Acceptance: doctor files remain absent; CS design and billing entries route to local order / delivery workflows instead of generic placeholder-only pages; state language distinguishes local first increment from real external acceptance.
  - Verification: `npm run check:frontend-productization-closure`; `npm run check:frontend-customer-smoke-closure`.

- [x] Production and admin productization.
  - Scope: productize production review, task pool, process execution, quality / rework / final inspection, and local C-class support entries; clarify admin users / roles / permissions / clinics / products / dynamic forms as necessary phase-one entrances.
  - Non-goals: do not expand C-class modules into full phase-one closure; do not implement full RuoYi admin UI.
  - Acceptance: production support entries with existing local APIs are no longer generic demo placeholders; admin permission surfaces are labeled as local permission inventory / first increment, not complete RuoYi management UI.
  - Verification: `npm run check:frontend-productization-closure`; existing specific checks for changed routes where applicable.

- [x] Unified frontend state surfaces.
  - Scope: add shared local copy and shell markers for loading, empty, error, and permission-denied states across the frontend productization surface.
  - Non-goals: do not refactor the whole single-file frontend or introduce a new component library.
  - Acceptance: the frontend contains clear state copy for loading, empty, error, and permission denied; pages retain existing Element Plus patterns.
  - Verification: `npm run check:frontend-productization-closure`; `npm run build:frontend`.

- [x] RepoFrame and readiness writeback.
  - Scope: update `acceptance.json`, `STATUS.md`, `PROJECT.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, PRD V2 matrix, Task 8 matrix, readiness checklist, and final readiness report.
  - Non-goals: do not weaken acceptance gaps; do not mark Task 8 READY; do not close customer signature, real external services, or real environment blockers.
  - Acceptance: project docs point to GOAL-017 / TASK-018 and record frontend productization as a local closure stage while keeping `frontend-business-pages` as `PARTIAL`.
  - Verification: `npm run check:frontend-productization-closure`; `npm run check:task8-readiness-gaps`; `npm run acceptance`; `git diff --check`.

## Assumption Checks

- GOAL-016 remains completed and continues to guard auth / DataScope production closure B history.
- GOAL-013 remains completed and continues to guard four-end page evidence and customer smoke consolidation history.
- Current frontend remains a Vue3 + Element Plus single-file app for this closure; broad extraction is out of scope for this stage.
- Existing local APIs for production support modules are sufficient for first-increment productized entry pages.

## Downstream Impact

- Later frontend work can focus on real customer acceptance smoke, route-level refactor, real payment / logistics / e-signature integration, and full admin UI once scope is confirmed.

## Completion Record

- Added `npm run check:frontend-productization-closure`.
- Repointed active RepoFrame metadata from GOAL-016 to GOAL-017.
- Productized CS design and billing entries by routing them to existing local order-detail / delivery-billing workflows with explicit local-first-increment boundaries.
- Productized production support entries for equipment, material, safety, cost, and reward/penalty by keeping existing local summary / form flows outside the generic demo placeholder label.
- Added admin permission inventory display for account / role / permission entry points while keeping complete RuoYi management UI as remaining work.
- Added unified loading, empty, error, and permission-denied state copy in the frontend shell.
- Updated project and readiness docs while keeping `frontend-business-pages` as `PARTIAL` and Task 8 as `NOT_READY`.

## Remaining Work

- Real customer acceptance smoke remains open.
- Real payment and logistics platform integration remain open.
- Real e-signature / complex final report template remains open.
- Full RuoYi management UI remains open.
- C-class equipment / material / safety / cost / reward complete closure remains out of scope unless customer / PM changes phase-one scope.
- Real DeepSeek key, production webhook, HTTPS, backup monitoring, customer signature, and real environment acceptance remain external blockers.
