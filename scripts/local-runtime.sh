#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$ROOT_DIR/.local-runtime"
command="${1:-}"

mkdir -p "$RUNTIME_DIR"

fail() {
  printf '错误：%s\n' "$1" >&2
  exit 1
}

pid_path() {
  printf '%s/%s.pid\n' "$RUNTIME_DIR" "$1"
}

log_path() {
  printf '%s/%s.log\n' "$RUNTIME_DIR" "$1"
}

read_process_record() {
  local path
  local pid
  local start_token
  local runtime_id
  path="$(pid_path "$1")"

  [[ -f "$path" ]] || return 1

  IFS=$'\t' read -r pid start_token runtime_id <"$path" || return 1
  [[ "$pid" =~ ^[0-9]+$ ]] || return 1
  [[ -n "$start_token" && -n "$runtime_id" ]] || return 1
  printf '%s\t%s\t%s\n' "$pid" "$start_token" "$runtime_id"
}

is_running() {
  kill -0 "$1" 2>/dev/null
}

process_start_token() {
  local token
  token="$(ps -p "$1" -o lstart= 2>/dev/null | awk '{$1=$1; print}')"
  [[ -n "$token" ]] || return 1
  printf '%s\n' "$token"
}

process_matches() {
  local pid="$1"
  local runtime_id="$2"
  local npm_command="$3"
  local process
  process="$(ps -p "$pid" -o command= 2>/dev/null || true)"
  [[ "$process" == *"local-runtime-runner.sh --runtime-id $runtime_id"* ]] && [[ "$process" == *"$npm_command"* ]]
}

managed_pid() {
  local name="$1"
  local npm_command="$2"
  local path
  local record
  local pid
  local recorded_start_token
  local runtime_id
  local current_start_token
  path="$(pid_path "$name")"
  record="$(read_process_record "$name" || true)"
  IFS=$'\t' read -r pid recorded_start_token runtime_id <<<"$record"
  current_start_token="$(process_start_token "$pid" 2>/dev/null || true)"

  if [[ -n "$pid" ]] && is_running "$pid" && [[ "$current_start_token" == "$recorded_start_token" ]] && process_matches "$pid" "$runtime_id" "$npm_command"; then
    printf '%s\n' "$pid"
    return 0
  fi

  rm -f "$path"
  return 1
}

listening_pids() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN -t 2>/dev/null || true
}

assert_startable() {
  local name="$1"
  local port="$2"
  local marker="$3"
  local pid
  local listeners

  pid="$(managed_pid "$name" "$marker" || true)"
  [[ -n "$pid" ]] && return 0

  listeners="$(listening_pids "$port")"
  [[ -z "$listeners" ]] || fail "端口 $port 已被 PID $listeners 占用；为避免误停其他程序，本工具不会接管它。"
}

ensure_docker() {
  if docker info >/dev/null 2>&1; then
    return
  fi

  if command -v colima >/dev/null 2>&1; then
    printf 'Docker 未运行，正在启动 Colima…\n'
    colima start
  else
    fail 'Docker 未运行，且未找到 colima。请先启动 Docker Desktop 或执行 colima start。'
  fi

  docker info >/dev/null 2>&1 || fail 'Docker 启动后仍不可用。请检查 Docker 或 Colima 状态。'
}

start_service() {
  local name="$1"
  local port="$2"
  local npm_command="$3"
  local pid
  local path
  local log
  local runtime_id
  local start_token

  pid="$(managed_pid "$name" "$npm_command" || true)"
  if [[ -n "$pid" ]]; then
    printf '%s 已在运行（PID %s）。\n' "$name" "$pid"
    return
  fi

  assert_startable "$name" "$port" "$npm_command"
  path="$(pid_path "$name")"
  log="$(log_path "$name")"
  runtime_id="$(uuidgen | tr '[:upper:]' '[:lower:]')"

  printf '正在启动 %s…\n' "$name"
  nohup bash "$ROOT_DIR/scripts/local-runtime-runner.sh" --runtime-id "$runtime_id" "$npm_command" >"$log" 2>&1 </dev/null &
  pid=$!

  sleep 1
  start_token="$(process_start_token "$pid" || true)"
  if ! is_running "$pid" || [[ -z "$start_token" ]] || ! process_matches "$pid" "$runtime_id" "$npm_command"; then
    rm -f "$path"
    fail "$name 启动后立即退出。请查看日志：$log"
  fi

  printf '%s\t%s\t%s\n' "$pid" "$start_token" "$runtime_id" >"$path"

  printf '%s 已在后台启动（PID %s，日志：%s）。\n' "$name" "$pid" "$log"
}

MANAGED_TREE_PIDS=()
MANAGED_TREE_START_TOKENS=()

