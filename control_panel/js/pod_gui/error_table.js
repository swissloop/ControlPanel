/**
 * @file      error_table.js
 * @brief     Error table in GUI
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
 * @module GUI:ProtocolTable
 * @version 3.0.0
 *
 * @listens electron:ipcRenderer~telemetryFrame
 * @listens window~load
 *
 */

const $ = require('jquery');
const {ipcRenderer } = require('electron')

const mappings = require('../../config/mappings.js');

class ErrorTable {
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
        this.table = document.getElementById("error-table-body");

        for (let j = 0; j < mappings.errors_list.length; j ++) {
            // Create an empty <tr> element and add it to the i'th position of the table:
            let row = this.table.insertRow(j);

            // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
            let name = row.insertCell(0);
            let errors = row.insertCell(1);
            let error_param = mappings.errors_list[j];
            name.innerHTML = error_param.name;
            errors.innerHTML = "None";
        }
    }

    /**
     * Update table with new data from frame
     * @param {object} frame Parsed jBinary TelemetryFrame
     */
    update_table(frame) {
        let length = mappings.errors_list.length;
        let rows = this.table.rows;

        let errors = [];

        mappings.errors_list.forEach( (element, i) => {
            let category = element.path.split(".")[0];
            let name     = element.path.split(".")[1];
            let value    = frame[category][name];
            let source  = undefined;

            if (element.hasOwnProperty('index')) value = frame[category][name][element.index];

            if (element.hasOwnProperty('source')) {
                let source_path  = element.source.split(".")[1];
                source = frame[category][source_path];
                value = frame[category][name];
            }

            let table_cell = this.table.rows[i].cells[1]

            table_cell.innerHTML = "";

            let error_number = 0
            for (let j = 0; j < element.enum.length; j++) { // json errors length
                if (value & parseInt(element.enum[j].flag)) {
                    error_number += 1;
                    if (source !== undefined) {
                        //  Select only values with known source
                        if ( !( (source[error_number-1] === element.index) || (element.index === -1 && error_number > 8) )) {
                            continue;
                        }
                    }
                    if (table_cell.innerHTML.length > 0) {
                        table_cell.innerHTML += ", ";
                    }
                    if (element.enum[j].description !== undefined) {
                        table_cell.innerHTML += `<a href="#" data-toggle="tooltip" data-placement="top" title="${element.enum[j].description}">${element.enum[j].error_type}</a>`;
                    } else {
                        table_cell.innerHTML += element.enum[j].error_type;
                    }
                }
            }
            if (table_cell.innerHTML === "") {
                table_cell.innerHTML = "None";
            }

        });

        if (frame["State"]["VCU_ERRORS"] !== 0 ||
            frame["State"]["VCU_EMERGENCY_REASON"] !== 0 ) {
            errors.push("VCU Error");
        }

        if (frame["Inverter"]["ICUFPGASTATE"] !== 0 ||
            frame["Inverter"]["ICUMCUSTATE"] !== 0 ||
            frame["Inverter"]["GD_STATUS"] !== 0 ) {
            errors.push("Inverter Error");
        }

        if (frame["HV_Right"]["HV_R_ERROR"] !== 0 ||
            frame["HV_Left"]["HV_L_ERROR"] !== 0) {
            errors.push("Battery Error");
        }
        this.eventEmitter.emit('errorStatus', errors);
    }
}

function init(eventEmitter) {
    return new ErrorTable(eventEmitter);
}

module.exports = init;