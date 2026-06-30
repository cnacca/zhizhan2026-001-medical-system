<script setup lang="ts">
import Uppy from '@uppy/core'
import { computed, onBeforeUnmount, ref } from 'vue'

type AuthMenu = {
  menuCode: string
  menuName: string
  menuType: string
  routePath: string | null
  componentPath: string | null
  permissionCode: string | null
  icon: string | null
  sortOrder: number | null
}

type LoginResponse = {
  accessToken: string
  username: string
  userId: number | null
  clinicId: number | null
  roles: string[]
  permissions: string[]
  menus: AuthMenu[]
  dataScope: string | null
  expiresAt: string
}

type ApiResponse<T> = {
  code: number
  msg: string
  data: T
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

type UnreadCountResponse = {
  unread_count: number
}

type PushNotificationPayload = {
  event?: string
  orderId?: number
  order_id?: number
  orderNo?: string
  order_no?: string
  message?: string
  timestamp?: string
}

type DoctorOrderItem = {
  order_id: number
  order_no: string
  product_type: string
  external_status: string
  form_data: Record<string, unknown>
  public_message: string | null
  bill_status: string | null
  logistics_status: string | null
  tracking_no: string | null
}

type DoctorOrderListResponse = {
  items: DoctorOrderItem[]
  total: number
  page: number
  size: number
}

type InternalOrderItem = {
  order_id: number
  order_no: string
  clinic_id: number
  clinic_name: string
  doctor_user_id: number | null
  cs_user_id: number | null
  product_type: string
  internal_status: string
  external_status: string
  production_note: string | null
  reject_reason: string | null
  form_data: Record<string, unknown>
}

type InternalOrderListResponse = {
  items: InternalOrderItem[]
  total: number
  page: number
  size: number
}

type MessageItem = {
  msg_id: number
  order_id: number
  sender_user_id: number | null
  sender_role: string
  content: string
  visible_to: string
  review_status: string
}

type DesignDraftItem = {
  draft_id: number
  order_id: number
  version: number
  uploader_user_id: number | null
  file_id: number | null
  status: string
}

type BillInfo = {
  bill_id: number | null
  order_id: number
  bill_status: string
  file_id: number | null
}

type LogisticsInfo = {
  logistics_id: number | null
  order_id: number
  carrier: string | null
  tracking_no: string | null
  logistics_status: string
}

type DoctorOrderWorkspace = {
  order: DoctorOrderItem
  messages: MessageItem[]
  drafts: DesignDraftItem[]
  bill: BillInfo
  logistics: LogisticsInfo
}

type DoctorAiAnswer = {
  answer: string
}

type FormFieldConfig = {
  field_id: number
  product_type: string
  field_key: string
  field_label: string
  field_type: string
  is_required: boolean
  options: string[]
  sort_order: number
}

type CreateOrderResponse = {
  order_id: number
  order_no: string
  product_type: string
  external_status: string
  form_data: Record<string, unknown>
}

type MultipartInitiateResponse = {
  file_id: number
  upload_id: string
  part_size: number
  part_count: number
  expires_in_seconds: number
}

type MultipartPartUrlResponse = {
  file_id: number
  upload_id: string
  part_number: number
  upload_url: string
  expires_in_seconds: number
}

type MultipartUploadedPart = {
  part_number: number
  etag: string
  size: number
}

type MultipartStatusResponse = {
  file_id: number
  upload_id: string
  upload_status: string
  part_size: number
  part_count: number
  completed_parts: MultipartUploadedPart[]
}

type MultipartPendingUpload = {
  file_id: number
  upload_id: string
  order_id: number
  source_type: string
  visibility: string
  original_filename: string
  content_type: string | null
  file_size: number
  part_size: number
  part_count: number
}

type MultipartPendingUploadsResponse = {
  items: MultipartPendingUpload[]
}

type DoctorUploadResumeSession = {
  file_id: number
  upload_id: string
  part_size: number
  part_count: number
  completed_parts: Array<{ part_number: number, etag: string }>
  updated_at: string
}

type FileCompleteResponse = {
  file_id: number
  upload_status: string
  file_size: number
  content_type: string | null
  checksum: string | null
}

type WorkflowChainSummary = {
  chain_id: number
  chain_name: string
  intake_branch: 'IMPRESSION' | 'SCAN' | 'BOTH'
  status: number
}

type ProductionReviewResponse = {
  order_id: number
  instance_id: number | null
  internal_status: string
  external_status: string
}

type ProcessNodeItem = {
  node_instance_id: number
  node_code: string
  process_name: string
  step_order: number
  is_optional: number
  branch_group: string | null
  assigned_user_id: number | null
  node_status: string
  standard_duration: number | null
}

type ProcessEdgeItem = {
  edge_instance_id: number
  from_node_instance_id: number
  to_node_instance_id: number
  edge_type: string
}

type ProcessInstanceDetail = {
  instance_id: number
  order_id: number
  instance_status: string
  nodes: ProcessNodeItem[]
  edges: ProcessEdgeItem[]
}

type WorkerTaskItem = {
  node_instance_id: number
  order_id: number
  order_no: string
  process_name: string
  node_status: string
  standard_duration: number | null
}

type CheckRecordResponse = {
  check_id: number
  node_instance_id: number
  check_type: number
  result: string
  rework_id: number | null
}

type ReworkRecordResponse = {
  rework_id: number
  order_id: number
  order_no: string
  source_check_id: number
  from_node_instance_id: number | null
  from_process_name: string | null
  target_node_instance_id: number | null
  target_process_name: string | null
  target_node_status: string | null
  assigned_user_id: number | null
  reason_detail: string | null
  status: string
  created_at: string
}

type WorkLogResponse = {
  work_log_id: number
  node_instance_id: number
  worker_user_id: number
  status: string
  pause_duration_seconds: number
  effective_duration_seconds: number | null
}

type PerformanceStatsResponse = {
  user_id: number | null
  completed_count: number
  effective_duration: number
  rework_count: number
  on_time_rate: number
  pass_rate: number
  duration_efficiency: number
}

type ProductionBoardStatusOption = {
  label: string
  value: string
}

const username = ref('admin')
const password = ref('change-me-admin')
const token = ref('')
const currentUser = ref<LoginResponse | null>(null)
const activeRoute = ref('/dashboard')
const loginError = ref('')
const health = ref('未检查')
const loading = ref(false)
const notifications = ref<NotificationItem[]>([])
const unreadCount = ref(0)
const notificationsLoading = ref(false)
const notificationError = ref('')
const notificationSocketStatus = ref<'未连接' | '连接中' | '已连接' | '已断开'>('未连接')
const lastRealtimeNotification = ref<PushNotificationPayload | null>(null)
const notificationSocket = ref<WebSocket | null>(null)
const doctorOrders = ref<DoctorOrderItem[]>([])
const selectedDoctorOrder = ref<DoctorOrderItem | null>(null)
const doctorOrderWorkspace = ref<DoctorOrderWorkspace | null>(null)
const doctorOrderKeyword = ref('')
const doctorOrdersLoading = ref(false)
const doctorOrderError = ref('')
const doctorActionLoading = ref(false)
const doctorMessageDraft = ref('')
const doctorAiQuestion = ref('我的订单现在到哪一步了？')
const doctorAiAnswer = ref('')
const doctorOrderFormProductType = ref('REGULAR_CROWN')
const doctorOrderFormFields = ref<FormFieldConfig[]>([])
const doctorOrderFormData = ref<Record<string, string | string[]>>({})
const doctorOrderFileIds = ref('')
const doctorUploadFiles = ref<File[]>([])
const doctorUploadProgress = ref('')
const doctorUploadCompletedFileIds = ref<number[]>([])
const doctorUploadResumeSessions = ref<Record<string, DoctorUploadResumeSession>>({})
const doctorUploadServerResumeCandidates = ref<MultipartPendingUpload[]>([])
const doctorUploadServerResumeOrderId = ref<number | null>(null)
const doctorUploadLoading = ref(false)
const doctorOrderCreateLoading = ref(false)
const doctorOrderCreateError = ref('')
const doctorOrderCreateResult = ref<CreateOrderResponse | null>(null)
const internalOrders = ref<InternalOrderItem[]>([])
const selectedInternalOrder = ref<InternalOrderItem | null>(null)
const internalOrderKeyword = ref('')
const internalOrdersLoading = ref(false)
const internalOrderError = ref('')
const csProductionNote = ref('')
const csRejectReason = ref('')
const csReviewActionLoading = ref(false)
const productionReviewOrders = ref<InternalOrderItem[]>([])
const selectedProductionReviewOrder = ref<InternalOrderItem | null>(null)
const productionReviewKeyword = ref('')
const productionReviewLoading = ref(false)
const productionReviewError = ref('')
const productionReviewActionLoading = ref(false)
const workflowChains = ref<WorkflowChainSummary[]>([])
const productionReviewChainId = ref<number | null>(null)
const productionReviewIntakeBranch = ref<'IMPRESSION' | 'SCAN'>('SCAN')
const productionReviewBranchParams = ref('{}')
const productionReviewRejectReason = ref('')
const productionReviewResult = ref<ProductionReviewResponse | null>(null)
const processInstanceOrders = ref<InternalOrderItem[]>([])
const selectedProcessInstanceOrder = ref<InternalOrderItem | null>(null)
const selectedProcessInstance = ref<ProcessInstanceDetail | null>(null)
const selectedProcessNodeId = ref<number | null>(null)
const processInstanceKeyword = ref('')
const processInstanceLoading = ref(false)
const processInstanceError = ref('')
const processAssignmentUserId = ref('9601')
const processAssignmentLoading = ref(false)
const processAssignmentResult = ref('')
const workerTasks = ref<WorkerTaskItem[]>([])
const workerTaskStatus = ref('READY')
const workerTasksLoading = ref(false)
const workerTaskError = ref('')
const workerTaskActionLoading = ref(false)
const checkTaskStatus = ref('READY')
const checkTasks = ref<WorkerTaskItem[]>([])
const selectedCheckTask = ref<WorkerTaskItem | null>(null)
const checkRecords = ref<CheckRecordResponse[]>([])
const checkType = ref<1 | 2>(1)
const checkPass = ref(true)
const checkRemark = ref('')
const checkReworkToNodeId = ref('')
const checkTasksLoading = ref(false)
const checkActionLoading = ref(false)
const checkError = ref('')
const checkResult = ref<CheckRecordResponse | null>(null)
const reworkRecords = ref<ReworkRecordResponse[]>([])
const reworkStatus = ref('PENDING')
const reworkRecordsLoading = ref(false)
const reworkError = ref('')
const selectedRework = ref<ReworkRecordResponse | null>(null)
const finalInspectionTasks = ref<WorkerTaskItem[]>([])
const selectedFinalInspectionTask = ref<WorkerTaskItem | null>(null)
const finalInspectionRecords = ref<CheckRecordResponse[]>([])
const finalInspectionRemark = ref('')
const finalInspectionLoading = ref(false)
const finalInspectionResult = ref<CheckRecordResponse | null>(null)
const worklogTaskStatus = ref('IN_PROGRESS')
const worklogTasks = ref<WorkerTaskItem[]>([])
const selectedWorklogTask = ref<WorkerTaskItem | null>(null)
const activeWorkLog = ref<WorkLogResponse | null>(null)
const worklogTasksLoading = ref(false)
const worklogActionLoading = ref(false)
const worklogError = ref('')
const performanceStats = ref<PerformanceStatsResponse | null>(null)
const performanceUserId = ref('')
const performanceLoading = ref(false)
const performanceError = ref('')
const productionBoardOrders = ref<InternalOrderItem[]>([])
const selectedProductionBoardOrder = ref<InternalOrderItem | null>(null)
const productionBoardInstance = ref<ProcessInstanceDetail | null>(null)
const productionBoardKeyword = ref('')
const productionBoardStatus = ref('PROCESS_INSTANCE_CREATED')
const productionBoardLoading = ref(false)
const productionBoardError = ref('')
let notificationReconnectTimer: number | null = null

const productionBoardStatusOptions: ProductionBoardStatusOption[] = [
  { label: '全部生产状态', value: 'ALL' },
  { label: '待生产审核', value: 'PENDING_PRODUCTION_REVIEW' },
  { label: '已生成工序实例', value: 'PROCESS_INSTANCE_CREATED' },
  { label: '生产中', value: 'PRODUCING' },
  { label: '已发货', value: 'SHIPPED' },
  { label: '已完成', value: 'COMPLETED' }
]

const isLoggedIn = computed(() => Boolean(token.value))
const visibleMenus = computed(() => currentUser.value?.menus.filter((menu) => menu.routePath) ?? [])
const notificationMenu = computed<AuthMenu | null>(() => isLoggedIn.value
  ? {
      menuCode: 'notifications',
      menuName: '通知中心',
      menuType: 'MENU',
      routePath: '/notifications',
      componentPath: 'NotificationCenterView',
      permissionCode: null,
      icon: 'bell',
      sortOrder: 999
    }
  : null)
const navigationMenus = computed(() => {
  const menus = [...visibleMenus.value]
  if (notificationMenu.value) {
    menus.push(notificationMenu.value)
  }
  return menus
})
const activeMenu = computed(() => navigationMenus.value.find((menu) => menu.routePath === activeRoute.value) ?? navigationMenus.value[0] ?? null)
const visiblePermissions = computed(() => currentUser.value?.permissions.slice().sort() ?? [])
const hasUnreadNotifications = computed(() => unreadCount.value > 0)
const isDoctorOrderRoute = computed(() => activeRoute.value === '/doctor/orders')
const isInternalOrdersRoute = computed(() => activeRoute.value === '/orders/internal')
const isProductionReviewRoute = computed(() => activeRoute.value === '/workflow/review')
const isProcessInstanceRoute = computed(() => activeRoute.value === '/workflow/process-instance')
const isWorkflowAssignRoute = computed(() => activeRoute.value === '/workflow/assign')
const isWorkerTasksRoute = computed(() => activeRoute.value === '/tasks/mine')
const isCheckRecordsRoute = computed(() => activeRoute.value === '/checks')
const isReworkFinalRoute = computed(() => activeRoute.value === '/rework-final')
const isWorklogsRoute = computed(() => activeRoute.value === '/worklogs/self')
const isPerformanceRoute = computed(() => activeRoute.value === '/performance')
const isProductionBoardRoute = computed(() => activeRoute.value === '/production/board')
const selectedOrderId = computed(() => selectedDoctorOrder.value?.order_id ?? doctorOrderWorkspace.value?.order.order_id ?? null)
const selectedProductionReviewChain = computed(() => workflowChains.value.find((chain) => chain.chain_id === productionReviewChainId.value) ?? null)
const selectedProcessNode = computed(() => selectedProcessInstance.value?.nodes.find((node) => node.node_instance_id === selectedProcessNodeId.value) ?? null)
const productionBoardNodeStats = computed(() => {
  const stats = {
    READY: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    SKIPPED: 0,
    PENDING: 0
  }
  for (const node of productionBoardInstance.value?.nodes ?? []) {
    if (node.node_status in stats) {
      stats[node.node_status as keyof typeof stats] += 1
    }
  }
  return stats
})

async function checkHealth() {
  health.value = '检查中...'
  const response = await fetch('/api/bootstrap/health')
  if (!response.ok) {
    health.value = `后端异常：${response.status}`
    return
  }
  const payload = await response.json() as { status: string }
  health.value = payload.status
}

async function login() {
  loading.value = true
  loginError.value = ''
  notificationError.value = ''
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    if (!response.ok) {
      throw new Error(`登录失败：${response.status}`)
    }
    const payload = await response.json() as LoginResponse
    token.value = payload.accessToken
    currentUser.value = payload
    activeRoute.value = payload.menus.find((menu) => menu.routePath)?.routePath ?? '/dashboard'
    await loadNotifications()
    if (activeRoute.value === '/doctor/orders') {
      await loadDoctorOrderForm()
      await loadDoctorOrders()
    } else if (activeRoute.value === '/orders/internal') {
      await loadInternalOrders()
    } else if (activeRoute.value === '/workflow/review') {
      await loadProductionReviewPage()
    } else if (activeRoute.value === '/workflow/process-instance' || activeRoute.value === '/workflow/assign') {
      await loadProcessInstancePage()
    } else if (activeRoute.value === '/tasks/mine') {
      await loadWorkerTasks()
    } else if (activeRoute.value === '/checks') {
      await loadCheckTasks()
    } else if (activeRoute.value === '/rework-final') {
      await loadReworkFinalPage()
    } else if (activeRoute.value === '/worklogs/self') {
      await loadWorklogTasks()
    } else if (activeRoute.value === '/performance') {
      await loadPerformanceStats()
    } else if (activeRoute.value === '/production/board') {
      await loadProductionBoardOrders()
    }
    connectNotificationSocket()
  } catch (error) {
    loginError.value = error instanceof Error ? error.message : '登录失败'
  } finally {
    loading.value = false
  }
}

