# Phase-one A/B data closure second increment

<!-- repo-init:managed -->

## Metadata

- ID: `TASK-005`
- Status: `completed`
- Owner: `shared`
- Goal: `GOAL-004-phase-one-ab-data-closure-20260707.md`
- Created: `2026-07-07`
- Updated: `2026-07-07`

## Why

9D.99 aligned A/B class menu labels and first display statistics, but the next gap is to move customer-service statistics, production statistics, internal/external returns, and bill/logistics manual status from display wording toward real APIs or reusable existing API data.

## Scope

- Audit current frontend dashboard values and backend APIs for the four target areas.
- Add `npm run check:task9d100` as the machine check for this second increment.
- Prefer existing backend APIs and reusable data before adding new endpoints.
- If a field still lacks a real local source, document it as PARTIAL or BLOCKED instead of faking it.
- Update `STATUS.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, `acceptance.json`, and related acceptance/deployment docs.

## Non-goals

- Do not connect real payment or logistics platforms.
- Do not fake real business statistics.
- Do not close customer / PM confirmations.
- Do not change real DeepSeek or webhook production state.
- Do not mark Task 8 READY.
- Do not modify the main worktree.
- Do not `git add`, commit, or push.

## Acceptance Criteria

- The target areas have explicit real/reused/PARTIAL/BLOCKED classification.
- `npm run check:task9d100` passes.
- OpenAPI is updated if new backend interfaces are added.
- Frontend build passes if frontend code changes.
- Task 8 remains `NOT_READY`.

## Verification Commands

```bash
npm run check:task9d100
npm run check:scope-baseline-20260706
npm run check:task9d99
npm run check:task8-readiness-gaps
npm run acceptance
npm run check:openapi
npm run build:frontend
git diff --check
```

## Assumption Checks

### Validated

- GOAL-003 / TASK-004 completed and RepoFrame linter passed.
- 9D.99 display alignment exists.
- Existing local APIs cover enough for a second increment without adding a backend summary endpoint:
  - `/orders?page=1&size=100`
  - `/messages/pending-review`
  - `/production/quality/summary`
  - `/logistics/orders?limit=50`
  - `/staff/workload?page=1&size=50`
  - production support summary APIs for equipment, material, safety, cost, and reward / penalty.

### Invalidated

- A new backend summary endpoint is not required for this increment.

### Still Open

- Month-over-month trend data is still PARTIAL because the reused order list does not expose a dedicated monthly trend aggregate.
- Real payment platform and real logistics platform remain external blockers.
- Customer / PM final statistical口径 for customer ranking, overdue bills, and production trend wording remains unconfirmed.

## Downstream Impact

### Affected Tasks

- Task 8 remains `NOT_READY`.
- `frontend-business-pages` and `prd-v2-local-feature-gaps` should move closer to local closure if this task succeeds.

### Suggested Follow-up

- After this task, continue with the next unblocked local PRD V2 gap or external confirmation templates.

## Completion Record

- 2026-07-07 completed as 9D.100 A/B 类一期范围对齐第二段.
- Frontend dashboard values for customer service and production now use `loadPhaseOneAbDashboardData`.
- Customer-service statistics reuse the local order list, pending message queue, logistics/manual payment state, and quality external rework summary.
- Production statistics reuse the local order list, pending message queue, quality/rework summary, staff workload, logistics state, and C-class production support summaries.
- No new backend endpoint, database migration, real payment integration, real logistics integration, DeepSeek production key, webhook, customer template, or customer signature was added.
- Verification target: `npm run check:task9d100`; full verification recorded in `STATUS.md` and `tasks/README.md`.

## Remaining Work

- Month-over-month dashboard trends need a dedicated aggregate if customer / PM requires true monthly comparison.
- Real overdue-bill semantics still require confirmed账期口径 or real finance data.
- Real payment and logistics platforms remain not connected.
- Task 8 remains `NOT_READY`.

## Known Risks

- Existing frontend may contain display-only numbers that should not be rebranded as real data without backend evidence.
- Some required values may need customer / PM or real external system confirmation.
- The current dashboard is a first local data-source increment; it should not be described as complete BI, finance, logistics, or production trend readiness.

## Execution Log

- `2026-07-07`: task started after GOAL-003 completion.
- `2026-07-07`: added `npm run check:task9d100` as the target guardrail.
- `2026-07-07`: implemented frontend reuse of existing local APIs for A/B dashboard statistics.
- `2026-07-07`: completed document and acceptance entry回写; Task 8 remains `NOT_READY`.
