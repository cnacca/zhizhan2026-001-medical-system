import fs from 'node:fs'

const files = {
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
  [files.properties, 'AiGatewayProperties.java', 'maxModelRetries'],
  [files.config, 'application.yml', 'AI_MODEL_MAX_RETRIES'],
  [files.env, '.env.example', 'AI_MODEL_MAX_RETRIES=1'],
  [files.service, 'AiGatewayService.java', 'isRetryableModelFailure'],
  [files.service, 'AiGatewayService.java', 'HttpServerErrorException'],
  [files.service, 'AiGatewayService.java', 'ResourceAccessException'],
  [files.tests, 'AiGatewayDeepSeekTests.java', 'deepSeekProviderRetriesTransientServerFailureBeforeAuditingSuccess'],
  [files.tests, 'AiGatewayDeepSeekTests.java', 'enqueueFailure(500)'],
  [files.openapi, 'docs/api/openapi.yaml', 'AI_MODEL_MAX_RETRIES'],
  [files.tasks, 'tasks/README.md', '任务 9D.28：AI 模型重试第一增量'],
  [files.status, 'STATUS.md', '9D.28 AI 模型重试第一增量'],
  [files.matrix, 'docs/acceptance/task-8-acceptance-matrix.md', '9D.28 已补 AI 模型重试第一增量'],
  [files.readiness, 'docs/deployment/readiness-checklist.md', 'AI 模型重试第一增量'],
  [files.pkg, 'package.json', 'check:task9d28']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.28 AI model retry check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.28 AI model retry check ok')
