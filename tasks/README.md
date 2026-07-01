# Tasks

## 当前里程碑

任务 8：专项验收矩阵与上线准备。

当前目标是清理上线前硬缺口：已完成 readiness audit、OpenAPI 二次契约、Bearer 身份基线、后端权限守卫、数据库化 RBAC/DataScope 基础、权限注解/统一拦截器、订单/工序实例 DataScope SQL 第一增量、文件/协同/AI DataScope 扩展、菜单/部门/岗位/前端权限路由第一增量、生产鉴权启动门禁第一增量、WebSocket 通知第一增量、通知未读/已读第一增量、通知实时前端/Redis 广播第一增量、医生订单工作台第一增量、医生下单/动态表单第一增量、客服初审第一增量、生产审核第一增量、生产任务入口第一增量、质检工时第一增量、绩效管理第一增量、生产看板第一增量、返工终检第一增量、Multipart 上传第一增量、本地恢复上传第一增量、服务端候选恢复第一增量、服务端候选恢复浏览器 smoke、上传中断后恢复浏览器 smoke、100MB+ 浏览器上传 smoke、AI 调用限流第一增量、AI 成本审计第一增量、AI 模型重试第一增量、AI 模型失败审计第一增量、AI 治理摘要第一增量、AI 预算阈值第一增量和 AI 预算超限审计第一增量，后续继续补真实弱网/跨设备续传、返工影响图形化、生产级 AI 治理和部署交付材料。

当前计划已按 TRD V1.1 深度研究优化版重排。任务 0、0.1、1、2、3、4、5A、5B、6、7、8A、8B、9A 已完成；9B.1 到 9B.7、9C.1 到 9C.3、9D.1 到 9D.10 第一增量已完成；任务 8 总体仍进行中，正式上线缺口未完成。

## 任务 9D.19：返工通知联动第一增量

状态：completed-first-increment。

目标：出检失败生成返工记录时写入 REWORK_CREATED 通知给目标 WORKER；返工关闭后写入 REWORK_CLOSED 通知给订单 CS；医生用户不接收返工内部通知。

验证命令：`npm run check:task9d19`、`npm run acceptance`、`npm run check:openapi`、`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test`。

剩余风险：当前只做内部通知事实和本地推送，不覆盖真实双实例 Redis、生产网关和前端点击级通知联动验收。

## 任务 9D.32：AI 预算超限审计第一增量

状态：completed-first-increment。

来源：

- 9D.31 已能在治理摘要中标记 `budget_exceeded`，但预算跨线没有可追踪的告警审计事件。
- readiness 清单仍把预算告警推送、熔断/降级和生产级 AI 治理列为上线硬缺口。

目标：

- 真实模型成功调用导致近 24 小时估算成本跨过预算阈值时，写入可追踪治理审计。
- 治理摘要返回预算告警次数和最近预算告警时间。
- 形成后续通知推送、熔断或降级策略的稳定触发点。

范围：

- 新增 `AI_BUDGET_EXCEEDED` 审计状态和 `ai-governance-budget-exceeded` 虚拟模型名。
- `AiGatewayService#auditBudgetExceededIfCrossed` 只在真实模型成功调用让成本从低于阈值跨到达到/超过阈值时写入审计。
- `AiGovernanceSummaryResponse` 新增 `budget_alert_count` 和 `latest_budget_alert_at`。
- 新增 `AiGatewayDeepSeekTests#deepSeekProviderAuditsBudgetExceededWhenDailyBudgetIsReached`。
- OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不拦截 AI 请求。
- 不发送外部通知或 WebSocket 通知。
- 不做分角色/分模型预算、不做熔断/降级、不新增管理页面。
- 不把 Task 8 标为完成。

验收标准：

- 配置预算阈值后，真实模型成功调用若让近 24 小时估算成本跨过阈值，会额外写入一条 `AI_BUDGET_EXCEEDED`。
- `AI_BUDGET_EXCEEDED` 不重复计入估算成本。
- `/ai/governance/summary` 返回 `budget_alert_count` 和 `latest_budget_alert_at`。

建议验证命令：

```bash
npm run check:task9d32
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderAuditsBudgetExceededWhenDailyBudgetIsReached test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests,AiGatewayDeepSeekTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认真实模型成功调用后没有 `AI_BUDGET_EXCEEDED` 审计。
- 已在成功审计后检测近 24 小时预算跨线，并写入成本为 0 的治理审计。
- 治理摘要已同步预算告警次数和最近预算告警时间。

剩余风险：

- 仍缺预算通知推送、分角色/分模型预算、熔断/降级、提示词版本、输出防护、真实 key 联调和生产部署。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.31：AI 预算阈值第一增量

状态：completed-first-increment。

来源：

- 9D.30 已补内部 AI 治理摘要，但预算仍只是裸成本数字，没有可配置阈值或超额标记。
- readiness 清单仍把预算告警、熔断/降级和生产级 AI 治理列为上线硬缺口。

目标：

- 新增可配置近 24 小时 AI 预算阈值。
- 治理摘要返回预算阈值和是否达到/超过阈值。
- 默认不启用预算阈值，避免本地和 CI 因价格配置产生误报。

范围：

- 新增 `AI_DAILY_BUDGET_MICROUSD` / `app.ai.daily-budget-microusd`，默认 0。
- `AiGovernanceSummaryResponse` 新增 `daily_budget_microusd` 和 `budget_exceeded`。
- `AiGatewayService#governanceSummary` 用近 24 小时 `estimated_cost_microusd` 判断是否达到阈值。
- 新增 `AiGatewayTests#aiGovernanceSummaryFlagsDailyBudgetThreshold`。
- OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不拦截 AI 请求。
- 不发送通知或告警。
- 不做分角色/分模型预算、不做熔断/降级、不新增管理页面。
- 不把 Task 8 标为完成。

验收标准：

- 配置 `app.ai.daily-budget-microusd=100` 时，治理摘要返回 `daily_budget_microusd=100`。
- 近 24 小时估算成本达到或超过阈值时，`budget_exceeded=true`。
- 默认阈值为 0，表示不启用预算阈值。

建议验证命令：

```bash
npm run check:task9d31
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests#aiGovernanceSummaryFlagsDailyBudgetThreshold test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认治理摘要缺少 `daily_budget_microusd`。
- 已新增预算阈值配置和摘要超额标记。
- 本轮只读聚合既有 `ai_audit_log`，不清理历史审计数据。

剩余风险：

- 仍缺预算告警推送、分角色/分模型预算、熔断/降级、提示词版本、输出防护、真实 key 联调和生产部署。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.30：AI 治理摘要第一增量

状态：completed-first-increment。

来源：

- 9D.26 到 9D.29 已补限流、成本、重试和模型失败审计，但内部人员仍没有一个最小治理视图查看近 24 小时失败和成本趋势。
- readiness 清单仍把生产级 AI 治理列为上线硬缺口。

目标：

- 新增内部只读 AI 治理摘要入口。
- CS / ADMIN 可查看近 24 小时成功、安全拒绝、限流、模型失败、估算成本和最近模型失败时间。
- 不暴露 prompt 原文、供应商错误正文或真实密钥。

范围：

- 新增 `GET /ai/governance/summary`。
- 新增 `AiGovernanceSummaryResponse`。
- `AiGatewayService#governanceSummary` 基于 `ai_audit_log` 聚合近 24 小时数据。
- 新增 `AiGatewayTests#aiGovernanceSummaryCountsRecentAuditOutcomesForInternalUsers`。
- OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不做前端管理页面。
- 不做告警推送、熔断、降级或提示词版本管理。
- 不新增汇总表，不清理历史 AI 审计。
- 不把 Task 8 标为完成。

验收标准：

- `GET /ai/governance/summary` 返回 24 小时窗口。
- 响应包含 `success_count`、`safe_refusal_count`、`rate_limited_count`、`model_failed_count`、`estimated_cost_microusd` 和 `latest_model_failure_at`。
- 仅 CS / ADMIN 可访问。

建议验证命令：

```bash
npm run check:task9d30
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests#aiGovernanceSummaryCountsRecentAuditOutcomesForInternalUsers test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认 `/ai/governance/summary` 返回 404。
- 已新增内部只读治理摘要入口，聚合近 24 小时 AI 审计。
- 测试使用现有本机测试库基线增量断言，不删除历史审计数据。

剩余风险：

- 仍缺告警推送、熔断/降级、提示词版本、输出防护、真实 key 联调和生产部署。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.29：AI 模型失败审计第一增量

状态：completed-first-increment。

来源：

- 9D.28 已补真实模型短暂失败重试，但重试耗尽后仍需要受控响应和审计留痕。
- readiness 清单仍把失败审计、熔断/降级告警列为生产级 AI 治理缺口。

目标：

- 真实模型重试耗尽或不可恢复失败时，对外返回 503。
- 使用独立事务写入 `ai_audit_log.result_status=AI_MODEL_FAILED`。
- 不把 DeepSeek 或上游供应商原始错误正文暴露给用户。

范围：

- `AiGatewayService` 在真实模型失败路径写 `AI_MODEL_FAILED` 审计。
- `AiGatewayDeepSeekTests#deepSeekProviderAuditsModelFailureWhenRetriesAreExhausted` 覆盖连续两次 500。
- OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不做熔断、降级到 deterministic、告警推送、失败次数聚合或管理后台。
- 不提交真实 DeepSeek API Key。
- 不把 Task 8 标为完成。

验收标准：

- DeepSeek stub 连续两次返回 500 时，接口返回 503。
- 外部模型请求次数为 2。
- `ai_audit_log` 写入一条 `AI_MODEL_FAILED` 审计。

建议验证命令：

```bash
npm run check:task9d29
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderAuditsModelFailureWhenRetriesAreExhausted test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认连续两次 DeepSeek 500 会直接冒出供应商异常。
- 已将失败路径收口为 503，并用独立事务保留失败审计。
- 失败审计使用 `model_name=ai-governance-model-failure`，避免伪装成真实模型成功调用。

剩余风险：

- 仍缺失败次数聚合、熔断/降级告警、提示词版本、输出防护、预算告警和真实环境联调记录。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.28：AI 模型重试第一增量

状态：completed-first-increment。

来源：

- 9D.26 已完成真实模型限流，9D.27 已完成单次成本审计。
- 生产级 AI 治理仍缺真实模型短暂 5xx/网络抖动下的重试能力。

目标：

- DeepSeek 真实模型调用遇到短暂 5xx 或连接类异常时可有限重试。
- 默认 `AI_MODEL_MAX_RETRIES=1`，可按环境变量调低为 0 或调高。
- 重试成功后仍只写一条 `SUCCESS` 审计，不把失败尝试写成业务成功。

范围：

- `AiGatewayProperties` 新增 `maxModelRetries`。
- `AiGatewayService#completeWithModel` 对真实模型调用增加有限重试。
- `AiGatewayDeepSeekTests#deepSeekProviderRetriesTransientServerFailureBeforeAuditingSuccess` 覆盖首次 500、第二次成功。
- `.env.example`、OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不做熔断、指数退避、失败审计、告警、预算拦截或真实 key 联调。
- 不改变 deterministic fallback 行为。
- 不提交真实 DeepSeek API Key。
- 不把 Task 8 标为完成。

验收标准：

- DeepSeek stub 第一次返回 500、第二次返回 200 时，接口最终返回 200。
- 外部模型请求次数为 2。
- 成功后 `ai_audit_log` 只记录一条 `deepseek-chat` 成功审计。

建议验证命令：

```bash
npm run check:task9d28
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests#deepSeekProviderRetriesTransientServerFailureBeforeAuditingSuccess test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认 DeepSeek 首次 500 会直接导致接口异常。
- 已新增 `AI_MODEL_MAX_RETRIES` 配置，默认真实模型短暂失败重试 1 次。
- 已限制重试条件为 5xx 和连接类异常，避免把权限/参数类 4xx 当成可恢复错误。

剩余风险：

- 仍缺失败重试审计、熔断/降级告警、提示词版本、输出防护、预算告警和真实环境联调记录。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.27：AI 成本审计第一增量

状态：completed-first-increment。

来源：

- 9D.26 已为真实模型调用增加每用户小时限流，但生产级 AI 治理仍缺成本统计基础。
- 当前 `ai_audit_log` 已记录模型名和 token 数，但没有保存单次调用成本估算。

目标：

- 为每条 AI 审计记录保存估算成本。
- 成本单价由环境变量配置，不在仓库写死真实供应商价格。
- DeepSeek stub 测试覆盖 token usage 到成本字段的落库。

范围：

- 新增 Flyway `V18__ai_audit_cost.sql`，为 `ai_audit_log` 增加 `estimated_cost_microusd`。
- 新增 `AI_INPUT_TOKEN_COST_MICROUSD`、`AI_OUTPUT_TOKEN_COST_MICROUSD` 配置和 `.env.example` 占位值。
- `AiGatewayService#audit` 写入估算成本。
- `AiGatewayDeepSeekTests#deepSeekProviderAuditsEstimatedCostMicrousdFromTokenUsage` 覆盖 18 输入 token、6 输出 token、2/8 微美元单价时成本为 84。
- acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不做真实供应商价格同步。
- 不做币种汇率、预算告警、按日/月聚合或管理后台图表。
- 不提交真实 DeepSeek API Key。
- 不把 Task 8 标为完成。

验收标准：

- Flyway 能新增 `estimated_cost_microusd` 字段。
- DeepSeek usage 返回 token 后，AI 审计行写入可配置估算成本。
- 默认成本配置为 0，不影响本地 deterministic 和 CI 路径。

建议验证命令：

```bash
npm run check:task9d27
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认 `ai_audit_log` 缺少 `estimated_cost_microusd` 字段。
- 已新增 V18 成本审计迁移和可配置 token 微美元单价。
- 已在 AI 审计写入时计算 `estimated_cost_microusd`。
- OpenAPI 文档说明成本配置变量；仓库不内置真实供应商价格。

剩余风险：

- 仍缺成本汇总、预算告警、提示词版本、输出防护、重试/熔断和真实环境联调记录。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.26：AI 调用限流第一增量

状态：completed-first-increment。

来源：

- 9D.15 已完成真实 DeepSeek 接入第一增量，但生产级 AI 治理仍缺限流、成本、重试、降级和输出防护。
- Task 8 readiness 仍把生产级 AI 治理列为上线硬缺口。

目标：

- 为真实模型调用增加每用户每小时限流。
- 超额请求返回 429，不再调用 DeepSeek。
- 超额拒绝写入 `ai_audit_log.result_status=AI_RATE_LIMITED`，便于上线前追踪治理效果。

范围：

- 新增 `AI_MAX_REQUESTS_PER_USER_HOUR` 配置，默认 120。
- `AiGatewayService` 在真实模型调用前执行限流检查。
- `AiGatewayDeepSeekTests` 覆盖第三次调用被 429 拒绝、DeepSeek stub 只收到两次请求、审计记录保留。
- OpenAPI、acceptance、`.env.example`、`package.json` 和静态检查脚本同步。

非目标：

- 不做分角色/分 agent 额度。
- 不做成本预算、重试、熔断、告警、提示词版本或管理后台配置。
- 不提交真实 DeepSeek API Key。
- 不把 Task 8 标为完成。

验收标准：

- DeepSeek 启用且用户达到小时额度后，下一次真实模型请求返回 429。
- 被限流请求不调用外部模型。
- 被限流请求写 `AI_RATE_LIMITED` 审计。
- 默认 deterministic 模式仍不依赖外部网络。

建议验证命令：

```bash
npm run check:task9d26
npm run acceptance
npm run check:openapi
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayDeepSeekTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认第三次 DeepSeek 调用仍返回 200 并继续打到 stub。
- 已新增每用户每小时真实模型限流配置和 `AI_RATE_LIMITED` 审计。
- 已用独立事务保留限流审计，避免 429 异常回滚审计记录。
- OpenAPI 已同步 AI 真实模型接口的 429 响应。

