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


const NodeCache = require('node-cache');
const fp = require('fastify-plugin');
const appRoot = require('app-root-path');

const fs = require('fs').promises;
const configdef = require('../config/resource.config.json');

const ResourceConfig = new NodeCache({useClones: false, stdTTL: configdef.Cache.ResourceFlush});
const ResourceCreds = new NodeCache({useClones: false, stdTTL: configdef.Cache.CredsFlush});
const CredHandle = new NodeCache({useClones: false, stdTTL: configdef.Cache.CredsFlush});
const AJVHandle = new NodeCache({useClones: false, stdTTL: configdef.Cache.ResourceFlush});

module.exports = fp((f, opts, done) => {
      async function ResourceCredsfunc(user, template) {
            let creds;
            if (ResourceCreds.has(`${user.payload.ten}-${template.credentialname}`)) {
                  creds = ResourceCreds.get(`${user.payload.ten}-${template.credentialname}`);
            } else {
                  creds = await f.knex('credentials').select('tenant', 'credentialname', 'type', 'filename', 'hostname', 'username', 'password', 'database', 'port', 'minpool', 'maxpool', 'passwordisPrivateKey', 'options').where({
                        tenant: user.payload.ten,
                        credentialname: template.credentialname,
                        type: template.type
                  });
                  if (configdef.Cache.Creds) {
                        ResourceCreds.set(`${user.payload.ten}-${template.credentialname}`, creds);
                  }
            }
            return creds[0];
      }

      async function ResourceConfigfunc(user, stub, method) {
            const filename = `${appRoot}/${configdef.Templates.resourcedefinitions}/${method}-${
                  user.payload.ten
                  // request.user.data.roles.tenant +
            }-${stub}.json`;
            if (ResourceConfig.has(filename)) {
                  return ResourceConfig.get(filename);
            }
            const rawdata = await fs.readFile(filename, 'utf8');
            const data = JSON.parse(rawdata);
            if (configdef.Cache.Resource) {
                  ResourceConfig.set(filename, data);
            }
            return data;
      }

      function flushHandler() {
            try {
                  ResourceConfig.flushAll();
                  ResourceCreds.flushAll();
                  CredHandle.flushAll();
                  AJVHandle.flushAll();
                  return 'cache flushed';
            } catch (e) {
                  f.log.error(e);
                  return false;
            }
      }

      f.decorate('flushHandler', flushHandler);
      f.decorate('ResourceConfig', ResourceConfigfunc);
      f.decorate('ResourceCreds', ResourceCredsfunc);
      f.decorate('CredHandler', CredHandle);
      f.decorate('AJVHandle', AJVHandle);
      done();
});
