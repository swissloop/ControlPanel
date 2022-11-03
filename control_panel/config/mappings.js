/**
 * @file      mappings.js
 * @brief     State and error mappings
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
 * @module Mappings
 * @version 3.0.0
 *
 */

class Mappings {

    /**************************************************************************/
    /************************ IMPORT MAPPINGS  ********************************/
    /**************************************************************************/
    static typeset_telemetry_frame = require('../js/typesets/typeset_telemetry_frame.js').typeset;
    static typeset_ctrl_frame = require('../js/typesets/typeset_ctrl_frame.js').typeset;

    // Errors
    static main_error = require('../json/main_errors.json');
    static main_emergencies = require('../json/main_emergencies.json');
    static icu_error = require('../json/icu_mcu_errors.json');
    static bms_error = require('../json/bms_errors.json');
    static fpga_status = require('../json/fpga_status_bits.json');
    static gatedriver_status = require('../json/gatedriver.json');
    static bms_sys_fault = require('../json/bms_sys_fault.json');
    static bms_dev_fault = require('../json/bms_dev_fault.json');
    static bms_com_fault = require('../json/bms_com_fault.json');
    static bms_uv_ov_fault = require('../json/bms_uv_ov_fault.json');
    static bms_pl455_fault_summary = require('../json/bms_pl455_fault_summary.json');

    // States (Enumeration)
    static main_state = require('../json/main_state.json');
    static brake_state = require('../json/brake_state.json');
    static icu_state = require('../json/icu_state.json');
    static fpga_state = require('../json/fpga_state.json');
    static bms_state = require('../json/bms_state.json');

    // Other Enumerations
    static brake_status = require('../json/brake_status.json');
    static run_types = require('../json/run_modes.json');
    static true_false = require('../json/true_false.json');
    static pwm_Methods = require('../json/fpga_control_method.json');
    static fpga_control_status = require('../json/fpga_control_status.json');

    /**************************************************************************/
    /**************************************************************************/
    /**************************************************************************/


    /**************************************************************************/
    /************************ GENERAL MAPPINGS  *******************************/
    /**                                                                      **/
    /** Include error and enumerations (FSM, Status & Modes)                 **/
    /**                                                                      **/
    /**************************************************************************/

    /** 
     * @typedef {object} Error
     * @property {string}  path  - Path in TelemetryFrame.
     * @property {string}  name  - Textual name description.
     * @property {object}  enum  - Reference to enumeration object
     */

    /**
     * @brief Array with all errors.
     * @type Error[]
     * 
     * @note
     * Errors are bitmask and can thus take on multiple values by combining the values with an bitwise AND operator.
     */
    static errors_list = [
        {
            path: "State.VCU_EMERGENCY_REASON",
            name: "VCU Emergency",
            enum: this.main_emergencies
        }, {
            path: "State.VCU_ERRORS",
            name: "VCU Error",
            enum: this.main_error
        }, {
            path: "Inverter.ICUFPGASTATUS",
            name: "FPGA Error",
            enum: this.fpga_status
        }, {
            path: "Inverter.ICUMCUSTATUS",
            name: "ICU Error",
            enum: this.icu_error
        }, {
            path: "Inverter.GD_STATUS",
            name: "GD Status",
            enum: this.gatedriver_status
        }, {
            path: "HV_Left.HV_L_ERROR",
            name: "HV Error (Left)",
            enum: this.bms_error
        }, {
            path: "HV_Right.HV_R_ERROR",
            name: "HV Error (Right)",
            enum: this.bms_error
        },
    ];

    /** 
     * @typedef {object} Enumeration
     * @property {string}  path  - Path in TelemetryFrame.
     * @property {string}  name  - Textual name description.
     * @property {object}  enum  - Reference to enumeration object
     * @property {"FSM"?}  type  - Type of enumeration (FSM)
     * @property {string?} ready - Corresponding ready signal for FSM enums.
     * @property {number?} index - Index of array.
     */

