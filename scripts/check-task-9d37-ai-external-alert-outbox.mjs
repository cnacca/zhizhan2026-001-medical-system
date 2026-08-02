import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/resources/db/migration/V19__ai_external_alert_outbox.sql', [
    'CREATE TABLE ai_external_alert_outbox',
    'alert_type VARCHAR(64) NOT NULL',
    "send_status VARCHAR(32) NOT NULL DEFAULT 'PENDING'",
    'idx_ai_external_alert_status',
    'fk_ai_external_alert_order',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'EXTERNAL_ALERT_CHANNEL',
    'EXTERNAL_ALERT_PENDING_STATUS',
    'emitExternalAlertOutbox',
    'AiExternalAlertPayload',
    'AI_BUDGET_EXCEEDED',
    'AI_BUDGET_CIRCUIT_OPEN',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayDeepSeekTests.java', [
    'deepSeekProviderCreatesExternalAlertOutboxWhenDailyBudgetIsReached',
    'deepSeekProviderCreatesExternalAlertOutboxWhenBudgetCircuitBreakerOpens',
    'externalAlertCount',
    'latestExternalAlertStatus',
    'latestExternalAlertPayloadField',
  ]],
  ['docs/api/openapi.yaml', ['任务 9D.37', 'ai_external_alert_outbox']],
  ['acceptance.json', ['task-9d37-ai-external-alert-outbox-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.37']],
  ['docs/deployment/readiness-checklist.md', ['外部告警待发送事实第一增量']],
  ['STATUS.md', ['9D.37 AI 预算外部告警待发送事实第一增量']],
  ['tasks/README.md', ['任务 9D.37：AI 预算外部告警待发送事实第一增量']],
  ['README.md', ['9D.37 AI 预算外部告警待发送事实第一增量']],
  ['package.json', ['check:task9d37']],
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

console.log('task 9D.37 AI external alert outbox check ok')
