import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayController.java', [
    '/ai/governance/external-alerts',
    'created_at_from',
    'created_at_to',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'externalAlerts',
    'parseNullableDateTime',
    'AiExternalAlertListResponse.Record',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiExternalAlertListResponse.java', [
    'event_type',
    'send_status',
    'created_at',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayTests.java', [
    'aiExternalAlertListFiltersRecentOutboxWithoutSensitivePayloadForInternalUsers',
    'model_raw_response',
    'secret-token',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.48.1',
    '/ai/governance/external-alerts',
    'AiExternalAlertListResponse',
    'getAiExternalAlerts',
  ]],
  ['acceptance.json', ['task-9d48-1-ai-external-alert-list-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.48.1']],
  ['docs/deployment/readiness-checklist.md', ['AI 外部告警 outbox 列表/筛选第一增量']],
  ['DECISIONS.md', ['D-095 AI 外部告警列表只读筛选第一增量']],
  ['STATUS.md', ['9D.48.1 AI 外部告警 outbox 列表/筛选第一增量']],
  ['tasks/README.md', ['任务 9D.48.1：AI 外部告警 outbox 列表/筛选第一增量']],
  ['README.md', ['9D.48.1 AI 外部告警 outbox 列表/筛选第一增量']],
  ['package.json', ['check:task9d48-1']],
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

console.log('task 9D.48.1 AI external alert list check ok')
