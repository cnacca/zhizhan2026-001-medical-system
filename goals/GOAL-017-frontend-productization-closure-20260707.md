# GOAL-017 Frontend Productization Closure

Status: `completed`

Mode: `stage-goal`

## Summary

Advance the next phase-level goal after GOAL-016: 四端前端产品化体验收口.

This goal productizes locally developable four-portal frontend experience where backend or first-increment local capabilities already exist. It keeps `frontend-business-pages` as `PARTIAL` and keeps Task 8 as `NOT_READY`.

This goal does not claim customer signature, real payment platform, real logistics platform, real e-signature, real DeepSeek key, real webhook, HTTPS, backup monitoring, or real environment acceptance.

## Scope

- Establish GOAL-017 as the current RepoFrame execution entry.
- Create one execution-batch task with checklist items for four-portal frontend productization closure.
- Add a stage-level machine check for GOAL-017 / TASK-018, productized frontend entry points, unified state language, docs writeback, readiness boundaries, and fake READY language.
- Productize the local first-increment frontend entries that already have real APIs or useful local workflows:
  - Doctor eight-module experience and safe account / clinic / patient / order flows.
  - CS order detail, initial review, collaboration, delivery / billing-facing completeness.
  - Production review, task pool, process execution, quality / rework / final inspection, and C-class support entry completeness.
  - Admin necessary entry clarity for users / roles / permissions / clinics / products / dynamic forms.
- Add unified loading, empty, error, and permission-denied state language where practical in the current single-file frontend.
- Keep production support modules as local first-increment / PARTIAL, not complete C-class closure.
- Keep Task 8 as `NOT_READY`.

## Non-goals

- Do not restore an independent doctor files module.
- Do not expand equipment, material, safety, cost, or reward/penalty into a complete phase-one management closure.
- Do not connect real payment, real logistics, real e-signature, real DeepSeek key, real webhook, real HTTPS, real backup monitoring, or real production infrastructure.
- Do not fill customer signature, real acceptance records, real keys, real webhook URL, real token, certificate, production host, customer private data, or credentials.
- Do not mark `frontend-business-pages`, Task 8, or production go-live readiness as READY.
- Do not touch `/Users/yuri/Documents/AI智能下单平台`.
- Do not `git add`, commit, or push.

## Acceptance

- `tasks/TASK-018-frontend-productization-closure-20260707.md` exists and contains one batch task with checklist items.
- `acceptance.json` points to GOAL-017 as the active goal.
- `npm run check:frontend-productization-closure` validates GOAL-017 / TASK-018, frontend productized entry points, unified state copy, docs writeback, readiness gaps, and no fake READY language.
- The frontend no longer labels local first-increment production support entries as generic demo placeholders.
- Doctor, CS, production, and admin navigation expose phase-one necessary entry points without restoring doctor files or C-class full closure.
- `frontend-business-pages` remains `PARTIAL`.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:frontend-productization-closure
npm run check:frontend-customer-smoke-closure
npm run build:frontend
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

## Observation Ledger

- 2026-07-07: GOAL-013 completed four-end page evidence and customer smoke consolidation while keeping `frontend-business-pages` as `PARTIAL`.
- 2026-07-07: GOAL-016 completed refresh token rotation as the previous active stage.
- 2026-07-07: Several production support routes already have real summary and first-increment forms but still render through a generic demo placeholder shell.

## Replan Notes

Future frontend work after this goal should target real customer acceptance smoke, real payment / logistics platform integration, final customer statistics confirmation, real electronic signature, or route-level UI extraction if the single-file frontend becomes too risky to maintain. Those remain separate readiness gaps and must not be described as completed by this goal.
