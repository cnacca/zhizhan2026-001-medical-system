#!/usr/bin/env bash
set -euo pipefail

demo_database="${MYSQL_DEMO_DATABASE:-ai_order_platform_demo}"
demo_user="${MYSQL_DEMO_USER:-ai_order_demo}"
demo_password="${MYSQL_DEMO_PASSWORD:-change-me-demo}"
demo_bucket="${MINIO_DEMO_BUCKET:-ai-order-demo-private}"

if [[ ! "${demo_database}" =~ ^[A-Za-z0-9_]+_demo$ ]]; then
  echo "MYSQL_DEMO_DATABASE must end with _demo" >&2
  exit 1
fi

if [[ ! "${demo_user}" =~ ^[A-Za-z0-9_]+$ ]]; then
  echo "MYSQL_DEMO_USER contains unsupported characters" >&2
  exit 1
fi

if [[ "${demo_password}" == *"'"* ]]; then
  echo "MYSQL_DEMO_PASSWORD must not contain a single quote" >&2
  exit 1
fi

if [[ ! "${demo_bucket}" =~ ^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$ ]]; then
  echo "MINIO_DEMO_BUCKET contains unsupported characters" >&2
  exit 1
fi

if [[ ! "${demo_bucket}" =~ (^|[.-])demo([.-]|$) ]]; then
  echo "MINIO_DEMO_BUCKET must include a standalone demo segment" >&2
  exit 1
fi

docker compose exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot' <<SQL
CREATE DATABASE IF NOT EXISTS \`${demo_database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${demo_user}'@'%' IDENTIFIED BY '${demo_password}';
ALTER USER '${demo_user}'@'%' IDENTIFIED BY '${demo_password}';
GRANT ALL PRIVILEGES ON \`${demo_database}\`.* TO '${demo_user}'@'%';
FLUSH PRIVILEGES;
SQL

docker compose exec -T minio sh -c '
  mc alias set local http://127.0.0.1:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null
  mc mb --ignore-existing "local/'"${demo_bucket}"'" >/dev/null
'

echo "Dedicated demo database and bucket are ready: ${demo_database}, ${demo_bucket}"
