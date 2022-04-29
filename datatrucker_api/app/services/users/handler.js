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

async function Userlistings(request, reply) {
      const query = this.knex
            .select(
                  'user_mapping.id as id',
                  'users.username as username',
                  'groups.groupname as groupname',
                  'groups.tenantname as tenantname',
                  'groups.level as level',
                  'users.enabled as UserEnabled',
                  'groups.enabled as GroupEnabled',
                  'user_mapping.asset as MappingAsset'
            )
            .from('users')
            .innerJoin('user_mapping', 'user_mapping.userid', 'users.id')
            .innerJoin('groups', 'groups.id', 'user_mapping.groupid');

      if (typeof request.query.username !== 'undefined') {
            query.andWhere('users.username', request.query.username);
      }
      if (typeof request.query.groupname !== 'undefined') {
            query.andWhere('groups.groupname', request.query.groupname);
      }

      const rolesDRecords = await query;
      reply.send(reply.replyHandler(rolesDRecords, request.id));
}

async function UsermappingDelete(request, reply) {
      await this.knex('user_mapping').where({id: request.params.id, base: false}).del();
      reply.send(reply.replyHandler('User Mapping Deleted', request.id));
}

async function Usermapping(request, reply) {
      const userDRows = await this.knex.select('id').from('users').where({username: request.body.username});
      const groupsDRows = await this.knex.select('id').from('groups').where({groupname: request.body.groupname, type: 'local'});

      if (groupsDRows.length > 0 && userDRows.length > 0) {
            await this.knex('user_mapping').insert({
                  groupid: groupsDRows[0].id,
                  userid: userDRows[0].id,
                  enabled: true,
                  asset: request.body.asset
            });
            reply.code(201).send(reply.replyHandler(`User Mapping Added: ${request.body.username} into group ${request.body.groupname}`, request.id));
      } else {
            reply.send(reply.replyHandler('Username or Group doesnt exist', request.id));
      }
}

async function UsersDelete(request, reply) {
      await this.knex('users').where({username: request.params.username, base: false}).del();
      reply.send(reply.replyHandler(`User Deleted: ${request.params.username}`, request.id));
}

async function UsersUpdate(request, reply) {
      const crypto = this.saltHashPassword(request.params.username + request.body.password);

      await this.knex('users').where({username: request.params.username}).update({
            password: crypto.passwordHash,
            salt: crypto.salt,
            emailid: request.body.emailid,
            enabled: request.body.enabled,
            asset: request.body.asset,
            updated_at: this.knex.fn.now()
      });
      reply.send(reply.replyHandler(`User Updated: ${request.params.username}`, request.id));
}

async function Users(request, reply) {
      const crypto = this.saltHashPassword(request.body.username + request.body.password);

      await this.knex('users').insert({
            username: request.body.username,
            password: crypto.passwordHash,
            salt: crypto.salt,
            emailid: request.body.emailid,
            enabled: request.body.enabled,
            asset: request.body.asset
      });
      reply.code(201).send(reply.replyHandler(`User Created: ${request.body.username}`, request.id));
}

async function UserrolesSearch(request, reply) {
      const rolesDRecords = await this.knex
            .select('users.id as id', 'groups.groupname as groupname', 'groups.tenantname as tenantname', 'groups.level as level')
            .from('users')
            .innerJoin('user_mapping', 'user_mapping.userid', 'users.id')
            .innerJoin('groups', 'groups.id', 'user_mapping.groupid')
            .where({
                  'users.username': request.params.username,
                  'users.enabled': true,
                  'user_mapping.enabled': true,
                  'groups.enabled': true
            });

      const roles = {
            Tenant_Author: {},
            Tenants: {}
      };
      Object.keys(rolesDRecords).forEach((k) => {
            if (rolesDRecords[k].level === 'Tenant_Author') {
                  roles.Tenant_Author[rolesDRecords[k].tenantname] = true;
            }
            roles.Tenants[rolesDRecords[k].tenantname] = true;
      });

      reply.send(reply.replyHandler(roles, request.id));
}

async function UsersSearch(request, reply) {
      const query = this.knex.select('id', 'username', 'emailid', 'enabled', 'asset').from('users').limit(1000);

      if (typeof request.query.username !== 'undefined') {
            query.where('username', request.query.username);
      }
      const usernames = await query;
      reply.send(reply.replyHandler(usernames, request.id));
}

exports.UsersSearch = UsersSearch;
exports.UserrolesSearch = UserrolesSearch;
exports.Users = Users;
exports.UsersUpdate = UsersUpdate;
exports.UsersDelete = UsersDelete;
exports.Usermapping = Usermapping;
exports.UsermappingDelete = UsermappingDelete;
exports.Userlistings = Userlistings;
