# IoT Telemetry Alerts — Setup Guide

> **New to DataTrucker?** Start with [STORY.md](../STORY.md)—a narrative walkthrough before this technical guide.


## Prerequisites

- Docker 24+ and Docker Compose v2
- Node.js 18+ (for Newman/k6 test runners)
- 8 GB RAM minimum (Kafka + Redis + API stack)
- Ports available: 8080, 8081, 5432, 6379, 9092, 1080

## Quick Start

```bash
# From repository root
cd /home/gshankar/storage/datatrucker.io

# Start base stack with IoT overrides
docker compose \
  -f docker-compose.yml \
  -f mocks/iot-telemetry-alerts/configs/docker-compose.override.yml \
  up -d

# Wait for API health
until curl -sf http://localhost:8080/api/v1/statuschecks/healthcheck; do
  echo "Waiting for API..."
  sleep 5
done

# Run use-case tests
bash mocks/iot-telemetry-alerts/tests/run_tests.sh
```

## Import Pipeline

1. Open DataTrucker UI at `http://localhost:9080`
2. Navigate to **Flows** → **Import**
3. Upload `mocks/iot-telemetry-alerts/configs/datatrucker-pipeline.yaml`
4. Assign credentials:
   - **IOT-Kafka-Producer**: broker `kafka:29092`, topic `iot.telemetry.raw`
   - **IOT-Redis**: host `redis`, port `6379`, prefix `iot:telemetry:`
   - **DB**: PostgreSQL connection from base `docker-compose.yml`
   - **IOT-Proxy**: outbound proxy allowlist for webhook targets

## Keycloak Configuration

The realm export at `configs/keycloak-realm.json` is auto-imported when using the override compose file.

| User | Password | Role |
|------|----------|------|
| `iot-admin` | `iot-admin-pass` | `iot-admin` |
| `iot-operator` | `iot-operator-pass` | `iot-operator` |
| `iot-viewer` | `iot-viewer-pass` | `iot-viewer` |

Obtain a token for API calls:

```bash
TOKEN=$(curl -s -X POST "http://localhost:8081/realms/IoT-Telemetry/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=iot-telemetry-api" \
  -d "client_secret=iot-telemetry-secret-change-me" \
  -d "username=iot-operator" \
  -d "password=iot-operator-pass" | jq -r .access_token)
```

## Manual Smoke Test

```bash
# Ingest telemetry
curl -X POST "http://localhost:8080/api/v1/jobs/telemetry-ingest" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "sensor-warehouse-a-0042",
    "timestamp": "2026-08-25T18:00:00.000Z",
    "metrics": { "temperature_c": 89.7, "humidity_pct": 58.2 }
  }'

# Trigger anomaly detection
curl -X POST "http://localhost:8080/api/v1/jobs/anomaly-detect" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "sensor-warehouse-a-0042",
    "metric": "temperature_c",
    "value": 89.7,
    "baseline": { "mean": 23.1, "stddev": 1.8 },
    "thresholdSigma": 3
  }'
```

## Webhook Mock Server

The override stack includes MockServer on port `1080`. Configure alert-dispatch webhooks to `http://webhook-mock:1080/alert` for local verification.

## Troubleshooting

| Symptom | Resolution |
|---------|------------|
| Kafka connection refused | Ensure `iot-kafka` container is healthy: `docker logs iot-kafka` |
| 401 on job endpoints | Refresh Keycloak token; verify realm import |
| Redis key not found | Confirm `telemetry-buffer` job ran before `anomaly-detect` |
| Webhook 502 | Check MockServer logs: `docker logs iot-webhook-mock` |

## Teardown

```bash
docker compose \
  -f docker-compose.yml \
  -f mocks/iot-telemetry-alerts/configs/docker-compose.override.yml \
  down -v
```
