import fs from 'node:fs'
import { classifyProductionRelease } from './production-release-mode.mjs'

const failures = []

function expectMode(label, files, expectedMode) {
  const result = classifyProductionRelease(files)
  if (result.mode !== expectedMode) {
    failures.push(`${label}: expected ${expectedMode}, found ${result.mode} (${result.reason})`)
  }
}

expectMode('frontend source only', ['frontend/src/App.vue'], 'frontend')
expectMode(
  'frontend source with release docs',
  ['frontend/src/App.vue', 'README.md', 'STATUS.md', 'docs/deployment/example.md', 'tasks/README.md'],
  'frontend'
)
expectMode('documentation only', ['README.md', 'docs/deployment/example.md'], 'full')
expectMode('frontend documentation only', ['frontend/README.md'], 'full')
expectMode('frontend source with frontend documentation', [
  'frontend/src/App.vue',
  'frontend/README.md'
], 'frontend')
expectMode('frontend plus backend', ['frontend/src/App.vue', 'backend/pom.xml'], 'full')
expectMode('frontend plus database migration', [
  'frontend/src/App.vue',
  'backend/platform-server/src/main/resources/db/migration/V99__example.sql'
], 'full')
expectMode('frontend plus root dependency lock', ['frontend/src/App.vue', 'pnpm-lock.yaml'], 'full')
expectMode('frontend plus deployment workflow', [
  'frontend/src/App.vue',
  '.github/workflows/deploy-production.yml'
], 'full')
expectMode('frontend plus deployment script', [
  'frontend/src/App.vue',
  'scripts/deploy-production-release.sh'
], 'full')
expectMode('empty diff', [], 'full')

const workflow = fs.readFileSync('.github/workflows/deploy-production.yml', 'utf8')
const deployScript = fs.readFileSync('scripts/deploy-production-release.sh', 'utf8')
const imageCheck = fs.readFileSync('scripts/check-production-release-images.sh', 'utf8')

for (const fragment of [
  'Detect safe production release mode',
  'scripts/production-release-mode.mjs',
  "steps.release.outputs.mode == 'full'",
  'RELEASE_MODE: ${{ steps.release.outputs.mode }}',
  'docker save "ai-order-platform-frontend:${GITHUB_SHA}"',
  "'${{ steps.release.outputs.mode }}'"
]) {
  if (!workflow.includes(fragment)) {
    failures.push(`deploy workflow missing fast-release guard: ${fragment}`)
  }
}

for (const fragment of [
  'release_mode="${5:-full}"',
  'services=(frontend)',
  'services=(backend frontend)',
  'frontend-only release skips the database backup',
  'current-production-frontend-revision',
  'current-production-backend-revision'
]) {
  if (!deployScript.includes(fragment)) {
    failures.push(`deploy script missing fast-release guard: ${fragment}`)
  }
}

for (const fragment of [
  'backend_image="${3:-}"',
  'if [[ -n "${backend_image}" ]]'
]) {
  if (!imageCheck.includes(fragment)) {
    failures.push(`release image check missing frontend-only support: ${fragment}`)
  }
}

if (failures.length > 0) {
  console.error('production fast deploy check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('production fast deploy check ok')
