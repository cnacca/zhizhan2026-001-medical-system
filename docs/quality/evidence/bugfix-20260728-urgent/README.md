# 2026-07-28 三项紧急缺陷浏览器验收证据

验收环境：隔离演示前端 `15173` / 后端 `18080`，使用医生、客服、生产、管理员四类演示账号按页面真实点击。

## 验收结果

- 医生端：上传 STL 与 PDF 后删除 PDF，页面提示已从订单移除；进入复核提交后只显示 `1 个（STL 1）`。
- 生产端：订单 `ORD20260728-9A7E186618` 的消息读取与发送请求均返回 200；消息 `#10` 进入待审核。
- 管理端生产审核：输入 `9A7E` 后无需回车，待审核列表由 6 单即时过滤为 1 单。
- 管理端沟通中心：左侧显示待处理订单与生产待审数量，输入 `9A7E` 后仅保留目标订单；消息 `#10` 审核接口返回 200 并显示已审核通过。

## 截图

1. `01-doctor-file-deleted.png`：医生删除 PDF 后只剩 STL。
2. `02-doctor-review-only-one-file.png`：后续复核环节只显示 1 个 STL。
3. `03-production-message-pending-review.png`：生产端消息发送成功并处于待审核。
4. `04-admin-production-review-live-search.png`：生产审核即时模糊搜索只剩 1 单。
5. `05-admin-communication-pending-orders.png`：沟通中心左侧恢复待处理订单与生产待审。
6. `06-admin-communication-search.png`：沟通中心搜索定位目标订单。
7. `07-admin-approved-production-message.png`：管理员审核通过生产消息。
