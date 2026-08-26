# Fintech KYC Onboarding — Architecture

## Overview
Multi-step KYC onboarding with identity verification workflows.

## Component Diagram

```mermaid
flowchart LR
  Client[Client / API Consumer] --> API[DataTrucker API]
  API --> KC[Keycloak IAM]
  API --> PG[(PostgreSQL)]
  API --> RD[(Redis)]
  API --> Plugins[Job Plugins]
```

## Data Flow
1. Client authenticates via Keycloak OAuth2
2. DataTrucker validates JWT and RBAC roles
3. Job pipeline executes declarative workflow
4. Results persisted and/or streamed to downstream systems

## Builder
Gaurav Shankar <gauravshankar.can@gmail.com>
