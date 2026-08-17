import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const app = read('frontend/src/App.vue')
const portal = read('frontend/src/doctor/DoctorPortalV2.vue')
const css = read('frontend/src/doctor/doctor-portal-v2.css')
const contracts = read('frontend/src/doctor/types/contracts.ts')
const httpGateway = read('frontend/src/doctor/services/httpDoctorGateway.ts')
const mockGateway = read('frontend/src/doctor/services/mockDoctorGateway.ts')

const failures = []
const requireText = (source, text, scope) => {
  if (!source.includes(text)) failures.push(`${scope} missing: ${text}`)
}
const rejectText = (source, pattern, scope) => {
  if (pattern.test(source)) failures.push(`${scope} contains forbidden pattern: ${pattern}`)
}
const between = (source, start, end, scope) => {
  const startIndex = source.indexOf(start)
  const endIndex = source.indexOf(end, startIndex + start.length)
  if (startIndex < 0 || endIndex < 0) {
    failures.push(`${scope} boundary missing`)
    return ''
  }
  return source.slice(startIndex, endIndex)
}

for (const text of ['DoctorPortalV2', 'isDoctorV2Active', "v-if=\"isDoctorV2Active\""]) requireText(app, text, 'App.vue doctor mount')
for (const text of ['width: 224px', 'height: 58px', 'font-size: 14px', '--dv2-text: #0f172a', 'width: 500px', 'position: fixed', 'inset: 0']) requireText(css, text, 'doctor shell geometry')
for (const text of ['首页概览', '我的订单', '订单助手', '患者档案', '账单中心', '诊所设置', '消息中心']) requireText(portal, text, 'doctor navigation')
for (const text of ['今日订单', '制作中', '即将送达', '待回复', '设计待确认', '到期提醒', '需要处理', '医生工作台趋势图']) requireText(portal, text, 'dashboard preserved composition')

const orderPage = between(portal, "activePage === 'orders'", "activePage === 'assistant'", 'orders page')
for (const text of ['医生 / 患者', '诊所', '标签', '创建 / 到期', '公开状态', '当前操作']) requireText(orderPage, text, 'orders page columns')
for (const text of ['高级筛选', '负责医生', '订单标签', '创建日期从', '配送中', '待付款']) requireText(orderPage, text, 'orders reference filters')
rejectText(orderPage, /(物流公司|运单号|承运商|tracking_no|carrier)/, 'orders page boundary')

const orderDrawer = between(portal, 'doctor-order-drawer', 'patientDrawerOpen', 'order drawer')
for (const text of ['公开进度', '订单资料', '确认记录', '进入订单沟通']) requireText(orderDrawer, text, 'order drawer')
rejectText(orderDrawer, /(物流公司|运单号|承运商|tracking_no|carrier)/, 'order drawer boundary')

const patientPage = between(portal, "activePage === 'patients'", "activePage === 'billing'", 'patient page')
for (const text of ['患者姓名', '诊所', '负责医生', '最近产品', '建档日期', '订单', '治疗状态', '疗程', '治疗结束', '已归档']) requireText(patientPage, text, 'patient reference table')
for (const text of ['出生日期', '联系电话', '电子邮箱', '病史 / 用药 / 过敏信息', '所属诊所']) requireText(portal, text, 'patient profile form')
for (const text of ['编辑患者档案', '患者资料', '订单历史', '历史参考', '为患者新建订单']) requireText(portal, text, 'patient drawer preserved capabilities')

const billingPage = between(portal, "activePage === 'billing'", "activePage === 'messages'", 'billing page')
for (const text of ['按单结算', '月结账单', '发票与退款', '物流', '运单号']) requireText(billingPage, text, 'billing and logistics')
for (const text of ['账期提示', '下载全部', '下载 PDF']) requireText(billingPage, text, 'billing reference composition')
requireText(billingPage, '@click="openOrder(bill.order_id)"', 'billing order drawer stays on billing page')
if (billingPage.includes('@click="openGlobalOrder(bill.order_id)"')) fail('billing order action must not navigate to the orders page')
for (const text of ['本期账单', '账户余额']) requireText(portal, text, 'billing reference metrics')

const messagePage = between(portal, "activePage === 'messages'", "activePage === 'account'", 'messages page')
for (const text of ['搜索订单、患者或消息', "key: 'UNREAD'", "key: 'READ'", 'thread.messages.map', '驳回并留言', '同意当前版本']) requireText(portal, text, 'messages and review flow')
rejectText(messagePage, /(AI翻译|技师姓名|内部工序)/, 'messages business boundary')

