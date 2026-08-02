import fs from 'node:fs'

const files = {
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayDeepSeekTests.java', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8'),
  tasks: fs.readFileSync('tasks/README.md', 'utf8'),
  status: fs.readFileSync('STATUS.md', 'utf8'),
  matrix: fs.readFileSync('docs/acceptance/task-8-acceptance-matrix.md', 'utf8'),
  readiness: fs.readFileSync('docs/deployment/readiness-checklist.md', 'utf8'),
  pkg: fs.readFileSync('package.json', 'utf8')
}

const requiredFragments = [
  [files.service, 'AiGatewayService.java', 'MODEL_FAILURE_STATUS'],
  [files.service, 'AiGatewayService.java', 'AI_MODEL_FAILED'],
  [files.service, 'AiGatewayService.java', 'MODEL_FAILURE_MODEL_NAME'],
  [files.service, 'AiGatewayService.java', 'ai-governance-model-failure'],
  [files.service, 'AiGatewayService.java', 'auditModelFailure'],
  [files.service, 'AiGatewayService.java', 'HttpStatus.SERVICE_UNAVAILABLE'],
  [files.service, 'AiGatewayService.java', 'aiGovernanceAuditTransaction'],
  [files.tests, 'AiGatewayDeepSeekTests.java', 'deepSeekProviderAuditsModelFailureWhenRetriesAreExhausted'],
  [files.tests, 'AiGatewayDeepSeekTests.java', 'AI_MODEL_FAILED'],
  [files.tests, 'AiGatewayDeepSeekTests.java', 'status().isServiceUnavailable()'],
  [files.openapi, 'docs/api/openapi.yaml', 'AI_MODEL_FAILED'],
  [files.tasks, 'tasks/README.md', '任务 9D.29：AI 模型失败审计第一增量'],
  [files.status, 'STATUS.md', '9D.29 AI 模型失败审计第一增量'],
  [files.matrix, 'docs/acceptance/task-8-acceptance-matrix.md', '9D.29 已补 AI 模型失败审计第一增量'],
  [files.readiness, 'docs/deployment/readiness-checklist.md', 'AI 模型失败审计第一增量'],
  [files.pkg, 'package.json', 'check:task9d29']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.29 AI model failure audit check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.29 AI model failure audit check ok')
