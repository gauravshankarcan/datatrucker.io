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

import React, {Component} from 'react';
import {BrowserRouter,Routes, Route} from 'react-router-dom';

//import all the routes
import Login from './login/login';
import Register from './login/register';
import Pages from './pages';
import Landing from './landing/Landing';

export default class MainRouter extends Component {
      render() {
            return (
                  <div>
                  <BrowserRouter>
                      <Routes>
                                    <Route exact path="/register" element={ <Register /> }></Route>
                                    <Route exact path="/login" element={ <Login /> }></Route>
                                    <Route exact path="/users" element={ <Pages path="/users"/> }></Route>
                                    <Route exact path="/groups" element={ <Pages path="/groups"/> }></Route>
                                    <Route exact path="/user-mapping" element={ <Pages path="/user-mapping"/> }></Route>
                                    <Route exact path="/api-browser" element={ <Pages path="/api-browser"/> }></Route>
                                    <Route exact path="/credentials/postgres" element={ <Pages path="/credentials/postgres"/> }></Route>
                                    <Route exact path="/credentials/mysql" element={ <Pages path="/credentials/mysql"/> }></Route>
                                    <Route exact path="/credentials/mssql" element={ <Pages path="/credentials/mssql"/> }></Route>
                                    <Route exact path="/credentials/oracle" element={ <Pages path="/credentials/oracle"/> }></Route>
                                    <Route exact path="/credentials/sqllite" element={ <Pages path="/credentials/sqllite"/> }></Route>
                                    <Route exact path="/credentials/maria" element={ <Pages path="/credentials/maria"/> }></Route>
                                    <Route exact path="/credentials/redis" element={ <Pages path="/credentials/redis"/> }></Route>
                                    <Route exact path="/credentials/kafka" element={ <Pages path="/credentials/kafka"/> }></Route>
                                    <Route exact path="/credentials/shell" element={ <Pages path="/credentials/shell"/> }></Route>
                                    <Route exact path="/credentials/file" element={ <Pages path="/credentials/file"/> }></Route>
                                    <Route exact path="/utils/sentiment" element={ <Pages path="/utils/sentiment"/> }></Route>
                                    <Route exact path="/utils/fuzzy" element={ <Pages path="/utils/fuzzy"/> }></Route>
                                    <Route exact path="/utils/echo" element={ <Pages path="/utils/echo"/> }></Route>
                                    <Route exact path="/script/jsscript" element={ <Pages path="/script/jsscript"/> }></Route>
                                    <Route exact path="/script/sshscript" element={ <Pages path="/script/sshscript"/> }></Route>
                                    <Route exact path="/script/shell" element={ <Pages path="/script/shell"/> }></Route>
                                    <Route exact path="/iot/redis" element={ <Pages path="/iot/redis"/> }></Route>
                                    <Route exact path="/iot/kafka" element={ <Pages path="/iot/kafka"/> }></Route>
                                    <Route exact path="/db/postgres" element={ <Pages path="/db/postgres"/> }></Route>
                                    <Route exact path="/db/mysql" element={ <Pages path="/db/mysql"/> }></Route>
                                    <Route exact path="/db/mssql" element={ <Pages path="/db/mssql"/> }></Route>
                                    <Route exact path="/db/oracle" element={ <Pages path="/db/oracle"/> }></Route>
                                    <Route exact path="/db/sqllite" element={ <Pages path="/db/sqllite"/> }></Route>
                                    <Route exact path="/db/maria" element={ <Pages path="/db/maria"/> }></Route>
                                    <Route exact path="/file/sftp" element={ <Pages path="/file/sftp"/> }></Route>
                                    <Route exact path="/chains" element={ <Pages exact path="/chains"/> }></Route>
                                    <Route exact path="/block" element={ <Pages exact path="/block"/> }></Route>
                                    <Route exact path="/iot/proxy" element={ <Pages exact path="/iot/proxy"/> }></Route>
                                    <Route exact path="/home" element={ <Landing /> }></Route>
                                    <Route exact path="/" element={ <Landing /> }></Route>
                      </Routes>  
                  </BrowserRouter>
                  </div>
            );
      }
}
