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
  'class="prototype-page-heading"',
  'adminBusinessMetrics',
  'adminEfficiencyMetrics',
  'adminGlobalTodoPanel',
  'adminMonthComparisonMetrics',
  'adminMonthComparison',
  'adminSalesTrendPoints',
  'adminCurrentInboundTrendPolyline',
  'adminPreviousInboundTrendPolyline',
  'adminCurrentOutboundTrendPolyline',
  'adminPreviousOutboundTrendPolyline',
  'adminCustomerRankRows',
  '总入货',
  '总发货',
  '待发货订单',
  '返工份数',
  '内返份数',
  '生产异常',
  '客服异常',
  '客户异常',
  '物料异常',
  '成本异常',
  '全局运营待办',
  '客服审核',
  '返工未关闭',
  '本月 vs 上月',
  '本月订单',
  '本月件数',
  '接单金额',
  '出货金额',
  '本月运营效率',
  '订单完成率',
  '出货率',
  '返工率',
  '接单与出货金额趋势',
  '本月截至今日 / 上月同期',
  '本月与上月同期接单金额累计趋势',
  '本月与上月同期出货金额累计趋势',
  '十大客户排名',
  'Top 10 排名条'
])

if (!files.app.includes("portalTone !== 'production' && portalTone !== 'admin'")) {
  failures.push('frontend/src/App.vue should hide the generic trend chart on the admin dashboard')
}

if (files.app.includes('v-if="portalTone !== \'admin\'" class="prototype-page-heading"')) {
  failures.push('frontend/src/App.vue should render the shared contextual heading on the admin dashboard')
}

if (failures.length > 0) {
  console.error('admin dashboard workbench check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('admin dashboard workbench check ok')
