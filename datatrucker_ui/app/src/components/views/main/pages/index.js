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
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';

import Table from './Editable';
import FormBox from './formbox';
import Copyright from '../../../middleware/Copyright';
import DocuLink from './DocuLink';

export default class index extends Component {
      state = {
            definition: {},
            renderTable: false,
            annotations: {},
            redirect: false
      };
      

   
      componentDidMount() {
            const apiUrlValidate = '/api/v1/validate';
            fetch(apiUrlValidate)
                  .then((responseValidate) => responseValidate.json())
                  .then((dataValidate) => {
                        if (!dataValidate.reqCompleted) {
                              this.setState({redirect: true});
                        }
                  });
            const apiUrl = '/api/v1/ui/resource-definitions?module=' + this.props.path;
            fetch(apiUrl)
                  .then((response) => response.json())
                  .then((data) => {
                        this.setState({definition: data});
                  });
      }

      render() {
            if (!this.state.redirect) {
                  return (
                        <div>
                              <Grid container spacing={3}>
                                    <Grid item xs={6}>
                                          <Box pl={1} pb={1} bgcolor="background.paper">
                                                <Typography variant="h4" gutterBottom>
                                                      {this.state.definition['trucker-page-title']}
                                                </Typography>
                                          </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                          <DocuLink link={this.state.definition['DocuLink']} />
                                    </Grid>
                              </Grid>

                              {this.state.definition['searchapi'] && (
                                    <Box pl={1} pb={5} bgcolor="background.paper">
                                          <Typography variant="h6" gutterBottom>
                                                {this.state.definition['trucker-page-info']}
                                          </Typography>
                                          <Table render={this.props.path} definition={this.state.definition} />
                                    </Box>
                              )}
                              {this.state.definition['createapi'] && (
                                    <Box pl={1} bgcolor="background.paper">
                                          <Typography variant="h6" gutterBottom>
                                                {this.state.definition['trucker-page-createtableheading']}
                                          </Typography>
                                          <FormBox render={this.props.path} definition={this.state.definition} />
                                    </Box>
                              )}
                              <Box mt={8}>
                                    <Copyright />
                              </Box>
                        </div>
                  );
            } else {
                  return <Navigate to="/login" />;
            }
      }
}
