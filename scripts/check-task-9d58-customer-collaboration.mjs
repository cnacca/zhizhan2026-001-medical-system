import fs from 'node:fs'

const checks = [
  ['frontend/src/components/CsPortalPages.vue', [
    'reviewInquiryMessage',
    '/messages/${message.msg_id}/review',
    "message.review_status === 'PENDING_REVIEW'",
    '审核通过',
    '退回修改',
    '退回修改时请填写需要调整的内容',
  ]],
  ['frontend/src/cs-rebuilt-pages.css', [
    '.cs-r-message-review',
    '.cs-r-message-review .is-approve',
    '.cs-r-message-review .is-reject',
  ]],
  ['scripts/smoke-task-9d62-main-chain.spec.mjs', [
    'createPendingWorkerMessage',
    'assertCsMessageReviewFromNormalMenu',
    '消息已审核通过并按可见范围发送。',
  ]],
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
    '<el-radio-button value="APPROVE">通过</el-radio-button>',
    '<el-radio-button value="REJECT">驳回</el-radio-button>',
  ]],
  ['frontend/src/styles.css', [
    '.customer-collaboration-panel',
    '.customer-collaboration-grid',
    '.customer-collaboration-card',
  ]],
  ['acceptance.json', [
    '客服协同',
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
