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
            const knex = f.DBConnector(creds);
            const SQL = f.JsontoStringreplace(request.datacontent, request.template.script);
            const data = await knex.raw(SQL);
            return data;
      }

      f.decorate('DB-Postgres', handler);
      f.decorate('DB-Mssql', handler);
      f.decorate('DB-Mysql', handler);
      f.decorate('DB-Oracle', handler);
      f.decorate('DB-Sqllite', handler);
      f.decorate('DB-Mariadb', handler);
      done();
});
