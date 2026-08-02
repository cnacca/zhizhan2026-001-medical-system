import fs from 'node:fs'

const read = (path) => fs.readFileSync(path, 'utf8')

const files = {
  controller: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java'),
  service: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java'),
  equipmentRequest: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionEquipmentRequest.java'),
  eventRequest: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionEquipmentEventRequest.java'),
  equipmentResponse: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionEquipmentResponse.java'),
  eventResponse: read('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionEquipmentEventResponse.java'),
  tests: read('backend/platform-server/src/test/java/com/yuri/aiorder/production/ProductionEquipmentManagementTests.java'),
  openapi: read('docs/api/openapi.yaml'),
  frontend: read('frontend/src/App.vue'),
  status: read('STATUS.md'),
  decisions: read('DECISIONS.md'),
  tasks: read('tasks/README.md'),
  readme: read('README.md'),
  gapMatrix: read('docs/acceptance/prd-v2-gap-matrix.md'),
  task8Matrix: read('docs/acceptance/task-8-acceptance-matrix.md'),
  readiness: read('docs/deployment/readiness-checklist.md'),
  finalReport: read('docs/deployment/task-8-final-readiness-report.md'),
  acceptance: read('acceptance.json')
}

const required = [
  [files.controller, 'WorkflowExecutionController.java', '"/production/equipment"'],
  [files.controller, 'WorkflowExecutionController.java', '"/production/equipment/{equipmentCode}/events"'],
  [files.controller, 'WorkflowExecutionController.java', 'createProductionEquipment'],
  [files.controller, 'WorkflowExecutionController.java', 'createProductionEquipmentEvent'],
  [files.service, 'WorkflowExecutionService.java', 'createProductionEquipment('],
  [files.service, 'WorkflowExecutionService.java', 'createProductionEquipmentEvent('],
  [files.service, 'WorkflowExecutionService.java', 'requireProductionEquipmentWrite'],
  [files.service, 'WorkflowExecutionService.java', 'equipment_code already exists'],
  [files.equipmentRequest, 'ProductionEquipmentRequest.java', '@JsonProperty("equipment_code")'],
  [files.eventRequest, 'ProductionEquipmentEventRequest.java', '@JsonProperty("event_type")'],
  [files.equipmentResponse, 'ProductionEquipmentResponse.java', '@JsonProperty("owner_user_id")'],
  [files.eventResponse, 'ProductionEquipmentEventResponse.java', '@JsonProperty("equipment_code")'],
  [files.tests, 'ProductionEquipmentManagementTests.java', 'workerCanCreateEquipmentAndRegisterFaultEvent'],
  [files.tests, 'ProductionEquipmentManagementTests.java', 'doctorCannotCreateProductionEquipmentOrEvent'],
  [files.openapi, 'openapi.yaml', 'ProductionEquipmentRequest'],
  [files.openapi, 'openapi.yaml', 'ProductionEquipmentEventRequest'],
  [files.openapi, 'openapi.yaml', 'ProductionEquipment'],
  [files.openapi, 'openapi.yaml', 'ProductionEquipmentEvent'],
  [files.openapi, 'openapi.yaml', 'createProductionEquipment'],
  [files.openapi, 'openapi.yaml', 'createProductionEquipmentEvent'],
  [files.frontend, 'App.vue', 'createProductionEquipment'],
  [files.frontend, 'App.vue', 'createProductionEquipmentEvent'],
  [files.frontend, 'App.vue', '登记设备'],
  [files.frontend, 'App.vue', '登记事件'],
  [files.status, 'STATUS.md', '9D.95.1 设备台账 / 设备事件录入第一增量'],
  [files.decisions, 'DECISIONS.md', 'D-081 任务 9D.95.1 设备台账 / 设备事件录入第一增量'],
  [files.tasks, 'tasks/README.md', '任务 9D.95.1：设备台账 / 设备事件录入第一增量'],
  [files.readme, 'README.md', 'npm run check:task9d951'],
  [files.gapMatrix, 'prd-v2-gap-matrix.md', '9D.95.1 设备台账 / 设备事件录入第一增量'],
  [files.task8Matrix, 'task-8-acceptance-matrix.md', '9D.95.1 设备台账 / 设备事件录入第一增量'],
  [files.readiness, 'readiness-checklist.md', '9D.95.1 设备台账 / 设备事件录入第一增量'],
  [files.finalReport, 'task-8-final-readiness-report.md', '9D.95.1 设备台账 / 设备事件录入第一增量'],
  [files.acceptance, 'acceptance.json', 'task-9d951-production-equipment-management'],
  [files.acceptance, 'acceptance.json', 'npm run check:task9d951'],
  [files.acceptance, 'acceptance.json', 'Task 8 仍保持 NOT_READY']
]

const forbidden = [
  [files.status + files.tasks + files.readme + files.gapMatrix + files.task8Matrix + files.readiness + files.finalReport, 'docs', '设备管理已全部完成'],
  [files.status + files.tasks + files.readme + files.gapMatrix + files.task8Matrix + files.readiness + files.finalReport, 'docs', '真实 IoT 已接入'],
  [files.status + files.tasks + files.readme + files.gapMatrix + files.task8Matrix + files.readiness + files.finalReport, 'docs', 'Task 8 READY']
]

const missing = required.filter(([content, name, needle]) => !content.includes(needle))
const blocked = forbidden.filter(([content, name, needle]) => content.includes(needle))

if (missing.length || blocked.length) {
  console.error('task 9D.95.1 production equipment management check failed:')
  for (const [, name, needle] of missing) {
    console.error(`- ${name} missing ${needle}`)
  }
  for (const [, name, needle] of blocked) {
    console.error(`- ${name} must not include ${needle}`)
  }
  process.exit(1)
}

console.log('task 9D.95.1 production equipment management check ok')
