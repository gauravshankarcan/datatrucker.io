#!/usr/bin/env bash
# IoT Telemetry Alerts — integration and load test runner
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
USECASE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${HOST:-http://localhost:8080}"
KEYCLOAK_HOST="${KEYCLOAK_HOST:-http://localhost:8081}"
COLLECTION="${USECASE_ROOT}/tests/postman_collection.json"
K6_SCRIPT="${USECASE_ROOT}/tests/load_test.k6.js"
RESULTS_DIR="${ROOT}/test-results/iot-telemetry-alerts"

mkdir -p "${RESULTS_DIR}"

echo "=== IoT Telemetry Alerts Tests ==="
echo "Target: ${HOST}"

# Pre-flight health check
if ! curl -sf "${HOST}/api/v1/statuschecks/healthcheck" >/dev/null 2>&1; then
  echo "WARN: API not reachable at ${HOST}; tests may fail"
fi

TEST_FAILED=0

# Newman API tests
if command -v newman &>/dev/null; then
  echo "--- Running Postman collection ---"
  newman run "${COLLECTION}" \
    --env-var "HOST=${HOST}" \
    --env-var "KEYCLOAK_HOST=${KEYCLOAK_HOST}" \
    --reporters cli,json \
    --reporter-json-export "${RESULTS_DIR}/newman-report.json" \
    --timeout-request 30000 \
    --bail || TEST_FAILED=1
else
  echo "WARN: newman not installed; attempting npm global install..."
  if npm install -g newman 2>/dev/null; then
    newman run "${COLLECTION}" \
      --env-var "HOST=${HOST}" \
      --env-var "KEYCLOAK_HOST=${KEYCLOAK_HOST}" \
      --reporters cli \
      --timeout-request 30000 \
      --bail || TEST_FAILED=1
  else
    echo "SKIP: Postman tests (newman unavailable)"
  fi
fi

# Obtain token for k6 if Keycloak is reachable
ACCESS_TOKEN=""
if curl -sf "${KEYCLOAK_HOST}/realms/IoT-Telemetry" >/dev/null 2>&1; then
  ACCESS_TOKEN=$(curl -s -X POST "${KEYCLOAK_HOST}/realms/IoT-Telemetry/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=password" \
    -d "client_id=iot-telemetry-api" \
    -d "client_secret=iot-telemetry-secret-change-me" \
    -d "username=iot-operator" \
    -d "password=iot-operator-pass" 2>/dev/null | jq -r '.access_token // empty' || true)
fi

# k6 load tests
if command -v k6 &>/dev/null; then
  echo "--- Running k6 load test ---"
  K6_ARGS=(run "${K6_SCRIPT}" --env "HOST=${HOST}")
  [[ -n "${ACCESS_TOKEN}" ]] && K6_ARGS+=(--env "ACCESS_TOKEN=${ACCESS_TOKEN}")
  k6 "${K6_ARGS[@]}" \
    --out "json=${RESULTS_DIR}/k6-results.json" || TEST_FAILED=1
else
  echo "SKIP: k6 load test (k6 not installed)"
fi

if [[ "${TEST_FAILED}" -eq 1 ]]; then
  echo "IoT Telemetry Alerts: TESTS FAILED"
  exit 1
fi

echo "IoT Telemetry Alerts: ALL TESTS PASSED"
