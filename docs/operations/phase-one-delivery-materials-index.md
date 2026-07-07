# 一期交付材料索引第一段

状态：FIRST_INCREMENT / NOT_READY。

本文档用于汇总一期交付材料入口。当前只是第一段索引，方便后续客户验收、内部培训和新会话接手。Task 8 仍保持 NOT_READY。

2026-07-07 部署 / 运维本地补强由 `GOAL-020` / `TASK-021` 承接，新增 `check:deployment-ops-local-hardening`、`dry-run:phase-one-release-rollback` 和 `docs/deployment/phase-one-local-ops-dry-run.md`。本阶段只代表本地 dry-run、备份 / 恢复模板、日志 / 监控模板和 readiness 联动，不代表真实环境验收完成。

2026-07-07 操作手册 / 回滚 / 培训材料本地收口由 `GOAL-015` / `TASK-016` 承接，新增 `check:operations-rollback-training-closure`。本阶段新增回滚手册和培训材料模板，但不代表真实发布回滚演练、客户培训签收或客户 / PM 签字完成。

## 核心项目文档

| 材料 | 路径 | 用途 | 当前状态 |
| --- | --- | --- | --- |
| 项目状态 | `STATUS.md` | 当前进度、未完成事项、已知问题、下一步。 | 持续更新 |
| 项目目标 | `PROJECT.md` | 一期目标、用户、范围、非目标和业务规则。 | 持续更新 |
| 决策记录 | `DECISIONS.md` | 产品和技术关键决策。 | 持续更新 |
| 任务清单 | `tasks/README.md` | Task 8 / 9D 小闭环任务记录。 | 持续更新 |
| 运行入口 | `README.md` | 本地启动、检查命令、验收入口。 | 持续更新 |

## 验收材料

| 材料 | 路径 | 用途 | 当前状态 |
| --- | --- | --- | --- |
| 12 步主链路客户验收版 | `docs/acceptance/phase-one-main-chain-customer-acceptance.md` | 给客户 / PM 阅读的 12 步 PASS/FAIL 清单。 | FIRST_INCREMENT |
| Task 8 验收矩阵 | `docs/acceptance/task-8-acceptance-matrix.md` | 记录 PASS / PARTIAL / BLOCKED / NOT_STARTED。 | 持续更新 |
| 前端范围对齐 | `docs/acceptance/phase-one-frontend-alignment.md` | 判断前端是否符合一期范围。 | 持续更新 |
| 前端任务范围 | `docs/acceptance/phase-one-frontend-task-scope.md` | 后续前端任务拆分和入口边界。 | 持续更新 |
| 回归记录 | `docs/acceptance/task-8-regression-record.md` | 历史回归和 smoke 记录。 | 需继续补 |

## 部署与运维材料

| 材料 | 路径 | 用途 | 当前状态 |
| --- | --- | --- | --- |
| Task 8 Final Readiness Report | `docs/deployment/task-8-final-readiness-report.md` | 汇总上线前缺口和最小闭环建议。 | 持续更新 |
| Readiness Checklist | `docs/deployment/readiness-checklist.md` | 正式上线前 checklist。 | 持续更新 |
| Docker/env 隔离说明 | `docs/deployment/phase-one-docker-env.md` | 一期 Docker、compose 和环境变量边界。 | FIRST_INCREMENT |
| 本地部署 / 运维 dry-run | `docs/deployment/phase-one-local-ops-dry-run.md` | 本地 release / rollback dry-run、备份 / 恢复模板、日志 / 监控模板和 readiness 联动。 | LOCAL_DRY_RUN_READY / PARTIAL |
| 一期 compose | `deploy/docker-compose.phase-one.yml` | 一期 full-stack compose 骨架。 | FIRST_INCREMENT |
| 生产 env 示例 | `deploy/env/phase-one.prod.example` | 只放占位示例，真实值外部注入。 | FIRST_INCREMENT |

## 操作手册

| 材料 | 路径 | 用途 | 当前状态 |
| --- | --- | --- | --- |
| 操作手册 | `docs/operations/phase-one-role-operation-manual.md` | 医生端、客服端、生产端、管理端最小操作路径。 | FIRST_INCREMENT |
| 故障处理清单 | `docs/operations/phase-one-troubleshooting-guide.md` | 登录、上传、通知、AI、Docker / Compose 等常见问题。 | FIRST_INCREMENT |
| 发布回滚手册 | `docs/operations/phase-one-rollback-runbook.md` | 发布前检查、回滚触发条件、回滚步骤和数据保护模板。 | TEMPLATE_READY / PARTIAL |
| 培训材料 | `docs/operations/phase-one-training-materials.md` | 四端培训大纲、讲师检查点、签到和客户 / PM 签收模板。 | TEMPLATE_READY / PARTIAL |
| 交付材料索引 | `docs/operations/phase-one-delivery-materials-index.md` | 汇总交付材料入口和状态。 | FIRST_INCREMENT |

## 客户 / PM 确认项

以下事项仍不能仅靠开发关闭，需要客户 / PM 书面确认：

- 动态表单最终字段。
- AI-5 生产备注模板。
- 标准工时和绩效完整公式。
- 付款状态一期最小口径。
- Multipart 文件限制最终值。
- 是否接入真实物流平台、真实电子签章和生产 webhook。

## 当前不能宣称完成的内容

- 不能宣称 Task 8 完成。
- 不能宣称已正式上线。
- 不能宣称客户 / PM 已签字。
- 不能宣称真实支付系统、真实物流平台、真实电子签章已接入。
- 不能宣称真实弱网 / 跨设备上传、Nginx HTTPS、备份恢复、日志留存和监控告警已验收。

## 推荐交付顺序

1. 先跑机器检查，确认当前仓库基础健康。
2. 按 `docs/acceptance/phase-one-main-chain-customer-acceptance.md` 演示 12 步主链路。
3. 按 `docs/operations/phase-one-role-operation-manual.md` 做四端培训。
4. 按 `docs/operations/phase-one-troubleshooting-guide.md` 处理演示现场问题。
5. 把客户 / PM 确认项单独签字归档。
