# Settings Guide

DataTrucker settings are managed via CRs and the Admin Portal UI — never through mounted configuration files.

## Platform Settings (`DatatruckerConfig` CR)

Edit the platform config CR:

```bash
oc edit datatruckerconfig platform-config -n datatrucker
```

### Database

```yaml
spec:
  DB:
    user: datatrucker
    password: datatrucker
    databasename: datatrucker
    hostname: postgres
    type: pg
    port: 5432
```

### Keycloak IAM

```yaml
spec:
  API:
    crypto:
      keycloak:
        realm: DataTrucker
        client_id: datatrucker-api
        url: http://keycloak:8080
        client_secret: datatrucker-secret
```

### JWT

```yaml
spec:
  API:
    crypto:
      JWT:
        signOptions:
          algorithm: RS256
          expiresIn: 60m
          issuer: datatrucker
```

### Plugin Enablement

Configured in `DatatruckerConfig` → `API` → server settings (operator generates ConfigMaps from CR).

## Admin Portal (UI)

Navigate to `/admin` in the DataTrucker UI for:

| Tab | Settings |
|-----|----------|
| Environment | API/UI ports, log level, Keycloak toggle, compression |
| RBAC | Role permissions (admin, developer, viewer) |
| Connections | PostgreSQL, Redis, Keycloak status |
| Deployment | Replicas, image tag, registry, namespace |

## Theme Settings

Light/dark mode toggle in the UI header. Preference stored in browser `localStorage` (`datatrucker-theme-mode`).

## Tenant Settings

Per-tenant overrides via `DatatruckerTenant` CR:

```bash
./cli/datatrucker-cli.sh create-tenant --tenant-id my-org
```

## Security Settings

- Credentials encrypted with AES-256-CBC
- All API requests require JWT when Keycloak is enabled
- Input validation via AJV schemas in JobDefinitions

See [SECURITY.md](../technical/SECURITY.md) for hardening details.
