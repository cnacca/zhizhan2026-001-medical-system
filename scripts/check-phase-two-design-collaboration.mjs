import fs from 'node:fs'

const failures = []

const read = (file) => {
  if (!fs.existsSync(file)) {
    failures.push(`${file} missing`)
    return ''
  }
  return fs.readFileSync(file, 'utf8')
}

const requireText = (file, fragments) => {
  const content = read(file)
  for (const fragment of fragments) {
    if (!content.includes(fragment)) failures.push(`${file} missing required text: ${fragment}`)
  }
}

const forbidText = (file, fragments) => {
  const content = read(file)
  for (const fragment of fragments) {
    if (content.includes(fragment)) failures.push(`${file} contains forbidden text: ${fragment}`)
  }
}

for (const file of [
  'docs/acceptance/phase-two-scope-baseline-20260726.md',
  'goals/GOAL-025-phase-two-design-collaboration-20260726.md',
  'tasks/TASK-026-phase-two-design-collaboration-20260726.md',
  'backend/platform-server/src/main/resources/db/migration/V49__phase_two_design_collaboration_foundation.sql',
  'backend/platform-server/src/main/resources/db/migration/V50__phase_two_design_legacy_compatibility.sql',
  'backend/platform-server/src/main/java/com/yuri/aiorder/design/DesignTaskController.java',
  'backend/platform-server/src/main/java/com/yuri/aiorder/design/DesignTaskService.java',
  'backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/DatabaseAuthService.java',
  'backend/platform-server/src/main/java/com/yuri/aiorder/file/api/FileResourceService.java',
  'frontend/src/components/ProductionDesignWorkspace.vue',
  'frontend/src/doctor/DoctorPortalV2.vue',
  'frontend/src/doctor/services/httpDoctorGateway.ts',
  'docs/api/openapi.yaml'
]) read(file)

const acceptance = JSON.parse(read('acceptance.json') || '{}')
if (acceptance.active_goal !== 'GOAL-025') {
  failures.push(`acceptance.json active_goal expected GOAL-025, got ${acceptance.active_goal}`)
}
if (acceptance.active_goal_file !== 'goals/GOAL-025-phase-two-design-collaboration-20260726.md') {
  failures.push(`unexpected active_goal_file: ${acceptance.active_goal_file}`)
}
if (acceptance.active_task_file !== 'tasks/TASK-026-phase-two-design-collaboration-20260726.md') {
  failures.push(`unexpected active_task_file: ${acceptance.active_task_file}`)
}
if (!acceptance.goals?.some((goal) => goal.id === 'GOAL-025')) {
  failures.push('acceptance.json missing GOAL-025 checks')
}

requireText('backend/platform-server/src/main/resources/db/migration/V49__phase_two_design_collaboration_foundation.sql', [
  'CREATE TABLE system_user_permission',
  'CREATE TABLE design_task',
  'CREATE TABLE design_task_event',
  'ADD COLUMN design_task_id',
  'ADD COLUMN submission_key',
  'ADD COLUMN doctor_visible_at',
  'design-draft:internal-review'
])

requireText('backend/platform-server/src/main/java/com/yuri/aiorder/design/DesignTaskService.java', [
  "task_status = 'OPEN'",
  "task_status = 'CLAIMED'",
  'design task has already been claimed',
  'submission_key is required',
  'SUBMIT_INTERNAL_REVIEW',
  'INTERNAL_APPROVE',
  'INTERNAL_REJECT',
  'doctor_visible_at',
  'only the order doctor can confirm a design draft',
  'design draft files must be completed internal files owned by the assignee',
  'requireDoctorReadableDraftFiles',
  'all design draft files must be active and doctor-readable before confirmation'
])

requireText('backend/platform-server/src/main/resources/db/migration/V50__phase_two_design_legacy_compatibility.sql', [
  "SET f.visibility = 'DOCTOR_CS'",
  "dt.task_status = 'OPEN'",
  "r.role_code = 'WORKER'"
])

requireText('backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/BearerIdentityFilter.java', [
  'databaseAuthService.loadAuthenticatedUser',
  'IdentityContext.set(identity)'
])

requireText('backend/platform-server/src/main/java/com/yuri/aiorder/file/api/FileResourceService.java', [
  'design_task scoped_design',
  'design_draft_file',
  'doctor_visible_at'
])

requireText('frontend/src/App.vue', [
  '/production/design-tasks/pool',
  '/production/design-tasks/mine',
  '/production/design-reviews',
  '/admin/design-tasks',
  'ProductionDesignWorkspace'
])

requireText('frontend/src/components/ProductionDesignWorkspace.vue', [
  'CLAIM',
  'UPLOAD_DRAFT',
  'SUBMIT_DRAFT',
  'INTERNAL_REVIEW',
  'TRANSFER_TASK',
  '/design-tasks/manage',
  "source_type: 'DESIGN_DRAFT'",
  "visibility: 'INTERNAL'",
  'submission_key',
  'class="design-workspace route-panel"'
])

requireText('frontend/vite.config.ts', [
  "'/design-tasks': backendProxy"
])

requireText('frontend/src/doctor/services/httpDoctorGateway.ts', [
  'CAD_DESIGN',
  '/design-drafts',
  '/doctor-confirm',
  'doctor_visible_at',
  'getFilePreviewUrl',
  '/preview-url',
  '/files/multipart/pending',
  '/multipart/status',
  'completed_parts',
  'resumePendingOrderUpload'
])

requireText('frontend/src/doctor/DoctorPortalV2.vue', [
  'gateway.getFilePreviewUrl',
  'dv2-preview-image',
  'dv2-preview-frame',
  'gateway.loadOrderDetail(target.orderId)'
])

forbidText('frontend/src/components/CsPortalPages.vue', ['/cs-review'])
forbidText('backend/platform-server/src/main/resources/db/migration/V49__phase_two_design_collaboration_foundation.sql', [
  'CREATE TABLE design_draft_version',
  "('DESIGN_LEADER',"
])

for (const file of [
  'goals/GOAL-025-phase-two-design-collaboration-20260726.md',
  'tasks/TASK-026-phase-two-design-collaboration-20260726.md',
  'docs/acceptance/phase-two-scope-baseline-20260726.md',
  'STATUS.md',
  'PROJECT.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md'
]) {
  forbidText(file, [
    'Task 8 状态：READY',
    'Task 8 已 READY',
    'M2 已验收',
    'M3 已验收',
    'M6 已验收',
    '客户签字已完成',
    '真实环境验收已完成'
  ])
}

if (failures.length) {
  console.error('phase-two design collaboration check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('phase-two design collaboration checks passed')