    /**
     * @brief Array with all enumerations.
     * @type Enumeration[]
     * 
     * @note
     * Enumerations only take one value at the time!
     */
    static enum_list = [
        {
            path: "State.STATE",
            name: "VCU State",
            enum: this.main_state,
            "type": "FSM",
        }, {
            path: "Inverter.ICUMCUSTATE",
            name: "ICU State",
            enum: this.icu_state,
            "type": "FSM",
            "ready": "Inverter.READY"
        }, {
            path: "Inverter.ICUFPGASTATE",
            name: "FPGA State",
            enum: this.fpga_state,
            "type": "FSM",
            "ready": "Inverter.ICUFPGAREADY"
        }, {
            path: "HV_Left.HV_L_STATE",
            name: "HV State (Left)",
            enum: this.bms_state,
            "type": "FSM",
            "ready": "HV_Left.HV_L_READY"
        }, {
            path: "HV_Right.HV_R_STATE",
            name: "HV State (Right)",
            enum: this.bms_state,
            "type": "FSM",
            "ready": "HV_Right.HV_R_READY"
        }, {
            path: "Brake.BRAKE_STATE",
            name: "Brake Mode",
            enum: this.brake_state,
        }, {
            path: "Brake.BRAKE_ENGAGED",
            name: "Brake State",
            enum: this.brake_status,
        }, {
            path: "FPGA.FPGA_CURRENT_STATUS",
            name: "FPGA Control (Board 0)",
            enum: this.fpga_control_status,
            index: 0
        }, {
            path: "FPGA.FPGA_CURRENT_STATUS",
            name: "FPGA Control (Board 1)",
            enum: this.fpga_control_status,
            index: 1
        }, {
            path: "FPGA.FPGA_CURRENT_STATUS",
            name: "FPGA Control (Board 2)",
            enum: this.fpga_control_status,
            index: 2
        }, {
            path: "FPGA.FPGA_CURRENT_STATUS",
            name: "FPGA Control (Board 3)",
            enum: this.fpga_control_status,
            index: 3
        }, {
            path: "FPGA.FPGA_CURRENT_STATUS",
            name: "FPGA Control (Board 4)",
            enum: this.fpga_control_status,
            index: 4
        }, {
            path: "FPGA.FPGA_CURRENT_STATUS",
            name: "FPGA Control (Board 5)",
            enum: this.fpga_control_status,
            index: 5
        }, {
            path: "FPGA.FPGA_CURRENT_STATUS",
            name: "FPGA Control (Board 6)",
            enum: this.fpga_control_status,
            index: 6
        }, {
            path: "FPGA.FPGA_CURRENT_STATUS",
            name: "FPGA Control (Board 7)",
            enum: this.fpga_control_status,
            index: 7
        },
    ];

    static typeset_list = [
        this.typeset_telemetry_frame,
        this.typeset_ctrl_frame,
        this.typeset_inverter_frame
    ];

    /**************************************************************************/
    /**************************************************************************/
    /**************************************************************************/


    /**************************************************************************/
    /************************ SPECIFIC MAPPINGS  ******************************/
    /**                                                                      **/
    /** Includes configuration for:                                          **/
    /**  - Protocol Table (displaying important values in table format)      **/
    /**  - Configuration Section (configure the pod/run parameter)           **/
    /**                                                                      **/
    /**************************************************************************/

