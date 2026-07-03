import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayController.java', [
    '/ai/governance/external-alerts/summary',
    'externalAlertSummary',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'externalAlertSummary',
    'ai_external_alert_outbox',
    'oldestPendingCreatedAt',
    'sanitizeExternalAlertError',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiExternalAlertSummaryResponse.java', [
    'status_counts',
    'latest_failure',
    'oldest_pending_created_at',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayTests.java', [
    'aiExternalAlertMonitorSummarizesOutboxForInternalUsers',
    '/ai/governance/external-alerts/summary',
    'DEAD_LETTER',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.48',
    '/ai/governance/external-alerts/summary',
    'AiExternalAlertSummaryResponse',
    'getAiExternalAlertSummary',
  ]],
  ['acceptance.json', ['task-9d48-ai-external-alert-observability-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.48']],
  ['docs/deployment/readiness-checklist.md', ['AI 外部告警监控/运维可观察第一增量']],
  ['DECISIONS.md', ['D-094 AI 外部告警监控只读化第一增量']],
  ['STATUS.md', ['9D.48 AI 外部告警监控/运维可观察第一增量']],
  ['tasks/README.md', ['任务 9D.48：AI 外部告警监控/运维可观察第一增量']],
  ['README.md', ['9D.48 AI 外部告警监控/运维可观察第一增量']],
  ['package.json', ['check:task9d48']],
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

console.log('task 9D.48 AI external alert observability check ok')
