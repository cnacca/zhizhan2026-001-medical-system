# TASK-033 干净环境可复现性与产品目录正式值执行批次

Status: `in_progress`

Goal: `goals/GOAL-032-clean-env-and-catalog-data-closure-20260802.md`

## Why

2026-08-02 在一台全新 macOS 上按 `README.md` 从零安装本项目，暴露三个此前从未被发现的阻塞问题。三个都不是功能缺陷，而是**只在已配置好的开发机上不会暴露的可复现性缺陷**：

1. `demo:backend` 硬编码 `AI_PROVIDER=deterministic AI_DEEPSEEK_ENABLED=false`，内联变量覆盖外部注入，导致客户演示环境的 AI 永远返回确定性桩。客户 CHK043 反馈"AI 不存在帮客户下单和提醒缺失资料"的直接原因即此。
2. `demo:seed` 先跑 `seed-demo-data.mjs` 再跑 `seed-admin-portal-demo-data.sh`，但前者依赖后者创建的 `demo_cad` 账号，**全新数据库上必然 401 失败**。历史上未暴露是因为开发机数据库非全新，账号在上一轮已存在。
3. `demo:seed` 场景 07 在 `attachBillToOrder` 返回 409，全新库上仍复现，且失败后重跑无法自愈，只能整库重置。

同时，产品配置中心（V75 / D-178）结构已就绪但正式业务值为空，管理端"产品总览"在客户验收时表现为"无数据"（CHK067）。该缺口的输入资料《动态下单表最终版》指纹与 GOAL-031 一致，团队早已持有，属于**数据未录入**而非资料未提供。

## Scope

- 按 A → B → C → D 顺序执行四个批次；顺序已按依赖关系重排，与用户提出的 1/2/3/4 的对应关系见下方"批次映射"。
- 每批先补测试或检查脚本，再实现，再复验。
- 所有改动为增量修复，不删除数据、不重建现有事实链、不改业务语义。
- 每批完成后更新本文件 checklist、验证结果与剩余风险。

## 批次映射

| 本文件批次 | 用户提出的条目 | 重排理由 |
| --- | --- | --- |
| A | 第 1 项 提交两处修复 | 已完成的修复，先落地让 Codespace 生效，最快见效 |
| B | 第 3 项 修场景 07 造数 bug | 提前到 C 之前：D 的演练依赖 `demo:seed` 全绿，否则演练必挂 |
| C | 第 2 项 录入产品目录正式值 | 体量最大，单独批次，不阻塞前两项 |
| D | 第 4 项 干净机器全流程演练 | 必须最后做，用于验证 A/B/C 的成果 |

## Non-goals

- 不 reset / checkout / clean 当前工作树，不清理未跟踪文件。
- 不 push 到 `main`。
- 不实现角色权限改造（组长层级、账号交接、收货/发货岗位），另立 Goal。
- 不补造客户未提供的文件规则、价格、制作周期与标准工时。
- 不伪造客户签字、真实环境或最终上线证据，不把 Task 8 改为 `READY`。

## 分支策略（需用户确认后执行 A）

当前远端实际状态与 `AGENTS.md` 的协作规则存在偏差，A 批次提交前必须确认：

- `main`：停留在 2026-06-24 的空 `Initial commit`，无业务代码。
- `dev`：同上，空。
- `feature/project-skeleton`：**全部 139 个提交与全部业务代码所在分支**，Codespace 当前检出的也是该分支。

`AGENTS.md` 写明"`main` 是稳定分支，禁止直接 push；`dev` 是开发集成分支"，但实际两者均为空壳。要达成"让 Codespace 也生效"的目标，提交目标只能是 `feature/project-skeleton`。

- 本任务默认方案：提交并推送到 `feature/project-skeleton`。
- 分支治理债务（139 个提交从未合并、无稳定回退点、无代码审查记录）单独记录，不在本任务解决。

## Checklist

### A. 提交可复现性修复并同步 Codespace

Scope：

- 提交 2026-08-02 已完成的两处 `package.json` 修复。
- 确认 `.env` 未被纳入提交。
- 推送到 `feature/project-skeleton`，Codespace 拉取后验证 AI 可用。

Acceptance：

- [ ] `demo:backend` 使用 `${AI_PROVIDER:-deterministic}` 与 `${AI_DEEPSEEK_ENABLED:-false}`，默认行为不变。
- [ ] `demo:seed` 顺序为先 `seed-admin-portal-demo-data.sh` 后 `seed-demo-data.mjs`。
- [ ] `git status` 中不含 `.env`，提交 diff 中不含任何 `sk-` 开头字符串。
- [ ] 推送成功，Codespace `git pull` 后注入 key 可返回真实模型回答。

Verification：

```bash
git diff --stat
git diff | grep -c 'sk-' # 必须为 0
npm run demo:stop && npm run demo:start
```

### B. 修复 demo:seed 场景 07 账单重复绑定 409

Scope：

