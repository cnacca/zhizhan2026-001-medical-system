# TASK-021 Deployment / Ops Local Hardening

Status: `completed`

Goal: `goals/GOAL-020-deployment-ops-local-hardening-20260707.md`

## Summary

Execute 部署 / 运维本地补强 as one batch task. This task keeps stage machine checks, local release / rollback dry-run, backup / restore templates, log / monitoring templates, and readiness writeback in one checklist instead of creating separate task files.

## Scope

- Add a stage-level machine check before implementation and writeback.
- Add a local release / rollback dry-run command.
- Add a local deployment / operations dry-run document covering backup / restore and log / monitoring first-segment templates.
- Link the dry-run document into rollback, training, deployment acceptance, readiness, delivery materials, and project entry docs.
- Update `acceptance.json` while preserving `PARTIAL` / `BLOCKED` / `NOT_READY` boundaries.

## Non-goals

- No real server address, HTTPS certificate, database password, Redis credential, MinIO secret, DeepSeek API key, webhook secret, token, or customer private data.
- No real server deployment, real HTTPS acceptance, real backup restore exercise, real monitoring alert acceptance, real release rollback exercise, real customer training signoff, or customer / PM signature.
- No dependency changes, database migrations, production data changes, volume deletion, auth bypass, git staging, commit, or push.
- No Task 8 READY claim.

## Acceptance

- This task file contains checklist items with Scope / Non-goals / Acceptance / Verification.
- `check:deployment-ops-local-hardening` validates this stage.
- `dry-run:phase-one-release-rollback` validates local compose / env / Nginx / healthcheck boundaries and template links.
- `docs/deployment/phase-one-local-ops-dry-run.md` records backup / restore, log retention, monitoring alert, release, rollback, and readiness-link templates without real secrets or real environment claims.
- `deployment-infrastructure` and `operations-manuals` remain `PARTIAL`.
- Task 8 remains `NOT_READY`.

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

## Checklist

- [x] Stage machine check.
  - Scope: add `scripts/check-deployment-ops-local-hardening.mjs` and `check:deployment-ops-local-hardening` to validate GOAL-020 / TASK-021, active RepoFrame pointers, local dry-run evidence, docs writeback, readiness gaps, and fake READY language.
  - Non-goals: do not weaken existing deployment, operations, Task 8, or acceptance checks; do not close external blockers.
  - Acceptance: the check fails before implementation / writeback and passes after all checklist items are complete.
  - Verification: `npm run check:deployment-ops-local-hardening`.

- [x] Release / rollback dry-run and static deployment checks.
  - Scope: add `scripts/phase-one-release-rollback-dry-run.mjs` and `dry-run:phase-one-release-rollback` to validate local compose, external env injection, Nginx API / notification / WebSocket proxy, infrastructure healthcheck presence, rollback runbook links, and dry-run document boundaries.
  - Non-goals: do not start real servers; do not require real production secrets; do not run destructive Docker commands; do not claim real release or rollback exercise completion.
  - Acceptance: local dry-run passes with repository templates and rejects missing docs, missing Nginx proxy, missing prod auth boundaries, or fake READY language.
  - Verification: `npm run dry-run:phase-one-release-rollback`; `npm run compose:phase-one:config`.

- [x] Backup / restore and log / monitoring templates.
  - Scope: add `docs/deployment/phase-one-local-ops-dry-run.md` with first-segment templates for backup plan, restore rehearsal record, log retention, monitoring alerts, release checklist, rollback checklist, and evidence links.
  - Non-goals: do not fill real backup paths, monitoring receivers, webhook endpoints, server addresses, credentials, certificate data, customer names, or signatures.
  - Acceptance: all real-environment fields remain `待填写` / `待确认`, and the document states it does not represent real server, HTTPS, backup restore, monitoring alert, customer signoff, or Task 8 readiness completion.
  - Verification: `npm run dry-run:phase-one-release-rollback`; `npm run check:deployment-ops-local-hardening`.

- [x] Operations, deployment, acceptance, and readiness writeback.
  - Scope: update `STATUS.md`, `PROJECT.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, `acceptance.json`, PRD V2 matrix, Task 8 matrix, readiness checklist, 9D.81 template, final readiness report, rollback runbook, training materials, and delivery materials index.
  - Non-goals: do not mark `deployment-infrastructure` or `operations-manuals` READY; do not fill real deployment evidence; do not close customer / PM blockers.
  - Acceptance: project docs point to GOAL-020 / TASK-021 and record local deployment / operations hardening while keeping Task 8 as `NOT_READY` and readiness gaps as `PARTIAL` / `BLOCKED`.
  - Verification: `npm run check:deployment-ops-local-hardening`; `npm run check:task8-readiness-gaps`; `npm run acceptance`; `git diff --check`.

## Assumption Checks

- GOAL-019 remains completed and continues to guard local AI production governance history.
- 9D.81 remains a template only; all real deployment, HTTPS, backup, logging, monitoring, rollback, and customer / PM fields stay `待填写` / `待确认`.
- GOAL-015 remains a local operations template closure; real release rollback exercise and formal customer training signoff remain external.
- Task 8 remains `NOT_READY`.

## Downstream Impact

- Later work can focus on real deployment smoke, HTTPS, backup restore, monitoring alert, release rollback exercise, or customer training signoff if a real environment and responsible owners are available.

## Completion Record

- Added `check:deployment-ops-local-hardening` as the stage guard for GOAL-020 / TASK-021, dry-run evidence, docs writeback, readiness gap status, and fake READY language.
- Added `dry-run:phase-one-release-rollback` for local static release / rollback checks across compose, env, Nginx, healthcheck, rollback, training, and dry-run template links.
- Added `docs/deployment/phase-one-local-ops-dry-run.md` with backup / restore and log / monitoring first-segment templates.
- Updated `acceptance.json`, project entry docs, acceptance docs, deployment docs, and operations docs while keeping Task 8 as `NOT_READY`.

## Remaining Work

- Real server deployment, HTTPS verification, mirror registry evidence, database backup generation, backup restore rehearsal, log retention, monitoring alert delivery, release rollback exercise, and customer / PM signoff remain external.
- The local dry-run does not replace 9D.81 real-environment acceptance.
