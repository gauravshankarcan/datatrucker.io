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

import React, {forwardRef, Component} from 'react';
import {Navigate} from 'react-router-dom';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import MaterialTable from 'material-table';

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';

import {Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis} from 'recharts';

const useStyles = (theme) => ({
      api: {
            minWidth: 200
      },
      chart: {
            minWidth: 200,
            minHeight: 450
      },
      title: {
            fontSize: 14
      }
});

class Landing extends Component {
      tableIcons = {
            Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
            Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
            Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
            Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
            DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
            Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
            Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
            Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
            FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
            LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
            NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
            PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
            ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
            Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
            SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
            ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
            ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
      };

      state = {
            isRegisterd: true,
            isLoggedin: true,
            columns: [
                  {title: 'Tenant', field: 'Tenant'},
                  {title: 'User', field: 'User'},
                  {title: 'API', field: 'API'},
                  {title: 'From', field: 'From'},
                  {title: 'Message', field: 'Message'},
                  {title: 'Method', field: 'Method'},
                  {title: 'Session', field: 'Session'},
                  {title: 'SuccessCode', field: 'SuccessCode'},
                  {title: 'Time', field: 'time'},
                  {title: 'RequestID', field: 'RequestID'}
            ],
            tabledata: [],
            barData: [],
            radarData: [],
            loginscounts: 0,
            usercounts: 0,
            api: 0,
            apicounts: 0
      };

      updateJobStats() {
            const apiUrl = '/api/v1/ui/jobdata';
            fetch(apiUrl)
                  .then((response) => response.json())
                  .then((data) => {
                        this.setState({barData: data.bardata, radarData: data.radar});
                  });
      }

      updateAuditStats() {
            const apiUrl = '/api/v1/ui/userdata';
            fetch(apiUrl)
                  .then((response) => response.json())
                  .then((data) => {
                        this.setState({
                              loginscounts: data.loginscounts || '0',
                              usercounts: data.usercounts || '0',
                              api: data.api || '0',
                              apicounts: data.apicounts || '0'
                        });
                  });
      }

      updateAuditLogs() {
            const apiUrl = '/api/v1/ui/auditlogs';
            fetch(apiUrl)
                  .then((response) => response.json())
                  .then((data) => {
                        this.setState({tabledata: data});
                  });
      }

      checkLogin() {
            const apiUrl = '/api/v1/validate';
            fetch(apiUrl)
                  .then((response) => response.json())
                  .then((data) => {
                        this.setState({isLoggedin: data.reqCompleted});
                  });
      }

      componentDidMount() {
            this.checkLogin();
            this.updateJobStats();
            this.updateAuditStats();
            this.updateAuditLogs();
      }
      render() {
            const {classes} = this.props;
            if (!this.state.isRegisterd) {
                  return <Navigate to="/register" />;
            } else if (this.state.isRegisterd && !this.state.isLoggedin) {
                  return <Navigate to="/login" />;
            } else {
                  return (
                        <div>
                              <Grid container spacing={3}>
                                    <Grid item lg={3} md={6} sm={12} xs={12}>
                                          <Card className={classes.api}>
                                                <CardContent>
                                                      <Typography className={classes.title} color="textSecondary" gutterBottom>
                                                            Total Jobs fired today
                                                      </Typography>
                                                      <Typography variant="h3" component="p">
                                                            {this.state.api}
                                                      </Typography>
                                                </CardContent>
                                          </Card>
                                    </Grid>
                                    <Grid item lg={3} md={6} sm={12} xs={12}>
                                          <Card className={classes.api}>
                                                <CardContent>
                                                      <Typography className={classes.title} color="textSecondary" gutterBottom>
                                                            Total Unique Job Endpoints accessed
                                                      </Typography>
                                                      <Typography variant="h3" component="p">
                                                            {this.state.apicounts}
                                                      </Typography>
                                                </CardContent>
                                          </Card>
                                    </Grid>
                                    <Grid item lg={3} md={6} sm={12} xs={12}>
                                          <Card className={classes.api}>
                                                <CardContent>
                                                      <Typography className={classes.title} color="textSecondary" gutterBottom>
                                                            Unique Logins today
                                                      </Typography>
                                                      <Typography variant="h3" component="p">
                                                            {this.state.loginscounts}
                                                      </Typography>
                                                </CardContent>
                                          </Card>
                                    </Grid>
                                    <Grid item lg={3} md={6} sm={12} xs={12}>
                                          <Card className={classes.api}>
                                                <CardContent>
                                                      <Typography className={classes.title} color="textSecondary" gutterBottom>
                                                            Active Users today
                                                      </Typography>
                                                      <Typography variant="h3" component="p">
                                                            {this.state.usercounts}
                                                      </Typography>
                                                </CardContent>
                                          </Card>
                                    </Grid>
                              </Grid>

                              <Grid container spacing={3}>
                                    {this.state.barData.length > '0' && (
                                          <Grid item lg={6} md={12} sm={12} xs={12}>
                                                <Card className={classes.chart}>
                                                      <CardContent>
                                                            <Typography className={classes.title} color="textSecondary" gutterBottom>
                                                                  API Activity (today)
                                                            </Typography>
                                                            <ResponsiveContainer width="98%" aspect={2}>
                                                                  <BarChart
                                                                        data={this.state.barData}
                                                                        margin={{
                                                                              top: 5,
                                                                              right: 30,
                                                                              left: 20,
                                                                              bottom: 5
                                                                        }}
                                                                  >
                                                                        <CartesianGrid strokeDasharray="3 3" />
                                                                        <XAxis dataKey="Hourminute" />
                                                                        <YAxis />
                                                                        <Tooltip />
                                                                        <Bar dataKey="count" fill="#8884d8" />
                                                                  </BarChart>
                                                            </ResponsiveContainer>
                                                      </CardContent>
                                                </Card>
                                          </Grid>
                                    )}
                                    {this.state.radarData.length > '0' && (
                                          <Grid item lg={6} md={12} sm={12} xs={12}>
                                                <Card className={classes.chart}>
                                                      <CardContent>
                                                            <Typography className={classes.title} color="textSecondary" gutterBottom>
                                                                  Activity Distibution (today)
                                                            </Typography>

                                                            <ResponsiveContainer width="98%" aspect={2}>
                                                                  <RadarChart outerRadius={150} data={this.state.radarData}>
                                                                        <PolarGrid />
                                                                        <PolarAngleAxis dataKey="api" />
                                                                        <PolarRadiusAxis />
                                                                        <Tooltip />
                                                                        <Radar name="count" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                                                  </RadarChart>
                                                            </ResponsiveContainer>
                                                      </CardContent>
                                                </Card>
                                          </Grid>
                                    )}
                              </Grid>

                              <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                          <MaterialTable icons={this.tableIcons} title="Audit Logs" columns={this.state.columns} data={this.state.tabledata} />
                                    </Grid>
                              </Grid>
                        </div>
                  );
            }
      }
}

export default withStyles(useStyles, {withTheme: true})(Landing);
