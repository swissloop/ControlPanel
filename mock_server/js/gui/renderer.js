/**
 * @file      renderer.js
 * @brief     Main renderer for testing GUI
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
 * @module mock_server/GUI
 * @version 3.0.0
 *
 * @listens window~load
 */

const jBinary = require('jbinary');

const typeset_telemetry_frame = require('../../../control_panel/js/typesets/typeset_telemetry_frame.js').typeset;
const default_values = require('../../json/default_values.json');

let binary_frame = jBinary(typeset_telemetry_frame.Length, typeset_telemetry_frame);
let frame = binary_frame.readAll()

const Communication = require('../com.js').Communication;
const communication = new Communication(binary_frame, frame);

const mappings = require('../../../control_panel/config/mappings.js');

/** @ToDo automatically generate this from mapping.js (based on errors and enumerations) */
const enum_values = {
    "State.STATE": {
        "json": mappings.main_state,
        "multi": false
    },
    "State.VCU_EMERGENCY_REASON": {
        "json": mappings.main_emergencies,
        "multi": true
    },
    "State.VCU_ERRORS": {
        "json": mappings.main_error,
        "multi": true
    },
    "Brake.BRAKE_STATE": {
        "json": mappings.brake_state,
        "multi": false
    },
    "HV_Left.HV_L_STATE": {
        "json": mappings.bms_state,
        "multi": false
    },
    "HV_Right.HV_R_STATE": {
        "json": mappings.bms_state,
        "multi": false
    },
    "HV_Left.HV_L_ERROR": {
        "json": mappings.bms_error,
        "multi": true
    },
    "HV_Right.HV_R_ERROR": {
        "json": mappings.bms_error,
        "multi": true
    },
    "FPGA.FPGA_CURRENT_STATUS.0": {
        "json": mappings.fpga_control_status,
        "multi": false
    },
    "FPGA.FPGA_CURRENT_STATUS.1": {
        "json": mappings.fpga_control_status,
        "multi": false
    },
    "FPGA.FPGA_CURRENT_STATUS.2": {
        "json": mappings.fpga_control_status,
        "multi": false
    },
    "FPGA.FPGA_CURRENT_STATUS.3": {
        "json": mappings.fpga_control_status,
        "multi": false
    },
    "FPGA.FPGA_CURRENT_STATUS.4": {
        "json": mappings.fpga_control_status,
        "multi": false
    },
    "FPGA.FPGA_CURRENT_STATUS.5": {
        "json": mappings.fpga_control_status,
        "multi": false
    },
    "FPGA.FPGA_CURRENT_STATUS.6": {
        "json": mappings.fpga_control_status,
        "multi": false
    },
    "FPGA.FPGA_CURRENT_STATUS.7": {
        "json": mappings.fpga_control_status,
        "multi": false
    },
    "Inverter.ICUFPGASTATUS": {
        "json": mappings.fpga_status,
        "multi": true
    },
    "Inverter.ICUMCUSTATUS": {
        "json": mappings.icu_error,
        "multi": true
    },
    "Inverter.GD_STATUS": {
        "json": mappings.gatedriver_status,
        "multi": true
    },
    "Inverter.ICUMCUSTATE": {
        "json": mappings.icu_state,
        "multi": false
    },
    "Inverter.ICUFPGASTATE": {
        "json": mappings.fpga_state,
        "multi": false
    },
}


window.addEventListener("load", () => {
    generate_html();
});

/**
 * Initially generate skeleton and add event listeners
 */
function generate_html() {
    for (let category in typeset_telemetry_frame.Data) {
        // Check for property
        if (!typeset_telemetry_frame.Data.hasOwnProperty(category)) {
            continue;
        }

        // Create new category with a table
        let html = `<div class="card mt-2">
                        <div class="card-header p-0">
                            <a class="card-link btn m-0 w-100 text-left" data-toggle="collapse" href="#collapse-${category}">${category}</a>
                        </div>
                        <div id="collapse-${category}" class="collapse">
                            <div class="card-body">
                                <table class="table table-striped table-sm mb-0">
                                    <tbody id = ${category}-body>
                                    </tbody>
                                </table>
                            </div>
                         </div>
                    </div>`

        // Append to main frame
        $("#main").append(html);
        let table = document.getElementById(`${category}-body`);

        // Append values to table
        for (let key in typeset_telemetry_frame.Data[category]) {
            // Check for property
            if (!typeset_telemetry_frame.Data[category].hasOwnProperty(key)) {
                continue;
            }

            if (key === "DUMMY") continue;

            let type = typeset_telemetry_frame.Data[category][key]
            let unit = typeset_telemetry_frame.Unit[category][key];
            let factor = typeset_telemetry_frame.Factor[category][key];

            let row = table.insertRow();

            switch (unit) {
                case "boolean":
                    generate_row_boolean(row, category, key, type, unit,factor);
                    break;
                case "enum":
                    generate_row_enum(row, category, key, type, unit,factor)
                    break;
                case "0xCAFE":
                    row.insertCell(0).innerHTML = key;
                    row.insertCell(1).innerHTML = unit;
                    row.insertCell(2).innerHTML = "";
                    row.insertCell(3).innerHTML = "";
                    row.insertCell(4).innerHTML = type;
                    break;
                default:
                    generate_row_integer(row, category, key, type, unit,factor);
                    break;
            }
        }
    }
}

