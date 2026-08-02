import fs from 'node:fs'

const files = {
  controller: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java', 'utf8'),
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java', 'utf8'),
  frontend: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8'),
  tasks: fs.readFileSync('tasks/README.md', 'utf8'),
  status: fs.readFileSync('STATUS.md', 'utf8'),
  matrix: fs.readFileSync('docs/acceptance/task-8-acceptance-matrix.md', 'utf8'),
  readiness: fs.readFileSync('docs/deployment/readiness-checklist.md', 'utf8'),
  pkg: fs.readFileSync('package.json', 'utf8')
}

const requiredFragments = [
  [files.controller, 'WorkflowExecutionController.java', 'has_impacted_nodes'],
  [files.service, 'WorkflowExecutionService.java', 'hasImpactedNodes'],
  [files.service, 'WorkflowExecutionService.java', 'r.impacted_node_count > 0'],
  [files.service, 'WorkflowExecutionService.java', 'r.impacted_node_count = 0'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'reworkListCanFilterRecordsThatImpactedDownstreamNodes'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'performReworkListWithImpactFilter'],
  [files.frontend, 'frontend/src/App.vue', 'reworkOnlyImpacted'],
  [files.frontend, 'frontend/src/App.vue', '仅看影响后续工序'],
  [files.openapi, 'docs/api/openapi.yaml', 'has_impacted_nodes'],
  [files.tasks, 'tasks/README.md', '任务 9D.23：返工影响筛选第一增量'],
  [files.status, 'STATUS.md', '9D.23 返工影响筛选第一增量'],
  [files.matrix, 'docs/acceptance/task-8-acceptance-matrix.md', '9D.23 已补返工影响筛选第一增量'],
  [files.readiness, 'docs/deployment/readiness-checklist.md', '返工影响筛选第一增量'],
  [files.pkg, 'package.json', 'check:task9d23']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.23 rework impact filter check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.23 rework impact filter check ok')
