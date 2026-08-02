# TASK-009 PRD V2 Local Gap Closure B

Status: `completed`

Goal: `goals/GOAL-008-prd-v2-local-gap-closure-b-20260707.md`

## Summary

Execute the PRD V2 local feature gap closure B batch. This task keeps the work as one batch with checklist items instead of creating one task per small item.

## Scope

- Implement quality record independent model / status workflow first segment.
- Keep existing check/rework facts for compatibility and summary calculations.
- Update OpenAPI, frontend quality page, acceptance/readiness docs, and machine checks.

## Non-goals

- No final customer quality口径 claim.
- No full complaint / return workflow.
- No edit/delete, quality review board, or real external service integration.
- No real DeepSeek key, webhook, payment/logistics platform, customer signature, or real environment acceptance.
- No Task 8 READY claim.
- No git staging, commit, or push.

## Acceptance

- This task file contains checklist items with Scope / Non-goals / Acceptance / Verification.
- `quality_record` independent fact table exists as a first segment.
- Existing external-return creation writes `quality_record`, `check_record`, and `rework_record` without deleting historical facts.
- Quality record status can move through bounded internal statuses.
- Doctors remain forbidden from internal quality record read/write/update.
- Frontend `/production/quality` can display and update quality record status.
- OpenAPI and acceptance/readiness docs are updated.
- `acceptance.json` active goal is GOAL-008.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:prd-v2-gap-closure-b
npm run check:task9d87
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=QualityRecordTests test
npm run check:openapi
npm run build:frontend
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

## Checklist

- [x] Stage container and failing target test.
  - Scope: create GOAL-008 / TASK-009 and add target tests for independent `quality_record` persistence plus status workflow before implementation.
  - Non-goals: no production implementation before the failing test; no external service or readiness claims.
  - Acceptance: target test fails for the expected missing behavior, not because of syntax or setup errors.
  - Verification: `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=QualityRecordTests test`.

- [x] Backend model and status workflow.
  - Scope: add `quality_record` migration, write external-return records to the independent table, list from the independent table, and add a bounded status update endpoint for internal roles.
  - Non-goals: no destructive migration, no deletion of check/rework facts, no full投诉/退货 workflow, no customer-final quality口径 claim.
  - Acceptance: CS / ADMIN can create, list, and update quality record status; invalid transitions or unsupported statuses are rejected; DOCTOR remains 403.
  - Verification: `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=QualityRecordTests test`.

- [x] Frontend and OpenAPI contract.
  - Scope: update `/production/quality` types and controls for status workflow; update OpenAPI schemas and paths for the independent first segment.
  - Non-goals: no full browser smoke, no new external services, no quality edit/delete UI.
  - Acceptance: frontend build passes; OpenAPI check passes; UI does not claim final customer quality model readiness.
  - Verification: `npm run check:openapi`; `npm run build:frontend`.

- [x] Machine checks and documentation writeback.
  - Scope: add `check:prd-v2-gap-closure-b`, update `acceptance.json`, `STATUS.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, PRD V2 matrix, Task 8 matrix, and readiness checklist.
  - Non-goals: do not weaken acceptance gaps; do not mark Task 8 READY; do not close customer / PM or real-environment blockers.
  - Acceptance: project docs point to GOAL-008 / TASK-009 and record quality record independent model/status workflow first segment as local PARTIAL progress.
  - Verification: `npm run check:prd-v2-gap-closure-b`; `npm run check:task8-readiness-gaps`; `npm run acceptance`; `git diff --check`.

## Assumption Checks

- Confirmed by GOAL-007 / TASK-008: B should start with quality record independent model / status workflow first segment.
- Confirmed by PRD V2 matrix: customer final quality口径 remains unconfirmed, so the outcome stays PARTIAL.
- Confirmed by readiness checklist: Task 8 must remain `NOT_READY`.
- Assumption: bounded statuses for this first segment are `PENDING`, `IN_PROGRESS`, `RESOLVED`, and `CLOSED`.

## Downstream Impact

- Later quality work can add final customer口径, edit/delete, complaint/return workflow, or quality review board without rewriting existing check/rework evidence.
- PRD V2 local gap status improves, but external readiness remains blocked by customer / PM and true environment conditions.

## Completion Record

- Created GOAL-008 / TASK-009 as the current stage-level RepoFrame entry.
- Added target tests for independent `quality_record` persistence and internal status workflow, verified RED on missing table / endpoint, then implemented GREEN.
- Added V35 `quality_record` independent fact table with backfill from existing `EXTERNAL_RETURN` check/rework facts.
- Updated quality record service and controller to create/list from `quality_record`, keep `check_record` / `rework_record` compatibility, and support `/quality-records/{qualityRecordId}/status`.
- Updated production quality page to display `status_note` and update quality record status.
- Updated OpenAPI, acceptance/readiness docs, entry docs, machine checks, and `acceptance.json`.
- Task 8 remains `NOT_READY`.

## Remaining Work

- Customer / PM final quality record口径 remains unconfirmed.
- Edit/delete, quality review, complaint/return workflow, and full browser smoke remain future PARTIAL work.
- Real DeepSeek key, real webhook, real payment/logistics platforms, customer signature, and real environment acceptance remain external blockers.

## Known Risks

- Existing reports still derive quality rates from `check_record` / `rework_record`; this first segment must keep compatibility rather than swapping summary semantics abruptly.
- Customer / PM may later change quality fields or status names; this stage must avoid presenting the first-segment model as final.
