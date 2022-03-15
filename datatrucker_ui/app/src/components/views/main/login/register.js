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
import {Redirect} from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
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

class Register extends Component {
      state = {
            execute: false,
            username: '',
            password: '',
            confirmpassword: '',
            openModal: false,
            ModelMessage: {},
            redirect: false
      };

      componentDidMount() {
            const apiUrl = '/api/v1/statuschecks/is-intialized';
            fetch(apiUrl)
                  .then((response) => response.json())
                  .then((data) => {
                        if (!data.status) {
                              this.setState({execute: true});
                        } else {
                              this.setState({redirect: true});
                        }
                  });
      }

      createUser = (e) => {
            e.preventDefault();
            const apiUrl = '/api/v1/statuschecks/intialize';
            if (this.state.password === this.state.confirmpassword) {
                  fetch(apiUrl, {
                        method: 'POST',
                        body: JSON.stringify({
                              username: this.state.username,
                              password: this.state.password
                        }),
                        headers: {
                              'Content-Type': 'application/json'
                        }
                  })
                        .then((response) => response.json())
                        .then((data) => {
                              if (data.reqCompleted) {
                                    this.setState({redirect: true});
                              } else {
                                    this.setState({openModal: true, ModelMessage: data});
                              }
                        });
            } else {
                  this.setState({openModal: true, ModelMessage: 'Passwords dont match'}); 
            }
      };

      formChange = (event) => this.setState({[event.target.name]: event.target.value});

      markComplete = (message) => this.setState({openModal: false});

      render() {
            const {classes} = this.props;
            if (this.state.redirect) {
                  return <Redirect to="/login" />;
            } else if (!this.state.execute) {
                  return <h6>...verifying server setup with backend</h6>;
            } else {
                  return (
                        <Container component="main" maxWidth="xs">
                              <CssBaseline />
                              <div className={classes.paper}>
                                    <Avatar className={classes.avatar}>
                                          <SupervisorAccountIcon />
                                    </Avatar>
                                    <Typography component="h1" variant="h5">
                                          Create a Admin User
                                    </Typography>
                                    <form className={classes.form} noValidate onSubmit={this.createUser}>
                                          <TextField margin="normal" required fullWidth id="username" label="Username" name="username" value={this.state.username} onChange={this.formChange} />
                                          <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="password" value={this.state.password} onChange={this.formChange} />
                                          <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                name="confirmpassword"
                                                label="Confirm Password"
                                                type="password"
                                                id="confirmpassword"
                                                autoComplete="confirmpassword"
                                                value={this.state.confirmpassword}
                                                onChange={this.formChange}
                                          />
                                          <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
                                                Create Admin User
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

export default withStyles(useStyles)(Register);
