# TASK-033 干净环境可复现性与产品目录正式值执行批次

Status: `in_progress`

Goal: `goals/GOAL-032-clean-env-and-catalog-data-closure-20260802.md`


> A~D 四批的本地工作均已完成并推送。状态保持 `in_progress` 的原因只有两项外部动作：
> (1) Codespace 侧执行 `git pull` 并注入 DeepSeek key 后复验真实模型回答；
> (2) 产品目录草稿 v4 待客户核对材料归属后发布。
> 两项都不依赖本地开发，完成后即可将本文件与 GOAL-032 置为 `completed`。

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

## 分支策略（已于 2026-08-02 收口）

执行 A 批次时的状态：`main` 与 `dev` 均停留在 2026-06-24 的空 `Initial commit`，全部业务代码只在 `feature/project-skeleton` 上。`AGENTS.md` 声明的"`main` 稳定 / `dev` 集成"工作流因此无法执行，A~D 四批只能推到 `feature/project-skeleton`。

该债务的实际代价在本任务中被实测命中：从零 `git clone` 默认分支只得到一个仅含 README 的仓库，必须手动切分支才看到代码——客户或新同事必然踩到。

收口动作：

- PR #3 将 `feature/project-skeleton` 的 145 个提交快进合并入 `main`（合并提交 `816635d2`），保留完整历史，未做 squash。走 PR 而非直接 push，遵守 `AGENTS.md` 对 `main` 的保护约定。
- `dev` 同步到同一提交，使"`main` 稳定 / `dev` 集成"工作流真正可执行。
- 已验证：干净克隆默认分支即得到 `backend` / `frontend` / `scripts` / `docs` 全部内容。
- `README.md` 中"业务代码在 `feature/project-skeleton`"的提示同步作废并改写。

后续新工作从 `dev` 开分支、经 PR 合入 `main`，不再长期堆积在单一 feature 分支。

## Checklist

### A. 提交可复现性修复并同步 Codespace

Scope：

- 提交 2026-08-02 已完成的两处 `package.json` 修复。
- 确认 `.env` 未被纳入提交。
- 推送到 `feature/project-skeleton`，Codespace 拉取后验证 AI 可用。

Acceptance：

- [x] `demo:backend` 使用 `${AI_PROVIDER:-deterministic}` 与 `${AI_DEEPSEEK_ENABLED:-false}`，默认行为不变。
- [x] `demo:seed` 顺序调整（后续在 B 批次进一步改为 SQL 前后各执行一次）。
- [x] `git status` 中不含 `.env`；`sk-` 命中的 5 处均为 `task-9d62-...` 的子串，按 `sk-[a-f0-9]{32}` 严格匹配为 0。
- [ ] Codespace `git pull` 后注入 key 返回真实模型回答（需在 Codespace 侧执行，本地无写权限）。

结果：已提交并推送 `ab53c5e2`。

Verification：

```bash
git diff --stat
git diff | grep -c 'sk-' # 必须为 0
npm run demo:stop && npm run demo:start
```

### B. 修复演示造数链路（实际范围远大于场景 07）

原判为"场景 07 账单重复绑定"，实际 409 的原因并非重复绑定，而是账单文件不满足 PDF 校验。逐层定位后共 6 个缺陷，**其中 5 个不抛错，只让数据悄悄不完整**，最终表现为"某个模块没有数据"——与客户 CHK 反馈的现象同源。

后端门禁变更未同步造数脚本（均来自 `2100d857`，2026-07-31）：

1. 账单绑定要求 doctor-visible 的 PDF（`CollaborationService.java:376-388`），脚本仍上传 `.txt` / `text-plain`，`attachBillToOrder` 必定 409。
2. 发货要求 `order_bill.payment_status ∈ {PAID, NOT_REQUIRED}`（`CollaborationService.java:733-745`），脚本从未标记付款，场景 07 必定 409。按 CP-001 基线补人工标记付款。

口径不一致：

3. `check-demo-data` 用 `===` 比较 `sessions.PRODUCTION.userId`（字符串，后端为避免 JS 大整数精度丢失而序列化为字符串）与 `assigned_user_id`（数字），恒为 false。
4. 迁移 V49 已将 `PENDING_DOCTOR_CONFIRM` 改名为 `PENDING_DOCTOR`，`httpDoctorGateway` 与 `CsPortalPages` 已兼容，`check-demo-data` 未跟进。

