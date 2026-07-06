import fs from 'node:fs'

const failures = []

const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''

const requireText = (file, fragments) => {
  const content = read(file)
  if (!content) {
    failures.push(`${file} -> file missing`)
    return
  }
  for (const fragment of fragments) {
    if (!content.includes(fragment)) {
      failures.push(`${file} -> missing ${fragment}`)
    }
  }
}

requireText('backend/platform-server/pom.xml', [
  'langchain4j',
])

requireText('backend/platform-server/src/main/resources/application.yml', [
  'langchain:',
  'enabled: ${AI_LANGCHAIN_ENABLED:false}',
  'provider: ${AI_LANGCHAIN_PROVIDER:deepseek}',
])

requireText('backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayProperties.java', [
  'private final LangChain langchain = new LangChain();',
  'public boolean langChainDeepSeekEnabled()',
  'AI_LANGCHAIN_ENABLED',
])

requireText('backend/platform-server/src/main/java/com/yuri/aiorder/ai/LangChainDeepSeekAiModelClient.java', [
  'class LangChainDeepSeekAiModelClient',
  'implements AiModelClient',
  'langChainDeepSeekEnabled',
  'deepseek-chat',
])

requireText('backend/platform-server/src/main/java/com/yuri/aiorder/ai/AiGatewayService.java', [
  'LANGCHAIN_DEEPSEEK',
])

requireText('backend/platform-server/src/test/java/com/yuri/aiorder/ai/AiGatewayDeepSeekTests.java', [
  'enabledLangChainDeepSeekProviderRoutesAllAiAgentsThroughLangChain',
  'langchain-deepseek-chat',
])

requireText('README.md', [
  'AI_LANGCHAIN_ENABLED=false',
  'AI_LANGCHAIN_PROVIDER=deepseek',
  'check:task9d94',
])

requireText('STATUS.md', [
  '9D.94 LangChain + DeepSeek AI 底座对齐第一增量',
])

requireText('tasks/README.md', [
  '任务 9D.94：LangChain + DeepSeek AI 底座对齐第一增量',
])

requireText('DECISIONS.md', [
  'D-079 任务 9D.94 LangChain + DeepSeek AI 底座对齐第一增量',
])

requireText('acceptance.json', [
  'task-9d94-langchain-deepseek-foundation',
])

requireText('package.json', [
  'check:task9d94',
])

const forbidden = [
  ['backend/platform-server/src/main/resources/application.yml', [
    'AI_LANGCHAIN_ENABLED:true',
    'AI_LANGCHAIN_ENABLED: true',
  ]],
  ['README.md', [
    'LangChain + DeepSeek 已完成全部 AI 智能体',
    '真实 DeepSeek key 已联调完成',
  ]],
  ['docs/acceptance/prd-v2-gap-matrix.md', [
    'LangChain + DeepSeek 已完成',
  ]],
]

for (const [file, fragments] of forbidden) {
  const content = read(file)
  for (const fragment of fragments) {
    if (content.includes(fragment)) {
      failures.push(`${file} -> forbidden ${fragment}`)
    }
  }
}

if (failures.length > 0) {
  console.error('task 9D.94 LangChain + DeepSeek foundation check failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('task 9D.94 LangChain + DeepSeek foundation check ok')
