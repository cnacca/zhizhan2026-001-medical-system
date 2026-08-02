#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" != '--runtime-id' || -z "${2:-}" || -z "${3:-}" ]]; then
  printf '用法：%s --runtime-id <id> <npm-command>\n' "$0" >&2
  exit 64
fi

runtime_id="$2"
npm_command="$3"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
child_pid=''

forward_signal() {
  if [[ -n "$child_pid" ]] && kill -0 "$child_pid" 2>/dev/null; then
    kill -TERM "$child_pid" 2>/dev/null || true
    wait "$child_pid" 2>/dev/null || true
  fi
  exit 0
}

trap forward_signal TERM INT HUP

cd "$ROOT_DIR"
bash -lc "$npm_command" &
child_pid=$!
wait "$child_pid"
