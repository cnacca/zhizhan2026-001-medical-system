# TASK-011 PRD V2 Local Gap Closure D

Status: `completed`

Goal: `goals/GOAL-010-prd-v2-local-gap-closure-d-20260707.md`

## Summary

Execute the final local PRD V2 feature gap closure D batch. This task keeps the work as one batch with checklist items instead of creating one task per small item.

## Scope

- Implement monthly trend / customer ranking aggregation first segment.
- Keep dashboard aggregation behind internal permissions and existing data scope.
- Update OpenAPI, frontend CS / production dashboards, acceptance/readiness docs, and machine checks.

## Non-goals

- No real payment platform, real logistics platform, real DeepSeek key, webhook, customer signature, or real environment acceptance.
- No customer-final statistics口径 claim.
- No automatic month-end billing, real aging, or financial BI close.
- No doctor-facing exposure of internal dashboard aggregation.
- No Task 8 READY claim.
- No git staging, commit, or push.

## Acceptance

- This task file contains checklist items with Scope / Non-goals / Acceptance / Verification.
- `/dashboards/phase-one-ab` includes current-month / previous-month totals and Top customer ranking.
- Endpoint remains forbidden to DOCTOR and scoped for internal identities.
- Frontend consumes the local monthly trend endpoint.
- OpenAPI and acceptance/readiness docs are updated.
- `acceptance.json` active goal is GOAL-010.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:prd-v2-gap-closure-d
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=PhaseOneDashboardTests test
npm run check:openapi
npm run build:frontend
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

## Checklist

- [x] Stage container and failing target test.
  - Scope: create GOAL-010 / TASK-011, package script, stage check, and target tests for dashboard monthly trend aggregation before implementation.
  - Non-goals: no production implementation before the failing test; no external service or readiness claims.
  - Acceptance: target test fails for the expected missing endpoint behavior, not because of syntax or setup errors.
  - Verification: `npm run check:prd-v2-gap-closure-d`; `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=PhaseOneDashboardTests test`.

- [x] Backend monthly trend and customer ranking aggregation.
  - Scope: aggregate scoped order totals for current and previous month, Top customer ranking, production exception count, pending question count, shipping rate, and completion rate.
  - Non-goals: no customer-final BI口径, no real payment or logistics integration, no doctor exposure.
  - Acceptance: CS / ADMIN / WORKER receive scoped aggregation; DOCTOR remains forbidden; response omits secrets and raw internal notes.
  - Verification: `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=PhaseOneDashboardTests test`.

- [x] Frontend and OpenAPI contract.
  - Scope: update dashboard response types and CS / production trends to use the new local aggregation; update OpenAPI schemas.
  - Non-goals: no full BI dashboard, no real external integrations, no customer-final statistics claim.
  - Acceptance: frontend build passes; OpenAPI check passes; UI no longer displays the missing monthly trend endpoint message.
  - Verification: `npm run check:openapi`; `npm run build:frontend`.

- [x] Machine checks and documentation writeback.
  - Scope: add `check:prd-v2-gap-closure-d`, update `acceptance.json`, `STATUS.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, PRD V2 matrix, Task 8 matrix, and readiness checklist.
  - Non-goals: do not weaken acceptance gaps; do not mark Task 8 READY; do not close customer / PM or real-environment blockers.
  - Acceptance: project docs point to GOAL-010 / TASK-011 and record monthly trend aggregation as local progress.
  - Verification: `npm run check:prd-v2-gap-closure-d`; `npm run check:task8-readiness-gaps`; `npm run acceptance`; `git diff --check`.

## Assumption Checks

- Current `acceptance.json` and PRD V2 matrix list monthly trend / customer ranking as the remaining local implementation-ready PRD V2 gap.
- Real payment, real logistics, real key, customer signatures, and customer-final statistics口径 remain external blockers.
- C 类 equipment/material/safety/cost/reward modules remain basic capability evidence and are not expanded into complete management closure.

## Downstream Impact

- Later customer / PM work can replace the default aggregation wording with confirmed statistics口径 without rewriting the local dashboard contract.

## Completion Record

- Added GOAL-010 / TASK-011 as the PRD V2 local feature gap closure D container.
- Added `GET /dashboards/phase-one-ab` for scoped internal monthly trend, item totals, customer ranking, production exception count, pending question count, shipping rate, and completion rate.
- Added backend tests covering CS access and DOCTOR rejection.
- Updated CS / production dashboard aggregation to consume the local monthly trend / customer ranking endpoint.
- Updated OpenAPI, `acceptance.json`, readiness docs, and project entry docs.

## Remaining Work

- Local implementation-ready PRD V2 feature gap queue is closed for this batch.
- Remaining Task 8 blockers are external or confirmation-bound: real payment/logistics platforms, real DeepSeek key / webhook environment, customer / PM final statistics and AI口径 confirmation, customer signatures, and real environment acceptance.

## Known Risks

- Dashboard numbers are local operational aggregates and must not be described as customer-final financial or logistics statistics.
