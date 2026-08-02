import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayProperties.java', [
    'webhookSigningEnabled',
    'webhookSigningSecret',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiExternalAlertSenderService.java', [
    'X-AI-Alert-Signature',
    'HmacSHA256',
    'sha256=',
    'external alert webhook signing secret is required',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiExternalAlertSenderTests.java', [
    'senderSignsWebhookRequestWhenSigningIsEnabled',
    'X-AI-Alert-Signature',
    'hmacSha256Hex',
  ]],
  ['backend/platform-server/src/main/resources/application.yml', [
    'AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED',
    'AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET',
  ]],
  ['.env.example', [
    'AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED=false',
    'AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET=',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.47',
    'X-AI-Alert-Signature',
    'HMAC-SHA256',
  ]],
  ['acceptance.json', ['task-9d47-ai-external-alert-webhook-signing-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.47']],
  ['docs/deployment/readiness-checklist.md', ['AI 外部告警 webhook 签名/鉴权第一增量']],
  ['DECISIONS.md', ['D-092 AI 外部告警 webhook 签名默认关闭']],
  ['STATUS.md', ['9D.47 AI 外部告警 webhook 签名/鉴权第一增量']],
  ['tasks/README.md', ['任务 9D.47：AI 外部告警 webhook 签名/鉴权第一增量']],
  ['README.md', ['9D.47 AI 外部告警 webhook 签名/鉴权第一增量']],
  ['package.json', ['check:task9d47']],
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

console.log('task 9D.47 AI external alert webhook signing check ok')
