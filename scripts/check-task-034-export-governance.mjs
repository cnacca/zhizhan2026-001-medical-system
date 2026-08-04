import fs from 'node:fs'

// TASK-034 E 批次：导出管控与留痕。
// 守住四件事：
//   1. 医生端一个导出入口都没有（客户第一条要求，且这是本批次开工时就已被违反的现状）；
//   2. 敏感分类是配置不是写死的角色名判断；
//   3. 每次下载都留痕，且留痕含客户点名的五项；
//   4. 导出不绕过数据范围——否则等于开了一条「看不到的数据也能导出来」的旁路。

const read = (p) => fs.readFileSync(p, 'utf8')

const migration = read(
  'backend/platform-server/src/main/resources/db/migration/V82__export_governance_and_audit.sql'
)
const catalog = read('backend/platform-server/src/main/java/com/yuri/aiorder/export/ExportDatasetCatalog.java')
const provider = read('backend/platform-server/src/main/java/com/yuri/aiorder/export/ExportDataProvider.java')
const service = read('backend/platform-server/src/main/java/com/yuri/aiorder/export/ExportService.java')
const controller = read('backend/platform-server/src/main/java/com/yuri/aiorder/export/ExportController.java')
const adminPage = read('frontend/src/components/AdminExportPages.vue')
const app = read('frontend/src/App.vue')
const doctorPortal = read('frontend/src/doctor/DoctorPortalV2.vue')
const openapi = read('docs/api/openapi.yaml')
const tests = read('backend/platform-server/src/test/java/com/yuri/aiorder/export/ExportGovernanceTests.java')

const failures = []

const required = [
  // 敏感分类与权限码是数据
  [migration, 'V82 migration', 'CREATE TABLE export_dataset'],
  [migration, 'V82 migration', 'CREATE TABLE export_request'],
  [migration, 'V82 migration', 'CREATE TABLE export_audit'],
  [migration, 'V82 migration', "'export:execute'"],
  [migration, 'V82 migration', "'export:sensitive'"],
  [migration, 'V82 migration', "'export:approve'"],
  [migration, 'V82 migration', "'export:audit:read'"],
  // 客户点名的四类必须都在，且都是 SENSITIVE
  [migration, 'V82 migration', "'CUSTOMER_PROFILE', '客户档案', 'SENSITIVE'"],
  [migration, 'V82 migration', "'CUSTOMER_SHIPPING_ADDRESS', '客户收货地址', 'SENSITIVE'"],
  [migration, 'V82 migration', "'ORDER_BILL', '订单账单与金额', 'SENSITIVE'"],
  [migration, 'V82 migration', "'PRODUCT_PRICE', '产品价格', 'SENSITIVE'"],
  // 留痕五项
  [migration, 'V82 migration', 'operator_user_id BIGINT NOT NULL'],
  [migration, 'V82 migration', 'exported_at DATETIME(3) NOT NULL'],
  [migration, 'V82 migration', 'filter_json JSON NULL'],
  [migration, 'V82 migration', 'row_count INT NOT NULL'],
  [migration, 'V82 migration', 'field_list VARCHAR(1024) NOT NULL'],
  [service, 'ExportService.java', 'INSERT INTO export_audit'],
  // 审批强制点
  [service, 'ExportService.java', 'sensitive export is still waiting for approval'],
  [service, 'ExportService.java', 'cannot be approved by its own requester'],
  [service, 'ExportService.java', 'acknowledged must be true'],
  [service, 'ExportService.java', 'only the requester can download this export'],
  [service, 'ExportService.java', 'private void requireFullDataScope('],
  // 数据范围不被绕过
  [provider, 'ExportDataProvider.java', 'private JdbcClient.StatementSpec scoped('],
  [provider, 'ExportDataProvider.java', ":dataScope = 'ALL'"],
  [provider, 'ExportDataProvider.java', 'ALLOWED_KEYS'],
  [provider, 'ExportDataProvider.java', 'public void validateAgainstCatalog()'],
  [catalog, 'ExportDatasetCatalog.java', 'PERMISSION_AUDIT_READ'],
  // 管理端可实操界面
  [adminPage, 'AdminExportPages.vue', '@submit.prevent="submitRequest"'],
  [adminPage, 'AdminExportPages.vue', 'decide(item, true)'],
  [adminPage, 'AdminExportPages.vue', 'download(item)'],
  [adminPage, 'AdminExportPages.vue', 'export-acknowledge'],
  [adminPage, 'AdminExportPages.vue', 'export-audit-table'],
  [app, 'App.vue', 'adminExportRoutePaths'],
  [app, 'App.vue', "'/admin/export/center'"],
  [app, 'App.vue', "'/admin/export/audit'"],
  [migration, 'V82 migration', "'admin-export-center'"],
  // 契约
  [openapi, 'openapi.yaml', 'getExportDatasets'],
  [openapi, 'openapi.yaml', 'postExportRequest'],
  [openapi, 'openapi.yaml', 'postExportApprove'],
  [openapi, 'openapi.yaml', 'postExportReject'],
  [openapi, 'openapi.yaml', 'postExportDownload'],
  [openapi, 'openapi.yaml', 'getExportAudits'],
  // 测试
  [tests, 'ExportGovernanceTests.java', 'doctorHasNoExportPermissionCodeAndEveryExportEndpointRejectsThem'],
  [tests, 'ExportGovernanceTests.java', 'sensitiveExportCannotBeDownloadedBeforeApproval'],
  [tests, 'ExportGovernanceTests.java', 'allFourCustomerNamedCategoriesAreClassifiedAsSensitive'],
  [tests, 'ExportGovernanceTests.java', 'requesterCannotApproveTheirOwnSensitiveExport'],
  [tests, 'ExportGovernanceTests.java', 'everyDownloadRecordsOperatorTimeRangeRowCountAndFieldList'],
  [tests, 'ExportGovernanceTests.java', 'auditFieldListMatchesTheCsvHeaderActuallyProduced'],
  [tests, 'ExportGovernanceTests.java', 'accountWithoutExportPermissionCodeIsDeniedEvenWhenThePortalRoleMatches'],
  [tests, 'ExportGovernanceTests.java', 'onlyTheRequesterCanDownloadTheirOwnApprovedExport'],
  [tests, 'ExportGovernanceTests.java', 'exportWithoutExplicitAcknowledgementIsRejected']
]

