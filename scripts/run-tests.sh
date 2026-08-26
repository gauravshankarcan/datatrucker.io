#!/usr/bin/env bash
# Platform sanity test runner: Postman (Newman) + optional k6
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${HOST:-http://localhost:8080}"
COLLECTION="${ROOT}/ci/postman/DataTrucker IO.postman_collection.json"
ENV_FILE="${ROOT}/ci/postman/Local Environment.postman_environment.json"

echo "=== DataTrucker Platform Sanity Tests ==="
echo "Target: ${HOST}"

if ! command -v newman &>/dev/null; then
  echo "Installing newman..."
  npm install -g newman newman-reporter-htmlextra 2>/dev/null || true
fi

if command -v newman &>/dev/null; then
  newman run "${COLLECTION}" \
    --environment "${ENV_FILE}" \
    --env-var "HOST=${HOST}" \
    --reporters cli,json \
    --reporter-json-export "${ROOT}/test-results/newman-report.json" \
    --timeout-request 30000 \
    --bail || TEST_FAILED=1
else
  echo "WARN: newman not available, running curl health check only"
  curl -sf "${HOST}/api/v1/statuschecks/healthcheck" | head -c 500
  echo ""
fi

# Run mock use case tests if present
for mock_test in "${ROOT}"/mocks/*/tests/run_tests.sh; do
  if [[ -f "${mock_test}" ]]; then
    echo "--- Running $(dirname "${mock_test}") ---"
    bash "${mock_test}" || TEST_FAILED=1
  fi
done

if [[ "${TEST_FAILED:-0}" -eq 1 ]]; then
  echo "TESTS FAILED"
  exit 1
fi

echo "ALL TESTS PASSED"
