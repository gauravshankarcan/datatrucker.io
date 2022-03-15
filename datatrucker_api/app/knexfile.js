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

const secretsproperties = require('./config/db.config.json');

let knexconnect = {};
if (secretsproperties.type === 'oracledb') {
      knexconnect = {
            connectString: secretsproperties.host,
            user: secretsproperties.username,
            password: secretsproperties.password
      };
} else {
      knexconnect = {
            host: secretsproperties.host,
            user: secretsproperties.username,
            password: secretsproperties.password,
            database: secretsproperties.database,
            port: secretsproperties.port
      };
}

module.exports = {
      production: {
            client: secretsproperties.type,
            connection: knexconnect,
            pool: {
                  min: 2,
                  max: 10
            },
            migrations: {
                  directory: './migrations'
            }
      }
};
