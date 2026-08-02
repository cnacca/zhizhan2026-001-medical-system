import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const service = fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/CollaborationService.java', 'utf8')
const response = fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/DesignDraftResponse.java', 'utf8')
const migration = fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V14__design_draft_multi_file.sql', 'utf8')
const tests = fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/collaboration/MessageDesignBillNotificationTests.java', 'utf8')
const openapi = fs.readFileSync('docs/api/openapi.yaml', 'utf8')

const requiredFragments = [
  [app, 'frontend/src/App.vue', 'file_ids: number[]'],
  [app, 'frontend/src/App.vue', 'file_count: number'],
  [app, 'frontend/src/App.vue', 'draft.file_ids.join'],
  [app, 'frontend/src/App.vue', 'uploadInternalDesignDraft'],
  [app, 'frontend/src/App.vue', 'internal-design-draft-file-ids'],
  [app, 'frontend/src/App.vue', 'internal-design-draft-upload-button'],
  [response, 'DesignDraftResponse.java', '@JsonProperty("file_ids")'],
  [response, 'DesignDraftResponse.java', '@JsonProperty("file_count")'],
  [service, 'CollaborationService.java', 'insertDesignDraftFiles'],
  [service, 'CollaborationService.java', 'loadDesignDraftFileIds'],
  [service, 'CollaborationService.java', 'normalizeFileIds'],
  [migration, 'V14__design_draft_multi_file.sql', 'CREATE TABLE design_draft_file'],
  [migration, 'V14__design_draft_multi_file.sql', 'INSERT INTO design_draft_file'],
  [tests, 'MessageDesignBillNotificationTests.java', 'designDraftUploadKeepsMultipleFilesPerVersionAndIncrementsVersions'],
  [openapi, 'docs/api/openapi.yaml', '任务 9D.13 第一增量'],
  [openapi, 'docs/api/openapi.yaml', 'file_count']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.13 design draft check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.13 design draft check ok')
