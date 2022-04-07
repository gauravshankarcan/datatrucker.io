#!/bin/bash

#perform cleanup
ids=$(docker ps -a -q)
for id in $ids
do
 docker stop $id && docker rm $id 
done
docker volume prune -f
#end cleanup


### Primary
#docker volume create primary-pgdata
#docker run --restart=always  -p 5432:5432 -d --network-alias=primary --name=primary  -v primary-pgdata:/pgdata  -e MAX_CONNECTIONS=800 -e PG_MODE=primary  -e PG_USER=testuser  -e PG_PASSWORD=password  -e PG_DATABASE=userdb  -e PG_PRIMARY_USER=primaryuser -e PG_PRIMARY_PORT=5432  -e PG_PRIMARY_PASSWORD=password  -e PG_ROOT_PASSWORD=password  -e PGHOST=/tmp  --name=primary  --hostname=primary  docker.io/crunchydata/crunchy-postgres:centos7-12.1-4.2.1


###MSSQL
#docker volume create mssql
#docker run --restart=always  -p 1433:1433 -d --network-alias=MSSQL --name MSSQL  -v mssql:/var/opt/mssql/data -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=SpikePrototype2016!" mcr.microsoft.com/mssql/server:2017-CU19-ubuntu-16.04

###Oracle
docker volume create oracle
docker run --restart=always  -p 1521:1521 -d --network-alias=Oracle --name Oracle  -v oracle:/ORCL -it docker.io/store/oracle/database-enterprise:12.2.0.1 


### my and maria 
#docker run --restart=always  -p 3306:3306 -d --network-alias=mysql --name mysql  -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=primary  -e MYSQL_USER=sa -e MYSQL_PASSWORD=password docker.io/mysql:latest  --default-authentication-plugin=mysql_native_password
#docker run --restart=always  -p 3307:3306 -d --network-alias=maria --name maria  -e MARIADB_ROOT_PASSWORD=password -e MARIADB_DATABASE=primary  -e MARIADB_USER=sa  -e MARIADB_PASSWORD=mysql docker.io/mariadb:latest  --default-authentication-plugin=mysql_native_password

### redis
#docker run --restart=always  -p 6379:6379 -d --network-alias=redis --name redis  docker.io/redis
#docker run --name redispassword -d --network-alias=redispassword  -e REDIS_PASSWORD=password123 docker.io/bitnami/redis:latest

#### sftp
docker volume create sftppass
docker run --restart=always  -p 30023:22 -d --network-alias=sftp --name=sftp  -v sftppass:/home/foo docker.io/atmoz/sftp foo:pass:::upload

#### sftp sshkey
docker volume create sftpkey
dir=$(pwd)
#docker run --restart=always  -p 30024:22  -d --network-alias=sftp_private --name=sftp_private  -v sftpkey:/home/foo/  -v $dir/sshpublic.key:/home/foo/.ssh/keys/id_rsa.pub:ro  docker.io/atmoz/sftp foo::1001:0:/home/foo/upload


###ssh
#docker run --restart=always  -p 32768:22  -d --network-alias=sshd --name=sshd  -d docker.io/sickp/centos-sshd
#docker run --restart=always  -p 32768:22  -d --network-alias=sshd --name=sshd  -d 

##ssh privatekey
#docker run --restart=always  -p 2022:22 -d --network-alias=ssh_privatekey --name=ssh_privatekey  docker.io/jdeathe/centos-ssh:2.6.1
#docker run --restart=always  -p 2022:22 -d --network-alias=ssh_privatekey --name=ssh_privatekey  docker.io/rastasheep/ubuntu-sshd:14.04

### Kafka
#docker run --restart=always  -p 2181:2181 -d --network-alias=zookeeper-server --name zookeeper-server  -e ALLOW_ANONYMOUS_LOGIN=yes  docker.io/bitnami/zookeeper:latest
#docker run --restart=always  -p 9093:9093 -p 9092:9092 -d --network-alias=kafka  --hostname kafka --name kafka  -e KAFKA_ADVERTISED_LISTENERS=INSIDE://kafka:9093,OUTSIDE://localhost:9092 -e KAFKA_LISTENERS=INSIDE://0.0.0.0:9093,OUTSIDE://0.0.0.0:9092 -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=INSIDE:PLAINTEXT,OUTSIDE:PLAINTEXT -e KAFKA_ZOOKEEPER_CONNECT=zookeeper-server:2181 -e KAFKA_INTER_BROKER_LISTENER_NAME=INSIDE docker.io/wurstmeister/kafka:2.11-2.0.0

#docker run --restart=always -p 28080:8080 -p 28443:8443 -d --network-alias=keycloak  --hostname keycloak --name keycloak  -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin -e PROXY_ADDRESS_FORWARDING=true -e DB_ADDR=primary:5432 -e DB_DATABASE=userdb -e DB_USER=testuser -e DB_PASSWORD=password -e DB_VENDOR=postgres docker.io/jboss/keycloak


# Manual Steps:
#1) install oracle thin client
#2) runscript to oracle
#  alter session set "_ORACLE_SCRIPT"=true;
#  Create user john identified by abcd1234;  
#  grant create session to john;


#push a public key to ssh container
docker exec ssh_privatekey passwd -d root
docker cp sshpublic.key ssh_privatekey:/root/.ssh/authorized_keys
docker exec ssh_privatekey chown root:root /root/.ssh/authorized_keys

#add key to the keys folder
cp sshprivate.key ../datatrucker_api/app/keys/sshprivate.key 

#create a tmp folder for sftp
echo "creating temp space"
mkdir -p /tmp/trucker
touch /tmp/trucker/sample.log
