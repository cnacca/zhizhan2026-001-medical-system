AI 智能下单与生产协同平台

产品需求文档（PRD）· 一期

版本：V1.0   |   编制日期：2026-06-27

技术栈：Vue3 + Element Plus + Spring Boot + RuoYi-Vue-Pro

LangChain + DeepSeek + MinIO + Uppy + MySQL + Redis

0. 一句话定位

给一家牙科定制工厂搭建「在线下单 + 可视化工艺流生产管理 + 客户进度查询」系统，医生在线下单，工厂内部按可配置的 DAG 工序链执行生产、逐道工序入检出检记工时，客户只能看到 7 个简化外部状态，任何内部生产细节对客户不可见。

1. 目标用户

2. 核心使用场景

场景 A：医生下单

医生登录医生端 → 选择产品类型（冠桥 / 种植 / 贴面 / 活动义齿 / 正畸等）→ 填写动态表单 → 上传 STL / 口扫 / 照片 / X 光 / 处方 → AI 检查资料是否缺失 → 提交 → 进入「待审核」状态。

场景 B：客服审核与翻译

客服端收到新订单 → 检查资料完整性 → 如有外文描述，调用 AI 翻译助手生成中文生产指令草稿 → 客服确认后写入 → 审核通过推进到生产环节。

场景 C：工厂按 DAG 工序链生产

生产审核通过 → 系统按该订单的产品类型和取模方式自动匹配对应工序链，实例化本订单的工序节点列表 → 超级管理员绑定每道工序的具体执行员工 → 技工在任务池领取工序 → 入检（检查上一道结果可否开工）→ 执行 → 出检（确认本道工序质量）→ 流转下一道 / 并联全部完成才能汇合进入下一节点。

场景 D：客户查进度

医生登录医生端 → 查看订单状态（仅显示 7 个外部状态之一）→ 可通过 AI 订单助手对话询问「做到哪了 / 什么时候发货 / 物流到哪了」→ AI 只返回外部状态和物流单号，不返回任何内部信息。

3. 角色与权限

基于 RuoYi-Vue-Pro 的 RBAC 权限体系扩展，所有权限校验必须在服务端执行，禁止仅靠前端隐藏按钮。

4. 外部状态定义（医生端可见）

⚠️  这 7 个状态是医生端唯一可见的进度信息。任何内部工序节点、员工姓名、入检出检结果均不对医生暴露。

5. P0 必做功能（一期必须交付）

5.1 账号与登录

5.2 医生端（客户门户）

5.2.1 在线下单

5.2.2 进度查询与设计确认

5.3 客服端（CS 中台）

5.3.1 订单审核

5.3.2 客户管理与偏好

5.3.3 账单与物流

5.4 工艺流引擎（核心模块）

⚠️  工序链由客户预定义，共 9 条，固定写入数据库，不在后台动态配置。下单时按产品类型自动匹配对应工序链，生产审核通过后实例化到订单。管理端只负责查看和员工绑定，不提供工序链编辑功能。

5.4.1 九条预定义工序链（客户提供，开发时写入数据库）

说明：「→」表示顺序执行；「印模 / 口扫」表示二选一分支（下单时确定）；「（可选）」表示工厂内部决定是否执行，不由订单控制；「→→」表示并联节点（两条线同时进行，全部完成才汇合）。

① 常规冠修复

② 种植类修复

③ 精密附件

④ 套筒冠

⑤ 贴面修复

⑥ 活动件 - 钢托

⑦ 活动件 - 胶托

⑧ 活动件 - 隐形

⑨ 正畸

5.4.2 数据库初始化说明

⚠️  以下工序链由开发人员在系统初始化时直接写入数据库，不提供后台编辑界面。如需修改，由开发人员执行数据库脚本。

5.4.3 订单工序链实例

5.5 生产端（工厂端）

5.5.1 数据审核

5.5.2 工序执行（入检 → 执行 → 出检）

⚠️  每道工序强制执行入检和出检，不可跳过。

5.5.3 工时登记与绩效统计

5.5.4 质检与发货

5.6 五个 AI 智能体

⚠️  所有 AI 智能体使用 LangChain + DeepSeek 实现。AI 的数据查询权限必须在服务端数据层过滤，禁止仅靠前端隐藏。

AI-1：翻译助手（客服端）

AI-2：客服查询助手（客服端）

AI-3：客户订单助手（医生端）

AI-4：资料缺失助手（医生端 + 客服端）

AI-5：生产备注助手（客服端 + 生产端）

5.7 底层安全与基础设施

6. P1 可选功能（一期完成后再评估）

7. 一期暂时不做

DAG 可视化编辑器（工序链由客户预定义，固定写入数据库，不提供后台拖拽配置）

工序库增删改管理（工序名称固定在工序链定义里，不单独维护工序库）

工序链并联的「任一分支完成即可继续」逻辑（一期只做「全部完成才汇合」）

订单级动态工序链编排（一期只允许管理员在管理端修改，不支持订单层面的自由拖拽编排）

二期功能扩展

8. 核心数据字段与数据库表结构

⚠️  以下为核心表的关键字段定义，供全栈开发直接参考。字段名使用 snake_case，类型为 MySQL 类型。

8.1 用户与权限

8.2 订单

8.3 工序链定义表（开发时初始化，不提供后台编辑）

8.4 订单工序链实例

8.5 入检 / 出检记录

8.6 工时记录

8.7 账单与物流

9. 关键页面说明

10. 主业务流程（12 步主链路）

以下为完整业务主链路，验收以此为准：

11. 验收标准

⚠️  开发完成后按以下清单逐条验收，全部通过才算交付。

11.1 主链路验收（必须全部通过）

11.2 脱敏验收（必须全部通过，这是合规红线）

11.3 权限验收

11.4 AI 功能验收

12. 动态表单字段定义

医生下单时，根据所选产品类型渲染对应的表单字段。以下字段清单为行业常识拟定，需客户确认后生效。

⚠️  字段类型说明：text = 单行文本，textarea = 多行文本，select = 单选下拉，multi-select = 多选，number = 数字，date = 日期，file = 文件上传

12.1 所有产品类型共用字段（基础信息）

12.2 冠桥（Crown & Bridge）

12.3 种植修复（Implant）

12.4 全瓷贴面（Veneer）

12.5 活动义齿（Removable Denture）

12.6 正畸矫治器（Orthodontics）

12.7 动态表单数据库实现说明

动态表单字段配置存储在后台，不硬编码在前端。实现方式：

新增表 form_field_config：field_id, product_type, field_key, field_label, field_type, is_required, options（JSON，select 类型的选项列表）, sort_order, status

前端医生端下单时，按 product_type 查询该产品类型的字段配置，动态渲染表单

订单表的 form_data 字段（JSON）存储实际填写值，key 为 field_key

超级管理员可在管理端增删改字段配置，无需改代码

13. 消息与留言系统

⚠️  三方（医生 / 客服 / 生产端）的沟通统一在同一个订单内的消息频道进行，类似群聊。生产端发出的消息需经客服审核后医生才可见。

13.1 消息可见性规则

13.2 消息流转完整流程

医生 → 客服（直接送达）

医生在订单详情页留言区输入消息，点击发送

消息实时出现在客服端该订单的消息列表，WebSocket 推送通知

医生端显示「已发送」，生产端看不到该消息

客服 → 医生 / 生产端（直接送达）

客服在消息区输入消息，选择发送对象：「仅医生」/ 「仅生产端」/ 「全部」

消息按选择对象实时送达，WebSocket 推送通知

客服发送的消息不需要审核，直接生效

生产端 → 客服审核 → 医生（需审核）

技工 / 管理员在生产端订单页发送消息，消息状态 = PENDING_REVIEW

消息实时出现在客服端的「待审核消息」队列，WebSocket 推送通知客服

客服查看消息，可选择：直接通过 / 编辑后通过 / 驳回

通过后消息送达医生端，状态更新为 APPROVED，WebSocket 推送医生

驳回则消息状态 = REJECTED，生产端收到驳回通知，附驳回原因

医生端全程看不到 PENDING_REVIEW 和 REJECTED 状态的消息

13.3 消息数据表

13.4 消息相关页面说明

14. 设计稿模块

⚠️  工厂端任何人（技工 / 管理员 / 客服）均可上传设计稿，上传后交由客服审核，客服审核通过后发给医生确认，医生确认或驳回，系统保留全部版本记录。

