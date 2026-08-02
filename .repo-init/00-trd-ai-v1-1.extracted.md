AI 智能下单与生产协同平台

一期技术需求 / 技术设计文档（TRD）

V1.1 深度研究优化版 · 面向开发工程师执行

变更摘要

目录

1. 文档目标与执行口径

2. 一期范围与不做范围

3. 技术栈与总体架构

4. 模块划分与工程边界

5. 用户角色、权限模型与数据隔离

6. 订单状态机：internal_status 与 external_status

7. 医生端脱敏设计

8. 9 条生产工艺流建模

9. 订单工序实例化机制

10. 工序节点状态机、并联与可选节点

11. 入检 / 出检 / 返工流程

12. 工时计时与绩效统计

13. 文件上传与权限访问

14. AI 智能体接入与数据边界

15. WebSocket 与通知机制

16. 数据库表设计与索引

17. 核心接口设计与 API 约束

18. 部署架构、日志审计与安全

19. 测试验收矩阵

20. 里程碑与开发工程师执行计划

21. 深度研究采纳矩阵

22. 待确认问题

1. 文档目标与执行口径

本文档用于指导一期开发工程师落地实现。它不是产品宣传材料，也不是二期规划文档；所有新增的技术表、状态、校验和审计要求，均服务于 PRD 已明确的一期能力：在线下单、客服审核、生产工艺流、入检出检、工时绩效、文件访问、消息、设计稿、账单物流、5 个 AI 智能体，以及医生端脱敏。

1.1 数据源与优先级

1.2 执行原则

PRD 与深度研究冲突时，以 PRD 一期范围为准。

深度研究中的建议只要属于“实现方式、数据一致性、安全边界、测试验收”，可纳入一期；属于“新功能、复杂平台、二期演进”的内容只放入规划。

医生端脱敏、AI-3 数据边界、文件越权防护、入检/出检强制顺序、工时准确性属于一期红线，不可后补。

所有不明确项进入第 22 章待确认问题，由项目经理/客户确认后再实现。

2. 一期范围与不做范围

2.1 一期必须交付范围

2.2 一期明确不做

3. 技术栈与总体架构

一期采用模块化单体优先的落地方式：一个 Spring Boot / RuoYi-Vue-Pro 主服务承载核心业务模块，避免订单、工序、工时、返工、状态投影之间出现跨服务一致性问题。AI 适配层可作为后端内部模块实现；如项目经理确认必须使用独立 LangChain 服务，再独立容器部署，但 AI 服务不得直连业务库。

3.1 技术栈

3.2 架构原则

业务核心不拆微服务：订单状态、工序实例、入检出检、工时、返工、状态投影必须在同一服务事务内处理。

控制器只做鉴权和参数校验，核心状态流转集中在领域服务/应用服务中，不允许散落在 Controller。

医生端、AI-3、医生端文件访问、医生端 WebSocket 统一读取外部投影/脱敏对象。

消息、AI、文件、状态变更均写审计，满足验收与问题追溯。

3.3 部署拓扑

Browser: Doctor / CS / Production / Admin
  -> Nginx HTTPS
  -> Spring Boot API (RuoYi-Vue-Pro)
       - auth/rbac/datascope
       - order/form/workflow/check/worklog/performance
       - file/message/design/bill/logistics/ai/notification
  -> MySQL / Redis / MinIO
  -> DeepSeek API via controlled AI adapter

4. 模块划分与工程边界

4.1 后端模块建议

4.2 前端路由建议

5. 用户角色、权限模型与数据隔离

5.1 角色矩阵

5.2 权限实现原则

所有接口必须服务端校验角色与数据范围；前端隐藏按钮只能提升体验，不能作为安全边界。

DOCTOR 默认只能查看本人或所属诊所授权订单；跨诊所访问返回 403 或空数据。

WORKER 只看分配给自己的工序任务及必要订单摘要，不查看医生端账单、医生隐私留言、全量绩效。

CS 可按负责诊所/订单查看订单内部信息；是否进一步按 cs_user_id 限制由 PM 确认。

ADMIN 有全量管理权限，但关键操作必须审计。

5.3 权限点建议

order:create, order:view:self, order:view:internal, order:review:cs, order:review:production
workflow:chain:view, workflow:instance:view, workflow:assign, workflow:reassign
check:intake:create, check:outbound:create, check:view
worklog:start, worklog:pause, worklog:resume, worklog:finish
performance:view:self, performance:view:all
file:upload, file:preview, file:download
message:send, message:review
design:upload, design:review:cs, design:confirm:doctor
bill:upload, logistics:ship
ai:translate, ai:check-missing, ai:cs-query, ai:order-query, ai:production-note

5.4 审计范围

6. 订单状态机：internal_status 与 external_status

订单必须维护内部真实状态 internal_status 与医生端外部状态 external_status 两套状态。external_status 是医生端唯一可见进度，任何内部工序节点、员工、入检/出检、返工、工时、绩效均不得通过医生端接口、WebSocket、文件接口或 AI-3 输出。

6.1 external_status 枚举

6.2 internal_status 建议枚举

6.3 OrderStatusProjector

external_status 不允许前端传值，也不允许各业务模块随意写。

所有内部状态和工序节点状态变更后，由 OrderStatusProjector 统一刷新 external_status 与 order_external_projection。

投影更新必须与状态变更在同一事务内完成，或使用本地事件表保证最终一致。

状态历史写入 order_status_history。

updateOrderState(orderId, businessAction):
  begin transaction
    lock orders where order_id = ?
    execute business action: review / instantiate / node complete / ship / confirm receipt
    write order_status_history
    OrderStatusProjector.refresh(orderId)
    write notification_event if needed
  commit

7. 医生端脱敏设计

脱敏是本系统的一期红线。必须采用“接口隔离 + DTO/VO 隔离 + 查询层过滤 + AI 工具隔离 + 文件访问隔离 + WebSocket 事件隔离 + 专项测试”七层防线，禁止依赖前端隐藏字段。

7.1 医生端只读投影

7.2 医生端禁止返回字段

7.3 医生端接口与内部接口隔离

GET /orders/{orderId} 对 DOCTOR 返回 DoctorOrderVO；对 CS/WORKER/ADMIN 返回授权内部 DTO。

DOCTOR 调用 /orders/{orderId}/process-instance、/check-records、/work-logs、/performance 等内部接口必须返回 403。

医生端文件接口不返回内部附件 file_id；只有医生可见附件可生成签名 URL。

医生端 WebSocket 仅发送 order_id、order_no、external_status、公开提示文案，不发送内部事件详情。

8. 9 条生产工艺流建模

