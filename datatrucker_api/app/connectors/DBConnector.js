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
const Knex = require('knex');

const clientmaps = {
      'DB-Postgres': 'pg',
      'DB-Mssql': 'mssql',
      'DB-Oracle': 'oracledb',
      'DB-Sqllite': 'sqlite3',
      'DB-Mysql': 'mysql',
      'DB-Mariadb': 'mysql'
};

module.exports = fp((f, opts, done) => {
      function handler(creds) {
            if (f.CredHandler.has(`${creds.tenant}-${creds.credentialname}`)) {
                  f.log.trace("Using cached connections")
                  return f.CredHandler.get(`${creds.tenant}-${creds.credentialname}`);
            }
            const options = {
                  client: clientmaps[creds.type],
                  connection: {}
            };

            if (clientmaps[creds.type] === 'oracledb') {
                  f.log.trace("setting up oracle connections")
                  options.connection.connectString = creds.hostname;
                  options.connection.user = creds.username;
                  options.connection.password = f.decrypt(creds.password).split('|||-break-|||')[1];
            } else if (clientmaps[creds.type] === 'sqlite3') {
                  f.log.trace("setting up sqllite connections")
                  options.connection.filename = creds.filename;
            } else {                  
                  f.log.trace("setting up database connections")
                  options.connection.host = creds.hostname;
                  options.connection.database = creds.database;
                  options.connection.port = creds.port;
                  options.connection.user = creds.username;
                  options.connection.password = f.decrypt(creds.password).split('|||-break-|||')[1];
            }
            if (clientmaps[creds.type] === 'mssql') {
                  f.log.trace("setting up mssql connections")
                  options.connection.options = {};
                  options.connection.options.enableArithAbort = true;
            }

            const knex = Knex(options);
            f.CredHandler.set(`${creds.tenant}-${creds.credentialname}`, knex);
            return knex;
      }

      f.decorate('DBConnector', handler);
      done();
});
