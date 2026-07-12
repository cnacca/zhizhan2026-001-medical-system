import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const styles = fs.readFileSync('frontend/src/styles.css', 'utf8')

const required = [
  [app, 'App.vue', "const isProductionOrdersView = computed(() => activeNavId.value === 'production-orders')"],
  [app, 'App.vue', 'factory-orders-page'],
  [app, 'App.vue', 'factory-orders-topbar'],
  [app, 'App.vue', 'factory-filter-chip'],
  [app, 'App.vue', 'factory-data-table'],
  [app, 'App.vue', 'factory-table-scroll'],
  [app, 'App.vue', 'factory-orders-drawer'],
  [app, 'App.vue', 'factory-task-grid'],
  [app, 'App.vue', 'factory-task-card'],
  [app, 'App.vue', 'factory-scan-layout'],
  [app, 'App.vue', 'factory-check-history'],
  [app, 'App.vue', 'isProductionQualityOverviewView'],
  [app, 'App.vue', 'isInternalReworkView'],
  [app, 'App.vue', 'isExternalReworkView'],
  [app, 'App.vue', 'isFinalReportView'],
  [app, 'App.vue', 'factory-rework-page'],
  [app, 'App.vue', 'factory-external-rework-page'],
  [app, 'App.vue', 'factory-final-report-page'],
  [app, 'App.vue', 'factory-staff-grid'],
  [app, 'App.vue', 'factory-staff-card'],
  [app, 'App.vue', 'factory-performance-hero'],
  [app, 'App.vue', 'factory-performance-table'],
  [app, 'App.vue', 'factory-reward-page'],
  [app, 'App.vue', 'factory-support-page'],
  [app, 'App.vue', 'factory-message-layout'],
  [app, 'App.vue', 'factory-cloud-page'],
  [styles, 'styles.css', '.portal-production .factory-rework-page'],
  [styles, 'styles.css', '.portal-production .factory-final-report-page'],
  [styles, 'styles.css', '.portal-production .factory-staff-grid'],
  [styles, 'styles.css', '.portal-production .factory-support-page'],
  [styles, 'styles.css', '.portal-production .factory-message-layout'],
  [app, 'App.vue', 'openProductionBoardOrder(order)'],
  [app, 'App.vue', 'printSelectedProductionOrders'],
  [styles, 'styles.css', '.portal-production .factory-orders-page'],
  [styles, 'styles.css', '.portal-production .factory-orders-topbar'],
  [styles, 'styles.css', '.portal-production .factory-task-grid'],
  [styles, 'styles.css', '.portal-production .factory-scan-layout'],
  [styles, 'styles.css', '.portal-production .factory-data-table'],
  [styles, 'styles.css', '@media print']
]

const failures = required
  .filter(([content, , fragment]) => !content.includes(fragment))
  .map(([, file, fragment]) => `${file} missing: ${fragment}`)

if (app.includes('工序待同步') || app.includes('工序待映射')) {
  failures.push('App.vue contains prohibited technical production copy')
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('生产端参考页复刻结构检查通过')
