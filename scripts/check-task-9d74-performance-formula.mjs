import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/PerformanceStatsResponse.java', [
    'performance_formula_version',
    'standard_duration',
    'standard_covered_count',
    'standard_missing_count',
    'standard_coverage_rate',
    'performance_score',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', [
    'PHASE_ONE_DEFAULT_V1',
    'performanceScore',
    'standardCoveredCount',
    'standardMissingCount',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java', [
    'performanceExposesStandardDurationCoverageAndDefaultFormulaScore',
    'performance_formula_version',
    'standard_coverage_rate',
    'performance_score',
  ]],
  ['frontend/src/App.vue', [
    'performance_formula_version',
    'standard_coverage_rate',
    'performance_score',
    'performance-formula-version',
    'performance-score-card',
  ]],
  ['docs/api/openapi.yaml', [
    'performance_formula_version',
    'standard_coverage_rate',
    'performance_score',
    'PHASE_ONE_DEFAULT_V1',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.74',
    '绩效标准工时与完整公式口径第一段',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '9D.74',
    '绩效标准工时与完整公式口径第一段',
  ]],
  ['docs/deployment/task-8-final-readiness-report.md', [
    '9D.74',
    '绩效标准工时与完整公式口径第一段',
  ]],
  ['docs/acceptance/phase-one-frontend-alignment.md', [
    '9D.74',
    '绩效标准工时与完整公式口径第一段',
  ]],
  ['docs/acceptance/phase-one-frontend-task-scope.md', [
    '9D.74',
    '绩效标准工时与完整公式口径第一段',
  ]],
  ['DECISIONS.md', [
    'D-125 任务 9D.74 绩效标准工时与完整公式口径第一段',
  ]],
  ['STATUS.md', [
    '9D.74 绩效标准工时与完整公式口径第一段',
  ]],
  ['tasks/README.md', [
    '任务 9D.74：绩效标准工时与完整公式口径第一段',
  ]],
  ['README.md', [
    '9D.74 绩效标准工时与完整公式口径第一段',
    'check:task9d74',
  ]],
  ['acceptance.json', [
    'task-9d74-performance-formula-required-text',
  ]],
  ['package.json', [
    'check:task9d74',
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

console.log('task 9D.74 performance formula check ok')
