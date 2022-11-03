/**
 * @file      generator.js
 * @brief     Generator for jBinary telemetry frame Typeset
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
 * @module TelemetryTypesetGenerator
 * @version 3.0.0
 * 
 */

const fs = require("fs");
const util = require('util');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const config = require("../config/config");
const { abort } = require("process");

// (Tip) Use https://regex101.com/ to analyze regex
// Regex to split category comments, types, variable names and units
const regex = /\s*\/\/\s+(\w+)\s*\n|\s*(\w+)\s+(\w+)\[?(\w+\+*\d*)?\]?;\s*\/\/ ([\w°%\/]+)\s*(\(.*\))?\s*\n/g;
// Regex to split unit name and factor
const regex_unit = /([\w°%/]+)\/([0-9]+)/;

/**
 * Generator for jBinary telemetry frame Typeset
 *
 * @param {string} filepath Path to the network_telemetry_frame.h file.
 *
 */
function generate_typeset_network(file_telemetry) {
    // Skeleton for typeset
    let frame_telemetry_typeset = {
        'jBinary.all': 'Data',
        'jBinary.littleEndian': true,
        'Length': 0,
        'SyncWord': 'FECA',
        Data: { Misc: {} },
        Unit: { Misc : {}} ,
        Factor: { Misc: {} }
    };

    // List with available datatypes and sizes
    const datatypes = {
        "int8": 1,
        "uint8": 1,
        "int16": 2,
        "uint16": 2,
        "int32": 4,
        "uint32": 4,
        "int64": 8,
        "uint64": 8,
        "float32": 4,
        "float64": 8
    };

    let category = "Misc";
    let match;

    while ((match = regex.exec(file_telemetry)) != null) {

        // Match category specifier
        if (match[1] !== undefined) {
            category = match[1];
            frame_telemetry_typeset.Data[category] = {};
            frame_telemetry_typeset.Unit[category] = {};
            frame_telemetry_typeset.Factor[category] = {};
        }else  {
            let name = match[3].toUpperCase();
            let type = match[2].substr(0, match[2].length);
            if (type === "float") {
                type = "float32";
            } else if (type ===  "double") {
                type = "float64";
            } else {
                type = type.substr(0,type.length-2);
            }

            let array_length = match[4];
            let unit_match = regex_unit.exec(match[5]);
            let unit = (unit_match != null) ? unit_match[1] : match[5];
            let factor = (unit_match != null) ? unit_match[2] : 1;

            frame_telemetry_typeset.Factor[category][name] = Number(factor);
            frame_telemetry_typeset.Unit[category][name] = unit;

            // Check for arrays
            if (array_length !== undefined) {
                frame_telemetry_typeset.Length += array_length * datatypes[type];
                frame_telemetry_typeset.Data[category][name] = ['array', type ,  Number(array_length) ];
            } else {
                frame_telemetry_typeset.Length += datatypes[type];
                frame_telemetry_typeset.Data[category][name] = type;
            }
        }
    }

    // Remove unused Category
    if (Object.keys(frame_telemetry_typeset.Data['Misc']).length === 0) delete frame_telemetry_typeset.Data['Misc'];
    if (Object.keys(frame_telemetry_typeset.Unit['Misc']).length === 0) delete frame_telemetry_typeset.Unit['Misc'];
    if (Object.keys(frame_telemetry_typeset.Factor['Misc']).length === 0) delete frame_telemetry_typeset.Factor['Misc'];

    return util.inspect(frame_telemetry_typeset, depth=Infinity , maxArrayLength =Infinity);
}

// Download latest frame
console.log("[GEN] Download latest VCU telemetry frame definition.")
fetch(config.github.telemetry_frame_src, {
    /** @todo Remove API Access and replace with repository secret */
    headers: {
        'Authorization': 'Bearer ' + config.github.github_access_token,
        'Accept': 'application/vnd.github+json'
    },
    cache: 'no-cache',
    }).then(res => {
        if (res.status != 200) {
            throw(new Error(`Invalid HTML Response: ${res.statusText} (${res.status})` ));
        }
        return res.text()
    }).then(body => {
        console.log("[GEN] Received header.");
        let file = new Buffer.from(JSON.parse(body).content, 'base64').toString();
        console.log(file);

        // Generate typeset
        let frame_telemetry_typeset = generate_typeset_network(file);

        // Assemble rest of file
        let content = `/**
 * @file      typeset_telemetry_frame.js
 * @brief     jBinary telemetry frame Typeset
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
 * @module TelemetryTypeset
 * @version 3.0.0
 * 
 */

const frame_telemetry_typeset = 
` + frame_telemetry_typeset + `;
module.exports = {
    "typeset": frame_telemetry_typeset
};
        `;

        // Save new file
        fs.writeFileSync(path.join(__dirname, 'typesets/typeset_telemetry_frame.js'), content);
        console.log("[GEN] Generated new parser.")
    });
