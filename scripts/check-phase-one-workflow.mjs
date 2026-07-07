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

const activeGoal = (acceptance.goals || []).find((goal) => goal.id === acceptance.active_goal)
if (!activeGoal) {
  failures.push(`acceptance.json missing current active goal ${acceptance.active_goal}`)
}

const goal006 = (acceptance.goals || []).find((goal) => goal.id === 'GOAL-006')
if (!goal006) {
  failures.push('acceptance.json missing GOAL-006')
} else if (goal006.status !== 'completed') {
  failures.push(`GOAL-006 status expected completed, got ${goal006.status}`)
}

const goal007 = (acceptance.goals || []).find((goal) => goal.id === 'GOAL-007')
if (!goal007) {
  failures.push('acceptance.json missing GOAL-007')
} else if (goal007.status !== 'completed') {
  failures.push(`GOAL-007 status expected completed, got ${goal007.status}`)
}

requireText('docs/development/workflow.md', [
  '# AI 智能下单平台一期收口 Workflow',
  '状态：ACTIVE / PROJECT_LOCAL。',
  '/Users/yuri/Documents/AI智能下单平台-handoff-20260706',
  '不是全局开发 SOP',
  '不恢复 Yuri workflow/SOP',
  '不重新初始化项目',
  '默认按阶段级 goal 推进',
  '不应在完成一个小任务后停止并只建议下一个小任务',
  '## Source Of Truth',
  'docs/development/phase-one-closure-technical-plan.md',
  'acceptance.json',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md',
  '## Default Goal Granularity',
  '默认 goal 粒度是阶段级',
  '第零段：状态基线校准',
  '第一段：客户 / PM 确认项与真实环境 AI 验收收口',
  '第二段：PRD V2 本地功能差异收口',
  '第三段：生产支持模块 PARTIAL 收口',
  '第四段：统一验收与文档回写',
  '## Execution Loop',
  '## Window Startup Contract',
  'docs/development/stage-goal-window-guide.md',
  '每个新窗口必须先确认阶段级 goal',
  '不要共用同一个 worktree 写文件',
  '执行中只汇报 checklist 进度，不输出“下一步小任务建议”',
  '## Task Template',
  '## Completion Standard',
  'Task 8 仍保持 `NOT_READY`',
  '## Stop Conditions',
  '需要真实 DeepSeek key',
  '需要真实 webhook URL / secret',
  '需要声明客户正式生产备注模板已经确认',
  '需要声明客户 / PM 签字完成',
  '需要把 Task 8 改成 READY',
  '需要动主目录 `/Users/yuri/Documents/AI智能下单平台`',
  '需要 `git add` / commit / push',
  '需要新增较重依赖或改变架构',
  '## Verification Matrix',
  'npm run check:phase-one-workflow',
  'npm run check:stage-goal-window',
  'npm run check:phase-one-closure-plan',
  'npm run check:repoframe-docs',
  'python3 /Users/yuri/.codex/skills/repo-init/scripts/lint_acceptance.py --repo .',
  '## Output Rules',
  '## RepoFrame File Rules',
  'goals/GOAL-006-phase-one-workflow-doc-20260707.md',
  'tasks/TASK-007-phase-one-workflow-doc-20260707.md'
])

requireText('docs/development/stage-goal-window-guide.md', [
  '# Codex Stage Goal Window Guide',
  '本窗口只执行一个阶段级 goal，不做单个小任务闭环。',
  '建立一个执行批次 task，并在 task 内拆 checklist',
  '不要共用同一个 worktree 写文件',
  'Task 8 必须保持 NOT_READY'
])

for (const file of [
  'STATUS.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md'
]) {
  requireText(file, [
    'docs/development/workflow.md',
    'GOAL-006',
    'TASK-007',
    'check:phase-one-workflow',
    'Task 8'
  ])
}

requireText('goals/GOAL-006-phase-one-workflow-doc-20260707.md', [
  'Status: `completed`',
  'Scope',
  'Non-goals',
  'Acceptance',
  'Verification',
  'Observation Ledger',
  'docs/development/workflow.md',
  'Task 8 remains `NOT_READY`'
])

requireText('tasks/TASK-007-phase-one-workflow-doc-20260707.md', [
  'Status: `completed`',
  'Scope',
  'Non-goals',
  'Acceptance',
  'Verification',
  'Assumption Checks',
  'Downstream Impact',
  'Completion Record',
  'docs/development/workflow.md',
  'Task 8 remains `NOT_READY`'
])

requireText('package.json', [
  'check:phase-one-workflow',
  'scripts/check-phase-one-workflow.mjs',
  'check:stage-goal-window',
  'scripts/check-stage-goal-window-guide.mjs'
])

for (const file of [
  'docs/development/workflow.md',
  'docs/development/stage-goal-window-guide.md',
  'STATUS.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'goals/GOAL-006-phase-one-workflow-doc-20260707.md',
  'tasks/TASK-007-phase-one-workflow-doc-20260707.md'
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
  console.error('phase-one workflow check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('phase-one workflow check ok')
