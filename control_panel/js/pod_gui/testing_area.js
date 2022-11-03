/**
 * @file      testing_area.js
 * @brief     Testing are in GUI
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
 * @module GUI:TestingArea
 * @version 3.0.0
 *
 * @listens electron:ipcRenderer~telemetryFrame
 *
 */

const $ = require('jquery');
const {ipcRenderer } = require('electron')

// To parse and create telemetry data based on typesets
const jBinary = require('jbinary');

const mappings = require('../../config/mappings.js');

const ignore =[
    "Sync.SYNC",
];

const table_telemetry = document.getElementById(`testing_area_body_telemetry`);
const table_ctrl = document.getElementById(`testing_area_body_ctrl`);

// Time until input boxes are updated automatically
const selected_time = 2000;

class TestingArea {
    /**
     * Constructor
     * @param eventEmitter App-wide command emitter.
     */
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        // Add event listeners
        window.addEventListener("load", () => {
            this.generate_area();
            this.add_event_listeners();
        });
    }

    /**
     * Setup listener for new telemetry frame
     * @package
     */
    add_event_listeners() {
        ipcRenderer.on('telemetryFrame', (_event, frame) =>{
           this.update_gui(frame);
        });
    }

    /**
     * Initially generate area skeleton
     * @package
     */
    generate_area() {
        // Generate Table for Control Frame
        for (let key in mappings.typeset_ctrl_frame.Data) {
            if (!mappings.typeset_ctrl_frame.Data.hasOwnProperty(key)) {
                continue;
            }

            let row = table_ctrl.insertRow();
            let unit = mappings.typeset_ctrl_frame.Unit[key];

            let cell_name = row.insertCell(0);
            let cell_value = row.insertCell(1);
            let cell_input = row.insertCell(2);
            let cell_tx = row.insertCell(3);
            let cell_note1 = row.insertCell(4);

            cell_name.innerHTML = key;
            cell_tx.innerHTML = `<button class="btn btn-outline-secondary m-0" id="testing_area_config-${key}_send">Send</button>`
            cell_note1.innerHTML = unit;

            let mapping = mappings.select_mapping(mappings.config_values, `${key}`)

            // If value is an enumeration
            if (mapping !== undefined) {
                cell_value.innerHTML =`<span id="testing_area_config_${key}_label">0</span>`;

                if (mapping.hasOwnProperty('enum')) {
                    let selectList = document.createElement("select");
                    selectList.id = `testing_area_config_${key}_input`;
                    selectList.classList.add(...["custom-select", "mr-sm-2", "form-control"]);

                    // Skip first state (UNDEFINED)
                    for (let i = 0; i < mapping.enum.length; i++) {
                        let option = document.createElement("option");
                        option.value = mapping.enum[i].flag;
                        option.text = `${mapping.enum[i].description} (${option.value})`;
                        selectList.appendChild(option);
                    }
                    cell_input.appendChild(selectList);
                } else{
                    cell_input.innerHTML = `<input type="number" class="form-control" id="testing_area_config_${key}_input" value="0">`
                }
            } else {
                // Check for arrays
                if (typeof  mappings.typeset_ctrl_frame.Data[key] == "object") {
                    for (let j = 0; j <  mappings.typeset_ctrl_frame.Data[key][2]; ++j) {
                        cell_input.innerHTML += `<input type="number" class="form-control" id="testing_area_config_${key}_${j}_input" value="0">`
                    }
                    // Add keypress event listeners
                    for (let j = 0; j <  mappings.typeset_ctrl_frame.Data[key][2]; ++j) {
                        $(`#testing_area_config_${key}_${j}_input`).keypress( () => {
                            var keycode = (event.keyCode ? event.keyCode : event.which);
                            if(keycode == '13'){
                                let raw_frame = new jBinary(mappings.typeset_ctrl_frame.Length, mappings.typeset_ctrl_frame);
                                let ctrl_frame = raw_frame.readAll()
                                for (let i = 0; i <  mappings.typeset_ctrl_frame.Data[key][2]; ++i) {
                                    ctrl_frame[key][i] = $(`#testing_area_config_${key}_${i}_input`).val()*1
                                    // Send -1 for active 0 values
                                    if (key == "inverter_gain_i" || key == "inverter_gain_p") {
                                        ctrl_frame[key][i] = (ctrl_frame[key][i] == 0) ? -1: ctrl_frame[key][i];
                                    }
                                }
                                ipcRenderer.send('sendCtrlFrame', JSON.parse(JSON.stringify(ctrl_frame)));
                            }
                        });
                    }
                    // Add Send button click events
                    $(`#testing_area_config-${key}_send`).on("click", () => {
                        let raw_frame = new jBinary(mappings.typeset_ctrl_frame.Length, mappings.typeset_ctrl_frame);
                        let ctrl_frame = raw_frame.readAll()
                        for (let i = 0; i <  mappings.typeset_ctrl_frame.Data[key][2]; ++i) {
                            ctrl_frame[key][i] = $(`#testing_area_config_${key}_${i}_input`).val()*1
                            // Send -1 for active 0 values
                            if (key == "inverter_gain_i" || key == "inverter_gain_p") {
                                ctrl_frame[key][i] = (ctrl_frame[key][i] == 0) ? -1: ctrl_frame[key][i];
                            }
                        }
                        ipcRenderer.send('sendCtrlFrame', JSON.parse(JSON.stringify(ctrl_frame)));
                    });
                  
                    continue;
                } else {
                    cell_input.innerHTML = `<input type="number" class="form-control" id="testing_area_config_${key}_input" value="0">`
                }
            }
            // Add keypress event listeners
            $(`#testing_area_config-${key}_send`).on("click", () => {
                let ctrl_frame = {}
                ctrl_frame[key] = $(`#testing_area_config_${key}_input`).val()*1
                // Send -1 for active 0 values
                if (
                    key == "config_current_setpoint_run" || 
                    key == "config_current_setpoint_crawl" || 
                    key == "config_run_velocity"
                ) {
                    ctrl_frame[key] = (ctrl_frame[key] == 0) ? -1: ctrl_frame[key];
                }
                ipcRenderer.send('sendCtrlFrame',ctrl_frame);
            });
            // Add Send button click events
            $(`#testing_area_config_${key}_input`).keypress( () => {
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if(keycode == '13'){
                    let ctrl_frame = {}
                    ctrl_frame[key] = $(`#testing_area_config_${key}_input`).val()*1
                    if (
                        key == "config_current_setpoint_run" || 
                        key == "config_current_setpoint_crawl" || 
                        key == "config_run_velocity"
                    ) {
                        ctrl_frame[key] = (ctrl_frame[key] == 0) ? -1: ctrl_frame[key];
                    }
                    ipcRenderer.send('sendCtrlFrame',ctrl_frame);
                }
            });
        }
        // Generate Table for Telemetry Frame
        for (let category in mappings.typeset_telemetry_frame.Data) {
            // Check for property
            if (!mappings.typeset_telemetry_frame.Data.hasOwnProperty(category)) {
                continue;
            }

            for (let key in mappings.typeset_telemetry_frame.Data[category]) {
                // Check for property
                if (!mappings.typeset_telemetry_frame.Data[category].hasOwnProperty(key)) {
                    continue;
                }

                let row = table_telemetry.insertRow();

                let unit = mappings.typeset_telemetry_frame.Unit[category][key];
                if (ignore.includes(category + "." + key) > 0) {
                    row.classList.add("table-inactive")
                }
                let cell_name = row.insertCell(0);
                let cell_value = row.insertCell(1);
                cell_value.id = `testing_area_${category}-${key}`;
                let cell_unit = row.insertCell(2);

                cell_name.innerHTML = key;
                cell_unit.innerHTML = unit;
            }
        }
    }

    /**
     * Update area with new data from frame
     * @param {object} frame Parsed jBinary TelemetryFrame
     */
    update_gui(frame) {
        // Update config table
        for (let key in mappings.typeset_ctrl_frame.Data) {
            let mapping = mappings.select_mapping(mappings.config_values, `${key}`)

            if (mapping === undefined) {
                continue;
            }
            let category = mapping.path_telemetry.split(".")[0];
            let name     = mapping.path_telemetry.split(".")[1];
            let value    = frame[category][name];

            $(`#testing_area_config_${key}_label`).text(value);
        }

        // Updated telemetry table
        for (let category in frame) {
            // Check for property
            if (!mappings.typeset_telemetry_frame.Data.hasOwnProperty(category)) {
                continue;
            }

            for (let key in frame[category]) {
                // Check for property
                if (!mappings.typeset_telemetry_frame.Data[category].hasOwnProperty(key)) {
                    continue;
                }
                if (ignore.includes(category + "." + key) > 0) continue;

                let unit = mappings.typeset_telemetry_frame.Unit[category][key];
                let factor = mappings.typeset_telemetry_frame.Factor[category][key];
                let cell_value = $(`#testing_area_${category}-${key}`);

                // Check for array
                if (typeof(mappings.typeset_telemetry_frame.Data[category][key]) === "object") {
                    let value = ""
                    for (let item in frame[category][key]) {
                        let temp = (unit === "enum") ? "0x" + (frame[category][key][item]/factor).toString(16).toUpperCase() : frame[category][key][item]/factor;
                        value += temp + ", ";
                    }
                    cell_value.html(value.substring(0, value.length-2))
                } else {
                    let value = mappings.select_mapping(mappings.enum_list, `${category}.${key}`)
                    if (value !== undefined) {
                        value = mappings.select_flag(value.enum, frame[category][key])
                    } else {
                        value = (unit === "enum") ? "0x" + (frame[category][key]/factor).toString(16).toUpperCase() : frame[category][key]/factor;
                    }
                    cell_value.html(value)
                }
            }
        }
    }
}

function init(eventEmitter) {
    return new TestingArea(eventEmitter);
}

module.exports = init;