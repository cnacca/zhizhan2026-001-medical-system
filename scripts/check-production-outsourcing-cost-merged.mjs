import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')

const forbiddenFragments = [
  "id: 'production-outsourcing-cost'",
  "id: 'production-cost-process'",
  "id: 'production-cost-material'",
  "id: 'production-cost-labor'",
  "id: 'production-cost-rework'",
  "id: 'production-cost-warning'",
  "routePath: '/production/outsourcing-cost'",
  "routePath === '/production/outsourcing-cost'",
  "'production-outsourcing-cost'"
]

const requiredFragments = [
  "id: 'production-cost'",
  "title: '成本管理'",
  "description: '查看工序、材料、人工、返工、外协成本和异常预警。'",
  "children: [\n            { id: 'production-cost-outsourcing', title: '外协成本'",
  "id: 'production-cost-outsourcing', title: '外协成本'",
  "routePath: '/production/cost-management'",
  "{ title: '外协成本', detail: '跟踪外协供应商、外协订单和结算偏差。', tone: 'violet' }",
  '<el-option label="外协成本" value="OUTSOURCING" />'
]

const failures = [
  ...forbiddenFragments
    .filter((fragment) => app.includes(fragment))
    .map((fragment) => `生产端不应再保留独立外协成本入口: ${fragment}`),
  ...requiredFragments
    .filter((fragment) => !app.includes(fragment))
    .map((fragment) => `成本管理内应继续包含外协成本: ${fragment}`)
]

if (failures.length > 0) {
  console.error('production outsourcing cost merge check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('production outsourcing cost merge check ok')
