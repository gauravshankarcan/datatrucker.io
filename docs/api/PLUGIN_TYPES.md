# Plugin Types Reference

Every job `type` in a `DatatruckerFlow` CR `JobDefinitions` maps to a plugin. Configure jobs entirely in the CR — never via mounted config files.

Gaurav Shankar

## CR Example Structure

```yaml
apiVersion: datatrucker.datatrucker.io/v1
kind: DatatruckerFlow
metadata:
  name: my-flow
spec:
  Type: Job
  Replicas: 1
  DatatruckerConfig: platform-config
  JobDefinitions:
    - name: my-job
      type: Util-Echo          # <-- plugin type
      tenant: Admin
      restmethod: GET
      validations:
        type: object
        properties: {}
  API:
    Image:
      repository: quay.io/datatrucker
      imageName: datatrucker-api
      tagName: "2.1.0"
```

---

## Util-Echo

Passthrough / health check. Returns request payload.

```yaml
- name: healthcheck
  type: Util-Echo
  tenant: Admin
  restmethod: GET
```

---

## Util-Fuzzy

Fuzzy string matching via Fuse.js.

```yaml
- name: fuzzy-search
  type: Util-Fuzzy
  tenant: Admin
  restmethod: POST
  validations:
    type: object
    required: [query, corpus]
    properties:
      query:
        type: string
      corpus:
        type: array
        items:
          type: string
```

---

## Util-Sentiment

Sentiment analysis on text input.

```yaml
- name: analyze-sentiment
  type: Util-Sentiment
  tenant: Admin
  restmethod: POST
  validations:
    type: object
    required: [text]
    properties:
      text:
        type: string
```

---

## DB-Postgres / DB-Mysql / DB-Mariadb / DB-Mssql / DB-Oracle / DB-Sqllite

Database query jobs. Requires `credentialname` referencing a stored credential.

```yaml
- name: list-records
  type: DB-Postgres
  tenant: Data
  credentialname: primary-db
  restmethod: GET
  script: "SELECT id, name FROM users LIMIT 50;"
```

---

## Script-JS

Custom JavaScript business logic with `context` object.

```yaml
- name: transform
  type: Script-JS
  tenant: Admin
  restmethod: POST
  script: |
    const { value } = context.body;
    return { doubled: value * 2, processedAt: new Date().toISOString() };
  validations:
    type: object
    required: [value]
    properties:
      value:
        type: number
```

---

## Script-SSH

Execute commands on remote host via SSH.

```yaml
- name: remote-cmd
  type: Script-SSH
  tenant: Ops
  credentialname: ssh-host
  restmethod: POST
  script: "uptime"
```

---

## Script-Shell

Local shell command execution.

```yaml
- name: shell-echo
  type: Script-Shell
  tenant: Ops
  restmethod: POST
  script: "echo hello"
```

---

## IOT-Redis

Redis pub/sub, caching, distributed locking.

```yaml
- name: cache-get
  type: IOT-Redis
  tenant: IoT
  credentialname: redis-cache
  restmethod: GET
```

---

## IOT-Kafka-Producer

Publish events to Kafka topic.

```yaml
- name: publish-event
  type: IOT-Kafka-Producer
  tenant: Events
  credentialname: kafka-cluster
  restmethod: POST
  validations:
    type: object
    required: [topic, payload]
```

---

## IOT-Proxy

HTTP proxy to external endpoints.

```yaml
- name: proxy-call
  type: IOT-Proxy
  tenant: Integration
  restmethod: POST
```

---

## File-SFTP

SFTP file transfer operations.

```yaml
- name: upload-file
  type: File-SFTP
  tenant: Files
  credentialname: sftp-server
  restmethod: POST
```

---

## Chain

Chain multiple job steps sequentially.

```yaml
- name: pipeline-chain
  type: Chain
  tenant: Admin
  restmethod: POST
```

---

## Block

Conditional blocking / gate logic.

```yaml
- name: gate-check
  type: Block
  tenant: Admin
  restmethod: POST
```

---

## Negative Test Patterns

```yaml
# Missing required validation field → 400
- name: bad-request
  type: Util-Echo
  tenant: Admin
  restmethod: POST
  validations:
    type: object
    required: [required_field]
```

Unauthorized access: call API without Bearer token → 401/403.
