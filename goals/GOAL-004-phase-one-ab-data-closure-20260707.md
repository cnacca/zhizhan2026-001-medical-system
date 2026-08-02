# Phase-one A/B data closure second increment

<!-- repo-init:managed -->

## Metadata

- ID: `GOAL-004`
- Status: `completed`
- Type: `milestone`
- Mode: `repo-hydrate`
- Source: `STATUS.md / tasks/README.md recommended replan after GOAL-003`
- Created: `2026-07-07`
- Updated: `2026-07-07`

## Final Outcome

A/B class phase-one dashboard and manual-status surfaces use real APIs or reusable existing API data instead of display-only hardcoded values for the second increment.

## Human Acceptance

- Customer-service statistics, production statistics, internal/external returns, and bill/logistics manual status surfaces are clearly classified as real API data, reusable existing API data, or still blocked.
- Local code does not fake real payment platforms, real logistics platforms, real customer signature, real webhook, or real DeepSeek production acceptance.
- Task 8 remains `NOT_READY`.
- A follow-up agent can see what was implemented, what remains blocked, and which commands verify it.

## Machine Acceptance

- See `acceptance.json` goal `GOAL-004`.
- Target check: `npm run check:task9d100`.
- Project checks: `npm run check:scope-baseline-20260706`, `npm run check:task9d99`, `npm run check:task8-readiness-gaps`, `npm run acceptance`, `npm run check:openapi`, `npm run build:frontend`, and `git diff --check`.

## Constraints

- Work only inside `/Users/yuri/Documents/AI智能下单平台-handoff-20260706`.
- Do not touch `/Users/yuri/Documents/AI智能下单平台`.
- Do not `git add`, commit, or push.
- Do not connect real payment, logistics, DeepSeek key, webhook, customer template, signature, or real production environment.
- Preserve doctor-side internal data isolation.
- Keep Task 8 `NOT_READY`.

## Current Strategy

- Start from current 9D.99 display alignment.
- Prefer existing backend summaries and existing manual status APIs before adding new interfaces.
- 9D.100 completed the second increment by reusing `/orders`, `/messages/pending-review`, `/production/quality/summary`, `/logistics/orders`, `/staff/workload`, and the production support summary APIs.
- Record remaining external blockers instead of pretending they are complete.

## Planned Tasks

- `tasks/TASK-005-phase-one-ab-data-closure-20260707.md`: implement and document A/B class data closure second increment.

## Recommended Start

- Start with `tasks/TASK-005-phase-one-ab-data-closure-20260707.md`.

## Observation Ledger

- Date=2026-07-07; Source=GOAL-003; Observation=RepoFrame documentation calibration is complete and the next recommended development route is A/B class phase-one closure second increment; Impact=reorder; Follow-up=Execute TASK-005.
- Date=2026-07-07; Source=TASK-005; Observation=Customer-service and production dashboard values now reuse existing local APIs for orders, pending messages, quality/rework, manual bill/logistics state, staff workload, and C-class production support summaries; Impact=local closure; Follow-up=Keep monthly trends, real payment, real logistics, and customer/PM statistical口径 as PARTIAL/BLOCKED.

## Replan History

- 2026-07-07: Created GOAL-004 for the next business development increment after GOAL-003 completed.
- 2026-07-07: Completed TASK-005 as 9D.100 without adding new backend endpoints or weakening Task 8 readiness.

## Assumptions

- 2026-07-06 scope baseline remains authoritative.
- 9D.99 display alignment is the current starting point.
- External confirmations remain blocked until provided by customer / PM or real environment evidence.
- Task 8 remains `NOT_READY`; this goal only closes a local A/B data-source increment.
