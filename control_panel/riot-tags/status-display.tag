<status-display>
    <div class="connection-status" ref="connectionStatus">⃡</div>
    <div class="error-status" id="errorStatus" ref="errorStatus">{ errorStatus }</div>
    <div class="main" ref="main">{ mainStatus }</div>
    <div class="heartbeat-status" ref="heartbeatStatus">{ heartbeatStatus }</div>
    <div class="log-status"  ref="logStatus">{ logStatus }</div>

<style>

status-display {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 50%;
    -webkit-transform: translate(-50%);
    border-radius: 5px;
    box-shadow: 0 0.5px 1px 0 #9E9E9E;
    background-color: #FFF;
}

.main {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    left: 0;
    line-height: 52px;
    text-align: center;
}

.heartbeat-status, .error-status, .connection-status, .log-status {
    position: absolute;
    width: 100%;
    color: #9E9E9E;
    font-size: 12px;
}

.error-status {
    left: 4px;
    bottom: 2px;
}

.heartbeat-status {
    text-align: right;
    right: 4px;
    top: 20px;
}

.connection-status {
    display: none;
    text-align: right;
    bottom: 2px;
    right: 6px;
    color: green;
    }

.log-status {
    text-align: right;
    top: 2px;
    right: 4px;
}

</style>

    <script>

    this.mainStatus = "Waiting...";
    this.heartbeatStatus = "No Connection";
    this.errorStatus = "No Emergency";
    this.logStatus = "Logging Paused"

    let errors = [];

    this.on('mount', function() {

            $(document).ready(function(){
                $("#errorStatus a").tooltip();
            });

            // Errors:
            this.opts.commandEmitter.on('errorStatus', (function(state) {
                if (!state) {
                    this.refs.errorStatus.style.color = "#9E9E9E";
                    this.refs.errorStatus.innerHTML = "No Emergency";
                }else {
                    this.refs.errorStatus.style.color = "#FF0000";
                    this.refs.errorStatus.innerHTML = state.join('<br />');
                }

            }).bind(this));

            this.opts.ipcRenderer.on('missingHeartbeat', (function() {
                this.refs.heartbeatStatus.style.color = "#F00";
                this.refs.heartbeatStatus.style.fontWeight = "bold";
                this.refs.heartbeatStatus.innerHTML = "Missing Heartbeat!";
                this.refs.main.innerHTML = "Missing Heartbeat!"
                this.refs.main.style.color = "red";
            }).bind(this));

            // Connection status:
            this.opts.ipcRenderer.on('heartbeat', (function() {
                this.refs.heartbeatStatus.style.color = "#9E9E9E";
                this.refs.heartbeatStatus.style.fontWeight = "normal";
                this.refs.heartbeatStatus.innerHTML = "Connected";
                this.update();
            }).bind(this));

            this.opts.ipcRenderer.on('packet', (function() {

                this.refs.connectionStatus.style.display = "block";
                setTimeout(() => {
                this.refs.connectionStatus.style.display = "none";
                }, 50);

            }).bind(this));

            // Pod_overview status:
            this.opts.commandEmitter.on('mainStatus', (function(state) {

                    this.refs.main.innerHTML = state;
                    this.refs.main.style.color = "red";
                    if (state === "IDLE") this.refs.main.style.color = "green";
                    if (state === "READY") this.refs.main.style.color = "#ffc107";
                    if (state === "CHARGING") this.refs.main.style.color = "#ffc107";
                    if (state === "RUN") this.refs.main.style.color = "#ff7500";
                    if (state === "CRAWL") this.refs.main.style.color = "#ff7500";
                    this.update();

            }).bind(this));

            // Logging status:
            this.opts.commandEmitter.on('startLogging', (function() {

                this.logStatus = 'Logging Active';
                this.update();

            }).bind(this));

            this.opts.commandEmitter.on('stopLogging', (function() {

                this.logStatus = 'Logging Paused';
                this.update();

            }).bind(this));

        });

    </script>

</status-display>
