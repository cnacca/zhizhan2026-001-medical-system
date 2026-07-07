# GOAL-014 WebSocket / Notification Readiness Closure

Status: `completed`

Mode: `stage-goal`

## Summary

Completed the next phase-level goal after GOAL-013: WebSocket / 通知生产 readiness 收口.

This goal consolidates the current notification gateway, WebSocket, Redis broadcast, REST isolation, and production-readiness evidence into one RepoFrame stage. It created a real-environment checklist template for later verification, but does not claim real dual-instance Redis, Nginx HTTPS, production webhook, customer signature, or real environment acceptance. Task 8 remains `NOT_READY`.

GOAL-013 remains completed as the frontend / customer-smoke consolidation stage. This goal focuses only on `websocket-notification-prod`.

## Scope

- Establish GOAL-014 as the current RepoFrame execution entry.
- Create one execution-batch task with checklist items for WebSocket / notification readiness closure.
- Add a stage-level machine check for GOAL-014 / TASK-015, notification readiness template, current evidence, readiness gaps, and fake READY language.
- Add a production readiness template for true dual-instance Redis, heartbeat / reconnect pressure, Nginx HTTPS WebSocket gateway, browser notification permission, full business-page linkage, and production webhook verification.
- Repoint project entry docs from GOAL-013 to GOAL-014 while preserving GOAL-013 as completed history.
- Keep `websocket-notification-prod` as `PARTIAL`.
- Keep Task 8 as `NOT_READY`.

## Non-goals

- Do not run or claim real dual-backend Redis production verification.
- Do not fill real webhook URL, signing secret, receiver secret, production host, certificate, token, or customer private data.
- Do not claim Nginx HTTPS production gateway acceptance.
- Do not implement new notification business features, browser notification permission UX, or production monitoring.
- Do not mark Task 8 READY.
- Do not touch `/Users/yuri/Documents/AI智能下单平台`.
- Do not `git add`, commit, or push.

## Acceptance

- `tasks/TASK-015-websocket-notification-readiness-closure-20260707.md` exists and contains one batch task with checklist items.
- `acceptance.json` points to GOAL-014 as the active goal.
- `npm run check:websocket-notification-readiness-closure` validates GOAL-014 / TASK-015, the readiness template, notification evidence, RepoFrame pointers, and no fake READY language.
- Existing 9D.76 checks and notification target tests remain connected.
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

Optional real-environment verification when infrastructure exists:

```bash
# Fill docs/deployment/websocket-notification-production-readiness.md with sanitized evidence only.
# Do not write real secrets, production URLs, private cert material, or customer private data.
```

## Observation Ledger

- 2026-07-07: GOAL-013 completed frontend / customer-smoke consolidation while preserving real acceptance blockers.
- 2026-07-07: Existing 9D.76 evidence already covers Nginx `/notifications` and `/ws/` proxy configuration, Redis broadcast code path, notification REST isolation / read state tests, WebSocket payload desensitization tests, and Redis remote-broadcast tests.
- 2026-07-07: This goal adds the missing readiness record template and stage-level machine check without converting local checks into production acceptance.

## Replan Notes

The next stage after GOAL-014 should be selected from external blockers or explicit customer / PM decisions: real dual-instance Redis verification, Nginx HTTPS smoke, production webhook integration, production monitoring, real deployment acceptance, or customer / PM signatures. Those remain outside this local closure unless real evidence becomes available.
