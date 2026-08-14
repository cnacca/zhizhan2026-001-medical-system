import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const pages = fs.readFileSync('frontend/src/components/CsPortalPages.vue', 'utf8')
const styles = fs.readFileSync('frontend/src/cs-portal.css', 'utf8')

const required = [
  [app, 'App.vue', "| 'ALL_ORDERS'"],
  [app, 'App.vue', "| 'QUALITY_FOLLOW_UP'"],
  [app, 'App.vue', 'pendingReplyCount: customerAttentionItems.value.length'],
  [app, 'App.vue', "routePath: '/cs/quality', navId: 'cs-quality', focusTask: 'QUALITY_FOLLOW_UP'"],
  [app, 'App.vue', "focusOrderId: order.order_id"],
  [app, 'App.vue', '@focus-consumed="clearCsPortalFocusContext"'],
  [app, 'App.vue', 'function selectDashboardMetric(metric: DashboardMetric | DashboardMetricAction)'],
  [app, 'App.vue', '@keydown.enter.self.prevent="selectDashboardMetric(metric)"'],
  [pages, 'CsPortalPages.vue', "if (focusTask === 'WAITING_REPLY') inquiryTab.value = 'WAITING'"],
  [pages, 'CsPortalPages.vue', "if (focusTask === 'DESIGN_UPDATE') designFilter.value = 'UPDATED'"],
  [pages, 'CsPortalPages.vue', "if (focusTask === 'DELIVERY_FOLLOW_UP') deliveryStatus.value = 'FOLLOW_UP'"],
  [pages, 'CsPortalPages.vue', "if (focusTask === 'BILLING_PENDING')"],
  [pages, 'CsPortalPages.vue', "await loadQualityRecords()"],
  [pages, 'CsPortalPages.vue', "emit('focusConsumed')"],
  [pages, 'CsPortalPages.vue', "activeFocusKey.value === focusKey"],
  [styles, 'cs-portal.css', '.prototype-stat-card.is-actionable'],
  [styles, 'cs-portal.css', '.prototype-stat-split-actions']
]

const failures = required
  .filter(([content, , fragment]) => !content.includes(fragment))
  .map(([, file, fragment]) => `${file} missing: ${fragment}`)

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('客服工作台卡片跳转与一次性定位检查通过')
