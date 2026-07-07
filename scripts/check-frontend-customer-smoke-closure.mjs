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

requireCurrentPointerAtOrAfter('GOAL-013')

if (!Array.isArray(acceptance.goals) || !acceptance.goals.some((goal) => goal.id === 'GOAL-013')) {
  failures.push('acceptance.json missing GOAL-013 checks')
}

requireText('goals/GOAL-013-frontend-customer-smoke-closure-20260707.md', [
  '# GOAL-013 Frontend Customer Smoke Closure',
  'Task 8 remains `NOT_READY`',
  'four-portal page evidence',
  '12-step browser smoke evidence',
  'customer-readable acceptance records',
  'GOAL-012 remains completed',
])

requireText('tasks/TASK-014-frontend-customer-smoke-closure-20260707.md', [
  '# TASK-014 Frontend Customer Smoke Closure',
  'Goal: `goals/GOAL-013-frontend-customer-smoke-closure-20260707.md`',
  '## Checklist',
  'Scope:',
  'Non-goals:',
  'Acceptance:',
  'Verification:',
  'Stage machine check',
  'Four-end page evidence consolidation',
  'Customer acceptance smoke consolidation',
  'RepoFrame and readiness writeback',
])

requireText('package.json', [
  'check:frontend-customer-smoke-closure',
  'scripts/check-frontend-customer-smoke-closure.mjs',
  'check:task9d24',
  'check:task9d36',
  'check:task9d62',
  'check:task9d68',
  'check:task9d70',
  'smoke:task9d24',
  'smoke:task9d36',
  'smoke:task9d62',
])

requireText('scripts/check-task-9d62-main-chain-browser-smoke.mjs', [
  'phaseOneMainChainSteps',
  'smoke:task9d62',
  '1. 医生下单',
  '2. 客服初审',
  '3. 生产审核',
  '12. 医生确认收货',
])

requireText('scripts/smoke-task-9d62-main-chain.spec.mjs', [
  'phaseOneMainChainSteps',
  'createFixedDemoOrder',
  'approveCsReview',
  'approveProductionReview',
  'assignFirstReadyNode',
  'completeAssignedNodeWithChecksAndWorklog',
  'completeDesignDraftConfirmation',
  'attachBillToOrder',
  'confirmReceiptByDoctor',
  'createReworkExceptionPath',
])

for (const [file, fragments] of [
  ['docs/acceptance/phase-one-main-chain-customer-acceptance.md', [
    '12 步主链路客户验收版',
    '状态：FIRST_INCREMENT / NOT_READY',
    'PASS/FAIL 清单',
    'npm run smoke:task9d62',
    'npm run check:task9d68',
    'Task 8 仍保持 NOT_READY',
    'GOAL-013',
    'TASK-014',
  ]],
  ['docs/acceptance/phase-one-frontend-alignment.md', [
    'GOAL-013',
    'TASK-014',
    '四端业务页面与客户验收 smoke 收口',
    'frontend-business-pages',
    'PARTIAL',
    'Task 8',
  ]],
  ['docs/acceptance/phase-one-frontend-task-scope.md', [
    'GOAL-013',
    'TASK-014',
    '四端业务页面与客户验收 smoke 收口',
    'smoke:task9d62',
  ]],
  ['docs/operations/phase-one-role-operation-manual.md', [
    '医生端',
    '客服端',
    '生产端',
    '管理端',
  ]],
]) {
  requireText(file, fragments)
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
  'docs/deployment/task-8-final-readiness-report.md',
]) {
  requireText(file, [
    'GOAL-013',
    'TASK-014',
    '四端业务页面与客户验收 smoke 收口',
    'check:frontend-customer-smoke-closure',
    'frontend-business-pages',
    'Task 8',
  ])
}

requireText('acceptance.json', [
  'GOAL-013',
  'goals/GOAL-013-frontend-customer-smoke-closure-20260707.md',
  'tasks/TASK-014-frontend-customer-smoke-closure-20260707.md',
  'check:frontend-customer-smoke-closure',
  'frontend-customer-smoke-closure-entry-docs',
  'frontend-customer-smoke-closure-no-fake-ready',
])

for (const [gapId, expectedStatus] of [
  ['frontend-business-pages', 'PARTIAL'],
  ['customer-pm-confirmations', 'BLOCKED'],
  ['ai-production-governance', 'PARTIAL'],
  ['deployment-infrastructure', 'PARTIAL'],
  ['auth-datascope-prod', 'PARTIAL'],
]) {
  const gap = acceptance.task8_readiness_gaps?.find((item) => item.id === gapId)
  if (!gap || gap.status !== expectedStatus) {
    failures.push(`acceptance.json expected ${gapId} to remain ${expectedStatus}`)
  }
}

for (const file of [
  'goals/GOAL-013-frontend-customer-smoke-closure-20260707.md',
  'tasks/TASK-014-frontend-customer-smoke-closure-20260707.md',
  'STATUS.md',
  'PROJECT.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/phase-one-main-chain-customer-acceptance.md',
  'docs/acceptance/phase-one-frontend-alignment.md',
  'docs/acceptance/phase-one-frontend-task-scope.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md',
  'docs/deployment/task-8-final-readiness-report.md',
]) {
  forbidText(file, [
    'Task 8 状态：READY',
    'Task 8 已 READY',
    '客户/PM 签字状态：已确认',
    '客户/PM 签字状态：已签字',
    '状态：客户签字已完成',
    '结论：客户签字已完成',
    '状态：客户 / PM 签字已完成',
    '结论：客户 / PM 签字已完成',
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
    '结论：HTTPS 已验收完成',
    '状态：备份恢复已验收完成',
    '结论：备份恢复已验收完成',
    '状态：监控告警已验收完成',
    '结论：监控告警已验收完成',
  ])
}

if (failures.length > 0) {
  console.error('frontend customer smoke closure check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('frontend customer smoke closure check ok')
