# Data Flow Pipelines

## Request Lifecycle

```mermaid
sequenceDiagram
    participant C as Client
    participant API as Fastify API
    participant Auth as Keycloak/JWT
    participant Job as Job Handler
    participant Plugin as Plugin Engine
    participant DB as PostgreSQL

    C->>API: HTTP Request
    API->>Auth: Validate Token
    Auth-->>API: Claims + Roles
    API->>Job: Route to JobDefinition
    Job->>Job: AJV Validation
    Job->>Plugin: Execute Plugin Chain
    Plugin->>DB: Query/Write
    DB-->>Plugin: Result
    Plugin-->>Job: Transformed Data
    Job-->>API: Response Envelope
    API-->>C: JSON Response
```

## Plugin Pipeline Types

| Plugin | Purpose |
|--------|---------|
| Util-Echo | Health checks, passthrough |
| DB | Database queries (PostgreSQL, MySQL, Oracle, MSSQL) |
| IOT-Redis | Redis pub/sub, caching, locking |
| IOT-Kafka | Event streaming |
| Script-JS | Custom JavaScript business logic |
| File-SFTP | File transfer operations |
| Script-SSH | Remote command execution |

## Builder

Gaurav Shankar <gauravshankar.can@gmail.com>
