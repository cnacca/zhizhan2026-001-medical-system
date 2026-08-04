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
- ~~`ProductionWorkbenchDepartmentSummaryTests`：服务按 `Asia/Shanghai` 算「今天」而 MySQL 存 UTC，本地 00:00–08:00 期间必然失败；生产环境的「今日」指标同样错 8 小时。~~
  **已于 2026-08-04 修复**（D-183）：MySQL 以 `--default-time-zone=+08:00` 启动、容器与 JVM 固定 `Asia/Shanghai`，
  应用侧「今天」统一走 `common/BusinessTime`。已用「把 MySQL 临时拨到 `-10:00` 复现失败 → 恢复 `+08:00` 通过」验证，
  不是靠换个时间点跑一次侥幸通过。

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

## C. 管理端角色 / 权限 / 组织管理界面 —— `COMPLETED`（2026-08-03）

**目标**：关闭客户 CHK064 / CHK065 / CHK066 三条标红。

### 授权边界落成两个可判定的数据字段

客户确认的四条授权边界没有写成角色名判断，而是落成数据，新增角色只需配置：

- `system_role.role_level`（V80 新增）：数字越小权限越高。授权人只能授予**等级严格低于自己**的角色，
  「经理不能分配管理员级和经理级」自动成立。0=平台管理员与入口角色，10=经理级，20=主管/组长级，30=普通岗位。
- `rbac:cross-dept` 权限码：没有它就只能操作与自己同部门的用户，「主管不能跨部门」自动成立。
- 账号安全权限（`account:create` / `account:disable` / `account:reset-password`）与业务数据权限
  （`rbac:permission:assign` / `rbac:user:assign`）拆成两组码：部门经理拿后者不拿前者，
  落地客户「创建/停用账号=管理者账号，分配角色/菜单/数据范围=各部门经理」的分工。
- 额外加了一条客户没写但必须有的约束：**不能把自己没有的权限码授予别人**。

### Scope

- [x] 角色管理：创建、编辑、停用、恢复；分配权限码与菜单；设置 `data_scope`。入口角色禁止停用（会让整端登录不进来，返回 409）。
- [x] 组织管理：部门层级维护（`parent_id`）、岗位维护。
- [x] 用户管理：分配角色 / 部门 / 岗位；停用与解锁；重置密码。
- [x] 权限矩阵视图：角色 × 权限码可视化 + 授权操作留痕列表，供客户逐项核对。
- [x] 新增 `system_rbac_audit` 表，17 个接口的全部写操作记录操作人、时间、对象与**修改前后内容**。
- [x] 前端 `AdminRbacPages.vue` 三个页面（角色权限 / 组织架构 / 权限矩阵）+ 管理端导航与菜单种子。
- [x] 同步 `docs/api/openapi.yaml`（17 个 operation、14 个 schema）。

### 执行中发现并修复的问题

1. **`system_dept` / `system_menu` / `system_post` / `system_user` 的主键都不是自增列**，一直靠手工分配 id。
   照常规写 `INSERT` + `LAST_INSERT_ID()` 会直接失败（`Field 'menu_id' doesn't have a default value`）。
   已按 `MAX+1` 取号并在代码里说明这一约定。
2. **入口角色不能参与授权人自身等级的计算**。每个用户都持有入口角色，而 CS/WORKER/DOCTOR 的
   `role_level` 是 0（表示「只有管理员能授予入口角色」）。第一版把它们算进 `MIN` 后，任何客服用户
   都被判成平台管理员，**全部授权边界失效**。已排除这三个角色码，ADMIN 例外。
3. **人员角色分配会误删入口角色**。`role_codes` 是全量替换语义，非平台管理员调整下属角色时会把
   目标用户的入口角色一起删掉，人就登录不进来了。已改为：非平台管理员的请求自动保留目标用户已有的入口角色。

### Acceptance

