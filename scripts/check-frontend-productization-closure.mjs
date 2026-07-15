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
requireCurrentPointerAtOrAfter(acceptance, fs, failures, 'GOAL-017')
if (!Array.isArray(acceptance.goals) || !acceptance.goals.some((goal) => goal.id === 'GOAL-017')) {
  failures.push('acceptance.json missing GOAL-017 checks')
}

requireText('goals/GOAL-017-frontend-productization-closure-20260707.md', [
  '# GOAL-017 Frontend Productization Closure',
  'Task 8 as `NOT_READY`',
  'frontend-business-pages` as `PARTIAL`',
  'Doctor eight-module experience',
  'CS order detail',
  'Production review',
  'Admin necessary entry',
  'Do not restore an independent doctor files module'
])

requireText('tasks/TASK-018-frontend-productization-closure-20260707.md', [
  '# TASK-018 Frontend Productization Closure',
  'Goal: `goals/GOAL-017-frontend-productization-closure-20260707.md`',
  '## Checklist',
  'Scope:',
  'Non-goals:',
  'Acceptance:',
  'Verification:',
  'Stage machine check',
  'Doctor and CS productization',
  'Production and admin productization',
  'Unified frontend state surfaces',
  'RepoFrame and readiness writeback'
])

requireText('package.json', [
  'check:frontend-productization-closure',
  'scripts/check-frontend-productization-closure.mjs',
  'check:frontend-customer-smoke-closure',
  'build:frontend',
  'check:task8-readiness-gaps'
])

requireText('frontend/src/App.vue', [
  'frontendProductizationStateCopy',
  'frontend-productization-state-strip',
  '权限拒绝态',
  '加载态',
  '空态',
  '错误态',
  'isProductizedProductionSupportRoute',
  'isProductizedCsDesignRoute',
  'isProductizedCsBillingRoute',
  '本地第一增量',
  'frontend-productized-support-panel',
  'admin-permission-inventory-panel',
  "routePath: '/orders/internal'",
  "routePath: '/delivery'",
  "routePath: '/production/devices'",
  "routePath: '/production/material-exceptions'",
  "routePath: '/production/safety-environment'",
  "routePath: '/production/cost-management'",
  "routePath: '/production/reward-penalty'"
])

for (const [file, fragments] of [
  ['STATUS.md', ['GOAL-017', 'TASK-018', '四端前端产品化体验收口', 'check:frontend-productization-closure', 'frontend-business-pages', 'PARTIAL', 'Task 8 仍保持 `NOT_READY`']],
  ['PROJECT.md', ['GOAL-017', 'TASK-018', '四端前端产品化体验收口', 'frontend-business-pages', 'PARTIAL', 'Task 8 仍保持 `NOT_READY`']],
  ['tasks/README.md', ['任务 018：四端前端产品化体验收口', 'GOAL-017', 'TASK-018', 'Scope', 'Non-goals', 'Acceptance', 'Verification', 'Task 8 仍保持 NOT_READY']],
  ['README.md', ['GOAL-017', 'TASK-018', '四端前端产品化体验收口', 'npm run check:frontend-productization-closure', 'Task 8 继续保持 `NOT_READY`']],
  ['DECISIONS.md', ['D-157 GOAL-017 四端前端产品化体验收口', 'frontend-business-pages', 'PARTIAL', '不恢复医生文件独立模块']],
  ['docs/acceptance/prd-v2-gap-matrix.md', ['GOAL-017', 'TASK-018', '四端前端产品化体验收口', 'frontend-business-pages', 'PARTIAL']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['GOAL-017', 'TASK-018', '四端前端产品化体验收口', 'Task 8 仍保持 `NOT_READY`']],
  ['docs/deployment/readiness-checklist.md', ['GOAL-017', 'TASK-018', '四端前端产品化体验收口', 'frontend-business-pages', 'PARTIAL']],
  ['docs/deployment/task-8-final-readiness-report.md', ['GOAL-017', 'TASK-018', '四端前端产品化体验收口', 'Task 8']]
]) {
  requireText(file, fragments)
}

