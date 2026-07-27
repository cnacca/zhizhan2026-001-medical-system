import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
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

const missing = [
  ...requiredAppFragments.filter((fragment) => !app.includes(fragment)).map((fragment) => `frontend/src/App.vue -> ${fragment}`),
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
