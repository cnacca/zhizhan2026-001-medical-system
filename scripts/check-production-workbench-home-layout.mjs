import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const appPath = path.join(root, 'frontend/src/App.vue')
const stylePath = path.join(root, 'frontend/src/styles.css')

const app = fs.readFileSync(appPath, 'utf8')
const styles = fs.readFileSync(stylePath, 'utf8')

const productionStart = app.indexOf('    production: {')
const productionEnd = app.indexOf('    admin: {', productionStart)
if (productionStart === -1 || productionEnd === -1) {
  throw new Error('无法定位 production 工作台配置')
}
const productionBlock = app.slice(productionStart, productionEnd)

const requiredAppFragments = [
  'featuredPanel?: DashboardPanel',
  'featuredPanel: {',
  "title: '生产异常待办'",
  'production-workbench-highlight-row',
  'production-exception-panel',
  'activePrototypeDashboard.monthComparison',
  "title: '生产经营待办'",
  "title: '质量 / 设备 / 物料'"
]

const forbiddenProductionFragments = [
  "title: '成本预警'",
  "title: '成本异常'"
]

const requiredStyleFragments = [
  '.production-workbench-highlight-row',
  'grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr)',
  '.production-exception-panel',
  '.production-workbench-highlight-row .production-month-comparison-card',
  '.production-workbench-highlight-row .production-month-metric-grid'
]

const missingApp = requiredAppFragments.filter((fragment) => !app.includes(fragment))
const forbiddenApp = forbiddenProductionFragments.filter((fragment) => productionBlock.includes(fragment))
const missingStyles = requiredStyleFragments.filter((fragment) => !styles.includes(fragment))

const failures = [
  ...missingApp.map((fragment) => `App.vue 缺少工作台布局片段: ${fragment}`),
  ...forbiddenApp.map((fragment) => `生产工作台首页不应继续出现成本入口: ${fragment}`),
  ...missingStyles.map((fragment) => `styles.css 缺少工作台同排样式: ${fragment}`)
]

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('生产工作台首页布局检查通过')
