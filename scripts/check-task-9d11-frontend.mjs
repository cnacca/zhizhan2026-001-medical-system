import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const controller = fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/order/api/OrderController.java', 'utf8')
const service = fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/order/api/OrderCreationService.java', 'utf8')
const openapi = fs.readFileSync('docs/api/openapi.yaml', 'utf8')

const requiredAppFragments = [
  'doctorOrderEditingId',
  'saveDoctorOrderDraft',
  'submitDoctorOrderSupplement',
  'startDoctorOrderEdit',
  '保存草稿',
  '提交草稿/补资料',
  '继续编辑/补资料',
  'doctor-order-save-draft-button',
  'doctor-order-edit-button'
]

const requiredBackendFragments = [
  '@PutMapping("/orders/{orderId}")',
  'UpdateOrderRequest',
  'updateDoctorOrder',
  'DOCTOR_RESUBMIT_ORDER',
  'InternalOrderStatus.CS_REJECTED',
  'InternalOrderStatus.PRODUCTION_REJECTED'
]

const requiredOpenApiFragments = [
  'UpdateOrderRequest',
  'submit:',
  'DRAFT=草稿',
  '保存医生草稿',
  '提交或重新提交到 PENDING_CS_REVIEW'
]

const missing = [
  ...requiredAppFragments.filter((fragment) => !app.includes(fragment)).map((fragment) => `frontend/src/App.vue -> ${fragment}`),
  ...requiredBackendFragments
    .filter((fragment) => !controller.includes(fragment) && !service.includes(fragment))
    .map((fragment) => `backend order API -> ${fragment}`),
  ...requiredOpenApiFragments.filter((fragment) => !openapi.includes(fragment)).map((fragment) => `docs/api/openapi.yaml -> ${fragment}`)
]

if (missing.length > 0) {
  console.error('task 9D.11 check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.11 check ok')
