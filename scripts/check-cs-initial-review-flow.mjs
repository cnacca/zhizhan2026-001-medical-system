import fs from 'node:fs'

const source = fs.readFileSync('frontend/src/components/CsPortalPages.vue', 'utf8')

const requiredPatterns = [
  "if (order.internal_status === 'PENDING_CS_REVIEW') return '待客服初审'",
  "if (order.internal_status === 'CS_REJECTED') return '客服初审已退回'",
  "if (hasPassedCsReview(order)) return '客服初审已通过'",
  "const isComplete = await checkMissingInfo()",
  '订单资料仍有缺失，不能通过客服初审',
  '检测到外文客户指示，请先生成或填写翻译稿并人工核对',
  "'/ai/production-note/confirm'",
  '`/orders/${orderId}/review`',
  "action: 'APPROVE'",
  "pageResult.value = '客服初审已通过，订单已进入生产审核。'",
  '确认并通过客服初审',
  '待初审 {{ translationFilterCounts.PENDING }}',
  '已初审 {{ translationFilterCounts.CONFIRMED }}'
]

for (const pattern of requiredPatterns) {
  if (!source.includes(pattern)) {
    console.error(`客服初审闭环缺少关键实现：${pattern}`)
    process.exit(1)
  }
}

const missingCheckIndex = source.indexOf('const isComplete = await checkMissingInfo()')
const noteConfirmIndex = source.indexOf("'/ai/production-note/confirm'", missingCheckIndex)
const reviewIndex = source.indexOf('`/orders/${orderId}/review`', noteConfirmIndex)

if (!(missingCheckIndex >= 0 && noteConfirmIndex > missingCheckIndex && reviewIndex > noteConfirmIndex)) {
  console.error('客服初审调用顺序不正确：应先检查资料，再确认生产信息，最后推进订单状态。')
  process.exit(1)
}

console.log('CS initial review flow check ok')