requireText('acceptance.json', [
  'GOAL-017',
  'goals/GOAL-017-frontend-productization-closure-20260707.md',
  'tasks/TASK-018-frontend-productization-closure-20260707.md',
  'check:frontend-productization-closure',
  'frontend-productization-state-surface',
  'frontend-productization-production-support',
  'frontend-productization-no-fake-ready'
])

for (const [gapId, expectedStatus] of [
  ['frontend-business-pages', 'PARTIAL'],
  ['prd-v2-local-feature-gaps', 'PARTIAL'],
  ['customer-pm-confirmations', 'PARTIAL'],
  ['ai-production-governance', 'PARTIAL'],
  ['deployment-infrastructure', 'PARTIAL'],
  ['operations-manuals', 'PARTIAL']
]) {
  const gap = acceptance.task8_readiness_gaps?.find((item) => item.id === gapId)
  if (!gap || gap.status !== expectedStatus) {
    failures.push(`acceptance.json expected ${gapId} to remain ${expectedStatus}`)
  }
}

forbidText('frontend/src/App.vue', [
  "id: 'cs-designs', title: '设计稿管理', description: '审核生产端上传的设计稿并发给医生确认。', icon: 'design', routePath: '/design-drafts', placeholder: true",
  "id: 'cs-billing', title: '账单管理', description: '上传账单文件、查看订单费用和客户账单。', icon: 'bill', routePath: '/billing', placeholder: true",
  "id: 'production-device', title: '设备管理', description: '查看设备台账、设备状态、保养计划、故障报修和稼动率。', icon: 'device', routePath: '/production/devices', placeholder: true",
  "id: 'production-material', title: '物料管理', description: '登记缺料、错料、批次异常、材料损耗和处理状态。', icon: 'material', routePath: '/production/material-exceptions', placeholder: true",
  "id: 'production-cost', title: '成本管理', description: '查看工序、材料、人工、返工、外协成本和异常预警。', icon: 'cost', routePath: '/production/cost-management', placeholder: true",
  "id: 'production-safety', title: '安环管理', description: '管理安全巡检、隐患整改、环境记录和安环事件统计。', icon: 'safety', routePath: '/production/safety-environment', placeholder: true",
  "id: 'production-reward-penalty', title: '奖惩管理', description: '维护奖惩记录、原因、关联订单/工序/员工和审批状态。', icon: 'reward', routePath: '/production/reward-penalty', placeholder: true",
  "routePath: '/doctor/files'",
  'doctor-files'
])

for (const file of [
  'frontend/src/App.vue',
  'goals/GOAL-017-frontend-productization-closure-20260707.md',
  'tasks/TASK-018-frontend-productization-closure-20260707.md',
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
    'frontend-business-pages 状态：READY',
    'frontend-business-pages 已 READY',
    '客户/PM 签字状态：已确认',
    '客户/PM 签字状态：已签字',
    '状态：客户签字已完成',
    '结论：客户签字已完成',
    '状态：真实环境验收已完成',
    '结论：真实环境验收已完成',
    '状态：真实 DeepSeek key 已联调完成',
    '结论：真实 DeepSeek key 已联调完成',
    '状态：生产 webhook 已联调完成',
    '结论：生产 webhook 已联调完成',
    '状态：真实支付平台已接入并验收',
    '结论：真实支付平台已接入并验收',
    '状态：真实物流平台已接入并验收',
    '结论：真实物流平台已接入并验收',
    '状态：真实电子签章已完成',
    '结论：真实电子签章已完成',
    '状态：HTTPS 已验收完成',
    '结论：HTTPS 已验收完成'
  ])
}

if (failures.length > 0) {
  console.error('frontend productization closure check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('frontend productization closure check ok')
