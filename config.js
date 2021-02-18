module.exports = {
    slackToken: process.env["SLACK_TOKEN"], // xoxp-...
    statusByWiFiName: {
        "Home_SSID": {
            "status_text": "Working remotely",
            "status_emoji": ":house:",
            "status_expiration": 0
        },
        "Office_SSID": {
            "status_text": "In the office",
            "status_emoji": ":office:",
            "status_expiration": 0
        },
        "Mobile_SSID": {
            "status_text": "In the office",
            "status_emoji": ":office:",
            "status_expiration": 0
        },
        "clearStatus": {
            "status_text": "",
            "status_emoji": "",
        }
    },
    updateInterval: 60000 // every second
}
