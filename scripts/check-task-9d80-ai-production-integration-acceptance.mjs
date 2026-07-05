import fs from 'node:fs'

const failures = []

const checks = [
  ['package.json', ['check:task9d80']],
  ['docs/acceptance/task-9d80-ai-production-integration-acceptance.md', [
    '9D.80',
    'AI 真实 key / 生产 webhook 联调记录模板第一段',
    '待填写',
    '待确认',
    'DEEPSEEK_API_KEY',
    'AI_PROVIDER=deepseek',
    'AI_DEEPSEEK_ENABLED=true',
    'AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=true',
    'AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_ENABLED=true',
    'AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED=true',
    '生产 webhook',
    '真实 key 只能外部注入',
    '不填写真实密钥',
    '不填写真实 webhook URL',
    '不代表真实 key 已联调完成',
    '不代表生产 webhook 已联调完成',
    'Task 8 仍保持 NOT_READY'
  ]],
  ['acceptance.json', [
    'task-9d80-ai-production-integration-acceptance-required-text',
    'check:task9d80',
    'AI 真实 key / 生产 webhook 联调记录模板第一段'
  ]],
  ['STATUS.md', ['9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段']],
  ['DECISIONS.md', ['D-131 任务 9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段']],
  ['tasks/README.md', ['任务 9D.80：AI 真实 key / 生产 webhook 联调记录模板第一段']],
  ['README.md', ['check:task9d80', 'AI 真实 key / 生产 webhook 联调记录模板第一段']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段']],
  ['docs/deployment/readiness-checklist.md', ['9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段']],
  ['docs/deployment/task-8-final-readiness-report.md', ['9D.80 AI 真实 key / 生产 webhook 联调记录模板第一段']]
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

const templatePath = 'docs/acceptance/task-9d80-ai-production-integration-acceptance.md'
if (fs.existsSync(templatePath)) {
  const template = fs.readFileSync(templatePath, 'utf8')
  const forbiddenConfirmedPhrases = [
    '状态：真实 key 已联调完成',
    '结论：真实 key 已联调完成',
    '状态：生产 webhook 已联调完成',
    '结论：生产 webhook 已联调完成',
    '状态：生产外部告警已联调完成',
    '结论：生产外部告警已联调完成',
    '客户/PM 签字状态：已确认',
    '客户/PM 签字状态：已签字'
  ]
  for (const phrase of forbiddenConfirmedPhrases) {
    if (template.includes(phrase)) {
      failures.push(`${templatePath} -> forbidden confirmed phrase: ${phrase}`)
    }
  }

  const forbiddenSecretPatterns = [
    /DEEPSEEK_API_KEY\s*=\s*(?!待填写|external-secret|replace-with|<)[^\s|`]+/i,
    /AI_EXTERNAL_ALERT_WEBHOOK_URL\s*=\s*https?:\/\/[^\s|`]+/i,
    /AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET\s*=\s*(?!待填写|external-secret|replace-with|<)[^\s|`]+/i,
    /AI_EXTERNAL_ALERT_RECEIVER_SIGNING_SECRET\s*=\s*(?!待填写|external-secret|replace-with|<)[^\s|`]+/i,
    /sk-[A-Za-z0-9_-]{12,}/
  ]
  for (const pattern of forbiddenSecretPatterns) {
    if (pattern.test(template)) {
      failures.push(`${templatePath} -> forbidden secret-like value: ${pattern}`)
    }
  }
}

if (failures.length > 0) {
  console.error('task 9D.80 AI production integration acceptance check failed:')
  for (const failure of failures) {
    console.error(`- missing ${failure}`)
  }
  process.exit(1)
}

console.log('task 9D.80 AI production integration acceptance check ok')
