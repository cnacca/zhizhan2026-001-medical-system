import fs from 'node:fs'

const files = {
  migration: fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V18__ai_audit_cost.sql', 'utf8'),
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', 'utf8'),
  properties: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayProperties.java', 'utf8'),
  config: fs.readFileSync('backend/platform-server/src/main/resources/application.yml', 'utf8'),
  env: fs.readFileSync('.env.example', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayDeepSeekTests.java', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8'),
  tasks: fs.readFileSync('tasks/README.md', 'utf8'),
  status: fs.readFileSync('STATUS.md', 'utf8'),
  matrix: fs.readFileSync('docs/acceptance/task-8-acceptance-matrix.md', 'utf8'),
  readiness: fs.readFileSync('docs/deployment/readiness-checklist.md', 'utf8'),
  pkg: fs.readFileSync('package.json', 'utf8')
}

const requiredFragments = [
  [files.migration, 'V18__ai_audit_cost.sql', 'estimated_cost_microusd'],
  [files.properties, 'AiGatewayProperties.java', 'inputTokenCostMicrousd'],
  [files.properties, 'AiGatewayProperties.java', 'outputTokenCostMicrousd'],
  [files.config, 'application.yml', 'AI_INPUT_TOKEN_COST_MICROUSD'],
  [files.config, 'application.yml', 'AI_OUTPUT_TOKEN_COST_MICROUSD'],
  [files.env, '.env.example', 'AI_INPUT_TOKEN_COST_MICROUSD=0'],
  [files.env, '.env.example', 'AI_OUTPUT_TOKEN_COST_MICROUSD=0'],
  [files.service, 'AiGatewayService.java', 'estimatedCostMicrousd'],
  [files.service, 'AiGatewayService.java', 'estimated_cost_microusd'],
  [files.tests, 'AiGatewayDeepSeekTests.java', 'deepSeekProviderAuditsEstimatedCostMicrousdFromTokenUsage'],
  [files.tests, 'AiGatewayDeepSeekTests.java', 'estimatedCostMicrousd'],
  [files.openapi, 'docs/api/openapi.yaml', 'AI_INPUT_TOKEN_COST_MICROUSD'],
  [files.tasks, 'tasks/README.md', '任务 9D.27：AI 成本审计第一增量'],
  [files.status, 'STATUS.md', '9D.27 AI 成本审计第一增量'],
  [files.matrix, 'docs/acceptance/task-8-acceptance-matrix.md', '9D.27 已补 AI 成本审计第一增量'],
  [files.readiness, 'docs/deployment/readiness-checklist.md', 'AI 成本审计第一增量'],
  [files.pkg, 'package.json', 'check:task9d27']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.27 AI cost audit check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.27 AI cost audit check ok')
