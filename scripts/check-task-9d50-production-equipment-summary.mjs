import fs from 'node:fs'

const files = {
  controller: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java', 'utf8'),
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', 'utf8'),
  response: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionEquipmentSummaryResponse.java', 'utf8'),
  migration: fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V22__production_equipment_foundation.sql', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/production/ProductionEquipmentSummaryTests.java', 'utf8'),
  frontend: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8')
}

const checks = [
  [files.controller, 'WorkflowExecutionController.java', '"/production/equipment/summary"'],
  [files.controller, 'WorkflowExecutionController.java', 'getProductionEquipmentSummary'],
  [files.service, 'WorkflowExecutionService.java', 'getProductionEquipmentSummary'],
  [files.service, 'WorkflowExecutionService.java', "e.status = 'RUNNING'"],
  [files.service, 'WorkflowExecutionService.java', "ev.event_type = 'FAULT_REPAIR'"],
  [files.response, 'ProductionEquipmentSummaryResponse.java', '@JsonProperty("average_utilization_rate")'],
  [files.migration, 'V22__production_equipment_foundation.sql', 'CREATE TABLE production_equipment'],
  [files.migration, 'V22__production_equipment_foundation.sql', 'CREATE TABLE production_equipment_event'],
  [files.tests, 'ProductionEquipmentSummaryTests.java', 'productionEquipmentSummaryAggregatesStatusMaintenanceFaultAndUtilization'],
  [files.tests, 'ProductionEquipmentSummaryTests.java', 'doctorCannotReadProductionEquipmentSummary'],
  [files.frontend, 'App.vue', 'type ProductionEquipmentSummaryResponse'],
  [files.frontend, 'App.vue', 'loadProductionEquipmentSummary'],
  [files.frontend, 'App.vue', '/production/equipment/summary'],
  [files.frontend, 'App.vue', '真实设备汇总'],
  [files.frontend, 'App.vue', '设备稼动率'],
  [files.frontend, 'App.vue', '故障报修'],
  [files.openapi, 'openapi.yaml', 'ProductionEquipmentSummary'],
  [files.openapi, 'openapi.yaml', 'getProductionEquipmentSummary']
]

const missing = checks.filter(([content, name, needle]) => !content.includes(needle))

if (missing.length) {
  console.error('9D.50 production equipment summary check failed:')
  for (const [, name, needle] of missing) {
    console.error(`- ${name} missing ${needle}`)
  }
  process.exit(1)
}

console.log('9D.50 production equipment summary static check passed.')
