<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  createDoctorGateway,
  isDoctorReviewSubmittedRefreshError,
  resolveDoctorGatewayMode
} from './services/doctorGateway'
import DoctorCaseGroupWizard from './DoctorCaseGroupWizard.vue'
import DoctorDynamicFields from './DoctorDynamicFields.vue'
import { provideDoctorLocale, translateDoctorText, type DoctorLocale } from './doctorI18n'
import type {
  ClinicRole,
  DoctorNotification,
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
  PublicProgressItem,
  ReviewType
} from './types/contracts'

const StlViewerDialog = defineAsyncComponent(() => import('../components/StlViewerDialog.vue'))

type CurrentUser = {
  username?: string
  userId?: string | number | null
  clinicId?: number | null
  roles?: string[]
  permissions?: string[]
  dataScope?: string | null
}

type DoctorTimelineEntry = {
  key: string
  title: string
  actor: string
  occurredAt: string
  tone: 'order' | 'message' | 'review'
}

type DoctorOrderSpecEntry = {
  key: string
  label: string
  value: string
}

type ProcessConfirmation = {
  confirmation_code: string
  confirmation_name: string
  confirmation_status: 'PLANNED' | 'AWAITING_DOCTOR' | 'CONFIRMED' | 'REJECTED'
  requested_at: string | null
  responded_at: string | null
  doctor_comment: string | null
  waiting_days: number
  overdue: boolean
}

type DeliveryPlanBillItem = {
  item_code: string
  item_name: string
  pricing_status: string
  amount_cents: number | null
  currency: string
  remark: string | null
}

type DeliveryPlan = {
  order_id: number
  order_type: string
  priority_code: string
  shipping_method: string
  base_cycle_days: number
  process_confirmation_count: number
  process_confirmation_days: number
  waiting_days: number
  production_days: number
  transit_days: number
  computed_delivery_date: string
  doctor_requested_delivery_date: string | null
  variance_days: number | null
  variance_flag: string
  delivery_alert: string | null
  delivery_alert_message: string | null
  estimate_status: 'PLACEHOLDER' | 'CONFIRMED'
  placeholder_rules: string[]
  process_confirmations: ProcessConfirmation[]
  try_in: {
    try_in_required: boolean
    try_in_status: string | null
    can_select_final_product: boolean
  }
  bill_items: DeliveryPlanBillItem[]
}

const upperTeeth = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28']
const lowerTeeth = ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38']

const props = defineProps<{
  token: string
  currentUser: CurrentUser | null
  authenticatedFetch: typeof fetch
}>()

const emit = defineEmits<{
  logout: []
}>()

const pageMetaZh: Record<DoctorPage, { title: string; description: string }> = {
  dashboard: { title: '工作台', description: '查看待处理订单、公开进度与近期业务概览' },
  orders: { title: '订单管理', description: '管理订单资料、外部状态与当前待办' },
  assistant: { title: '订单助手', description: '查询本诊所可查看的订单信息' },
  patients: { title: '患者管理', description: '维护患者档案并关联历史订单' },
  billing: { title: '账单与物流', description: '查看结算、发票退款与物流收货信息' },
  account: { title: '账户设置', description: '管理账户、诊所成员、通知偏好与安全设置' },
  messages: { title: '消息中心', description: '按订单集中处理沟通与确认事项' }
}

const pageMetaEn: Record<DoctorPage, { title: string; description: string }> = {
  dashboard: { title: 'Dashboard', description: 'Review actions, public progress and recent activity' },
  orders: { title: 'Orders', description: 'Manage case files, public status and required actions' },
  assistant: { title: 'Order Assistant', description: 'Query public order information within your access scope' },
  patients: { title: 'Patients', description: 'Maintain patient profiles and linked order history' },
  billing: { title: 'Billing & Delivery', description: 'Review settlements, invoices, refunds and deliveries' },
  account: { title: 'Clinic Settings', description: 'Manage clinic profile, members, notifications and security' },
  messages: { title: 'Messages', description: 'Handle order conversations and review requests' }
}

const roleLabels: Record<ClinicRole, string> = {
  CLINIC_ADMIN: '诊所管理员',
  DOCTOR: '医生',
  RECEPTION: '前台',
  NURSE: '护士'
}
const roleLabelsEn: Record<ClinicRole, string> = {
  CLINIC_ADMIN: 'Clinic Administrator', DOCTOR: 'Doctor', RECEPTION: 'Receptionist', NURSE: 'Nurse'
}

const reviewLabels: Record<ReviewType, string> = {
  CAD_DESIGN: '设计稿确认',
  POST_MILLING_PHOTOS: '切削后照片确认',
  POST_GLAZING_PHOTOS: '上釉后照片确认'
}
const reviewLabelsEn: Record<ReviewType, string> = {
  CAD_DESIGN: 'CAD design review',
  POST_MILLING_PHOTOS: 'Post-milling photo review',
  POST_GLAZING_PHOTOS: 'Post-glazing photo review'
}

const productTypeLabels: Record<string, string> = {
  FIXED_CROWN: '固定修复',
  REGULAR_CROWN: '固定修复',
  FIXED_BRIDGE: '固定桥修复',
  IMPLANT_RESTORATION: '种植修复',
  IMPLANT: '种植修复',
  REMOVABLE_DENTURE: '活动修复',
  REMOVABLE: '活动修复',
  ORTHODONTIC: '正畸产品',
  ORTHODONTICS: '正畸产品',
  CLEAR_ALIGNER: '隐形矫治',
  DIGITAL_DESIGN: '数字化设计'
}
const productTypeLabelsEn: Record<string, string> = {
  FIXED_CROWN: 'Fixed Restoration', REGULAR_CROWN: 'Fixed Restoration', FIXED_BRIDGE: 'Fixed Bridge',
  IMPLANT_RESTORATION: 'Implant Restoration', IMPLANT: 'Implant Restoration',
  REMOVABLE_DENTURE: 'Removable Restoration', REMOVABLE: 'Removable Restoration',
  ORTHODONTIC: 'Orthodontics', ORTHODONTICS: 'Orthodontics', CLEAR_ALIGNER: 'Clear Aligner',
  DIGITAL_DESIGN: 'Digital Design'
}

const productNameLabels: Record<string, string> = {
  FIXED_CROWN: '固定牙冠',
  REGULAR_CROWN: '常规牙冠',
  FIXED_BRIDGE: '固定桥',
  IMPLANT_RESTORATION: '种植修复',
  IMPLANT: '种植修复',
  REMOVABLE_DENTURE: '活动义齿',
  REMOVABLE: '活动义齿',
  REMOVABLE_STEEL: '金属支架活动义齿',
  REMOVABLE_INVISIBLE: '隐形活动义齿',
  ORTHODONTIC: '正畸产品',
  ORTHODONTICS: '正畸产品',
  CLEAR_ALIGNER: '隐形矫治',
  DIGITAL_DESIGN: '数字化设计',
  PRECISION_ATTACHMENT: '精密附件',
  TELESCOPIC_CROWN: '套筒冠',
  VENEER_RESTORATION: '贴面修复'
}
const productNameLabelsEn: Record<string, string> = {
  FIXED_CROWN: 'Fixed Crown', REGULAR_CROWN: 'Standard Crown', FIXED_BRIDGE: 'Fixed Bridge',
  IMPLANT_RESTORATION: 'Implant Restoration', IMPLANT: 'Implant Restoration',
  REMOVABLE_DENTURE: 'Removable Denture', REMOVABLE: 'Removable Denture',
  REMOVABLE_STEEL: 'Metal Framework Denture', REMOVABLE_INVISIBLE: 'Flexible Denture',
  ORTHODONTIC: 'Orthodontic Appliance', ORTHODONTICS: 'Orthodontic Appliance', CLEAR_ALIGNER: 'Clear Aligner',
  DIGITAL_DESIGN: 'Digital Design', PRECISION_ATTACHMENT: 'Precision Attachment',
  TELESCOPIC_CROWN: 'Telescopic Crown', VENEER_RESTORATION: 'Veneer Restoration'
}
const productDisplayNamesEn: Record<string, string> = {
  固定牙冠: 'Fixed Crown', 常规牙冠: 'Standard Crown', 种植冠: 'Implant Crown', 固定桥: 'Fixed Bridge',
  种植修复: 'Implant Restoration', 活动义齿: 'Removable Denture', 局部活动义齿: 'Partial Denture',
  金属支架活动义齿: 'Metal Framework Denture', 隐形活动义齿: 'Flexible Denture', 正畸产品: 'Orthodontic Appliance',
  正畸保持器: 'Orthodontic Retainer', 隐形矫治: 'Clear Aligner', 隐形矫治方案: 'Clear Aligner Plan',
  数字化设计: 'Digital Design', 数字化修复设计: 'Digital Restoration Design', 精密附件: 'Precision Attachment',
  套筒冠: 'Telescopic Crown', 贴面修复: 'Veneer Restoration'
}

type WizardCategoryId = 'fixed' | 'implant' | 'removable' | 'ortho' | 'aligner' | 'design'

const wizardCategories: Array<{ id: WizardCategoryId; icon: string; name: string; note: string; types: string[] }> = [
  { id: 'fixed', icon: '👑', name: '固定修复', note: '牙冠、贴面、嵌体与固定桥', types: ['FIXED_CROWN', 'REGULAR_CROWN', 'FIXED_BRIDGE'] },
  { id: 'implant', icon: '🔩', name: '种植修复', note: '种植冠、桥与个性化基台', types: ['IMPLANT_RESTORATION', 'IMPLANT'] },
  { id: 'removable', icon: '🦷', name: '活动修复', note: '全口义齿与局部义齿', types: ['REMOVABLE_DENTURE', 'REMOVABLE'] },
  { id: 'ortho', icon: '📐', name: '正畸产品', note: '保持器、扩弓器与功能矫治器', types: ['ORTHODONTIC', 'ORTHODONTICS'] },
  { id: 'aligner', icon: '✨', name: '隐形矫治', note: '数字化隐形矫治方案', types: ['CLEAR_ALIGNER'] },
  { id: 'design', icon: '🎨', name: '数字化设计', note: '仅设计、排牙与导板服务', types: ['DIGITAL_DESIGN'] }
]

const wizardToothNumbers = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

const doctorOrderFallbackLabels: Record<string, string> = {
  material: '材料',
  shade: '色号',
  shade_system: '比色系统',
  margin: '边缘设计',
  margin_type: '边缘类型',
  contact: '邻接要求',
  contact_requirement: '邻接要求',
  occlusal: '咬合要求',
  occlusion: '咬合要求',
  manufacturing: '制作方式',
  method: '制作方式',
  polish: '抛光要求',
  implant_system: '种植系统',
  implant_brand: '种植体品牌',
  implant_dimension: '种植体规格',
  implant_spec: '种植体规格',
  platform: '平台规格',
  emergence: '穿龈轮廓要求',
  retention: '固位方式',
  units: '单位数',
  pontic: '桥体设计',
  arch: '牙弓范围',
  case_type: '病例类型'
}
const doctorOrderFallbackLabelsEn: Record<string, string> = {
  material: 'Material', shade: 'Shade', shade_system: 'Shade System', margin: 'Margin Design',
  margin_type: 'Margin Type', contact: 'Contact Requirement', contact_requirement: 'Contact Requirement',
  occlusal: 'Occlusal Requirement', occlusion: 'Occlusal Requirement', manufacturing: 'Manufacturing Method',
  method: 'Manufacturing Method', polish: 'Polishing Requirement', implant_system: 'Implant System',
  implant_brand: 'Implant Brand', implant_dimension: 'Implant Size', implant_spec: 'Implant Size',
  platform: 'Platform Size', emergence: 'Emergence Profile', retention: 'Retention Method', units: 'Units',
  pontic: 'Pontic Design', arch: 'Arch', case_type: 'Case Type'
}

const doctorOrderDuplicateFieldKeys = new Set([
  'patient_name', 'patientname', 'patient', '患者姓名',
  'tooth_position', 'toothposition', 'tooth', 'teeth', 'tooth_no', 'tooth_number', '牙位',
  'product', 'product_type', 'product_name', '产品', '产品类型', '产品名称',
  'clinic', 'clinic_name', 'doctor', 'doctor_name', '诊所', '医生'
])

const doctorOrderPatientFieldKeys = new Set([
  'patient_name', 'patientname', 'patient', '患者姓名'
])

const doctorOrderToothFieldKeys = new Set([
  'tooth_position', 'toothposition', 'tooth', 'teeth', 'tooth_no', 'tooth_number', '牙位'
])

const doctorOrderTechnicalFieldPattern = /(^|_)(demo|acceptance|marker|scenario|test|internal|debug|mock|fixture)(_|$)/i

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
  UPLOADED: '已上传',
  PENDING_PAYMENT: '待支付',
  PARTIALLY_PAID: '部分支付',
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
  UNKNOWN: '暂未记录',
  PENDING_QUOTE: '待报价',
  DIRECT: '已发送',
  SUPERSEDED: '已被新版本替代',
  REVISION_REQUESTED: '待修改',
  REVISING: '修改中',
  WAITING: '等待提交',
  NOT_REQUESTED: '未启用'
}
const statusLabelsEn: Record<string, string> = {
  DRAFT: 'Draft', SUBMITTED: 'Submitted', UNDER_REVIEW: 'Under Review', NEEDS_INFO: 'Additional Information Required',
  IN_PRODUCTION: 'In Production', PRODUCTION_COMPLETED: 'Production Completed', READY_TO_DISPATCH: 'Ready to Ship',
  SHIPPED: 'Shipped', DELIVERED_PENDING_CONFIRMATION: 'Delivered — Awaiting Confirmation', COMPLETED: 'Completed',
  AWAITING_PAYMENT: 'Payment Due', DESIGN_REVIEW_REQUIRED: 'Design Review Required',
  POST_MILLING_REVIEW_REQUIRED: 'Photo Review Required', SUPPLEMENT_REQUIRED: 'Additional Information Required',
  PAYMENT_REQUIRED: 'Complete Payment', RECEIPT_CONFIRMATION_REQUIRED: 'Confirm Receipt', NONE: 'No Action Required',
  PAID: 'Paid', UNPAID: 'Unpaid', ISSUED: 'Issued', UPLOADED: 'Uploaded', PENDING_PAYMENT: 'Payment Pending',
  PARTIALLY_PAID: 'Partially Paid', OPEN: 'Open', SETTLED: 'Settled', PENDING_REVIEW: 'Pending Review',
  PENDING: 'Pending', IN_TRANSIT: 'In Transit', ACTIVE: 'Active', PENDING_ACTIVATION: 'Pending Activation',
  DISABLED: 'Disabled', APPROVED: 'Approved', REJECTED: 'Rejected', UNKNOWN: 'Not Recorded',
  PENDING_QUOTE: 'Quote Pending', DIRECT: 'Sent', SUPERSEDED: 'Superseded', REVISION_REQUESTED: 'Revision Requested',
  REVISING: 'Under Revision', WAITING: 'Waiting for Submission', NOT_REQUESTED: 'Not Requested'
}

const categoryLabels: Record<string, string> = {
  ORDER: '订单', REVIEW: '确认', MESSAGE: '消息', BILLING: '账单', LOGISTICS: '物流', SYSTEM: '系统'
}
const categoryLabelsEn: Record<string, string> = {
  ORDER: 'Order', REVIEW: 'Review', MESSAGE: 'Message', BILLING: 'Billing', LOGISTICS: 'Delivery', SYSTEM: 'System'
}

const publicProgressLabelsEn: Record<string, string> = {
  review: 'Records Review',
  design: 'Treatment Plan Design',
  production: 'In Production',
  'final-review': 'Final Product Review',
  'ready-to-ship': 'Ready to Ship',
  shipped: 'In Delivery',
  completed: 'Completed'
}
const publicProgressNotesEn: Record<string, string> = {
  review: 'Order records are under review.',
  design: 'The records have been approved and the treatment plan is being prepared.',
  production: 'The plan is confirmed and production is underway.',
  'final-review': 'The finished product is under final review.',
  'ready-to-ship': 'The finished product is ready and awaiting dispatch.',
  shipped: 'The order has shipped. See Billing & Delivery for tracking.',
  completed: 'The order is complete.'
}
const publicOrderMessagesEn: Record<string, string> = {
  '暂无公开进度说明': 'No public progress update is available.',
  '订单仍为草稿，提交后进入资料审核': 'The order is still a draft. Submit it to begin records review.',
  '订单已提交，正在审核资料': 'The order has been submitted and its records are under review.',
  '订单已提交，等待订单服务确认资料': 'The order has been submitted and is awaiting record confirmation by Order Support.',
  '订单已通过审核，正在进行设计相关工作': 'The records have been approved and design work is underway.',
  '订单正在生产中': 'The order is in production.',
  '订单正在质检中': 'The order is undergoing final quality review.',
  '订单已通过质检，等待发货': 'The order has passed final review and is awaiting dispatch.',
  '订单已发货，请关注物流信息': 'The order has shipped. Check Billing & Delivery for tracking.',
  '订单已完成': 'The order is complete.',
  '订单正按已确认的公开进度处理': 'The order is proceeding through the confirmed public workflow.',
  '请补充比色照片，补齐后将继续审核': 'Please add a shade photo. Review will continue after the record is complete.'
}
const notificationTitlesEn: Record<DoctorNotification['category'], string> = {
  ORDER: 'Order Notification',
  REVIEW: 'Review Notification',
  MESSAGE: 'New Message',
  BILLING: 'Billing Notification',
  LOGISTICS: 'Delivery Notification',
  SYSTEM: 'System Notification'
}
const notificationSummariesEn: Record<string, string> = {
  '客服审核通过，等待生产审核': 'Order Support review passed. Production review is pending.',
  '订单已发货': 'The order has shipped.',
  '收款记录已更新': 'The payment record has been updated.',
  '账单已上传': 'The bill has been uploaded.',
  '设计稿待医生确认': 'A design draft is awaiting doctor review.'
}
const logisticsEventLabelsEn: Record<string, string> = {
  '医生已确认收货': 'Receipt Confirmed by Doctor',
  '订单已发货': 'Order Shipped',
  '配送状态已更新': 'Shipment Updated',
  '已发出': 'Dispatched',
  '运输中': 'In Transit',
  '已送达': 'Delivered'
}

const activePage = ref<DoctorPage>('dashboard')
const loading = ref(true)
const loadError = ref('')
const dataset = ref<DoctorPortalDataset | null>(null)
const gateway = createDoctorGateway({
  token: props.token,
  displayName: props.currentUser?.username || '医生',
  clinicName: '当前诊所',
  authenticatedFetch: props.authenticatedFetch
})
const dataMode = resolveDoctorGatewayMode()

watch(() => props.token, (nextToken) => {
  gateway.updateToken(nextToken)
})

const activeRole = ref<ClinicRole>('DOCTOR')
const roleMenuOpen = ref(false)
const availableRoles = ref<ClinicRole[]>(['DOCTOR'])
const storedDoctorLocale = window.localStorage.getItem('doctor-portal-language')
const portalLanguage = ref<DoctorLocale>(storedDoctorLocale === 'EN' ? 'EN' : 'ZH')
provideDoctorLocale(portalLanguage)
const dateInputType = computed(() => portalLanguage.value === 'EN' ? 'text' : 'date')
const dateInputPlaceholder = computed(() => portalLanguage.value === 'EN' ? 'YYYY-MM-DD' : undefined)
watch(portalLanguage, (language) => {
  document.title = language === 'EN' ? 'PrecisionDental Lab — Doctor Portal' : 'AI 智能下单与生产协同平台'
}, { immediate: true })
const globalKeyword = ref('')
const globalSearchOpen = ref(false)
const notificationOpen = ref(false)
const notificationKeyword = ref('')
const notificationFilter = ref<'ALL' | 'UNREAD' | 'READ'>('ALL')

const orderKeyword = ref('')
const orderStatus = ref('ALL')
const orderProduct = ref('ALL')
const orderQuick = ref('ALL')
const orderDoctor = ref('ALL')
const orderTag = ref('ALL')
const orderDateFrom = ref('')
const orderDateTo = ref('')
const orderFiltersExpanded = ref(false)
const orderPage = ref(1)
const selectedOrderIds = ref<string[]>([])
const orderDrawerOpen = ref(false)
const selectedOrder = ref<OrderDetail | null>(null)
const orderDetailLoading = ref(false)
const orderDrawerMessageDraft = ref('')
const orderDrawerMessageSending = ref(false)

// TASK-034 F 批次：交期计划、过程确认与试戴。
// estimate_status = PLACEHOLDER 表示交期用了客户尚未确认的标准周期，界面必须标「待确认」——
// 这条不是装饰，占位值表现成正式承诺交期就是对客户的误导。
const deliveryPlan = ref<DeliveryPlan | null>(null)
const deliveryPlanLoading = ref(false)
const deliveryPlanBusy = ref(false)
const requestedDeliveryDateDraft = ref('')

const patientKeyword = ref('')
const patientStatus = ref<'ALL' | PatientSummary['treatment_status']>('ALL')
const wizardPatientKeyword = ref('')
const patientDrawerOpen = ref(false)
const patientDrawerTab = ref<'basic' | 'orders' | 'history'>('basic')
const selectedPatient = ref<PatientDetail | null>(null)
const patientLoading = ref(false)
const patientDialogOpen = ref(false)
const patientEditMode = ref(false)
const patientSaving = ref(false)
const newPatient = reactive({
  name: '', age: '', gender: '', dateOfBirth: '', phone: '', email: '', medicalNotes: '',
  treatmentStatus: 'IN_TREATMENT' as PatientSummary['treatment_status'], treatmentStartedAt: '',
  treatmentEndedAt: '', oralDescription: '', tags: ''
})

const billingTab = ref<'perOrder' | 'monthly' | 'invoiceRefund' | 'logistics'>('perOrder')
const billingStatus = ref<'ALL' | 'UNPAID' | 'PAID' | 'OVERDUE'>('ALL')
const bulkInvoiceDownloading = ref(false)
const downloadableInvoiceRefunds = computed(() => dataset.value?.invoiceRefunds
  .filter((record) => Boolean(record.record_id)) ?? [])
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
  { role: 'ASSISTANT', content: t('您好，我可以帮您查询订单公开进度、待办、账单与物流信息。', 'Hello. I can help you check public order progress, actions, billing, and shipment information.') }
])

const accountTab = ref<'profile' | 'members' | 'notifications' | 'security'>('profile')
const memberDialogOpen = ref(false)
const newMember = reactive({ displayName: '', email: '', role: 'DOCTOR' as ClinicRole, billing: 'VIEW', logistics: 'VIEW' })
const passwordForm = reactive({ current: '', next: '', confirm: '' })

const wizardOpen = ref(false)
const wizardInitialPatientId = ref('')
const wizardInitialGroupId = ref<number | null>(null)
const wizardStep = ref(1)
const wizardSaving = ref(false)
const wizardSubmitting = ref(false)
const wizardUploading = ref(false)
const wizardNotice = ref('')
const wizardUploadedFileSignatures = ref<Record<string, string>>({})
const wizardCategory = ref<WizardCategoryId>('fixed')
const wizardSelectedTeeth = ref<number[]>([])
const wizardToothMode = ref<'RESTORE' | 'MISSING'>('RESTORE')
const wizardDragActive = ref(false)
const wizard = reactive<OrderDraftInput>({
  draftOrderId: undefined,
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
const filePreviewLoading = ref(false)
const reviewSubmitting = ref(false)

const navGroups = computed(() => [
  {
    label: t('工作台', 'Workspace'),
    items: [
      { page: 'dashboard' as DoctorPage, label: t('首页概览', 'Dashboard'), icon: '⌂' },
      { page: 'orders' as DoctorPage, label: t('我的订单', 'My Orders'), icon: '▤' },
      ...(activeRole.value === 'DOCTOR' ? [{ page: 'assistant' as DoctorPage, label: t('订单助手', 'Order Assistant'), icon: '✦' }] : []),
      { page: 'patients' as DoctorPage, label: t('患者档案', 'Patients'), icon: '♙' },
      { page: 'billing' as DoctorPage, label: t('账单中心', 'Billing'), icon: '▧' }
    ]
  },
  {
    label: t('诊所与账户', 'Clinic & Account'),
    items: [
      { page: 'messages' as DoctorPage, label: t('消息中心', 'Messages'), icon: '✉' },
      { page: 'account' as DoctorPage, label: t('诊所设置', 'Clinic Settings'), icon: '⚙' }
    ]
  }
])

const currentMeta = computed(() => (portalLanguage.value === 'EN' ? pageMetaEn : pageMetaZh)[activePage.value])
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
    const matchesDoctor = orderDoctor.value === 'ALL' || order.doctor_name === orderDoctor.value
    const matchesTag = orderTag.value === 'ALL' || order.tags.includes(orderTag.value)
    const createdDate = doctorLocalDateKey(order.created_at)
    const matchesDate = (!orderDateFrom.value || createdDate >= orderDateFrom.value) && (!orderDateTo.value || createdDate <= orderDateTo.value)
    const matchesQuick = orderQuick.value === 'ALL'
      || (orderQuick.value === 'TODO' && order.current_action !== 'NONE')
      || (orderQuick.value === 'DUE' && isDueSoon(order))
      || (orderQuick.value === 'DRAFT' && order.external_status === 'DRAFT')
      || (orderQuick.value === 'DELIVERY' && ['SHIPPED', 'DELIVERED_PENDING_CONFIRMATION'].includes(order.external_status))
      || (orderQuick.value === 'PAYMENT' && order.current_action === 'PAYMENT_REQUIRED')
    return matchesKeyword && matchesStatus && matchesProduct && matchesDoctor && matchesTag && matchesDate && matchesQuick
  })
})

