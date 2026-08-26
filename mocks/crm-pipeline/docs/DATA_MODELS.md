# CRM Pipeline — Data Models

## Lead

### Input (Create / Ingest)

```json
{
  "company": "Acme Industries",
  "contact_name": "John Doe",
  "email": "john.doe@acmeind.example",
  "phone": "+1-555-0100",
  "source": "website",
  "metadata": {
    "company_size": 750,
    "annual_revenue": 50000000,
    "industry": "manufacturing",
    "budget_confirmed": true
  }
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `company` | string | yes | 1–200 chars |
| `contact_name` | string | yes | 1–150 chars |
| `email` | string | yes | Valid email |
| `phone` | string | no | E.164-ish pattern |
| `source` | enum | yes | `website`, `referral`, `trade_show`, `cold_outreach`, `partner`, `inbound_call` |
| `metadata` | object | no | Scoring signals |

### Output

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440100",
  "company": "Acme Industries",
  "contact_name": "John Doe",
  "email": "john.doe@acmeind.example",
  "phone": "+1-555-0100",
  "source": "website",
  "score": 65,
  "stage": "nurturing",
  "estimated_value": null,
  "owner_id": null,
  "score_breakdown": {
    "company_size": 20,
    "budget_confirmed": 25,
    "source": 0,
    "industry": 0,
    "base": 20
  },
  "created_at": "2025-01-10T14:00:00Z"
}
```

## Lead Scoring

### Input

```json
{
  "signals": {
    "email_opened": true,
    "demo_requested": true,
    "pricing_page_visit": true,
    "decision_maker": false
  }
}
```

### Output

```json
{
  "lead_id": "880e8400-e29b-41d4-a716-446655440100",
  "score": 85,
  "previous_score": 65,
  "qualified": true
}
```

## Pipeline Stage Advancement

### Input

```json
{
  "stage": "proposal",
  "reason": "Completed discovery call; sending SOW"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `stage` | enum | yes | Valid pipeline stage |
| `reason` | string | no | Max 500 chars |

### Output

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440100",
  "stage": "proposal",
  "stage_changed_at": "2025-01-15T10:30:00Z",
  "stage_change_reason": "Completed discovery call; sending SOW",
  "score": 85
}
```

## Pipeline Summary

### Output

```json
{
  "pipeline": [
    { "stage": "new", "count": 45, "avg_score": 22.3, "total_value": 0 },
    { "stage": "nurturing", "count": 128, "avg_score": 52.1, "total_value": 640000 },
    { "stage": "qualified", "count": 34, "avg_score": 78.5, "total_value": 1700000 },
    { "stage": "proposal", "count": 12, "avg_score": 82.0, "total_value": 960000 },
    { "stage": "negotiation", "count": 5, "avg_score": 88.2, "total_value": 750000 },
    { "stage": "closed_won", "count": 8, "avg_score": 91.0, "total_value": 2400000 }
  ]
}
```

## Webhook Registration

### Input

```json
{
  "url": "http://webhook-receiver:8080/webhook",
  "events": ["stage_changed", "lead_qualified", "deal_closed"],
  "secret": "whsec_test_secret_key_32chars"
}
```

### Output

```json
{
  "id": "990e8400-e29b-41d4-a716-446655440200",
  "url": "http://webhook-receiver:8080/webhook",
  "events": ["stage_changed", "lead_qualified", "deal_closed"],
  "active": true,
  "created_at": "2025-01-10T14:00:00Z"
}
```

## Webhook Payload (Outbound)

```json
{
  "event": "stage_changed",
  "data": {
    "lead_id": "880e8400-e29b-41d4-a716-446655440100",
    "company": "Acme Industries",
    "from_stage": "qualified",
    "to_stage": "proposal"
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

Headers: `X-CRM-Signature: sha256=<hmac_hex>`

## Error Responses

| HTTP Status | Error | Scenario |
|-------------|-------|----------|
| 400 | `validation_failed` | Invalid lead data or stage |
| 401 | `unauthorized` | Missing JWT |
| 403 | `forbidden` | Rep accessing another rep's lead |
| 404 | `not_found` | Lead ID not found |
| 409 | `invalid_transition` | Backward stage move blocked |
| 422 | `score_too_low` | Stage requires higher score |
