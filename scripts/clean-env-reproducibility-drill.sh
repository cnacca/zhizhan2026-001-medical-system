#!/usr/bin/env bash
# 干净环境可复现性演练：把仓库克隆到一个全新目录，只按 README 的步骤执行，
# 记录每一步耗时与失败点，用于验证"新同事/客户服务器拿到代码能否直接跑通"。
#
# 本脚本刻意不做任何补救：不复制现有 .env、不复用现有构建产物、不手工建账号。
# 任何一步失败都应如实中止并留下日志，失败本身就是演练结论的一部分。
#
# 用法：
#   bash scripts/clean-env-reproducibility-drill.sh
# 环境变量：
#   DRILL_REF        要演练的 git ref，默认当前分支
#   DRILL_WORKDIR    演练目录，默认系统临时目录下的 ai-order-drill-<时间戳>
#   DRILL_KEEP       设为 1 时保留演练目录以便排查
#
# 前置：宿主已安装 git、node、pnpm、docker、brew（JDK/Maven 由演练自行安装校验）。
#
# 独占性：compose.yaml 使用固定容器名（ai-order-mysql / ai-order-redis / ai-order-minio），
# demo 与 local 运行时使用固定端口（5173/8080/15173/18080）。因此同一宿主上
# 同时只能存在一套运行环境，演练必须独占。脚本会先停掉源仓库正在运行的
# local / demo 运行时，再开始演练；演练结束后不会自动把它们拉起来。
#
# 缓存说明：pnpm store 与 ~/.m2 由宿主共享，因此本演练的"依赖安装"与"后端编译"
# 耗时明显短于真正的全新机器。演练验证的是仓库侧可复现性，不是宿主侧冷启动耗时。

set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REF="${DRILL_REF:-$(git -C "$ROOT_DIR" rev-parse --abbrev-ref HEAD)}"
WORKDIR="${DRILL_WORKDIR:-${TMPDIR:-/tmp}/ai-order-drill-$(date +%Y%m%d-%H%M%S)}"
LOG_DIR="$WORKDIR/_drill-logs"
RESULT="$WORKDIR/_drill-result.txt"

steps_total=0
steps_failed=0

record() {
  printf '%s\n' "$1" >> "$RESULT"
  printf '%s\n' "$1"
}

run_step() {
  local name="$1"; shift
  local log="$LOG_DIR/$(echo "$name" | tr ' /' '__').log"
  steps_total=$((steps_total + 1))
  local start end elapsed status
  start=$(date +%s)
  if "$@" > "$log" 2>&1; then
    status="PASS"
  else
    status="FAIL"
    steps_failed=$((steps_failed + 1))
  fi
  end=$(date +%s)
  elapsed=$((end - start))
  record "$(printf '| %-38s | %-4s | %5ss | %s |' "$name" "$status" "$elapsed" "$(basename "$log")")"
  [ "$status" = "PASS" ]
}

mkdir -p "$LOG_DIR"
: > "$RESULT"

# 独占前置：停掉源仓库正在运行的 local / demo 运行时并释放固定容器名。
# 不这样做的话，固定容器名与固定端口会让演练在 compose:up 与 demo:reset 处
# 必然失败——那是环境冲突，不是仓库缺陷，会污染演练结论。
echo "释放独占资源（停止源仓库的 local / demo 运行时与共享容器）…"
(cd "$ROOT_DIR" && npm run demo:stop) > "$LOG_DIR/_preflight_demo_stop.log" 2>&1 || true
(cd "$ROOT_DIR" && npm run local:stop) > "$LOG_DIR/_preflight_local_stop.log" 2>&1 || true
(cd "$ROOT_DIR" && docker compose down) > "$LOG_DIR/_preflight_compose_down.log" 2>&1 || true

record "干净环境可复现性演练"
record "ref: $REF"
record "宿主: $(uname -srm)"
record "演练目录: $WORKDIR"
record ""
record "| 步骤 | 结果 | 耗时 | 日志 |"
record "| --- | --- | ---: | --- |"

# 1. 克隆（模拟新同事只拿到 git 仓库）
run_step "git clone" git clone --quiet --branch "$REF" "$ROOT_DIR" "$WORKDIR/repo"
cd "$WORKDIR/repo" || exit 1

# 2. 工具链（README 首次准备步骤）
run_step "check:toolchain" npm run check:toolchain

# 3. 前端依赖
run_step "install:frontend" npm run install:frontend

# 4. 基础服务
run_step "compose:up" npm run compose:up

# 5. 后端编译（README 未单列，但 local:start 依赖它，单列以便定位耗时）
run_step "backend build" scripts/with-jdk21.sh mvn -f backend/pom.xml -pl platform-server -am -DskipTests -q install

# 6. 演示环境：从零造数并校验（本演练的核心断言）
run_step "demo:reset" env DEMO_RESET_CONFIRM=RESET_DEMO_DATA npm run demo:reset
run_step "demo:prepare" npm run demo:prepare
run_step "demo:seed 幂等复跑" npm run demo:seed
run_step "demo:check" npm run demo:check

# 7. 四端可达
run_step "四端入口可达" bash -c 'curl -sf http://127.0.0.1:15173/ >/dev/null && curl -sf http://127.0.0.1:18080/api/bootstrap/health >/dev/null'

npm run demo:stop > "$LOG_DIR/demo_stop.log" 2>&1
# 归还独占资源：演练自建的容器与卷不保留，避免占用固定容器名导致源仓库起不来。
docker compose down --volumes > "$LOG_DIR/_teardown_compose_down.log" 2>&1 || true

record ""
record "步骤 $steps_total 项，失败 $steps_failed 项。"
if [ "$steps_failed" -eq 0 ]; then
  record "结论：干净环境无手动补救即可跑通。"
else
  record "结论：干净环境仍需手动补救，失败步骤见上表对应日志。"
fi
record ""
record "本演练只覆盖本地宿主，不构成真实服务器部署验收；"
record "deployment-infrastructure 与 Task 8 状态不变。"

echo
echo "演练记录：$RESULT"
if [ "${DRILL_KEEP:-0}" != "1" ] && [ "$steps_failed" -eq 0 ]; then
  echo "（成功且未设 DRILL_KEEP=1，清理演练目录）"
  cp "$RESULT" "${TMPDIR:-/tmp}/ai-order-drill-last-result.txt"
  rm -rf "$WORKDIR"
  echo "记录已另存：${TMPDIR:-/tmp}/ai-order-drill-last-result.txt"
fi

exit "$steps_failed"
