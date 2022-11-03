/**
 * @file      protocol_table.js
 * @brief     Protocol table in GUI
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
const {ipcRenderer } = require('electron');
const util = require('../util.js');

const mappings = require('../../config/mappings.js');

const protocol = mappings.protocol;

class ProtocolTable {
    /**
     * Constructor
     * @param eventEmitter App-wide command emitter.
     */
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.table = document.getElementById("protocol-table-body");
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
        let offset = protocol.length;

        for (let i = 0; i < offset; i++) {

            // Create an empty <tr> element and add it to the i'th position of the table:
            let row = this.table.insertRow(i);

            // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
            let name = row.insertCell(0);
            let min = row.insertCell(1);
            let actual = row.insertCell(2);
            let max = row.insertCell(3);
            let unit = row.insertCell(4);

            // Add some text to the new cells:
            name.innerHTML = protocol[i].alias;
            min.innerHTML = protocol[i].min;
            max.innerHTML = protocol[i].max;
            unit.innerHTML = protocol[i].unit;
        }
    }

    /**
     * Update table with new data from frame
     * @param {object} frame Parsed jBinary TelemetryFrame
     */
    update_table(frame) {
        // Dynamically calculate hv bat max and min voltage
        // let num_hv_bats = frame.HV_Batteries.NUMBER_OF_BATTERIES / 2;
        // NASTY EHW Hack
        let num_hv_bats = 10*8;
        let length = protocol.length;

        // Not used 22
        // for (let i = 0; i < protocol.length; i++) {
        //     if ('Inverter.INVERTER_V_DC_LEFT' === protocol[i].path || 'Inverter.INVERTER_V_DC_RIGHT' === protocol[i].name) {
        //         protocol[i].max = Math.max((32 * num_active_bats+20), 25).toFixed(0);
        //         protocol[i].min = Math.max((30 * num_active_bats-20), 0).toFixed(0);
        //     }
        // }


        for (let i = 0; i < length; i++) {
            if ('HV_Left.HV_L_VOLTAGE' === protocol[i].path) {
                protocol[i].max = (4.15 * num_hv_bats).toFixed(0);
                protocol[i].min = (3.7 * num_hv_bats).toFixed(0);
            }
            if ('HV_Right.HV_R_VOLTAGE' === protocol[i].path) {
                protocol[i].max = (4.15 * num_hv_bats).toFixed(0);
                protocol[i].min = (3.7 * num_hv_bats).toFixed(0);
            }
        }

        protocol.forEach( (element, i) => {
            let category  = element.path.split(".")[0];
            let name      = element.path.split(".")[1];
            let array_idx = element.path.split(".")[2];
            let precision = element.precision;

            let factor= mappings.typeset_telemetry_frame.Factor[category][name];
            let value = frame[category][name]/factor;

            // Handle the Currents Array correctly
            if(element.path === "FPGA.FPGA_CURRENT_ADC_VALUES") {
                value = util.adc2ampere(frame[category][name][array_idx]);
            }
            if(element.path === "Inverter.BOARD_VOLTAGES") {
                value = frame[category][name][array_idx];
            }
            if(element.path === "HV_Right.HV_R_VOLTAGE") {
                this.table.rows[i].cells[1].innerHTML = protocol[i].min;
                this.table.rows[i].cells[3].innerHTML = protocol[i].max;
            }
            if(element.path === "HV_Left.HV_L_VOLTAGE") {
                this.table.rows[i].cells[1].innerHTML = protocol[i].min;
                this.table.rows[i].cells[3].innerHTML = protocol[i].max;
            }
            let brake_status = mappings.select_flag(mappings.brake_status, frame.Brake.BRAKE_ENGAGE);
            if (element.path === "Brake.BRAKE_LEFT_ACTION") {
                if (brake_status === "Engaged") {
                    this.table.rows[i].cells[1].innerHTML = protocol[i].min;
                    this.table.rows[i].cells[3].innerHTML = protocol[i].max;
                } else {
                    this.table.rows[i].cells[1].innerHTML = 0;
                    this.table.rows[i].cells[3].innerHTML = 0.2;
                }
            }
            if (element.path === "Brake.BRAKE_RIGHT_ACTION") {
                if (brake_status === "Engaged") {
                    this.table.rows[i].cells[1].innerHTML = protocol[i].min;
                    this.table.rows[i].cells[3].innerHTML = protocol[i].max;
                } else {
                    this.table.rows[i].cells[1].innerHTML = 0;
                    this.table.rows[i].cells[3].innerHTML = 0.2;
                }
            }
            if (element.path === "Brake.BRAKE_LEFT_RELEASE") {
                if (brake_status === "Engaged") {
                let brake_status = mappings.select_flag(mappings.brake_status, frame.Brake.BRAKE_ENGAGE);
                    this.table.rows[i].cells[1].innerHTML = 0;
                    this.table.rows[i].cells[3].innerHTML = 0.2;
                } else {
                    this.table.rows[i].cells[1].innerHTML = protocol[i].min;
                    this.table.rows[i].cells[3].innerHTML = protocol[i].max;
                }
            }
            if (element.path === "Brake.BRAKE_RIGHT_RELEASE") {
                if (brake_status === "Engaged") {
                let brake_status = mappings.select_flag(mappings.brake_status, frame.Brake.BRAKE_ENGAGE);
                    this.table.rows[i].cells[1].innerHTML = 0;
                    this.table.rows[i].cells[3].innerHTML = 0.2;
                } else {
                    this.table.rows[i].cells[1].innerHTML = protocol[i].min;
                    this.table.rows[i].cells[3].innerHTML = protocol[i].max;
                }
            }

            if (element.path.split('.')[1] === "BOARD_VOLTAGES") {
                let main_state = mappings.select_flag(mappings.main_state, frame.State.STATE);
                if (main_state === "Idle"){ // || main_state === "Run" || main_state === "Breaking" || main_state === "Stop" || main_state === "Crawl"
                    this.table.rows[i].cells[1].innerHTML = 0;
                    this.table.rows[i].cells[3].innerHTML = 10;
                } else {
                    this.table.rows[i].cells[1].innerHTML = protocol[i].min
                    this.table.rows[i].cells[3].innerHTML = protocol[i].max;
                }
            }

            let element_value = this.table.rows[i].cells[2];
            let min = parseFloat(this.table.rows[i].cells[1].innerHTML);
            let max = parseFloat(this.table.rows[i].cells[3].innerHTML);

            if (value < min || max < value) {
                element_value.style.backgroundColor = "#FF0000";
            }else {
                element_value.style.backgroundColor = "#4CAF50";

                // Special color for brake values
                if (element.path === "Brake.BRAKE_RIGHT_RELEASE" || element.path === "Brake.BRAKE_RIGHT_ACTION" ||
                    element.path === "Brake.BRAKE_LEFT_RELEASE" || element.path === "Brake.BRAKE_LEFT_ACTION") {
                    element_value.style.backgroundColor = "#ff7500";
                }
            }


            element_value.innerHTML = value.toFixed(precision);
        })
    }
}

function init(eventEmitter) {
    return new ProtocolTable(eventEmitter);
}

module.exports = init;