# Story: Shops With More Than One Warehouse

## Meet Diego

Diego runs operations for an online retailer with three warehouses. When a customer orders, stock must move from the right building **without** overselling the same SKU twice during a flash sale.

His nightmare: two transfer requests grab the same inventory row and the database ends up negative. He needs **transfers with locks**—short-lived Redis keys, database transactions, and an event on a bus so analytics sees every move.

He does not want to own a custom “inventory service” repository for every rule change. In DataTrucker, the transfer logic lives in a **job definition** (`Script-JS` with Redis + Postgres plugins) inside a `DatatruckerFlow` CR. Diego edits the CR; the operator redeploys the API.

*(This is the single canonical mock for e-commerce inventory. The old duplicate folder `e-commerce-inventory-sync` was removed.)*

## What DataTrucker does here

- **Job** = HTTP POST `/api/v1/warehouses/sync` (in the full pipeline config) with validation on SKU and quantities.
- **Script** runs BEGIN/COMMIT, Redis `SET NX` lock, Kafka produce on success.
- **DatatruckerMock** named `ecommerce-inventory-sync` installs this flow on OpenShift via Helm.

## The plot

1. Flash sale starts; many workers call “transfer 5 units from WH-A to WH-C.”
2. Only one transfer holds the global lock per SKU at a time.
3. Failed transfers return clear HTTP errors (423 locked, 422 insufficient stock).
4. Successful transfers emit `warehouse.transfers` events.

You are Diego on launch day: run tests, then simulate conflicting transfers in Postman.

## Run it on OpenShift

```bash
./cli/datatrucker-cli.sh load-mocks
oc get datatruckermock ecommerce-inventory-sync -n datatrucker
```

## Run it on your laptop

```bash
docker compose \
  -f docker-compose.yml \
  -f mocks/ecommerce-inventory-sync/configs/docker-compose.override.yml \
  up -d --build
```

## Customize for your supply chain

| Goal | Change |
|------|--------|
| More warehouses | Extend validation enums and DB seed data; no code deploy if IDs are dynamic. |
| Longer lock TTL | Edit `EX` seconds in the script inside the CR. |
| Replace Kafka with Redis streams | Swap plugin enablement in `jobsServer` and script produce call. |
| Per-brand inventory | Separate tenants with isolated Postgres databases via `DatatruckerTenant`. |
| Read-only stock API | Add a `GET` `Util-Echo` or `DB-Postgres` job without mutating scripts. |

Reference pipeline with full script: `configs/datatrucker-pipeline.yaml`.

## Tests

```bash
HOST=http://localhost:8080 bash mocks/ecommerce-inventory-sync/tests/run_tests.sh
```

## More

- `docs/ARCHITECTURE.md` — locking diagram
- `../README.md`
