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
import {withStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import AlertDialog from '../../../middleware/ResponseDialog';
import Box from '@material-ui/core/Box';

const useStyles = (theme) => ({
      root: {
            minWidth: 275,
            paddingLeft: '10px'
      },
      bullet: {
            display: 'inline-block',
            margin: '0 2px',
            transform: 'scale(0.8)'
      },
      title: {
            fontSize: 14
      },
      pos: {
            marginBottom: 12
      },
      field: {
            paddingTop: '10px',
            paddingLeft: '10px',
            paddingRight: '10px'
      },
      buttonCreate: {
            marginTop: '20px'
      },
      form: {
            paddingBottom: '15px'
      }
});

class formbox extends Component {
      state = {
            formfields: {},
            openModal: false,
            ModelMessage: {},
            LoadId: '-1',
            trackUpdateID: ''
      };

      formChange = (event) => {
            var eventval = typeof event.target.value === 'object' ? JSON.stringify(event.target.value, null, 2) : event.target.value;
            var newField = {[event.target.name]: eventval};
            var newState = Object.assign(this.state.formfields, newField);
            this.setState({formfields: newState});
      };

      formrenderer = (value) => {
            const {classes} = this.props;
            if (value.value.type === 'text') {
                  return (
                        <Grid item xs={6} className={classes.field}>
                              <TextField
                                    size="small"
                                    fullWidth
                                    name={value.value.field}
                                    label={value.value.placeholder}
                                    type="text"
                                    id={value.value.field}
                                    value={this.state.formfields[value.value.field] || ''}
                                    onChange={this.formChange}
                                    disabled={value.value.locked}
                              />
                        </Grid>
                  );
            } else if (value.value.type === 'password') {
                  return (
                        <Grid item xs={6} className={classes.field}>
                              <TextField
                                    size="small"
                                    fullWidth
                                    name={value.value.field}
                                    label={value.value.placeholder}
                                    type="password"
                                    id={value.value.field}
                                    value={this.state.formfields[value.value.field] || ''}
                                    onChange={this.formChange}
                                    disabled={value.value.locked}
                              />
                        </Grid>
                  );
            } else if (value.value.type === 'integer') {
                  return (
                        <Grid item xs={6} className={classes.field}>
                              <TextField
                                    size="small"
                                    fullWidth
                                    name={value.value.field}
                                    label={value.value.placeholder}
                                    type="number"
                                    id={value.value.field}
                                    value={this.state.formfields[value.value.field] || ''}
                                    onChange={this.formChange}
                                    disabled={value.value.locked}
                              />
                        </Grid>
                  );
            } else if (value.value.type === 'textarea') {
                  return (
                        <Grid item xs={12} className={classes.field}>
                              <TextField
                                    size="small"
                                    fullWidth
                                    name={value.value.field}
                                    label={value.value.placeholder}
                                    type="textarea"
                                    multiline={true}
                                    id={value.value.field}
                                    value={this.state.formfields[value.value.field] || ''}
                                    onChange={this.formChange}
                                    disabled={value.value.locked}
                              />
                        </Grid>
                  );
            } else if (value.value.type === 'jsonarea') {
                  return (
                        <Grid item xs={12} className={classes.field}>
                              <TextField
                                    size="small"
                                    fullWidth
                                    name={value.value.field}
                                    label={value.value.placeholder}
                                    type="textarea"
                                    multiline={true}
                                    id={value.value.field}
                                    value={this.state.formfields[value.value.field] || '{}'}
                                    onChange={this.formChange}
                                    disabled={value.value.locked}
                              />
                        </Grid>
                  );
            } else if (value.value.type === 'dropdown') {
                  var drowdownOptions = [];
                  value.value.values.forEach((element) => {
                        drowdownOptions.push({value: element, label: element});
                  });
                  return (
                        <Grid item xs={6} className={classes.field}>
                              <TextField
                                    select
                                    fullWidth
                                    name={value.value.field}
                                    label={value.value.placeholder}
                                    id={value.value.field}
                                    value={this.state.formfields[value.value.field] || ''}
                                    onChange={this.formChange}
                                    disabled={value.value.locked}
                                    SelectProps={{
                                          native: true
                                    }}
                              >
                                    {drowdownOptions.map((option) => (
                                          <option key={option.value} value={option.value}>
                                                {option.label}
                                          </option>
                                    ))}
                              </TextField>
                        </Grid>
                  );
            } else if (value.value.type === 'boolean') {
                  const booleanOptions = [
                        {
                              value: true,
                              label: 'True'
                        },
                        {
                              value: false,
                              label: 'False'
                        }
                  ];
                  var labelVal = this.state.formfields[value.value.field];
                  if (typeof this.state.formfields[value.value.field] !== 'string') {
                        labelVal = this.state.formfields[value.value.field] ? 'true' : 'false';
                  }

                  return (
                        <Grid item xs={6} className={classes.field}>
                              <TextField
                                    select
                                    fullWidth
                                    name={value.value.field}
                                    label={value.value.placeholder}
                                    id={value.value.field}
                                    value={labelVal || ''}
                                    onChange={this.formChange}
                                    disabled={value.value.locked}
                                    SelectProps={{
                                          native: true
                                    }}
                              >
                                    {booleanOptions.map((option) => (
                                          <option key={option.value} value={option.value}>
                                                {option.label}
                                          </option>
                                    ))}
                              </TextField>
                        </Grid>
                  );
            } else {
                  return <div></div>;
            }
      };

      runCreatAPI = (e) => {
            e.preventDefault();
            const apiUrl = '/api/v1/' + this.props.definition['createapi'];
            fetch(apiUrl, {
                  method: 'POST',
                  body: JSON.stringify(this.state.formfields),
                  headers: {
                        'Content-Type': 'application/json'
                  }
            })
                  .then((response) => response.json())
                  .then((data) => {
                        this.setState({openModal: true, ModelMessage: data});
                  });
      };

      runUpdateAPI = (e) => {
            e.preventDefault();
            const apiUrl = '/api/v1/' + this.props.definition['updateapi'] + '/' + this.state.LoadId;
            fetch(apiUrl, {
                  method: 'PUT',
                  body: JSON.stringify(this.state.formfields),
                  headers: {
                        'Content-Type': 'application/json'
                  }
            })
                  .then((response) => response.json())
                  .then((data) => {
                        this.setState({openModal: true, ModelMessage: data});
                  });
      };

      runDeleteAPI = (e) => {
            e.preventDefault();
            const apiUrl = '/api/v1/' + this.props.definition['deleteapi'] + '/' + this.state.trackUpdateID;
            fetch(apiUrl, {
                  method: 'DELETE'
            })
                  .then((response) => response.json())
                  .then((data) => {
                        this.setState({openModal: true, ModelMessage: data});
                  });
      };

      runGetAPI = (e) => {
            e.preventDefault();
            const apiUrl = '/api/v1/' + this.props.definition['getapi'] + '/' + this.state.trackUpdateID;
            fetch(apiUrl, {
                  method: 'GET'
            })
                  .then((response) => response.json())
                  .then((data) => {
                        this.setState({openModal: true, ModelMessage: data});
                  });
      };


      markComplete = (message) => this.setState({openModal: false});

      createForm = () => {
            var newState = {};
            Object.entries(this.state.formfields).forEach(([name, value]) => {
                  newState[name] = null;
            });

            this.setState({LoadId: '0', trackUpdateID: '', formfields: newState});
            this.props.definition['create'].forEach((formfield) => {
                  if (typeof formfield.defaultValue !== 'undefined') {
                        var newField = {[formfield.field]: typeof formfield.defaultValue === 'object' ? JSON.stringify(formfield.defaultValue, null, 12) : formfield.defaultValue};
                        newState = Object.assign(newState, newField);
                  }
            });
            this.setState({formfields: newState});
      };

      trackUpdateIDChange = (event) => this.setState({trackUpdateID: event.target.value});

      updateForm = () => {
            if (this.state.trackUpdateID.length > 1) {
                  const apiUrl = '/api/v1/' + this.props.definition['searchapi'] + this.props.definition['searchid'] + '=' + this.state.trackUpdateID;
                  fetch(apiUrl, {
                        method: 'GET',
                        headers: {
                              'Content-Type': 'application/json'
                        }
                  })
                        .then((response) => response.json())
                        .then((data) => {
                              console.log(data);
                              if (data.reqCompleted && data.data.length === 0) {
                                    this.setState({openModal: true, ModelMessage: {MSG: 'No data found for request'}});
                              } else if (data.reqCompleted && data.data.length === 1) {
                                    this.setState({formfields: data.data[0], LoadId: this.state.trackUpdateID});
                              } else if (data.reqCompleted && data.data.length > 1) {
                                    this.setState({openModal: true, ModelMessage: {MSG: 'Too many possible matches to the request'}});
                              } else {
                                    this.setState({openModal: true, ModelMessage: data});
                              }
                        });
            } else {
                  this.setState({openModal: true, ModelMessage: {msg: 'Search Field should be a minimum length of 1'}});
            }
      };

      doNothing = (e) => {
            e.preventDefault();
      };

      render() {
            const {classes} = this.props;
            const Formrenderer = this.formrenderer;
             if ((typeof this.props.definition['createapi'] !== 'undefined')   ) {
                  return (
                        <div>
                              <form className={classes.form} noValidate onSubmit={this.doNothing}>
                                    <Card className={classes.root} variant="outlined">
                                          <CardContent>
                                                <Box bgcolor="background.paper">
                                                      <Button variant="contained" size="small" color="primary" onClick={this.createForm}>
                                                            Create {this.props.definition.createapi}
                                                      </Button>
                                                </Box>
                                                {/* This is update form  trigger for field creation*/}
                                                {(typeof this.props.definition['updateapi'] !== 'undefined' || typeof this.props.definition['deleteapi'] !== 'undefined') && (
                                                      <React.Fragment>
                                                            <Box bgcolor="background.paper" className={classes.buttonCreate}>
                                                                  <Typography variant="subtitle1" gutterBottom>
                                                                        - OR -{' '}
                                                                  </Typography>
                                                            </Box>
                                                            <TextField
                                                                  size="small"
                                                                  name={'trackUpdateID'}
                                                                  label={this.props.definition.updateid}
                                                                  type="text"
                                                                  id={'trackUpdateID'}
                                                                  value={this.state.trackUpdateID || ''}
                                                                  onChange={this.trackUpdateIDChange}
                                                                  helperText={'Please enter the ' + (typeof this.props.definition.update !== 'undefined' ? this.props.definition.updateid : this.props.definition.deleteid) + ' to '+(typeof this.props.definition.update !== 'undefined' ? 'load /' :'')+' delete'}
                                                            />
                                                      </React.Fragment>
                                                )}
                                          </CardContent>
                                          
                                          <CardActions>
                                          {/* This is update form  trigger*/}
                                          {typeof this.props.definition['updateapi'] !== 'undefined' && (
                                                      <Button variant="contained" size="small" color="primary" onClick={this.updateForm}>
                                                            Load {this.props.definition.updateid} Update Form
                                                      </Button>
                                          )}
                                          {typeof this.props.definition['getapi'] !== 'undefined' && (
                                                      <Button variant="contained" size="small" color="primary" onClick={this.runGetAPI}>
                                                            Get
                                                      </Button>
                                          )}    
                                          {typeof this.props.definition['deleteapi'] !== 'undefined' && (
                                                      <Button variant="contained" size="small" color="secondary" onClick={this.runDeleteAPI}>
                                                            Delete
                                                      </Button>
                                          )}                                      
                                          </CardActions>
                                    </Card>
                              </form>

                              {/* This is create form */}
                              {this.state.LoadId === '0' && (
                                    <form className={classes.form} noValidate onSubmit={this.runCreatAPI}>
                                          <Card className={classes.root} variant="outlined">
                                                <CardContent>
                                                      <Box bgcolor="background.paper">
                                                            <Typography variant="h6" gutterBottom>
                                                                  Create Form
                                                            </Typography>
                                                      </Box>
                                                      <Grid container className={classes.root}>
                                                            {/* This is create field interator form */}
                                                            {this.props.definition['create'].map((value) => {
                                                                  return <Formrenderer value={value} key={value.field} />;
                                                            })}
                                                      </Grid>
                                                </CardContent>
                                                <CardActions>
                                                      <Button type="submit" variant="contained" size="small" color="primary">
                                                            Create
                                                      </Button>
                                                </CardActions>
                                          </Card>
                                    </form>
                              )}

                              {/* This is update form */}
                              {this.state.LoadId !== '0' && this.state.LoadId !== '-1' && (
                                    <form className={classes.form} noValidate>
                                          <Card className={classes.root} variant="outlined">
                                                <CardContent>
                                                      <Box bgcolor="background.paper">
                                                            <Typography variant="h6" gutterBottom>
                                                                  Update Form
                                                            </Typography>
                                                      </Box>
                                                      <Grid container className={classes.root}>
                                                            {/* This is update field interator form */}
                                                            {this.props.definition['update'].map((value) => {
                                                                  return <Formrenderer value={value} key={value.field} />;
                                                            })}
                                                      </Grid>
                                                </CardContent>
                                                <CardActions>
                                                      <Button variant="contained" size="small" color="primary" onClick={this.runUpdateAPI}>
                                                            Update
                                                      </Button>
                                                </CardActions>
                                          </Card>
                                    </form>
                              )}
                              <AlertDialog openModal={this.state.openModal} message={this.state.ModelMessage} markComplete={this.markComplete} />
                        </div>
                  );
            } else {
                  return <div></div>;
            }
      }
}

export default withStyles(useStyles)(formbox);
