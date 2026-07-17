#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
demo_database="${MYSQL_DEMO_DATABASE:-ai_order_platform_demo}"

if [[ "${DEMO_ISOLATED_ENV:-}" != "true" ]]; then
  echo "Refusing admin portal demo seed: DEMO_ISOLATED_ENV must be true" >&2
  exit 1
fi

if [[ ! "${demo_database}" =~ ^[A-Za-z0-9_]+_demo$ ]]; then
  echo "MYSQL_DEMO_DATABASE must end with _demo" >&2
  exit 1
fi

docker compose -f "$ROOT_DIR/compose.yaml" exec -T mysql sh -c \
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot --database="'$demo_database'"' \
  < "$ROOT_DIR/scripts/seed-admin-portal-demo-data.sql"

echo "Admin portal acceptance data is ready in ${demo_database}."
