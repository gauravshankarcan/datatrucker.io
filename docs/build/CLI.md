# CLI Reference

All commands interact with the platform via Kubernetes CRs.

## Installation

```bash
chmod +x cli/datatrucker-cli.sh
# Optional alias
alias datatrucker='./cli/datatrucker-cli.sh'
```

## Commands

### `init-admin`

Applies a `DatatruckerInit` CR to bootstrap the admin user.

```bash
./cli/datatrucker-cli.sh init-admin \
  --admin-user admin \
  --admin-pass secret \
  --admin-email admin@datatrucker.io \
  -n datatrucker
```

### `create-tenant`

Applies a `DatatruckerTenant` CR to provision tenant Config + Flow.

```bash
./cli/datatrucker-cli.sh create-tenant --tenant-id acme-corp -n datatrucker
```

### `load-mocks`

Deploys all 9 mock use cases via Helm (`DatatruckerMock` CRs).

```bash
./cli/datatrucker-cli.sh load-mocks -n datatrucker
```

### `deploy-platform`

Helm install/upgrade of `helm/datatrucker-platform`.

```bash
./cli/datatrucker-cli.sh deploy-platform -n datatrucker
```

### `full-reset`

Uninstall + redeploy platform and mocks + init admin.

```bash
./cli/datatrucker-cli.sh full-reset -n datatrucker
```

### `test`

Runs `scripts/run-tests.sh` against the API route.

```bash
export API_URL=http://datatrucker-api-datatrucker.apps-crc.testing
./cli/datatrucker-cli.sh test
```

### `status`

Shows CRs, pods, and routes.

```bash
./cli/datatrucker-cli.sh status -n datatrucker
```
