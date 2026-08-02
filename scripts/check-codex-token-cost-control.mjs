import fs from 'node:fs'

const read = (path) => fs.readFileSync(path, 'utf8')
const exists = (path) => fs.existsSync(path)

const files = {
  agents: read('AGENTS.md'),
  packageJson: read('package.json'),
  readme: read('README.md'),
  status: read('STATUS.md'),
  decisions: read('DECISIONS.md'),
  tasks: read('tasks/README.md'),
  guide: exists('docs/development/codex-token-cost-control.md')
    ? read('docs/development/codex-token-cost-control.md')
    : '',
  report: exists('scripts/codex-token-report.mjs')
    ? read('scripts/codex-token-report.mjs')
    : ''
}

const required = [
  [files.agents, 'AGENTS.md', 'Token 成本治理'],
  [files.agents, 'AGENTS.md', '单会话请求累计超过 2000 万 token'],
  [files.agents, 'AGENTS.md', 'SOP / Superpowers 分级启用'],
  [files.agents, 'AGENTS.md', '默认轻量模式'],
  [files.agents, 'AGENTS.md', '标准模式'],
  [files.agents, 'AGENTS.md', '重型模式'],
  [files.packageJson, 'package.json', 'codex:token-report'],
  [files.packageJson, 'package.json', 'check:codex-token-cost'],
  [files.readme, 'README.md', 'npm run codex:token-report'],
  [files.readme, 'README.md', '默认轻量模式'],
  [files.status, 'STATUS.md', 'Codex Token 成本治理'],
  [files.status, 'STATUS.md', 'SOP / Superpowers 分级启用'],
  [files.decisions, 'DECISIONS.md', 'D-087 Codex Token 成本治理方案'],
  [files.decisions, 'DECISIONS.md', 'D-088 SOP / Superpowers 分级启用'],
  [files.tasks, 'tasks/README.md', 'Codex Token 成本治理'],
  [files.tasks, 'tasks/README.md', 'SOP / Superpowers 分级启用'],
  [files.guide, 'docs/development/codex-token-cost-control.md', '会话边界治理'],
  [files.guide, 'docs/development/codex-token-cost-control.md', 'SOP / Superpowers 分级启用'],
  [files.guide, 'docs/development/codex-token-cost-control.md', '轻量模式'],
  [files.guide, 'docs/development/codex-token-cost-control.md', '重型模式必须新会话开始'],
  [files.guide, 'docs/development/codex-token-cost-control.md', '禁止默认整文件读取大文档'],
  [files.guide, 'docs/development/codex-token-cost-control.md', 'npm run codex:token-report'],
  [files.report, 'scripts/codex-token-report.mjs', 'last_token_usage'],
  [files.report, 'scripts/codex-token-report.mjs', 'cached_input_tokens'],
  [files.report, 'scripts/codex-token-report.mjs', 'highRiskCommands'],
  [files.report, 'scripts/codex-token-report.mjs', 'fail-on-warning']
]

const missing = required.filter(([content, name, needle]) => !content.includes(needle))

if (missing.length) {
  console.error('Codex token cost control check failed:')
  for (const [, name, needle] of missing) {
    console.error(`- ${name} missing ${needle}`)
  }
  process.exit(1)
}

console.log('Codex token cost control check ok')
