import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/AuthProperties.java', [
    'boolean allowRoleFallback',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/PermissionInterceptor.java', [
    'properties.allowRoleFallback()',
    'requirement.value().length > 0',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/AuthStartupValidator.java', [
    'APP_AUTH_ALLOW_ROLE_FALLBACK must be false in prod',
  ]],
  ['backend/platform-server/src/main/resources/application.yml', [
    'allow-role-fallback: ${APP_AUTH_ALLOW_ROLE_FALLBACK:true}',
  ]],
  ['backend/platform-server/src/main/resources/application-prod.yml', [
    'allow-role-fallback: false',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/auth/StrictPermissionModeTests.java', [
    'strictPermissionModeRejectsRoleOnlyTokenWhenPermissionCodeIsRequired',
    'strictPermissionModeAllowsTokenWithRequiredPermissionCode',
    'app.auth.allow-role-fallback=false',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/auth/AuthStartupValidatorTests.java', [
    'prodProfileRejectsEnabledRoleFallback',
  ]],
  ['.env.example', [
    'APP_AUTH_ALLOW_ROLE_FALLBACK=true',
  ]],
  ['deploy/env/phase-one.prod.example', [
    'APP_AUTH_ALLOW_ROLE_FALLBACK=false',
  ]],
  ['deploy/docker-compose.phase-one.yml', [
    'APP_AUTH_ALLOW_ROLE_FALLBACK: "false"',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.75',
    'APP_AUTH_ALLOW_ROLE_FALLBACK=false',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '9D.75',
    'APP_AUTH_ALLOW_ROLE_FALLBACK=false',
  ]],
  ['docs/deployment/task-8-final-readiness-report.md', [
    '9D.75',
    '权限码优先模式',
  ]],
  ['docs/acceptance/phase-one-frontend-alignment.md', [
    '9D.75',
    '权限码优先模式',
  ]],
  ['docs/acceptance/phase-one-frontend-task-scope.md', [
    '9D.75',
    '权限码优先模式',
  ]],
  ['STATUS.md', [
    '9D.75 正式鉴权与 DataScope 收口第一段',
  ]],
  ['DECISIONS.md', [
    'D-126 任务 9D.75 正式鉴权与 DataScope 收口第一段',
  ]],
  ['tasks/README.md', [
    '任务 9D.75：正式鉴权与 DataScope 收口第一段',
  ]],
  ['README.md', [
    '9D.75 正式鉴权与 DataScope 收口第一段',
    'check:task9d75',
  ]],
  ['acceptance.json', [
    'task-9d75-auth-datascope-strict-permission-required-text',
  ]],
  ['package.json', [
    'check:task9d75',
  ]],
]

for (const [file, patterns] of checks) {
  if (!fs.existsSync(file)) {
    console.error(`${file} missing required file`)
    process.exit(1)
  }
  const text = fs.readFileSync(file, 'utf8')
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      console.error(`${file} missing required text: ${pattern}`)
      process.exit(1)
    }
  }
}

console.log('task 9D.75 auth datascope strict permission check ok')
