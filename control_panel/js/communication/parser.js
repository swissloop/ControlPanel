/**
 * @file      parser.js
 * @brief     Parser for different communication frames based on a jBinary 
 *            typesets
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
 * @module Communication.Parser
 * @version 1.2.0
 *
 * @listens electron:ipcRenderer~startLogging
 * @listens electron:ipcRenderer~stopLogging
 *
 * @emits electron:ipcRenderer~missingHeartbeat
 * @emits electron:ipcRenderer~telemetryFrame
 */

// IPC renderer to communicate with main GUI renderer
const { ipcRenderer } = require('electron');

// Library to work with date objects
const moment = require('moment');

// To parse and create telemetry data based on typesets
const jBinary = require('jbinary');

// Useful utilities
const util = require('../util.js');

const typeset_telemetry_frame = require('../typesets/typeset_telemetry_frame.js').typeset;

// Load configuration settings
const config = require('../../config/config');
const mappings = require('../../config/mappings.js');

class Parser {

    /**
     * Parser for binary data
     *
     * @constructor
     * @param {Communication.Communication} communication Communication module.
     * @param {CsvTransformStream} csvStream_telemetry fast-csv object.
     */
    constructor(communication,csvStream_telemetry) {
        /**
         * Reference to communication module
         * @type {Communication.Communication}
         */
        this.communication = communication;

        /**
         * CSV stream for telemetry frames
         * @type {CsvTransformStream}
         */
        this.csvStream_telemetry = csvStream_telemetry;

        /**
         * Telemetry frame typ3set
         * @type {jBinary.typeSet}
         */
        this.typeset_telemetry = typeset_telemetry_frame;

        /**
         * Wherever the logging of telemetry frames is enabled
         * @type {boolean}
         */
        this.loggingTelemetryEnabled = false;

        this.buffer = Buffer.alloc(2048);

        this.telemetryTimeout = setTimeout(this.missingHeartbeat.bind(this), config.communication.heartbeat_timeout);

        // Listener for logging events
        ipcRenderer.on('startLogging', (function() {
            setTimeout(() => {
                this.loggingTelemetryEnabled = true;
            }, 200);

        }).bind(this));

        ipcRenderer.on('stopLogging', (function() {
            this.loggingTelemetryEnabled = false;
        }).bind(this));
    }

    set_csv_telemetry_stream(csvStream_telemetry) {
        this.csvStream_telemetry  = csvStream_telemetry;
    }

    /**
     * Append raw binary data from UDP stream to local buffer.
     * This function also checks for complete frames and parses them.
     *
     * @param {Buffer} raw Binary buffer with raw data from udp stream.
     */
    append_buffer(raw) {
        // Not Tested code for concatenation the telemetry frames that come in and search for the sync word
        // this.buffer = Buffer.concat([this.buffer, raw]);
        this.buffer = raw;
        
        // Do error detection if the udp frame is not the expected length
        if (raw.length != this.typeset_telemetry.Length) {
            if (config.verbosity > 10) ipcRenderer.send('console_log',"[INFO] Length of RAW: " + raw.length + " is not correct");
            return;
        }
        
        // Search for telemetry frame sync word
        let sync_index_tel = this.buffer.indexOf(this.typeset_telemetry.SyncWord, 0, 'hex');

        if (config.verbosity > 10) ipcRenderer.send('console_log',"Telemetry", this.buffer.toString('hex'))

        // Parse all telemetry frame with a fixed known size
        while (sync_index_tel !== -1 && this.typeset_telemetry.Length <= this.buffer.length) {
            // Check if  frame is complete
            if (sync_index_tel + this.typeset_telemetry['Length'] <= this.buffer.length) {
                // Parse complete frame
                let frame_buffer = this.buffer.slice(sync_index_tel, sync_index_tel + this.typeset_telemetry.Length);
                if (config.verbosity > 10) ipcRenderer.send('console_log',"Telemetry", this.buffer.toString('hex'))
                this.parse_telemetry_frame(frame_buffer);
                // Remove complete frame
                this.buffer = this.buffer.slice(sync_index_tel + this.typeset_telemetry.Length);
            }
            sync_index_tel = this.buffer.indexOf(this.typeset_telemetry.SyncWord, 0,'hex');
        }

        // Clear the Heartbeat Timeout
        if (this.telemetryTimeout) {
            clearTimeout(this.telemetryTimeout);
            this.telemetryTimeout = setTimeout(this.missingHeartbeat.bind(this), config.communication.heartbeat_timeout);
            ipcRenderer.send("heartbeat");
        }
    }

    /**
     * This function parses a complete telemetry frame.
     *
     * @param {Buffer} raw_frame Binary buffer containing one telemetry frame.
     */
    parse_telemetry_frame(raw_frame) {
        // Crate jBinary object based on telemetry frame typeset
        let frame_parser = new jBinary(raw_frame, this.typeset_telemetry);
        // Parse frame with jBinary
        let frame = frame_parser.readAll();
        // Add a timestamp to the frame
        frame.Timestamp = moment().format("YYYY-MM-DDTHH:mm:ss.SSS");

        if (this.loggingTelemetryEnabled) {
            // Flatten to "State"."STATE" to "State.STATE"
            let csv_frame = util.flatten(frame);
            // Remove Sync byte
            delete csv_frame['Sync.SYNC'];
            if (this.csvStream_telemetry) this.csvStream_telemetry.write(csv_frame);
        }

        if (config.verbosity > 7) {
            ipcRenderer.send('console_log',"Telemetry_Frame", JSON.parse(JSON.stringify(frame)));
        }
        // Update the GUI
        ipcRenderer.send("telemetryFrame", frame);
    }

    /**
     * Emitter for missing heartbeat. Used as the callback function of a timer on a timeout.
     *
     * @emits electron:ipcRenderer~missingHeartbeat
     */
    missingHeartbeat (){
        ipcRenderer.send("missingHeartbeat");
    }

}

module.exports = {
    "Parser": Parser
};