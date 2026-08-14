import fs from 'node:fs'
import path from 'node:path'

const failures = []

function requireText(file, fragments) {
  const content = fs.readFileSync(file, 'utf8')
  for (const fragment of fragments) {
    if (!content.includes(fragment)) failures.push(`${file} -> missing ${fragment}`)
  }
  return content
}

const authController = requireText(
  'backend/platform-server/src/main/java/com/yuri/aiorder/bootstrap/BootstrapAuthController.java',
  ['@CrossOrigin(origins = "${app.cors.allowed-origin:']
)
if (authController.includes('originPatterns = {"http://localhost:*"')) {
  failures.push('BootstrapAuthController -> still hardcodes localhost-only origin patterns')
}

const fileService = requireText(
  'backend/platform-server/src/main/java/com/yuri/aiorder/file/api/FileResourceService.java',
  [
    '@Qualifier("presignMinioClient")',
    'presignMinioClient.getPresignedObjectUrl',
    "AND f.status = 'ACTIVE'"
  ]
)
if (fileService.includes('return minioClient.getPresignedObjectUrl')) {
  failures.push('FileResourceService -> internal MinIO client still signs browser URLs')
}

requireText('backend/platform-server/src/main/resources/application.yml', [
  'MINIO_INTERNAL_ENDPOINT',
  'MINIO_PUBLIC_ENDPOINT',
  'public-endpoint:'
])
requireText('deploy/docker-compose.phase-one.yml', [
  'MINIO_INTERNAL_ENDPOINT: http://minio:9000',
  'MINIO_PUBLIC_ENDPOINT: ${MINIO_PUBLIC_ENDPOINT:?inject browser-reachable MinIO endpoint externally}',
  '${MINIO_PUBLIC_PORT:-9000}:9000'
])
requireText('deploy/env/phase-one.prod.example', [
  'MINIO_PUBLIC_ENDPOINT=',
  'MINIO_PUBLIC_PORT=9000'
])

const wizard = requireText('frontend/src/doctor/DoctorCaseGroupWizard.vue', [
  'saveAllItemsUnlocked',
  'currentStepErrors',
  'busy.value = true',
  'if (busy.value || fileUploading.value) return'
])
if (!wizard.includes('itemStepErrors(item, step.value)')) {
  failures.push('DoctorCaseGroupWizard -> next-step validation does not use the current step rules')
}

const app = requireText('frontend/src/App.vue', [
  'import.meta.env.DEV &&',
  'VITE_TEMP_DEMO_LOGIN_PREFILL_ENABLED',
  "temporaryDemoLoginPrefillEnabled ? 'change-me-doctor' : ''",
  'APP_CORS_ALLOWED_ORIGIN'
])
if (app.includes('本地前端代理被后端 CORS 拦截')) {
  failures.push('App.vue -> still shows the misleading local-proxy-only CORS message')
}

requireText('frontend/src/factory-portal.css', [
  'table-layout: fixed',
  '.portal-production .production-review-panel .aor-production-note',
  '-webkit-line-clamp: 2'
])

requireText('scripts/check-task-9d4-frontend.mjs', [
  'identity.hasPermission("workflow:review-production")',
  'must not restore role-specific production review authorization'
])

const distDir = 'frontend/dist/assets'
if (fs.existsSync(distDir)) {
  const builtFiles = fs.readdirSync(distDir).filter((file) => /\.(js|css|html)$/.test(file))
  for (const file of builtFiles) {
    const content = fs.readFileSync(path.join(distDir, file), 'utf8')
    if (content.includes('change-me-doctor')
      || content.includes('change-me-cs')
      || content.includes('change-me-worker')
      || content.includes('change-me-admin')) {
      failures.push(`frontend/dist/assets/${file} -> production bundle contains demo credentials`)
    }
  }
}

if (failures.length) {
  console.error('deployment bugfix check failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('deployment bugfix check ok')
