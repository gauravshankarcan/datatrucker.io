# Security Architecture

## Zero-Trust Principles

DataTrucker applies zero-trust security across all layers:

1. **Authentication**: Every API request requires valid JWT (Keycloak or local RS256)
2. **Authorization**: RBAC enforced per tenant and group membership
3. **Input Validation**: AJV schema validation on all job inputs
4. **Credential Encryption**: AES-256-CBC for stored connection credentials
5. **Transport Security**: TLS/HTTPS support via Fastify HTTPS config
6. **Helmet Headers**: Frame guard, CSP, HSTS via fastify-helmet

## RBAC Model

```
User → user_mappings → Groups → Tenant-scoped permissions
```

## Dependency Auditing

```bash
cd datatrucker_api/app && npm audit
cd datatrucker_ui/app && npm audit
```

## Secrets Management

- Never commit credentials to the repository
- Use Kubernetes Secrets or OpenShift secrets for deployment
- Keycloak realm configs use placeholder secrets; rotate in production

## Builder

Gaurav Shankar
