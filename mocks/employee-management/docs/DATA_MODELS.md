# Employee Management — Data Models

## Employee

### Input (Create)

```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@acmecorp.example",
  "department_id": "550e8400-e29b-41d4-a716-446655440001",
  "hire_date": "2024-03-15",
  "job_title": "Senior Software Engineer",
  "manager_id": "550e8400-e29b-41d4-a716-446655440010"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `first_name` | string | yes | 1–100 chars |
| `last_name` | string | yes | 1–100 chars |
| `email` | string | yes | Valid email, unique |
| `department_id` | uuid | yes | Must reference existing department |
| `hire_date` | date | yes | ISO 8601 (`YYYY-MM-DD`) |
| `job_title` | string | no | Max 150 chars |
| `manager_id` | uuid | no | Must reference active employee |

### Input (Update)

```json
{
  "first_name": "Jane",
  "last_name": "Smith-Jones",
  "email": "jane.smith-jones@acmecorp.example",
  "job_title": "Staff Engineer",
  "status": "active"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `employee_id` | uuid | yes (path) | Must exist, not soft-deleted |
| `first_name` | string | no | 1–100 chars |
| `last_name` | string | no | 1–100 chars |
| `email` | string | no | Valid email |
| `job_title` | string | no | Max 150 chars |
| `status` | enum | no | `active`, `inactive`, `terminated`, `on_leave` |

### Output

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440099",
  "employee_number": "EMP-M2K9X7A",
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@acmecorp.example",
  "status": "active",
  "department_code": "ENG",
  "department_name": "Engineering",
  "manager_name": "Bob Williams",
  "hire_date": "2024-03-15",
  "job_title": "Senior Software Engineer",
  "created_at": "2024-03-15T09:00:00Z",
  "updated_at": "2024-03-15T09:00:00Z"
}
```

## Department

### Output (List)

```json
{
  "departments": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "code": "ENG",
      "name": "Engineering",
      "cost_center": "CC-1001",
      "headcount": 142
    }
  ]
}
```

## Department Assignment

### Input

```json
{
  "employee_id": "660e8400-e29b-41d4-a716-446655440099",
  "department_id": "550e8400-e29b-41d4-a716-446655440002",
  "effective_date": "2024-06-01",
  "reason": "Organizational restructure — moved to Product"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `employee_id` | uuid | yes | Active employee |
| `department_id` | uuid | yes | Target department |
| `effective_date` | date | no | Defaults to today |
| `reason` | string | no | Max 500 chars |

### Output

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440050",
  "employee_id": "660e8400-e29b-41d4-a716-446655440099",
  "department_id": "550e8400-e29b-41d4-a716-446655440002",
  "effective_date": "2024-06-01",
  "reason": "Organizational restructure — moved to Product",
  "assigned_by": "hr.admin",
  "created_at": "2024-05-28T14:30:00Z"
}
```

## List Employees Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | enum | all | Filter by employee status |
| `department_id` | uuid | — | Filter by department |
| `limit` | integer | 50 | Page size (1–200) |
| `offset` | integer | 0 | Pagination offset |

## Error Responses

```json
{
  "error": "validation_failed",
  "message": "email must be a valid email address",
  "statusCode": 400
}
```

| HTTP Status | Error Code | Scenario |
|-------------|------------|----------|
| 400 | `validation_failed` | Schema validation failure |
| 401 | `unauthorized` | Missing or invalid JWT |
| 403 | `forbidden` | Insufficient role permissions |
| 404 | `not_found` | Employee or department not found |
| 409 | `conflict` | Duplicate email or assignment lock held |
| 423 | `locked` | Concurrent department assignment in progress |

## Audit Export

### Input

```json
{
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z"
}
```

### Output

SFTP upload confirmation:

```json
{
  "filename": "employee_audit_2024.csv",
  "remote_path": "/audit-exports/employee_audit_2024.csv",
  "record_count": 1847,
  "uploaded_at": "2025-01-02T08:00:00Z"
}
```
