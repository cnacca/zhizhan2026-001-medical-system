# Scope clarified for AI 智能下单与生产协同平台

<!-- repo-init:managed -->

## Metadata

- ID: `GOAL-001`
- Status: `superseded-for-current-execution`
- Type: `milestone`
- Mode: `plan-ingest`
- Source: `TRD_AI智能下单与生产协同平台_一期_V1.1_深度研究优化版.docx, AI智能下单平台_PRD_V1.0.docx, 生产流程.docx, AI智能下单平台一期 团队执行与协作文档(1).docx`
- Created: `2026-06-29`
- Updated: `2026-06-29`

## Final Outcome

Historical outcome: the repository received its first durable collaboration layer and TRD V1.1-aligned execution plan.

This goal is no longer the current execution entry. Current handoff work continues through `goals/GOAL-003-repoframe-doc-hydration-20260707.md`.

## Human Acceptance

- A human can open `AGENTS.md`, `STATUS.md`, `PROJECT.md`, `DECISIONS.md`, `tasks/README.md`, and `README.md` and understand the current project scope.
- The plan explicitly preserves PRD V1.0 as product scope and TRD V1.1 as technical execution source.
- Historical note: the original next task was task 1 project skeleton initialization. That route has already been overtaken by later implementation and Task 8 phase-one closure.
- Known blockers and open questions are listed before implementation starts.

## Machine Acceptance

- See `acceptance.json` historical goal `GOAL-001` and active goal `GOAL-003`.

## Constraints

- Do not revive the task-1 initialization route as the current execution entry.
- Do not commit secrets, real credentials, tokens, customer private data, or production data.
- Do not weaken doctor-side data isolation, file access checks, AI-3 boundaries, or audit requirements.

## Current Strategy

- Use `tasks/README.md` as the project task ledger.
- Keep RepoFrame task files as supporting artifacts.
- Current execution uses GOAL-003 / TASK-004 for RepoFrame document hydration.

## Planned Tasks

- `tasks/README.md` is the primary task plan.
- `tasks/TASK-001-clarify-source-bundle-and-recover-missing-scope.md` records the initial repo-init clarification artifact and has been superseded by the V1.1-aligned task overview.
- `tasks/TASK-002-project-skeleton-initialization.md` remains historical task evidence.
- `tasks/TASK-004-repoframe-doc-hydration-20260707.md` is the current RepoFrame hydration task.

## Recommended Start

- `tasks/TASK-004-repoframe-doc-hydration-20260707.md`

## Observation Ledger

- Date=2026-06-29; Source=repo-init; Observation=Initial automatic extraction treated the title as "变更摘要" and generated a clarification-first plan; Impact=supersede; Follow-up=Use Yuri-style `PROJECT.md`, `DECISIONS.md`, and `tasks/README.md` as authoritative project plan.
- Date=2026-06-29; Source=TRD V1.1; Observation=TRD V1.1 provides concrete defaults for modular monolith, lightweight DAG, Uppy+MinIO upload, ai-gateway, notification events, and acceptance matrix; Impact=reorder; Follow-up=Start from task 1 skeleton initialization, then task 2 database/workflow modeling.
- Date=2026-06-29; Source=task planning; Observation=Task 1 now has a detailed `TASK-002` file and machine acceptance checks; Impact=ready; Follow-up=Confirm route A/B/C before installing dependencies or initializing the skeleton.
- Date=2026-07-07; Source=TASK-004; Observation=GOAL-001 is preserved as historical initialization evidence and superseded for current execution by GOAL-003; Impact=supersede; Follow-up=Use GOAL-003 / TASK-004 for current RepoFrame hydration.

## Replan History

- 2026-06-29: Superseded the generic clarification task with TRD V1.1-aligned Yuri task plan.
- 2026-07-07: Superseded GOAL-001 for current execution. It remains historical evidence only.

## Assumptions

- TRD V1.1 is the current technical execution source.
- PRD V1.0 remains the product scope boundary.
- `.local-context` source copies are available locally, but stable derived artifacts should be placed under `docs/`.
