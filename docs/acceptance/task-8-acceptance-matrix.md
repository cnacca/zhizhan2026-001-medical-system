# Task 8A Acceptance Matrix

更新日期：2026-07-05

9D.68 12 步主链路客户验收版收敛已新增 `docs/acceptance/phase-one-main-chain-customer-acceptance.md`，把当前固定演示数据 smoke 整理为客户/PM 可读 PASS/FAIL 清单；Task 8 仍保持 `NOT_READY`。

9D.69 部署基础设施第一段已新增一期 Dockerfile、full-stack compose 示例、生产 env 占位示例和 Docker/env 隔离说明；`npm run check:task9d69` 与 `npm run compose:phase-one:config` 可验证当前部署骨架。Task 8 仍保持 `NOT_READY`。

9D.70 操作手册与交付材料第一段已新增 `docs/operations/phase-one-role-operation-manual.md`、`docs/operations/phase-one-troubleshooting-guide.md` 和 `docs/operations/phase-one-delivery-materials-index.md`，形成一期交付材料索引第一段；Task 8 仍保持 `NOT_READY`。

9D.71 AI 外部告警接收端验签 / 防重放第一段已新增 `/ai/external-alerts/receive` 本地验收桩，并把发送侧签名升级为 `timestamp.nonce.requestBody`；Task 8 仍保持 `NOT_READY`。

9D.72 客户 / PM 确认项清单第一段已新增 `docs/acceptance/phase-one-customer-pm-confirmations.md`，把付款状态口径、动态表单最终字段、AI-5 生产备注模板、标准工时与绩效公式口径、Multipart 上传限制、真实电子签章 / 终检报告模板、真实物流平台 / 运单同步、客户培训与签收、真实环境上线验收边界纳入确认表；Task 8 仍保持 `NOT_READY`。

9D.73 付款状态第一段已新增人工维护的对外付款状态：CS / ADMIN 可更新 `PENDING_PAYMENT`、`PARTIALLY_PAID`、`PAID`、`NOT_REQUIRED`，医生端只读展示付款状态；本轮不接真实支付系统或真实物流平台，Task 8 仍保持 `NOT_READY`。

9D.74 绩效标准工时与完整公式口径第一段已新增 `performance_formula_version=PHASE_ONE_DEFAULT_V1`、标准工时覆盖率、标准工时缺失数量和默认绩效分；该公式仅用于一期统计验收和解释，不作为工资、奖金或奖惩结算依据，Task 8 仍保持 `NOT_READY`。

9D.75 正式鉴权与 DataScope 收口第一段已新增 `APP_AUTH_ALLOW_ROLE_FALLBACK=false` 生产权限码优先模式；严格模式下声明权限码的接口必须由 Bearer token 权限码放行，角色-only token 返回 403，Task 8 仍保持 `NOT_READY`。

9D.76 WebSocket / 通知生产验收第一段已新增 `npm run check:task9d76`，一期 Nginx 生产骨架已代理 `/notifications` REST 和 `/ws/` WebSocket；该检查还覆盖 compose Redis/后端依赖、Redis 广播代码路径、通知 REST 隔离/已读测试、WebSocket 脱敏测试和 Redis 远端广播测试。该记录不代表真实双实例 Redis 联调、Nginx HTTPS 或生产 webhook 完成，Task 8 仍保持 `NOT_READY`。

9D.77 文件上传弱网 / 跨设备验收第一段已新增本地双 browser context smoke，模拟设备 A 弱网中断后由设备 B 通过服务端 pending 候选恢复同一 `file_id`；该记录不代表真实弱网物理网络或真实跨设备实机验收完成，Task 8 仍保持 `NOT_READY`。

9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段已新增 `docs/acceptance/task-9d78-bucket-isolation-readiness.md` 和 `npm run check:task9d78`，把本地 bucket、生产 bucket 占位和外部注入 `MINIO_BUCKET` 要求纳入检查；该记录不代表真实对象存储联调完成，Task 8 仍保持 `NOT_READY`。

9D.79 真实环境文件上传人工验收记录模板第一段已新增 `docs/acceptance/task-9d79-real-env-file-upload-manual-acceptance.md` 和 `npm run check:task9d79`，提供真实测试环境 / 正式环境文件上传人工验收记录模板；该记录默认 `待填写` / `待确认`，不填写真实密钥，不代表真实环境已验收，Task 8 仍保持 `NOT_READY`。

9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段已新增 `docs/acceptance/task-9d80-ai-production-integration-acceptance.md` 和 `npm run check:task9d80`，提供真实测试环境 / 正式环境 AI 真实 key、生产 webhook、发送侧签名、接收端验签 / 防重放、预算熔断和输出防护联调记录模板；该记录默认 `待填写` / `待确认`，不填写真实密钥或真实 webhook URL，不代表真实 key 或生产 webhook 已联调完成，Task 8 仍保持 `NOT_READY`。

9D.81 部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段已新增 `docs/deployment/task-9d81-production-deployment-acceptance.md` 和 `npm run check:task9d81`，提供真实测试环境 / 正式环境 Docker Compose、Nginx、HTTPS、镜像仓库、生产环境变量、数据库备份、备份恢复演练、日志留存、监控告警和发布回滚记录模板；该记录默认 `待填写` / `待确认`，不填写真实密钥或真实服务器地址，不代表真实部署已完成，Task 8 仍保持 `NOT_READY`。

9D.82 最新 PRD V2.0 差异对齐矩阵第一段已新增 `docs/acceptance/prd-v2-gap-matrix.md` 和 `npm run check:task9d82`，把最新版 PRD 正文 `V2.0 / 2026-07-04` 拆成一期已覆盖、部分覆盖、缺失、BLOCKED 和二期项；该记录确认医生患者管理、基础支付流水、客户 / 诊所档案与偏好、人员档案、专项质量管理仍是一期待补缺口，设备 / 物料 / 安环 / 成本 / 奖惩完整功能为二期或超一期展示。Task 8 仍保持 `NOT_READY`。

9D.83 患者管理基础版第一增量已新增 `patient_record`、`orders.patient_id`、`patient:manage-doctor`、`/patients`、`/patients/{patientId}/orders` 和医生端 `/doctor/patients`，覆盖患者档案、订单绑定、本人数据隔离和列表检索第一段；本轮不做真实客户数据导入、高级标签、批量检索或 AI 历史方案推荐，Task 8 仍保持 `NOT_READY`。

9D.84 人工支付流水 / 收支记录第一增量已新增 `order_payment_record`、`/orders/{orderId}/payments` 和前端人工收款入口；CS / ADMIN 可录入人工收款流水，医生只读查看本人订单流水。本轮不接真实支付网关，不做退款、对账、发票、财务审批或月结自动归集，Task 8 仍保持 `NOT_READY`。

9D.85 客户 / 诊所档案与偏好第一增量已复用 `clinic` 和 `customer_preference`，新增 `/clinics`、`/clinics/{clinicId}`、`/clinics/{clinicId}/preference`、客服端 `/customers`、管理端 `/admin/clinics`、医生端 `/doctor/account/clinic` 和 `npm run check:task9d85`；CS / ADMIN 可维护 6 个一期偏好字段，医生只能只读本人诊所偏好，生产员工拒绝访问。本轮不做客户开户审批、定价体系、真实客户数据导入、复杂 CRM 或客户 / PM 字段最终确认，Task 8 仍保持 `NOT_READY`。

