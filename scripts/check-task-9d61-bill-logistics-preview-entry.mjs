import fs from 'node:fs'

const checks = [
  ['frontend/src/App.vue', [
    'doctorBillPreviewUrl',
    'loadDoctorBillPreviewUrl',
    'uploadInternalBill',
    'csBillFileId',
    'csBillResult',
    'doctor-bill-preview-link',
    'internal-bill-file-id',
    'internal-bill-upload-button',
    '/orders/${selectedInternalOrder.value.order_id}/bill',
    '/files/${doctorOrderWorkspace.value.bill.file_id}/preview-url',
    '账单预览链接',
    '上传账单文件',
  ]],
  ['acceptance.json', [
    'task-9d61-bill-logistics-preview-entry-required-text',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.61',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '账单物流预览/录入闭环第一增量',
  ]],
  ['DECISIONS.md', [
    'D-107 任务 9D.61 账单预览复用文件签名 URL 且物流继续走既有发货门禁',
  ]],
  ['STATUS.md', [
    '9D.61 账单物流预览/录入闭环第一增量',
  ]],
  ['tasks/README.md', [
    '任务 9D.61：账单物流预览/录入闭环第一增量',
  ]],
  ['README.md', [
    '9D.61 账单物流预览/录入闭环第一增量',
  ]],
  ['package.json', [
    'check:task9d61',
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

console.log('task 9D.61 bill/logistics preview entry check ok')
