# GOAL-008 PRD V2 Local Gap Closure B

Status: `completed`

Mode: `stage-goal`

## Summary

Close PRD V2 local feature gap closure B by implementing the first local segment of the independent quality record model and status workflow.

Task 8 remains `NOT_READY`. This goal only closes the local quality-record model/status workflow first segment. It does not close customer final quality口径, real payment/logistics platforms, real DeepSeek key, real webhook, customer signature, or real environment acceptance.

## Scope

- Establish this stage-level goal as the current RepoFrame execution entry.
- Create one execution-batch task with checklist items for PRD V2 local gap closure B.
- Add an independent `quality_record` fact table first segment while keeping existing `check_record` / `rework_record` evidence intact.
- Add status workflow endpoints for quality records.
- Update the production quality page to show status and allow internal status updates.
- Update OpenAPI, machine checks, acceptance matrix, readiness checklist, and project entry docs.
- Keep `prd-v2-local-feature-gaps`, `frontend-business-pages`, and `ai-production-governance` as `PARTIAL`.
- Keep `customer-pm-confirmations` as `BLOCKED`.

## Non-goals

- Do not replace historical `check_record` / `rework_record` facts.
- Do not implement full投诉 / 退货系统, quality review board, edit/delete, or final customer quality口径.
- Do not connect real payment/logistics platforms, real DeepSeek key, real webhook, electronic signature, or real deployment infrastructure.
- Do not declare customer / PM signature, customer template confirmation, or real environment acceptance.
- Do not change Task 8 to READY.
- Do not touch `/Users/yuri/Documents/AI智能下单平台`.
- Do not `git add`, commit, or push.

## Acceptance

- `tasks/TASK-009-prd-v2-local-gap-closure-b-20260707.md` exists and contains one batch task with checklist items.
- Each checklist item includes Scope, Non-goals, Acceptance, and Verification.
- Quality records are backed by an independent `quality_record` table first segment.
- CS / ADMIN can create external-return quality records, list them, and update status through a bounded workflow.
- DOCTOR cannot read, create, or update internal quality records.
- OpenAPI and frontend quality page reflect status workflow first segment.
- `acceptance.json` points to GOAL-008 as the current active goal.
- Task 8 remains `NOT_READY`.
- Machine checks pass.

## Verification

```bash
npm run check:prd-v2-gap-closure-b
npm run check:task9d87
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=QualityRecordTests test
npm run check:openapi
npm run build:frontend
npm run check:task8-readiness-gaps
npm run check:phase-one-closure-plan
npm run check:phase-one-workflow
npm run check:stage-goal-window
npm run check:repoframe-docs
python3 /Users/yuri/.codex/skills/repo-init/scripts/lint_acceptance.py --repo .
npm run acceptance
git diff --check
```

## Observation Ledger

- 2026-07-07: User requested one stage-level goal named PRD V2 本地功能差异收口 B.
- 2026-07-07: GOAL-007 / TASK-008 completed closure A and identified quality record independent model / status workflow first segment as the highest-priority local implementation-ready gap.
- 2026-07-07: Source-of-truth files require Task 8 to remain NOT_READY and external blockers to stay explicit.

## Replan Notes

If quality-record customer口径 changes, update the PRD V2 matrix and customer / PM confirmation table before expanding the model. If this stage cannot pass local tests without customer or real-environment input, stop and keep the remaining items BLOCKED / PARTIAL.
