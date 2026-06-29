# AGENT.md

<!-- repo-init:managed -->

This file is the thin operating index for agents working in this repository.

## Source Of Truth

- `README.md`: human-facing repository summary
- `AGENT.md`: agent entry point and rule index
- `.agent/*.md`: detailed collaboration rules
- `PROJECT.md`: project definition or compatibility snapshot
- `goals/*.md`: active goals, observations, planned tasks, and replan history
- `STATUS.md`: current focus, latest feedback, task impact, replan suggestions, blockers, and next step
- `DECISIONS.md`: durable accepted decisions only
- `tasks/*.md`: provisional execution plans and task-local records

## Reading Order

1. `PROJECT.md`
2. `STATUS.md`
3. `DECISIONS.md`
4. the active milestone goal in `goals/`
5. `acceptance.json`
6. the active task in `tasks/` when one is active

## Read Detailed Rules When Needed

- Read `.agent/operating-rules.md` before substantial implementation work.
- Read `.agent/replanning.md` before rewriting, splitting, superseding, or reordering tasks.
- Read `.agent/file-contract.md` before changing collaboration files or generated file structure.
- Read `.agent/collaboration-rule-changes.md` before changing the collaboration contract itself.

## Core Invariants

- Preserve user-authored source plans by default.
- Treat low-confidence intake as a clarification problem, not an implementation license.
- Initialization creates the collaboration layer, milestone goals, planned tasks, `acceptance.json`, and report; it does not authorize implementation in the same turn.
- Use tasks as provisional plans toward the active milestone goal; rewrite them when observations show a better route.
- Do not change the goal, hard constraints, durable project scope, accepted success criteria, or collaboration contract without explicit human confirmation.
- Record durable accepted decisions in `DECISIONS.md`; keep temporary feedback and unaccepted rule-change proposals out of it.
- Do not infer product scope beyond what the source bundle actually supports.
