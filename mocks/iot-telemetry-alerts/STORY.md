# Story: Machines That Talk Before People Notice

## Meet Aisha

Aisha monitors a fleet of industrial sensors—temperature, vibration, pressure. Downtime costs thousands per hour. She needs **telemetry ingestion** and **threshold alerts** without standing up a bespoke streaming platform for every factory line.

DataTrucker accepts device payloads on HTTP jobs, evaluates rules (in script or plugin jobs), and can fan out to Redis, Kafka, or email hooks depending on plugin configuration. On OpenShift, her team ships a `DatatruckerMock` CR per site; the operator runs the API at the edge namespace.

## What DataTrucker does here

- Devices POST readings to tenant-scoped jobs.
- Alert jobs compare readings to thresholds and return or forward alerts.
- Health jobs prove the pipeline is alive for factory IT’s Nagios.

Think “serverless handlers,” but the handlers are **declared in CRs** and versioned in Git.

## The plot

1. Sensor sends a reading every minute.
2. Job validates device ID and metric shape.
3. When vibration exceeds limit, an alert job fires (mock returns alert payload; in production you wire Kafka or webhook).

Run the test script—it simulates normal readings and one dangerous spike.

## Run it on OpenShift

```bash
./cli/datatrucker-cli.sh load-mocks
```

## Run it on your laptop

```bash
docker compose \
  -f docker-compose.yml \
  -f mocks/iot-telemetry-alerts/configs/docker-compose.override.yml \
  up -d --build
```

## Customize for your fleet

| Need | Approach |
|------|----------|
| New device type | Add validation schema on ingest job. |
| Different thresholds per site | Use `tenant` field on jobs (`factory-1`, `factory-2`) or separate mock CRs per Helm release. |
| Edge deployment | Deploy platform Helm chart in each site namespace; same CR shape, different `DB.hostname`. |
| Integration with PagerDuty | Add outbound `Script-JS` job calling webhook URL from a credential CR. |
| Load test fan-in | Tune `tests/load_test.k6.js` and scale flow `Replicas`. |

## Tests

```bash
HOST=http://localhost:8080 bash mocks/iot-telemetry-alerts/tests/run_tests.sh
```

## More

- `docs/SETUP_GUIDE.md`
- `../README.md`
