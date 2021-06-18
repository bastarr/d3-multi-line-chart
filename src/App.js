import React from 'react';
import './App.css';

import { SyncMetricsChart } from './components/SyncMetricsChart';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  render() {
    return (
      <div ref={this.ref}>
        <SyncMetricsChart/>
      </div>
    );
  }
}

export default App;