14.1 设计稿完整流程

生产端任意人员在订单页点击「上传设计稿」，上传文件（图片 / STL / PDF）

上传后设计稿状态 = PENDING_CS_REVIEW，通知客服

客服在订单页查看设计稿，可选择：通过（发给医生）/ 驳回（退回生产端修改）

客服通过后，设计稿状态 = PENDING_DOCTOR_CONFIRM，医生端收到通知

医生查看设计稿，点击「确认」或「驳回」

医生确认 → 设计稿状态 = DOCTOR_CONFIRMED，流转生产

医生驳回 → 设计稿状态 = DOCTOR_REJECTED，必填驳回原因 → 客服和上传人同时收到通知

收到驳回通知后，生产端可重新上传新版设计稿，重复上述流程

所有历史版本保留，在订单详情页按版本号（V1 / V2 / V3...）列表展示，不可删除

14.2 设计稿数据表

14.3 设计稿相关页面说明

14.4 设计稿验收标准补充

15. 未确认问题（待跟进）

⚠️  以下问题在本 PRD 编制时尚未确认，全栈开发前需逐一跟进，不得自行脑补。

— 文档结束（V1.1） —

16. API 接口文档

完整 OpenAPI 3.0 规范见附件 API规范_OpenAPI3.0.yaml，可导入 Swagger UI 或 Cursor / Claude Code 直接使用。

⚠️  所有接口（除登录外）必须携带 Authorization: Bearer {access_token}。服务端强制校验角色权限，禁止仅靠前端隐藏。

16.1 通用约定

16.2 认证模块（Auth）

登录请求体：

登录响应 data：

16.3 用户管理（User）— 权限：ADMIN

16.4 诊所与客户偏好（Clinic / CustomerPreference）

16.5 动态表单配置（OrderForm）

16.6 文件上传与预览（File）

16.7 订单核心流程（Order）

16.8 工序链查询（WorkflowChain）— 权限：ADMIN / CS / WORKER

⚠️  9条工序链由开发人员初始化写入数据库，后台不提供编辑接口。以下接口仅用于查询展示。

16.9 订单工序链实例（ProcessInstance）

16.11 入检 / 出检（CheckRecord）— 权限：WORKER / ADMIN

提交字段：node_instance_id / check_type / is_pass / remark（不通过必填）/ attachment_file_ids / rework_to_node_id（出检不通过必填）

16.12 工时记录（WorkLog）— 权限：WORKER

16.13 绩效统计（Performance）

16.14 消息系统（Message）

16.15 设计稿（DesignDraft）

16.16 账单与物流（Bill）

16.17 AI 智能体接口（AI）

16.18 WebSocket 实时通知

连接地址：wss://api.yourdomain.com/v1/ws?token={access_token}

Token 无效则拒绝连接。

推送消息格式（JSON）：

{ "event": "ORDER_APPROVED", "order_id": 12345, "order_no": "ORD-20260627-001", "message": "您的订单已审核通过", "timestamp": "2026-06-27T10:00:00Z" }

角色 | 身份说明 | 使用入口
医生 / 诊所 | 下单方，牙医或诊所前台 | 医生端（客户门户）
客服 / CS 中台 | 订单审核、翻译、账单、物流对接 | 客服端
技工 / 生产人员 | 执行工序、入检出检、记工时 | 生产端
超级管理员 | 查看工序链定义、员工管理、订单工序链员工绑定与修改 | 管理端

权限点 | 医生 | 客服 | 技工 | 超级管理员
提交 / 查看自己的订单 | ✅ | ✅（只读） | ❌ | ✅
审核订单（初审） | ❌ | ✅ | ❌ | ✅
查看内部工序状态 | ❌ | ✅ | ✅ | ✅
查看 / 填写入检出检 | ❌ | ❌ | ✅ | ✅
查看 / 填写工时 | ❌ | ❌ | ✅（本人） | ✅
查看绩效统计 | ❌ | ❌ | ✅（本人） | ✅（全部）
配置工序库 / 模板 | ❌ | ❌ | ❌ | ✅
修改订单工序链（中后期） | ❌ | ❌ | ❌ | ✅
转派工序节点 | ❌ | ❌ | ❌ | ✅
录入账单 / 物流 | ❌ | ✅ | ❌ | ✅
查看账单 / 物流 | ✅（只读） | ✅ | ❌ | ✅
客户偏好录入 | ❌ | ✅ | ❌ | ✅
调用 AI 翻译助手 | ❌ | ✅ | ❌ | ✅
调用 AI 客服查询助手 | ❌ | ✅ | ❌ | ✅
调用 AI 订单助手 | ✅ | ❌ | ❌ | ✅
调用 AI 资料缺失助手 | ✅ | ✅ | ❌ | ✅
调用 AI 生产备注助手 | ❌ | ✅ | ✅ | ✅

外部状态 | 触发条件 | 触发方式
待审核 | 医生提交订单后 | 系统自动
设计中 | 客服审核通过，订单进入设计工序 | 系统自动
生产中 | 进入任意一道生产工序即触发 | 系统自动
质检中 | 进入质检工序 | 系统自动
待发货 | 质检通过，等待发货操作 | 系统自动
已发货 | 客服录入物流单号 | 客服手动操作触发
已完成 | 医生点击「确认收货」按钮 | 医生主动操作触发

功能点 | 用户 | 动作 | 结果
账号创建 | 超级管理员 | 在管理端创建账号，分配角色（医生 / 客服 / 技工 / 管理员），一个诊所可创建多个账号 | 账号生效，对应角色权限生效，不开放自由注册
登录 | 所有角色 | 输入账号密码登录对应端口 | 获取 JWT Token + Refresh Token，进入对应端界面
Token 刷新 | 所有角色 | Access Token 过期时自动刷新 | 无感续期，不中断操作
登出 | 所有角色 | 点击登出 | Token 失效，跳转登录页

功能点 | 用户 | 动作 | 结果
选择产品类型 | 医生 | 从产品类型列表选择（冠桥 / 种植 / 贴面 / 活动义齿 / 正畸等） | 页面渲染对应产品类型的动态表单，必填项由后台配置
填写动态表单 | 医生 | 按表单填写订单信息 | 表单数据实时保存为草稿
上传文件 | 医生 | 上传 STL、口扫、图片、PDF、X 光、处方等文件，支持大文件 | Uppy 分片上传，断点续传，失败自动重试，上传进度展示，文件存入 MinIO 私有桶
AI 资料缺失检查 | 医生 | 点击提交前系统自动触发 | AI 资料缺失助手检查字段和附件完整性，列出缺失项提示医生补充，是否退回由人工决定
存草稿 | 医生 | 点击「保存草稿」 | 订单以草稿状态保存，可随时继续编辑
提交订单 | 医生 | 点击「提交」 | 订单状态变为「待审核」，触发客服端消息通知
补资料 | 医生 | 订单被驳回后，修改后重新提交 | 驳回原因清晰展示，补充资料后重新进入「待审核」，保留历史版本记录

功能点 | 用户 | 动作 | 结果
查看订单进度 | 医生 | 进入订单详情 | 仅显示 7 个外部状态之一，不显示任何内部工序信息
AI 订单助手查询 | 医生 | 在对话框输入问题（如「我的订单做到哪了」「什么时候发货」「物流到哪了」） | AI 读取该医生授权范围内的外部状态和物流单号，返回回答；服务端权限过滤，绝不返回内部工序 / 员工 / 工时信息
设计稿确认 | 医生 | 查看设计稿，点击「确认」或「驳回」 | 确认则流转生产；驳回必须填写驳回原因，保留设计稿版本记录
查看账单 | 医生 | 进入账单页面 | 查看客服上传的账单文件（只读，不可下载编辑）
查看物流 | 医生 | 进入物流页面 | 查看承运商名称和运单号
确认收货 | 医生 | 点击「确认收货」按钮 | 订单状态变为「已完成」
订单内留言 | 医生 | 在订单内发送留言 | 留言绑定订单，客服可见，生产端不可见

