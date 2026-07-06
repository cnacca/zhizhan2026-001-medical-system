import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const args = process.argv.slice(2)
const getArg = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}

const days = Number(getArg('--days', '2'))
const sessionLimit = Number(getArg('--session-limit', '20000000'))
const contextLimit = Number(getArg('--context-limit', '150000'))
const toolOutputLimit = Number(getArg('--tool-output-limit', '30000'))
const failOnWarning = args.includes('--fail-on-warning')
const sessionsRoot = getArg('--sessions-root', path.join(os.homedir(), '.codex', 'sessions'))

const since = Date.now() - days * 24 * 60 * 60 * 1000
const byDay = new Map()
const bySession = new Map()
const highRiskCommands = []
const largeToolOutputs = []
let tokenEvents = 0

const emptyUsage = () => ({
  events: 0,
  total: 0,
  input: 0,
  cached: 0,
  output: 0,
  reasoning: 0
})

const addUsage = (target, usage) => {
  target.events += 1
  target.total += usage.total_tokens || 0
  target.input += usage.input_tokens || 0
  target.cached += usage.cached_input_tokens || 0
  target.output += usage.output_tokens || 0
  target.reasoning += usage.reasoning_output_tokens || 0
}

const walk = (dir) => {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(fullPath)
    return entry.isFile() && entry.name.startsWith('rollout-') && entry.name.endsWith('.jsonl')
      ? [fullPath]
      : []
  })
}

const parseCommand = (payload) => {
  if (payload?.type !== 'function_call') return null
  try {
    const parsed = JSON.parse(payload.arguments || '{}')
    return parsed.cmd || payload.name || ''
  } catch {
    return payload.name || ''
  }
}

const isHighRiskCommand = (command) => {
  const compact = command.replace(/\s+/g, ' ')
  return [
    /\bcat\s+(tasks\/README\.md|README\.md|STATUS\.md|DECISIONS\.md|acceptance\.json)\b/,
    /\bgit\s+diff\b(?![^|]*--stat)(?![^|]*--name-only)(?![^|]*--check)/,
    /\brg\b.+\s\.$/,
    /max_output_tokens["']?\s*:\s*[3-9]\d{4,}/
  ].some((pattern) => pattern.test(compact))
}

for (const file of walk(sessionsRoot)) {
  const stat = fs.statSync(file)
  if (stat.mtimeMs < since) continue

  const sessionId = path.basename(file)
  const sessionUsage = bySession.get(sessionId) || {
    ...emptyUsage(),
    file,
    maxContext: 0,
    cwd: ''
  }
  const callCommands = new Map()

  for (const line of fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)) {
    let record
    try {
      record = JSON.parse(line)
    } catch {
      continue
    }

    if (record.type === 'session_meta') {
      sessionUsage.cwd = record.payload?.cwd || sessionUsage.cwd
    }

    const recordTime = record.timestamp ? Date.parse(record.timestamp) : null
    const recordInWindow = recordTime === null || recordTime >= since

    if (record.type === 'response_item') {
      if (!recordInWindow) continue
      const payload = record.payload
      const command = parseCommand(payload)
      if (command) {
        callCommands.set(payload.call_id, command)
        if (isHighRiskCommand(command)) {
          highRiskCommands.push({
            timestamp: record.timestamp,
            file: sessionId,
            command: command.replace(/\s+/g, ' ').slice(0, 220)
          })
        }
      }

      if (payload?.type === 'function_call_output') {
        const match = String(payload.output || '').match(/Original token count: (\d+)/)
        const count = match ? Number(match[1]) : 0
        if (count >= toolOutputLimit) {
          largeToolOutputs.push({
            timestamp: record.timestamp,
            file: sessionId,
            tokens: count,
            command: (callCommands.get(payload.call_id) || '').replace(/\s+/g, ' ').slice(0, 220)
          })
        }
      }
    }

    if (record.type !== 'event_msg' || record.payload?.type !== 'token_count') continue
    if (!recordInWindow) continue

    const usage = record.payload.info?.last_token_usage
    if (!usage) continue

    tokenEvents += 1
    sessionUsage.maxContext = Math.max(sessionUsage.maxContext, usage.input_tokens || 0)
    addUsage(sessionUsage, usage)

    const day = record.timestamp.slice(0, 10)
    const dayUsage = byDay.get(day) || emptyUsage()
    addUsage(dayUsage, usage)
    byDay.set(day, dayUsage)
  }

  if (sessionUsage.events > 0) bySession.set(sessionId, sessionUsage)
}

const format = (number) => new Intl.NumberFormat('en-US').format(number)
const nonCached = (usage) => usage.input - usage.cached
const warnings = []

for (const [sessionId, usage] of bySession.entries()) {
  if (usage.total >= sessionLimit) warnings.push(`${sessionId} total ${format(usage.total)} >= ${format(sessionLimit)}`)
  if (usage.maxContext >= contextLimit) warnings.push(`${sessionId} context ${format(usage.maxContext)} >= ${format(contextLimit)}`)
}
if (largeToolOutputs.length > 0) warnings.push(`${largeToolOutputs.length} large tool outputs >= ${format(toolOutputLimit)}`)
if (highRiskCommands.length > 0) warnings.push(`${highRiskCommands.length} high-risk commands found`)

console.log(`Codex token report: last ${days} day(s), sessions root ${sessionsRoot}`)
console.log(`Token events: ${format(tokenEvents)}`)

console.log('\nBy UTC day:')
for (const [day, usage] of [...byDay.entries()].sort()) {
  console.log(`- ${day}: total=${format(usage.total)}, input=${format(usage.input)}, cached=${format(usage.cached)}, nonCached=${format(nonCached(usage))}, output=${format(usage.output)}, events=${format(usage.events)}`)
}

console.log('\nTop sessions:')
for (const [sessionId, usage] of [...bySession.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 8)) {
  console.log(`- ${sessionId}: total=${format(usage.total)}, cached=${format(usage.cached)}, nonCached=${format(nonCached(usage))}, maxContext=${format(usage.maxContext)}, events=${format(usage.events)}, cwd=${usage.cwd || '-'}`)
}

console.log('\nLarge tool outputs:')
for (const item of largeToolOutputs.sort((a, b) => b.tokens - a.tokens).slice(0, 8)) {
  console.log(`- ${item.timestamp} ${format(item.tokens)} tokens ${item.file}: ${item.command || '-'}`)
}

console.log('\nHigh-risk commands:')
for (const item of highRiskCommands.slice(0, 8)) {
  console.log(`- ${item.timestamp} ${item.file}: ${item.command}`)
}

if (warnings.length > 0) {
  console.log('\nWarnings:')
  for (const warning of warnings) console.log(`- ${warning}`)
}

if (failOnWarning && warnings.length > 0) {
  process.exit(1)
}
