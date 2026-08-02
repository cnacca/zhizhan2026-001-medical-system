import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const appPath = path.join(root, 'frontend/src/App.vue')
const stylePath = path.join(root, 'frontend/src/styles.css')
const app = fs.readFileSync(appPath, 'utf8')
const styles = fs.readFileSync(stylePath, 'utf8')
const boardStart = app.indexOf('<section v-else-if="isProductionBoardRoute"')
const boardEnd = app.indexOf('\n        <section v-else-if=', boardStart + 1)
const board = boardStart === -1 || boardEnd === -1 ? '' : app.slice(boardStart, boardEnd)

const requiredFragments = [
  'class="factory-kanban-header"',
  'class="factory-kanban-date-controls"',
  'class="factory-kanban-summary-bar"',
  'class="factory-kanban-grid"',
  'class="factory-kanban-card"',
  'class="factory-kanban-drawer"'
]

const failures = [
  ...(board ? [] : ['无法定位生产看板页面区块']),
  ...requiredFragments
    .filter((fragment) => !app.includes(fragment))
    .map((fragment) => `App.vue 缺少待办概览片段: ${fragment}`),
  ...(board.includes('production-board-action-summary') ? ['生产看板不应继续显示自定义待办概览'] : []),
  ...(board.includes('production-board-toolbar') ? ['生产看板不应继续显示旧版筛选工具栏'] : []),
  ...(board.includes('production-kanban-summary-row') ? ['生产看板不应继续显示旧版摘要卡片'] : [])
]

const requiredStyleFragments = [
  '.factory-kanban-header {',
  '.factory-kanban-card {',
  '.factory-drawer-timeline {'
]

failures.push(
  ...requiredStyleFragments
    .filter((fragment) => !styles.includes(fragment))
    .map((fragment) => `styles.css 缺少两行待办概览样式: ${fragment}`)
)

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('生产看板参考页结构检查通过')
