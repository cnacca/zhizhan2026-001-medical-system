import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/quality/QualityRecordController.java', [
    '/quality-records',
    '/quality-records/external-returns',
    'check:read-internal',
    'message:manage',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/quality/QualityRecordService.java', [
    'EXTERNAL_RETURN',
    'check_record',
    'rework_record',
    'requireActiveDictionaryValue',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/quality/QualityRecordResponse.java', [
    'quality_record_id',
    'quality_record_type',
    'responsibility_type',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/quality/QualityRecordTests.java', [
    'csCanRegisterExternalReturnAndListQualityRecords',
    'qualityRecordsCanFilterByStatusAndResponsibilityType',
    'doctorCannotReadOrCreateInternalQualityRecords',
  ]],
  ['frontend/src/App.vue', [
    'QualityRecordResponse',
    '/quality-records/external-returns',
    'quality-record-table',
    'quality-record-create-button',
  ]],
  ['frontend/vite.config.ts', [
    "'/quality-records'",
  ]],
  ['docs/api/openapi.yaml', [
    '"/quality-records"',
    '"/quality-records/external-returns"',
    'QualityRecordResponse',
    'ExternalReturnQualityRecordRequest',
  ]],
  ['docs/acceptance/prd-v2-gap-matrix.md', [
    '9D.87',
    '质量记录 CRUD / 外返登记第一增量',
  ]],
  ['STATUS.md', [
    '9D.87 质量记录 CRUD / 外返登记第一增量',
  ]],
  ['tasks/README.md', [
    '任务 9D.87：质量记录 CRUD / 外返登记第一增量',
  ]],
  ['README.md', [
    'check:task9d87',
  ]],
  ['acceptance.json', [
    'task-9d87-quality-records-required-text',
  ]],
  ['package.json', [
    'check:task9d87',
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

console.log('task 9D.87 quality records check ok')
