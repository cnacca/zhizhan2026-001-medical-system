import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const viteConfig = fs.readFileSync('frontend/vite.config.ts', 'utf8')

const requiredAppFragments = [
  'type WorkflowChainSummary',
  'type ProductionReviewResponse',
  'productionReviewOrders',
  'selectedProductionReviewOrder',
  'loadProductionReviewPage',
  'loadProductionReviewOrders',
  'loadWorkflowChains',
  'reviewProductionOrder',
  'syncProductionReviewConfiguration',
  'productionReviewConfigurationReady',
  'openProductionReviewDrawer',
  'productionReviewFieldEntries',
  'sortProductionReviewOrders',
  'productionReviewRequiresAction',
  "size: '100'",
  "{ label: '待生产审核'",
  "NEEDS_INFO: '待补充资料'",
  "DESIGNING: '设计中'",
  "QC: '质检中'",
  "return /[\\u4e00-\\u9fff]/.test(status) ? status : '状态待确认'",
  "return labels[key] ?? '其他订单信息'",
  "? '未填写'",
  'data-testid="admin-production-review-page"',
  'data-testid="admin-production-review-drawer"',
  'class="admin-flow-table"',
  '工序链按产品自动匹配',
  '当前产品没有额外工艺分支，无需填写技术参数',
  '有 STL、PLY 等数字扫描资料时选择“口扫”',
  "id: 'admin-production-review'",
  'data-testid="admin-order-production-review"',
  'openSelectedAdminOrderProductionReview',
  'PENDING_PRODUCTION_REVIEW',
  '/production-review',
  '/workflow-chains',
  '生产审核',
  '通过生产审核',
  '驳回生产审核'
]

const requiredProxyFragments = [
  "'/orders'",
  "'/workflow-chains'"
]

const missing = [
  ...requiredAppFragments.filter((fragment) => !app.includes(fragment)).map((fragment) => `frontend/src/App.vue -> ${fragment}`),
  ...requiredProxyFragments.filter((fragment) => !viteConfig.includes(fragment)).map((fragment) => `frontend/vite.config.ts -> ${fragment}`)
]

if (missing.length > 0) {
  console.error('task 9D.4 frontend check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.4 frontend check ok')
