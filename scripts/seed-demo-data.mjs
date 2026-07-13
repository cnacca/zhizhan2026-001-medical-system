import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { assertIsolatedSmokeTarget } from './assert-isolated-smoke-target.mjs'

const frontendUrl = process.env.DEMO_FRONTEND_URL ?? 'http://127.0.0.1:15173'
const runtimeDir = path.resolve('.demo-runtime')
const manifestPath = path.join(runtimeDir, 'demo-data-manifest.json')

const scenarios = [
  { key: '01-待客服审核', stage: 'pending-cs', purpose: '医生提交后等待客服初审' },
  { key: '02-待生产审核', stage: 'pending-production', purpose: '客服初审通过后等待生产审核' },
  { key: '03-生产待办', stage: 'assigned', purpose: '已生成工序并派工，等待生产人员处理' },
  { key: '04-返工处理中', stage: 'rework-pending', purpose: '出检失败后进入返工待处理' },
  { key: '05-待设计确认', stage: 'design-pending', purpose: '设计稿已由客服审核，等待医生确认' },
  { key: '06-待发货', stage: 'ready-to-ship', purpose: '生产和终检链路完成，等待物流发货' },
  { key: '07-已完成', stage: 'completed', purpose: '已发货并由医生确认收货' }
]

const credentials = {
  username: process.env.DEMO_ADMIN_USERNAME ?? 'admin',
  password: process.env.DEMO_ADMIN_PASSWORD ?? 'change-me-admin'
}

function requireDemoTarget() {
  assertIsolatedSmokeTarget({
    isolatedEnv: process.env.DEMO_ISOLATED_ENV,
    isolatedEnvVariable: 'DEMO_ISOLATED_ENV',
    frontendUrl,
    frontendUrlVariable: 'DEMO_FRONTEND_URL',
    taskLabel: 'Demo data seeding'
  })
}

async function apiFetch(pathname, token, options = {}) {
  const response = await fetch(`${frontendUrl}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  })
  const text = await response.text()
  const payload = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${pathname} failed with ${response.status}: ${text}`)
  }
  return payload
}

async function loginAdmin() {
  return apiFetch('/api/auth/login', null, {
    method: 'POST',
    body: JSON.stringify({ ...credentials, portal: 'ADMIN' })
  })
}

async function findScenario(token, scenario) {
  const keyword = encodeURIComponent(`演示-${scenario.key}-`)
  const payload = await apiFetch(`/orders?page=1&size=100&keyword=${keyword}`, token)
  return payload.data.items.find(
    (item) => item.form_data?.demo_scenario === scenario.key
      || item.form_data?.acceptance_marker === `DEMO_DATA_V1:${scenario.key}`
  ) ?? null
}

function runScenario(scenario) {
  const env = {
    ...process.env,
    TASK9D62_FRONTEND_URL: frontendUrl,
    TASK9D62_ISOLATED_ENV: 'true',
    TASK9D62_DATA_MODE: 'fixed-demo-first-three',
    TASK9D62_DATA_ONLY: 'true',
    TASK9D62_DEMO_SCENARIO: scenario.key,
    TASK9D62_STOP_AFTER: scenario.stage,
    TASK9D62_TIMEOUT_MS: '300000'
  }
  const result = spawnSync('npm', ['run', 'smoke:task9d62'], {
    cwd: process.cwd(),
    env,
    stdio: 'inherit'
  })
  if (result.status !== 0) {
    throw new Error(`demo scenario ${scenario.key} failed with exit code ${result.status}`)
  }
}

async function main() {
  requireDemoTarget()
  await apiFetch('/api/bootstrap/health')
  const admin = await loginAdmin()
  const manifest = {
    version: 1,
    environment: frontendUrl,
    generated_at: new Date().toISOString(),
    scenarios: []
  }

  for (const scenario of scenarios) {
    let order = await findScenario(admin.accessToken, scenario)
    if (order) {
      console.log(`demo data exists, skipping ${scenario.key}: ${order.order_no}`)
    } else {
      console.log(`creating demo scenario ${scenario.key} (${scenario.stage})`)
      runScenario(scenario)
      order = await findScenario(admin.accessToken, scenario)
      if (!order) {
        throw new Error(`scenario ${scenario.key} was not visible after seeding`)
      }
    }
    manifest.scenarios.push({
      key: scenario.key,
      stage: scenario.stage,
      purpose: scenario.purpose,
      order_id: order.order_id,
      order_no: order.order_no,
      internal_status: order.internal_status,
      external_status: order.external_status
    })
  }

  fs.mkdirSync(runtimeDir, { recursive: true })
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`demo data manifest written: ${manifestPath}`)
}

main().catch((error) => {
  console.error(error.stack ?? error.message)
  process.exit(1)
})
