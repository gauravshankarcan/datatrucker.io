#!/usr/bin/env bash
# Deploy DataTrucker to OpenShift (CRC/local)
# Usage: ./scripts/deploy-openshift.sh [namespace] [version]
set -euo pipefail

NAMESPACE="${1:-datatrucker}"
VERSION="${2:-2.1.0}"
REGISTRY="${3:-image-registry.openshift-image-registry.svc:5000/datatrucker}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Creating namespace ${NAMESPACE}..."
oc new-project "${NAMESPACE}" --display-name="DataTrucker" 2>/dev/null || oc project "${NAMESPACE}"

echo "Deploying PostgreSQL..."
oc apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
type: Opaque
stringData:
  POSTGRES_USER: datatrucker
  POSTGRES_PASSWORD: datatrucker
  POSTGRES_DB: datatrucker
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  labels:
    app: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: docker.io/library/postgres:16-alpine
        ports:
        - containerPort: 5432
        envFrom:
        - secretRef:
            name: postgres-secret
        resources:
          requests:
            memory: 256Mi
            cpu: 100m
          limits:
            memory: 512Mi
            cpu: 500m
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
EOF

echo "Deploying Redis..."
oc apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  labels:
    app: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: docker.io/library/redis:7-alpine
        ports:
        - containerPort: 6379
        resources:
          requests:
            memory: 64Mi
            cpu: 50m
          limits:
            memory: 128Mi
            cpu: 200m
---
apiVersion: v1
kind: Service
metadata:
  name: redis
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
EOF

echo "Deploying DataTrucker API..."
oc apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: datatrucker-api
  labels:
    app: datatrucker-api
spec:
  replicas: 1
  selector:
    matchLabels:
      app: datatrucker-api
  template:
    metadata:
      labels:
        app: datatrucker-api
    spec:
      containers:
      - name: api
        image: ${REGISTRY}/datatrucker-api:${VERSION}
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
        env:
        - name: DB_HOST
          value: postgres
        - name: DB_PORT
          value: "5432"
        - name: DB_USER
          value: datatrucker
        - name: DB_PASSWORD
          value: datatrucker
        - name: DB_NAME
          value: datatrucker
        - name: REDIS_HOST
          value: redis
        - name: REDIS_PORT
          value: "6379"
        resources:
          requests:
            memory: 256Mi
            cpu: 250m
          limits:
            memory: 512Mi
            cpu: 500m
        readinessProbe:
          httpGet:
            path: /api/v1/statuschecks/healthcheck
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: datatrucker-api
spec:
  selector:
    app: datatrucker-api
  ports:
  - port: 8080
    targetPort: 8080
---
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: datatrucker-api
spec:
  to:
    kind: Service
    name: datatrucker-api
  port:
    targetPort: 8080
EOF

echo "Deploying DataTrucker UI..."
oc apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: datatrucker-ui
  labels:
    app: datatrucker-ui
spec:
  replicas: 1
  selector:
    matchLabels:
      app: datatrucker-ui
  template:
    metadata:
      labels:
        app: datatrucker-ui
    spec:
      containers:
      - name: ui
        image: ${REGISTRY}/datatrucker-ui:${VERSION}
        imagePullPolicy: Always
        ports:
        - containerPort: 9080
        env:
        - name: API_URL
          value: http://datatrucker-api:8080
        resources:
          requests:
            memory: 128Mi
            cpu: 100m
          limits:
            memory: 256Mi
            cpu: 300m
---
apiVersion: v1
kind: Service
metadata:
  name: datatrucker-ui
spec:
  selector:
    app: datatrucker-ui
  ports:
  - port: 9080
    targetPort: 9080
---
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: datatrucker-ui
spec:
  to:
    kind: Service
    name: datatrucker-ui
  port:
    targetPort: 9080
EOF

echo "Deployment complete. Routes:"
oc get routes -n "${NAMESPACE}"
