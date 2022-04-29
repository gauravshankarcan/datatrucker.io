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
const appRoot = require('app-root-path');

const shell = require('shelljs');
const configdef = require('../config/resource.config.json');

module.exports = fp(async (f, opts, done) => {
      // eslint-disable-next-line no-unused-vars
      async function handler(request, reply) {
            const cmd = request.template.script;
            let fullcmd;

            if (typeof request.datacontent.args === 'undefined') {
                  request.datacontent.args = [];
            }
            if (typeof request.datacontent.args === 'string') {
                  request.datacontent.args = request.datacontent.args.split(',');
            }

            if (request.datacontent != null) {
                  fullcmd = f.ArraytoStringAppend(cmd, request.datacontent.args);
            } else {
                  fullcmd = cmd;
            }
            const path = `${appRoot}/${configdef.Templates.Shell}/`;

            await shell.cd(path);
            const result = await shell.exec(fullcmd, {async: false, silent: true});
            return {
                  STDOUT: result.stdout,
                  STDERR: result.stderr,
                  code: result.code
            };
      }

      f.decorate('Script-Shell', handler);
      done();
});
