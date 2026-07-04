import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java', [
    'start_date',
    'end_date',
    'DateTimeFormat.ISO.DATE',
    'getPerformance(requestedUserId, startDate, endDate, identity)',
    'getPerformanceDetails(requestedUserId, startDate, endDate, identity)',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', [
    'PerformancePeriodFilter',
    'performancePeriodFilter',
    'periodSql(period, "w.finished_at")',
    'periodSql(period, "r.created_at")',
    'periodSql(period, "c.created_at")',
    'end_date cannot be before start_date',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java', [
    'performancePeriodFilterAppliesToStatsAndDetails',
    '2026-07-01',
    '2026-07-31',
    'setWorkLogFinishedAt',
  ]],
  ['frontend/src/App.vue', [
    'performanceStartDate',
    'performanceEndDate',
    'performance-start-date',
    'performance-end-date',
    'start_date',
    'end_date',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.66 第一增量',
    'start_date',
    'end_date',
  ]],
  ['acceptance.json', [
    'task-9d66-performance-period-filter-required-text',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.66',
    '绩效周期筛选第一段',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '9D.66 绩效周期筛选第一段',
  ]],
  ['DECISIONS.md', [
    'D-117 任务 9D.66 绩效周期筛选第一段',
  ]],
  ['STATUS.md', [
    '9D.66 绩效周期筛选第一段',
  ]],
  ['tasks/README.md', [
    '任务 9D.66：绩效周期筛选第一段',
  ]],
  ['README.md', [
    '9D.66 绩效周期筛选第一段',
  ]],
  ['package.json', [
    'check:task9d66',
  ]],
]

for (const [file, patterns] of checks) {
  const text = fs.readFileSync(file, 'utf8')
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      console.error(`${file} missing required text: ${pattern}`)
      process.exit(1)
    }
  }
}

console.log('task 9D.66 performance period filter check ok')
