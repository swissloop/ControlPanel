/**
 * @file      state_table.js
 * @brief     State table in GUI
 * 
 * @author    Hanno Hiss, hanno.hiss@swissloop.ch
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
 * @module GUI:State_Table
 * @version 3.0.0
 *
 * @listens electron:ipcRenderer~telemetryFrame
 * @listens window~load
 *
 */

const $ = require('jquery');
const {ipcRenderer } = require('electron')

const mappings = require('../../config/mappings.js');
const util = require('../util.js')

class StateTable {
    /**
     * Constructor
     * @param eventEmitter App-wide command emitter.
     */
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        // Add event listeners
        window.addEventListener("load", () => {
            this.generate_table();
            this.add_event_listeners();
        });
        $(document).ready(function(){
            $("[rel='tooltip'], .tooltip").tooltip();
        });

        this.state_list = mappings.enum_list.filter(value => value.type === "FSM")
    }

    /**
     * Setup listener for new telemetry frame
     * @package
     */
    add_event_listeners() {
        ipcRenderer.on('telemetryFrame', (_event, frame) =>{
           this.update_table(frame);
        });
    }

    /**
     * Initially generate table skeleton
     * @package
     */
    generate_table() {
        this.table = document.getElementById("state-table-body");

        for (let j = 0; j < this.state_list.length; j ++) {
            // Create an empty <tr> element and add it to the i'th position of the table:
            let row = this.table.insertRow(j);

            // Insert new cells (<td> elements) at the 1st and 2nd  and 3rd position of the "new" <tr> element:
            let name = row.insertCell(0);
            let state = row.insertCell(1);
            let ready = row.insertCell(2);
            let state_param = this.state_list[j];

            // Add some text to the new cells:
            name.innerHTML = state_param.name;
            state.innerHTML = "not init";
        }
    }

    /**
     * Update table with new data from frame
     * @param {object} frame Parsed jBinary TelemetryFrame
     */
    update_table(frame) {
        // let length = this.state_list.length;

        this.state_list.forEach( (element, i) => {
            let category = element.path.split(".")[0];
            let name     = element.path.split(".")[1];
            let value    = frame[category][name];
            let ready_val = undefined;

            let table_cell = this.table.rows[i].cells[1]
            let ready_cell = this.table.rows[i].cells[2]
            let state = util.json_array_select_value(element.enum, value)

            // get ready value for system
            if (element.hasOwnProperty('ready')) {
                // if ready path is defined
                let ready_cat = element.ready.split(".")[0];
                let ready_name = element.ready.split(".")[1];
                ready_val = frame[ready_cat][ready_name];
            } else if (element.path === "State.STATE") {
                // VCU has Ready low only in Emergency state
                if (state.description == "Emergency") {
                    ready_val = 0;
                } else {
                    ready_val = 1;
                }
            } else {
                // set ready value so displays NaN
                ready_val = 2;
            }

            // set HTML text
            table_cell.innerHTML = state.description;
            ready_cell.innerHTML = ready_val;

        });
    }
}

function init(eventEmitter) {
    return new StateTable(eventEmitter);
}

module.exports = init;