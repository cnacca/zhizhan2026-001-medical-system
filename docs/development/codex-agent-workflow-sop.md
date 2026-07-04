# Codex 多 Agent 开发工作流 SOP

更新日期：2026-07-05

## 目标

本 SOP 用于降低高智能模型全程执行带来的速度和 token 成本，同时避免多窗口、多 agent 并行开发导致代码和文档混乱。

核心目标：

- 让 `gpt-5.5` 只负责总控、关键判断、最终验收和文档口径。
- 让低成本子 agent 承担查找、窄实现、静态检查、测试日志整理等可拆工作。
- 用明确文件边界和 worktree 隔离并行开发风险。
- 让客户反馈、持续开发和文档回写进入受控流程。

## 适用范围

适用于本仓库后续一期交付、Task 8 readiness、前端客户反馈、后端最小闭环、OpenAPI / acceptance / deployment 文档同步和演示验收准备。

不适用于：

- 生产数据修复。
- 真实密钥配置。
- 未经确认的破坏性数据库操作。
- 多个窗口同时修改同一个工作树内的同一批文件。

## 总原则

1. 每轮只推进一个默认目标，备选项放 backlog。
2. 主 agent 负责决策，子 agent 负责窄任务。
3. 子 agent 不能自行扩大范围，不能决定下一步。
4. 同一文件同一时间只能有一个 owner。
5. 最终文档口径由主 agent 合并，不由子 agent 分散落稿。
6. 并行开发优先使用独立 git worktree。
7. 每轮结束必须给出 diff、验证结果和剩余风险。

## 角色分工

| 角色 | 推荐模型 | 职责 | 是否可写文件 |
| --- | --- | --- | --- |
| Chief 主 agent | `gpt-5.5` | 读项目状态、选唯一下一步、拆任务、审 diff、最终验收、决定是否停下来问用户 | 可以 |
| Context Scout | `gpt-5.3-codex-spark` | 只读代码和文档，找影响面、文件路径、测试入口、风险点 | 不可以 |
| TDD Worker | `gpt-5.4-mini` 或 `gpt-5.4` | 按指定文件范围写红灯测试、最小实现和局部修复 | 可以 |
| Frontend Worker | `gpt-5.4-mini` | 只改指定 Vue、CSS、前端检查脚本或 smoke 脚本 | 可以 |
| Docs Worker | `gpt-5.4-mini` | 起草 README、STATUS、tasks、OpenAPI、acceptance、readiness 更新 | 可以，但只改指定文档 |
| Verifier | `gpt-5.4` | 跑验证命令、读失败日志、总结失败原因和下一步证据 | 默认不改 |

## 默认执行流程

每轮开发按下面顺序执行：

```text
1. Chief 读取 STATUS.md、tasks/README.md、acceptance/readiness 文档。
2. Chief 推荐唯一下一步，等待用户确认。
3. 用户确认后，Chief 写本轮任务卡。
4. Scout 并行查影响面。
5. Worker 按 TDD 做实现。
6. Docs Worker 起草文档同步。
7. Verifier 跑目标测试和主验收命令。
8. Chief 整合结果、审 diff、修边界问题。
9. Chief 回写最终文档口径。
10. Chief 汇报改动、验证、剩余风险和是否建议提交。
```

## 任务卡模板

每轮开工前，Chief 必须先形成简版任务卡：

```text
任务编号：
目标：
范围：
非目标：
涉及文件：
子 agent 分工：
验收命令：
停止条件：
文档回写范围：
是否允许自动连续下一轮：
```

任务卡必须明确文件 owner。没有 owner 的文件默认不能由子 agent 修改。

## 单窗口模式

适合小任务：

- 一个后端接口小增量。
- 一个前端页面小调整。
- 一个 OpenAPI / README / acceptance 文档同步。
- 一个测试修复。
- 一个 smoke 脚本增强。

推荐配置：

```text
Chief + 1 个 Scout 或 1 个 Worker
```

这是默认模式，成本最低、冲突最少。

## 多 Agent 单工作树模式

适合中等任务，例如“后端接口 + 前端入口 + 文档同步”。

示例分工：

```text
Scout：只读，找后端 service/controller/test 影响面。
Worker A：只改后端和后端测试。
Worker B：只改前端页面和前端检查脚本。
Docs Worker：只改 docs/api、tasks、STATUS、README 草稿。
Chief：最终合并和验证。
```

硬性规则：

- 不允许两个 agent 修改同一个文件。
- 不允许子 agent 改未分配文件。
- 不允许子 agent 自动提交。
- Docs Worker 的文档只是草稿，最终口径由 Chief 合并。

