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

const schemaFilename ={type: 'string', minimum: 4, pattern: '^[A-Z]+-[A-Za-z0-9]+-[a-z0-9]+$'}
const schemaType ={ type: 'string',
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
                        'Script-JS',
                        'Script-SSH',
                        'Script-Shell',
                        'Util-Echo',
                        'Util-Fuzzy',
                        'Util-Sentiment',
                        'IOT-Proxy',
                        'Block',
                        'Chain'
                        ]
                  }
const schemaResourceName =  {type: 'string', minimum: 4, pattern: '^[-a-z0-9]+$'}
const schemaRestMethod ={ 
      enum: [
            'POST',
            'GET',
            'PUT',
            'PATCH',
            'DELETE'
            ]
      }                
const schemaCredentialName =  {type: 'string', minimum: 4, pattern: '^[-A-Za-z0-9]+$'}
const schemaSource =  {type: 'string', minimum: 4, pattern: '^[-A-Za-z0-9]+$'}
const schemaSourcePath =  {type: 'string', minimum: 4, pattern: '^[\/\.-A-za-z0-9]+$'}
const schemaTargetPath =  {type: 'string', minimum: 4, pattern: '^[\/\.-A-za-z0-9]+$'}
const schemaJobTimeout =  {type: 'integer'}


const resourceSearch = {
      querystring: {
            properties: {
                  type: schemaType
            }
      }
}

const resourceSearchFile = {
      params: {
            filename: schemaFilename
      }
};

const resourceCreate = {
      body: {
            type: 'object',
            required: ['resourcename', 'type', 'restmethod'],
            properties: {
                  resourcename: schemaResourceName,
                  type: schemaType,
                  restmethod: schemaRestMethod,
                  credentialname: schemaCredentialName,
                  source: schemaSource,
                  source_path: schemaSourcePath,
                  target_path: schemaTargetPath,
                  job_timeout: schemaJobTimeout,
                  resourcelinkedmethod: schemaRestMethod,
                  resourcelink: schemaResourceName,        
            }
      }
};

const resourceDelete = {
      params: {
            filename: schemaFilename
      }
};

exports.resourceSearch = resourceSearch;
exports.resourceSearchFile = resourceSearchFile;
exports.resourceCreate = resourceCreate;
exports.resourceDelete = resourceDelete;