## 判定规则

| 状态 | 含义 |
| --- | --- |
| PASS | 已有自动化测试和本轮或既有 HTTP/SQL smoke 覆盖，且符合当前后端最小验收范围。 |
| PARTIAL | 后端最小链路或数据模型已具备，但缺前端页面、正式 RBAC/DataScope、WebSocket、真实模型、完整契约或客户确认。 |
| BLOCKED | 需要客户/PM/外部环境确认，当前不能仅靠开发补齐。 |
| NOT_STARTED | 当前仓库尚未实现该产品能力。 |

## 依据

- PRD V2.0 / 2026-07-04：12 步主链路、四端独立入口、医生端八大模块、客服端七大模块、生产端人员 / 质量一期模块、主链路验收、脱敏验收、权限验收、AI 功能验收、设计稿补充验收。
- TRD V1.1：12 步验收点、专项测试矩阵、M6 联调测试上线标准。
- 团队执行文档：M6 要求“专项测试通过，回归通过，部署正式环境，12 步验收清单逐条过，操作手册交付”。
- 当前实现证据：`OrderStatusProjectionTests`、`FileAccessTests`、`WorkflowRuntimeTests`、`CheckWorklogPerformanceTests`、`MessageDesignBillNotificationTests`、`AiGatewayTests`、`BearerIdentityTests`、`PermissionInterceptorTests`、`StrictPermissionModeTests`、`NotificationWebSocketTests`、`NotificationRestTests`、`NotificationBroadcastTests`、9D.24 四入口登录页校验、9D.56 终检专用角色 / 附件第一增量、9D.57 返工影响图形化第一增量、9D.58 客服协同闭环第一增量、9D.59 客服资料缺失提示与 AI 翻译草稿确认第一增量、9D.60 设计稿预览 URL 聚合第一增量、9D.61 账单物流预览/录入闭环第一增量、9D.62 12 步主链路浏览器 smoke 第一增量、9D.62.1 固定演示数据闭环第一段、9D.62.2 派工与工序操作数据闭环第一段、9D.62.3 设计稿确认数据闭环第一段、9D.62.4 账单/物流数据闭环第一段、9D.62.5 终检后发货与医生确认收货数据闭环第一段、9D.63 返工异常路径数据闭环第一段、9D.64 客服端设计稿审核预览增强第一段、9D.65 终检 PDF/签名第一段、9D.66 绩效周期筛选第一段、9D.69 部署基础设施第一段、9D.75 正式鉴权与 DataScope 收口第一段、9D.76 WebSocket / 通知生产验收第一段、9D.77 文件上传弱网 / 跨设备验收第一段、9D.78 bucket 隔离验收记录第一段、9D.79 真实环境文件上传人工验收记录模板第一段、9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段、9D.81 部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段和既有 HTTP/SQL smoke 记录。
- 机器可读缺口：`acceptance.json` 的 `task8_readiness_gaps` 提炼本矩阵和 readiness checklist 中仍未 READY 的关键上线缺口，可通过 `npm run check:task8-readiness-gaps` 查看。

## PRD / TRD 12 步主链路

