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
var jp = require('jsonpath');

module.exports = fp(async (f, opts, done) => {


        function testReplace(obj,id) {
            if (obj.charAt(0) === "$") {
                const fetchkey = obj.substring(0,obj.indexOf('|'))
                const fetchpath = obj.substring(obj.indexOf('|')+1)
                var cacheObject  = f.requestCache.get(id+""+fetchkey)
                f.log.trace("Fetching Key" +fetchkey)
                cacheObject= Object.assign({},cacheObject)
                return jp.value(cacheObject,fetchpath);
            } else {
                return obj
            }
        }
      
        function nextkey(obj,id) {
            for (var k in obj) {
            if (typeof obj[k] === 'string' || obj[k] instanceof String) {
                obj[k]=testReplace(obj[k],id)
            } else if (Array.isArray(obj[k])) {
                for (let i = 0; i < obj[k].length; i++) {
                if (typeof obj[k][i] !== 'object') {
                    obj[k][i]=testReplace(obj[k][i],id)
                }
                else nextkey(obj[k][i])
                }
            } else if (typeof obj[k] === 'object') {
                nextkey(obj[k])
            }
            }
            return obj
        }


    async function handler(request, reply) {

        //create a jobcache
        f.requestCache.set(request.id+"$request",request.datacontent)
        var template = { ...request.template }
       
        //executes a single chain
        var finaldata
        for (const joblet of template.chain) {
            try {
                f.log.trace("Translating:  "+joblet.datacontent)
                request.datacontent = nextkey(joblet.datacontent,request.id)
                f.log.trace("Translated:  "+request.datacontent)
                request.template = await f.ResourceConfig(request.user, joblet.stub, joblet.method);
                finaldata = await f[request.template.type](request);
                if (typeof joblet.register !== 'undefined') {
                    f.log.debug("registering"+request.id+"$"+joblet.register)
                    f.requestCache.set(request.id+"$"+joblet.register,finaldata)
                }
            } catch (error) {
                f.log.error(error);
            };        }      

        return finaldata

    }


    f.decorate('Chain', handler);
    done();
});


