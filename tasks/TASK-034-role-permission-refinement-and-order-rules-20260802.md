# TASK-034 角色权限体系细化与下单规则后端化执行批次

Status: `in_progress`

Goal: `goals/GOAL-033-role-permission-refinement-and-order-rules-20260802.md`

## Why

客户已确认的角色权限体系与下单规则均未落地。经调研，其中绝大部分**不依赖客户尚未提供的资料**——客户欠的是数据，不是结构。本任务把可做的部分拆成六个可独立验证的批次。

调研依据见 GOAL-033 的「调研结论」五条，此处不重复。执行前必须读完那五条，尤其是**结论二（不扩 `UserRole` 枚举）**——它决定了后续所有批次的做法。

## 执行顺序与依赖

```
A（授权底座）──┬─▶ B（细分角色）──┬─▶ C（管理界面）
                │                    └─▶ D（账号交接）
                └─▶ E（导出管控）
F（下单规则后端化）—— 与 A~E 无依赖，可并行
```

A 是所有权限相关批次的前置。F 独立，若人手紧张可先做 F——它直接消除"前端能选后端不认"这个演示风险。

## 通用规则

- 每批先补测试再实现，每批结束跑 `npm run demo:check` 与 `npm run check:status-vocabulary`。
- 涉及权限的每批必须补**越权拒绝测试**，不是只测正常路径通过。
- 不得为了让新角色跑通而放宽既有守卫。
- 每批完成后更新本文件 checklist 与验证结果。

---

## A. 授权底座统一 —— `COMPLETED`（2026-08-03）

**目标**：让"新增一个角色"不再需要改 Java 代码。

### 执行前先纠正 GOAL-033 结论三的两处事实错误

1. **`data_scope` 本来就在 `system_role` 上**，不需要"提升"。`system_user` 上没有这一列。
2. 真正让角色级配置失效的是 `DatabaseAuthService.resolveDataScope` 里的短路：
   `dataScopes.contains("ALL") || primaryRole == ADMIN || primaryRole == CS → "ALL"`。
   入口角色永远盖掉角色配置，客户要的「客服经理=全公司 / 普通客服=本人负责」在那种写法下**配不出来**。

### 执行中发现的两个更关键的阻塞（原方案未提及）

3. **`app.auth.allow-role-fallback=true` 让权限码形同虚设**。`PermissionInterceptor.hasFallbackRole` 在角色命中时直接放行；而 bootstrap header 身份的权限集合恒为空（`BootstrapIdentity.fromHeaders` 给 `Set.of()`），所有走 header 的链路（测试、演示）实际上全靠角色兜底。不解决这一条，服务层改成纯权限码会让约 250 个既有测试全部 403。
   **解法**：新增 `RolePermissionCatalog` + `BootstrapIdentityFactory`，让 bootstrap 身份带上其入口角色**当前配置的**权限码与数据范围。既有测试照常通过，而删掉权限码会真的产生 403。
4. **`DatabaseAuthService.primaryRole` 对每个角色码直接 `UserRole.valueOf`**，管理端一旦新建「组长」这类细分角色并分配给用户，该用户立刻**登录不进来**。这与结论二的整个架构直接冲突。
   **解法**：无法映射为入口角色的角色码一律忽略，不再抛异常。

### 实际 Scope

- [x] `system_user` 新增 `data_scope` 覆盖列（V78）；解析顺序改为 用户级覆盖 > 角色级配置 > 入口角色默认值，删除入口角色短路。
- [x] 清点并改造全部 **26 个** `requireAnyRole` 调用点（原估 24），逐个对应权限码；新增 15 个权限码并按原角色白名单等价授予。
- [x] 硬编码组合改为纯权限码：`requireProductionReview` / `canReviewProduction` → `workflow:review-production`；`requireAssignedWorkerOrAdmin` 的 ADMIN 直通 → `workflow:assign`；`resolvePerformanceTargetUserId` → `performance:read-all` / `performance:read-self`。
- [x] `requireDoctorOnly` 拆成 `requireDoctorPortalAction(identity, 权限码, message)`，9 个调用点分别对应 `order:write-doctor` / `patient:manage-doctor` / `ai:doctor`。
- [x] 清理两处**授权与实现长期不一致**的历史遗留（改成纯权限码后会真的放开访问）：
  - `workflow:assign` 曾授予 CS，但派工接口注解是 `roles = ADMIN`、服务层也是 ADMIN-only；撤销，与 PRD 11.3-03 一致。
  - 六个医生端专属码（`order:read-doctor` / `ai:doctor` / `patient:manage-doctor` / `account:doctor` / `clinic:read-self` / `file:access-doctor`）曾授予 ADMIN，而这些接口要么只允许 DOCTOR，要么另有内部码供 ADMIN 走；撤销后 ADMIN 可见范围不变。
