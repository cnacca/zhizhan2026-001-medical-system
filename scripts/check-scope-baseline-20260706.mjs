import fs from 'node:fs'

const failures = []

const read = (file) => {
  if (!fs.existsSync(file)) {
    failures.push(`${file} -> file missing`)
    return ''
  }
  return fs.readFileSync(file, 'utf8')
}

const requireText = (file, fragments) => {
  const content = read(file)
  for (const fragment of fragments) {
    if (!content.includes(fragment)) {
      failures.push(`${file} -> missing ${fragment}`)
    }
  }
}

requireText('docs/acceptance/phase-one-scope-baseline-20260706.md', [
  '状态：active-baseline / NOT_READY',
  'A 类：一期必须修正',
  'A 类全部纳入一期修正',
  'B 类：一期基础版',
  'C 类：入口 / 台账 / 预留，不做完整闭环',
  '待问异常',
  'Task 8 仍保持 `NOT_READY`',
])

requireText('STATUS.md', [
  '2026-07-06 新需求范围已按用户确认的默认口径冻结',
  '不继续扩成一期完整管理闭环',
  '不写业务代码',
])

requireText('DECISIONS.md', [
  'D-142 2026-07-06 一期范围内部确认基准',
  'C 类只做入口、基础台账或架构预留',
  'Task 8 仍保持 `NOT_READY`',
])

requireText('tasks/README.md', [
  '2026-07-06 接手基准已确认',
  'C 类设备、物料、安环、成本、奖惩、行政、财务只保留入口、基础台账或架构预留',
  '设备 / 物料 / 安环 / 成本 / 奖惩不再作为一期完整闭环缺口',
])

requireText('README.md', [
  '2026-07-06 内部确认基准',
  '不再继续扩成一期完整管理闭环',
  '基础台账拆解记录',
])

requireText('docs/acceptance/prd-v2-gap-matrix.md', [
  '2026-07-06 内部确认基准',
  'PARTIAL / C_BASELINE',
  'A/B 类一期范围对齐第一段',
  '9D.95 设备 / 物料 / 安环 / 成本 / 奖惩基础台账拆解记录',
])

requireText('docs/acceptance/phase-one-frontend-task-scope.md', [
  'PARTIAL / C_BASELINE',
  'C 类入口 / 基础台账 / 预留',
  'A/B 类一期范围对齐第一段',
])

requireText('docs/acceptance/phase-one-frontend-alignment.md', [
  '2026-07-06 基准确认',
  '不再作为一期完整闭环缺口',
  'A/B 类一期范围对齐第一段',
])

requireText('docs/acceptance/task-8-acceptance-matrix.md', [
  '2026-07-06 基准',
  '不再作为一期完整闭环继续扩展',
  'Task 8 仍保持 NOT_READY',
])

requireText('docs/deployment/readiness-checklist.md', [
  '2026-07-06 基准',
  'C 类设备 / 物料 / 安环 / 成本 / 奖惩',
  '9D.95 设备 / 物料 / 安环 / 成本 / 奖惩基础台账拆解记录',
])

requireText('docs/deployment/task-8-final-readiness-report.md', [
  '2026-07-06 基准',
  'A/B 类一期范围对齐第一段',
  'Task 8 仍保持 `NOT_READY`',
])

requireText('acceptance.json', [
  'docs/acceptance/phase-one-scope-baseline-20260706.md',
  'A/B 类一期范围对齐',
  'C 类基础能力',
])

requireText('package.json', [
  'check:scope-baseline-20260706',
])

const forbiddenCompletionClaims = [
  'Task 8 READY',
  '真实 DeepSeek key 已完成',
  '真实 webhook 已完成',
  '客户模板已确认',
]

for (const file of [
  'docs/acceptance/phase-one-scope-baseline-20260706.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/deployment/readiness-checklist.md',
  'docs/deployment/task-8-final-readiness-report.md',
  'STATUS.md',
  'tasks/README.md',
]) {
  const content = read(file)
  for (const phrase of forbiddenCompletionClaims) {
    if (content.includes(phrase)) {
      failures.push(`${file} -> forbidden completion claim: ${phrase}`)
    }
  }
}

if (failures.length > 0) {
  console.error('scope baseline 2026-07-06 check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('scope baseline 2026-07-06 check ok')
