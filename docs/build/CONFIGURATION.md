# Configuration Guide

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_USER` | datatrucker | Database user |
| `DB_PASSWORD` | datatrucker | Database password |
| `DB_NAME` | datatrucker | Database name |
| `REDIS_HOST` | localhost | Redis host |
| `KEYCLOAK_URL` | http://localhost:8081 | Keycloak base URL |

## Config Files

| File | Purpose |
|------|---------|
| `server.config.json` | API server settings, plugin enablement |
| `db.config.json` | Database connection |
| `crypto.config.json` | JWT, encryption, Keycloak |
| `resource.config.json` | Resource templates and cache |

## Secrets in Kubernetes

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: datatrucker-secrets
type: Opaque
stringData:
  DB_PASSWORD: <password>
  KEYCLOAK_CLIENT_SECRET: <secret>
```

## Builder

Gaurav Shankar <gauravshankar.can@gmail.com>
