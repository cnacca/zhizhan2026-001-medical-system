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
    'FILE_MAX_FILES_PER_ORDER',
  ]],
  ['.env.example', [
    'FILE_ALLOWED_CONTENT_TYPES',
    'FILE_MAX_FILES_PER_ORDER',
    'MINIO_BUCKET',
  ]],
  ['frontend/src/App.vue', [
    'doctorUploadAllowedContentTypes',
    'doctorUploadMaxFilesPerOrder',
    'validateDoctorUploadFiles',
    '单个订单最多上传',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.67 第一增量',
    'FILE_ALLOWED_CONTENT_TYPES',
    'FILE_MAX_FILES_PER_ORDER',
    'MINIO_BUCKET',
  ]],
  ['acceptance.json', [
    'task-9d67-file-upload-limits-bucket-required-text',
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
  ['docs/deployment/task-8-final-readiness-report.md', [
    '9D.67',
    '文件上传限制与 bucket 隔离第一段',
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
    'FILE_MAX_FILES_PER_ORDER',
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

console.log('task 9D.67 file upload limits and bucket isolation check ok')
