# 部署推进 · 新会话交接文档

状态：ACTIVE / 2026-08-04
用途：新会话从这里开始，不必重读全部历史。

---

## 一句话现状

TASK-034（A~F 六批）与 GOAL-033 已全部完成并推送；**下一步是部署,当前卡在「阶段一：本地全链路演练」还没开始**。

## 基本坐标

| 项 | 值 |
| --- | --- |
| 仓库 | `/Users/joe/Desktop/Vibecoding/zhizhan2026-001-medical-system`（**不是** `医疗下单`，那里只有原始 docx） |
| 分支 | `dev`（已推 `origin/dev`） |
| 后端测试 | 333 项，干净测试库上全绿 |
| 迁移 | 已到 **V83** |
| OpenAPI | 194 paths / 223 operations |

### 必读的三份文档

1. `docs/deployment/go-live-plan-20260804.md` —— **上线方案主文档**，五个阶段
2. `docs/deployment/customer-confirmation-checklist-20260804.md` —— 待客户回答的 20 项
3. `docs/development/status-vocabulary.md` —— 状态值口径，改任何状态前必读

---

## 下一步要做什么

### 阶段一：本地全链路演练（**未开始，可立即开工，不依赖客户**）

目标：把 `deploy/docker-compose.phase-one.yml` 整套真正跑起来，四端用浏览器点一遍。

**为什么这步不能跳**：这套部署产物从未被完整跑起来过。2026-08-03 才发现生产
`frontend/nginx.conf` 只代理了 3 个后端前缀而前端用 30 个——管理端 RBAC 控制台在浏览器里
一直是坏的，而后端测试全绿（已修，D-184）。预期还会暴露同类问题，不能放到客户机器上调试。

具体步骤见 `go-live-plan-20260804.md` §3。核心退出条件：

- 四端每个页面都看到**真实数据**
- 浏览器 Network 面板里**不出现返回 `text/html` 的接口请求**
- `npm run check:deployment-env` / `check:openapi` 通过

阶段一同时要修的两个已知缺口（`go-live-plan` §3 步骤 5）：

- compose **没有任何 `mem_limit` / `cpus`**，五个容器抢 4 核
- 后端镜像**没有任何 JVM 堆参数**（`-Xmx`）

---

## 客户服务器（决定方案的硬事实）

Windows Server 2016 Standard / Xeon E-2314 **4 核 4 线程** / 32GB / 未激活 / 磁盘未知。

**结论：Windows Server 2016 上跑不了本项目的 Linux 容器栈，必须加 Hyper-V + Ubuntu 24.04 虚机。**
依据（均为微软官方，已查证）：

- LCOW 在 Windows Server 上**已弃用**，且本就要求 Server 1709+，2016 LTSC 不具备
- Docker Desktop 不支持 Windows Server
- WSL2 要求 build 19041（= Server 2022）
- Windows 容器的运行时 Mirantis Container Runtime 自 2023-04-30 起无支持无补丁
- 而 Ubuntu 22.04/24.04 在 Server 2016 宿主上是**官方全功能支持**的，LIS 内建

另一事实：**Windows Server 2016 扩展支持 2027-01-12 到期。**

---

## 会浪费新会话时间的坑（都踩过一次）

| 坑 | 症状 | 处理 |
| --- | --- | --- |
| **测试库被污染** | `OrderCaseGroupTests.migrationLeavesNoUngroupedOrDuplicateLegacyOrders` 失败（断言全库不变量） | 单跑过其它测试后必然发生。跑全量前先重建：<br>`docker exec ai-order-mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "DROP DATABASE IF EXISTS ai_order_platform_test;"` 然后 `bash scripts/ensure-test-database.sh` |
| **演示库被冒烟数据污染** | `demo:prepare` 报 `Duplicate entry ... patient_record` | `npm run demo:stop` → `DEMO_RESET_CONFIRM=RESET_DEMO_DATA npm run demo:reset` → `npm run demo:prepare` |
| **改了已应用的迁移** | Flyway 校验和不匹配 | 重建测试库 |
| **新增后端路径前缀** | 页面能打开但拿不到数据 | 必须**同时**改 `frontend/vite.config.ts` 与 `frontend/nginx.conf`，`check:deployment-env` 会拦 |
| **业务日期** | 容器默认 UTC，「今天」差 8 小时 | 一律用 `common/BusinessTime.today()`，禁止无参 `LocalDate.now()`（D-183） |
| MySQL 8.4 `VALUES()` 弃用告警 | 迁移时 WARN | 与既有迁移一致，忽略 |
| 演示环境接口路径 | 登录走 `/api/auth/login`，其余接口**不带** `/api` 前缀 | 冒烟脚本注意 |

## 常用命令

```bash
npm run test:backend                    # 后端全量（跑前先重建测试库）
npm run demo:prepare                    # 演示环境：起服务+灌数+校验
npm run demo:status / demo:stop
npm run check:deployment-env            # 时区固定 + 代理前缀一致性
npm run check:openapi
npm run build:frontend
```

TASK-034 六批各自的静态校验：
`check:task-034-authorization-baseline` / `-fine-grained-roles` / `-rbac-console` /
`-order-rules` / `-export-governance` / `-account-handover`

---

## 上线前的硬缺口（不是这几批的遗留，是项目本来就欠的）

| 缺口 | 现状 | 判断 |
| --- | --- | --- |
| **HTTPS** | `nginx.conf` 只有 `listen 80` | **硬门槛**。医生端传患者资料与病例照片，明文不该上线 |
| **备份** | 完全没有 | **硬门槛**。且必须做一次真实恢复演练 |
| 监控告警 | 无 | 至少容器存活 + 磁盘水位 + 备份成功与否 |
| 日志轮转 | 无 | 会撑爆磁盘 |
| UPS | 未知 | 客户自有机器当服务器，断电丢事务 |

## 上线前必须填的业务数据

**最要紧的是各产品标准制作周期。** 现在 `ordering_rule_config` 全是占位值，界面显示
「日期（待确认）」——但截图或口头转述后那三个字就掉了，剩一个看起来像承诺的日期。

配置入口：`PUT /ordering-rules/{ruleType}/{ruleKey}`，**改配置即可，不改代码不发版**。

---

## 不要做的事

- 不要改 A~F 六批已完成的实现，除非发现真实缺陷
- 生产库**不灌演示数据**
- 不留后门管理员账号，超管密码由客户本人现场设置
- **Task 8 保持 `NOT_READY`**，本次部署 ≠ 一期整体验收通过
- 不要顺手把 `App.vue` 里 `PENDING_DOCTOR_CONFIRM` 全替换（订单域与设计稿域同名不同义，见口径表）

## 待客户回复（阻塞项）

完整 20 项见 `customer-confirmation-checklist-20260804.md`。最阻塞的三条：

1. **磁盘容量/类型/RAID** —— 不知道就没法规划虚机磁盘与备份
2. **诊所从局域网还是公网访问** —— 决定是否需要公网 IP、域名、备案
3. **域名与 HTTPS 证书谁提供**

客户已回复的内容请回填到该清单里。
