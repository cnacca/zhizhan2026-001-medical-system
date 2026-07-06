# AI 智能下单平台 - Codex 项目规则

## 项目目标

本项目是一套牙科定制工厂的一期系统：在线下单、客服审核、生产工序流转、入检/出检、工时绩效、账单物流、AI 辅助查询与文本整理。

当前阶段是项目初始化与 M1/M2 准备，不要直接进入业务功能开发，除非用户明确要求。

## 必读顺序

新会话接手先读：

1. `STATUS.md`
2. `PROJECT.md`
3. `DECISIONS.md`
4. `tasks/README.md`
5. `.repo-init/README.md`
6. `README.md`
7. `AGENT.md` 和 `.agent/`，仅在需要 RepoFrame 细则时读取

## 技术方向

- 前端：Vue3 + Element Plus + Uppy
- 后端：Spring Boot + RuoYi-Vue-Pro，模块化单体优先
- 数据：MySQL + Redis
- 文件：MinIO 私有桶 + 短时效签名 URL
- AI：后端 `ai-gateway` 默认承载模型适配；AI 服务不得直连业务数据库
- 部署：Nginx + Docker / Docker Compose，测试环境和正式环境隔离

## 当前最高优先级

1. 任务 1：项目骨架初始化。
2. 设计 TRD V1.1 核心数据库表。
3. 落 9 条工序链初始化脚本。
4. 实现订单 `internal_status` / `external_status` 与 `OrderStatusProjector`。
5. 设计医生端脱敏 VO、`order_external_projection` 和 AI-3 安全读模型。
6. 实现 Uppy + MinIO 预签名 / Multipart 文件上传与访问控制。

## 安全红线

- 不提交 `.env`、数据库密码、MinIO 密钥、DeepSeek API Key 或任何真实凭据。
- 不绕过登录、权限、数据范围、文件访问校验。
- 医生端接口、医生端 WebSocket、医生端文件访问和医生端 AI 绝不能返回内部工序、员工、入检/出检、工时、返工、绩效、责任分类等字段。
- 不删除历史订单、工时、返工、设计稿版本或审计数据。
- 不直接改生产数据；任何破坏性操作先让用户确认。

## 协作规则

- `main` 是稳定分支，禁止直接 push。
- `dev` 是开发集成分支。
- 功能分支使用 `feature/xxx`，修复分支使用 `fix/xxx`。
- 提交前运行当前技术栈可用的 lint/typecheck/build/test。
- 所有关键模块必须有验收路径：权限、脱敏、工艺流、AI、文件、状态机。

## Token 成本治理

- 一个 Codex 执行会话只推进一个明确闭环；完成后输出接力摘要，优先开新会话继续下一步。
- 单会话请求累计超过 2000 万 token，或单次上下文超过 15 万 token，停止继续开发，先总结当前状态。
- 默认先用 `rg -n` 定位、`sed -n` 读取小片段、`git diff --stat` / `git diff --name-only` 看范围；不要默认整文件读取大文档或输出全量 diff。
- 每次长跑或继续下一步前，可运行 `npm run codex:token-report` 检查最近 token 消耗和高风险命令。
- 详细规则见 `docs/development/codex-token-cost-control.md`。

## SOP / Superpowers 分级启用

- 默认轻量模式：状态查询、下一步确认、简短方案、普通文档确认和 token 排查，只读必要片段，不展开完整 SOP，不生成 superpowers spec / plan。
- 标准模式：用户明确要求实现、修复、落地、改代码、改验收脚本或回写项目文档时启用；可使用 TDD / verification，但只读目标相关 skill 和文件片段。
- 重型模式：完整审查、上线前检查、PR 前检查、全量验收、长跑执行、复杂故障、安全 / 权限 / 生产 / 数据风险任务时启用；必须新会话开始，先运行 token report，并设置停止条件。
- superpowers 只在任务确实匹配时启用对应 skill，不为轻量问题连带读取无关 skill。
- Yuri SOP 保留为项目质量边界；轻量任务只遵守原则，标准任务执行必要 TDD / 验证 / 文档回写，重型任务才完整展开。

## 项目文档维护

每轮开发结束时更新：

- `STATUS.md`：当前进度、阻塞、下一步。
- `DECISIONS.md`：新增技术或产品决策。
- `tasks/README.md`：任务状态、验收结果、剩余风险。
- `README.md`：运行、验证、部署入口发生变化时更新。
