# 9D.81 部署真实环境 smoke / HTTPS / 备份监控验收记录

状态：PRODUCTION_DEPLOYMENT_VERIFIED / PARTIAL（2026-08-25 校准）。

本记录最初是待填写模板。正式服务器部署、HTTPS、自动发布、部署前 MySQL 备份生成和公网健康探针
现已有真实运行证据；备份恢复、MinIO 对象备份／恢复、日志留存、监控告警和发布回滚仍未验收完成。

GOAL-020 / TASK-021 已补本地 dry-run 补强：`docs/deployment/phase-one-local-ops-dry-run.md`、`npm run check:deployment-ops-local-hardening` 和 `npm run dry-run:phase-one-release-rollback`。该补强只检查本地 release / rollback、备份 / 恢复模板、日志 / 监控模板和 compose / env / Nginx / healthcheck 静态边界；真实环境字段仍为 `待填写` 或 `待确认`，不代表真实环境验收完成。

## 2026-08-24 正式运行证据

| 项目 | 已核实记录 |
| --- | --- |
| 验收环境 | 正式环境 |
| 代码版本 | `7013b1434759df6ca77a65893dbdcf0129e9af7b` |
| 自动发布 | GitHub Actions `Deploy production` #32742027332，`success`，10m21s |
| 发布模式 | `full`；D-203 首次发布包含工作流／脚本，未误走前端快速通道 |
| 前端 | `https://chinesedigitaldental.com/` 返回 200 |
| 后端 | `/api/bootstrap/health` 返回 200 / `status=ok` |
| HTTPS／规范入口 | 公网登录 Origin 与规范重定向探针通过 |
| 自动化 | 后端 358 项、release gates、不可变镜像和 SHA-256 校验通过 |
| MySQL 备份 | 完整发布前生成 `mysql.sql.gz` 并通过 gzip 与最小尺寸校验 |
| 回滚镜像 | 发布前后端／前端镜像标签已生成；未执行真实回滚演练 |
| 正式业务数据 | 本次未修改业务数据；部署脚本只执行发布流程和备份 |

本节不记录服务器地址、密钥、备份路径或客户隐私。MySQL 备份文件“成功生成”不等于恢复演练通过，
也不覆盖 MinIO 对象备份。

## 基本信息

| 项目 | 记录 |
| --- | --- |
| 验收环境 | 待填写：测试环境 / 正式环境 |
| 验收日期 | 待填写 |
| 验收人员 | 待填写 |
| 代码版本 / commit | 待填写 |
| 镜像版本 / tag | 待填写 |
| 前端访问地址 | 待填写脱敏标识，不填写真实服务器地址 |
| 后端访问地址 | 待填写脱敏标识，不填写真实服务器地址 |
| Docker Compose 配置来源 | 待填写 |
| Nginx 配置来源 | 待填写 |
| HTTPS 证书来源 | 待填写脱敏标识，不填写证书私钥 |
| 镜像仓库 | 待填写脱敏标识 |
| 客户/PM 签字状态：待确认 | 待填写确认人和确认日期 |

## 前置检查

| 检查项 | 期望 | 结果 |
| --- | --- | --- |
| `spring.profiles.active=prod` | 正式环境启用 prod profile | 待填写 |
| `APP_AUTH_TOKEN_SECRET` | 真实密钥必须外部注入，记录只写脱敏标识 | 待填写 |
| `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=false` | 正式环境关闭本地烟测 header | 待填写 |
| `APP_AUTH_ALLOW_ROLE_FALLBACK=false` | 正式环境关闭角色兜底权限 | 待填写 |
| `MINIO_ACCESS_KEY` | 外部注入，记录不填写真实密钥 | 待填写 |
| `MINIO_SECRET_KEY` | 外部注入，记录不填写真实密钥 | 待填写 |
| `MINIO_BUCKET` | 测试 / 正式 bucket 独立 | 待填写 |
| `DEEPSEEK_API_KEY` | 若启用真实模型，必须外部注入 | 待填写 |
| HTTPS | 证书有效、强制 HTTPS、HTTP 跳转策略明确 | 待填写 |
| Nginx | `/api/`、`/ws/`、`/notifications` 代理命中后端 | 待填写 |
| Docker Compose | 后端、前端、MySQL、Redis、MinIO 依赖关系正确 | 待填写 |
| 数据库备份 | 备份计划、保留周期、加密与存储位置已记录 | 待填写 |
| 日志留存 | 应用日志、Nginx 日志、审计日志留存策略已记录 | 待填写 |
| 监控告警 | 服务存活、错误率、磁盘、数据库、Redis、MinIO 告警已记录 | 待填写 |
| 发布回滚 | 回滚镜像、数据库回滚边界和负责人已记录 | 待填写 |

