import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

const workflowPath = '.github/workflows/deploy-production.yml'
const deployScriptPath = 'scripts/deploy-production-release.sh'
const configPath = 'deploy/production-deploy.example.conf'
const frontendDockerfilePath = 'frontend/Dockerfile'
const releaseImageCheckPath = 'scripts/check-production-release-images.sh'
const jdkWrapperPath = 'scripts/with-jdk21.sh'
const failures = []

const read = (path) => {
  if (!fs.existsSync(path)) {
    failures.push(`${path} missing`)
    return ''
  }
  return fs.readFileSync(path, 'utf8')
}

const workflow = read(workflowPath)
const deployScript = read(deployScriptPath)
const config = read(configPath)
const frontendDockerfile = read(frontendDockerfilePath)
const releaseImageCheck = read(releaseImageCheckPath)
const jdkWrapper = read(jdkWrapperPath)

for (const fragment of [
  'branches:',
  '- main',
  'workflow_dispatch:',
  "github.ref == 'refs/heads/main'",
  "vars.PRODUCTION_AUTO_DEPLOY_ENABLED == 'true'",
  'cancel-in-progress: false',
  'name: production',
  'pull-requests: read',
  'Require a merged pull request for automatic production deploys',
  '/commits/${GITHUB_SHA}/pulls',
  '.base.ref == "main"',
  '.merged_at != null',
  'StrictHostKeyChecking=yes',
  'scripts/deploy-production-release.sh',
  'PRODUCTION_SSH_PRIVATE_KEY',
  'PRODUCTION_SSH_KNOWN_HOSTS',
  'TEMP_DEMO_LOGIN_PREFILL_ENABLED',
  'VITE_TEMP_DEMO_LOGIN_PREFILL_ENABLED',
  'npm run compose:up',
  'scripts/ensure-test-database.sh',
  'npm run test:backend',
  'npm run check:openapi',
  'npm run check:frontend-bug-audit-20260815',
  'npm run check:logout-refresh-race',
  'Verify final release images',
  'scripts/check-production-release-images.sh'
]) {
  if (!workflow.includes(fragment)) {
    failures.push(`${workflowPath} missing required text: ${fragment}`)
  }
}

for (const forbidden of ['pull_request_target:', 'ssh-keyscan', 'cancel-in-progress: true']) {
  if (workflow.includes(forbidden)) {
    failures.push(`${workflowPath} contains forbidden text: ${forbidden}`)
  }
}