功能点 | 用户 | 动作 | 结果
订单初审 | 客服 | 查看新提交订单，检查资料完整性和清晰度 | 通过则推进到生产审核；不通过则驳回并生成补充说明发给医生，订单回到「待审核」
AI 翻译校对 | 客服 | 订单含外文描述时，点击「AI 翻译」 | AI 翻译助手将外文翻译成中文生产指令草稿，含术语标准化；客服人工校正确认后才写入生产指令，未确认前不生效
AI 资料缺失检查 | 客服 | 在审核界面触发 AI 检查 | 同医生端资料缺失助手，列出缺失项，由客服决定是否退回

功能点 | 用户 | 动作 | 结果
客户档案 | 客服 | 创建 / 编辑客户档案 | 记录诊所名、医生姓名、联系人、国家、语言、负责客服
客户偏好录入 | 客服 | 在客户档案中手动录入偏好 | 记录颜色 / 邻接 / 边缘 / 外形 / 材料偏好；下次该客户下单时，系统在表单旁提示其历史偏好
AI 客服查询助手 | 客服 | 在对话框输入查询内容 | AI 读取客服权限范围内的内部订单状态、当前工序节点、预计发货、物流、客户偏好、历史沟通记录；对外发送前必须客服确认

功能点 | 用户 | 动作 | 结果
账单上传 | 客服 | 手动报价后上传账单文件 | 文件存入 MinIO 私有桶，医生端可查看（只读）
物流录入 | 客服 | 手动录入承运商名称和运单号 | 触发订单状态变为「已发货」，医生端可见；字段预留 API 接口供后期对接物流平台
消息审核 | 客服 | 查看生产端发给客户的消息，确认或修改后发出 | 消息绑定订单留痕，未经客服确认的消息不能触达医生端

阶段 | 工序节点（顺序）
下单入厂 | 客户/客服/销售下单 → 国外件信息检验翻译 / 国内件信息检验 → 入厂检验数据技术检验 → 收发入货
取模分支（二选一） | 【印模】印模 → 模型接收 → 模型入货检验 → 模型检验出货 → 收发出货
【口扫】口扫 → 数据审核
CAD 加工 | CAD 入货检 → CAD 扫描 → CAD 确认设计（可选）→ CAD 排版/切削/染色 → 烧结 → CAD 检验出货
车金 | 车金入货检验 → 车金出货检验
上瓷 | 上瓷入货检验 → 上瓷出货检验
车瓷 | 车瓷入货检验 → 车瓷形态确认（可选）→ 车瓷出货检验
收尾发货 | 上釉 → 抛光 → 质检出货 → 等待出货 → 客服核对订单信息及账单 → 发货

阶段 | 工序节点（顺序）
下单入厂 | 客户/客服/销售下单 → 国外件信息检验翻译 / 国内件信息检验 → 入厂检验数据技术检验 → 收发入货
取模分支（二选一） | 【印模】印模 → 模型入货检验 → 模型检验出货 → 收发出货
【口扫】口扫 → 数据审核 → 打印模型
种植入货检 | 种植入货检
基台分支（二选一） | 【成品基台】客服定基台 → 种植配基台
【个性化基台】CAD 入货检 → CAD 设计 → CAD 切削基台 → 种植研磨基台 → 种植上部冠设计
CAD 加工 | CAD 排版/切削/染色 → CAD 烧结 → CAD 检验出货
车金 | 车金入货检验 → 车金出货检验
上瓷 | 上瓷入货检验 → 上瓷出货检验
车瓷 | 车瓷入货检验 → 车瓷形态确认（可选）→ 车瓷出货检验
收尾发货 | 上釉 → 抛光 → 质检出货 → 等待出货 → 客服核对订单信息及账单 → 发货

阶段 | 工序节点（顺序）
下单入厂 | 客户/客服/销售下单 → 国外件信息检验翻译 / 国内件信息检验 → 入厂检验 → 收发入货 → 收发出货
CAD 金属打印 | CAD 入货检 → CAD 设计 → CAD 打印金属
车金（第一段） | 车金入货检验 → 车金出货检验 → 研磨（订配件）
上瓷（第一段） | 上瓷入货检验 → 上瓷出货检验
车瓷 | 车瓷入货检验 → 车瓷形态确认（可选）→ 车瓷出货检验 → 抛光
钢托 | 钢托入货检验 → 活动钢托设计 → 钢托打印 → 钢托打磨/就位 → 钢托出货检验
车金（第二段） | 车金入货检验 → 车金焊接/安装配件 → 车金出货检验
上瓷（第二段） | 上瓷入货检验 → 上瓷（上op）→ 上瓷出货检验
胶托 | 胶托入货检验 → 排牙 → 刻蜡 → 充胶 → 打磨 → 抛光 → 胶托打磨出货检验
收尾发货 | 质检出货 → 等待出货 → 客服核对订单信息及账单 → 发货

阶段 | 工序节点（顺序）
下单入厂 | 客户/客服/销售下单 → 国外件信息检验翻译 / 国内件信息检验 → 入厂检验 → 收发入货 → 收发出货
模型 | 模型入货检验 → 模型检验出货
内冠 | CAD 入货检 → CAD 内冠设计 → CAD 打印内冠
车金（内冠） | 车金入货检验 → 车金出货检验
外冠 | CAD 入货检 → CAD 设计外冠 → CAD 打印外冠 → CAD 出货检
车金（外冠研磨） | 车金入货检验 → 车金研磨/就位冠 → 车金出货检
钢托 | 钢托入货检验 → 钢托设计 → 钢托打印 → 钢托打磨就位 → 钢托出货检验
车金（焊接） | 车金入货检验 → 车金固+活焊接 → 车金出货检验
上瓷 | 上瓷入货检验 → 上瓷（上op）→ 上光固化 → 上瓷出货检验
车瓷 | 车瓷入货检验 → 车瓷形态确认（可选）→ 车瓷出货检验 → 抛光
胶托 | 胶托入货检验 → 排牙 → 刻蜡 → 充胶 → 打磨 → 抛光 → 胶托打磨出货检验
收尾发货 | 质检出货 → 等待出货 → 客服核对订单信息及账单 → 发货

阶段 | 工序节点（顺序）
下单入厂 | 客户/客服/销售下单 → 国外件信息检验翻译 / 国内件信息检验 → 入厂检验数据技术检验 → 收发入货
取模分支（二选一） | 【印模】印模 → 模型入货检验 → 模型检验出货 → 收发出货检验
【口扫】口扫 → 数据审核 → 打印模型
工艺分支（二选一） | 【切削路线】CAD 设计 → CAD 切削 → 车金入货检验 → 车金就位 → 车金出货检验 → 上瓷入货检验 → 上瓷烧结 → 上瓷出货检验 → 车瓷入货检验 → 车瓷 → 车瓷形态确认（可选）→ 车瓷出货检验 → 上釉 → 抛光 → 质检出货
【传统路线】CAD 传统切蜡 → CAD 包埋 → CAD 铸造 → 车金就位 → 上瓷入货检验 → 上瓷 → 上瓷出货检验 → 车瓷入货检验 → 车瓷 → 车瓷出货检验 → 上釉 → 抛光 → 质检出货
收尾发货 | 等待出货 → 客服核对订单信息及账单 → 发货

阶段 | 工序节点（顺序）
下单入厂 | 客户/客服/销售下单 → 国外件信息检验翻译 / 国内件信息检验 → 入厂检验数据技术检验 → 收发入货
取模分支（二选一） | 【印模】印模 → 模型入货检验 → 模型检验出货 → 收发出货检验
【口扫】口扫 → 数据审核 → 打印模型
钢托制作 | 钢托入货检验 → 钢托画线设计 → 扫描 → 设计钢托（确认设计可选）→ 打印钢托 → 就位 → 打磨 → 抛光 → 钢托出货检验
排牙充胶 | 选牙排牙（确认排牙可选）→ 刻蜡 → 充胶 → 打磨 → 抛光
收尾发货 | 质检出货 → 等待出货 → 客服核对订单信息及账单 → 发货

阶段 | 工序节点（顺序）
下单入厂 | 客户/客服/销售下单 → 国外件信息检验翻译 / 国内件信息检验 → 入厂检验数据技术检验 → 收发入货
取模分支（二选一） | 【印模】印模 → 模型接收 → 模型入货检验 → 模型检验出货 → 收发出货检验
【口扫】口扫 → 数据审核 → 打印模型
排牙充胶 | 选牙排牙（确认排牙可选）→ 刻蜡 → 充胶 → 打磨 → 抛光
收尾发货 | 质检出货 → 等待出货 → 客服核对订单信息及账单 → 发货

