import fs from 'node:fs'
import { requireCurrentPointerAtOrAfter } from './stage-check-helpers.mjs'

const failures = []

const read = (file) => {
  if (!fs.existsSync(file)) {
    failures.push(`${file} missing`)
    return ''
  }
  return fs.readFileSync(file, 'utf8')
}

const requireText = (file, fragments) => {
  const content = read(file)
  for (const fragment of fragments) {
    if (!content.includes(fragment)) {
      failures.push(`${file} missing required text: ${fragment}`)
    }
  }
}

const forbidText = (file, fragments) => {
  const content = read(file)
  for (const fragment of fragments) {
    if (content.includes(fragment)) {
      failures.push(`${file} contains forbidden text: ${fragment}`)
    }
  }
}

const acceptance = JSON.parse(read('acceptance.json') || '{}')
requireCurrentPointerAtOrAfter(acceptance, fs, failures, 'GOAL-014')
if (!Array.isArray(acceptance.goals) || !acceptance.goals.some((goal) => goal.id === 'GOAL-014')) {
  failures.push('acceptance.json missing GOAL-014 checks')
}

requireText('goals/GOAL-014-websocket-notification-readiness-closure-20260707.md', [
  '# GOAL-014 WebSocket / Notification Readiness Closure',
  'WebSocket / 通知生产 readiness 收口',
  'Task 8 remains `NOT_READY`',
  'GOAL-013 remains completed',
  'websocket-notification-prod',
])

requireText('tasks/TASK-015-websocket-notification-readiness-closure-20260707.md', [
  '# TASK-015 WebSocket / Notification Readiness Closure',
  'Goal: `goals/GOAL-014-websocket-notification-readiness-closure-20260707.md`',
  '## Checklist',
  'Scope:',
  'Non-goals:',
  'Acceptance:',
  'Verification:',
  'Stage machine check',
  'Production readiness template',
  'Notification evidence consolidation',
  'RepoFrame and readiness writeback',
])

requireText('package.json', [
  'check:websocket-notification-readiness-closure',
  'scripts/check-websocket-notification-readiness-closure.mjs',
  'check:task9d76',
])

requireText('docs/deployment/websocket-notification-production-readiness.md', [
  'WebSocket / 通知生产 readiness 验收记录模板',
  '状态：TEMPLATE_READY / PARTIAL',
  '真实双后端实例 Redis 联调',
  '心跳 / 重连压测',
  'Nginx HTTPS WebSocket 网关',
  '浏览器通知权限',
  '完整业务页面联动',
  '生产 webhook 联调',
  '待填写',
  '待确认',
  '不填写真实密钥',
  '不填写真实 webhook URL',
  '不代表真实双实例 Redis 联调完成',
  '不代表 Nginx HTTPS 已验收完成',
  'Task 8 仍保持 NOT_READY',
])

requireText('scripts/check-task-9d76-notification-gateway.mjs', [
  'frontend/nginx.conf',
  'location /notifications',
  'location /ws/',
  'NotificationWebSocketTests',
  'NotificationRestTests',
  'NotificationBroadcastTests',
])

requireText('backend/platform-server/src/test/java/com/yuri/aiorder/notification/NotificationWebSocketTests.java', [
  'websocketPushesDoctorNotificationAndMarksItDelivered',
  'doesNotContain("WebSocket内部备注")',
  'websocketAllowsLoopbackViteOrigin',
])

requireText('backend/platform-server/src/test/java/com/yuri/aiorder/notification/NotificationRestTests.java', [
  'currentUserListsOwnNotificationsAndCanMarkRead',
  'currentUserCanMarkAllOwnNotificationsRead',
])

requireText('backend/platform-server/src/test/java/com/yuri/aiorder/notification/NotificationBroadcastTests.java', [
  'pushPublishesBroadcastEvenWhenUserHasNoLocalSession',
  'redisListenerIgnoresOwnMessageAndDeliversRemoteMessageLocally',
  'other-instance',
])

for (const file of [
  'STATUS.md',
  'PROJECT.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md',
  'docs/deployment/task-8-final-readiness-report.md',
]) {
  requireText(file, [
    'GOAL-014',
    'TASK-015',
    'WebSocket / 通知生产 readiness 收口',
    'check:websocket-notification-readiness-closure',
    'websocket-notification-prod',
    'Task 8',
  ])
}

