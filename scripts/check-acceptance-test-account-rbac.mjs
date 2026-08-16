import fs from 'node:fs'

const read = (file) => fs.readFileSync(file, 'utf8')
const seed = read('scripts/seed-admin-portal-demo-data.sql')
const seedLauncher = read('scripts/seed-admin-portal-demo-data.sh')
const designService = read(
  'backend/platform-server/src/main/java/com/yuri/aiorder/design/DesignTaskService.java'
)
const orthodonticService = read(
  'backend/platform-server/src/main/java/com/yuri/aiorder/orthodontic/OrthodonticService.java'
)
const workflowService = read(
  'backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java'
)
const workflowController = read(
  'backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java'
)
const portalTests = read(
  'backend/platform-server/src/test/java/com/yuri/aiorder/auth/AcceptancePortalPermissionTests.java'
)
const productionWriteTests = read(
  'backend/platform-server/src/test/java/com/yuri/aiorder/production/ProductionFineGrainedWritePermissionTests.java'
)
const demoChecker = read('scripts/check-demo-data.mjs')

const failures = []
const requireFragment = (content, label, fragment) => {
  if (!content.includes(fragment)) failures.push(`${label} missing: ${fragment}`)
}

requireFragment(seedLauncher, 'demo seed launcher', 'DEMO_ISOLATED_ENV')
requireFragment(seedLauncher, 'demo seed launcher', '_demo$')

const acceptanceSeed = seed.split('INSERT INTO clinic ')[0]
if (/\busername\b/i.test(acceptanceSeed)) {
  failures.push('acceptance role assignment must not depend on usernames')
}

const accounts = [
  [9701, 'DOCTOR', 'ACCEPTANCE_DOCTOR_FULL', 'CLINIC'],
  [8002, 'CS', 'ACCEPTANCE_CS_FULL', 'ALL'],
  [9601, 'WORKER', 'ACCEPTANCE_PRODUCTION_FULL', 'ALL'],
  [8001, 'ADMIN', 'ACCEPTANCE_ADMIN_FULL', 'ALL']
]
for (const [userId, userType, roleCode, dataScope] of accounts) {
  requireFragment(
    acceptanceSeed,
    'acceptance seed',
    `(${userId}, '${userType}', '${roleCode}', '${dataScope}')`
  )
  requireFragment(demoChecker, 'demo checker', `acceptanceRole: '${roleCode}'`)
  requireFragment(demoChecker, 'demo checker', `dataScope: '${dataScope}'`)
}

const sourceRoles = [
  'DOCTOR', 'CLINIC_ADMIN', 'CLINIC_DOCTOR', 'CLINIC_FRONTDESK', 'CLINIC_ASSISTANT',
  'CS', 'CS_MANAGER', 'CS_SENIOR', 'CS_AGENT', 'CS_TRANSLATOR', 'CS_RECEIVER', 'CS_SHIPPER',
  'WORKER', 'PROD_MANAGER', 'PROD_SUPERVISOR', 'PROD_TEAM_LEAD', 'PROD_TECHNICIAN',
  'PROD_QC', 'PROD_FINAL_QC', 'PROD_DATA_REVIEWER',
  'ADMIN', 'ADMIN_MANAGER', 'ADMIN_SUPERVISOR', 'ADMIN_STAFF'
]
for (const roleCode of sourceRoles) {
  requireFragment(acceptanceSeed, 'acceptance seed source union', `'${roleCode}'`)
}

for (const permission of [
  'design-draft:internal-review',
  'workflow:orthodontic-case:read',
  'workflow:orthodontic-batch:manage',
  'production:equipment:approve',
  'production:cost:confirm'
]) {
  requireFragment(acceptanceSeed, 'production acceptance grants', `'${permission}'`)
  requireFragment(demoChecker, 'demo checker', `'${permission}'`)
}

for (const forbiddenDoctorPermission of [
  'workflow:read-internal', 'order:read-internal', 'check:read-internal',
  'file:manage-internal', 'ai:production', 'ai:governance:read'
]) {
  requireFragment(
    demoChecker,
    'doctor acceptance negative permissions',
    `'${forbiddenDoctorPermission}'`
  )
}
for (const forbiddenDoctorPrefix of [
  'workflow:', 'check:', 'staff:', 'performance:', 'worklog:',
  'rework:', 'production:', 'quality:'
]) {
  requireFragment(
    demoChecker,
    'doctor acceptance negative permission prefixes',
    `'${forbiddenDoctorPrefix}'`
  )
}
requireFragment(
  demoChecker,
  'doctor acceptance prefix enforcement',
  'permission.startsWith(prefix)'
)

const migrations = fs.readdirSync('backend/platform-server/src/main/resources/db/migration')
  .filter((name) => name.endsWith('.sql'))
  .map((name) => read(`backend/platform-server/src/main/resources/db/migration/${name}`))
  .join('\n')
if (migrations.includes('ACCEPTANCE_DOCTOR_FULL') || migrations.includes('ACCEPTANCE_PRODUCTION_FULL')) {
  failures.push('acceptance-only roles must not be added to Flyway migrations')
}

requireFragment(
  designService,
  'DesignTaskService',
  'Set.of(UserRole.ADMIN, UserRole.CS, UserRole.WORKER).contains(identity.role())'
)
requireFragment(orthodonticService, 'OrthodonticService', 'requirePortalPermission(')
requireFragment(orthodonticService, 'OrthodonticService', 'Set.of(UserRole.ADMIN, UserRole.WORKER)')
requireFragment(workflowService, 'WorkflowExecutionService', 'requireAdminOrWorkerPermission(')
for (const permission of [
  'production:equipment:write',
  'production:material:write',
  'production:safety:write',
  'production:cost:write',
  'production:reward-penalty:write'
]) {
  requireFragment(
    workflowController,
    'WorkflowExecutionController production write annotations',
    `@RequirePermission("${permission}")`
  )
  requireFragment(workflowService, 'WorkflowExecutionService production write checks', `"${permission}"`)
  requireFragment(demoChecker, 'production acceptance permissions', `'${permission}'`)
}

for (const testName of [
  'baseWorkerAndCsWithoutDedicatedPermissionsAreForbidden',
  'dedicatedPermissionsOnAllowedPortalsReachTheServiceLayer',
  'dedicatedPermissionsCannotCrossPortalBoundaries'
]) {
  requireFragment(portalTests, 'AcceptancePortalPermissionTests', testName)
}
requireFragment(
  productionWriteTests,
  'ProductionFineGrainedWritePermissionTests',
  'equipmentAndCostTerminalStatesRequireDedicatedApprovalEndpoints'
)

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('四端验收账号 RBAC 与端口边界检查通过')
