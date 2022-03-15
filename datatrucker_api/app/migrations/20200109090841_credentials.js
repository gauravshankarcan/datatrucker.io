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
      return knex.schema.createTable('credentials', (t) => {
            t.increments('id').primary()
            t.string('credentialname', 100).notNull()
            t.string('type', 100).notNull()
            t.string('tenant', 100).notNull()
            t.text('hostname')
            t.string('become_user', 1000)
            t.string('username', 1000)
            t.text('password')
            t.string('database', 1000)
            t.string('filename', 1000)
            t.string('options', 2000)
            t.string('payloads', 2000)
            t.integer('port')
            t.integer('minpool')
            t.integer('maxpool')
            t.boolean('passwordisPrivateKey')
            t.string('asset', 1000)
            t.timestamp('created_at').defaultTo(knex.fn.now())
            t.timestamp('updated_at').defaultTo(knex.fn.now())
            t.unique(['tenant', 'credentialname'])
      })
}

// eslint-disable-next-line no-unused-vars
exports.down = function down(knex, Promise) {
      return knex.schema.dropTableIfExists('credentials')
}