一期 9 条工艺流来自《生产流程.docx》与 PRD，固定初始化到数据库。管理端只读查看与员工绑定/转派，不提供工艺模板后台增删改或可视化拖拽。

8.1 一期工艺流引擎选型

8.2 9 条工艺流摘要

8.3 定义层表设计

9. 订单工序实例化机制

9.1 触发时机

生产端数据审核通过时触发工序实例化，即 POST /orders/{orderId}/production-review action=APPROVE。该操作必须在数据库事务中完成：订单锁定、工序实例头创建、节点快照创建、边快照创建、首批可执行节点判断、状态投影、通知事件落库。

9.2 实例化步骤

读取订单 product_type、form_data 中的取模方式和路线字段；若 PRD 未定义的路线需生产审核时确认，则写入 branch_params。

按 product_type 匹配 workflow_chain；按 branch_key、condition_key 过滤不适用分支。

创建 order_process_instance，保存 chain_id、chain_version、intake_branch_used、branch_params。

复制 workflow_node 到 order_process_node，保存节点快照字段：node_code、process_name、step_order、is_optional、branch_group、branch_key、standard_duration、default_role、node_category、need_in_check、need_out_check。

复制 workflow_edge 到 order_process_edge，订单运行时只读实例边，不回查模板边。

初始化节点状态：前置条件未满足为 PENDING；无前置且已派工/可执行的节点进入 READY 或 ASSIGNED。

刷新 internal_status 与 external_status，写 order_status_history 和 notification_event。

9.3 快照要求

模板变更不得影响历史订单。订单实例运行时只读取 order_process_node 与 order_process_edge。

已完成节点、检查记录、工时记录、返工记录不得物理删除。

如果后续必须调整进行中订单工序，只能由 ADMIN 操作并记录变更历史；是否允许增删节点见待确认问题。

10. 工序节点状态机、并联与可选节点

10.1 节点状态定义

10.2 状态流转规则

PENDING -> READY -> ASSIGNED -> IN_PROGRESS -> PAUSED -> IN_PROGRESS
IN_PROGRESS -> WAITING_OUT_CHECK -> COMPLETED
WAITING_OUT_CHECK -> REWORK_PENDING -> READY/ASSIGNED/IN_PROGRESS
PENDING/READY/ASSIGNED -> SKIPPED  // 仅可选节点且有审核记录
READY/ASSIGNED/IN_PROGRESS -> CANCELLED  // 仅 ADMIN 流程调整或返工影响

10.3 并联汇合规则

一期只实现“全部有效前驱完成才汇合”。不实现任一分支完成即可继续、比例汇合或复杂网关。

后继节点的所有有效前驱节点状态均为 COMPLETED 或 SKIPPED 后，后继节点才可进入 READY。

并联节点可同时分配给不同员工；汇合节点不得提前进入任务池。

canActivate(node):
  predecessors = order_process_edge.where(to_node_id = node.id and active = 1)
  return all(predecessor.status in [COMPLETED, SKIPPED] for predecessor in predecessors)

onNodeCompleted(node):
  begin transaction
    lock node
    set node.status = COMPLETED
    for next in successors(node):
      if canActivate(next):
        set next.status = READY or ASSIGNED
    OrderStatusProjector.refresh(order_id)
  commit

10.4 可选节点规则

如果是否出现取决于订单字段或生产审核选择，实例化时不生成不适用节点。

如果节点已生成但工厂人工判断无需执行，必须由授权人员跳过并记录原因，状态设为 SKIPPED。

可选节点是否允许医生端触发不在一期范围；医生端不可见内部可选节点。

11. 入检 / 出检 / 返工流程

11.1 入检流程

WORKER 在任务池打开已分配/可执行节点，提交 check_type=IN 的入检记录。

服务端校验当前用户是 assigned_user_id 或具备 ADMIN 权限；前置节点已完成；该节点未存在有效通过入检。

入检通过后允许开始工时；如入检不通过，记录问题并通知生产管理/ADMIN 处理。

入检附件只对内部角色可见，医生端不可见。

11.2 出检流程

WORKER 完成工序后提交 check_type=OUT 的出检记录。

服务端强制校验：未入检通过不可出检；未完成工时不可出检（若特殊工序不记工时需权限配置确认）。

出检通过：节点状态 COMPLETED，触发后继节点激活与订单状态投影。

出检不通过：remark 必填，rework_to_node_id 必填，进入返工流程。

11.3 返工流程

11.4 事务一致性

check_record、rework_record、order_process_node 状态、order_status_history、notification_event 必须在同一事务内写入。

同一节点不能并发出检；对 node_instance_id 加数据库行锁或乐观锁。

返工回退范围计算不得物理删除下游数据。

12. 工时计时与绩效统计

12.1 工时状态机

NOT_STARTED -> RUNNING      POST /work-logs/start
RUNNING     -> PAUSED       POST /work-logs/{id}/pause
PAUSED      -> RUNNING      POST /work-logs/{id}/resume
RUNNING     -> FINISHED     POST /work-logs/{id}/finish
actual_duration = end_time - start_time - pause_duration

12.2 工时实现规则

工时开始、暂停、继续、完成均以服务端时间为准，不接受前端上传实际工时。

同一 node_instance_id 同一时间只能存在一条未完成 work_log。

start/pause/resume/finish 必须支持幂等，避免重复点击创建重复记录。

pause 操作记录 pause_start_time；resume 累加 pause_duration。若排期允许，增加 work_log_pause_segment 保存暂停明细。

finish 时计算 actual_duration，并将节点状态推进到 WAITING_OUT_CHECK。

工时和绩效默认只对 WORKER 本人及 ADMIN 可见。

12.3 绩效指标

13. 文件上传与权限访问

一期文件能力只覆盖 PRD 明确范围：上传、绑定订单/消息/设计稿/账单、私有桶存储、短时效预览/下载、服务端权限校验、访问审计。

13.1 一期上传方案

13.2 上传流程

前端调用 POST /files/upload-token，传 file_name、content_type、size、biz_type、order_id。

后端校验角色、订单归属、文件大小/类型，创建 file_resource(upload_status=INIT)。

后端生成 MinIO 预签名上传 URL 或 Multipart 上传参数，返回 file_id、object_key、upload 参数。

Uppy 直传对象存储。

前端调用上传完成确认接口；后端校验对象后将 file_resource 置为 COMPLETED。

业务提交订单/消息/设计稿/账单时只提交 file_id；后端再次校验 file_id 属于当前业务上下文。

13.3 Object Key 规范

{env}/clinic/{clinic_id}/yyyy/mm/order/{order_id}/{category}/{uuid}.{ext}

