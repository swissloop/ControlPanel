/**
 * @file      config_table.js
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

const $ = require('jquery');
const { ipcRenderer } = require('electron')

const mappings = require('../../config/mappings.js');

// Time until input boxes are updated automatically
const selected_time = 2000;

class ConfigTable {
    /**
     * Constructor
     * @param eventEmitter App-wide command emitter.
     */
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.last_time_selected = Array(mappings.config_values.length).fill(Date.now()- selected_time);
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
        let table = document.getElementById("config-table-body");

        for (let j = 0; j < mappings.config_values.length; j ++) {
            // Create an empty <tr> element and add it to the i'th position of the table:
            let row = table.insertRow(j);

            let config_param = mappings.config_values[j];
            if (config_param.type === "header") {
                let cell = row.insertCell(0)
                row.style.backgroundColor="darkgrey";
                row.style.fontSize="1.3em"
                cell.innerHTML = `<span class="pb-1 pt-1 m-0">${config_param.name}</span>`;
                cell.colSpan = 5;
                continue;
            }

            // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
            let name = row.insertCell(0);
            let current = row.insertCell(1);
            let manual = row.insertCell(2);
            let tx = row.insertCell(3);
            let unit = row.insertCell(4);

            let frame_category = config_param.path_telemetry.split(".")[0];
            let frame_name     = config_param.path_telemetry.split(".")[1];

            let frame_unit  = (config_param.hasOwnProperty('unit')) ? config_param.unit : mappings.typeset_telemetry_frame.Unit[frame_category][frame_name];
            let frame_factor= mappings.typeset_telemetry_frame.Factor[frame_category][frame_name];

            let config_factor =  (config_param.hasOwnProperty('factor')) ? config_param.factor : 1;

            // Add some text to the new cells:
            name.innerHTML = config_param.name;
            current.innerHTML = `<span id="Config-${frame_name}-label">0</span>`
            tx.innerHTML = `<button class="btn btn-outline-secondary m-0" id="Config-${frame_name}-send">Send</button>`
            unit.innerHTML = frame_unit;

            switch (config_param.type) {
                case "number":
                    manual.innerHTML = `<input type="number" class="form-control" id="Config-${frame_name}-input">`
                    break;
                case "decimal":
                    manual.innerHTML = `<input type="number" step="0.1" pattern="^\\d*(\\.\\d{0,2})?$" class="form-control" id="Config-${frame_name}-input">`
                    break;
                case "enum":
                    if (config_param.hasOwnProperty('enum')) {
                        let selectList = document.createElement("select");
                        selectList.id = `Config-${frame_name}-input`;
                        selectList.classList.add(...["custom-select", "mr-sm-2", "form-control"]);

                        // Skip first state (UNDEFINED)
                        for (let i=0; i<config_param.enum.length; i++) {
                            let option = document.createElement("option");
                            option.value = config_param.enum[i].flag;
                            option.text = config_param.enum[i].description;
                            selectList.appendChild(option);
                        }
                        manual.appendChild(selectList);
                    } else {
                        manual.innerHTML = `<input type="number" class="form-control" id="Config-${frame_name}-input">`
                    }

                    break;
                case "readonly":
                    tx.innerHTML=""
                    break;
                default:
                    break;
            }

            $(`#Config-${frame_name}-send`).on("click", () => {
                let ctrl_frame = {}
                ctrl_frame[config_param.path] = $(`#Config-${frame_name}-input`).val()*frame_factor*config_factor
                if (
                    config_param.path == "config_current_setpoint_run" || 
                    config_param.path == "config_current_setpoint_crawl" || 
                    config_param.path == "config_run_velocity" 
                ) {
                    ctrl_frame[config_param.path] = (ctrl_frame[config_param.path] == 0) ? -1: ctrl_frame[config_param.path];
                }

                // Nasty hack to remove unwanted factor
                if (config_param.path == "config_run_velocity" && ctrl_frame[config_param.path] > 0) {
                    ctrl_frame[config_param.path] /= 1000;
                }
                ipcRenderer.send('sendCtrlFrame',ctrl_frame);
                // Immediately update value in "current" field
                this.last_time_selected[j] = Date.now() - selected_time;
            });

            $(`#Config-${frame_name}-input`).keypress( () => {
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if(keycode == '13'){
                    let ctrl_frame = {}
                    ctrl_frame[config_param.path] = $(`#Config-${frame_name}-input`).val()*frame_factor*config_factor
                    if (
                        config_param.path == "config_current_setpoint_run" || 
                        config_param.path == "config_current_setpoint_crawl" || 
                        config_param.path == "config_run_velocity" 
                    ) {
                        ctrl_frame[config_param.path] = (ctrl_frame[config_param.path] == 0) ? -1: ctrl_frame[config_param.path];
                    }

                    // Nasty hack to remove unwanted factor
                    if (config_param.path == "config_run_velocity" && ctrl_frame[config_param.path] > 0) {
                        ctrl_frame[config_param.path] /= 1000;
                    }

                    ipcRenderer.send('sendCtrlFrame',ctrl_frame);
                    // Immediately update value in "current" field
                    this.last_time_selected[j] = Date.now() - selected_time;
                }
            });
        }
    }

    /**
     * Update table with new data from frame
     * @param {object} frame Parsed jBinary TelemetryFrame
     */
    update_table(frame) {
        for (let j = 0; j < mappings.config_values.length; j ++) {
            let config_param = mappings.config_values[j];
            if (config_param.type === "header") {
                continue;
            }

            let category = config_param.path_telemetry.split(".")[0];
            let name     = config_param.path_telemetry.split(".")[1];
            let value    = frame[category][name];

            let config_factor =  (config_param.hasOwnProperty('factor')) ? config_param.factor : 1;
            let frame_unit  = (config_param.hasOwnProperty('unit')) ? config_param.unit : mappings.typeset_telemetry_frame.Unit[category][name];

            let unit  = mappings.typeset_telemetry_frame.Unit[category][name];
            let factor= mappings.typeset_telemetry_frame.Factor[category][name];
            let data  = mappings.typeset_telemetry_frame.Data[category][name];

            if (data === "float32") {
                $(`#Config-${name}-label`).text((value / factor/config_factor).toFixed(2));
            } else {
                $(`#Config-${name}-label`).text(value / factor/config_factor);
            }

            if (config_param.hasOwnProperty('modal')) {
                if (config_param.hasOwnProperty('enum')) {
                    let desc = mappings.select_flag(config_param.enum, frame[category][name])
                    $(`#${config_param.modal}`).text(desc);
                } else {
                    $(`#${config_param.modal}`).text(value/factor* 1/config_factor + " " + frame_unit);
                }
            }

            let input = $(`#Config-${name}-input`);
            if (!input.is(":focus")) {
                if (this.last_time_selected[j] < Date.now() - selected_time) {
                    if (data === "float32"){
                        input.val((value/factor* 1/config_factor).toFixed(2));
                    } else {
                        input.val(value/factor* 1/config_factor);
                    }
                }
            }
            else {
                this.last_time_selected[j] = Date.now();
            }
        }
    }
}

function init(eventEmitter) {
    return new ConfigTable(eventEmitter);
}

module.exports = init;