import React, { Component } from 'react';
import axios from 'axios';

import women_bg from '../assets/women_bg.gif'; // with import
import men_bg from '../assets/men_bg.gif';

import red_bg from '../assets/red_bg.gif';
import orange_bg from '../assets/orange_bg.gif';
import blue_bg from '../assets/blue_bg.gif';

import women_top_left from '../assets/women_top_left.png';
import men_top_left from '../assets/men_top_left.png';

import outer_frame from '../assets/outer_frame.png';

import inner_frame from '../assets/inner_frame.png';

import man from '../assets/man.png';
import woman from '../assets/woman.png';

import Tooshilights from '../assets/Tooshlights.png';
import modular_logo from '../assets/modular_logo.png';

import { Client, Message } from '@stomp/stompjs';
const WS_ENDPOINT = `ws://${process.env.REACT_APP_MESSAGE_BROKER_HOST}:${process.env.REACT_APP_MESSAGE_BROKER_PORT}/ws`


const CRON_INTERVAL = 1500;

class MonitorPage extends Component {
  constructor(props) {
    super(props);
    const { hubId, version } = props.location;
    if (version === undefined) {
      this.props.history.push({ pathname: "/" });
    }
    if (hubId === undefined) {
      this.props.history.push({ pathname: "/" });
    }
    this.state = {
      cronJob: null,
      hubId: hubId,
      version: version,
      men_count: -1,
      men_counts: [-1, -1, -1],
      men_total: 1,
      women_count: -1,
      women_total: 1,
      current_date: "",
      current_time: "",
      errorMsg: ""
    }
  }

  componentDidMount() {
    // cron job to fetch data from backend
    const { hubId, version } = this.state;
    var routingKey
    if (hubId && hubId.split(",").length > 1) {
      routingKey = '#'
         this.getAllModularMonitorData(hubId, version);
      //   this.cronJob = setInterval(this.getAllModularMonitorData, CRON_INTERVAL, hubId, version);
    } else {
      routingKey = hubId
      this.getMonitorData(hubId, version);
      //   this.cronJob = setInterval(this.getMonitorData, CRON_INTERVAL, hubId, version);
    }


  }

  componentWillUnmount() {
    /*
      stop continuing to run even
      after unmounting this component
    */
    clearInterval(this.cronJob);
  }

