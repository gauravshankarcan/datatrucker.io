# Story: Democracy on a Deadline

## Meet Elena

Elena works for a state elections office. Registration season opens in weeks. Citizens need to check eligibility, submit applications, and receive confirmation—while every change must be **auditable** for compliance.

Traditional approach: a contractor builds a portal, another team owns the API, and integration slips to the week before launch. Elena wants one platform where **policy** (who can register, what fields are required) lives in **declarative job definitions** she can review with legal before go-live.

DataTrucker gives her HTTP endpoints with strict validation (JSON Schema on each job) and database-backed records, deployed as OpenShift CRs the security team can inspect in Git.

## What DataTrucker does here

- **Validation-first jobs** reject bad payloads before they touch business logic.
- **Util-Echo** and **DB-Postgres** style jobs handle “check eligibility” vs “persist registration.”
- **DatatruckerInit** (platform-level) can bootstrap admin users; tenant flows handle citizen-facing APIs.

No mounted `registration-rules.json` in a pod—the rules sit in the CR spec the operator reconciles.

## The plot

1. Citizen checks eligibility (age, residency, prior registration).
2. Valid applications are stored with a unique registration ID.
3. Audit-friendly responses: success and failure shapes are consistent for downstream logging.

Walk through the mock as a citizen, then as an admin running the test script.

## Run it on OpenShift

```bash
./cli/datatrucker-cli.sh load-mocks
curl -s http://datatrucker-api-datatrucker.apps-crc.testing/api/v1/statuschecks/healthcheck
```

## Run it on your laptop

```bash
docker compose \
  -f docker-compose.yml \
  -f mocks/voter-registration-system/configs/docker-compose.override.yml \
  up -d --build
```

## Customize for your jurisdiction

| Need | How |
|------|-----|
| Extra eligibility fields | Extend `validations` on the eligibility job in the flow CR. |
| Multi-language error messages | Return structured errors from `Script-JS` jobs keyed by locale in the request. |
| County-level isolation | `create-tenant --tenant-id county-west` with separate DB names in config CRs. |
| Integration with state ID system | Add a job with `type: File-SFTP` or HTTP proxy plugin to call external verification. |
| Peak load | Increase `Replicas` on the flow; run k6 script in `tests/load_test.k6.js` to find limits. |

## Tests

```bash
HOST=http://localhost:8080 bash mocks/voter-registration-system/tests/run_tests.sh
```

## Further reading

- `docs/DATA_MODELS.md` — registration entities
- `../README.md` — other mock stories