- 定位 `scripts/smoke-task-9d62-main-chain.spec.mjs` 中 `attachBillToOrder` 在场景 07 的重复调用路径。
- 使账单绑定幂等：已存在账单时复用而非重复创建，或在场景层跳过。
- 不改动 `/orders/{id}/bill` 后端语义——409 是正确的服务端行为，问题在造数脚本。

Acceptance：

- [ ] 全新库上 `npm run demo:seed` 7 个场景连续通过。
- [ ] 同一库上重复执行 `npm run demo:seed` 不报 409，结果幂等。
- [ ] `npm run demo:check` 通过。
- [ ] 后端 `/orders/{id}/bill` 的 409 行为未被修改。

Verification：

```bash
npm run demo:reset && npm run demo:prepare
npm run demo:seed   # 第二次执行必须同样成功
npm run demo:check
```

### C. 产品目录正式业务值录入

Scope：

- 按《动态下单表最终版》整理 6 个产品大类 → 约 50 个产品一类 → 材料 / 牙色 / 制作要求选项。
- 通过 `/admin/catalog` 既有草稿与发布机制录入，不绕过版本快照与审计。
- 提供可复核的结构化清单与校验脚本，不接受逐条手工点击。
- 未提供的价格标"待报价"，未提供的文件规则标"待设置"。

Acceptance：

- [ ] 6 个大类齐全：固定义齿、活动义齿、种植修复、正畸产品、隐形正畸、设计服务。
- [ ] 各大类下产品一类与文档一致，无遗漏、无杜撰。
- [ ] 材料按产品绑定，牙色体系含 VITA 16 Classic（16 色）、3D Master（26 色）与颈/体/切端分色三段。
- [ ] 所有价格字段为"待报价"，无虚构金额。
- [ ] 管理端"产品总览"不再表现为无数据。
- [ ] 历史订单继续按提交时快照展示，不受新目录影响。

Verification：

```bash
npm run check:catalog-formal-values   # 本批次新增
npm run demo:check
```

### D. 干净机器全流程演练

Scope：

- 建立可重复执行的干净环境演练脚本与记录模板。
- 在未配置过本项目的环境中，只按 `README.md` 操作，记录每一步实际耗时与失败点。
- 演练结论纳入 `deployment-infrastructure` readiness 证据。

Acceptance：

- [ ] 演练全程无手动补救即可跑通到四端登录 + `demo:prepare` 全绿。
- [ ] 演练记录含宿主平台、各步耗时、失败点与修复项。
- [ ] `README.md` 的"本地启动"章节按演练结果补全缺失前置条件。
- [ ] 新增 `npm run check:clean-env-reproducibility`。
- [ ] 记录写入 `docs/deployment/`，并在 `acceptance.json` 的 `deployment-infrastructure` 追加本地演练证据，该项**仍保持 `PARTIAL`**（本地演练不等于真实服务器验收）。

Verification：

```bash
npm run check:clean-env-reproducibility
```

## 已完成的现场记录（2026-08-02）

宿主：macOS Darwin 25.3.0 / Apple Silicon，未预装 JDK 与 Maven。

| 步骤 | 结果 | 耗时 |
| --- | --- | --- |
| `gh repo clone` | 需手动切到 `feature/project-skeleton`，默认分支为空 | 约 3 分钟 / 958MB |
| `brew install openjdk@21 maven` | 通过，`scripts/with-jdk21.sh` 硬编码路径与 Homebrew 默认位置一致 | 约 2 分钟 |
| `npm run compose:up` | 通过，MySQL / Redis / MinIO 三容器 healthy | 约 30 秒 |
| `npm run install:frontend` | 通过，pnpm 10.24.0 可用（`packageManager` 声明 11.7.0，未阻塞） | 8.9 秒 |
| 后端编译 | `BUILD SUCCESS`，全部模块通过 | 42.9 秒 |
| `npm run local:start` | 通过，76 个迁移应用成功，四端可登录 | 约 1 分钟 |
| `npm run demo:prepare` | **失败**，见 Why 第 2、3 条 | — |

已验证生效的能力：

- 真实 DeepSeek 调用成功，5.9 秒返回，回答基于数据库真实读取（订单号、内部状态、消息数、附件数、账单金额），未虚构完成时间。
- AI 安全边界正确：医生询问技工、工时、返工次数、责任人时本地 `SAFE_REFUSAL`，秒回且不外呼模型，仅返回公开状态。
- 服务端权限校验生效：ADMIN token 调用 `/ai/order-query` 返回 403。
- 管理端"产品总览"确有数据结构与记录，客户反馈的"无数据"为正式业务值缺失，非功能缺陷。

## 剩余风险

- 《动态下单表最终版》第四页（各大类上传资料）与第六页（价格 / 默认要求 / 制作周期）为空白，C 批次只能完成部分字段，缺口继续计入 CP-002 / CP-005。
- 本地干净演练不能替代真实服务器部署验收，`deployment-infrastructure` 与 Task 8 状态不变。
- 分支治理债务（139 个提交仅存在于单一 feature 分支）未在本任务解决。
