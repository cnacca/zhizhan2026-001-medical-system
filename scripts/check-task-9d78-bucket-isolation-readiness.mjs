import fs from 'node:fs'

function read(file) {
  return fs.readFileSync(file, 'utf8')
}

function envValue(text, key) {
  const match = text.match(new RegExp(`^${key}=(.*)$`, 'm'))
  return match?.[1]?.trim() ?? ''
}

const localEnv = read('.env.example')
const prodEnv = read('deploy/env/phase-one.prod.example')
const localBucket = envValue(localEnv, 'MINIO_BUCKET')
const prodBucket = envValue(prodEnv, 'MINIO_BUCKET')

const failures = []

if (!localBucket) {
  failures.push('.env.example -> MINIO_BUCKET is missing')
}
if (!prodBucket) {
  failures.push('deploy/env/phase-one.prod.example -> MINIO_BUCKET is missing')
}
if (localBucket && prodBucket && localBucket === prodBucket) {
  failures.push('local and phase-one prod MINIO_BUCKET must differ')
}
if (prodBucket && !/replace-with|example|placeholder/i.test(prodBucket)) {
  failures.push('deploy/env/phase-one.prod.example -> MINIO_BUCKET must remain a placeholder example')
}

const checks = [
  ['package.json', ['check:task9d78']],
  ['deploy/docker-compose.phase-one.yml', [
    'MINIO_BUCKET: ${MINIO_BUCKET:?inject production bucket name externally}'
  ]],
  ['docs/deployment/phase-one-docker-env.md', [
    '测试环境和正式环境使用不同 MINIO_BUCKET',
    'deploy/env/phase-one.prod.example',
    '正式值必须通过部署平台、CI/CD secret、服务器环境变量或不入库的 env 文件注入'
  ]],
  ['docs/acceptance/task-9d78-bucket-isolation-readiness.md', [
    '9D.78',
    '测试 / 正式对象存储 bucket 隔离验收记录第一段',
    '本地开发 bucket',
    '正式环境 bucket',
    '不接真实生产对象存储',
    '不提交真实 MinIO 密钥',
    'Task 8 仍保持 NOT_READY'
  ]],
  ['acceptance.json', [
    'task-9d78-bucket-isolation-readiness-required-text',
    'check:task9d78',
    '测试 / 正式对象存储 bucket 隔离验收记录第一段'
  ]],
  ['STATUS.md', ['9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段']],
  ['DECISIONS.md', ['D-129 任务 9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段']],
  ['tasks/README.md', ['任务 9D.78：测试 / 正式对象存储 bucket 隔离验收记录第一段']],
  ['README.md', ['check:task9d78', '测试 / 正式对象存储 bucket 隔离验收记录第一段']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段']],
  ['docs/deployment/readiness-checklist.md', ['9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段']],
  ['docs/deployment/task-8-final-readiness-report.md', ['9D.78 测试 / 正式对象存储 bucket 隔离验收记录第一段']]
]

for (const [file, fragments] of checks) {
  if (!fs.existsSync(file)) {
    failures.push(`${file} -> file missing`)
    continue
  }
  const content = read(file)
  for (const fragment of fragments) {
    if (!content.includes(fragment)) {
      failures.push(`${file} -> ${fragment}`)
    }
  }
}

if (failures.length > 0) {
  console.error('task 9D.78 bucket isolation readiness check failed:')
  for (const failure of failures) {
    console.error(`- missing ${failure}`)
  }
  process.exit(1)
}

console.log('task 9D.78 bucket isolation readiness check ok')