object_key 不写医生姓名、诊所中文名、患者信息、内部工序名等敏感信息。

biz_type/category 仅使用系统枚举：ORDER_ATTACHMENT、MESSAGE_ATTACHMENT、DESIGN_DRAFT、BILL、CHECK_INTERNAL 等。

13.4 预览/下载鉴权

preview-url 有效期 15 分钟；download-url 有效期 2 小时。

每次生成签名 URL 前必须执行 FileAccessPolicy，校验订单归属、角色、消息可见性、设计稿状态、附件类型。

文件原始 object_key 不直接返回给前端；医生端不返回内部附件 file_id。

上传、预览、下载均写 file_access_audit。

13.5 文件类型权限

14. AI 智能体接入与数据边界

一期 AI 只做助手，不做决策。所有 AI 能力必须经后端鉴权、数据范围过滤、工具白名单和审计，禁止 AI 直接查库、生成 SQL、访问通用查询接口。

14.1 AI 调用链路

Frontend
  -> Spring Boot AI Controller
  -> Auth/RBAC/DataScope
  -> AiToolRegistry selects allowed tools by agent_code + role
  -> AiContextService builds filtered context
  -> PromptBuilder
  -> LangChain + DeepSeek
  -> OutputGuard
  -> AiAuditLog
  -> UI displays answer/draft; human confirms before writing business fields

14.2 五个 AI 智能体权限矩阵

14.3 工具白名单

14.4 AI-3 医生端安全读模型

AI-3 只能调用 DoctorOrderAssistantReadModel。该模型不包含 process_instance、process_node、check_record、work_log、rework_record、worker_user、assigned_user_id、internal_note、performance 等字段。权限必须在工具层和服务层完成，不能依赖 prompt 要求模型“不要说”。

14.5 AI 输出与审计

所有 AI 产出默认是草稿或回答，不直接修改订单、工序、生产备注、审核状态。

AI 输出写入业务字段必须人工点击确认，并记录确认人和确认时间。

ai_audit_log 记录 agent_code、user_id、role、order_id、input_hash/input_summary、context_scope、output_hash/output_summary、model、token_usage、latency、result、adopted_flag。

AI 失败不得影响主业务流程；翻译/查询/备注失败时允许人工继续。

AI 错误信息不得暴露内部表名、字段名、SQL、堆栈。

15. WebSocket 与通知机制

WebSocket 用于实时提醒，不作为消息事实来源。所有通知先写 notification_event / user_notification，再尝试推送；离线用户重新登录后从通知表补读未读。

15.1 事件与可见性

15.2 通道建议

/user/queue/order-public       // 医生端外部订单通知
/user/queue/cs-workbench       // 客服审核、消息、账单物流通知
/user/queue/production-task    // 生产任务、转派、返工通知
/user/queue/admin-alert        // 管理端关键审计/异常通知

15.3 多实例说明

一期单实例可直接由应用内 WebSocket 推送。

如部署多实例，可使用 Redis Pub/Sub 做在线广播加速层，但可靠性仍以数据库通知表为准。

前端收到事件后只触发列表/详情刷新，不直接相信事件 payload 更新关键状态。

16. 数据库表设计与索引

以下表结构是一期技术实现表，不新增用户可见功能。字段可按 RuoYi 命名规范添加 create_time、update_time、creator、updater、deleted、tenant/clinic 数据范围字段。

16.1 核心业务表清单

16.2 关键技术字段补充

16.3 索引建议

orders:
  uq_order_no(order_no)
  idx_order_doctor(doctor_user_id, create_time)
  idx_order_clinic_status(clinic_id, external_status, create_time)
  idx_order_internal_status(internal_status, create_time)

order_process_node:
  idx_node_instance(instance_id, step_order)
  idx_node_assignee(assigned_user_id, node_status, create_time)
  idx_node_status(node_status)
  idx_node_order(order_id, node_status)

check_record:
  idx_check_node(node_instance_id, check_type, check_time)

work_log:
  idx_work_node(node_instance_id)
  idx_work_worker(worker_user_id, start_time)
  idx_work_status(status)

file_resource:
  idx_file_order(order_id, biz_type, create_time)
  idx_file_uploader(uploader_id, create_time)
  idx_file_status(upload_status)

order_message/design_draft/ai_audit_log:
  idx_msg_order(order_id, create_time)
  uq_draft_version(order_id, version)
  idx_ai_order(order_id, agent_code, create_time)

16.4 并发控制与幂等

orders、order_process_node、work_log 等状态表增加 version 字段，使用乐观锁。

生产审核实例化、出检、返工、工时 start/pause/resume/finish 必须在服务层事务中执行。

工时动作、出检、返工可带 idempotency_key；重复请求返回已有结果，不重复写记录。

任务领取/转派如出现并发，锁定 node_instance_id 后更新。

17. 核心接口设计与 API 约束

一期接口以 API规范_OpenAPI3.0.yaml 为契约，不新增未说明的业务接口。以下为实现约束与 YAML 修复建议。

17.1 模块接口范围

17.2 统一接口约束

除登录外，所有接口必须携带 Authorization: Bearer {access_token}。

所有查询接口必须应用角色权限和数据范围。

状态变更接口不得相信前端传入的状态字段，状态由服务端计算。

文件 preview/download 接口必须先业务鉴权再签名。

AI 接口必须按 agent_code 与当前角色绑定工具白名单。

工时动作与出检/返工接口建议支持 idempotency_key。

17.3 API YAML 修复项

修复 1：duration_efficiency 缺少空格
原：duration_efficiency:{ type: number, description: 工时效率（标准工时÷实际工时×100%）}
改：duration_efficiency: { type: number, description: 工时效率（标准工时÷实际工时×100%）}

修复 2：/form-configs 重复定义
应合并 get/post 到同一个 path key：
/form-configs:
  get: ...
  post: ...

18. 部署架构、日志审计与安全

18.1 Docker 组件

18.2 环境与密钥

测试环境与正式环境使用独立域名、数据库、Redis、MinIO bucket、DeepSeek Key。

.env、数据库密码、MinIO 密钥、DeepSeek API Key 不得提交 Git。

生产环境强制 HTTPS。

所有关键操作日志带 trace_id/order_id/operator，方便验收与排障。

18.3 审计日志

审计日志至少覆盖登录、上传/预览/下载、订单审核、生产审核、派工、转派、入检、出检、返工、工时动作、设计稿审核、消息审核、发货、AI 查询。

19. 测试验收矩阵

