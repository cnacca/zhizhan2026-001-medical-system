import fs from 'node:fs'

const checks = [
  ['.env.example', ['AI_DAILY_BUDGET_MICROUSD']],
  ['backend/platform-server/src/main/resources/application.yml', ['daily-budget-microusd', 'AI_DAILY_BUDGET_MICROUSD']],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayProperties.java', [
    'dailyBudgetMicrousd',
    'getDailyBudgetMicrousd',
    'setDailyBudgetMicrousd',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGovernanceSummaryResponse.java', [
    'daily_budget_microusd',
    'budget_exceeded',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'getDailyBudgetMicrousd',
    'dailyBudgetMicrousd > 0',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayTests.java', [
    'app.ai.daily-budget-microusd=100',
    'aiGovernanceSummaryFlagsDailyBudgetThreshold',
    'daily_budget_microusd',
    'budget_exceeded',
  ]],
  ['docs/api/openapi.yaml', [
    'AI_DAILY_BUDGET_MICROUSD',
    'daily_budget_microusd',
    'budget_exceeded',
  ]],
  ['acceptance.json', ['task-9d31-ai-budget-threshold-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.31']],
  ['docs/deployment/readiness-checklist.md', ['预算阈值第一增量']],
  ['STATUS.md', ['9D.31 已补 AI 预算阈值第一增量']],
  ['tasks/README.md', ['任务 9D.31：AI 预算阈值第一增量']],
  ['README.md', ['9D.31 AI 预算阈值第一增量']],
  ['package.json', ['check:task9d31']],
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

console.log('task 9D.31 AI budget threshold check ok')
