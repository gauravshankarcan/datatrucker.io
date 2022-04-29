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
const Ajv = require('ajv');

module.exports = fp((f, opts, done) => {
      async function responseHook(request, reply) {
            let display = true;

            var body = request.body
            if(body !== null ){
                  if(typeof body.password !== "undefined" ) {body.password =null}
            }
            f.serverconfig.requestLog ? request.log.info(body) : null;

            if (request.raw.method === 'GET') {
                  display = false;
            }
            if (request.raw.url === '/api/v1/login') {
                  display = false;
            }


            const time = new Date();
            f.knex('audit')
                  .insert({
                        type: request.raw.method,
                        tenant: typeof request.user !== 'undefined' && request.user !== null ? request.user.payload.ten : '',
                        username: typeof request.user !== 'undefined' && request.user !== null? request.user.payload.usr : '',
                        session: typeof request.user !== 'undefined' && request.user !== null ? request.user.payload.sid : '',
                        message: reply.raw.statusMessage,
                        requestid: request.id,
                        api: request.url,
                        request: reply.raw.statusCode,
                        source: request.ip,
                        hostname: request.hostname,
                        httpVersion: request.raw.httpVersion,
                        date: parseInt(time.getFullYear() + time.getMonth().toString().padStart(2, '0') + time.getDate().toString().padStart(2, '0'), 10),
                        hourminute: parseInt(time.getHours().toString().padStart(2, '0') + time.getMinutes().toString().padStart(2, '0'), 10),
                        display
                  })
                  .then(() => {})
                  .catch((err) => {
                        f.log.error(err);
                  });
      }

      function preJobHandler(request) {
            if (request.raw.method === 'GET' || request.raw.method === 'DELETE') request.datacontent = request.query;
            else request.datacontent = request.body;
      }

      function replyHandler(responsedata, id) {
            const datetime = new Date();
            const response = {
                  reqCompleted: true,
                  date: datetime.toISOString(),
                  reqID: id,
                  data: responsedata,
                  serverID: f.serverconfig.serverID
            };
            return response;
      }

      async function ajvHandler(request) {
            if (f.AJVHandle.has(request.template.resourcename + request.template.tenant + request.template.restmethod)) {
                  request.validation = f.AJVHandle.get(request.template.resourcename + request.template.tenant + request.template.restmethod);
            } else if (typeof request.template.validations === 'undefined') {
                  return true;
            } else {
                  const ajv = new Ajv(f.serverconfig.ajv.customOptions);
                  const validation = ajv.compile(request.template.validations);
                  f.AJVHandle.set(request.template.resourcename + request.template.tenant + request.template.restmethod, validation);
                  request.validation = validation;
            }
            const valid = request.validation(request.datacontent);
            if (!valid) {
                  request.log.error(f.AJVHandle.get(request.template.resourcename + request.template.tenant + request.template.restmethod).errors);
                  return f.AJVHandle.get(request.template.resourcename + request.template.tenant + request.template.restmethod).errors;
            }
            return valid;
      }

      f.decorateRequest('preJobHandler', preJobHandler);
      f.decorateReply('replyHandler', replyHandler);
      f.decorateRequest('ajvHandler', ajvHandler);
      f.decorate('responseHook', responseHook);
      done();
});