function generate_row_enum(row, category, key, type, unit, factor) {
    let name = row.insertCell(0);
    let value = row.insertCell(1);
    let note1 = row.insertCell(2);
    let slider = row.insertCell(3);
    let note2 = row.insertCell(4);

    name.innerHTML = key;
    note1.innerHTML = unit;
    note2.innerHTML = type;
    if (type === "uint8" || type === "int8" || type === "uint16" || type === "int16" || type === "uint32" || type === "int32") {
        // Load default value
        let default_value = (typeof default_values[category][key] == "undefined") ? 0 : default_values[category][key];
        if (default_value === undefined) default_value = 0;
        frame[category][key] = default_value;

        value.innerHTML = `<div id="${category}-${key}-value">${default_value}</div>`;

        // Dropdown List
        if (enum_values.hasOwnProperty(`${category}.${key}`) && enum_values[`${category}.${key}`].multi === false) {
            let enum_value = enum_values[`${category}.${key}`]
            // Create Dropdown List
            let selectList = document.createElement("select");
            selectList.id = `${category}-${key}`;
            selectList.classList.add(...["custom-select", "mr-sm-2", "form-control"]);

            // Skip first state (UNDEFINED)
            for (let i = 0; i < enum_value.json.length; i++) {
                let option = document.createElement("option");
                option.value = enum_value.json[i].flag;
                option.text = enum_value.json[i].description;
                selectList.appendChild(option);
            }
            slider.appendChild(selectList);
            
            // Select values
            const options = Array.from(selectList.options);
            const optionToSelect = options.find(item => item.value === default_value.toString());
            if (optionToSelect !== undefined) optionToSelect.selected = true;

        } else if (enum_values.hasOwnProperty(`${category}.${key}`) && enum_values[`${category}.${key}`].multi === true ){
            // Multiselect List
            let enum_value = enum_values[`${category}.${key}`]
            // Create Dropdown List
            let selectList = document.createElement("select");
            selectList.id = `${category}-${key}`;
            selectList.multiple = true;
            selectList.classList.add(...["custom-select", "mr-sm-2", "form-control"]);

            for (let i = 0; i < enum_value.json.length; i++) {
                let option = document.createElement("option");
                option.value = enum_value.json[i].flag;
                option.text = enum_value.json[i].error_type;
                selectList.appendChild(option);
            }
            slider.appendChild(selectList);

            // Select values
            const options = Array.from(selectList.options);
            options.forEach( (item) => {
                if (parseInt(item.value) & default_value) item.selected = true;
            });

        } else {
            slider.innerHTML = `<input id="${category}-${key}" class="form-control" type="number" value="${default_value}">`
        }
        // Event listener for value changes
        $(`#${category}-${key}`).on('input', function (slideEvt) {
            if ($(`#${category}-${key}`).prop("multiple")) {
                value = $(this).val().reduce((a,b) => a+parseInt(b),0);
                $(`#${category}-${key}-value`).text(value);
                frame[category][key] = value;
            } else {
                $(`#${category}-${key}-value`).text($(this).val());
                frame[category][key] = $(this).val();
            }
        });

    } else {
        value.innerHTML = "";
        for (let i = 0; i < type[2]; i++) {
            // Load default value
            let default_value = (typeof default_values[category][key] == "undefined") ? 0 : default_values[category][key][i];
            if (default_value === undefined) default_value = 0;
            frame[category][key][i] = default_value;

            value.innerHTML += `<div id="${category}-${key}-${i}-value">${default_value}</div>`;


            if (enum_values.hasOwnProperty(`${category}.${key}.${i}`) && enum_values[`${category}.${key}.${i}`].multi === false) {
                let enum_value = enum_values[`${category}.${key}.${i}`]
                // Create Dropdown List
                let selectList = document.createElement("select");
                selectList.id = `${category}-${key}-${i}`;
                selectList.classList.add(...["custom-select", "mr-sm-2", "form-control"]);

                for (let i = 0; i < enum_value.json.length; i++) {
                    let option = document.createElement("option");
                    option.value = enum_value.json[i].flag;
                    option.text = enum_value.json[i].description;
                    selectList.appendChild(option);
                }
                slider.appendChild(selectList);

                // Select values
                const options = Array.from(selectList.options);
                const optionToSelect = options.find(item => item.value === default_value.toString());
                if (optionToSelect !== undefined) optionToSelect.selected = true;

            } else if (enum_values.hasOwnProperty(`${category}.${key}.${i}`) && enum_values[`${category}.${key}.${i}`].multi === true ){
                // Multiselect List
                let enum_value = enum_values[`${category}.${key}.${i}`]

                // Create Dropdown List
                let selectList = document.createElement("select");
                selectList.id = `${category}-${key}-${i}`;
                selectList.multiple = true;
                selectList.classList.add(...["custom-select", "mr-sm-2", "form-control"]);

                for (let i = 0; i < enum_value.json.length; i++) {
                    let option = document.createElement("option");
                    option.value = enum_value.json[i].flag;
                    option.text = enum_value.json[i].error_type;
                    selectList.appendChild(option);
                }
                slider.appendChild(selectList);

                // Select values
                const options = Array.from(selectList.options);
                options.forEach( (item) => {
                    if (parseInt(item.value) & default_value) item.selected = true;
                });

            } else {
                slider.innerHTML += `<input id="${category}-${key}-${i}" class="form-control" type="number" value="${default_value}">`
            }


        }
        for (let i = 0; i < type[2]; i++) {
            $(`#${category}-${key}-${i}`).on('input', function (slideEvt) {
                if ($(`#${category}-${key}-${i}`).prop("multiple")) {
                    value = $(this).val().reduce((a, b) => a + parseInt(b), 0);
                    $(`#${category}-${key}-${i}-value`).text(value);
                    frame[category][key][i] = value;
                } else {
                    $(`#${category}-${key}-${i}-value`).text($(this).val());
                    frame[category][key][i] = $(this).val();
                }
            });
        }

    }
}

