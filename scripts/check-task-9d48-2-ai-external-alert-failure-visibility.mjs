import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'failedOrDeadLetter',
    'sanitizeExternalAlertError',
    'attempts > 0 ? updatedAt : null',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiExternalAlertListResponse.java', [
    'attempts',
    'last_error',
    'last_attempted_at',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayTests.java', [
    'aiExternalAlertListShowsSanitizedFailureMetadataForFailedAndDeadLetterRecords',
    'sk-live-secret',
    'DEAD_LETTER',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.48.2',
    'last_attempted_at',
    'AiExternalAlertRecord',
  ]],
  ['acceptance.json', ['task-9d48-2-ai-external-alert-failure-visibility-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.48.2']],
  ['docs/deployment/readiness-checklist.md', ['AI 外部告警失败/死信可见性第一增量']],
  ['DECISIONS.md', ['D-096 AI 外部告警失败/死信只读可见性第一增量']],
  ['STATUS.md', ['9D.48.2 AI 外部告警失败/死信可见性第一增量']],
  ['tasks/README.md', ['任务 9D.48.2：AI 外部告警失败/死信可见性第一增量']],
  ['README.md', ['9D.48.2 AI 外部告警失败/死信可见性第一增量']],
  ['package.json', ['check:task9d48-2']],
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

console.log('task 9D.48.2 AI external alert failure visibility check ok')
