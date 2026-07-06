# Ralph Context Snapshot: AI Business Assistant Phase One Closure

## Task Statement

Complete "大任务 1：AI 业务助手一期收口" in the current repository. This is not a single-next-step task. The session must decompose the work, implement all local increments, verify each increment, update documentation and acceptance evidence, and only mark the Codex goal complete after the full closure audit passes or a real external blocker is explicit.

## Desired Outcome

- AI-5 production note assistant gains the first increment of customer-template and knowledge-context strengthening.
- AI-5 gains an explicit human-confirmation write path; draft generation remains non-writing.
- AI-2 customer-service query gains a second increment of reference data explanation / knowledge context.
- AI-1 and AI-4 entries are rechecked with machine checks and target tests.
- AI docs, acceptance matrix, readiness records, and `acceptance.json` are updated.
- Task 8 remains `NOT_READY` unless all real phase-one go-live conditions are genuinely satisfied.

## Known Facts / Evidence

- `git status --short --branch` shows a dirty worktree on `feature/project-skeleton...origin/feature/project-skeleton [ahead 29]`; existing dirty changes must not be reverted.
- `STATUS.md` and `tasks/README.md` identify the next recommended target as AI-5 production note customer template / knowledge-context strengthening.
- `AiGatewayService#productionNote` currently returns a draft only and does not write `orders.production_note`.
- `docs/api/openapi.yaml` for `/ai/production-note` still says the customer template is to be implemented separately and the draft must be manually saved through another order edit path.
- AI-2 first increment is present: `/ai/cs-query` returns `reference_data_notes`, `buildCsReferenceDataNotes` reads order basics, production context, messages, files, bills, and logistics.
- AI-1 `/ai/translate`, AI-4 `/ai/check-missing`, AI-2 `/ai/cs-query`, AI-5 `/ai/production-note`, and AI-3 `/ai/order-query` have frontend/backend entry points; AI-3 is handled by `AiOrderQueryController`.
- Existing checks include `check:task9d96` and `check:task9d97`; no new closure check exists yet for this goal.

## Constraints

- Do not run `git add`, `git commit`, or `git push`.
- Do not revert or overwrite existing user/agent changes.
- Do not invent real DeepSeek keys, real webhooks, real customer templates, or customer sign-off.
- Stop and report if a real credential, production service, or customer-unconfirmed template blocks completion.
- Every subtask needs a target test or machine check.
- Final verification must include target check script, AI backend target tests, `npm run check:openapi`, `npm run build:frontend`, `npm run acceptance`, and `git diff --check`.

## Unknowns / Open Questions

- Whether the AI-5 template should be a hard-coded phase-one default or a configurable customer template. Given no customer-confirmed template exists, use a clearly labeled default template and keep customer confirmation blocked.
- Whether AI-5 human-confirmation should write through the existing order review endpoint or a dedicated endpoint. Prefer a dedicated explicit confirm endpoint if it keeps draft generation non-writing and makes audit/testing clearer.
- Whether AI-2 second increment should expose richer structured reference metadata or strengthen existing note text. Prefer additive metadata/summary without RAG or automatic writes.

## Likely Codebase Touchpoints

- `backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java`
- `backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayController.java`
- `backend/platform-server/src/main/java/com/yuri/aiorder/order/api/AiOrderQueryController.java`
- `backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayTests.java`
- `frontend/src/App.vue`
- `docs/api/openapi.yaml`
- `scripts/check-task-*.mjs`
- `package.json`
- `acceptance.json`
- `STATUS.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`
- `docs/acceptance/task-8-acceptance-matrix.md`
- `docs/acceptance/prd-v2-gap-matrix.md`
- `docs/deployment/readiness-checklist.md`
- `docs/deployment/task-8-final-readiness-report.md`
