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
