# 9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段

状态：completed-first-increment / PARTIAL。

## 目标

围绕 `file-upload-prod` 上线缺口，把测试 / 正式对象存储 bucket 隔离要求整理为本地可检查的 readiness 证据。

## 当前证据

| 项目 | 当前记录 |
| --- | --- |
| 本地开发 bucket | `.env.example` 使用 `MINIO_BUCKET=ai-order-private`，仅用于本地 smoke。 |
| 正式环境 bucket | `deploy/env/phase-one.prod.example` 使用 `MINIO_BUCKET=replace-with-phase-one-prod-bucket` 占位值。 |
| Compose 注入 | `deploy/docker-compose.phase-one.yml` 使用 `${MINIO_BUCKET:?inject production bucket name externally}`，要求正式环境外部注入。 |
| 文档边界 | `docs/deployment/phase-one-docker-env.md` 记录测试环境和正式环境必须使用不同 `MINIO_BUCKET`，正式值通过部署平台、CI/CD secret、服务器环境变量或不入库 env 文件注入。 |
| 机器检查 | `npm run check:task9d78` 检查本地 bucket 与正式占位 bucket 不同、正式 bucket 仍为占位示例、compose 要求外部注入，以及 readiness 文档已回写。 |

## 非目标

- 不接真实生产对象存储。
- 不启动真实生产环境。
- 不提交真实 MinIO access key、secret key、bucket 名称或生产 URL。
- 不提交真实 MinIO 密钥。
- 不把测试 / 正式 bucket 实际隔离写成已完成。
- 不替代客户 / PM 对 Multipart 限制和真实环境边界的书面确认。

## 验收命令

```bash
npm run check:task9d78
npm run check:task9d67
npm run check:deployment-env
npm run acceptance
```

可选联动：

```bash
npm run compose:phase-one:config
```

## 未完成原因

本轮只关闭“仓库内示例和文档口径可检查”的第一段。真实测试 bucket、真实正式 bucket、对象存储账号隔离、真实网络访问、客户 / PM 书面确认和生产部署联调仍需在真实环境具备后验收。

Task 8 仍保持 NOT_READY。
