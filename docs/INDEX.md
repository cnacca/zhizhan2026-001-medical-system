# 项目导航（新会话从这里开始）

状态：ACTIVE / 2026-08-25

## 一句话现状

一期四端功能主体已经部署到正式站，当前正式版本为
`7013b1434759df6ca77a65893dbdcf0129e9af7b`，自动发布 #32742027332 已通过后端 358 项测试、
release gates、前后端镜像校验、部署前 MySQL 备份、容器替换、健康检查和公网探针。
HTTPS、医生端中英文、管理端／客服端／生产审核端站内文件预览与 STL 3D 查看均已有上线证据。

这不等于一期总体验收完成。原 PRD V2 的 38 项当前基线为：

| 状态 | 数量 |
| --- | ---: |
| `PASS` | 29 |
| `PARTIAL` | 1 |
| `MISSING` | 0 |
| `EXTERNAL_ACCEPTANCE` | 8 |

Task 8 继续保持 `NOT_READY`。剩余工作主要是真实环境／运维验收和已确认的表外工程缺口；
AI-5 正式模板、标准工时、正式 AI Key／预算／告警接收人已由用户暂缓，在用户主动恢复前不再询问或催办。
这也不是继续重复开发已经上线的 HTTPS、医生端英文或 STL 查看器。

当前新增执行入口为 GOAL-037／TASK-039：先把医生下单从 6 个可见步骤精简为 4 步，再核对“推簧”目录映射；
完整 CRM／客户关怀提醒和 STL 直接打开 CAD／设计软件已由用户转入二期。该范围与原 PRD 38 项分账，
不改变 29／1／0／8 统计。

## 当前事实优先级

发生冲突时按以下顺序判断：

1. 当前正式发布运行、线上只读复验和当前代码／测试；
2. `docs/DELIVERY-GAP.md` 与 `acceptance.json.task8_readiness_gaps`；
3. `docs/acceptance/prd-v2-38-item-acceptance-audit-20260715.md` 的原 38 项逐项基线；
4. `STATUS.md`、`README.md`、旧 task／goal 和追加式 readiness 日志仅用于追溯。

不得用 2026-07 或 2026-08-11 的旧快照覆盖后续正式发布事实，也不得因为已经上线就把未做过的
恢复演练、回滚演练、真实 AI 验收、客户培训或总体验收写成完成。

## 当前优先级

| 优先级 | 事项 | 当前性质 |
| --- | --- | --- |
| P0 | 按 TASK-039 完成医生下单 6 → 4 步实现与回归 | 当前一期代码缺口，先做 |
| P1 | 在第 1 项关闭后核对并补齐“推簧”目录映射 | 当前一期目录准确性，后做 |
| P0 | 完成数据库恢复、MinIO 对象备份／恢复、发布回滚和监控告警演练 | 运维验收 |
| P1 | 用有分配任务的普通生产账号补 STL 3D 点击证据；完成大文件、弱网、跨设备和签名过期实测 | 真实账号／真实网络证据 |
| P1 | 正式发布后核对后端容器每订单文件限制为 50；完成弱网、跨设备和签名过期实测 | 生产配置／真实网络证据 |
| P1 | 实现客户追加要求的管理端 AI key 安全配置；key 不可明文回读 | 代码缺口，原 38 项表外 |
| P1 | 补容器资源限制、JVM 参数、日志轮转和双实例 WebSocket／Redis 验收 | 工程与运行保障 |
| P2 | 优化 GitHub checkout 全历史拉取并升级已弃用的 Actions | 发布效率，不阻塞当前功能 |
| P2 | 正式客户培训、运维移交和总体验收记录 | 最终交付证据 |
| 暂缓 | AI-5 正式模板、标准工时、正式 AI Key／预算上限／告警接收人；仅用户主动恢复后继续 | `USER_DEFERRED`，不主动询问 |

## 按任务找文件

| 你要做什么 | 先读 | 再读 |
| --- | --- | --- |
| 实施医生下单 6 → 4 步 | `tasks/TASK-039-doctor-order-simplification-and-catalog-mapping-20260825.md` | `docs/development/doctor-order-wizard-simplification-plan-20260825.md` |
| 看还差什么才能交付 | `docs/DELIVERY-GAP.md` | `acceptance.json` 的 `task8_readiness_gaps` |
| 看原 PRD 38 项 | `docs/acceptance/prd-v2-38-item-acceptance-audit-20260715.md` | `docs/acceptance/phase-one-customer-pm-confirmations.md` |
| 推进正式发布 | `docs/deployment/automatic-production-deployment.md` | `.github/workflows/deploy-production.yml` |
| 补真实部署验收 | `docs/deployment/task-9d81-production-deployment-acceptance.md` | `docs/operations/phase-one-rollback-runbook.md` |
| 补真实文件验收 | `docs/deployment/task-9d79-real-env-file-upload-acceptance.md` | `docs/deployment/8088-redeployment-checklist-20260811.md` 仅作历史缺陷参考 |
| 补真实 AI 验收 | `docs/deployment/task-9d80-ai-production-integration-acceptance.md` | `docs/acceptance/phase-one-customer-pm-confirmations.md` |
| 改订单状态或权限 | `docs/development/status-vocabulary.md` | 当前目标测试和 OpenAPI |
| 查历史决定 | `DECISIONS.md` 从最新条目往回读 | 对应 goal／task |

## 文件性质

### 当前有效

- `docs/INDEX.md`：当前导航入口。
- `docs/DELIVERY-GAP.md`：交付缺口的当前权威清单。
- `acceptance.json`：机器可读缺口和 RepoFrame 检查。
- `docs/acceptance/prd-v2-38-item-acceptance-audit-20260715.md`：原 38 项逐项口径。
- `docs/deployment/automatic-production-deployment.md`：现行生产发布方式。

### 追加式历史

- `STATUS.md`、`README.md`、`tasks/README.md`：顶部最新，后续大段为历史。
- `docs/deployment/readiness-checklist.md`、`docs/deployment/task-8-final-readiness-report.md`：保留历史锚点；
  若与本文件或 `DELIVERY-GAP.md` 冲突，以当前权威清单为准。

### 历史存档

- 旧 goal／task、`.repo-init/` 和 2026-07 阶段拆解用于追溯，不自动恢复为当前执行计划。

## 机器检查

```bash
npm run check:acceptance-baseline
npm run check:task8-readiness-gaps
npm run check:prd-v2-acceptance-recalibration
npm run check:repoframe-docs
npm run acceptance
```

涉及发布时追加：

```bash
npm run check:production-fast-deploy
npm run check:production-auto-deploy
npm run check:deployment-env
npm run check:deployment-ops-local-hardening
```

## 三条安全边界

1. 不因正式站可访问就把 Task 8 改为 READY；必须关闭真实环境、客户输入和最终交付证据。
2. 不为了补验收证据写正式业务数据强造订单、工单或文件；使用已有合适数据或经确认的测试环境。
3. 不把真实密钥、服务器地址、数据库／MinIO 凭据、证书私钥或客户隐私写入仓库。
