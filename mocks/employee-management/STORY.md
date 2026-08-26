# Story: The HR Team That Outgrew Spreadsheets

## Meet Priya

Priya runs HR for a 200-person company. Onboarding used to mean a shared Google Sheet, three Slack threads, and someone manually updating payroll. When the company doubled in size, the sheet broke—wrong manager assignments, duplicate employee IDs, and no one knew who could approve time-off.

She does not want to buy a monolithic HR suite yet. She wants **small, clear APIs**: list departments, add an employee, route an approval. DataTrucker lets her define those APIs as **jobs** on the platform and deploy them with a single Kubernetes resource—no custom microservice repo for every tweak.

## What DataTrucker does here (no jargon)

1. You declare **what the API should do** (echo health checks, CRUD on employees, run a script when someone submits leave).
2. You declare **how the API runs** (image, database connection, replicas)—via `DatatruckerConfig` and `DatatruckerFlow` CRs.
3. The **operator** creates the deployment, wires Postgres, and keeps it in sync when you change the CR.

Employees and departments in this mock are ordinary database tables behind job endpoints. Keycloak (optional locally) stands in for “who is allowed to call what.”

## The plot of this mock

- **Act 1 — Structure:** Departments and job titles exist before people are hired.
- **Act 2 — People:** HR creates employee records linked to departments.
- **Act 3 — Process:** A leave request hits an endpoint; validation runs; managers get a consistent response shape.

You play Priya: call the health endpoint, then explore employee and department routes in the Postman collection under `tests/`.

## Run it on OpenShift (recommended)

Everything is CR-driven:

```bash
./cli/datatrucker-cli.sh load-mocks   # includes employee-management DatatruckerMock
./cli/datatrucker-cli.sh status
```

The mock CR tells the operator to create a `DatatruckerFlow` named `employee-management` with job definitions inline—no config files mounted into pods.

API (after platform route is up):

```bash
curl -s http://datatrucker-api-datatrucker.apps-crc.testing/api/v1/statuschecks/healthcheck
```

## Run it on your laptop

```bash
cd /path/to/datatrucker.io
docker compose \
  -f docker-compose.yml \
  -f mocks/employee-management/configs/docker-compose.override.yml \
  up -d --build

curl -s http://localhost:8080/api/v1/statuschecks/healthcheck
```

See `docs/SETUP_GUIDE.md` for tokens and sample curls.

## Customize for your organization

| Goal | What to change |
|------|----------------|
| Add a new endpoint (e.g. “promote employee”) | Add a `JobDefinitions` entry in the flow spec: `type`, `tenant`, `restmethod`, `validations`, optional `script`. |
| Different approval rules | Use `Script-JS` or `Script-Shell` job type with your logic, or chain multiple jobs. |
| Separate HR vs payroll | Create two tenants: `./cli/datatrucker-cli.sh create-tenant --tenant-id payroll` and duplicate flows with different `JobDefinitions`. |
| Production database | Edit `DatatruckerConfig` `DB.hostname` / credentials in the CR (or Helm values), not env files in the repo. |
| More replicas | Set `Replicas` on the `DatatruckerFlow` spec. |

Redeploy: update the CR and wait for the operator, or `helm upgrade` the mocks chart if you manage mocks via Helm.

## Try the tests

```bash
HOST=http://localhost:8080 bash mocks/employee-management/tests/run_tests.sh
```

## Where to go next

- Technical depth: `docs/ARCHITECTURE.md`, `docs/DATA_MODELS.md`
- All plugin types: `docs/api/PLUGIN_TYPES.md`
- Other stories: `mocks/README.md`
