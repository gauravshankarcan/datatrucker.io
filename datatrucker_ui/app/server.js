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

const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const  fs = require('fs');
const dotenv = require('dotenv');
const morgan = require('morgan')
const helmet = require('helmet')
//const https = require('https');
const http = require('http');
const hsts = require('hsts')
const nocache = require('nocache')
const appRoot = require('app-root-path');
const compression = require("compression");


dotenv.config();
app.use(helmet({
    referrerPolicy: { policy: "no-referrer" },
    contentSecurityPolicy: false,
  }))
app.use(nocache());
app.use(compression({threshold:10}));
app.use(morgan('combined'))



const { createProxyMiddleware } = require('http-proxy-middleware');
app.use('/api/*', createProxyMiddleware({ target: process.env.REACT_APP_APIURL, changeOrigin: true }));



app.get('/ping', function (req, res) {
 return res.send('pong');
});



const root = require('path').join(__dirname, 'build')
app.use(express.static(root));
app.get("*", (req, res) => {
    res.sendFile('index.html', { root });
})

if(process.env.HTTP_MODE==="https")
{
  console.log('info',"Https Mode")  
   try{
     app.use(hsts({
       maxAge: 5184000  // 60 days in seconds
     }))

     https.createServer({
       key: fs.readFileSync(appRoot + "/conf/"+process.env.HTTPS_KEY),
       cert: fs.readFileSync(appRoot + "/conf/"+process.env.HTTPS_CERT)
     }, app)
     .listen(process.env.UI_PORT,process.env.UI_BIND);

     console.log("Server Initialization on HTTPS: "+process.env.UI_PORT)
   }
   catch(err){
     console.log(err)
   }
}
else {
  console.log('info',"Http Mode")
  console.log('info',process.env.UI_BIND)
  http.createServer(app).listen(process.env.UI_PORT,process.env.UI_BIND);

  console.log("Server Initialization on HTTP: "+process.env.UI_PORT)
}