剩余风险：

- 仍缺成本统计、提示词版本、重试/熔断、输出防护、告警和生产环境真实 key 联调记录。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.25：绩效明细第一增量

状态：completed-first-increment。

来源：

- 9D.21 已把绩效汇总拆出生产责任、非生产责任和未归因返工，但管理端还不能核对每条完成工时来源。
- Task 8 readiness 仍把绩效明细、周期筛选、标准工时配置和申诉闭环列为上线缺口。

目标：

- 新增绩效工时明细接口，返回最近 100 条已完成 work log。
- WORKER 只能看本人明细，ADMIN 可按 `user_id` 查询指定员工。
- 前端绩效页展示“工时明细”表，方便核对汇总来源。

范围：

- 后端 `GET /performance/details`。
- `PerformanceDetailResponse` 返回订单、工序、有效工时、标准工时、准时标记和完成时间。
- 后端 TDD 测试覆盖 WORKER 忽略外部 `user_id`、只返回本人完成工时。
- 前端绩效页加载 `/performance` 与 `/performance/details`。
- OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不做周期筛选。
- 不做奖金/扣罚完整公式、绩效申诉、补录或导出。
- 不做标准工时后台配置。
- 不把 Task 8 标为完成。

验收标准：

- `GET /performance/details` 返回最近 100 条已完成工时明细。
- WORKER 传入其他 `user_id` 时仍只返回本人数据。
- 前端绩效页显示“工时明细”表。
- OpenAPI 与 acceptance 同步。

建议验证命令：

```bash
npm run check:task9d25
npm run acceptance
npm run check:openapi
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#performanceDetailsListCompletedWorkLogsForResolvedUser test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认 `/performance/details` 当前返回 404。
- 后端已新增 `PerformanceDetailResponse`、`GET /performance/details` 和最近 100 条完成工时查询。
- 前端绩效页已在汇总卡片下展示“工时明细”。
- OpenAPI 已同步 `PerformanceDetail` schema 和 `getPerformanceDetails` operation。
- 新增 `scripts/check-task-9d25-performance-details.mjs`、`npm run check:task9d25`，并纳入 `acceptance.json`。

剩余风险：

- 仍缺绩效周期筛选、完整公式、标准工时配置、申诉闭环和明细导出。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.23：返工影响筛选第一增量

状态：completed-first-increment。

来源：

- 9D.22 已在返工记录中保存影响后续节点数量和 ID，但内部人员仍只能浏览混合列表，不能快速筛出“影响过后续工序”的返工。
- Task 8 readiness 仍把返工影响图形化/筛选列为完整返工闭环缺口之一。

目标：

- 在既有 `/reworks` 列表上增加影响后续节点筛选参数。
- 前端「返工终检」页面提供“仅看影响后续工序”最小筛选入口。
- 保持医生端不可见内部返工信息，Task 8 不标完成。

范围：

- `GET /reworks` 新增可选查询参数 `has_impacted_nodes`。
- `WorkflowExecutionService#getReworks` 根据 `impacted_node_count > 0` 或 `= 0` 过滤。
- 新增 `CheckWorklogPerformanceTests#reworkListCanFilterRecordsThatImpactedDownstreamNodes`，覆盖有影响和无影响返工的 true/false 筛选。
- 前端返工终检工具栏新增 `reworkOnlyImpacted` 开关，开启后请求 `has_impacted_nodes=true`。
- OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不新增公开 API path。
- 不做 DAG 图形化、导出、复杂筛选组合或 `IN_PROGRESS` 后续节点冲突确认。
- 不改变返工创建、关闭、通知或绩效公式。
- 不把 Task 8 标为完成。

验收标准：

- `has_impacted_nodes=true` 只返回 `impacted_node_count > 0` 的返工记录。
- `has_impacted_nodes=false` 只返回 `impacted_node_count = 0` 的返工记录。
- 不传该参数时保持既有列表行为。
- 前端能一键筛出影响后续工序的返工记录。

建议验证命令：

```bash
npm run check:task9d23
npm run acceptance
npm run check:openapi
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#reworkListCanFilterRecordsThatImpactedDownstreamNodes test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认 `/reworks?has_impacted_nodes=true` 仍返回无影响返工。
- 后端已透传 `has_impacted_nodes` 并按 `impacted_node_count` 过滤。
- 前端返工终检页已新增“仅看影响后续工序”筛选开关。
- OpenAPI 已同步 `/reworks` 查询参数。
- 新增 `scripts/check-task-9d23-rework-impact-filter.mjs`、`npm run check:task9d23`，并纳入 `acceptance.json`。

验收结果：

- `CheckWorklogPerformanceTests#reworkListCanFilterRecordsThatImpactedDownstreamNodes`：PASS。
- `CheckWorklogPerformanceTests`：PASS。
- `platform-server` 后端测试：PASS。
- `npm run check:task9d23`、`npm run acceptance`、`npm run check:openapi`、`npm run build:frontend`、`git diff --check`：PASS。

剩余风险：

- 仍缺返工影响范围图形化、导出和 `IN_PROGRESS` 后续节点冲突处理。
- 仍缺绩效完整公式、周期筛选、管理端明细、申诉闭环和标准工时配置。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.22：返工影响审计可视化第一增量

状态：completed-first-increment。

来源：

- 9D.20 已能在后道失败返前道时把目标后续 `READY/COMPLETED` 节点重置为 `PENDING`，但返工记录列表没有留存“本次返工影响了哪些后续节点”。
- Task 8 readiness 仍把返工影响审计/可视化列为完整返工闭环缺口之一。

目标：

- 在创建返工时记录本次实际被重置的后续节点数量和节点 ID。
- 在既有 `/reworks` 列表响应中返回影响范围审计字段。
- 前端「返工终检」页面展示影响后续节点数量和节点 ID。

范围：

- 新增 Flyway `V17__rework_impact_audit.sql`，为 `rework_record` 增加 `impacted_node_count` 和 `impacted_node_instance_ids`。
- `WorkflowExecutionService#createRework` 在重置后续节点前计算实际可重置的后续节点，并写入返工记录。
- `ReworkRecordResponse`、`loadRework` 和 `getReworks` 返回审计字段。
- 新增 `CheckWorklogPerformanceTests#reworkListExposesImpactedDownstreamNodesForAudit`。
- 前端返工列表和详情展示影响范围审计信息。
- OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不新增公开 API path。
- 不做图形化 DAG 展示、影响范围筛选、审计导出或人工确认冲突流程。
- 不处理 `IN_PROGRESS` 后续节点冲突确认。
- 不把 Task 8 标为完成。

验收标准：

- 后道出检失败返到前道节点时，返工记录保存实际被重置的后续节点数量。
- `/reworks` 返回 `impacted_node_count` 和 `impacted_node_instance_ids`。
- 前端返工终检页面能看到影响后续节点数量和 ID。
- 历史检查、工时和返工记录不删除、不覆盖。

建议验证命令：

```bash
npm run check:task9d22
npm run acceptance
npm run check:openapi
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#reworkListExposesImpactedDownstreamNodesForAudit test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认 `/reworks` 缺少 `impacted_node_count`。
- 返工创建时已写入实际受影响后续节点数量和 JSON 节点 ID 列表。
- 前端返工终检页已展示影响后续节点数量和 ID。
- OpenAPI `ReworkRecordResponse` schema 已同步新增字段。
- 新增 `scripts/check-task-9d22-rework-impact-audit.mjs`、`npm run check:task9d22`，并纳入 `acceptance.json`。

验收结果：

- `CheckWorklogPerformanceTests#reworkListExposesImpactedDownstreamNodesForAudit`：PASS。
- `CheckWorklogPerformanceTests`：PASS。
- `platform-server` 后端测试：PASS。
- `npm run check:task9d22`、`npm run acceptance`、`npm run check:openapi`、`npm run build:frontend`、`git diff --check`：PASS。

剩余风险：

- 仍缺返工影响范围图形化、筛选、导出和 `IN_PROGRESS` 后续节点冲突处理。
- 仍缺绩效完整公式、周期筛选、管理端明细、申诉闭环和标准工时配置。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.21：绩效归因联动第一增量

状态：completed-first-increment。

来源：

- 9D.17 到 9D.20 已完成返工关闭、责任分类、字典、通知和复杂影响范围重置，但绩效统计仍只暴露总返工次数，无法区分生产人员责任和非生产责任。
- Task 8 readiness 仍把绩效归因联动列为正式上线前管理端硬缺口之一。

目标：

- 在既有 `/performance` 统计中拆分返工责任归因字段。
- 保留 `rework_count` 作为目标节点返工总数。
- 新增生产责任返工、非生产责任返工和未归因返工三个只读统计字段。
- 前端绩效管理页面展示新增归因卡片。

范围：

- `PerformanceStatsResponse` 新增 `responsible_rework_count`、`non_worker_responsibility_rework_count`、`unclassified_rework_count`。
- `WorkflowExecutionService#getPerformance` 基于 `rework_record.responsibility_type` 统计 `WORKER`、`DOCTOR/CS/SYSTEM` 和 `NULL` 三类。
- 新增 `CheckWorklogPerformanceTests#performanceSeparatesReworkResponsibilityAttribution`，覆盖同一 worker 目标节点下 WORKER 与 DOCTOR 责任返工的拆分。
- 前端绩效卡片展示“生产责任返工 / 非生产责任返工 / 未归因返工”。
- OpenAPI、acceptance、`package.json` 和静态检查脚本同步。

非目标：

- 不新增公开 API path，不新增 DB migration。
- 不实现绩效奖金公式、周期筛选、绩效明细导出、申诉流程或标准工时配置。
- 不改变返工责任字典后台维护方式。
- 不把 Task 8 标为完成。

验收标准：

- 已关闭且责任类型为 `WORKER` 的返工计入 `responsible_rework_count`。
- 已关闭且责任类型为 `DOCTOR/CS/SYSTEM` 的返工计入 `non_worker_responsibility_rework_count`。
- 未关闭或未设置责任类型的返工计入 `unclassified_rework_count`。
- `rework_count` 继续返回同一目标节点的返工总数。
- WORKER 本人范围与 ADMIN 指定员工范围沿用既有权限规则。

建议验证命令：

```bash
npm run check:task9d21
npm run acceptance
npm run check:openapi
npm run build:frontend
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#performanceSeparatesReworkResponsibilityAttribution test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server test
git diff --check
```

完成记录：

- TDD 红灯先确认 `/performance` 缺少 `responsible_rework_count`。
- 后端响应和查询已补三类责任归因统计。
- 前端绩效页面新增三张归因卡片。
- OpenAPI `PerformanceStats` schema 已同步新增字段。
- 新增 `scripts/check-task-9d21-performance-attribution.mjs`、`npm run check:task9d21`，并纳入 `acceptance.json`。

验收结果：

- `CheckWorklogPerformanceTests#performanceSeparatesReworkResponsibilityAttribution`：PASS。
- `CheckWorklogPerformanceTests`：PASS。
- `platform-server` 后端测试：PASS。
- `npm run check:task9d21`、`npm run acceptance`、`npm run check:openapi`、`npm run build:frontend`、`git diff --check`：PASS。

剩余风险：

- 仍缺绩效奖金/扣罚公式、周期筛选、管理端明细、申诉闭环和标准工时配置。
- 返工责任字典仍是后端固定字典，未做后台维护。
- Task 8 总体仍保持 `NOT READY`。

## 任务 9D.20：复杂返工影响范围第一增量

状态：completed-first-increment。

来源：

- 9D.17 到 9D.19 已完成返工关闭、字典和通知，但出检失败返到前道节点时，后续已完成节点仍停留在 `COMPLETED`，不能表达需要重新执行的影响范围。
- Task 8 readiness 仍把复杂返工影响范围列为完整返工闭环缺口之一。

目标：

- 出检失败指定返工到前道节点时，后端基于订单实例边表计算返工目标的后续节点影响范围。
- 返工目标节点仍进入 `READY`。
- 已经处于 `READY` 或 `COMPLETED` 的后续受影响节点重置为 `PENDING`，等待目标节点返工完成后由既有 DAG 激活规则重新进入 `READY`。
- 保留历史 `check_record`、`work_log` 和 `rework_record`，不删除、不覆盖。

范围：

- `WorkflowExecutionService#createRework` 新增 `resetImpactedDownstreamNodes`。
- 使用 `order_process_edge` 的递归 CTE 查找同一实例内从返工目标可达的后续节点。
- 新增 `CheckWorklogPerformanceTests#failedOutCheckResetsTargetAndCompletedDownstreamNodesForReworkImpact` 两节点链回归。
- 新增 `scripts/check-task-9d20-rework-impact.mjs`、`npm run check:task9d20`，并纳入 `acceptance.json`。

非目标：

- 不新增公开 API 或前端入口；OpenAPI 不变。
- 不处理正在 `IN_PROGRESS` 的后续节点自动终止、暂停工时或人工冲突确认。
- 不做返工影响范围审计表、可视化、绩效明细归因或完整返工处理台。
- 不调整责任字典后台维护、终检专用角色或生产通知网关。

验收标准：

- 两节点链路中，后道节点 `OUT/FAIL` 并返到前道节点后，前道节点为 `READY`。
- 同一实例内从前道可达且已经完成的后道节点重置为 `PENDING`。
- 前道返工重新完成后，后道节点通过既有 DAG 激活规则重新进入 `READY`。
- 历史检查、工时和返工记录不删除。

建议验证命令：

```bash
npm run check:task9d20
npm run acceptance
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#failedOutCheckResetsTargetAndCompletedDownstreamNodesForReworkImpact test
./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test
git diff --check
```

完成记录：

- `createRework` 在写入返工记录后，会调用 `resetImpactedDownstreamNodes`。
- `resetImpactedDownstreamNodes` 使用 `WITH RECURSIVE impacted_nodes` 递归查找返工目标后续节点，并把 `READY/COMPLETED` 的后续节点重置为 `PENDING`。
- 目标节点仍单独置为 `READY`，并清空其本轮 `started_at/completed_at`。
- 本轮不新增 DB migration，不改变既有响应 schema。

