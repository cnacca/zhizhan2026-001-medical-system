import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiExternalAlertSenderService.java', [
    'sendPendingAlerts',
    "send_status = 'SENT'",
    "send_status = 'FAILED'",
    'attempts = attempts + 1',
    'unsupported external alert channel',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiExternalAlertSenderTests.java', [
    'senderMarksPendingExternalAlertAsSentWithoutRealChannel',
    'senderMarksUnsupportedPendingAlertFailedAndRecordsError',
    'EXTERNAL_ALERT',
    'UNSUPPORTED_CHANNEL',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.41',
    'SENT',
    'FAILED',
    'attempts',
    'last_error',
  ]],
  ['acceptance.json', ['task-9d41-ai-external-alert-sender-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.41']],
  ['docs/deployment/readiness-checklist.md', ['AI 外部告警发送器第一增量']],
  ['STATUS.md', ['9D.41 AI 外部告警发送器第一增量']],
  ['tasks/README.md', ['任务 9D.41：AI 外部告警发送器第一增量']],
  ['README.md', ['9D.41 AI 外部告警发送器第一增量']],
  ['package.json', ['check:task9d41']],
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

console.log('task 9D.41 AI external alert sender check ok')
