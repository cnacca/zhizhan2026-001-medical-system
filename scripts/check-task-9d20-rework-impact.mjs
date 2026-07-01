import fs from 'node:fs'

const files = {
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java', 'utf8'),
  tasks: fs.readFileSync('tasks/README.md', 'utf8'),
  status: fs.readFileSync('STATUS.md', 'utf8'),
  matrix: fs.readFileSync('docs/acceptance/task-8-acceptance-matrix.md', 'utf8'),
  readiness: fs.readFileSync('docs/deployment/readiness-checklist.md', 'utf8'),
  pkg: fs.readFileSync('package.json', 'utf8')
}

const requiredFragments = [
  [files.service, 'WorkflowExecutionService.java', 'resetImpactedDownstreamNodes'],
  [files.service, 'WorkflowExecutionService.java', 'WITH RECURSIVE impacted_nodes'],
  [files.service, 'WorkflowExecutionService.java', "node.node_status IN ('READY', 'COMPLETED')"],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'failedOutCheckResetsTargetAndCompletedDownstreamNodesForReworkImpact'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'createTwoNodeChain'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'instantiateAndAssignAll'],
  [files.tasks, 'tasks/README.md', '任务 9D.20：复杂返工影响范围第一增量'],
  [files.status, 'STATUS.md', '9D.20 复杂返工影响范围第一增量'],
  [files.matrix, 'docs/acceptance/task-8-acceptance-matrix.md', '9D.20 已补复杂返工影响范围第一增量'],
  [files.readiness, 'docs/deployment/readiness-checklist.md', '复杂返工影响范围第一增量'],
  [files.pkg, 'package.json', 'check:task9d20']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.20 rework impact check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.20 rework impact check ok')