  getAllModularMonitorData = async (hubId, version) => {
    if (version ==3) {
      console.log(version)

      const result = await axios({
        method: 'get',
        url: `http://${process.env.REACT_APP_SERVER_URI}/api/sensor-status?campus_id=4`,
       // data: { campus_id: 4},
        headers: { "Access-Control-Allow-Origin": "*" }
      })
      console.log(result.data)
      var vacants2 = result.data[0].filter(val => val.stallStatus=='O')
      var vacants1 = result.data[1].filter(val => val.stallStatus=='O' )
      var vacants0 = result.data[2].filter(val => val.stallStatus=='O')
      this.setState({
        men_counts: [vacants0.length, vacants1.length, vacants2.length],
       // current_date: feed_datetime[0],
       // current_time: feed_datetime[1],
        errorMsg: ""
      })
      var that = this

      // subscribe using STOMP
const client = new Client({
  brokerURL: `${WS_ENDPOINT}`,
  connectHeaders: {
    login: process.env.REACT_APP_MESSAGE_BROKER_USERNAME,
    passcode: process.env.REACT_APP_MESSAGE_BROKER_PASSWORD,
  },
  debug: function (str) {
    console.log(str);
  },
  // reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});
client.onConnect = function (frame) {
  console.log('done')
  // Do something, all subscribes must be done is this callback
  // This is needed because this will be executed after a (re)connect
  var subscription = client.subscribe(`/exchange/Modular Power Solution/#`, function (message) {
    // called when the client receives a STOMP message from the server

    if (message.body) {
      var receivdData = JSON.parse(message.body)
      var key
      if(receivdData.hubID=='6DE7E4D80000')
      key=2
      else if(receivdData.hubID=='AAF814D80000')
      key=1
      else if(receivdData.hubID=='F10414D80000')
      key=0
      var vacants = that.state.men_counts
      vacants[key] = receivdData.availableStalls
      that.setState({
        men_counts: vacants,
        //  women_count: message.body.women_count,
       // men_total: receivdData.totalStalls,
        // women_total: message.body.women_total,
        //  current_date: feed_datetime[0],
        //   current_time: feed_datetime[1],
        errorMsg: ""
      })

    } else {
      console.log('got empty message');
    }
  });
};

client.onStompError = function (frame) {
  // Will be invoked in case of error encountered at Broker
  // Bad login/passcode typically will cause an error
  // Complaint brokers will set `message` header with a brief message. Body may contain details.
  // Compliant brokers will terminate the connection after any error
  console.log('Broker reported error: ' + frame.headers['message']);
  console.log('Additional details: ' + frame.body);
};

client.activate();
    } else {
    const API_URL = `/api/count?id=${hubId}&version=${version}`;
    axios
      .get(API_URL)
      .then(response => {
        const { men_counts } = this.state;
        const data = response.data;
        if (data[0].men_count === men_counts[0]
          && data[1].men_count === men_counts[1]
          && data[2].men_count === men_counts[2]) {
          const current_datetime = this.computeDateTime(new Date());
          this.setState({
            current_date: current_datetime[0],
            current_time: current_datetime[1],
            errorMsg: ""
          })
        } else {
          const feed_datetime = this.computeDateTime(new Date(data.feed_time));
          this.setState({
            men_counts: [data[0].men_count, data[1].men_count, data[2].men_count],
            current_date: feed_datetime[0],
            current_time: feed_datetime[1],
            errorMsg: ""
          })
        }
      })
      .catch(err => {
        if (err.response && err.response.data.message) {
          this.setState({
            errorMsg: err.response.data.message
          })
        } else {
          this.setState({
            errorMsg: err.message
          })
        }
      })
    }
  }

  getMonitorData =  async (hubId, version) => {
    //console.log(this.state)

    if (version ==3) {
      console.log(version)

      const result = await axios({
        method: 'get',
        url: `http://${process.env.REACT_APP_SERVER_URI}/api/sensor-status?campus_id=4`,
      //  data: { campus_id: 4, hub_id: hubId},
        headers: { "Access-Control-Allow-Origin": "*" }
      })
      console.log(result.data)
      var key
      if(hubId=='6DE7E4D80000')
      key=0
      else if(hubId=='AAF814D80000')
      key=1
      else if(hubId=='F10414D80000')
      key=2
      var vacants = result.data[key].filter(val => val.stallStatus=='O')
      this.setState({
        men_count: vacants.length,
       // women_count: data.women_count,
        men_total: result.data.length,
       // women_total: data.women_total,
      //  current_date: feed_datetime[0],
       // current_time: feed_datetime[1],
        errorMsg: ""
      })
      var that = this

          // subscribe using STOMP
    const client = new Client({
      brokerURL: `${WS_ENDPOINT}`,
      connectHeaders: {
        login: process.env.REACT_APP_MESSAGE_BROKER_USERNAME,
        passcode: process.env.REACT_APP_MESSAGE_BROKER_PASSWORD,
      },
      debug: function (str) {
        console.log(str);
      },
      // reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
    client.onConnect = function (frame) {
      console.log('done')
      // Do something, all subscribes must be done is this callback
      // This is needed because this will be executed after a (re)connect
      var subscription = client.subscribe(`/exchange/Modular Power Solution/${hubId}`, function (message) {
        // called when the client receives a STOMP message from the server

        if (message.body) {
          var receivdData = JSON.parse(message.body)
          that.setState({
            men_count: receivdData.availableStalls,
            //  women_count: message.body.women_count,
            men_total: receivdData.totalStalls,
            // women_total: message.body.women_total,
            //  current_date: feed_datetime[0],
            //   current_time: feed_datetime[1],
            errorMsg: ""
          })

        } else {
          console.log('got empty message');
        }
      });
    };

    client.onStompError = function (frame) {
      // Will be invoked in case of error encountered at Broker
      // Bad login/passcode typically will cause an error
      // Complaint brokers will set `message` header with a brief message. Body may contain details.
      // Compliant brokers will terminate the connection after any error
      console.log('Broker reported error: ' + frame.headers['message']);
      console.log('Additional details: ' + frame.body);
    };

    client.activate();
      
    } else {
      const API_URL = `/api/count?id=${hubId}&version=${version}`;
      axios
        .get(API_URL)
        .then(response => {
          const { men_count, women_count } = this.state;
          const data = response.data[0];
          if (!data) {
            this.setState({
              errorMsg: "ID is Not Valid"
            })
          } else if (data.men_count === men_count && data.women_count === women_count) {
            const current_datetime = this.computeDateTime(new Date());
            this.setState({
              current_date: current_datetime[0],
              current_time: current_datetime[1],
              men_total: data.men_total,
              women_total: data.women_total,
              errorMsg: ""
            })
          } else {
            const feed_datetime = this.computeDateTime(new Date(data.feed_time));
            this.setState({
              men_count: data.men_count,
              women_count: data.women_count,
              men_total: data.men_total,
              women_total: data.women_total,
              current_date: feed_datetime[0],
              current_time: feed_datetime[1],
              errorMsg: ""
            })
          }
        })
        .catch(err => {
          if (err.response && err.response.data.message) {
            this.setState({
              errorMsg: err.response.data.message
            })
          } else {
            this.setState({
              errorMsg: err.message
            })
          }
        })
    }
  }


  computeDateTime = (feedTime) => {
    // Current Date
    var date = (feedTime.getMonth() + 1) + '-' + feedTime.getDate() + '-' + feedTime.getFullYear();
    // Current Time
    var hour, minute;
    let time = "";
    hour = feedTime.getHours();
    minute = this.checkTime(feedTime.getMinutes());

    if (hour > 12) {
      hour = hour - 12;
      if (hour === 12) {
        hour = this.checkTime(hour);
        time = hour + ":" + minute + " AM";
      } else {
        hour = this.checkTime(hour);
        time = hour + ":" + minute + " PM";
      }
    } else if (hour === 12) {
      time = hour + ":" + minute + " PM";;
    } else {
      time = hour + ":" + minute + " AM";;
    }
    return [date, time];
  }

  checkTime = (i) => {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  handleToggleFullscreen = () => {
    if (window.innerWidth <= 370) {
      var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null);

      var docElm = document.getElementById("monitor-wrapper");
      if (!isInFullScreen) {
        if (docElm.requestFullscreen) {
          docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
          docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
          docElm.webkitRequestFullScreen();
        } else if (docElm.msRequestFullscreen) {
          docElm.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    }
  }

  render() {
    console.log(this.state)
    let { hubId, men_counts, men_count, women_count, men_total, women_total, current_date, current_time, errorMsg } = this.state;
    var has_men = (men_count >= 0 && women_count < 0);
    var has_women = (men_count < 0 && women_count >= 0);
    var has_both = (men_count >= 0 && women_count >= 0);
    var men_ratio = 0
    if (men_count * 2 <= men_total) men_ratio += 1;
    if (men_count === 0) men_ratio += 1;
    var women_ratio = 0
    if (women_count * 2 <= women_total) women_ratio += 1;
    if (women_count === 0) women_ratio += 1;

    if (hubId && (hubId === '6DE7E4D80000' || hubId === 'AAF814D80000' || hubId === 'F10414D80000')) {
      return (
        <div className="root">
          <div className="modular-wrapper" id="monitor-wrapper" onClick={this.handleToggleFullscreen}>
            {hubId === '6DE7E4D80000' && <img src={red_bg} alt="man" className="bg-img" />}
            {hubId === 'AAF814D80000' && <img src={blue_bg} alt="man" className="bg-img" />}
            {(hubId === 'F10414D80000' || hubId === 'E15FE4D80000') && <img src={orange_bg} alt="man" className="bg-img" />}

            <img src={outer_frame} alt="outer-frame" className="outer-frame" />

            <div className="content-wrapper">
              <div className="empty-row-1-huge"></div>

              <div className="stalls-row">
                <div className="stalls-container">
                  <div className="modular-stalls-text-container">
                    {men_count > 1 && <div className="modular-stalls-text-huge">Stalls Available</div>}
                    {men_count <= 1 && <div className="modular-stalls-text-huge">Stall Available</div>}
                  </div>
                </div>
              </div>

              <div className="empty-row-2-huge"></div>

              <div className="icon-row-huge">
                <div className="icon-container-huge">
                  <img src={inner_frame} alt="inner-frame" className="inner-frame" />
                  <div className="seats-number-huge" id="MenseatsNumber">{men_count}</div>
                </div>
              </div>

              <div className="empty-row-3-huge"></div>

              <div className="footer-row">
                <div className="date-time-container">
                  <div className="date-time-text-container">
                    <div className="date-time-text-huge" id="current_date">{current_time}</div>
                    <div className="date-time-text-huge date-time-text-2" id="current_time">{current_date}</div>
                  </div>
                </div>
                <div className="error-msg-container">
                  {errorMsg && errorMsg.length > 0 && <span className="error-msg">{errorMsg}</span>}
                </div>
                <div className="footer-logo">
                  <img src={modular_logo} alt="modular logo here" className="footer-modular-logo-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    } else if (hubId && hubId.split(",").length > 1) {
      return (
        <div className="root">
          <div className="modular-wrapper" id="monitor-wrapper" onClick={this.handleToggleFullscreen}>
            <img src={orange_bg} alt="man" className="bg-img-left" />
            <img src={blue_bg} alt="man" className="bg-img-middle" />
            <img src={red_bg} alt="man" className="bg-img-right" />

            <img src={outer_frame} alt="outer-frame" className="outer-frame" />

            <div className="content-wrapper">
              <div className="header-row">
                <div className="heading" id="manHeading">MEN</div>
              </div>
              <div className="icon-row">
                <div className="icon-container">
                  <img src={inner_frame} alt="inner-frame" className="inner-frame" />
                  <img src={man} alt="man" className="icon" />
                </div>
              </div>

              <div className="empty-row-1"></div>

              <div className="num-row">
                <div className="modular-num-container">
                  <div className="seats-number-container-left">
                    <div className="seats-number">{men_counts[0]}</div>
                  </div>
                  <div className="seats-number-container-middle">
                    <div className="seats-number">{men_counts[1]}</div>
                  </div>
                  <div className="seats-number-container-right">
                    <div className="seats-number">{men_counts[2]}</div>
                  </div>
                </div>
              </div>

              <div className="empty-row-2"></div>

              <div className="stalls-row">
                <div className="stalls-container">
                  <div className="modular-stalls-text-container">
                    <div className="modular-stalls-text">Stalls Available</div>
                  </div>
                </div>
              </div>

              <div className="footer-row">
                <div className="date-time-container">
                  <div className="date-time-text-container">
                    <div className="date-time-text" id="current_date">{current_time}</div>
                    <div className="date-time-text date-time-text-2" id="current_time">{current_date}</div>
                  </div>
                </div>
                <div className="error-msg-container">
                  {errorMsg && errorMsg.length > 0 && <span className="error-msg">{errorMsg}</span>}
                </div>
                <div className="footer-logo">
                  <img src={modular_logo} alt="modular logo here" className="footer-modular-logo-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="root">
          <div className="wrapper" id="monitor-wrapper" onClick={this.handleToggleFullscreen}>
            {has_women && <img src={women_bg} alt="woman" className="bg-img" />}
            {has_men && <img src={men_bg} alt="man" className="bg-img" />}
            {has_both && <img src={men_bg} alt="man" className="bg-img" />}

            {has_women && <img src={women_top_left} alt="top-left" className="top-left" />}
            {has_men && <img src={men_top_left} alt="top-left" className="top-left" />}
            {has_both && <img src={men_top_left} alt="top-left" className="top-left" />}

            <img src={outer_frame} alt="outer-frame" className="outer-frame" />

            <div className="content-wrapper">
              <div className="header-row">
                {has_women && <div className="heading" id="womanHeading">WOMEN</div>}
                {has_men && <div className="heading" id="manHeading">MEN</div>}
                {has_both && <div className="heading-both-man" id="manHeading">MEN</div>}
                {has_both && <div className="heading-both-woman" id="manHeading">WOMEN</div>}
              </div>
              <div className="icon-row">
                {has_both && <div className="icon-container-both">
                  <img src={inner_frame} alt="inner-frame" className="inner-frame-both" />
                  <img src={woman} alt="woman" className="icon-both-man" />
                  <img src={man} alt="man" className="icon-both-woman" />
                </div>}
                {has_women && <div className="icon-container">
                  <img src={inner_frame} alt="inner-frame" className="inner-frame" />
                  <img src={woman} alt="woman" className="icon" />
                </div>}
                {has_men && <div className="icon-container">
                  <img src={inner_frame} alt="inner-frame" className="inner-frame" />
                  <img src={man} alt="man" className="icon" />
                </div>}
              </div>

              <div className="empty-row-1"></div>

              <div className="num-row">
                <div className="num-container">
                  {has_both && <div>
                    {men_ratio === 0 &&
                      <div className="seats-number-container-both-man">
                        <div className="seats-number-both-man" id="MenseatsNumber">{men_count}</div>
                      </div>}

                    {men_ratio === 1 &&
                      <div className="seats-number-container-both-man-low">
                        <div className="seats-number-both-man" id="MenseatsNumber">{men_count}</div>
                      </div>}

                    {men_ratio === 2 &&
                      <div className="seats-number-container-both-man-very-low">
                        <div className="seats-number-both-man" id="MenseatsNumber">{men_count}</div>
                      </div>}

                    {women_ratio === 0 && <div className="seats-number-container-both-woman">
                      <div className="seats-number-both-woman" id="WomanseatsNumber">{women_count}</div>
                    </div>}

                    {women_ratio === 1 && <div className="seats-number-container-both-woman-low">
                      <div className="seats-number-both-woman" id="WomanseatsNumber">{women_count}</div>
                    </div>}

                    {women_ratio === 2 && <div className="seats-number-container-both-woman-very-low">
                      <div className="seats-number-both-woman" id="WomanseatsNumber">{women_count}</div>
                    </div>}
                  </div>
                  }

                  {has_men && men_ratio === 0 && <div className="seats-number-container">
                    <div className="seats-number" id="MenseatsNumber">{men_count}</div>
                  </div>
                  }

                  {has_men && men_ratio === 1 && <div className="seats-number-container-low">
                    <div className="seats-number" id="MenseatsNumber">{men_count}</div>
                  </div>
                  }

                  {has_men && men_ratio === 2 && <div className="seats-number-container-very-low">
                    <div className="seats-number" id="MenseatsNumber">{men_count}</div>
                  </div>
                  }

                  {has_women && women_ratio === 0 && <div className="seats-number-container">
                    <div className="seats-number" id="WomanseatsNumber">{women_count}</div>
                  </div>
                  }

                  {has_women && women_ratio === 1 && <div className="seats-number-container-low">
                    <div className="seats-number" id="WomanseatsNumber">{women_count}</div>
                  </div>
                  }

                  {has_women && women_ratio === 2 && <div className="seats-number-container-very-low">
                    <div className="seats-number" id="WomanseatsNumber">{women_count}</div>
                  </div>
                  }

                </div>
              </div>

              <div className="empty-row-2"></div>

              <div className="stalls-row">
                <div className="stalls-container">
                  {((has_women && women_count > 1) || (has_men && men_count > 1)) && <div className="stalls-text-container">
                    <div className="stalls-text">Stalls Available</div>
                  </div>}
                  {((has_women && women_count <= 1) || (has_men && men_count <= 1)) && <div className="stalls-text-container">
                    <div className="stalls-text">Stall Available</div>
                  </div>}
                  {has_both && (women_count + men_count > 1) && <div className="stalls-text-container-both">
                    <div className="stalls-text-both">Stalls Available</div>
                  </div>}
                  {has_both && (women_count + men_count <= 1) && <div className="stalls-text-container-both">
                    <div className="stalls-text-both">Stall Available</div>
                  </div>}
                </div>
              </div>

              <div className="footer-row">
                <div className="date-time-container">
                  <div className="date-time-text-container">
                    <div className="date-time-text" id="current_date">{current_time}</div>
                    <div className="date-time-text date-time-text-2" id="current_time">{current_date}</div>
                  </div>
                </div>
                <div className="error-msg-container">
                  {errorMsg && errorMsg.length > 0 && <span className="error-msg">{errorMsg}</span>}
                </div>
                <div className="footer-logo">
                  <img src={Tooshilights} alt="tooshlights logo here" className="footer-logo-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

  }
}

export default MonitorPage;