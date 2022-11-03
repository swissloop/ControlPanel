/**
 * @file      util.js
 * @brief     Utility functions
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
 * @module Utils
 * @version 3.0.0
 *
 */

/**
 * Flatten JSON
 * Code from https://stackoverflow.com/questions/11332530/flattening-json-to-csv-format
 *
 * @param obj
 * @param path
 * @returns {{}}
 */
const flatten = (obj, path = []) => {
    return Object.keys(obj).reduce((result, prop) => {
        if (typeof obj[prop] !== "object") {
            result[path.concat(prop).join(".")] = obj[prop];
            return result;
        }
        return Object.assign(result, flatten(obj[prop], path.concat(prop), result));
    }, {});
};

/**
 * Create test data with sync word
 *
 * @param frameLength Length of buffer
 * @param random Whether to create random data
 * @returns {Array}
 */
let offset = -17;
function createTestingData(frameLength = 512, random=true, max_offset = 9) {
    let testData = new Uint8Array(frameLength);
    testData[0] = 0xFE;
    testData[1] = 0xCA;
    if (random) {
        for (let i = 2; i < testData.length; i+=1) {
            testData[i] = randomInt(0, 255);
        }
    } else {
        for (let i = 3; i < testData.length; i+=2) {
            testData[i] = (i-1+offset)/2 % 255;
        }
        if (offset === max_offset) offset = -17;
        //offset += 1
    }
    return testData;
}

/**
 * Create random number within lower and upper bound.
 *
 * @param low Lower bound.
 * @param high Upper bound.
 * @returns {number}
 */
function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

/** @ToDo Make sure this is correct */
/**
 * Calculate lookup table for SOC of HV Batteries
 *
 * @returns {[number]}
 */
function soc() {
    const a = 3.6;
    const b = -0.111;
    const c = -0.5;
    const d = 1.113;
    const m = 1.093;
    const n = 1.9;

    let soc_ = [];

    for (let i = 0; i < 100; i++) {
        let s = (i+1)*0.01;
        soc_[i] = (a+b*(-1*Math.log(s))**m + c*s+d* Math.exp(n*(s-1)));
    }

    return soc_;
}

const soc_lookup = soc();

/**
 * Returns the state of charge closest to the current Voltage
 *
 * @param volt Voltage of battery
 * @returns {number}
 */
function get_soc(volt) {
    let closest_i = 0;
    let closest_dist = 1000000;

    // Calculate the closest voltage in the lookup table
    for (let i = 0; i < soc_lookup.length; i++) {
        let dist = Math.abs(volt-soc_lookup[i]);

        if (dist < closest_dist) closest_i = i;
        closest_dist = dist;
    }

    return (closest_i+1);
}

/**
 * Returns string descriptor of an enumerated value
 *
 * @param json_array JSON with enumeration
 * @param value Value of enumeration
 * @returns {object} Textual description
 */
function json_array_select_value(json_array, value) {
    let length = json_array.length;

    for (let i = 0; i < length; i++) {
        if (value === parseInt(json_array[i].flag)) {
            return json_array[i];
        }
    }

    return {description: "Not Found", value: -1};
}

/**
 * Returns the absolute value of dq vector
 *
 * @param q_val Q value in DQ frame
 * @param d_val D value in DQ frame
 * @returns {number} Absolute value
 */
function dq_abs(q_val, d_val) {
    return Math.sqrt(q_val*q_val + d_val*d_val)
}

/**
 * Check if the control frame is empty.
 * A control frame is empty if all elements are zero.
 * A empty control frame is a heartbeat.
 *
 * @param {object} frame JSON with control frame
 * @returns {boolean} Whether the frame is a heartbeat (all zeros) or not.
 */
function ctr_frame_isEmpty(frame) {
    delete frame['fat_time'];
    let empty = true;
   frame = flatten((frame));
    for (key in frame) {
        if (frame[key]) empty = false;
    }
    return empty;
}
/**
 * returns the binary form of an object as a string
 * @param {object} dec 
 * @returns string
 */
function dec2bin(dec, length){
    var binaryStr = (dec >>> 0).toString(2);
    while(binaryStr.length < length) {
        binaryStr = "0" + binaryStr;
    }
    return binaryStr
}

/**
 * 
 * @param {object} adc 
 * @returns converted value to ampere
 */
function adc2ampere(adc)
{
    return (adc/16384 - 0.5) * 614.4;
}

module.exports = {
    "flatten": flatten,
    "createTestingData": createTestingData,
    "get_soc": get_soc,
    "json_array_select_value": json_array_select_value,
    "dq_abs": dq_abs,
    "ctr_frame_isEmpty": ctr_frame_isEmpty,
    "dec2bin": dec2bin,
    "adc2ampere": adc2ampere
};