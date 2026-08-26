# Story: SaaS That Spins Up a Customer in Minutes

## Meet Nora

Nora runs platform engineering for a B2B SaaS product. Every new customer expects: isolated data, branded subdomain, default APIs, admin user—**today**, not after a three-week ticket queue.

Her team built “provision tenant” as a runbook: create namespace, database, config, deploy API. DataTrucker collapses that into **DatatruckerTenant** and **DatatruckerMock** CRs. Nora applies one YAML (or Helm value); the operator creates config, flow, and optionally a namespace.

This mock story shows the **provisioning narrative**: from signup webhook to live tenant API.

## What DataTrucker does here

- `DatatruckerTenant` CR: `tenantId`, plan, admin email → operator creates `tenant-config` + `tenant-flow`.
- `DatatruckerMock` can also model “golden path” demos bundled with the platform.
- No shell scripts mounting `tenant.yaml` into pods—all spec in CR.

## The plot

1. Sales closes deal; billing sends “tenant created” event (simulated in tests).
2. Provisioning job validates plan tier and tenant slug.
3. Operator (or tenant role) materializes CRs for the new customer.
4. Health check on the new tenant’s API proves go-live.

Run tests to see the happy path end-to-end.

## Run it on OpenShift

```bash
./cli/datatrucker-cli.sh load-mocks

# Provision a demo tenant manually
./cli/datatrucker-cli.sh create-tenant --tenant-id acme-corp
./cli/datatrucker-cli.sh status
```

## Run it on your laptop

```bash
docker compose \
  -f docker-compose.yml \
  -f mocks/saas-tenant-provisioning/configs/docker-compose.override.yml \
  up -d --build
```

## Customize for your product tiers

| Tier / need | Customize |
|-------------|-----------|
| Starter vs enterprise features | Different `JobDefinitions` sets per tenant template; enterprise mock includes more jobs. |
| Dedicated namespace per tenant | Set `createNamespace: true` on `DatatruckerTenant` spec (operator creates Namespace). |
| Custom domain per tenant | Add Route CR in a post-provision job or extend operator role (advanced). |
| Seat limits | Validation on `active_users` in provision job script. |
| Trial expiry | Scheduled job (Kubernetes CronJob triggered by init pattern) or external workflow calling deactivate job. |

## Tests

```bash
HOST=http://localhost:8080 bash mocks/saas-tenant-provisioning/tests/run_tests.sh
```

## More

- Platform CLI: `docs/build/CLI.md`
- All stories: `../README.md`
