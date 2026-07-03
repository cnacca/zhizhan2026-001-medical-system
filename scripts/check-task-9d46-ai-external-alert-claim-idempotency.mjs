import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiExternalAlertSenderService.java', [
    'claimAlert',
    "send_status = 'SENDING'",
    "AND send_status = 'PENDING'",
    "AND send_status = 'SENDING'",
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiExternalAlertSenderTests.java', [
    'senderClaimsPendingAlertBeforeWebhookCallToAvoidDuplicateExternalSend',
    'awaitRequestCount',
    'blockNextRequestUntilReleased',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.46',
    'SENDING',
    '重复外呼',
  ]],
  ['acceptance.json', ['task-9d46-ai-external-alert-claim-idempotency-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.46']],
  ['docs/deployment/readiness-checklist.md', ['AI 外部告警幂等/并发领取第一增量']],
  ['DECISIONS.md', ['D-091 AI 外部告警先用事务内领取态避免重复外呼']],
  ['STATUS.md', ['9D.46 AI 外部告警幂等/并发领取第一增量']],
  ['tasks/README.md', ['任务 9D.46：AI 外部告警幂等/并发领取第一增量']],
  ['README.md', ['9D.46 AI 外部告警幂等/并发领取第一增量']],
  ['package.json', ['check:task9d46']],
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

console.log('task 9D.46 AI external alert claim idempotency check ok')
