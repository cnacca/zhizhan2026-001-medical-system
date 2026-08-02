# TASK-012 Real Acceptance Confirmation Gate

Status: `completed`

Goal: `goals/GOAL-011-real-acceptance-confirmation-20260707.md`

## Summary

Execute the customer / PM confirmation and real-environment AI / deployment acceptance gate as one batch task. This task keeps the work as one checklist instead of creating separate tasks for each template.

## Scope

- Confirm the existing customer / PM confirmation table is the current gate for CP-001 to CP-009.
- Confirm the AI real key / production webhook template remains safe, unfilled, and not falsely completed.
- Confirm the production deployment / HTTPS / backup / monitoring template remains safe, unfilled, and not falsely completed.
- Update RepoFrame pointers and project entry docs from GOAL-010 to GOAL-011.
- Add one stage-level machine check.

## Non-goals

- No real key, webhook, secret, token, certificate, production host, customer private data, or signature.
- No business code, frontend code, backend code, migration, or OpenAPI change.
- No customer-final BI / statistics口径 claim.
- No Task 8 READY claim.
- No git staging, commit, or push.

## Acceptance

- This task file contains checklist items with Scope / Non-goals / Acceptance / Verification.
- `check:real-acceptance-confirmation` validates this stage.
- Customer / PM confirmation items remain present and not falsely confirmed.
- 9D.80 / 9D.81 templates remain template-only and safe for later real-environment use.
- `acceptance.json`, `STATUS.md`, `tasks/README.md`, `README.md`, and `DECISIONS.md` point to GOAL-011 / TASK-012.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:real-acceptance-confirmation
npm run check:task9d72
npm run check:task9d80
npm run check:task9d81
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

## Checklist

- [x] Stage container and failing check.
  - Scope: create GOAL-011 / TASK-012 expectations and a stage-level check command.
  - Non-goals: no business implementation; no external acceptance claims.
  - Acceptance: pre-change red check fails because GOAL-011 / TASK-012 and the script are missing.
  - Verification: `test -f goals/GOAL-011-real-acceptance-confirmation-20260707.md`; `npm run check:real-acceptance-confirmation`.

- [x] Customer / PM confirmation gate.
  - Scope: keep CP-001 through CP-009 in `docs/acceptance/phase-one-customer-pm-confirmations.md`, with owner/date/status/risk/verification fields and no `CONFIRMED` claims.
  - Non-goals: no customer signature, no PM decision replacement, no real commercial data.
  - Acceptance: `customer-pm-confirmations` remains `BLOCKED`; CP items remain `BLOCKED` or `PROPOSED_DEFAULT`.
  - Verification: `npm run check:task9d72`; `npm run check:real-acceptance-confirmation`.

- [x] Real AI and deployment template gate.
  - Scope: keep 9D.80 and 9D.81 templates ready for real environment evidence while leaving all real values as `待填写` / `待确认`.
  - Non-goals: no real DeepSeek key, webhook URL, signing secret, server address, certificate private key, MinIO credential, or production validation claim.
  - Acceptance: templates remain `TEMPLATE_READY / PARTIAL` and contain explicit non-secret boundaries.
  - Verification: `npm run check:task9d80`; `npm run check:task9d81`; `npm run check:real-acceptance-confirmation`.

- [x] Machine checks and documentation writeback.
  - Scope: update `acceptance.json`, `STATUS.md`, `tasks/README.md`, `README.md`, `DECISIONS.md`, PRD V2 matrix, Task 8 matrix, readiness checklist, and final readiness report.
  - Non-goals: do not weaken acceptance gaps; do not mark Task 8 READY; do not close external blockers.
  - Acceptance: project docs point to GOAL-011 / TASK-012 and record this as a gate, not real acceptance completion.
  - Verification: `npm run check:real-acceptance-confirmation`; `npm run check:task8-readiness-gaps`; `npm run acceptance`; `git diff --check`.

## Assumption Checks

- GOAL-010 completed the current local PRD V2 implementation-ready queue.
- The next phase can only safely close local documentation/check readiness for customer / PM and real-environment acceptance, not the actual external confirmations.
- Real keys, webhook URLs, server addresses, signatures, and customer private data must stay outside the repository.

## Downstream Impact

- Later real-environment work can fill 9D.80 / 9D.81 records with non-secret evidence and update confirmation statuses only after written customer / PM approval.
- This task makes it harder for future sessions to accidentally mark Task 8 READY from local-only evidence.

## Completion Record

- Added GOAL-011 / TASK-012 as the phase-level confirmation / real acceptance gate container.
- Added `npm run check:real-acceptance-confirmation`.
- Repointed active RepoFrame metadata from GOAL-010 to GOAL-011.
- Updated project entry docs to record remaining blockers explicitly.

## Remaining Work

- Customer / PM must provide written confirmation for CP-001 to CP-009.
- Real DeepSeek key, production webhook, deployment, HTTPS, backup, monitoring, payment, logistics, customer statistics口径, customer AI口径, and customer signatures remain external or confirmation-bound blockers.

## Known Risks

- This gate can prove the repository is honest about blockers; it cannot prove real environment readiness without external evidence.
