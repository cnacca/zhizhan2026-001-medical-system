<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { createDoctorGateway, resolveDoctorGatewayMode } from './services/doctorGateway'
import DoctorDynamicFields from './DoctorDynamicFields.vue'
import type {
  ClinicRole,
  DoctorFile,
  DoctorPage,
  DoctorPortalDataset,
  LogisticsRecord,
  MessageThread,
  Money,
  OrderDetail,
  OrderDraftInput,
  OrderReview,
  OrderSummary,
  PatientDetail,
  PatientSummary,
  ProductOption,
  ReviewType
} from './types/contracts'

const StlViewerDialog = defineAsyncComponent(() => import('../components/StlViewerDialog.vue'))

type CurrentUser = {
  username?: string
  userId?: number | null
  clinicId?: number | null
  roles?: string[]
  permissions?: string[]
  dataScope?: string | null
}

const props = defineProps<{
  token: string
  currentUser: CurrentUser | null
}>()

const emit = defineEmits<{
  logout: []
}>()

const pageMeta: Record<DoctorPage, { title: string; description: string }> = {
  dashboard: { title: '工作台', description: '查看待处理订单、公开进度与近期业务概览' },
  orders: { title: '订单管理', description: '管理订单资料、外部状态与当前待办' },
  assistant: { title: '订单助手', description: '查询当前权限范围内的订单公开信息' },
  patients: { title: '患者管理', description: '维护患者档案并关联历史订单' },
  billing: { title: '账单与物流', description: '查看结算、发票退款与物流收货信息' },
  account: { title: '账户设置', description: '管理账户、诊所成员、通知偏好与安全设置' },
  messages: { title: '消息中心', description: '按订单集中处理沟通与确认事项' }
}

const roleLabels: Record<ClinicRole, string> = {
  CLINIC_ADMIN: '诊所管理员',
  DOCTOR: '医生',
  RECEPTION: '前台',
  NURSE: '护士'
}

const reviewLabels: Record<ReviewType, string> = {
  CAD_DESIGN: '设计稿确认',
  POST_MILLING_PHOTOS: '切削后照片确认',
  POST_GLAZING_PHOTOS: '上釉后照片确认'
}

const productTypeLabels: Record<string, string> = {
  FIXED_CROWN: '固定修复',
  FIXED_BRIDGE: '固定桥修复',
  IMPLANT_RESTORATION: '种植修复',
  REMOVABLE_DENTURE: '活动修复',
  ORTHODONTIC: '正畸产品'
}

const statusLabels: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  UNDER_REVIEW: '资料审核中',
  NEEDS_INFO: '待补充资料',
  IN_PRODUCTION: '制作中',
  PRODUCTION_COMPLETED: '制作完成',
  READY_TO_DISPATCH: '待发货',
  SHIPPED: '已发货',
  DELIVERED_PENDING_CONFIRMATION: '已送达待确认',
  COMPLETED: '已完成',
  AWAITING_PAYMENT: '待付款',
  DESIGN_REVIEW_REQUIRED: '设计稿待确认',
  POST_MILLING_REVIEW_REQUIRED: '照片待确认',
  SUPPLEMENT_REQUIRED: '补充资料',
  PAYMENT_REQUIRED: '完成付款',
  RECEIPT_CONFIRMATION_REQUIRED: '确认收货',
  NONE: '无需操作',
  PAID: '已支付',
  UNPAID: '未支付',
  ISSUED: '已出账',
  OPEN: '待结清',
  SETTLED: '已结清',
  PENDING_REVIEW: '待确认',
  PENDING: '待确认',
  IN_TRANSIT: '运输中',
  ACTIVE: '正常',
  PENDING_ACTIVATION: '待激活',
  DISABLED: '已停用',
  APPROVED: '已同意',
  REJECTED: '已驳回',
  SUPERSEDED: '已被新版本替代',
  REVISION_REQUESTED: '待修改',
  REVISING: '修改中',
  WAITING: '等待提交',
  NOT_REQUESTED: '未启用'
}

const categoryLabels: Record<string, string> = {
  ORDER: '订单', REVIEW: '确认', MESSAGE: '消息', BILLING: '账单', LOGISTICS: '物流', SYSTEM: '系统'
}

const activePage = ref<DoctorPage>('dashboard')
const loading = ref(true)
const loadError = ref('')
const dataset = ref<DoctorPortalDataset | null>(null)
const gateway = createDoctorGateway({
  token: props.token,
  displayName: props.currentUser?.username || '医生',
  clinicName: '当前诊所'
})
const dataMode = resolveDoctorGatewayMode()

const activeRole = ref<ClinicRole>('DOCTOR')
const roleMenuOpen = ref(false)
const availableRoles = ref<ClinicRole[]>(['DOCTOR'])
const globalKeyword = ref('')
const globalSearchOpen = ref(false)
const notificationOpen = ref(false)
const notificationKeyword = ref('')
const notificationFilter = ref<'ALL' | 'UNREAD' | 'READ'>('ALL')

const orderKeyword = ref('')
const orderStatus = ref('ALL')
const orderProduct = ref('ALL')
const orderQuick = ref('ALL')
const orderPage = ref(1)
const selectedOrderIds = ref<string[]>([])
const orderDrawerOpen = ref(false)
const orderDrawerTab = ref<'overview' | 'files' | 'reviews'>('overview')
const selectedOrder = ref<OrderDetail | null>(null)
const orderDetailLoading = ref(false)

const patientKeyword = ref('')
const wizardPatientKeyword = ref('')
const patientDrawerOpen = ref(false)
const patientDrawerTab = ref<'basic' | 'orders' | 'history'>('basic')
const selectedPatient = ref<PatientDetail | null>(null)
const patientLoading = ref(false)
const patientDialogOpen = ref(false)
const newPatient = reactive({ name: '', age: '', gender: '', oralDescription: '', tags: '' })

const billingTab = ref<'perOrder' | 'monthly' | 'invoiceRefund' | 'logistics'>('perOrder')
const logisticsDrawerOpen = ref(false)
const selectedLogistics = ref<LogisticsRecord | null>(null)

const messageKeyword = ref('')
const messageFilter = ref<'ALL' | 'UNREAD' | 'READ'>('ALL')
const activeThreadId = ref('')
const messageDraft = ref('')
const sendingMessage = ref(false)
const rejectDialogOpen = ref(false)
const rejectReason = ref('')
const reviewTarget = ref<{ orderId: string; review: OrderReview } | null>(null)

const assistantQuestion = ref('')
const assistantLoading = ref(false)
const assistantMessages = ref<Array<{ role: 'SELF' | 'ASSISTANT'; content: string; orderIds?: string[] }>>([
  { role: 'ASSISTANT', content: '您好，我可以帮您查询订单公开进度、待办、账单与物流信息。' }
])

const accountTab = ref<'profile' | 'members' | 'notifications' | 'security'>('profile')
const memberDialogOpen = ref(false)
const newMember = reactive({ displayName: '', email: '', role: 'DOCTOR' as ClinicRole, billing: 'VIEW', logistics: 'VIEW' })
const passwordForm = reactive({ current: '', next: '', confirm: '' })

const wizardOpen = ref(false)
const wizardStep = ref(1)
const wizardSaving = ref(false)
const wizardSubmitting = ref(false)
const wizardUploading = ref(false)
const wizardNotice = ref('')
const wizard = reactive<OrderDraftInput>({
  patientId: '',
  productId: '',
  productType: '',
  caseFields: { tooth: '', case_note: '' },
  dynamicFields: {},
  reviewOptions: [],
  files: []
})

const viewerOpen = ref(false)
const viewerFile = ref<DoctorFile | null>(null)
const filePreviewOpen = ref(false)
const filePreview = ref<DoctorFile | null>(null)

const navGroups = computed(() => [
  {
    label: '工作区',
    items: [
      { page: 'dashboard' as DoctorPage, label: '工作台', icon: '▦' },
      { page: 'orders' as DoctorPage, label: '订单管理', icon: '▤' },
      ...(activeRole.value === 'DOCTOR' ? [{ page: 'assistant' as DoctorPage, label: '订单助手', icon: '✦' }] : []),
      { page: 'patients' as DoctorPage, label: '患者管理', icon: '♙' },
      { page: 'billing' as DoctorPage, label: '账单与物流', icon: '▧' }
    ]
  },
  {
    label: '账户',
    items: [
      { page: 'account' as DoctorPage, label: '账户设置', icon: '⚙' },
      { page: 'messages' as DoctorPage, label: '消息中心', icon: '◇' }
    ]
  }
])

const currentMeta = computed(() => pageMeta[activePage.value])
const account = computed(() => dataset.value?.account)
const unreadCount = computed(() => dataset.value?.notifications.filter((item) => !item.read).length ?? 0)
const canCreateOrder = computed(() => activeRole.value === 'DOCTOR')
const canManageMembers = computed(() => activeRole.value === 'CLINIC_ADMIN')
const canReview = computed(() => activeRole.value === 'DOCTOR')

const orderRows = computed(() => {
  const keyword = orderKeyword.value.trim().toLowerCase()
  return (dataset.value?.orders ?? []).filter((order) => {
    const matchesKeyword = !keyword || [order.order_no, order.doctor_name, order.patient_name, order.patient_code, order.clinic_name, order.product_name, ...order.tags].join(' ').toLowerCase().includes(keyword)
    const matchesStatus = orderStatus.value === 'ALL' || order.external_status === orderStatus.value
    const matchesProduct = orderProduct.value === 'ALL' || order.product_type === orderProduct.value
    const matchesQuick = orderQuick.value === 'ALL'
      || (orderQuick.value === 'TODO' && order.current_action !== 'NONE')
      || (orderQuick.value === 'DUE' && isDueSoon(order))
      || (orderQuick.value === 'DRAFT' && order.external_status === 'DRAFT')
    return matchesKeyword && matchesStatus && matchesProduct && matchesQuick
  })
})

const orderPageSize = 6
const pagedOrders = computed(() => orderRows.value.slice((orderPage.value - 1) * orderPageSize, orderPage.value * orderPageSize))

const patientRows = computed(() => {
  const keyword = patientKeyword.value.trim().toLowerCase()
  return (dataset.value?.patients ?? []).filter((patient) => !keyword || [patient.patient_name, patient.patient_code, patient.doctor_name, patient.oral_description, ...patient.tags].join(' ').toLowerCase().includes(keyword))
})

const filteredThreads = computed(() => {
  const keyword = messageKeyword.value.trim().toLowerCase()
  return (dataset.value?.threads ?? []).filter((thread) => {
    const matchesRead = messageFilter.value === 'ALL' || (messageFilter.value === 'UNREAD' ? thread.unread : !thread.unread)
    const matchesKeyword = !keyword || [thread.order_no, thread.patient_name, thread.product_name, thread.latest_message, ...thread.messages.map((message) => message.content)].join(' ').toLowerCase().includes(keyword)
    return matchesRead && matchesKeyword
  })
})

const activeThread = computed<MessageThread | null>(() => {
  return filteredThreads.value.find((thread) => thread.thread_id === activeThreadId.value) ?? filteredThreads.value[0] ?? null
})

const filteredNotifications = computed(() => {
  const keyword = notificationKeyword.value.trim().toLowerCase()
  return (dataset.value?.notifications ?? []).filter((item) => {
    const matchesRead = notificationFilter.value === 'ALL' || (notificationFilter.value === 'UNREAD' ? !item.read : item.read)
    return matchesRead && (!keyword || `${item.title} ${item.summary}`.toLowerCase().includes(keyword))
  })
})