function selectMenu(menu: AuthMenu) {
  if (menu.routePath) {
    activeRoute.value = menu.routePath
    if (menu.routePath === '/notifications') {
      void loadNotifications()
    } else if (menu.routePath === '/doctor/orders') {
      void loadDoctorOrderForm()
      void loadDoctorOrders()
    } else if (menu.routePath === '/orders/internal') {
      void loadInternalOrders()
    } else if (menu.routePath === '/workflow/review') {
      void loadProductionReviewPage()
    } else if (menu.routePath === '/workflow/process-instance' || menu.routePath === '/workflow/assign') {
      void loadProcessInstancePage()
    } else if (menu.routePath === '/tasks/mine') {
      void loadWorkerTasks()
    } else if (menu.routePath === '/checks') {
      void loadCheckTasks()
    } else if (menu.routePath === '/rework-final') {
      void loadReworkFinalPage()
    } else if (menu.routePath === '/worklogs/self') {
      void loadWorklogTasks()
    } else if (menu.routePath === '/performance') {
      void loadPerformanceStats()
    } else if (menu.routePath === '/production/board') {
      void loadProductionBoardOrders()
    }
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`,
      ...(options.headers ?? {})
    }
  })
  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`)
  }
  return await response.json() as ApiResponse<T>
}

async function loadNotifications() {
  if (!token.value) {
    return
  }
  notificationsLoading.value = true
  notificationError.value = ''
  try {
    const [listPayload, countPayload] = await Promise.all([
      apiFetch<NotificationItem[]>('/notifications?limit=50'),
      apiFetch<UnreadCountResponse>('/notifications/unread-count')
    ])
    notifications.value = listPayload.data
    unreadCount.value = countPayload.data.unread_count
  } catch (error) {
    notificationError.value = error instanceof Error ? error.message : '通知加载失败'
  } finally {
    notificationsLoading.value = false
  }
}

async function markNotificationRead(notificationId: number) {
  notificationError.value = ''
  try {
    const payload = await apiFetch<NotificationItem>(`/notifications/${notificationId}/read`, { method: 'POST' })
    notifications.value = notifications.value.map((item) => item.notification_id === notificationId ? payload.data : item)
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  } catch (error) {
    notificationError.value = error instanceof Error ? error.message : '标记已读失败'
  }
}

async function markAllNotificationsRead() {
  notificationError.value = ''
  try {
    await apiFetch<{ updated_count: number }>('/notifications/read-all', { method: 'POST' })
    await loadNotifications()
  } catch (error) {
    notificationError.value = error instanceof Error ? error.message : '全部已读失败'
  }
}

async function loadDoctorOrders() {
  if (!token.value) {
    return
  }
  doctorOrdersLoading.value = true
  doctorOrderError.value = ''
  try {
    const params = new URLSearchParams({ page: '1', size: '20' })
    if (doctorOrderKeyword.value.trim()) {
      params.set('keyword', doctorOrderKeyword.value.trim())
    }
    const payload = await apiFetch<DoctorOrderListResponse>(`/orders?${params.toString()}`)
    doctorOrders.value = payload.data.items
    const selectedStillVisible = selectedDoctorOrder.value
      ? payload.data.items.some((item) => item.order_id === selectedDoctorOrder.value?.order_id)
      : false
    if (payload.data.items.length === 0) {
      selectedDoctorOrder.value = null
      doctorOrderWorkspace.value = null
      return
    }
    if (!selectedStillVisible) {
      await loadDoctorOrderWorkspace(payload.data.items[0].order_id)
    }
  } catch (error) {
    doctorOrderError.value = error instanceof Error ? error.message : '医生订单加载失败'
  } finally {
    doctorOrdersLoading.value = false
  }
}

async function loadDoctorOrderForm() {
  if (!token.value) {
    return
  }
  doctorOrderCreateError.value = ''
  try {
    const params = new URLSearchParams({ product_type: doctorOrderFormProductType.value.trim() })
    const payload = await apiFetch<FormFieldConfig[]>(`/form-configs?${params.toString()}`)
    doctorOrderFormFields.value = payload.data
    const nextData: Record<string, string | string[]> = {}
    for (const field of payload.data) {
      const existing = doctorOrderFormData.value[field.field_key]
      nextData[field.field_key] = existing ?? (field.field_type === 'multi-select' ? [] : '')
    }
    doctorOrderFormData.value = nextData
  } catch (error) {
    doctorOrderCreateError.value = error instanceof Error ? error.message : '动态表单加载失败'
  }
}

async function createDoctorOrder() {
  if (!token.value || doctorOrderFormFields.value.length === 0) {
    return
  }
  doctorOrderCreateLoading.value = true
  doctorOrderCreateError.value = ''
  doctorOrderCreateResult.value = null
  try {
    const formData: Record<string, string | string[]> = {}
    for (const field of doctorOrderFormFields.value) {
      formData[field.field_key] = doctorOrderFormData.value[field.field_key] ?? ''
    }
    const payload = await apiFetch<CreateOrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        product_type: doctorOrderFormProductType.value.trim(),
        form_data: formData,
        file_ids: parseDoctorOrderFileIds()
      })
    })
    doctorOrderCreateResult.value = payload.data
    doctorOrderFileIds.value = ''
    doctorOrderKeyword.value = payload.data.order_no
    await loadDoctorOrders()
    await loadDoctorOrderWorkspace(payload.data.order_id)
  } catch (error) {
    doctorOrderCreateError.value = error instanceof Error ? error.message : '医生下单失败'
  } finally {
    doctorOrderCreateLoading.value = false
  }
}

function selectDoctorUploadFiles(event: Event) {
  const input = event.target as HTMLInputElement
  doctorUploadFiles.value = Array.from(input.files ?? [])
  doctorUploadServerResumeCandidates.value = []
  doctorUploadServerResumeOrderId.value = null
  doctorUploadProgress.value = doctorUploadFiles.value.length > 0
    ? `已选择 ${doctorUploadFiles.value.length} 个附件`
    : ''
}

function doctorUploadSessionKey(file: File) {
  return `doctor-order-upload:${selectedOrderId.value ?? 'none'}:${file.name}:${file.size}:${file.lastModified}`
}

function loadDoctorUploadSession(file: File) {
  const key = doctorUploadSessionKey(file)
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      return null
    }
    const session = JSON.parse(raw) as DoctorUploadResumeSession
    doctorUploadResumeSessions.value = {
      ...doctorUploadResumeSessions.value,
      [key]: session
    }
    return session
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

function saveDoctorUploadSession(file: File, session: DoctorUploadResumeSession) {
  const key = doctorUploadSessionKey(file)
  const nextSession = {
    ...session,
    updated_at: new Date().toISOString()
  }
  doctorUploadResumeSessions.value = {
    ...doctorUploadResumeSessions.value,
    [key]: nextSession
  }
  localStorage.setItem(key, JSON.stringify(nextSession))
}

function removeDoctorUploadSession(file: File) {
  const key = doctorUploadSessionKey(file)
  const remaining = { ...doctorUploadResumeSessions.value }
  delete remaining[key]
  doctorUploadResumeSessions.value = remaining
  localStorage.removeItem(key)
}

async function loadDoctorPendingMultipartUploads(orderId: number) {
  if (doctorUploadServerResumeOrderId.value === orderId) {
    return doctorUploadServerResumeCandidates.value
  }
  const params = new URLSearchParams({ order_id: String(orderId) })
  const payload = await apiFetch<MultipartPendingUploadsResponse>(`/files/multipart/pending?${params.toString()}`)
  doctorUploadServerResumeCandidates.value = payload.data.items
  doctorUploadServerResumeOrderId.value = orderId
  return payload.data.items
}

async function findDoctorServerResumeCandidate(file: File) {
  if (!selectedOrderId.value) {
    return null
  }
  const candidates = await loadDoctorPendingMultipartUploads(selectedOrderId.value)
  return candidates.find((candidate) => {
    const contentTypeMatches = !file.type || !candidate.content_type || candidate.content_type === file.type
    return candidate.order_id === selectedOrderId.value
      && candidate.original_filename === file.name
      && candidate.file_size === file.size
      && contentTypeMatches
  }) ?? null
}

async function loadDoctorMultipartStatus(file: File) {
  let session = loadDoctorUploadSession(file)
  if (!session) {
    const candidate = await findDoctorServerResumeCandidate(file)
    if (!candidate) {
      return null
    }
    session = {
      file_id: candidate.file_id,
      upload_id: candidate.upload_id,
      part_size: candidate.part_size,
      part_count: candidate.part_count,
      completed_parts: [],
      updated_at: new Date().toISOString()
    }
    saveDoctorUploadSession(file, session)
  }
  if (!session) {
    return null
  }
  try {
    const params = new URLSearchParams({ upload_id: session.upload_id })
    const payload = await apiFetch<MultipartStatusResponse>(`/files/${session.file_id}/multipart/status?${params.toString()}`)
    if (payload.data.upload_status !== 'PENDING') {
      removeDoctorUploadSession(file)
      return null
    }
    return payload.data
  } catch {
    removeDoctorUploadSession(file)
    return null
  }
}

