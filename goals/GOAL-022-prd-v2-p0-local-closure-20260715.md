# GOAL-022 PRD V2 P0 Local Closure

Status: `completed`

Mode: `stage-goal`

## Summary

Close local phase-one P0 gaps: workflow access isolation, anonymous order-read isolation and loopback CORS, automatic workflow-chain selection, design/inspection timing gates, and administrator-managed technician accounts.

Task 8 remains `NOT_READY`. Real model, object-storage, network, deployment, customer-input, training, and final-acceptance work are outside this local code goal.

## Scope

- Close PRD V2 items 11.2-01, 11.2-04, 11.3-01, 11.1-06 and 11.5-01 where code and tests can prove the local behavior.
- Close the two cross-item workflow gates: doctor-approved design before production starts, and OUT/PASS inspection before a checked node unlocks successors.
- Add focused backend and browser/API verification, then recalibrate project records without weakening external blockers.

## Non-goals

- No real AI key, webhook, object-storage, network, server, HTTPS, payment, logistics, electronic signature, customer template, standard-hour data, training signoff, or final acceptance claim.
- No production-data mutation, dependency expansion, authentication bypass, git staging, commit, or push.
- Do not mark Task 8 or any real-environment acceptance item ready.

## Acceptance

- Doctor and anonymous callers cannot read internal production workflow or cross-clinic order data.
- Production review selects a valid predefined workflow chain without requiring a caller-supplied `chain_id`.
- Production cannot start before relevant design confirmation; checked-node successors do not activate until an OUT/PASS check succeeds.
- An administrator can create a technician account with department/post/role data and the account can authenticate through the existing login path.
- Every checklist item in TASK-023 has an automated verification path; active documents distinguish local closures from external work.

## Verification

`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=PrdV2P0LocalClosureTests test`; `npm run check:openapi`; `npm run build:frontend`; `npm run acceptance`; `git diff --check`.

## Assumption Checks

- Existing RBAC, department, post, and password-login tables are the supported phase-one account foundation; no new identity provider is needed.
- The nine seeded workflow chains cover product types accepted by the order form. Unsupported product input must reject rather than choose an arbitrary chain.
- “生产启动” means the first workflow node may start only after a doctor-confirmed design exists when that order has design drafts.

## Downstream Impact

- API callers may omit `chain_id` for production approval; inconsistent explicit values are rejected.
- Existing seeded/demo orders without design drafts remain runnable; orders with a pending/rejected design require doctor confirmation.
- Frontend production review and admin staff pages must consume the adjusted contracts.

## Remaining Work

- After this local P0 goal: complete remaining PRD V2 page/branch acceptance (full implant order browser flow, quality time trends, design rejection/version browser paths) and then execute externally gated real-environment acceptance.

## Completion Record

- 2026-07-15: protected workflow-definition reads, restored localhost/loopback login CORS, and retained the existing process-instance doctor-denial regression.
- Production approval now derives the active predefined chain from the order product type; an explicit inconsistent chain is rejected.
- A pending/rejected latest design blocks the first production start; a node needing OUT inspection keeps successors and instance completion locked until OUT/PASS.
- Added ADMIN-only technician account create/edit, active department/post selectors, password hashing, WORKER role assignment, production-portal login coverage, and an admin UI entry.
- Targeted backend tests (24) and frontend production build passed. Task 8 remains `NOT_READY`.
