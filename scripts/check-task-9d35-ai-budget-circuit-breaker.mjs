import fs from 'node:fs'

const checks = [
  ['.env.example', ['AI_BUDGET_CIRCUIT_BREAKER_ENABLED=false']],
  ['backend/platform-server/src/main/resources/application.yml', [
    'budget-circuit-breaker-enabled',
    'AI_BUDGET_CIRCUIT_BREAKER_ENABLED',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayProperties.java', [
    'budgetCircuitBreakerEnabled',
    'isBudgetCircuitBreakerEnabled',
    'setBudgetCircuitBreakerEnabled',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'AI_BUDGET_CIRCUIT_OPEN',
    'ai-governance-budget-circuit-open',
    'budgetCircuitBreakerOpen',
    'auditBudgetCircuitOpen',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayDeepSeekTests.java', [
    'deepSeekProviderFallsBackWhenBudgetCircuitBreakerIsEnabledAndBudgetAlreadyExceeded',
    'setBudgetCircuitBreakerEnabled(true)',
    'AI_BUDGET_CIRCUIT_OPEN',
  ]],
  ['docs/api/openapi.yaml', [
    'AI_BUDGET_CIRCUIT_BREAKER_ENABLED=true',
    'AI_BUDGET_CIRCUIT_OPEN',
    '任务 9D.35',
  ]],
  ['acceptance.json', ['task-9d35-ai-budget-circuit-breaker-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.35']],
  ['docs/deployment/readiness-checklist.md', ['预算熔断/降级第一增量']],
  ['STATUS.md', ['9D.35 AI 预算熔断/降级第一增量']],
  ['tasks/README.md', ['任务 9D.35：AI 预算熔断/降级第一增量']],
  ['README.md', ['9D.35 AI 预算熔断/降级第一增量']],
  ['package.json', ['check:task9d35']],
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

console.log('task 9D.35 AI budget circuit breaker check ok')