collect_process_tree() {
  local pid="$1"
  local start_token
  local child

  start_token="$(process_start_token "$pid" || true)"
  [[ -n "$start_token" ]] || return

  while IFS= read -r child; do
    [[ -n "$child" ]] && collect_process_tree "$child"
  done < <(pgrep -P "$pid" 2>/dev/null || true)

  MANAGED_TREE_PIDS+=("$pid")
  MANAGED_TREE_START_TOKENS+=("$start_token")
}

snapshot_process_is_running() {
  local index="$1"
  local pid="${MANAGED_TREE_PIDS[$index]}"
  local expected_start_token="${MANAGED_TREE_START_TOKENS[$index]}"
  local current_start_token

  current_start_token="$(process_start_token "$pid" || true)"
  [[ -n "$current_start_token" && "$current_start_token" == "$expected_start_token" ]]
}

signal_managed_tree() {
  local signal="$1"
  local index
  local pid

  for ((index = 0; index < ${#MANAGED_TREE_PIDS[@]}; index += 1)); do
    if snapshot_process_is_running "$index"; then
      pid="${MANAGED_TREE_PIDS[$index]}"
      kill "-$signal" "$pid" 2>/dev/null || true
    fi
  done
}

managed_tree_exited() {
  local index

  for ((index = 0; index < ${#MANAGED_TREE_PIDS[@]}; index += 1)); do
    if snapshot_process_is_running "$index"; then
      return 1
    fi
  done

  return 0
}

wait_for_managed_tree_exit() {
  local attempt

  for attempt in {1..10}; do
    managed_tree_exited && return 0
    sleep 0.5
  done

  managed_tree_exited
}

stop_service() {
  local name="$1"
  local npm_command="$2"
  local path
  local pid

  path="$(pid_path "$name")"
  pid="$(managed_pid "$name" "$npm_command" || true)"
  if [[ -z "$pid" ]]; then
    printf '%s 未由本工具运行。\n' "$name"
    return
  fi

  printf '正在停止 %s（PID %s）…\n' "$name" "$pid"
  MANAGED_TREE_PIDS=()
  MANAGED_TREE_START_TOKENS=()
  collect_process_tree "$pid"
  signal_managed_tree TERM

  if ! wait_for_managed_tree_exit; then
    printf '%s 未在 5 秒内正常退出，正在终止剩余受管进程…\n' "$name"
    signal_managed_tree KILL
    if ! wait_for_managed_tree_exit; then
      printf '%s 的部分受管进程仍未退出；保留 PID 记录以便排查，日志：%s\n' "$name" "$(log_path "$name")" >&2
      return 1
    fi
  fi

  rm -f "$path"
  printf '%s 已停止。\n' "$name"
}

stop() {
  local failed=0

  stop_service 'frontend' 'npm run dev:frontend' || failed=1
  stop_service 'backend' 'npm run dev:backend' || failed=1
  return "$failed"
}

report_service() {
  local name="$1"
  local npm_command="$2"
  local health_url="$3"
  local pid

  pid="$(managed_pid "$name" "$npm_command" || true)"
  if [[ -z "$pid" ]]; then
    printf '%s：未由本工具运行\n' "$name"
    return
  fi

  if curl --fail --silent --show-error --connect-timeout 2 --max-time 5 "$health_url" >/dev/null 2>&1; then
    printf '%s：运行中（PID %s，已就绪）\n' "$name" "$pid"
  else
    printf '%s：运行中（PID %s，正在启动或暂不可访问；日志：%s）\n' "$name" "$pid" "$(log_path "$name")"
  fi
}

show_status() {
  local services

  if docker info >/dev/null 2>&1; then
    services="$(
      (cd "$ROOT_DIR" && docker compose ps --status running --services 2>/dev/null || true) | tr '\n' ' '
    )"
    if [[ -n "$services" ]]; then
      printf '基础服务：运行中（%s）\n' "$services"
    else
      printf '基础服务：未发现运行中的 Compose 服务\n'
    fi
  else
    printf '基础服务：Docker 未运行\n'
  fi

  report_service 'backend' 'npm run dev:backend' 'http://localhost:8080/api/bootstrap/health'
  report_service 'frontend' 'npm run dev:frontend' 'http://localhost:5173'
}

start() {
  ensure_docker
  assert_startable 'backend' '8080' 'npm run dev:backend'
  assert_startable 'frontend' '5173' 'npm run dev:frontend'

  (
    cd "$ROOT_DIR"
    npm run compose:up
  )

  start_service 'backend' '8080' 'npm run dev:backend'
  start_service 'frontend' '5173' 'npm run dev:frontend'

  printf '本地开发环境已进入后台启动流程：\n'
  printf '  前端：http://localhost:5173\n'
  printf '  后端健康检查：http://localhost:8080/api/bootstrap/health\n'
  printf '  查看状态：npm run local:status\n'
}

case "$command" in
  start)
    start
    ;;
  status)
    show_status
    ;;
  stop)
    stop
    ;;
  *)
    printf '用法：%s {start|status|stop}\n' "$0" >&2
    exit 64
    ;;
esac
