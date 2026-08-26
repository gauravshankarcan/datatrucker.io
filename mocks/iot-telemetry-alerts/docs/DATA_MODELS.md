# IoT Telemetry Alerts — Data Models

## Telemetry Event (Ingest Payload)

```json
{
  "deviceId": "sensor-warehouse-a-0042",
  "timestamp": "2026-08-25T18:00:00.000Z",
  "metrics": {
    "temperature_c": 23.4,
    "humidity_pct": 58.2,
    "vibration_hz": 12.1
  },
  "location": {
    "lat": 43.6532,
    "lon": -79.3832
  }
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `deviceId` | string | yes | 3–64 chars, alphanumeric + `_-` |
| `timestamp` | string (ISO-8601) | yes | UTC datetime |
| `metrics` | object | yes | Keys = metric name, values = number |
| `location` | object | no | `lat`/`lon` numbers |

## Redis Window Buffer

**Key pattern:** `iot:telemetry:{deviceId}:{metric}:{windowKey}`

**Value:** JSON array of `{ "ts": "<iso>", "value": <number> }`

| windowKey | TTL (seconds) | Purpose |
|-----------|---------------|---------|
| `1m` | 120 | Real-time spike detection |
| `5m` | 600 | Short-term baseline |
| `15m` | 1800 | Medium-term trend |
| `1h` | 7200 | Hourly aggregate seed |

## Anomaly Detection Request

```json
{
  "deviceId": "sensor-warehouse-a-0042",
  "metric": "temperature_c",
  "value": 89.7,
  "baseline": {
    "mean": 23.1,
    "stddev": 1.8
  },
  "thresholdSigma": 3
}
```

**Response (anomaly):**

```json
{
  "anomaly": true,
  "zScore": 37.0,
  "severity": "critical",
  "alertId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

## Alert Record (PostgreSQL)

**Table:** `iot_alerts`

| Column | Type | Description |
|--------|------|-------------|
| `alert_id` | UUID PK | Unique alert identifier |
| `device_id` | VARCHAR(64) | Source device |
| `metric` | VARCHAR(128) | Metric that triggered alert |
| `severity` | ENUM | `info`, `warning`, `critical` |
| `z_score` | DECIMAL(10,4) | Computed z-score at detection time |
| `observed_value` | DECIMAL(18,6) | Raw metric value |
| `baseline_mean` | DECIMAL(18,6) | Baseline mean at detection |
| `baseline_stddev` | DECIMAL(18,6) | Baseline stddev at detection |
| `status` | ENUM | `open`, `acknowledged`, `resolved` |
| `webhook_status` | VARCHAR(32) | `pending`, `delivered`, `failed` |
| `created_at` | TIMESTAMPTZ | Alert creation time |
| `resolved_at` | TIMESTAMPTZ | Nullable resolution timestamp |
| `metadata` | JSONB | Arbitrary context (location, runbook link) |

## Webhook Dispatch Payload

```json
{
  "alertId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "severity": "critical",
  "webhookUrl": "https://hooks.example.com/iot-alerts",
  "payload": {
    "deviceId": "sensor-warehouse-a-0042",
    "metric": "temperature_c",
    "value": 89.7,
    "zScore": 37.0,
    "message": "Temperature exceeded 3σ threshold"
  }
}
```

## Kafka Topics

| Topic | Key | Value Schema |
|-------|-----|--------------|
| `iot.telemetry.raw` | `deviceId` | Telemetry Event |
| `iot.alerts.dispatch` | `alertId` | Webhook Dispatch Payload |
| `iot.alerts.dlq` | `alertId` | Failed dispatch with error detail |

## Validation Error Response

```json
{
  "reqCompleted": false,
  "error": "Validation failed",
  "details": [
    { "path": "/deviceId", "message": "must match pattern ^[a-zA-Z0-9_-]{3,64}$" }
  ]
}
```
