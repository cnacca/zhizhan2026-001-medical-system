import fs from 'node:fs'

const read = (path) => fs.readFileSync(path, 'utf8')

const files = {
  controller: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java'),
  service: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java'),
  request: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionCostRecordRequest.java'),
  response: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionCostRecordResponse.java'),
  tests: read('backend/platform-server/src/test/java/com/yuri/aiorder/production/ProductionCostSummaryTests.java'),
  openapi: read('docs/api/openapi.yaml'),
  frontend: read('frontend/src/App.vue'),
  status: read('STATUS.md'),
  decisions: read('DECISIONS.md'),
  tasks: read('tasks/README.md'),
  readme: read('README.md'),
  plan: read('docs/acceptance/phase-one-production-support-closure-plan.md'),
  gapMatrix: read('docs/acceptance/prd-v2-gap-matrix.md'),
  task8Matrix: read('docs/acceptance/task-8-acceptance-matrix.md'),
  readiness: read('docs/deployment/readiness-checklist.md'),
  finalReport: read('docs/deployment/task-8-final-readiness-report.md'),
  acceptance: read('acceptance.json'),
  packageJson: read('package.json')
}

const required = [
  [files.controller, 'WorkflowExecutionController.java', '"/production/cost-management/records"'],
  [files.controller, 'WorkflowExecutionController.java', 'createProductionCostRecord'],
  [files.service, 'WorkflowExecutionService.java', 'createProductionCostRecord('],
  [files.service, 'WorkflowExecutionService.java', 'requireProductionCostWrite'],
  [files.service, 'WorkflowExecutionService.java', 'PRODUCTION_COST_TYPES'],
  [files.service, 'WorkflowExecutionService.java', 'PRODUCTION_COST_STATUSES'],
  [files.service, 'WorkflowExecutionService.java', 'cost_no already exists'],
  [files.request, 'ProductionCostRecordRequest.java', '@JsonProperty("cost_no")'],
  [files.request, 'ProductionCostRecordRequest.java', '@JsonProperty("cost_type")'],
  [files.response, 'ProductionCostRecordResponse.java', '@JsonProperty("confirmed_at")'],
  [files.tests, 'ProductionCostSummaryTests.java', 'workerCanCreateCostRecordAndSummaryReflectsIt'],
  [files.tests, 'ProductionCostSummaryTests.java', 'doctorCannotCreateProductionCostRecord'],
  [files.openapi, 'openapi.yaml', 'ProductionCostRecordRequest'],
  [files.openapi, 'openapi.yaml', 'ProductionCostRecord'],
  [files.openapi, 'openapi.yaml', 'createProductionCostRecord'],
  [files.openapi, 'openapi.yaml', 'OUTSOURCING'],
  [files.frontend, 'App.vue', 'createProductionCostRecord'],
  [files.frontend, 'App.vue', '登记成本记录'],
  [files.frontend, 'App.vue', '/production/cost-management/records'],
  [files.status, 'STATUS.md', '9D.95.4 成本记录维护 / 趋势口径第一增量'],
  [files.decisions, 'DECISIONS.md', 'D-084 任务 9D.95.4 成本记录维护 / 趋势口径第一增量'],
  [files.tasks, 'tasks/README.md', '任务 9D.95.4：成本记录维护 / 趋势口径第一增量'],
  [files.readme, 'README.md', 'npm run check:task9d954'],
  [files.plan, 'phase-one-production-support-closure-plan.md', '9D.95.4 成本记录维护 / 趋势口径第一增量'],
  [files.gapMatrix, 'prd-v2-gap-matrix.md', '9D.95.4 成本记录维护 / 趋势口径第一增量'],
  [files.task8Matrix, 'task-8-acceptance-matrix.md', '9D.95.4 成本记录维护 / 趋势口径第一增量'],
  [files.readiness, 'readiness-checklist.md', '9D.95.4 成本记录维护 / 趋势口径第一增量'],
  [files.finalReport, 'task-8-final-readiness-report.md', '9D.95.4 成本记录维护 / 趋势口径第一增量'],
  [files.acceptance, 'acceptance.json', 'task-9d954-production-cost-management'],
  [files.acceptance, 'acceptance.json', 'npm run check:task9d954'],
  [files.acceptance, 'acceptance.json', 'Task 8 仍保持 NOT_READY'],
  [files.packageJson, 'package.json', 'check:task9d954']
]

const forbidden = [
  '真实财务系统已接入',
  '发票系统已完成',
  '自动成本分摊已完成',
  '成本管理已全部完成',
  'Task 8 READY'
]

const missing = required.filter(([content, name, needle]) => !content.includes(needle))
const blocked = forbidden.flatMap((needle) =>
  [files.status, files.tasks, files.readme, files.plan, files.gapMatrix, files.task8Matrix, files.readiness, files.finalReport]
    .filter((content) => content.includes(needle))
    .map(() => needle)
)

if (missing.length || blocked.length) {
  console.error('task 9D.95.4 production cost management check failed:')
  for (const [, name, needle] of missing) {
    console.error(`- ${name} missing ${needle}`)
  }
  for (const needle of blocked) {
    console.error(`- forbidden ${needle}`)
  }
  process.exit(1)
}

console.log('task 9D.95.4 production cost management check ok')
