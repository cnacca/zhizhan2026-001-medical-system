import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const csPages = fs.readFileSync('frontend/src/components/CsPortalPages.vue', 'utf8')
const customerPage = fs.readFileSync('frontend/src/components/CustomerManagementPage.vue', 'utf8')
const productionDesign = fs.readFileSync('frontend/src/components/ProductionDesignWorkspace.vue', 'utf8')
const adminRemaining = fs.readFileSync('frontend/src/components/AdminRemainingPages.vue', 'utf8')
const adminRbac = fs.readFileSync('frontend/src/components/AdminRbacPages.vue', 'utf8')
const doctorPortal = fs.readFileSync('frontend/src/doctor/DoctorPortalV2.vue', 'utf8')
const doctorGateway = fs.readFileSync('frontend/src/doctor/services/doctorGateway.ts', 'utf8')
const logoutCoordination = fs.readFileSync('frontend/src/utils/logoutRefreshCoordination.js', 'utf8')

const failures = []
const required = [
  [app, 'App.vue', 'function clearSensitiveBusinessState()'],
  [app, 'App.vue', 'function clearInternalOrderSelection()'],
  [app, 'App.vue', 'refreshSessionPromise'],
  [app, 'App.vue', 'refreshAccessTokenSingleFlight()'],
  [app, 'App.vue', 'response.status !== 401'],
  [app, 'App.vue', 'function authorizationIdentitySnapshot(payload: LoginResponse | null)'],
  [app, 'App.vue', 'const authorizationChanged = authorizationIdentitySnapshot(currentUser.value) !== authorizationIdentitySnapshot(payload)'],
  [app, 'App.vue', 'ensureAuthorizedRouteAfterRefresh()'],
  [app, 'App.vue', 'void reloadSessionScopedData()'],
  [app, 'App.vue', ':key="authorizationViewVersion"'],
  [app, 'App.vue', 'if (logoutInProgress) return { ok: false, authorizationChanged: false }'],
  [app, 'App.vue', 'const tokenToRevoke = await captureRefreshTokenForLogout('],
  [app, 'App.vue', 'signal: controller.signal'],
  [app, 'App.vue', 'phaseOneAbDashboardOrderTotal.value'],
  [app, 'App.vue', "'production-review': 'workflow:review-production'"],
  [app, 'App.vue', "'production-design-reviews': 'design-draft:internal-review'"],
  [app, 'App.vue', "'production-final-report': 'check:read-internal'"],
  [app, 'App.vue', 'const canManageFinalInspectionReport = computed(() =>'],
  [app, 'App.vue', "currentUser.value?.permissions.includes('final-inspection:manage')"],
  [app, 'App.vue', ':disabled="!canManageFinalInspectionReport"'],
  [csPages, 'CsPortalPages.vue', 'function clearLoadedOrderState()'],
  [csPages, 'CsPortalPages.vue', 'for (let page = 2; page <= pageCount; page += 1)'],
  [customerPage, 'CustomerManagementPage.vue', 'await openCustomer(clinicId)'],
  [doctorGateway, 'doctorGateway.ts', "if (!import.meta.env.DEV) return 'api'"],
  [doctorGateway, 'doctorGateway.ts', "import('./mockDoctorGateway')"],
  [doctorPortal, 'DoctorPortalV2.vue', 'async function downloadAllInvoices()'],
  [doctorPortal, 'DoctorPortalV2.vue', 'for (const record of records)'],
  [doctorPortal, 'DoctorPortalV2.vue', ':disabled="bulkInvoiceDownloading || downloadableInvoiceRefunds.length === 0"'],
  [logoutCoordination, 'logoutRefreshCoordination.js', 'await Promise.race(['],
  [logoutCoordination, 'logoutRefreshCoordination.js', 'return getLatestToken()']
]
for (const [content, file, fragment] of required) {
  if (!content.includes(fragment)) failures.push(`${file} missing: ${fragment}`)
}

