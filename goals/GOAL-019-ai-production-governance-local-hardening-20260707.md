# GOAL-019 AI Production Governance Local Hardening

Status: `completed`

Mode: `stage-goal`

Slug: `ai-production-governance-local-hardening`

## Summary

Advance the next phase-level goal after GOAL-018: AI 生产治理本地补强.

This goal hardens local, non-production AI governance controls that are safe to develop without real DeepSeek keys or production webhooks. It keeps `ai-production-governance` as `PARTIAL`, keeps customer / PM confirmations as `BLOCKED`, and keeps Task 8 as `NOT_READY`.

This goal does not claim real key integration, production webhook integration, customer signature, confirmed customer AI-5 template, production deployment, or real environment acceptance.

## Scope

- Establish GOAL-019 as the current RepoFrame execution entry.
- Create one execution-batch task with checklist items for local AI production governance hardening.
- Add a stage-level machine check for GOAL-019 / TASK-020, backend governance surface, frontend governance page, docs writeback, readiness gaps, and fake READY language.
- Add a local read-only AI governance hardening surface that exposes prompt versions, output safety boundaries, budget / circuit breaker policy state, AI-3 safety matrix, AI-5 template confirmation status, and real external integration status.
- Productize the admin AI governance page first segment around the same read-only surface.
- Strengthen AI-3 doctor safety regression with a local matrix for internal production questions.
- Keep AI-5 `PHASE_ONE_DEFAULT_V1` as an unconfirmed default template, not a customer official template.

## Non-goals

- Do not submit or invent real DeepSeek keys.
- Do not claim real key integration.
- Do not configure or invent real webhook URLs, signing secrets, receiver secrets, server addresses, certificates, tokens, or customer data.
- Do not claim real environment acceptance.
- Do not claim real model, production webhook, customer signature, production deployment, or real environment acceptance.
- Do not mark AI production governance, Task 8, production go-live, or customer acceptance as READY.
- Do not auto-send AI output, auto-write customer messages, auto-write orders, or bypass human confirmation.
- Do not touch `/Users/yuri/Documents/AI智能下单平台`.
- Do not `git add`, commit, or push.

## Acceptance

- `tasks/TASK-020-ai-production-governance-local-hardening-20260707.md` exists and contains one batch task with checklist items.
- `acceptance.json` points to GOAL-019 and TASK-020 as the active RepoFrame execution entry.
- `npm run check:ai-production-governance-local-hardening` validates this stage.
- Backend exposes local read-only AI governance hardening data without secrets or real external evidence.
- Admin AI governance page consumes and displays the local hardening data.
- AI-3 safety matrix regression covers internal production questions without leaking internal fields.
- `ai-production-governance` remains `PARTIAL`, `customer-pm-confirmations` remains `BLOCKED`, and Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:ai-production-governance-local-hardening
npm run check:task9d80
npm run check:task9d94
npm run check:task9d97
npm run check:task9d98
npm run check:task8-readiness-gaps
npm run check:openapi
npm run build:frontend
npm run acceptance
git diff --check
```

## Observation Ledger

- 2026-07-07: 9D.80 provides a true-environment AI key / webhook acceptance template only; all real fields remain pending.
- 2026-07-07: 9D.94 completed local LangChain + DeepSeek foundation while real keys stay externally injected and disabled by default.
- 2026-07-07: 9D.97 and PRD V2 local gap closure C completed AI-2 reference notes and attachment context first increments without RAG / tool calling or auto-send.
- 2026-07-07: 9D.98 completed AI-5 default template context and human confirmation first increment; `PHASE_ONE_DEFAULT_V1` remains unconfirmed by customer / PM.

## Replan Notes

Future work after this goal should target real AI key environment validation, production webhook integration, customer / PM AI template confirmation, guarded streaming, or RAG / tool calling only when those requirements and external conditions are explicitly confirmed.
