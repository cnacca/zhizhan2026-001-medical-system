import fs from 'node:fs'

const read = (file) => fs.readFileSync(file, 'utf8')

const requiredTexts = [
  ['docs/acceptance/prd-v2-gap-matrix.md', [
    '9D.93',
    '医生文件模块不属于项目需求范围，不开发',
    '2026-07-06 内部确认基准',
    '不再继续拆编辑、历史、完整审批、真实趋势或完整管理闭环作为一期本地必做',
    '所有 AI 智能体使用 LangChain + DeepSeek 实现',
    '9D.94 已完成显式 `AI_PROVIDER=langchain-deepseek` 的底座第一增量',
  ]],
  ['STATUS.md', [
    '9D.93.1 PRD V2 范围纠偏第一闭环',
  ]],
  ['tasks/README.md', [
    '任务 9D.93.1：PRD V2 范围纠偏第一闭环',
  ]],
  ['README.md', [
    'check:task9d93',
  ]],
  ['acceptance.json', [
    'task-9d93-prd-v2-scope-rework',
  ]],
  ['package.json', [
    'check:task9d93',
  ]],
]

for (const [file, patterns] of requiredTexts) {
  const text = read(file)
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      console.error(`${file} missing required text: ${pattern}`)
      process.exit(1)
    }
  }
}

const app = read('frontend/src/App.vue')
const forbiddenFrontendTexts = [
  'doctor-files',
  '/doctor/files',
]

for (const pattern of forbiddenFrontendTexts) {
  if (app.includes(pattern)) {
    console.error(`frontend/src/App.vue still contains forbidden PRD V2 doctor file module text: ${pattern}`)
    process.exit(1)
  }
}

const matrix = read('docs/acceptance/prd-v2-gap-matrix.md')
const forbiddenMatrixTexts = [
  '设备 / 物料 / 安环 / 成本 / 奖惩仅保留为二期储备或历史展示证据',
  '设备、物料、安环、成本、奖惩完整功能已按 PRD V2.0 移出一期 READY 硬阻塞',
  '设备、物料、安环、成本、奖惩完整功能属于二期',
  'LangChain + DeepSeek 技术口径待 PM / 客户确认',
  '真实支付网关已完成',
  '真实物流 API 已完成',
  'LangChain + DeepSeek 已完成',
  '设备 / 物料 / 安环 / 成本 / 奖惩属于一期开发功能；当前',
]

for (const pattern of forbiddenMatrixTexts) {
  if (matrix.includes(pattern)) {
    console.error(`docs/acceptance/prd-v2-gap-matrix.md contains forbidden PRD V2 scope wording: ${pattern}`)
    process.exit(1)
  }
}

console.log('task 9D.93 PRD V2 scope correction check ok')
