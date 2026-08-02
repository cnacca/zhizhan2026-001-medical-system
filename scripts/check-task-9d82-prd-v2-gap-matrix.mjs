import fs from 'node:fs'

const failures = []

const checks = [
  ['docs/acceptance/prd-v2-gap-matrix.md', [
    'Latest PRD V2.0 Gap Matrix',
    'baseline-aligned / NOT_READY',
    'PRD V2.0 / 2026-07-04',
    '版本风险',
    '医生患者管理',
    '医生支付管理',
    '客服客户管理',
    '客服产品管理',
    '人员管理',
    '专项质量管理',
    '设备 / 物料 / 安环 / 成本 / 奖惩',
    '2026-07-06 内部确认基准',
    'PARTIAL / C_BASELINE',
    'LangChain + DeepSeek',
    '所有 AI 智能体使用 LangChain + DeepSeek 实现',
    'AI-5 生产备注',
    'patient',
    'quality_record',
    'Task 8 仍保持 `in-progress / NOT_READY`',
    'A/B 类一期范围对齐第一段',
    '9D.93.1 PRD V2 范围纠偏记录',
    '医生文件模块不属于项目需求范围，不开发'
  ]],
  ['PROJECT.md', [
    'PRD V2.0 / 2026-07-04',
    'docs/acceptance/prd-v2-gap-matrix.md',
    '基础患者管理',
    '基础支付流水',
    '客户档案与偏好',
    '人员档案',
    '专项质量管理',
    '2026-07-06 基准',
    'C 类入口、基础台账、基础登记、状态更新或架构预留',
    '所有 AI 智能体使用 LangChain + DeepSeek 实现'
  ]],
  ['STATUS.md', [
    '9D.82 最新 PRD V2.0 差异对齐矩阵第一段',
    'docs/acceptance/prd-v2-gap-matrix.md',
    '9D.93.1 PRD V2 范围纠偏第一闭环',
    '9D.100 A/B 类一期范围对齐第二段已完成',
    'PRD V2 本地功能差异收口 A'
  ]],
  ['DECISIONS.md', [
    'D-133 任务 9D.82 最新 PRD V2.0 差异对齐矩阵第一段',
    'PRD V2.0 / 2026-07-04',
    '2026-07-06 一期范围内部确认基准',
    '所有 AI 智能体使用 LangChain + DeepSeek'
  ]],
  ['tasks/README.md', [
    '任务 9D.82：最新 PRD V2.0 差异对齐矩阵第一段',
    'docs/acceptance/prd-v2-gap-matrix.md',
    '2026-07-06 接手基准已确认'
  ]],
  ['README.md', [
    'docs/acceptance/prd-v2-gap-matrix.md',
    'npm run check:task9d82'
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.82 最新 PRD V2.0 差异对齐矩阵第一段',
    'docs/acceptance/prd-v2-gap-matrix.md'
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '9D.82 最新 PRD V2.0 差异对齐矩阵第一段',
    'PRD V2.0'
  ]],
  ['docs/deployment/task-8-final-readiness-report.md', [
    '9D.82 最新 PRD V2.0 差异对齐矩阵第一段',
    'docs/acceptance/prd-v2-gap-matrix.md'
  ]],
  ['acceptance.json', [
    'GOAL-007',
    'prd-v2-gap-matrix.md',
    'check:task9d82',
    'check:prd-v2-gap-closure-a'
  ]],
  ['package.json', [
    'check:task9d82'
  ]]
]

for (const [file, fragments] of checks) {
  if (!fs.existsSync(file)) {
    failures.push(`${file} -> file missing`)
    continue
  }
  const content = fs.readFileSync(file, 'utf8')
  for (const fragment of fragments) {
    if (!content.includes(fragment)) {
      failures.push(`${file} -> ${fragment}`)
    }
  }
}

const matrixPath = 'docs/acceptance/prd-v2-gap-matrix.md'
if (fs.existsSync(matrixPath)) {
  const matrix = fs.readFileSync(matrixPath, 'utf8')
  const forbidden = [
    'Task 8 已完成',
    'Task 8 READY',
    '客户已确认',
    'PM 已确认',
    '真实支付已接入',
    '真实物流 API 已接入',
    '真实电子签章已完成'
  ]
  for (const phrase of forbidden) {
    if (matrix.includes(phrase)) {
      failures.push(`${matrixPath} -> forbidden completion claim: ${phrase}`)
    }
  }
}

if (failures.length > 0) {
  console.error('task 9D.82 PRD V2.0 gap matrix check failed:')
  for (const failure of failures) {
    console.error(`- missing ${failure}`)
  }
  process.exit(1)
}

console.log('task 9D.82 PRD V2.0 gap matrix check ok')
