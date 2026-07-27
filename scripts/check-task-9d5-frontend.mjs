import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const remainingPages = fs.readFileSync('frontend/src/components/AdminRemainingPages.vue', 'utf8')
const viteConfig = fs.readFileSync('frontend/vite.config.ts', 'utf8')

const requiredAppFragments = [
  'type ProcessInstanceDetail',
  'type ProcessNodeItem',
  'type WorkerTaskItem',
  'processInstanceOrders',
  'selectedProcessInstance',
  'loadProcessInstancePage',
  'loadProcessInstanceOrders',
  'loadProcessInstanceDetail',
  'assignSelectedProcessNode',
  'openProcessAssignmentDrawer',
  "const assignableStatuses = new Set(['PROCESS_INSTANCE_CREATED', 'PRODUCING', 'IN_PRODUCTION'])",
  "size: '100'",
  "['PENDING', 'READY', 'IN_PROGRESS'].includes(node.node_status) && !node.assigned_user_id",
  '可派工 / 调整',
  'data-testid="admin-process-assignment-page"',
  'data-testid="admin-process-assignment-drawer"',
  'class="admin-flow-node-list"',
  'loadWorkerTasks',
  'operateWorkerTask',
  '/workflow/process-instance',
  '/workflow/assign',
  "'/workflow/assign': 'admin-workflow'",
  "'admin-workflow': [",
  "{ label: '工序进度', routePath: '/workflow/process-instance' }",
  "{ label: '员工派工', routePath: '/workflow/assign' }",
  '/tasks/mine',
  '/process-instance/nodes/',
  '工序进度',
  '员工派工',
  '我的任务',
  '安排员工',
  '开始工作',
  '标记完成'
]

const requiredProxyFragments = [
  "'/orders'",
  "'/tasks'",
  "'/process-instance'"
]

const requiredProcessProgressFragments = [
  "statusFilter.value = props.activeRoute === '/workflow/process-instance' ? 'HAS_PROCESS' : 'ALL'",
  "request<Row>('/orders?page=1&size=100')",
  "type ProcessDisplayStatus = 'UNASSIGNED' | 'PRODUCING' | 'COMPLETED' | 'NO_PROCESS'",
  "statusFilter.value === 'HAS_PROCESS' && status !== 'NO_PROCESS'",
  'UNASSIGNED: 0',
  'PRODUCING: 1',
  'unfinishedNodes.some((node) => !node.assigned_user_id)',
  'function processAnomalyText(row: Row)',
  '<option value="HAS_PROCESS">已生成工序</option>',
  '<option value="NO_PROCESS">尚未生成工序</option>',
  "return summary.total ? `${summary.completed}/${summary.total} · ${summary.percent}%` : '未开始'"
]

const requiredDeliveryRegionFragments = [
  "type DeliveryRegionFilter = 'DOMESTIC' | 'INTERNATIONAL' | 'UNCLASSIFIED'",
  "const deliveryRegion = ref<DeliveryRegionFilter>('DOMESTIC')",
  'function deliveryRegionOf(item: Row): DeliveryRegionFilter',
  'const deliveryRegionCounts = computed<Record<DeliveryRegionFilter, number>>',
  "if (deliveryRegionOf(item) !== deliveryRegion.value) return false",
  'data-testid="delivery-region-domestic"',
  'data-testid="delivery-region-international"',
  'data-testid="delivery-region-unclassified"',
  '国内业务',
  '国外业务',
  '待归类'
]

const missing = [
  ...requiredAppFragments.filter((fragment) => !app.includes(fragment)).map((fragment) => `frontend/src/App.vue -> ${fragment}`),
  ...requiredProcessProgressFragments.filter((fragment) => !remainingPages.includes(fragment)).map((fragment) => `frontend/src/components/AdminRemainingPages.vue -> ${fragment}`),
  ...requiredDeliveryRegionFragments.filter((fragment) => !remainingPages.includes(fragment)).map((fragment) => `frontend/src/components/AdminRemainingPages.vue -> ${fragment}`),
  ...requiredProxyFragments.filter((fragment) => !viteConfig.includes(fragment)).map((fragment) => `frontend/vite.config.ts -> ${fragment}`)
]

if (missing.length > 0) {
  console.error('task 9D.5 frontend check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.5 frontend check ok')
