import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayController.java', [
    'reference_data_notes',
    'CsQueryResult',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'buildCsReferenceDataNotes',
    '订单基础：orders.order_no',
    '生产上下文：orders.internal_status',
    'order_message',
    'file_resource',
    'order_bill',
    'order_logistics',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayTests.java', [
    'csQueryReturnsReferenceDataNotesForAuditableInternalSources',
    'reference_data_notes',
    '沟通消息',
    '账单',
    '物流',
  ]],
  ['frontend/src/App.vue', [
    'reference_data_notes',
    'csAiQueryReferenceNotes',
    'cs-ai-query-reference-notes',
    '引用数据说明',
  ]],
  ['docs/api/openapi.yaml', [
    'reference_data_notes',
    'AI-2 客服查询使用的只读内部数据来源说明',
  ]],
  ['STATUS.md', [
    '9D.97 AI-2 客服查询引用数据说明 / 知识上下文补强第一增量',
  ]],
  ['DECISIONS.md', [
    'D-089 任务 9D.97 AI-2 客服查询引用数据说明 / 知识上下文补强',
  ]],
  ['tasks/README.md', [
    '任务 9D.97：AI-2 客服查询引用数据说明 / 知识上下文补强第一增量',
  ]],
  ['README.md', [
    'check:task9d97',
    'reference_data_notes',
  ]],
  ['docs/acceptance/prd-v2-gap-matrix.md', [
    '9D.97 已补 AI-2 客服查询引用数据说明 / 知识上下文补强第一增量',
    'reference_data_notes',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.97 AI-2 客服查询引用数据说明 / 知识上下文补强第一增量',
    'reference_data_notes',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '9D.97 已补 `npm run check:task9d97`',
    'reference_data_notes',
  ]],
  ['docs/deployment/task-8-final-readiness-report.md', [
    '9D.97 已补 AI-2 客服查询引用数据说明 / 知识上下文补强第一增量',
    'reference_data_notes',
  ]],
  ['acceptance.json', [
    'task-9d97-cs-ai-reference-context',
    'check:task9d97',
  ]],
  ['package.json', [
    'check:task9d97',
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

console.log('task 9D.97 CS AI reference context check ok')
