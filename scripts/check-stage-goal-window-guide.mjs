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

requireText('docs/development/stage-goal-window-guide.md', [
  '# Codex Stage Goal Window Guide',
  '状态：ACTIVE / PROJECT_LOCAL。',
  '本窗口只执行一个阶段级 goal，不做单个小任务闭环。',
  '本窗口目标是：[填阶段名，例如“第二段：PRD V2 本地功能差异收口”]。',
  '建立或更新一个阶段级 RepoFrame goal',
  '建立一个执行批次 task，并在 task 内拆 checklist',
  '不要完成一个小项就停止建议下一步',
  '每个 checklist 项必须有 Scope / Non-goals / Acceptance / Verification',
  'Task 8 必须保持 NOT_READY',
  '最终输出完成内容、验证命令、剩余阻塞和接力摘要',
  '## Parallel Window Rules',
  '不要共用同一个 worktree 写文件',
  '独立 worktree 或独立分支',
  '## Required Verification',
  'npm run check:phase-one-closure-plan',
  'npm run check:phase-one-workflow',
  'npm run check:repoframe-docs',
  'npm run acceptance',
  'git diff --check'
])

requireText('docs/development/workflow.md', [
  'docs/development/stage-goal-window-guide.md',
  '每个新窗口必须先确认阶段级 goal',
  '不要共用同一个 worktree 写文件'
])

requireText('package.json', [
  'check:stage-goal-window',
  'scripts/check-stage-goal-window-guide.mjs'
])

for (const file of [
  'STATUS.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md'
]) {
  requireText(file, [
    'docs/development/stage-goal-window-guide.md',
    'check:stage-goal-window',
    '阶段级 goal'
  ])
}

for (const file of [
  'docs/development/stage-goal-window-guide.md',
  'docs/development/workflow.md',
  'STATUS.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md'
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
  console.error('stage goal window guide check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('stage goal window guide check ok')