- [x] `identity.role()` 的「入口角色 / Portal」语义写入 `AccessControlService` 类注释与 `docs/development/status-vocabulary.md` 新增章节。

### Acceptance

- [x] `AccessControlService` 中不再有不看权限码的判定；全仓库 `requireAnyRole` 零命中（由 `check:task-034-authorization-baseline` 静态守住）。
- [x] 角色级 `data_scope` 生效（`roleLevelDataScopeIsAuthoritativeInsteadOfPortalRoleDefault`）；用户级覆盖生效（`userLevelDataScopeOverridesRoleLevelConfiguration`）；现有 4 个种子用户行为不变（原文写 7 个，实际是 4 个）。
- [x] 越权测试：撤销 `WORKER` 的 `dashboard:read-internal` 后接口返回 403（`removingPermissionCodeFromRoleDeniesAccessEvenWhenPortalRoleMatches`）。
- [x] 新增细分角色全程只改配置：`newFineGrainedRoleGetsAccessPurelyThroughConfiguration` 建角色、授码、绑用户，无 Java 改动。
- [x] 既有 `@RequirePermission` 注解无回归，后端 268 项测试仅剩两条与本批次无关的既有失败（见下）。

Verification：

```bash
npm run test:backend
npm run check:task-034-authorization-baseline
```

结果：268 项中 266 通过。两条失败均与 A 批次无关，已分别登记：

- `OrderCaseGroupTests.migrationLeavesNoUngroupedOrDuplicateLegacyOrders`：断言全库不变量，被其它非事务测试的残留污染；干净库上通过。
- `ProductionWorkbenchDepartmentSummaryTests`：服务按 `Asia/Shanghai` 算「今天」而 MySQL 存 UTC，本地 00:00–08:00 期间必然失败；生产环境的「今日」指标同样错 8 小时。

**注意**：改动了已应用的迁移时需要重建测试库（`DROP DATABASE ai_order_platform_test` 后跑 `scripts/ensure-test-database.sh`），否则 Flyway 校验和不匹配。

### 遗留

- 多角色时数据范围取最宽，是过渡口径；B 批次落地「登录后选择当前身份」后应改为只按当前生效身份解析。
- `app.auth.allow-role-fallback` 保持现状未动。服务层已是纯权限码判定，该开关现在只影响 `@RequirePermission` 这一层；B/C 批次落地角色管理界面后可评估关闭。

---

## B. 细分角色与专项权限落地 —— `COMPLETED`（2026-08-03）

**目标**：客户确认的约 20 个细分角色成为可配置数据。

### Scope

- [x] 按 GOAL-033 映射表建 **20 个细分角色**（V79），配置权限码集合与 `data_scope`：
  医生端 4（诊所管理员/医生/前台/护士助手）、客服端 6（客服经理/高级客服/普通客服/翻译人员/收货人员/发货人员）、
  生产端 7（生产经理/部门主管/组长/技工/质检员/终检员/生产资料审核员）、管理端 3（经理/主管/普通员工）。
- [x] 新增 8 个专项权限码：`check:gate-inspect`、`check:sample-inspect`、`rework:register-internal`、
  `rework:confirm-responsibility`、`logistics:receive`、`logistics:ship`、`message:translate`、`production:review-data`。
- [x] 组长三条业务规则：
  - 入检/出检需 `check:gate-inspect`（组长/主管/终检员持有）；质检员只有 `check:sample-inspect`，
    新增 `check_type = 3 (SAMPLE)` 过程抽检类型，不参与一次通过率/终检通过率统计（那两项只看 `OUT`）。
  - 内返登记权限码归组长；关闭返工时要填责任方，因此该动作要求 `rework:confirm-responsibility`（质检员持有）。
  - 终检不合格退回负责部门组长：`rework_record` 新增 `routed_dept_id` / `routed_to_user_id`，
    创建返工时按被退回节点执行人所属部门解析该部门 `PROD_TEAM_LEAD`，解析不到时留空、不阻塞返工创建。
