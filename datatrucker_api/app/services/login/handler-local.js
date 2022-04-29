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

async function login(request, reply) {
    const response = {
          status: false
    };

    const userdata = await this.knex.from('users').select('username', 'password', 'salt', 'enabled').where({
          username: request.body.username,
          enabled: true
    });

    if (userdata.length > 0) {
          const newhash = await this.gethash(request.body.username + request.body.password, userdata[0].salt);

          if (newhash.passwordHash === userdata[0].password) {
                const levels = await this.knex.select('groups.level as level').from('users').innerJoin('user_mapping', 'user_mapping.userid', 'users.id').innerJoin('groups', 'groups.id', 'user_mapping.groupid')
                      .where({
                            'users.username': request.body.username,
                            'groups.tenantname': request.body.tenant,
                            'groups.type': 'local',                            
                            'users.enabled': true,
                            'groups.enabled': true
                      });

                const payload = {
                      usr: request.body.username,
                      ten: request.body.tenant,
                      sid: this.genRandomString(4)
                };

                if (levels.length > 0) {
                      payload.wrt = 0;
                      Object.keys(levels).forEach((k) => {
                            if (levels[k].level === 'Tenant_Author') {
                                  payload.wrt = 1;
                            }
                      });
                      if (payload.wrt == 0 && request.body.browser) {
                        response.status = false
                        request.log.error("UI requesting read only token")
                        reply.code(401).send(response);
                      } else {
                              const token = this.jwt.sign({payload});

                              response.status = true;
                              response.username = request.body.username;
                              response.token = token;
                              if (request.body.browser) {
                                    reply.setCookie('DataTrucker', token, {
                                          httpOnly: true,
                                          path: '/',
                                          sameSite: true
                                    });
                              }
      
                              // since login requests dont identify jwt on request ,  needed as a log identifier
                              request.tenant = payload.ten;
                              request.username = payload.usr;
                              request.sid = payload.sid;
      
                              reply.code(200).send(response);
                      }                     
                } else {
                      this.log.error('Tenant Mapping not found');
                      reply.code(401).send(response);
                }
          } else {
                this.log.error(`Invalid password attempt: ${request.body.username}`);
                reply.code(401).send(response);
          }
    } else {
          this.log.error(`Username does not exist: ${request.body.username}`);
          reply.code(401).send(response);
    }
}

async function logout(request, reply) {
      reply.setCookie('DataTrucker', 'tokenRemoved', {
            httpOnly: true,
            path: '/',
            sameSite: true
      });      
      reply.code(200).send({status: true});
}

exports.login = login;