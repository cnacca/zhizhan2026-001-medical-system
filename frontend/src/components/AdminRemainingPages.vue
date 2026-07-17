<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type ApiResponse<T> = { code: number; msg: string; data: T }
type Row = Record<string, any>
type Notice = {
  notification_id: number
  event: string
  order_id: number | null
  order_no: string | null
  message: string | null
  read_at: string | null
  delivered_at: string | null
  created_at: string
}

const props = defineProps<{
  activeRoute: string
  token: string
  notifications: Notice[]
  notificationsLoading: boolean
  notificationError: string
  unreadCount: number
}>()

const emit = defineEmits<{
  refreshNotifications: []
  markNotificationRead: [id: number]
  markAllNotificationsRead: []
  openOrder: [orderId: number]
}>()

const loading = ref(false)
const failed = ref(false)
const failureKind = ref<'request' | 'permission'>('request')
const keyword = ref('')
const statusFilter = ref('ALL')
const page = ref(1)
const pageSize = 10
const drawerVisible = ref(false)
const drawerTitle = ref('')
const drawerKind = ref('')
const drawerData = ref<Row>({})
const drawerLoading = ref(false)

const clientTab = ref<'directory' | 'contribution'>('directory')
const deliveryRegion = ref<'domestic' | 'overseas'>('domestic')
const deliveryTab = ref<'billing' | 'tracking'>('billing')
const equipmentTab = ref<'list' | 'approval'>('list')
const safetyTab = ref<'supervision' | 'rules'>('supervision')
const notificationTab = ref<'all' | 'unread'>('all')

const clients = ref<Row[]>([])
const clientSummary = ref<Row | null>(null)
const salesSummary = ref<Row | null>(null)
const deliveryOrders = ref<Row[]>([])
const processRows = ref<Row[]>([])
const staffRows = ref<Row[]>([])
const performanceRows = ref<Row[]>([])
const qualitySummary = ref<Row | null>(null)
const qualityRows = ref<Row[]>([])
const supportSummary = ref<Row | null>(null)
const products = ref<Row[]>([])
const aiSummary = ref<Row | null>(null)
const aiTrend = ref<Row | null>(null)
const dictionaryType = ref<'REASON_CATEGORY' | 'RESPONSIBILITY_TYPE'>('REASON_CATEGORY')
const dictionaryItems = ref<Row[]>([])
const dictionaryLoading = ref(false)
const dictionaryError = ref(false)
const selectedDictionaryId = ref<number | null>(null)
const dictionaryLabel = ref('')
const dictionarySort = ref(50)
const dictionarySaving = ref(false)
const dictionaryMessage = ref('')

const routeSet = new Set([
  '/admin/clinics', '/delivery', '/admin/outsourcing', '/workflow/process-instance',
  '/production/quality', '/performance', '/production/devices',
  '/production/material-exceptions', '/production/safety-environment',
  '/production/cost-management', '/system/form-configs', '/notifications',
  '/admin/ai-governance'
])

