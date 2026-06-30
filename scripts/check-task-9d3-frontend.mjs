import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const viteConfig = fs.readFileSync('frontend/vite.config.ts', 'utf8')

const requiredAppFragments = [
  'type InternalOrderItem',
  'internalOrders',
  'selectedInternalOrder',
  'loadInternalOrders',
  'selectInternalOrder',
  'reviewInternalOrder',
  'internal_status',
  'PENDING_CS_REVIEW',
  '/review',
  '客服初审',
  '通过初审',
  '驳回'
]

const requiredProxyFragments = [
  "'/orders'"
]

const missing = [
  ...requiredAppFragments.filter((fragment) => !app.includes(fragment)).map((fragment) => `frontend/src/App.vue -> ${fragment}`),
  ...requiredProxyFragments.filter((fragment) => !viteConfig.includes(fragment)).map((fragment) => `frontend/vite.config.ts -> ${fragment}`)
]

if (missing.length > 0) {
  console.error('task 9D.3 frontend check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.3 frontend check ok')
