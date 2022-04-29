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
const Fuse = require('fuse.js');

module.exports = fp(async (f, opts, done) => {
      // eslint-disable-next-line no-unused-vars
      async function handler(request, reply) {
            if (typeof request.datacontent.searchbase === 'undefined') {
                  return 'searchbase is not found';
            }
            if (typeof request.datacontent.key === 'undefined') {
                  return 'key is not found';
            }
            const fuse = new Fuse(request.datacontent.searchbase, request.template.options);
            return fuse.search(request.datacontent.key);
      }

      f.decorate('Util-Fuzzy', handler);
      done();
});
