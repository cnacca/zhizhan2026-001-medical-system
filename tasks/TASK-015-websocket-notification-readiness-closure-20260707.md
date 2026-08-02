# TASK-015 WebSocket / Notification Readiness Closure

Status: `completed`

Goal: `goals/GOAL-014-websocket-notification-readiness-closure-20260707.md`

## Summary

Execute WebSocket / 通知生产 readiness 收口 as one batch task. This task keeps the work as one checklist instead of creating separate tasks for template, evidence, and document writeback.

## Scope

- Add a stage-level machine check before documentation writeback.
- Consolidate current 9D.76 WebSocket / notification gateway evidence.
- Add a sanitized production readiness template for true external verification later.
- Repoint active RepoFrame metadata from GOAL-013 to GOAL-014.
- Update project entry docs, acceptance docs, deployment docs, and `acceptance.json`.

## Non-goals

- No real dual-instance Redis production verification.
- No real webhook URL, signing secret, receiver secret, production host, certificate, token, or customer private data.
- No real Nginx HTTPS gateway acceptance claim.
- No new backend migration, notification feature, monitoring system, or architecture change.
- No customer / PM signature.
- No Task 8 READY claim.
- No git staging, commit, or push.

## Acceptance

- This task file contains checklist items with Scope / Non-goals / Acceptance / Verification.
- `check:websocket-notification-readiness-closure` validates this stage.
- Notification evidence remains connected to `check:task9d76`, `NotificationWebSocketTests`, `NotificationRestTests`, and `NotificationBroadcastTests`.
- `docs/deployment/websocket-notification-production-readiness.md` exists and keeps true environment fields as `待填写` / `待确认`.
- Project entry docs point to GOAL-014 / TASK-015 and record this as WebSocket / notification readiness consolidation, not real production acceptance.
- `websocket-notification-prod` remains `PARTIAL`.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:websocket-notification-readiness-closure
npm run check:task9d76
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=NotificationBroadcastTests,NotificationWebSocketTests,NotificationRestTests test
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

## Checklist

- [x] Stage machine check.
  - Scope: add `scripts/check-websocket-notification-readiness-closure.mjs` and `check:websocket-notification-readiness-closure` to validate GOAL-014 / TASK-015, the readiness template, active RepoFrame pointers, existing notification evidence, readiness gaps, and fake READY language.
  - Non-goals: do not add browser automation here; do not weaken 9D.76 checks; do not remove external blockers.
  - Acceptance: the check fails before GOAL-014 / TASK-015 / template writeback and passes after writeback.
  - Verification: `npm run check:websocket-notification-readiness-closure`.

- [x] Production readiness template.
  - Scope: create `docs/deployment/websocket-notification-production-readiness.md` with true dual-instance Redis, heartbeat / reconnect pressure, Nginx HTTPS WebSocket gateway, browser notification permission, full business-page linkage, production webhook, monitoring, and rollback evidence rows.
  - Non-goals: do not fill real secrets, real webhook URLs, real hosts, certificates, private keys, tokens, or customer private data; do not claim the template has been executed.
  - Acceptance: all true environment result cells remain `待填写` / `待确认`; boundary text says it does not represent real Redis, HTTPS, webhook, or production notification acceptance.
  - Verification: `npm run check:websocket-notification-readiness-closure`.

- [x] Notification evidence consolidation.
  - Scope: connect current docs and `acceptance.json` to 9D.76 evidence, including Nginx `/notifications` and `/ws/` proxy config, Redis broadcaster/listener code path, REST isolation/read tests, WebSocket desensitization tests, and Redis remote-broadcast tests.
  - Non-goals: do not start a real two-backend deployment; do not claim browser notification permission, complete page linkage, or production monitoring is complete.
  - Acceptance: docs state the stage is local readiness / template closure and `websocket-notification-prod` remains `PARTIAL`.
  - Verification: `npm run check:websocket-notification-readiness-closure`; `npm run check:task9d76`; notification target tests.

- [x] RepoFrame and readiness writeback.
  - Scope: update `acceptance.json`, `STATUS.md`, `PROJECT.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, PRD V2 matrix, Task 8 matrix, readiness checklist, and final readiness report.
  - Non-goals: do not weaken acceptance gaps; do not mark Task 8 READY; do not close real dual-instance Redis, Nginx HTTPS, production webhook, customer signature, monitoring, or real environment blockers.
  - Acceptance: project docs point to GOAL-014 / TASK-015 and record this as WebSocket / notification readiness closure with external blockers preserved.
  - Verification: `npm run check:websocket-notification-readiness-closure`; `npm run check:task8-readiness-gaps`; `npm run acceptance`; `git diff --check`.

## Assumption Checks

- GOAL-013 remains completed and continues to guard frontend / customer-smoke consolidation history.
- 9D.76 remains the source evidence for current notification gateway readiness.
- Local checks and templates are not substitutes for real dual-instance Redis, Nginx HTTPS, production webhook, customer / PM signature, or real environment acceptance.

## Downstream Impact

- Future production notification acceptance can start from one current GOAL-014 pointer and one sanitized readiness template.
- Future real environment work still needs actual infrastructure, secret injection, monitoring, and customer / PM decisions.

## Completion Record

- Added `npm run check:websocket-notification-readiness-closure`.
- Added `docs/deployment/websocket-notification-production-readiness.md` as the sanitized production WebSocket / notification readiness template.
- Repointed active RepoFrame metadata from GOAL-013 to GOAL-014.
- Consolidated 9D.76 notification gateway evidence in entry docs, acceptance docs, deployment docs, and `acceptance.json`.
- Verified `check:websocket-notification-readiness-closure`, `check:task9d76`, notification target tests, readiness gaps, acceptance JSON validity, and diff whitespace.
- Kept `websocket-notification-prod` as `PARTIAL` and Task 8 as `NOT_READY`.

## Remaining Work

- Real dual-backend Redis WebSocket verification remains open.
- Nginx HTTPS WebSocket gateway smoke remains open.
- Heartbeat / reconnect pressure and full business-page linkage remain open.
- Production webhook integration remains open.
- Customer / PM signature and real environment acceptance remain open.
