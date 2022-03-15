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

async function intialize(request, reply) {

            this.log.debug('Crypt admin user');
            const crpyt = this.saltHashPassword(request.body.username + request.body.password);
            this.log.debug('Creating admin user');
            await this.knex('users').insert({
                  username: request.body.username,
                  password: crpyt.passwordHash,
                  salt: crpyt.salt,
                  enabled: true,
                  base: true
            });
            this.log.debug('Admin User added as local account');
            const mappingrows = await this.knex.select('users.id as userid', 'groups.id as groupid').from('users').innerJoin('groups', 'users.enabled', 'groups.enabled');
            this.log.debug('Admin User mapped to as Admin Tenant');
            await this.knex('user_mapping').insert({
                  userid: mappingrows[0].userid,
                  groupid: mappingrows[0].groupid,
                  enabled: true,
                  base: true
            });
            reply.code(201).send(reply.replyHandler('Admin user created', request.id));
}

async function isIntialized(request, reply) {
      const result = await this.knex.from('users').count('id', {as: 'CNT'});
      if (result[0].CNT < 1) {
            reply.send(reply.replyHandler({isIntialized: false}, request.id));
      } else {
            reply.send(reply.replyHandler({isIntialized: true}, request.id));
      }
}

async function corehealthcheck(request, reply) {
      const result = await this.knex.from('users').select('enabled').limit(1);
      const response = {};
      response.db = true;
      response.cache = true; // cant have come here without cache
      response.dbinitialized = false; // cant have come here without cache};
      if (result.length > 0) {
            response.db = true;
            response.cache = true; // cant have come here without cache
            response.dbinitialized = true; // cant have come here without cache
      }
      reply.send(reply.replyHandler(response, request.id));
}

exports.corehealthcheck = corehealthcheck;
exports.isIntialized = isIntialized;
exports.intialize = intialize;
