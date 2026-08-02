import fs from 'node:fs'

const checks = [
  ['.env.example', [
    'AI_DEEPSEEK_DAILY_BUDGET_MICROUSD=0',
  ]],
  ['backend/platform-server/src/main/resources/application.yml', [
    'daily-budget-microusd: ${AI_DEEPSEEK_DAILY_BUDGET_MICROUSD:0}',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayProperties.java', [
    'dailyBudgetMicrousd',
    'setDailyBudgetMicrousd',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'AI_BUDGET_MODEL_CIRCUIT_OPEN',
    'ai-governance-budget-model-circuit-open',
    'modelBudgetCircuitBreakerOpen',
    'auditBudgetModelCircuitOpen',
    'currentModelSuccessCostMicrousd',
    'configuredModelName',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayDeepSeekTests.java', [
    'deepSeekProviderFallsBackWhenDeepSeekModelBudgetCircuitBreakerIsOpen',
    'recentSuccessCostMicrousdForModel',
    'insertRecentSuccessCostForModel',
    'AI_BUDGET_MODEL_CIRCUIT_OPEN',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.39',
    'AI_DEEPSEEK_DAILY_BUDGET_MICROUSD',
    'AI_BUDGET_MODEL_CIRCUIT_OPEN',
  ]],
  ['acceptance.json', ['task-9d39-ai-model-budget-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.39']],
  ['docs/deployment/readiness-checklist.md', ['分模型预算第一增量']],
  ['STATUS.md', ['9D.39 AI 分模型预算第一增量']],
  ['tasks/README.md', ['任务 9D.39：AI 分模型预算第一增量']],
  ['README.md', ['9D.39 AI 分模型预算第一增量']],
  ['package.json', ['check:task9d39']],
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

console.log('task 9D.39 AI model budget check ok')
