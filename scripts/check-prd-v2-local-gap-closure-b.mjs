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
requireCurrentPointerAtOrAfter(acceptance, fs, failures, 'GOAL-008')
if (!Array.isArray(acceptance.goals) || !acceptance.goals.some((goal) => goal.id === 'GOAL-008')) {
  failures.push('acceptance.json missing GOAL-008 checks')
}

requireText('goals/GOAL-008-prd-v2-local-gap-closure-b-20260707.md', [
  '# GOAL-008 PRD V2 Local Gap Closure B',
  'Task 8 remains `NOT_READY`',
  'quality_record',
  'status workflow',
  'prd-v2-local-feature-gaps',
  'customer-pm-confirmations'
])

requireText('tasks/TASK-009-prd-v2-local-gap-closure-b-20260707.md', [
  '# TASK-009 PRD V2 Local Gap Closure B',
  'Goal: `goals/GOAL-008-prd-v2-local-gap-closure-b-20260707.md`',
  '## Checklist',
  'Scope:',
  'Non-goals:',
  'Acceptance:',
  'Verification:',
  'Backend model and status workflow',
  'Frontend and OpenAPI contract',
  'Machine checks and documentation writeback'
])

requireText('package.json', [
  'check:prd-v2-gap-closure-b',
  'scripts/check-prd-v2-local-gap-closure-b.mjs'
])

requireText('backend/platform-server/src/main/resources/db/migration/V35__quality_record_independent_fact.sql', [
  'CREATE TABLE quality_record',
  'source_check_id',
  'rework_id',
  'status_note',
  'uk_quality_record_source_check'
])

requireText('backend/platform-server/src/main/java/com/yuri/aiorder/quality/QualityRecordService.java', [
  'quality_record',
  'QUALITY_RECORD_STATUSES',
  'updateStatus',
  'status_note',
  'check_record',
  'rework_record'
])

requireText('backend/platform-server/src/test/java/com/yuri/aiorder/quality/QualityRecordTests.java', [
  'externalReturnWritesIndependentQualityRecordFact',
  'adminCanAdvanceQualityRecordStatusButDoctorCannot',
  'quality_record',
  '/quality-records/{qualityRecordId}/status'
])

requireText('frontend/src/App.vue', [
  'qualityRecordStatusId',
  'quality-record-status-button',
  '/quality-records/${qualityRecordId}/status',
  'status_note'
])

requireText('docs/api/openapi.yaml', [
  'QualityRecordStatusUpdateRequest',
  '"/quality-records/{qualityRecordId}/status"',
  'updateQualityRecordStatus',
  'quality_record 独立事实表'
])

requireText('docs/acceptance/prd-v2-gap-matrix.md', [
  'PRD V2 本地功能差异收口 B',
  'GOAL-008-prd-v2-local-gap-closure-b-20260707.md',
  'TASK-009-prd-v2-local-gap-closure-b-20260707.md',
  'quality_record',
  '质量记录独立模型 / 状态工作流第一段',
  'Task 8'
])

for (const file of [
  'STATUS.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md'
]) {
  requireText(file, [
    'GOAL-008',
    'TASK-009',
    'PRD V2 本地功能差异收口 B',
    'check:prd-v2-gap-closure-b',
    'Task 8'
  ])
}

requireText('acceptance.json', [
  'GOAL-008',
  'goals/GOAL-008-prd-v2-local-gap-closure-b-20260707.md',
  'tasks/TASK-009-prd-v2-local-gap-closure-b-20260707.md',
  'check:prd-v2-gap-closure-b',
  'quality-record-independent-model-migration',
  'quality-record-independent-model-service',
  'quality-record-openapi-required-text'
])

for (const gapId of ['prd-v2-local-feature-gaps', 'frontend-business-pages', 'ai-production-governance']) {
  const gap = acceptance.task8_readiness_gaps?.find((item) => item.id === gapId)
  if (!gap || gap.status !== 'PARTIAL') {
    failures.push(`acceptance.json expected ${gapId} to remain PARTIAL`)
  }
}
const customerPm = acceptance.task8_readiness_gaps?.find((item) => item.id === 'customer-pm-confirmations')
if (!customerPm || customerPm.status !== 'PARTIAL') {
  failures.push('acceptance.json expected customer-pm-confirmations to use the corrected PARTIAL classification')
}

for (const file of [
  'goals/GOAL-008-prd-v2-local-gap-closure-b-20260707.md',
  'tasks/TASK-009-prd-v2-local-gap-closure-b-20260707.md',
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
    '客户最终质量口径已确认'
  ])
}

if (failures.length > 0) {
  console.error('PRD V2 local gap closure B check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('PRD V2 local gap closure B check ok')
