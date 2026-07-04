import fs from 'node:fs'

const checks = [
  ['docs/acceptance/phase-one-customer-pm-confirmations.md', [
    '一期客户 / PM 确认项清单第一段',
    '确认项编号',
    '确认主题',
    '当前默认方案',
    '负责人',
    '期望确认日期',
    '当前状态',
    '未决风险',
    '付款状态口径',
    '动态表单最终字段',
    'AI-5 生产备注模板',
    '标准工时与绩效公式口径',
    'Multipart 上传限制',
    '真实电子签章 / 终检报告模板',
    '真实物流平台 / 运单同步',
    '客户培训与签收',
    'Task 8 仍保持 NOT_READY',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '9D.72 客户 / PM 确认项清单第一段',
    'docs/acceptance/phase-one-customer-pm-confirmations.md',
  ]],
  ['docs/deployment/task-8-final-readiness-report.md', [
    '9D.72',
    '客户 / PM 确认项清单第一段',
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
    '客户 / PM 确认项清单第一段',
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
