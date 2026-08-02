import fs from 'node:fs'

const failures = []

const checks = [
  ['backend/platform-server/src/main/resources/db/migration/V32__order_payment_record_foundation.sql', [
    'CREATE TABLE order_payment_record',
    'amount_cents',
    'payment_method'
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/CollaborationController.java', [
    'GetMapping("/orders/{orderId}/payments")',
    'PostMapping("/orders/{orderId}/payments")',
    'PaymentRecordResponse'
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/CollaborationService.java', [
    'createPaymentRecord',
    'listPaymentRecords',
    'amount_cents must be positive',
    'requireDoctorOwnerIfNeeded'
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/collaboration/MessageDesignBillNotificationTests.java', [
    'csCanRecordManualPaymentLedgerAndDoctorCanOnlyReadOwnOrderLedger',
    'BANK_TRANSFER',
    '一期人工收款记录'
  ]],
  ['frontend/src/App.vue', [
    'type PaymentRecordItem',
    'createInternalPaymentRecord',
    '/orders/${selectedInternalOrder.value.order_id}/payments',
    '暂无人工收款流水'
  ]],
  ['docs/api/openapi.yaml', [
    'PaymentRecordRequest',
    'PaymentRecordResponse',
    '"/orders/{orderId}/payments"',
    '不接真实支付网关'
  ]],
  ['STATUS.md', [
    '9D.84 人工支付流水 / 收支记录第一增量',
    'order_payment_record',
    'Task 8 仍保持 `NOT_READY`'
  ]],
  ['DECISIONS.md', [
    'D-135 任务 9D.84 人工支付流水 / 收支记录第一增量',
    'order_payment_record',
    '不接真实支付网关'
  ]],
  ['tasks/README.md', [
    '任务 9D.84：人工支付流水 / 收支记录第一增量',
    'completed-first-increment',
    '退款、对账、发票'
  ]],
  ['README.md', [
    'npm run check:task9d84',
    'PaymentRecordRequest',
    '人工支付流水'
  ]],
  ['acceptance.json', [
    'task-9d84-payment-ledger-required-text',
    'check:task9d84',
    'order_payment_record'
  ]],
  ['package.json', [
    'check:task9d84'
  ]]
]

for (const [file, fragments] of checks) {
  if (!fs.existsSync(file)) {
    failures.push(`${file} -> file missing`)
    continue
  }
  const content = fs.readFileSync(file, 'utf8')
  for (const fragment of fragments) {
    if (!content.includes(fragment)) {
      failures.push(`${file} -> ${fragment}`)
    }
  }
}

for (const phrase of ['真实支付已接入', '自动对账已完成', '电子发票已完成']) {
  for (const file of ['STATUS.md', 'tasks/README.md', 'docs/acceptance/prd-v2-gap-matrix.md']) {
    if (fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes(phrase)) {
      failures.push(`${file} -> forbidden completion claim: ${phrase}`)
    }
  }
}

if (failures.length > 0) {
  console.error('task 9D.84 payment ledger check failed:')
  for (const failure of failures) {
    console.error(`- missing ${failure}`)
  }
  process.exit(1)
}

console.log('task 9D.84 payment ledger check ok')
