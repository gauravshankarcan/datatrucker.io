#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
HOST="${HOST:-http://localhost:8080}"
KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8081}"
COLLECTION="${SCRIPT_DIR}/postman_collection.json"
LOAD_TEST="${SCRIPT_DIR}/load_test.k6.js"
RESULTS_DIR="${ROOT}/test-results/saas-tenant-provisioning"
RUN_LOAD=false
for arg in "$@"; do [[ "$arg" == "--load" ]] && RUN_LOAD=true; done
mkdir -p "${RESULTS_DIR}"
TEST_FAILED=0
echo "=== SaaS Tenant Provisioning Mock Tests ==="
if command -v newman &>/dev/null; then
  newman run "${COLLECTION}" \
    --env-var "baseUrl=${HOST}" \
    --env-var "keycloakUrl=${KEYCLOAK_URL}" \
    --reporters cli,json \
    --reporter-json-export "${RESULTS_DIR}/newman-report.json" \
    --timeout-request 30000 \
    --bail || TEST_FAILED=1
else
  curl -sf "${HOST}/api/v1/statuschecks/healthcheck" || TEST_FAILED=1
fi
if [[ "${RUN_LOAD}" == "true" ]] && command -v k6 &>/dev/null; then
  k6 run --env BASE_URL="${HOST}" --env KEYCLOAK_URL="${KEYCLOAK_URL}" \
    --out "json=${RESULTS_DIR}/k6-report.json" "${LOAD_TEST}" || TEST_FAILED=1
fi
[[ "${TEST_FAILED}" -eq 1 ]] && exit 1
echo "SaaS Tenant Provisioning TESTS PASSED"
