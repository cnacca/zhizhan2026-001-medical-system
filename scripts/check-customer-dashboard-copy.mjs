import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const metric = app.match(/\{ title: '([^']+)', value: String\(phaseOneAbCsDashboardStats\.value\.pendingReviewCount\), note: '资料和生产备注'/)

if (!metric) {
  console.error('customer dashboard pending-review metric was not found')
  process.exit(1)
}

if (metric[1] !== '信息评审') {
  console.error(`customer dashboard pending-review metric must be 信息评审, received: ${metric[1]}`)
  process.exit(1)
}

console.log('customer dashboard pending-review copy ok')
