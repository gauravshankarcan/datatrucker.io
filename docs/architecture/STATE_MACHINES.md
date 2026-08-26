# State Machines

DataTrucker.IO implements several implicit state machines governing platform initialization, job execution, deployment lifecycle, and user authorization. This document formalizes those states and transitions.

## Platform Initialization State Machine

Before any authenticated operation, the platform must be initialized with an admin user.

```mermaid
stateDiagram-v2
    [*] --> Uninitialized: Fresh database
    Uninitialized --> Initialized: POST /api/v1/statuschecks/intialize
    Initialized --> Initialized: Normal operations
    Uninitialized --> Uninitialized: GET /api/v1/statuschecks/is-intialized → false
    Initialized --> Initialized: GET /api/v1/statuschecks/is-intialized → true

    note right of Uninitialized
        users table count = 0
        Admin group seeded by migration
    end note

    note right of Initialized
        Admin user created with base=true
        Mapped to Administrators group
    end note
```

### States

| State | Condition | Available Operations |
|-------|-----------|---------------------|
| **Uninitialized** | `users` table has zero rows | Health check, initialize endpoint only |
| **Initialized** | At least one user exists | Full API surface (subject to auth) |

### Initialization Sequence

1. Knex migrations run (`npm run migrate`) creating tables and seeding the `Administrators` group (`Tenant_Author`, tenant `Admin`).
2. `POST /api/v1/statuschecks/intialize` with `{ username, password }` creates the admin user with salted hash and maps to the Administrators group.
3. `GET /api/v1/statuschecks/healthcheck` returns `dbinitialized: true` once users exist.

## Job Request State Machine

Every job request traverses a deterministic execution pipeline.

```mermaid
stateDiagram-v2
    [*] --> Received: HTTP request arrives
    Received --> AuthPending: Route matched
    AuthPending --> Authenticated: JWT valid
    AuthPending --> Rejected: JWT invalid / missing
    Authenticated --> ConfigLoading: authenticate passed
    ConfigLoading --> ConfigLoaded: JSON definition found
    ConfigLoading --> Failed: File not found / parse error
    ConfigLoaded --> Validating: ResourceConfig complete
    Validating --> Validated: AJV pass
    Validating --> ValidationFailed: AJV errors
    Validated --> Executing: Dispatch to plugin
    Executing --> Completed: Plugin returns data
    Executing --> Failed: Plugin throws
    Completed --> Auditing: replyHandler envelope
    ValidationFailed --> Auditing: 422 response
    Failed --> Auditing: 422 response
    Rejected --> [*]: 401 response
    Auditing --> [*]: Audit row inserted

    note right of Executing
        Chain/Block may invoke
        multiple plugin states
    end note
```

### Job Response Envelope States

| Field | Success | Failure |
|-------|---------|---------|
| `reqCompleted` | `true` | `false` |
| `data` | Plugin result | — |
| `errorMsg` | — | Error details (if enabled) |
| `reqID` | Request ID | Request ID |
| `date` | ISO timestamp | ISO timestamp |
| `serverID` | From server.config | From server.config |

## Chain Execution State Machine

Chain jobs maintain an internal execution state across stubs.

```mermaid
stateDiagram-v2
    [*] --> CacheRequest: Store $request in requestCache
    CacheRequest --> Iterating: For each chain item
    Iterating --> Translating: Resolve JSONPath references
    Translating --> LoadingStub: nextkey() substitution
    LoadingStub --> ExecutingStub: ResourceConfig(stub, method)
    ExecutingStub --> Registering: Plugin execution complete
    Registering --> Iterating: register output to cache
    Registering --> Iterating: No register key
    Iterating --> Returning: All stubs complete
    Returning --> [*]: Return finaldata

    ExecutingStub --> Failed: Plugin error propagates
    Failed --> [*]: 422 to client
```

### Request Cache TTL

The `requestCache` uses `server.fastify.requestTimeout` as TTL (configured as 1 second in default `server.config.json`). Chain steps must complete within this window for cross-step references to remain valid.

## Block Execution State Machine

```mermaid
stateDiagram-v2
    [*] --> EvaluateWhen: Block handler invoked
    EvaluateWhen --> Skipped: when=false or condition not met
    EvaluateWhen --> LoopCheck: when=true
    LoopCheck --> SingleExec: No loop array
    LoopCheck --> LoopExec: loop array present
    SingleExec --> Delegate: Load resourcelink stub
    LoopExec --> Delegate: For each loop item
    Delegate --> Complete: Plugin returns
    Complete --> [*]: Aggregate results
    Skipped --> [*]: Return empty array
```

## User Authorization State Machine

JWT payload `wrt` field encodes write permission derived from group level at login time.

