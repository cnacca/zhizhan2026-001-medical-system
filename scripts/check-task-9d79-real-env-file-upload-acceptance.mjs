import fs from 'node:fs'

const failures = []

const checks = [
  ['package.json', ['check:task9d79']],
  ['docs/acceptance/task-9d79-real-env-file-upload-manual-acceptance.md', [
    '9D.79',
    '真实环境文件上传人工验收记录模板第一段',
    '待填写',
    '测试环境',
    '正式环境',
    '测试 bucket',
    '正式 bucket',
    '对象存储账号隔离',
    '弱网',
    '跨设备',
    '不填写真实密钥',
    '不代表真实环境已验收',
    '客户/PM 签字状态：待确认',
    'Task 8 仍保持 NOT_READY'
  ]],
  ['acceptance.json', [
    'task-9d79-real-env-file-upload-manual-acceptance-required-text',
    'check:task9d79',
    '真实环境文件上传人工验收记录模板第一段'
  ]],
  ['STATUS.md', ['9D.79 真实环境文件上传人工验收记录模板第一段']],
  ['DECISIONS.md', ['D-130 任务 9D.79 真实环境文件上传人工验收记录模板第一段']],
  ['tasks/README.md', ['任务 9D.79：真实环境文件上传人工验收记录模板第一段']],
  ['README.md', ['check:task9d79', '真实环境文件上传人工验收记录模板第一段']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.79 真实环境文件上传人工验收记录模板第一段']],
  ['docs/deployment/readiness-checklist.md', ['9D.79 真实环境文件上传人工验收记录模板第一段']],
  ['docs/deployment/task-8-final-readiness-report.md', ['9D.79 真实环境文件上传人工验收记录模板第一段']]
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

const templatePath = 'docs/acceptance/task-9d79-real-env-file-upload-manual-acceptance.md'
if (fs.existsSync(templatePath)) {
  const template = fs.readFileSync(templatePath, 'utf8')
  const forbiddenConfirmedPhrases = [
    '客户/PM 签字状态：已确认',
    '客户/PM 签字状态：已签字',
    '状态：真实环境已验收',
    '结论：真实环境已验收',
    '状态：正式环境已验收',
    '结论：正式环境已验收',
    '状态：生产对象存储已联调完成',
    '结论：生产对象存储已联调完成'
  ]
  for (const phrase of forbiddenConfirmedPhrases) {
    if (template.includes(phrase)) {
      failures.push(`${templatePath} -> forbidden confirmed phrase: ${phrase}`)
    }
  }
}

if (failures.length > 0) {
  console.error('task 9D.79 real env file upload manual acceptance check failed:')
  for (const failure of failures) {
    console.error(`- missing ${failure}`)
  }
  process.exit(1)
}

console.log('task 9D.79 real env file upload manual acceptance check ok')
