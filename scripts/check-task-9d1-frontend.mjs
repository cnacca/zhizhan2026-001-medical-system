import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const viteConfig = fs.readFileSync('frontend/vite.config.ts', 'utf8')

const requiredAppFragments = [
  'type DoctorOrderItem',
  'type DoctorOrderWorkspace',
  'doctorOrders',
  'selectedDoctorOrder',
  'loadDoctorOrders',
  'loadDoctorOrderWorkspace',
  'confirmDoctorReceipt',
  'askDoctorAi',
  '医生订单工作台',
  '设计稿',
  '账单物流',
  '医生 AI'
]

const requiredProxyFragments = [
  "'/orders'",
  "'/ai'"
]

const missing = [
  ...requiredAppFragments.filter((fragment) => !app.includes(fragment)).map((fragment) => `frontend/src/App.vue -> ${fragment}`),
  ...requiredProxyFragments.filter((fragment) => !viteConfig.includes(fragment)).map((fragment) => `frontend/vite.config.ts -> ${fragment}`)
]

if (missing.length > 0) {
  console.error('task 9D.1 frontend check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.1 frontend check ok')
