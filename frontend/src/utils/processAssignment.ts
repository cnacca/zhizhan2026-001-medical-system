type AssignmentNode = { assigned_user_id: number | null; node_status: string }

export function assignmentAvailability(node: AssignmentNode | null, target: string, busy = false) {
  const editable = Boolean(node && ['PENDING', 'READY', 'IN_PROGRESS'].includes(node.node_status))
  const assigned = node?.assigned_user_id != null
  const sameWorker = assigned && String(node?.assigned_user_id) === target
  const ready = editable && /^[1-9]\d*$/.test(target) && !busy
  return {
    canAssign: ready && !assigned,
    canReassign: ready && assigned && !sameWorker,
    hint: !node ? '请先选择工序' : !editable ? '该工序已结束，不能再派工'
      : sameWorker ? '目标员工与当前执行人相同，请选择其他员工'
      : assigned ? '已有执行人，请使用“调整员工”；系统保留转派记录' : '尚未安排执行人，请选择员工后安排'
  }
}

export function assignmentErrorMessage(error: unknown) {
  const status = (error as { status?: number } | null)?.status
  if (status === 409) return '工序状态或执行人已变化，已重新读取；请核对后选择“安排员工”或“调整员工”。'
  if (status === 403) return '当前账号没有该工序的派工权限，或所选人员不在允许范围内。'
  if (status === 404) return '该工序已不可用，请刷新订单后重试。'
  return '派工未成功，请检查网络并刷新工序后重试。'
}
