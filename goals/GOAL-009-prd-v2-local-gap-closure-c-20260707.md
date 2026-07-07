# GOAL-009 PRD V2 Local Gap Closure C

Status: `completed`

Mode: `stage-goal`

## Summary

Close PRD V2 local feature gap closure C by implementing the first local segment of AI-2 message attachment preview aggregation and stronger auditable knowledge context. The `/ai/cs-query` response now includes `attachment_contexts` for bounded, permission-filtered manual review.

Task 8 remains `NOT_READY`. This goal only closes a local AI-2 context aggregation segment. It does not close real DeepSeek key validation, RAG / tool calling, customer AI acceptance, real webhook, customer signature, or real environment acceptance.

## Scope

- Establish this stage-level goal as the current RepoFrame execution entry.
- Create one execution-batch task with checklist items for PRD V2 local gap closure C.
- Extend AI-2 `/ai/cs-query` response with bounded message attachment preview context.
- Keep all attachment context permission-filtered and safe for internal CS / ADMIN use only.
- Surface the new AI-2 attachment context in the客服 AI page without automatically sending messages or writing order data.
- Update OpenAPI, machine checks, acceptance matrix, readiness checklist, and project entry docs.
- Keep `prd-v2-local-feature-gaps`, `frontend-business-pages`, and `ai-production-governance` as `PARTIAL`.
- Keep `customer-pm-confirmations` as `BLOCKED`.

## Non-goals

- Do not connect real DeepSeek key, RAG, tool calling, or production AI workflows.
- Do not expose internal attachment context to doctors.
- Do not generate preview URLs without existing file access checks.
- Do not automatically send AI-2 answers to doctors or write order/message data.
- Do not implement full message attachment workflow, file viewer, or customer-final AI knowledge口径.
- Do not change Task 8 to READY.
- Do not touch `/Users/yuri/Documents/AI智能下单平台`.
- Do not `git add`, commit, or push.

## Acceptance

- `tasks/TASK-010-prd-v2-local-gap-closure-c-20260707.md` exists and contains one batch task with checklist items.
- AI-2 `/ai/cs-query` returns auditable message attachment preview context for CS / ADMIN within existing order data scope.
- Attachment context includes bounded metadata and preview URL references suitable for manual review.
- DOCTOR remains forbidden from AI-2 CS query and must not receive internal attachment context.
- Frontend `/ai/cs` displays the attachment context separately from the answer and reference notes.
- OpenAPI and acceptance/readiness docs reflect the first segment.
- `acceptance.json` points to GOAL-009 as the current active goal.
- Task 8 remains `NOT_READY`.
- Machine checks pass.

## Verification

```bash
npm run check:prd-v2-gap-closure-c
npm run check:task9d97
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests test
npm run check:openapi
npm run build:frontend
npm run check:task8-readiness-gaps
npm run check:phase-one-closure-plan
npm run check:phase-one-workflow
npm run check:stage-goal-window
npm run check:repoframe-docs
python3 /Users/yuri/.codex/skills/repo-init/scripts/lint_acceptance.py --repo .
npm run acceptance
git diff --check
```

## Observation Ledger

- 2026-07-07: User requested execution of AI-2 message attachment preview aggregation / stronger knowledge context first segment.
- 2026-07-07: GOAL-008 / TASK-009 completed quality record independent model / status workflow first segment.
- 2026-07-07: PRD V2 matrix lists AI-2 message attachment preview aggregation / stronger knowledge context as the next implementation-ready local gap after GOAL-008.
- 2026-07-07: GOAL-009 / TASK-010 completed AI-2 `attachment_contexts` backend aggregation,客服 AI frontend display, OpenAPI contract, acceptance/readiness documentation, and `npm run check:prd-v2-gap-closure-c`.

## Replan Notes

If attachment preview aggregation requires real external storage, real customer AI口径, or wider message workflow changes, keep those items `PARTIAL` / `BLOCKED` and stop before faking external acceptance.
