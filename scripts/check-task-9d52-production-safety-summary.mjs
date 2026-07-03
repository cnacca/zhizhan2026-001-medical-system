import fs from 'node:fs'

const files = {
  controller: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java', 'utf8'),
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', 'utf8'),
  response: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionSafetyEnvironmentSummaryResponse.java', 'utf8'),
  migration: fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V24__production_safety_event_foundation.sql', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/production/ProductionSafetyEnvironmentSummaryTests.java', 'utf8'),
  frontend: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8')
}

const checks = [
  [files.controller, 'WorkflowExecutionController.java', '"/production/safety-environment/summary"'],
  [files.controller, 'WorkflowExecutionController.java', 'getProductionSafetyEnvironmentSummary'],
  [files.service, 'WorkflowExecutionService.java', 'getProductionSafetyEnvironmentSummary'],
  [files.service, 'WorkflowExecutionService.java', "s.event_type = 'SAFETY_INSPECTION'"],
  [files.service, 'WorkflowExecutionService.java', "s.event_type = 'HAZARD_RECTIFICATION'"],
  [files.service, 'WorkflowExecutionService.java', "s.event_type = 'ENVIRONMENT_RECORD'"],
  [files.service, 'WorkflowExecutionService.java', "s.event_type = 'PPE_DEVICE_REMINDER'"],
  [files.response, 'ProductionSafetyEnvironmentSummaryResponse.java', '@JsonProperty("overdue_count")'],
  [files.response, 'ProductionSafetyEnvironmentSummaryResponse.java', '@JsonProperty("high_risk_count")'],
  [files.migration, 'V24__production_safety_event_foundation.sql', 'CREATE TABLE production_safety_event'],
  [files.tests, 'ProductionSafetyEnvironmentSummaryTests.java', 'productionSafetyEnvironmentSummaryAggregatesTypeStatusRiskAndOverdue'],
  [files.tests, 'ProductionSafetyEnvironmentSummaryTests.java', 'doctorCannotReadProductionSafetyEnvironmentSummary'],
  [files.frontend, 'App.vue', 'type ProductionSafetyEnvironmentSummaryResponse'],
  [files.frontend, 'App.vue', 'loadProductionSafetyEnvironmentSummary'],
  [files.frontend, 'App.vue', '/production/safety-environment/summary'],
  [files.frontend, 'App.vue', '真实安环汇总'],
  [files.frontend, 'App.vue', '安全巡检'],
  [files.frontend, 'App.vue', '隐患整改'],
  [files.frontend, 'App.vue', '环境记录'],
  [files.frontend, 'App.vue', 'PPE/设备安全提醒'],
  [files.frontend, 'App.vue', '安环事件统计'],
  [files.openapi, 'openapi.yaml', 'ProductionSafetyEnvironmentSummary'],
  [files.openapi, 'openapi.yaml', 'getProductionSafetyEnvironmentSummary']
]

const missing = checks.filter(([content, name, needle]) => !content.includes(needle))

if (missing.length) {
  console.error('9D.52 production safety environment summary check failed:')
  for (const [, name, needle] of missing) {
    console.error(`- ${name} missing ${needle}`)
  }
  process.exit(1)
}

console.log('9D.52 production safety environment summary static check passed.')
