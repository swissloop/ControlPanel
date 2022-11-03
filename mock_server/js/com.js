/**
 * @file      com.js
 * @brief     Communication module via UDP
 *
 * @author    Philip Wiese, philip.wiese@swissloop.ch
 * 
 * @license
 * Copyright (C) 2022 Swissloop
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @module mock_server/Communication
 * @version 3.0.0
 *
 */

const jBinary = require('jbinary');
const util = require('../../control_panel/js/util.js');

const dgram = require('dgram');
const EventEmitter = require('events').EventEmitter;

const config = require('../config/config');

const typeset_config_frame = require('../../control_panel/js/typesets/typeset_ctrl_frame.js').typeset;

class Communication {
    /**
     * Constructor
     * @param {jBinary} binary_frame jBinary TelemetryFrame
     * @param {object} frame Parsed jBinary TelemetryFrame
     */
    constructor(binary_frame, frame) {
        this.binary_frame = binary_frame;
        this.frame = frame;
        this.commandEmitter = new EventEmitter();
        this.commandEmitter.setMaxListeners(Infinity);

        this.udp_host_send = config.udp_host_send;
        this.udp_port_send = config.udp_port_send;
        this.udp_port_listen = config.udp_port_listen;


        $("#udp_host_send").val(this.udp_host_send);
        $("#udp_port_send").val(this.udp_port_send );
        $("#udp_port_listen").val(this.udp_port_listen );

        this.socket = dgram.createSocket('udp4');

        this.connected = false;

        // Setup event listeners
        this.setupNetworkListeners();
        this.setupConfigListeners(this);

        this.socket.bind(this.udp_port_listen);

        // Send heartbeat every 200ms
        setInterval(this.send_telemetry_frame.bind(this), config.packet_frequency);
        this.heartbeatTimeout = setTimeout(this.missingHeartbeat.bind(this), config.heartbeat_timeout);
    }


    /**
     * Setup listener for UDP networking
     * @package
     */
    setupNetworkListeners() {
        this.socket.on('error',(err) => {
            console.log("[WARN] ", err)
        });

        this.socket.on('close',() => {
            console.log("[WARN] Socket close!");
        });

        // The message event is fired, when a UDP packet arrives destined for this server..
        this.socket.on('message', (data) => {
            this.commandEmitter.emit("packet");
            let frame_parser = new jBinary(data, typeset_config_frame);
            let frame = frame_parser.readAll();

            // Check for heartbeats (empty frames)
            if (!util.ctr_frame_isEmpty(frame) && config.verbosity) console.log("Control Frame", frame)
        });

        // The listening event is fired, when the server has initialized and all ready to receive UDP packets
        this.socket.on('listening', () => {
            const address = this.socket.address();
            console.log(`[INFO] Pod Address: ${address.address}:${address.port}`);
            console.log(`[INFO] Server Address: ${config.udp_host_send}:${config.udp_port_send}`);
        });

        this.commandEmitter.on("packet", () =>{

            if (this.heartbeatTimeout) {
                $("#connStatus").css({"fill": "green"});
                clearTimeout(this.heartbeatTimeout);
                this.heartbeatTimeout = setTimeout(this.missingHeartbeat.bind(this), config.heartbeat_timeout);
            }

            if (!this.connected) {
                this.commandEmitter.emit("connected");
                this.connected = true;
            }
        });
    }

    /**
     * Setup listener for configuration in GUI
     * @package
     */
    setupConfigListeners(context) {
        $("#save_config").on('click', function () {
            context.udp_host_send = $("#udp_host_send").val();
            context.udp_port_send = $("#udp_port_send").val();
            const address = context.socket.address();
            console.log(`[INFO] Pod Address: ${address.address}:${address.port}`);
            console.log(`[INFO] Server Address: ${context.udp_host_send}:${context.udp_port_send}`);
        });
    }

    /**
     * Send telemetry data to ControlPanel
     *
     * @package
     */
    send_telemetry_frame() {
        this.frame.Sync.SYNC = 0xCAFE
        // Parse frame object to jBinary
        this.binary_frame.writeAll(this.frame);

        if (config.verbosity > 7) console.log("Telemetry Frame", this.frame)
        this.socket.send(this.binary_frame.view.buffer, this.udp_port_send, this.udp_host_send, function(err) {
             if (err) throw err;
         });
    }


    missingHeartbeat (){
        $("#connStatus").css({"fill": "red"});
        console.log("Heartbeat Timeout")
    }
}

module.exports = {
    Communication: Communication
};