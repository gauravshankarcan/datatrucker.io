# Getting Started with DataTrucker

Builder: Gaurav Shankar <gauravshankar.can@gmail.com>

## Overview

DataTrucker is deployed entirely via **Kubernetes Custom Resources (CRs)**. Configuration is never mounted from files — all API behavior is defined in `DatatruckerConfig`, `DatatruckerFlow`, `DatatruckerInit`, `DatatruckerTenant`, and `DatatruckerMock` CRs.

## Prerequisites

- OpenShift 4.x / CRC with `oc` and `helm` installed
- Images on Quay.io: `quay.io/datatrucker/*:2.1.0`
- Operator installed (or use platform Helm chart CRDs)

## Quick Start (5 minutes)

```bash
# 1. Login to cluster
oc login -u developer https://api.crc.testing:6443

# 2. Full deploy via Helm + CRs
./cli/datatrucker-cli.sh full-reset

# 3. Check status
./cli/datatrucker-cli.sh status

# 4. Run tests
./cli/datatrucker-cli.sh test
```

## CR Types

| CR | Purpose |
|----|---------|
| `DatatruckerConfig` | Platform DB, crypto, Keycloak, plugin settings |
| `DatatruckerFlow` | JobDefinitions, replicas, API/UI images |
| `DatatruckerInit` | Bootstrap admin user and DB initialization |
| `DatatruckerTenant` | Multi-tenant provisioning |
| `DatatruckerMock` | Deploy mock use cases as Flow CRs |

## CLI Commands

```bash
./cli/datatrucker-cli.sh init-admin --admin-user admin --admin-pass secret
./cli/datatrucker-cli.sh create-tenant --tenant-id acme-corp
./cli/datatrucker-cli.sh load-mocks
./cli/datatrucker-cli.sh full-reset
```

## Helm Charts

| Chart | Path | Description |
|-------|------|-------------|
| Platform | `helm/datatrucker-platform/` | Postgres, Redis, Config + Flow CRs |
| Mocks | `helm/datatrucker-mocks/` | Eight mock use cases as `DatatruckerMock` CRs |

## Mock stories (start here for examples)

Each mock includes a narrative **STORY.md** for newcomers—scenario, setup, and customization without reading architecture docs first. See [mocks/README.md](../../mocks/README.md).

## Image Registry

All images: `https://quay.io/organization/datatrucker`

- `datatrucker-api:2.1.0`
- `datatrucker-ui:2.1.0`
- `datatrucker-operator:2.1.0`
- `datatrucker-operator-bundle:2.1.0`

## Next Steps

- [Mock story collection](../../mocks/README.md)
- [Full Reset Guide](FULL_RESET.md)
- [CLI Reference](CLI.md)
- [Plugin Types Reference](../api/PLUGIN_TYPES.md)
- [Settings Guide](../ui/SETTINGS.md)
