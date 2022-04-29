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

// eslint-disable-next-line no-unused-vars
exports.up = function up(knex, Promise) {
      return knex.schema.createTable('audit', (t) => {
            t.increments('id').primary()
            t.enu('type', ['POST', 'GET', 'PUT', 'DELETE'])
            t.string('tenant', 1000).notNull()
            t.string('username', 1000).notNull()
            t.string('session', 1000).notNull()
            t.string('requestid', 1000).notNull()
            t.string('message', 1000).notNull()
            t.string('api', 1000).notNull()
            t.string('request', 1000).notNull()
            t.string('source', 1000).notNull()
            t.string('hostname', 1000).notNull()
            t.string('httpVersion', 1000).notNull()
            t.integer('date').notNull()
            t.integer('hourminute').notNull()
            t.timestamp('created_at').defaultTo(knex.fn.now())
            t.boolean('display').defaultTo(true)
            t.index(['api'])
            t.index(['date'])
            t.index(['date', 'display'])
            t.index(['date', 'id'])
            t.index(['api', 'date'])
            t.index(['api', 'date', 'tenant'])
            t.index(['hourminute'])
            t.index(['date', 'hourminute'])
      })
}

// eslint-disable-next-line no-unused-vars
exports.down = function down(knex, Promise) {
      return knex.schema.dropTableIfExists('audit')
}
