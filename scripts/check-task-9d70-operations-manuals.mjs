import fs from 'node:fs'

const checks = [
  ['docs/operations/phase-one-role-operation-manual.md', [
    '一期四端操作手册第一段',
    '医生端',
    '客服端',
    '生产端',
    '管理端',
    '登录入口',
    '订单主链路',
    '文件上传',
    '设计稿',
    '账单物流',
    '通知中心',
    'AI 助手',
    'Task 8 仍保持 NOT_READY',
  ]],
  ['docs/operations/phase-one-troubleshooting-guide.md', [
    '一期故障处理清单第一段',
    '登录失败',
    '后端不可用',
    '上传失败',
    'WebSocket',
    'AI 返回 deterministic',
    'Docker / Compose',
    '不要删除数据',
    '不要提交真实密钥',
  ]],
  ['docs/operations/phase-one-delivery-materials-index.md', [
    '一期交付材料索引第一段',
    '操作手册',
    '故障处理清单',
    '12 步主链路客户验收版',
    'Task 8 Final Readiness Report',
    'phase-one-docker-env.md',
    '客户 / PM 确认项',
    'Task 8 仍保持 NOT_READY',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '9D.70 操作手册与交付材料第一段',
    'docs/operations/phase-one-role-operation-manual.md',
  ]],
  ['docs/deployment/task-8-final-readiness-report.md', [
    '9D.70',
    'phase-one-troubleshooting-guide.md',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.70',
    '一期交付材料索引第一段',
  ]],
  ['DECISIONS.md', [
    'D-121 任务 9D.70 操作手册与交付材料第一段',
  ]],
  ['STATUS.md', [
    '9D.70 操作手册与交付材料第一段',
  ]],
  ['tasks/README.md', [
    '任务 9D.70：操作手册与交付材料第一段',
  ]],
  ['README.md', [
    '9D.70 操作手册与交付材料第一段',
    'docs/operations/phase-one-role-operation-manual.md',
  ]],
  ['acceptance.json', [
    'task-9d70-operations-manuals-required-text',
  ]],
  ['package.json', [
    'check:task9d70',
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

console.log('task 9D.70 operations manuals check ok')
