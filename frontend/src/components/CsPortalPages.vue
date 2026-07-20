<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type AuthMenu = {
  menuCode: string
  menuName: string
  routePath: string | null
  permissionCode: string | null
}

type LoginUser = {
  username: string
  userId: number | null
  clinicId: number | null
  roles: string[]
  permissions: string[]
  menus: AuthMenu[]
  dataScope: string | null
}

type ApiResponse<T> = { code: number; msg: string; data: T }
type Paged<T> = { items: T[]; total: number; page: number; size: number }

type OrderItem = {
  order_id: number
  order_no: string
  clinic_id: number
  clinic_name: string
  doctor_user_id: number | null
  patient_id?: number | null
  cs_user_id: number | null
  product_type: string
  internal_status: string
  external_status: string
  production_note: string | null
  reject_reason: string | null
  form_data: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

type MessageItem = {
  msg_id: number
  order_id: number
  order_no: string
  product_type: string
  external_status: string
  sender_user_id: number | null
  sender_role: string
  content: string
  visible_to: string
  review_status: string
  mention_user_ids?: number[]
  created_at?: string
}

type AttentionItem = {
  message_id: number
  order_id: number
  order_no: string
  sender_role: string
  content: string
  created_at: string
}

type DesignDraft = {
  draft_id: number
  order_id: number
  version: number
  uploader_user_id: number | null
  file_id: number | null
  file_ids: number[]
  file_count: number
  status: string
  cs_reject_reason: string | null
  doctor_reject_reason: string | null
}

type OrderFile = {
  file_id: number
  source_type: string
  visibility: string
  original_filename: string
  content_type: string | null
  file_size: number | null
  upload_status: string
  created_at: string
}

type BillInfo = {
  bill_id: number | null
  order_id: number
  bill_status: string
  payment_status: string
  amount_cents: number | null
  currency: string
  file_id: number | null
}

type PaymentItem = {
  payment_id: number
  order_id: number
  amount_cents: number
  currency: string
  payment_method: string
  received_at: string
  payment_note: string | null
  created_at: string
}

type LogisticsInfo = {
  logistics_id: number | null
  order_id: number
  carrier: string | null
  tracking_no: string | null
  logistics_status: string
}

type DeliveryItem = {
  order_id: number
  order_no: string
  product_type: string
  external_status: string
  bill_status: string
  payment_status: string
  carrier: string | null
  tracking_no: string | null
  logistics_status: string
  last_follow_up_note: string | null
}

type ClinicItem = {
  clinic_id: number
  clinic_name: string
  contact_name: string | null
  contact_phone: string | null
  status: string
  preference_count: number
  created_at: string
  updated_at: string
}

type ClinicPreference = {
  clinic_id: number
  clinic_name: string
  preferences: Record<string, unknown>
  updated_at: string
}

type DetailLoadState = { loading: boolean; error: string }
type TimelineStep = { key: string; icon: string; label: string; detail: string; state: 'done' | 'current' | 'pending' }

type ProductItem = {
  product_id: number
  product_type: string
  product_name: string
  material_spec: string | null
  base_price_cents: number
  currency: string
  status: string
  price_note: string | null
  created_at: string
  updated_at: string
}

type FormRequirement = {
  field_id: number
  product_type: string
  field_key: string
  field_label: string
  field_type: string
  is_required: boolean
  options: string[]
  sort_order: number
  status: string
}

type ReviewDisplayField = {
  key: string
  label: string
  value: string
  required: boolean
  missing: boolean
  long: boolean
}

type NotificationItem = {
  notification_id: number
  event_id: number
  event: string
  order_id: number | null
  order_no: string | null
  message: string | null
  read_at: string | null
  delivered_at: string | null
  created_at: string
}

type OutsourcingItem = {
  outsourcing_id: number
  batch_no: string
  order_id: number
  order_no: string
  product_type: string
  item_name: string
  supplier_name: string
  quantity: number
  status: string
  sent_at: string
  expected_return_at: string | null
  actual_return_at: string | null
  abnormal_note: string | null
  created_at: string
  updated_at: string
  overdue: boolean
  is_overdue?: boolean
}

type MissingInfoItem = { field_key: string; field_label: string; tip: string }
type MissingInfoResponse = { is_complete: boolean; missing_items: MissingInfoItem[] }
type TranslateResponse = { translated_text: string }
type ProductionNoteResponse = {
  draft_note: string
  template_version: string
  knowledge_context_notes: string[]
  requires_customer_template_confirmation: boolean
}
type ProductionNoteConfirmResponse = { production_note: string }
type PreviewResponse = { preview_url: string }
type HelpTopic = {
  key: 'START' | 'ORDER' | 'TRANSLATION' | 'INQUIRY' | 'BILLING' | 'PERMISSION'
  label: string
  title: string
  intro: string
  articles: Array<{ title: string; body: string }>
}

const props = defineProps<{
  activeRoute: string
  token: string
  user: LoginUser | null
  searchKeyword: string
}>()

const emit = defineEmits<{
  navigate: [routePath: string]
  refreshNotifications: []
}>()

const pageLoading = ref(false)
const pageError = ref('')
const pageResult = ref('')
const orders = ref<OrderItem[]>([])
const orderTotal = ref(0)
const notifications = ref<NotificationItem[]>([])
const unreadCount = ref(0)
const clinics = ref<ClinicItem[]>([])
const products = ref<ProductItem[]>([])
const deliveryItems = ref<DeliveryItem[]>([])
const outsourcingItems = ref<OutsourcingItem[]>([])

const orderKeyword = ref('')
const orderFilter = ref<'ALL' | 'NEW' | 'REGISTERED' | 'QUESTION' | 'EXCEPTION'>('ALL')
const selectedOrder = ref<OrderItem | null>(null)
const orderDrawerVisible = ref(false)
const orderMessages = ref<MessageItem[]>([])
const orderDrafts = ref<DesignDraft[]>([])
const orderFiles = ref<OrderFile[]>([])
const orderBill = ref<BillInfo | null>(null)
const orderLogistics = ref<LogisticsInfo | null>(null)
const orderDetailState = ref<DetailLoadState>({ loading: false, error: '' })
const orderDetailSectionErrors = ref<string[]>([])
const orderReplyDraft = ref('')
const orderReplySending = ref(false)
const orderReplyError = ref('')
const orderReplyResult = ref('')

const inquiryOrderId = ref<number | null>(null)
const inquiryMessages = ref<MessageItem[]>([])
const attentionItems = ref<AttentionItem[]>([])
const pendingMessages = ref<MessageItem[]>([])
const inquiryKeyword = ref('')
const inquiryTab = ref<'ALL' | 'WAITING' | 'REVIEW'>('ALL')
const inquiryDraft = ref('')
const inquirySending = ref(false)

const translationOrderId = ref<number | null>(null)
const translationKeyword = ref('')
const translationFilter = ref<'ALL' | 'PENDING' | 'CONFIRMED'>('ALL')
const translationTab = ref<'INFO' | 'TRANSLATION' | 'FILES' | 'HISTORY'>('INFO')
const translationSource = ref('')
const translationDraft = ref('')
const translationFiles = ref<OrderFile[]>([])
const translationRequirements = ref<FormRequirement[]>([])
const productionNoteDraft = ref('')
const productionNoteConfirmation = ref('')
const missingInfoItems = ref<MissingInfoItem[]>([])
const missingInfoChecked = ref(false)
const aiLoading = ref(false)

const designOrderId = ref<number | null>(null)
const designKeyword = ref('')
const designDrafts = ref<DesignDraft[]>([])
const designRejectReasons = ref<Record<number, string>>({})
const designPreviewUrls = ref<Record<number, string>>({})
const designDrawerVisible = ref(false)
const designDetailState = ref<DetailLoadState>({ loading: false, error: '' })

const customerKeyword = ref('')
const customerFilter = ref<'ALL' | 'INCOMPLETE' | 'INACTIVE'>('ALL')
const selectedClinicId = ref<number | null>(null)
const selectedClinic = ref<ClinicItem | null>(null)
const clinicPreference = ref<ClinicPreference | null>(null)
const clinicPreferenceDraft = ref<Record<string, unknown>>({})
const clinicPreferenceTextDraft = ref<Record<string, string>>({})
const customerDrawerVisible = ref(false)
const customerDetailState = ref<DetailLoadState>({ loading: false, error: '' })

const productKeyword = ref('')
const selectedProductId = ref<number | null>(null)
const productRequirements = ref<FormRequirement[]>([])
const productEditName = ref('')
const productEditMaterial = ref('')
const productEditPrice = ref(0)
const productEditStatus = ref('ACTIVE')
const productEditNote = ref('')
const productDrawerVisible = ref(false)
const productDetailState = ref<DetailLoadState>({ loading: false, error: '' })

const billingTab = ref<'ORDER' | 'MONTHLY'>('ORDER')
const selectedBillingOrderId = ref<number | null>(null)
const selectedBill = ref<BillInfo | null>(null)
const selectedPayments = ref<PaymentItem[]>([])
const paymentAmountYuan = ref<number | null>(null)
const paymentMethod = ref('BANK_TRANSFER')
const paymentNote = ref('')
const billingDrawerVisible = ref(false)
const billingDetailState = ref<DetailLoadState>({ loading: false, error: '' })
const billingDetailErrors = ref<string[]>([])

const deliveryStatus = ref('ALL')
const selectedDeliveryOrderId = ref<number | null>(null)
const carrierDraft = ref('')
const trackingDraft = ref('')
const logisticsStatusDraft = ref('EXCEPTION')
const logisticsFollowUpDraft = ref('')
const deliveryDrawerVisible = ref(false)
const shippingDialogVisible = ref(false)

const outsourcingStatus = ref('ALL')
const selectedOutsourcingId = ref<number | null>(null)
const outsourcingDrawerVisible = ref(false)
const outsourcingDetailState = ref<DetailLoadState>({ loading: false, error: '' })

const settingsTab = ref<'TEAM' | 'ASSIGNMENT' | 'REPLIES' | 'PREFERENCES'>('TEAM')
const notificationFilter = ref<'ALL' | 'UNREAD' | 'ORDER' | 'MESSAGE' | 'DESIGN' | 'BILLING'>('ALL')
const searchInput = ref(props.searchKeyword)
const helpKeyword = ref('')
const helpTopic = ref<HelpTopic['key']>('START')

const helpTopics: HelpTopic[] = [
  {
    key: 'START', label: '开始使用', title: '客服端统一业务口径',
    intro: '客服登记新订单，但不替代翻译人员的信息审核，也不替代生产端的专业审核。',
    articles: [
      { title: '新订单如何处理？', body: '客户提交后，订单首先显示为“新订单”。客服完成登记后进入信息审核/翻译流程；登记不是审单，也不会修改客户原始下单内容。' },
      { title: '在哪里和客户沟通？', body: '所有订单事项都在“问单沟通”中自由交流。快捷回复只会填入输入框，必须由客服人工确认发送。' }
    ]
  },
  {
    key: 'ORDER', label: '订单与登记', title: '新订单登记与后续跟踪',
    intro: '“新订单”表示客户刚提交且尚未完成客服登记；“已登记”表示订单已进入后续处理链路。',
    articles: [
      { title: '登记会改变客户资料吗？', body: '不会。客服在客户原始资料上补充和核对，原始提交内容必须保留。' },
      { title: '登记后去哪里处理？', body: '需要文字核对的订单进入信息审核/翻译；存在疑点时进入问单沟通；设计文件由设计稿管理继续处理。' }
    ]
  },
  {
    key: 'TRANSLATION', label: '信息审核/翻译', title: '翻译岗位的处理边界',
    intro: '翻译人员核对客户文字、整理翻译稿并人工确认生产信息，普通客服不替代翻译岗位确认。',
    articles: [
      { title: 'AI 草稿可以直接发送吗？', body: '不可以。AI 内容只能作为草稿，必须由翻译人员逐项核对后人工确认。' },
      { title: '发现资料缺失怎么办？', body: '不要自行猜测，使用“发现疑点，创建问单”进入订单会话向客户确认。' }
    ]
  },
  {
    key: 'INQUIRY', label: '问单与设计确认', title: '订单会话与设计确认',
    intro: '问单沟通是自由会话区域，设计确认也是问单的一部分，不再建立独立的设计确认页面。',
    articles: [
      { title: '快捷回复会自动发送吗？', body: '不会。点击快捷回复只会填入输入框，客服检查后还要再次点击“发送消息”。' },
      { title: '设计确认如何完成？', body: '设计稿内部审核通过后，在对应订单会话中发起确认；客户确认或要求修改的结果再回写设计版本。' }
    ]
  },
  {
    key: 'BILLING', label: '账单与配送', title: '账单、收款与配送',
    intro: '按单账单、人工收款和配送记录分别保存；月结自动归集需要真实结算规则和后端能力。',
    articles: [
      { title: '登记收款等于在线支付吗？', body: '不等于。当前只记录真实发生的人工收款事实，不代表支付网关、退款、对账或电子发票已接入。' },
      { title: '什么时候可以发货？', body: '发货提交时由后端核验终检门禁；客服还需填写真实承运商与运单号，不能用演示轨迹代替。' }
    ]
  },
  {
    key: 'PERMISSION', label: '权限与数据范围', title: '账号权限与数据范围',
    intro: '页面只展示当前登录账号有权访问的业务数据；菜单可见不等于后端权限可以省略。',
    articles: [
      { title: '遇到权限不足怎么办？', body: '先确认客户或订单是否分配给本人，再通过组织既有内部渠道联系系统管理员。' },
      { title: '在哪里修改登录安全？', body: '登录账号、密码、启停和解锁由系统管理员在管理端维护，客服端不提供账号切换或安全设置。' }
    ]
  }
]

async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${props.token}`,
      ...(options.headers ?? {})
    }
  })
  if (!response.ok) {
    let detail = ''
    try {
      const payload = await response.json() as { message?: string; msg?: string }
      detail = payload.message || payload.msg || ''
    } catch {
      // 保留状态码作为可理解的兜底错误。
    }
    throw new Error(detail || `请求失败（${response.status}）`)
  }
  return await response.json() as ApiResponse<T>
}

async function safeData<T>(path: string, fallback: T): Promise<T> {
  try {
    return (await apiFetch<T>(path)).data
  } catch {
    return fallback
  }
}

function compactDateTime(value?: string | null) {
  if (!value) return '时间未记录'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
  }).format(date)
}

function money(amount: number | null | undefined, currency = 'CNY') {
  if (amount == null) return '金额待录入'
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency }).format(amount / 100)
}

function statusLabel(status?: string | null) {
  const labels: Record<string, string> = {
    DRAFT: '草稿', SUBMITTED: '已提交', PENDING_CS_REVIEW: '新订单', PENDING_PRODUCTION_REVIEW: '待生产审核',
    PENDING_DOCTOR_CONFIRM: '待客户确认', PROCESS_INSTANCE_CREATED: '已进入生产', PRODUCING: '生产中',
    SHIPPED: '已发货', COMPLETED: '已完成', REJECTED: '已退回', APPROVED: '已通过',
    PENDING: '待处理', PENDING_PAYMENT: '待收款', PARTIALLY_PAID: '部分收款', PAID: '已收款',
    UNPAID: '待收款', UPLOADED: '已上传', SENT: '已发送', DELIVERED: '已签收',
    EXCEPTION: '配送异常', FOLLOWING_UP: '跟进中', RESOLVED: '已解决', DELAYED: '已延迟',
    RETURNED: '已返回', CANCELLED: '已取消', ACTIVE: '启用', INACTIVE: '停用', PENDING_CS_REVIEW_DESIGN: '待内部审核',
    PENDING_DOCTOR_REVIEW: '待客户确认', DOCTOR_CONFIRMED: '客户已确认', DOCTOR_REJECTED: '客户要求修改',
    NO_PAYMENT_REQUIRED: '无需收款', NOT_REQUIRED: '无需处理', PROCESSING: '处理中', READY: '已就绪',
    FAILED: '处理失败', UPLOADING: '上传中', VALID: '有效', INVALID: '无效', ARCHIVED: '已归档',
    OUTSOURCED: '外协中', IN_TRANSIT: '运输中', RECEIVED: '已接收', OVERDUE: '已超期',
    CS_REJECTED: '客服已退回', PRODUCTION_REJECTED: '生产审核已退回', ASSIGNED: '已分配生产',
    IN_DESIGN: '设计处理中', IN_PRODUCTION: '生产制作中', IN_QC: '质检中', QC_PASSED: '终检已通过',
    PENDING_SHIP: '待发货', DESIGNING: '设计中', QC: '质检中'
  }
  return status ? labels[status] || '未知状态' : '状态未记录'
}

function productLabel(type?: string | null) {
  const labels: Record<string, string> = {
    REGULAR_CROWN: '常规牙冠',
    FIXED_CROWN: '常规牙冠',
    IMPLANT: '种植修复',
    IMPLANT_CROWN: '种植牙冠',
    IMPLANT_RESTORATION: '种植修复',
    VENEER: '贴面',
    VENEER_SET: '贴面套装',
    BRIDGE: '桥体',
    FIXED_BRIDGE: '固定桥',
    PFM_BRIDGE: '烤瓷桥',
    DENTURE: '活动义齿',
    REMOVABLE: '活动修复',
    ORTHODONTICS: '正畸产品',
    CLEAR_ALIGNER: '隐形矫治',
    NIGHT_GUARD: '夜磨牙垫'
  }
  return type ? labels[type] || '其他修复产品' : '产品未记录'
}

function registrationStatus(order: OrderItem) {
  return order.internal_status === 'PENDING_CS_REVIEW' ? 'NEW' : 'REGISTERED'
}

function informationStatus(order: OrderItem) {
  if (order.production_note?.trim()) return '已完成人工确认'
  if (order.internal_status === 'PENDING_CS_REVIEW') return '登记后待处理'
  return '待信息审核/翻译'
}

function orderFormValue(order: OrderItem | null, keys: string[]) {
  if (!order) return ''
  for (const key of keys) {
    const value = order.form_data?.[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number') return String(value)
    if (Array.isArray(value) && value.length) return value.join('、')
  }
  return ''
}

const reviewFieldLabels: Record<string, string> = {
  patient_name: '患者姓名',
  tooth_position: '牙位',
  tooth: '牙位',
  teeth: '牙位',
  material: '材料',
  shade: '色号',
  color: '颜色',
  doctor_note: '医生备注',
  instruction: '客户指示',
  customer_instruction: '客户指示',
  description: '制作说明',
  notes: '补充说明',
  special_requirements: '特殊要求',
  retention_type: '固位方式',
  retention: '固位方式',
  contact: '邻接要求',
  contact_type: '邻接要求',
  occlusion: '咬合要求',
  margin: '边缘要求',
  quantity: '数量',
  item_count: '件数',
  qty: '数量',
  case_count: '病例数量',
  due_date: '期望交期',
  delivery_date: '期望交期'
}

function isInternalReviewField(key: string) {
  return /^(?:_|demo_|acceptance_|test_|debug_|internal_)/i.test(key)
}

function reviewFieldValue(value: unknown): string {
  if (value == null || value === '') return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (Array.isArray(value)) {
    return value.map((item) => reviewFieldValue(item)).filter(Boolean).join('、')
  }
  return '已提交结构化资料'
}

function senderLabel(role: string) {
  const labels: Record<string, string> = { DOCTOR: '医生/客户', CS: '客服', WORKER: '生产人员', ADMIN: '系统' }
  return labels[role] || '其他参与人'
}

function fileEmoji(file: Pick<OrderFile, 'content_type' | 'original_filename'>) {
  const hint = `${file.content_type || ''} ${file.original_filename}`.toLowerCase()
  if (/image|png|jpe?g|webp/.test(hint)) return '🖼️'
  if (/pdf/.test(hint)) return '📕'
  if (/zip|rar|7z/.test(hint)) return '🗜️'
  if (/stl|obj|ply|cad/.test(hint)) return '🦷'
  return '📎'
}

function formatFileSize(size?: number | null) {
  if (size == null) return '大小未记录'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function paymentMethodLabel(method?: string | null) {
  const labels: Record<string, string> = { BANK_TRANSFER: '银行转账', CASH: '现金', OTHER: '其他方式', WECHAT: '微信转账', ALIPAY: '支付宝转账' }
  return method ? labels[method] || '其他方式' : '方式未记录'
}

function fieldTypeLabel(type?: string | null) {
  const labels: Record<string, string> = { text: '单行文本', textarea: '多行文本', select: '单选', radio: '单选', checkbox: '多选', number: '数字', date: '日期', file: '文件' }
  return type ? labels[type.toLowerCase()] || '业务字段' : '业务字段'
}

function preferenceLabel(key: string) {
  const labels: Record<string, string> = { color: '颜色偏好', contact: '邻接偏好', margin: '边缘偏好', shape: '形态偏好', material: '材料偏好', note: '其他制作说明' }
  return labels[key] || '其他偏好'
}

function preferenceText(value: unknown) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value, null, 2)
}

function parsePreferenceText(value: string): unknown {
  const text = value.trim()
  if (!text) return null
  if (text.startsWith('{') || text.startsWith('[')) return JSON.parse(text)
  return text
}

function detailError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function fileIds(draft: DesignDraft) {
  return draft.file_ids?.length ? draft.file_ids : draft.file_id ? [draft.file_id] : []
}

async function loadOrders() {
  const payload = await apiFetch<Paged<OrderItem>>('/orders?page=1&size=100')
  orders.value = payload.data.items
  orderTotal.value = payload.data.total
}

async function loadNotifications() {
  const [list, count] = await Promise.all([
    apiFetch<NotificationItem[]>('/notifications?limit=100'),
    apiFetch<{ unread_count: number }>('/notifications/unread-count')
  ])
  notifications.value = list.data
  unreadCount.value = count.data.unread_count
  emit('refreshNotifications')
}

async function loadClinics() {
  const payload = await apiFetch<Paged<ClinicItem>>('/clinics?page=1&size=100')
  clinics.value = payload.data.items
}

async function loadProducts() {
  const payload = await apiFetch<Paged<ProductItem>>('/products?page=1&size=100')
  products.value = payload.data.items
}

async function loadDelivery() {
  deliveryItems.value = (await apiFetch<DeliveryItem[]>('/logistics/orders?limit=100')).data
}

async function loadOutsourcing() {
  outsourcingItems.value = (await apiFetch<OutsourcingItem[]>('/production/outsourcing')).data
}

async function loadInquiryBase() {
  await loadOrders()
  const [attention, pending] = await Promise.all([
    safeData<AttentionItem[]>('/messages/attention-items', []),
    safeData<MessageItem[]>('/messages/pending-review', [])
  ])
  attentionItems.value = attention
  pendingMessages.value = pending
  if (!inquiryOrderId.value && orders.value.length) inquiryOrderId.value = orders.value[0].order_id
  if (inquiryOrderId.value) await loadInquiryMessages(inquiryOrderId.value)
}

async function loadOrderAttention() {
  attentionItems.value = await safeData<AttentionItem[]>('/messages/attention-items', [])
}

async function loadInquiryMessages(orderId: number) {
  inquiryOrderId.value = orderId
  inquiryMessages.value = (await apiFetch<MessageItem[]>(`/orders/${orderId}/messages`)).data
}

async function sendInquiryMessage() {
  if (!inquiryOrderId.value || !inquiryDraft.value.trim()) return
  inquirySending.value = true
  pageError.value = ''
  try {
    await apiFetch<MessageItem>(`/orders/${inquiryOrderId.value}/messages`, {
      method: 'POST', body: JSON.stringify({ content: inquiryDraft.value.trim(), mention_user_ids: [] })
    })
    inquiryDraft.value = ''
    await loadInquiryMessages(inquiryOrderId.value)
    pageResult.value = '消息已发送并保存到订单会话。'
  } catch (error) {
    pageError.value = error instanceof Error ? error.message : '消息发送失败'
  } finally {
    inquirySending.value = false
  }
}

async function openOrder(order: OrderItem) {
  selectedOrder.value = order
  orderDrawerVisible.value = true
  orderReplyDraft.value = ''
  orderReplyError.value = ''
  orderReplyResult.value = ''
  orderDetailState.value = { loading: true, error: '' }
  orderDetailSectionErrors.value = []
  orderMessages.value = []
  orderDrafts.value = []
  orderFiles.value = []
  orderBill.value = null
  orderLogistics.value = null
  const requests = await Promise.allSettled([
    apiFetch<MessageItem[]>(`/orders/${order.order_id}/messages`),
    apiFetch<DesignDraft[]>(`/orders/${order.order_id}/design-drafts`),
    apiFetch<OrderFile[]>(`/orders/${order.order_id}/files`),
    apiFetch<BillInfo>(`/orders/${order.order_id}/bill`),
    apiFetch<LogisticsInfo>(`/orders/${order.order_id}/logistics`)
  ])
  if (selectedOrder.value?.order_id !== order.order_id) return
  const [messages, drafts, files, bill, logistics] = requests
  if (messages.status === 'fulfilled') orderMessages.value = messages.value.data
  else orderDetailSectionErrors.value.push('沟通记录')
  if (drafts.status === 'fulfilled') orderDrafts.value = drafts.value.data
  else orderDetailSectionErrors.value.push('设计版本')
  if (files.status === 'fulfilled') orderFiles.value = files.value.data
  else orderDetailSectionErrors.value.push('订单附件')
  if (bill.status === 'fulfilled') orderBill.value = bill.value.data
  else orderDetailSectionErrors.value.push('账单资料')
  if (logistics.status === 'fulfilled') orderLogistics.value = logistics.value.data
  else orderDetailSectionErrors.value.push('物流资料')
  orderDetailState.value = { loading: false, error: orderDetailSectionErrors.value.length === requests.length ? '订单关联资料暂时无法加载' : '' }
}

async function sendOrderReply() {
  const orderId = selectedOrder.value?.order_id
  const content = orderReplyDraft.value.trim()
  if (!orderId || !content || orderReplySending.value) return
  orderReplySending.value = true
  orderReplyError.value = ''
  orderReplyResult.value = ''
  try {
    await apiFetch<MessageItem>(`/orders/${orderId}/messages`, {
      method: 'POST', body: JSON.stringify({ content, mention_user_ids: [] })
    })
    if (selectedOrder.value?.order_id !== orderId) return
    orderReplyDraft.value = ''
    orderMessages.value = (await apiFetch<MessageItem[]>(`/orders/${orderId}/messages`)).data
    orderReplyResult.value = '消息已发送并保存到订单会话。'
  } catch (error) {
    orderReplyError.value = detailError(error, '消息发送失败')
  } finally {
    orderReplySending.value = false
  }
}

async function previewOrderFile(file: OrderFile) {
  pageError.value = ''
  try {
    const payload = await apiFetch<PreviewResponse>(`/files/${file.file_id}/preview-url`)
    window.open(payload.data.preview_url, '_blank', 'noopener,noreferrer')
  } catch (error) {
    pageError.value = detailError(error, '文件预览失败')
  }
}

function openInquiryForOrder(orderId: number) {
  inquiryOrderId.value = orderId
  emit('navigate', '/cs/inquiries')
}

async function selectTranslationOrder(order: OrderItem) {
  translationOrderId.value = order.order_id
  translationTab.value = 'INFO'
  const customerText = orderFormValue(order, ['instruction', 'customer_instruction', 'description', 'notes', 'special_requirements', 'doctor_note'])
  translationSource.value = customerText
  productionNoteDraft.value = order.production_note || ''
  translationDraft.value = ''
  translationFiles.value = []
  translationRequirements.value = []
  const [files, requirements] = await Promise.all([
    safeData<OrderFile[]>(`/orders/${order.order_id}/files`, []),
    safeData<FormRequirement[]>(`/form-configs?product_type=${encodeURIComponent(order.product_type)}`, [])
  ])
  if (translationOrderId.value !== order.order_id) return
  translationFiles.value = files
  translationRequirements.value = requirements.filter((item) => item.status === 'ACTIVE')
  missingInfoItems.value = []
  missingInfoChecked.value = false
}

async function checkMissingInfo() {
  if (!translationOrderId.value) return
  aiLoading.value = true
  pageError.value = ''
  try {
    const payload = await apiFetch<MissingInfoResponse>('/ai/check-missing', {
      method: 'POST', body: JSON.stringify({ order_id: translationOrderId.value })
    })
    missingInfoItems.value = payload.data.missing_items
    missingInfoChecked.value = true
  } catch (error) {
    pageError.value = error instanceof Error ? error.message : '资料检查失败'
  } finally {
    aiLoading.value = false
  }
}

async function generateTranslation() {
  if (!translationOrderId.value || !translationSource.value.trim()) return
  aiLoading.value = true
  pageError.value = ''
  try {
    const payload = await apiFetch<TranslateResponse>('/ai/translate', {
      method: 'POST', body: JSON.stringify({ order_id: translationOrderId.value, source_text: translationSource.value.trim() })
    })
    translationDraft.value = payload.data.translated_text
    pageResult.value = 'AI 翻译草稿已生成，请由翻译人员人工核对。'
  } catch (error) {
    pageError.value = error instanceof Error ? error.message : '翻译草稿生成失败'
  } finally {
    aiLoading.value = false
  }
}

async function generateProductionNote() {
  if (!translationOrderId.value) return
  aiLoading.value = true
  pageError.value = ''
  try {
    const payload = await apiFetch<ProductionNoteResponse>('/ai/production-note', {
      method: 'POST', body: JSON.stringify({ order_id: translationOrderId.value })
    })
    productionNoteDraft.value = payload.data.draft_note
    pageResult.value = '生产信息草稿已生成，保存前需要人工确认。'
  } catch (error) {
    pageError.value = error instanceof Error ? error.message : '生产信息草稿生成失败'
  } finally {
    aiLoading.value = false
  }
}

async function confirmProductionNote() {
  if (!translationOrderId.value || !productionNoteDraft.value.trim()) return
  aiLoading.value = true
  pageError.value = ''
  try {
    const payload = await apiFetch<ProductionNoteConfirmResponse>('/ai/production-note/confirm', {
      method: 'POST',
      body: JSON.stringify({
        order_id: translationOrderId.value,
        draft_note: productionNoteDraft.value.trim(),
        confirmation_note: productionNoteConfirmation.value.trim() || null
      })
    })
    productionNoteDraft.value = payload.data.production_note
    const order = orders.value.find((item) => item.order_id === translationOrderId.value)
    if (order) order.production_note = payload.data.production_note
    pageResult.value = '翻译人员人工确认稿已保存。'
  } catch (error) {
    pageError.value = error instanceof Error ? error.message : '人工确认稿保存失败'
  } finally {
    aiLoading.value = false
  }
}

async function selectDesignOrder(orderId: number) {
  designOrderId.value = orderId
  designDrawerVisible.value = true
  designPreviewUrls.value = {}
  designDetailState.value = { loading: true, error: '' }
  try {
    designDrafts.value = (await apiFetch<DesignDraft[]>(`/orders/${orderId}/design-drafts`)).data
  } catch (error) {
    designDrafts.value = []
    designDetailState.value.error = detailError(error, '设计稿版本加载失败')
  } finally {
    designDetailState.value.loading = false
  }
}

async function reviewDesignDraft(draft: DesignDraft, action: 'APPROVE' | 'REJECT') {
  if (!designOrderId.value) return
  const reason = designRejectReasons.value[draft.draft_id]?.trim() || ''
  if (action === 'REJECT' && !reason) {
    pageError.value = '退回设计稿前请填写修改原因。'
    return
  }
  pageLoading.value = true
  pageError.value = ''
  try {
    await apiFetch<DesignDraft>(`/orders/${designOrderId.value}/design-drafts/${draft.draft_id}/cs-review`, {
      method: 'POST', body: JSON.stringify({ action, cs_reject_reason: action === 'REJECT' ? reason : null })
    })
    await selectDesignOrder(designOrderId.value)
    pageResult.value = action === 'APPROVE' ? '设计稿已通过内部审核，并进入客户确认流程。' : '设计稿已退回并保留修改原因。'
  } catch (error) {
    pageError.value = error instanceof Error ? error.message : '设计稿审核失败'
  } finally {
    pageLoading.value = false
  }
}

async function previewDesignDraft(draft: DesignDraft) {
  const id = fileIds(draft)[0]
  if (!id) return
  pageError.value = ''
  try {
    const payload = await apiFetch<PreviewResponse>(`/files/${id}/preview-url`)
    designPreviewUrls.value[draft.draft_id] = payload.data.preview_url
    window.open(payload.data.preview_url, '_blank', 'noopener,noreferrer')
  } catch (error) {
    pageError.value = error instanceof Error ? error.message : '设计稿预览失败'
  }
}

async function selectClinic(clinicId: number) {
  selectedClinicId.value = clinicId
  customerDrawerVisible.value = true
  customerDetailState.value = { loading: true, error: '' }
  try {
    const [clinic, preference] = await Promise.all([
      apiFetch<ClinicItem>(`/clinics/${clinicId}`),
      apiFetch<ClinicPreference>(`/clinics/${clinicId}/preference`)
    ])
    selectedClinic.value = clinic.data
    clinicPreference.value = preference.data
    clinicPreferenceDraft.value = { ...preference.data.preferences }
    clinicPreferenceTextDraft.value = Object.fromEntries(Object.entries(preference.data.preferences).map(([key, value]) => [key, preferenceText(value)]))
  } catch (error) {
    selectedClinic.value = clinics.value.find((item) => item.clinic_id === clinicId) || null
    clinicPreference.value = null
    clinicPreferenceDraft.value = {}
    clinicPreferenceTextDraft.value = {}
    customerDetailState.value.error = detailError(error, '客户详情加载失败')
  } finally {
    customerDetailState.value.loading = false
  }
}

async function saveClinicPreference() {
  if (!selectedClinicId.value) return
  pageLoading.value = true
  pageError.value = ''
  try {
    clinicPreferenceDraft.value = Object.fromEntries(
      clinicPreferenceKeys.value.map((key) => [key, parsePreferenceText(clinicPreferenceTextDraft.value[key] || '')])
    )
    const payload = await apiFetch<ClinicPreference>(`/clinics/${selectedClinicId.value}/preference`, {
      method: 'PUT', body: JSON.stringify(clinicPreferenceDraft.value)
    })
    clinicPreference.value = payload.data
    clinicPreferenceDraft.value = { ...payload.data.preferences }
    clinicPreferenceTextDraft.value = Object.fromEntries(Object.entries(payload.data.preferences).map(([key, value]) => [key, preferenceText(value)]))
    pageResult.value = '客户制作偏好已保存，不会反向修改历史订单。'
  } catch (error) {
    pageError.value = error instanceof SyntaxError ? '偏好中的结构化内容不是有效 JSON，请检查括号和引号。' : detailError(error, '客户偏好保存失败')
  } finally {
    pageLoading.value = false
  }
}

async function selectProduct(productId: number) {
  selectedProductId.value = productId
  productDrawerVisible.value = true
  productDetailState.value = { loading: true, error: '' }
  const product = products.value.find((item) => item.product_id === productId)
  if (product) {
    productEditName.value = product.product_name
    productEditMaterial.value = product.material_spec || ''
    productEditPrice.value = product.base_price_cents / 100
    productEditStatus.value = product.status
    productEditNote.value = product.price_note || ''
    try {
      productRequirements.value = (await apiFetch<FormRequirement[]>(`/form-configs?product_type=${encodeURIComponent(product.product_type)}`)).data
    } catch (error) {
      productRequirements.value = []
      productDetailState.value.error = detailError(error, '医生下单要求加载失败')
    } finally {
      productDetailState.value.loading = false
    }
  } else {
    productDetailState.value = { loading: false, error: '未找到该产品资料' }
  }
}

async function saveProduct() {
  const product = products.value.find((item) => item.product_id === selectedProductId.value)
  if (!product) return
  pageLoading.value = true
  pageError.value = ''
  try {
    const payload = await apiFetch<ProductItem>(`/products/${product.product_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        product_name: productEditName.value.trim(),
        material_spec: productEditMaterial.value.trim() || null,
        base_price_cents: Math.round(Number(productEditPrice.value || 0) * 100),
        currency: product.currency,
        status: productEditStatus.value,
        price_note: productEditNote.value.trim() || null
      })
    })
    products.value = products.value.map((item) => item.product_id === payload.data.product_id ? payload.data : item)
    pageResult.value = '已有产品资料已保存。'
  } catch (error) {
    pageError.value = error instanceof Error ? error.message : '产品资料保存失败'
  } finally {
    pageLoading.value = false
  }
}

