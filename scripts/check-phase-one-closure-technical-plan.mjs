import fs from 'node:fs'

const failures = []

function read(file) {
  if (!fs.existsSync(file)) {
    failures.push(`${file} -> file missing`)
    return ''
  }
  return fs.readFileSync(file, 'utf8')
}

function requireText(file, fragments) {
  const text = read(file)
  for (const fragment of fragments) {
    if (!text.includes(fragment)) {
      failures.push(`${file} -> missing text: ${fragment}`)
    }
  }
  return text
}

function forbidText(file, fragments) {
  const text = read(file)
  for (const fragment of fragments) {
    if (text.includes(fragment)) {
      failures.push(`${file} -> forbidden stale text: ${fragment}`)
    }
  }
}

const planPath = 'docs/development/phase-one-closure-technical-plan.md'
requireText(planPath, [
  '# AI 智能下单平台一期收口技术方案',
  '状态：EXECUTABLE_DRAFT / NOT_READY',
  '## Summary',
  '## Current Baseline',
  '## Execution Phases',
  '### 第零段：状态基线校准',
  '### 第一段：客户 / PM 确认项与真实环境 AI 验收收口',
  '### 第二段：PRD V2 本地功能差异收口',
  '### 第三段：生产支持模块 PARTIAL 收口',
  '### 第四段：统一验收与文档回写',
  '## Test Plan',
  '## Hard Boundaries',
  '## Remaining Blockers',
  'customer-pm-confirmations',
  'ai-production-governance',
  'prd-v2-local-feature-gaps',
  'frontend-business-pages',
  '9D.90',
  '9D.91',
  '9D.92',
  '9D.97',
  '9D.98',
  'requires_customer_template_confirmation',
  '设备编辑 / 事件状态更新',
  '物料编辑 / 处理历史',
  '安环复查 / 完整审批',
  '成本编辑 / 审批',
  '奖惩编辑 / 复杂审批',
  '真实趋势和完整验收',
  'npm run check:task9d72',
  'npm run check:task9d80',
  'npm run check:task9d81',
  'npm run check:task9d97',
  'npm run check:task9d98',
  'npm run check:task8-readiness-gaps',
  'npm run check:openapi',
  'npm run build:frontend',
  'npm run acceptance',
  'git diff --check',
  '不 `git add` / commit / push',
  '不接入或伪造真实 DeepSeek key',
  '不伪造真实 webhook',
  '不伪造客户生产备注模板',
  '不伪造客户签字',
  '不把 Task 8 标成 READY',
])

requireText('package.json', ['check:phase-one-closure-plan'])

const acceptanceText = requireText('acceptance.json', [
  '"id": "frontend-business-pages"',
  '"id": "ai-production-governance"',
  '"id": "prd-v2-local-feature-gaps"',
  '"id": "customer-pm-confirmations"',
  '9D.98 已补 AI-5 生产备注客户模板 / 知识上下文补强第一增量',
  '真实客户 / PM 确认项与真实环境 AI 验收收口',
])

if (acceptanceText) {
  const acceptance = JSON.parse(acceptanceText)
  const requiredGapStatuses = new Map([
    ['frontend-business-pages', 'PARTIAL'],
    ['ai-production-governance', 'PARTIAL'],
    ['prd-v2-local-feature-gaps', 'PARTIAL'],
    ['customer-pm-confirmations', 'BLOCKED'],
  ])
  for (const [id, status] of requiredGapStatuses.entries()) {
    const gap = acceptance.task8_readiness_gaps?.find((item) => item.id === id)
    if (!gap) {
      failures.push(`acceptance.json -> missing gap id: ${id}`)
      continue
    }
    if (gap.status !== status) {
      failures.push(`acceptance.json -> ${id} must be ${status}, got ${gap.status}`)
    }
  }
}

forbidText('acceptance.json', [
  '仍缺产品 / 价格体系一期最小后台',
  '后续补产品参数 / 价格体系一期最小后台',
  '本地下一优先级转向客户 / 诊所档案与偏好第一增量',
])

forbidText('README.md', [
  '任务 9D.1 到 9D.90 的多条一期硬缺口第一增量',
  '下一轮唯一推荐目标是 WebSocket / 通知生产验收第一段',
  '下一轮唯一推荐目标：客服配送管理页 / 物流异常跟进第一增量',
])

for (const file of [
  'STATUS.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md',
  'docs/deployment/task-8-final-readiness-report.md',
]) {
  requireText(file, [
    '9D.90',
    '9D.91',
    '9D.92',
    '9D.97',
    '9D.98',
    'Task 8',
    'NOT_READY',
  ])
}

requireText('docs/acceptance/phase-one-customer-pm-confirmations.md', [
  'CP-001',
  'CP-002',
  'CP-003',
  'CP-004',
  'CP-005',
  'CP-006',
  'CP-007',
  'CP-008',
  'CP-009',
  '负责人',
  '当前状态',
  '未决风险',
  'BLOCKED',
  'PROPOSED_DEFAULT',
  'Task 8 仍保持 NOT_READY',
])

requireText('docs/acceptance/task-9d80-ai-production-integration-acceptance.md', [
  '真实 key 只能外部注入',
  '不填写真实密钥',
  '不填写真实 webhook URL',
  '不代表真实 key 已联调完成',
  '不代表生产 webhook 已联调完成',
  '客户/PM 签字状态：待确认',
])

requireText('docs/deployment/task-9d81-production-deployment-acceptance.md', [
  '真实密钥必须外部注入',
  '不填写真实密钥',
  '不填写真实服务器地址',
  '不代表真实服务器已部署完成',
  '不代表 HTTPS 已验收完成',
  '客户/PM 签字状态：待确认',
])

requireText('docs/acceptance/phase-one-production-support-closure-plan.md', [
  '一期基础可演示闭环 / PARTIAL',
  '设备编辑 / 事件状态更新',
  '物料编辑 / 处理历史',
  '安环复查 / 完整审批',
  '成本编辑 / 审批',
  '奖惩编辑 / 复杂审批',
  '真实趋势和完整验收',
])

const forbiddenConfirmedPhrases = [
  '真实 DeepSeek key 已联调',
  '状态：真实 key 已联调完成',
  '结论：真实 key 已联调完成',
  '状态：生产 webhook 已联调完成',
  '结论：生产 webhook 已联调完成',
  '客户生产备注模板已确认',
  '客户/PM 签字状态：已确认',
  '客户/PM 签字状态：已签字',
  'Task 8 已 READY',
  'Task 8 READY',
]

for (const file of [
  planPath,
  'docs/acceptance/task-9d80-ai-production-integration-acceptance.md',
  'docs/deployment/task-9d81-production-deployment-acceptance.md',
  'docs/acceptance/phase-one-customer-pm-confirmations.md',
]) {
  forbidText(file, forbiddenConfirmedPhrases)
}

if (failures.length > 0) {
  console.error('phase-one closure technical plan check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('phase-one closure technical plan check ok')
