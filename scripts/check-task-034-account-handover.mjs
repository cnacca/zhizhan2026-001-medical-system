import fs from 'node:fs'

// TASK-034 D 批次：账号交接与人员转移。
// 守住四件事：
//   1. 每个用户 ID 列都被显式判定为「当前负责关系」或「历史事实」——漏判是本批最大的事故来源；
//   2. 绩效与责任追溯的落点绝不出现在转移清单里；
//   3. 交接留痕含客户点名的六项，且转移对象清单是具体主键；
//   4. 交接是账号安全操作，医生 / 客服 / 生产端都不能执行。

const read = (p) => fs.readFileSync(p, 'utf8')

const migration = read(
  'backend/platform-server/src/main/resources/db/migration/V83__account_handover.sql'
)
const plan = read('backend/platform-server/src/main/java/com/yuri/aiorder/account/AccountHandoverPlan.java')
const service = read('backend/platform-server/src/main/java/com/yuri/aiorder/account/AccountHandoverService.java')
const controller = read('backend/platform-server/src/main/java/com/yuri/aiorder/account/AccountHandoverController.java')
const adminPage = read('frontend/src/components/AdminHandoverPages.vue')
const app = read('frontend/src/App.vue')
const openapi = read('docs/api/openapi.yaml')
const behaviourTests = read('backend/platform-server/src/test/java/com/yuri/aiorder/account/AccountHandoverTests.java')
const classificationTests = read(
  'backend/platform-server/src/test/java/com/yuri/aiorder/account/AccountHandoverClassificationTests.java'
)

const failures = []

const required = [
  [migration, 'V83 migration', 'CREATE TABLE account_handover'],
  [migration, 'V83 migration', 'CREATE TABLE account_handover_item'],
  [migration, 'V83 migration', 'object_ids JSON NULL'],
  [migration, 'V83 migration', "'account:handover'"],
  [migration, 'V83 migration', "'account:handover:read'"],
  [migration, 'V83 migration', "'admin-account-handover'"],
  // 分类是这一批的核心
  [plan, 'AccountHandoverPlan.java', 'TRANSFER_RULES'],
  [plan, 'AccountHandoverPlan.java', 'HISTORICAL_COLUMNS'],
  [classificationTests, 'AccountHandoverClassificationTests.java', 'everyUserIdColumnInTheSchemaIsExplicitlyClassified'],
  [classificationTests, 'AccountHandoverClassificationTests.java', 'information_schema.COLUMNS'],
  [classificationTests, 'AccountHandoverClassificationTests.java', 'performanceAndAccountabilityColumnsAreNeverTransferable'],
  [classificationTests, 'AccountHandoverClassificationTests.java', 'classificationSetsDoNotOverlapAndPointAtRealColumns'],
  // 边界
  [service, 'AccountHandoverService.java', 'successor must use the same portal role'],
  [service, 'AccountHandoverService.java', 'doctor handover must stay within the same clinic'],
  [service, 'AccountHandoverService.java', 'successor account must be active'],
  [service, 'AccountHandoverService.java', 'acknowledged must be true'],
  [service, 'AccountHandoverService.java', 'requireSameDeptScope'],
  [service, 'AccountHandoverService.java', 'DELETE FROM auth_refresh_token'],
  [service, 'AccountHandoverService.java', 'historicalRecordsKept'],
  // 界面
  [adminPage, 'AdminHandoverPages.vue', 'handover-preview'],
  [adminPage, 'AdminHandoverPages.vue', 'handover-kept'],
  [adminPage, 'AdminHandoverPages.vue', 'handover-acknowledge'],
  [adminPage, 'AdminHandoverPages.vue', '@submit.prevent="submit"'],
  [app, 'App.vue', 'adminHandoverRoutePaths'],
  [app, 'App.vue', "'/admin/account/handover'"],
  // 契约
  [openapi, 'openapi.yaml', 'getAccountHandoverPreview'],
  [openapi, 'openapi.yaml', 'postAccountHandover'],
  [openapi, 'openapi.yaml', 'getAccountHandovers'],
  // 行为测试
  [behaviourTests, 'AccountHandoverTests.java', 'handoverMovesCurrentOwnershipToTheSuccessor'],
  [behaviourTests, 'AccountHandoverTests.java', 'historicalFactsKeepTheOriginalOperatorAfterHandover'],
  [behaviourTests, 'AccountHandoverTests.java', 'handoverRecordsFullAuditIncludingTheTransferredObjectList'],
  [behaviourTests, 'AccountHandoverTests.java', 'successorMustUseTheSamePortalRole'],
  [behaviourTests, 'AccountHandoverTests.java', 'doctorHandoverCannotCrossClinics'],
  [behaviourTests, 'AccountHandoverTests.java', 'unauthorizedAccountsCannotExecuteOrReadHandovers'],
  [behaviourTests, 'AccountHandoverTests.java', 'removingTheHandoverPermissionCodeDeniesAccessEvenForAdminPortal'],
  [behaviourTests, 'AccountHandoverTests.java', 'disablingTheSourceAccountNeedsTheAccountDisablePermissionOnTopOfHandover']
]

required
  .filter(([content, , fragment]) => !content.includes(fragment))
  .forEach(([, file, fragment]) => failures.push(`${file} missing: ${fragment}`))

// 1. 绩效与责任追溯的落点绝不能出现在转移规则里。
//    这几列一旦被交接改写，后果是算错工资、追错责任，且事后无法区分是交接改的还是本来如此。
const transferSection = plan.slice(
  plan.indexOf('TRANSFER_RULES'),
  plan.indexOf('HISTORICAL_COLUMNS')
)
for (const critical of [
  'work_log', 'check_record', 'final_inspection_report', 'order_status_history',
  'production_reward_penalty_record', 'order_message', 'system_rbac_audit',
  'export_audit', 'file_access_audit'
]) {
  if (transferSection.includes(`"${critical}"`)) {
    failures.push(`AccountHandoverPlan.java: ${critical} 出现在转移规则里，历史事实不得随交接改写`)
  }
}

// 2. 交接接口的角色白名单里只能有 ADMIN。
for (const match of controller.matchAll(/@RequirePermission\([^)]*\)/gs)) {
  for (const forbidden of ['UserRole.DOCTOR', 'UserRole.CS', 'UserRole.WORKER']) {
    if (match[0].includes(forbidden)) {
      failures.push(`AccountHandoverController.java: 交接接口的 roles 里出现了 ${forbidden}`)
    }
  }
}

// 3. 交接权限码不得授予医生 / 客服 / 生产端角色。
const grantPattern = /'(DOCTOR|CS|WORKER|CLINIC_[A-Z_]+|CS_[A-Z_]+|PROD_[A-Z_]+)'[^\n]*account:handover/
if (grantPattern.test(migration)) {
  failures.push('V83 migration: 把 account:handover 授予了非管理端角色')
}

// 4. 转移只能通过 AccountHandoverPlan 声明的规则发生：
//    服务里不得出现直接写死表名的 UPDATE，否则分类守卫就被绕过去了。
const hardcodedUpdate = service.match(/UPDATE\s+(orders|patient_record|work_log|check_record)\b/i)
if (hardcodedUpdate) {
  failures.push(
    `AccountHandoverService.java: 出现写死表名的 UPDATE（${hardcodedUpdate[0]}），`
    + '转移必须走 AccountHandoverPlan 的规则，否则分类守卫形同虚设'
  )
}

if (failures.length > 0) {
  console.error('check:task-034-account-handover failed:')
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(`check:task-034-account-handover passed (${required.length} assertions + 4 结构断言)`)
