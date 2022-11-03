/**
 * @file      com.js
 * @brief     Communication with the pod
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
 * @module Communication.Communication
 * @version 1.2.0
 *
 * @listens dgram:socket~error
 * @listens dgram:socket~message
 * @listens dgram:socket~listening
 * @listens electron:ipcRenderer~startLogging
 * @listens electron:ipcRenderer~stopLogging
 * @listens electron:ipcRenderer~packet
 *
 * @emits electron:ipcRenderer~connected
 * @emits electron:ipcRenderer~error
 * @emits electron:ipcRenderer~packet
 * @emits electron:ipcRenderer~console_log
 */

// IPC renderer to communicate with main GUI renderer
const { remote, ipcRenderer } = require('electron');

// To create folders and streams and files
const fs = require('fs');

// To create network sockets
const dgram = require('dgram');

// To create csv data and pipe into file streams
const csv = require('fast-csv');

// Library to work with date objects
const moment = require('moment');

// To parse and create telemetry data based on typesets
const jBinary = require('jbinary');

// Useful utilities
const util = require('../util.js');

// Parser for telemetry frames
const Parser = require('./parser.js').Parser;

const typeset_ctrl_frame = require('../typesets/typeset_ctrl_frame.js').typeset;
const typeset_telemetry_frame = require('../typesets/typeset_telemetry_frame.js').typeset;

// Load configuration settings
const config = require('../../config/config');

class Communication {
    /**
     * @constructor
     *
     * Creates new communication module including a network socket; three csv streams for telemetry and
     * control frames. It further sends heartbeat messages to the pod on a regular basis.
     * A heartbeat is simply a empty (all zero) control frame.
     */
    constructor() {
        /**
         * CSV stream for telemetry frames
         * @type {CsvTransformStream}
         */
        this.csv_stream_telemetry = csv.format({headers: true, delimiter: ';', rowDelimiter: '\r\n'});

        /**
         * CSV stream for control frames
         * @type {CsvTransformStream}
         */
        this.csv_stream_ctrl = csv.format({headers: true, delimiter: ';', rowDelimiter: '\r\n'});

        /**
         * Socket to communicate (send and receive) messages from the pod.
         * @type {dgram.Socket}
         */
        this.socketReceive = dgram.createSocket( {reuseAddr: true, type : 'udp4'});
        this.socketSend = dgram.createSocket(  {type : 'udp4'});

        /**
         * Used to disable heartbeats
         * @type {boolean}
         */
        this.send_heartbeat = true;

        /**
         *  Parser for telemetry frames
         * @type {Parser}
         */
        this.parser = new Parser(
            this,
            this.csv_stream_telemetry,
        );

        /**
         * Wherever the logging of control frames is enabled
         * @type {boolean}
         */
        this.loggingControlEnabled = false;

        /**
         * Wherever there is a connection.
         * This is not automatically reset after a loss of communication.
         * @type {boolean}
         */
        this.connected = false;

        // Setup event listeners
        this.setupLoggingListeners();
        this.setupNetworkListeners();

        this.socketReceive.bind(config.communication.udp_port_listen);

        // Send heartbeats on a frequent basis
        setInterval(this.sendHeartbeat.bind(this), config.communication.heartbeat_freq);

        if (config.testing.enabled) {
            // Send random testing data to the socket.
            setInterval(this.sendTestData.bind(this), config.testing.interval);
        }
    }

    /**
     * Setup listener for logging.
     * @package
     */
    setupLoggingListeners() {
        // Create log file and csv stream and start logging on IPC command fom main GUI renderer
        ipcRenderer.on('startLogging', () => {
            // Create logging path & folder
            let appPath = remote.app.getAppPath();
            let logPath = `${appPath}/logbooks`;
            let time = moment().format("YYYY-MM-DD_HH-mm-ss");
            let filename_telemetry = logPath + "/log_" + time + "_telemetry.csv";
            let filename_ctrl = logPath + "/log_" + time + "_ctrl.csv";

            if (config.verbosity > 0) {
                ipcRenderer.send('console_log',"[INFO] Log Path: " + logPath);
            }

            // Create 'logbooks' directory if it doesn't exist:
            if (!fs.existsSync(logPath)) {
                fs.mkdirSync(logPath);
            }

            this.csv_stream_telemetry = csv.format({headers: true, delimiter: ';', rowDelimiter: '\r\n'});
            this.csv_stream_ctrl = csv.format({headers: true, delimiter: ';', rowDelimiter: '\r\n'});

            this.parser.set_csv_telemetry_stream(this.csv_stream_telemetry);

            // Create and configure write stream to log file
            this.telemetry_fileStream = fs.createWriteStream(filename_telemetry);
            this.ctrl_fileStream = fs.createWriteStream(filename_ctrl);

            // Write csv data to file:
            this.csv_stream_telemetry.pipe(this.telemetry_fileStream);
            this.csv_stream_ctrl.pipe(this.ctrl_fileStream);

            // Report errors to ipc which are then displayed in the main GUI window
            this.telemetry_fileStream.on('error', (error) => {
                ipcRenderer.send("error", error);
                console.log(error)
            });
            this.ctrl_fileStream.on('error', (error) => {
                ipcRenderer.send("error", error);
                console.log(error);
            });

            this.loggingControlEnabled = true;
        });

        // Stop logging and close file on IPC command fom main GUI renderer
        ipcRenderer.on('stopLogging', () => {
            this.loggingControlEnabled = false;
            setTimeout(() => {
                this.telemetry_fileStream.end();
                this.ctrl_fileStream.end();
            }, 200);
        });
    }

