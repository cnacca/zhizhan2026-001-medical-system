# TASK-017 Auth / DataScope Production Closure B

Status: `completed`

Goal: `goals/GOAL-016-auth-datascope-production-closure-b-20260707.md`

## Summary

Execute 权限 / DataScope 生产化补强 B as one batch task. This task keeps the work as one checklist instead of creating separate tasks for refresh rotation, checks, source changes, and documentation writeback.

## Scope

- Add a stage-level machine check before implementation and writeback.
- Add refresh token rotation regression tests before implementation.
- Implement refresh token rotation for `/api/auth/refresh`.
- Update OpenAPI and existing auth refresh checks from “not rotating” to rotation semantics.
- Repoint active RepoFrame metadata from GOAL-015 to GOAL-016.
- Update project entry docs, acceptance docs, deployment docs, and `acceptance.json`.

## Non-goals

- No complete Spring Security/JWT.
- No generic SQL DataScope interceptor.
- No RuoYi admin UI, role/menu UI, or session management UI.
- No access-token blacklist or full multi-device session policy.
- No real key, webhook, secret, token, certificate, production host, customer private data, or signature.
- No Task 8 READY claim.
- No git staging, commit, or push.

## Acceptance

- This task file contains checklist items with Scope / Non-goals / Acceptance / Verification.
- `check:auth-datascope-prod-closure-b` validates this stage.
- The target refresh rotation test fails before implementation and passes after implementation.
- Refresh success returns a new refresh token and revokes the previous refresh token.
- Old refresh token reuse returns 401 after rotation.
- OpenAPI and local checks describe rotation semantics.
- Project entry docs point to GOAL-016 / TASK-017 and record this as auth / DataScope production closure B, not complete auth/DataScope readiness.
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

## Checklist

- [x] Stage machine check.
  - Scope: add `scripts/check-auth-datascope-production-closure-b.mjs` and `check:auth-datascope-prod-closure-b` to validate GOAL-016 / TASK-017, refresh rotation behavior, active RepoFrame pointers, readiness gaps, and fake READY language.
  - Non-goals: do not replace broader auth checks; do not weaken GOAL-012 / 9D.75 checks; do not close unrelated external blockers.
  - Acceptance: the check fails before implementation / writeback and passes after all checklist items are complete.
  - Verification: `npm run check:auth-datascope-prod-closure-b`.

- [x] Refresh token rotation regression.
  - Scope: add a target test proving `/api/auth/refresh` returns a different refresh token, rejects the old refresh token, allows the rotated token, and lets logout revoke the rotated token.
  - Non-goals: do not test UI storage, multi-device session listing, or access token blacklist.
  - Acceptance: pre-change red test fails because refresh returns the original token and old-token reuse remains accepted.
  - Verification: `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests#refreshTokenRotatesAndRejectsOldTokenReuse test`.

- [x] Refresh token rotation implementation.
  - Scope: implement refresh rotation in `RefreshTokenService` and `BootstrapAuthController` by revoking the used refresh token and issuing a successor token in the same transaction path.
  - Non-goals: do not change access token format, token TTL policy, password auth, or database schema unless strictly required.
  - Acceptance: refresh returns a new refresh token; the used token is revoked; the rotated token can be used or logged out.
  - Verification: `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests#refreshTokenRotatesAndRejectsOldTokenReuse test`; `npm run check:auth-refresh`.

- [x] RepoFrame and readiness writeback.
  - Scope: update `acceptance.json`, `STATUS.md`, `PROJECT.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, PRD V2 matrix, Task 8 matrix, readiness checklist, and final readiness report.
  - Non-goals: do not weaken acceptance gaps; do not mark Task 8 READY; do not close complete Spring Security/JWT, generic SQL DataScope, RuoYi admin UI, access token blacklist, multi-device session policy, customer signature, or real environment blockers.
  - Acceptance: project docs point to GOAL-016 / TASK-017 and record refresh rotation as a local second auth production-hardening segment.
  - Verification: `npm run check:auth-datascope-prod-closure-b`; `npm run check:task8-readiness-gaps`; `npm run acceptance`; `git diff --check`.

## Assumption Checks

- GOAL-015 remains completed and continues to guard operations / rollback / training local closure history.
- GOAL-012 remains completed and continues to guard roles-only permission-code hardening history.
- Existing refresh token storage already hashes refresh token values and records `revoked_at`.
- Rotation can be implemented without schema changes by revoking the used row and inserting a new refresh token row.

## Downstream Impact

- Later auth work can focus on access token blacklist, multi-device session policy, complete Spring Security/JWT, generic SQL DataScope, and RuoYi management UI.
- Clients must replace stored refresh token with the latest refresh response; existing frontend already updates `refreshToken` from login/refresh response.

## Completion Record

- Added `npm run check:auth-datascope-prod-closure-b`.
- Added `BearerIdentityTests#refreshTokenRotatesAndRejectsOldTokenReuse` and verified the red failure against the previous non-rotating implementation.
- Implemented `RefreshTokenService#rotate` so refresh success revokes the used refresh token and issues a successor token.
- Updated `/api/auth/refresh` to return the rotated refresh token and updated OpenAPI / auth refresh checks.
- Repointed active RepoFrame metadata from GOAL-015 to GOAL-016.
- Updated project and readiness docs while keeping `auth-datascope-prod` as `PARTIAL` and Task 8 as `NOT_READY`.

## Remaining Work

- Complete Spring Security/JWT strategy remains open.
- Generic SQL DataScope interceptor remains open.
- RuoYi management UI remains open.
- Access-token blacklist and multi-device session policy remain open.
- Real production environment and customer / PM acceptance remain external blockers.
