# 干净环境可复现性演练

状态：ACTIVE / 2026-08-02。归属：`goals/GOAL-032` / `tasks/TASK-033` D 批次。

## 为什么需要这个演练

本项目的自动化覆盖一直很厚（后端 253 项测试、十余个 smoke、OpenAPI 冻结），但**从未在一台没有配置过本项目的机器上，只按 `README.md` 从零跑通过一遍**。

开发始终在已配置好的机器上迭代：数据卷早已存在、环境变量早已设好、演示账号早已建好。于是一整类缺陷长期不可见——它们**不抛错，只让数据悄悄不完整**，最终表现为"某个模块没有数据""某个按钮不出现"。

2026-08-02 首次在全新 macOS 上从零安装，连续暴露：

| 缺陷 | 为什么开发机看不见 |
| --- | --- |
| `demo:seed` 两步顺序颠倒，依赖 `demo_cad` 账号 | 开发机数据库非全新，账号在上一轮已存在 |
| 账单文件用 `.txt`，后端 2026-07-31 起要求 PDF | 加校验后无人重跑 `demo:prepare` |
| 发货前未标记付款，撞同日新增的付款门禁 | 同上 |
| `seed-admin-portal` 与 scenarios 循环依赖，用 `WHERE @id IS NOT NULL` 静默跳过 | 第二次运行会补上，掩盖了首次失败 |
| `compose:up` 不等健康检查即返回 | 数据卷已存在时 MySQL 一两秒就绪，竞态窗口太短 |

**真实部署到客户服务器就是一次"全新环境从零跑通"。** 这些问题不提前排掉，会在客户在场时原样复现。

## 演练做什么

```bash
bash scripts/clean-env-reproducibility-drill.sh
```

把仓库克隆到一个全新目录，只按 `README.md` 的步骤执行，记录每步耗时与失败点：

```
git clone → check:toolchain → install:frontend → compose:up → 后端编译
→ demo:reset → demo:prepare → demo:seed 幂等复跑 → demo:check → 四端可达
```

核心断言是 **`demo:prepare` 从零一次通过**。

演练刻意不做任何补救：不复制现有 `.env`、不复用构建产物、不手工建账号。任何一步失败都如实中止，**失败本身就是演练结论的一部分**。

### 必须先提交再演练

演练执行的是 `git clone` 出来的**已提交状态**，不是当前工作区。这是有意设计：它测的是"别人 clone 下来会拿到什么"。

执行顺序固定为：**改代码 → 提交 → 演练验证 → 通过后写记录**。不能反过来。若改成读工作区，本地未提交的修复会让演练报出假绿灯——而"开发机能跑 ≠ 别人能跑"正是本项目一直吃亏的地方。

### 独占性

`compose.yaml` 使用固定容器名（`ai-order-mysql` / `ai-order-redis` / `ai-order-minio`），local 与 demo 运行时使用固定端口（5173/8080/15173/18080）。**同一宿主同时只能存在一套运行环境。**

脚本会先停掉源仓库的 local / demo 运行时并释放容器名，演练结束后 `docker compose down --volumes` 归还资源。演练会清空演示库，结束后需要重新 `local:start` 与按需重新导入目录草稿。

## 2026-08-02 演练记录

宿主：Darwin 25.3.0 arm64（macOS / Apple Silicon）
ref：`feature/project-skeleton`

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

**10 项全部通过，0 项失败。结论：干净环境无手动补救即可跑通。**

达成该结果前，演练本身共发现并修复：

1. `demo:seed` 顺序颠倒（提交 `ab53c5e2`）
2. 账单 PDF 校验、付款门禁、循环依赖、幂等判据、类型比较、日期边界共 6 项（提交 `a0dbf1df`）
3. `compose:up` 启动竞态（提交 `f62e248c`）

## 本演练不能证明什么

以下均**未被覆盖**，不得据此声称部署验收完成：

- **宿主侧冷启动**：pnpm store 与 `~/.m2` 由宿主共享，"依赖安装 1s""后端编译 5s"远短于真正全新机器。演练验证的是仓库侧可复现性。
- **Linux 宿主**：`scripts/with-jdk21.sh` 硬编码 Homebrew 路径 `/opt/homebrew/opt/openjdk@21/...`，在 Linux 服务器上不存在。
- **Docker 权限、防火墙、SELinux**。
- **HTTPS / Nginx 生产网关**。
- **多实例并存**：固定容器名与固定端口使测试环境与正式环境无法同机共存。客户若计划同机跑两套环境，需先把容器名与端口参数化。
- **数据库备份恢复、日志留存、监控告警、发布回滚演练**。
- **真实对象存储 bucket 隔离与真实弱网 / 跨设备续传**。

因此 `acceptance.json` 的 `deployment-infrastructure` 继续保持 `PARTIAL`，Task 8 继续保持 `NOT_READY`。真实服务器验收仍按 `docs/deployment/readiness-checklist.md` 的 9D.81 模板另行执行。

## 建议纳入常规

建议把本演练作为**发布前必过项**：任何改动后端门禁、数据库迁移、造数脚本或启动流程的提交，合并前跑一次。今天六个缺陷中有五个是"后端加了约束、脚本没跟上"，这类问题只有全新环境能发现。
