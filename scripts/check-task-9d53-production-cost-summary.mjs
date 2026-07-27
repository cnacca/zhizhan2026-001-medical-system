import fs from 'node:fs'

const files = {
  controller: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java', 'utf8'),
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', 'utf8'),
  response: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionCostSummaryResponse.java', 'utf8'),
  migration: fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V25__production_cost_record_foundation.sql', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/production/ProductionCostSummaryTests.java', 'utf8'),
  frontend: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8')
}

const checks = [
  [files.controller, 'WorkflowExecutionController.java', '"/production/cost-management/summary"'],
  [files.controller, 'WorkflowExecutionController.java', 'getProductionCostSummary'],
  [files.service, 'WorkflowExecutionService.java', 'getProductionCostSummary'],
  [files.service, 'WorkflowExecutionService.java', "c.cost_type = 'PROCESS'"],
  [files.service, 'WorkflowExecutionService.java', "c.cost_type = 'MATERIAL'"],
  [files.service, 'WorkflowExecutionService.java', "c.cost_type = 'LABOR'"],
  [files.service, 'WorkflowExecutionService.java', "c.cost_type = 'REWORK'"],
  [files.service, 'WorkflowExecutionService.java', "c.cost_type = 'OUTSOURCING'"],
  [files.response, 'ProductionCostSummaryResponse.java', '@JsonProperty("abnormal_warning_count")'],
  [files.migration, 'V25__production_cost_record_foundation.sql', 'CREATE TABLE production_cost_record'],
  [files.tests, 'ProductionCostSummaryTests.java', 'productionCostSummaryAggregatesCostTypesAndWarnings'],
  [files.tests, 'ProductionCostSummaryTests.java', 'doctorCannotReadProductionCostSummary'],
  [files.frontend, 'App.vue', 'type ProductionCostSummaryResponse'],
  [files.frontend, 'App.vue', 'loadProductionCostSummary'],
  [files.frontend, 'App.vue', '/production/cost-management/summary'],
  [files.frontend, 'App.vue', "title: '成本管控'"],
  [files.frontend, 'App.vue', '工序成本'],
  [files.frontend, 'App.vue', '材料成本'],
  [files.frontend, 'App.vue', '人工成本'],
  [files.frontend, 'App.vue', '返工成本'],
  [files.frontend, 'App.vue', '外协成本'],
  [files.frontend, 'App.vue', '成本异常预警'],
  [files.openapi, 'openapi.yaml', 'ProductionCostSummary'],
  [files.openapi, 'openapi.yaml', 'getProductionCostSummary']
]

const missing = checks.filter(([content, name, needle]) => !content.includes(needle))

if (missing.length) {
  console.error('9D.53 production cost summary check failed:')
  for (const [, name, needle] of missing) {
    console.error(`- ${name} missing ${needle}`)
  }
  process.exit(1)
}

console.log('9D.53 production cost summary static check passed.')
