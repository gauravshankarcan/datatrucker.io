/*
* Copyright 2021 Datatrucker.io Inc , Ontario , Canada
* Builder: Gaurav Shankar <gauravshankar.can@gmail.com>
*/
import React, { Component } from 'react';
import './App.css';
import Main from './components/views/main/Main';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { lightTheme, darkTheme, getStoredThemeMode, storeThemeMode } from './theme/theme';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { themeMode: getStoredThemeMode() };
  }

  toggleTheme = () => {
    const next = this.state.themeMode === 'light' ? 'dark' : 'light';
    storeThemeMode(next);
    this.setState({ themeMode: next });
  };

  render() {
    const theme = this.state.themeMode === 'dark' ? darkTheme : lightTheme;
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App">
          <Main themeMode={this.state.themeMode} onToggleTheme={this.toggleTheme} />
        </div>
      </ThemeProvider>
    );
  }
}

export default App;
