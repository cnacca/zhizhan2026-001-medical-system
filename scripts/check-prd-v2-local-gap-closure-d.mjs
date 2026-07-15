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
requireCurrentPointerAtOrAfter(acceptance, fs, failures, 'GOAL-010')
if (!Array.isArray(acceptance.goals) || !acceptance.goals.some((goal) => goal.id === 'GOAL-010')) {
  failures.push('acceptance.json missing GOAL-010 checks')
}

requireText('goals/GOAL-010-prd-v2-local-gap-closure-d-20260707.md', [
  '# GOAL-010 PRD V2 Local Gap Closure D',
  'Task 8 remains `NOT_READY`',
  'monthly trend',
  'customer ranking',
  'customer-pm-confirmations'
])

requireText('tasks/TASK-011-prd-v2-local-gap-closure-d-20260707.md', [
  '# TASK-011 PRD V2 Local Gap Closure D',
  'Goal: `goals/GOAL-010-prd-v2-local-gap-closure-d-20260707.md`',
  '## Checklist',
  'Scope:',
  'Non-goals:',
  'Acceptance:',
  'Verification:',
  'Backend monthly trend and customer ranking aggregation',
  'Frontend and OpenAPI contract',
  'Machine checks and documentation writeback'
])

requireText('package.json', [
  'check:prd-v2-gap-closure-d',
  'scripts/check-prd-v2-local-gap-closure-d.mjs'
])

requireText('backend/platform-server/src/main/java/com/yuri/aiorder/dashboard/PhaseOneDashboardController.java', [
  '@GetMapping("/dashboards/phase-one-ab")',
  'check:read-internal',
  'PhaseOneDashboardResponse'
])

requireText('backend/platform-server/src/main/java/com/yuri/aiorder/dashboard/PhaseOneDashboardService.java', [
  'current_month',
  'previous_month',
  'monthly_order_delta',
  'top_customers',
  'scopedWhereClause',
  'production_exception_count',
  'pending_question_count'
])

requireText('backend/platform-server/src/main/java/com/yuri/aiorder/dashboard/PhaseOneDashboardResponse.java', [
  'current_month',
  'previous_month',
  'top_customers',
  'shipping_rate',
  'completion_rate'
])

requireText('backend/platform-server/src/test/java/com/yuri/aiorder/dashboard/PhaseOneDashboardTests.java', [
  'csCanReadMonthlyTrendAndCustomerRanking',
  'doctorCannotReadPhaseOneDashboard',
  '/dashboards/phase-one-ab',
  'current_month',
  'top_customers'
])

requireText('frontend/src/App.vue', [
  'PhaseOneAbDashboardResponse',
  "apiFetch<PhaseOneAbDashboardResponse>('/dashboards/phase-one-ab')",
  'phaseOneAbDashboardSummary',
  '本地月度趋势接口',
  'phaseOneAbMonthlyComparison'
])

requireText('docs/api/openapi.yaml', [
  '"/dashboards/phase-one-ab"',
  'getPhaseOneAbDashboard',
  'PhaseOneAbDashboardResponse',
  'PhaseOneAbMonthSummary',
  'PhaseOneAbCustomerRanking'
])

for (const file of [
  'STATUS.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md'
]) {
  requireText(file, [
    'GOAL-010',
    'TASK-011',
    'PRD V2 本地功能差异收口 D',
    'check:prd-v2-gap-closure-d',
    '月度趋势 / 客户排名',
    'Task 8'
  ])
}

requireText('acceptance.json', [
  'GOAL-010',
  'goals/GOAL-010-prd-v2-local-gap-closure-d-20260707.md',
  'tasks/TASK-011-prd-v2-local-gap-closure-d-20260707.md',
  'check:prd-v2-gap-closure-d',
  'phase-one-dashboard-controller',
  'phase-one-dashboard-service',
  'phase-one-dashboard-frontend',
  'phase-one-dashboard-openapi'
])

for (const gapId of ['prd-v2-local-feature-gaps', 'frontend-business-pages']) {
  const gap = acceptance.task8_readiness_gaps?.find((item) => item.id === gapId)
  if (!gap || gap.status !== 'PARTIAL') {
    failures.push(`acceptance.json expected ${gapId} to remain PARTIAL`)
  }
}
const customerPm = acceptance.task8_readiness_gaps?.find((item) => item.id === 'customer-pm-confirmations')
if (!customerPm || customerPm.status !== 'PARTIAL') {
  failures.push('acceptance.json expected customer-pm-confirmations to use the corrected PARTIAL classification')
}

for (const file of [
  'frontend/src/App.vue',
  'goals/GOAL-010-prd-v2-local-gap-closure-d-20260707.md',
  'tasks/TASK-011-prd-v2-local-gap-closure-d-20260707.md',
  'STATUS.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md'
]) {
  forbidText(file, [
    'PARTIAL：缺少月度趋势接口',
    'Task 8 状态：READY',
    'Task 8 已 READY',
    '真实 DeepSeek key 已完成',
    '真实 webhook 已完成',
    '客户生产备注模板已确认',
    '客户签字已完成',
    '真实环境验收已完成',
    '真实支付平台已接入并验收',
    '真实物流平台已接入并验收',
    '客户最终统计口径已确认'
  ])
}

if (failures.length > 0) {
  console.error('PRD V2 local gap closure D check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('PRD V2 local gap closure D check ok')