| 步骤 | 验收点 | 当前状态 | 当前证据 | 上线缺口 |
| --- | --- | --- | --- | --- |
| 1 | 医生选择产品类型、填写动态表单、上传文件、提交订单。 | PARTIAL | 文件上传 token/complete/签名 URL 已由 `FileAccessTests` 覆盖；9D.2 已实现 `GET /form-configs`、医生 `POST /orders`、本人已完成医生可见文件绑定校验和前端新建订单面板；9D.10 已实现 MinIO Multipart 初始化、分片签名、complete/abort/status/pending 和医生端最小 Uppy 文件选择上传并回填 `file_id`，并补同一浏览器本地恢复上传、无本地会话服务端候选恢复和上传中断后恢复第一增量；`npm run smoke:task9d10-large-upload` 已完成 105MB 浏览器 Multipart smoke，`file_id=457` 核验为 `COMPLETED / 110100480 bytes / MULTIPART / 21 parts`；`npm run smoke:task9d10-server-resume` 已验证无本地上传会话时复用 pending `file_id=514`；`npm run smoke:task9d10-interrupted-resume` 已验证第 2 个分片中断后复用同一 `file_id=537` 完成；9D.11 已实现医生保存草稿、提交草稿、补资料重新提交和前端最小入口，浏览器 smoke 已创建 `ORD20260701-E172DF6DD8` 并从 `DRAFT` 提交到 `PENDING_REVIEW`；9D.12 已实现 ADMIN 动态表单创建、编辑和 `status=INACTIVE` 逻辑停用，医生端仍只读取 `ACTIVE` 字段，浏览器 smoke 已覆盖 `SMOKE_1782885092995 / smoke_field_1782885092995` 创建、更新和停用；9D.62 已新增 `npm run smoke:task9d62`，把第 1 步纳入 12 步入口可达 smoke；9D.62.1 已让该 smoke 创建固定演示订单 `ORD20260704-6A3930F518` 并断言进入后续审核链；`OrderStatusProjectionTests` 覆盖动态表单读取、提交订单、草稿、补资料、状态历史和文件绑定越权拒绝；`FormConfigManagementTests` 覆盖动态表单管理权限、创建、更新和医生只读活动字段。 | 动态表单最终字段仍待确认；当前草稿/补资料为手动保存第一增量，上传入口仍要求已创建订单后绑定文件，9D.62.1 仅覆盖固定演示订单无附件下单，仍缺实时自动保存、完整 Uppy Dashboard、真实弱网限速/断网、完整跨设备浏览器续传和完整端到端数据闭环。 |
| 2 | 客服审核、AI 翻译草稿、资料缺失提示、通过/驳回。 | PARTIAL | AI-1/AI-4 已由 `AiGatewayTests` 覆盖；9D.3 已实现 `POST /orders/{orderId}/review`、待审列表 `internal_status=PENDING_CS_REVIEW` 过滤、通过/驳回状态历史、医生通知事实和前端「客服初审」最小页面；9D.11 已补医生对 `CS_REJECTED` / `PRODUCTION_REJECTED` 订单修改资料并重新提交到客服审核状态；9D.58 已补客服端 `/collaboration` 客服协同台第一增量，复用 `/messages/pending-review`、`/orders/{orderId}/messages` 和 `/messages/{msgId}/review` 查看待审核消息、订单消息上下文并通过/驳回；9D.59 已在客服初审页复用 `/ai/check-missing` 展示资料缺失提示、复用 `/ai/translate` 生成 AI 翻译草稿，并要求客服点击“写入生产备注”后才随通过初审保存；9D.60 已补医生端设计稿预览链接第一增量；9D.64 已补客服端设计稿版本列表和客服设计稿预览链接；9D.62.1 已把固定演示订单的客服初审通过纳入 `npm run smoke:task9d62` 数据动作；`OrderStatusProjectionTests` 覆盖通过、驳回、补资料重新提交、错误状态和医生脱敏。 | 仍缺账单物流完整闭环和完整客服页面点击数据 smoke。 |
| 3 | 生产审核通过，自动生成订单工序实例快照。 | PARTIAL | `WorkflowRuntimeTests` 覆盖 `POST /orders/{orderId}/production-review`、状态门禁、实例快照、分支过滤和模板变更隔离；9D.4 已新增前端「生产审核」最小页面，浏览器 smoke 覆盖从 `PENDING_PRODUCTION_REVIEW` 触发实例化；9D.5 已新增「工序实例」页面查看实例节点；9D.6 已补入检/出检和工时操作页面第一增量；9D.8 已新增「生产看板」第一增量，可跨状态检索并查看节点进度；9D.9 已补返工记录和终检出检入口第一增量；9D.14 已补发货前终检 `OUT/PASS` 门禁第一增量；9D.16 已补终检报告生成/读取第一增量；9D.56 已补终检专用权限和内部附件绑定第一增量；9D.65 已补终检 PDF file_id 和签名占位字段第一段；9D.62.1 已把固定演示订单生产审核通过和 `instance_id=2769` 工序实例化断言纳入 `npm run smoke:task9d62`；9D.62.2 已在同一 smoke 中完成首个 READY 节点派工、worker 任务池可见、入检、开工、工时、完工和出检通过，证据为 `node_instance_id=4233`；9D.62.3 已继续完成设计稿文件上传、版本绑定、客服审核、医生预览和确认。 | 仍缺完整工艺链所有节点执行、账单/物流数据动作、拖拽/泳道看板、生产通知联动、真实电子签章/复杂报告模板、真实物流平台和完整生产端验收。 |
| 4 | 管理员绑定员工，员工在任务池收到任务。 | PARTIAL | `WorkflowRuntimeTests` 覆盖派工、转派和 `GET /tasks/mine`；9B.1 已补 WORKER Bearer token 不能派工/跳过节点；9B.3 已用 `@RequirePermission` / `PermissionInterceptor` 将派工入口纳入权限码校验；9B.4/9B.5 已补 WORKER SELF 读取工序实例、消息和文件预览的 SQL DataScope 过滤；9B.6 已补菜单权限驱动的前端入口；9D.5 已新增「派工转派」和「我的任务」页面，浏览器 smoke 覆盖 CS 绑定 worker 后 worker 任务池出现 READY 任务；9D.62.2 已让 `npm run smoke:task9d62` 固定演示订单首个 READY 节点派给 worker，并断言 `GET /tasks/mine?status=READY` 可见。 | 缺真实通知推送、完整前端任务池、完整 RuoYi 管理 UI、员工选择器/负载提示与通用 DataScope SQL。 |
| 5 | 工序入检、开工、暂停、继续、完成。 | PASS | `CheckWorklogPerformanceTests` 覆盖入检门禁、开工、暂停、继续、完工和暂停扣时；9D.6 已新增前端「入检出检」和「工时记录」第一增量；9D.8 生产看板可只读查看节点进度；9D.62.2 已在 `npm run smoke:task9d62` 中对固定演示订单首个派工节点完成入检、开工、工时开始/完成和节点完工数据动作。 | 产品级仍需工时历史、生产通知联动和正式 RBAC/DataScope。 |
| 6 | 出检通过推进后续节点；并联全部完成才汇合。 | PASS | `WorkflowRuntimeTests` 覆盖并联汇合 READY 规则；`CheckWorklogPerformanceTests` 覆盖出检时序；9D.6 已新增出检提交入口；9D.9 已新增终检出检入口；9D.62.2 已在 `npm run smoke:task9d62` 中对固定演示订单首个派工节点提交出检通过。 | 复杂 DAG 回滚、完整返工处理闭环和更多业务字典未实现。 |
| 7 | 出检不通过进入返工，记录原因、责任分类、返工工时。 | PARTIAL | `CheckWorklogPerformanceTests` 覆盖出检失败写返工、目标节点重新 READY、返工后新工时；9D.9 新增 `/reworks` 返工记录列表和前端「待返工记录」视图；9D.17 新增 `/reworks/{reworkId}/close`，要求目标节点在来源失败检查之后重新 `OUT/PASS` 后才能关闭，并写入原因分类、责任类型和关闭备注；9D.18 新增 `/reworks/dictionaries` 和关闭校验，非法原因分类/责任类型返回 400；9D.19 新增 `REWORK_CREATED` / `REWORK_CLOSED` 内部通知事实，并覆盖医生不接收返工通知；9D.20 已补复杂返工影响范围第一增量，后道失败返前道时递归把返工目标后续 `READY/COMPLETED` 节点重置为 `PENDING`，目标返工完成后由 DAG 规则重新激活；9D.21 已补绩效归因联动第一增量，`/performance` 可拆分生产责任、非生产责任和未归因返工；9D.22 已补返工影响审计可视化第一增量，`/reworks` 返回受影响后续节点数量和 ID；9D.23 已补返工影响筛选第一增量，`/reworks?has_impacted_nodes=true/false` 可筛选是否影响后续节点；9D.25 已补绩效明细第一增量，`/performance/details` 可返回已完成工时明细；9D.55 已补 `rework_dictionary_item`、`/reworks/dictionaries/items`、`rework:dictionary:manage` 和管理端 `/system/rework-dictionaries` 第一增量，ADMIN 可新增/编辑/停用返工原因和责任类型，关闭返工只接受 ACTIVE 字典项；9D.57 已补返工影响图形化第一增量，在生产端返工终检页以只读影响图展示返工目标和受影响后续工序；9D.63 已在 `npm run smoke:task9d62` 固定演示订单中提交出检失败、创建返工记录、重做目标节点并关闭返工，证据为 `order_id=6838`、`rework_id=678`、`target_node_instance_id=4389`、`status=DONE`；浏览器真实点击已覆盖生产端“看返工”进入返工终检可见影响图，医生端无返工影响图。 | 生产级通知联动验收和绩效完整公式/周期/申诉未完整实现。 |
| 8 | 设计稿上传、客服审核、医生确认/驳回，版本保留。 | PARTIAL | `MessageDesignBillNotificationTests` 覆盖上传、CS 审核、医生确认和医生端状态隔离；9D.1 医生订单工作台可读取医生可见设计稿并处理待确认版本；9D.13 已新增 `design_draft_file` 关联表、`file_ids/file_count` 响应、内部订单页多文件设计稿上传入口和医生端多文件展示，浏览器 smoke 覆盖订单 `9D13-1782887063685` 的文件 `761/762`；9D.60 已让医生端设计稿版本列表复用 `/files/{fileId}/preview-url` 按需聚合短时效预览链接；9D.62.3 已在 `npm run smoke:task9d62` 固定演示订单中通过真实签名 URL 上传设计稿文件、绑定设计稿版本、CS 审核通过、医生读取设计稿列表、获取预览 URL 并确认，证据为 `draft_id=221`、`file_id=2148`；9D.64 已补客服端内部订单设计稿页，客服可加载当前订单设计稿版本并获取客服设计稿预览链接。 | 仍缺三轮驳回/重传/确认回归、完整 Uppy 设计稿上传区和设计稿阻塞生产节点规则确认。 |
| 9 | 消息按角色可见；生产端发医生前客服审核。 | PARTIAL | `MessageDesignBillNotificationTests` 覆盖 WORKER 消息待审、CS 审核后医生可见、内部备注不泄露；`NotificationWebSocketTests` 覆盖在线通知推送；`NotificationRestTests` 覆盖通知列表、未读数和已读隔离；`NotificationBroadcastTests` 覆盖 Redis 广播代码路径；前端骨架已有通知中心和 WebSocket 实时刷新入口；9D.1 医生订单工作台可读公开消息并发送给客服；9D.58 已补客服协同台待审核消息、订单消息上下文和通过/驳回入口。 | 缺完整消息附件 URL 聚合、真实双实例 Redis 联调、生产网关验收和完整客服消息 smoke。 |
| 10 | 账单上传、物流录入，医生端状态变为已发货。 | PARTIAL | `MessageDesignBillNotificationTests` 覆盖账单上传、人工付款状态维护、医生只读付款状态、终检前发货 409 阻断、终检 `OUT/PASS` 后物流发货、`external_status=SHIPPED`；9D.1 医生订单工作台可读账单物流；9D.14 生产看板新增最小录入物流并发货入口；9D.16 已新增一单一份终检报告接口和返工终检页最小生成入口；9D.56 已新增 `final-inspection:manage`、`final_inspection_report_file`、终检报告 `attachment_file_ids` 和医生端报告/内部附件 403 验收；9D.65 已新增终检报告 `pdf_file_id`、`signature_status`、`signed_by_user_id`、`signed_at`，并保持医生端报告/内部 PDF 预览 403；9D.61 已补客服/内部订单页账单 `file_id` 绑定入口和医生端账单预览链接；9D.62.4 已在 `npm run smoke:task9d62` 固定演示订单中通过真实签名 URL 上传账单文件、绑定账单、医生获取账单预览 URL，并断言未完成全链路终检前物流发货 409 门禁；9D.62.5 已继续完成剩余 READY 工序节点、工序实例完成、物流发货并断言医生端外部状态进入 `SHIPPED`；9D.73 已补 CS / ADMIN 人工维护付款状态和医生端只读展示。 | 仍缺账单金额结构化、真实支付系统、财务审批、物流平台接入、真实电子签章/复杂报告模板和完整终检报告页面验收。 |
| 11 | 医生端 AI 只能回答外部状态/物流/账单，不泄露内部信息。 | PASS | `AiGatewayTests` 覆盖 AI-3 安全拒绝、只读 `DoctorOrderAssistantReadModel`、写 `ai_audit_log`；9D.15 新增 `AiGatewayDeepSeekTests`，用本地 DeepSeek stub 覆盖公开问答走 `/chat/completions`、内部问题继续 `SAFE_REFUSAL` 且不外呼、模型上下文不包含内部生产备注、审计记录 `model_name=deepseek-chat`；9D.40 已补 `prompt_version` 审计和 `AI_OUTPUT_GUARDED` 输出防护第一增量；9D.80 已补 AI 真实 key / 生产 webhook 联调记录模板第一段。 | 真实 key 环境联调、生产 webhook 联调、流式输出、提示词后台管理和更完整生产级输出策略仍待补。 |
| 12 | 医生确认收货，订单完成；审计与通知记录完整。 | PARTIAL | `OrderStatusProjectionTests` 覆盖确认收货；通知事实表在任务 6 覆盖；9D.1 医生订单工作台已有确认收货按钮和浏览器 smoke；9D.62 已把医生确认收货入口纳入 12 步主链路浏览器 smoke 第一增量；9D.62.2 已把该 smoke 的真实数据动作推进到首个派工节点出检通过；9D.62.3 已把设计稿确认数据动作纳入同一 smoke；9D.62.4 已把账单预览和发货门禁数据动作纳入同一 smoke；9D.62.5 已继续完成物流发货、医生确认收货并断言医生端外部状态进入 `COMPLETED`；9D.63 已补同一 smoke 内返工异常路径数据动作。 | 仍缺操作审计完整覆盖和真实通知推送生产验收。 |

