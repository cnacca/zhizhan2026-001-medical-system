import fs from 'node:fs'

const checks = [
  ['frontend/src/App.vue', [
    'type ReworkImpactStep',
    'reworkImpactSteps',
    'rework-impact-map',
    'rework-impact-node',
    'is-target',
    '受影响后续工序',
    '后续工序将被重置',
  ]],
  ['frontend/src/styles.css', [
    '.rework-impact-map',
    '.rework-impact-node',
    '.rework-impact-node.is-target',
    '.rework-impact-link',
  ]],
  ['acceptance.json', [
    'task-9d57-rework-impact-visualization-required-text',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.57',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '返工影响图形化第一增量',
  ]],
  ['DECISIONS.md', [
    'D-103 任务 9D.57 返工影响图采用前端只读可视化',
  ]],
  ['STATUS.md', [
    '9D.57 返工影响图形化第一增量',
  ]],
  ['tasks/README.md', [
    '任务 9D.57：返工影响图形化第一增量',
  ]],
  ['README.md', [
    '9D.57 返工影响图形化第一增量',
  ]],
  ['package.json', [
    'check:task9d57',
  ]],
]

for (const [file, patterns] of checks) {
  const text = fs.readFileSync(file, 'utf8')
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      console.error(`${file} missing required text: ${pattern}`)
      process.exit(1)
    }
  }
}

console.log('task 9D.57 rework impact visualization check ok')
