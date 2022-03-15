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
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import Chip from '@material-ui/core/Chip';

const DialogContent = withStyles((theme) => ({
      root: {
            padding: theme.spacing(2)
      }
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
      root: {
            margin: 0,
            padding: theme.spacing(1)
      }
}))(MuiDialogActions);

class ResponseDialog extends Component {
      flatten = (obj, path = '') => {
            if (!(obj instanceof Object)) return {[path.replace(/\.$/g, '')]: obj};

            return Object.keys(obj).reduce((output, key) => {
                  return obj instanceof Array ? {...output, ...this.flatten(obj[key], path + '[' + key + '].')} : {...output, ...this.flatten(obj[key], path + key + '.')};
            }, {});
      };

      render() {
            return (
                  <div>
                        <Dialog onClose={this.handleClose} aria-labelledby="customized-dialog-title" open={this.props.openModal}>
                              <DialogContent dividers>
                                    {Object.entries(this.flatten(this.props.message)).map(([name, value]) => {
                                          const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
                                          return (
                                                <React.Fragment key={nameCapitalized}>
                                                      {nameCapitalized === 'ReqCompleted' && value.toString() === 'true' && <Chip size="small" label="Request Completed" color="primary" />}
                                                      {nameCapitalized === 'ReqCompleted' && value.toString() === 'false' && <Chip size="small" label="Request Failed" style={{backgroundColor: '#E26D5A'}} />}
                                                      {nameCapitalized !== 'ReqCompleted' && (
                                                            <pre key={nameCapitalized}>
                                                                  {nameCapitalized}: {value.toString()}
                                                            </pre>
                                                      )}
                                                </React.Fragment>
                                          );                                         
                                    })}
                              </DialogContent>
                              <DialogActions>
                                    <Button autoFocus onClick={this.props.markComplete} color="primary">
                                          Close
                                    </Button>
                              </DialogActions>
                        </Dialog>
                  </div>
            );
      }
}

export default ResponseDialog;
