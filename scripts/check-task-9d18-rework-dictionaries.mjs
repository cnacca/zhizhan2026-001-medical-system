import fs from 'node:fs'

const files = {
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', 'utf8'),
  controller: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java', 'utf8'),
  option: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ReworkDictionaryOption.java', 'utf8'),
  response: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ReworkDictionariesResponse.java', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java', 'utf8'),
  migration: fs.existsSync('backend/platform-server/src/main/resources/db/migration/V27__rework_dictionary_management.sql')
    ? fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V27__rework_dictionary_management.sql', 'utf8')
    : '',
  app: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8'),
  pkg: fs.readFileSync('package.json', 'utf8')
}

const requiredFragments = [
  [files.service, 'WorkflowExecutionService.java', 'listActiveReworkDictionaryOptions'],
  [files.service, 'WorkflowExecutionService.java', 'rework_dictionary_item'],
  [files.service, 'WorkflowExecutionService.java', 'normalizeDictionaryValue'],
  [files.service, 'WorkflowExecutionService.java', 'unsupported rework reason category'],
  [files.migration, 'V27__rework_dictionary_management.sql', 'rework_dictionary_item'],
  [files.migration, 'V27__rework_dictionary_management.sql', 'REASON_CATEGORY'],
  [files.migration, 'V27__rework_dictionary_management.sql', 'RESPONSIBILITY_TYPE'],
  [files.controller, 'WorkflowExecutionController.java', '/reworks/dictionaries'],
  [files.option, 'ReworkDictionaryOption.java', 'record ReworkDictionaryOption'],
  [files.response, 'ReworkDictionariesResponse.java', '@JsonProperty("reason_categories")'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'reworkCloseUsesServerDictionaryAndRejectsUnsupportedClassification'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'UNLISTED_REASON'],
  [files.app, 'frontend/src/App.vue', 'type ReworkDictionariesResponse'],
  [files.app, 'frontend/src/App.vue', 'loadReworkDictionaries'],
  [files.app, 'frontend/src/App.vue', '/reworks/dictionaries'],
  [files.app, 'frontend/src/App.vue', 'reworkReasonCategories'],
  [files.openapi, 'docs/api/openapi.yaml', '任务 9D.18 第一增量'],
  [files.openapi, 'docs/api/openapi.yaml', 'ReworkDictionariesResponse'],
  [files.pkg, 'package.json', 'check:task9d18']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.18 rework dictionaries check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.18 rework dictionaries check ok')
