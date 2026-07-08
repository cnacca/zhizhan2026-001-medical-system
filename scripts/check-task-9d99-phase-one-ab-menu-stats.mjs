import fs from 'node:fs'

const files = {
  app: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  packageJson: fs.readFileSync('package.json', 'utf8'),
  status: fs.readFileSync('STATUS.md', 'utf8'),
  decisions: fs.readFileSync('DECISIONS.md', 'utf8'),
  tasks: fs.readFileSync('tasks/README.md', 'utf8'),
  readme: fs.readFileSync('README.md', 'utf8'),
  acceptance: fs.readFileSync('acceptance.json', 'utf8'),
  scope: fs.readFileSync('docs/acceptance/phase-one-scope-baseline-20260706.md', 'utf8'),
  frontendScope: fs.readFileSync('docs/acceptance/phase-one-frontend-task-scope.md', 'utf8'),
  frontendAlignment: fs.readFileSync('docs/acceptance/phase-one-frontend-alignment.md', 'utf8'),
  task8Matrix: fs.readFileSync('docs/acceptance/task-8-acceptance-matrix.md', 'utf8'),
  readiness: fs.readFileSync('docs/deployment/readiness-checklist.md', 'utf8')
}

const requiredFragments = [
  [files.packageJson, 'package.json', 'check:task9d99'],
  [files.app, 'frontend/src/App.vue', "title: '生产异常'"],
  [files.app, 'frontend/src/App.vue', "title: '物料管理'"],
  [files.app, 'frontend/src/App.vue', '待问异常'],
  [files.app, 'frontend/src/App.vue', '客服统计基础版'],
  [files.app, 'frontend/src/App.vue', '翻译待审'],
  [files.app, 'frontend/src/App.vue', '账单超期'],
  [files.app, 'frontend/src/App.vue', '客服经营看板'],
  [files.app, 'frontend/src/App.vue', '本月 vs 上月'],
  [files.app, 'frontend/src/App.vue', '销售额'],
  [files.app, 'frontend/src/App.vue', '已发货'],
  [files.app, 'frontend/src/App.vue', '返工数'],
  [files.app, 'frontend/src/App.vue', '周环比指标'],
  [files.app, 'frontend/src/App.vue', '返工率'],
  [files.app, 'frontend/src/App.vue', '发货率'],
  [files.app, 'frontend/src/App.vue', '投诉率'],
  [files.app, 'frontend/src/App.vue', '年度销售趋势'],
  [files.app, 'frontend/src/App.vue', '本月 / 上月对比'],
  [files.app, 'frontend/src/App.vue', '订单数量 / 件数'],
  [files.app, 'frontend/src/App.vue', '十大客户排名'],
  [files.app, 'frontend/src/App.vue', '销量 / 件数'],
  [files.app, 'frontend/src/App.vue', "v-if=\"portalTone !== 'cs'\""],
  [files.app, 'frontend/src/App.vue', '生产统计基础版'],
  [files.app, 'frontend/src/App.vue', '员工异常'],
  [files.app, 'frontend/src/App.vue', '部门今日 vs 上月平均'],
  [files.app, 'frontend/src/App.vue', '出货率'],
  [files.app, 'frontend/src/App.vue', '完成率'],
  [files.app, 'frontend/src/App.vue', '内返 / 外返'],
  [files.app, 'frontend/src/App.vue', '账单 / 物流人工状态'],
  [files.status, 'STATUS.md', '9D.99 A/B 类一期范围对齐第一段'],
  [files.decisions, 'DECISIONS.md', 'D-143 任务 9D.99 A/B 类一期范围对齐第一段'],
  [files.tasks, 'tasks/README.md', '任务 9D.99：A/B 类一期范围对齐第一段'],
  [files.readme, 'README.md', 'npm run check:task9d99'],
  [files.acceptance, 'acceptance.json', 'npm run check:task9d99'],
  [files.frontendScope, 'phase-one-frontend-task-scope.md', '9D.99 A/B 类一期范围对齐第一段'],
  [files.frontendAlignment, 'phase-one-frontend-alignment.md', '9D.99 A/B 类一期范围对齐第一段'],
  [files.task8Matrix, 'task-8-acceptance-matrix.md', '9D.99 A/B 类一期范围对齐第一段'],
  [files.readiness, 'readiness-checklist.md', '9D.99 A/B 类一期范围对齐第一段']
]

const forbiddenAppFragments = [
  "title: '工作单'",
  "title: '物料异常'",
  '代问异常',
  "title: '沟通待审'"
]

const failures = []

for (const [content, file, fragment] of requiredFragments) {
  if (!content.includes(fragment)) {
    failures.push(`${file} missing required text: ${fragment}`)
  }
}

for (const fragment of forbiddenAppFragments) {
  if (files.app.includes(fragment)) {
    failures.push(`frontend/src/App.vue still contains forbidden phase-one menu text: ${fragment}`)
  }
}

if (!files.scope.includes('Task 8 仍保持 `NOT_READY`')) {
  failures.push('scope baseline must keep Task 8 NOT_READY')
}

if (failures.length > 0) {
  console.error('task 9D.99 phase-one A/B menu and stats check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('task 9D.99 phase-one A/B menu and stats check ok')
