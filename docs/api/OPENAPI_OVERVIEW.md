# API Reference Overview

## Base URL

```
http://localhost:8080/api/v1
```

## Core Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/statuschecks/healthcheck` | Platform health |
| GET | `/statuschecks/initialization` | Init status |
| POST | `/login` | Local authentication |
| GET | `/jobs` | List job definitions |
| POST | `/jobs/{name}` | Execute job |
| GET | `/resources` | List resources |
| POST | `/credentials` | Manage credentials |
| GET | `/users` | User management |
| GET | `/groups` | Group management |
| GET | `/ui/definitions` | UI form definitions |

## Response Envelope

```json
{
  "reqCompleted": true,
  "reqID": "550e8400-e29b-41d4-a716-446655440000",
  "serverID": "ServerHandler",
  "date": "2026-08-25T12:00:00.000Z",
  "data": {}
}
```

## Error Format

```json
{
  "reqCompleted": false,
  "error": "Validation failed",
  "statusCode": 400
}
```

## Builder

Gaurav Shankar <gauravshankar.can@gmail.com>
