# Ecommerce Inventory Sync — Setup Guide

> **New to DataTrucker?** Start with [STORY.md](../STORY.md)—a narrative walkthrough before this technical guide.


## Prerequisites
- Docker / Podman with Compose
- DataTrucker platform running (`docker compose up -d`)

## Quick Start

```bash
cd mocks/ecommerce-inventory-sync
docker compose -f ../../docker-compose.yml -f configs/docker-compose.override.yml up -d
export HOST=http://localhost:8080
./tests/run_tests.sh
```

## Load Testing

```bash
./tests/run_tests.sh --load
```

## Keycloak Realm
Import `configs/keycloak-realm.json` or use the override compose stack.
