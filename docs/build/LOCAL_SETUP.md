# Local Setup Guide

## Prerequisites

- Docker or Podman with Compose plugin
- Node.js 20+ (for local development)
- 8GB RAM minimum

## Quick Start

```bash
git clone https://github.com/datatruckerio/datatrucker.io.git
cd datatrucker.io
docker compose up -d
```

Services:
| Service | URL |
|---------|-----|
| API | http://localhost:8080 |
| UI | http://localhost:9080 |
| Keycloak | http://localhost:8081 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

## Verify

```bash
curl http://localhost:8080/api/v1/statuschecks/healthcheck
./scripts/run-tests.sh
```

## Builder

Gaurav Shankar <gauravshankar.can@gmail.com>