async function selectBillingOrder(orderId: number) {
  selectedBillingOrderId.value = orderId
  billingDrawerVisible.value = true
  billingDetailState.value = { loading: true, error: '' }
  billingDetailErrors.value = []
  selectedBill.value = null
  selectedPayments.value = []
  const [bill, payments] = await Promise.allSettled([
    apiFetch<BillInfo>(`/orders/${orderId}/bill`),
    apiFetch<PaymentItem[]>(`/orders/${orderId}/payments`)
  ])
  if (selectedBillingOrderId.value !== orderId) return
  if (bill.status === 'fulfilled') selectedBill.value = bill.value.data
  else billingDetailErrors.value.push('账单资料')
  if (payments.status === 'fulfilled') selectedPayments.value = payments.value.data
  else billingDetailErrors.value.push('收款记录')
  billingDetailState.value = { loading: false, error: billingDetailErrors.value.length === 2 ? '账单与收款资料暂时无法加载' : '' }
}

function selectDeliveryOrder(item: DeliveryItem) {
  selectedDeliveryOrderId.value = item.order_id
  carrierDraft.value = item.carrier || ''
  trackingDraft.value = item.tracking_no || ''
  logisticsFollowUpDraft.value = item.last_follow_up_note || ''
  shippingDialogVisible.value = false
  deliveryDrawerVisible.value = true
}

