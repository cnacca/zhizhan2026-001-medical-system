import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const vite = fs.readFileSync('frontend/vite.config.ts', 'utf8')
const openapi = fs.readFileSync('docs/api/openapi.yaml', 'utf8')
const migration = fs.existsSync('backend/platform-server/src/main/resources/db/migration/V11__file_multipart_upload_metadata.sql')
  ? fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V11__file_multipart_upload_metadata.sql', 'utf8')
  : ''

const packageJson = fs.readFileSync('frontend/package.json', 'utf8')
const rootPackageJson = fs.readFileSync('package.json', 'utf8')
const largeUploadSmokePath = 'scripts/smoke-task-9d10-large-upload.spec.mjs'
const largeUploadSmoke = fs.existsSync(largeUploadSmokePath)
  ? fs.readFileSync(largeUploadSmokePath, 'utf8')
  : ''
const serverResumeSmokePath = 'scripts/smoke-task-9d10-server-resume.spec.mjs'
const serverResumeSmoke = fs.existsSync(serverResumeSmokePath)
  ? fs.readFileSync(serverResumeSmokePath, 'utf8')
  : ''
const interruptedResumeSmokePath = 'scripts/smoke-task-9d10-interrupted-resume.spec.mjs'
const interruptedResumeSmoke = fs.existsSync(interruptedResumeSmokePath)
  ? fs.readFileSync(interruptedResumeSmokePath, 'utf8')
  : ''

const requiredAppFragments = [
  'type MultipartInitiateResponse',
  'type MultipartPartUrlResponse',
  'doctorUploadFiles',
  'doctorUploadProgress',
  'doctorUploadCompletedFileIds',
  'doctorUploadServerResumeCandidates',
  'uploadDoctorOrderFiles',
  'files/multipart/initiate',
  'files/multipart/pending',
  'multipart/part-url',
  'multipart/status',
  'multipart/complete',
  'multipart/abort',
  'doctorUploadResumeSessions',
  'loadDoctorPendingMultipartUploads',
  'loadDoctorUploadSession',
  'findDoctorServerResumeCandidate',
  'saveDoctorUploadSession',
  'completed_parts',
  'data-testid="doctor-upload-file-input"',
  'data-testid="doctor-upload-bind-button"',
  'data-testid="doctor-upload-progress"',
  'data-testid="doctor-upload-completed-file-id"',
  'Uppy',
  '选择附件',
  '上传并绑定'
]

const requiredOpenApiFragments = [
  '"/files/multipart/initiate":',
  '"/files/multipart/pending":',
  '"/files/{fileId}/multipart/part-url":',
  '"/files/{fileId}/multipart/status":',
  '"/files/{fileId}/multipart/complete":',
  '"/files/{fileId}/multipart/abort":',
  'MultipartInitiateResponse',
  'MultipartPartUrlResponse',
  'MultipartPendingUploadsResponse',
  'MultipartStatusResponse',
  'MultipartCompleteRequest'
]

const requiredMigrationFragments = [
  'multipart_upload_id',
  'multipart_part_size',
  'multipart_part_count',
  'upload_status'
]

const missing = [
  ...requiredAppFragments.filter((fragment) => !app.includes(fragment)).map((fragment) => `frontend/src/App.vue -> ${fragment}`),
  ...requiredOpenApiFragments.filter((fragment) => !openapi.includes(fragment)).map((fragment) => `docs/api/openapi.yaml -> ${fragment}`),
  ...requiredMigrationFragments.filter((fragment) => !migration.includes(fragment)).map((fragment) => `V11__file_multipart_upload_metadata.sql -> ${fragment}`),
  ...['@uppy/core'].filter((fragment) => !packageJson.includes(fragment)).map((fragment) => `frontend/package.json -> ${fragment}`),
  ...['/files'].filter((fragment) => !vite.includes(fragment)).map((fragment) => `frontend/vite.config.ts -> ${fragment}`),
  ...['smoke:task9d10-large-upload', 'smoke:task9d10-server-resume', 'smoke:task9d10-interrupted-resume'].filter((fragment) => !rootPackageJson.includes(fragment)).map((fragment) => `package.json -> ${fragment}`),
  ...[
    'TASK9D10_UPLOAD_SIZE_BYTES',
    'playwright',
    'setInputFiles',
    'doctor-upload-file-input',
    'doctor-upload-bind-button',
    'doctor-upload-completed-file-id',
    '100MB'
  ].filter((fragment) => !largeUploadSmoke.includes(fragment)).map((fragment) => `${largeUploadSmokePath} -> ${fragment}`),
  ...[
    'TASK9D10_RESUME_UPLOAD_SIZE_BYTES',
    'files/multipart/initiate',
    'files/multipart/pending',
    'doctor-order-upload:',
    'pendingFileId',
    'doctor-upload-completed-file-id',
    'server resume'
  ].filter((fragment) => !serverResumeSmoke.includes(fragment)).map((fragment) => `${serverResumeSmokePath} -> ${fragment}`)
  ,
  ...[
    'TASK9D10_INTERRUPTED_UPLOAD_SIZE_BYTES',
    'route',
    'abort',
    'doctor-order-upload:',
    'multipart/status',
    'doctor-upload-completed-file-id',
    'interrupted resume'
  ].filter((fragment) => !interruptedResumeSmoke.includes(fragment)).map((fragment) => `${interruptedResumeSmokePath} -> ${fragment}`)
]

if (missing.length > 0) {
  console.error('task 9D.10 frontend multipart check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.10 frontend multipart check ok')
