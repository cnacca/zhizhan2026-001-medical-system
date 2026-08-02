import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const openapi = fs.readFileSync('docs/api/openapi.yaml', 'utf8')
const vite = fs.readFileSync('frontend/vite.config.ts', 'utf8')
const migration = fs.existsSync('backend/platform-server/src/main/resources/db/migration/V10__rework_final_menu_seed.sql')
  ? fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V10__rework_final_menu_seed.sql', 'utf8')
  : ''

const requiredAppFragments = [
  'type ReworkRecordResponse',
  'reworkRecords',
  'finalInspectionTasks',
  'loadReworkRecords',
  'loadFinalInspectionTasks',
  'submitFinalInspectionCheck',
  'isReworkFinalRoute',
  '/rework-final',
  '/reworks',
  '返工终检',
  '待返工记录',
  '返工目标节点',
  '终检入口',
  '提交终检出检'
]

const requiredMigrationFragments = [
  'rework-final',
  '返工终检',
  '/rework-final',
  'check:write',
  'system_role_menu'
]

const requiredOpenApiFragments = [
  '"/reworks":',
  'ReworkRecordResponse',
  'target_node_status',
  'reason_detail'
]

const missing = [
  ...requiredAppFragments.filter((fragment) => !app.includes(fragment)).map((fragment) => `frontend/src/App.vue -> ${fragment}`),
  ...['/reworks'].filter((fragment) => !vite.includes(fragment)).map((fragment) => `frontend/vite.config.ts -> ${fragment}`),
  ...requiredMigrationFragments.filter((fragment) => !migration.includes(fragment)).map((fragment) => `V10__rework_final_menu_seed.sql -> ${fragment}`),
  ...requiredOpenApiFragments.filter((fragment) => !openapi.includes(fragment)).map((fragment) => `docs/api/openapi.yaml -> ${fragment}`)
]

if (missing.length > 0) {
  console.error('task 9D.9 frontend check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.9 frontend check ok')
