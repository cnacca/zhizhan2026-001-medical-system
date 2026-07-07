# WebSocket / 通知生产 readiness 验收记录模板

状态：TEMPLATE_READY / PARTIAL。

本模板用于真实测试环境或正式环境具备后记录 WebSocket / 通知生产验收。当前只提供记录模板，不代表真实双实例 Redis 联调完成，不代表 Nginx HTTPS 已验收完成，不代表生产 webhook 已联调完成，不代表真实环境通知验收已完成。

## 基本信息

| 项目 | 记录 |
| --- | --- |
| 验收环境 | 待填写：测试环境 / 正式环境 |
| 验收日期 | 待填写 |
| 验收人员 | 待填写 |
| 代码版本 / commit | 待填写 |
| 后端实例数量 | 待填写 |
| Redis 实例 / 集群标识 | 待填写脱敏标识 |
| Nginx / HTTPS 网关标识 | 待填写脱敏标识 |
| WebSocket 访问地址 | 待填写脱敏标识，不填写真实域名或 IP |
| 通知 REST 访问地址 | 待填写脱敏标识，不填写真实域名或 IP |
| 生产 webhook 标识 | 待填写脱敏标识，不填写真实 webhook URL |
| 客户/PM 签字状态：待确认 | 待填写确认人和确认日期 |

## 前置检查

| 检查项 | 期望 | 结果 |
| --- | --- | --- |
| `npm run check:task9d76` | 本地 Nginx / Redis / WebSocket / REST evidence 静态检查通过。 | 待填写 |
| Notification target tests | `NotificationBroadcastTests`、`NotificationWebSocketTests`、`NotificationRestTests` 通过。 | 待填写 |
| `app.notification.redis-broadcast-enabled` | 测试 / 正式环境按部署策略启用或记录关闭原因。 | 待填写 |
| `NOTIFICATION_REDIS_CHANNEL` | 使用测试 / 正式环境独立 channel，不与本地开发混用。 | 待填写 |
| `APP_CORS_ALLOWED_ORIGIN` | 只允许正式前端 origin，不使用宽松通配。 | 待填写 |
| Nginx HTTPS WebSocket 网关 | `/ws/` 支持 HTTPS/WSS upgrade，保留 `Upgrade` 和 `Connection` header。 | 待填写 |
| 通知 REST 网关 | `/notifications` 命中后端，不落到前端 SPA fallback。 | 待填写 |
| 真实双后端实例 Redis 联调 | A 实例写入通知后，B 实例在线用户可收到广播。 | 待填写 |
| 心跳 / 重连压测 | 断线、重连、token 失效、短暂 Redis 抖动均有记录。 | 待填写 |
| 浏览器通知权限 | 明确是否启用浏览器 Notification 权限；未启用时记录产品决定。 | 待填写 |
| 完整业务页面联动 | 医生通知中心、客服协同、生产消息、账单 / 物流等页面联动通过。 | 待填写 |
| 生产 webhook 联调 | 若启用 AI 外部告警 webhook，记录脱敏 webhook 标识、签名、验签和防重放结果。 | 待填写 |
| 监控告警 | WebSocket 连接数、消息发送失败、Redis 错误、webhook 失败和死信告警已记录。 | 待填写 |

## 人工验收步骤

| 步骤 | 操作 | 期望 | 结果 |
| --- | --- | --- | --- |
| 1 | 使用正式部署参数启动两个后端实例、一个前端网关和 Redis。 | 两个后端实例均健康，Redis 可用。 | 待填写 |
| 2 | 医生登录并建立 WSS 连接。 | `/ws/connect?token=...` 成功 upgrade，连接归属当前医生。 | 待填写 |
| 3 | 在另一个后端实例触发医生通知。 | 医生通过 Redis 广播收到脱敏 payload。 | 待填写 |
| 4 | 断开 WebSocket 后触发通知。 | 离线通知写入 `user_notification`，重新登录后未读补偿可见。 | 待填写 |
| 5 | 标记单条已读和全部已读。 | 只更新当前用户通知，其他用户通知不受影响。 | 待填写 |
| 6 | 验证医生端 payload。 | 不包含内部工序、员工、入检/出检、工时、返工、绩效或内部备注。 | 待填写 |
| 7 | 验证心跳 / 重连。 | 短暂断线后可重连，重复连接不重复写入错误状态。 | 待填写 |
| 8 | 验证 Nginx HTTPS。 | HTTPS / WSS 正常，证书有效，HTTP 跳转策略明确。 | 待填写 |
| 9 | 验证生产 webhook。 | 仅在显式启用后发送，签名、验签、防重放和失败记录符合预期。 | 待填写 |
| 10 | 验证监控告警。 | 模拟 Redis / webhook / 后端异常后能看到告警或记录。 | 待填写 |
| 11 | 验证发布回滚。 | 回滚后旧连接处理策略、Redis channel 和未读补偿边界明确。 | 待填写 |

## 推荐命令

```bash
npm run check:websocket-notification-readiness-closure
npm run check:task9d76
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=NotificationBroadcastTests,NotificationWebSocketTests,NotificationRestTests test
npm run check:task8-readiness-gaps
npm run acceptance
```

真实环境可选验收：

```bash
# 使用真实环境的脱敏记录补充本模板。
# 不填写真实密钥、真实 webhook URL、真实主机、证书私钥、token 或客户隐私数据。
```

## 结论

| 项目 | 结论 |
| --- | --- |
| 真实双后端实例 Redis 联调 | 待填写 |
| 心跳 / 重连压测 | 待填写 |
| Nginx HTTPS WebSocket 网关 | 待填写 |
| 通知 REST 网关 | 待填写 |
| 浏览器通知权限 | 待填写 |
| 完整业务页面联动 | 待填写 |
| 生产 webhook 联调 | 待填写 |
| 监控告警 | 待填写 |
| 发布回滚 | 待填写 |
| 客户 / PM 结论 | 待确认 |

## 边界

- 不填写真实密钥。
- 不填写真实 webhook URL。
- 不填写真实服务器地址、真实域名、证书私钥、token、数据库密码、Redis 密码、MinIO 凭据、DeepSeek API Key 或客户隐私数据。
- 不代表真实双实例 Redis 联调完成。
- 不代表 Nginx HTTPS 已验收完成。
- 不代表生产 webhook 已联调完成。
- 不代表真实环境通知验收已完成。
- Task 8 仍保持 NOT_READY，直到真实双实例、HTTPS/WSS、通知页面联动、webhook、监控、客户 / PM 书面确认和真实环境验收关闭。
