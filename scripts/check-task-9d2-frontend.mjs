import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const viteConfig = fs.readFileSync('frontend/vite.config.ts', 'utf8')

const requiredAppFragments = [
  'type FormFieldConfig',
  'type CreateOrderResponse',
  'doctorOrderFormFields',
  'doctorOrderFormData',
  'doctorOrderFileIds',
  'loadDoctorOrderForm',
  'createDoctorOrder',
  'parseDoctorOrderFileIds',
  '新建订单',
  '提交订单',
  '/form-configs',
  '/orders'
]

const requiredProxyFragments = [
  "'/form-configs'",
  "'/orders'",
  "'/files'"
]

const missing = [
  ...requiredAppFragments.filter((fragment) => !app.includes(fragment)).map((fragment) => `frontend/src/App.vue -> ${fragment}`),
  ...requiredProxyFragments.filter((fragment) => !viteConfig.includes(fragment)).map((fragment) => `frontend/vite.config.ts -> ${fragment}`)
]

if (missing.length > 0) {
  console.error('task 9D.2 frontend check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.2 frontend check ok')