async function selectOutsourcing(item: OutsourcingItem) {
  selectedOutsourcingId.value = item.outsourcing_id
  outsourcingDrawerVisible.value = true
  outsourcingDetailState.value = { loading: true, error: '' }
  try {
    const detail = (await apiFetch<OutsourcingItem>(`/production/outsourcing/${encodeURIComponent(item.batch_no)}`)).data
    if (selectedOutsourcingId.value === item.outsourcing_id) {
      outsourcingItems.value = outsourcingItems.value.map((existing) => existing.outsourcing_id === detail.outsourcing_id ? detail : existing)
    }
  } catch (error) {
    outsourcingDetailState.value.error = detailError(error, '外协详情加载失败')
  } finally {
    outsourcingDetailState.value.loading = false
  }
}

async function createPaymentRecord() {
  if (!selectedBillingOrderId.value || !paymentAmountYuan.value || paymentAmountYuan.value <= 0) return
  pageLoading.value = true
  pageError.value = ''
  try {
    await apiFetch<PaymentItem>(`/orders/${selectedBillingOrderId.value}/payments`, {
      method: 'POST', body: JSON.stringify({
        amount_cents: Math.round(paymentAmountYuan.value * 100), currency: 'CNY',
        payment_method: paymentMethod.value, payment_note: paymentNote.value.trim() || null
      })
    })
    paymentAmountYuan.value = null
    paymentNote.value = ''
    await selectBillingOrder(selectedBillingOrderId.value)
    pageResult.value = '收款记录已保存，历史记录保持可追溯。'
  } catch (error) {
    pageError.value = error instanceof Error ? error.message : '收款记录保存失败'
  } finally {
    pageLoading.value = false
  }
}

async function shipSelectedOrder() {
  if (!selectedDeliveryOrderId.value || !carrierDraft.value.trim() || !trackingDraft.value.trim()) return
  pageLoading.value = true
  pageError.value = ''
  try {
    await apiFetch<LogisticsInfo>(`/orders/${selectedDeliveryOrderId.value}/logistics`, {
      method: 'POST', body: JSON.stringify({ carrier: carrierDraft.value.trim(), tracking_no: trackingDraft.value.trim() })
    })
    await loadDelivery()
    const refreshed = deliveryItems.value.find((item) => item.order_id === selectedDeliveryOrderId.value)
    if (refreshed) selectDeliveryOrder(refreshed)
    shippingDialogVisible.value = false
    pageResult.value = '发货信息已登记，医生端将看到脱敏物流信息。'
  } catch (error) {
    pageError.value = error instanceof Error ? error.message : '发货登记失败'
  } finally {
    pageLoading.value = false
  }
}

async function saveLogisticsFollowUp() {
  if (!selectedDeliveryOrderId.value || !logisticsFollowUpDraft.value.trim()) return
  pageLoading.value = true
  pageError.value = ''
  try {
    await apiFetch<DeliveryItem>(`/orders/${selectedDeliveryOrderId.value}/logistics/exception`, {
      method: 'POST', body: JSON.stringify({ logistics_status: logisticsStatusDraft.value, follow_up_note: logisticsFollowUpDraft.value.trim() })
    })
    await loadDelivery()
    const refreshed = deliveryItems.value.find((item) => item.order_id === selectedDeliveryOrderId.value)
    if (refreshed) {
      selectedDeliveryOrderId.value = refreshed.order_id
      logisticsFollowUpDraft.value = refreshed.last_follow_up_note || ''
    }
    pageResult.value = '配送异常跟进已保存为内部记录。'
  } catch (error) {
    pageError.value = error instanceof Error ? error.message : '配送跟进保存失败'
  } finally {
    pageLoading.value = false
  }
}

async function markNotification(notification: NotificationItem) {
  if (!notification.read_at) {
    await apiFetch<NotificationItem>(`/notifications/${notification.notification_id}/read`, { method: 'POST' })
    await loadNotifications()
  }
  if (notification.order_id) {
    const order = orders.value.find((item) => item.order_id === notification.order_id)
    if (order) await openOrder(order)
    emit('navigate', '/cs/orders')
  }
}

async function markAllNotifications() {
  await apiFetch<{ updated_count: number }>('/notifications/read-all', { method: 'POST' })
  await loadNotifications()
  pageResult.value = '全部通知已标记为已读；业务状态没有被修改。'
}

async function loadRoute(route: string) {
  if (!props.token) return
  pageLoading.value = true
  pageError.value = ''
  pageResult.value = ''
  try {
    if (route === '/cs/orders') await Promise.all([loadOrders(), loadOrderAttention()])
    if (route === '/cs/information-translation') {
      await loadOrders()
      const first = orders.value.find((item) => item.order_id === translationOrderId.value)
        || filteredTranslationOrders.value[0]
        || orders.value[0]
      if (first) await selectTranslationOrder(first)
    }
    if (route === '/cs/designs') {
      await loadOrders()
      designDrawerVisible.value = false
    }
    if (route === '/cs/inquiries') await loadInquiryBase()
    if (route === '/cs/customers') {
      await Promise.all([loadClinics(), loadOrders()])
      customerDrawerVisible.value = false
    }
    if (route === '/cs/products') {
      await loadProducts()
      productDrawerVisible.value = false
    }
    if (route === '/cs/billing') {
      await Promise.all([loadOrders(), loadDelivery()])
      billingDrawerVisible.value = false
    }
    if (route === '/cs/delivery') {
      await loadDelivery()
      deliveryDrawerVisible.value = false
    }
    if (route === '/cs/outsourcing') {
      await loadOutsourcing()
      outsourcingDrawerVisible.value = false
    }
    if (route === '/cs/notifications') await Promise.all([loadOrders(), loadNotifications()])
    if (route === '/cs/search') await Promise.all([loadOrders(), loadClinics(), loadProducts(), loadDelivery(), loadOutsourcing()])
  } catch (error) {
    pageError.value = error instanceof Error ? error.message : '页面数据加载失败'
  } finally {
    pageLoading.value = false
  }
}

const filteredOrders = computed(() => {
  const keyword = orderKeyword.value.trim().toLowerCase()
  return orders.value.filter((order) => {
    const matchesKeyword = !keyword || [order.order_no, order.clinic_name, order.product_type, orderFormValue(order, ['patient_name'])]
      .some((value) => String(value || '').toLowerCase().includes(keyword))
    if (!matchesKeyword) return false
    if (orderFilter.value === 'NEW') return registrationStatus(order) === 'NEW'
    if (orderFilter.value === 'REGISTERED') return registrationStatus(order) === 'REGISTERED'
    if (orderFilter.value === 'QUESTION') return attentionItems.value.some((item) => item.order_id === order.order_id)
    if (orderFilter.value === 'EXCEPTION') return Boolean(order.reject_reason)
    return true
  }).sort((a, b) => Number(registrationStatus(b) === 'NEW') - Number(registrationStatus(a) === 'NEW'))
})

const orderFilterCounts = computed(() => ({
  ALL: orders.value.length,
  NEW: orders.value.filter((item) => registrationStatus(item) === 'NEW').length,
  REGISTERED: orders.value.filter((item) => registrationStatus(item) === 'REGISTERED').length,
  QUESTION: attentionItems.value.length,
  EXCEPTION: orders.value.filter((item) => Boolean(item.reject_reason)).length
}))

const orderFilterOptions: Array<{ key: 'ALL' | 'NEW' | 'REGISTERED' | 'QUESTION' | 'EXCEPTION'; label: string }> = [
  { key: 'ALL', label: '全部订单' },
  { key: 'NEW', label: '新订单' },
  { key: 'REGISTERED', label: '已登记' },
  { key: 'QUESTION', label: '有问单' },
  { key: 'EXCEPTION', label: '异常' }
]

function orderFilterCount(key: 'ALL' | 'NEW' | 'REGISTERED' | 'QUESTION' | 'EXCEPTION') {
  return orderFilterCounts.value[key]
}

const notificationFilterOptions: Array<{ key: 'ALL' | 'UNREAD' | 'ORDER' | 'MESSAGE' | 'DESIGN' | 'BILLING'; label: string }> = [
  { key: 'ALL', label: '全部' },
  { key: 'UNREAD', label: '未读' },
  { key: 'ORDER', label: '订单' },
  { key: 'MESSAGE', label: '问单' },
  { key: 'DESIGN', label: '设计稿' },
  { key: 'BILLING', label: '账单' }
]

const selectedTranslationOrder = computed(() => orders.value.find((item) => item.order_id === translationOrderId.value) || null)
const selectedDesignOrder = computed(() => orders.value.find((item) => item.order_id === designOrderId.value) || null)
const selectedProduct = computed(() => products.value.find((item) => item.product_id === selectedProductId.value) || null)
const selectedDelivery = computed(() => deliveryItems.value.find((item) => item.order_id === selectedDeliveryOrderId.value) || null)
const selectedOutsourcing = computed(() => outsourcingItems.value.find((item) => item.outsourcing_id === selectedOutsourcingId.value) || null)
const selectedBillingOrder = computed(() => orders.value.find((item) => item.order_id === selectedBillingOrderId.value) || null)
const selectedClinicOrders = computed(() => orders.value.filter((item) => item.clinic_id === selectedClinicId.value))

const orderDetailFields = computed<ReviewDisplayField[]>(() => {
  if (!selectedOrder.value) return []
  let extraIndex = 0
  return Object.entries(selectedOrder.value.form_data || {})
    .filter(([key, value]) => !isInternalReviewField(key) && Boolean(reviewFieldValue(value)))
    .map(([key, value]) => {
      const text = reviewFieldValue(value)
      if (!reviewFieldLabels[key]) extraIndex += 1
      return {
        key,
        label: reviewFieldLabels[key] || `补充资料 ${extraIndex}`,
        value: text,
        required: false,
        missing: false,
        long: text.length > 34 || /instruction|note|description|requirement/.test(key)
      }
    })
})

const orderTimeline = computed<TimelineStep[]>(() => {
  const order = selectedOrder.value
  if (!order) return []
  const steps = [
    { key: 'submitted', icon: '✓', label: '客户提交订单', detail: compactDateTime(order.created_at) },
    { key: 'review', icon: '✏️', label: '客服登记与资料审核', detail: registrationStatus(order) === 'NEW' ? '当前等待客服处理' : '已进入后续业务处理' },
    { key: 'production-review', icon: '🔍', label: '生产审核', detail: '依据真实订单状态推进' },
    { key: 'production', icon: '⚙️', label: '生产制作', detail: '生产节点由工厂端记录' },
    { key: 'design', icon: '🎨', label: '设计确认', detail: orderDrafts.value.length ? `${orderDrafts.value.length} 个真实版本` : '尚无设计版本' },
    { key: 'quality', icon: '✅', label: '终检放行', detail: '由出检记录决定' },
    { key: 'billing', icon: '💳', label: '账单与收款', detail: statusLabel(orderBill.value?.payment_status) },
    { key: 'shipping', icon: '🚀', label: '配送交付', detail: statusLabel(orderLogistics.value?.logistics_status) }
  ]
  const statusIndex: Record<string, number> = {
    PENDING_CS_REVIEW: 1,
    PENDING_PRODUCTION_REVIEW: 2,
    PENDING_DOCTOR_CONFIRM: 4,
    PROCESS_INSTANCE_CREATED: 3,
    PRODUCING: 3,
    SHIPPED: 7,
    COMPLETED: 7
  }
  const activeIndex = statusIndex[order.internal_status] ?? 1
  return steps.map((step, index) => ({ ...step, state: index < activeIndex ? 'done' : index === activeIndex ? 'current' : 'pending' })) as TimelineStep[]
})

const clinicPreferenceKeys = computed(() => ['color', 'contact', 'margin', 'shape', 'material', 'note'])
const clinicUnknownPreferences = computed(() => {
  const known = new Set(clinicPreferenceKeys.value)
  return Object.entries(clinicPreference?.value?.preferences || {}).filter(([key, value]) => !known.has(key) && value != null)
})

const receivedAmountCents = computed(() => selectedPayments.value.reduce((sum, item) => sum + item.amount_cents, 0))
const outstandingAmountCents = computed(() => Math.max(0, (selectedBill.value?.amount_cents || 0) - receivedAmountCents.value))
const billingContradiction = computed(() => {
  if (!selectedBill.value) return ''
  const billAmount = selectedBill.value.amount_cents
  if (billAmount != null && receivedAmountCents.value > billAmount) return '累计收款已经超过账单金额，请先核对收款记录。'
  if (selectedBill.value.payment_status === 'PAID' && billAmount != null && receivedAmountCents.value < billAmount) return '账单标记为已收款，但收款记录合计不足。'
  if (selectedBill.value.payment_status !== 'PAID' && billAmount != null && receivedAmountCents.value >= billAmount) return '收款记录已经覆盖账单金额，但账单状态尚未同步。'
  return ''
})
const canRecordPayment = computed(() => Boolean(
  selectedBill.value?.bill_id
  && !billingContradiction.value
  && selectedBill.value.payment_status !== 'PAID'
  && outstandingAmountCents.value > 0
))

const carrierOptions = [
  { name: '顺丰速运', mark: 'SF', icon: '📦' },
  { name: '京东物流', mark: 'JD', icon: '🚚' },
  { name: 'EMS', mark: 'EMS', icon: '✉️' },
  { name: '其他承运商', mark: '＋', icon: '🛣️' }
]
const deliveryPaymentReady = computed(() => ['PAID', 'NO_PAYMENT_REQUIRED'].includes(selectedDelivery.value?.payment_status || ''))
const deliveryCanRegister = computed(() => Boolean(
  selectedDelivery.value
  && selectedDelivery.value.logistics_status === 'PENDING'
  && deliveryPaymentReady.value
))
const deliveryAlreadyShipped = computed(() => Boolean(selectedDelivery.value && selectedDelivery.value.logistics_status !== 'PENDING'))

function designCanReview(draft: DesignDraft) {
  return ['PENDING_CS_REVIEW', 'PENDING_CS_REVIEW_DESIGN'].includes(draft.status)
}

function productEmoji(type?: string | null) {
  if (/IMPLANT/.test(type || '')) return '🦷'
  if (/BRIDGE/.test(type || '')) return '🌉'
  if (/DENTURE|REMOVABLE/.test(type || '')) return '😁'
  if (/ALIGNER|ORTHODONT/.test(type || '')) return '✨'
  return '👑'
}

const conversationOrders = computed(() => {
  const keyword = inquiryKeyword.value.trim().toLowerCase()
  const waitingOrderIds = new Set(attentionItems.value.map((item) => item.order_id))
  const reviewOrderIds = new Set(pendingMessages.value.map((item) => item.order_id))
  return orders.value.filter((order) => {
    if (inquiryTab.value === 'WAITING' && !waitingOrderIds.has(order.order_id)) return false
    if (inquiryTab.value === 'REVIEW' && !reviewOrderIds.has(order.order_id)) return false
    return !keyword || [order.order_no, order.clinic_name, productLabel(order.product_type)]
      .some((value) => value.toLowerCase().includes(keyword))
  })
})

const filteredTranslationOrders = computed(() => {
  const keyword = translationKeyword.value.trim().toLowerCase()
  return orders.value.filter((order) => {
    if (translationFilter.value === 'PENDING' && order.production_note?.trim()) return false
    if (translationFilter.value === 'CONFIRMED' && !order.production_note?.trim()) return false
    return !keyword || [order.order_no, order.clinic_name, productLabel(order.product_type)]
      .some((value) => value.toLowerCase().includes(keyword))
  }).sort((left, right) => {
    const confirmationOrder = Number(Boolean(left.production_note?.trim())) - Number(Boolean(right.production_note?.trim()))
    if (confirmationOrder !== 0) return confirmationOrder
    return new Date(left.created_at || 0).getTime() - new Date(right.created_at || 0).getTime()
  })
})

