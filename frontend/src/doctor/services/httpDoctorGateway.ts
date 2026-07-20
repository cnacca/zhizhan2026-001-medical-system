import type {
  ClinicRole,
  DoctorAccount,
  DoctorFile,
  DoctorGateway,
  DoctorNotification,
  DoctorPortalDataset,
  OrderDetail,
  OrderDraftInput,
  OrderReview,
  OrderSummary,
  PatientDetail,
  PatientCreateInput,
  PatientSummary,
  PublicProgressItem,
  ReviewDecisionInput
} from '../types/contracts'

type LegacyPublicProgressItem = {
  key: string
  label: string
  status: 'DONE' | 'ACTIVE' | 'PENDING'
  occurred_at?: string | null
  note?: string | null
}

type LegacyOrder = {
  order_id: number
  order_no: string
  patient_id: number | null
  product_type: string
  external_status: string
  editable?: boolean
  form_data?: Record<string, unknown>
  public_message?: string | null
  bill_status?: string | null
  logistics_status?: string | null
  tracking_no?: string | null
  created_at?: string | null
  updated_at?: string | null
  public_progress?: LegacyPublicProgressItem[]
}

type LegacyMessage = {
  msg_id: number
  sender_role: string
  content: string
  created_at?: string | null
}

type LegacyOrderFile = {
  file_id: number
  original_filename: string
  content_type: string | null
  file_size: number | null
  upload_status: string
  created_at: string
}

type LegacyCreateOrderResponse = Pick<LegacyOrder, 'order_id' | 'order_no' | 'product_type' | 'external_status' | 'form_data'>

class DoctorApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

type LegacyPatient = {
  patient_id: number
  patient_name: string
  patient_age: number | null
  patient_gender: string | null
  oral_description: string | null
  order_count: number
  latest_order_at: string | null
}

type LegacyNotification = {
  notification_id: number
  event: string
  order_id: number | null
  order_no: string | null
  message: string | null
  read_at: string | null
  created_at: string
}

type LegacyAccount = {
  display_name: string
  contact_email: string | null
  shipping_address: string | null
}

type LegacyList<T> = { items: T[]; total: number; page: number; size: number }

type MultipartInitiateResponse = {
  file_id: number
  upload_id: string
  part_size: number
  part_count: number
}

type MultipartPartUrlResponse = { upload_url: string }

const productLabels: Record<string, string> = {
  FIXED_CROWN: '常规牙冠',
  FIXED_BRIDGE: '固定桥',
  IMPLANT_RESTORATION: '种植修复',
  REMOVABLE_DENTURE: '活动义齿',
  ORTHODONTIC: '正畸产品'
}

const statusMap: Record<string, string> = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'UNDER_REVIEW',
  DESIGNING: 'IN_PRODUCTION',
  PRODUCING: 'IN_PRODUCTION',
  QC: 'PRODUCTION_COMPLETED',
  PENDING_SHIP: 'READY_TO_DISPATCH',
  SHIPPED: 'SHIPPED',
  COMPLETED: 'COMPLETED'
}

const publicProgressMilestones = [
  { key: 'review', label: '资料审核', externalStatus: 'PENDING_REVIEW', rank: 0, note: '订单资料正在审核' },
  { key: 'design', label: '方案设计', externalStatus: 'DESIGNING', rank: 1, note: '订单已通过审核，正在进行方案设计' },
  { key: 'production', label: '制作处理中', externalStatus: 'PRODUCING', rank: 2, note: '方案已确认，正在制作' },
  { key: 'final-review', label: '成品复核', externalStatus: 'QC', rank: 3, note: '成品正在复核' },
  { key: 'ready-to-ship', label: '待发货', externalStatus: 'PENDING_SHIP', rank: 4, note: '成品已完成，等待发货' },
  { key: 'shipped', label: '配送中', externalStatus: 'SHIPPED', rank: 5, note: '订单已发货，请在物流页面查看配送信息' },
  { key: 'completed', label: '已完成', externalStatus: 'COMPLETED', rank: 6, note: '订单已完成' }
] as const

