import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGovernanceCostTrendResponse.java', [
    'AiGovernanceCostTrendResponse',
    'total_estimated_cost_microusd',
    'model_count',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayController.java', [
    '/ai/governance/cost-trend',
    'governanceCostTrend',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'governanceCostTrend',
    "result_status = 'SUCCESS'",
    'COUNT(DISTINCT model_name)',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayTests.java', [
    'aiGovernanceCostTrendGroupsRecentSuccessCostByDayForInternalUsers',
    'aiGovernanceCostTrendRejectsDoctorUsers',
  ]],
  ['docs/api/openapi.yaml', [
    '/ai/governance/cost-trend',
    'AiGovernanceCostTrendResponse',
    '任务 9D.42',
  ]],
  ['acceptance.json', ['task-9d42-ai-cost-trend-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.42']],
  ['docs/deployment/readiness-checklist.md', ['AI 成本趋势第一增量']],
  ['STATUS.md', ['9D.42 AI 成本趋势第一增量']],
  ['tasks/README.md', ['任务 9D.42：AI 成本趋势第一增量']],
  ['README.md', ['9D.42 AI 成本趋势第一增量']],
  ['package.json', ['check:task9d42']],
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

console.log('task 9D.42 AI cost trend check ok')