日期边界（只在每月前几天复现）：

5. 上月演示单锚定 `NOW()-1MONTH-7DAY`，当天为 1~7 号时跨到上上个月。工作台上月窗口只覆盖 `[上月1日, 上月1日+已过天数)`，因此放在月中同样落在窗口外。改为锚定上月 1 号，并让该单与去年同期单当日发货。

造数流程循环依赖：

6. `seed-admin-portal` SQL 与 scenarios 互为依赖：scenarios 需要 SQL 建的 `demo_cad` 账号；SQL 的外协/质量证据需要 scenarios 建的订单，且用 `WHERE @order_id IS NOT NULL` 静默跳过。单一顺序无解，改为 SQL 前后各执行一次（其全程 `ON DUPLICATE KEY UPDATE`，幂等），抽出 `demo:seed:admin` 复用。

另补：`seed-demo-data` 此前仅以"订单存在"判断场景已完成，但订单在场景开头即创建，中途失败会留下半成品订单被后续运行当作完好数据跳过，重跑永远无法自愈。改为以上一次成功写出的 manifest 为完成凭据，遇到半成品订单直接报错并给出重置命令。

Acceptance：

- [x] 全新库上 `npm run demo:prepare` 一次通过，7 个场景全部创建。
- [x] 同一库上重复执行 `npm run demo:seed` 幂等，退出码 0。
- [x] `npm run demo:check` 输出 `demo data verification passed`。
- [x] 后端 `/orders/{id}/bill` 与 `/orders/{id}/logistics` 的 409 行为未被修改——两处 409 都是正确的服务端门禁，问题在造数脚本。

结果：已提交并推送 `a0dbf1df`。

Verification：

```bash
npm run demo:stop
DEMO_RESET_CONFIRM=RESET_DEMO_DATA npm run demo:reset
npm run demo:prepare   # 期望 exit 0 且输出 demo data verification passed
npm run demo:seed      # 第二次执行必须同样 exit 0
npm run demo:check
```

遗留（不在本批次处理，已单独挂出）：

- `frontend/src/App.vue:15065` 仍以 `draft.status === 'PENDING_DOCTOR_CONFIRM'` 决定是否渲染医生的"确认设计稿"按钮，未跟进 V49 改名。若该视图仍可达，会影响一期验收项 14.4-04。需先判断是否为死代码。

### C. 产品目录正式业务值录入

Scope：

- 按《动态下单表最终版》整理 6 个产品大类 → 约 50 个产品一类 → 材料 / 牙色 / 制作要求选项。
- 通过 `/admin/catalog` 既有草稿与发布机制录入，不绕过版本快照与审计。
- 提供可复核的结构化清单与校验脚本，不接受逐条手工点击。
- 未提供的价格标"待报价"，未提供的文件规则标"待设置"。

调研结论修正原判：**产品层级早已录入且与文档逐字一致**，缺口只在材料层。基线版本 v3 的分类与产品对照：

| 分类 | 数据库 | 《动态下单表》 |
| --- | ---: | ---: |
| 固定义齿 | 12 | 12 |
| 活动义齿 | 10 | 10 |
| 种植修复 | 7 | 7 |
| 正畸产品 | 48 | 48 |
| 设计服务 | 17 | 17 |

因此 C 批次实际范围收敛为：材料、牙色、产品-材料绑定。

建模决定：

- 牙色挂在单个材料上（`catalog_material_color_v2.material_id` 必填）。按文档"先选牙色品牌、再选牙色"的表述，把 VITA 16 Classic / VITA 3D Master / 颈体切端分色建成材料，色号建成其 colors，避免几百材料 × 42 色号的笛卡尔积。
- 正畸 48 项在库中已是 product，文档第三页所列即同一批，不重复建材料；正畸附件 21 项属 ACCESSORY，另批处理。
- 设计服务的文件格式与交期属动态表单字段，不是材料。

Acceptance：