- [x] 收货/发货人员：只持有 `logistics:receive` / `logistics:ship` 与订单只读，不碰客户资料、产品与经营看板。
- [x] 三项待澄清做成配置开关（新建 `system_config` 表），不写死：
  - `role.cs-senior.enabled = true`（高级客服保留/取消，客户两个框都勾了）
  - `role.admin.can-operate-production = false`（管理端代操作生产，客户否决建议但未写边界）
  - `role.production-data-reviewer.successor = PROD_SUPERVISOR`（资料审核员取消后的承接方）
  生产资料审核员角色以 `INACTIVE` 建档保留结构，客户改口时不需要重建。

### 执行中发现并修复的缺陷

**权限码列表会被静默截断。** `DatabaseAuthService` 原先用 `GROUP_CONCAT` 把角色码、数据范围、权限码拼成 CSV。
MySQL `group_concat_max_len` 默认 1024 字节——本批次给管理员补齐权限码后，管理员的权限串正好越线，
`workflow:assign` 被从末尾截掉，**不报任何错**，表现为管理员莫名其妙失去派工能力。
已改为分三次查询装配，并加回归测试 `permissionListIsNotTruncatedWhenRoleHasManyCodes`
（同时断言权限码总长度确实超过 1KB，否则这条回归没有意义）。

这与 `status-vocabulary.md` 开篇记的是同一类问题：不抛错，只让数据悄悄不完整。

### Acceptance

- [x] 新增角色全程在配置中完成，无 Java 改动（`allTwentyFineGrainedRolesAreSeededAsConfigurationData`、
  `assigningFineGrainedRoleToUserDoesNotBreakPortalLogin`）。
- [x] 组长三条规则有守卫与测试（`teamLeadDoesGateInspectionWhileQualityInspectorOnlyDoesSampling`、
  `internalReworkIsRegisteredByTeamLeadAndResponsibilityConfirmedByQualityInspector`、`resolveTeamLeadRoute`）。
- [x] 收货/发货人员只看到职责范围内的功能（`receiverAndShipperSeeOnlyTheirOwnScope`，含越权拒绝断言）。
- [x] 三项待澄清以开关表达，切换开关即可改变行为（`adminDelegationOfProductionOperationIsDrivenByConfigurationSwitch`
  先断言默认拒绝，改配置后同一调用放行）。
- [x] `INACTIVE` 角色不授予任何权限（`inactiveRoleGrantsNothing`）。

Verification：

```bash
npm run test:backend
npm run check:task-034-fine-grained-roles
```

结果：后端 277 项，仅剩 A 批次已登记的两条既有失败（测试库残留、生产工作台时区）。

### 遗留

- 「高级客服=按分配客户」需要 `ASSIGNED` 数据范围档，依赖 GOAL-034 G4 的客户负责人关系；
  「部门主管=本部门」需要 `DEPT` 档，依赖客户未提供的真实部门数据。两者当前统一按 `SELF` 配置——
  宁可范围偏窄，也不要先给成 `ALL` 再往回收。
- 细分角色目前只能用 SQL 分配，管理端界面属 C 批次。
- 客户确认表的 md 转写丢失了勾选与手写内容，本批次的角色清单以 GOAL-033 的归纳为准；
  与客户复核时应回到 docx 原件。

---

## C. 管理端角色 / 权限 / 组织管理界面

**目标**：关闭客户 CHK064 / CHK065 / CHK066 三条标红。

Scope：

- 角色管理：创建、编辑、停用、恢复；分配菜单与权限码；设置 `data_scope`。
- 组织管理：部门与班组的层级维护（表已支持 `parent_id`）、岗位维护。
- 用户管理：给用户分配角色与所属部门/岗位；停用与解锁。
- 权限矩阵视图：按角色 × 菜单 / 按钮 / 数据范围可视化，供客户核对。
- 客户已确认的授权边界必须落地：
  - 创建/停用账号 = 管理者账号；
  - 分配角色/菜单/数据范围 = 各部门经理；
  - 账号安全权限与业务数据权限分离；
  - 经理不能分配管理员/经理级，主管不能跨部门。

Acceptance：

- [ ] 上述操作在管理端**可实操**，不是只读展示。
- [ ] 高风险操作（创建/停用账号、分配角色权限）全部留痕：操作人、时间、对象、修改前后内容。
- [ ] 越权测试：主管账号尝试跨部门分配被拒；经理尝试授予管理员级被拒。
- [ ] 密码只能重置不能查看。

---

## D. 账号交接与人员转移

**目标**：落地客户原话「有分配功能，把他账号分配给新同事，并保留之前得服务记录」。

Scope：

