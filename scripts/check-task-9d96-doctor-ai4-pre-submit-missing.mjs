import fs from 'node:fs'

const read = (path) => fs.readFileSync(path, 'utf8')

const files = {
  frontend: read('frontend/src/App.vue'),
  status: read('STATUS.md'),
  decisions: read('DECISIONS.md'),
  tasks: read('tasks/README.md'),
  readme: read('README.md'),
  gapMatrix: read('docs/acceptance/prd-v2-gap-matrix.md'),
  task8Matrix: read('docs/acceptance/task-8-acceptance-matrix.md'),
  readiness: read('docs/deployment/readiness-checklist.md'),
  finalReport: read('docs/deployment/task-8-final-readiness-report.md'),
  acceptance: read('acceptance.json'),
  packageJson: read('package.json')
}

const required = [
  [files.frontend, 'App.vue', 'doctorPreSubmitMissingItems'],
  [files.frontend, 'App.vue', 'doctorPreSubmitMissingComplete'],
  [files.frontend, 'App.vue', 'autoCheckDoctorOrderMissingBeforeSubmit'],
  [files.frontend, 'App.vue', "apiFetch<MissingInfoResponse>('/ai/check-missing'"],
  [files.frontend, 'App.vue', 'doctor-order-missing-alert'],
  [files.frontend, 'App.vue', 'doctor-order-missing-item'],
  [files.frontend, 'App.vue', 'AI-4 资料缺失检查'],
  [files.frontend, 'App.vue', '请先补齐必填资料后再提交'],
  [files.status, 'STATUS.md', '9D.96 医生提交前 AI-4 资料缺失自动触发体验第一增量'],
  [files.decisions, 'DECISIONS.md', 'D-086 任务 9D.96 医生提交前 AI-4 资料缺失自动触发体验第一增量'],
  [files.tasks, 'tasks/README.md', '任务 9D.96：医生提交前 AI-4 资料缺失自动触发体验第一增量'],
  [files.readme, 'README.md', 'npm run check:task9d96'],
  [files.gapMatrix, 'prd-v2-gap-matrix.md', '9D.96 医生提交前 AI-4 资料缺失自动触发体验第一增量'],
  [files.task8Matrix, 'task-8-acceptance-matrix.md', '9D.96 医生提交前 AI-4 资料缺失自动触发体验第一增量'],
  [files.readiness, 'readiness-checklist.md', '9D.96 医生提交前 AI-4 资料缺失自动触发体验第一增量'],
  [files.finalReport, 'task-8-final-readiness-report.md', '9D.96 医生提交前 AI-4 资料缺失自动触发体验第一增量'],
  [files.acceptance, 'acceptance.json', 'task-9d96-doctor-ai4-pre-submit-missing'],
  [files.acceptance, 'acceptance.json', 'npm run check:task9d96'],
  [files.acceptance, 'acceptance.json', 'Task 8 仍保持 NOT_READY'],
  [files.packageJson, 'package.json', 'check:task9d96']
]

const forbidden = [
  'AI 自动驳回订单已完成',
  '医生端资料缺失已全部完成',
  '真实 DeepSeek key 已联调',
  'Task 8 READY'
]

const missing = required.filter(([content, name, needle]) => !content.includes(needle))
const blocked = forbidden.flatMap((needle) =>
  [files.status, files.tasks, files.readme, files.gapMatrix, files.task8Matrix, files.readiness, files.finalReport]
    .filter((content) => content.includes(needle))
    .map(() => needle)
)

if (missing.length || blocked.length) {
  console.error('task 9D.96 doctor AI-4 pre-submit missing check failed:')
  for (const [, name, needle] of missing) {
    console.error(`- ${name} missing ${needle}`)
  }
  for (const needle of blocked) {
    console.error(`- forbidden ${needle}`)
  }
  process.exit(1)
}

console.log('task 9D.96 doctor AI-4 pre-submit missing check ok')
