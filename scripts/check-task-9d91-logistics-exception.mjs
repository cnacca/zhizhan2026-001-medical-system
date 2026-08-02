import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/CollaborationController.java', [
    '"/logistics/orders"',
    '"/orders/{orderId}/logistics/exception"',
    'LogisticsExceptionRequest',
    'DeliveryOrderResponse',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/collaboration/CollaborationService.java', [
    'ALLOWED_LOGISTICS_FOLLOW_UP_STATUSES',
    '[物流跟进]',
    'doctorSafeLogisticsStatus',
    'listDeliveryOrders',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/collaboration/MessageDesignBillNotificationTests.java', [
    'csCanTrackLogisticsExceptionsWithoutLeakingInternalFollowUpToDoctor',
    '/logistics/orders',
    'logistics/exception',
    '已联系顺丰催派',
  ]],
  ['frontend/src/App.vue', [
    'cs-delivery-management-panel',
    'delivery-follow-up-note',
    'delivery-follow-up-save',
    'loadDeliveryOrders',
  ]],
  ['docs/api/openapi.yaml', [
    '"/logistics/orders"',
    '"/orders/{orderId}/logistics/exception"',
    'LogisticsExceptionRequest',
    'DeliveryOrderResponse',
  ]],
  ['docs/acceptance/prd-v2-gap-matrix.md', [
    '9D.91',
    '客服配送管理页',
  ]],
  ['STATUS.md', [
    '9D.91 客服配送管理页 / 物流异常跟进第一增量',
  ]],
  ['tasks/README.md', [
    '任务 9D.91：客服配送管理页 / 物流异常跟进第一增量',
  ]],
  ['README.md', [
    'check:task9d91',
  ]],
  ['acceptance.json', [
    'task-9d91-logistics-exception-required-text',
  ]],
  ['package.json', [
    'check:task9d91',
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

console.log('task 9D.91 logistics exception check ok')