function generate_row_boolean(row, category, key, type, unit, factor) {
    let name = row.insertCell(0);
    let value = row.insertCell(1);
    let note1 = row.insertCell(2);
    let slider = row.insertCell(3);
    let note2 = row.insertCell(4);

    name.innerHTML = key;
    note1.innerHTML = unit;
    note2.innerHTML = type;

    if (type === "uint8" || type === "int8" || type === "uint16" || type === "int16" || type === "uint32" || type === "int32") {
        // Load default value
        let default_value = (typeof default_values[category] == "undefined") ? 0 : default_values[category][key];
        if (default_value === undefined) default_value = 0;
        frame[category][key] = default_value;

        value.innerHTML = `<div id="${category}-${key}-value">${default_value}</div>`;
        slider.innerHTML = `<div class="btn-group-toggle" data-toggle="buttons">
                                          <label class="btn btn-sm btn-secondary active">
                                            <input id="${category}-${key}" type="checkbox"> Toggle
                                          </label>
                                        </div>`
        // Event listener for value changes
        $(`#${category}-${key}`).change(function (slideEvt) {
            $(`#${category}-${key}-value`).text(+$(this).is(':checked'));
            frame[category][key] = $(this).is(':checked');
        });
    } else {
        value.innerHTML = "";
        for (let i = 0; i < type[2]; i++) {
            // Load default value
            let default_value = (typeof default_values[category] == "undefined") ? 0 : default_values[category][key][i];
            if (default_value === undefined) default_value = 0;
            frame[category][key][i] = default_value;

            value.innerHTML += `<div id="${category}-${key}-${i}-value">${default_value}</div>`;
            slider.innerHTML += `<div class="btn-group-toggle" data-toggle="buttons">
                                          <label class="btn btn-sm btn-secondary active">
                                            <input id="${category}-${key}-${i}" type="checkbox"> Toggle
                                          </label>
                                        </div>`

        }
        for (let i = 0; i < type[2]; i++) {
            $(`#${category}-${key}-${i}`).change(function (slideEvt) {
                $(`#${category}-${key}-${i}-value`).text(+$(this).is(':checked'));
                frame[category][key][i] = $(this).is(':checked');
            });
        }
    }
}

