import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/MessageResponse.java', [
    'order_no',
    'product_type',
    'external_status',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/CollaborationService.java', [
    'JOIN orders o ON o.order_id = m.order_id',
    'MESSAGE_REVIEW_REJECTED',
    "review_status = 'PENDING_REVIEW'",
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/collaboration/MessageDesignBillNotificationTests.java', [
    'pendingMessageReviewQueueExposesOrderContextAndRejectStaysHiddenFromDoctor',
    'order_no',
    'MESSAGE_REVIEW_REJECTED',
  ]],
  ['frontend/src/App.vue', [
    'customer-collaboration-message-review',
    'message.order_no',
    'message.external_status',
  ]],
  ['docs/api/openapi.yaml', [
    'MessageItem',
    'order_no',
    'external_status',
  ]],
  ['docs/acceptance/prd-v2-gap-matrix.md', [
    '9D.88',
    '客服订单 / 沟通完整可见性 smoke',
  ]],
  ['STATUS.md', [
    '9D.88 客服订单 / 沟通完整可见性 smoke',
  ]],
  ['tasks/README.md', [
    '任务 9D.88：客服订单 / 沟通完整可见性 smoke',
  ]],
  ['README.md', [
    'check:task9d88',
  ]],
  ['acceptance.json', [
    'task-9d88-customer-collaboration-visibility-required-text',
  ]],
  ['package.json', [
    'check:task9d88',
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

console.log('task 9D.88 customer collaboration visibility check ok')