const globalResults = computed(() => {
  const keyword = globalKeyword.value.trim().toLowerCase()
  if (!keyword) return { orders: [] as OrderSummary[], patients: [] as PatientSummary[] }
  return {
    orders: (dataset.value?.orders ?? []).filter((item) => [item.order_no, item.patient_name, item.patient_code, item.product_name].join(' ').toLowerCase().includes(keyword)).slice(0, 6),
    patients: (dataset.value?.patients ?? []).filter((item) => [item.patient_name, item.patient_code, item.doctor_name].join(' ').toLowerCase().includes(keyword)).slice(0, 6)
  }
})

const selectedProduct = computed<ProductOption | null>(() => dataset.value?.products.find((item) => item.product_id === wizard.productId) ?? null)
const selectedWizardPatient = computed(() => dataset.value?.patients.find((item) => item.patient_id === wizard.patientId) ?? null)
const wizardPatientRows = computed(() => {
  const keyword = wizardPatientKeyword.value.trim().toLowerCase()
  return (dataset.value?.patients ?? []).filter((patient) => !keyword || [patient.patient_name, patient.patient_code, patient.doctor_name, ...patient.tags].join(' ').toLowerCase().includes(keyword))
})
const selectedProductFields = computed(() => selectedProduct.value?.form_fields ?? [])
const selectedProductReviewOptions = computed(() => selectedProduct.value?.review_capabilities ?? [])
const wizardStlCount = computed(() => wizard.files.filter((candidate) => candidate.kind === 'STL').length)
const wizardReviewSummary = computed(() => wizard.reviewOptions.length ? wizard.reviewOptions.map((candidate) => reviewLabel(candidate)).join('、') : '不启用额外确认')
const clinicRoleOptions = computed(() => (Object.entries(roleLabels) as Array<[ClinicRole, string]>).map(([value, name]) => ({ value, name })))
const filePreviewName = computed(() => filePreview.value?.name ?? '')
const pendingTaskOrders = computed(() => (dataset.value?.orders ?? []).filter((item) => item.current_action !== 'NONE').slice(0, 5))
const dashboardToday = computed(() => new Date().toLocaleDateString('sv-SE'))
const dashboardStats = computed(() => {
  const items = dataset.value?.orders ?? []
  return [
    { key: 'today', label: '今日订单', value: items.filter((item) => item.created_at.startsWith(dashboardToday.value)).length, note: '今日提交与草稿', tone: 'blue', icon: '▤' },
    { key: 'production', label: '制作中', value: items.filter((item) => item.external_status === 'IN_PRODUCTION').length, note: '公开进度更新', tone: 'indigo', icon: '◉' },
    { key: 'delivery', label: '即将送达', value: items.filter((item) => ['SHIPPED', 'DELIVERED_PENDING_CONFIRMATION'].includes(item.external_status)).length, note: '配送与收货', tone: 'amber', icon: '⌁' },
    { key: 'reply', label: '待回复', value: dataset.value?.threads.filter((item) => item.unread).length ?? 0, note: '消息与沟通', tone: 'rose', icon: '◇' },
    { key: 'review', label: '设计待确认', value: items.filter((item) => item.current_action.includes('REVIEW')).length, note: '确认后继续制作', tone: 'violet', icon: '✓' },
    { key: 'due', label: '到期提醒', value: items.filter((item) => isDueSoon(item)).length, note: '预计日期临近', tone: 'orange', icon: '!' }
  ]
})
const dashboardUpcomingOrders = computed(() => (dataset.value?.orders ?? [])
  .filter((item) => item.due_at !== '-' && item.external_status !== 'COMPLETED')
  .sort((left, right) => left.due_at.localeCompare(right.due_at))
  .slice(0, 3))
const dashboardWeeklyCounts = computed(() => {
  const counts = [0, 0, 0, 0, 0, 0]
  const today = new Date(`${dashboardToday.value}T12:00:00`)
  for (const order of dataset.value?.orders ?? []) {
    const created = new Date(order.created_at.replace(' ', 'T'))
    if (Number.isNaN(created.getTime())) continue
    const weeksAgo = Math.floor((today.getTime() - created.getTime()) / 604800000)
    const bucket = 5 - weeksAgo
    if (bucket >= 0 && bucket < counts.length) counts[bucket] += 1
  }
  return counts
})
const dashboardTrendPoints = computed(() => {
  return dashboardWeeklyCounts.value.map((value, index) => `${24 + index * 103},${104 - Math.round(value / dashboardTrendMax.value * 72)}`).join(' ')
})
const dashboardTrendMax = computed(() => Math.max(1, ...dashboardWeeklyCounts.value))

