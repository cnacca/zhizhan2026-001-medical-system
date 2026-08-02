import fs from 'node:fs'

const files = {
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/workflow/execution/CheckWorklogPerformanceTests.java', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8'),
  tasks: fs.readFileSync('tasks/README.md', 'utf8'),
  status: fs.readFileSync('STATUS.md', 'utf8'),
  readiness: fs.readFileSync('docs/deployment/readiness-checklist.md', 'utf8'),
  pkg: fs.readFileSync('package.json', 'utf8')
}

const requiredFragments = [
  [files.service, 'WorkflowExecutionService.java', 'REWORK_CREATED'],
  [files.service, 'WorkflowExecutionService.java', 'REWORK_CLOSED'],
  [files.service, 'WorkflowExecutionService.java', 'emitReworkNotification'],
  [files.service, 'WorkflowExecutionService.java', 'NotificationPushService'],
  [files.service, 'WorkflowExecutionService.java', 'ReworkNotificationPayload'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'reworkLifecycleEmitsInternalNotificationsWithoutDoctorRecipient'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'userNotificationCount(doctorUserId, "REWORK_CREATED")).isZero()'],
  [files.tests, 'CheckWorklogPerformanceTests.java', 'userNotificationCount(doctorUserId, "REWORK_CLOSED")).isZero()'],
  [files.openapi, 'docs/api/openapi.yaml', 'REWORK_CREATED'],
  [files.openapi, 'docs/api/openapi.yaml', 'REWORK_CLOSED'],
  [files.tasks, 'tasks/README.md', '任务 9D.19：返工通知联动第一增量'],
  [files.status, 'STATUS.md', '9D.19 返工通知联动第一增量'],
  [files.readiness, 'docs/deployment/readiness-checklist.md', '返工通知联动第一增量'],
  [files.pkg, 'package.json', 'check:task9d19']
]

const missing = requiredFragments
  .filter(([source, , fragment]) => !source.includes(fragment))
  .map(([, file, fragment]) => `${file} -> ${fragment}`)

if (missing.length > 0) {
  console.error('task 9D.19 rework notifications check failed:')
  for (const item of missing) {
    console.error(`- missing ${item}`)
  }
  process.exit(1)
}

console.log('task 9D.19 rework notifications check ok')