    // Content of Protocol Table
    static protocol = [
        {
            alias: "Run Timer",
            path: "State.RUN_TIMER",
            min: 0,
            max: 65535,
            unit: "ms",
            precision: 0
        }, {
            alias: "LV BAT1 Voltage",
            path: "LV_Batteries.LV_BAT1_VOLTAGE",
            min: 22,
            max: 29.4,
            unit: "V",
            precision: 2
        }, {
            alias: "LV BAT2 Voltage",
            path: "LV_Batteries.LV_BAT2_VOLTAGE",
            min: 22,
            max: 29.4,
            unit: "V",
            precision: 2
        }, {
            alias: "LV BAT1 Current",
            path: "LV_Batteries.LV_BAT1_CURRENT",
            min: 0.2,
            max: 10,
            unit: "A",
            precision: 2
        }, {
            alias: "LV BAT2 Current",
            path: "LV_Batteries.LV_BAT2_CURRENT",
            min: 0.2,
            max: 10,
            unit: "A",
            precision: 2
        }, {
            alias: "HV Isolation",
            path: "HV_Batteries.HV_ISOLATION",
            min: 1,
            max: 1,
            unit: "-",
            precision: 0
        }, {
            alias: "HV Left Current",
            path: "HV_Left.HV_L_CURRENT",
            min: -150,
            max: 350,
            unit: "A",
            precision: 0
        }, {
            alias: "HV Left Voltage",
            path: "HV_Left.HV_L_VOLTAGE",
            min: 236,
            max: 268,
            unit: "V",
            precision: 1
        }, {
            alias: "HV Left Min Cell Voltage",
            path: "HV_Left.HV_L_MIN_CELL_VOLTAGE",
            min: 2.5,
            max: 5,
            unit: "V",
            precision: 2
        }, {
            alias: "HV Left Max Cell Voltage",
            path: "HV_Left.HV_L_MAX_CELL_VOLTAGE",
            min: 2.5,
            max: 5,
            unit: "V",
            precision: 2
        }, {
            alias: "HV Left Max Cell Temp",
            path: "HV_Left.HV_L_MAX_CELL_TEMP",
            min: 10,
            max: 60,
            unit: "°C",
            precision: 0
        }, {
            alias: "HV Right Current",
            path: "HV_Right.HV_R_CURRENT",
            min: -150,
            max: 350,
            unit: "A",
            precision: 0
        }, {
            alias: "HV Right Voltage",
            path: "HV_Right.HV_R_VOLTAGE",
            min: 236,
            max: 268,
            unit: "V",
            precision: 1
        }, {
            alias: "HV Right Min Cell Voltage",
            path: "HV_Right.HV_R_MIN_CELL_VOLTAGE",
            min: 2.5,
            max: 5,
            unit: "V",
            precision: 2
        }, {
            alias: "HV Right Max Cell Voltage",
            path: "HV_Right.HV_R_MAX_CELL_VOLTAGE",
            min: 2.5,
            max: 5,
            unit: "V",
            precision: 2
        }, {
            alias: "HV Right Max Cell Temp.",
            path: "HV_Right.HV_R_MAX_CELL_TEMP",
            min: 10,
            max: 60,
            unit: "°C",
            precision: 0
        }, {
            alias: "Brake Tank Pressure",
            path: "Brake.BRAKE_TANK",
            min: 30,
            max: 250,
            unit: "bar",
            precision: 0
        }, {
            alias: "Brake Left Action",
            path: "Brake.BRAKE_LEFT_ACTION",
            min: 4,
            max: 10,
            unit: "bar",
            precision: 3
        }, {
            alias: "Brake Left Release",
            path: "Brake.BRAKE_LEFT_RELEASE",
            min: 4,
            max: 10,
            unit: "bar",
            precision: 3
        }, {
            alias: "Brake Right Action",
            path: "Brake.BRAKE_RIGHT_ACTION",
            min: 4,
            max: 10,
            unit: "bar",
            precision: 3
        }, {
            alias: "Brake Right Release",
            path: "Brake.BRAKE_RIGHT_RELEASE",
            min: 4,
            max: 10,
            unit: "bar",
            precision: 3
        }, {
            alias: "Brake Pressure Regulator Out",
            path: "Brake.BRAKE_PRESSUREREGULATORIN",
            min: 0,
            max: 10,
            unit: "bar",
            precision: 3
        }, {
            alias: "Max. Motor Temp (PT100)",
            path: "Motor_Temperatures.TEMP_PT100_MAX",
            min: 0,
            max: 80,
            unit: "°C",
            precision: 1
        }, {
            alias: "Max. Motor Trip (PTC)",
            path: "Motor_Temperatures.TEMP_PTC_MAX",
            min: 0,
            max: 1,
            unit: "kOhm",
            precision: 2
        }, {
            alias: "Max. Inverter Temp",
            path: "Inverter.MAX_TEMP",
            min: 0,
            max: 80,
            unit: "°C",
            precision: 1
        },
    ];

