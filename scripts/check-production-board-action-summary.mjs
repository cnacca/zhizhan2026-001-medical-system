import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const appPath = path.join(root, 'frontend/src/App.vue')
const stylePath = path.join(root, 'frontend/src/styles.css')
const app = fs.readFileSync(appPath, 'utf8')
const styles = fs.readFileSync(stylePath, 'utf8')
const boardStart = app.indexOf('<section v-else-if="isProductionBoardRoute"')
const boardEnd = app.indexOf('<section v-else-if="isDoctorOrderRoute"', boardStart)
const board = boardStart === -1 || boardEnd === -1 ? '' : app.slice(boardStart, boardEnd)

const requiredFragments = [
  "const productionBoardActionSummaryFilter = ref<ProductionBoardActionSummaryKey>('all')",
  'const productionBoardActionSummaryGroups = computed<ProductionBoardActionSummaryGroup[]>(() =>',
  "label: '工序超时'",
  "label: '返工处理中'",
  "label: '加急'",
  "label: '医生待确认'",
  "label: '待生产审核'",
  "label: '待派工'",
  "label: '生产中'",
  "label: '终检待发'",
  'productionBoardActionSummaryFilter === item.key',
  'v-for="group in productionBoardActionSummaryGroups"',
  'v-for="item in group.items"'
]

const failures = [
  ...(board ? [] : ['无法定位生产看板页面区块']),
  ...requiredFragments
    .filter((fragment) => !app.includes(fragment))
    .map((fragment) => `App.vue 缺少待办概览片段: ${fragment}`),
  ...(board.includes('v-for="chip in prototypeQueueChips"') ? ['生产看板不应继续复用固定状态标签'] : []),
  ...(board.includes('生产异常') ? ['生产看板不应继续显示泛化的生产异常标签'] : []),
  ...(board.includes("label: '在制订单'") ? ['生产看板顶部不应继续显示在制订单'] : [])
]

const requiredStyleFragments = [
  '.production-board-action-summary {\n  display: grid;',
  'grid-template-columns: 76px minmax(0, 1fr);',
  '.production-board-action-label {\n  color: #64748b;\n  font-size: 13px;'
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

console.log('生产看板待办概览检查通过')
