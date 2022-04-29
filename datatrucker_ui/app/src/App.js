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

import './App.css';
import Main from './components/views/main/Main';

import {ThemeProvider} from '@material-ui/core/styles';
import {createTheme} from '@material-ui/core/styles';

const theme = createTheme({
      palette: {
            primary: {
                  light: '#6fbf73',
                  main: '#4caf50',
                  dark: '#357a38',
                  contrastText: '#fff'
            },
            secondary: {
                  light: '#4aedc4',
                  main: '#1de9b6',
                  dark: '#1de9b6',
                  contrastText: '#000'
            }
      }
});

class App extends Component {
      render() {
            return (
                  <div>
                        <ThemeProvider theme={theme}>
                              <div className="App">
                                    <Main />
                              </div>
                        </ThemeProvider>
                  </div>
            );
      }
}

export default App;
