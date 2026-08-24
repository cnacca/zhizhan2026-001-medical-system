import { readFile } from 'node:fs/promises'

const failures = []

async function expectAll(file, snippets) {
  const source = await readFile(file, 'utf8')
  for (const snippet of snippets) {
    if (!source.includes(snippet)) failures.push(`${file}: missing ${snippet}`)
  }
  return source
}

await expectAll('frontend/src/components/CsPortalPages.vue', [
  '客服初审依据',
  'data-testid="cs-information-review-reject"',
  'async function rejectTranslationOrder()',
  "action: 'REJECT'",
  "@click=\"previewOrderFile(file)\""
])

await expectAll('frontend/src/App.vue', [
  'const signedFileUrlTimeoutMs = 15_000',
  '获取文件链接超时，请检查网络后重试',
  'data-testid="production-review-order-files"',
  'data-testid="process-assignment-order-files"',
  "previewWorkflowStlFile(file, 'review')",
  "previewWorkflowStlFile(file, 'assignment')",
  '下载不是审核前置条件',
  'data-testid="app-inline-file-preview"',
  'async function previewOrderFileInline',
  'function triggerSignedFileDownload'
])

const appSource = await readFile('frontend/src/App.vue', 'utf8')
if (appSource.includes("window.open('about:blank'")) {
  failures.push('App.vue: preview/download must not navigate through an about:blank popup')
}

const fileController = await expectAll(
  'backend/platform-server/src/main/java/com/yuri/aiorder/file/api/FileController.java',
  [
    '@GetMapping("/orders/{orderId}/files")',
    '@GetMapping("/files/{fileId}/preview-url")',
    '@GetMapping("/files/{fileId}/download-url")',
    '"workflow:review-production"'
  ]
)
const completeUploadBlock = fileController.slice(
  fileController.indexOf('@PostMapping("/files/{fileId}/complete")'),
  fileController.indexOf('@GetMapping("/orders/{orderId}/files")')
)
if (completeUploadBlock.includes('workflow:review-production')) {
  failures.push('FileController: production reviewer must not receive file mutation permission')
}

await expectAll('backend/platform-server/src/main/java/com/yuri/aiorder/file/api/FileResourceService.java', [
  'identity.hasPermission("workflow:review-production")',
  "production_review_order.internal_status = 'PENDING_PRODUCTION_REVIEW'",
  "AND internal_status = 'PENDING_PRODUCTION_REVIEW'",
  '"response-content-disposition"',
  'download ? "attachment" : "inline"'
])

await expectAll('backend/platform-server/src/test/java/com/yuri/aiorder/file/FileAccessTests.java', [
  'productionReviewerSelfScopeCanReadPendingReviewFilesButCannotMutateThem',
  'productionReviewPermissionDoesNotExposeUnassignedReadyOrderFiles',
  'firstValue("Content-Disposition")',
  'startsWith("inline;")',
  'startsWith("attachment;")',
  ".andExpect(status().isForbidden())"
])

if (failures.length) {
  console.error('2026-08-22 blocker regression check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('2026-08-22 blocker regression check ok')