阶段 | 工序节点（顺序）
下单入厂 | 客户/客服/销售下单 → 国外件信息检验翻译 / 国内件信息检验 → 入厂检验数据技术检验 → 收发入货
取模分支（二选一） | 【印模】印模 → 模型接收 → 模型入货检验 → 模型检验出货 → 收发出货检验
【口扫】口扫 → 数据审核 → 打印模型
制作 | 复模 → 选牙排牙（确认排牙可选）→ 刻蜡 → 落盒充胶 → 打磨 → 抛光
收尾发货 | 质检出货 → 等待出货 → 客服核对订单信息及账单 → 发货

阶段 | 工序节点（顺序）
下单入厂 | 客户/客服/销售下单 → 国外件信息检验翻译 / 国内件信息检验 → 入厂检验数据技术检验 → 收发入货
取模分支（二选一） | 【印模】印模 → 模型接收 → 模型入货检验 → 模型检验出货 → 收发出货检验
【口扫】口扫 → 数据审核 → 打印模型
制作 | CAD 设计 → 打磨就位
收尾发货 | 质检出货 → 等待出货 → 客服核对订单信息及账单 → 发货

表名 | 说明 | 关键字段
workflow_chain | 9条工序链定义表 | chain_id, chain_name（如「常规冠修复」）, intake_branch（IMPRESSION=印模/SCAN=口扫/BOTH=下单选择）, status
workflow_node | 每条链的工序节点 | node_id, chain_id, process_name, step_order（执行顺序号）, is_optional（是否可选节点，工厂内部决定）, branch_group（并联分组，同组节点并联执行）

功能点 | 用户 | 动作 | 结果
自动匹配工序链 | 系统自动 | 生产审核通过后，按订单的产品类型 + 取模方式（印模/口扫）自动匹配对应工序链，生成本订单的工序链实例（快照） | 订单拥有独立的工序节点列表，与工序链定义解耦，后续不受影响
绑定具体员工 | 超级管理员 | 在订单工序链页面，为每个工序节点指定具体执行员工 | 员工收到工序任务通知，可在任务池看到待执行任务
修改工序链（中后期） | 超级管理员 | 在管理端对进行中的订单工序节点进行调整（增删节点或换人） | 调整生效；已完成的工序节点记录保留不可删除；只有超级管理员可操作
转派工序节点 | 超级管理员 | 将某卡住的工序节点从原员工转派给其他员工 | 新员工收到任务通知，原员工任务移除，转派记录留痕

功能点 | 用户 | 动作 | 结果
数据审核 | 生产管理 | 查看客服审核通过的订单，判断资料能否开工 | 通过则触发工序链实例化；不通过则退回补资料，说明原因

功能点 | 用户 | 动作 | 结果
工序任务池 | 技工 | 查看分配给自己的工序任务列表 | 显示订单号、工序名称、标准工时、当前状态
入检记录 | 技工 | 开始工序前填写入检表单 | 记录：接收时间、接收人、上一道半成品状态描述、是否可以开工（是 / 否）、问题说明（不可开工时必填）、附件（可选）；不可开工则升级给管理员处理
开始工时计时 | 技工 | 点击「开始」 | 工时计时器启动，记录开始时间
暂停 / 继续工时 | 技工 | 点击「暂停」/「继续」 | 暂停期间时间不计入有效工时，记录暂停次数和总暂停时长
出检记录 | 技工 | 工序完成后填写出检表单 | 记录：完成时间、检查人、是否通过（通过 / 不通过）、不通过时必填返工原因、附件（可选）；通过则流转下一工序或等待并联其他分支完成
返工处理 | 技工 / 管理员 | 出检不通过时，指定返工回退到哪道工序 | 生成返工记录（返工原因、责任分类、返工工时）；回退工序重新执行入检→执行→出检流程

功能点 | 用户 | 动作 | 结果
工时查看 | 技工 / 管理员 | 查看工时记录 | 按人员 / 工序 / 订单 / 产品类型维度展示实际工时 vs 标准工时、超时情况
绩效统计看板 | 技工（本人）/ 管理员（全部） | 查看绩效看板 | 展示以下指标：
完成数量 = 完成工序数
有效工时 = 实际工作时长（暂停不计）
返工次数 = 返工记录次数
准时率 = 按标准工时内完成工序数 ÷ 总完成工序数
通过率 = 一次出检通过数 ÷ 总出检数
工时效率 = 标准工时 ÷ 实际工时 × 100%

功能点 | 用户 | 动作 | 结果
终检 | 质检员 | 所有工序完成后进行终检 | 记录终检时间、检查人、是否通过、附件
包装发货 | 发货员 / 客服 | 录入承运商、运单号、发货时间 | 订单外部状态变为「已发货」，医生端和客服端同步更新

项目 | 内容
触发方式 | 客服在审核页面点击「AI 翻译」按钮
输入 | 订单原始外文描述 / 留言 / 生产备注文本
处理 | 调用 DeepSeek 翻译，含牙科专业术语标准化
输出 | 中文生产指令草稿，展示在可编辑文本框
人工干预 | 客服必须人工确认或修改后点击「确认写入」才生效，未确认前不写入生产指令
边界 | 不自动下发，不自动修改任何订单字段

项目 | 内容
触发方式 | 客服在对话框输入问题
可读数据 | 内部完整工序状态、当前工序节点、预计发货时间（如有）、物流单号、客户偏好记录、历史沟通留言
输出 | 自然语言回答，引用内部数据
人工干预 | 如需对外发送回答内容，客服必须确认后才能发出
边界 | 只能读取客服权限范围内的数据，不能执行写操作

项目 | 内容
触发方式 | 医生在订单详情页的对话框输入问题
可读数据 | 该医生自己订单的 7 个外部状态之一、物流单号
输出 | 自然语言回答，仅基于外部状态和物流信息
服务端过滤 | AI 调用专用查询接口，该接口只返回外部状态字段，在数据层强制过滤内部字段
边界 | 绝对不能返回：内部工序名称、执行员工、入检出检结果、工时、绩效、返工记录、任何内部操作信息

项目 | 内容
触发方式 | 医生提交前自动触发；客服审核时可手动触发
检查内容 | 必填字段是否为空、必传附件是否上传、描述字段是否过短（可配置阈值）
输出 | 列出缺失项清单，生成提示文案（如「缺少咬合照片，请上传」）
边界 | 只提示，不自动退回；是否驳回由人工决定

项目 | 内容
触发方式 | 客服或生产人员在备注编辑区点击「AI 整理」
输入 | 客户原始要求文本、订单描述
输出 | 按客户提供的标准格式生成生产备注草稿（格式模板由客户另行提供给全栈开发，不在本 PRD 中定义）
人工干预 | 草稿必须人工确认后才能保存为正式生产备注，不能自动下发
边界 | 不自动写入，不自动通知生产端

类别 | 要求
认证 | JWT + Refresh Token；Access Token 建议有效期 2 小时，Refresh Token 7 天；服务端校验，不依赖前端
权限 | RuoYi-Vue-Pro RBAC，服务端强制校验每个接口的角色权限；工艺 / 工时 / 绩效 / 入检出检需单独权限点
文件安全 | MinIO 私有桶；预览签名 URL 有效期 15 分钟，下载签名 URL 有效期 2 小时；文件下载 / 预览操作写审计日志
数据脱敏 | 医生端所有接口在数据层过滤内部字段（工序详情、员工姓名、入检出检、工时、绩效），禁止仅靠前端隐藏
AI 数据隔离 | AI 查询接口按角色路由到不同的数据查询层，医生端 AI 只能调用返回外部状态的专用接口
实时通知 | WebSocket（RuoYi-Vue-Pro 内置），需携带 Token 校验；推送事件：审核通过 / 驳回、待确认设计、新消息、工序异常、账单物流更新
传输 | 全站 HTTPS
部署 | Docker 容器化；测试环境 + 正式环境分离
备份 | 数据库每日备份
审计日志 | 登录、文件上传 / 下载 / 预览、审核操作、派工、入检出检、工时提交、AI 查询、发货操作全部留痕
数据隔离 | 按诊所 / 客户隔离数据，跨诊所数据不可互相访问

