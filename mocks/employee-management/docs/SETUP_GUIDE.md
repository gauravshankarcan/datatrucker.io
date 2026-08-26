# Employee Management — Local Setup Guide

> **New to DataTrucker?** Start with [STORY.md](../STORY.md)—a narrative walkthrough before this technical guide.


## Prerequisites

- Docker 24+ and Docker Compose v2
- Node.js 18+ (for Newman Postman runner)
- k6 (optional, for load tests)
- 4 GB RAM available for the full stack

## Quick Start

```bash
# From repository root
cd /home/gshankar/storage/datatrucker.io

# Start base stack with employee-management overrides
docker compose \
  -f docker-compose.yml \
  -f mocks/employee-management/configs/docker-compose.override.yml \
  up -d --build

# Wait for health check
curl -sf http://localhost:8080/api/v1/statuschecks/healthcheck | jq .
```

Expected health response:

```json
{ "status": "ok", "service": "datatrucker-api" }
```

## Obtain Access Tokens

```bash
# HR Admin token (full access)
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8081/realms/EmployeeManagement/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=employee-api" \
  -d "client_secret=employee-api-secret-change-in-prod" \
  -d "grant_type=password" \
  -d "username=hr.admin" \
  -d "password=HrAdmin123!" | jq -r .access_token)

# Viewer token (read-only)
VIEWER_TOKEN=$(curl -s -X POST http://localhost:8081/realms/EmployeeManagement/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=employee-api" \
  -d "client_secret=employee-api-secret-change-in-prod" \
  -d "grant_type=password" \
  -d "username=hr.viewer" \
  -d "password=HrViewer123!" | jq -r .access_token)
```

## Sample API Calls

```bash
# List departments
curl -s http://localhost:8080/api/v1/departments \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | jq .

# Create employee
curl -s -X POST http://localhost:8080/api/v1/employees \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alice",
    "last_name": "Johnson",
    "email": "alice.johnson@acmecorp.example",
    "department_id": "550e8400-e29b-41d4-a716-446655440001",
    "hire_date": "2025-01-15",
    "job_title": "Product Manager"
  }' | jq .

# Assign department
curl -s -X POST http://localhost:8080/api/v1/employees/{employee_id}/department \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "department_id": "550e8400-e29b-41d4-a716-446655440002",
    "reason": "Promotion to Product team"
  }' | jq .
```

## Run Tests

```bash
# Integration tests (Postman via Newman)
bash mocks/employee-management/tests/run_tests.sh

# Load test (requires k6)
K6_VUS=20 K6_DURATION=2m bash mocks/employee-management/tests/run_tests.sh --load
```

## Service Endpoints

| Service | URL | Credentials |
|---------|-----|-------------|
| DataTrucker API | http://localhost:8080 | JWT from Keycloak |
| Keycloak Admin | http://localhost:8081 | admin / admin |
| DataTrucker UI | http://localhost:9080 | — |
| MailHog (email) | http://localhost:8025 | — |
| SFTP Mock | sftp://localhost:2222 | compliance / Compliance123! |

## Troubleshooting

### API returns 401 Unauthorized

Verify the token realm is `EmployeeManagement` and the client secret matches `docker-compose.override.yml`.

### Department assignment returns 423 Locked

Another assignment is in progress for the same employee. Wait 30 seconds (Redis lock TTL) and retry.

### Database connection errors

Ensure PostgreSQL initialized with `hr_employees` database:

```bash
docker compose logs postgres | grep "database system is ready"
```

### Reset environment

```bash
docker compose -f docker-compose.yml \
  -f mocks/employee-management/configs/docker-compose.override.yml \
  down -v
```

## Pipeline Deployment (Kubernetes)

```bash
kubectl apply -f mocks/employee-management/configs/datatrucker-pipeline.yaml
```

Or import JobDefinitions through the DataTrucker Operator CRD (`DatatruckerFlow`).
