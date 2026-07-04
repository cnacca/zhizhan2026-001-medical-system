import fs from 'node:fs'

const checks = [
  ['frontend/src/App.vue', [
    'type FilePreviewUrlResponse',
    'designDraftPreviewUrls',
    'loadDesignDraftPreviewUrls',
    'design-draft-preview-link',
    '/files/${fileId}/preview-url',
    '设计稿预览链接',
  ]],
  ['acceptance.json', [
    'task-9d60-design-draft-preview-urls-required-text',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.60',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '设计稿预览 URL 聚合第一增量',
  ]],
  ['DECISIONS.md', [
    'D-106 任务 9D.60 复用文件预览签名 URL 聚合设计稿预览入口',
  ]],
  ['STATUS.md', [
    '9D.60 设计稿预览 URL 聚合第一增量',
  ]],
  ['tasks/README.md', [
    '任务 9D.60：设计稿预览 URL 聚合第一增量',
  ]],
  ['README.md', [
    '9D.60 设计稿预览 URL 聚合第一增量',
  ]],
  ['package.json', [
    'check:task9d60',
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

console.log('task 9D.60 design draft preview URL aggregation check ok')
