import fs from 'node:fs'

// GOAL-034 G1 / G2：客户验收反馈中的统计展示欠账与假数据收口。
// 这条检查同时守住两件事：
//   1. 客服 / 生产工作台不再出现「待接入」占位；
//   2. 后端不再用写死的 0 冒充未启用的统计口径。

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const styles = fs.readFileSync('frontend/src/styles.css', 'utf8')
const adminPages = fs.readFileSync('frontend/src/components/AdminRemainingPages.vue', 'utf8')
const qualityResponse = fs.readFileSync(
  'backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionQualitySummaryResponse.java',
  'utf8'
)
const workflowService = fs.readFileSync(
  'backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java',
  'utf8'
)
const dashboardResponse = fs.readFileSync(
  'backend/platform-server/src/main/java/com/yuri/aiorder/dashboard/PhaseOneDashboardResponse.java',
  'utf8'
)
const dashboardService = fs.readFileSync(
  'backend/platform-server/src/main/java/com/yuri/aiorder/dashboard/PhaseOneDashboardService.java',
  'utf8'
)
const openapi = fs.readFileSync('docs/api/openapi.yaml', 'utf8')

const required = [
  // CHK014-2 客服周环比接上真实上周口径
  [app, 'App.vue', 'const previousWeekSummary = productionPreviousWeekQualitySummary.value'],
  [app, 'App.vue', 'comparison: weekOnWeekLabel(previousShippingRate)'],
  [app, 'App.vue', 'function weekOnWeekDirection('],
  // CHK014-1 独立的本月 vs 上月对比图
  [app, 'App.vue', 'const csMonthOverMonthBars = computed<CsMonthOverMonthBar[]>'],
  [app, 'App.vue', 'cs-month-compare-card'],
  [styles, 'styles.css', '.cs-month-compare-grid'],
  // CHK014-3 十大客户带上月对照
  [app, 'App.vue', 'previous_month_order_count: number'],
  [app, 'App.vue', '上月 ${customer.previous_month_order_count ?? 0} 单'],
  [dashboardResponse, 'PhaseOneDashboardResponse.java', 'previous_month_order_count'],
  [dashboardService, 'PhaseOneDashboardService.java', ':currentStartAt'],
  [openapi, 'openapi.yaml', 'previous_month_item_count'],
  // CHK012 逐部门当天 vs 上月平均
  [app, 'App.vue', '上月日均 {{ department.last_month_daily_avg_task_count }}'],
  [app, 'App.vue', '上月 {{ formatRate(department.last_month_rework_rate) }}'],
  [app, 'App.vue', '上月 {{ formatRate(department.last_month_shipping_rate) }}'],
  [styles, 'styles.css', '.production-department-baseline'],
  // P1 客诉率真实化、退货率显式置空
  [qualityResponse, 'ProductionQualitySummaryResponse.java', 'Double complaintRate'],
  [qualityResponse, 'ProductionQualitySummaryResponse.java', 'Double returnRate'],
  [workflowService, 'WorkflowExecutionService.java', "qr.record_type = 'EXTERNAL_RETURN'"],
  [app, 'App.vue', 'function formatOptionalRate('],
  [adminPages, 'AdminRemainingPages.vue', 'function optionalRate('],
  [openapi, 'openapi.yaml', 'complaint_count']
]

const failures = required
  .filter(([content, , fragment]) => !content.includes(fragment))
  .map(([, file, fragment]) => `${file} missing: ${fragment}`)

const forbidden = [
  [app, 'App.vue', "'上周口径待接入'", '客服工作台周环比仍是占位文案'],
  [app, 'App.vue', 'production-department-pending-rate">待接入', '部门效能表仍有硬编码「待接入」列'],
  [
    workflowService,
    'WorkflowExecutionService.java',
    'percentage(checkSummary.finalPassCount(), inspectedOrderCount),\n                0.0,',
    '质量汇总仍用写死的 0 冒充客诉率'
  ],
  [adminPages, 'AdminRemainingPages.vue', 'complaint_rate ?? 0', '管理端仍把未启用口径显示为 0%']
]

forbidden
  .filter(([content, , fragment]) => content.includes(fragment))
  .forEach(([, file, , message]) => failures.push(`${file}: ${message}`))

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('GOAL-034 工作台统计口径检查通过')