一期验收以 PRD 的 12 步主链路为主，叠加权限脱敏、文件越权、AI 越权、状态一致性、并发幂等专项测试。

19.1 主链路验收

19.2 专项测试

20. 里程碑与开发工程师执行计划

20.1 开发工程师优先级

21. 深度研究采纳矩阵

21.1 已纳入一期的内容

21.2 仅作为一期预留/建议的内容

21.3 放入二期规划的内容

22. 待确认问题

以下问题不会阻塞本版 TRD 输出，但会影响开发细节。开发前建议由项目经理/客户确认。未确认前，按“默认执行口径”实现。

Q1-Q4 建议在 M1 冻结前确认，避免影响数据库和权限设计。

Q5-Q8 不改变一期范围，但会影响上传、AI 和字段初始化实现。

项目 | 内容
版本 | V1.1（在 V1.0 TRD 基础上增量优化）
适用角色 | 开发工程师 / 全栈开发 / 后端架构评审 / 测试验收
约束原则 | 严格基于 PRD 与数据源文件；深度研究内容只作为技术实现优化，不扩大一期功能范围。
不新增功能声明 | 不纳入 Flowable/Camunda/LiteFlow 主流程引擎、可视化拖拽工艺流、Tus/tusd 独立上传服务、秒传/去重/冷热归档、复杂多 Agent 自动决策、物流 API 自动同步等未在一期明确要求的功能。
不确定处理 | 不明确或数据源存在冲突的事项进入“待确认问题”，不在实现时自行脑补。

类别 | 本次优化内容 | 一期处理方式
范围控制 | 将深度研究建议拆分为一期必须、一期建议、二期规划。 | 直接纳入 TRD 执行口径。
工艺流 | 明确一期自研轻量 DAG，保留 9 条固定工艺流初始化，不做后台拖拽编辑。 | 一期必须。
工序实例 | 强化订单级快照、边表、并联汇合、可选节点、返工影响范围。 | 一期必须，按 PRD 主链路实现。
脱敏 | 新增医生端外部投影视图/读模型、WebSocket/文件/AI 多层隔离。 | 一期必须。
文件 | 收敛为 Uppy + MinIO 私有桶 + 服务端鉴权 + 预签名 URL；不默认引入 tusd。 | 一期必须；Multipart 按文件大小阈值实现/预留。
AI | 固定 5 个 AI 智能体边界，新增工具白名单、AI-3 医生安全读模型、人工确认规则。 | 一期必须。
并发与测试 | 补充事务边界、乐观锁/幂等键、专项测试矩阵。 | 一期必须/建议。

优先级 | 数据源 | 用途
P0 | AI智能下单平台_PRD_V1.0.docx | 一期范围、P0 功能、状态、角色权限、工艺流、数据库字段、验收标准、API 摘要。
P0 | API规范_OpenAPI3.0.yaml | 接口契约、请求/响应结构、权限边界、状态字段、文件/AI/WebSocket 接口。
P0 | 生产流程.docx | 客户提供的 9 类牙科产品生产工艺路线原始资料，用于初始化工艺流。
P1 | 团队执行与协作文档 | 开发工程师职责、里程碑、Git/PR、验收推进方式。
P1 | TRD V1.0 | 当前技术设计基础，本版在其上做收敛和增量优化。
P2 | 深度研究报告 | 作为技术实现最佳实践参考；只采纳不扩大一期范围的部分。

模块 | 一期交付内容
医生端 | 登录、在线下单、动态表单、草稿/补资料、文件上传、订单列表/详情、外部进度查询、设计稿确认/驳回、账单物流查看、消息、AI 客户订单助手、确认收货。
客服端 | 订单初审、AI 翻译校对、资料缺失检查、客户档案与偏好、订单消息审核、设计稿审核、账单上传、物流录入、客服查询助手。
生产端 | 生产数据审核、我的任务池、工序入检、工序执行、工时开始/暂停/继续/完成、出检、返工、质检、绩效看板、设计稿上传、生产备注助手。
管理端 | 用户/角色/权限、诊所账号、工序链只读查看、订单工序实例查看、工序员工绑定、转派、全量绩效与审计。
AI 能力 | 5 个智能体：翻译助手、客服查询助手、客户订单助手、资料缺失助手、生产备注助手；全部为辅助/草稿/查询，不做自动审核和自动决策。
基础设施 | RuoYi-Vue-Pro RBAC、JWT/Refresh Token、MySQL、Redis、MinIO 私有桶、Uppy 上传、WebSocket、Docker 环境隔离。

不做项 | 处理方式
DAG 可视化编辑器 / 工艺流拖拽建模 | 不做；9 条工艺流由开发初始化写入数据库，管理端只读查看。
工序库增删改后台 | 不做；工序名称固定在工序链定义与初始化脚本中。
Flowable / Camunda / LiteFlow 作为主流程引擎 | 不做；一期自研轻量 DAG 工艺流运行时。二期如需通用 BPM 再评估。
订单级自由拖拽编排 | 不做；仅支持 PRD 明确的员工绑定、转派。是否允许订单节点增删改列入待确认。
物流 API 自动同步 | 不做；一期手动录入承运商和运单号，字段预留。
客户自助注册 | 不做；一期由管理员创建账号。
Tus/tusd 独立上传服务 | 不默认做；一期采用 Uppy + MinIO 预签名/Multipart 能力。
秒传、文件去重、冷热归档 | 不做；一期只保证上传、绑定、预览/下载鉴权和审计。
复杂多 Agent 自动编排 / AI 自动派工审核 | 不做；AI 只做助手和草稿，人审后生效。

层级 | 技术/组件 | 一期职责
前端 | Vue3 + Element Plus + Uppy | 医生端、客服端、生产端、管理端页面；动态表单；文件上传组件；WebSocket 通知展示。
后端 | Spring Boot + RuoYi-Vue-Pro | 认证授权、订单、工艺流、入检出检、工时、消息、文件、AI 网关、审计、REST API。
数据库 | MySQL | 订单、工序定义/实例、检查记录、工时、文件元数据、消息、设计稿、账单物流、审计日志。
缓存/会话 | Redis | Token/黑名单、热点配置缓存、WebSocket 会话映射、必要的短时锁或限流。
对象存储 | MinIO 私有桶 | STL、口扫、图片、PDF、X 光、设计稿、账单、消息附件。
AI | LangChain + DeepSeek | 5 个 AI 智能体的模型调用与受控工具编排。
部署 | Docker + Nginx | 测试/正式环境隔离、静态资源、API/WS 反向代理、HTTPS 入口。

