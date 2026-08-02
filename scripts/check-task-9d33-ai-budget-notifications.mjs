import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'NotificationPushService',
    'emitBudgetExceededNotification',
    'AI_BUDGET_EXCEEDED',
    "r.role_code IN ('ADMIN', 'CS')",
    'AiBudgetNotificationPayload',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayDeepSeekTests.java', [
    'deepSeekProviderNotifiesInternalUsersWhenDailyBudgetIsReached',
    'notificationEventCount',
    'userNotificationCount',
    'AI_BUDGET_EXCEEDED',
    '/notifications',
  ]],
  ['docs/api/openapi.yaml', [
    'AI_BUDGET_EXCEEDED',
    '任务 9D.33',
    '预算超限内部通知',
  ]],
  ['acceptance.json', ['task-9d33-ai-budget-notifications-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.33']],
  ['docs/deployment/readiness-checklist.md', ['预算超限内部通知第一增量']],
  ['STATUS.md', ['9D.33 已补 AI 预算超限内部通知第一增量']],
  ['tasks/README.md', ['任务 9D.33：AI 预算超限内部通知第一增量']],
  ['README.md', ['9D.33 AI 预算超限内部通知第一增量']],
  ['package.json', ['check:task9d33']],
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

console.log('task 9D.33 AI budget notifications check ok')
