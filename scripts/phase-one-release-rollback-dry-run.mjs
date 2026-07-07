import fs from 'node:fs'

const failures = []

const read = (file) => {
  if (!fs.existsSync(file)) {
    failures.push(`${file} missing`)
    return ''
  }
  return fs.readFileSync(file, 'utf8')
}

const requireText = (file, fragments) => {
  const content = read(file)
  for (const fragment of fragments) {
    if (!content.includes(fragment)) {
      failures.push(`${file} missing required text: ${fragment}`)
    }
  }
}

const forbidText = (file, fragments) => {
  const content = read(file)
  for (const fragment of fragments) {
    if (content.includes(fragment)) {
      failures.push(`${file} contains forbidden text: ${fragment}`)
    }
  }
}

requireText('deploy/docker-compose.phase-one.yml', [
  'SPRING_PROFILES_ACTIVE: prod',
  'APP_AUTH_ALLOW_BOOTSTRAP_HEADERS: "false"',
  'APP_AUTH_ALLOW_ROLE_FALLBACK: "false"',
  '${APP_AUTH_TOKEN_SECRET:?inject APP_AUTH_TOKEN_SECRET externally}',
  '${MINIO_BUCKET:?inject production bucket name externally}',
  'healthcheck:',
  'condition: service_healthy'
])

requireText('deploy/env/phase-one.prod.example', [
  'Do not commit real secrets',
  'APP_AUTH_TOKEN_SECRET=replace-with-external-secret',
  'APP_AUTH_ALLOW_BOOTSTRAP_HEADERS=false',
  'APP_AUTH_ALLOW_ROLE_FALLBACK=false',
  'AI_PROVIDER=deterministic',
  'AI_DEEPSEEK_ENABLED=false',
  'AI_EXTERNAL_ALERT_WEBHOOK_ENABLED=false',
  'AI_EXTERNAL_ALERT_SCHEDULER_ENABLED=false',
  'AI_EXTERNAL_ALERT_RECEIVER_VERIFICATION_ENABLED=false'
])

requireText('frontend/nginx.conf', [
  'location /api/',
  'location /notifications',
  'location /ws/',
  'proxy_set_header Upgrade $http_upgrade',
  'try_files $uri $uri/ /index.html'
])

requireText('docs/deployment/phase-one-local-ops-dry-run.md', [
  '本地 release / rollback dry-run 检查',
  'dry-run:phase-one-release-rollback',
  '备份 / 恢复 dry-run 模板第一段',
  '日志留存 / 监控告警配置模板第一段',
  'compose / env / Nginx / healthcheck 静态检查',
  '待填写',
  '待确认',
  '不代表真实服务器、HTTPS、备份恢复、监控告警或客户签字已完成',
  'Task 8 仍保持 NOT_READY'
])

requireText('docs/operations/phase-one-rollback-runbook.md', [
  '本地 release / rollback dry-run 检查',
  'phase-one-local-ops-dry-run.md',
  'dry-run:phase-one-release-rollback',
  '备份 / 恢复 dry-run 模板第一段',
  '日志留存 / 监控告警配置模板第一段'
])

requireText('docs/operations/phase-one-training-materials.md', [
  'phase-one-local-ops-dry-run.md',
  'readiness 联动',
  '不代表正式客户培训签收完成'
])

forbidText('docs/deployment/phase-one-local-ops-dry-run.md', [
  '状态：真实服务器已部署完成',
  '结论：真实服务器已部署完成',
  '状态：HTTPS 已验收完成',
  '结论：HTTPS 已验收完成',
  '状态：备份恢复演练已完成',
  '结论：备份恢复演练已完成',
  '状态：监控告警已验收完成',
  '结论：监控告警已验收完成',
  '客户/PM 签字状态：已确认',
  '客户/PM 签字状态：已签字',
  'Task 8 已 READY',
  'deployment-infrastructure 已 READY',
  'operations-manuals 已 READY'
])

const combined = [
  read('docs/deployment/phase-one-local-ops-dry-run.md'),
  read('docs/operations/phase-one-rollback-runbook.md')
].join('\n')

for (const pattern of [
  /(?:password|secret|token|key)\s*[:=]\s*(?!待填写|external-secret|replace-with|<)[^\s|`]+/i,
  /https?:\/\/(?:\d{1,3}\.){3}\d{1,3}[^\s|`]*/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/
]) {
  if (pattern.test(combined)) {
    failures.push(`dry-run docs contain forbidden secret-like value: ${pattern}`)
  }
}

if (failures.length > 0) {
  console.error('phase-one release / rollback dry-run failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('phase-one release / rollback dry-run ok')
