#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$ROOT_DIR/.demo-runtime"
command="${1:-}"

BACKEND_PORT="${DEMO_BACKEND_PORT:-18080}"
FRONTEND_PORT="${DEMO_FRONTEND_PORT:-15173}"
BACKEND_COMMAND="npm run demo:backend"
FRONTEND_COMMAND="npm run demo:frontend"

mkdir -p "$RUNTIME_DIR"

fail() {
  printf '错误：%s\n' "$1" >&2
  exit 1
}

record_path() {
  printf '%s/%s.pid\n' "$RUNTIME_DIR" "$1"
}

log_path() {
  printf '%s/%s.log\n' "$RUNTIME_DIR" "$1"
}

process_start_token() {
  ps -p "$1" -o lstart= 2>/dev/null | awk '{$1=$1; print}'
}

managed_pid() {
  local name="$1"
  local marker="$2"
  local path
  local pid
  local recorded_start
  local runtime_id
  local current_start
  local process

  path="$(record_path "$name")"
  [[ -f "$path" ]] || return 1
  IFS=$'\t' read -r pid recorded_start runtime_id <"$path" || return 1
  [[ "$pid" =~ ^[0-9]+$ ]] || return 1
  kill -0 "$pid" 2>/dev/null || return 1
  current_start="$(process_start_token "$pid")"
  [[ -n "$current_start" && "$current_start" == "$recorded_start" ]] || return 1
  process="$(ps -p "$pid" -o command= 2>/dev/null || true)"
  [[ "$process" == *"local-runtime-runner.sh --runtime-id $runtime_id"* ]] || return 1
  [[ "$process" == *"$marker"* ]] || return 1
  printf '%s\n' "$pid"
}

listening_pids() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN -t 2>/dev/null || true
}

ensure_docker() {
  docker info >/dev/null 2>&1 || fail 'Docker 未运行，请先启动 Docker Desktop 或 Colima。'
  (cd "$ROOT_DIR" && npm run compose:up)
  (cd "$ROOT_DIR" && bash scripts/ensure-demo-environment.sh)
}

start_service() {
  local name="$1"
  local port="$2"
  local npm_command="$3"
  local pid
  local listeners
  local runtime_id
  local start_token

  pid="$(managed_pid "$name" "$npm_command" || true)"
  if [[ -n "$pid" ]]; then
    printf '%s 已在运行（PID %s）。\n' "$name" "$pid"
    return
  fi

  listeners="$(listening_pids "$port")"
  [[ -z "$listeners" ]] || fail "端口 $port 已被 PID $listeners 占用；演示环境不会接管该进程。"

  runtime_id="$(uuidgen | tr '[:upper:]' '[:lower:]')"
  nohup bash "$ROOT_DIR/scripts/local-runtime-runner.sh" \
    --runtime-id "$runtime_id" "$npm_command" \
    >"$(log_path "$name")" 2>&1 </dev/null &
  pid=$!
  sleep 1
  start_token="$(process_start_token "$pid")"
  [[ -n "$start_token" ]] || fail "$name 启动失败，请查看 $(log_path "$name")"
  printf '%s\t%s\t%s\n' "$pid" "$start_token" "$runtime_id" >"$(record_path "$name")"
  printf '%s 已启动（PID %s，日志：%s）。\n' "$name" "$pid" "$(log_path "$name")"
}

wait_ready() {
  local label="$1"
  local url="$2"
  local attempts="${3:-120}"
  local index
  for ((index = 1; index <= attempts; index += 1)); do
    if curl --fail --silent --show-error --connect-timeout 2 --max-time 5 "$url" >/dev/null 2>&1; then
      printf '%s 已就绪：%s\n' "$label" "$url"
      return 0
    fi
    sleep 1
  done
  fail "$label 未在预期时间内就绪，请查看 .demo-runtime 日志。"
}

collect_tree() {
  local pid="$1"
  local child
  while IFS= read -r child; do
    [[ -n "$child" ]] && collect_tree "$child"
  done < <(pgrep -P "$pid" 2>/dev/null || true)
  printf '%s\n' "$pid"
}

stop_service() {
  local name="$1"
  local npm_command="$2"
  local pid
  local tree
  local child

  pid="$(managed_pid "$name" "$npm_command" || true)"
  if [[ -z "$pid" ]]; then
    rm -f "$(record_path "$name")"
    printf '%s 未由演示环境工具运行。\n' "$name"
    return
  fi

  tree="$(collect_tree "$pid")"
  while IFS= read -r child; do
    [[ -n "$child" ]] && kill -TERM "$child" 2>/dev/null || true
  done <<<"$tree"
  for _ in {1..20}; do
    kill -0 "$pid" 2>/dev/null || break
    sleep 0.25
  done
  if kill -0 "$pid" 2>/dev/null; then
    while IFS= read -r child; do
      [[ -n "$child" ]] && kill -KILL "$child" 2>/dev/null || true
    done <<<"$tree"
  fi
  rm -f "$(record_path "$name")"
  printf '%s 已停止。\n' "$name"
}

status_service() {
  local name="$1"
  local npm_command="$2"
  local url="$3"
  local pid
  pid="$(managed_pid "$name" "$npm_command" || true)"
  if [[ -z "$pid" ]]; then
    printf '%s：未运行\n' "$name"
  elif curl --fail --silent --connect-timeout 2 --max-time 5 "$url" >/dev/null 2>&1; then
    printf '%s：运行中（PID %s，已就绪）\n' "$name" "$pid"
  else
    printf '%s：运行中（PID %s，暂未就绪；日志：%s）\n' "$name" "$pid" "$(log_path "$name")"
  fi
}

start() {
  ensure_docker
  start_service backend "$BACKEND_PORT" "$BACKEND_COMMAND"
  wait_ready backend "http://127.0.0.1:${BACKEND_PORT}/api/bootstrap/health" 180
  start_service frontend "$FRONTEND_PORT" "$FRONTEND_COMMAND"
  wait_ready frontend "http://127.0.0.1:${FRONTEND_PORT}" 60
  printf '演示环境地址：http://127.0.0.1:%s\n' "$FRONTEND_PORT"
}

serve() {
  local backend_pid
  local frontend_pid
  start
  backend_pid="$(managed_pid backend "$BACKEND_COMMAND")"
  frontend_pid="$(managed_pid frontend "$FRONTEND_COMMAND")"
  trap 'stop_service frontend "$FRONTEND_COMMAND"; stop_service backend "$BACKEND_COMMAND"' TERM INT HUP EXIT
  printf '演示环境以前台守护模式运行；按 Ctrl+C 停止。\n'
  wait "$backend_pid" "$frontend_pid"
}

case "$command" in
  start)
    start
    ;;
  serve)
    serve
    ;;
  status)
    status_service backend "$BACKEND_COMMAND" "http://127.0.0.1:${BACKEND_PORT}/api/bootstrap/health"
    status_service frontend "$FRONTEND_COMMAND" "http://127.0.0.1:${FRONTEND_PORT}"
    ;;
  stop)
    stop_service frontend "$FRONTEND_COMMAND"
    stop_service backend "$BACKEND_COMMAND"
    ;;
  *)
    printf '用法：%s {start|serve|status|stop}\n' "$0" >&2
    exit 64
    ;;
esac