- [x] 上述操作在管理端**可实操**：新建角色、勾选权限码保存、新建部门/岗位、下拉分配角色与部门、
  停用/解锁账号、重置密码，全部是表单与按钮，不是只读展示。
- [x] 高风险操作全部留痕（`adminCanCreateEditAndDisableRoleWithFullAudit` 断言 CREATE/UPDATE/STATUS_CHANGE
  三条记录，并校验 `before_value` 确实是修改前的内容）。
- [x] 越权测试：`managerCannotGrantAdminOrManagerLevelRole`、`supervisorCannotAssignAcrossDepartments`、
  `managerCannotGrantPermissionCodeTheyDoNotHold`、`accountSecurityPermissionsAreSeparateFromBusinessPermissions`、
  `workerWithoutRbacPermissionIsDenied`。
- [x] 密码只能重置不能查看：`RbacUserResponse` 不含任何口令字段；重置返回一次性初始口令，
  系统不保存明文，审计只记录「发生过重置」（`passwordCanOnlyBeResetNeverRead` 同时断言响应与审计都不含散列值）。

Verification：

```bash
npm run test:backend
npm run check:task-034-rbac-console
npm run check:openapi
npm run build:frontend
```

结果：后端 288 项，仅剩 A 批次已登记的两条既有失败；OpenAPI 176 paths / 204 operations 校验通过。

### 遗留

- 生产工作台的 13 个硬编码部门（GOAL-034 P2）仍未与 `system_dept` 打通。本批次把部门做成了可维护数据，
  但工作台那条链路的改动与正在进行的时区修复在同一个方法上，避免冲突，留到时区任务合并后再处理。
- 角色的菜单分配接口已具备（`menu_codes`），界面暂只做了权限码勾选；菜单勾选待客户确认菜单清单后补。

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

## E. 导出管控与留痕 —— `COMPLETED`（2026-08-04）

Scope（客户原话）：

- 「不允许医生直接导出，只能由管理者账号导出，并且导出需要反复确认」
- 「客户信息、地址、账单的导出是需要批准的」
- 「各个管理端都需要数据导出，除了客户信息、价格等，别的数据需要导出留痕」

### 开工时的现状：客户第一条要求正被违反

后端**一个导出接口都没有**（Controller 里 export/csv/excel 零命中），
而医生端有两个纯前端拼 CSV 的按钮：订单页「⇩ 导出」带走订单号、**患者姓名**、诊所、状态、**金额**；
账单页「⇩ 下载全部」带走**账单金额、已付、待付**。无审批、无留痕、不经后端。

因此本批次不是「给现有导出加审批」，而是先把数据出口收回后端——
纯前端拼 CSV 的按钮加多少权限码都拦不住，数据早已在浏览器里。

### 实际 Scope

- [x] 三张表（V82）：`export_dataset`（数据集目录）、`export_request`（申请与审批）、`export_audit`（每次下载的留痕）。
- [x] **敏感分类是配置不是代码**：客户点名的四类以 `sensitivity = SENSITIVE` 落在 `export_dataset`
  （客户档案 / 客户收货地址 / 订单账单与金额 / 产品价格）；客户改口时改这一列即可，不改 Java。
- [x] 四个权限码，不绑角色：`export:execute`（非敏感导出）、`export:sensitive`（申请敏感导出）、
  `export:approve`（审批）、`export:audit:read`（查看留痕）。**医生端角色一个都不给**。
- [x] 「反复确认」落成两道且都在后端强制：接口要求显式 `acknowledged=true`
  （界面上的确认框绕得过去，接口调用绕不过去），敏感类再叠一道**他人**审批——申请人批自己的申请返回 403。
- [x] 留痕含客户点名的五项：操作人、时间、导出范围、行数、字段清单。一次批准多次下载则留多条痕。
- [x] **导出不绕过数据范围**：订单派生数据集套用与 `OrderProjectionQueryService` 相同的 `data_scope` 条件；
  敏感数据集另要求数据范围为 `ALL`。权限码与数据范围是两回事，必须同时满足。
