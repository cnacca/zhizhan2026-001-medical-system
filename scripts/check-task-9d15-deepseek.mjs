import fs from 'node:fs'

const files = {
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', 'utf8'),
  client: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/ai/DeepSeekAiModelClient.java', 'utf8'),
  properties: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayProperties.java', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayDeepSeekTests.java', 'utf8'),
  app: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  application: fs.readFileSync('backend/platform-server/src/main/resources/application.yml', 'utf8'),
  env: fs.readFileSync('.env.example', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8')
}

const requiredFragments = [
  [files.properties, 'AiGatewayProperties.java', 'deepSeekEnabled'],
  [files.properties, 'AiGatewayProperties.java', 'replace-with'],
  [files.client, 'DeepSeekAiModelClient.java', '/chat/completions'],
  [files.client, 'DeepSeekAiModelClient.java', 'Bearer '],
  [files.client, 'DeepSeekAiModelClient.java', 'choices'],
  [files.client, 'DeepSeekAiModelClient.java', 'completion_tokens'],
  [files.service, 'AiGatewayService.java', 'completeWithModel'],
  [files.service, 'AiGatewayService.java', 'SAFE_REFUSAL'],
  [files.service, 'AiGatewayService.java', 'DoctorOrderAssistantReadModel'],
  [files.service, 'AiGatewayService.java', 'modelResult.modelName()'],
  [files.tests, 'AiGatewayDeepSeekTests.java', 'enabledDeepSeekProviderCallsOpenAiCompatibleEndpointAndAuditsRealModel'],
  [files.tests, 'AiGatewayDeepSeekTests.java', 'DeepSeekStubServer'],
  [files.tests, 'AiGatewayDeepSeekTests.java', 'doesNotContain("内部工序备注")'],
  [files.tests, 'AiGatewayDeepSeekTests.java', 'auditCountByModel("deepseek-chat")'],
  [files.app, 'frontend/src/App.vue', 'askDoctorAi'],
  [files.app, 'frontend/src/App.vue', '/ai/order-query'],
  [files.application, 'application.yml', 'AI_PROVIDER:deterministic'],
  [files.application, 'application.yml', 'AI_DEEPSEEK_ENABLED:false'],
  [files.application, 'application.yml', 'DEEPSEEK_API_KEY:'],
  [files.env, '.env.example', 'AI_PROVIDER=deterministic'],
  [files.env, '.env.example', 'AI_DEEPSEEK_ENABLED=false'],
  [files.env, '.env.example', 'DEEPSEEK_API_KEY=replace-with-local-dev-key'],
  [files.openapi, 'docs/api/openapi.yaml', '任务 9D.15 第一增量'],
  [files.openapi, 'docs/api/openapi.yaml', 'OpenAI-compatible /chat/completions'],
  [files.openapi, 'docs/api/openapi.yaml', 'SAFE_REFUSAL']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.15 DeepSeek check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.15 DeepSeek check ok')
