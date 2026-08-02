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
  'featuredPanel: {',
  "title: '生产运营待办'",
  "title: '生产异常'",
  "title: '待问异常 / 员工异常'",
  "title: '质量与返工'",
  "title: '设备异常'",
  "title: '安环 / 奖惩待办'",
  "{ label: '本月订单'",
  "{ label: '本月件数'",
  "{ label: '发货率'",
  "{ label: '物料异常'",
  'activePrototypeDashboard.monthComparison',
  'class="production-workbench-top-broadcast"',
  "portalTone === 'production' && activeRoute === '/dashboard'",
  '客服发货前待复核',
  'production-operation-todo-list',
  'v-for="item in activePrototypeDashboard.featuredPanel.items"',
  '点击部门可联动右侧近 7 日趋势',
  "{ label: '内返率'",
  "{ label: '外返率'",
  "{ label: '发货率'",
  "{ label: '客诉率'",
  '<h3>部门效能对比</h3>',
  '<th>内返率</th>',
  '<th>外返率</th>',
  '<th>客诉率</th>',
  '<th>完成达成率</th>',
  '@click="selectProductionWorkbenchDepartment(department.department_key)"',
  'const showAllProductionWorkbenchDepartments = ref(false)',
  'const visibleProductionWorkbenchDepartments = computed(() =>',
  'v-for="department in visibleProductionWorkbenchDepartments"',
  '查看全部'
  ,'selectedProductionWorkbenchTrendMetric'
  ,'production-department-trend-row'
  ,'production-department-workspace'
  ,'近 7 个生产日趋势'
  ,'@click="selectProductionWorkbenchDepartment(department.department_key)"'
]

const forbiddenProductionFragments = [
  "title: '成本预警'",
  "title: '成本异常'",
  'supportPanel:',
  "title: '质量 / 设备 / 物料待办'",
  "title: '物料管理'"
]

const forbiddenAppFragments = [
  'activePrototypeDashboard.featuredPanel.items.slice(0, 3)',
  'activePrototypeDashboard.featuredPanel.items.slice(3)',
  '部门负载变化',
  'production-dashboard-workload-card',
  'class="prototype-sync-banner production-dashboard-live-strip"'
]

const requiredStyleFragments = [
  '.production-month-metric-grid',
  '.production-week-rate-row',
  '.production-department-table',
  '.production-department-expand'
  ,'.production-department-line-chart'
  ,'.production-department-workspace'
  ,'.production-workbench-top-broadcast'
]

const missingApp = requiredAppFragments.filter((fragment) => !app.includes(fragment))
const forbiddenApp = forbiddenProductionFragments.filter((fragment) => productionBlock.includes(fragment))
const missingStyles = requiredStyleFragments.filter((fragment) => !styles.includes(fragment))
const weekRatesStart = productionBlock.indexOf('weekRates: [')
const weekRatesEnd = productionBlock.indexOf(']', weekRatesStart)
const weekRatesBlock = weekRatesStart === -1 || weekRatesEnd === -1
  ? ''
  : productionBlock.slice(weekRatesStart, weekRatesEnd)

const failures = [
  ...missingApp.map((fragment) => `App.vue 缺少工作台布局片段: ${fragment}`),
  ...forbiddenApp.map((fragment) => `生产工作台首页不应继续出现成本入口: ${fragment}`),
  ...forbiddenAppFragments.filter((fragment) => app.includes(fragment)).map((fragment) => `生产运营待办不应再拆分列表: ${fragment}`),
  ...(weekRatesBlock.includes("{ label: '返工率'") ? ['周环比速率不应继续使用笼统返工率'] : []),
  ...missingStyles.map((fragment) => `styles.css 缺少工作台同排样式: ${fragment}`)
]

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('生产工作台首页布局检查通过')