```mermaid
stateDiagram-v2
    [*] --> LoginAttempt: POST /login or /login-keycloak
    LoginAttempt --> CredentialCheck: Validate credentials
    CredentialCheck --> TenantMapping: Credentials valid
    CredentialCheck --> Denied: Invalid credentials
    TenantMapping --> LevelResolve: Find group for tenant
    TenantMapping --> Denied: No tenant mapping
    LevelResolve --> Reader: Tenant_Reader (wrt=0)
    LevelResolve --> Author: Tenant_Author (wrt=1)
    Reader --> UIBlocked: browser=true from UI
    Reader --> TokenIssued: API client (no browser flag)
    Author --> TokenIssued: JWT signed
    UIBlocked --> Denied: 401 Read-only cannot use UI
    TokenIssued --> [*]: Cookie + token returned
    Denied --> [*]: 401

    note right of LevelResolve
        Keycloak: maps realm roles
        to groupname matches
    end note
```

### Admin Tenant Gate

```mermaid
stateDiagram-v2
    [*] --> RequestReceived: Management API call
    RequestReceived --> JWTValid: authenticate
    JWTValid --> AdminCheck: verifyAdmin
    AdminCheck --> WriteCheck: ten === 'Admin'
    AdminCheck --> Denied: Non-admin tenant
    WriteCheck --> Authorized: wrt === 1
    WriteCheck --> ReadDenied: wrt === 0
    Authorized --> [*]: Handler executes
    Denied --> [*]: 401 Admin Only
    ReadDenied --> [*]: 401 Read Access Only
```

## Deployment Lifecycle State Machine (Operator)

The Ansible Operator reconciles `DatatruckerFlow` resources on a 1-minute period.

```mermaid
stateDiagram-v2
    [*] --> Observed: CR applied to cluster
    Observed --> Reconciling: Operator picks up change
    Reconciling --> ConfigMapCreated: Job JSON materialized
    ConfigMapCreated --> SecretBound: Server config secret referenced
    SecretBound --> Deploying: Deployment spec applied
    Deploying --> InitRunning: Init container migrate
    InitRunning --> PodStarting: Migrations complete
    PodStarting --> ReadinessProbe: Container started
    ReadinessProbe --> Ready: /healthcheck passes
    ReadinessProbe --> NotReady: Probe fails
    NotReady --> ReadinessProbe: Retry
    Ready --> Steady: Service endpoints active
    Steady --> Reconciling: CR spec changed
    Steady --> RollingUpdate: Image tag changed
    RollingUpdate --> InitRunning: New pod scheduled
```

### Deployment Strategy

Operator applies `RollingUpdate` with:
- `maxUnavailable: 1`
- `maxSurge: 1`
- `terminationGracePeriodSeconds: 62`

### Type-Specific Deployment Paths

```mermaid
stateDiagram-v2
    [*] --> TypeEval: DatatruckerFlow.Type
    TypeEval --> JobDeploy: Type=Job
    TypeEval --> MgmtDeploy: Type=Management
    TypeEval --> LoginDeploy: Type=Login
    TypeEval --> EndPlay: Unknown type

    JobDeploy --> APIOnly: trucker.yaml only
    MgmtDeploy --> APIAndUI: trucker.yaml + ui.yaml
    LoginDeploy --> APIOnly: login-config secret

    APIOnly --> [*]
    APIAndUI --> [*]
    LoginDeploy --> [*]
    EndPlay --> [*]: meta: end_play
```

## Credential Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Created: POST /api/v1/credentials
    Created --> Encrypted: Password AES-256-CBC encrypted
    Encrypted --> Stored: Row in credentials table
    Stored --> Cached: Optional Cred cache (if enabled)
    Stored --> InUse: Job references credentialname
    InUse --> Decrypted: Runtime decrypt for connector
    Decrypted --> InUse: Connection pool used
    Stored --> Updated: PUT /credentials/:name
    Updated --> Encrypted: Re-encrypt if password changed
    Stored --> Deleted: DELETE /credentials/:name
    Deleted --> [*]
```

## Audit Event State Machine

```mermaid
stateDiagram-v2
    [*] --> ResponseComplete: onResponse hook fires
    ResponseComplete --> RedactPassword: Scrub body.password
    RedactPassword --> DetermineDisplay: Check method + URL
    DetermineDisplay --> Hidden: GET requests
    DetermineDisplay --> Hidden: /api/v1/login
    DetermineDisplay --> Visible: Mutations
    Hidden --> InsertAudit: Write to audit table
    Visible --> InsertAudit: display=true
    InsertAudit --> [*]
```

Audit records index on `date`, `api`, `tenant`, and `hourminute` for dashboard queries via `/api/v1/ui/auditlogs`.

## Health Check State Machine

```mermaid
stateDiagram-v2
    [*] --> Probe: GET /healthcheck
    Probe --> DBQuery: SELECT from users LIMIT 1
    DBQuery --> Healthy: Connection OK
    DBQuery --> Unhealthy: DB unreachable
    Healthy --> Report: db=true, cache=true, dbinitialized
    Report --> [*]: 200 response
    Unhealthy --> [*]: Probe failure → K8s not ready
```

## Related Documentation

- [Component Interaction](./COMPONENT_INTERACTION.md)
- [Jobs API](../api/JOBS_API.md)
- [OpenShift Deployment](../build/OPENSHIFT_DEPLOYMENT.md)
