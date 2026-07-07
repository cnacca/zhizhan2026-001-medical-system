import fs from 'node:fs'

const checks = [
  ['docs/acceptance/phase-one-main-chain-customer-acceptance.md', [
    '12 步主链路客户验收版',
    'PASS/FAIL',
    '固定演示数据',
    '固定演示订单',
    '医生端最终外部状态',
    'COMPLETED',
    '医生下单',
    '客服审核',
    '生产审核',
    '管理员派工',
    '入检',
    '工时',
    '出检',
    '返工',
    '设计稿',
    '账单',
    '物流发货',
    '确认收货',
    '剩余缺口',
    'Task 8 仍保持 NOT_READY',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.68',
    '12 步主链路客户验收版收敛',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '9D.68 12 步主链路客户验收版收敛',
  ]],
  ['docs/deployment/task-8-final-readiness-report.md', [
    '9D.68',
    'phase-one-main-chain-customer-acceptance.md',
  ]],
  ['docs/acceptance/phase-one-frontend-alignment.md', [
    '9D.68',
  ]],
  ['docs/acceptance/phase-one-frontend-task-scope.md', [
    '9D.68',
  ]],
  ['acceptance.json', [
    'task-9d68-main-chain-customer-acceptance-required-text',
  ]],
  ['DECISIONS.md', [
    'D-119 任务 9D.68 12 步主链路客户验收版收敛',
  ]],
  ['STATUS.md', [
    '9D.68 12 步主链路客户验收版收敛',
  ]],
  ['tasks/README.md', [
    '任务 9D.68：12 步主链路客户验收版收敛',
  ]],
  ['README.md', [
    '9D.68 12 步主链路客户验收版收敛',
    'phase-one-main-chain-customer-acceptance.md',
  ]],
  ['package.json', [
    'check:task9d68',
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

console.log('task 9D.68 main chain customer acceptance check ok')
