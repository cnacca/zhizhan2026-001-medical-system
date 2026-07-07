import fs from 'node:fs'
import path from 'node:path'

const failures = []

const read = (file) => {
  if (!fs.existsSync(file)) {
    failures.push(`${file} missing`)
    return ''
  }
  return fs.readFileSync(file, 'utf8')
}

const requireText = (file, fragments) => {
  const content = read(file)
  for (const fragment of fragments) {
    if (!content.includes(fragment)) {
      failures.push(`${file} missing required text: ${fragment}`)
    }
  }
}

const forbidText = (file, fragments) => {
  const content = read(file)
  for (const fragment of fragments) {
    if (content.includes(fragment)) {
      failures.push(`${file} contains forbidden text: ${fragment}`)
    }
  }
}

const listFiles = (dir, predicate, results = []) => {
  if (!fs.existsSync(dir)) return results
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      listFiles(fullPath, predicate, results)
    } else if (predicate(fullPath)) {
      results.push(fullPath)
    }
  }
  return results
}

const acceptance = JSON.parse(read('acceptance.json') || '{}')
if (!String(acceptance.active_goal || '').startsWith('GOAL-')) {
  failures.push(`acceptance.json active_goal must remain a RepoFrame goal, got ${acceptance.active_goal}`)
}
if (!acceptance.active_goal_file || !fs.existsSync(acceptance.active_goal_file)) {
  failures.push(`acceptance.json active_goal_file must point to an existing goal file, got ${acceptance.active_goal_file}`)
}
if (!Array.isArray(acceptance.goals) || !acceptance.goals.some((goal) => goal.id === 'GOAL-012' && goal.status === 'completed')) {
  failures.push('acceptance.json missing GOAL-012 checks')
}

requireText('goals/GOAL-012-auth-datascope-production-closure-20260707.md', [
  '# GOAL-012 Auth / DataScope Production Closure',
  'Task 8 remains `NOT_READY`',
  'auth-datascope-prod',
  'roles-only',
  'GOAL-011 remains completed'
])

requireText('tasks/TASK-013-auth-datascope-production-closure-20260707.md', [
  '# TASK-013 Auth / DataScope Production Closure',
  'Goal: `goals/GOAL-012-auth-datascope-production-closure-20260707.md`',
  '## Checklist',
  'Scope:',
  'Non-goals:',
  'Acceptance:',
  'Verification:',
  'Strict permission-code gate',
  'Roles-only annotation inventory',
  'RepoFrame and readiness writeback'
])

requireText('package.json', [
  'check:auth-datascope-prod-closure',
  'scripts/check-auth-datascope-production-closure.mjs'
])

requireText('backend/platform-server/src/test/java/com/yuri/aiorder/auth/StrictPermissionModeTests.java', [
  'strictPermissionModeRejectsDoctorAccountRoleOnlyTokenWhenPermissionCodeIsRequired',
  'strictPermissionModeAllowsDoctorAccountTokenWithRequiredPermissionCode',
  'account:doctor'
])

requireText('backend/platform-server/src/main/resources/db/migration/V36__auth_permission_code_completion.sql', [
  'clinic:read-internal',
  'clinic:read-self',
  'clinic:create',
  'clinic:preference:write',
  'account:doctor',
  'notification:read-self',
  'notification:write-self'
])

for (const [file, fragments] of [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/clinic/ClinicController.java', [
    'value = "clinic:read-internal"',
    'value = "clinic:create"',
    'clinic:read-self',
    'value = "clinic:preference:write"'
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/account/DoctorAccountController.java', [
    'value = "account:doctor"'
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/notification/NotificationController.java', [
    'value = "notification:read-self"',
    'value = "notification:write-self"'
  ]]
]) {
  requireText(file, fragments)
}

for (const file of listFiles('backend/platform-server/src/main/java/com/yuri/aiorder', (name) => name.endsWith('.java'))) {
  const content = read(file)
  if (/@RequirePermission\s*\(\s*roles\s*=/.test(content)) {
    failures.push(`${file} still has roles-only @RequirePermission`)
  }
}

for (const file of [
  'STATUS.md',
  'PROJECT.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md',
  'docs/deployment/task-8-final-readiness-report.md'
]) {
  requireText(file, [
    'GOAL-012',
    'TASK-013',
    '权限 / DataScope 生产化收口第一段',
    'check:auth-datascope-prod-closure',
    'Task 8'
  ])
}

requireText('acceptance.json', [
  'GOAL-012',
  'goals/GOAL-012-auth-datascope-production-closure-20260707.md',
  'tasks/TASK-013-auth-datascope-production-closure-20260707.md',
  'check:auth-datascope-prod-closure',
  'auth-datascope-production-closure-entry-docs',
  'auth-datascope-production-closure-no-fake-ready'
])

for (const [gapId, expectedStatus] of [
  ['auth-datascope-prod', 'PARTIAL'],
  ['customer-pm-confirmations', 'BLOCKED'],
  ['ai-production-governance', 'PARTIAL'],
  ['deployment-infrastructure', 'PARTIAL'],
  ['prd-v2-local-feature-gaps', 'PARTIAL']
]) {
  const gap = acceptance.task8_readiness_gaps?.find((item) => item.id === gapId)
  if (!gap || gap.status !== expectedStatus) {
    failures.push(`acceptance.json expected ${gapId} to remain ${expectedStatus}`)
  }
}

for (const file of [
  'goals/GOAL-012-auth-datascope-production-closure-20260707.md',
  'tasks/TASK-013-auth-datascope-production-closure-20260707.md',
  'STATUS.md',
  'PROJECT.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md',
  'docs/deployment/task-8-final-readiness-report.md'
]) {
  forbidText(file, [
    'Task 8 状态：READY',
    'Task 8 已 READY',
    '完整 Spring Security/JWT 已完成',
    '完整 RuoYi DataScope 已完成',
    '通用 SQL DataScope 拦截器已完成',
    '生产多设备会话策略已完成',
    '真实环境验收已完成',
    '客户签字已完成'
  ])
}

if (failures.length > 0) {
  console.error('auth datascope production closure check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('auth datascope production closure check ok')