## PRD 主链路验收

| 验收项 | 当前状态 | 当前证据 | 上线缺口 |
| --- | --- | --- | --- |
| 医生下单全流程 | PARTIAL | 9D.2 已实现医生读取动态表单、提交订单进入 `PENDING_REVIEW`、绑定本人已完成文件和前端最小新建订单面板；9D.10 已补医生端最小 Uppy 文件选择、Multipart 上传、status 查询、本地恢复上传、服务端候选恢复、中断恢复并回填 `file_id`；9D.11 已补保存草稿、继续编辑/补资料、提交草稿/补资料和后端状态历史回归；9D.3 浏览器 smoke 已覆盖医生创建订单后 CS 在客服初审页面处理该订单；9D.2 浏览器 smoke 覆盖 `127.0.0.1:5173` 医生登录、动态表单读取和创建订单 `ORD20260630-9D94797093`；9D.11 浏览器 smoke 覆盖 doctor 保存草稿并提交草稿，订单 `ORD20260701-E172DF6DD8` 从 `DRAFT` 进入 `PENDING_REVIEW`；100MB+ 上传 smoke 覆盖医生浏览器创建测试订单并上传 105MB 附件；服务端候选恢复 smoke 覆盖无本地会话时复用 pending `file_id=514`；中断恢复 smoke 覆盖第 2 个分片失败后复用同一 `file_id=537` 完成。 | 缺实时自动保存、动态表单最终字段、真实弱网限速/断网、完整跨设备浏览器恢复和完整端到端验收。 |
| 大文件上传 | PARTIAL | `FileAccessTests` 覆盖 MinIO 预签名 PUT、Multipart initiate/part-url/status/pending/complete/abort、审计、status/pending 不泄露 `object_key`、医生写路径越权拒绝和 pending 只列当前医生本人候选；前端 9D.10 已接入最小 Uppy 文件选择、分片直传、本地恢复会话、服务端候选恢复和手动取消入口；`npm run smoke:task9d10-large-upload` 通过本地 105MB 浏览器 Multipart smoke，数据库核验 `file_id=457` 为 21 个分片完成；`npm run smoke:task9d10-server-resume` 通过，确认完成的 `file_id=514` 等于预创建 pending `file_id`；`npm run smoke:task9d10-interrupted-resume` 通过，确认中断后 `multipart/status` 保留 1 个已完成分片并复用同一 `file_id=537` 完成；9D.67 文件上传限制与 bucket 隔离第一段已补 `FILE_MAX_FILE_SIZE_BYTES`、`FILE_ALLOWED_CONTENT_TYPES`、`FILE_MAX_FILES_PER_ORDER` 服务端校验和医生端选择提示；9D.77 文件上传弱网 / 跨设备验收第一段已补本地双 browser context smoke，模拟设备 A 弱网中断、设备 B 无 localStorage 后通过服务端 pending 候选恢复同一 `file_id`；9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段已补 `check:task9d78` 和 `docs/acceptance/task-9d78-bucket-isolation-readiness.md`，检查本地 bucket 与生产占位 bucket 不同且一期 compose 要求外部注入；9D.79 已补 `docs/acceptance/task-9d79-real-env-file-upload-manual-acceptance.md` 和 `check:task9d79`，提供真实测试环境 / 正式环境人工验收记录模板。 | 仍缺真实弱网物理网络、真实跨设备实机、真实测试 bucket、真实正式 bucket、对象存储账号隔离、真实对象存储联调、客户最终 Multipart 限制签字和客户 / PM 书面确认。 |
| 客服审核通过 | PARTIAL | 9D.3 已实现 CS/ADMIN 审核接口、前端「客服初审」入口、状态历史和医生通知事实；浏览器 smoke 覆盖 CS 点击「通过初审」后订单进入 `PENDING_PRODUCTION_REVIEW`，9D.4 已串到生产审核第一增量；9D.11 已补驳回后医生补资料重新提交到客服审核状态；9D.59 已补资料缺失提示、AI 翻译草稿和人工写入生产备注入口；9D.60 已补医生端设计稿预览链接第一增量；9D.64 已补客服端设计稿审核预览增强第一段。 | 缺完整客服订单详情真实点击 smoke 和账单物流闭环。 |
| 外文翻译 | PARTIAL | `AiGatewayTests` 覆盖 AI-1 草稿，不自动写入；9D.59 已在客服初审页提供 AI 翻译草稿和人工写入生产备注入口。 | 缺完整客服真实点击 smoke 和客户最终生产备注模板确认。 |
| 工序链实例化 | PARTIAL | `WorkflowRuntimeTests` 覆盖实例化和快照；9D.4 前端「生产审核」可选择工序链并触发实例化；9D.5 已补工序实例详情、任务池和派工页面第一增量；9D.6 已补入检/出检和工时操作页面第一增量；9D.8 已补跨状态生产看板第一增量；9D.9 已补返工终检第一增量；9D.14 已补发货前终检 `OUT/PASS` 门禁第一增量；9D.16 已补终检报告第一增量；9D.56 已补终检专用权限和内部附件绑定第一增量。 | 缺实时生产通知联动、终检 PDF/签名/真实物流和完整生产端验收。 |
| 工序链自动匹配 | PASS | `WorkflowRuntimeTests` 覆盖 `intake_branch` / `branch_params` 分支过滤。 | 贴面/种植等内部路线仍需客户确认。 |
| 并联节点执行 | PASS | `WorkflowRuntimeTests` 覆盖并联汇合。 | 缺前端并行任务可视化。 |
| 入检出检强制 | PASS | `CheckWorklogPerformanceTests` 覆盖未入检不能开工、未完成不能出检；9D.6 已新增页面级入检/出检提交入口；9D.9 已新增终检出检入口；9D.14 已覆盖发货前必须有最后工序 `OUT/PASS`；9D.16 已覆盖缺终检通过不能生成报告；9D.56 已覆盖没有 `final-inspection:manage` 的 WORKER 生成报告 403、专用权限账号可绑定内部附件、医生读取报告和内部附件预览 403。 | 缺完整返工闭环、终检 PDF/签名和真实物流平台验收。 |
| 返工流程 | PARTIAL | `CheckWorklogPerformanceTests` 覆盖返工记录、重新开工、9D.17 返工关闭、9D.18 字典校验、9D.19 返工内部通知、9D.20 返工后续影响范围重置、9D.21 绩效责任归因拆分、9D.22 返工影响节点审计、9D.23 返工影响筛选、9D.25 绩效明细和 9D.55 字典后台维护；9D.9 已新增 `/reworks` 只读列表、WORKER 本人范围过滤和待返工记录页面；9D.17 已新增关闭返工最小入口、原因分类和责任类型留痕；9D.18 已把关闭选项改为后端字典；9D.19 已补返工创建通知目标 WORKER、返工关闭通知 CS，且医生不收到内部返工通知；9D.20 已补后道返前道时后续 `READY/COMPLETED` 节点重置为 `PENDING`；9D.21 已补 `/performance` 生产责任/非生产责任/未归因返工统计；9D.22 已补 `/reworks` 影响后续节点数量和 ID；9D.23 已补 `has_impacted_nodes` true/false 筛选和前端“仅看影响后续工序”开关；9D.25 已补 `/performance/details` 最近完成工时明细；9D.55 已新增 `rework_dictionary_item`、`/reworks/dictionaries/items` 和 `/system/rework-dictionaries`，返工原因/责任类型可由 ADMIN 新增、编辑、停用，关闭返工只接受 ACTIVE 字典项；9D.57 已补返工影响图形化第一增量；9D.63 已把出检失败、返工记录、目标节点重做和返工关闭纳入 `npm run smoke:task9d62` 固定演示数据动作。 | 缺生产级通知联动验收和绩效完整公式/周期/申诉。 |
| 工时计算 | PASS | `CheckWorklogPerformanceTests` 覆盖暂停段扣除。 | 标准工时仍待客户确认。 |
| 绩效统计 | PARTIAL | `CheckWorklogPerformanceTests` 覆盖最小只读统计、WORKER 本人范围、ADMIN 查询指定员工，以及 CS Bearer token 403；9D.7 已新增前端绩效统计第一增量，展示完成工序、有效工时、返工次数、准时率、通过率和工时效率；9D.21 已补绩效归因联动第一增量，新增 `responsible_rework_count`、`non_worker_responsibility_rework_count` 和 `unclassified_rework_count`，前端展示生产责任、非生产责任和未归因返工；9D.25 已补绩效明细第一增量，新增 `/performance/details` 和前端“工时明细”表；9D.66 已补绩效周期筛选第一段，`/performance` 与 `/performance/details` 支持 `start_date` / `end_date` 并在前端绩效页按同一周期查询统计和明细；9D.74 已补绩效标准工时与完整公式口径第一段，`/performance` 返回 `performance_formula_version`、`standard_coverage_rate` 和 `performance_score`，前端只读展示默认公式版本、标准工时覆盖率和默认绩效分。 | 缺客户/PM 对 CP-004 的正式公式确认、标准工时配置、申诉闭环、明细导出、工资发放和正式管理看板。 |
| 终检发货 | PARTIAL | 物流发货更新 `SHIPPED` 已覆盖；9D.9 已新增复用 `/check-records` 的终检出检第一增量；9D.14 已新增 `MessageDesignBillNotificationTests#shipmentRequiresFinalOutCheckPassBeforeUpdatingExternalProjection`，覆盖未终检发货 409、无发货通知、终检 `OUT/PASS` 后发货成功和医生端 `SHIPPED` 投影；生产看板提供最小录入物流并发货入口；9D.16/9D.56/9D.65 新增 `CheckWorklogPerformanceTests#finalInspectionReportRequiresFinalOutPassAndIsInternalOnly`，覆盖终检报告生成前 409、无专用权限 403、带内部附件和内部 PDF 生成报告、签名占位状态、内部读取附件/PDF ID、医生读取报告和内部附件/PDF 预览 403；9D.61 已补医生端账单预览链接和客服/内部账单文件绑定入口；9D.62.4 已把终检前发货 409 门禁纳入 12 步主链路 smoke；9D.62.5 已把终检后发货和医生确认收货数据动作纳入同一 smoke；9D.73 已补人工付款状态第一段。 | 缺真实电子签章、复杂报告模板、完整发货页面验收、真实支付系统、财务审批和真实物流平台接入。 |
| 医生确认收货 | PASS | `OrderStatusProjectionTests` 覆盖 `COMPLETED` 投影；9D.1 医生订单工作台已有页面入口；9D.62.5 已在 `npm run smoke:task9d62` 固定演示订单中完成医生确认收货数据动作；9D.63 已补同一固定演示订单的返工异常路径数据动作。 | 仍需完整客户验收版 12 步端到端页面验收。 |