const orderDoctors = computed(() => Array.from(new Set((dataset.value?.orders ?? []).map((item) => item.doctor_name))))
const orderTags = computed(() => Array.from(new Set((dataset.value?.orders ?? []).flatMap((item) => item.tags))))
const orderProductTypes = computed(() => Array.from(new Set((dataset.value?.products ?? []).map((item) => item.product_type))))

const orderPageSize = 6
const pagedOrders = computed(() => orderRows.value.slice((orderPage.value - 1) * orderPageSize, orderPage.value * orderPageSize))

const patientRows = computed(() => {
  const keyword = patientKeyword.value.trim().toLowerCase()
  return (dataset.value?.patients ?? []).filter((patient) => {
    const matchesKeyword = !keyword || [patient.patient_name, patient.patient_code, patient.doctor_name, patient.clinic_name, patient.phone, patient.email, patient.oral_description, ...patient.tags].join(' ').toLowerCase().includes(keyword)
    return matchesKeyword && (patientStatus.value === 'ALL' || patientTreatmentState(patient) === patientStatus.value)
  })
})

const billingRows = computed(() => (dataset.value?.bills ?? []).filter((item) => {
  if (billingStatus.value === 'ALL') return true
  if (billingStatus.value === 'OVERDUE') return item.outstanding.amount_minor > 0 && item.due_at < dashboardToday.value
  if (billingStatus.value === 'UNPAID') return item.outstanding.amount_minor > 0
  return item.payment_status === billingStatus.value
}))

