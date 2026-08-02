import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const styles = fs.readFileSync('frontend/src/styles.css', 'utf8')
const controller = fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/order/form/FormConfigController.java', 'utf8')
const service = fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/order/form/FormConfigService.java', 'utf8')
const migration = fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V13__form_config_management_menu.sql', 'utf8')
const tests = fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/order/FormConfigManagementTests.java', 'utf8')
const openapi = fs.readFileSync('docs/api/openapi.yaml', 'utf8')

const requiredFragments = [
  [app, 'frontend/src/App.vue', 'isFormConfigsRoute'],
  [app, 'frontend/src/App.vue', 'createFormConfigField'],
  [app, 'frontend/src/App.vue', 'updateFormConfigField'],
  [app, 'frontend/src/App.vue', 'form-config-create-button'],
  [app, 'frontend/src/App.vue', 'form-config-update-button'],
  [app, 'frontend/src/App.vue', 'form-config-deactivate-button'],
  [styles, 'frontend/src/styles.css', 'form-config-layout'],
  [controller, 'FormConfigController.java', '@PostMapping("/form-configs")'],
  [controller, 'FormConfigController.java', '@PutMapping("/form-configs/{fieldId}")'],
  [controller, 'FormConfigController.java', 'form:manage'],
  [service, 'FormConfigService.java', 'createField'],
  [service, 'FormConfigService.java', 'updateField'],
  [service, 'FormConfigService.java', 'INACTIVE'],
  [migration, 'V13__form_config_management_menu.sql', 'form:manage'],
  [migration, 'V13__form_config_management_menu.sql', '/system/form-configs'],
  [tests, 'FormConfigManagementTests.java', 'adminCanCreateUpdateAndDeactivateFormFieldWhileDoctorCannotManageIt'],
  [openapi, 'docs/api/openapi.yaml', '任务 9D.12 第一增量'],
  [openapi, 'docs/api/openapi.yaml', 'status=INACTIVE']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.12 form CRUD check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.12 form CRUD check ok')
