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

  if(this.serverconfig.keycloak && typeof this.serverconfig.keycloak==="boolean"){

      const groups = await this.knex.select('groupname','level').from('groups')
      .where({
            'tenantname': request.body.tenant,
            'type': 'keycloak',                                
            'enabled': true
      });

      const keycloakGroups= await this.keycloak(request.body.username,request.body.password)

      var level = -1
      for (const group of groups){
            if(keycloakGroups.includes(group.groupname)){
                  if(group.level==="Tenant_Author")
                      {  level = 1 }
                  else if(group.level==="Tenant_Reader" && level!=1)
                        {  level = 0 }
            }
        }

      if(level > -1){

            const payload = {
                  usr: request.body.username,
                  ten: request.body.tenant,
                  sid: this.genRandomString(4),
                  wrt: level
            };  
            request.log.info(keycloakGroups)
            request.log.info(payload)
            request.log.info(groups)

      
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
      
                    }  
      } else {
            request.log.error("UnAuthorized Login request by "+request.body.username)
      }
      
  
    
  }

reply.code(200).send(response);
}


exports.login = login;