function fallbackPublicProgress(order: LegacyOrder): PublicProgressItem[] {
  const currentRank = order.external_status === 'DRAFT'
    ? -1
    : publicProgressMilestones.find((item) => item.externalStatus === order.external_status)?.rank ?? 0
  return [
    {
      key: 'submitted',
      label: currentRank < 0 ? '订单待提交' : '订单已提交',
      status: currentRank < 0 ? 'ACTIVE' : 'DONE',
      occurred_at: order.created_at || undefined,
      note: currentRank < 0 ? '订单仍为草稿，提交后进入资料审核' : '订单已进入公开处理流程'
    },
    ...publicProgressMilestones.map((milestone): PublicProgressItem => {
      const status = currentRank > milestone.rank
        ? 'DONE'
        : currentRank === milestone.rank
          ? milestone.externalStatus === 'COMPLETED' ? 'DONE' : 'ACTIVE'
          : 'PENDING'
      return {
        key: milestone.key,
        label: milestone.label,
        status,
        occurred_at: status === 'ACTIVE' ? order.updated_at || undefined : undefined,
        note: status === 'ACTIVE' ? milestone.note : undefined
      }
    })
  ]
}

const hiddenFormKey = /(internal|process|worklog|work_log|employee|staff|technician|operator|assignee|inspection|quality|qc|rework|performance|responsibility|工序|员工|技师|质检|返工|工时|绩效|责任)/i
const unsafeDoctorContent = /(内部工序|生产员工|员工编号|技师姓名|入检|出检|质检|工时|返工|绩效|责任分类|internal_status|node_instance|worker_user|assigned_user|work_log|rework|performance|responsibility)/i

function assertSafeOrderPayload(value: unknown): void {
  const visit = (candidate: unknown): boolean => {
    if (Array.isArray(candidate)) return candidate.some(visit)
    if (!candidate || typeof candidate !== 'object') return false
    return Object.entries(candidate).some(([key, nested]) => hiddenFormKey.test(key) || visit(nested))
  }
  if (visit(value)) throw new DoctorApiError('医生端订单投影包含内部字段，已阻止页面加载', 403)
}

function safeFormSnapshot(form: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(form)
      .filter(([key, value]) => !hiddenFormKey.test(key) && (value == null || ['string', 'number', 'boolean'].includes(typeof value)))
      .map(([key, value]) => [key, asText(value)])
  )
}

