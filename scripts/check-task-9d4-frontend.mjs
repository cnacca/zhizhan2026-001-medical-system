import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const factoryPortalCss = fs.readFileSync('frontend/src/factory-portal.css', 'utf8')
const viteConfig = fs.readFileSync('frontend/vite.config.ts', 'utf8')
const accessControl = fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/AccessControlService.java', 'utf8')
const runtimeController = fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/runtime/WorkflowRuntimeController.java', 'utf8')
const runtimeService = fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/runtime/WorkflowRuntimeService.java', 'utf8')
const authService = fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/DatabaseAuthService.java', 'utf8')
const alignmentMigration = fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V56__prd_production_review_and_workflow_alignment.sql', 'utf8')
const skipAlignmentMigration = fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V57__prd_admin_only_optional_node_skip.sql', 'utf8')
const skipPermissionRenameMigration = fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V58__rename_admin_optional_node_skip_permission.sql', 'utf8')
const legacySnapshotRepairMigration = fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V59__repair_legacy_workflow_snapshot_roots.sql', 'utf8')
const openapi = fs.readFileSync('docs/api/openapi.yaml', 'utf8')
const decisions = fs.readFileSync('DECISIONS.md', 'utf8')
const mainChainSmoke = fs.readFileSync('scripts/smoke-task-9d62-main-chain.spec.mjs', 'utf8')
const historicalDemoReview = fs.readFileSync('docs/quality/evidence/bugfix-20260729-demo-frontend-reverification/README.md', 'utf8')
const historicalDemoDelivery = fs.readFileSync('docs/quality/evidence/bugfix-20260729-demo-frontend-reverification/TEST-DELIVERY.txt', 'utf8')
const historicalRecordingReport = fs.readFileSync('docs/quality/evidence/bugfix-20260729-recording-blockers/README.md', 'utf8')

const requiredAppFragments = [
  'type WorkflowChainSummary',
  'type ProductionReviewResponse',
  'productionReviewOrders',
  'selectedProductionReviewOrder',
  'loadProductionReviewPage',
  'loadProductionReviewOrders',
  'loadWorkflowChains',
  'reviewProductionOrder',
  'syncProductionReviewConfiguration',
  'productionReviewConfigurationReady',
  'openProductionReviewDrawer',
  'productionReviewFieldEntries',
  'sortProductionReviewOrders',
  'productionReviewRequiresAction',
  "size: '100'",
  "{ label: '待生产审核'",
  "NEEDS_INFO: '待补充资料'",
  "DESIGNING: '设计中'",
  "QC: '质检中'",
  "return /[\\u4e00-\\u9fff]/.test(status) ? status : '状态待确认'",
  "return labels[key] ?? '其他订单信息'",
  "? '未填写'",
  'data-testid="production-review-page"',
  'data-testid="production-review-table"',
  'data-testid="admin-production-review-drawer"',
  'class="admin-flow-table"',
  '工序链按产品自动匹配',
  '当前产品没有额外工艺分支，无需填写技术参数',
  '有 STL、PLY 等数字扫描资料时选择“口扫”',
  "id: 'admin-production-review'",
  "id: 'production-review'",
  "'production-review': 'workflow:review-production'",
  "'admin-production-review': 'workflow:review-production'",
  "title: '生产审核监控'",
  'productionCompactNavigationOptions',
  'selectProductionCompactNavigation',
  'aria-label="生产端业务菜单"',
  'data-testid="admin-order-production-review"',
  'openSelectedAdminOrderProductionReview',
  'PENDING_PRODUCTION_REVIEW',
  '/production-review',
  '/workflow-chains',
  '生产审核',
  '通过生产审核',
  '驳回生产审核'
]

const requiredFactoryPortalCssFragments = [
  '.portal-production .production-review-panel .admin-flow-table',
  'min-width: 920px',
  'table-layout: fixed',
  '.portal-production .production-review-panel .aor-production-note',
  '-webkit-line-clamp: 2',
  '.portal-production .production-review-panel .aor-view-button',
  '.portal-production .production-compact-navigation',
  '.portal-production .nav-panel',
  'display: none'
]

const requiredProxyFragments = [
  "'/orders'",
  "'/workflow-chains'"
]

