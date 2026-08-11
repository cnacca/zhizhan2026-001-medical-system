# 项目导航（新会话从这里开始）

状态：ACTIVE / 2026-08-11

## 为什么有这份文件

仓库里有 **162 份 docs、30 个 goal、32 个 task、3400 行 DECISIONS、600 行 STATUS**，
其中不少是**追加式日志**——新内容往上堆，旧内容不删。这种写法对追溯有价值，
但新会话进来会淹死在历史里，而且很容易把 2026-07 的历史结论当成当前状态。

这份文件是**唯一入口**。按「你要做什么」找文件，不要从头读 STATUS.md。

---

## 一句话现状

一期四端功能主体已完成（后端 336 项测试全绿），**当前是交付冲刺阶段**，
三条线并行：①部署上线 ②医生端英文化 ③AI key 前端配置。客户正在采购服务器。

2026-08-11 的 8088 联调缺陷已完成本地代码与自动化修复，但线上尚未重新部署；部署入口改为
`deployment/8088-redeployment-checklist-20260811.md`，完成公网 MinIO、网络、账号轮换和真实复测前不得写成线上恢复。

**交付标准（2026-08-04 已确认）＝ 一期 38 项验收签字通过。**
当前 38 项为 30 PASS / 1 PARTIAL / 7 EXTERNAL_ACCEPTANCE。

**Task 8 = `NOT_READY`**，且部署完成 ≠ 一期整体验收通过。

### 当前三个 P0（详见 `DELIVERY-GAP.md` §三）

| P0 | 事项 | 工作量 | 能否立即开工 |
| --- | --- | --- | --- |
| 1 | 本地全链路演练 + compose 资源限制/JVM 参数 | 1–2 天 | ✅ 不依赖任何人 |
| 2 | **医生端英文化（i18n）** | **2–3 周** | ✅ 可开工（术语表可后补） |
| 3 | **AI key 前端配置（C10）** | 3–5 天 | ✅ 不依赖任何人 |

⚠️ **P0-2 与 P0-3 都不在原 38 项验收表内**，属新增范围，
商务上如何计入验收尚未拍板 —— 见 `DELIVERY-GAP.md` 顶部的「必须现在摆出来的矛盾」。

---

## 按任务找文件

| 你要做什么 | 先读 | 再读 |
| --- | --- | --- |
| **推进部署 / 修复 8088** | `deployment/8088-redeployment-checklist-20260811.md` | `deployment/SESSION-HANDOVER-deployment.md`、`deployment/go-live-plan-20260804.md` |
| **做医生端英文化** | `DELIVERY-GAP.md` 的 C3 小节（含技术方案与范围界定） | `frontend/src/doctor/` 两个主文件 |
| **做 AI key 前端配置** | `DELIVERY-GAP.md` 的 C10 行（含建表与安全要点） | `tasks/TASK-034-*.md` C 批次的密码处理做法可参照 |
| **给客户答疑 / 要资料** | `deployment/customer-confirmation-checklist-20260804.md` | `deployment/server-recommendation-20260804.md` |
| **改订单状态相关代码** | `development/status-vocabulary.md` ⚠️ **必读** | — |
| **改权限相关代码** | `development/status-vocabulary.md` 的「角色与权限」章节 | `tasks/TASK-034-*.md` |
| **看还差什么才能交付** | `DELIVERY-GAP.md`（本目录） | `deployment/readiness-checklist.md` |
| **看某个决定为什么这么做** | 根目录 `DECISIONS.md`，**从最新的 D-185 往回读** | — |
| **接手某个批次的历史** | `tasks/TASK-0xx-*.md` 对应小节 | 同名 `goals/GOAL-0xx-*.md` |

---

## 文件性质分类（重要）

### 🟢 当前有效，会持续更新

| 文件 | 作用 |
| --- | --- |
| `docs/INDEX.md` | 本文件，唯一入口 |
| `docs/DELIVERY-GAP.md` | **交付缺口的唯一权威清单** |
| `docs/deployment/SESSION-HANDOVER-deployment.md` | 部署推进的当前状态与下一步 |
| `docs/deployment/customer-confirmation-checklist-20260804.md` | 待客户回答的问题，客户答了就回填 |
| `docs/development/status-vocabulary.md` | 状态值口径，改状态前必读 |
| `DECISIONS.md` | durable 决定，只增不改，**从最新往回读** |
| `tasks/TASK-034-*.md` | 最近完成的六批，含每批的遗留 |

### 🟡 追加式日志，查历史用，**不要当当前状态读**

| 文件 | 说明 |
| --- | --- |
| `STATUS.md` | 600 行，最新一条在「当前状态」章节顶部。**下面的 9D.xx 段落全是一期历史明细** |
| `docs/deployment/readiness-checklist.md` | 追加式，开头一堆 2026-07 的历史锚点。当前缺口用 `npm run check:task8-readiness-gaps` 看，别读正文 |
| `docs/deployment/task-8-final-readiness-report.md` | 同上，2026-07-06 快照 |
| `README.md` | 1843 行，含大量历史交接摘要 |

### ⚪ 历史存档，除非明确需要否则不用读

`docs/design/`（44 份）、`docs/research/`（18 份）、`docs/learning/`、
`docs/superpowers/`、`goals/GOAL-001` 到 `GOAL-031`、`tasks/TASK-001` 到 `TASK-032`。

---

## 机器可读的状态入口（比读文档可靠）

```bash
npm run check:task8-readiness-gaps    # 当前 9 项交付缺口，权威来源
npm run test:backend                  # 336 项，必须使用干净隔离测试库（见交接文档的坑）
npm run check:deployment-bugfixes-20260811 # 8088 / 文件 / 下单回归门禁
npm run check:deployment-env          # 部署前门禁：时区固定 + 代理前缀一致性
npm run check:openapi                 # 194 paths / 223 operations
```

TASK-034 六批各自的静态校验：

```bash
npm run check:task-034-authorization-baseline   # A 授权底座
npm run check:task-034-fine-grained-roles       # B 细分角色
npm run check:task-034-rbac-console             # C 管理端 RBAC
npm run check:task-034-account-handover         # D 账号交接
npm run check:task-034-export-governance        # E 导出管控
npm run check:task-034-order-rules              # F 下单规则
```

---

## 三条容易踩的坑

1. **测试库会被污染**：单跑过某些测试后再跑全量，`OrderCaseGroupTests` 会失败。
   先 `DROP DATABASE ai_order_platform_test` 再 `bash scripts/ensure-test-database.sh`。
2. **新增后端路径前缀**：必须**同时**改 `frontend/vite.config.ts` 与 `frontend/nginx.conf`，
   否则生产环境页面能打开但拿不到数据（D-184）。
3. **业务日期**：一律用 `common/BusinessTime.today()`，禁止无参 `LocalDate.now()`（D-183）。

---

## 仓库规模（判断改动影响面用）

| | |
| --- | --- |
| 后端 Java | 360 文件 / 55,797 行 |
| 后端测试 | 52 文件 / 333 项 |
| 数据库迁移 | 83 个（V1 → V83） |
| 前端 | 36,730 行（`App.vue` 单文件约 18,600 行承载客服/生产/管理三端） |
| 校验脚本 | 168 个 `check-*.mjs` |
| 文档 | 162 份 / 20,794 行 |
