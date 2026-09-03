import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(new URL('../frontend/package.json', import.meta.url))
const ts = require('typescript')
async function load(path) {
  const source = fs.readFileSync(path, 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
}
const { assignmentAvailability: availability, assignmentErrorMessage } = await load('frontend/src/utils/processAssignment.ts')
for (const status of ['PENDING', 'READY', 'IN_PROGRESS']) {
  assert.equal(availability({ assigned_user_id: null, node_status: status }, '10').canAssign, true)
  assert.equal(availability({ assigned_user_id: 9, node_status: status }, '10').canAssign, false)
  assert.equal(availability({ assigned_user_id: 9, node_status: status }, '10').canReassign, true)
  assert.equal(availability({ assigned_user_id: 9, node_status: status }, '9').canReassign, false)
}
for (const status of ['COMPLETED', 'SKIPPED', 'CANCELLED']) {
  assert.equal(availability({ assigned_user_id: 9, node_status: status }, '10').canReassign, false)
}
assert.equal(availability({ assigned_user_id: null, node_status: 'READY' }, '10', true).canAssign, false)
assert.equal(availability(null, '10').canAssign, false)
assert.match(assignmentErrorMessage({ status: 409 }), /重新读取/)
assert.match(assignmentErrorMessage({ status: 403 }), /权限/)
const { optionalRecordApplies: applies, productRecordVisible } = await load('frontend/src/doctor/uploadPresentation.ts')
assert.equal(applies('CLEAR_ALIGNER', 'shade_photo'), false)
assert.equal(applies('CONVENTIONAL_ORTHODONTICS', 'intraoral_photo'), false)
assert.equal(applies('FIXED_RESTORATION', 'old_denture_reference'), true)
assert.equal(productRecordVisible('REMOVABLE_FLEXIBLE_DENTURE', 'profile_photo'), false)
assert.equal(productRecordVisible('REMOVABLE_FULL_DENTURE', 'profile_photo'), true)
const { matchesDashboardScope: matches } = await load('frontend/src/utils/dashboardScope.ts')
const order = { created_at: '2026-09-03T00:00:00', clinic_id: 2, internal_status: 'COMPLETED' }
assert.equal(matches(order, { month: '2026-09', clinicId: 2 }), true)
assert.equal(matches(order, { month: '2026-08' }), false)
assert.equal(matches(order, { clinicId: 3 }), false)
assert.equal(matches(order, { throughDay: 2, month: '2026-09' }), false)
assert.equal(matches(order, { statuses: ['PRODUCING'] }), false)
const { productionDepartmentKey } = await load('frontend/src/utils/productionDepartment.ts')
assert.equal(productionDepartmentKey({ process_name: 'CAD检验' }), 'QC')
assert.equal(productionDepartmentKey({ process_name: 'CAD设计' }), 'CAD')
assert.equal(productionDepartmentKey({ process_name: '3D打印' }), 'PRINTING_3D')
const wizard = fs.readFileSync('frontend/src/doctor/DoctorCaseGroupWizard.vue', 'utf8')
assert.ok(!wizard.slice(wizard.indexOf('const REPLACED_PRODUCT_UPLOAD_SLOT_CODES'), wizard.indexOf('const props')).includes("'jaw_record'"))
assert.match(wizard, /required: false/)
assert.match(wizard, /changeSharedScanRole/)
assert.match(wizard, /sharedSlotAudience/)
const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
assert.match(app, /'production-scan': 'check:gate-inspect'/)
assert.match(app, /isCheckRecordsRoute && !canInspectProcess/)
assert.match(app, /:disabled="!processAssignmentState.canAssign"/)
assert.match(app, /:disabled="!processAssignmentState.canReassign"/)
console.log('PASS: assignment state/conflict, upload presentation, scope filtering, department mapping, permission guards')
