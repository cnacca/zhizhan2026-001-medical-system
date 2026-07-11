# 本地开发常驻运行 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 增加一组无需分别打开前后端终端的本地开发运行命令。

**Architecture:** 根 `package.json` 暴露稳定的 `local:*` 命令；`scripts/local-runtime.sh` 管理基础服务、后台应用进程、PID 和日志；独立 Node 静态检查锁定安全边界与文档约定。运行态文件统一放在被 Git 忽略的 `.local-runtime/`。

**Tech Stack:** Bash、Node.js ESM、npm scripts、Docker Compose、Spring Boot、Vite。

## Global Constraints

- 复用 `compose:up`、`dev:backend`、`dev:frontend`，不得修改现有应用端口、业务代码或正式 Compose。
- `local:stop` 只停止 `.local-runtime/` 记录的前后端进程，不执行 `docker compose down`、不删除卷或数据。
- 启动前不得终止未由该脚本管理的端口占用进程。
- 日志与 PID 必须位于 `.local-runtime/`，且该目录必须被 Git 忽略。

---

### Task 1: 为本地运行命令建立红灯静态检查

**Files:**

- Create: `scripts/check-local-runtime.mjs`
- Modify: `package.json`
- Modify: `.gitignore`
- Modify: `README.md:99-190`

**Interfaces:**

- Consumes: 根目录 `package.json`、`.gitignore`、`README.md` 和未来的 `scripts/local-runtime.sh`。
- Produces: `npm run check:local-runtime`，失败时逐项列出缺失入口或安全边界。

- [x] **Step 1: 写入失败的静态检查**

```js
const expectedScripts = {
  'check:local-runtime': 'node scripts/check-local-runtime.mjs',
  'local:start': 'bash scripts/local-runtime.sh start',
  'local:status': 'bash scripts/local-runtime.sh status',
  'local:stop': 'bash scripts/local-runtime.sh stop',
}

const requiredShellFragments = [
  'npm run compose:up',
  'npm run dev:backend',
  'npm run dev:frontend',
  '.local-runtime',
  'lsof -nP -iTCP:',
  'stop_process_tree',
]
```

- [x] **Step 2: 运行检查确认红灯**

Run: `node scripts/check-local-runtime.mjs`

Expected: FAIL，列出缺少 `local:*` 命令、运行脚本和 README 使用说明。

- [x] **Step 3: 实现最小运行控制脚本与入口**

```bash
case "$1" in
  start) ensure_docker; npm run compose:up; start_service backend 8080 'npm run dev:backend'; start_service frontend 5173 'npm run dev:frontend' ;;
  status) show_status ;;
  stop) stop_service frontend; stop_service backend ;;
esac
```

新增 `.local-runtime/` 忽略规则、四个 npm scripts、带 UUID 运行标识的受管 runner、完整进程树停止校验，以及 README 的一键启动/状态/停止说明。

- [x] **Step 4: 运行检查确认绿灯**

Run: `npm run check:local-runtime`

Expected: `local runtime check ok`，退出码为 0。

- [x] **Step 5: 提交**

Run: `git add .gitignore README.md package.json scripts/check-local-runtime.mjs scripts/local-runtime.sh docs/superpowers/plans/2026-07-11-local-development-runtime.md && git commit -m "feat: add local development runtime commands"`

### Task 2: 执行真实本地运行链路验证

**Files:**

- No source changes expected.

**Interfaces:**

- Consumes: `npm run local:start`、`npm run local:status`、`npm run local:stop`。
- Produces: 前端 `http://localhost:5173`、后端 `http://localhost:8080/api/bootstrap/health` 的实际运行证据。

- [x] **Step 1: 启动完整开发环境**

Run: `npm run local:start`

Expected: Docker 基础服务启动，后端和前端 PID 写入 `.local-runtime/`，输出两个日志路径和浏览器地址。

- [x] **Step 2: 等待并检查运行状态**

Run: `npm run local:status && curl -fsS http://localhost:8080/api/bootstrap/health && curl -fsSI http://localhost:5173`

Expected: 状态显示 MySQL/Redis/MinIO、后端和前端均运行；后端健康接口和前端 HTTP 头均成功。

- [x] **Step 3: 验证停止边界**

Run: `npm run local:stop && docker compose ps --status running`

Expected: 受管前端与后端退出；MySQL、Redis、MinIO 仍显示运行。

- [x] **Step 4: 提交验证后的实现**

Run: `git status --short && git add .gitignore README.md package.json scripts/check-local-runtime.mjs scripts/local-runtime.sh docs/superpowers/plans/2026-07-11-local-development-runtime.md && git commit -m "feat: add local development runtime commands"`