const actionRefs = [...workflow.matchAll(/^\s*uses:\s*[^@\s]+@([^\s#]+)/gm)].map((match) => match[1])
if (actionRefs.length === 0) {
  failures.push(`${workflowPath} must use at least one pinned action`)
}
for (const ref of actionRefs) {
  if (!/^[0-9a-f]{40}$/.test(ref)) {
    failures.push(`${workflowPath} action ref is not pinned to a full commit SHA: ${ref}`)
  }
}

for (const fragment of [
  'flock -n 9',
  'sha256sum --check',
  'mysqldump',
  'rollback-before-',
  '--no-build --no-deps --force-recreate --wait backend frontend',
  'No database/schema rollback was attempted',
  'HEALTHCHECK_URL must use a loopback HTTP address'
]) {
  if (!deployScript.includes(fragment)) {
    failures.push(`${deployScriptPath} missing required text: ${fragment}`)
  }
}

const backendTestsIndex = workflow.indexOf('npm run test:backend')
const backendPackageIndex = workflow.indexOf('-DskipTests package')
const imageBuildIndex = workflow.indexOf('Build immutable release images')
const finalImageCheckIndex = workflow.indexOf('Verify final release images')
const releasePackageIndex = workflow.indexOf('Package the release')
if (backendTestsIndex < 0 || backendPackageIndex < 0 || backendTestsIndex > backendPackageIndex) {
  failures.push(`${workflowPath} must run backend tests before packaging the backend`)
}
if (imageBuildIndex < 0
  || finalImageCheckIndex < imageBuildIndex
  || releasePackageIndex < finalImageCheckIndex) {
  failures.push(`${workflowPath} must verify final images after build and before release packaging`)
}
for (const releaseGate of [
  'npm run check:openapi',
  'npm run check:frontend-bug-audit-20260815',
  'npm run check:logout-refresh-race'
]) {
  const gateIndex = workflow.indexOf(releaseGate)
  if (gateIndex < 0 || imageBuildIndex < 0 || gateIndex > imageBuildIndex) {
    failures.push(`${workflowPath} must run ${releaseGate} before building release images`)
  }
}

for (const fragment of [
  'RELEASE_ROOT=',
  'PRODUCTION_ENV_FILE=',
  'COMPOSE_OVERRIDE_FILE=',
  'COMPOSE_PROJECT_NAME=deploy',
  'BACKUP_ROOT=',
  'HEALTHCHECK_URL=http://127.0.0.1:',
  'HOMEPAGE_URL=http://127.0.0.1:'
]) {
  if (!config.includes(fragment)) {
    failures.push(`${configPath} missing required text: ${fragment}`)
  }
}

for (const content of [workflow, deployScript, config]) {
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(content)) {
    failures.push('production auto-deploy files must not contain a private key')
  }
}

for (const fragment of [
  'corepack prepare pnpm@11.7.0 --activate',
  'pnpm install --frozen-lockfile --filter ai-order-platform-frontend...',
  'ARG VITE_TEMP_DEMO_LOGIN_PREFILL_ENABLED=false',
  'ENV VITE_TEMP_DEMO_LOGIN_PREFILL_ENABLED=${VITE_TEMP_DEMO_LOGIN_PREFILL_ENABLED}'
]) {
  if (!frontendDockerfile.includes(fragment)) {
    failures.push(`${frontendDockerfilePath} missing required text: ${fragment}`)
  }
}

const syntaxCheck = spawnSync('bash', ['-n', deployScriptPath], { encoding: 'utf8' })
if (syntaxCheck.status !== 0) {
  failures.push(`${deployScriptPath} bash syntax check failed: ${syntaxCheck.stderr.trim()}`)
}

const releaseImageSyntaxCheck = spawnSync('bash', ['-n', releaseImageCheckPath], { encoding: 'utf8' })
if (releaseImageSyntaxCheck.status !== 0) {
  failures.push(`${releaseImageCheckPath} bash syntax check failed: ${releaseImageSyntaxCheck.stderr.trim()}`)
}

const jdkWrapperSyntaxCheck = spawnSync('bash', ['-n', jdkWrapperPath], { encoding: 'utf8' })
if (jdkWrapperSyntaxCheck.status !== 0) {
  failures.push(`${jdkWrapperPath} bash syntax check failed: ${jdkWrapperSyntaxCheck.stderr.trim()}`)
}
for (const fragment of [
  '${JAVA_HOME:-}',
  '-x "${JAVA_HOME}/bin/java"',
  'elif [[ -x "${homebrew_jdk21}/bin/java" ]]',
  'Java 21 is required'
]) {
  if (!jdkWrapper.includes(fragment)) {
    failures.push(`${jdkWrapperPath} must preserve a caller-provided JDK and only use Homebrew as a fallback; missing: ${fragment}`)
  }
}
if (/^export JAVA_HOME="\/opt\/homebrew/m.test(jdkWrapper)) {
  failures.push(`${jdkWrapperPath} must not unconditionally override actions/setup-java on Linux`)
}
for (const fragment of [
  'docker image inspect',
  'docker create',
  'docker cp',
  'BOOT-INF/classes/db/migration/',
  'final backend image is missing Flyway migration',
  'docker run --rm --entrypoint sh',
  '/usr/share/nginx/html/index.html',
  '/usr/share/nginx/html/assets',
  'ORD20260718-1001',
  'doctorMock',
  'mockDoctorGateway',
  'final frontend image contains a doctor mock marker or fixture',
]) {
  if (!releaseImageCheck.includes(fragment)) {
    failures.push(`${releaseImageCheckPath} missing required text: ${fragment}`)
  }
}

if (failures.length > 0) {
  console.error('production auto-deploy check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('production auto-deploy check ok')
