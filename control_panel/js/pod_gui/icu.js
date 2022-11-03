/**
 * @file      icu.js
 * @brief     GUI for ICU values
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
 * @module GUI:ICU_Table
 * @version 3.0.0
 *
 * @listens electron:ipcRenderer~telemetryFrame
 * @listens window~load
 *
 */

const mappings = require("../../config/mappings");

const $ = require('jquery');
const {ipcRenderer } = require('electron')
const util = require('../util');

let protocol = [
    {"name": "FPGA.FPGA_CURRENT_ADC_VALUES", "title": "ADC", "min":0, "max":65535, "unit": "BIN.14"},
    {"name": "FPGA.FPGA_CURRENT_ADC_VALUES", "title": "Currents in A", "min":0, "max":300, "unit": "A"},
    {"name": "FPGA.FPGA_CURRENT_STATUS", "title": "Status", "min":0, "max":65535, "unit": "TEXT"}
]

class ICU_Table {
    /**
     * Constructor
     * @param eventEmitter App-wide command emitter.
     */
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        // Taking the values of the left hv box since both should always be the same anyways
        this.num_temperatures = mappings.typeset_telemetry_frame.Data.Inverter.TEMPERATURE_MOSFETS[2];
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
        let table_icu = document.getElementById("icu-vertical-table-body");
        let cell = undefined;

        // Add Row for MOSFET Temperature Values
        let row = table_icu.insertRow(0);
        for (let j=0; j<this.num_temperatures + 1; j++) {
            row.insertCell(j)
        }

        // Add Row for GateDriver Voltage
        row = table_icu.insertRow(1);
        cell = row.insertCell(0);
        for (let j=0; j<this.num_temperatures/3; j++) {
            let cell = row.insertCell(j + 1);
            cell.colSpan = "3";
        }

        // Add Row for GateDriver Fault
        row = table_icu.insertRow(2);
        for (let j=0; j<this.num_temperatures + 1; j++) {
            row.insertCell(j)
        }
        
        // Add Row for GateDriver OCD
        row = table_icu.insertRow(3);
        cell = row.insertCell(0);
        for (let j=0; j<this.num_temperatures/3; j++) {
            let cell = row.insertCell(j + 1);
            cell.colSpan = "3";
        }

        // Add Row for GateDriver Ready
        row = table_icu.insertRow(4);
        cell = row.insertCell(0);
        for (let j=0; j<this.num_temperatures/3; j++) {
            let cell = row.insertCell(j + 1);
            cell.colSpan = "3";
        }