模块 | 职责 | 关键服务/约束
system-auth | 继承 RuoYi 登录、用户、角色、菜单、权限、Token、审计日志。 | AuthController、PermissionService、DataScopeInterceptor。
clinic-user | 诊所、医生账号归属、客户偏好。 | ClinicService、CustomerPreferenceService。
order-form | 动态表单配置、订单创建/草稿/补资料、订单审核。 | OrderService、OrderReviewService、OrderFormValidator。
order-status | internal_status/external_status、状态历史、医生端投影。 | OrderStatusService、OrderStatusProjector。
workflow-definition | 9 条工艺流定义、节点、边、初始化脚本、只读查询。 | WorkflowSeedRunner、WorkflowChainService。
workflow-runtime | 工序实例化、节点快照、任务池、派工、转派、并联汇合。 | ProcessInstanceService、ProcessFlowEngine、TaskService。
check-rework | 入检、出检、返工记录、返工影响范围。 | CheckRecordService、ReworkService。
worklog-performance | 工时开始/暂停/继续/完成、绩效统计。 | WorkLogService、PerformanceService。
file-center | 上传令牌、文件元数据、预览/下载签名 URL、文件权限、审计。 | FileService、MinioService、FileAccessPolicy。
message-design | 订单消息、生产消息客服审核、设计稿版本与确认。 | OrderMessageService、DesignDraftService。
bill-logistics | 账单上传、物流录入、发货状态触发。 | BillService、LogisticsService。
ai-gateway | AI 上下文构造、工具白名单、模型调用、输出防护、审计。 | AiGatewayService、AiToolRegistry、AiAuditService。
notification-ws | 通知表、WebSocket 会话、在线推送、未读补偿。 | NotificationService、WsSessionRegistry。

目录 | 页面范围
src/views/doctor | 下单、订单列表、订单详情、设计稿确认、账单物流、留言、AI 订单助手。
src/views/cs | 审核队列、订单详情、客户档案、偏好、消息审核、账单物流、AI 查询/翻译。
src/views/production | 数据审核、我的任务池、入检出检、工时、设计稿上传、生产备注。
src/views/admin | 用户角色、诊所、工序链查看、工序实例、派工转派、绩效审计。
src/api | 按 auth/order/file/workflow/check/worklog/ai/message/draft/bill 拆 API。

角色编码 | 角色名称 | 入口 | 核心权限
DOCTOR | 医生 / 诊所账号 | 医生端 | 下单、上传文件、查看外部进度、确认设计稿、查看账单物流、发送留言、确认收货、使用客户订单助手。
CS | 客服 / CS 中台 | 客服端 | 订单初审、AI 翻译校对、客户档案/偏好、账单物流、消息审核、客服查询助手。
WORKER | 技工 / 生产人员 | 生产端 | 数据审核、任务池、入检、出检、工时登记、设计稿上传、生产备注助手。质检/发货如不建新角色，使用权限点区分。
ADMIN | 超级管理员 | 管理端 | 账号角色、工序链查看、订单工序实例、员工绑定、转派、全量绩效、审计。

审计对象 | 必须记录的信息
登录/登出 | user_id、role、ip、user_agent、时间、结果。
订单审核/驳回 | order_id、from_status、to_status、operator、原因。
生产审核/实例化 | order_id、chain_id、chain_version、operator、结果。
派工/转派 | node_instance_id、old_user_id、new_user_id、reason、operator。
入检/出检/返工 | node_instance_id、check_type、is_pass、rework_to_node_id、reason、attachment_file_ids。
工时 | work_log_id、node_instance_id、action、operator、server_time、幂等键。
文件访问 | file_id、biz_type、order_id、user_id、action、ip、user_agent。
AI 调用 | agent_code、user_id、role、order_id、context_scope、token_usage、是否人工采纳。

编码 | 医生端文案 | 触发条件
PENDING_REVIEW | 待审核 | 医生提交订单后；客服驳回后医生补资料重新提交前后仍显示待审核。
DESIGNING | 设计中 | 客服审核通过后，订单进入设计/CAD/设计稿确认相关阶段。
PRODUCING | 生产中 | 进入任意非质检生产工序。
QC | 质检中 | 进入终检/质检阶段。
PENDING_SHIP | 待发货 | 质检通过，等待客服/发货录入物流。
SHIPPED | 已发货 | 承运商和运单号已录入。
COMPLETED | 已完成 | 医生确认收货，订单关闭。

编码 | 说明 | 外部映射
DRAFT | 医生保存草稿，未提交。 | 无外部进度或仅草稿展示。
PENDING_CS_REVIEW | 客服待初审。 | PENDING_REVIEW
CS_REJECTED | 客服驳回资料，等待补资料。 | PENDING_REVIEW
PENDING_PRODUCTION_REVIEW | 客服通过，生产数据审核。 | PENDING_REVIEW 或 DESIGNING，按订单阶段投影。
PRODUCTION_REJECTED | 生产数据审核不通过。 | PENDING_REVIEW
PROCESS_INSTANCE_CREATED | 生产审核通过，工序实例已生成。 | DESIGNING/PRODUCING，按首个有效节点阶段投影。
ASSIGNED | 工序节点已分配员工。 | DESIGNING/PRODUCING
IN_DESIGN | 设计/设计稿确认相关阶段。 | DESIGNING
IN_PRODUCTION | 主要生产工序执行中。 | PRODUCING
IN_QC | 终检/质检中。 | QC
QC_PASSED | 质检通过待发货。 | PENDING_SHIP
SHIPPED | 物流已录入。 | SHIPPED
COMPLETED | 医生确认收货。 | COMPLETED

对象 | 说明
order_external_projection | 医生端、AI-3、医生端订单列表/详情、医生端 WebSocket 刷新时的唯一订单进度来源。
DoctorOrderVO | 只包含 order_no、product_type、external_status、医生可见 form_data、设计稿可见版本、账单物流、医生可见消息。
DoctorOrderAssistantReadModel | AI-3 专用读模型，只返回外部状态、设计稿确认状态、账单物流、医生端可见消息摘要。

禁止字段/数据 | 禁止范围
internal_status | 医生端订单接口、AI-3、WebSocket payload。
process_instance / process_node / node_instance_id | 医生端无入口，不返回任何工序实例信息。
assigned_user_id / 员工姓名 | 任何医生端响应不得包含。
check_record 入检/出检 | 包括是否通过、问题说明、附件、检查人。
work_log / performance | 包括开始/结束时间、暂停、实际工时、返工工时、绩效。
rework_record | 医生端不得显示返工、责任分类、回退节点。
内部备注/生产备注内部字段 | 医生端只展示经客服确认可公开的消息或说明。

