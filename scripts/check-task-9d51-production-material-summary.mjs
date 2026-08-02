import fs from 'node:fs'

const files = {
  controller: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java', 'utf8'),
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', 'utf8'),
  response: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionMaterialExceptionSummaryResponse.java', 'utf8'),
  migration: fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V23__production_material_exception_foundation.sql', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/production/ProductionMaterialExceptionSummaryTests.java', 'utf8'),
  frontend: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8')
}

const checks = [
  [files.controller, 'WorkflowExecutionController.java', '"/production/material-exceptions/summary"'],
  [files.controller, 'WorkflowExecutionController.java', 'getProductionMaterialExceptionSummary'],
  [files.service, 'WorkflowExecutionService.java', 'getProductionMaterialExceptionSummary'],
  [files.service, 'WorkflowExecutionService.java', "m.exception_type = 'SHORTAGE'"],
  [files.service, 'WorkflowExecutionService.java', "m.exception_type = 'WRONG_MATERIAL'"],
  [files.service, 'WorkflowExecutionService.java', "m.exception_type = 'BATCH_ABNORMAL'"],
  [files.service, 'WorkflowExecutionService.java', "m.exception_type = 'MATERIAL_LOSS'"],
  [files.response, 'ProductionMaterialExceptionSummaryResponse.java', '@JsonProperty("responsibility_assigned_count")'],
  [files.response, 'ProductionMaterialExceptionSummaryResponse.java', '@JsonProperty("total_loss_quantity")'],
  [files.migration, 'V23__production_material_exception_foundation.sql', 'CREATE TABLE production_material_exception'],
  [files.tests, 'ProductionMaterialExceptionSummaryTests.java', 'productionMaterialExceptionSummaryAggregatesTypeStatusAndResponsibility'],
  [files.tests, 'ProductionMaterialExceptionSummaryTests.java', 'doctorCannotReadProductionMaterialExceptionSummary'],
  [files.frontend, 'App.vue', 'type ProductionMaterialExceptionSummaryResponse'],
  [files.frontend, 'App.vue', 'loadProductionMaterialExceptionSummary'],
  [files.frontend, 'App.vue', '/production/material-exceptions/summary'],
  [files.frontend, 'App.vue', "title: '物料异常'"],
  [files.frontend, 'App.vue', '缺料'],
  [files.frontend, 'App.vue', '错料'],
  [files.frontend, 'App.vue', '批次异常'],
  [files.frontend, 'App.vue', '材料损耗'],
  [files.frontend, 'App.vue', '责任归属'],
  [files.openapi, 'openapi.yaml', 'ProductionMaterialExceptionSummary'],
  [files.openapi, 'openapi.yaml', 'getProductionMaterialExceptionSummary']
]

const missing = checks.filter(([content, name, needle]) => !content.includes(needle))

if (missing.length) {
  console.error('9D.51 production material exception summary check failed:')
  for (const [, name, needle] of missing) {
    console.error(`- ${name} missing ${needle}`)
  }
  process.exit(1)
}

console.log('9D.51 production material exception summary static check passed.')
