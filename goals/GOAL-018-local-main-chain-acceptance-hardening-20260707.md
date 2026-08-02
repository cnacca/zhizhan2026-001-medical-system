# GOAL-018 Local Main Chain Acceptance Hardening

Status: `completed`

Mode: `stage-goal`

Slug: `local-main-chain-acceptance-hardening`

## Summary

Advance the next phase-level goal after GOAL-017: 本地 12 步主链路自动化与验收记录增强.

This goal hardens the local 12-step main-chain smoke, role-boundary assertions, customer-readable acceptance record, and Task 8 readiness writeback. It keeps Task 8 as `NOT_READY` and keeps all external acceptance gaps as `PARTIAL` or `BLOCKED`.

This goal does not claim customer signature, real DeepSeek key, real webhook, real payment platform, real logistics platform, real electronic signature, HTTPS, production deployment, backup monitoring, or real environment acceptance.

## Scope

- Establish GOAL-018 as the current RepoFrame execution entry.
- Create one execution-batch task with checklist items for local main-chain acceptance hardening.
- Add a stage-level machine check for GOAL-018 / TASK-019, the 12-step smoke hardening, docs writeback, readiness gaps, and fake READY language.
- Enhance `smoke:task9d62` local fixed-demo diagnostics with key role-boundary assertions:
  - Doctor safe projection does not expose internal workflow fields.
  - CS can see internal review / process evidence needed for support.
  - Worker task pool remains scoped to assigned production tasks.
  - Admin assignment / reassignment endpoint remains usable for the main chain.
- Keep `check:task9d62`, `check:task9d68`, Task 8 readiness gaps, and customer-readable acceptance docs aligned.
- Keep Task 8 as `NOT_READY`.

## Non-goals

- Do not claim customer signature.
- Do not claim real environment acceptance.
- Do not perform real customer acceptance or customer / PM signature.
- Do not fill real DeepSeek key, real webhook URL / secret, production host, certificate, token, or customer private data.
- Do not connect real payment, real logistics, real e-signature, HTTPS, backup monitoring, or production infrastructure.
- Do not mark `frontend-business-pages`, `prd-v2-local-feature-gaps`, Task 8, production go-live, or customer acceptance as READY.
- Do not touch `/Users/yuri/Documents/AI智能下单平台`.
- Do not `git add`, commit, or push.

## Acceptance

- `tasks/TASK-019-local-main-chain-acceptance-hardening-20260707.md` exists and contains one batch task with checklist items.
- `acceptance.json` points to GOAL-018 and TASK-019 as the active RepoFrame execution entry.
- `npm run check:local-main-chain-acceptance-hardening` validates GOAL-018 / TASK-019, smoke role assertions, docs writeback, readiness gaps, and no fake READY language.
- `smoke:task9d62` retains the fixed 12-step local main-chain path and adds role-boundary diagnostics.
- `phase-one-main-chain-customer-acceptance.md` records GOAL-018 as local hardening only, not customer signature.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:local-main-chain-acceptance-hardening
npm run check:task9d62
npm run smoke:task9d62
npm run check:task9d68
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

## Observation Ledger

- 2026-07-07: GOAL-013 completed four-end page evidence and customer smoke consolidation while keeping customer acceptance unsigned.
- 2026-07-07: GOAL-017 completed local frontend productization while keeping `frontend-business-pages` as `PARTIAL`.
- 2026-07-07: `smoke:task9d62` already creates fixed local demo data across order, review, workflow, rework, design draft, bill, logistics, and receipt; this goal hardens diagnostics and acceptance records around that path.

## Replan Notes

Future work after this goal should target real customer click-through acceptance, real payment / logistics platform integration, real electronic signature, production deployment, or customer / PM written confirmation. Those remain separate readiness gaps and must not be described as completed by this local hardening goal.
