import { readFile } from 'node:fs/promises'

const failures = []

async function expectAll(file, snippets) {
  const source = await readFile(file, 'utf8')
  for (const snippet of snippets) {
    if (!source.includes(snippet)) failures.push(`${file}: missing ${snippet}`)
  }
}

await expectAll('frontend/src/doctor/DoctorCaseGroupWizard.vue', [
  'async function saveItemUnlocked(',
  'async function saveItem(',
  'if (busy.value || fileUploading.value) return false',
  'return await saveItemUnlocked(item, silent, fileIdsOverride)',
  'if (item && !(await saveItemUnlocked(item, true))) return false',
  'data-testid="case-save-item" @click="saveItem(activeItem)"'
])

await expectAll('backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/AccessControlService.java', [
  'if (requestedUserId != null)',
  'identity.hasPermission("performance:read-self")',
  '|| identity.hasPermission("performance:read-all")',
  'return identity.userId()'
])

await expectAll('backend/platform-server/src/test/java/com/yuri/aiorder/auth/FineGrainedRoleTests.java', [
  'productionManagerPerformanceDefaultsToOwnUserWithoutExplicitTarget',
  'resolvePerformanceTargetUserId(manager, null)',
  'resolvePerformanceTargetUserId(manager, 12345L)'
])

await expectAll('frontend/src/utils/orderWorkflow.ts', [
  'statusesWithoutProcessInstance',
  "'PENDING_CS_REVIEW'",
  "'PENDING_PRODUCTION_REVIEW'",
  'orderMayHaveProcessInstance'
])

await expectAll('frontend/src/components/AdminRemainingPages.vue', [
  "import { orderMayHaveProcessInstance } from '../utils/orderWorkflow'",
  'if (!orderMayHaveProcessInstance(order))',
  'return { order, instance: null, failed: false, missing: true }'
])

await expectAll('frontend/src/App.vue', [
  "import { orderMayHaveProcessInstance } from './utils/orderWorkflow'",
  'orderMayHaveProcessInstance(order) && adminOrderProcessMap.value[order.order_id] == null',
  'const processRequest = orderMayHaveProcessInstance(order)',
  'data-testid="admin-view-all-todos"',
  '>查看全部</button>'
])

await expectAll('.github/workflows/deploy-production.yml', [
  'npm run check:regression-bugs-20260817'
])

await expectAll('DECISIONS.md', [
  '## D-196 一期不包含客服代下单',
  'NEW-RETEST-005',
  '客服端不实现代医生新建订单的业务流程'
])

await expectAll('docs/design/cs-portal/CS_PORTAL_IMPLEMENTATION_PLAN.md', [
  '按 D-196，一期不实现客服代下单流程或 `POST /orders`',
  '也不把点击、跳转列为一期验收项'
])

await expectAll('scripts/smoke-regression-bugs-20260817.spec.mjs', [
  "internal_status: 'PENDING_CS_REVIEW'",
  "internal_status: 'IN_DESIGN'",
  'expect(processRequests).not.toContain(101)',
  "getByTestId('admin-view-all-todos')"
])

if (failures.length) {
  console.error('2026-08-17 black-box regression check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('2026-08-17 black-box regression check ok')
