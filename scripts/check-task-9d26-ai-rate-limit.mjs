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
  [files.properties, 'AiGatewayProperties.java', 'maxRequestsPerUserHour'],
  [files.config, 'application.yml', 'AI_MAX_REQUESTS_PER_USER_HOUR'],
  [files.env, '.env.example', 'AI_MAX_REQUESTS_PER_USER_HOUR=120'],
  [files.service, 'AiGatewayService.java', 'enforceAiRateLimit'],
  [files.service, 'AiGatewayService.java', 'AI_RATE_LIMITED'],
  [files.service, 'AiGatewayService.java', 'HttpStatus.TOO_MANY_REQUESTS'],
  [files.service, 'AiGatewayService.java', 'PROPAGATION_REQUIRES_NEW'],
  [files.tests, 'AiGatewayDeepSeekTests.java', 'deepSeekProviderRateLimitsRealModelCallsPerUserAndAuditsRejection'],
  [files.tests, 'AiGatewayDeepSeekTests.java', 'isTooManyRequests'],
  [files.openapi, 'docs/api/openapi.yaml', 'TooManyRequests'],
  [files.openapi, 'docs/api/openapi.yaml', "'429'"],
  [files.tasks, 'tasks/README.md', '任务 9D.26：AI 调用限流第一增量'],
  [files.status, 'STATUS.md', '9D.26 AI 调用限流第一增量'],
  [files.matrix, 'docs/acceptance/task-8-acceptance-matrix.md', '9D.26 已补 AI 调用限流第一增量'],
  [files.readiness, 'docs/deployment/readiness-checklist.md', 'AI 调用限流第一增量'],
  [files.pkg, 'package.json', 'check:task9d26']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.26 AI rate limit check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.26 AI rate limit check ok')