验收结果：

- TDD 红灯：`CheckWorklogPerformanceTests#failedOutCheckResetsTargetAndCompletedDownstreamNodesForReworkImpact` 首次失败于后道节点仍为 `COMPLETED`，确认返工影响范围缺失。
- 精准后端回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests#failedOutCheckResetsTargetAndCompletedDownstreamNodesForReworkImpact test`：PASS，1 test / 0 failures / 0 errors。
- Check/Worklog 模块回归：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test`：PASS，10 tests / 0 failures / 0 errors。

未完成原因：

- 当前只处理 `READY/COMPLETED` 后续节点的状态重置，不处理正在执行的后续节点人工冲突确认。
- 当前没有影响范围审计表或前端可视化。
- 绩效仍未按返工影响范围做明细归因。
- Task 8 总体仍保持 `NOT READY`。

## 任务 0：接口契约与项目基线

状态：已完成。

目标：

- 修复 OpenAPI YAML，使其能被 Swagger / SDK 工具解析。
- 建立稳定的接口契约来源。
- 明确后续前后端联调按该契约执行。

范围：

- 修复 `duration_efficiency` 缺空格问题。
- 修复 `standard_duration` 同类缺空格问题。
- 合并重复的 `/form-configs` path 定义。
- 检查 56 个接口是否按模块保留。
- 把修复版 API 放入仓库稳定路径：`docs/api/openapi.yaml`。

验收结果：

- OpenAPI 文件可被解析器读取。已通过。
- `/form-configs` 同时包含 GET 和 POST。已通过。
- 接口模块仍覆盖 Auth、User、Clinic、OrderForm、File、Order、Workflow、Check、WorkLog、Performance、Message、DesignDraft、Bill、AI、Notification。已通过。

验证命令：

```bash
npm run check:openapi
```

完成记录：

- 稳定契约文件：`docs/api/openapi.yaml`。
- 任务 0 解析结果：45 个 path，56 个 operation；任务 8B 二次冻结后更新为 49 个 path，60 个 operation；任务 9B.6 后为 50 个 path，61 个 operation；任务 9C.2 后为 54 个 path，65 个 operation；任务 9D.10 后当前契约为 61 个 path，72 个 operation。
- `/form-configs` 已合并为单一 path，并同时保留 `get` 与 `post`。
- Redocly lint warning 已在任务 8B 清零；`npm run check:openapi` 现在同时校验 operationId、统一错误响应、Swagger validate 和 Redocly lint。

## 任务 0.1：TRD V1.1 对齐与开发计划冻结

状态：已完成。

目标：

- 读取并吸收 TRD V1.1 深度研究优化版。
- 将开发计划从旧任务 1-5 重排为可执行的 M1-M6 任务链。
- 明确默认执行口径，减少不必要阻塞。

验收结果：

- 文档明确采用 TRD V1.1 作为当前开发计划修订依据。
- 旧的“文件上传方案未确认”不再阻塞任务 4，改为默认 Uppy + MinIO 预签名/Multipart。
- 任务拆分覆盖模块化单体、轻量 DAG、状态投影、医生端脱敏、文件鉴权、AI 工具白名单、通知先落库、专项测试矩阵。
- 待确认问题只保留客户/PM 真正需要拍板的业务细节。

## 任务 1：项目骨架初始化

状态：已完成 HTTP/API 烟测。

详细任务文件：`tasks/TASK-002-project-skeleton-initialization.md`。

目标：

- 初始化模块化单体后端和 Vue3 前端。
- 建立本地开发命令、环境变量模板、Docker Compose 基础服务。

范围：

- 后端 Spring Boot / RuoYi-Vue-Pro 基线。
- 前端 Vue3 + Element Plus 基线。
- MySQL、Redis、MinIO 本地服务。
- `.env.example`，不包含真实密钥。
- 基础登录和角色可运行。
- 后端模块目录按 V1.1 划分：system-auth、clinic-user、order-form、order-status、workflow-definition、workflow-runtime、check-rework、worklog-performance、file-center、message-design、bill-logistics、ai-gateway、notification-ws。

非目标：

- 不做业务模块。
- 不接真实 DeepSeek Key。

验收标准：

- 本地能启动前后端。
- 能登录至少 ADMIN 测试账号。
- MySQL、Redis、MinIO 均可连通。
- README 更新真实运行命令。

当前环境风险：

- 本机缺少 Java Runtime 和 Maven/Gradle。若不先安装 JDK/Maven，则只能创建后端文件结构，不能本机编译运行后端。
- Docker CLI 和 Colima 可用，但当前 Docker daemon 未运行。如选择容器化后端构建，还需在任务 1 开始时启动 Colima 或切换到可用 Docker context。

完成记录：

- 已选择并执行路线 A：本机 JDK 21 + Maven。
- 已安装 Homebrew `openjdk@21` 和 `maven`。
- 已新增后端 Maven 多模块骨架：`backend/`。
- 已新增前端 Vue3 + Element Plus 骨架：`frontend/`。
- 已新增 MySQL、Redis、MinIO 的 `compose.yaml`。
- 已新增 `.env.example`、根目录 `package.json`、`pnpm-workspace.yaml`、`scripts/with-jdk21.sh`、`scripts/check-toolchain.sh`。

验收结果：

- `npm run check:toolchain`：通过。
- `npm run test:backend`：通过，16 个 Maven 模块成功。
- `npm run install:frontend`：通过。
- `npm run build:frontend`：通过。
- `npm run compose:config`：通过。
- `npm run compose:up`：通过，MySQL、Redis、MinIO 均 healthy。
- 后端 health、ADMIN login、`/auth/me` API：通过。
- 前端 dev server 首页 HTTP 加载：通过。
- Vite `/api` 代理 health/login：通过。

机器验收：

- `acceptance.json` 已新增 `TASK-002` 文件存在和关键章节检查。

剩余限制：

- 当前 ADMIN 登录为骨架烟测，不是正式 RuoYi-Vue-Pro 权限体系。
- 后端已在任务 2 接入 MySQL/Flyway；Redis、MinIO 尚未接入业务模块。
- 浏览器点击级 smoke 未自动化执行；当前完成的是构建、HTML 加载、API 和 Vite 代理级验收。

## 任务 2：数据库模型与 9 条工序链初始化

状态：已完成数据库和 HTTP 烟测。

目标：

- 建立 TRD V1.1 核心业务表与索引。
- 初始化 9 条预定义工序链。

范围：

- 用户权限复用 RuoYi；新增或扩展 clinic、customer_preference、orders、order_status_history、order_external_projection、form_field_config。
- 工艺流定义：`workflow_chain`、`workflow_node`、`workflow_edge`。
- 工序实例：`order_process_instance`、`order_process_node`、`order_process_edge`。
- 检查返工：`check_record`、`rework_record`。
- 工时绩效：`work_log`，`work_log_pause_segment` 作为建议项，排期紧可先累计 pause_duration。
- 文件、消息、设计稿、账单物流、AI、通知相关表：`file_resource`、`file_access_audit`、`order_message`、`message_review_log`、`design_draft`、`order_bill`、`order_logistics`、`ai_audit_log`、`notification_event`、`user_notification`。
- 9 条工艺链的 chain/node/edge 种子数据。
- Flyway SQL 迁移方案。

验收标准：

- 9 条工序链可查询。
- 每条链有节点和边。
- 支持分支、并联、可选节点的数据表达。
- 订单实例可引用 `chain_version`。
- 表结构包含状态投影、实例边表、返工、文件审计、AI 审计、通知事实来源。

完成记录：

- 已选择并执行 Flyway SQL，迁移文件位于 `backend/platform-server/src/main/resources/db/migration/`。
- `V1__create_core_schema.sql` 已创建 TRD V1.1 核心业务表、工艺定义/实例表、返工、工时、文件审计、AI 审计、通知事实来源等结构。
- `V2__seed_workflow_chains.sql` 已按 `.local-context/生产流程.docx` 初始化 9 条工序链、节点和边。
- 已实现最小只读接口：`GET /workflow-chains`、`GET /workflow-chains/{chainId}/nodes`。
- `standard_duration` 暂无真实标准工时，已按计划保留为空。

验收结果：

- `docker compose up -d mysql redis minio`：通过，基础服务运行中。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml test`：通过，16 个 Maven 模块成功，Spring Boot 上下文加载并执行 Flyway v1/v2。
- SQL 验收：`workflow_chain` 为 9 条；每条链均有节点和边；查询到 `intake`、`implant_abutment`、`veneer_route` 分支；可选节点为 10 个；重复工序名均有唯一 `node_code`。
- HTTP 验收：`GET /workflow-chains` 返回 9 条；`GET /workflow-chains/1/nodes` 返回常规冠修复 30 个节点，并按 `step_order` 排序。

剩余限制：

- 任务 2 不实现订单生产审核后的工序实例化，不实现派工、转派、工时、入检/出检、返工。
- 源生产流程存在孤立重复箭头和局部排版不连续，本轮按节点顺序标准化为顺序边；如客户提供修订版，应新增链版本迁移。
- Flyway 对 MySQL 8.4 有兼容性 warning，但本轮迁移和测试已在本机 MySQL 8.4 通过。

## 任务 3：订单状态投影与医生端脱敏基础

状态：已完成状态投影和脱敏烟测。

目标：

- 实现 `internal_status` / `external_status` 状态模型。
- 建立 `OrderStatusProjector`、医生端外部投影和安全读模型。

范围：

- `OrderStatusService`。
- `OrderStatusProjector`。
- `order_status_history`。
- `order_external_projection`。
- `OrderDoctorVO`。
- `OrderInternalDTO`。
- `DoctorOrderAssistantReadModel`。
- 医生端接口、医生端 WebSocket、医生端文件访问、AI-3 的统一脱敏测试。

验收标准：

- 状态变更统一走服务。
- `external_status` 不允许前端传值，也不允许业务模块随意写。
- 内部状态变化后能刷新外部投影。
- 医生端响应不含内部字段。
- 跨诊所访问返回 403 或空数据。
- AI-3 只能读取医生端安全读模型。

完成记录：

- 已新增 `InternalOrderStatus` / `ExternalOrderStatus` 枚举。
- 已新增 `OrderStatusService` 和 `OrderStatusProjector`，状态变更会写 `order_status_history` 并刷新 `order_external_projection`。
- 已新增 Flyway `V3__order_status_projection_foundation.sql`，补齐 `orders.version`、`cs_user_id`、`production_note`、`reject_reason`、状态索引，并把公开状态默认值调整为 `PENDING_REVIEW`。
- 已新增 `DoctorOrderVO`、`OrderInternalDTO`、`DoctorOrderAssistantReadModel`。
- 已实现最小接口：`GET /orders/{orderId}`、`POST /orders/{orderId}/confirm-receipt`、`POST /ai/order-query`、医生端访问 `GET /orders/{orderId}/process-instance` 返回 403。

验收结果：

- `npm run compose:up && scripts/with-jdk21.sh mvn -f backend/pom.xml test`：通过，5 个测试通过，Flyway 校验 3 个迁移。
- SQL 验收：`flyway_schema_history` v1/v2/v3 均成功；`orders` 与 `order_external_projection` 中可查到 `PRODUCING` / `QC` 等投影结果。
- HTTP 验收：医生端 `GET /orders/{orderId}` 只返回 `external_status` 等公开字段，不含 `internal_status`、`production_note`、`cs_user_id`；管理员详情包含内部字段；医生访问 `process-instance` 返回 403；AI-3 回答只含外部状态。

剩余限制：

- 本轮不实现正式 RuoYi-Vue-Pro RBAC/DataScope；`X-Bootstrap-*` 头只用于本地烟测。
- 本轮不实现订单列表、下单、客服审核、生产审核、工序实例化、设计稿、账单物流完整业务。
- AI-3 当前是安全占位回答，后续接入真实模型时必须继续只读 `DoctorOrderAssistantReadModel`。

## 任务 4：文件上传与访问权限

状态：已完成文件上传与访问权限烟测。

目标：

- 支持医生下单附件、消息附件、设计稿、账单文件。

范围：

- MinIO 私有桶。
- Uppy 上传。
- 后端生成预签名上传参数；大文件按阈值启用或预留 S3 Multipart。
- 上传完成后调用 complete，后端 `statObject` 校验对象存在、大小、类型、etag。
- `file_resource.upload_status`。
- 预览/下载签名 URL。
- 文件访问策略。
- 文件审计日志。

待确认：

- Multipart 阈值、文件大小、类型、数量限制。

验收标准：

- 文件上传、预览、下载均写审计。
- 医生不能访问其他诊所文件，不能访问内部入检/出检附件。
- 前端不能直接拿永久 object_key。

完成记录：

- 已在 `platform-server` 接入 MinIO Java SDK。
- 已新增 `V4__file_upload_access_foundation.sql`，为 `file_resource` 增加 `upload_status`，并补上传状态/归属查询索引。
- 已新增 `POST /files/upload-token`，返回 `file_id`、预签名 PUT URL、过期秒数，不返回永久 `object_key`。
- 已新增 `POST /files/{fileId}/complete`，通过 MinIO `statObject` 校验对象存在、大小、content type 和 etag，并写入 `COMPLETED`。
- 已新增 `GET /files/{fileId}/preview-url`、`GET /files/{fileId}/download-url`，返回短时效签名 URL。
- 已实现医生端文件访问边界：仅允许本人/本诊所访问 `DOCTOR`、`DOCTOR_CS`、`ALL` 可见文件，拒绝 `INTERNAL` 和跨诊所/跨医生访问。
- 已实现 `file_access_audit` 写入：上传 token、complete、preview、download、拒绝访问均有记录。

验收结果：

- TDD 红灯：`FileAccessTests` 首次运行失败于 `/files/upload-token` 404 和 `upload_status` 列不存在，确认测试覆盖任务缺口。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=FileAccessTests test`：通过，2 个文件访问测试通过。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml test`：通过，16 个 Maven 模块成功，7 个测试通过，Flyway 校验 4 个迁移。
- HTTP/SQL smoke：真实后端启动后，`upload-token -> curl PUT presigned URL -> complete -> preview-url -> download-url` 通过；审计表查到 `UPLOAD_TOKEN`、`COMPLETE`、`PREVIEW`、`DOWNLOAD` 的 `ALLOWED` 记录。
- 拒绝访问 smoke：其他医生/诊所访问同一文件返回 403，并写入 `PREVIEW / DENIED` 审计记录。

剩余限制：

- 本轮不实现前端 Uppy 页面。
- 本轮不实现完整 S3 Multipart 分片创建、分片签名、合并流程；当前为单对象预签名 PUT，并保留阈值配置。
- 文件类型、大小、数量限制仍需 PM/客户最终确认；当前本地默认最大 200MB。
- 正式 RuoYi-Vue-Pro RBAC/DataScope 尚未接入；`X-Bootstrap-*` 头只用于本地烟测。
- `docs/api/openapi.yaml` 后续需要同步 complete、签名 URL 和错误响应契约。

