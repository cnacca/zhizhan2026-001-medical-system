import fs from 'node:fs'

const checks = [
  ['frontend/src/App.vue', [
    'csDesignDrafts',
    'csDesignDraftPreviewUrls',
    'loadInternalDesignDrafts',
    'loadCsDesignDraftPreviewUrls',
    'cs-design-draft-preview-url-button',
    'cs-design-draft-preview-link',
    '/orders/${orderId}/design-drafts',
    '/files/${fileId}/preview-url',
    '客服设计稿预览链接',
  ]],
  ['acceptance.json', [
    'task-9d64-cs-design-draft-preview-required-text',
  ]],
  ['docs/acceptance/task-8-acceptance-matrix.md', [
    '9D.64',
  ]],
  ['docs/deployment/readiness-checklist.md', [
    '客服端设计稿审核预览增强第一段',
  ]],
  ['DECISIONS.md', [
    'D-115 任务 9D.64 客服端设计稿审核复用文件签名 URL 预览',
  ]],
  ['STATUS.md', [
    '9D.64 客服端设计稿审核预览增强第一段',
  ]],
  ['tasks/README.md', [
    '任务 9D.64：客服端设计稿审核预览增强第一段',
  ]],
  ['README.md', [
    '9D.64 客服端设计稿审核预览增强第一段',
  ]],
  ['package.json', [
    'check:task9d64',
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

console.log('task 9D.64 customer-service design draft preview check ok')
