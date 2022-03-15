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

module.exports = fp(async (f, opts, done) => {
      // eslint-disable-next-line no-unused-vars
      async function handler(request, reply) {
            const creds = await f.ResourceCreds(request.user, request.template);
            const client = await f.SFTPConnector(creds);
            const options = {
                  concurrency: 4 // integer. Number of concurrent reads
            };

            const jobconfig = request.template;
            const result = [];

            if (jobconfig.source === 'upload') {
                  if (jobconfig.source_type === 'file') {
                        await client.fastPut(jobconfig.source_path, jobconfig.target_path, options);
                        result.push(jobconfig.source_path);
                        f.log.info('connection closed');
                        return result;
                  }
                  if (jobconfig.source_type === 'folder') {
                        client.on('upload', (info) => {
                              result.push(`${info.source}`);
                        });
                        await client.uploadDir(jobconfig.source_path, jobconfig.target_path);
                        f.log.info('connection closed');
                        return result;
                  }
                  return 'Invalid source type';
            }
            if (jobconfig.source === 'download') {
                  if (jobconfig.source_type === 'file') {
                        await client.fastGet(jobconfig.source_path, jobconfig.target_path, options);
                        result.push(jobconfig.source_path);
                        f.log.info('connection closed');
                        return result;
                  }
                  if (jobconfig.source_type === 'folder') {
                        client.on('download', (info) => {
                              result.push(`${info.source}`);
                        });
                        await client.downloadDir(jobconfig.source_path, jobconfig.target_path);
                        f.log.info('connection closed');
                        return result;
                  }
                  return 'Invalid source type';
            }
            return 'Invalid source';
      }

      f.decorate('File-SFTP', handler);
      done();
});
