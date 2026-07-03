import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/AiOrderPlatformApplication.java', [
    '@EnableScheduling',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiExternalAlertScheduler.java', [
    'AiExternalAlertScheduler',
    '@Scheduled',
    'dispatchPendingAlerts',
    'isSchedulerEnabled',
    'sendPendingAlerts',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayProperties.java', [
    'schedulerEnabled',
    'schedulerBatchSize',
    'schedulerFixedDelayMillis',
    'schedulerInitialDelayMillis',
  ]],
  ['backend/platform-server/src/main/resources/application.yml', [
    'AI_EXTERNAL_ALERT_SCHEDULER_ENABLED',
    'AI_EXTERNAL_ALERT_SCHEDULER_BATCH_SIZE',
    'AI_EXTERNAL_ALERT_SCHEDULER_FIXED_DELAY_MILLIS',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiExternalAlertSenderTests.java', [
    'schedulerDoesNothingWhenExternalAlertSchedulingIsDisabled',
    'schedulerDispatchesPendingAlertsWhenExternalAlertSchedulingIsEnabled',
  ]],
  ['.env.example', [
    'AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false',
    'AI_EXTERNAL_ALERT_SCHEDULER_BATCH_SIZE=50',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.44',
    'AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=true',
  ]],
  ['acceptance.json', ['task-9d44-ai-external-alert-scheduler-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.44']],
  ['docs/deployment/readiness-checklist.md', ['AI 外部告警调度器第一增量']],
  ['STATUS.md', ['9D.44 AI 外部告警调度器第一增量']],
  ['tasks/README.md', ['任务 9D.44：AI 外部告警调度器第一增量']],
  ['README.md', ['9D.44 AI 外部告警调度器第一增量']],
  ['package.json', ['check:task9d44']],
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

console.log('task 9D.44 AI external alert scheduler check ok')
