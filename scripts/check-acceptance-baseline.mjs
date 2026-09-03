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
      failures.push(`${file} contains stale or unsafe text: ${fragment}`)
    }
  }
}

requireText('docs/INDEX.md', [
  'ACTIVE / 2026-08-25',
  '7013b1434759df6ca77a65893dbdcf0129e9af7b',
  '`PASS` | 29',
  '`PARTIAL` | 1',
  '`MISSING` | 0',
  '`EXTERNAL_ACCEPTANCE` | 8',
  'Task 8 继续保持 `NOT_READY`',
])

requireText('docs/DELIVERY-GAP.md', [
  '# 一期交付缺口清单（当前权威）',
  'MySQL 部署前备份',
  'MinIO 对象备份／恢复',
  '普通生产账号因无分配工单仍为 `PARTIAL`',
  '管理端安全配置入口',
  '29 PASS、1 PARTIAL、0 MISSING、8 EXTERNAL_ACCEPTANCE',
  'CP-002 动态表单资料已经收到',
  'CP-005 文件要求也已经收到',
  '本地配置／代码缺口已关闭',
  'Task 8 只有在上述交付证据关闭后才能改为 READY',
])

forbidText('docs/INDEX.md', [
  '客户正在采购服务器',
  '国际化实际覆盖率约 1%',
  'HTTPS 完全没有',
])

const auditFile = 'docs/acceptance/prd-v2-38-item-acceptance-audit-20260715.md'
const audit = read(auditFile)
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
const gaps = acceptance.task8_readiness_gaps ?? []
if (gaps.length !== 9) {
  failures.push(`acceptance.json expected 9 Task 8 gaps, got ${gaps.length}`)
}
for (const gap of gaps) {
  if (gap.status !== 'PARTIAL') {
    failures.push(`gap ${gap.id} must remain PARTIAL during this calibration, got ${gap.status}`)
  }
  if (!String(gap.source).startsWith('docs/DELIVERY-GAP.md#')) {
    failures.push(`gap ${gap.id} must point to current DELIVERY-GAP source`)
  }
}

const byId = new Map(gaps.map((gap) => [gap.id, gap]))
if (!byId.get('deployment-infrastructure')?.current_evidence.includes('7013b1434759df6ca77a65893dbdcf0129e9af7b')) {
  failures.push('deployment-infrastructure missing current production release evidence')
}
if (!byId.get('deployment-infrastructure')?.remaining_reason.includes('MinIO 对象备份／恢复')) {
  failures.push('deployment-infrastructure must keep MinIO backup and restore open')
}
if (!byId.get('ai-production-governance')?.remaining_reason.includes('管理端安全配置入口尚未实现')) {
  failures.push('ai-production-governance must keep admin AI key configuration open')
}
if (!byId.get('file-upload-prod')?.current_evidence.includes('每订单文件数已校准为 50')) {
  failures.push('file-upload-prod must record the local 50-file implementation fix')
}
if (byId.get('customer-pm-confirmations')?.remaining_reason.includes('仍缺 2 项产品参数确认')) {
  failures.push('customer-pm-confirmations must not ask for CP-002 or CP-005 again')
}
if (!byId.get('customer-pm-confirmations')?.current_evidence.includes('USER_DEFERRED')) {
  failures.push('customer-pm-confirmations must record the user-deferred input state')
}
if (byId.get('customer-pm-confirmations')?.minimum_closure_loop.includes('并行收集 AI-5')) {
  failures.push('customer-pm-confirmations must not actively solicit user-deferred inputs')
}
if (byId.get('prd-v2-local-feature-gaps')?.remaining_reason.includes('本地仍有 4 项 MISSING')) {
  failures.push('prd-v2-local-feature-gaps still contains the superseded 4 MISSING conclusion')
}
if (acceptance.active_goal !== 'GOAL-037') {
  failures.push(`acceptance.json active_goal is not GOAL-037: ${acceptance.active_goal}`)
}
if (acceptance.active_task_file !== 'tasks/TASK-039-doctor-order-simplification-and-catalog-mapping-20260825.md') {
  failures.push(`acceptance.json active_task_file is not TASK-039: ${acceptance.active_task_file}`)
}

requireText('tasks/TASK-038-phase-one-acceptance-baseline-calibration-20260825.md', [
  '## Objective',
  '## Scope',
  '## Non-goals',
  '## Acceptance Criteria',
  '## Verification Commands',
  '## Assumption Checks',
  '## Downstream Impact',
  'Task 8',
])
requireText('goals/GOAL-037-phase-one-report-followup-closure-20260825.md', [
  'Status: `completed`',
  '基础信息与产品',
  '制作配置',
  '资料上传',
  '复核与提交',
  '完整 CRM',
  'CAD／设计软件',
  '螺旋扩弓器（单向）/（双向）',
  'D-212',
  'D-213',
  'D-215',
  'Task 8 继续保持 `NOT_READY`',
])
requireText('tasks/TASK-039-doctor-order-simplification-and-catalog-mapping-20260825.md', [
  'Status: `completed`',
  '6 → 4',
  '推簧',
  'D-211',
  'D-212',
  'D-213',
  'D-215',
  '第 2、3 项按 D-207 留在二期',
])
requireText('docs/development/doctor-order-wizard-simplification-plan-20260825.md', [
  'IMPLEMENTED / LOCALLY_VERIFIED',
  '当前 2 + 3',
  '当前 5 + 6',
  '字段和动态表单项全部保留',
  '数字设计交付',
  '12 小时／24 小时／3 天',
  '43 项',
])
requireText('DECISIONS.md', ['## D-213', '## D-212', '## D-208', '## D-207', '## D-205', '## D-204', '29 PASS、1 PARTIAL、0 MISSING、8 EXTERNAL_ACCEPTANCE'])
requireText('docs/requirements/dynamic-order-form-final-source-snapshot-20260825.md', [
  '状态：`SOURCE_SUMMARY_WITH_VERIFIED_UPLOAD_EXCERPTS`',
  '弹簧矫正器',
  '螺旋扩弓器（单向）/（双向）',
  '加弹簧',
  '原表没有出现“推簧”',
])
requireText('docs/requirements/orthodontic-product-selection-gap-analysis-20260825.md', [
  'PUSH_SPRING_USER_DEFERRED',
  'SCREW_EXPANDER_IMPLEMENTED_LOCAL',
  '医生必须选择方向',
  '螺旋扩弓器单向／双向已补齐并写入订单快照',
])

if (failures.length > 0) {
  console.error('acceptance baseline check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('acceptance baseline check ok: 38 items = 29 PASS + 1 PARTIAL + 0 MISSING + 8 EXTERNAL_ACCEPTANCE; Task 8 remains NOT_READY')
