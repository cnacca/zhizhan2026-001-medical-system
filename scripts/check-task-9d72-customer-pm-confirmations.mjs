import fs from 'node:fs'

const checks = [
  ['docs/acceptance/phase-one-customer-pm-confirmations.md', [
    '一期客户 / PM 确认与外部输入分类清单',
    '2026-07-15 校正版',
    '待客户 / PM 确认 2 项',
    'PRD 明确要求逐功能签字 0 项',
    '确认项编号',
    '当前分类',
    '付款状态口径',
    '动态表单最终字段',
    'AI-5 生产备注模板',
    '标准工时与绩效',
    '文件上传限制',
    '真实电子签章 / 复杂终检报告模板',
    '真实物流平台 / 运单同步',
    '客户培训与签收',
    'PENDING_CONFIRMATION',
    'CONFIRMED_BASELINE',
    'CUSTOMER_INPUT_REQUIRED',
    'BUSINESS_DATA_REQUIRED',
    'OUT_OF_PHASE_ONE',
    'DELIVERY_EVIDENCE_PENDING',
    'EXTERNAL_ENV_EVIDENCE_PENDING',
    'Task 8 仍保持 NOT_READY',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '9D.72 客户 / PM 确认项清单第一段',
    'docs/acceptance/phase-one-customer-pm-confirmations.md',
  ]],
  ['docs/deployment/task-8-final-readiness-report.md', [
    '9D.72',
    '已由 GOAL-021 / TASK-022 校正',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.72',
    '客户 / PM 确认项清单第一段',
  ]],
  ['docs/acceptance/phase-one-frontend-alignment.md', [
    '9D.72',
    '客户 / PM 确认项清单第一段',
  ]],
  ['docs/acceptance/phase-one-frontend-task-scope.md', [
    'T12 / 9D.72',
    '2 项待产品确认',
  ]],
  ['DECISIONS.md', [
    'D-123 任务 9D.72 客户 / PM 确认项清单第一段',
  ]],
  ['STATUS.md', [
    '9D.72 客户 / PM 确认项清单第一段',
  ]],
  ['tasks/README.md', [
    '任务 9D.72：客户 / PM 确认项清单第一段',
  ]],
  ['README.md', [
    '9D.72 客户 / PM 确认项清单第一段',
    'docs/acceptance/phase-one-customer-pm-confirmations.md',
  ]],
  ['acceptance.json', [
    'task-9d72-customer-pm-confirmations-required-text',
    'phase-one-customer-pm-confirmations.md',
  ]],
  ['package.json', [
    'check:task9d72',
  ]],
]

for (const [file, patterns] of checks) {
  if (!fs.existsSync(file)) {
    console.error(`${file} missing required file`)
    process.exit(1)
  }
  const text = fs.readFileSync(file, 'utf8')
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      console.error(`${file} missing required text: ${pattern}`)
      process.exit(1)
    }
  }
}

console.log('task 9D.72 customer/PM confirmations check ok')
