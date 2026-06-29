# Scope clarified for AI 智能下单与生产协同平台

<!-- repo-init:managed -->

## Metadata

- ID: `GOAL-001`
- Status: `active`
- Type: `milestone`
- Mode: `plan-ingest`
- Source: `TRD_AI智能下单与生产协同平台_一期_V1.1_深度研究优化版.docx, AI智能下单平台_PRD_V1.0.docx, 生产流程.docx, AI智能下单平台一期 团队执行与协作文档(1).docx`
- Created: `2026-06-29`
- Updated: `2026-06-29`

## Final Outcome

The repository has a durable collaboration layer and a TRD V1.1-aligned execution plan, with the next implementation step clearly defined as task 1: project skeleton initialization.

## Human Acceptance

- A human can open `AGENTS.md`, `STATUS.md`, `PROJECT.md`, `DECISIONS.md`, `tasks/README.md`, and `README.md` and understand the current project scope.
- The plan explicitly preserves PRD V1.0 as product scope and TRD V1.1 as technical execution source.
- The next task is task 1: initialize the project skeleton without writing business modules.
- Known blockers and open questions are listed before implementation starts.

## Machine Acceptance

- See `acceptance.json` goal `GOAL-001`.

## Constraints

- Do not write business code before task 1 is explicitly executed.
- Do not commit secrets, real credentials, tokens, customer private data, or production data.
- Do not weaken doctor-side data isolation, file access checks, AI-3 boundaries, or audit requirements.

## Current Strategy

- Use `tasks/README.md` as the Yuri-style task overview.
- Keep RepoFrame task files as supporting artifacts.
- Start implementation with task 1 only after confirming Java/Maven strategy or choosing a Docker-based backend build path.

## Planned Tasks

- `tasks/README.md` is the primary task plan.
- `tasks/TASK-001-clarify-source-bundle-and-recover-missing-scope.md` records the initial repo-init clarification artifact and has been superseded by the V1.1-aligned task overview.
- `tasks/TASK-002-project-skeleton-initialization.md` is the active detailed task file for task 1 and is ready once the route gate is confirmed.

## Recommended Start

- `tasks/README.md` -> `任务 1：项目骨架初始化`

## Observation Ledger

- Date=2026-06-29; Source=repo-init; Observation=Initial automatic extraction treated the title as "变更摘要" and generated a clarification-first plan; Impact=supersede; Follow-up=Use Yuri-style `PROJECT.md`, `DECISIONS.md`, and `tasks/README.md` as authoritative project plan.
- Date=2026-06-29; Source=TRD V1.1; Observation=TRD V1.1 provides concrete defaults for modular monolith, lightweight DAG, Uppy+MinIO upload, ai-gateway, notification events, and acceptance matrix; Impact=reorder; Follow-up=Start from task 1 skeleton initialization, then task 2 database/workflow modeling.
- Date=2026-06-29; Source=task planning; Observation=Task 1 now has a detailed `TASK-002` file and machine acceptance checks; Impact=ready; Follow-up=Confirm route A/B/C before installing dependencies or initializing the skeleton.

## Replan History

- 2026-06-29: Superseded the generic clarification task with TRD V1.1-aligned Yuri task plan.

## Assumptions

- TRD V1.1 is the current technical execution source.
- PRD V1.0 remains the product scope boundary.
- `.local-context` source copies are available locally, but stable derived artifacts should be placed under `docs/`.
