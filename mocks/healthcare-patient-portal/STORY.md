# Story: Care Without Compromising Privacy

## Meet Dr. Lin

Dr. Lin’s clinic wants a **patient portal**: appointments, lab results, secure messaging. IT is nervous—HIPAA, PII, minimum necessary exposure. They need APIs that **validate**, **authorize**, and **never log raw PHI** in echo responses.

DataTrucker jobs carry JSON Schema validation on every patient-facing endpoint. Scripts can anonymize fields before returning data. Deployed as CRs, the security team audits one spec per endpoint family instead of hunting through application code.

## What DataTrucker does here

- Patient jobs run under a dedicated `tenant` in job definitions.
- Admin vs patient capabilities differ by job `tenant` and Keycloak roles (local mock).
- Sensitive operations use typed validations (date of birth format, MRN pattern).

## The plot

1. Patient authenticates (Keycloak locally).
2. Patient views sanitized lab summary—not full internal notes.
3. Staff jobs (different tenant) see richer data for care delivery.
4. Every response uses a consistent envelope for the portal UI.

You play the patient first, then the nurse, using the test collection.

## Run it on OpenShift

```bash
./cli/datatrucker-cli.sh load-mocks
```

## Run it on your laptop

```bash
docker compose \
  -f docker-compose.yml \
  -f mocks/healthcare-patient-portal/configs/docker-compose.override.yml \
  up -d --build
```

## Customize for your clinic network

| Goal | Approach |
|------|----------|
| New portal feature (e.g. prescriptions) | New job with `tenant: Patient` and tight `validations`. |
| Clinic vs hospital system | `DatatruckerTenant` per facility; separate DB in config CR. |
| Field-level redaction | Adjust `Script-JS` return object to strip fields by caller role. |
| Break-glass access | Separate admin tenant jobs with stronger audit logging job. |
| BAA-covered hosting | Run platform Helm on your compliant cluster; images from your registry. |

## Tests

```bash
HOST=http://localhost:8080 bash mocks/healthcare-patient-portal/tests/run_tests.sh
```

## More

- `docs/ARCHITECTURE.md` — trust zones
- `../README.md`
