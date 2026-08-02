import { execFileSync } from 'node:child_process'
import fs from 'node:fs'

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const gitignore = fs.readFileSync('.gitignore', 'utf8')
const readme = fs.readFileSync('README.md', 'utf8')
const shellPath = 'scripts/local-runtime.sh'
const shell = fs.existsSync(shellPath) ? fs.readFileSync(shellPath, 'utf8') : ''
const runnerPath = 'scripts/local-runtime-runner.sh'
const runner = fs.existsSync(runnerPath) ? fs.readFileSync(runnerPath, 'utf8') : ''

const expectedScripts = {
  'check:local-runtime': 'node scripts/check-local-runtime.mjs',
  'local:start': 'bash scripts/local-runtime.sh start',
  'local:status': 'bash scripts/local-runtime.sh status',
  'local:stop': 'bash scripts/local-runtime.sh stop',
}

const requiredShellFragments = [
  'RUNTIME_DIR="$ROOT_DIR/.local-runtime"',
  'npm run compose:up',
  'npm run dev:backend',
  'npm run dev:frontend',
  'lsof -nP -iTCP:',
  'process_start_token',
  'uuidgen',
  'collect_process_tree',
  'signal_managed_tree',
  'wait_for_managed_tree_exit',
  'local-runtime-runner.sh',
  'case "$command" in',
  'docker compose ps --status running --services',
]

const forbiddenShellFragments = [
  'docker compose -C',
  'kill -KILL "$pid"',
]

const requiredReadmeFragments = [
  'npm run local:start',
  'npm run local:status',
  'npm run local:stop',
  '.local-runtime/',
]

const failures = []

for (const [name, command] of Object.entries(expectedScripts)) {
  if (packageJson.scripts?.[name] !== command) {
    failures.push(`package.json missing ${name}: ${command}`)
  }
}

if (!gitignore.includes('.local-runtime/')) {
  failures.push('.gitignore must ignore .local-runtime/')
}

if (!fs.existsSync(shellPath)) {
  failures.push(`${shellPath} is missing`)
} else {
  for (const fragment of requiredShellFragments) {
    if (!shell.includes(fragment)) {
      failures.push(`${shellPath} missing required text: ${fragment}`)
    }
  }
  for (const fragment of forbiddenShellFragments) {
    if (shell.includes(fragment)) {
      failures.push(`${shellPath} contains unsupported Compose invocation: ${fragment}`)
    }
  }
  if (shell.includes('docker compose down')) {
    failures.push(`${shellPath} must not stop Docker services`)
  }

  try {
    execFileSync('bash', ['-n', shellPath], { stdio: 'pipe' })
  } catch (error) {
    failures.push(`${shellPath} has invalid Bash syntax: ${error.stderr.toString().trim()}`)
  }
}

if (!fs.existsSync(runnerPath)) {
  failures.push(`${runnerPath} is missing`)
} else {
  for (const fragment of ['--runtime-id', 'trap', 'wait "$child_pid"']) {
    if (!runner.includes(fragment)) {
      failures.push(`${runnerPath} missing required text: ${fragment}`)
    }
  }

  try {
    execFileSync('bash', ['-n', runnerPath], { stdio: 'pipe' })
  } catch (error) {
    failures.push(`${runnerPath} has invalid Bash syntax: ${error.stderr.toString().trim()}`)
  }
}

for (const fragment of requiredReadmeFragments) {
  if (!readme.includes(fragment)) {
    failures.push(`README.md missing required text: ${fragment}`)
  }
}

if (failures.length > 0) {
  console.error('local runtime check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('local runtime check ok')
