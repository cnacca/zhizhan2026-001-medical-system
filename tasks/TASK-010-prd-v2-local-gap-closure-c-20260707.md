# TASK-010 PRD V2 Local Gap Closure C

Status: `completed`

Goal: `goals/GOAL-009-prd-v2-local-gap-closure-c-20260707.md`

## Summary

Execute the PRD V2 local feature gap closure C batch. This task keeps the work as one batch with checklist items instead of creating one task per small item.

## Scope

- Implement AI-2 message attachment preview aggregation / stronger knowledge context first segment.
- Keep all attachment preview context behind existing AI-2 and file access permissions.
- Update OpenAPI, frontend客服 AI page, acceptance/readiness docs, and machine checks.

## Non-goals

- No real DeepSeek key, RAG, tool calling, webhook, customer signature, or real environment acceptance.
- No automatic external sending or order/message mutation from AI-2.
- No doctor-facing exposure of internal attachment context.
- No full file viewer or customer-final AI knowledge口径 claim.
- No Task 8 READY claim.
- No git staging, commit, or push.

## Acceptance

- This task file contains checklist items with Scope / Non-goals / Acceptance / Verification.
- AI-2 `/ai/cs-query` includes message attachment preview context for eligible CS / ADMIN queries.
- Attachment context is bounded, auditable, and permission-filtered.
- DOCTOR remains 403 for AI-2 CS query.
- Frontend `/ai/cs` displays attachment context as manual-review material.
- OpenAPI and acceptance/readiness docs are updated.
- `acceptance.json` active goal is GOAL-009.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:prd-v2-gap-closure-c
npm run check:task9d97
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests test
npm run check:openapi
npm run build:frontend
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

## Checklist

- [x] Stage container and failing target test.
  - Scope: create GOAL-009 / TASK-010 and add target tests for AI-2 attachment context before implementation.
  - Non-goals: no production implementation before the failing test; no external service or readiness claims.
  - Acceptance: target test fails for the expected missing attachment context behavior, not because of syntax or setup errors.
  - Verification: `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests test`.

- [x] Backend AI-2 attachment context aggregation.
  - Scope: collect message attachment file IDs for the queried order, resolve bounded file metadata and preview URL references through existing access controls, and return the context from `/ai/cs-query`.
  - Non-goals: no doctor exposure, no automatic message sending, no real model dependency, no broad file search outside the queried order.
  - Acceptance: CS / ADMIN receive attachment context; DOCTOR remains forbidden; response omits secrets and internal storage credentials.
  - Verification: `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests test`.

- [x] Frontend and OpenAPI contract.
  - Scope: update `/ai/cs` response types and UI to show attachment context; update OpenAPI schemas for AI-2 response.
  - Non-goals: no full file viewer, no browser smoke, no real external storage or AI integration.
  - Acceptance: frontend build passes; OpenAPI check passes; UI labels the content as manual-review context.
  - Verification: `npm run check:openapi`; `npm run build:frontend`.

- [x] Machine checks and documentation writeback.
  - Scope: add `check:prd-v2-gap-closure-c`, update `acceptance.json`, `STATUS.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, PRD V2 matrix, Task 8 matrix, and readiness checklist.
  - Non-goals: do not weaken acceptance gaps; do not mark Task 8 READY; do not close customer / PM or real-environment blockers.
  - Acceptance: project docs point to GOAL-009 / TASK-010 and record AI-2 attachment context first segment as local PARTIAL progress.
  - Verification: `npm run check:prd-v2-gap-closure-c`; `npm run check:task8-readiness-gaps`; `npm run acceptance`; `git diff --check`.

## Assumption Checks

- Confirmed by PRD V2 matrix: AI-2 message attachment preview aggregation / stronger knowledge context is the next local implementation-ready gap after GOAL-008.
- Confirmed by existing AI-2 contract: AI-2 is an internal CS / ADMIN helper and must not auto-send or auto-write data.
- Confirmed by readiness checklist: Task 8 must remain `NOT_READY`.
- Assumption: first segment can return preview URL references in the AI-2 response for manual review without implementing a full file viewer.

## Downstream Impact

- Later AI-2 work can add customer-final knowledge口径, richer attachment semantics, RAG, or real model validation without rewriting the basic attachment context contract.
- PRD V2 local gap status improves, but external readiness remains blocked by customer / PM and true environment conditions.

## Completion Record

- Created GOAL-009 / TASK-010 as the PRD V2 local feature gap closure C stage container.
- Verified the target backend test first failed because `/ai/cs-query` did not return `attachment_contexts`.
- Implemented AI-2 `attachment_contexts` through existing order/file access scope and `FileResourceService.createPreviewUrl`, returning bounded metadata plus short-lived preview URLs for CS / ADMIN manual review.
- Updated客服 AI frontend display, OpenAPI `AiAttachmentContext`, `acceptance.json`, stage check script, and acceptance/readiness/project entry docs.
- Task 8 remains `NOT_READY`; this batch does not close real DeepSeek key, webhook, RAG/tool calling, customer signature, real environment acceptance, or customer / PM AI-2口径.

## Remaining Work

- Customer / PM AI-2 final口径 remains unconfirmed.
- Real DeepSeek key, real webhook, customer signature, and real environment acceptance remain external blockers.

## Known Risks

- Preview URLs are time-limited and permission-sensitive; this stage must avoid bypassing existing file access checks.
- AI-2 context can grow noisy if unbounded; this first segment should limit attachment records and keep human-review wording explicit.
