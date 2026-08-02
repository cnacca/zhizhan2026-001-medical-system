# AI 智能下单平台 - Codex 项目规则

## 项目目标

本项目是一套牙科定制工厂的一期系统：在线下单、客服审核、生产工序流转、入检/出检、工时绩效、账单物流、AI 辅助查询与文本整理。

当前工作区是已有项目工作树，不是新项目初始化。不要自动启用已卸载的 Yuri SOP / workflow；只有用户明确要求阶段级 goal、RepoFrame task 或项目文档回写时，才按 RepoFrame / workflow 执行。

## 读取规则

轻量问答、状态解释、局部文件查看和一次性命令结果，只读取回答所需的最少文件。

只有在用户明确要求继续项目开发、阶段级 goal、RepoFrame task、验收矩阵收口或项目文档回写时，才按以下顺序读取：

1. `STATUS.md`
2. `tasks/README.md`
3. `acceptance.json`
4. `goals/GOAL-003-repoframe-doc-hydration-20260707.md`
5. `tasks/TASK-004-repoframe-doc-hydration-20260707.md`
6. `PROJECT.md`
7. `DECISIONS.md`
8. `README.md`
9. `.repo-init/init-report.md`
10. `AGENT.md` 和 `.agent/`，仅在需要 RepoFrame 细则时读取

## 需求与验收口径

- 复核 PRD 时先核对正文版本、日期和已记录的来源指纹，不能只按文件名判断版本。
- 必须区分产品确认、客户资料、业务数据、真实环境执行证据和最终交付证据；不得把它们统一计为客户 / PM 逐功能签字，也不得用等待外部输入掩盖可继续实现的本地缺口。
- 原 PRD 验收表、后续确认稿新增范围、跨项流程门禁和上线 readiness 必须分别跟踪；不得只凭其中一张验收表宣称整个一期完成。

## 技术方向

- 前端：Vue3 + Element Plus + Uppy
- 后端：Spring Boot + RuoYi-Vue-Pro，模块化单体优先
- 数据：MySQL + Redis
- 文件：MinIO 私有桶 + 短时效签名 URL
- AI：后端 `ai-gateway` 默认承载模型适配；AI 服务不得直连业务数据库
- 部署：Nginx + Docker / Docker Compose，测试环境和正式环境隔离

## 默认工作优先级

1. 轻量请求优先直接回答，不自动进入 SOP、RepoFrame、阶段级 goal 或文档回写。
2. 用户明确要求开发时，先按当前 `STATUS.md`、`acceptance.json` 和相关任务文档确认范围，再做最小必要修改。
3. 用户明确要求阶段级 goal 或“一批任务”时，才按 `docs/development/workflow.md` 建立/更新阶段级 goal、执行批次 task 和 checklist。
4. 保持 Task 8 为 `NOT_READY`，除非真实外部上线条件全部满足且用户明确要求更新状态。
5. 保持 GOAL-001 为历史初始化证据，GOAL-002 / TASK-003 为 superseded 证据；不要为了普通请求重跑 RepoFrame 初始化。

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
- 轻量问答、状态解释、局部文件查看和一次性命令结果，不进入阶段级 goal，不创建 RepoFrame task，不回写项目文档，除非用户明确要求。

## Token 成本治理

- 一个 Codex 执行会话只推进一个明确闭环；完成后输出接力摘要，优先开新会话继续下一步。
- 单会话请求累计超过 2000 万 token，或单次上下文超过 15 万 token，停止继续开发，先总结当前状态。
- 默认先用 `rg -n` 定位、`sed -n` 读取小片段、`git diff --stat` / `git diff --name-only` 看范围；不要默认整文件读取大文档或输出全量 diff。
- 每次长跑或继续下一步前，可运行 `npm run codex:token-report` 检查最近 token 消耗和高风险命令。
- 详细规则见 `docs/development/codex-token-cost-control.md`。

## RepoFrame 协作规则

- 本项目保留 RepoFrame 文档作为协作证据，但不默认启动 RepoFrame 执行流；只有用户明确要求阶段级 goal、执行批次 task、项目文档回写或验收矩阵收口时才启用。
- 不使用 Yuri workflow/SOP 作为默认流程，也不要引用已卸载的 `yuri-development-sop` 或 `yuri-project-workflow`。
- 这是已有项目的 `repo-hydrate` 后续校准，不重新开始项目，不重跑 `initialize_repo.py`。
- 启用 RepoFrame 执行流时，每个执行任务必须有目标、范围、非目标、验收标准、验证命令、Assumption Checks 和 Downstream Impact。
- Planned task 可以重写、拆分、排序或 supersede；目标、硬约束、稳定范围、验收标准和协作契约变更需要用户明确确认。
- 不删除或削弱 `acceptance.json` 的真实验收要求；过时检查只能校准为当前事实和当前阻塞。
- 临时反馈写 `STATUS.md` 和任务记录；长期接受的决策写 `DECISIONS.md`。
- 初始化产物在 `.repo-init/` 保留作证据；当前执行入口以 `STATUS.md`、active goal、active task 和 `acceptance.json` 为准。

## 项目文档维护

只有在发生实质开发、验收矩阵变化、阶段级 goal 推进或用户明确要求时，才更新：

- `STATUS.md`：当前进度、阻塞、下一步。
- `DECISIONS.md`：新增技术或产品决策。
- `tasks/README.md`：任务状态、验收结果、剩余风险。
- `README.md`：运行、验证、部署入口发生变化时更新。
