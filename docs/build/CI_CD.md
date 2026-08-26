# CI/CD Pipeline

## GitHub Actions

The pipeline in `.github/workflows/ci.yml` runs:

1. **lint-and-test**: ESLint, UI build, docker compose stack, Newman tests
2. **build-and-push**: Push images to `quay.io/datatrucker` on main branch
3. **mock-tests**: Validate all mock use case directory structure

## Required Secrets

| Secret | Description |
|--------|-------------|
| `QUAY_USERNAME` | Quay.io organization username |
| `QUAY_TOKEN` | Quay.io access token |

## Local Image Build

```bash
export QUAY_TOKEN=<your-token>
./scripts/build-images.sh 2.1.0
```

## Builder

Gaurav Shankar <gauravshankar.can@gmail.com>