## 任务 5A：Workflow Runtime 与工序节点状态机

状态：已完成 Workflow Runtime 基础烟测。

目标：

- 实现订单工序实例化、任务池、派工转派、DAG 激活、并联汇合和可选节点。

验收标准：

- 并联节点必须全部完成或跳过，汇合节点才进入 READY。
- 条件不满足的可选节点默认不生成；人工跳过才生成 SKIPPED 并记录原因。
- 模板变更不影响历史订单实例。

完成记录：

- 已新增 `POST /orders/{orderId}/production-review`，生产审核通过后按指定 `chain_id` 实例化工序链。
- 已复制定义层节点/边到订单实例快照，保留 `chain_version`，模板后续变更不影响历史实例。
- 已实现 `branch_params` / `intake_branch` 分支过滤，未匹配分支节点默认不生成。
- 已实现节点状态：`PENDING`、`READY`、`IN_PROGRESS`、`COMPLETED`、`SKIPPED`。
- 已实现 DAG 激活：无前置节点初始 READY；并联汇合节点等待全部前置节点完成或跳过。
- 已实现派工、转派、任务池：`process-instance/assign`、`nodes/{nodeInstanceId}/reassign`、`GET /tasks/mine`。
- 已实现节点 start / complete / skip 内部接口，并为可选节点跳过记录 `skipped_at`、`skip_reason`。
- 已把 `GET /orders/{orderId}/process-instance` 从内部 501 占位改为真实内部查询，同时医生端仍返回 403。

验收结果：

- TDD 红灯：`WorkflowRuntimeTests` 首次运行失败于 `/orders/{orderId}/production-review` 404，确认测试覆盖任务缺口。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=WorkflowRuntimeTests test`：通过，2 个 Workflow Runtime 测试通过。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml test`：通过，16 个 Maven 模块成功，9 个测试通过，Flyway 校验 5 个迁移。
- HTTP/SQL smoke：真实后端启动后，`production-review -> process-instance -> assign -> start -> complete -> skip -> tasks/mine` 通过；汇合节点在一个前置完成且另一个可选节点未跳过时保持 `PENDING`，跳过后进入 `READY`。

剩余限制：

- 本轮不实现入检/出检、返工、工时、暂停、绩效统计。
- 本轮不实现前端生产看板、任务池页面和 WebSocket 通知。
- 本轮仍使用 `X-Bootstrap-*` 本地烟测角色/用户头，正式 RBAC/DataScope 待接入。
- `docs/api/openapi.yaml` 后续需要补齐节点 start/complete/skip 接口和 4xx 响应。

## 任务 5B：入检 / 出检 / 返工 / 工时绩效

状态：已完成后端最小执行链路和 HTTP/SQL 烟测。

目标：

- 实现生产执行闭环、返工影响范围、服务端工时与绩效统计。

验收标准：

- 未入检不能开工；未完工不能出检。
- 出检不通过生成返工记录，历史不删除。
- 返工产生新的 work_log，不能覆盖原工时。
- 工时由服务端计算，暂停不计入有效工时。
- 重复点击开始/暂停/继续/完成不会重复记录。
- WORKER 只能看本人绩效，ADMIN 看全量。

完成记录：

- 已新增 `workflow/execution` 后端最小执行模块。
- 已实现 `POST /check-records`：入检/出检记录写入 `check_record`，`check_type=1` 映射入检，`check_type=2` 映射出检。
- 已在节点开工前加入入检门禁：`need_in_check=1` 的节点必须有 `IN/PASS` 检查记录。
- 已实现出检时序约束：节点未 `COMPLETED` 时提交出检返回 409。
- 已实现出检失败返工：写 `rework_record`，返工目标节点重新置为 `READY`，历史检查和工时记录不删除。
- 已实现 `POST /work-logs/start`、`/work-logs/{id}/pause`、`/resume`、`/finish`，工时由服务端时间计算，暂停段通过 `work_log_pause_segment` 扣除。
- 已实现 `GET /performance`：WORKER 强制只看本人绩效，ADMIN 可按 `user_id` 查询指定员工。
- 已把任务 5A 测试链的入/出检需求显式设为 0，避免任务 5B 门禁反向污染 5A 的 DAG 测试。

验收结果：

- TDD 红灯：`CheckWorklogPerformanceTests` 首次运行失败于 `/check-records` 404 和未入检仍可开工，确认测试覆盖任务缺口。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test`：通过，2 个测试覆盖入检门禁、出检时序、返工、暂停扣时、重复返工工时和绩效范围。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml test`：通过，16 个 Maven 模块成功，11 个测试通过，Flyway 校验 5 个迁移。
- HTTP/SQL smoke：真实后端启动后，`production-review -> assign -> start(409 before in-check) -> in-check -> start -> work-log start/pause/resume/finish -> complete -> out-check fail -> rework -> restart -> second work-log -> performance` 通过；本轮 smoke 记录有效工时 480 秒，返工后生成第二条 `work_log`。

剩余限制：

- 本轮不实现前端入检/出检、返工、工时、绩效页面。
- 本轮不实现完整责任分类、返工原因字典、返工影响范围的复杂 DAG 回滚策略；当前按指定目标节点重新置为 `READY`。
- 本轮不实现正式 RuoYi-Vue-Pro RBAC/DataScope；`X-Bootstrap-*` 头仍仅用于本地烟测。
- `standard_duration` 仍暂无真实客户标准，绩效中的效率类指标只按已有字段计算，不补造标准工时。
- `docs/api/openapi.yaml` 后续需要同步任务 5A/5B 新增运行时接口的 4xx 响应和 DTO 细节。

## 任务 6：消息、设计稿、账单物流与通知

状态：已完成后端最小协同链路和 HTTP/SQL 烟测。

目标：

- 跑通消息、设计稿、账单物流和 WebSocket 通知主链路。

验收标准：

- 医生只收到公开事件。
- 内部任务、返工、工时、绩效事件不推送给医生。
- 账单物流状态能更新医生端外部投影。

完成记录：

- 已新增 `collaboration` 后端最小模块，覆盖消息、设计稿、账单、物流和通知事实落库。
- 已实现 `GET/POST /orders/{orderId}/messages`，WORKER 消息默认 `PENDING_REVIEW`，医生端审核前不可见。
- 已实现 `POST /messages/{msgId}/review` 和 `GET /messages/pending-review`，客服审核通过或编辑通过后医生端可见公开消息。
- 已实现 `GET/POST /orders/{orderId}/design-drafts`、客服审核和医生确认/驳回接口；医生端只看 `PENDING_DOCTOR_CONFIRM`、`DOCTOR_CONFIRMED`、`DOCTOR_REJECTED` 状态的设计稿。
- 已实现 `GET/POST /orders/{orderId}/bill` 和 `GET/POST /orders/{orderId}/logistics`；物流发货后通过 `OrderStatusService` 更新订单外部状态为 `SHIPPED`。
- 已实现通知事实写入：公开消息、设计稿、账单上传、订单发货均写 `notification_event`，指定用户写 `user_notification` 作为未读补偿。
- 已保持医生端脱敏边界：医生端接口不返回内部状态、内部生产备注、内部任务、返工、工时或绩效。

验收结果：

- TDD 红灯：`MessageDesignBillNotificationTests` 首次运行失败于 `/orders/{orderId}/messages`、`/design-drafts`、`/bill` 404，确认测试覆盖任务缺口。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=MessageDesignBillNotificationTests test`：通过，3 个测试覆盖消息审核、设计稿审核/医生确认、账单物流和医生端通知边界。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml test`：通过，16 个 Maven 模块成功，14 个测试通过，Flyway 校验 5 个迁移。
- HTTP/SQL smoke：真实后端启动后，`worker message -> CS review -> doctor messages -> design upload -> CS approve -> doctor confirm -> bill upload -> logistics ship -> doctor order detail` 通过；本轮 smoke 写入 7 条通知事实事件，医生端 4 条未读补偿，订单外部状态为 `SHIPPED`。

剩余限制：

- 本轮不实现真实 WebSocket 长连接在线推送；通知事实来源和未读补偿已落库，在线推送留给后续通知模块细化。
- 本轮不实现前端消息中心、设计稿确认、账单物流页面。
- 本轮设计稿表仍沿用当前 `design_draft.file_id` 单文件结构；OpenAPI 的 `file_ids` 暂取首个文件，完整多文件版本需后续迁移扩展。
- 本轮不实现消息附件 URL 拼装、设计稿文件预览 URL 聚合和账单预览 URL 聚合；文件签名 URL 能力已由任务 4 提供。
- 本轮不实现正式 RuoYi-Vue-Pro RBAC/DataScope；`X-Bootstrap-*` 头仍仅用于本地烟测。

## 任务 7：AI Gateway 与 5 个 AI 智能体

状态：已完成后端最小 AI Gateway 和 HTTP/SQL 烟测。

目标：

- 实现 AI 上下文构造、工具白名单、模型调用、输出防护和审计。

验收标准：

- AI-3 只能使用 `DoctorOrderAssistantReadModel`。
- AI-3 被询问内部工序、员工、返工、工时、绩效时，只能拒绝或回答公开状态。
- 所有 AI 调用写 `ai_audit_log`。
- AI 输出只做草稿或查询结果，不自动审核、自动驳回、自动发送、自动下发正式指令。

完成记录：

- 已新增 `ai` 后端最小模块，覆盖 OpenAPI 既有 5 个 AI 端点：`POST /ai/translate`、`POST /ai/cs-query`、`POST /ai/order-query`、`POST /ai/check-missing`、`POST /ai/production-note`。
- 已把 AI-1 / AI-2 / AI-4 / AI-5 接入统一 `AiGatewayService`，AI-3 的既有 `/ai/order-query` 改为走同一个 service。
- 已实现角色白名单：AI-1/AI-2 为 CS/ADMIN，AI-3 为 DOCTOR，AI-4 为 DOCTOR/CS/ADMIN，AI-5 为 CS/WORKER/ADMIN。
- 已实现固定上下文类型和审计落库，成功回答与 AI-3 安全拒绝均写 `ai_audit_log`，`model_name=deterministic-placeholder`。
- 已实现 AI-3 内部问题识别：医生询问内部工序、员工、入检/出检、返工、工时、绩效、责任等信息时，只返回安全拒绝和公开状态/账单/物流/公开消息。
- 已实现 AI-4 基于 `form_field_config.required_flag` 和订单 `form_data` 的资料缺失检查，医生端访问仍校验本人/本诊所范围。
- 已保持 AI 输出只做草稿或查询结果，不自动写订单字段、不自动发送消息、不自动驳回或下发生产指令。

验收结果：

- TDD 红灯：`AiGatewayTests` 首次运行失败于 `/ai/translate`、`/ai/check-missing` 404，以及 AI-3 内部问题未安全拒绝，确认测试覆盖任务缺口。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AiGatewayTests test`：通过，3 个测试覆盖 5 个 AI 端点、AI-3 安全拒绝、AI-4 缺失项检查、医生跨诊所拒绝和 `ai_audit_log`。
- `scripts/with-jdk21.sh mvn -f backend/pom.xml test`：通过，16 个 Maven 模块成功，17 个测试通过，Flyway 校验 5 个迁移。
- HTTP/SQL smoke：真实后端启动后，`translate -> cs-query -> doctor order-query safe-refusal -> check-missing -> production-note` 通过；本轮 smoke 写入 5 条 AI 审计记录，其中 1 条 `SAFE_REFUSAL`，1 条 `DOCTOR_ORDER_ASSISTANT_READ_MODEL` 上下文。
- `npm run acceptance`：通过，`acceptance.json valid`。
- `git diff --check`：通过。

剩余限制：

- 本轮不接入真实 DeepSeek API、流式输出、模型重试、限流、成本统计和提示词版本管理。
- AI-2 当前只返回最小内部订单摘要，尚未聚合完整工序实例、消息、文件、质检、返工、工时等客服知识上下文。
- AI-5 客户模板未确认，当前只生成通用生产备注草稿，不写入订单字段。
- 本轮仍使用 `X-Bootstrap-*` 本地烟测角色/数据范围，正式 RBAC/DataScope 待接入。
- `docs/api/openapi.yaml` 后续需要补齐 Task 7 的 4xx 响应、operationId、审计语义和真实模型错误响应。

## 任务 8：专项验收矩阵与上线准备

状态：进行中；8A readiness audit、8B OpenAPI 二次契约、9C.2 通知未读/已读、9C.3 通知实时前端/Redis 广播第一增量和 9D.1 医生订单工作台第一增量已落地，正式上线缺口未完成。

目标：

- 按 TRD V1.1 测试矩阵完成回归、部署和交付准备。

验收标准：

- PRD 12 步主链路通过。
- 所有专项测试通过。
- 部署正式环境前完成操作手册和回归记录。

## 任务 8A：专项验收矩阵与上线缺口冻结

状态：`in-progress/readiness-audit-complete`。

目标：

- 不补业务功能，先客观冻结 PRD 12 步主链路、TRD 专项测试、设计稿补充验收、权限/脱敏/文件/AI/状态机红线的当前状态。
- 给后续上线冲刺提供明确入口：哪些已通过，哪些只是后端最小链路，哪些被客户/PM 确认阻塞，哪些尚未实现。

完成记录：

- 已新增 `docs/acceptance/task-8-acceptance-matrix.md`，按 `PASS / PARTIAL / BLOCKED / NOT_STARTED` 标注当前验收状态。
- 已新增 `docs/acceptance/task-8-regression-record.md`，记录本轮实际检查、HTTP/SQL smoke 和已有自动化测试覆盖。
- 已新增 `docs/deployment/readiness-checklist.md`，列出正式上线前必须补齐的硬门禁。
- 已增强 `acceptance.json`，新增 Task 8A 三份文档存在和关键标题检查；未削弱既有 RepoFrame 检查。

验收结果：

- `npm run acceptance`：PASS。
- `npm run check:toolchain`：PASS。
- `npm run compose:config`：PASS。
- `npm run check:openapi`：PASS，OpenAPI 可解析，`/form-configs` GET/POST 保留。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留 VueUse PURE comment 与大 chunk warning。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml test`：PASS_WITH_WARNINGS，16 个模块成功，`platform-server` 17 tests 通过；保留 MySQL 8.4 / Flyway 支持 warning。
- HTTP/SQL smoke：PASS_WITH_NOTICE。Health、ADMIN login、9 条预定义链存在、常规冠节点查询、医生端脱敏、跨医生 403、AI-3 安全拒绝与 `ai_audit_log` 均通过；本地历史测试数据导致 `/workflow-chains` 总数为 41，不代表种子数据错误。

剩余限制：

