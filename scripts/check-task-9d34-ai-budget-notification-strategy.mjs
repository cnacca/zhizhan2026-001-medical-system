import fs from 'node:fs'

const checks = [
  ['.env.example', ['AI_BUDGET_NOTIFICATION_ENABLED=true']],
  ['backend/platform-server/src/main/resources/application.yml', [
    'budget-notification-enabled',
    'AI_BUDGET_NOTIFICATION_ENABLED',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayProperties.java', [
    'budgetNotificationEnabled',
    'isBudgetNotificationEnabled',
    'setBudgetNotificationEnabled',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'isBudgetNotificationEnabled',
    'emitBudgetExceededNotification',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayDeepSeekTests.java', [
    'deepSeekProviderSkipsBudgetNotificationWhenNotificationStrategyIsDisabled',
    'setBudgetNotificationEnabled(false)',
    'AI_BUDGET_EXCEEDED',
  ]],
  ['docs/api/openapi.yaml', [
    'AI_BUDGET_NOTIFICATION_ENABLED=false',
    '任务 9D.34',
  ]],
  ['acceptance.json', ['task-9d34-ai-budget-notification-strategy-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.34']],
  ['docs/deployment/readiness-checklist.md', ['预算通知策略开关第一增量']],
  ['STATUS.md', ['9D.34 已补 AI 预算通知策略开关第一增量']],
  ['tasks/README.md', ['任务 9D.34：AI 预算通知策略开关第一增量']],
  ['README.md', ['9D.34 AI 预算通知策略开关第一增量']],
  ['package.json', ['check:task9d34']],
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

console.log('task 9D.34 AI budget notification strategy check ok')