for (const text of [
  "['产品与患者', '牙位与病例', '产品配置', '上传资料', '复核提交']",
  'wizardCategories',
  'wizardToothNumbers',
  'doctorOrderPatientFieldKeys',
  'doctorOrderToothFieldKeys',
  'wizardSubmissionDynamicFields',
  'patient_name: patientName',
  'tooth_position: toothPosition',
  '患者和牙位已从前两步自动带入',
  '当前产品没有需要额外填写的制作参数',
  'handleWizardDrop',
  'dv2-tooth-chart',
  '如制作过程中需要确认设计稿，订单服务会在订单详情中通知您',
  'CAD_DESIGN',
  'POST_MILLING_PHOTOS',
  'POST_GLAZING_PHOTOS',
  'gateway.uploadOrderFiles',
  'wizardUploadedFileSignatures',
  'wizard.files.push(completed)',
  'draftOrderId: wizard.draftOrderId',
  'withWizardOrderContext',
  'upsertOrderSummary(saved)',
  'if (wasNewDraft) resetOrderFilters()',
  'upsertOrderSummary(created)',
  'applyRefreshedDataset(await gateway.loadDataset(), created)',
  'parseDoctorDateTime',
  'doctorLocalDateKey',
  'compactDoctorDateTime(order.created_at)',
  'wizardSubmitDisabled',
  ':disabled="wizardSubmitDisabled"',
  "ElMessage.success(t('草稿已保存'",
  'gateway.switchRole',
  "review.allowed_actions.includes('APPROVE_REVIEW')",
  "review.allowed_actions.includes('REJECT_REVIEW')"
]) requireText(portal, text, 'wizard roles and reviews')
rejectText(portal, /<h1>确认选项<\/h1>/, 'wizard must follow PRD five-step order entry')
rejectText(portal, /(下单时无需预先选择确认节点|由后台|真实产品目录|组长内审|智能完整性检查)/, 'doctor-facing wording boundary')
rejectText(portal, /<span>\{\{ order\.created_at \}\}<\/span>/, 'doctor order time must use local timezone formatting')
requireText(css, '.dv2-wizard-context', 'wizard derived context summary')

for (const text of ['productId: string', 'reviewOptions: ReviewType[]', 'switchRole(role: ClinicRole)', 'uploadOrderFiles(orderId: string, files: File[])', 'markThreadRead(threadId: string)', 'updatePatient(input: PatientUpdateInput)']) requireText(contracts, text, 'doctor gateway contract')
for (const text of [
  'X-Clinic-Role',
  'product_id: input.productId',
  'review_options: input.reviewOptions',
  '/files/multipart/initiate',
  '/files/multipart/pending',
  '/multipart/status',
  'resumePendingOrderUpload',
  'failedDesignActionIndex',
  'DoctorReviewSubmittedRefreshError',
  '订单设计确认状态加载失败',
  'assertSafeOrderPayload',
  "if (key === 'process_reviews') return false",
  'isHiddenDoctorFormKey(key)',
  'unsafeDoctorContent',
  'const logisticsCandidates = legacyOrders.filter',
  '`/orders/${order.order_id}/logistics`',
  "['SHIPPED', 'DELIVERED_PENDING_CONFIRMATION'].includes(status)",
  'logistics,',
  '`/orders/${encodeURIComponent(orderId)}/confirm-receipt`'
]) requireText(httpGateway, text, 'http doctor gateway')
rejectText(httpGateway, /确认收货.*暂未接入/, 'doctor receipt must use real API')
for (const text of ['isDoctorReviewSubmittedRefreshError', 'usedSubmittedFallback', '页面已保留提交结果']) requireText(portal, text, 'doctor review reconciliation')
for (const text of ['orders.unshift(created)', 'details.set(created.order_id, detail)', 'async switchRole', 'async uploadOrderFiles', 'async createPatient', 'async updatePatient', 'hasPendingReview']) requireText(mockGateway, text, 'mock doctor closed loops')

rejectText(portal, /(internal_status|work_log|worker_user_id|responsibility_type|performance_score)/, 'doctor rendered internal fields')

if (failures.length) {
  console.error('doctor portal v2 check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('doctor portal v2 check ok')