- 任务 8A 不是正式上线完成；当前上线结论为 `NOT READY`。
- 后续至少需要拆出 OpenAPI 二次契约、正式 RBAC/DataScope、WebSocket、前端业务页面、真实 DeepSeek/模型适配、Multipart/大文件验收、部署手册与操作手册等任务。
- `X-Bootstrap-*` 仍只是本地烟测机制，不能作为生产鉴权。

## 任务 8B：OpenAPI 二次契约与错误响应冻结

状态：已完成。

目标：

- 将任务 4-7 新增接口、统一 4xx、operationId、关键 DTO/schema 和 AI/文件/Workflow runtime 错误响应同步到 `docs/api/openapi.yaml`。

完成记录：

- 已将 `docs/api/openapi.yaml` 从 45 个 path / 56 个 operation 更新为 49 个 path / 60 个 operation；任务 9B.6 后为 50 个 path / 61 个 operation；任务 9C.2 后为 54 个 path / 65 个 operation；任务 9D.10 后当前为 61 个 path / 72 个 operation。
- 已补齐缺失接口：`POST /files/{fileId}/complete`、`POST /process-instance/nodes/{nodeInstanceId}/start`、`POST /process-instance/nodes/{nodeInstanceId}/complete`、`POST /process-instance/nodes/{nodeInstanceId}/skip`。
- 已为全部 72 个 operation 补唯一 `operationId`。
- 已为全部 operation 补统一 `400 / 401 / 403 / 404 / 409 / 503 / default` 错误响应引用。
- 已补齐任务 4-7 当前实现相关 schema：文件上传/签名、生产审核、工序实例、节点动作、入检/出检、工时、消息、设计稿、账单物流、AI 请求响应。
- 已新增 `scripts/check-openapi-contract.rb`，并把 `npm run check:openapi` 升级为自定义契约检查 + Swagger validate + Redocly lint。

验收结果：

- `npm run check:openapi`：PASS，输出 `openapi contract ok`、`paths=60`、`operations=71`、`operationIds=71`；Swagger validate 通过；Redocly lint 通过且无 warning。

剩余限制：

- 本任务只冻结当前后端基线契约，不代表产品级上线完成。
- 后续新增正式 RBAC/DataScope、WebSocket、前端页面、真实 DeepSeek、大文件断点续传等接口时，仍需同步更新 OpenAPI 并保持 `npm run check:openapi` 通过。

## 任务 9：正式 RuoYi RBAC/DataScope 接入

状态：进行中；9A Bearer 身份基线、9B.1 后端权限守卫、9B.2 数据库化 RBAC/DataScope 基础、9B.3 权限注解/统一拦截器、9B.4 DataScope SQL 过滤第一增量、9B.5 文件/协同/AI DataScope 扩展和 9B.6 菜单/部门/岗位/前端权限路由第一增量已落地，完整 RuoYi RBAC/DataScope 未完成。

目标：

- 用正式登录态、角色权限和数据范围替换 `X-Bootstrap-*` 本地烟测头，并重跑医生端脱敏、文件越权、AI 越权和 WORKER 绩效范围专项测试。

### 任务 9A：服务端签发 Bearer 身份基线

状态：已完成。

范围：

- 新增服务端签发 HMAC Bearer token，不再返回固定静态 token。
- 请求携带 `Authorization: Bearer ...` 时，由服务端校验签名、过期时间、角色、用户和诊所范围，并写入请求级身份上下文。
- 业务层 `BootstrapIdentity.fromHeaders` 优先使用 Bearer token 身份。
- `X-Bootstrap-*` 暂时保留为本地烟测兼容路径，并受 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS` 开关控制。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests test`：PASS，3 个测试通过。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml test`：PASS，16 个模块成功，`platform-server` 26 tests 通过。
- `npm run check:openapi`：PASS，登录响应 schema 已同步为当前 `accessToken / username / roles / expiresAt`。

剩余限制：

- 9A 不是完整 RuoYi RBAC；尚未接入 RuoYi 账号表、菜单权限、角色权限、权限注解和完整 DataScope。
- 业务 controller 仍保留 `X-Bootstrap-*` 兼容参数；正式环境必须关闭 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS`。

### 任务 9B：正式 RuoYi RBAC/DataScope 接入

状态：进行中；9B.1、9B.2、9B.3、9B.4、9B.5、9B.6 第一增量已完成，完整 RuoYi 接入未完成。

目标：

- 接入正式 RuoYi 账号、角色、权限和 DataScope。
- 逐步移除业务接口对 `X-Bootstrap-*` 的依赖。
- 用 Bearer token 重跑医生端脱敏、文件越权、AI 越权和 WORKER 绩效范围专项测试。

#### 任务 9B.1：后端权限/DataScope 守卫第一增量

状态：已完成。

范围：

- 新增 `AccessControlService`，集中后端角色权限和数据范围守卫。
- 把医生订单范围、AI 角色白名单、文件医生范围、Workflow Runtime、Check/WorkLog/Performance 的高风险判断迁入统一守卫。
- 修复派工/转派接口未读取当前身份的问题；派工、转派、跳过可选节点仅允许 CS/ADMIN。
- `GET /check-records/{nodeInstanceId}` 改为内部数据接口，医生端 Bearer token 返回 403。
- `GET /performance` 收紧为 WORKER 只能看本人，ADMIN 可按 `user_id` 查询；CS/医生返回 403。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests,WorkflowRuntimeTests,CheckWorklogPerformanceTests test`：PASS，10 个测试通过。
- `WorkflowRuntimeTests` 新增 WORKER Bearer token 不能派工/跳过节点回归。
- `CheckWorklogPerformanceTests` 新增 DOCTOR Bearer token 不能读入检/出检记录、CS Bearer token 不能查绩效回归。

未完成原因：

- 9B.1 仍不是完整 RuoYi RBAC/DataScope；没有接入 RuoYi 账号表、菜单权限、权限注解、正式 DataScope 或 Spring Security。
- controller 仍保留 `X-Bootstrap-*` 本地兼容参数；正式环境仍必须设置 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=false`。
- 文件越权、AI 越权和更多业务接口还需要继续用 Bearer token/正式账号体系做更完整回归。

#### 任务 9B.2：数据库化账号/角色/权限/DataScope 基础

状态：已完成。

范围：

- 新增 Flyway `V6__auth_rbac_datascope_foundation.sql`。
- 建立 `system_user`、`system_role`、`system_permission`、`system_user_role`、`system_role_permission` 过渡表。
- 初始化本地开发账号：`admin/change-me-admin`、`cs/change-me-cs`、`worker/change-me-worker`、`doctor/change-me-doctor`。
- 本地账号密码以 PBKDF2-SHA256 hash 存储，不写明文密码到数据库。
- `/api/auth/login` 改为数据库登录，聚合 roles、permissions、dataScope 后签发 Bearer token。
- `/api/auth/me` 返回 token 中的 `username`、`userId`、`clinicId`、`roles`、`permissions`、`dataScope`。
- `docs/api/openapi.yaml` 的 `LoginResponse` 已同步新增 `userId`、`clinicId`、`permissions`、`dataScope` 字段。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests test`：PASS，6 个测试通过；V6 migration 已应用。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml test`：PASS，16 个模块成功，`platform-server` 26 tests / 0 failures / 0 errors。
- `npm run check:openapi`：PASS，49 paths / 60 operations / 60 operationIds。
- `npm run build:frontend`：PASS，前端登录 smoke 类型已同步。
- HTTP smoke：真实后端启动后，`admin/change-me-admin` 登录成功，`/api/auth/me` 返回 `admin/ADMIN/ALL`，错误密码返回 401。

未完成原因：

- 9B.2 仍不是完整 RuoYi RBAC/DataScope；尚未接入 RuoYi 完整菜单、部门、岗位、数据权限 SQL 拦截和权限注解。
- controller 仍保留 `X-Bootstrap-*` 本地兼容参数；正式环境仍必须设置 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=false`。
- 任务 9B.4 第一增量已在权限注解/统一拦截器基础上补订单和工序实例查询级 DataScope 过滤；后续仍需用数据库账号 Bearer token 重跑文件、AI、消息、设计稿、账单物流等越权矩阵。

#### 任务 9B.3：权限注解与统一拦截器

状态：已完成。

范围：

- 新增 `@RequirePermission` 注解，支持声明权限码和本地兼容角色 fallback。
- 新增 `PermissionInterceptor` 和 `PermissionWebConfiguration`，统一拦截带注解的 Controller 入口。
- 对订单、文件、AI、Workflow Runtime、Check/WorkLog/Performance、消息、设计稿、账单物流等当前业务 Controller 增加权限注解。
- 数据库 Bearer token 优先按 `permissions` 权限码放行；`X-Bootstrap-*` 仅保留本地 smoke 兼容角色 fallback。
- 保留 service 层 `AccessControlService` 作为订单归属、医生诊所范围、WORKER 本人绩效、节点分配等数据范围兜底。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests,PermissionInterceptorTests,WorkflowRuntimeTests,CheckWorklogPerformanceTests,AiGatewayTests test`：PASS，19 tests / 0 failures / 0 errors。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml test`：PASS，16 个模块成功，`platform-server` 29 tests / 0 failures / 0 errors。
- `npm run acceptance`：PASS，`acceptance.json valid`。
- `npm run check:openapi`：PASS，49 paths / 60 operations / 60 operationIds，Swagger validate 和 Redocly lint 通过。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留 VueUse PURE comment 与大 chunk warning。
- `npm run compose:config`：PASS。
- `git diff --check`：PASS。

未完成原因：

- 9B.3 仍不是完整 RuoYi RBAC/DataScope；9B.6 已补菜单/部门/岗位/前端权限路由第一增量，但仍缺完整管理 UI、正式 DataScope SQL 拦截和生产级 Spring Security/JWT。
- `X-Bootstrap-*` 仍保留为本地 smoke 兼容路径；正式环境仍必须设置 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=false`。
- 9B.4 第一增量已补订单和工序实例查询级 DataScope 过滤；后续需要继续用数据库账号 Bearer token 扩展文件、AI、消息、设计稿、账单物流等越权矩阵。

#### 任务 9B.4：统一身份参数与查询级 DataScope 第一增量

状态：已完成第一增量；完整 RuoYi DataScope 未完成。

范围：

- 新增 `BootstrapIdentityArgumentResolver`，业务 Controller 直接接收 `BootstrapIdentity`，不再逐个声明 `X-Bootstrap-*` header。
- `PermissionWebConfiguration` 注册统一身份参数解析器；本地 `X-Bootstrap-*` 兼容只保留在解析器和权限拦截器中。
- `OrderProjectionQueryService` 对订单详情、内部订单详情、AI-3 安全读模型统一加入 SQL DataScope 过滤。
- `WorkflowRuntimeService#getProcessInstance` 对工序实例读取加入 SQL DataScope 过滤。
- DataScope 规则：`ALL` 可读全部；`CLINIC` 限定诊所或医生本人；`SELF` 限定医生本人、客服本人或已分配给当前员工的工序节点。
- 不新增公开 API；OpenAPI 不变。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=PermissionInterceptorTests,BearerIdentityTests,WorkflowRuntimeTests,CheckWorklogPerformanceTests,AiGatewayTests test`：PASS，20 tests / 0 failures / 0 errors。
- `PermissionInterceptorTests` 新增数据库工人 SELF DataScope 回归：未分配节点时读取订单和工序实例返回 403，分配节点后可读取。
- 业务 Controller 源码中不再直接出现 `X-Bootstrap-*` 或 `@RequestHeader` 解析本地身份；仅统一解析器、权限拦截器和 `/api/auth/me` 的 Authorization header 保留 header 读取。

未完成原因：

- 9B.4 第一增量仍不是完整 RuoYi DataScope；9B.6 已补菜单/部门/岗位/前端权限路由第一增量，但仍未实现通用 SQL 拦截器和完整 RuoYi 管理 UI。
- 9B.5 已继续覆盖文件、消息、设计稿、账单物流、AI 内部查询聚合；仍需后续补通用 SQL 拦截器、部门/岗位模型、前端权限路由。
- `X-Bootstrap-*` 仍保留为统一解析器中的本地 smoke 兼容路径；正式环境仍必须设置 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=false`。

#### 任务 9B.5：文件、协同与 AI 查询级 DataScope 扩展

状态：已完成第一增量；完整 RuoYi DataScope 未完成。

范围：

- `FileResourceService` 的上传 token 订单读取、文件 complete、预览、下载加入查询级 DataScope。
- 文件规则：`ALL` 可访问全部；`CLINIC` 只能访问同诊所/医生本人且医生可见文件；`SELF` 只能访问本人上传文件或已分配节点所在订单文件。
- `CollaborationService` 的消息、设计稿、账单物流等订单级操作先执行订单 DataScope，再执行医生可见性、审核状态等业务过滤。
- `AiGatewayService` 的 AI-1/AI-2/AI-4/AI-5 内部订单上下文读取加入订单 DataScope；AI-3 继续只读 `DoctorOrderAssistantReadModel`。
- 不新增公开 API；OpenAPI 不变。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=PermissionInterceptorTests,AiGatewayTests,MessageDesignBillNotificationTests,FileAccessTests test`：PASS，12 tests / 0 failures / 0 errors。
- `PermissionInterceptorTests` 扩展数据库工人 SELF DataScope 回归：未分配节点时读取消息和文件预览返回 403，分配节点后可读取。
- `MessageDesignBillNotificationTests` 和 `AiGatewayTests` 已补充 WORKER 已分配节点的真实业务前提，保持生产协同和 AI-5 生产备注路径可用。

未完成原因：

- 9B.5 仍不是完整 RuoYi DataScope；9B.6 已补菜单/部门/岗位/前端权限路由第一增量，但仍未实现通用 SQL 拦截器和完整 RuoYi 管理 UI。
- `X-Bootstrap-*` 仍保留为统一解析器中的本地 smoke 兼容路径；正式环境仍必须设置 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=false`。
- 仍需前端页面、WebSocket、真实 DeepSeek、部署/运维手册等 Task 8 上线缺口。

#### 任务 9B.6：菜单、部门、岗位与前端权限路由第一增量

状态：已完成第一增量；完整 RuoYi RBAC/DataScope 未完成。

范围：

