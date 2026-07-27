import { execFileSync } from 'node:child_process'
import fs from 'node:fs'

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const scriptPath = 'scripts/environment-runtime.sh'
const shell = fs.existsSync(scriptPath) ? fs.readFileSync(scriptPath, 'utf8') : ''
const readme = fs.readFileSync('README.md', 'utf8')

const expectedScripts = {
  'check:environment-runtime': 'node scripts/check-environment-runtime.mjs',
  'env:start': 'bash scripts/environment-runtime.sh start',
  'env:status': 'bash scripts/environment-runtime.sh status',
  'env:stop': 'bash scripts/environment-runtime.sh stop',
  'env:open': 'bash scripts/environment-runtime.sh open',
}

const requiredShellFragments = [
  'http://localhost:5173',
  'http://localhost:8080/api/bootstrap/health',
  'http://127.0.0.1:15173',
  'http://127.0.0.1:18080/api/bootstrap/health',
  'aiorder-local-backend',
  'aiorder-local-frontend',
  'aiorder-demo-backend',
  'aiorder-demo-frontend',
  'scripts/ensure-demo-environment.sh',
  'screen -dmS',
  '本工具不会停止',
  'local|demo|all',
]

const requiredReadmeFragments = [
  'npm run env:open',
  'npm run env:status',
  'npm run env:start -- local',
  'npm run env:start -- demo',
  'http://localhost:5173',
  'http://127.0.0.1:15173',
]

const failures = []

for (const [name, command] of Object.entries(expectedScripts)) {
  if (packageJson.scripts?.[name] !== command) {
    failures.push(`package.json missing ${name}: ${command}`)
  }
}

if (!fs.existsSync(scriptPath)) {
  failures.push(`${scriptPath} is missing`)
} else {
  for (const fragment of requiredShellFragments) {
    if (!shell.includes(fragment)) {
      failures.push(`${scriptPath} missing required text: ${fragment}`)
    }
  }

  try {
    execFileSync('bash', ['-n', scriptPath], { stdio: 'pipe' })
  } catch (error) {
    failures.push(`${scriptPath} has invalid Bash syntax: ${error.stderr.toString().trim()}`)
  }
}

for (const fragment of requiredReadmeFragments) {
  if (!readme.includes(fragment)) {
    failures.push(`README.md missing required text: ${fragment}`)
  }
}

if (failures.length > 0) {
  console.error('environment runtime check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('environment runtime check ok')