    /**
     * @typedef {object} ConfigEntry
     * @property {string} path_telemetry - Path in TelemetryFrame.
     * @property {string} path - Path in CtrlFrame.
     * @property {string} name - Name visible in table.
     * @property {"header" | "number" | "enum"} type - Type of variable (header, number or enum).
     * @property {string} modal - HTML ID in run approval dialog
     * @property {object} enum - Reference to enumeration object
     */

    /** @type ConfigEntry[] */
    static config_values = [
        {
            path_telemetry: "Configuration.CONFIG_RUNTYPE",
            path: "config_runType",
            name: "Run Type",
            type: "enum",
            modal: "run_modal_runtype",
            enum: this.run_types
        }, {
            path_telemetry: "Configuration.CONFIG_PWMMETHOD",
            path: "config_pwmMethod",
            name: "PWM Generation Method",
            type: "enum",
            modal: "run_modal_pwmMethod",
            enum: this.pwm_Methods
        }, {
            path_telemetry: "Configuration.CONFIG_RUNFORWARD",
            path: "config_runForward",
            name: "Run Forward",
            type: "enum",
            modal: "run_modal_runforward",
            enum: this.true_false
        }, {
            path_telemetry: "Configuration.CONFIG_RUNDURATION",
            path: "config_runDuration",
            name: "Run Duration",
            type: "decimal",
            modal: "run_modal_runduration"
        }, {
            name: "Inverter - Current",
            type: "header"
        }, {
            path_telemetry: "Configuration.CONFIG_BANDWIDTHLOW",
            path: "config_bandwidthLow",
            name: "Current Bandwidth Low",
            type: "number",
            modal: "run_modal_currentbandwidthlow",
        }, {
            path_telemetry: "Configuration.CONFIG_BANDWIDTHHIGH",
            path: "config_bandwidthHigh",
            name: "Current Bandwidth High",
            type: "number",
            modal: "run_modal_currentbandwidthhigh",
        }, {
            path_telemetry: "Configuration.CONFIG_TARGETCURRENT",
            path: "config_targetCurrent",
            name: "Target Current",
            type: "number",
            modal: "run_modal_targetcurrent",
        }, {
            path_telemetry: "Configuration.CONFIG_ZEROCURRENT",
            path: "config_zeroCurrent",
            name: "Zero Current",
            type: "number",
            modal: "run_modal_zerocurrent",
        }, {
            path_telemetry: "Configuration.CONFIG_OVERCURRENTLIMIT_LO",
            path: "config_overCurrentLimit_lo",
            name: "Over Current Limit Lo",
            type: "number",
            modal: "run_modal_overcurrentlimitlo",
        }, {
            path_telemetry: "Configuration.CONFIG_OVERCURRENTLIMIT_HI",
            path: "config_overCurrentLimit_hi",
            name: "Over Current Limit Hi",
            type: "number",
            modal: "run_modal_overcurrentlimithi",
        }, {
            path_telemetry: "Configuration.CONFIG_ADC_MAXOFFSET",
            path: "config_ADC_MaxOffset",
            name: "ADC Max Offset",
            type: "number",
            modal: "run_modal_adc_maxoffset",
        }, {
            path_telemetry: "Configuration.CONFIG_ADC_MAXNOISERANGE",
            path: "config_ADC_MaxNoiseRange",
            name: "ADC Max Noise Range",
            type: "number",
            modal: "run_modal_adc_maxnoiserange",
        }, {
            path_telemetry: "Configuration.CONFIG_NUMINVERTERSENABLED",
            path: "config_NumInvertersEnabled",
            name: "Number of Inverters enabled",
            type: "number",
            modal: "run_modal_numInverters",
        }, {
            name: "Track",
            type: "header"
        }, {
            path_telemetry: "Configuration.CONFIG_SETPOSITION",
            path: "config_setPosition",
            name: "Set Position",
            type: "number",
            unit: "Teeth",
            modal: "run_modal_setposition",
        }, {
            path_telemetry: "Configuration.CONFIG_RUNLENGTH",
            path: "config_runLength",
            name: "Run Length",
            type: "number",
            unit: "Teeth",
            modal: "run_modal_runlength"
        }, {
            path_telemetry: "Configuration.CONFIG_RIDELENGTH",
            path: "config_rideLength",
            name: "Ride Length",
            type: "number",
            modal: "run_modal_ridelength"
        }, {
            path_telemetry: "Configuration.CONFIG_TRACKLENGTH",
            path: "config_trackLength",
            name: "Track Length",
            type: "number",
            modal: "run_modal_tracklength"
        }, {
            path_telemetry: "Configuration.CONFIG_PROPTRACKLENGTH",
            path: "config_propTrackLength",
            name: "Propulsion Track Length",
            type: "number",
            unit: "Teeth",
            modal: "run_modal_proptracklength"
        }, {
            name: "Inverter - Temperature/Voltage",
            type: "header"
        }, {
            path_telemetry: "Configuration.CONFIG_MAXVOLTAGE",
            path: "config_maxVoltage",
            name: "Max Voltage",
            type: "number",
            modal: "run_modal_maxvoltage",
        }, {
            path_telemetry: "Configuration.CONFIG_TEMP2STARTFAN",
            path: "config_Temp2startFan",
            name: "Temperature to start fan",
            type: "number",
            unit: "°C",
            modal: "run_modal_Temp2startFan"
        }, {
            path_telemetry: "Configuration.CONFIG_MAXMOSFETTEMP",
            path: "config_maxMosfetTemp",
            name: "Maximum Mosfet Temperature",
            type: "number",
            unit: "°C",
            modal: "run_modal_maxMosfetTemp"
        }, {
            name: "VCU - Braking",
            type: "header"
        }, {
            path_telemetry: "Brake.BRAKE_STATE",
            path: "config_brake_state",
            name: "Brake State",
            type: "enum",
            modal: "run_modal_brakestate",
            enum: this.brake_state
        }, {
            path_telemetry: "Brake.BRAKE_CONTROLLEDBRAKINGPRESSURE",
            path: "config_controlled_Braking_pressure",
            name: "Controlled Braking Pressure",
            type: "number",
            modal: "run_modal_controlledbrakingpressure"
        }, {
            name: "Battery",
            type: "header"
        }, {
            path_telemetry: "HV_Batteries.NUMBER_OF_BATTERIES",
            path: "config_number_of_batteries",
            name: "Number of Batteries per side",
            type: "number",
            modal: "run_modal_num_of_batteries"
        }
    ];