- 停用账号时可选择承接人，将其负责的客户、订单、进行中任务转移过去。
- **历史事实不改责任人**：已完成的工序、工时、质检、返工、审核记录保留原操作人。只转移"当前负责关系"。
- 医生端对应场景：转诊/离职时「所有资料、病例等转交给承接医生」。
- 转移操作本身留痕：操作人、时间、原责任人、承接人、转移对象清单、原因。

Acceptance：

- [ ] 转移后新责任人能看到并处理相应对象。
- [ ] 转移后查询历史记录，原责任人姓名仍出现在历史节点上。
- [ ] 转移有完整审计记录。
- [ ] 越权测试：非授权账号不能执行转移。

**注意**：这是客户新增需求，PRD V2 原 38 项中没有。需在验收矩阵中单列，不要混入原 38 项计数。

---

## E. 导出管控与留痕

Scope（客户原话）：

- 「不允许医生直接导出，只能由管理者账号导出，并且导出需要反复确认」
- 「客户信息、地址、账单的导出是需要批准的」
- 「各个管理端都需要数据导出，除了客户信息、价格等，别的数据需要导出留痕」

实现要点：

- 导出能力做成独立权限码，不绑定角色。
- 敏感类导出（客户信息 / 地址 / 账单 / 价格）走审批；其余导出直接留痕。
- 留痕内容：操作人、时间、导出范围、行数、字段清单。

Acceptance：

- [ ] 医生端无任何导出入口。
- [ ] 敏感导出需审批，未批准不可下载。
- [ ] 所有导出有审计记录。
- [ ] 越权测试：无导出权限码的账号调用导出接口返回 403。

---

## F. 下单规则后端化

**目标**：消除"前端能选、后端不认"。可与 A~E 并行。

现状（已核实）：`try_in_required`、过程确认、订单类型、运输类型在 `DoctorCaseGroupWizard.vue` 有字段，后端零命中；后端**完全没有交期计算逻辑**。

Scope：

- **试戴**：作为独立计价项落入账单；试戴完成后同一订单可继续选择成品与材料，不新建订单。
- **过程确认**：每增加一项，交期自动 +1 天；医生长时间未确认时订单进入等待状态并延后交期，需有可见提示。
- **订单类型**：正常出货周期 / 3 天加急 / 当天出货，影响交期计算。
- **运输类型**：快递 / 业务员配送 / 自取，影响物流环节。
- **产品类型**：网络订单 / 印模订单 / 返工订单 / 退货订单 / 仅设计订单；后三类需回寄运单号，缺失时拦截提交。
- **交期计算引擎**：按产品类型标准周期 + 订单类型系数 + 过程确认项数计算到货时间；医生可调整，调整后客服端出现时间异常提示。
- **患者联动**：下单时选择既有患者直接带出资料；新患者填写后自动写入患者管理。

Acceptance：

- [ ] 勾选试戴后账单出现对应计价项。
- [ ] 每增加一项过程确认，系统给出的到货时间 +1 天。
- [ ] 选择加急后交期缩短，且与正常周期可区分。
- [ ] 印模/返工/退货订单未填回寄运单号时提交被拦截。
- [ ] 医生调整到货时间后，客服端出现时间异常提示。
- [ ] 新患者下单后自动出现在患者管理中。

**边界**：各产品的标准制作周期属客户未提供数据（CP 项）。本批只建规则引擎并使用占位默认值，**占位值必须在界面上标注为"待确认"**，不得表现为正式承诺交期。

---

## 客户资料到位后才能做的（本任务不含）

| 项 | 阻塞内容 |
| --- | --- |
| 真实部门 / 班组 / 生产队列清单 | 组织数据灌入（结构本任务已建好） |
| CP-002 各产品动态表单最终字段 | 下单表单最终形态 |
| CP-005 各产品文件上传规则 | 上传项校验 |
| CP-004 各工序标准工时 | 绩效工时效率、准时率 |
| 各产品标准制作周期与价格 | F 批次的占位值转正 |
| CP-003 AI-5 生产备注模板 | AI 输出模板 |
| 卡环设计选项、隐形正畸参考平台 | 文档漏填项 |

## 待客户澄清（不阻塞，但影响最终形态）

1. 高级客服：确认表中「保留」与「取消」两个框都打了勾。
2. 管理端能否代操作生产：客户否决了「不能」的建议，但未写允许到什么程度。
3. 生产资料审核员：客户勾了取消，需确认由部门主管还是生产经理承接。2026-07-30 刚按 PRD 完成该角色的授权实现，改动前务必先确认，避免返工两次。
