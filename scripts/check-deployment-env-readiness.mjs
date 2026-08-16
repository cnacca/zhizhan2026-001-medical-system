import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

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
    'MINIO_INTERNAL_ENDPOINT=http://127.0.0.1:9000',
    'MINIO_PUBLIC_ENDPOINT=http://127.0.0.1:9000',
  ]],
  ['backend/platform-server/src/main/resources/application.yml', [
    'provider: ${AI_PROVIDER:deterministic}',
    'enabled: ${AI_DEEPSEEK_ENABLED:false}',
    'webhook-enabled: ${AI_EXTERNAL_ALERT_WEBHOOK_ENABLED:false}',
    'scheduler-enabled: ${AI_EXTERNAL_ALERT_SCHEDULER_ENABLED:false}',
    'webhook-signing-enabled: ${AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED:false}',
    'receiver-verification-enabled: ${AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED:false}',
    'MINIO_INTERNAL_ENDPOINT',
    'MINIO_PUBLIC_ENDPOINT',
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
    'MINIO_PUBLIC_ENDPOINT',
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

// 开发代理与生产 nginx 的后端前缀必须一致。
// 这条漂过一次：前端用 30 个后端前缀，nginx 只代理了 3 个，其余全部落到 try_files
// 返回 index.html——不报错，只是页面 JSON.parse 一个 HTML，表现为「开发环境好好的、
// 部署上去就空白」。C 批次的 /rbac 与 F 批次的 /ordering-rules 都是这么漏掉的。
const viteConfig = fs.readFileSync('frontend/vite.config.ts', 'utf8')
const nginxConfig = fs.readFileSync('frontend/nginx.conf', 'utf8')
const viteProxyPrefixes = [...viteConfig.matchAll(/^\s*'(\/[a-z0-9-]+)':/gm)]
  .map((match) => match[1])
  .filter((prefix) => prefix !== '/ws')
const nginxRegexMatch = nginxConfig.match(/location ~ \^\/\(([a-z0-9|-]+)\)/)
if (!nginxRegexMatch) {
  console.error('frontend/nginx.conf: 找不到后端 API 前缀的正则 location 块')
  process.exit(1)
}
const nginxPrefixes = new Set(nginxRegexMatch[1].split('|').map((name) => `/${name}`))
const missingInNginx = viteProxyPrefixes.filter((prefix) => !nginxPrefixes.has(prefix))
if (missingInNginx.length > 0) {
  console.error(
    `frontend/nginx.conf 缺少以下后端前缀（生产环境会返回 index.html 而不是接口数据）：${missingInNginx.join(', ')}`
  )
  process.exit(1)
}
const missingInVite = [...nginxPrefixes].filter((prefix) => !viteProxyPrefixes.includes(prefix))
if (missingInVite.length > 0) {
  console.error(
    `frontend/vite.config.ts 缺少以下后端前缀（本地开发会返回 index.html）：${missingInVite.join(', ')}`
  )
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

// Text checks cannot prove that Compose actually forwards application.yml settings into
// the backend container. Render the same production model used by deployment and compare
// its final environment with every application placeholder.
const applicationConfig = [
  'backend/platform-server/src/main/resources/application.yml',
  'backend/platform-server/src/main/resources/application-prod.yml',
].map((file) => fs.readFileSync(file, 'utf8')).join('\n')
const requiredBackendEnvironment = new Set(
  [...applicationConfig.matchAll(/\$\{([A-Z][A-Z0-9_]*)/g)].map((match) => match[1])
)
const composeConfig = spawnSync(
  'docker',
  [
    'compose',
    '--env-file', 'deploy/env/phase-one.prod.example',
    '-f', 'deploy/docker-compose.phase-one.yml',
    'config',
    '--format', 'json',
  ],
  { encoding: 'utf8' }
)
if (composeConfig.status !== 0) {
  console.error('deploy/docker-compose.phase-one.yml: production Compose model cannot be rendered')
  process.exit(1)
}

let renderedBackendEnvironment
try {
  const renderedCompose = JSON.parse(composeConfig.stdout)
  renderedBackendEnvironment = renderedCompose.services?.backend?.environment
} catch {
  console.error('deploy/docker-compose.phase-one.yml: rendered Compose output is not valid JSON')
  process.exit(1)
}
if (!renderedBackendEnvironment || typeof renderedBackendEnvironment !== 'object') {
  console.error('deploy/docker-compose.phase-one.yml: rendered backend environment is missing')
  process.exit(1)
}
const missingBackendEnvironment = [...requiredBackendEnvironment]
  .filter((name) => !(name in renderedBackendEnvironment))
  .sort()
if (missingBackendEnvironment.length > 0) {
  console.error(
    `deploy/docker-compose.phase-one.yml: rendered backend environment misses application variables: ${missingBackendEnvironment.join(', ')}`
  )
  process.exit(1)
}

const requiredSafeProductionValues = {
  SPRING_PROFILES_ACTIVE: 'prod',
  APP_AUTH_ALLOW_BOOTSTRAP_HEADERS: 'false',
  APP_AUTH_ALLOW_ROLE_FALLBACK: 'false',
}
for (const [name, expected] of Object.entries(requiredSafeProductionValues)) {
  if (String(renderedBackendEnvironment[name]) !== expected) {
    console.error(`deploy/docker-compose.phase-one.yml: rendered backend ${name} must equal ${expected}`)
    process.exit(1)
  }
}

const requiredUploadMimeTypes = [
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const renderedUploadMimeTypes = new Set(
  String(renderedBackendEnvironment.FILE_ALLOWED_CONTENT_TYPES ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
)
const missingUploadMimeTypes = requiredUploadMimeTypes
  .filter((contentType) => !renderedUploadMimeTypes.has(contentType))
if (missingUploadMimeTypes.length > 0) {
  console.error(
    `deploy/docker-compose.phase-one.yml: rendered upload MIME whitelist misses frontend-supported types: ${missingUploadMimeTypes.join(', ')}`
  )
  process.exit(1)
}

const productionEnvKeys = new Set(
  fs.readFileSync('deploy/env/phase-one.prod.example', 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^[A-Z][A-Z0-9_]*=/.test(line))
    .map((line) => line.slice(0, line.indexOf('=')))
)
const composeFixedEnvironment = new Set([
  'SERVER_PORT',
  'APP_AUTH_ALLOW_BOOTSTRAP_HEADERS',
  'APP_AUTH_ALLOW_ROLE_FALLBACK',
  'MYSQL_HOST',
  'MYSQL_PORT',
  'REDIS_HOST',
  'REDIS_PORT',
  'MINIO_ENDPOINT',
  'MINIO_INTERNAL_ENDPOINT',
])
const missingProductionExampleKeys = [...requiredBackendEnvironment]
  .filter((name) => !composeFixedEnvironment.has(name) && !productionEnvKeys.has(name))
  .sort()
if (missingProductionExampleKeys.length > 0) {
  console.error(
    `deploy/env/phase-one.prod.example misses configurable application variables: ${missingProductionExampleKeys.join(', ')}`
  )
  process.exit(1)
}

console.log('deployment env readiness check ok')
