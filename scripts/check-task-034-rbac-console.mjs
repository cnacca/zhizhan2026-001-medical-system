import fs from 'node:fs'

// TASK-034 C 批次：管理端角色 / 权限 / 组织管理（客户 CHK064-066）。
// 守住四件事：
//   1. 授权边界是可判定的数据（role_level + rbac:cross-dept），不是写死的角色名；
//   2. 高风险操作全部留痕，且记录修改前后内容；
//   3. 密码只能重置不能查看；
//   4. 管理端是可实操界面，不是只读展示。

const read = (p) => fs.readFileSync(p, 'utf8')

const migration = read(
  'backend/platform-server/src/main/resources/db/migration/V80__rbac_administration_console.sql'
)
const service = read('backend/platform-server/src/main/java/com/yuri/aiorder/rbac/RbacAdminService.java')
const controller = read('backend/platform-server/src/main/java/com/yuri/aiorder/rbac/RbacAdminController.java')
const page = read('frontend/src/components/AdminRbacPages.vue')
const app = read('frontend/src/App.vue')
const openapi = read('docs/api/openapi.yaml')
const tests = read('backend/platform-server/src/test/java/com/yuri/aiorder/rbac/RbacAdminTests.java')

const failures = []

const required = [
  // 授权边界落成数据
  [migration, 'V80 migration', 'ADD COLUMN role_level INT NOT NULL DEFAULT 30'],
  [migration, 'V80 migration', "'rbac:cross-dept'"],
  [service, 'RbacAdminService.java', 'private void requireCanGrantLevel('],
  [service, 'RbacAdminService.java', 'private void requireSameDeptScope('],
  [service, 'RbacAdminService.java', 'private void requireGrantableCodes('],
  // 入口角色不参与自身等级计算（否则所有边界失效）
  [service, 'RbacAdminService.java', "r.role_code NOT IN ('CS', 'WORKER', 'DOCTOR')"],
  // 账号安全权限与业务数据权限分离
  [migration, 'V80 migration', "'account:create'"],
  [migration, 'V80 migration', "'account:disable'"],
  [migration, 'V80 migration', "'account:reset-password'"],
  [controller, 'RbacAdminController.java', '@RequirePermission(value = "account:disable"'],
  [controller, 'RbacAdminController.java', '@RequirePermission(value = "account:reset-password"'],
  // 留痕
  [migration, 'V80 migration', 'CREATE TABLE system_rbac_audit'],
  [migration, 'V80 migration', 'before_value JSON NULL'],
  [service, 'RbacAdminService.java', 'INSERT INTO system_rbac_audit'],
  // 可实操界面
  [page, 'AdminRbacPages.vue', '@submit.prevent="createRole"'],
  [page, 'AdminRbacPages.vue', '@click="savePermissions"'],
  [page, 'AdminRbacPages.vue', '@submit.prevent="createDept"'],
  [page, 'AdminRbacPages.vue', 'assignUserRoles(user'],
  [page, 'AdminRbacPages.vue', 'toggleUserStatus(user)'],
  [page, 'AdminRbacPages.vue', 'resetPassword(user)'],
  [app, 'App.vue', 'adminRbacRoutePaths'],
  [app, 'App.vue', "routePath: '/admin/rbac/roles'"],
  [app, 'App.vue', "routePath: '/admin/rbac/matrix'"],
  // 契约
  [openapi, 'openapi.yaml', 'getRbacMatrix'],
  [openapi, 'openapi.yaml', 'postRbacPasswordReset'],
  // 越权测试
  [tests, 'RbacAdminTests.java', 'managerCannotGrantAdminOrManagerLevelRole'],
  [tests, 'RbacAdminTests.java', 'supervisorCannotAssignAcrossDepartments'],
  [tests, 'RbacAdminTests.java', 'managerCannotGrantPermissionCodeTheyDoNotHold'],
  [tests, 'RbacAdminTests.java', 'passwordCanOnlyBeResetNeverRead'],
  [tests, 'RbacAdminTests.java', 'accountSecurityPermissionsAreSeparateFromBusinessPermissions']
]

required
  .filter(([content, , fragment]) => !content.includes(fragment))
  .forEach(([, file, fragment]) => failures.push(`${file} missing: ${fragment}`))

// 密码不可查看：任何 RBAC 响应体都不得出现口令或散列字段。
if (/password_hash|passwordHash/.test(read('backend/platform-server/src/main/java/com/yuri/aiorder/rbac/RbacUserResponse.java'))) {
  failures.push('RbacUserResponse 暴露了口令字段，密码只能重置不能查看')
}
if (service.includes('audit("ACCOUNT", userId, target.username(), "PASSWORD_RESET", temporaryPassword')) {
  failures.push('RbacAdminService 把口令写进了审计')
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('TASK-034 C 管理端角色权限组织管理检查通过')
