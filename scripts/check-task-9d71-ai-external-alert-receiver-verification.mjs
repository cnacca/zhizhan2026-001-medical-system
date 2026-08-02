import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayProperties.java', [
    'receiverVerificationEnabled',
    'receiverSigningSecret',
    'receiverReplayWindowSeconds',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiExternalAlertSenderService.java', [
    'X-AI-Alert-Timestamp',
    'X-AI-Alert-Nonce',
    'X-AI-Alert-Signature',
    'timestamp + "." + nonce + "." + payload',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiExternalAlertReceiverService.java', [
    'AiExternalAlertReceiverService',
    'receiver verification is disabled',
    'timestamp is outside window',
    'nonce was already accepted',
    'MessageDigest.isEqual',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayController.java', [
    '/ai/external-alerts/receive',
    'X-AI-Alert-Timestamp',
    'X-AI-Alert-Nonce',
    'X-AI-Alert-Signature',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayTests.java', [
    'aiExternalAlertReceiverVerifiesSignatureAndRejectsReplay',
    'aiExternalAlertReceiverRejectsExpiredTimestampAndInvalidSignature',
    'aiExternalAlertReceiverIsDisabledByDefault',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiExternalAlertSenderTests.java', [
    'request.timestamp() + "." + request.nonce() + "." + request.body()',
  ]],
  ['backend/platform-server/src/main/resources/application.yml', [
    'AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED',
    'AI_EXTERNAL_ALERT_RECEIVER_SIGNING_SECRET',
    'AI_EXTERNAL_ALERT_RECEIVER_REPLAY_WINDOW_SECONDS',
  ]],
  ['.env.example', [
    'AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED=false',
    'AI_EXTERNAL_ALERT_RECEIVER_SIGNING_SECRET=',
    'AI_EXTERNAL_ALERT_RECEIVER_REPLAY_WINDOW_SECONDS=300',
  ]],
  ['docs/api/openapi.yaml', [
    '/ai/external-alerts/receive',
    'AiExternalAlertReceiverResponse',
    'X-AI-Alert-Timestamp',
    'X-AI-Alert-Nonce',
    '任务 9D.71',
  ]],
  ['acceptance.json', ['task-9d71-ai-external-alert-receiver-verification-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.71']],
  ['docs/deployment/readiness-checklist.md', ['AI 外部告警接收端验签 / 防重放第一段']],
  ['docs/deployment/task-8-final-readiness-report.md', ['9D.71']],
  ['docs/acceptance/phase-one-frontend-alignment.md', ['9D.71']],
  ['docs/acceptance/phase-one-frontend-task-scope.md', ['9D.71']],
  ['DECISIONS.md', ['D-122 任务 9D.71 AI 外部告警接收端验签 / 防重放第一段']],
  ['STATUS.md', ['9D.71 AI 外部告警接收端验签 / 防重放第一段']],
  ['tasks/README.md', ['任务 9D.71：AI 外部告警接收端验签 / 防重放第一段']],
  ['README.md', ['9D.71 AI 外部告警接收端验签 / 防重放第一段']],
  ['package.json', ['check:task9d71']],
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

console.log('task 9D.71 AI external alert receiver verification check ok')