function numericFileIds(input: OrderDraftInput): number[] {
  return input.files
    .map((file) => Number(file.file_id))
    .filter((fileId) => Number.isSafeInteger(fileId) && fileId > 0)
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

function asText(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

function fileSizeLabel(bytes: number | null): string {
  if (bytes == null) return '大小未记录'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fileKind(file: LegacyOrderFile): DoctorFile['kind'] {
  const extension = file.original_filename.split('.').pop()?.toLowerCase()
  if (extension === 'stl') return 'STL'
  if (extension === 'pdf') return 'PDF'
  if (/^(jpg|jpeg|png|webp)$/.test(extension ?? '') || file.content_type?.startsWith('image/')) return 'IMAGE'
  return 'OTHER'
}

function notificationCategory(event: string): DoctorNotification['category'] {
  if (event.includes('DESIGN')) return 'REVIEW'
  if (event.includes('MESSAGE')) return 'MESSAGE'
  if (event.includes('BILL') || event.includes('PAYMENT')) return 'BILLING'
  if (event.includes('SHIP') || event.includes('LOGISTICS') || event.includes('DELIVER')) return 'LOGISTICS'
  if (event.includes('ORDER')) return 'ORDER'
  return 'SYSTEM'
}

const notificationTitles: Record<DoctorNotification['category'], string> = {
  ORDER: '订单通知',
  REVIEW: '确认通知',
  MESSAGE: '新消息',
  BILLING: '账单通知',
  LOGISTICS: '物流通知',
  SYSTEM: '系统通知'
}

export class LegacyHttpDoctorGateway implements DoctorGateway {
  private activeRole: ClinicRole = 'DOCTOR'

  constructor(
    private readonly token: string,
    private readonly profile: { displayName: string; clinicName: string },
    private readonly baseUrl = ''
  ) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
        'X-Clinic-Role': this.activeRole,
        ...(init.headers ?? {})
      }
    })
    if (!response.ok) {
      let message = `请求失败：${response.status}`
      try {
        const payload = await response.json() as { message?: string; msg?: string }
        message = payload.message || payload.msg || message
      } catch {
        // 非 JSON 响应保留状态码。
      }
      throw new DoctorApiError(message, response.status)
    }
    return unwrap<T>(await response.json())
  }

  private mapOrder(order: LegacyOrder): OrderSummary {
    const form = order.form_data ?? {}
    const editable = Boolean(order.editable)
    const isDraft = order.external_status === 'DRAFT'
    return {
      order_id: String(order.order_id),
      order_no: order.order_no,
      doctor_name: this.profile.displayName,
      patient_id: order.patient_id == null ? '' : String(order.patient_id),
      patient_code: order.patient_id == null ? '-' : `P-${order.patient_id}`,
      patient_name: order.patient_id == null ? '未关联' : `患者 ${order.patient_id}`,
      clinic_name: this.profile.clinicName,
      product_type: order.product_type,
      product_name: productLabels[order.product_type] ?? order.product_type,
      tags: [],
      external_status: statusMap[order.external_status] ?? order.external_status,
      current_action: isDraft ? 'NONE' : editable ? 'SUPPLEMENT_REQUIRED' : 'NONE',
      created_at: asText(order.created_at) || asText(form.created_at) || '-',
      due_at: asText(form.due_date) || asText(form.delivery_date) || '-',
      quote: null,
      allowed_actions: isDraft
        ? ['VIEW_ORDER', 'SUBMIT_ORDER']
        : editable ? ['VIEW_ORDER', 'SUPPLEMENT_ORDER', 'SEND_MESSAGE'] : ['VIEW_ORDER', 'SEND_MESSAGE'],
      state_version: 0
    }
  }

  async loadDataset(): Promise<DoctorPortalDataset> {
    const [ordersResult, patientsResult, notificationsResult, accountResult] = await Promise.allSettled([
      this.request<LegacyList<LegacyOrder>>('/orders?page=1&size=100'),
      this.request<LegacyList<LegacyPatient>>('/patients?page=1&size=100'),
      this.request<LegacyNotification[]>('/notifications?limit=100'),
      this.request<LegacyAccount>('/doctor/account/settings')
    ])

    const authFailure = [ordersResult, patientsResult, notificationsResult, accountResult]
      .find((result): result is PromiseRejectedResult => result.status === 'rejected' && result.reason instanceof DoctorApiError && [401, 403].includes(result.reason.status))
    if (authFailure) throw authFailure.reason

    if (ordersResult.status === 'fulfilled') assertSafeOrderPayload(ordersResult.value)

    const accountValue = accountResult.status === 'fulfilled' ? accountResult.value : null
    const account: DoctorAccount = {
      display_name: accountValue?.display_name || this.profile.displayName,
      email: accountValue?.contact_email || '',
      clinic_name: this.profile.clinicName,
      clinic_address: accountValue?.shipping_address || '',
      clinic_contact: '',
      notification_preferences: {},
      members: []
    }

    const patients: PatientSummary[] = patientsResult.status === 'fulfilled'
      ? patientsResult.value.items.map((patient) => ({
          patient_id: String(patient.patient_id),
          patient_code: `P-${patient.patient_id}`,
          patient_name: patient.patient_name,
          patient_age: patient.patient_age,
          patient_gender: patient.patient_gender,
          doctor_name: account.display_name,
          tags: [],
          oral_description: patient.oral_description ?? '',
          latest_order_no: null,
          latest_product_name: null,
          latest_order_at: patient.latest_order_at,
          order_count: patient.order_count
        }))
      : []

    const notifications: DoctorNotification[] = notificationsResult.status === 'fulfilled'
      ? notificationsResult.value.flatMap((item) => {
          const category = notificationCategory(item.event.toUpperCase())
          const content = `${item.event} ${item.message ?? ''}`
          const safeSystemEvent = /(ACCOUNT|SECURITY|PASSWORD|LOGIN|SYSTEM)/i.test(item.event)
          if (unsafeDoctorContent.test(content) || (category === 'SYSTEM' && !safeSystemEvent)) return []
          return [{
            notification_id: String(item.notification_id),
            category,
            title: notificationTitles[category],
            summary: item.message || notificationTitles[category],
            read: Boolean(item.read_at),
            created_at: item.created_at,
            target_type: item.order_id ? 'ORDER' as const : undefined,
            target_id: item.order_id ? String(item.order_id) : undefined
          }]
        })
      : []

    return {
      orders: ordersResult.status === 'fulfilled' ? ordersResult.value.items.map((order) => this.mapOrder(order)) : [],
      patients,
      bills: [],
      statements: [],
      invoiceRefunds: [],
      logistics: [],
      threads: [],
      notifications,
      account,
      products: []
    }
  }

  async switchRole(role: ClinicRole): Promise<DoctorPortalDataset> {
    const previousRole = this.activeRole
    this.activeRole = role
    try {
      return await this.loadDataset()
    } catch (cause) {
      this.activeRole = previousRole
      throw cause
    }
  }

  async loadOrderDetail(orderId: string): Promise<OrderDetail> {
    const legacy = await this.request<LegacyOrder>(`/orders/${encodeURIComponent(orderId)}`)
    assertSafeOrderPayload(legacy)
    const [messagesResult, filesResult] = await Promise.allSettled([
      this.request<LegacyMessage[]>(`/orders/${encodeURIComponent(orderId)}/messages`),
      this.request<LegacyOrderFile[]>(`/orders/${encodeURIComponent(orderId)}/files`)
    ])
    const summary = this.mapOrder(legacy)
    const formSnapshot = safeFormSnapshot(legacy.form_data ?? {})
    const messages = messagesResult.status === 'fulfilled'
      ? messagesResult.value.map((message) => ({
          message_id: String(message.msg_id),
          sender: message.sender_role === 'DOCTOR' ? 'SELF' as const : 'ORDER_SERVICE' as const,
          content: message.content,
          sent_at: message.created_at || '时间未记录',
          status: 'SENT' as const,
          attachments: []
        }))
      : []
    const files = filesResult.status === 'fulfilled'
      ? filesResult.value.map((file) => ({
          file_id: String(file.file_id),
          name: file.original_filename,
          kind: fileKind(file),
          size_label: fileSizeLabel(file.file_size),
          status: file.upload_status === 'READY' ? 'READY' as const : file.upload_status === 'FAILED' ? 'FAILED' as const : 'PROCESSING' as const,
          uploaded_at: file.created_at
        }))
      : []
    return {
      ...summary,
      public_message: legacy.public_message || '暂无公开进度说明。',
      form_snapshot: formSnapshot,
      progress: legacy.public_progress?.length
        ? legacy.public_progress.map((item) => ({
            key: item.key,
            label: item.label,
            status: item.status,
            occurred_at: item.occurred_at || undefined,
            note: item.note || undefined
          }))
        : fallbackPublicProgress(legacy),
      review_options: [],
      reviews: [],
      files,
      messages,
      bill_summary: { bill_status: legacy.bill_status || 'UNKNOWN', payment_status: 'UNKNOWN', outstanding: null }
    }
  }

  async loadPatientDetail(patientId: string): Promise<PatientDetail> {
    const dataset = await this.loadDataset()
    const patient = dataset.patients.find((item) => item.patient_id === patientId)
    if (!patient) throw new Error('患者不存在或无权访问')
    const response = await this.request<LegacyList<LegacyOrder>>(`/patients/${encodeURIComponent(patientId)}/orders?page=1&size=100`)
    return {
      ...patient,
      notes: '',
      orders: response.items.map((order) => ({
        order_id: String(order.order_id),
        order_no: order.order_no,
        product_name: productLabels[order.product_type] ?? order.product_type,
        external_status: statusMap[order.external_status] ?? order.external_status,
        created_at: '-'
      })),
      history_references: []
    }
  }

  async createPatient(input: PatientCreateInput): Promise<PatientSummary> {
    const patient = await this.request<LegacyPatient>('/patients', {
      method: 'POST',
      body: JSON.stringify({
        patient_name: input.patientName,
        patient_age: input.patientAge,
        patient_gender: input.patientGender,
        oral_description: input.oralDescription
      })
    })
    return {
      patient_id: String(patient.patient_id),
      patient_code: `P-${patient.patient_id}`,
      patient_name: patient.patient_name,
      patient_age: patient.patient_age,
      patient_gender: patient.patient_gender,
      doctor_name: this.profile.displayName,
      tags: input.tags,
      oral_description: patient.oral_description ?? '',
      latest_order_no: null,
      latest_product_name: null,
      latest_order_at: patient.latest_order_at,
      order_count: patient.order_count
    }
  }

  async saveDraft(input: OrderDraftInput): Promise<{ orderId: string; stateVersion: number }> {
    const payload = {
      product_id: input.productId,
      product_type: input.productType,
      patient_id: Number(input.patientId),
      form_data: { ...input.caseFields, ...input.dynamicFields },
      file_ids: numericFileIds(input),
      review_options: input.reviewOptions,
      ...(input.draftOrderId ? { submit: false } : { is_draft: true })
    }
    const result = input.draftOrderId
      ? await this.request<LegacyCreateOrderResponse>(`/orders/${encodeURIComponent(input.draftOrderId)}`, { method: 'PUT', body: JSON.stringify(payload) })
      : await this.request<LegacyCreateOrderResponse>('/orders', { method: 'POST', body: JSON.stringify(payload) })
    return { orderId: String(result.order_id), stateVersion: 0 }
  }

  async uploadOrderFiles(orderId: string, files: File[]): Promise<DoctorFile[]> {
    const numericOrderId = Number(orderId)
    if (!Number.isSafeInteger(numericOrderId) || numericOrderId <= 0) throw new Error('请先保存有效草稿后再上传文件')
    const uploaded: DoctorFile[] = []
    for (const file of files) {
      if (file.size > 200 * 1024 * 1024) throw new Error(`文件 ${file.name} 超过 200MB 限制`)
      const upload = await this.request<MultipartInitiateResponse>('/files/multipart/initiate', {
        method: 'POST',
        body: JSON.stringify({
          order_id: numericOrderId,
          source_type: 'ORDER_ATTACHMENT',
          visibility: 'DOCTOR',
          original_filename: file.name,
          content_type: file.type || 'application/octet-stream',
          file_size: file.size,
          part_size: 5 * 1024 * 1024
        })
      })
      const parts: Array<{ part_number: number; etag: string }> = []
      for (let partNumber = 1; partNumber <= upload.part_count; partNumber += 1) {
        const part = await this.request<MultipartPartUrlResponse>(`/files/${upload.file_id}/multipart/part-url`, {
          method: 'POST',
          body: JSON.stringify({ upload_id: upload.upload_id, part_number: partNumber })
        })
        const offset = (partNumber - 1) * upload.part_size
        const response = await fetch(part.upload_url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file.slice(offset, Math.min(offset + upload.part_size, file.size))
        })
        if (!response.ok) throw new Error(`文件 ${file.name} 第 ${partNumber} 分片上传失败`)
        const etag = response.headers.get('ETag')?.replaceAll('"', '').trim()
        if (!etag) throw new Error(`文件 ${file.name} 上传未返回 ETag`)
        parts.push({ part_number: partNumber, etag })
      }
      await this.request(`/files/${upload.file_id}/multipart/complete`, {
        method: 'POST',
        body: JSON.stringify({ upload_id: upload.upload_id, parts })
      })
      const extension = file.name.split('.').pop()?.toLowerCase()
      uploaded.push({
        file_id: String(upload.file_id),
        name: file.name,
        kind: extension === 'stl' ? 'STL' : extension === 'pdf' ? 'PDF' : /^(jpg|jpeg|png)$/.test(extension ?? '') ? 'IMAGE' : 'OTHER',
        size_label: `${Math.max(0.1, file.size / 1024 / 1024).toFixed(1)} MB`,
        status: 'READY',
        uploaded_at: new Date().toISOString()
      })
    }
    return uploaded
  }

  async submitOrder(input: OrderDraftInput): Promise<OrderSummary> {
    const payload = {
      product_id: input.productId,
      product_type: input.productType,
      patient_id: Number(input.patientId),
      form_data: { ...input.caseFields, ...input.dynamicFields },
      file_ids: numericFileIds(input),
      review_options: input.reviewOptions,
      ...(input.draftOrderId ? { submit: true } : { is_draft: false })
    }
    const result = input.draftOrderId
      ? await this.request<LegacyCreateOrderResponse>(`/orders/${encodeURIComponent(input.draftOrderId)}`, { method: 'PUT', body: JSON.stringify(payload) })
      : await this.request<LegacyCreateOrderResponse>('/orders', { method: 'POST', body: JSON.stringify(payload) })
    return this.mapOrder({
      ...result,
      patient_id: Number(input.patientId),
      editable: result.external_status === 'DRAFT',
      public_message: null
    })
  }

  async submitReview(_input: ReviewDecisionInput): Promise<OrderReview> {
    throw new Error('UNSUPPORTED_CAPABILITY：通用三类审核接口待后端接入')
  }

  async sendMessage(threadId: string, content: string) {
    const orderId = threadId.replace(/^TH-/, '')
    await this.request(`/orders/${encodeURIComponent(orderId)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, attachment_file_ids: [] })
    })
    return { message_id: `LOCAL-${Date.now()}`, sender: 'SELF' as const, content, sent_at: new Date().toISOString(), status: 'SENT' as const, attachments: [] }
  }

  async markThreadRead(threadId: string): Promise<void> {
    const orderId = threadId.replace(/^TH-/, '')
    await this.request(`/orders/${encodeURIComponent(orderId)}/messages/read`, { method: 'POST' })
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await this.request(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'POST' })
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.request('/notifications/read-all', { method: 'POST' })
  }

  async confirmReceipt(_orderId: string, _stateVersion: number): Promise<void> {
    throw new Error('UNSUPPORTED_CAPABILITY：状态版本与授权收货门禁待后端接入')
  }

  async askAssistant(question: string, orderId?: string): Promise<{ answer: string; orderIds: string[] }> {
    const numericOrderId = Number(orderId)
    if (!Number.isSafeInteger(numericOrderId) || numericOrderId <= 0) {
      throw new Error('请选择一个订单或在问题中输入订单号后再查询')
    }
    const payload = await this.request<{ answer: string }>('/ai/order-query', {
      method: 'POST',
      body: JSON.stringify({ order_id: numericOrderId, question })
    })
    return { answer: payload.answer, orderIds: [String(numericOrderId)] }
  }
}