- 新增 Flyway `V7__auth_menu_dept_post_foundation.sql`。
- 建立 RuoYi 风格基础表：`system_dept`、`system_post`、`system_user_post`、`system_menu`、`system_role_menu`。
- 为本地 ADMIN/CS/WORKER/DOCTOR 账号补部门、岗位和角色菜单种子数据。
- 登录和 `/api/auth/me` 返回 `menus`；前端骨架按后端菜单显示可访问入口。
- 医生账号前端不显示内部订单和系统权限入口；后端权限注解和 DataScope 仍是安全边界。
- `docs/api/openapi.yaml` 新增 `AuthMenu` / `CurrentUserResponse`，并补 `GET /auth/me` 契约。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests,PermissionInterceptorTests test`：PASS，10 tests / 0 failures / 0 errors。
- `npm run check:openapi`：PASS，50 paths / 61 operations / 61 operationIds。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- HTTP smoke：医生账号通过 Vite `/api/auth/login` 登录后只返回 `dashboard`、`doctor-orders`、`doctor-files`、`ai-doctor` 菜单，不返回 `internal-orders`。
- 浏览器 smoke：Playwright 使用本机 Chrome 登录医生账号，页面显示医生订单/医生 AI，不显示内部订单/系统权限。

未完成原因：

- 9B.6 仍不是完整 RuoYi-Vue-Pro；尚未实现部门/岗位/菜单管理页面、角色授权 UI、通用 DataScope SQL 拦截器或正式 Spring Security/JWT。
- `X-Bootstrap-*` 仍保留为统一解析器中的本地 smoke 兼容路径；正式环境仍必须设置 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=false`。
- 仍需前端业务页面、WebSocket、真实 DeepSeek、部署/运维手册等 Task 8 上线缺口。

#### 任务 9B.7：生产鉴权门禁第一增量

状态：已完成第一增量；完整生产鉴权仍未完成。

范围：

- 新增 `AuthStartupValidator`，启动时同步 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS` 到统一身份解析器。
- active profile 包含 `prod` 时，禁止 `APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=true`。
- active profile 包含 `prod` 时，禁止 `APP_AUTH_TOKEN_SECRET` 为空或仍使用 `local-dev-change-me-auth-secret`。
- 新增 `application-prod.yml`，生产 profile 默认关闭 `X-Bootstrap-*` 本地兼容，并要求 token secret 外部注入。
- 新增 acceptance 机器检查，确保生产门禁代码、prod 配置和测试文件存在。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=AuthStartupValidatorTests,BearerIdentityTests,PermissionInterceptorTests test`：PASS，13 tests / 0 failures / 0 errors。
- `AuthStartupValidatorTests` 覆盖 prod profile 启用 bootstrap header 会 fail-fast、prod profile 使用本地 token secret 会 fail-fast、非生产环境可同步关闭本地 header 并返回 401。
- `BearerIdentityTests` 继续覆盖关闭 bootstrap header 后，只有 `X-Bootstrap-*` 且无 Bearer token 的请求返回 401。

未完成原因：

- 9B.7 只完成生产启动门禁，不等于完整 Spring Security/JWT 或完整 RuoYi-Vue-Pro 生产鉴权。
- `X-Bootstrap-*` 仍保留为本地 smoke 兼容路径；生产 profile 有 fail-fast 门禁，正式环境仍必须通过部署平台安全注入真实 `APP_AUTH_TOKEN_SECRET`。
- 仍需完整 RuoYi 管理 UI、通用 DataScope SQL 拦截器、前端业务页面、WebSocket、真实 DeepSeek 和部署/运维手册等 Task 8 上线缺口。

#### 任务 9C.1：WebSocket 通知第一增量

状态：已完成第一增量；完整通知上线能力仍未完成。

范围：

- 新增 `spring-boot-starter-websocket`，用于后端真实 WebSocket 通道。
- 新增 `/ws/connect?token={access_token}`，握手阶段校验 Bearer token，token 无效或缺少 `user_id` 时拒绝连接。
- 新增 `NotificationPushService`，以 `notification_event` / `user_notification` 为事实来源，只对当前在线用户推送已生成的脱敏 payload。
- 在线推送成功后写 `user_notification.delivered_at` 并更新 `notification_event.delivery_status='DELIVERED'`。
- `CollaborationService` 仍先落通知事实，再尝试在线推送；离线用户继续依赖未读补偿数据。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=NotificationWebSocketTests,MessageDesignBillNotificationTests test`：PASS，4 tests / 0 failures / 0 errors。
- `NotificationWebSocketTests` 使用真实随机端口 Tomcat + `StandardWebSocketClient`，覆盖医生 Bearer token 建立 WebSocket、账单通知在线推送、payload 不含内部备注、送达状态落库。
- `MessageDesignBillNotificationTests` 继续通过，证明原消息/设计稿/账单物流事实落库链路未被破坏。

未完成原因：

- 9C.1 是单实例在线推送第一增量；9C.2 已补通知列表、未读/已读 REST 接口和前端通知中心入口，但仍未实现 Redis 多实例广播、浏览器 WebSocket 实时接入和医生端完整业务页面验收。
- WebSocket payload 目前复用通知事实 payload；后续若扩展字段，必须继续保持医生端脱敏红线。
- 正式上线仍需把 WebSocket 纳入 Nginx/HTTPS、心跳、重连、监控和压测策略。

#### 任务 9C.2：通知未读/已读接口与前端消息中心入口

状态：已完成第一增量；完整通知上线能力仍未完成。

范围：

- 新增 `GET /notifications`，按当前 Bearer 身份列出本人通知，支持 `unread_only` 和 `limit`。
- 新增 `GET /notifications/unread-count`，返回当前用户未读通知数。
- 新增 `POST /notifications/{notificationId}/read`，只允许当前用户标记本人通知已读。
- 新增 `POST /notifications/read-all`，只更新当前用户自己的未读通知。
- 前端骨架新增登录后的「通知中心」入口，显示未读徽标、通知列表、刷新、单条已读和全部已读。
- Vite 本地开发代理新增 `/notifications` 到后端，通知中心按冻结契约访问通知 REST，不走不存在的 `/api/notifications`。
- `docs/api/openapi.yaml` 同步 4 个通知 REST operation，当前契约为 54 paths / 65 operations / 65 operationIds。
- `acceptance.json` 新增 9C.2 后端文件、关键逻辑、前端入口和 OpenAPI path 检查。

验收结果：

- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=NotificationRestTests,NotificationWebSocketTests test`：PASS，3 tests / 0 failures / 0 errors。
- `NotificationRestTests` 覆盖当前用户只读本人通知、不返回他人通知、未读数、单条已读、全部已读和已读后 unread-only 为空。
- `npm run check:openapi`：PASS，54 paths / 65 operations / 65 operationIds；Swagger validate 和 Redocly lint 通过。
- `npm run acceptance`：PASS，`acceptance.json valid`。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- Vite 代理 smoke：真实后端 + Vite dev server 下，doctor 登录后经 `/notifications` 路径读取 smoke 通知、查询未读数、标记单条已读和全部已读均通过。

未完成原因：

- 9C.2 只完成通知 REST 和前端骨架入口，不等于完整消息/通知业务页面。
- 9C.3 已补真实 WebSocket 连接、自动刷新、断线重连骨架和 Redis 广播代码路径；仍缺浏览器通知权限、真实双实例联调、通知定时补偿任务、Nginx/HTTPS WebSocket 配置和生产压测。

#### 任务 9C.3：前端 WebSocket 实时接入与 Redis 广播第一增量

状态：已完成第一增量；完整通知生产验收仍未完成。

范围：

- 前端通知中心登录后建立 `/ws/connect?token=...` WebSocket，连接状态显示为未连接/连接中/已连接/已断开。
- 收到实时推送后刷新通知列表和未读数，并显示最新实时通知摘要。
- Vite 本地开发代理新增 `/ws` WebSocket 代理。
- 后端新增 `spring-boot-starter-data-redis`，以及 `NotificationBroadcaster`、`NotificationRedisBroadcaster`、`NotificationRedisBroadcastListener`、`NotificationRedisBroadcastConfiguration`。
- `NotificationPushService` 先做本机投递，再发布 Redis 广播；监听器忽略本实例消息，只对远端实例消息触发本机投递。
- 新增环境变量：`APP_INSTANCE_ID`、`NOTIFICATION_REDIS_BROADCAST_ENABLED`、`NOTIFICATION_REDIS_CHANNEL`、`REDIS_HOST`。

验收结果：

- TDD 红灯：`NotificationBroadcastTests` 首次运行失败于缺少 `NotificationBroadcaster`、`NotificationBroadcastMessage`、`NotificationRedisBroadcastListener` 和 `pushLocalToUser`。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=NotificationBroadcastTests,NotificationWebSocketTests,NotificationRestTests test`：PASS，5 tests / 0 failures / 0 errors。
- `NotificationBroadcastTests` 覆盖本机无在线 session 时仍发布广播、远端广播不自回环且触发本机投递。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- Vite `/ws` 代理 smoke：真实后端 + Vite dev server 下，doctor 经 `ws://localhost:5173/ws/connect` 建立 WebSocket，admin 上传账单后收到 `BILL_UPLOADED` payload（smoke 订单 `WS-SMOKE-1782809858059`）。
- `acceptance.json` 已新增 9C.3 后端广播文件、配置、前端 WebSocket 和 Vite `/ws` 代理检查。

未完成原因：

- 9C.3 仍不是完整生产通知验收；本轮未启动两个后端实例做 Redis 端到端联调。
- 仍需 Nginx/HTTPS WebSocket 代理配置、心跳/重连策略压测、监控告警、浏览器通知权限和完整消息业务页面联动。
- Redis 广播默认关闭，正式或联调环境需显式设置 `NOTIFICATION_REDIS_BROADCAST_ENABLED=true` 并配置唯一 `APP_INSTANCE_ID`。

#### 任务 9D.1：医生订单工作台第一增量

状态：已完成第一增量；完整前端业务页面仍未完成。

范围：

- 后端补齐当前 OpenAPI 已冻结的 `GET /orders` 最小实现，支持 `page`、`size`、`keyword`、`external_status`。
- 医生端订单列表强制限定本人订单，返回脱敏 `DoctorOrderVO`；不返回 `internal_status`、`production_note`、`cs_user_id`。
- 前端新增「医生订单工作台」，医生可读取订单列表/详情、公开消息、医生可见设计稿、账单物流。
- 前端支持医生发送给客服的消息、确认/驳回待确认设计稿、调用医生 AI 查询订单公开状态、确认收货。
- Vite 本地代理新增 `/orders` 和 `/ai`；新增 `scripts/check-task-9d1-frontend.mjs` 与 `npm run check:task9d1`。
- `docs/api/openapi.yaml` 补 `OrderListResponse` / `DoctorOrderSummary`，当前仍为 54 paths / 65 operations / 65 operationIds。

验收结果：

- TDD 红灯：`OrderStatusProjectionTests#doctorOrderListUsesDataScopeAndDesensitizedProjection` 首次运行失败于 `GET /orders` 404。
- 红绿后同一测试通过，覆盖医生订单列表本人范围、外部状态、脱敏字段和内部备注不泄露。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests,PermissionInterceptorTests,AiGatewayTests,MessageDesignBillNotificationTests test`：PASS，15 tests / 0 failures / 0 errors。
- `npm run check:task9d1`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- Vite 代理 API smoke：doctor 经 `http://localhost:5173/api/auth/login` 登录后，通过 `/orders`、订单详情、消息、设计稿、账单、物流、`/ai/order-query` 读取 smoke 订单 `9D1-SMOKE-1782811019788`，未泄露 `TASK9D1_INTERNAL_NOTE_DO_NOT_LEAK`、`internal_status`、`production_note`。
- 浏览器 smoke：本机 Chrome 打开 `http://localhost:5173`，doctor 登录后进入「医生订单」，搜索 `9D1-SMOKE-1782811019788`，页面显示医生订单工作台、公开消息、账单物流，且未出现内部字段。

未完成原因：

- 9D.1 只是医生订单读取侧页面第一增量，不包含医生下单、动态表单、Uppy 上传、Multipart、客服审核、生产审核、生产任务池、质检工时或管理绩效页面。
- 医生端设计稿仍只展示 `file_id`，未聚合预览 URL；账单也未聚合签名预览 URL。
- 当前页面仍在单文件 Vue 骨架中实现，后续前端工程扩大时需要拆组件、补路由和页面级测试。

#### 任务 9D.2：医生下单 / 动态表单 / 上传入口第一增量

状态：已完成第一增量；完整医生下单与上传体验仍未完成。

目标：

- 补齐 PRD 12 步主链路中的“医生在线下单”第一可验收路径。
- 让医生端可以基于后端动态表单配置创建订单，并把本人已完成上传文件绑定到订单。

范围：

- `GET /form-configs?product_type=...` 返回有效表单字段，前端按字段渲染医生下单表单。
- `POST /orders` 仅允许医生创建本人订单，提交后进入 `PENDING_CS_REVIEW` / `PENDING_REVIEW`；本轮明确不支持草稿，`is_draft=true` 返回 400。
- 文件绑定只允许本人、已完成、医生可见的文件；不得允许医生绑定他人文件、内部文件或未完成上传文件。
- 前端先做医生端下单面板和 `file_id` 绑定入口；真实 Multipart 上传后续由 9D.10 第一增量补齐，客服审核和生产审核不并入本任务。

完成记录：

- 已新增 `V8__doctor_order_entry_form_seed.sql`，为 `REGULAR_CROWN` 提供第一增量默认动态表单字段：患者姓名、牙位、材料、色号、医生备注。
- 已新增 `FormConfigController` / `FormConfigService`，实现 `GET /form-configs` 只读动态表单配置。
- 已新增 `OrderCreationService`、`CreateOrderRequest`、`CreateOrderResponse`，实现医生 `POST /orders` 提交订单，并绑定本人已完成且医生可见的未绑定文件。
- 提交后通过 `OrderStatusService` 写入 `PENDING_CS_REVIEW` / `PENDING_REVIEW` 和 `order_status_history`，医生响应不返回 `internal_status`。
- 已补后端 TDD 回归：`OrderStatusProjectionTests#doctorCanReadDynamicFormAndCreateSubmittedOrderWithOwnCompletedFiles` 和 `#doctorCannotBindOtherUnfinishedOrInternalFilesWhenCreatingOrder`。
- 前端「医生订单工作台」已新增「新建订单」面板，动态读取表单、提交订单，并支持用逗号分隔的已完成 `file_id` 绑定附件。
- 已新增 `scripts/check-task-9d2-frontend.mjs`、`npm run check:task9d2`，并把 9D.2 后端、前端、OpenAPI 关键文本纳入 `acceptance.json`。
- `docs/api/openapi.yaml` 已同步 `FormFieldConfig`、`CreateOrderRequest` 和 `CreateOrderResponse`。
- 已修复 9D.2 浏览器验收回归：`/form-configs` 补入 Vite proxy，`scripts/check-task-9d2-frontend.mjs` 与 `acceptance.json` 纳入代理检查，避免动态表单请求落到 Vite HTML fallback。
- 已修复本地浏览器登录 CORS 回归：默认允许 `http://localhost:5173` 和 `http://127.0.0.1:5173`，并用 `BearerIdentityTests#databaseLoginAllowsLocalhostAndLoopbackViteOrigins` 覆盖。

验收结果：

