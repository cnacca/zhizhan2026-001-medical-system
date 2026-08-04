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

## 下单规则的三个独立域（TASK-034 F 批次）

试戴、过程确认、交期异常**都不是订单状态**。把它们塞进 `InternalOrderStatus` / `ExternalOrderStatus`
会让一期验收 11.2-03 的「7 个外部状态」口径当场失效，因此各自独立成域。
权威定义在 `backend/.../order/rules/OrderRuleVocabulary.java`，
静态守卫在 `npm run check:task-034-order-rules`（会检查订单状态枚举里没有混入这三个域的值）。

| 列 | 合法值 | 含义 |
| --- | --- | --- |
| `order_try_in.try_in_status` | `REQUESTED` / `COMPLETED` / `FINALIZED` | `COMPLETED` 后医生可在**同一订单**上继续选成品，不新建订单 |
| `order_process_confirmation.confirmation_status` | `PLANNED` / `AWAITING_DOCTOR` / `CONFIRMED` / `REJECTED` | `AWAITING_DOCTOR` 超出宽限期即进入等待，按超时天数顺延交期 |
| `order_delivery_plan.variance_flag` | `NONE` / `EARLIER_THAN_FEASIBLE` / `LATER_THAN_PLAN` | `EARLIER_THAN_FEASIBLE` 就是客服端的「时间异常提示」 |
| `order_delivery_plan.estimate_status` | `PLACEHOLDER` / `CONFIRMED` | `PLACEHOLDER` 表示用了客户尚未确认的标准周期，**界面必须标「待确认」** |
| `ordering_rule_config.confirmation_status` | `PLACEHOLDER` / `CONFIRMED` | 同上，逐条规则记录 |
| `order_bill_item.pricing_status` | `PRICED` / `PENDING_QUOTE` | 与 `catalog_product_v2.pricing_status` 同义 |

下单规则的三组取值同样只在 `OrderRuleVocabulary` 定义一次。三处叫法不一致，以数据列为准：

| 数据列 | 前端字段 | 界面标签 | 任务书用词 | 合法值 |
| --- | --- | --- | --- | --- |
| `priority_code` | `case_priority` | 订单周期 | 订单类型 | `NORMAL` / `RUSH_3_DAYS` / `SAME_DAY` |
| `order_type` | `order_type` | 订单类型 | 产品类型 | `ONLINE` / `IMPRESSION` / `REWORK` / `RETURN` / `DESIGN_ONLY` |
| `shipping_method` | `shipping_method` | 运输类型 | 运输类型 | `COURIER` / `SALES_DELIVERY` / `SELF_PICKUP` |

> 这些字段**缺省时按默认值处理，存在但取值不认识时直接 400**。反过来做（未知值静默当默认值）
> 正是 F 批次要消除的「前端能选、后端不认」——那种写法不抛错，只让规则悄悄不生效。

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

## 角色与权限：`UserRole` 是「入口角色 / Portal」，不是业务角色

权威定义：`backend/platform-server/src/main/java/com/yuri/aiorder/common/UserRole.java`

`UserRole` 只有 `DOCTOR / CS / WORKER / ADMIN` 四个值，语义是**从哪个端登录**。它决定两件事，仅此两件：

1. 登录入口匹配（账号角色与入口不符时拒绝登录）；
2. 身份未携带数据范围时的默认值兜底。

客户 2026-07-24 确认的约 20 个细分角色（客服经理、普通客服、翻译人员、收货人员、发货人员、生产经理、部门主管、组长、技工、质检员、终检员……）**一律是 `system_role` 记录 + 权限码集合 + 数据范围，不进入这个枚举**。

因此有三条规矩：

1. **不要用 `identity.role()` 做业务权限判定**。新增细分角色时那种判定不会生效——新角色的入口角色仍是那四个值之一，却拿不到只对特定角色开放的入口。业务判定一律用 `accessControlService.requirePermission(...)` / `requireAnyPermission(...)`。
2. **权限码授予必须与实现一致**。TASK-034 A 批次清理过两处历史不一致：`workflow:assign` 曾授予 CS、六个医生端专属码曾授予 ADMIN，而实现层一直把它们挡在外面。改成纯权限码判定后，这类"看着无害"的多余授权会真的放开访问。新增授权时按接口注解和服务层实际判定核对。
3. **角色码不是枚举值**。`DatabaseAuthService.primaryRole` 会忽略无法映射到 `UserRole` 的角色码；不要恢复成 `UserRole.valueOf` 直取，否则管理端一新建细分角色，被分配到该角色的用户就登录不进来。

数据范围解析顺序（`DatabaseAuthService.resolveDataScope`）：

```
system_user.data_scope（用户级覆盖，可空）
      ▼ 为空时
system_role.data_scope（角色级配置，NOT NULL；多角色取最宽）
      ▼ 身份完全未携带时（例如 bootstrap header）
入口角色默认值：ADMIN/CS → ALL，DOCTOR → CLINIC，WORKER → SELF
```

「多角色取最宽」是过渡口径。TASK-034 B 批次落地「登录后选择当前身份」后，应改为只按当前生效身份解析。

## 改动这些值时的规矩

1. **先确认改的是哪个域**。同名不代表同义。
2. **枚举是唯一权威**，不是迁移 SQL、不是种子、不是前端常量。
3. **改名必须全域扫一遍**：后端 Java、迁移、种子 SQL、前端消费点、校验脚本。V49 那次漏了种子与两个前端消费点，代价是三个静默缺陷。
4. **改完跑** `npm run check:status-vocabulary`。