const missing = [
  ...requiredAppFragments.filter((fragment) => !app.includes(fragment)).map((fragment) => `frontend/src/App.vue -> ${fragment}`),
  ...requiredFactoryPortalCssFragments.filter((fragment) => !factoryPortalCss.includes(fragment)).map((fragment) => `frontend/src/factory-portal.css -> ${fragment}`),
  ...requiredProxyFragments.filter((fragment) => !viteConfig.includes(fragment)).map((fragment) => `frontend/vite.config.ts -> ${fragment}`),
  ...[
    [accessControl, 'identity.role() == UserRole.WORKER', 'AccessControlService'],
    [accessControl, 'identity.hasPermission("workflow:review-production")', 'AccessControlService'],
    [runtimeController, 'roles = {UserRole.ADMIN, UserRole.WORKER}', 'WorkflowRuntimeController'],
    [runtimeService, 'normalizeApprovalRequest', 'WorkflowRuntimeService'],
    [runtimeService, 'connectDesignGateToRouteRoots', 'WorkflowRuntimeService'],
    [runtimeService, 'workflow_assignment_event', 'WorkflowRuntimeService'],
    [authService, 'effective_permission.permission_code = m.permission_code', 'DatabaseAuthService'],
    [alignmentMigration, "menu.menu_code = 'production-review'", 'V56 migration'],
    [alignmentMigration, "'DESIGN_GATE'", 'V56 migration'],
    [alignmentMigration, 'CREATE TABLE workflow_assignment_event', 'V56 migration'],
    [skipAlignmentMigration, "role.role_code = 'WORKER'", 'V57 migration'],
    [skipAlignmentMigration, "permission.permission_code = 'workflow:skip-optional'", 'V57 migration'],
    [skipPermissionRenameMigration, "permission_name = '管理员跳过可选工序'", 'V58 migration'],
    [legacySnapshotRepairMigration, "legacy_node.node_status IN ('PENDING', 'READY')", 'V59 migration'],
    [legacySnapshotRepairMigration, "legacy_node.node_status = 'SKIPPED'", 'V59 migration'],
    [legacySnapshotRepairMigration, "predecessor.node_category <> 'DESIGN_GATE'", 'V59 migration'],
    [legacySnapshotRepairMigration, "task.node_instance_id = gate_node.node_instance_id", 'V59 migration'],
    [openapi, '具有 workflow:review-production 直接权限的 WORKER', 'OpenAPI'],
    [openapi, '权限：仅 ADMIN', 'OpenAPI'],
    [mainChainSmoke, "await grantProductionReviewPermission(adminSession.accessToken, workerSession)", 'main-chain smoke'],
    [mainChainSmoke, "approveProductionReview(createdOrder.order_id, workerSession.accessToken)", 'main-chain smoke'],
    [mainChainSmoke, 'await claimDesignTask', 'main-chain smoke'],
    [mainChainSmoke, 'await approveDesignDraftInternally', 'main-chain smoke'],
    [mainChainSmoke, 'assertProductionReviewMenuIsolation', 'main-chain smoke'],
    [mainChainSmoke, "TASK9D62_ORDINARY_WORKER_USERNAME ?? 'demo_cad'", 'main-chain smoke'],
    [decisions, 'SUPERSEDED_BY_D-173', 'DECISIONS.md'],
    [historicalDemoReview, '历史证据说明（2026-07-31）', 'historical demo review evidence'],
    [historicalDemoReview, 'D-173', 'historical demo review evidence'],
    [historicalDemoDelivery, '当前规则以 D-173 / V56 为准', 'historical demo delivery'],
    [historicalRecordingReport, '历史证据说明（2026-07-31）', 'historical recording report'],
    [historicalRecordingReport, 'D-173', 'historical recording report']
  ].filter(([content, fragment]) => !content.includes(fragment))
    .map(([, fragment, file]) => `${file} -> ${fragment}`)
]

for (const [file, content] of [
  ['AccessControlService', accessControl],
  ['WorkflowRuntimeService', runtimeService]
]) {
  if (content.includes('canAccessUnassignedProductionPool')) {
    missing.push(`${file} -> must not expose a generic unassigned production pool`)
  }
}

if (missing.length > 0) {
  console.error('task 9D.4 frontend check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.4 frontend check ok')
