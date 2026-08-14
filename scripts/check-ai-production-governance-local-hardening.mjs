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
requireCurrentPointerAtOrAfter(acceptance, fs, failures, 'GOAL-019')
if (!Array.isArray(acceptance.goals) || !acceptance.goals.some((goal) => goal.id === 'GOAL-019')) {
  failures.push('acceptance.json missing GOAL-019 checks')
}

requireText('goals/GOAL-019-ai-production-governance-local-hardening-20260707.md', [
  '# GOAL-019 AI Production Governance Local Hardening',
  'Status: `completed`',
  'ai-production-governance-local-hardening',
  'Task 8 as `NOT_READY`',
  'local read-only AI governance hardening surface',
  'Do not claim real key integration',
  'Do not claim real environment acceptance'
])

requireText('tasks/TASK-020-ai-production-governance-local-hardening-20260707.md', [
  '# TASK-020 AI Production Governance Local Hardening',
  'Goal: `goals/GOAL-019-ai-production-governance-local-hardening-20260707.md`',
  '## Checklist',
  'Scope:',
  'Non-goals:',
  'Acceptance:',
  'Verification:',
  'Stage machine check',
  'Backend local governance surface and AI-3 safety matrix',
  'Admin AI governance page productization',
  'Acceptance, readiness, and project docs writeback',
  'Status: `completed`'
])

requireText('package.json', [
  'check:ai-production-governance-local-hardening',
  'scripts/check-ai-production-governance-local-hardening.mjs',
  'check:task9d80',
  'check:task9d94',
  'check:task9d97',
  'check:customer-special-requirements'
])

requireText('backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayController.java', [
  '"/ai/governance/local-hardening"',
  'AiGovernanceLocalHardeningResponse'
])
requireText('backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
  'governanceLocalHardening',
  'promptVersionCatalog',
  'OUTPUT_GUARD_STATUS',
  'GUARDED_STREAMING_NOT_ENABLED',
  'CUSTOMER_TEMPLATE_UNCONFIRMED',
  'REAL_EXTERNAL_INTEGRATION_PENDING',
  'AI3_DOCTOR_INTERNAL_SAFETY_MATRIX'
])
requireText('backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGovernanceLocalHardeningResponse.java', [
  'PromptTemplate',
  'OutputSafetyBoundary',
  'BudgetCircuitBreakerPolicy',
  'Ai3SafetyCase',
  'Ai5TemplateBoundary',
  'RealExternalIntegrationStatus'
])
requireText('backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayTests.java', [
  'aiGovernanceLocalHardeningShowsPromptVersionsAndBoundaries',
  'doctorOrderAssistantSafetyMatrixRefusesInternalProductionQuestions',
  'AI3_DOCTOR_INTERNAL_SAFETY_MATRIX',
  'CUSTOMER_TEMPLATE_UNCONFIRMED',
  'REAL_EXTERNAL_INTEGRATION_PENDING'
])

requireText('frontend/src/App.vue', [
  'AiGovernanceLocalHardeningResponse',
  'loadAiGovernanceLocalHardening',
  'isAdminAiGovernanceRoute',
  '/ai/governance/local-hardening',
  'ai-governance-local-hardening',
  '智能功能管理',
  '内容保护',
  '每日使用上限',
  '医生端信息保护',
  '生产信息使用规则',
  '客户档案分类要求',
  '档案修改不回写'
])

requireText('docs/api/openapi.yaml', [
  '"/ai/governance/local-hardening"',
  'getAiGovernanceLocalHardening',
  'AiGovernanceLocalHardeningResponse',
  'AiPromptTemplate',
  'AiOutputSafetyBoundary',
  'AiBudgetCircuitBreakerPolicy',
  'Ai3SafetyCase',
  'Ai5TemplateBoundary',
  'AiRealExternalIntegrationStatus'
])