const translationReviewFields = computed<ReviewDisplayField[]>(() => {
  const order = selectedTranslationOrder.value
  if (!order) return []

  const result: ReviewDisplayField[] = []
  const usedKeys = new Set<string>()
  const activeRequirements = [...translationRequirements.value].sort((left, right) => left.sort_order - right.sort_order)

  for (const requirement of activeRequirements) {
    if (isInternalReviewField(requirement.field_key)) continue
    const value = reviewFieldValue(order.form_data?.[requirement.field_key])
    result.push({
      key: requirement.field_key,
      label: requirement.field_label || reviewFieldLabels[requirement.field_key] || '订单信息',
      value: value || '未填写',
      required: requirement.is_required,
      missing: requirement.is_required && !value,
      long: requirement.field_type === 'textarea' || value.length > 34
    })
    usedKeys.add(requirement.field_key)
  }

  let extraIndex = 0
  for (const [key, rawValue] of Object.entries(order.form_data || {})) {
    if (usedKeys.has(key) || isInternalReviewField(key)) continue
    const value = reviewFieldValue(rawValue)
    if (!value) continue
    extraIndex += 1
    result.push({
      key,
      label: reviewFieldLabels[key] || `补充信息 ${extraIndex}`,
      value,
      required: false,
      missing: false,
      long: ['instruction', 'customer_instruction', 'description', 'notes', 'special_requirements', 'doctor_note'].includes(key) || value.length > 34
    })
  }

  return result
})

const translationRequiredMissingCount = computed(() => translationReviewFields.value.filter((item) => item.missing).length)

const translationReviewChecklist = computed(() => {
  const order = selectedTranslationOrder.value
  if (!order) return []
  const hasManufacturingParameters = Boolean(
    orderFormValue(order, ['tooth_position', 'tooth', 'teeth'])
    && (orderFormValue(order, ['material']) || orderFormValue(order, ['shade', 'color']))
  )
  return [
    {
      label: '必填资料',
      value: translationRequiredMissingCount.value ? `${translationRequiredMissingCount.value} 项待补充` : '已填写完整',
      ok: translationRequiredMissingCount.value === 0
    },
    { label: '制作参数', value: hasManufacturingParameters ? '已填写关键参数' : '关键参数待核对', ok: hasManufacturingParameters },
    { label: '客户文字', value: translationSource.value.trim() ? '有内容需要翻译' : '未单独填写外文指示', ok: true },
    { label: '关联附件', value: translationFiles.value.length ? `${translationFiles.value.length} 个附件` : '未上传附件', ok: translationFiles.value.length > 0 }
  ]
})

const translationFilterCounts = computed(() => ({
  ALL: orders.value.length,
  PENDING: orders.value.filter((order) => !order.production_note?.trim()).length,
  CONFIRMED: orders.value.filter((order) => Boolean(order.production_note?.trim())).length
}))

const filteredClinics = computed(() => {
  const keyword = customerKeyword.value.trim().toLowerCase()
  return clinics.value.filter((clinic) => {
    const isIncomplete = !clinic.contact_name?.trim() || !clinic.contact_phone?.trim() || clinic.preference_count === 0
    const isInactive = clinic.status === 'INACTIVE'
    if (customerFilter.value === 'INCOMPLETE' && !isIncomplete) return false
    if (customerFilter.value === 'INACTIVE' && !isInactive) return false
    return !keyword || [clinic.clinic_name, clinic.contact_name, clinic.contact_phone]
      .some((value) => String(value || '').toLowerCase().includes(keyword))
  })
})

const incompleteClinics = computed(() => clinics.value.filter((clinic) =>
  !clinic.contact_name?.trim() || !clinic.contact_phone?.trim() || clinic.preference_count === 0))
const inactiveClinics = computed(() => clinics.value.filter((clinic) => clinic.status === 'INACTIVE'))

const filteredProducts = computed(() => {
  const keyword = productKeyword.value.trim().toLowerCase()
  return products.value.filter((product) => !keyword || [product.product_name, product.product_type, product.material_spec]
    .some((value) => String(value || '').toLowerCase().includes(keyword)))
})

const filteredDesignOrders = computed(() => {
  const keyword = designKeyword.value.trim().toLowerCase()
  return orders.value.filter((order) => !keyword || [order.order_no, order.clinic_name, productLabel(order.product_type)]
    .some((value) => value.toLowerCase().includes(keyword)))
})

const filteredDelivery = computed(() => deliveryItems.value.filter((item) => deliveryStatus.value === 'ALL' || item.logistics_status === deliveryStatus.value))
const filteredOutsourcing = computed(() => outsourcingItems.value.filter((item) => outsourcingStatus.value === 'ALL' || item.status === outsourcingStatus.value))

function setDeliveryStatus(status: string) {
  deliveryStatus.value = status
  if (selectedDeliveryOrderId.value && !filteredDelivery.value.some((item) => item.order_id === selectedDeliveryOrderId.value)) {
    selectedDeliveryOrderId.value = null
    deliveryDrawerVisible.value = false
  }
}

function setOutsourcingStatus(status: string) {
  outsourcingStatus.value = status
  if (selectedOutsourcingId.value && !filteredOutsourcing.value.some((item) => item.outsourcing_id === selectedOutsourcingId.value)) {
    selectedOutsourcingId.value = null
    outsourcingDrawerVisible.value = false
  }
}

const filteredNotifications = computed(() => notifications.value.filter((item) => {
  if (notificationFilter.value === 'UNREAD') return !item.read_at
  const event = item.event.toUpperCase()
  if (notificationFilter.value === 'ORDER') return event.includes('ORDER')
  if (notificationFilter.value === 'MESSAGE') return event.includes('MESSAGE')
  if (notificationFilter.value === 'DESIGN') return event.includes('DESIGN')
  if (notificationFilter.value === 'BILLING') return event.includes('BILL') || event.includes('PAYMENT')
  return true
}))

const filteredHelpTopics = computed(() => {
  const keyword = helpKeyword.value.trim().toLowerCase()
  if (!keyword) return helpTopics
  return helpTopics.filter((topic) => [topic.label, topic.title, topic.intro, ...topic.articles.flatMap((item) => [item.title, item.body])]
    .some((value) => value.toLowerCase().includes(keyword)))
})

const selectedHelpTopic = computed(() => helpTopics.find((item) => item.key === helpTopic.value) || helpTopics[0])

const searchResults = computed(() => {
  const keyword = searchInput.value.trim().toLowerCase()
  if (keyword.length < 2) return []
  const results: Array<{ type: string; title: string; detail: string; route: string; id: number }> = []
  orders.value.forEach((order) => {
    if ([order.order_no, order.clinic_name, productLabel(order.product_type), orderFormValue(order, ['patient_name'])]
      .some((value) => String(value || '').toLowerCase().includes(keyword))) {
      results.push({ type: '订单', title: order.order_no, detail: `${order.clinic_name} · ${productLabel(order.product_type)}`, route: '/cs/orders', id: order.order_id })
    }
  })
  clinics.value.forEach((clinic) => {
    if ([clinic.clinic_name, clinic.contact_name, clinic.contact_phone].some((value) => String(value || '').toLowerCase().includes(keyword))) {
      results.push({ type: '客户', title: clinic.clinic_name, detail: clinic.contact_name || '联系人未设置', route: '/cs/customers', id: clinic.clinic_id })
    }
  })
  products.value.forEach((product) => {
    if ([product.product_name, product.product_type, product.material_spec].some((value) => String(value || '').toLowerCase().includes(keyword))) {
      results.push({ type: '产品', title: product.product_name, detail: product.material_spec || '材料规格待完善', route: '/cs/products', id: product.product_id })
    }
  })
  outsourcingItems.value.forEach((item) => {
    if ([item.batch_no, item.order_no, item.supplier_name, item.item_name].some((value) => String(value || '').toLowerCase().includes(keyword))) {
      results.push({ type: '外协', title: item.batch_no, detail: `${item.order_no} · ${item.supplier_name}`, route: '/cs/outsourcing', id: item.outsourcing_id })
    }
  })
  return results.slice(0, 80)
})

async function openSearchResult(result: { type: string; route: string; id: number }) {
  if (result.type === '订单') {
    const order = orders.value.find((item) => item.order_id === result.id)
    if (order) await openOrder(order)
  }
  if (result.type === '客户') selectedClinicId.value = result.id
  if (result.type === '产品') selectedProductId.value = result.id
  if (result.type === '外协') selectedOutsourcingId.value = result.id
  emit('navigate', result.route)
}

watch(() => props.searchKeyword, (value) => { searchInput.value = value })
watch([() => props.activeRoute, () => props.token], ([route]) => { void loadRoute(route) }, { immediate: true })
watch([orderFilter, orderKeyword], () => {
  if (selectedOrder.value && !filteredOrders.value.some((item) => item.order_id === selectedOrder.value?.order_id)) {
    orderDrawerVisible.value = false
  }
})
watch(productKeyword, () => {
  if (selectedProductId.value && !filteredProducts.value.some((item) => item.product_id === selectedProductId.value)) {
    productDrawerVisible.value = false
  }
})
watch(designKeyword, () => {
  if (designOrderId.value && !filteredDesignOrders.value.some((item) => item.order_id === designOrderId.value)) {
    designDrawerVisible.value = false
  }
})
watch([translationKeyword, translationFilter], () => {
  if (translationOrderId.value && !filteredTranslationOrders.value.some((item) => item.order_id === translationOrderId.value)) {
    translationOrderId.value = null
  }
})
watch([customerKeyword, customerFilter], () => {
  if (selectedClinicId.value && !filteredClinics.value.some((item) => item.clinic_id === selectedClinicId.value)) {
    customerDrawerVisible.value = false
  }
})
watch(billingTab, (tab) => {
  if (tab === 'MONTHLY') billingDrawerVisible.value = false
})
</script>

