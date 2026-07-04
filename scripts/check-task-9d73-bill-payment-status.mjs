import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/resources/db/migration/V30__bill_payment_status.sql', [
    'payment_status',
    'PENDING_PAYMENT',
    'idx_order_bill_payment_status',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/PaymentStatusRequest.java', [
    'payment_status',
    'PaymentStatusRequest',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/BillResponse.java', [
    'payment_status',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/CollaborationController.java', [
    '/orders/{orderId}/bill/payment-status',
    'updatePaymentStatus',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/CollaborationService.java', [
    'ALLOWED_PAYMENT_STATUSES',
    'PARTIALLY_PAID',
    'PAYMENT_STATUS_UPDATED',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/collaboration/MessageDesignBillNotificationTests.java', [
    'csCanMaintainExternalPaymentStatusAndDoctorCanOnlyReadIt',
    'payment_status',
    'PARTIALLY_PAID',
  ]],
  ['frontend/src/App.vue', [
    'payment_status',
    'internal-payment-status-select',
    'internal-payment-status-button',
    'doctor-payment-status',
    '/bill/payment-status',
  ]],
  ['docs/api/openapi.yaml', [
    '/orders/{orderId}/bill/payment-status',
    'PaymentStatusRequest',
    'payment_status',
    'PENDING_PAYMENT',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.73',
    '付款状态第一段',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '9D.73',
    '付款状态第一段',
  ]],
  ['docs/deployment/task-8-final-readiness-report.md', [
    '9D.73',
    '付款状态第一段',
  ]],
  ['docs/acceptance/phase-one-frontend-alignment.md', [
    '9D.73',
    '付款状态第一段',
  ]],
  ['docs/acceptance/phase-one-frontend-task-scope.md', [
    '9D.73',
    '付款状态第一段',
  ]],
  ['DECISIONS.md', [
    'D-124 任务 9D.73 账单 / 付款状态 / 物流一期闭环第一段',
  ]],
  ['STATUS.md', [
    '9D.73 账单 / 付款状态 / 物流一期闭环第一段',
  ]],
  ['tasks/README.md', [
    '任务 9D.73：账单 / 付款状态 / 物流一期闭环第一段',
  ]],
  ['README.md', [
    '9D.73 账单 / 付款状态 / 物流一期闭环第一段',
    'check:task9d73',
  ]],
  ['acceptance.json', [
    'task-9d73-bill-payment-status-required-text',
  ]],
  ['package.json', [
    'check:task9d73',
  ]],
]

for (const [file, patterns] of checks) {
  if (!fs.existsSync(file)) {
    console.error(`${file} missing required file`)
    process.exit(1)
  }
  const text = fs.readFileSync(file, 'utf8')
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      console.error(`${file} missing required text: ${pattern}`)
      process.exit(1)
    }
  }
}

console.log('task 9D.73 bill payment status check ok')
