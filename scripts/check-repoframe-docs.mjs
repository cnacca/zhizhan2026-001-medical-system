import fs from 'node:fs'

const failures = []

const read = (file) => {
  if (!fs.existsSync(file)) {
    failures.push(`${file} missing`)
    return ''
  }
  return fs.readFileSync(file, 'utf8')
}

const requireText = (file, fragments) => {
  const content = read(file)
  for (const fragment of fragments) {
    if (!content.includes(fragment)) {
      failures.push(`${file} missing required text: ${fragment}`)
    }
  }
}

const forbidText = (file, fragments) => {
  const content = read(file)
  for (const fragment of fragments) {
    if (content.includes(fragment)) {
      failures.push(`${file} contains forbidden text: ${fragment}`)
    }
  }
}

const acceptance = JSON.parse(read('acceptance.json') || '{}')

if (!acceptance.active_goal || !String(acceptance.active_goal).startsWith('GOAL-')) {
  failures.push(`acceptance.json active_goal must be a GOAL id, got ${acceptance.active_goal}`)
}

if (!acceptance.active_goal_file || !fs.existsSync(acceptance.active_goal_file)) {
  failures.push(`acceptance.json active_goal_file must point to an existing goal file, got ${acceptance.active_goal_file}`)
}

const goals = new Map((acceptance.goals || []).map((goal) => [goal.id, goal]))
for (const [id, status] of [
  ['GOAL-001', 'superseded-for-current-execution'],
  ['GOAL-002', 'superseded'],
  ['GOAL-003', 'completed'],
  ['GOAL-004', 'completed'],
  ['GOAL-005', 'completed'],
  ['GOAL-006', 'completed'],
  ['GOAL-007', 'completed'],
  ['GOAL-008', 'completed']
]) {
  const goal = goals.get(id)
  if (!goal) {
    failures.push(`acceptance.json missing goal ${id}`)
    continue
  }
  if (goal.status !== status) {
    failures.push(`acceptance.json ${id} status expected ${status}, got ${goal.status}`)
  }
}

requireText('AGENTS.md', [
  '本项目保留 RepoFrame 文档作为协作证据',
  '不使用 Yuri workflow/SOP 作为默认流程',
  '不重跑 `initialize_repo.py`',
  'goals/GOAL-003-repoframe-doc-hydration-20260707.md',
  'tasks/TASK-004-repoframe-doc-hydration-20260707.md'
])

requireText('AGENT.md', [
  'GOAL-003 and TASK-004 are the current hydration route',
  'Do not run `initialize_repo.py`',
  'Task 8 remains `NOT_READY`'
])

requireText('STATUS.md', [
  'Active goal: `goals/GOAL-008-prd-v2-local-gap-closure-b-20260707.md`',
  'Active task: `tasks/TASK-009-prd-v2-local-gap-closure-b-20260707.md`',
  'GOAL-001 现在只作为历史初始化证据',
  'docs/development/workflow.md',
  'docs/development/phase-one-closure-technical-plan.md',
  '9D.100 A/B 类一期范围对齐第二段已完成',
  'Task 8'
])

requireText('README.md', [
  'RepoFrame `repo-hydrate` 后续执行',
  'goals/GOAL-006-phase-one-workflow-doc-20260707.md',
  'tasks/TASK-007-phase-one-workflow-doc-20260707.md',
  'goals/GOAL-007-prd-v2-local-gap-closure-a-20260707.md',
  'tasks/TASK-008-prd-v2-local-gap-closure-a-20260707.md',
  'goals/GOAL-008-prd-v2-local-gap-closure-b-20260707.md',
  'tasks/TASK-009-prd-v2-local-gap-closure-b-20260707.md',
  'docs/development/phase-one-closure-technical-plan.md',
  'docs/development/workflow.md',
  'Task 8 继续保持 `NOT_READY`'
])

requireText('PROJECT.md', [
  '2026-07-07 RepoFrame hydration 校准',
  'GOAL-003',
  'TASK-004'
])

requireText('DECISIONS.md', [
  'D-091 RepoFrame hydration 作为当前协作层校准口径',
  'D-146 一期收口技术方案纳入 RepoFrame',
  'D-147 一期收口 workflow 采用阶段级 goal',
  'GOAL-003 / TASK-004',
  'Task 8 仍保持 `NOT_READY`'
])

requireText('goals/GOAL-001-scope-clarified-for.md', [
  'Status: `superseded-for-current-execution`',
  'Current handoff work continues through `goals/GOAL-003-repoframe-doc-hydration-20260707.md`'
])

requireText('goals/GOAL-002-scope-clarified-for.md', [
  'Status: `superseded`',
  'active GOAL-003 RepoFrame hydration track'
])

requireText('goals/GOAL-003-repoframe-doc-hydration-20260707.md', [
  'Status: `completed`',
  'Mode: `repo-hydrate`',
  'Task 8 remains `NOT_READY`',
  'Do not touch `/Users/yuri/Documents/AI智能下单平台`'
])

requireText('tasks/TASK-003-clarify-source-bundle-and-recover-missing-scope.md', [
  'Status: `superseded`',
  'GOAL-003 / TASK-004 exists as the current RepoFrame hydration route'
])

requireText('tasks/TASK-004-repoframe-doc-hydration-20260707.md', [
  'Status: `completed`',
  'Do not run `initialize_repo.py`',
  'Do not modify backend business code',
  'Do not modify frontend business code',
  'Task 8 remains `NOT_READY`'
])

