# DataTrucker Mock Stories

Welcome. If you have never touched DataTrucker before, start here—not in the architecture diagrams.

DataTrucker is a low-code platform for **API workflows**: you describe what should happen when someone calls an endpoint (validate input, talk to a database, call another service, send a message), and the platform runs it. On OpenShift, you express that description as **Kubernetes custom resources** (`DatatruckerConfig`, `DatatruckerFlow`, `DatatruckerMock`). The operator turns those resources into a running API—no hand-edited deployment YAML for every change.

This folder contains **eight complete stories**. Each one is a realistic business scenario you can deploy, poke at, and reshape for your own product.

## How to read each mock

Every mock has a **STORY.md**—a narrative walkthrough for newcomers:

- Who the user is and what problem they face
- What DataTrucker does in that scenario (in plain language)
- How to run it on OpenShift (CRs + Helm) or locally (Docker Compose)
- How to customize jobs, tenants, and integrations for your use case

Technical references (`ARCHITECTURE.md`, `DATA_MODELS.md`, `SETUP_GUIDE.md`) stay available when you need depth.

## The eight stories

| Story | Folder | In one sentence |
|-------|--------|-----------------|
| The HR team that outgrew spreadsheets | [employee-management](employee-management/STORY.md) | Departments, roles, and approvals without a bespoke HR app |
| Sales that never wants to miss a lead | [crm-pipeline](crm-pipeline/STORY.md) | Leads, webhooks, and pipeline stages wired to Kafka |
| Democracy on a deadline | [voter-registration-system](voter-registration-system/STORY.md) | Citizen registration with eligibility checks and audit trail |
| Shops with more than one warehouse | [ecommerce-inventory-sync](ecommerce-inventory-sync/STORY.md) | Stock moves safely across warehouses with locking |
| Machines that talk before people notice | [iot-telemetry-alerts](iot-telemetry-alerts/STORY.md) | Device telemetry, thresholds, and alert fan-out |
| Banks that must know you before they trust you | [fintech-kyc-onboarding](fintech-kyc-onboarding/STORY.md) | Step-by-step KYC with identity checks |
| Care without compromising privacy | [healthcare-patient-portal](healthcare-patient-portal/STORY.md) | Patient-facing flows with sensitive data handled carefully |
| SaaS that spins up a customer in minutes | [saas-tenant-provisioning](saas-tenant-provisioning/STORY.md) | New tenant namespace, config, and default API in one flow |

## Quick start (OpenShift)

All mocks deploy from custom resources—never by mounting config files into pods.

```bash
# Platform + operator + all mock CRs
./cli/datatrucker-cli.sh full-reset

# Or load mocks only (platform already running)
./cli/datatrucker-cli.sh load-mocks
```

Check status:

```bash
./cli/datatrucker-cli.sh status
```

Run health and mock tests:

```bash
./cli/datatrucker-cli.sh test
```

## Quick start (local laptop)

Pick a story folder and follow **STORY.md** → “Run it on your laptop.” Typically:

```bash
docker compose \
  -f docker-compose.yml \
  -f mocks/<story-name>/configs/docker-compose.override.yml \
  up -d --build
```

## Customize anything

Across all stories, customization follows the same pattern:

1. **Edit job definitions** — change `JobDefinitions` in a `DatatruckerFlow` or inside a `DatatruckerMock` `flow` spec (HTTP method, validation schema, script logic, plugin `type`).
2. **Point at your data** — update `DatatruckerConfig` `DB` settings or add credentials jobs reference.
3. **Add tenants** — `./cli/datatrucker-cli.sh create-tenant --tenant-id your-org` creates config + flow CRs for isolation.
4. **Redeploy** — Helm upgrade or `oc apply` on the CR; the operator reconciles.

Plugin types (`Util-Echo`, `Script-JS`, `DB-Postgres`, etc.) are documented in [docs/api/PLUGIN_TYPES.md](../docs/api/PLUGIN_TYPES.md).

## What we removed

The duplicate folder `e-commerce-inventory-sync` was merged into **ecommerce-inventory-sync** (one story, one Helm entry, one CR name).

Pick a story above and open its **STORY.md**—that is where the journey begins.