- TDD 红灯：新增测试首次运行失败于 `GET /form-configs` 404 和 `POST /orders` 405，确认缺口存在。
- TDD 红灯：`BearerIdentityTests#databaseLoginAllowsLocalhostAndLoopbackViteOrigins` 首次运行失败于 `127.0.0.1:5173` Origin 返回 403，确认本地浏览器 CORS 缺口存在。
- TDD 红灯：`npm run check:task9d2` 收紧后首次失败于缺少 `frontend/vite.config.ts -> '/form-configs'`，确认动态表单 Vite 代理缺口存在。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests test`：PASS，7 tests / 0 failures / 0 errors。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=BearerIdentityTests#databaseLoginAllowsLocalhostAndLoopbackViteOrigins test`：PASS，1 test / 0 failures / 0 errors。
- `npm run check:task9d2`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- `npm run check:openapi`：PASS，54 paths / 65 operations / 65 operationIds。
- `npm run acceptance`：PASS，`acceptance.json valid`。
- 运行态代理 smoke：带 `Origin: http://127.0.0.1:5173` 的 `/api/auth/login` 经 Vite 返回 200；`/form-configs?product_type=REGULAR_CROWN` 经 Vite 返回 `application/json`。
- 浏览器 smoke：doctor 在 `http://127.0.0.1:5173` 登录，进入「医生订单」，动态表单显示患者姓名、牙位、材料、色号、医生备注；填写必填项后创建订单 `ORD20260630-9D94797093`，页面显示 `PENDING_REVIEW`。

未完成原因：

- 9D.2 当时的上传入口只支持绑定已完成 `file_id`；9D.10 已补 Multipart 文件选择上传、本地恢复上传、服务端候选恢复和 100MB+ 浏览器上传 smoke 第一增量，但仍不是草稿上传、完整弱网/跨设备浏览器续传或完整 Uppy Dashboard。
- 本轮不实现草稿、生产审核、工序实例化或完整客服协同页面。
- 动态表单字段最终清单、完整弱网/跨设备续传、文件类型/数量限制仍需后续任务或 PM/客户确认。

#### 任务 9D.3：客服审核 / 驳回页面与接口第一增量

状态：已完成第一增量；完整客服工作台仍未完成。

目标：

- 补齐 PRD 12 步主链路中的“客服初审通过/驳回”第一可验收路径。
- 让客服能从待审订单列表进入订单初审，并把医生提交订单推进到生产审核前状态或驳回补资料状态。

范围：

- `GET /orders?internal_status=PENDING_CS_REVIEW` 支持内部角色按内部状态过滤待审订单；医生端仍不返回内部字段。
- `POST /orders/{orderId}/review` 支持 CS/ADMIN 对 `PENDING_CS_REVIEW` 订单执行 `APPROVE` 或 `REJECT`。
- 审核通过写入 `production_note`，通过 `OrderStatusService` 进入 `PENDING_PRODUCTION_REVIEW` / `PENDING_REVIEW`，不触发生产审核、不实例化工序。
- 审核驳回要求 `reject_reason`，通过 `OrderStatusService` 进入 `CS_REJECTED` / `PENDING_REVIEW`；医生端仍只看外部投影。
- 前端复用 `/orders/internal` 内部订单菜单，新增「客服初审」列表、订单资料和通过/驳回表单。

完成记录：

- 已新增 `OrderReviewRequest` / `OrderReviewService`，并在 `OrderController` 暴露 `POST /orders/{orderId}/review`。
- 已扩展 `OrderProjectionQueryService#listOrders` 和 `OrderController#listOrders`，支持内部角色使用 `internal_status` 过滤待审订单。
- 审核通过/驳回均写入 `order_status_history`，并写 `notification_event` / `user_notification` 医生通知事实。
- 已新增 `scripts/check-task-9d3-frontend.mjs`、`npm run check:task9d3`，并把 9D.3 后端、前端、OpenAPI 关键文本纳入 `acceptance.json`。
- `docs/api/openapi.yaml` 已同步 `OrderReviewRequest`、`internal_status` 列表过滤参数和 `/orders/{orderId}/review` 响应 schema。

验收结果：

- TDD 红灯：新增测试首次运行失败于 `/orders/{orderId}/review` 404；待审列表过滤测试首次收紧后失败于返回 2 条，确认 `internal_status` 过滤缺口存在。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests test`：PASS，11 tests / 0 failures / 0 errors。
- `npm run check:task9d3`：PASS。
- `npm run check:openapi`：PASS，54 paths / 65 operations / 65 operationIds。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- HTTP smoke：doctor 创建订单 `ORD20260630-1E844940B0`，CS 通过 `internal_status=PENDING_CS_REVIEW` 列表查到 1 条并审核通过，状态变为 `PENDING_PRODUCTION_REVIEW/PENDING_REVIEW`。
- 浏览器 smoke：CS 登录 `http://localhost:5173`，进入「内部订单」的「客服初审」，页面显示订单 `ORD20260630-99C60FD3DF` 的动态表单字段，点击「通过初审」后该订单从待审列表消失；SQL 确认状态为 `PENDING_PRODUCTION_REVIEW/PENDING_REVIEW`。

未完成原因：

- 当前只做订单初审，不实现生产审核页面、工序实例化页面或完整客服订单详情。
- AI-1 翻译草稿和 AI-4 缺资料检查已存在后端最小能力，但本轮未把它们嵌入客服初审页面，也未实现“人工确认后写入生产指令”的完整交互。
- 驳回后的医生补资料 / 再提交链路仍未实现；`CS_REJECTED` 医生端仍只表现为 `PENDING_REVIEW` 外部投影。
- 客服消息、设计稿、账单物流仍在既有后端最小接口中，未合并成完整客服工作台页面。

## 任务 9D.4：生产审核页面与工序实例化串联第一增量

状态：completed-first-increment。

目标：

- 让内部角色能从待生产审核订单列表进入生产审核，并把 `PENDING_PRODUCTION_REVIEW` 订单推进到工序实例化状态或生产驳回状态。

范围：

- `GET /orders?internal_status=PENDING_PRODUCTION_REVIEW` 作为生产审核待办列表；医生端仍不返回内部字段。
- `POST /orders/{orderId}/production-review` 只允许处理 `PENDING_PRODUCTION_REVIEW` 订单；未经过客服初审的订单返回 409，且不得创建工序实例。
- 前端新增 `/workflow/review`「生产审核」最小页面，支持待审核订单列表、订单资料、工序链选择、入口路线、分支参数 JSON、通过生产审核和驳回生产审核。
- 审核通过进入 `PROCESS_INSTANCE_CREATED` / `PRODUCING`，并复用既有 Workflow Runtime 创建 `order_process_instance`、节点快照和边快照。

完成记录：

- `WorkflowRuntimeService` 新增 `requirePendingProductionReview` 状态门禁，生产审核前使用 `FOR UPDATE` 读取订单状态；订单不存在返回 404，状态不匹配返回 409。
- `WorkflowRuntimeTests` 新增 `productionReviewRejectsOrdersThatHaveNotPassedCsReview`，TDD 红灯确认 `PENDING_CS_REVIEW` 曾可直接实例化，修复后通过。
- `frontend/src/App.vue` 新增生产审核页面状态、`loadProductionReviewOrders`、`loadWorkflowChains`、`reviewProductionOrder` 和 `/workflow/review` 页面分支。
- `frontend/vite.config.ts` 新增 `/workflow-chains` 代理。
- 已新增 `scripts/check-task-9d4-frontend.mjs`、`npm run check:task9d4`，并把 9D.4 后端、前端、OpenAPI 关键文本纳入 `acceptance.json`。
- `docs/api/openapi.yaml` 已同步生产审核状态门禁、权限描述和 `internal_status` 过滤说明。

验收结果：

- TDD 红灯：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=WorkflowRuntimeTests test` 首次失败于 `productionReviewRejectsOrdersThatHaveNotPassedCsReview` 期望 409 但实际 200，确认未过客服初审也能实例化的缺口存在。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=WorkflowRuntimeTests test`：PASS，4 tests / 0 failures / 0 errors。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=OrderStatusProjectionTests,WorkflowRuntimeTests test`：PASS，15 tests / 0 failures / 0 errors。
- `npm run check:task9d4`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- HTTP/browser smoke：doctor 创建订单并由 CS 初审通过后，CS 在 `http://localhost:5173` 进入「生产审核」，选择待审订单、工序链和路线，点击「通过生产审核」；SQL 确认订单进入 `PROCESS_INSTANCE_CREATED/PRODUCING`，并存在 `order_process_instance`。

未完成原因：

- 当前只做生产审核入口，不实现生产任务池、派工/转派页面、工序实例详情可视化、节点入检/出检、工时和绩效页面。
- 分支参数仍采用 JSON 文本输入，贴面、种植基台等内部路线参数是否完全由生产审核补充仍需 PM/客户确认。
- 生产审核通过后未做前端任务池通知联动；仍依赖后续生产任务池页面和通知联调。

## 任务 9D.5：生产任务池 / 工序实例详情 / 派工页面第一增量

状态：completed-first-increment。

目标：

- 让 CS/ADMIN 能查看已生成的工序实例并给节点绑定员工；让 WORKER 能在页面看到分配给自己的任务。

范围：

- 前端 `/workflow/process-instance`：按 `PROCESS_INSTANCE_CREATED` 订单读取工序实例详情，展示实例状态、节点数、边数和节点列表。
- 前端 `/workflow/assign`：复用工序实例列表和节点详情，对选中节点调用派工/转派接口。
- 前端 `/tasks/mine`：WORKER 按 `READY / IN_PROGRESS / COMPLETED / PENDING` 过滤本人任务，并提供最小 `开始任务` / `完成任务` 按钮。
- Vite 代理新增 `/tasks` 和 `/process-instance`。
- `docs/api/openapi.yaml` 校正派工/转派权限说明为 CS / ADMIN，并补 `tasks/mine` 的 `READY` 状态枚举。

完成记录：

- 已新增 `ProcessInstanceDetail`、`ProcessNodeItem`、`WorkerTaskItem` 等前端类型和生产任务相关状态。
- 已新增 `loadProcessInstancePage`、`loadProcessInstanceOrders`、`loadProcessInstanceDetail`、`assignSelectedProcessNode`、`loadWorkerTasks`、`operateWorkerTask`。
- 已新增 `/workflow/process-instance`、`/workflow/assign`、`/tasks/mine` 三个前端页面分支，并复用现有菜单权限种子。
- 已新增 `scripts/check-task-9d5-frontend.mjs`、`npm run check:task9d5`，并把 9D.5 前端和 OpenAPI 关键文本纳入 `acceptance.json`。

验收结果：

- TDD 红灯：`node scripts/check-task-9d5-frontend.mjs` 首次失败，确认缺 `ProcessInstanceDetail`、`loadProcessInstancePage`、`assignSelectedProcessNode`、`loadWorkerTasks`、`/tasks` 和 `/process-instance` 代理等关键入口。
- `npm run check:task9d5`：PASS。
- `npm run check:task9d1 && npm run check:task9d2 && npm run check:task9d3 && npm run check:task9d4 && npm run check:task9d5`：PASS。
- `npm run check:openapi`：PASS，54 paths / 65 operations / 65 operationIds。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=WorkflowRuntimeTests,PermissionInterceptorTests test`：PASS，8 tests / 0 failures / 0 errors。
- 浏览器 smoke：API 准备订单 `ORD20260630-0F7516BF76` 并实例化为 `330`；CS 登录 `http://localhost:5173` 进入「派工转派」，搜索订单并点击「绑定员工」给 `9601`；worker 登录「我的任务」看到该订单 READY 任务和「开始任务」入口。API 复核 `tasks/mine?status=READY` 返回 `task_node=714`。

未完成原因：

- 当前工序实例/派工入口只筛选 `PROCESS_INSTANCE_CREATED` 订单；进入 `IN_PRODUCTION` 后的跨状态生产看板和多条件筛选未做。
- `我的任务` 只做最小开工/完工入口；未嵌入入检/出检、工时暂停/继续/完成、返工和质检页面。
- 派工员工仍输入 `user_id`，未接正式员工选择器、班组/岗位筛选或工作负载提示。

## 任务 9D.6：入检 / 出检 / 工时操作页面第一增量

状态：completed-first-increment。

目标：

- 让 WORKER 能在页面上对本人任务节点提交入检/出检记录，并对进行中任务执行工时开始、暂停、继续和完成。

范围：

- 前端 `/checks`：复用 `GET /tasks/mine` 按状态筛选本人节点，选中节点后读取 `GET /check-records/{nodeInstanceId}`，并调用 `POST /check-records` 提交入检/出检。
- 前端 `/worklogs/self`：复用 `GET /tasks/mine` 按状态筛选本人节点，对 `IN_PROGRESS` 节点调用 `POST /work-logs/start`，并对当前工时记录调用暂停、继续、完成接口。
- Vite 代理新增 `/check-records` 和 `/work-logs`。
- 新增 `scripts/check-task-9d6-frontend.mjs` 和 `npm run check:task9d6`，并把 9D.6 前端入口纳入 `acceptance.json`。

完成记录：

- 已新增 `CheckRecordResponse`、`WorkLogResponse` 前端类型和 `checkTasks` / `worklogTasks` 等页面状态。
- 已新增 `loadCheckTasks`、`selectCheckTask`、`loadCheckRecords`、`submitCheckRecord`、`loadWorklogTasks`、`selectWorklogTask`、`startSelectedWorkLog`、`operateWorkLog`。
- 已新增 `/checks` 入检出检页面分支和 `/worklogs/self` 工时记录页面分支，复用既有菜单权限种子。
- 已新增质检/工时页面样式和 Vite 代理。

验收结果：

- TDD 红灯：`npm run check:task9d6` 首次失败，确认缺 `CheckRecordResponse`、`loadCheckTasks`、`submitCheckRecord`、`loadWorklogTasks`、`startSelectedWorkLog`、`/checks`、`/worklogs/self`、`/check-records` 和 `/work-logs` 等关键入口。
- `npm run check:task9d6`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。

未完成原因：

- 质检页面只做节点级入检/出检提交，不做完整返工处理台、责任分类字典或复杂 DAG 返工影响范围配置。
- 工时页面只做当前 work log 的 start/pause/resume/finish，不做历史工时列表、批量补录、异常申诉或绩效公式展示。
- 仍缺生产通知联动、完整生产看板、终检专用页面和管理绩效页面。

## 任务 9D.7：绩效管理页面第一增量

状态：completed-first-increment。

目标：

- 让 WORKER 能读取本人绩效统计，让 ADMIN 能输入员工 `user_id` 查询指定员工绩效快照。

范围：

- 前端 `/performance`：复用 `GET /performance`，展示 `completed_count`、`effective_duration`、`rework_count`、`on_time_rate`、`pass_rate`、`duration_efficiency`。
- WORKER 留空查询本人绩效；ADMIN 可填 `user_id` 查询指定员工。
- Vite 代理新增 `/performance`。
- 新增 `scripts/check-task-9d7-frontend.mjs` 和 `npm run check:task9d7`，并把 9D.7 前端入口纳入 `acceptance.json`。

完成记录：