## TRD 专项测试矩阵

| 专项 | 当前状态 | 当前证据 | 上线缺口 |
| --- | --- | --- | --- |
| 权限脱敏 | PASS | `OrderStatusProjectionTests`、`MessageDesignBillNotificationTests`、`AiGatewayTests` 覆盖医生端不返回内部字段；`BearerIdentityTests` 覆盖 Bearer 医生 token 下的脱敏、跨医生 403、refresh token 换发 access token、logout 后 refresh 401；9B.1 新增 `AccessControlService` 并覆盖医生不能读检查记录、WORKER 不能派工/跳过、CS 不能查绩效；9B.2 覆盖数据库账号登录、权限码、data scope 和医生账号范围；9B.3 新增 `@RequirePermission` / `PermissionInterceptor` 并用 `PermissionInterceptorTests` 覆盖医生、工人、客服账号入口权限边界；9B.4 覆盖业务 Controller 身份收口和订单/工序实例 SQL DataScope；9B.5 覆盖文件、协同订单范围和 AI 内部上下文 SQL DataScope；9B.6 覆盖菜单权限与医生端前端入口隐藏；9B.7 覆盖生产鉴权启动门禁；9B.8 覆盖 refresh token 哈希存储、刷新和 logout 吊销第一增量；9D.24 已补四入口登录页与角色端口校验，缺少 `portal` 返回 400，账号角色与入口不匹配返回 403；9D.75 已补 `APP_AUTH_ALLOW_ROLE_FALLBACK=false` 严格权限模式，`StrictPermissionModeTests` 覆盖角色-only token 访问声明权限码接口返回 403、携带权限码 token 返回 200。 | 完整 RuoYi RBAC/DataScope 接入后必须重跑全矩阵；refresh token 轮换、access token 黑名单、多设备会话策略和通用 SQL DataScope 仍需后续补齐。 |
| 文件越权 | PASS | `FileAccessTests` 覆盖跨医生/跨诊所/INTERNAL 文件拒绝和审计。 | 仍需 Bearer token 多文件场景和正式 RuoYi 登录态复测。 |
| AI 越权 | PASS | `AiGatewayTests` 覆盖 AI-3 内部问题安全拒绝；`AiGatewayDeepSeekTests` 覆盖启用 DeepSeek 后 AI-3 公开问题只发送脱敏公开上下文，内部问题不调用模型并写 `SAFE_REFUSAL`；9D.26 到 9D.48.2 已补每用户小时限流、单次成本审计、模型重试、模型失败审计、治理摘要、预算阈值、预算跨线审计、预算超限内部通知第一增量、预算通知策略开关第一增量、预算熔断/降级第一增量、外部告警待发送事实第一增量、分角色预算第一增量、分模型预算第一增量、提示词版本审计、输出防护第一增量、外部告警发送器第一增量、成本趋势第一增量、AI 真实外部渠道适配第一增量、AI 外部告警调度器第一增量、AI 外部告警重试/死信第一增量、AI 外部告警幂等/并发领取第一增量、AI 外部告警 webhook 签名/鉴权第一增量、AI 外部告警监控/运维可观察第一增量、AI 外部告警 outbox 列表/筛选第一增量和 AI 外部告警失败/死信可见性第一增量；`AI_BUDGET_NOTIFICATION_ENABLED=false` 时只保留预算跨线审计，不写内部通知事实；`AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 且预算已超限时不外呼真实模型，并写 `AI_BUDGET_CIRCUIT_OPEN`；预算跨线和熔断命中会写入 `ai_external_alert_outbox.send_status=PENDING`；角色预算超限时写 `AI_BUDGET_ROLE_CIRCUIT_OPEN`；模型预算超限时写 `AI_BUDGET_MODEL_CIRCUIT_OPEN`；敏感输出命中时写 `AI_OUTPUT_GUARDED`；9D.41 覆盖 outbox `PENDING -> SENT/FAILED`、`attempts` 和 `last_error`；9D.42 覆盖 `/ai/governance/cost-trend` 仅 CS / ADMIN 可读；9D.43 覆盖显式启用 `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=true` 和 `AI_EXTERNAL_ALERT_WEBHOOK_URL` 后 POST webhook；9D.44 覆盖 `AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false` 默认不调度、显式启用后按批次调用 sender；9D.45 覆盖 webhook 失败未达 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS` 保持 `PENDING`、达到上限进入 `DEAD_LETTER`；9D.46 覆盖 sender 先领取 `PENDING -> SENDING` 后外呼，重复触发不重复发送同一条 outbox；9D.47/9D.71 覆盖显式启用 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED=true` 和 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET` 后请求携带 `X-AI-Alert-Timestamp`、`X-AI-Alert-Nonce` 和 `X-AI-Alert-Signature`，签名基串为 `timestamp.nonce.requestBody`；9D.71 覆盖 `/ai/external-alerts/receive` 默认关闭 503、签名通过 200、nonce 重放 409、过期 timestamp / 错误签名 401；9D.48 覆盖 `/ai/governance/external-alerts/summary` 仅 CS / ADMIN 可读，返回 outbox 状态分布、最近失败/死信错误和最老待发送时间；9D.48.1 覆盖 `/ai/governance/external-alerts` 仅 CS / ADMIN 可读，支持状态、事件类型、创建时间范围和 limit 筛选；9D.48.2 覆盖 FAILED / DEAD_LETTER 的 `attempts`、脱敏 `last_error` 和 `last_attempted_at`，且不返回 payload/真实 URL/token/Bearer token/prompt/模型原文；9D.80 已补真实 key / 生产 webhook 联调记录模板。 | 真实 key 环境、提示词后台管理、生产 webhook 联调、流式输出过滤、生产成本看板和更完整输出策略仍需上线前复测。 |
| 状态投影 | PASS | `OrderStatusProjectionTests` 覆盖 `OrderStatusService`、历史记录和外部投影。 | 更多业务事件映射需在完整主链路中复测。 |
| 并联汇合 | PASS | `WorkflowRuntimeTests` 覆盖未全部完成时汇合节点不 READY。 | 复杂链路可补更多产品类型回归。 |
| 入检/出检 | PASS | `CheckWorklogPerformanceTests` 覆盖入检门禁、出检时序、返工、`/reworks` WORKER 范围、返工关闭门禁和 DOCTOR Bearer token 403；9D.9 已新增终检出检入口；9D.14 已补发货前最后工序 `OUT/PASS` 门禁；9D.16 已补终检报告生成/读取和医生隔离回归；9D.17 已补返工关闭第一增量；9D.56 已补终检专用权限和内部附件绑定回归。 | 正式 RuoYi 角色权限点、终检 PDF/签名和真实物流平台待补。 |
| 工时幂等 | PARTIAL | `CheckWorklogPerformanceTests` 覆盖最小重复返工工时不覆盖历史。 | 重复点击 start/pause/resume/finish 的幂等边界需补更细测试。 |
| WebSocket / 通知 | PARTIAL | 任务 6 已落库 `notification_event` / `user_notification`；任务 9C.1 已实现 `/ws/connect?token=...` 单实例在线推送，并覆盖医生 payload 不泄露内部备注；任务 9C.2 已实现通知列表、未读/已读 REST 与前端通知中心入口；任务 9C.3 已实现前端 WebSocket 实时刷新和 Redis 广播代码路径；9D.33/9D.34 已补 AI 预算内部通知和通知策略开关；9D.37 已补 AI 预算外部告警 `ai_external_alert_outbox` 待发送事实；9D.41 已补本地外部告警发送器状态机；9D.43 已补显式启用的 webhook 真实发送边界；9D.44 已补默认关闭的调度器入口；9D.45 已补 webhook 失败重试/死信第一增量；9D.46 已补 sender 领取幂等第一增量；9D.47 已补 webhook HMAC 签名第一增量；9D.48 已补 outbox 监控摘要第一增量；9D.48.1 已补 outbox 列表/筛选第一增量；9D.48.2 已补失败/死信只读可见性第一增量；9D.71 已补接收端验签 / 防重放本地验收桩；9D.76 已补 Nginx 通知 REST / WebSocket 生产网关 readiness 第一段，检查 `/notifications` REST 代理、`/ws/` upgrade 代理、compose Redis/后端依赖、通知 REST 隔离/已读、WebSocket 脱敏和 Redis 远端广播。 | 缺真实双后端实例 Redis 联调、心跳/重连压测、Nginx HTTPS 生产验收、生产 webhook 联调和监控告警。 |
| API YAML | PASS | `npm run check:openapi` 覆盖自定义契约检查、Swagger validate、Redocly lint；当前 path / operation 数量以命令输出为准；9B.8 已补 `/auth/refresh`、`/auth/logout`、`RefreshTokenRequest`、`refreshToken` 和 `refreshExpiresAt`；9D.1 已补 `/orders` 响应 schema，9D.2 已补下单 schema，9D.3 已补客服审核请求/响应和 `internal_status` 过滤参数，9D.4 已校正生产审核状态门禁和权限描述，9D.5 已校正派工/转派权限和 `tasks/mine` 的 `READY` 过滤；9D.9 已补 `/reworks`，9D.10 已补 Multipart 6 个文件接口和 schema，9D.11 已补 `DRAFT` 外部状态、`UpdateOrderRequest` 和 `PUT /orders/{orderId}` 草稿/补资料契约；9D.12 已补动态表单 `status`、create/update 响应和 `status=INACTIVE` 逻辑停用描述；9D.13 已补设计稿 `file_ids` / `file_count` 响应和多文件描述；9D.14 已补 `/orders/{orderId}/logistics` 发货前终检 `OUT/PASS` 门禁描述；9D.15 已补 AI 端点 DeepSeek 适配、deterministic fallback 和 AI-3 `SAFE_REFUSAL` 描述；9D.16/9D.56/9D.65 已补终检报告生成/读取契约、`attachment_file_ids`、`pdf_file_id`、`signature_status` 和 `final-inspection:manage` 专用权限说明；9D.17 已补返工关闭契约；9D.18 已补返工字典契约；9D.19 已补 `REWORK_CREATED` / `REWORK_CLOSED` 通知事件说明；9D.25 已补 `/performance/details` 和 `PerformanceDetail` schema；9D.35 已补 `AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true` 和 `AI_BUDGET_CIRCUIT_OPEN` 预算熔断/降级说明；9D.37 已补 `ai_external_alert_outbox` 外部告警待发送事实说明；9D.38 已补 `AI_BUDGET_ROLE_CIRCUIT_OPEN` 和角色预算环境变量说明；9D.39 已补 `AI_BUDGET_MODEL_CIRCUIT_OPEN` 和 `AI_DEEPSEEK_DAILY_BUDGET_MICROUSD` 模型预算说明；9D.40 已补 `prompt_version` 和 `AI_OUTPUT_GUARDED` 输出防护说明；9D.41 已补 outbox `SENT/FAILED`、`attempts` 和 `last_error` 状态机说明；9D.42 已补 `/ai/governance/cost-trend` 和 `AiGovernanceCostTrendResponse`；9D.43 已补 `AI_EXTERNAL_ALERT_WEBHOOK_ENABLED` / `AI_EXTERNAL_ALERT_WEBHOOK_URL` webhook 发送说明；9D.44 已补 `AI_EXTERNAL_ALERT_SCHEDULER_ENABLED` 调度器说明；9D.45 已补 `AI_EXTERNAL_ALERT_MAX_ATTEMPTS` 和 `DEAD_LETTER` 重试/死信说明；9D.46 已补 `SENDING` 领取态和避免重复外呼说明；9D.47 已补 `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED` / `AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET` 和 `X-AI-Alert-Signature` HMAC 签名说明；9D.48 已补 `/ai/governance/external-alerts/summary` 和 `AiExternalAlertSummaryResponse`；9D.48.1 已补 `/ai/governance/external-alerts` 和 `AiExternalAlertListResponse`；9D.48.2 已补 `AiExternalAlertRecord.attempts`、脱敏 `last_error` 和 `last_attempted_at`；9D.55 已补 `/reworks/dictionaries/items`、`CreateReworkDictionaryItemRequest`、`UpdateReworkDictionaryItemRequest` 和 `ReworkDictionaryItemResponse`。 | 后续新增正式 RBAC/DataScope、WebSocket 生产接入、生产级 AI 治理、前端配套接口时必须继续同步契约。 |

