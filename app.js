"use strict";

require('dotenv').config()
const os = require('os');
const axios = require("axios");
const execSync = require("child_process").execSync;
const querystring = require("querystring");
const config = require("./config");

if (!config.slackToken) {
    console.error("Missing Slack token. Set it in config.js");
    process.exit(1);
}

function getLinuxWiFiName() {
    return execSync("iwgetid -r") // Linux only
            .toString()
            .split("\n")
            .filter(line => line.match(/.+/))
            .find(ssid => true); // find first
}

function getLinuxIpAddress() {
  return '';
  // TODO: linux ip address support
}

function getMacWiFiName() {
    return execSync("/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I") // macos only
            .toString()
            .split("\n")
            .filter(line => line.includes(" SSID: "))
            .map(line => line.match(/: (.*)/)[1])
            .find(ssid => true); // find first
}

function getMacIpAddress() {
  return '';
  // TODO: Mac ip address support
}

function getWinWiFiName() {
    return execSync("netsh wlan show interfaces") // Windows only
            .toString()
            .split("\n")
            .filter(line => line.includes(" SSID "))
            .map(line => line.match(/: (.*)/)[1])
            .find(ssid => true); // find first
}

function getWinIpAddress() {
    return execSync("ipconfig") // Windows only
            .toString()
            .split("\n")
            .filter(line => line.includes("IPv4 Address"))
            .map(line => line.match(/: (.*)/)[1])
            .find(ssid => true); // find first
}

function setSlackStatus(token, status) {
  /*
  const config = {
    headers: { 
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Bearer ${token}`
    }
  }

  axios.post( 
    'https://slack.com/api/users.profile.set',
    status,
    config
  ).then(console.log).catch(console.log);
  */
  
    return axios.post("https://slack.com/api/users.profile.set",
        querystring.stringify({
            token: token,
            profile: JSON.stringify(status)
        }), {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }).then(function(response) {
            console.log("Set Slack status API response: %j", response.data);
        })
        .catch(function(error) {
            console.error("Set Slack status error: %s", error);
        });

}

const platform = os.platform();

let ipAddress;
let getIpAddress;
let wiFiName;
let getWiFiName;
// Get appropriate function for platform
switch (platform) {
  case 'darwin':
    getWiFiName = getMacWiFiName;
    getIpAddress = getMacIpAddress;
    break;
  case 'win32':
    getWiFiName = getWinWiFiName;
    getIpAddress = getWinIpAddress;
    break;
  case 'linux':
    getWiFiName = getLinuxWiFiName;
    getIpAddress = getLinuxIpAddress;
    break;
  default:
    console.error('Unknown platform %s', platform);
    process.exit(2);
}

setInterval(function() {
    //const newIpAddress = getIpAddress();
    const newWiFiName = getWiFiName();
    // if (newWiFiName === wiFiName && newIpAddress === ipAddress) {
    if (newWiFiName === wiFiName) {
        console.log('Status not changed');
        //return;
    }
    //ipAddress = newIpAddress;
    wiFiName = newWiFiName;
    console.log("Connected WiFi SSID: %s", wiFiName);
    //console.log("Connected IP: %s", ipAddress);

    var status = config.statusByWiFiName[wiFiName];
    var clearStatus = config.statusByWiFiName['clearStatus'];
    /*
    if (!status) {
        console.log("Status not specified for WiFi: %s", wiFiName);
        status = config.statusByIpAddress[ipAddress];
        
        if (!status) {
          console.log("Status not specified for IP: %s", ipAddress);
          return;
      }
      
    }
    */
    console.log("Setting Slack status to: %j", clearStatus);
    setSlackStatus(config.slackToken, clearStatus).then(function() {
      if (status) {
        console.log("Setting Slack status to: %j", status);
        setSlackStatus(config.slackToken, status);
      }
  })
    //setSlackStatus(config.slackToken, status);
}, config.updateInterval);
