import fs from 'node:fs'

const failures = []

const checks = [
  ['backend/platform-server/src/main/resources/db/migration/V31__patient_management_foundation.sql', [
    'CREATE TABLE patient_record',
    'ADD COLUMN patient_id',
    'patient:manage-doctor',
    '/doctor/patients'
  ]],
  ['backend/platform-server/src/main/resources/db/migration/V47__doctor_patient_profile_enhancement.sql', [
    'date_of_birth',
    'medical_notes',
    'patient_tags',
    'treatment_status',
    'treatment_started_at'
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/patient/PatientManagementController.java', [
    'GetMapping("/patients")',
    'PostMapping("/patients")',
    'GetMapping("/patients/{patientId}")',
    'PutMapping("/patients/{patientId}")',
    'GetMapping("/patients/{patientId}/orders")',
    'patient:manage-doctor'
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/patient/PatientManagementService.java', [
    'doctor_user_id = :doctorUserId',
    'doctor cannot access this patient',
    'PatientOrderResponse',
    'external_status'
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/order/api/OrderCreationService.java', [
    'validateOwnedPatient',
    'doctor cannot bind this patient',
    'patient_id = :patientId'
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/patient/PatientManagementTests.java', [
    'doctorCanCreateSearchAndReadOwnPatientHistory',
    'doctorCannotBindOrReadAnotherDoctorsPatient',
    'lin.updated@example.com',
    'medical_notes',
    'internal_status',
    'production_note'
  ]],
  ['frontend/src/App.vue', [
    '/doctor/patients',
    'type PatientRecord',
    'loadDoctorPatients',
    'createDoctorPatient',
    '患者管理'
  ]],
  ['docs/api/openapi.yaml', [
    'PatientRecord',
    'CreatePatientRequest',
    'UpdatePatientRequest',
    'PatientOrder',
    '"/patients"',
    '"/patients/{patientId}"',
    '"/patients/{patientId}/orders"'
  ]],
  ['docs/acceptance/prd-v2-gap-matrix.md', [
    '医生患者管理',
    'PARTIAL',
    '9D.83',
    '患者档案',
    '订单绑定'
  ]],
  ['STATUS.md', [
    '9D.83 患者管理基础版第一增量',
    'patient_record',
    'Task 8 仍保持 `NOT_READY`'
  ]],
  ['DECISIONS.md', [
    'D-134 任务 9D.83 患者管理基础版第一增量',
    'patient_record',
    'patient_id'
  ]],
  ['tasks/README.md', [
    '任务 9D.83：患者管理基础版第一增量',
    'completed-first-increment',
    '真实客户数据导入'
  ]],
  ['README.md', [
    'npm run check:task9d83',
    'PatientManagementTests',
    '患者管理基础版'
  ]],
  ['package.json', [
    'check:task9d83'
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

const forbiddenFiles = [
  'docs/acceptance/prd-v2-gap-matrix.md',
  'STATUS.md',
  'tasks/README.md'
]
const forbiddenPhrases = [
  '患者管理已全部完成',
  '客户已确认患者管理',
  '真实客户数据已导入',
  'Task 8 READY'
]
for (const file of forbiddenFiles) {
  if (!fs.existsSync(file)) {
    continue
  }
  const content = fs.readFileSync(file, 'utf8')
  for (const phrase of forbiddenPhrases) {
    if (content.includes(phrase)) {
      failures.push(`${file} -> forbidden completion claim: ${phrase}`)
    }
  }
}

if (failures.length > 0) {
  console.error('task 9D.83 patient management check failed:')
  for (const failure of failures) {
    console.error(`- missing ${failure}`)
  }
  process.exit(1)
}

console.log('task 9D.83 patient management check ok')
