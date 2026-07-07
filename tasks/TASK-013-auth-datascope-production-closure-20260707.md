# TASK-013 Auth / DataScope Production Closure

Status: `completed`

Goal: `goals/GOAL-012-auth-datascope-production-closure-20260707.md`

## Summary

Execute 权限 / DataScope 生产化收口第一段 as one batch task. This task keeps the work as one checklist instead of creating separate tasks for each endpoint or document.

## Scope

- Add strict permission-mode target tests before implementation.
- Close roles-only `@RequirePermission` declarations for clinic, doctor account, and notification endpoints.
- Seed the corresponding permission codes for local database roles.
- Add a stage-level machine check for source, tests, RepoFrame pointers, readiness docs, and fake READY language.
- Update project entry docs and acceptance pointers from GOAL-011 to GOAL-012.

## Non-goals

- No complete Spring Security/JWT.
- No generic SQL DataScope interceptor.
- No RuoYi admin UI or role/menu management screens.
- No access-token blacklist, refresh-token rotation, or multi-device session policy.
- No real key, webhook, secret, token, certificate, production host, customer private data, or signature.
- No Task 8 READY claim.
- No git staging, commit, or push.

## Acceptance

- This task file contains checklist items with Scope / Non-goals / Acceptance / Verification.
- `check:auth-datascope-prod-closure` validates this stage.
- The target strict permission-mode test fails before implementation and passes after permission-code hardening.
- Main source no longer has roles-only `@RequirePermission(roles = ...)` annotations.
- V36 seeds `clinic:*`, `account:doctor`, and `notification:*` permissions and grants them to local roles.
- `acceptance.json`, `STATUS.md`, `PROJECT.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, and readiness / acceptance docs point to GOAL-012 / TASK-013.
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

## Checklist

- [x] Strict permission-code gate.
  - Scope: add a target test for strict permission mode on doctor account settings, proving role-only DOCTOR tokens are rejected and `account:doctor` tokens are accepted.
  - Non-goals: do not replace the auth stack, JWT format, refresh token design, or DataScope model.
  - Acceptance: pre-change red test fails with role-only DOCTOR token returning 200; after implementation the same test returns 403 and permission-coded token returns 200.
  - Verification: `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=StrictPermissionModeTests test`.

- [x] Roles-only annotation inventory.
  - Scope: add permission-code annotations for clinic, doctor account, and notification controllers, and add V36 permission-code seed grants for local roles.
  - Non-goals: do not introduce broad new business access, do not change doctor/clinic service-level scope checks, and do not add unrelated permissions.
  - Acceptance: source has no roles-only `@RequirePermission(roles = ...)` annotations; clinic, account, and notification endpoints all declare permission codes.
  - Verification: `npm run check:auth-datascope-prod-closure`; `rg -n "@RequirePermission\\((roles|\\s*roles)" backend/platform-server/src/main/java/com/yuri/aiorder`.

- [x] RepoFrame and readiness writeback.
  - Scope: update `acceptance.json`, `STATUS.md`, `PROJECT.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, PRD V2 matrix, Task 8 matrix, readiness checklist, and final readiness report.
  - Non-goals: do not weaken acceptance gaps; do not mark Task 8 READY; do not close complete Spring Security/JWT, generic SQL DataScope, RuoYi admin UI, token blacklist, refresh rotation, or multi-device session policy.
  - Acceptance: project docs point to GOAL-012 / TASK-013 and record this as a first production-hardening segment, not complete auth/DataScope readiness.
  - Verification: `npm run check:auth-datascope-prod-closure`; `npm run check:task8-readiness-gaps`; `npm run acceptance`; `git diff --check`.

## Assumption Checks

- GOAL-011 remains completed and continues to guard real external confirmations.
- 9D.75 already closed the first strict permission-code mode path for endpoints with declared permission codes.
- This task closes the remaining roles-only annotation inventory without claiming the broader auth/DataScope readiness gap is complete.

## Downstream Impact

- Later production auth work can focus on Spring Security/JWT, generic DataScope SQL, refresh-token rotation, access-token blacklist, multi-device session policy, and RuoYi management UI.
- Future endpoint additions should include permission codes immediately, not roles-only annotations.

## Completion Record

- Added strict permission-mode regression for doctor account settings.
- Added `account:doctor`, `clinic:*`, and `notification:*` permission-code declarations and V36 role grants.
- Added `npm run check:auth-datascope-prod-closure`.
- Repointed active RepoFrame metadata from GOAL-011 to GOAL-012.
- Updated project and readiness docs while keeping Task 8 `NOT_READY`.

## Remaining Work

- Complete Spring Security/JWT strategy remains open.
- Generic SQL DataScope interceptor remains open.
- RuoYi management UI remains open.
- Refresh-token rotation, access-token blacklist, and multi-device session policy remain open.
- Real production environment and customer / PM acceptance remain external blockers.
