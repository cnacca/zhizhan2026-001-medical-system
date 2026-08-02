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

// 演练脚本必须存在，且保留三条使结论可信的约束：
// 克隆已提交状态、独占资源、结束后归还资源。
requireText('scripts/clean-env-reproducibility-drill.sh', [
  'git clone',
  'demo:prepare',
  'demo:check',
  'docker compose down --volumes',
  '本演练只覆盖本地宿主，不构成真实服务器部署验收'
])

// 记录必须写明边界，不得只留一张绿灯表。
requireText('docs/deployment/clean-env-reproducibility-drill.md', [
  '# 干净环境可复现性演练',
  '必须先提交再演练',
  '本演练不能证明什么',
  'with-jdk21.sh',
  '固定容器名',
  'deployment-infrastructure` 继续保持 `PARTIAL',
  'Task 8 继续保持 `NOT_READY`'
])

// compose:up 必须等待健康检查：这是首轮演练发现的启动竞态，回退即失效。
const pkg = JSON.parse(read('package.json') || '{}')
const composeUp = pkg.scripts?.['compose:up'] ?? ''
if (!composeUp.includes('--wait')) {
  failures.push('package.json compose:up must use "docker compose up -d --wait" to avoid the fresh-volume startup race')
}
if (pkg.scripts?.['check:clean-env-reproducibility'] === undefined) {
  failures.push('package.json missing check:clean-env-reproducibility script')
}

// demo:seed 的两处顺序约束：SQL 先建账号，最后再补依赖场景订单的证据行。
const demoSeed = pkg.scripts?.['demo:seed'] ?? ''
if (!/demo:seed:admin.*seed-demo-data\.mjs.*demo:seed:admin/s.test(demoSeed)) {
  failures.push('package.json demo:seed must run the admin seed before AND after the scenario seeder (circular dependency)')
}

// readiness 边界不得因本地演练而放宽。
const acceptance = JSON.parse(read('acceptance.json') || '{}')
const deployment = (acceptance.task8_readiness_gaps ?? []).find((gap) => gap.id === 'deployment-infrastructure')
if (!deployment) {
  failures.push('acceptance.json missing deployment-infrastructure readiness gap')
} else if (deployment.status !== 'PARTIAL') {
  failures.push(`deployment-infrastructure must stay PARTIAL after a local drill, found ${deployment.status}`)
} else if (!String(deployment.current_evidence ?? '').includes('clean-env-reproducibility-drill')) {
  failures.push('acceptance.json deployment-infrastructure must cite the local drill record as evidence')
}

if (failures.length) {
  console.error('check:clean-env-reproducibility failed:')
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log('check:clean-env-reproducibility passed')
