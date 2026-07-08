import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')

const requiredFragments = [
  "id: 'production-quality-overview', title: '质量总览'",
  "id: 'production-internal-rework-management', title: '内返管理'",
  "id: 'production-external-rework-management', title: '外返管理'",
  "id: 'production-final-report', title: '终检报告'",
  "'production-internal-rework-management'",
  "'production-external-rework-management'"
]

const forbiddenFragments = [
  "id: 'production-rework-management'",
  "title: '返工管理'"
]

const failures = [
  ...requiredFragments
    .filter((fragment) => !app.includes(fragment))
    .map((fragment) => `质量与返工菜单缺少: ${fragment}`),
  ...forbiddenFragments
    .filter((fragment) => app.includes(fragment))
    .map((fragment) => `质量与返工菜单不应再保留笼统返工入口: ${fragment}`)
]

if (failures.length > 0) {
  console.error('production quality menu structure check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('production quality menu structure check ok')