function money(value: Money | null | undefined): string {
  if (!value) return '价格待确认'
  const symbol = value.currency === 'CNY' ? '¥' : `${value.currency} `
  return `${symbol}${(value.amount_minor / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
}

function label(value: string | null | undefined): string {
  if (!value) return '-'
  return statusLabels[value] ?? (/^[A-Z][A-Z0-9_]+$/.test(value) ? '处理中' : value)
}

function reviewLabel(value: ReviewType): string {
  return reviewLabels[value]
}

function productTypeLabel(value: string): string {
  return productTypeLabels[value] ?? '定制修复'
}

function isDueSoon(order: OrderSummary): boolean {
  if (!order.due_at || order.due_at === '-' || order.external_status === 'COMPLETED') return false
  const due = new Date(`${order.due_at.slice(0, 10)}T23:59:59`)
  const today = new Date(`${new Date().toLocaleDateString('sv-SE')}T00:00:00`)
  const difference = due.getTime() - today.getTime()
  return difference >= 0 && difference <= 3 * 86400000
}

function statusTone(value: string): string {
  if (['COMPLETED', 'PAID', 'SETTLED', 'APPROVED', 'ACTIVE'].includes(value)) return 'success'
  if (['NEEDS_INFO', 'AWAITING_PAYMENT', 'DELIVERED_PENDING_CONFIRMATION', 'PENDING_REVIEW', 'REVISION_REQUESTED', 'UNPAID'].includes(value)) return 'warning'
  if (['IN_PRODUCTION', 'SHIPPED', 'IN_TRANSIT', 'SUBMITTED', 'UNDER_REVIEW'].includes(value)) return 'primary'
  return 'neutral'
}

function switchPage(page: DoctorPage) {
  activePage.value = page
  globalSearchOpen.value = false
  roleMenuOpen.value = false
  if (page === 'messages' && activeThread.value) activeThreadId.value = activeThread.value.thread_id
}

async function loadPortal() {
  loading.value = true
  loadError.value = ''
  try {
    dataset.value = await gateway.loadDataset()
    activeThreadId.value = dataset.value.threads[0]?.thread_id ?? ''
    const ownMember = dataset.value.account.members.find((member) => member.email === dataset.value?.account.email)
      ?? dataset.value.account.members[0]
    if (ownMember?.roles.length) {
      availableRoles.value = ownMember.roles
      if (!ownMember.roles.includes(activeRole.value)) activeRole.value = ownMember.roles[0]
    } else {
      const backendRoles = (props.currentUser?.roles ?? []).filter((role): role is ClinicRole => ['CLINIC_ADMIN', 'DOCTOR', 'RECEPTION', 'NURSE'].includes(role))
      availableRoles.value = backendRoles.length ? backendRoles : ['DOCTOR']
      activeRole.value = availableRoles.value[0]
    }
  } catch (cause) {
    loadError.value = cause instanceof Error ? cause.message : '医生端数据加载失败'
  } finally {
    loading.value = false
  }
}

async function chooseRole(role: ClinicRole) {
  if (role === activeRole.value) {
    roleMenuOpen.value = false
    return
  }
  const previousRole = activeRole.value
  activeRole.value = role
  roleMenuOpen.value = false
  if (role !== 'DOCTOR' && activePage.value === 'assistant') activePage.value = 'dashboard'
  loading.value = true
  try {
    dataset.value = await gateway.switchRole(role)
    activeThreadId.value = dataset.value.threads[0]?.thread_id ?? ''
    selectedOrderIds.value = []
    ElMessage.success(`已切换为${roleLabels[role]}身份，权限与数据范围已重新加载`)
  } catch (cause) {
    activeRole.value = previousRole
    ElMessage.error(cause instanceof Error ? cause.message : '身份切换失败')
  } finally {
    loading.value = false
  }
}

async function openOrder(orderId: string, tab: 'overview' | 'files' | 'reviews' = 'overview') {
  orderDrawerOpen.value = true
  orderDrawerTab.value = tab
  orderDetailLoading.value = true
  selectedOrder.value = null
  try {
    selectedOrder.value = await gateway.loadOrderDetail(orderId)
  } catch (cause) {
    ElMessage.error(cause instanceof Error ? cause.message : '订单详情加载失败')
  } finally {
    orderDetailLoading.value = false
  }
}

async function openPatient(patientId: string) {
  patientDrawerOpen.value = true
  patientDrawerTab.value = 'basic'
  patientLoading.value = true
  selectedPatient.value = null
  try {
    selectedPatient.value = await gateway.loadPatientDetail(patientId)
  } catch (cause) {
    ElMessage.error(cause instanceof Error ? cause.message : '患者档案加载失败')
  } finally {
    patientLoading.value = false
  }
}

function openNotification(itemId: string) {
  const item = dataset.value?.notifications.find((notification) => notification.notification_id === itemId)
  if (!item) return
  if (!item.read) {
    item.read = true
    void gateway.markNotificationRead(item.notification_id).catch(() => { item.read = false })
  }
  notificationOpen.value = false
  if (item.target_type === 'ORDER' && item.target_id) {
    switchPage('orders')
    void openOrder(item.target_id, item.category === 'REVIEW' ? 'reviews' : 'overview')
  } else if (item.target_type === 'MESSAGE') {
    activeThreadId.value = item.target_id ?? ''
    switchPage('messages')
  } else if (item.target_type === 'BILLING') {
    switchPage('billing')
  }
}

async function markAllNotifications() {
  if (!dataset.value) return
  const before = dataset.value.notifications.map((item) => item.read)
  dataset.value.notifications.forEach((item) => { item.read = true })
  try {
    await gateway.markAllNotificationsRead()
    ElMessage.success('全部通知已标记为已读')
  } catch (cause) {
    dataset.value.notifications.forEach((item, index) => { item.read = before[index] })
    ElMessage.error(cause instanceof Error ? cause.message : '操作失败')
  }
}

function toggleOrderSelection(orderId: string, checked: boolean) {
  selectedOrderIds.value = checked
    ? Array.from(new Set([...selectedOrderIds.value, orderId]))
    : selectedOrderIds.value.filter((id) => id !== orderId)
}

function togglePageSelection(checked: boolean) {
  const pageIds = pagedOrders.value.map((item) => item.order_id)
  selectedOrderIds.value = checked
    ? Array.from(new Set([...selectedOrderIds.value, ...pageIds]))
    : selectedOrderIds.value.filter((id) => !pageIds.includes(id))
}

function exportOrders() {
  const targets = selectedOrderIds.value.length
    ? orderRows.value.filter((item) => selectedOrderIds.value.includes(item.order_id))
    : orderRows.value
  const lines = [
    ['订单号', '医生', '患者', '诊所', '产品', '标签', '公开状态', '当前操作', '创建时间', '到期时间', '金额'],
    ...targets.map((item) => [item.order_no, item.doctor_name, item.patient_name, item.clinic_name, item.product_name, item.tags.join('|'), label(item.external_status), label(item.current_action), item.created_at, item.due_at, money(item.quote)])
  ]
  const csv = `\uFEFF${lines.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')}`
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = '医生端订单.csv'
  anchor.click()
  URL.revokeObjectURL(url)
  ElMessage.success(`已导出 ${targets.length} 条订单`)
}

function openWizard() {
  if (!canCreateOrder.value) return
  Object.assign(wizard, {
    draftOrderId: undefined,
    patientId: '',
    productId: '',
    productType: '',
    caseFields: { tooth: '', case_note: '' },
    dynamicFields: {},
    reviewOptions: [],
    files: []
  })
  wizardStep.value = 1
  wizardPatientKeyword.value = ''
  wizardNotice.value = ''
  wizardOpen.value = true
}

function wizardMissingForStep(step: number): string[] {
  const missing: string[] = []
  if (step >= 1) {
    if (!wizard.patientId) missing.push('患者')
    if (!wizard.productId) missing.push('产品')
  }
  if (step >= 2 && !wizard.caseFields.tooth?.trim()) missing.push('牙位')
  if (step >= 3 && selectedProduct.value) {
    selectedProduct.value.form_fields.filter((field) => field.required).forEach((field) => {
      if (!wizard.dynamicFields[field.key]?.trim()) missing.push(field.label)
    })
  }
  if (step >= 4 && !wizard.files.some((item) => item.kind === 'STL' && item.status === 'READY')) missing.push('STL 扫描文件')
  return missing
}

async function saveWizardDraft(silent = false) {
  if (!wizard.patientId || !wizard.productId) {
    if (!silent) ElMessage.warning('选择患者和产品后才能保存草稿')
    return false
  }
  wizardSaving.value = true
  try {
    const result = await gateway.saveDraft({ ...wizard, files: [...wizard.files], reviewOptions: [...wizard.reviewOptions] })
    wizard.draftOrderId = result.orderId
    wizardNotice.value = `草稿已保存 · ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
    if (!silent) ElMessage.success('草稿已保存')
    return true
  } catch (cause) {
    ElMessage.error(cause instanceof Error ? cause.message : '草稿保存失败')
    return false
  } finally {
    wizardSaving.value = false
  }
}

async function nextWizardStep() {
  const missing = wizardMissingForStep(wizardStep.value)
  if (missing.length) {
    ElMessage.warning(`请先补充：${missing.join('、')}`)
    return
  }
  const saved = await saveWizardDraft(true)
  if (!saved) return
  wizardStep.value = Math.min(6, wizardStep.value + 1)
}

async function addWizardFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const list = Array.from(input.files ?? [])
  const accepted = list.filter((item) => /\.(stl|jpg|jpeg|png|pdf)$/i.test(item.name))
  const rejected = list.length - accepted.length
  if (rejected) ElMessage.warning(`${rejected} 个文件格式不支持`)
  input.value = ''
  if (!accepted.length) return
  if (!wizard.draftOrderId) {
    const saved = await saveWizardDraft(true)
    if (!saved || !wizard.draftOrderId) return
  }
  wizardUploading.value = true
  try {
    const uploaded = await gateway.uploadOrderFiles(wizard.draftOrderId, accepted)
    wizard.files.push(...uploaded)
    ElMessage.success(`${uploaded.length} 个文件已就绪`)
  } catch (cause) {
    ElMessage.error(cause instanceof Error ? cause.message : '文件上传失败')
  } finally {
    wizardUploading.value = false
  }
}

function toggleReviewOption(type: ReviewType, checked: boolean) {
  wizard.reviewOptions = checked
    ? Array.from(new Set([...wizard.reviewOptions, type]))
    : wizard.reviewOptions.filter((item) => item !== type)
}

async function submitWizard() {
  const missing = wizardMissingForStep(4)
  if (missing.length) {
    wizardNotice.value = `提交前还需补充：${missing.join('、')}`
    ElMessage.warning(wizardNotice.value)
    return
  }
  wizardSubmitting.value = true
  try {
    const created = await gateway.submitOrder({ ...wizard, files: [...wizard.files], reviewOptions: [...wizard.reviewOptions] })
    try {
      dataset.value = await gateway.loadDataset()
      activeThreadId.value = dataset.value.threads[0]?.thread_id ?? activeThreadId.value
    } catch {
      if (dataset.value && !dataset.value.orders.some((item) => item.order_id === created.order_id)) dataset.value.orders.unshift(created)
    }
    wizardOpen.value = false
    switchPage('orders')
    ElMessage.success(`订单 ${created.order_no} 已提交`)
  } catch (cause) {
    ElMessage.error(cause instanceof Error ? cause.message : '订单提交失败')
  } finally {
    wizardSubmitting.value = false
  }
}

function chooseThread(threadId: string) {
  activeThreadId.value = threadId
  const thread = dataset.value?.threads.find((item) => item.thread_id === threadId)
  if (thread?.unread) {
    thread.unread = false
    void gateway.markThreadRead(threadId).catch(() => undefined)
  }
}

async function sendMessage() {
  const content = messageDraft.value.trim()
  const thread = activeThread.value
  if (!content || !thread) return
  sendingMessage.value = true
  try {
    const item = await gateway.sendMessage(thread.thread_id, content)
    if (!thread.messages.some((message) => message.message_id === item.message_id)) thread.messages.push(item)
    thread.latest_message = content
    thread.latest_at = '刚刚'
    messageDraft.value = ''
  } catch (cause) {
    ElMessage.error(cause instanceof Error ? cause.message : '消息发送失败')
  } finally {
    sendingMessage.value = false
  }
}

function startReviewDecision(orderId: string, review: OrderReview, decision: 'APPROVE' | 'REJECT') {
  const action = decision === 'APPROVE' ? 'APPROVE_REVIEW' : 'REJECT_REVIEW'
  if (!canReview.value || review.status !== 'PENDING_REVIEW' || !review.allowed_actions.includes(action)) return
  reviewTarget.value = { orderId, review }
  if (decision === 'REJECT') {
    rejectReason.value = ''
    rejectDialogOpen.value = true
    return
  }
  void ElMessageBox.confirm('同意后，对方将按当前版本继续后续制作。请确认已完成检查。', '确认同意当前版本', {
    confirmButtonText: '确认同意', cancelButtonText: '再检查一下', type: 'warning'
  }).then(() => submitReviewDecision('APPROVE')).catch(() => undefined)
}

async function submitReviewDecision(decision: 'APPROVE' | 'REJECT') {
  const target = reviewTarget.value
  if (!target) return
  if (decision === 'REJECT' && !rejectReason.value.trim()) {
    ElMessage.warning('驳回时必须填写修改意见')
    return
  }
  try {
    const updated = await gateway.submitReview({
      orderId: target.orderId,
      reviewId: target.review.review_id,
      decision,
      comment: decision === 'REJECT' ? rejectReason.value.trim() : undefined,
      stateVersion: target.review.state_version,
      idempotencyKey: crypto.randomUUID()
    })
    Object.assign(target.review, updated)
    dataset.value?.threads.forEach((thread) => thread.messages.forEach((message) => {
      if (message.review?.review_id === updated.review_id) Object.assign(message.review, updated)
    }))
    if (selectedOrder.value) {
      const orderReview = selectedOrder.value.reviews.find((item) => item.review_id === updated.review_id)
      if (orderReview) Object.assign(orderReview, updated)
      if (!selectedOrder.value.reviews.some((item) => item.status === 'PENDING_REVIEW') && selectedOrder.value.current_action.includes('REVIEW')) selectedOrder.value.current_action = 'NONE'
    }
    const summary = dataset.value?.orders.find((order) => order.order_id === target.orderId)
    if (summary?.current_action.includes('REVIEW') && (!selectedOrder.value || !selectedOrder.value.reviews.some((item) => item.status === 'PENDING_REVIEW'))) summary.current_action = 'NONE'
    rejectDialogOpen.value = false
    ElMessage.success(decision === 'APPROVE' ? '已同意当前版本，对方可以继续制作' : '已驳回并发送修改意见')
  } catch (cause) {
    ElMessage.error(cause instanceof Error ? cause.message : '确认操作失败')
  }
}

function previewFile(item: DoctorFile) {
  if (item.kind === 'STL') {
    viewerFile.value = item
    if (item.preview_url) viewerOpen.value = true
    else {
      filePreview.value = item
      filePreviewOpen.value = true
    }
  } else {
    filePreview.value = item
    filePreviewOpen.value = true
  }
}

async function askAssistant() {
  const question = assistantQuestion.value.trim()
  if (!question) return
  assistantMessages.value.push({ role: 'SELF', content: question })
  assistantQuestion.value = ''
  assistantLoading.value = true
  try {
    const contextOrder = (dataset.value?.orders ?? []).find((order) => question.includes(order.order_no) || question.includes(order.patient_code))
      ?? (dataset.value?.orders ?? []).find((order) => order.external_status !== 'DRAFT')
    const response = await gateway.askAssistant(question, contextOrder?.order_id)
    assistantMessages.value.push({ role: 'ASSISTANT', content: response.answer, orderIds: response.orderIds })
  } catch (cause) {
    assistantMessages.value.push({ role: 'ASSISTANT', content: cause instanceof Error ? cause.message : '查询暂时不可用' })
  } finally {
    assistantLoading.value = false
  }
}

async function createPatient() {
  if (!dataset.value || !newPatient.name.trim()) {
    ElMessage.warning('请填写患者姓名')
    return
  }
  try {
    const item = await gateway.createPatient({
      patientName: newPatient.name.trim(),
      patientAge: newPatient.age ? Number(newPatient.age) : null,
      patientGender: newPatient.gender || null,
      oralDescription: newPatient.oralDescription.trim(),
      tags: newPatient.tags.split(/[,，]/).map((candidate) => candidate.trim()).filter(Boolean)
    })
    dataset.value.patients.unshift(item)
    Object.assign(newPatient, { name: '', age: '', gender: '', oralDescription: '', tags: '' })
    patientDialogOpen.value = false
    ElMessage.success('患者已保存')
  } catch (cause) {
    ElMessage.error(cause instanceof Error ? cause.message : '患者保存失败')
  }
}

function addMember() {
  if (!dataset.value || !newMember.displayName.trim() || !newMember.email.trim()) {
    ElMessage.warning('请填写成员姓名和邮箱')
    return
  }
  dataset.value.account.members.push({
    member_id: `LOCAL-M-${Date.now()}`,
    display_name: newMember.displayName.trim(),
    email: newMember.email.trim(),
    roles: [newMember.role],
    status: 'PENDING_ACTIVATION',
    billing_permission: newMember.billing as 'NONE' | 'VIEW' | 'FINANCIAL_ACTION',
    logistics_permission: newMember.logistics as 'NONE' | 'VIEW' | 'RECEIPT'
  })
  memberDialogOpen.value = false
  Object.assign(newMember, { displayName: '', email: '', role: 'DOCTOR', billing: 'VIEW', logistics: 'VIEW' })
  ElMessage.success('邀请已加入前端状态，待成员接口接入后发送')
}

function saveProfile() {
  ElMessage.success(dataMode === 'mock' ? '设置已保存' : '资料保存接口将在后端补齐后启用')
}

function updatePassword() {
  if (!passwordForm.current || passwordForm.next.length < 8 || passwordForm.next !== passwordForm.confirm) {
    ElMessage.warning('请检查当前密码、新密码长度和两次输入是否一致')
    return
  }
  Object.assign(passwordForm, { current: '', next: '', confirm: '' })
  ElMessage.success('安全设置前端校验已通过，待后端接口接入')
}

function openLogistics(item: LogisticsRecord) {
  selectedLogistics.value = item
  logisticsDrawerOpen.value = true
}

async function confirmReceipt(item: LogisticsRecord) {
  try {
    await ElMessageBox.confirm('请确认产品已由诊所实际收取。确认后订单将完成。', '确认收货', {
      confirmButtonText: '确认已收货', cancelButtonText: '取消', type: 'warning'
    })
    const order = dataset.value?.orders.find((candidate) => candidate.order_id === item.order_id)
    await gateway.confirmReceipt(item.order_id, order?.state_version ?? 0)
    item.can_confirm_receipt = false
    item.status = 'COMPLETED'
    if (order) {
      order.external_status = 'COMPLETED'
      order.current_action = 'NONE'
    }
    ElMessage.success('已确认收货，订单已完成')
  } catch (cause) {
    if (cause === 'cancel' || cause === 'close') return
    ElMessage.error(cause instanceof Error ? cause.message : '确认收货失败')
  }
}

function openGlobalOrder(orderId: string) {
  globalSearchOpen.value = false
  switchPage('orders')
  void openOrder(orderId)
}

function openGlobalPatient(patientId: string) {
  globalSearchOpen.value = false
  switchPage('patients')
  void openPatient(patientId)
}

function openSelectedOrderConversation() {
  const orderId = selectedOrder.value?.order_id
  if (!orderId || !dataset.value) return
  activeThreadId.value = dataset.value.threads.find((thread) => thread.order_id === orderId)?.thread_id ?? ''
  orderDrawerOpen.value = false
  switchPage('messages')
}

function selectAllNotificationFilter(filter: 'ALL' | 'UNREAD' | 'READ') {
  notificationFilter.value = filter
}

function handleGlobalShortcut(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    globalSearchOpen.value = true
    window.setTimeout(() => document.querySelector<HTMLInputElement>('[data-testid="doctor-global-search"]')?.focus())
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalShortcut)
  void loadPortal()
})
onBeforeUnmount(() => window.removeEventListener('keydown', handleGlobalShortcut))
</script>

<template>
  <div class="dv2-shell" data-testid="doctor-v2-portal">
    <aside class="dv2-sidebar">
      <div class="dv2-brand">
        <span class="dv2-brand-mark">D</span>
        <div><strong>DentalFlow</strong><small>医生工作台</small></div>
      </div>

      <nav class="dv2-nav" aria-label="医生端菜单">
        <section v-for="group in navGroups" :key="group.label">
          <small class="dv2-nav-label">{{ group.label }}</small>
          <button
            v-for="item in group.items"
            :key="item.page"
            type="button"
            class="dv2-nav-item"
            :class="{ active: activePage === item.page }"
            :data-testid="`doctor-nav-${item.page}`"
            @click="switchPage(item.page)"
          >
            <span class="dv2-nav-icon" aria-hidden="true">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
            <i v-if="item.page === 'messages' && (dataset?.threads.filter((thread) => thread.unread).length ?? 0)" class="dv2-nav-count">
              {{ dataset?.threads.filter((thread) => thread.unread).length }}
            </i>
          </button>
        </section>
      </nav>

      <div class="dv2-sidebar-user">
        <span class="dv2-avatar">{{ (account?.display_name || currentUser?.username || '医').slice(0, 1) }}</span>
        <div><strong>{{ account?.display_name || currentUser?.username || '医生' }}</strong><small>{{ roleLabels[activeRole] }}</small></div>
        <button type="button" title="退出登录" aria-label="退出登录" @click="emit('logout')">↗</button>
      </div>
    </aside>

    <section class="dv2-main">
      <header class="dv2-topbar">
        <strong>{{ currentMeta.title }}</strong>
        <div class="dv2-topbar-actions">
          <div class="dv2-global-search" :class="{ focused: globalSearchOpen }">
            <span aria-hidden="true">⌕</span>
            <input
              v-model="globalKeyword"
              type="search"
              placeholder="搜索订单或患者"
              aria-label="全局搜索"
              data-testid="doctor-global-search"
              @focus="globalSearchOpen = true"
              @keyup.esc="globalSearchOpen = false"
            >
            <kbd>⌘ K</kbd>
          </div>

          <div class="dv2-role-switcher">
            <button type="button" data-testid="doctor-role-switcher" @click="roleMenuOpen = !roleMenuOpen">
              <span>{{ roleLabels[activeRole] }}</span><small>{{ account?.clinic_name || '当前诊所' }}</small><i>⌄</i>
            </button>
            <div v-if="roleMenuOpen" class="dv2-floating-menu">
              <small>当前操作身份</small>
              <button v-for="role in availableRoles" :key="role" type="button" :class="{ active: activeRole === role }" @click="chooseRole(role)">
                <span>{{ roleLabels[role] }}</span><i>{{ activeRole === role ? '✓' : '' }}</i>
              </button>
              <p>切换后只使用所选身份的权限，不叠加其他角色权限。</p>
            </div>
          </div>

          <button class="dv2-icon-button" type="button" aria-label="打开通知中心" data-testid="doctor-notification-button" @click="notificationOpen = true">
            🔔<i v-if="unreadCount">{{ unreadCount > 9 ? '9+' : unreadCount }}</i>
          </button>
          <button v-if="canCreateOrder" class="dv2-primary-button" type="button" data-testid="doctor-new-order" @click="openWizard">＋ 新建订单</button>
        </div>
      </header>

      <div v-if="globalSearchOpen" class="dv2-search-backdrop" @mousedown.self="globalSearchOpen = false">
        <section class="dv2-search-popover">
          <header><strong>全局搜索</strong><span>订单与患者</span></header>
          <template v-if="globalKeyword.trim()">
            <div class="dv2-search-group">
              <small>订单</small>
              <button v-for="order in globalResults.orders" :key="order.order_id" type="button" @click="openGlobalOrder(order.order_id)">
                <span><strong>{{ order.order_no }}</strong><small>{{ order.patient_name }} · {{ order.product_name }}</small></span><em>{{ label(order.external_status) }}</em>
              </button>
              <p v-if="!globalResults.orders.length">没有匹配订单</p>
            </div>
            <div class="dv2-search-group">
              <small>患者</small>
              <button v-for="patient in globalResults.patients" :key="patient.patient_id" type="button" @click="openGlobalPatient(patient.patient_id)">
                <span><strong>{{ patient.patient_name }}</strong><small>{{ patient.patient_code }} · {{ patient.order_count }} 个订单</small></span><em>查看档案</em>
              </button>
              <p v-if="!globalResults.patients.length">没有匹配患者</p>
            </div>
          </template>
          <div v-else class="dv2-search-empty">输入订单号、患者姓名或患者编号开始搜索</div>
        </section>
      </div>

      <main class="dv2-content">
        <div class="dv2-page-heading">
          <div><h1>{{ currentMeta.title }}</h1><p>{{ currentMeta.description }}</p></div>
          <span v-if="dataMode === 'mock'" class="dv2-demo-chip">二期前端预览</span>
        </div>

        <div v-if="loading" class="dv2-loading-card"><span class="dv2-spinner" />正在加载医生端数据…</div>
        <div v-else-if="loadError" class="dv2-error-card"><strong>页面数据暂时不可用</strong><p>{{ loadError }}</p><button type="button" @click="loadPortal">重新加载</button></div>

        <template v-else-if="dataset">
          <section v-if="activePage === 'dashboard'" class="dv2-dashboard" data-testid="doctor-page-dashboard">
            <section class="dv2-dashboard-welcome">
              <div><small>医生工作台</small><h2>早上好，{{ account?.display_name || '医生' }}</h2><p>今日订单、确认事项、沟通消息和交付提醒集中在这里。</p></div>
              <button type="button" class="dv2-primary-button" @click="switchPage('orders')">进入订单管理</button>
            </section>

            <div class="dv2-metric-grid is-six">
              <article v-for="item in dashboardStats" :key="item.key" :class="`is-${item.tone}`">
                <span class="dv2-metric-icon">{{ item.icon }}</span><div><small>{{ item.label }}</small><strong>{{ item.value }}</strong><p>{{ item.note }}</p></div>
              </article>
            </div>

            <div class="dv2-dashboard-grid is-balanced">
              <section class="dv2-card dv2-task-card">
                <header><div><h2>需要处理</h2><p>优先处理会阻塞订单继续推进的事项</p></div><button type="button" @click="switchPage('orders')">{{ pendingTaskOrders.length }} 项 · 查看全部 →</button></header>
                <button v-for="order in pendingTaskOrders.slice(0, 3)" :key="order.order_id" type="button" class="dv2-task-row" @click="openOrder(order.order_id, order.current_action.includes('REVIEW') ? 'reviews' : 'overview')">
                  <span :class="`dv2-dot is-${statusTone(order.external_status)}`" />
                  <div><strong>{{ label(order.current_action) }}</strong><small>{{ order.order_no }} · {{ order.patient_name }} · {{ order.product_name }}</small></div>
                  <time>{{ order.due_at }}</time><i>›</i>
                </button>
                <div v-if="!pendingTaskOrders.length" class="dv2-empty">暂无待处理事项</div>
              </section>

              <section class="dv2-card dv2-task-card">
                <header><div><h2>即将送达 / 到期</h2><p>根据医生可见预计日期排序</p></div><span>{{ dashboardUpcomingOrders.length }} 单</span></header>
                <button v-for="order in dashboardUpcomingOrders" :key="order.order_id" type="button" class="dv2-task-row" @click="openOrder(order.order_id)">
                  <span :class="`dv2-dot is-${isDueSoon(order) ? 'warning' : statusTone(order.external_status)}`" />
                  <div><strong>{{ order.patient_name }} · {{ order.product_name }}</strong><small>{{ order.order_no }} · {{ label(order.external_status) }}</small></div>
                  <time>预计 {{ order.due_at }}</time><i>›</i>
                </button>
                <div v-if="!dashboardUpcomingOrders.length" class="dv2-empty">暂无临近交付订单</div>
              </section>
            </div>

            <section class="dv2-card dv2-dashboard-trend">
              <header><div><h2>医生工作台趋势图</h2><p>近 6 周医生可见订单创建趋势</p></div><span>近 6 周</span></header>
              <div class="dv2-dashboard-trend-body">
                <div class="dv2-trend-chart">
                  <svg viewBox="0 0 560 132" role="img" aria-label="近六周订单趋势">
                    <line v-for="y in [32, 68, 104]" :key="y" x1="20" :y1="y" x2="548" :y2="y" />
                    <polyline :points="dashboardTrendPoints" />
                    <circle v-for="(value, index) in dashboardWeeklyCounts" :key="index" :cx="24 + index * 103" :cy="104 - Math.round(value / dashboardTrendMax * 72)" r="4" />
                  </svg>
                  <div><span v-for="index in 6" :key="index">第{{ index }}周</span></div>
                </div>
                <div class="dv2-trend-summary">
                  <article><small>本月订单</small><strong>{{ dataset.orders.filter((item) => item.created_at.startsWith(dashboardToday.slice(0, 7))).length }}</strong><i /></article>
                  <article><small>待确认</small><strong>{{ dataset.orders.filter((item) => item.current_action.includes('REVIEW')).length }}</strong><i /></article>
                  <article><small>待付款</small><strong>{{ dataset.orders.filter((item) => item.current_action === 'PAYMENT_REQUIRED').length }}</strong><i /></article>
                  <article><small>已完成</small><strong>{{ dataset.orders.filter((item) => item.external_status === 'COMPLETED').length }}</strong><i /></article>
                </div>
              </div>
            </section>
          </section>

          <section v-else-if="activePage === 'orders'" class="dv2-orders" data-testid="doctor-page-orders">
            <div class="dv2-card dv2-list-card">
              <div class="dv2-list-toolbar">
                <label class="dv2-field-search"><span>⌕</span><input v-model="orderKeyword" type="search" placeholder="搜索订单、患者、诊所、产品或标签" @input="orderPage = 1"></label>
                <select v-model="orderStatus" @change="orderPage = 1"><option value="ALL">全部状态</option><option value="DRAFT">草稿</option><option value="NEEDS_INFO">待补资料</option><option value="IN_PRODUCTION">制作中</option><option value="AWAITING_PAYMENT">待付款</option><option value="SHIPPED">已发货</option><option value="COMPLETED">已完成</option></select>
                <select v-model="orderProduct" @change="orderPage = 1"><option value="ALL">全部产品</option><option value="FIXED_CROWN">常规牙冠</option><option value="IMPLANT_RESTORATION">种植修复</option><option value="FIXED_BRIDGE">固定桥</option></select>
                <button type="button" class="dv2-secondary-button" @click="exportOrders">⇩ 导出</button>
              </div>
              <div class="dv2-quick-filters">
                <button v-for="item in [{ key: 'ALL', label: '全部' }, { key: 'TODO', label: '待我处理' }, { key: 'DUE', label: '临近到期' }, { key: 'DRAFT', label: '草稿' }]" :key="item.key" type="button" :class="{ active: orderQuick === item.key }" @click="orderQuick = item.key; orderPage = 1">{{ item.label }}</button>
                <span v-if="selectedOrderIds.length">已选 {{ selectedOrderIds.length }} 项</span>
              </div>
              <div class="dv2-table-wrap">
                <table class="dv2-table dv2-order-table">
                  <thead><tr><th class="is-check"><input type="checkbox" :checked="pagedOrders.length > 0 && pagedOrders.every((item) => selectedOrderIds.includes(item.order_id))" aria-label="选择当前页" @change="togglePageSelection(($event.target as HTMLInputElement).checked)"></th><th>订单</th><th>医生 / 患者</th><th>诊所</th><th>产品</th><th>标签</th><th>公开状态</th><th>当前操作</th><th>创建 / 到期</th><th>金额</th><th /></tr></thead>
                  <tbody>
                    <tr v-for="order in pagedOrders" :key="order.order_id" data-testid="doctor-order-row">
                      <td class="is-check"><input type="checkbox" :checked="selectedOrderIds.includes(order.order_id)" :aria-label="`选择 ${order.order_no}`" @change="toggleOrderSelection(order.order_id, ($event.target as HTMLInputElement).checked)"></td>
                      <td><button type="button" class="dv2-link-strong" @click="openOrder(order.order_id)">{{ order.order_no }}</button><small>#{{ order.order_id }}</small></td>
                      <td><strong>{{ order.doctor_name }}</strong><small>{{ order.patient_name }} · {{ order.patient_code }}</small></td>
                      <td>{{ order.clinic_name }}</td><td><strong>{{ order.product_name }}</strong><small>{{ productTypeLabel(order.product_type) }}</small></td>
                      <td><span v-for="tag in order.tags" :key="tag" class="dv2-tag">{{ tag }}</span><span v-if="!order.tags.length">-</span></td>
                      <td><span :class="`dv2-status is-${statusTone(order.external_status)}`">{{ label(order.external_status) }}</span></td>
                      <td><span :class="{ 'dv2-action-text': order.current_action !== 'NONE' }">{{ label(order.current_action) }}</span></td>
                      <td><span>{{ order.created_at }}</span><small>到期 {{ order.due_at }}</small></td><td>{{ money(order.quote) }}</td>
                      <td><button type="button" class="dv2-row-action" :aria-label="`查看 ${order.order_no}`" @click="openOrder(order.order_id)">查看 →</button></td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="!pagedOrders.length" class="dv2-empty">没有符合当前条件的订单</div>
              </div>
              <footer class="dv2-pagination"><span>共 {{ orderRows.length }} 项</span><el-pagination v-model:current-page="orderPage" size="small" background layout="prev, pager, next" :page-size="orderPageSize" :total="orderRows.length" /></footer>
            </div>
          </section>

          <section v-else-if="activePage === 'assistant'" class="dv2-assistant" data-testid="doctor-page-assistant">
            <div class="dv2-card dv2-assistant-card">
              <header><span class="dv2-assistant-mark">✦</span><div><h2>订单助手</h2><p>可查询您当前身份有权查看的订单、账单、物流与消息信息</p></div></header>
              <div class="dv2-assistant-suggestions">
                <button v-for="question in ['哪些订单需要我处理？', '查看本周预计到期的订单', '有哪些账单待付款？']" :key="question" type="button" @click="assistantQuestion = question; askAssistant()">{{ question }}</button>
              </div>
              <div class="dv2-chat-stream">
                <article v-for="(message, index) in assistantMessages" :key="index" :class="{ self: message.role === 'SELF' }">
                  <span>{{ message.role === 'SELF' ? (account?.display_name || '我').slice(0, 1) : '✦' }}</span>
                  <div><p>{{ message.content }}</p><button v-for="orderId in message.orderIds" :key="orderId" type="button" @click="openGlobalOrder(orderId)">查看 {{ dataset.orders.find((item) => item.order_id === orderId)?.order_no }} →</button></div>
                </article>
                <article v-if="assistantLoading"><span>✦</span><div><p>正在查询…</p></div></article>
              </div>
              <form class="dv2-chat-composer" @submit.prevent="askAssistant"><textarea v-model="assistantQuestion" rows="2" placeholder="输入订单号、患者编号或您想查询的问题…" /><button type="submit" :disabled="assistantLoading || !assistantQuestion.trim()">发送</button></form>
              <small class="dv2-scope-note">助手仅返回当前身份可见的公开业务信息，结果以订单页面为准。</small>
            </div>
          </section>

          <section v-else-if="activePage === 'patients'" class="dv2-patients" data-testid="doctor-page-patients">
            <div class="dv2-card dv2-list-card">
              <div class="dv2-list-toolbar"><label class="dv2-field-search"><span>⌕</span><input v-model="patientKeyword" type="search" placeholder="搜索患者姓名、编号、医生或标签"></label><button v-if="activeRole === 'DOCTOR' || activeRole === 'RECEPTION'" type="button" class="dv2-primary-button" @click="patientDialogOpen = true">＋ 新建患者</button></div>
              <div class="dv2-table-wrap">
                <table class="dv2-table">
                  <thead><tr><th>患者</th><th>年龄 / 性别</th><th>负责医生</th><th>标签</th><th>口腔情况摘要</th><th>最近订单</th><th>订单数</th><th /></tr></thead>
                  <tbody><tr v-for="patient in patientRows" :key="patient.patient_id"><td><button type="button" class="dv2-link-strong" @click="openPatient(patient.patient_id)">{{ patient.patient_name }}</button><small>{{ patient.patient_code }}</small></td><td>{{ patient.patient_age ?? '-' }} / {{ patient.patient_gender ?? '-' }}</td><td>{{ patient.doctor_name }}</td><td><span v-for="tag in patient.tags" :key="tag" class="dv2-tag">{{ tag }}</span><span v-if="!patient.tags.length">-</span></td><td class="is-wide">{{ patient.oral_description || '-' }}</td><td><span>{{ patient.latest_order_no || '-' }}</span><small>{{ patient.latest_product_name || '暂无订单' }} · {{ patient.latest_order_at || '-' }}</small></td><td>{{ patient.order_count }}</td><td><button type="button" class="dv2-row-action" @click="openPatient(patient.patient_id)">查看 →</button></td></tr></tbody>
                </table>
                <div v-if="!patientRows.length" class="dv2-empty">没有符合当前条件的患者</div>
              </div>
              <footer class="dv2-pagination"><span>共 {{ patientRows.length }} 位患者</span></footer>
            </div>
          </section>

          <section v-else-if="activePage === 'billing'" class="dv2-billing" data-testid="doctor-page-billing">
            <div class="dv2-tabbar"><button v-for="item in [{ key: 'perOrder', label: '按单结算' }, { key: 'monthly', label: '月结账单' }, { key: 'invoiceRefund', label: '发票与退款' }, { key: 'logistics', label: '物流' }]" :key="item.key" type="button" :class="{ active: billingTab === item.key }" @click="billingTab = item.key as typeof billingTab">{{ item.label }}</button></div>
            <div class="dv2-card dv2-list-card">
              <template v-if="billingTab === 'perOrder'">
                <div class="dv2-list-toolbar"><div><strong>按单结算</strong><small>按单付款的订单需结清后发货</small></div><label class="dv2-field-search is-small"><span>⌕</span><input type="search" placeholder="搜索订单号"></label></div>
                <div class="dv2-table-wrap"><table class="dv2-table"><thead><tr><th>账单 / 订单</th><th>诊所 / 医生</th><th>产品</th><th>账单金额</th><th>已付</th><th>待付</th><th>状态</th><th>到期</th><th /></tr></thead><tbody><tr v-for="bill in dataset.bills.filter((item) => item.settlement_type === 'PER_ORDER')" :key="bill.bill_id"><td><strong>{{ bill.bill_id }}</strong><small>{{ bill.order_no }}</small></td><td>{{ bill.clinic_name }}<small>{{ bill.doctor_name }}</small></td><td>{{ bill.product_name }}</td><td>{{ money(bill.amount) }}</td><td>{{ money(bill.paid) }}</td><td>{{ money(bill.outstanding) }}</td><td><span :class="`dv2-status is-${statusTone(bill.payment_status)}`">{{ label(bill.payment_status) }}</span></td><td>{{ bill.due_at }}</td><td><button v-if="bill.allowed_actions.includes('PAY_BILL')" type="button" class="dv2-row-action is-primary" @click="ElMessage.info('付款交互已完成，待支付接口接入')">去付款</button><button v-else type="button" class="dv2-row-action" @click="openGlobalOrder(bill.order_id)">查看订单</button></td></tr></tbody></table><div v-if="!dataset.bills.some((item) => item.settlement_type === 'PER_ORDER')" class="dv2-empty">暂无按单结算记录，待后端账单接口接入</div></div>
              </template>
              <template v-else-if="billingTab === 'monthly'">
                <div class="dv2-list-toolbar"><div><strong>月结账单</strong><small>月结订单可先发货，在账期内统一结算</small></div></div>
                <div class="dv2-table-wrap"><table class="dv2-table"><thead><tr><th>账期</th><th>诊所</th><th>订单数</th><th>账单总额</th><th>已付</th><th>待付</th><th>状态</th><th>到期日</th><th /></tr></thead><tbody><tr v-for="statement in dataset.statements" :key="statement.statement_id"><td><strong>{{ statement.period }}</strong><small>{{ statement.statement_id }}</small></td><td>{{ statement.clinic_name }}</td><td>{{ statement.order_count }}</td><td>{{ money(statement.total) }}</td><td>{{ money(statement.paid) }}</td><td>{{ money(statement.balance) }}</td><td><span :class="`dv2-status is-${statusTone(statement.status)}`">{{ label(statement.status) }}</span></td><td>{{ statement.due_at }}</td><td><button type="button" class="dv2-row-action">查看明细 →</button></td></tr></tbody></table><div v-if="!dataset.statements.length" class="dv2-empty">暂无月结账单，待后端账期接口接入</div></div>
              </template>
              <template v-else-if="billingTab === 'invoiceRefund'">
                <div class="dv2-list-toolbar"><div><strong>发票与退款</strong><small>集中查看发票开具和退款申请进度</small></div><button type="button" class="dv2-secondary-button" @click="ElMessage.info('申请表单已预留，待后端接口接入')">＋ 发起申请</button></div>
                <div class="dv2-table-wrap"><table class="dv2-table"><thead><tr><th>记录号</th><th>类型</th><th>关联编号</th><th>抬头 / 说明</th><th>金额</th><th>状态</th><th>申请时间</th><th /></tr></thead><tbody><tr v-for="record in dataset.invoiceRefunds" :key="record.record_id"><td><strong>{{ record.record_id }}</strong></td><td>{{ record.kind === 'INVOICE' ? '发票' : '退款' }}</td><td>{{ record.related_no }}</td><td>{{ record.title }}</td><td>{{ money(record.amount) }}</td><td><span :class="`dv2-status is-${statusTone(record.status)}`">{{ label(record.status) }}</span></td><td>{{ record.created_at }}</td><td><button type="button" class="dv2-row-action">查看 →</button></td></tr></tbody></table><div v-if="!dataset.invoiceRefunds.length" class="dv2-empty">暂无发票或退款记录，待后端接口接入</div></div>
              </template>
              <template v-else>
                <div class="dv2-list-toolbar"><div><strong>物流</strong><small>物流信息仅在此处集中展示；已送达后需医生确认收货</small></div><label class="dv2-field-search is-small"><span>⌕</span><input type="search" placeholder="搜索订单或运单号"></label></div>
                <div class="dv2-table-wrap"><table class="dv2-table"><thead><tr><th>订单</th><th>产品</th><th>物流公司</th><th>运单号</th><th>物流状态</th><th>更新时间</th><th /></tr></thead><tbody><tr v-for="item in dataset.logistics" :key="item.logistics_id"><td><strong>{{ item.order_no }}</strong></td><td>{{ item.product_name }}</td><td>{{ item.carrier }}</td><td class="dv2-mono">{{ item.tracking_no }}</td><td><span :class="`dv2-status is-${statusTone(item.status)}`">{{ label(item.status) }}</span></td><td>{{ item.updated_at }}</td><td><button v-if="item.can_confirm_receipt" type="button" class="dv2-row-action is-primary" @click="confirmReceipt(item)">确认收货</button><button v-else type="button" class="dv2-row-action" @click="openLogistics(item)">物流详情 →</button></td></tr></tbody></table><div v-if="!dataset.logistics.length" class="dv2-empty">暂无物流记录，待后端物流接口接入</div></div>
              </template>
            </div>
          </section>

          <section v-else-if="activePage === 'messages'" class="dv2-messages" data-testid="doctor-page-messages">
            <div class="dv2-message-layout">
              <aside class="dv2-thread-panel">
                <div class="dv2-thread-search"><label><span>⌕</span><input v-model="messageKeyword" type="search" placeholder="搜索订单、患者或消息"></label><div><button v-for="item in [{ key: 'ALL', label: '全部' }, { key: 'UNREAD', label: '未读' }, { key: 'READ', label: '已读' }]" :key="item.key" type="button" :class="{ active: messageFilter === item.key }" @click="messageFilter = item.key as typeof messageFilter">{{ item.label }}</button></div></div>
                <button v-for="thread in filteredThreads" :key="thread.thread_id" type="button" class="dv2-thread-row" :class="{ active: activeThread?.thread_id === thread.thread_id }" @click="chooseThread(thread.thread_id)"><span class="dv2-thread-avatar">{{ thread.product_name.slice(0, 1) }}</span><div><strong>{{ thread.patient_name }} · {{ thread.product_name }}</strong><small>{{ thread.order_no }}</small><p>{{ thread.latest_message }}</p></div><time>{{ thread.latest_at }}</time><i v-if="thread.unread" /></button>
                <div v-if="!filteredThreads.length" class="dv2-empty">没有符合筛选条件的沟通</div>
              </aside>
              <section v-if="activeThread" class="dv2-conversation">
                <header><div><h2>{{ activeThread.patient_name }} · {{ activeThread.product_name }}</h2><p>{{ activeThread.order_no }}</p></div><button type="button" class="dv2-secondary-button" @click="openGlobalOrder(activeThread.order_id)">查看订单</button></header>
                <div class="dv2-message-stream">
                  <article v-for="message in activeThread.messages" :key="message.message_id" :class="{ self: message.sender === 'SELF' }"><span>{{ message.sender === 'SELF' ? (account?.display_name || '我').slice(0, 1) : '单' }}</span><div><small>{{ message.sender === 'SELF' ? '我' : '订单服务' }} · {{ message.sent_at }}</small><p>{{ message.content }}</p><section v-if="message.review" class="dv2-review-card"><header><div><strong>{{ reviewLabel(message.review.review_type) }}</strong><small>当前版本 V{{ message.review.current_version }}</small></div><span :class="`dv2-status is-${statusTone(message.review.status)}`">{{ label(message.review.status) }}</span></header><div class="dv2-version-list"><article v-for="version in [...message.review.versions].reverse()" :key="version.version"><div><strong>V{{ version.version }}</strong><span>{{ label(version.status) }}</span><small>{{ version.submitted_at }}</small></div><button v-for="attachment in version.files" :key="attachment.file_id" type="button" @click="previewFile(attachment)"><i>{{ attachment.kind }}</i><span>{{ attachment.name }}<small>{{ attachment.size_label }}</small></span><em>预览</em></button><p v-if="version.doctor_comment">医生意见：{{ version.doctor_comment }}</p></article></div><footer v-if="message.review.status === 'PENDING_REVIEW'"><template v-if="canReview && message.review.allowed_actions.some((action) => ['APPROVE_REVIEW', 'REJECT_REVIEW'].includes(action))"><button v-if="message.review.allowed_actions.includes('REJECT_REVIEW')" type="button" class="dv2-danger-button" @click="startReviewDecision(activeThread.order_id, message.review, 'REJECT')">驳回并留言</button><button v-if="message.review.allowed_actions.includes('APPROVE_REVIEW')" type="button" class="dv2-primary-button" @click="startReviewDecision(activeThread.order_id, message.review, 'APPROVE')">同意当前版本</button></template><p v-else>当前身份或订单权限不可执行确认。</p></footer></section></div></article>
                </div>
                <form class="dv2-message-composer" @submit.prevent="sendMessage"><textarea v-model="messageDraft" rows="2" placeholder="输入订单沟通内容…" @keydown.ctrl.enter.prevent="sendMessage" /><footer><span>Ctrl + Enter 发送</span><button type="submit" :disabled="sendingMessage || !messageDraft.trim()">发送</button></footer></form>
              </section>
              <div v-else class="dv2-empty dv2-no-thread">请选择一条沟通</div>
            </div>
          </section>

          <section v-else-if="activePage === 'account'" class="dv2-account" data-testid="doctor-page-account">
            <div class="dv2-account-layout">
              <aside class="dv2-settings-nav"><button v-for="item in [{ key: 'profile', label: '账户与诊所', note: '基本资料和诊所信息' }, { key: 'members', label: '成员与权限', note: '诊所成员和角色范围' }, { key: 'notifications', label: '通知偏好', note: '站内与邮件提醒' }, { key: 'security', label: '安全设置', note: '密码和登录安全' }]" :key="item.key" type="button" :class="{ active: accountTab === item.key }" @click="accountTab = item.key as typeof accountTab"><strong>{{ item.label }}</strong><small>{{ item.note }}</small></button></aside>
              <section class="dv2-card dv2-settings-content">
                <template v-if="accountTab === 'profile'"><header><h2>账户与诊所</h2><p>维护对外展示和配送所需的基础资料</p></header><div class="dv2-form-grid"><label><span>姓名</span><input v-model="dataset.account.display_name"></label><label><span>登录邮箱</span><input v-model="dataset.account.email" type="email"></label><label><span>诊所名称</span><input v-model="dataset.account.clinic_name"></label><label><span>诊所联系电话</span><input v-model="dataset.account.clinic_contact"></label><label class="is-full"><span>诊所地址</span><textarea v-model="dataset.account.clinic_address" rows="3" /></label></div><footer><button type="button" class="dv2-primary-button" @click="saveProfile">保存设置</button></footer></template>
                <template v-else-if="accountTab === 'members'"><header><div><h2>成员与权限</h2><p>账单权限与物流权限分别设置；诊所角色不会授予平台侧权限</p></div><button v-if="canManageMembers" type="button" class="dv2-primary-button" @click="memberDialogOpen = true">＋ 邀请成员</button></header><div v-if="!canManageMembers" class="dv2-inline-notice">当前身份可查看成员，但只有诊所管理员可以邀请或调整诊所端角色。</div><div class="dv2-member-list"><article v-for="member in dataset.account.members" :key="member.member_id"><span class="dv2-avatar">{{ member.display_name.slice(0, 1) }}</span><div><strong>{{ member.display_name }}</strong><small>{{ member.email }}</small></div><p><span v-for="role in member.roles" :key="role" class="dv2-tag">{{ roleLabels[role] }}</span></p><p><small>账单：{{ member.billing_permission }} · 物流：{{ member.logistics_permission }}</small></p><span :class="`dv2-status is-${statusTone(member.status)}`">{{ label(member.status) }}</span><button type="button" :disabled="!canManageMembers">⋯</button></article><div v-if="!dataset.account.members.length" class="dv2-empty">成员接口待后端接入</div></div></template>
                <template v-else-if="accountTab === 'notifications'"><header><h2>通知偏好</h2><p>分别设置站内通知和邮件提醒</p></header><div class="dv2-preference-table"><div class="head"><strong>通知类型</strong><span>站内</span><span>邮件</span></div><div v-for="(preference, key) in dataset.account.notification_preferences" :key="key"><strong>{{ ({ ORDER_STATUS: '订单状态', REVIEW_REQUEST: '确认事项', MESSAGE: '订单消息', BILLING: '账单提醒', LOGISTICS: '物流提醒' } as Record<string, string>)[key] || key }}</strong><el-switch v-model="preference.in_app" /><el-switch v-model="preference.email" /></div><div v-if="!Object.keys(dataset.account.notification_preferences).length" class="dv2-empty">通知偏好接口待后端接入</div></div><footer><button type="button" class="dv2-primary-button" @click="saveProfile">保存偏好</button></footer></template>
                <template v-else><header><h2>安全设置</h2><p>更新登录密码并保持账户安全</p></header><div class="dv2-form-stack"><label><span>当前密码</span><input v-model="passwordForm.current" type="password" autocomplete="current-password"></label><label><span>新密码</span><input v-model="passwordForm.next" type="password" autocomplete="new-password"><small>至少 8 位，建议包含大小写字母和数字</small></label><label><span>确认新密码</span><input v-model="passwordForm.confirm" type="password" autocomplete="new-password"></label></div><footer><button type="button" class="dv2-primary-button" @click="updatePassword">更新密码</button></footer></template>
              </section>
            </div>
          </section>
        </template>
      </main>
    </section>

    <div v-if="notificationOpen" class="dv2-drawer-mask" @mousedown.self="notificationOpen = false">
      <aside class="dv2-notification-drawer" data-testid="doctor-notification-drawer"><header><div><h2>通知中心</h2><p>{{ unreadCount }} 条未读通知</p></div><button type="button" aria-label="关闭通知中心" @click="notificationOpen = false">×</button></header><div class="dv2-notification-tools"><label><span>⌕</span><input v-model="notificationKeyword" type="search" placeholder="搜索通知"></label><button type="button" @click="markAllNotifications">全部已读</button></div><div class="dv2-chip-row"><button v-for="item in [{ key: 'ALL', label: '全部' }, { key: 'UNREAD', label: '未读' }, { key: 'READ', label: '已读' }]" :key="item.key" type="button" :class="{ active: notificationFilter === item.key }" @click="selectAllNotificationFilter(item.key as typeof notificationFilter)">{{ item.label }}</button></div><div class="dv2-notification-list"><button v-for="item in filteredNotifications" :key="item.notification_id" type="button" :class="{ unread: !item.read }" @click="openNotification(item.notification_id)"><span :class="`dv2-notification-icon is-${item.category.toLowerCase()}`">{{ categoryLabels[item.category].slice(0, 1) }}</span><div><strong>{{ item.title }}</strong><p>{{ item.summary }}</p><small>{{ item.created_at }} · {{ categoryLabels[item.category] }}</small></div><i v-if="!item.read" /></button><div v-if="!filteredNotifications.length" class="dv2-empty">没有符合筛选条件的通知</div></div></aside>
    </div>

    <div v-if="orderDrawerOpen" class="dv2-drawer-mask" @mousedown.self="orderDrawerOpen = false">
      <aside class="dv2-order-drawer" data-testid="doctor-order-drawer"><header><div><small>订单详情</small><h2>{{ selectedOrder?.order_no || '正在加载' }}</h2></div><button type="button" aria-label="关闭订单详情" @click="orderDrawerOpen = false">×</button></header><div v-if="orderDetailLoading" class="dv2-loading-card"><span class="dv2-spinner" />正在读取订单详情…</div><template v-else-if="selectedOrder"><div class="dv2-drawer-summary"><div><span>{{ selectedOrder.patient_name }}</span><small>{{ selectedOrder.patient_code }}</small></div><div><span>{{ selectedOrder.product_name }}</span><small>{{ selectedOrder.clinic_name }}</small></div><span :class="`dv2-status is-${statusTone(selectedOrder.external_status)}`">{{ label(selectedOrder.external_status) }}</span></div><div class="dv2-tabbar is-drawer"><button v-for="item in [{ key: 'overview', label: '概览' }, { key: 'files', label: '文件' }, { key: 'reviews', label: '确认记录' }]" :key="item.key" type="button" :class="{ active: orderDrawerTab === item.key }" @click="orderDrawerTab = item.key as typeof orderDrawerTab">{{ item.label }}</button></div><div class="dv2-drawer-body"><template v-if="orderDrawerTab === 'overview'"><section class="dv2-detail-section"><h3>公开进度</h3><div class="dv2-progress"><article v-for="item in selectedOrder.progress" :key="item.key" :class="item.status.toLowerCase()"><span>{{ item.status === 'DONE' ? '✓' : '' }}</span><div><strong>{{ item.label }}</strong><small>{{ item.occurred_at || item.note || '' }}</small></div></article></div><div class="dv2-public-message">{{ selectedOrder.public_message }}</div></section><section class="dv2-detail-section"><h3>订单资料</h3><dl class="dv2-detail-grid"><div v-for="(value, key) in selectedOrder.form_snapshot" :key="key"><dt>{{ key }}</dt><dd>{{ value }}</dd></div><div><dt>创建时间</dt><dd>{{ selectedOrder.created_at }}</dd></div><div><dt>预计到期</dt><dd>{{ selectedOrder.due_at }}</dd></div><div><dt>金额</dt><dd>{{ money(selectedOrder.quote) }}</dd></div></dl></section><section class="dv2-detail-section"><h3>当前待办</h3><div class="dv2-current-action"><div><strong>{{ label(selectedOrder.current_action) }}</strong><p>{{ selectedOrder.current_action === 'NONE' ? '当前无需您操作。' : '完成后订单将按公开流程继续推进。' }}</p></div><button v-if="selectedOrder.current_action.includes('REVIEW')" type="button" class="dv2-primary-button" @click="orderDrawerTab = 'reviews'">去确认</button><button v-else-if="selectedOrder.current_action === 'PAYMENT_REQUIRED'" type="button" class="dv2-primary-button" @click="orderDrawerOpen = false; switchPage('billing')">去付款</button></div></section></template><template v-else-if="orderDrawerTab === 'files'"><section class="dv2-detail-section"><h3>订单文件</h3><div class="dv2-file-list"><button v-for="item in selectedOrder.files" :key="item.file_id" type="button" @click="previewFile(item)"><i>{{ item.kind }}</i><div><strong>{{ item.name }}</strong><small>{{ item.size_label }} · {{ item.uploaded_at }}</small></div><span>预览 →</span></button><div v-if="!selectedOrder.files.length" class="dv2-empty">暂无医生可见文件</div></div></section></template><template v-else><section class="dv2-detail-section"><h3>确认记录</h3><p class="dv2-section-note">仅展示该订单已启用的确认项和公开版本记录。</p><div v-for="review in selectedOrder.reviews" :key="review.review_id" class="dv2-review-card is-drawer"><header><div><strong>{{ reviewLabel(review.review_type) }}</strong><small>V{{ review.current_version }}</small></div><span :class="`dv2-status is-${statusTone(review.status)}`">{{ label(review.status) }}</span></header><div class="dv2-version-list"><article v-for="version in [...review.versions].reverse()" :key="version.version"><div><strong>V{{ version.version }}</strong><span>{{ label(version.status) }}</span><small>{{ version.submitted_at }}</small></div><button v-for="item in version.files" :key="item.file_id" type="button" @click="previewFile(item)"><i>{{ item.kind }}</i><span>{{ item.name }}<small>{{ item.size_label }}</small></span><em>预览</em></button><p v-if="version.doctor_comment">医生意见：{{ version.doctor_comment }}</p></article></div><footer v-if="review.status === 'PENDING_REVIEW'"><template v-if="canReview && review.allowed_actions.some((action) => ['APPROVE_REVIEW', 'REJECT_REVIEW'].includes(action))"><button v-if="review.allowed_actions.includes('REJECT_REVIEW')" type="button" class="dv2-danger-button" @click="startReviewDecision(selectedOrder.order_id, review, 'REJECT')">驳回并留言</button><button v-if="review.allowed_actions.includes('APPROVE_REVIEW')" type="button" class="dv2-primary-button" @click="startReviewDecision(selectedOrder.order_id, review, 'APPROVE')">同意当前版本</button></template><p v-else>当前身份或订单权限不可执行确认。</p></footer></div><div v-if="!selectedOrder.reviews.length" class="dv2-empty">此订单未启用确认项</div></section></template></div><footer class="dv2-drawer-footer"><button v-if="selectedOrder.current_action === 'RECEIPT_CONFIRMATION_REQUIRED'" type="button" class="dv2-secondary-button" @click="orderDrawerOpen = false; switchPage('billing'); billingTab = 'logistics'">前往物流确认</button><button type="button" class="dv2-secondary-button" @click="openSelectedOrderConversation">进入订单沟通</button><button type="button" class="dv2-primary-button" @click="orderDrawerOpen = false">完成</button></footer></template></aside>
    </div>

    <div v-if="patientDrawerOpen" class="dv2-drawer-mask" @mousedown.self="patientDrawerOpen = false"><aside class="dv2-patient-drawer"><header><div><small>患者档案</small><h2>{{ selectedPatient?.patient_name || '正在加载' }}</h2></div><button type="button" @click="patientDrawerOpen = false">×</button></header><div v-if="patientLoading" class="dv2-loading-card"><span class="dv2-spinner" />正在读取患者档案…</div><template v-else-if="selectedPatient"><div class="dv2-patient-head"><span class="dv2-avatar is-large">{{ selectedPatient.patient_name.slice(0, 1) }}</span><div><strong>{{ selectedPatient.patient_name }}</strong><small>{{ selectedPatient.patient_code }} · {{ selectedPatient.patient_age ?? '-' }} 岁 · {{ selectedPatient.patient_gender || '-' }}</small><p><span v-for="tag in selectedPatient.tags" :key="tag" class="dv2-tag">{{ tag }}</span></p></div></div><div class="dv2-tabbar is-drawer"><button v-for="item in [{ key: 'basic', label: '基础资料' }, { key: 'orders', label: '订单历史' }, { key: 'history', label: '历史参考' }]" :key="item.key" type="button" :class="{ active: patientDrawerTab === item.key }" @click="patientDrawerTab = item.key as typeof patientDrawerTab">{{ item.label }}</button></div><div class="dv2-drawer-body"><template v-if="patientDrawerTab === 'basic'"><section class="dv2-detail-section"><h3>基础信息</h3><dl class="dv2-detail-grid"><div><dt>患者编号</dt><dd>{{ selectedPatient.patient_code }}</dd></div><div><dt>负责医生</dt><dd>{{ selectedPatient.doctor_name }}</dd></div><div class="is-full"><dt>口腔情况摘要</dt><dd>{{ selectedPatient.oral_description || '-' }}</dd></div><div class="is-full"><dt>档案备注</dt><dd>{{ selectedPatient.notes || '-' }}</dd></div></dl></section></template><template v-else-if="patientDrawerTab === 'orders'"><section class="dv2-detail-section"><h3>订单历史</h3><button v-for="order in selectedPatient.orders" :key="order.order_id" type="button" class="dv2-history-order" @click="patientDrawerOpen = false; openGlobalOrder(order.order_id)"><div><strong>{{ order.order_no }}</strong><small>{{ order.product_name }} · {{ order.created_at }}</small></div><span :class="`dv2-status is-${statusTone(order.external_status)}`">{{ label(order.external_status) }}</span></button><div v-if="!selectedPatient.orders.length" class="dv2-empty">暂无历史订单</div></section></template><template v-else><section class="dv2-detail-section"><h3>历史病例参考</h3><p class="dv2-section-note">仅展示当前诊所权限范围内、可用于填写参考的历史订单。</p><article v-for="item in selectedPatient.history_references" :key="item.order_no" class="dv2-history-reference"><strong>{{ item.order_no }} · {{ item.product_name }}</strong><p>{{ item.summary }}</p><div><span v-for="field in item.matched_fields" :key="field" class="dv2-tag">{{ field }}</span></div></article><div v-if="!selectedPatient.history_references.length" class="dv2-empty">暂无可参考历史记录</div></section></template></div><footer class="dv2-drawer-footer"><button v-if="canCreateOrder" type="button" class="dv2-primary-button" @click="patientDrawerOpen = false; openWizard(); wizard.patientId = selectedPatient.patient_id">为患者新建订单</button></footer></template></aside></div>

    <div v-if="logisticsDrawerOpen" class="dv2-drawer-mask" @mousedown.self="logisticsDrawerOpen = false"><aside class="dv2-logistics-drawer"><header><div><small>物流详情</small><h2>{{ selectedLogistics?.order_no }}</h2></div><button type="button" @click="logisticsDrawerOpen = false">×</button></header><template v-if="selectedLogistics"><div class="dv2-logistics-summary"><div><small>物流公司</small><strong>{{ selectedLogistics.carrier }}</strong></div><div><small>运单号</small><strong class="dv2-mono">{{ selectedLogistics.tracking_no }}</strong></div><span :class="`dv2-status is-${statusTone(selectedLogistics.status)}`">{{ label(selectedLogistics.status) }}</span></div><div class="dv2-logistics-timeline"><article v-for="(event, index) in selectedLogistics.events" :key="`${event.time}-${event.label}`" :class="{ current: index === selectedLogistics.events.length - 1 }"><span>{{ index === selectedLogistics.events.length - 1 ? '✓' : '' }}</span><div><strong>{{ event.label }}</strong><p>{{ event.location || '' }}</p><small>{{ event.time }}</small></div></article></div></template></aside></div>

    <div v-if="wizardOpen" class="dv2-wizard" data-testid="doctor-order-wizard"><header><div><span class="dv2-brand-mark">D</span><div><strong>新建订单</strong><small>{{ wizardNotice || '填写过程中可随时保存草稿' }}</small></div></div><button type="button" @click="wizardOpen = false">关闭 ×</button></header><div class="dv2-wizard-steps"><button v-for="(step, index) in ['患者与产品', '病例与牙位', '产品配置', '上传文件', '确认选项', '复核提交']" :key="step" type="button" :class="{ active: wizardStep === index + 1, done: wizardStep > index + 1 }" :disabled="index + 1 > wizardStep" @click="wizardStep = index + 1"><span>{{ wizardStep > index + 1 ? '✓' : index + 1 }}</span><strong>{{ step }}</strong></button></div><main><section v-if="wizardStep === 1" class="dv2-wizard-panel"><header><h1>选择患者与产品</h1><p>先确定订单归属患者和制作产品</p></header><div class="dv2-wizard-two"><div><h3>患者</h3><label class="dv2-field-search"><span>⌕</span><input v-model="wizardPatientKeyword" type="search" placeholder="搜索患者"></label><div class="dv2-choice-list"><button v-for="patient in wizardPatientRows" :key="patient.patient_id" type="button" :class="{ active: wizard.patientId === patient.patient_id }" @click="wizard.patientId = patient.patient_id"><span class="dv2-avatar">{{ patient.patient_name.slice(0, 1) }}</span><div><strong>{{ patient.patient_name }}</strong><small>{{ patient.patient_code }} · {{ patient.doctor_name }}</small></div><i>{{ wizard.patientId === patient.patient_id ? '✓' : '' }}</i></button></div></div><div><h3>产品</h3><div class="dv2-product-choice"><button v-for="product in dataset?.products" :key="product.product_id" type="button" :class="{ active: wizard.productId === product.product_id }" @click="wizard.productId = product.product_id; wizard.productType = product.product_type; wizard.dynamicFields = {}; wizard.reviewOptions = []"><span>{{ product.product_name.slice(0, 1) }}</span><div><strong>{{ product.product_name }}</strong><small>{{ productTypeLabel(product.product_type) }} · {{ product.material }}</small><p>{{ money(product.quote) }}</p></div><i>{{ wizard.productId === product.product_id ? '✓' : '' }}</i></button><div v-if="!dataset?.products.length" class="dv2-inline-notice">产品目录由后台真实配置驱动；当前环境尚未返回医生可见产品，请接入后继续。</div></div></div></div></section><section v-else-if="wizardStep === 2" class="dv2-wizard-panel is-narrow"><header><h1>病例与牙位</h1><p>填写本次制作所需的病例信息</p></header><div class="dv2-form-stack"><label><span>牙位 <i>*</i></span><input v-model="wizard.caseFields.tooth" placeholder="例如：14、35–37"></label><label><span>病例说明</span><textarea v-model="wizard.caseFields.case_note" rows="6" placeholder="填写咬合、外形或其他临床制作要求"></textarea></label></div></section><section v-else-if="wizardStep === 3" class="dv2-wizard-panel is-narrow"><header><h1>产品配置</h1><p>以下字段来自后台的 {{ selectedProduct?.product_name || '产品' }} 配置</p></header><div v-if="selectedProduct" class="dv2-form-stack">
	  <DoctorDynamicFields
	    :fields="selectedProductFields"
	    :model-value="wizard.dynamicFields"
	    @update:model-value="wizard.dynamicFields = $event"
	  />
</div></section><section v-else-if="wizardStep === 4" class="dv2-wizard-panel is-narrow"><header><h1>上传文件</h1><p>上传 STL 扫描文件及必要的照片或 PDF 资料</p></header><label class="dv2-upload-zone" :class="{ disabled: wizardUploading }"><input type="file" multiple accept=".stl,.jpg,.jpeg,.png,.pdf" :disabled="wizardUploading" @change="addWizardFiles"><span>⇧</span><strong>{{ wizardUploading ? '文件上传中…' : '点击选择或拖放文件' }}</strong><small>支持 STL、JPG、PNG、PDF；至少需要一个 STL 文件</small></label><div class="dv2-file-list">
  <article v-for="fileItem in wizard.files" :key="fileItem.file_id"><i>{{ fileItem.kind }}</i>
    <div><strong>{{ fileItem.name }}</strong><small>{{ fileItem.size_label }} · 已就绪</small></div>
    <button type="button" @click="wizard.files = wizard.files.filter((candidate) => candidate.file_id !== fileItem.file_id)">移除</button>
  </article>
</div></section><section v-else-if="wizardStep === 5" class="dv2-wizard-panel is-narrow"><header><h1>确认选项</h1><p>选中的每一项会在对应阶段暂停，等待医生确认后继续</p></header><div v-if="selectedProduct" class="dv2-review-options">
  <label v-for="reviewType in selectedProductReviewOptions" :key="reviewType">
    <input type="checkbox" :checked="wizard.reviewOptions.includes(reviewType)" @change="toggleReviewOption(reviewType, ($event.target as HTMLInputElement).checked)">
    <span><strong>{{ reviewLabel(reviewType) }}</strong><small>启用后预计交付时间增加 1 个工作日</small></span>
  </label>
  <div v-if="!selectedProductReviewOptions.length" class="dv2-empty">当前产品未配置可选确认项</div>
</div><div class="dv2-inline-notice">是否启用由后台产品配置决定；未被配置的确认项不会出现在订单中。</div></section><section v-else class="dv2-wizard-panel"><header><h1>复核并提交</h1><p>确认资料完整后提交，价格与预计日期由后台最终计算</p></header><div class="dv2-review-summary"><section><h3>患者与产品</h3><dl><div><dt>患者</dt><dd>{{ selectedWizardPatient?.patient_name }} · {{ selectedWizardPatient?.patient_code }}</dd></div><div><dt>产品</dt><dd>{{ selectedProduct?.product_name }} · {{ selectedProduct?.material }}</dd></div><div><dt>价格</dt><dd>由后台核价确认</dd></div></dl></section><section><h3>病例与配置</h3><dl><div><dt>牙位</dt><dd>{{ wizard.caseFields.tooth }}</dd></div><div v-for="summaryField in selectedProductFields" :key="summaryField.key">
  <dt>{{ summaryField.label }}</dt><dd>{{ wizard.dynamicFields[summaryField.key] || '-' }}</dd>
</div></dl></section><section><h3>文件与确认</h3><dl><div><dt>文件</dt><dd>{{ wizard.files.length }} 个（STL {{ wizardStlCount }}）</dd></div><div><dt>确认项</dt><dd>{{ wizardReviewSummary }}</dd></div><div><dt>日期影响</dt><dd>{{ wizard.reviewOptions.length ? `预计增加 ${wizard.reviewOptions.length} 个工作日` : '无额外确认时间' }}</dd></div></dl></section></div><div v-if="wizardMissingForStep(4).length" class="dv2-inline-notice is-warning">智能完整性检查：还需补充 {{ wizardMissingForStep(4).join('、') }}</div><div v-else class="dv2-inline-notice is-success">智能完整性检查：必填资料已齐全，可以提交。</div></section></main><footer><button type="button" class="dv2-secondary-button" :disabled="wizardSaving" @click="saveWizardDraft(false)">{{ wizardSaving ? '保存中…' : '保存草稿' }}</button><div><button v-if="wizardStep > 1" type="button" class="dv2-secondary-button" @click="wizardStep--">上一步</button><button v-if="wizardStep < 6" type="button" class="dv2-primary-button" @click="nextWizardStep">下一步</button><button v-else type="button" class="dv2-primary-button" :disabled="wizardSubmitting" @click="submitWizard">{{ wizardSubmitting ? '提交中…' : '提交订单' }}</button></div></footer></div>

    <el-dialog v-model="rejectDialogOpen" title="驳回并提交修改意见" width="520px" append-to-body><p class="dv2-dialog-note">说明需要调整的具体内容。对方提交新版本后，您可以再次确认。</p><el-input v-model="rejectReason" type="textarea" :rows="5" maxlength="500" show-word-limit placeholder="必填，请写明需要修改的位置和要求" /><template #footer><el-button @click="rejectDialogOpen = false">取消</el-button><el-button type="danger" :disabled="!rejectReason.trim()" @click="submitReviewDecision('REJECT')">确认驳回并发送</el-button></template></el-dialog>

    <el-dialog v-model="patientDialogOpen" title="新建患者" width="560px" append-to-body><div class="dv2-form-grid"><label><span>患者姓名 *</span><input v-model="newPatient.name"></label><label><span>年龄</span><input v-model="newPatient.age" type="number"></label><label><span>性别</span><select v-model="newPatient.gender"><option value="">请选择</option><option value="男">男</option><option value="女">女</option><option value="其他">其他</option></select></label><label><span>标签</span><input v-model="newPatient.tags" placeholder="多个标签用逗号分隔"></label><label class="is-full"><span>口腔情况摘要</span><textarea v-model="newPatient.oralDescription" rows="4" /></label></div><template #footer><el-button @click="patientDialogOpen = false">取消</el-button><el-button type="primary" @click="createPatient">保存患者</el-button></template></el-dialog>

    <el-dialog v-model="memberDialogOpen" title="邀请诊所成员" width="600px" append-to-body><div class="dv2-form-grid"><label><span>成员姓名 *</span><input v-model="newMember.displayName"></label><label><span>邮箱 *</span><input v-model="newMember.email" type="email"></label><label><span>诊所角色</span><select v-model="newMember.role">
  <option v-for="roleOption in clinicRoleOptions" :key="roleOption.value" :value="roleOption.value">{{ roleOption.name }}</option>
</select></label><label><span>账单权限</span><select v-model="newMember.billing"><option value="NONE">无</option><option value="VIEW">查看</option><option value="FINANCIAL_ACTION">财务操作</option></select></label><label><span>物流权限</span><select v-model="newMember.logistics"><option value="NONE">无</option><option value="VIEW">查看</option><option value="RECEIPT">查看并确认收货</option></select></label></div><div class="dv2-inline-notice">诊所管理员只能分配诊所端角色，不能授予平台其他端权限。</div><template #footer><el-button @click="memberDialogOpen = false">取消</el-button><el-button type="primary" @click="addMember">发送邀请</el-button></template></el-dialog>

    <el-dialog v-model="filePreviewOpen" :title="filePreview?.kind === 'STL' ? 'STL 3D 预览' : '文件预览'" width="760px" append-to-body><div class="dv2-preview-stage"><template v-if="filePreview?.kind === 'IMAGE'"><div class="dv2-preview-placeholder"><span>图</span><strong>{{ filePreviewName }}</strong><p>前端预览交互已就绪；后端提供短时效预览地址后显示真实图片。</p></div></template><template v-else-if="filePreview?.kind === 'PDF'"><div class="dv2-preview-placeholder"><span>PDF</span><strong>{{ filePreviewName }}</strong><p>前端 PDF 预览入口已就绪；后端提供短时效预览地址后加载文档。</p></div></template><template v-else><div class="dv2-mock-model"><div class="dv2-model-object"><i /><i /><i /></div><strong>{{ filePreviewName }}</strong><p>拖动旋转 · 滚轮缩放 · 仅查看</p><small>当前为二期前端预览模型；接入文件地址后将使用真实 Three.js STL 查看器。</small></div></template></div><template #footer><el-button @click="filePreviewOpen = false">关闭</el-button></template></el-dialog>

    <StlViewerDialog v-if="viewerFile" v-model:visible="viewerOpen" :source-url="viewerFile.preview_url || ''" :filename="viewerFile.name" />
  </div>
</template>
