#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ACTION="${1:-}"
TARGET="${2:-all}"

LOCAL_FRONTEND_URL="http://localhost:5173"
LOCAL_FRONTEND_HEALTH_URL="http://localhost:5173/api/bootstrap/health"
LOCAL_BACKEND_URL="http://localhost:8080/api/bootstrap/health"
DEMO_FRONTEND_URL="http://127.0.0.1:15173"
DEMO_FRONTEND_HEALTH_URL="http://127.0.0.1:15173/api/bootstrap/health"
DEMO_BACKEND_URL="http://127.0.0.1:18080/api/bootstrap/health"

fail() {
  printf '错误：%s\n' "$1" >&2
  exit 1
}

validate_target() {
  case "$TARGET" in
    local|demo|all) ;;
    *) fail "环境必须是 local、demo 或 all，当前为：$TARGET" ;;
  esac
}

http_ready() {
  curl --fail --silent --show-error --connect-timeout 2 --max-time 5 "$1" >/dev/null 2>&1
}

listening_pids() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN -t 2>/dev/null | tr '\n' ' ' | sed 's/[[:space:]]*$//' || true
}

screen_session_exists() {
  local sessions
  sessions="$(screen -ls 2>/dev/null || true)"
  grep -E "[[:space:]][0-9]+\\.$1[[:space:]]" <<<"$sessions" >/dev/null
}

stop_screen_session() {
  local session="$1"
  if screen_session_exists "$session"; then
    screen -S "$session" -X quit >/dev/null 2>&1 || true
  fi
}

ensure_host_tools() {
  command -v screen >/dev/null 2>&1 || fail '未找到 screen，无法持久托管本地服务。'
  command -v lsof >/dev/null 2>&1 || fail '未找到 lsof，无法检查端口状态。'
  command -v curl >/dev/null 2>&1 || fail '未找到 curl，无法检查服务状态。'
}

ensure_docker() {
  if ! docker info >/dev/null 2>&1; then
    if command -v colima >/dev/null 2>&1; then
      printf 'Docker 未运行，正在启动 Colima…\n'
      colima start
    else
      fail 'Docker 未运行，且未找到 Colima。请先启动 Docker Desktop。'
    fi
  fi

  (cd "$ROOT_DIR" && npm run compose:up)
}

start_screen_service() {
  local label="$1"
  local session="$2"
  local port="$3"
  local health_url="$4"
  local npm_command="$5"
  local log_path="$6"
  local port_pids
  local root_quoted
  local log_quoted

  if http_ready "$health_url"; then
    printf '%s：已运行（%s）\n' "$label" "$health_url"
    return
  fi

  port_pids="$(listening_pids "$port")"
  if [[ -n "$port_pids" ]]; then
    fail "$label 的端口 $port 已被 PID $port_pids 占用，但健康检查失败；不会接管该进程。"
  fi

  if screen_session_exists "$session"; then
    printf '%s：发现无可用端口服务的旧托管会话，正在清理。\n' "$label"
    stop_screen_session "$session"
  fi

  mkdir -p "$(dirname "$log_path")"
  printf -v root_quoted '%q' "$ROOT_DIR"
  printf -v log_quoted '%q' "$log_path"
  printf '%s：正在持久启动…\n' "$label"
  screen -dmS "$session" bash -lc "cd $root_quoted && exec $npm_command >> $log_quoted 2>&1"
}

wait_ready() {
  local label="$1"
  local url="$2"
  local log_path="$3"
  local attempts="${4:-180}"
  local attempt

  for ((attempt = 1; attempt <= attempts; attempt += 1)); do
    if http_ready "$url"; then
      printf '%s：已就绪（%s）\n' "$label" "$url"
      return
    fi
    sleep 1
  done

  fail "$label 未在预期时间内就绪，请查看日志：$log_path"
}

start_local() {
  ensure_docker
  start_screen_service \
    '标准本地后端' 'aiorder-local-backend' '8080' "$LOCAL_BACKEND_URL" \
    'npm run dev:backend' "$ROOT_DIR/.local-runtime/backend.log"
  wait_ready '标准本地后端' "$LOCAL_BACKEND_URL" "$ROOT_DIR/.local-runtime/backend.log"

  start_screen_service \
    '标准本地前端' 'aiorder-local-frontend' '5173' "$LOCAL_FRONTEND_HEALTH_URL" \
    'npm run dev:frontend' "$ROOT_DIR/.local-runtime/frontend.log"
  wait_ready '标准本地前端' "$LOCAL_FRONTEND_HEALTH_URL" "$ROOT_DIR/.local-runtime/frontend.log" 60
}

