#!/usr/bin/env bash
set -euo pipefail

demo_database="${MYSQL_DEMO_DATABASE:-ai_order_platform_demo}"
demo_bucket="${MINIO_DEMO_BUCKET:-ai-order-demo-private}"
demo_backend_port="${DEMO_BACKEND_PORT:-18080}"

if [[ "${DEMO_RESET_CONFIRM:-}" != "RESET_DEMO_DATA" ]]; then
  echo "Refusing reset. Set DEMO_RESET_CONFIRM=RESET_DEMO_DATA explicitly." >&2
  exit 1
fi

if [[ ! "${demo_database}" =~ ^[A-Za-z0-9_]+_demo$ ]]; then
  echo "MYSQL_DEMO_DATABASE must end with _demo" >&2
  exit 1
fi

if [[ ! "${demo_bucket}" =~ (^|[.-])demo([.-]|$) ]]; then
  echo "MINIO_DEMO_BUCKET must include a standalone demo segment" >&2
  exit 1
fi

if lsof -nP -iTCP:"${demo_backend_port}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Demo backend is running. Run npm run demo:stop before reset." >&2
  exit 1
fi

docker compose exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot' <<SQL
DROP DATABASE IF EXISTS \`${demo_database}\`;
SQL

docker compose exec -T minio sh -c '
  mc alias set local http://127.0.0.1:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null
  mc rb --force "local/'"${demo_bucket}"'" >/dev/null 2>&1 || true
'

rm -rf .demo-runtime
bash scripts/ensure-demo-environment.sh
echo "Demo environment reset. Run npm run demo:prepare to migrate, seed, and verify it."
