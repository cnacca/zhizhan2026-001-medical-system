# Task 1 代码评审

## Spec verdict

**CHANGES_REQUESTED**。持久化、订单参与人校验、当前用户待办过滤和生产消息的延迟 `MESSAGE_MENTIONED` 通知已具备基础实现，但仍违反“不扩大数据暴露”，且一个被允许的直接提及没有可处理待办。

## Quality verdict

**CHANGES_REQUESTED**。实现范围集中、迁移表的复合主键和未解决索引合适；但缺少按可见性裁剪提及数据，且缺少关键负向与审核时序测试，不能作为安全边界变更合入。

## Critical findings

1. 医生可通过两个路径获得内部人员信息，扩大了医生端数据暴露。
   - `GET /orders/{orderId}/message-mentionable-users` 向 `DOCTOR` 开放（`CollaborationController.java:45-51`），并直接返回订单全部生产节点受理人的 `user_id`、`display_name`、`user_type`（`CollaborationService.java:182-207`；DTO 为 `MentionableUserResponse.java:5-8`）。这把内部员工身份/角色暴露给医生。
   - 即使消息本身已通过医生可见性过滤，`queryMessages` / `loadMessage` 仍无条件附带全部 `mention_user_ids`（`CollaborationService.java:752-763`、`767-772`；`MessageResponse.java:6-17`）。例如生产人员发送 `ALL` 消息并 @ 另一位生产人员，审核通过后医生读取该消息即可拿到内部员工 ID。
   - 修复建议：医生端的可提及名单和消息提及字段必须只保留医生端被授权展示的身份；更稳妥的做法是按请求者角色生成响应，并拒绝医生对生产人员的 @，而不是把内部参与人清单复用于所有门户。

## Important findings

1. 医生可合法 @ 已分配生产人员，但该人员没有待办入口。
   - `validateMentionedUserIds` 允许订单流程节点的受理人被 @（`CollaborationService.java:775-789`，名单来源 `182-207`）。医生发送消息时却固定为 `CS_ONLY`（`CollaborationService.java:77-81`），仍立即发出 `MESSAGE_MENTIONED`。
   - 生产人员的待办查询只接受 `CS_WORKER` 或 `ALL`（`CollaborationService.java:871-873`），故该生产人员收到了 @ 通知，却无法在 `/messages/attention-items` 看到或解决待办，和待办闭环契约不一致。
   - 修复建议：按消息可见性限制可提及对象（医生直发仅客服），或明确调整消息可见性/待办过滤，使被允许且已被 @ 的生产人员能看到并处理该待办；两种行为都应有回归测试。

## Minor findings

无阻断性代码风格问题。

## 测试充分性

当前新增测试只覆盖“客服直接 @ 医生 -> 医生可见 -> 医生解决后列表为空”（`MessageDesignBillNotificationTests.java:82-114`）。现有生产消息测试未携带 `mention_user_ids`，因此没有验证审核前医生没有 `MESSAGE_MENTIONED` / 待办、审核批准后才出现通知与待办（`116-159`）。还缺少：

- 医生调用可提及人员和消息列表时不泄露客服/生产人员的 ID、姓名或角色；
- 非订单参与人、发送者和不可见对象的 @ 请求被拒绝；
- 非被 @ 用户不能 resolve，且该用户的待办数量不变化；
- 医生 @ 生产人员的最终产品行为（拒绝或可见且可解决）覆盖；
- 生产消息 @ 医生在审核前无 `MESSAGE_MENTIONED`、无医生待办，审核批准后才各出现一次。

未运行测试：本评审遵守“只读、不得执行会改变状态的命令”的任务限制。
