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

async function chain(request, reply) {
      request.preJobHandler(request);
      const bodychain = {};
      let flag = true;
      let bodychainindex = 0;
      bodychain[parseInt(bodychainindex)] = {...request.datacontent};

      request.chaintemplate = await this.ResourceConfig(request.user, request.params.chainid, request.method);
      if (typeof request.chaintemplate.chain=== 'string') {
            request.chaintemplate.chain = JSON.parse(request.chaintemplate.chain);
      }
      const chaindef = JSON.parse(JSON.stringify(request.chaintemplate.chain)); // create a clone , instead of modiying the in memory objct on nod-cache
      // eslint-disable-next-line no-restricted-syntax
      for (const joblet of chaindef) {
            const flattendchain = bodychain;
            
            Object.keys(joblet.datacontent).forEach((key) => {
                  joblet.datacontent[key] = jp.value(flattendchain,joblet.datacontent[key]);                 
            });
            console.log(joblet.datacontent)



            request.datacontent = joblet.datacontent;
            this.log.debug("Getting Resource config")
            request.template = await this.ResourceConfig(request.user, joblet.stub, joblet.method);
            this.log.trace(request.template)

            this.log.debug("Validating AJV")
            const valid = await request.ajvHandler(request, reply);
            if (valid !== true) {
                  reply.code(422).send(reply.replyHandler(valid, request.id));
                  flag = false;
                  break;
            } else {
                  this.log.debug("Processing Request")
                  const data = await this[request.template.type](request, reply);
                  bodychainindex += 1;
                  this.log.trace("Response")
                  this.log.trace(data)
                  this.log.debug("Mapping Data to next chain")
                  bodychain[parseInt(bodychainindex)] = data;
            }
      }
      if (flag) {
            reply.send(reply.replyHandler(bodychain[parseInt(bodychainindex)], request.id));
      }
}

exports.job = job;
exports.chain = chain;
