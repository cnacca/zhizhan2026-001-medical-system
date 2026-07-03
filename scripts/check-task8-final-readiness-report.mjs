import fs from 'node:fs'

const file = 'docs/deployment/task-8-final-readiness-report.md'
const text = fs.readFileSync(file, 'utf8')

const required = [
  '状态：NOT_READY',
  '缺口名称',
  '当前证据',
  '未完成原因',
  '需要补的最小闭环',
  '推荐验证命令或验收方式',
  '正式鉴权与 DataScope 收口',
  '部署基础设施',
  '操作手册',
  '客户 / PM 确认项',
  'Task 8 仍为 `in-progress / NOT_READY`',
]

for (const pattern of required) {
  if (!text.includes(pattern)) {
    console.error(`${file} missing required text: ${pattern}`)
    process.exit(1)
  }
}

console.log('task 8 final readiness report check ok')