功能 | 说明 | 原因
物流 API 对接 | 自动同步物流状态，无需手动录入运单号 | 字段已预留，待客户确认物流平台后接入
生产备注标准格式配置 | 后台可视化配置生产备注模板 | 格式由客户另行提供，一期先硬编码
签名 URL 有效期可配置化 | 管理端可配置预览和下载的签名 URL 有效期 | 一期先用固定值 15 分钟 / 2 小时
客户自助注册 | 医生端开放自助注册 | 一期由管理员创建账号，更可控

表名 | 关键字段
sys_user（继承 RuoYi） | user_id, username, password, role_id, clinic_id（所属诊所），status, create_time
sys_role（继承 RuoYi） | role_id, role_name, role_key（DOCTOR / CS / WORKER / ADMIN）
clinic（诊所） | clinic_id, clinic_name, country, language, cs_user_id（负责客服）, create_time

字段 | 类型 | 说明
order_id | BIGINT PK | 订单唯一 ID
order_no | VARCHAR(32) | 订单编号，业务展示用
clinic_id | BIGINT FK | 所属诊所
doctor_user_id | BIGINT FK | 下单医生
product_type | VARCHAR(64) | 产品类型（冠桥 / 种植 / 贴面等）
form_data | JSON | 动态表单内容，按产品类型存不同结构
internal_status | VARCHAR(32) | 内部真实状态，仅内部角色可见
external_status | VARCHAR(32) | 外部简化状态，枚举值：PENDING_REVIEW / DESIGNING / PRODUCING / QC / PENDING_SHIP / SHIPPED / COMPLETED
cs_user_id | BIGINT FK | 负责客服
production_note | TEXT | 标准生产备注（AI 草稿经人工确认后写入）
reject_reason | TEXT | 最近一次驳回原因
create_time | DATETIME | 下单时间
submit_time | DATETIME | 最近一次提交时间

表名 | 关键字段 | 说明
workflow_chain | chain_id, chain_name（如「常规冠修复」）, intake_branch（IMPRESSION/SCAN/BOTH）, status（1启用/0禁用） | 9条预定义工序链，开发时按客户提供的清单写入，不提供后台增删改接口
workflow_node | node_id, chain_id, process_name, step_order（执行顺序号）, is_optional（工厂内部可选，TINYINT 0/1）, branch_group（VARCHAR，并联分组标识，同组节点并联执行，NULL=顺序节点） | 每条工序链的节点列表，顺序由 step_order 决定

表名 | 关键字段 | 说明
order_process_instance | instance_id, order_id, chain_id（关联哪条工序链）, intake_branch_used（IMPRESSION/SCAN，实际使用的取模方式快照）, create_time | 订单的工序链实例头
order_process_node | node_instance_id, instance_id, process_name（快照）, step_order（快照）, is_optional（快照）, branch_group（快照）, assigned_user_id（具体员工）, node_status（PENDING/IN_PROGRESS/COMPLETED/REWORK）, standard_duration | 实例化后的工序节点，与 workflow_node 快照解耦，修改 workflow_node 不影响已有实例

字段 | 类型 | 说明
check_id | BIGINT PK | 记录 ID
node_instance_id | BIGINT FK | 关联工序节点实例
check_type | TINYINT | 1 = 入检，2 = 出检
check_time | DATETIME | 检查时间
checker_user_id | BIGINT FK | 检查人
is_pass | TINYINT | 是否通过：1 通过 / 0 不通过
remark | TEXT | 问题说明 / 返工原因（不通过时必填）
attachment_urls | JSON | 附件文件 URL 列表

字段 | 类型 | 说明
work_log_id | BIGINT PK | 记录 ID
node_instance_id | BIGINT FK | 关联工序节点实例
worker_user_id | BIGINT FK | 执行员工
start_time | DATETIME | 开始时间
end_time | DATETIME | 完成时间（NULL = 进行中）
pause_duration | INT | 总暂停时长（分钟）
actual_duration | INT | 有效工时 = (end_time - start_time) - pause_duration（分钟）
is_rework | TINYINT | 是否为返工工时：1 是 / 0 否

字段 | 类型 | 说明
bill_id | BIGINT PK | 账单 ID
order_id | BIGINT FK | 关联订单
bill_file_url | VARCHAR(512) | 账单文件 MinIO URL（签名前的原始路径）
upload_time | DATETIME | 上传时间
cs_user_id | BIGINT FK | 上传客服
carrier | VARCHAR(64) | 承运商名称
tracking_no | VARCHAR(128) | 物流运单号
ship_time | DATETIME | 发货时间
logistics_api_reserved | VARCHAR(256) | 物流 API 预留字段，一期不使用

页面 | 所属端 | 核心元素
登录页 | 全端共用 | 账号 / 密码输入，JWT 登录，错误提示
医生端 - 下单页 | 医生端 | 产品类型选择器 → 动态表单 → 文件上传区（Uppy 组件）→ AI 缺失检查提示区 → 提交 / 草稿按钮
医生端 - 订单列表 | 医生端 | 订单列表，仅显示外部状态，支持按状态筛选
医生端 - 订单详情 | 医生端 | 外部状态进度条（7 个状态）、设计稿确认区、账单区、物流区、留言区、AI 订单助手对话框、确认收货按钮
客服端 - 待审核列表 | 客服端 | 待审核订单列表，显示下单时间 / 产品类型 / 诊所
客服端 - 审核详情 | 客服端 | 订单表单只读展示、附件预览、AI 翻译触发按钮、AI 缺失检查按钮、通过 / 驳回操作区、生产备注编辑区
客服端 - 客户档案 | 客服端 | 诊所信息、医生列表、客户偏好录入表单、历史订单列表
客服端 - 账单物流 | 客服端 | 账单文件上传、承运商 + 运单号录入、发货操作按钮
管理端 - 工序链查看 | 管理端 | 展示 9 条预定义工序链的节点列表（只读），含工序名称、顺序、是否可选节点
管理端 - 订单工序链视图 | 管理端 | 当前订单实例化后的工序节点列表、节点状态（待执行/进行中/已完成/返工）、员工绑定操作、转派操作
生产端 - 我的任务池 | 生产端 | 当前分配给本员工的工序任务列表，含订单号 / 工序名 / 标准工时
生产端 - 工序执行页 | 生产端 | 入检表单、工时计时器（开始 / 暂停 / 继续 / 完成）、出检表单、附件上传
生产端 - 绩效看板 | 生产端 | 个人绩效指标卡片：完成数量 / 有效工时 / 返工次数 / 准时率 / 通过率 / 工时效率

步骤 | 操作方 | 动作 | 系统结果 | 下一步触发条件
Step 1 | 医生 | 选产品类型 → 填动态表单 → 上传文件 → 提交 | 订单创建，external_status = PENDING_REVIEW，客服端收到通知 | 订单进入客服待审核队列
Step 2 | 客服 | 审核订单资料完整性，触发 AI 翻译（如有外文），确认生产指令 | 审核通过则 internal_status 推进；驳回则通知医生补资料 | 审核通过 → Step 3
Step 3 | 生产管理 | 数据审核，确认资料可以开工 | 通过则系统按产品类型模板实例化工序链，external_status = DESIGNING / PRODUCING | 实例化完成 → Step 4
Step 4 | 超级管理员 | 为订单工序链每个节点绑定具体员工 | 员工收到任务通知，任务出现在任务池 | 绑定完成 → Step 5
Step 5 | 技工 | 在任务池领取工序，填写入检表单 | 入检记录创建，工序状态 = IN_PROGRESS | 入检通过 → Step 6
Step 6 | 技工 | 执行工序，开始工时计时，期间可暂停继续 | 工时记录实时更新 | 点击完成 → Step 7
Step 7 | 技工 | 填写出检表单，判断是否通过 | 通过：工序状态 = COMPLETED，流转下一节点或等待并联其他分支
不通过：生成返工记录，回退到指定工序 | 全部工序完成 → Step 8
Step 8 | 质检员 | 终检 | 终检通过，external_status = QC → PENDING_SHIP | 终检通过 → Step 9
Step 9 | 客服 | 录入承运商 + 运单号，执行发货 | external_status = SHIPPED，医生端收到通知 | 医生查看物流 → Step 10
Step 10 | 医生 | 查看物流信息（承运商 + 运单号） | 医生可通过 AI 订单助手查询物流状态 | 医生确认收货 → Step 11
Step 11 | 医生 | 点击「确认收货」 | external_status = COMPLETED，订单关闭 | 流程结束
Step 12 | 管理员 | 查看绩效统计看板 | 按人员 / 工序 / 订单维度展示全部绩效指标 | —

