import fs from 'node:fs'

const files = {
  migration: fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V17__rework_impact_audit.sql', 'utf8'),
  response: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ReworkRecordResponse.java', 'utf8'),
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
  [files.migration, 'V17__rework_impact_audit.sql', 'impacted_node_count'],
  [files.migration, 'V17__rework_impact_audit.sql', 'impacted_node_instance_ids JSON'],
  [files.response, 'ReworkRecordResponse.java', 'impacted_node_count'],
  [files.response, 'ReworkRecordResponse.java', 'impacted_node_instance_ids'],
  [files.service, 'WorkflowExecutionService.java', 'findImpactedResettableDownstreamNodeIds'],
  [files.service, 'WorkflowExecutionService.java', 'serializeImpactedNodeInstanceIds'],
  [files.service, 'WorkflowExecutionService.java', 'parseImpactedNodeInstanceIds'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'reworkListExposesImpactedDownstreamNodesForAudit'],
  [files.frontend, 'frontend/src/App.vue', '影响后续节点'],
  [files.frontend, 'frontend/src/App.vue', '影响节点 ID'],
  [files.openapi, 'docs/api/openapi.yaml', 'impacted_node_count'],
  [files.openapi, 'docs/api/openapi.yaml', 'impacted_node_instance_ids'],
  [files.tasks, 'tasks/README.md', '任务 9D.22：返工影响审计可视化第一增量'],
  [files.status, 'STATUS.md', '9D.22 返工影响审计可视化第一增量'],
  [files.matrix, 'docs/acceptance/task-8-acceptance-matrix.md', '9D.22 已补返工影响审计可视化第一增量'],
  [files.readiness, 'docs/deployment/readiness-checklist.md', '返工影响审计可视化第一增量'],
  [files.pkg, 'package.json', 'check:task9d22']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.22 rework impact audit check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.22 rework impact audit check ok')
