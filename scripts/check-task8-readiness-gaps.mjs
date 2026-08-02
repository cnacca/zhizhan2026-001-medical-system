import fs from 'node:fs'

const acceptance = JSON.parse(fs.readFileSync('acceptance.json', 'utf8'))
const gaps = acceptance.task8_readiness_gaps

if (!Array.isArray(gaps) || gaps.length < 6) {
  console.error('acceptance.json task8_readiness_gaps must contain the key Task 8 readiness gaps')
  process.exit(1)
}

const requiredFields = [
  'id',
  'status',
  'source',
  'current_evidence',
  'remaining_reason',
  'minimum_closure_loop',
  'verification',
]
const allowedStatuses = new Set(['PARTIAL', 'NOT_READY', 'BLOCKED'])

for (const gap of gaps) {
  for (const field of requiredFields) {
    if (typeof gap[field] !== 'string' || gap[field].trim() === '') {
      console.error(`gap ${gap.id ?? '<missing-id>'} missing required field: ${field}`)
      process.exit(1)
    }
  }
  if (!allowedStatuses.has(gap.status)) {
    console.error(`gap ${gap.id} has unsupported status: ${gap.status}`)
    process.exit(1)
  }
}

const requiredIds = [
  'auth-datascope-prod',
  'frontend-business-pages',
  'websocket-notification-prod',
  'file-upload-prod',
  'ai-production-governance',
  'deployment-infrastructure',
  'operations-manuals',
  'customer-pm-confirmations',
]

for (const id of requiredIds) {
  if (!gaps.some((gap) => gap.id === id)) {
    console.error(`missing required Task 8 readiness gap: ${id}`)
    process.exit(1)
  }
}

console.log('task 8 readiness gaps:')
for (const gap of gaps) {
  console.log(`- ${gap.id} [${gap.status}]: ${gap.minimum_closure_loop}`)
}
