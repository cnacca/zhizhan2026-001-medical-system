# GOAL-020 Deployment / Ops Local Hardening

Status: `completed`

Mode: `stage-goal`

Slug: `deployment-ops-local-hardening`

## Summary

Advance the next phase-level goal after GOAL-019: 部署 / 运维本地补强.

This goal strengthens local deployment and operations readiness that can be developed without a real server, HTTPS certificate, backup target, monitoring receiver, customer signature, or production environment. It keeps `deployment-infrastructure` and `operations-manuals` as `PARTIAL`, keeps customer / PM confirmations as `BLOCKED`, and keeps Task 8 as `NOT_READY`.

This goal does not claim real server deployment, HTTPS acceptance, backup restore completion, monitoring alert acceptance, customer training signoff, customer signature, or real environment acceptance.

## Scope

- Establish GOAL-020 as the current RepoFrame execution entry.
- Create one execution-batch task with checklist items for deployment / operations local hardening.
- Add a stage-level machine check for GOAL-020 / TASK-021, local dry-run evidence, docs writeback, readiness gaps, and fake READY language.
- Add a local release / rollback dry-run command that validates compose, env, Nginx, healthcheck, backup / restore, log retention, monitoring, and readiness-link templates.
- Add a deployment dry-run document for backup / restore and log / monitoring first-segment templates.
- Link the dry-run document from rollback, training, readiness, deployment acceptance, and delivery materials.
- Keep 9D.81 as a template-only real-environment acceptance record.

## Non-goals

- Do not claim real server deployment.
- Do not claim HTTPS acceptance.
- Do not claim backup restore completion.
- Do not claim monitoring alert acceptance.
- Do not fill real server addresses, database passwords, Redis credentials, MinIO credentials, DeepSeek API keys, webhook secrets, certificates, tokens, or customer private data.
- Do not perform real production deployment, real backup restore, real monitoring alert delivery, or real customer training signoff.
- Do not mark deployment infrastructure, operations manuals, Task 8, production go-live, or customer acceptance as READY.
- Do not touch `/Users/yuri/Documents/AI智能下单平台`.
- Do not `git add`, commit, or push.

## Acceptance

- `tasks/TASK-021-deployment-ops-local-hardening-20260707.md` exists and contains one batch task with checklist items.
- `acceptance.json` points to GOAL-020 and TASK-021 as the active RepoFrame execution entry.
- `npm run check:deployment-ops-local-hardening` validates this stage.
- `npm run dry-run:phase-one-release-rollback` validates local compose / env / Nginx / healthcheck boundaries and template links.
- Backup / restore and log / monitoring remain template-ready first segments with real fields as `待填写` / `待确认`.
- `deployment-infrastructure` and `operations-manuals` remain `PARTIAL`, `customer-pm-confirmations` remains `BLOCKED`, and Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:deployment-ops-local-hardening
npm run dry-run:phase-one-release-rollback
npm run check:deployment-env
npm run compose:phase-one:config
npm run check:task9d81
npm run check:operations-rollback-training-closure
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

## Observation Ledger

- 2026-07-07: 9D.69 provides Docker / compose / env isolation first-segment evidence only; it does not prove a real server exists.
- 2026-07-07: 9D.81 provides a true-environment deployment / HTTPS / backup / monitoring acceptance template only; all real fields remain pending.
- 2026-07-07: GOAL-015 provides rollback and training templates only; real release rollback exercise and formal customer training signoff remain pending.
- 2026-07-07: Current local dry-run can strengthen static readiness and operator handoff, but it cannot replace real deployment, backup restore, monitoring alert, or customer signature evidence.

## Replan Notes

Future work after this goal should target real deployment smoke, HTTPS verification, backup restore exercise, monitoring alert delivery, customer training signoff, or customer / PM production acceptance only when those environments and owners are explicitly available.
