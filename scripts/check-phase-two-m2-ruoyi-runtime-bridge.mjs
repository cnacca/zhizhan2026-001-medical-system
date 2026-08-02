import crypto from 'node:crypto'
import fs from 'node:fs'

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
    if (!content.includes(fragment)) failures.push(`${file} missing required text: ${fragment}`)
  }
}

const files = [
  'docs/acceptance/phase-two-scope-baseline-20260726.md',
  'docs/acceptance/phase-two-milestone-gap-matrix-20260728.md',
  'docs/development/phase-two-m2-ruoyi-runtime-bridge-plan-20260728.md',
  'goals/GOAL-026-phase-two-m2-ruoyi-runtime-bridge-20260728.md',
  'tasks/TASK-027-phase-two-m2-ruoyi-runtime-bridge-20260728.md',
  'backend/ruoyi-runtime-bridge/pom.xml',
  'backend/ruoyi-runtime-bridge/src/main/java/com/yuri/aiorder/ruoyi/RuoyiRuntimeBridge.java',
  'backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/BearerIdentityFilter.java',
  'backend/platform-server/src/main/java/com/yuri/aiorder/ruoyi/RuoyiRuntimeBridgeInfoContributor.java',
  'backend/platform-server/src/test/java/com/yuri/aiorder/RuoyiRuntimeBridgeTests.java'
]

for (const file of files) read(file)

const acceptance = JSON.parse(read('acceptance.json') || '{}')
if (!acceptance.active_goal || !acceptance.active_goal_file || !acceptance.active_task_file) {
  failures.push('acceptance.json missing current active goal/task pointers')
} else {
  read(acceptance.active_goal_file)
  read(acceptance.active_task_file)
}
const goal = acceptance.goals?.find((candidate) => candidate.id === 'GOAL-026')
if (!goal || goal.status !== 'completed') {
  failures.push('acceptance.json missing completed GOAL-026')
}

requireText('backend/pom.xml', ['<module>ruoyi-runtime-bridge</module>'])
requireText('backend/ruoyi-runtime-bridge/pom.xml', [
  '../../vendor/ruoyi-vue-pro-core/yudao-framework/yudao-common/src/main/java',
  'WebFilterOrderEnum.java'
])
requireText('backend/platform-server/pom.xml', ['<artifactId>ruoyi-runtime-bridge</artifactId>'])
requireText('backend/platform-server/src/main/java/com/yuri/aiorder/common/auth/BearerIdentityFilter.java', [
  '@Order(RuoyiRuntimeBridge.BEARER_FILTER_ORDER)'
])
requireText('backend/platform-server/src/main/java/com/yuri/aiorder/ruoyi/RuoyiRuntimeBridgeInfoContributor.java', [
  'ruoyiRuntimeBridge',
  'replacesExistingAuth'
])
requireText('DECISIONS.md', [
  '## D-171',
  '公共任务池按进入时间排序',
  '首个符合状态机的有效结果生效并留审计',
  '任务不自动超时回收',
  '渐进桥接权限、DataScope、审计和管理能力'
])

const source = 'vendor/ruoyi-vue-pro-core/yudao-framework/yudao-common/src/main/java/cn/iocoder/yudao/framework/common/enums/WebFilterOrderEnum.java'
const digest = crypto.createHash('sha256').update(read(source)).digest('hex')
if (digest !== '368d8d470fd5049097b96eaf262725e683cf1926f92e941ab05b1d6da871fdca') {
  failures.push(`unexpected RuoYi WebFilterOrderEnum SHA-256: ${digest}`)
}

if (failures.length) {
  console.error('phase-two M2 RuoYi runtime bridge check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('phase-two M2 RuoYi runtime bridge checks passed')
