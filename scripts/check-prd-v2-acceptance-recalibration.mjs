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

const confirmationFile = 'docs/acceptance/phase-one-customer-pm-confirmations.md'
const auditFile = 'docs/acceptance/prd-v2-38-item-acceptance-audit-20260715.md'

requireText(confirmationFile, [
  '待客户 / PM 确认 0 项',
  'PRD 明确要求逐功能签字 0 项',
  'CP-002',
  'CP-005',
  'CUSTOMER_INPUT_REQUIRED',
  'BUSINESS_DATA_REQUIRED',
  'OUT_OF_PHASE_ONE',
  '38项全部是一阶段 P0 验收测试',
  'Task 8 仍保持 NOT_READY'
])

requireText(auditFile, [
  '# PRD V2 原验收表38项重算',
  '504e76d88f271ab985e034060b492b95d571ccb41aeed6b2aed1fe9d1cb43c37',
  'PASS` | 29',
  'PARTIAL` | 1',
  'MISSING` | 0',
  'EXTERNAL_ACCEPTANCE` | 8',
  '医生确认设计稿生产门禁',
  '出检通过后再激活后继节点',
  '不能单独用来宣称整个当前一期完成',
  'Task 8 仍保持 NOT_READY'
])

const audit = read(auditFile)
const expectedIds = [
  ...Array.from({ length: 13 }, (_, index) => `11.1-${String(index + 1).padStart(2, '0')}`),
  ...Array.from({ length: 4 }, (_, index) => `11.2-${String(index + 1).padStart(2, '0')}`),
  ...Array.from({ length: 4 }, (_, index) => `11.3-${String(index + 1).padStart(2, '0')}`),
  ...Array.from({ length: 5 }, (_, index) => `11.4-${String(index + 1).padStart(2, '0')}`),
  ...Array.from({ length: 5 }, (_, index) => `11.5-${String(index + 1).padStart(2, '0')}`),
  ...Array.from({ length: 7 }, (_, index) => `14.4-${String(index + 1).padStart(2, '0')}`)
]

for (const id of expectedIds) {
  const matches = audit.match(new RegExp(`\\| ${id.replace('.', '\\.')} \\|`, 'g')) ?? []
  if (matches.length !== 1) {
    failures.push(`${auditFile} expected exactly one row for ${id}, got ${matches.length}`)
  }
}

const rowStatuses = [...audit.matchAll(/^\| (?:11|14)\.\d-\d{2} \|.*\| `(PASS|PARTIAL|MISSING|EXTERNAL_ACCEPTANCE)` \|/gm)]
const counts = rowStatuses.reduce((result, match) => {
  result[match[1]] = (result[match[1]] ?? 0) + 1
  return result
}, {})

for (const [status, expected] of Object.entries({ PASS: 29, PARTIAL: 1, MISSING: 0, EXTERNAL_ACCEPTANCE: 8 })) {
  if ((counts[status] ?? 0) !== expected) {
    failures.push(`${auditFile} expected ${expected} ${status} rows, got ${counts[status] ?? 0}`)
  }
}

const acceptance = JSON.parse(read('acceptance.json') || '{}')
if (typeof acceptance.active_goal !== 'string' || !acceptance.active_goal.startsWith('GOAL-')) {
  failures.push(`acceptance.json active_goal must be a GOAL id, got ${acceptance.active_goal}`)
}
if (typeof acceptance.active_goal_file !== 'string' || !fs.existsSync(acceptance.active_goal_file)) {
  failures.push(`acceptance.json active_goal_file must exist, got ${acceptance.active_goal_file}`)
}
if (typeof acceptance.active_task_file !== 'string' || !fs.existsSync(acceptance.active_task_file)) {
  failures.push(`acceptance.json active_task_file must exist, got ${acceptance.active_task_file}`)
}
const customerGap = acceptance.task8_readiness_gaps?.find((gap) => gap.id === 'customer-pm-confirmations')
if (!customerGap || customerGap.status !== 'PARTIAL') {
  failures.push('acceptance.json customer-pm-confirmations must use corrected PARTIAL status')
}

requireText('docs/INDEX.md', [auditFile, 'Task 8'])
requireText('docs/DELIVERY-GAP.md', [auditFile, 'Task 8'])
requireText('DECISIONS.md', ['D-204', 'Task 8'])

requireText('package.json', [
  'check:prd-v2-acceptance-recalibration',
  'scripts/check-prd-v2-acceptance-recalibration.mjs'
])

if (failures.length > 0) {
  console.error('PRD V2 acceptance recalibration check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('PRD V2 acceptance recalibration check ok: 38 items = 29 PASS + 1 PARTIAL + 0 MISSING + 8 EXTERNAL_ACCEPTANCE')
