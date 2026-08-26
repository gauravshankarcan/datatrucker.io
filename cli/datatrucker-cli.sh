#!/usr/bin/env bash
# DataTrucker CLI — all operations via Kubernetes CRs (never config mounts)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NS="${NAMESPACE:-datatrucker}"
REGISTRY="${IMAGE_REGISTRY:-quay.io/datatrucker}"
TAG="${IMAGE_TAG:-2.1.0}"

usage() {
  cat <<EOF
DataTrucker CLI — CR-driven platform management

Usage: datatrucker-cli <command> [options]

Commands:
  init-admin          Apply DatatruckerInit CR to bootstrap admin
  create-tenant       Apply DatatruckerTenant CR
  load-mocks          Deploy all mock use cases via DatatruckerMock CRs (Helm)
  deploy-platform     Helm install/upgrade platform chart
  full-reset          Uninstall all releases, redeploy platform + mocks
  test                Run platform sanity tests
  status              Show CR and pod status

Options:
  -n, --namespace NS   Kubernetes namespace (default: datatrucker)
  --tenant-id ID       Tenant ID for create-tenant
  --admin-user USER    Admin username for init-admin
  --admin-pass PASS    Admin password for init-admin

Examples:
  datatrucker-cli full-reset
  datatrucker-cli init-admin --admin-user admin --admin-pass secret
  datatrucker-cli create-tenant --tenant-id acme-corp
  datatrucker-cli load-mocks
EOF
}

cmd_init_admin() {
  local user="${ADMIN_USER:-admin}"
  local pass="${ADMIN_PASS:-changeme}"
  local email="${ADMIN_EMAIL:-admin@datatrucker.io}"
  oc apply -f - <<EOF
apiVersion: datatrucker.datatrucker.io/v1
kind: DatatruckerInit
metadata:
  name: cli-init
  namespace: ${NS}
spec:
  configRef: platform-config
  adminUsername: ${user}
  adminEmail: ${email}
  adminPassword: ${pass}
  initializeDb: true
EOF
  echo "DatatruckerInit CR applied"
}

cmd_create_tenant() {
  local tid="${TENANT_ID:?Set --tenant-id}"
  oc apply -f - <<EOF
apiVersion: datatrucker.datatrucker.io/v1
kind: DatatruckerTenant
metadata:
  name: ${tid}
  namespace: ${NS}
spec:
  tenantId: ${tid}
  orgName: ${tid}
  plan: professional
  adminEmail: admin@${tid}.example.com
  createNamespace: false
  roles:
    - name: admin
      permissions: [read, write, delete, deploy]
    - name: developer
      permissions: [read, write]
EOF
  echo "DatatruckerTenant CR applied for ${tid}"
}

cmd_deploy_platform() {
  helm upgrade --install datatrucker-platform "${ROOT}/helm/datatrucker-platform" \
    -n "${NS}" --create-namespace \
    --set imageRegistry="${REGISTRY:-quay.io/datatrucker}" \
    --set imageTag="${TAG:-2.1.0}"
}

cmd_load_mocks() {
  helm upgrade --install datatrucker-mocks "${ROOT}/helm/datatrucker-mocks" \
    -n "${NS}" \
    --set imageRegistry="${REGISTRY}" \
    --set imageTag="${TAG}"
}

cmd_full_reset() {
  echo "=== Full reset: removing workloads in ${NS} ==="
  helm uninstall datatrucker-mocks -n "${NS}" 2>/dev/null || true
  helm uninstall datatrucker-platform -n "${NS}" 2>/dev/null || true
  oc delete namespace "${NS}" --ignore-not-found --wait=true 2>/dev/null || true
  oc delete namespace datatrucker-operator-system --ignore-not-found --wait=true 2>/dev/null || true
  sleep 5

  echo "=== Applying CRDs ==="
  oc apply -f "${ROOT}/datatrucker_operator/config/crd/bases/"

  echo "=== Redeploying platform (operator + infra + CRs) ==="
  cmd_deploy_platform
  echo "Waiting for operator and infrastructure..."
  sleep 45

  echo "=== Loading mocks ==="
  cmd_load_mocks
  echo "Waiting for mock reconciliation..."
  sleep 30

  echo "=== Running init-admin ==="
  cmd_init_admin
  echo "Full reset complete"
}

cmd_test() {
  export HOST="${API_URL:-http://datatrucker-api-${NS}.apps-crc.testing}"
  bash "${ROOT}/scripts/run-tests.sh"
}

cmd_status() {
  echo "=== CRs ==="
  oc get datatruckerconfig,datatruckerflow,datatruckerinit,datatruckertenant,datatruckermock -n "${NS}" 2>/dev/null || true
  echo "=== Pods ==="
  oc get pods -n "${NS}"
  echo "=== Routes ==="
  oc get routes -n "${NS}" 2>/dev/null || true
}

# Parse args
CMD="${1:-}"
shift || true
ADMIN_USER=""
ADMIN_PASS=""
TENANT_ID=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--namespace) NS="$2"; shift 2 ;;
    --tenant-id) TENANT_ID="$2"; shift 2 ;;
    --admin-user) ADMIN_USER="$2"; shift 2 ;;
    --admin-pass) ADMIN_PASS="$2"; shift 2 ;;
    --admin-email) ADMIN_EMAIL="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1"; usage; exit 1 ;;
  esac
done

case "${CMD}" in
  init-admin) cmd_init_admin ;;
  create-tenant) cmd_create_tenant ;;
  load-mocks) cmd_load_mocks ;;
  deploy-platform) cmd_deploy_platform ;;
  full-reset) cmd_full_reset ;;
  test) cmd_test ;;
  status) cmd_status ;;
  "") usage; exit 1 ;;
  *) echo "Unknown command: ${CMD}"; usage; exit 1 ;;
esac
