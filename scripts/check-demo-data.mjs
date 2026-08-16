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
  {
    portal: 'ADMIN', username: 'admin', password: 'change-me-admin',
    acceptanceRole: 'ACCEPTANCE_ADMIN_FULL', dataScope: 'ALL',
    requiredPermissions: ['rbac:role:manage', 'account:create', 'workflow:orthodontic-batch:manage']
  },
  {
    portal: 'CS', username: 'cs', password: 'change-me-cs',
    acceptanceRole: 'ACCEPTANCE_CS_FULL', dataScope: 'ALL',
    requiredPermissions: [
      'design-draft:internal-review', 'logistics:receive', 'logistics:ship',
      'message:translate', 'product:manage'
    ]
  },
  {
    portal: 'PRODUCTION', username: 'worker', password: 'change-me-worker',
    acceptanceRole: 'ACCEPTANCE_PRODUCTION_FULL', dataScope: 'ALL',
    requiredPermissions: [
      'design-draft:internal-review', 'workflow:orthodontic-case:read', 'workflow:orthodontic-batch:manage',
      'production:equipment:approve', 'production:cost:confirm',
      'production:equipment:write', 'production:material:write',
      'production:safety:write', 'production:cost:write',
      'production:reward-penalty:write',
      'final-inspection:manage', 'check:gate-inspect'
    ]
  },
  {
    portal: 'DOCTOR', username: 'doctor', password: 'change-me-doctor',
    acceptanceRole: 'ACCEPTANCE_DOCTOR_FULL', dataScope: 'CLINIC',
    requiredPermissions: ['order:write-doctor', 'patient:manage-doctor', 'clinic:read-self'],
    forbiddenPermissions: [
      'design-draft:internal-review', 'workflow:orthodontic-case:read', 'workflow:orthodontic-batch:manage',
      'production:equipment:approve', 'production:cost:confirm',
      'workflow:read-internal', 'order:read-internal', 'order:read-case-group-internal',
      'check:read-internal',
      'file:manage-internal', 'ai:production', 'ai:governance:read', 'ai:cs',
      'message:manage', 'dashboard:read-internal', 'dashboard:read-sales', 'clinic:manage'
    ],
    forbiddenPermissionPrefixes: [
      'workflow:', 'check:', 'staff:', 'performance:', 'worklog:',
      'rework:', 'production:', 'quality:'
    ]
  }
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
  for (const account of portals) {
    const session = await login(account.portal, account.username, account.password)
    sessions[account.portal] = session
    assert(session.accessToken, `${account.portal} login did not return accessToken`)
    assert(session.roles.includes(account.acceptanceRole),
      `${account.portal} is missing acceptance role ${account.acceptanceRole}`)
    assert(session.dataScope === account.dataScope,
      `${account.portal} expected data scope ${account.dataScope}, got ${session.dataScope}`)
    for (const permission of account.requiredPermissions) {
      assert(session.permissions.includes(permission),
        `${account.portal} is missing acceptance permission ${permission}`)
    }
    for (const permission of account.forbiddenPermissions ?? []) {
      assert(!session.permissions.includes(permission),
        `${account.portal} must not receive cross-portal permission ${permission}`)
    }
    for (const prefix of account.forbiddenPermissionPrefixes ?? []) {
      const leakedPermission = session.permissions.find((permission) => permission.startsWith(prefix))
      assert(!leakedPermission,
        `${account.portal} must not receive internal permission ${leakedPermission} from prefix ${prefix}`)
    }
    for (const menu of session.menus ?? []) {
      assert(!menu.permissionCode || session.permissions.includes(menu.permissionCode),
        `${account.portal} menu ${menu.menuCode} is not backed by an effective permission`)
    }
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
        // 登录接口把 userId 序列化为字符串（避免 JS 大整数精度丢失），而工序节点的
        // assigned_user_id 是数字，直接用 === 比较恒为 false。统一转字符串再比。
        const workerUserId = String(sessions.PRODUCTION.userId)
        assert(process.data.nodes.some((node) => String(node.assigned_user_id) === workerUserId),
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
      // 迁移 V49 把待医生确认状态由 PENDING_DOCTOR_CONFIRM 改名为 PENDING_DOCTOR，
      // 历史数据两种都可能出现，与 httpDoctorGateway / CsPortalPages 保持同样的兼容口径。
      const pendingDoctorStatuses = new Set(['PENDING_DOCTOR', 'PENDING_DOCTOR_CONFIRM', 'PENDING_DOCTOR_REVIEW'])
      const drafts = await apiFetch(`/orders/${order.order_id}/design-drafts`, sessions.DOCTOR.accessToken)
      assert(drafts.data.some((draft) => pendingDoctorStatuses.has(draft.status)),
        `${scenario.key} has no design draft pending doctor confirmation`)
    }
    checked.push({
      key: scenario.key,
      order_no: order.order_no,
      internal_status: order.internal_status,
      external_status: order.external_status
    })
  }

  const adminToken = sessions.ADMIN.accessToken
  const [
    clinics,
    staff,
    logistics,
    outsourcing,
    equipment,
    equipmentApprovals,
    materialExceptions,
    safetyEvents,
    safetyRules,
    costRecords,
    products,
    salesDashboard,
    aiSummary,
    aiTrend,
    notifications
  ] = await Promise.all([
    apiFetch('/clinics?page=1&size=100', adminToken),
    apiFetch('/staff/workload?page=1&size=100', adminToken),
    apiFetch('/logistics/orders?limit=100', adminToken),
    apiFetch('/production/outsourcing', adminToken),
    apiFetch('/production/equipment', adminToken),
    apiFetch('/production/equipment/approvals', adminToken),
    apiFetch('/production/material-exceptions', adminToken),
    apiFetch('/production/safety-environment/events', adminToken),
    apiFetch('/production/safety-environment/rules', adminToken),
    apiFetch('/production/cost-management/records', adminToken),
    apiFetch('/products?page=1&size=100', adminToken),
    apiFetch('/dashboards/sales', adminToken),
    apiFetch('/ai/governance/summary', adminToken),
    apiFetch('/ai/governance/cost-trend?days=7', adminToken),
    apiFetch('/notifications?limit=50', adminToken)
  ])

  assert(clinics.data.items.length >= 5, 'admin portal demo needs at least five clinics')
  assert(staff.data.items.filter((item) => item.user_type === 'WORKER').length >= 4,
    'admin portal demo needs multiple workers')
  assert(staff.data.items.filter((item) => item.user_type === 'WORKER')
    .some((item) => item.completed_work_log_count > 0), 'worker performance evidence is missing')
  assert(logistics.data.length >= 3, 'billing and logistics evidence is missing')
  assert(outsourcing.data.length >= 3, 'outsourcing batch evidence is missing')
  assert(outsourcing.data.some((item) => item.is_overdue), 'outsourcing overdue evidence is missing')
  assert(equipment.data.length >= 4, 'equipment detail evidence is missing')
  assert(equipmentApprovals.data.filter((item) => item.status === 'PENDING').length >= 2,
    'equipment approval evidence is missing')
  assert(materialExceptions.data.length >= 4, 'material exception detail evidence is missing')
  assert(safetyEvents.data.length >= 4, 'safety event evidence is missing')
  assert(safetyRules.data.length >= 3, 'safety fixed-cycle rule evidence is missing')
  const costTypes = new Set(costRecords.data.map((item) => item.cost_type))
  for (const costType of ['LABOR', 'MATERIAL', 'PROCESS', 'REWORK', 'OUTSOURCING']) {
    assert(costTypes.has(costType), `cost evidence is missing type ${costType}`)
  }
  assert(products.data.items.length >= 4, 'product overview evidence is missing')
  assert(salesDashboard.data.month_comparison?.daily_trend?.length > 0,
    'workbench month comparison trend evidence is missing')
  assert(salesDashboard.data.month_comparison.inbound.previous_month_amount_cents > 0,
    'workbench previous-month inbound evidence is missing')
  assert(salesDashboard.data.month_comparison.outbound.previous_month_amount_cents > 0,
    'workbench previous-month outbound evidence is missing')
  assert(aiSummary.data.success_count > 0, 'AI success summary evidence is missing')
  assert(aiSummary.data.safe_refusal_count > 0, 'AI safe refusal evidence is missing')
  assert(aiSummary.data.model_failed_count > 0, 'AI failure evidence is missing')
  assert(aiTrend.data.points.length >= 7, 'AI seven-day trend evidence is missing')
  assert(notifications.data.length >= 3, 'admin notification evidence is missing')

  assert(fs.existsSync(manifestPath), 'demo data manifest is missing')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  assert(manifest.scenarios.length === expected.length,
    `manifest expected ${expected.length} scenarios, got ${manifest.scenarios.length}`)

  console.log(JSON.stringify({
    environment: frontendUrl,
    checked,
    admin_portal: {
      clinics: clinics.data.items.length,
      staff: staff.data.items.length,
      logistics: logistics.data.length,
      outsourcing: outsourcing.data.length,
      equipment: equipment.data.length,
      material_exceptions: materialExceptions.data.length,
      safety_events: safetyEvents.data.length,
      safety_rules: safetyRules.data.length,
      cost_records: costRecords.data.length,
      products: products.data.items.length,
      sales_comparison_days: salesDashboard.data.month_comparison.daily_trend.length,
      notifications: notifications.data.length,
      ai_trend_days: aiTrend.data.points.length
    }
  }, null, 2))
  console.log('demo data verification passed')
}

main().catch((error) => {
  console.error(error.stack ?? error.message)
  process.exit(1)
})
