import fs from 'node:fs'

const files = {
  app: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  styles: fs.readFileSync('frontend/src/styles.css', 'utf8'),
  packageJson: fs.readFileSync('package.json', 'utf8'),
  spec: fs.readFileSync('docs/design/production-kanban-redesign-20260709.md', 'utf8'),
}
const boardStart = files.app.indexOf('<section v-else-if="isProductionBoardRoute"')
const boardEnd = files.app.indexOf('\n        <section v-else-if=', boardStart + 1)
const board = boardStart === -1 || boardEnd === -1 ? '' : files.app.slice(boardStart, boardEnd)

const requiredFragments = [
  [files.packageJson, 'package.json', 'check:production-kanban-redesign'],
  [files.spec, 'docs/design/production-kanban-redesign-20260709.md', '不改后端接口'],
  [files.spec, 'docs/design/production-kanban-redesign-20260709.md', '点击卡片后打开覆盖式抽屉'],
  [files.app, 'frontend/src/App.vue', 'type ProductionKanbanCard'],
  [files.app, 'frontend/src/App.vue', 'type ProductionKanbanSyncState'],
  [files.app, 'frontend/src/App.vue', 'productionBoardProcessInstances'],
  [files.app, 'frontend/src/App.vue', 'syncProductionBoardProcessInstances'],
  [files.app, 'frontend/src/App.vue', 'buildProductionKanbanCard'],
  [files.app, 'frontend/src/App.vue', 'productionBoardStageDefinitions'],
  [files.app, 'frontend/src/App.vue', 'class="factory-kanban-grid"'],
  [files.app, 'frontend/src/App.vue', 'class="factory-kanban-card"'],
  [files.app, 'frontend/src/App.vue', 'class="factory-kanban-drawer"'],
  [files.app, 'frontend/src/App.vue', '今天'],
  [files.styles, 'frontend/src/styles.css', '.factory-kanban-summary-bar'],
  [files.styles, 'frontend/src/styles.css', '.factory-card-progress'],
  [files.styles, 'frontend/src/styles.css', '.factory-drawer-timeline'],
]

const forbiddenFragments = [
  [files.app, 'frontend/src/App.vue', 'draggable='],
  [files.app, 'frontend/src/App.vue', 'setInterval('],
  [files.app, 'frontend/src/App.vue', 'setTimeout(syncProductionBoardProcessInstances'],
  [board, 'production board', 'production-board-action-summary'],
  [board, 'production board', 'production-board-control-deck'],
]

const failures = []

for (const [content, file, fragment] of requiredFragments) {
  if (!content.includes(fragment)) {
    failures.push(`${file} missing required text: ${fragment}`)
  }
}

for (const [content, file, fragment] of forbiddenFragments) {
  if (content.includes(fragment)) {
    failures.push(`${file} contains forbidden production Kanban behavior: ${fragment}`)
  }
}

if (failures.length > 0) {
  console.error('production Kanban redesign check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('production Kanban redesign check ok')
