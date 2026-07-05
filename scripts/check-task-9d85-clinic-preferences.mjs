import fs from 'node:fs'

const failures = []

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/clinic/ClinicController.java', [
    'GetMapping("/clinics")',
    'PostMapping("/clinics")',
    'GetMapping("/clinics/{clinicId}/preference")',
    'PutMapping("/clinics/{clinicId}/preference")'
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/clinic/ClinicService.java', [
    'customer_preference',
    'doctor cannot access this clinic',
    'ALLOWED_PREFERENCE_KEYS',
    'clinic management requires CS or ADMIN role'
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/clinic/ClinicPreferenceTests.java', [
    'csCanListClinicAndMaintainPreference',
    'doctorCanOnlyReadOwnClinicPreference',
    'workerCannotReadClinicPreference',
    '客户偏好第一增量'
  ]],
  ['frontend/src/App.vue', [
    'type ClinicItem',
    'clinic-preference-panel',
    'canCreateClinic',
    'loadClinics',
    'saveClinicPreference',
    '/clinics/${selectedClinic.value.clinic_id}/preference'
  ]],
  ['frontend/vite.config.ts', [
    "'/clinics'",
    "target: 'http://localhost:8080'"
  ]],
  ['docs/api/openapi.yaml', [
    'ClinicPreference',
    '"/clinics"',
    '"/clinics/{clinicId}/preference"',
    '医生只能读取本人诊所偏好'
  ]],
  ['STATUS.md', [
    '9D.85 客户 / 诊所档案与偏好第一增量',
    'customer_preference',
    'Task 8 仍保持 `NOT_READY`'
  ]],
  ['DECISIONS.md', [
    'D-136 任务 9D.85 客户 / 诊所档案与偏好第一增量',
    '不做客户开户审批'
  ]],
  ['tasks/README.md', [
    '任务 9D.85：客户 / 诊所档案与偏好第一增量',
    'completed-first-increment',
    '复杂 CRM'
  ]],
  ['README.md', [
    'npm run check:task9d85',
    'ClinicPreferenceTests',
    '客户 / 诊所档案与偏好'
  ]],
  ['acceptance.json', [
    'task-9d85-clinic-preferences-required-text',
    'check:task9d85',
    'customer_preference'
  ]],
  ['package.json', [
    'check:task9d85'
  ]]
]

for (const [file, fragments] of checks) {
  if (!fs.existsSync(file)) {
    failures.push(`${file} -> file missing`)
    continue
  }
  const content = fs.readFileSync(file, 'utf8')
  for (const fragment of fragments) {
    if (!content.includes(fragment)) {
      failures.push(`${file} -> ${fragment}`)
    }
  }
}

for (const phrase of ['客户开户审批已完成', '定价体系已完成', '真实客户数据已导入', '客户已确认诊所偏好']) {
  for (const file of ['STATUS.md', 'tasks/README.md', 'docs/acceptance/prd-v2-gap-matrix.md']) {
    if (fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes(phrase)) {
      failures.push(`${file} -> forbidden completion claim: ${phrase}`)
    }
  }
}

if (failures.length > 0) {
  console.error('task 9D.85 clinic preference check failed:')
  for (const failure of failures) {
    console.error(`- missing ${failure}`)
  }
  process.exit(1)
}

console.log('task 9D.85 clinic preference check ok')
