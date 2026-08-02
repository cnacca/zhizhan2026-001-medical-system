# Project skeleton initialization

<!-- repo-init:managed -->

## Metadata

- ID: `TASK-002`
- Status: `completed-with-http-smoke`
- Owner: `shared`
- Goal: `GOAL-001-scope-clarified-for.md`
- Created: `2026-06-29`
- Updated: `2026-06-29`

## Goal

Initialize the project skeleton for the AI intelligent dental order and production collaboration platform.

This task must create only the runnable technical baseline: backend skeleton, frontend skeleton, local service composition, environment templates, and real startup/check commands.

## Scope

- Backend baseline: Spring Boot / RuoYi-Vue-Pro modular monolith.
- Frontend baseline: Vue3 + Element Plus.
- Local infrastructure: MySQL, Redis, MinIO through Docker Compose or equivalent local services.
- Environment template: `.env.example` with placeholders only.
- Documentation: README startup, check, environment, and acceptance commands.
- Module boundary placeholders for:
  - `system-auth`
  - `clinic-user`
  - `order-form`
  - `order-status`
  - `workflow-definition`
  - `workflow-runtime`
  - `check-rework`
  - `worklog-performance`
  - `file-center`
  - `message-design`
  - `bill-logistics`
  - `ai-gateway`
  - `notification-ws`

## Non-goals

- Do not implement order, workflow, file, AI, performance, billing, or notification business behavior.
- Do not connect a real DeepSeek API Key.
- Do not commit real database, MinIO, Redis, or AI credentials.
- Do not weaken RuoYi authentication, authorization, data scope, doctor-side desensitization, file access policy, or AI-3 safety boundaries.

## Route Gate

Selected route:

- Route A: local JDK + Maven.

Historical route options:

- Route A: install/use local JDK + Maven, then run backend locally. Recommended.
- Route B: run backend Maven build and service through Docker/Colima or another Docker context.
- Route C: create only file and directory skeleton, accepting that task 1 is only partially complete.

Recommended baseline:

- RuoYi-Vue-Pro `master-jdk17` series.
- JDK 21 preferred; JDK 17 acceptable if compatibility requires it.
- Maven `>= 3.5.4`.
- pnpm for frontend package management.

Supporting docs:

- `docs/development/task-1-preflight.md`
- `docs/development/task-1-execution-checklist.md`

## Acceptance Criteria

- Backend and frontend skeletons exist in stable, documented locations.
- Local service configuration exists for MySQL, Redis, and MinIO.
- `.env.example` exists and contains only placeholder values.
- README contains real startup, build/check, environment, and acceptance commands for the chosen route.
- At least one ADMIN test login path is documented and runnable if route A or B is selected.
- No business module implementation is introduced beyond framework/bootstrap code.
- No secrets, tokens, customer private data, or real credentials are committed.

## Verification Commands

Baseline commands before task execution:

```bash
java -version
mvn -version
node -v
npm -v
pnpm -v
docker context ls
docker info
```

Repo/document checks that must remain green:

```bash
npm run acceptance
ruby -ryaml -e "data=YAML.load_file('docs/api/openapi.yaml'); puts 'parsed ok'; puts \"paths=#{data['paths'].length}\"; puts \"form-configs=#{data['paths']['/form-configs'].keys.sort.join(',')}\""
npx --yes @apidevtools/swagger-cli validate docs/api/openapi.yaml
```

Actual task 1 commands:

```bash
npm run check:toolchain
npm run test:backend
npm run install:frontend
npm run build:frontend
npm run compose:config
npm run compose:up
npm run dev:backend
npm run dev:frontend
```

## Real User Path

Route A smoke evidence:

- Start local infrastructure.
- Start backend.
- Start frontend.
- Confirm frontend HTML loads at `http://localhost:5173/`.
- Log in as an ADMIN test account through backend API and Vite `/api` proxy.
- Confirm the app shell builds without writing business behavior.

Browser click automation was not run because no browser automation package/tool was available in the current environment.

## Execution Plan

1. Confirm route A/B/C and backend baseline.
2. Prepare local runtime or container runtime.
3. Create backend skeleton.
4. Create frontend skeleton.
5. Add local service composition and environment templates.
6. Add startup/check commands to README.
7. Run build/check/smoke verification appropriate to the route.
8. Update `STATUS.md`, `DECISIONS.md`, `tasks/README.md`, and `README.md`.

## Completion Record

Completed on `2026-06-29` with route A.

Implemented:

- Homebrew `openjdk@21` and `maven` installed.
- Backend Maven multi-module skeleton under `backend/`.
- Frontend Vue3 + Element Plus skeleton under `frontend/`.
- Local MySQL/Redis/MinIO services in `compose.yaml`.
- Environment template in `.env.example`.
- Root scripts in `package.json`.

Verification:

- `npm run check:toolchain`: passed.
- `npm run test:backend`: passed, 16 Maven modules successful.
- `npm run install:frontend`: passed after approving `esbuild` build script for Vite.
- `npm run build:frontend`: passed.
- `npm run compose:config`: passed.
- `npm run compose:up`: passed.
- `docker compose ps`: MySQL, Redis, MinIO healthy.
- Backend health API: passed.
- Backend ADMIN login API: passed.
- Frontend Vite `/api` proxy to health/login: passed.

## Remaining Work

- Browser click-through smoke is not automated.
- Formal RuoYi-Vue-Pro auth integration remains future work.
- Backend is not yet wired to MySQL, Redis, or MinIO.
- Database migrations and 9 workflow-chain seeds move to task 2.

## Known Risks

- RuoYi-Vue-Pro branch selection affects JDK, Spring Boot, dependency, and migration compatibility.
- Current ADMIN login is a bootstrap smoke path only, not production auth.
- Docker Compose passwords are local placeholders only.
