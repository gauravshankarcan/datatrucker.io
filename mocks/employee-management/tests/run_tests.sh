#!/usr/bin/env bash
# Employee Management mock — CI test runner
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOCK_DIR="$(dirname "${SCRIPT_DIR}")"
ROOT="$(cd "${MOCK_DIR}/../.." && pwd)"

HOST="${HOST:-http://localhost:8080}"
KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8081}"
COLLECTION="${SCRIPT_DIR}/postman_collection.json"
LOAD_TEST="${SCRIPT_DIR}/load_test.k6.js"
RESULTS_DIR="${ROOT}/test-results/employee-management"

RUN_LOAD=false
for arg in "$@"; do
  case "${arg}" in
    --load) RUN_LOAD=true ;;
  esac
done

mkdir -p "${RESULTS_DIR}"
TEST_FAILED=0

echo "=== Employee Management Mock Tests ==="
echo "API:      ${HOST}"
echo "Keycloak: ${KEYCLOAK_URL}"

# Pre-flight health check
echo "--- Health check ---"
if ! curl -sf "${HOST}/api/v1/statuschecks/healthcheck" >/dev/null 2>&1; then
  echo "WARN: API not reachable at ${HOST}; tests may fail"
fi

# Newman integration tests
echo "--- Postman / Newman integration tests ---"
if ! command -v newman &>/dev/null; then
  echo "Installing newman..."
  npm install -g newman 2>/dev/null || true
fi

if command -v newman &>/dev/null; then
  newman run "${COLLECTION}" \
    --env-var "baseUrl=${HOST}" \
    --env-var "keycloakUrl=${KEYCLOAK_URL}" \
    --reporters cli,json \
    --reporter-json-export "${RESULTS_DIR}/newman-report.json" \
    --timeout-request 30000 \
    --bail || TEST_FAILED=1
else
  echo "WARN: newman unavailable; running curl fallback"
  curl -sf "${HOST}/api/v1/statuschecks/healthcheck" | head -c 200
  echo ""
fi

# k6 load tests (optional)
if [[ "${RUN_LOAD}" == "true" ]]; then
  echo "--- k6 load tests ---"
  if command -v k6 &>/dev/null; then
    k6 run \
      --env BASE_URL="${HOST}" \
      --env KEYCLOAK_URL="${KEYCLOAK_URL}" \
      --out "json=${RESULTS_DIR}/k6-report.json" \
      "${LOAD_TEST}" || TEST_FAILED=1
  else
    echo "WARN: k6 not installed; skipping load tests"
  fi
fi

if [[ "${TEST_FAILED}" -eq 1 ]]; then
  echo "EMPLOYEE MANAGEMENT TESTS FAILED"
  exit 1
fi

echo "EMPLOYEE MANAGEMENT TESTS PASSED"