requireText('tasks/README.md', [
  '一期收口 workflow 已纳入 RepoFrame',
  '一期收口技术方案已纳入 RepoFrame',
  'PRD V2 本地功能差异收口 A',
  '2026-07-07 RepoFrame 文档校准任务已完成',
  'GOAL-001 保留为历史初始化证据',
  'GOAL-002 / TASK-003 保留为 superseded intake 证据',
  'GOAL-006 / TASK-007',
  'GOAL-007 / TASK-008',
  'GOAL-008 / TASK-009'
])

requireText('.repo-init/init-report.md', [
  'GOAL-003 / TASK-004 were added for RepoFrame document hydration',
  'not a fresh initialization'
])

requireText('docs/development/repo-init-document-design-20260706.md', [
  'goals/GOAL-003-repoframe-doc-hydration-20260707.md',
  'tasks/TASK-004-repoframe-doc-hydration-20260707.md',
  'repo-hydrate'
])

requireText('docs/acceptance/prd-v2-gap-matrix.md', [
  'RepoFrame 当前入口',
  'tasks/TASK-005-phase-one-ab-data-closure-20260707.md',
  'Task 8'
])

requireText('docs/acceptance/task-8-acceptance-matrix.md', [
  'RepoFrame 文档校准',
  'tasks/TASK-004-repoframe-doc-hydration-20260707.md',
  'Task 8 仍保持 `NOT_READY`'
])

requireText('docs/deployment/readiness-checklist.md', [
  'RepoFrame 文档校准',
  'tasks/TASK-004-repoframe-doc-hydration-20260707.md',
  'Task 8 仍保持 `NOT_READY`'
])

requireText('docs/deployment/task-8-final-readiness-report.md', [
  'RepoFrame 文档校准',
  'tasks/TASK-004-repoframe-doc-hydration-20260707.md',
  '状态：NOT_READY'
])

requireText('package.json', [
  'check:repoframe-docs',
  'check:phase-one-closure-plan',
  'check:phase-one-workflow'
])

requireText('docs/development/phase-one-closure-technical-plan.md', [
  '## RepoFrame 纳入状态',
  'goals/GOAL-005-phase-one-closure-plan-integration-20260707.md',
  'tasks/TASK-006-phase-one-closure-plan-integration-20260707.md',
  'Task 8 继续保持 `NOT_READY`'
])

requireText('goals/GOAL-005-phase-one-closure-plan-integration-20260707.md', [
  'Status: `completed`',
  'docs/development/phase-one-closure-technical-plan.md',
  'Task 8 remains `NOT_READY`'
])

requireText('tasks/TASK-006-phase-one-closure-plan-integration-20260707.md', [
  'Status: `completed`',
  'docs/development/phase-one-closure-technical-plan.md',
  'Task 8 remains `NOT_READY`'
])

requireText('docs/development/workflow.md', [
  '默认 goal 粒度是阶段级',
  '不应在完成一个小任务后停止并只建议下一个小任务',
  'goals/GOAL-006-phase-one-workflow-doc-20260707.md',
  'tasks/TASK-007-phase-one-workflow-doc-20260707.md',
  'Task 8 仍保持 `NOT_READY`'
])

requireText('goals/GOAL-006-phase-one-workflow-doc-20260707.md', [
  'Status: `completed`',
  'docs/development/workflow.md',
  'Task 8 remains `NOT_READY`'
])

requireText('tasks/TASK-007-phase-one-workflow-doc-20260707.md', [
  'Status: `completed`',
  'docs/development/workflow.md',
  'Task 8 remains `NOT_READY`'
])

requireText('goals/GOAL-007-prd-v2-local-gap-closure-a-20260707.md', [
  'Status: `completed`',
  'PRD V2 Local Gap Closure A',
  'Task 8 remains `NOT_READY`'
])

requireText('tasks/TASK-008-prd-v2-local-gap-closure-a-20260707.md', [
  'Status: `completed`',
  'PRD V2 Local Gap Closure A',
  'Task 8 remains `NOT_READY`'
])

for (const file of [
  'AGENTS.md',
  'AGENT.md',
  'README.md',
  'PROJECT.md',
  'STATUS.md',
  'tasks/README.md',
  'goals/GOAL-003-repoframe-doc-hydration-20260707.md',
  'goals/GOAL-004-phase-one-ab-data-closure-20260707.md',
  'goals/GOAL-005-phase-one-closure-plan-integration-20260707.md',
  'goals/GOAL-006-phase-one-workflow-doc-20260707.md',
  'tasks/TASK-004-repoframe-doc-hydration-20260707.md',
  'tasks/TASK-005-phase-one-ab-data-closure-20260707.md',
  'tasks/TASK-006-phase-one-closure-plan-integration-20260707.md',
  'tasks/TASK-007-phase-one-workflow-doc-20260707.md',
  'docs/development/phase-one-closure-technical-plan.md',
  'docs/development/workflow.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/deployment/readiness-checklist.md',
  'docs/deployment/task-8-final-readiness-report.md'
]) {
  forbidText(file, [
    'Task 8 状态：READY',
    'Task 8 已 READY',
    '真实 DeepSeek key 已完成',
    '真实 webhook 已完成',
    '客户生产备注模板已确认',
    '客户签字已完成',
    '真实环境验收已完成'
  ])
}

if (failures.length > 0) {
  console.error('RepoFrame documentation check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('RepoFrame documentation check ok')
