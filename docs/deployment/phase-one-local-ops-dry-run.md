# 一期本地部署 / 运维 dry-run 检查

状态：LOCAL_DRY_RUN_READY / PARTIAL。

本文档用于记录本地 release / rollback dry-run 检查、备份 / 恢复 dry-run 模板第一段、日志留存 / 监控告警配置模板第一段，以及 compose / env / Nginx / healthcheck 静态检查。当前只做本地可验证补强，不代表真实服务器、HTTPS、备份恢复、监控告警或客户签字已完成。Task 8 仍保持 NOT_READY。

## 本地 release / rollback dry-run 检查

推荐命令：

```bash
npm run dry-run:phase-one-release-rollback
npm run check:deployment-env
npm run compose:phase-one:config
npm run check:task9d81
```

检查范围：

- `deploy/docker-compose.phase-one.yml` 使用 `SPRING_PROFILES_ACTIVE=prod`、关闭 bootstrap header、关闭角色兜底权限，并要求生产密钥和 bucket 外部注入。
- `deploy/env/phase-one.prod.example` 只保留占位示例，不提交真实密钥。
- `frontend/nginx.conf` 覆盖 `/api/`、`/notifications` 和 `/ws/` 代理。
- compose 中 MySQL、Redis、MinIO 保留 healthcheck，后端依赖基础设施 healthy 后再启动。
- 回滚 runbook、培训材料、readiness checklist 和 9D.81 模板能互相索引。

## 备份 / 恢复 dry-run 模板第一段

| 项目 | 本地 dry-run 记录 | 真实环境记录 |
| --- | --- | --- |
| 备份对象 | MySQL 数据库、MinIO 对象存储、部署配置 | 待填写 |
| 备份命令 | 待填写：真实环境外部执行，不写入仓库 | 待确认 |
| 备份保留周期 | 待填写 | 待确认 |
| 备份加密 | 待填写：只记录脱敏策略 | 待确认 |
| 恢复环境 | 待填写：必须是非生产恢复环境 | 待确认 |
| 恢复验证 | 登录、医生下单、客服初审、生产审核、文件预览和通知 smoke | 待确认 |
| 数据保护边界 | 不删除历史订单、不清 Docker volume、不删除 bucket、不 reset 迁移 | 待确认 |

当前只记录模板，不代表备份文件已经生成，不代表备份恢复演练已完成。

## 日志留存 / 监控告警配置模板第一段

| 项目 | 本地检查口径 | 真实环境记录 |
| --- | --- | --- |
| 应用日志 | 后端健康、鉴权失败、AI 审计、文件访问审计可通过应用日志 / 数据表追踪 | 待填写 |
| Nginx 日志 | `/api/`、`/notifications`、`/ws/` 代理访问日志需留存 | 待确认 |
| 数据库日志 | 慢查询、连接异常、迁移失败需留存 | 待确认 |
| 对象存储日志 | MinIO 上传、预览、下载和越权失败需留存 | 待确认 |
| 监控指标 | 服务存活、错误率、磁盘、数据库、Redis、MinIO、WebSocket、AI webhook | 待确认 |
| 告警接收人 | 待填写脱敏角色，不填写真实手机号、邮箱或 webhook | 待确认 |
| 演练记录 | 待填写：真实告警触发或模拟记录 | 待确认 |

当前只记录模板，不代表日志留存策略已经在真实环境生效，不代表监控告警已验收。

## Readiness 联动

- 真实环境部署验收仍以 `docs/deployment/task-9d81-production-deployment-acceptance.md` 为准。
- 发布回滚执行模板仍以 `docs/operations/phase-one-rollback-runbook.md` 为准。
- 客户培训和签收仍以 `docs/operations/phase-one-training-materials.md` 为准。
- 上线缺口汇总仍以 `docs/deployment/readiness-checklist.md` 和 `docs/deployment/task-8-final-readiness-report.md` 为准。

## 禁止事项

- 不填写真实服务器地址、数据库密码、Redis 密码、MinIO 凭据、DeepSeek API Key、webhook secret、证书私钥、token 或客户隐私数据。
- 不通过 `docker compose down -v`、清空 volume、删除 bucket、删除历史订单或绕过鉴权来模拟恢复。
- 不把本地 dry-run、compose config、模板检查或文档索引写成真实环境验收。
- 不把 deployment-infrastructure、operations-manuals、Task 8 或正式上线状态写成 READY。

## 当前结论

GOAL-020 / TASK-021 只完成本地部署 / 运维补强第一段：机器检查、release / rollback dry-run、备份 / 恢复模板、日志 / 监控模板和 readiness 联动。真实服务器、HTTPS、备份恢复、日志留存、监控告警、发布回滚演练、正式客户培训签收、客户 / PM 签字和真实环境验收仍为 `待填写` / `待确认`。
