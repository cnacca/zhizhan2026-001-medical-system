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
if (acceptance.active_goal !== 'GOAL-009') {
  failures.push(`acceptance.json active_goal expected GOAL-009, got ${acceptance.active_goal}`)
}
if (acceptance.active_goal_file !== 'goals/GOAL-009-prd-v2-local-gap-closure-c-20260707.md') {
  failures.push(`acceptance.json active_goal_file expected GOAL-009 file, got ${acceptance.active_goal_file}`)
}
if (!Array.isArray(acceptance.goals) || !acceptance.goals.some((goal) => goal.id === 'GOAL-009')) {
  failures.push('acceptance.json missing GOAL-009 checks')
}

requireText('goals/GOAL-009-prd-v2-local-gap-closure-c-20260707.md', [
  '# GOAL-009 PRD V2 Local Gap Closure C',
  'Task 8 remains `NOT_READY`',
  'attachment_contexts',
  'AI-2 message attachment preview aggregation',
  'customer-pm-confirmations'
])

requireText('tasks/TASK-010-prd-v2-local-gap-closure-c-20260707.md', [
  '# TASK-010 PRD V2 Local Gap Closure C',
  'Goal: `goals/GOAL-009-prd-v2-local-gap-closure-c-20260707.md`',
  '## Checklist',
  'Scope:',
  'Non-goals:',
  'Acceptance:',
  'Verification:',
  'Backend AI-2 attachment context aggregation',
  'Frontend and OpenAPI contract',
  'Machine checks and documentation writeback'
])

requireText('package.json', [
  'check:prd-v2-gap-closure-c',
  'scripts/check-prd-v2-local-gap-closure-c.mjs'
])

requireText('backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayController.java', [
  'attachment_contexts',
  'attachmentContexts'
])

requireText('backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
  'buildCsAttachmentContexts',
  'CsAttachmentContext',
  'FileResourceService',
  'createPreviewUrl',
  '消息附件预览',
  '人工复核'
])

requireText('backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayTests.java', [
  'csQueryReturnsMessageAttachmentPreviewContextsForManualReview',
  'attachment_contexts',
  'MESSAGE_ATTACHMENT',
  'insertCompletedMessageAttachmentFile'
])

requireText('frontend/src/App.vue', [
  'AiAttachmentContext',
  'attachment_contexts',
  'csAiQueryAttachmentContexts',
  'cs-ai-query-attachment-contexts',
  '附件预览上下文'
])

requireText('docs/api/openapi.yaml', [
  'AiAttachmentContext',
  'attachment_contexts',
  'AI-2 客服查询聚合的订单附件短时效预览上下文'
])

for (const file of [
  'STATUS.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md'
]) {
  requireText(file, [
    'GOAL-009',
    'TASK-010',
    'PRD V2 本地功能差异收口 C',
    'attachment_contexts',
    'check:prd-v2-gap-closure-c',
    'Task 8'
  ])
}

requireText('acceptance.json', [
  'GOAL-009',
  'goals/GOAL-009-prd-v2-local-gap-closure-c-20260707.md',
  'tasks/TASK-010-prd-v2-local-gap-closure-c-20260707.md',
  'check:prd-v2-gap-closure-c',
  'ai2-attachment-context-controller',
  'ai2-attachment-context-service',
  'ai2-attachment-context-frontend',
  'ai2-attachment-context-openapi'
])

for (const gapId of ['prd-v2-local-feature-gaps', 'frontend-business-pages', 'ai-production-governance']) {
  const gap = acceptance.task8_readiness_gaps?.find((item) => item.id === gapId)
  if (!gap || gap.status !== 'PARTIAL') {
    failures.push(`acceptance.json expected ${gapId} to remain PARTIAL`)
  }
}
const customerPm = acceptance.task8_readiness_gaps?.find((item) => item.id === 'customer-pm-confirmations')
if (!customerPm || customerPm.status !== 'BLOCKED') {
  failures.push('acceptance.json expected customer-pm-confirmations to remain BLOCKED')
}

for (const file of [
  'goals/GOAL-009-prd-v2-local-gap-closure-c-20260707.md',
  'tasks/TASK-010-prd-v2-local-gap-closure-c-20260707.md',
  'STATUS.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md'
]) {
  forbidText(file, [
    'Task 8 状态：READY',
    'Task 8 已 READY',
    '真实 DeepSeek key 已完成',
    '真实 webhook 已完成',
    '客户生产备注模板已确认',
    '客户签字已完成',
    '真实环境验收已完成',
    '真实支付平台已接入并验收',
    '真实物流平台已接入并验收',
    '客户 AI-2 口径已确认'
  ])
}

if (failures.length > 0) {
  console.error('PRD V2 local gap closure C check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('PRD V2 local gap closure C check ok')
