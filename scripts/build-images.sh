#!/usr/bin/env bash
# Build and push DataTrucker images to Quay.io
# Usage: QUAY_TOKEN=<token> ./scripts/build-images.sh [version]
set -euo pipefail

VERSION="${1:-2.1.0}"
QUAY_ORG="datatrucker"
REGISTRY="quay.io/${QUAY_ORG}"

if [[ -z "${QUAY_TOKEN:-}" ]]; then
  echo "ERROR: Set QUAY_TOKEN environment variable (do not commit credentials)"
  exit 1
fi

echo "Logging into Quay.io..."
echo "${QUAY_TOKEN}" | podman login quay.io -u "${QUAY_ORG}" --password-stdin

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

build_and_push() {
  local name="$1"
  local context="$2"
  local dockerfile="$3"
  local image="${REGISTRY}/${name}:${VERSION}"
  local image_latest="${REGISTRY}/${name}:latest"

  echo "Building ${image}..."
  podman build -f "${dockerfile}" -t "${image}" -t "${image_latest}" "${context}"
  podman push "${image}"
  podman push "${image_latest}"
  echo "Pushed ${image}"
}

build_and_push "datatrucker-api" "${ROOT}/datatrucker_api" "${ROOT}/datatrucker_api/Dockerfile_API"
build_and_push "datatrucker-ui" "${ROOT}/datatrucker_ui" "${ROOT}/datatrucker_ui/Dockerfile_UI"
build_and_push "datatrucker-operator" "${ROOT}/datatrucker_operator" "${ROOT}/datatrucker_operator/Dockerfile"
build_and_push "datatrucker-operator-bundle" "${ROOT}/datatrucker_operator" "${ROOT}/datatrucker_operator/bundle.Dockerfile"

echo "All images built and pushed for version ${VERSION}"
