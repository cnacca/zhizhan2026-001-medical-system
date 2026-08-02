# 9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段

状态：TEMPLATE_READY / PARTIAL。

本模板用于真实测试环境或正式环境具备后记录 AI 真实 key 与生产 webhook 联调验收。当前只提供记录模板，不代表真实 key 已联调完成，不代表生产 webhook 已联调完成。

GOAL-019 / TASK-020 本地治理补强已新增 `GET /ai/governance/local-hardening`、管理端 `/admin/ai-governance` 本地只读治理总览、AI-3 安全矩阵和 `npm run check:ai-production-governance-local-hardening`。这些只作为本地证据，不填写真实密钥、不填写真实 webhook URL、不替代客户 / PM 签字；真实 key / 生产 webhook 仍为待填写 / 待确认。

## 基本信息

| 项目 | 记录 |
| --- | --- |
| 验收环境 | 待填写：测试环境 / 正式环境 |
| 验收日期 | 待填写 |
| 验收人员 | 待填写 |
| 代码版本 / commit | 待填写 |
| 前端地址 | 待填写，禁止填写带密钥的 URL |
| 后端地址 | 待填写，禁止填写带密钥的 URL |
| DeepSeek key 来源 | 待填写脱敏标识，真实 key 只能外部注入 |
| 生产 webhook 渠道 | 待填写脱敏标识，不填写真实 webhook URL |
| webhook signing secret 来源 | 待填写脱敏标识，不填写真实密钥 |
| receiver signing secret 来源 | 待填写脱敏标识，不填写真实密钥 |
| 客户/PM 签字状态：待确认 | 待填写确认人和确认日期 |

## 前置检查

| 检查项 | 期望 | 结果 |
| --- | --- | --- |
| `AI_PROVIDER=deepseek` | 仅在真实验收环境显式启用 | 待填写 |
| `AI_DEEPSEEK_ENABLED=true` | 仅在真实验收环境显式启用 | 待填写 |
| `DEEPSEEK_API_KEY` | 通过部署平台或密钥系统外部注入，记录只写脱敏标识 | 待填写 |
| `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=true` | 仅在生产 webhook 验收环境显式启用 | 待填写 |
| `AI_EXTERNAL_ALERT_WEBHOOK_URL` | 外部注入，记录不填写真实 webhook URL | 待填写 |
| `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED=true` | 生产 webhook 验收时启用发送侧签名 | 待填写 |
| `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET` | 外部注入，记录不填写真实密钥 | 待填写 |
| `AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED=true` | 接收端验签 / 防重放验收时启用 | 待填写 |
| `AI_EXTERNAL_ALERT_RECEIVER_SIGNING_SECRET` | 外部注入，记录不填写真实密钥 | 待填写 |
| 预算与熔断策略 | 记录全局、角色、模型预算阈值和熔断开关 | 待填写 |
| 输出防护 | 记录敏感输出防护是否开启并留存脱敏证据 | 待填写 |

## 人工验收步骤

| 步骤 | 操作 | 期望 | 结果 |
| --- | --- | --- | --- |
| 1 | 在真实测试环境外部注入 `DEEPSEEK_API_KEY`，启用 `AI_PROVIDER=deepseek` 与 `AI_DEEPSEEK_ENABLED=true`。 | 应用从外部密钥读取真实 key，仓库、日志、文档不出现明文 key。 | 待填写 |
| 2 | 医生端发起 AI-3 公开问题。 | 返回公开上下文回答，审计记录模型、成本和 prompt 版本，不泄露内部生产信息。 | 待填写 |
| 3 | 医生端发起 AI-3 内部敏感问题。 | 返回 `SAFE_REFUSAL` 或等价安全拒绝，不外发内部敏感上下文。 | 待填写 |
| 4 | 触发一次 AI-5 或内部 AI 文本整理请求。 | 真实模型调用成功，输出经过防护策略检查，审计记录可追踪。 | 待填写 |
| 5 | 配置预算阈值并触发跨线场景。 | 写入预算治理审计，按策略生成内部通知或 outbox 待发送事实。 | 待填写 |
| 6 | 启用生产 webhook 发送配置并触发外部告警。 | outbox 从 `PENDING` 进入 `SENT` 或失败后进入可重试状态，记录不暴露 webhook URL。 | 待填写 |
| 7 | 启用发送侧签名。 | webhook 请求包含 timestamp、nonce、signature；验签基串为 `timestamp.nonce.requestBody`。 | 待填写 |
| 8 | 启用接收端验签 / 防重放。 | 正确签名返回成功，错误签名 / 过期 timestamp / 重放 nonce 被拒绝。 | 待填写 |
| 9 | 模拟 webhook 失败。 | attempts、last_error、DEAD_LETTER 边界可见且 last_error 保持脱敏。 | 待填写 |
| 10 | 复核日志、审计和文档。 | 不出现真实 key、真实 webhook URL、真实 token、prompt 原文或模型原始敏感响应。 | 待填写 |

## 推荐命令

```bash
npm run check:task9d71
npm run check:task9d80
npm run check:openapi
npm run acceptance
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests,AiGatewayDeepSeekTests,AiExternalAlertSenderTests test
```

## 结论

| 项目 | 结论 |
| --- | --- |
| 真实 key 联调 | 待填写 |
| AI-3 脱敏与拒答 | 待填写 |
| AI-5 文本整理 | 待填写 |
| 预算 / 熔断 / 输出防护 | 待填写 |
| 生产 webhook | 待填写 |
| 发送侧签名 | 待填写 |
| 接收端验签 / 防重放 | 待填写 |
| 客户 / PM 结论 | 待确认 |

## 边界

- 不填写真实密钥。
- 不填写真实 webhook URL。
- 不填写真实 access key、secret key、token、长期签名 URL、客户隐私数据、prompt 原文或模型原始敏感响应。
- 不代表真实 key 已联调完成。
- 不代表生产 webhook 已联调完成。
- 不代表生产外部告警已联调完成。
- Task 8 仍保持 NOT_READY，直到真实环境联调、客户 / PM 书面确认和生产部署验收关闭。
