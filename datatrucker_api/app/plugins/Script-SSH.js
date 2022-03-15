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

const fp = require('fastify-plugin');

module.exports = fp(async (f, opts, done) => {
      // eslint-disable-next-line no-unused-vars
      async function handler(request, reply) {
            const config = request.template;
            const command = config.script;
            const creds = await f.ResourceCreds(request.user, request.template);
            if (typeof creds === 'undefined') {
                  // eslint-disable-next-line no-throw-literal
                  throw 'Credential issue';
            }
            

            const connection = await f.SSHConnector(creds);
            

            if (typeof request.datacontent.args === 'undefined') {
                  request.datacontent.args = [];
            }
            if (typeof request.datacontent.args === 'string') {
                  request.datacontent.args = request.datacontent.args.split(',');
            }

            const result = await connection.exec(command, request.datacontent.args, {
                  stream: 'both'
            });
            return result;
      }

      f.decorate('Script-SSH', handler);
      done();
});
