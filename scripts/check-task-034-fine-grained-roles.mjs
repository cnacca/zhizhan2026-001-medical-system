import fs from 'node:fs'

// TASK-034 B 批次：细分角色与专项权限落地为可配置数据。
// 守住四件事：
//   1. 20 个细分角色是种子数据，不是枚举；
//   2. 组长 / 质检员的检查分工用不同权限码表达；
//   3. 三项待客户澄清做成配置开关，不写死；
//   4. 权限码加载不再用会静默截断的 GROUP_CONCAT。

const read = (p) => fs.readFileSync(p, 'utf8')

const migration = read(
  'backend/platform-server/src/main/resources/db/migration/V79__fine_grained_roles_and_special_permissions.sql'
)
const accessControl = read(
  'backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/AccessControlService.java'
)
const configService = read(
  'backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/SystemConfigService.java'
)
const databaseAuth = read(
  'backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/DatabaseAuthService.java'
)
const execution = read(
  'backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java'
)
const tests = read(
  'backend/platform-server/src/test/java/com/yuri/aiorder/auth/FineGrainedRoleTests.java'
)

const failures = []

const roleCodes = [
  'CLINIC_ADMIN', 'CLINIC_DOCTOR', 'CLINIC_FRONTDESK', 'CLINIC_ASSISTANT',
  'CS_MANAGER', 'CS_SENIOR', 'CS_AGENT', 'CS_TRANSLATOR', 'CS_RECEIVER', 'CS_SHIPPER',
  'PROD_MANAGER', 'PROD_SUPERVISOR', 'PROD_TEAM_LEAD', 'PROD_TECHNICIAN',
  'PROD_QC', 'PROD_FINAL_QC', 'PROD_DATA_REVIEWER',
  'ADMIN_MANAGER', 'ADMIN_SUPERVISOR', 'ADMIN_STAFF'
]
roleCodes
  .filter((code) => !migration.includes(`'${code}'`))
  .forEach((code) => failures.push(`V79 missing role: ${code}`))

const permissionCodes = [
  'check:gate-inspect', 'check:sample-inspect',
  'rework:register-internal', 'rework:confirm-responsibility',
  'logistics:receive', 'logistics:ship', 'message:translate', 'production:review-data'
]
permissionCodes
  .filter((code) => !migration.includes(`'${code}'`))
  .forEach((code) => failures.push(`V79 missing permission: ${code}`))

const required = [
  // 组长 / 质检员分工
  [accessControl, 'AccessControlService.java', 'public void requireGateInspection('],
  [accessControl, 'AccessControlService.java', 'public void requireSampleInspection('],
  [execution, 'WorkflowExecutionService.java', 'accessControlService.requireSampleInspection(identity)'],
  [execution, 'WorkflowExecutionService.java', 'accessControlService.requireGateInspection(identity)'],
  [execution, 'WorkflowExecutionService.java', 'case 3 -> "SAMPLE"'],
  // 内返登记 / 责任确认
  [execution, 'WorkflowExecutionService.java', '"rework:confirm-responsibility"'],
  // 终检不合格退回负责部门组长
  [execution, 'WorkflowExecutionService.java', 'resolveTeamLeadRoute'],
  [execution, 'WorkflowExecutionService.java', "r.role_code = 'PROD_TEAM_LEAD'"],
  [migration, 'V79 migration', 'ADD COLUMN routed_dept_id'],
  // 待澄清项做成开关
  [migration, 'V79 migration', 'CREATE TABLE system_config'],
  [migration, 'V79 migration', "'role.cs-senior.enabled'"],
  [migration, 'V79 migration', "'role.admin.can-operate-production'"],
  [migration, 'V79 migration', "'role.production-data-reviewer.successor'"],
  [configService, 'SystemConfigService.java', 'adminCanOperateProduction()'],
  [accessControl, 'AccessControlService.java', 'public void requireProductionOperator('],
  // 权限加载不得再用 GROUP_CONCAT
  [databaseAuth, 'DatabaseAuthService.java', 'group_concat_max_len'],
  // 测试
  [tests, 'FineGrainedRoleTests.java', 'allTwentyFineGrainedRolesAreSeededAsConfigurationData'],
  [tests, 'FineGrainedRoleTests.java', 'teamLeadDoesGateInspectionWhileQualityInspectorOnlyDoesSampling'],
  [tests, 'FineGrainedRoleTests.java', 'receiverAndShipperSeeOnlyTheirOwnScope'],
  [tests, 'FineGrainedRoleTests.java', 'adminDelegationOfProductionOperationIsDrivenByConfigurationSwitch'],
  [tests, 'FineGrainedRoleTests.java', 'permissionListIsNotTruncatedWhenRoleHasManyCodes']
]

required
  .filter(([content, , fragment]) => !content.includes(fragment))
  .forEach(([, file, fragment]) => failures.push(`${file} missing: ${fragment}`))

// 只看代码行，注释里解释这段历史的地方不算回归。
const databaseAuthCode = databaseAuth
  .split('\n')
  .filter((line) => !/^\s*(\*|\/\/|\/\*)/.test(line))
  .join('\n')
if (databaseAuthCode.includes('GROUP_CONCAT')) {
  failures.push('DatabaseAuthService: GROUP_CONCAT 回归，权限码会在超过 group_concat_max_len 时被静默截断')
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('TASK-034 B 细分角色与专项权限检查通过')
