export const goalNumber = (goalId) => {
  const match = /^GOAL-(\d+)$/.exec(goalId || '')
  return match ? Number(match[1]) : Number.NaN
}

export const requireCurrentPointerAtOrAfter = (acceptance, fs, failures, minimumGoalId) => {
  const activeGoalNumber = goalNumber(acceptance.active_goal)
  const minimumGoalNumber = goalNumber(minimumGoalId)
  if (!Number.isFinite(activeGoalNumber) || activeGoalNumber < minimumGoalNumber) {
    failures.push(`acceptance.json active_goal expected ${minimumGoalId} or later, got ${acceptance.active_goal}`)
  }
  if (!acceptance.active_goal_file || !fs.existsSync(acceptance.active_goal_file)) {
    failures.push(`acceptance.json active_goal_file does not exist: ${acceptance.active_goal_file}`)
  }
  if (!acceptance.active_task_file || !fs.existsSync(acceptance.active_task_file)) {
    failures.push(`acceptance.json active_task_file does not exist: ${acceptance.active_task_file}`)
  }
}
