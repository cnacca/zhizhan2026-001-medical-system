import fs from 'node:fs'

const files = {
  response: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/PerformanceDetailResponse.java', 'utf8'),
  controller: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java', 'utf8'),
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java', 'utf8'),
  frontend: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  styles: fs.readFileSync('frontend/src/styles.css', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8'),
  tasks: fs.readFileSync('tasks/README.md', 'utf8'),
  status: fs.readFileSync('STATUS.md', 'utf8'),
  matrix: fs.readFileSync('docs/acceptance/task-8-acceptance-matrix.md', 'utf8'),
  readiness: fs.readFileSync('docs/deployment/readiness-checklist.md', 'utf8'),
  pkg: fs.readFileSync('package.json', 'utf8')
}

const requiredFragments = [
  [files.response, 'PerformanceDetailResponse.java', 'work_log_id'],
  [files.response, 'PerformanceDetailResponse.java', 'effective_duration'],
  [files.response, 'PerformanceDetailResponse.java', 'on_time'],
  [files.controller, 'WorkflowExecutionController.java', '/performance/details'],
  [files.controller, 'WorkflowExecutionController.java', 'getPerformanceDetails'],
  [files.service, 'WorkflowExecutionService.java', 'getPerformanceDetails'],
  [files.service, 'WorkflowExecutionService.java', 'ORDER BY w.finished_at DESC, w.work_log_id DESC'],
  [files.service, 'WorkflowExecutionService.java', 'LIMIT 100'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'performanceDetailsListCompletedWorkLogsForResolvedUser'],
  [files.frontend, 'frontend/src/App.vue', 'PerformanceDetailResponse'],
  [files.frontend, 'frontend/src/App.vue', '/performance/details'],
  [files.frontend, 'frontend/src/App.vue', '工时明细'],
  [files.styles, 'frontend/src/styles.css', 'performance-detail-section'],
  [files.openapi, 'docs/api/openapi.yaml', 'PerformanceDetail'],
  [files.openapi, 'docs/api/openapi.yaml', 'getPerformanceDetails'],
  [files.tasks, 'tasks/README.md', '任务 9D.25：绩效明细第一增量'],
  [files.status, 'STATUS.md', '9D.25 绩效明细第一增量'],
  [files.matrix, 'docs/acceptance/task-8-acceptance-matrix.md', '9D.25 已补绩效明细第一增量'],
  [files.readiness, 'docs/deployment/readiness-checklist.md', '绩效明细第一增量'],
  [files.pkg, 'package.json', 'check:task9d25']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.25 performance details check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.25 performance details check ok')
