import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/resources/db/migration/V33__doctor_account_settings.sql', [
    'contact_email',
    'contact_phone',
    'shipping_address',
    'notification_push_enabled',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/account/DoctorAccountController.java', [
    '/doctor/account/settings',
    '/doctor/account/password',
    'UserRole.DOCTOR',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/account/DoctorAccountService.java', [
    'passwordHashService.hash',
    'passwordHashService.matches',
    'user_type = \'DOCTOR\'',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/PasswordHashService.java', [
    'public String hash',
    'PBKDF2WithHmacSHA256',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/auth/DoctorAccountSettingsTests.java', [
    'doctorCanReadAndUpdateOwnAccountSettings',
    'doctorCanChangePasswordAndOldPasswordStopsWorking',
    'csCannotAccessDoctorSelfServiceSettings',
  ]],
  ['frontend/src/App.vue', [
    'doctor-account-settings-panel',
    '/doctor/account/settings',
    '/doctor/account/password',
    'doctorAccountSettingsForm',
  ]],
  ['frontend/vite.config.ts', [
    "'/doctor'",
  ]],
  ['docs/api/openapi.yaml', [
    '"/doctor/account/settings"',
    '"/doctor/account/password"',
    'DoctorAccountSettings',
    'DoctorPasswordUpdateRequest',
  ]],
  ['docs/acceptance/prd-v2-gap-matrix.md', [
    '9D.89',
    '医生账户设置基础闭环',
  ]],
  ['STATUS.md', [
    '9D.89 医生账户设置基础闭环',
  ]],
  ['tasks/README.md', [
    '任务 9D.89：医生账户设置基础闭环',
  ]],
  ['README.md', [
    'check:task9d89',
  ]],
  ['acceptance.json', [
    'task-9d89-doctor-account-settings-required-text',
  ]],
  ['package.json', [
    'check:task9d89',
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

console.log('task 9D.89 doctor account settings check ok')
