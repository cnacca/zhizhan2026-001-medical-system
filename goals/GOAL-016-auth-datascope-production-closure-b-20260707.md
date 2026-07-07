# GOAL-016 Auth / DataScope Production Closure B

Status: `completed`

Mode: `stage-goal`

## Summary

Advance the next phase-level goal after GOAL-015: 权限 / DataScope 生产化补强 B.

This goal closes one local production-hardening segment inside `auth-datascope-prod`: refresh token rotation. Refresh success must issue a new refresh token, revoke the previous refresh token, and reject reuse of the old token. Task 8 remains `NOT_READY`.

GOAL-015 remains completed as the operations / rollback / training local closure stage. GOAL-012 remains completed as the first auth / DataScope production closure stage. This goal does not claim complete Spring Security/JWT, complete RuoYi DataScope, generic SQL DataScope, access token blacklist, multi-device session management, customer signature, or real environment acceptance.

## Scope

- Establish GOAL-016 as the current RepoFrame execution entry.
- Create one execution-batch task with checklist items for auth / DataScope production closure B.
- Add target regression coverage proving refresh token rotation and old refresh token reuse rejection.
- Implement refresh token rotation by issuing a successor token and revoking the token used for refresh.
- Update OpenAPI and local auth refresh check to reflect rotation semantics.
- Add a stage-level machine check for GOAL-016 / TASK-017, refresh rotation tests, source behavior, OpenAPI, readiness gaps, and fake READY language.
- Keep `auth-datascope-prod` as `PARTIAL`.
- Keep Task 8 as `NOT_READY`.

## Non-goals

- Do not implement complete Spring Security/JWT.
- Do not implement a generic SQL DataScope interceptor.
- Do not implement RuoYi admin UI or role/menu/session management screens.
- Do not implement access-token blacklist or full multi-device session policy.
- Do not enter or validate any real key, webhook, secret, token, certificate, production host, customer private data, or customer signature.
- Do not mark Task 8 READY.
- Do not touch `/Users/yuri/Documents/AI智能下单平台`.
- Do not `git add`, commit, or push.

## Acceptance

- `tasks/TASK-017-auth-datascope-production-closure-b-20260707.md` exists and contains one batch task with checklist items.
- `acceptance.json` points to GOAL-016 as the active goal.
- `npm run check:auth-datascope-prod-closure-b` validates GOAL-016 / TASK-017, refresh rotation implementation, target tests, OpenAPI wording, docs writeback, readiness gaps, and no fake READY language.
- `BearerIdentityTests` proves refresh returns a new refresh token, the old refresh token is rejected after rotation, and logout revokes the rotated token.
- `/api/auth/refresh` returns the rotated refresh token and `refreshExpiresAt`.
- `auth-datascope-prod` remains `PARTIAL`.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:auth-datascope-prod-closure-b
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests#refreshTokenRotatesAndRejectsOldTokenReuse test
npm run check:auth-refresh
npm run check:auth-datascope-prod-closure
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

## Observation Ledger

- 2026-07-07: GOAL-012 completed roles-only permission hardening while leaving refresh rotation, access token blacklist, Spring Security/JWT, generic DataScope, and multi-device session strategy open.
- 2026-07-07: Existing `/api/auth/refresh` returned the original refresh token and only updated `last_used_at`.
- 2026-07-07: This goal targets refresh token rotation as the next local, testable auth production-hardening segment.

## Replan Notes

The next auth/DataScope production closure segment should target access-token blacklist, multi-device session strategy, generic DataScope SQL coverage, complete Spring Security/JWT strategy, or RuoYi management UI. Those remain separate production-readiness gaps and must not be described as completed by this goal.
