import fs from 'node:fs'

const files = {
  controller: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionController.java', 'utf8'),
  service: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/WorkflowExecutionService.java', 'utf8'),
  response: fs.readFileSync('backend/platform-server/src/main/java/com/yuri/aiorder/workflow/execution/ProductionRewardPenaltySummaryResponse.java', 'utf8'),
  migration: fs.readFileSync('backend/platform-server/src/main/resources/db/migration/V26__production_reward_penalty_foundation.sql', 'utf8'),
  tests: fs.readFileSync('backend/platform-server/src/test/java/com/yuri/aiorder/production/ProductionRewardPenaltySummaryTests.java', 'utf8'),
  frontend: fs.readFileSync('frontend/src/App.vue', 'utf8'),
  openapi: fs.readFileSync('docs/api/openapi.yaml', 'utf8')
}

const checks = [
  [files.controller, 'WorkflowExecutionController.java', '"/production/reward-penalty/summary"'],
  [files.controller, 'WorkflowExecutionController.java', 'getProductionRewardPenaltySummary'],
  [files.service, 'WorkflowExecutionService.java', 'getProductionRewardPenaltySummary'],
  [files.service, 'WorkflowExecutionService.java', "r.record_type = 'REWARD'"],
  [files.service, 'WorkflowExecutionService.java', "r.record_type = 'PENALTY'"],
  [files.service, 'WorkflowExecutionService.java', "r.status = 'PENDING'"],
  [files.service, 'WorkflowExecutionService.java', 'COUNT(DISTINCT r.order_id)'],
  [files.response, 'ProductionRewardPenaltySummaryResponse.java', '@JsonProperty("monthly_amount")'],
  [files.migration, 'V26__production_reward_penalty_foundation.sql', 'CREATE TABLE production_reward_penalty_record'],
  [files.tests, 'ProductionRewardPenaltySummaryTests.java', 'productionRewardPenaltySummaryAggregatesTypeStatusAmountAndRelations'],
  [files.tests, 'ProductionRewardPenaltySummaryTests.java', 'doctorCannotReadProductionRewardPenaltySummary'],
  [files.frontend, 'App.vue', 'type ProductionRewardPenaltySummaryResponse'],
  [files.frontend, 'App.vue', 'loadProductionRewardPenaltySummary'],
  [files.frontend, 'App.vue', '/production/reward-penalty/summary'],
  [files.frontend, 'App.vue', '真实奖惩汇总'],
  [files.frontend, 'App.vue', '奖惩记录'],
  [files.frontend, 'App.vue', '奖惩原因'],
  [files.frontend, 'App.vue', '关联对象'],
  [files.frontend, 'App.vue', '审批状态'],
  [files.frontend, 'App.vue', '月度汇总'],
  [files.frontend, 'App.vue', '绩效影响'],
  [files.openapi, 'openapi.yaml', 'ProductionRewardPenaltySummary'],
  [files.openapi, 'openapi.yaml', 'getProductionRewardPenaltySummary']
]

const missing = checks.filter(([content, name, needle]) => !content.includes(needle))

if (missing.length) {
  console.error('9D.54 production reward penalty summary check failed:')
  for (const [, name, needle] of missing) {
    console.error(`- ${name} missing ${needle}`)
  }
  process.exit(1)
}

console.log('9D.54 production reward penalty summary static check passed.')
