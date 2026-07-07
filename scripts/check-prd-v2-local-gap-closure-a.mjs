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
if (acceptance.active_goal !== 'GOAL-007') {
  failures.push(`acceptance.json active_goal expected GOAL-007, got ${acceptance.active_goal}`)
}
if (acceptance.active_goal_file !== 'goals/GOAL-007-prd-v2-local-gap-closure-a-20260707.md') {
  failures.push(`acceptance.json active_goal_file expected GOAL-007 file, got ${acceptance.active_goal_file}`)
}
if (!Array.isArray(acceptance.goals) || !acceptance.goals.some((goal) => goal.id === 'GOAL-007')) {
  failures.push('acceptance.json missing GOAL-007 checks')
}

requireText('goals/GOAL-007-prd-v2-local-gap-closure-a-20260707.md', [
  '# GOAL-007 PRD V2 Local Gap Closure A',
  'Status: `completed`',
  'Task 8 remains `NOT_READY`',
  'check:prd-v2-gap-closure-a',
  'prd-v2-local-feature-gaps',
  'customer-pm-confirmations'
])

requireText('tasks/TASK-008-prd-v2-local-gap-closure-a-20260707.md', [
  '# TASK-008 PRD V2 Local Gap Closure A',
  'Goal: `goals/GOAL-007-prd-v2-local-gap-closure-a-20260707.md`',
  '## Checklist',
  'Scope:',
  'Non-goals:',
  'Acceptance:',
  'Verification:',
  'Stage container and machine check',
  'PRD V2 local gap queue alignment',
  'Readiness and entry document writeback'
])

requireText('package.json', [
  'check:prd-v2-gap-closure-a',
  'scripts/check-prd-v2-local-gap-closure-a.mjs'
])

requireText('docs/acceptance/prd-v2-gap-matrix.md', [
  'PRD V2 本地功能差异收口 A',
  'GOAL-007-prd-v2-local-gap-closure-a-20260707.md',
  'TASK-008-prd-v2-local-gap-closure-a-20260707.md',
  '质量记录独立模型 / 状态工作流第一段',
  '月度趋势 / 客户排名完整口径确认',
  'AI-2 消息附件预览聚合 / 更完整知识上下文',
  'Task 8 仍保持 `in-progress / NOT_READY`'
])

for (const file of [
  'STATUS.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md'
]) {
  requireText(file, [
    'GOAL-007',
    'TASK-008',
    'PRD V2 本地功能差异收口 A',
    'check:prd-v2-gap-closure-a',
    'Task 8'
  ])
}

requireText('acceptance.json', [
  'GOAL-007',
  'goals/GOAL-007-prd-v2-local-gap-closure-a-20260707.md',
  'tasks/TASK-008-prd-v2-local-gap-closure-a-20260707.md',
  'check:prd-v2-gap-closure-a',
  'task-008-checklist-scope-nongoals-acceptance-verification'
])

for (const gapId of ['prd-v2-local-feature-gaps', 'frontend-business-pages', 'ai-production-governance']) {
  const gap = acceptance.task8_readiness_gaps?.find((item) => item.id === gapId)
  if (!gap || gap.status !== 'PARTIAL') {
    failures.push(`acceptance.json expected ${gapId} to remain PARTIAL`)
  }
}
const customerPm = acceptance.task8_readiness_gaps?.find((item) => item.id === 'customer-pm-confirmations')
if (!customerPm || customerPm.status !== 'BLOCKED') {
  failures.push('acceptance.json expected customer-pm-confirmations to remain BLOCKED')
}

for (const file of [
  'goals/GOAL-007-prd-v2-local-gap-closure-a-20260707.md',
  'tasks/TASK-008-prd-v2-local-gap-closure-a-20260707.md',
  'STATUS.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md'
]) {
  forbidText(file, [
    'Task 8 状态：READY',
    'Task 8 已 READY',
    '真实 DeepSeek key 已完成',
    '真实 webhook 已完成',
    '客户生产备注模板已确认',
    '客户签字已完成',
    '真实环境验收已完成',
    '真实支付平台已接入并验收',
    '真实物流平台已接入并验收'
  ])
}

if (failures.length > 0) {
  console.error('PRD V2 local gap closure A check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('PRD V2 local gap closure A check ok')