required
  .filter(([content, , fragment]) => !content.includes(fragment))
  .forEach(([, file, fragment]) => failures.push(`${file} missing: ${fragment}`))

// 1. 医生端不得有任何导出入口。开工时这里有两个纯前端拼 CSV 的按钮，
//    点一下就把患者姓名与金额全带走——与客户「不允许医生直接导出」正好相反。
const doctorFiles = fs
  .readdirSync('frontend/src/doctor', { recursive: true })
  .filter((name) => typeof name === 'string' && (name.endsWith('.vue') || name.endsWith('.ts')))
  .map((name) => `frontend/src/doctor/${name}`)
for (const file of doctorFiles) {
  const content = read(file)
  for (const forbidden of ['text/csv', '导出', 'exportOrders', 'downloadBillingCsv']) {
    if (content.includes(forbidden)) {
      failures.push(`${file}: 出现导出入口痕迹「${forbidden}」，客户要求医生端不得直接导出`)
    }
  }
}

// 2. 导出接口的角色白名单里不得出现 DOCTOR。
for (const match of controller.matchAll(/@RequirePermission\([^)]*\)/gs)) {
  if (match[0].includes('UserRole.DOCTOR')) {
    failures.push('ExportController.java: 导出接口的 roles 里出现了 DOCTOR')
  }
}

// 3. 医生端角色不得被授予任何 export:* 权限码。
const doctorRolePattern = /\('(DOCTOR|CLINIC_ADMIN|CLINIC_DOCTOR|CLINIC_FRONTDESK|CLINIC_ASSISTANT)',\s*'export:[^']*'\)/
if (doctorRolePattern.test(migration)) {
  failures.push('V82 migration: 给医生端角色授予了 export:* 权限码')
}

// 4. 取数 SQL 只能待在 ExportDataProvider 一处，别处再写一份就会绕过分类与留痕。
const exportDir = 'backend/platform-server/src/main/java/com/yuri/aiorder/export'
for (const name of fs.readdirSync(exportDir)) {
  if (name === 'ExportDataProvider.java') continue
  const content = read(`${exportDir}/${name}`)
  if (/FROM\s+(clinic|orders|order_bill|catalog_product_v2)\b/i.test(content)) {
    failures.push(`${name}: 导出取数 SQL 必须集中在 ExportDataProvider，否则会绕过敏感分类与留痕`)
  }
}

if (failures.length > 0) {
  console.error('check:task-034-export-governance failed:')
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(`check:task-034-export-governance passed (${required.length} assertions + 4 结构断言)`)
