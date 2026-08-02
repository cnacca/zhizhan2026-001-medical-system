import fs from 'node:fs'

const checks = [
  ['frontend/src/App.vue', [
    'cs-ai-query-panel',
    'csAiQueryOrderId',
    'csAiQueryQuestion',
    'csAiQueryAnswer',
    '/ai/cs-query',
    '对外发送前需人工确认',
  ]],
  ['docs/acceptance/prd-v2-gap-matrix.md', [
    '9D.92',
    'AI-2 客服查询助手完整入口第一增量',
  ]],
  ['STATUS.md', [
    '9D.92 AI-2 客服查询助手完整入口第一增量',
  ]],
  ['tasks/README.md', [
    '任务 9D.92：AI-2 客服查询助手完整入口第一增量',
  ]],
  ['README.md', [
    'check:task9d92',
  ]],
  ['acceptance.json', [
    'task-9d92-cs-ai-query-entry-required-text',
  ]],
  ['package.json', [
    'check:task9d92',
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

console.log('task 9D.92 CS AI query entry check ok')
