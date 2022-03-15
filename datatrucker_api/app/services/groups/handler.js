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

async function GroupsSearch(request, reply) {
      const query = this.knex.select('id', 'groupname', 'level', 'tenantname', 'enabled', 'type', 'asset').from('groups').limit(1000);

      if (typeof request.query.groupname !== 'undefined') {
            query.where('groupname', request.query.groupname);
      }
      const groupname = await query;
      reply.send(reply.replyHandler(groupname, request.id));
}

async function Groups(request, reply) {
      await this.knex('groups').insert({
            groupname: request.body.groupname,
            level: request.body.level,
            tenantname: request.body.tenantname,
            enabled: request.body.enabled,
            type: request.body.type || 'local',
            asset: request.body.asset
      });
      reply.code(201).send(reply.replyHandler(`Group Created: ${request.body.groupname}`, request.id));
}

async function GroupsUpdate(request, reply) {
      await this.knex('groups')
            .where({groupname: request.params.groupname || ''})
            .update({
                  level: request.body.level,
                  tenantname: request.body.tenantname,
                  enabled: request.body.enabled,
                  updated_at: this.knex.fn.now(),
                  asset: request.body.asset
            });
      reply.send(reply.replyHandler(`Group Updated: ${request.params.groupname || ''}`, request.id));
}

async function GroupsDelete(request, reply) {
      await this.knex('groups').where({groupname: request.params.groupname, base: false}).del();
      reply.send(reply.replyHandler(`Group Deleted: ${request.params.groupname}`, request.id));
}

async function Tenants(request, reply) {
      const query = this.knex('groups').distinct('tenantname').orderBy('tenantname', 'asc').limit(100);

      if (typeof request.query.tenantname !== 'undefined') {
            query.where('tenantname', 'like', `%${request.query.tenantname}%`);
      }

      const tenantname = await query;
      reply.send(reply.replyHandler(tenantname, request.id));
}

exports.GroupsSearch = GroupsSearch;
exports.Groups = Groups;
exports.GroupsUpdate = GroupsUpdate;
exports.GroupsDelete = GroupsDelete;
exports.Tenants = Tenants;
