<script setup lang="ts">
import Uppy from '@uppy/core'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

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

type LoginPortal = 'DOCTOR' | 'CS' | 'PRODUCTION' | 'ADMIN'

type LoginResponse = {
  accessToken: string
  refreshToken: string
  username: string
  userId: number | null
  clinicId: number | null
  roles: string[]
  permissions: string[]
  menus: AuthMenu[]
  dataScope: string | null
  expiresAt: string
  refreshExpiresAt: string
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
  patient_id: number | null
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

type PatientRecord = {
  patient_id: number
  clinic_id: number
  doctor_user_id: number
  patient_name: string
  patient_age: number | null
  patient_gender: string | null
  oral_description: string | null
  order_count: number
  latest_order_at: string | null
  created_at: string
  updated_at: string
}

type PatientOrderItem = {
  order_id: number
  order_no: string
  product_type: string
  external_status: string
  created_at: string
}

type PatientListResponse = {
  items: PatientRecord[]
  total: number
  page: number
  size: number
}

type PatientOrderListResponse = {
  items: PatientOrderItem[]
  total: number
  page: number
  size: number
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

type ClinicListResponse = {
  items: ClinicItem[]
  total: number
  page: number
  size: number
}

type ClinicPreference = {
  clinic_id: number
  clinic_name: string
  preferences: Record<string, string | null>
  updated_at: string
}

type ProductCatalogItem = {
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

type ProductCatalogListResponse = {
  items: ProductCatalogItem[]
  total: number
  page: number
  size: number
}

type DoctorAccountSettings = {
  user_id: number
  username: string
  display_name: string
  contact_email: string | null
  contact_phone: string | null
  shipping_address: string | null
  notification_push_enabled: boolean
}

type StaffWorkloadResponse = {
  user_id: number
  username: string
  display_name: string
  user_type: string
  status: string
  dept_id: number | null
  dept_name: string | null
  post_names: string[]
  role_codes: string[]
  assigned_node_count: number
  active_node_count: number
  completed_work_log_count: number
  effective_duration: number
  rework_count: number
  last_work_finished_at: string | null
  updated_at: string
}

type StaffWorkloadListResponse = {
  items: StaffWorkloadResponse[]
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
  order_no: string
  product_type: string
  external_status: string
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
  file_ids: number[]
  file_count: number
  status: string
}

type BillInfo = {
  bill_id: number | null
  order_id: number
  bill_status: string
  payment_status: string
  file_id: number | null
}

type PaymentRecordItem = {
  payment_id: number
  order_id: number
  amount_cents: number
  currency: string
  payment_method: string
  received_at: string
  payment_note: string | null
  created_by_user_id: number | null
  created_at: string
}

type LogisticsInfo = {
  logistics_id: number | null
  order_id: number
  carrier: string | null
  tracking_no: string | null
  logistics_status: string
}

type DeliveryOrderItem = {
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

type PhaseOneAbDashboardSource = 'reused-api' | 'partial' | 'blocked'

type PhaseOneAbCustomerRanking = {
  clinicId?: number
  clinicName: string
  orderCount: number
  itemCount?: number
}

type PhaseOneAbMonthSummary = {
  month: string
  order_count: number
  item_count: number
}

type PhaseOneAbDashboardCustomerRanking = {
  clinic_id: number
  clinic_name: string
  order_count: number
  item_count: number
}

type PhaseOneAbDashboardResponse = {
  current_month: PhaseOneAbMonthSummary
  previous_month: PhaseOneAbMonthSummary
  monthly_order_delta: number
  monthly_item_delta: number
  top_customers: PhaseOneAbDashboardCustomerRanking[]
  production_exception_count: number
  pending_question_count: number
  shipping_rate: number
  completion_rate: number
  source_note: string
  generated_at: string
}

type DoctorOrderWorkspace = {
  order: DoctorOrderItem
  messages: MessageItem[]
  drafts: DesignDraftItem[]
  bill: BillInfo
  payments: PaymentRecordItem[]
  logistics: LogisticsInfo
}

type DoctorAiAnswer = {
  answer: string
  reference_data_notes?: string[]
  attachment_contexts?: AiAttachmentContext[]
}

type AiAttachmentContext = {
  file_id: number
  source_type: string
  visibility: string
  original_filename: string
  content_type?: string
  file_size?: number
  preview_url: string
  expires_in_seconds: number
  review_note: string
}

type MissingInfoItem = {
  field_key: string
  field_label: string
  tip: string
}

type MissingInfoResponse = {
  is_complete: boolean
  missing_items: MissingInfoItem[]
}

type AiTranslateResponse = {
  translated_text: string
}

type AiProductionNoteResponse = {
  draft_note: string
  template_version: string
  knowledge_context_notes: string[]
  requires_customer_template_confirmation: boolean
}

type AiProductionNoteConfirmResponse = {
  production_note: string
  template_version: string
  requires_customer_template_confirmation: boolean
}

type AiPromptTemplate = {
  agent_code: string
  prompt_version: string
  context_type: string
  owner_role: string
  template_source: string
  mutation_allowed: boolean
  human_confirmation_required: boolean
}

type AiOutputSafetyBoundary = {
  guarded_status: string
  guarded_model_name: string
  streaming_status: string
  blocked_pattern_count: number
  raw_model_output_exposed: boolean
  manual_review_required: boolean
}

type AiBudgetCircuitBreakerPolicy = {
  daily_budget_microusd: number
  admin_daily_budget_microusd: number
  cs_daily_budget_microusd: number
  doctor_daily_budget_microusd: number
  worker_daily_budget_microusd: number
  model_daily_budget_microusd: number
  budget_notification_enabled: boolean
  budget_circuit_breaker_enabled: boolean
}

type Ai3SafetyCase = {
  case_id: string
  question_family: string
  expected_status: string
  safe_read_model: string
  forbidden_fields: string[]
}

type Ai5TemplateBoundary = {
  template_version: string
  customer_template_status: string
  requires_customer_template_confirmation: boolean
  auto_write_allowed: boolean
  human_confirmation_required: boolean
}

type AiRealExternalIntegrationStatus = {
  integration_status: string
  deepseek_key_status: string
  webhook_status: string
  customer_signature_status: string
  task8_status: string
}

type AiGovernanceLocalHardeningResponse = {
  stage_goal: string
  stage_task: string
  prompt_templates: AiPromptTemplate[]
  output_safety_boundary: AiOutputSafetyBoundary
  budget_circuit_breaker_policy: AiBudgetCircuitBreakerPolicy
  ai3_safety_cases: Ai3SafetyCase[]
  ai5_template_boundary: Ai5TemplateBoundary
  real_external_integration_status: AiRealExternalIntegrationStatus
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
  status: string
}

type FormFieldPayload = {
  product_type?: string
  field_key?: string
  field_label?: string
  field_type?: string
  is_required?: boolean
  options?: string[]
  sort_order?: number
  status?: string
}

type CreateOrderResponse = {
  order_id: number
  order_no: string
  patient_id: number | null
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

type FilePreviewUrlResponse = {
  file_id: number
  preview_url: string
  download_url: string | null
  expires_in_seconds: number
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
  impacted_node_count: number
  impacted_node_instance_ids: number[]
  assigned_user_id: number | null
  reason_category: string | null
  reason_detail: string | null
  responsibility_type: string | null
  close_note: string | null
  closed_by_user_id: number | null
  closed_at: string | null
  status: string
  created_at: string
}

type ReworkImpactStep = {
  key: string
  nodeId: number | null
  title: string
  subtitle: string
  kind: 'target' | 'impacted'
}

type ReworkDictionaryOption = {
  code: string
  label: string
}

type ReworkDictionariesResponse = {
  reason_categories: ReworkDictionaryOption[]
  responsibility_types: ReworkDictionaryOption[]
}

type ReworkDictionaryItem = {
  item_id: number
  dictionary_type: string
  code: string
  label: string
  sort_order: number
  status: string
}

type ReworkDictionaryItemPayload = {
  dictionary_type?: string
  code?: string
  label?: string
  sort_order?: number
  status?: string
}

type FinalInspectionReportResponse = {
  report_id: number
  order_id: number
  report_no: string
  final_node_instance_id: number
  final_check_id: number
  conclusion: string
  summary: string | null
  pdf_file_id: number | null
  inspector_user_id: number | null
  status: string
  signature_status: string
  signed_by_user_id: number | null
  signed_at: string | null
  attachment_file_ids: number[]
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
  performance_formula_version: string
  completed_count: number
  effective_duration: number
  standard_duration: number
  standard_covered_count: number
  standard_missing_count: number
  standard_coverage_rate: number
  rework_count: number
  responsible_rework_count: number
  non_worker_responsibility_rework_count: number
  unclassified_rework_count: number
  on_time_rate: number
  pass_rate: number
  duration_efficiency: number
  performance_score: number
}

type ProductionQualitySummaryResponse = {
  product_type: string | null
  inspected_order_count: number
  total_rework_count: number
  internal_rework_count: number
  external_rework_count: number
  unclassified_rework_count: number
  total_rework_rate: number
  internal_rework_rate: number
  external_rework_rate: number
  first_pass_rate: number
  final_pass_rate: number
  complaint_rate: number
  return_rate: number
  generated_at: string
}

type QualityRecordResponse = {
  quality_record_id: number
  quality_record_type: string
  order_id: number
  order_no: string
  product_type: string
  clinic_name: string
  check_id: number
  check_result: string
  rework_id: number | null
  reason_category: string | null
  reason_detail: string | null
  responsibility_type: string | null
  status: string | null
  status_note: string | null
  created_at: string
  status_updated_at: string | null
  updated_at: string | null
}

type QualityRecordListResponse = {
  items: QualityRecordResponse[]
  total: number
  page: number
  size: number
}

type ProductionEquipmentSummaryResponse = {
  equipment_code_prefix: string | null
  total_equipment_count: number
  running_count: number
  idle_count: number
  maintenance_count: number
  fault_count: number
  pending_maintenance_count: number
  open_fault_count: number
  downtime_minutes: number
  average_utilization_rate: number
  generated_at: string
}

type ProductionEquipmentResponse = {
  equipment_id: number
  equipment_code: string
  equipment_name: string
  equipment_type: string
  department_name: string | null
  status: string
  owner_user_id: number | null
  utilization_rate: number
  created_at: string
  updated_at: string
}

type ProductionEquipmentEventResponse = {
  event_id: number
  equipment_id: number
  equipment_code: string
  event_type: string
  status: string
  downtime_minutes: number
  description: string | null
  created_at: string
  resolved_at: string | null
}

type ProductionMaterialExceptionSummaryResponse = {
  exception_no_prefix: string | null
  total_exception_count: number
  shortage_count: number
  wrong_material_count: number
  batch_abnormal_count: number
  material_loss_count: number
  pending_count: number
  in_progress_count: number
  closed_count: number
  responsibility_assigned_count: number
  total_loss_quantity: number
  generated_at: string
}

type ProductionMaterialExceptionResponse = {
  exception_id: number
  exception_no: string
  material_code: string
  material_name: string
  order_id: number | null
  node_instance_id: number | null
  exception_type: string
  status: string
  responsibility_owner: string | null
  loss_quantity: number
  description: string | null
  created_at: string
  updated_at: string
  closed_at: string | null
}

type ProductionSafetyEnvironmentSummaryResponse = {
  event_no_prefix: string | null
  total_event_count: number
  safety_inspection_count: number
  hazard_rectification_count: number
  environment_record_count: number
  ppe_device_reminder_count: number
  pending_count: number
  in_progress_count: number
  closed_count: number
  overdue_count: number
  high_risk_count: number
  generated_at: string
}

type ProductionSafetyEnvironmentEventResponse = {
  event_id: number
  event_no: string
  event_type: string
  status: string
  department_name: string | null
  responsible_owner: string | null
  equipment_code: string | null
  risk_level: string
  due_at: string | null
  description: string | null
  created_at: string
  updated_at: string
  closed_at: string | null
}

type ProductionCostSummaryResponse = {
  cost_no_prefix: string | null
  record_count: number
  total_cost_amount: number
  process_cost_amount: number
  material_cost_amount: number
  labor_cost_amount: number
  rework_cost_amount: number
  outsourcing_cost_amount: number
  abnormal_warning_count: number
  generated_at: string
}

type ProductionCostRecordResponse = {
  cost_id: number
  cost_no: string
  order_id: number | null
  node_instance_id: number | null
  cost_type: string
  amount: number
  status: string
  department_name: string | null
  supplier_name: string | null
  description: string | null
  created_at: string
  updated_at: string
  confirmed_at: string | null
}

type ProductionRewardPenaltySummaryResponse = {
  record_no_prefix: string | null
  total_record_count: number
  reward_count: number
  penalty_count: number
  pending_count: number
  approved_count: number
  rejected_count: number
  effective_count: number
  related_order_count: number
  related_process_count: number
  related_employee_count: number
  monthly_amount: number
  generated_at: string
}

type ProductionRewardPenaltyRecordResponse = {
  record_id: number
  record_no: string
  record_type: string
  reason_category: string
  amount: number
  status: string
  order_id: number | null
  node_instance_id: number | null
  employee_user_id: number | null
  approver_user_id: number | null
  department_name: string | null
  description: string | null
  created_at: string
  updated_at: string
  approved_at: string | null
  effective_at: string | null
}

type PerformanceDetailResponse = {
  work_log_id: number
  order_id: number
  order_no: string
  node_instance_id: number
  node_name: string
  worker_user_id: number
  status: string
  effective_duration: number | null
  standard_duration: number | null
  on_time: boolean | null
  started_at: string
  finished_at: string
}

type ProductionBoardStatusOption = {
  label: string
  value: string
}

type PortalOption = {
  value: LoginPortal
  title: string
  subtitle: string
  icon: string
  tone: 'doctor' | 'cs' | 'production' | 'admin'
  defaultUsername: string
  defaultPassword: string
}

type PortalTone = PortalOption['tone']

type RouteChrome = {
  eyebrow: string
  title: string
  description: string
  icon: string
}

type NavigationGroup = {
  title: string
  items: DisplayNavigationItem[]
}

type BusinessCard = {
  title: string
  value: string
  note: string
  icon: string
}

type PrototypeTone = 'blue' | 'sky' | 'green' | 'amber' | 'rose' | 'violet' | 'orange' | 'teal' | 'slate'

type DashboardMetric = {
  title: string
  value: string
  note: string
  icon: string
  tone: PrototypeTone
}

type DashboardAction = {
  title: string
  detail: string
  meta: string
  tone: PrototypeTone
  actionLabel: string
  routePath?: string
  navId?: string
  doctorSection?: string
  doctorDetailTab?: string
}

type DashboardPanel = {
  title: string
  badge?: string
  tone?: PrototypeTone
  items: DashboardAction[]
}

type DashboardTrend = {
  label: string
  value: string
  percent: number
  tone: PrototypeTone
}

type PrototypeDashboard = {
  greeting: string
  subtitle: string
  primaryAction?: DashboardAction
  syncBanner?: string
  metrics: DashboardMetric[]
  panels: DashboardPanel[]
  trends: DashboardTrend[]
}

type QueueChip = {
  label: string
  count: string
  tone: PrototypeTone
  active?: boolean
  filter?: string
  doctorSection?: string
  doctorDetailTab?: string
}

type PrototypeQueueRow = {
  orderNo: string
  patient: string
  product: string
  status: string
  statusTone: PrototypeTone
  checklist: string
  checklistTone: PrototypeTone
  reviewType: string
  awaiting: string
  awaitingTone: PrototypeTone
  days: string
  daysTone: PrototypeTone
  action: string
}

type BusinessShortcut = {
  id: string
  title: string
  description: string
  icon: string
  routePath?: string
  placeholder?: boolean
  doctorSection?: string
  doctorDetailTab?: string
}

type DisplayNavigationItem = {
  id: string
  title: string
  description: string
  icon: string
  routePath: string
  placeholder?: boolean
  doctorSection?: string
  doctorDetailTab?: string
  children?: DisplayNavigationItem[]
}

type PlaceholderContentItem = {
  title: string
  detail: string
  tone: PrototypeTone
}

type AccountProfile = {
  username: string
  role: string
  organization: string
  scope: string
  summary: string
}

const username = ref('admin')
const password = ref('change-me-admin')
const selectedPortal = ref<LoginPortal | null>(null)
const token = ref('')
const refreshToken = ref('')
const currentUser = ref<LoginResponse | null>(null)
const activePortalTone = ref<PortalTone | null>(null)
const activeRoute = ref('/dashboard')
const activeNavId = ref('dashboard')
const activePrototypeChip = ref('')
const loginError = ref('')
const health = ref('未检查')
const loading = ref(false)
const authActionLoading = ref(false)
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
const doctorPatients = ref<PatientRecord[]>([])
const selectedDoctorPatient = ref<PatientRecord | null>(null)
const doctorPatientOrders = ref<PatientOrderItem[]>([])
const doctorPatientKeyword = ref('')
const doctorPatientsLoading = ref(false)
const doctorPatientError = ref('')
const doctorPatientCreateLoading = ref(false)
const doctorPatientCreateResult = ref('')
const doctorPatientName = ref('')
const doctorPatientAge = ref<number | null>(null)
const doctorPatientGender = ref('UNKNOWN')
const doctorPatientOralDescription = ref('')
const selectedDoctorPatientId = ref<number | null>(null)
const clinics = ref<ClinicItem[]>([])
const selectedClinic = ref<ClinicItem | null>(null)
const clinicPreference = ref<ClinicPreference | null>(null)
const clinicKeyword = ref('')
const clinicLoading = ref(false)
const clinicError = ref('')
const clinicSaveLoading = ref(false)
const clinicSaveResult = ref('')
const clinicCreateName = ref('')
const clinicCreateContactName = ref('')
const clinicCreateContactPhone = ref('')
const doctorAccountSettings = ref<DoctorAccountSettings | null>(null)
const doctorAccountSettingsForm = ref({
  display_name: '',
  contact_email: '',
  contact_phone: '',
  shipping_address: '',
  notification_push_enabled: true
})
const doctorAccountCurrentPassword = ref('')
const doctorAccountNewPassword = ref('')
const doctorAccountLoading = ref(false)
const doctorAccountSaveLoading = ref(false)
const doctorAccountPasswordLoading = ref(false)
const doctorAccountError = ref('')
const doctorAccountResult = ref('')
const clinicPreferenceForm = ref<Record<string, string>>({
  color: '',
  contact: '',
  margin: '',
  shape: '',
  material: '',
  note: ''
})
const doctorOrdersLoading = ref(false)
const doctorOrderError = ref('')
const doctorActionLoading = ref(false)
const doctorMessageDraft = ref('')
const doctorAiQuestion = ref('我的订单现在到哪一步了？')
const doctorAiAnswer = ref('')
const designDraftPreviewUrls = ref<Record<string, string>>({})
const doctorBillPreviewUrl = ref('')
const doctorOrderFormProductType = ref('REGULAR_CROWN')
const doctorOrderFormFields = ref<FormFieldConfig[]>([])
const doctorOrderFormData = ref<Record<string, string | string[]>>({})
const doctorOrderFileIds = ref('')
const doctorOrderEditingId = ref<number | null>(null)
const doctorPreSubmitMissingItems = ref<MissingInfoItem[]>([])
const doctorPreSubmitMissingComplete = ref<boolean | null>(null)
const doctorUploadFiles = ref<File[]>([])
const doctorUploadProgress = ref('')
const doctorUploadCompletedFileIds = ref<number[]>([])
const doctorUploadResumeSessions = ref<Record<string, DoctorUploadResumeSession>>({})
const doctorUploadServerResumeCandidates = ref<MultipartPendingUpload[]>([])
const doctorUploadServerResumeOrderId = ref<number | null>(null)
const doctorUploadLoading = ref(false)
const doctorUploadMaxFileSizeBytes = 209715200
const doctorUploadMaxFilesPerOrder = 30
const doctorUploadAllowedContentTypes = new Set([
  'application/pdf',
  'model/stl',
  'application/sla',
  'application/octet-stream',
  'text/plain',
  'image/png',
  'image/jpeg',
  'application/zip',
  'application/x-zip-compressed'
])
const doctorOrderCreateLoading = ref(false)
const doctorOrderCreateError = ref('')
const doctorOrderCreateResult = ref<CreateOrderResponse | null>(null)
const activeDoctorOrderSection = ref('list')
const activeDoctorDetailTab = ref('info')
const internalOrders = ref<InternalOrderItem[]>([])
const selectedInternalOrder = ref<InternalOrderItem | null>(null)
const internalOrderKeyword = ref('')
const internalOrderStatus = ref('PENDING_CS_REVIEW')
const internalOrdersLoading = ref(false)
const internalOrderError = ref('')
const csProductionNote = ref('')
const csRejectReason = ref('')
const csReviewActionLoading = ref(false)
const csDesignDraftFileIds = ref('')
const csDesignDraftUploadNote = ref('')
const csDesignDraftResult = ref('')
const csDesignDrafts = ref<DesignDraftItem[]>([])
const csDesignDraftPreviewUrls = ref<Record<string, string>>({})
const csBillFileId = ref('')
const csPaymentStatus = ref('PENDING_PAYMENT')
const csBillResult = ref('')
const csPaymentAmountCents = ref<number | null>(null)
const csPaymentMethod = ref('BANK_TRANSFER')
const csPaymentNote = ref('')
const csMissingInfoItems = ref<MissingInfoItem[]>([])
const csMissingInfoComplete = ref<boolean | null>(null)
const csTranslationSourceText = ref('')
const csTranslationDraft = ref('')
const csProductionNoteDraft = ref('')
const csProductionNoteTemplateVersion = ref('')
const csProductionNoteKnowledgeNotes = ref<string[]>([])
const csProductionNoteConfirmationNote = ref('')
const csAiActionLoading = ref(false)
const csAiResult = ref('')
const csAiQueryOrderId = ref('')
const csAiQueryQuestion = ref('请汇总这笔订单当前内部状态、外部状态和客服下一步建议')
const csAiQueryAnswer = ref('')
const csAiQueryReferenceNotes = ref<string[]>([])
const csAiQueryAttachmentContexts = ref<AiAttachmentContext[]>([])
const csAiQueryError = ref('')
const csAiQueryLoading = ref(false)
const aiGovernanceLocalHardening = ref<AiGovernanceLocalHardeningResponse | null>(null)
const aiGovernanceLocalHardeningLoading = ref(false)
const aiGovernanceLocalHardeningError = ref('')
const customerCollaborationPendingMessages = ref<MessageItem[]>([])
const customerCollaborationOrderMessages = ref<MessageItem[]>([])
const customerCollaborationOrderId = ref('')
const selectedCustomerCollaborationMessage = ref<MessageItem | null>(null)
const customerCollaborationReviewAction = ref<'APPROVE' | 'REJECT'>('APPROVE')
const customerCollaborationReviewNote = ref('')
const customerCollaborationLoading = ref(false)
const customerCollaborationActionLoading = ref(false)
const customerCollaborationError = ref('')
const customerCollaborationResult = ref('')
const productionReviewOrders = ref<InternalOrderItem[]>([])
const selectedProductionReviewOrder = ref<InternalOrderItem | null>(null)
const productionReviewKeyword = ref('')
const productionReviewStatus = ref('PENDING_PRODUCTION_REVIEW')
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
const reworkOnlyImpacted = ref(false)
const reworkRecordsLoading = ref(false)
const reworkError = ref('')
const selectedRework = ref<ReworkRecordResponse | null>(null)
const reworkCloseReasonCategory = ref('FIT_ISSUE')
const reworkCloseResponsibilityType = ref('WORKER')
const reworkCloseNote = ref('')
const reworkCloseLoading = ref(false)
const reworkCloseResult = ref<ReworkRecordResponse | null>(null)
const reworkReasonCategories = ref<ReworkDictionaryOption[]>([])
const reworkResponsibilityTypes = ref<ReworkDictionaryOption[]>([])
const reworkDictionaryManageType = ref('REASON_CATEGORY')
const reworkDictionaryManageItems = ref<ReworkDictionaryItem[]>([])
const reworkDictionaryManageLoading = ref(false)
const reworkDictionaryManageSaving = ref(false)
const reworkDictionaryManageError = ref('')
const reworkDictionaryManageResult = ref('')
const reworkDictionaryCreateCode = ref('')
const reworkDictionaryCreateLabel = ref('')
const reworkDictionaryCreateSortOrder = ref(50)
const selectedReworkDictionaryItemId = ref<number | null>(null)
const reworkDictionaryEditLabel = ref('')
const reworkDictionaryEditSortOrder = ref(50)
const reworkDictionaryEditStatus = ref('ACTIVE')
const finalInspectionTasks = ref<WorkerTaskItem[]>([])
const selectedFinalInspectionTask = ref<WorkerTaskItem | null>(null)
const finalInspectionRecords = ref<CheckRecordResponse[]>([])
const finalInspectionRemark = ref('')
const finalInspectionLoading = ref(false)
const finalInspectionResult = ref<CheckRecordResponse | null>(null)
const finalInspectionReport = ref<FinalInspectionReportResponse | null>(null)
const finalInspectionReportSummary = ref('')
const finalInspectionPdfFileId = ref('')
const finalInspectionAttachmentFileIds = ref('')
const finalInspectionReportLoading = ref(false)
const worklogTaskStatus = ref('IN_PROGRESS')
const worklogTasks = ref<WorkerTaskItem[]>([])
const selectedWorklogTask = ref<WorkerTaskItem | null>(null)
const activeWorkLog = ref<WorkLogResponse | null>(null)
const worklogTasksLoading = ref(false)
const worklogActionLoading = ref(false)
const worklogError = ref('')
const performanceStats = ref<PerformanceStatsResponse | null>(null)
const performanceDetails = ref<PerformanceDetailResponse[]>([])
const performanceUserId = ref('')
const performanceStartDate = ref('')
const performanceEndDate = ref('')
const performanceLoading = ref(false)
const performanceError = ref('')
const staffWorkloadItems = ref<StaffWorkloadResponse[]>([])
const staffWorkloadKeyword = ref('')
const staffWorkloadTotal = ref(0)
const staffWorkloadLoading = ref(false)
const staffWorkloadError = ref('')
const productionQualitySummary = ref<ProductionQualitySummaryResponse | null>(null)
const productionQualitySummaryLoading = ref(false)
const productionQualitySummaryError = ref('')
const qualityRecords = ref<QualityRecordResponse[]>([])
const qualityRecordTotal = ref(0)
const qualityRecordOrderId = ref('')
const qualityRecordResponsibilityType = ref('DOCTOR')
const qualityRecordReasonCategory = ref('FIT_ISSUE')
const qualityRecordReasonDetail = ref('')
const qualityRecordStatusId = ref('')
const qualityRecordStatus = ref('IN_PROGRESS')
const qualityRecordStatusNote = ref('')
const qualityRecordLoading = ref(false)
const qualityRecordSaving = ref(false)
const qualityRecordStatusSaving = ref(false)
const qualityRecordError = ref('')
const qualityRecordResult = ref('')
const productionEquipmentSummary = ref<ProductionEquipmentSummaryResponse | null>(null)
const productionEquipmentSummaryLoading = ref(false)
const productionEquipmentSummaryError = ref('')
const productionEquipmentSaving = ref(false)
const productionEquipmentResult = ref('')
const productionEquipmentCreateCode = ref('')
const productionEquipmentCreateName = ref('')
const productionEquipmentCreateType = ref('MILLING_MACHINE')
const productionEquipmentCreateDepartment = ref('生产部')
const productionEquipmentCreateStatus = ref('IDLE')
const productionEquipmentCreateUtilizationRate = ref(0)
const productionEquipmentEventCode = ref('')
const productionEquipmentEventType = ref('FAULT_REPAIR')
const productionEquipmentEventStatus = ref('PENDING')
const productionEquipmentEventDowntimeMinutes = ref(0)
const productionEquipmentEventDescription = ref('')
const productionMaterialExceptionSummary = ref<ProductionMaterialExceptionSummaryResponse | null>(null)
const productionMaterialExceptionSummaryLoading = ref(false)
const productionMaterialExceptionSummaryError = ref('')
const productionMaterialExceptionSaving = ref(false)
const productionMaterialExceptionResult = ref('')
const productionMaterialExceptionCreateNo = ref('')
const productionMaterialExceptionCreateCode = ref('')
const productionMaterialExceptionCreateName = ref('')
const productionMaterialExceptionCreateType = ref('SHORTAGE')
const productionMaterialExceptionCreateStatus = ref('PENDING')
const productionMaterialExceptionCreateResponsibility = ref('')
const productionMaterialExceptionCreateLossQuantity = ref(0)
const productionMaterialExceptionCreateDescription = ref('')
const productionMaterialExceptionStatusNo = ref('')
const productionMaterialExceptionStatus = ref('IN_PROGRESS')
const productionMaterialExceptionStatusResponsibility = ref('')
const productionMaterialExceptionStatusDescription = ref('')
const productionSafetyEnvironmentSummary = ref<ProductionSafetyEnvironmentSummaryResponse | null>(null)
const productionSafetyEnvironmentSummaryLoading = ref(false)
const productionSafetyEnvironmentSummaryError = ref('')
const productionSafetyEnvironmentSaving = ref(false)
const productionSafetyEnvironmentResult = ref('')
const productionSafetyEnvironmentCreateNo = ref('')
const productionSafetyEnvironmentCreateType = ref('HAZARD_RECTIFICATION')
const productionSafetyEnvironmentCreateStatus = ref('PENDING')
const productionSafetyEnvironmentCreateDepartment = ref('')
const productionSafetyEnvironmentCreateOwner = ref('')
const productionSafetyEnvironmentCreateEquipmentCode = ref('')
const productionSafetyEnvironmentCreateRisk = ref('NORMAL')
const productionSafetyEnvironmentCreateDueAt = ref('')
const productionSafetyEnvironmentCreateDescription = ref('')
const productionSafetyEnvironmentStatusNo = ref('')
const productionSafetyEnvironmentStatus = ref('IN_PROGRESS')
const productionSafetyEnvironmentStatusOwner = ref('')
const productionSafetyEnvironmentStatusDescription = ref('')
const productionCostSummary = ref<ProductionCostSummaryResponse | null>(null)
const productionCostSummaryLoading = ref(false)
const productionCostSummaryError = ref('')
const productionCostSaving = ref(false)
const productionCostResult = ref('')
const productionCostCreateNo = ref('')
const productionCostCreateType = ref('LABOR')
const productionCostCreateAmount = ref(0)
const productionCostCreateStatus = ref('NORMAL')
const productionCostCreateDepartment = ref('')
const productionCostCreateSupplier = ref('')
const productionCostCreateDescription = ref('')
const productionRewardPenaltySummary = ref<ProductionRewardPenaltySummaryResponse | null>(null)
const productionRewardPenaltySummaryLoading = ref(false)
const productionRewardPenaltySummaryError = ref('')
const productionRewardPenaltySaving = ref(false)
const productionRewardPenaltyResult = ref('')
const productionRewardPenaltyCreateNo = ref('')
const productionRewardPenaltyCreateType = ref('REWARD')
const productionRewardPenaltyCreateReason = ref('QUALITY')
const productionRewardPenaltyCreateAmount = ref(0)
const productionRewardPenaltyCreateStatus = ref('PENDING')
const productionRewardPenaltyCreateEmployeeUserId = ref<number | null>(null)
const productionRewardPenaltyCreateDepartment = ref('')
const productionRewardPenaltyCreateDescription = ref('')
const productionRewardPenaltyStatusNo = ref('')
const productionRewardPenaltyStatus = ref('APPROVED')
const productionRewardPenaltyStatusDescription = ref('')
const productionBoardOrders = ref<InternalOrderItem[]>([])
const selectedProductionBoardOrder = ref<InternalOrderItem | null>(null)
const productionBoardInstance = ref<ProcessInstanceDetail | null>(null)
const productionBoardKeyword = ref('')
const productionBoardStatus = ref('PROCESS_INSTANCE_CREATED')
const productionBoardLoading = ref(false)
const productionBoardError = ref('')
const productionBoardShippingLoading = ref(false)
const productionBoardLogisticsCarrier = ref('')
const productionBoardLogisticsTrackingNo = ref('')
const productionBoardShippingResult = ref('')
const deliveryOrders = ref<DeliveryOrderItem[]>([])
const selectedDeliveryOrder = ref<DeliveryOrderItem | null>(null)
const deliveryStatusFilter = ref('EXCEPTION')
const deliveryFollowUpStatus = ref('EXCEPTION')
const deliveryFollowUpNote = ref('')
const phaseOneAbDashboardDataLoading = ref(false)
const phaseOneAbDashboardDataError = ref('')
const phaseOneAbDashboardLastSyncedAt = ref('')
const phaseOneAbDashboardOrders = ref<InternalOrderItem[]>([])
const phaseOneAbDashboardPendingMessages = ref<MessageItem[]>([])
const phaseOneAbDashboardDeliveryOrders = ref<DeliveryOrderItem[]>([])
const phaseOneAbDashboardSummary = ref<PhaseOneAbDashboardResponse | null>(null)
const deliveryLoading = ref(false)
const deliverySaving = ref(false)
const deliveryError = ref('')
const deliveryResult = ref('')
const productCatalogKeyword = ref('')
const productCatalogItems = ref<ProductCatalogItem[]>([])
const selectedProductCatalogId = ref<number | null>(null)
const productCatalogLoading = ref(false)
const productCatalogSaving = ref(false)
const productCatalogError = ref('')
const productCatalogResult = ref('')
const productCatalogCreateType = ref('REGULAR_CROWN')
const productCatalogCreateName = ref('')
const productCatalogCreateMaterial = ref('')
const productCatalogCreatePrice = ref(1)
const productCatalogCreateCurrency = ref('CNY')
const productCatalogCreateNote = ref('')
const productCatalogEditName = ref('')
const productCatalogEditMaterial = ref('')
const productCatalogEditPrice = ref(1)
const productCatalogEditCurrency = ref('CNY')
const productCatalogEditStatus = ref('ACTIVE')
const productCatalogEditNote = ref('')
const formConfigProductType = ref('REGULAR_CROWN')
const formConfigFields = ref<FormFieldConfig[]>([])
const formConfigLoading = ref(false)
const formConfigSaving = ref(false)
const formConfigError = ref('')
const formConfigResult = ref('')
const formConfigCreateProductType = ref('REGULAR_CROWN')
const formConfigCreateKey = ref('')
const formConfigCreateLabel = ref('')
const formConfigCreateType = ref('text')
const formConfigCreateRequired = ref(false)
const formConfigCreateOptions = ref('')
const formConfigCreateSortOrder = ref(10)
const selectedFormConfigFieldId = ref<number | null>(null)
const formConfigEditLabel = ref('')
const formConfigEditRequired = ref(false)
const formConfigEditOptions = ref('')
const formConfigEditSortOrder = ref(10)
const formConfigEditStatus = ref('ACTIVE')
let notificationReconnectTimer: number | null = null

const productionBoardStatusOptions: ProductionBoardStatusOption[] = [
  { label: '全部生产状态', value: 'ALL' },
  { label: '待生产审核', value: 'PENDING_PRODUCTION_REVIEW' },
  { label: '医生待确认', value: 'PENDING_DOCTOR_CONFIRM' },
  { label: '已生成工序', value: 'PROCESS_INSTANCE_CREATED' },
  { label: '生产中', value: 'PRODUCING' },
  { label: '已发货', value: 'SHIPPED' },
  { label: '已完成', value: 'COMPLETED' }
]
const formFieldTypeOptions = ['text', 'textarea', 'select', 'multi-select', 'number', 'date', 'file']
const reworkDictionaryTypeOptions = [
  { label: '返工原因', value: 'REASON_CATEGORY' },
  { label: '责任类型', value: 'RESPONSIBILITY_TYPE' }
]
const portalDefaultRoute: Record<LoginPortal, string> = {
  DOCTOR: '/dashboard',
  CS: '/dashboard',
  PRODUCTION: '/dashboard',
  ADMIN: '/dashboard'
}
const portalToneByLoginPortal: Record<LoginPortal, PortalTone> = {
  DOCTOR: 'doctor',
  CS: 'cs',
  PRODUCTION: 'production',
  ADMIN: 'admin'
}
const portalOptions: PortalOption[] = [
  {
    value: 'DOCTOR',
    title: '医生端',
    subtitle: '医生 / 诊所',
    icon: 'stethoscope',
    tone: 'doctor',
    defaultUsername: 'doctor',
    defaultPassword: 'change-me-doctor'
  },
  {
    value: 'CS',
    title: '客服端',
    subtitle: '客服中台',
    icon: 'support_agent',
    tone: 'cs',
    defaultUsername: 'cs',
    defaultPassword: 'change-me-cs'
  },
  {
    value: 'PRODUCTION',
    title: '生产端',
    subtitle: '技工 / 生产人员',
    icon: 'factory',
    tone: 'production',
    defaultUsername: 'worker',
    defaultPassword: 'change-me-worker'
  },
  {
    value: 'ADMIN',
    title: '管理端',
    subtitle: '超级管理员',
    icon: 'admin_panel_settings',
    tone: 'admin',
    defaultUsername: 'admin',
    defaultPassword: 'change-me-admin'
  }
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
const frontendProductizationStateCopy = [
  { title: '加载态', detail: '按钮与表格保留加载反馈，避免重复提交。', tone: 'sky' },
  { title: '空态', detail: '无数据时给出可继续的业务入口。', tone: 'green' },
  { title: '错误态', detail: '接口失败保留错误提示，不吞掉权限或网络问题。', tone: 'rose' },
  { title: '权限拒绝态', detail: '403 / 越权继续由服务端兜底，前端只展示可授权入口。', tone: 'amber' }
]
const displayNavigationConfig: Record<PortalTone, NavigationGroup[]> = {
  doctor: [
    {
      title: '医生端',
      items: [
        { id: 'doctor-dashboard', title: '工作台', description: '查看医生端待办、通知和业务概览。', icon: 'dashboard', routePath: '/dashboard' },
        {
          id: 'doctor-orders',
          title: '订单管理',
          description: '下单、查单、补资料、确认设计稿和查看账单物流。',
          icon: 'doctorOrder',
          routePath: '/doctor/orders',
          doctorSection: 'list',
          children: [
            { id: 'doctor-order-create', title: '新建订单', description: '选择产品类型、填写动态表单并上传病例资料。', icon: 'doctorOrder', routePath: '/doctor/orders', doctorSection: 'create' },
            { id: 'doctor-order-list', title: '我的订单', description: '查看订单列表、公开进度和补资料事项。', icon: 'order', routePath: '/doctor/orders', doctorSection: 'list', doctorDetailTab: 'info' },
            { id: 'doctor-order-design', title: '设计稿确认', description: '查看设计稿版本并确认或驳回。', icon: 'design', routePath: '/doctor/orders', doctorSection: 'design', doctorDetailTab: 'design' },
            { id: 'doctor-order-bill', title: '账单物流', description: '查看账单、承运商和运单号。', icon: 'delivery', routePath: '/doctor/orders', doctorSection: 'bill', doctorDetailTab: 'bill' },
            { id: 'doctor-order-message', title: '沟通留言', description: '在订单内与客服沟通。', icon: 'chat', routePath: '/doctor/orders', doctorSection: 'messages', doctorDetailTab: 'messages' }
          ]
        },
        { id: 'doctor-patients', title: '患者管理', description: '维护患者档案、检索患者并查看绑定历史订单。', icon: 'customer', routePath: '/doctor/patients' },
        { id: 'doctor-ai', title: '订单助手', description: '查询订单进度、预计发货和物流信息。', icon: 'ai', routePath: '/doctor/orders', doctorSection: 'ai', doctorDetailTab: 'ai' },
        { id: 'doctor-notifications', title: '通知中心', description: '查看设计稿、账单、发货和收货通知。', icon: 'notification', routePath: '/notifications' }
      ]
    }
  ],
  cs: [
    {
      title: '客服端',
      items: [
        { id: 'cs-dashboard', title: '工作台', description: '集中查看审核、沟通、发货和客户待办。', icon: 'dashboard', routePath: '/dashboard' },
        {
          id: 'cs-orders',
          title: '订单管理',
          description: '处理待审核订单、补资料、生产备注和内部订单详情。',
          icon: 'order',
          routePath: '/orders/internal',
          children: [
            { id: 'cs-order-review', title: '待审核订单', description: '审核医生提交资料并通过或驳回。', icon: 'order', routePath: '/orders/internal' },
            { id: 'cs-order-all', title: '全部订单', description: '查看客服权限内的内部订单。', icon: 'doctorOrder', routePath: '/orders/internal' }
          ]
        },
        {
          id: 'cs-communication',
          title: '沟通中心',
          description: '处理医生沟通、生产沟通和待审核消息队列。',
          icon: 'chat',
          routePath: '/collaboration',
          children: [
            { id: 'cs-order-messages', title: '订单消息', description: '查看订单内医生、客服、生产沟通。', icon: 'chat', routePath: '/collaboration' },
            { id: 'cs-message-review', title: '待审核消息', description: '审核生产端发给医生的消息。', icon: 'audit', routePath: '/collaboration' }
          ]
        },
        { id: 'cs-customers', title: '客户管理', description: '维护诊所档案、联系人、历史订单和客户偏好。', icon: 'customer', routePath: '/customers' },
        { id: 'cs-products', title: '产品管理', description: '查看产品类型、产品资料和动态表单字段。', icon: 'product', routePath: '/system/form-configs' },
        { id: 'cs-designs', title: '设计稿管理', description: '审核生产端上传的设计稿并发给医生确认。', icon: 'design', routePath: '/orders/internal' },
        { id: 'cs-billing', title: '账单管理', description: '上传账单文件、查看订单费用和客户账单。', icon: 'bill', routePath: '/delivery' },
        { id: 'cs-delivery', title: '配送管理', description: '录入承运商、运单号并跟进待发货订单。', icon: 'delivery', routePath: '/delivery' },
        { id: 'cs-outsourcing', title: '外协管理', description: '跟踪外协订单、外协工厂、外协进度和费用。', icon: 'partner', routePath: '/outsourcing', placeholder: true },
        {
          id: 'cs-ai',
          title: '智能助手',
          description: '使用翻译、资料缺失检查和客服查询能力。',
          icon: 'ai',
          routePath: '/ai/cs',
          children: [
            { id: 'cs-ai-translate', title: '翻译助手', description: '把外文描述整理成中文生产指令草稿。', icon: 'ai', routePath: '/orders/internal' },
            { id: 'cs-ai-query', title: '客服查询助手', description: '查询内部订单、工序、客户偏好和物流。', icon: 'ai', routePath: '/ai/cs' },
            { id: 'cs-ai-note', title: '生产备注助手', description: '整理客户要求并生成生产备注草稿。', icon: 'ai', routePath: '/ai/production', placeholder: true }
          ]
        },
        { id: 'cs-notifications', title: '通知中心', description: '查看订单、消息、设计稿和预算通知。', icon: 'notification', routePath: '/notifications' }
      ]
    }
  ],
  production: [
    {
      title: '生产执行',
      items: [
        { id: 'production-dashboard', title: '工作台', description: '集中查看本人任务、异常提醒和生产待办。', icon: 'dashboard', routePath: '/dashboard' },
        { id: 'production-orders', title: '生产订单', description: '查看待生产、生产异常和待发货订单。', icon: 'order', routePath: '/production/board' },
        { id: 'production-board', title: '生产看板', description: '跨状态查看生产订单、节点进度和终检发货门禁。', icon: 'dashboard', routePath: '/production/board' },
        { id: 'production-tasks', title: '我的任务', description: '处理分配给当前员工的工序任务。', icon: 'task', routePath: '/tasks/mine' },
        { id: 'production-scan', title: '扫码登记', description: '通过扫码记录入检、开工、暂停、完工和流转节点。', icon: 'scan', routePath: '/production/scan', placeholder: true }
      ]
    },
    {
      title: '质量与返工',
      items: [
        {
          id: 'production-quality',
          title: '质量与返工',
          description: '查看质量总览、返工处理和终检报告。',
          icon: 'quality',
          routePath: '/production/quality',
          children: [
            { id: 'production-quality-overview', title: '质量总览', description: '查看总返工率、一次通过率、终检通过率、投诉率和退货率。', icon: 'quality', routePath: '/production/quality' },
            { id: 'production-rework-management', title: '返工管理', description: '统一处理内返、外返、原因、责任归属和处理状态。', icon: 'quality', routePath: '/rework-final' },
            { id: 'production-final-report', title: '终检报告', description: '查看终检报告生成、结论、摘要和报告状态。', icon: 'report', routePath: '/production/final-inspection-reports', placeholder: true }
          ]
        }
      ]
    },
    {
      title: '人员绩效',
      items: [
        { id: 'production-staff', title: '员工管理', description: '查看生产人员、岗位能力、在岗状态和任务负载。', icon: 'staff', routePath: '/production/staff' },
        { id: 'production-performance', title: '绩效管理', description: '查看有效工时、完成数量、返工次数和通过率。', icon: 'performance', routePath: '/performance' },
        { id: 'production-reward-penalty', title: '奖惩管理', description: '维护奖惩记录、原因、关联订单/工序/员工和审批状态。', icon: 'reward', routePath: '/production/reward-penalty' }
      ]
    },
    {
      title: '设备物料',
      items: [
        { id: 'production-device', title: '设备管理', description: '查看设备台账、设备状态、保养计划、故障报修和稼动率。', icon: 'device', routePath: '/production/devices' },
        { id: 'production-material', title: '物料管理', description: '登记缺料、错料、批次异常、材料损耗和处理状态。', icon: 'material', routePath: '/production/material-exceptions' }
      ]
    },
    {
      title: '经营成本',
      items: [
        { id: 'production-cost', title: '成本管理', description: '查看工序、材料、人工、返工、外协成本和异常预警。', icon: 'cost', routePath: '/production/cost-management' },
        { id: 'production-outsourcing-cost', title: '外协成本', description: '跟踪外协订单成本、外协供应商费用和成本偏差。', icon: 'partner', routePath: '/production/outsourcing-cost', placeholder: true }
      ]
    },
    {
      title: '安全合规',
      items: [
        { id: 'production-safety', title: '安环管理', description: '管理安全巡检、隐患整改、环境记录和安环事件统计。', icon: 'safety', routePath: '/production/safety-environment' }
      ]
    },
    {
      title: '协同消息',
      items: [
        { id: 'production-message', title: '消息中心', description: '查看客服消息、订单消息和审核状态。', icon: 'chat', routePath: '/production/messages', placeholder: true },
        { id: 'production-cloud-data', title: '云端数据中心', description: '查看设计稿、口扫数据、生产附件和云端同步状态。', icon: 'cloud', routePath: '/production/cloud-data', placeholder: true }
      ]
    }
  ],
  admin: [
    {
      title: '管理端',
      items: [
        { id: 'admin-dashboard', title: '工作台', description: '查看平台管理总览和关键待办。', icon: 'dashboard', routePath: '/dashboard' },
        {
          id: 'admin-account',
          title: '账号权限',
          description: '管理用户、角色、权限范围和菜单可见性。',
          icon: 'system',
          routePath: '/system/rbac',
          placeholder: true,
          children: [
            { id: 'admin-users', title: '用户管理', description: '创建账号、维护账号状态和所属诊所。', icon: 'customer', routePath: '/system/rbac/users', placeholder: true },
            { id: 'admin-roles', title: '角色权限', description: '维护角色、权限范围和菜单可见性。', icon: 'system', routePath: '/system/rbac/roles', placeholder: true }
          ]
        },
        { id: 'admin-customers', title: '客户诊所', description: '管理诊所档案、客户偏好和联系人。', icon: 'customer', routePath: '/admin/clinics' },
        {
          id: 'admin-products',
          title: '产品配置',
          description: '维护产品类型、动态表单、返工字典和产品资料。',
          icon: 'product',
          routePath: '/system/form-configs',
          children: [
            { id: 'admin-form-configs', title: '动态表单', description: '维护医生下单表单字段。', icon: 'dynamic_form', routePath: '/system/form-configs' },
            { id: 'admin-rework-dictionaries', title: '返工字典', description: '维护返工原因与责任类型。', icon: 'dictionary', routePath: '/system/rework-dictionaries' }
          ]
        },
        {
          id: 'admin-workflow',
          title: '工艺生产',
          description: '查看工序链、工序进度并执行员工派工。',
          icon: 'process',
          routePath: '/workflow/process-instance',
          children: [
            { id: 'admin-workflow-chain', title: '工序链查看', description: '查看九条预定义工序链和节点顺序。', icon: 'process', routePath: '/workflow/process-instance' },
            { id: 'admin-process-progress', title: '工序进度', description: '查看订单实例化后的节点状态。', icon: 'account_tree', routePath: '/workflow/process-instance' },
            { id: 'admin-workflow-assign', title: '员工派工', description: '为工序节点绑定员工或调整执行人。', icon: 'staff', routePath: '/workflow/assign' }
          ]
        },
        { id: 'admin-staff', title: '人员管理', description: '管理生产人员、岗位能力和任务负载。', icon: 'staff', routePath: '/admin/staff' },
        { id: 'admin-device', title: '设备管理', description: '管理设备档案、运行状态和维护记录。', icon: 'device', routePath: '/admin/devices', placeholder: true },
        { id: 'admin-material', title: '物料管理', description: '查看物料缺失、材料不符和异常处理。', icon: 'material', routePath: '/admin/material-exceptions', placeholder: true },
        { id: 'admin-outsourcing', title: '外协管理', description: '管理外协工厂、外协订单和外协费用。', icon: 'partner', routePath: '/admin/outsourcing', placeholder: true },
        { id: 'admin-billing-delivery', title: '账单配送', description: '查看账单、物流和发货协同状态。', icon: 'delivery', routePath: '/admin/billing-delivery', placeholder: true },
        { id: 'admin-performance', title: '绩效统计', description: '查看全员工时、绩效指标和返工归因。', icon: 'performance', routePath: '/performance' },
        { id: 'admin-audit', title: '审计通知', description: '查看关键操作、通知和系统安全事件。', icon: 'audit', routePath: '/notifications' },
        { id: 'admin-ai', title: 'AI 治理', description: '查看模型调用、预算、失败和治理摘要。', icon: 'ai', routePath: '/admin/ai-governance' }
      ]
    }
  ]
}
const accountNavigationConfig: Record<PortalTone, NavigationGroup[]> = {
  doctor: [
    {
      title: '账号管理',
      items: [
        { id: 'doctor-account-settings', title: '账户设置', description: '维护联系方式、收货地址、消息推送和密码。', icon: 'lock', routePath: '/doctor/account/settings' },
        { id: 'doctor-account-clinic', title: '诊所信息', description: '查看所属诊所、联系人、地址和开票资料。', icon: 'customer', routePath: '/doctor/account/clinic' },
        { id: 'doctor-account-members', title: '医生/成员账号', description: '查看诊所医生、助手和成员账号状态。', icon: 'person', routePath: '/doctor/account/members', placeholder: true },
        { id: 'doctor-account-notifications', title: '通知偏好', description: '设置设计稿、账单、物流和收货提醒偏好。', icon: 'notification', routePath: '/doctor/account/notifications', placeholder: true },
        { id: 'doctor-account-security', title: '密码安全', description: '维护登录密码、账号安全和登录记录。', icon: 'lock', routePath: '/doctor/account/security', placeholder: true }
      ]
    }
  ],
  cs: [
    {
      title: '账号管理',
      items: [
        { id: 'cs-account-profile', title: '客服账号', description: '查看客服账号资料、团队和服务范围。', icon: 'support_agent', routePath: '/cs/account/profile', placeholder: true },
        { id: 'cs-account-assignment', title: '客户分配', description: '查看负责诊所、客户分层和跟进负责人。', icon: 'customer', routePath: '/cs/account/assignment', placeholder: true },
        { id: 'cs-account-replies', title: '常用回复', description: '维护客服沟通模板、补资料提醒和账单通知话术。', icon: 'chat', routePath: '/cs/account/replies', placeholder: true },
        { id: 'cs-account-notifications', title: '通知偏好', description: '设置订单审核、客户消息和预算通知提醒。', icon: 'notification', routePath: '/cs/account/notifications', placeholder: true }
      ]
    }
  ],
  production: [
    {
      title: '账号管理',
      items: [
        { id: 'production-account-profile', title: '员工资料', description: '查看员工编号、班组、联系方式和在岗状态。', icon: 'staff', routePath: '/production/account/profile', placeholder: true },
        { id: 'production-account-department', title: '所属部门', description: '查看生产部门、班组和现场负责人。', icon: 'factory', routePath: '/production/account/department', placeholder: true },
        { id: 'production-account-position', title: '岗位/工序', description: '查看岗位能力、可执行工序和当前任务范围。', icon: 'process', routePath: '/production/account/position', placeholder: true },
        { id: 'production-account-performance', title: '绩效入口', description: '进入本人绩效、工时、质量和奖惩摘要。', icon: 'performance', routePath: '/performance' },
        { id: 'production-account-security', title: '账号安全', description: '维护密码安全、登录记录和账号状态。', icon: 'lock', routePath: '/production/account/security', placeholder: true }
      ]
    }
  ],
  admin: [
    {
      title: '账号管理',
      items: [
        { id: 'admin-account-users', title: '用户管理', description: '管理医生、客服、生产和管理账号。', icon: 'customer', routePath: '/system/rbac/users', placeholder: true },
        { id: 'admin-account-roles', title: '角色权限', description: '维护角色、权限范围、菜单和数据范围。', icon: 'system', routePath: '/system/rbac/roles', placeholder: true },
        { id: 'admin-account-departments', title: '部门岗位', description: '维护组织、部门、岗位和员工归属。', icon: 'staff', routePath: '/system/rbac/departments', placeholder: true },
        { id: 'admin-account-status', title: '账号状态', description: '查看账号启停、锁定、异常登录和安全状态。', icon: 'audit', routePath: '/system/rbac/status', placeholder: true }
      ]
    }
  ]
}
const placeholderContentMap: Record<string, PlaceholderContentItem[]> = {
  'production-work-orders': [
    { title: '工序任务详情', detail: '展示订单号、产品类型、工序节点、标准工时和交付时间。', tone: 'teal' },
    { title: '操作要求', detail: '沉淀每个节点的操作规范、注意事项和质检要求。', tone: 'sky' },
    { title: '负责人', detail: '显示当前员工、班组负责人和待交接状态。', tone: 'green' }
  ],
  'production-scan': [
    { title: '扫码入检', detail: '扫码登记入检、开工、暂停、完工和出检节点。', tone: 'teal' },
    { title: '流转追踪', detail: '记录订单在工序间的流转时间和异常停留。', tone: 'sky' },
    { title: '异常提示', detail: '对错扫、漏扫、重复扫码和超时节点给出提醒。', tone: 'amber' }
  ],
  'production-quality': [
    { title: '总返工率', detail: '汇总内部返修与外部退回返修的总体比例。', tone: 'rose' },
    { title: '内返率', detail: '统计工厂内部发现并返修的比例、原因和责任归属。', tone: 'amber' },
    { title: '外返率', detail: '统计医生或客户退回返修的比例、投诉和退货关联情况。', tone: 'orange' },
    { title: '一次通过率', detail: '查看各工序一次通过情况和低通过率环节。', tone: 'green' },
    { title: '终检通过率', detail: '查看终检出检通过比例和未通过原因。', tone: 'teal' },
    { title: '投诉率 / 退货率', detail: '关联客户投诉、退货和质量复盘记录。', tone: 'violet' }
  ],
  'production-quality-overview': [
    { title: '总返工率', detail: '同时统计内返率与外返率，不把两类返工混成单一指标。', tone: 'rose' },
    { title: '内返率', detail: '统计工厂内部发现并返修的比例、原因和责任归属。', tone: 'amber' },
    { title: '外返率', detail: '统计医生或客户退回返修的比例、投诉和退货关联情况。', tone: 'orange' },
    { title: '一次通过率', detail: '按工序、员工和产品类型查看一次通过表现。', tone: 'green' },
    { title: '终检通过率', detail: '查看终检出检通过比例和异常趋势。', tone: 'teal' },
    { title: '投诉率 / 退货率', detail: '追踪客户投诉、退货原因和质量闭环。', tone: 'violet' }
  ],
  'production-rework-management': [
    { title: '内返率', detail: '内部质检发现返修的订单数 / 内部完成订单数。', tone: 'amber' },
    { title: '外返率', detail: '医生或客户退回返修的订单数 / 已交付订单数。', tone: 'rose' },
    { title: '返工记录', detail: '统一查看内返、外返、返工原因、责任归属和处理状态。', tone: 'orange' },
    { title: '责任归属', detail: '关联责任分类、返工记录和绩效扣减依据。', tone: 'violet' },
    { title: '闭环处理', detail: '跟踪返工处理状态、补救方案和医生/客户确认结果。', tone: 'teal' }
  ],
  'production-final-report': [
    { title: '报告状态', detail: '展示待生成、已生成、已复核和已归档终检报告。', tone: 'teal' },
    { title: '终检结论', detail: '记录终检通过结论、摘要、异常项和附件。', tone: 'green' },
    { title: '报告追溯', detail: '关联最终节点、终检记录、订单和发货状态。', tone: 'sky' }
  ],
  'production-reward-penalty': [
    { title: '奖惩记录', detail: '记录奖励、扣罚、表扬、警示和整改事项。', tone: 'green' },
    { title: '奖惩原因', detail: '维护质量、效率、纪律、安环和客户反馈等原因。', tone: 'amber' },
    { title: '关联对象', detail: '关联订单、工序、员工、班组和审批人。', tone: 'sky' },
    { title: '审批状态', detail: '跟踪草稿、待审批、已通过、已驳回和已生效。', tone: 'violet' },
    { title: '月度汇总', detail: '按员工和班组汇总奖惩次数、金额和绩效影响。', tone: 'teal' }
  ],
  'production-device': [
    { title: '设备台账', detail: '维护设备编号、型号、位置、责任人和启用状态。', tone: 'teal' },
    { title: '设备状态', detail: '查看运行、待机、保养、故障和停机状态。', tone: 'sky' },
    { title: '保养计划', detail: '安排周期保养、点检项目和保养提醒。', tone: 'green' },
    { title: '故障报修', detail: '记录故障原因、报修进度、维修结果和停机时长。', tone: 'rose' },
    { title: '设备稼动率', detail: '按设备统计开机时间、有效加工时间和利用率。', tone: 'violet' }
  ],
  'production-material': [
    { title: '缺料', detail: '记录缺料订单、影响工序和预计到料时间。', tone: 'amber' },
    { title: '错料', detail: '登记材料不符、规格错误和纠正处理。', tone: 'rose' },
    { title: '批次异常', detail: '追踪批次号、供应商、检测结果和召回范围。', tone: 'orange' },
    { title: '材料损耗', detail: '统计工序损耗、返工损耗和异常消耗。', tone: 'violet' },
    { title: '处理状态 / 责任归属', detail: '跟踪待处理、处理中、已关闭以及责任部门。', tone: 'teal' }
  ],
  'production-cost': [
    { title: '工序成本', detail: '按工序统计标准成本、实际成本和偏差。', tone: 'teal' },
    { title: '材料成本', detail: '统计材料用量、损耗和批次成本。', tone: 'amber' },
    { title: '人工成本', detail: '关联工时记录、岗位工价和绩效成本。', tone: 'sky' },
    { title: '返工成本', detail: '拆分内返成本、外返成本和责任归因。', tone: 'rose' },
    { title: '外协成本', detail: '跟踪外协供应商、外协订单和结算偏差。', tone: 'violet' },
    { title: '成本异常预警', detail: '识别超预算、异常损耗和高返工成本订单。', tone: 'orange' }
  ],
  'production-outsourcing-cost': [
    { title: '外协订单成本', detail: '记录外协项目、供应商报价和实际结算成本。', tone: 'violet' },
    { title: '供应商费用', detail: '按供应商查看加工费、物流费和异常扣款。', tone: 'sky' },
    { title: '成本偏差', detail: '追踪预计成本与实际结算差异。', tone: 'amber' }
  ],
  'production-safety': [
    { title: '安全巡检', detail: '记录班前、班中、班后安全巡检事项。', tone: 'sky' },
    { title: '隐患整改', detail: '跟踪隐患描述、责任人、整改期限和复查结果。', tone: 'orange' },
    { title: '环境记录', detail: '登记温湿度、粉尘、噪音和清洁消毒记录。', tone: 'teal' },
    { title: 'PPE/设备安全提醒', detail: '提醒防护用品佩戴、设备防护和操作安全。', tone: 'green' },
    { title: '安环事件统计', detail: '按事件类型、班组、设备和整改状态汇总。', tone: 'rose' }
  ],
  'production-cloud-data': [
    { title: '云端病例资料', detail: '查看口扫、照片、处方和生产附件同步状态。', tone: 'sky' },
    { title: '设计数据', detail: '跟踪设计稿上传、审核、医生确认和版本记录。', tone: 'violet' },
    { title: '同步异常', detail: '提示文件缺失、同步失败和待重新上传项目。', tone: 'rose' }
  ],
  'doctor-account-clinic': [
    { title: '诊所信息', detail: '展示诊所名称、联系人、地址、开票资料和服务偏好。', tone: 'blue' },
    { title: '成员范围', detail: '仅展示诊所成员账号，不展示生产员工、工序或绩效信息。', tone: 'green' }
  ],
  'doctor-account-members': [
    { title: '医生/成员账号', detail: '查看医生、助手和诊所成员账号状态。', tone: 'blue' },
    { title: '权限说明', detail: '仅管理诊所端可见资料和通知偏好。', tone: 'green' }
  ],
  'doctor-account-notifications': [
    { title: '通知偏好', detail: '设置设计稿确认、账单、物流和收货提醒。', tone: 'blue' },
    { title: '消息渠道', detail: '后续接入短信、邮件或企业微信前先保留占位。', tone: 'sky' }
  ],
  'doctor-account-security': [
    { title: '密码安全', detail: '维护密码、登录记录和账号安全提醒。', tone: 'blue' },
    { title: '账号保护', detail: '不展示内部生产角色、工序、员工或绩效信息。', tone: 'green' }
  ],
  'cs-account-profile': [
    { title: '客服账号', detail: '查看客服资料、团队和服务范围。', tone: 'violet' },
    { title: '客户服务', detail: '展示客户分配、常用回复和通知偏好入口。', tone: 'sky' }
  ],
  'cs-account-assignment': [
    { title: '客户分配', detail: '查看负责诊所、客户分层和跟进负责人。', tone: 'violet' },
    { title: '服务范围', detail: '后续可按客服团队和客户类型配置。', tone: 'sky' }
  ],
  'cs-account-replies': [
    { title: '常用回复', detail: '维护补资料提醒、账单通知和设计稿确认话术。', tone: 'violet' },
    { title: '模板分类', detail: '按订单、资料、设计、账单和物流分类管理。', tone: 'amber' }
  ],
  'cs-account-notifications': [
    { title: '通知偏好', detail: '设置审核、客户消息、设计稿和预算通知提醒。', tone: 'violet' },
    { title: '提醒范围', detail: '后续可按客户、订单类型和异常级别配置。', tone: 'sky' }
  ],
  'production-account-profile': [
    { title: '员工资料', detail: '展示员工编号、班组、联系方式和在岗状态。', tone: 'teal' },
    { title: '生产身份', detail: '展示生产部门、岗位工序和当前任务范围。', tone: 'sky' }
  ],
  'production-account-department': [
    { title: '所属部门', detail: '查看生产部门、班组、现场负责人和排班信息。', tone: 'teal' },
    { title: '班组协同', detail: '后续关联班组任务、设备和产能负载。', tone: 'green' }
  ],
  'production-account-position': [
    { title: '岗位/工序', detail: '展示岗位能力、可执行工序和授权操作范围。', tone: 'teal' },
    { title: '当前任务', detail: '后续关联本人任务、扫码登记和质量记录。', tone: 'amber' }
  ],
  'production-account-security': [
    { title: '账号安全', detail: '维护密码、安全提醒、登录记录和账号状态。', tone: 'teal' },
    { title: '操作边界', detail: '生产账号仍按当前登录权限和菜单范围访问。', tone: 'green' }
  ],
  'admin-account-users': [
    { title: '用户管理', detail: '管理医生、客服、生产和管理账号。', tone: 'blue' },
    { title: '账号状态', detail: '维护启用、停用、锁定和异常账号。', tone: 'amber' }
  ],
  'admin-account-roles': [
    { title: '角色权限', detail: '维护角色、权限范围、菜单和数据范围。', tone: 'blue' },
    { title: '权限审计', detail: '后续联动账号、部门和菜单授权记录。', tone: 'violet' }
  ],
  'admin-account-departments': [
    { title: '部门岗位', detail: '维护组织、部门、岗位和员工归属。', tone: 'blue' },
    { title: '岗位能力', detail: '后续联动生产工序、人员排班和绩效归属。', tone: 'green' }
  ],
  'admin-account-status': [
    { title: '账号状态', detail: '查看账号启停、锁定、异常登录和安全状态。', tone: 'blue' },
    { title: '安全处理', detail: '后续接入风险账号提醒和处理记录。', tone: 'rose' }
  ]
}
const navigationGroups = computed<NavigationGroup[]>(() => displayNavigationConfig[portalTone.value])
const accountNavigationGroups = computed<NavigationGroup[]>(() => accountNavigationConfig[portalTone.value])
const visiblePermissions = computed(() => currentUser.value?.permissions.slice().sort() ?? [])
const hasUnreadNotifications = computed(() => unreadCount.value > 0)
function phaseOnePercent(value: number | null | undefined) {
  const normalized = Number(value ?? 0)
  if (!Number.isFinite(normalized)) {
    return 0
  }
  return Math.max(0, Math.min(100, Math.round(normalized)))
}
function phaseOneProgress(value: number | null | undefined) {
  return Math.max(8, phaseOnePercent(value))
}
function estimatePhaseOneOrderItemCount(order: InternalOrderItem) {
  const form = order.form_data ?? {}
  const candidateKeys = ['quantity', 'qty', 'case_count', 'item_count', 'teeth_count', 'tooth_count']
  for (const key of candidateKeys) {
    const value = form[key]
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value
    }
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed
      }
    }
  }
  const toothNumbers = form.tooth_numbers
  if (Array.isArray(toothNumbers) && toothNumbers.length > 0) {
    return toothNumbers.length
  }
  return 1
}
function countOrdersByStatus(orders: InternalOrderItem[], statuses: string[]) {
  const statusSet = new Set(statuses)
  return orders.filter((order) => statusSet.has(order.internal_status) || statusSet.has(order.external_status)).length
}
function countDeliveryByStatus(orders: DeliveryOrderItem[], statuses: string[]) {
  const statusSet = new Set(statuses)
  return orders.filter((order) => statusSet.has(order.logistics_status) || statusSet.has(order.payment_status)).length
}
function topPhaseOneCustomerRanking(orders: InternalOrderItem[]): PhaseOneAbCustomerRanking {
  const dashboardRanking = phaseOneAbDashboardSummary.value?.top_customers[0]
  if (dashboardRanking) {
    return {
      clinicId: dashboardRanking.clinic_id,
      clinicName: dashboardRanking.clinic_name,
      orderCount: dashboardRanking.order_count,
      itemCount: dashboardRanking.item_count
    }
  }
  const ranking = new Map<string, number>()
  for (const order of orders) {
    const clinicName = order.clinic_name || `诊所 ${order.clinic_id}`
    ranking.set(clinicName, (ranking.get(clinicName) ?? 0) + 1)
  }
  const [clinicName, orderCount] = [...ranking.entries()].sort((left, right) => right[1] - left[1])[0] ?? ['暂无客户数据', 0]
  return { clinicName, orderCount }
}
const phaseOneAbMonthlyComparison = computed(() => {
  const summary = phaseOneAbDashboardSummary.value
  if (!summary) {
    return {
      orderLabel: '本地月度趋势接口待同步',
      productionLabel: '本地月度趋势接口待同步',
      orderPercent: 8,
      productionPercent: 8
    }
  }
  const direction = summary.monthly_order_delta >= 0 ? '+' : ''
  const itemDirection = summary.monthly_item_delta >= 0 ? '+' : ''
  return {
    orderLabel: `${summary.current_month.order_count} 单 / ${direction}${summary.monthly_order_delta} 单`,
    productionLabel: `${summary.current_month.item_count} 件 / ${itemDirection}${summary.monthly_item_delta} 件`,
    orderPercent: phaseOneProgress(summary.current_month.order_count * 4),
    productionPercent: phaseOneProgress(summary.current_month.item_count * 3)
  }
})
const phaseOneAbCsDashboardStats = computed(() => {
  const orders = phaseOneAbDashboardOrders.value
  const deliveryOrdersForDashboard = phaseOneAbDashboardDeliveryOrders.value
  const pendingMessages = phaseOneAbDashboardPendingMessages.value
  const customerRanking = topPhaseOneCustomerRanking(orders)
  const orderCount = orders.length
  const itemCount = orders.reduce((total, order) => total + estimatePhaseOneOrderItemCount(order), 0)
  const billManualFollowUpCount = deliveryOrdersForDashboard.filter((order) =>
    !['PAID', 'SETTLED'].includes(order.payment_status)
  ).length
  const logisticsManualFollowUpCount = deliveryOrdersForDashboard.filter((order) =>
    ['PENDING', 'EXCEPTION', 'FOLLOWING'].includes(order.logistics_status)
  ).length
  const source: PhaseOneAbDashboardSource = phaseOneAbDashboardDataError.value ? 'partial' : 'reused-api'
  return {
    source,
    orderCount: phaseOneAbDashboardSummary.value?.current_month.order_count ?? orderCount,
    itemCount: phaseOneAbDashboardSummary.value?.current_month.item_count ?? itemCount,
    pendingReviewCount: countOrdersByStatus(orders, ['PENDING_CS_REVIEW', 'CS_REJECTED']),
    pendingMessageReviewCount: pendingMessages.length,
    pendingReplyCount: unreadCount.value,
    designUpdateCount: countOrdersByStatus(orders, ['DESIGN_UPLOADED', 'PENDING_DOCTOR_CONFIRM']),
    shipmentFollowUpCount: countDeliveryByStatus(deliveryOrdersForDashboard, ['SHIPPED', 'IN_TRANSIT', 'DELIVERED']),
    billManualFollowUpCount,
    logisticsManualFollowUpCount,
    reworkFollowUpCount: productionQualitySummary.value?.external_rework_count ?? 0,
    customerRanking
  }
})
const phaseOneAbProductionDashboardStats = computed(() => {
  const orders = phaseOneAbDashboardOrders.value
  const deliveryOrdersForDashboard = phaseOneAbDashboardDeliveryOrders.value
  const qualitySummary = productionQualitySummary.value
  const shippedCount = countDeliveryByStatus(deliveryOrdersForDashboard, ['SHIPPED', 'IN_TRANSIT', 'DELIVERED'])
  const deliveryTotal = deliveryOrdersForDashboard.length
  const completedCount = countOrdersByStatus(orders, ['COMPLETED', 'SHIPPED', 'RECEIVED'])
  const source: PhaseOneAbDashboardSource = phaseOneAbDashboardDataError.value ? 'partial' : 'reused-api'
  return {
    source,
    productionExceptionCount: phaseOneAbDashboardSummary.value?.production_exception_count ?? countOrdersByStatus(orders, [
      'PENDING_PRODUCTION_REVIEW',
      'PROCESS_INSTANCE_CREATED',
      'PRODUCING',
      'REWORKING'
    ]),
    pendingQuestionCount: phaseOneAbDashboardSummary.value?.pending_question_count
      ?? phaseOneAbDashboardPendingMessages.value.length + countOrdersByStatus(orders, ['PENDING_DOCTOR_CONFIRM']),
    staffExceptionCount: staffWorkloadItems.value.filter((item) => item.active_node_count > 0 && item.completed_work_log_count === 0).length,
    totalReworkCount: qualitySummary?.total_rework_count ?? 0,
    internalReworkCount: qualitySummary?.internal_rework_count ?? 0,
    externalReworkCount: qualitySummary?.external_rework_count ?? 0,
    equipmentExceptionCount: (productionEquipmentSummary.value?.open_fault_count ?? 0) + (productionEquipmentSummary.value?.pending_maintenance_count ?? 0),
    materialPendingCount: (productionMaterialExceptionSummary.value?.pending_count ?? 0) + (productionMaterialExceptionSummary.value?.in_progress_count ?? 0),
    safetyTodoCount: (productionSafetyEnvironmentSummary.value?.pending_count ?? 0) + (productionSafetyEnvironmentSummary.value?.in_progress_count ?? 0) + (productionSafetyEnvironmentSummary.value?.overdue_count ?? 0),
    costWarningCount: productionCostSummary.value?.abnormal_warning_count ?? 0,
    rewardPendingCount: productionRewardPenaltySummary.value?.pending_count ?? 0,
    shippingRate: phaseOneAbDashboardSummary.value?.shipping_rate
      ?? (deliveryTotal > 0 ? Math.round((shippedCount / deliveryTotal) * 100) : 0),
    completionRate: phaseOneAbDashboardSummary.value?.completion_rate
      ?? (orders.length > 0 ? Math.round((completedCount / orders.length) * 100) : 0),
    firstPassRate: qualitySummary?.first_pass_rate ?? 0,
    finalPassRate: qualitySummary?.final_pass_rate ?? 0,
    totalReworkRate: qualitySummary?.total_rework_rate ?? 0,
    internalReworkRate: qualitySummary?.internal_rework_rate ?? 0,
    externalReworkRate: qualitySummary?.external_rework_rate ?? 0
  }
})
const phaseOneAbDashboardSourceNote = computed(() => {
  if (phaseOneAbDashboardDataError.value) {
    return phaseOneAbDashboardDataError.value
  }
  if (phaseOneAbDashboardLastSyncedAt.value) {
    const source = phaseOneAbDashboardSummary.value?.source_note ?? '复用本地接口'
    return `${source}：${compactDateTime(phaseOneAbDashboardLastSyncedAt.value)}`
  }
  return '登录后同步本地接口数据'
})
const businessOverviewCards = computed<BusinessCard[]>(() => {
  const roleText = roleLabels(currentUser.value?.roles)
  const menuCount = String(businessShortcuts.value.length)
  const unreadText = String(unreadCount.value)
  const systemState = notificationSocketStatus.value === '已连接' ? '在线' : '待连接'
  const base: Record<PortalTone, BusinessCard[]> = {
    doctor: [
      { title: '账号角色', value: roleText, note: dataScopeLabel(currentUser.value?.dataScope), icon: 'customer' },
      { title: '可办业务', value: menuCount, note: '按当前账号展示', icon: 'dashboard' },
      { title: '未读通知', value: unreadText, note: notificationSocketStatus.value, icon: 'notification' },
      { title: '重点事项', value: '设计稿', note: '关注确认、账单与物流', icon: 'design' }
    ],
    cs: [
      { title: '账号角色', value: roleText, note: dataScopeLabel(currentUser.value?.dataScope), icon: 'customer' },
      { title: '订单协同', value: menuCount, note: '审核、沟通、发货联动', icon: 'order' },
      { title: '未读通知', value: unreadText, note: notificationSocketStatus.value, icon: 'notification' },
      { title: '客服统计基础版', value: phaseOneAbCsDashboardStats.value.source === 'reused-api' ? '接口数据' : 'PARTIAL', note: '复用 /orders 列表、待审消息和物流人工状态', icon: 'chat' }
    ],
    production: [
      { title: '账号角色', value: roleText, note: dataScopeLabel(currentUser.value?.dataScope), icon: 'staff' },
      { title: '生产任务', value: menuCount, note: '任务、工序、质检联动', icon: 'task' },
      { title: '未读通知', value: unreadText, note: notificationSocketStatus.value, icon: 'notification' },
      { title: '现场状态', value: systemState, note: '质检、设备、物料、安环汇总第一增量', icon: 'device' }
    ],
    admin: [
      { title: '账号角色', value: roleText, note: dataScopeLabel(currentUser.value?.dataScope), icon: 'system' },
      { title: '管理模块', value: menuCount, note: '按后台权限展示', icon: 'dashboard' },
      { title: '未读通知', value: unreadText, note: notificationSocketStatus.value, icon: 'notification' },
      { title: '系统状态', value: systemState, note: '权限、工序、人员统一管理', icon: 'audit' }
    ]
  }
  return base[portalTone.value]
})

const prototypeDashboards = computed<Record<PortalTone, PrototypeDashboard>>(() => {
  const unreadText = String(unreadCount.value)
  return {
    doctor: {
      greeting: '早上好，医生',
      subtitle: '今日订单、设计稿、账单物流和补资料事项集中查看。',
      primaryAction: {
        title: '新建订单',
        detail: '填写动态表单并上传病例资料',
        meta: '医生端主操作',
        tone: 'blue',
        actionLabel: '进入',
        routePath: '/doctor/orders',
        navId: 'doctor-order-create',
        doctorSection: 'create'
      },
      metrics: [
        { title: '今日订单', value: String(Math.max(doctorOrders.value.length, 2)), note: '今日提交与草稿', icon: 'doctorOrder', tone: 'blue' },
        { title: '生产中', value: '7', note: '公开进度更新', icon: 'process', tone: 'sky' },
        { title: '即将送达', value: '3', note: '3 日内到达', icon: 'delivery', tone: 'amber' },
        { title: '待回复', value: unreadText, note: '消息与通知', icon: 'chat', tone: 'rose' },
        { title: '设计待确认', value: '1', note: '确认后继续生产', icon: 'design', tone: 'violet' },
        { title: '延期提醒', value: '2', note: '生产或物流延期', icon: 'timer', tone: 'orange' }
      ],
      panels: [
        {
          title: '需要处理',
          badge: '4 项',
          tone: 'rose',
          items: [
            { title: '设计稿确认', detail: 'PDL-0471 种植冠设计稿待确认', meta: '影响生产继续', tone: 'violet', actionLabel: '去确认', routePath: '/doctor/orders', navId: 'doctor-order-design', doctorSection: 'design', doctorDetailTab: 'design' },
            { title: '沟通留言', detail: '实验室询问咬合方案，请医生回复', meta: '2 小时前', tone: 'rose', actionLabel: '回复', routePath: '/doctor/orders', navId: 'doctor-order-message', doctorSection: 'messages', doctorDetailTab: 'messages' },
            { title: '补充资料', detail: 'PDL-0475 缺少比色照片', meta: '开工前必需', tone: 'amber', actionLabel: '补资料', routePath: '/doctor/orders', navId: 'doctor-order-create', doctorSection: 'create' }
          ]
        },
        {
          title: '即将送达 / 延期',
          badge: '5 单',
          tone: 'amber',
          items: [
            { title: '明日送达', detail: 'PDL-0461 氧化锆冠，DHL 派送中', meta: '预计明天', tone: 'green', actionLabel: '查看物流', routePath: '/doctor/orders', navId: 'doctor-order-bill', doctorSection: 'bill', doctorDetailTab: 'bill' },
            { title: '生产延期', detail: 'PDL-0474 设备维护，预计顺延 2 天', meta: '工厂已通知', tone: 'orange', actionLabel: '查看说明', routePath: '/doctor/orders', navId: 'doctor-order-list', doctorSection: 'list' }
          ]
        }
      ],
      trends: [
        { label: '本月订单', value: '24', percent: 72, tone: 'blue' },
        { label: '按时交付', value: '91%', percent: 91, tone: 'green' },
        { label: '设计确认', value: '1 待办', percent: 36, tone: 'violet' },
        { label: '返工率', value: '4.2%', percent: 18, tone: 'rose' }
      ]
    },
    cs: {
      greeting: '客服工作台',
      subtitle: '订单审核、资料处理、客户沟通、账单物流和异常跟进集中处理。',
      primaryAction: {
        title: '新建内部订单',
        detail: '客服协助客户录入订单',
        meta: '快速录单',
        tone: 'violet',
        actionLabel: '进入订单',
        routePath: '/orders/internal',
        navId: 'cs-order-review'
      },
      metrics: [
        { title: '订单数量 / 件数', value: `${phaseOneAbCsDashboardStats.value.orderCount} / ${phaseOneAbCsDashboardStats.value.itemCount}`, note: '复用 /orders 列表', icon: 'order', tone: 'violet' },
        { title: '待审核', value: String(phaseOneAbCsDashboardStats.value.pendingReviewCount), note: '资料和生产备注', icon: 'audit', tone: 'amber' },
        { title: '翻译待审', value: String(phaseOneAbCsDashboardStats.value.pendingMessageReviewCount), note: '复用 /messages/pending-review，AI 草稿仍需人工确认', icon: 'ai', tone: 'sky' },
        { title: '待回复', value: String(phaseOneAbCsDashboardStats.value.pendingReplyCount), note: '复用通知未读数', icon: 'chat', tone: 'sky' },
        { title: '设计更新', value: String(phaseOneAbCsDashboardStats.value.designUpdateCount), note: '复用订单外部状态', icon: 'design', tone: 'green' },
        { title: '延期提醒', value: String(phaseOneAbCsDashboardStats.value.logisticsManualFollowUpCount), note: '复用物流人工状态', icon: 'timer', tone: 'orange' },
        { title: '今日发货', value: String(phaseOneAbCsDashboardStats.value.shipmentFollowUpCount), note: '复用物流人工状态，缺少今日维度', icon: 'delivery', tone: 'teal' },
        { title: '账单超期', value: String(phaseOneAbCsDashboardStats.value.billManualFollowUpCount), note: '复用账单 / 物流人工状态，真实账期 PARTIAL', icon: 'bill', tone: 'rose' },
        { title: '投诉/返工', value: String(phaseOneAbCsDashboardStats.value.reworkFollowUpCount), note: '复用质检外返汇总', icon: 'quality', tone: 'rose' }
      ],
      panels: [
        {
          title: '需要关注',
          badge: `${phaseOneAbCsDashboardStats.value.pendingReviewCount + phaseOneAbCsDashboardStats.value.pendingMessageReviewCount + phaseOneAbCsDashboardStats.value.billManualFollowUpCount} 项`,
          tone: 'rose',
          items: [
            { title: '资料初审', detail: `${phaseOneAbCsDashboardStats.value.pendingReviewCount} 单等待资料和生产备注审核`, meta: '本地订单队列', tone: 'amber', actionLabel: '去审核', routePath: '/orders/internal', navId: 'cs-order-review' },
            { title: '沟通待审', detail: `${phaseOneAbCsDashboardStats.value.pendingMessageReviewCount} 条消息或 AI 草稿待人工确认`, meta: '客服确认后可见', tone: 'violet', actionLabel: '去审核', routePath: '/collaboration', navId: 'cs-message-review' },
            { title: '账单物流', detail: `${phaseOneAbCsDashboardStats.value.billManualFollowUpCount} 单付款状态待跟进，${phaseOneAbCsDashboardStats.value.logisticsManualFollowUpCount} 单物流需人工关注`, meta: '一期人工状态', tone: 'rose', actionLabel: '去处理', routePath: '/delivery', navId: 'cs-delivery' }
          ]
        },
        {
          title: '今日发货 / 客户账单',
          badge: `${phaseOneAbCsDashboardStats.value.shipmentFollowUpCount + phaseOneAbCsDashboardStats.value.billManualFollowUpCount} 单`,
          tone: 'teal',
          items: [
            { title: '发货状态', detail: `${phaseOneAbCsDashboardStats.value.shipmentFollowUpCount} 单已有发货/配送人工状态`, meta: '真实物流平台未接', tone: 'green', actionLabel: '录入物流', routePath: '/delivery', navId: 'cs-delivery' },
            { title: '客户排名', detail: `${phaseOneAbCsDashboardStats.value.customerRanking.clinicName}：${phaseOneAbCsDashboardStats.value.customerRanking.orderCount} 单`, meta: '复用 /orders 诊所字段', tone: 'orange', actionLabel: '查看客户', routePath: '/customers', navId: 'cs-customers' }
          ]
        }
      ],
      trends: [
        { label: '本月订单', value: `${phaseOneAbCsDashboardStats.value.orderCount} 单`, percent: phaseOneProgress(phaseOneAbCsDashboardStats.value.orderCount * 4), tone: 'violet' },
        { label: '本月 / 上月对比', value: phaseOneAbMonthlyComparison.value.orderLabel, percent: phaseOneAbMonthlyComparison.value.orderPercent, tone: 'green' },
        { label: '十大客户排名', value: phaseOneAbCsDashboardStats.value.customerRanking.clinicName, percent: phaseOneProgress(phaseOneAbCsDashboardStats.value.customerRanking.orderCount * 10), tone: 'blue' },
        { label: '今日发货', value: `${phaseOneAbCsDashboardStats.value.shipmentFollowUpCount} 单`, percent: phaseOneProgress(phaseOneAbCsDashboardStats.value.shipmentFollowUpCount * 12), tone: 'teal' },
        { label: '返工投诉', value: `${phaseOneAbCsDashboardStats.value.reworkFollowUpCount} 单`, percent: phaseOneProgress(phaseOneAbCsDashboardStats.value.reworkFollowUpCount * 10), tone: 'rose' }
      ]
    },
    production: {
      greeting: '生产仪表盘',
      subtitle: '生产统计基础版：异常、待问、部门对比、返工和出货完成情况集中查看。',
      syncBanner: `医生端与客服端实时同步：${phaseOneAbProductionDashboardStats.value.productionExceptionCount} 单生产异常跟进中，${phaseOneAbProductionDashboardStats.value.pendingQuestionCount} 单等待确认，数据来源为本地既有接口第一增量。`,
      primaryAction: {
        title: '查看生产看板',
        detail: '按工序队列查看订单状态',
        meta: '13 个生产队列',
        tone: 'teal',
        actionLabel: '看板',
        routePath: '/production/board',
        navId: 'production-orders'
      },
      metrics: [
        { title: '生产异常', value: String(phaseOneAbProductionDashboardStats.value.productionExceptionCount), note: '复用 /orders 列表当前生产状态', icon: 'process', tone: 'teal' },
        { title: '待问异常', value: String(phaseOneAbProductionDashboardStats.value.pendingQuestionCount), note: '复用待审沟通与医生确认状态', icon: 'chat', tone: 'amber' },
        { title: '员工异常', value: String(phaseOneAbProductionDashboardStats.value.staffExceptionCount), note: '复用人员工作量第一增量', icon: 'staff', tone: 'orange' },
        { title: '质量与返工', value: String(phaseOneAbProductionDashboardStats.value.totalReworkCount), note: `内返 ${phaseOneAbProductionDashboardStats.value.internalReworkCount} / 外返 ${phaseOneAbProductionDashboardStats.value.externalReworkCount}`, icon: 'quality', tone: 'rose' },
        { title: '设备异常', value: String(phaseOneAbProductionDashboardStats.value.equipmentExceptionCount), note: '设备汇总第一增量 / PARTIAL', icon: 'device', tone: 'orange' },
        { title: '物料管理', value: String(phaseOneAbProductionDashboardStats.value.materialPendingCount), note: '物料异常汇总第一增量 / PARTIAL', icon: 'material', tone: 'amber' },
        { title: '成本预警', value: String(phaseOneAbProductionDashboardStats.value.costWarningCount), note: '成本汇总第一增量 / PARTIAL', icon: 'cost', tone: 'violet' },
        { title: '安环待办', value: String(phaseOneAbProductionDashboardStats.value.safetyTodoCount), note: '安环汇总第一增量 / PARTIAL', icon: 'safety', tone: 'sky' },
        { title: '奖惩待审', value: String(phaseOneAbProductionDashboardStats.value.rewardPendingCount), note: '奖惩汇总第一增量 / PARTIAL', icon: 'reward', tone: 'green' }
      ],
      panels: [
        {
          title: '生产经营待办',
          badge: `${phaseOneAbProductionDashboardStats.value.safetyTodoCount + phaseOneAbProductionDashboardStats.value.costWarningCount + phaseOneAbProductionDashboardStats.value.rewardPendingCount} 项`,
          tone: 'rose',
          items: [
            { title: '安环巡检', detail: `${phaseOneAbProductionDashboardStats.value.safetyTodoCount} 项安环事件待处理或复核`, meta: '基础汇总 / PARTIAL', tone: 'sky', actionLabel: '查看安环', routePath: '/production/safety-environment', navId: 'production-safety' },
            { title: '成本异常', detail: `${phaseOneAbProductionDashboardStats.value.costWarningCount} 条成本记录处于预警状态`, meta: '基础汇总 / PARTIAL', tone: 'violet', actionLabel: '查看成本', routePath: '/production/cost-management', navId: 'production-cost' },
            { title: '奖惩审批', detail: `${phaseOneAbProductionDashboardStats.value.rewardPendingCount} 条奖惩记录等待主管确认`, meta: '基础汇总 / PARTIAL', tone: 'green', actionLabel: '查看奖惩', routePath: '/production/reward-penalty', navId: 'production-reward-penalty' }
          ]
        },
        {
          title: '质量 / 设备 / 物料',
          badge: `${phaseOneAbProductionDashboardStats.value.totalReworkCount + phaseOneAbProductionDashboardStats.value.equipmentExceptionCount + phaseOneAbProductionDashboardStats.value.materialPendingCount} 项`,
          tone: 'green',
          items: [
            { title: '内返率', detail: `内部返修 ${phaseOneAbProductionDashboardStats.value.internalReworkCount} 单，内返率 ${formatRate(phaseOneAbProductionDashboardStats.value.internalReworkRate)}`, meta: '质量与返工', tone: 'rose', actionLabel: '看返工', routePath: '/rework-final', navId: 'production-rework-management' },
            { title: '外返率', detail: `客户退回返修 ${phaseOneAbProductionDashboardStats.value.externalReworkCount} 单，外返率 ${formatRate(phaseOneAbProductionDashboardStats.value.externalReworkRate)}`, meta: '质量与返工', tone: 'orange', actionLabel: '看返工', routePath: '/rework-final', navId: 'production-rework-management' },
            { title: '设备维护', detail: `${phaseOneAbProductionDashboardStats.value.equipmentExceptionCount} 项设备保养或故障待处理`, meta: '基础汇总 / PARTIAL', tone: 'amber', actionLabel: '看设备', routePath: '/production/devices', navId: 'production-device' },
            { title: '物料缺失', detail: `${phaseOneAbProductionDashboardStats.value.materialPendingCount} 条物料异常处理中`, meta: '基础汇总 / PARTIAL', tone: 'rose', actionLabel: '处理物料', routePath: '/production/material-exceptions', navId: 'production-material' }
          ]
        }
      ],
      trends: [
        { label: '部门今日 vs 上月平均', value: phaseOneAbMonthlyComparison.value.productionLabel, percent: phaseOneAbMonthlyComparison.value.productionPercent, tone: 'blue' },
        { label: '出货率', value: `${phaseOneAbProductionDashboardStats.value.shippingRate}%`, percent: phaseOneProgress(phaseOneAbProductionDashboardStats.value.shippingRate), tone: 'teal' },
        { label: '完成率', value: `${phaseOneAbProductionDashboardStats.value.completionRate}%`, percent: phaseOneProgress(phaseOneAbProductionDashboardStats.value.completionRate), tone: 'green' },
        { label: '一次通过率', value: formatRate(phaseOneAbProductionDashboardStats.value.firstPassRate), percent: phaseOneProgress(phaseOneAbProductionDashboardStats.value.firstPassRate), tone: 'green' },
        { label: '终检通过率', value: formatRate(phaseOneAbProductionDashboardStats.value.finalPassRate), percent: phaseOneProgress(phaseOneAbProductionDashboardStats.value.finalPassRate), tone: 'teal' },
        { label: '返工率', value: formatRate(phaseOneAbProductionDashboardStats.value.totalReworkRate), percent: phaseOneProgress(phaseOneAbProductionDashboardStats.value.totalReworkRate), tone: 'amber' },
        { label: '内返 / 外返', value: `${phaseOneAbProductionDashboardStats.value.internalReworkCount} / ${phaseOneAbProductionDashboardStats.value.externalReworkCount}`, percent: phaseOneProgress(phaseOneAbProductionDashboardStats.value.totalReworkCount * 10), tone: 'rose' },
        { label: '内返率', value: formatRate(phaseOneAbProductionDashboardStats.value.internalReworkRate), percent: phaseOneProgress(phaseOneAbProductionDashboardStats.value.internalReworkRate), tone: 'amber' },
        { label: '外返率', value: formatRate(phaseOneAbProductionDashboardStats.value.externalReworkRate), percent: phaseOneProgress(phaseOneAbProductionDashboardStats.value.externalReworkRate), tone: 'rose' }
      ]
    },
    admin: {
      greeting: '管理控制台',
      subtitle: '平台账号、订单、工艺、生产、账单配送和 AI 治理统一总览。',
      primaryAction: {
        title: '检查系统治理',
        detail: '查看 AI、预算、通知和审计状态',
        meta: '管理端',
        tone: 'blue',
        actionLabel: '查看',
        routePath: '/admin/ai-governance',
        navId: 'admin-ai'
      },
      metrics: [
        { title: '总订单', value: '148', note: '本月业务量', icon: 'order', tone: 'blue' },
        { title: '待处理异常', value: '11', note: '跨端待办', icon: 'audit', tone: 'rose' },
        { title: '活跃账号', value: '32', note: '医生/客服/生产', icon: 'customer', tone: 'green' },
        { title: '今日生产', value: '27', note: '节点流转', icon: 'process', tone: 'teal' },
        { title: 'AI 调用', value: '86', note: '近 24 小时', icon: 'ai', tone: 'violet' },
        { title: '预算告警', value: '2', note: '待治理', icon: 'bill', tone: 'amber' }
      ],
      panels: [
        {
          title: '系统待办',
          badge: '11 项',
          tone: 'rose',
          items: [
            { title: '权限检查', detail: '2 个账号权限范围需复核', meta: '账号权限', tone: 'amber', actionLabel: '查看角色', routePath: '/system/rbac/roles', navId: 'admin-roles' },
            { title: '生产瓶颈', detail: '切削与染色部门负载偏高', meta: '产能风险', tone: 'orange', actionLabel: '查看工序', routePath: '/workflow/process-instance', navId: 'admin-process-progress' },
            { title: 'AI 预算告警', detail: '模型预算接近阈值，需确认策略', meta: 'AI 治理', tone: 'violet', actionLabel: '去治理', routePath: '/admin/ai-governance', navId: 'admin-ai' }
          ]
        },
        {
          title: '业务健康',
          badge: '今日',
          tone: 'blue',
          items: [
            { title: '账单配送', detail: '3 单账单/物流状态需客服跟进', meta: '跨端协同', tone: 'rose', actionLabel: '查看', routePath: '/admin/billing-delivery', navId: 'admin-billing-delivery' },
            { title: '外协订单', detail: '2 单外协正在等待回传资料', meta: '外协管理', tone: 'teal', actionLabel: '查看外协', routePath: '/admin/outsourcing', navId: 'admin-outsourcing' }
          ]
        }
      ],
      trends: [
        { label: '订单增长', value: '+16%', percent: 68, tone: 'blue' },
        { label: '生产效率', value: '88%', percent: 88, tone: 'teal' },
        { label: '权限健康', value: '94%', percent: 94, tone: 'green' },
        { label: 'AI 预算', value: '72%', percent: 72, tone: 'amber' }
      ]
    }
  }
})
const activePrototypeDashboard = computed(() => prototypeDashboards.value[portalTone.value])

const prototypeQueueChips = computed<QueueChip[]>(() => {
  if (isDoctorOrderRoute.value) {
    return [
      { label: '全部订单', count: String(Math.max(doctorOrders.value.length, 8)), tone: 'blue', active: true, doctorSection: 'list', doctorDetailTab: 'info' },
      { label: '待确认设计', count: '1', tone: 'violet', doctorSection: 'design', doctorDetailTab: 'design' },
      { label: '待补资料', count: '2', tone: 'amber', doctorSection: 'create' },
      { label: '账单物流', count: '3', tone: 'teal', doctorSection: 'bill', doctorDetailTab: 'bill' },
      { label: '延期提醒', count: '2', tone: 'orange', doctorSection: 'messages', doctorDetailTab: 'messages' }
    ]
  }
  if (isInternalOrdersRoute.value) {
    return [
      { label: '全部队列', count: String(Math.max(internalOrders.value.length, 8)), tone: 'violet', active: true, filter: 'ALL' },
      { label: '待客服初审', count: '5', tone: 'amber', filter: 'PENDING_CS_REVIEW' },
      { label: '资料缺失', count: '2', tone: 'orange', filter: 'CS_REJECTED' },
      { label: '等待医生确认', count: '1', tone: 'sky', filter: 'PENDING_DOCTOR_CONFIRM' },
      { label: '账单异常', count: '3', tone: 'rose', filter: 'ALL' }
    ]
  }
  if (isWorkerTasksRoute.value) {
    return [
      { label: '全部任务', count: String(Math.max(workerTasks.value.length, 8)), tone: 'teal', active: true, filter: 'ALL' },
      { label: '待开工', count: '6', tone: 'sky', filter: 'READY' },
      { label: '进行中', count: '7', tone: 'teal', filter: 'IN_PROGRESS' },
      { label: '已完成', count: '4', tone: 'green', filter: 'COMPLETED' },
      { label: '待处理', count: '2', tone: 'rose', filter: 'PENDING' }
    ]
  }
  if (isProductionBoardRoute.value || isProductionReviewRoute.value) {
    return [
      { label: '全部生产订单', count: '8', tone: 'teal', active: true, filter: 'ALL' },
      { label: '待派工', count: '6', tone: 'sky', filter: 'PROCESS_INSTANCE_CREATED' },
      { label: '生产异常', count: '7', tone: 'teal', filter: 'PRODUCING' },
      { label: '超时风险', count: '2', tone: 'rose' },
      { label: '医生待确认', count: '2', tone: 'violet', filter: 'PENDING_DOCTOR_CONFIRM' }
    ]
  }
  return [
    { label: '全部队列', count: '8', tone: 'blue', active: true },
    { label: '待处理', count: '5', tone: 'amber' },
    { label: '异常', count: '2', tone: 'rose' },
    { label: '已完成', count: '4', tone: 'green' }
  ]
})

const prototypeDataQueueRows: PrototypeQueueRow[] = [
  { orderNo: 'PDL-0476', patient: 'Emma W.', product: '种植冠 #19', status: '资料审核', statusTone: 'amber', checklist: '资料齐全', checklistTone: 'green', reviewType: '资料审核', awaiting: '客服 / 生产', awaitingTone: 'violet', days: '0d', daysTone: 'green', action: '分配技师' },
  { orderNo: 'PDL-0475', patient: 'Robert K.', product: '贴面套装 #6-11', status: '等待资料', statusTone: 'amber', checklist: '缺少比色照片', checklistTone: 'orange', reviewType: '生产前检查', awaiting: '医生补资料', awaitingTone: 'sky', days: '1d', daysTone: 'orange', action: '发送提醒' },
  { orderNo: 'PDL-0474', patient: 'David L.', product: 'PFM 桥 #18-20', status: '设计检查', statusTone: 'violet', checklist: '资料齐全', checklistTone: 'green', reviewType: '设计检查', awaiting: '医生确认', awaitingTone: 'sky', days: '0.5d', daysTone: 'orange', action: '追问医生' },
  { orderNo: 'PDL-0473', patient: 'Nancy P.', product: '隐形矫治全套', status: '数据复核', statusTone: 'amber', checklist: '口扫已接收', checklistTone: 'green', reviewType: '数据复核', awaiting: '设计师', awaitingTone: 'amber', days: '2d', daysTone: 'rose', action: '跟进设计' },
  { orderNo: 'PDL-0472', patient: 'Tom A.', product: '氧化锆冠 #30', status: '等待付款', statusTone: 'orange', checklist: '资料齐全', checklistTone: 'green', reviewType: '账单确认', awaiting: '医生付款', awaitingTone: 'sky', days: '3d', daysTone: 'rose', action: '发送账单' }
]
function isPrototypeChipActive(chip: QueueChip) {
  return activePrototypeChip.value ? activePrototypeChip.value === chip.label : Boolean(chip.active)
}
async function selectPrototypeQueueChip(chip: QueueChip) {
  activePrototypeChip.value = chip.label
  if (isDoctorOrderRoute.value) {
    activeDoctorOrderSection.value = chip.doctorSection ?? 'list'
    activeDoctorDetailTab.value = chip.doctorDetailTab ?? 'info'
    return
  }
  if (isInternalOrdersRoute.value) {
    internalOrderStatus.value = chip.filter ?? 'PENDING_CS_REVIEW'
    await loadInternalOrders()
    return
  }
  if (isWorkerTasksRoute.value) {
    workerTaskStatus.value = chip.filter === 'ALL' ? '' : (chip.filter ?? 'READY')
    await loadWorkerTasks()
    return
  }
  if (isProductionBoardRoute.value || isProductionReviewRoute.value) {
    if (chip.filter) {
      if (isProductionBoardRoute.value) {
        productionBoardStatus.value = chip.filter
        await loadProductionBoardOrders()
      } else {
        productionReviewStatus.value = chip.filter
        await loadProductionReviewOrders()
      }
    }
  }
}
function flattenDisplayItems(items: DisplayNavigationItem[]): DisplayNavigationItem[] {
  return items.flatMap((item) => [item, ...(item.children ? flattenDisplayItems(item.children) : [])])
}
const businessShortcuts = computed<BusinessShortcut[]>(() => {
  return navigationGroups.value.flatMap((group) => flattenDisplayItems(group.items)).map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    icon: item.icon,
    routePath: item.routePath,
    placeholder: item.placeholder,
    doctorSection: item.doctorSection,
    doctorDetailTab: item.doctorDetailTab
  }))
})
function allDisplayItems(tone = portalTone.value) {
  return displayNavigationConfig[tone].flatMap((group) => flattenDisplayItems(group.items))
}
function allAccountItems(tone = portalTone.value) {
  return accountNavigationConfig[tone].flatMap((group) => flattenDisplayItems(group.items))
}
function findDisplayItemById(id: string) {
  return allDisplayItems().find((item) => item.id === id) ?? allAccountItems().find((item) => item.id === id) ?? null
}
function findDisplayItemByRoute(routePath: string) {
  return allDisplayItems().find((item) => item.routePath === routePath) ?? allAccountItems().find((item) => item.routePath === routePath) ?? null
}
const activeDisplayItem = computed(() => findDisplayItemById(activeNavId.value) ?? findDisplayItemByRoute(activeRoute.value))
const displayActiveIndex = computed(() => activeDisplayItem.value?.id ?? activeNavId.value)
const isPlaceholderRoute = computed(() => Boolean(activeDisplayItem.value?.placeholder))
const activePlaceholderContentItems = computed(() => activeDisplayItem.value ? (placeholderContentMap[activeDisplayItem.value.id] ?? []) : [])
const accountProfile = computed<AccountProfile>(() => {
  const usernameText = currentUser.value?.username ?? '未登录账号'
  const roleText = roleLabels(currentUser.value?.roles)
  const scopeText = dataScopeLabel(currentUser.value?.dataScope)
  const profileByPortal: Record<PortalTone, Pick<AccountProfile, 'organization' | 'summary'>> = {
    doctor: {
      organization: currentUser.value?.clinicId ? `诊所 #${currentUser.value.clinicId}` : '所属诊所待接入',
      summary: '仅展示诊所、医生账号、通知偏好和密码安全。'
    },
    cs: {
      organization: '客服中心 / 客户分配待接入',
      summary: '展示客服账号、客户分配、常用回复和通知偏好。'
    },
    production: {
      organization: '生产部 / 岗位工序待接入',
      summary: '展示员工资料、所属部门、岗位工序、绩效入口和账号安全。'
    },
    admin: {
      organization: '平台管理部 / 部门岗位待接入',
      summary: '展示用户管理、角色权限、部门岗位和账号状态。'
    }
  }
  return {
    username: usernameText,
    role: roleText,
    organization: profileByPortal[portalTone.value].organization,
    scope: scopeText,
    summary: profileByPortal[portalTone.value].summary
  }
})
const isDoctorOrderRoute = computed(() => activeRoute.value === '/doctor/orders')
const isDoctorPatientsRoute = computed(() => activeRoute.value === '/doctor/patients')
const isClinicManagementRoute = computed(() => activeRoute.value === '/customers' || activeRoute.value === '/admin/clinics')
const isDoctorClinicRoute = computed(() => activeRoute.value === '/doctor/account/clinic')
const isDoctorAccountSettingsRoute = computed(() => activeRoute.value === '/doctor/account/settings')
const isInternalOrdersRoute = computed(() => activeRoute.value === '/orders/internal')
const isCustomerCollaborationRoute = computed(() => activeRoute.value === '/collaboration')
const isCsAiQueryRoute = computed(() => activeRoute.value === '/ai/cs')
const isProductionReviewRoute = computed(() => activeRoute.value === '/workflow/review')
const isProcessInstanceRoute = computed(() => activeRoute.value === '/workflow/process-instance')
const isWorkflowAssignRoute = computed(() => activeRoute.value === '/workflow/assign')
const isWorkerTasksRoute = computed(() => activeRoute.value === '/tasks/mine')
const isCheckRecordsRoute = computed(() => activeRoute.value === '/checks')
const isReworkFinalRoute = computed(() => activeRoute.value === '/rework-final')
const isWorklogsRoute = computed(() => activeRoute.value === '/worklogs/self')
const isPerformanceRoute = computed(() => activeRoute.value === '/performance')
const isStaffWorkloadRoute = computed(() => activeRoute.value === '/production/staff' || activeRoute.value === '/admin/staff')
const isProductionBoardRoute = computed(() => activeRoute.value === '/production/board')
const isProductionQualitySummaryRoute = computed(() => [
  'production-quality',
  'production-quality-overview',
  'production-rework-management'
].includes(activeDisplayItem.value?.id ?? ''))
const isProductionEquipmentSummaryRoute = computed(() => activeDisplayItem.value?.id === 'production-device')
const isProductionMaterialExceptionSummaryRoute = computed(() => activeDisplayItem.value?.id === 'production-material')
const isProductionSafetyEnvironmentSummaryRoute = computed(() => activeDisplayItem.value?.id === 'production-safety')
const isProductionCostSummaryRoute = computed(() => [
  'production-cost',
  'production-outsourcing-cost'
].includes(activeDisplayItem.value?.id ?? ''))
const isProductionRewardPenaltySummaryRoute = computed(() => activeDisplayItem.value?.id === 'production-reward-penalty')
const isProductizedProductionSupportRoute = computed(() =>
  isProductionEquipmentSummaryRoute.value ||
  isProductionMaterialExceptionSummaryRoute.value ||
  isProductionSafetyEnvironmentSummaryRoute.value ||
  isProductionCostSummaryRoute.value ||
  isProductionRewardPenaltySummaryRoute.value)
const isProductizedCsDesignRoute = computed(() => activeNavId.value === 'cs-designs')
const isProductizedCsBillingRoute = computed(() => activeNavId.value === 'cs-billing')
const isAdminPermissionInventoryRoute = computed(() => [
  'admin-account',
  'admin-users',
  'admin-roles',
  'admin-account-users',
  'admin-account-roles',
  'admin-account-departments',
  'admin-account-status'
].includes(activeDisplayItem.value?.id ?? ''))
const isAdminAiGovernanceRoute = computed(() => activeRoute.value === '/admin/ai-governance')
const isDeliveryManagementRoute = computed(() => activeRoute.value === '/delivery')
const isFormConfigsRoute = computed(() => activeRoute.value === '/system/form-configs')
const isReworkDictionariesRoute = computed(() => activeRoute.value === '/system/rework-dictionaries')
const canCreateClinic = computed(() => currentUser.value?.roles.includes('ADMIN') ?? false)
const selectedOrderId = computed(() => selectedDoctorOrder.value?.order_id ?? doctorOrderWorkspace.value?.order.order_id ?? null)
const selectedProductCatalogItem = computed(() =>
  productCatalogItems.value.find((item) => item.product_id === selectedProductCatalogId.value) ?? null)
const selectedFormConfigField = computed(() => formConfigFields.value.find((field) => field.field_id === selectedFormConfigFieldId.value) ?? null)
const selectedReworkDictionaryItem = computed(() =>
  reworkDictionaryManageItems.value.find((item) => item.item_id === selectedReworkDictionaryItemId.value) ?? null)
const selectedProductionReviewChain = computed(() => workflowChains.value.find((chain) => chain.chain_id === productionReviewChainId.value) ?? null)
const selectedProcessNode = computed(() => selectedProcessInstance.value?.nodes.find((node) => node.node_instance_id === selectedProcessNodeId.value) ?? null)
const selectedPortalOption = computed(() => portalOptions.find((option) => option.value === selectedPortal.value) ?? null)
const portalTone = computed<PortalTone>(() => {
  if (activePortalTone.value) {
    return activePortalTone.value
  }
  const roles = currentUser.value?.roles ?? []
  if (roles.includes('DOCTOR')) {
    return 'doctor'
  }
  if (roles.includes('WORKER')) {
    return 'production'
  }
  if (roles.includes('CS')) {
    return 'cs'
  }
  return 'admin'
})
const portalTitle = computed(() => {
  if (portalTone.value === 'doctor') {
    return '医生工作台'
  }
  if (portalTone.value === 'cs') {
    return '客服协同台'
  }
  if (portalTone.value === 'production') {
    return '生产管理台'
  }
  return '管理控制台'
})
const routeChrome = computed<RouteChrome>(() => {
  const route = activeRoute.value
  if (route === '/doctor/orders') {
    return { eyebrow: '医生端 / 订单与病例', title: '医生订单工作台', description: '下单、补资料、查看公开进度、确认设计稿、查看账单物流和订单助手。', icon: 'clinical_notes' }
  }
  if (route === '/doctor/patients') {
    return { eyebrow: '医生端 / 患者档案', title: '患者管理', description: '维护患者档案，绑定订单病例，并查看本人患者历史订单。', icon: 'customer' }
  }
  if (route === '/orders/internal') {
    return { eyebrow: '客服端 / 审核与沟通', title: '客服初审', description: '核对医生提交资料，整理生产备注，并作为医生与工厂之间的审核中枢。', icon: 'support_agent' }
  }
  if (route === '/collaboration') {
    return { eyebrow: '客服端 / 沟通中心', title: '客服协同台', description: '集中处理订单消息上下文、生产发给医生的待审核消息和客服驳回说明。', icon: 'forum' }
  }
  if (route === '/workflow/review') {
    return { eyebrow: '生产端 / 审核入口', title: '生产审核', description: '选择工序链与入口路线，通过后生成订单工序。', icon: 'fact_check' }
  }
  if (route === '/workflow/process-instance') {
    return { eyebrow: '管理端 / 工序进度', title: '工序进度', description: '查看订单生产链路、节点状态、执行员工与标准工时。', icon: 'account_tree' }
  }
  if (route === '/workflow/assign') {
    return { eyebrow: '管理端 / 员工派工', title: '员工派工', description: '为生产节点绑定或调整执行员工，并保留转派记录。', icon: 'assignment_ind' }
  }
  if (route === '/tasks/mine') {
    return { eyebrow: '生产端 / 我的工单', title: '我的任务', description: '按待开工、进行中、已完成等状态处理本人生产任务。', icon: 'task_alt' }
  }
  if (route === '/checks') {
    return { eyebrow: '生产端 / 入检出检', title: '入检出检', description: '执行节点入检、出检，出检不通过时进入返工链路。', icon: 'rule' }
  }
  if (route === '/rework-final') {
    return { eyebrow: '生产端 / 返工终检', title: '返工终检', description: '跟踪返工影响范围、关闭返工，并生成终检报告。', icon: 'published_with_changes' }
  }
  if (route === '/worklogs/self') {
    return { eyebrow: '生产端 / 工时', title: '工时记录', description: '记录本人任务的开始、暂停、继续和完成工时。', icon: 'timer' }
  }
  if (route === '/performance') {
    return { eyebrow: '生产端 / 绩效', title: '绩效统计', description: '查看有效工时、通过率、准时率、返工归因和工时明细。', icon: 'monitoring' }
  }
  if (route === '/production/staff' || route === '/admin/staff') {
    return { eyebrow: '人员绩效 / 员工档案', title: '人员档案', description: '查看员工基础档案、部门岗位、角色权限摘要和当前任务负载。', icon: 'assignment_ind' }
  }
  if (route === '/production/board') {
    return { eyebrow: '生产端 / 看板', title: '生产看板', description: '跨状态查看生产订单、节点进度和终检发货门禁。', icon: 'view_kanban' }
  }
  if (route === '/admin/ai-governance') {
    return { eyebrow: '管理端 / AI 治理', title: 'AI 治理', description: '查看提示词版本、输出安全边界、预算熔断、AI-3 安全矩阵和真实联调阻塞。', icon: 'ai' }
  }
  if (route === '/production/quality') {
    return { eyebrow: '生产端 / 质量记录', title: '质量与返工', description: '查看质量汇总，登记外返质量记录，并追踪返工责任分类。', icon: 'quality' }
  }
  if (route === '/system/form-configs') {
    return { eyebrow: '管理端 / 动态表单', title: '动态表单', description: '维护医生下单表单字段，医生端只读取启用字段。', icon: 'dynamic_form' }
  }
  if (route === '/system/rework-dictionaries') {
    return { eyebrow: '管理端 / 返工字典', title: '返工字典', description: '维护返工原因和责任归属，生产端关闭返工只读取启用字典。', icon: 'dictionary' }
  }
  if (route === '/notifications') {
    return { eyebrow: '平台 / 通知中心', title: '通知中心', description: '查看未读通知、实时推送状态和系统消息。', icon: 'notifications_active' }
  }
  if (activeDisplayItem.value) {
    return {
      eyebrow: `${portalTitle.value} / ${activeDisplayItem.value.placeholder ? '待接入功能' : '业务功能'}`,
      title: activeDisplayItem.value.title,
      description: activeDisplayItem.value.description,
      icon: activeDisplayItem.value.icon
    }
  }
  return {
    eyebrow: `${portalTitle.value} / 总览`,
    title: activeMenu.value?.menuName ?? '工作台',
    description: '按当前账号角色和菜单权限展示可访问功能。',
    icon: 'dashboard'
  }
})
const menuIconSvgMap: Record<string, string> = {
  '/dashboard': '<svg viewBox="0 0 24 24"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>',
  '/doctor/orders': '<svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 12h6M12 9v6"/></svg>',
  '/doctor/patients': '<svg viewBox="0 0 24 24"><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M3 21a6 6 0 0 1 12 0"/><path d="M17 8h4M19 6v4M16 15h5M16 19h5"/></svg>',
  '/doctor/ai': '<svg viewBox="0 0 24 24"><path d="M8 5h8a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4h-3l-4 3v-3H8a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4z"/><path d="M9 10h.01M12 10h.01M15 10h.01"/></svg>',
  '/orders/internal': '<svg viewBox="0 0 24 24"><path d="M5 5h14v14H5z"/><path d="M8 10h8M8 14h5M16 15l2 2 3-4"/></svg>',
  '/workflow/review': '<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h5M9 16l2 2 4-5"/></svg>',
  '/workflow/process-instance': '<svg viewBox="0 0 24 24"><path d="M12 4v5M7 9h10M7 9v5M17 9v5M5 14h4v4H5zM10 3h4v4h-4zM15 14h4v4h-4z"/></svg>',
  '/workflow/assign': '<svg viewBox="0 0 24 24"><path d="M8 11a4 4 0 1 1 8 0"/><path d="M5 20a7 7 0 0 1 14 0M17 4h4v4M21 4l-5 5"/></svg>',
  '/tasks/mine': '<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5z"/><path d="M8 9l2 2 4-5M8 15h8"/></svg>',
  '/checks': '<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="M8 12l3 3 5-6"/></svg>',
  '/rework-final': '<svg viewBox="0 0 24 24"><path d="M7 7h9a4 4 0 0 1 0 8H9"/><path d="M7 7l3-3M7 7l3 3M17 17l2 2 3-4"/></svg>',
  '/worklogs/self': '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="7"/><path d="M12 6V3M9 3h6M12 13l3-3"/></svg>',
  '/performance': '<svg viewBox="0 0 24 24"><path d="M4 19h16"/><path d="M6 16l4-4 3 3 5-8"/><path d="M18 7h2v2"/></svg>',
  '/production/board': '<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="M8 5v14M16 5v14M4 11h16"/></svg>',
  '/files': '<svg viewBox="0 0 24 24"><path d="M4 6h6l2 3h8v10H4z"/><path d="M7 13h10M7 16h7"/></svg>',
  '/collaboration': '<svg viewBox="0 0 24 24"><path d="M4 6h10v8H8l-4 4z"/><path d="M14 9h6v8h-3l-3 3v-3h-2"/></svg>',
  '/ai/cs': '<svg viewBox="0 0 24 24"><path d="M7 10a5 5 0 0 1 10 0v4"/><path d="M5 13h3v4H5zM16 13h3v4h-3zM9 19h4M13 19c3 0 5-2 5-5"/></svg>',
  '/admin/ai-governance': '<svg viewBox="0 0 24 24"><path d="M7 10a5 5 0 0 1 10 0v4"/><path d="M5 13h3v4H5zM16 13h3v4h-3zM9 19h4M13 19c3 0 5-2 5-5"/><path d="M12 3v2M4 6l2 2M20 6l-2 2"/></svg>',
  '/ai/production': '<svg viewBox="0 0 24 24"><path d="M4 18V9l5 3V8l5 4V7l6 4v7z"/><path d="M8 18v-3M12 18v-3M16 18v-3"/></svg>',
  '/system/rbac': '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-5"/></svg>',
  '/system/form-configs': '<svg viewBox="0 0 24 24"><path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>',
  '/system/rework-dictionaries': '<svg viewBox="0 0 24 24"><path d="M5 5h14v14H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
  '/notifications': '<svg viewBox="0 0 24 24"><path d="M6 17h12l-1-2v-4a5 5 0 0 0-10 0v4z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>'
}
const fallbackMenuIconSvg = '<svg viewBox="0 0 24 24"><path d="M12 4l8 8-8 8-8-8z"/></svg>'
const businessIconSvgMap: Record<string, string> = {
  dashboard: menuIconSvgMap['/dashboard'],
  clinical_notes: menuIconSvgMap['/doctor/orders'],
  support_agent: menuIconSvgMap['/ai/cs'],
  factory: menuIconSvgMap['/ai/production'],
  admin_panel_settings: menuIconSvgMap['/system/rbac'],
  precision_manufacturing: '<svg viewBox="0 0 24 24"><path d="M4 18V9l5 3V8l5 4V7l6 4v7z"/><path d="M7 18v-4M11 18v-4M15 18v-4"/></svg>',
  stethoscope: '<svg viewBox="0 0 24 24"><path d="M7 4v5a5 5 0 0 0 10 0V4"/><path d="M17 9v4a4 4 0 0 0 8 0"/><circle cx="21" cy="13" r="2"/></svg>',
  person: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  arrow_forward: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>',
  gpp_maybe: '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M12 8v5M12 16h.01"/></svg>',
  fact_check: menuIconSvgMap['/workflow/review'],
  account_tree: menuIconSvgMap['/workflow/process-instance'],
  assignment_ind: menuIconSvgMap['/workflow/assign'],
  task_alt: menuIconSvgMap['/tasks/mine'],
  rule: menuIconSvgMap['/checks'],
  published_with_changes: menuIconSvgMap['/rework-final'],
  timer: menuIconSvgMap['/worklogs/self'],
  monitoring: menuIconSvgMap['/performance'],
  view_kanban: menuIconSvgMap['/production/board'],
  dynamic_form: menuIconSvgMap['/system/form-configs'],
  dictionary: menuIconSvgMap['/system/rework-dictionaries'],
  notifications_active: menuIconSvgMap['/notifications'],
  order: menuIconSvgMap['/orders/internal'],
  doctorOrder: menuIconSvgMap['/doctor/orders'],
  chat: menuIconSvgMap['/collaboration'],
  customer: '<svg viewBox="0 0 24 24"><path d="M8 11a4 4 0 1 1 8 0"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  product: menuIconSvgMap['/system/form-configs'],
  delivery: '<svg viewBox="0 0 24 24"><path d="M3 7h11v10H3z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
  bill: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>',
  partner: '<svg viewBox="0 0 24 24"><path d="M8 12l3 3 5-6"/><path d="M4 19V5h16v14z"/></svg>',
  task: menuIconSvgMap['/tasks/mine'],
  process: menuIconSvgMap['/checks'],
  quality: menuIconSvgMap['/rework-final'],
  staff: menuIconSvgMap['/workflow/assign'],
  device: '<svg viewBox="0 0 24 24"><path d="M6 4h12v10H6z"/><path d="M9 18h6M12 14v4M8 8h8"/></svg>',
  material: '<svg viewBox="0 0 24 24"><path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M4 7l8 4 8-4M12 11v10"/></svg>',
  performance: menuIconSvgMap['/performance'],
  design: '<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5z"/><path d="M8 15l3-3 2 2 3-4 2 5z"/></svg>',
  workorder: '<svg viewBox="0 0 24 24"><path d="M7 3h10v18H7z"/><path d="M9 7h6M9 11h6M9 15h4"/><path d="M10 3h4v3h-4z"/></svg>',
  scan: '<svg viewBox="0 0 24 24"><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><path d="M7 12h10M8 9h2M12 9h4M8 15h4M15 15h1"/></svg>',
  report: '<svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 11h6M9 15h6M9 19h3"/></svg>',
  reward: '<svg viewBox="0 0 24 24"><path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9 5.5-.8z"/></svg>',
  cost: '<svg viewBox="0 0 24 24"><path d="M5 5h14v14H5z"/><path d="M9 9h6M9 13h6M9 17h3"/><path d="M16 7v12"/></svg>',
  safety: '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-5"/></svg>',
  cloud: '<svg viewBox="0 0 24 24"><path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 2A3 3 0 0 0 7 18z"/><path d="M12 8v7M9 12l3 3 3-3"/></svg>',
  system: menuIconSvgMap['/system/rbac'],
  audit: '<svg viewBox="0 0 24 24"><path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h3"/><path d="M16 16l2 2 3-4"/></svg>',
  ai: menuIconSvgMap['/ai/cs'],
  notification: menuIconSvgMap['/notifications']
}
function menuIconSvg(menu: AuthMenu) {
  return menuIconSvgMap[menu.routePath ?? ''] ?? fallbackMenuIconSvg
}
function businessIconSvg(icon: string) {
  return businessIconSvgMap[icon] ?? fallbackMenuIconSvg
}
const roleLabelMap: Record<string, string> = {
  ADMIN: '管理员',
  DOCTOR: '医生',
  CS: '客服',
  WORKER: '生产人员'
}
const dataScopeLabelMap: Record<string, string> = {
  ALL: '全部数据',
  CLINIC: '诊所数据',
  SELF: '本人数据',
  NONE: '无数据范围'
}
const statusLabelMap: Record<string, string> = {
  PENDING: '待处理',
  READY: '待开工',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  SKIPPED: '已跳过',
  FAILED: '失败',
  PENDING_REVIEW: '待审核',
  PENDING_CS_REVIEW: '待客服初审',
  PENDING_PRODUCTION_REVIEW: '待生产审核',
  PROCESS_INSTANCE_CREATED: '已生成工序',
  PRODUCING: '生产中',
  CS_REJECTED: '客服驳回',
  PRODUCTION_REJECTED: '生产驳回',
  SHIPPED: '已发货',
  DELIVERED: '已签收',
  EXCEPTION: '物流异常',
  FOLLOWING: '跟进中',
  RESOLVED: '已解决',
  PENDING_DOCTOR_CONFIRM: '待医生确认',
  CONFIRMED: '已确认',
  REJECTED: '已驳回',
  APPROVED: '已通过',
  OPEN: '处理中',
  CLOSED: '已关闭',
  UPLOADING: '上传中',
  UPLOADED: '已上传',
  PENDING_PAYMENT: '待付款',
  PARTIALLY_PAID: '部分付款',
  PAID: '已付款',
  NOT_REQUIRED: '无需付款',
  COMPLETE: '已完成',
  PAUSED: '已暂停',
  DONE: '已完成',
  ACTIVE: '启用',
  INACTIVE: '停用'
}
const productTypeLabelMap: Record<string, string> = {
  REGULAR_CROWN: '普通牙冠',
  PFM_BRIDGE: '烤瓷桥',
  VENEER_SET: '贴面套装',
  IMPLANT_CROWN: '种植牙冠',
  CLEAR_ALIGNER: '隐形矫治',
  NIGHT_GUARD: '夜磨牙垫',
  RUNTIME_TEST: '测试订单'
}
const fieldTypeLabelMap: Record<string, string> = {
  text: '文本',
  textarea: '多行文本',
  number: '数字',
  select: '单选',
  'multi-select': '多选',
  date: '日期',
  file: '文件'
}
const clinicPreferenceLabelMap: Record<string, string> = {
  color: '色号偏好',
  contact: '邻接偏好',
  margin: '边缘设计',
  shape: '外形偏好',
  material: '材料偏好',
  note: '备注'
}
function roleLabel(role: string) {
  return roleLabelMap[role] ?? role
}
function roleLabels(roles: string[] | undefined) {
  return roles?.map(roleLabel).join('、') || '未识别角色'
}
function dataScopeLabel(scope: string | null | undefined) {
  return scope ? (dataScopeLabelMap[scope] ?? scope) : '无数据范围'
}
function menuLabel(menu: AuthMenu) {
  if (menu.menuName.includes('AI')) {
    if (menu.menuName.startsWith('医生')) {
      return '订单助手'
    }
    if (menu.menuName.startsWith('客服')) {
      return '智能助手'
    }
    if (menu.menuName.startsWith('生产')) {
      return '生产助手'
    }
  }
  return menu.menuName
}
function statusLabel(status: string | null | undefined) {
  return status ? (statusLabelMap[status] ?? status.replaceAll('_', ' ')) : '待处理'
}
const reworkImpactSteps = computed<ReworkImpactStep[]>(() => {
  const record = selectedRework.value
  if (!record) {
    return []
  }
  const steps: ReworkImpactStep[] = []
  if (record.target_node_instance_id) {
    steps.push({
      key: `target-${record.target_node_instance_id}`,
      nodeId: record.target_node_instance_id,
      title: record.target_process_name ? `返工目标：${record.target_process_name}` : '返工目标节点',
      subtitle: `节点 ${record.target_node_instance_id} / ${statusLabel(record.target_node_status)}`,
      kind: 'target'
    })
  }
  for (const [index, nodeId] of record.impacted_node_instance_ids.entries()) {
    if (nodeId === record.target_node_instance_id) {
      continue
    }
    steps.push({
      key: `impacted-${nodeId}`,
      nodeId,
      title: `受影响后续工序 ${index + 1}`,
      subtitle: `节点 ${nodeId} / 后续工序将被重置或复核`,
      kind: 'impacted'
    })
  }
  return steps
})
function productTypeLabel(type: string | null | undefined) {
  return type ? (productTypeLabelMap[type] ?? type.replaceAll('_', ' ')) : '未分类'
}
function fieldTypeLabel(type: string | null | undefined) {
  return type ? (fieldTypeLabelMap[type] ?? type) : '未设置'
}
function clinicPreferenceLabel(key: string) {
  return clinicPreferenceLabelMap[key] ?? key
}
function compactDateTime(value: string | undefined) {
  if (!value) {
    return '-'
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value.replace('T', ' ').replace('Z', '')
  }
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`
}
function formatRate(value: number | null | undefined) {
  return `${Number(value ?? 0).toFixed(1)}%`
}
function formatMoney(value: number | null | undefined) {
  return `¥${Number(value ?? 0).toFixed(2)}`
}
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
const productionQualitySummaryCards = computed(() => {
  const summary = productionQualitySummary.value
  if (!summary) {
    return []
  }
  return [
    {
      title: '总返工率',
      value: formatRate(summary.total_rework_rate),
      detail: `${summary.total_rework_count} 次返工 / ${summary.inspected_order_count} 个出检订单`,
      tone: 'danger'
    },
    {
      title: '内返率',
      value: formatRate(summary.internal_rework_rate),
      detail: `${summary.internal_rework_count} 次生产责任返工`,
      tone: 'warning'
    },
    {
      title: '外返率',
      value: formatRate(summary.external_rework_rate),
      detail: `${summary.external_rework_count} 次医生或客服侧返工`,
      tone: 'purple'
    },
    {
      title: '一次通过率',
      value: formatRate(summary.first_pass_rate),
      detail: '按订单首个出检结果统计',
      tone: 'success'
    },
    {
      title: '终检通过率',
      value: formatRate(summary.final_pass_rate),
      detail: '按订单最新出检结果统计',
      tone: 'info'
    },
    {
      title: '投诉率 / 退货率',
      value: `${formatRate(summary.complaint_rate)} / ${formatRate(summary.return_rate)}`,
      detail: '投诉和退货数据表待接入',
      tone: 'neutral'
    }
  ]
})
const productionEquipmentSummaryCards = computed(() => {
  const summary = productionEquipmentSummary.value
  if (!summary) {
    return []
  }
  return [
    {
      title: '设备台账',
      value: `${summary.total_equipment_count}`,
      detail: '当前纳入生产设备管理的设备总数',
      tone: 'info'
    },
    {
      title: '设备状态',
      value: `${summary.running_count} / ${summary.idle_count}`,
      detail: '运行中 / 待机设备',
      tone: 'success'
    },
    {
      title: '保养计划',
      value: `${summary.pending_maintenance_count}`,
      detail: `${summary.maintenance_count} 台设备处于保养状态`,
      tone: 'warning'
    },
    {
      title: '故障报修',
      value: `${summary.open_fault_count}`,
      detail: `${summary.fault_count} 台设备处于故障状态`,
      tone: 'danger'
    },
    {
      title: '停机时长',
      value: `${summary.downtime_minutes} 分钟`,
      detail: '按设备事件累计统计',
      tone: 'neutral'
    },
    {
      title: '设备稼动率',
      value: formatRate(summary.average_utilization_rate),
      detail: '按设备台账平均稼动率统计',
      tone: 'purple'
    }
  ]
})
const productionMaterialExceptionSummaryCards = computed(() => {
  const summary = productionMaterialExceptionSummary.value
  if (!summary) {
    return []
  }
  return [
    {
      title: '缺料',
      value: `${summary.shortage_count}`,
      detail: `${summary.total_exception_count} 条物料异常中的缺料记录`,
      tone: 'warning'
    },
    {
      title: '错料',
      value: `${summary.wrong_material_count}`,
      detail: '材料规格、型号或领用错误记录',
      tone: 'danger'
    },
    {
      title: '批次异常',
      value: `${summary.batch_abnormal_count}`,
      detail: '供应批次、检验结果或召回范围异常',
      tone: 'purple'
    },
    {
      title: '材料损耗',
      value: `${summary.material_loss_count}`,
      detail: `损耗数量合计 ${summary.total_loss_quantity}`,
      tone: 'neutral'
    },
    {
      title: '处理状态',
      value: `${summary.pending_count} / ${summary.in_progress_count} / ${summary.closed_count}`,
      detail: '待处理 / 处理中 / 已关闭',
      tone: 'info'
    },
    {
      title: '责任归属',
      value: `${summary.responsibility_assigned_count}`,
      detail: '已填写责任部门、班组或供应商的记录',
      tone: 'success'
    }
  ]
})
const productionSafetyEnvironmentSummaryCards = computed(() => {
  const summary = productionSafetyEnvironmentSummary.value
  if (!summary) {
    return []
  }
  return [
    {
      title: '安全巡检',
      value: `${summary.safety_inspection_count}`,
      detail: `${summary.total_event_count} 条安环事件中的巡检记录`,
      tone: 'info'
    },
    {
      title: '隐患整改',
      value: `${summary.hazard_rectification_count}`,
      detail: `超期待办 ${summary.overdue_count} 条`,
      tone: 'warning'
    },
    {
      title: '环境记录',
      value: `${summary.environment_record_count}`,
      detail: '温湿度、粉尘、通风和清洁记录',
      tone: 'success'
    },
    {
      title: 'PPE/设备安全提醒',
      value: `${summary.ppe_device_reminder_count}`,
      detail: '防护用品和设备安全提醒',
      tone: 'purple'
    },
    {
      title: '安环事件统计',
      value: `${summary.pending_count} / ${summary.in_progress_count} / ${summary.closed_count}`,
      detail: '待处理 / 处理中 / 已关闭',
      tone: 'neutral'
    },
    {
      title: '高风险待办',
      value: `${summary.high_risk_count}`,
      detail: 'HIGH / CRITICAL 风险等级事件',
      tone: 'danger'
    }
  ]
})
const productionCostSummaryCards = computed(() => {
  const summary = productionCostSummary.value
  if (!summary) {
    return []
  }
  return [
    {
      title: '工序成本',
      value: formatMoney(summary.process_cost_amount),
      detail: `${summary.record_count} 条成本记录中的工序成本`,
      tone: 'info'
    },
    {
      title: '材料成本',
      value: formatMoney(summary.material_cost_amount),
      detail: '材料领用、损耗和补料成本',
      tone: 'warning'
    },
    {
      title: '人工成本',
      value: formatMoney(summary.labor_cost_amount),
      detail: '按工时和岗位核算的人工成本',
      tone: 'success'
    },
    {
      title: '返工成本',
      value: formatMoney(summary.rework_cost_amount),
      detail: '内返、外返和终检返工成本',
      tone: 'danger'
    },
    {
      title: '外协成本',
      value: formatMoney(summary.outsourcing_cost_amount),
      detail: '外协订单、供应商费用和结算偏差',
      tone: 'purple'
    },
    {
      title: '成本异常预警',
      value: `${summary.abnormal_warning_count}`,
      detail: `当前累计成本 ${formatMoney(summary.total_cost_amount)}`,
      tone: 'neutral'
    }
  ]
})
const productionRewardPenaltySummaryCards = computed(() => {
  const summary = productionRewardPenaltySummary.value
  if (!summary) {
    return []
  }
  return [
    {
      title: '奖惩记录',
      value: `${summary.total_record_count}`,
      detail: `奖励 ${summary.reward_count} 条 / 扣罚 ${summary.penalty_count} 条`,
      tone: 'info'
    },
    {
      title: '奖惩原因',
      value: `${summary.reward_count + summary.penalty_count}`,
      detail: '质量、效率、纪律、安环和客户反馈等原因',
      tone: 'warning'
    },
    {
      title: '关联对象',
      value: `${summary.related_order_count} / ${summary.related_process_count} / ${summary.related_employee_count}`,
      detail: '关联订单 / 工序 / 员工',
      tone: 'success'
    },
    {
      title: '审批状态',
      value: `${summary.pending_count} / ${summary.approved_count} / ${summary.rejected_count}`,
      detail: '待审批 / 已通过 / 已驳回',
      tone: 'purple'
    },
    {
      title: '月度汇总',
      value: formatMoney(summary.monthly_amount),
      detail: `${summary.effective_count} 条已生效奖惩`,
      tone: 'neutral'
    },
    {
      title: '绩效影响',
      value: formatMoney(summary.monthly_amount),
      detail: '按本月奖惩金额纳入绩效影响预估',
      tone: 'danger'
    }
  ]
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

function selectPortal(option: PortalOption) {
  selectedPortal.value = option.value
  username.value = option.defaultUsername
  password.value = option.defaultPassword
  loginError.value = ''
}

function portalRouteFor(payload: LoginResponse) {
  const preferredRoute = selectedPortal.value ? portalDefaultRoute[selectedPortal.value] : '/dashboard'
  if (payload.menus.some((menu) => menu.routePath === preferredRoute)) {
    return preferredRoute
  }
  return payload.menus.find((menu) => menu.routePath)?.routePath ?? '/dashboard'
}

async function login() {
  if (!selectedPortal.value) {
    loginError.value = '请先选择登录入口'
    return
  }
  loading.value = true
  loginError.value = ''
  notificationError.value = ''
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value, portal: selectedPortal.value })
    })
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('账号角色与所选入口不匹配')
      }
      throw new Error(`登录失败：${response.status}`)
    }
    const payload = await response.json() as LoginResponse
    await applyLoginSession(payload, portalRouteFor(payload))
    connectNotificationSocket()
  } catch (error) {
    loginError.value = error instanceof Error ? error.message : '登录失败'
  } finally {
    loading.value = false
  }
}

async function applyLoginSession(payload: LoginResponse, nextRoute: string) {
  token.value = payload.accessToken
  refreshToken.value = payload.refreshToken
  currentUser.value = payload
  activePortalTone.value = selectedPortal.value ? portalToneByLoginPortal[selectedPortal.value] : activePortalTone.value
  activeRoute.value = nextRoute
  activePrototypeChip.value = ''
  activeNavId.value = findDisplayItemByRoute(nextRoute)?.id ?? `${portalTone.value}-dashboard`
  await loadNotifications()
  await loadActiveRouteData()
}

async function loadActiveRouteData() {
  if (activeRoute.value === '/dashboard') {
    await loadPhaseOneAbDashboardData()
  } else if (activeRoute.value === '/doctor/orders') {
    await loadDoctorOrderForm()
    await loadDoctorOrders()
  } else if (activeRoute.value === '/orders/internal') {
    await loadInternalOrders()
  } else if (activeRoute.value === '/collaboration') {
    await loadCustomerCollaborationPage()
  } else if (activeRoute.value === '/ai/cs') {
    csAiQueryError.value = ''
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
  } else if (isStaffWorkloadRoute.value) {
    await loadStaffWorkload()
  } else if (activeRoute.value === '/production/board') {
    await loadProductionBoardOrders()
  } else if (activeRoute.value === '/admin/ai-governance') {
    await loadAiGovernanceLocalHardening()
  } else if (activeRoute.value === '/delivery') {
    await loadDeliveryOrders()
  } else if (isProductionQualitySummaryRoute.value) {
    await loadProductionQualityPage()
  } else if (isProductionEquipmentSummaryRoute.value) {
    await loadProductionEquipmentSummary()
  } else if (isProductionMaterialExceptionSummaryRoute.value) {
    await loadProductionMaterialExceptionSummary()
  } else if (isProductionSafetyEnvironmentSummaryRoute.value) {
    await loadProductionSafetyEnvironmentSummary()
  } else if (isProductionCostSummaryRoute.value) {
    await loadProductionCostSummary()
  } else if (isProductionRewardPenaltySummaryRoute.value) {
    await loadProductionRewardPenaltySummary()
  } else if (activeRoute.value === '/system/form-configs') {
    await loadProductCatalog()
    await loadFormConfigFields()
  } else if (activeRoute.value === '/system/rework-dictionaries') {
    await loadReworkDictionaryManageItems()
  }
}

async function refreshSession() {
  if (!refreshToken.value) {
    loginError.value = '缺少 refresh token，请重新登录'
    return
  }
  authActionLoading.value = true
  loginError.value = ''
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken.value })
    })
    if (!response.ok) {
      throw new Error(`刷新登录失败：${response.status}`)
    }
    const payload = await response.json() as LoginResponse
    await applyLoginSession(payload, activeRoute.value)
    connectNotificationSocket()
  } catch (error) {
    loginError.value = error instanceof Error ? error.message : '刷新登录失败'
  } finally {
    authActionLoading.value = false
  }
}

async function logout() {
  authActionLoading.value = true
  loginError.value = ''
  const tokenToRevoke = refreshToken.value
  try {
    if (tokenToRevoke) {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: tokenToRevoke })
      })
      if (!response.ok) {
        throw new Error(`退出登录失败：${response.status}`)
      }
    }
  } catch (error) {
    loginError.value = error instanceof Error ? error.message : '退出登录失败'
  } finally {
    clearLoginSession()
    authActionLoading.value = false
  }
}

function clearLoginSession() {
  token.value = ''
  refreshToken.value = ''
  currentUser.value = null
  activePortalTone.value = null
  activeRoute.value = '/dashboard'
  activeNavId.value = 'dashboard'
  activePrototypeChip.value = ''
  unreadCount.value = 0
  notifications.value = []
  lastRealtimeNotification.value = null
  phaseOneAbDashboardDataError.value = ''
  phaseOneAbDashboardLastSyncedAt.value = ''
  phaseOneAbDashboardOrders.value = []
  phaseOneAbDashboardPendingMessages.value = []
  phaseOneAbDashboardDeliveryOrders.value = []
  aiGovernanceLocalHardening.value = null
  aiGovernanceLocalHardeningError.value = ''
  closeNotificationSocket()
}

function navigateToRoute(routePath: string) {
  activeRoute.value = routePath
  activePrototypeChip.value = ''
  if (routePath === '/dashboard') {
    void loadPhaseOneAbDashboardData()
  } else if (routePath === '/notifications') {
    void loadNotifications()
  } else if (routePath === '/doctor/orders') {
    void loadDoctorOrderForm()
    void loadDoctorOrders()
    void loadDoctorPatients()
  } else if (routePath === '/doctor/patients') {
    void loadDoctorPatients()
  } else if (routePath === '/customers' || routePath === '/admin/clinics') {
    void loadClinics()
  } else if (routePath === '/doctor/account/settings') {
    void loadDoctorAccountSettings()
  } else if (routePath === '/doctor/account/clinic') {
    void loadDoctorClinicPreference()
  } else if (routePath === '/orders/internal') {
    void loadInternalOrders()
  } else if (routePath === '/workflow/review') {
    void loadProductionReviewPage()
  } else if (routePath === '/workflow/process-instance' || routePath === '/workflow/assign') {
    void loadProcessInstancePage()
  } else if (routePath === '/tasks/mine') {
    void loadWorkerTasks()
  } else if (routePath === '/checks') {
    void loadCheckTasks()
  } else if (routePath === '/rework-final') {
    void loadReworkFinalPage()
  } else if (routePath === '/worklogs/self') {
    void loadWorklogTasks()
  } else if (routePath === '/performance') {
    void loadPerformanceStats()
  } else if (routePath === '/production/staff' || routePath === '/admin/staff') {
    void loadStaffWorkload()
  } else if (routePath === '/production/board') {
    void loadProductionBoardOrders()
  } else if (routePath === '/admin/ai-governance') {
    void loadAiGovernanceLocalHardening()
  } else if ([
    '/production/quality',
    '/production/rework-management'
  ].includes(routePath)) {
    void loadProductionQualityPage()
  } else if (routePath === '/production/devices') {
    void loadProductionEquipmentSummary()
  } else if (routePath === '/production/material-exceptions') {
    void loadProductionMaterialExceptionSummary()
  } else if (routePath === '/production/safety-environment') {
    void loadProductionSafetyEnvironmentSummary()
  } else if (routePath === '/production/cost-management' || routePath === '/production/outsourcing-cost') {
    void loadProductionCostSummary()
  } else if (routePath === '/production/reward-penalty') {
    void loadProductionRewardPenaltySummary()
  } else if (routePath === '/system/form-configs') {
    void loadProductCatalog()
    void loadFormConfigFields()
  } else if (routePath === '/system/rework-dictionaries') {
    void loadReworkDictionaryManageItems()
  }
}

function selectDisplayNavigationItem(item: DisplayNavigationItem | BusinessShortcut) {
  activeNavId.value = item.id
  if (item.doctorSection) {
    activeDoctorOrderSection.value = item.doctorSection
  }
  if (item.doctorDetailTab) {
    activeDoctorDetailTab.value = item.doctorDetailTab
  }
  if (item.routePath) {
    navigateToRoute(item.routePath)
  }
}

function selectMenu(menu: AuthMenu) {
  if (menu.routePath) {
    const displayItem = findDisplayItemByRoute(menu.routePath)
    if (displayItem) {
      selectDisplayNavigationItem(displayItem)
    } else {
      navigateToRoute(menu.routePath)
    }
  }
}

function selectBusinessShortcut(shortcut: BusinessShortcut) {
  selectDisplayNavigationItem(shortcut)
}

function selectDashboardAction(action: DashboardAction) {
  if (action.navId) {
    const displayItem = findDisplayItemById(action.navId)
    if (displayItem) {
      selectDisplayNavigationItem({
        ...displayItem,
        doctorSection: action.doctorSection ?? displayItem.doctorSection,
        doctorDetailTab: action.doctorDetailTab ?? displayItem.doctorDetailTab
      })
      return
    }
  }
  if (action.doctorSection) {
    activeDoctorOrderSection.value = action.doctorSection
  }
  if (action.doctorDetailTab) {
    activeDoctorDetailTab.value = action.doctorDetailTab
  }
  if (action.routePath) {
    navigateToRoute(action.routePath)
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

async function loadPhaseOneAbDashboardData() {
  if (!token.value || !['cs', 'production', 'admin'].includes(portalTone.value)) {
    return
  }
  phaseOneAbDashboardDataLoading.value = true
  phaseOneAbDashboardDataError.value = ''
  const errors: string[] = []
  const fetchResource = async <T>(label: string, request: () => Promise<ApiResponse<T>>) => {
    try {
      const payload = await request()
      return payload.data
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误'
      errors.push(`${label} ${message}`)
      return null
    }
  }
  try {
    const [
      dashboardSummary,
      orderList,
      pendingMessages,
      qualitySummary,
      deliveryList,
      staffWorkload,
      equipmentSummary,
      materialSummary,
      safetySummary,
      costSummary,
      rewardSummary
    ] = await Promise.all([
      fetchResource('月度趋势 / 客户排名', () => apiFetch<PhaseOneAbDashboardResponse>('/dashboards/phase-one-ab')),
      fetchResource('订单统计', () => apiFetch<InternalOrderListResponse>('/orders?page=1&size=100')),
      fetchResource('待审消息', () => apiFetch<MessageItem[]>('/messages/pending-review')),
      fetchResource('质量返工', () => apiFetch<ProductionQualitySummaryResponse>('/production/quality/summary')),
      fetchResource('账单物流', () => apiFetch<DeliveryOrderItem[]>('/logistics/orders?limit=50')),
      ['production', 'admin'].includes(portalTone.value)
        ? fetchResource('人员工作量', () => apiFetch<StaffWorkloadListResponse>('/staff/workload?page=1&size=50'))
        : Promise.resolve(null),
      ['production', 'admin'].includes(portalTone.value)
        ? fetchResource('设备汇总', () => apiFetch<ProductionEquipmentSummaryResponse>('/production/equipment/summary'))
        : Promise.resolve(null),
      ['production', 'admin'].includes(portalTone.value)
        ? fetchResource('物料汇总', () => apiFetch<ProductionMaterialExceptionSummaryResponse>('/production/material-exceptions/summary'))
        : Promise.resolve(null),
      ['production', 'admin'].includes(portalTone.value)
        ? fetchResource('安环汇总', () => apiFetch<ProductionSafetyEnvironmentSummaryResponse>('/production/safety-environment/summary'))
        : Promise.resolve(null),
      ['production', 'admin'].includes(portalTone.value)
        ? fetchResource('成本汇总', () => apiFetch<ProductionCostSummaryResponse>('/production/cost-management/summary'))
        : Promise.resolve(null),
      ['production', 'admin'].includes(portalTone.value)
        ? fetchResource('奖惩汇总', () => apiFetch<ProductionRewardPenaltySummaryResponse>('/production/reward-penalty/summary'))
        : Promise.resolve(null)
    ])
    phaseOneAbDashboardSummary.value = dashboardSummary
    phaseOneAbDashboardOrders.value = orderList?.items ?? []
    phaseOneAbDashboardPendingMessages.value = pendingMessages ?? []
    phaseOneAbDashboardDeliveryOrders.value = deliveryList ?? []
    if (qualitySummary) {
      productionQualitySummary.value = qualitySummary
    }
    if (staffWorkload) {
      staffWorkloadItems.value = staffWorkload.items
      staffWorkloadTotal.value = staffWorkload.total
    }
    if (equipmentSummary) {
      productionEquipmentSummary.value = equipmentSummary
    }
    if (materialSummary) {
      productionMaterialExceptionSummary.value = materialSummary
    }
    if (safetySummary) {
      productionSafetyEnvironmentSummary.value = safetySummary
    }
    if (costSummary) {
      productionCostSummary.value = costSummary
    }
    if (rewardSummary) {
      productionRewardPenaltySummary.value = rewardSummary
    }
    phaseOneAbDashboardLastSyncedAt.value = new Date().toISOString()
    phaseOneAbDashboardDataError.value = errors.length > 0
      ? `部分统计待同步：${errors.join('；')}`
      : ''
  } finally {
    phaseOneAbDashboardDataLoading.value = false
  }
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

async function loadDoctorPatients() {
  if (!token.value) {
    return
  }
  doctorPatientsLoading.value = true
  doctorPatientError.value = ''
  try {
    const params = new URLSearchParams({ page: '1', size: '20' })
    if (doctorPatientKeyword.value.trim()) {
      params.set('keyword', doctorPatientKeyword.value.trim())
    }
    const payload = await apiFetch<PatientListResponse>(`/patients?${params.toString()}`)
    doctorPatients.value = payload.data.items
    const selectedStillVisible = selectedDoctorPatient.value
      ? payload.data.items.some((item) => item.patient_id === selectedDoctorPatient.value?.patient_id)
      : false
    if (!selectedStillVisible) {
      selectedDoctorPatient.value = payload.data.items[0] ?? null
    }
    if (selectedDoctorPatient.value) {
      selectedDoctorPatientId.value = selectedDoctorPatient.value.patient_id
      await loadDoctorPatientOrders(selectedDoctorPatient.value.patient_id)
    } else {
      doctorPatientOrders.value = []
    }
  } catch (error) {
    doctorPatientError.value = error instanceof Error ? error.message : '患者档案加载失败'
  } finally {
    doctorPatientsLoading.value = false
  }
}

async function loadDoctorPatientOrders(patientId: number) {
  if (!token.value) {
    return
  }
  try {
    const payload = await apiFetch<PatientOrderListResponse>(`/patients/${patientId}/orders?page=1&size=20`)
    doctorPatientOrders.value = payload.data.items
  } catch (error) {
    doctorPatientError.value = error instanceof Error ? error.message : '患者历史订单加载失败'
  }
}

async function selectDoctorPatient(patient: PatientRecord) {
  selectedDoctorPatient.value = patient
  selectedDoctorPatientId.value = patient.patient_id
  await loadDoctorPatientOrders(patient.patient_id)
}

async function createDoctorPatient() {
  if (!token.value || !doctorPatientName.value.trim()) {
    return
  }
  doctorPatientCreateLoading.value = true
  doctorPatientError.value = ''
  doctorPatientCreateResult.value = ''
  try {
    const payload = await apiFetch<PatientRecord>('/patients', {
      method: 'POST',
      body: JSON.stringify({
        patient_name: doctorPatientName.value.trim(),
        patient_age: doctorPatientAge.value,
        patient_gender: doctorPatientGender.value,
        oral_description: doctorPatientOralDescription.value.trim()
      })
    })
    doctorPatientCreateResult.value = `已创建患者 ${payload.data.patient_name}`
    doctorPatientName.value = ''
    doctorPatientAge.value = null
    doctorPatientGender.value = 'UNKNOWN'
    doctorPatientOralDescription.value = ''
    selectedDoctorPatient.value = payload.data
    selectedDoctorPatientId.value = payload.data.patient_id
    await loadDoctorPatients()
  } catch (error) {
    doctorPatientError.value = error instanceof Error ? error.message : '患者档案创建失败'
  } finally {
    doctorPatientCreateLoading.value = false
  }
}

function syncClinicPreferenceForm(preference: ClinicPreference | null) {
  for (const key of Object.keys(clinicPreferenceForm.value)) {
    clinicPreferenceForm.value[key] = preference?.preferences[key] ?? ''
  }
}

async function loadClinics() {
  if (!token.value) {
    return
  }
  clinicLoading.value = true
  clinicError.value = ''
  clinicSaveResult.value = ''
  try {
    const params = new URLSearchParams({ page: '1', size: '20' })
    if (clinicKeyword.value.trim()) {
      params.set('keyword', clinicKeyword.value.trim())
    }
    const payload = await apiFetch<ClinicListResponse>(`/clinics?${params.toString()}`)
    clinics.value = payload.data.items
    const selectedStillVisible = selectedClinic.value
      ? payload.data.items.some((item) => item.clinic_id === selectedClinic.value?.clinic_id)
      : false
    if (!selectedStillVisible) {
      selectedClinic.value = payload.data.items[0] ?? null
    }
    if (selectedClinic.value) {
      await loadClinicPreference(selectedClinic.value.clinic_id)
    } else {
      clinicPreference.value = null
      syncClinicPreferenceForm(null)
    }
  } catch (error) {
    clinicError.value = error instanceof Error ? error.message : '诊所档案加载失败'
  } finally {
    clinicLoading.value = false
  }
}

async function selectClinic(clinic: ClinicItem) {
  selectedClinic.value = clinic
  clinicSaveResult.value = ''
  await loadClinicPreference(clinic.clinic_id)
}

async function loadClinicPreference(clinicId: number) {
  if (!token.value) {
    return
  }
  try {
    const payload = await apiFetch<ClinicPreference>(`/clinics/${clinicId}/preference`)
    clinicPreference.value = payload.data
    syncClinicPreferenceForm(payload.data)
  } catch (error) {
    clinicError.value = error instanceof Error ? error.message : '客户偏好加载失败'
  }
}

async function loadDoctorClinicPreference() {
  if (!token.value || !currentUser.value?.clinicId) {
    return
  }
  clinicLoading.value = true
  clinicError.value = ''
  try {
    const [clinicPayload, preferencePayload] = await Promise.all([
      apiFetch<ClinicItem>(`/clinics/${currentUser.value.clinicId}`),
      apiFetch<ClinicPreference>(`/clinics/${currentUser.value.clinicId}/preference`)
    ])
    selectedClinic.value = clinicPayload.data
    clinicPreference.value = preferencePayload.data
    syncClinicPreferenceForm(preferencePayload.data)
  } catch (error) {
    clinicError.value = error instanceof Error ? error.message : '诊所信息加载失败'
  } finally {
    clinicLoading.value = false
  }
}

function syncDoctorAccountSettingsForm(settings: DoctorAccountSettings) {
  doctorAccountSettingsForm.value = {
    display_name: settings.display_name ?? '',
    contact_email: settings.contact_email ?? '',
    contact_phone: settings.contact_phone ?? '',
    shipping_address: settings.shipping_address ?? '',
    notification_push_enabled: settings.notification_push_enabled
  }
}

async function loadDoctorAccountSettings() {
  if (!token.value) {
    return
  }
  doctorAccountLoading.value = true
  doctorAccountError.value = ''
  try {
    const payload = await apiFetch<DoctorAccountSettings>('/doctor/account/settings')
    doctorAccountSettings.value = payload.data
    syncDoctorAccountSettingsForm(payload.data)
  } catch (error) {
    doctorAccountError.value = error instanceof Error ? error.message : '账户设置加载失败'
  } finally {
    doctorAccountLoading.value = false
  }
}

async function saveDoctorAccountSettings() {
  if (!token.value) {
    return
  }
  doctorAccountSaveLoading.value = true
  doctorAccountError.value = ''
  doctorAccountResult.value = ''
  try {
    const payload = await apiFetch<DoctorAccountSettings>('/doctor/account/settings', {
      method: 'PUT',
      body: JSON.stringify(doctorAccountSettingsForm.value)
    })
    doctorAccountSettings.value = payload.data
    syncDoctorAccountSettingsForm(payload.data)
    doctorAccountResult.value = '账户设置已保存'
  } catch (error) {
    doctorAccountError.value = error instanceof Error ? error.message : '账户设置保存失败'
  } finally {
    doctorAccountSaveLoading.value = false
  }
}

async function changeDoctorAccountPassword() {
  if (!token.value || !doctorAccountCurrentPassword.value || !doctorAccountNewPassword.value) {
    return
  }
  doctorAccountPasswordLoading.value = true
  doctorAccountError.value = ''
  doctorAccountResult.value = ''
  try {
    await apiFetch<DoctorAccountSettings>('/doctor/account/password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: doctorAccountCurrentPassword.value,
        new_password: doctorAccountNewPassword.value
      })
    })
    doctorAccountCurrentPassword.value = ''
    doctorAccountNewPassword.value = ''
    doctorAccountResult.value = '密码已更新，请继续使用当前登录态完成本次操作'
  } catch (error) {
    doctorAccountError.value = error instanceof Error ? error.message : '密码修改失败'
  } finally {
    doctorAccountPasswordLoading.value = false
  }
}

async function createClinic() {
  if (!token.value || !clinicCreateName.value.trim()) {
    return
  }
  clinicSaveLoading.value = true
  clinicError.value = ''
  clinicSaveResult.value = ''
  try {
    const payload = await apiFetch<ClinicItem>('/clinics', {
      method: 'POST',
      body: JSON.stringify({
        clinic_name: clinicCreateName.value.trim(),
        contact_name: clinicCreateContactName.value.trim(),
        contact_phone: clinicCreateContactPhone.value.trim()
      })
    })
    selectedClinic.value = payload.data
    clinicCreateName.value = ''
    clinicCreateContactName.value = ''
    clinicCreateContactPhone.value = ''
    clinicSaveResult.value = `已创建诊所 ${payload.data.clinic_name}`
    await loadClinics()
  } catch (error) {
    clinicError.value = error instanceof Error ? error.message : '诊所创建失败'
  } finally {
    clinicSaveLoading.value = false
  }
}

async function saveClinicPreference() {
  if (!token.value || !selectedClinic.value) {
    return
  }
  clinicSaveLoading.value = true
  clinicError.value = ''
  clinicSaveResult.value = ''
  try {
    const payload = await apiFetch<ClinicPreference>(`/clinics/${selectedClinic.value.clinic_id}/preference`, {
      method: 'PUT',
      body: JSON.stringify(clinicPreferenceForm.value)
    })
    clinicPreference.value = payload.data
    syncClinicPreferenceForm(payload.data)
    const clinicIndex = clinics.value.findIndex((item) => item.clinic_id === payload.data.clinic_id)
    if (clinicIndex >= 0) {
      clinics.value[clinicIndex] = {
        ...clinics.value[clinicIndex],
        preference_count: Object.values(payload.data.preferences).filter(Boolean).length,
        updated_at: payload.data.updated_at
      }
      selectedClinic.value = clinics.value[clinicIndex]
    }
    clinicSaveResult.value = '客户偏好已保存'
  } catch (error) {
    clinicError.value = error instanceof Error ? error.message : '客户偏好保存失败'
  } finally {
    clinicSaveLoading.value = false
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
  doctorPreSubmitMissingItems.value = []
  doctorPreSubmitMissingComplete.value = null
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

function parseFormConfigOptions(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

async function loadProductCatalog() {
  if (!token.value) {
    return
  }
  productCatalogLoading.value = true
  productCatalogError.value = ''
  try {
    const params = new URLSearchParams()
    if (productCatalogKeyword.value.trim()) {
      params.set('keyword', productCatalogKeyword.value.trim())
    }
    const payload = await apiFetch<ProductCatalogListResponse>(`/products?${params.toString()}`)
    productCatalogItems.value = payload.data.items
    const selectedStillVisible = selectedProductCatalogId.value
      ? payload.data.items.some((item) => item.product_id === selectedProductCatalogId.value)
      : false
    if (!selectedStillVisible) {
      selectedProductCatalogId.value = payload.data.items[0]?.product_id ?? null
      if (selectedProductCatalogItem.value) {
        selectProductCatalogItem(selectedProductCatalogItem.value)
      }
    }
  } catch (error) {
    productCatalogError.value = error instanceof Error ? error.message : '产品目录加载失败'
  } finally {
    productCatalogLoading.value = false
  }
}

function selectProductCatalogItem(item: ProductCatalogItem) {
  selectedProductCatalogId.value = item.product_id
  productCatalogEditName.value = item.product_name
  productCatalogEditMaterial.value = item.material_spec ?? ''
  productCatalogEditPrice.value = item.base_price_cents
  productCatalogEditCurrency.value = item.currency
  productCatalogEditStatus.value = item.status
  productCatalogEditNote.value = item.price_note ?? ''
  formConfigProductType.value = item.product_type
  formConfigCreateProductType.value = item.product_type
}

function resetProductCatalogCreateForm() {
  productCatalogCreateType.value = ''
  productCatalogCreateName.value = ''
  productCatalogCreateMaterial.value = ''
  productCatalogCreatePrice.value = 1
  productCatalogCreateCurrency.value = 'CNY'
  productCatalogCreateNote.value = ''
}

async function createProductCatalogItem() {
  if (!token.value) {
    return
  }
  productCatalogSaving.value = true
  productCatalogError.value = ''
  productCatalogResult.value = ''
  try {
    const response = await apiFetch<ProductCatalogItem>('/products', {
      method: 'POST',
      body: JSON.stringify({
        product_type: productCatalogCreateType.value.trim(),
        product_name: productCatalogCreateName.value.trim(),
        material_spec: productCatalogCreateMaterial.value.trim(),
        base_price_cents: productCatalogCreatePrice.value,
        currency: productCatalogCreateCurrency.value.trim(),
        status: 'ACTIVE',
        price_note: productCatalogCreateNote.value.trim()
      })
    })
    productCatalogResult.value = `已创建产品 ${response.data.product_type}`
    resetProductCatalogCreateForm()
    await loadProductCatalog()
    selectProductCatalogItem(response.data)
    await loadFormConfigFields()
  } catch (error) {
    productCatalogError.value = error instanceof Error ? error.message : '产品目录创建失败'
  } finally {
    productCatalogSaving.value = false
  }
}

async function updateProductCatalogItem(statusOverride?: string) {
  if (!token.value || !selectedProductCatalogId.value) {
    return
  }
  productCatalogSaving.value = true
  productCatalogError.value = ''
  productCatalogResult.value = ''
  try {
    const response = await apiFetch<ProductCatalogItem>(`/products/${selectedProductCatalogId.value}`, {
      method: 'PUT',
      body: JSON.stringify({
        product_name: productCatalogEditName.value.trim(),
        material_spec: productCatalogEditMaterial.value.trim(),
        base_price_cents: productCatalogEditPrice.value,
        currency: productCatalogEditCurrency.value.trim(),
        status: statusOverride ?? productCatalogEditStatus.value,
        price_note: productCatalogEditNote.value.trim()
      })
    })
    productCatalogResult.value = `已更新产品 ${response.data.product_type}`
    await loadProductCatalog()
    selectProductCatalogItem(response.data)
  } catch (error) {
    productCatalogError.value = error instanceof Error ? error.message : '产品目录更新失败'
  } finally {
    productCatalogSaving.value = false
  }
}

async function loadFormConfigFields() {
  if (!token.value) {
    return
  }
  formConfigLoading.value = true
  formConfigError.value = ''
  try {
    const params = new URLSearchParams()
    if (formConfigProductType.value.trim()) {
      params.set('product_type', formConfigProductType.value.trim())
    }
    const payload = await apiFetch<FormFieldConfig[]>(`/form-configs?${params.toString()}`)
    formConfigFields.value = payload.data
    const selectedStillVisible = selectedFormConfigFieldId.value
      ? payload.data.some((field) => field.field_id === selectedFormConfigFieldId.value)
      : false
    if (!selectedStillVisible) {
      selectedFormConfigFieldId.value = payload.data[0]?.field_id ?? null
      if (selectedFormConfigField.value) {
        selectFormConfigField(selectedFormConfigField.value)
      }
    }
  } catch (error) {
    formConfigError.value = error instanceof Error ? error.message : '动态表单配置加载失败'
  } finally {
    formConfigLoading.value = false
  }
}

function selectFormConfigField(field: FormFieldConfig) {
  selectedFormConfigFieldId.value = field.field_id
  formConfigEditLabel.value = field.field_label
  formConfigEditRequired.value = field.is_required
  formConfigEditOptions.value = field.options.join(', ')
  formConfigEditSortOrder.value = field.sort_order
  formConfigEditStatus.value = field.status
}

function resetFormConfigCreateForm() {
  formConfigCreateKey.value = ''
  formConfigCreateLabel.value = ''
  formConfigCreateType.value = 'text'
  formConfigCreateRequired.value = false
  formConfigCreateOptions.value = ''
  formConfigCreateSortOrder.value = 10
}

async function createFormConfigField() {
  if (!token.value) {
    return
  }
  formConfigSaving.value = true
  formConfigError.value = ''
  formConfigResult.value = ''
  try {
    const payload: FormFieldPayload = {
      product_type: formConfigCreateProductType.value.trim(),
      field_key: formConfigCreateKey.value.trim(),
      field_label: formConfigCreateLabel.value.trim(),
      field_type: formConfigCreateType.value,
      is_required: formConfigCreateRequired.value,
      options: parseFormConfigOptions(formConfigCreateOptions.value),
      sort_order: formConfigCreateSortOrder.value
    }
    const response = await apiFetch<FormFieldConfig>('/form-configs', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    formConfigProductType.value = response.data.product_type
    formConfigResult.value = `已创建字段 ${response.data.field_key}`
    resetFormConfigCreateForm()
    await loadFormConfigFields()
    selectFormConfigField(response.data)
  } catch (error) {
    formConfigError.value = error instanceof Error ? error.message : '动态表单字段创建失败'
  } finally {
    formConfigSaving.value = false
  }
}

async function updateFormConfigField(statusOverride?: string) {
  if (!token.value || !selectedFormConfigFieldId.value) {
    return
  }
  formConfigSaving.value = true
  formConfigError.value = ''
  formConfigResult.value = ''
  try {
    const payload: FormFieldPayload = {
      field_label: formConfigEditLabel.value.trim(),
      is_required: formConfigEditRequired.value,
      options: parseFormConfigOptions(formConfigEditOptions.value),
      sort_order: formConfigEditSortOrder.value,
      status: statusOverride ?? formConfigEditStatus.value
    }
    const response = await apiFetch<FormFieldConfig>(`/form-configs/${selectedFormConfigFieldId.value}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
    formConfigResult.value = `已更新字段 ${response.data.field_key}`
    await loadFormConfigFields()
    if (response.data.status === 'ACTIVE') {
      selectFormConfigField(response.data)
    }
  } catch (error) {
    formConfigError.value = error instanceof Error ? error.message : '动态表单字段更新失败'
  } finally {
    formConfigSaving.value = false
  }
}

async function loadReworkDictionaryManageItems() {
  if (!token.value) {
    return
  }
  reworkDictionaryManageLoading.value = true
  reworkDictionaryManageError.value = ''
  try {
    const params = new URLSearchParams()
    params.set('dictionary_type', reworkDictionaryManageType.value)
    const payload = await apiFetch<ReworkDictionaryItem[]>(`/reworks/dictionaries/items?${params.toString()}`)
    reworkDictionaryManageItems.value = payload.data
    const selectedStillVisible = selectedReworkDictionaryItemId.value
      ? payload.data.some((item) => item.item_id === selectedReworkDictionaryItemId.value)
      : false
    if (!selectedStillVisible) {
      selectedReworkDictionaryItemId.value = payload.data[0]?.item_id ?? null
      if (selectedReworkDictionaryItem.value) {
        selectReworkDictionaryItem(selectedReworkDictionaryItem.value)
      }
    }
  } catch (error) {
    reworkDictionaryManageError.value = error instanceof Error ? error.message : '返工字典加载失败'
  } finally {
    reworkDictionaryManageLoading.value = false
  }
}

function selectReworkDictionaryItem(item: ReworkDictionaryItem) {
  selectedReworkDictionaryItemId.value = item.item_id
  reworkDictionaryEditLabel.value = item.label
  reworkDictionaryEditSortOrder.value = item.sort_order
  reworkDictionaryEditStatus.value = item.status
}

function resetReworkDictionaryCreateForm() {
  reworkDictionaryCreateCode.value = ''
  reworkDictionaryCreateLabel.value = ''
  reworkDictionaryCreateSortOrder.value = 50
}

async function createReworkDictionaryItem() {
  if (!token.value) {
    return
  }
  reworkDictionaryManageSaving.value = true
  reworkDictionaryManageError.value = ''
  reworkDictionaryManageResult.value = ''
  try {
    const payload: ReworkDictionaryItemPayload = {
      dictionary_type: reworkDictionaryManageType.value,
      code: reworkDictionaryCreateCode.value.trim(),
      label: reworkDictionaryCreateLabel.value.trim(),
      sort_order: reworkDictionaryCreateSortOrder.value
    }
    const response = await apiFetch<ReworkDictionaryItem>('/reworks/dictionaries/items', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    reworkDictionaryManageType.value = response.data.dictionary_type
    reworkDictionaryManageResult.value = `已新增字典 ${response.data.code}`
    resetReworkDictionaryCreateForm()
    await loadReworkDictionaryManageItems()
    selectReworkDictionaryItem(response.data)
  } catch (error) {
    reworkDictionaryManageError.value = error instanceof Error ? error.message : '返工字典新增失败'
  } finally {
    reworkDictionaryManageSaving.value = false
  }
}

async function updateReworkDictionaryItem(statusOverride?: string) {
  if (!token.value || !selectedReworkDictionaryItemId.value) {
    return
  }
  reworkDictionaryManageSaving.value = true
  reworkDictionaryManageError.value = ''
  reworkDictionaryManageResult.value = ''
  try {
    const payload: ReworkDictionaryItemPayload = {
      label: reworkDictionaryEditLabel.value.trim(),
      sort_order: reworkDictionaryEditSortOrder.value,
      status: statusOverride ?? reworkDictionaryEditStatus.value
    }
    const response = await apiFetch<ReworkDictionaryItem>(
      `/reworks/dictionaries/items/${selectedReworkDictionaryItemId.value}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload)
      }
    )
    reworkDictionaryManageResult.value = `已更新字典 ${response.data.code}`
    await loadReworkDictionaryManageItems()
    selectReworkDictionaryItem(response.data)
  } catch (error) {
    reworkDictionaryManageError.value = error instanceof Error ? error.message : '返工字典更新失败'
  } finally {
    reworkDictionaryManageSaving.value = false
  }
}

function buildDoctorOrderFormData() {
  const formData: Record<string, string | string[]> = {}
  for (const field of doctorOrderFormFields.value) {
    formData[field.field_key] = doctorOrderFormData.value[field.field_key] ?? ''
  }
  return formData
}

type DoctorOrderPayload = {
  patient_id: number | null
  product_type: string
  form_data: Record<string, string | string[]>
  file_ids: number[]
}

async function saveDoctorOrderPayloadAsDraft(orderPayload: DoctorOrderPayload) {
  return doctorOrderEditingId.value
    ? apiFetch<CreateOrderResponse>(`/orders/${doctorOrderEditingId.value}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...orderPayload,
        submit: false
      })
    })
    : apiFetch<CreateOrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        ...orderPayload,
        is_draft: true
      })
    })
}

function submitSavedDoctorOrder(orderId: number, orderPayload: DoctorOrderPayload) {
  return apiFetch<CreateOrderResponse>(`/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...orderPayload,
      submit: true
    })
  })
}

async function autoCheckDoctorOrderMissingBeforeSubmit(orderId: number) {
  const payload = await apiFetch<MissingInfoResponse>('/ai/check-missing', {
    method: 'POST',
    body: JSON.stringify({
      order_id: orderId
    })
  })
  doctorPreSubmitMissingComplete.value = payload.data.is_complete
  doctorPreSubmitMissingItems.value = payload.data.missing_items
  if (!payload.data.is_complete) {
    doctorOrderCreateError.value = 'AI-4 资料缺失检查：请先补齐必填资料后再提交'
  }
  return payload.data.is_complete
}

async function submitDoctorOrderForm(draft: boolean) {
  if (!token.value || doctorOrderFormFields.value.length === 0) {
    return
  }
  doctorOrderCreateLoading.value = true
  doctorOrderCreateError.value = ''
  doctorOrderCreateResult.value = null
  doctorPreSubmitMissingItems.value = []
  doctorPreSubmitMissingComplete.value = null
  try {
    const formData = buildDoctorOrderFormData()
    const orderPayload: DoctorOrderPayload = {
      patient_id: selectedDoctorPatientId.value,
      product_type: doctorOrderFormProductType.value.trim(),
      form_data: formData,
      file_ids: parseDoctorOrderFileIds()
    }
    const draftPayload = await saveDoctorOrderPayloadAsDraft(orderPayload)
    doctorOrderEditingId.value = draftPayload.data.order_id
    doctorOrderKeyword.value = draftPayload.data.order_no

    if (!draft) {
      const isComplete = await autoCheckDoctorOrderMissingBeforeSubmit(draftPayload.data.order_id)
      if (!isComplete) {
        doctorOrderCreateResult.value = draftPayload.data
        await loadDoctorOrders()
        await loadDoctorOrderWorkspace(draftPayload.data.order_id)
        return
      }
    }

    const payload = draft
      ? draftPayload
      : await submitSavedDoctorOrder(draftPayload.data.order_id, orderPayload)
    doctorOrderCreateResult.value = payload.data
    doctorOrderFileIds.value = ''
    doctorOrderEditingId.value = draft ? payload.data.order_id : null
    doctorOrderKeyword.value = payload.data.order_no
    await loadDoctorOrders()
    await loadDoctorOrderWorkspace(payload.data.order_id)
  } catch (error) {
    doctorOrderCreateError.value = error instanceof Error ? error.message : '医生订单保存失败'
  } finally {
    doctorOrderCreateLoading.value = false
  }
}

function createDoctorOrder() {
  return submitDoctorOrderForm(false)
}

function saveDoctorOrderDraft() {
  return submitDoctorOrderForm(true)
}

function submitDoctorOrderSupplement() {
  return submitDoctorOrderForm(false)
}

async function startDoctorOrderEdit(order: DoctorOrderItem) {
  doctorOrderEditingId.value = order.order_id
  selectedDoctorPatientId.value = order.patient_id ?? selectedDoctorPatientId.value
  doctorOrderFormProductType.value = order.product_type
  const nextData: Record<string, string | string[]> = {}
  for (const [key, value] of Object.entries(order.form_data ?? {})) {
    nextData[key] = Array.isArray(value) ? value.map(String) : String(value ?? '')
  }
  doctorOrderFormData.value = nextData
  doctorOrderFileIds.value = ''
  doctorOrderCreateResult.value = null
  doctorOrderCreateError.value = ''
  doctorPreSubmitMissingItems.value = []
  doctorPreSubmitMissingComplete.value = null
  await loadDoctorOrderForm()
}

function cancelDoctorOrderEdit() {
  doctorOrderEditingId.value = null
  doctorOrderCreateResult.value = null
  doctorOrderCreateError.value = ''
  doctorPreSubmitMissingItems.value = []
  doctorPreSubmitMissingComplete.value = null
}

function validateDoctorUploadFiles(files: File[]) {
  const existingFileCount = parseDoctorOrderFileIds().length
  if (existingFileCount + files.length > doctorUploadMaxFilesPerOrder) {
    return `单个订单最多上传 ${doctorUploadMaxFilesPerOrder} 个附件`
  }
  for (const file of files) {
    const contentType = file.type || 'application/octet-stream'
    if (file.size > doctorUploadMaxFileSizeBytes) {
      return `附件 ${file.name} 超过 200MB 限制`
    }
    if (!doctorUploadAllowedContentTypes.has(contentType)) {
      return `附件 ${file.name} 类型不在允许范围`
    }
  }
  return ''
}

function selectDoctorUploadFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  const validationError = validateDoctorUploadFiles(files)
  if (validationError) {
    doctorUploadFiles.value = []
    doctorUploadProgress.value = ''
    doctorOrderCreateError.value = validationError
    input.value = ''
    return
  }
  doctorUploadFiles.value = files
  doctorUploadServerResumeCandidates.value = []
  doctorUploadServerResumeOrderId.value = null
  doctorOrderCreateError.value = ''
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
  const validationError = validateDoctorUploadFiles(doctorUploadFiles.value)
  if (validationError) {
    doctorOrderCreateError.value = validationError
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
  designDraftPreviewUrls.value = {}
  doctorBillPreviewUrl.value = ''
  try {
    const [orderPayload, messagesPayload, draftsPayload, billPayload, paymentsPayload, logisticsPayload] = await Promise.all([
      apiFetch<DoctorOrderItem>(`/orders/${orderId}`),
      apiFetch<MessageItem[]>(`/orders/${orderId}/messages`),
      apiFetch<DesignDraftItem[]>(`/orders/${orderId}/design-drafts`),
      apiFetch<BillInfo>(`/orders/${orderId}/bill`),
      apiFetch<PaymentRecordItem[]>(`/orders/${orderId}/payments`),
      apiFetch<LogisticsInfo>(`/orders/${orderId}/logistics`)
    ])
    selectedDoctorOrder.value = orderPayload.data
    doctorOrderWorkspace.value = {
      order: orderPayload.data,
      messages: messagesPayload.data,
      drafts: draftsPayload.data,
      bill: billPayload.data,
      payments: paymentsPayload.data,
      logistics: logisticsPayload.data
    }
  } catch (error) {
    doctorOrderError.value = error instanceof Error ? error.message : '订单详情加载失败'
  } finally {
    doctorOrdersLoading.value = false
  }
}

function designDraftFileIds(draft: DesignDraftItem) {
  if (draft.file_ids?.length) {
    return draft.file_ids
  }
  return draft.file_id ? [draft.file_id] : []
}

function designDraftPreviewKey(draft: DesignDraftItem, fileId: number) {
  return `${draft.draft_id}:${fileId}`
}

async function loadDesignDraftPreviewUrls(draft: DesignDraftItem) {
  const fileIds = designDraftFileIds(draft)
  if (fileIds.length === 0) {
    return
  }
  doctorActionLoading.value = true
  doctorOrderError.value = ''
  try {
    const entries = await Promise.all(fileIds.map(async (fileId) => {
      const payload = await apiFetch<FilePreviewUrlResponse>(`/files/${fileId}/preview-url`)
      return [designDraftPreviewKey(draft, fileId), payload.data.preview_url] as const
    }))
    designDraftPreviewUrls.value = {
      ...designDraftPreviewUrls.value,
      ...Object.fromEntries(entries)
    }
  } catch (error) {
    doctorOrderError.value = error instanceof Error ? error.message : '设计稿预览链接加载失败'
  } finally {
    doctorActionLoading.value = false
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

async function loadDoctorBillPreviewUrl() {
  if (!doctorOrderWorkspace.value?.bill.file_id) {
    doctorOrderError.value = '暂无可预览的账单文件'
    return
  }
  doctorActionLoading.value = true
  doctorOrderError.value = ''
  doctorBillPreviewUrl.value = ''
  try {
    const payload = await apiFetch<FilePreviewUrlResponse>(`/files/${doctorOrderWorkspace.value.bill.file_id}/preview-url`)
    doctorBillPreviewUrl.value = payload.data.preview_url
  } catch (error) {
    doctorOrderError.value = error instanceof Error ? error.message : '账单预览链接加载失败'
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
    doctorOrderError.value = error instanceof Error ? error.message : '订单助手查询失败'
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
      size: '20'
    })
    if (internalOrderStatus.value !== 'ALL') {
      params.set('internal_status', internalOrderStatus.value)
    }
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
  csDesignDraftFileIds.value = ''
  csDesignDraftUploadNote.value = ''
  csDesignDraftResult.value = ''
  csDesignDrafts.value = []
  csDesignDraftPreviewUrls.value = {}
  csBillFileId.value = ''
  csBillResult.value = ''
  csMissingInfoItems.value = []
  csMissingInfoComplete.value = null
  csTranslationSourceText.value = order.production_note?.trim() || JSON.stringify(order.form_data, null, 2)
  csTranslationDraft.value = ''
  csProductionNoteDraft.value = ''
  csProductionNoteTemplateVersion.value = ''
  csProductionNoteKnowledgeNotes.value = []
  csProductionNoteConfirmationNote.value = ''
  csAiResult.value = ''
  void loadInternalDesignDrafts(order.order_id)
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

async function checkCsMissingInfo() {
  if (!selectedInternalOrder.value) {
    return
  }
  csAiActionLoading.value = true
  internalOrderError.value = ''
  csAiResult.value = ''
  try {
    const payload = await apiFetch<MissingInfoResponse>('/ai/check-missing', {
      method: 'POST',
      body: JSON.stringify({
        order_id: selectedInternalOrder.value.order_id
      })
    })
    csMissingInfoComplete.value = payload.data.is_complete
    csMissingInfoItems.value = payload.data.missing_items
    csAiResult.value = payload.data.is_complete ? '资料缺失提示：当前必填资料完整' : '资料缺失提示：请客服确认后驳回补资料'
  } catch (error) {
    internalOrderError.value = error instanceof Error ? error.message : '资料缺失检查失败'
  } finally {
    csAiActionLoading.value = false
  }
}

function applyCsMissingInfoToRejectReason() {
  if (csMissingInfoItems.value.length === 0) {
    return
  }
  csRejectReason.value = csMissingInfoItems.value.map((item) => item.tip).join('\n')
}

async function generateCsTranslationDraft() {
  if (!selectedInternalOrder.value || !csTranslationSourceText.value.trim()) {
    return
  }
  csAiActionLoading.value = true
  internalOrderError.value = ''
  csAiResult.value = ''
  try {
    const payload = await apiFetch<AiTranslateResponse>('/ai/translate', {
      method: 'POST',
      body: JSON.stringify({
        order_id: selectedInternalOrder.value.order_id,
        source_text: csTranslationSourceText.value.trim()
      })
    })
    csTranslationDraft.value = payload.data.translated_text
    csAiResult.value = 'AI 翻译草稿已生成，需客服确认后写入生产备注'
  } catch (error) {
    internalOrderError.value = error instanceof Error ? error.message : 'AI 翻译草稿生成失败'
  } finally {
    csAiActionLoading.value = false
  }
}

function applyCsTranslationDraftToProductionNote() {
  if (!csTranslationDraft.value.trim()) {
    return
  }
  const currentNote = csProductionNote.value.trim()
  const draftBlock = `AI 翻译草稿（客服已确认）：\n${csTranslationDraft.value.trim()}`
  csProductionNote.value = currentNote ? `${currentNote}\n\n${draftBlock}` : draftBlock
  csAiResult.value = 'AI 翻译草稿已写入生产备注，点击通过初审后保存'
}

async function generateCsProductionNoteDraft() {
  if (!selectedInternalOrder.value) {
    return
  }
  csAiActionLoading.value = true
  internalOrderError.value = ''
  csAiResult.value = ''
  csProductionNoteDraft.value = ''
  csProductionNoteKnowledgeNotes.value = []
  try {
    const payload = await apiFetch<AiProductionNoteResponse>('/ai/production-note', {
      method: 'POST',
      body: JSON.stringify({
        order_id: selectedInternalOrder.value.order_id
      })
    })
    csProductionNoteDraft.value = payload.data.draft_note
    csProductionNoteTemplateVersion.value = payload.data.template_version
    csProductionNoteKnowledgeNotes.value = payload.data.knowledge_context_notes ?? []
    csAiResult.value = payload.data.requires_customer_template_confirmation
      ? 'AI-5 生产备注草稿已生成：默认模板需客户/PM 最终确认，写入前必须人工确认'
      : 'AI-5 生产备注草稿已生成，写入前必须人工确认'
  } catch (error) {
    internalOrderError.value = error instanceof Error ? error.message : 'AI-5 生产备注草稿生成失败'
  } finally {
    csAiActionLoading.value = false
  }
}

async function confirmCsProductionNoteDraft() {
  if (!selectedInternalOrder.value || !csProductionNoteDraft.value.trim()) {
    return
  }
  csAiActionLoading.value = true
  internalOrderError.value = ''
  try {
    const payload = await apiFetch<AiProductionNoteConfirmResponse>('/ai/production-note/confirm', {
      method: 'POST',
      body: JSON.stringify({
        order_id: selectedInternalOrder.value.order_id,
        draft_note: csProductionNoteDraft.value.trim(),
        confirmation_note: csProductionNoteConfirmationNote.value.trim() || null
      })
    })
    csProductionNote.value = payload.data.production_note
    selectedInternalOrder.value.production_note = payload.data.production_note
    csAiResult.value = payload.data.requires_customer_template_confirmation
      ? 'AI-5 草稿已人工确认并写入生产备注；客户模板仍待最终确认'
      : 'AI-5 草稿已人工确认并写入生产备注'
  } catch (error) {
    internalOrderError.value = error instanceof Error ? error.message : 'AI-5 生产备注确认写入失败'
  } finally {
    csAiActionLoading.value = false
  }
}

async function runCsAiQuery() {
  const orderId = Number(csAiQueryOrderId.value.trim())
  if (!Number.isInteger(orderId) || orderId <= 0) {
    csAiQueryError.value = '订单 ID 必须是正整数'
    return
  }
  if (!csAiQueryQuestion.value.trim()) {
    csAiQueryError.value = '请填写客服查询问题'
    return
  }
  csAiQueryLoading.value = true
  csAiQueryError.value = ''
  csAiQueryAnswer.value = ''
  csAiQueryReferenceNotes.value = []
  csAiQueryAttachmentContexts.value = []
  try {
    const payload = await apiFetch<DoctorAiAnswer>('/ai/cs-query', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        question: csAiQueryQuestion.value.trim()
      })
    })
    csAiQueryAnswer.value = `${payload.data.answer}\n\n对外发送前需人工确认。`
    csAiQueryReferenceNotes.value = payload.data.reference_data_notes ?? []
    csAiQueryAttachmentContexts.value = payload.data.attachment_contexts ?? []
  } catch (error) {
    csAiQueryError.value = error instanceof Error ? error.message : 'AI 客服查询失败'
  } finally {
    csAiQueryLoading.value = false
  }
}

async function loadAiGovernanceLocalHardening() {
  aiGovernanceLocalHardeningLoading.value = true
  aiGovernanceLocalHardeningError.value = ''
  try {
    const payload = await apiFetch<AiGovernanceLocalHardeningResponse>('/ai/governance/local-hardening')
    aiGovernanceLocalHardening.value = payload.data
  } catch (error) {
    aiGovernanceLocalHardeningError.value = error instanceof Error ? error.message : 'AI 治理本地补强加载失败'
  } finally {
    aiGovernanceLocalHardeningLoading.value = false
  }
}

async function uploadInternalDesignDraft() {
  if (!selectedInternalOrder.value) {
    return
  }
  const fileIds = parseFileIds(csDesignDraftFileIds.value)
  if (fileIds.length === 0) {
    internalOrderError.value = '请填写设计稿 file_id'
    return
  }
  csReviewActionLoading.value = true
  internalOrderError.value = ''
  csDesignDraftResult.value = ''
  try {
    const payload = await apiFetch<DesignDraftItem>(
      `/orders/${selectedInternalOrder.value.order_id}/design-drafts`,
      {
        method: 'POST',
        body: JSON.stringify({
          file_ids: fileIds,
          upload_note: csDesignDraftUploadNote.value.trim() || null
        })
      }
    )
    csDesignDraftResult.value = `已上传 V${payload.data.version}，文件数 ${payload.data.file_count}`
    csDesignDraftFileIds.value = ''
    csDesignDraftUploadNote.value = ''
    await loadInternalDesignDrafts(selectedInternalOrder.value.order_id)
    await loadNotifications()
  } catch (error) {
    internalOrderError.value = error instanceof Error ? error.message : '设计稿上传失败'
  } finally {
    csReviewActionLoading.value = false
  }
}

async function loadInternalDesignDrafts(orderId: number) {
  internalOrderError.value = ''
  try {
    const payload = await apiFetch<DesignDraftItem[]>(`/orders/${orderId}/design-drafts`)
    if (selectedInternalOrder.value?.order_id === orderId) {
      csDesignDrafts.value = payload.data
      csDesignDraftPreviewUrls.value = {}
    }
  } catch (error) {
    internalOrderError.value = error instanceof Error ? error.message : '客服设计稿列表加载失败'
  }
}

async function loadCsDesignDraftPreviewUrls(draft: DesignDraftItem) {
  const fileIds = designDraftFileIds(draft)
  if (fileIds.length === 0) {
    return
  }
  csReviewActionLoading.value = true
  internalOrderError.value = ''
  try {
    const entries = await Promise.all(fileIds.map(async (fileId) => {
      const payload = await apiFetch<FilePreviewUrlResponse>(`/files/${fileId}/preview-url`)
      return [designDraftPreviewKey(draft, fileId), payload.data.preview_url] as const
    }))
    csDesignDraftPreviewUrls.value = {
      ...csDesignDraftPreviewUrls.value,
      ...Object.fromEntries(entries)
    }
  } catch (error) {
    internalOrderError.value = error instanceof Error ? error.message : '客服设计稿预览链接加载失败'
  } finally {
    csReviewActionLoading.value = false
  }
}

async function loadCustomerCollaborationPage() {
  if (!token.value) {
    return
  }
  customerCollaborationResult.value = ''
  await loadCustomerCollaborationPendingMessages()
  if (customerCollaborationOrderId.value.trim()) {
    await loadCustomerCollaborationOrderMessages()
  }
}

async function uploadInternalBill() {
  if (!selectedInternalOrder.value) {
    return
  }
  const fileId = Number(csBillFileId.value.trim())
  if (!Number.isInteger(fileId) || fileId <= 0) {
    internalOrderError.value = '请填写账单 file_id'
    return
  }
  csReviewActionLoading.value = true
  internalOrderError.value = ''
  csBillResult.value = ''
  try {
    const payload = await apiFetch<BillInfo>(
      `/orders/${selectedInternalOrder.value.order_id}/bill`,
      {
        method: 'POST',
        body: JSON.stringify({
          file_id: fileId
        })
      }
    )
    csBillResult.value = `账单已上传：文件 ${payload.data.file_id ?? '-'} / ${statusLabel(payload.data.bill_status)}`
    csBillFileId.value = ''
    await loadNotifications()
  } catch (error) {
    internalOrderError.value = error instanceof Error ? error.message : '账单上传失败'
  } finally {
    csReviewActionLoading.value = false
  }
}

async function updateInternalPaymentStatus() {
  if (!selectedInternalOrder.value) {
    return
  }
  csReviewActionLoading.value = true
  internalOrderError.value = ''
  csBillResult.value = ''
  try {
    const payload = await apiFetch<BillInfo>(
      `/orders/${selectedInternalOrder.value.order_id}/bill/payment-status`,
      {
        method: 'POST',
        body: JSON.stringify({
          payment_status: csPaymentStatus.value
        })
      }
    )
    csBillResult.value = `付款状态已更新：${statusLabel(payload.data.payment_status)}`
    await loadNotifications()
  } catch (error) {
    internalOrderError.value = error instanceof Error ? error.message : '付款状态更新失败'
  } finally {
    csReviewActionLoading.value = false
  }
}

async function createInternalPaymentRecord() {
  if (!selectedInternalOrder.value) {
    return
  }
  if (!csPaymentAmountCents.value || csPaymentAmountCents.value <= 0) {
    internalOrderError.value = '请填写正数收款金额（分）'
    return
  }
  csReviewActionLoading.value = true
  internalOrderError.value = ''
  csBillResult.value = ''
  try {
    const payload = await apiFetch<PaymentRecordItem>(
      `/orders/${selectedInternalOrder.value.order_id}/payments`,
      {
        method: 'POST',
        body: JSON.stringify({
          amount_cents: csPaymentAmountCents.value,
          currency: 'CNY',
          payment_method: csPaymentMethod.value,
          payment_note: csPaymentNote.value.trim()
        })
      }
    )
    csBillResult.value = `收款流水已记录：${payload.data.amount_cents} 分`
    csPaymentAmountCents.value = null
    csPaymentNote.value = ''
    await loadNotifications()
  } catch (error) {
    internalOrderError.value = error instanceof Error ? error.message : '收款流水记录失败'
  } finally {
    csReviewActionLoading.value = false
  }
}

async function loadCustomerCollaborationPendingMessages() {
  if (!token.value) {
    return
  }
  customerCollaborationLoading.value = true
  customerCollaborationError.value = ''
  try {
    const payload = await apiFetch<MessageItem[]>('/messages/pending-review')
    customerCollaborationPendingMessages.value = payload.data
    const selectedStillPending = selectedCustomerCollaborationMessage.value
      ? payload.data.some((item) => item.msg_id === selectedCustomerCollaborationMessage.value?.msg_id)
      : false
    if (!selectedStillPending) {
      selectedCustomerCollaborationMessage.value = payload.data[0] ?? null
      if (selectedCustomerCollaborationMessage.value && !customerCollaborationOrderId.value.trim()) {
        customerCollaborationOrderId.value = String(selectedCustomerCollaborationMessage.value.order_id)
      }
    }
  } catch (error) {
    customerCollaborationError.value = error instanceof Error ? error.message : '待审核消息加载失败'
  } finally {
    customerCollaborationLoading.value = false
  }
}

async function loadCustomerCollaborationOrderMessages() {
  const orderIdText = customerCollaborationOrderId.value.trim()
  const orderId = Number(orderIdText)
  if (!orderIdText || Number.isNaN(orderId) || orderId <= 0) {
    customerCollaborationError.value = '请填写有效订单 ID'
    return
  }
  customerCollaborationLoading.value = true
  customerCollaborationError.value = ''
  try {
    const payload = await apiFetch<MessageItem[]>(`/orders/${orderId}/messages`)
    customerCollaborationOrderMessages.value = payload.data
  } catch (error) {
    customerCollaborationError.value = error instanceof Error ? error.message : '订单消息上下文加载失败'
  } finally {
    customerCollaborationLoading.value = false
  }
}

async function selectCustomerCollaborationMessage(message: MessageItem) {
  selectedCustomerCollaborationMessage.value = message
  customerCollaborationOrderId.value = String(message.order_id)
  customerCollaborationReviewAction.value = 'APPROVE'
  customerCollaborationReviewNote.value = ''
  await loadCustomerCollaborationOrderMessages()
}

async function reviewCustomerCollaborationMessage(message: MessageItem | null = selectedCustomerCollaborationMessage.value) {
  if (!message) {
    return
  }
  customerCollaborationActionLoading.value = true
  customerCollaborationError.value = ''
  customerCollaborationResult.value = ''
  try {
    const payload = await apiFetch<MessageItem>(`/messages/${message.msg_id}/review`, {
      method: 'POST',
      body: JSON.stringify({
        action: customerCollaborationReviewAction.value,
        review_note: customerCollaborationReviewNote.value.trim() || null
      })
    })
    customerCollaborationResult.value = `消息 #${payload.data.msg_id} 已${customerCollaborationReviewAction.value === 'APPROVE' ? '审核通过' : '驳回'}`
    customerCollaborationReviewNote.value = ''
    await loadCustomerCollaborationPendingMessages()
    if (customerCollaborationOrderId.value.trim()) {
      await loadCustomerCollaborationOrderMessages()
    }
  } catch (error) {
    customerCollaborationError.value = error instanceof Error ? error.message : '消息审核失败'
  } finally {
    customerCollaborationActionLoading.value = false
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
      size: '20'
    })
    if (productionReviewStatus.value !== 'ALL') {
      params.set('internal_status', productionReviewStatus.value)
    }
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
    processInstanceError.value = error instanceof Error ? error.message : '工序进度订单加载失败'
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
    processInstanceError.value = error instanceof Error ? error.message : '工序进度加载失败'
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
      throw new Error('员工编号必须是正整数')
    }
    const path = mode === 'REASSIGN'
      ? `/orders/${selectedProcessInstanceOrder.value.order_id}/process-instance/nodes/${selectedProcessNode.value.node_instance_id}/reassign`
      : `/orders/${selectedProcessInstanceOrder.value.order_id}/process-instance/assign`
    const body = mode === 'REASSIGN'
      ? { new_user_id: targetUserId, reason: '前端员工派工第一增量' }
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
    loadReworkDictionaries(),
    loadReworkRecords(),
    loadFinalInspectionTasks()
  ])
}

async function loadReworkDictionaries() {
  if (!token.value) {
    return
  }
  try {
    const payload = await apiFetch<ReworkDictionariesResponse>('/reworks/dictionaries')
    reworkReasonCategories.value = payload.data.reason_categories
    reworkResponsibilityTypes.value = payload.data.responsibility_types
    if (!reworkCloseReasonCategory.value && payload.data.reason_categories.length > 0) {
      reworkCloseReasonCategory.value = payload.data.reason_categories[0].code
    }
    if (!reworkCloseResponsibilityType.value && payload.data.responsibility_types.length > 0) {
      reworkCloseResponsibilityType.value = payload.data.responsibility_types[0].code
    }
  } catch (error) {
    reworkReasonCategories.value = []
    reworkResponsibilityTypes.value = []
    reworkError.value = error instanceof Error ? error.message : '返工字典加载失败'
  }
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
    if (reworkOnlyImpacted.value) {
      params.set('has_impacted_nodes', 'true')
    }
    const query = params.toString()
    const payload = await apiFetch<ReworkRecordResponse[]>(query ? `/reworks?${query}` : '/reworks')
    reworkRecords.value = payload.data
    const selectedStillVisible = selectedRework.value
      ? payload.data.some((record) => record.rework_id === selectedRework.value?.rework_id)
      : false
    selectedRework.value = selectedStillVisible ? selectedRework.value : payload.data[0] ?? null
    if (selectedRework.value) {
      applyReworkCloseDefaults(selectedRework.value)
    }
  } catch (error) {
    reworkRecords.value = []
    selectedRework.value = null
    reworkError.value = error instanceof Error ? error.message : '返工记录加载失败'
  } finally {
    reworkRecordsLoading.value = false
  }
}

function selectReworkRecord(record: ReworkRecordResponse) {
  selectedRework.value = record
  applyReworkCloseDefaults(record)
}

function applyReworkCloseDefaults(record: ReworkRecordResponse) {
  reworkCloseReasonCategory.value = record.reason_category ?? reworkReasonCategories.value[0]?.code ?? 'FIT_ISSUE'
  reworkCloseResponsibilityType.value = record.responsibility_type ?? reworkResponsibilityTypes.value[0]?.code ?? 'WORKER'
  reworkCloseNote.value = record.close_note ?? ''
  reworkCloseResult.value = null
}

async function closeSelectedRework() {
  if (!selectedRework.value) {
    return
  }
  reworkCloseLoading.value = true
  reworkError.value = ''
  reworkCloseResult.value = null
  try {
    const payload = await apiFetch<ReworkRecordResponse>(`/reworks/${selectedRework.value.rework_id}/close`, {
      method: 'POST',
      body: JSON.stringify({
        reason_category: reworkCloseReasonCategory.value,
        responsibility_type: reworkCloseResponsibilityType.value,
        close_note: reworkCloseNote.value.trim() || null
      })
    })
    selectedRework.value = payload.data
    reworkCloseResult.value = payload.data
    await loadReworkRecords()
  } catch (error) {
    reworkError.value = error instanceof Error ? error.message : '关闭返工失败'
  } finally {
    reworkCloseLoading.value = false
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
  finalInspectionReportSummary.value = ''
  finalInspectionPdfFileId.value = ''
  finalInspectionAttachmentFileIds.value = ''
  await loadFinalInspectionRecords(task.node_instance_id)
  await loadFinalInspectionReport(task.order_id)
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

async function loadFinalInspectionReport(orderId: number) {
  finalInspectionReport.value = null
  try {
    const payload = await apiFetch<FinalInspectionReportResponse>(`/final-inspection-reports/${orderId}`)
    finalInspectionReport.value = payload.data
    finalInspectionReportSummary.value = payload.data.summary ?? ''
    finalInspectionPdfFileId.value = payload.data.pdf_file_id ? String(payload.data.pdf_file_id) : ''
    finalInspectionAttachmentFileIds.value = payload.data.attachment_file_ids?.join(', ') ?? ''
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return
    }
    reworkError.value = error instanceof Error ? error.message : '终检报告加载失败'
  }
}

async function createFinalInspectionReport() {
  if (!selectedFinalInspectionTask.value) {
    return
  }
  finalInspectionReportLoading.value = true
  reworkError.value = ''
  try {
    const payload = await apiFetch<FinalInspectionReportResponse>('/final-inspection-reports', {
      method: 'POST',
      body: JSON.stringify({
        order_id: selectedFinalInspectionTask.value.order_id,
        summary: finalInspectionReportSummary.value.trim() || '终检通过',
        pdf_file_id: parseOptionalFileId(finalInspectionPdfFileId.value),
        attachment_file_ids: parseFileIds(finalInspectionAttachmentFileIds.value)
      })
    })
    finalInspectionReport.value = payload.data
    finalInspectionReportSummary.value = payload.data.summary ?? ''
    finalInspectionPdfFileId.value = payload.data.pdf_file_id ? String(payload.data.pdf_file_id) : ''
    finalInspectionAttachmentFileIds.value = payload.data.attachment_file_ids?.join(', ') ?? ''
  } catch (error) {
    const message = error instanceof Error ? error.message : '生成终检报告失败'
    reworkError.value = message.includes('409') ? '终检出检通过后才能生成报告' : message
  } finally {
    finalInspectionReportLoading.value = false
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
        throw new Error('员工编号必须是正整数')
      }
      params.set('user_id', String(userId))
    }
    if (performanceStartDate.value.trim()) {
      params.set('start_date', performanceStartDate.value.trim())
    }
    if (performanceEndDate.value.trim()) {
      params.set('end_date', performanceEndDate.value.trim())
    }
    const query = params.toString()
    const [statsPayload, detailPayload] = await Promise.all([
      apiFetch<PerformanceStatsResponse>(query ? `/performance?${query}` : '/performance'),
      apiFetch<PerformanceDetailResponse[]>(query ? `/performance/details?${query}` : '/performance/details')
    ])
    performanceStats.value = statsPayload.data
    performanceDetails.value = detailPayload.data
  } catch (error) {
    performanceDetails.value = []
    performanceError.value = error instanceof Error ? error.message : '绩效统计加载失败'
  } finally {
    performanceLoading.value = false
  }
}

async function loadStaffWorkload() {
  if (!token.value) {
    return
  }
  staffWorkloadLoading.value = true
  staffWorkloadError.value = ''
  try {
    const params = new URLSearchParams({ page: '1', size: '50' })
    if (staffWorkloadKeyword.value.trim()) {
      params.set('keyword', staffWorkloadKeyword.value.trim())
    }
    const payload = await apiFetch<StaffWorkloadListResponse>(`/staff/workload?${params.toString()}`)
    staffWorkloadItems.value = payload.data.items
    staffWorkloadTotal.value = payload.data.total
  } catch (error) {
    staffWorkloadItems.value = []
    staffWorkloadTotal.value = 0
    staffWorkloadError.value = error instanceof Error ? error.message : '人员工作量加载失败'
  } finally {
    staffWorkloadLoading.value = false
  }
}

async function loadProductionQualitySummary() {
  if (!token.value) {
    return
  }
  productionQualitySummaryLoading.value = true
  productionQualitySummaryError.value = ''
  try {
    const payload = await apiFetch<ProductionQualitySummaryResponse>('/production/quality/summary')
    productionQualitySummary.value = payload.data
  } catch (error) {
    productionQualitySummary.value = null
    productionQualitySummaryError.value = error instanceof Error ? error.message : '质量汇总加载失败'
  } finally {
    productionQualitySummaryLoading.value = false
  }
}

async function loadQualityRecords() {
  if (!token.value) {
    return
  }
  qualityRecordLoading.value = true
  qualityRecordError.value = ''
  try {
    const params = new URLSearchParams({
      record_type: 'EXTERNAL_RETURN',
      page: '1',
      size: '20'
    })
    if (qualityRecordOrderId.value.trim()) {
      params.set('order_id', qualityRecordOrderId.value.trim())
    }
    if (qualityRecordResponsibilityType.value.trim()) {
      params.set('responsibility_type', qualityRecordResponsibilityType.value.trim())
    }
    const payload = await apiFetch<QualityRecordListResponse>(`/quality-records?${params.toString()}`)
    qualityRecords.value = payload.data.items
    qualityRecordTotal.value = payload.data.total
  } catch (error) {
    qualityRecords.value = []
    qualityRecordTotal.value = 0
    qualityRecordError.value = error instanceof Error ? error.message : '质量记录加载失败'
  } finally {
    qualityRecordLoading.value = false
  }
}

async function loadProductionQualityPage() {
  await Promise.all([
    loadProductionQualitySummary(),
    loadQualityRecords(),
    loadReworkDictionaries()
  ])
  if (!qualityRecordReasonCategory.value && reworkReasonCategories.value.length > 0) {
    qualityRecordReasonCategory.value = reworkReasonCategories.value[0].code
  }
  if (!qualityRecordResponsibilityType.value && reworkResponsibilityTypes.value.length > 0) {
    qualityRecordResponsibilityType.value = reworkResponsibilityTypes.value[0].code
  }
}

async function createExternalReturnQualityRecord() {
  const orderId = Number(qualityRecordOrderId.value.trim())
  if (!Number.isInteger(orderId) || orderId <= 0) {
    qualityRecordError.value = '订单 ID 必须是正整数'
    return
  }
  if (!qualityRecordReasonDetail.value.trim()) {
    qualityRecordError.value = '请填写外返原因详情'
    return
  }
  qualityRecordSaving.value = true
  qualityRecordError.value = ''
  qualityRecordResult.value = ''
  try {
    const payload = await apiFetch<QualityRecordResponse>('/quality-records/external-returns', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        reason_category: qualityRecordReasonCategory.value,
        responsibility_type: qualityRecordResponsibilityType.value,
        reason_detail: qualityRecordReasonDetail.value.trim()
      })
    })
    qualityRecordResult.value = `已登记外返质量记录 ${payload.data.quality_record_id} / 返工 ${payload.data.rework_id ?? '-'}`
    qualityRecordStatusId.value = String(payload.data.quality_record_id)
    qualityRecordReasonDetail.value = ''
    await Promise.all([
      loadQualityRecords(),
      loadProductionQualitySummary()
    ])
  } catch (error) {
    qualityRecordError.value = error instanceof Error ? error.message : '外返登记失败'
  } finally {
    qualityRecordSaving.value = false
  }
}

async function updateQualityRecordStatus() {
  const qualityRecordId = Number(qualityRecordStatusId.value.trim())
  if (!Number.isInteger(qualityRecordId) || qualityRecordId <= 0) {
    qualityRecordError.value = '质量记录 ID 必须是正整数'
    return
  }
  qualityRecordStatusSaving.value = true
  qualityRecordError.value = ''
  qualityRecordResult.value = ''
  try {
    const payload = await apiFetch<QualityRecordResponse>(`/quality-records/${qualityRecordId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: qualityRecordStatus.value,
        status_note: qualityRecordStatusNote.value.trim()
      })
    })
    qualityRecordResult.value = `已更新质量记录 ${payload.data.quality_record_id} 状态为 ${statusLabel(payload.data.status)}`
    qualityRecordStatusNote.value = ''
    await loadQualityRecords()
  } catch (error) {
    qualityRecordError.value = error instanceof Error ? error.message : '质量状态更新失败'
  } finally {
    qualityRecordStatusSaving.value = false
  }
}

async function loadProductionEquipmentSummary() {
  if (!token.value) {
    return
  }
  productionEquipmentSummaryLoading.value = true
  productionEquipmentSummaryError.value = ''
  try {
    const payload = await apiFetch<ProductionEquipmentSummaryResponse>('/production/equipment/summary')
    productionEquipmentSummary.value = payload.data
  } catch (error) {
    productionEquipmentSummary.value = null
    productionEquipmentSummaryError.value = error instanceof Error ? error.message : '设备汇总加载失败'
  } finally {
    productionEquipmentSummaryLoading.value = false
  }
}

async function createProductionEquipment() {
  if (!token.value) {
    return
  }
  productionEquipmentSaving.value = true
  productionEquipmentSummaryError.value = ''
  productionEquipmentResult.value = ''
  try {
    const response = await apiFetch<ProductionEquipmentResponse>('/production/equipment', {
      method: 'POST',
      body: JSON.stringify({
        equipment_code: productionEquipmentCreateCode.value.trim(),
        equipment_name: productionEquipmentCreateName.value.trim(),
        equipment_type: productionEquipmentCreateType.value.trim(),
        department_name: productionEquipmentCreateDepartment.value.trim(),
        status: productionEquipmentCreateStatus.value,
        utilization_rate: productionEquipmentCreateUtilizationRate.value
      })
    })
    productionEquipmentResult.value = `已登记设备 ${response.data.equipment_code}`
    productionEquipmentEventCode.value = response.data.equipment_code
    productionEquipmentCreateCode.value = ''
    productionEquipmentCreateName.value = ''
    productionEquipmentCreateStatus.value = 'IDLE'
    productionEquipmentCreateUtilizationRate.value = 0
    await loadProductionEquipmentSummary()
  } catch (error) {
    productionEquipmentSummaryError.value = error instanceof Error ? error.message : '设备登记失败'
  } finally {
    productionEquipmentSaving.value = false
  }
}

async function createProductionEquipmentEvent() {
  if (!token.value) {
    return
  }
  productionEquipmentSaving.value = true
  productionEquipmentSummaryError.value = ''
  productionEquipmentResult.value = ''
  try {
    const equipmentCode = productionEquipmentEventCode.value.trim()
    const response = await apiFetch<ProductionEquipmentEventResponse>(
      `/production/equipment/${encodeURIComponent(equipmentCode)}/events`,
      {
        method: 'POST',
        body: JSON.stringify({
          event_type: productionEquipmentEventType.value,
          status: productionEquipmentEventStatus.value,
          downtime_minutes: productionEquipmentEventDowntimeMinutes.value,
          description: productionEquipmentEventDescription.value.trim()
        })
      }
    )
    productionEquipmentResult.value = `已登记事件 ${response.data.event_type} / ${response.data.status}`
    productionEquipmentEventDescription.value = ''
    productionEquipmentEventDowntimeMinutes.value = 0
    await loadProductionEquipmentSummary()
  } catch (error) {
    productionEquipmentSummaryError.value = error instanceof Error ? error.message : '设备事件登记失败'
  } finally {
    productionEquipmentSaving.value = false
  }
}

async function loadProductionMaterialExceptionSummary() {
  if (!token.value) {
    return
  }
  productionMaterialExceptionSummaryLoading.value = true
  productionMaterialExceptionSummaryError.value = ''
  try {
    const payload = await apiFetch<ProductionMaterialExceptionSummaryResponse>('/production/material-exceptions/summary')
    productionMaterialExceptionSummary.value = payload.data
  } catch (error) {
    productionMaterialExceptionSummary.value = null
    productionMaterialExceptionSummaryError.value = error instanceof Error ? error.message : '物料异常汇总加载失败'
  } finally {
    productionMaterialExceptionSummaryLoading.value = false
  }
}

async function createProductionMaterialException() {
  if (!token.value) {
    return
  }
  productionMaterialExceptionSaving.value = true
  productionMaterialExceptionSummaryError.value = ''
  productionMaterialExceptionResult.value = ''
  try {
    const response = await apiFetch<ProductionMaterialExceptionResponse>('/production/material-exceptions', {
      method: 'POST',
      body: JSON.stringify({
        exception_no: productionMaterialExceptionCreateNo.value.trim(),
        material_code: productionMaterialExceptionCreateCode.value.trim(),
        material_name: productionMaterialExceptionCreateName.value.trim(),
        exception_type: productionMaterialExceptionCreateType.value,
        status: productionMaterialExceptionCreateStatus.value,
        responsibility_owner: productionMaterialExceptionCreateResponsibility.value.trim(),
        loss_quantity: productionMaterialExceptionCreateLossQuantity.value,
        description: productionMaterialExceptionCreateDescription.value.trim()
      })
    })
    productionMaterialExceptionResult.value = `已登记物料异常 ${response.data.exception_no}`
    productionMaterialExceptionStatusNo.value = response.data.exception_no
    productionMaterialExceptionCreateNo.value = ''
    productionMaterialExceptionCreateCode.value = ''
    productionMaterialExceptionCreateName.value = ''
    productionMaterialExceptionCreateResponsibility.value = ''
    productionMaterialExceptionCreateLossQuantity.value = 0
    productionMaterialExceptionCreateDescription.value = ''
    await loadProductionMaterialExceptionSummary()
  } catch (error) {
    productionMaterialExceptionSummaryError.value = error instanceof Error ? error.message : '物料异常登记失败'
  } finally {
    productionMaterialExceptionSaving.value = false
  }
}

async function updateProductionMaterialExceptionStatus() {
  if (!token.value) {
    return
  }
  productionMaterialExceptionSaving.value = true
  productionMaterialExceptionSummaryError.value = ''
  productionMaterialExceptionResult.value = ''
  try {
    const exceptionNo = productionMaterialExceptionStatusNo.value.trim()
    const response = await apiFetch<ProductionMaterialExceptionResponse>(
      `/production/material-exceptions/${encodeURIComponent(exceptionNo)}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({
          status: productionMaterialExceptionStatus.value,
          responsibility_owner: productionMaterialExceptionStatusResponsibility.value.trim(),
          description: productionMaterialExceptionStatusDescription.value.trim()
        })
      }
    )
    productionMaterialExceptionResult.value = `已更新处理状态 ${response.data.status}`
    productionMaterialExceptionStatusDescription.value = ''
    await loadProductionMaterialExceptionSummary()
  } catch (error) {
    productionMaterialExceptionSummaryError.value = error instanceof Error ? error.message : '物料异常状态更新失败'
  } finally {
    productionMaterialExceptionSaving.value = false
  }
}

async function loadProductionSafetyEnvironmentSummary() {
  if (!token.value) {
    return
  }
  productionSafetyEnvironmentSummaryLoading.value = true
  productionSafetyEnvironmentSummaryError.value = ''
  try {
    const payload = await apiFetch<ProductionSafetyEnvironmentSummaryResponse>('/production/safety-environment/summary')
    productionSafetyEnvironmentSummary.value = payload.data
  } catch (error) {
    productionSafetyEnvironmentSummary.value = null
    productionSafetyEnvironmentSummaryError.value = error instanceof Error ? error.message : '安环汇总加载失败'
  } finally {
    productionSafetyEnvironmentSummaryLoading.value = false
  }
}

async function createProductionSafetyEnvironmentEvent() {
  if (!token.value) {
    return
  }
  productionSafetyEnvironmentSaving.value = true
  productionSafetyEnvironmentSummaryError.value = ''
  productionSafetyEnvironmentResult.value = ''
  try {
    const response = await apiFetch<ProductionSafetyEnvironmentEventResponse>('/production/safety-environment/events', {
      method: 'POST',
      body: JSON.stringify({
        event_no: productionSafetyEnvironmentCreateNo.value.trim(),
        event_type: productionSafetyEnvironmentCreateType.value,
        status: productionSafetyEnvironmentCreateStatus.value,
        department_name: productionSafetyEnvironmentCreateDepartment.value.trim(),
        responsible_owner: productionSafetyEnvironmentCreateOwner.value.trim(),
        equipment_code: productionSafetyEnvironmentCreateEquipmentCode.value.trim(),
        risk_level: productionSafetyEnvironmentCreateRisk.value,
        due_at: productionSafetyEnvironmentCreateDueAt.value || null,
        description: productionSafetyEnvironmentCreateDescription.value.trim()
      })
    })
    productionSafetyEnvironmentResult.value = `已登记安环事件 ${response.data.event_no}`
    productionSafetyEnvironmentStatusNo.value = response.data.event_no
    productionSafetyEnvironmentCreateNo.value = ''
    productionSafetyEnvironmentCreateDepartment.value = ''
    productionSafetyEnvironmentCreateOwner.value = ''
    productionSafetyEnvironmentCreateEquipmentCode.value = ''
    productionSafetyEnvironmentCreateDueAt.value = ''
    productionSafetyEnvironmentCreateDescription.value = ''
    await loadProductionSafetyEnvironmentSummary()
  } catch (error) {
    productionSafetyEnvironmentSummaryError.value = error instanceof Error ? error.message : '安环事件登记失败'
  } finally {
    productionSafetyEnvironmentSaving.value = false
  }
}

async function updateProductionSafetyEnvironmentEventStatus() {
  if (!token.value) {
    return
  }
  productionSafetyEnvironmentSaving.value = true
  productionSafetyEnvironmentSummaryError.value = ''
  productionSafetyEnvironmentResult.value = ''
  try {
    const eventNo = productionSafetyEnvironmentStatusNo.value.trim()
    const response = await apiFetch<ProductionSafetyEnvironmentEventResponse>(
      `/production/safety-environment/events/${encodeURIComponent(eventNo)}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({
          status: productionSafetyEnvironmentStatus.value,
          responsible_owner: productionSafetyEnvironmentStatusOwner.value.trim(),
          description: productionSafetyEnvironmentStatusDescription.value.trim()
        })
      }
    )
    productionSafetyEnvironmentResult.value = `已更新整改状态 ${response.data.status}`
    productionSafetyEnvironmentStatusDescription.value = ''
    await loadProductionSafetyEnvironmentSummary()
  } catch (error) {
    productionSafetyEnvironmentSummaryError.value = error instanceof Error ? error.message : '安环整改状态更新失败'
  } finally {
    productionSafetyEnvironmentSaving.value = false
  }
}

async function loadProductionCostSummary() {
  if (!token.value) {
    return
  }
  productionCostSummaryLoading.value = true
  productionCostSummaryError.value = ''
  try {
    const payload = await apiFetch<ProductionCostSummaryResponse>('/production/cost-management/summary')
    productionCostSummary.value = payload.data
  } catch (error) {
    productionCostSummary.value = null
    productionCostSummaryError.value = error instanceof Error ? error.message : '成本汇总加载失败'
  } finally {
    productionCostSummaryLoading.value = false
  }
}

async function createProductionCostRecord() {
  if (!token.value) {
    return
  }
  productionCostSaving.value = true
  productionCostSummaryError.value = ''
  productionCostResult.value = ''
  try {
    const response = await apiFetch<ProductionCostRecordResponse>('/production/cost-management/records', {
      method: 'POST',
      body: JSON.stringify({
        cost_no: productionCostCreateNo.value.trim(),
        cost_type: productionCostCreateType.value,
        amount: productionCostCreateAmount.value,
        status: productionCostCreateStatus.value,
        department_name: productionCostCreateDepartment.value.trim(),
        supplier_name: productionCostCreateSupplier.value.trim(),
        description: productionCostCreateDescription.value.trim()
      })
    })
    productionCostResult.value = `已登记成本记录 ${response.data.cost_no}`
    productionCostCreateNo.value = ''
    productionCostCreateAmount.value = 0
    productionCostCreateDepartment.value = ''
    productionCostCreateSupplier.value = ''
    productionCostCreateDescription.value = ''
    await loadProductionCostSummary()
  } catch (error) {
    productionCostSummaryError.value = error instanceof Error ? error.message : '成本记录登记失败'
  } finally {
    productionCostSaving.value = false
  }
}

async function loadProductionRewardPenaltySummary() {
  if (!token.value) {
    return
  }
  productionRewardPenaltySummaryLoading.value = true
  productionRewardPenaltySummaryError.value = ''
  try {
    const payload = await apiFetch<ProductionRewardPenaltySummaryResponse>('/production/reward-penalty/summary')
    productionRewardPenaltySummary.value = payload.data
  } catch (error) {
    productionRewardPenaltySummary.value = null
    productionRewardPenaltySummaryError.value = error instanceof Error ? error.message : '奖惩汇总加载失败'
  } finally {
    productionRewardPenaltySummaryLoading.value = false
  }
}

async function createProductionRewardPenaltyRecord() {
  if (!token.value) {
    return
  }
  productionRewardPenaltySaving.value = true
  productionRewardPenaltySummaryError.value = ''
  productionRewardPenaltyResult.value = ''
  try {
    const body: Record<string, string | number | null> = {
      record_no: productionRewardPenaltyCreateNo.value.trim(),
      record_type: productionRewardPenaltyCreateType.value,
      reason_category: productionRewardPenaltyCreateReason.value,
      amount: productionRewardPenaltyCreateAmount.value,
      status: productionRewardPenaltyCreateStatus.value,
      employee_user_id: productionRewardPenaltyCreateEmployeeUserId.value,
      department_name: productionRewardPenaltyCreateDepartment.value.trim(),
      description: productionRewardPenaltyCreateDescription.value.trim()
    }
    const response = await apiFetch<ProductionRewardPenaltyRecordResponse>('/production/reward-penalty/records', {
      method: 'POST',
      body: JSON.stringify(body)
    })
    productionRewardPenaltyResult.value = `已登记奖惩记录 ${response.data.record_no}`
    productionRewardPenaltyStatusNo.value = response.data.record_no
    productionRewardPenaltyCreateNo.value = ''
    productionRewardPenaltyCreateAmount.value = 0
    productionRewardPenaltyCreateEmployeeUserId.value = null
    productionRewardPenaltyCreateDepartment.value = ''
    productionRewardPenaltyCreateDescription.value = ''
    await loadProductionRewardPenaltySummary()
  } catch (error) {
    productionRewardPenaltySummaryError.value = error instanceof Error ? error.message : '奖惩记录登记失败'
  } finally {
    productionRewardPenaltySaving.value = false
  }
}

async function updateProductionRewardPenaltyRecordStatus() {
  if (!token.value) {
    return
  }
  productionRewardPenaltySaving.value = true
  productionRewardPenaltySummaryError.value = ''
  productionRewardPenaltyResult.value = ''
  try {
    const recordNo = encodeURIComponent(productionRewardPenaltyStatusNo.value.trim())
    const response = await apiFetch<ProductionRewardPenaltyRecordResponse>(
      `/production/reward-penalty/records/${recordNo}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({
          status: productionRewardPenaltyStatus.value,
          description: productionRewardPenaltyStatusDescription.value.trim()
        })
      }
    )
    productionRewardPenaltyResult.value = `已更新奖惩审批状态 ${response.data.status}`
    productionRewardPenaltyStatusDescription.value = ''
    await loadProductionRewardPenaltySummary()
  } catch (error) {
    productionRewardPenaltySummaryError.value = error instanceof Error ? error.message : '奖惩审批状态更新失败'
  } finally {
    productionRewardPenaltySaving.value = false
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
  productionBoardLogisticsCarrier.value = ''
  productionBoardLogisticsTrackingNo.value = ''
  productionBoardShippingResult.value = ''
  await loadProductionBoardInstance(order.order_id)
}

async function loadProductionBoardInstance(orderId: number) {
  productionBoardError.value = ''
  productionBoardInstance.value = null
  if (selectedProductionBoardOrder.value?.internal_status === 'PENDING_PRODUCTION_REVIEW') {
    productionBoardError.value = '该订单仍待生产审核，尚未生成工序'
    return
  }
  try {
    const payload = await apiFetch<ProcessInstanceDetail>(`/orders/${orderId}/process-instance`)
    productionBoardInstance.value = payload.data
  } catch (error) {
    productionBoardError.value = error instanceof Error ? error.message : '生产看板工序进度加载失败'
  }
}

async function shipProductionBoardOrder() {
  if (!selectedProductionBoardOrder.value) {
    return
  }
  if (!productionBoardLogisticsCarrier.value.trim() || !productionBoardLogisticsTrackingNo.value.trim()) {
    productionBoardError.value = '请填写承运商和物流单号'
    return
  }
  productionBoardShippingLoading.value = true
  productionBoardError.value = ''
  productionBoardShippingResult.value = ''
  try {
    const payload = await apiFetch<LogisticsInfo>(`/orders/${selectedProductionBoardOrder.value.order_id}/logistics`, {
      method: 'POST',
      body: JSON.stringify({
        carrier: productionBoardLogisticsCarrier.value.trim(),
        tracking_no: productionBoardLogisticsTrackingNo.value.trim()
      })
    })
    productionBoardShippingResult.value = `已发货：${payload.data.carrier ?? '-'} / ${payload.data.tracking_no ?? '-'}`
    selectedProductionBoardOrder.value = {
      ...selectedProductionBoardOrder.value,
      internal_status: 'SHIPPED',
      external_status: 'SHIPPED'
    }
    await loadNotifications()
  } catch (error) {
    const message = error instanceof Error ? error.message : '发货失败'
    productionBoardError.value = message.includes('409') ? '终检出检通过后才能发货' : message
  } finally {
    productionBoardShippingLoading.value = false
  }
}

async function loadDeliveryOrders() {
  if (!token.value) {
    return
  }
  deliveryLoading.value = true
  deliveryError.value = ''
  try {
    const params = new URLSearchParams({ limit: '50' })
    if (deliveryStatusFilter.value !== 'ALL') {
      params.set('logistics_status', deliveryStatusFilter.value)
    }
    const payload = await apiFetch<DeliveryOrderItem[]>(`/logistics/orders?${params.toString()}`)
    deliveryOrders.value = payload.data
    const selectedStillVisible = selectedDeliveryOrder.value
      ? payload.data.some((item) => item.order_id === selectedDeliveryOrder.value?.order_id)
      : false
    if (payload.data.length === 0) {
      selectedDeliveryOrder.value = null
    } else if (!selectedStillVisible) {
      selectDeliveryOrder(payload.data[0])
    }
  } catch (error) {
    deliveryOrders.value = []
    selectedDeliveryOrder.value = null
    deliveryError.value = error instanceof Error ? error.message : '配送列表加载失败'
  } finally {
    deliveryLoading.value = false
  }
}

function selectDeliveryOrder(order: DeliveryOrderItem) {
  selectedDeliveryOrder.value = order
  deliveryFollowUpStatus.value = ['EXCEPTION', 'FOLLOWING', 'RESOLVED'].includes(order.logistics_status)
    ? order.logistics_status
    : 'EXCEPTION'
  deliveryFollowUpNote.value = ''
  deliveryResult.value = ''
}

async function saveDeliveryFollowUp() {
  if (!selectedDeliveryOrder.value) {
    return
  }
  if (!deliveryFollowUpNote.value.trim()) {
    deliveryError.value = '请填写物流异常跟进说明'
    return
  }
  deliverySaving.value = true
  deliveryError.value = ''
  deliveryResult.value = ''
  try {
    const payload = await apiFetch<DeliveryOrderItem>(`/orders/${selectedDeliveryOrder.value.order_id}/logistics/exception`, {
      method: 'POST',
      body: JSON.stringify({
        logistics_status: deliveryFollowUpStatus.value,
        follow_up_note: deliveryFollowUpNote.value.trim()
      })
    })
    selectedDeliveryOrder.value = payload.data
    deliveryResult.value = `已更新 ${payload.data.order_no}：${statusLabel(payload.data.logistics_status)}`
    deliveryFollowUpNote.value = ''
    await loadDeliveryOrders()
  } catch (error) {
    deliveryError.value = error instanceof Error ? error.message : '物流异常跟进保存失败'
  } finally {
    deliverySaving.value = false
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
  return parseFileIds(doctorOrderFileIds.value)
}

function parseFileIds(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0)
}

function parseOptionalFileId(value: string) {
  const fileId = Number(value.trim())
  return Number.isInteger(fileId) && fileId > 0 ? fileId : null
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

watch(activeDoctorOrderSection, (section) => {
  if (['design', 'bill', 'messages', 'ai'].includes(section)) {
    activeDoctorDetailTab.value = section
  } else if (section === 'list') {
    activeDoctorDetailTab.value = 'info'
  }
})

onBeforeUnmount(() => {
  closeNotificationSocket()
})
</script>

<template>
  <main
    class="app-shell"
    :class="[
      { 'login-shell': !isLoggedIn },
      isLoggedIn ? `portal-${portalTone}` : ''
    ]"
  >
    <section class="workspace" :class="{ 'login-workspace': !isLoggedIn }">
      <div v-if="isLoggedIn" class="status-bar">
        <div>
          <strong>{{ portalTitle }}</strong>
        </div>
        <div class="status-actions">
          <el-tag type="success" round>{{ roleLabels(currentUser?.roles) }}已登录</el-tag>
          <el-tag effect="plain" round>{{ roleLabels(currentUser?.roles) }}</el-tag>
        </div>
      </div>

      <div class="content-grid" :class="{ 'with-nav': isLoggedIn, 'login-only': !isLoggedIn }">
        <aside v-if="isLoggedIn" class="panel nav-panel">
          <div class="portal-brand">
            <span class="portal-brand-mark" aria-hidden="true">单</span>
            <div>
              <strong>AI智能下单平台</strong>
              <small>下单 · 审核 · 生产</small>
            </div>
          </div>
          <el-popover
            placement="right-start"
            trigger="click"
            width="330"
            popper-class="account-popover"
          >
            <template #reference>
              <button class="user-block account-trigger" type="button" data-testid="account-menu-trigger">
                <span class="account-avatar" aria-hidden="true">{{ accountProfile.username.slice(0, 1).toUpperCase() }}</span>
                <span class="account-identity">
                  <strong>{{ accountProfile.username }}</strong>
                  <span>{{ accountProfile.role }} / {{ accountProfile.organization }}</span>
                  <span>{{ accountProfile.scope }} · 有效期 {{ compactDateTime(currentUser?.expiresAt) }}</span>
                </span>
                <span class="account-caret">账号</span>
              </button>
            </template>
            <div class="account-panel" data-testid="account-menu-panel">
              <div class="account-panel-head">
                <span class="account-avatar" aria-hidden="true">{{ accountProfile.username.slice(0, 1).toUpperCase() }}</span>
                <div>
                  <strong>{{ accountProfile.username }}</strong>
                  <small>{{ accountProfile.role }} / {{ accountProfile.organization }}</small>
                  <small>{{ accountProfile.summary }}</small>
                </div>
              </div>
              <div class="account-panel-section" v-for="group in accountNavigationGroups" :key="group.title">
                <span class="account-section-title">{{ group.title }}</span>
                <button
                  v-for="item in group.items"
                  :key="item.id"
                  class="account-menu-item"
                  type="button"
                  @click="selectDisplayNavigationItem(item)"
                >
                  <span class="admin-menu-icon" aria-hidden="true" v-html="businessIconSvg(item.icon)" />
                  <span>
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.description }}</small>
                  </span>
                </button>
              </div>
              <div class="account-panel-actions">
                <el-button
                  size="small"
                  plain
                  :loading="authActionLoading"
                  data-testid="auth-refresh-button"
                  @click="refreshSession"
                >
                  刷新令牌
                </el-button>
                <el-button
                  size="small"
                  type="primary"
                  plain
                  :loading="authActionLoading"
                  data-testid="auth-logout-button"
                  @click="logout"
                >
                  <span data-testid="account-switch-button">账号切换</span>
                </el-button>
              </div>
            </div>
          </el-popover>
          <el-menu :default-active="displayActiveIndex" class="route-menu">
            <template v-for="group in navigationGroups" :key="group.title">
              <div class="nav-section-title">{{ group.title }}</div>
              <template v-for="item in group.items" :key="item.id">
                <el-sub-menu v-if="item.children?.length" :index="item.id">
                  <template #title>
                    <span class="menu-icon" aria-hidden="true" v-html="businessIconSvg(item.icon)" />
                    <span>{{ item.title }}</span>
                  </template>
                  <el-menu-item
                    v-for="child in item.children"
                    :key="child.id"
                    :index="child.id"
                    @click="selectDisplayNavigationItem(child)"
                  >
                    <span class="menu-icon" aria-hidden="true" v-html="businessIconSvg(child.icon)" />
                    <span>{{ child.title }}</span>
                  </el-menu-item>
                </el-sub-menu>
                <el-menu-item
                  v-else
                  :index="item.id"
                  @click="selectDisplayNavigationItem(item)"
                >
                  <span class="menu-icon" aria-hidden="true" v-html="businessIconSvg(item.icon)" />
                  <el-badge
                    v-if="item.routePath === '/notifications' && hasUnreadNotifications"
                    :value="unreadCount"
                    :max="99"
                    class="menu-badge"
                  >
                    <span>{{ item.title }}</span>
                  </el-badge>
                  <span v-else>{{ item.title }}</span>
                </el-menu-item>
              </template>
            </template>
          </el-menu>
          <div class="nav-footnote">
            <span class="nav-note-mark" aria-hidden="true">权</span>
            <span>医生端仅展示外部安全进度，内部工序与绩效由服务端隔离。</span>
          </div>
        </aside>

        <section v-if="isLoggedIn" class="panel health-panel">
          <div class="route-hero-icon">
            <span class="svg-symbol" aria-hidden="true" v-html="businessIconSvg(routeChrome.icon)" />
          </div>
          <div class="route-hero-copy">
            <span>{{ routeChrome.eyebrow }}</span>
            <h1>{{ routeChrome.title }}</h1>
            <p>{{ routeChrome.description }}</p>
          </div>
          <div class="health-actions">
            <el-button type="primary" @click="checkHealth">检查后端</el-button>
            <p class="result">后端状态：{{ health }}</p>
          </div>
        </section>

        <section v-if="isLoggedIn" class="frontend-state-strip" data-testid="frontend-productization-state-strip">
          <article
            v-for="state in frontendProductizationStateCopy"
            :key="state.title"
            class="frontend-state-pill"
            :class="`tone-${state.tone}`"
          >
            <strong>{{ state.title }}</strong>
            <span>{{ state.detail }}</span>
          </article>
        </section>

        <section v-if="!isLoggedIn" class="login-page">
          <div class="login-brand">
            <div class="brand-mark" aria-hidden="true">
              <span class="svg-symbol" v-html="businessIconSvg('precision_manufacturing')" />
            </div>
            <h1>AI智能下单平台</h1>
            <p>智能下单与生产协同平台</p>
          </div>

          <div class="login-card portal-login-panel">
            <div class="login-card-header">
              <div>
                <h2>{{ selectedPortalOption ? `${selectedPortalOption.title}登录` : '选择登录入口' }}</h2>
                <span>{{ selectedPortalOption?.subtitle ?? '请选择授权端口，再输入账号密码' }}</span>
              </div>
              <button v-if="selectedPortal" class="ghost-icon-button" type="button" @click="selectedPortal = null">
                返回入口
              </button>
            </div>

            <div v-if="!selectedPortal" class="portal-grid" aria-label="登录入口">
              <div class="portal-section-label">端口入口</div>
              <button
                v-for="option in portalOptions"
                :key="option.value"
                class="portal-card"
                :class="`portal-card-${option.tone}`"
                type="button"
                :data-testid="`portal-card-${option.value}`"
                @click="selectPortal(option)"
              >
                <span class="portal-icon" aria-hidden="true">
                  <span class="svg-symbol" v-html="businessIconSvg(option.icon)" />
                </span>
                <strong>{{ option.title }}</strong>
                <span>{{ option.subtitle }}</span>
              </button>
            </div>

            <form v-else class="login-form" @submit.prevent="login">
	              <label class="login-field">
	                <span class="field-label">用户名</span>
	                <span class="field-icon svg-symbol" aria-hidden="true" v-html="businessIconSvg('person')" />
                <input
                  v-model="username"
                  name="username"
                  autocomplete="username"
                  placeholder="请输入授权账号"
                  type="text"
                  aria-label="用户名"
                >
              </label>
	              <label class="login-field">
	                <span class="field-label">密码</span>
	                <span class="field-icon svg-symbol" aria-hidden="true" v-html="businessIconSvg('lock')" />
                <input
                  v-model="password"
                  name="password"
                  autocomplete="current-password"
                  placeholder="请输入密码"
                  type="password"
                  aria-label="密码"
                >
              </label>
              <div class="login-options">
                <label class="remember-option">
                  <input type="checkbox">
                  <span>记住我</span>
                </label>
                <button class="text-link" type="button">忘记密码？</button>
              </div>
              <button class="login-submit" type="submit" :disabled="loading" aria-label="登录">
                <span>{{ loading ? '登录中...' : '登录系统' }}</span>
                <span class="svg-symbol" aria-hidden="true" v-html="businessIconSvg('arrow_forward')" />
              </button>
            </form>

            <div class="login-divider">
              <span>快速登录通道</span>
            </div>

            <p v-if="token" class="result success">
              登录成功：{{ roleLabels(currentUser?.roles) }} / {{ dataScopeLabel(currentUser?.dataScope) }}
            </p>
            <p v-if="loginError" class="result error">{{ loginError }}</p>
          </div>

          <div class="login-footer">
            <div class="auth-note">
              <span class="svg-symbol" aria-hidden="true" v-html="businessIconSvg('gpp_maybe')" />
              <span>仅用于授权账号访问</span>
            </div>
            <p>© 2026 AI智能下单平台</p>
          </div>
        </section>

        <section v-else-if="isInternalOrdersRoute" class="panel route-panel internal-order-panel">
          <div class="route-heading">
            <h2>{{ isProductizedCsDesignRoute ? '设计稿管理' : '客服初审' }}</h2>
            <div class="notification-heading-tags">
              <el-tag round>{{ internalOrders.length }} 单</el-tag>
              <el-tag v-if="isProductizedCsDesignRoute" type="success" round>本地第一增量</el-tag>
            </div>
          </div>

          <el-alert
            v-if="isProductizedCsDesignRoute"
            title="设计稿管理已复用客服订单详情内的设计稿版本、预览 URL 和审核入口；真实电子签章和客户最终验收仍为外部阻塞。"
            type="info"
            show-icon
            :closable="false"
          />

          <div class="prototype-chip-row">
            <button
              v-for="chip in prototypeQueueChips"
              :key="`internal-${chip.label}`"
              class="prototype-chip"
              :class="[`tone-${chip.tone}`, { active: isPrototypeChipActive(chip) }]"
              type="button"
              @click="selectPrototypeQueueChip(chip)"
            >
              {{ chip.label }}
              <span>{{ chip.count }}</span>
            </button>
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
                <span>{{ order.clinic_name }} / {{ productTypeLabel(order.product_type) }}</span>
                <small>{{ statusLabel(order.internal_status) }} / {{ statusLabel(order.external_status) }}</small>
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
                  <strong>{{ statusLabel(selectedInternalOrder.internal_status) }}</strong>
                </div>
                <div>
                  <span>医生状态</span>
                  <strong>{{ statusLabel(selectedInternalOrder.external_status) }}</strong>
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
                    <section class="doctor-order-create">
                      <div class="subheading-row">
                        <h3>资料缺失提示</h3>
                        <el-tag v-if="csMissingInfoComplete !== null" :type="csMissingInfoComplete ? 'success' : 'warning'" round>
                          {{ csMissingInfoComplete ? '资料完整' : `${csMissingInfoItems.length} 项缺失` }}
                        </el-tag>
                      </div>
                      <div class="inline-actions">
                        <el-button
                          :loading="csAiActionLoading"
                          data-testid="cs-missing-info-check"
                          @click="checkCsMissingInfo"
                        >
                          检查资料缺失
                        </el-button>
                        <el-button
                          :disabled="csMissingInfoItems.length === 0"
                          data-testid="cs-missing-info-apply-reject"
                          @click="applyCsMissingInfoToRejectReason"
                        >
                          填入驳回原因
                        </el-button>
                      </div>
                      <div v-if="csMissingInfoItems.length > 0" class="compact-list">
                        <article v-for="item in csMissingInfoItems" :key="item.field_key">
                          <strong>{{ item.field_label }}</strong>
                          <p>{{ item.tip }}</p>
                          <span>{{ item.field_key }}</span>
                        </article>
                      </div>
                    </section>

                    <section class="doctor-order-create">
                      <div class="subheading-row">
                        <h3>AI 翻译草稿</h3>
                        <el-tag type="info" round>人工确认后写入</el-tag>
                      </div>
                      <el-form-item label="待翻译内容">
                        <el-input
                          v-model="csTranslationSourceText"
                          data-testid="cs-translation-source-text"
                          type="textarea"
                          :rows="3"
                          placeholder="粘贴外文描述或订单要求"
                        />
                      </el-form-item>
                      <div class="inline-actions">
                        <el-button
                          :loading="csAiActionLoading"
                          :disabled="!csTranslationSourceText.trim()"
                          data-testid="cs-translation-generate"
                          @click="generateCsTranslationDraft"
                        >
                          生成翻译草稿
                        </el-button>
                        <el-button
                          type="primary"
                          plain
                          :disabled="!csTranslationDraft.trim()"
                          data-testid="cs-translation-apply-note"
                          @click="applyCsTranslationDraftToProductionNote"
                        >
                          写入生产备注
                        </el-button>
                      </div>
                      <div v-if="csTranslationDraft" class="ai-answer" data-testid="cs-translation-draft">
                        {{ csTranslationDraft }}
                      </div>
                    </section>

                    <section class="doctor-order-create">
                      <div class="subheading-row">
                        <h3>AI-5 生产备注</h3>
                        <el-tag type="warning" round>默认模板 / 人工确认</el-tag>
                      </div>
                      <p class="form-hint">
                        客户正式模板未确认，本草稿只按一期默认模板和订单上下文整理，确认后才写入生产备注。
                      </p>
                      <div class="inline-actions">
                        <el-button
                          :loading="csAiActionLoading"
                          data-testid="cs-production-note-generate"
                          @click="generateCsProductionNoteDraft"
                        >
                          生成生产备注草稿
                        </el-button>
                        <el-button
                          type="primary"
                          plain
                          :loading="csAiActionLoading"
                          :disabled="!csProductionNoteDraft.trim()"
                          data-testid="cs-production-note-confirm"
                          @click="confirmCsProductionNoteDraft"
                        >
                          人工确认写入
                        </el-button>
                      </div>
                      <div
                        v-if="csProductionNoteDraft"
                        class="ai-answer"
                        data-testid="cs-production-note-draft"
                      >
                        <strong>模板版本：{{ csProductionNoteTemplateVersion }}</strong>
                        <p>{{ csProductionNoteDraft }}</p>
                      </div>
                      <div
                        v-if="csProductionNoteKnowledgeNotes.length"
                        class="compact-list"
                        data-testid="cs-production-note-context-notes"
                      >
                        <article v-for="note in csProductionNoteKnowledgeNotes" :key="note">
                          <p>{{ note }}</p>
                        </article>
                      </div>
                      <el-form-item label="确认说明">
                        <el-input
                          v-model="csProductionNoteConfirmationNote"
                          data-testid="cs-production-note-confirmation-note"
                          type="textarea"
                          :rows="2"
                          placeholder="填写人工确认说明；不填写也会记录默认确认说明"
                        />
                      </el-form-item>
                    </section>

                    <el-alert
                      v-if="csAiResult"
                      :title="csAiResult"
                      type="success"
                      show-icon
                      :closable="false"
                    />
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

                <el-tab-pane label="设计稿">
                  <div class="review-form">
                    <el-form-item label="设计稿 file_id">
                      <el-input
                        v-model="csDesignDraftFileIds"
                        data-testid="internal-design-draft-file-ids"
                        placeholder="多个 file_id 用英文逗号分隔"
                      />
                    </el-form-item>
                    <el-form-item label="上传说明">
                      <el-input
                        v-model="csDesignDraftUploadNote"
                        data-testid="internal-design-draft-note"
                        type="textarea"
                        :rows="3"
                      />
                    </el-form-item>
                    <div class="inline-actions">
                      <el-button
                        type="primary"
                        :loading="csReviewActionLoading"
                        data-testid="internal-design-draft-upload-button"
                        @click="uploadInternalDesignDraft"
                      >
                        上传设计稿
                      </el-button>
                      <el-tag v-if="csDesignDraftResult" data-testid="internal-design-draft-result" type="success" round>
                        {{ csDesignDraftResult }}
                      </el-tag>
                    </div>
                    <div class="subheading-row">
                      <h3>客服设计稿预览链接</h3>
                      <el-tag type="info" round>短时效授权</el-tag>
                    </div>
                    <div v-if="csDesignDrafts.length > 0" class="compact-list">
                      <article v-for="draft in csDesignDrafts" :key="draft.draft_id">
                        <strong>V{{ draft.version }} / {{ statusLabel(draft.status) }}</strong>
                        <p>文件 ID：{{ designDraftFileIds(draft).join(', ') || '-' }}</p>
                        <span>文件数：{{ draft.file_count ?? designDraftFileIds(draft).length }}</span>
                        <div class="inline-actions">
                          <el-button
                            plain
                            :loading="csReviewActionLoading"
                            :disabled="designDraftFileIds(draft).length === 0"
                            data-testid="cs-design-draft-preview-url-button"
                            @click="loadCsDesignDraftPreviewUrls(draft)"
                          >
                            获取客服设计稿预览链接
                          </el-button>
                        </div>
                        <div
                          v-if="designDraftFileIds(draft).some((fileId) => csDesignDraftPreviewUrls[designDraftPreviewKey(draft, fileId)])"
                          class="preview-link-list"
                        >
                          <span>客服设计稿预览链接</span>
                          <a
                            v-for="fileId in designDraftFileIds(draft)"
                            v-show="csDesignDraftPreviewUrls[designDraftPreviewKey(draft, fileId)]"
                            :key="fileId"
                            :href="csDesignDraftPreviewUrls[designDraftPreviewKey(draft, fileId)]"
                            data-testid="cs-design-draft-preview-link"
                            target="_blank"
                            rel="noreferrer"
                          >
                            文件 {{ fileId }}
                          </a>
                        </div>
                      </article>
                    </div>
                    <div v-else class="empty-state">
                      暂无待预览设计稿
                    </div>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="账单物流">
                  <div class="review-form">
                    <el-form-item label="账单 file_id">
                      <el-input
                        v-model="csBillFileId"
                        data-testid="internal-bill-file-id"
                        placeholder="填写已完成上传的账单文件 file_id"
                      />
                    </el-form-item>
                    <div class="inline-actions">
                      <el-button
                        type="primary"
                        :loading="csReviewActionLoading"
                        data-testid="internal-bill-upload-button"
                        @click="uploadInternalBill"
                      >
                        上传账单文件
                      </el-button>
                      <el-tag v-if="csBillResult" data-testid="internal-bill-result" type="success" round>
                        {{ csBillResult }}
                      </el-tag>
                    </div>
                    <el-form-item label="付款状态">
                      <el-select
                        v-model="csPaymentStatus"
                        data-testid="internal-payment-status-select"
                      >
                        <el-option label="待付款" value="PENDING_PAYMENT" />
                        <el-option label="部分付款" value="PARTIALLY_PAID" />
                        <el-option label="已付款" value="PAID" />
                        <el-option label="无需付款" value="NOT_REQUIRED" />
                      </el-select>
                    </el-form-item>
                    <div class="inline-actions">
                      <el-button
                        :loading="csReviewActionLoading"
                        data-testid="internal-payment-status-button"
                        @click="updateInternalPaymentStatus"
                      >
                        保存付款状态
                      </el-button>
                    </div>
                    <div class="order-create-grid">
                      <el-form-item label="收款金额（分）">
                        <el-input-number
                          v-model="csPaymentAmountCents"
                          :min="1"
                          data-testid="internal-payment-amount-input"
                        />
                      </el-form-item>
                      <el-form-item label="收款方式">
                        <el-select v-model="csPaymentMethod" data-testid="internal-payment-method-select">
                          <el-option label="银行转账" value="BANK_TRANSFER" />
                          <el-option label="现金" value="CASH" />
                          <el-option label="线下刷卡" value="OFFLINE_CARD" />
                          <el-option label="其他人工方式" value="OTHER_MANUAL" />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="收款备注">
                        <el-input v-model="csPaymentNote" data-testid="internal-payment-note-input" />
                      </el-form-item>
                    </div>
                    <div class="inline-actions">
                      <el-button
                        type="primary"
                        :loading="csReviewActionLoading"
                        data-testid="internal-payment-record-button"
                        @click="createInternalPaymentRecord"
                      >
                        记录人工收款
                      </el-button>
                    </div>
                    <p class="public-message">
                      物流录入仍在生产看板执行，并继续受终检出检通过后才能发货的既有门禁约束。
                    </p>
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

          <div class="prototype-chip-row">
            <button
              v-for="chip in prototypeQueueChips"
              :key="`review-${chip.label}`"
              class="prototype-chip"
              :class="[`tone-${chip.tone}`, { active: isPrototypeChipActive(chip) }]"
              type="button"
              @click="selectPrototypeQueueChip(chip)"
            >
              {{ chip.label }}
              <span>{{ chip.count }}</span>
            </button>
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
            :title="`已处理订单 ${productionReviewResult.order_id}，状态 ${statusLabel(productionReviewResult.internal_status)}`"
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
                <span>{{ order.clinic_name }} / {{ productTypeLabel(order.product_type) }}</span>
                <small>{{ statusLabel(order.internal_status) }} / {{ statusLabel(order.external_status) }}</small>
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
                  <strong>{{ statusLabel(selectedProductionReviewOrder.internal_status) }}</strong>
                </div>
                <div>
                  <span>医生状态</span>
                  <strong>{{ statusLabel(selectedProductionReviewOrder.external_status) }}</strong>
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
            <h2>{{ isWorkflowAssignRoute ? '员工派工' : '工序进度' }}</h2>
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
                <span>{{ order.clinic_name }} / {{ productTypeLabel(order.product_type) }}</span>
                <small>{{ statusLabel(order.internal_status) }} / {{ statusLabel(order.external_status) }}</small>
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
                  <strong>{{ statusLabel(selectedProcessInstance.instance_status) }}</strong>
                </div>
                <div>
                  <span>节点 / 边</span>
                  <strong>{{ selectedProcessInstance.nodes.length }} / {{ selectedProcessInstance.edges.length }}</strong>
                </div>
              </div>

              <div v-if="isWorkflowAssignRoute" class="assignment-toolbar">
                <el-form-item label="员工编号">
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
                  <span>{{ statusLabel(node.node_status) }}</span>
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

          <div class="prototype-chip-row">
            <button
              v-for="chip in prototypeQueueChips"
              :key="`worker-${chip.label}`"
              class="prototype-chip"
              :class="[`tone-${chip.tone}`, { active: isPrototypeChipActive(chip) }]"
              type="button"
              @click="selectPrototypeQueueChip(chip)"
            >
              {{ chip.label }}
              <span>{{ chip.count }}</span>
            </button>
          </div>

          <div class="doctor-order-toolbar">
            <el-select v-model="workerTaskStatus">
              <el-option label="待开工" value="READY" />
              <el-option label="进行中" value="IN_PROGRESS" />
              <el-option label="已完成" value="COMPLETED" />
              <el-option label="待处理" value="PENDING" />
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
                <span>{{ task.order_no }} / {{ statusLabel(task.node_status) }}</span>
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
              <el-option label="待开工 / 入检" value="READY" />
              <el-option label="已完成 / 出检" value="COMPLETED" />
              <el-option label="进行中" value="IN_PROGRESS" />
              <el-option label="待处理" value="PENDING" />
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
                <span>{{ task.order_no }} / {{ statusLabel(task.node_status) }}</span>
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
                  <strong>{{ statusLabel(selectedCheckTask.node_status) }}</strong>
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
              <el-option label="待处理 / 待返工记录" value="PENDING" />
              <el-option label="进行中" value="IN_PROGRESS" />
              <el-option label="已完成" value="DONE" />
            </el-select>
            <el-checkbox v-model="reworkOnlyImpacted" @change="loadReworkRecords">
              仅看影响后续工序
            </el-checkbox>
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

          <el-alert
            v-if="reworkCloseResult"
            :title="`已关闭返工：${reworkCloseResult.rework_id} / ${statusLabel(reworkCloseResult.status)}`"
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
                @click="selectReworkRecord(record)"
              >
                <strong>{{ record.order_no }} / 返工 {{ record.rework_id }}</strong>
                <span>{{ record.from_process_name ?? '-' }} -> {{ record.target_process_name ?? '-' }}</span>
                <small>返工目标节点 {{ record.target_node_instance_id ?? '-' }} / {{ statusLabel(record.target_node_status) }}</small>
                <small>影响后续节点 {{ record.impacted_node_count }} 个</small>
                <small v-if="record.responsibility_type">责任 {{ record.responsibility_type }} / {{ record.reason_category ?? '-' }}</small>
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
                  <strong>{{ statusLabel(selectedRework.status) }}</strong>
                </div>
                <div>
                  <span>影响后续节点</span>
                  <strong>{{ selectedRework.impacted_node_count }} 个</strong>
                </div>
                <div>
                  <span>影响节点 ID</span>
                  <strong>{{ selectedRework.impacted_node_instance_ids.length > 0 ? selectedRework.impacted_node_instance_ids.join(', ') : '-' }}</strong>
                </div>
                <div>
                  <span>责任分类</span>
                  <strong>{{ selectedRework.reason_category ?? '-' }} / {{ selectedRework.responsibility_type ?? '-' }}</strong>
                </div>
                <div>
                  <span>关闭时间</span>
                  <strong>{{ selectedRework.closed_at ?? '-' }}</strong>
                </div>
              </div>

              <div v-if="selectedRework" class="rework-impact-map" data-testid="rework-impact-map">
                <div class="rework-impact-head">
                  <div>
                    <span>返工影响图</span>
                    <strong>受影响后续工序 {{ selectedRework.impacted_node_count }} 个</strong>
                  </div>
                  <el-tag round>{{ statusLabel(selectedRework.status) }}</el-tag>
                </div>
                <div v-if="reworkImpactSteps.length > 0" class="rework-impact-flow">
                  <template v-for="(step, index) in reworkImpactSteps" :key="step.key">
                    <article
                      class="rework-impact-node"
                      :class="{ 'is-target': step.kind === 'target', 'is-impacted': step.kind === 'impacted' }"
                    >
                      <span>{{ step.kind === 'target' ? '返工目标' : '后续工序' }}</span>
                      <strong>{{ step.title }}</strong>
                      <small>{{ step.subtitle }}</small>
                    </article>
                    <span v-if="index < reworkImpactSteps.length - 1" class="rework-impact-link">
                      后续重置
                    </span>
                  </template>
                </div>
                <div v-else class="rework-impact-empty">
                  未记录受影响后续工序；仅需处理当前返工目标节点。
                </div>
                <p>
                  责任 {{ selectedRework.responsibility_type ?? '未分类' }}，
                  原因 {{ selectedRework.reason_category ?? '未分类' }}。
                  图中节点来自返工影响审计字段，只读展示，不修改派工或排产。
                </p>
              </div>

              <div v-if="selectedRework" class="check-form">
                <div class="doctor-order-toolbar">
                  <el-select v-model="reworkCloseReasonCategory" placeholder="原因分类">
                    <el-option
                      v-for="option in reworkReasonCategories"
                      :key="option.code"
                      :label="`${option.code} / ${option.label}`"
                      :value="option.code"
                    />
                  </el-select>
                  <el-select v-model="reworkCloseResponsibilityType" placeholder="责任类型">
                    <el-option
                      v-for="option in reworkResponsibilityTypes"
                      :key="option.code"
                      :label="`${option.code} / ${option.label}`"
                      :value="option.code"
                    />
                  </el-select>
                </div>
                <el-form-item label="关闭备注">
                  <el-input
                    v-model="reworkCloseNote"
                    data-testid="rework-close-note"
                    type="textarea"
                    :rows="3"
                    placeholder="目标节点重新出检通过后关闭返工"
                  />
                </el-form-item>
                <el-button
                  type="primary"
                  plain
                  :loading="reworkCloseLoading"
                  data-testid="rework-close-button"
                  @click="closeSelectedRework"
                >
                  关闭返工
                </el-button>
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
                    <strong>{{ statusLabel(selectedFinalInspectionTask.node_status) }}</strong>
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
                <el-form-item label="报告摘要">
                  <el-input
                    v-model="finalInspectionReportSummary"
                    data-testid="final-inspection-report-summary"
                    type="textarea"
                    :rows="3"
                    placeholder="终检通过后生成报告"
                  />
                </el-form-item>
                <el-form-item label="终检附件 file_id">
                  <el-input
                    v-model="finalInspectionAttachmentFileIds"
                    data-testid="final-inspection-attachment-file-ids"
                    placeholder="多个 ID 用逗号分隔"
                  />
                </el-form-item>
                <el-form-item label="终检 PDF file_id">
                  <el-input
                    v-model="finalInspectionPdfFileId"
                    data-testid="final-inspection-pdf-file-id"
                    placeholder="同订单 INTERNAL PDF 文件 ID"
                  />
                </el-form-item>
                <el-button
                  type="primary"
                  plain
                  :loading="finalInspectionReportLoading"
                  data-testid="final-inspection-report-create-button"
                  @click="createFinalInspectionReport"
                >
                  生成终检报告
                </el-button>
                <el-alert
                  v-if="finalInspectionReport"
                  :title="`终检报告 ${finalInspectionReport.report_no} / ${finalInspectionReport.conclusion}`"
                  type="success"
                  show-icon
                  :closable="false"
                >
                  <template #default>
                    节点 {{ finalInspectionReport.final_node_instance_id }} / 检查 {{ finalInspectionReport.final_check_id }} / {{ statusLabel(finalInspectionReport.status) }}
                    <span v-if="finalInspectionReport.pdf_file_id">
                      / PDF {{ finalInspectionReport.pdf_file_id }}
                    </span>
                    <span>
                      / 签名 {{ statusLabel(finalInspectionReport.signature_status) }}
                    </span>
                    <span v-if="finalInspectionReport.attachment_file_ids.length">
                      / 附件 {{ finalInspectionReport.attachment_file_ids.join(', ') }}
                    </span>
                  </template>
                </el-alert>
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
              <el-option label="进行中 / 计时" value="IN_PROGRESS" />
              <el-option label="待开工" value="READY" />
              <el-option label="已完成" value="COMPLETED" />
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
                <span>{{ task.order_no }} / {{ statusLabel(task.node_status) }}</span>
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
                  <strong>{{ statusLabel(selectedWorklogTask.node_status) }}</strong>
                </div>
              </div>

              <div class="worklog-status-card">
                <div>
                  <span>当前工时</span>
                  <strong>{{ activeWorkLog ? `#${activeWorkLog.work_log_id} / ${statusLabel(activeWorkLog.status)}` : '未开始' }}</strong>
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
            <div class="heading-tags">
              <el-tag round>{{ performanceStats ? `员工 ${performanceStats.user_id ?? '-'}` : '未加载' }}</el-tag>
              <el-tag
                v-if="performanceStats"
                data-testid="performance-formula-version"
                type="info"
                round
              >
                {{ performanceStats.performance_formula_version }}
              </el-tag>
            </div>
          </div>

          <div class="performance-toolbar">
            <el-input
              v-model="performanceUserId"
              placeholder="管理员可输入员工编号；生产人员留空查看本人"
              clearable
              @keyup.enter="loadPerformanceStats"
            />
            <el-input
              v-model="performanceStartDate"
              data-testid="performance-start-date"
              placeholder="开始日期 YYYY-MM-DD"
              clearable
              @keyup.enter="loadPerformanceStats"
            />
            <el-input
              v-model="performanceEndDate"
              data-testid="performance-end-date"
              placeholder="结束日期 YYYY-MM-DD"
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
              <small>已完成工时记录数</small>
            </article>
            <article class="performance-card">
              <span>有效工时</span>
              <strong>{{ performanceStats.effective_duration }}</strong>
              <small>分钟</small>
            </article>
            <article class="performance-card">
              <span>标准工时</span>
              <strong>{{ performanceStats.standard_duration }}</strong>
              <small>分钟</small>
            </article>
            <article class="performance-card">
              <span>标准工时覆盖率</span>
              <strong>{{ performanceStats.standard_coverage_rate }}%</strong>
              <small>{{ performanceStats.standard_covered_count }} 有标准 / {{ performanceStats.standard_missing_count }} 缺标准</small>
            </article>
            <article class="performance-card">
              <span>返工次数</span>
              <strong>{{ performanceStats.rework_count }}</strong>
              <small>目标节点返工记录</small>
            </article>
            <article class="performance-card">
              <span>生产责任返工</span>
              <strong>{{ performanceStats.responsible_rework_count }}</strong>
              <small>责任类型：生产人员</small>
            </article>
            <article class="performance-card">
              <span>非生产责任返工</span>
              <strong>{{ performanceStats.non_worker_responsibility_rework_count }}</strong>
              <small>医生 / 客服 / 系统</small>
            </article>
            <article class="performance-card">
              <span>未归因返工</span>
              <strong>{{ performanceStats.unclassified_rework_count }}</strong>
              <small>待关闭或待分类</small>
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
            <article class="performance-card" data-testid="performance-score-card">
              <span>默认绩效分</span>
              <strong>{{ performanceStats.performance_score }}</strong>
              <small>开发默认公式，不作工资结算</small>
            </article>
          </div>
          <div v-if="performanceStats" class="performance-detail-section">
            <div class="section-heading compact">
              <h3>工时明细</h3>
              <el-tag round>{{ performanceDetails.length }} 条</el-tag>
            </div>
            <el-table :data="performanceDetails" border empty-text="暂无工时明细">
              <el-table-column prop="order_no" label="订单号" min-width="160" />
              <el-table-column prop="node_name" label="工序" min-width="140" />
              <el-table-column prop="effective_duration" label="有效工时(分钟)" width="130" />
              <el-table-column prop="standard_duration" label="标准工时(分钟)" width="130" />
              <el-table-column label="准时" width="90">
                <template #default="{ row }">
                  <el-tag v-if="row.on_time === true" type="success" size="small">是</el-tag>
                  <el-tag v-else-if="row.on_time === false" type="danger" size="small">否</el-tag>
                  <el-tag v-else type="info" size="small">未配置</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="finished_at" label="完成时间" min-width="180" />
            </el-table>
          </div>
          <div v-else class="empty-state">
            暂无绩效统计
          </div>
        </section>

        <section v-else-if="isStaffWorkloadRoute" class="panel route-panel performance-panel">
          <div class="route-heading">
            <h2>人员档案</h2>
            <div class="heading-tags">
              <el-tag round>{{ staffWorkloadTotal }} 名员工</el-tag>
              <el-tag type="info" round>PRD V2.0 一期</el-tag>
            </div>
          </div>

          <div class="performance-toolbar">
            <el-input
              v-model="staffWorkloadKeyword"
              placeholder="搜索员工姓名、账号、部门或岗位"
              clearable
              data-testid="staff-workload-keyword"
              @keyup.enter="loadStaffWorkload"
            />
            <el-button
              type="primary"
              :loading="staffWorkloadLoading"
              data-testid="staff-workload-search"
              @click="loadStaffWorkload"
            >
              查询人员
            </el-button>
          </div>

          <el-alert
            v-if="staffWorkloadError"
            :title="staffWorkloadError"
            type="error"
            show-icon
            :closable="false"
          />

          <el-table
            :data="staffWorkloadItems"
            border
            data-testid="staff-workload-table"
            empty-text="暂无人员档案"
          >
            <el-table-column prop="display_name" label="员工" min-width="140">
              <template #default="{ row }">
                <strong>{{ row.display_name }}</strong>
                <div class="muted-text">ID {{ row.user_id }} / {{ row.username }}</div>
              </template>
            </el-table-column>
            <el-table-column label="部门岗位" min-width="180">
              <template #default="{ row }">
                <span>{{ row.dept_name ?? '未分配部门' }}</span>
                <div class="tag-row">
                  <el-tag
                    v-for="post in row.post_names"
                    :key="post"
                    size="small"
                    type="info"
                    effect="plain"
                  >
                    {{ post }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="角色" min-width="130">
              <template #default="{ row }">
                <el-tag
                  v-for="role in row.role_codes"
                  :key="role"
                  size="small"
                  effect="plain"
                >
                  {{ roleLabel(role) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="assigned_node_count" label="已分配节点" width="110" />
            <el-table-column prop="active_node_count" label="进行中/待开工" width="130" />
            <el-table-column prop="completed_work_log_count" label="完成工时数" width="120" />
            <el-table-column prop="effective_duration" label="有效工时(分钟)" width="130" />
            <el-table-column prop="rework_count" label="返工数" width="90" />
            <el-table-column prop="last_work_finished_at" label="最近完工" min-width="180" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'" size="small">
                  {{ statusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </section>

        <section v-else-if="isProductionBoardRoute" class="panel route-panel production-board-panel">
          <div class="route-heading">
            <h2>生产看板</h2>
            <el-tag round>{{ productionBoardOrders.length }} 单</el-tag>
          </div>

          <div class="prototype-chip-row">
            <button
              v-for="chip in prototypeQueueChips"
              :key="`board-${chip.label}`"
              class="prototype-chip"
              :class="[`tone-${chip.tone}`, { active: isPrototypeChipActive(chip) }]"
              type="button"
              @click="selectPrototypeQueueChip(chip)"
            >
              {{ chip.label }}
              <span>{{ chip.count }}</span>
            </button>
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
                <span>{{ order.clinic_name }} / {{ productTypeLabel(order.product_type) }}</span>
                <small>{{ statusLabel(order.internal_status) }} / {{ statusLabel(order.external_status) }}</small>
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
                  <strong>{{ statusLabel(selectedProductionBoardOrder.internal_status) }}</strong>
                </div>
                <div>
                  <span>外部状态</span>
                  <strong>{{ statusLabel(selectedProductionBoardOrder.external_status) }}</strong>
                </div>
                <div>
                  <span>诊所</span>
                  <strong>{{ selectedProductionBoardOrder.clinic_name }}</strong>
                </div>
              </div>

              <div v-if="productionBoardInstance" class="production-board-stats">
                <article class="performance-card">
                  <span>待开工</span>
                  <strong>{{ productionBoardNodeStats.READY }}</strong>
                  <small>待执行节点</small>
                </article>
                <article class="performance-card">
                  <span>进行中</span>
                  <strong>{{ productionBoardNodeStats.IN_PROGRESS }}</strong>
                  <small>进行中节点</small>
                </article>
                <article class="performance-card">
                  <span>已完成</span>
                  <strong>{{ productionBoardNodeStats.COMPLETED }}</strong>
                  <small>已完成节点</small>
                </article>
                <article class="performance-card">
                  <span>已跳过 / 待处理</span>
                  <strong>{{ productionBoardNodeStats.SKIPPED }} / {{ productionBoardNodeStats.PENDING }}</strong>
                  <small>跳过或未激活节点</small>
                </article>
              </div>

              <div class="review-form">
                <div class="section-subtitle">
                  终检发货
                </div>
                <div class="order-create-grid">
                  <el-form-item label="承运商">
                    <el-input
                      v-model="productionBoardLogisticsCarrier"
                      data-testid="production-board-logistics-carrier"
                      placeholder="例如：顺丰速运"
                    />
                  </el-form-item>
                  <el-form-item label="物流单号">
                    <el-input
                      v-model="productionBoardLogisticsTrackingNo"
                      data-testid="production-board-logistics-tracking-no"
                      placeholder="终检通过后才能发货"
                    />
                  </el-form-item>
                </div>
                <div class="inline-actions">
                  <el-button
                    type="primary"
                    :loading="productionBoardShippingLoading"
                    :disabled="!productionBoardLogisticsCarrier.trim() || !productionBoardLogisticsTrackingNo.trim()"
                    data-testid="production-board-ship-button"
                    @click="shipProductionBoardOrder"
                  >
                    录入物流并发货
                  </el-button>
                  <el-tag
                    v-if="productionBoardShippingResult"
                    data-testid="production-board-shipping-result"
                    type="success"
                    round
                  >
                    {{ productionBoardShippingResult }}
                  </el-tag>
                </div>
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
                  <span>{{ statusLabel(node.node_status) }}</span>
                  <span>员工 {{ node.assigned_user_id ?? '-' }}</span>
                  <span>{{ node.standard_duration ?? '-' }} 分钟</span>
                </button>
              </div>

              <div v-else class="empty-state">
                该订单暂无可展示的工序进度
              </div>
            </section>
          </div>
        </section>

        <section v-else-if="isDeliveryManagementRoute" class="panel route-panel production-board-panel" data-testid="cs-delivery-management-panel">
          <div class="route-heading">
            <h2>{{ isProductizedCsBillingRoute ? '账单管理' : '配送管理' }}</h2>
            <div class="heading-tags">
              <el-tag round>{{ deliveryOrders.length }} 单</el-tag>
              <el-tag type="info" round>人工跟进</el-tag>
              <el-tag v-if="isProductizedCsBillingRoute" type="success" round>本地第一增量</el-tag>
            </div>
          </div>

          <el-alert
            v-if="isProductizedCsBillingRoute"
            title="账单管理已复用账单文件、人工付款状态、物流发货和异常跟进本地链路；真实支付平台、电子发票和真实物流 API 未接入。"
            type="info"
            show-icon
            :closable="false"
          />

          <div class="production-board-toolbar">
            <el-select
              v-model="deliveryStatusFilter"
              data-testid="delivery-status-filter"
              @change="loadDeliveryOrders"
            >
              <el-option label="全部状态" value="ALL" />
              <el-option label="待发货" value="PENDING" />
              <el-option label="已发货" value="SHIPPED" />
              <el-option label="物流异常" value="EXCEPTION" />
              <el-option label="跟进中" value="FOLLOWING" />
              <el-option label="已解决" value="RESOLVED" />
            </el-select>
            <el-button
              type="primary"
              :loading="deliveryLoading"
              data-testid="delivery-refresh-button"
              @click="loadDeliveryOrders"
            >
              刷新配送列表
            </el-button>
          </div>

          <el-alert
            v-if="deliveryError"
            :title="deliveryError"
            type="error"
            show-icon
            :closable="false"
          />
          <el-alert
            v-if="deliveryResult"
            :title="deliveryResult"
            type="success"
            show-icon
            :closable="false"
          />

          <div class="production-board-workspace">
            <aside class="doctor-order-list" data-testid="delivery-order-list">
              <button
                v-for="order in deliveryOrders"
                :key="order.order_id"
                class="doctor-order-row"
                :class="{ active: selectedDeliveryOrder?.order_id === order.order_id }"
                type="button"
                @click="selectDeliveryOrder(order)"
              >
                <strong>{{ order.order_no }}</strong>
                <span>{{ productTypeLabel(order.product_type) }} / {{ statusLabel(order.logistics_status) }}</span>
                <small>{{ order.carrier ?? '未录入承运商' }} / {{ order.tracking_no ?? '未录入运单号' }}</small>
              </button>
              <div v-if="deliveryOrders.length === 0" class="empty-state">
                暂无配送订单
              </div>
            </aside>

            <section v-if="selectedDeliveryOrder" class="doctor-order-detail">
              <div class="doctor-order-summary">
                <div>
                  <span>订单</span>
                  <strong>{{ selectedDeliveryOrder.order_no }}</strong>
                </div>
                <div>
                  <span>账单</span>
                  <strong>{{ statusLabel(selectedDeliveryOrder.bill_status) }}</strong>
                </div>
                <div>
                  <span>付款</span>
                  <strong>{{ statusLabel(selectedDeliveryOrder.payment_status) }}</strong>
                </div>
                <div>
                  <span>物流</span>
                  <strong>{{ statusLabel(selectedDeliveryOrder.logistics_status) }}</strong>
                </div>
              </div>

              <div class="review-form">
                <div class="section-subtitle">
                  物流异常跟进
                </div>
                <div class="order-create-grid">
                  <el-form-item label="异常状态">
                    <el-select v-model="deliveryFollowUpStatus" data-testid="delivery-follow-up-status">
                      <el-option label="物流异常" value="EXCEPTION" />
                      <el-option label="跟进中" value="FOLLOWING" />
                      <el-option label="已解决" value="RESOLVED" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="承运商">
                    <el-input :model-value="selectedDeliveryOrder.carrier ?? '-'" readonly />
                  </el-form-item>
                  <el-form-item label="运单号">
                    <el-input :model-value="selectedDeliveryOrder.tracking_no ?? '-'" readonly />
                  </el-form-item>
                </div>
                <el-form-item label="内部跟进说明">
                  <el-input
                    v-model="deliveryFollowUpNote"
                    data-testid="delivery-follow-up-note"
                    type="textarea"
                    :rows="3"
                    placeholder="记录客服内部物流异常跟进，不外显给医生端"
                  />
                </el-form-item>
                <div class="inline-actions">
                  <el-button
                    type="primary"
                    :loading="deliverySaving"
                    :disabled="!deliveryFollowUpNote.trim()"
                    data-testid="delivery-follow-up-save"
                    @click="saveDeliveryFollowUp"
                  >
                    保存跟进
                  </el-button>
                </div>
                <p v-if="selectedDeliveryOrder.last_follow_up_note" class="public-message" data-testid="delivery-last-follow-up-note">
                  最近跟进：{{ selectedDeliveryOrder.last_follow_up_note }}
                </p>
              </div>
            </section>

            <section v-else class="doctor-order-detail empty-state">
              请选择一笔配送订单进行异常跟进
            </section>
          </div>
        </section>

        <section v-else-if="isDoctorAccountSettingsRoute" class="panel route-panel doctor-order-panel" data-testid="doctor-account-settings-panel">
          <div class="route-heading">
            <h2>账户设置</h2>
            <el-tag round>{{ doctorAccountSettings?.username ?? '医生账号' }}</el-tag>
          </div>

          <el-alert
            v-if="doctorAccountError"
            :title="doctorAccountError"
            type="error"
            show-icon
            :closable="false"
          />
          <el-alert
            v-if="doctorAccountResult"
            :title="doctorAccountResult"
            type="success"
            show-icon
            :closable="false"
          />

          <section class="doctor-order-detail">
            <div v-if="doctorAccountSettings" class="doctor-order-summary">
              <div>
                <span>账号</span>
                <strong>{{ doctorAccountSettings.username }}</strong>
              </div>
              <div>
                <span>姓名</span>
                <strong>{{ doctorAccountSettings.display_name }}</strong>
              </div>
              <div>
                <span>消息推送</span>
                <strong>{{ doctorAccountSettings.notification_push_enabled ? '开启' : '关闭' }}</strong>
              </div>
            </div>

            <div class="subheading-row">
              <h3>基础资料</h3>
              <el-button plain :loading="doctorAccountLoading" @click="loadDoctorAccountSettings">
                刷新
              </el-button>
            </div>
            <div class="order-create-grid">
              <el-form-item label="姓名">
                <el-input v-model="doctorAccountSettingsForm.display_name" data-testid="doctor-account-display-name-input" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="doctorAccountSettingsForm.contact_email" data-testid="doctor-account-email-input" />
              </el-form-item>
              <el-form-item label="电话">
                <el-input v-model="doctorAccountSettingsForm.contact_phone" data-testid="doctor-account-phone-input" />
              </el-form-item>
              <el-form-item label="消息推送">
                <el-switch v-model="doctorAccountSettingsForm.notification_push_enabled" data-testid="doctor-account-push-switch" />
              </el-form-item>
              <el-form-item label="收货地址">
                <el-input
                  v-model="doctorAccountSettingsForm.shipping_address"
                  type="textarea"
                  :rows="3"
                  data-testid="doctor-account-shipping-address-input"
                />
              </el-form-item>
            </div>
            <div class="inline-actions">
              <el-button
                type="primary"
                :loading="doctorAccountSaveLoading"
                :disabled="!doctorAccountSettingsForm.display_name.trim()"
                data-testid="doctor-account-save-button"
                @click="saveDoctorAccountSettings"
              >
                保存账户设置
              </el-button>
            </div>

            <div class="subheading-row">
              <h3>密码安全</h3>
              <el-tag round>仅本人</el-tag>
            </div>
            <div class="order-create-grid">
              <el-form-item label="当前密码">
                <el-input
                  v-model="doctorAccountCurrentPassword"
                  type="password"
                  show-password
                  autocomplete="current-password"
                  data-testid="doctor-account-current-password-input"
                />
              </el-form-item>
              <el-form-item label="新密码">
                <el-input
                  v-model="doctorAccountNewPassword"
                  type="password"
                  show-password
                  autocomplete="new-password"
                  data-testid="doctor-account-new-password-input"
                />
              </el-form-item>
            </div>
            <div class="inline-actions">
              <el-button
                :loading="doctorAccountPasswordLoading"
                :disabled="!doctorAccountCurrentPassword || doctorAccountNewPassword.length < 8"
                data-testid="doctor-account-password-button"
                @click="changeDoctorAccountPassword"
              >
                修改密码
              </el-button>
            </div>
          </section>
        </section>

        <section
          v-else-if="isClinicManagementRoute || isDoctorClinicRoute"
          class="panel route-panel doctor-order-panel"
          data-testid="clinic-preference-panel"
        >
          <div class="route-heading">
            <h2>{{ isDoctorClinicRoute ? '诊所信息' : '客户诊所管理' }}</h2>
            <el-tag round>{{ isDoctorClinicRoute ? '只读偏好' : `${clinics.length} 家` }}</el-tag>
          </div>

          <el-alert
            v-if="clinicError"
            :title="clinicError"
            type="error"
            show-icon
            :closable="false"
          />
          <el-alert
            v-if="clinicSaveResult"
            :title="clinicSaveResult"
            type="success"
            show-icon
            :closable="false"
          />

          <div v-if="isClinicManagementRoute" class="doctor-order-toolbar">
            <el-input
              v-model="clinicKeyword"
              placeholder="搜索诊所名称或联系人"
              clearable
              data-testid="clinic-keyword-input"
              @keyup.enter="loadClinics"
            />
            <el-button type="primary" :loading="clinicLoading" data-testid="clinic-search-button" @click="loadClinics">
              查询
            </el-button>
          </div>

          <div v-if="isClinicManagementRoute" class="doctor-order-workspace">
            <aside class="doctor-order-list">
              <button
                v-for="clinic in clinics"
                :key="clinic.clinic_id"
                class="doctor-order-row"
                :class="{ active: selectedClinic?.clinic_id === clinic.clinic_id }"
                type="button"
                @click="selectClinic(clinic)"
              >
                <strong>{{ clinic.clinic_name }}</strong>
                <span>{{ clinic.contact_name ?? '未填联系人' }} / {{ clinic.contact_phone ?? '未填电话' }}</span>
                <small>偏好 {{ clinic.preference_count }} 项 / {{ statusLabel(clinic.status) }}</small>
              </button>
              <div v-if="clinics.length === 0" class="empty-state">
                暂无诊所档案
              </div>
            </aside>

            <section class="doctor-order-detail">
              <div v-if="selectedClinic" class="doctor-order-summary">
                <div>
                  <span>诊所</span>
                  <strong>{{ selectedClinic.clinic_name }}</strong>
                </div>
                <div>
                  <span>联系人</span>
                  <strong>{{ selectedClinic.contact_name ?? '-' }}</strong>
                </div>
                <div>
                  <span>电话</span>
                  <strong>{{ selectedClinic.contact_phone ?? '-' }}</strong>
                </div>
              </div>

              <div class="subheading-row">
                <h3>一期客户偏好</h3>
                <el-tag v-if="clinicPreference" round>{{ clinicPreference.clinic_name }}</el-tag>
              </div>
              <div class="order-create-grid">
                <el-form-item label="色号偏好">
                  <el-input v-model="clinicPreferenceForm.color" data-testid="clinic-preference-color-input" />
                </el-form-item>
                <el-form-item label="邻接偏好">
                  <el-input v-model="clinicPreferenceForm.contact" />
                </el-form-item>
                <el-form-item label="边缘设计">
                  <el-input v-model="clinicPreferenceForm.margin" />
                </el-form-item>
                <el-form-item label="外形偏好">
                  <el-input v-model="clinicPreferenceForm.shape" />
                </el-form-item>
                <el-form-item label="材料偏好">
                  <el-input v-model="clinicPreferenceForm.material" />
                </el-form-item>
                <el-form-item label="备注">
                  <el-input v-model="clinicPreferenceForm.note" />
                </el-form-item>
              </div>
              <div class="inline-actions">
                <el-button
                  type="primary"
                  :loading="clinicSaveLoading"
                  :disabled="!selectedClinic"
                  data-testid="clinic-preference-save-button"
                  @click="saveClinicPreference"
                >
                  保存客户偏好
                </el-button>
              </div>

              <template v-if="canCreateClinic">
                <div class="subheading-row">
                <h3>新建诊所</h3>
                <el-tag round>ADMIN</el-tag>
                </div>
                <div class="order-create-grid">
                  <el-form-item label="诊所名称">
                    <el-input v-model="clinicCreateName" data-testid="clinic-create-name-input" />
                  </el-form-item>
                  <el-form-item label="联系人">
                    <el-input v-model="clinicCreateContactName" />
                  </el-form-item>
                  <el-form-item label="联系电话">
                    <el-input v-model="clinicCreateContactPhone" />
                  </el-form-item>
                </div>
                <div class="inline-actions">
                  <el-button
                    :loading="clinicSaveLoading"
                    :disabled="!clinicCreateName.trim()"
                    data-testid="clinic-create-button"
                    @click="createClinic"
                  >
                    创建诊所
                  </el-button>
                </div>
              </template>
            </section>
          </div>

          <div v-else class="doctor-order-workspace">
            <section class="doctor-order-detail">
              <div v-if="selectedClinic" class="doctor-order-summary">
                <div>
                  <span>所属诊所</span>
                  <strong>{{ selectedClinic.clinic_name }}</strong>
                </div>
                <div>
                  <span>联系人</span>
                  <strong>{{ selectedClinic.contact_name ?? '-' }}</strong>
                </div>
                <div>
                  <span>联系电话</span>
                  <strong>{{ selectedClinic.contact_phone ?? '-' }}</strong>
                </div>
              </div>
              <div class="compact-list">
                <article v-for="key in Object.keys(clinicPreferenceForm)" :key="key">
                  <strong>{{ clinicPreferenceLabel(key) }}</strong>
                  <p>{{ clinicPreferenceForm[key] || '暂未配置' }}</p>
                </article>
              </div>
            </section>
          </div>
        </section>

        <section v-else-if="isDoctorPatientsRoute" class="panel route-panel doctor-order-panel">
          <div class="route-heading">
            <h2>患者管理</h2>
            <el-tag round>{{ doctorPatients.length }} 位</el-tag>
          </div>

          <div class="doctor-order-toolbar">
            <el-input
              v-model="doctorPatientKeyword"
              placeholder="搜索患者姓名"
              clearable
              @keyup.enter="loadDoctorPatients"
            />
            <el-button type="primary" :loading="doctorPatientsLoading" @click="loadDoctorPatients">
              查询
            </el-button>
          </div>

          <el-alert
            v-if="doctorPatientError"
            :title="doctorPatientError"
            type="error"
            show-icon
            :closable="false"
          />

          <div class="doctor-order-workspace">
            <aside class="doctor-order-list">
              <button
                v-for="patient in doctorPatients"
                :key="patient.patient_id"
                class="doctor-order-row"
                :class="{ active: selectedDoctorPatient?.patient_id === patient.patient_id }"
                type="button"
                @click="selectDoctorPatient(patient)"
              >
                <strong>{{ patient.patient_name }}</strong>
                <span>{{ patient.patient_gender ?? 'UNKNOWN' }} / {{ patient.patient_age ?? '-' }} 岁</span>
                <small>历史订单 {{ patient.order_count }} 单</small>
              </button>
              <div v-if="doctorPatients.length === 0" class="empty-state">
                暂无患者档案
              </div>
            </aside>

            <section class="doctor-order-detail">
              <div class="subheading-row">
                <h3>新建患者档案</h3>
                <el-tag v-if="doctorPatientCreateResult" type="success" round>{{ doctorPatientCreateResult }}</el-tag>
              </div>
              <div class="order-create-grid">
                <el-form-item label="患者姓名">
                  <el-input v-model="doctorPatientName" data-testid="doctor-patient-name-input" />
                </el-form-item>
                <el-form-item label="年龄">
                  <el-input-number v-model="doctorPatientAge" :min="0" :max="130" />
                </el-form-item>
                <el-form-item label="性别">
                  <el-select v-model="doctorPatientGender">
                    <el-option label="未知" value="UNKNOWN" />
                    <el-option label="男" value="MALE" />
                    <el-option label="女" value="FEMALE" />
                  </el-select>
                </el-form-item>
              </div>
              <el-form-item label="口腔情况">
                <el-input
                  v-model="doctorPatientOralDescription"
                  type="textarea"
                  :rows="2"
                  placeholder="记录一期基础患者口腔描述"
                />
              </el-form-item>
              <div class="inline-actions">
                <el-button
                  type="primary"
                  :loading="doctorPatientCreateLoading"
                  :disabled="!doctorPatientName.trim()"
                  data-testid="doctor-patient-create-button"
                  @click="createDoctorPatient"
                >
                  创建患者
                </el-button>
              </div>

              <div v-if="selectedDoctorPatient" class="doctor-order-summary">
                <div>
                  <span>当前患者</span>
                  <strong>{{ selectedDoctorPatient.patient_name }}</strong>
                </div>
                <div>
                  <span>历史订单</span>
                  <strong>{{ selectedDoctorPatient.order_count }} 单</strong>
                </div>
                <div>
                  <span>最近订单</span>
                  <strong>{{ selectedDoctorPatient.latest_order_at ?? '-' }}</strong>
                </div>
              </div>

              <div class="compact-list">
                <article v-for="order in doctorPatientOrders" :key="order.order_id">
                  <strong>{{ order.order_no }} / {{ statusLabel(order.external_status) }}</strong>
                  <p>{{ productTypeLabel(order.product_type) }} / {{ order.created_at }}</p>
                </article>
                <div v-if="selectedDoctorPatient && doctorPatientOrders.length === 0" class="empty-state">
                  该患者暂无历史订单
                </div>
              </div>
            </section>
          </div>
        </section>

        <section v-else-if="isDoctorOrderRoute" class="panel route-panel doctor-order-panel">
          <div class="route-heading">
            <h2>医生订单工作台</h2>
            <el-tag round>{{ doctorOrders.length }} 单</el-tag>
          </div>

          <el-tabs v-model="activeDoctorOrderSection" class="doctor-tabs doctor-section-tabs">
            <el-tab-pane label="新建订单" name="create" />
            <el-tab-pane label="我的订单" name="list" />
            <el-tab-pane label="设计稿确认" name="design" />
            <el-tab-pane label="账单物流" name="bill" />
            <el-tab-pane label="沟通留言" name="messages" />
            <el-tab-pane label="订单助手" name="ai" />
          </el-tabs>

          <div v-show="activeDoctorOrderSection !== 'create'" class="prototype-chip-row">
            <button
              v-for="chip in prototypeQueueChips"
              :key="`doctor-${chip.label}`"
              class="prototype-chip"
              :class="[`tone-${chip.tone}`, { active: isPrototypeChipActive(chip) }]"
              type="button"
              @click="selectPrototypeQueueChip(chip)"
            >
              {{ chip.label }}
              <span>{{ chip.count }}</span>
            </button>
          </div>

          <section v-show="activeDoctorOrderSection === 'create'" class="doctor-order-create">
            <div class="subheading-row">
              <h3>{{ doctorOrderEditingId ? '编辑草稿/补资料' : '新建订单' }}</h3>
              <el-button :loading="doctorOrderCreateLoading" @click="loadDoctorOrderForm">刷新表单</el-button>
            </div>
            <el-alert
              v-if="doctorOrderEditingId"
              :title="`正在编辑订单 #${doctorOrderEditingId}`"
              type="info"
              show-icon
              :closable="false"
            />
            <div class="order-create-grid">
              <el-form-item label="产品类型">
                <el-input
                  v-model="doctorOrderFormProductType"
                  @change="loadDoctorOrderForm"
                />
              </el-form-item>
              <el-form-item label="绑定患者">
                <el-select
                  v-model="selectedDoctorPatientId"
                  data-testid="doctor-order-patient-select"
                  clearable
                  placeholder="选择患者档案"
                >
                  <el-option
                    v-for="patient in doctorPatients"
                    :key="patient.patient_id"
                    :label="patient.patient_name"
                    :value="patient.patient_id"
                  />
                </el-select>
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
            <el-alert
              v-if="doctorPreSubmitMissingComplete !== null"
              data-testid="doctor-order-missing-alert"
              :title="doctorPreSubmitMissingComplete ? 'AI-4 资料缺失检查：当前必填资料完整' : 'AI-4 资料缺失检查：请先补齐必填资料后再提交'"
              :type="doctorPreSubmitMissingComplete ? 'success' : 'warning'"
              show-icon
              :closable="false"
            />
            <div v-if="doctorPreSubmitMissingItems.length > 0" class="compact-list">
              <article
                v-for="item in doctorPreSubmitMissingItems"
                :key="item.field_key"
                data-testid="doctor-order-missing-item"
              >
                <strong>{{ item.field_label }}</strong>
                <p>{{ item.tip }}</p>
              </article>
            </div>
            <div class="inline-actions">
              <el-button
                plain
                :loading="doctorOrderCreateLoading"
                :disabled="doctorOrderFormFields.length === 0"
                data-testid="doctor-order-save-draft-button"
                @click="saveDoctorOrderDraft"
              >
                保存草稿
              </el-button>
              <el-button
                type="primary"
                :loading="doctorOrderCreateLoading"
                :disabled="doctorOrderFormFields.length === 0"
                data-testid="doctor-order-create-button"
                @click="doctorOrderEditingId ? submitDoctorOrderSupplement() : createDoctorOrder()"
              >
                {{ doctorOrderEditingId ? '提交草稿/补资料' : '提交订单' }}
              </el-button>
              <el-button
                v-if="doctorOrderEditingId"
                plain
                @click="cancelDoctorOrderEdit"
              >
                取消编辑
              </el-button>
              <el-tag v-if="doctorOrderCreateResult" data-testid="doctor-order-create-result" type="success" round>
                {{ doctorOrderCreateResult.order_no }} / {{ statusLabel(doctorOrderCreateResult.external_status) }}
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

          <div v-show="activeDoctorOrderSection !== 'create'" class="doctor-order-toolbar">
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

          <div v-show="activeDoctorOrderSection !== 'create'" class="doctor-order-workspace">
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
                <span>{{ productTypeLabel(order.product_type) }} / {{ statusLabel(order.external_status) }}</span>
                <small>{{ order.public_message ?? '暂无公开进度说明' }}</small>
              </button>
              <div v-if="doctorOrders.length === 0" class="empty-state">
                暂无医生订单
              </div>
            </aside>

            <section v-if="doctorOrderWorkspace" class="doctor-order-detail">
              <div class="inline-actions">
                <el-button
                  plain
                  data-testid="doctor-order-edit-button"
                  @click="startDoctorOrderEdit(doctorOrderWorkspace.order)"
                >
                  继续编辑/补资料
                </el-button>
              </div>
              <div class="doctor-order-summary">
                <div>
                  <span>订单号</span>
                  <strong>{{ doctorOrderWorkspace.order.order_no }}</strong>
                </div>
                <div>
                  <span>外部状态</span>
                  <strong>{{ statusLabel(doctorOrderWorkspace.order.external_status) }}</strong>
                </div>
                <div>
                  <span>账单</span>
                  <strong>{{ statusLabel(doctorOrderWorkspace.bill.bill_status) }}</strong>
                </div>
                <div>
                  <span>物流</span>
                  <strong>{{ statusLabel(doctorOrderWorkspace.logistics.logistics_status) }}</strong>
                </div>
              </div>

              <el-tabs v-model="activeDoctorDetailTab" class="doctor-tabs">
                <el-tab-pane label="订单资料" name="info">
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

                <el-tab-pane label="消息" name="messages">
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
                      <strong>{{ roleLabel(message.sender_role) }} / {{ statusLabel(message.review_status) }}</strong>
                      <p>{{ message.content }}</p>
                    </article>
                    <div v-if="doctorOrderWorkspace.messages.length === 0" class="empty-state">
                      暂无公开消息
                    </div>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="设计稿" name="design">
                  <div class="compact-list">
                    <article v-for="draft in doctorOrderWorkspace.drafts" :key="draft.draft_id">
                      <strong>V{{ draft.version }} / {{ statusLabel(draft.status) }}</strong>
                      <p>文件 ID：{{ draft.file_ids?.length ? draft.file_ids.join(', ') : (draft.file_id ?? '-') }}</p>
                      <span>文件数：{{ draft.file_count ?? draft.file_ids?.length ?? (draft.file_id ? 1 : 0) }}</span>
                      <div class="inline-actions">
                        <el-button
                          plain
                          :loading="doctorActionLoading"
                          :disabled="designDraftFileIds(draft).length === 0"
                          data-testid="design-draft-preview-url-button"
                          @click="loadDesignDraftPreviewUrls(draft)"
                        >
                          获取设计稿预览链接
                        </el-button>
                      </div>
                      <div
                        v-if="designDraftFileIds(draft).some((fileId) => designDraftPreviewUrls[designDraftPreviewKey(draft, fileId)])"
                        class="preview-link-list"
                      >
                        <span>设计稿预览链接</span>
                        <a
                          v-for="fileId in designDraftFileIds(draft)"
                          v-show="designDraftPreviewUrls[designDraftPreviewKey(draft, fileId)]"
                          :key="fileId"
                          :href="designDraftPreviewUrls[designDraftPreviewKey(draft, fileId)]"
                          data-testid="design-draft-preview-link"
                          target="_blank"
                          rel="noreferrer"
                        >
                          文件 {{ fileId }}
                        </a>
                      </div>
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

                <el-tab-pane label="账单物流" name="bill">
                  <div class="doctor-order-summary">
                    <div>
                      <span>账单状态</span>
                      <strong>{{ statusLabel(doctorOrderWorkspace.bill.bill_status) }}</strong>
                    </div>
                    <div>
                      <span>付款状态</span>
                      <strong data-testid="doctor-payment-status">{{ statusLabel(doctorOrderWorkspace.bill.payment_status) }}</strong>
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
                  <div class="compact-list">
                    <article v-for="payment in doctorOrderWorkspace.payments" :key="payment.payment_id">
                      <strong>{{ payment.currency }} {{ payment.amount_cents }} 分 / {{ payment.payment_method }}</strong>
                      <p>{{ payment.received_at }} / {{ payment.payment_note ?? '无备注' }}</p>
                    </article>
                    <div v-if="doctorOrderWorkspace.payments.length === 0" class="empty-state">
                      暂无人工收款流水
                    </div>
                  </div>
                  <div class="inline-actions">
                    <el-button
                      :loading="doctorActionLoading"
                      :disabled="!doctorOrderWorkspace.bill.file_id"
                      data-testid="doctor-bill-preview-button"
                      @click="loadDoctorBillPreviewUrl"
                    >
                      获取账单预览链接
                    </el-button>
                    <a
                      v-if="doctorBillPreviewUrl"
                      :href="doctorBillPreviewUrl"
                      data-testid="doctor-bill-preview-link"
                      target="_blank"
                      rel="noreferrer"
                    >
                      账单预览链接
                    </a>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="订单助手" name="ai">
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

        <section v-else-if="isFormConfigsRoute" class="panel route-panel form-config-panel">
          <div class="route-heading">
            <h2>产品管理</h2>
            <el-tag round>产品参数 / 基础价</el-tag>
          </div>

          <div class="notification-toolbar">
            <el-input
              v-model="productCatalogKeyword"
              data-testid="product-catalog-keyword"
              placeholder="搜索产品类型 / 名称 / 材料"
              style="max-width: 260px"
            />
            <el-button :loading="productCatalogLoading" data-testid="product-catalog-refresh" @click="loadProductCatalog">
              刷新产品
            </el-button>
          </div>

          <el-alert
            v-if="productCatalogError"
            :title="productCatalogError"
            type="error"
            show-icon
            :closable="false"
          />
          <el-alert
            v-if="productCatalogResult"
            :title="productCatalogResult"
            type="success"
            show-icon
            :closable="false"
          />

          <div class="form-config-layout" data-testid="product-catalog-panel">
            <section class="form-config-editor">
              <h3>新增产品</h3>
              <div class="form-grid">
                <label>
                  产品类型
                  <el-input v-model="productCatalogCreateType" data-testid="product-catalog-create-type" />
                </label>
                <label>
                  产品名称
                  <el-input v-model="productCatalogCreateName" data-testid="product-catalog-create-name" />
                </label>
                <label>
                  材料规格
                  <el-input v-model="productCatalogCreateMaterial" data-testid="product-catalog-create-material" />
                </label>
                <label>
                  基础价（分）
                  <el-input-number v-model="productCatalogCreatePrice" :min="1" :step="100" data-testid="product-catalog-create-price" />
                </label>
                <label>
                  币种
                  <el-input v-model="productCatalogCreateCurrency" data-testid="product-catalog-create-currency" />
                </label>
                <label>
                  价格备注
                  <el-input v-model="productCatalogCreateNote" data-testid="product-catalog-create-note" />
                </label>
              </div>
              <div class="inline-actions">
                <el-button
                  type="primary"
                  :loading="productCatalogSaving"
                  data-testid="product-catalog-create-button"
                  @click="createProductCatalogItem"
                >
                  新增产品
                </el-button>
              </div>
            </section>

            <section class="form-config-editor">
              <h3>编辑产品</h3>
              <div v-if="selectedProductCatalogItem" class="form-grid">
                <label>
                  产品名称
                  <el-input v-model="productCatalogEditName" data-testid="product-catalog-edit-name" />
                </label>
                <label>
                  材料规格
                  <el-input v-model="productCatalogEditMaterial" data-testid="product-catalog-edit-material" />
                </label>
                <label>
                  基础价（分）
                  <el-input-number v-model="productCatalogEditPrice" :min="1" :step="100" data-testid="product-catalog-edit-price" />
                </label>
                <label>
                  状态
                  <el-select v-model="productCatalogEditStatus" data-testid="product-catalog-edit-status">
                    <el-option label="启用" value="ACTIVE" />
                    <el-option label="停用" value="INACTIVE" />
                  </el-select>
                </label>
                <label>
                  币种
                  <el-input v-model="productCatalogEditCurrency" data-testid="product-catalog-edit-currency" />
                </label>
                <label>
                  价格备注
                  <el-input v-model="productCatalogEditNote" data-testid="product-catalog-edit-note" />
                </label>
              </div>
              <div v-if="selectedProductCatalogItem" class="inline-actions">
                <el-button
                  type="primary"
                  :loading="productCatalogSaving"
                  data-testid="product-catalog-update-button"
                  @click="updateProductCatalogItem()"
                >
                  保存产品
                </el-button>
                <el-button
                  type="danger"
                  plain
                  :loading="productCatalogSaving"
                  data-testid="product-catalog-deactivate-button"
                  @click="updateProductCatalogItem('INACTIVE')"
                >
                  停用
                </el-button>
              </div>
              <div v-else class="empty-state">
                暂无可编辑产品
              </div>
            </section>
          </div>

          <div v-if="productCatalogItems.length === 0" class="empty-state">
            暂无产品
          </div>
          <div v-else class="compact-list" data-testid="product-catalog-list">
            <article
              v-for="item in productCatalogItems"
              :key="item.product_id"
              :class="{ selected: item.product_id === selectedProductCatalogId }"
              @click="selectProductCatalogItem(item)"
            >
              <strong>{{ item.product_name }} / {{ item.product_type }}</strong>
              <p>{{ item.material_spec || '未填材料规格' }} / {{ statusLabel(item.status) }}</p>
              <span>{{ item.currency }} {{ (item.base_price_cents / 100).toFixed(2) }} / {{ item.price_note || '人工维护基础价' }}</span>
            </article>
          </div>

          <div class="route-heading secondary-heading">
            <h2>动态表单</h2>
            <el-tag round>{{ formConfigProductType || 'ALL' }}</el-tag>
          </div>

          <div class="notification-toolbar">
            <el-input
              v-model="formConfigProductType"
              data-testid="form-config-product-filter"
              placeholder="产品类型"
              style="max-width: 220px"
            />
            <el-button :loading="formConfigLoading" @click="loadFormConfigFields">刷新</el-button>
          </div>

          <el-alert
            v-if="formConfigError"
            :title="formConfigError"
            type="error"
            show-icon
            :closable="false"
          />
          <el-alert
            v-if="formConfigResult"
            :title="formConfigResult"
            type="success"
            show-icon
            :closable="false"
          />

          <div class="form-config-layout">
            <section class="form-config-editor">
              <h3>新增字段</h3>
              <div class="form-grid">
                <label>
                  产品类型
                  <el-input v-model="formConfigCreateProductType" data-testid="form-config-create-product" />
                </label>
                <label>
                  字段 key
                  <el-input v-model="formConfigCreateKey" data-testid="form-config-create-key" />
                </label>
                <label>
                  字段名
                  <el-input v-model="formConfigCreateLabel" data-testid="form-config-create-label" />
                </label>
                <label>
                  类型
                  <el-select v-model="formConfigCreateType" data-testid="form-config-create-type">
                    <el-option v-for="type in formFieldTypeOptions" :key="type" :label="type" :value="type" />
                  </el-select>
                </label>
                <label>
                  排序
                  <el-input-number v-model="formConfigCreateSortOrder" :min="0" :step="10" />
                </label>
                <label>
                  选项
                  <el-input v-model="formConfigCreateOptions" data-testid="form-config-create-options" />
                </label>
              </div>
              <el-checkbox v-model="formConfigCreateRequired">必填</el-checkbox>
              <div class="inline-actions">
                <el-button
                  type="primary"
                  :loading="formConfigSaving"
                  data-testid="form-config-create-button"
                  @click="createFormConfigField"
                >
                  新增字段
                </el-button>
              </div>
            </section>

            <section class="form-config-editor">
              <h3>编辑字段</h3>
              <div v-if="selectedFormConfigField" class="form-grid">
                <label>
                  字段名
                  <el-input v-model="formConfigEditLabel" data-testid="form-config-edit-label" />
                </label>
                <label>
                  状态
                  <el-select v-model="formConfigEditStatus" data-testid="form-config-edit-status">
                    <el-option label="启用" value="ACTIVE" />
                    <el-option label="停用" value="INACTIVE" />
                  </el-select>
                </label>
                <label>
                  排序
                  <el-input-number v-model="formConfigEditSortOrder" :min="0" :step="10" />
                </label>
                <label>
                  选项
                  <el-input v-model="formConfigEditOptions" data-testid="form-config-edit-options" />
                </label>
              </div>
              <div v-if="selectedFormConfigField" class="inline-actions">
                <el-checkbox v-model="formConfigEditRequired">必填</el-checkbox>
                <el-button
                  type="primary"
                  :loading="formConfigSaving"
                  data-testid="form-config-update-button"
                  @click="updateFormConfigField()"
                >
                  保存
                </el-button>
                <el-button
                  type="danger"
                  plain
                  :loading="formConfigSaving"
                  data-testid="form-config-deactivate-button"
                  @click="updateFormConfigField('INACTIVE')"
                >
                  停用
                </el-button>
              </div>
              <div v-else class="empty-state">
                暂无可编辑字段
              </div>
            </section>
          </div>

          <div v-if="formConfigFields.length === 0" class="empty-state">
            暂无字段
          </div>
          <div v-else class="compact-list" data-testid="form-config-field-list">
            <article
              v-for="field in formConfigFields"
              :key="field.field_id"
              :class="{ selected: field.field_id === selectedFormConfigFieldId }"
              @click="selectFormConfigField(field)"
            >
              <strong>{{ field.field_label }} / {{ field.field_key }}</strong>
              <p>{{ productTypeLabel(field.product_type) }} / {{ fieldTypeLabel(field.field_type) }} / {{ statusLabel(field.status) }}</p>
              <span>排序 {{ field.sort_order }} / {{ field.is_required ? '必填' : '选填' }}</span>
            </article>
          </div>
        </section>

        <section v-else-if="isReworkDictionariesRoute" class="panel route-panel form-config-panel">
          <div class="route-heading">
            <h2>返工字典</h2>
            <el-tag round>{{ reworkDictionaryManageType === 'REASON_CATEGORY' ? '返工原因' : '责任类型' }}</el-tag>
          </div>

          <div class="notification-toolbar">
            <el-select
              v-model="reworkDictionaryManageType"
              data-testid="rework-dictionary-type-filter"
              style="max-width: 220px"
              @change="loadReworkDictionaryManageItems"
            >
              <el-option
                v-for="type in reworkDictionaryTypeOptions"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
            <el-button :loading="reworkDictionaryManageLoading" @click="loadReworkDictionaryManageItems">刷新</el-button>
          </div>

          <el-alert
            v-if="reworkDictionaryManageError"
            :title="reworkDictionaryManageError"
            type="error"
            show-icon
            :closable="false"
          />
          <el-alert
            v-if="reworkDictionaryManageResult"
            :title="reworkDictionaryManageResult"
            type="success"
            show-icon
            :closable="false"
          />

          <div class="form-config-layout">
            <section class="form-config-editor">
              <h3>新增字典项</h3>
              <div class="form-grid">
                <label>
                  类型
                  <el-select v-model="reworkDictionaryManageType" data-testid="rework-dictionary-create-type">
                    <el-option
                      v-for="type in reworkDictionaryTypeOptions"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                    />
                  </el-select>
                </label>
                <label>
                  编码
                  <el-input v-model="reworkDictionaryCreateCode" data-testid="rework-dictionary-create-code" />
                </label>
                <label>
                  名称
                  <el-input v-model="reworkDictionaryCreateLabel" data-testid="rework-dictionary-create-label" />
                </label>
                <label>
                  排序
                  <el-input-number v-model="reworkDictionaryCreateSortOrder" :min="0" :step="10" />
                </label>
              </div>
              <div class="inline-actions">
                <el-button
                  type="primary"
                  :loading="reworkDictionaryManageSaving"
                  data-testid="rework-dictionary-create-button"
                  @click="createReworkDictionaryItem"
                >
                  新增字典
                </el-button>
              </div>
            </section>

            <section class="form-config-editor">
              <h3>编辑字典项</h3>
              <div v-if="selectedReworkDictionaryItem" class="form-grid">
                <label>
                  名称
                  <el-input v-model="reworkDictionaryEditLabel" data-testid="rework-dictionary-edit-label" />
                </label>
                <label>
                  状态
                  <el-select v-model="reworkDictionaryEditStatus" data-testid="rework-dictionary-edit-status">
                    <el-option label="启用" value="ACTIVE" />
                    <el-option label="停用" value="INACTIVE" />
                  </el-select>
                </label>
                <label>
                  排序
                  <el-input-number v-model="reworkDictionaryEditSortOrder" :min="0" :step="10" />
                </label>
              </div>
              <div v-if="selectedReworkDictionaryItem" class="inline-actions">
                <el-button
                  type="primary"
                  :loading="reworkDictionaryManageSaving"
                  data-testid="rework-dictionary-update-button"
                  @click="updateReworkDictionaryItem()"
                >
                  保存
                </el-button>
                <el-button
                  type="danger"
                  plain
                  :loading="reworkDictionaryManageSaving"
                  data-testid="rework-dictionary-deactivate-button"
                  @click="updateReworkDictionaryItem('INACTIVE')"
                >
                  停用
                </el-button>
              </div>
              <div v-else class="empty-state">
                暂无可编辑字典项
              </div>
            </section>
          </div>

          <div v-if="reworkDictionaryManageItems.length === 0" class="empty-state">
            暂无字典项
          </div>
          <div v-else class="compact-list" data-testid="rework-dictionary-item-list">
            <article
              v-for="item in reworkDictionaryManageItems"
              :key="item.item_id"
              :class="{ selected: item.item_id === selectedReworkDictionaryItemId }"
              @click="selectReworkDictionaryItem(item)"
            >
              <strong>{{ item.label }} / {{ item.code }}</strong>
              <p>{{ item.dictionary_type === 'REASON_CATEGORY' ? '返工原因' : '责任类型' }} / {{ statusLabel(item.status) }}</p>
              <span>排序 {{ item.sort_order }}</span>
            </article>
          </div>
        </section>

        <section v-else-if="isCustomerCollaborationRoute" class="panel route-panel customer-collaboration-panel">
          <div class="route-heading">
            <h2>客服协同台</h2>
            <el-tag round>{{ customerCollaborationPendingMessages.length }} 条待审核消息</el-tag>
          </div>

          <div class="doctor-order-toolbar">
            <el-input
              v-model="customerCollaborationOrderId"
              data-testid="customer-collaboration-order-id"
              placeholder="输入订单 ID 查看订单消息上下文"
            />
            <div class="inline-actions compact-actions">
              <el-button :loading="customerCollaborationLoading" @click="loadCustomerCollaborationOrderMessages">
                查询订单消息
              </el-button>
              <el-button type="primary" :loading="customerCollaborationLoading" @click="loadCustomerCollaborationPage">
                刷新协同台
              </el-button>
            </div>
          </div>

          <el-alert
            v-if="customerCollaborationError"
            :title="customerCollaborationError"
            type="error"
            show-icon
            :closable="false"
          />
          <el-alert
            v-if="customerCollaborationResult"
            :title="customerCollaborationResult"
            type="success"
            show-icon
            :closable="false"
          />

          <div class="customer-collaboration-grid">
            <section class="customer-collaboration-card">
              <div class="subheading-row">
                <h3>待审核消息</h3>
                <el-tag type="warning" round>{{ customerCollaborationPendingMessages.length }}</el-tag>
              </div>
              <div v-if="customerCollaborationPendingMessages.length === 0" class="empty-state">
                暂无待审核消息
              </div>
              <div v-else class="compact-list">
                <article
                  v-for="message in customerCollaborationPendingMessages"
                  :key="message.msg_id"
                  class="customer-collaboration-message-review"
                  :class="{ selected: selectedCustomerCollaborationMessage?.msg_id === message.msg_id }"
                  @click="selectCustomerCollaborationMessage(message)"
                >
                  <strong>#{{ message.msg_id }} / {{ message.order_no || `订单 ${message.order_id}` }}</strong>
                  <p>{{ message.content }}</p>
                  <span>{{ message.product_type }} / {{ roleLabel(message.sender_role) }} / {{ statusLabel(message.review_status) }} / {{ statusLabel(message.external_status) }} / {{ message.visible_to }}</span>
                  <div class="inline-actions">
                    <el-button
                      size="small"
                      type="primary"
                      :loading="customerCollaborationActionLoading"
                      @click.stop="customerCollaborationReviewAction = 'APPROVE'; reviewCustomerCollaborationMessage(message)"
                    >
                      通过
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      plain
                      :loading="customerCollaborationActionLoading"
                      @click.stop="customerCollaborationReviewAction = 'REJECT'; reviewCustomerCollaborationMessage(message)"
                    >
                      驳回
                    </el-button>
                  </div>
                </article>
              </div>
            </section>

            <section class="customer-collaboration-card">
              <div class="subheading-row">
                <h3>订单消息上下文</h3>
                <el-tag type="info" round>{{ customerCollaborationOrderMessages.length }}</el-tag>
              </div>
              <div v-if="customerCollaborationOrderMessages.length === 0" class="empty-state">
                输入订单 ID 后查看医生、客服、生产消息上下文
              </div>
              <div v-else class="compact-list">
                <article
                  v-for="message in customerCollaborationOrderMessages"
                  :key="message.msg_id"
                >
                  <strong>{{ roleLabel(message.sender_role) }} / {{ statusLabel(message.review_status) }}</strong>
                  <p>{{ message.content }}</p>
                  <span>#{{ message.msg_id }} / {{ message.order_no || `订单 ${message.order_id}` }} / {{ statusLabel(message.external_status) }} / {{ message.visible_to }}</span>
                </article>
              </div>
            </section>
          </div>

          <section class="customer-collaboration-card customer-collaboration-review-box">
            <div class="subheading-row">
              <h3>消息审核</h3>
              <el-tag v-if="selectedCustomerCollaborationMessage" round>
                #{{ selectedCustomerCollaborationMessage.msg_id }}
              </el-tag>
            </div>
            <div v-if="selectedCustomerCollaborationMessage" class="check-form">
              <label>
                审核动作
                <el-radio-group v-model="customerCollaborationReviewAction">
                  <el-radio-button label="APPROVE">通过</el-radio-button>
                  <el-radio-button label="REJECT">驳回</el-radio-button>
                </el-radio-group>
              </label>
              <label>
                审核说明
                <el-input
                  v-model="customerCollaborationReviewNote"
                  type="textarea"
                  :rows="3"
                  placeholder="驳回时填写给内部留痕的原因"
                />
              </label>
              <div class="inline-actions">
                <el-button
                  type="primary"
                  :loading="customerCollaborationActionLoading"
                  data-testid="customer-collaboration-message-review"
                  @click="reviewCustomerCollaborationMessage(selectedCustomerCollaborationMessage)"
                >
                  提交审核
                </el-button>
              </div>
            </div>
            <div v-else class="empty-state">
              暂无选中的待审核消息
            </div>
          </section>
        </section>

        <section v-else-if="isCsAiQueryRoute" class="panel route-panel customer-collaboration-panel" data-testid="cs-ai-query-panel">
          <div class="route-heading">
            <h2>客服查询助手</h2>
            <div class="heading-tags">
              <el-tag round>AI-2</el-tag>
              <el-tag type="info" round>只读草稿</el-tag>
            </div>
          </div>

          <div class="customer-collaboration-grid">
            <section class="customer-collaboration-card">
              <div class="subheading-row">
                <h3>订单查询</h3>
                <el-tag type="warning" round>内部可见</el-tag>
              </div>
              <div class="check-form">
                <label>
                  订单 ID
                  <el-input
                    v-model="csAiQueryOrderId"
                    data-testid="cs-ai-query-order-id"
                    placeholder="输入客服有权访问的订单 ID"
                  />
                </label>
                <label>
                  查询问题
                  <el-input
                    v-model="csAiQueryQuestion"
                    data-testid="cs-ai-query-question"
                    type="textarea"
                    :rows="4"
                    placeholder="例如：请汇总内部状态、外部状态、账单物流和下一步客服建议"
                  />
                </label>
                <div class="inline-actions">
                  <el-button
                    type="primary"
                    :loading="csAiQueryLoading"
                    :disabled="!csAiQueryOrderId.trim() || !csAiQueryQuestion.trim()"
                    data-testid="cs-ai-query-submit"
                    @click="runCsAiQuery"
                  >
                    生成查询草稿
                  </el-button>
                </div>
              </div>
              <p class="public-message">
                AI-2 只读取客服权限范围内的内部订单摘要；结果不自动发送给医生、不自动写入订单。
              </p>
            </section>

            <section class="customer-collaboration-card">
              <div class="subheading-row">
                <h3>查询结果</h3>
                <el-tag type="info" round>人工复核</el-tag>
              </div>
              <el-alert
                v-if="csAiQueryError"
                :title="csAiQueryError"
                type="error"
                show-icon
                :closable="false"
              />
              <div v-if="csAiQueryAnswer" class="ai-answer-card" data-testid="cs-ai-query-answer">
                <p>{{ csAiQueryAnswer }}</p>
                <div v-if="csAiQueryReferenceNotes.length" data-testid="cs-ai-query-reference-notes">
                  <h4>引用数据说明</h4>
                  <ul>
                    <li v-for="note in csAiQueryReferenceNotes" :key="note">{{ note }}</li>
                  </ul>
                </div>
                <div
                  v-if="csAiQueryAttachmentContexts.length"
                  class="attachment-context-list"
                  data-testid="cs-ai-query-attachment-contexts"
                >
                  <h4>附件预览上下文</h4>
                  <div
                    v-for="attachment in csAiQueryAttachmentContexts"
                    :key="attachment.file_id"
                    class="attachment-context-item"
                  >
                    <div>
                      <strong>{{ attachment.original_filename }}</strong>
                      <p>
                        #{{ attachment.file_id }} / {{ attachment.source_type }} /
                        {{ attachment.content_type || '未知类型' }} /
                        {{ attachment.file_size ?? 0 }} bytes
                      </p>
                      <p>{{ attachment.review_note }}</p>
                    </div>
                    <a :href="attachment.preview_url" target="_blank" rel="noreferrer">
                      预览
                    </a>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                输入订单 ID 和问题后生成客服内部查询草稿
              </div>
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

        <section v-else-if="activeRoute === '/dashboard'" class="route-panel prototype-dashboard-panel">
          <div v-if="activePrototypeDashboard.syncBanner" class="prototype-sync-banner">
            <span class="sync-dot" aria-hidden="true" />
            <span>{{ activePrototypeDashboard.syncBanner }}</span>
          </div>

          <div class="prototype-page-heading">
            <div>
              <h2>{{ activePrototypeDashboard.greeting }}</h2>
              <p>{{ activePrototypeDashboard.subtitle }}</p>
            </div>
            <button
              v-if="activePrototypeDashboard.primaryAction"
              class="prototype-primary-button"
              type="button"
              @click="selectDashboardAction(activePrototypeDashboard.primaryAction)"
            >
              {{ activePrototypeDashboard.primaryAction.actionLabel }}
            </button>
          </div>

          <el-alert
            v-if="['cs', 'production'].includes(portalTone)"
            :title="phaseOneAbDashboardSourceNote"
            :type="phaseOneAbDashboardDataError ? 'warning' : 'success'"
            show-icon
            :closable="false"
          />

          <div class="prototype-metric-grid" :class="`metric-count-${activePrototypeDashboard.metrics.length}`">
            <article
              v-for="metric in activePrototypeDashboard.metrics"
              :key="metric.title"
              class="prototype-stat-card"
              :class="`tone-${metric.tone}`"
            >
              <span class="prototype-card-accent" />
              <span class="prototype-stat-label">{{ metric.title }}</span>
              <strong>{{ metric.value }}</strong>
              <small>{{ metric.note }}</small>
            </article>
          </div>

          <div class="prototype-dashboard-layout">
            <section
              v-for="panel in activePrototypeDashboard.panels"
              :key="panel.title"
              class="prototype-panel-card"
            >
              <div class="prototype-panel-head">
                <h3>{{ panel.title }}</h3>
                <span v-if="panel.badge" class="prototype-badge" :class="`tone-${panel.tone ?? 'slate'}`">
                  {{ panel.badge }}
                </span>
              </div>
              <button
                v-for="item in panel.items"
                :key="`${panel.title}-${item.title}`"
                type="button"
                class="prototype-attention-item"
                @click="selectDashboardAction(item)"
              >
                <span class="attention-dot" :class="`tone-${item.tone}`" />
                <span>
                  <strong>{{ item.title }}</strong>
                  <small>{{ item.detail }}</small>
                </span>
                <em>{{ item.meta }}</em>
                <b>{{ item.actionLabel }}</b>
              </button>
            </section>
          </div>

          <section class="prototype-panel-card prototype-chart-card">
            <div class="prototype-panel-head">
              <h3>{{ portalTitle }}趋势图</h3>
              <span class="prototype-badge tone-slate">近 6 周</span>
            </div>
            <div class="prototype-chart-body">
              <svg class="prototype-line-chart" viewBox="0 0 760 210" role="img" aria-label="近六周趋势图">
                <line x1="42" y1="34" x2="42" y2="170" />
                <line x1="42" y1="170" x2="720" y2="170" />
                <line x1="42" y1="124" x2="720" y2="124" class="chart-grid" />
                <line x1="42" y1="80" x2="720" y2="80" class="chart-grid" />
                <path class="chart-area-primary" d="M42 142 L176 126 L310 132 L444 96 L578 108 L720 70 L720 170 L42 170 Z" />
                <path class="chart-line-primary" d="M42 142 L176 126 L310 132 L444 96 L578 108 L720 70" />
                <path class="chart-line-secondary" d="M42 154 L176 146 L310 118 L444 132 L578 92 L720 104" />
                <g class="chart-points">
                  <circle cx="42" cy="142" r="4" />
                  <circle cx="176" cy="126" r="4" />
                  <circle cx="310" cy="132" r="4" />
                  <circle cx="444" cy="96" r="4" />
                  <circle cx="578" cy="108" r="4" />
                  <circle cx="720" cy="70" r="4" />
                </g>
                <g class="chart-labels">
                  <text x="42" y="195">第1周</text>
                  <text x="176" y="195">第2周</text>
                  <text x="310" y="195">第3周</text>
                  <text x="444" y="195">第4周</text>
                  <text x="578" y="195">第5周</text>
                  <text x="720" y="195">本周</text>
                </g>
              </svg>
              <div class="prototype-trend-grid">
                <article
                  v-for="trend in activePrototypeDashboard.trends"
                  :key="trend.label"
                  class="prototype-trend-row"
                >
                  <div>
                    <span>{{ trend.label }}</span>
                    <strong>{{ trend.value }}</strong>
                  </div>
                  <div class="prototype-progress">
                    <i :class="`tone-${trend.tone}`" :style="{ width: `${trend.percent}%` }" />
                  </div>
                </article>
              </div>
            </div>
          </section>
        </section>

        <section v-else-if="isProductionQualitySummaryRoute" class="panel route-panel performance-panel">
          <div class="route-heading">
            <h2>质量与返工</h2>
            <el-tag round>{{ qualityRecordTotal }} 条外返记录</el-tag>
          </div>

          <div class="prototype-queue-card">
            <div class="prototype-table-head">
              <div>
                <h3>真实质量汇总</h3>
                <small>
                  {{ productionQualitySummary?.generated_at ? `更新 ${compactDateTime(productionQualitySummary.generated_at)}` : '来自后端出检与返工记录' }}
                </small>
              </div>
              <el-button
                size="small"
                :loading="productionQualitySummaryLoading || qualityRecordLoading"
                @click="loadProductionQualityPage"
              >
                刷新质量数据
              </el-button>
            </div>
            <el-alert
              v-if="productionQualitySummaryError"
              :title="productionQualitySummaryError"
              type="warning"
              show-icon
              :closable="false"
            />
            <div v-if="productionQualitySummaryCards.length" class="placeholder-content-grid">
              <article
                v-for="card in productionQualitySummaryCards"
                :key="card.title"
                class="placeholder-content-card"
                :class="`tone-${card.tone}`"
              >
                <span class="placeholder-content-dot" />
                <strong>{{ card.title }}</strong>
                <b>{{ card.value }}</b>
                <small>{{ card.detail }}</small>
              </article>
            </div>
            <div v-else-if="!productionQualitySummaryLoading && !productionQualitySummaryError" class="empty-state">
              暂无质量汇总数据
            </div>
          </div>

          <div class="prototype-queue-card">
            <div class="prototype-table-head">
              <div>
                <h3>外返质量记录</h3>
                <small>基于检查记录与返工记录生成</small>
              </div>
              <div class="inline-actions">
                <el-input
                  v-model="qualityRecordOrderId"
                  placeholder="订单 ID"
                  clearable
                  data-testid="quality-record-order-id"
                  @keyup.enter="loadQualityRecords"
                />
                <el-select v-model="qualityRecordResponsibilityType" data-testid="quality-record-responsibility">
                  <el-option
                    v-for="option in reworkResponsibilityTypes"
                    :key="option.code"
                    :label="option.label"
                    :value="option.code"
                  />
                </el-select>
                <el-button :loading="qualityRecordLoading" @click="loadQualityRecords">筛选</el-button>
              </div>
            </div>
            <el-alert
              v-if="qualityRecordError"
              :title="qualityRecordError"
              type="warning"
              show-icon
              :closable="false"
            />
            <el-alert
              v-if="qualityRecordResult"
              :title="qualityRecordResult"
              type="success"
              show-icon
              :closable="false"
            />
            <div class="compact-form-grid">
              <el-input v-model="qualityRecordOrderId" placeholder="订单 ID" />
              <el-select v-model="qualityRecordReasonCategory" data-testid="quality-record-reason">
                <el-option
                  v-for="option in reworkReasonCategories"
                  :key="option.code"
                  :label="option.label"
                  :value="option.code"
                />
              </el-select>
              <el-select v-model="qualityRecordResponsibilityType">
                <el-option
                  v-for="option in reworkResponsibilityTypes"
                  :key="option.code"
                  :label="option.label"
                  :value="option.code"
                />
              </el-select>
              <el-input
                v-model="qualityRecordReasonDetail"
                placeholder="外返原因详情"
                data-testid="quality-record-reason-detail"
              />
              <el-button
                type="primary"
                :loading="qualityRecordSaving"
                data-testid="quality-record-create-button"
                @click="createExternalReturnQualityRecord"
              >
                登记外返
              </el-button>
            </div>
            <div class="compact-form-grid">
              <el-input
                v-model="qualityRecordStatusId"
                placeholder="质量记录 ID"
                data-testid="quality-record-status-id"
              />
              <el-select v-model="qualityRecordStatus" data-testid="quality-record-status">
                <el-option label="待处理" value="PENDING" />
                <el-option label="处理中" value="IN_PROGRESS" />
                <el-option label="已解决" value="RESOLVED" />
                <el-option label="已关闭" value="CLOSED" />
              </el-select>
              <el-input
                v-model="qualityRecordStatusNote"
                placeholder="状态处理说明"
                data-testid="quality-record-status-note"
              />
              <el-button
                :loading="qualityRecordStatusSaving"
                data-testid="quality-record-status-button"
                @click="updateQualityRecordStatus"
              >
                更新状态
              </el-button>
            </div>
            <el-table
              :data="qualityRecords"
              size="small"
              border
              v-loading="qualityRecordLoading"
              data-testid="quality-record-table"
            >
              <el-table-column prop="quality_record_id" label="记录" width="90" />
              <el-table-column prop="order_no" label="订单号" min-width="140" />
              <el-table-column prop="clinic_name" label="诊所" min-width="150" />
              <el-table-column prop="responsibility_type" label="责任" width="90" />
              <el-table-column prop="reason_category" label="原因" width="120" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag round>{{ statusLabel(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status_note" label="状态说明" min-width="160" show-overflow-tooltip />
              <el-table-column label="时间" width="120">
                <template #default="{ row }">{{ compactDateTime(row.created_at) }}</template>
              </el-table-column>
              <el-table-column prop="reason_detail" label="详情" min-width="180" show-overflow-tooltip />
            </el-table>
          </div>
        </section>

        <section
          v-else-if="isAdminAiGovernanceRoute"
          class="panel route-panel performance-panel"
          data-testid="ai-governance-local-hardening"
        >
          <div class="route-heading">
            <h2>AI 生产治理本地补强</h2>
            <div class="heading-tags">
              <el-tag type="warning" round>PARTIAL</el-tag>
              <el-tag type="info" round>{{ aiGovernanceLocalHardening?.stage_goal ?? 'GOAL-019' }}</el-tag>
            </div>
          </div>

          <el-alert
            title="真实 key / webhook 仍待验收；本页只展示本地治理边界、提示词版本、输出安全和 AI-3 安全矩阵。"
            type="warning"
            show-icon
            :closable="false"
          />
          <el-alert
            v-if="aiGovernanceLocalHardeningError"
            :title="aiGovernanceLocalHardeningError"
            type="error"
            show-icon
            :closable="false"
          />

          <div v-if="aiGovernanceLocalHardening" v-loading="aiGovernanceLocalHardeningLoading">
            <div class="performance-grid">
              <article class="performance-card">
                <span>输出安全边界</span>
                <strong>{{ aiGovernanceLocalHardening.output_safety_boundary.guarded_status }}</strong>
                <small>{{ aiGovernanceLocalHardening.output_safety_boundary.streaming_status }}</small>
              </article>
              <article class="performance-card">
                <span>预算 / 熔断</span>
                <strong>{{ aiGovernanceLocalHardening.budget_circuit_breaker_policy.daily_budget_microusd }}</strong>
                <small>通知 {{ aiGovernanceLocalHardening.budget_circuit_breaker_policy.budget_notification_enabled ? '开启' : '关闭' }} / 熔断 {{ aiGovernanceLocalHardening.budget_circuit_breaker_policy.budget_circuit_breaker_enabled ? '开启' : '关闭' }}</small>
              </article>
              <article class="performance-card">
                <span>AI-5 模板状态</span>
                <strong>{{ aiGovernanceLocalHardening.ai5_template_boundary.template_version }}</strong>
                <small>{{ aiGovernanceLocalHardening.ai5_template_boundary.customer_template_status }}</small>
              </article>
              <article class="performance-card">
                <span>真实外部联调</span>
                <strong>{{ aiGovernanceLocalHardening.real_external_integration_status.integration_status }}</strong>
                <small>Task 8 {{ aiGovernanceLocalHardening.real_external_integration_status.task8_status }}</small>
              </article>
            </div>

            <div class="prototype-queue-card">
              <div class="prototype-table-head">
                <div>
                  <h3>提示词版本</h3>
                  <small>本地代码版本管理，不暴露 prompt 原文，不提供在线编辑。</small>
                </div>
                <el-tag type="success" round>只读</el-tag>
              </div>
              <el-table :data="aiGovernanceLocalHardening.prompt_templates" size="small" border>
                <el-table-column prop="agent_code" label="智能体" min-width="150" />
                <el-table-column prop="prompt_version" label="版本" min-width="180" />
                <el-table-column prop="context_type" label="上下文" min-width="220" />
                <el-table-column prop="owner_role" label="角色" width="120" />
                <el-table-column label="人工确认" width="110">
                  <template #default="{ row }">
                    <el-tag :type="row.human_confirmation_required ? 'warning' : 'info'" size="small" round>
                      {{ row.human_confirmation_required ? '需要' : '按规则' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <div class="prototype-queue-card">
              <div class="prototype-table-head">
                <div>
                  <h3>AI-3 安全矩阵</h3>
                  <small>医生端只读安全模型回归，不暴露内部工序、员工、返工、工时或绩效。</small>
                </div>
                <el-tag type="warning" round>SAFE_REFUSAL</el-tag>
              </div>
              <div class="compact-list">
                <article
                  v-for="item in aiGovernanceLocalHardening.ai3_safety_cases"
                  :key="item.case_id"
                >
                  <strong>{{ item.question_family }}</strong>
                  <p>{{ item.safe_read_model }} / {{ item.expected_status }}</p>
                  <span>禁止字段：{{ item.forbidden_fields.join('、') }}</span>
                </article>
              </div>
            </div>

            <div class="prototype-queue-card">
              <div class="prototype-table-head">
                <div>
                  <h3>AI-5 模板状态</h3>
                  <small>PHASE_ONE_DEFAULT_V1 仍是默认模板，不是客户正式模板。</small>
                </div>
                <el-tag type="danger" round>客户模板未确认</el-tag>
              </div>
              <div class="doctor-order-summary">
                <div>
                  <span>模板版本</span>
                  <strong>{{ aiGovernanceLocalHardening.ai5_template_boundary.template_version }}</strong>
                </div>
                <div>
                  <span>客户确认</span>
                  <strong>{{ aiGovernanceLocalHardening.ai5_template_boundary.customer_template_status }}</strong>
                </div>
                <div>
                  <span>自动写入</span>
                  <strong>{{ aiGovernanceLocalHardening.ai5_template_boundary.auto_write_allowed ? '允许' : '禁止' }}</strong>
                </div>
                <div>
                  <span>人工确认</span>
                  <strong>{{ aiGovernanceLocalHardening.ai5_template_boundary.human_confirmation_required ? '必须' : '否' }}</strong>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            AI 治理本地补强数据加载中
          </div>
        </section>

        <section
          v-else-if="(isPlaceholderRoute || isProductizedProductionSupportRoute || isAdminPermissionInventoryRoute) && activeDisplayItem"
          class="panel route-panel placeholder-panel"
          :class="{ 'frontend-productized-support-panel': isProductizedProductionSupportRoute }"
        >
          <div class="route-heading">
            <h2>{{ activeDisplayItem.title }}</h2>
            <div class="heading-tags">
              <el-tag v-if="isProductizedProductionSupportRoute" type="success" round>本地第一增量</el-tag>
              <el-tag v-else-if="isAdminPermissionInventoryRoute" type="warning" round>权限清单入口</el-tag>
              <el-tag v-else round>演示入口</el-tag>
            </div>
          </div>
          <div class="placeholder-hero">
            <span class="admin-menu-icon" aria-hidden="true" v-html="businessIconSvg(activeDisplayItem.icon)" />
            <div>
              <strong>{{ activeDisplayItem.title }}</strong>
              <p>{{ activeDisplayItem.description }}</p>
            </div>
          </div>
          <el-alert
            :title="isProductizedProductionSupportRoute
              ? '该功能已接入当前后端汇总数据和本地第一增量表单；完整编辑、审批、真实趋势和客户验收仍保持 PARTIAL。'
              : '该功能已纳入前端演示导航，后续确认正式范围后再接入接口、权限和数据表。'"
            type="info"
            show-icon
            :closable="false"
          />
          <div v-if="isAdminPermissionInventoryRoute" class="prototype-queue-card admin-permission-inventory-panel">
            <div class="prototype-table-head">
              <div>
                <h3>账号 / 角色 / 权限清单</h3>
                <small>本地第一增量展示当前登录身份、菜单和权限库存；完整 RuoYi 管理 UI 仍未完成。</small>
              </div>
              <el-tag type="warning" round>PARTIAL</el-tag>
            </div>
            <div class="doctor-order-summary">
              <div>
                <span>当前账号</span>
                <strong>{{ currentUser?.username ?? '-' }}</strong>
              </div>
              <div>
                <span>角色</span>
                <strong>{{ roleLabels(currentUser?.roles) }}</strong>
              </div>
              <div>
                <span>数据范围</span>
                <strong>{{ dataScopeLabel(currentUser?.dataScope) }}</strong>
              </div>
              <div>
                <span>菜单入口</span>
                <strong>{{ navigationMenus.length }}</strong>
              </div>
            </div>
            <div class="permission-chip-grid">
              <el-tag
                v-for="permission in visiblePermissions"
                :key="permission"
                effect="plain"
                round
              >
                {{ permission }}
              </el-tag>
              <div v-if="visiblePermissions.length === 0" class="empty-state">
                当前账号未返回权限码清单
              </div>
            </div>
          </div>
          <div v-if="isProductionQualitySummaryRoute" class="prototype-queue-card">
            <div class="prototype-table-head">
              <div>
                <h3>真实质量汇总</h3>
                <small>
                  {{ productionQualitySummary?.generated_at ? `更新 ${compactDateTime(productionQualitySummary.generated_at)}` : '来自后端出检与返工记录' }}
                </small>
              </div>
              <el-button
                size="small"
                :loading="productionQualitySummaryLoading"
                @click="loadProductionQualitySummary"
              >
                刷新质量数据
              </el-button>
            </div>
            <el-alert
              v-if="productionQualitySummaryError"
              :title="productionQualitySummaryError"
              type="warning"
              show-icon
              :closable="false"
            />
            <div v-if="productionQualitySummaryCards.length" class="placeholder-content-grid">
              <article
                v-for="card in productionQualitySummaryCards"
                :key="card.title"
                class="placeholder-content-card"
                :class="`tone-${card.tone}`"
              >
                <span class="placeholder-content-dot" />
                <strong>{{ card.title }}</strong>
                <b>{{ card.value }}</b>
                <small>{{ card.detail }}</small>
              </article>
            </div>
            <div v-else-if="!productionQualitySummaryLoading && !productionQualitySummaryError" class="empty-state">
              暂无质量汇总数据
            </div>
          </div>
          <div v-if="isProductionEquipmentSummaryRoute" class="prototype-queue-card">
            <div class="prototype-table-head">
              <div>
                <h3>真实设备汇总</h3>
                <small>
                  {{ productionEquipmentSummary?.generated_at ? `更新 ${compactDateTime(productionEquipmentSummary.generated_at)}` : '来自后端设备台账和设备事件' }}
                </small>
              </div>
              <el-button
                size="small"
                :loading="productionEquipmentSummaryLoading"
                @click="loadProductionEquipmentSummary"
              >
                刷新设备数据
              </el-button>
            </div>
            <el-alert
              v-if="productionEquipmentSummaryError"
              :title="productionEquipmentSummaryError"
              type="warning"
              show-icon
              :closable="false"
            />
            <div v-if="productionEquipmentSummaryCards.length" class="placeholder-content-grid">
              <article
                v-for="card in productionEquipmentSummaryCards"
                :key="card.title"
                class="placeholder-content-card"
                :class="`tone-${card.tone}`"
              >
                <span class="placeholder-content-dot" />
                <strong>{{ card.title }}</strong>
                <b>{{ card.value }}</b>
                <small>{{ card.detail }}</small>
              </article>
            </div>
            <div v-else-if="!productionEquipmentSummaryLoading && !productionEquipmentSummaryError" class="empty-state">
              暂无设备汇总数据
            </div>
            <div class="placeholder-content-grid">
              <article class="placeholder-content-card tone-blue">
                <span class="placeholder-content-dot" />
                <strong>登记设备</strong>
                <el-input v-model="productionEquipmentCreateCode" size="small" placeholder="设备编号" />
                <el-input v-model="productionEquipmentCreateName" size="small" placeholder="设备名称" />
                <el-select v-model="productionEquipmentCreateType" size="small" placeholder="设备类型">
                  <el-option label="切削设备" value="MILLING_MACHINE" />
                  <el-option label="扫描设备" value="SCANNER" />
                  <el-option label="烧结设备" value="SINTERING_FURNACE" />
                  <el-option label="打印设备" value="PRINTER_3D" />
                </el-select>
                <el-select v-model="productionEquipmentCreateStatus" size="small" placeholder="状态">
                  <el-option label="待机" value="IDLE" />
                  <el-option label="运行中" value="RUNNING" />
                  <el-option label="保养中" value="MAINTENANCE" />
                  <el-option label="故障" value="FAULT" />
                </el-select>
                <el-input v-model="productionEquipmentCreateDepartment" size="small" placeholder="所属部门" />
                <el-input-number
                  v-model="productionEquipmentCreateUtilizationRate"
                  size="small"
                  :min="0"
                  :max="100"
                  :precision="1"
                  controls-position="right"
                />
                <el-button
                  type="primary"
                  size="small"
                  :loading="productionEquipmentSaving"
                  @click="createProductionEquipment"
                >
                  登记设备
                </el-button>
              </article>
              <article class="placeholder-content-card tone-orange">
                <span class="placeholder-content-dot" />
                <strong>登记事件</strong>
                <el-input v-model="productionEquipmentEventCode" size="small" placeholder="设备编号" />
                <el-select v-model="productionEquipmentEventType" size="small" placeholder="事件类型">
                  <el-option label="保养计划" value="MAINTENANCE_PLAN" />
                  <el-option label="故障报修" value="FAULT_REPAIR" />
                  <el-option label="停机记录" value="DOWNTIME" />
                </el-select>
                <el-select v-model="productionEquipmentEventStatus" size="small" placeholder="处理状态">
                  <el-option label="待处理" value="PENDING" />
                  <el-option label="处理中" value="IN_PROGRESS" />
                  <el-option label="已完成" value="DONE" />
                </el-select>
                <el-input-number
                  v-model="productionEquipmentEventDowntimeMinutes"
                  size="small"
                  :min="0"
                  controls-position="right"
                />
                <el-input
                  v-model="productionEquipmentEventDescription"
                  size="small"
                  placeholder="事件说明"
                />
                <el-button
                  type="primary"
                  size="small"
                  :loading="productionEquipmentSaving"
                  @click="createProductionEquipmentEvent"
                >
                  登记事件
                </el-button>
              </article>
            </div>
            <el-alert
              v-if="productionEquipmentResult"
              :title="productionEquipmentResult"
              type="success"
              show-icon
              :closable="false"
            />
          </div>
          <div v-if="isProductionMaterialExceptionSummaryRoute" class="prototype-queue-card">
            <div class="prototype-table-head">
              <div>
                <h3>真实物料异常汇总</h3>
                <small>
                  {{ productionMaterialExceptionSummary?.generated_at ? `更新 ${compactDateTime(productionMaterialExceptionSummary.generated_at)}` : '来自后端物料异常事实表' }}
                </small>
              </div>
              <el-button
                size="small"
                :loading="productionMaterialExceptionSummaryLoading"
                @click="loadProductionMaterialExceptionSummary"
              >
                刷新物料数据
              </el-button>
            </div>
            <el-alert
              v-if="productionMaterialExceptionSummaryError"
              :title="productionMaterialExceptionSummaryError"
              type="warning"
              show-icon
              :closable="false"
            />
            <div v-if="productionMaterialExceptionSummaryCards.length" class="placeholder-content-grid">
              <article
                v-for="card in productionMaterialExceptionSummaryCards"
                :key="card.title"
                class="placeholder-content-card"
                :class="`tone-${card.tone}`"
              >
                <span class="placeholder-content-dot" />
                <strong>{{ card.title }}</strong>
                <b>{{ card.value }}</b>
                <small>{{ card.detail }}</small>
              </article>
            </div>
            <div
              v-else-if="!productionMaterialExceptionSummaryLoading && !productionMaterialExceptionSummaryError"
              class="empty-state"
            >
              暂无物料异常汇总数据
            </div>
            <div class="placeholder-content-grid">
              <article class="placeholder-content-card tone-orange">
                <span class="placeholder-content-dot" />
                <strong>登记物料异常</strong>
                <el-input v-model="productionMaterialExceptionCreateNo" size="small" placeholder="异常编号" />
                <el-input v-model="productionMaterialExceptionCreateCode" size="small" placeholder="物料编码" />
                <el-input v-model="productionMaterialExceptionCreateName" size="small" placeholder="物料名称" />
                <el-select v-model="productionMaterialExceptionCreateType" size="small" placeholder="异常类型">
                  <el-option label="缺料" value="SHORTAGE" />
                  <el-option label="错料" value="WRONG_MATERIAL" />
                  <el-option label="批次异常" value="BATCH_ABNORMAL" />
                  <el-option label="材料损耗" value="MATERIAL_LOSS" />
                </el-select>
                <el-select v-model="productionMaterialExceptionCreateStatus" size="small" placeholder="处理状态">
                  <el-option label="待处理" value="PENDING" />
                  <el-option label="处理中" value="IN_PROGRESS" />
                  <el-option label="已关闭" value="CLOSED" />
                </el-select>
                <el-input
                  v-model="productionMaterialExceptionCreateResponsibility"
                  size="small"
                  placeholder="责任归属"
                />
                <el-input-number
                  v-model="productionMaterialExceptionCreateLossQuantity"
                  size="small"
                  :min="0"
                  :precision="2"
                  controls-position="right"
                />
                <el-input
                  v-model="productionMaterialExceptionCreateDescription"
                  size="small"
                  placeholder="异常说明"
                />
                <el-button
                  type="primary"
                  size="small"
                  :loading="productionMaterialExceptionSaving"
                  @click="createProductionMaterialException"
                >
                  登记物料异常
                </el-button>
              </article>
              <article class="placeholder-content-card tone-blue">
                <span class="placeholder-content-dot" />
                <strong>更新处理状态</strong>
                <el-input v-model="productionMaterialExceptionStatusNo" size="small" placeholder="异常编号" />
                <el-select v-model="productionMaterialExceptionStatus" size="small" placeholder="处理状态">
                  <el-option label="待处理" value="PENDING" />
                  <el-option label="处理中" value="IN_PROGRESS" />
                  <el-option label="已关闭" value="CLOSED" />
                </el-select>
                <el-input
                  v-model="productionMaterialExceptionStatusResponsibility"
                  size="small"
                  placeholder="责任归属"
                />
                <el-input
                  v-model="productionMaterialExceptionStatusDescription"
                  size="small"
                  placeholder="处理说明"
                />
                <el-button
                  type="primary"
                  size="small"
                  :loading="productionMaterialExceptionSaving"
                  @click="updateProductionMaterialExceptionStatus"
                >
                  更新处理状态
                </el-button>
              </article>
            </div>
            <el-alert
              v-if="productionMaterialExceptionResult"
              :title="productionMaterialExceptionResult"
              type="success"
              show-icon
              :closable="false"
            />
          </div>
          <div v-if="isProductionSafetyEnvironmentSummaryRoute" class="prototype-queue-card">
            <div class="prototype-table-head">
              <div>
                <h3>真实安环汇总</h3>
                <small>
                  {{ productionSafetyEnvironmentSummary?.generated_at ? `更新 ${compactDateTime(productionSafetyEnvironmentSummary.generated_at)}` : '来自后端安环事件事实表' }}
                </small>
              </div>
              <el-button
                size="small"
                :loading="productionSafetyEnvironmentSummaryLoading"
                @click="loadProductionSafetyEnvironmentSummary"
              >
                刷新安环数据
              </el-button>
            </div>
            <el-alert
              v-if="productionSafetyEnvironmentSummaryError"
              :title="productionSafetyEnvironmentSummaryError"
              type="warning"
              show-icon
              :closable="false"
            />
            <div v-if="productionSafetyEnvironmentSummaryCards.length" class="placeholder-content-grid">
              <article
                v-for="card in productionSafetyEnvironmentSummaryCards"
                :key="card.title"
                class="placeholder-content-card"
                :class="`tone-${card.tone}`"
              >
                <span class="placeholder-content-dot" />
                <strong>{{ card.title }}</strong>
                <b>{{ card.value }}</b>
                <small>{{ card.detail }}</small>
              </article>
            </div>
            <div
              v-else-if="!productionSafetyEnvironmentSummaryLoading && !productionSafetyEnvironmentSummaryError"
              class="empty-state"
            >
              暂无安环汇总数据
            </div>
            <div class="placeholder-content-grid">
              <article class="placeholder-content-card tone-sky">
                <span class="placeholder-content-dot" />
                <strong>登记安环事件</strong>
                <el-input v-model="productionSafetyEnvironmentCreateNo" size="small" placeholder="事件编号" />
                <el-select v-model="productionSafetyEnvironmentCreateType" size="small" placeholder="事件类型">
                  <el-option label="安全巡检" value="SAFETY_INSPECTION" />
                  <el-option label="隐患整改" value="HAZARD_RECTIFICATION" />
                  <el-option label="环境记录" value="ENVIRONMENT_RECORD" />
                  <el-option label="PPE/设备提醒" value="PPE_DEVICE_REMINDER" />
                </el-select>
                <el-select v-model="productionSafetyEnvironmentCreateStatus" size="small" placeholder="整改状态">
                  <el-option label="待处理" value="PENDING" />
                  <el-option label="处理中" value="IN_PROGRESS" />
                  <el-option label="已关闭" value="CLOSED" />
                </el-select>
                <el-input
                  v-model="productionSafetyEnvironmentCreateDepartment"
                  size="small"
                  placeholder="责任部门"
                />
                <el-input v-model="productionSafetyEnvironmentCreateOwner" size="small" placeholder="责任人" />
                <el-input
                  v-model="productionSafetyEnvironmentCreateEquipmentCode"
                  size="small"
                  placeholder="关联设备编码"
                />
                <el-select v-model="productionSafetyEnvironmentCreateRisk" size="small" placeholder="风险等级">
                  <el-option label="一般" value="NORMAL" />
                  <el-option label="高风险" value="HIGH" />
                  <el-option label="严重" value="CRITICAL" />
                </el-select>
                <el-date-picker
                  v-model="productionSafetyEnvironmentCreateDueAt"
                  size="small"
                  type="datetime"
                  value-format="YYYY-MM-DDTHH:mm:ss"
                  placeholder="整改截止时间"
                />
                <el-input
                  v-model="productionSafetyEnvironmentCreateDescription"
                  size="small"
                  placeholder="事件说明"
                />
                <el-button
                  type="primary"
                  size="small"
                  :loading="productionSafetyEnvironmentSaving"
                  @click="createProductionSafetyEnvironmentEvent"
                >
                  登记安环事件
                </el-button>
              </article>
              <article class="placeholder-content-card tone-blue">
                <span class="placeholder-content-dot" />
                <strong>更新整改状态</strong>
                <el-input v-model="productionSafetyEnvironmentStatusNo" size="small" placeholder="事件编号" />
                <el-select v-model="productionSafetyEnvironmentStatus" size="small" placeholder="整改状态">
                  <el-option label="待处理" value="PENDING" />
                  <el-option label="处理中" value="IN_PROGRESS" />
                  <el-option label="已关闭" value="CLOSED" />
                </el-select>
                <el-input v-model="productionSafetyEnvironmentStatusOwner" size="small" placeholder="责任人" />
                <el-input
                  v-model="productionSafetyEnvironmentStatusDescription"
                  size="small"
                  placeholder="整改说明"
                />
                <el-button
                  type="primary"
                  size="small"
                  :loading="productionSafetyEnvironmentSaving"
                  @click="updateProductionSafetyEnvironmentEventStatus"
                >
                  更新整改状态
                </el-button>
              </article>
            </div>
            <el-alert
              v-if="productionSafetyEnvironmentResult"
              :title="productionSafetyEnvironmentResult"
              type="success"
              show-icon
              :closable="false"
            />
          </div>
          <div v-if="isProductionCostSummaryRoute" class="prototype-queue-card">
            <div class="prototype-table-head">
              <div>
                <h3>真实成本汇总</h3>
                <small>
                  {{ productionCostSummary?.generated_at ? `更新 ${compactDateTime(productionCostSummary.generated_at)}` : '来自后端成本事实表' }}
                </small>
              </div>
              <el-button
                size="small"
                :loading="productionCostSummaryLoading"
                @click="loadProductionCostSummary"
              >
                刷新成本数据
              </el-button>
            </div>
            <el-alert
              v-if="productionCostSummaryError"
              :title="productionCostSummaryError"
              type="warning"
              show-icon
              :closable="false"
            />
            <div v-if="productionCostSummaryCards.length" class="placeholder-content-grid">
              <article
                v-for="card in productionCostSummaryCards"
                :key="card.title"
                class="placeholder-content-card"
                :class="`tone-${card.tone}`"
              >
                <span class="placeholder-content-dot" />
                <strong>{{ card.title }}</strong>
                <b>{{ card.value }}</b>
                <small>{{ card.detail }}</small>
              </article>
            </div>
            <div
              v-else-if="!productionCostSummaryLoading && !productionCostSummaryError"
              class="empty-state"
            >
              暂无成本汇总数据
            </div>
            <div class="placeholder-content-grid">
              <article class="placeholder-content-card tone-sky">
                <span class="placeholder-content-dot" />
                <strong>登记成本记录</strong>
                <el-input v-model="productionCostCreateNo" size="small" placeholder="成本编号" />
                <el-select v-model="productionCostCreateType" size="small" placeholder="成本类型">
                  <el-option label="工序成本" value="PROCESS" />
                  <el-option label="材料成本" value="MATERIAL" />
                  <el-option label="人工成本" value="LABOR" />
                  <el-option label="返工成本" value="REWORK" />
                  <el-option label="外协成本" value="OUTSOURCING" />
                </el-select>
                <el-input-number
                  v-model="productionCostCreateAmount"
                  size="small"
                  :min="0"
                  :precision="2"
                  controls-position="right"
                />
                <el-select v-model="productionCostCreateStatus" size="small" placeholder="成本状态">
                  <el-option label="正常" value="NORMAL" />
                  <el-option label="预警" value="WARNING" />
                  <el-option label="已确认" value="CONFIRMED" />
                </el-select>
                <el-input v-model="productionCostCreateDepartment" size="small" placeholder="责任部门" />
                <el-input v-model="productionCostCreateSupplier" size="small" placeholder="供应商/来源" />
                <el-input v-model="productionCostCreateDescription" size="small" placeholder="成本说明" />
                <el-button
                  type="primary"
                  size="small"
                  :loading="productionCostSaving"
                  @click="createProductionCostRecord"
                >
                  登记成本记录
                </el-button>
              </article>
            </div>
            <el-alert
              v-if="productionCostResult"
              :title="productionCostResult"
              type="success"
              show-icon
              :closable="false"
            />
          </div>
          <div v-if="isProductionRewardPenaltySummaryRoute" class="prototype-queue-card">
            <div class="prototype-table-head">
              <div>
                <h3>真实奖惩汇总</h3>
                <small>
                  {{ productionRewardPenaltySummary?.generated_at ? `更新 ${compactDateTime(productionRewardPenaltySummary.generated_at)}` : '来自后端奖惩事实表' }}
                </small>
              </div>
              <el-button
                size="small"
                :loading="productionRewardPenaltySummaryLoading"
                @click="loadProductionRewardPenaltySummary"
              >
                刷新奖惩数据
              </el-button>
            </div>
            <el-alert
              v-if="productionRewardPenaltySummaryError"
              :title="productionRewardPenaltySummaryError"
              type="warning"
              show-icon
              :closable="false"
            />
            <div v-if="productionRewardPenaltySummaryCards.length" class="placeholder-content-grid">
              <article
                v-for="card in productionRewardPenaltySummaryCards"
                :key="card.title"
                class="placeholder-content-card"
                :class="`tone-${card.tone}`"
              >
                <span class="placeholder-content-dot" />
                <strong>{{ card.title }}</strong>
                <b>{{ card.value }}</b>
                <small>{{ card.detail }}</small>
              </article>
            </div>
            <div
              v-else-if="!productionRewardPenaltySummaryLoading && !productionRewardPenaltySummaryError"
              class="empty-state"
            >
              暂无奖惩汇总数据
            </div>
            <div class="placeholder-content-grid">
              <article class="placeholder-content-card tone-sky">
                <span class="placeholder-content-dot" />
                <strong>登记奖惩记录</strong>
                <el-input v-model="productionRewardPenaltyCreateNo" size="small" placeholder="奖惩编号" />
                <el-select v-model="productionRewardPenaltyCreateType" size="small" placeholder="奖惩类型">
                  <el-option label="奖励" value="REWARD" />
                  <el-option label="扣罚" value="PENALTY" />
                </el-select>
                <el-select v-model="productionRewardPenaltyCreateReason" size="small" placeholder="奖惩原因">
                  <el-option label="质量" value="QUALITY" />
                  <el-option label="效率" value="EFFICIENCY" />
                  <el-option label="纪律" value="DISCIPLINE" />
                  <el-option label="安环" value="SAFETY" />
                  <el-option label="客户反馈" value="CUSTOMER_FEEDBACK" />
                </el-select>
                <el-input-number
                  v-model="productionRewardPenaltyCreateAmount"
                  size="small"
                  :precision="2"
                  controls-position="right"
                />
                <el-select v-model="productionRewardPenaltyCreateStatus" size="small" placeholder="审批状态">
                  <el-option label="待审批" value="PENDING" />
                  <el-option label="已通过" value="APPROVED" />
                  <el-option label="已驳回" value="REJECTED" />
                  <el-option label="已生效" value="EFFECTIVE" />
                </el-select>
                <el-input-number
                  v-model="productionRewardPenaltyCreateEmployeeUserId"
                  size="small"
                  :min="1"
                  controls-position="right"
                  placeholder="员工 ID"
                />
                <el-input v-model="productionRewardPenaltyCreateDepartment" size="small" placeholder="责任部门" />
                <el-input v-model="productionRewardPenaltyCreateDescription" size="small" placeholder="奖惩说明" />
                <el-button
                  type="primary"
                  size="small"
                  :loading="productionRewardPenaltySaving"
                  @click="createProductionRewardPenaltyRecord"
                >
                  登记奖惩记录
                </el-button>
              </article>
              <article class="placeholder-content-card tone-purple">
                <span class="placeholder-content-dot" />
                <strong>更新审批状态</strong>
                <el-input v-model="productionRewardPenaltyStatusNo" size="small" placeholder="奖惩编号" />
                <el-select v-model="productionRewardPenaltyStatus" size="small" placeholder="审批状态">
                  <el-option label="待审批" value="PENDING" />
                  <el-option label="已通过" value="APPROVED" />
                  <el-option label="已驳回" value="REJECTED" />
                  <el-option label="已生效" value="EFFECTIVE" />
                </el-select>
                <el-input v-model="productionRewardPenaltyStatusDescription" size="small" placeholder="审批说明" />
                <el-button
                  type="primary"
                  size="small"
                  :loading="productionRewardPenaltySaving"
                  @click="updateProductionRewardPenaltyRecordStatus"
                >
                  更新审批状态
                </el-button>
              </article>
            </div>
            <el-alert
              v-if="productionRewardPenaltyResult"
              :title="productionRewardPenaltyResult"
              type="success"
              show-icon
              :closable="false"
            />
          </div>
          <div v-if="activePlaceholderContentItems.length" class="placeholder-content-grid">
            <article
              v-for="item in activePlaceholderContentItems"
              :key="`${activeDisplayItem.id}-${item.title}`"
              class="placeholder-content-card"
              :class="`tone-${item.tone}`"
            >
              <span class="placeholder-content-dot" />
              <strong>{{ item.title }}</strong>
              <small>{{ item.detail }}</small>
            </article>
          </div>
          <div
            v-if="['cs-designs', 'cs-order-messages', 'cs-message-review', 'production-design'].includes(activeDisplayItem.id)"
            class="prototype-queue-card"
          >
            <div class="prototype-table-head">
              <h3>{{ activeDisplayItem.title }}队列</h3>
              <div class="prototype-search-box">搜索队列...</div>
            </div>
            <div class="prototype-chip-row">
              <button
                v-for="chip in prototypeQueueChips"
                :key="`placeholder-${chip.label}`"
                class="prototype-chip"
                :class="[`tone-${chip.tone}`, { active: isPrototypeChipActive(chip) }]"
                type="button"
                @click="selectPrototypeQueueChip(chip)"
              >
                {{ chip.label }}
                <span>{{ chip.count }}</span>
              </button>
            </div>
            <div class="prototype-table-wrap">
              <table class="prototype-table">
                <thead>
                  <tr>
                    <th>订单号</th>
                    <th>患者</th>
                    <th>产品</th>
                    <th>资料状态</th>
                    <th>文件清单</th>
                    <th>审核类型</th>
                    <th>等待对象</th>
                    <th>等待天数</th>
                    <th>处理动作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in prototypeDataQueueRows" :key="row.orderNo">
                    <td>
                      <strong class="prototype-order-no">{{ row.orderNo }}</strong>
                    </td>
                    <td>{{ row.patient }}</td>
                    <td>{{ row.product }}</td>
                    <td>
                      <span class="prototype-badge" :class="`tone-${row.statusTone}`">{{ row.status }}</span>
                    </td>
                    <td>
                      <span class="prototype-inline-status" :class="`tone-${row.checklistTone}`">{{ row.checklist }}</span>
                    </td>
                    <td>{{ row.reviewType }}</td>
                    <td>
                      <span class="prototype-badge" :class="`tone-${row.awaitingTone}`">{{ row.awaiting }}</span>
                    </td>
                    <td>
                      <strong class="prototype-days" :class="`tone-${row.daysTone}`">{{ row.days }}</strong>
                    </td>
                    <td>
                      <button class="prototype-row-action" type="button">{{ row.action }}</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-if="activeDisplayItem.children?.length" class="admin-menu-grid">
            <button
              v-for="child in activeDisplayItem.children"
              :key="child.id"
              class="admin-menu-card is-preview"
              type="button"
              @click="selectDisplayNavigationItem(child)"
            >
              <span class="admin-menu-icon" aria-hidden="true" v-html="businessIconSvg(child.icon)" />
              <strong>{{ child.title }}</strong>
              <small>{{ child.description }}</small>
            </button>
          </div>
        </section>

        <section v-else class="panel route-panel">
          <div class="route-heading">
            <h2>{{ routeChrome.title }}</h2>
            <el-tag round>{{ portalTitle }}</el-tag>
          </div>
          <div class="admin-overview-grid">
            <article v-for="card in businessOverviewCards" :key="card.title">
              <span class="admin-menu-icon" aria-hidden="true" v-html="businessIconSvg(card.icon)" />
              <span>{{ card.title }}</span>
              <strong>{{ card.value }}</strong>
              <small>{{ card.note }}</small>
            </article>
          </div>
          <div class="admin-menu-grid">
            <button
              v-for="shortcut in businessShortcuts"
              :key="`quick-${shortcut.title}`"
              class="admin-menu-card"
              :class="{ 'is-preview': !shortcut.routePath }"
              type="button"
              @click="selectBusinessShortcut(shortcut)"
            >
              <span class="admin-menu-icon" aria-hidden="true" v-html="businessIconSvg(shortcut.icon)" />
              <strong>{{ shortcut.title }}</strong>
              <small>{{ shortcut.description }}</small>
            </button>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>