    /**
     * Setup listener for UDP networking
     * @package
     */
    setupNetworkListeners() {
        this.socketReceive.on('error',(err) => {
            ipcRenderer.send("error", err);
        });

        // The message event is fired, when a UDP packet arrives destined for this server..
        this.socketReceive.on('message', (data) => {
            // Pipe data from server into parser:
            this.parser.append_buffer(data);
            if (this.connected === false) {
                ipcRenderer.send("connected");
                this.connected = true;
            }
            ipcRenderer.send("packet");
        });

        // The listening event is fired, when the server has initialized and all ready to receive UDP packets
        this.socketReceive.on('listening', () => {
            const address = this.socketReceive.address();
            ipcRenderer.send('console_log',`[INFO] Server Address: ${address.address}:${address.port}`);
            ipcRenderer.send('console_log',`[INFO] Pod Address: ${config.communication.udp_host_send}:${config.communication.udp_port_send}`);
            if (config.verbosity > 5) ipcRenderer.send('console_log',"[DEBUG] Socket Receive Buffer Size:", this.socketReceive.getRecvBufferSize());
        });

        ipcRenderer.on("sendCtrlFrame", (_event, payload) =>{
            this.sendCtrlFrame(payload);
        });

        this.socketReceive.on('close',() => {
            ipcRenderer.send('console_log',`[WARN] Socket close!`);
        });
    }

    /**
     * Send heartbeat to pod
     * @package
     */
    sendHeartbeat() {
        if (this.send_heartbeat) this.sendCtrlFrame();
    }

    /**
     * Send a control frame to the pod
     * @example
     *  comm.sendCtrlFrame({
     *       "set_state": 0,
     *       "bms_active_l": 1,
     *       "battery": 1
     *   });
     *
     *   comm.sendCtrlFrame();
     *
     * @param {object} ctrl_frame JSON with control frame
     * @param {number} verbosity Required verbosity level to show message
     * @public
     */
    sendCtrlFrame(ctrl_frame= undefined, verbosity = 0) {
        // Crate jBinary object based on control frame typeset
        let raw_frame = new jBinary(typeset_ctrl_frame.Length, typeset_ctrl_frame);

        // If frame is not just a simple heartbeat
        if (ctrl_frame !== undefined) {
            // Parse object to jBinary
            let temp_ctrl_frame = raw_frame.readAll()
            Object.assign(temp_ctrl_frame, ctrl_frame);
            raw_frame.writeAll(temp_ctrl_frame)
            if (config.verbosity > verbosity && config.verbosity > 2) {
                ipcRenderer.send('console_log',"Control Frame", JSON.parse(JSON.stringify( raw_frame.readAll())));
            }
            if (config.verbosity > 6) ipcRenderer.send('console_log',"Control Frame", raw_frame.view.buffer.toString('hex'))
        } else {
            // Parse object to jBinary
            raw_frame.writeAll(raw_frame.readAll());
            if (config.verbosity > 10) ipcRenderer.send('console_log',"[DEBUG] Heartbeat");
        }

        // Send data buffer to pod
        this.socketSend.send(raw_frame.view.buffer, config.communication.udp_port_send, config.communication.udp_host_send, function(err, bytes) {
            if (err) {
                ipcRenderer.send('console_log',err);
                throw err;
            }
        });

        // Don't log heartbeats
        if (this.loggingControlEnabled && !(ctrl_frame === undefined)) {
            let frame = raw_frame.readAll();
            // Fat time is not useful instead save timestamp in the right format
            delete frame.fat_time;
            frame.Timestamp = moment().format("YYYY-MM-DDTHH:mm:ss.SSS");

            this.csv_stream_ctrl.write(util.flatten(frame));
        }
    }

    /**
     * Send test data to pod
     * @package
     */
    sendTestData() {
        // Create array with random data:
        let testData = util.createTestingData(typeset_telemetry_frame.Length, config.testing.random);
        let port    = config.testing.enabled ? config.communication.udp_port_listen : config.communication.udp_port_send;
        let address = config.testing.enabled ? "127.0.0.1" : config.communication.udp_host_send;
        this.socketReceive.send(testData, port, address, function(err) {
            if (err) throw err;
        });
    }
}

module.exports = {
    Communication: Communication
};