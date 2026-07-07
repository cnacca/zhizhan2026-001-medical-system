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
const goal005 = (acceptance.goals || []).find((goal) => goal.id === 'GOAL-005')
if (!goal005) {
  failures.push('acceptance.json missing GOAL-005')
} else if (goal005.status !== 'completed') {
  failures.push(`GOAL-005 status expected completed, got ${goal005.status}`)
}

requireText('docs/development/phase-one-closure-technical-plan.md', [
  '# AI 智能下单平台一期收口技术方案',
  '状态：EXECUTABLE_DRAFT / NOT_READY。',
  '## RepoFrame 纳入状态',
  '/Users/yuri/Documents/AI智能下单平台-handoff-20260706',
  'goals/GOAL-005-phase-one-closure-plan-integration-20260707.md',
  'tasks/TASK-006-phase-one-closure-plan-integration-20260707.md',
  'npm run check:phase-one-closure-plan',
  '## Current Baseline',
  '## Execution Phases',
  '### 第零段：状态基线校准',
  '### 第一段：客户 / PM 确认项与真实环境 AI 验收收口',
  '### 第二段：PRD V2 本地功能差异收口',
  '### 第三段：生产支持模块 PARTIAL 收口',
  '### 第四段：统一验收与文档回写',
  '## Test Plan',
  '## Hard Boundaries',
  '## Remaining Blockers',
  'customer-pm-confirmations',
  'ai-production-governance',
  'prd-v2-local-feature-gaps',
  'frontend-business-pages',
  '9D.90 产品参数 / 价格体系一期最小后台：已完成第一增量',
  '9D.91 客服配送管理页 / 物流异常跟进：已完成第一增量',
  '9D.92 AI-2 客服查询助手完整入口：已完成第一增量',
  '9D.97 AI-2 客服查询引用数据说明 / 知识上下文补强：已完成第一增量',
  '9D.98 AI-5 生产备注客户模板 / 知识上下文补强：已完成第一增量',
  'Task 8 继续保持 `NOT_READY`',
  '不接入或伪造真实 DeepSeek key',
  '不伪造真实 webhook',
  '不伪造客户生产备注模板',
  '不伪造客户签字',
  '不把 Task 8 标成 READY'
])

for (const file of [
  'STATUS.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md'
]) {
  requireText(file, [
    'docs/development/phase-one-closure-technical-plan.md',
    'GOAL-005',
    'TASK-006',
    'check:phase-one-closure-plan',
    'Task 8'
  ])
}

requireText('goals/GOAL-005-phase-one-closure-plan-integration-20260707.md', [
  'Status: `completed`',
  'Scope',
  'Non-goals',
  'Acceptance',
  'Verification',
  'docs/development/phase-one-closure-technical-plan.md',
  'Task 8 remains `NOT_READY`'
])

requireText('tasks/TASK-006-phase-one-closure-plan-integration-20260707.md', [
  'Status: `completed`',
  'Scope',
  'Non-goals',
  'Acceptance',
  'Verification',
  'Assumption Checks',
  'Downstream Impact',
  'Completion Record',
  'docs/development/phase-one-closure-technical-plan.md',
  'Task 8 remains `NOT_READY`'
])

requireText('package.json', [
  'check:phase-one-closure-plan',
  'scripts/check-phase-one-closure-plan.mjs'
])

for (const file of [
  'docs/development/phase-one-closure-technical-plan.md',
  'STATUS.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'goals/GOAL-005-phase-one-closure-plan-integration-20260707.md',
  'tasks/TASK-006-phase-one-closure-plan-integration-20260707.md'
]) {
  forbidText(file, [
    'Task 8 状态：READY',
    'Task 8 已 READY',
    '真实 DeepSeek key 已完成',
    '真实 webhook 已完成',
    '客户生产备注模板已确认',
    '客户签字已完成',
    '真实环境验收已完成'
  ])
}

if (failures.length > 0) {
  console.error('phase-one closure plan check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('phase-one closure technical plan check ok')
