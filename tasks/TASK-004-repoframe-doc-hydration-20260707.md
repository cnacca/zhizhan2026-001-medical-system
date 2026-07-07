# RepoFrame doc hydration 2026-07-07

<!-- repo-init:managed -->

## Metadata

- ID: `TASK-004`
- Status: `completed`
- Owner: `shared`
- Goal: `GOAL-003-repoframe-doc-hydration-20260707.md`
- Created: `2026-07-07`
- Updated: `2026-07-07`

## Why

The handoff worktree already has a RepoFrame collaboration layer, but several active pointers still describe older initialization work. `acceptance.json` also contains many stale checks that no longer match the current Task 8 / 9D.99 / 2026-07-06 baseline.

This task makes the documentation layer safe for a new window or another agent to continue development without restarting the project or following deprecated workflow/SOP text.

## Scope

- Set GOAL-003 as the active RepoFrame hydration goal.
- Keep GOAL-001 as historical initialization evidence.
- Keep GOAL-002 / TASK-003 as superseded 2026-07-06 intake evidence.
- Update RepoFrame entry documents and project handoff documents so they agree on current state.
- Replace stale `acceptance.json` checks with current RepoFrame hydration checks.
- Add a non-business check script and package entry for RepoFrame document consistency.
- Run the agreed verification commands and record results.

## Non-goals

- Do not run `initialize_repo.py`.
- Do not modify backend business code.
- Do not modify frontend business code.
- Do not mark Task 8 READY.
- Do not fake real DeepSeek key, real webhook, real customer template, customer signature, or real environment acceptance.
- Do not change the main worktree at `/Users/yuri/Documents/AI智能下单平台`.
- Do not `git add`, commit, or push.

## Acceptance Criteria

- `STATUS.md` points to GOAL-003 and TASK-004 for this hydration task.
- `AGENTS.md` no longer instructs agents to use deprecated Yuri workflow/SOP defaults or restart from task 1.
- GOAL-001 is marked historical/superseded for current execution.
- GOAL-002 / TASK-003 remain superseded.
- `acceptance.json` active goal is GOAL-003 and passes RepoFrame `lint_acceptance.py --repo .`.
- `npm run check:repoframe-docs` passes.
- Task 8 remains `NOT_READY`.
- External blockers remain explicit and unclosed.

## Verification Commands

```bash
python3 /Users/yuri/.codex/skills/repo-init/scripts/doctor.py
python3 /Users/yuri/.codex/skills/repo-init/scripts/lint_acceptance.py --repo .
npm run check:repoframe-docs
npm run check:scope-baseline-20260706
npm run check:task9d99
npm run check:task8-readiness-gaps
npm run acceptance
git diff --check
```

If package or API contract references are changed:

```bash
npm run check:openapi
```

## Assumption Checks

### Validated

- The target worktree is `/Users/yuri/Documents/AI智能下单平台-handoff-20260706`.
- `repo-init` doctor passes with Python 3.11.15.
- `npm run check:scope-baseline-20260706`, `npm run check:task9d99`, and `npm run acceptance` passed before edits.

### Invalidated

- GOAL-001 is no longer the active current execution goal.
- The task-1 skeleton initialization route is no longer the current recommended start.
- GOAL-002 / TASK-003 clarification-first output is no longer active.

### Still Open

- A/B class phase-one closure second increment still needs a separate business development task after this documentation calibration.
- Customer / PM confirmations and real environment acceptance remain external blockers.

## Downstream Impact

### Affected Tasks

- GOAL-001: supersede for active execution, preserve as historical evidence.
- GOAL-002: keep superseded.
- TASK-003: keep superseded.
- Task 8: keep `in-progress / NOT_READY`; no readiness upgrade.
- Future A/B class second increment: keep as next development route after this task.

### Suggested Follow-up

- After this task passes verification, start a separate RepoFrame task for A/B class phase-one closure second increment.

## Completion Record

- Completed: `2026-07-07`.
- RepoFrame linter passed with GOAL-001 superseded, GOAL-002 superseded, and GOAL-003 completed.
- Added `npm run check:repoframe-docs` and verified it passes.
- Kept Task 8 as `NOT_READY`.
- Kept real DeepSeek key, real webhook, customer production-note template, customer signature, and real environment acceptance as external blockers.
- Did not modify backend or frontend business code for this task.
- Did not run `initialize_repo.py`.
- Did not `git add`, commit, or push.

## Remaining Work

- None for this documentation calibration task.
- Next development work should be a separate RepoFrame task for A/B class phase-one closure second increment.

## Known Risks

- Existing worktree has many unrelated modified files. This task must not revert or normalize those changes.
- `acceptance.json` was previously overloaded with stale historical checks; replacing them must keep real current acceptance stronger, not weaker.

## Execution Log

- `2026-07-07`: task started from user-approved RepoFrame hydration plan.
- `2026-07-07`: task completed after verification passed.
