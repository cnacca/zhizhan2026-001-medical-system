import fs from 'node:fs'

const checks = [
  ['package.json', [
    'check:task9d77',
    'smoke:task9d77-file-upload-resilience'
  ]],
  ['scripts/smoke-task-9d77-file-upload-resilience.spec.mjs', [
    'TASK9D77_WEAK_NETWORK_DELAY_MS',
    'TASK9D77_CROSS_DEVICE_UPLOAD_SIZE_BYTES',
    'cross-device resume',
    'weak network',
    'browser.newContext',
    'doctor-order-upload:',
    'multipart/status',
    'doctor-upload-completed-file-id',
    'task 9D.77 file upload resilience first increment ok'
  ]],
  ['docs/acceptance/task-9d77-file-upload-resilience.md', [
    '9D.77',
    '弱网限速 / 断网',
    '跨设备续传',
    '不代表真实生产对象存储联调完成',
    'Task 8 仍保持 NOT_READY'
  ]],
  ['acceptance.json', [
    'file-upload-prod',
    '9D.77 弱网 / 跨设备验收第一段',
    'smoke:task9d77-file-upload-resilience'
  ]],
  ['STATUS.md', ['9D.77 文件上传弱网 / 跨设备验收第一段']],
  ['DECISIONS.md', ['D-128 任务 9D.77 文件上传弱网 / 跨设备验收第一段']],
  ['tasks/README.md', ['任务 9D.77：文件上传弱网 / 跨设备验收第一段']],
  ['README.md', ['smoke:task9d77-file-upload-resilience']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.77 文件上传弱网 / 跨设备验收第一段']],
  ['docs/deployment/readiness-checklist.md', ['9D.77 文件上传弱网 / 跨设备验收第一段']],
  ['docs/deployment/task-8-final-readiness-report.md', ['9D.77 文件上传弱网 / 跨设备验收第一段']]
]

const missing = []

for (const [file, fragments] of checks) {
  if (!fs.existsSync(file)) {
    missing.push(`${file} -> file missing`)
    continue
  }
  const content = fs.readFileSync(file, 'utf8')
  for (const fragment of fragments) {
    if (!content.includes(fragment)) {
      missing.push(`${file} -> ${fragment}`)
    }
  }
}

if (missing.length > 0) {
  console.error('task 9D.77 file upload resilience check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.77 file upload resilience check ok')