for (const [file, fragments] of [
  ['STATUS.md', ['GOAL-019', 'TASK-020', 'AI 生产治理本地补强', 'check:ai-production-governance-local-hardening', 'Task 8 仍保持 `NOT_READY`']],
  ['PROJECT.md', ['GOAL-019', 'TASK-020', 'AI 生产治理本地补强', '提示词版本', '输出安全边界', 'AI-3 安全矩阵', 'Task 8 仍保持 `NOT_READY`']],
  ['tasks/README.md', ['任务 020：AI 生产治理本地补强', 'GOAL-019', 'TASK-020', 'Scope', 'Non-goals', 'Acceptance', 'Verification', 'Task 8 仍保持 NOT_READY']],
  ['README.md', ['GOAL-019', 'TASK-020', 'AI 生产治理本地补强', 'npm run check:ai-production-governance-local-hardening', 'Task 8 继续保持 `NOT_READY`']],
  ['DECISIONS.md', ['D-159 GOAL-019 AI 生产治理本地补强', 'ai-production-governance-local-hardening', '不伪造真实 key', 'Task 8 仍保持 `NOT_READY`']],
  ['docs/acceptance/prd-v2-gap-matrix.md', ['GOAL-019', 'TASK-020', 'AI 生产治理本地补强', 'local-hardening', 'PARTIAL']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['GOAL-019', 'TASK-020', 'AI 生产治理本地补强', 'Task 8 仍保持 `NOT_READY`']],
  ['docs/acceptance/task-9d80-ai-production-integration-acceptance.md', ['GOAL-019', 'TASK-020', '本地治理补强', '真实 key / 生产 webhook 仍为待填写 / 待确认']],
  ['docs/deployment/readiness-checklist.md', ['GOAL-019', 'TASK-020', 'AI 生产治理本地补强', 'ai-production-governance', 'PARTIAL']],
  ['docs/deployment/task-8-final-readiness-report.md', ['GOAL-019', 'TASK-020', 'AI 生产治理本地补强', 'Task 8']]
]) {
  requireText(file, fragments)
}

for (const [gapId, expectedStatus] of [
  ['ai-production-governance', 'PARTIAL'],
  ['customer-pm-confirmations', 'PARTIAL'],
  ['frontend-business-pages', 'PARTIAL'],
  ['prd-v2-local-feature-gaps', 'PARTIAL'],
  ['deployment-infrastructure', 'PARTIAL'],
  ['operations-manuals', 'PARTIAL']
]) {
  const gap = acceptance.task8_readiness_gaps?.find((item) => item.id === gapId)
  if (!gap || gap.status !== expectedStatus) {
    failures.push(`acceptance.json expected ${gapId} to remain ${expectedStatus}`)
  }
}

for (const file of [
  'goals/GOAL-019-ai-production-governance-local-hardening-20260707.md',
  'tasks/TASK-020-ai-production-governance-local-hardening-20260707.md',
  'STATUS.md',
  'PROJECT.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/acceptance/task-9d80-ai-production-integration-acceptance.md',
  'docs/deployment/readiness-checklist.md',
  'docs/deployment/task-8-final-readiness-report.md'
]) {
  forbidText(file, [
    'Task 8 状态：READY',
    'Task 8 已 READY',
    'ai-production-governance 状态：READY',
    '状态：客户签字已完成',
    '结论：客户签字已完成',
    '客户/PM 签字状态：已确认',
    '客户/PM 签字状态：已签字',
    '状态：真实环境验收已完成',
    '结论：真实环境验收已完成',
    '状态：真实 DeepSeek key 已联调完成',
    '结论：真实 DeepSeek key 已联调完成',
    '状态：生产 webhook 已联调完成',
    '结论：生产 webhook 已联调完成',
    '状态：AI-5 客户正式模板已确认',
    '结论：AI-5 客户正式模板已确认'
  ])
}

if (failures.length > 0) {
  console.error('AI production governance local hardening check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('AI production governance local hardening check ok')
