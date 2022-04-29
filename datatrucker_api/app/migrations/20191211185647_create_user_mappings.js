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
      return knex.schema.createTable('user_mapping', (t) => {
            t.increments('id').primary()
            t.integer('groupid')
            t.integer('userid')
            t.boolean('enabled').defaultTo(true)
            t.string('asset', 1000)
            t.timestamp('created_at').defaultTo(knex.fn.now())
            t.timestamp('updated_at').defaultTo(knex.fn.now())
            t.boolean('base').defaultTo(false)
            t.unique(['groupid', 'userid'])
            t.index(['groupid'])
            t.index(['userid'])
            t.foreign('groupid').references('groups.id').onDelete('CASCADE')
            t.foreign('userid').references('users.id').onDelete('CASCADE')
      })
}

// eslint-disable-next-line no-unused-vars
exports.down = function down(knex, Promise) {
      return knex.schema.dropTableIfExists('user_mapping')
}
