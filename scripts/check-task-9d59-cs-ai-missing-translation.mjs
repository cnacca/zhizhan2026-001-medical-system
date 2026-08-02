import fs from 'node:fs'

const checks = [
  ['frontend/src/App.vue', [
    'type MissingInfoResponse',
    'type AiTranslateResponse',
    'csMissingInfoItems',
    'csTranslationSourceText',
    'csTranslationDraft',
    'checkCsMissingInfo',
    'generateCsTranslationDraft',
    'applyCsTranslationDraftToProductionNote',
    '/ai/check-missing',
    '/ai/translate',
    '资料缺失提示',
    'AI 翻译草稿',
    '写入生产备注',
  ]],
  ['acceptance.json', [
    'task-9d59-cs-ai-missing-translation-required-text',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.59',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '客服资料缺失提示与 AI 翻译草稿确认第一增量',
  ]],
  ['DECISIONS.md', [
    'D-105 任务 9D.59 客服 AI 草稿必须人工确认后写入生产备注',
  ]],
  ['STATUS.md', [
    '9D.59 客服资料缺失提示与 AI 翻译草稿确认第一增量',
  ]],
  ['tasks/README.md', [
    '任务 9D.59：客服资料缺失提示与 AI 翻译草稿确认第一增量',
  ]],
  ['README.md', [
    '9D.59 客服资料缺失提示与 AI 翻译草稿确认第一增量',
  ]],
  ['package.json', [
    'check:task9d59',
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

console.log('task 9D.59 CS AI missing/translation check ok')
