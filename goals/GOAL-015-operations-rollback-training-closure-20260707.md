# GOAL-015 Operations / Rollback / Training Closure

Status: `completed`

Mode: `stage-goal`

## Summary

Completed the next phase-level goal after GOAL-014: 操作手册 / 回滚 / 培训材料本地收口.

This goal consolidates the current role operation manual, troubleshooting guide, delivery material index, rollback runbook template, and training material template into one RepoFrame stage. It adds a machine check for the operations material set, but does not claim real production rollback rehearsal, real customer training signoff, real deployment acceptance, customer signature, or Task 8 readiness. Task 8 remains `NOT_READY`.

GOAL-014 remains completed as the WebSocket / notification readiness consolidation stage. This goal focuses only on the `operations-manuals` readiness gap.

## Scope

- Establish GOAL-015 as the current RepoFrame execution entry.
- Create one execution-batch task with checklist items for operations / rollback / training closure.
- Add a stage-level machine check for GOAL-015 / TASK-016, operations docs, rollback template, training template, readiness gaps, and fake READY language.
- Refresh the role operation manual and troubleshooting guide with local demo, training, and rollback boundaries.
- Add sanitized templates for production rollback planning and customer training signoff.
- Repoint project entry docs from GOAL-014 to GOAL-015 while preserving GOAL-014 as completed history.
- Keep `operations-manuals` as `PARTIAL`.
- Keep Task 8 as `NOT_READY`.

## Non-goals

- Do not run or claim real production rollback rehearsal.
- Do not fill real server addresses, real secrets, real production URLs, certificate material, tokens, or customer private data.
- Do not claim customer training signoff or customer / PM signature.
- Do not claim real backup restore, monitoring alert, log retention, or release rollback acceptance.
- Do not implement new backend or frontend business features.
- Do not mark Task 8 READY.
- Do not touch `/Users/yuri/Documents/AI智能下单平台`.
- Do not `git add`, commit, or push.

## Acceptance

- `tasks/TASK-016-operations-rollback-training-closure-20260707.md` exists and contains one batch task with checklist items.
- `acceptance.json` points to GOAL-015 as the active goal.
- `npm run check:operations-rollback-training-closure` validates GOAL-015 / TASK-016, operations docs, rollback template, training template, RepoFrame pointers, readiness gaps, and no fake READY language.
- Existing 9D.70 checks remain connected.
- `operations-manuals` remains `PARTIAL`.
- Task 8 remains `NOT_READY`.

## Verification

```bash
npm run check:operations-rollback-training-closure
npm run check:task9d70
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

Optional real-environment verification when infrastructure and customer sessions exist:

```bash
# Fill docs/operations/phase-one-rollback-runbook.md and
# docs/operations/phase-one-training-materials.md with sanitized evidence only.
# Do not write real secrets, production URLs, private cert material, customer
# private data, or signed customer records into the repository.
```

## Observation Ledger

- 2026-07-07: GOAL-014 completed WebSocket / notification readiness consolidation while preserving real environment blockers.
- 2026-07-07: Existing 9D.70 evidence already covers role operation manual, troubleshooting guide, and delivery material index first increment.
- 2026-07-07: This goal adds rollback and training templates plus a stage-level machine check without converting local templates into production acceptance or customer signoff.

## Replan Notes

The next stage after GOAL-015 should be selected from real external blockers or explicit customer / PM decisions: customer training session and signoff, real production rollback rehearsal, backup restore drill, monitoring alert acceptance, real deployment acceptance, or customer / PM signatures. Those remain outside this local closure unless real evidence becomes available.
