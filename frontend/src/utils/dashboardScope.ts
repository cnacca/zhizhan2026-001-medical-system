export type DashboardScope = { label: string; month?: string; clinicId?: number; throughDay?: number; statuses?: string[] }

export function matchesDashboardScope(order: { created_at?: string; clinic_id?: number; internal_status?: string; external_status?: string }, scope?: DashboardScope | null) {
  if (!scope) return true
  if (scope.clinicId !== undefined && order.clinic_id !== scope.clinicId) return false
  if (scope.month) {
    const date = String(order.created_at ?? '').slice(0, 10)
    if (!date.startsWith(scope.month)) return false
    if (scope.throughDay && Number(date.slice(8, 10)) > scope.throughDay) return false
  }
  return !scope.statuses || scope.statuses.includes(order.internal_status ?? '') || scope.statuses.includes(order.external_status ?? '')
}
