import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

const workflowPath = '.github/workflows/deploy-production.yml'
const deployScriptPath = 'scripts/deploy-production-release.sh'
const configPath = 'deploy/production-deploy.example.conf'
const frontendDockerfilePath = 'frontend/Dockerfile'
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

for (const fragment of [
  'branches:',
  '- main',
  'workflow_dispatch:',
  "github.ref == 'refs/heads/main'",
  "vars.PRODUCTION_AUTO_DEPLOY_ENABLED == 'true'",
  'cancel-in-progress: false',
  'name: production',
  'StrictHostKeyChecking=yes',
  'scripts/deploy-production-release.sh',
  'PRODUCTION_SSH_PRIVATE_KEY',
  'PRODUCTION_SSH_KNOWN_HOSTS'
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
  '--no-build --force-recreate --wait backend frontend',
  'No database/schema rollback was attempted',
  'HEALTHCHECK_URL must use a loopback HTTP address'
]) {
  if (!deployScript.includes(fragment)) {
    failures.push(`${deployScriptPath} missing required text: ${fragment}`)
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
  'pnpm install --frozen-lockfile --filter ai-order-platform-frontend...'
]) {
  if (!frontendDockerfile.includes(fragment)) {
    failures.push(`${frontendDockerfilePath} missing required text: ${fragment}`)
  }
}

const syntaxCheck = spawnSync('bash', ['-n', deployScriptPath], { encoding: 'utf8' })
if (syntaxCheck.status !== 0) {
  failures.push(`${deployScriptPath} bash syntax check failed: ${syntaxCheck.stderr.trim()}`)
}

if (failures.length > 0) {
  console.error('production auto-deploy check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('production auto-deploy check ok')
