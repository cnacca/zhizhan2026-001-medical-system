# 一期故障处理清单第一段

状态：FIRST_INCREMENT / NOT_READY。

本文档面向一期交付演示、内部验收和开发现场排障。当前只覆盖已知高频问题，不代替生产级值班手册。处理任何故障时，不要删除数据，不要 reset / clean，不要清 Docker volume，不要绕过鉴权，不要提交真实密钥。

## 登录失败

现象：

- 登录页提示账号或入口不匹配。
- 医生账号登录客服端、生产端或管理端被拒绝。

排查：

1. 确认选择的入口与账号角色一致。
2. 确认后端服务可访问。
3. 确认 `APP_AUTH_TOKEN_SECRET` 已配置。
4. 正式环境确认 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=false`。

不要做：

- 不要为了登录成功临时放宽角色校验。
- 不要在正式环境启用本地 bootstrap header。

## 后端不可用

现象：

- 前端能打开，但接口请求失败。
- 登录接口没有响应。

排查：

1. 本地开发先确认基础服务：

```bash
npm run compose:up
docker compose ps
```

2. 确认后端能启动：

```bash
npm run dev:backend
```

3. 确认 MySQL、Redis、MinIO 配置与 `.env.example` 一致。

## 上传失败

现象：

- 医生端选择文件后提示大小、类型或数量不符合要求。
- Multipart 上传无法完成。

排查：

1. 查看 `FILE_MAX_FILE_SIZE_BYTES`、`FILE_ALLOWED_CONTENT_TYPES`、`FILE_MAX_FILES_PER_ORDER`。
2. 确认 MinIO 可访问。
3. 确认当前文件属于当前医生本人订单。
4. 对断点恢复问题，优先查看同订单 pending Multipart 候选。

不要做：

- 不要绕过服务端文件限制。
- 不要把测试 bucket 和正式 bucket 混用。
- 不要直接暴露 MinIO object key。

## WebSocket 通知异常

现象：

- 通知中心列表可刷新，但实时通知没有到达。
- 页面显示 WebSocket 未连接。

排查：

1. 确认登录态 access token 有效。
2. 确认前端 `/ws/` 代理到后端 `/ws/connect`。
3. 本地单实例先看通知 REST 是否有未读记录。
4. 多实例场景需要确认 Redis 广播开关和频道。

当前限制：

- 真实双后端实例 Redis 联调、Nginx/HTTPS、心跳/重连压测仍未完成。

## AI 返回 deterministic

现象：

- AI 不调用真实 DeepSeek，返回 deterministic 安全占位结果。

排查：

1. 确认 `AI_PROVIDER=deepseek`。
2. 确认 `AI_DEEPSEEK_ENABLED=true`。
3. 确认 `DEEPSEEK_API_KEY` 通过外部注入。
4. 检查预算熔断、角色预算、模型预算和每用户小时限流。

不要做：

- 不要把真实 DeepSeek API Key 写入仓库。
- 不要为了演示关闭 AI 输出防护。
- 医生端 AI 不能泄露内部工序、员工、返工、工时或绩效。

## 账单物流问题

现象：

- 医生端看不到账单预览。
- 发货接口返回 409。

排查：

1. 确认账单文件已上传完成，并绑定到同一订单。
2. 确认账单文件预览权限允许医生读取。
3. 发货前确认订单最后一道工序已有 `OUT / PASS` 终检记录。
4. 付款状态当前仍未最终实现，遇到付款状态问题应进入客户 / PM 确认项。

## 返工终检问题

现象：

- 返工无法关闭。
- 终检报告生成失败。

排查：

1. 返工目标节点需要在失败检查之后重新出检通过。
2. 关闭返工需要选择 ACTIVE 的返工原因和责任类型。
3. 生成终检报告需要 `final-inspection:manage` 专用权限。
4. 终检 PDF 必须是同订单、已完成上传、`INTERNAL` 可见且 `application/pdf` 的文件。

## 绩效数据不符合预期

现象：

- 周期筛选后数据看起来不对。
- WORKER 看不到其他员工数据。

排查：

1. 统计按 `work_log.finished_at` 日期闭区间过滤。
2. WORKER 只能看本人。
3. ADMIN 才能按 `user_id` 查询指定员工。
4. 标准工时配置和完整公式仍未最终确认。

## Docker / Compose

现象：

- `npm run compose:phase-one:config` 失败。
- 后端镜像构建找不到 jar。

排查：

1. 先构建后端 jar：

```bash
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -am -DskipTests package
```

2. 再构建镜像：

```bash
docker build -f backend/platform-server/Dockerfile -t ai-order-platform-backend:phase-one-check .
docker build -f frontend/Dockerfile -t ai-order-platform-frontend:phase-one-check .
```

3. 检查 compose 配置：

```bash
npm run compose:phase-one:config
```

注意：

- `deploy/env/phase-one.prod.example` 只放占位示例。
- 真实密钥必须通过外部 secret 或不入库 env 文件注入。
- 不要清理 volume 来“修复”数据问题。

## 升级与回滚边界

当前尚未完成镜像仓库、备份恢复、日志留存、监控告警和正式发布回滚手册。正式上线前必须补齐这些内容，并完成真实测试 / 正式环境联调。
