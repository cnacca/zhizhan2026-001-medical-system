import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/resources/db/migration/V29__final_inspection_pdf_signature_placeholder.sql', [
    'pdf_file_id',
    'signature_status',
    'signed_by_user_id',
    'fk_final_inspection_report_pdf_file',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/FinalInspectionReportRequest.java', [
    '@JsonProperty("pdf_file_id")',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/FinalInspectionReportResponse.java', [
    '@JsonProperty("pdf_file_id")',
    '@JsonProperty("signature_status")',
    '@JsonProperty("signed_by_user_id")',
    '@JsonProperty("signed_at")',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', [
    'validateFinalInspectionPdfFile',
    "content_type = 'application/pdf'",
    "signature_status, signed_by_user_id, signed_at",
    "'PENDING'",
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java', [
    'pdf_file_id',
    'signature_status',
    'createCompletedInternalPdfFile',
    '/files/{fileId}/preview-url',
  ]],
  ['frontend/src/App.vue', [
    'finalInspectionPdfFileId',
    'final-inspection-pdf-file-id',
    'pdf_file_id',
    'signature_status',
    '签名',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.65 第一增量',
    'pdf_file_id',
    'signature_status',
    'signed_by_user_id',
    'signed_at',
  ]],
  ['acceptance.json', [
    'task-9d65-final-inspection-pdf-signature-required-text',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.65',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '终检 PDF/签名第一段',
  ]],
  ['DECISIONS.md', [
    'D-116 任务 9D.65 终检报告采用内部 PDF 文件绑定与签名占位',
  ]],
  ['STATUS.md', [
    '9D.65 终检 PDF/签名第一段',
  ]],
  ['tasks/README.md', [
    '任务 9D.65：终检 PDF/签名第一段',
  ]],
  ['README.md', [
    '9D.65 终检 PDF/签名第一段',
  ]],
  ['package.json', [
    'check:task9d65',
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

console.log('task 9D.65 final inspection PDF and signature placeholder check ok')
