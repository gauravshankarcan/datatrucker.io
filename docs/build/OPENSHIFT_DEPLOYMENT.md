# OpenShift Deployment

## CRC / Local OpenShift

```bash
eval $(crc oc-env)
oc login -u developer https://api.crc.testing:6443
./scripts/deploy-openshift.sh datatrucker 2.1.0
```

## Operator Installation

```bash
oc apply -f datatrucker_operator/config/crd/
oc apply -f datatrucker_operator/config/rbac/
oc apply -f datatrucker_operator/config/manager/
```

## Create a Flow

```bash
oc apply -f datatrucker_operator/config/samples/datatrucker_v1_datatruckerflow.yaml
```

## Builder

Gaurav Shankar <gauravshankar.can@gmail.com>
