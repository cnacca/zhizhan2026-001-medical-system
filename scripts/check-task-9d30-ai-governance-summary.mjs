import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayController.java', [
    '"/ai/governance/summary"',
    'governanceSummary',
    'AiGovernanceSummaryResponse',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'governanceSummary',
    'AI_RATE_LIMITED',
    'AI_MODEL_FAILED',
    'estimated_cost_microusd',
    'latest_model_failure_at',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGovernanceSummaryResponse.java', [
    'window_hours',
    'success_count',
    'rate_limited_count',
    'model_failed_count',
    'estimated_cost_microusd',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayTests.java', [
    'aiGovernanceSummaryCountsRecentAuditOutcomesForInternalUsers',
    '/ai/governance/summary',
  ]],
  ['docs/api/openapi.yaml', [
    '/ai/governance/summary',
    'AiGovernanceSummaryResponse',
    'getAiGovernanceSummary',
  ]],
  ['acceptance.json', ['task-9d30-ai-governance-summary-required-text']],
  ['STATUS.md', ['9D.30 已补 AI 治理摘要第一增量']],
  ['tasks/README.md', ['任务 9D.30：AI 治理摘要第一增量']],
  ['README.md', ['9D.30 AI 治理摘要第一增量']],
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

console.log('task 9D.30 AI governance summary check ok')