验收项 | 验收方法 | 通过标准
医生下单全流程 | 测试账号登录医生端，完整填写一个种植牙订单并上传 STL 文件 | 订单成功创建，external_status = PENDING_REVIEW，客服端收到通知
大文件上传 | 上传 100MB 以上的 STL 文件，中途模拟网络断开 | 断点续传成功，文件完整，无损坏
客服审核通过 | 客服端审核上述订单，通过 | 订单状态正确推进，生产端收到通知
外文翻译 | 提交含英文描述的订单，客服触发 AI 翻译 | 翻译草稿出现在可编辑框，确认前不写入系统，确认后写入
工序链实例化 | 生产审核通过后查看订单工序链 | 按产品类型模板正确生成 DAG 工序链实例，所有节点和连线正确
工序链自动匹配 | 提交种植类修复订单（口扫），生产审核通过后查看工序链实例 | 系统自动匹配「种植类修复」链的口扫分支，正确实例化所有节点，顺序和并联关系正确
并联节点执行 | 找到含并联分支的工序节点，同时执行两条并联线 | 并联的多个分支可同时进行；只有全部完成后才能流转下一节点
入检出检强制 | 尝试跳过入检直接出检 | 系统拒绝，提示必须先完成入检
返工流程 | 出检选择不通过 | 生成返工记录，工序回退，可重新执行
工时计算 | 执行一道工序，期间暂停 5 分钟 | 有效工时 = 总时长 - 5 分钟，暂停时间不计入
绩效统计 | 完成若干工序后查看绩效看板 | 6 项绩效指标按公式正确计算展示
终检发货 | 终检通过，录入物流信息 | external_status = SHIPPED，医生端实时收到通知
医生确认收货 | 医生端点击确认收货 | external_status = COMPLETED，订单关闭

验收项 | 验收方法 | 通过标准
医生端接口字段过滤 | 用医生账号调用所有订单相关接口，抓包查看响应 | 响应体中不含：工序节点详情、员工姓名、入检出检记录、工时数据、绩效数据、返工记录、责任分类
AI 订单助手脱敏 | 医生端用 AI 订单助手询问「我的订单现在谁在做」「做了几道工序」「有没有返工」 | AI 回答不包含任何内部信息，只回答外部状态和物流信息，或告知「暂无相关信息」
外部状态正确 | 订单在不同阶段，医生端显示对应的外部状态 | 7 个外部状态按定义正确触发，不显示内部工序名称
跨诊所数据隔离 | 用诊所 A 的医生账号尝试访问诊所 B 的订单 | 系统返回 403 或数据为空，不返回任何跨诊所数据

验收项 | 验收方法 | 通过标准
医生无法访问生产端 | 医生账号直接访问生产端 URL 或接口 | 系统返回 403
技工无法查看绩效全量 | 技工账号访问绩效统计接口 | 只返回本人数据，不返回其他员工数据
非管理员无法修改工序链 | 技工 / 客服账号尝试调用修改订单工序链的接口 | 系统返回 403
文件签名 URL 时效 | 获取预览签名 URL 后等待 16 分钟再访问 | 链接失效，返回 403 或过期错误

验收项 | 验收方法 | 通过标准
翻译助手 | 提交英文订单，客服触发翻译 | 生成中文草稿，确认前不写入，确认后正确写入生产指令
资料缺失助手 | 提交缺少附件的订单 | 系统列出缺失项，不自动退回
客服查询助手 | 客服询问某订单「现在在哪道工序」 | 正确返回内部工序状态，且发送前需客服确认
客户订单助手 | 医生询问「我的订单在哪」 | 仅返回外部状态，不泄露内部信息
生产备注助手 | 触发 AI 整理生产备注 | 生成草稿，人工确认后才写入，未确认不生效

字段名 | 字段 key | 类型 | 必填 | 说明
患者姓名 | patient_name | text | ✅ | 仅工厂内部可见，医生端展示
患者年龄 | patient_age | number | ❌
患者性别 | patient_gender | select | ❌ | 男 / 女
牙位 | tooth_position | text | ✅ | 如 11、21、36 等，支持多牙位逗号分隔
颜色 / 色号 | tooth_color | text | ❌ | 如 A2、B1，参考 VITA 色板
材料 | material | select | ✅ | 按产品类型提供选项，见各产品类型字段
邻接关系 | contact | select | ❌ | 紧 / 中 / 松
边缘设计 | margin_design | select | ❌ | 肩台 / 斜面 / 刃状边缘
外形要求 | shape_requirement | textarea | ❌ | 自由描述
特殊备注 | special_note | textarea | ❌ | 其他需要工厂注意的内容
附件上传 | attachments | file | ❌ | 支持多文件，Uppy 组件，支持 STL / JPG / PNG / PDF / DCM

字段名 | 字段 key | 类型 | 必填 | 说明
修复类型 | restoration_type | select | ✅ | 单冠 / 桥体 / 嵌体 / 贴面
基牙数量 | abutment_count | number | ✅ | 桥体时填写
桥体跨度 | bridge_span | text | ❌ | 如 14-16 三单位桥
材料 | material | select | ✅ | 全瓷 / 金属烤瓷 / 纯金属 / 氧化锆
咬合设计 | occlusion_design | select | ❌ | 正常咬合 / 轻咬合 / 无咬合
口扫文件 | scan_file | file | ✅ | STL 格式

字段名 | 字段 key | 类型 | 必填 | 说明
种植体品牌 | implant_brand | select | ✅ | Nobel / Straumann / Osstem / 其他
种植体型号 | implant_model | text | ✅ | 如 RC 4.1×10mm
基台类型 | abutment_type | select | ✅ | 原厂基台 / 个性化基台 / 粘接基台 / 螺丝固位
上部结构类型 | superstructure_type | select | ✅ | 全冠 / 种植桥 / 覆盖义齿
材料 | material | select | ✅ | 氧化锆 / 金属烤瓷 / 纯钛
口扫 / X 光 | scan_xray | file | ✅ | STL + X 光片
种植体位置图 | implant_position_image | file | ❌ | 标注种植体位置的照片或图示

字段名 | 字段 key | 类型 | 必填 | 说明
贴面类型 | veneer_type | select | ✅ | 贴面 / 超薄贴面 / 局部贴面
牙齿预备情况 | prep_status | select | ✅ | 已预备 / 未预备（微创）
材料 | material | select | ✅ | 长石质瓷 / 二硅酸锂（e.max）/ 氧化锆
透明度要求 | translucency | select | ❌ | 高透 / 中透 / 低透
美学参考照片 | aesthetic_reference | file | ❌ | 患者期望效果参考图
口扫文件 | scan_file | file | ✅ | STL 格式

字段名 | 字段 key | 类型 | 必填 | 说明
义齿类型 | denture_type | select | ✅ | 全口义齿 / 局部义齿 / 覆盖义齿
支架材料 | framework_material | select | ✅ | 钴铬合金 / 纯钛 / 热压膜
卡环类型 | clasp_type | select | ❌ | 铸造卡环 / 弯制卡环 / 隐形卡环
基托颜色 | base_color | select | ❌ | 粉红 / 浅粉 / 白色
人工牙品牌 | artificial_tooth_brand | text | ❌ | 如 Ivoclar Vivadent
咬合记录文件 | occlusion_record | file | ✅ | 石膏模型照片或口扫
旧义齿照片 | old_denture_photo | file | ❌ | 供参考的旧义齿照片

字段名 | 字段 key | 类型 | 必填 | 说明
矫治器类型 | ortho_type | select | ✅ | 透明压膜矫治器 / 保持器 / 功能性矫治器
治疗阶段 | treatment_stage | text | ❌ | 如「第 3 副，向右移动 0.2mm」
步骤数量 | step_count | number | ❌ | 本次制作几副
口扫文件 | scan_file | file | ✅ | STL 格式，上下颌分开
咬合记录 | bite_record | file | ✅ | 咬合关系 STL 或照片
治疗计划文件 | treatment_plan | file | ❌ | PDF 格式