const businessFailure = '数据暂时无法加载，请稍后重试'
const failureMessage = computed(() => failureKind.value === 'permission' ? '当前账号无权查看此业务内容' : businessFailure)

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${props.token}`,
      ...(options.headers ?? {})
    }
  })
  if (!response.ok) throw new Error(String(response.status))
  const payload = await response.json() as ApiResponse<T>
  return payload.data
}

async function poolMap<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>) {
  const results = new Array<R>(items.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await task(items[index])
    }
  })
  await Promise.all(workers)
  return results
}

function resetViewState() {
  keyword.value = ''
  statusFilter.value = 'ALL'
  page.value = 1
  drawerVisible.value = false
  failed.value = false
  failureKind.value = 'request'
}

async function loadClients() {
  const [list, summary, sales] = await Promise.all([
    request<Row>('/clinics?page=1&size=100'),
    request<Row>('/dashboards/phase-one-ab'),
    request<Row>('/dashboards/sales')
  ])
  clients.value = list.items ?? []
  clientSummary.value = summary
  salesSummary.value = sales
}

async function loadDelivery() {
  deliveryOrders.value = await request<Row[]>('/logistics/orders?limit=50')
}

async function loadProcesses() {
  const orderList = await request<Row>('/orders?page=1&size=30')
  const orders = (orderList.items ?? []).slice(0, 15)
  processRows.value = await poolMap<Row, Row>(orders, 3, async (order) => {
    try {
      const instance = await request<Row>(`/orders/${order.order_id}/process-instance`)
      return { order, instance, failed: false }
    } catch (error) {
      const missing = error instanceof Error && error.message === '404'
      return { order, instance: null, failed: !missing, missing }
    }
  })
}

async function loadQuality() {
  const [summary, reworks, external] = await Promise.all([
    request<Row>('/production/quality/summary'),
    request<Row[]>('/reworks'),
    request<Row>('/quality-records?record_type=EXTERNAL_RETURN&page=1&size=50')
  ])
  qualitySummary.value = summary
  qualityRows.value = [
    ...(reworks ?? []).map((item) => ({ ...item, issue_type: '内返', source: item.from_process_name || '生产检查' })),
    ...((external.items ?? []) as Row[]).map((item) => ({ ...item, issue_type: '外返', source: '客户反馈' }))
  ]
}

async function loadPerformance() {
  const workload = await request<Row>('/staff/workload?page=1&size=30')
  staffRows.value = workload.items ?? []
  performanceRows.value = await poolMap<Row, Row>(staffRows.value.slice(0, 12), 3, async (staff) => {
    try {
      const stats = await request<Row>(`/performance?user_id=${staff.user_id}`)
      return {
        staff,
        stats: {
          ...stats,
          performance_formula_version: stats.performance_formula_version ? '当前绩效参考口径' : null
        },
        failed: false
      }
    } catch {
      return { staff, stats: null, failed: true }
    }
  })
}

async function loadSupportSummary() {
  const pathByRoute: Record<string, string> = {
    '/production/devices': '/production/equipment/summary',
    '/production/material-exceptions': '/production/material-exceptions/summary',
    '/production/safety-environment': '/production/safety-environment/summary',
    '/production/cost-management': '/production/cost-management/summary'
  }
  supportSummary.value = await request<Row>(pathByRoute[props.activeRoute])
}

async function loadProducts() {
  const list = await request<Row>('/products?page=1&size=100')
  products.value = (list.items ?? []).map((item: Row) => ({
    ...item,
    material_spec: businessProductMaterial(item.material_spec),
    price_note: businessProductPriceNote(item.price_note)
  }))
}

async function loadAi() {
  const [summary, trend] = await Promise.all([
    request<Row>('/ai/governance/summary'),
    request<Row>('/ai/governance/cost-trend?days=7')
  ])
  aiSummary.value = summary
  aiTrend.value = trend
}

async function refresh() {
  if (!props.token || !routeSet.has(props.activeRoute)) return
  if (props.activeRoute === '/notifications') {
    emit('refreshNotifications')
    return
  }
  loading.value = true
  failed.value = false
  failureKind.value = 'request'
  try {
    if (props.activeRoute === '/admin/clinics') await loadClients()
    else if (props.activeRoute === '/delivery') await loadDelivery()
    else if (props.activeRoute === '/workflow/process-instance') await loadProcesses()
    else if (props.activeRoute === '/production/quality') await loadQuality()
    else if (props.activeRoute === '/performance') await loadPerformance()
    else if (['/production/devices', '/production/material-exceptions', '/production/safety-environment', '/production/cost-management'].includes(props.activeRoute)) await loadSupportSummary()
    else if (props.activeRoute === '/system/form-configs') await loadProducts()
    else if (props.activeRoute === '/admin/ai-governance') await loadAi()
  } catch (error) {
    failureKind.value = error instanceof Error && error.message === '403' ? 'permission' : 'request'
    failed.value = true
  } finally {
    loading.value = false
  }
}

const clientRankingMap = computed<Map<number, Row>>(() => new Map<number, Row>((clientSummary.value?.top_customers ?? []).map((item: Row) => [Number(item.clinic_id), item])))
const drawerDetails = computed<Row[]>(() => drawerData.value?.details ?? [])

function clientRank(clinicId: number) {
  const index = (clientSummary.value?.top_customers ?? []).findIndex((item: Row) => item.clinic_id === clinicId)
  return index >= 0 ? `第 ${index + 1} 名` : '暂未进入排名'
}
const filteredClients = computed(() => clients.value.filter((item) => {
  const text = `${item.clinic_name} ${item.contact_name ?? ''} ${item.contact_phone ?? ''}`.toLowerCase()
  const keywordMatch = !keyword.value || text.includes(keyword.value.toLowerCase())
  const statusMatch = statusFilter.value === 'ALL' || item.status === statusFilter.value
  return keywordMatch && statusMatch
}))

const filteredProducts = computed(() => products.value.filter((item) => {
  const text = `${item.product_name} ${item.product_type} ${item.material_spec ?? ''}`.toLowerCase()
  return (!keyword.value || text.includes(keyword.value.toLowerCase())) && (statusFilter.value === 'ALL' || item.status === statusFilter.value)
}))

const filteredProcesses = computed(() => processRows.value.filter((row) => {
  const order = row.order ?? {}
  const nodes = row.instance?.nodes ?? []
  const current = nodes.find((node: Row) => node.node_status === 'IN_PROGRESS') ?? nodes.find((node: Row) => node.node_status === 'READY')
  const text = `${order.order_no} ${order.clinic_name ?? ''} ${order.product_type ?? ''}`.toLowerCase()
  const status = current?.assigned_user_id ? 'PRODUCING' : nodes.length ? 'UNASSIGNED' : 'NO_PROCESS'
  return (!keyword.value || text.includes(keyword.value.toLowerCase())) && (statusFilter.value === 'ALL' || statusFilter.value === status)
}))

const filteredQuality = computed(() => qualityRows.value.filter((item) => {
  const text = `${item.order_no ?? item.order_id ?? ''} ${item.reason_detail ?? ''} ${item.issue_type}`.toLowerCase()
  return (!keyword.value || text.includes(keyword.value.toLowerCase())) && (statusFilter.value === 'ALL' || item.status === statusFilter.value || item.issue_type === statusFilter.value)
}))

const filteredPerformance = computed(() => performanceRows.value.filter((row) => {
  const staff = row.staff ?? {}
  return !keyword.value || `${staff.display_name ?? ''} ${staff.username ?? ''} ${staff.department_name ?? ''}`.toLowerCase().includes(keyword.value.toLowerCase())
}))

const filteredNotices = computed(() => props.notifications.filter((item) => notificationTab.value === 'all' || !item.read_at))
const currentRows = computed<Row[]>(() => {
  if (props.activeRoute === '/admin/clinics') return filteredClients.value
  if (props.activeRoute === '/workflow/process-instance') return filteredProcesses.value
  if (props.activeRoute === '/production/quality') return filteredQuality.value
  if (props.activeRoute === '/performance') return filteredPerformance.value
  if (props.activeRoute === '/system/form-configs') return filteredProducts.value
  if (props.activeRoute === '/notifications') return filteredNotices.value
  return []
})
const pageCount = computed(() => Math.max(1, Math.ceil(currentRows.value.length / pageSize)))
const pagedRows = computed(() => currentRows.value.slice((page.value - 1) * pageSize, page.value * pageSize))

function clearFilters() {
  keyword.value = ''
  statusFilter.value = 'ALL'
  page.value = 1
}

function compactDate(value: string | null | undefined) {
  if (!value) return '暂未记录'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN', { hour12: false })
}

function statusLabel(value: string | null | undefined) {
  const labels: Record<string, string> = {
    ACTIVE: '启用', INACTIVE: '停用', RUNNING: '运行', IDLE: '待机', MAINTENANCE: '维护', FAULT: '故障',
    PENDING: '待处理', IN_PROGRESS: '处理中', CLOSED: '已关闭', COMPLETED: '已完成', READY: '待开始',
    SHIPPED: '已发货', DELIVERED: '已送达', EXCEPTION: '异常', FOLLOWING: '跟进中', RESOLVED: '已解决',
    NORMAL: '正常', WARNING: '异常提醒', CONFIRMED: '已确认', PAID: '已付款', PENDING_PAYMENT: '待付款'
  }
  return labels[value ?? ''] ?? value ?? '暂未记录'
}

function productLabel(value: string | null | undefined) {
  const labels: Record<string, string> = {
    REGULAR_CROWN: '常规冠修复', IMPLANT: '种植修复', ORTHODONTICS: '正畸产品', REMOVABLE: '活动修复'
  }
  return labels[value ?? ''] ?? value ?? '产品未标注'
}

function businessProductMaterial(value: string | null | undefined) {
  const normalized = String(value ?? '').replace(/一期默认产品[；;、]?/g, '').trim()
  return normalized || '材料规格待客服维护'
}

function businessProductPriceNote(value: string | null | undefined) {
  const normalized = String(value ?? '').trim()
  if (!normalized) return '暂无备注'
  if (/(种子|占位|演示|测试)/.test(normalized)) return '价格信息待客服维护，不作为正式报价'
  return normalized
}

function amount(value: number | null | undefined, currency = 'CNY') {
  if (value === null || value === undefined) return '暂未统计'
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency }).format(value / 100)
}

function costAmount(value: number | null | undefined) {
  if (value === null || value === undefined) return '暂未统计'
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(value)
}

function processCurrent(row: Row) {
  const nodes = row.instance?.nodes ?? []
  return nodes.find((node: Row) => node.node_status === 'IN_PROGRESS') ?? nodes.find((node: Row) => node.node_status === 'READY') ?? nodes.at(-1) ?? null
}

function processProgress(row: Row) {
  const nodes = row.instance?.nodes ?? []
  if (!nodes.length) return 0
  return Math.round(nodes.filter((node: Row) => node.node_status === 'COMPLETED').length / nodes.length * 100)
}

async function openClient(row: Row) {
  openDrawer('客户详情', 'client', row)
  drawerLoading.value = true
  try {
    const [detail, preference] = await Promise.all([
      request<Row>(`/clinics/${row.clinic_id}`),
      request<Row>(`/clinics/${row.clinic_id}/preference`)
    ])
    drawerData.value = { ...detail, preference, ranking: clientRankingMap.value.get(row.clinic_id) }
  } catch {
    drawerData.value = { ...row, detailFailed: true }
  } finally {
    drawerLoading.value = false
  }
}

async function openDelivery(row: Row) {
  openDrawer('账单与配送详情', 'delivery', row)
  drawerLoading.value = true
  try {
    const [bill, payments, logistics] = await Promise.allSettled([
      request<Row>(`/orders/${row.order_id}/bill`),
      request<Row[]>(`/orders/${row.order_id}/payments`),
      request<Row>(`/orders/${row.order_id}/logistics`)
    ])
    drawerData.value = {
      ...row,
      bill: bill.status === 'fulfilled' ? bill.value : null,
      payments: payments.status === 'fulfilled' ? payments.value : [],
      logistics: logistics.status === 'fulfilled' ? logistics.value : null
    }
  } finally {
    drawerLoading.value = false
  }
}

async function openProcess(row: Row) {
  openDrawer('订单工序详情', 'process', row)
}

async function openPerformance(row: Row) {
  openDrawer('个人绩效详情', 'performance', row)
  drawerLoading.value = true
  try {
    const details = await request<Row[]>(`/performance/details?user_id=${row.staff.user_id}`)
    drawerData.value = { ...row, details }
  } catch {
    drawerData.value = { ...row, details: [], detailFailed: true }
  } finally {
    drawerLoading.value = false
  }
}

function openDrawer(title: string, kind: string, data: Row) {
  drawerTitle.value = title
  drawerKind.value = kind
  drawerData.value = data
  drawerVisible.value = true
}

function closeDrawer() {
  drawerVisible.value = false
  drawerData.value = {}
  drawerKind.value = ''
}

async function openQualitySettings() {
  openDrawer('返工原因与责任', 'dictionary', {})
  await loadDictionaryItems()
}

async function loadDictionaryItems() {
  dictionaryLoading.value = true
  dictionaryError.value = false
  dictionaryMessage.value = ''
  try {
    dictionaryItems.value = await request<Row[]>(`/reworks/dictionaries/items?dictionary_type=${dictionaryType.value}`)
    const selected = dictionaryItems.value.find((item) => item.item_id === selectedDictionaryId.value) ?? dictionaryItems.value[0]
    if (selected) selectDictionary(selected)
  } catch {
    dictionaryItems.value = []
    dictionaryError.value = true
  } finally {
    dictionaryLoading.value = false
  }
}

function selectDictionary(item: Row) {
  selectedDictionaryId.value = item.item_id
  dictionaryLabel.value = item.label
  dictionarySort.value = item.sort_order
}

async function saveDictionary() {
  if (!selectedDictionaryId.value || !dictionaryLabel.value.trim()) return
  dictionarySaving.value = true
  dictionaryMessage.value = ''
  try {
    await request<Row>(`/reworks/dictionaries/items/${selectedDictionaryId.value}`, {
      method: 'PUT',
      body: JSON.stringify({ label: dictionaryLabel.value.trim(), sort_order: dictionarySort.value })
    })
    dictionaryMessage.value = '设置已保存'
    await loadDictionaryItems()
  } catch {
    dictionaryMessage.value = '设置暂时无法保存，请稍后重试'
  } finally {
    dictionarySaving.value = false
  }
}

const supportCards = computed(() => {
  const s = supportSummary.value ?? {}
  if (props.activeRoute === '/production/devices') return [
    ['设备总数', s.total_equipment_count], ['运行', s.running_count], ['待机', s.idle_count], ['维护', s.maintenance_count], ['故障', s.fault_count], ['平均稼动率', `${s.average_utilization_rate ?? 0}%`]
  ]
  if (props.activeRoute === '/production/material-exceptions') return [
    ['异常总数', s.total_exception_count], ['缺料', s.shortage_count], ['错料', s.wrong_material_count], ['批次异常', s.batch_abnormal_count], ['材料损耗', s.material_loss_count], ['待处理', s.pending_count]
  ]
  if (props.activeRoute === '/production/safety-environment') return [
    ['应检查', s.safety_inspection_count], ['未检查', s.pending_count], ['检查异常', s.high_risk_count], ['整改中', s.in_progress_count], ['逾期未检', s.overdue_count], ['已关闭', s.closed_count]
  ]
  return [
    ['成本记录', s.record_count], ['人员成本', costAmount(s.labor_cost_amount)], ['材料成本', costAmount(s.material_cost_amount)], ['工序成本', costAmount(s.process_cost_amount)], ['返工成本', costAmount(s.rework_cost_amount)], ['外协成本', costAmount(s.outsourcing_cost_amount)], ['异常提醒', s.abnormal_warning_count]
  ]
})

const supportEmptyText = computed(() => {
  if (props.activeRoute === '/production/devices') return '当前仅有设备总体情况，设备明细和审批记录尚未纳入'
  if (props.activeRoute === '/production/material-exceptions') return '当前仅有物料异常总体情况，明细记录尚未纳入'
  if (props.activeRoute === '/production/safety-environment') return '当前仅有安环总体情况，检查计划和整改明细尚未纳入'
  return '当前仅有成本总体情况，成本明细尚未纳入'
})

const aiHoverIndex = ref<number | null>(null)
const aiRawPoints = computed(() => (aiTrend.value?.points ?? []) as Row[])
const aiPoints = computed(() => {
  const source = new Map(aiRawPoints.value.map((item) => [String(item.date), item]))
  const end = new Date()
  end.setHours(12, 0, 0, 0)
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(end)
    day.setDate(end.getDate() - (6 - index))
    const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
    const point = source.get(date)
    return {
      date,
      success_count: Number(point?.success_count ?? 0),
      estimated_cost_microusd: Number(point?.estimated_cost_microusd ?? 0)
    }
  })
})
const aiMax = computed(() => Math.max(1, ...aiPoints.value.map((item) => item.success_count)))
const aiCostMax = computed(() => Math.max(1, ...aiPoints.value.map((item) => item.estimated_cost_microusd)))
const aiChartPoints = computed(() => aiPoints.value.map((item, index) => ({
  ...item,
  x: 44 + index * (512 / 6),
  y: 156 - item.success_count / aiMax.value * 112,
  costY: 156 - item.estimated_cost_microusd / aiCostMax.value * 112
})))
const aiPolyline = computed(() => aiChartPoints.value.map((item) => `${item.x},${item.y}`).join(' '))
const aiAreaPath = computed(() => `M 44 156 L ${aiPolyline.value.replaceAll(' ', ' L ')} L 556 156 Z`)
const aiCostPolyline = computed(() => aiChartPoints.value.map((item) => `${item.x},${item.costY}`).join(' '))
const aiHasActivity = computed(() => aiPoints.value.some((item) => item.success_count > 0 || item.estimated_cost_microusd > 0))
const aiHasCost = computed(() => aiPoints.value.some((item) => item.estimated_cost_microusd > 0))
const aiActiveChartPoint = computed(() => aiChartPoints.value[aiHoverIndex.value ?? 6])
const aiDateRange = computed(() => `${aiPoints.value[0]?.date.slice(5).replace('-', '/')}—${aiPoints.value[6]?.date.slice(5).replace('-', '/')}`)
const aiBudgetPercent = computed(() => {
  const budget = Number(aiSummary.value?.daily_budget_microusd ?? 0)
  if (budget <= 0) return 0
  return Math.min(100, Number(aiSummary.value?.estimated_cost_microusd ?? 0) / budget * 100)
})

function microUsd(value: number | null | undefined) {
  return `$${(Number(value ?? 0) / 1_000_000).toFixed(4)}`
}

function noticeLabel(event: string) {
  const labels: Record<string, string> = {
    ORDER_STATUS_CHANGED: '订单状态', MESSAGE_CREATED: '沟通消息', DESIGN_DRAFT_CREATED: '设计稿',
    BILL_CREATED: '账单提醒', LOGISTICS_UPDATED: '配送提醒', AI_BUDGET_EXCEEDED: '预算提醒'
  }
  return labels[event] ?? '业务通知'
}

function escapeClose(event: KeyboardEvent) {
  if (event.key === 'Escape' && drawerVisible.value) closeDrawer()
}

watch(() => [props.activeRoute, props.token], () => {
  if (!routeSet.has(props.activeRoute)) return
  resetViewState()
  void refresh()
}, { immediate: true })

watch([keyword, statusFilter], () => { page.value = 1 })
watch(dictionaryType, () => { if (drawerKind.value === 'dictionary') void loadDictionaryItems() })

onMounted(() => window.addEventListener('keydown', escapeClose))
onBeforeUnmount(() => window.removeEventListener('keydown', escapeClose))

defineExpose({ refresh, openQualitySettings })
</script>

<template>
  <section class="arp-page" :data-route="activeRoute">
    <div v-if="failed" class="arp-state arp-state-error" role="alert"><strong>{{ failureMessage }}</strong><button type="button" @click="refresh">重新加载</button></div>
    <div v-else-if="loading" class="arp-state"><span class="arp-spinner" />正在加载业务数据…</div>

    <template v-else-if="activeRoute === '/admin/clinics'">
      <nav class="arp-primary-tabs"><button :class="{ active: clientTab === 'directory' }" @click="clientTab = 'directory'">客户目录</button><button :class="{ active: clientTab === 'contribution' }" @click="clientTab = 'contribution'">客户贡献</button></nav>
      <div v-if="clientTab === 'directory'" class="arp-table-card arp-fill-card">
        <div class="arp-toolbar"><label class="arp-search"><span>⌕</span><input v-model="keyword" placeholder="搜索客户、联系人或电话"></label><select v-model="statusFilter"><option value="ALL">全部状态</option><option value="ACTIVE">启用</option><option value="INACTIVE">停用</option></select><button @click="clearFilters">清空</button><em>共 {{ filteredClients.length }} 家客户</em></div>
        <div class="arp-table-scroll"><table class="arp-wide"><thead><tr><th>客户</th><th>联系人</th><th>客户状态</th><th>制作偏好</th><th>订单与件数</th><th>接单金额</th><th>最近维护</th><th>操作</th></tr></thead><tbody><tr v-for="row in pagedRows" :key="row.clinic_id" @click="openClient(row)"><td><span class="arp-avatar">🏥</span><strong>{{ row.clinic_name }}</strong><small>客户编号 {{ row.clinic_id }}</small></td><td><strong>{{ row.contact_name || '暂未维护' }}</strong><small>{{ row.contact_phone || '电话暂未维护' }}</small></td><td><i class="arp-badge" :class="row.status === 'ACTIVE' ? 'ok' : 'muted'">{{ statusLabel(row.status) }}</i></td><td>{{ row.preference_count }} 项</td><td><strong>{{ clientRankingMap.get(row.clinic_id)?.order_count ?? '暂未统计' }} 单</strong><small>{{ clientRankingMap.get(row.clinic_id)?.item_count ?? '暂未统计' }} 件</small></td><td>暂未统计</td><td>{{ compactDate(row.updated_at) }}</td><td><button @click.stop="openClient(row)">查看</button></td></tr></tbody></table></div>
        <footer class="arp-pagination"><span>显示 {{ (page - 1) * pageSize + (currentRows.length ? 1 : 0) }}–{{ Math.min(page * pageSize, currentRows.length) }}，共 {{ currentRows.length }} 条</span><div><button :disabled="page <= 1" @click="page--">上一页</button><b>{{ page }}</b><button :disabled="page >= pageCount" @click="page++">下一页</button></div></footer>
      </div>
      <div v-else class="arp-contribution">
        <div class="arp-sales-band"><div><span>本年接单金额</span><strong>{{ amount(salesSummary?.inbound?.current_amount_cents, salesSummary?.currency || 'CNY') }}</strong><small>截至 {{ salesSummary?.through_date || '当前周期' }}</small></div><div><span>本年出货金额</span><strong>{{ amount(salesSummary?.outbound?.current_amount_cents, salesSummary?.currency || 'CNY') }}</strong><small>金额覆盖 {{ salesSummary?.outbound?.current_amount_order_count ?? 0 }} 单</small></div><div><span>本月订单</span><strong>{{ clientSummary?.current_month?.order_count ?? 0 }}</strong><small>较上月 {{ clientSummary?.monthly_order_delta ?? 0 }}</small></div><div><span>本月件数</span><strong>{{ clientSummary?.current_month?.item_count ?? 0 }}</strong><small>较上月 {{ clientSummary?.monthly_item_delta ?? 0 }}</small></div></div>
        <div class="arp-ranking-card">
          <header><div><span>🏆</span><strong>本月客户贡献</strong></div><small>按真实件数排序 · 客户销售额暂未统计</small></header>
          <div class="arp-ranking-head"><span>排名与客户</span><span>件数贡献</span><span>订单</span><span>件数</span><span>接单金额</span></div>
          <article v-for="(row, index) in (clientSummary?.top_customers ?? []) as Row[]" :key="row.clinic_id">
            <div><i>{{ Number(index) + 1 }}</i><strong>{{ row.clinic_name }}</strong></div>
            <span><i :style="{ width: `${Math.max(8, Number(row.item_count) / Math.max(1, Number(clientSummary?.top_customers?.[0]?.item_count ?? 1)) * 100)}%` }" /></span>
            <b>{{ row.order_count }}</b><b>{{ row.item_count }}</b><em>暂未统计</em>
          </article>
          <div v-if="!(clientSummary?.top_customers?.length)" class="arp-empty">当前还没有可查看的客户贡献记录</div>
        </div>
      </div>
    </template>

    <template v-else-if="activeRoute === '/delivery'">
      <nav class="arp-primary-tabs"><button :class="{ active: deliveryRegion === 'domestic' }" @click="deliveryRegion = 'domestic'">国内业务</button><button :class="{ active: deliveryRegion === 'overseas' }" @click="deliveryRegion = 'overseas'">国外业务</button></nav>
      <nav class="arp-secondary-tabs"><button :class="{ active: deliveryTab === 'billing' }" @click="deliveryTab = 'billing'">账单与收款</button><button :class="{ active: deliveryTab === 'tracking' }" @click="deliveryTab = 'tracking'">配送跟踪</button></nav>
      <div class="arp-business-note">⚠️ 订单尚未维护配送地区，暂时无法归入国内或国外业务</div>
      <div class="arp-table-card arp-delivery-card"><div class="arp-toolbar"><label class="arp-search"><span>⌕</span><input v-model="keyword" placeholder="搜索订单号或运单号"></label><select v-model="statusFilter"><option value="ALL">全部状态</option><option value="SHIPPED">已发货</option><option value="EXCEPTION">配送异常</option><option value="FOLLOWING">跟进中</option><option value="RESOLVED">已解决</option></select><button @click="refresh">刷新</button><em>待归类记录 {{ deliveryOrders.length }} 条</em></div><div class="arp-table-scroll"><table class="arp-wide"><thead><tr v-if="deliveryTab === 'billing'"><th>订单</th><th>产品</th><th>账单状态</th><th>付款状态</th><th>账单金额</th><th>配送地区</th><th>操作</th></tr><tr v-else><th>订单</th><th>产品</th><th>承运商</th><th>运单号</th><th>发货状态</th><th>配送状态</th><th>最近跟进</th><th>操作</th></tr></thead><tbody><tr v-for="row in deliveryOrders.filter(item => (!keyword || `${item.order_no} ${item.tracking_no || ''}`.toLowerCase().includes(keyword.toLowerCase())) && (statusFilter === 'ALL' || item.logistics_status === statusFilter || item.external_status === statusFilter))" :key="row.order_id" @click="openDelivery(row)"><template v-if="deliveryTab === 'billing'"><td><strong>{{ row.order_no }}</strong><small>订单编号 {{ row.order_id }}</small></td><td>{{ productLabel(row.product_type) }}</td><td><i class="arp-badge">{{ statusLabel(row.bill_status) }}</i></td><td><i class="arp-badge">{{ statusLabel(row.payment_status) }}</i></td><td>查看详情</td><td>尚未维护</td><td><button @click.stop="openDelivery(row)">查看</button></td></template><template v-else><td><strong>{{ row.order_no }}</strong></td><td>{{ productLabel(row.product_type) }}</td><td>{{ row.carrier || '暂未记录' }}</td><td>{{ row.tracking_no || '暂未记录' }}</td><td>{{ statusLabel(row.external_status) }}</td><td><i class="arp-badge" :class="row.logistics_status === 'EXCEPTION' ? 'danger' : 'ok'">{{ statusLabel(row.logistics_status) }}</i></td><td>{{ row.last_follow_up_note || '暂无跟进记录' }}</td><td><button @click.stop="openDelivery(row)">查看</button></td></template></tr></tbody></table></div><div v-if="deliveryOrders.length === 0" class="arp-empty">当前还没有可查看的账单或配送记录</div></div>
    </template>

    <template v-else-if="activeRoute === '/admin/outsourcing'">
      <div class="arp-table-card arp-fill-card"><div class="arp-toolbar"><label class="arp-search"><span>⌕</span><input disabled placeholder="搜索外协件、订单或供应商"></label><select disabled><option>全部状态</option></select><button @click="refresh">刷新</button><em>真实记录 0 条</em></div><div class="arp-table-scroll"><table class="arp-wide"><thead><tr><th>外协件 / 订单</th><th>供应商</th><th>发出时间</th><th>预计返回</th><th>实际返回</th><th>流转状态</th><th>异常状态</th><th>操作</th></tr></thead></table><div class="arp-empty arp-empty-large"><span>☁️</span><strong>当前还没有可查看的外协进度记录</strong><p>发生外协后，将按外协件或批次展示发出、预计返回、实际返回、超时和异常。</p></div></div></div>
    </template>

    <template v-else-if="activeRoute === '/workflow/process-instance'">
      <div class="arp-table-card arp-fill-card"><div class="arp-toolbar"><label class="arp-search"><span>⌕</span><input v-model="keyword" placeholder="搜索订单、客户或产品"></label><select v-model="statusFilter"><option value="ALL">全部状态</option><option value="UNASSIGNED">待派工</option><option value="PRODUCING">生产中</option><option value="NO_PROCESS">尚未生成工序</option></select><button @click="clearFilters">清空</button><em>共 {{ filteredProcesses.length }} 单</em></div><div class="arp-table-scroll"><table class="arp-wide"><thead><tr><th>订单</th><th>客户 / 产品</th><th>当前工序</th><th>节点进度</th><th>当前执行人</th><th>时限</th><th>异常</th><th>操作</th></tr></thead><tbody><tr v-for="row in pagedRows" :key="row.order.order_id" @click="openProcess(row)"><td><strong>{{ row.order.order_no }}</strong><small>编号 {{ row.order.order_id }}</small></td><td><strong>{{ row.order.clinic_name || '客户暂未记录' }}</strong><small>{{ productLabel(row.order.product_type) }}</small></td><td>{{ processCurrent(row)?.process_name || (row.failed ? '暂时无法查看' : '尚未生成工序') }}</td><td><div class="arp-progress"><i :style="{ width: `${processProgress(row)}%` }" /></div><small>{{ row.instance?.nodes?.filter((node: Row) => node.node_status === 'COMPLETED').length ?? 0 }}/{{ row.instance?.nodes?.length ?? 0 }} · {{ processProgress(row) }}%</small></td><td>{{ processCurrent(row)?.assigned_user_id ? `员工 ${processCurrent(row).assigned_user_id}` : '待派工' }}</td><td>{{ compactDate(processCurrent(row)?.deadline_at) }}</td><td><i v-if="processCurrent(row)?.deadline_at && new Date(processCurrent(row).deadline_at) < new Date()" class="arp-badge danger">已超时</i><span v-else>无</span></td><td><button @click.stop="openProcess(row)">查看</button></td></tr></tbody></table></div><footer class="arp-pagination"><span>共 {{ currentRows.length }} 单</span><div><button :disabled="page <= 1" @click="page--">上一页</button><b>{{ page }}</b><button :disabled="page >= pageCount" @click="page++">下一页</button></div></footer></div>
    </template>

    <template v-else-if="activeRoute === '/production/quality'">
      <div class="arp-metric-band"><article><span>出检订单</span><strong>{{ qualitySummary?.inspected_order_count ?? 0 }}</strong></article><article><span>一次通过率</span><strong>{{ qualitySummary?.first_pass_rate ?? 0 }}%</strong></article><article><span>终检通过率</span><strong>{{ qualitySummary?.final_pass_rate ?? 0 }}%</strong></article><article><span>总返工率</span><strong>{{ qualitySummary?.total_rework_rate ?? 0 }}%</strong></article><article><span>内返 / 外返</span><strong>{{ qualitySummary?.internal_rework_count ?? 0 }} / {{ qualitySummary?.external_rework_count ?? 0 }}</strong></article><article><span>投诉 / 退货</span><strong>{{ qualitySummary?.complaint_rate ?? 0 }}% / {{ qualitySummary?.return_rate ?? 0 }}%</strong></article></div>
      <div class="arp-table-card arp-metric-table"><div class="arp-toolbar"><label class="arp-search"><span>⌕</span><input v-model="keyword" placeholder="搜索订单或问题原因"></label><select v-model="statusFilter"><option value="ALL">全部问题</option><option value="内返">内返</option><option value="外返">外返</option><option value="PENDING">待处理</option><option value="CLOSED">已关闭</option></select><button @click="clearFilters">清空</button><em>问题记录 {{ filteredQuality.length }} 条</em></div><div class="arp-table-scroll"><table class="arp-wide"><thead><tr><th>问题类型</th><th>订单</th><th>客户 / 产品</th><th>来源</th><th>原因</th><th>责任依据</th><th>处理状态</th><th>发生 / 更新</th><th>操作</th></tr></thead><tbody><tr v-for="row in pagedRows" :key="row.rework_id ?? row.quality_record_id" @click="openDrawer('质量问题详情', 'quality', row)"><td><i class="arp-badge" :class="row.issue_type === '外返' ? 'danger' : 'warning'">{{ row.issue_type }}</i></td><td><strong>{{ row.order_no || `订单 ${row.order_id}` }}</strong></td><td><strong>{{ row.clinic_name || '客户暂未记录' }}</strong><small>{{ productLabel(row.product_type) }}</small></td><td>{{ row.source }}</td><td>{{ row.reason_detail || row.reason_category || '暂未记录' }}</td><td>{{ row.issue_type === '外返' ? '当前责任信息以客服登记结果为准' : statusLabel(row.responsibility_type) }}</td><td>{{ statusLabel(row.status) }}</td><td>{{ compactDate(row.updated_at || row.status_updated_at || row.created_at) }}</td><td><button @click.stop="openDrawer('质量问题详情', 'quality', row)">查看</button></td></tr></tbody></table></div><div v-if="filteredQuality.length === 0" class="arp-empty">当前还没有可查看的质量问题记录</div></div>
    </template>

    <template v-else-if="activeRoute === '/performance'">
      <div class="arp-table-card arp-fill-card"><div class="arp-toolbar"><label class="arp-search"><span>⌕</span><input v-model="keyword" placeholder="搜索员工、账号或部门"></label><button @click="refresh">刷新</button><button @click="clearFilters">清空</button><em>当前比较 {{ filteredPerformance.length }} 人</em></div><div class="arp-table-scroll"><table class="arp-wide arp-performance-table"><thead><tr><th>员工</th><th>完成工序</th><th>有效 / 标准工时</th><th>标准覆盖率</th><th>准时率</th><th>通过率</th><th>工时效率</th><th>生产责任返工</th><th>未归因返工</th><th>绩效参考分</th><th>操作</th></tr></thead><tbody><tr v-for="row in pagedRows" :key="row.staff.user_id" @click="openPerformance(row)"><td><span class="arp-person-avatar">{{ (row.staff.display_name || row.staff.username || '员').slice(0, 1) }}</span><strong>{{ row.staff.display_name || row.staff.username }}</strong><small>{{ row.staff.department_name || '部门暂未记录' }} · {{ row.staff.post_names?.join(' / ') || '岗位暂未记录' }}</small></td><template v-if="!row.failed"><td>{{ row.stats.completed_count }}</td><td>{{ row.stats.effective_duration }} / {{ row.stats.standard_duration }} 分钟</td><td>{{ row.stats.standard_coverage_rate }}%</td><td>{{ row.stats.on_time_rate }}%</td><td>{{ row.stats.pass_rate }}%</td><td>{{ row.stats.duration_efficiency }}%</td><td>{{ row.stats.responsible_rework_count }}</td><td>{{ row.stats.unclassified_rework_count }}</td><td><strong class="arp-score">{{ row.stats.performance_score }}</strong><small>仅供绩效分析</small></td></template><template v-else><td colspan="9"><span class="arp-row-failed">该员工数据暂时无法加载</span></td></template><td><button @click.stop="openPerformance(row)">查看</button></td></tr></tbody></table></div><footer class="arp-pagination"><span>只使用当前可见员工与真实绩效结果</span><div><button :disabled="page <= 1" @click="page--">上一页</button><b>{{ page }}</b><button :disabled="page >= pageCount" @click="page++">下一页</button></div></footer></div>
    </template>

    <template v-else-if="['/production/devices', '/production/material-exceptions', '/production/safety-environment', '/production/cost-management'].includes(activeRoute)">
      <nav v-if="activeRoute === '/production/devices'" class="arp-primary-tabs"><button :class="{ active: equipmentTab === 'list' }" @click="equipmentTab = 'list'">设备清单</button><button :class="{ active: equipmentTab === 'approval' }" @click="equipmentTab = 'approval'">审批事项</button></nav>
      <nav v-if="activeRoute === '/production/safety-environment'" class="arp-primary-tabs"><button :class="{ active: safetyTab === 'supervision' }" @click="safetyTab = 'supervision'">检查监督</button><button :class="{ active: safetyTab === 'rules' }" @click="safetyTab = 'rules'">检查规则</button></nav>
      <div class="arp-metric-band"><article v-for="card in supportCards" :key="card[0]"><span>{{ card[0] }}</span><strong>{{ card[1] ?? 0 }}</strong></article></div>
      <div class="arp-table-card arp-metric-table"><div class="arp-toolbar"><label class="arp-search"><span>⌕</span><input disabled :placeholder="activeRoute === '/production/devices' ? '搜索设备编号或名称' : activeRoute === '/production/material-exceptions' ? '搜索异常编号或物料' : activeRoute === '/production/safety-environment' ? '搜索部门或检查规则' : '搜索成本或订单编号'"></label><select disabled><option>全部状态</option></select><button @click="refresh">刷新</button><em>更新于 {{ compactDate(supportSummary?.generated_at) }}</em></div><div class="arp-placeholder-table"><div class="arp-placeholder-head"><span>业务对象</span><span>关联范围</span><span>当前状态</span><span>最近更新</span><span>操作</span></div><div class="arp-empty arp-empty-large"><span>{{ activeRoute === '/production/devices' ? '⚙️' : activeRoute === '/production/material-exceptions' ? '⚠️' : activeRoute === '/production/safety-environment' ? '🛡️' : '📊' }}</span><strong>{{ supportEmptyText }}</strong><p>当前总体数据已经真实展示，明细纳入后将在此处提供查询和追溯。</p></div></div></div>
    </template>

    <template v-else-if="activeRoute === '/system/form-configs'">
      <div class="arp-table-card arp-fill-card"><div class="arp-toolbar"><label class="arp-search"><span>⌕</span><input v-model="keyword" placeholder="搜索产品名称、类型或材料"></label><select v-model="statusFilter"><option value="ALL">全部状态</option><option value="ACTIVE">启用</option><option value="INACTIVE">停用</option></select><button @click="clearFilters">清空</button><em>共 {{ filteredProducts.length }} 个产品</em></div><div class="arp-table-scroll"><table class="arp-wide"><thead><tr><th>产品名称</th><th>产品类型</th><th>材料规格</th><th>基础价格</th><th>币种</th><th>启用状态</th><th>价格备注</th><th>更新时间</th><th>操作</th></tr></thead><tbody><tr v-for="row in pagedRows" :key="row.product_id" @click="openDrawer('产品详情', 'product', row)"><td><span class="arp-product-icon">🦷</span><strong>{{ row.product_name }}</strong><small>产品编号 {{ row.product_id }}</small></td><td>{{ productLabel(row.product_type) }}</td><td>{{ row.material_spec || '暂未维护' }}</td><td>{{ row.base_price_cents <= 1 ? '价格待确认' : amount(row.base_price_cents, row.currency) }}</td><td>{{ row.currency }}</td><td><i class="arp-badge" :class="row.status === 'ACTIVE' ? 'ok' : 'muted'">{{ statusLabel(row.status) }}</i></td><td>{{ row.price_note || '暂无备注' }}</td><td>{{ compactDate(row.updated_at) }}</td><td><button @click.stop="openDrawer('产品详情', 'product', row)">查看</button></td></tr></tbody></table></div><footer class="arp-pagination"><span>管理端只读查看客服端维护结果</span><div><button :disabled="page <= 1" @click="page--">上一页</button><b>{{ page }}</b><button :disabled="page >= pageCount" @click="page++">下一页</button></div></footer></div>
    </template>

    <template v-else-if="activeRoute === '/notifications'">
      <div class="arp-table-card arp-fill-card"><div class="arp-toolbar"><div class="arp-segment"><button :class="{ active: notificationTab === 'all' }" @click="notificationTab = 'all'">全部</button><button :class="{ active: notificationTab === 'unread' }" @click="notificationTab = 'unread'">未读 <b>{{ unreadCount }}</b></button></div><button :disabled="notificationsLoading" @click="emit('refreshNotifications')">刷新</button><button :disabled="unreadCount === 0" @click="emit('markAllNotificationsRead')">全部已读</button><em>当前账号 {{ filteredNotices.length }} 条通知</em></div><div v-if="notificationError" class="arp-state arp-state-error">{{ businessFailure }}</div><div v-else class="arp-table-scroll"><table class="arp-wide"><thead><tr><th>类型</th><th>通知内容</th><th>关联订单</th><th>已读状态</th><th>送达 / 创建时间</th><th>操作</th></tr></thead><tbody><tr v-for="row in pagedRows" :key="row.notification_id" :class="{ 'is-unread': !row.read_at }"><td><span class="arp-notice-dot" :class="{ active: !row.read_at }" />{{ noticeLabel(row.event) }}</td><td><strong>{{ row.message || '业务状态已更新' }}</strong></td><td><button v-if="row.order_id" class="arp-order-link" @click="emit('openOrder', row.order_id)">{{ row.order_no || `订单 ${row.order_id}` }}</button><span v-else>无关联订单</span></td><td><i class="arp-badge" :class="row.read_at ? 'muted' : 'info'">{{ row.read_at ? '已读' : '未读' }}</i></td><td>{{ compactDate(row.delivered_at || row.created_at) }}</td><td><button v-if="!row.read_at" @click="emit('markNotificationRead', row.notification_id)">标记已读</button><span v-else>已完成</span></td></tr></tbody></table></div><div v-if="filteredNotices.length === 0 && !notificationsLoading" class="arp-empty">当前没有{{ notificationTab === 'unread' ? '未读' : '' }}业务通知</div><footer class="arp-pagination"><span>实时更新不会改变当前滚动位置</span><div><button :disabled="page <= 1" @click="page--">上一页</button><b>{{ page }}</b><button :disabled="page >= pageCount" @click="page++">下一页</button></div></footer></div>
    </template>

    <template v-else-if="activeRoute === '/admin/ai-governance'">
      <div class="arp-ai-card">
        <div class="arp-ai-metrics">
          <article><span>24 小时成功调用</span><strong>{{ aiSummary?.success_count ?? 0 }}</strong><small>全平台总量</small></article>
          <article><span>安全拒答</span><strong>{{ aiSummary?.safe_refusal_count ?? 0 }}</strong><small>风险请求已拦截</small></article>
          <article><span>服务异常</span><strong>{{ aiSummary?.model_failed_count ?? 0 }}</strong><small>模型失败</small></article>
          <article><span>预计费用 / 每日预算</span><strong>{{ microUsd(aiSummary?.estimated_cost_microusd) }}</strong><small>{{ Number(aiSummary?.daily_budget_microusd ?? 0) > 0 ? microUsd(aiSummary?.daily_budget_microusd) : '暂未设置每日预算' }}</small></article>
        </div>

        <div class="arp-ai-grid">
          <section class="arp-trend-card">
            <header class="arp-trend-header">
              <div class="arp-trend-title">
                <span class="arp-icon-chip">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17l5-5 4 3 7-8"/><path d="M15 7h5v5"/></svg>
                </span>
                <div><strong>近 7 日用量和成本趋势</strong><small>全平台成功调用与预计费用</small></div>
              </div>
              <div class="arp-trend-meta">
                <span>{{ aiDateRange }}</span>
                <i class="arp-legend-call">调用量</i>
                <i class="arp-legend-cost">预计成本</i>
              </div>
            </header>

            <div class="arp-trend-plot">
              <svg viewBox="0 0 600 200" preserveAspectRatio="xMidYMid meet" role="img" aria-label="近七日调用量和预计成本趋势图">
                <defs>
                  <linearGradient id="arp-ai-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#3b82f6" stop-opacity=".22"/>
                    <stop offset="1" stop-color="#3b82f6" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <line v-for="y in [44, 100, 156]" :key="y" x1="44" :y1="y" x2="556" :y2="y" class="arp-grid-line"/>
                <path v-if="aiHasActivity" :d="aiAreaPath" class="arp-call-area"/>
                <polyline v-if="aiHasActivity" :points="aiPolyline" class="arp-call-line"/>
                <polyline v-if="aiHasCost" :points="aiCostPolyline" class="arp-cost-line"/>
                <line v-if="aiHasActivity && aiHoverIndex !== null" :x1="aiActiveChartPoint.x" y1="36" :x2="aiActiveChartPoint.x" y2="156" class="arp-hover-line"/>
                <circle v-if="aiHasActivity" :cx="aiActiveChartPoint.x" :cy="aiActiveChartPoint.y" r="5" class="arp-active-dot"/>
                <circle v-if="aiHasCost" :cx="aiActiveChartPoint.x" :cy="aiActiveChartPoint.costY" r="4" class="arp-active-cost-dot"/>
                <g v-if="aiHasActivity && aiHoverIndex !== null" :transform="`translate(${Math.min(428, Math.max(26, aiActiveChartPoint.x - 70))}, 6)`" class="arp-chart-tooltip">
                  <rect width="144" height="36" rx="8"/>
                  <text x="10" y="15">{{ aiActiveChartPoint.date.slice(5).replace('-', '/') }} · 调用 {{ aiActiveChartPoint.success_count }} 次</text>
                  <text x="10" y="29">预计费用 {{ microUsd(aiActiveChartPoint.estimated_cost_microusd) }}</text>
                </g>
                <g v-for="(point, index) in aiChartPoints" :key="point.date">
                  <rect :x="point.x - 42" y="38" width="84" height="126" class="arp-hover-zone" tabindex="0" @mouseenter="aiHoverIndex = index" @mouseleave="aiHoverIndex = null" @focus="aiHoverIndex = index" @blur="aiHoverIndex = null"/>
                  <text :x="point.x" y="187" text-anchor="middle" class="arp-axis-label">{{ point.date.slice(5).replace('-', '/') }}</text>
                </g>
              </svg>
              <div v-if="!aiHasActivity" class="arp-chart-empty"><span>近 7 日暂无成功调用</span><small>发生真实调用后将在这里形成趋势</small></div>
            </div>

            <footer class="arp-trend-summary">
              <article><span>7 日成功</span><strong>{{ aiTrend?.total_success_count ?? 0 }} 次</strong></article>
              <article><span>活跃天数</span><strong>{{ aiPoints.filter((item) => item.success_count > 0).length }} 天</strong></article>
              <article><span>预计费用</span><strong>{{ microUsd(aiTrend?.total_estimated_cost_microusd) }}</strong></article>
            </footer>
          </section>

          <div class="arp-ai-side">
            <section class="arp-risk-card">
              <header><strong>风险状态</strong><span>近 24 小时</span></header>
              <div class="arp-risk-grid">
                <article><i class="blue"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 4.6-2.9 7.8-7 10-4.1-2.2-7-5.4-7-10V6l7-3z"/><path d="M9 12l2 2 4-5"/></svg></i><span>安全拒答</span><b>{{ aiSummary?.safe_refusal_count ?? 0 }}</b></article>
                <article><i class="cyan"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg></i><span>访问限流</span><b>{{ aiSummary?.rate_limited_count ?? 0 }}</b></article>
                <article><i class="orange"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l9 16H3L12 4z"/><path d="M12 9v5m0 3h.01"/></svg></i><span>模型失败</span><b>{{ aiSummary?.model_failed_count ?? 0 }}</b></article>
                <article><i class="violet"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16h12l-2-3V9a4 4 0 00-8 0v4l-2 3z"/><path d="M10 19h4"/></svg></i><span>预算提醒</span><b>{{ aiSummary?.budget_alert_count ?? 0 }}</b></article>
              </div>
            </section>

            <section class="arp-budget-card">
              <header><strong>预算状态</strong><span :class="{ danger: aiSummary?.budget_exceeded }">{{ aiSummary?.budget_exceeded ? '已触发保护' : '运行正常' }}</span></header>
              <div class="arp-budget">
                <span>当前预计费用</span>
                <strong>{{ microUsd(aiSummary?.estimated_cost_microusd) }}</strong>
                <div class="arp-budget-meta"><span>今日使用比例</span><b>{{ Number(aiSummary?.daily_budget_microusd ?? 0) > 0 ? `${aiBudgetPercent.toFixed(1)}%` : '—' }}</b></div>
                <div class="arp-progress"><i :style="{ width: `${aiBudgetPercent}%` }"/></div>
                <small>{{ Number(aiSummary?.daily_budget_microusd ?? 0) > 0 ? `每日预算 ${microUsd(aiSummary?.daily_budget_microusd)}` : '暂未设置每日预算' }}</small>
              </div>
            </section>
          </div>
        </div>
      </div>
    </template>

    <div v-if="drawerVisible" class="arp-drawer-layer" @click.self="closeDrawer"><aside class="arp-drawer" role="dialog" aria-modal="true" :aria-label="drawerTitle"><header><div><span>只读业务详情</span><h2>{{ drawerTitle }}</h2></div><button aria-label="关闭" @click="closeDrawer">×</button></header><div class="arp-drawer-body"><div v-if="drawerLoading" class="arp-state"><span class="arp-spinner" />正在加载详情…</div><template v-else-if="drawerKind === 'client' && drawerData"><section class="arp-profile-banner"><i>🏥</i><div><strong>{{ drawerData.clinic_name }}</strong><span>客户编号 {{ drawerData.clinic_id }} · {{ statusLabel(drawerData.status) }}</span></div></section><section class="arp-detail-section"><header><span>01</span><div><h3>客户档案</h3><small>由客服端维护</small></div></header><dl><div><dt>联系人</dt><dd>{{ drawerData.contact_name || '暂未维护' }}</dd></div><div><dt>联系电话</dt><dd>{{ drawerData.contact_phone || '暂未维护' }}</dd></div><div><dt>建档时间</dt><dd>{{ compactDate(drawerData.created_at) }}</dd></div><div><dt>最近维护</dt><dd>{{ compactDate(drawerData.updated_at) }}</dd></div></dl></section><section class="arp-detail-section"><header><span>02</span><div><h3>客户贡献</h3><small>本月真实统计</small></div></header><dl><div><dt>排名</dt><dd>{{ drawerData.ranking ? `第 ${clientSummary?.top_customers?.findIndex((item: Row) => item.clinic_id === drawerData.clinic_id) + 1} 名` : '暂未进入排名' }}</dd></div><div><dt>订单 / 件数</dt><dd>{{ drawerData.ranking?.order_count ?? '暂未统计' }} / {{ drawerData.ranking?.item_count ?? '暂未统计' }}</dd></div><div><dt>接单金额</dt><dd>暂未统计</dd></div><div><dt>出货金额</dt><dd>暂未统计</dd></div></dl></section><section class="arp-detail-section"><header><span>03</span><div><h3>制作偏好</h3><small>全部只读</small></div></header><dl><div v-for="(value, key) in drawerData.preference?.preferences ?? {}" :key="key"><dt>{{ key }}</dt><dd>{{ value || '暂未维护' }}</dd></div></dl><p v-if="!Object.keys(drawerData.preference?.preferences ?? {}).length" class="arp-detail-note">当前客户暂未维护制作偏好</p></section><p class="arp-readonly-note">客户资料由客服端维护，管理端仅用于经营与服务关系分析。</p></template><template v-else-if="drawerKind === 'delivery' && drawerData"><section class="arp-profile-banner"><i>📦</i><div><strong>{{ drawerData.order_no }}</strong><span>{{ productLabel(drawerData.product_type) }} · {{ statusLabel(drawerData.external_status) }}</span></div></section><section class="arp-detail-section"><header><span>01</span><div><h3>账单信息</h3><small>真实账单状态</small></div></header><dl><div><dt>账单状态</dt><dd>{{ statusLabel(drawerData.bill?.bill_status || drawerData.bill_status) }}</dd></div><div><dt>付款状态</dt><dd>{{ statusLabel(drawerData.bill?.payment_status || drawerData.payment_status) }}</dd></div><div><dt>账单金额</dt><dd>{{ amount(drawerData.bill?.amount_cents, drawerData.bill?.currency || 'CNY') }}</dd></div><div><dt>收款记录</dt><dd>{{ drawerData.payments?.length ?? 0 }} 条</dd></div></dl></section><section class="arp-detail-section"><header><span>02</span><div><h3>配送信息</h3><small>系统人工维护状态</small></div></header><dl><div><dt>承运商</dt><dd>{{ drawerData.logistics?.carrier || drawerData.carrier || '暂未记录' }}</dd></div><div><dt>运单号</dt><dd>{{ drawerData.logistics?.tracking_no || drawerData.tracking_no || '暂未记录' }}</dd></div><div><dt>配送状态</dt><dd>{{ statusLabel(drawerData.logistics?.logistics_status || drawerData.logistics_status) }}</dd></div><div><dt>配送地区</dt><dd>尚未维护</dd></div></dl></section></template><template v-else-if="drawerKind === 'process' && drawerData"><section class="arp-profile-banner"><i>⚙️</i><div><strong>{{ drawerData.order.order_no }}</strong><span>{{ productLabel(drawerData.order.product_type) }} · 进度 {{ processProgress(drawerData) }}%</span></div></section><p v-if="!drawerData.instance" class="arp-detail-note">当前订单尚未生成可查看的工序记录</p><section v-else class="arp-timeline"><article v-for="node in drawerData.instance.nodes" :key="node.node_instance_id"><i :class="node.node_status.toLowerCase()">{{ node.node_status === 'COMPLETED' ? '✓' : node.step_order }}</i><div><header><strong>{{ node.process_name }}</strong><span>{{ statusLabel(node.node_status) }}</span></header><p>执行人：{{ node.assigned_user_id ? `员工 ${node.assigned_user_id}` : '待派工' }}</p><small>开始 {{ compactDate(node.started_at) }} · 完成 {{ compactDate(node.completed_at) }} · 时限 {{ compactDate(node.deadline_at) }}</small></div></article></section><p class="arp-readonly-note">工序和派工信息由生产端维护，管理端仅查看生产进度并监督异常。</p></template><template v-else-if="drawerKind === 'quality' && drawerData"><section class="arp-profile-banner"><i>🔍</i><div><strong>{{ drawerData.order_no || `订单 ${drawerData.order_id}` }}</strong><span>{{ drawerData.issue_type }} · {{ statusLabel(drawerData.status) }}</span></div></section><section class="arp-detail-section"><header><span>01</span><div><h3>问题事实</h3><small>{{ drawerData.source }}</small></div></header><dl><div><dt>问题原因</dt><dd>{{ drawerData.reason_detail || drawerData.reason_category || '暂未记录' }}</dd></div><div><dt>发生时间</dt><dd>{{ compactDate(drawerData.created_at) }}</dd></div><div><dt>目标工序</dt><dd>{{ drawerData.target_process_name || '暂未记录' }}</dd></div><div><dt>影响节点</dt><dd>{{ drawerData.impacted_node_count ?? '暂未统计' }}</dd></div></dl></section><section class="arp-detail-section"><header><span>02</span><div><h3>责任与处理</h3><small>管理监督依据</small></div></header><dl><div><dt>责任依据</dt><dd>{{ drawerData.issue_type === '外返' ? '当前责任信息以客服登记结果为准' : statusLabel(drawerData.responsibility_type) }}</dd></div><div><dt>处理状态</dt><dd>{{ statusLabel(drawerData.status) }}</dd></div><div><dt>关闭说明</dt><dd>{{ drawerData.close_note || drawerData.status_note || '暂未记录' }}</dd></div><div><dt>最近更新</dt><dd>{{ compactDate(drawerData.updated_at || drawerData.status_updated_at) }}</dd></div></dl></section></template><template v-else-if="drawerKind === 'performance' && drawerData"><section class="arp-profile-banner"><i>{{ (drawerData.staff.display_name || drawerData.staff.username || '员').slice(0, 1) }}</i><div><strong>{{ drawerData.staff.display_name || drawerData.staff.username }}</strong><span>{{ drawerData.staff.department_name || '部门暂未记录' }} · 绩效参考分 {{ drawerData.stats?.performance_score ?? '暂未统计' }}</span></div></section><section class="arp-detail-section"><header><span>01</span><div><h3>绩效依据</h3><small>仅供绩效分析，不作为工资结算结果</small></div></header><dl><div><dt>完成工序</dt><dd>{{ drawerData.stats?.completed_count ?? '暂未统计' }}</dd></div><div><dt>有效 / 标准工时</dt><dd>{{ drawerData.stats?.effective_duration ?? '—' }} / {{ drawerData.stats?.standard_duration ?? '—' }} 分钟</dd></div><div><dt>准时 / 通过率</dt><dd>{{ drawerData.stats?.on_time_rate ?? '—' }}% / {{ drawerData.stats?.pass_rate ?? '—' }}%</dd></div><div><dt>公式版本</dt><dd>{{ drawerData.stats?.performance_formula_version || '暂未记录' }}</dd></div></dl></section><section class="arp-detail-section"><header><span>02</span><div><h3>工时明细</h3><small>{{ drawerData.details?.length ?? 0 }} 条</small></div></header><div class="arp-detail-list"><article v-for="item in drawerData.details ?? []" :key="item.work_log_id"><strong>{{ item.order_no }} · {{ item.node_name }}</strong><span>有效 {{ item.effective_duration ?? '—' }} / 标准 {{ item.standard_duration ?? '—' }} 分钟</span><small>{{ compactDate(item.started_at) }} – {{ compactDate(item.completed_at) }}</small></article><p v-if="!(drawerData.details?.length)" class="arp-detail-note">当前没有可查看的工时明细</p></div></section></template><template v-else-if="drawerKind === 'product' && drawerData"><section class="arp-profile-banner"><i>🦷</i><div><strong>{{ drawerData.product_name }}</strong><span>{{ productLabel(drawerData.product_type) }} · {{ statusLabel(drawerData.status) }}</span></div></section><section class="arp-detail-section"><header><span>01</span><div><h3>产品资料</h3><small>客服端维护结果</small></div></header><dl><div><dt>材料规格</dt><dd>{{ drawerData.material_spec || '暂未维护' }}</dd></div><div><dt>基础价格</dt><dd>{{ drawerData.base_price_cents <= 1 ? '价格待确认' : amount(drawerData.base_price_cents, drawerData.currency) }}</dd></div><div><dt>币种</dt><dd>{{ drawerData.currency }}</dd></div><div><dt>价格备注</dt><dd>{{ drawerData.price_note || '暂无备注' }}</dd></div><div><dt>创建时间</dt><dd>{{ compactDate(drawerData.created_at) }}</dd></div><div><dt>最近更新</dt><dd>{{ compactDate(drawerData.updated_at) }}</dd></div></dl></section><p class="arp-readonly-note">管理端只读查看产品资料，不提供产品配置或下单模板设置。</p></template><template v-else-if="drawerKind === 'dictionary'"><div class="arp-dictionary-tabs"><button :class="{ active: dictionaryType === 'REASON_CATEGORY' }" @click="dictionaryType = 'REASON_CATEGORY'">返工原因</button><button :class="{ active: dictionaryType === 'RESPONSIBILITY_TYPE' }" @click="dictionaryType = 'RESPONSIBILITY_TYPE'">责任类型</button></div><div v-if="dictionaryLoading" class="arp-state">正在加载设置…</div><div v-else-if="dictionaryError" class="arp-state arp-state-error">{{ businessFailure }}</div><div v-else class="arp-dictionary-layout"><div class="arp-dictionary-list"><button v-for="item in dictionaryItems" :key="item.item_id" :class="{ active: selectedDictionaryId === item.item_id }" @click="selectDictionary(item)"><span>{{ item.label }}</span><i class="arp-badge" :class="item.status === 'ACTIVE' ? 'ok' : 'muted'">{{ statusLabel(item.status) }}</i></button></div><div class="arp-dictionary-form"><label><span>业务名称</span><input v-model="dictionaryLabel"></label><label><span>显示顺序</span><input v-model.number="dictionarySort" type="number"></label><p>生产端和客服端只读取启用设置，管理端修改会保留真实业务记录。</p><button :disabled="dictionarySaving || !selectedDictionaryId" @click="saveDictionary">{{ dictionarySaving ? '保存中…' : '保存设置' }}</button><small v-if="dictionaryMessage">{{ dictionaryMessage }}</small></div></div></template></div><footer><span>按 Esc、点击遮罩或关闭按钮均可退出</span><button @click="closeDrawer">关闭</button></footer></aside></div>
  </section>
</template>

<style scoped src="../admin-remaining-pages.css"></style>
<style scoped src="../admin-ai-polish.css"></style>
