type OrderWithInternalStatus = {
  internal_status?: unknown
}

const statusesWithoutProcessInstance = new Set([
  'DRAFT',
  'PENDING_CS_REVIEW',
  'CS_REJECTED',
  'PENDING_PRODUCTION_REVIEW',
  'PRODUCTION_REJECTED'
])

export function orderMayHaveProcessInstance(order: OrderWithInternalStatus) {
  const status = typeof order.internal_status === 'string'
    ? order.internal_status.trim().toUpperCase()
    : ''
  return !status || !statusesWithoutProcessInstance.has(status)
}
