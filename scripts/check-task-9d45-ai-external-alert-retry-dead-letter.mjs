import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiExternalAlertSenderService.java', [
    'markWebhookFailure',
    'DEAD_LETTER',
    'maxAttempts()',
    'attempts',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayProperties.java', [
    'maxAttempts',
    'getMaxAttempts',
    'setMaxAttempts',
  ]],
  ['backend/platform-server/src/main/resources/application.yml', [
    'AI_EXTERNAL_ALERT_MAX_ATTEMPTS',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiExternalAlertSenderTests.java', [
    'senderKeepsWebhookFailurePendingBeforeMaxAttempts',
    'senderMovesWebhookFailureToDeadLetterAtMaxAttempts',
    'DEAD_LETTER',
  ]],
  ['.env.example', [
    'AI_EXTERNAL_ALERT_MAX_ATTEMPTS=3',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.45',
    'AI_EXTERNAL_ALERT_MAX_ATTEMPTS',
    'DEAD_LETTER',
  ]],
  ['acceptance.json', ['task-9d45-ai-external-alert-retry-dead-letter-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.45']],
  ['docs/deployment/readiness-checklist.md', ['AI 外部告警重试/死信第一增量']],
  ['STATUS.md', ['9D.45 AI 外部告警重试/死信第一增量']],
  ['tasks/README.md', ['任务 9D.45：AI 外部告警重试/死信第一增量']],
  ['README.md', ['9D.45 AI 外部告警重试/死信第一增量']],
  ['package.json', ['check:task9d45']],
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

console.log('task 9D.45 AI external alert retry/dead-letter check ok')