- [x] 筛选条件只认白名单键（`created_from` / `created_to` / `status` / `clinic_id`），值一律绑定参数——
  导出入参来自界面，拼字符串等于把注入面开在数据出口上。
- [x] 取数 SQL 集中在 `ExportDataProvider` 一处，目录与实现一一对应，**启动时校验**：
  少实现是「界面能选点了报错」，多实现是「有取数能力却没登记敏感级别」，后者会让数据集绕过审批分类。
- [x] 医生端两个导出函数与两个按钮删除；check 脚本扫 `frontend/src/doctor/` 全目录，
  出现 `text/csv` / `导出` 等痕迹即失败。
- [x] 管理端新增 `AdminExportPages.vue` 两页（数据导出 / 导出留痕）+ 路由 + 菜单种子。
- [x] 同步 `docs/api/openapi.yaml`（6 个 operation、5 个 schema）。

### 执行中发现并修复的部署级缺陷（D-184）

**前端到后端的代理前缀，开发与生产两份清单早已漂开。** 前端用裸路径直接调后端，
开发靠 `vite.config.ts` 的 `server.proxy`，生产靠 `frontend/nginx.conf`。实测：
前端使用 30 个后端前缀，`nginx.conf` 只代理了 3 个，其余全部落到 `try_files` 返回 `index.html`——
不报错，只是页面把 HTML 当 JSON 解析。

E 批次的导出界面本来会直接死在这上面；顺带查出 **C 批次的 `/rbac` 与 F 批次的 `/ordering-rules`
从未被加进任何一份代理清单**，在演示环境实测返回 `200 text/html`，
也就是说管理端 RBAC 控制台在浏览器里一直是坏的。

已把 `nginx.conf` 改成一条正则 `location` 覆盖全部前缀（逐个写 `location` 正是漂掉的原因），
两份清单的一致性由 `check:deployment-env` 静态守住。修复后实测
`/rbac/roles` 返回 24 条、`/ordering-rules` 返回 19 条、`/exports/datasets` 返回 7 条。

### Acceptance

- [x] 医生端无任何导出入口（`doctorHasNoExportPermissionCodeAndEveryExportEndpointRejectsThem`
  同时断言医生端五个角色的 `export:*` 授权数为 0、四个导出接口对医生返回 403；
  check 脚本另扫医生端全目录无导出痕迹）。
- [x] 敏感导出需审批，未批准不可下载（`sensitiveExportCannotBeDownloadedBeforeApproval`：
  未批准下载返回 409 且**不产生留痕**，批准后才成功；
  `allFourCustomerNamedCategoriesAreClassifiedAsSensitive` 逐个验证客户点名的四类）。
- [x] 所有导出有审计记录（`everyDownloadRecordsOperatorTimeRangeRowCountAndFieldList` 逐项断言五项内容，
  并验证同一申请下载两次留两条痕；`auditFieldListMatchesTheCsvHeaderActuallyProduced`
  断言留痕里的字段清单**就是实际导出文件的表头**，否则审计对不上真实文件）。
- [x] 越权测试：`accountWithoutExportPermissionCodeIsDeniedEvenWhenThePortalRoleMatches`（撤权限码后 403）、
  `requesterCannotApproveTheirOwnSensitiveExport`、`onlyTheRequesterCanDownloadTheirOwnApprovedExport`
  （批准人也不能替申请人下载——批准的是「谁导」不是「谁都能导」）、
  `csCanExportNormalDataButCannotRequestOrApproveSensitiveData`、`auditTrailRequiresItsOwnPermissionCode`。

Verification：

```bash
npm run test:backend
npm run check:task-034-export-governance
npm run check:deployment-env
npm run check:openapi
npm run build:frontend
npm run demo:prepare
```