        let table_fpga_hor = document.getElementById("fpga-horizontal-table-body");
        // Fpga table Horizontal
        for (let i = 0; i < protocol.length; i++) {
            let category = protocol[i].name.split('.')[0];
            let name = protocol[i].name.split('.')[1];
            let numb = mappings.typeset_telemetry_frame.Data[category][name][2];   
            // Create an empty <tr> element and add it to the i'th position of the table:
            let row = table_fpga_hor.insertRow(i);
            row.insertCell(0).innerHTML = protocol[i].title;
            for (let j=1; j<numb+1; j++) {
                let cell = row.insertCell(j);
                if (protocol[i].unit === "BIN")
                    cell.style = "font-family: monospace";
            }
        }        
    }

    /**
     * Update table with new data from frame
     * @param {object} frame Parsed jBinary TelemetryFrame
     */
    update_table(frame) {
        //             ICU Table
        // temps
        let factor_temp = mappings.typeset_telemetry_frame.Factor.Inverter.TEMPERATURE_MOSFETS
        let max_temperature = Math.max.apply(Math, frame.Inverter.TEMPERATURE_MOSFETS)/factor_temp;
        let row = $(`#icu-vertical-table-body tr:nth-child(${1})`)
        let cell = row.children(`td:nth-child(${1})`)
        cell.text("Temperatures:")
        cell[0].style = "text-align: center; vertical-align: middle;"
        for (let j=0; j<this.num_temperatures; j++) {
            let cell = row.children(`td:nth-child(${j+2})`)
            cell[0].style = "text-align: center; vertical-align: middle;"
            let value = frame.Inverter.TEMPERATURE_MOSFETS[j]/factor_temp
            cell.text(value.toFixed(1))
            if (1.0 > value || value > 80) {
                cell[0].style.backgroundColor = "#FF5722";
            } else {
                cell[0].style.backgroundColor = "#4CAF50"
            }
        }
        // voltages
        let factor_voltage = mappings.typeset_telemetry_frame.Factor.Inverter.BOARD_VOLTAGES
        let max_voltage = Math.max.apply(Math, frame.Inverter.BOARD_VOLTAGES)/factor_voltage;
        row = $(`#icu-vertical-table-body tr:nth-child(${2})`)
        cell = row.children(`td:nth-child(${1})`)
        cell.text("Voltages:")
        cell[0].style = "text-align: center; vertical-align: middle;"
        for (let j=0; j<this.num_temperatures/3; j++) {
            let cell = row.children(`td:nth-child(${j + 2})`)
            cell[0].style = "text-align: center; vertical-align: middle;"
            let value = frame.Inverter.BOARD_VOLTAGES[j] / factor_voltage
            cell.text(value.toFixed(2))

            let icu_state = util.json_array_select_value(mappings.icu_state, frame.Inverter.ICUMCUSTATE).description;
            if (icu_state === "Setup" || icu_state === "Ready" || icu_state === "Run") {
                if (value < 40) {
                    cell[0].style.backgroundColor = "#4CAF50"
                } else if (value >= 40 && value < 50) {
                    cell[0].style.backgroundColor = "#ff8522";
                } else {
                    cell[0].style.backgroundColor = "#FF5722";
                }
            } else {
                if (value < 40) {
                    cell[0].style.backgroundColor = "#4CAF50"
                } else {
                    cell[0].style.backgroundColor = "#FF5722";
                }
            }
        }
        // faults
        row = $(`#icu-vertical-table-body tr:nth-child(${3})`)
        cell = row.children(`td:nth-child(${1})`)
        cell.text("Faults:")
        cell[0].style = "text-align: center; vertical-align: middle;"
        let gd_status = frame.Inverter.GD_STATUS
        for (let j=0; j<this.num_temperatures; j++) {
            let cell = row.children(`td:nth-child(${j+2})`)
            cell[0].style = "text-align: center; vertical-align: middle;"
            let bitmask = (1 << j)
            // Do bitmask
            if( gd_status & bitmask) {
                cell.text("Fault")
                cell[0].style.backgroundColor = "#FF5722";
            } else {
                cell.text("No Fault")
                cell[0].style.backgroundColor = "#4CAF50"
            }
        }

        // OCD
        row = $(`#icu-vertical-table-body tr:nth-child(${4})`)
        cell = row.children(`td:nth-child(${1})`)
        cell.text("OCD:")
        cell[0].style = "text-align: center; vertical-align: middle;"
        for (let j=0; j<this.num_temperatures/3; j++) {
            let cell = row.children(`td:nth-child(${j+2})`)
            cell[0].style = "text-align: center; vertical-align: middle;"
            let bitmask = (1 << j + 12)
            // Do bitmask
            if( gd_status & bitmask) {
                cell.text("OCD")
                cell[0].style.backgroundColor = "#FF5722";
            } else {
                cell.text("No OCD")
                cell[0].style.backgroundColor = "#4CAF50"
            }
        }
        // Ready
        row = $(`#icu-vertical-table-body tr:nth-child(${5})`)
        cell = row.children(`td:nth-child(${1})`)
        cell.text("Ready:")
        cell[0].style = "text-align: center; vertical-align: middle;"
        for (let j=0; j<this.num_temperatures/3; j++) {
            let cell = row.children(`td:nth-child(${j+2})`)
            cell[0].style = "text-align: center; vertical-align: middle;"
            let bitmask = (1 << j + 16)
            // Do bitmask
            if( gd_status & bitmask) {
                cell.text("Not Ready")
                cell[0].style.backgroundColor = "#FF5722"
            } else {
                cell.text("Ready")
                cell[0].style.backgroundColor = "#4CAF50";
            }
        }


        // FPGA Table Horizontal
        let factor = 768;
        for (let i = 0; i < protocol.length; i++) {
            let row = $(`#fpga-horizontal-table-body tr:nth-child(${i+1})`)
            let category = protocol[i].name.split('.')[0];
            let name = protocol[i].name.split('.')[1];
            let numb = mappings.typeset_telemetry_frame.Data[category][name][2];
            for (let j=0; j<numb; j++) {
                let cell = row.children(`td:nth-child(${j+2})`)
                let value = frame[category][name][j];
                let unit = protocol[i].unit.split('.')[0];
                if (unit === "A") {
                    cell.text(util.adc2ampere(value.toFixed(0)).toFixed(2));
                } else if (unit === "TEXT") {
                    cell.text(mappings.select_flag(mappings.fpga_control_status, value));
                } else if (unit === "BIN") {
                    let bin_length = protocol[i].unit.split('.')[1];
                    cell.text(util.dec2bin(value.toFixed(0), bin_length));
                }
            }
        }

    }
}

function init(eventEmitter) {
    return new ICU_Table(eventEmitter);
}

module.exports = init;