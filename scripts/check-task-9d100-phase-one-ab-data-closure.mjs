import fs from 'node:fs'

const files = {
  app: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  packageJson: fs.readFileSync('package.json', 'utf8'),
  status: fs.readFileSync('STATUS.md', 'utf8'),
  decisions: fs.readFileSync('DECISIONS.md', 'utf8'),
  tasks: fs.readFileSync('tasks/README.md', 'utf8'),
  task: fs.readFileSync('tasks/TASK-005-phase-one-ab-data-closure-20260707.md', 'utf8'),
  goal: fs.readFileSync('goals/GOAL-004-phase-one-ab-data-closure-20260707.md', 'utf8'),
  readme: fs.readFileSync('README.md', 'utf8'),
  acceptance: fs.readFileSync('acceptance.json', 'utf8'),
  scope: fs.readFileSync('docs/acceptance/phase-one-scope-baseline-20260706.md', 'utf8'),
  frontendScope: fs.readFileSync('docs/acceptance/phase-one-frontend-task-scope.md', 'utf8'),
  frontendAlignment: fs.readFileSync('docs/acceptance/phase-one-frontend-alignment.md', 'utf8'),
  task8Matrix: fs.readFileSync('docs/acceptance/task-8-acceptance-matrix.md', 'utf8'),
  readiness: fs.readFileSync('docs/deployment/readiness-checklist.md', 'utf8')
}

const requiredFragments = [
  [files.packageJson, 'package.json', 'check:task9d100'],
  [files.app, 'frontend/src/App.vue', 'type PhaseOneAbDashboardSource'],
  [files.app, 'frontend/src/App.vue', 'phaseOneAbDashboardDataLoading'],
  [files.app, 'frontend/src/App.vue', 'loadPhaseOneAbDashboardData'],
  [files.app, 'frontend/src/App.vue', "apiFetch<InternalOrderListResponse>('/orders?page=1&size=100')"],
  [files.app, 'frontend/src/App.vue', "apiFetch<MessageItem[]>('/messages/pending-review')"],
  [files.app, 'frontend/src/App.vue', "apiFetch<ProductionQualitySummaryResponse>('/production/quality/summary')"],
  [files.app, 'frontend/src/App.vue', "apiFetch<DeliveryOrderItem[]>('/logistics/orders?limit=50')"],
  [files.app, 'frontend/src/App.vue', 'phaseOneAbCsDashboardStats'],
  [files.app, 'frontend/src/App.vue', 'phaseOneAbProductionDashboardStats'],
  [files.app, 'frontend/src/App.vue', '复用 /orders 列表'],
  [files.app, 'frontend/src/App.vue', '复用物流人工状态'],
  [files.app, 'frontend/src/App.vue', 'PARTIAL：缺少月度趋势接口'],
  [files.status, 'STATUS.md', '9D.100 A/B 类一期范围对齐第二段'],
  [files.decisions, 'DECISIONS.md', 'D-145 任务 9D.100 A/B 类一期范围对齐第二段'],
  [files.tasks, 'tasks/README.md', '任务 9D.100：A/B 类一期范围对齐第二段'],
  [files.task, 'TASK-005-phase-one-ab-data-closure-20260707.md', 'Completion Record'],
  [files.goal, 'GOAL-004-phase-one-ab-data-closure-20260707.md', 'Status: `completed`'],
  [files.readme, 'README.md', 'npm run check:task9d100'],
  [files.acceptance, 'acceptance.json', '"active_goal": "GOAL-004"'],
  [files.acceptance, 'acceptance.json', 'npm run check:task9d100'],
  [files.frontendScope, 'phase-one-frontend-task-scope.md', '9D.100 A/B 类一期范围对齐第二段'],
  [files.frontendAlignment, 'phase-one-frontend-alignment.md', '9D.100 A/B 类一期范围对齐第二段'],
  [files.task8Matrix, 'task-8-acceptance-matrix.md', '9D.100 A/B 类一期范围对齐第二段'],
  [files.readiness, 'readiness-checklist.md', '9D.100 A/B 类一期范围对齐第二段']
]

const forbiddenAppFragments = [
  "title: '订单数量 / 件数', value: '12 / 38'",
  "title: '翻译待审', value: '4'",
  "title: '账单超期', value: '3'",
  "label: '本月 / 上月对比', value: '+16%'",
  "label: '十大客户排名', value: '按件数'",
  "title: '生产异常', value: '7'",
  "title: '待问异常', value: '2'",
  "title: '质量与返工', value: '3'",
  "label: '部门今日 vs 上月平均', value: '+8%'",
  "label: '出货率', value: '86%'",
  "label: '完成率', value: '78%'",
  "label: '返工率', value: '4.3%'",
  "label: '内返 / 外返', value: '2 / 1'",
  "label: '内返率', value: '3.2%'",
  "label: '外返率', value: '1.1%'"
]

const forbiddenDocFragments = [
  '真实支付平台已接入并验收',
  '真实物流平台已接入并验收',
  '真实 DeepSeek key 已联调完成',
  '真实客户签字已完成且无阻塞',
  'Task 8 状态：READY / 可上线'
]

const failures = []

for (const [content, file, fragment] of requiredFragments) {
  if (!content.includes(fragment)) {
    failures.push(`${file} missing required text: ${fragment}`)
  }
}

for (const fragment of forbiddenAppFragments) {
  if (files.app.includes(fragment)) {
    failures.push(`frontend/src/App.vue still contains display-only A/B dashboard value: ${fragment}`)
  }
}

for (const [fileName, content] of Object.entries(files)) {
  if (fileName === 'acceptance') {
    continue
  }
  for (const fragment of forbiddenDocFragments) {
    if (content.includes(fragment)) {
      failures.push(`${fileName} contains forbidden fake completion text: ${fragment}`)
    }
  }
}

if (!files.scope.includes('Task 8 仍保持 `NOT_READY`')) {
  failures.push('scope baseline must keep Task 8 NOT_READY')
}

if (!files.readiness.includes('设备 / 物料 / 安环 / 成本 / 奖惩') || !files.readiness.includes('PARTIAL')) {
  failures.push('readiness checklist must keep production support modules as PARTIAL')
}

if (failures.length > 0) {
  console.error('task 9D.100 phase-one A/B data closure check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('task 9D.100 phase-one A/B data closure check ok')
