import fs from 'node:fs'

const checks = [
  ['frontend/src/App.vue', [
    'isCustomerCollaborationRoute',
    'loadCustomerCollaborationPage',
    'customerCollaborationPendingMessages',
    'customerCollaborationOrderMessages',
    'reviewCustomerCollaborationMessage',
    'customer-collaboration-panel',
    'customer-collaboration-message-review',
    '/messages/pending-review',
    '/messages/${message.msg_id}/review',
    '待审核消息',
    '订单消息上下文',
  ]],
  ['frontend/src/styles.css', [
    '.customer-collaboration-panel',
    '.customer-collaboration-grid',
    '.customer-collaboration-card',
  ]],
  ['acceptance.json', [
    'task-9d58-customer-collaboration-required-text',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.58',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '客服协同闭环第一增量',
  ]],
  ['DECISIONS.md', [
    'D-104 任务 9D.58 客服协同台复用既有消息审核接口',
  ]],
  ['STATUS.md', [
    '9D.58 客服协同闭环第一增量',
  ]],
  ['tasks/README.md', [
    '任务 9D.58：客服协同闭环第一增量',
  ]],
  ['README.md', [
    '9D.58 客服协同闭环第一增量',
  ]],
  ['package.json', [
    'check:task9d58',
  ]],
]

for (const [file, patterns] of checks) {
  const text = fs.readFileSync(file, 'utf8')
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      console.error(`${file} missing required text: ${pattern}`)
      process.exit(1)
    }
  }
}

console.log('task 9D.58 customer collaboration check ok')
