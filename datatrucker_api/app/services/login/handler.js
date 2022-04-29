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


async function validate(request, reply) {
      const response = {};
      response.status = true;
      response.username = request.user.payload.usr;
      response.Tenant = request.user.payload.ten;
      reply.send(reply.replyHandler(response, request.id));
}

async function logout(request, reply) {
      reply.setCookie('DataTrucker', 'tokenRemoved', {
            httpOnly: true,
            path: '/',
            sameSite: true
      });      
      reply.code(200).send({status: true});
}


exports.logout = logout;
exports.validate = validate;