结果：后端 **319 项全绿**（干净测试库）；`check:task-034-export-governance` 51 项断言 + 4 项结构断言通过；
OpenAPI 190 paths / 218 operations 通过；nginx 配置用 `nginx -t` 实测语法通过。

另在**运行中的演示环境**用真实登录跑通（非 MockMvc）：
医生端调导出与留痕接口均 403 → 敏感申请落 PENDING → 未批准下载 409 → 自批 403 →
不带确认申请 400 → 客服申请敏感 403 → 客服非敏感申请直接可下载，导出 23 行、表头 8 列 →
留痕记下操作人「本地客服」、时间、范围、行数 23、字段数 8 → 客服查留痕 403。

### 遗留

- 「只能由管理者账号导出」按就窄不就宽解读：敏感类只有 `ADMIN` / `ADMIN_MANAGER` / `ADMIN_SUPERVISOR`
  能申请，非敏感类各管理端都能导。若客户本意是「所有导出都只能管理者做」，撤掉 CS / WORKER 的
  `export:execute` 即可，是配置不是代码。需复核。
- 医生端仍有一个 `downloadInvoice` 单据 PDF 下载：它是**单张**发票/退款单，且真实接口
  （`httpDoctorGateway`）恒返回空列表，属演示脚手架，未按「数据导出」处理。
  若客户认为单张账单 PDF 也算导出，需一并收掉。
- 导出为同步取数，单次上限 50000 行。真实数据量上来后需要改异步生成 + 文件下载。
- 导出文件本身未落对象存储、无过期回收：目前是即时生成即时返回，不留文件。
  若客户要求「导出文件可追溯下载」，需要接 MinIO 并定义留存期。

---

## F. 下单规则后端化 —— `COMPLETED`（2026-08-03）

**目标**：消除"前端能选、后端不认"。与 A~E 无依赖。

现状（已核实）：`try_in_required`、过程确认、订单类型、运输类型在 `DoctorCaseGroupWizard.vue` 有字段，后端零命中；后端**完全没有交期计算逻辑**。

### 执行前先统一三处不一致的叫法

任务书、客户确认表、前端对同一批字段用词互相冲突，落地前先定死以数据列为准，并写入 `status-vocabulary.md`：

| 数据列 | 前端字段 | 界面标签 | 本文件原用词 |
| --- | --- | --- | --- |
| `priority_code` | `case_priority` | 订单周期 | 「订单类型」 |
| `order_type` | `order_type` | 订单类型 | 「产品类型」 |

前端字段名保持不变——为统一叫法去改 18k 行的下单向导，收益不抵风险。

**回寄运单号的必填范围，本文件上下自相矛盾**：Scope 写「后三类」（返工/退货/仅设计），Acceptance 写「印模/返工/退货」。
按 Acceptance 与前端现有校验取**印模/返工/退货**——仅设计订单不寄实体模型，要求运单号会拦住正常下单。需与客户复核。

### 实际 Scope

- [x] 规则数值全部落 `ordering_rule_config`（V81），**代码里没有一个写死的天数**；每条规则带 `confirmation_status`，
  客户未提供的标准周期与在途天数一律 `PLACEHOLDER`。`npm run check:task-034-order-rules` 静态守住「引擎里不出现写死天数」。
- [x] **交期计算引擎**（`DeliveryPlanService`）：
  `到货日 = 起算日 + min(产品标准周期, 订单周期上限) + 过程确认项数×每项天数 + 等待天数 + 在途天数`。
  上限 `-1` 表示不设上限；3 天加急 = 3，当天出货 = 0，这两条客户已写死故为 `CONFIRMED`。
- [x] **试戴**：`order_bill_item` 新表承载计价项，试戴是独立一条且不预填金额（客户原话）；
  `POST /orders/{id}/try-in/complete` 由客服/管理端登记完成，之后 `POST /orders/{id}/try-in/finalize`
  让医生在**同一 order_id** 上选定成品与材料——订单号、历史、工序都留在原订单。
