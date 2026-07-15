# GOAL-023 PRD V2 Local Remainder Closure

Status: `completed`

Mode: `stage-goal`

## Summary

Close all remaining locally verifiable PRD V2 items after GOAL-022. Task 8 remains `NOT_READY`; external acceptance and business-data inputs remain explicitly open.

## Scope

- Default all non-test runtimes to Bearer authentication rather than bootstrap headers.
- Add quality date-range summaries and daily trends, with page controls.
- Persist and expose design-draft rejection reasons; cover CS/doctor rejection visibility and V1/V2/V3.
- Seed minimal generic dynamic forms for every active seeded workflow product so the implant path is runnable.
- Run the isolated `IMPLANT_RESTORATION` + real STL 12-step browser smoke.

## Non-goals

No customer-specific field or file-limit decision, standard-hour values, real model/object-storage/weak-network/HTTPS/deployment execution, production-data mutation, Task 8 READY, staging, commit, or push.

## Acceptance

- The 38-item PRD V2 audit has no local `MISSING` items.
- An isolated implant order with an STL completes the full browser/API main chain.
- Quality and design-draft local acceptance paths have automated evidence.
- Remaining items are only business-data or real-environment gates.

## Verification

`npm run test:backend` (189 tests); targeted `NotificationWebSocketTests`; `npm run build:frontend`; `npm run check:openapi`; `npm run acceptance`; isolated `smoke:task9d62`; `git diff --check`.

## Assumption Checks

- The seeded product types are valid phase-one products; generic fields are a runnable baseline, not a replacement for CP-002 confirmation.
- The demo database/bucket is isolated from customer and production data.
- Standard hours remain business-owned source data and must not be invented in code.

## Downstream Impact

- Clients without a Bearer token now receive 401 by default.
- Design-draft consumers receive rejection-reason fields and must submit a reason for either rejection action.
- Workflow-chain summaries include `product_type` for clients that need to choose a display chain.

## Completion Record

- 2026-07-15: isolated implant/STL main-chain smoke passed through completion and all 12 browser entry points.
- 2026-07-15: loopback Vite origins are accepted by both HTTP CORS and WebSocket handshake; full backend regression passed (189 tests).
- 2026-07-15: local PRD audit recalibrated to 30 PASS, 1 PARTIAL, 0 MISSING, 7 EXTERNAL_ACCEPTANCE. Task 8 remains `NOT_READY`.
