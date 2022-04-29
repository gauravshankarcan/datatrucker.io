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

    async function executeloop(request) {
        
        if(typeof request.datacontent.loop !== 'undefined') {
            var returncontent=Array(request.datacontent.loop.length).fill(null);
            var originaltemplate = { ...request.template }
            var originalBody = { ...request.datacontent }
            var loopBody = { ...request.datacontent.loop }
            for(var i=0; i<2 ;i++){
                request.datacontent = { ...originalBody, ...loopBody[i] }
                request.template = await f.ResourceConfig(request.user, originaltemplate.resourcelink,originaltemplate.resourcelinkedmethod);
                returncontent[i]= await f[request.template.type](request);                
            }
             return returncontent           

        }
        else {
            var returncontent=[]
            request.datacontent = request.datacontent
            request.template = await f.ResourceConfig(request.user, request.template.resourcelink, request.template.resourcelinkedmethod);
            returncontent.push(await f[request.template.type](request));
            return returncontent
        }
    }

    async function handler(request, reply) {

        if(typeof request.datacontent.when !== 'undefined') {
            if (typeof request.datacontent.when === 'boolean' && request.datacontent.when) {
                return await executeloop(request);
            }
            else if (typeof request.datacontent.when === 'String' && request.datacontent.when) {
                var obj = request.datacontent.when
                const fetchpath = obj.substring(obj.indexOf('|')+1)
                const fetchkey = obj.substring(0,obj.indexOf('|'))
                var cacheObject  = f.requestCache.get(id+""+fetchkey)
                cacheObject= Object.assign({},cacheObject)
                if(!jp.value(cacheObject,fetchpath)){
                    return []
                } else {
                    return await executeloop(request);
                }                
            }
            
            return []
        } else return []
        
    }


    f.decorate('Block', handler);
    done();
});

