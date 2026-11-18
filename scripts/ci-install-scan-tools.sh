#!/usr/bin/env bash
# Installs the scan tools in CI from their GitHub releases at an exact version,
# and refuses to run one whose SHA-256 differs from the one pinned here.
# Usage: ci-install-scan-tools.sh gitleaks|osv-scanner ...
# To upgrade: change the version, download the release's checksum file, copy the
# linux amd64 line's hash here.
set -euo pipefail

GITLEAKS_VERSION=8.30.1
GITLEAKS_SHA256=551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb
OSV_VERSION=2.7.1
OSV_SHA256=fb7dab19a8bd9bbe5c3189f09d4b7ee1820c9553a23bac202648a56efd2f6ee8

dir="${RUNNER_TEMP:-/tmp}/scan-tools"
mkdir -p "$dir"

for tool in "$@"; do
  case "$tool" in
    gitleaks)
      url="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"
      curl -fsSL --retry 3 -o "$dir/gitleaks.tar.gz" "$url"
      echo "${GITLEAKS_SHA256}  $dir/gitleaks.tar.gz" | sha256sum --check --strict
      tar -xzf "$dir/gitleaks.tar.gz" -C "$dir" gitleaks
      ;;
    osv-scanner)
      url="https://github.com/google/osv-scanner/releases/download/v${OSV_VERSION}/osv-scanner_linux_amd64"
      curl -fsSL --retry 3 -o "$dir/osv-scanner" "$url"
      echo "${OSV_SHA256}  $dir/osv-scanner" | sha256sum --check --strict
      chmod +x "$dir/osv-scanner"
      ;;
    *)
      echo "unknown tool: $tool" >&2
      exit 2
      ;;
  esac
done

if [ -n "${GITHUB_PATH:-}" ]; then echo "$dir" >> "$GITHUB_PATH"; fi
