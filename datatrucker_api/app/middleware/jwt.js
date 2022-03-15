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
const {readFileSync} = require('fs');
const jwt = require('fastify-jwt');
const cryptoconfig = require('../config/crypto.config.json');



module.exports = fp((f, opts, done) => {
      const jwtopts = {
            secret: {
                  private: readFileSync(`${process.cwd()}/config/${cryptoconfig.JWT.authorization_keys.private_key}`, 'utf8'),
                  public: readFileSync(`${process.cwd()}/config/${cryptoconfig.JWT.authorization_keys.public_key}`, 'utf8')
            },
            sign: cryptoconfig.JWT.signOptions,
            verify: cryptoconfig.JWT.verify
      };


      f.register(jwt, jwtopts);
      f.decorate('authenticate', async (request, reply) => {
            try {
                  if (typeof request.cookies.DataTrucker !== 'undefined') {
                        request.headers.authorization = `Bearer ${request.cookies.DataTrucker}`;
                  }

                  f.log.debug("Verifying Authority")
                  await request.jwtVerify();
                  f.log.debug("Authority Verified")
                  f.log.trace(request.user.payload)
                  f.jobmetric(request.user.payload.ten, request.raw.url);
            } catch (err) {
                  f.log.error('Rejecting Request: JWT Invalid');
                  f.log.error(err);
                  reply.code(401).send({status: false});
            }
      });
      // eslint-disable-next-line no-unused-vars
      f.decorate('verifyAdmin', async (request, reply) => {
            await f.assert(request.user.payload.ten === 'Admin', 401, 'Admin Only');
      });
      // eslint-disable-next-line no-unused-vars
      f.decorate('verifyWrite', async (request, reply) => {
            await f.assert(request.user.payload.wrt === 1, 401, 'Read Access Only permitted');
      });
      done();
});