requireText('acceptance.json', [
  'GOAL-014',
  'goals/GOAL-014-websocket-notification-readiness-closure-20260707.md',
  'tasks/TASK-015-websocket-notification-readiness-closure-20260707.md',
  'check:websocket-notification-readiness-closure',
  'websocket-notification-readiness-template-required-text',
  'websocket-notification-readiness-no-fake-ready',
])

const websocketGap = acceptance.task8_readiness_gaps?.find((gap) => gap.id === 'websocket-notification-prod')
if (!websocketGap) {
  failures.push('acceptance.json missing websocket-notification-prod readiness gap')
} else {
  if (websocketGap.status !== 'PARTIAL') {
    failures.push(`websocket-notification-prod expected PARTIAL, got ${websocketGap.status}`)
  }
  for (const fragment of [
    'GOAL-014 / TASK-015',
    'docs/deployment/websocket-notification-production-readiness.md',
    '真实双后端实例 Redis 联调',
    'Nginx HTTPS',
    '生产 webhook',
    'Task 8 NOT_READY',
  ]) {
    const combined = `${websocketGap.current_evidence}\n${websocketGap.remaining_reason}\n${websocketGap.minimum_closure_loop}\n${websocketGap.verification}`
    if (!combined.includes(fragment)) {
      failures.push(`websocket-notification-prod gap missing required text: ${fragment}`)
    }
  }
}

for (const [gapId, expectedStatus] of [
  ['websocket-notification-prod', 'PARTIAL'],
  ['customer-pm-confirmations', 'PARTIAL'],
  ['ai-production-governance', 'PARTIAL'],
  ['deployment-infrastructure', 'PARTIAL'],
  ['frontend-business-pages', 'PARTIAL'],
]) {
  const gap = acceptance.task8_readiness_gaps?.find((item) => item.id === gapId)
  if (!gap || gap.status !== expectedStatus) {
    failures.push(`acceptance.json expected ${gapId} to remain ${expectedStatus}`)
  }
}

for (const file of [
  'goals/GOAL-014-websocket-notification-readiness-closure-20260707.md',
  'tasks/TASK-015-websocket-notification-readiness-closure-20260707.md',
  'docs/deployment/websocket-notification-production-readiness.md',
  'STATUS.md',
  'PROJECT.md',
  'tasks/README.md',
  'README.md',
  'DECISIONS.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'docs/acceptance/task-8-acceptance-matrix.md',
  'docs/deployment/readiness-checklist.md',
  'docs/deployment/task-8-final-readiness-report.md',
]) {
  forbidText(file, [
    'Task 8 状态：READY',
    'Task 8 已 READY',
    'websocket-notification-prod 已 READY',
    '状态：真实双实例 Redis 联调已完成',
    '结论：真实双实例 Redis 联调已完成',
    '状态：Nginx HTTPS 已验收完成',
    '结论：Nginx HTTPS 已验收完成',
    '状态：生产 webhook 已联调完成',
    '结论：生产 webhook 已联调完成',
    '状态：真实环境通知验收已完成',
    '结论：真实环境通知验收已完成',
    '客户/PM 签字状态：已确认',
    '客户/PM 签字状态：已签字',
  ])
}

const template = read('docs/deployment/websocket-notification-production-readiness.md')
for (const pattern of [
  /AI_EXTERNAL_ALERT_WEBHOOK_URL\s*=\s*(?!待填写|external-secret|replace-with|<)[^\s|`]+/i,
  /AI_EXTERNAL_ALERT_WEBHOOK_SIGNING_SECRET\s*=\s*(?!待填写|external-secret|replace-with|<)[^\s|`]+/i,
  /AI_EXTERNAL_ALERT_RECEIVER_SIGNING_SECRET\s*=\s*(?!待填写|external-secret|replace-with|<)[^\s|`]+/i,
  /wss?:\/\/(?:\d{1,3}\.){3}\d{1,3}[^\s|`]*/i,
  /https?:\/\/(?:\d{1,3}\.){3}\d{1,3}[^\s|`]*/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
]) {
  if (pattern.test(template)) {
    failures.push(`docs/deployment/websocket-notification-production-readiness.md contains forbidden secret-like value: ${pattern}`)
  }
}

if (failures.length > 0) {
  console.error('websocket notification readiness closure check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('websocket notification readiness closure check ok')
