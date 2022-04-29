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
const redis = require('redis');

module.exports = fp((f, opts, done) => {
      function handler(creds) {
            if (f.CredHandler.has(`${creds.tenant}-${creds.credentialname}`)) {
                  return f.CredHandler.get(`${creds.tenant}-${creds.credentialname}`);
            }

            const client = redis.createClient(creds.port, creds.hostname);

            // return only functions need
            const returnclient = {};

            // define a client get
            returnclient.get = (key) => new Promise((resolve) => {
                  client.get(key, (err, reply) => {
                        if (typeof reply !== 'undefined') {
                              resolve(reply);
                        } else {
                              resolve('Cache Key not found');
                        }
                  });
            });

            // Define client set
            returnclient.set = function set(key, value, ttlyReqy) {
                  let ttyl = 3600;
                  if (typeof ttlyReqy !== 'undefined') {
                        ttyl = ttlyReqy;
                  }
                  client.set(key, value, 'EX', ttyl);
                  return true;
            };
            f.CredHandler.set(`${creds.tenant}-${creds.credentialname}`, returnclient);
            return returnclient;
      }

      f.decorate('RedisConnector', handler);
      done();
});
