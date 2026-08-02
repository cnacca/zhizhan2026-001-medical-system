import fs from 'node:fs'

const requirements = [
  ['scripts/ensure-demo-environment.sh', ['_demo', 'standalone demo segment']],
  ['scripts/demo-runtime.sh', ['18080', '15173', 'ensure-demo-environment.sh']],
  ['scripts/seed-demo-data.mjs', ['01-待客服审核', '07-已完成', 'DEMO_DATA_V1']],
  ['scripts/check-demo-data.mjs', ['PENDING_CS_REVIEW', 'PENDING_DOCTOR_CONFIRM', 'demo data verification passed']],
  ['scripts/reset-demo-environment.sh', ['DEMO_RESET_CONFIRM', 'RESET_DEMO_DATA']],
  ['docs/operations/demo-data-runbook.md', ['独立演示环境', 'npm run demo:prepare', '真实患者']]
]

const failures = []
for (const [file, fragments] of requirements) {
  if (!fs.existsSync(file)) {
    failures.push(`${file} is missing`)
    continue
  }
  const content = fs.readFileSync(file, 'utf8')
  for (const fragment of fragments) {
    if (!content.includes(fragment)) {
      failures.push(`${file} is missing ${fragment}`)
    }
  }
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
for (const script of ['demo:start', 'demo:serve', 'demo:seed', 'demo:check', 'demo:prepare', 'demo:stop', 'demo:reset']) {
  if (!packageJson.scripts?.[script]) {
    failures.push(`package.json is missing ${script}`)
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('demo data tooling check passed')
