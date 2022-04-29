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

const schema = require('./schema.js');
const handler = require('./handler.js');
const handlerLocal = require('./handler-local.js');
const handlerKeycloak = require('./handler-keycloak.js');

// eslint-disable-next-line no-unused-vars
module.exports = async function login(fastify, opts) {
      // Standard error Handling
      fastify.setErrorHandler(function (error, request, reply)  {
            const datetime = new Date();
            const response = {
                  reqCompleted: false,
                  date: datetime.toISOString(),
                  reqID: request.id,
                  errorMsg: error,
                  serverID: fastify.serverconfig.serverID
            };
            request.log.error(error);
            reply.code(422).send(response);
      });

      fastify.post('/login', {schema: schema.login, onResponse: fastify.responseHook}, handlerLocal.login);
      fastify.post('/login-keycloak', { onResponse: fastify.responseHook}, handlerKeycloak.login);
      fastify.get('/logout', {onResponse: fastify.responseHook}, handler.logout);
      fastify.get('/validate', {preValidation: [fastify.authenticate], onResponse: fastify.responseHook}, handler.validate);
};
