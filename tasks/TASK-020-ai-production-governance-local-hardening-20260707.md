# TASK-020 AI Production Governance Local Hardening

Status: `completed`

Goal: `goals/GOAL-019-ai-production-governance-local-hardening-20260707.md`

## Summary

Execute AI 生产治理本地补强 as one batch task. This task keeps prompt governance, output safety, budget / circuit breaker productization, AI-3 safety regression, AI-5 template boundary, and documentation writeback in one checklist instead of creating separate task files.

## Scope

- Add a stage-level machine check before implementation and writeback.
- Add a local read-only AI governance hardening backend surface.
- Productize the admin AI governance page first segment.
- Strengthen AI-3 doctor safety regression matrix.
- Update OpenAPI, project entry docs, acceptance docs, deployment docs, and `acceptance.json`.

## Non-goals

- No real DeepSeek key, webhook URL / secret, receiver secret, production host, certificate, token, or customer private data.
- No real production webhook integration or customer / PM signature.
- No customer official AI-5 template claim.
- No AI auto-send, auto-write order, auto-write customer message, or automatic production decision.
- No Task 8 READY claim.
- No git staging, commit, or push.

## Acceptance

- This task file contains checklist items with Scope / Non-goals / Acceptance / Verification.
- `check:ai-production-governance-local-hardening` validates this stage.
- Backend local governance surface reports prompt versions, output safety boundary, budget / circuit breaker policy, AI-3 safety matrix, AI-5 default template boundary, and external integration pending state.
- Admin AI governance page consumes the local governance surface and removes the placeholder-only route.
- AI-3 safety matrix verifies doctor internal production questions return safe public responses and do not leak internal fields.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:ai-production-governance-local-hardening
npm run check:task9d80
npm run check:task9d94
npm run check:task9d97
npm run check:customer-special-requirements
npm run check:task8-readiness-gaps
npm run check:openapi
npm run build:frontend
npm run acceptance
git diff --check
```

注：本任务原引用的 `check:task9d98` 已被 D-186 的客户特殊要求与订单快照验收取代；历史任务结论保留，当前验证使用上述新命令。

## Checklist

- [x] Stage machine check.
  - Scope: add `scripts/check-ai-production-governance-local-hardening.mjs` and `check:ai-production-governance-local-hardening` to validate GOAL-019 / TASK-020, active RepoFrame pointers, backend / frontend / OpenAPI evidence, docs writeback, readiness gaps, and fake READY language.
  - Non-goals: do not weaken existing 9D.80 / 9D.94 / 9D.97 checks; preserve 9D.98 as historical evidence while allowing a later accepted decision to replace its current gate; do not close external blockers.
  - Acceptance: the check fails before implementation / writeback and passes after all checklist items are complete.
  - Verification: `npm run check:ai-production-governance-local-hardening`.

- [x] Backend local governance surface and AI-3 safety matrix.
  - Scope: add a read-only local governance hardening endpoint and target tests for prompt versions, output safety boundary, budget / circuit breaker state, AI-3 safety matrix, AI-5 template boundary, and external integration pending state.
  - Non-goals: do not add migrations; do not expose prompts, keys, webhook URLs, secrets, model raw responses, customer data, or internal doctor-visible fields.
  - Acceptance: CS / ADMIN can read the local hardening surface; DOCTOR is forbidden; AI-3 internal question matrix stays `SAFE_REFUSAL` and doctor-safe.
  - Verification: `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests test`; `npm run check:ai-production-governance-local-hardening`.

- [x] Admin AI governance page productization.
  - Scope: make `/admin/ai-governance` a real local first-increment page showing prompt versions, output guard boundary, budget / circuit breaker, external integration pending state, AI-3 safety cases, AI-5 template status, cost trend, and external alert summary.
  - Non-goals: do not add mutating controls; do not add real webhook replay / retry / secret inputs; do not present default template as customer confirmed.
  - Acceptance: the route is no longer placeholder-only and loads the read-only local governance data with clear PARTIAL / pending external boundaries.
  - Verification: `npm run check:ai-production-governance-local-hardening`; `npm run build:frontend`.

- [x] Acceptance, readiness, and project docs writeback.
  - Scope: update `STATUS.md`, `PROJECT.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, `acceptance.json`, PRD V2 matrix, Task 8 matrix, 9D.80 template, readiness checklist, and final readiness report.
  - Non-goals: do not fill real key / webhook / signature fields; do not mark `ai-production-governance` READY; do not close customer / PM blockers.
  - Acceptance: project docs point to GOAL-019 / TASK-020 and record local AI production governance hardening while keeping Task 8 as `NOT_READY` and readiness gaps as `PARTIAL` / `BLOCKED`.
  - Verification: `npm run check:ai-production-governance-local-hardening`; `npm run check:task8-readiness-gaps`; `npm run acceptance`; `git diff --check`.

## Assumption Checks

- GOAL-018 remains completed and continues to guard local 12-step main-chain acceptance hardening history.
- 9D.80 remains a template only; all real environment fields stay `待填写` / `待确认`.
- 9D.94 remains local provider foundation; real key and production verification remain external.
- 9D.98 `PHASE_ONE_DEFAULT_V1` remains compatibility and historical governance metadata; D-186 replaces its default-template / independent-confirmation UI as the current production-note workflow.

## Downstream Impact

- Later work can focus on real AI key validation, production webhook integration, optional customer AI-5 template input, guarded streaming, or RAG / tool calling if explicitly authorized.

## Completion Record

- Added `check:ai-production-governance-local-hardening` as the stage guard for GOAL-019 / TASK-020, local AI governance evidence, docs writeback, readiness gap status, and fake READY language.
- Added a read-only local governance hardening API and AI-3 doctor safety matrix regression; no secrets, raw prompts, webhook URLs, raw model responses, or customer data are exposed.
- Productized `/admin/ai-governance` as a read-only local first-increment page for prompt versions, output safety, budget / circuit breaker, AI-3 safety cases, AI-5 template boundary, and pending real integration state.
- Updated OpenAPI, `acceptance.json`, project entry docs, acceptance docs, and deployment docs while keeping Task 8 as `NOT_READY`.

## Remaining Work

- Real DeepSeek key validation remains external and must be recorded through 9D.80 when an approved environment exists.
- Production webhook sender / receiver integration, signing secrets, real URL, and receiver verification remain pending.
- Customer / PM AI-5 official template input remains pending as an external enhancement; it is not the current D-186 order-snapshot gate, and `PHASE_ONE_DEFAULT_V1` is not a customer official template.
- Guarded streaming, RAG / tool calling, and production-grade external alert operations remain future work only after explicit confirmation.
