import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayController.java', [
    '/ai/production-note/confirm',
    'ProductionNoteResponse',
    'knowledge_context_notes',
    'requires_customer_template_confirmation',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'PHASE_ONE_DEFAULT_V1',
    'buildProductionNoteKnowledgeContextNotes',
    'PRODUCTION_NOTE_HUMAN_CONFIRMED',
    '客户模板未确认',
    '人工确认',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/order/api/AiOrderQueryController.java', [
    '/ai/order-query',
    'ai:doctor',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayTests.java', [
    'productionNoteDraftUsesDefaultTemplateAndHumanConfirmationWritesOrderNote',
    'productionNoteRejectsDoctorAndUnassignedWorkerConfirmation',
    '/ai/production-note/confirm',
    'PHASE_ONE_DEFAULT_V1',
    'PRODUCTION_NOTE_HUMAN_CONFIRMED',
  ]],
  ['frontend/src/App.vue', [
    "apiFetch<AiTranslateResponse>('/ai/translate'",
    "apiFetch<MissingInfoResponse>('/ai/check-missing'",
    "apiFetch<DoctorAiAnswer>('/ai/cs-query'",
    "apiFetch<AiProductionNoteResponse>('/ai/production-note'",
    "apiFetch<AiProductionNoteConfirmResponse>('/ai/production-note/confirm'",
    'cs-production-note-context-notes',
    '默认模板 / 人工确认',
  ]],
  ['docs/api/openapi.yaml', [
    '/ai/production-note/confirm',
    'template_version',
    'knowledge_context_notes',
    'requires_customer_template_confirmation',
    'PHASE_ONE_DEFAULT_V1',
  ]],
  ['STATUS.md', [
    '9D.98 AI-5 生产备注客户模板 / 知识上下文补强第一增量',
    'Task 8 仍保持 `NOT_READY`',
  ]],
  ['DECISIONS.md', [
    'D-090 任务 9D.98 AI-5 生产备注客户模板 / 知识上下文补强',
  ]],
  ['tasks/README.md', [
    '任务 9D.98：AI-5 生产备注客户模板 / 知识上下文补强第一增量',
    'npm run check:task9d98',
  ]],
  ['README.md', [
    'check:task9d98',
    'AI-5 生产备注客户模板 / 知识上下文补强第一增量',
  ]],
  ['docs/acceptance/prd-v2-gap-matrix.md', [
    '9D.98 已补 AI-5 生产备注客户模板 / 知识上下文补强第一增量',
    '客户模板仍待客户 / PM 最终确认',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.98 AI-5 生产备注客户模板 / 知识上下文补强第一增量',
    'Task 8 仍保持 `NOT_READY`',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '9D.98 已补 `npm run check:task9d98`',
    '客户模板仍待客户 / PM 最终确认',
  ]],
  ['docs/deployment/task-8-final-readiness-report.md', [
    '9D.98 已补 AI-5 生产备注客户模板 / 知识上下文补强第一增量',
    'Task 8 仍保持 `NOT_READY`',
  ]],
  ['acceptance.json', [
    'task-9d98-ai5-production-note-template-context',
    'check:task9d98',
    '/ai/production-note/confirm',
  ]],
  ['package.json', [
    'check:task9d98',
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

console.log('task 9D.98 AI-5 production note template context check ok')
