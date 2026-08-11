# 一期 Docker 与环境变量隔离

状态：FIRST_INCREMENT / NOT_READY。

本文件记录 9D.69 部署基础设施第一段。目标是让一期交付具备可检查的 Docker 镜像和 compose 环境隔离骨架，不代表已经完成正式生产上线。

## 边界

- 不提交真实密钥、真实数据库密码、真实 MinIO 密钥、DeepSeek API Key 或 webhook secret。
- 不改生产真实配置。
- 不删除数据、不重置迁移、不清 Docker volume。
- 不在正式环境启用 `X-Bootstrap-*` 本地兼容路径。
- 不在正式环境启用角色兜底权限；带权限码的接口必须由 Bearer token 中的权限码放行。

## 镜像

- 后端镜像：`backend/platform-server/Dockerfile`
  - 使用已构建的 `platform-server` Spring Boot jar。
  - 构建镜像前先执行 `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -am -DskipTests package`。
  - 运行时使用 JDK 21 JRE。
  - 默认 `SPRING_PROFILES_ACTIVE=prod`。
  - `APP_AUTH_TOKEN_SECRET` 必须外部注入。
- 前端镜像：`frontend/Dockerfile`
  - 构建 Vue 静态资源。
  - 用 Nginx 提供静态文件。
  - `/api/` 反向代理到后端。
  - `/ws/` 支持 WebSocket upgrade。

## 环境隔离

- 测试环境和正式环境使用不同 MYSQL_DATABASE。
- 测试环境和正式环境使用不同 MINIO_BUCKET。
- 测试环境和正式环境使用不同 `APP_AUTH_TOKEN_SECRET`。
- MinIO 存储读写使用容器内 `MINIO_INTERNAL_ENDPOINT=http://minio:9000`；签名 URL 使用浏览器可达的 `MINIO_PUBLIC_ENDPOINT`。Host 参与 AWS V4 签名，禁止先用内部地址签名再字符串替换。
- 一期 compose 只暴露 MinIO API 的 `MINIO_PUBLIC_PORT`，不暴露管理控制台。正式环境优先使用独立 HTTPS 文件域名；若临时使用 `http://服务器IP:9000`，必须同步开放云防火墙 / 系统防火墙并完成浏览器实测。
- `APP_CORS_ALLOWED_ORIGIN` 必须填写用户实际访问前端的完整 origin（协议 + 主机 + 端口），例如 `http://服务器IP:8088`；只填 localhost 会让登录在控制器前被 403 拒绝。
- APP_AUTH_TOKEN_SECRET 必须外部注入，不能使用本地 smoke 默认值。
- APP_AUTH_ALLOW_ROLE_FALLBACK 必须为 false，不能让角色-only token 绕过权限码校验。
- `.env.example` 只保留本地 smoke 默认值。
- `deploy/env/phase-one.prod.example` 只保留占位示例，正式值必须通过部署平台、CI/CD secret、服务器环境变量或不入库的 env 文件注入。

## 正式环境默认关闭能力

- `AI_PROVIDER=deterministic`
- AI_DEEPSEEK_ENABLED 默认 false
- `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=false`
- `AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false`
- `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED=false`
- `AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED=false`

## 验收命令

```bash
npm run check:task9d69
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -am -DskipTests package
docker build -f backend/platform-server/Dockerfile -t ai-order-platform-backend:phase-one-check .
docker build -f frontend/Dockerfile -t ai-order-platform-frontend:phase-one-check .
docker compose -f deploy/docker-compose.phase-one.yml config
docker compose -f deploy/docker-compose.phase-one.yml --env-file deploy/env/phase-one.prod.example config
```

等价 npm 入口：

```bash
npm run compose:phase-one:config
```

后续正式上线前还需要补 Nginx HTTPS、镜像仓库、备份恢复演练、日志留存、监控告警和真实测试/正式环境联调。

8088 本轮重新部署和复测步骤见 `docs/deployment/8088-redeployment-checklist-20260811.md`。代码修复或 compose 渲染通过不等同于线上已恢复。
