import fs from 'node:fs'

const checks = [
  ['backend/platform-server/src/main/resources/db/migration/V21__ai_prompt_version_output_guard.sql', [
    'ADD COLUMN prompt_version VARCHAR(64)',
    'idx_ai_audit_prompt_version_created',
  ]],
  ['backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
    'AI_OUTPUT_GUARDED',
    'ai-governance-output-guard',
    'OUTPUT_GUARD_PATTERNS',
    'outputGuardTriggered',
    'auditOutputGuarded',
    'promptVersionFor',
    'AI_TRANSLATE_V1',
  ]],
  ['backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayDeepSeekTests.java', [
    'deepSeekProviderAuditsPromptVersionForAiTranslate',
    'deepSeekProviderGuardsSensitiveModelOutputAndAuditsIt',
    'latestPromptVersionByAgent',
    'AI_OUTPUT_GUARDED',
  ]],
  ['docs/api/openapi.yaml', [
    '任务 9D.40',
    'prompt_version',
    'AI_OUTPUT_GUARDED',
  ]],
  ['acceptance.json', ['task-9d40-ai-prompt-output-guard-required-text']],
  ['docs/acceptance/task-8-acceptance-matrix.md', ['9D.40']],
  ['docs/deployment/readiness-checklist.md', ['提示词版本与输出防护第一增量']],
  ['STATUS.md', ['9D.40 AI 提示词版本与输出防护第一增量']],
  ['tasks/README.md', ['任务 9D.40：AI 提示词版本与输出防护第一增量']],
  ['README.md', ['9D.40 AI 提示词版本与输出防护第一增量']],
  ['package.json', ['check:task9d40']],
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

console.log('task 9D.40 AI prompt/output guard check ok')
