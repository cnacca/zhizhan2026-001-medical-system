import fs from 'node:fs'

const files = {
  migration: fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V27__rework_dictionary_management.sql', 'utf8'),
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', 'utf8'),
  controller: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java', 'utf8'),
  app: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8'),
  foundation: fs.readFileSync('docs/development/open-source-foundation-reuse-gap-list.md', 'utf8'),
  pkg: fs.readFileSync('package.json', 'utf8')
}

const requiredFragments = [
  [files.migration, 'V27__rework_dictionary_management.sql', 'CREATE TABLE rework_dictionary_item'],
  [files.migration, 'V27__rework_dictionary_management.sql', 'rework:dictionary:manage'],
  [files.migration, 'V27__rework_dictionary_management.sql', '/system/rework-dictionaries'],
  [files.service, 'WorkflowExecutionService.java', 'createReworkDictionaryItem'],
  [files.service, 'WorkflowExecutionService.java', 'updateReworkDictionaryItem'],
  [files.service, 'WorkflowExecutionService.java', 'listReworkDictionaryItems'],
  [files.service, 'WorkflowExecutionService.java', "status = 'ACTIVE'"],
  [files.controller, 'WorkflowExecutionController.java', '@PostMapping("/reworks/dictionaries/items")'],
  [files.controller, 'WorkflowExecutionController.java', '@PutMapping("/reworks/dictionaries/items/{itemId}")'],
  [files.controller, 'WorkflowExecutionController.java', 'rework:dictionary:manage'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'adminCanManageReworkDictionaryItemsAndCloseOnlyUsesActiveItems'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'CUSTOM_REASON_'],
  [files.app, 'frontend/src/App.vue', 'isReworkDictionariesRoute'],
  [files.app, 'frontend/src/App.vue', 'createReworkDictionaryItem'],
  [files.app, 'frontend/src/App.vue', 'rework-dictionary-create-button'],
  [files.app, 'frontend/src/App.vue', '/system/rework-dictionaries'],
  [files.openapi, 'docs/api/openapi.yaml', 'ReworkDictionaryItemResponse'],
  [files.openapi, 'docs/api/openapi.yaml', '/reworks/dictionaries/items'],
  [files.openapi, 'docs/api/openapi.yaml', '任务 9D.55 第一增量'],
  [files.foundation, 'open-source-foundation-reuse-gap-list.md', 'RuoYi-Vue-Pro'],
  [files.foundation, 'open-source-foundation-reuse-gap-list.md', '返工字典'],
  [files.pkg, 'package.json', 'check:task9d55']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.55 rework dictionary management check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.55 rework dictionary management check ok')
