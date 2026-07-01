import fs from 'node:fs'

const files = {
  migration: fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V16__rework_close_metadata.sql', 'utf8'),
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', 'utf8'),
  controller: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java', 'utf8'),
  request: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ReworkCloseRequest.java', 'utf8'),
  response: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ReworkRecordResponse.java', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java', 'utf8'),
  app: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8'),
  pkg: fs.readFileSync('package.json', 'utf8')
}

const requiredFragments = [
  [files.migration, 'V16__rework_close_metadata.sql', 'closed_at DATETIME(3)'],
  [files.migration, 'V16__rework_close_metadata.sql', 'idx_rework_record_closed'],
  [files.service, 'WorkflowExecutionService.java', 'closeRework'],
  [files.service, 'WorkflowExecutionService.java', 'rework target OUT/PASS check is required before closing rework'],
  [files.controller, 'WorkflowExecutionController.java', '/reworks/{reworkId}/close'],
  [files.request, 'ReworkCloseRequest.java', '@JsonProperty("responsibility_type")'],
  [files.response, 'ReworkRecordResponse.java', '@JsonProperty("closed_at")'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'reworkCanCloseOnlyAfterTargetOutPassAndKeepsResponsibilityClassification'],
  [files.app, 'frontend/src/App.vue', 'closeSelectedRework'],
  [files.app, 'frontend/src/App.vue', 'rework-close-button'],
  [files.app, 'frontend/src/App.vue', '关闭返工'],
  [files.openapi, 'docs/api/openapi.yaml', '任务 9D.17 第一增量'],
  [files.openapi, 'docs/api/openapi.yaml', 'ReworkCloseRequest'],
  [files.pkg, 'package.json', 'check:task9d17']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.17 rework close check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.17 rework close check ok')
