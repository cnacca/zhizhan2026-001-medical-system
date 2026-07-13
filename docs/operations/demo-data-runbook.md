# 客户演示数据运行手册

## 目的

本方案为客户演示提供独立、可重复恢复的脱敏数据环境。演示环境不使用主展示库、自动化测试库、真实患者、真实订单、真实密钥或正式对象存储 bucket。

## 独立演示环境

- 前端：`http://127.0.0.1:15173`
- 后端：`http://127.0.0.1:18080`
- 数据库：`ai_order_platform_demo`
- 数据库账号：`ai_order_demo`（仅本地占位密码）
- MinIO bucket：`ai-order-demo-private`
- AI：deterministic 本地模式，不调用真实模型

共享本地开发端口 `5173/8080`、主展示库 `ai_order_platform` 和测试库 `ai_order_platform_test` 均不作为演示造数目标。

## 一键准备

```bash
npm run demo:prepare
```

该命令会：

1. 启动 MySQL、Redis、MinIO 基础容器。
2. 创建独立 demo 数据库和 MinIO bucket。
3. 在 `18080/15173` 启动演示后端与前端。
4. 通过真实 API 生成 7 条不同阶段的脱敏订单。
5. 验证四端账号、订单状态、派工、返工、设计确认和完整订单。

## 演示订单

| 场景 | 主要演示内容 |
| --- | --- |
| 01-待客服审核 | 医生提交订单后等待客服初审 |
| 02-待生产审核 | 客服初审通过后等待生产审核 |
| 03-生产待办 | 工序已生成并派给演示生产员工 |
| 04-返工处理中 | 出检失败后存在待处理返工记录 |
| 05-待设计确认 | 设计稿已通过客服审核，等待医生确认 |
| 06-待发货 | 生产工序已完成，等待物流发货 |
| 07-已完成 | 已发货并由医生确认收货 |

每条订单的 `form_data` 都包含 `DEMO_DATA_V1` 标识和独立场景键。`demo:seed` 会先查询场景标识，已有场景不会重复创建。

## 常用命令

```bash
npm run demo:start
npm run demo:serve  # 需要在当前终端前台守护时使用
npm run demo:seed
npm run demo:check
npm run demo:status
npm run demo:stop
```

运行时日志和演示订单清单保存在 `.demo-runtime/`，该目录不会提交到 Git。

## 重置保护

重置仅允许作用于名称以 `_demo` 结尾的数据库和包含独立 `demo` 分段的 bucket。必须先停止演示服务并显式确认：

```bash
npm run demo:stop
DEMO_RESET_CONFIRM=RESET_DEMO_DATA npm run demo:reset
npm run demo:prepare
```

禁止把重置命令改为主库、测试库或正式环境数据库；禁止在脚本中填写真实患者、病例、客户隐私、生产密钥或真实 webhook。

## 演示前检查

1. 运行 `npm run demo:check`，确认 7 个场景全部通过。
2. 打开 `http://127.0.0.1:15173`，分别登录医生、客服、生产和管理端。
3. 按“待审核 -> 生产待办 -> 返工 -> 设计确认 -> 待发货 -> 已完成”顺序演示。
4. 演示结束后只停止前后端，不删除演示库；下次演示可直接复用或执行受保护的重置流程。
