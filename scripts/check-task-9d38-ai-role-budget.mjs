import fs from 'node:fs'

const checks = [
  ['.env.example', [
    'AI_ADMIN_DAILY_BUDGET_MICROUSD=0',
    'AI_CS_DAILY_BUDGET_MICROUSD=0',
    'AI_DOCTOR_DAILY_BUDGET_MICROUSD=0',
    'AI_WORKER_DAILY_BUDGET_MICROUSD=0',
  ]],
  ['backend/platform-server/src/main/resources/application.yml', [
    'admin-daily-budget-microusd',
    'cs-daily-budget-microusd',
    'doctor-daily-budget-microusd',
    'worker-daily-budget-microusd',
  ]],
  ['backend/platform-server/src/main/resources/db/migration/V20__ai_audit_actor_role.sql', [
    'actor_role VARCHAR(32)',
    'idx_ai_audit_role_status_created',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayProperties.java', [
    'adminDailyBudgetMicrousd',
    'csDailyBudgetMicrousd',
    'doctorDailyBudgetMicrousd',
    'workerDailyBudgetMicrousd',
    'dailyBudgetMicrousdForRole',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'AI_BUDGET_ROLE_CIRCUIT_OPEN',
    'ai-governance-budget-role-circuit-open',
    'roleBudgetCircuitBreakerOpen',
    'auditBudgetRoleCircuitOpen',
    'currentRoleSuccessCostMicrousd',
    'actor_role',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayDeepSeekTests.java', [
    'deepSeekProviderFallsBackWhenCsRoleBudgetCircuitBreakerIsOpen',
    'setCsDailyBudgetMicrousd',
    'recentSuccessCostMicrousdForRole',
    'insertRecentSuccessCostForRole',
    'AI_BUDGET_ROLE_CIRCUIT_OPEN',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.38',
    'AI_CS_DAILY_BUDGET_MICROUSD',
    'AI_BUDGET_ROLE_CIRCUIT_OPEN',
  ]],
  ['acceptance.json', ['task-9d38-ai-role-budget-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.38']],
  ['docs/deployment/readiness-checklist.md', ['分角色预算第一增量']],
  ['STATUS.md', ['9D.38 AI 分角色预算第一增量']],
  ['tasks/README.md', ['任务 9D.38：AI 分角色预算第一增量']],
  ['README.md', ['9D.38 AI 分角色预算第一增量']],
  ['package.json', ['check:task9d38']],
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

console.log('task 9D.38 AI role budget check ok')
