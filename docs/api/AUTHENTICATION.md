# Authentication Guide

## Keycloak Integration

DataTrucker integrates with Keycloak for enterprise IAM:

1. Configure realm in `crypto.config.json`
2. Set `keycloak: true` in `server.config.json`
3. Import realm JSON from `deploy/keycloak/realm-export.json`

## Token Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as DataTrucker UI
    participant KC as Keycloak
    participant API as DataTrucker API

    U->>UI: Login
    UI->>KC: OAuth2 Password Grant
    KC-->>UI: Access Token + Refresh Token
    UI->>API: Request + Bearer Token
    API->>KC: Verify JWT Signature
    API-->>UI: Authorized Response
```

## Local JWT (Development)

For local development without Keycloak, use local RS256 keys in `app/config/`.

## Builder

Gaurav Shankar
