import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const styles = fs.readFileSync('frontend/src/styles.css', 'utf8')
const controller = fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/bootstrap/BootstrapAuthController.java', 'utf8')
const tests = fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/auth/BearerIdentityTests.java', 'utf8')
const openapi = fs.readFileSync('docs/api/openapi.yaml', 'utf8')
const smoke = fs.readFileSync('scripts/smoke-task-9d24-four-portal-login.spec.mjs', 'utf8')
const packageJson = fs.readFileSync('package.json', 'utf8')

const requiredAppFragments = [
  'type LoginPortal',
  'selectedPortal',
  'portalOptions',
  'login-brand',
  'precision_manufacturing',
  '智能下单与生产协同平台',
  '快速登录通道',
  '仅用于授权账号访问',
  '医生端',
  '客服端',
  '生产端',
  '管理端',
  'stethoscope',
  'support_agent',
  'factory',
  'admin_panel_settings',
  'selectPortal',
  'portalDefaultRoute',
  'body: JSON.stringify({ username: username.value, password: password.value, portal: selectedPortal.value })',
  "DOCTOR: '/dashboard'",
  "CS: '/dashboard'",
  "PRODUCTION: '/dashboard'",
  "ADMIN: '/dashboard'"
]

const requiredStyleFragments = [
  '.login-shell',
  '.login-brand',
  '.login-card',
  '.portal-grid',
  '.portal-card',
  '.portal-login-panel',
  '.portal-icon'
]

const requiredBackendFragments = [
  'enum LoginPortal',
  'requirePortalRole',
  'case PRODUCTION -> "WORKER"',
  'account role does not match login portal'
]

const requiredTestFragments = [
  'databaseLoginRequiresPortalAndMatchesRoleToPortal',
  '\\"portal\\":\\"PRODUCTION\\"',
  'status().isForbidden()',
  'status().isBadRequest()'
]

const requiredOpenApiFragments = [
  'portal:',
  'DOCTOR',
  'CS',
  'PRODUCTION',
  'ADMIN',
  '登录入口'
]

const requiredSmokeFragments = [
  "portal-card-DOCTOR",
  "portal-card-CS",
  "portal-card-PRODUCTION",
  "portal-card-ADMIN",
  "账号角色与所选入口不匹配",
  "TASK9D24_BROWSER_CHANNEL",
  "task 9D.24 mismatched portal smoke ok"
]

const requiredPackageFragments = [
  "smoke:task9d24",
  "scripts/smoke-task-9d24-four-portal-login.spec.mjs"
]

const missing = [
  ...requiredAppFragments.filter((fragment) => !app.includes(fragment)).map((fragment) => `frontend/src/App.vue -> ${fragment}`),
  ...requiredStyleFragments.filter((fragment) => !styles.includes(fragment)).map((fragment) => `frontend/src/styles.css -> ${fragment}`),
  ...requiredBackendFragments.filter((fragment) => !controller.includes(fragment)).map((fragment) => `BootstrapAuthController.java -> ${fragment}`),
  ...requiredTestFragments.filter((fragment) => !tests.includes(fragment)).map((fragment) => `BearerIdentityTests.java -> ${fragment}`),
  ...requiredOpenApiFragments.filter((fragment) => !openapi.includes(fragment)).map((fragment) => `docs/api/openapi.yaml -> ${fragment}`),
  ...requiredSmokeFragments.filter((fragment) => !smoke.includes(fragment)).map((fragment) => `smoke-task-9d24-four-portal-login.spec.mjs -> ${fragment}`),
  ...requiredPackageFragments.filter((fragment) => !packageJson.includes(fragment)).map((fragment) => `package.json -> ${fragment}`)
]

if (missing.length > 0) {
  console.error('task 9D.24 four portal login check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.24 four portal login check ok')