async function uploadDoctorOrderFiles() {
  if (!selectedOrderId.value) {
    doctorOrderCreateError.value = '请先选择或创建订单后再上传附件'
    return
  }
  if (doctorUploadFiles.value.length === 0) {
    doctorOrderCreateError.value = '请先选择附件'
    return
  }
  doctorUploadLoading.value = true
  doctorOrderCreateError.value = ''
  doctorUploadCompletedFileIds.value = []
  const uppy = new Uppy({ autoProceed: false })
  try {
    for (const file of doctorUploadFiles.value) {
      uppy.addFile({
        name: file.name,
        type: file.type || 'application/octet-stream',
        data: file
      })
    }
    const files = uppy.getFiles()
      .map((file) => file.data)
      .filter((file): file is File => file instanceof File)
    for (const [fileIndex, file] of files.entries()) {
      doctorUploadProgress.value = `上传 ${fileIndex + 1}/${files.length}：${file.name}`
      const resumedStatus = await loadDoctorMultipartStatus(file)
      let upload: MultipartInitiateResponse
      const completedParts = new Map<number, string>()
      if (resumedStatus) {
        upload = {
          file_id: resumedStatus.file_id,
          upload_id: resumedStatus.upload_id,
          part_size: resumedStatus.part_size,
          part_count: resumedStatus.part_count,
          expires_in_seconds: 0
        }
        for (const part of resumedStatus.completed_parts) {
          completedParts.set(part.part_number, part.etag)
        }
        doctorUploadProgress.value = `恢复上传 ${file.name}：已完成 ${completedParts.size}/${upload.part_count} 个分片`
      } else {
        const initiatePayload = await apiFetch<MultipartInitiateResponse>('/files/multipart/initiate', {
          method: 'POST',
          body: JSON.stringify({
            order_id: selectedOrderId.value,
            source_type: 'ORDER_ATTACHMENT',
            visibility: 'DOCTOR',
            original_filename: file.name,
            content_type: file.type || 'application/octet-stream',
            file_size: file.size,
            part_size: 5242880
          })
        })
        upload = initiatePayload.data
        saveDoctorUploadSession(file, {
          file_id: upload.file_id,
          upload_id: upload.upload_id,
          part_size: upload.part_size,
          part_count: upload.part_count,
          completed_parts: [],
          updated_at: new Date().toISOString()
        })
      }
      const parts: Array<{ part_number: number, etag: string }> = []
      try {
        for (let partNumber = 1; partNumber <= upload.part_count; partNumber += 1) {
          const existingEtag = completedParts.get(partNumber)
          if (existingEtag) {
            parts.push({ part_number: partNumber, etag: existingEtag })
            continue
          }
          const offset = (partNumber - 1) * upload.part_size
          const chunk = file.slice(offset, Math.min(offset + upload.part_size, file.size))
          doctorUploadProgress.value = `上传 ${file.name} 分片 ${partNumber}/${upload.part_count}`
          const partPayload = await apiFetch<MultipartPartUrlResponse>(`/files/${upload.file_id}/multipart/part-url`, {
            method: 'POST',
            body: JSON.stringify({
              upload_id: upload.upload_id,
              part_number: partNumber
            })
          })
          const response = await fetch(partPayload.data.upload_url, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type || 'application/octet-stream'
            },
            body: chunk
          })
          if (!response.ok) {
            throw new Error(`附件分片上传失败：${response.status}`)
          }
          const etag = response.headers.get('ETag')?.replaceAll('"', '').trim()
          if (!etag) {
            throw new Error('附件分片上传未返回 ETag')
          }
          parts.push({ part_number: partNumber, etag })
          completedParts.set(partNumber, etag)
          saveDoctorUploadSession(file, {
            file_id: upload.file_id,
            upload_id: upload.upload_id,
            part_size: upload.part_size,
            part_count: upload.part_count,
            completed_parts: Array.from(completedParts.entries()).map(([part_number, etag]) => ({ part_number, etag })),
            updated_at: new Date().toISOString()
          })
        }
        await apiFetch<FileCompleteResponse>(`/files/${upload.file_id}/multipart/complete`, {
          method: 'POST',
          body: JSON.stringify({
            upload_id: upload.upload_id,
            parts
          })
        })
        doctorUploadCompletedFileIds.value.push(upload.file_id)
        removeDoctorUploadSession(file)
      } catch (error) {
        throw error
      }
    }
    const nextFileIds = [...parseDoctorOrderFileIds(), ...doctorUploadCompletedFileIds.value]
    doctorOrderFileIds.value = Array.from(new Set(nextFileIds)).join(',')
    doctorUploadProgress.value = `上传完成：${doctorUploadCompletedFileIds.value.join(',')}`
  } catch (error) {
    doctorOrderCreateError.value = error instanceof Error ? error.message : '附件上传失败'
  } finally {
    doctorUploadLoading.value = false
  }
}

async function abortDoctorUploadSessions() {
  if (doctorUploadFiles.value.length === 0) {
    doctorOrderCreateError.value = '请先选择要取消的附件'
    return
  }
  doctorUploadLoading.value = true
  doctorOrderCreateError.value = ''
  try {
    for (const file of doctorUploadFiles.value) {
      const session = loadDoctorUploadSession(file)
      if (!session) {
        continue
      }
      await apiFetch<FileCompleteResponse>(`/files/${session.file_id}/multipart/abort`, {
        method: 'POST',
        body: JSON.stringify({ upload_id: session.upload_id })
      })
      removeDoctorUploadSession(file)
    }
    doctorUploadProgress.value = '已取消所选附件的未完成上传'
  } catch (error) {
    doctorOrderCreateError.value = error instanceof Error ? error.message : '取消上传失败'
  } finally {
    doctorUploadLoading.value = false
  }
}

async function loadDoctorOrderWorkspace(orderId: number) {
  doctorOrdersLoading.value = true
  doctorOrderError.value = ''
  doctorAiAnswer.value = ''
  try {
    const [orderPayload, messagesPayload, draftsPayload, billPayload, logisticsPayload] = await Promise.all([
      apiFetch<DoctorOrderItem>(`/orders/${orderId}`),
      apiFetch<MessageItem[]>(`/orders/${orderId}/messages`),
      apiFetch<DesignDraftItem[]>(`/orders/${orderId}/design-drafts`),
      apiFetch<BillInfo>(`/orders/${orderId}/bill`),
      apiFetch<LogisticsInfo>(`/orders/${orderId}/logistics`)
    ])
    selectedDoctorOrder.value = orderPayload.data
    doctorOrderWorkspace.value = {
      order: orderPayload.data,
      messages: messagesPayload.data,
      drafts: draftsPayload.data,
      bill: billPayload.data,
      logistics: logisticsPayload.data
    }
  } catch (error) {
    doctorOrderError.value = error instanceof Error ? error.message : '订单详情加载失败'
  } finally {
    doctorOrdersLoading.value = false
  }
}

