import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/file/api/FileStorageProperties.java', [
    'allowedContentTypes',
    'maxFilesPerOrder',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/file/api/FileResourceService.java', [
    'validateUploadLimits',
    'isAllowedContentType',
    'activeFileCount',
    'file content type is not allowed',
    'order file count exceeds current limit',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/file/FileAccessTests.java', [
    'uploadTokenAndMultipartRejectDisallowedContentTypes',
    'uploadTokenAndMultipartRejectOrdersAboveFileCountLimit',
    'application/x-msdownload',
    'app.file.max-files-per-order=3',
  ]],
  ['backend/platform-server/src/main/resources/application.yml', [
    'allowed-content-types',
    'max-files-per-order',
    'FILE_ALLOWED_CONTENT_TYPES',
    'max-files-per-order: ${FILE_MAX_FILES_PER_ORDER:50}',
  ]],
  ['backend/platform-server/src/test/resources/application-test.properties', [
    'app.file.max-files-per-order=${FILE_MAX_FILES_PER_ORDER:50}',
  ]],
  ['.env.example', [
    'FILE_ALLOWED_CONTENT_TYPES',
    'FILE_MAX_FILES_PER_ORDER=50',
    'MINIO_BUCKET',
  ]],
  ['deploy/env/phase-one.prod.example', [
    'FILE_MAX_FILES_PER_ORDER=50',
  ]],
  ['deploy/docker-compose.phase-one.yml', [
    'FILE_MAX_FILES_PER_ORDER: ${FILE_MAX_FILES_PER_ORDER:-50}',
  ]],
  ['frontend/src/App.vue', [
    'doctorUploadAllowedContentTypes',
    'const doctorUploadMaxFilesPerOrder = 50',
    'validateDoctorUploadFiles',
    '单个订单最多上传',
  ]],
  ['scripts/deploy-production-release.sh', [
    'export FILE_MAX_FILES_PER_ORDER=50',
    'backend FILE_MAX_FILES_PER_ORDER is not 50 after deployment',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.67 第一增量',
    'FILE_ALLOWED_CONTENT_TYPES',
    'FILE_MAX_FILES_PER_ORDER',
    'MINIO_BUCKET',
  ]],
  ['acceptance.json', [
    '每订单文件数已校准为 50',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.67',
    '文件上传限制与 bucket 隔离第一段',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '9D.67 文件上传限制与 bucket 隔离第一段',
    'FILE_ALLOWED_CONTENT_TYPES',
    'FILE_MAX_FILES_PER_ORDER',
  ]],
  ['docs/DELIVERY-GAP.md', [
    '### file-upload-prod',
    '单订单最多 50 个',
    '本地配置／代码缺口已关闭',
  ]],
  ['docs/acceptance/phase-one-frontend-alignment.md', [
    '9D.67',
  ]],
  ['docs/acceptance/phase-one-frontend-task-scope.md', [
    '9D.67',
  ]],
  ['DECISIONS.md', [
    'D-118 任务 9D.67 文件上传限制与 bucket 隔离第一段',
  ]],
  ['STATUS.md', [
    '9D.67 文件上传限制与 bucket 隔离第一段',
  ]],
  ['tasks/README.md', [
    '任务 9D.67：文件上传限制与 bucket 隔离第一段',
  ]],
  ['README.md', [
    '9D.67 文件上传限制与 bucket 隔离第一段',
    'FILE_ALLOWED_CONTENT_TYPES',
    'FILE_MAX_FILE_SIZE_BYTES=524288000',
    'FILE_MAX_FILES_PER_ORDER=50',
  ]],
  ['package.json', [
    'check:task9d67',
  ]],
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

const staleDefaults = [
  ['.env.example', 'FILE_MAX_FILES_PER_ORDER=30'],
  ['deploy/env/phase-one.prod.example', 'FILE_MAX_FILES_PER_ORDER=30'],
  ['deploy/docker-compose.phase-one.yml', 'FILE_MAX_FILES_PER_ORDER:-30'],
  ['backend/platform-server/src/main/resources/application.yml', 'FILE_MAX_FILES_PER_ORDER:30'],
  ['backend/platform-server/src/test/resources/application-test.properties', 'FILE_MAX_FILES_PER_ORDER:30'],
  ['frontend/src/App.vue', 'doctorUploadMaxFilesPerOrder = 30'],
  ['README.md', 'FILE_MAX_FILES_PER_ORDER=30'],
]

for (const [file, pattern] of staleDefaults) {
  const text = fs.readFileSync(file, 'utf8')
  if (text.includes(pattern)) {
    console.error(`${file} contains stale file-count default: ${pattern}`)
    process.exit(1)
  }
}

console.log('task 9D.67 file upload limits and bucket isolation check ok: 500MB / 50 files')
