/**
 * @file      progress_bar.js
 * @brief     Progress bars in GUI
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
 * @module GUI:ProgressBars
 * @version 3.0.0
 *
 * @listens electron:ipcRenderer~telemetryFrame
 * @listens window~load
 *
 */

const $ = require('jquery');
const {ipcRenderer } = require('electron');
const mappings = require('../../config/mappings');
const util = require('../util');

class ProgressBars {
    /**
     * Constructor
     * @param eventEmitter App-wide command emitter.
     */
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        // Add event listeners
        window.addEventListener("load", () => {
            this.add_event_listeners();
        });
    }

    /**
     * Setup listener for new telemetry frame
     * @package
     */
    add_event_listeners() {
        ipcRenderer.on('telemetryFrame', (_event, frame) =>{
            this.update_progress_bars(frame);
        });
    }

    /**
     * Update progress bars with new data from frame
     * @param {object} frame Parsed jBinary TelemetryFrame
     */
    update_progress_bars(frame) {
        let phase = frame["FPGA"]["FPGA_PHASE"];
        let position = frame["FPGA"]["FPGA_POSITION"];
        let subphase = frame["FPGA"]["FPGA_SUBPHASE"];
        let run_distance = frame["Configuration"]["CONFIG_RUN_DISTANCE"];
        let setPosition = frame["Configuration"]["SETPOSITION"];
        let max_position = 72;
        let run_distance_percentage = position / run_distance;
        let start_distance_percentage = setPosition / run_distance;
        let bar_percentage = start_distance_percentage - run_distance_percentage;

        $('#progress_corrail span').text("Pos: " + position + " / Phase: 0b" + util.dec2bin(phase, 3) + " / Sub: 0b" + util.dec2bin(subphase, 6));
        $("#progress_corrail div.bg-run").css("width: ",  100 + "%"); //  + "left:" + start_distance_percentage + "%"
        $("#progress_corrail div.bg-brake").css("width: ",  100 + "%"); //  + "left:" + start_distance_percentage + "%"
        $('#progress_corrail').css("background",  `linear-gradient(90deg, #e9ecef ${100*0}%, #aeafb4 ${100*1}%)`);

        // $("#progress_corrail div.bg-run").css("width", 100*Math.min(progress_corrail / track_length, run_distance_percentage) + "%");
        // $("#progress_corrail div.bg-brake").css("width", 100*Math.max(0,  (progress_corrail-run_distance) / track_length) + "%");
        // $('#progress_corrail').css("background",  `linear-gradient(90deg, #e9ecef ${100*run_distance_percentage}%, #aeafb4 ${100*run_distance_percentage}%)`);

    }
}

function init(eventEmitter) {
    return new ProgressBars(eventEmitter);
}

module.exports = init;