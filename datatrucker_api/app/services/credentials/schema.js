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
const schemaCredentialName =  {type: 'string', minimum: 4, pattern: '^[-A-Za-z0-9]+$'}
const schemaCredentialType ={ type: 'string',
                  enum: [
                        'DB-Postgres',
                        'DB-Mssql',
                        'DB-Mysql',
                        'DB-Oracle',
                        'DB-Sqllite',
                        'DB-Mariadb',
                        'File-SFTP',
                        'IOT-Kafka-Producer',
                        'IOT-Redis',
                        'Script-SSH'
                        ]
                  }

const credentialsSearch = {
      querystring: {
            credentialname: schemaCredentialName,
            type: schemaCredentialType
      }
};

const credentialsDel = {
      params: {
            credentialname: schemaCredentialName
      }
};

const credentialsCreate = {
      response: {
            201: {
                  type: 'object',
                  properties: {
                        status: {type: 'boolean'},
                        msg: schemaCredentialType
                  }
            }
      }
};

const credentialsUpdate = {
      params: {
            credentialname: schemaCredentialName
      },
      response: {
            200: {
                  type: 'object',
                  properties: {
                        status: {type: 'boolean'},
                        msg: {type: 'string'}
                  }
            }
      }
};

exports.credentialsSearch = credentialsSearch;
exports.credentialsCreate = credentialsCreate;
exports.credentialsUpdate = credentialsUpdate;
exports.credentialsDel = credentialsDel;