## 多 Worktree 多窗口模式

适合大任务、客户验收前冲刺或多个互不相干模块并行。

推荐目录：

```text
/Users/yuri/Documents/AI智能下单平台
/Users/yuri/Documents/AI智能下单平台-frontend
/Users/yuri/Documents/AI智能下单平台-nightly-task8-readiness
```

可新增时优先放在仓库外部同级目录，避免误提交 worktree 目录。

使用规则：

- 每个 worktree 一个分支。
- 每个 worktree 一个明确目标。
- 合并前由 Chief 做 diff review。
- 如果主工作树已经 dirty，先拆账、备份 patch、确认文件归属，再创建或复用 worktree。

禁止事项：

- 不要让多个窗口同时在同一工作树修改核心文档。
- 不要从脏工作树直接假设可以无损分流到新 worktree。
- 不要把 worktree 本身目录放进 Git 跟踪范围。

## 客户验收反馈流程

客户演示后新增需求或修改意见统一走 CR 流程。

步骤：

```text
1. 冻结当前演示版本：分支、commit、演示地址、截图、smoke 记录。
2. 记录客户反馈到 docs/customer-feedback/YYYY-MM-DD.md。
3. 分类：BUG / CR-P0 / CR-P1 / IDEA。
4. Chief 做影响评估：前端、后端、OpenAPI、数据库、权限、测试、交付时间。
5. 用户确认后转成新的最小闭环任务。
```

分类规则：

- `BUG`：原需求没做到，优先修。
- `CR-P0`：不做无法验收，进入当前里程碑。
- `CR-P1`：可以下轮做。
- `IDEA`：只进 backlog，不打断当前交付。

客户新增功能不能直接混进当前任务，必须先记录、分类、评估、确认。

## 自动连续开发规则

Codex 可以连续推进，但必须受控。

默认允许：

```text
最多连续执行 3 个最小闭环。
每个闭环必须 TDD、验证、回写文档、梳理 diff。
```

遇到以下情况必须停止并询问用户：

- 需求范围变化。
- 客户反馈新增功能。
- 需要新增依赖。
- 需要改数据库结构。
- 测试连续失败两次。
- 需要提交、push 或 PR。
- 涉及安全、权限、生产配置、真实密钥。
- 子 agent 结果互相冲突。

## 文档 Owner 规则

文档防乱的关键是 owner 清晰。

| 文档 | 更新 owner | 更新条件 |
| --- | --- | --- |
| `STATUS.md` | Chief | 当前状态、完成记录、下一步变化 |
| `tasks/README.md` | Chief | 任务状态、验收结果、剩余风险变化 |
| `DECISIONS.md` | Chief | 新增重要技术或产品决策 |
| `README.md` | Chief | 启动方式、环境变量、验证入口变化 |
| `docs/api/openapi.yaml` | 指定 Contract Owner | 接口契约变化 |
| `docs/acceptance/*` | Chief 或 Docs Worker 草稿后 Chief 合并 | 验收口径变化 |
| `docs/deployment/*` | Chief 或 Docs Worker 草稿后 Chief 合并 | 部署、上线缺口变化 |

Docs Worker 可以写草稿，但最终汇入口径必须由 Chief 统一确认。

## 验证规则

每轮按风险选择验证命令。

基础验证：

```bash
npm run acceptance
npm run check:openapi
git diff --check
```

后端改动：

```bash
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
```

前端改动：

```bash
npm run build:frontend
```

专项任务：

```bash
npm run check:task9dXX
```

浏览器或主链路任务：

```bash
npm run smoke:task9dXX
```

验证失败时，先诊断根因，不要盲目扩大修改范围。

## 最终汇报模板

每轮结束时，Chief 汇报必须包含：

```text
完成内容：
涉及文件：
验证命令与结果：
未完成/风险：
diff 摘要：
是否建议 commit：
是否建议继续下一轮：
```

如果工作区本轮开始前已经 dirty，汇报必须区分：

- 本轮新增改动。
- 之前已经存在的改动。
- 未跟踪运行产物。

## 推荐默认策略

日常默认：

```text
Chief + 1 个低成本 Scout / Worker
```

中等任务：

```text
Chief + 2-3 个子 agent
```

大任务或客户验收冲刺：

```text
多 worktree + 多窗口 + Chief 最终合并
```

自动连续开发：

```text
最多 3 个闭环后停下来汇报。
```

这套流程的目标不是让 agent 数量变多，而是让每个 agent 的责任更窄，让高智能模型只花在真正需要判断的地方。