<template>
  <div class="cs-r-page" :data-route="activeRoute">
    <div v-if="pageError" class="cs-r-feedback is-error" role="alert"><strong>页面暂时无法完成操作</strong><span>{{ pageError }}</span><button type="button" @click="loadRoute(activeRoute)">重新加载</button></div>
    <div v-if="pageResult" class="cs-r-feedback is-success" role="status"><span>{{ pageResult }}</span><button type="button" aria-label="关闭提示" @click="pageResult = ''">×</button></div>

    <template v-if="activeRoute === '/cs/orders'">
      <header class="cs-r-heading"><div><h1>订单管理</h1><p>查看客户提交的新订单、登记状态和后续业务进度。</p></div><span class="cs-r-count">{{ orderTotal }} 单</span></header>
      <section class="cs-r-filter-card">
        <div class="cs-r-segmented" aria-label="订单快捷筛选">
          <button v-for="item in orderFilterOptions" :key="item.key" type="button" :class="{ active: orderFilter === item.key }" @click="orderFilter = item.key">{{ item.label }} <b>{{ orderFilterCount(item.key) }}</b></button>
        </div>
      </section>
      <section class="cs-r-table-card">
        <header class="cs-r-table-toolbar"><div><h3>订单列表</h3><span>{{ filteredOrders.length }} / {{ orderTotal }} 单</span></div><label class="cs-r-search"><span>⌕</span><input v-model="orderKeyword" type="search" placeholder="搜索订单号、客户、患者或产品" aria-label="搜索订单"></label></header>
        <div v-if="pageLoading" class="cs-r-state">正在加载真实订单…</div>
        <div v-else-if="filteredOrders.length === 0" class="cs-r-state"><strong>没有符合条件的订单</strong><span>调整筛选条件后重试。</span></div>
        <table v-else data-testid="cs-orders-table">
          <colgroup><col style="width:17%"><col style="width:15%"><col style="width:15%"><col style="width:11%"><col style="width:17%"><col style="width:13%"><col style="width:12%"></colgroup>
          <thead><tr><th>订单编号</th><th>客户 / 患者</th><th>产品 / 牙位</th><th>登记状态</th><th>信息状态</th><th>订单阶段</th><th>操作</th></tr></thead>
          <tbody><tr v-for="order in filteredOrders" :key="order.order_id" :class="{ 'is-new': registrationStatus(order) === 'NEW' }" @click="openOrder(order)">
            <td><strong>{{ order.order_no }}</strong><small>#{{ order.order_id }}</small></td>
            <td><strong>{{ order.clinic_name }}</strong><small>{{ orderFormValue(order, ['patient_name']) || '患者信息按权限显示' }}</small></td>
            <td><strong>{{ productLabel(order.product_type) }}</strong><small>{{ orderFormValue(order, ['tooth_position','tooth','teeth']) || '牙位待确认' }}</small></td>
            <td><span class="cs-r-badge" :class="registrationStatus(order) === 'NEW' ? 'is-amber' : 'is-green'">{{ registrationStatus(order) === 'NEW' ? '新订单' : '已登记' }}</span></td>
            <td>{{ informationStatus(order) }}</td><td><span class="cs-r-badge is-violet">{{ statusLabel(order.internal_status) }}</span></td>
            <td><button class="cs-r-link" type="button" @click.stop="openOrder(order)">查看</button></td>
          </tr></tbody>
        </table>
      </section>
      <el-drawer v-model="orderDrawerVisible" size="540px" :with-header="false" class="cs-r-drawer" modal-class="cs-r-drawer-overlay">
        <div v-if="selectedOrder" class="cs-r-drawer-shell">
          <header class="cs-r-detail-head"><div><small>ORDER DETAILS</small><h2>{{ selectedOrder.order_no }}</h2></div><div><span class="cs-r-badge is-violet">{{ statusLabel(selectedOrder.internal_status) }}</span><button type="button" aria-label="关闭订单详情" @click="orderDrawerVisible = false">×</button></div></header>
          <div v-if="orderDetailState.loading" class="cs-r-state cs-r-detail-loading"><span class="cs-r-loading-orbit">🦷</span><strong>正在读取订单关联资料</strong><span>附件、设计、账单和物流会分别核对。</span></div>
          <template v-else>
            <section v-if="orderDetailState.error" class="cs-r-detail-alert is-danger"><span>!</span><div><strong>关联资料加载失败</strong><p>{{ orderDetailState.error }}</p></div><button type="button" @click="openOrder(selectedOrder)">重试</button></section>
            <section v-else-if="orderDetailSectionErrors.length" class="cs-r-detail-alert is-warning"><span>⚠️</span><div><strong>部分资料暂未加载</strong><p>{{ orderDetailSectionErrors.join('、') }}暂时不可用，其余真实资料仍可查看。</p></div><button type="button" @click="openOrder(selectedOrder)">重试</button></section>
            <section class="cs-r-summary-grid cs-r-detail-summary"><div><span>患者</span><strong>{{ orderFormValue(selectedOrder,['patient_name']) || '按权限未显示' }}</strong></div><div><span>产品</span><strong>{{ productLabel(selectedOrder.product_type) }}</strong></div><div><span>诊所</span><strong>{{ selectedOrder.clinic_name }}</strong></div><div><span>建立时间</span><strong>{{ compactDateTime(selectedOrder.created_at) }}</strong></div></section>
            <section v-if="selectedOrder.reject_reason || registrationStatus(selectedOrder)==='NEW'" class="cs-r-detail-alert" :class="selectedOrder.reject_reason ? 'is-danger' : 'is-warning'"><span>{{ selectedOrder.reject_reason ? '!' : '✏️' }}</span><div><strong>{{ selectedOrder.reject_reason ? '订单存在退回记录' : '等待客服登记与资料核对' }}</strong><p>{{ selectedOrder.reject_reason || '先核对客户资料、附件和制作参数，再进入信息审核/翻译。' }}</p></div></section>
            <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">🧭</span><div><h3>生产与交付进度</h3><p>节点依据订单和关联记录的真实状态展示</p></div></div></div><div class="cs-r-detail-timeline"><article v-for="step in orderTimeline" :key="step.key" :class="`is-${step.state}`"><span class="cs-r-timeline-node">{{ step.icon }}</span><div><strong>{{ step.label }}</strong><small>{{ step.detail }}</small></div></article></div></section>
            <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">🦷</span><div><h3>临床与制作参数</h3><p>客户原始资料保持只读</p></div></div><span>{{ orderDetailFields.length }} 项</span></div><div v-if="orderDetailFields.length" class="cs-r-detail-field-grid"><article v-for="field in orderDetailFields" :key="field.key" :class="{'is-wide':field.long}"><span>{{ field.label }}</span><strong>{{ field.value }}</strong></article></div><div v-else class="cs-r-state"><strong>尚未提交结构化制作参数</strong><span>可通过问单向客户补充确认。</span></div></section>
            <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">📎</span><div><h3>订单文件</h3><p>仅显示当前账号可访问的真实附件</p></div></div><span>{{ orderFiles.length }} 个</span></div><div v-if="orderFiles.length" class="cs-r-file-grid"><button v-for="file in orderFiles" :key="file.file_id" type="button" @click="previewOrderFile(file)"><span>{{ fileEmoji(file) }}</span><div><strong>{{ file.original_filename }}</strong><small>{{ formatFileSize(file.file_size) }} · {{ statusLabel(file.upload_status) }}</small></div><b>预览</b></button></div><div v-else class="cs-r-state">当前订单没有可查看附件</div></section>
            <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">🔗</span><div><h3>关联业务</h3><p>设计、账单、物流和沟通记录</p></div></div></div><div class="cs-r-related-row"><span>🎨 设计稿 {{ orderDrafts.length }}</span><span>💬 消息 {{ orderMessages.length }}</span><span>💳 {{ orderBill?.bill_id ? statusLabel(orderBill.payment_status) : '账单未建立' }}</span><span>🚀 {{ statusLabel(orderLogistics?.logistics_status) }}</span></div></section>
            <section class="cs-r-drawer-actions"><span>可在下方直接回复客户，也可进入完整沟通中心处理待审核事项。</span><button type="button" @click="openInquiryForOrder(selectedOrder.order_id)">💬 完整沟通中心</button><button class="is-primary" type="button" @click="translationOrderId = selectedOrder.order_id; emit('navigate','/cs/information-translation')">✏️ 信息审核/翻译</button></section>
            <section class="cs-r-order-messages" data-testid="cs-order-inline-reply">
              <div class="cs-r-section-title"><div><span class="cs-r-section-emoji">💬</span><div><h3>订单消息</h3><p>当前订单的跨端真实会话</p></div></div><span>{{ orderMessages.length }} 条</span></div>
              <div v-if="orderMessages.length" class="cs-r-order-thread">
                <article v-for="message in orderMessages.slice(-15)" :key="message.msg_id" class="cs-r-order-message" :class="{'is-self':message.sender_role==='CS'}">
                  <div class="cs-r-order-message-meta"><strong>{{ senderLabel(message.sender_role) }}</strong><span v-if="message.review_status && message.review_status!=='APPROVED'">{{ statusLabel(message.review_status) }}</span></div>
                  <p>{{ message.content }}</p>
                  <small>{{ compactDateTime(message.created_at) }}</small>
                </article>
              </div>
              <div v-else class="cs-r-order-message-empty">当前订单还没有消息，直接在下方开始对话。</div>
              <div v-if="orderReplyError" class="cs-r-order-reply-state is-error">{{ orderReplyError }}</div>
              <div v-else-if="orderReplyResult" class="cs-r-order-reply-state is-success">{{ orderReplyResult }}</div>
              <div class="cs-r-order-reply">
                <input v-model="orderReplyDraft" type="text" aria-label="回复订单消息" placeholder="回复诊所 / 医生…" @keydown.enter.exact.prevent="sendOrderReply">
                <button type="button" :disabled="orderReplySending || !orderReplyDraft.trim()" @click="sendOrderReply">{{ orderReplySending ? '发送中…' : '发送' }}</button>
              </div>
            </section>
          </template>
        </div>
      </el-drawer>
    </template>

    <template v-else-if="activeRoute === '/cs/information-translation'">
      <header class="cs-r-heading"><div><h1>信息审核/翻译</h1><p>由翻译人员审核客户文字、确认翻译稿并整理订单级生产信息。</p></div><span class="cs-r-count">{{ orders.length }} 项任务</span></header>
      <div class="cs-r-workspace is-translation">
        <aside class="cs-r-side-list"><header><strong>处理队列</strong><span>{{ filteredTranslationOrders.length }}</span></header><label class="cs-r-search"><span>⌕</span><input v-model="translationKeyword" type="search" placeholder="搜索订单、客户或产品" aria-label="搜索信息审核任务"></label><div class="cs-r-conversation-tabs"><button type="button" :class="{active:translationFilter==='ALL'}" @click="translationFilter='ALL'">全部 {{ translationFilterCounts.ALL }}</button><button type="button" :class="{active:translationFilter==='PENDING'}" @click="translationFilter='PENDING'">待处理 {{ translationFilterCounts.PENDING }}</button><button type="button" :class="{active:translationFilter==='CONFIRMED'}" @click="translationFilter='CONFIRMED'">已确认 {{ translationFilterCounts.CONFIRMED }}</button></div><button v-for="order in filteredTranslationOrders" :key="order.order_id" type="button" :class="{ active: translationOrderId === order.order_id }" @click="selectTranslationOrder(order)"><strong>{{ order.order_no }}</strong><span>{{ order.clinic_name }} · {{ productLabel(order.product_type) }}</span><small>{{ informationStatus(order) }}</small></button><div v-if="filteredTranslationOrders.length === 0" class="cs-r-state">当前筛选下暂无任务</div></aside>
        <section v-if="selectedTranslationOrder" class="cs-r-work-content">
          <header class="cs-r-work-head"><div><h2>{{ selectedTranslationOrder.order_no }}</h2><p>{{ selectedTranslationOrder.clinic_name }} · {{ productLabel(selectedTranslationOrder.product_type) }}</p></div><span class="cs-r-badge is-amber">{{ informationStatus(selectedTranslationOrder) }}</span></header>
          <div class="cs-r-tab-strip"><button type="button" :class="{active:translationTab==='INFO'}" @click="translationTab='INFO'">信息审核</button><button type="button" :class="{active:translationTab==='TRANSLATION'}" @click="translationTab='TRANSLATION'">翻译整理</button><button type="button" :class="{active:translationTab==='FILES'}" @click="translationTab='FILES'">附件 {{ translationFiles.length }}</button><button type="button" :class="{active:translationTab==='HISTORY'}" @click="translationTab='HISTORY'">处理记录</button></div>
          <section class="cs-r-info-band"><div><span>颜色</span><strong>{{ orderFormValue(selectedTranslationOrder,['shade','color']) || '待确认' }}</strong></div><div><span>牙位</span><strong>{{ orderFormValue(selectedTranslationOrder,['tooth_position','tooth','teeth']) || '待确认' }}</strong></div><div><span>材料</span><strong>{{ orderFormValue(selectedTranslationOrder,['material']) || '待确认' }}</strong></div><div><span>产品</span><strong>{{ productLabel(selectedTranslationOrder.product_type) }}</strong></div></section>
          <template v-if="translationTab==='INFO'">
            <section class="cs-r-review-card" data-testid="cs-information-review-card">
              <header>
                <div><span class="cs-r-step-mark">01</span><div><h3>客户提交资料</h3><p>已转换为中文业务字段；客户原始数据保持只读。</p></div></div>
                <span class="cs-r-review-count">{{ translationReviewFields.length }} 项资料</span>
              </header>
              <div v-if="translationReviewFields.length" class="cs-r-review-field-grid">
                <article v-for="field in translationReviewFields" :key="field.key" :data-field-key="field.key" :class="{ 'is-wide': field.long, 'is-missing': field.missing }">
                  <header><span>{{ field.label }}</span><em v-if="field.required">必填</em></header>
                  <p>{{ field.value }}</p>
                </article>
              </div>
              <div v-else class="cs-r-state">该订单尚未提交可审核的业务资料</div>
              <p class="cs-r-review-footnote">这里只展示业务审核所需字段，客户原始提交记录保持不变。</p>
            </section>
            <section class="cs-r-review-card" data-testid="cs-information-review-actions">
              <header>
                <div><span class="cs-r-step-mark">02</span><div><h3>审核与下一步</h3><p>先核对必填资料和制作参数，再决定进入翻译或发起问单。</p></div></div>
                <button type="button" :disabled="aiLoading" @click="checkMissingInfo">{{ aiLoading ? '检查中…' : '智能检查完整性' }}</button>
              </header>
              <div class="cs-r-review-checklist">
                <article v-for="item in translationReviewChecklist" :key="item.label" :class="item.ok ? 'is-ok' : 'is-warning'">
                  <span>{{ item.ok ? '✓' : '!' }}</span><div><strong>{{ item.label }}</strong><small>{{ item.value }}</small></div>
                </article>
              </div>
              <div v-if="missingInfoChecked" class="cs-r-inline-state" :class="missingInfoItems.length ? 'is-warning' : 'is-ok'">
                <strong>{{ missingInfoItems.length ? `发现 ${missingInfoItems.length} 项需要确认` : '智能检查未发现必填资料缺失' }}</strong>
                <span v-for="item in missingInfoItems" :key="item.field_key">{{ item.field_label }}：{{ item.tip }}</span>
              </div>
              <footer>
                <button type="button" @click="openInquiryForOrder(selectedTranslationOrder.order_id)">有疑点，转问单沟通</button>
                <button class="is-primary" type="button" @click="translationTab='TRANSLATION'">下一步：翻译整理</button>
              </footer>
            </section>
          </template>
          <template v-else-if="translationTab==='TRANSLATION'"><section class="cs-r-readonly-note"><strong>需要翻译的客户文字</strong><p class="cs-r-preserve-text">{{ translationSource || '该订单未单独填写外文指示，可直接整理生产执行信息。' }}</p></section><section class="cs-r-editor-card"><header><div><h3>AI 翻译草稿</h3><p>AI 内容不会自动发送或写入生产。</p></div><button type="button" :disabled="aiLoading || !translationSource.trim()" @click="generateTranslation">生成翻译草稿</button></header><textarea v-model="translationDraft" rows="5" placeholder="生成后由翻译人员逐项校对" aria-label="翻译草稿"></textarea></section><section class="cs-r-editor-card"><header><div><h3>人工确认的生产信息</h3><p>保存后供生产审核读取，保留修改人与时间。</p></div><button type="button" :disabled="aiLoading" @click="generateProductionNote">生成生产信息建议</button></header><textarea v-model="productionNoteDraft" rows="6" placeholder="整理颜色、材料、牙位及客户全部指示" aria-label="生产信息确认稿"></textarea><input v-model="productionNoteConfirmation" placeholder="填写本次人工确认说明（可选）" aria-label="人工确认说明"><footer><button type="button" @click="openInquiryForOrder(selectedTranslationOrder.order_id)">发现疑点，创建问单</button><button class="is-primary" type="button" :disabled="aiLoading || !productionNoteDraft.trim()" @click="confirmProductionNote">翻译人员人工确认</button></footer></section></template>
          <section v-else-if="translationTab==='FILES'" class="cs-r-editor-card"><header><div><h3>订单附件</h3><p>只显示当前账号可访问的真实文件记录。</p></div><span>{{ translationFiles.length }} 个</span></header><div v-if="translationFiles.length" class="cs-r-record-list"><article v-for="file in translationFiles" :key="file.file_id"><div><strong>{{ file.original_filename }}</strong><span>{{ file.content_type || '类型未记录' }} · {{ file.file_size == null ? '大小未记录' : `${file.file_size} B` }}</span></div><span class="cs-r-badge">{{ statusLabel(file.upload_status) }}</span></article></div><div v-else class="cs-r-state">当前订单没有可查看附件</div></section>
          <section v-else class="cs-r-editor-card"><header><div><h3>处理记录</h3><p>显示当前订单已有的真实时间和确认结果。</p></div></header><div class="cs-r-record-list"><article><div><strong>订单建立</strong><span>{{ compactDateTime(selectedTranslationOrder.created_at) }}</span></div><span class="cs-r-badge">{{ statusLabel(selectedTranslationOrder.internal_status) }}</span></article><article><div><strong>最近更新</strong><span>{{ compactDateTime(selectedTranslationOrder.updated_at) }}</span></div><span class="cs-r-badge" :class="selectedTranslationOrder.production_note ? 'is-green':'is-amber'">{{ selectedTranslationOrder.production_note ? '已有人工确认稿':'尚未人工确认' }}</span></article></div><section class="cs-r-readonly-note"><strong>当前生产信息</strong><p>{{ selectedTranslationOrder.production_note || '尚未保存翻译人员人工确认的生产信息。' }}</p></section></section>
        </section>
        <div v-else class="cs-r-state">请选择左侧任务</div>
      </div>
    </template>

    <template v-else-if="activeRoute === '/cs/designs'">
      <header class="cs-r-heading"><div><h1>设计稿管理</h1><p>审核设计文件版本、核对执行信息，并通过问单发起客户设计确认。</p></div><span class="cs-r-count">{{ designDrafts.length }} 个版本</span></header>
      <section class="cs-r-table-card">
        <header class="cs-r-table-toolbar"><div><h3>设计订单</h3><span>{{ filteredDesignOrders.length }} / {{ orders.length }} 个订单</span></div><label class="cs-r-search"><span>⌕</span><input v-model="designKeyword" type="search" placeholder="搜索订单、客户或产品" aria-label="搜索设计订单"></label></header>
        <table v-if="filteredDesignOrders.length">
          <thead><tr><th>订单编号</th><th>客户</th><th>产品</th><th>颜色 / 牙位</th><th>订单阶段</th><th>操作</th></tr></thead>
          <tbody><tr v-for="order in filteredDesignOrders" :key="order.order_id" @click="selectDesignOrder(order.order_id)"><td><strong>{{ order.order_no }}</strong><small>#{{ order.order_id }}</small></td><td>{{ order.clinic_name }}</td><td>{{ productLabel(order.product_type) }}</td><td><strong>{{ orderFormValue(order,['shade','color']) || '待确认' }}</strong><small>{{ orderFormValue(order,['tooth_position','tooth','teeth']) || '牙位待确认' }}</small></td><td><span class="cs-r-badge is-violet">{{ statusLabel(order.internal_status) }}</span></td><td><button class="cs-r-link" type="button" @click.stop="selectDesignOrder(order.order_id)">查看版本</button></td></tr></tbody>
        </table>
        <div v-else class="cs-r-state"><strong>没有符合条件的设计订单</strong><span>调整搜索条件，或等待生产端上传设计文件。</span></div>
      </section>
      <el-drawer v-model="designDrawerVisible" size="540px" :with-header="false" class="cs-r-drawer" modal-class="cs-r-drawer-overlay">
        <div v-if="selectedDesignOrder" class="cs-r-drawer-shell"><header class="cs-r-detail-head"><div><small>DESIGN REVIEW</small><h2>{{ selectedDesignOrder.order_no }}</h2></div><div><span class="cs-r-badge is-violet">{{ designDrafts.length }} 个版本</span><button type="button" aria-label="关闭设计稿详情" @click="designDrawerVisible=false">×</button></div></header>
          <div v-if="designDetailState.loading" class="cs-r-state cs-r-detail-loading"><span class="cs-r-loading-orbit">🎨</span><strong>正在读取设计版本</strong></div>
          <template v-else>
            <section v-if="designDetailState.error" class="cs-r-detail-alert is-danger"><span>!</span><div><strong>设计版本加载失败</strong><p>{{ designDetailState.error }}</p></div><button type="button" @click="selectDesignOrder(selectedDesignOrder.order_id)">重试</button></section>
            <section class="cs-r-info-band"><div><span>产品</span><strong>{{ productLabel(selectedDesignOrder.product_type) }}</strong></div><div><span>颜色</span><strong>{{ orderFormValue(selectedDesignOrder,['shade','color']) || '待确认' }}</strong></div><div><span>牙位</span><strong>{{ orderFormValue(selectedDesignOrder,['tooth_position','tooth','teeth']) || '待确认' }}</strong></div><div><span>诊所</span><strong>{{ selectedDesignOrder.clinic_name }}</strong></div></section>
            <section class="cs-r-detail-alert is-info"><span>📝</span><div><strong>订单级人工确认信息</strong><p>{{ selectedDesignOrder.production_note || '当前订单尚无人工确认的生产信息，审核前应先核对原始资料。' }}</p></div></section>
            <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">🗂️</span><div><h3>版本与审核记录</h3><p>操作权限严格跟随当前版本状态</p></div></div><span>{{ designDrafts.length }} 个</span></div>
              <div v-if="designDrafts.length" class="cs-r-version-list"><article v-for="draft in designDrafts" :key="draft.draft_id" :class="{'is-reviewable':designCanReview(draft)}"><header><div class="cs-r-version-mark"><span>📐</span><div><strong>设计稿 V{{ draft.version }}</strong><small>{{ draft.file_count || fileIds(draft).length }} 个文件 · 上传人 #{{ draft.uploader_user_id || '未记录' }}</small></div></div><span class="cs-r-badge" :class="draft.status.includes('REJECT') ? 'is-red' : draft.status.includes('CONFIRM') ? 'is-green' : 'is-amber'">{{ statusLabel(draft.status) }}</span></header><div v-if="draft.cs_reject_reason || draft.doctor_reject_reason" class="cs-r-version-reason"><strong>退回原因</strong><p>{{ draft.cs_reject_reason || draft.doctor_reject_reason }}</p></div><div v-else class="cs-r-version-body"><div><span>文件状态</span><p>{{ fileIds(draft).length ? '已有可关联文件' : '版本尚未关联文件' }}</p></div><div><span>客户确认</span><p>{{ draft.status.includes('CONFIRM') ? '客户已明确确认' : '尚未形成客户确认结果' }}</p></div></div><label v-if="designCanReview(draft)"><span>退回修改原因</span><input v-model="designRejectReasons[draft.draft_id]" placeholder="退回时必填，审核通过可留空"></label><footer><button type="button" :disabled="fileIds(draft).length === 0" @click="previewDesignDraft(draft)">👁 预览文件</button><template v-if="designCanReview(draft)"><button type="button" @click="reviewDesignDraft(draft,'REJECT')">退回修改</button><button class="is-primary" type="button" @click="reviewDesignDraft(draft,'APPROVE')">审核通过</button></template><button v-else-if="['PENDING_DOCTOR_REVIEW','PENDING_DOCTOR_CONFIRM'].includes(draft.status)" class="is-primary" type="button" @click="openInquiryForOrder(selectedDesignOrder.order_id)">进入客户确认问单</button><span v-else class="cs-r-action-state">当前状态仅支持查看</span></footer></article></div>
              <div v-else-if="!designDetailState.error" class="cs-r-state"><strong>当前订单还没有设计稿版本</strong><span>设计文件由生产端上传后在这里出现。</span></div>
            </section>
          </template>
        </div>
      </el-drawer>
    </template>

    <template v-else-if="activeRoute === '/cs/inquiries'">
      <header class="cs-r-heading"><div><h1>问单沟通</h1><p>围绕订单事项与客户自由沟通；设计确认和翻译疑点都在这里形成完整记录。</p></div><span class="cs-r-count">{{ attentionItems.length }} 项待关注</span></header>
      <div class="cs-r-chat-layout">
        <aside class="cs-r-conversations"><label class="cs-r-search"><span>⌕</span><input v-model="inquiryKeyword" type="search" placeholder="搜索订单或客户" aria-label="搜索会话"></label><div class="cs-r-conversation-tabs"><button type="button" :class="{active:inquiryTab==='ALL'}" @click="inquiryTab='ALL'">全部会话</button><button type="button" :class="{active:inquiryTab==='WAITING'}" @click="inquiryTab='WAITING'">待回复 {{ attentionItems.length }}</button><button type="button" :class="{active:inquiryTab==='REVIEW'}" @click="inquiryTab='REVIEW'">待审核 {{ pendingMessages.length }}</button></div><button v-for="order in conversationOrders" :key="order.order_id" type="button" :class="{ active: inquiryOrderId === order.order_id }" @click="loadInquiryMessages(order.order_id)"><span class="cs-r-avatar">{{ order.clinic_name.slice(0,1) }}</span><div><strong>{{ order.clinic_name }}</strong><span>{{ order.order_no }} · {{ productLabel(order.product_type) }}</span><small>{{ attentionItems.some(item => item.order_id === order.order_id) ? '有待处理问单事项' : '查看完整会话' }}</small></div><i v-if="attentionItems.some(item => item.order_id === order.order_id)" /></button><div v-if="conversationOrders.length===0" class="cs-r-state">当前口径下没有会话</div></aside>
        <section class="cs-r-chat-panel"><header><div><h2>{{ orders.find(item => item.order_id === inquiryOrderId)?.clinic_name || '请选择会话' }}</h2><p>{{ orders.find(item => item.order_id === inquiryOrderId)?.order_no || '从左侧选择订单' }}</p></div><span class="cs-r-badge is-green">平台内沟通</span></header><div class="cs-r-message-timeline"><div v-if="inquiryMessages.length === 0" class="cs-r-state">当前订单暂无沟通记录</div><article v-for="message in inquiryMessages" :key="message.msg_id" :class="message.sender_role === 'CS' ? 'is-self' : ''"><span class="cs-r-avatar">{{ senderLabel(message.sender_role).slice(0,1) }}</span><div><header><strong>{{ senderLabel(message.sender_role) }}</strong><small>{{ compactDateTime(message.created_at) }}</small></header><p>{{ message.content }}</p><small v-if="message.review_status !== 'APPROVED'">{{ statusLabel(message.review_status) }}</small></div></article></div><div class="cs-r-quick-replies"><button type="button" @click="inquiryDraft = '您好，我们正在核对您提交的资料，请稍候。'">资料核对中</button><button type="button" @click="inquiryDraft = '请确认当前设计版本是否可以进入后续制作。'">设计确认</button><button type="button" @click="inquiryDraft = '请补充缺少的信息，我们收到后会继续处理。'">补充资料</button></div><footer class="cs-r-composer"><textarea v-model="inquiryDraft" rows="3" placeholder="输入要发送给客户的内容；快捷回复只会填入，不会自动发送" aria-label="问单消息"></textarea><div><span>仅对客消息会显示给医生/客户</span><button class="is-primary" type="button" :disabled="inquirySending || !inquiryDraft.trim() || !inquiryOrderId" @click="sendInquiryMessage">{{ inquirySending ? '发送中…' : '发送消息' }}</button></div></footer></section>
      </div>
    </template>

    <template v-else-if="activeRoute === '/cs/customers'">
      <header class="cs-r-heading"><div><h1>客户管理</h1><p>查看诊所基础档案、联系人和制作偏好；仅展示接口返回的真实资料状态。</p></div><button class="cs-r-primary" type="button" disabled title="当前后端仅允许管理端创建诊所业务档案">＋ 新增客户</button></header>
      <div v-if="incompleteClinics.length || inactiveClinics.length" class="cs-r-client-alerts">
        <div v-if="incompleteClinics.length" class="cs-r-client-alert is-amber"><span>⚠</span><div><strong>{{ incompleteClinics.length }} 个客户资料待完善</strong><p>仅按真实联系人、联系电话和制作偏好字段判断：{{ incompleteClinics.map(item => item.clinic_name).join('、') }}</p></div></div>
        <div v-if="inactiveClinics.length" class="cs-r-client-alert is-muted"><span>○</span><div><strong>{{ inactiveClinics.length }} 个客户已停用</strong><p>{{ inactiveClinics.map(item => item.clinic_name).join('、') }}</p></div></div>
      </div>
      <section class="cs-r-filter-card"><div class="cs-r-segmented"><button type="button" :class="{active:customerFilter==='ALL'}" @click="customerFilter='ALL'">全部客户 {{ clinics.length }}</button><button type="button" :class="{active:customerFilter==='INCOMPLETE'}" @click="customerFilter='INCOMPLETE'">资料待完善 {{ incompleteClinics.length }}</button><button type="button" :class="{active:customerFilter==='INACTIVE'}" @click="customerFilter='INACTIVE'">已停用 {{ inactiveClinics.length }}</button></div><label class="cs-r-search"><span>⌕</span><input v-model="customerKeyword" type="search" placeholder="搜索诊所、联系人或电话" aria-label="搜索客户"></label></section>
      <section class="cs-r-customer-grid"><button v-for="clinic in filteredClinics" :key="clinic.clinic_id" type="button" :class="{ active: selectedClinicId === clinic.clinic_id }" @click="selectClinic(clinic.clinic_id)"><header><span class="cs-r-avatar">{{ clinic.clinic_name.slice(0,1) }}</span><div><strong>{{ clinic.clinic_name }}</strong><small>客户档案 #{{ clinic.clinic_id }}</small></div><span class="cs-r-badge" :class="clinic.status === 'INACTIVE' ? 'is-red' : 'is-green'">{{ statusLabel(clinic.status) }}</span></header><div class="cs-r-summary-grid"><div><span>联系人</span><strong>{{ clinic.contact_name || '未设置' }}</strong></div><div><span>联系电话</span><strong>{{ clinic.contact_phone || '未设置' }}</strong></div><div><span>制作偏好</span><strong>{{ clinic.preference_count ? `${clinic.preference_count} 项` : '待完善' }}</strong></div><div><span>建立时间</span><strong>{{ compactDateTime(clinic.created_at) }}</strong></div><div><span>最近更新</span><strong>{{ compactDateTime(clinic.updated_at) }}</strong></div><div><span>档案状态</span><strong>{{ statusLabel(clinic.status) }}</strong></div></div><footer><span>{{ !clinic.contact_name || !clinic.contact_phone || clinic.preference_count === 0 ? '资料待完善' : '基础资料完整' }}</span><b>查看详情 →</b></footer></button><div v-if="filteredClinics.length === 0" class="cs-r-state">没有符合条件的客户</div></section>
      <el-dialog v-model="customerDrawerVisible" width="860px" :show-close="false" align-center class="cs-r-customer-dialog" modal-class="cs-r-drawer-overlay">
        <div v-if="selectedClinic" class="cs-r-customer-detail">
          <header><div class="cs-r-customer-identity"><span class="cs-r-customer-avatar">🏥</span><div><small>CUSTOMER PROFILE · #{{ selectedClinic.clinic_id }}</small><h2>{{ selectedClinic.clinic_name }}</h2><p>{{ selectedClinic.contact_name || '联系人未设置' }} · {{ selectedClinic.contact_phone || '电话未设置' }}</p></div></div><div><span class="cs-r-badge" :class="selectedClinic.status==='ACTIVE'?'is-green':'is-red'">{{ statusLabel(selectedClinic.status) }}</span><button type="button" aria-label="关闭客户详情" @click="customerDrawerVisible=false">×</button></div></header>
          <div v-if="customerDetailState.loading" class="cs-r-state cs-r-detail-loading"><span class="cs-r-loading-orbit">🏥</span><strong>正在读取客户档案</strong></div>
          <div v-else class="cs-r-customer-tab-body cs-r-continuous-detail">
            <section v-if="customerDetailState.error" class="cs-r-detail-alert is-warning"><span>⚠️</span><div><strong>部分客户资料暂未加载</strong><p>{{ customerDetailState.error }}</p></div><button type="button" @click="selectClinic(selectedClinic.clinic_id)">重试</button></section>
            <section class="cs-r-customer-hero"><div><span>🏥</span><div><small>诊所客户</small><strong>{{ selectedClinic.clinic_name }}</strong><p>平台客户档案 #{{ selectedClinic.clinic_id }}</p></div></div><span class="cs-r-badge" :class="selectedClinic.preference_count?'is-green':'is-amber'">{{ selectedClinic.preference_count ? `${selectedClinic.preference_count} 项制作偏好` : '制作偏好待完善' }}</span></section><section class="cs-r-summary-grid cs-r-customer-info-grid"><div><span>主要联系人</span><strong>{{ selectedClinic.contact_name || '尚未设置' }}</strong></div><div><span>联系电话</span><strong>{{ selectedClinic.contact_phone || '尚未设置' }}</strong></div><div><span>电子邮箱</span><strong>当前档案未建模</strong></div><div><span>收货地址</span><strong>当前档案未建模</strong></div><div><span>建立时间</span><strong>{{ compactDateTime(selectedClinic.created_at) }}</strong></div><div><span>最近更新</span><strong>{{ compactDateTime(selectedClinic.updated_at) }}</strong></div></section><section class="cs-r-detail-alert is-info"><span>💡</span><div><strong>资料完整性提示</strong><p>联系人、电话和制作偏好来自真实接口；邮箱与收货地址尚未纳入客服客户档案。</p></div></section>
            <section class="cs-r-capability-empty"><span>👩🏻‍⚕️</span><strong>医生成员接口尚未接入客服端</strong><p>当前不会根据订单中的医生编号虚构姓名、职位或联系方式。</p></section>
            <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">🎨</span><div><h3>制作偏好</h3><p>保存后只影响后续业务，不反向修改历史订单</p></div></div><span>{{ selectedClinic.preference_count }} 项已维护</span></div><div class="cs-r-preference-list"><label v-for="key in clinicPreferenceKeys" :key="key"><span>{{ preferenceLabel(key) }}</span><textarea v-model="clinicPreferenceTextDraft[key]" :rows="key==='note' ? 3 : 2" :placeholder="`填写${preferenceLabel(key)}；结构化内容可使用 JSON`"></textarea></label></div><div v-if="clinicUnknownPreferences.length" class="cs-r-structured-preferences"><header><strong>历史附加偏好</strong><span>只读保留，不参与本次保存</span></header><article v-for="([key,value],index) in clinicUnknownPreferences" :key="key"><span>附加偏好 {{ index + 1 }}</span><pre>{{ preferenceText(value) }}</pre></article></div><footer class="cs-r-modal-actions"><span>最近更新：{{ compactDateTime(clinicPreference?.updated_at) }}</span><button class="cs-r-primary" type="button" :disabled="pageLoading || !clinicPreference" @click="saveClinicPreference">{{ pageLoading ? '保存中…' : '保存制作偏好' }}</button></footer></section>
            <section class="cs-r-capability-empty"><span>📑</span><strong>商务条款尚未建立独立数据模型</strong><p>合同、客户价表、账期、欠款与负责人没有真实接口时不生成演示数据。</p></section>
            <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">📦</span><div><h3>真实订单记录</h3><p>仅列出当前账号可访问且诊所编号匹配的订单</p></div></div><span>{{ selectedClinicOrders.length }} 单</span></div><div v-if="selectedClinicOrders.length" class="cs-r-record-list"><article v-for="order in selectedClinicOrders" :key="order.order_id"><div><strong>{{ order.order_no }}</strong><span>{{ productLabel(order.product_type) }} · {{ compactDateTime(order.created_at) }}</span></div><span class="cs-r-badge is-violet">{{ statusLabel(order.internal_status) }}</span></article></div><div v-else class="cs-r-state"><strong>当前范围内没有订单记录</strong><span>这不是演示空数据，而是当前账号真实结果。</span></div></section>
          </div>
        </div>
      </el-dialog>
    </template>

    <template v-else-if="activeRoute === '/cs/products'">
      <header class="cs-r-heading"><div><h1>产品管理</h1><p>维护已有产品资料、基础价格和医生下单要求；本期不新增产品。</p></div><span class="cs-r-count">{{ products.length }} 个已有产品</span></header>
      <section class="cs-r-table-card"><header class="cs-r-table-toolbar"><div><h3>已有产品</h3><span>{{ filteredProducts.length }} / {{ products.length }} 个产品</span></div><label class="cs-r-search"><span>⌕</span><input v-model="productKeyword" type="search" placeholder="搜索已有产品" aria-label="搜索产品"></label></header><table v-if="filteredProducts.length"><thead><tr><th>产品名称</th><th>产品类型</th><th>材料规格</th><th>基础价格</th><th>启用状态</th><th>操作</th></tr></thead><tbody><tr v-for="product in filteredProducts" :key="product.product_id" @click="selectProduct(product.product_id)"><td><strong>{{ product.product_name }}</strong><small>#{{ product.product_id }}</small></td><td>{{ productLabel(product.product_type) }}</td><td>{{ product.material_spec || '材料规格待完善' }}</td><td>{{ money(product.base_price_cents,product.currency) }}</td><td><span class="cs-r-badge" :class="product.status === 'ACTIVE' ? 'is-green' : 'is-red'">{{ statusLabel(product.status) }}</span></td><td><button class="cs-r-link" type="button" @click.stop="selectProduct(product.product_id)">查看资料</button></td></tr></tbody></table><div v-else class="cs-r-state">没有符合条件的已有产品</div></section>
      <el-drawer v-model="productDrawerVisible" size="540px" :with-header="false" class="cs-r-drawer" modal-class="cs-r-drawer-overlay">
        <div v-if="selectedProduct" class="cs-r-drawer-shell"><header class="cs-r-detail-head"><div><small>PRODUCT PROFILE</small><h2>{{ selectedProduct.product_name }}</h2></div><div><span class="cs-r-badge" :class="selectedProduct.status==='ACTIVE'?'is-green':'is-red'">{{ statusLabel(selectedProduct.status) }}</span><button type="button" aria-label="关闭产品详情" @click="productDrawerVisible=false">×</button></div></header>
          <div class="cs-r-product-banner"><span>{{ productEmoji(selectedProduct.product_type) }}</span><div><small>{{ productLabel(selectedProduct.product_type) }}</small><strong>{{ selectedProduct.product_name }}</strong><p>产品编号 #{{ selectedProduct.product_id }} · {{ selectedProduct.material_spec || '材料规格待完善' }}</p></div></div>
          <div v-if="productDetailState.loading" class="cs-r-state cs-r-detail-loading"><span class="cs-r-loading-orbit">{{ productEmoji(selectedProduct.product_type) }}</span><strong>正在读取产品配置</strong></div>
          <template v-else>
            <section v-if="productDetailState.error" class="cs-r-detail-alert is-warning"><span>⚠️</span><div><strong>部分产品资料未加载</strong><p>{{ productDetailState.error }}</p></div><button type="button" @click="selectProduct(selectedProduct.product_id)">重试</button></section>
            <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">🧾</span><div><h3>产品资料</h3><p>维护真实产品名称、材料、价格和启用状态</p></div></div></div><div class="cs-r-form-grid cs-r-section-form"><label><span>产品名称</span><input v-model="productEditName"></label><label><span>材料规格</span><input v-model="productEditMaterial"></label><label><span>基础价格（元）</span><input v-model.number="productEditPrice" type="number" min="0" step="0.01"></label><label><span>启用状态</span><select v-model="productEditStatus"><option value="ACTIVE">启用</option><option value="INACTIVE">停用</option></select></label><label class="is-wide"><span>价格说明</span><textarea v-model="productEditNote" rows="3" placeholder="填写真实价格口径或适用说明"></textarea></label></div><footer class="cs-r-inline-actions"><span>产品类型在本期保持只读，避免破坏已有订单。</span><button class="cs-r-primary" type="button" :disabled="pageLoading || !productEditName.trim()" @click="saveProduct">{{ pageLoading ? '保存中…' : '保存已有产品' }}</button></footer></section>
            <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">📋</span><div><h3>医生下单要求</h3><p>真实表单配置按显示顺序排列</p></div></div><span>{{ productRequirements.length }} 项</span></div><div v-if="productRequirements.length" class="cs-r-requirement-list"><article v-for="requirement in [...productRequirements].sort((a,b)=>a.sort_order-b.sort_order)" :key="requirement.field_id"><span class="cs-r-requirement-order">{{ String(requirement.sort_order).padStart(2,'0') }}</span><div><strong>{{ requirement.field_label }} <em v-if="requirement.is_required">必填</em></strong><span>{{ fieldTypeLabel(requirement.field_type) }} · {{ requirement.options?.length ? `${requirement.options.length} 个选项` : '无预设选项' }}</span></div><span class="cs-r-badge" :class="requirement.status === 'ACTIVE' ? 'is-green' : 'is-red'">{{ statusLabel(requirement.status) }}</span></article></div><div v-else-if="!productDetailState.error" class="cs-r-state"><strong>尚未配置医生下单要求</strong><span>这里不会填充演示字段。</span></div></section>
            <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">🕘</span><div><h3>变更记录</h3><p>当前仅展示接口提供的真实时间</p></div></div></div><div class="cs-r-record-list"><article><div><strong>产品档案建立</strong><span>{{ compactDateTime(selectedProduct.created_at) }}</span></div><span class="cs-r-badge is-violet">真实时间</span></article><article><div><strong>最近一次更新</strong><span>{{ compactDateTime(selectedProduct.updated_at) }}</span></div><span class="cs-r-badge" :class="selectedProduct.status==='ACTIVE'?'is-green':'is-red'">{{ statusLabel(selectedProduct.status) }}</span></article></div><div class="cs-r-capability-empty is-compact"><span>🕘</span><strong>逐字段审计记录尚未接入</strong><p>当前仅展示产品真实建立和更新时间，不编造操作人或变更内容。</p></div></section>
          </template>
        </div>
      </el-drawer>
    </template>

    <template v-else-if="activeRoute === '/cs/billing'">
      <header class="cs-r-heading"><div><h1>账单管理</h1><p>管理真实按单账单和收款事实；月结自动归集仅在后端规则接入后启用。</p></div><span class="cs-r-count">{{ deliveryItems.length }} 条账单关联记录</span></header>
      <div class="cs-r-tab-strip is-large"><button type="button" :class="{active:billingTab==='ORDER'}" @click="billingTab='ORDER'">按单账单</button><button type="button" :class="{active:billingTab==='MONTHLY'}" @click="billingTab='MONTHLY'">月结账单</button></div>
      <section v-if="billingTab === 'ORDER'" class="cs-r-table-card"><header class="cs-r-table-toolbar"><div><h3>按单账单</h3><span>{{ deliveryItems.length }} 条记录</span></div></header><table><thead><tr><th>订单</th><th>产品</th><th>账单状态</th><th>收款状态</th><th>配送状态</th><th>操作</th></tr></thead><tbody><tr v-for="item in deliveryItems" :key="item.order_id" @click="selectBillingOrder(item.order_id)"><td><strong>{{ item.order_no }}</strong><small>#{{ item.order_id }}</small></td><td>{{ productLabel(item.product_type) }}</td><td><span class="cs-r-badge is-violet">{{ statusLabel(item.bill_status) }}</span></td><td><span class="cs-r-badge" :class="item.payment_status === 'PAID' ? 'is-green' : 'is-amber'">{{ statusLabel(item.payment_status) }}</span></td><td>{{ statusLabel(item.logistics_status) }}</td><td><button class="cs-r-link" type="button" @click.stop="selectBillingOrder(item.order_id)">查看账单</button></td></tr></tbody></table><div v-if="deliveryItems.length === 0" class="cs-r-state">暂无账单关联记录</div></section>
      <el-drawer v-model="billingDrawerVisible" size="540px" :with-header="false" class="cs-r-drawer" modal-class="cs-r-drawer-overlay"><div class="cs-r-drawer-shell"><header class="cs-r-detail-head"><div><small>BILLING DETAILS</small><h2>{{ selectedBillingOrder?.order_no || '账单记录' }}</h2></div><div><span class="cs-r-badge" :class="selectedBill?.payment_status==='PAID'?'is-green':'is-amber'">{{ statusLabel(selectedBill?.payment_status) }}</span><button type="button" aria-label="关闭账单详情" @click="billingDrawerVisible=false">×</button></div></header>
        <div v-if="billingDetailState.loading" class="cs-r-state cs-r-detail-loading"><span class="cs-r-loading-orbit">💳</span><strong>正在核对账单与收款记录</strong></div>
        <template v-else>
          <section v-if="billingDetailState.error" class="cs-r-detail-alert is-danger"><span>!</span><div><strong>账单详情加载失败</strong><p>{{ billingDetailState.error }}</p></div><button v-if="selectedBillingOrderId" type="button" @click="selectBillingOrder(selectedBillingOrderId)">重试</button></section>
          <section v-else-if="billingDetailErrors.length" class="cs-r-detail-alert is-warning"><span>⚠️</span><div><strong>部分账务资料未加载</strong><p>{{ billingDetailErrors.join('、') }}暂时不可用。</p></div><button v-if="selectedBillingOrderId" type="button" @click="selectBillingOrder(selectedBillingOrderId)">重试</button></section>
          <section v-if="billingContradiction" class="cs-r-detail-alert is-danger"><span>!</span><div><strong>账务状态存在矛盾</strong><p>{{ billingContradiction }}</p></div></section>
          <section class="cs-r-money-hero" :class="selectedBill?.payment_status==='PAID'?'is-paid':'is-pending'"><div><span>💰</span><div><small>账单金额</small><strong>{{ money(selectedBill?.amount_cents,selectedBill?.currency) }}</strong><p>{{ selectedBill?.bill_id ? `账单 #${selectedBill.bill_id}` : '该订单尚未建立账单' }}</p></div></div><span class="cs-r-badge" :class="selectedBill?.payment_status==='PAID'?'is-green':'is-amber'">{{ statusLabel(selectedBill?.payment_status) }}</span></section><section class="cs-r-summary-grid"><div><span>账单状态</span><strong>{{ statusLabel(selectedBill?.bill_status) }}</strong></div><div><span>账单文件</span><strong>{{ selectedBill?.file_id ? `文件 #${selectedBill.file_id}` : '未上传' }}</strong></div><div><span>累计收款</span><strong>{{ money(receivedAmountCents,selectedBill?.currency) }}</strong></div><div><span>剩余应收</span><strong>{{ money(outstandingAmountCents,selectedBill?.currency) }}</strong></div></section><section v-if="selectedBill?.payment_status==='PAID' && !billingContradiction" class="cs-r-detail-alert is-success"><span>✓</span><div><strong>当前账单已完成收款</strong><p>真实收款记录仍可在下方继续追溯。</p></div></section><section v-else-if="!selectedBill" class="cs-r-capability-empty is-compact"><span>🧾</span><strong>该订单尚未建立真实账单</strong><p>未建立账单前不能登记收款。</p></section>
          <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">🦷</span><div><h3>关联订单</h3><p>金额明细接口未拆分时只显示真实订单资料</p></div></div></div><div v-if="selectedBillingOrder" class="cs-r-detail-field-grid"><article><span>订单编号</span><strong>{{ selectedBillingOrder.order_no }}</strong></article><article><span>诊所</span><strong>{{ selectedBillingOrder.clinic_name }}</strong></article><article><span>产品</span><strong>{{ productLabel(selectedBillingOrder.product_type) }}</strong></article><article><span>订单阶段</span><strong>{{ statusLabel(selectedBillingOrder.internal_status) }}</strong></article><article><span>颜色</span><strong>{{ orderFormValue(selectedBillingOrder,['shade','color']) || '未记录' }}</strong></article><article><span>牙位</span><strong>{{ orderFormValue(selectedBillingOrder,['tooth_position','tooth','teeth']) || '未记录' }}</strong></article></div></section>
          <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">💵</span><div><h3>人工收款记录</h3><p>每笔记录独立保存并保持可追溯</p></div></div><span>{{ selectedPayments.length }} 笔</span></div><div v-if="selectedPayments.length" class="cs-r-payment-list"><article v-for="payment in selectedPayments" :key="payment.payment_id"><span>¥</span><div><strong>{{ money(payment.amount_cents,payment.currency) }}</strong><small>{{ paymentMethodLabel(payment.payment_method) }} · {{ compactDateTime(payment.received_at) }}</small><p>{{ payment.payment_note || '本笔收款无备注' }}</p></div><b>#{{ payment.payment_id }}</b></article></div><div v-else class="cs-r-state"><strong>暂无收款记录</strong><span>这表示当前账本中没有真实人工收款。</span></div><div v-if="canRecordPayment" class="cs-r-payment-form"><header><span>＋</span><div><strong>登记一笔真实收款</strong><small>剩余应收 {{ money(outstandingAmountCents,selectedBill?.currency) }}</small></div></header><div class="cs-r-form-grid"><label><span>收款金额（元）</span><input v-model.number="paymentAmountYuan" type="number" min="0.01" :max="outstandingAmountCents/100" step="0.01" placeholder="0.00"></label><label><span>收款方式</span><select v-model="paymentMethod"><option value="BANK_TRANSFER">银行转账</option><option value="CASH">现金</option><option value="OTHER">其他方式</option></select></label><label class="is-wide"><span>收款备注</span><input v-model="paymentNote" placeholder="填写凭据编号或业务说明"></label></div><button class="cs-r-primary" type="button" :disabled="pageLoading || !paymentAmountYuan || paymentAmountYuan<=0 || paymentAmountYuan*100>outstandingAmountCents" @click="createPaymentRecord">{{ pageLoading ? '保存中…' : '确认登记收款' }}</button></div><div v-else-if="!selectedBill?.bill_id" class="cs-r-capability-empty is-compact"><span>🧾</span><strong>尚未建立真实账单</strong><p>请先由有权限的岗位建立账单，再登记人工收款。</p></div><div v-else class="cs-r-detail-alert" :class="billingContradiction?'is-danger':'is-success'"><span>{{ billingContradiction ? '!' : '✓' }}</span><div><strong>{{ billingContradiction ? '暂不能登记新收款' : '当前没有待登记金额' }}</strong><p>{{ billingContradiction || '账单已收清或剩余应收为零。' }}</p></div></div></section>
          <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">🧾</span><div><h3>操作记录</h3><p>仅列出当前接口返回的真实事实</p></div></div></div><div class="cs-r-record-list"><article><div><strong>订单建立</strong><span>{{ compactDateTime(selectedBillingOrder?.created_at) }}</span></div><span class="cs-r-badge is-violet">订单记录</span></article><article v-for="payment in selectedPayments" :key="payment.payment_id"><div><strong>登记收款 {{ money(payment.amount_cents,payment.currency) }}</strong><span>{{ compactDateTime(payment.created_at) }} · {{ paymentMethodLabel(payment.payment_method) }}</span></div><span class="cs-r-badge is-green">已保存</span></article></div><div class="cs-r-capability-empty is-compact"><span>🧾</span><strong>账单状态审计明细尚未接入</strong><p>这里仅列出当前接口返回的真实订单时间与收款记录。</p></div></section>
        </template>
      </div></el-drawer>
      <section v-if="billingTab === 'MONTHLY'" class="cs-r-monthly"><div class="cs-r-monthly-banner"><div><span>自动归集能力</span><h2>月结规则与生成接口尚未接入</h2><p>当前页面不会虚构月结客户、月结金额或生成结果；后端能力完成后再展示真实草稿。</p></div><span class="cs-r-badge is-amber">暂不可用</span></div><section class="cs-r-table-card"><table><thead><tr><th>月结单编号</th><th>结算周期</th><th>客户</th><th>订单数</th><th>应收合计</th><th>已收 / 未收</th><th>账单状态</th><th>生成时间</th><th>操作</th></tr></thead></table><div class="cs-r-state"><strong>暂无真实月结账单</strong><span>计入节点、调整、多币种、跨期及生成接口接入后，系统才会显示自动归集结果。</span></div></section></section>
    </template>

    <template v-else-if="activeRoute === '/cs/delivery'">
      <header class="cs-r-heading"><div><h1>配送管理</h1><p>核对发货门禁、登记承运商与运单，并跟进物流异常。</p></div><span class="cs-r-count">{{ deliveryItems.length }} 个配送订单</span></header>
      <section class="cs-r-filter-card"><div class="cs-r-segmented"><button v-for="item in [{key:'ALL',label:'全部'},{key:'PENDING',label:'待发货'},{key:'SHIPPED',label:'已发货'},{key:'EXCEPTION',label:'异常'}]" :key="item.key" type="button" :class="{active:deliveryStatus===item.key}" @click="setDeliveryStatus(item.key)">{{ item.label }}</button></div></section>
      <section class="cs-r-table-card"><header class="cs-r-table-toolbar"><div><h3>配送订单</h3><span>{{ filteredDelivery.length }} / {{ deliveryItems.length }} 个订单</span></div></header><table v-if="filteredDelivery.length"><thead><tr><th>订单</th><th>产品</th><th>收款 / 结算</th><th>承运商</th><th>运单号</th><th>配送状态</th><th>操作</th></tr></thead><tbody><tr v-for="item in filteredDelivery" :key="item.order_id" @click="selectDeliveryOrder(item)"><td><strong>{{ item.order_no }}</strong><small>#{{ item.order_id }}</small></td><td>{{ productLabel(item.product_type) }}</td><td><span class="cs-r-badge" :class="item.payment_status==='PAID'||item.payment_status==='NO_PAYMENT_REQUIRED'?'is-green':'is-amber'">{{ statusLabel(item.payment_status) }}</span></td><td>{{ item.carrier || '待登记' }}</td><td>{{ item.tracking_no || '待登记' }}</td><td><span class="cs-r-badge" :class="item.logistics_status==='EXCEPTION'?'is-red':item.logistics_status==='SHIPPED'?'is-green':'is-amber'">{{ statusLabel(item.logistics_status) }}</span></td><td><button class="cs-r-link" type="button" @click.stop="selectDeliveryOrder(item)">查看配送</button></td></tr></tbody></table><div v-else class="cs-r-state">当前筛选下没有配送订单</div></section>
      <el-drawer v-model="deliveryDrawerVisible" size="540px" :with-header="false" class="cs-r-drawer" modal-class="cs-r-drawer-overlay"><div v-if="selectedDelivery" class="cs-r-drawer-shell"><header class="cs-r-detail-head"><div><small>DELIVERY DETAILS</small><h2>{{ selectedDelivery.order_no }}</h2></div><div><span class="cs-r-badge" :class="selectedDelivery.logistics_status==='EXCEPTION'?'is-red':deliveryAlreadyShipped?'is-green':'is-amber'">{{ statusLabel(selectedDelivery.logistics_status) }}</span><button type="button" aria-label="关闭配送详情" @click="deliveryDrawerVisible=false">×</button></div></header>
        <section class="cs-r-delivery-hero"><span>{{ deliveryAlreadyShipped ? '🚚' : '📦' }}</span><div><small>{{ productLabel(selectedDelivery.product_type) }}</small><strong>{{ statusLabel(selectedDelivery.logistics_status) }}</strong><p>{{ selectedDelivery.carrier ? `${selectedDelivery.carrier} · ${selectedDelivery.tracking_no}` : '尚未登记承运商和运单号' }}</p></div></section><section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">🚦</span><div><h3>发货门禁</h3><p>真实门禁由提交时后端再次校验</p></div></div></div><div class="cs-r-gate-grid"><article><span>✅</span><div><strong>最终出检</strong><small>提交时由后端检查真实出检记录</small></div><b>服务端校验</b></article><article :class="deliveryPaymentReady?'is-ready':'is-blocked'"><span>{{ deliveryPaymentReady ? '💳' : '⚠️' }}</span><div><strong>收款 / 结算</strong><small>{{ statusLabel(selectedDelivery.payment_status) }}</small></div><b>{{ deliveryPaymentReady ? '已满足' : '待处理' }}</b></article><article><span>📍</span><div><strong>收货地址</strong><small>当前配送接口未返回地址字段</small></div><b>人工核对</b></article></div></section><section class="cs-r-summary-grid"><div><span>账单状态</span><strong>{{ statusLabel(selectedDelivery.bill_status) }}</strong></div><div><span>收款状态</span><strong>{{ statusLabel(selectedDelivery.payment_status) }}</strong></div><div><span>承运商</span><strong>{{ selectedDelivery.carrier || '待登记' }}</strong></div><div><span>运单号</span><strong>{{ selectedDelivery.tracking_no || '待登记' }}</strong></div></section><section v-if="deliveryCanRegister" class="cs-r-drawer-actions"><span>发货后不可在此重复登记。</span><button class="is-primary" type="button" @click="shippingDialogVisible=true; carrierDraft=''; trackingDraft=''">🚀 登记发货</button></section><section v-else-if="selectedDelivery.logistics_status==='PENDING'" class="cs-r-detail-alert is-warning"><span>⚠️</span><div><strong>暂不能登记发货</strong><p>请先完成收款或确认无需收款，再由服务端校验最终出检。</p></div></section><section v-else class="cs-r-detail-alert is-success"><span>✓</span><div><strong>该订单已经登记物流</strong><p>为避免重复覆盖，不再显示发货登记表单。</p></div></section>
        <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">🗺️</span><div><h3>物流时间线</h3><p>不伪造承运商实时轨迹</p></div></div></div><div class="cs-r-detail-timeline"><article class="is-done"><span class="cs-r-timeline-node">✓</span><div><strong>订单进入配送列表</strong><small>由订单与物流真实状态生成</small></div></article><article :class="deliveryAlreadyShipped?'is-done':'is-current'"><span class="cs-r-timeline-node">🚚</span><div><strong>登记发货</strong><small>{{ deliveryAlreadyShipped ? `${selectedDelivery.carrier || '承运商未记录'} · ${selectedDelivery.tracking_no || '运单未记录'}` : '等待满足发货门禁' }}</small></div></article><article :class="selectedDelivery.logistics_status==='EXCEPTION'?'is-current':'is-pending'"><span class="cs-r-timeline-node">⚠️</span><div><strong>异常跟进</strong><small>{{ selectedDelivery.last_follow_up_note || '当前没有异常跟进记录' }}</small></div></article><article :class="selectedDelivery.logistics_status==='DELIVERED'?'is-done':'is-pending'"><span class="cs-r-timeline-node">🏁</span><div><strong>客户签收</strong><small>{{ selectedDelivery.logistics_status==='DELIVERED' ? '已签收' : '尚无真实签收记录' }}</small></div></article></div><div class="cs-r-capability-empty is-compact"><span>📡</span><strong>未接入承运商实时轨迹</strong><p>页面只展示平台登记数据和人工跟进，避免制造虚假运输节点。</p></div></section>
        <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">🛠️</span><div><h3>配送异常跟进</h3><p>跟进内容仅作为内部记录保存</p></div></div></div><div v-if="deliveryAlreadyShipped" class="cs-r-payment-form"><div class="cs-r-form-grid"><label><span>跟进状态</span><select v-model="logisticsStatusDraft"><option value="EXCEPTION">配送异常</option><option value="FOLLOWING_UP">跟进中</option><option value="RESOLVED">已解决</option></select></label><label class="is-wide"><span>内部跟进说明</span><textarea v-model="logisticsFollowUpDraft" rows="4" placeholder="填写已核实的异常和处理动作"></textarea></label></div><button class="cs-r-primary" type="button" :disabled="pageLoading || !logisticsFollowUpDraft.trim()" @click="saveLogisticsFollowUp">{{ pageLoading ? '保存中…' : '保存异常跟进' }}</button></div><div v-else class="cs-r-capability-empty is-compact"><span>📦</span><strong>订单尚未发货</strong><p>发货前没有配送异常跟进对象。</p></div></section>
        <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">🕘</span><div><h3>操作记录</h3><p>仅展示当前配送接口返回的真实记录</p></div></div></div><div class="cs-r-record-list"><article><div><strong>当前配送状态</strong><span>{{ statusLabel(selectedDelivery.logistics_status) }}</span></div><span class="cs-r-badge is-violet">实时读取</span></article><article v-if="selectedDelivery.last_follow_up_note"><div><strong>最近一次内部跟进</strong><span>{{ selectedDelivery.last_follow_up_note }}</span></div><span class="cs-r-badge is-amber">已保存</span></article></div><div class="cs-r-capability-empty is-compact"><span>🕘</span><strong>完整物流审计接口尚未接入</strong><p>操作人和精确事件时间不会用静态内容代替。</p></div></section>
      </div></el-drawer>
      <el-dialog v-model="shippingDialogVisible" width="760px" :show-close="false" :close-on-click-modal="false" align-center class="cs-r-shipping-dialog" modal-class="cs-r-drawer-overlay"><div v-if="selectedDelivery" class="cs-r-shipping-panel"><header><div><small>REGISTER SHIPMENT</small><h2>登记发货 · {{ selectedDelivery.order_no }}</h2><p>选择承运商并填写真实运单号，提交时服务端再次检查最终出检。</p></div><button type="button" aria-label="关闭发货登记" @click="shippingDialogVisible=false">×</button></header><section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">🚚</span><div><h3>选择承运商</h3><p>可参考常用承运商视觉卡片，也可手工填写</p></div></div></div><div class="cs-r-carrier-grid"><button v-for="option in carrierOptions" :key="option.name" type="button" :class="{active:carrierDraft===option.name || (option.name==='其他承运商' && carrierDraft && !carrierOptions.slice(0,3).some(item=>item.name===carrierDraft))}" @click="carrierDraft=option.name==='其他承运商'?'':option.name"><span>{{ option.icon }}</span><strong>{{ option.mark }}</strong><small>{{ option.name }}</small></button></div></section><section class="cs-r-form-grid"><label><span>承运商名称</span><input v-model="carrierDraft" placeholder="选择上方承运商或手工填写"></label><label><span>真实运单号</span><input v-model="trackingDraft" placeholder="请核对后填写"></label></section><section class="cs-r-gate-grid is-compact"><article><span>✅</span><div><strong>最终出检</strong><small>服务端强制校验</small></div></article><article class="is-ready"><span>💳</span><div><strong>收款 / 结算</strong><small>{{ statusLabel(selectedDelivery.payment_status) }}</small></div></article><article><span>📍</span><div><strong>收货地址</strong><small>请按线下确认地址发件</small></div></article></section><footer><button type="button" @click="shippingDialogVisible=false">取消</button><button class="cs-r-primary" type="button" :disabled="pageLoading || !carrierDraft.trim() || !trackingDraft.trim()" @click="shipSelectedOrder">{{ pageLoading ? '提交中…' : '确认登记发货' }}</button></footer></div></el-dialog>
    </template>

    <template v-else-if="activeRoute === '/cs/outsourcing'">
      <header class="cs-r-heading"><div><h1>外协管理</h1><p>按外发地点与合作方查看已批准外协事项的履约和异常。</p></div><button class="cs-r-primary" type="button" disabled title="当前后端仅提供外协列表和详情">＋ 登记外协</button></header>
      <section class="cs-r-filter-card"><div class="cs-r-segmented"><button v-for="item in [{key:'ALL',label:'全部外发'},{key:'SENT',label:'已发出'},{key:'DELAYED',label:'已延迟'},{key:'RETURNED',label:'已返回'}]" :key="item.key" type="button" :class="{active:outsourcingStatus===item.key}" @click="setOutsourcingStatus(item.key)">{{ item.label }}</button></div><span>{{ filteredOutsourcing.length }} 个批次</span></section>
      <section class="cs-r-table-card"><header class="cs-r-table-toolbar"><div><h3>外协批次</h3><span>{{ filteredOutsourcing.length }} / {{ outsourcingItems.length }} 个批次</span></div></header><table v-if="filteredOutsourcing.length"><thead><tr><th>外协批次</th><th>关联订单</th><th>外协内容</th><th>合作方 / 外发地点</th><th>预计返回</th><th>履约状态</th><th>操作</th></tr></thead><tbody><tr v-for="item in filteredOutsourcing" :key="item.outsourcing_id" :class="{ 'is-overdue': item.overdue || item.is_overdue }" @click="selectOutsourcing(item)"><td><strong>{{ item.batch_no }}</strong><small>#{{ item.outsourcing_id }}</small></td><td><strong>{{ item.order_no }}</strong><small>{{ productLabel(item.product_type) }}</small></td><td>{{ item.item_name }} × {{ item.quantity }}</td><td><strong>{{ item.supplier_name }}</strong><small>地点档案待关联</small></td><td>{{ compactDateTime(item.expected_return_at) }}</td><td><span class="cs-r-badge" :class="item.overdue||item.is_overdue?'is-red':item.status==='RETURNED'?'is-green':'is-amber'">{{ item.overdue||item.is_overdue?'已超期':statusLabel(item.status) }}</span></td><td><button class="cs-r-link" type="button" @click.stop="selectOutsourcing(item)">查看详情</button></td></tr></tbody></table><div v-else class="cs-r-state">当前没有外协批次</div></section>
      <el-drawer v-model="outsourcingDrawerVisible" size="540px" :with-header="false" class="cs-r-drawer" modal-class="cs-r-drawer-overlay"><div v-if="selectedOutsourcing" class="cs-r-drawer-shell"><header class="cs-r-detail-head"><div><small>OUTSOURCING DETAILS</small><h2>{{ selectedOutsourcing.batch_no }}</h2></div><div><span class="cs-r-badge" :class="selectedOutsourcing.overdue||selectedOutsourcing.is_overdue?'is-red':selectedOutsourcing.status==='RETURNED'?'is-green':'is-amber'">{{ selectedOutsourcing.overdue||selectedOutsourcing.is_overdue?'已超期':statusLabel(selectedOutsourcing.status) }}</span><button type="button" aria-label="关闭外协详情" @click="outsourcingDrawerVisible=false">×</button></div></header>
        <div v-if="outsourcingDetailState.loading" class="cs-r-state cs-r-detail-loading"><span class="cs-r-loading-orbit">🏭</span><strong>正在读取外协批次</strong></div>
        <template v-else>
          <section v-if="outsourcingDetailState.error" class="cs-r-detail-alert is-warning"><span>⚠️</span><div><strong>外协详情未完整加载</strong><p>{{ outsourcingDetailState.error }}</p></div><button type="button" @click="selectOutsourcing(selectedOutsourcing)">重试</button></section>
          <section v-if="selectedOutsourcing.overdue||selectedOutsourcing.is_overdue" class="cs-r-detail-alert is-danger"><span>⏰</span><div><strong>该外协批次已经超过预计返回时间</strong><p>{{ selectedOutsourcing.abnormal_note || '当前没有补充异常说明，需要通过既有线下流程跟进。' }}</p></div></section>
          <section class="cs-r-outsourcing-hero"><span>🏭</span><div><small>{{ selectedOutsourcing.supplier_name || '合作方未记录' }}</small><strong>{{ selectedOutsourcing.item_name }}</strong><p>{{ selectedOutsourcing.order_no }} · {{ productLabel(selectedOutsourcing.product_type) }}</p></div><b>× {{ selectedOutsourcing.quantity }}</b></section><section class="cs-r-summary-grid"><div><span>外协批次</span><strong>{{ selectedOutsourcing.batch_no }}</strong></div><div><span>关联订单</span><strong>{{ selectedOutsourcing.order_no }}</strong></div><div><span>合作方</span><strong>{{ selectedOutsourcing.supplier_name || '未记录' }}</strong></div><div><span>外发地点</span><strong>地点档案尚未关联</strong></div><div><span>发出时间</span><strong>{{ compactDateTime(selectedOutsourcing.sent_at) }}</strong></div><div><span>预计返回</span><strong>{{ compactDateTime(selectedOutsourcing.expected_return_at) }}</strong></div><div><span>实际返回</span><strong>{{ compactDateTime(selectedOutsourcing.actual_return_at) }}</strong></div><div><span>履约状态</span><strong>{{ statusLabel(selectedOutsourcing.status) }}</strong></div></section><section class="cs-r-readonly-note"><strong>异常说明</strong><p>{{ selectedOutsourcing.abnormal_note || '当前真实记录中没有异常说明。' }}</p></section>
          <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">🧭</span><div><h3>外协履约进度</h3><p>仅由真实状态和时间字段生成</p></div></div></div><div class="cs-r-detail-timeline"><article class="is-done"><span class="cs-r-timeline-node">📦</span><div><strong>批次建立</strong><small>{{ compactDateTime(selectedOutsourcing.created_at) }}</small></div></article><article :class="selectedOutsourcing.sent_at?'is-done':'is-current'"><span class="cs-r-timeline-node">🚚</span><div><strong>外协发出</strong><small>{{ compactDateTime(selectedOutsourcing.sent_at) }}</small></div></article><article :class="selectedOutsourcing.overdue||selectedOutsourcing.is_overdue?'is-current':'is-pending'"><span class="cs-r-timeline-node">⏳</span><div><strong>预计返回</strong><small>{{ compactDateTime(selectedOutsourcing.expected_return_at) }}</small></div></article><article :class="selectedOutsourcing.actual_return_at?'is-done':'is-pending'"><span class="cs-r-timeline-node">✅</span><div><strong>实际返回</strong><small>{{ compactDateTime(selectedOutsourcing.actual_return_at) }}</small></div></article></div></section>
          <section class="cs-r-capability-empty is-compact"><span>🛠️</span><strong>异常写入能力尚未接入</strong><p>当前接口只能读取异常说明；页面不会提供看似可用但无法保存的按钮。</p></section>
          <section><div class="cs-r-section-title"><div><span class="cs-r-section-emoji">🧾</span><div><h3>操作记录</h3><p>仅展示当前接口提供的真实时间和状态</p></div></div></div><div class="cs-r-record-list"><article><div><strong>外协批次建立</strong><span>{{ compactDateTime(selectedOutsourcing.created_at) }}</span></div><span class="cs-r-badge is-violet">真实时间</span></article><article><div><strong>最近更新</strong><span>{{ compactDateTime(selectedOutsourcing.updated_at) }}</span></div><span class="cs-r-badge" :class="selectedOutsourcing.status==='RETURNED'?'is-green':'is-amber'">{{ statusLabel(selectedOutsourcing.status) }}</span></article></div><div class="cs-r-capability-empty is-compact"><span>🧾</span><strong>完整操作审计尚未接入</strong><p>操作人、批准来源和逐节点变更没有接口时不编造。</p></div></section>
        </template>
      </div></el-drawer>
    </template>

    <template v-else-if="activeRoute === '/cs/settings'">
      <header class="cs-r-heading"><div><h1>设置与账号</h1><p>查看当前登录账号、真实权限和数据范围；未接入的团队与偏好能力显示空态。</p></div><span class="cs-r-count">{{ props.user?.username }}</span></header>
      <div class="cs-r-tab-strip is-large"><button type="button" :class="{active:settingsTab==='TEAM'}" @click="settingsTab='TEAM'">当前账号</button><button type="button" :class="{active:settingsTab==='ASSIGNMENT'}" @click="settingsTab='ASSIGNMENT'">客户分配</button><button type="button" :class="{active:settingsTab==='REPLIES'}" @click="settingsTab='REPLIES'">常用回复</button><button type="button" :class="{active:settingsTab==='PREFERENCES'}" @click="settingsTab='PREFERENCES'">通知与偏好</button></div>
      <section v-if="settingsTab==='TEAM'" class="cs-r-settings-card"><header><span class="cs-r-avatar">{{ props.user?.username.slice(0,1).toUpperCase() }}</span><div><h2>{{ props.user?.username }}</h2><p>{{ props.user?.roles.join(' / ') || '角色未返回' }} · {{ props.user?.dataScope || '数据范围未返回' }}</p></div><span class="cs-r-badge is-green">当前账号</span></header><div class="cs-r-summary-grid"><div><span>用户编号</span><strong>{{ props.user?.userId ?? '未返回' }}</strong></div><div><span>登录账号</span><strong>{{ props.user?.username }}</strong></div><div><span>真实角色</span><strong>{{ props.user?.roles.join(' / ') || '未返回' }}</strong></div><div><span>业务权限</span><strong>{{ props.user?.permissions.length || 0 }} 项</strong></div></div><div v-if="props.user?.permissions.length" class="cs-r-permission-chips"><span v-for="permission in props.user.permissions" :key="permission">{{ permission }}</span></div><div v-else class="cs-r-state">身份接口未返回业务权限</div><div class="cs-r-readonly-note"><strong>团队账号</strong><p>当前接口只返回本人身份，不创建或展示虚构团队成员；账号安全和团队维护由管理端处理。</p></div></section>
      <section v-else-if="settingsTab==='ASSIGNMENT'" class="cs-r-settings-card"><header><div><h2>客户分配</h2><p>客服经理可查看与调整客户负责人；普通岗位只读取自身服务范围。</p></div></header><div class="cs-r-state"><strong>客户级分配接口尚未提供</strong><span>当前只有订单负责人字段，页面不会使用模拟客户分配结果。</span></div></section>
      <section v-else-if="settingsTab==='REPLIES'" class="cs-r-settings-card"><header><div><h2>常用回复</h2><p>快捷回复只填入问单输入框，不自动向客户发送。</p></div><button type="button" disabled>＋ 新增回复</button></header><div class="cs-r-state"><strong>尚未建立真实常用回复</strong><span>团队/个人范围、版本与停用接口接入后在此维护。</span></div></section>
      <section v-else class="cs-r-settings-card"><header><div><h2>通知与显示偏好</h2><p>偏好读取和保存接口尚未提供。</p></div></header><div class="cs-r-state"><strong>暂无真实偏好数据</strong><span>接口接入前不显示默认开启、默认关闭或保存成功等模拟状态。</span></div></section>
    </template>

    <template v-else-if="activeRoute === '/cs/notifications'">
      <header class="cs-r-heading"><div><h1>通知中心</h1><p>查看本人业务通知；已读不表示对应业务已经处理。</p></div><button class="cs-r-primary" type="button" :disabled="unreadCount===0" @click="markAllNotifications">全部标为已读</button></header>
      <section class="cs-r-filter-card"><div class="cs-r-segmented"><button v-for="item in notificationFilterOptions" :key="item.key" type="button" :class="{active:notificationFilter===item.key}" @click="notificationFilter=item.key">{{ item.key === 'UNREAD' ? `${item.label} ${unreadCount}` : item.label }}</button></div></section>
      <section class="cs-r-notification-list"><button v-for="notification in filteredNotifications" :key="notification.notification_id" type="button" :class="{unread:!notification.read_at}" @click="markNotification(notification)"><span class="cs-r-notification-dot" /><div><header><strong>{{ notification.message || '业务通知' }}</strong><small>{{ compactDateTime(notification.created_at) }}</small></header><p>{{ notification.order_no ? `关联订单 ${notification.order_no}` : '系统与业务通知' }}</p></div><b>{{ notification.read_at ? '已读' : '查看' }}</b></button><div v-if="filteredNotifications.length===0" class="cs-r-state">当前筛选下没有通知</div></section>
    </template>

    <template v-else-if="activeRoute === '/cs/help'">
      <header class="cs-r-heading"><div><h1>帮助中心</h1><p>按照当前客服端页面提供可直接执行的操作说明。</p></div><span class="cs-r-count">仅顶栏入口</span></header>
      <div class="cs-r-help-layout"><aside><label class="cs-r-search"><span>⌕</span><input v-model="helpKeyword" type="search" placeholder="搜索操作说明" aria-label="搜索帮助"></label><button v-for="topic in filteredHelpTopics" :key="topic.key" type="button" :class="{active:helpTopic===topic.key}" @click="helpTopic=topic.key">{{ topic.label }}</button><div v-if="filteredHelpTopics.length===0" class="cs-r-state">没有匹配的帮助主题</div></aside><section><div class="cs-r-help-hero"><span>当前页面帮助</span><h2>{{ selectedHelpTopic.title }}</h2><p>{{ selectedHelpTopic.intro }}</p></div><article v-for="article in selectedHelpTopic.articles" :key="article.title"><h3>{{ article.title }}</h3><p>{{ article.body }}</p></article><div class="cs-r-readonly-note"><strong>问题反馈</strong><p>当前没有配置真实管理员联系方式，因此不显示虚构电话或邮箱。请通过组织既有内部渠道联系系统管理员。</p></div></section></div>
    </template>

    <template v-else-if="activeRoute === '/cs/search'">
      <header class="cs-r-heading"><div><h1>全局搜索</h1><p>在当前账号业务范围内查找订单、客户、产品和外协记录。</p></div><span class="cs-r-count">{{ searchResults.length }} 条结果</span></header>
      <section class="cs-r-global-search"><label><span>⌕</span><input v-model="searchInput" type="search" placeholder="输入至少两个字符" aria-label="全局搜索关键词" autofocus></label><p>搜索结果不会包含无权访问记录，也不会展示密码、令牌或对象存储路径。</p></section>
      <section v-if="searchInput.trim().length<2" class="cs-r-state"><strong>请输入至少两个字符</strong><span>可以搜索订单号、客户、产品或外协批次号。</span></section>
      <section v-else-if="searchResults.length===0" class="cs-r-state"><strong>没有找到“{{ searchInput }}”的相关结果</strong><span>缩短关键词，或确认当前账号是否负责该客户。</span></section>
      <section v-else class="cs-r-search-results"><button v-for="result in searchResults" :key="`${result.type}-${result.id}`" type="button" @click="openSearchResult(result)"><span class="cs-r-search-type">{{ result.type }}</span><div><strong>{{ result.title }}</strong><p>{{ result.detail }}</p></div><b>打开记录 →</b></button></section>
    </template>
  </div>
</template>
