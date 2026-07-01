import fs from 'node:fs'

const files = {
  response: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/PerformanceStatsResponse.java', 'utf8'),
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
  [files.response, 'PerformanceStatsResponse.java', 'responsible_rework_count'],
  [files.response, 'PerformanceStatsResponse.java', 'non_worker_responsibility_rework_count'],
  [files.response, 'PerformanceStatsResponse.java', 'unclassified_rework_count'],
  [files.service, 'WorkflowExecutionService.java', 'responsibleReworkCount'],
  [files.service, 'WorkflowExecutionService.java', "r.responsibility_type = 'WORKER'"],
  [files.service, 'WorkflowExecutionService.java', "r.responsibility_type IN ('DOCTOR', 'CS', 'SYSTEM')"],
  [files.service, 'WorkflowExecutionService.java', 'r.responsibility_type IS NULL'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'performanceSeparatesReworkResponsibilityAttribution'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'closeRework'],
  [files.frontend, 'frontend/src/App.vue', '生产责任返工'],
  [files.frontend, 'frontend/src/App.vue', '非生产责任返工'],
  [files.frontend, 'frontend/src/App.vue', '未归因返工'],
  [files.openapi, 'docs/api/openapi.yaml', 'responsible_rework_count'],
  [files.openapi, 'docs/api/openapi.yaml', 'non_worker_responsibility_rework_count'],
  [files.openapi, 'docs/api/openapi.yaml', 'unclassified_rework_count'],
  [files.tasks, 'tasks/README.md', '任务 9D.21：绩效归因联动第一增量'],
  [files.status, 'STATUS.md', '9D.21 绩效归因联动第一增量'],
  [files.matrix, 'docs/acceptance/task-8-acceptance-matrix.md', '9D.21 已补绩效归因联动第一增量'],
  [files.readiness, 'docs/deployment/readiness-checklist.md', '绩效归因联动第一增量'],
  [files.pkg, 'package.json', 'check:task9d21']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.21 performance attribution check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.21 performance attribution check ok')
