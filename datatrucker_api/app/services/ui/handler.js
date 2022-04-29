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

/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */



async function buildpaneldef(request, reply) {
      const CredDefs = require('./definitions/ui-defs-creds.json');
      const Defs = require('./definitions/ui-defs.json');
      const AdminDefs = require('./definitions/ui-defs-admin.json');
      request.log.trace(`ui requested by:${request.user.payload.usr}`);
      const constructPanel = {
            Panels: {}
      };
      if (request.user.payload.ten === 'Admin') {
            constructPanel.Panels = AdminDefs;
      }
      if (request.user.payload.wrt === 1 ) {
            constructPanel.Panels = {
                  ...constructPanel.Panels,
                  ...CredDefs
            };
      }
      if (request.user.payload.wrt === 1 && this.serverconfig.writableResource) {
            constructPanel.Panels = {
                  ...constructPanel.Panels,
                  ...Defs
            };
      }

      constructPanel.status = true;
      reply.code(200).send(constructPanel);
}

async function buildresourcedef(request, reply) {
      const Defs = {};
      Defs.Page = {};

      // add resources
      let resources = [];
      if(!this.serverconfig.writableResource)  {
            resources = [
                  './definitions/user.json',
                  './definitions/group.json',
                  './definitions/usermappings.json',
                  './definitions/credentials.json'
            ];
      } else {
             resources = [
                  './definitions/user.json',
                  './definitions/group.json',
                  './definitions/usermappings.json',
                  './definitions/credentials.json',
                  './definitions/resources-db.json',
                  './definitions/resources-file.json',
                  './definitions/resources-iot.json',
                  './definitions/resources-script.json',
                  './definitions/resources-Utils.json',
                  './definitions/chains.json'
            ];

      }

      for (let i = 0; i < resources.length; i += 1) {
            const json = require(resources[i]);
            Object.keys(json).forEach((k) => {
                  Defs.Page[k] = json[k];
            });
      }
      reply.code(200).send(Defs.Page[request.query.module]);
}

async function auditlogs(request, reply) {
      const time = new Date();

      const query = this.knex('audit')
            .select('source as From', 'api as API', 'message as Message', 'tenant as Tenant', 'username As User', 'session as Session', 'request as SuccessCode', 'created_at as time', 'type as Method','requestid as RequestID')
            .where({display: true})
            .andWhere('date', parseInt(time.getFullYear() + time.getMonth().toString().padStart(2, '0') + time.getDate().toString().padStart(2, '0'), 10))
            .orderBy('id', 'desc')
            .limit(200);

      if (request.user.payload.ten !== 'Admin') {
            query.andWhere('tenant', request.user.payload.ten);
      }

      const data = await query;
      reply.code(200).send(data);
}

async function userdata(request, reply) {
      const time = new Date();

      const query = this.knex('audit')
            .count('api as loginscounts')
            .countDistinct('username as usercounts')
            .where('api', '/api/v1/login')
            .andWhere('date', parseInt(time.getFullYear() + time.getMonth().toString().padStart(2, '0') + time.getDate().toString().padStart(2, '0'), 10));

      if (request.user.payload.ten !== 'Admin') {
            query.andWhere('tenant', request.user.payload.ten);
      }

      const query2 = this.knex('metric')
            .sum('counts as api')
            .countDistinct('api as apicounts')
            .andWhere('date', parseInt(time.getFullYear() + time.getMonth().toString().padStart(2, '0') + time.getDate().toString().padStart(2, '0'), 10));

      if (request.user.payload.ten !== 'Admin') {
            query2.andWhere('tenant', request.user.payload.ten);
      }

      if (request.user.payload.ten !== 'Admin') {
            query2.andWhere('tenant', request.user.payload.ten);
      }

      const defaultdata = {
            loginscounts: '0',
            usercounts: '0',
            api: '0',
            apicounts: '0'
      };

      const data1 = await query;
      const data2 = await query2;

      

      const data = {
            ...defaultdata,
            ...data1[0],
            ...data2[0]
      };

      Object.keys(data).forEach(function(k,v){
            data[k]=( v === null ? 0:data[k])
      });



      reply.code(200).send(data);
}

async function jobdata(request, reply) {
      const date = new Date();
      const dateint = parseInt(date.getFullYear() + date.getMonth().toString().padStart(2, '0') + date.getDate().toString().padStart(2, '0'), 10);
      const query1 = this.knex('metric').select('hourminute').sum('counts as count').groupBy('hourminute')
            .orderBy('hourminute', 'asc')
            .where({date: dateint})  

      const query2 = this.knex('metric').select('api').sum('counts as count').groupBy('api')
            .where({date: dateint})      
            .orderBy('count', 'desc')           
            .limit(20);  

      if (request.user.payload.ten !== 'Admin') {
            query1.andWhere('tenant', request.user.payload.ten);
      }
      if (request.user.payload.ten !== 'Admin') {
            query2.andWhere('tenant', request.user.payload.ten);
      }

      const data1 = await query1;
      const data2 = await query2;

      const formatdata1 = data1.map((item) => ({
            Hourminute: `${Math.trunc(item.hourminute / 100)}H ${item.hourminute % 100}M`,
            count: parseInt(item.count, 10)
      }));
      const formatdata2 = data2.map((item) => ({
            api: item.api,
            count: parseInt(item.count, 10)
      }));
      var data = {
            bardata: [ { Hourminute: '10H 34M', count: 30 } ],
            radar: [
                  {api: "ui/auditlogs", count: 1}, 
                  {api: "ui/jobdata", count: 1}, 
                  {api: "ui/resource-panels", count: 1}
            ]
          }
      data.bardata = (formatdata1.length >0 ) ? formatdata1 :data.bardata
      data.radar = (formatdata2.length >0 ) ? formatdata2 :data.radar

      reply.code(200).send(data);
}

exports.auditlogs = auditlogs;
exports.userdata = userdata;
exports.jobdata = jobdata;

exports.buildresourcedef = buildresourcedef;
exports.buildpaneldef = buildpaneldef;
