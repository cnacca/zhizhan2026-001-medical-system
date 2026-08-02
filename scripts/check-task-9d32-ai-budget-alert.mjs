import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'AI_BUDGET_EXCEEDED',
    'ai-governance-budget-exceeded',
    'auditBudgetExceededIfCrossed',
    'previousWindowCost >= dailyBudgetMicrousd',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGovernanceSummaryResponse.java', [
    'budget_alert_count',
    'latest_budget_alert_at',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayDeepSeekTests.java', [
    'deepSeekProviderAuditsBudgetExceededWhenDailyBudgetIsReached',
    'AI_BUDGET_EXCEEDED',
    'budget_alert_count',
    'latest_budget_alert_at',
  ]],
  ['docs/api/openapi.yaml', [
    'AI_BUDGET_EXCEEDED',
    'budget_alert_count',
    'latest_budget_alert_at',
  ]],
  ['acceptance.json', ['task-9d32-ai-budget-alert-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.32']],
  ['docs/deployment/readiness-checklist.md', ['预算超限审计第一增量']],
  ['STATUS.md', ['9D.32 已补 AI 预算超限审计第一增量']],
  ['tasks/README.md', ['任务 9D.32：AI 预算超限审计第一增量']],
  ['README.md', ['9D.32 AI 预算超限审计第一增量']],
  ['package.json', ['check:task9d32']],
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

console.log('task 9D.32 AI budget alert check ok')
