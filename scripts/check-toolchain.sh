#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT_DIR/scripts/with-jdk21.sh" java -version
"$ROOT_DIR/scripts/with-jdk21.sh" mvn -version
node -v
npm -v
pnpm -v
docker context ls
