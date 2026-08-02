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
const goal015 = acceptance.goals?.find((goal) => goal.id === 'GOAL-015')
if (!goal015) {
  failures.push('acceptance.json missing GOAL-015 checks')
} else if (goal015.status !== 'completed') {
  failures.push(`acceptance.json GOAL-015 expected completed, got ${goal015.status}`)
}

requireText('goals/GOAL-015-operations-rollback-training-closure-20260707.md', [
  '# GOAL-015 Operations / Rollback / Training Closure',
  '操作手册 / 回滚 / 培训材料本地收口',
  'GOAL-014 remains completed',
  'operations-manuals',
  'Task 8 remains `NOT_READY`',
])

requireText('tasks/TASK-016-operations-rollback-training-closure-20260707.md', [
  '# TASK-016 Operations / Rollback / Training Closure',
  'Goal: `goals/GOAL-015-operations-rollback-training-closure-20260707.md`',
  '## Checklist',
  'Scope:',
  'Non-goals:',
  'Acceptance:',
  'Verification:',
  'Stage machine check',
  'Operation manual refresh',
  'Rollback and deployment runbook',
  'Training materials and signoff template',
  'RepoFrame and readiness writeback',
])

requireText('package.json', [
  'check:operations-rollback-training-closure',
  'scripts/check-operations-rollback-training-closure.mjs',
  'check:task9d70',
])

requireText('docs/operations/phase-one-role-operation-manual.md', [
  '操作手册 / 回滚 / 培训材料本地收口',
  '本地可演示路径',
  '培训讲师检查点',
  '不代表客户培训签收完成',
  'Task 8 仍保持 NOT_READY',
])

requireText('docs/operations/phase-one-troubleshooting-guide.md', [
  '升级与回滚边界',
  '发布前停机沟通',
  '备份恢复演练',
  '回滚触发条件',
  '不要删除数据',
  '不要清 Docker volume',
])

requireText('docs/operations/phase-one-rollback-runbook.md', [
  '一期发布回滚手册本地模板',
  '状态：TEMPLATE_READY / PARTIAL',
  '发布前检查',
  '回滚触发条件',
  '回滚步骤',
  '数据保护',
  '待填写',
  '待确认',
  '不填写真实服务器地址',
  '不填写真实密钥',
  '不代表真实发布回滚演练完成',
  'Task 8 仍保持 NOT_READY',
])

requireText('docs/operations/phase-one-training-materials.md', [
  '一期培训材料本地模板',
  '状态：TEMPLATE_READY / PARTIAL',
  '医生端培训',
  '客服端培训',
  '生产端培训',
  '管理端培训',
  '培训签到',
  '客户 / PM 签收',
  '待填写',
  '待确认',
  '不代表正式客户培训签收完成',
  'Task 8 仍保持 NOT_READY',
])

requireText('docs/operations/phase-one-delivery-materials-index.md', [
  'GOAL-015',
  'TASK-016',
  'phase-one-rollback-runbook.md',
  'phase-one-training-materials.md',
  'check:operations-rollback-training-closure',
])

for (const file of [
  'STATUS.md',
  'PROJECT.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md',
  'docs/deployment/task-8-final-readiness-report.md',
]) {
  requireText(file, [
    'GOAL-015',
    'TASK-016',
    '操作手册 / 回滚 / 培训材料本地收口',
    'check:operations-rollback-training-closure',
    'operations-manuals',
    'Task 8',
  ])
}

requireText('acceptance.json', [
  'GOAL-015',
  'goals/GOAL-015-operations-rollback-training-closure-20260707.md',
  'tasks/TASK-016-operations-rollback-training-closure-20260707.md',
  'check:operations-rollback-training-closure',
  'operations-rollback-training-required-text',
  'operations-rollback-training-no-fake-ready',
])

const operationsGap = acceptance.task8_readiness_gaps?.find((gap) => gap.id === 'operations-manuals')
if (!operationsGap) {
  failures.push('acceptance.json missing operations-manuals readiness gap')
} else {
  if (operationsGap.status !== 'PARTIAL') {
    failures.push(`operations-manuals expected PARTIAL, got ${operationsGap.status}`)
  }
  const combined = `${operationsGap.current_evidence}\n${operationsGap.remaining_reason}\n${operationsGap.minimum_closure_loop}\n${operationsGap.verification}`
  for (const fragment of [
    'GOAL-015 / TASK-016',
    'docs/operations/phase-one-rollback-runbook.md',
    'docs/operations/phase-one-training-materials.md',
    '真实发布回滚演练',
    '客户培训签收',
    'Task 8 NOT_READY',
  ]) {
    if (!combined.includes(fragment)) {
      failures.push(`operations-manuals gap missing required text: ${fragment}`)
    }
  }
}

for (const [gapId, expectedStatus] of [
  ['operations-manuals', 'PARTIAL'],
  ['deployment-infrastructure', 'PARTIAL'],
  ['customer-pm-confirmations', 'PARTIAL'],
  ['ai-production-governance', 'PARTIAL'],
  ['websocket-notification-prod', 'PARTIAL'],
]) {
  const gap = acceptance.task8_readiness_gaps?.find((item) => item.id === gapId)
  if (!gap || gap.status !== expectedStatus) {
    failures.push(`acceptance.json expected ${gapId} to remain ${expectedStatus}`)
  }
}

for (const file of [
  'goals/GOAL-015-operations-rollback-training-closure-20260707.md',
  'tasks/TASK-016-operations-rollback-training-closure-20260707.md',
  'docs/operations/phase-one-rollback-runbook.md',
  'docs/operations/phase-one-training-materials.md',
  'docs/operations/phase-one-delivery-materials-index.md',
  'STATUS.md',
  'PROJECT.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md',
  'docs/deployment/task-8-final-readiness-report.md',
]) {
  forbidText(file, [
    'Task 8 状态：READY',
    'Task 8 已 READY',
    'operations-manuals 已 READY',
    '状态：真实发布回滚演练已完成',
    '结论：真实发布回滚演练已完成',
    '状态：正式客户培训签收已完成',
    '结论：正式客户培训签收已完成',
    '客户/PM 签字状态：已确认',
    '客户/PM 签字状态：已签字',
    '培训签收状态：已完成',
  ])
}

const sensitiveText = [
  read('docs/operations/phase-one-rollback-runbook.md'),
  read('docs/operations/phase-one-training-materials.md'),
].join('\n')
for (const pattern of [
  /(?:password|secret|token|key)\s*[:=]\s*(?!待填写|external-secret|replace-with|<)[^\s|`]+/i,
  /https?:\/\/(?:\d{1,3}\.){3}\d{1,3}[^\s|`]*/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
]) {
  if (pattern.test(sensitiveText)) {
    failures.push(`operations closure docs contain forbidden secret-like value: ${pattern}`)
  }
}

if (failures.length > 0) {
  console.error('operations rollback training closure check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('operations rollback training closure check ok')
