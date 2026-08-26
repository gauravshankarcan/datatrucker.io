# Full Reset and Redeploy

Completely tear down and redeploy DataTrucker using Helm charts. All configuration is applied via CRs — no config file mounts.

## One-Command Reset

```bash
./cli/datatrucker-cli.sh full-reset
```

This performs:

1. `helm uninstall datatrucker-mocks`
2. `helm uninstall datatrucker-platform`
3. `helm upgrade --install datatrucker-platform` (postgres, redis, Config + Flow CRs)
4. `helm upgrade --install datatrucker-mocks` (9 DatatruckerMock CRs)
5. Applies `DatatruckerInit` CR for admin bootstrap

## Manual Step-by-Step

```bash
NS=datatrucker

# Uninstall
helm uninstall datatrucker-mocks -n $NS
helm uninstall datatrucker-platform -n $NS

# Optional: delete namespace entirely
oc delete namespace $NS --wait=true

# Redeploy platform
helm upgrade --install datatrucker-platform ./helm/datatrucker-platform \
  -n $NS --create-namespace \
  --set imageRegistry=quay.io/datatrucker \
  --set imageTag=2.1.0

# Wait for postgres
oc wait --for=condition=available deployment/postgres -n $NS --timeout=120s

# Deploy mocks
helm upgrade --install datatrucker-mocks ./helm/datatrucker-mocks -n $NS

# Initialize admin via CR
./cli/datatrucker-cli.sh init-admin --admin-user admin --admin-pass changeme

# Verify
./cli/datatrucker-cli.sh status
./cli/datatrucker-cli.sh test
```

## Operator CRD Upgrade

When new CR types are added (`DatatruckerInit`, `DatatruckerTenant`, `DatatruckerMock`):

```bash
oc apply -f datatrucker_operator/config/crd/bases/
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Postgres CrashLoop | Chart uses `PGDATA` subdir for OpenShift SCC |
| Flow not reconciling | Ensure operator is running and watches new CR kinds |
| Image pull errors | Verify `quay.io/datatrucker/*:2.1.0` tags exist |
