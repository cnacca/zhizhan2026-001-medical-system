import fs from 'node:fs'

const read = (path) => fs.readFileSync(path, 'utf8')

const files = {
  controller: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java'),
  service: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java'),
  request: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionSafetyEnvironmentEventRequest.java'),
  statusRequest: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionSafetyEnvironmentEventStatusRequest.java'),
  response: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionSafetyEnvironmentEventResponse.java'),
  tests: read('backend/platform-server/src/test/java/com/yuri/aiorder/production/ProductionSafetyEnvironmentManagementTests.java'),
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
  [files.controller, 'WorkflowExecutionController.java', '"/production/safety-environment/events"'],
  [files.controller, 'WorkflowExecutionController.java', '"/production/safety-environment/events/{eventNo}/status"'],
  [files.controller, 'WorkflowExecutionController.java', 'createProductionSafetyEnvironmentEvent'],
  [files.controller, 'WorkflowExecutionController.java', 'updateProductionSafetyEnvironmentEventStatus'],
  [files.service, 'WorkflowExecutionService.java', 'createProductionSafetyEnvironmentEvent('],
  [files.service, 'WorkflowExecutionService.java', 'updateProductionSafetyEnvironmentEventStatus('],
  [files.service, 'WorkflowExecutionService.java', 'requireProductionSafetyEnvironmentWrite'],
  [files.service, 'WorkflowExecutionService.java', 'event_no already exists'],
  [files.service, 'WorkflowExecutionService.java', 'SAFETY_ENVIRONMENT_EVENT_TYPES'],
  [files.request, 'ProductionSafetyEnvironmentEventRequest.java', '@JsonProperty("event_no")'],
  [files.statusRequest, 'ProductionSafetyEnvironmentEventStatusRequest.java', '@JsonProperty("responsible_owner")'],
  [files.response, 'ProductionSafetyEnvironmentEventResponse.java', '@JsonProperty("closed_at")'],
  [files.tests, 'ProductionSafetyEnvironmentManagementTests.java', 'workerCanCreateSafetyEventAndCloseRectification'],
  [files.tests, 'ProductionSafetyEnvironmentManagementTests.java', 'doctorCannotCreateOrUpdateProductionSafetyEvent'],
  [files.openapi, 'openapi.yaml', 'ProductionSafetyEnvironmentEventRequest'],
  [files.openapi, 'openapi.yaml', 'ProductionSafetyEnvironmentEventStatusRequest'],
  [files.openapi, 'openapi.yaml', 'ProductionSafetyEnvironmentEvent'],
  [files.openapi, 'openapi.yaml', 'createProductionSafetyEnvironmentEvent'],
  [files.openapi, 'openapi.yaml', 'updateProductionSafetyEnvironmentEventStatus'],
  [files.openapi, 'openapi.yaml', 'HAZARD_RECTIFICATION'],
  [files.frontend, 'App.vue', 'createProductionSafetyEnvironmentEvent'],
  [files.frontend, 'App.vue', 'updateProductionSafetyEnvironmentEventStatus'],
  [files.frontend, 'App.vue', '登记安环事件'],
  [files.frontend, 'App.vue', '更新整改状态'],
  [files.status, 'STATUS.md', '9D.95.3 安环巡检 / 隐患整改第一增量'],
  [files.decisions, 'DECISIONS.md', 'D-083 任务 9D.95.3 安环巡检 / 隐患整改第一增量'],
  [files.tasks, 'tasks/README.md', '任务 9D.95.3：安环巡检 / 隐患整改第一增量'],
  [files.readme, 'README.md', 'npm run check:task9d953'],
  [files.plan, 'phase-one-production-support-closure-plan.md', '9D.95.3 安环巡检 / 隐患整改第一增量'],
  [files.gapMatrix, 'prd-v2-gap-matrix.md', '9D.95.3 安环巡检 / 隐患整改第一增量'],
  [files.task8Matrix, 'task-8-acceptance-matrix.md', '9D.95.3 安环巡检 / 隐患整改第一增量'],
  [files.readiness, 'readiness-checklist.md', '9D.95.3 安环巡检 / 隐患整改第一增量'],
  [files.finalReport, 'task-8-final-readiness-report.md', '9D.95.3 安环巡检 / 隐患整改第一增量'],
  [files.acceptance, 'acceptance.json', 'task-9d953-production-safety-environment-management'],
  [files.acceptance, 'acceptance.json', 'npm run check:task9d953'],
  [files.acceptance, 'acceptance.json', 'Task 8 仍保持 NOT_READY'],
  [files.packageJson, 'package.json', 'check:task9d953']
]

const forbidden = [
  '真实环境采集硬件已接入',
  'PPE 发放系统已完成',
  '完整安环审批流已完成',
  '安环管理已全部完成',
  'Task 8 READY'
]

const missing = required.filter(([content, name, needle]) => !content.includes(needle))
const blocked = forbidden.flatMap((needle) =>
  [files.status, files.tasks, files.readme, files.plan, files.gapMatrix, files.task8Matrix, files.readiness, files.finalReport]
    .filter((content) => content.includes(needle))
    .map(() => needle)
)

if (missing.length || blocked.length) {
  console.error('task 9D.95.3 production safety environment management check failed:')
  for (const [, name, needle] of missing) {
    console.error(`- ${name} missing ${needle}`)
  }
  for (const needle of blocked) {
    console.error(`- forbidden ${needle}`)
  }
  process.exit(1)
}

console.log('task 9D.95.3 production safety environment management check ok')
