import fs from 'node:fs'
import { requireCurrentPointerAtOrAfter } from './stage-check-helpers.mjs'

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

const acceptance = JSON.parse(read('acceptance.json') || '{}')
requireCurrentPointerAtOrAfter(acceptance, fs, failures, 'GOAL-016')
if (!Array.isArray(acceptance.goals) || !acceptance.goals.some((goal) => goal.id === 'GOAL-016')) {
  failures.push('acceptance.json missing GOAL-016 checks')
}

requireText('goals/GOAL-016-auth-datascope-production-closure-b-20260707.md', [
  '# GOAL-016 Auth / DataScope Production Closure B',
  '权限 / DataScope 生产化补强 B',
  'refresh token rotation',
  'Task 8 remains `NOT_READY`',
  'auth-datascope-prod'
])

requireText('tasks/TASK-017-auth-datascope-production-closure-b-20260707.md', [
  '# TASK-017 Auth / DataScope Production Closure B',
  'Goal: `goals/GOAL-016-auth-datascope-production-closure-b-20260707.md`',
  '## Checklist',
  'Scope:',
  'Non-goals:',
  'Acceptance:',
  'Verification:',
  'Stage machine check',
  'Refresh token rotation regression',
  'Refresh token rotation implementation',
  'RepoFrame and readiness writeback'
])

requireText('package.json', [
  'check:auth-datascope-prod-closure-b',
  'scripts/check-auth-datascope-production-closure-b.mjs'
])

requireText('backend/platform-server/src/test/java/com/yuri/aiorder/auth/BearerIdentityTests.java', [
  'refreshTokenRotatesAndRejectsOldTokenReuse',
  'assertNotEquals',
  'rotatedRefreshToken'
])

requireText('backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/RefreshTokenService.java', [
  'rotate(String refreshToken)',
  'revokeByHash(tokenHash)',
  'return issue(row.userId())'
])

requireText('backend/platform-server/src/main/java/com/yuri/aiorder/bootstrap/BootstrapAuthController.java', [
  'refreshTokenService.rotate(request.refreshToken())',
  'refreshToken.token()',
  'refreshToken.expiresAt()'
])

requireText('scripts/check-auth-refresh.mjs', [
  '轮换 refreshToken',
  'refreshTokenRotatesAndRejectsOldTokenReuse'
])

requireText('docs/api/openapi.yaml', [
  '使用仍有效且未登出的 refresh token 返回新的 accessToken，并轮换 refreshToken',
  '刷新成功，返回新的 accessToken 和轮换后的 refreshToken',
  '客户端必须替换本地保存的 refreshToken'
])

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
    'GOAL-016',
    'TASK-017',
    '权限 / DataScope 生产化补强 B',
    'check:auth-datascope-prod-closure-b',
    'refresh token 轮换',
    'Task 8'
  ])
}

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
  'goals/GOAL-016-auth-datascope-production-closure-b-20260707.md',
  'tasks/TASK-017-auth-datascope-production-closure-b-20260707.md',
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
    'auth-datascope-prod 已 READY',
    '完整 Spring Security/JWT 已完成',
    '完整 RuoYi DataScope 已完成',
    '通用 SQL DataScope 拦截器已完成',
    'access token 黑名单已完成',
    '生产多设备会话策略已完成',
    '真实环境验收已完成',
    '客户签字已完成'
  ])
}

if (failures.length > 0) {
  console.error('auth datascope production closure B check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('auth datascope production closure B check ok')