发送方 | 接收方可见性 | 是否需要审核
医生 | 客服可见 ✅，生产端不可见 ❌ | 不需要，直接送达客服
客服 | 医生可见 ✅，生产端可见 ✅ | 不需要，直接送达两端
生产端（技工 / 管理员） | 客服可见 ✅，医生暂不可见 ⏳ | 需要客服审核通过后医生才可见

字段 | 类型 | 说明
msg_id | BIGINT PK | 消息唯一 ID
order_id | BIGINT FK | 所属订单
sender_user_id | BIGINT FK | 发送人
sender_role | VARCHAR(16) | 发送方角色：DOCTOR / CS / WORKER
content | TEXT | 消息正文
attachment_urls | JSON | 附件文件列表（可选）
visible_to | VARCHAR(32) | 可见范围：ALL / DOCTOR_CS / CS_WORKER / CS_ONLY（逗号分隔枚举）
review_status | VARCHAR(16) | 审核状态：DIRECT（无需审核）/ PENDING_REVIEW / APPROVED / REJECTED
reviewed_by | BIGINT FK | 审核客服 user_id（NULL = 未审核）
review_time | DATETIME | 审核时间
review_note | TEXT | 驳回原因（REJECTED 时填写）
edited_content | TEXT | 客服编辑后的内容（编辑后通过时记录原文和改后文）
create_time | DATETIME | 发送时间

页面位置 | 展示内容 | 操作
医生端 - 订单详情 - 留言区 | 显示：医生自己发的消息 + 客服发给医生的消息 + 生产端经审核通过的消息 | 输入消息 + 发送，可上传附件
客服端 - 订单详情 - 消息区 | 显示全部消息（含待审核 / 已驳回状态，用不同颜色标注） | 输入发送，选择发送对象；审核生产端消息（通过 / 编辑后通过 / 驳回）
生产端 - 订单详情 - 消息区 | 显示：客服发给生产端的消息 + 自己发的消息（含审核状态标注） | 输入消息 + 发送（提示「需客服审核后医生可见」）
客服端 - 待审核消息队列 | 所有待审核消息的汇总列表，按时间排序 | 快速审核操作，支持跳转对应订单

字段 | 类型 | 说明
draft_id | BIGINT PK | 设计稿唯一 ID
order_id | BIGINT FK | 所属订单
version | INT | 版本号，同一订单从 1 自增
uploader_user_id | BIGINT FK | 上传人（生产端任意人员）
file_urls | JSON | 设计稿文件列表（MinIO 原始路径，多文件）
upload_note | TEXT | 上传说明（可选）
status | VARCHAR(32) | 状态枚举：PENDING_CS_REVIEW / CS_REJECTED / PENDING_DOCTOR_CONFIRM / DOCTOR_CONFIRMED / DOCTOR_REJECTED
cs_reviewer_id | BIGINT FK | 客服审核人
cs_review_time | DATETIME | 客服审核时间
cs_reject_reason | TEXT | 客服驳回原因
doctor_confirm_time | DATETIME | 医生确认时间
doctor_reject_reason | TEXT | 医生驳回原因（驳回必填）
create_time | DATETIME | 上传时间

页面位置 | 展示内容 | 操作
生产端 - 订单详情 - 设计稿区 | 按版本号列表展示所有设计稿，含状态标注（待客服审核 / 客服驳回 / 待医生确认 / 医生已确认 / 医生驳回） | 上传设计稿，查看驳回原因
客服端 - 订单详情 - 设计稿区 | 同上，可查看所有版本，含上传人信息 | 审核操作（通过 / 驳回，驳回必填原因）
医生端 - 订单详情 - 设计稿区 | 只显示状态为 PENDING_DOCTOR_CONFIRM 和 DOCTOR_CONFIRMED / DOCTOR_REJECTED 的版本，不显示客服驳回的版本 | 确认 / 驳回（驳回必填原因），文件预览（签名 URL，15 分钟有效）

验收项 | 验收方法 | 通过标准
设计稿上传 | 生产端上传多个文件的设计稿 | 文件上传成功，版本号 V1 生成，客服收到通知
客服审核通过 | 客服审核通过设计稿 | 状态变为 PENDING_DOCTOR_CONFIRM，医生端收到通知
客服驳回 | 客服驳回设计稿 | 状态变为 CS_REJECTED，上传人收到通知和驳回原因，医生端不可见
医生确认 | 医生确认设计稿 | 状态变为 DOCTOR_CONFIRMED，客服和上传人收到通知
医生驳回 | 医生驳回设计稿并填写原因 | 状态变为 DOCTOR_REJECTED，客服和上传人同时收到通知和驳回原因
版本记录 | 经过三轮驳回-重传流程 | 订单设计稿区展示 V1/V2/V3 三个版本，每个版本状态独立展示，不可删除
医生端隔离 | 客服驳回的设计稿在医生端 | 医生端不显示 CS_REJECTED 状态的设计稿

编号 | 问题 | 影响模块 | 跟进方
Q1 | 生产备注的标准格式模板由客户另行提供，全栈收到后按格式实现 AI-5 的输出结构 | AI 生产备注助手 | 客户 → 全栈
Q2 | 动态表单字段清单为行业常识拟定（见第 12 章），需客户逐产品类型确认字段是否准确、是否有增删 | 医生端下单表单 | PM 与客户确认
Q3 | 签名 URL 有效期（预览 15 分钟 / 下载 2 小时）后续如客户有调整要求，改为可配置 | 文件安全 | 客户反馈后调整

项目 | 规范
Base URL（正式） | https://api.yourdomain.com/v1
Base URL（测试） | https://test-api.yourdomain.com/v1
认证方式 | Authorization: Bearer {access_token}（JWT）
统一响应格式 | { "code": 200, "msg": "success", "data": {} }
错误格式 | { "code": 4xx/5xx, "msg": "错误说明", "data": null }
分页参数 | GET 请求统一用 page（页码，从1开始）和 size（每页条数，默认20）
时间格式 | ISO 8601：2026-06-27T10:00:00Z
字段命名 | snake_case

接口 | 方法 | 权限 | 说明
POST /auth/login | POST | 无需认证 | 登录，返回 access_token（有效期 2h）+ refresh_token（有效期 7d）+ role + user_id
POST /auth/refresh | POST | 无需认证 | 用 refresh_token 换新 access_token，无感续期
POST /auth/logout | POST | 全部角色 | 服务端使当前 Token 失效

字段 | 类型 | 必填 | 说明
username | string | ✅ | 账号
password | string | ✅ | 密码

字段 | 类型 | 说明
access_token | string | JWT Access Token
refresh_token | string | Refresh Token
expires_in | integer | access_token 有效期（秒），固定 7200
role | string | DOCTOR / CS / WORKER / ADMIN
user_id | integer | 当前用户 ID

接口 | 方法 | 说明
GET /users | GET | 获取用户列表，支持按 role / clinic_id 筛选，分页
POST /users | POST | 创建用户，需传 username / password / role，DOCTOR 角色需传 clinic_id
PUT /users/{userId} | PUT | 编辑用户信息（real_name / status）
DELETE /users/{userId} | DELETE | 禁用用户（软删除）

接口 | 方法 | 权限 | 说明
GET /clinics | GET | CS / ADMIN | 诊所列表，支持关键字搜索，分页
POST /clinics | POST | ADMIN | 创建诊所，传 clinic_name / country / language / cs_user_id
GET /clinics/{clinicId} | GET | CS / ADMIN | 诊所详情
GET /clinics/{clinicId}/preference | GET | CS / ADMIN | 获取客户偏好（颜色/邻接/边缘/外形/材料）
PUT /clinics/{clinicId}/preference | PUT | CS / ADMIN | 更新客户偏好，覆盖写

接口 | 方法 | 权限 | 说明
GET /form-configs | GET | 全部角色 | 按 product_type 获取字段配置列表，医生下单时调用
POST /form-configs | POST | ADMIN | 新增字段：传 product_type / field_key / field_label / field_type / is_required / options / sort_order
PUT /form-configs/{fieldId} | PUT | ADMIN | 编辑字段（label / 必填 / 选项 / 排序 / 启停）

接口 | 方法 | 权限 | 说明
POST /files/upload-token | POST | 全部角色 | 获取 MinIO 预签名上传 URL，Uppy 直传；返回 upload_url + file_id
GET /files/{fileId}/preview-url | GET | 按业务规则 | 获取预览签名 URL，有效期 15 分钟，写审计日志
GET /files/{fileId}/download-url | GET | 按业务规则 | 获取下载签名 URL，有效期 2 小时，写审计日志

