import fs from 'node:fs'

const files = {
  app: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  styles: fs.readFileSync('frontend/src/styles.css', 'utf8'),
  packageJson: fs.readFileSync('package.json', 'utf8'),
  spec: fs.readFileSync('docs/design/production-kanban-redesign-20260709.md', 'utf8'),
}

const requiredFragments = [
  [files.packageJson, 'package.json', 'check:production-kanban-redesign'],
  [files.spec, 'docs/design/production-kanban-redesign-20260709.md', '不改后端接口'],
  [files.spec, 'docs/design/production-kanban-redesign-20260709.md', '点击卡片后打开覆盖式抽屉'],
  [files.app, 'frontend/src/App.vue', 'type ProductionKanbanCard'],
  [files.app, 'frontend/src/App.vue', 'type ProductionKanbanSyncState'],
  [files.app, 'frontend/src/App.vue', 'productionBoardProcessInstances'],
  [files.app, 'frontend/src/App.vue', 'syncProductionBoardProcessInstances'],
  [files.app, 'frontend/src/App.vue', 'buildProductionKanbanCard'],
  [files.app, 'frontend/src/App.vue', 'productionBoardAuxiliaryColumns'],
  [files.app, 'frontend/src/App.vue', 'productionBoardProcessColumns'],
  [files.app, 'frontend/src/App.vue', 'productionBoardKanbanSummaries'],
  [files.app, 'frontend/src/App.vue', 'productionBoardDrawerVisible'],
  [files.app, 'frontend/src/App.vue', '<el-drawer'],
  [files.app, 'frontend/src/App.vue', '工序待同步'],
  [files.app, 'frontend/src/App.vue', '最后同步'],
  [files.app, 'frontend/src/App.vue', 'Today'],
  [files.styles, 'frontend/src/styles.css', '.production-board-control-deck'],
  [files.styles, 'frontend/src/styles.css', '.production-kanban-summary-chip'],
  [files.styles, 'frontend/src/styles.css', '.production-kanban-card-progress'],
  [files.styles, 'frontend/src/styles.css', '.production-board-drawer'],
]

const forbiddenFragments = [
  [files.app, 'frontend/src/App.vue', 'draggable='],
  [files.app, 'frontend/src/App.vue', 'setInterval('],
  [files.app, 'frontend/src/App.vue', 'setTimeout(syncProductionBoardProcessInstances'],
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
