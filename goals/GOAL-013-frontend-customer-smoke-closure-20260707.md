# GOAL-013 Frontend Customer Smoke Closure

Status: `completed`

Mode: `stage-goal`

## Summary

Advance the next phase-level goal after GOAL-012: 四端业务页面与客户验收 smoke 收口.

This goal does not create another small 9D task loop. It consolidates existing four-portal page evidence, 12-step browser smoke evidence, customer-readable acceptance records, and readiness boundaries into one RepoFrame stage. Task 8 remains `NOT_READY`.

GOAL-012 remains completed as the auth / DataScope production-hardening first segment. This goal does not claim real customer signature, real production environment acceptance, real payment or logistics integration, real electronic signature, real DeepSeek key, real webhook, or final customer statistics scope.

## Scope

- Establish GOAL-013 as the current RepoFrame execution entry.
- Create one execution-batch task with checklist items for four-end page and customer smoke closure.
- Add a stage-level machine check for four-portal entry evidence, 12-step smoke evidence, customer-readable acceptance evidence, RepoFrame pointers, and fake READY language.
- Repoint project entry docs from GOAL-012 to GOAL-013 while preserving GOAL-012 as completed history.
- Keep `frontend-business-pages` as `PARTIAL`.
- Keep `customer-pm-confirmations` as `BLOCKED`.
- Keep Task 8 as `NOT_READY`.

## Non-goals

- Do not add or claim a new real customer signature.
- Do not fill real DeepSeek key, webhook URL, signing secret, production host, certificate, or customer private data.
- Do not claim real payment, real logistics platform, real electronic signature, real production deployment, HTTPS, backup recovery, or monitoring acceptance.
- Do not implement complete Spring Security/JWT, complete RuoYi DataScope, or multi-device session policy.
- Do not mark Task 8 READY.
- Do not touch `/Users/yuri/Documents/AI智能下单平台`.
- Do not `git add`, commit, or push.

## Acceptance

- `tasks/TASK-014-frontend-customer-smoke-closure-20260707.md` exists and contains one batch task with checklist items.
- `acceptance.json` points to GOAL-013 as the active goal.
- `npm run check:frontend-customer-smoke-closure` validates GOAL-013 / TASK-014, required smoke and check scripts, four-end page evidence, customer acceptance docs, readiness writeback, and no fake READY language.
- Existing checks for four-portal login, four-end visual stability, 12-step smoke structure, customer acceptance record, operations manuals, readiness gaps, and acceptance metadata pass.
- `frontend-business-pages` remains `PARTIAL`.
- `customer-pm-confirmations` remains `BLOCKED`.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:frontend-customer-smoke-closure
npm run check:task9d24
npm run check:task9d36
npm run check:task9d62
npm run check:task9d68
npm run check:task9d70
npm run check:task8-readiness-gaps
npm run acceptance
npm run build:frontend
git diff --check
```

Optional real browser smoke when the local backend, frontend, MySQL, Redis, MinIO, and system Chrome are available:

```bash
npm run smoke:task9d24
npm run smoke:task9d36
npm run smoke:task9d62
```

## Observation Ledger

- 2026-07-07: GOAL-012 completed the auth / DataScope production-hardening first segment while preserving broader production auth blockers.
- 2026-07-07: Existing evidence already includes four-portal login smoke, four-end theme stability smoke, 12-step browser smoke structure, and customer-readable 12-step acceptance record.
- 2026-07-07: This goal consolidates those artifacts as the current frontend / customer-smoke stage without converting local smoke into customer signature or real environment acceptance.

## Replan Notes

The next stage should be selected from real external blockers or explicit customer / PM decisions: customer signatures, real AI key and webhook integration, real deployment / HTTPS / backup / monitoring acceptance, real payment / logistics integration, or production auth strategy. Those remain outside this GOAL-013 closure.
