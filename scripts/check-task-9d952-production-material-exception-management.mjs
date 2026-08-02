import fs from 'node:fs'

const read = (path) => fs.readFileSync(path, 'utf8')

const files = {
  controller: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java'),
  service: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java'),
  request: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionMaterialExceptionRequest.java'),
  statusRequest: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionMaterialExceptionStatusRequest.java'),
  response: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionMaterialExceptionResponse.java'),
  tests: read('backend/platform-server/src/test/java/com/yuri/aiorder/production/ProductionMaterialExceptionManagementTests.java'),
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
  [files.controller, 'WorkflowExecutionController.java', '"/production/material-exceptions"'],
  [files.controller, 'WorkflowExecutionController.java', '"/production/material-exceptions/{exceptionNo}/status"'],
  [files.controller, 'WorkflowExecutionController.java', 'createProductionMaterialException'],
  [files.controller, 'WorkflowExecutionController.java', 'updateProductionMaterialExceptionStatus'],
  [files.service, 'WorkflowExecutionService.java', 'createProductionMaterialException('],
  [files.service, 'WorkflowExecutionService.java', 'updateProductionMaterialExceptionStatus('],
  [files.service, 'WorkflowExecutionService.java', 'requireProductionMaterialExceptionWrite'],
  [files.service, 'WorkflowExecutionService.java', 'exception_no already exists'],
  [files.request, 'ProductionMaterialExceptionRequest.java', '@JsonProperty("exception_no")'],
  [files.statusRequest, 'ProductionMaterialExceptionStatusRequest.java', '@JsonProperty("responsibility_owner")'],
  [files.response, 'ProductionMaterialExceptionResponse.java', '@JsonProperty("closed_at")'],
  [files.tests, 'ProductionMaterialExceptionManagementTests.java', 'workerCanCreateMaterialExceptionAndUpdateStatus'],
  [files.tests, 'ProductionMaterialExceptionManagementTests.java', 'doctorCannotCreateOrUpdateProductionMaterialException'],
  [files.openapi, 'openapi.yaml', 'ProductionMaterialExceptionRequest'],
  [files.openapi, 'openapi.yaml', 'ProductionMaterialExceptionStatusRequest'],
  [files.openapi, 'openapi.yaml', 'ProductionMaterialException'],
  [files.openapi, 'openapi.yaml', 'createProductionMaterialException'],
  [files.openapi, 'openapi.yaml', 'updateProductionMaterialExceptionStatus'],
  [files.frontend, 'App.vue', 'createProductionMaterialException'],
  [files.frontend, 'App.vue', 'updateProductionMaterialExceptionStatus'],
  [files.frontend, 'App.vue', '登记物料异常'],
  [files.frontend, 'App.vue', '更新处理状态'],
  [files.status, 'STATUS.md', '9D.95.2 物料异常登记 / 处理状态第一增量'],
  [files.decisions, 'DECISIONS.md', 'D-082 任务 9D.95.2 物料异常登记 / 处理状态第一增量'],
  [files.tasks, 'tasks/README.md', '任务 9D.95.2：物料异常登记 / 处理状态第一增量'],
  [files.readme, 'README.md', 'npm run check:task9d952'],
  [files.plan, 'phase-one-production-support-closure-plan.md', '9D.95.2 物料异常登记 / 处理状态第一增量'],
  [files.gapMatrix, 'prd-v2-gap-matrix.md', '9D.95.2 物料异常登记 / 处理状态第一增量'],
  [files.task8Matrix, 'task-8-acceptance-matrix.md', '9D.95.2 物料异常登记 / 处理状态第一增量'],
  [files.readiness, 'readiness-checklist.md', '9D.95.2 物料异常登记 / 处理状态第一增量'],
  [files.finalReport, 'task-8-final-readiness-report.md', '9D.95.2 物料异常登记 / 处理状态第一增量'],
  [files.acceptance, 'acceptance.json', 'task-9d952-production-material-exception-management'],
  [files.acceptance, 'acceptance.json', 'npm run check:task9d952'],
  [files.acceptance, 'acceptance.json', 'Task 8 仍保持 NOT_READY'],
  [files.packageJson, 'package.json', 'check:task9d952']
]

const forbidden = [
  '库存扣减已完成',
  '采购补料已完成',
  '供应商协同已完成',
  'WMS 已接入',
  '物料异常已全部完成',
  'Task 8 READY'
]

const missing = required.filter(([content, name, needle]) => !content.includes(needle))
const blocked = forbidden.flatMap((needle) =>
  [files.status, files.tasks, files.readme, files.plan, files.gapMatrix, files.task8Matrix, files.readiness, files.finalReport]
    .filter((content) => content.includes(needle))
    .map(() => needle)
)

if (missing.length || blocked.length) {
  console.error('task 9D.95.2 production material exception management check failed:')
  for (const [, name, needle] of missing) {
    console.error(`- ${name} missing ${needle}`)
  }
  for (const needle of blocked) {
    console.error(`- forbidden ${needle}`)
  }
  process.exit(1)
}

console.log('task 9D.95.2 production material exception management check ok')
