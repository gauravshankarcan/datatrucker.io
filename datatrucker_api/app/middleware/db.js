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
const db = require('../config/db.config.json');

// define connections
let connectionopt = {};
if (db.type === 'oracledb') {
      connectionopt = {
            connectString: db.host,
            user: db.username,
            password: db.password
      };
} else {
      connectionopt = {
            host: process.env.DB_HOST || db.host,
            user: process.env.DB_USER || db.username,
            password: process.env.DB_PASSWORD || db.password,
            database: process.env.DB_NAME || db.database,
            port: parseInt(process.env.DB_PORT || db.port, 10)
      };
}

// define pooling
const options = {
      client: db.type,
      connection: connectionopt,
      pool: {
            min: db.PoolMin,
            max: db.PoolMax
      }
};

const knex = Knex(options);

module.exports = fp((f, opts, done) => {
      f.decorate('knex', knex);
      f.decorate('knexconnector', db.host);
      done();
});
