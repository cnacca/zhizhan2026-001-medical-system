import fs from 'node:fs'

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const viteConfig = fs.readFileSync('frontend/vite.config.ts', 'utf8')

const requiredAppFragments = [
  'type CheckRecordResponse',
  'type WorkLogResponse',
  'checkTaskStatus',
  'checkTasks',
  'selectedCheckTask',
  'loadCheckTasks',
  'selectCheckTask',
  'submitCheckRecord',
  'loadCheckRecords',
  'worklogTasks',
  'selectedWorklogTask',
  'activeWorkLog',
  'loadWorklogTasks',
  'selectWorklogTask',
  'startSelectedWorkLog',
  'operateWorkLog',
  '/checks',
  '/worklogs/self',
  '/check-records',
  '/work-logs/start',
  '入检出检',
  '工时记录',
  '提交入检/出检',
  '开始工时',
  '暂停工时',
  '继续工时',
  '完成工时'
]

const requiredProxyFragments = [
  "'/check-records'",
  "'/work-logs'"
]

const missing = [
  ...requiredAppFragments.filter((fragment) => !app.includes(fragment)).map((fragment) => `frontend/src/App.vue -> ${fragment}`),
  ...requiredProxyFragments.filter((fragment) => !viteConfig.includes(fragment)).map((fragment) => `frontend/vite.config.ts -> ${fragment}`)
]

if (missing.length > 0) {
  console.error('task 9D.6 frontend check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.6 frontend check ok')