## 设计稿补充验收

| 验收项 | 当前状态 | 当前证据 | 上线缺口 |
| --- | --- | --- | --- |
| 设计稿上传 | PARTIAL | `MessageDesignBillNotificationTests` 覆盖单文件和多文件设计稿上传；9D.13 前端内部订单页可输入多个已完成 `file_id` 上传新版设计稿；9D.62.3 smoke 已通过真实签名 URL 上传设计稿文件并完成版本绑定；9D.64 已补客服端设计稿列表和预览链接。 | 缺完整 Uppy 设计稿上传区和多轮驳回/重传回归。 |
| 客服审核通过 | PASS | `MessageDesignBillNotificationTests` 覆盖 `PENDING_DOCTOR_CONFIRM` 和医生通知；通知中心入口和未读/已读 REST 已完成第一增量。 | WebSocket 已有后端单实例第一增量；仍缺浏览器实时接入和完整设计稿页面。 |
| 客服驳回 | PARTIAL | service 支持 reject 分支，当前测试主覆盖 approve。 | 需补客服驳回自动化和上传人通知 smoke。 |
| 医生确认 | PASS | `MessageDesignBillNotificationTests` 覆盖 `DOCTOR_CONFIRMED`；9D.1 医生订单工作台已有待确认设计稿处理入口；9D.62.3 smoke 已覆盖医生读取设计稿列表、获取短时效预览 URL 并确认；9D.64 已补客服端预览体验第一段。 | 仍需补多轮版本和驳回重传验收。 |
| 医生驳回 | PARTIAL | service 支持 reject 分支，当前测试主覆盖 confirm。 | 需补医生驳回原因和通知 smoke。 |
| 版本记录 | PARTIAL | service 使用 `version_no=max+1`；9D.13 测试覆盖同一订单连续上传生成 `version=1/2`，并保留每个版本的多个文件。 | 缺三轮驳回-重传回归和不可删除验收。 |
| 医生端隔离 | PASS | `MessageDesignBillNotificationTests` 覆盖医生不可见 `PENDING_CS_REVIEW`。 | 需补 `CS_REJECTED` 显式回归。 |