    /**************************************************************************/
    /**************************************************************************/
    /**************************************************************************/


    /**************************************************************************/
    /************************ UTILITY FUNCTIONS *******************************/
    /**************************************************************************/

    /**
     * Returns string descriptor of an enumerated value
     *
     * @param enumeration JSON with enumeration
     * @param value Value or flag of enumeration
     * @returns {object} Textual description
     */
    static select_flag(enumeration, value) {
        if (enumeration === undefined) return value;
        let length = enumeration.length;

        for (let i = 0; i < length; i++) {
            if (value === enumeration[i].flag) {
                return enumeration[i].description;
            }
        }

        return "Unknown";
    }

    /**
     * Returns JSON enumeration of a path
     *
     * @param list Array with mappings.
     * @param path Value of enumeration
     * @returns {object} JSON enumeration.
     */
    static select_enum(list, path) {
        if (list === undefined) return undefined;
        let length = list.length;

        for (let i = 0; i < length; i++) {
            if (path === list[i].path) {
                return list[i].enum;
            }
        }
        return undefined;
    }

    static select_mapping(list, path) {
        if (list === undefined) return undefined;
        let length = list.length;

        for (let i = 0; i < length; i++) {
            if (path === list[i].path) {
                return list[i];
            }
        }
        return undefined;
    }

    /**************************************************************************/
    /**************************************************************************/
    /**************************************************************************/
}

module.exports = Mappings;

// Example:
// const mappings = require('./config/mappings.js');
// const enum = mappings.select_enum(mappings.state_list, "State.STATE")
// const desc = mappings.select_flag(enum, 1)
// console.log(enum)
// console.log(desc)
