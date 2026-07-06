# Codex 开发工作流 SOP

更新日期：2026-07-06

## 目标

本 SOP 用于让 Codex 按任务风险选择合适流程：小任务不重型化，普通一期功能保持 TDD 和文档回写，高风险上线项严格受控。

核心目标：

- 默认按最新版 PRD V2.0 / 2026-07-04 和 `docs/acceptance/prd-v2-gap-matrix.md` 推进一期交付。
- 用轻量档、标准档、重型档三档 SOP 控制成本和风险。
- 默认由当前 Codex 在当前会话内顺序执行。
- 用明确文件边界、任务边界和 worktree 隔离并行开发风险。
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
2. 默认从 `docs/acceptance/prd-v2-gap-matrix.md`、`STATUS.md`、`tasks/README.md`、`acceptance.json` 和 readiness 文档选择下一步。
3. 旧 PRD、旧 9D 任务和旧 readiness 记录只作为历史证据；若与最新版 PRD 冲突，以最新版 PRD 和 PRD 差异矩阵为准。
4. 同一文件同一时间只能有一个 owner。
5. 本项目所有开发闭环由当前 Codex 顺序执行。
6. 并行开发或高风险试验优先使用独立 git worktree。
7. 每轮结束必须给出 diff、验证结果和剩余风险。
8. Task 8 仍保持 `NOT_READY`，除非所有本地可关闭项、真实环境项和客户 / PM 确认项都关闭。

## SOP 档位选择

Codex 开工前先判断任务风险，选择最低但足够安全的档位。

| 档位 | 适用场景 | 默认流程 | 执行方式 |
| --- | --- | --- | --- |
| 轻量档 | 文档整理、状态盘点、README / STATUS / tasks 小更新、静态检查脚本小修、前端展示小改、不涉及接口 / 数据库 / 权限安全的小任务 | 读相关文件 -> 明确目标和非目标 -> 小范围修改 -> 跑最相关验证 -> 必要文档回写 -> 汇报 diff 和唯一下一步 | 当前 Codex 顺序执行 |
| 标准档 | PRD 一期普通功能闭环、患者管理基础版、人工支付流水、客户 / 诊所档案与偏好、人员档案 / 工作量看板、质量记录 CRUD / 外返登记、普通前后端联动、OpenAPI / acceptance 需要同步的业务功能 | 读 PRD 矩阵和相关代码 -> 简版任务卡 -> 只读影响面审计 -> TDD 实现 -> 验证 -> 文档回写 -> 汇报 diff、验证和下一步 | 当前 Codex 顺序执行 |
| 重型档 | 鉴权、权限、DataScope、医生端脱敏、数据库迁移、生产配置、Docker / Nginx / 部署、AI 真实 key / webhook、文件安全、真实环境验收、任何影响数据 / 安全 / 上线的任务 | 全局审查 -> 完整任务卡 -> 风险影响面 -> 风险和回滚边界 -> TDD 实现 -> 完整目标验证和回归 -> 文档合并 -> diff / stage / commit 边界审查 | 当前 Codex 顺序执行；必要时建议 worktree 隔离 |

当前项目默认使用标准档；文档 / 小检查自动降级到轻量档；权限、迁移、部署、安全、真实环境相关任务自动升级到重型档。

## 默认执行流程

标准档和重型档按下面顺序执行；轻量档可压缩任务卡。

```text
1. 读取 PRD 差异矩阵、STATUS.md、tasks/README.md、acceptance/readiness 文档和相关代码。
2. 选择档位，输出任务卡。
3. 只读审计影响面、测试入口、权限边界、数据表、OpenAPI 和风险点。
4. 按 TDD 做实现：先红灯测试或失败静态检查，再最小实现。
5. 跑目标测试、OpenAPI、前端 build、acceptance 或 smoke。
6. 回写 STATUS、DECISIONS、tasks、README 和相关 docs。
7. 审 diff，修边界问题。
8. 汇报改动、验证、剩余风险、diff 和唯一下一步。
```

## 任务卡模板

每轮开工前必须先形成简版任务卡：

```text
任务编号：
SOP 档位：
目标：
范围：
非目标：
涉及文件：
文件边界：
执行阶段：
验收命令：
停止条件：
文档回写范围：
是否允许自动连续下一轮：
```

任务卡必须明确文件边界。未纳入文件边界的文件默认不改。

## 单窗口模式

适合小任务：

- 一个后端接口小增量。
- 一个前端页面小调整。
- 一个 OpenAPI / README / acceptance 文档同步。
- 一个测试修复。
- 一个 smoke 脚本增强。

推荐配置：

```text
当前 Codex 顺序执行
```

这是默认模式，成本最低、冲突最少。轻量档和多数标准档优先使用该模式。

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
- 合并前做 diff review。
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
4. 做影响评估：前端、后端、OpenAPI、数据库、权限、测试、交付时间。
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
用户明确授权连续开发后，最多连续执行 3 个最小闭环。
每个闭环必须 TDD、验证、回写文档、梳理 diff。
```

任务来源优先级：

```text
1. docs/acceptance/prd-v2-gap-matrix.md
2. STATUS.md
3. tasks/README.md
4. acceptance.json
5. docs/deployment/readiness-checklist.md
```

自动选择规则：

- 优先本地可关闭的一期 PRD 缺口。
- 跳过 `BLOCKED` 项。
- 跳过二期项。
- 跳过真实外部服务项。
- 每次只做一个最小闭环。

遇到以下情况必须停止并询问用户：

- 需求范围变化。
- 客户反馈新增功能。
- 需要新增依赖。
- 需要新增数据库迁移或改数据库结构。
- 测试连续失败两次。
- 需要提交、push 或 PR。
- 涉及安全、权限、生产配置、真实密钥。
- 需要并行开发或同文件多人修改。
- 工作区 diff 无法安全归属。
- 上下文过长，无法可靠判断当前目标。

## 文档 Owner 规则

文档防乱的关键是 owner 清晰。

| 文档 | 更新 owner | 更新条件 |
| --- | --- | --- |
| `STATUS.md` | 当前 Codex | 当前状态、完成记录、下一步变化 |
| `tasks/README.md` | 当前 Codex | 任务状态、验收结果、剩余风险变化 |
| `DECISIONS.md` | 当前 Codex | 新增重要技术或产品决策 |
| `README.md` | 当前 Codex | 启动方式、环境变量、验证入口变化 |
| `docs/api/openapi.yaml` | 指定 Contract Owner | 接口契约变化 |
| `docs/acceptance/*` | 当前 Codex | 验收口径变化 |
| `docs/deployment/*` | 当前 Codex | 部署、上线缺口变化 |

文档口径必须由当前 Codex 在本轮收尾时统一确认，不能把重要上下文只留在聊天里。

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

每轮结束时汇报必须包含：

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

日常默认使用轻量档或标准档，由当前 Codex 顺序执行：

```text
只读审计 -> TDD 实现 -> 验证 -> 文档回写 -> diff 汇报
```

中等任务使用标准档：

```text
简版任务卡 + 只读影响面 + TDD 实现 + 验证 + 文档回写
```

大任务、高风险任务或客户验收冲刺使用重型档：

```text
完整任务卡 + 风险和回滚边界 + 严格 TDD + 完整验证 + 最终文档合并
```

自动连续开发：

```text
用户明确授权后最多 3 个闭环后 checkpoint 汇报；没有授权时只推荐唯一下一步。
```

这套流程的目标是让任务边界更窄、验证更明确、真实外部环境和客户确认不被误关。
