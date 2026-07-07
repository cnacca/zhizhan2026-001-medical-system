# GOAL-010 PRD V2 Local Gap Closure D

Status: `completed`

Mode: `stage-goal`

## Summary

Close the remaining local PRD V2 feature gap that does not depend on real external services: monthly trend and customer ranking aggregation for the phase-one A/B dashboards.

Task 8 remains `NOT_READY`. This goal only closes a local dashboard aggregation segment. It does not close real payment, real logistics, real DeepSeek key validation, customer final statistics口径, customer signature, or real environment acceptance.

## Scope

- Establish this stage-level goal as the current RepoFrame execution entry.
- Create one execution-batch task with checklist items for PRD V2 local gap closure D.
- Add a local internal dashboard endpoint for phase-one monthly trends and customer ranking.
- Keep the endpoint internal and scoped by existing identity / data-scope rules.
- Update the CS / production dashboard to consume the local aggregation instead of showing that the monthly trend endpoint is missing.
- Update OpenAPI, machine checks, acceptance matrix, readiness checklist, and project entry docs.
- Keep real external blockers explicit.
- Keep `customer-pm-confirmations` as `BLOCKED`.

## Non-goals

- Do not connect real payment, real logistics, real DeepSeek key, webhook, or production AI workflows.
- Do not claim customer-final statistics口径.
- Do not implement month-end financial closing, real aging, or customer signed BI reports.
- Do not expose internal dashboard aggregation to doctors.
- Do not change Task 8 to READY.
- Do not touch `/Users/yuri/Documents/AI智能下单平台`.
- Do not `git add`, commit, or push.

## Acceptance

- `tasks/TASK-011-prd-v2-local-gap-closure-d-20260707.md` exists and contains one batch task with checklist items.
- `GET /dashboards/phase-one-ab` returns current-month / previous-month order totals, item totals, Top customer ranking, production exception count, pending question count, shipping rate, and completion rate.
- CS / ADMIN / WORKER can read scoped dashboard aggregation; DOCTOR is forbidden.
- Frontend dashboards display monthly trend data from the local endpoint and no longer show the old missing-monthly-trend placeholder.
- OpenAPI and acceptance/readiness docs reflect this as local D progress only.
- `acceptance.json` points to GOAL-010 as the current active goal.
- Task 8 remains `NOT_READY`.
- Machine checks pass.

## Verification

```bash
npm run check:prd-v2-gap-closure-d
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=PhaseOneDashboardTests test
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

- 2026-07-07: User asked to find remaining PRD V2 local feature gap closure work and complete the goal.
- 2026-07-07: Current matrix shows the only remaining local implementation-ready item is monthly trend / customer ranking aggregation; real payment, logistics, AI key, customer口径, and signatures remain external blockers.

## Replan Notes

If monthly trends require customer-final statistics口径 or real financial / logistics systems, keep those parts `PARTIAL` / `BLOCKED` and stop before faking external acceptance.
