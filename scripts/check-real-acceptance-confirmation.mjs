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
if (!String(acceptance.active_goal || '').startsWith('GOAL-')) {
  failures.push(`acceptance.json active_goal must remain a RepoFrame goal, got ${acceptance.active_goal}`)
}
if (!acceptance.active_goal_file || !fs.existsSync(acceptance.active_goal_file)) {
  failures.push(`acceptance.json active_goal_file must point to an existing goal file, got ${acceptance.active_goal_file}`)
}
if (!Array.isArray(acceptance.goals) || !acceptance.goals.some((goal) => goal.id === 'GOAL-011' && goal.status === 'completed')) {
  failures.push('acceptance.json missing GOAL-011 checks')
}

requireText('goals/GOAL-011-real-acceptance-confirmation-20260707.md', [
  '# GOAL-011 Real Acceptance Confirmation Gate',
  'Task 8 remains `NOT_READY`',
  'customer / PM confirmations',
  'real-environment AI / deployment acceptance gate',
  'customer-pm-confirmations',
  'Do not enter or validate a real DeepSeek key'
])

requireText('tasks/TASK-012-real-acceptance-confirmation-20260707.md', [
  '# TASK-012 Real Acceptance Confirmation Gate',
  'Goal: `goals/GOAL-011-real-acceptance-confirmation-20260707.md`',
  '## Checklist',
  'Scope:',
  'Non-goals:',
  'Acceptance:',
  'Verification:',
  'Customer / PM confirmation gate',
  'Real AI and deployment template gate',
  'Machine checks and documentation writeback'
])

requireText('package.json', [
  'check:real-acceptance-confirmation',
  'scripts/check-real-acceptance-confirmation.mjs'
])

requireText('docs/acceptance/phase-one-customer-pm-confirmations.md', [
  'CP-001',
  'CP-002',
  'CP-003',
  'CP-004',
  'CP-005',
  'CP-006',
  'CP-007',
  'CP-008',
  'CP-009',
  'PENDING_CONFIRMATION',
  'CONFIRMED_BASELINE',
  'CUSTOMER_INPUT_REQUIRED',
  'BUSINESS_DATA_REQUIRED',
  'OUT_OF_PHASE_ONE',
  'DELIVERY_EVIDENCE_PENDING',
  'EXTERNAL_ENV_EVIDENCE_PENDING',
  '待客户 / PM 产品确认',
  'PRD 明确要求逐功能签字',
  'Task 8 仍保持 NOT_READY'
])

requireText('docs/acceptance/task-9d80-ai-production-integration-acceptance.md', [
  '状态：TEMPLATE_READY / PARTIAL',
  '待填写',
  '待确认',
  'DeepSeek key 来源',
  '生产 webhook 渠道',
  'webhook signing secret 来源',
  'receiver signing secret 来源',
  '真实 key 只能外部注入',
  '不填写真实密钥',
  '不填写真实 webhook URL',
  '不代表真实 key 已联调完成',
  'Task 8 仍保持 NOT_READY'
])

requireText('docs/deployment/task-9d81-production-deployment-acceptance.md', [
  '状态：TEMPLATE_READY / PARTIAL',
  '待填写',
  '待确认',
  'HTTPS',
  'Nginx',
  'Docker Compose',
  '数据库备份',
  '备份恢复演练',
  '日志留存',
  '监控告警',
  '发布回滚',
  '真实密钥必须外部注入',
  '不填写真实密钥',
  '不填写真实服务器地址',
  '不代表真实服务器已部署完成',
  'Task 8 仍保持 NOT_READY'
])

for (const file of [
  'STATUS.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md',
  'docs/deployment/task-8-final-readiness-report.md'
]) {
  requireText(file, [
    'GOAL-011',
    'TASK-012',
    '客户 / PM 确认项与真实环境 AI 验收收口',
    'check:real-acceptance-confirmation',
    'Task 8'
  ])
}

requireText('acceptance.json', [
  'GOAL-011',
  'goals/GOAL-011-real-acceptance-confirmation-20260707.md',
  'tasks/TASK-012-real-acceptance-confirmation-20260707.md',
  'check:real-acceptance-confirmation',
  'real-acceptance-confirmation-entry-docs',
  'real-acceptance-confirmation-no-fake-completion'
])

for (const [gapId, expectedStatus] of [
  ['customer-pm-confirmations', 'PARTIAL'],
  ['ai-production-governance', 'PARTIAL'],
  ['deployment-infrastructure', 'PARTIAL'],
  ['frontend-business-pages', 'PARTIAL'],
  ['prd-v2-local-feature-gaps', 'PARTIAL']
]) {
  const gap = acceptance.task8_readiness_gaps?.find((item) => item.id === gapId)
  if (!gap || gap.status !== expectedStatus) {
    failures.push(`acceptance.json expected ${gapId} to remain ${expectedStatus}`)
  }
}

forbidText('docs/acceptance/phase-one-customer-pm-confirmations.md', [
  'PRD 明确要求逐功能签字 | 1',
  '客户/PM 签字状态：已确认',
  '客户/PM 签字状态：已签字'
])

for (const file of [
  'goals/GOAL-011-real-acceptance-confirmation-20260707.md',
  'tasks/TASK-012-real-acceptance-confirmation-20260707.md',
  'STATUS.md',
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
    '状态：真实 DeepSeek key 已完成',
    '结论：真实 DeepSeek key 已完成',
    '状态：真实 key 已联调完成',
    '结论：真实 key 已联调完成',
    '状态：真实 webhook 已完成',
    '结论：真实 webhook 已完成',
    '状态：生产 webhook 已联调完成',
    '结论：生产 webhook 已联调完成',
    '状态：客户生产备注模板已确认',
    '结论：客户生产备注模板已确认',
    '状态：客户签字已完成',
    '结论：客户签字已完成',
    '状态：客户 / PM 签字已完成',
    '结论：客户 / PM 签字已完成',
    '状态：真实环境验收已完成',
    '结论：真实环境验收已完成',
    '状态：真实服务器已部署完成',
    '结论：真实服务器已部署完成',
    '状态：HTTPS 已验收完成',
    '结论：HTTPS 已验收完成',
    '状态：备份恢复已验收完成',
    '结论：备份恢复已验收完成',
    '状态：监控告警已验收完成',
    '结论：监控告警已验收完成',
    '状态：真实支付平台已接入并验收',
    '结论：真实支付平台已接入并验收',
    '状态：真实物流平台已接入并验收',
    '结论：真实物流平台已接入并验收',
    '状态：客户最终统计口径已确认',
    '结论：客户最终统计口径已确认',
    '状态：客户 AI-2 口径已确认',
    '结论：客户 AI-2 口径已确认'
  ])
}

if (failures.length > 0) {
  console.error('real acceptance confirmation gate check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('real acceptance confirmation gate check ok')
