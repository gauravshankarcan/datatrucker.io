/*
* Copyright 2021 Datatrucker.io Inc , Ontario , Canada
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* 
*     http://www.apache.org/licenses/LICENSE-2.0
* 
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/ 

const appRoot = require('app-root-path');
const fs = require('fs');
const configdef = require('../../config/resource.config.json');

async function credentialsSearch(request, reply) {
      const query = this.knex.select('id', 'credentialname', 'hostname', 'username', 'type', 'database', 'port', 'filename', 'passwordisPrivateKey').from('credentials').where('tenant', request.user.payload.ten).limit(1000);

      if (typeof request.query.credentialname !== 'undefined') {
            query.andWhere('credentialname', request.query.credentialname);
      }
      if (typeof request.query.type !== 'undefined') {
            query.andWhere('type', request.query.type);
      }
      const credentials = await query;
      reply.send(reply.replyHandler(credentials, request.id));
}

async function credentialsCreate(request, reply) {
      let passwordisPrivateKey = false;
      if (typeof request.body.passwordisPrivateKey === 'boolean') {
            passwordisPrivateKey = request.body.passwordisPrivateKey;
      }
      if (typeof request.body.passwordisPrivateKey === 'string') {
            passwordisPrivateKey = request.body.passwordisPrivateKey === 'true';
      }
      let {password} = request.body;
      if (passwordisPrivateKey) {
            // eslint-disable-next-line global-require
            const path = `${appRoot}/${configdef.Templates.keys}/${password}`;
            password = fs.readFileSync(path);
      }

      if (typeof password !== 'undefined') {
            if (password.length < 3) {
                  password = null;
            }
      }

      await this.knex('credentials').insert({
            credentialname: request.body.credentialname,
            type: request.body.type,
            hostname: request.body.hostname,
            username: request.body.username,
            password: typeof password !== 'undefined' ? this.encrypt(`${request.body.username}|||-break-|||${password}`) : null,
            database: request.body.database,
            tenant: request.user.payload.ten,
            port: request.body.port,
            minpool: request.body.minpool,
            maxpool: request.body.maxpool,
            options: request.body.options,
            payloads: request.body.payloads,
            filename: request.body.filename,
            passwordisPrivateKey
      });

      reply.code(201).send(reply.replyHandler(`Credentials Created: ${request.body.credentialname}`, request.id));
}

async function credentialsUpdate(request, reply) {
      let passwordisPrivateKey = false;
      if (typeof request.body.passwordisPrivateKey !== 'undefined') {
            passwordisPrivateKey = request.body.passwordisPrivateKey;
      }
      if (typeof request.body.passwordisPrivateKey === 'string') {
            passwordisPrivateKey = request.body.passwordisPrivateKey === 'true';
      }
      let {password} = request.body;
      if (passwordisPrivateKey) {
            // eslint-disable-next-line global-require
            const path = `${appRoot}/${configdef.Templates.keys}/${password}`;
            password = fs.readFileSync(path);
      }

      await this.knex('credentials')
            .where({
                  credentialname: request.params.credentialname,
                  tenant: request.user.payload.ten,
                  type: request.body.type
            })
            .update({
                  hostname: request.body.hostname,
                  username: request.body.username,
                  password: this.encrypt(`${request.body.username}|||-break-|||${password}`),
                  database: request.body.database,
                  port: request.body.port,
                  minpool: request.body.minpool,
                  maxpool: request.body.maxpool,
                  options: request.body.options,
                  payloads: request.body.payloads,
                  filename: request.body.filename,
                  passwordisPrivateKey
            });
      reply.send(reply.replyHandler(`Credentials Updated: ${request.params.credentialname}`, request.id));
}

async function credentialsDel(request, reply) {

      await this.knex('credentials')
            .where({
                  credentialname: request.params.credentialname,
                  tenant: request.user.payload.ten
            })
            .del();
      reply.send(reply.replyHandler(`Credentials Deleted: ${request.params.credentialname}`, request.id));
}

exports.credentialsSearch = credentialsSearch;
exports.credentialsCreate = credentialsCreate;
exports.credentialsUpdate = credentialsUpdate;
exports.credentialsDel = credentialsDel;
