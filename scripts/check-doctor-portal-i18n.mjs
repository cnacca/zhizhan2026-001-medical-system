import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const files = {
  app: read('frontend/src/App.vue'),
  portal: read('frontend/src/doctor/DoctorPortalV2.vue'),
  wizard: read('frontend/src/doctor/DoctorCaseGroupWizard.vue'),
  prescription: read('frontend/src/doctor/DoctorOrthodonticPrescription.vue'),
  fields: read('frontend/src/doctor/DoctorDynamicFields.vue'),
  i18n: read('frontend/src/doctor/doctorI18n.ts')
}

const failures = []
const requireText = (source, text, scope) => {
  if (!source.includes(text)) failures.push(`${scope} missing: ${text}`)
}

for (const text of [
  "const doctorPortalLanguageKey = 'doctor-portal-language'",
  "doctorLoginText('医生端登录', 'Doctor Portal Login')",
  "doctorLoginText('请输入医生账号', 'Enter doctor account')",
  "doctorLoginText('登录系统', 'Sign In')",
  "setDoctorLoginLanguage('EN')"
]) requireText(files.app, text, 'App doctor login')

for (const text of [
  'provideDoctorLocale(portalLanguage)',
  "localStorage.getItem('doctor-portal-language')",
  "localStorage.setItem('doctor-portal-language'",
  "const dateInputType = computed(() => portalLanguage.value === 'EN' ? 'text' : 'date')",
  "正畸产品: 'Orthodontic Appliance'",
  "t('医生工作台', 'Doctor Portal')",
  "t('订单助手', 'Order Assistant')",
  "t('患者档案', 'Patients')",
  "t('发票与退款', 'Invoices & Refunds')",
  "t('消息中心', 'Messages')",
  "t('账户与诊所', 'Account & Clinic')",
  "t('订单详情', 'Order Details')",
  "t('患者档案', 'Patient Record')"
]) requireText(files.portal, text, 'DoctorPortalV2')

for (const text of [
  "'Case & Products'",
  "const dateInputType = computed(() => locale.value === 'EN' ? 'text' : 'date')",
  "'YYYY-MM-DD'",
  "t('资料上传', 'Upload Records')",
  "t('报价、要求与周期确认', 'Quote, Requirements & Lead Time')",
  ":data-section-label=\"t('已选产品', 'Selected Products')\"",
  'content: attr(data-section-label)',
  'localizedSourceText',
  'safeEnglishDynamicText'
]) requireText(files.wizard, text, 'DoctorCaseGroupWizard')

if (/content\s*:\s*["'][^"']*[\u3400-\u9fff]/.test(files.wizard)) {
  failures.push('DoctorCaseGroupWizard contains a hard-coded Chinese CSS content label')
}

for (const text of [
  "t('隐形正畸七步处方', 'Seven-step Clear Aligner Prescription')",
  "t('保存草稿', 'Save Draft')",
  "t('提交七步处方', 'Submit Prescription')"
]) requireText(files.prescription, text, 'DoctorOrthodonticPrescription')

requireText(files.fields, 'useDoctorI18n()', 'DoctorDynamicFields')
requireText(files.wizard, 'useDoctorI18n()', 'DoctorCaseGroupWizard')
requireText(files.prescription, 'useDoctorI18n()', 'DoctorOrthodonticPrescription')
for (const text of ['DoctorLocale', 'provideDoctorLocale', 'useDoctorI18n', 'replaceAll']) {
  requireText(files.i18n, text, 'doctorI18n')
}

const templateOf = (source, scope) => {
  const start = source.indexOf('<template>')
  const end = source.lastIndexOf('</template>')
  if (start < 0 || end < 0) {
    failures.push(`${scope} template boundary missing`)
    return ''
  }
  return source.slice(start, end + '</template>'.length)
}

const removeDeadLegacyWizard = (template) => {
  const startMarker = '<div v-if="false && wizardOpen"'
  const endMarker = '<el-dialog v-model="rejectDialogOpen"'
  const start = template.indexOf(startMarker)
  const end = template.indexOf(endMarker, start)
  if (start < 0 || end < 0) {
    failures.push('DoctorPortalV2 dead legacy wizard boundary missing')
    return template
  }
  return `${template.slice(0, start)}${template.slice(end)}`
}

const visibleTemplates = {
  DoctorPortalV2: removeDeadLegacyWizard(templateOf(files.portal, 'DoctorPortalV2')),
  DoctorCaseGroupWizard: templateOf(files.wizard, 'DoctorCaseGroupWizard'),
  DoctorOrthodonticPrescription: templateOf(files.prescription, 'DoctorOrthodonticPrescription'),
  DoctorDynamicFields: templateOf(files.fields, 'DoctorDynamicFields')
}

const protectedChineseUi = [
  '医生端菜单',
  '订单助手',
  '患者管理',
  '患者档案',
  '账单中心',
  '消息中心',
  '账户与诊所',
  '订单详情',
  '通知中心',
  '资料上传',
  '试戴与过程确认',
  '报价、要求与周期确认',
  '隐形正畸七步处方',
  '请选择',
  '保存草稿',
  '上一步',
  '下一步',
  '提交订单'
]

for (const [scope, template] of Object.entries(visibleTemplates)) {
  if (/type=["']date["']/.test(template)) {
    failures.push(`${scope} exposes browser-localized native date UI instead of the locale-aware date field`)
  }
  const lines = template.split('\n')
  for (const phrase of protectedChineseUi) {
    lines.forEach((line, index) => {
      if (line.includes(phrase) && !line.includes('t(')) {
        failures.push(`${scope}:${index + 1} exposes untranslated UI phrase: ${phrase}`)
      }
    })
  }
}

if (failures.length) {
  console.error('doctor portal i18n check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('doctor portal i18n check ok')
