import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/staff/StaffWorkloadController.java', [
    '/staff/workload',
    'workflow:read-internal',
    'performance:read-self',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/staff/StaffWorkloadService.java', [
    'system_user',
    'system_dept',
    'system_post',
    'assigned_node_count',
    'completed_work_log_count',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/staff/StaffWorkloadResponse.java', [
    'dept_name',
    'post_names',
    'role_codes',
    'effective_duration',
    'last_work_finished_at',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/staff/StaffWorkloadTests.java', [
    'adminCanListStaffProfileAndWorkload',
    'workerCanOnlyReadOwnStaffWorkload',
    'doctorCannotReadStaffWorkload',
  ]],
  ['frontend/src/App.vue', [
    'StaffWorkloadResponse',
    '/staff/workload',
    'staffWorkloadItems',
    'staff-workload-table',
  ]],
  ['frontend/vite.config.ts', [
    "'/staff'",
  ]],
  ['docs/api/openapi.yaml', [
    '"/staff/workload"',
    'StaffWorkloadResponse',
    'assigned_node_count',
  ]],
  ['docs/acceptance/prd-v2-gap-matrix.md', [
    '9D.86',
    '人员档案 / 工作量看板第一增量',
  ]],
  ['STATUS.md', [
    '9D.86 人员档案 / 工作量看板第一增量',
  ]],
  ['tasks/README.md', [
    '任务 9D.86：人员档案 / 工作量看板第一增量',
  ]],
  ['README.md', [
    'check:task9d86',
  ]],
  ['acceptance.json', [
    'task-9d86-staff-workload-required-text',
  ]],
  ['package.json', [
    'check:task9d86',
  ]],
]

for (const [file, patterns] of checks) {
  if (!fs.existsSync(file)) {
    console.error(`${file} missing required file`)
    process.exit(1)
  }
  const text = fs.readFileSync(file, 'utf8')
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      console.error(`${file} missing required text: ${pattern}`)
      process.exit(1)
    }
  }
}

console.log('task 9D.86 staff workload check ok')
