#!/bin/bash

cd chart
helm upgrade --install trucker .  --namespace=trucker --create-namespace 
cd ..


echo "creating temp space"
mkdir -p /tmp/trucker
touch /tmp/trucker/sample.log