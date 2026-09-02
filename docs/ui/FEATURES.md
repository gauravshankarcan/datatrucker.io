# Platform Features

Gaurav Shankar

## Core Features

### CR-Driven Configuration

All platform behavior is defined through Kubernetes Custom Resources. No ConfigMap mounts for API configuration — the operator reconciles CRs into runtime resources.

| CR | Feature |
|----|---------|
| `DatatruckerConfig` | DB, crypto, Keycloak, resource templates |
| `DatatruckerFlow` | Job pipelines, scaling, image selection |
| `DatatruckerInit` | Admin bootstrap |
| `DatatruckerTenant` | Multi-tenant provisioning |
| `DatatruckerMock` | Mock use case deployment |

### Visual Workflow Builder

Node-based pipeline canvas at `/workflow-builder`:

- Drag-and-drop job nodes (Input → Transform → Output)
- Connect nodes to define pipeline flow
- Export pipeline as JSON for CR JobDefinitions

### Admin Portal

Comprehensive settings UI at `/admin`:

- Environment configuration
- RBAC role management
- Connection health monitoring
- Deployment settings (replicas, registry, tags)

### Light / Dark Theme

Modern UI with Inter typography, blue/purple palette, and persistent theme preference.

## Plugin Ecosystem

17 plugin types for data pipelines:

- **Util**: Echo, Fuzzy, Sentiment
- **DB**: Postgres, MySQL, MariaDB, MSSQL, Oracle, SQLite
- **Script**: JavaScript, SSH, Shell
- **IOT**: Redis, Kafka, Proxy
- **File**: SFTP
- **Flow**: Chain, Block

See [PLUGIN_TYPES.md](../api/PLUGIN_TYPES.md) for examples.

## Mock Use Cases (9)

Deployed via `DatatruckerMock` CRs / Helm:

1. Employee Management
2. CRM Pipeline
3. Voter Registration
4. E-Commerce Inventory Sync
5. Ecommerce Inventory Sync (multi-warehouse)
6. IoT Telemetry Alerts
7. Fintech KYC Onboarding
8. Healthcare Patient Portal
9. SaaS Tenant Provisioning

## Operations

- **Helm charts** for platform and mocks
- **CLI** for init-admin, create-tenant, load-mocks, full-reset
- **CI/CD** with Newman tests and Quay.io image publishing
- **Operator Hub** distribution (v2.1.0)

## Security Features

- Zero-trust JWT validation
- Keycloak RBAC integration
- AJV input sanitization
- AES-256 credential encryption
- Helmet security headers