选型点 | 一期结论
主流程引擎 | 自研轻量 DAG 工艺流运行时。
不采用 | Flowable、Camunda、LiteFlow 不作为一期主业务引擎。
原因 | 9 条固定工艺流、无拖拽建模、核心是牙科生产节点快照/入检/出检/工时/返工/脱敏，通用 BPM 引擎收益不足。
二期演进 | 如未来要做工艺模板可视化、多版本发布、复杂审批流，再评估通用工作流/规则引擎。

工艺流 | 阶段摘要 | 实现注意点
常规冠修复 | 下单入厂；印模/口扫分支；CAD；车金；上瓷；车瓷；上釉/抛光/质检/账单/发货。 | CAD 确认设计、车瓷形态确认为可选节点；取模二选一。
种植类修复 | 下单入厂；取模分支；种植入货检；基台分支；CAD；车金；上瓷；车瓷；发货。 | 成品基台/个性化基台分支需在订单字段或生产审核中确认。
精密附件 | CAD 金属打印；车金；上瓷；车瓷；钢托；胶托；收尾发货。 | 长链路且同名节点重复，节点编码必须带阶段/序号。
套筒冠 | 模型；内冠；外冠；车金；钢托；上瓷；车瓷；胶托；发货。 | 同名 CAD 入货检/车金入货检需区分实例编码。
贴面修复 | 下单入厂；取模分支；切削路线/传统路线；上瓷/车瓷；收尾发货。 | 路线选择字段或生产审核选择需确认。
活动件-钢托 | 下单入厂；取模分支；钢托制作；排牙充胶；质检发货。 | 确认设计、确认排牙为可选节点。
活动件-胶托 | 下单入厂；取模分支；排牙、刻蜡、充胶、打磨、抛光、质检发货。 | 确认排牙为可选节点。
活动件-隐形 | 下单入厂；取模分支；复模；选牙排牙；刻蜡；落盒充胶；打磨抛光；质检发货。 | 原始流程存在箭头缺失，初始化脚本需标准化。
正畸 | 下单入厂；取模分支；CAD 设计；打磨就位；质检；发货。 | 链路较短，但仍执行入检/出检/工时规则。

表 | 关键字段 | 说明
workflow_chain | chain_id, chain_code, chain_name, product_type, version, status | 9 条预定义链；只读查询；修改通过脚本发布新 version。
workflow_node | node_id, chain_id, node_code, process_name, stage_name, step_order, is_optional, branch_group, branch_key, standard_duration, default_role, node_category, need_in_check, need_out_check | 节点定义；同名节点用 node_code + step_order 区分。
workflow_edge | edge_id, chain_id, from_node_id, to_node_id, edge_type, condition_key | 技术补充表，用于表达 DAG 前后置关系、分支、并联汇合，避免只靠 step_order。

状态 | 含义 | 进入条件
PENDING | 未激活/等待前置完成 | 实例化后前置条件未满足，或返工后等待重新执行。
READY | 可执行/可领取 | 所有有效前置节点完成或跳过，且尚未派工或可领取。
ASSIGNED | 已派工 | ADMIN 绑定 assigned_user_id 后，员工可在任务池看到。
IN_PROGRESS | 执行中 | 入检通过并开始执行/工时。
PAUSED | 暂停中 | 工时暂停；暂停期间不计有效工时。
WAITING_OUT_CHECK | 待出检 | 工序执行/工时完成，等待提交出检。
COMPLETED | 已完成 | 出检通过。
REWORK_PENDING | 返工待处理 | 出检不通过并指定返工目标后，目标节点或受影响节点待重新处理。
SKIPPED | 已跳过 | 人工审核确认跳过的可选节点；需记录原因。
CANCELLED | 已取消/失效 | 因流程调整或返工影响不再作为当前有效节点。

规则 | 一期实现
返工触发 | 出检不通过。
必填信息 | 来源节点、目标节点、原因、责任分类、附件（可选）、操作人。
目标限制 | rework_to_node_id 必须属于同一 order_process_instance，且为允许返工的前置/当前阶段节点。
历史处理 | 不删除已完成记录；受影响后续节点进入 REWORK_PENDING/READY 或 CANCELLED，并保留历史。
工时处理 | 返工产生新的 work_log，is_rework=1，不覆盖原工时。
医生端可见性 | 医生端不得看到返工、责任分类、返工附件、返工工时。

指标 | 计算口径
完成数量 completed_count | 统计周期内 node_status=COMPLETED 且出检通过的工序数。
有效工时 effective_duration | 统计周期内 work_log.actual_duration 求和，暂停时间不计入。
返工次数 rework_count | 以 rework_record 数量为准。
准时率 on_time_rate | 实际工时 <= standard_duration 的完成工序数 / 总完成工序数。
通过率 pass_rate | 一次出检通过数 / 总出检数；返工后通过不计一次通过。
工时效率 duration_efficiency | 标准工时合计 / 实际有效工时合计 × 100%。

能力 | 一期方案
前端组件 | Uppy。
对象存储 | MinIO 私有桶。
上传方式 | 后端生成预签名上传参数，前端直传 MinIO；大文件按阈值启用 S3 Multipart。
不采用 | 不默认部署 Tus/tusd 独立服务，不做秒传/去重/冷热归档。
完成确认 | 前端上传完成后调用后端 complete；后端 statObject 校验对象存在、大小、类型、etag 后写入 COMPLETED。

场景 | 文件类型 | 权限规则
医生下单附件 | STL、口扫、JPG、PNG、PDF、DCM/X 光、处方 | 医生可上传和查看自己的订单附件；CS/生产按业务权限查看。
消息附件 | 图片、PDF、补充资料 | 按消息 visible_to 与 review_status 控制可见性。
设计稿文件 | 图片、STL、PDF 等 | 生产/CS/ADMIN 可见全部；医生只看待确认、已确认、医生驳回版本；CS_REJECTED 不可见。
账单文件 | PDF/图片 | CS/ADMIN 上传；医生只读。
入检/出检附件 | 照片、问题说明附件 | 仅内部角色可见，医生端不可见。

