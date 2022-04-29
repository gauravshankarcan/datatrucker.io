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

const schemaGroupname = {type: 'string', minimum: 4, pattern: '^[A-Za-z0-9]+$'}
const schemaTenant = {type: 'string', pattern: '^[A-Za-z0-9]+$', minimum: 4}
const schemaLoginType = {type: 'string', enum: ['local','keycloak']}
const schemaRBACLevel = {type: 'string', enum: ['Tenant_Reader', 'Tenant_Author']}

const groupsSearch = {
      querystring: {
            groupname: schemaGroupname
      }
};

const groups = {
      body: {
            type: 'object',
            required: ['groupname', 'level', 'tenantname', 'enabled'],
            properties: {
                  groupname: schemaGroupname,
                  level: schemaRBACLevel,
                  tenantname: schemaTenant,
                  enabled: {type: 'boolean'},
                  type: schemaLoginType
            }
      }
};

const groupsUpdate = {
      params: {
            type: 'object',
            properties: {
                  groupname: schemaGroupname
            }
      },
      body: {
            type: 'object',
            required: ['level', 'tenantname', 'enabled','type'],
            properties: {
                  level: schemaRBACLevel,
                  tenantname: schemaTenant,
                  enabled: {type: 'boolean'},
                  type: schemaLoginType
            }
      }
};

const groupsDelete = {
      params: {
            type: 'object',
            properties: {
                  groupname: schemaGroupname
            }
      }
};

const tenants = {
      querystring: {
            groupname: schemaGroupname
      }
};

exports.groupsSearch = groupsSearch;
exports.groups = groups;
exports.groupsUpdate = groupsUpdate;
exports.groupsDelete = groupsDelete;
exports.tenants = tenants;
