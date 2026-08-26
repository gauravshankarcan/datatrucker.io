# Story: Banks That Must Know You Before They Trust You

## Meet James

James product-manages onboarding for a digital bank. Regulators require **Know Your Customer (KYC)**: identity proof, address check, risk scoring, manual review for edge cases. Each step is historically another microservice sprint.

With DataTrucker, each step can be a **job**—submit ID, verify document, run risk script, mark approved. The flow is one `DatatruckerFlow` CR (or mock) with ordered `JobDefinitions` and strict validation. Compliance reviews the CR diff in Git, not scattered repos.

## What DataTrucker does here

- Structured payloads per step (document type, country, user reference).
- Scripts or DB jobs update onboarding state.
- Keycloak (local mock) simulates authenticated customers vs back-office reviewers.

## The plot

1. Applicant starts onboarding → receives session ID.
2. Upload step validates document metadata (full doc storage would be S3 plugin in production).
3. Risk job scores the application; high risk routes to manual review job.
4. Approval job unlocks account creation downstream.

Follow the Postman collection as an applicant, then as a reviewer.

## Run it on OpenShift

```bash
./cli/datatrucker-cli.sh load-mocks
```

## Run it on your laptop

```bash
docker compose \
  -f docker-compose.yml \
  -f mocks/fintech-kyc-onboarding/configs/docker-compose.override.yml \
  up -d --build
```

## Customize for your compliance model

| Requirement | How |
|-------------|-----|
| New country rules | Add validation `pattern` / `enum` on document jobs. |
| Extra step (e.g. selfie match) | Insert new `JobDefinitions` entry; chain via application state in DB. |
| Segregate retail vs business | Two tenants with different job sets. |
| Audit export | `DB-Postgres` read-only job for auditors; narrow `tenant` and permissions. |
| External ID vendor | `Script-JS` job calling vendor API with creds from operator-managed secrets (from config CR crypto). |

## Tests

```bash
HOST=http://localhost:8080 bash mocks/fintech-kyc-onboarding/tests/run_tests.sh
```

## More

- `docs/DATA_MODELS.md` — onboarding states
- `../README.md`
