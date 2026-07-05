import fs from 'node:fs'

const failures = []

const checks = [
  ['package.json', ['check:task9d81']],
  ['docs/deployment/task-9d81-production-deployment-acceptance.md', [
    '9D.81',
    '部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段',
    '待填写',
    '待确认',
    'HTTPS',
    'Nginx',
    'Docker Compose',
    '镜像仓库',
    '数据库备份',
    '备份恢复演练',
    '日志留存',
    '监控告警',
    '发布回滚',
    'APP_AUTH_TOKEN_SECRET',
    'MINIO_ACCESS_KEY',
    'DEEPSEEK_API_KEY',
    '真实密钥必须外部注入',
    '不填写真实密钥',
    '不填写真实服务器地址',
    '不代表真实服务器已部署完成',
    '不代表 HTTPS 已验收完成',
    'Task 8 仍保持 NOT_READY'
  ]],
  ['acceptance.json', [
    'task-9d81-production-deployment-acceptance-required-text',
    'check:task9d81',
    '部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段'
  ]],
  ['STATUS.md', ['9D.81 部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段']],
  ['DECISIONS.md', ['D-132 任务 9D.81 部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段']],
  ['tasks/README.md', ['任务 9D.81：部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段']],
  ['README.md', ['check:task9d81', '部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.81 部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段']],
  ['docs/deployment/readiness-checklist.md', ['9D.81 部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段']],
  ['docs/deployment/task-8-final-readiness-report.md', ['9D.81 部署真实环境 smoke / HTTPS / 备份监控验收记录模板第一段']]
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

const templatePath = 'docs/deployment/task-9d81-production-deployment-acceptance.md'
if (fs.existsSync(templatePath)) {
  const template = fs.readFileSync(templatePath, 'utf8')
  const forbiddenConfirmedPhrases = [
    '状态：真实服务器已部署完成',
    '结论：真实服务器已部署完成',
    '状态：HTTPS 已验收完成',
    '结论：HTTPS 已验收完成',
    '状态：备份恢复已验收完成',
    '结论：备份恢复已验收完成',
    '状态：监控告警已验收完成',
    '结论：监控告警已验收完成',
    '客户/PM 签字状态：已确认',
    '客户/PM 签字状态：已签字'
  ]
  for (const phrase of forbiddenConfirmedPhrases) {
    if (template.includes(phrase)) {
      failures.push(`${templatePath} -> forbidden confirmed phrase: ${phrase}`)
    }
  }

  const forbiddenSecretPatterns = [
    /APP_AUTH_TOKEN_SECRET\s*=\s*(?!待填写|external-secret|replace-with|<)[^\s|`]+/i,
    /MINIO_ACCESS_KEY\s*=\s*(?!待填写|external-secret|replace-with|<)[^\s|`]+/i,
    /MINIO_SECRET_KEY\s*=\s*(?!待填写|external-secret|replace-with|<)[^\s|`]+/i,
    /DEEPSEEK_API_KEY\s*=\s*(?!待填写|external-secret|replace-with|<)[^\s|`]+/i,
    /https?:\/\/(?:\d{1,3}\.){3}\d{1,3}[^\s|`]*/i,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/
  ]
  for (const pattern of forbiddenSecretPatterns) {
    if (pattern.test(template)) {
      failures.push(`${templatePath} -> forbidden secret-like value: ${pattern}`)
    }
  }
}

if (failures.length > 0) {
  console.error('task 9D.81 production deployment acceptance check failed:')
  for (const failure of failures) {
    console.error(`- missing ${failure}`)
  }
  process.exit(1)
}

console.log('task 9D.81 production deployment acceptance check ok')