- 已新增 `PerformanceStatsResponse` 前端类型和 `performanceStats` / `performanceUserId` 等页面状态。
- 已新增 `loadPerformanceStats`，对非法 `user_id` 做正整数校验后调用 `/performance`。
- 已新增 `/performance` 页面分支，展示完成工序、有效工时、返工次数、准时率、通过率和工时效率。
- 已新增绩效卡片样式和 Vite 代理。

验收结果：

- TDD 红灯：`npm run check:task9d7` 首次失败，确认缺 `PerformanceStatsResponse`、`loadPerformanceStats`、`isPerformanceRoute`、`/performance` 页面和代理等关键入口。
- `npm run check:task9d7`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。

未完成原因：

- 绩效页面只展示当前统计快照，不做时间范围筛选、历史明细列表、导出报表或绩效申诉/补录。
- 标准工时仍待客户确认，当前仅展示后端现有最小公式结果。
- 仍缺完整管理端绩效看板、生产看板联动和正式 RuoYi DataScope SQL 覆盖。

## 任务 9D.8：生产看板 / 跨状态生产检索第一增量

状态：completed-first-increment。

目标：

- 让 ADMIN/CS 能在一个生产看板入口按内部状态和关键词检索生产订单，并查看已实例化订单的节点进度快照。

范围：

- 前端 `/production/board`：复用 `GET /orders`，支持 `PENDING_PRODUCTION_REVIEW`、`PROCESS_INSTANCE_CREATED`、`PRODUCING`、`SHIPPED`、`COMPLETED` 和全部状态检索。
- 选中已实例化订单后复用 `GET /orders/{orderId}/process-instance` 展示节点统计和节点进度。
- 新增 `V9__production_board_menu_seed.sql`，为 ADMIN 和具备 `order:read-internal` 的角色追加「生产看板」菜单。
- 新增 `scripts/check-task-9d8-frontend.mjs` 和 `npm run check:task9d8`，并把 9D.8 前端入口纳入 `acceptance.json`。

完成记录：

- 已新增 `productionBoardOrders`、`productionBoardStatus`、`productionBoardInstance` 等页面状态。
- 已新增 `loadProductionBoardOrders`、`selectProductionBoardOrder`、`loadProductionBoardInstance`。
- 已新增 `/production/board` 页面分支，展示跨状态生产检索、订单状态、节点统计和节点进度。
- 已新增生产看板响应式样式和菜单种子迁移；本轮未新增 OpenAPI path，复用既有 `/orders` 与 `/orders/{orderId}/process-instance` 契约。

验收结果：

- TDD 红灯：`npm run check:task9d8` 首次失败，确认缺 `productionBoardOrders`、`productionBoardStatus`、`loadProductionBoardOrders`、`isProductionBoardRoute`、`/production/board`、生产看板菜单迁移等关键入口。
- `npm run check:task9d8`：PASS。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。

未完成原因：

- 生产看板只展示当前订单列表与工序实例快照，不做拖拽/泳道看板、实时 WebSocket 刷新、排产或节点编辑。
- 待生产审核订单尚未生成工序实例，只显示订单状态和提示。
- 仍缺完整返工处理台、终检入口、复杂多条件筛选、生产通知联动和正式 RuoYi DataScope SQL 覆盖。

## 任务 9D.9：返工处理台 / 终检入口第一增量

状态：completed-first-increment。

目标：

- 让 WORKER/ADMIN 能在页面看到待返工记录，并从已完成节点提交最小终检出检记录。

范围：

- 后端新增 `GET /reworks` 只读列表，支持按 `status` 和 `order_id` 筛选。
- WORKER 只能读取来源节点或目标节点分配给本人的返工记录；CS/ADMIN 可读取内部返工记录，医生端禁止读取。
- 前端新增 `/rework-final`「返工终检」页面：左侧查看待返工记录，右侧读取本人已完成节点作为终检入口，并复用 `POST /check-records` 提交终检出检通过。
- 新增 `V10__rework_final_menu_seed.sql`，为 ADMIN 和具备 `check:write` 的角色追加「返工终检」菜单。
- 新增 `scripts/check-task-9d9-frontend.mjs` 和 `npm run check:task9d9`，并把 9D.9 前端入口、菜单迁移和 OpenAPI 契约纳入 `acceptance.json`。

完成记录：

- 已新增 `ReworkRecordResponse` 和 `WorkflowExecutionService.getReworks`，返回返工 ID、订单号、来源节点、目标节点、目标节点状态、原因、状态和创建时间。
- 已新增 `GET /reworks` 控制器入口，并使用 `@RequirePermission(value = "check:read-internal", roles = {ADMIN, CS, WORKER})` 做入口权限校验。
- `CheckWorklogPerformanceTests` 新增返工列表回归：出检失败后 WORKER 本人可查到 PENDING 返工记录，其他 worker 返回空列表，医生 Bearer token 访问 `/reworks` 返回 403。
- 前端新增 `ReworkRecordResponse`、`reworkRecords`、`finalInspectionTasks`、`loadReworkRecords`、`loadFinalInspectionTasks`、`submitFinalInspectionCheck` 和 `/rework-final` 页面分支。
- `docs/api/openapi.yaml` 已同步 `/reworks` 和 `ReworkRecordResponse`，并校正 `/check-records` 当前状态门禁描述。

验收结果：

- TDD 红灯：`npm run check:task9d9` 首次失败，确认缺前端返工终检入口、V10 菜单迁移和 `/reworks` OpenAPI 契约。
- TDD 红灯：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test` 首次失败于 `/reworks` 404，确认后端缺返工列表接口。
- `npm run check:task9d9`：PASS。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=CheckWorklogPerformanceTests test`：PASS，5 tests / 0 failures / 0 errors。

未完成原因：

- 当前只做返工记录只读和终检出检第一增量，不实现返工责任分类字典、返工处理状态关闭、复杂 DAG 回滚策略或终检专用角色/权限点。
- 终检入口复用已完成节点和 `POST /check-records`，尚未引入独立终检业务表、终检报告、出货前拦截或生产通知联动。
- Task 8 总体仍保持 `NOT READY`，仍缺完整弱网/跨设备续传、真实 DeepSeek、完整客服协同、生产网关通知验收、部署/操作手册和完整浏览器 12 步验收；100MB+ 浏览器上传 smoke 已在 9D.10 后续补齐。

## 任务 9D.10：Multipart 上传 / 医生附件上传绑定第一增量

状态：completed-first-increment。

目标：

- 让医生端具备真实文件选择上传入口，并把上传完成的附件 `file_id` 回填到医生下单绑定字段。

范围：

- 后端新增 MinIO Multipart 生命周期接口：初始化、分片签名、完成、取消。
- `file_resource` 增加 Multipart 元数据字段，保留单对象预签名 PUT 兼容路径。
- 医生 Multipart 写路径限定为上传资源创建者本人，避免同诊所其他医生 abort/complete 他人上传。
- 前端医生订单页新增最小 Uppy 文件选择入口，按后端返回 `part_size` 分片 PUT 到 MinIO，完成后回填 `doctorOrderFileIds`。
- OpenAPI 同步新增 Multipart 请求/响应 schema、status/pending 恢复 schema 和 6 个文件接口。
- 新增 `scripts/check-task-9d10-frontend.mjs` 和 `npm run check:task9d10`，并把 9D.10 后端、前端、迁移和 OpenAPI 关键文本纳入 `acceptance.json`。

完成记录：

- 已新增 `V11__file_multipart_upload_metadata.sql`，记录 `upload_mode`、`multipart_upload_id`、`multipart_part_size`、`multipart_part_count`。
- 已新增 `MultipartInitiateRequest/Response`、`MultipartPartUrlRequest/Response`、`MultipartCompleteRequest`、`MultipartAbortRequest`。
- `FileController` 已新增 `/files/multipart/initiate`、`/files/{fileId}/multipart/part-url`、`/files/{fileId}/multipart/complete`、`/files/{fileId}/multipart/abort`。
- `FileResourceService` 使用同步 MinIO client 处理现有 stat/presign，使用 `MinioAsyncClient` 处理 SDK 暴露的 Multipart create/complete/abort。
- `FileAccessTests` 新增 Multipart 回归：医生可 initiate、上传分片、complete 并写审计；其他医生不能 abort 本人上传；本人可 abort。
- 前端新增 `@uppy/core`，并在医生订单页增加 `选择附件`、`上传并绑定`、进度和完成 file_id 标签。
- 后续第一增量已新增 `GET /files/{fileId}/multipart/status` 和 `MultipartStatusResponse`，返回 MinIO 已完成分片列表，供浏览器恢复上传时跳过已传分片。
- 前端医生订单页已新增本地 `doctorUploadResumeSessions`，异常中断后保留 `file_id/upload_id/part_size/part_count`，重试时先读取 `multipart/status` 并复用已完成分片；同时提供「取消未完成上传」手动 abort 入口。
- 已新增 `scripts/smoke-task-9d10-large-upload.spec.mjs` 和 `npm run smoke:task9d10-large-upload`，用 Playwright + 系统 Chrome 跑医生浏览器登录、创建订单、100MB+ Multipart 上传、完成 `file_id` 回填和预览权限校验。
- 后续第三增量已新增 `GET /files/multipart/pending?order_id=...` 和 `MultipartPendingUploadsResponse`，医生只能列出本人在当前订单下的未完成 Multipart 候选，不暴露 `object_key`。
- 前端医生订单页已新增 `doctorUploadServerResumeCandidates`：没有本地会话时，按当前订单、同文件名、同文件大小匹配服务端候选，恢复 `file_id/upload_id` 后再读取 status。
- 已新增 `scripts/smoke-task-9d10-server-resume.spec.mjs` 和 `npm run smoke:task9d10-server-resume`，用浏览器创建订单、API 预创建 pending Multipart、清理本地上传会话，再验证浏览器完成上传时复用同一个 pending `file_id`。

验收结果：

- TDD 红灯：`npm run check:task9d10` 首次失败，确认缺前端 Multipart 入口、OpenAPI、迁移和 Uppy 依赖。
- TDD 红灯：`./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=FileAccessTests test` 首次失败于 `/files/multipart/initiate` 404，确认后端缺 Multipart 接口。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=FileAccessTests test`：PASS，5 tests / 0 failures / 0 errors。
- `npm run check:task9d10`：PASS。
- `npm run check:openapi`：PASS；后续补 pending 恢复候选后当前为 61 paths / 72 operations / 72 operationIds。
- `npm run build:frontend`：PASS_WITH_WARNINGS，保留既有 VueUse PURE comment 与大 chunk warning。
- TDD 红灯：`FileAccessTests#multipartUploadStatusListsUploadedPartsForResume` 首次失败于 `/files/{fileId}/multipart/status` 404，确认缺恢复上传状态接口。
- TDD 红灯：`npm run check:task9d10` 首次失败，确认缺 `multipart/status`、本地恢复会话和 OpenAPI 状态 schema。
- TDD 红灯：加强 `npm run check:task9d10` 后首次失败，确认缺 100MB+ 浏览器 smoke 脚本、npm 入口和上传 UI 稳定 selector。
- 机制 smoke：`TASK9D10_UPLOAD_SIZE_BYTES=1048576 npm run smoke:task9d10-large-upload` 通过，确认脚本可穿过医生登录、创建订单、浏览器上传、完成回填和预览权限校验。
- 100MB+ 浏览器 smoke：`npm run smoke:task9d10-large-upload` 通过，生成 `file_id=457`；SQL 核验 `file_resource.upload_status=COMPLETED`、`file_size=110100480`、`upload_mode=MULTIPART`、`multipart_part_count=21`。
- TDD 红灯：`FileAccessTests#multipartPendingUploadsListsOnlyCurrentDoctorRowsForCrossDeviceResume` 首次失败于 `/files/multipart/pending` 404，确认缺服务端恢复候选列表。
- TDD 红灯：加强 `npm run check:task9d10` 后首次失败，确认缺 `files/multipart/pending`、`doctorUploadServerResumeCandidates`、`loadDoctorPendingMultipartUploads` 和 OpenAPI pending schema。
- `./scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -Dtest=FileAccessTests test`：PASS，6 tests / 0 failures / 0 errors。
- `npm run check:openapi`：PASS，61 paths / 72 operations / 72 operationIds。
- TDD 红灯：再次加强 `npm run check:task9d10` 后首次失败，确认缺 `smoke:task9d10-server-resume` 和 `scripts/smoke-task-9d10-server-resume.spec.mjs`。
- 脚本排障：首次运行失败于稀疏文件 header 长度写死；修复后又发现浏览器完成了新 `file_id`，未复用 pending，最终改为读取浏览器真实 `File.type` 后再预创建 pending 候选。
- 服务端候选恢复浏览器 smoke：`npm run smoke:task9d10-server-resume` 通过，生成并复用 `file_id=514`，对应 `order_id=1439`。
- TDD 红灯：再次加强 `npm run check:task9d10` 后首次失败，确认缺 `smoke:task9d10-interrupted-resume` 和上传中断恢复浏览器 smoke 脚本。
- 脚本排障：首次运行中断恢复 smoke 时等待中文错误文案超时，实际浏览器显示 `Failed to fetch`；修正断言后复跑通过。
- 上传中断后恢复浏览器 smoke：`npm run smoke:task9d10-interrupted-resume` 通过，模拟第 2 个分片 PUT 断网，确认本地 `doctor-order-upload:` 会话保留 1 个已完成分片，服务端 `multipart/status` 返回 `PENDING`，第二次点击上传复用同一 `file_id=537` 完成。

未完成原因：

- 当前上传入口要求先选择或创建订单后上传并回填 `file_id`，不做草稿订单、临时文件池或驳回补资料上传流程。
- 当前已具备“同一浏览器本地会话 + 服务端已完成分片查询 + 无本地会话服务端候选匹配 + 上传中断后恢复”的恢复上传第一增量，并已通过本地 105MB 浏览器 Multipart smoke、服务端候选恢复浏览器 smoke 和中断恢复浏览器 smoke；但仍未覆盖真实跨设备浏览器验收、并发调优、完整 Uppy Dashboard 或真实弱网限速/断网注入。
- 文件类型、文件数量、分片大小阈值和生产 bucket 隔离仍需 PM/客户和部署方案最终确认。
- Task 8 总体仍保持 `NOT READY`，仍缺返工关闭/责任分类、终检发货拦截、真实 DeepSeek、生产网关通知验收、部署/操作手册和完整浏览器 12 步验收。

## 当前开放问题

- Multipart 阈值、文件大小、文件类型、文件数量限制，以及是否必须支持完整弱网/跨设备续传。
- 动态表单字段清单是否已有客户最终确认版。
- 是否允许 ADMIN 调整进行中订单节点；默认不允许增删节点，只允许员工绑定/转派。
- 贴面路线、种植基台路线等分支是否完全由生产审核时补充 `branch_params`。
- 设计稿确认是否阻塞生产。
- AI-5 模板。
- 标准工时和预计发货算法。
- 付款状态。
