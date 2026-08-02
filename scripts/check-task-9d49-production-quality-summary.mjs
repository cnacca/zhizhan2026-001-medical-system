import fs from 'node:fs'

const files = {
  controller: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java', 'utf8'),
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', 'utf8'),
  response: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionQualitySummaryResponse.java', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java', 'utf8'),
  frontend: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  vite: fs.readFileSync('frontend/vite.config.ts', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8')
}

const checks = [
  [files.controller, 'WorkflowExecutionController.java', '"/production/quality/summary"'],
  [files.controller, 'WorkflowExecutionController.java', 'getProductionQualitySummary'],
  [files.service, 'WorkflowExecutionService.java', 'getProductionQualitySummary'],
  [files.service, 'WorkflowExecutionService.java', "r.responsibility_type = 'WORKER'"],
  [files.service, 'WorkflowExecutionService.java', "r.responsibility_type IN ('DOCTOR', 'CS')"],
  [files.response, 'ProductionQualitySummaryResponse.java', '@JsonProperty("internal_rework_rate")'],
  [files.response, 'ProductionQualitySummaryResponse.java', '@JsonProperty("external_rework_rate")'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'productionQualitySummarySplitsInternalAndExternalReworkRates'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'doctorCannotReadProductionQualitySummary'],
  [files.frontend, 'App.vue', 'type ProductionQualitySummaryResponse'],
  [files.frontend, 'App.vue', 'loadProductionQualitySummary'],
  [files.frontend, 'App.vue', '/production/quality/summary'],
  [files.frontend, 'App.vue', '内返率'],
  [files.frontend, 'App.vue', '外返率'],
  [files.vite, 'vite.config.ts', "'/production'"],
  [files.openapi, 'openapi.yaml', 'ProductionQualitySummary'],
  [files.openapi, 'openapi.yaml', 'getProductionQualitySummary']
]

const missing = checks.filter(([content, name, needle]) => !content.includes(needle))

if (missing.length) {
  console.error('9D.49 production quality summary check failed:')
  for (const [, name, needle] of missing) {
    console.error(`- ${name} missing ${needle}`)
  }
  process.exit(1)
}

console.log('9D.49 production quality summary static check passed.')
