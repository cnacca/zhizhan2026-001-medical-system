# 一期验收基线校准 2026-08-25

<!-- repo-init:managed -->

## Metadata

- ID: `TASK-038`
- Status: `completed`
- Owner: `shared`
- Goal: Task 8 一期交付收口（不改变 `acceptance.json.active_goal`）
- Created: `2026-08-25`
- Updated: `2026-08-25`

## Objective

以当前正式版本、自动发布结果、线上只读复验和现行代码为依据，校准 `docs/INDEX.md`、
`docs/DELIVERY-GAP.md` 与 `acceptance.json` 的冲突，形成一份不重复开发、也不伪造 READY 的当前验收账。

## Scope

- 校准原 PRD V2 38 项的当前计数和证据边界。
- 校准 Task 8 九类 readiness 缺口的已完成事实、剩余原因和最小关闭路径。
- 将正式服务器、HTTPS、医生端英文、自动发布、MySQL 发布前备份和 STL 站内查看的上线事实补入权威清单。
- 保留恢复演练、MinIO 备份、监控告警、真实 AI、真实文件网络、客户输入和最终交付证据为 `PARTIAL`。
- 修复仍断言 2026-07 旧计数／旧 active goal 的机器检查。
- 按已确认文件基线，将单订单文件数从 30 统一为 50，并增加发布时注入与正式容器复核门禁。

## Non-goals

- 不修改与文件数量限制无关的前端或后端业务流程。
- 不修改正式业务数据，不创建验收订单或工单。
- 不接入真实 DeepSeek key、webhook 或其他真实凭据。
- 不把 Task 8 标为 READY。
- 不删除历史 goal、task、验收记录或追加式日志。
- 不触发正式站热更新。

## Acceptance Criteria

- 当前导航和交付清单不再声称 HTTPS、医生端英文、正式部署或数据库备份“完全没有”。
- 原 38 项按逐行事实统一为 29 PASS / 1 PARTIAL / 0 MISSING / 8 EXTERNAL_ACCEPTANCE，并明确修正旧摘要的算术错误。
- `acceptance.json` 九个 readiness gap 仍全部为 `PARTIAL`，但已完成事实与当前剩余原因准确。
- 数据库备份与数据库恢复、MySQL 与 MinIO 对象备份、部署完成与总体验收完成明确分开。
- 普通生产账号 STL 在线点击保持 `PARTIAL`，不写正式数据强造。
- 后端、前端、env 模板、Compose 和发布链路的单订单文件上限统一为 50，专项及边界回归通过。
- 文档和机器检查通过，Task 8 保持 `NOT_READY`。

## Verification Commands

```bash
npm run check:acceptance-baseline
npm run check:task8-readiness-gaps
npm run check:prd-v2-acceptance-recalibration
npm run check:repoframe-docs
npm run check:task9d81
npm run check:task9d67
npm run build:frontend
MYSQL_TEST_DATABASE=ai_order_file50_20260825_test MINIO_TEST_BUCKET=ai-order-file50-test-private npm run test:backend
npm run acceptance
git diff --check
```

## Assumption Checks

### Validated

- 正式版本 `7013b1434759df6ca77a65893dbdcf0129e9af7b` 的自动发布 #32742027332 成功。
- 正式站首页和后端健康接口通过 HTTPS 返回 200。
- D-197 医生端英文和 D-202 站内文件预览／STL 查看已发布。
- 完整发布脚本会生成并校验 MySQL 部署前备份，并保留前后端回滚镜像标签。

### Invalidated

- “HTTPS 完全没有”“客户仍在采购服务器”“医生端 i18n 约 1%”“数据库备份完全没有”。
- `acceptance.json` 中原 38 项仍有 4 MISSING / 8 PARTIAL 的旧描述，以及旧摘要 30 PASS / 7 EXTERNAL_ACCEPTANCE 的算术错误。

### Still Open

- 数据库恢复、MinIO 备份／恢复、监控、日志轮转、回滚演练和客户培训。
- 真实 AI、真实大文件／弱网／跨设备、双实例 WebSocket 和普通生产账号 STL 点击。
- AI-5 模板、正式标准工时和正式 AI Key／预算／告警接收人均为 `USER_DEFERRED`，在用户主动恢复前不再询问或催办。CP-002 动态表单、CP-005 文件要求均已收到，不再要求重复提供；单订单文件数 30／50 不一致已完成本地修复，正式容器值待发布后复核。

## Downstream Impact

- 后续开发和验收必须从 `docs/INDEX.md`、`docs/DELIVERY-GAP.md` 和机器检查进入。
- 旧 readiness 日志保留追溯价值，但不得覆盖后续正式发布证据。
- 下一批优先从无外部依赖的 AI key 安全配置或运行资源／日志／监控补强中选择。

## Execution Log

- 2026-08-25：用户确认先做验收清单校准；任务开始。
- 2026-08-25：逐行统计原 38 项，确认旧摘要 30／1／0／7 与实际行状态不符，采用可复算的 29／1／0／8。
- 2026-08-25：完成当前导航、权威缺口、机器状态、9D.81、根项目记录和检查脚本校准；九类 readiness 均保持 `PARTIAL`。
- 2026-08-25：用户指出动态表单此前已经提供；复核《动态下单表最终版.docx》指纹、字段矩阵和实现记录后，将 CP-002 校正为已收到／已基线化。源表空白的价格、交期和文件细则继续独立跟踪。
- 2026-08-25：用户进一步确认文件要求也已在表单中提供；将 CP-005 校正为已确认基线，并发现当前 `FILE_MAX_FILES_PER_ORDER=30` 与 50 个的基线不一致，登记为我方配置／回归缺口。
- 2026-08-25：完成 30 → 50 修复；后端／测试默认、前端、env 模板、Compose、README 和完整发布后的容器复核统一为 50，尚未提交／发布。
- 2026-08-25：专项检查、文件权限 18 项、独立测试库后端全量 358 项、前端生产构建、发布／验收门禁和 Compose 渲染通过；共享测试库的一次搜索断言失败确认为历史重复样本污染。
- 2026-08-25：用户暂缓 AI-5 正式模板、标准工时、正式 AI Key／预算上限／告警接收人；记录为 `USER_DEFERRED`，后续不主动询问或催办。

## Completion Record

- Completed: `2026-08-25`。
- 仅修改文件数量限制及其发布门禁，未修改其他业务流程或正式数据，未触发正式发布。
- Task 8 保持 `NOT_READY`。
- 本任务列出的校准专项检查、`check:task9d67`、文件权限 18 项、独立测试库后端全量 358 项、
  前端生产构建、发布／验收门禁、Compose 渲染和 `git diff --check` 均通过。
- 全仓 RepoFrame 历史总检查仍为红色，原因是多个已归档 goal 继续断言旧
  `active_goal`、旧代码文本和旧完成表述；这是本任务开始前已存在的检查债务。本次未删除或
  弱化这些历史检查，也不据此把当前一期标为 READY。
