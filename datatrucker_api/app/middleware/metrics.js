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

const jobsstats = {};
const cron = require('node-cron');

module.exports = fp((f, opts, done) => {
      async function triggercrons() {
            // Periodic delete
            cron.schedule('59 2 * * *', async () => {
                  const date = new Date();
                  date.setDate(date.getDate() - 2);
                  const dateint = parseInt(date.getFullYear() + date.getMonth().toString().padStart(2, '0') + date.getDate().toString().padStart(2, '0'), 10);

                  f.knex('metric')
                        .where('date', '<=', dateint)
                        .del()
                        .then(() => {})
                        .catch((error) => {
                              f.log.error(error);
                        });
            });

            cron.schedule('* * * * *', async () => {
                  Object.keys(jobsstats).forEach((tenant) => {
                        const tenantjson = {...jobsstats[tenant]};
                        delete jobsstats[tenant];
                        Object.keys(tenantjson).forEach((api) => {
                              const time = new Date();
                              let apitrunc = api.replace('/api/v1/', '');
                              apitrunc = api.indexOf('?') > 1 ? apitrunc.substr(0, apitrunc.indexOf('?')) : apitrunc;
                              f.knex('metric')
                                    .insert({
                                          date: parseInt(time.getFullYear() + time.getMonth().toString().padStart(2, '0') + time.getDate().toString().padStart(2, '0'), 10),
                                          hourminute: parseInt(time.getHours().toString().padStart(2, '0') + time.getMinutes().toString().padStart(2, '0'), 10),
                                          tenant,
                                          type: 'jobs',
                                          api: apitrunc,
                                          counts: tenantjson[api]
                                    })
                                    .then(() => {
                                          // do nothing
                                    });
                        });
                  });
            });
      }
      async function jobmetric(tenant, api) {
            if (typeof jobsstats[tenant] === 'undefined') {
                  jobsstats[tenant] = {};
            }

            if (typeof jobsstats[tenant][api] === 'undefined') {
                  jobsstats[tenant][api] = 1;
            } else {
                  jobsstats[tenant][api] += 1;
            } // increment
      }

      triggercrons();
      f.decorate('jobmetric', jobmetric);
      done();
});
