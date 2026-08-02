# 本地开发常驻运行设计

## 目标

为 macOS 本地开发提供一组一键控制命令，在后台同时保持基础服务、Spring Boot 后端和 Vite 前端运行，浏览器通过 `http://localhost:5173` 使用系统。

## 范围

- 新增 `npm run local:start`、`npm run local:status`、`npm run local:stop`。
- 复用现有 `npm run compose:up`、`npm run dev:backend` 和 `npm run dev:frontend`，不改变应用配置、端口或业务代码。
- 将由该工具启动的前端与后端 PID 和日志存入未纳入版本控制的 `.local-runtime/`。
- 启动前检测端口或已有 PID，避免重复启动；停止时仅终止由本工具记录的前后端进程，保留 MySQL、Redis、MinIO 和其数据卷。
- README 仅补充最短使用方式与日志位置。

## 非目标

- 不设置 macOS 登录自启或 LaunchAgent。
- 不启动或修改 `deploy/docker-compose.phase-one.yml`，不处理正式环境变量或密钥。
- 不停止 Docker 基础服务，不删除容器、卷或本地数据。
- 不替代现有单独的 `dev:backend`、`dev:frontend` 启动方式。

## 方案选择

1. 后台脚本（采用）：无需新增依赖，保持 Vite 热更新，适合日常本地开发。
2. tmux 会话：日志可见性更强，但要求用户维护交互终端会话。
3. 全栈 Docker：更贴近部署，但需要本地环境变量，且不利于即时开发热更新。

## 结构与流程

`scripts/local-runtime.sh` 接受 `start`、`status`、`stop` 子命令。启动时先执行 `npm run compose:up`；然后通过 `scripts/local-runtime-runner.sh` 分别以唯一运行标识启动后端和前端，写入 PID、进程启动时间、运行标识和日志。状态同时校验这些身份信息，并请求后端健康接口与前端首页。停止时仅对匹配身份记录的完整进程树发送信号，确认全部退出后才清理记录；过期或不匹配的 PID 文件不会触碰对应进程。

根 `package.json` 为三个命令提供稳定入口。`scripts/check-local-runtime.mjs` 作为自动检查，验证命令声明、脚本的安全边界、端口、日志/PID 路径和 README 使用说明，防止后续改动破坏约定。

## 异常处理与验收

- 缺少 Docker/Colima 或基础服务启动失败时，`local:start` 立即失败并保留原始错误输出，不尝试继续启动应用。
- 前端或后端已存在且由本工具管理时，启动命令输出其 PID 和访问地址后成功退出；发现占用端口但没有受管 PID 时，输出端口占用提示并失败，避免误杀其他进程。
- 后端未完成启动时，`local:start` 只负责放入后台；`local:status` 用健康接口报告未就绪状态和日志位置。
- 验收：静态检查通过；`local:start` 可启动完整开发环境；`local:status` 显示前后端与基础服务；`local:stop` 后前后端进程退出，基础容器仍运行。
