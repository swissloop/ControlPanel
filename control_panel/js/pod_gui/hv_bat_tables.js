/**
 * @file      hv_bat_tables.js
 * @brief     HV battery temperature and voltage table in GUI
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
 * @module GUI:HV_bat_Table
 * @version 3.0.0
 *
 * @listens electron:ipcRenderer~telemetryFrame
 * @listens window~load
 *
 */

const $ = require('jquery');
const {ipcRenderer } = require('electron')

const mappings = require('../../config/mappings.js');

class HVBat_Table {
    /**
     * Constructor
     * @param eventEmitter App-wide command emitter.
     */
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        // Taking the values of the left hv box since both should always be the same anyways
        this.num_voltages = mappings.typeset_telemetry_frame.Data.HV_Left.HV_L_VOLTAGES[2]
        this.num_temperatures = mappings.typeset_telemetry_frame.Data.HV_Left.HV_L_TEMPERATURES[2]
        
        // Add event listeners
        window.addEventListener("load", () => {
            this.generate_table();
            this.add_event_listeners();
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
        let table_temp_left = document.getElementById("battery-left-temperatures-table-body");
        let table_volt_left = document.getElementById("battery-left-voltages-table-body");

        // Temperature Table Left
        for (let i = 0; i < this.num_temperatures/8; i++) {
            // Create an empty <tr> element and add it to the i'th position of the table:
            let row = table_temp_left.insertRow(i);
            row.insertCell(0).innerHTML = i+1;
            for (let j=1; j<9; j++) {
                row.insertCell(j)
            }
        }

        // Voltages Table Left
        for (let i = 0; i < this.num_voltages/16; i++) {
            // Create an empty <tr> element and add it to the i'th position of the table:
            let row = table_volt_left.insertRow(i);
            row.insertCell(0).innerHTML = i+1;
            for (let j=1; j<18; j++) {
                row.insertCell(j)
            }
        }

        let table_temp_right = document.getElementById("battery-right-temperatures-table-body");
        let table_volt_right = document.getElementById("battery-right-voltages-table-body");

        // Temperature Table Right
        for (let i = 0; i < this.num_temperatures/8; i++) {
            // Create an empty <tr> element and add it to the i'th position of the table:
            let row = table_temp_right.insertRow(i);
            row.insertCell(0).innerHTML = i+1;
            for (let j=1; j<9; j++) {
                row.insertCell(j)
            }
        }

        // Voltages Table Right
        for (let i = 0; i < this.num_voltages/16; i++) {
            // Create an empty <tr> element and add it to the i'th position of the table:
            let row = table_volt_right.insertRow(i);
            row.insertCell(0).innerHTML = i+1;
            for (let j=1; j<18; j++) {
                row.insertCell(j)
            }
        }
    }

    /**
     * Update table with new data from frame
     * @param {object} frame Parsed jBinary TelemetryFrame
     */
    update_table(frame) {
        // Temperature Table Right
        let factor_temp = mappings.typeset_telemetry_frame.Factor.HV_Right.HV_R_TEMPERATURES
        let max_temperature_right = Math.max.apply(Math, frame.HV_Right.HV_R_TEMPERATURES)/factor_temp;
        for (let i = 0; i < this.num_temperatures/8; i++) {
            let row = $(`#battery-right-temperatures-table-body tr:nth-child(${i+1})`)
            for (let j=0; j<8; j++) {
                let cell = row.children(`td:nth-child(${j+2})`)
                let value = frame.HV_Right.HV_R_TEMPERATURES[i*8+j]/factor_temp
                cell[0].style.border = "1px solid #dee2e6"
                if (value == max_temperature_right) {
                    cell[0].style.border = "2px dashed black"
                }
                cell.text(value.toFixed(1))
                if (1.0 > value || value > 55) {
                    cell[0].style.backgroundColor = "#FF5722";
                } else {
                    cell[0].style.backgroundColor = "#4CAF50"
                }
            }
        }

        // Voltage Table Right
        let factor_volt = mappings.typeset_telemetry_frame.Factor.HV_Right.HV_R_VOLTAGES;
        let max_voltages_right = Math.max.apply(Math, frame.HV_Right.HV_R_VOLTAGES)/factor_volt;
        let min_voltages_right = Math.min.apply(Math, frame.HV_Right.HV_R_VOLTAGES.filter(Boolean))/factor_volt;
        for (let i = 0; i < this.num_voltages/16; i++) {
            let row = $(`#battery-right-voltages-table-body tr:nth-child(${i+1})`)
            let sum = 0;
            for (let j=0; j<16; j++) {
                let cell = row.children(`td:nth-child(${j+2})`)
                let value = frame.HV_Right.HV_R_VOLTAGES[i*16+j]/factor_volt
                cell[0].style.border = "1px solid #dee2e6"
                if (value == max_voltages_right) {
                    cell[0].style.border = "2px dashed black"
                }
                if (value == min_voltages_right) {
                    cell[0].style.border = "2px solid black"
                }
                cell.text(value.toFixed(1))
                sum += value

                if (3.0 > value || value > 4.3) {
                    cell[0].style.backgroundColor = "#FF5722";
                } else {
                    cell[0].style.backgroundColor = "#4CAF50"
                }
            }
            row.children(`td:last-child`).text(sum.toFixed(1))
        }
        // Temperature Table Left
        let max_temperature_left = Math.max.apply(Math, frame.HV_Left.HV_L_TEMPERATURES)/factor_temp;
        for (let i = 0; i < this.num_temperatures/8; i++) {
            let row = $(`#battery-left-temperatures-table-body tr:nth-child(${i+1})`)
            for (let j=0; j<8; j++) {
                let cell = row.children(`td:nth-child(${j+2})`)
                let value = frame.HV_Left.HV_L_TEMPERATURES[i*8+j]/factor_temp
                cell[0].style.border = "1px solid #dee2e6"
                if (value == max_temperature_left) {
                    cell[0].style.border = "2px dashed black"
                }
                cell.text(value.toFixed(1))
                if (1.0 > value || value > 55) {
                    cell[0].style.backgroundColor = "#FF5722";
                } else {
                    cell[0].style.backgroundColor = "#4CAF50"
                }
            }
        }

        // Voltage Table Left
        let max_voltages_left = Math.max.apply(Math, frame.HV_Left.HV_L_VOLTAGES)/factor_volt;
        let min_voltages_left = Math.min.apply(Math, frame.HV_Left.HV_L_VOLTAGES.filter(Boolean))/factor_volt;
        for (let i = 0; i < this.num_voltages/16; i++) {
            let row = $(`#battery-left-voltages-table-body tr:nth-child(${i+1})`)
            let sum = 0;
            for (let j=0; j<16; j++) {
                let cell = row.children(`td:nth-child(${j+2})`)
                let value = frame.HV_Left.HV_L_VOLTAGES[i*16+j]/factor_volt
                cell[0].style.border = "1px solid #dee2e6"
                if (value == max_voltages_left) {
                    cell[0].style.border = "2px dashed black"
                }
                if (value == min_voltages_left) {
                    cell[0].style.border = "2px solid black"
                }
                cell.text(value.toFixed(1))
                sum += value

                if (3.0 > value || value > 4.3) {
                    cell[0].style.backgroundColor = "#FF5722";
                } else {
                    cell[0].style.backgroundColor = "#4CAF50"
                }
            }
            row.children(`td:last-child`).text(sum.toFixed(1))
        }
    }
}

function init(eventEmitter) {
    return new HVBat_Table(eventEmitter);
}

module.exports = init;