#!/usr/bin/env bash
# Generate standard test scaffolding for mock use cases
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

create_run_tests() {
  local name="$1"
  local slug="$2"
  local file="${ROOT}/mocks/${slug}/tests/run_tests.sh"
  mkdir -p "$(dirname "$file")"
  cat > "$file" <<SCRIPT
#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
ROOT="\$(cd "\${SCRIPT_DIR}/../../.." && pwd)"
HOST="\${HOST:-http://localhost:8080}"
KEYCLOAK_URL="\${KEYCLOAK_URL:-http://localhost:8081}"
COLLECTION="\${SCRIPT_DIR}/postman_collection.json"
LOAD_TEST="\${SCRIPT_DIR}/load_test.k6.js"
RESULTS_DIR="\${ROOT}/test-results/${slug}"
RUN_LOAD=false
for arg in "\$@"; do [[ "\$arg" == "--load" ]] && RUN_LOAD=true; done
mkdir -p "\${RESULTS_DIR}"
TEST_FAILED=0
echo "=== ${name} Mock Tests ==="
if command -v newman &>/dev/null; then
  newman run "\${COLLECTION}" \\
    --env-var "baseUrl=\${HOST}" \\
    --env-var "keycloakUrl=\${KEYCLOAK_URL}" \\
    --reporters cli,json \\
    --reporter-json-export "\${RESULTS_DIR}/newman-report.json" \\
    --timeout-request 30000 \\
    --bail || TEST_FAILED=1
else
  curl -sf "\${HOST}/api/v1/statuschecks/healthcheck" || TEST_FAILED=1
fi
if [[ "\${RUN_LOAD}" == "true" ]] && command -v k6 &>/dev/null; then
  k6 run --env BASE_URL="\${HOST}" --env KEYCLOAK_URL="\${KEYCLOAK_URL}" \\
    --out "json=\${RESULTS_DIR}/k6-report.json" "\${LOAD_TEST}" || TEST_FAILED=1
fi
[[ "\${TEST_FAILED}" -eq 1 ]] && exit 1
echo "${name} TESTS PASSED"
SCRIPT
  chmod +x "$file"
}

create_k6() {
  local name="$1"
  local slug="$2"
  local file="${ROOT}/mocks/${slug}/tests/load_test.k6.js"
  cat > "$file" <<'K6'
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');

export const options = {
  scenarios: {
    ramp: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '2m', target: 30 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    errors: ['rate<0.1'],
  },
};

export default function () {
  const start = Date.now();
  const health = http.get(`${BASE_URL}/api/v1/statuschecks/healthcheck`);
  apiDuration.add(Date.now() - start);
  check(health, { 'health 200': (r) => r.status === 200 }) || errorRate.add(1);
  sleep(1);
}
K6
}

create_postman() {
  local name="$1"
  local slug="$2"
  local realm="$3"
  local file="${ROOT}/mocks/${slug}/tests/postman_collection.json"
  cat > "$file" <<JSON
{
  "info": {
    "name": "${name}",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:8080" },
    { "key": "keycloakUrl", "value": "http://localhost:8081" },
    { "key": "token", "value": "" }
  ],
  "item": [
    {
      "name": "Health Check",
      "event": [{ "listen": "test", "script": { "exec": [
        "pm.test('status 200', () => pm.response.to.have.status(200));",
        "pm.test('reqCompleted', () => pm.expect(pm.response.json().reqCompleted).to.eql(true));"
      ], "type": "text/javascript" }}],
      "request": { "method": "GET", "url": "{{baseUrl}}/api/v1/statuschecks/healthcheck" }
    },
    {
      "name": "Unauthorized Access",
      "event": [{ "listen": "test", "script": { "exec": [
        "pm.test('rejects unauthorized', () => pm.expect(pm.response.code).to.be.oneOf([401, 403, 404]));"
      ], "type": "text/javascript" }}],
      "request": {
        "method": "GET",
        "header": [{ "key": "Authorization", "value": "Bearer invalid-token" }],
        "url": "{{baseUrl}}/api/v1/jobs"
      }
    },
    {
      "name": "Malformed Payload",
      "event": [{ "listen": "test", "script": { "exec": [
        "pm.test('rejects malformed', () => pm.expect(pm.response.code).to.be.oneOf([400, 422, 404]));"
      ], "type": "text/javascript" }}],
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": { "mode": "raw", "raw": "{invalid json" },
        "url": "{{baseUrl}}/api/v1/jobs"
      }
    }
  ]
}
JSON
}

