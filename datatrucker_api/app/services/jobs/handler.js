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

/* eslint-disable no-await-in-loop */
/* eslint-disable space-infix-ops */

var jp = require('jsonpath');


async function job(request, reply) {
      request.preJobHandler(request);
      this.log.debug("Getting Resource config")
      request.template = await this.ResourceConfig(request.user, request.params.jobid, request.method);
      this.log.trace(request.template)
      this.log.debug("Validating AJV")
      const valid = await request.ajvHandler(request, reply);
      if (valid !== true) {
            reply.code(422).send(reply.replyHandler(valid, request.id));
      } else {
            this.log.debug("Processing Request")
            const data = await this[request.template.type](request, reply);
            this.log.trace("Response")
            this.log.trace(data)
            this.log.debug("Responding")
            reply.send(reply.replyHandler(data, request.id));
      }
}


exports.job = job;
