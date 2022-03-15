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

const appRoot = require('app-root-path');
const {promises: fs} = require('fs');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

const resourceconfig = require('../../config/resource.config.json');

const jobdefinitions = `${appRoot}/${resourceconfig.Templates.resourcedefinitions}/`;

async function resourceFilter(request) {
            const command = 'grep -Rl \''+request.query.type+'\' '+jobdefinitions            
            const stdout = await exec(command)
            var splitStdout = stdout.stdout.split('\n');
            var filelist =[]
            for(var i=0;i<splitStdout.length;i++){
                  if(splitStdout[i].length>5){
                      const filename = splitStdout[i].split('/'+resourceconfig.Templates.resourcedefinitions+'/')[1].split('-')
                      if(filename[1] === request.user.payload.ten){
                        var record = {
                              "restmethod": filename[0],
                              "tenant": filename[1],
                              "resourcename": filename[2].split('.json')[0],
                              "filename": splitStdout[i].split(jobdefinitions)[1]
                                }
                          filelist.push(record)
                      }                   
                  }
            }
            return filelist;
    //  });

}

async function resourceSearch(request, reply) {
      const filelist = await resourceFilter(request)
      reply.send(reply.replyHandler(filelist, request.id));
}

async function resourceSearchFile(request, reply) {
      const filename = jobdefinitions + request.params.filename;
      if (request.params.filename.split('-')[1] === request.user.payload.ten) {
            const data = JSON.parse(await fs.readFile(filename, 'utf8'));
            reply.send(reply.replyHandler(data, request.id));
      }
}

async function resourceCreate(request, reply) {
      const path = `${jobdefinitions + request.body.restmethod}-${request.user.payload.ten}-${request.body.resourcename}.json`;
      const resource = {
            resourcename: request.body.resourcename,
            tenant: request.user.payload.ten,
            type: request.body.type,
            restmethod: request.body.restmethod,
            owner: request.user.payload.usr,
            credentialname: request.body.credentialname,
            source: request.body.source,
            source_path: request.body.source_path,
            source_type: request.body.source_type,
            target_path: request.body.target_path,
            target_type: request.body.target_type,
            validations: typeof request.body.validations === 'string' ? JSON.parse(request.body.validations) : request.body.validations,
            script: request.body.script,
            script_args: request.body.script_args,
            job_timeout: request.body.job_timeout,
            chain: typeof request.body.chain === 'string' ? JSON.parse(request.body.chain) : request.body.chain,
            options: typeof request.body.options === 'string' ? JSON.parse(request.body.options) : request.body.options
      };
      const data = JSON.stringify(resource, null, 2);
      await fs.writeFile(path, data);
      reply.code(201).send(reply.replyHandler(`Data written to file: ${path}`, request.id));
}

async function resourceDelete(request, reply) {
      const filename = jobdefinitions + request.params.filename+'.json';
      if (request.params.filename.split('-')[1] === request.user.payload.ten) {
            await fs.unlink(filename)
            reply.send(reply.replyHandler(`File Deleted: ${filename}`, request.id));
      }
}
exports.ResourceSearch = resourceSearch;
exports.ResourceSearchFile = resourceSearchFile;
exports.ResourceCreate = resourceCreate;
exports.ResourceDelete = resourceDelete;