AI | 入口/权限 | 可读数据 | 输出与写入规则 | 禁止能力
AI-1 翻译助手 | CS/ADMIN | 订单原始外文描述、留言、生产备注文本。 | 生成 translated_text 草稿；客服确认后才写入。 | 不得自动发送、不得自动覆盖原文。
AI-2 客服查询助手 | CS/ADMIN | 授权内部订单、当前工序、预计发货、物流、客户偏好、历史沟通。 | 仅客服端展示；如对外发送需客服确认。 | 不得绕过 CS 权限，不自动发给医生。
AI-3 客户订单助手 | DOCTOR | DoctorOrderAssistantReadModel：external_status、物流、账单状态、医生端可见消息。 | 自然语言回答，仅基于外部可见信息。 | 不得读取工序、员工、入检/出检、工时、绩效、返工、责任分类。
AI-4 资料缺失助手 | DOCTOR/CS/ADMIN | 动态表单字段、必填项、已上传文件类别。 | 返回缺失项提示。 | 不得自动驳回订单。
AI-5 生产备注助手 | CS/WORKER/ADMIN | 订单摘要、客户要求、客服/生产备注草稿。 | 生成标准化生产备注草稿，人工确认后保存。 | 不得自动下发正式指令。

智能体 | 允许工具
AI-1 | TranslateOrderTextTool、TerminologyNormalizeTool。
AI-2 | CsOrderQueryTool、CsWorkflowSummaryTool、LogisticsQueryTool、CustomerPreferenceTool。
AI-3 | DoctorOrderPublicStatusTool、DoctorLogisticsTool、DoctorBillStatusTool、DoctorVisibleMessageTool。
AI-4 | FormRequiredFieldCheckTool、FileCategoryCheckTool。
AI-5 | ProductionNoteDraftTool、OrderRequirementSummaryTool。

事件 | 接收方 | 医生端是否可见
ORDER_SUBMITTED / ORDER_REVIEWED / ORDER_REJECTED | CS/DOCTOR/ADMIN 按场景 | 仅外部文案。
PROCESS_INSTANCE_CREATED / TASK_ASSIGNED / TASK_REASSIGNED | WORKER/ADMIN/CS | 不可见。
DESIGN_DRAFT_UPLOADED / CS_APPROVED / CS_REJECTED / DOCTOR_CONFIRMED / DOCTOR_REJECTED | 按设计稿流程 | 医生只收客服通过后、待确认/确认/驳回相关公开事件。
MESSAGE_RECEIVED / MESSAGE_PENDING_REVIEW / MESSAGE_REVIEW_REJECTED | 按消息可见性 | 医生只收直接可见或审核通过消息。
BILL_UPLOADED / LOGISTICS_CREATED / ORDER_COMPLETED | DOCTOR/CS/ADMIN | 可见公开账单物流状态。

领域 | 表名 | 用途
用户权限 | sys_user, sys_role, sys_menu, sys_operate_log | 复用 RuoYi。sys_user 增加 clinic_id 或用户-诊所关系。
诊所 | clinic, customer_preference | 诊所资料、负责客服、客户偏好。
订单 | orders, order_status_history, order_external_projection | 订单主数据、状态历史、医生端外部投影。
动态表单 | form_field_config | 按 product_type 配置字段，订单 form_data JSON 存值。
工艺流定义 | workflow_chain, workflow_node, workflow_edge | 9 条固定工艺流、节点、DAG 边。
工序实例 | order_process_instance, order_process_node, order_process_edge | 订单级快照与运行时状态。
检查返工 | check_record, rework_record | 入检/出检/返工记录。
工时绩效 | work_log, work_log_pause_segment(建议) | 工时、暂停明细、绩效计算来源。
文件 | file_resource, file_access_audit | 文件元数据、上传状态、访问审计。
消息设计稿 | order_message, message_review_log, design_draft | 留言、客服审核、设计稿版本。
账单物流 | order_bill, order_logistics | 账单文件、承运商、运单号、发货时间。
AI | ai_audit_log | AI 调用、上下文范围、输出摘要、人工采纳。
通知 | notification_event, user_notification | 消息事实来源、未读补偿。

表 | 建议补充字段 | 原因
orders | version, external_status, internal_status, clinic_id, doctor_user_id, cs_user_id | 状态并发控制、医生端投影和数据隔离。
order_process_node | node_code_snapshot, branch_group_snapshot, required_predecessor_count, assigned_user_id, node_status, version | 快照、并联汇合、任务池、并发控制。
work_log | status, pause_duration, pause_count, idempotency_key, is_rework, version | 暂停、幂等、返工工时、并发控制。
file_resource | object_key, bucket_name, biz_type, order_id, clinic_id, upload_status, etag, size, uploader_id | 私有桶对象管理、业务绑定、鉴权。
ai_audit_log | agent_code, role_code, context_scope, input_hash, output_hash, token_usage, adopted_flag | AI 权限与可追溯。

模块 | 主要接口
Auth | /auth/login, /auth/refresh, /auth/logout
User/Clinic | /users, /clinics, /clinics/{clinicId}/preference
Form | /form-configs
File | /files/upload-token, /files/{fileId}/preview-url, /files/{fileId}/download-url
Order | /orders, /orders/{orderId}/review, /orders/{orderId}/production-review, /orders/{orderId}/confirm-receipt
Workflow | /workflow-chains, /workflow-chains/{chainId}/nodes, /orders/{orderId}/process-instance, /tasks/mine
Check/WorkLog/Performance | /check-records, /work-logs/start|pause|resume|finish, /performance
Message/Design/Bill/Logistics | /orders/{orderId}/messages, /design-drafts, /bill, /logistics
AI | /ai/translate, /ai/check-missing, /ai/cs-query, /ai/order-query, /ai/production-note
WebSocket | /ws/connect 文档说明，连接携带 Token。

组件 | 一期用途 | 备注
nginx | HTTPS 入口、静态资源、反向代理 /api /ws。 | 上传大小和超时需与文件上传方案一致。
web | Vue3 构建产物。 | 可由 nginx 直接托管。
api | Spring Boot / RuoYi-Vue-Pro 主服务。 | 核心业务与事务边界在此。
mysql | 业务数据库。 | 每日备份，M6 前演练恢复。
redis | Token/缓存/WebSocket 会话/必要锁。 | 不作为可靠消息事实来源。
minio | 私有对象存储。 | 测试/正式 bucket 隔离。
ai-adapter | AI 适配层。 | 可内置于 api；是否独立容器需确认。

步骤 | 验收点
1 | 医生选择产品类型、填写动态表单、上传文件、提交订单。
2 | 客服审核、AI 翻译草稿、资料缺失提示、通过/驳回。
3 | 生产审核通过，自动生成订单工序实例快照。
4 | 管理员绑定员工，员工在任务池收到任务。
5 | 工序入检、开工、暂停、继续、完成。
6 | 出检通过推进后续节点；并联全部完成才汇合。
7 | 出检不通过进入返工，记录原因、责任分类、返工工时。
8 | 设计稿上传、客服审核、医生确认/驳回，版本保留。
9 | 消息按角色可见；生产端发医生前客服审核。
10 | 账单上传、物流录入，医生端状态变为已发货。
11 | 医生端 AI 只能回答外部状态/物流/账单，不泄露内部信息。
12 | 医生确认收货，订单完成；审计与通知记录完整。

