import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const wizard = read('frontend/src/doctor/DoctorCaseGroupWizard.vue')
const draftService = read('backend/platform-server/src/main/java/com/yuri/aiorder/order/casegroup/CaseGroupDraftService.java')
const caseGroupTests = read('backend/platform-server/src/test/java/com/yuri/aiorder/order/OrderCaseGroupTests.java')
const goal = read('goals/GOAL-036-doctor-order-final-confirmation-20260818.md')
const task = read('tasks/TASK-037-doctor-order-final-confirmation-20260818.md')
const acceptance = JSON.parse(read('acceptance.json'))

const failures = []
const requireText = (source, text, scope) => {
  if (!source.includes(text)) failures.push(`${scope} missing: ${text}`)
}

for (const text of [
  'CLASSIFIED_SCAN_BUNDLE_V3',
  'SCAN_UPLOAD_SLOTS',
  "code: 'combined_scan'",
  "code: 'scan_other'",
  'uploadSharedScanFiles',
  'uploadProductScanFiles',
  'inferScanSlot',
  'scanBundleCompleteForItem',
  'product_upload_slot_files',
  'effectiveUploadSlotIds',
  "code: 'upper_scan'",
  "code: 'lower_scan'",
  "code: 'bite_scan'",
  'case-shared-upload-slot',
  'handleSharedFileDrop',
  '继承共享资料',
  '产品专属资料',
  '@dragover.prevent',
  '@drop.prevent',
  '价格待配置',
  'case-review-field-grid',
  'case-review-ask-support',
  'openReviewSupportInquiry',
  'validationIssuesForStep',
  'finalValidationIssues',
  'case-validation-summary',
  'goToValidationIssue',
  'data-validation-target="scan-records"',
  'case-validation-focus',
  'allow-create',
  'OPTIONAL_PRIMARY_MATERIAL_V2',
  'SHADE_OPTIONAL_V2',
  '还不能进入下一步，请补齐以下内容',
  '订单暂时不能提交，请补齐以下内容',
  '缺 {count} 项必传资料',
  '询问客服',
  'Submit Order'
]) requireText(wizard, text, 'DoctorCaseGroupWizard.vue')

for (const text of [
  '上颌扫描',
  '下颌扫描',
  '咬合扫描',
  '价格占位',
  '询问客服',
  '不形成提交门禁',
  '共享或专属',
  '六类',
  'NOT_READY'
]) {
  requireText(`${goal}\n${task}`, text, 'GOAL-036/TASK-037')
}

for (const forbidden of [
  '当前所有产品均为“待报价”，提交后由客服核价并告知正式报价。',
  'All products are currently Quote Pending. Order Support will provide the final quote after submission.'
]) {
  if (wizard.includes(forbidden)) failures.push(`DoctorCaseGroupWizard.vue contains obsolete post-submit quote copy: ${forbidden}`)
}

for (const text of [
  'FIXED_SHARED_UPLOAD_VERSION',
  'FIXED_LAYERED_UPLOAD_VERSION',
  'CLASSIFIED_SCAN_BUNDLE_VERSION',
  'OPTIONAL_PRIMARY_MATERIAL_VERSION',
  'SHADE_OPTIONAL_VERSION',
  'REQUIRED_FIXED_SHARED_UPLOAD_SLOTS',
  'validateFixedSharedUploadSlots',
  'validateFixedLayeredUploadSlots',
  'validateClassifiedScanBundle',
  'classified scan bundle is incomplete',
  'required upload slot is missing for product',
  'required shared upload slot is missing',
  'shared upload file type is not allowed for slot'
]) requireText(draftService, text, 'CaseGroupDraftService.java')

for (const text of [
  'fixedSharedUploadContractRequiresOnlyUpperLowerAndBiteScans',
  'layeredUploadContractAllowsProductSpecificFilesToCompleteSharedRecords',
  'classifiedScanBundleAcceptsZipWithOptionalShadeAndPrimaryMaterial',
  'CLASSIFIED_SCAN_BUNDLE_V3',
  'SHADE_OPTIONAL_V2',
  'OPTIONAL_PRIMARY_MATERIAL_V2',
  'FIXED_LAYERED_V2',
  'product_upload_slot_files',
  'upper.stl',
  'lower.ply',
  'bite.obj',
  'shade_photo":[]'
]) requireText(caseGroupTests, text, 'OrderCaseGroupTests.java')

if (wizard.includes('产品专属资料均为选传')) {
  failures.push('DoctorCaseGroupWizard.vue contains obsolete all-product-specific-files-optional copy')
}

const submitButton = wizard.match(/data-testid="case-submit"[^\n]+/)?.[0] ?? ''
if (submitButton.includes('reviewInquiry')) {
  failures.push('DoctorCaseGroupWizard.vue inquiry state must not gate the submit button')
}
for (const obsoleteGate of ['incompleteItems', 'missingRequiredProductSlots', 'finalConfirmationComplete']) {
  if (submitButton.includes(obsoleteGate)) {
    failures.push(`DoctorCaseGroupWizard.vue submit button must remain clickable for validation feedback: ${obsoleteGate}`)
  }
}
if (wizard.includes('finalConfirmations.quote')) {
  failures.push('DoctorCaseGroupWizard.vue price placeholder must not be a quote confirmation gate')
}

const completedGoal = acceptance.goals.find((entry) => entry.id === 'GOAL-036')
if (!completedGoal) {
  failures.push('acceptance.json goals missing GOAL-036')
} else {
  if (completedGoal.status !== 'completed') {
    failures.push(`acceptance.json GOAL-036 must remain completed, received ${completedGoal.status}`)
  }
  if (completedGoal.file !== 'goals/GOAL-036-doctor-order-final-confirmation-20260818.md') {
    failures.push(`acceptance.json GOAL-036 file drifted: ${completedGoal.file}`)
  }
}
if (!String(acceptance.active_goal || '').startsWith('GOAL-')) {
  failures.push(`acceptance.json active_goal must point to a goal, received ${acceptance.active_goal}`)
}

if (failures.length) {
  console.error('doctor order final confirmation check failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('doctor order final confirmation check ok')
