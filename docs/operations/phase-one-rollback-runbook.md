# 一期发布回滚手册本地模板

状态：TEMPLATE_READY / PARTIAL。

本文档用于记录一期发布前检查、发布异常处置和回滚演练模板。当前只是本地模板，不填写真实服务器地址、不填写真实密钥、不填写真实仓库凭据、不记录客户私有数据，不代表真实发布回滚演练完成。Task 8 仍保持 NOT_READY。

GOAL-020 / TASK-021 已补本地 release / rollback dry-run 检查，入口为 `docs/deployment/phase-one-local-ops-dry-run.md` 和 `npm run dry-run:phase-one-release-rollback`。本阶段把备份 / 恢复 dry-run 模板第一段、日志留存 / 监控告警配置模板第一段与 9D.81 readiness 联动，但不代表真实发布回滚演练完成。

## 使用边界

- 适用范围：一期测试环境或正式环境发布前的本地 runbook 模板。
- 当前状态：只完成文档模板和机器检查，本仓库未执行真实发布回滚演练。
- 真实环境字段：全部保持 `待填写` / `待确认`，由部署负责人在外部安全系统或交付记录中填写。
- 禁止事项：不删除数据库、不清 Docker volume、不绕过鉴权、不提交真实密钥、不把本地 compose 检查写成真实上线验收。

## 发布前检查

| 检查项 | 本地入口 | 真实环境记录 | 当前状态 |
| --- | --- | --- | --- |
| 代码与文档检查 | `npm run acceptance`、`git diff --check` | 待填写 | 待确认 |
| 部署配置静态检查 | `npm run compose:phase-one:config`、`npm run check:deployment-env` | 待填写 | 待确认 |
| 权限与脱敏回归 | `npm run check:auth-datascope-prod-closure` | 待填写 | 待确认 |
| 文件上传回归 | `npm run check:task9d77`、`npm run check:task9d79` | 待填写 | 待确认 |
| WebSocket / 通知回归 | `npm run check:websocket-notification-readiness-closure` | 待填写 | 待确认 |
| 操作手册 / 培训材料 | `npm run check:operations-rollback-training-closure` | 待填写 | 待确认 |
| 客户 / PM 签字 | 不适用本地命令 | 待填写 | 待确认 |

## 回滚触发条件

- 发布后医生端出现内部状态、工序、员工、返工、工时、绩效或内部附件泄露。
- 登录、下单、文件上传、客服初审、生产审核、入检 / 出检、终检、物流、确认收货任一 P0 主链路无法继续。
- 正式环境权限门禁被放宽，例如 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=true` 或 `APP_AUTH_ALLOW_ROLE_FALLBACK=true`。
- 数据库迁移、对象存储、Redis、WebSocket、AI webhook 或 Nginx HTTPS 出现影响主链路的生产故障。
- 监控告警、日志留存、备份恢复演练证据缺失时，不进入正式发布。

## 回滚步骤

1. 发布负责人宣布进入回滚窗口，记录时间、版本、影响范围和当前负责人。
2. 暂停继续发布和高风险操作，保留服务日志、数据库状态和对象存储证据。
3. 切回上一版镜像或上一版 compose 配置；真实镜像 tag、仓库地址和执行人保持 `待填写`。
4. 确认数据库是否发生不可逆迁移；如涉及数据结构变化，先停下来由负责人判断，不擅自删除数据或 reset 迁移。
5. 用最小 smoke 复核登录、医生下单、客服初审、生产审核、通知、账单物流和医生端脱敏。
6. 记录回滚结果、残留风险、是否需要客户告知和后续修复任务。

## 数据保护

- 回滚前必须先确认数据库备份和对象存储快照策略；当前真实备份路径为 `待填写`。
- 不允许通过 `docker compose down -v`、清空 volume、删除 bucket 或手工删历史订单来恢复服务。
- 不允许在仓库中记录真实数据库密码、MinIO 密钥、DeepSeek API Key、webhook secret、证书私钥或客户隐私。
- 真实备份恢复演练仍为 `待确认`；本模板不代表备份恢复演练完成。

## 证据记录模板

| 项目 | 记录 |
| --- | --- |
| 环境 | 待填写 |
| 发布版本 / 镜像 tag | 待填写 |
| 回滚版本 / 镜像 tag | 待填写 |
| 发布负责人 | 待填写 |
| 回滚负责人 | 待填写 |
| 回滚开始时间 | 待填写 |
| 回滚结束时间 | 待填写 |
| 数据库备份状态 | 待确认 |
| 对象存储快照状态 | 待确认 |
| 监控告警状态 | 待确认 |
| 客户 / PM 通知状态 | 待确认 |
| 结论 | 待确认 |

## 当前阻塞

- 真实服务器、HTTPS、镜像仓库、备份恢复、日志留存、监控告警和发布回滚演练仍未验收。
- 客户 / PM 签字仍未完成。
- 本文档只提供本地模板，不代表真实发布回滚演练完成。
