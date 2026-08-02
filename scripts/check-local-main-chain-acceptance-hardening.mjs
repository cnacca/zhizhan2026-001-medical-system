import fs from 'node:fs'

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

const goalNumber = (goalId) => {
  const match = /^GOAL-(\d+)$/.exec(goalId || '')
  return match ? Number(match[1]) : Number.NaN
}

const requireCurrentPointerAtOrAfter = (minimumGoalId) => {
  const activeGoalNumber = goalNumber(acceptance.active_goal)
  const minimumGoalNumber = goalNumber(minimumGoalId)
  if (!Number.isFinite(activeGoalNumber) || activeGoalNumber < minimumGoalNumber) {
    failures.push(`acceptance.json active_goal expected ${minimumGoalId} or later, got ${acceptance.active_goal}`)
  }
  if (!acceptance.active_goal_file || !fs.existsSync(acceptance.active_goal_file)) {
    failures.push(`acceptance.json active_goal_file does not exist: ${acceptance.active_goal_file}`)
  }
  if (!acceptance.active_task_file || !fs.existsSync(acceptance.active_task_file)) {
    failures.push(`acceptance.json active_task_file does not exist: ${acceptance.active_task_file}`)
  }
}

requireCurrentPointerAtOrAfter('GOAL-018')

if (!Array.isArray(acceptance.goals) || !acceptance.goals.some((goal) => goal.id === 'GOAL-018')) {
  failures.push('acceptance.json missing GOAL-018 checks')
}

requireText('goals/GOAL-018-local-main-chain-acceptance-hardening-20260707.md', [
  '# GOAL-018 Local Main Chain Acceptance Hardening',
  'Status: `completed`',
  'local-main-chain-acceptance-hardening',
  'Task 8 as `NOT_READY`',
  '本地 12 步主链路自动化与验收记录增强',
  'Do not claim customer signature',
  'Do not claim real environment acceptance'
])

requireText('tasks/TASK-019-local-main-chain-acceptance-hardening-20260707.md', [
  '# TASK-019 Local Main Chain Acceptance Hardening',
  'Goal: `goals/GOAL-018-local-main-chain-acceptance-hardening-20260707.md`',
  '## Checklist',
  'Scope:',
  'Non-goals:',
  'Acceptance:',
  'Verification:',
  'Stage machine check',
  '12-step smoke diagnostics and role assertions',
  'Customer-readable acceptance record writeback',
  'Task 8 readiness boundary writeback'
])

requireText('package.json', [
  'check:local-main-chain-acceptance-hardening',
  'scripts/check-local-main-chain-acceptance-hardening.mjs',
  'check:task9d62',
  'smoke:task9d62',
  'check:task9d68',
  'check:task8-readiness-gaps'
])

requireText('scripts/check-task-9d62-main-chain-browser-smoke.mjs', [
  'GOAL-018',
  'assertDoctorSafeProjection',
  'assertCsInternalVisibility',
  'assertWorkerTaskScope',
  'assertAdminAssignmentAndReassignment',
  'task 9D.62.GOAL018 role boundary assertions ok'
])

requireText('scripts/smoke-task-9d62-main-chain.spec.mjs', [
  'assertDoctorSafeProjection',
  'assertCsInternalVisibility',
  'assertWorkerTaskScope',
  'assertAdminAssignmentAndReassignment',
  'doctor forbidden internal field',
  'task 9D.62.GOAL018 role boundary assertions ok',
  'roleAssertions'
])

