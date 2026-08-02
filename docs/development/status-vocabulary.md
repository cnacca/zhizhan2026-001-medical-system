# 状态值口径表

状态：ACTIVE / 2026-08-02。检查入口：`npm run check:status-vocabulary`。

## 为什么需要这份表

2026-08-02 排查演示数据缺陷时，`PENDING_DOCTOR*` 一个概念在仓库里出现了**四种拼写**，且分属两个不同的域；`orders.internal_status` 列里同时存在内部值与对外值。逐层定位才发现根因不是某一处写错，而是**没有一份写明"哪个域有哪些合法值"的东西**，于是每个人在各自的位置各写各的。

由此产生的缺陷有一个共同特征：**不抛错，只让数据悄悄不完整**，最终表现为"某个模块没有数据""某个按钮不出现"——与客户 CHK 反馈的现象同源。

## 三个层次，不要混用

订单状态有三层，各有各的值域。**混用不会报错，只会让界面显示错**。

```
InternalOrderStatus  ──投影──▶  ExternalOrderStatus  ──前端 statusMap──▶  医生 UI 状态
   （13 个值）                      （7 个值）                （另一套词汇）
   orders.internal_status          orders.external_status    仅存在于前端，不入库
```

### 第一层：内部状态 `InternalOrderStatus`

权威定义：`backend/platform-server/src/main/java/com/yuri/aiorder/order/status/InternalOrderStatus.java`
落库列：`orders.internal_status`

| 内部状态 | 投影到的对外状态 |
| --- | --- |
| `DRAFT` | 无（`externalStatus()` 会抛异常） |
| `PENDING_CS_REVIEW` | `PENDING_REVIEW` |
| `CS_REJECTED` | `PENDING_REVIEW` |
| `PENDING_PRODUCTION_REVIEW` | `PENDING_REVIEW` |
| `PRODUCTION_REJECTED` | `PENDING_REVIEW` |
| `PROCESS_INSTANCE_CREATED` | `PRODUCING` |
| `ASSIGNED` | `PRODUCING` |
| `IN_DESIGN` | `DESIGNING` |
| `IN_PRODUCTION` | `PRODUCING` |
| `IN_QC` | `QC` |
| `QC_PASSED` | `PENDING_SHIP` |
| `SHIPPED` | `SHIPPED` |
| `COMPLETED` | `COMPLETED` |

### 第二层：对外状态 `ExternalOrderStatus`

权威定义：`.../order/status/ExternalOrderStatus.java`
落库列：`orders.external_status`

`PENDING_REVIEW` / `DESIGNING` / `PRODUCING` / `QC` / `PENDING_SHIP` / `SHIPPED` / `COMPLETED`

**只有这 7 个**，对应一期验收项 11.2-03「7 个外部状态」。医生端只能看到这一层及其之后的映射，看不到第一层。

### 第三层：医生 UI 状态

权威定义：`frontend/src/doctor/services/httpDoctorGateway.ts` 的 `statusMap`
**不入库**，只在前端由对外状态再映射一次。

| 对外状态 | 医生 UI |
| --- | --- |
| `DRAFT` | `DRAFT` |
| `PENDING_REVIEW` | `UNDER_REVIEW` |
| `DESIGNING` | `IN_PRODUCTION` |
| `PRODUCING` | `IN_PRODUCTION` |
| `QC` | `PRODUCTION_COMPLETED` |
| `PENDING_SHIP` | `READY_TO_DISPATCH` |
| `SHIPPED` | `SHIPPED` |
| `COMPLETED` | `COMPLETED` |

注意 `DESIGNING` 与 `PRODUCING` 在医生 UI 上**合并显示为"制作中"**——这是有意的信息脱敏，不是 bug。

## 设计稿状态 `design_draft.draft_status`

**这是独立于订单状态的另一个域**，同名前缀容易误伤。

当前合法值：`PENDING_DOCTOR`、`DOCTOR_CONFIRMED`、`DOCTOR_REJECTED`、`SUPERSEDED`、`CS_REJECTED`、`PENDING_INTERNAL_REVIEW`

改名历史：迁移 `V49__phase_two_design_collaboration_foundation.sql` 把 `PENDING_DOCTOR_CONFIRM` 改名为 `PENDING_DOCTOR`（该文件第 87 行有转换语句）。

兼容口径：`httpDoctorGateway.ts` 的 `doctorVisibleDraftStatuses` 同时接受 `PENDING_DOCTOR` / `PENDING_DOCTOR_CONFIRM` / `PENDING_DOCTOR_REVIEW`，`App.vue` 的 `isDraftPendingDoctor()` 与之对齐。

> **`PENDING_DOCTOR_CONFIRM` 在订单域仍然合法。** `PhaseOneDashboardService.java:155` 用它做 `external_status` 判断，`WorkflowRuntimeService.java:1188` 用它做 `internal_status` 判断。V49 的改名**只作用于设计稿域**。看到 `App.vue` 里还有十余处 `PENDING_DOCTOR_CONFIRM` 不要顺手全替换——那些是订单域的，改了会引入新缺陷。

> `PENDING_DOCTOR_CONFIRMATION` 是**错误拼写**，后端与全部迁移中都不存在。曾出现在 `seed-doctor-portal-demo-data.sql`，导致相关设计稿被医生端可见性白名单过滤、医生完全看不到。已于 2026-08-02 修正。

## 其他状态列

| 列 | 合法值 |
| --- | --- |
| `order_bill.payment_status` | `PENDING_PAYMENT` / `PARTIALLY_PAID` / `PAID` / `NOT_REQUIRED` |
| `order_logistics.logistics_status` | `SHIPPED` / `IN_TRANSIT` / `DELIVERED_PENDING_CONFIRMATION` / `DELIVERED` |
| `order_process_node.node_status` | `PENDING` / `READY` / `COMPLETED` |

`NOT_REQUIRED` 按 CP-001 属内部实现扩展，不是客户已确认的对外付款状态，勿扩大到对外口径。

## 已知偏差（需产品决策，未擅自修改）

以下两处种子数据写入了不在后端枚举内的值，但医生端前端确实在消费它们，直接改可能影响显示，因此保留并登记：

| 位置 | 值 | 问题 |
| --- | --- | --- |
| `seed-doctor-portal-demo-data.sql` 订单 `ORD20260718-1002` | `external_status = 'NEEDS_INFO'` | `NEEDS_INFO` 不在 `ExternalOrderStatus` 中，是医生 UI 层词汇。「待补资料」的正确来源应是 `current_action = SUPPLEMENT_REQUIRED` |
| 同上 订单 `DRAFT-20260718-08` | `external_status = 'DRAFT'` | `DRAFT` 不在 `ExternalOrderStatus` 中；`InternalOrderStatus.DRAFT.externalStatus()` 会抛异常。但该列 NOT NULL 且默认 `PENDING_REVIEW`，草稿订单的对外状态该填什么需要明确 |

## 改动这些值时的规矩

1. **先确认改的是哪个域**。同名不代表同义。
2. **枚举是唯一权威**，不是迁移 SQL、不是种子、不是前端常量。
3. **改名必须全域扫一遍**：后端 Java、迁移、种子 SQL、前端消费点、校验脚本。V49 那次漏了种子与两个前端消费点，代价是三个静默缺陷。
4. **改完跑** `npm run check:status-vocabulary`。