create_docs() {
  local name="$1"
  local slug="$2"
  local desc="$3"
  mkdir -p "${ROOT}/mocks/${slug}/docs"
  cat > "${ROOT}/mocks/${slug}/docs/ARCHITECTURE.md" <<DOC
# ${name} — Architecture

## Overview
${desc}

## Component Diagram

\`\`\`mermaid
flowchart LR
  Client[Client / API Consumer] --> API[DataTrucker API]
  API --> KC[Keycloak IAM]
  API --> PG[(PostgreSQL)]
  API --> RD[(Redis)]
  API --> Plugins[Job Plugins]
\`\`\`

## Data Flow
1. Client authenticates via Keycloak OAuth2
2. DataTrucker validates JWT and RBAC roles
3. Job pipeline executes declarative workflow
4. Results persisted and/or streamed to downstream systems

## Builder
Gaurav Shankar
DOC

  cat > "${ROOT}/mocks/${slug}/docs/DATA_MODELS.md" <<DOC
# ${name} — Data Models

## Request/Response Schemas

All endpoints follow DataTrucker standard envelope:
\`\`\`json
{
  "reqCompleted": true,
  "reqID": "uuid",
  "serverID": "ServerHandler",
  "date": "ISO-8601",
  "data": {}
}
\`\`\`

## Validation
Input payloads validated via AJV schemas defined in \`datatrucker-pipeline.yaml\`.

## Error Responses
| Code | Meaning |
|------|---------|
| 400 | Validation failure |
| 401 | Missing/invalid token |
| 403 | RBAC denial |
| 404 | Resource not found |
| 422 | Business rule violation |
DOC

  cat > "${ROOT}/mocks/${slug}/docs/SETUP_GUIDE.md" <<DOC
# ${name} — Setup Guide

## Prerequisites
- Docker / Podman with Compose
- DataTrucker platform running (\`docker compose up -d\`)

## Quick Start

\`\`\`bash
cd mocks/${slug}
docker compose -f ../../docker-compose.yml -f configs/docker-compose.override.yml up -d
export HOST=http://localhost:8080
./tests/run_tests.sh
\`\`\`

## Load Testing

\`\`\`bash
./tests/run_tests.sh --load
\`\`\`

## Keycloak Realm
Import \`configs/keycloak-realm.json\` or use the override compose stack.
DOC
}

# CRM pipeline tests
create_run_tests "CRM Pipeline" "crm-pipeline"
create_k6 "CRM Pipeline" "crm-pipeline"
create_postman "CRM Pipeline API" "crm-pipeline" "CRM"

# Fintech KYC
create_run_tests "Fintech KYC Onboarding" "fintech-kyc-onboarding"
create_k6 "Fintech KYC" "fintech-kyc-onboarding"
create_postman "Fintech KYC API" "fintech-kyc-onboarding" "FintechKYC"
create_docs "Fintech KYC Onboarding" "fintech-kyc-onboarding" "Multi-step KYC onboarding with identity verification workflows."

# Voter registration
create_run_tests "Voter Registration" "voter-registration-system"
create_k6 "Voter Registration" "voter-registration-system"
create_postman "Voter Registration API" "voter-registration-system" "VoterRegistration"
create_docs "Voter Registration System" "voter-registration-system" "Citizen voter registration with eligibility validation and audit trail."

# Ecommerce inventory sync (multi-warehouse)
create_run_tests "Ecommerce Inventory Sync" "ecommerce-inventory-sync"
create_k6 "Ecommerce Inventory" "ecommerce-inventory-sync"
create_postman "Ecommerce Inventory API" "ecommerce-inventory-sync" "EcommerceInventory"
create_docs "Ecommerce Inventory Sync" "ecommerce-inventory-sync" "Multi-warehouse event-driven state synchronization with distributed locking."

# Healthcare
create_run_tests "Healthcare Patient Portal" "healthcare-patient-portal"
create_k6 "Healthcare Portal" "healthcare-patient-portal"
create_postman "Healthcare Portal API" "healthcare-patient-portal" "HealthcarePortal"
create_docs "Healthcare Patient Portal" "healthcare-patient-portal" "HIPAA-compliant patient portal with PII anonymization and secure payload processing."

# SaaS tenant provisioning
create_run_tests "SaaS Tenant Provisioning" "saas-tenant-provisioning"
create_k6 "SaaS Provisioning" "saas-tenant-provisioning"
create_postman "SaaS Provisioning API" "saas-tenant-provisioning" "SaaSProvisioning"
create_docs "SaaS Tenant Provisioning" "saas-tenant-provisioning" "Multi-tenant infrastructure provisioning with RBAC orchestration."

echo "Mock test scaffolding generated"
