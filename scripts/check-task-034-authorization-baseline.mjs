import fs from 'node:fs'
import path from 'node:path'

// TASK-034 A 批次：授权底座统一。
// 守住三件事：
//   1. 服务层不再有「不看权限码」的判定；
//   2. bootstrap 身份带上入口角色的权限码，删权限码会真的 403；
//   3. 数据范围解析顺序为 用户级覆盖 > 角色级配置 > 入口角色默认值。

const read = (p) => fs.readFileSync(p, 'utf8')

const accessControl = read(
  'backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/AccessControlService.java'
)
const databaseAuth = read(
  'backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/DatabaseAuthService.java'
)
const identityFactory = read(
  'backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/BootstrapIdentityFactory.java'
)
const catalog = read(
  'backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/RolePermissionCatalog.java'
)
const migration = read(
  'backend/platform-server/src/main/resources/db/migration/V78__authorization_baseline_permission_codes.sql'
)
const tests = read(
  'backend/platform-server/src/test/java/com/yuri/aiorder/auth/AuthorizationBaselineTests.java'
)
const vocabulary = read('docs/development/status-vocabulary.md')

const failures = []

const required = [
  [accessControl, 'AccessControlService.java', 'public void requirePermission('],
  [accessControl, 'AccessControlService.java', 'public void requireAnyPermission('],
  [accessControl, 'AccessControlService.java', '入口角色 / Portal'],
  [accessControl, 'AccessControlService.java', 'requirePermission(identity, "workflow:review-production"'],
  [accessControl, 'AccessControlService.java', 'identity.hasPermission("workflow:assign")'],
  [accessControl, 'AccessControlService.java', 'identity.hasPermission("performance:read-all")'],
  [catalog, 'RolePermissionCatalog.java', 'FROM system_role r'],
  [identityFactory, 'BootstrapIdentityFactory.java', 'rolePermissionCatalog.forRole(role)'],
  [databaseAuth, 'DatabaseAuthService.java', 'u.data_scope AS user_data_scope'],
  [databaseAuth, 'DatabaseAuthService.java', 'private UserRole toPortalRole(String roleCode)'],
  [migration, 'V78 migration', 'ADD COLUMN data_scope VARCHAR(32) NULL'],
  [migration, 'V78 migration', "p.permission_code = 'workflow:assign'"],
  [tests, 'AuthorizationBaselineTests.java', 'removingPermissionCodeFromRoleDeniesAccessEvenWhenPortalRoleMatches'],
  [tests, 'AuthorizationBaselineTests.java', 'userLevelDataScopeOverridesRoleLevelConfiguration'],
  [tests, 'AuthorizationBaselineTests.java', 'newFineGrainedRoleGetsAccessPurelyThroughConfiguration'],
  [vocabulary, 'status-vocabulary.md', '`UserRole` 是「入口角色 / Portal」，不是业务角色']
]

required
  .filter(([content, , fragment]) => !content.includes(fragment))
  .forEach(([, file, fragment]) => failures.push(`${file} missing: ${fragment}`))

// 服务层不得再出现纯角色白名单判定。
const mainRoot = 'backend/platform-server/src/main/java'
const javaFiles = []
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.name.endsWith('.java')) javaFiles.push(full)
  }
}
walk(mainRoot)

const offenders = javaFiles.filter((file) => read(file).includes('requireAnyRole('))
if (offenders.length > 0) {
  failures.push(`仍存在纯角色白名单判定 requireAnyRole：\n  ${offenders.join('\n  ')}`)
}

// 旧的「入口角色即 ALL」短路不得回归。
if (databaseAuth.includes('primaryRole == UserRole.ADMIN || primaryRole == UserRole.CS')) {
  failures.push('DatabaseAuthService: 入口角色短路回归，角色级 data_scope 会再次失效')
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('TASK-034 A 授权底座检查通过')