- [x] 6 个大类齐全（由 GOAL-031 已完成，本批次核对无误）。
- [x] 各大类下产品与文档一致，无遗漏、无杜撰。
- [x] 材料按产品绑定；牙色体系含 VITA 16 Classic（16 色）、3D Master（26 色）与颈/体/切端分色三段，合计 45 个色号。
- [x] 所有绑定的 `price_increment_cents` 为空，无虚构金额（SQL 核验命中 0 条）。
- [x] 基线版本 v3 保持 `ACTIVE` 未被修改，新数据落在草稿 v4。
- [ ] 草稿 v4 发布后管理端"下单内容设置"可选到材料与牙色（**发布待客户核对后执行**）。
- [ ] 历史订单快照不受影响（需在发布后复验）。

导入结果（草稿 v4，基于 v3）：

- 材料 172 个、色号 45 个、绑定 341 条，96 个产品全部匹配，**零跳过**。
- 绑定分组：`PRIMARY_MATERIAL` 138、`TOOTH_SHADE` 66、`POLISH_LEVEL` 44、`MARGIN_TYPE` 33、`IMPLANT_ABUTMENT_TYPE` 30、`DENTURE_TOOTH_BRAND` 15、`SCREW_ACCESS_POSITION` 15。

Verification：

```bash
node scripts/import-catalog-formal-values.mjs --dry-run     # 统计，不落库
node scripts/import-catalog-formal-values.mjs               # 建草稿并导入
node scripts/import-catalog-formal-values.mjs --publish=4   # 核对后发布
npm run demo:check
```

待客户确认（已在数据文件中登记，不自行补造）：

- 「钴铬合金聚合瓷冠」「精密附件」两组材料列在固定修复模板下但未指明归属产品，已建材料未建绑定。
- 文档「卡环设计，需要选择：无、以及以下内容」后无内容，属客户漏填。
- 文档第四页（各大类上传资料）与第六页（价格/默认要求/制作周期）为空白，继续计入 CP-002 / CP-005。

### D. 干净机器全流程演练

Scope：

- 建立可重复执行的干净环境演练脚本与记录模板。
- 在未配置过本项目的环境中，只按 `README.md` 操作，记录每一步实际耗时与失败点。
- 演练结论纳入 `deployment-infrastructure` readiness 证据。

Acceptance：

- [x] 演练全程无手动补救即可跑通：2026-08-02 演练 10 项全部通过，0 失败。
- [x] 演练记录含宿主平台、各步耗时、失败点与修复项。
- [x] `README.md` 的"本地启动"章节补全缺失前置条件。
- [x] 新增 `npm run drill:clean-env` 与 `npm run check:clean-env-reproducibility`。
- [x] 记录写入 `docs/deployment/clean-env-reproducibility-drill.md`，`acceptance.json` 的 `deployment-infrastructure` 已追加本地演练证据且**仍为 `PARTIAL`**。

2026-08-02 演练结果（Darwin 25.3.0 arm64，ref `feature/project-skeleton`）：

| 步骤 | 结果 | 耗时 |
| --- | --- | ---: |
| git clone | PASS | 3s |
| check:toolchain | PASS | 1s |
| install:frontend | PASS | 1s |
| compose:up | PASS | 11s |
| backend build | PASS | 5s |
| demo:reset | PASS | 0s |
| demo:prepare | PASS | 63s |
| demo:seed 幂等复跑 | PASS | 1s |
| demo:check | PASS | 0s |
| 四端入口可达 | PASS | 1s |

演练本身发现并修复的第 8 个缺陷：`compose:up` 使用 `docker compose up -d` 不等健康检查即返回，全新卷上 MySQL 需十余秒初始化，紧随其后的 `demo:reset` 必然报 `Can't connect to local MySQL server through socket`。三个服务均已定义 healthcheck，改用 `--wait`（提交 `f62e248c`）。

设计约束（写入脚本注释与记录文档）：

- 演练执行 `git clone` 出来的**已提交状态**而非工作区。顺序固定为「改代码 → 提交 → 演练 → 通过后写记录」；若改读工作区，本地未提交的修复会产生假绿灯。
- `compose.yaml` 使用固定容器名、local/demo 使用固定端口，同一宿主只能存在一套运行环境。脚本先停源仓库运行时，结束后 `docker compose down --volumes` 归还资源。

Verification：

```bash
npm run drill:clean-env                    # 独占运行，会清空演示库
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
