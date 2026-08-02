import assert from 'node:assert/strict'
import fs from 'node:fs'
import {
  isProductionProgressNode,
  productionProgressSummary
} from '../frontend/src/utils/productionProgress.ts'

const nodes = [
  { process_name: '客户、客服、销售下单', node_category: 'ORDER_INTAKE', node_status: 'COMPLETED' },
  { process_name: '国外件信息检验、翻译，国内件信息检验', node_category: 'REVIEW', stage_name: '下单入厂', node_status: 'COMPLETED' },
  { process_name: '入厂检验、数据技术检验', node_category: 'CHECK', stage_name: '下单入厂', node_status: 'COMPLETED' },
  { process_name: 'CAD扫描', node_category: 'PRODUCTION', stage_name: 'CAD', node_status: 'COMPLETED' },
  { process_name: '车瓷形态确认', node_category: 'PRODUCTION', stage_name: '车瓷', node_status: 'SKIPPED' },
  { process_name: '质检出货', node_category: 'CHECK', stage_name: '收尾', node_status: 'PENDING' },
  { process_name: '客服核对订单信息及账单', node_category: 'BILLING', stage_name: '收尾', node_status: 'COMPLETED' }
]

assert.equal(isProductionProgressNode(nodes[0]), false)
assert.equal(isProductionProgressNode(nodes[1]), false)
assert.equal(isProductionProgressNode(nodes[2]), true)
assert.equal(isProductionProgressNode({
  process_name: '国外件信息检验、翻译，国内件信息检验',
  node_status: 'COMPLETED'
}), false)
assert.equal(isProductionProgressNode({
  process_name: '客服定基台',
  node_category: 'REVIEW',
  node_status: 'COMPLETED'
}), false)
assert.deepEqual(productionProgressSummary(nodes), {
  completed: 3,
  total: 4,
  percent: 75
})

const app = fs.readFileSync('frontend/src/App.vue', 'utf8')
const adminRemaining = fs.readFileSync('frontend/src/components/AdminRemainingPages.vue', 'utf8')
const csPortal = fs.readFileSync('frontend/src/components/CsPortalPages.vue', 'utf8')
const nodeResponse = fs.readFileSync(
  'backend/platform-server/src/main/java/com/yuri/aiorder/workflow/runtime/ProcessNodeResponse.java',
  'utf8'
)

for (const [file, source] of [
  ['frontend/src/App.vue', app],
  ['frontend/src/components/AdminRemainingPages.vue', adminRemaining],
  ['frontend/src/components/CsPortalPages.vue', csPortal]
]) {
  assert.match(source, /productionProgressNodes|productionProgressSummary/, `${file} 未接入统一生产进度口径`)
}
assert.match(nodeResponse, /node_category/, '工序实例接口未返回节点类别')

console.log('production progress scope check ok')
