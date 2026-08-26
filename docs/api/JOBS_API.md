# Jobs API Reference

## Execute a Job

```http
POST /api/v1/jobs/{job_name}
Authorization: Bearer <token>
Content-Type: application/json

{
  "field": "value"
}
```

## List Jobs

```http
GET /api/v1/jobs
Authorization: Bearer <token>
```

## Job Definition Schema

Jobs are defined declaratively in `DatatruckerFlow` CRs or pipeline YAML:

```yaml
JobDefinitions:
  - name: my-job
    type: Util-Echo
    tenant: Admin
    restmethod: POST
    path: /api/v1/custom
    validations:
      type: object
      properties:
        input:
          type: string
```

## Builder

Gaurav Shankar <gauravshankar.can@gmail.com>
