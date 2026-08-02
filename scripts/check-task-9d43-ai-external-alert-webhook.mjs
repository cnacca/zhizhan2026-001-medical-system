import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayProperties.java', [
    'ExternalAlert',
    'webhookEnabled',
    'webhookUrl',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiExternalAlertSenderService.java', [
    'shouldSendWebhook',
    'sendWebhook',
    'external alert webhook failed',
    'CAST(payload AS CHAR) AS payload',
  ]],
  ['backend/platform-server/src/main/resources/application.yml', [
    'external-alert:',
    'AI_EXTERNAL_ALERT_WEBHOOK_ENABLED',
    'AI_EXTERNAL_ALERT_WEBHOOK_URL',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiExternalAlertSenderTests.java', [
    'senderPostsPendingExternalAlertToConfiguredWebhookWhenEnabled',
    'senderKeepsWebhookFailurePendingBeforeMaxAttempts',
    'ExternalAlertWebhookStub',
  ]],
  ['.env.example', [
    'AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=false',
    'AI_EXTERNAL_ALERT_WEBHOOK_URL=',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.43',
    'AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=true',
  ]],
  ['acceptance.json', ['task-9d43-ai-external-alert-webhook-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.43']],
  ['docs/deployment/readiness-checklist.md', ['AI 真实外部渠道适配第一增量']],
  ['STATUS.md', ['9D.43 AI 真实外部渠道适配第一增量']],
  ['tasks/README.md', ['任务 9D.43：AI 真实外部渠道适配第一增量']],
  ['README.md', ['9D.43 AI 真实外部渠道适配第一增量']],
  ['package.json', ['check:task9d43']],
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

console.log('task 9D.43 AI external alert webhook check ok')
