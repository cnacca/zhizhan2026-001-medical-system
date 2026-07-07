# GOAL-012 Auth / DataScope Production Closure

Status: `completed`

Mode: `stage-goal`

## Summary

Advance the next phase-level goal after GOAL-011: 权限 / DataScope 生产化收口第一段.

This goal closes a local production-hardening gap inside `auth-datascope-prod`: high-risk authenticated endpoints must not remain protected by roles-only `@RequirePermission` annotations when strict permission-code mode is enabled. Task 8 remains `NOT_READY`.

GOAL-011 remains completed as the customer / PM confirmation and real-environment acceptance gate. This goal does not claim real production readiness, complete Spring Security/JWT, complete RuoYi DataScope, access token blacklist, refresh-token rotation, multi-device session policy, customer signature, or real environment acceptance.

## Scope

- Establish GOAL-012 as the current RepoFrame execution entry.
- Create one execution-batch task with checklist items for strict permission-code production hardening.
- Add a target regression test proving a DOCTOR role-only token cannot access doctor account settings in strict permission mode.
- Add permission codes for clinic, doctor account, and notification endpoints that previously used roles-only annotations.
- Add database seed migration for the new permission codes and role grants.
- Add a stage-level machine check for roles-only annotation inventory, RepoFrame pointers, and readiness writeback.
- Keep `auth-datascope-prod` as `PARTIAL`.
- Keep Task 8 as `NOT_READY`.

## Non-goals

- Do not implement complete Spring Security/JWT.
- Do not implement a generic SQL DataScope interceptor.
- Do not implement RuoYi role/menu/department management UI.
- Do not implement refresh token rotation, access-token blacklist, or multi-device session policy.
- Do not enter or validate any real key, webhook, secret, token, certificate, production host, customer private data, or customer signature.
- Do not mark Task 8 READY.
- Do not touch `/Users/yuri/Documents/AI智能下单平台`.
- Do not `git add`, commit, or push.

## Acceptance

- `tasks/TASK-013-auth-datascope-production-closure-20260707.md` exists and contains one batch task with checklist items.
- `acceptance.json` points to GOAL-012 as the active goal.
- `npm run check:auth-datascope-prod-closure` validates GOAL-012 / TASK-013, no roles-only `@RequirePermission` annotations, V36 permission seeds, target strict-mode tests, and documentation writeback.
- `StrictPermissionModeTests` proves role-only DOCTOR tokens are rejected for doctor account settings and tokens with `account:doctor` are accepted.
- Clinic, doctor account, and notification controllers use permission-code declarations.
- `auth-datascope-prod` remains `PARTIAL`.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:auth-datascope-prod-closure
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=StrictPermissionModeTests test
npm run check:task9d75
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

## Observation Ledger

- 2026-07-07: GOAL-011 completed the confirmation / real-environment acceptance gate without closing external blockers.
- 2026-07-07: Existing strict permission mode rejected role-only Bearer tokens for endpoints that declared permission codes, but roles-only `@RequirePermission` annotations still allowed role-only access.
- 2026-07-07: This goal closes that local production-hardening gap for the remaining roles-only authenticated controllers.

## Replan Notes

The next auth/DataScope production closure segment should target either complete Spring Security/JWT strategy, generic DataScope SQL coverage, refresh-token rotation, access-token blacklist, or multi-device session policy. Those remain separate production-readiness gaps and must not be described as completed by this goal.
