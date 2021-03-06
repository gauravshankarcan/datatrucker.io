#!/bin/bash

cd chart
helm upgrade --install trucker .  --namespace=trucker --create-namespace 
cd ..

cp sshprivate.key ../datatrucker_api/app/keys/sshprivate.key 
cp sshprivate1.key ../datatrucker_api/app/keys/sshprivate1.key 

echo "creating temp space"
mkdir -p /tmp/trucker
touch /tmp/trucker/sample.log