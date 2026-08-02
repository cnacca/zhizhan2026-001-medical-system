import fs from 'node:fs'

const failures = []

const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''

const requireText = (file, fragments) => {
  const content = read(file)
  if (!content) {
    failures.push(`${file} -> file missing`)
    return
  }
  for (const fragment of fragments) {
    if (!content.includes(fragment)) {
      failures.push(`${file} -> missing ${fragment}`)
    }
  }
}

requireText('docs/acceptance/phase-one-production-support-closure-plan.md', [
  '9D.95 设备 / 物料 / 安环 / 成本 / 奖惩基础台账拆解记录',
  '2026-07-06 范围基准更新',
  '历史拆解与基础能力索引',
  '设备管理',
  '物料异常',
  '安环管理',
  '成本管理',
  '奖惩管理',
  '历史实现顺序',
  '9D.95.1 设备台账 / 设备事件录入第一增量',
  '9D.95.2 物料异常登记 / 处理状态第一增量',
  '9D.95.3 安环巡检 / 隐患整改第一增量',
  '9D.95.4 成本记录维护 / 趋势口径第一增量',
  '9D.95.5 奖惩记录 / 审批状态第一增量',
  '不接 IoT',
  '不接真实财务系统',
  '不作为工资发放结果',
  '不继续把 C 类完整管理闭环列为一期本地必做',
  'Task 8 仍保持 NOT_READY',
])

requireText('docs/acceptance/prd-v2-gap-matrix.md', [
  '9D.95 设备 / 物料 / 安环 / 成本 / 奖惩基础台账拆解记录',
  'docs/acceptance/phase-one-production-support-closure-plan.md',
])

requireText('docs/acceptance/task-8-acceptance-matrix.md', [
  '9D.95 设备 / 物料 / 安环 / 成本 / 奖惩基础台账拆解记录',
])

requireText('docs/deployment/readiness-checklist.md', [
  '9D.95 设备 / 物料 / 安环 / 成本 / 奖惩基础台账拆解记录',
])

requireText('docs/deployment/task-8-final-readiness-report.md', [
  '9D.95 设备 / 物料 / 安环 / 成本 / 奖惩基础台账拆解记录',
])

requireText('STATUS.md', [
  '9D.95 设备 / 物料 / 安环 / 成本 / 奖惩拆解第一增量',
  '历史拆解记录和已完成基础能力索引',
  '9D.95.4 成本记录维护 / 趋势口径第一增量',
])

requireText('DECISIONS.md', [
  '2026-07-06 一期范围内部确认基准',
])

requireText('tasks/README.md', [
  '设备 / 物料 / 安环 / 成本 / 奖惩不再作为一期完整闭环缺口',
])

requireText('README.md', [
  'check:task9d95',
  'phase-one-production-support-closure-plan.md',
])

requireText('acceptance.json', [
  'task-9d95-production-support-closure-plan',
  'phase-one-production-support-closure-plan.md',
])

requireText('package.json', [
  'check:task9d95',
])

const forbidden = [
  '设备 / 物料 / 安环 / 成本 / 奖惩已全部完成',
  '设备 / 物料 / 安环 / 成本 / 奖惩 READY',
  '真实 IoT 已接入',
  '真实财务系统已接入',
  '工资发放已完成',
]

for (const file of [
  'docs/acceptance/phase-one-production-support-closure-plan.md',
  'docs/acceptance/prd-v2-gap-matrix.md',
  'STATUS.md',
  'tasks/README.md',
]) {
  const content = read(file)
  for (const fragment of forbidden) {
    if (content.includes(fragment)) {
      failures.push(`${file} -> forbidden ${fragment}`)
    }
  }
}

if (failures.length > 0) {
  console.error('task 9D.95 production support closure plan check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('task 9D.95 production support closure plan check ok')
