import fs from 'node:fs'

const read = (file) => fs.readFileSync(file, 'utf8')
const seed = read('scripts/seed-admin-portal-demo-data.sql')
const seedLauncher = read('scripts/seed-admin-portal-demo-data.sh')
const databaseAuth = read(
  'backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/DatabaseAuthService.java'
)
const designService = read(
  'backend/platform-server/src/main/java/com/yuri/aiorder/design/DesignTaskService.java'
)
const menuTests = read(
  'backend/platform-server/src/test/java/com/yuri/aiorder/auth/FineGrainedRoleTests.java'
)
const demoChecker = read('scripts/check-demo-data.mjs')
const designRoleAlignment = read(
  'backend/platform-server/src/main/resources/db/migration/V88__align_design_internal_review_role.sql'
)

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

requireFragment(acceptanceSeed, 'production acceptance grants', "'design-draft:internal-review'")
requireFragment(demoChecker, 'demo checker', "'design-draft:internal-review'")

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

requireFragment(databaseAuth, 'DatabaseAuthService', 'loadMenus(row.userId(), fineGrainedRolesOnly)')
requireFragment(databaseAuth, 'DatabaseAuthService', 'loadMenus(identity.userId(), hasFineGrainedRole(identity.userId()))')
requireFragment(
  databaseAuth,
  'DatabaseAuthService menu permission filter',
  "OR permission_role.role_code NOT IN ('ADMIN', 'CS', 'WORKER', 'DOCTOR')"
)
requireFragment(databaseAuth, 'DatabaseAuthService direct menu permissions', 'FROM system_user_permission user_permission')

requireFragment(
  designService,
  'DesignTaskService',
  'identity.role() == UserRole.WORKER'
)
requireFragment(designRoleAlignment, 'design role alignment', "role.role_code = 'CS_MANAGER'")
requireFragment(designRoleAlignment, 'design role alignment', "role.role_code = 'PROD_TEAM_LEAD'")
requireFragment(menuTests, 'FineGrainedRoleTests', 'doesNotContain("product-catalog")')
requireFragment(menuTests, 'FineGrainedRoleTests', 'grantDirectPermission(CS_USER_ID, "product:manage")')

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('四端验收账号 RBAC 与端口边界检查通过')
