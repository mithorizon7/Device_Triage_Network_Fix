#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
mode="${1:-}"
case "$mode" in
  prepare|build|dev|start) ;;
  *) echo "Usage: bash scripts/replit-runtime.sh {prepare|build|dev|start}" >&2; exit 1 ;;
esac

version="24.22.1"
runtime="$PWD/.runtime/node-$version"
prepare_runtime() {
  case "$(uname -s)-$(uname -m)" in
    Linux-x86_64)
      platform="linux-x64"
      expected="eb6728e77c576a35162c122c45ccadf224d89ff00abc8dae46cc2897c6002d7c" ;;
    Linux-aarch64|Linux-arm64)
      platform="linux-arm64"
      expected="33c37be234ba8bee041961047b19160f4d7d0f164e8e246f78bdd10feff148b3" ;;
    *) echo "Replit runtime bootstrap supports Linux x64 and arm64 only." >&2; exit 1 ;;
  esac
  mkdir -p .runtime
  staging="$(mktemp -d "$PWD/.runtime/download.XXXXXX")"
  trap 'rm -rf -- "$staging"' EXIT
  archive="$staging/node.tar.gz"
  # These digests come from the official v24.22.1 SHASUMS256.txt, not a moving URL.
  curl --fail --silent --show-error --location --proto '=https' --proto-redir '=https' \
    --tlsv1.2 --retry 3 --connect-timeout 15 --max-time 180 \
    "https://nodejs.org/dist/v$version/node-v$version-$platform.tar.gz" -o "$archive"
  if command -v sha256sum >/dev/null 2>&1; then
    actual="$(sha256sum "$archive" | cut -d ' ' -f 1)"
  else
    actual="$(shasum -a 256 "$archive" | cut -d ' ' -f 1)"
  fi
  if [[ "$actual" != "$expected" ]]; then
    echo "Node archive checksum mismatch; refusing to install or execute it." >&2
    exit 1
  fi
  echo "[runtime-bootstrap] verified official node=$version platform=$platform archive-sha256=$actual"
  mkdir "$staging/node"
  tar -xzf "$archive" --strip-components=1 -C "$staging/node"
  [[ "$("$staging/node/bin/node" -p 'process.versions.node')" == "$version" ]]
  rm -rf -- "$runtime"
  mv "$staging/node" "$runtime"
  rm -rf -- "$staging"
  trap - EXIT
}

# Production startup never downloads executable code or falls back to the module's old Node.
if [[ "$mode" == build || "$mode" == prepare || ( "$mode" == dev && ! -x "$runtime/bin/node" ) ]]; then
  prepare_runtime
fi
if [[ ! -x "$runtime/bin/node" ]]; then
  echo "Verified runtime is missing; run the deployment build first." >&2
  exit 1
fi
export PATH="$runtime/bin:$PATH"
echo "[runtime-bootstrap] mode=$mode prepared-runtime=true startup-download=false"
node scripts/check-runtime.cjs
[[ "$(node -p 'process.versions.node')" == "$version" ]]
node -p 'JSON.stringify({node:process.versions.node,openssl:process.versions.openssl})'
case "$mode" in
  build) echo "[runtime-bootstrap] install=npm-ci lifecycle-scripts=false"; npm ci --ignore-scripts; npm run build ;;
  dev) exec npm run dev ;;
  start) exec npm start ;;
  prepare) ;;
esac