async function sendDoctorMessage() {
  if (!selectedOrderId.value || !doctorMessageDraft.value.trim()) {
    return
  }
  doctorActionLoading.value = true
  doctorOrderError.value = ''
  try {
    await apiFetch<MessageItem>(`/orders/${selectedOrderId.value}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content: doctorMessageDraft.value.trim(),
        visible_to: 'CS_ONLY',
        attachment_file_ids: []
      })
    })
    doctorMessageDraft.value = ''
    await loadDoctorOrderWorkspace(selectedOrderId.value)
  } catch (error) {
    doctorOrderError.value = error instanceof Error ? error.message : '消息发送失败'
  } finally {
    doctorActionLoading.value = false
  }
}

async function handleDoctorDraft(draft: DesignDraftItem, action: 'CONFIRM' | 'REJECT') {
  if (!selectedOrderId.value) {
    return
  }
  doctorActionLoading.value = true
  doctorOrderError.value = ''
  try {
    await apiFetch<DesignDraftItem>(`/orders/${selectedOrderId.value}/design-drafts/${draft.draft_id}/doctor-confirm`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        doctor_reject_reason: action === 'REJECT' ? '医生端页面驳回：请调整后重传' : null
      })
    })
    await loadDoctorOrderWorkspace(selectedOrderId.value)
  } catch (error) {
    doctorOrderError.value = error instanceof Error ? error.message : '设计稿处理失败'
  } finally {
    doctorActionLoading.value = false
  }
}

async function confirmDoctorReceipt() {
  if (!selectedOrderId.value) {
    return
  }
  doctorActionLoading.value = true
  doctorOrderError.value = ''
  try {
    await apiFetch<{ orderId: number, externalStatus: string }>(`/orders/${selectedOrderId.value}/confirm-receipt`, {
      method: 'POST'
    })
    await loadDoctorOrderWorkspace(selectedOrderId.value)
    await loadDoctorOrders()
  } catch (error) {
    doctorOrderError.value = error instanceof Error ? error.message : '确认收货失败'
  } finally {
    doctorActionLoading.value = false
  }
}

async function askDoctorAi() {
  if (!selectedOrderId.value || !doctorAiQuestion.value.trim()) {
    return
  }
  doctorActionLoading.value = true
  doctorOrderError.value = ''
  try {
    const payload = await apiFetch<DoctorAiAnswer>('/ai/order-query', {
      method: 'POST',
      body: JSON.stringify({
        order_id: selectedOrderId.value,
        question: doctorAiQuestion.value.trim()
      })
    })
    doctorAiAnswer.value = payload.data.answer
  } catch (error) {
    doctorOrderError.value = error instanceof Error ? error.message : '医生 AI 查询失败'
  } finally {
    doctorActionLoading.value = false
  }
}

async function loadInternalOrders() {
  if (!token.value) {
    return
  }
  internalOrdersLoading.value = true
  internalOrderError.value = ''
  try {
    const params = new URLSearchParams({
      page: '1',
      size: '20',
      internal_status: 'PENDING_CS_REVIEW'
    })
    if (internalOrderKeyword.value.trim()) {
      params.set('keyword', internalOrderKeyword.value.trim())
    }
    const payload = await apiFetch<InternalOrderListResponse>(`/orders?${params.toString()}`)
    internalOrders.value = payload.data.items
    const selectedStillVisible = selectedInternalOrder.value
      ? payload.data.items.some((item) => item.order_id === selectedInternalOrder.value?.order_id)
      : false
    if (payload.data.items.length === 0) {
      selectedInternalOrder.value = null
      return
    }
    if (!selectedStillVisible) {
      selectInternalOrder(payload.data.items[0])
    }
  } catch (error) {
    internalOrderError.value = error instanceof Error ? error.message : '内部订单加载失败'
  } finally {
    internalOrdersLoading.value = false
  }
}

function selectInternalOrder(order: InternalOrderItem) {
  selectedInternalOrder.value = order
  csProductionNote.value = order.production_note ?? ''
  csRejectReason.value = ''
}

async function reviewInternalOrder(action: 'APPROVE' | 'REJECT') {
  if (!selectedInternalOrder.value) {
    return
  }
  csReviewActionLoading.value = true
  internalOrderError.value = ''
  try {
    const payload = await apiFetch<InternalOrderItem>(`/orders/${selectedInternalOrder.value.order_id}/review`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        production_note: action === 'APPROVE' ? csProductionNote.value.trim() : null,
        reject_reason: action === 'REJECT' ? csRejectReason.value.trim() : null
      })
    })
    selectedInternalOrder.value = payload.data
    csProductionNote.value = payload.data.production_note ?? ''
    csRejectReason.value = ''
    await loadInternalOrders()
    await loadNotifications()
  } catch (error) {
    internalOrderError.value = error instanceof Error ? error.message : '客服审核失败'
  } finally {
    csReviewActionLoading.value = false
  }
}

async function loadProductionReviewPage() {
  await Promise.all([
    loadWorkflowChains(),
    loadProductionReviewOrders()
  ])
}

async function loadWorkflowChains() {
  if (!token.value) {
    return
  }
  try {
    const payload = await apiFetch<WorkflowChainSummary[]>('/workflow-chains')
    workflowChains.value = payload.data.filter((chain) => chain.status === 1)
    if (!productionReviewChainId.value && workflowChains.value.length > 0) {
      productionReviewChainId.value = workflowChains.value[0].chain_id
    }
  } catch (error) {
    productionReviewError.value = error instanceof Error ? error.message : '工序链加载失败'
  }
}

async function loadProductionReviewOrders() {
  if (!token.value) {
    return
  }
  productionReviewLoading.value = true
  productionReviewError.value = ''
  try {
    const params = new URLSearchParams({
      page: '1',
      size: '20',
      internal_status: 'PENDING_PRODUCTION_REVIEW'
    })
    if (productionReviewKeyword.value.trim()) {
      params.set('keyword', productionReviewKeyword.value.trim())
    }
    const payload = await apiFetch<InternalOrderListResponse>(`/orders?${params.toString()}`)
    productionReviewOrders.value = payload.data.items
    const selectedStillVisible = selectedProductionReviewOrder.value
      ? payload.data.items.some((item) => item.order_id === selectedProductionReviewOrder.value?.order_id)
      : false
    if (payload.data.items.length === 0) {
      selectedProductionReviewOrder.value = null
      return
    }
    if (!selectedStillVisible) {
      selectProductionReviewOrder(payload.data.items[0])
    }
  } catch (error) {
    productionReviewError.value = error instanceof Error ? error.message : '生产审核订单加载失败'
  } finally {
    productionReviewLoading.value = false
  }
}

function selectProductionReviewOrder(order: InternalOrderItem) {
  selectedProductionReviewOrder.value = order
  productionReviewRejectReason.value = ''
  productionReviewResult.value = null
}

function parseProductionBranchParams() {
  const rawValue = productionReviewBranchParams.value.trim()
  if (!rawValue) {
    return {}
  }
  const parsed = JSON.parse(rawValue) as unknown
  if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('branch_params 必须是 JSON 对象')
  }
  return parsed as Record<string, unknown>
}

async function reviewProductionOrder(action: 'APPROVE' | 'REJECT') {
  if (!selectedProductionReviewOrder.value) {
    return
  }
  productionReviewActionLoading.value = true
  productionReviewError.value = ''
  productionReviewResult.value = null
  try {
    const branchParams = action === 'APPROVE' ? parseProductionBranchParams() : null
    const payload = await apiFetch<ProductionReviewResponse>(
      `/orders/${selectedProductionReviewOrder.value.order_id}/production-review`,
      {
        method: 'POST',
        body: JSON.stringify({
          action,
          chain_id: action === 'APPROVE' ? productionReviewChainId.value : null,
          intake_branch: action === 'APPROVE' ? productionReviewIntakeBranch.value : null,
          branch_params: branchParams,
          reject_reason: action === 'REJECT' ? productionReviewRejectReason.value.trim() : null
        })
      }
    )
    productionReviewResult.value = payload.data
    productionReviewRejectReason.value = ''
    await loadProductionReviewOrders()
    await loadNotifications()
  } catch (error) {
    productionReviewError.value = error instanceof Error ? error.message : '生产审核失败'
  } finally {
    productionReviewActionLoading.value = false
  }
}

async function loadProcessInstancePage() {
  await loadProcessInstanceOrders()
}

async function loadProcessInstanceOrders() {
  if (!token.value) {
    return
  }
  processInstanceLoading.value = true
  processInstanceError.value = ''
  processAssignmentResult.value = ''
  try {
    const params = new URLSearchParams({
      page: '1',
      size: '20',
      internal_status: 'PROCESS_INSTANCE_CREATED'
    })
    if (processInstanceKeyword.value.trim()) {
      params.set('keyword', processInstanceKeyword.value.trim())
    }
    const payload = await apiFetch<InternalOrderListResponse>(`/orders?${params.toString()}`)
    processInstanceOrders.value = payload.data.items
    const selectedStillVisible = selectedProcessInstanceOrder.value
      ? payload.data.items.some((item) => item.order_id === selectedProcessInstanceOrder.value?.order_id)
      : false
    if (payload.data.items.length === 0) {
      selectedProcessInstanceOrder.value = null
      selectedProcessInstance.value = null
      selectedProcessNodeId.value = null
      return
    }
    if (!selectedStillVisible) {
      await selectProcessInstanceOrder(payload.data.items[0])
    } else if (selectedProcessInstanceOrder.value) {
      await loadProcessInstanceDetail(selectedProcessInstanceOrder.value.order_id)
    }
  } catch (error) {
    processInstanceError.value = error instanceof Error ? error.message : '工序实例订单加载失败'
  } finally {
    processInstanceLoading.value = false
  }
}

async function selectProcessInstanceOrder(order: InternalOrderItem) {
  selectedProcessInstanceOrder.value = order
  selectedProcessNodeId.value = null
  processAssignmentResult.value = ''
  await loadProcessInstanceDetail(order.order_id)
}

async function loadProcessInstanceDetail(orderId: number) {
  processInstanceError.value = ''
  try {
    const payload = await apiFetch<ProcessInstanceDetail>(`/orders/${orderId}/process-instance`)
    selectedProcessInstance.value = payload.data
    if (!selectedProcessNodeId.value && payload.data.nodes.length > 0) {
      selectedProcessNodeId.value = payload.data.nodes[0].node_instance_id
    }
  } catch (error) {
    selectedProcessInstance.value = null
    selectedProcessNodeId.value = null
    processInstanceError.value = error instanceof Error ? error.message : '工序实例加载失败'
  }
}

function selectProcessNode(node: ProcessNodeItem) {
  selectedProcessNodeId.value = node.node_instance_id
  processAssignmentResult.value = ''
}

async function assignSelectedProcessNode(mode: 'ASSIGN' | 'REASSIGN') {
  if (!selectedProcessInstanceOrder.value || !selectedProcessNode.value || !processAssignmentUserId.value.trim()) {
    return
  }
  processAssignmentLoading.value = true
  processInstanceError.value = ''
  processAssignmentResult.value = ''
  try {
    const targetUserId = Number(processAssignmentUserId.value.trim())
    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      throw new Error('员工 user_id 必须是正整数')
    }
    const path = mode === 'REASSIGN'
      ? `/orders/${selectedProcessInstanceOrder.value.order_id}/process-instance/nodes/${selectedProcessNode.value.node_instance_id}/reassign`
      : `/orders/${selectedProcessInstanceOrder.value.order_id}/process-instance/assign`
    const body = mode === 'REASSIGN'
      ? { new_user_id: targetUserId, reason: '前端派工转派第一增量' }
      : { assignments: [{ node_instance_id: selectedProcessNode.value.node_instance_id, user_id: targetUserId }] }
    const payload = await apiFetch<ProcessInstanceDetail>(path, {
      method: 'POST',
      body: JSON.stringify(body)
    })
    selectedProcessInstance.value = payload.data
    processAssignmentResult.value = `${selectedProcessNode.value.process_name} 已${mode === 'REASSIGN' ? '转派' : '绑定'}给 ${targetUserId}`
    await loadWorkerTasks()
  } catch (error) {
    processInstanceError.value = error instanceof Error ? error.message : '派工失败'
  } finally {
    processAssignmentLoading.value = false
  }
}

async function loadWorkerTasks() {
  if (!token.value) {
    return
  }
  workerTasksLoading.value = true
  workerTaskError.value = ''
  try {
    const params = new URLSearchParams()
    if (workerTaskStatus.value) {
      params.set('status', workerTaskStatus.value)
    }
    const query = params.toString()
    const payload = await apiFetch<WorkerTaskItem[]>(query ? `/tasks/mine?${query}` : '/tasks/mine')
    workerTasks.value = payload.data
  } catch (error) {
    workerTaskError.value = error instanceof Error ? error.message : '我的任务加载失败'
  } finally {
    workerTasksLoading.value = false
  }
}

async function operateWorkerTask(task: WorkerTaskItem, action: 'START' | 'COMPLETE') {
  workerTaskActionLoading.value = true
  workerTaskError.value = ''
  try {
    const suffix = action === 'START' ? 'start' : 'complete'
    await apiFetch(`/process-instance/nodes/${task.node_instance_id}/${suffix}`, { method: 'POST' })
    await loadWorkerTasks()
  } catch (error) {
    workerTaskError.value = error instanceof Error ? error.message : '任务操作失败'
  } finally {
    workerTaskActionLoading.value = false
  }
}

async function loadCheckTasks() {
  if (!token.value) {
    return
  }
  checkTasksLoading.value = true
  checkError.value = ''
  checkResult.value = null
  try {
    const params = new URLSearchParams()
    if (checkTaskStatus.value) {
      params.set('status', checkTaskStatus.value)
    }
    const query = params.toString()
    const payload = await apiFetch<WorkerTaskItem[]>(query ? `/tasks/mine?${query}` : '/tasks/mine')
    checkTasks.value = payload.data
    const selectedStillVisible = selectedCheckTask.value
      ? payload.data.some((task) => task.node_instance_id === selectedCheckTask.value?.node_instance_id)
      : false
    if (payload.data.length === 0) {
      selectedCheckTask.value = null
      checkRecords.value = []
      return
    }
    if (!selectedStillVisible) {
      await selectCheckTask(payload.data[0])
    } else if (selectedCheckTask.value) {
      await loadCheckRecords(selectedCheckTask.value.node_instance_id)
    }
  } catch (error) {
    checkError.value = error instanceof Error ? error.message : '入检出检任务加载失败'
  } finally {
    checkTasksLoading.value = false
  }
}

async function selectCheckTask(task: WorkerTaskItem) {
  selectedCheckTask.value = task
  checkType.value = task.node_status === 'COMPLETED' ? 2 : 1
  checkPass.value = true
  checkRemark.value = ''
  checkReworkToNodeId.value = ''
  checkResult.value = null
  await loadCheckRecords(task.node_instance_id)
}

async function loadCheckRecords(nodeInstanceId: number) {
  checkError.value = ''
  try {
    const payload = await apiFetch<CheckRecordResponse[]>(`/check-records/${nodeInstanceId}`)
    checkRecords.value = payload.data
  } catch (error) {
    checkRecords.value = []
    checkError.value = error instanceof Error ? error.message : '检查记录加载失败'
  }
}

async function submitCheckRecord() {
  if (!selectedCheckTask.value) {
    return
  }
  checkActionLoading.value = true
  checkError.value = ''
  checkResult.value = null
  try {
    const reworkToNodeId = Number(checkReworkToNodeId.value.trim())
    const payload = await apiFetch<CheckRecordResponse>('/check-records', {
      method: 'POST',
      body: JSON.stringify({
        node_instance_id: selectedCheckTask.value.node_instance_id,
        check_type: checkType.value,
        is_pass: checkPass.value,
        remark: checkRemark.value.trim() || null,
        rework_to_node_id: checkType.value === 2 && !checkPass.value && Number.isInteger(reworkToNodeId) && reworkToNodeId > 0
          ? reworkToNodeId
          : null
      })
    })
    checkResult.value = payload.data
    checkRemark.value = ''
    checkReworkToNodeId.value = ''
    await loadCheckRecords(selectedCheckTask.value.node_instance_id)
    await loadCheckTasks()
  } catch (error) {
    checkError.value = error instanceof Error ? error.message : '提交入检/出检失败'
  } finally {
    checkActionLoading.value = false
  }
}

async function loadReworkFinalPage() {
  await Promise.all([
    loadReworkRecords(),
    loadFinalInspectionTasks()
  ])
}

async function loadReworkRecords() {
  if (!token.value) {
    return
  }
  reworkRecordsLoading.value = true
  reworkError.value = ''
  try {
    const params = new URLSearchParams()
    if (reworkStatus.value) {
      params.set('status', reworkStatus.value)
    }
    const query = params.toString()
    const payload = await apiFetch<ReworkRecordResponse[]>(query ? `/reworks?${query}` : '/reworks')
    reworkRecords.value = payload.data
    const selectedStillVisible = selectedRework.value
      ? payload.data.some((record) => record.rework_id === selectedRework.value?.rework_id)
      : false
    selectedRework.value = selectedStillVisible ? selectedRework.value : payload.data[0] ?? null
  } catch (error) {
    reworkRecords.value = []
    selectedRework.value = null
    reworkError.value = error instanceof Error ? error.message : '返工记录加载失败'
  } finally {
    reworkRecordsLoading.value = false
  }
}

async function loadFinalInspectionTasks() {
  if (!token.value) {
    return
  }
  finalInspectionLoading.value = true
  reworkError.value = ''
  finalInspectionResult.value = null
  try {
    const payload = await apiFetch<WorkerTaskItem[]>('/tasks/mine?status=COMPLETED')
    finalInspectionTasks.value = payload.data
    const selectedStillVisible = selectedFinalInspectionTask.value
      ? payload.data.some((task) => task.node_instance_id === selectedFinalInspectionTask.value?.node_instance_id)
      : false
    if (payload.data.length === 0) {
      selectedFinalInspectionTask.value = null
      finalInspectionRecords.value = []
      return
    }
    if (!selectedStillVisible) {
      await selectFinalInspectionTask(payload.data[0])
    } else if (selectedFinalInspectionTask.value) {
      await loadFinalInspectionRecords(selectedFinalInspectionTask.value.node_instance_id)
    }
  } catch (error) {
    finalInspectionTasks.value = []
    selectedFinalInspectionTask.value = null
    finalInspectionRecords.value = []
    reworkError.value = error instanceof Error ? error.message : '终检任务加载失败'
  } finally {
    finalInspectionLoading.value = false
  }
}

async function selectFinalInspectionTask(task: WorkerTaskItem) {
  selectedFinalInspectionTask.value = task
  finalInspectionRemark.value = ''
  finalInspectionResult.value = null
  await loadFinalInspectionRecords(task.node_instance_id)
}

function selectFinalInspectionTaskById(nodeId: number) {
  const task = finalInspectionTasks.value.find((item) => item.node_instance_id === nodeId)
  if (task) {
    void selectFinalInspectionTask(task)
  }
}

async function loadFinalInspectionRecords(nodeInstanceId: number) {
  reworkError.value = ''
  try {
    const payload = await apiFetch<CheckRecordResponse[]>(`/check-records/${nodeInstanceId}`)
    finalInspectionRecords.value = payload.data
  } catch (error) {
    finalInspectionRecords.value = []
    reworkError.value = error instanceof Error ? error.message : '终检检查记录加载失败'
  }
}

async function submitFinalInspectionCheck() {
  if (!selectedFinalInspectionTask.value) {
    return
  }
  finalInspectionLoading.value = true
  reworkError.value = ''
  finalInspectionResult.value = null
  try {
    const payload = await apiFetch<CheckRecordResponse>('/check-records', {
      method: 'POST',
      body: JSON.stringify({
        node_instance_id: selectedFinalInspectionTask.value.node_instance_id,
        check_type: 2,
        is_pass: true,
        remark: finalInspectionRemark.value.trim() || '终检通过',
        rework_to_node_id: null
      })
    })
    finalInspectionResult.value = payload.data
    finalInspectionRemark.value = ''
    await loadFinalInspectionRecords(selectedFinalInspectionTask.value.node_instance_id)
    await loadFinalInspectionTasks()
    await loadReworkRecords()
  } catch (error) {
    reworkError.value = error instanceof Error ? error.message : '提交终检出检失败'
  } finally {
    finalInspectionLoading.value = false
  }
}

async function loadWorklogTasks() {
  if (!token.value) {
    return
  }
  worklogTasksLoading.value = true
  worklogError.value = ''
  try {
    const params = new URLSearchParams()
    if (worklogTaskStatus.value) {
      params.set('status', worklogTaskStatus.value)
    }
    const query = params.toString()
    const payload = await apiFetch<WorkerTaskItem[]>(query ? `/tasks/mine?${query}` : '/tasks/mine')
    worklogTasks.value = payload.data
    const selectedStillVisible = selectedWorklogTask.value
      ? payload.data.some((task) => task.node_instance_id === selectedWorklogTask.value?.node_instance_id)
      : false
    if (payload.data.length === 0) {
      selectedWorklogTask.value = null
      activeWorkLog.value = null
      return
    }
    if (!selectedStillVisible) {
      selectWorklogTask(payload.data[0])
    }
  } catch (error) {
    worklogError.value = error instanceof Error ? error.message : '工时任务加载失败'
  } finally {
    worklogTasksLoading.value = false
  }
}

function selectWorklogTask(task: WorkerTaskItem) {
  selectedWorklogTask.value = task
  if (activeWorkLog.value?.node_instance_id !== task.node_instance_id) {
    activeWorkLog.value = null
  }
}

async function startSelectedWorkLog() {
  if (!selectedWorklogTask.value) {
    return
  }
  worklogActionLoading.value = true
  worklogError.value = ''
  try {
    const payload = await apiFetch<WorkLogResponse>('/work-logs/start', {
      method: 'POST',
      body: JSON.stringify({
        node_instance_id: selectedWorklogTask.value.node_instance_id
      })
    })
    activeWorkLog.value = payload.data
  } catch (error) {
    worklogError.value = error instanceof Error ? error.message : '开始工时失败'
  } finally {
    worklogActionLoading.value = false
  }
}

async function operateWorkLog(action: 'pause' | 'resume' | 'finish') {
  if (!activeWorkLog.value) {
    return
  }
  worklogActionLoading.value = true
  worklogError.value = ''
  try {
    const payload = await apiFetch<WorkLogResponse>(`/work-logs/${activeWorkLog.value.work_log_id}/${action}`, {
      method: 'POST'
    })
    activeWorkLog.value = payload.data
    if (action === 'finish') {
      await loadWorklogTasks()
    }
  } catch (error) {
    worklogError.value = error instanceof Error ? error.message : '工时操作失败'
  } finally {
    worklogActionLoading.value = false
  }
}

async function loadPerformanceStats() {
  if (!token.value) {
    return
  }
  performanceLoading.value = true
  performanceError.value = ''
  try {
    const params = new URLSearchParams()
    if (performanceUserId.value.trim()) {
      const userId = Number(performanceUserId.value.trim())
      if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error('user_id 必须是正整数')
      }
      params.set('user_id', String(userId))
    }
    const query = params.toString()
    const payload = await apiFetch<PerformanceStatsResponse>(query ? `/performance?${query}` : '/performance')
    performanceStats.value = payload.data
  } catch (error) {
    performanceError.value = error instanceof Error ? error.message : '绩效统计加载失败'
  } finally {
    performanceLoading.value = false
  }
}

async function loadProductionBoardOrders() {
  if (!token.value) {
    return
  }
  productionBoardLoading.value = true
  productionBoardError.value = ''
  try {
    const params = new URLSearchParams({
      page: '1',
      size: '50'
    })
    if (productionBoardStatus.value !== 'ALL') {
      params.set('internal_status', productionBoardStatus.value)
    }
    if (productionBoardKeyword.value.trim()) {
      params.set('keyword', productionBoardKeyword.value.trim())
    }
    const payload = await apiFetch<InternalOrderListResponse>(`/orders?${params.toString()}`)
    productionBoardOrders.value = payload.data.items
    const selectedStillVisible = selectedProductionBoardOrder.value
      ? payload.data.items.some((item) => item.order_id === selectedProductionBoardOrder.value?.order_id)
      : false
    if (payload.data.items.length === 0) {
      selectedProductionBoardOrder.value = null
      productionBoardInstance.value = null
      return
    }
    if (!selectedStillVisible) {
      await selectProductionBoardOrder(payload.data.items[0])
    } else if (selectedProductionBoardOrder.value) {
      await loadProductionBoardInstance(selectedProductionBoardOrder.value.order_id)
    }
  } catch (error) {
    productionBoardError.value = error instanceof Error ? error.message : '生产看板订单加载失败'
  } finally {
    productionBoardLoading.value = false
  }
}

async function selectProductionBoardOrder(order: InternalOrderItem) {
  selectedProductionBoardOrder.value = order
  await loadProductionBoardInstance(order.order_id)
}

async function loadProductionBoardInstance(orderId: number) {
  productionBoardError.value = ''
  productionBoardInstance.value = null
  if (selectedProductionBoardOrder.value?.internal_status === 'PENDING_PRODUCTION_REVIEW') {
    productionBoardError.value = '该订单仍待生产审核，尚未生成工序实例'
    return
  }
  try {
    const payload = await apiFetch<ProcessInstanceDetail>(`/orders/${orderId}/process-instance`)
    productionBoardInstance.value = payload.data
  } catch (error) {
    productionBoardError.value = error instanceof Error ? error.message : '生产看板工序实例加载失败'
  }
}

function fieldEntries(formData: Record<string, unknown> | null | undefined) {
  return Object.entries(formData ?? {}).map(([key, value]) => ({
    key,
    value: typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      ? String(value)
      : JSON.stringify(value)
  }))
}

function parseDoctorOrderFileIds() {
  return doctorOrderFileIds.value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0)
}

function connectNotificationSocket() {
  closeNotificationSocket()
  if (!token.value) {
    return
  }
  notificationSocketStatus.value = '连接中'
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const socket = new WebSocket(`${protocol}//${window.location.host}/ws/connect?token=${encodeURIComponent(token.value)}`)
  notificationSocket.value = socket

  socket.onopen = () => {
    notificationSocketStatus.value = '已连接'
  }
  socket.onmessage = (event) => {
    lastRealtimeNotification.value = parsePushPayload(event.data)
    void loadNotifications()
  }
  socket.onerror = () => {
    notificationSocketStatus.value = '已断开'
  }
  socket.onclose = () => {
    if (notificationSocket.value === socket) {
      notificationSocket.value = null
    }
    notificationSocketStatus.value = '已断开'
    scheduleNotificationReconnect()
  }
}

function scheduleNotificationReconnect() {
  if (!token.value || notificationReconnectTimer !== null) {
    return
  }
  notificationReconnectTimer = window.setTimeout(() => {
    notificationReconnectTimer = null
    connectNotificationSocket()
  }, 3000)
}

function closeNotificationSocket() {
  if (notificationReconnectTimer !== null) {
    window.clearTimeout(notificationReconnectTimer)
    notificationReconnectTimer = null
  }
  if (notificationSocket.value) {
    notificationSocket.value.onclose = null
    notificationSocket.value.close()
    notificationSocket.value = null
  }
  notificationSocketStatus.value = token.value ? '已断开' : '未连接'
}

function parsePushPayload(payload: string): PushNotificationPayload {
  try {
    return JSON.parse(payload) as PushNotificationPayload
  } catch {
    return { message: payload }
  }
}

onBeforeUnmount(() => {
  closeNotificationSocket()
})
</script>

<template>
  <main class="app-shell">
    <section class="workspace">
      <div class="status-bar">
        <span>AI 智能下单与生产协同平台</span>
        <el-tag :type="isLoggedIn ? 'success' : 'info'" round>
          {{ isLoggedIn ? `${currentUser?.username ?? '用户'} 已登录` : '骨架烟测' }}
        </el-tag>
      </div>

      <div class="content-grid" :class="{ 'with-nav': isLoggedIn }">
        <aside v-if="isLoggedIn" class="panel nav-panel">
          <div class="user-block">
            <strong>{{ currentUser?.username }}</strong>
            <span>{{ currentUser?.roles.join(', ') }} / {{ currentUser?.dataScope ?? 'NONE' }}</span>
          </div>
          <el-menu :default-active="activeRoute" class="route-menu">
            <el-menu-item
              v-for="menu in navigationMenus"
              :key="menu.menuCode"
              :index="menu.routePath ?? menu.menuCode"
              @click="selectMenu(menu)"
            >
              <el-badge
                v-if="menu.menuCode === 'notifications' && hasUnreadNotifications"
                :value="unreadCount"
                :max="99"
                class="menu-badge"
              >
                <span>{{ menu.menuName }}</span>
              </el-badge>
              <span v-else>{{ menu.menuName }}</span>
            </el-menu-item>
          </el-menu>
        </aside>

        <section class="panel health-panel">
          <h1>项目骨架</h1>
          <el-button type="primary" @click="checkHealth">检查后端</el-button>
          <p class="result">后端状态：{{ health }}</p>
        </section>

        <section v-if="!isLoggedIn" class="panel">
          <h2>登录</h2>
          <el-form label-position="top" @submit.prevent="login">
            <el-form-item label="用户名">
              <el-input v-model="username" autocomplete="username" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="password" type="password" autocomplete="current-password" show-password />
            </el-form-item>
            <el-button type="primary" :loading="loading" @click="login">登录</el-button>
          </el-form>
          <p v-if="token" class="result success">
            登录成功：{{ currentUser?.roles.join(', ') }} / {{ currentUser?.dataScope ?? 'NONE' }}
          </p>
          <p v-if="loginError" class="result error">{{ loginError }}</p>
        </section>

        <section v-else-if="isInternalOrdersRoute" class="panel route-panel internal-order-panel">
          <div class="route-heading">
            <h2>客服初审</h2>
            <el-tag round>{{ internalOrders.length }} 单</el-tag>
          </div>

          <div class="doctor-order-toolbar">
            <el-input
              v-model="internalOrderKeyword"
              placeholder="搜索订单号或患者"
              clearable
              @keyup.enter="loadInternalOrders"
            />
            <el-button type="primary" :loading="internalOrdersLoading" @click="loadInternalOrders">
              查询
            </el-button>
          </div>

          <el-alert
            v-if="internalOrderError"
            :title="internalOrderError"
            type="error"
            show-icon
            :closable="false"
          />

          <div class="internal-order-workspace">
            <aside class="doctor-order-list">
              <button
                v-for="order in internalOrders"
                :key="order.order_id"
                class="doctor-order-row"
                :class="{ active: selectedInternalOrder?.order_id === order.order_id }"
                type="button"
                @click="selectInternalOrder(order)"
              >
                <strong>{{ order.order_no }}</strong>
                <span>{{ order.clinic_name }} / {{ order.product_type }}</span>
                <small>{{ order.internal_status }} / {{ order.external_status }}</small>
              </button>
              <div v-if="internalOrders.length === 0" class="empty-state">
                暂无待初审订单
              </div>
            </aside>

            <section v-if="selectedInternalOrder" class="doctor-order-detail">
              <div class="doctor-order-summary">
                <div>
                  <span>订单号</span>
                  <strong>{{ selectedInternalOrder.order_no }}</strong>
                </div>
                <div>
                  <span>诊所</span>
                  <strong>{{ selectedInternalOrder.clinic_name }}</strong>
                </div>
                <div>
                  <span>内部状态</span>
                  <strong>{{ selectedInternalOrder.internal_status }}</strong>
                </div>
                <div>
                  <span>医生状态</span>
                  <strong>{{ selectedInternalOrder.external_status }}</strong>
                </div>
              </div>

              <el-tabs class="doctor-tabs">
                <el-tab-pane label="订单资料">
                  <div class="field-grid">
                    <div
                      v-for="field in fieldEntries(selectedInternalOrder.form_data)"
                      :key="field.key"
                      class="field-cell"
                    >
                      <span>{{ field.key }}</span>
                      <strong>{{ field.value }}</strong>
                    </div>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="审核">
                  <div class="review-form">
                    <el-form-item label="生产备注">
                      <el-input
                        v-model="csProductionNote"
                        type="textarea"
                        :rows="4"
                      />
                    </el-form-item>
                    <el-form-item label="驳回原因">
                      <el-input
                        v-model="csRejectReason"
                        type="textarea"
                        :rows="3"
                      />
                    </el-form-item>
                    <div class="inline-actions">
                      <el-button
                        type="primary"
                        :loading="csReviewActionLoading"
                        :disabled="selectedInternalOrder.internal_status !== 'PENDING_CS_REVIEW'"
                        @click="reviewInternalOrder('APPROVE')"
                      >
                        通过初审
                      </el-button>
                      <el-button
                        type="danger"
                        plain
                        :loading="csReviewActionLoading"
                        :disabled="selectedInternalOrder.internal_status !== 'PENDING_CS_REVIEW' || !csRejectReason.trim()"
                        @click="reviewInternalOrder('REJECT')"
                      >
                        驳回
                      </el-button>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </section>
          </div>
        </section>

        <section v-else-if="isProductionReviewRoute" class="panel route-panel production-review-panel">
          <div class="route-heading">
            <h2>生产审核</h2>
            <el-tag round>{{ productionReviewOrders.length }} 单</el-tag>
          </div>

          <div class="doctor-order-toolbar">
            <el-input
              v-model="productionReviewKeyword"
              placeholder="搜索订单号或患者"
              clearable
              @keyup.enter="loadProductionReviewOrders"
            />
            <el-button type="primary" :loading="productionReviewLoading" @click="loadProductionReviewOrders">
              查询
            </el-button>
          </div>

          <el-alert
            v-if="productionReviewError"
            :title="productionReviewError"
            type="error"
            show-icon
            :closable="false"
          />

          <el-alert
            v-if="productionReviewResult"
            :title="`已处理订单 ${productionReviewResult.order_id}，状态 ${productionReviewResult.internal_status}`"
            type="success"
            show-icon
            :closable="false"
          />

          <div class="production-review-workspace">
            <aside class="doctor-order-list">
              <button
                v-for="order in productionReviewOrders"
                :key="order.order_id"
                class="doctor-order-row"
                :class="{ active: selectedProductionReviewOrder?.order_id === order.order_id }"
                type="button"
                @click="selectProductionReviewOrder(order)"
              >
                <strong>{{ order.order_no }}</strong>
                <span>{{ order.clinic_name }} / {{ order.product_type }}</span>
                <small>{{ order.internal_status }} / {{ order.external_status }}</small>
              </button>
              <div v-if="productionReviewOrders.length === 0" class="empty-state">
                暂无待生产审核订单
              </div>
            </aside>

            <section v-if="selectedProductionReviewOrder" class="doctor-order-detail">
              <div class="doctor-order-summary">
                <div>
                  <span>订单号</span>
                  <strong>{{ selectedProductionReviewOrder.order_no }}</strong>
                </div>
                <div>
                  <span>诊所</span>
                  <strong>{{ selectedProductionReviewOrder.clinic_name }}</strong>
                </div>
                <div>
                  <span>内部状态</span>
                  <strong>{{ selectedProductionReviewOrder.internal_status }}</strong>
                </div>
                <div>
                  <span>医生状态</span>
                  <strong>{{ selectedProductionReviewOrder.external_status }}</strong>
                </div>
              </div>

              <el-tabs class="doctor-tabs">
                <el-tab-pane label="订单资料">
                  <div class="field-grid">
                    <div
                      v-for="field in fieldEntries(selectedProductionReviewOrder.form_data)"
                      :key="field.key"
                      class="field-cell"
                    >
                      <span>{{ field.key }}</span>
                      <strong>{{ field.value }}</strong>
                    </div>
                  </div>
                  <p class="public-message">
                    生产备注：{{ selectedProductionReviewOrder.production_note ?? '暂无' }}
                  </p>
                </el-tab-pane>

                <el-tab-pane label="审核">
                  <div class="review-form">
                    <el-form-item label="工序链">
                      <el-select v-model="productionReviewChainId" filterable>
                        <el-option
                          v-for="chain in workflowChains"
                          :key="chain.chain_id"
                          :label="`${chain.chain_name} / ${chain.intake_branch}`"
                          :value="chain.chain_id"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="入口路线">
                      <el-radio-group v-model="productionReviewIntakeBranch">
                        <el-radio-button label="SCAN">口扫</el-radio-button>
                        <el-radio-button label="IMPRESSION">印模</el-radio-button>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item label="分支参数 JSON">
                      <el-input
                        v-model="productionReviewBranchParams"
                        type="textarea"
                        :rows="4"
                      />
                    </el-form-item>
                    <el-form-item label="驳回原因">
                      <el-input
                        v-model="productionReviewRejectReason"
                        type="textarea"
                        :rows="3"
                      />
                    </el-form-item>
                    <div class="inline-actions">
                      <el-button
                        type="primary"
                        :loading="productionReviewActionLoading"
                        :disabled="!selectedProductionReviewChain || selectedProductionReviewOrder.internal_status !== 'PENDING_PRODUCTION_REVIEW'"
                        @click="reviewProductionOrder('APPROVE')"
                      >
                        通过生产审核
                      </el-button>
                      <el-button
                        type="danger"
                        plain
                        :loading="productionReviewActionLoading"
                        :disabled="selectedProductionReviewOrder.internal_status !== 'PENDING_PRODUCTION_REVIEW' || !productionReviewRejectReason.trim()"
                        @click="reviewProductionOrder('REJECT')"
                      >
                        驳回生产审核
                      </el-button>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </section>
          </div>
        </section>

        <section
          v-else-if="isProcessInstanceRoute || isWorkflowAssignRoute"
          class="panel route-panel process-instance-panel"
        >
          <div class="route-heading">
            <h2>{{ isWorkflowAssignRoute ? '派工转派' : '工序实例' }}</h2>
            <el-tag round>{{ processInstanceOrders.length }} 单</el-tag>
          </div>

          <div class="doctor-order-toolbar">
            <el-input
              v-model="processInstanceKeyword"
              placeholder="搜索订单号或患者"
              clearable
              @keyup.enter="loadProcessInstanceOrders"
            />
            <el-button type="primary" :loading="processInstanceLoading" @click="loadProcessInstanceOrders">
              查询
            </el-button>
          </div>

          <el-alert
            v-if="processInstanceError"
            :title="processInstanceError"
            type="error"
            show-icon
            :closable="false"
          />

          <el-alert
            v-if="processAssignmentResult"
            :title="processAssignmentResult"
            type="success"
            show-icon
            :closable="false"
          />

          <div class="process-instance-workspace">
            <aside class="doctor-order-list">
              <button
                v-for="order in processInstanceOrders"
                :key="order.order_id"
                class="doctor-order-row"
                :class="{ active: selectedProcessInstanceOrder?.order_id === order.order_id }"
                type="button"
                @click="selectProcessInstanceOrder(order)"
              >
                <strong>{{ order.order_no }}</strong>
                <span>{{ order.clinic_name }} / {{ order.product_type }}</span>
                <small>{{ order.internal_status }} / {{ order.external_status }}</small>
              </button>
              <div v-if="processInstanceOrders.length === 0" class="empty-state">
                暂无已实例化订单
              </div>
            </aside>

            <section v-if="selectedProcessInstance" class="doctor-order-detail">
              <div class="doctor-order-summary">
                <div>
                  <span>订单</span>
                  <strong>{{ selectedProcessInstanceOrder?.order_no ?? selectedProcessInstance.order_id }}</strong>
                </div>
                <div>
                  <span>实例</span>
                  <strong>{{ selectedProcessInstance.instance_id }}</strong>
                </div>
                <div>
                  <span>实例状态</span>
                  <strong>{{ selectedProcessInstance.instance_status }}</strong>
                </div>
                <div>
                  <span>节点 / 边</span>
                  <strong>{{ selectedProcessInstance.nodes.length }} / {{ selectedProcessInstance.edges.length }}</strong>
                </div>
              </div>

              <div v-if="isWorkflowAssignRoute" class="assignment-toolbar">
                <el-form-item label="员工 user_id">
                  <el-input v-model="processAssignmentUserId" />
                </el-form-item>
                <div class="inline-actions">
                  <el-button
                    type="primary"
                    :loading="processAssignmentLoading"
                    :disabled="!selectedProcessNode"
                    @click="assignSelectedProcessNode('ASSIGN')"
                  >
                    绑定员工
                  </el-button>
                  <el-button
                    :loading="processAssignmentLoading"
                    :disabled="!selectedProcessNode || !selectedProcessNode.assigned_user_id"
                    @click="assignSelectedProcessNode('REASSIGN')"
                  >
                    转派员工
                  </el-button>
                </div>
              </div>

              <div class="process-node-list">
                <button
                  v-for="node in selectedProcessInstance.nodes"
                  :key="node.node_instance_id"
                  class="process-node-row"
                  :class="{ active: selectedProcessNodeId === node.node_instance_id }"
                  type="button"
                  @click="selectProcessNode(node)"
                >
                  <span class="node-order">{{ node.step_order }}</span>
                  <strong>{{ node.process_name }}</strong>
                  <span>{{ node.node_code }}</span>
                  <span>{{ node.node_status }}</span>
                  <span>员工 {{ node.assigned_user_id ?? '-' }}</span>
                  <span>{{ node.standard_duration ?? '-' }} 分钟</span>
                </button>
              </div>
            </section>
          </div>
        </section>

        <section v-else-if="isWorkerTasksRoute" class="panel route-panel worker-task-panel">
          <div class="route-heading">
            <h2>我的任务</h2>
            <el-tag round>{{ workerTasks.length }} 项</el-tag>
          </div>

          <div class="doctor-order-toolbar">
            <el-select v-model="workerTaskStatus">
              <el-option label="READY" value="READY" />
              <el-option label="IN_PROGRESS" value="IN_PROGRESS" />
              <el-option label="COMPLETED" value="COMPLETED" />
              <el-option label="PENDING" value="PENDING" />
            </el-select>
            <el-button type="primary" :loading="workerTasksLoading" @click="loadWorkerTasks">
              刷新
            </el-button>
          </div>

          <el-alert
            v-if="workerTaskError"
            :title="workerTaskError"
            type="error"
            show-icon
            :closable="false"
          />

          <div class="worker-task-list">
            <article v-for="task in workerTasks" :key="task.node_instance_id" class="worker-task-card">
              <div>
                <strong>{{ task.process_name }}</strong>
                <span>{{ task.order_no }} / {{ task.node_status }}</span>
              </div>
              <small>节点 {{ task.node_instance_id }} / 标准 {{ task.standard_duration ?? '-' }} 分钟</small>
              <div class="inline-actions">
                <el-button
                  type="primary"
                  plain
                  :loading="workerTaskActionLoading"
                  :disabled="task.node_status !== 'READY'"
                  @click="operateWorkerTask(task, 'START')"
                >
                  开始任务
                </el-button>
                <el-button
                  type="success"
                  plain
                  :loading="workerTaskActionLoading"
                  :disabled="task.node_status !== 'IN_PROGRESS'"
                  @click="operateWorkerTask(task, 'COMPLETE')"
                >
                  完成任务
                </el-button>
              </div>
            </article>
            <div v-if="workerTasks.length === 0" class="empty-state">
              暂无当前状态任务
            </div>
          </div>
        </section>

        <section v-else-if="isCheckRecordsRoute" class="panel route-panel check-record-panel">
          <div class="route-heading">
            <h2>入检出检</h2>
            <el-tag round>{{ checkTasks.length }} 项</el-tag>
          </div>

          <div class="doctor-order-toolbar">
            <el-select v-model="checkTaskStatus" @change="loadCheckTasks">
              <el-option label="READY / 入检" value="READY" />
              <el-option label="COMPLETED / 出检" value="COMPLETED" />
              <el-option label="IN_PROGRESS" value="IN_PROGRESS" />
              <el-option label="PENDING" value="PENDING" />
            </el-select>
            <el-button type="primary" :loading="checkTasksLoading" @click="loadCheckTasks">
              刷新
            </el-button>
          </div>

          <el-alert
            v-if="checkError"
            :title="checkError"
            type="error"
            show-icon
            :closable="false"
          />

          <el-alert
            v-if="checkResult"
            :title="`已提交 ${checkResult.check_type === 1 ? '入检' : '出检'}：${checkResult.result}`"
            type="success"
            show-icon
            :closable="false"
          />

          <div class="check-workspace">
            <aside class="doctor-order-list">
              <button
                v-for="task in checkTasks"
                :key="task.node_instance_id"
                class="doctor-order-row"
                :class="{ active: selectedCheckTask?.node_instance_id === task.node_instance_id }"
                type="button"
                @click="selectCheckTask(task)"
              >
                <strong>{{ task.process_name }}</strong>
                <span>{{ task.order_no }} / {{ task.node_status }}</span>
                <small>节点 {{ task.node_instance_id }} / 标准 {{ task.standard_duration ?? '-' }} 分钟</small>
              </button>
              <div v-if="checkTasks.length === 0" class="empty-state">
                暂无当前状态任务
              </div>
            </aside>

            <section v-if="selectedCheckTask" class="doctor-order-detail">
              <div class="doctor-order-summary">
                <div>
                  <span>订单</span>
                  <strong>{{ selectedCheckTask.order_no }}</strong>
                </div>
                <div>
                  <span>节点</span>
                  <strong>{{ selectedCheckTask.node_instance_id }}</strong>
                </div>
                <div>
                  <span>工序</span>
                  <strong>{{ selectedCheckTask.process_name }}</strong>
                </div>
                <div>
                  <span>状态</span>
                  <strong>{{ selectedCheckTask.node_status }}</strong>
                </div>
              </div>

              <div class="check-form">
                <el-form-item label="检查类型">
                  <el-radio-group v-model="checkType">
                    <el-radio-button :label="1">入检</el-radio-button>
                    <el-radio-button :label="2">出检</el-radio-button>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="结果">
                  <el-radio-group v-model="checkPass">
                    <el-radio-button :label="true">通过</el-radio-button>
                    <el-radio-button :label="false">不通过</el-radio-button>
                  </el-radio-group>
                </el-form-item>
                <el-form-item v-if="checkType === 2 && !checkPass" label="返工目标节点 ID">
                  <el-input v-model="checkReworkToNodeId" placeholder="出检不通过时必填" />
                </el-form-item>
                <el-form-item label="备注">
                  <el-input v-model="checkRemark" type="textarea" :rows="3" />
                </el-form-item>
                <el-button
                  type="primary"
                  :loading="checkActionLoading"
                  :disabled="checkType === 2 && !checkPass && !checkReworkToNodeId.trim()"
                  @click="submitCheckRecord"
                >
                  提交入检/出检
                </el-button>
              </div>

              <div class="check-record-list">
                <article v-for="record in checkRecords" :key="record.check_id" class="check-record-card">
                  <strong>{{ record.check_type === 1 ? '入检' : '出检' }} / {{ record.result }}</strong>
                  <span>记录 {{ record.check_id }} / 节点 {{ record.node_instance_id }}</span>
                  <small v-if="record.rework_id">返工 {{ record.rework_id }}</small>
                </article>
                <div v-if="checkRecords.length === 0" class="empty-state">
                  暂无检查记录
                </div>
              </div>
            </section>
          </div>
        </section>

        <section v-else-if="isReworkFinalRoute" class="panel route-panel check-record-panel">
          <div class="route-heading">
            <h2>返工终检</h2>
            <el-tag round>{{ reworkRecords.length }} 条返工</el-tag>
          </div>

          <div class="doctor-order-toolbar">
            <el-select v-model="reworkStatus" @change="loadReworkRecords">
              <el-option label="PENDING / 待返工记录" value="PENDING" />
              <el-option label="IN_PROGRESS" value="IN_PROGRESS" />
              <el-option label="DONE" value="DONE" />
            </el-select>
            <el-button type="primary" :loading="reworkRecordsLoading || finalInspectionLoading" @click="loadReworkFinalPage">
              刷新
            </el-button>
          </div>

          <el-alert
            v-if="reworkError"
            :title="reworkError"
            type="error"
            show-icon
            :closable="false"
          />

          <el-alert
            v-if="finalInspectionResult"
            :title="`已提交终检出检：${finalInspectionResult.result}`"
            type="success"
            show-icon
            :closable="false"
          />

          <div class="check-workspace">
            <aside class="doctor-order-list">
              <button
                v-for="record in reworkRecords"
                :key="record.rework_id"
                class="doctor-order-row"
                :class="{ active: selectedRework?.rework_id === record.rework_id }"
                type="button"
                @click="selectedRework = record"
              >
                <strong>{{ record.order_no }} / 返工 {{ record.rework_id }}</strong>
                <span>{{ record.from_process_name ?? '-' }} -> {{ record.target_process_name ?? '-' }}</span>
                <small>返工目标节点 {{ record.target_node_instance_id ?? '-' }} / {{ record.target_node_status ?? '-' }}</small>
              </button>
              <div v-if="reworkRecords.length === 0" class="empty-state">
                暂无待返工记录
              </div>
            </aside>

            <section class="doctor-order-detail">
              <div class="route-heading compact-heading">
                <h3>终检入口</h3>
                <el-tag round>{{ finalInspectionTasks.length }} 个已完成节点</el-tag>
              </div>

              <div v-if="selectedRework" class="doctor-order-summary">
                <div>
                  <span>订单</span>
                  <strong>{{ selectedRework.order_no }}</strong>
                </div>
                <div>
                  <span>来源节点</span>
                  <strong>{{ selectedRework.from_node_instance_id ?? '-' }}</strong>
                </div>
                <div>
                  <span>返工目标节点</span>
                  <strong>{{ selectedRework.target_node_instance_id ?? '-' }}</strong>
                </div>
                <div>
                  <span>状态</span>
                  <strong>{{ selectedRework.status }}</strong>
                </div>
              </div>

              <div class="doctor-order-toolbar">
                <el-select
                  :model-value="selectedFinalInspectionTask?.node_instance_id ?? null"
                  placeholder="选择已完成节点"
                  @change="selectFinalInspectionTaskById"
                >
                  <el-option
                    v-for="task in finalInspectionTasks"
                    :key="task.node_instance_id"
                    :label="`${task.order_no} / ${task.process_name} / 节点 ${task.node_instance_id}`"
                    :value="task.node_instance_id"
                  />
                </el-select>
                <el-button :loading="finalInspectionLoading" @click="loadFinalInspectionTasks">
                  刷新终检任务
                </el-button>
              </div>

              <div v-if="selectedFinalInspectionTask" class="check-form">
                <div class="doctor-order-summary">
                  <div>
                    <span>订单</span>
                    <strong>{{ selectedFinalInspectionTask.order_no }}</strong>
                  </div>
                  <div>
                    <span>节点</span>
                    <strong>{{ selectedFinalInspectionTask.node_instance_id }}</strong>
                  </div>
                  <div>
                    <span>工序</span>
                    <strong>{{ selectedFinalInspectionTask.process_name }}</strong>
                  </div>
                  <div>
                    <span>状态</span>
                    <strong>{{ selectedFinalInspectionTask.node_status }}</strong>
                  </div>
                </div>
                <el-form-item label="终检备注">
                  <el-input v-model="finalInspectionRemark" type="textarea" :rows="3" />
                </el-form-item>
                <el-button
                  type="primary"
                  :loading="finalInspectionLoading"
                  @click="submitFinalInspectionCheck"
                >
                  提交终检出检
                </el-button>
              </div>

              <div class="check-record-list">
                <article v-for="record in finalInspectionRecords" :key="record.check_id" class="check-record-card">
                  <strong>{{ record.check_type === 1 ? '入检' : '出检' }} / {{ record.result }}</strong>
                  <span>记录 {{ record.check_id }} / 节点 {{ record.node_instance_id }}</span>
                  <small v-if="record.rework_id">返工 {{ record.rework_id }}</small>
                </article>
                <div v-if="finalInspectionRecords.length === 0" class="empty-state">
                  暂无终检检查记录
                </div>
              </div>
            </section>
          </div>
        </section>

        <section v-else-if="isWorklogsRoute" class="panel route-panel worklog-panel">
          <div class="route-heading">
            <h2>工时记录</h2>
            <el-tag round>{{ worklogTasks.length }} 项</el-tag>
          </div>

          <div class="doctor-order-toolbar">
            <el-select v-model="worklogTaskStatus" @change="loadWorklogTasks">
              <el-option label="IN_PROGRESS / 计时" value="IN_PROGRESS" />
              <el-option label="READY" value="READY" />
              <el-option label="COMPLETED" value="COMPLETED" />
            </el-select>
            <el-button type="primary" :loading="worklogTasksLoading" @click="loadWorklogTasks">
              刷新
            </el-button>
          </div>

          <el-alert
            v-if="worklogError"
            :title="worklogError"
            type="error"
            show-icon
            :closable="false"
          />

          <div class="worklog-workspace">
            <aside class="doctor-order-list">
              <button
                v-for="task in worklogTasks"
                :key="task.node_instance_id"
                class="doctor-order-row"
                :class="{ active: selectedWorklogTask?.node_instance_id === task.node_instance_id }"
                type="button"
                @click="selectWorklogTask(task)"
              >
                <strong>{{ task.process_name }}</strong>
                <span>{{ task.order_no }} / {{ task.node_status }}</span>
                <small>节点 {{ task.node_instance_id }} / 标准 {{ task.standard_duration ?? '-' }} 分钟</small>
              </button>
              <div v-if="worklogTasks.length === 0" class="empty-state">
                暂无当前状态任务
              </div>
            </aside>

            <section v-if="selectedWorklogTask" class="doctor-order-detail">
              <div class="doctor-order-summary">
                <div>
                  <span>订单</span>
                  <strong>{{ selectedWorklogTask.order_no }}</strong>
                </div>
                <div>
                  <span>节点</span>
                  <strong>{{ selectedWorklogTask.node_instance_id }}</strong>
                </div>
                <div>
                  <span>工序</span>
                  <strong>{{ selectedWorklogTask.process_name }}</strong>
                </div>
                <div>
                  <span>状态</span>
                  <strong>{{ selectedWorklogTask.node_status }}</strong>
                </div>
              </div>

              <div class="worklog-status-card">
                <div>
                  <span>当前工时</span>
                  <strong>{{ activeWorkLog ? `#${activeWorkLog.work_log_id} / ${activeWorkLog.status}` : '未开始' }}</strong>
                </div>
                <div>
                  <span>暂停秒数</span>
                  <strong>{{ activeWorkLog?.pause_duration_seconds ?? 0 }}</strong>
                </div>
                <div>
                  <span>有效秒数</span>
                  <strong>{{ activeWorkLog?.effective_duration_seconds ?? '-' }}</strong>
                </div>
              </div>

              <div class="inline-actions">
                <el-button
                  type="primary"
                  :loading="worklogActionLoading"
                  :disabled="selectedWorklogTask.node_status !== 'IN_PROGRESS'"
                  @click="startSelectedWorkLog"
                >
                  开始工时
                </el-button>
                <el-button
                  :loading="worklogActionLoading"
                  :disabled="activeWorkLog?.status !== 'IN_PROGRESS'"
                  @click="operateWorkLog('pause')"
                >
                  暂停工时
                </el-button>
                <el-button
                  :loading="worklogActionLoading"
                  :disabled="activeWorkLog?.status !== 'PAUSED'"
                  @click="operateWorkLog('resume')"
                >
                  继续工时
                </el-button>
                <el-button
                  type="success"
                  :loading="worklogActionLoading"
                  :disabled="!activeWorkLog || activeWorkLog.status === 'COMPLETED'"
                  @click="operateWorkLog('finish')"
                >
                  完成工时
                </el-button>
              </div>
            </section>
          </div>
        </section>

        <section v-else-if="isPerformanceRoute" class="panel route-panel performance-panel">
          <div class="route-heading">
            <h2>绩效统计</h2>
            <el-tag round>{{ performanceStats ? `员工 ${performanceStats.user_id ?? '-'}` : '未加载' }}</el-tag>
          </div>

          <div class="performance-toolbar">
            <el-input
              v-model="performanceUserId"
              placeholder="ADMIN 可填 user_id；WORKER 留空查本人"
              clearable
              @keyup.enter="loadPerformanceStats"
            />
            <el-button type="primary" :loading="performanceLoading" @click="loadPerformanceStats">
              查询员工绩效
            </el-button>
          </div>

          <el-alert
            v-if="performanceError"
            :title="performanceError"
            type="error"
            show-icon
            :closable="false"
          />

          <div v-if="performanceStats" class="performance-grid">
            <article class="performance-card">
              <span>完成工序</span>
              <strong>{{ performanceStats.completed_count }}</strong>
              <small>已完成 work log 数</small>
            </article>
            <article class="performance-card">
              <span>有效工时</span>
              <strong>{{ performanceStats.effective_duration }}</strong>
              <small>分钟</small>
            </article>
            <article class="performance-card">
              <span>返工次数</span>
              <strong>{{ performanceStats.rework_count }}</strong>
              <small>目标节点返工记录</small>
            </article>
            <article class="performance-card">
              <span>准时率</span>
              <strong>{{ performanceStats.on_time_rate }}%</strong>
              <small>标准工时内完成占比</small>
            </article>
            <article class="performance-card">
              <span>通过率</span>
              <strong>{{ performanceStats.pass_rate }}%</strong>
              <small>出检一次通过占比</small>
            </article>
            <article class="performance-card">
              <span>工时效率</span>
              <strong>{{ performanceStats.duration_efficiency }}%</strong>
              <small>标准工时 / 实际工时</small>
            </article>
          </div>
          <div v-else class="empty-state">
            暂无绩效统计
          </div>
        </section>

        <section v-else-if="isProductionBoardRoute" class="panel route-panel production-board-panel">
          <div class="route-heading">
            <h2>生产看板</h2>
            <el-tag round>{{ productionBoardOrders.length }} 单</el-tag>
          </div>

          <div class="production-board-toolbar">
            <el-select v-model="productionBoardStatus" @change="loadProductionBoardOrders">
              <el-option
                v-for="option in productionBoardStatusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-input
              v-model="productionBoardKeyword"
              placeholder="跨状态生产检索：订单号或患者"
              clearable
              @keyup.enter="loadProductionBoardOrders"
            />
            <el-button type="primary" :loading="productionBoardLoading" @click="loadProductionBoardOrders">
              查询生产订单
            </el-button>
          </div>

          <el-alert
            v-if="productionBoardError"
            :title="productionBoardError"
            type="warning"
            show-icon
            :closable="false"
          />

          <div class="production-board-workspace">
            <aside class="doctor-order-list">
              <button
                v-for="order in productionBoardOrders"
                :key="order.order_id"
                class="doctor-order-row"
                :class="{ active: selectedProductionBoardOrder?.order_id === order.order_id }"
                type="button"
                @click="selectProductionBoardOrder(order)"
              >
                <strong>{{ order.order_no }}</strong>
                <span>{{ order.clinic_name }} / {{ order.product_type }}</span>
                <small>{{ order.internal_status }} / {{ order.external_status }}</small>
              </button>
              <div v-if="productionBoardOrders.length === 0" class="empty-state">
                暂无生产订单
              </div>
            </aside>

            <section v-if="selectedProductionBoardOrder" class="doctor-order-detail">
              <div class="doctor-order-summary">
                <div>
                  <span>订单</span>
                  <strong>{{ selectedProductionBoardOrder.order_no }}</strong>
                </div>
                <div>
                  <span>内部状态</span>
                  <strong>{{ selectedProductionBoardOrder.internal_status }}</strong>
                </div>
                <div>
                  <span>外部状态</span>
                  <strong>{{ selectedProductionBoardOrder.external_status }}</strong>
                </div>
                <div>
                  <span>诊所</span>
                  <strong>{{ selectedProductionBoardOrder.clinic_name }}</strong>
                </div>
              </div>

              <div v-if="productionBoardInstance" class="production-board-stats">
                <article class="performance-card">
                  <span>READY</span>
                  <strong>{{ productionBoardNodeStats.READY }}</strong>
                  <small>待执行节点</small>
                </article>
                <article class="performance-card">
                  <span>IN_PROGRESS</span>
                  <strong>{{ productionBoardNodeStats.IN_PROGRESS }}</strong>
                  <small>进行中节点</small>
                </article>
                <article class="performance-card">
                  <span>COMPLETED</span>
                  <strong>{{ productionBoardNodeStats.COMPLETED }}</strong>
                  <small>已完成节点</small>
                </article>
                <article class="performance-card">
                  <span>SKIPPED / PENDING</span>
                  <strong>{{ productionBoardNodeStats.SKIPPED }} / {{ productionBoardNodeStats.PENDING }}</strong>
                  <small>跳过或未激活节点</small>
                </article>
              </div>

              <div v-if="productionBoardInstance" class="process-node-list">
                <div class="section-subtitle">
                  节点进度
                </div>
                <button
                  v-for="node in productionBoardInstance.nodes"
                  :key="node.node_instance_id"
                  class="process-node-row"
                  type="button"
                >
                  <span class="node-order">{{ node.step_order }}</span>
                  <strong>{{ node.process_name }}</strong>
                  <span>{{ node.node_code }}</span>
                  <span>{{ node.node_status }}</span>
                  <span>员工 {{ node.assigned_user_id ?? '-' }}</span>
                  <span>{{ node.standard_duration ?? '-' }} 分钟</span>
                </button>
              </div>

              <div v-else class="empty-state">
                该订单暂无可展示的工序实例
              </div>
            </section>
          </div>
        </section>

        <section v-else-if="isDoctorOrderRoute" class="panel route-panel doctor-order-panel">
          <div class="route-heading">
            <h2>医生订单工作台</h2>
            <el-tag round>{{ doctorOrders.length }} 单</el-tag>
          </div>

          <section class="doctor-order-create">
            <div class="subheading-row">
              <h3>新建订单</h3>
              <el-button :loading="doctorOrderCreateLoading" @click="loadDoctorOrderForm">刷新表单</el-button>
            </div>
            <div class="order-create-grid">
              <el-form-item label="产品类型">
                <el-input
                  v-model="doctorOrderFormProductType"
                  @change="loadDoctorOrderForm"
                />
              </el-form-item>
              <el-form-item label="附件 file_id">
                <el-input
                  v-model="doctorOrderFileIds"
                  data-testid="doctor-order-file-ids-input"
                  placeholder="已完成 file_id，逗号分隔"
                />
              </el-form-item>
              <el-form-item label="选择附件">
                <input
                  class="file-input"
                  data-testid="doctor-upload-file-input"
                  type="file"
                  multiple
                  @change="selectDoctorUploadFiles"
                >
              </el-form-item>
            </div>
            <div class="upload-binding-row">
              <el-button
                type="primary"
                plain
                :loading="doctorUploadLoading"
                :disabled="doctorUploadFiles.length === 0 || !selectedOrderId"
                data-testid="doctor-upload-bind-button"
                @click="uploadDoctorOrderFiles"
              >
                上传并绑定
              </el-button>
              <el-button
                plain
                :loading="doctorUploadLoading"
                :disabled="doctorUploadFiles.length === 0"
                @click="abortDoctorUploadSessions"
              >
                取消未完成上传
              </el-button>
              <span v-if="doctorUploadProgress" data-testid="doctor-upload-progress">{{ doctorUploadProgress }}</span>
              <el-tag
                v-for="fileId in doctorUploadCompletedFileIds"
                :key="fileId"
                data-testid="doctor-upload-completed-file-id"
                type="success"
                round
              >
                file_id {{ fileId }}
              </el-tag>
            </div>
            <div class="dynamic-form-grid">
              <el-form-item
                v-for="field in doctorOrderFormFields"
                :key="field.field_id"
                :label="`${field.field_label}${field.is_required ? ' *' : ''}`"
              >
                <el-select
                  v-if="field.field_type === 'select'"
                  v-model="doctorOrderFormData[field.field_key]"
                  :data-testid="`doctor-form-field-${field.field_key}`"
                  clearable
                >
                  <el-option
                    v-for="option in field.options"
                    :key="option"
                    :label="option"
                    :value="option"
                  />
                </el-select>
                <el-select
                  v-else-if="field.field_type === 'multi-select'"
                  v-model="doctorOrderFormData[field.field_key]"
                  :data-testid="`doctor-form-field-${field.field_key}`"
                  multiple
                  clearable
                >
                  <el-option
                    v-for="option in field.options"
                    :key="option"
                    :label="option"
                    :value="option"
                  />
                </el-select>
                <el-input
                  v-else-if="field.field_type === 'textarea'"
                  v-model="doctorOrderFormData[field.field_key]"
                  :data-testid="`doctor-form-field-${field.field_key}`"
                  type="textarea"
                  :rows="2"
                />
                <el-input
                  v-else
                  v-model="doctorOrderFormData[field.field_key]"
                  :data-testid="`doctor-form-field-${field.field_key}`"
                  :type="field.field_type === 'number' ? 'number' : 'text'"
                />
              </el-form-item>
            </div>
            <div class="inline-actions">
              <el-button
                type="primary"
                :loading="doctorOrderCreateLoading"
                :disabled="doctorOrderFormFields.length === 0"
                data-testid="doctor-order-create-button"
                @click="createDoctorOrder"
              >
                提交订单
              </el-button>
              <el-tag v-if="doctorOrderCreateResult" data-testid="doctor-order-create-result" type="success" round>
                {{ doctorOrderCreateResult.order_no }} / {{ doctorOrderCreateResult.external_status }}
              </el-tag>
            </div>
            <el-alert
              v-if="doctorOrderCreateError"
              :title="doctorOrderCreateError"
              type="error"
              show-icon
              :closable="false"
            />
          </section>

          <div class="doctor-order-toolbar">
            <el-input
              v-model="doctorOrderKeyword"
              placeholder="搜索订单号或患者"
              clearable
              @keyup.enter="loadDoctorOrders"
            />
            <el-button type="primary" :loading="doctorOrdersLoading" @click="loadDoctorOrders">
              查询
            </el-button>
          </div>

          <el-alert
            v-if="doctorOrderError"
            :title="doctorOrderError"
            type="error"
            show-icon
            :closable="false"
          />

          <div class="doctor-order-workspace">
            <aside class="doctor-order-list">
              <button
                v-for="order in doctorOrders"
                :key="order.order_id"
                class="doctor-order-row"
                :class="{ active: selectedOrderId === order.order_id }"
                type="button"
                @click="loadDoctorOrderWorkspace(order.order_id)"
              >
                <strong>{{ order.order_no }}</strong>
                <span>{{ order.product_type }} / {{ order.external_status }}</span>
                <small>{{ order.public_message ?? '暂无公开进度说明' }}</small>
              </button>
              <div v-if="doctorOrders.length === 0" class="empty-state">
                暂无医生订单
              </div>
            </aside>

            <section v-if="doctorOrderWorkspace" class="doctor-order-detail">
              <div class="doctor-order-summary">
                <div>
                  <span>订单号</span>
                  <strong>{{ doctorOrderWorkspace.order.order_no }}</strong>
                </div>
                <div>
                  <span>外部状态</span>
                  <strong>{{ doctorOrderWorkspace.order.external_status }}</strong>
                </div>
                <div>
                  <span>账单</span>
                  <strong>{{ doctorOrderWorkspace.bill.bill_status ?? 'PENDING' }}</strong>
                </div>
                <div>
                  <span>物流</span>
                  <strong>{{ doctorOrderWorkspace.logistics.logistics_status ?? 'PENDING' }}</strong>
                </div>
              </div>

              <el-tabs class="doctor-tabs">
                <el-tab-pane label="订单资料">
                  <div class="field-grid">
                    <div
                      v-for="field in fieldEntries(doctorOrderWorkspace.order.form_data)"
                      :key="field.key"
                      class="field-cell"
                    >
                      <span>{{ field.key }}</span>
                      <strong>{{ field.value }}</strong>
                    </div>
                  </div>
                  <p class="public-message">
                    {{ doctorOrderWorkspace.order.public_message ?? '暂无公开进度说明' }}
                  </p>
                  <el-button
                    type="primary"
                    plain
                    :loading="doctorActionLoading"
                    @click="confirmDoctorReceipt"
                  >
                    确认收货
                  </el-button>
                </el-tab-pane>

                <el-tab-pane label="消息">
                  <div class="message-composer">
                    <el-input
                      v-model="doctorMessageDraft"
                      type="textarea"
                      :rows="3"
                      placeholder="发给客服的消息"
                    />
                    <el-button
                      type="primary"
                      :loading="doctorActionLoading"
                      :disabled="!doctorMessageDraft.trim()"
                      @click="sendDoctorMessage"
                    >
                      发送
                    </el-button>
                  </div>
                  <div class="compact-list">
                    <article v-for="message in doctorOrderWorkspace.messages" :key="message.msg_id">
                      <strong>{{ message.sender_role }} / {{ message.review_status }}</strong>
                      <p>{{ message.content }}</p>
                    </article>
                    <div v-if="doctorOrderWorkspace.messages.length === 0" class="empty-state">
                      暂无公开消息
                    </div>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="设计稿">
                  <div class="compact-list">
                    <article v-for="draft in doctorOrderWorkspace.drafts" :key="draft.draft_id">
                      <strong>V{{ draft.version }} / {{ draft.status }}</strong>
                      <p>文件 ID：{{ draft.file_id ?? '-' }}</p>
                      <div v-if="draft.status === 'PENDING_DOCTOR_CONFIRM'" class="inline-actions">
                        <el-button
                          type="primary"
                          :loading="doctorActionLoading"
                          @click="handleDoctorDraft(draft, 'CONFIRM')"
                        >
                          确认设计稿
                        </el-button>
                        <el-button
                          :loading="doctorActionLoading"
                          @click="handleDoctorDraft(draft, 'REJECT')"
                        >
                          驳回
                        </el-button>
                      </div>
                    </article>
                    <div v-if="doctorOrderWorkspace.drafts.length === 0" class="empty-state">
                      暂无医生可见设计稿
                    </div>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="账单物流">
                  <div class="doctor-order-summary">
                    <div>
                      <span>账单状态</span>
                      <strong>{{ doctorOrderWorkspace.bill.bill_status ?? 'PENDING' }}</strong>
                    </div>
                    <div>
                      <span>账单文件</span>
                      <strong>{{ doctorOrderWorkspace.bill.file_id ?? '-' }}</strong>
                    </div>
                    <div>
                      <span>承运商</span>
                      <strong>{{ doctorOrderWorkspace.logistics.carrier ?? '-' }}</strong>
                    </div>
                    <div>
                      <span>物流单号</span>
                      <strong>{{ doctorOrderWorkspace.logistics.tracking_no ?? '-' }}</strong>
                    </div>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="医生 AI">
                  <div class="message-composer">
                    <el-input
                      v-model="doctorAiQuestion"
                      type="textarea"
                      :rows="3"
                      placeholder="询问订单外部状态、账单或物流"
                    />
                    <el-button
                      type="primary"
                      :loading="doctorActionLoading"
                      :disabled="!doctorAiQuestion.trim()"
                      @click="askDoctorAi"
                    >
                      提问
                    </el-button>
                  </div>
                  <div v-if="doctorAiAnswer" class="ai-answer">
                    {{ doctorAiAnswer }}
                  </div>
                </el-tab-pane>
              </el-tabs>
            </section>
          </div>
        </section>

        <section v-else-if="activeRoute === '/notifications'" class="panel route-panel notification-panel">
          <div class="route-heading">
            <h2>通知中心</h2>
            <div class="notification-heading-tags">
              <el-tag :type="notificationSocketStatus === '已连接' ? 'success' : 'info'" round>
                {{ notificationSocketStatus }}
              </el-tag>
              <el-tag :type="hasUnreadNotifications ? 'warning' : 'success'" round>
                未读 {{ unreadCount }}
              </el-tag>
            </div>
          </div>

          <div class="notification-toolbar">
            <el-button :loading="notificationsLoading" @click="loadNotifications">刷新</el-button>
            <el-button type="primary" :disabled="!hasUnreadNotifications" @click="markAllNotificationsRead">
              全部已读
            </el-button>
          </div>

          <div v-if="lastRealtimeNotification" class="realtime-strip">
            <strong>{{ lastRealtimeNotification.event ?? '实时通知' }}</strong>
            <span>{{ lastRealtimeNotification.message ?? lastRealtimeNotification.order_no ?? '新通知已到达' }}</span>
          </div>

          <el-alert
            v-if="notificationError"
            :title="notificationError"
            type="error"
            show-icon
            :closable="false"
          />

          <div v-if="notifications.length === 0" class="empty-state">
            暂无通知
          </div>
          <div v-else class="notification-list">
            <article
              v-for="item in notifications"
              :key="item.notification_id"
              class="notification-item"
              :class="{ unread: !item.read_at }"
            >
              <div class="notification-main">
                <div class="notification-title">
                  <strong>{{ item.event }}</strong>
                  <el-tag v-if="!item.read_at" type="warning" round>未读</el-tag>
                  <el-tag v-else type="info" round>已读</el-tag>
                </div>
                <p>{{ item.message ?? '系统通知' }}</p>
                <span>{{ item.order_no ?? `订单 ${item.order_id ?? '-'}` }} / {{ item.created_at }}</span>
              </div>
              <el-button
                v-if="!item.read_at"
                type="primary"
                plain
                @click="markNotificationRead(item.notification_id)"
              >
                标记已读
              </el-button>
            </article>
          </div>
        </section>

        <section v-else class="panel route-panel">
          <div class="route-heading">
            <h2>{{ activeMenu?.menuName ?? '工作台' }}</h2>
            <el-tag round>{{ activeMenu?.routePath ?? '/dashboard' }}</el-tag>
          </div>
          <dl class="route-meta">
            <div>
              <dt>权限码</dt>
              <dd>{{ activeMenu?.permissionCode ?? '公共入口' }}</dd>
            </div>
            <div>
              <dt>组件</dt>
              <dd>{{ activeMenu?.componentPath ?? 'DashboardView' }}</dd>
            </div>
          </dl>
          <div class="permission-strip">
            <el-tag v-for="permission in visiblePermissions" :key="permission" effect="plain">
              {{ permission }}
            </el-tag>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>
