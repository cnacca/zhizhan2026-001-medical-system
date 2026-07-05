import fs from 'node:fs'

const checks = [
  ['backend/platform-server/Dockerfile', [
    'eclipse-temurin:21-jre',
    'ai-order-platform-backend',
    'SPRING_PROFILES_ACTIVE=prod',
    'APP_AUTH_TOKEN_SECRET',
  ]],
  ['frontend/Dockerfile', [
    'nginx:1.27-alpine',
    'ai-order-platform-frontend',
    '/usr/share/nginx/html',
  ]],
  ['deploy/docker-compose.phase-one.yml', [
    'ai-order-backend',
    'ai-order-frontend',
    'mysql',
    'redis',
    'minio',
    'SPRING_PROFILES_ACTIVE: prod',
    '${APP_AUTH_TOKEN_SECRET:?inject APP_AUTH_TOKEN_SECRET externally}',
    'APP_AUTH_ALLOW_ROLE_FALLBACK: "false"',
    '${MINIO_BUCKET:?inject production bucket name externally}',
  ]],
  ['deploy/env/phase-one.prod.example', [
    'Do not commit real secrets',
    'SPRING_PROFILES_ACTIVE=prod',
    'APP_AUTH_TOKEN_SECRET=',
    'APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=false',
    'APP_AUTH_ALLOW_ROLE_FALLBACK=false',
    'AI_PROVIDER=deterministic',
    'AI_DEEPSEEK_ENABLED=false',
    'AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=false',
    'AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false',
    'MINIO_BUCKET=',
  ]],
  ['docs/deployment/phase-one-docker-env.md', [
    '一期 Docker 与环境变量隔离',
    '不提交真实密钥',
    '测试环境和正式环境使用不同 MYSQL_DATABASE',
    '测试环境和正式环境使用不同 MINIO_BUCKET',
    'APP_AUTH_TOKEN_SECRET 必须外部注入',
    'AI_DEEPSEEK_ENABLED 默认 false',
    'docker compose -f deploy/docker-compose.phase-one.yml config',
  ]],
  ['package.json', [
    'check:task9d69',
    'compose:phase-one:config',
  ]],
]

for (const [file, patterns] of checks) {
  if (!fs.existsSync(file)) {
    console.error(`${file} missing required file`)
    process.exit(1)
  }
  const text = fs.readFileSync(file, 'utf8')
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      console.error(`${file} missing required text: ${pattern}`)
      process.exit(1)
    }
  }
}

console.log('task 9D.69 deployment infrastructure check ok')
