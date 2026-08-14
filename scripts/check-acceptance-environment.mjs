import fs from 'node:fs'

const required = [
  ['frontend/src/App.vue', [
    'isDedicatedAcceptanceMode',
    'VITE_ACCEPTANCE_DOCTOR_USERNAME',
    'VITE_ACCEPTANCE_CS_USERNAME',
    'VITE_ACCEPTANCE_PRODUCTION_USERNAME',
    'VITE_ACCEPTANCE_ADMIN_USERNAME',
    'data-testid="dedicated-acceptance-credentials"',
    '仅独立验收环境显示，禁止用于正式站',
  ]],
  ['frontend/Dockerfile.acceptance', [
    'ARG VITE_ACCEPTANCE_MODE',
    'ARG VITE_ACCEPTANCE_DOCTOR_PASSWORD',
    'ARG VITE_ACCEPTANCE_ADMIN_PASSWORD',
    'ai-order-platform-frontend-acceptance',
  ]],
  ['deploy/docker-compose.acceptance.yml', [
    'ai-order-acceptance-mysql',
    'ai-order-acceptance-redis',
    'ai-order-acceptance-minio',
    'ai-order-acceptance-backend',
    'ai-order-acceptance-permission-bootstrap',
    'ai-order-acceptance-frontend',
    '127.0.0.1:${ACCEPTANCE_FRONTEND_PORT:-18088}:80',
    '127.0.0.1:${ACCEPTANCE_MINIO_PORT:-19002}:9000',
    'name: ai-order-acceptance-mysql-data',
    'name: ai-order-acceptance-minio-data',
    'APP_AUTH_ALLOW_BOOTSTRAP_HEADERS: "false"',
    'APP_AUTH_ALLOW_ROLE_FALLBACK: "false"',
    'AI_PROVIDER: deterministic',
    '${ACCEPTANCE_BACKEND_IMAGE:-ai-order-platform-backend:phase-one}',
    "permission.permission_code = 'clinic:create'",
    "role.role_code = 'CS'",
    'condition: service_completed_successfully',
  ]],
  ['deploy/env/acceptance.example', [
    'https://acceptance.chinesedigitaldental.com',
    'https://acceptance-files.chinesedigitaldental.com',
    'ACCEPTANCE_MYSQL_DATABASE=<required-isolated-database>',
    'ACCEPTANCE_DOCTOR_PASSWORD=<required-temporary-password>',
    'ACCEPTANCE_ADMIN_PASSWORD=<required-temporary-password>',
  ]],
  ['deploy/nginx/acceptance.chinesedigitaldental.com.conf.example', [
    'server_name acceptance.chinesedigitaldental.com',
    'server_name acceptance-files.chinesedigitaldental.com',
    'proxy_pass http://127.0.0.1:18088',
    'proxy_pass http://127.0.0.1:19002',
  ]],
]

for (const [file, patterns] of required) {
  const text = fs.readFileSync(file, 'utf8')
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      console.error(`${file} missing required text: ${pattern}`)
      process.exit(1)
    }
  }
}

for (const file of [
  'frontend/Dockerfile.acceptance',
  'deploy/docker-compose.acceptance.yml',
  'deploy/env/acceptance.example',
]) {
  const text = fs.readFileSync(file, 'utf8')
  if (/change-me-/i.test(text)) {
    console.error(`${file} must not commit concrete acceptance passwords`)
    process.exit(1)
  }
}

const envExample = fs.readFileSync('deploy/env/acceptance.example', 'utf8')
for (const line of envExample.split(/\r?\n/)) {
  if (/^ACCEPTANCE_.*PASSWORD=/.test(line) && !line.endsWith('=<required-secret>')
    && !line.endsWith('=<required-temporary-password>')) {
    console.error('deploy/env/acceptance.example must contain password placeholders only')
    process.exit(1)
  }
}

const compose = fs.readFileSync('deploy/docker-compose.acceptance.yml', 'utf8')
if (compose.includes('phase-one-mysql-data') || compose.includes('phase-one-minio-data')) {
  console.error('acceptance compose must not reuse phase-one data volumes')
  process.exit(1)
}

console.log('[PASS] 独立验收环境：凭据注入、容器/卷/端口隔离与正式安全门禁检查通过')
