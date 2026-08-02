# TASK-022 PRD V2 Acceptance Recalibration

<!-- repo-init:managed -->

## Metadata

- ID: `TASK-022`
- Status: `completed`
- Owner: `shared`
- Goal: `goals/GOAL-021-prd-v2-acceptance-recalibration-20260715.md`
- Created: `2026-07-15`
- Updated: `2026-07-15`

## Why

The repository currently treats CP-001 through CP-009 as nine written customer/PM blockers. That conflicts with PRD V2 and the confirmed 2026-07-06 scope baseline, and hides locally unfinished phase-one work behind an external-confirmation label.

## Scope

- Correct the customer/PM confirmation classification and counts.
- Add a canonical 38-item PRD V2 acceptance audit with evidence and remaining gaps.
- Reclassify the `customer-pm-confirmations` readiness entry without falsely closing Task 8.
- Update active project, decision, status, task, acceptance, readiness, and technical-plan documents.
- Update or add machine checks so the corrected classification cannot regress.

## Non-goals

- No backend or frontend business-code implementation.
- No production data mutation.
- No real credential, webhook, server, customer name, or private data entry.
- No claim that customer signature, training, or real-environment acceptance is complete.
- No implementation of real payment, logistics API, electronic signature, STL viewer, RAG, or tool calling as phase-one blockers.

## Checklist

### 1. Source and classification baseline

- Scope: Extract the 38 PRD V2 acceptance items and map the 2026-07-06 scope decisions.
- Non-goals: Do not infer new requirements from current code or demo data.
- Acceptance: Counts reconcile to 38; confirmation count is 2; signature count is 0.
- Verification: Source audit plus `npm run check:prd-v2-acceptance-recalibration`.

### 2. Confirmation-list correction

- Scope: Reclassify CP-001 through CP-009 as confirmed baseline, pending confirmation, customer input, business data, out of scope, delivery evidence, or environment acceptance.
- Non-goals: Do not delete historical IDs or claim pending inputs are received.
- Acceptance: Only CP-002 and CP-005 remain product confirmations; CP-003 is template input; CP-004 is standard-duration data; CP-006/007 do not block P0; CP-008/009 are acceptance/execution evidence.
- Verification: `npm run check:task9d72` and `npm run check:real-acceptance-confirmation`.

### 3. Thirty-eight-item evidence recount

- Scope: Assign `PASS`, `PARTIAL`, `MISSING`, or `EXTERNAL_ACCEPTANCE` using current code, tests, smoke, and documents.
- Non-goals: Do not turn local static checks into real-environment acceptance.
- Acceptance: Every row has current evidence, missing work, and a verification path.
- Verification: `npm run check:prd-v2-acceptance-recalibration` and targeted existing checks referenced by the matrix.

### 4. Active document and acceptance writeback

- Scope: Update `acceptance.json`, `STATUS.md`, `tasks/README.md`, `README.md`, `PROJECT.md`, `DECISIONS.md`, and related acceptance/readiness documents.
- Non-goals: Do not rewrite completed historical task logs.
- Acceptance: Active documents use one corrected count and link the 38-item audit.
- Verification: RepoFrame linter, `npm run check:repoframe-docs`, `npm run check:task8-readiness-gaps`, and `npm run acceptance`.

### 5. Final consistency verification

- Scope: Run all documentation, scope, confirmation, readiness, and JSON checks affected by this change.
- Non-goals: Do not run unrelated destructive or production commands.
- Acceptance: All checks attributable to this recalibration pass, known pre-existing repository-wide checker drift is recorded separately, and Task 8 remains `NOT_READY`.
- Verification: Commands listed below plus `git diff --check`.

## Acceptance Criteria

- The corrected counts are machine-checkable.
- The 38-item matrix is complete and internally consistent.
- Stale CP-001 through CP-009 all-blocked checks are replaced with corrected semantics.
- Real local implementation gaps remain visible and prioritized.
- Task 8 remains `NOT_READY`.

## Verification Commands

```bash
npm run check:prd-v2-acceptance-recalibration
npm run check:task9d72
npm run check:real-acceptance-confirmation
npm run check:scope-baseline-20260706
npm run check:task8-readiness-gaps
npm run check:phase-one-closure-plan
npm run check:phase-one-workflow
npm run check:stage-goal-window
npm run check:repoframe-docs
python3 /Users/yuri/.codex/skills/repo-init/scripts/lint_acceptance.py --repo .
npm run acceptance
git diff --check
```

## Assumption Checks

### Validated

- The PRD source body is V2.0 dated 2026-07-04 despite the filename containing V1.0.
- The actual source fingerprint is recorded in the 38-row audit so future reviews do not silently fall back to the repository's older V1.0 copy.
- The 2026-07-06 baseline records the default scope as confirmed.
- The old CP list predates that baseline and mixes several different kinds of dependencies.

### Invalidated

- All CP-001 through CP-009 require separate written customer/PM confirmation.
- Real payment, logistics API, electronic signature, STL viewer, RAG, and tool calling are phase-one P0 blockers.
- Nine workflow chains, mandatory checks, and the design confirmation gate need a new signature before development.

### Still Open

- Dynamic form final fields.
- File size/count/type whitelist final values.
- Customer AI-5 production-note template input.
- Standard-duration business data; provider to be assigned by the project.
- Real-environment execution and final overall acceptance evidence.

## Downstream Impact

- Phase-one work must be prioritized from actual `PARTIAL`/`MISSING` acceptance rows, not from a nine-signature queue.
- Existing historical 9D.72 and GOAL-011 records remain evidence of the old tracking model but are superseded for current status by GOAL-021/TASK-022.
- Future code work should close locally actionable gaps before requesting final customer acceptance.

## Completion Record

- Completed on 2026-07-15. The corrected classification, 38-row audit, current-document overrides, readiness state, machine checks, and durable `AGENTS.md` anti-regression rule are in place. No backend/frontend business code or production data was changed.
- GOAL-021-specific and affected package checks pass. The repository-wide RepoFrame/linter and frontend productization baseline failures are recorded below and are not masked as pass.

## Remaining Work

- No remaining work inside this documentation/audit task.
- Phase-one delivery work remains: close the audit matrix `MISSING` / `PARTIAL` rows, the two cross-item workflow gates, 2026-07-06 A/B/C scope gaps, real-environment evidence, and final overall acceptance.

## Execution Log

- 2026-07-15: Task started after the user authorized the full confirmation-classification correction and 38-item acceptance recount.
- 2026-07-15: Confirmed 38 unique source IDs and status totals; added Q3 default-parameter coverage and clarified that the 38 source rows do not replace the 2026-07-06 scope/readiness matrices.
- 2026-07-15: Passed recalibration, 9D.72, real-confirmation, scope-baseline, Task 8 gaps, phase plan/workflow/window, PRD A-D, auth A/B, customer smoke, notification, operations, main-chain, AI, deployment, acceptance JSON, compatibility, and `git diff --check` checks.
- 2026-07-15: Recorded existing unrelated failures: `check:repoframe-docs` requires obsolete AGENTS wording; the global acceptance linter has legacy active-goal/forbidden-text expectations; `check:frontend-productization-closure` expects state-strip identifiers/text absent from current `App.vue`; the combined Bearer identity target tests expose one loopback CORS regression for `127.0.0.1:5173`.