## 上线结论

当前不能进入正式上线。原因不是底层链路全部失败，而是产品级上线仍缺以下硬条件：

- Task 8 readiness 终检报告第一增量已生成：`docs/deployment/task-8-final-readiness-report.md`，后续上线前缺口应优先从该报告接手。

- 正式 RuoYi-Vue-Pro RBAC/DataScope 尚未完全替换 `X-Bootstrap-*` 本地烟测头；9B.1/9B.2/9B.3/9B.4/9B.5/9B.6/9B.7/9B.8 已完成后端集中权限守卫、数据库化 RBAC/DataScope 基础、菜单/部门/岗位和前端权限路由第一增量、权限注解/统一拦截器、统一身份参数解析、订单/工序实例 SQL DataScope 第一增量、文件/协同/AI DataScope 扩展、生产鉴权启动门禁和 Refresh Token/logout 第一增量，9D.75 已补生产权限码优先模式，但仍缺完整 RuoYi 管理 UI、生产级 Spring Security/JWT、通用 DataScope SQL 覆盖、refresh token 轮换、access token 黑名单和多设备会话策略。
- 医生端订单读取工作台、医生下单第一增量、医生订单草稿/补资料第一增量、动态表单 CRUD 第一增量、设计稿多文件/多版本第一增量、客服初审第一增量、生产审核第一增量、生产任务入口第一增量、质检/工时第一增量、绩效统计第一增量和生产看板第一增量已完成；管理端大部分业务页面仍未实现，客服端也仍缺完整协同工作台。
- 终检第一增量、发货前终检门禁第一增量、终检报告第一增量、终检专用角色 / 附件第一增量、终检 PDF/签名第一段、返工关闭/责任分类第一增量、返工字典第一增量、返工通知联动第一增量、复杂返工影响范围第一增量、绩效归因联动第一增量、返工影响审计可视化第一增量、返工影响筛选第一增量、返工影响图形化第一增量、绩效明细第一增量、绩效周期筛选第一段、绩效标准工时与完整公式口径第一段、Multipart 第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、上传中断后恢复浏览器 smoke、100MB+ 浏览器上传 smoke、真实 DeepSeek 适配第一增量、AI 预算超限内部通知第一增量和 AI 预算熔断/降级第一增量已补，但实时自动保存、真实电子签章/复杂报告模板、绩效客户确认/配置/申诉/工资结算、生产级 AI 治理、真实弱网/跨设备浏览器续传仍未完成；通知未读/已读 REST、前端通知中心、浏览器 WebSocket 实时接入和 Redis 广播代码路径已完成第一增量，但真实双实例 Redis 联调、生产网关验收和完整业务页面仍未达到上线标准。
- OpenAPI 已完成当前后端基线二次冻结；后续新增接口仍需持续同步。
- 部署基础设施已有一期 Docker / compose / env 隔离第一段，9D.81 已补部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段，但仍缺真实服务器部署、HTTPS、镜像仓库、备份恢复、日志留存、监控告警和真实测试/正式环境联调。
- 操作手册已有第一段，但仍缺正式客户培训签收、真实生产部署手册、备份恢复、监控告警和发布回滚手册。
- 客户/PM 仍需确认动态表单最终字段、AI-5 模板、标准工时、付款状态、Multipart 限制等；9D.72 已建立 `docs/acceptance/phase-one-customer-pm-confirmations.md` 作为追踪清单，但不代表这些事项已签字。
- 9D.82 已建立 `docs/acceptance/prd-v2-gap-matrix.md`，重新确认患者管理基础版、人工支付流水 / 收支记录、客户 / 诊所档案与偏好、人员档案 / 工作量看板、质量记录 CRUD / 外返登记是 PRD V2.0 下仍需本地关闭的一期缺口；设备、物料、安环、成本、奖惩完整功能不再作为一期 READY 硬阻塞。
- 9D.83 已补患者管理基础版第一增量，9D.84 已补人工支付流水 / 收支记录第一增量，9D.85 已补客户 / 诊所档案与偏好第一增量；人员档案 / 工作量看板、质量记录 CRUD / 外返登记仍需继续按 PRD V2.0 逐项关闭。

