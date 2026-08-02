import fs from 'node:fs'

const checks = [
  ['frontend/nginx.conf', [
    'location /notifications',
    'proxy_pass http://backend:8080/notifications',
    'location /ws/',
    'proxy_pass http://backend:8080/ws/',
    'proxy_http_version 1.1',
    'proxy_set_header Upgrade $http_upgrade',
    'proxy_set_header Connection "upgrade"',
  ]],
  ['deploy/docker-compose.phase-one.yml', [
    'redis:',
    'backend:',
    'REDIS_HOST: redis',
    'REDIS_PORT: 6379',
    'frontend:',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/notification/NotificationRedisBroadcaster.java', [
    'app.notification.redis-broadcast-enabled',
    'StringRedisTemplate',
    'ai-order:notifications',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/notification/NotificationRedisBroadcastListener.java', [
    'app.notification.redis-broadcast-enabled',
    'instanceId.equals(broadcast.originInstanceId())',
    'pushService.pushLocalToUser',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/notification/NotificationWebSocketTests.java', [
    'websocketPushesDoctorNotificationAndMarksItDelivered',
    'doesNotContain("WebSocket内部备注")',
    'websocketAllowsLoopbackViteOrigin',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/notification/NotificationRestTests.java', [
    'currentUserListsOwnNotificationsAndCanMarkRead',
    'currentUserCanMarkAllOwnNotificationsRead',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/notification/NotificationBroadcastTests.java', [
    'pushPublishesBroadcastEvenWhenUserHasNoLocalSession',
    'redisListenerIgnoresOwnMessageAndDeliversRemoteMessageLocally',
    'other-instance',
  ]],
]

for (const [file, patterns] of checks) {
  if (!fs.existsSync(file)) {
    console.error(`${file} missing required file`)
    process.exit(1)
  }
  const text = fs.readFileSync(file, 'utf8')
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      console.error(`${file} missing required text: ${pattern}`)
      process.exit(1)
    }
  }
}

console.log('task 9D.76 notification gateway readiness check ok')
