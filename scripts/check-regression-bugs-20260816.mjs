import { readFile } from 'node:fs/promises'

const failures = []

async function expectAll(file, snippets) {
  const source = await readFile(file, 'utf8')
  for (const snippet of snippets) {
    if (!source.includes(snippet)) failures.push(`${file}: missing ${snippet}`)
  }
}

await expectAll('frontend/src/doctor/DoctorCaseGroupWizard.vue', [
  'async function restoreAttachedFiles(restored: CaseGroup)',
  '`/orders/${item.order_id}/files`',
  'await restoreAttachedFiles(restored)',
  'async function removeProductFile',
  'async function removeSharedFile',
  '@click="removeProductFile(activeItem, file)"',
  '@click="removeSharedFile(file)"',
  'if (busy.value || fileUploading.value) return false'
])

await expectAll('frontend/src/doctor/services/httpDoctorGateway.ts', [
  'allowedDoctorUploadExtensions',
  'hasAllowedDoctorUploadExtension(file.name)',
  '文件 ${file.name} 的格式不受支持'
])

await expectAll('backend/platform-server/src/main/java/com/yuri/aiorder/file/api/FileResourceService.java', [
  'validateUploadLimits(request.orderId(), request.originalFilename()',
  'isAllowedFilenameExtension',
  'file name extension is not allowed'
])

await expectAll('frontend/src/App.vue', [
  'async function restoreLoginSessionFromCookie()',
  "credentials: 'same-origin'",
  'rememberedLoginPortalKey',
  'checkTasksRequestVersion',
  'checkSelectionVersion',
  'loadCheckTasks(preferredNodeInstanceId)',
  'data-testid="production-help-open"'
])

await expectAll('backend/platform-server/src/main/java/com/yuri/aiorder/bootstrap/BootstrapAuthController.java', [
  'AI_ORDER_REFRESH',
  '.httpOnly(true)',
  '.sameSite("Strict")',
  '@RequestBody(required = false) RefreshTokenRequest request'
])

await expectAll('frontend/src/cs-portal.css', [
  '@media (max-width: 980px)',
  'grid-template-columns: minmax(0, 1fr);',
  'flex-wrap: wrap;',
  '@media (max-width: 520px)'
])

await expectAll('.github/workflows/deploy-production.yml', [
  'npm run check:regression-bugs-20260816'
])

if (failures.length) {
  console.error('2026-08-16 regression bug check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('2026-08-16 regression bug check ok')