const forbiddenSourcePatterns = [
  [app, 'App.vue', /Promise\.all\(Array\.from\(\{ length: pageCount - 1 \}/],
  [csPages, 'CsPortalPages.vue', /Promise\.all\(Array\.from\(\{ length: pageCount - 1 \}/],
  [app, 'App.vue', /doctorMock/],
  [doctorGateway, 'doctorGateway.ts', /doctorMock/],
  [doctorGateway, 'doctorGateway.ts', /import\s+\{\s*MockDoctorGateway\s*\}/],
  [app, 'App.vue', /follow_up_status/],
  [csPages, 'CsPortalPages.vue', /follow_up_status/],
  [app, 'App.vue', /\/logistics\/orders\/summary/],
  [productionDesign, 'ProductionDesignWorkspace.vue', /OrthodonticWorkflowPanel/],
  [app, 'App.vue', /production-approval-workspace/]
]
for (const [content, file, pattern] of forbiddenSourcePatterns) {
  if (pattern.test(content)) failures.push(`${file} contains reverted or forbidden pattern: ${pattern}`)
}

const reportBlock = app.slice(
  app.indexOf('async function createFinalInspectionReport()'),
  app.indexOf('function parseOptionalFileId(', app.indexOf('async function createFinalInspectionReport()'))
)
const reportGuardIndex = reportBlock.indexOf('if (!canManageFinalInspectionReport.value)')
const reportRequestIndex = reportBlock.indexOf("apiFetch<FinalInspectionReportResponse>('/final-inspection-reports'")
if (!(reportGuardIndex >= 0 && reportGuardIndex < reportRequestIndex)) {
  failures.push('final inspection report write must check final-inspection:manage before the request')
}

for (const [content, file, pattern] of [
  [csPages, 'CsPortalPages.vue', /watch\([^\n]*props\.token/],
  [customerPage, 'CustomerManagementPage.vue', /watch\([^\n]*props\.token/],
  [productionDesign, 'ProductionDesignWorkspace.vue', /watch\([^\n]*props\.token/],
  [adminRemaining, 'AdminRemainingPages.vue', /watch\([^\n]*props\.token/],
  [adminRbac, 'AdminRbacPages.vue', /watch\([^\n]*props\.token/]
]) {
  if (pattern.test(content)) failures.push(`${file} must not reload full page data on access-token rotation`)
}

const logoutBlock = app.slice(app.indexOf('async function logout()'), app.indexOf('function clearSensitiveBusinessState()'))
const logoutLockIndex = logoutBlock.indexOf('logoutInProgress = true')
const captureLatestIndex = logoutBlock.indexOf('await captureRefreshTokenForLogout(')
const revokeIndex = logoutBlock.indexOf("fetch('/api/auth/logout'")
const clearLocalIndex = logoutBlock.indexOf('clearLoginSession()')
if (!(logoutLockIndex >= 0 && logoutLockIndex < captureLatestIndex
  && captureLatestIndex < revokeIndex && revokeIndex < clearLocalIndex)) {
  failures.push('logout must lock refresh, capture the latest token, revoke it, then clear local state')
}

const loginBlock = app.slice(app.indexOf('async function login('), app.indexOf('function applyLoginSession('))
const successfulPayloadIndex = loginBlock.indexOf("throw new Error('账号角色与所选入口不匹配')")
const clearPasswordIndex = loginBlock.indexOf("password.value = ''")
const applyLoginIndex = loginBlock.indexOf('applyLoginSession(payload,')
if (!(successfulPayloadIndex >= 0 && successfulPayloadIndex < clearPasswordIndex
  && clearPasswordIndex < applyLoginIndex)) {
  failures.push('successful login must clear the password before applying the session')
}

const sensitiveResetBlock = app.slice(app.indexOf('function clearSensitiveBusinessState()'), app.indexOf('function clearLoginSession()'))
for (const refName of [
  'doctorAiQuestion', 'csAiQueryQuestion', 'doctorPatientKeyword', 'doctorOrderKeyword',
  'internalOrderKeyword', 'adminOrderKeyword', 'adminCommunicationKeyword', 'doctorGlobalSearch',
  'adminGlobalSearch', 'clinicKeyword', 'adminClientKeyword', 'productionReviewKeyword',
  'processInstanceKeyword', 'staffWorkloadKeyword', 'productionBoardKeyword',
  'productCatalogKeyword', 'csPortalGlobalSearch'
]) {
  if (!sensitiveResetBlock.includes(`${refName}.value = ''`)) failures.push(`clearSensitiveBusinessState must reset ${refName}`)
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('frontend bug audit regression checks passed')
