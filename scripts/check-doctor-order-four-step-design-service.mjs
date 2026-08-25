import fs from 'node:fs'

const read = (file) => fs.readFileSync(file, 'utf8')
const wizard = read('frontend/src/doctor/DoctorCaseGroupWizard.vue')
const doctorPortal = read('frontend/src/doctor/DoctorPortalV2.vue')
const sourceSpec = read('frontend/src/doctor/customerOrderSourceSpec.ts')
const gateway = read('frontend/src/doctor/services/httpDoctorGateway.ts')
const contracts = read('frontend/src/doctor/types/contracts.ts')
const fileService = read('backend/platform-server/src/main/java/com/yuri/aiorder/file/api/FileResourceService.java')
const caseGroupTests = read('backend/platform-server/src/test/java/com/yuri/aiorder/order/OrderCaseGroupTests.java')
const fileTests = read('backend/platform-server/src/test/java/com/yuri/aiorder/file/FileAccessTests.java')
const migration = read('backend/platform-server/src/main/resources/db/migration/V89__design_service_order_and_delivery_flow.sql')
const catalogBackfill = read('backend/platform-server/src/main/resources/db/migration/V90__backfill_design_service_form_rules_all_versions.sql')
const optionalNoteMigration = read('backend/platform-server/src/main/resources/db/migration/V91__make_design_service_note_optional.sql')

const failures = []
const requireText = (source, fragment, scope) => {
  if (!source.includes(fragment)) failures.push(`${scope} missing: ${fragment}`)
}
const forbidText = (source, fragment, scope) => {
  if (source.includes(fragment)) failures.push(`${scope} still contains: ${fragment}`)
}

for (const step of ['基础信息与产品', '制作配置', '资料上传', '复核与提交']) {
  requireText(sourceSpec, step, 'customerOrderSourceSpec.ts')
}
for (const obsoleteStep of ['牙位与制作要求', '材料与工艺', '试戴与过程确认', '报价与周期确认']) {
  forbidText(sourceSpec, obsoleteStep, 'customerOrderSourceSpec.ts')
}
for (const fragment of [
  "productCategory(activeItem) === 'DESIGN_SERVICE'",
  '设计要求备注（选填）',
  '设计要求备注可选填',
  "step.value = Math.min(4, step.value + 1)",
  'step < 4',
  'data-validation-target="step-4-section"',
  '设计服务无需选择材料、加工工艺或试戴流程',
  'v-if="!designServiceSelected"',
  '数字设计交付',
  '设计资料确认',
  '账单付款即可下载原文件'
]) requireText(wizard, fragment, 'DoctorCaseGroupWizard.vue')
for (const fragment of [
  "errors.push(t('请填写设计要求备注'",
  "t('设计要求备注 *', 'Design Requirements Note *')"
]) forbidText(wizard, fragment, 'DoctorCaseGroupWizard.vue')
for (const fragment of [
  'case-review-panel',
  'case-review-panel__content',
  'grid-template-columns: 260px minmax(0, 1fr)'
]) requireText(wizard, fragment, 'DoctorCaseGroupWizard.vue alignment')
for (const fragment of ['账单付款后可下载', 'downloadDesignFile', "review.status === 'APPROVED'"]) {
  requireText(doctorPortal, fragment, 'DoctorPortalV2.vue')
}
for (const obsoleteField of [
  'design_requirement_turnaround',
  'design_delivery_turnaround',
  'design_delivery_format',
  'design_standard'
]) forbidText(wizard, obsoleteField, 'DoctorCaseGroupWizard.vue')

requireText(contracts, 'getFileDownloadUrl(fileId: string): Promise<string>', 'contracts.ts')
for (const fragment of ['/download-url', '/bill', 'payment_status']) {
  requireText(gateway, fragment, 'httpDoctorGateway.ts')
}
for (const fragment of [
  'requireDoctorDesignServiceDownloadEligibility',
  '"DESIGN_SERVICE"',
  "'DOCTOR_CONFIRMED'",
  "'PAID'"
]) requireText(fileService, fragment, 'FileResourceService.java')
for (const fragment of [
  'DESIGN_SERVICE_ONLY',
  'DESIGN_ORDER_REQUIREMENTS_'
]) requireText(migration, fragment, 'V89 design-service migration')
for (const fragment of ['DESIGN_SERVICE', 'tooth_positions', 'case_note']) {
  requireText(catalogBackfill, fragment, 'V90 design-service catalog backfill')
}
for (const fragment of ['DESIGN_SERVICE', 'case_note', "CAST('false' AS JSON)"]) {
  requireText(optionalNoteMigration, fragment, 'V91 optional design-note migration')
}
requireText(caseGroupTests, 'designServiceSubmissionUsesCommonScanBundleRequiresToothAndAllowsBlankNote', 'OrderCaseGroupTests.java')
forbidText(caseGroupTests, '"case_note":"按医生要求完成全冠设计"', 'OrderCaseGroupTests.java optional note submission')
requireText(fileTests, 'doctorDesignServiceDownloadRequiresConfirmationAndPaidBill', 'FileAccessTests.java')

if (failures.length) {
  console.error('doctor four-step design-service check failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('doctor four-step design-service check ok')
