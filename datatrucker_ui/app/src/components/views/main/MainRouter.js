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
import {BrowserRouter as Router, Route} from 'react-router-dom';

//import all the routes
import Login from './login/login';
import Register from './login/register';
import Pages from './pages';
import Landing from './landing/Landing';

export default class MainRouter extends Component {
      render() {
            return (
                  <div>
                        <Router>
                              <div>
                                    <Route exact path="/register" component={Register}></Route>
                                    <Route exact path="/login" component={Login}></Route>
                                    <Route exact path="/users" component={Pages}></Route>
                                    <Route exact path="/groups" component={Pages}></Route>
                                    <Route exact path="/user-mapping" component={Pages}></Route>
                                    <Route exact path="/api-browser" component={Pages}></Route>
                                    <Route exact path="/credentials/postgres" component={Pages}></Route>
                                    <Route exact path="/credentials/mysql" component={Pages}></Route>
                                    <Route exact path="/credentials/mssql" component={Pages}></Route>
                                    <Route exact path="/credentials/oracle" component={Pages}></Route>
                                    <Route exact path="/credentials/sqllite" component={Pages}></Route>
                                    <Route exact path="/credentials/maria" component={Pages}></Route>
                                    <Route exact path="/credentials/redis" component={Pages}></Route>
                                    <Route exact path="/credentials/kafka" component={Pages}></Route>
                                    <Route exact path="/credentials/shell" component={Pages}></Route>
                                    <Route exact path="/credentials/file" component={Pages}></Route>
                                    <Route exact path="/utils/sentiment" component={Pages}></Route>
                                    <Route exact path="/utils/fuzzy" component={Pages}></Route>
                                    <Route exact path="/utils/echo" component={Pages}></Route>
                                    <Route exact path="/script/jsscript" component={Pages}></Route>
                                    <Route exact path="/script/sshscript" component={Pages}></Route>
                                    <Route exact path="/script/shell" component={Pages}></Route>
                                    <Route exact path="/iot/redis" component={Pages}></Route>
                                    <Route exact path="/iot/kafka" component={Pages}></Route>
                                    <Route exact path="/db/postgres" component={Pages}></Route>
                                    <Route exact path="/db/mysql" component={Pages}></Route>
                                    <Route exact path="/db/mssql" component={Pages}></Route>
                                    <Route exact path="/db/oracle" component={Pages}></Route>
                                    <Route exact path="/db/sqllite" component={Pages}></Route>
                                    <Route exact path="/db/maria" component={Pages}></Route>
                                    <Route exact path="/file/sftp" component={Pages}></Route>
                                    <Route exact path="/chains" component={Pages}></Route>
                                    <Route exact path="/home" component={Landing}></Route>
                                    <Route exact path="/" component={Landing}></Route>
                              </div>
                        </Router>
                  </div>
            );
      }
}
