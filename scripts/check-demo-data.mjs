import fs from 'node:fs'
import path from 'node:path'
import { assertIsolatedSmokeTarget } from './assert-isolated-smoke-target.mjs'

const frontendUrl = process.env.DEMO_FRONTEND_URL ?? 'http://127.0.0.1:15173'
const manifestPath = path.resolve('.demo-runtime/demo-data-manifest.json')
const expected = [
  { key: '01-待客服审核', stage: 'pending-cs', internal: 'PENDING_CS_REVIEW' },
  { key: '02-待生产审核', stage: 'pending-production', internal: 'PENDING_PRODUCTION_REVIEW' },
  { key: '03-生产待办', stage: 'assigned', processCheck: 'assigned' },
  { key: '04-返工处理中', stage: 'rework-pending', reworkCheck: true },
  { key: '05-待设计确认', stage: 'design-pending', designCheck: true },
  { key: '06-待发货', stage: 'ready-to-ship', processCheck: 'completed' },
  { key: '07-已完成', stage: 'completed', external: 'COMPLETED' }
]

const portals = [
  ['ADMIN', 'admin', 'change-me-admin'],
  ['CS', 'cs', 'change-me-cs'],
  ['PRODUCTION', 'worker', 'change-me-worker'],
  ['DOCTOR', 'doctor', 'change-me-doctor']
]

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

async function login(portal, username, password) {
  return apiFetch('/api/auth/login', null, {
    method: 'POST',
    body: JSON.stringify({ portal, username, password })
  })
}

async function findScenario(token, key) {
  const payload = await apiFetch(`/orders?page=1&size=100&keyword=${encodeURIComponent(`演示-${key}-`)}`, token)
  return payload.data.items.find(
    (item) => item.form_data?.demo_scenario === key
      || item.form_data?.acceptance_marker === `DEMO_DATA_V1:${key}`
  ) ?? null
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function main() {
  assertIsolatedSmokeTarget({
    isolatedEnv: process.env.DEMO_ISOLATED_ENV,
    isolatedEnvVariable: 'DEMO_ISOLATED_ENV',
    frontendUrl,
    frontendUrlVariable: 'DEMO_FRONTEND_URL',
    taskLabel: 'Demo data verification'
  })
  await apiFetch('/api/bootstrap/health')

  const sessions = {}
  for (const [portal, username, password] of portals) {
    sessions[portal] = await login(portal, username, password)
    assert(sessions[portal].accessToken, `${portal} login did not return accessToken`)
  }

  const checked = []
  for (const scenario of expected) {
    const order = await findScenario(sessions.ADMIN.accessToken, scenario.key)
    assert(order, `missing demo scenario ${scenario.key}`)
    if (scenario.internal) {
      assert(order.internal_status === scenario.internal,
        `${scenario.key} expected ${scenario.internal}, got ${order.internal_status}`)
    }
    if (scenario.external) {
      const doctorOrder = await apiFetch(`/orders/${order.order_id}`, sessions.DOCTOR.accessToken)
      assert(doctorOrder.data.external_status === scenario.external,
        `${scenario.key} expected external ${scenario.external}, got ${doctorOrder.data.external_status}`)
    }
    if (scenario.processCheck) {
      const process = await apiFetch(`/orders/${order.order_id}/process-instance`, sessions.ADMIN.accessToken)
      if (scenario.processCheck === 'assigned') {
        assert(process.data.nodes.some((node) => node.assigned_user_id === sessions.PRODUCTION.userId),
          `${scenario.key} has no node assigned to demo worker`)
      } else {
        assert(process.data.instance_status === 'COMPLETED',
          `${scenario.key} expected completed process, got ${process.data.instance_status}`)
      }
    }
    if (scenario.reworkCheck) {
      const reworks = await apiFetch(`/reworks?status=PENDING&order_id=${order.order_id}`, sessions.PRODUCTION.accessToken)
      assert(reworks.data.length > 0, `${scenario.key} has no pending rework`)
    }
    if (scenario.designCheck) {
      const drafts = await apiFetch(`/orders/${order.order_id}/design-drafts`, sessions.DOCTOR.accessToken)
      assert(drafts.data.some((draft) => draft.status === 'PENDING_DOCTOR_CONFIRM'),
        `${scenario.key} has no design draft pending doctor confirmation`)
    }
    checked.push({
      key: scenario.key,
      order_no: order.order_no,
      internal_status: order.internal_status,
      external_status: order.external_status
    })
  }

  assert(fs.existsSync(manifestPath), 'demo data manifest is missing')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  assert(manifest.scenarios.length === expected.length,
    `manifest expected ${expected.length} scenarios, got ${manifest.scenarios.length}`)

  console.log(JSON.stringify({ environment: frontendUrl, checked }, null, 2))
  console.log('demo data verification passed')
}

main().catch((error) => {
  console.error(error.stack ?? error.message)
  process.exit(1)
})
