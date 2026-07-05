import fs from 'node:fs'

const checks = [
  ['README.md', [
    '部署安全 / 环境变量 readiness 检查第一增量',
    '正式环境必须外部注入',
    '禁止提交真实密钥',
    'AI_PROVIDER=deterministic',
    'APP_AUTH_ALLOW_ROLE_FALLBACK=false',
    'AI_DEEPSEEK_ENABLED=false',
    'AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=false',
    'AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false',
  ]],
  ['.env.example', [
    'Do not commit real secrets',
    'APP_AUTH_TOKEN_SECRET=local-dev-change-me-auth-secret',
    'APP_AUTH_ALLOW_ROLE_FALLBACK=true',
    'DEEPSEEK_API_KEY=',
    'AI_PROVIDER=deterministic',
    'AI_DEEPSEEK_ENABLED=false',
    'AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=false',
    'AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false',
    'AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED=false',
  ]],
  ['backend/platform-server/src/main/resources/application.yml', [
    'provider: ${AI_PROVIDER:deterministic}',
    'enabled: ${AI_DEEPSEEK_ENABLED:false}',
    'webhook-enabled: ${AI_EXTERNAL_ALERT_WEBHOOK_ENABLED:false}',
    'scheduler-enabled: ${AI_EXTERNAL_ALERT_SCHEDULER_ENABLED:false}',
    'webhook-signing-enabled: ${AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED:false}',
    'allow-role-fallback: ${APP_AUTH_ALLOW_ROLE_FALLBACK:true}',
  ]],
  ['backend/platform-server/src/main/resources/application-prod.yml', [
    'token-secret: ${APP_AUTH_TOKEN_SECRET}',
    'allow-bootstrap-headers: false',
    'allow-role-fallback: false',
    'APP_AUTH_TOKEN_SECRET must be injected externally',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '部署安全 / 环境变量 readiness 检查第一增量',
    '正式环境必须外部注入',
    '禁止提交真实密钥',
    'DEEPSEEK_API_KEY',
    'AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET',
  ]],
  ['acceptance.json', ['task-deployment-env-readiness-required-text']],
  ['tasks/README.md', ['任务 Task 8 readiness：部署安全 / 环境变量检查第一增量']],
  ['STATUS.md', ['部署安全 / 环境变量 readiness 检查第一增量']],
  ['DECISIONS.md', ['D-098 部署安全与环境变量 readiness 检查第一增量']],
  ['package.json', ['check:deployment-env']],
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

console.log('deployment env readiness check ok')
