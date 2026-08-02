import fs from 'node:fs'
import { requireCurrentPointerAtOrAfter } from './stage-check-helpers.mjs'

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
requireCurrentPointerAtOrAfter(acceptance, fs, failures, 'GOAL-020')
if (!Array.isArray(acceptance.goals) || !acceptance.goals.some((goal) => goal.id === 'GOAL-020')) {
  failures.push('acceptance.json missing GOAL-020 checks')
}

requireText('goals/GOAL-020-deployment-ops-local-hardening-20260707.md', [
  '# GOAL-020 Deployment / Ops Local Hardening',
  'Status: `completed`',
  'deployment-ops-local-hardening',
  'Task 8 as `NOT_READY`',
  'Do not claim real server deployment',
  'Do not claim HTTPS acceptance',
  'Do not claim backup restore completion',
  'Do not claim monitoring alert acceptance'
])

requireText('tasks/TASK-021-deployment-ops-local-hardening-20260707.md', [
  '# TASK-021 Deployment / Ops Local Hardening',
  'Goal: `goals/GOAL-020-deployment-ops-local-hardening-20260707.md`',
  '## Checklist',
  'Scope:',
  'Non-goals:',
  'Acceptance:',
  'Verification:',
  'Stage machine check',
  'Release / rollback dry-run and static deployment checks',
  'Backup / restore and log / monitoring templates',
  'Operations, deployment, acceptance, and readiness writeback',
  'Status: `completed`'
])

requireText('package.json', [
  'check:deployment-ops-local-hardening',
  'scripts/check-deployment-ops-local-hardening.mjs',
  'dry-run:phase-one-release-rollback',
  'scripts/phase-one-release-rollback-dry-run.mjs',
  'check:deployment-env',
  'compose:phase-one:config',
  'check:task9d81',
  'check:operations-rollback-training-closure'
])

requireText('docs/deployment/phase-one-local-ops-dry-run.md', [
  '本地 release / rollback dry-run 检查',
  'dry-run:phase-one-release-rollback',
  '备份 / 恢复 dry-run 模板第一段',
  '日志留存 / 监控告警配置模板第一段',
  'compose / env / Nginx / healthcheck 静态检查',
  'readiness 联动',
  'Task 8 仍保持 NOT_READY'
])

for (const [file, fragments] of [
  ['STATUS.md', ['GOAL-020', 'TASK-021', '部署 / 运维本地补强', 'check:deployment-ops-local-hardening', 'dry-run:phase-one-release-rollback', 'Task 8 仍保持 `NOT_READY`']],
  ['PROJECT.md', ['GOAL-020', 'TASK-021', '部署 / 运维本地补强', '本地 release / rollback dry-run', 'Task 8 仍保持 `NOT_READY`']],
  ['tasks/README.md', ['任务 021：部署 / 运维本地补强', 'GOAL-020', 'TASK-021', 'Scope', 'Non-goals', 'Acceptance', 'Verification', 'Task 8 仍保持 NOT_READY']],
  ['README.md', ['GOAL-020', 'TASK-021', '部署 / 运维本地补强', 'npm run check:deployment-ops-local-hardening', 'npm run dry-run:phase-one-release-rollback', 'Task 8 继续保持 `NOT_READY`']],
  ['DECISIONS.md', ['D-160 GOAL-020 部署 / 运维本地补强', 'deployment-ops-local-hardening', '不伪造真实服务器', 'Task 8 仍保持 `NOT_READY`']],
  ['acceptance.json', ['GOAL-020', 'tasks/TASK-021-deployment-ops-local-hardening-20260707.md', 'check:deployment-ops-local-hardening', 'dry-run:phase-one-release-rollback', 'deployment-ops-local-hardening-no-fake-ready']],
  ['docs/acceptance/prd-v2-gap-matrix.md', ['GOAL-020', 'TASK-021', '部署 / 运维本地补强', 'deployment-infrastructure', 'PARTIAL']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['GOAL-020', 'TASK-021', '部署 / 运维本地补强', 'Task 8 仍保持 `NOT_READY`']],
  ['docs/deployment/readiness-checklist.md', ['GOAL-020', 'TASK-021', '部署 / 运维本地补强', 'phase-one-local-ops-dry-run.md', 'deployment-infrastructure', 'operations-manuals', 'PARTIAL']],
  ['docs/deployment/task-8-final-readiness-report.md', ['GOAL-020', 'TASK-021', '部署 / 运维本地补强', 'Task 8']],
  ['docs/deployment/task-9d81-production-deployment-acceptance.md', ['GOAL-020', 'TASK-021', '本地 dry-run 补强', '真实环境字段仍为 `待填写` 或 `待确认`']],
  ['docs/operations/phase-one-rollback-runbook.md', ['GOAL-020', 'TASK-021', 'phase-one-local-ops-dry-run.md', 'dry-run:phase-one-release-rollback']],
  ['docs/operations/phase-one-training-materials.md', ['GOAL-020', 'TASK-021', 'phase-one-local-ops-dry-run.md', 'readiness 联动']]
]) {
  requireText(file, fragments)
}

for (const [gapId, expectedStatus] of [
  ['deployment-infrastructure', 'PARTIAL'],
  ['operations-manuals', 'PARTIAL'],
  ['customer-pm-confirmations', 'PARTIAL'],
  ['ai-production-governance', 'PARTIAL'],
  ['websocket-notification-prod', 'PARTIAL']
]) {
  const gap = acceptance.task8_readiness_gaps?.find((item) => item.id === gapId)
  if (!gap || gap.status !== expectedStatus) {
    failures.push(`acceptance.json expected ${gapId} to remain ${expectedStatus}`)
  }
}

for (const file of [
  'goals/GOAL-020-deployment-ops-local-hardening-20260707.md',
  'tasks/TASK-021-deployment-ops-local-hardening-20260707.md',
  'docs/deployment/phase-one-local-ops-dry-run.md',
  'docs/deployment/task-9d81-production-deployment-acceptance.md',
  'docs/operations/phase-one-rollback-runbook.md',
  'docs/operations/phase-one-training-materials.md',
  'STATUS.md',
  'PROJECT.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md',
  'docs/deployment/task-8-final-readiness-report.md'
]) {
  forbidText(file, [
    'Task 8 状态：READY',
    'Task 8 已 READY',
    'deployment-infrastructure 已 READY',
    'operations-manuals 已 READY',
    '状态：真实服务器已部署完成',
    '结论：真实服务器已部署完成',
    '状态：HTTPS 已验收完成',
    '结论：HTTPS 已验收完成',
    '状态：备份恢复演练已完成',
    '结论：备份恢复演练已完成',
    '状态：监控告警已验收完成',
    '结论：监控告警已验收完成',
    '状态：正式客户培训签收已完成',
    '结论：正式客户培训签收已完成',
    '客户/PM 签字状态：已确认',
    '客户/PM 签字状态：已签字'
  ])
}

if (failures.length > 0) {
  console.error('deployment ops local hardening check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('deployment ops local hardening check ok')
