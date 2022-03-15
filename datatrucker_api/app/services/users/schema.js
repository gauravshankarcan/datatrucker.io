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

const schemaId= {type: 'integer'}
const schemaUsername = {type: 'string', minimum: 4, pattern: '^[A-Za-z0-9]+$'}
const schemaGroupname = {type: 'string', minimum: 4, pattern: '^[A-Za-z0-9]+$'}
const schemaPassword ={
                              type: 'string',
                              pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})(?!.*[; ])',
                              minimum: 8
                      }
const schemaEmailId = {type: 'string'}        
const schemaEnabled = {type: 'boolean'}
const schemaAsset   = {type: 'string', pattern: '^[- A-Za-z0-9]+$'}                

const usersSearch = {
      querystring: {
            username: schemaUsername
      }
};

const userrolesSearch = {
      params: {
            username: schemaUsername
      }
};

const users = {
      body: {
            type: 'object',
            required: ['username', 'password', 'enabled'],
            properties: {
                  username: schemaUsername,
                  password: schemaPassword,
                  emailid: schemaEmailId,
                  enabled: schemaEnabled,
                  asset: schemaAsset
            }
      }
};

const usersUpdate = {
      params: {
            username: schemaUsername
      },
      body: {
            type: 'object',
            required: ['password', 'enabled'],
            properties: {
                  password: schemaPassword,
                  emailid: schemaEmailId,
                  enabled: schemaEnabled,
                  asset: schemaAsset
            }
      }
};

const usersDelete = {
      params: {
            username: schemaUsername
      }
};

const usermapping = {
      body: {
            type: 'object',
            required: ['username', 'groupname'],
            properties: {
                  username: schemaUsername,
                  groupname: schemaGroupname
            }
      }
};

const usermappingDelete = {
      params: {
            id: schemaId
      }
};

const userlistings = {
      querystring: {
            username: schemaUsername
      }
};

exports.usersSearch = usersSearch;
exports.userrolesSearch = userrolesSearch;
exports.users = users;
exports.usersUpdate = usersUpdate;
exports.usersDelete = usersDelete;
exports.usermapping = usermapping;
exports.usermappingDelete = usermappingDelete;
exports.userlistings = userlistings;
