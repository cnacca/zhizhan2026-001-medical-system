# AI 智能下单与生产协同平台

牙科定制工厂一期系统：医生在线下单，客服审核协同，工厂按预定义工艺流生产，逐道工序入检/出检/记工时，客户只能查看外部简化进度。

## 当前仓库状态

当前已完成项目工作流初始化、任务 0：接口契约与项目基线、任务 0.1：TRD V1.1 对齐与开发计划冻结、任务 1：项目骨架初始化、任务 2：数据库模型与 9 条工序链初始化。

接手请先读：

```text
AGENTS.md
STATUS.md
PROJECT.md
DECISIONS.md
tasks/README.md
.repo-init/README.md
```

RepoFrame 生成的 `AGENT.md` 和 `.agent/` 保留为协作细则入口；Codex 默认以 `AGENTS.md` 为项目规则入口。

当前任务入口：

```text
tasks/README.md -> 任务 3：订单状态投影与医生端脱敏基础
```

## 技术方向

```text
Frontend: Vue3 + Element Plus + Uppy
Backend: Spring Boot + RuoYi-Vue-Pro
Database: MySQL + Redis
File: MinIO private bucket + signed URL
AI: backend ai-gateway + DeepSeek
Deploy: Nginx + Docker / Docker Compose
```

## 本地启动

首次准备：

```bash
brew install openjdk@21 maven
npm run install:frontend
```

工具链检查：

```bash
npm run check:toolchain
```

启动基础服务：

```bash
colima start
npm run compose:up
docker compose ps
```

启动后端：

```bash
npm run compose:up
npm run dev:backend
```

启动前端：

```bash
npm run dev:frontend
```

默认访问：

```text
Frontend: http://localhost:5173
Backend health: http://localhost:8080/api/bootstrap/health
Workflow chains: http://localhost:8080/workflow-chains
MinIO console: http://localhost:9001
```

## 环境变量

环境变量模板位于 `.env.example`。该文件只包含本地占位值；任何真实数据库密码、MinIO 密钥、DeepSeek API Key 都不得提交进仓库。

后端当前会在启动时通过 Flyway 连接 MySQL，常用本地变量：

```text
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=ai_order_platform
MYSQL_USER=ai_order
MYSQL_PASSWORD=change-me
```

## OpenAPI 契约

稳定接口契约位于：

```text
docs/api/openapi.yaml
```

该文件从 `.local-context/API规范_OpenAPI3.0.yaml` 修复并冻结而来。后续前后端联调、接口评审、SDK 生成应优先使用 `docs/api/openapi.yaml`。

验证命令：

```bash
ruby -ryaml -e "data=YAML.load_file('docs/api/openapi.yaml'); puts 'parsed ok'; puts \"paths=#{data['paths'].length}\"; puts \"form-configs=#{data['paths']['/form-configs'].keys.sort.join(',')}\""
npx --yes @apidevtools/swagger-cli validate docs/api/openapi.yaml
npx --yes @redocly/cli lint docs/api/openapi.yaml --max-problems 5
```

说明：Redocly 当前会提示缺少 `operationId`、4xx 响应和 license 字段等 lint warning，但已确认 API description valid。

## 检查命令

```bash
npm run acceptance
npm run compose:up
npm run check:openapi
npm run test:backend
npm run build:frontend
npm run compose:config
```

说明：`npm run test:backend` 会加载 Spring Boot 上下文并执行 Flyway 校验，运行前需要本地 MySQL 可用。

HTTP smoke：

```bash
curl -sS http://localhost:8080/api/bootstrap/health
curl -sS -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{"username":"admin","password":"change-me-admin"}'
curl -sS http://localhost:8080/workflow-chains
curl -sS http://localhost:8080/workflow-chains/1/nodes
curl -sS http://localhost:5173/api/bootstrap/health
```

## 下一步开发入口

优先处理 `tasks/README.md`：

1. 进入「任务 3：订单状态投影与医生端脱敏基础」。
2. 锁定 `internal_status` / `external_status` 枚举和状态变更服务边界。
3. 建立医生端外部投影、脱敏 VO、AI-3 安全读模型。
4. 后续再进入文件鉴权、Workflow Runtime、AI Gateway 等任务。

## 安全说明

不要提交任何真实密钥、Token、数据库连接串、MinIO 凭据、DeepSeek API Key 或客户隐私数据。
