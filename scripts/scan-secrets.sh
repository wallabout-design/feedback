#!/usr/bin/env bash
# Scans the commits this branch adds to origin/main for secrets with gitleaks.
# False alarms go in .gitleaksignore, each with a comment.
set -euo pipefail

if [ -n "${SKIP_SCANS:-}" ]; then
  echo "SKIP_SCANS is set; the scan job runs this"
  exit 0
fi

if ! command -v gitleaks >/dev/null; then
  echo "gitleaks is not installed; install it with: brew install gitleaks" >&2
  exit 2
fi
if ! git rev-parse --verify --quiet origin/main >/dev/null; then
  echo "origin/main is missing; run: git fetch origin main (CI checks out with fetch-depth: 0)" >&2
  exit 2
fi

exec gitleaks git --log-opts="origin/main..HEAD" --redact --no-banner --verbose
