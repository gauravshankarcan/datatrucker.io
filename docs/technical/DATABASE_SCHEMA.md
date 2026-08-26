# DataTrucker Database Schema

## Overview

DataTrucker uses PostgreSQL as the primary datastore with Knex migrations for schema management.

## Core Tables

### users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| username | VARCHAR | Unique username |
| email | VARCHAR | User email |
| password_hash | VARCHAR | Hashed password |
| created_at | TIMESTAMP | Creation time |

### groups
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Group name |
| description | TEXT | Group description |

### user_mappings
Maps users to groups with tenant scoping for multi-tenant RBAC.

### credentials
Encrypted connection credentials for external systems (DB, SFTP, Redis, Kafka).

### audit_events
Immutable audit trail for security-sensitive operations.

### metrics
Performance and usage metrics for observability.

## Migrations

Migrations live in `datatrucker_api/app/migrations/` and run automatically on API startup via `npm run migrate`.

```bash
cd datatrucker_api/app
knex migrate:latest --env production
```

## Builder

Gaurav Shankar <gauravshankar.can@gmail.com>
