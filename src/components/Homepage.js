import React, { Component } from 'react';
import Tooshilights_Logo from '../assets/Tooshlights_Logo.png';

class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      version: "",
      hubId: "",
      showModularSelection: false,
      modularHubId: "",
      errorMsg: ""
    }
  }

  handleHubIdChange = (e) => {
    this.setState({
      hubId: e.target.value
    })
    if (e.target.value === '6DE7E4D80000' || e.target.value === 'AAF814D80000' || e.target.value === 'F10414D80000') {
      this.setState({
        showModularSelection: true,
        modularHubId: ""
      })
    } else {
      this.setState({
        showModularSelection: false,
        modularHubId: ""
      })
    }
  }

  handleVersionChange = (e) => {
    this.setState({
      version: e.target.value
    })
  }

  handleModularHubsChange = (e) => {
    this.setState({
      modularHubId: e.target.value
    })
  }

  handleSubmit = (e) => {
    const {hubId, modularHubId, version} = this.state;
    if (version.length === 0) {
      this.setState({
        errorMsg: "Version is Emptry"
      })
    } else if (hubId.length === 0 && modularHubId.length === 0) {
      this.setState({
        errorMsg: "HubID is Emptry"
      })
    } else {
      if (modularHubId.length > 0) {
        this.props.history.push({pathname: "/monitor", hubId: modularHubId, version: version}); 
      } else {
        this.props.history.push({pathname: "/monitor", hubId: hubId, version: version}); 
      }
    }
  }

  render() {
    const {version, hubId, modularHubId, showModularSelection, errorMsg} = this.state;
    return (
      <div>
        <div className="home-container">
          <a href="https://tooshlights.com/">
            <img src={Tooshilights_Logo}  alt="tooshlights logo here" className="home-logo-img"></img>
          </a>
          <p className="home-title">Select a correct version</p>
          <select value={version} onChange={this.handleVersionChange} className="home-input">
              <option value=""></option>
              <option value="1">v1</option>
              <option value="2">v2</option>
              <option value="3">v3</option>
            </select>
            <p className="home-title">Enter a Hub ID</p>
          <input type="text" name="HubId" value={hubId} 
              onChange={this.handleHubIdChange} className="home-input"/>
          {showModularSelection && <div>
            <p className="home-title">Which HUBs in this set to show</p>      
            <select value={modularHubId} onChange={this.handleModularHubsChange} className="home-input">
              <option value=""></option>
              <option value="F10414D80000">POD #1 F10414D80000</option>
              <option value="AAF814D80000">POD #2 AAF814D80000</option>
              <option value="6DE7E4D80000">POD #3 6DE7E4D80000</option>
              <option value="F10414D80000,AAF814D80000,6DE7E4D80000">Show All HUBs</option>
            </select>
          </div>
          }
            {errorMsg && errorMsg.length > 0 && <span className="home-error-msg">{errorMsg}</span>}
            <button onClick={this.handleSubmit}  className="home-submit-btn">Submit</button>
            <p className="home-script">For Technical Support, please call <a href="tel:+855.866.7458">855.866.7458</a> or <a href="mailto:techsupport@modus-systems.com">techsupport@modus-systems.com</a></p>

        </div>
      </div>
    );
  }
}

export default Homepage;