const billingStats = computed(() => {
  const bills = dataset.value?.bills ?? []
  const sum = (selector: (item: DoctorPortalDataset['bills'][number]) => number) => bills.reduce((total, item) => total + selector(item), 0)
  const currency = bills[0]?.amount.currency ?? 'CNY'
  const moneyOf = (amount_minor: number): Money => ({ amount_minor, currency })
  return [
    { label: t('本期账单', 'Current Billing'), value: money(moneyOf(sum((item) => item.amount.amount_minor))), note: t('{count} 笔订单', '{count} order(s)', { count: bills.length }), tone: 'blue' },
    { label: t('待支付', 'Payment Due'), value: money(moneyOf(sum((item) => item.outstanding.amount_minor))), note: t('请在到期日前完成', 'Complete before the due date'), tone: 'amber' },
    { label: t('已逾期', 'Overdue'), value: money(moneyOf(sum((item) => item.due_at < dashboardToday.value ? item.outstanding.amount_minor : 0))), note: t('逾期账单需优先处理', 'Overdue bills require attention'), tone: 'rose' },
    { label: t('年度已支付', 'Paid This Year'), value: money(moneyOf(sum((item) => item.paid.amount_minor))), note: t('本年度累计', 'Year-to-date total'), tone: 'green' },
    { label: t('账户余额', 'Account Balance'), value: money(moneyOf(0)), note: t('暂无可用抵扣余额', 'No available credit'), tone: 'violet' }
  ]
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
    return matchesRead && (!keyword || `${notificationTitle(item)} ${notificationSummary(item)}`.toLowerCase().includes(keyword))
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
const selectedWizardCategory = computed(() => wizardCategories.find((item) => item.id === wizardCategory.value) ?? wizardCategories[0])
const wizardCategoryProducts = computed(() => (dataset.value?.products ?? []).filter((item) => selectedWizardCategory.value.types.includes(item.product_type)))
const wizardCategoryAvailable = computed(() => wizardCategoryProducts.value.length > 0)
const selectedOrderProduct = computed<ProductOption | null>(() => dataset.value?.products.find((item) => item.product_type === selectedOrder.value?.product_type) ?? null)
const selectedOrderFieldLabels = computed(() => new Map(
  (selectedOrderProduct.value?.form_fields ?? []).map((field) => [normalizeDoctorOrderFieldKey(field.key), field.label.trim()])
))
const selectedWizardPatient = computed(() => dataset.value?.patients.find((item) => item.patient_id === wizard.patientId) ?? null)
const wizardPatientRows = computed(() => {
  const keyword = wizardPatientKeyword.value.trim().toLowerCase()
  return (dataset.value?.patients ?? []).filter((patient) => !keyword || [patient.patient_name, patient.patient_code, patient.doctor_name, ...patient.tags].join(' ').toLowerCase().includes(keyword))
})
const selectedProductFields = computed(() => (selectedProduct.value?.form_fields ?? []).filter((field) => {
  const normalizedKey = normalizeDoctorOrderFieldKey(field.key)
  return !doctorOrderPatientFieldKeys.has(normalizedKey) && !doctorOrderToothFieldKeys.has(normalizedKey)
}))
const wizardStlCount = computed(() => wizard.files.filter((candidate) => candidate.kind === 'STL').length)
const wizardSubmitDisabled = computed(() =>
  wizardSubmitting.value
  || wizardSaving.value
  || wizardUploading.value
  || wizardMissingForStep(4).length > 0
)
const clinicRoleOptions = computed(() => (Object.keys(roleLabels) as ClinicRole[]).map((value) => ({ value, name: roleLabel(value) })))
const filePreviewName = computed(() => filePreview.value?.name ?? '')
const selectedOrderToothText = computed(() => orderToothText(selectedOrder.value))
const selectedOrderTeeth = computed(() => new Set(parseDoctorTeeth(selectedOrderToothText.value)))
const selectedOrderClinicalNotes = computed(() => {
  const entries = Object.entries(selectedOrder.value?.form_snapshot ?? {})
    .filter(([key, value]) => isClinicalNoteKey(key) && !isTechnicalDoctorOrderField(key) && value.trim())
    .map(([, value]) => value.trim())
  return [...new Set(entries)].join('\n')
})
const selectedOrderSpecEntries = computed<DoctorOrderSpecEntry[]>(() => Object.entries(selectedOrder.value?.form_snapshot ?? {})
  .flatMap(([key, value]) => {
    const label = doctorOrderFieldLabel(key)
    const displayValue = value.trim()
    return label && displayValue && !isClinicalNoteKey(key) ? [{ key, label, value: displayValue }] : []
  }))
const canSendOrderDrawerMessage = computed(() => selectedOrder.value?.allowed_actions.includes('SEND_MESSAGE') ?? false)
const orderTimelineItems = computed<DoctorTimelineEntry[]>(() => {
  const order = selectedOrder.value
  if (!order) return []
  const items: DoctorTimelineEntry[] = [{
    key: `created-${order.order_id}`,
    title: t('订单已创建', 'Order Created'),
    actor: order.doctor_name,
    occurredAt: order.created_at,
    tone: 'order'
  }]

  order.progress.forEach((progress) => {
    if (!progress.occurred_at) return
    items.push({
      key: `progress-${progress.key}-${progress.occurred_at}`,
      title: publicProgressLabel(progress),
      actor: publicProgressNote(progress) || t('订单服务', 'Order Support'),
      occurredAt: progress.occurred_at,
      tone: 'order'
    })
  })

  order.messages.forEach((message) => {
    items.push({
      key: `message-${message.message_id}`,
      title: t('消息已发送', 'Message Sent'),
      actor: message.sender === 'SELF' ? order.doctor_name : t('订单服务', 'Order Support'),
      occurredAt: message.sent_at,
      tone: 'message'
    })
  })

  order.reviews.forEach((review) => review.versions.forEach((version) => {
    items.push({
      key: `review-${review.review_id}-${version.version}`,
      title: `${reviewLabel(review.review_type)} V${version.version}`,
      actor: `${t('订单服务', 'Order Support')} · ${label(version.status)}`,
      occurredAt: version.submitted_at,
      tone: 'review'
    })
  }))

  return items
    .filter((item) => item.occurredAt && item.occurredAt !== '-')
    .sort((left, right) => doctorDateValue(right.occurredAt) - doctorDateValue(left.occurredAt))
    .slice(0, 16)
})
const dashboardAttentionCount = computed(() => (dataset.value?.orders ?? []).filter((item) => item.current_action !== 'NONE').length)
const pendingTaskOrders = computed(() => (dataset.value?.orders ?? []).filter((item) => item.current_action !== 'NONE').slice(0, 5))
const dashboardToday = computed(() => new Date().toLocaleDateString('sv-SE'))
const dashboardGreeting = computed(() => {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('早上好', 'Good morning') : hour < 18 ? t('下午好', 'Good afternoon') : t('晚上好', 'Good evening')
  return `${greeting}${portalLanguage.value === 'EN' ? ', ' : '，'}${account.value?.display_name || props.currentUser?.username || t('医生', 'Doctor')} 👋`
})
const dashboardContext = computed(() => {
  const now = new Date()
  const locale = portalLanguage.value === 'EN' ? 'en-US' : 'zh-CN'
  const date = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(now)
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(now)
  return t(
    '{date} {weekday} · {clinic} · {count} 项需要处理',
    '{date} {weekday} · {clinic} · {count} item(s) require attention',
    { date, weekday, clinic: account.value?.clinic_name || t('当前诊所', 'Current Clinic'), count: dashboardAttentionCount.value }
  )
})
const dashboardStats = computed(() => {
  const items = dataset.value?.orders ?? []
  return [
    { key: 'today', label: t('今日订单', "Today's Orders"), value: items.filter((item) => doctorLocalDateKey(item.created_at) === dashboardToday.value).length, note: t('今日提交与草稿', 'Submitted and drafted today'), tone: 'blue', icon: '📦' },
    { key: 'production', label: t('制作中', 'In Production'), value: items.filter((item) => item.external_status === 'IN_PRODUCTION').length, note: t('公开进度更新', 'Public progress updates'), tone: 'indigo', icon: '🔬' },
    { key: 'delivery', label: t('即将送达', 'Arriving Soon'), value: items.filter((item) => ['SHIPPED', 'DELIVERED_PENDING_CONFIRMATION'].includes(item.external_status)).length, note: t('配送与收货', 'Delivery and receipt'), tone: 'amber', icon: '🚀' },
    { key: 'reply', label: t('待回复', 'Awaiting Reply'), value: dataset.value?.threads.filter((item) => item.unread).length ?? 0, note: t('消息与沟通', 'Messages and conversations'), tone: 'rose', icon: '⚠️' },
    { key: 'review', label: t('设计待确认', 'Design Review'), value: items.filter((item) => item.current_action.includes('REVIEW')).length, note: t('确认后继续制作', 'Production continues after approval'), tone: 'violet', icon: '✏️' },
    { key: 'due', label: t('到期提醒', 'Due Soon'), value: items.filter((item) => isDueSoon(item)).length, note: t('预计日期临近', 'Estimated date approaching'), tone: 'orange', icon: '🕐' }
  ]
})
const dashboardUpcomingOrders = computed(() => (dataset.value?.orders ?? [])
  .filter((item) => item.due_at !== '-' && item.external_status !== 'COMPLETED')
  .sort((left, right) => left.due_at.localeCompare(right.due_at))
  .slice(0, 3))
const dashboardDeliveryOrders = computed(() => dashboardUpcomingOrders.value.filter((item) =>
  ['SHIPPED', 'DELIVERED_PENDING_CONFIRMATION'].includes(item.external_status)
))
const dashboardDueOrders = computed(() => dashboardUpcomingOrders.value.filter((item) =>
  !['SHIPPED', 'DELIVERED_PENDING_CONFIRMATION'].includes(item.external_status)
))
const dashboardWeeklyCounts = computed(() => {
  const counts = [0, 0, 0, 0, 0, 0]
  const today = new Date(`${dashboardToday.value}T12:00:00`)
  for (const order of dataset.value?.orders ?? []) {
    const created = parseDoctorDateTime(order.created_at)
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
  if (!value) return t('价格待确认', 'Price Pending')
  const symbol = value.currency === 'CNY' ? '¥' : `${value.currency} `
  return `${symbol}${(value.amount_minor / 100).toLocaleString(portalLanguage.value === 'EN' ? 'en-US' : 'zh-CN', { minimumFractionDigits: 2 })}`
}

function t(zh: string, en: string, params: Record<string, string | number | null | undefined> = {}): string {
  return translateDoctorText(portalLanguage.value, zh, en, params)
}

function normalizeSystemText(value: string): string {
  return value.trim().replace(/[。.!！]+$/u, '')
}

function readableCode(value: string): string {
  return value.trim().toLowerCase().split(/[_\s-]+/).filter(Boolean).map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`).join(' ')
}

function publicProgressLabel(item: PublicProgressItem): string {
  if (portalLanguage.value !== 'EN') return item.label
  if (item.key === 'submitted') return item.status === 'DONE' ? 'Order Submitted' : 'Order Pending Submission'
  if (publicProgressLabelsEn[item.key]) return publicProgressLabelsEn[item.key]
  return /[\u3400-\u9fff]/.test(item.label) ? readableCode(item.key) || 'Order Progress' : item.label
}

function publicProgressNote(item: PublicProgressItem): string {
  if (!item.note) return ''
  if (portalLanguage.value !== 'EN') return item.note
  if (item.key === 'submitted') return item.status === 'DONE'
    ? 'The order has entered the public workflow.'
    : 'The order is still a draft. Submit it to begin records review.'
  if (publicProgressNotesEn[item.key]) return publicProgressNotesEn[item.key]
  return /[\u3400-\u9fff]/.test(item.note) ? 'Public progress updated.' : item.note
}

function publicOrderMessage(value: string): string {
  if (portalLanguage.value !== 'EN' || !/[\u3400-\u9fff]/.test(value)) return value
  return publicOrderMessagesEn[normalizeSystemText(value)] || 'Public progress updated. See the timeline above for the current stage.'
}

function notificationTitle(item: DoctorNotification): string {
  return portalLanguage.value === 'EN' ? notificationTitlesEn[item.category] : item.title
}

function notificationSummary(item: DoctorNotification): string {
  if (portalLanguage.value !== 'EN' || item.category === 'MESSAGE' || !/[\u3400-\u9fff]/.test(item.summary)) return item.summary
  const translated = notificationSummariesEn[normalizeSystemText(item.summary)]
  if (translated) return translated
  return `${notificationTitlesEn[item.category]} updated.`
}

function processConfirmationName(confirmation: ProcessConfirmation): string {
  if (portalLanguage.value !== 'EN') return confirmation.confirmation_name
  const reviewName = reviewLabelsEn[confirmation.confirmation_code as ReviewType]
  if (reviewName) return reviewName
  return /[\u3400-\u9fff]/.test(confirmation.confirmation_name)
    ? readableCode(confirmation.confirmation_code) || 'Process Review'
    : confirmation.confirmation_name
}

function billItemName(item: DeliveryPlanBillItem): string {
  if (portalLanguage.value !== 'EN' || !/[\u3400-\u9fff]/.test(item.item_name)) return item.item_name
  if (item.item_code === 'TRY_IN') return 'Try-in'
  if (item.item_code === 'PRODUCT') return 'Final Product'
  return readableCode(item.item_code) || 'Billable Item'
}

function logisticsEventLabel(value: string): string {
  if (portalLanguage.value !== 'EN' || !/[\u3400-\u9fff]/.test(value)) return value
  return logisticsEventLabelsEn[normalizeSystemText(value)] || 'Shipment Updated'
}

function errorText(cause: unknown, zhFallback: string, enFallback: string): string {
  const message = cause instanceof Error ? cause.message.trim() : ''
  if (portalLanguage.value === 'EN') return message && !/[\u3400-\u9fff]/.test(message) ? message : enFallback
  return message || zhFallback
}

function setPortalLanguage(language: DoctorLocale) {
  portalLanguage.value = language
  window.localStorage.setItem('doctor-portal-language', language)
  if (assistantMessages.value.length === 1 && assistantMessages.value[0]?.role === 'ASSISTANT') {
    assistantMessages.value[0].content = t('您好，我可以帮您查询订单公开进度、待办、账单与物流信息。', 'Hello. I can help you check public order progress, actions, billing, and shipment information.')
  }
  ElMessage.success(language === 'EN' ? 'English interface enabled' : '已切换为中文界面')
}

function compactDoctorDateTime(value?: string | null): string {
  if (!value || value === '-') return t('时间未记录', 'Time Not Recorded')
  const date = parseDoctorDateTime(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(portalLanguage.value === 'EN' ? 'en-US' : 'zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
  }).format(date)
}

function preciseDoctorDateTime(value?: string | null): string {
  if (!value || value === '-') return t('时间未记录', 'Time Not Recorded')
  const date = parseDoctorDateTime(value)
  if (Number.isNaN(date.getTime())) return value
  const twoDigits = (candidate: number) => String(candidate).padStart(2, '0')
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}:${twoDigits(date.getSeconds())}`
}

function doctorTimelineDateTime(value?: string | null): string {
  if (!value || value === '-') return t('时间未记录', 'Time Not Recorded')
  const date = parseDoctorDateTime(value)
  if (Number.isNaN(date.getTime())) return value
  const minutes = String(date.getMinutes()).padStart(2, '0')
  if (portalLanguage.value === 'EN') {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
  }
  const period = date.getHours() < 12 ? '上午' : '下午'
  const hour = date.getHours() % 12 || 12
  return `${date.getMonth() + 1}月${date.getDate()}日，${period}${hour}:${minutes}`
}

function parseDoctorDateTime(value: string): Date {
  const normalized = value.trim().replace(' ', 'T')
  const hasExplicitTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized)
  // 后端 LocalDateTime 和 MySQL DATETIME 都使用 Asia/Shanghai，但响应中不带时区。
  // 不能追加 Z（UTC），否则上海浏览器会把 17:15 错误显示成次日 01:15。
  return new Date(hasExplicitTimezone ? normalized : `${normalized}+08:00`)
}

function doctorLocalDateKey(value?: string | null): string {
  if (!value || value === '-') return ''
  const date = parseDoctorDateTime(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 10)
  const twoDigits = (candidate: number) => String(candidate).padStart(2, '0')
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`
}

function doctorDateValue(value: string): number {
  const parsed = parseDoctorDateTime(value).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

function isClinicalNoteKey(key: string): boolean {
  return /(note|instruction|remark|说明|备注|要求|医嘱)/i.test(key)
}

function normalizeDoctorOrderFieldKey(key: string): string {
  return key.trim().replace(/[\s-]+/g, '_').toLowerCase()
}

function isTechnicalDoctorOrderField(key: string): boolean {
  return doctorOrderTechnicalFieldPattern.test(normalizeDoctorOrderFieldKey(key))
}

function doctorOrderFieldLabel(key: string): string | null {
  const normalizedKey = normalizeDoctorOrderFieldKey(key)
  if (doctorOrderDuplicateFieldKeys.has(normalizedKey) || isTechnicalDoctorOrderField(normalizedKey)) return null
  const configuredLabel = selectedOrderFieldLabels.value.get(normalizedKey)
  if (configuredLabel && /[\u3400-\u9fff]/.test(configuredLabel)) return portalLanguage.value === 'EN' ? (doctorOrderFallbackLabelsEn[normalizedKey] ?? configuredLabel) : configuredLabel
  if (doctorOrderFallbackLabels[normalizedKey]) return portalLanguage.value === 'EN' ? doctorOrderFallbackLabelsEn[normalizedKey] : doctorOrderFallbackLabels[normalizedKey]
  return /[\u3400-\u9fff]/.test(key) ? key.trim() : null
}

function orderToothText(order: OrderDetail | null): string {
  if (!order) return t('暂未记录', 'Not Recorded')
  return order.form_snapshot['牙位']
    || order.form_snapshot.tooth_position
    || order.form_snapshot.tooth
    || order.form_snapshot.teeth
    || t('暂未记录', 'Not Recorded')
}

function parseDoctorTeeth(value: string): string[] {
  const selected = new Set<string>()
  const normalized = value.replace(/[—–~至]/g, '-')
  normalized.replace(/([1-4][1-8])\s*-\s*([1-4][1-8])/g, (_match, start: string, end: string) => {
    const startQuadrant = Number(start[0])
    const endQuadrant = Number(end[0])
    const startTooth = Number(start[1])
    const endTooth = Number(end[1])
    if (startQuadrant === endQuadrant) {
      const direction = startTooth <= endTooth ? 1 : -1
      for (let tooth = startTooth; tooth !== endTooth + direction; tooth += direction) selected.add(`${startQuadrant}${tooth}`)
    } else {
      selected.add(start)
      selected.add(end)
    }
    return _match
  })
  normalized.match(/[1-4][1-8]/g)?.forEach((tooth) => selected.add(tooth))
  return [...selected]
}

function fileGlyph(item: DoctorFile): string {
  if (item.kind === 'IMAGE') return '🖼️'
  if (item.kind === 'STL') return '🦷'
  if (item.kind === 'PDF') return '📄'
  return '📎'
}

function currentReviewFiles(review: OrderReview): DoctorFile[] {
  return review.versions.find((version) => version.version === review.current_version)?.files ?? []
}

function label(value: string | null | undefined): string {
  if (!value) return '-'
  return (portalLanguage.value === 'EN' ? statusLabelsEn[value] : statusLabels[value])
    ?? (/^[A-Z][A-Z0-9_]+$/.test(value) ? t('处理中', 'Processing') : value)
}

function reviewLabel(value: ReviewType): string {
  return portalLanguage.value === 'EN' ? reviewLabelsEn[value] : reviewLabels[value]
}

function productTypeLabel(value: string): string {
  return (portalLanguage.value === 'EN' ? productTypeLabelsEn[value] : productTypeLabels[value]) ?? t('定制修复', 'Custom Restoration')
}

function productNameLabel(value: string | null | undefined, productType = ''): string {
  if (!value?.trim()) return t('定制修复', 'Custom Restoration')
  const normalized = value.trim()
  if (portalLanguage.value === 'EN' && productDisplayNamesEn[normalized]) return productDisplayNamesEn[normalized]
  if (productNameLabels[normalized]) return portalLanguage.value === 'EN' ? productNameLabelsEn[normalized] : productNameLabels[normalized]
  if (/^[A-Z][A-Z0-9_]+$/.test(normalized)) return productTypeLabel(productType || normalized)
  return normalized
}

function roleLabel(value: ClinicRole): string {
  return portalLanguage.value === 'EN' ? roleLabelsEn[value] : roleLabels[value]
}

function categoryLabel(value: string): string {
  return (portalLanguage.value === 'EN' ? categoryLabelsEn[value] : categoryLabels[value]) ?? value
}

function notificationPreferenceLabel(value: string): string {
  const zh: Record<string, string> = { ORDER_STATUS: '订单状态', REVIEW_REQUEST: '确认事项', MESSAGE: '订单消息', BILLING: '账单提醒', LOGISTICS: '物流提醒' }
  const en: Record<string, string> = { ORDER_STATUS: 'Order Status', REVIEW_REQUEST: 'Review Requests', MESSAGE: 'Order Messages', BILLING: 'Billing Alerts', LOGISTICS: 'Shipment Alerts' }
  return (portalLanguage.value === 'EN' ? en[value] : zh[value]) ?? value
}

function processConfirmationStatusLabel(value: string): string {
  const zh: Record<string, string> = { PLANNED: '尚未到达该环节', AWAITING_DOCTOR: '等待您确认', CONFIRMED: '已确认', REJECTED: '已要求修改' }
  const en: Record<string, string> = { PLANNED: 'Not Reached', AWAITING_DOCTOR: 'Awaiting Your Confirmation', CONFIRMED: 'Confirmed', REJECTED: 'Changes Requested' }
  return (portalLanguage.value === 'EN' ? en[value] : zh[value]) ?? value
}

function tryInStatusLabel(value: string): string {
  const zh: Record<string, string> = { REQUESTED: '已登记试戴需求，等待工厂安排', COMPLETED: '试戴已完成，可在本订单继续选择成品与材料，无需新建订单', FINALIZED: '成品已选定' }
  const en: Record<string, string> = { REQUESTED: 'Try-in requested; awaiting lab scheduling', COMPLETED: 'Try-in completed. Select the final product and material in this order; no new order is required.', FINALIZED: 'Final product selected' }
  return (portalLanguage.value === 'EN' ? en[value] : zh[value]) ?? value
}

function patientGenderLabel(value: string | null | undefined): string {
  if (!value) return '-'
  const en: Record<string, string> = { 男: 'Male', 女: 'Female', 其他: 'Other' }
  return portalLanguage.value === 'EN' ? (en[value] ?? value) : value
}

function patientTreatmentState(patient: PatientSummary): PatientSummary['treatment_status'] {
  return patient.treatment_status
}

function patientTreatmentLabel(patient: PatientSummary): string {
  const zh = ({ IN_TREATMENT: '治疗中', FOLLOW_UP: '待复诊', TREATMENT_ENDED: '治疗结束', ARCHIVED: '已归档' } as const)[patientTreatmentState(patient)]
  const en = ({ IN_TREATMENT: 'In Treatment', FOLLOW_UP: 'Follow-up Due', TREATMENT_ENDED: 'Treatment Completed', ARCHIVED: 'Archived' } as const)[patientTreatmentState(patient)]
  return t(zh, en)
}

function patientTreatmentTone(patient: PatientSummary): string {
  return ({ IN_TREATMENT: 'success', FOLLOW_UP: 'warning', TREATMENT_ENDED: 'neutral', ARCHIVED: 'neutral' } as const)[patientTreatmentState(patient)]
}

function patientDurationLabel(patient: PatientSummary): string {
  if (!patient.treatment_started_at) return t('尚未记录', 'Not Recorded')
  const start = new Date(`${patient.treatment_started_at.slice(0, 10)}T12:00:00`)
  const endValue = patient.treatment_ended_at || new Date().toISOString().slice(0, 10)
  const end = new Date(`${endValue.slice(0, 10)}T12:00:00`)
  const days = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000))
  if (days < 31) return t('{count} 天', '{count} day(s)', { count: days || 1 })
  const months = Math.floor(days / 30)
  const rest = days % 30
  return rest
    ? t('{months}个月{days}天', '{months} month(s) {days} day(s)', { months, days: rest })
    : t('{months}个月', '{months} month(s)', { months })
}

function patientDate(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : '-'
}

function patientAgeValue(): number | null {
  if (newPatient.age) return Number(newPatient.age)
  if (!newPatient.dateOfBirth) return null
  const birth = new Date(`${newPatient.dateOfBirth}T12:00:00`)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const beforeBirthday = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  if (beforeBirthday) age--
  return Math.max(0, age)
}

function resetPatientForm() {
  Object.assign(newPatient, {
    name: '', age: '', gender: '', dateOfBirth: '', phone: '', email: '', medicalNotes: '',
    treatmentStatus: 'IN_TREATMENT', treatmentStartedAt: new Date().toISOString().slice(0, 10),
    treatmentEndedAt: '', oralDescription: '', tags: ''
  })
}

function openPatientCreate() {
  resetPatientForm()
  patientDialogOpen.value = true
}

function beginPatientEdit() {
  if (!selectedPatient.value) return
  const patient = selectedPatient.value
  Object.assign(newPatient, {
    name: patient.patient_name,
    age: patient.patient_age == null ? '' : String(patient.patient_age),
    gender: patient.patient_gender || '',
    dateOfBirth: patient.date_of_birth || '',
    phone: patient.phone,
    email: patient.email,
    medicalNotes: patient.medical_notes,
    treatmentStatus: patient.treatment_status,
    treatmentStartedAt: patient.treatment_started_at || '',
    treatmentEndedAt: patient.treatment_ended_at || '',
    oralDescription: patient.oral_description,
    tags: patient.tags.join('，')
  })
  patientEditMode.value = true
  patientDrawerTab.value = 'basic'
}

function deliveryProgress(order: OrderSummary): number {
  if (order.external_status === 'DELIVERED_PENDING_CONFIRMATION') return 4
  if (order.external_status === 'SHIPPED') return 3
  if (order.external_status === 'READY_TO_DISPATCH') return 2
  return 1
}

function resetOrderFilters() {
  orderKeyword.value = ''
  orderStatus.value = 'ALL'
  orderProduct.value = 'ALL'
  orderDoctor.value = 'ALL'
  orderTag.value = 'ALL'
  orderDateFrom.value = ''
  orderDateTo.value = ''
  orderQuick.value = 'ALL'
  orderPage.value = 1
}

function withWizardOrderContext(order: OrderSummary): OrderSummary {
  const patient = selectedWizardPatient.value
  const product = selectedProduct.value
  return {
    ...order,
    patient_id: patient?.patient_id ?? order.patient_id,
    patient_code: patient?.patient_code ?? order.patient_code,
    patient_name: patient?.patient_name ?? order.patient_name,
    product_type: product?.product_type ?? order.product_type,
    product_name: product?.product_name ?? order.product_name
  }
}

function upsertOrderSummary(order: OrderSummary) {
  if (!dataset.value) return
  const index = dataset.value.orders.findIndex((item) => item.order_id === order.order_id)
  if (index >= 0) dataset.value.orders.splice(index, 1, order)
  else dataset.value.orders.unshift(order)
}

function applyRefreshedDataset(refreshed: DoctorPortalDataset, guaranteedOrder: OrderSummary) {
  const index = refreshed.orders.findIndex((item) => item.order_id === guaranteedOrder.order_id)
  if (index >= 0) refreshed.orders.splice(index, 1, { ...refreshed.orders[index], ...guaranteedOrder })
  else refreshed.orders.unshift(guaranteedOrder)
  dataset.value = refreshed
  activeThreadId.value = refreshed.threads[0]?.thread_id ?? activeThreadId.value
}

function showHelp() {
  ElMessage.info(t('帮助中心：订单资料、设计确认与账单问题可从右侧消息中心联系订单服务。', 'Help Center: contact Order Support from Messages for order records, design reviews, or billing questions.'))
}

function showSupport() {
  switchPage('messages')
  ElMessage.info(t('已打开消息中心，请选择订单会话联系支持。', 'Messages opened. Select an order conversation to contact support.'))
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
  if (['NEEDS_INFO', 'AWAITING_PAYMENT', 'DELIVERED_PENDING_CONFIRMATION', 'PENDING_REVIEW', 'REVISION_REQUESTED', 'UNPAID', 'PENDING_PAYMENT', 'PARTIALLY_PAID'].includes(value)) return 'warning'
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
    loadError.value = errorText(cause, '医生端数据加载失败', 'Failed to load doctor portal data')
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
    ElMessage.success(t('已切换为{role}身份', 'Switched to {role}', { role: roleLabel(role) }))
  } catch (cause) {
    activeRole.value = previousRole
    ElMessage.error(errorText(cause, '身份切换失败', 'Failed to switch role'))
  } finally {
    loading.value = false
  }
}

async function deliveryApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await props.authenticatedFetch(path, {
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
      const body = await response.json() as { message?: string; msg?: string; error?: string }
      detail = body.message || body.msg || body.error || ''
    } catch {
      detail = ''
    }
    throw new Error(detail || t('请求失败（{status}）', 'Request failed ({status})', { status: response.status }))
  }
  const payload = await response.json() as { data: T }
  return payload.data
}

async function loadDeliveryPlan(orderId: string) {
  deliveryPlan.value = null
  requestedDeliveryDateDraft.value = ''
  // 交期计划在提交时才建立；草稿订单没有计划，静默跳过而不是弹错。
  if (resolveDoctorGatewayMode() !== 'api') return
  deliveryPlanLoading.value = true
  try {
    const plan = await deliveryApi<DeliveryPlan>(`/orders/${orderId}/delivery-plan`)
    deliveryPlan.value = plan
    requestedDeliveryDateDraft.value = plan.doctor_requested_delivery_date ?? plan.computed_delivery_date
  } catch {
    deliveryPlan.value = null
  } finally {
    deliveryPlanLoading.value = false
  }
}

async function saveRequestedDeliveryDate() {
  const orderId = selectedOrder.value?.order_id
  if (!orderId || !requestedDeliveryDateDraft.value || deliveryPlanBusy.value) return
  deliveryPlanBusy.value = true
  try {
    deliveryPlan.value = await deliveryApi<DeliveryPlan>(
      `/orders/${orderId}/delivery-plan/requested-date`,
      {
        method: 'PUT',
        body: JSON.stringify({ requested_delivery_date: requestedDeliveryDateDraft.value })
      }
    )
    ElMessage.success(deliveryPlan.value.variance_flag === 'EARLIER_THAN_FEASIBLE'
      ? t('已提交；该时间早于系统可行交期，订单服务会与您确认', 'Submitted. This date is earlier than the feasible delivery date; Order Support will contact you.')
      : t('要求到货时间已更新', 'Requested delivery date updated'))
  } catch (cause) {
    ElMessage.error(errorText(cause, '更新到货时间失败', 'Failed to update the delivery date'))
  } finally {
    deliveryPlanBusy.value = false
  }
}

async function respondProcessConfirmation(confirmation: ProcessConfirmation, accepted: boolean) {
  const orderId = selectedOrder.value?.order_id
  if (!orderId || deliveryPlanBusy.value) return
  deliveryPlanBusy.value = true
  try {
    await deliveryApi(
      `/orders/${orderId}/process-confirmations/${confirmation.confirmation_code}/respond`,
      { method: 'POST', body: JSON.stringify({ accepted }) }
    )
    await loadDeliveryPlan(orderId)
    ElMessage.success(accepted ? t('已确认', 'Confirmed') : t('已提交修改要求', 'Change request submitted'))
  } catch (cause) {
    ElMessage.error(errorText(cause, '提交确认结果失败', 'Failed to submit confirmation'))
  } finally {
    deliveryPlanBusy.value = false
  }
}

function deliveryDateLabel(plan: DeliveryPlan) {
  return plan.estimate_status === 'PLACEHOLDER'
    ? t('{date}（待确认）', '{date} (Pending Confirmation)', { date: plan.computed_delivery_date })
    : plan.computed_delivery_date
}

async function openOrder(orderId: string) {
  orderDrawerOpen.value = true
  orderDetailLoading.value = true
  selectedOrder.value = null
  orderDrawerMessageDraft.value = ''
  void loadDeliveryPlan(orderId)
  try {
    const detail = await gateway.loadOrderDetail(orderId)
    selectedOrder.value = detail
    if (dataset.value) {
      const summary = dataset.value.orders.find((item) => item.order_id === orderId)
      if (summary) {
        Object.assign(summary, {
          external_status: detail.external_status,
          current_action: detail.current_action,
          allowed_actions: detail.allowed_actions,
          state_version: detail.state_version,
          due_at: detail.due_at,
          quote: detail.quote
        })
      }
      const threadIndex = dataset.value.threads.findIndex((thread) => thread.order_id === orderId)
      const latestMessage = detail.messages.at(-1)
      const thread: MessageThread = {
        thread_id: `TH-${orderId}`,
        order_id: orderId,
        order_no: detail.order_no,
        patient_name: detail.patient_name,
        product_name: detail.product_name,
        unread: false,
        latest_message: latestMessage?.content || t('暂无沟通记录', 'No messages'),
        latest_at: latestMessage?.sent_at || detail.created_at,
        messages: detail.messages
      }
      if (threadIndex >= 0) dataset.value.threads.splice(threadIndex, 1, thread)
      else dataset.value.threads.push(thread)
    }
  } catch (cause) {
    ElMessage.error(errorText(cause, '订单详情加载失败', 'Failed to load order details'))
  } finally {
    orderDetailLoading.value = false
  }
}

async function openPatient(patientId: string) {
  patientDrawerOpen.value = true
  patientDrawerTab.value = 'basic'
  patientLoading.value = true
  selectedPatient.value = null
  patientEditMode.value = false
  try {
    selectedPatient.value = await gateway.loadPatientDetail(patientId)
  } catch (cause) {
    ElMessage.error(errorText(cause, '患者档案加载失败', 'Failed to load patient record'))
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
    void openOrder(item.target_id)
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
    ElMessage.success(t('全部通知已标记为已读', 'All notifications marked as read'))
  } catch (cause) {
    dataset.value.notifications.forEach((item, index) => { item.read = before[index] })
    ElMessage.error(errorText(cause, '操作失败', 'Operation failed'))
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

function openWizard(initialPatientId = '', initialGroupId: number | null = null) {
  if (!canCreateOrder.value) return
  wizardInitialPatientId.value = initialPatientId
  wizardInitialGroupId.value = initialGroupId
  Object.assign(wizard, {
    draftOrderId: undefined,
    patientId: initialPatientId,
    productId: '',
    productType: '',
    caseFields: { tooth: '', case_note: '' },
    dynamicFields: {},
    reviewOptions: [],
    files: []
  })
  wizardStep.value = 1
  wizardCategory.value = 'fixed'
  wizardSelectedTeeth.value = []
  wizardToothMode.value = 'RESTORE'
  wizardDragActive.value = false
  wizardPatientKeyword.value = ''
  wizardNotice.value = ''
  wizardUploadedFileSignatures.value = {}
  wizardOpen.value = true
  chooseWizardCategory('fixed')
}

function resumeSelectedCaseGroup() {
  const order = selectedOrder.value
  if (!order?.group_id || order.external_status !== 'DRAFT') return
  orderDrawerOpen.value = false
  openWizard(order.patient_id, order.group_id)
}

async function handleCaseGroupSubmitted() {
  wizardOpen.value = false
  wizardInitialPatientId.value = ''
  wizardInitialGroupId.value = null
  resetOrderFilters()
  switchPage('orders')
  try {
    dataset.value = await gateway.loadDataset()
  } catch (cause) {
    ElMessage.warning(errorText(cause, '订单已提交，列表刷新失败，请稍后手动刷新', 'Order submitted, but the list could not refresh. Please refresh it manually later.'))
  }
}

function chooseWizardCategory(categoryId: WizardCategoryId) {
  wizardCategory.value = categoryId
  const category = wizardCategories.find((item) => item.id === categoryId)
  const product = (dataset.value?.products ?? []).find((item) => category?.types.includes(item.product_type))
  wizard.productId = product?.product_id ?? ''
  wizard.productType = product?.product_type ?? ''
  wizard.dynamicFields = {}
  wizard.reviewOptions = []
  wizardToothMode.value = categoryId === 'removable' ? 'MISSING' : 'RESTORE'
}

function chooseWizardProduct(product: ProductOption) {
  wizard.productId = product.product_id
  wizard.productType = product.product_type
  wizard.dynamicFields = {}
  wizard.reviewOptions = []
}

function toggleWizardTooth(tooth: number) {
  wizardSelectedTeeth.value = wizardSelectedTeeth.value.includes(tooth)
    ? wizardSelectedTeeth.value.filter((item) => item !== tooth)
    : [...wizardSelectedTeeth.value, tooth].sort((left, right) => left - right)
  wizard.caseFields.tooth = wizardSelectedTeeth.value.join('、')
  wizard.caseFields.tooth_mode = wizardToothMode.value
}

function wizardMissingForStep(step: number): string[] {
  const missing: string[] = []
  if (step >= 1) {
    if (!wizard.patientId) missing.push(t('患者', 'Patient'))
    if (!wizard.productId) missing.push(t('产品', 'Product'))
  }
  if (step >= 2 && !wizard.caseFields.tooth?.trim()) missing.push(t('牙位', 'Tooth Position'))
  if (step >= 3) {
    selectedProductFields.value.filter((field) => field.required).forEach((field) => {
      if (!wizard.dynamicFields[field.key]?.trim()) missing.push(field.label)
    })
  }
  if (step >= 4 && !wizard.files.some((item) => item.kind === 'STL' && item.status === 'READY')) missing.push(t('STL 扫描文件', 'STL Scan'))
  return missing
}

function wizardSubmissionDynamicFields(): Record<string, string> {
  const patientName = selectedWizardPatient.value?.patient_name.trim() ?? ''
  const toothPosition = wizard.caseFields.tooth.trim()
  const fields: Record<string, string> = {
    ...wizard.dynamicFields,
    patient_name: patientName,
    tooth_position: toothPosition
  }
  selectedProduct.value?.form_fields.forEach((field) => {
    const normalizedKey = normalizeDoctorOrderFieldKey(field.key)
    if (doctorOrderPatientFieldKeys.has(normalizedKey)) fields[field.key] = patientName
    if (doctorOrderToothFieldKeys.has(normalizedKey)) fields[field.key] = toothPosition
  })
  return fields
}

async function saveWizardDraft(silent = false) {
  if (wizardSaving.value || wizardSubmitting.value || wizardUploading.value) return false
  if (!wizard.patientId || !wizard.productId) {
    if (!silent) ElMessage.warning(t('选择患者和产品后才能保存草稿', 'Select a patient and product before saving the draft'))
    return false
  }
  wizardSaving.value = true
  try {
    const wasNewDraft = !wizard.draftOrderId
    const saved = withWizardOrderContext(await gateway.saveDraft({
      ...wizard,
      draftOrderId: wizard.draftOrderId,
      dynamicFields: wizardSubmissionDynamicFields(),
      files: [...wizard.files],
      reviewOptions: [...wizard.reviewOptions]
    }))
    wizard.draftOrderId = saved.order_id
    upsertOrderSummary(saved)
    if (wasNewDraft) resetOrderFilters()
    wizardNotice.value = t('草稿已保存 · {time}', 'Draft saved · {time}', { time: new Date().toLocaleTimeString(portalLanguage.value === 'EN' ? 'en-US' : 'zh-CN', { hour: '2-digit', minute: '2-digit' }) })
    if (!silent) ElMessage.success(t('草稿已保存', 'Draft saved'))
    return true
  } catch (cause) {
    ElMessage.error(errorText(cause, '草稿保存失败', 'Failed to save draft'))
    return false
  } finally {
    wizardSaving.value = false
  }
}

async function nextWizardStep() {
  if (wizardSaving.value || wizardSubmitting.value || wizardUploading.value) return
  const missing = wizardMissingForStep(wizardStep.value)
  if (missing.length) {
    ElMessage.warning(t('请先补充：{items}', 'Complete the following first: {items}', { items: missing.join(portalLanguage.value === 'EN' ? ', ' : '、') }))
    return
  }
  const saved = await saveWizardDraft(true)
  if (!saved) return
  wizardStep.value = Math.min(5, wizardStep.value + 1)
}

async function addWizardFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const list = Array.from(input.files ?? [])
  input.value = ''
  await uploadWizardFiles(list)
}

async function handleWizardDrop(event: DragEvent) {
  wizardDragActive.value = false
  await uploadWizardFiles(Array.from(event.dataTransfer?.files ?? []))
}

function wizardFileSignature(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`
}

async function removeWizardFile(file: DoctorFile) {
  const previousFiles = [...wizard.files]
  const previousSignatures = { ...wizardUploadedFileSignatures.value }
  wizard.files = wizard.files.filter((candidate) => candidate.file_id !== file.file_id)
  wizardUploadedFileSignatures.value = Object.fromEntries(
    Object.entries(wizardUploadedFileSignatures.value)
      .filter(([, fileId]) => fileId !== file.file_id)
  )
  if (wizard.draftOrderId && !(await saveWizardDraft(true))) {
    wizard.files = previousFiles
    wizardUploadedFileSignatures.value = previousSignatures
    return
  }
  ElMessage.success(t('已从订单中移除 {file}', 'Removed {file} from the order', { file: file.name }))
}

async function uploadWizardFiles(list: File[]) {
  const accepted = list.filter((item) => /\.(stl|jpg|jpeg|png|pdf)$/i.test(item.name))
  const rejected = list.length - accepted.length
  if (rejected) ElMessage.warning(t('{count} 个文件格式不支持', '{count} file(s) have unsupported formats', { count: rejected }))
  const knownSignatures = new Set(Object.keys(wizardUploadedFileSignatures.value))
  const pending = accepted.filter((file) => {
    const signature = wizardFileSignature(file)
    if (knownSignatures.has(signature)) return false
    knownSignatures.add(signature)
    return true
  })
  const alreadyUploaded = accepted.length - pending.length
  if (alreadyUploaded) ElMessage.info(t('{count} 个已完成文件已跳过，未重复上传', '{count} previously uploaded file(s) skipped', { count: alreadyUploaded }))
  if (!pending.length) return
  if (!wizard.draftOrderId) {
    const saved = await saveWizardDraft(true)
    if (!saved || !wizard.draftOrderId) return
  }
  wizardUploading.value = true
  let completedCount = 0
  try {
    for (const file of pending) {
      const uploaded = await gateway.uploadOrderFiles(wizard.draftOrderId, [file])
      const completed = uploaded[0]
      if (!completed) throw new Error(t('文件 {file} 上传完成后未返回文件记录', 'No file record was returned after uploading {file}', { file: file.name }))
      wizard.files.push(completed)
      wizardUploadedFileSignatures.value = {
        ...wizardUploadedFileSignatures.value,
        [wizardFileSignature(file)]: completed.file_id
      }
      completedCount += 1
    }
    ElMessage.success(t('{count} 个文件已就绪', '{count} file(s) ready', { count: completedCount }))
  } catch (cause) {
    const prefix = completedCount ? t('已有 {count} 个文件完成并已保留；', '{count} file(s) completed and retained; ', { count: completedCount }) : ''
    ElMessage.error(`${prefix}${errorText(cause, '文件上传失败', 'File upload failed')}`)
  } finally {
    wizardUploading.value = false
  }
}

function markThreadUnread(threadId: string) {
  const thread = dataset.value?.threads.find((item) => item.thread_id === threadId)
  if (!thread) return
  thread.unread = true
  ElMessage.success(t('已在当前页面标记为未读', 'Marked as unread on this page'))
}

function downloadInvoice(recordId: string, notify = true) {
  const record = dataset.value?.invoiceRefunds.find((item) => item.record_id === recordId)
  if (!record) return false
  const pdfLines = [
    record.kind === 'INVOICE' ? 'INVOICE RECORD' : 'REFUND RECORD',
    `Record: ${record.record_id}`,
    `Related: ${record.related_no}`,
    `Amount: ${record.amount.currency} ${(record.amount.amount_minor / 100).toFixed(2)}`,
    `Status: ${record.status}`,
    `Date: ${record.created_at}`
  ]
  const escapePdf = (value: string) => value.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)')
  const stream = `BT /F1 18 Tf 54 760 Td (${escapePdf(pdfLines[0])}) Tj /F1 11 Tf${pdfLines.slice(1).map((line) => ` 0 -28 Td (${escapePdf(line)}) Tj`).join('')} ET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${record.record_id}.pdf`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
  if (notify) ElMessage.success(t('PDF 记录已下载', 'PDF record downloaded'))
  return true
}

async function downloadAllInvoices() {
  if (bulkInvoiceDownloading.value) return
  const records = [...downloadableInvoiceRefunds.value]
  if (records.length === 0) {
    ElMessage.info(t('当前没有可下载的发票或退款记录', 'No invoice or refund records are available to download'))
    return
  }
  bulkInvoiceDownloading.value = true
  let completed = 0
  try {
    for (const record of records) {
      if (downloadInvoice(record.record_id, false)) completed += 1
      await new Promise<void>((resolve) => window.setTimeout(resolve, 80))
    }
    ElMessage.success(t('已下载 {count} 份发票或退款记录', 'Downloaded {count} invoice or refund record(s)', { count: completed }))
  } finally {
    bulkInvoiceDownloading.value = false
  }
}

async function submitWizard() {
  const missing = wizardMissingForStep(4)
  if (missing.length) {
    wizardNotice.value = t('提交前还需补充：{items}', 'Complete before submitting: {items}', { items: missing.join(portalLanguage.value === 'EN' ? ', ' : '、') })
    ElMessage.warning(wizardNotice.value)
    return
  }
  wizardSubmitting.value = true
  try {
    const created = withWizardOrderContext(await gateway.submitOrder({
      ...wizard,
      draftOrderId: wizard.draftOrderId,
      dynamicFields: wizardSubmissionDynamicFields(),
      files: [...wizard.files],
      reviewOptions: [...wizard.reviewOptions]
    }))
    upsertOrderSummary(created)
    resetOrderFilters()
    wizardOpen.value = false
    switchPage('orders')
    try {
      applyRefreshedDataset(await gateway.loadDataset(), created)
    } catch {
      upsertOrderSummary(created)
    }
    ElMessage.success(t('订单 {order} 已提交', 'Order {order} submitted', { order: created.order_no }))
  } catch (cause) {
    ElMessage.error(errorText(cause, '订单提交失败', 'Failed to submit order'))
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
    thread.latest_at = t('刚刚', 'Just now')
    messageDraft.value = ''
  } catch (cause) {
    ElMessage.error(errorText(cause, '消息发送失败', 'Failed to send message'))
  } finally {
    sendingMessage.value = false
  }
}

async function sendOrderDrawerMessage() {
  const order = selectedOrder.value
  const content = orderDrawerMessageDraft.value.trim()
  if (!order || !content) return
  if (!order.allowed_actions.includes('SEND_MESSAGE')) {
    ElMessage.warning(t('当前订单暂不支持发送消息', 'This order does not currently support messaging'))
    return
  }

  orderDrawerMessageSending.value = true
  try {
    const threadId = dataset.value?.threads.find((thread) => thread.order_id === order.order_id)?.thread_id ?? `TH-${order.order_id}`
    const item = await gateway.sendMessage(threadId, content)
    if (!order.messages.some((message) => message.message_id === item.message_id)) order.messages.push(item)

    if (dataset.value) {
      let thread = dataset.value.threads.find((candidate) => candidate.order_id === order.order_id)
      if (!thread) {
        thread = {
          thread_id: threadId,
          order_id: order.order_id,
          order_no: order.order_no,
          patient_name: order.patient_name,
          product_name: order.product_name,
          unread: false,
          latest_message: content,
          latest_at: item.sent_at,
          messages: order.messages
        }
        dataset.value.threads.push(thread)
      } else {
        if (!thread.messages.some((message) => message.message_id === item.message_id)) thread.messages.push(item)
        thread.latest_message = content
        thread.latest_at = item.sent_at
      }
    }

    orderDrawerMessageDraft.value = ''
    ElMessage.success(t('消息已发送给订单服务', 'Message sent to Order Support'))
    window.setTimeout(() => {
      const stream = document.querySelector<HTMLElement>('[data-testid="doctor-order-dialogue"]')
      stream?.scrollTo({ top: stream.scrollHeight, behavior: 'smooth' })
    })
  } catch (cause) {
    ElMessage.error(errorText(cause, '消息发送失败', 'Failed to send message'))
  } finally {
    orderDrawerMessageSending.value = false
  }
}

function startReviewDecision(orderId: string, review: OrderReview, decision: 'APPROVE' | 'REJECT') {
  if (reviewSubmitting.value) return
  const action = decision === 'APPROVE' ? 'APPROVE_REVIEW' : 'REJECT_REVIEW'
  if (!canReview.value || review.status !== 'PENDING_REVIEW' || !review.allowed_actions.includes(action)) return
  reviewTarget.value = { orderId, review }
  if (decision === 'REJECT') {
    rejectReason.value = ''
    rejectDialogOpen.value = true
    return
  }
  void ElMessageBox.confirm(t('同意后，对方将按当前版本继续后续制作。请确认已完成检查。', 'After approval, production will continue using the current version. Confirm that you have completed your review.'), t('确认同意当前版本', 'Approve Current Version'), {
    confirmButtonText: t('确认同意', 'Approve'), cancelButtonText: t('再检查一下', 'Review Again'), type: 'warning'
  }).then(() => submitReviewDecision('APPROVE')).catch(() => undefined)
}

function applyRefreshedReviewOrder(orderId: string, refreshed: OrderDetail) {
  if (selectedOrder.value?.order_id === orderId) selectedOrder.value = refreshed
  const summary = dataset.value?.orders.find((order) => order.order_id === orderId)
  if (summary) {
    Object.assign(summary, {
      external_status: refreshed.external_status,
      current_action: refreshed.current_action,
      allowed_actions: refreshed.allowed_actions,
      state_version: refreshed.state_version,
      due_at: refreshed.due_at,
      quote: refreshed.quote
    })
  }
  dataset.value?.threads.forEach((thread) => thread.messages.forEach((message) => {
    const refreshedReview = refreshed.reviews.find((item) => item.review_id === message.review?.review_id)
    if (message.review && refreshedReview) Object.assign(message.review, refreshedReview)
  }))
}

async function submitReviewDecision(decision: 'APPROVE' | 'REJECT') {
  const target = reviewTarget.value
  if (!target || reviewSubmitting.value) return
  if (decision === 'REJECT' && !rejectReason.value.trim()) {
    ElMessage.warning(t('驳回时必须填写修改意见', 'A change request is required when rejecting a version'))
    return
  }
  reviewSubmitting.value = true
  try {
    let usedSubmittedFallback = false
    let updated: OrderReview
    try {
      updated = await gateway.submitReview({
        orderId: target.orderId,
        reviewId: target.review.review_id,
        decision,
        comment: decision === 'REJECT' ? rejectReason.value.trim() : undefined,
        stateVersion: target.review.state_version,
        idempotencyKey: crypto.randomUUID()
      })
    } catch (cause) {
      if (!isDoctorReviewSubmittedRefreshError(cause)) throw cause
      usedSubmittedFallback = true
      updated = cause.submittedReview
    }
    const mergeReview = (review: OrderReview) => {
      if (!usedSubmittedFallback) {
        Object.assign(review, updated)
        return
      }
      review.status = updated.status
      review.current_version = updated.current_version
      review.allowed_actions = updated.allowed_actions
      review.state_version = updated.state_version
      const submittedVersion = updated.versions.find((item) => item.version === updated.current_version)
      const existingVersion = review.versions.find((item) => item.version === updated.current_version)
      if (submittedVersion && existingVersion) {
        existingVersion.status = submittedVersion.status
        existingVersion.doctor_comment = submittedVersion.doctor_comment
      } else if (submittedVersion) {
        review.versions.push(submittedVersion)
      }
    }
    mergeReview(target.review)
    dataset.value?.threads.forEach((thread) => thread.messages.forEach((message) => {
      if (message.review?.review_id === updated.review_id) mergeReview(message.review)
    }))
    if (selectedOrder.value?.order_id === target.orderId) {
      const orderReview = selectedOrder.value.reviews.find((item) => item.review_id === updated.review_id)
      if (orderReview) mergeReview(orderReview)
      if (!selectedOrder.value.reviews.some((item) => item.status === 'PENDING_REVIEW') && selectedOrder.value.current_action.includes('REVIEW')) {
        selectedOrder.value.current_action = 'NONE'
        selectedOrder.value.allowed_actions = selectedOrder.value.allowed_actions
          .filter((action) => !['APPROVE_REVIEW', 'REJECT_REVIEW'].includes(action))
      }
    }
    const summary = dataset.value?.orders.find((order) => order.order_id === target.orderId)
    if (summary?.current_action.includes('REVIEW') && target.review.status !== 'PENDING_REVIEW') {
      summary.current_action = 'NONE'
      summary.allowed_actions = summary.allowed_actions
        .filter((action) => !['APPROVE_REVIEW', 'REJECT_REVIEW'].includes(action))
    }
    rejectDialogOpen.value = false
    try {
      const refreshed = await gateway.loadOrderDetail(target.orderId)
      applyRefreshedReviewOrder(target.orderId, refreshed)
    } catch {
      ElMessage.warning(usedSubmittedFallback
        ? t('确认已提交，但最新公开状态仍无法读取；页面已保留提交结果，请稍后刷新核对', 'Confirmation submitted, but the latest public status is still unavailable. The submitted result is retained; refresh later to verify.')
        : t('确认已提交，但订单最新公开状态读取失败，请稍后刷新', 'Confirmation submitted, but the latest public order status could not be loaded. Refresh later.'))
    }
    ElMessage.success(decision === 'APPROVE' ? t('已同意当前版本，对方可以继续制作', 'Current version approved; production can continue') : t('已驳回并发送修改意见', 'Version rejected and change request sent'))
  } catch (cause) {
    try {
      const reconciled = await gateway.loadOrderDetail(target.orderId)
      const reconciledReview = reconciled.reviews.find((review) => review.review_id === target.review.review_id)
      const expectedStatus = decision === 'APPROVE' ? 'APPROVED' : 'REVISION_REQUESTED'
      if (reconciledReview?.status === expectedStatus) {
        applyRefreshedReviewOrder(target.orderId, reconciled)
        rejectDialogOpen.value = false
        ElMessage.success(decision === 'APPROVE'
          ? t('服务器已完成版本确认，页面状态已重新同步', 'The server confirmed the version and the page has been resynchronized')
          : t('服务器已收到驳回意见，页面状态已重新同步', 'The server received the change request and the page has been resynchronized'))
        return
      }
    } catch {
      // 提交请求结果不明确且暂时无法回读时，保留原始错误供用户重试。
    }
    ElMessage.error(errorText(cause, '确认操作失败', 'Review action failed'))
  } finally {
    reviewSubmitting.value = false
  }
}

async function previewFile(item: DoctorFile) {
  if (filePreviewLoading.value) return
  filePreviewLoading.value = true
  try {
    const previewUrl = await gateway.getFilePreviewUrl(item.file_id)
    const freshFile = { ...item, preview_url: previewUrl }
    if (item.kind === 'STL') {
      viewerFile.value = freshFile
      viewerOpen.value = true
    } else {
      filePreview.value = freshFile
      filePreviewOpen.value = true
    }
  } catch (cause) {
    ElMessage.error(errorText(cause, '文件预览失败', 'Failed to preview file'))
  } finally {
    filePreviewLoading.value = false
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
    if (!contextOrder) {
      // 问题定位不到订单时兜底转 AI-6 常见问题，而不是直接报「请选择订单」。
      await answerWithFaq(question)
      return
    }
    const gatewayQuestion = portalLanguage.value === 'EN' ? `Please answer in English. ${question}` : question
    const response = await gateway.askAssistant(gatewayQuestion, contextOrder.order_id)
    assistantMessages.value.push({ role: 'ASSISTANT', content: response.answer, orderIds: response.orderIds })
  } catch (cause) {
    assistantMessages.value.push({ role: 'ASSISTANT', content: errorText(cause, '查询暂时不可用', 'The assistant is temporarily unavailable') })
  } finally {
    assistantLoading.value = false
  }
}

async function askFaq(question: string) {
  const trimmed = question.trim()
  if (!trimmed) return
  assistantMessages.value.push({ role: 'SELF', content: trimmed })
  assistantQuestion.value = ''
  assistantLoading.value = true
  try {
    await answerWithFaq(trimmed)
  } finally {
    assistantLoading.value = false
  }
}

async function answerWithFaq(question: string) {
  try {
    const englishFaqAnswers: Record<string, string> = {
      'What information is required to place an order?': 'Select a patient and product, specify the tooth position and clinical requirements, and upload the required STL scan. Photos or PDF instructions may also be added when relevant.',
      'Which intraoral scan formats are supported?': 'STL is supported for intraoral scans. You can also attach JPG, PNG, and PDF files. At least one STL file is required when the selected product calls for a scan.',
      'How long will my order take?': 'The estimated delivery date is shown after Order Support reviews the case. Any date marked Pending Confirmation is provisional and is not a committed delivery date.',
      'What if the product needs a remake?': 'Contact Order Support from the order conversation and describe the fit or quality issue with supporting photos or files. The lab will review the case and confirm the next action.'
    }
    if (portalLanguage.value === 'EN' && englishFaqAnswers[question]) {
      assistantMessages.value.push({ role: 'ASSISTANT', content: englishFaqAnswers[question], orderIds: [] })
      return
    }
    const faq = await gateway.askFaq(portalLanguage.value === 'EN' ? `Please answer in English. ${question}` : question)
    const suffix = faq.requiresCustomerConfirmation
      ? t('\n\n（以上内容引自常见问题库的示例语料，待甲方确认）', '\n\n(This answer uses sample FAQ content and is pending customer confirmation.)')
      : ''
    assistantMessages.value.push({ role: 'ASSISTANT', content: faq.answer + suffix, orderIds: [] })
  } catch (cause) {
    assistantMessages.value.push({
      role: 'ASSISTANT',
      content: errorText(cause, '常见问题查询暂时不可用', 'FAQ search is temporarily unavailable'),
      orderIds: []
    })
  }
}

async function createPatient() {
  if (!dataset.value || !newPatient.name.trim()) {
    ElMessage.warning(t('请填写患者姓名', 'Enter the patient name'))
    return
  }
  patientSaving.value = true
  try {
    const item = await gateway.createPatient({
      patientName: newPatient.name.trim(),
      patientAge: patientAgeValue(),
      patientGender: newPatient.gender || null,
      dateOfBirth: newPatient.dateOfBirth || null,
      phone: newPatient.phone.trim(),
      email: newPatient.email.trim(),
      medicalNotes: newPatient.medicalNotes.trim(),
      treatmentStatus: newPatient.treatmentStatus,
      treatmentStartedAt: newPatient.treatmentStartedAt || null,
      treatmentEndedAt: newPatient.treatmentEndedAt || null,
      oralDescription: newPatient.oralDescription.trim(),
      tags: newPatient.tags.split(/[,，]/).map((candidate) => candidate.trim()).filter(Boolean)
    })
    dataset.value.patients.unshift(item)
    resetPatientForm()
    patientDialogOpen.value = false
    ElMessage.success(t('患者已保存', 'Patient saved'))
  } catch (cause) {
    ElMessage.error(errorText(cause, '患者保存失败', 'Failed to save patient'))
  } finally {
    patientSaving.value = false
  }
}

async function savePatientChanges() {
  if (!dataset.value || !selectedPatient.value || !newPatient.name.trim()) {
    ElMessage.warning(t('请填写患者姓名', 'Enter the patient name'))
    return
  }
  patientSaving.value = true
  try {
    const updated = await gateway.updatePatient({
      patientId: selectedPatient.value.patient_id,
      patientName: newPatient.name.trim(),
      patientAge: patientAgeValue(),
      patientGender: newPatient.gender || null,
      dateOfBirth: newPatient.dateOfBirth || null,
      phone: newPatient.phone.trim(),
      email: newPatient.email.trim(),
      medicalNotes: newPatient.medicalNotes.trim(),
      treatmentStatus: newPatient.treatmentStatus,
      treatmentStartedAt: newPatient.treatmentStartedAt || null,
      treatmentEndedAt: newPatient.treatmentEndedAt || null,
      oralDescription: newPatient.oralDescription.trim(),
      tags: newPatient.tags.split(/[,，]/).map((candidate) => candidate.trim()).filter(Boolean)
    })
    const index = dataset.value.patients.findIndex((item) => item.patient_id === updated.patient_id)
    if (index >= 0) dataset.value.patients.splice(index, 1, updated)
    selectedPatient.value = { ...selectedPatient.value, ...updated, notes: updated.medical_notes }
    patientEditMode.value = false
    ElMessage.success(t('患者档案已更新', 'Patient record updated'))
  } catch (cause) {
    ElMessage.error(errorText(cause, '患者档案更新失败', 'Failed to update patient record'))
  } finally {
    patientSaving.value = false
  }
}

function addMember() {
  if (!dataset.value || !newMember.displayName.trim() || !newMember.email.trim()) {
    ElMessage.warning(t('请填写成员姓名和邮箱', 'Enter the member name and email'))
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
  ElMessage.info(t('成员邀请功能暂未开放', 'Member invitations are not available yet'))
}

function saveProfile() {
  ElMessage.success(dataMode === 'mock' ? t('设置已保存', 'Settings saved') : t('资料保存功能暂未开放', 'Profile saving is not available yet'))
}

function updatePassword() {
  if (!passwordForm.current || passwordForm.next.length < 8 || passwordForm.next !== passwordForm.confirm) {
    ElMessage.warning(t('请检查当前密码、新密码长度和两次输入是否一致', 'Check the current password, new password length, and confirmation'))
    return
  }
  Object.assign(passwordForm, { current: '', next: '', confirm: '' })
  ElMessage.info(t('安全设置功能暂未开放', 'Security settings are not available yet'))
}

function openLogistics(item: LogisticsRecord) {
  selectedLogistics.value = item
  logisticsDrawerOpen.value = true
}

async function confirmReceipt(item: LogisticsRecord) {
  try {
    await ElMessageBox.confirm(t('请确认产品已由诊所实际收取。确认后订单将完成。', 'Confirm that the clinic has physically received the product. The order will be completed after confirmation.'), t('确认收货', 'Confirm Receipt'), {
      confirmButtonText: t('确认已收货', 'Confirm Received'), cancelButtonText: t('取消', 'Cancel'), type: 'warning'
    })
    const order = dataset.value?.orders.find((candidate) => candidate.order_id === item.order_id)
    await gateway.confirmReceipt(item.order_id, order?.state_version ?? 0)
    item.can_confirm_receipt = false
    item.status = 'COMPLETED'
    if (order) {
      order.external_status = 'COMPLETED'
      order.current_action = 'NONE'
    }
    ElMessage.success(t('已确认收货，订单已完成', 'Receipt confirmed and order completed'))
  } catch (cause) {
    if (cause === 'cancel' || cause === 'close') return
    ElMessage.error(errorText(cause, '确认收货失败', 'Failed to confirm receipt'))
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
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalShortcut)
  document.title = 'AI 智能下单与生产协同平台'
})
</script>

<template>
  <div class="dv2-shell" data-testid="doctor-v2-portal" :lang="portalLanguage === 'EN' ? 'en-US' : 'zh-CN'">
    <aside class="dv2-sidebar">
      <div class="dv2-brand">
        <span class="dv2-brand-mark">P</span>
        <div><strong>PrecisionDental</strong><small>LAB · {{ t('医生工作台', 'Doctor Portal') }}</small></div>
      </div>

      <div class="dv2-clinic-card">
        <span class="dv2-avatar">{{ (account?.display_name || currentUser?.username || t('医', 'D')).slice(0, 1) }}</span>
        <button type="button" data-testid="doctor-role-switcher" @click="roleMenuOpen = !roleMenuOpen">
          <strong>{{ account?.display_name || currentUser?.username || t('医生', 'Doctor') }}</strong>
          <small>{{ account?.clinic_name || t('当前诊所', 'Current Clinic') }} · {{ roleLabel(activeRole) }}</small>
        </button>
        <i>⌄</i>
        <div v-if="roleMenuOpen" class="dv2-floating-menu is-sidebar">
          <small>{{ t('切换诊所身份', 'Switch Clinic Role') }}</small>
          <button v-for="role in availableRoles" :key="role" type="button" :class="{ active: activeRole === role }" @click="chooseRole(role)">
            <span>{{ roleLabel(role) }}</span><i>{{ activeRole === role ? '✓' : '' }}</i>
          </button>
          <p>{{ t('切换后只使用所选身份的权限。', 'Only permissions assigned to the selected role will be used.') }}</p>
        </div>
      </div>

      <nav class="dv2-nav" :aria-label="t('医生端菜单', 'Doctor portal menu')">
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

      <button type="button" class="dv2-sidebar-support" @click="showSupport"><span>?</span><div><strong>{{ t('需要帮助？', 'Need help?') }}</strong><small>{{ t('联系订单支持', 'Contact support') }}</small></div><i>›</i></button>
      <div class="dv2-sidebar-user">
        <span>{{ t('安全登录中', 'Secure Session') }}</span><button type="button" :title="t('退出登录', 'Sign Out')" :aria-label="t('退出登录', 'Sign Out')" @click="emit('logout')">{{ t('退出', 'Sign Out') }} ↗</button>
      </div>
    </aside>

    <section class="dv2-main">
      <header class="dv2-topbar">
        <div class="dv2-topbar-context"><strong>{{ currentMeta.title }}</strong><small>{{ account?.clinic_name || t('当前诊所', 'Current Clinic') }}</small></div>
        <div class="dv2-topbar-actions">
          <div class="dv2-global-search" :class="{ focused: globalSearchOpen }">
            <span aria-hidden="true">⌕</span>
            <input
              v-model="globalKeyword"
              type="search"
              :placeholder="t('搜索订单或患者', 'Search orders or patients')"
              :aria-label="t('全局搜索', 'Global search')"
              data-testid="doctor-global-search"
              @focus="globalSearchOpen = true"
              @keyup.esc="globalSearchOpen = false"
            >
            <kbd>⌘ K</kbd>
          </div>

          <div class="dv2-language-switch" :aria-label="t('界面语言', 'Interface language')"><button type="button" :class="{ active: portalLanguage === 'ZH' }" @click="setPortalLanguage('ZH')">中文</button><button type="button" :class="{ active: portalLanguage === 'EN' }" @click="setPortalLanguage('EN')">EN</button></div>
          <button class="dv2-icon-button" type="button" :aria-label="t('打开通知中心', 'Open notifications')" data-testid="doctor-notification-button" @click="notificationOpen = true">
            🔔<i v-if="unreadCount">{{ unreadCount > 9 ? '9+' : unreadCount }}</i>
          </button>
          <button class="dv2-icon-button" type="button" :aria-label="t('打开帮助', 'Open help')" :title="t('帮助中心', 'Help Center')" @click="showHelp">?</button>
          <button v-if="canCreateOrder" class="dv2-primary-button" type="button" data-testid="doctor-new-order" @click="openWizard()">＋ {{ t('新建订单', 'New Order') }}</button>
        </div>
      </header>

      <div v-if="globalSearchOpen" class="dv2-search-backdrop" @mousedown.self="globalSearchOpen = false">
        <section class="dv2-search-popover">
          <header><strong>{{ t('全局搜索', 'Global Search') }}</strong><span>{{ t('订单与患者', 'Orders and Patients') }}</span></header>
          <template v-if="globalKeyword.trim()">
            <div class="dv2-search-group">
              <small>{{ t('订单', 'Orders') }}</small>
              <button v-for="order in globalResults.orders" :key="order.order_id" type="button" @click="openGlobalOrder(order.order_id)">
                <span><strong>{{ order.order_no }}</strong><small>{{ order.patient_name }} · {{ productNameLabel(order.product_name, order.product_type) }}</small></span><em>{{ label(order.external_status) }}</em>
              </button>
              <p v-if="!globalResults.orders.length">{{ t('没有匹配订单', 'No matching orders') }}</p>
            </div>
            <div class="dv2-search-group">
              <small>{{ t('患者', 'Patients') }}</small>
              <button v-for="patient in globalResults.patients" :key="patient.patient_id" type="button" @click="openGlobalPatient(patient.patient_id)">
                <span><strong>{{ patient.patient_name }}</strong><small>{{ patient.patient_code }} · {{ t('{count} 个订单', '{count} order(s)', { count: patient.order_count }) }}</small></span><em>{{ t('查看档案', 'View Profile') }}</em>
              </button>
              <p v-if="!globalResults.patients.length">{{ t('没有匹配患者', 'No matching patients') }}</p>
            </div>
          </template>
          <div v-else class="dv2-search-empty">{{ t('输入订单号、患者姓名或患者编号开始搜索', 'Enter an order number, patient name or patient ID to search') }}</div>
        </section>
      </div>

      <main class="dv2-content">
        <div v-if="activePage !== 'dashboard'" class="dv2-page-heading">
          <div><h1>{{ currentMeta.title }}</h1><p>{{ currentMeta.description }}</p></div>
          <button v-if="activePage === 'patients' && activeRole === 'DOCTOR'" type="button" class="dv2-primary-button dv2-patient-add" @click="openPatientCreate">＋ {{ t('新建患者', 'New Patient') }}</button>
        </div>

        <div v-if="loading" class="dv2-loading-card"><span class="dv2-spinner" />{{ t('正在加载医生端数据…', 'Loading doctor portal data…') }}</div>
        <div v-else-if="loadError" class="dv2-error-card"><strong>{{ t('页面数据暂时不可用', 'Page data is temporarily unavailable') }}</strong><p>{{ loadError }}</p><button type="button" @click="loadPortal">{{ t('重新加载', 'Reload') }}</button></div>

        <template v-else-if="dataset">
          <section v-if="activePage === 'dashboard'" class="dv2-dashboard dv2-reference-dashboard" data-testid="doctor-page-dashboard">
            <header class="dv2-dashboard-reference-heading">
              <div><h2>{{ dashboardGreeting }}</h2><p>{{ dashboardContext }}</p></div>
              <button type="button" class="dv2-primary-button" @click="switchPage('orders')">{{ t('进入订单管理', 'Open Order Management') }}</button>
            </header>

            <div class="dv2-metric-grid is-six">
              <article v-for="item in dashboardStats" :key="item.key" :class="`is-${item.tone}`">
                <span class="dv2-metric-icon">{{ item.icon }}</span><div><small>{{ item.label }}</small><strong>{{ item.value }}</strong><p>{{ item.note }}</p></div>
              </article>
            </div>

            <div class="dv2-dashboard-reference-columns">
              <div class="dv2-dashboard-reference-section">
                <div class="dv2-dashboard-section-label"><span>🔴</span>{{ t('需要处理', 'Action Required') }}</div>
                <section class="dv2-card dv2-task-card dv2-reference-action-list">
                  <header><div><h2>{{ t('需要处理', 'Action Required') }}</h2><p>{{ t('优先处理会阻塞订单继续推进的事项', 'Prioritize items that block order progress') }}</p></div><button type="button" @click="switchPage('orders')">{{ t('{count} 项 · 查看全部 →', '{count} item(s) · View all →', { count: pendingTaskOrders.length }) }}</button></header>
                  <button v-for="order in pendingTaskOrders.slice(0, 4)" :key="order.order_id" type="button" class="dv2-task-row" @click="openOrder(order.order_id)">
                    <span :class="`dv2-dot is-${statusTone(order.external_status)}`" />
                    <div><strong>{{ label(order.current_action) }}</strong><small>{{ order.order_no }} · {{ order.patient_name }} · {{ productNameLabel(order.product_name, order.product_type) }}</small></div>
                    <time>{{ order.due_at }}</time><i>›</i>
                  </button>
                  <div v-if="!pendingTaskOrders.length" class="dv2-empty">{{ t('暂无待处理事项', 'No pending actions') }}</div>
                </section>
              </div>

              <div class="dv2-dashboard-reference-stack">
                <div class="dv2-dashboard-reference-section">
                  <div class="dv2-dashboard-section-label"><span>🚚</span>{{ t('即将送达', 'Arriving Soon') }}</div>
                  <section class="dv2-card dv2-task-card dv2-reference-compact-list">
                    <header><div><h2>{{ t('配送与收货', 'Delivery & Receipt') }}</h2><p>{{ t('医生可见的在途订单', 'In-transit orders visible to doctors') }}</p></div><span>{{ t('{count} 单', '{count} order(s)', { count: dashboardDeliveryOrders.length }) }}</span></header>
                    <button v-for="order in dashboardDeliveryOrders" :key="order.order_id" type="button" class="dv2-task-row" @click="openOrder(order.order_id)">
                      <span :class="`dv2-dot is-${statusTone(order.external_status)}`" />
                      <div><strong>{{ order.patient_name }} · {{ productNameLabel(order.product_name, order.product_type) }}</strong><small>{{ order.order_no }} · {{ label(order.external_status) }}</small><div class="dv2-delivery-steps" :aria-label="t('配送进度', 'Delivery progress')"><i v-for="step in 4" :key="step" :class="{ done: deliveryProgress(order) >= step }" /><span>{{ t('出库', 'Dispatched') }}</span><span>{{ t('运输', 'In Transit') }}</span><span>{{ t('派送', 'Out for Delivery') }}</span><span>{{ t('签收', 'Received') }}</span></div></div>
                      <time>{{ t('预计 {date}', 'Estimated {date}', { date: order.due_at }) }}</time><i>›</i>
                    </button>
                    <div v-if="!dashboardDeliveryOrders.length" class="dv2-empty">{{ t('暂无在途订单', 'No orders in transit') }}</div>
                  </section>
                </div>
                <div class="dv2-dashboard-reference-section">
                  <div class="dv2-dashboard-section-label"><span>🕐</span>{{ t('到期提醒', 'Due Soon') }}</div>
                  <section class="dv2-card dv2-task-card dv2-reference-compact-list">
                    <header><div><h2>{{ t('临近交付订单', 'Orders Nearing Delivery') }}</h2><p>{{ t('根据预计日期排序', 'Sorted by estimated date') }}</p></div><span>{{ t('{count} 单', '{count} order(s)', { count: dashboardDueOrders.length }) }}</span></header>
                    <button v-for="order in dashboardDueOrders" :key="order.order_id" type="button" class="dv2-task-row dv2-due-row" @click="openOrder(order.order_id)">
                      <span class="dv2-dot is-warning" />
                      <div><strong>{{ order.patient_name }} · {{ productNameLabel(order.product_name, order.product_type) }}</strong><small>{{ order.order_no }} · {{ label(order.external_status) }}</small></div>
                      <time>{{ t('预计 {date}', 'Estimated {date}', { date: order.due_at }) }}</time><i>›</i>
                    </button>
                    <div v-if="!dashboardDueOrders.length" class="dv2-empty">{{ t('暂无临近交付订单', 'No orders nearing delivery') }}</div>
                  </section>
                </div>
              </div>
            </div>

            <section class="dv2-card dv2-dashboard-trend dv2-reference-performance">
              <header><div><h2>{{ t('医生工作台趋势图', 'Doctor Portal Trend') }}</h2><p>{{ t('近 6 周医生可见订单创建趋势', 'Doctor-visible order creation over the last six weeks') }}</p></div><span>{{ t('近 6 周', 'Last 6 Weeks') }}</span></header>
              <div class="dv2-trend-summary dv2-reference-trend-summary">
                <article class="is-blue"><small>{{ t('本月订单', 'Orders This Month') }}</small><strong>{{ dataset.orders.filter((item) => doctorLocalDateKey(item.created_at).startsWith(dashboardToday.slice(0, 7))).length }}</strong><i /></article>
                <article class="is-violet"><small>{{ t('待确认', 'Pending Review') }}</small><strong>{{ dataset.orders.filter((item) => item.current_action.includes('REVIEW')).length }}</strong><i /></article>
                <article class="is-amber"><small>{{ t('待付款', 'Payment Due') }}</small><strong>{{ dataset.orders.filter((item) => item.current_action === 'PAYMENT_REQUIRED').length }}</strong><i /></article>
                <article class="is-green"><small>{{ t('已完成', 'Completed') }}</small><strong>{{ dataset.orders.filter((item) => item.external_status === 'COMPLETED').length }}</strong><i /></article>
              </div>
              <div class="dv2-dashboard-trend-body dv2-reference-trend-body">
                <div class="dv2-trend-chart">
                  <svg viewBox="0 0 560 132" role="img" :aria-label="t('近六周订单趋势', 'Six-week order trend')">
                    <line v-for="y in [32, 68, 104]" :key="y" x1="20" :y1="y" x2="548" :y2="y" />
                    <polyline :points="dashboardTrendPoints" />
                    <circle v-for="(value, index) in dashboardWeeklyCounts" :key="index" :cx="24 + index * 103" :cy="104 - Math.round(value / dashboardTrendMax * 72)" r="4" />
                  </svg>
                  <div><span v-for="index in 6" :key="index">{{ t('第{index}周', 'Week {index}', { index }) }}</span></div>
                </div>
              </div>
            </section>
          </section>

          <section v-else-if="activePage === 'orders'" class="dv2-orders" data-testid="doctor-page-orders">
            <div class="dv2-card dv2-list-card">
              <div class="dv2-list-toolbar">
                <label class="dv2-field-search"><span>⌕</span><input v-model="orderKeyword" type="search" :placeholder="t('搜索订单、患者、诊所、产品或标签', 'Search orders, patients, clinics, products or tags')" @input="orderPage = 1"></label>
                <select v-model="orderStatus" @change="orderPage = 1"><option value="ALL">{{ t('全部状态', 'All Statuses') }}</option><option value="DRAFT">{{ label('DRAFT') }}</option><option value="NEEDS_INFO">{{ label('NEEDS_INFO') }}</option><option value="IN_PRODUCTION">{{ label('IN_PRODUCTION') }}</option><option value="AWAITING_PAYMENT">{{ label('AWAITING_PAYMENT') }}</option><option value="SHIPPED">{{ label('SHIPPED') }}</option><option value="COMPLETED">{{ label('COMPLETED') }}</option></select>
                <select v-model="orderProduct" @change="orderPage = 1"><option value="ALL">{{ t('全部产品', 'All Products') }}</option><option v-for="type in orderProductTypes" :key="type" :value="type">{{ productTypeLabel(type) }}</option></select>
                <button type="button" class="dv2-filter-toggle" :class="{ active: orderFiltersExpanded }" @click="orderFiltersExpanded = !orderFiltersExpanded">⚙ {{ t('高级筛选', 'Advanced Filters') }} <i>{{ orderFiltersExpanded ? '⌃' : '⌄' }}</i></button>
                
              </div>
              <div v-if="orderFiltersExpanded" class="dv2-advanced-filters">
                <label><span>{{ t('负责医生', 'Doctor') }}</span><select v-model="orderDoctor" @change="orderPage = 1"><option value="ALL">{{ t('全部医生', 'All Doctors') }}</option><option v-for="doctor in orderDoctors" :key="doctor" :value="doctor">{{ doctor }}</option></select></label>
                <label><span>{{ t('订单标签', 'Order Tag') }}</span><select v-model="orderTag" @change="orderPage = 1"><option value="ALL">{{ t('全部标签', 'All Tags') }}</option><option v-for="tag in orderTags" :key="tag" :value="tag">{{ tag }}</option></select></label>
                <label><span>{{ t('创建日期从', 'Created From') }}</span><input v-model="orderDateFrom" :type="dateInputType" :placeholder="dateInputPlaceholder" inputmode="numeric" pattern="\d{4}-\d{2}-\d{2}" maxlength="10" @change="orderPage = 1"></label>
                <label><span>{{ t('到', 'To') }}</span><input v-model="orderDateTo" :type="dateInputType" :placeholder="dateInputPlaceholder" inputmode="numeric" pattern="\d{4}-\d{2}-\d{2}" maxlength="10" @change="orderPage = 1"></label>
                <button type="button" @click="resetOrderFilters">{{ t('重置筛选', 'Reset Filters') }}</button>
              </div>
              <div class="dv2-quick-filters">
                <button v-for="item in [{ key: 'ALL', label: t('全部订单', 'All Orders') }, { key: 'TODO', label: t('待我处理', 'My Actions') }, { key: 'DUE', label: t('临近到期', 'Due Soon') }, { key: 'DELIVERY', label: t('配送中', 'In Delivery') }, { key: 'PAYMENT', label: t('待付款', 'Payment Due') }, { key: 'DRAFT', label: t('草稿箱', 'Drafts') }]" :key="item.key" type="button" :class="{ active: orderQuick === item.key }" @click="orderQuick = item.key; orderPage = 1">{{ item.label }}</button>
                <span v-if="selectedOrderIds.length">{{ t('已选 {count} 项', '{count} selected', { count: selectedOrderIds.length }) }}</span>
              </div>
              <div class="dv2-table-wrap">
                <table class="dv2-table dv2-order-table">
                  <thead><tr><th class="is-check"><input type="checkbox" :checked="pagedOrders.length > 0 && pagedOrders.every((item) => selectedOrderIds.includes(item.order_id))" :aria-label="t('选择当前页', 'Select current page')" @change="togglePageSelection(($event.target as HTMLInputElement).checked)"></th><th>{{ t('订单', 'Order') }}</th><th>{{ t('医生 / 患者', 'Doctor / Patient') }}</th><th>{{ t('诊所', 'Clinic') }}</th><th>{{ t('产品', 'Product') }}</th><th>{{ t('标签', 'Tags') }}</th><th>{{ t('公开状态', 'Public Status') }}</th><th>{{ t('当前操作', 'Current Action') }}</th><th>{{ t('创建 / 到期', 'Created / Due') }}</th><th>{{ t('金额', 'Amount') }}</th><th /></tr></thead>
                  <tbody>
                    <tr v-for="order in pagedOrders" :key="order.order_id" data-testid="doctor-order-row" tabindex="0" :aria-label="t('查看订单 {order}', 'View order {order}', { order: order.order_no })" @click="openOrder(order.order_id)" @keydown.enter.prevent="openOrder(order.order_id)" @keydown.space.prevent="openOrder(order.order_id)">
                      <td class="is-check"><input type="checkbox" :checked="selectedOrderIds.includes(order.order_id)" :aria-label="t('选择 {order}', 'Select {order}', { order: order.order_no })" @click.stop @change="toggleOrderSelection(order.order_id, ($event.target as HTMLInputElement).checked)"></td>
                      <td><strong class="dv2-link-strong">{{ order.order_no }}</strong><small>#{{ order.order_id }}</small></td>
                      <td><strong>{{ order.doctor_name }}</strong><small>{{ order.patient_name }} · {{ order.patient_code }}</small></td>
                      <td>{{ order.clinic_name }}</td><td><strong>{{ productNameLabel(order.product_name, order.product_type) }}</strong><small>{{ productTypeLabel(order.product_type) }}</small></td>
                      <td><span v-for="tag in order.tags" :key="tag" class="dv2-tag">{{ tag }}</span><span v-if="!order.tags.length">-</span></td>
                      <td><span :class="`dv2-status is-${statusTone(order.external_status)}`">{{ label(order.external_status) }}</span></td>
                      <td><span :class="{ 'dv2-action-text': order.current_action !== 'NONE' }">{{ label(order.current_action) }}</span></td>
                      <td><span>{{ compactDoctorDateTime(order.created_at) }}</span><small>{{ t('到期 {date}', 'Due {date}', { date: order.due_at }) }}</small></td><td>{{ money(order.quote) }}</td>
                      <td><span class="dv2-row-chevron" aria-hidden="true">›</span></td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="!pagedOrders.length" class="dv2-empty">{{ t('没有符合当前条件的订单', 'No orders match the current filters') }}</div>
              </div>
              <footer class="dv2-pagination"><span>{{ t('共 {count} 项', '{count} item(s)', { count: orderRows.length }) }}</span><el-pagination v-model:current-page="orderPage" size="small" background layout="prev, pager, next" :page-size="orderPageSize" :total="orderRows.length" /></footer>
            </div>
          </section>

          <section v-else-if="activePage === 'assistant'" class="dv2-assistant" data-testid="doctor-page-assistant">
            <div class="dv2-card dv2-assistant-card">
              <header><span class="dv2-assistant-mark">✦</span><div><h2>{{ t('订单助手', 'Order Assistant') }}</h2><p>{{ t('可查询您当前身份有权查看的订单、账单、物流与消息信息，也可以直接问下单流程、材料、交期等常见问题', 'Ask about orders, billing, shipping, and messages available to your current role, or get help with ordering, materials, and lead times.') }}</p></div></header>
              <div class="dv2-assistant-suggestions">
                <button v-for="question in [t('哪些订单需要我处理？', 'Which orders need my attention?'), t('查看本周预计到期的订单', 'Show orders due this week'), t('有哪些账单待付款？', 'Which bills are awaiting payment?')]" :key="question" type="button" @click="assistantQuestion = question; askAssistant()">{{ question }}</button>
              </div>
              <div class="dv2-assistant-suggestions is-faq">
                <span class="dv2-assistant-faq-label">{{ t('常见问题', 'FAQs') }}</span>
                <button v-for="question in [t('下单需要提供哪些资料？', 'What information is required to place an order?'), t('口扫文件支持哪些格式？', 'Which intraoral scan formats are supported?'), t('订单大概多久能做好？', 'How long will my order take?'), t('做出来不合适需要返工怎么办？', 'What if the product needs a remake?')]" :key="question" type="button" @click="askFaq(question)">{{ question }}</button>
              </div>
              <div class="dv2-chat-stream">
                <article v-for="(message, index) in assistantMessages" :key="index" :class="{ self: message.role === 'SELF' }">
                  <span>{{ message.role === 'SELF' ? (account?.display_name || t('我', 'Me')).slice(0, 1) : '✦' }}</span>
                  <div><p>{{ message.content }}</p><button v-for="orderId in message.orderIds" :key="orderId" type="button" @click="openGlobalOrder(orderId)">{{ t('查看', 'View') }} {{ dataset.orders.find((item) => item.order_id === orderId)?.order_no }} →</button></div>
                </article>
                <article v-if="assistantLoading"><span>✦</span><div><p>{{ t('正在查询…', 'Searching…') }}</p></div></article>
              </div>
              <form class="dv2-chat-composer" @submit.prevent="askAssistant"><textarea v-model="assistantQuestion" rows="2" :placeholder="t('输入订单号、患者编号或您想查询的问题…', 'Enter an order number, patient ID, or your question…')" /><button type="submit" :disabled="assistantLoading || !assistantQuestion.trim()">{{ t('发送', 'Send') }}</button></form>
              <small class="dv2-scope-note">{{ t('助手仅返回当前身份可见的公开业务信息，结果以订单页面为准。', 'The assistant only returns public business information visible to your current role. Refer to the order page for the final record.') }}</small>
            </div>
          </section>

          <section v-else-if="activePage === 'patients'" class="dv2-patients" data-testid="doctor-page-patients">
            <div class="dv2-card dv2-list-card">
              <div class="dv2-patient-list-tools"><div class="dv2-patient-filters"><button v-for="item in [{ key: 'ALL', label: t('全部', 'All') }, { key: 'IN_TREATMENT', label: t('治疗中', 'In Treatment') }, { key: 'FOLLOW_UP', label: t('待复诊', 'Follow-up Due') }, { key: 'TREATMENT_ENDED', label: t('治疗结束', 'Treatment Complete') }, { key: 'ARCHIVED', label: t('已归档', 'Archived') }]" :key="item.key" type="button" :class="{ active: patientStatus === item.key }" @click="patientStatus = item.key as typeof patientStatus">{{ item.label }}</button></div><label class="dv2-field-search"><span>⌕</span><input v-model="patientKeyword" type="search" :placeholder="t('搜索患者姓名、编号、电话或标签', 'Search name, patient ID, phone, or tag')"></label></div>
              <div class="dv2-table-wrap">
                <table class="dv2-table dv2-patient-table">
                  <thead><tr><th>{{ t('患者姓名', 'Patient') }}</th><th>{{ t('诊所', 'Clinic') }}</th><th>{{ t('负责医生', 'Doctor') }}</th><th>{{ t('最近产品', 'Latest Product') }}</th><th>{{ t('建档日期', 'Created') }}</th><th>{{ t('订单', 'Orders') }}</th><th>{{ t('治疗状态', 'Treatment Status') }}</th><th>{{ t('疗程', 'Duration') }}</th><th /></tr></thead>
                  <tbody><tr v-for="patient in patientRows" :key="patient.patient_id" @dblclick="openPatient(patient.patient_id)"><td><button type="button" class="dv2-link-strong" @click="openPatient(patient.patient_id)">{{ patient.patient_name }}</button><small>{{ patient.patient_code }}<span v-if="patient.tags.length"> · {{ patient.tags.join(' / ') }}</span></small></td><td>{{ patient.clinic_name }}</td><td>{{ patient.doctor_name }}</td><td><span>{{ patient.latest_product_name ? productNameLabel(patient.latest_product_name) : t('暂无订单', 'No orders') }}</span><small>{{ patient.latest_order_no || '—' }}</small></td><td>{{ patientDate(patient.created_at) }}</td><td class="is-count">{{ patient.order_count }}</td><td><span :class="`dv2-status is-${patientTreatmentTone(patient)}`">● {{ patientTreatmentLabel(patient) }}</span></td><td><span class="dv2-duration-chip">{{ patientDurationLabel(patient) }}</span></td><td><button type="button" class="dv2-row-action is-boxed" @click="openPatient(patient.patient_id)">{{ t('编辑', 'Edit') }}</button></td></tr></tbody>
                </table>
                <div v-if="!patientRows.length" class="dv2-empty">{{ t('没有符合当前条件的患者', 'No patients match the current filters') }}</div>
              </div>
              <footer class="dv2-pagination"><span>{{ t('共 {count} 位患者 · 点击姓名查看完整档案与历史订单', '{count} patient(s) · Select a name to view the full record and order history', { count: patientRows.length }) }}</span></footer>
            </div>
          </section>

          <section v-else-if="activePage === 'billing'" class="dv2-billing" data-testid="doctor-page-billing">
            <div class="dv2-billing-stats"><article v-for="item in billingStats" :key="item.label" :class="`is-${item.tone}`"><small>{{ item.label }}</small><strong>{{ item.value }}</strong><span>{{ item.note }}</span></article></div>
            <div class="dv2-billing-alert"><span>!</span><p><strong>{{ t('账期提示', 'Payment Notice') }}</strong> {{ t('按单结算订单需在到期日前完成付款；逾期账单可能影响后续发货安排。', 'Per-order bills must be paid by the due date. Overdue bills may affect shipment scheduling.') }}</p></div>
            <div class="dv2-tabbar dv2-billing-tabs"><button v-for="item in [{ key: 'perOrder', label: t('按单结算', 'Per Order') }, { key: 'monthly', label: t('月结账单', 'Monthly Statements') }, { key: 'invoiceRefund', label: t('发票与退款', 'Invoices & Refunds') }, { key: 'logistics', label: t('物流追踪', 'Shipment Tracking') }]" :key="item.key" type="button" :class="{ active: billingTab === item.key }" @click="billingTab = item.key as typeof billingTab">{{ item.label }}</button></div>
            <div class="dv2-card dv2-list-card">
              <template v-if="billingTab === 'perOrder'">
                <div class="dv2-list-toolbar"><div><strong>{{ t('按单结算', 'Per-order Billing') }}</strong><small>{{ t('按单付款的订单需结清后发货', 'Per-order bills must be paid before shipment') }}</small></div><div class="dv2-patient-filters"><button v-for="item in [{ key: 'ALL', label: t('全部', 'All') }, { key: 'UNPAID', label: t('待支付', 'Unpaid') }, { key: 'OVERDUE', label: t('已逾期', 'Overdue') }, { key: 'PAID', label: t('已支付', 'Paid') }]" :key="item.key" type="button" :class="{ active: billingStatus === item.key }" @click="billingStatus = item.key as typeof billingStatus">{{ item.label }}</button></div></div>
                <div class="dv2-table-wrap"><table class="dv2-table"><thead><tr><th>{{ t('账单 / 订单', 'Bill / Order') }}</th><th>{{ t('诊所 / 医生', 'Clinic / Doctor') }}</th><th>{{ t('产品', 'Product') }}</th><th>{{ t('账单金额', 'Amount') }}</th><th>{{ t('已付', 'Paid') }}</th><th>{{ t('待付', 'Outstanding') }}</th><th>{{ t('状态', 'Status') }}</th><th>{{ t('到期', 'Due') }}</th><th /></tr></thead><tbody><tr v-for="bill in billingRows.filter((item) => item.settlement_type === 'PER_ORDER')" :key="bill.bill_id"><td><strong>{{ bill.bill_id }}</strong><small>{{ bill.order_no }}</small></td><td>{{ bill.clinic_name }}<small>{{ bill.doctor_name }}</small></td><td>{{ productNameLabel(bill.product_name) }}</td><td>{{ money(bill.amount) }}</td><td>{{ money(bill.paid) }}</td><td>{{ money(bill.outstanding) }}</td><td><span :class="`dv2-status is-${statusTone(bill.payment_status)}`">{{ bill.outstanding.amount_minor > 0 && bill.due_at < dashboardToday ? t('已逾期', 'Overdue') : label(bill.payment_status) }}</span></td><td>{{ bill.due_at }}</td><td><button v-if="bill.allowed_actions.includes('PAY_BILL')" type="button" class="dv2-row-action is-primary" @click="ElMessage.info(t('在线付款暂未开放，请联系订单支持', 'Online payment is not available yet. Please contact Order Support.'))">{{ t('去付款', 'Pay Now') }}</button><button v-else type="button" class="dv2-row-action" @click="openOrder(bill.order_id)">{{ t('查看订单', 'View Order') }}</button></td></tr></tbody></table><div v-if="!billingRows.some((item) => item.settlement_type === 'PER_ORDER')" class="dv2-empty">{{ t('暂无符合筛选条件的账单', 'No bills match the current filters') }}</div></div>
              </template>
              <template v-else-if="billingTab === 'monthly'">
                <div class="dv2-list-toolbar"><div><strong>{{ t('月结账单', 'Monthly Statements') }}</strong><small>{{ t('月结订单可先发货，在账期内统一结算', 'Monthly-account orders can ship before payment and are settled within the billing period') }}</small></div></div>
                <div class="dv2-table-wrap"><table class="dv2-table"><thead><tr><th>{{ t('账期', 'Billing Period') }}</th><th>{{ t('诊所', 'Clinic') }}</th><th>{{ t('订单数', 'Orders') }}</th><th>{{ t('账单总额', 'Total') }}</th><th>{{ t('已付', 'Paid') }}</th><th>{{ t('待付', 'Outstanding') }}</th><th>{{ t('状态', 'Status') }}</th><th>{{ t('到期日', 'Due Date') }}</th><th /></tr></thead><tbody><tr v-for="statement in dataset.statements" :key="statement.statement_id"><td><strong>{{ statement.period }}</strong><small>{{ statement.statement_id }}</small></td><td>{{ statement.clinic_name }}</td><td>{{ statement.order_count }}</td><td>{{ money(statement.total) }}</td><td>{{ money(statement.paid) }}</td><td>{{ money(statement.balance) }}</td><td><span :class="`dv2-status is-${statusTone(statement.status)}`">{{ label(statement.status) }}</span></td><td>{{ statement.due_at }}</td><td><button type="button" class="dv2-row-action">{{ t('查看明细', 'View Details') }} →</button></td></tr></tbody></table><div v-if="!dataset.statements.length" class="dv2-empty">{{ t('暂无月结账单', 'No monthly statements') }}</div></div>
              </template>
              <template v-else-if="billingTab === 'invoiceRefund'">
                <div class="dv2-list-toolbar"><div><strong>{{ t('发票与退款', 'Invoices & Refunds') }}</strong><small>{{ t('集中查看发票开具和退款申请进度', 'Track invoice issuance and refund requests in one place') }}</small></div><button type="button" class="dv2-secondary-button" :disabled="bulkInvoiceDownloading || downloadableInvoiceRefunds.length === 0" @click="downloadAllInvoices">{{ bulkInvoiceDownloading ? t('下载中…', 'Downloading…') : t('下载全部 ({count})', 'Download All ({count})', { count: downloadableInvoiceRefunds.length }) }}</button><button type="button" class="dv2-secondary-button" @click="ElMessage.info(t('在线申请暂未开放，请联系订单支持', 'Online requests are not available yet. Please contact Order Support.'))">＋ {{ t('发起申请', 'New Request') }}</button></div>
                <div class="dv2-table-wrap"><table class="dv2-table"><thead><tr><th>{{ t('记录号', 'Record ID') }}</th><th>{{ t('类型', 'Type') }}</th><th>{{ t('关联编号', 'Related ID') }}</th><th>{{ t('抬头 / 说明', 'Title / Description') }}</th><th>{{ t('金额', 'Amount') }}</th><th>{{ t('状态', 'Status') }}</th><th>{{ t('申请时间', 'Requested') }}</th><th /></tr></thead><tbody><tr v-for="record in dataset.invoiceRefunds" :key="record.record_id"><td><strong>{{ record.record_id }}</strong></td><td>{{ record.kind === 'INVOICE' ? t('发票', 'Invoice') : t('退款', 'Refund') }}</td><td>{{ record.related_no }}</td><td>{{ record.title }}</td><td>{{ money(record.amount) }}</td><td><span :class="`dv2-status is-${statusTone(record.status)}`">{{ label(record.status) }}</span></td><td>{{ record.created_at }}</td><td><button type="button" class="dv2-row-action" @click="downloadInvoice(record.record_id)">{{ record.kind === 'INVOICE' ? t('下载 PDF', 'Download PDF') : t('下载记录', 'Download Record') }} →</button></td></tr></tbody></table><div v-if="!dataset.invoiceRefunds.length" class="dv2-empty">{{ t('暂无发票或退款记录', 'No invoice or refund records') }}</div></div>
              </template>
              <template v-else>
                <div class="dv2-list-toolbar"><div><strong>{{ t('物流', 'Shipments') }}</strong><small>{{ t('物流信息仅在此处集中展示；已送达后需医生确认收货', 'Shipment details are shown here. The doctor must confirm receipt after delivery.') }}</small></div><label class="dv2-field-search is-small"><span>⌕</span><input type="search" :placeholder="t('搜索订单或运单号', 'Search order or tracking number')"></label></div>
                <div class="dv2-table-wrap"><table class="dv2-table"><thead><tr><th>{{ t('订单', 'Order') }}</th><th>{{ t('产品', 'Product') }}</th><th>{{ t('物流公司', 'Carrier') }}</th><th>{{ t('运单号', 'Tracking Number') }}</th><th>{{ t('物流状态', 'Shipment Status') }}</th><th>{{ t('更新时间', 'Updated') }}</th><th /></tr></thead><tbody><tr v-for="item in dataset.logistics" :key="item.logistics_id"><td><strong>{{ item.order_no }}</strong></td><td>{{ productNameLabel(item.product_name) }}</td><td>{{ item.carrier }}</td><td class="dv2-mono">{{ item.tracking_no }}</td><td><span :class="`dv2-status is-${statusTone(item.status)}`">{{ label(item.status) }}</span></td><td>{{ item.updated_at }}</td><td><button v-if="item.can_confirm_receipt" type="button" class="dv2-row-action is-primary" @click="confirmReceipt(item)">{{ t('确认收货', 'Confirm Receipt') }}</button><button v-else type="button" class="dv2-row-action" @click="openLogistics(item)">{{ t('物流详情', 'Shipment Details') }} →</button></td></tr></tbody></table><div v-if="!dataset.logistics.length" class="dv2-empty">{{ t('暂无物流记录', 'No shipment records') }}</div></div>
              </template>
            </div>
          </section>

          <section v-else-if="activePage === 'messages'" class="dv2-messages" data-testid="doctor-page-messages">
            <div class="dv2-message-layout">
              <aside class="dv2-thread-panel">
                <div class="dv2-thread-search"><label><span>⌕</span><input v-model="messageKeyword" type="search" :placeholder="t('搜索订单、患者或消息', 'Search orders, patients, or messages')"></label><div><button v-for="item in [{ key: 'ALL', label: t('全部', 'All') }, { key: 'UNREAD', label: t('未读', 'Unread') }, { key: 'READ', label: t('已读', 'Read') }]" :key="item.key" type="button" :class="{ active: messageFilter === item.key }" @click="messageFilter = item.key as typeof messageFilter">{{ item.label }}</button></div></div>
                <button v-for="thread in filteredThreads" :key="thread.thread_id" type="button" class="dv2-thread-row" :class="{ active: activeThread?.thread_id === thread.thread_id }" :title="t('右键标记为未读', 'Right-click to mark unread')" @click="chooseThread(thread.thread_id)" @contextmenu.prevent="markThreadUnread(thread.thread_id)"><span class="dv2-thread-avatar">{{ productNameLabel(thread.product_name).slice(0, 1) }}</span><div><strong>{{ thread.patient_name }} · {{ productNameLabel(thread.product_name) }}</strong><small>{{ thread.order_no }}</small><p>{{ thread.latest_message }}</p></div><time>{{ thread.latest_at }}</time><i v-if="thread.unread" /></button>
                <div v-if="!filteredThreads.length" class="dv2-empty">{{ t('没有符合筛选条件的沟通', 'No conversations match the current filters') }}</div>
              </aside>
              <section v-if="activeThread" class="dv2-conversation">
                <header><div><h2>{{ activeThread.patient_name }} · {{ productNameLabel(activeThread.product_name) }}</h2><p>{{ activeThread.order_no }} <span class="dv2-translation-chip">{{ t('A/文', 'A/EN') }} {{ t('可翻译', 'Translation available') }}</span></p></div><button type="button" class="dv2-secondary-button" @click="openGlobalOrder(activeThread.order_id)">{{ t('查看订单', 'View Order') }}</button></header>
                <div class="dv2-message-stream">
                  <article v-for="message in activeThread.messages" :key="message.message_id" :class="{ self: message.sender === 'SELF' }"><span>{{ message.sender === 'SELF' ? (account?.display_name || t('我', 'Me')).slice(0, 1) : 'S' }}</span><div><small>{{ message.sender === 'SELF' ? t('我', 'Me') : t('订单服务', 'Order Support') }} · {{ message.sent_at }}</small><p>{{ message.content }}</p><section v-if="message.review" class="dv2-review-card"><header><div><strong>{{ reviewLabel(message.review.review_type) }}</strong><small>{{ t('当前版本 V{version}', 'Current Version V{version}', { version: message.review.current_version }) }}</small></div><span :class="`dv2-status is-${statusTone(message.review.status)}`">{{ label(message.review.status) }}</span></header><div class="dv2-version-list"><article v-for="version in [...message.review.versions].reverse()" :key="version.version"><div><strong>V{{ version.version }}</strong><span>{{ label(version.status) }}</span><small>{{ version.submitted_at }}</small></div><button v-for="attachment in version.files" :key="attachment.file_id" type="button" @click="previewFile(attachment)"><i>{{ attachment.kind }}</i><span>{{ attachment.name }}<small>{{ attachment.size_label }}</small></span><em>{{ t('预览', 'Preview') }}</em></button><p v-if="version.doctor_comment">{{ t('医生意见：', 'Doctor Comment: ') }}{{ version.doctor_comment }}</p></article></div><footer v-if="message.review.status === 'PENDING_REVIEW'"><template v-if="canReview && message.review.allowed_actions.some((action) => ['APPROVE_REVIEW', 'REJECT_REVIEW'].includes(action))"><button v-if="message.review.allowed_actions.includes('REJECT_REVIEW')" type="button" class="dv2-danger-button" :disabled="reviewSubmitting" @click="startReviewDecision(activeThread.order_id, message.review, 'REJECT')">{{ t('驳回并留言', 'Reject & Comment') }}</button><button v-if="message.review.allowed_actions.includes('APPROVE_REVIEW')" type="button" class="dv2-primary-button" :disabled="reviewSubmitting" @click="startReviewDecision(activeThread.order_id, message.review, 'APPROVE')">{{ t('同意当前版本', 'Approve Version') }}</button></template><p v-else>{{ t('当前账号不能执行此操作。', 'Your current account cannot perform this action.') }}</p></footer></section></div></article>
                </div>
                <div class="dv2-quick-replies"><span>{{ t('快捷回复', 'Quick Replies') }}</span><button v-for="reply in [t('收到，我会尽快确认。', 'Received. I will review it shortly.'), t('请补充一张更清晰的照片。', 'Please provide a clearer photo.'), t('请按当前版本继续。', 'Please proceed with the current version.')]" :key="reply" type="button" @click="messageDraft = reply">{{ reply }}</button></div>
                <form class="dv2-message-composer" @submit.prevent="sendMessage"><textarea v-model="messageDraft" rows="2" :placeholder="t('输入订单沟通内容…', 'Enter your order message…')" @keydown.ctrl.enter.prevent="sendMessage" /><footer><span>{{ t('Ctrl + Enter 发送', 'Ctrl + Enter to send') }}</span><button type="submit" :disabled="sendingMessage || !messageDraft.trim()">{{ t('发送', 'Send') }}</button></footer></form>
              </section>
              <div v-else class="dv2-empty dv2-no-thread">{{ t('请选择一条沟通', 'Select a conversation') }}</div>
            </div>
          </section>

          <section v-else-if="activePage === 'account'" class="dv2-account" data-testid="doctor-page-account">
            <div class="dv2-account-page">
              <div class="dv2-tabbar dv2-settings-tabs"><button v-for="item in [{ key: 'profile', label: t('账户与诊所', 'Account & Clinic') }, { key: 'members', label: t('成员与权限', 'Members & Access') }, { key: 'notifications', label: t('通知偏好', 'Notifications') }, { key: 'security', label: t('安全设置', 'Security') }]" :key="item.key" type="button" :class="{ active: accountTab === item.key }" @click="accountTab = item.key as typeof accountTab"><strong>{{ item.label }}</strong></button></div>
              <section class="dv2-card dv2-settings-content">
                <template v-if="accountTab === 'profile'"><header><div><h2>{{ t('账户与诊所', 'Account & Clinic') }}</h2><p>{{ t('维护对外展示、账单和配送所需的基础资料', 'Maintain profile, billing, and delivery information') }}</p></div><button v-if="canManageMembers" type="button" class="dv2-secondary-button" @click="ElMessage.info(t('新增诊所暂未开放，请联系订单支持', 'Adding clinics is not available yet. Please contact Order Support.'))">＋ {{ t('添加诊所', 'Add Clinic') }}</button></header><div class="dv2-clinic-selector"><span class="dv2-avatar">{{ dataset.account.clinic_name.slice(0, 1) }}</span><div><small>{{ t('当前诊所', 'Current Clinic') }}</small><strong>{{ dataset.account.clinic_name }}</strong><p>{{ dataset.account.clinic_address }}</p></div><i>✓</i></div><div class="dv2-form-grid"><label><span>{{ t('医生姓名', 'Doctor Name') }}</span><input v-model="dataset.account.display_name"></label><label><span>{{ t('登录邮箱', 'Login Email') }}</span><input v-model="dataset.account.email" type="email"></label><label><span>{{ t('诊所名称', 'Clinic Name') }}</span><input v-model="dataset.account.clinic_name"></label><label><span>{{ t('诊所联系电话', 'Clinic Phone') }}</span><input v-model="dataset.account.clinic_contact"></label><label class="is-full"><span>{{ t('诊所地址', 'Clinic Address') }}</span><textarea v-model="dataset.account.clinic_address" rows="3" /></label><label><span>{{ t('账单抬头', 'Billing Name') }}</span><input :value="dataset.account.clinic_name" @input="dataset.account.clinic_name = ($event.target as HTMLInputElement).value"></label><label><span>{{ t('配送联系人', 'Delivery Contact') }}</span><input :value="dataset.account.display_name" readonly></label><div class="is-full dv2-doc-upload"><span>{{ t('诊所资质文件', 'Clinic Credentials') }}</span><button type="button" @click="ElMessage.info(t('资质文件上传暂未开放，请联系订单支持', 'Credential upload is not available yet. Please contact Order Support.'))">＋ {{ t('上传营业执照或医疗机构执业许可证', 'Upload a business or medical institution license') }}</button></div></div><footer><button type="button" class="dv2-primary-button" @click="saveProfile">{{ t('保存设置', 'Save Settings') }}</button></footer></template>
                <template v-else-if="accountTab === 'members'"><header><div><h2>{{ t('成员与权限', 'Members & Access') }}</h2><p>{{ t('分别设置诊所成员可查看的账单和物流内容', 'Control billing and shipment access for each clinic member') }}</p></div><button v-if="canManageMembers" type="button" class="dv2-primary-button" @click="memberDialogOpen = true">＋ {{ t('邀请成员', 'Invite Member') }}</button></header><div v-if="!canManageMembers" class="dv2-inline-notice">{{ t('当前身份可查看成员，但只有诊所管理员可以邀请或调整诊所端角色。', 'You can view members, but only a Clinic Administrator can invite members or change clinic roles.') }}</div><div class="dv2-member-list"><article v-for="member in dataset.account.members" :key="member.member_id"><span class="dv2-avatar">{{ member.display_name.slice(0, 1) }}</span><div><strong>{{ member.display_name }}</strong><small>{{ member.email }}</small></div><p><span v-for="role in member.roles" :key="role" class="dv2-tag">{{ roleLabel(role) }}</span></p><p><small>{{ t('账单：{billing} · 物流：{logistics}', 'Billing: {billing} · Shipments: {logistics}', { billing: member.billing_permission, logistics: member.logistics_permission }) }}</small></p><span :class="`dv2-status is-${statusTone(member.status)}`">{{ label(member.status) }}</span><button type="button" :disabled="!canManageMembers">⋯</button></article><div v-if="!dataset.account.members.length" class="dv2-empty">{{ t('暂无诊所成员', 'No clinic members') }}</div></div></template>
                <template v-else-if="accountTab === 'notifications'"><header><h2>{{ t('通知偏好', 'Notification Preferences') }}</h2><p>{{ t('分别设置站内通知和邮件提醒', 'Configure in-app and email notifications') }}</p></header><div class="dv2-preference-table"><div class="head"><strong>{{ t('通知类型', 'Notification Type') }}</strong><span>{{ t('站内', 'In App') }}</span><span>{{ t('邮件', 'Email') }}</span></div><div v-for="(preference, key) in dataset.account.notification_preferences" :key="key"><strong>{{ notificationPreferenceLabel(key) }}</strong><el-switch v-model="preference.in_app" /><el-switch v-model="preference.email" /></div><div v-if="!Object.keys(dataset.account.notification_preferences).length" class="dv2-empty">{{ t('暂无可设置的通知', 'No notification preferences available') }}</div></div><footer><button type="button" class="dv2-primary-button" @click="saveProfile">{{ t('保存偏好', 'Save Preferences') }}</button></footer></template>
                <template v-else><header><h2>{{ t('安全设置', 'Security') }}</h2><p>{{ t('更新登录密码并保持账户安全', 'Update your password and keep your account secure') }}</p></header><div class="dv2-form-stack"><label><span>{{ t('当前密码', 'Current Password') }}</span><input v-model="passwordForm.current" type="password" autocomplete="current-password"></label><label><span>{{ t('新密码', 'New Password') }}</span><input v-model="passwordForm.next" type="password" autocomplete="new-password"><small>{{ t('至少 8 位，建议包含大小写字母和数字', 'Use at least 8 characters with uppercase, lowercase, and numbers') }}</small></label><label><span>{{ t('确认新密码', 'Confirm New Password') }}</span><input v-model="passwordForm.confirm" type="password" autocomplete="new-password"></label></div><footer><button type="button" class="dv2-primary-button" @click="updatePassword">{{ t('更新密码', 'Update Password') }}</button></footer></template>
              </section>
            </div>
          </section>
        </template>
      </main>
    </section>

    <div v-if="notificationOpen" class="dv2-drawer-mask" @mousedown.self="notificationOpen = false">
      <aside class="dv2-notification-drawer" data-testid="doctor-notification-drawer"><header><div><h2>{{ t('通知中心', 'Notifications') }}</h2><p>{{ t('{count} 条未读通知', '{count} unread notification(s)', { count: unreadCount }) }}</p></div><button type="button" :aria-label="t('关闭通知中心', 'Close notifications')" @click="notificationOpen = false">×</button></header><div class="dv2-notification-tools"><label><span>⌕</span><input v-model="notificationKeyword" type="search" :placeholder="t('搜索通知', 'Search notifications')"></label><button type="button" @click="markAllNotifications">{{ t('全部已读', 'Mark All Read') }}</button></div><div class="dv2-chip-row"><button v-for="item in [{ key: 'ALL', label: t('全部', 'All') }, { key: 'UNREAD', label: t('未读', 'Unread') }, { key: 'READ', label: t('已读', 'Read') }]" :key="item.key" type="button" :class="{ active: notificationFilter === item.key }" @click="selectAllNotificationFilter(item.key as typeof notificationFilter)">{{ item.label }}</button></div><div class="dv2-notification-list"><button v-for="item in filteredNotifications" :key="item.notification_id" type="button" :class="{ unread: !item.read }" @click="openNotification(item.notification_id)"><span :class="`dv2-notification-icon is-${item.category.toLowerCase()}`">{{ categoryLabel(item.category).slice(0, 1) }}</span><div><strong>{{ notificationTitle(item) }}</strong><p>{{ notificationSummary(item) }}</p><small>{{ item.created_at }} · {{ categoryLabel(item.category) }}</small></div><i v-if="!item.read" /></button><div v-if="!filteredNotifications.length" class="dv2-empty">{{ t('没有符合筛选条件的通知', 'No notifications match the current filters') }}</div></div></aside>
    </div>

    <div v-if="orderDrawerOpen" class="dv2-drawer-mask is-order-reference" @mousedown.self="orderDrawerOpen = false">
      <aside class="dv2-order-drawer" data-testid="doctor-order-drawer">
        <header>
          <div>
            <small>{{ t('订单详情', 'Order Details') }}</small>
            <h2>{{ selectedOrder?.order_no || t('正在加载', 'Loading') }}</h2>
          </div>
          <button type="button" :aria-label="t('关闭订单详情', 'Close order details')" @click="orderDrawerOpen = false">×</button>
        </header>

        <div v-if="orderDetailLoading" class="dv2-loading-card"><span class="dv2-spinner" />{{ t('正在读取订单详情…', 'Loading order details…') }}</div>
        <template v-else-if="selectedOrder">
          <div class="dv2-drawer-summary">
            <div><small>{{ t('患者', 'Patient') }}</small><span>{{ selectedOrder.patient_name }}</span><em v-if="selectedOrder.patient_code && selectedOrder.patient_code !== '-'">{{ selectedOrder.patient_code }}</em></div>
            <div><small>{{ t('牙位', 'Tooth Position') }}</small><span>{{ selectedOrderToothText }}</span></div>
            <div><small>{{ t('产品', 'Product') }}</small><span>{{ productNameLabel(selectedOrder.product_name, selectedOrder.product_type) }}</span></div>
            <div><small>{{ t('诊所', 'Clinic') }}</small><span>{{ selectedOrder.clinic_name }}</span></div>
            <div><small>{{ t('负责医生', 'Doctor') }}</small><span>{{ selectedOrder.doctor_name }}</span></div>
            <div class="is-amount"><small>{{ t('订单金额', 'Order Amount') }}</small><span>{{ money(selectedOrder.quote) }}</span></div>
            <div><small>{{ t('订单创建时间', 'Created') }}</small><span>{{ compactDoctorDateTime(selectedOrder.created_at) }}</span></div>
            <div><small>{{ t('预计到期', 'Estimated Due') }}</small><span>{{ compactDoctorDateTime(selectedOrder.due_at) }}</span></div>
            <div class="is-status"><small>{{ t('公开状态', 'Public Status') }}</small><span :class="`dv2-status is-${statusTone(selectedOrder.external_status)}`">{{ label(selectedOrder.external_status) }}</span></div>
            <div class="is-tags"><small>{{ t('订单标签', 'Order Tags') }}</small><p><span v-for="tag in selectedOrder.tags" :key="tag" class="dv2-tag">{{ tag }}</span><em v-if="!selectedOrder.tags.length">{{ t('暂无标签', 'No tags') }}</em></p></div>
          </div>

          <div class="dv2-drawer-body">
            <section v-if="selectedOrder.external_status === 'DRAFT' && selectedOrder.group_id" class="dv2-detail-section dv2-action-alert">
              <div class="dv2-current-action">
                <div><strong>{{ t('病例订单草稿尚未提交', 'This case order is still a draft') }}</strong><p>{{ t('继续编辑该病例下的全部产品和资料。', 'Continue editing all products and records in this case.') }}</p></div>
                <button type="button" class="dv2-primary-button" data-testid="doctor-resume-case-group" @click="resumeSelectedCaseGroup">{{ t('继续编辑订单', 'Continue Editing') }}</button>
              </div>
            </section>
            <section v-if="selectedOrder.current_action !== 'NONE'" class="dv2-detail-section dv2-action-alert">
              <div class="dv2-current-action">
                <div><strong>{{ label(selectedOrder.current_action) }}</strong><p>{{ t('完成后订单将按公开流程继续推进。', 'The order will proceed through the public workflow after this action is completed.') }}</p></div>
                <button v-if="selectedOrder.current_action === 'PAYMENT_REQUIRED'" type="button" class="dv2-primary-button" @click="orderDrawerOpen = false; switchPage('billing')">{{ t('去付款', 'Pay Now') }}</button>
              </div>
            </section>

            <section v-if="deliveryPlanLoading" class="dv2-detail-section">
              <h3>{{ t('交期与过程确认', 'Delivery & Process Confirmations') }}</h3>
              <div class="dv2-loading-card"><span class="dv2-spinner" />{{ t('正在读取交期计划…', 'Loading delivery plan…') }}</div>
            </section>
            <section v-else-if="deliveryPlan" class="dv2-detail-section dv2-delivery-plan" data-testid="doctor-delivery-plan">
              <h3>{{ t('交期与过程确认', 'Delivery & Process Confirmations') }}</h3>

              <div v-if="deliveryPlan.estimate_status === 'PLACEHOLDER'" class="dv2-delivery-placeholder" data-testid="doctor-delivery-placeholder">
                <strong>{{ t('预计到货时间待确认', 'Estimated Delivery Pending Confirmation') }}</strong>
                <p>{{ t('以下时间按暂定标准周期估算，尚未成为正式承诺交期：{rules}。正式交期由订单服务受理后确认。', 'The date below is estimated using provisional standard lead times and is not a confirmed commitment: {rules}. Order Support will confirm the final delivery date after review.', { rules: deliveryPlan.placeholder_rules.join(portalLanguage === 'EN' ? ', ' : '、') }) }}</p>
              </div>

              <dl class="dv2-delivery-grid">
                <div><dt>{{ t('预计到货', 'Estimated Delivery') }}</dt><dd data-testid="doctor-delivery-date">{{ deliveryDateLabel(deliveryPlan) }}</dd></div>
                <div><dt>{{ t('制作天数', 'Production') }}</dt><dd>{{ t('{count} 天', '{count} day(s)', { count: deliveryPlan.production_days }) }}</dd></div>
                <div><dt>{{ t('在途天数', 'Transit') }}</dt><dd>{{ t('{count} 天', '{count} day(s)', { count: deliveryPlan.transit_days }) }}</dd></div>
                <div><dt>{{ t('过程确认', 'Confirmations') }}</dt><dd>{{ t('{count} 项 · +{days} 天', '{count} item(s) · +{days} day(s)', { count: deliveryPlan.process_confirmation_count, days: deliveryPlan.process_confirmation_days }) }}</dd></div>
                <div v-if="deliveryPlan.waiting_days > 0"><dt>{{ t('等待顺延', 'Waiting Extension') }}</dt><dd>{{ t('+{count} 天', '+{count} day(s)', { count: deliveryPlan.waiting_days }) }}</dd></div>
              </dl>

              <div v-if="deliveryPlan.delivery_alert_message" class="dv2-delivery-alert" data-testid="doctor-delivery-alert">
                {{ deliveryPlan.delivery_alert_message }}
              </div>

              <div class="dv2-delivery-adjust">
                <label>
                  <span>{{ t('要求到货时间', 'Requested Delivery Date') }}</span>
                  <input v-model="requestedDeliveryDateDraft" :type="dateInputType" :placeholder="dateInputPlaceholder" inputmode="numeric" pattern="\d{4}-\d{2}-\d{2}" maxlength="10" data-testid="doctor-requested-delivery-date">
                </label>
                <button type="button" class="dv2-secondary-button" :disabled="deliveryPlanBusy" data-testid="doctor-save-requested-delivery-date" @click="saveRequestedDeliveryDate">{{ t('保存到货时间', 'Save Delivery Date') }}</button>
              </div>

              <div v-if="deliveryPlan.process_confirmations.length" class="dv2-delivery-confirmations">
                <article v-for="confirmation in deliveryPlan.process_confirmations" :key="confirmation.confirmation_code" :class="{ overdue: confirmation.overdue }">
                  <div>
                    <strong>{{ processConfirmationName(confirmation) }}</strong>
                    <small>
                      {{ processConfirmationStatusLabel(confirmation.confirmation_status) }}
                      <template v-if="confirmation.overdue"> · {{ t('已超期 {count} 天，交期已顺延', '{count} day(s) overdue; delivery date extended', { count: confirmation.waiting_days }) }}</template>
                    </small>
                  </div>
                  <div v-if="confirmation.confirmation_status === 'AWAITING_DOCTOR'" class="dv2-delivery-confirm-actions">
                    <button type="button" class="dv2-primary-button" :disabled="deliveryPlanBusy" @click="respondProcessConfirmation(confirmation, true)">{{ t('确认', 'Confirm') }}</button>
                    <button type="button" class="dv2-secondary-button" :disabled="deliveryPlanBusy" @click="respondProcessConfirmation(confirmation, false)">{{ t('要求修改', 'Request Changes') }}</button>
                  </div>
                </article>
              </div>

              <div v-if="deliveryPlan.try_in.try_in_required" class="dv2-delivery-tryin" data-testid="doctor-try-in">
                <strong>{{ t('试戴', 'Try-in') }}</strong>
                <p>
                  {{ tryInStatusLabel(deliveryPlan.try_in.try_in_status ?? 'REQUESTED') }}
                </p>
              </div>

              <div v-if="deliveryPlan.bill_items.length" class="dv2-delivery-bill-items" data-testid="doctor-bill-items">
                <strong>{{ t('计价项', 'Billable Items') }}</strong>
                <ul>
                  <li v-for="item in deliveryPlan.bill_items" :key="item.item_code">
                    <span>{{ billItemName(item) }}</span>
                    <em>{{ item.pricing_status === 'PRICED' && item.amount_cents !== null ? `${(item.amount_cents / 100).toFixed(2)} ${item.currency}` : t('待报价', 'Quote Pending') }}</em>
                  </li>
                </ul>
              </div>
            </section>

            <section class="dv2-detail-section">
              <h3>{{ t('公开进度', 'Public Progress') }}</h3>
              <div class="dv2-progress">
                <article v-for="item in selectedOrder.progress" :key="item.key" :class="item.status.toLowerCase()">
                  <span>{{ item.status === 'DONE' ? '✓' : ({ submitted: '📥', review: '🔎', design: '✏️', production: '⚙️', 'final-review': '✅', 'ready-to-ship': '📦', shipped: '🚀', completed: '✓' } as Record<string, string>)[item.key] || '•' }}</span>
                  <div>
                    <strong>{{ publicProgressLabel(item) }}</strong>
                    <small>{{ item.status === 'DONE' ? t('已完成', 'Completed') : item.status === 'ACTIVE' ? t('⚡ 进行中', '⚡ In Progress') : t('待开始', 'Not Started') }}<template v-if="item.occurred_at"> · {{ compactDoctorDateTime(item.occurred_at) }}</template></small>
                    <p v-if="item.note">{{ publicProgressNote(item) }}</p>
                  </div>
                </article>
              </div>
              <div class="dv2-public-message">{{ publicOrderMessage(selectedOrder.public_message) }}</div>
              <div class="dv2-reference-actions">
                <button type="button" class="dv2-secondary-button" @click="openSelectedOrderConversation">💬 {{ t('进入订单沟通', 'Open Conversation') }}</button>
              </div>
              <div class="dv2-order-lock-note">{{ selectedOrder.current_action === 'NONE' ? t('🔒 订单正在按公开流程处理，如需调整请直接在下方联系订单服务。', '🔒 This order is proceeding through the public workflow. Contact Order Support below if changes are needed.') : t('ℹ️ 完成当前待办后订单将继续推进；如需协助，可直接在本抽屉发送消息。', 'ℹ️ The order will proceed after the current action is completed. You can message Order Support here for help.') }}</div>
            </section>

            <section class="dv2-detail-section">
              <h3>🦷 {{ t('订单资料与临床要求', 'Order Records & Clinical Requirements') }}</h3>
              <div v-if="selectedOrder.review_options.length" class="dv2-order-flags">
                <span v-for="reviewType in selectedOrder.review_options" :key="reviewType">{{ reviewType === 'CAD_DESIGN' ? '✏️' : '📸' }} {{ reviewLabel(reviewType) }}</span>
              </div>
              <div class="dv2-tooth-chart-card">
                <div class="dv2-tooth-chart-title"><strong>{{ t('牙位选择', 'Tooth Selection') }}</strong><span>{{ t('已选：{teeth}', 'Selected: {teeth}', { teeth: selectedOrderToothText }) }}</span></div>
                <template v-if="selectedOrderTeeth.size">
                  <small>{{ t('上颌', 'Upper Arch') }}</small>
                  <div class="dv2-tooth-row"><span v-for="tooth in upperTeeth" :key="tooth" :class="{ selected: selectedOrderTeeth.has(tooth) }">{{ tooth }}</span></div>
                  <small>{{ t('下颌', 'Lower Arch') }}</small>
                  <div class="dv2-tooth-row"><span v-for="tooth in lowerTeeth" :key="tooth" :class="{ selected: selectedOrderTeeth.has(tooth) }">{{ tooth }}</span></div>
                </template>
                <p v-else>{{ t('当前牙位以订单原始文本记录：{teeth}', 'Tooth position is stored as the original order text: {teeth}', { teeth: selectedOrderToothText }) }}</p>
              </div>
              <dl class="dv2-detail-grid">
                <div v-for="item in selectedOrderSpecEntries" :key="item.key"><dt>{{ item.label }}</dt><dd>{{ item.value }}</dd></div>
              </dl>
              <div class="dv2-clinical-note"><strong>📝 {{ t('医生临床说明', 'Clinical Notes') }}</strong><p>{{ selectedOrderClinicalNotes || t('暂未填写额外临床说明。', 'No additional clinical notes.') }}</p></div>
            </section>

            <section class="dv2-detail-section">
              <h3>📁 {{ t('订单文件与图片', 'Order Files & Images') }}</h3>
              <div class="dv2-file-list">
                <button v-for="item in selectedOrder.files" :key="item.file_id" type="button" @click="previewFile(item)"><i><img v-if="item.kind === 'IMAGE' && item.preview_url" :src="item.preview_url" :alt="item.name"><template v-else>{{ fileGlyph(item) }}</template></i><div><strong>{{ item.name }}</strong><small>{{ item.kind }} · {{ item.size_label }} · {{ compactDoctorDateTime(item.uploaded_at) }}</small></div><span>{{ t('预览', 'Preview') }} ↗</span></button>
                <div v-if="!selectedOrder.files.length" class="dv2-empty">{{ t('暂无医生可见文件', 'No doctor-visible files') }}</div>
              </div>
            </section>

            <section class="dv2-detail-section">
              <h3>📊 {{ t('订单时间线', 'Order Timeline') }}</h3>
              <div class="dv2-order-timeline">
                <article v-for="item in orderTimelineItems" :key="item.key" :class="`is-${item.tone}`">
                  <time>{{ doctorTimelineDateTime(item.occurredAt) }}</time>
                  <div><strong>{{ item.title }}</strong><span>{{ item.actor }}</span></div>
                </article>
                <div v-if="!orderTimelineItems.length" class="dv2-empty">{{ t('此订单暂无公开时间线记录', 'No public timeline records for this order') }}</div>
              </div>
            </section>

            <section class="dv2-detail-section">
              <h3>💬 {{ t('信息与设计评测', 'Messages & Design Review') }}</h3>
              <p class="dv2-section-note">{{ t('订单沟通、设计确认记录和医生反馈集中展示；可直接在这里回复订单服务。', 'Order messages, design reviews, and doctor feedback are shown together. You can reply to Order Support here.') }}</p>
              <div class="dv2-order-dialogue" data-testid="doctor-order-dialogue">
                <article v-for="message in selectedOrder.messages" :key="message.message_id" class="dv2-order-bubble" :class="{ 'is-self': message.sender === 'SELF' }">
                  <strong>{{ message.sender === 'SELF' ? selectedOrder.doctor_name : t('订单服务', 'Order Support') }}</strong>
                  <p>{{ message.content }}</p>
                  <time>{{ preciseDoctorDateTime(message.sent_at) }}</time>
                </article>
              <div v-for="review in selectedOrder.reviews" :key="review.review_id" class="dv2-review-card is-drawer">
                <header><div><strong>📐 {{ reviewLabel(review.review_type) }}</strong><small>{{ t('当前版本 V{version}', 'Current Version V{version}', { version: review.current_version }) }}</small></div><span :class="`dv2-status is-${statusTone(review.status)}`">{{ label(review.status) }}</span></header>
                <div v-if="currentReviewFiles(review).length" class="dv2-design-preview">
                  <strong>{{ review.review_type === 'CAD_DESIGN' ? t('📐 3D 设计预览', '📐 3D Design Preview') : t('📸 设计评测图片', '📸 Design Review Images') }}</strong>
                  <small>{{ productNameLabel(selectedOrder.product_name, selectedOrder.product_type) }} · {{ t('确认前请检查当前版本', 'Review the current version before confirming') }}</small>
                  <div>
                    <button v-for="item in currentReviewFiles(review)" :key="`preview-${item.file_id}`" type="button" @click="previewFile(item)"><img v-if="item.kind === 'IMAGE' && item.preview_url" :src="item.preview_url" :alt="item.name"><i v-else>{{ fileGlyph(item) }}</i><span>{{ item.name }}</span></button>
                  </div>
                </div>
                <div class="dv2-version-list">
                  <article v-for="version in [...review.versions].reverse()" :key="version.version">
                    <div><strong>V{{ version.version }}</strong><span>{{ label(version.status) }}</span><small>{{ preciseDoctorDateTime(version.submitted_at) }}</small></div>
                    <button v-for="item in version.files" :key="item.file_id" type="button" @click="previewFile(item)"><i><img v-if="item.kind === 'IMAGE' && item.preview_url" :src="item.preview_url" :alt="item.name"><template v-else>{{ fileGlyph(item) }}</template></i><span>{{ item.name }}<small>{{ item.kind }} · {{ item.size_label }}</small></span><em>{{ t('预览', 'Preview') }} ↗</em></button>
                    <p v-if="version.doctor_comment">{{ t('医生意见：', 'Doctor Comment: ') }}{{ version.doctor_comment }}</p>
                  </article>
                </div>
                <footer v-if="review.status === 'PENDING_REVIEW'">
                  <template v-if="canReview && review.allowed_actions.some((action) => ['APPROVE_REVIEW', 'REJECT_REVIEW'].includes(action))">
                    <button v-if="review.allowed_actions.includes('REJECT_REVIEW')" type="button" class="dv2-danger-button" :disabled="reviewSubmitting" @click="startReviewDecision(selectedOrder.order_id, review, 'REJECT')">{{ t('驳回并留言', 'Reject & Comment') }}</button>
                    <button v-if="review.allowed_actions.includes('APPROVE_REVIEW')" type="button" class="dv2-primary-button" :disabled="reviewSubmitting" @click="startReviewDecision(selectedOrder.order_id, review, 'APPROVE')">{{ t('同意当前版本', 'Approve Version') }}</button>
                  </template>
                  <p v-else>{{ t('当前账号不能执行此操作。', 'Your current account cannot perform this action.') }}</p>
                </footer>
              </div>
                <div v-if="!selectedOrder.messages.length && !selectedOrder.reviews.length" class="dv2-empty">{{ t('此订单暂无沟通信息和设计确认记录', 'No messages or design review records for this order') }}</div>
              </div>
              <form class="dv2-order-reply" @submit.prevent="sendOrderDrawerMessage">
                <input v-model="orderDrawerMessageDraft" type="text" maxlength="1000" :placeholder="t('给实验室/客服的消息……', 'Message to the lab or Order Support…')" :disabled="!canSendOrderDrawerMessage || orderDrawerMessageSending">
                <button type="submit" :disabled="!canSendOrderDrawerMessage || orderDrawerMessageSending || !orderDrawerMessageDraft.trim()">{{ orderDrawerMessageSending ? t('发送中…', 'Sending…') : t('发送', 'Send') }}</button>
              </form>
              <p v-if="!canSendOrderDrawerMessage" class="dv2-order-reply-disabled">{{ t('当前订单仅供查看，暂不支持发送消息。', 'This order is read-only and does not currently support messaging.') }}</p>
            </section>
          </div>

        </template>
      </aside>
    </div>

    <div v-if="patientDrawerOpen" class="dv2-drawer-mask" @mousedown.self="patientDrawerOpen = false">
      <aside class="dv2-patient-drawer">
        <header>
          <div><small>{{ t('患者档案', 'Patient Record') }} · {{ selectedPatient?.patient_code || t('读取中', 'Loading') }}</small><h2>{{ selectedPatient?.patient_name || t('正在加载', 'Loading') }}</h2></div>
          <div class="dv2-drawer-header-actions"><button v-if="selectedPatient && !patientEditMode" type="button" @click="beginPatientEdit">{{ t('编辑档案', 'Edit Record') }}</button><button type="button" class="is-close" @click="patientDrawerOpen = false">×</button></div>
        </header>
        <div v-if="patientLoading" class="dv2-loading-card"><span class="dv2-spinner" />{{ t('正在读取患者档案…', 'Loading patient record…') }}</div>
        <template v-else-if="selectedPatient">
          <div class="dv2-patient-head">
            <span class="dv2-avatar is-large">{{ selectedPatient.patient_name.slice(0, 1) }}</span>
            <div><strong>{{ selectedPatient.patient_name }}</strong><small>{{ selectedPatient.clinic_name }} · {{ selectedPatient.doctor_name }}</small><p><span :class="`dv2-status is-${patientTreatmentTone(selectedPatient)}`">● {{ patientTreatmentLabel(selectedPatient) }}</span><span v-for="tag in selectedPatient.tags" :key="tag" class="dv2-tag">{{ tag }}</span></p></div>
            <dl><div><dt>{{ t('订单', 'Orders') }}</dt><dd>{{ selectedPatient.order_count }}</dd></div><div><dt>{{ t('疗程', 'Duration') }}</dt><dd>{{ patientDurationLabel(selectedPatient) }}</dd></div></dl>
          </div>
          <div v-if="!patientEditMode" class="dv2-tabbar is-drawer"><button v-for="item in [{ key: 'basic', label: t('患者资料', 'Patient Details') }, { key: 'orders', label: t('订单历史 {count}', 'Order History {count}', { count: selectedPatient.orders.length }) }, { key: 'history', label: t('历史参考', 'History Reference') }]" :key="item.key" type="button" :class="{ active: patientDrawerTab === item.key }" @click="patientDrawerTab = item.key as typeof patientDrawerTab">{{ item.label }}</button></div>
          <div class="dv2-drawer-body">
            <form v-if="patientEditMode" class="dv2-patient-edit-form" @submit.prevent="savePatientChanges">
              <header><div><h3>{{ t('编辑患者档案', 'Edit Patient Record') }}</h3><p>{{ t('诊所和负责医生由当前登录身份确定，不能跨诊所修改。', 'Clinic and doctor are determined by the current login and cannot be changed across clinics.') }}</p></div></header>
              <div class="dv2-form-grid">
                <label><span>{{ t('患者姓名 *', 'Patient Name *') }}</span><input v-model="newPatient.name" maxlength="128"></label>
                <label><span>{{ t('患者编号', 'Patient ID') }}</span><input :value="selectedPatient.patient_code" disabled></label>
                <label><span>{{ t('出生日期', 'Date of Birth') }}</span><input v-model="newPatient.dateOfBirth" :type="dateInputType" :placeholder="dateInputPlaceholder" inputmode="numeric" pattern="\d{4}-\d{2}-\d{2}" maxlength="10"></label>
                <label><span>{{ t('年龄', 'Age') }}</span><input v-model="newPatient.age" type="number" min="0" max="150"></label>
                <label><span>{{ t('性别', 'Gender') }}</span><select v-model="newPatient.gender"><option value="">{{ t('请选择', 'Select') }}</option><option value="男">{{ t('男', 'Male') }}</option><option value="女">{{ t('女', 'Female') }}</option><option value="其他">{{ t('其他', 'Other') }}</option></select></label>
                <label><span>{{ t('治疗状态', 'Treatment Status') }}</span><select v-model="newPatient.treatmentStatus"><option value="IN_TREATMENT">{{ t('治疗中', 'In Treatment') }}</option><option value="FOLLOW_UP">{{ t('待复诊', 'Follow-up Due') }}</option><option value="TREATMENT_ENDED">{{ t('治疗结束', 'Treatment Complete') }}</option><option value="ARCHIVED">{{ t('已归档', 'Archived') }}</option></select></label>
                <label><span>{{ t('联系电话', 'Phone') }}</span><input v-model="newPatient.phone" maxlength="64" :placeholder="t('请输入联系电话', 'Enter phone number')"></label>
                <label><span>{{ t('电子邮箱', 'Email') }}</span><input v-model="newPatient.email" type="email" maxlength="160" placeholder="patient@example.com"></label>
                <label><span>{{ t('疗程开始', 'Treatment Start') }}</span><input v-model="newPatient.treatmentStartedAt" :type="dateInputType" :placeholder="dateInputPlaceholder" inputmode="numeric" pattern="\d{4}-\d{2}-\d{2}" maxlength="10"></label>
                <label><span>{{ t('疗程结束', 'Treatment End') }}</span><input v-model="newPatient.treatmentEndedAt" :type="dateInputType" :placeholder="dateInputPlaceholder" inputmode="numeric" pattern="\d{4}-\d{2}-\d{2}" maxlength="10" :disabled="!['TREATMENT_ENDED', 'ARCHIVED'].includes(newPatient.treatmentStatus)"></label>
                <label class="is-full"><span>{{ t('标签', 'Tags') }}</span><input v-model="newPatient.tags" maxlength="512" :placeholder="t('多个标签用逗号分隔', 'Separate multiple tags with commas')"></label>
                <label class="is-full"><span>{{ t('口腔情况摘要', 'Oral Condition Summary') }}</span><textarea v-model="newPatient.oralDescription" maxlength="512" rows="3" :placeholder="t('记录牙位、口内情况及修复关注点', 'Record tooth positions, oral findings, and restoration concerns')"></textarea></label>
                <label class="is-full"><span>{{ t('病史 / 用药 / 过敏信息', 'Medical History / Medication / Allergies') }}</span><textarea v-model="newPatient.medicalNotes" maxlength="1000" rows="4" :placeholder="t('过敏、用药、特殊注意事项……', 'Allergies, medications, and special considerations…')"></textarea></label>
              </div>
            </form>
            <template v-else-if="patientDrawerTab === 'basic'">
              <section class="dv2-detail-section"><h3>{{ t('联系与身份', 'Contact & Identity') }}</h3><dl class="dv2-detail-grid"><div><dt>{{ t('患者编号', 'Patient ID') }}</dt><dd>{{ selectedPatient.patient_code }}</dd></div><div><dt>{{ t('出生日期', 'Date of Birth') }}</dt><dd>{{ patientDate(selectedPatient.date_of_birth) }}</dd></div><div><dt>{{ t('年龄 / 性别', 'Age / Gender') }}</dt><dd>{{ selectedPatient.patient_age ?? '-' }} {{ t('岁', 'years') }} / {{ patientGenderLabel(selectedPatient.patient_gender) }}</dd></div><div><dt>{{ t('建档日期', 'Created') }}</dt><dd>{{ patientDate(selectedPatient.created_at) }}</dd></div><div><dt>{{ t('联系电话', 'Phone') }}</dt><dd>{{ selectedPatient.phone || '-' }}</dd></div><div><dt>{{ t('电子邮箱', 'Email') }}</dt><dd>{{ selectedPatient.email || '-' }}</dd></div></dl></section>
              <section class="dv2-detail-section"><h3>{{ t('治疗概览', 'Treatment Overview') }}</h3><dl class="dv2-detail-grid"><div><dt>{{ t('疗程开始', 'Treatment Start') }}</dt><dd>{{ patientDate(selectedPatient.treatment_started_at) }}</dd></div><div><dt>{{ t('疗程结束', 'Treatment End') }}</dt><dd>{{ patientDate(selectedPatient.treatment_ended_at) }}</dd></div><div class="is-full"><dt>{{ t('口腔情况摘要', 'Oral Condition Summary') }}</dt><dd>{{ selectedPatient.oral_description || '-' }}</dd></div><div class="is-full"><dt>{{ t('病史 / 用药 / 过敏', 'Medical History / Medication / Allergies') }}</dt><dd>{{ selectedPatient.medical_notes || t('未记录', 'Not Recorded') }}</dd></div></dl></section>
            </template>
            <template v-else-if="patientDrawerTab === 'orders'"><section class="dv2-detail-section"><h3>{{ t('订单历史', 'Order History') }}</h3><button v-for="order in selectedPatient.orders" :key="order.order_id" type="button" class="dv2-history-order" @click="patientDrawerOpen = false; openGlobalOrder(order.order_id)"><div><strong>{{ order.order_no }}</strong><small>{{ productNameLabel(order.product_name) }} · {{ compactDoctorDateTime(order.created_at) }}</small></div><span :class="`dv2-status is-${statusTone(order.external_status)}`">{{ label(order.external_status) }}</span></button><div v-if="!selectedPatient.orders.length" class="dv2-empty">{{ t('暂无历史订单', 'No previous orders') }}</div></section></template>
            <template v-else><section class="dv2-detail-section"><h3>{{ t('历史病例参考', 'Case History Reference') }}</h3><p class="dv2-section-note">{{ t('仅展示当前诊所权限范围内、可用于填写参考的历史订单。', 'Only previous orders visible to the current clinic are shown as references.') }}</p><article v-for="item in selectedPatient.history_references" :key="item.order_no" class="dv2-history-reference"><strong>{{ item.order_no }} · {{ productNameLabel(item.product_name) }}</strong><p>{{ item.summary }}</p><div><span v-for="field in item.matched_fields" :key="field" class="dv2-tag">{{ field }}</span></div></article><div v-if="!selectedPatient.history_references.length" class="dv2-empty">{{ t('暂无可参考历史记录', 'No reference history available') }}</div></section></template>
          </div>
          <footer class="dv2-drawer-footer">
            <template v-if="patientEditMode"><button type="button" class="dv2-secondary-button" @click="patientEditMode = false">{{ t('取消', 'Cancel') }}</button><button type="button" class="dv2-primary-button" :disabled="patientSaving" @click="savePatientChanges">{{ patientSaving ? t('保存中…', 'Saving…') : t('保存修改', 'Save Changes') }}</button></template>
            <button v-else-if="canCreateOrder" type="button" class="dv2-primary-button" @click="patientDrawerOpen = false; openWizard(selectedPatient.patient_id)">＋ {{ t('为患者新建订单', 'New Order for Patient') }}</button>
          </footer>
        </template>
      </aside>
    </div>

    <div v-if="logisticsDrawerOpen" class="dv2-drawer-mask" @mousedown.self="logisticsDrawerOpen = false"><aside class="dv2-logistics-drawer"><header><div><small>{{ t('物流详情', 'Shipment Details') }}</small><h2>{{ selectedLogistics?.order_no }}</h2></div><button type="button" @click="logisticsDrawerOpen = false">×</button></header><template v-if="selectedLogistics"><div class="dv2-logistics-summary"><div><small>{{ t('物流公司', 'Carrier') }}</small><strong>{{ selectedLogistics.carrier }}</strong></div><div><small>{{ t('运单号', 'Tracking Number') }}</small><strong class="dv2-mono">{{ selectedLogistics.tracking_no }}</strong></div><span :class="`dv2-status is-${statusTone(selectedLogistics.status)}`">{{ label(selectedLogistics.status) }}</span></div><div class="dv2-logistics-timeline"><article v-for="(event, index) in selectedLogistics.events" :key="`${event.time}-${event.label}`" :class="{ current: index === selectedLogistics.events.length - 1 }"><span>{{ index === selectedLogistics.events.length - 1 ? '✓' : '' }}</span><div><strong>{{ logisticsEventLabel(event.label) }}</strong><p>{{ event.location || '' }}</p><small>{{ event.time }}</small></div></article></div></template></aside></div>

    <DoctorCaseGroupWizard
      v-if="wizardOpen && dataset"
      :token="token"
      :patients="dataset.patients"
      :gateway="gateway"
      :initial-patient-id="wizardInitialPatientId || undefined"
      :initial-group-id="wizardInitialGroupId || undefined"
      :clinic-name="account?.clinic_name"
      :doctor-name="account?.display_name"
      :clinic-contact="account?.clinic_contact"
      @close="wizardOpen = false"
      @submitted="handleCaseGroupSubmitted"
    />

    <div v-if="false && wizardOpen" class="dv2-wizard" data-testid="doctor-order-wizard">
      <header><div><span class="dv2-brand-mark">P</span><div><strong>新建订单</strong><small>{{ wizardNotice || '填写过程中可随时保存草稿' }}</small></div></div><button type="button" @click="wizardOpen = false">关闭 ×</button></header>
      <div class="dv2-wizard-steps"><button v-for="(step, index) in ['产品与患者', '牙位与病例', '产品配置', '上传资料', '复核提交']" :key="step" type="button" :class="{ active: wizardStep === index + 1, done: wizardStep > index + 1 }" :disabled="index + 1 > wizardStep" @click="wizardStep = index + 1"><span>{{ wizardStep > index + 1 ? '✓' : index + 1 }}</span><strong>{{ step }}</strong></button></div>
      <main>
        <section v-if="wizardStep === 1" class="dv2-wizard-panel dv2-wizard-catalog">
          <aside class="dv2-product-categories"><header><small>产品目录</small><strong>选择修复类别</strong></header><button v-for="category in wizardCategories" :key="category.id" type="button" :class="{ active: wizardCategory === category.id, unavailable: !dataset?.products.some((item) => category.types.includes(item.product_type)) }" @click="chooseWizardCategory(category.id)"><span>{{ category.icon }}</span><div><strong>{{ category.name }}</strong><small>{{ category.note }}</small></div><i>{{ wizardCategory === category.id ? '✓' : '›' }}</i></button></aside>
          <div class="dv2-wizard-catalog-main">
            <header><div><span>{{ selectedWizardCategory.icon }}</span><div><h1>{{ selectedWizardCategory.name }}</h1><p>{{ selectedWizardCategory.note }}</p></div></div><small>步骤 1 / 5</small></header>
            <div class="dv2-wizard-first-grid">
              <section><h3>1. 选择患者</h3><label class="dv2-field-search"><span>⌕</span><input v-model="wizardPatientKeyword" type="search" placeholder="搜索患者姓名或编号"></label><div class="dv2-choice-list"><button v-for="patient in wizardPatientRows" :key="patient.patient_id" type="button" :class="{ active: wizard.patientId === patient.patient_id }" @click="wizard.patientId = patient.patient_id"><span class="dv2-avatar">{{ patient.patient_name.slice(0, 1) }}</span><div><strong>{{ patient.patient_name }}</strong><small>{{ patient.patient_code }} · {{ patient.doctor_name }}</small></div><i>{{ wizard.patientId === patient.patient_id ? '✓' : '' }}</i></button></div></section>
              <section><h3>2. 选择具体产品</h3><div class="dv2-product-choice"><button v-for="product in wizardCategoryProducts" :key="product.product_id" type="button" :class="{ active: wizard.productId === product.product_id }" @click="chooseWizardProduct(product)"><span>{{ selectedWizardCategory.icon }}</span><div><strong>{{ productNameLabel(product.product_name, product.product_type) }}</strong><small>{{ product.material }}</small><p>待报价</p></div><i>{{ wizard.productId === product.product_id ? '✓' : '' }}</i></button><div v-if="!wizardCategoryAvailable" class="dv2-inline-notice is-warning">当前类别暂未开放在线下单，请联系订单支持。</div></div></section>
            </div>
          </div>
        </section>
        <section v-else-if="wizardStep === 2" class="dv2-wizard-panel is-narrow"><header><h1>牙位与病例</h1><p>点击牙位图选择{{ wizardToothMode === 'MISSING' ? '缺失牙位' : '需要修复的牙位' }}</p></header><div class="dv2-tooth-mode"><button type="button" :class="{ active: wizardToothMode === 'RESTORE' }" @click="wizardToothMode = 'RESTORE'; wizard.caseFields.tooth_mode = 'RESTORE'">修复牙位</button><button type="button" :class="{ active: wizardToothMode === 'MISSING' }" @click="wizardToothMode = 'MISSING'; wizard.caseFields.tooth_mode = 'MISSING'">缺失牙位</button></div><div class="dv2-tooth-chart" role="group" aria-label="FDI 牙位选择图"><div class="dv2-arch-label">上颌</div><div class="dv2-tooth-row"><button v-for="tooth in wizardToothNumbers.slice(0, 16)" :key="tooth" type="button" :class="{ active: wizardSelectedTeeth.includes(tooth), missing: wizardToothMode === 'MISSING' && wizardSelectedTeeth.includes(tooth) }" :aria-label="`牙位 ${tooth}`" @click="toggleWizardTooth(tooth)"><svg viewBox="0 0 34 44" aria-hidden="true"><path d="M8 3C3 7 3 15 7 21c2 4 2 16 6 19 2 2 3-8 5-8s3 10 5 8c4-3 4-15 6-19 4-6 4-14-1-18-4-3-7 1-10 1S12 0 8 3Z" /></svg><span>{{ tooth }}</span></button></div><div class="dv2-tooth-midline" /><div class="dv2-tooth-row is-lower"><button v-for="tooth in wizardToothNumbers.slice(16)" :key="tooth" type="button" :class="{ active: wizardSelectedTeeth.includes(tooth), missing: wizardToothMode === 'MISSING' && wizardSelectedTeeth.includes(tooth) }" :aria-label="`牙位 ${tooth}`" @click="toggleWizardTooth(tooth)"><svg viewBox="0 0 34 44" aria-hidden="true"><path d="M8 3C3 7 3 15 7 21c2 4 2 16 6 19 2 2 3-8 5-8s3 10 5 8c4-3 4-15 6-19 4-6 4-14-1-18-4-3-7 1-10 1S12 0 8 3Z" /></svg><span>{{ tooth }}</span></button></div><div class="dv2-arch-label">下颌</div></div><div class="dv2-selected-teeth"><span>已选牙位</span><strong>{{ wizard.caseFields.tooth || '尚未选择' }}</strong></div><div class="dv2-form-stack"><label><span>病例说明</span><textarea v-model="wizard.caseFields.case_note" rows="5" placeholder="填写咬合、外形、色泽或其他临床制作要求"></textarea></label></div></section>
        <section v-else-if="wizardStep === 3" class="dv2-wizard-panel is-narrow"><header><h1>产品配置</h1><p>患者和牙位已从前两步自动带入，只需填写本产品的制作要求</p></header><div class="dv2-wizard-context" aria-label="当前订单信息"><div><span>当前患者</span><strong>{{ selectedWizardPatient?.patient_name || '尚未选择' }}</strong><small>{{ selectedWizardPatient?.patient_code || '-' }}</small></div><div><span>修复牙位</span><strong>{{ wizard.caseFields.tooth || '尚未选择' }}</strong><small>{{ wizardToothMode === 'MISSING' ? '缺失牙位' : '修复牙位' }}</small></div><div><span>具体产品</span><strong>{{ productNameLabel(selectedProduct?.product_name, selectedProduct?.product_type) }}</strong><small>{{ selectedProduct?.material || '-' }}</small></div></div><div v-if="selectedProduct" class="dv2-form-stack">
	  <DoctorDynamicFields
	    :fields="selectedProductFields"
	    :model-value="wizard.dynamicFields"
	    @update:model-value="wizard.dynamicFields = $event"
	  />
</div><div v-if="selectedProduct && !selectedProductFields.length" class="dv2-inline-notice">当前产品没有需要额外填写的制作参数，可以直接进入下一步。</div></section><section v-else-if="wizardStep === 4" class="dv2-wizard-panel is-narrow"><header><h1>上传资料</h1><p>上传 STL 扫描文件及必要的照片或 PDF 资料</p></header><label class="dv2-upload-zone" :class="{ disabled: wizardUploading, dragging: wizardDragActive }" @dragenter.prevent="wizardDragActive = true" @dragover.prevent="wizardDragActive = true" @dragleave.prevent="wizardDragActive = false" @drop.prevent="handleWizardDrop"><input type="file" multiple accept=".stl,.jpg,.jpeg,.png,.pdf" :disabled="wizardUploading" @change="addWizardFiles"><span>⇧</span><strong>{{ wizardUploading ? '文件上传中…' : wizardDragActive ? '松开以上传文件' : '点击选择或拖放文件' }}</strong><small>支持 STL、JPG、PNG、PDF；至少需要一个 STL 文件</small></label><div class="dv2-upload-checklist"><span :class="{ done: wizardStlCount > 0 }">{{ wizardStlCount > 0 ? '✓' : '1' }} STL 扫描</span><span :class="{ done: wizard.files.some((item) => item.kind === 'IMAGE') }">{{ wizard.files.some((item) => item.kind === 'IMAGE') ? '✓' : '2' }} 病例照片</span><span class="optional">3 PDF 医嘱（可选）</span></div><div class="dv2-file-list">
  <article v-for="fileItem in wizard.files" :key="fileItem.file_id"><i>{{ fileItem.kind }}</i>
    <div><strong>{{ fileItem.name }}</strong><small>{{ fileItem.size_label }} · 已就绪</small></div>
    <button type="button" :disabled="wizardSaving || wizardUploading" @click="removeWizardFile(fileItem)">移除</button>
  </article>
</div></section><section v-else class="dv2-wizard-panel"><header><h1>复核并提交</h1><p>确认资料完整后提交，正式报价与预计交期将在客服受理后确认</p></header><div class="dv2-inline-notice">如制作过程中需要确认设计稿，订单服务会在订单详情中通知您。</div><div class="dv2-review-summary"><section><h3>患者与产品</h3><dl><div><dt>患者</dt><dd>{{ selectedWizardPatient?.patient_name }} · {{ selectedWizardPatient?.patient_code }}</dd></div><div><dt>产品</dt><dd>{{ productNameLabel(selectedProduct?.product_name, selectedProduct?.product_type) }} · {{ selectedProduct?.material || '-' }}</dd></div><div><dt>价格</dt><dd>由客服核价确认</dd></div></dl></section><section><h3>病例与配置</h3><dl><div><dt>牙位</dt><dd>{{ wizard.caseFields.tooth }}</dd></div><div v-for="summaryField in selectedProductFields" :key="summaryField.key">
  <dt>{{ summaryField.label }}</dt><dd>{{ wizard.dynamicFields[summaryField.key] || '-' }}</dd>
</div></dl></section><section><h3>文件与后续确认</h3><dl><div><dt>文件</dt><dd>{{ wizard.files.length }} 个（STL {{ wizardStlCount }}）</dd></div><div><dt>设计稿确认</dt><dd>收到通知后由医生确认</dd></div></dl></section></div><div v-if="wizardMissingForStep(4).length" class="dv2-inline-notice is-warning">资料检查：还需补充 {{ wizardMissingForStep(4).join('、') }}</div><div v-else class="dv2-inline-notice is-success">资料检查：必填资料已齐全，可以提交。</div></section></main><footer><button type="button" class="dv2-secondary-button" :disabled="wizardSaving || wizardSubmitting || wizardUploading" @click="saveWizardDraft(false)">{{ wizardSaving ? '保存中…' : '保存草稿' }}</button><div><button v-if="wizardStep > 1" type="button" class="dv2-secondary-button" :disabled="wizardSaving || wizardSubmitting || wizardUploading" @click="wizardStep--">上一步</button><button v-if="wizardStep < 5" type="button" class="dv2-primary-button" :disabled="wizardSaving || wizardSubmitting || wizardUploading" @click="nextWizardStep">下一步</button><button v-else type="button" class="dv2-primary-button" :disabled="wizardSubmitDisabled" @click="submitWizard">{{ wizardSubmitting ? '提交中…' : '提交订单' }}</button></div></footer></div>

    <el-dialog v-model="rejectDialogOpen" :title="t('驳回并提交修改意见', 'Reject and Request Changes')" width="520px" append-to-body><p class="dv2-dialog-note">{{ t('说明需要调整的具体内容。对方提交新版本后，您可以再次确认。', 'Describe the required changes. You can review again after a new version is submitted.') }}</p><el-input v-model="rejectReason" type="textarea" :rows="5" maxlength="500" show-word-limit :placeholder="t('必填，请写明需要修改的位置和要求', 'Required: specify what needs to change')" /><template #footer><el-button :disabled="reviewSubmitting" @click="rejectDialogOpen = false">{{ t('取消', 'Cancel') }}</el-button><el-button type="danger" :disabled="reviewSubmitting || !rejectReason.trim()" @click="submitReviewDecision('REJECT')">{{ reviewSubmitting ? t('提交中…', 'Submitting…') : t('确认驳回并发送', 'Reject and Send') }}</el-button></template></el-dialog>

    <el-dialog v-model="patientDialogOpen" class="dv2-patient-dialog" :title="t('新建患者', 'New Patient')" width="720px" append-to-body destroy-on-close>
      <p class="dv2-patient-dialog-intro">{{ t('建立患者档案后，可直接关联订单并持续查看治疗历史。', 'Create a patient record to link orders and track treatment history.') }}</p>
      <div class="dv2-form-grid">
        <label><span>{{ t('患者姓名 *', 'Patient Name *') }}</span><input v-model="newPatient.name" maxlength="128" :placeholder="t('请输入患者姓名', 'Enter patient name')"></label>
        <label><span>{{ t('患者编号', 'Patient ID') }}</span><input :value="t('保存后自动生成', 'Generated after saving')" disabled></label>
        <label><span>{{ t('出生日期', 'Date of Birth') }}</span><input v-model="newPatient.dateOfBirth" :type="dateInputType" :placeholder="dateInputPlaceholder" inputmode="numeric" pattern="\d{4}-\d{2}-\d{2}" maxlength="10"></label>
        <label><span>{{ t('性别', 'Gender') }}</span><select v-model="newPatient.gender"><option value="">{{ t('请选择', 'Select') }}</option><option value="男">{{ t('男', 'Male') }}</option><option value="女">{{ t('女', 'Female') }}</option><option value="其他">{{ t('其他', 'Other') }}</option></select></label>
        <label><span>{{ t('联系电话', 'Phone') }}</span><input v-model="newPatient.phone" maxlength="64" :placeholder="t('请输入联系电话', 'Enter phone number')"></label>
        <label><span>{{ t('电子邮箱', 'Email') }}</span><input v-model="newPatient.email" type="email" maxlength="160" placeholder="patient@example.com"></label>
        <label><span>{{ t('所属诊所', 'Clinic') }}</span><input :value="account?.clinic_name || t('当前诊所', 'Current Clinic')" disabled></label>
        <label><span>{{ t('负责医生', 'Doctor') }}</span><input :value="account?.display_name || t('当前医生', 'Current Doctor')" disabled></label>
        <label><span>{{ t('治疗状态', 'Treatment Status') }}</span><select v-model="newPatient.treatmentStatus"><option value="IN_TREATMENT">{{ t('治疗中', 'In Treatment') }}</option><option value="FOLLOW_UP">{{ t('待复诊', 'Follow-up Due') }}</option><option value="TREATMENT_ENDED">{{ t('治疗结束', 'Treatment Complete') }}</option><option value="ARCHIVED">{{ t('已归档', 'Archived') }}</option></select></label>
        <label><span>{{ t('疗程开始', 'Treatment Start') }}</span><input v-model="newPatient.treatmentStartedAt" :type="dateInputType" :placeholder="dateInputPlaceholder" inputmode="numeric" pattern="\d{4}-\d{2}-\d{2}" maxlength="10"></label>
        <label class="is-full"><span>{{ t('标签', 'Tags') }}</span><input v-model="newPatient.tags" maxlength="512" :placeholder="t('例如：VIP、种植、复诊；多个标签用逗号分隔', 'For example: VIP, implant, follow-up; separate tags with commas')"></label>
        <label class="is-full"><span>{{ t('口腔情况摘要', 'Oral Condition Summary') }}</span><textarea v-model="newPatient.oralDescription" maxlength="512" rows="3" :placeholder="t('记录牙位、口内情况及修复关注点', 'Record tooth positions, oral findings, and restoration concerns')"></textarea></label>
        <label class="is-full"><span>{{ t('病史 / 用药 / 过敏信息', 'Medical History / Medication / Allergies') }}</span><textarea v-model="newPatient.medicalNotes" maxlength="1000" rows="4" :placeholder="t('过敏、用药、特殊注意事项……', 'Allergies, medications, and special considerations…')"></textarea></label>
      </div>
      <template #footer><el-button @click="patientDialogOpen = false">{{ t('取消', 'Cancel') }}</el-button><el-button type="primary" :disabled="patientSaving || !newPatient.name.trim()" @click="createPatient">{{ patientSaving ? t('保存中…', 'Saving…') : t('保存患者', 'Save Patient') }}</el-button></template>
    </el-dialog>

    <el-dialog v-model="memberDialogOpen" :title="t('邀请诊所成员', 'Invite Clinic Member')" width="600px" append-to-body><div class="dv2-form-grid"><label><span>{{ t('成员姓名 *', 'Member Name *') }}</span><input v-model="newMember.displayName"></label><label><span>{{ t('邮箱 *', 'Email *') }}</span><input v-model="newMember.email" type="email"></label><label><span>{{ t('诊所角色', 'Clinic Role') }}</span><select v-model="newMember.role">
  <option v-for="roleOption in clinicRoleOptions" :key="roleOption.value" :value="roleOption.value">{{ roleOption.name }}</option>
</select></label><label><span>{{ t('账单权限', 'Billing Access') }}</span><select v-model="newMember.billing"><option value="NONE">{{ t('无', 'None') }}</option><option value="VIEW">{{ t('查看', 'View') }}</option><option value="FINANCIAL_ACTION">{{ t('财务操作', 'Financial Actions') }}</option></select></label><label><span>{{ t('物流权限', 'Shipment Access') }}</span><select v-model="newMember.logistics"><option value="NONE">{{ t('无', 'None') }}</option><option value="VIEW">{{ t('查看', 'View') }}</option><option value="RECEIPT">{{ t('查看并确认收货', 'View and Confirm Receipt') }}</option></select></label></div><div class="dv2-inline-notice">{{ t('诊所管理员只能分配医生端成员角色。', 'Clinic Administrators can only assign doctor-portal member roles.') }}</div><template #footer><el-button @click="memberDialogOpen = false">{{ t('取消', 'Cancel') }}</el-button><el-button type="primary" @click="addMember">{{ t('发送邀请', 'Send Invitation') }}</el-button></template></el-dialog>

    <el-dialog v-model="filePreviewOpen" :title="t('文件预览', 'File Preview')" width="860px" append-to-body destroy-on-close><div class="dv2-preview-stage"><img v-if="filePreview?.kind === 'IMAGE' && filePreview.preview_url" class="dv2-preview-image" :src="filePreview.preview_url" :alt="filePreviewName"><iframe v-else-if="filePreview?.kind === 'PDF' && filePreview.preview_url" class="dv2-preview-frame" :src="filePreview.preview_url" :title="filePreviewName" /><div v-else-if="filePreview?.preview_url" class="dv2-preview-placeholder"><span>{{ t('文件', 'File') }}</span><strong>{{ filePreviewName }}</strong><p>{{ t('该格式请在浏览器新窗口中查看。', 'Open this file type in a new browser window.') }}</p></div><div v-else class="dv2-preview-placeholder"><span>!</span><strong>{{ filePreviewName }}</strong><p>{{ t('预览地址已失效，请关闭后重新打开。', 'The preview link has expired. Close and reopen the file.') }}</p></div></div><template #footer><el-button v-if="filePreview?.preview_url" tag="a" :href="filePreview.preview_url" target="_blank" rel="noopener noreferrer">{{ t('新窗口打开', 'Open in New Window') }}</el-button><el-button @click="filePreviewOpen = false">{{ t('关闭', 'Close') }}</el-button></template></el-dialog>

    <StlViewerDialog v-if="viewerFile" v-model:visible="viewerOpen" :source-url="viewerFile.preview_url || ''" :filename="viewerFile.name" />
  </div>
</template>
