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
            const client = await f.KafkaConnector(creds);

            const config = request.template;
            if (config.type === 'IOT-Kafka-Producer') {
                  let producer;
                  if (f.CredHandler.has(`${config.tenant}-${config.credentialname}-${config.type}`)) {
                        producer = f.CredHandler.get(`${creds.tenant}-${creds.credentialname}-${config.type}`);
                  } else {
                        producer = client.producer();
                        await producer.connect();
                        f.CredHandler.set(`${creds.tenant}-${creds.credentialname}-${config.type}`, producer);
                  }
                  var topic=""
                  if(typeof config.target_type === 'string'){
                        const target_type=JSON.parse(config.target_type)
                        topic=target_type.topic
                  } else {
                        topic=config.target_type.topic
                  }
                  //console.log(topic)
                  //console.log(request.datacontent)
                  const payloads = {
                        topic: topic,
                        messages: []
                  };
                  payloads.messages.push(request.datacontent);
                  const response = await producer.send(payloads);
                  return response;
            }
            return 'Unexpected type';
      }

      f.decorate('IOT-Kafka-Producer', handler);
      done();
});
