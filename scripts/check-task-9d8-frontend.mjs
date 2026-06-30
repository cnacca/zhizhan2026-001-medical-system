import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const openapi = fs.readFileSync('docs/api/openapi.yaml', 'utf8')
const migration = fs.existsSync('backend/platform-server/src/main/resources/db/migration/V9__production_board_menu_seed.sql')
  ? fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V9__production_board_menu_seed.sql', 'utf8')
  : ''

const requiredAppFragments = [
  'productionBoardOrders',
  'productionBoardStatus',
  'productionBoardInstance',
  'loadProductionBoardOrders',
  'loadProductionBoardInstance',
  'isProductionBoardRoute',
  '/production/board',
  '生产看板',
  '跨状态生产检索',
  '节点进度',
  'PENDING_PRODUCTION_REVIEW',
  'PROCESS_INSTANCE_CREATED',
  'PRODUCING',
  'READY',
  'IN_PROGRESS',
  'COMPLETED'
]

const requiredMigrationFragments = [
  'production-board',
  '生产看板',
  '/production/board',
  'order:read-internal',
  'system_role_menu'
]

const requiredOpenApiFragments = [
  '"/orders":',
  'internal_status',
  '"/orders/{orderId}/process-instance":'
]

const missing = [
  ...requiredAppFragments.filter((fragment) => !app.includes(fragment)).map((fragment) => `frontend/src/App.vue -> ${fragment}`),
  ...requiredMigrationFragments.filter((fragment) => !migration.includes(fragment)).map((fragment) => `V9__production_board_menu_seed.sql -> ${fragment}`),
  ...requiredOpenApiFragments.filter((fragment) => !openapi.includes(fragment)).map((fragment) => `docs/api/openapi.yaml -> ${fragment}`)
]

if (missing.length > 0) {
  console.error('task 9D.8 frontend check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.8 frontend check ok')
