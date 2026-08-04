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
    'AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED=false',
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
    'AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED=false',
    'AI_EXTERNAL_ALERT_RECEIVER_SIGNING_SECRET=',
  ]],
  ['backend/platform-server/src/main/resources/application.yml', [
    'provider: ${AI_PROVIDER:deterministic}',
    'enabled: ${AI_DEEPSEEK_ENABLED:false}',
    'webhook-enabled: ${AI_EXTERNAL_ALERT_WEBHOOK_ENABLED:false}',
    'scheduler-enabled: ${AI_EXTERNAL_ALERT_SCHEDULER_ENABLED:false}',
    'webhook-signing-enabled: ${AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED:false}',
    'receiver-verification-enabled: ${AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED:false}',
    // 默认值必须是 false：本检查此前写的是 :true，而代码早已收紧成 :false，
    // 于是「部署前检查」这个动作本身长期是红的。安全默认在代码这边，改检查不改代码。
    // 本地开发要用角色兜底时由 .env.example 的 APP_AUTH_ALLOW_ROLE_FALLBACK=true 显式打开。
    'allow-role-fallback: ${APP_AUTH_ALLOW_ROLE_FALLBACK:false}',
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
    'AI_EXTERNAL_ALERT_RECEIVER_SIGNING_SECRET',
    'APP_AUTH_ALLOW_ROLE_FALLBACK=false',
  ]],
  ['acceptance.json', ['task-deployment-env-readiness-required-text']],
  ['tasks/README.md', ['任务 Task 8 readiness：部署安全 / 环境变量检查第一增量']],
  ['STATUS.md', ['部署安全 / 环境变量 readiness 检查第一增量']],
  ['DECISIONS.md', ['D-098 部署安全与环境变量 readiness 检查第一增量']],
  ['package.json', ['check:deployment-env']],
]

// 业务时区必须在三处同时固定。mysql 与 eclipse-temurin 官方镜像默认都是 UTC，
// 而工厂在中国：漏掉任何一处，「今日」指标和交期都会在上海时间 00:00-08:00 之间错一天，
// 且不抛任何异常——只是数字悄悄不对。详见 common/BusinessTime.java。
const timezonePins = [
  ['compose.yaml', ['--default-time-zone=+08:00', 'TZ: Asia/Shanghai']],
  ['deploy/docker-compose.phase-one.yml', ['--default-time-zone=+08:00', 'TZ: Asia/Shanghai']],
  ['backend/platform-server/Dockerfile', ['ENV TZ=Asia/Shanghai', '-Duser.timezone=Asia/Shanghai']],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/common/BusinessTime.java',
    ['ZoneId.of("Asia/Shanghai")']],
]

for (const [file, patterns] of [...checks, ...timezonePins]) {
  const text = fs.readFileSync(file, 'utf8')
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      console.error(`${file} missing required text: ${pattern}`)
      process.exit(1)
    }
  }
}

// 部署 compose 的 backend 也要带 TZ，否则 JVM 与 MySQL 各算各的「今天」。
const deployCompose = fs.readFileSync('deploy/docker-compose.phase-one.yml', 'utf8')
const backendSection = deployCompose.slice(deployCompose.indexOf('  backend:'))
if (!backendSection.includes('TZ: Asia/Shanghai')) {
  console.error('deploy/docker-compose.phase-one.yml: backend 服务缺少 TZ: Asia/Shanghai')
  process.exit(1)
}

// 「今天」一律走 BusinessTime，不用无参 LocalDate.now()（取 JVM 默认时区，容器里是 UTC）。
const businessDayCallers = [
  'backend/platform-server/src/main/java/com/yuri/aiorder/order/rules/DeliveryPlanService.java',
  'backend/platform-server/src/main/java/com/yuri/aiorder/order/casegroup/CaseGroupDraftService.java',
]
for (const file of businessDayCallers) {
  if (fs.readFileSync(file, 'utf8').includes('LocalDate.now()')) {
    console.error(`${file}: 用了无参 LocalDate.now()，业务日期必须走 BusinessTime.today()`)
    process.exit(1)
  }
}

console.log('deployment env readiness check ok')