## 9D.77 文件上传弱网 / 跨设备验收第一段

验收结果：completed-first-increment / PARTIAL。

证据：`npm run check:task9d77` 检查 9D.77 smoke、文档和 `file-upload-prod` 机器可读缺口；`npm run smoke:task9d77-file-upload-resilience` 可在本地模拟弱网延迟、断网中断和跨 browser context 续传。

未完成原因：真实弱网物理网络、真实跨设备实机、客户 Multipart 限制签字和测试/正式 bucket 实际隔离仍缺。Task 8 仍保持 NOT_READY。

## 9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段

验收结果：completed-first-increment / PARTIAL。

证据：`npm run check:task9d78` 检查 `.env.example` 本地 bucket、`deploy/env/phase-one.prod.example` 正式环境 bucket 占位、一期 compose 外部注入 `MINIO_BUCKET` 要求和 `docs/acceptance/task-9d78-bucket-isolation-readiness.md` 记录。

未完成原因：真实测试 bucket、真实正式 bucket、对象存储账号隔离、真实网络访问和客户 / PM 书面确认仍需在真实环境具备后验收。Task 8 仍保持 NOT_READY。

## 9D.79 真实环境文件上传人工验收记录模板第一段

验收结果：template-ready / PARTIAL。

证据：`npm run check:task9d79` 检查 `docs/acceptance/task-9d79-real-env-file-upload-manual-acceptance.md`、本矩阵、readiness checklist、终检报告、`acceptance.json` 和项目文档均已记录真实环境文件上传人工验收模板。模板覆盖测试 bucket、正式 bucket、对象存储账号隔离、文件大小 / 类型 / 数量限制、100MB+ 上传、弱网中断、跨设备恢复、越权读取和客户/PM 签字状态。

未完成原因：该模板所有真实环境字段仍为 `待填写` 或 `待确认`，不填写真实密钥，不代表真实环境已验收；真实对象存储联调、真实弱网物理网络、真实跨设备实机和客户 / PM 书面确认仍需在真实环境具备后补齐。Task 8 仍保持 NOT_READY。

## 9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段

验收结果：template-ready / PARTIAL。

证据：`npm run check:task9d80` 检查 `docs/acceptance/task-9d80-ai-production-integration-acceptance.md`、本矩阵、readiness checklist、终检报告、`acceptance.json` 和项目文档均已记录 AI 真实 key / 生产 webhook 联调记录模板。模板覆盖 DeepSeek key 外部注入、`AI_PROVIDER=deepseek`、`AI_DEEPSEEK_ENABLED=true`、生产 webhook、发送侧签名、接收端验签 / 防重放、预算熔断、输出防护、审计留痕和客户/PM 签字状态。

未完成原因：该模板所有真实环境字段仍为 `待填写` 或 `待确认`，不填写真实密钥，不填写真实 webhook URL，不代表真实 key 或生产 webhook 已联调完成；真实 key 环境、生产 webhook、提示词后台管理、流式输出过滤、生产成本看板和客户 / PM 书面确认仍需在真实环境具备后补齐。Task 8 仍保持 NOT_READY。

## 9D.81 部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段

验收结果：template-ready / PARTIAL。

证据：`npm run check:task9d81` 检查 `docs/deployment/task-9d81-production-deployment-acceptance.md`、本矩阵、readiness checklist、终检报告、`acceptance.json` 和项目文档均已记录部署真实环境 smoke / HTTPS / 备份监控验收模板。模板覆盖 Docker Compose、Nginx、HTTPS、镜像仓库、生产环境变量、数据库备份、备份恢复演练、日志留存、监控告警、发布回滚和客户/PM 签字状态。

未完成原因：该模板所有真实环境字段仍为 `待填写` 或 `待确认`，不填写真实密钥，不填写真实服务器地址，不代表真实服务器、HTTPS、备份恢复或监控告警已验收完成；真实部署环境、HTTPS 证书、备份恢复演练、日志监控和客户 / PM 书面确认仍需在真实环境具备后补齐。Task 8 仍保持 NOT_READY。
