import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const wizard = fs.readFileSync(
  path.join(root, 'frontend/src/doctor/DoctorCaseGroupWizard.vue'),
  'utf8'
)

const required = [
  'const pendingProductIds = ref<number[]>([])',
  'const pendingProducts = computed(() => pendingProductIds.value',
  'function toggleProductSelection(product: CatalogProduct)',
  'async function persistPendingProductsUnlocked()',
  'if (step.value === 1 && !(await persistPendingProductsUnlocked())) return',
  ':disabled="busy || persistedProductSelected(product)"',
  '@click="toggleProductSelection(product)"',
  '尚未保存，点击下一步后创建产品订单',
  '点击下一步时统一保存病例订单'
]

const failures = required
  .filter((text) => !wizard.includes(text))
  .map((text) => `DoctorCaseGroupWizard.vue missing: ${text}`)

const forbiddenPatientFirstGate = ':disabled="busy || !patientId || productSelected(product)"'
if (wizard.includes(forbiddenPatientFirstGate)) {
  failures.push('DoctorCaseGroupWizard.vue still requires a patient before selecting products')
}

const toggleStart = wizard.indexOf('function toggleProductSelection(product: CatalogProduct)')
const toggleEnd = wizard.indexOf('// AI-7：', toggleStart)
const toggleBody = toggleStart >= 0 && toggleEnd > toggleStart ? wizard.slice(toggleStart, toggleEnd) : ''
if (/\bapi\s*</.test(toggleBody) || toggleBody.includes('ensureGroup(')) {
  failures.push('toggleProductSelection must remain client-side and must not create an order group')
}

if (failures.length) {
  console.error('doctor order product-first check failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('doctor order product-first check ok')
