import { readFile } from 'node:fs/promises'

const files = {
  page: 'frontend/src/components/CustomerManagementPage.vue',
  style: 'frontend/src/components/customer-management-page.css',
  portal: 'frontend/src/components/CsPortalPages.vue',
  migration: 'backend/platform-server/src/main/resources/db/migration/V46__customer_management_full_foundation.sql',
  permissionMigration: 'backend/platform-server/src/main/resources/db/migration/V85__grant_cs_clinic_create_permission.sql',
  controller: 'backend/platform-server/src/main/java/com/yuri/aiorder/clinic/ClinicController.java',
  service: 'backend/platform-server/src/main/java/com/yuri/aiorder/clinic/ClinicManagementService.java',
  order: 'backend/platform-server/src/main/java/com/yuri/aiorder/order/api/OrderCreationService.java',
  test: 'backend/platform-server/src/test/java/com/yuri/aiorder/clinic/CustomerManagementTests.java',
  permissionTest: 'backend/platform-server/src/test/java/com/yuri/aiorder/clinic/ClinicPreferenceTests.java',
  smoke: 'scripts/check-cs-portal-pixel-smoke.mjs',
  openapi: 'docs/api/openapi.yaml'
}

const contents = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([key, file]) =>
  [key, await readFile(file, 'utf8')])))

function requireIncludes(key, fragments) {
  for (const fragment of fragments) {
    if (!contents[key].includes(fragment)) {
      throw new Error(`${files[key]} missing required fragment: ${fragment}`)
    }
  }
}

requireIncludes('page', [
  'data-testid="customer-management-v2"', '搜索客户编码、客户名称、联系人、电话或业务员',
  "props.permissions.includes('clinic:create')", 'v-if="canCreateCustomer"',
  '客户主档', '开票信息', '收货地址与发货方式', '主要医生及联系方式', '资质证件与合同管理',
  '客户专属产品价格', '客户单据与打印模板', '制作偏好', '黑名单与下单风险', '操作记录',
  'statusLabel(clinic.customer_type)', 'statusLabel(clinic.settlement_type)', 'window.print()'
])
requireIncludes('style', [
  'font-family: Lora', 'Plus Jakarta Sans', 'border: 1.5px solid', '@media (max-width: 1100px)', '@media print'
])
requireIncludes('portal', [
  "import CustomerManagementPage from './CustomerManagementPage.vue'",
  "activeRoute === '/cs/customers'", '<CustomerManagementPage :token="token" :permissions="user?.permissions ?? []" />'
])
requireIncludes('migration', [
  'clinic_code', 'clinic_invoice_profile', 'clinic_shipping_address', 'clinic_doctor_contact',
  'clinic_business_document', 'clinic_product_price', 'customer_print_template',
  'clinic_print_template_binding', 'clinic_blacklist_record', 'clinic_change_log',
  'quoted_price_cents', 'pricing_source'
])
requireIncludes('permissionMigration', ["permission.permission_code = 'clinic:create'", "role.role_code = 'CS'"])
requireIncludes('controller', ['@RequirePermission(value = "clinic:create"'])
requireIncludes('service', [
  'updateManagement(', 'replaceAddresses(', 'replaceDoctors(', 'replaceDocuments(', 'replacePrices(',
  'replaceTemplateBindings(', 'blacklist(', 'releaseBlacklist(', 'appendChangeLog('
])
requireIncludes('order', [
  'ensureClinicCanOrder(identity.clinicId())', 'resolvePriceSnapshot(', 'CLINIC_BLACKLISTED',
  'quoted_price_cents', "THEN 'BASE_PRICE' ELSE 'CUSTOMER_PRICE'"
])
requireIncludes('test', [
  'csCanSearchByCodeAndMaintainCompleteCustomerProfile', 'blacklistBlocksDoctorOrderAndReleaseRestoresGate',
  'quoted_price_cents', '"CUSTOMER_PRICE"'
])
requireIncludes('permissionTest', [
  'databaseCsPermissionCanCreateClinicWithBearerToken', 'contains("clinic:create")',
  'csPortalRoleWithoutClinicCreatePermissionCannotCreateClinic'
])
requireIncludes('smoke', [
  "dataSelector: '.cmp-customer-grid article'", "page.locator('.el-dialog.cmp-detail-dialog')",
  "assertContainerWidth(dialog, 960, '客户完整档案弹窗')", '客户单据与打印模板', '黑名单与下单风险'
])
requireIncludes('openapi', [
  '"/clinics/{clinicId}/management"', '"/clinics/{clinicId}/blacklist"',
  '"/clinics/{clinicId}/blacklist/release"', 'ClinicManagementRequest:', 'ClinicManagementResponse:'
])

console.log('[PASS] 客户管理 V2：档案、专属价格、打印模板、黑名单门禁、视觉与契约静态检查通过')