## 人工验收步骤

| 步骤 | 操作 | 期望 | 结果 |
| --- | --- | --- | --- |
| 1 | 使用正式部署参数渲染 Docker Compose。 | 配置可解析，所有必填生产变量均外部注入。 | 待填写 |
| 2 | 拉取或构建后端、前端镜像。 | 镜像 tag 可追溯到代码 commit，不使用本地临时 tag 作为正式版本。 | 待填写 |
| 3 | 启动真实测试环境。 | 后端健康检查、前端首页、数据库、Redis、MinIO 均可用。 | 待填写 |
| 4 | 验证 HTTPS。 | 证书有效，HTTP 到 HTTPS 策略明确，浏览器无证书错误。 | 待填写 |
| 5 | 验证 Nginx API 代理。 | `/api/` 请求命中后端，不落到前端 SPA fallback。 | 待填写 |
| 6 | 验证 WebSocket / 通知代理。 | `/ws/` upgrade 成功，`/notifications` REST 正常返回。 | 待填写 |
| 7 | 运行 12 步主链路 smoke。 | 医生、客服、生产、管理入口和关键链路可达。 | 待填写 |
| 8 | 验证数据库备份。 | 能生成备份文件，记录脱敏备份编号、时间、负责人。 | 待填写 |
| 9 | 验证备份恢复演练。 | 在非生产恢复环境完成恢复，记录脱敏恢复库标识。 | 待填写 |
| 10 | 验证日志留存。 | 应用、Nginx、审计日志可查询，且不输出真实密钥。 | 待填写 |
| 11 | 验证监控告警。 | 触发或模拟服务异常、磁盘、数据库、Redis、MinIO 告警，确认接收人。 | 待填写 |
| 12 | 验证发布回滚。 | 明确回滚版本、回滚步骤、数据库变更边界和负责人。 | 待填写 |

## 推荐命令

```bash
npm run check:task9d69
npm run compose:phase-one:config
npm run check:deployment-env
npm run check:task9d76
npm run check:task9d81
npm run acceptance
```

可选本地辅助 smoke：

```bash
npm run smoke:task9d62
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
```

## 结论

| 项目 | 结论 |
| --- | --- |
| 真实服务器部署 | PASS：自动发布与容器健康通过 |
| HTTPS | PASS：正式域名和公网探针通过 |
| Nginx API / WebSocket / 通知代理 | PARTIAL：API／登录探针通过，双实例 WebSocket 仍待验 |
| Docker Compose | PASS：正式发布配置渲染与部署通过 |
| 镜像分发 | PASS：校验后的发布包上传；当前未使用远程镜像仓库 |
| 数据库备份 | PASS（生成）：完整发布前 MySQL gzip 备份通过校验 |
| 备份恢复演练 | PARTIAL：未完成真实恢复 |
| MinIO 对象备份／恢复 | PARTIAL：无完成证据 |
| 日志留存 | PARTIAL：无正式保留策略验收记录 |
| 监控告警 | PARTIAL：无正式触发／接收记录 |
| 发布回滚 | PARTIAL：有回滚镜像标签，未执行真实回滚演练 |
| 客户 / PM 结论 | 待确认 |

## 边界

- 不填写真实密钥。
- 不填写真实服务器地址。
- 不填写真实数据库密码、Redis 密码、MinIO 凭据、DeepSeek API Key、证书私钥、token 或客户隐私数据。
- 真实服务器部署与 HTTPS 已有当前正式运行证据。
- 不代表数据库／MinIO 恢复、日志留存、监控告警或发布回滚已验收完成。
- Task 8 仍保持 NOT_READY，直到真实环境部署、客户 / PM 书面确认和生产运行验收关闭。