for (const [file, fragments] of [
  ['STATUS.md', ['GOAL-018', 'TASK-019', '本地 12 步主链路验收增强', 'check:local-main-chain-acceptance-hardening', 'Task 8 仍保持 `NOT_READY`']],
  ['PROJECT.md', ['GOAL-018', 'TASK-019', '本地 12 步主链路验收增强', '医生端脱敏', '客服端可见性', '生产端任务范围', '管理端派工 / 转派', 'Task 8 仍保持 `NOT_READY`']],
  ['tasks/README.md', ['任务 019：本地 12 步主链路验收增强', 'GOAL-018', 'TASK-019', 'Scope', 'Non-goals', 'Acceptance', 'Verification', 'Task 8 仍保持 NOT_READY']],
  ['README.md', ['GOAL-018', 'TASK-019', '本地 12 步主链路验收增强', 'npm run check:local-main-chain-acceptance-hardening', 'Task 8 继续保持 `NOT_READY`']],
  ['DECISIONS.md', ['D-158 GOAL-018 本地 12 步主链路验收增强', 'local-main-chain-acceptance-hardening', '不伪造客户签字', 'Task 8 仍保持 `NOT_READY`']],
  ['docs/acceptance/phase-one-main-chain-customer-acceptance.md', ['GOAL-018', 'TASK-019', '角色边界增强断言', '医生端脱敏', '客服端可见性', '生产端任务范围', '管理端派工 / 转派', 'FIRST_INCREMENT / NOT_READY']],
  ['docs/acceptance/prd-v2-gap-matrix.md', ['GOAL-018', 'TASK-019', '本地 12 步主链路验收增强', '订单主链路', 'PARTIAL']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['GOAL-018', 'TASK-019', '本地 12 步主链路验收增强', 'Task 8 仍保持 `NOT_READY`']],
  ['docs/deployment/readiness-checklist.md', ['GOAL-018', 'TASK-019', '本地 12 步主链路验收增强', '订单主链路', 'PARTIAL']],
  ['docs/deployment/task-8-final-readiness-report.md', ['GOAL-018', 'TASK-019', '本地 12 步主链路验收增强', 'Task 8']]
]) {
  requireText(file, fragments)
}

for (const [gapId, expectedStatus] of [
  ['frontend-business-pages', 'PARTIAL'],
  ['prd-v2-local-feature-gaps', 'PARTIAL'],
  ['customer-pm-confirmations', 'PARTIAL'],
  ['ai-production-governance', 'PARTIAL'],
  ['deployment-infrastructure', 'PARTIAL'],
  ['operations-manuals', 'PARTIAL']
]) {
  const gap = acceptance.task8_readiness_gaps?.find((item) => item.id === gapId)
  if (!gap || gap.status !== expectedStatus) {
    failures.push(`acceptance.json expected ${gapId} to remain ${expectedStatus}`)
  }
}

for (const file of [
  'goals/GOAL-018-local-main-chain-acceptance-hardening-20260707.md',
  'tasks/TASK-019-local-main-chain-acceptance-hardening-20260707.md',
  'STATUS.md',
  'PROJECT.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/phase-one-main-chain-customer-acceptance.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md',
  'docs/deployment/task-8-final-readiness-report.md'
]) {
  forbidText(file, [
    'Task 8 状态：READY',
    'Task 8 已 READY',
    '状态：客户签字已完成',
    '结论：客户签字已完成',
    '客户/PM 签字状态：已确认',
    '客户/PM 签字状态：已签字',
    '状态：真实环境验收已完成',
    '结论：真实环境验收已完成',
    '状态：真实 DeepSeek key 已联调完成',
    '结论：真实 DeepSeek key 已联调完成',
    '状态：生产 webhook 已联调完成',
    '结论：生产 webhook 已联调完成',
    '状态：真实支付平台已接入并验收',
    '结论：真实支付平台已接入并验收',
    '状态：真实物流平台已接入并验收',
    '结论：真实物流平台已接入并验收',
    '状态：真实电子签章已完成',
    '结论：真实电子签章已完成',
    '状态：HTTPS 已验收完成',
    '结论：HTTPS 已验收完成'
  ])
}

if (failures.length > 0) {
  console.error('local main-chain acceptance hardening check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('local main-chain acceptance hardening check ok')
