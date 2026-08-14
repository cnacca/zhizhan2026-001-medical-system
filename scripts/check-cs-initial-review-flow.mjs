import fs from 'node:fs'

const source = fs.readFileSync('frontend/src/components/CsPortalPages.vue', 'utf8')

const requiredPatterns = [
  "if (order.internal_status === 'PENDING_CS_REVIEW') return '待客服初审'",
  "if (order.internal_status === 'CS_REJECTED') return '客服初审已退回'",
  "if (hasPassedCsReview(order)) return '客服初审已通过'",
  "const isComplete = await checkMissingInfo()",
  '订单资料仍有缺失，不能通过客服初审',
  '检测到外文客户指示，请先生成或填写翻译稿并人工核对',
  'isLegacyTechnicalProductionNote',
  'const confirmedProductionNote = reviewedDraft',
  '`/orders/${orderId}/review`',
  "action: 'APPROVE'",
  "pageResult.value = '客服初审已通过，订单已进入生产审核。'",
  '确认并通过客服初审',
  "translationReviewBucket(order)",
  "translationFilter==='NOT_STARTED'",
  '待初审 {{ translationFilterCounts.PENDING }}',
  '已初审 {{ translationFilterCounts.CONFIRMED }}',
  "translationFilter==='REJECTED'",
  '已退回 {{ translationFilterCounts.REJECTED }}'
]

for (const pattern of requiredPatterns) {
  if (!source.includes(pattern)) {
    console.error(`客服初审闭环缺少关键实现：${pattern}`)
    process.exit(1)
  }
}

for (const bucket of ['NOT_STARTED', 'PENDING', 'CONFIRMED', 'REJECTED']) {
  if (!source.includes(`translationReviewBucket(order) === '${bucket}'`)) {
    console.error(`客服初审分类缺少互斥桶：${bucket}`)
    process.exit(1)
  }
}

const missingCheckIndex = source.indexOf('const isComplete = await checkMissingInfo()')
const noteConfirmIndex = source.indexOf('const confirmedProductionNote = reviewedDraft', missingCheckIndex)
const reviewIndex = source.indexOf('`/orders/${orderId}/review`', noteConfirmIndex)

if (!(missingCheckIndex >= 0 && noteConfirmIndex > missingCheckIndex && reviewIndex > noteConfirmIndex)) {
  console.error('客服初审调用顺序不正确：应先检查资料，再冻结生产信息快照，最后推进订单状态。')
  process.exit(1)
}

console.log('CS initial review flow check ok')
