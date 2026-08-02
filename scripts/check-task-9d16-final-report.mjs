import fs from 'node:fs'

const files = {
  migration: fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V15__final_inspection_report.sql', 'utf8'),
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', 'utf8'),
  controller: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java', 'utf8'),
  response: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/FinalInspectionReportResponse.java', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java', 'utf8'),
  app: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  vite: fs.readFileSync('frontend/vite.config.ts', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8')
}

const requiredFragments = [
  [files.migration, 'V15__final_inspection_report.sql', 'CREATE TABLE final_inspection_report'],
  [files.migration, 'V15__final_inspection_report.sql', 'uk_final_inspection_report_order'],
  [files.service, 'WorkflowExecutionService.java', 'createFinalInspectionReport'],
  [files.service, 'WorkflowExecutionService.java', 'final OUT/PASS check is required before final inspection report'],
  [files.controller, 'WorkflowExecutionController.java', '/final-inspection-reports'],
  [files.response, 'FinalInspectionReportResponse.java', '@JsonProperty("report_no")'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'finalInspectionReportRequiresFinalOutPassAndIsInternalOnly'],
  [files.tests, 'CheckWorklogPerformanceTests.java', '终检报告第一增量'],
  [files.app, 'frontend/src/App.vue', 'type FinalInspectionReportResponse'],
  [files.app, 'frontend/src/App.vue', 'createFinalInspectionReport'],
  [files.app, 'frontend/src/App.vue', 'final-inspection-report-create-button'],
  [files.app, 'frontend/src/App.vue', '生成终检报告'],
  [files.vite, 'frontend/vite.config.ts', '/final-inspection-reports'],
  [files.openapi, 'docs/api/openapi.yaml', '任务 9D.16 第一增量'],
  [files.openapi, 'docs/api/openapi.yaml', 'FinalInspectionReportResponse']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.16 final inspection report check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.16 final inspection report check ok')
