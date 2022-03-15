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
            const creds = await f.ResourceCreds(request.user, request.template);
            const redis = f.RedisConnector(creds);
            if (request.template.source_type === 'GET') {
                  const response = await redis.get(request.datacontent.key);
                  return response;
            }
            if (request.template.source_type === 'SET') {
                  let ttyl = 3600;
                  if (typeof request.datacontent.ttyl !== 'undefined') {
                        ttyl = request.datacontent.ttyl;
                  }

                  const response = await redis.set(request.datacontent.key, request.datacontent.value, ttyl);
                  return response;
            }
            return 'unsupported request';
      }

      f.decorate('IOT-Redis', handler);
      done();
});
