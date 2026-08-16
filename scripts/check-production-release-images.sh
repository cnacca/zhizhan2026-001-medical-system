#!/usr/bin/env bash
set -euo pipefail

frontend_image="${1:?frontend image tag is required}"
expected_demo_prefill="${2:-false}"
backend_image="${3:?backend image tag is required}"

if [[ "${expected_demo_prefill}" != "true" && "${expected_demo_prefill}" != "false" ]]; then
  echo "expected demo prefill flag must be true or false" >&2
  exit 1
fi

docker image inspect "${frontend_image}" >/dev/null
docker image inspect "${backend_image}" >/dev/null
docker run --rm --entrypoint sh "${frontend_image}" -ceu '
  test -s /usr/share/nginx/html/index.html
  test -d /usr/share/nginx/html/assets
  find /usr/share/nginx/html/assets -type f -print -quit | grep -q .
'

if docker run --rm --entrypoint sh "${frontend_image}" -ceu '
  for marker in ORD20260718-1001 doctorMock mockDoctorGateway; do
    if grep -R -F -q "${marker}" /usr/share/nginx/html; then
      exit 0
    fi
  done
  exit 1
'; then
  echo "final frontend image contains a doctor mock marker or fixture" >&2
  exit 1
fi

if [[ "${expected_demo_prefill}" == "true" ]]; then
  if ! docker run --rm --entrypoint sh "${frontend_image}" -ceu '
    for marker in change-me-doctor change-me-cs change-me-worker change-me-admin; do
      grep -R -F -q "${marker}" /usr/share/nginx/html || exit 1
    done
  '; then
    echo "final frontend image does not match the explicitly enabled temporary demo-prefill mode" >&2
    exit 1
  fi
else
  if docker run --rm --entrypoint sh "${frontend_image}" -ceu '
    for marker in change-me-doctor change-me-cs change-me-worker change-me-admin; do
      if grep -R -F -q "${marker}" /usr/share/nginx/html; then
        exit 0
      fi
    done
    exit 1
  '; then
    echo "final frontend image contains demo credential markers while temporary prefill is disabled" >&2
    exit 1
  fi
fi

command -v jar >/dev/null 2>&1 || {
  echo "jar command is required to inspect the final backend image" >&2
  exit 1
}

backend_inspection_dir="$(mktemp -d "${TMPDIR:-/tmp}/ai-order-backend-image.XXXXXX")"
backend_jar="${backend_inspection_dir}/app.jar"
backend_entries="${backend_inspection_dir}/jar-entries.txt"
backend_container=""
cleanup_backend_inspection() {
  if [[ -n "${backend_container:-}" ]]; then
    docker rm "${backend_container}" >/dev/null 2>&1 || true
  fi
  rm -f "${backend_jar:?}" "${backend_entries:?}"
  rmdir "${backend_inspection_dir:?}" 2>/dev/null || true
}
trap cleanup_backend_inspection EXIT

backend_container="$(docker create "${backend_image}")"
docker cp "${backend_container}:/app/app.jar" "${backend_jar}"
test -s "${backend_jar}"
jar tf "${backend_jar}" >"${backend_entries}"

migration_count=0
while IFS= read -r migration_path; do
  migration_count=$((migration_count + 1))
  migration_name="$(basename "${migration_path}")"
  if ! grep -F -x -q "BOOT-INF/classes/db/migration/${migration_name}" "${backend_entries}"; then
    echo "final backend image is missing Flyway migration: ${migration_name}" >&2
    exit 1
  fi
done < <(find backend/platform-server/src/main/resources/db/migration -type f -name '*.sql' -print | sort)

if [[ "${migration_count}" -eq 0 ]]; then
  echo "no source Flyway migrations were found for final image verification" >&2
  exit 1
fi

echo "production release image check ok"
