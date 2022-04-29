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
const Client = require('ssh2-sftp-client');

module.exports = fp((f, opts, done) => {
      async function handler(creds) {
            if (f.CredHandler.has(`${creds.tenant}-${creds.credentialname}`)) {
                  return f.CredHandler.get(`${creds.tenant}-${creds.credentialname}`);
            }
            const client = new Client();
            let sshConfig;
            if (creds.passwordisPrivateKey) {
                  sshConfig = {
                        host: creds.hostname,
                        port: creds.port,
                        username: creds.username,
                        privateKey: f.decrypt(creds.password).split('|||-break-|||')[1],
                        keepaliveInterval: 10000,
                        readyTimeout: 10000,
                        retry_minTimeout: 2000
                  };
            } else {
                  sshConfig = {
                        host: creds.hostname,
                        port: creds.port,
                        username: creds.username,
                        password: f.decrypt(creds.password).split('|||-break-|||')[1],
                        keepaliveInterval: 10000,
                        readyTimeout: 10000,
                        retry_minTimeout: 2000
                  };
            }
            await client.connect(sshConfig);
            f.CredHandler.set(`${creds.tenant}-${creds.credentialname}`, client);
            return client;
      }

      f.decorate('SFTPConnector', handler);
      done();
});
