# CRM Pipeline — Local Setup Guide

> **New to DataTrucker?** Start with [STORY.md](../STORY.md)—a narrative walkthrough before this technical guide.


## Prerequisites

- Docker 24+ with Compose v2
- Node.js 18+ (Newman)
- k6 (optional)
- ~6 GB RAM (Kafka + Zookeeper add overhead)

## Quick Start

```bash
cd /home/gshankar/storage/datatrucker.io

docker compose \
  -f docker-compose.yml \
  -f mocks/crm-pipeline/configs/docker-compose.override.yml \
  up -d --build

# Verify all services
docker compose ps
curl -sf http://localhost:8080/api/v1/statuschecks/healthcheck | jq .
```

## Obtain Token

```bash
TOKEN=$(curl -s -X POST http://localhost:8081/realms/CRMPipeline/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=crm-api" \
  -d "client_secret=crm-api-secret-change-in-prod" \
  -d "grant_type=password" \
  -d "username=sales.admin" \
  -d "password=SalesAdmin123!" | jq -r .access_token)
```

## Sample Workflow

```bash
# 1. Register webhook receiver
curl -s -X POST http://localhost:8080/api/v1/crm/webhooks \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://webhook-receiver:8080/webhook",
    "events": ["stage_changed", "lead_qualified"],
    "secret": "whsec_test_secret_key_32chars"
  }' | jq .

# 2. Ingest a high-value lead
LEAD=$(curl -s -X POST http://localhost:8080/api/v1/crm/leads \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "GlobalTech Corp",
    "contact_name": "Maria Garcia",
    "email": "maria@globaltech.example",
    "source": "referral",
    "metadata": { "company_size": 1200, "budget_confirmed": true, "industry": "finance" }
  }')
echo "${LEAD}" | jq .
LEAD_ID=$(echo "${LEAD}" | jq -r .id)

# 3. View pipeline summary
curl -s http://localhost:8080/api/v1/crm/pipeline \
  -H "Authorization: Bearer ${TOKEN}" | jq .

# 4. Advance to proposal
curl -s -X POST "http://localhost:8080/api/v1/crm/leads/${LEAD_ID}/stage" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"stage": "proposal", "reason": "SOW sent"}' | jq .

# 5. Check webhook receiver
curl -s http://localhost:8099/ | jq .
```

## Kafka Topics

List topics after ingest:

```bash
docker exec crm-kafka kafka-topics --bootstrap-server localhost:9092 --list
```

Expected topics: `crm.leads.created`, `crm.leads.qualified`, `crm.pipeline.stage_changed`

## Run Tests

```bash
bash mocks/crm-pipeline/tests/run_tests.sh
bash mocks/crm-pipeline/tests/run_tests.sh --load
```

## Service Endpoints

| Service | URL |
|---------|-----|
| DataTrucker API | http://localhost:8080 |
| Keycloak | http://localhost:8081 |
| Kafka | localhost:9092 |
| Webhook Echo | http://localhost:8099 |

## Troubleshooting

**Kafka not healthy:** Wait 60s after `docker compose up`; Zookeeper must start first.

**Webhooks not received:** Confirm webhook URL is reachable from the API container network (`webhook-receiver:8080`, not `localhost:8099` from inside Docker).

**Stage transition rejected:** Check lead score meets minimum for target stage (≥ 40 for `proposal`).

## Teardown

```bash
docker compose -f docker-compose.yml \
  -f mocks/crm-pipeline/configs/docker-compose.override.yml \
  down -v
```
