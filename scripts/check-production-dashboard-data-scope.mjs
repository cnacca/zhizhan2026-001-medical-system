import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')

const requiredFragments = [
  [
    '生产端排除客服/账单物流共享数据开关',
    "const shouldLoadCsSharedDashboardData = ['cs', 'admin'].includes(portalTone.value)"
  ],
  [
    '待审消息只允许客服端/管理端加载',
    "shouldLoadCsSharedDashboardData\n        ? fetchResource('待审消息', () => apiFetch<MessageItem[]>('/messages/pending-review'))"
  ],
  [
    '账单物流只允许客服端/管理端加载',
    "shouldLoadCsSharedDashboardData\n        ? fetchResource('账单物流', () => apiFetch<DeliveryOrderItem[]>('/logistics/orders?limit=50'))"
  ],
  [
    '生产端待问异常不依赖客服待审消息列表',
    "?? countOrdersByStatus(orders, ['PENDING_DOCTOR_CONFIRM'])"
  ]
]

const failures = requiredFragments
  .filter(([, fragment]) => !app.includes(fragment))
  .map(([label, fragment]) => `${label}: missing ${fragment}`)

if (failures.length > 0) {
  console.error('production dashboard data scope check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('production dashboard data scope check ok')
