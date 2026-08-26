# Voter Registration System — Data Models

## Request/Response Schemas

All endpoints follow DataTrucker standard envelope:
```json
{
  "reqCompleted": true,
  "reqID": "uuid",
  "serverID": "ServerHandler",
  "date": "ISO-8601",
  "data": {}
}
```

## Validation
Input payloads validated via AJV schemas defined in `datatrucker-pipeline.yaml`.

## Error Responses
| Code | Meaning |
|------|---------|
| 400 | Validation failure |
| 401 | Missing/invalid token |
| 403 | RBAC denial |
| 404 | Resource not found |
| 422 | Business rule violation |
