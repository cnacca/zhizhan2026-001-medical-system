import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const viteConfig = fs.readFileSync('frontend/vite.config.ts', 'utf8')

const requiredAppFragments = [
  'type PerformanceStatsResponse',
  'performanceStats',
  'performanceUserId',
  'loadPerformanceStats',
  'isPerformanceRoute',
  '/performance',
  '绩效统计',
  '完成工序',
  '有效工时',
  '返工次数',
  '准时率',
  '通过率',
  '工时效率',
  '查询员工绩效'
]

const requiredProxyFragments = [
  "'/performance'"
]

const missing = [
  ...requiredAppFragments.filter((fragment) => !app.includes(fragment)).map((fragment) => `frontend/src/App.vue -> ${fragment}`),
  ...requiredProxyFragments.filter((fragment) => !viteConfig.includes(fragment)).map((fragment) => `frontend/vite.config.ts -> ${fragment}`)
]

if (missing.length > 0) {
  console.error('task 9D.7 frontend check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.7 frontend check ok')
