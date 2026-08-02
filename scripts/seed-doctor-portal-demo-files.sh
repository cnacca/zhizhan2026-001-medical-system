#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
demo_bucket="${MINIO_DEMO_BUCKET:-ai-order-demo-private}"

if [[ "${DEMO_ISOLATED_ENV:-}" != "true" ]]; then
  echo "Refusing doctor portal demo file seed: DEMO_ISOLATED_ENV must be true" >&2
  exit 1
fi

if [[ ! "${demo_bucket}" =~ (^|[.-])demo([.-]|$) ]]; then
  echo "MINIO_DEMO_BUCKET must include a standalone demo segment" >&2
  exit 1
fi

scan_fixture="$ROOT_DIR/scripts/fixtures/doctor-demo-scan.stl"
shade_fixture="$ROOT_DIR/docs/quality/admin-personnel-reference/personnel-management-implementation-1280x720.jpg"
container_name="ai-order-minio"

docker cp "$scan_fixture" "$container_name:/tmp/doctor-demo-scan.stl"
docker cp "$shade_fixture" "$container_name:/tmp/doctor-demo-shade.jpg"

docker compose -f "$ROOT_DIR/compose.yaml" exec -T minio sh -c '
  set -eu
  mc alias set local http://127.0.0.1:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null
  mc mb --ignore-existing "local/'"$demo_bucket"'" >/dev/null
  for order_no in ORD20260718-1001 ORD20260718-1002 ORD20260717-1003 ORD20260712-1004 ORD20260710-1005 ORD20260708-1006 ORD20260702-1007; do
    mc cp /tmp/doctor-demo-scan.stl "local/'"$demo_bucket"'/doctor-demo/${order_no}/scan.stl" >/dev/null
    mc cp /tmp/doctor-demo-shade.jpg "local/'"$demo_bucket"'/doctor-demo/${order_no}/shade.jpg" >/dev/null
  done
  rm -f /tmp/doctor-demo-scan.stl /tmp/doctor-demo-shade.jpg
'

echo "Doctor portal demo files are ready in ${demo_bucket}."
