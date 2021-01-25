import React from 'react';
import Homepage from './components/Homepage';
import MonitorPage from './components/MonitorPage';

import { BrowserRouter, Route } from 'react-router-dom';

import './App.css';

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Route path="/" exact component={Homepage} />
          <Route path="/monitor" exact component={MonitorPage} />
        </div>
      </BrowserRouter>
    )
  }
}

export default App;