接口 | 方法 | 权限 | 说明
GET /orders | GET | 全部角色 | 订单列表；DOCTOR 只返回本人订单；医生端响应在数据层过滤内部字段
POST /orders | POST | DOCTOR | 提交订单；传 product_type / form_data(JSON) / file_ids / is_draft
GET /orders/{orderId} | GET | 全部角色 | 订单详情；DOCTOR 响应不含 internal_status / production_note 等内部字段
PUT /orders/{orderId} | PUT | DOCTOR | 更新订单（补资料/编辑草稿），仅限草稿或驳回状态
POST /orders/{orderId}/review | POST | CS / ADMIN | 客服初审：action=APPROVE（附 production_note）或 REJECT（附 reject_reason）
POST /orders/{orderId}/production-review | POST | WORKER / ADMIN | 生产端数据审核：APPROVE 触发工序链实例化
POST /orders/{orderId}/confirm-receipt | POST | DOCTOR | 医生确认收货，external_status → COMPLETED

接口 | 方法 | 权限 | 说明
GET /workflow-chains | GET | ADMIN / CS / WORKER | 获取全部 9 条工序链列表，含 chain_id / chain_name / intake_branch（IMPRESSION=印模/SCAN=口扫/BOTH=下单选择）
GET /workflow-chains/{chainId}/nodes | GET | ADMIN / CS / WORKER | 获取某条工序链的节点列表，含 node_id / process_name / step_order / is_optional / branch_group（并联分组）

接口 | 方法 | 权限 | 说明
GET /orders/{orderId}/process-instance | GET | CS / WORKER / ADMIN | 工序链实例详情；含每个节点的 node_status（PENDING/IN_PROGRESS/COMPLETED/REWORK）+ assigned_username；医生端无此接口
POST /orders/{orderId}/process-instance/assign | POST | ADMIN | 批量绑定执行员工；传 assignments 数组（node_instance_id + user_id）；绑定后员工收通知
POST /orders/{orderId}/process-instance/nodes/{nodeInstanceId}/reassign | POST | ADMIN | 转派：传 new_user_id + reason；新员工收通知，转派留痕
GET /tasks/mine | GET | WORKER | 我的任务池；只返回分配给当前登录员工的任务，支持按 status 筛选

接口 | 方法 | 说明
POST /check-records | POST | 提交入检或出检；check_type=1（入检）/ 2（出检）；出检不通过时 rework_to_node_id 必填；服务端强制校验顺序（未入检不能出检）
GET /check-records/{nodeInstanceId} | GET | 获取某工序节点的所有入检/出检记录

接口 | 方法 | 说明
POST /work-logs/start | POST | 开始计时：传 node_instance_id；同一节点只能有一条进行中记录；返回 work_log_id
POST /work-logs/{workLogId}/pause | POST | 暂停计时：记录暂停开始时间
POST /work-logs/{workLogId}/resume | POST | 继续计时：累计暂停时长
POST /work-logs/{workLogId}/finish | POST | 完成：服务端计算 actual_duration = (end_time - start_time) - pause_duration

接口 | 方法 | 权限 | 说明
GET /performance | GET | WORKER（本人）/ ADMIN（全部） | 支持 user_id / start_date / end_date 参数；返回 6 项绩效指标（见 PRD 第5章）

接口 | 方法 | 权限 | 说明
GET /orders/{orderId}/messages | GET | 全部角色 | 消息列表；数据层按角色过滤：DOCTOR 只返回 DIRECT/APPROVED 消息；WORKER 只返回 visible_to 含 WORKER 的消息；CS/ADMIN 返回全部
POST /orders/{orderId}/messages | POST | 全部角色 | 发送消息；DOCTOR 发出 review_status=DIRECT；WORKER 发出 review_status=PENDING_REVIEW；CS 发出 DIRECT，可指定 visible_to（DOCTOR_CS/CS_WORKER/ALL）
POST /messages/{msgId}/review | POST | CS / ADMIN | 审核消息：action=APPROVE/EDIT_AND_APPROVE（附 edited_content）/REJECT（附 review_note）
GET /messages/pending-review | GET | CS / ADMIN | 待审核消息汇总列表，按时间正序

接口 | 方法 | 权限 | 说明
GET /orders/{orderId}/design-drafts | GET | 全部角色 | 设计稿列表（按版本正序）；DOCTOR 只返回 PENDING_DOCTOR_CONFIRM/DOCTOR_CONFIRMED/DOCTOR_REJECTED 版本，CS_REJECTED 不可见
POST /orders/{orderId}/design-drafts | POST | WORKER / CS / ADMIN | 上传新版设计稿：传 file_ids + upload_note；版本号自增；状态=PENDING_CS_REVIEW；客服收通知
POST /orders/{orderId}/design-drafts/{draftId}/cs-review | POST | CS / ADMIN | 客服审核：APPROVE（医生收通知）或 REJECT（附 cs_reject_reason，上传人收通知）
POST /orders/{orderId}/design-drafts/{draftId}/doctor-confirm | POST | DOCTOR | 医生操作：CONFIRM（流转生产）或 REJECT（附 doctor_reject_reason，客服和上传人同时收通知）

接口 | 方法 | 权限 | 说明
GET /orders/{orderId}/bill | GET | DOCTOR（只读）/ CS / ADMIN | 账单信息（含文件预览 URL）
POST /orders/{orderId}/bill | POST | CS / ADMIN | 上传账单文件：传 file_id
GET /orders/{orderId}/logistics | GET | DOCTOR（只读）/ CS / ADMIN | 物流信息（承运商 + 运单号 + 发货时间）
POST /orders/{orderId}/logistics | POST | CS / ADMIN | 录入物流并发货：传 carrier + tracking_no；触发 external_status→SHIPPED；医生收 WebSocket 通知

接口 | 方法 | 权限 | AI 编号 | 说明
POST /ai/translate | POST | CS / ADMIN | AI-1 | 翻译助手：传 order_id + source_text；返回 translated_text 草稿；不写入任何字段
POST /ai/check-missing | POST | DOCTOR / CS / ADMIN | AI-4 | 资料缺失检查：传 order_id；返回 is_complete + missing_items 列表（含 tip 文案）；不执行退回
POST /ai/cs-query | POST | CS / ADMIN | AI-2 | 客服查询助手：传 order_id + question；读内部全量数据；返回 answer；不写入不发送
POST /ai/order-query | POST | DOCTOR | AI-3 | 客户订单助手：传 order_id + question；服务端数据层只读 external_status + 物流；返回 answer；绝对不返回内部信息
POST /ai/production-note | POST | CS / WORKER / ADMIN | AI-5 | 生产备注助手：传 order_id；返回 draft_note 草稿；格式按客户模板（另行提供）；不写入任何字段

event 事件名 | 触发条件 | 推送对象
ORDER_SUBMITTED | 医生提交订单 | CS
ORDER_APPROVED | 客服审核通过 | DOCTOR + WORKER
ORDER_REJECTED | 订单被驳回 | DOCTOR
DESIGN_DRAFT_UPLOADED | 设计稿上传 | CS
DESIGN_DRAFT_CS_APPROVED | 客服通过设计稿 | DOCTOR
DESIGN_DRAFT_CS_REJECTED | 客服驳回设计稿 | 上传人
DESIGN_DRAFT_CONFIRMED | 医生确认设计稿 | CS + 上传人
DESIGN_DRAFT_REJECTED | 医生驳回设计稿 | CS + 上传人
TASK_ASSIGNED | 工序任务分配给员工 | 对应 WORKER
TASK_REASSIGNED | 工序任务转派 | 新旧 WORKER
MESSAGE_RECEIVED | 新消息（已通过审核或无需审核） | 目标接收方
MESSAGE_PENDING_REVIEW | 生产端消息待审核 | CS
MESSAGE_REVIEW_REJECTED | 消息被客服驳回 | 发送人
PROCESS_BLOCKED | 并联节点超时告警 | ADMIN
ORDER_SHIPPED | 发货完成 | DOCTOR
ORDER_COMPLETED | 医生确认收货 | CS + ADMIN
BILL_UPLOADED | 账单上传 | DOCTOR
