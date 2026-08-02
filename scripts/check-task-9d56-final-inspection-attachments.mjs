import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/resources/db/migration/V28__final_inspection_attachment_permission.sql', [
    'CREATE TABLE final_inspection_report_file',
    'final-inspection:manage',
    'fk_final_inspection_report_file_resource',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java', [
    '@PostMapping("/final-inspection-reports")',
    'final-inspection:manage',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', [
    'validateFinalInspectionAttachmentFiles',
    "visibility = 'INTERNAL'",
    "upload_status = 'COMPLETED'",
    'final_inspection_report_file',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/FinalInspectionReportRequest.java', [
    '@JsonProperty("attachment_file_ids")',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/FinalInspectionReportResponse.java', [
    '@JsonProperty("attachment_file_ids")',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java', [
    'finalInspectionReportRequiresFinalOutPassAndIsInternalOnly',
    'final-inspection:manage',
    'attachment_file_ids',
    '/files/{fileId}/preview-url',
  ]],
  ['frontend/src/App.vue', [
    'finalInspectionAttachmentFileIds',
    'final-inspection-attachment-file-ids',
    'attachment_file_ids',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.56 第一增量',
    'FinalInspectionReportRequest',
    'FinalInspectionReportResponse',
    'attachment_file_ids',
    'final-inspection:manage',
  ]],
  ['acceptance.json', [
    'task-9d56-final-inspection-attachments-required-text',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.56',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '终检专用角色 / 附件第一增量',
  ]],
  ['DECISIONS.md', [
    'D-102 任务 9D.56 终检报告采用专用权限与内部附件绑定',
  ]],
  ['STATUS.md', [
    '9D.56 终检专用角色 / 附件第一增量',
  ]],
  ['tasks/README.md', [
    '任务 9D.56：终检专用角色 / 附件第一增量',
  ]],
  ['README.md', [
    '9D.56 终检专用角色 / 附件第一增量',
  ]],
  ['package.json', [
    'check:task9d56',
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

console.log('task 9D.56 final inspection attachments check ok')
