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
// eslint-disable-next-line no-unused-vars
module.exports = async function users(fastify, opts) {
      // Standard error Handling
      fastify.setErrorHandler(function (error, request, reply) {
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

      // get 1000 users
      fastify.get(
            '/',
            {
                  schema: schema.usersSearch,
                  preValidation: [fastify.authenticate],
                  preHandler: [fastify.verifyAdmin, fastify.verifyWrite],
                  onResponse: fastify.responseHook
            },
            handler.UsersSearch
      );

      // get user mappings
      fastify.get(
            '/userroles/:username',
            {
                  schema: schema.userrolesSearch,
                  preValidation: [fastify.authenticate],
                  preHandler: [fastify.verifyAdmin, fastify.verifyWrite],
                  onResponse: fastify.responseHook
            },
            handler.UserrolesSearch
      );

      // create a users
      fastify.post(
            '/',
            {
                  schema: schema.users,
                  preValidation: [fastify.authenticate],
                  preHandler: [fastify.verifyAdmin, fastify.verifyWrite],
                  onResponse: fastify.responseHook
            },
            handler.Users
      );

      // modify a users
      fastify.put(
            '/:username',
            {
                  schema: schema.usersUpdate,
                  preValidation: [fastify.authenticate],
                  preHandler: [fastify.verifyAdmin, fastify.verifyWrite],
                  onResponse: fastify.responseHook
            },
            handler.UsersUpdate
      );

      // detele a users
      fastify.delete(
            '/:username',
            {
                  schema: schema.usersDelete,
                  preValidation: [fastify.authenticate],
                  preHandler: [fastify.verifyAdmin, fastify.verifyWrite],
                  onResponse: fastify.responseHook
            },
            handler.UsersDelete
      );

      // create a group
      fastify.post(
            '/addusertogroup',
            {
                  schema: schema.usermapping,
                  preValidation: [fastify.authenticate],
                  preHandler: [fastify.verifyAdmin, fastify.verifyWrite],
                  onResponse: fastify.responseHook
            },
            handler.Usermapping
      );

      // delete a group
      fastify.delete(
            '/deleteuserfromgroup/:id',
            {
                  schema: schema.usermappingDelete,
                  preValidation: [fastify.authenticate],
                  preHandler: [fastify.verifyAdmin, fastify.verifyWrite],
                  onResponse: fastify.responseHook
            },
            handler.UsermappingDelete
      );

      // get mappings
      fastify.get(
            '/usergrouplisting',
            {
                  schema: schema.userlistings,
                  preValidation: [fastify.authenticate],
                  preHandler: [fastify.verifyAdmin, fastify.verifyWrite],
                  onResponse: fastify.responseHook
            },
            handler.Userlistings
      );
};