start_demo() {
  ensure_docker
  (cd "$ROOT_DIR" && bash scripts/ensure-demo-environment.sh)

  start_screen_service \
    '演示后端' 'aiorder-demo-backend' '18080' "$DEMO_BACKEND_URL" \
    'npm run demo:backend' "$ROOT_DIR/.demo-runtime/backend.log"
  wait_ready '演示后端' "$DEMO_BACKEND_URL" "$ROOT_DIR/.demo-runtime/backend.log"

  start_screen_service \
    '演示前端' 'aiorder-demo-frontend' '15173' "$DEMO_FRONTEND_HEALTH_URL" \
    'npm run demo:frontend' "$ROOT_DIR/.demo-runtime/frontend.log"
  wait_ready '演示前端' "$DEMO_FRONTEND_HEALTH_URL" "$ROOT_DIR/.demo-runtime/frontend.log" 60
}

status_service() {
  local label="$1"
  local session="$2"
  local port="$3"
  local url="$4"
  local display_url="${5:-$4}"
  local port_pids
  local owner='外部进程'

  screen_session_exists "$session" && owner="持久托管会话 $session"

  if http_ready "$url"; then
    port_pids="$(listening_pids "$port")"
    printf '%s：运行中，已就绪（%s；PID %s；%s）\n' "$label" "$display_url" "${port_pids:-未知}" "$owner"
    return
  fi

  port_pids="$(listening_pids "$port")"
  if [[ -n "$port_pids" ]]; then
    printf '%s：端口已占用但服务未就绪（端口 %s；PID %s）\n' "$label" "$port" "$port_pids"
  else
    printf '%s：未运行\n' "$label"
  fi
}

show_status() {
  if [[ "$TARGET" == local || "$TARGET" == all ]]; then
    printf '\n[标准本地环境]\n'
    status_service '前端' 'aiorder-local-frontend' '5173' "$LOCAL_FRONTEND_HEALTH_URL" "$LOCAL_FRONTEND_URL"
    status_service '后端' 'aiorder-local-backend' '8080' "$LOCAL_BACKEND_URL"
  fi

  if [[ "$TARGET" == demo || "$TARGET" == all ]]; then
    printf '\n[演示环境]\n'
    status_service '前端' 'aiorder-demo-frontend' '15173' "$DEMO_FRONTEND_HEALTH_URL" "$DEMO_FRONTEND_URL"
    status_service '后端' 'aiorder-demo-backend' '18080' "$DEMO_BACKEND_URL"
  fi
}

stop_target() {
  local label="$1"
  local session="$2"
  local port="$3"
  local url="$4"

  if screen_session_exists "$session"; then
    stop_screen_session "$session"
    printf '%s：已停止持久托管会话。\n' "$label"
  elif http_ready "$url" || [[ -n "$(listening_pids "$port")" ]]; then
    printf '%s：由其他方式运行，本工具不会停止。\n' "$label"
  else
    printf '%s：未运行。\n' "$label"
  fi
}

stop_selected() {
  if [[ "$TARGET" == local || "$TARGET" == all ]]; then
    stop_target '标准本地前端' 'aiorder-local-frontend' '5173' "$LOCAL_FRONTEND_HEALTH_URL"
    stop_target '标准本地后端' 'aiorder-local-backend' '8080' "$LOCAL_BACKEND_URL"
  fi

  if [[ "$TARGET" == demo || "$TARGET" == all ]]; then
    stop_target '演示前端' 'aiorder-demo-frontend' '15173' "$DEMO_FRONTEND_HEALTH_URL"
    stop_target '演示后端' 'aiorder-demo-backend' '18080' "$DEMO_BACKEND_URL"
  fi
}

start_selected() {
  [[ "$TARGET" == local || "$TARGET" == all ]] && start_local
  [[ "$TARGET" == demo || "$TARGET" == all ]] && start_demo
  return 0
}

open_url() {
  local url="$1"
  if command -v open >/dev/null 2>&1; then
    open "$url"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url"
  else
    fail "无法自动打开浏览器，请手动访问：$url"
  fi
}

open_selected() {
  start_selected
  [[ "$TARGET" == local || "$TARGET" == all ]] && open_url "$LOCAL_FRONTEND_URL"
  [[ "$TARGET" == demo || "$TARGET" == all ]] && open_url "$DEMO_FRONTEND_URL"
  printf '\n页面已打开：\n'
  [[ "$TARGET" == local || "$TARGET" == all ]] && printf '  标准本地：%s\n' "$LOCAL_FRONTEND_URL"
  [[ "$TARGET" == demo || "$TARGET" == all ]] && printf '  演示环境：%s\n' "$DEMO_FRONTEND_URL"
  return 0
}

ensure_host_tools
validate_target

case "$ACTION" in
  start)
    start_selected
    show_status
    ;;
  status)
    show_status
    ;;
  stop)
    stop_selected
    ;;
  open)
    open_selected
    ;;
  *)
    printf '用法：%s {start|status|stop|open} [local|demo|all]\n' "$0" >&2
    exit 64
    ;;
esac