function generate_row_integer(row, category, key, type, unit, factor) {
    let name = row.insertCell(0);
    let value = row.insertCell(1);
    let note1 = row.insertCell(2);
    let slider = row.insertCell(3);
    let note2 = row.insertCell(4);

    name.innerHTML = key;
    note1.innerHTML = (factor === 1)  ? unit : unit + "/" + factor;
    note2.innerHTML = type;

    // Single Values
    if (typeof type == "string") {
        // Load default value
        let default_value = (typeof default_values[category] == "undefined") ? 0 : default_values[category][key];
        if (default_value === undefined) default_value = 0;
        frame[category][key] = default_value;

        value.innerHTML = `<input type="number" class="control" id="${category}-${key}-value" value="${default_value}"/>`;

        if (type === "uint16" || type === "uint32") {
            slider.innerHTML = `<input id="${category}-${key}" data-slider-id='${category}-${key}Slider' type="text" data-slider-min="0" data-slider-max="65535" data-slider-step="1" data-slider-value="${default_value}"/>`
        } else if ( type === "int16" || type === "int32") {
            slider.innerHTML = `<input id="${category}-${key}" data-slider-id='${category}-${key}Slider' type="text" data-slider-min="-32767" data-slider-max="32767" data-slider-step="1" data-slider-value="${default_value}"/>`
        } else if (type === "uint8") {
            slider.innerHTML = `<input id="${category}-${key}" data-slider-id='${category}-${key}Slider' type="text" data-slider-min="0" data-slider-max="255" data-slider-step="1" data-slider-value="${default_value}"/>`
        } else {
            slider.innerHTML = `<input id="${category}-${key}" data-slider-id='${category}-${key}Slider' type="text" data-slider-min="-128" data-slider-max="128" data-slider-step="1" data-slider-value="${default_value}"/>`
        }

        let slider_object = $(`#${category}-${key}`);
        slider_object.slider();
        slider_object.on("slide", function (slideEvt) {
            $(`#${category}-${key}-value`).val(slideEvt.value);
            frame[category][key] = slideEvt.value;
        });

        $(`#${category}-${key}-value`).on("change", function(value) {
            slider_object.slider( "setValue", $(`#${category}-${key}-value`).val());
            frame[category][key] = $(`#${category}-${key}-value`).val();
        });

    } else {
    // Arrays
        value.innerHTML = "";
        for (let i = 0; i < type[2]; i++) {
            // Load default value
            let default_value = (typeof default_values[category][key] == "undefined") ? 0 : default_values[category][key][i];
            if (default_value === undefined) default_value = 0;
            frame[category][key][i] = default_value;

            if (type[1] === "uint16" || type[1] === "uint32") {
                slider.innerHTML += `<input id="${category}-${key}-${i}" data-slider-id='${category}-${key}-${i}Slider' type="text" data-slider-tooltip="hide" data-slider-min="0" data-slider-max="65535" data-slider-step="1" data-slider-value="${default_value}"/>`
            } else if (type[1] === "int16" || type[1] === "int32") {
                slider.innerHTML += `<input id="${category}-${key}-${i}" data-slider-id='${category}-${key}-${i}Slider' type="text" data-slider-tooltip="hide" data-slider-min="-32767" data-slider-max="32767" data-slider-step="1" data-slider-value="${default_value}"/>`
            } else if (type[1] === "uint8") {
                slider.innerHTML += `<input id="${category}-${key}-${i}" data-slider-id='${category}-${key}-${i}Slider' type="text" data-slider-tooltip="hide" data-slider-min="0" data-slider-max="255" data-slider-step="1" data-slider-value="${default_value}"/>`
            } else if (type[1] === "int8") {
                slider.innerHTML += `<input id="${category}-${key}-${i}" data-slider-id='${category}-${key}-${i}Slider' type="text" data-slider-tooltip="hide" data-slider-min="-128" data-slider-max="128" data-slider-step="1" data-slider-value="${default_value}"/>`
            }
            value.innerHTML += `<input type="number" class="control"  id="${category}-${key}-${i}-value" value="${default_value}" />`;

        }
        for (let i = 0; i < type[2]; i++) {
            let slider_object = $(`#${category}-${key}-${i}`);
            slider_object.slider();
            slider_object.on("slide", function (slideEvt) {
                $(`#${category}-${key}-${i}-value`).val(slideEvt.value);
                frame[category][key][i] = slideEvt.value;
            });

            $(`#${category}-${key}-${i}-value`).on("change", function(value) {
                slider_object.slider( "setValue", $(`#${category}-${key}-${i}-value`).val());
                frame[category][key][i] = $(`#${category}-${key}-${i}-value`).val();
            });
        }
    }

}