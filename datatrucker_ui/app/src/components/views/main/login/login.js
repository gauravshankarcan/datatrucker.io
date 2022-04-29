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
import {Navigate} from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import {withStyles} from '@material-ui/core/styles';

//import middleware
import Copyright from '../../../middleware/Copyright';
import AlertDialog from '../../../middleware/ResponseDialog';

const useStyles = (theme) => ({
      paper: {
            marginTop: theme.spacing(8),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
      },
      avatar: {
            margin: theme.spacing(1),
            backgroundColor: theme.palette.secondary.main
      },
      form: {
            width: '100%', // Fix IE 11 issue.
            marginTop: theme.spacing(1)
      },
      submit: {
            margin: theme.spacing(3, 0, 2)
      }
});

class Login extends Component {
      state = {
            username: '',
            password: '',
            tenant: '',
            auth: 'local',
            openModal: false,
            ModelMessage: {},
            passwordfailed: false,
            tenants: [],
            redirect: false,
            redirectreg: false
      };

      componentDidMount() {
            const logoutURL = '/api/v1/logout';
            fetch(logoutURL, {
                  method: 'GET',
                  headers: {
                        'Content-Type': 'application/json'
                  }
            })
                  .then((response) => response.json())
                  .then((data) => {});

            const isRegUrl = '/api/v1/statuschecks/is-intialized';
            fetch(isRegUrl, {
                  method: 'GET',
                  headers: {
                        'Content-Type': 'application/json'
                  }
            })
                  .then((response) => response.json())
                  .then((data) => {
                        if (data.reqCompleted) {
                              if (!data.data.isIntialized) {
                                    this.setState({redirectreg: true});
                              }
                        } else {
                              this.setState({redirectreg: true});
                        }
                  });
            const apiUrl = '/api/v1/groups/tenants';
            fetch(apiUrl, {
                  method: 'GET',
                  headers: {
                        'Content-Type': 'application/json'
                  }
            })
                  .then((response) => response.json())
                  .then((data) => {
                        if (data.reqCompleted) {
                              var tenantlist = [];

                              for (const val in data.data) {
                                    var tenant = {
                                          value: data.data[val].tenantname,
                                          label: data.data[val].tenantname
                                    };
                                    tenantlist.push(tenant);
                              }
                              this.setState({tenants: tenantlist});
                              this.setState({tenant: 'Admin'});
                        } else {
                              this.setState({openModal: true, ModelMessage: data});
                        }
                  });
      }

      formChange = (event) => this.setState({[event.target.name]: event.target.value});
      markComplete = (message) => this.setState({openModal: false});

      loginTypes = [
            {
                  value: 'local',
                  label: 'Local Auth'
            },
            {
                  value: 'keycloak',
                  label: 'Keycloak Auth'
            }
      ];

      login = (e) => {
            e.preventDefault();
            var apiUrl =  this.state.auth==="local" ? '/api/v1/login' : ('/api/v1/login-'+this.state.auth)
            fetch(apiUrl, {
                  method: 'POST',
                  body: JSON.stringify({
                        username: this.state.username,
                        password: this.state.password,
                        tenant: this.state.tenant,
                        browser: true
                  }),
                  headers: {
                        'Content-Type': 'application/json'
                  }
            })
                  .then((response) => response.json())
                  .then((data) => {
                        if (data.status) {
                              this.setState({redirect: true});
                              this.props.history.push('/home')
                        } else {
                              this.setState({openModal: true, ModelMessage: data});
                        }
                        if (typeof data.status === 'undefined') {
                              this.setState({openModal: true, ModelMessage: data});
                        }
                  });
      };

      render() {
            const {classes} = this.props;
            if (this.state.redirectreg) {
                  return <Navigate to="/register" />;
            }
            if (this.state.redirect) {
                 return <Navigate to="/home" />;
            } 
            else {
                  return (
                        <Container component="main" maxWidth="xs">
                              <CssBaseline />
                              <div className={classes.paper}>
                                    <Avatar className={classes.avatar}>
                                          <LockOutlinedIcon />
                                    </Avatar>
                                    <Typography component="h1" variant="h5">
                                          Login
                                    </Typography>
                                    <form className={classes.form} noValidate onSubmit={this.login}>
                                          <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                id="username"
                                                label="Username"
                                                variant="outlined"
                                                name="username"
                                                autoFocus
                                                value={this.state.username}
                                                onChange={this.formChange}
                                                helperText="Please type in your username"
                                          />
                                          <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                name="password"
                                                label="Password"
                                                variant="outlined"
                                                type="password"
                                                id="password"
                                                value={this.state.password}
                                                onChange={this.formChange}
                                                helperText="Please type in your password"
                                          />
                                          <TextField
                                                select
                                                required
                                                fullWidth
                                                name="tenant"
                                                label="Tenant"
                                                variant="outlined"
                                                value={this.state.tenant}
                                                SelectProps={{
                                                      native: true
                                                }}
                                                helperText="Please select your tenant"
                                                id="tenant"
                                                onChange={this.formChange}
                                          >
                                                {this.state.tenants.map((option) => (
                                                      <option key={option.value} value={option.value}>
                                                            {option.label}
                                                      </option>
                                                ))}
                                          </TextField>
                                          <TextField
                                                select
                                                required
                                                fullWidth
                                                name="auth"
                                                label="auth"
                                                variant="outlined"
                                                SelectProps={{
                                                      native: true
                                                }}
                                                value={this.state.auth}
                                                onChange={this.formChange}
                                                helperText="Please select your Authentication mechanism"
                                                id="auth"
                                          >
                                                {this.loginTypes.map((option) => (
                                                      <option key={option.value} value={option.value}>
                                                            {option.label}
                                                      </option>
                                                ))}
                                          </TextField>
                                          <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
                                                Login
                                          </Button>
                                    </form>
                              </div>
                              <Box mt={8}>
                                    <Copyright />
                              </Box>
                              <AlertDialog openModal={this.state.openModal} message={this.state.ModelMessage} markComplete={this.markComplete} />
                        </Container>
                  );
            }
      }
}

export default withStyles(useStyles)(Login);