- [x] **过程确认**：`order_process_confirmation` 新表，内部发起 → 医生回复。
  等待天数**按读取时的日期现算**（`requested_at + 宽限期` 与今天的差），不引入定时任务：少一个会静默停摆的组件。
  医生回复时把已耽误的天数落库，之后不再累加也不倒回。
- [x] **运输类型**影响在途天数，进而影响到货日；自取 0 天为 `CONFIRMED`，快递/业务员配送是占位值。
- [x] **订单类型**（网络/印模/返工/退货/仅设计）：印模/返工/退货缺回寄运单号时**提交整体回滚**，
  不会出现「一部分子订单进了初审、另一部分没进」的半提交。
- [x] **未知取值直接 400**，不静默当默认值——静默兜底就是把「前端能选后端不认」换个形式保留下来。
  缺省仍按默认值处理，兼容 F 批次之前提交的订单。
- [x] **医生调整到货时间**：`PUT /orders/{id}/delivery-plan/requested-date`；早于可行交期时
  `variance_flag = EARLIER_THAN_FEASIBLE`，客服端订单列表与抽屉出现时间异常提示，并给受理客服推送通知。
- [x] **占位值转正走配置**：`PUT /ordering-rules/{ruleType}/{ruleKey}`（`ordering-rule:manage`），
  客户给出真实周期后改配置即可，不改代码不发版。
- [x] **患者联动**已具备，本批补测试固化：新患者经 `POST /patients` 立即出现在患者管理，
  病例组带 `patient_id` 提交后客服端直接看到患者姓名。
- [x] 前端：医生端订单抽屉新增「交期与过程确认」区块（天数构成、过程确认回复、试戴状态、计价项、调整到货时间），
  客服端订单列表与抽屉新增时间异常提示与交期两项。占位交期一律显示为 `日期（待确认）`。
- [x] 同步 `docs/api/openapi.yaml`（7 个 operation、11 个 schema）与 `docs/development/status-vocabulary.md`。

### 执行中发现并处理的问题

1. **不能为这批功能扩订单状态枚举**。「试戴中」「等待医生确认」看起来很像订单状态，但塞进
   `InternalOrderStatus` / `ExternalOrderStatus` 会让一期验收 11.2-03 的「7 个外部状态」口径当场失效。
   已各自独立成域（`order_try_in.try_in_status` / `order_process_confirmation.confirmation_status`），
   并在 check 脚本里加了反向断言：订单状态枚举中一旦出现 `TRY_IN` / `AWAITING_DOCTOR` 即失败。
2. **目录读取逻辑此前只有病例组草稿一处**。试戴后选成品要读同一套「当前生效版本」的产品与材料绑定，
   两处各写一份迟早在目录换版时给出不一致的结果。已抽出 `ActiveCatalogProductReader` 共用，
   `CaseGroupDraftService` 改为委托，行为不变（288→305 项测试全绿）。
3. **占位来源要按是否真的影响结果判定**。当天出货把制作天数压到 0 时，产品标准周期并没有参与计算，
   此时仍标「待确认」会让客服无谓地去追一个不影响结果的数。已按 `cap < 0 || 周期 <= cap` 判定。

### Acceptance

- [x] 勾选试戴后账单出现对应计价项（`tryInSelectionCreatesItsOwnBillItemAndTheFinalProductStaysOnTheSameOrder`，
  同时断言成品落在原 `order_id`、订单号与订单数不变）。
- [x] 每增加一项过程确认，到货时间 +1 天（`eachProcessConfirmationAddsExactlyOneDayToTheDeliveryDate`，0/1/2 项逐一比对）。
- [x] 加急交期缩短且可区分（`rushOrderShortensTheDeliveryDateAndStaysDistinguishableFromTheNormalCycle`，
  断言日期先后与 `priority_cap_days` 两层）。
