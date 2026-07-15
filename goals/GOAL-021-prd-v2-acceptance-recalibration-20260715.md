# GOAL-021 PRD V2 Acceptance Recalibration

<!-- repo-init:managed -->

## Metadata

- ID: `GOAL-021`
- Status: `completed`
- Type: `milestone`
- Mode: `repo-hydrate`
- Source: `PRD V2.0 / 2026-07-04, 2026-07-06 confirmed scope baseline, user-approved confirmation-count correction`
- Created: `2026-07-15`
- Updated: `2026-07-15`

## Final Outcome

The active project documents distinguish requirement confirmation, customer-provided material, business data, environment coordination, and final delivery evidence. The status of the original PRD V2 38-row acceptance table is recalculated instead of treating CP-001 through CP-009 as nine customer-signature blockers; the 2026-07-06 A/B/C scope, cross-item gates, readiness, and delivery evidence remain separate phase-one measures.

Task 8 remains `NOT_READY`; this goal corrects the reason and the measurable remaining work without claiming real customer signature or real-environment acceptance.

## Human Acceptance

- The pending product-confirmation count is recorded as 2: dynamic form fields and file upload limits.
- AI-5 production-note template is recorded as customer-provided material, not a signature item.
- Standard process durations are recorded as business data needed for real performance calculations, with the provider to be assigned by the project, not as a new product-signature item.
- CP-001 through CP-009 are retained as historical identifiers but reclassified by their actual nature.
- The 38 PRD V2 acceptance items have an evidence-backed `PASS`, `PARTIAL`, `MISSING`, or `EXTERNAL_ACCEPTANCE` status.
- Phase-two and non-PRD items do not block phase-one readiness.

## Machine Acceptance

- See `acceptance.json` goal `GOAL-021`.
- Primary verification: `npm run check:prd-v2-acceptance-recalibration`.
- Project verification: RepoFrame linter, confirmation checks, Task 8 readiness check, acceptance JSON validation, and `git diff --check`.

## Constraints

- Do not modify backend or frontend business code in this documentation/audit goal.
- Do not invent customer confirmations, signatures, credentials, or real-environment results.
- Do not mark Task 8 `READY`.
- Preserve historical task records; add current override language where old conclusions are superseded.
- Do not add, commit, or push unless separately requested.

## Current Strategy

- Treat the original PRD V2 DOCX and the 2026-07-06 confirmed scope baseline as the requirements authority.
- Keep a dedicated 38-item matrix for the original PRD V2 acceptance table without treating it as the whole phase-one completion measure.
- Reclassify stale external blockers into product confirmation, material/data input, environment execution, final acceptance evidence, or out-of-scope.
- Use conservative status assignment: no `PASS` without direct code/test/smoke evidence.

## Planned Tasks

- `tasks/TASK-022-prd-v2-acceptance-recalibration-20260715.md`.

## Observation Ledger

- Date=2026-07-15; Source=user-confirmation; Observation=The user confirmed the previous nine-item signature count was overbroad and authorized the full correction and 38-item recount; Impact=reclassify-acceptance; Follow-up=Execute TASK-022.
- Date=2026-07-15; Source=PRD-V2; Observation=PRD V2 has two explicit PM/customer confirmation packages, no per-feature signature requirement, one customer template input, and 38 phase-one acceptance tests; Impact=replace-stale-blocker-model; Follow-up=Keep Task 8 NOT_READY for actual implementation and environment gaps.

## Replan History

- 2026-07-15: Created GOAL-021 to supersede the active use of the overbroad CP-001 through CP-009 blocker model while preserving its history.
- 2026-07-15: Kept the 38 source-table statuses separate from two cross-item workflow gates and from the 2026-07-06 A/B/C scope matrix, so a passing source row cannot be mistaken for whole-phase completion.

## Completion Record

- Completed on 2026-07-15.
- Reclassified CP-001 through CP-009 into 2 product confirmations, 2 business inputs, 2 confirmed baselines, 1 out-of-phase-one item, and 2 delivery/environment evidence items; PRD per-feature signature count is 0.
- Added the canonical 38-row audit with 18 PASS, 8 PARTIAL, 4 MISSING, and 8 EXTERNAL_ACCEPTANCE, plus two cross-item workflow gates and the separate 2026-07-06 scope boundary; recorded the actual V2 source path and SHA-256 fingerprint to prevent future source confusion.
- Updated active project, decision, acceptance, readiness, delivery, machine-check, and durable `AGENTS.md` guidance. Task 8 remains `NOT_READY`.
- All GOAL-021-specific, confirmation, scope, readiness, workflow, PRD A-D, auth, customer-smoke, notification, operations, main-chain, AI, deployment, JSON, and diff checks passed.
- Existing repository-wide baseline failures remain outside this documentation task: the RepoFrame checker expects an obsolete AGENTS handoff phrase; the acceptance linter contains historical active-goal expectations and legacy forbidden-text false positives; the frontend productization checker expects state-strip text absent from current `App.vue`; the combined Bearer identity target tests have one loopback CORS regression for `127.0.0.1:5173`.
