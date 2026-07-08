import fs from 'node:fs'

const files = {
  app: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  packageJson: fs.readFileSync('package.json', 'utf8')
}

const failures = []

const requireText = (content, file, fragments) => {
  for (const fragment of fragments) {
    if (!content.includes(fragment)) {
      failures.push(`${file} missing required text: ${fragment}`)
    }
  }
}

requireText(files.packageJson, 'package.json', [
  'check:admin-dashboard-workbench',
  'scripts/check-admin-dashboard-workbench.mjs'
])

requireText(files.app, 'frontend/src/App.vue', [
  '管理经营驾驶舱',
  'adminBusinessMetrics',
  'adminEfficiencyMetrics',
  'adminSalesTrendPoints',
  'adminCustomerRankRows',
  '总入货',
  '总发货',
  '出货份数',
  '返工份数',
  '内返份数',
  '生产异常',
  '客服异常',
  '客户异常',
  '物料异常',
  '成本异常',
  '当日效率统计',
  '当日出货率',
  '返工率',
  '销售总计与同比',
  '财务口径待接入',
  '十大客户排名',
  'Top 10 排名条'
])

if (!files.app.includes("portalTone !== 'production' && portalTone !== 'admin'")) {
  failures.push('frontend/src/App.vue should hide the generic trend chart on the admin dashboard')
}

if (files.app.includes('管理控制台') && !files.app.includes('管理经营驾驶舱')) {
  failures.push('frontend/src/App.vue still uses old admin dashboard headline without management cockpit copy')
}

if (failures.length > 0) {
  console.error('admin dashboard workbench check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('admin dashboard workbench check ok')
