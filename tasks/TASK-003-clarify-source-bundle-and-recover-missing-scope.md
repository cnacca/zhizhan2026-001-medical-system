# Clarify source bundle and recover missing scope

<!-- repo-init:managed -->

## Metadata

- ID: `TASK-003`
- Status: `superseded`
- Owner: `shared`
- Goal: `GOAL-002-scope-clarified-for.md`
- Created: `2026-04-22`
- Updated: `2026-04-22`

## Why

Superseded. The missing scope was resolved by the 2026-07-06 confirmed baseline, and subsequent development already advanced to 9D.99.

## Scope

- In scope: preserve this file as repo-init traceability.
- In scope: point future agents to the current baseline and active task route.
- Out of scope: using this task as the current implementation entry.

## Acceptance Criteria

- Future agents can see that TASK-003 is superseded.
- Future agents start from `STATUS.md`, `tasks/README.md`, `acceptance.json`, `goals/GOAL-003-repoframe-doc-hydration-20260707.md`, `tasks/TASK-004-repoframe-doc-hydration-20260707.md`, and `docs/acceptance/phase-one-scope-baseline-20260706.md`.
- No implementation work is scheduled from this task.

## Dependencies

- Files: `PROJECT.md, STATUS.md, goals/GOAL-002-scope-clarified-for.md, AI智能下单平台_2026-07-06_新需求范围内部确认版.docx`
- Decisions: `none`
- External: `none`

## Plan

1. Do not execute this task as a live task.
2. Use the current next step in `STATUS.md`.
3. If the source bundle changes, create a new task instead of reviving this one silently.

## Goal Alignment

- Goal file: `GOAL-002-scope-clarified-for.md`
- This task is a provisional route toward the goal, not a durable scope boundary.

## Replanning Notes

- Agents may rewrite, split, reorder, or supersede this task when observations show a better route to the goal.
- Goal, hard-constraint, durable-scope, accepted-success-criteria, and collaboration-contract changes require explicit human confirmation.

## Related Planned Tasks

- No adjacent planned-task dependency was inferred during initialization.

## Open Questions

- none for this superseded task.

## Notes

- Facts: goal file is `goals/GOAL-002-scope-clarified-for.md`; recommended order position is `1`
- Assumptions: this task remains `planned` until a human or agent explicitly starts it
- Risks: unresolved source questions must be answered before implementation work can be sequenced safely

## Assumption Checks

Update these lists whenever current execution validates or invalidates the task's working assumptions.

### Validated

- 2026-07-06 scope baseline exists.
- 9D.99 A/B 类一期范围对齐第一段 exists.
- 2026-07-07 GOAL-003 / TASK-004 exists as the current RepoFrame hydration route.

### Invalidated

- The project goal is not currently unclear.
- This task is not the recommended implementation start.
- GOAL-002 is not the active milestone goal.

### Still Open

- A/B 类一期范围对齐第二段 still needs a real data-closure task.
- TASK-004 must finish documentation calibration before the next business development task starts.

## Downstream Impact

If execution changes later work, mirror that impact here and in the active goal instead of leaving it only in `Execution Log`.

### Affected Tasks

- none

### Suggested Follow-up

- If this task affects later work, update `goals/GOAL-002-scope-clarified-for.md` `Observation Ledger` and `STATUS.md` before changing downstream tasks.

## Execution Log

Record milestone-level progress here. Each entry should summarize one meaningful execution batch, task-status transition, blocker change, replan, or user-directed change of course.

Do not log every file save, every tiny edit, or every formatting-only change.

- `2026-04-22`: task planned during repository initialization.
- `2026-07-06`: superseded after confirmed scope baseline and 9D.99 first increment; retained for traceability only.
- `2026-07-07`: confirmed superseded after GOAL-003 / TASK-004 became the active RepoFrame hydration route.