测试专项 | 测试内容 | 一期要求
权限脱敏 | 医生端接口不返回 internal_status、工序、员工、入检/出检、工时、绩效、返工。 | 必须通过。
文件越权 | 医生不能访问其他诊所文件；不能访问内部入检/出检附件。 | 必须通过。
AI 越权 | AI-3 被询问内部工序/员工/返工/工时，只能拒绝或回答公开状态。 | 必须通过。
状态投影 | internal_status 变化后 external_status 正确刷新，医生端只见 7 状态。 | 必须通过。
并联汇合 | 并联分支未全部完成时，汇合节点不能进入 READY。 | 必须通过。
入检/出检 | 未入检不能开工；未完工不能出检；出检不通过必须返工。 | 必须通过。
工时幂等 | 重复点击开始/暂停/继续/完成不会重复记录。 | 必须通过。
WebSocket | 医生端只收到公开事件，内部任务/返工/工时事件不推送给医生。 | 必须通过。
API YAML | OpenAPI 能正常导入/生成文档，/form-configs 不丢 GET。 | 开发前修复。

里程碑 | 完成标准 | 开发工程师重点
M1 需求与架构冻结 | 需求清单、状态流、页面字段、工艺模板、权限、API、数据库模型、内外状态映射确认。 | 配合 PM 确认技术方案、表结构、API 契约、初始化脚本口径。
M2 技术底座可用 | 可登录、建账号、上传文件、创建订单、权限框架、AI 翻译调通。 | 搭 RuoYi、权限、文件、订单创建、AI 适配层。
M3 三端业务闭环 | 下单→客服审核→生产审核→设计派工→医生确认→消息跑通。 | 订单审核、设计稿、消息、WebSocket 主链路。
M4 生产流程与绩效 | 工艺流实例化、入检/出检/返工、工时、绩效可用。 | 核心攻坚：DAG、状态机、并发、工时、返工。
M5 账单物流 + AI + 脱敏 | 账单物流、5 个 AI、外部状态脱敏全部到位。 | AI 工具白名单、医生端投影、文件/AI/WS 脱敏。
M6 联调测试上线 | 权限/文件/状态流/脱敏/AI 权限专项测试通过，部署正式环境，操作手册交付。 | 修复缺陷、压测关键链路、部署与回归。

优先级 | 开发任务
P0 | 认证/RBAC、订单创建、客服审核、生产审核、工艺流实例化、入检/出检、工时、返工、医生端脱敏、文件鉴权、AI-3 安全读模型。
P1 | 消息通知、设计稿版本、账单物流、AI 审计、状态历史、专项测试用例。
P2 | Redis Pub/Sub 多实例广播、work_log_pause_segment 明细表、Multipart 阈值优化、报表性能优化。

深度研究建议 | 纳入方式
模块化单体优先 | 写入总体架构，避免一期跨服务一致性问题。
自研轻量 DAG | 写入工艺流引擎选型，不引入通用 BPM 主引擎。
订单工序实例快照 | 写入实例化机制和数据库表设计。
workflow_edge / order_process_edge | 写入 DAG 前后置和并联汇合实现。
OrderStatusProjector | 写入 internal/external 状态映射。
医生端外部投影/读模型 | 写入医生端脱敏和 AI-3 数据边界。
工时幂等与服务端计时 | 写入工时实现规则和测试。
文件服务端鉴权后签名 URL | 写入文件上传与访问。
AI 工具白名单与人工确认 | 写入 AI 智能体章节。
消息先落库再推送 | 写入 WebSocket 与通知机制。
权限/文件/AI 专项测试 | 写入验收矩阵。

建议 | 处理方式
Redis Pub/Sub 多实例广播 | 不作为消息事实来源；多实例时可启用。
S3 Multipart 上传 | 按文件大小阈值实现或预留；不部署 tusd。
work_log_pause_segment | 建议做；若排期紧可先累计 pause_duration。
trace_id 全链路追踪 | 建议一期加到日志，不影响功能范围。

内容 | 原因
Flowable/Camunda/LiteFlow 主流程引擎 | 一期固定 9 条工艺流，不需要通用 BPM 平台。
工艺流拖拽设计器/模板后台动态配置 | PRD 一期明确不做。
Tus/tusd 独立上传服务 | 运维复杂度高，一期不必要。
秒传、文件去重、冷热归档 | 不属于一期主链路。
Kafka/RabbitMQ/Redis Streams | 一期用数据库通知表 + WebSocket 即可。
复杂多 Agent 自动编排/AI 自动决策 | 一期 AI 只做辅助和草稿。

编号 | 问题 | 影响模块 | 默认执行口径
Q1 | 团队文档写“可配置工艺流”，PRD 写“9 条工序链固定写库，不提供后台编辑”。一期是否允许管理端增删节点？ | 工艺流/管理端 | 默认不允许增删节点；只读模板 + 员工绑定/转派。
Q2 | 贴面路线、种植基台路线等分支由医生下单字段决定，还是生产审核时由内部选择？ | 动态表单/实例化 | 默认生产审核时可补充 branch_params；医生端不感知内部路线。
Q3 | 所有可选节点是否都必须生成 SKIPPED 记录，还是不满足条件就不生成？ | 工序实例/审计 | 默认条件不满足不生成；人工跳过才生成 SKIPPED 并记录原因。
Q4 | 质检员、发货员是否作为独立角色，还是 WORKER 下的权限点？ | 角色权限 | 默认作为 WORKER 下的 qc:final、logistics:ship 权限点。

编号 | 问题 | 影响模块 | 默认执行口径
Q5 | AI 适配层使用 Java 内置实现、LangChain4j，还是独立 Python LangChain 服务？ | AI/部署 | 默认以后端 ai-gateway 模块承载；如 PM 指定独立服务，再容器化部署。
Q6 | 文件上传是否必须实现弱网断点续传级别的 tus 协议？ | 文件上传 | 默认不部署 tusd；使用 Uppy + MinIO 预签名/Multipart 和失败重试。
Q7 | 动态表单字段清单是否已经客户确认？ | 医生端下单/资料缺失 AI | 未确认前使用 PRD 字段配置表实现，字段内容以客户最终确认版初始化。
Q8 | 生产备注标准格式模板是否已有客户提供格式？ | AI-5 生产备注助手 | 未提供前，AI-5 仅做通用规范化草稿，不做后台模板配置。