- [x] 印模/返工/退货未填回寄运单号时提交被拦截（`impressionReworkAndReturnOrdersCannotBeSubmittedWithoutInboundTrackingNo`，
  三种类型逐一验证，并证明补上运单号后同一份草稿能提交——拦的是缺运单号不是订单类型）。
- [x] 医生调整到货时间后客服端出现时间异常提示（`doctorPullingTheDeliveryDateForwardRaisesTheCsVarianceAlert`，
  含「放回可行范围后提示消失」——不能只会亮不会灭）。
- [x] 新患者下单后自动出现在患者管理中（`patientCreatedWhileOrderingImmediatelyAppearsInPatientManagementAndCarriesIntoTheOrder`）。
- [x] 医生长时间未确认时订单进入等待并延后交期，医生端与客服端都有提示
  （`processConfirmationLeftUnansweredPostponesDeliveryAndSurfacesAWaitingAlert`）。
- [x] 占位周期在界面标「待确认」（`deliveryEstimateIsMarkedPlaceholderUntilCustomerConfirmsTheStandardCycle`）；
  改配置即可转正且交期随之变化（`confirmingStandardCycleThroughConfigurationChangesDeliveryWithoutCodeChange`）。
- [x] 未知取值被拒而非静默兜底（`unknownOrderingRuleValuesAreRejectedInsteadOfSilentlyDefaulted`，四类字段各一条）。
- [x] 越权测试：`processConfirmationRolesAreSeparated`（医生不能替内部发起、客服不能替医生确认、别的医生不能确认他人订单）、
  `removingTryInPermissionFromCsDeniesTryInCompletionEvenThoughThePortalRoleMatches`（删权限码真的产生 403）、
  `orderingRuleConfigurationRequiresItsOwnPermission`、`doctorCannotReadAnotherDoctorsDeliveryPlan`。

Verification：

```bash
npm run test:backend
npm run check:task-034-order-rules
npm run check:openapi
npm run check:status-vocabulary
npm run build:frontend
npm run demo:prepare
```

结果：后端 **305 项全部通过**（干净测试库上）。A 批次登记的两条既有失败已分别处理：
全库不变量那条只在被其它非事务测试污染时失败，重建测试库后通过；时区那条已按 D-183 真正修掉。
`check:task-034-order-rules` 64 项断言通过；OpenAPI 184 paths / 212 operations 校验通过；
`demo:prepare` 在演示环境上重新迁移、灌数并校验通过。

另在**运行中的演示环境**用真实登录跑通完整链路（非 MockMvc）：印模订单缺运单号提交返回 400 →
未知订单类型返回 400 → 补运单号后提交 200 → 交期 5+2+2=9 天、`estimate_status=PLACEHOLDER`
且占位来源为「常规冠修复标准制作周期、快递在途天数」、计价项含「打印氧化锆冠 / 试戴」两条 →
医生提前 3 天 → 客服端返回 `EARLIER_THAN_FEASIBLE` 与完整提示文案 → 试戴完成登记 → 成品在原订单选定。

### 遗留

- 各产品标准制作周期、快递与业务员配送在途天数、医生确认宽限天数**全部是占位值**，
  在 `ordering_rule_config` 中以 `PLACEHOLDER` 标记，界面显示为「日期（待确认）」。客户资料到位后改配置转正。
- 过程确认的发起目前是独立接口，尚未挂到具体工序节点上（做完 CAD 设计自动发起 CAD 确认）。
  挂钩需要工序节点与确认环节的对应关系，属客户未提供的工序清单范围。
- 「回寄运单号必填范围」按 Acceptance 取印模/返工/退货，与本文件 Scope 原文的「后三类」不一致，需与客户复核。
- 客服端目前只展示时间异常提示，尚无「按提示改期/与医生协商」的操作入口；客户未提出该要求，未擅自添加。

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
