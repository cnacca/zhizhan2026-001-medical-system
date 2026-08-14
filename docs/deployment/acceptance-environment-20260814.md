# 独立验收环境部署说明

## 用途与边界

此环境仅用于测试验收，公开展示四个本地演示账号的账号和密码。它不得复用正式环境数据库、Redis、MinIO 数据卷、认证密钥或真实账号，也不得替代正式上线验收。

- 前端域名：`https://acceptance.chinesedigitaldental.com`
- 文件域名：`https://acceptance-files.chinesedigitaldental.com`
- 前端回环端口：`127.0.0.1:18088`
- MinIO 回环端口：`127.0.0.1:19002`
- Compose 文件：`deploy/docker-compose.acceptance.yml`
- 环境变量模板：`deploy/env/acceptance.example`

四端凭据只通过验收前端的构建参数注入。仓库中的模板不保存具体密码，正式前端构建也不会启用 `VITE_ACCEPTANCE_MODE`。

## 首次启动

1. 在服务器创建仅管理员可读的 `.env`，按 `deploy/env/acceptance.example` 填写独立数据库、MinIO 和认证密钥。
2. 执行：

   ```bash
   docker compose --env-file .env -f deploy/docker-compose.acceptance.yml up -d --build
   ```

3. `permission-bootstrap` 会在后端健康后幂等授予客服角色 `clinic:create`，随后前端才启动。
4. 将两个域名反向代理到上述回环端口，并配置独立 HTTPS 证书。

## 验证

```bash
npm run check:acceptance-environment
docker compose --env-file .env -f deploy/docker-compose.acceptance.yml ps
curl -fsS https://acceptance.chinesedigitaldental.com/api/bootstrap/health
```

人工逐一选择医生端、客服端、生产端、管理端，确认页面展示对应验收账号，能够登录，并确认客服端能够建立客户档案。

## 隔离与下线

- 容器、网络和数据卷均使用 `ai-order-acceptance-*` 命名，不复用正式环境卷。
- 数据库、Redis 和 MinIO 不映射公网端口；前端和文件服务仅监听服务器回环地址，由 Nginx 暴露。
- 验收结束后先备份需要保留的验收证据，再执行 `docker compose ... down`。是否删除验收数据卷必须单独确认，不得直接执行 `down -v`。
- 下线时同时移除验收站 Nginx 配置和两个 DNS 记录，避免测试账号长期暴露。
