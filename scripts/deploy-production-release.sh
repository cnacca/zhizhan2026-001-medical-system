#!/usr/bin/env bash
set -Eeuo pipefail

umask 077

fail() {
  printf 'production deploy failed: %s\n' "$1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "required command missing: $1"
}

require_absolute_path() {
  local name="$1"
  local value="$2"
  [[ "$value" == /* ]] || fail "$name must be an absolute path"
  [[ "$value" != "/" ]] || fail "$name must not be /"
  [[ "$value" != "$HOME" ]] || fail "$name must not be the deploy user's home directory"
}

revision="${1:-}"
source_archive="${2:-}"
image_archive="${3:-}"
checksum_file="${4:-}"

[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || fail 'revision must be a full 40-character lowercase Git SHA'
[[ -f "$source_archive" && ! -L "$source_archive" ]] || fail 'source archive is missing or is a symbolic link'
[[ -f "$image_archive" && ! -L "$image_archive" ]] || fail 'image archive is missing or is a symbolic link'
[[ -f "$checksum_file" && ! -L "$checksum_file" ]] || fail 'checksum file is missing or is a symbolic link'

for command_name in bash curl docker flock git gzip sha256sum tar; do
  require_command "$command_name"
done

config_file="${AI_ORDER_DEPLOY_CONFIG:-$HOME/.config/ai-order-platform/deploy.conf}"
[[ -f "$config_file" && ! -L "$config_file" ]] || fail "deploy config missing or is a symbolic link: $config_file"

# shellcheck disable=SC1090
source "$config_file"

: "${RELEASE_ROOT:?RELEASE_ROOT missing from deploy config}"
: "${PRODUCTION_ENV_FILE:?PRODUCTION_ENV_FILE missing from deploy config}"
: "${COMPOSE_OVERRIDE_FILE:?COMPOSE_OVERRIDE_FILE missing from deploy config}"
: "${COMPOSE_PROJECT_NAME:?COMPOSE_PROJECT_NAME missing from deploy config}"
: "${BACKUP_ROOT:?BACKUP_ROOT missing from deploy config}"
: "${HEALTHCHECK_URL:?HEALTHCHECK_URL missing from deploy config}"
: "${HOMEPAGE_URL:?HOMEPAGE_URL missing from deploy config}"

require_absolute_path RELEASE_ROOT "$RELEASE_ROOT"
require_absolute_path PRODUCTION_ENV_FILE "$PRODUCTION_ENV_FILE"
require_absolute_path COMPOSE_OVERRIDE_FILE "$COMPOSE_OVERRIDE_FILE"
require_absolute_path BACKUP_ROOT "$BACKUP_ROOT"

[[ "$COMPOSE_PROJECT_NAME" =~ ^[a-zA-Z0-9][a-zA-Z0-9_-]*$ ]] || fail 'COMPOSE_PROJECT_NAME contains unsupported characters'
[[ "$HEALTHCHECK_URL" == http://127.0.0.1:* || "$HEALTHCHECK_URL" == http://localhost:* ]] || fail 'HEALTHCHECK_URL must use a loopback HTTP address'
[[ "$HOMEPAGE_URL" == http://127.0.0.1:* || "$HOMEPAGE_URL" == http://localhost:* ]] || fail 'HOMEPAGE_URL must use a loopback HTTP address'

[[ -f "$PRODUCTION_ENV_FILE" && ! -L "$PRODUCTION_ENV_FILE" ]] || fail 'production env file is missing or is a symbolic link'
[[ -f "$COMPOSE_OVERRIDE_FILE" && ! -L "$COMPOSE_OVERRIDE_FILE" ]] || fail 'compose override file is missing or is a symbolic link'
if grep -Eq '=(replace-with|change-me|example-only)' "$PRODUCTION_ENV_FILE"; then
  fail 'production env file still contains a placeholder value'
fi

install -d -m 700 "$RELEASE_ROOT" "$BACKUP_ROOT"
[[ ! -L "$RELEASE_ROOT" && ! -L "$BACKUP_ROOT" ]] || fail 'release or backup root must not be a symbolic link'

exec 9>"$RELEASE_ROOT/.production-deploy.lock"
flock -n 9 || fail 'another production deployment is already running'

short_revision="${revision:0:12}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
release_dir="$RELEASE_ROOT/ai-order-$short_revision"
backup_dir="$BACKUP_ROOT/$timestamp-auto-deploy-$short_revision"
source_checksum="$(sha256sum "$source_archive" | awk '{print $1}')"

checksum_dir="$(cd "$(dirname "$checksum_file")" && pwd -P)"
source_name="$(basename "$source_archive")"
image_name="$(basename "$image_archive")"
checksum_name="$(basename "$checksum_file")"

expected_source_name="source-${revision}.tar.gz"
expected_image_name="images-${revision}.tar.gz"
expected_checksum_name="checksums-${revision}.sha256"
[[ "$source_name" == "$expected_source_name" ]] || fail 'source archive name does not match revision'
[[ "$image_name" == "$expected_image_name" ]] || fail 'image archive name does not match revision'
[[ "$checksum_name" == "$expected_checksum_name" ]] || fail 'checksum file name does not match revision'

(
  cd "$checksum_dir"
  sha256sum --check "$checksum_name"
) || fail 'release bundle checksum verification failed'

if tar -tzf "$source_archive" | awk '
  /^\// { bad = 1 }
  /(^|\/)\.\.($|\/)/ { bad = 1 }
  END { exit bad ? 0 : 1 }
'; then
  fail 'source archive contains an unsafe path'
fi

if [[ -e "$release_dir" ]]; then
  [[ -d "$release_dir" && ! -L "$release_dir" ]] || fail 'existing release path is not a regular directory'
  [[ -f "$release_dir/.release-source.sha256" ]] || fail 'existing release directory has no checksum marker'
  [[ "$(<"$release_dir/.release-source.sha256")" == "$source_checksum" ]] || fail 'existing release directory checksum does not match this bundle'
else
  install -d -m 700 "$release_dir"
  tar -xzf "$source_archive" -C "$release_dir"
  printf '%s\n' "$source_checksum" >"$release_dir/.release-source.sha256"
  printf '%s\n' "$revision" >"$release_dir/REVISION"
fi

compose_file="$release_dir/deploy/docker-compose.phase-one.yml"
[[ -f "$compose_file" && ! -L "$compose_file" ]] || fail 'release compose file is missing or is a symbolic link'

compose=(
  docker compose
  --project-name "$COMPOSE_PROJECT_NAME"
  --file "$compose_file"
  --file "$COMPOSE_OVERRIDE_FILE"
  --env-file "$PRODUCTION_ENV_FILE"
)

"${compose[@]}" config >/dev/null || fail 'production compose configuration is invalid'

mysql_container="ai-order-phase-one-mysql"
[[ "$(docker inspect -f '{{.State.Running}}' "$mysql_container" 2>/dev/null || true)" == "true" ]] || fail 'production MySQL container is not running'

install -d -m 700 "$backup_dir"
docker inspect \
  ai-order-platform-backend:phase-one \
  ai-order-platform-frontend:phase-one \
  >"$backup_dir/previous-images.json" 2>/dev/null || true

docker exec "$mysql_container" sh -ceu '
  MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysqldump \
    --user=root \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    "$MYSQL_DATABASE"
' | gzip -1 >"$backup_dir/mysql.sql.gz"

gzip -t "$backup_dir/mysql.sql.gz" || fail 'pre-deploy MySQL backup is not a valid gzip stream'
[[ "$(wc -c <"$backup_dir/mysql.sql.gz")" -gt 1024 ]] || fail 'pre-deploy MySQL backup is unexpectedly small'
printf '%s\n' "$revision" >"$backup_dir/target-revision"

old_backend_id="$(docker image inspect ai-order-platform-backend:phase-one --format '{{.Id}}' 2>/dev/null || true)"
old_frontend_id="$(docker image inspect ai-order-platform-frontend:phase-one --format '{{.Id}}' 2>/dev/null || true)"

rollback_backend_tag="ai-order-platform-backend:rollback-before-${short_revision}-${timestamp}"
rollback_frontend_tag="ai-order-platform-frontend:rollback-before-${short_revision}-${timestamp}"

deploy_started=false
deploy_completed=false
on_exit() {
  local exit_code=$?
  if [[ "$deploy_started" == "true" && "$deploy_completed" != "true" ]]; then
    printf '\nDeployment did not complete. No database/schema rollback was attempted.\n' >&2
    printf 'Pre-deploy backup: %s\n' "$backup_dir/mysql.sql.gz" >&2
    printf 'Previous backend image: %s\n' "$rollback_backend_tag" >&2
    printf 'Previous frontend image: %s\n' "$rollback_frontend_tag" >&2
  fi
  return "$exit_code"
}
trap on_exit EXIT

if [[ -n "$old_backend_id" ]]; then
  docker image tag "$old_backend_id" "$rollback_backend_tag"
fi
if [[ -n "$old_frontend_id" ]]; then
  docker image tag "$old_frontend_id" "$rollback_frontend_tag"
fi

deploy_started=true
gzip -dc "$image_archive" | docker load
docker image inspect "ai-order-platform-backend:${revision}" >/dev/null
docker image inspect "ai-order-platform-frontend:${revision}" >/dev/null
docker image tag "ai-order-platform-backend:${revision}" ai-order-platform-backend:phase-one
docker image tag "ai-order-platform-frontend:${revision}" ai-order-platform-frontend:phase-one

"${compose[@]}" up -d --no-build --no-deps --force-recreate --wait backend frontend

healthy=false
for _attempt in $(seq 1 36); do
  if curl --fail --silent --show-error --max-time 5 "$HEALTHCHECK_URL" >/dev/null \
    && curl --fail --silent --show-error --max-time 5 "$HOMEPAGE_URL" >/dev/null; then
    healthy=true
    break
  fi
  sleep 5
done
[[ "$healthy" == "true" ]] || fail 'production health checks did not pass within 180 seconds'

"${compose[@]}" ps

deployed_revision_file="$RELEASE_ROOT/current-production-revision"
deployed_revision_tmp="$RELEASE_ROOT/.current-production-revision.$short_revision.tmp"
printf '%s\n' "$revision" >"$deployed_revision_tmp"
mv "$deployed_revision_tmp" "$deployed_revision_file"

deploy_completed=true
trap - EXIT
printf 'production deploy succeeded: %s\n' "$revision"
printf 'pre-deploy backup: %s\n' "$backup_dir/mysql.sql.gz"
printf 'rollback backend image: %s\n' "$rollback_backend_tag"
printf 'rollback frontend image: %s\n' "$rollback_frontend_tag"
