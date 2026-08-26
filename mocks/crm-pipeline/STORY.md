# Story: Sales That Never Wants to Miss a Lead

## Meet Marcus

Marcus leads sales at a B2B startup. Leads arrive from the website, partner webhooks, and a messy CSV import every Monday. His team lives in a CRM, but the **glue** between “form submitted” and “deal in pipeline” was a Zapier board that nobody trusted.

He needs **reliable automation**: when a lead arrives, validate it, score it, push events to a bus, and let downstream systems react. DataTrucker is the glue layer—HTTP jobs that validate payloads, write to Postgres, and publish to Kafka without Marcus maintaining a separate Node service for each rule change.

## What DataTrucker does here

- **Jobs** are HTTP endpoints with schemas (who can POST what shape).
- **Plugins** like `IOTKafka` or `Script-JS` run the “when lead created, emit event” behavior inside the job definition in the CR.
- **DatatruckerMock** deploys this entire pipeline story as one named resource on the cluster.

Marcus edits the CR (or Helm values), not a dozen Kubernetes manifests.

## The plot of this mock

1. A webhook receiver registers where partners should POST leads.
2. A new lead is validated (company name, email, budget range).
3. Pipeline stage updates and Kafka topics notify marketing automation.

You are the first sales engineer: prove the health check, then walk through the Postman collection simulating a lead’s journey.

## Run it on OpenShift

```bash
./cli/datatrucker-cli.sh load-mocks
oc get datatruckermock crm-pipeline -n datatrucker
```

## Run it on your laptop

```bash
docker compose \
  -f docker-compose.yml \
  -f mocks/crm-pipeline/configs/docker-compose.override.yml \
  up -d --build
```

This override adds Kafka/Zookeeper alongside the base stack. Give containers a minute before running tests.

## Customize for your pipeline

| Goal | Approach |
|------|----------|
| New lead source | Add a `JobDefinitions` entry with a distinct `tenant` and validation schema. |
| Change scoring rules | Edit the `Script-JS` body in the flow spec or swap to `Util-Fuzzy` for matching. |
| Different message bus | Replace Kafka plugin config in `DatatruckerConfig` / job resource templates. |
| Per-region CRM | One `DatatruckerTenant` per region with isolated `DatatruckerConfig` database names. |
| Stage-gated automation | Add jobs per stage (`restmethod` + path) instead of one giant script. |

Apply changes to the `DatatruckerMock` or child `DatatruckerFlow` CR; the operator reconciles.

## Tests

```bash
HOST=http://localhost:8080 bash mocks/crm-pipeline/tests/run_tests.sh
```

## Deep dives

- `docs/SETUP_GUIDE.md` — tokens and Kafka topic names
- `docs/ARCHITECTURE.md` — event flow diagram
- More stories: `../README.md`
