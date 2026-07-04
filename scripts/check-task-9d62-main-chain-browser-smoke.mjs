import fs from 'node:fs'

const checks = [
  ['scripts/smoke-task-9d62-main-chain.spec.mjs', [
    'phaseOneMainChainSteps',
    '1. 医生下单',
    '2. 客服初审',
    '3. 生产审核',
    '4. 派工到任务池',
    '5. 入检开工完工',
    '6. 出检推进',
    '7. 返工可见',
    '8. 设计稿确认',
    '9. 消息客服审核',
    '10. 账单物流',
    '11. 医生 AI 安全查询',
    '12. 医生确认收货',
    'TASK9D62_FRONTEND_URL',
    'TASK9D62_BROWSER_CHANNEL',
    'task 9D.62 phase-one main-chain browser smoke ok',
  ]],
  ['package.json', [
    'check:task9d62',
    'smoke:task9d62',
    'scripts/smoke-task-9d62-main-chain.spec.mjs',
  ]],
  ['acceptance.json', [
    'task-9d62-main-chain-browser-smoke-required-text',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.62',
    '12 步主链路浏览器 smoke 第一增量',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    'smoke:task9d62',
  ]],
  ['docs/deployment/task-8-final-readiness-report.md', [
    '9D.62',
  ]],
  ['DECISIONS.md', [
    'D-108 任务 9D.62 先固定 12 步主链路浏览器 smoke 入口',
  ]],
  ['STATUS.md', [
    '9D.62 12 步主链路浏览器 smoke 第一增量',
  ]],
  ['tasks/README.md', [
    '任务 9D.62：12 步主链路浏览器 smoke 第一增量',
  ]],
  ['README.md', [
    'smoke:task9d62',
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

console.log('task 9D.62 main-chain browser smoke check ok')
