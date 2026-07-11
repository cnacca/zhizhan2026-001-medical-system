# Task 1 后端订单参与人 @ 提及与待办 API：当前状态

## 实施范围

- 新增 `V38__order_message_mentions.sql`，建立 `order_message_mention`，含按用户未解决待办索引及消息/用户外键。
- 新增可提及参与人、消息待办响应 DTO；消息请求与响应支持 `mention_user_ids`。
- 新增可提及人员、当前用户未解决待办、当前用户解决待办的控制器和服务路径。
- 仅允许订单医生、客服和已指派生产人员被提及；发送者会从持久化提及名单中排除。
- 生产端消息先进入审核；仅审核通过后才发出 `MESSAGE_MENTIONED` 通知，避免审核前通知医生。
- 为现有协同集成测试补充：直接提及持久化、医生待办可见、且仅该医生可解决的闭环测试；夹具补充外键所需的固定用户。

## TDD 记录

1. 先添加 `directMentionPersistsAttentionItemAndOnlyMentionedUserCanResolveIt`。
2. 运行指定命令，得到预期红灯：`$.data.mention_user_ids[0]` 不存在。
3. 完成最小实现后，重新运行同一指定命令。

## 当前最小验证

命令：

```sh
scripts/with-jdk21.sh mvn -f backend/platform-server/pom.xml -Dtest=MessageDesignBillNotificationTests test
```

结果：通过。Surefire 报告 `Tests run: 10, Failures: 0, Errors: 0, Skipped: 0`；Flyway 已在本地测试数据库应用 V38。

## 停止与风险说明

父任务要求在定向测试通过后立即停止扩展，因此未继续新增以下独立回归覆盖：

- 非订单参与人或发送者的提及请求；
- `message-mentionable-users` 的参与人列表；
- 生产消息在审核前没有 `MESSAGE_MENTIONED`、审核通过后才产生该通知；
- 非被提及用户尝试解决待办。

当前不存在编译或定向测试阻塞；但上述未补充的边界回归测试是交接关注点，故状态为 `DONE_WITH_CONCERNS`。未改前端、Task 8 状态、其他协作者已有改动，也未提交或推送。
