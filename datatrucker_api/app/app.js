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

/* eslint-disable global-require */
const fs = require('fs');
const path = require('path');
const server = require('./config/server.config.json');

// eslint-disable-next-line import/order
const fastifyprops = {
      logger: server.fastify.logger,
      http2: server.protocol.http2,
      ignoreTrailingSlash: server.fastify.ignoreTrailingSlash,
      ajv: {
            customOptions: server.ajv.customOptions
      }
};

if (server.protocol.type === 'https') {
      fastifyprops.https = {};
      fastifyprops.https.allowHTTP1 = server.protocol.httpsconfig.allowHTTP1;
      fastifyprops.https.key = fs.readFileSync(path.join(__dirname, 'config', server.protocol.httpsconfig.key));
      fastifyprops.https.cert = fs.readFileSync(path.join(__dirname, 'config', server.protocol.httpsconfig.cert));
}
// eslint-disable-next-line import/order
const f = require('fastify')(fastifyprops);

f.decorate('serverconfig', server);
// Standard error Handling

f.register(require('fastify-cookie'), {
      secret: 'DataTrucker', // for cookies signature
      parseOptions: {} // options for parsing cookies
});

f.log.info(`starting server: ${new Date()}`);
// Server props
f.register(require('fastify-compress'), f.serverconfig.compression);
f.register(require('fastify-helmet'), f.serverconfig.helmet);
f.register(require('fastify-sensible'));
f.decorate('Ajv', require('ajv'));

f.log.info(`Loaded base libraries: ${new Date()}`);

// register middlewares
f.register(require('./middleware/db'), {});
f.register(require('./middleware/metrics'), {});
f.register(require('./middleware/cache'), {});
f.register(require('./middleware/jwt'), {});
f.register(require('./middleware/auth'), {});
f.register(require('./middleware/support'), {});
f.register(require('./middleware/hooks'), {});

f.log.info(`Loaded middlewares: ${new Date()}`);

// Register Connectors
if (f.serverconfig.pluginsEnable.DB) { f.register(require('./connectors/DBConnector'), {}); }
if (f.serverconfig.pluginsEnable.IOTRedis) { f.register(require('./connectors/RedisConnector'), {}); }
if (f.serverconfig.pluginsEnable.FileSFTP) { f.register(require('./connectors/SFTPConnector'), {}); }
if (f.serverconfig.pluginsEnable.IOTKafka) { f.register(require('./connectors/KafkaConnector'), {}); }
if (f.serverconfig.pluginsEnable.ScriptSSH) { f.register(require('./connectors/SSHConnector'), {}); }

f.log.info(`Loaded Connectors: ${new Date()}`);

// Register plugins
if (f.serverconfig.pluginsEnable.DB) { f.register(require('./plugins/DB'), {}); }
if (f.serverconfig.pluginsEnable.UtilSentiment) { f.register(require('./plugins/Util-Sentiment'), {}); }
if (f.serverconfig.pluginsEnable.UtilFuzzy) { f.register(require('./plugins/Util-Fuzzy'), {}); }
if (f.serverconfig.pluginsEnable.UtilEcho) { f.register(require('./plugins/Util-Echo'), {}); }
if (f.serverconfig.pluginsEnable.IOTRedis) { f.register(require('./plugins/IOT-Redis'), {}); }
if (f.serverconfig.pluginsEnable.IOTKafka) { f.register(require('./plugins/IOT-Kafka'), {}); }
if (f.serverconfig.pluginsEnable.FileSFTP) { f.register(require('./plugins/File-SFTP'), {}); }
if (f.serverconfig.pluginsEnable.ScriptShell) { f.register(require('./plugins/Script-Shell'), {}); }
if (f.serverconfig.pluginsEnable.ScriptSSH) { f.register(require('./plugins/Script-SSH'), {}); }
if (f.serverconfig.pluginsEnable.ScriptJS) { f.register(require('./plugins/Script-JS'), {}); }

f.log.info(`Loaded Plugins: ${new Date()}`);

// register routes

if (f.serverconfig.pluginsEnable.statuschecks) { f.register(require('./services/statuschecks'), {prefix: '/api/v1/statuschecks'}); }
if (f.serverconfig.pluginsEnable.usermanagement) { f.register(require('./services/groups'), {prefix: '/api/v1/groups'}); }
if (f.serverconfig.pluginsEnable.usermanagement) { f.register(require('./services/users'), {prefix: '/api/v1/users'}); }
if (f.serverconfig.pluginsEnable.resources) { f.register(require('./services/resources'), {prefix: '/api/v1/resources'}); }
if (f.serverconfig.pluginsEnable.credentials) { f.register(require('./services/credentials'), {prefix: '/api/v1/credentials'}); }
if (f.serverconfig.pluginsEnable.jobs) { f.register(require('./services/jobs'), {prefix: '/api/v1/'}); }
if (f.serverconfig.pluginsEnable.ui) { f.register(require('./services/ui'), {prefix: '/api/v1/ui/'}); }
f.register(require('./services/cache'), {prefix: '/api/v1/cache/'});

if (f.serverconfig.pluginsEnable.Login) { f.register(require('./services/login'), {prefix: '/api/v1/'}); }

f.log.info(`Loaded Routes: ${new Date()}`);

f.listen(f.serverconfig.port, f.serverconfig.bind, (err) => {
      if (err) {
            f.log.error(err);
            process.exit(1);
      }
      f.log.info(`server listening on ${f.server.address().port}`);
      f.log.info(`server started: ${new Date()}`);
});
