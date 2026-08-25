import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const wizard = fs.readFileSync(
  path.join(root, 'frontend/src/doctor/DoctorCaseGroupWizard.vue'),
  'utf8'
)

const failures = []
const requireText = (source, fragment, scope) => {
  if (!source.includes(fragment)) failures.push(`${scope} missing: ${fragment}`)
}

const stepTwoStart = wizard.indexOf('<section v-else-if="step === 2"')
const stepThreeStart = wizard.indexOf('<section v-else-if="step === 3"', stepTwoStart)
const combinedStep = stepTwoStart >= 0 && stepThreeStart > stepTwoStart
  ? wizard.slice(stepTwoStart, stepThreeStart)
  : ''
const materialsHeading = combinedStep.indexOf("{{ t('材料与工艺', 'Materials & Process') }}")
const productionSection = materialsHeading >= 0 ? combinedStep.slice(0, materialsHeading) : ''
const materialSection = materialsHeading >= 0 ? combinedStep.slice(materialsHeading) : ''

if (!combinedStep) failures.push('DoctorCaseGroupWizard.vue combined product-configuration step was not found')
if (materialsHeading < 0) failures.push('DoctorCaseGroupWizard.vue materials section was not found')

const directFormKeys = (source) => Array.from(
  new Set(Array.from(source.matchAll(/form_values\.([A-Za-z0-9_]+)/g), (match) => match[1]))
)
const productionKeys = directFormKeys(productionSection)
const materialKeys = directFormKeys(materialSection)
const duplicateDirectKeys = productionKeys.filter((key) => materialKeys.includes(key))
if (duplicateDirectKeys.length) {
  failures.push(`fields rendered in both production and material sections: ${duplicateDirectKeys.join(', ')}`)
}

const ownedSetMatch = wizard.match(/const wizardOwnedFormFields = new Set\(\[([\s\S]*?)\]\)/)
const ownedFields = new Set(
  Array.from(ownedSetMatch?.[1]?.matchAll(/'([A-Za-z0-9_]+)'/g) ?? [], (match) => match[1])
)
if (!ownedSetMatch) failures.push('wizardOwnedFormFields was not found')

const template = wizard.slice(wizard.indexOf('<template>'))
const hardCodedTemplateFields = new Set(directFormKeys(template))
for (const pattern of [
  /sourceArray\(activeItem, '([A-Za-z0-9_]+)'\)/g,
  /toggleSourceArray\(activeItem, '([A-Za-z0-9_]+)'/g,
  /updateTextField\(activeItem, '([A-Za-z0-9_]+)'/g
]) {
  for (const match of template.matchAll(pattern)) hardCodedTemplateFields.add(match[1])
}

for (const field of hardCodedTemplateFields) {
  if (!ownedFields.has(field)) failures.push(`hard-coded field is not excluded from dynamic supplemental fields: ${field}`)
}

for (const field of [
  'orthodontic_concern',
  'orthodontic_accessories',
  'precision_attachments',
  'process_reviews',
  'case_note'
]) {
  if (!ownedFields.has(field)) failures.push(`hard-coded structured field is not owned by the wizard: ${field}`)
}

for (const field of [
  'implant_system',
  'implant_diameter_length',
  'transmucosal_height_mm',
  'connection_type',
  'retention_type'
]) {
  if (productionSection.includes(`form_values.${field}`)) {
    failures.push(`implant parameter still appears in production requirements: ${field}`)
  }
  if (!materialSection.includes(`form_values.${field}`)) {
    failures.push(`implant parameter is missing from implant parameters: ${field}`)
  }
}

for (const category of [
  'FIXED_RESTORATION',
  'REMOVABLE_PROSTHETICS',
  'IMPLANT_RESTORATION',
  'CONVENTIONAL_ORTHODONTICS',
  'CLEAR_ALIGNER',
  'DESIGN_SERVICE'
]) {
  requireText(productionSection, `productCategory(activeItem) === '${category}'`, 'production requirements category coverage')
}

for (const fragment of [
  'const seen = new Set<string>()',
  'wizardOwnedFormFields.has(field.key) || seen.has(field.key)',
  '<section v-if="!designServiceSelected" class="case-panel case-config-panel">',
  "t('修复体边缘形式 *', 'Restoration Margin Design *')",
  "t('边缘位置 / 肩台', 'Margin Position / Shoulder')"
]) requireText(wizard, fragment, 'DoctorCaseGroupWizard.vue')

if (failures.length) {
  console.error('doctor order field ownership check failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('doctor order field ownership check ok')
