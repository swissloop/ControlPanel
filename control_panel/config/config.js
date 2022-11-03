const config = {
    "verbosity": 6,
    "communication": {
        "udp_port_listen"   : 1338,
        "udp_host_send"     : "192.168.1.6",
        "udp_port_send"     : 1337,
        "heartbeat_freq"    : 200,
        "heartbeat_timeout" : 500
    },
    "logging": {
        "start_automatic": true,
        "start_state": "Setup",
        "start_delay": 0,
        "stop_automatic": true,
        "stop_state": "Idle",
        "stop_delay": 1000
    },
    "battery": {
        "lv_capacity": 6300
    },
    "github": {
        "telemetry_frame_src": "https://api.github.com/repos/{owner}/{repo}/contents/{path}",
        "github_access_token": "<SECRET_TOKEN>",
    },
    "music": {
        "waiting": true,
        "onConnection": true,
        "onSuccess": true,
        "onEmergency": true
    },
    "testing": {
        "enabled" : false,
        "interval": 400,
        "random"  : true
    },
    "logviewer": {
        "max_states": 9,
        "reduce_series": false,
        "padding-left": 130
    }
}

module.exports = config
