# TASK-023 PRD V2 P0 Local Closure

Status: `completed`

Goal: `goals/GOAL-022-prd-v2-p0-local-closure-20260715.md`

## Scope

Execute the local P0 closure as one batch: security boundaries, workflow selection/timing gates, staff-account lifecycle, contract/frontend alignment, targeted tests, and evidence writeback.

## Non-goals

No real-environment execution or credentials; no production data mutation; no Task 8 READY claim; no staging, commit, or push.

## Acceptance

All checklist items below pass their listed verification and leave remaining external acceptance explicitly pending.

## Verification

`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=PrdV2P0LocalClosureTests test`; `npm run check:openapi`; `npm run build:frontend`; `npm run check:task8-readiness-gaps`; `npm run acceptance`; `git diff --check`.

## Checklist

 - [x] Security and CORS boundaries.
  - Scope: block doctor access to all internal workflow endpoints, reject anonymous order reads in production security mode, and restore localhost plus 127.0.0.1 Vite login origins.
  - Non-goals: do not loosen Bootstrap/Bearer authentication rules or expose internal fields through replacement endpoints.
  - Acceptance: target tests prove doctor/anonymous requests are denied and both local Vite origins work.
  - Verification: `PrdV2P0LocalClosureTests` and bearer-identity regression tests.

 - [x] Workflow-chain selection and production gates.
  - Scope: derive the seeded chain from the order product type and approved production parameters; enforce design confirmation before production starts and OUT/PASS before successor activation.
  - Non-goals: do not add a dynamic workflow editor or change completed historical process facts.
  - Acceptance: no arbitrary chain is selected, pending/rejected design blocks start, and FAIL keeps successors locked while PASS activates them.
  - Verification: `PrdV2P0LocalClosureTests` plus existing workflow/check tests.

 - [x] Administrator staff-account lifecycle.
  - Scope: add the minimum ADMIN-only create/edit technician account API and management-page entry using existing users, departments, posts, roles, and login primitives.
  - Non-goals: no complete HR suite, salary, multi-device session policy, or new identity provider.
  - Acceptance: an ADMIN creates a unique WORKER with department/post and initial password; the user can log in; non-admin and invalid references are rejected.
  - Verification: `PrdV2P0LocalClosureTests`, OpenAPI check, frontend build.

 - [x] Acceptance and project writeback.
  - Scope: update the active 38-item audit, gap matrix, readiness, status, task index, README, decisions, and `acceptance.json` according to actual test evidence.
  - Non-goals: do not mark external acceptance, customer inputs, or Task 8 complete.
  - Acceptance: local P0 closures are evidence-backed and all external work remains visible.
  - Verification: project checks and `git diff --check`.

## Assumption Checks

- Existing application tests use a local seeded DB and can safely create isolated rows.
- Workflow chains are selected by normalized product type; lack of a mapping is a business validation error.
- Existing admin RBAC grants can be reused; this task does not invent new privileged roles.

## Downstream Impact

- Production-review clients can stop sending `chain_id`; stale explicit values must be corrected by the client.
- Orders containing design drafts may require a doctor-confirmed draft before a technician starts the process.
- Admin staff management gains a write path and must surface API validation errors.

## Completion Record

 Completed 2026-07-15. Workflow-definition endpoints now require internal permission; loopback login CORS, product-type chain selection, design/OUT-PASS gates, and the ADMIN worker-account lifecycle are covered by targeted tests. External acceptance remains unchanged.

## Remaining Work

Page/branch acceptance and all real-environment/final-delivery evidence remain outside this task.
