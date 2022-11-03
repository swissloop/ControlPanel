/**
 * @file      pod_overview.js
 * @brief     Virtual representation of the pod featuring an overview of all
 *            important values and states
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
 * @module GUI:Pod_overview
 * @version 3.0.0
 *
 * @listens electron:ipcRenderer~telemetryFrame
 * @listens window~load
 *
 * @emits electron:ipcRenderer~mainStatus
 *
 */
const { ipcRenderer } = require('electron')
const util = require('../util');
const mappings = require('../../config/mappings.js');

let pod_svg;

class Pod_overview {
    /**
     * Constructor
     * @param eventEmitter App-wide command emitter.
     */
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;

        window.addEventListener("load", () => {
            // Insert CSS into SVG object, save objects & add event listeners
            pod_svg = document.getElementById('pod-svg').contentDocument;
            let style_pod = pod_svg.createElementNS("http://www.w3.org/2000/svg", "style");
            let svgElem_pod = pod_svg.querySelector('svg');

            style_pod.textContent = '@import url("../css/pod.css");';
            svgElem_pod.insertBefore(style_pod, svgElem_pod.firstChild);

            this.add_event_listeners();
        });
    }

    /**
     * Setup listener for new telemetry frame
     * @package
     */
    add_event_listeners() {
        ipcRenderer.on('telemetryFrame', (_event, frame) => {
            this.update_raw_values(frame);
            this.update_calculated_values(frame);
            this.update_indicators(frame);
        });
    }

    /**
     * Directly update values in pod overview with new data from frame
     * @param {object} frame Parsed jBinary TelemetryFrame
     */
    update_raw_values(frame) {

        // Binding SVG fields directly to telemetry frame values
        // Format {svg_id}: {config}
        // Possible properties in {config}:
        //  precision:      number          (e.g. 2)
        //  array_range:    array           (e.g. [0, 1, 3])
        //  array_func:     function        (e.g. Math.max)
        const value_overview = {
            "inverter.1.temp":
                { path: "Inverter.TEMPERATURE_MOSFETS", precision: 1, array_range: [0, 1, 2], array_func: Math.max },
            "inverter.2.temp":
                { path: "Inverter.TEMPERATURE_MOSFETS", precision: 1, array_range: [3, 4, 5], array_func: Math.max },
            "inverter.3.temp":
                { path: "Inverter.TEMPERATURE_MOSFETS", precision: 1, array_range: [6, 7, 8], array_func: Math.max },
            "inverter.4.temp":
                { path: "Inverter.TEMPERATURE_MOSFETS", precision: 1, array_range: [9, 10, 11], array_func: Math.max },
            "tank.pressure":
                { path: "Brake.BRAKE_TANK", precision: 0 },
            "brake.l.action.pressure":
                { path: "Brake.BRAKE_LEFT_ACTION", precision: 0 },
            "brake.r.action.pressure":
                { path: "Brake.BRAKE_RIGHT_ACTION", precision: 0 },
            "brake.l.release.pressure":
                { path: "Brake.BRAKE_LEFT_RELEASE", precision: 0 },
            "brake.r.release.pressure":
                { path: "Brake.BRAKE_RIGHT_RELEASE", precision: 0 },
            "motor.temp.1":
                { path: "Motor_Temperatures.TEMP_PT100_2.0", precision: 0 },
            "motor.temp.2":
                { path: "Motor_Temperatures.TEMP_PT100_2.1", precision: 0 },
            "motor.temp.3":
                { path: "Motor_Temperatures.TEMP_PT100_2.2", precision: 0 },
            "motor.temp.4":
                { path: "Motor_Temperatures.TEMP_PT100_2.3", precision: 0 },
            "motor.temp.5":
                { path: "Motor_Temperatures.TEMP_PT100_2.4", precision: 0 },
            "motor.temp.6":
                { path: "Motor_Temperatures.TEMP_PT100_2.5", precision: 0 },
            "motor.temp.7":
                { path: "Motor_Temperatures.TEMP_PT100_2.6", precision: 0 },
            "lv.1.current":
                { path: "LV_Batteries.LV_BAT1_CURRENT", precision: 1 },
            "lv.2.current":
                { path: "LV_Batteries.LV_BAT2_CURRENT", precision: 1 },
            "lv.1.voltage":
                { path: "LV_Batteries.LV_BAT1_VOLTAGE", precision: 1 },
            "lv.2.voltage":
                { path: "LV_Batteries.LV_BAT2_VOLTAGE", precision: 1 },
            "speed.distance":
                { path: "Velocity.CORRAIL_DISTANCE", precision: 1 },
            "speed.velocity.max.run":
                { path: "Velocity.CORRAIL_MAX_VELOCITY", precision: 1 },
            "speed.velocity":
                { path: "Velocity.CORRAIL_VELOCITY", precision: 1 },
            "hv.bat_r.current":
                { path: "HV_Right.HV_R_CURRENT", precision: 1 },
            "hv.bat_r.voltage":
                { path: "HV_Right.HV_R_VOLTAGE", precision: 1 },
            "hv.bat_r.temp":
                { path: "HV_Right.HV_R_MAX_CELL_TEMP", precision: 1 },
            "hv.bat_l.current":
                { path: "HV_Left.HV_L_CURRENT", precision: 1 },
            "hv.bat_l.voltage":
                { path: "HV_Left.HV_L_VOLTAGE", precision: 1 },
            "hv.bat_l.temp":
                { path: "HV_Left.HV_L_MAX_CELL_TEMP", precision: 1 },
            "motor.current.0b":
                { path: "FPGA.FPGA_CURRENT_ADC_VALUES.7", precision: 0 },
            "motor.current.0a":
                { path: "FPGA.FPGA_CURRENT_ADC_VALUES.6", precision: 0 },
            "motor.current.1b":
                { path: "FPGA.FPGA_CURRENT_ADC_VALUES.1", precision: 0 },
            "motor.current.1a":
                { path: "FPGA.FPGA_CURRENT_ADC_VALUES.0", precision: 0 },
            "motor.current.2b":
                { path: "FPGA.FPGA_CURRENT_ADC_VALUES.5", precision: 0 },
            "motor.current.2a":
                { path: "FPGA.FPGA_CURRENT_ADC_VALUES.4", precision: 0 },
            "motor.current.3b":
                { path: "FPGA.FPGA_CURRENT_ADC_VALUES.3", precision: 0 },
            "motor.current.3a":
                { path: "FPGA.FPGA_CURRENT_ADC_VALUES.2", precision: 0 },
            "inverter.1.voltage":
                { path: "Inverter.BOARD_VOLTAGES.0", precision: 1 },
            "inverter.2.voltage":
                { path: "Inverter.BOARD_VOLTAGES.1", precision: 1 },
            "inverter.3.voltage":
                { path: "Inverter.BOARD_VOLTAGES.2", precision: 1 },
            "inverter.4.voltage":
                { path: "Inverter.BOARD_VOLTAGES.3", precision: 1 },
        }

        for (let key in value_overview) {
            let category = value_overview[key].path.split(".")[0];
            let name = value_overview[key].path.split(".")[1];
            let index = value_overview[key].path.split(".")[2];
            let precision = value_overview[key].precision
            let unit = mappings.typeset_telemetry_frame.Unit[category][name];
            let factor = mappings.typeset_telemetry_frame.Factor[category][name];

            if (unit === "number") {
                unit = "";
            }

            let value = NaN;
            // Check if values have to be reduced
            if (value_overview[key].hasOwnProperty('array_range')) {
                let values = []
                for (let index in value_overview[key].array_range) {
                    values.push(frame[category][name][index])
                }
                value = value_overview[key].array_func(...values)
            } else {
                if (index === undefined) {
                    value = frame[category][name];
                } else {
                    value = frame[category][name][index];
                }
            }

            // Do special transformation for certain fields
            switch (key) {
                case "motor.current.0b":
                case "motor.current.0a":
                case "motor.current.1b":
                case "motor.current.1a":
                case "motor.current.2b":
                case "motor.current.2a":
                case "motor.current.3b":
                case "motor.current.3a":
                    value = util.adc2ampere(value)
                    unit = "A"
                    pod_svg.getElementById(key).style.fill =
                        value > 100 || value < -100 ? this.indicator_colors['r'] :
                        value >   5 ? this.indicator_colors['black'] :
                        value <  -5 ? this.indicator_colors['b'] :
                                     this.indicator_colors['gray'];
                    break;
                default:
                    break;
            }
            pod_svg.getElementById(key).innerHTML = `${(value / factor).toFixed(precision)} ${unit}`;
        }
    }

    // Calculated values
    #max_velocity = 0;
    #max_power_reactive= 0;
    #max_power_real = 0;

    /**
    * Update calculated values based on frame values
    * @param {object} frame Parsed jBinary TelemetryFrame
    */
    update_calculated_values(frame) {
        let value = 0

        // Maximal session speed
        value = frame.Velocity.CORRAIL_MAX_VELOCITY / mappings.typeset_telemetry_frame.Factor.Velocity.CORRAIL_MAX_VELOCITY
        if (value > this.#max_velocity) this.#max_velocity = value

        pod_svg.getElementById('speed.velocity.max.session').innerHTML = `${this.#max_velocity.toFixed(1)} m/s`;
        pod_svg.getElementById('speed.velocity.max.session.kmh').innerHTML = `${(this.#max_velocity*3.6).toFixed(1)} km/h`;

        // Max run velocity in km/h
        pod_svg.getElementById('speed.velocity.max.run.kmh').innerHTML = `${(value*3.6).toFixed(1)} km/h`;

         // Maximal session power
         value = frame.Inverter.REAL_POWER / mappings.typeset_telemetry_frame.Factor.Inverter.REAL_POWER
         if (value > this.#max_power_real) this.#max_power_real = value
         pod_svg.getElementById('power.real.max.session').innerHTML = `${(this.#max_power_real/1000).toFixed(1)} kW`;

         value = frame.Inverter.REACTIVE_POWER / mappings.typeset_telemetry_frame.Factor.Inverter.REACTIVE_POWER
         if (value > this.#max_power_reactive) this.#max_power_reactive = value
         pod_svg.getElementById('power.reactive.max.session').innerHTML = `${(this.#max_power_reactive).toFixed(1)} kvar`;

            
        // Inverter power
        [0, 1, 2, 3].forEach(index => {
            let current1 = util.adc2ampere(frame.FPGA.FPGA_CURRENT_ADC_VALUES[2 * index])
            let current2 = util.adc2ampere(frame.FPGA.FPGA_CURRENT_ADC_VALUES[2 * index + 1])
            let voltage = frame.Inverter.BOARD_VOLTAGES[index] / mappings.typeset_telemetry_frame.Factor.Inverter.BOARD_VOLTAGES

            let value = (Math.abs(current1 * voltage) + Math.abs(current2 * voltage)) / 1000
            pod_svg.getElementById(`inverter.${index + 1}.power`).innerHTML = `${value.toFixed(2)} kW`;

        })

        // Battery State
        value = mappings.select_flag(mappings.bms_state, frame.HV_Right.HV_R_STATE)
        pod_svg.getElementById(`hv.bat_r.state`).innerHTML = `${value}`;

        value = mappings.select_flag(mappings.bms_state, frame.HV_Left.HV_L_STATE)
        pod_svg.getElementById(`hv.bat_l.state`).innerHTML = `${value}`;

        // Pod State
        value = mappings.select_flag(mappings.main_state, frame.State.STATE)
        if (value === "Emergency") {
            this.#EMGWarn = true
        } else {
            this.#EMGWarn = false;
        }

        this.#LVWarn = false;
        ["LV_Batteries.LV_BAT1_VOLTAGE",
            "LV_Batteries.LV_BAT2_VOLTAGE",
            "LV_Batteries.LV_BAT1_CURRENT",
            "LV_Batteries.LV_BAT2_CURRENT"
        ].forEach(path => {
            let prot = mappings.select_mapping(mappings.protocol, path)
            let value = eval("frame. " + path) / eval("mappings.typeset_telemetry_frame.Factor." + path);
            if ((value > prot["max"]) || (value < prot["min"])) {
                this.#LVWarn = true;
            }
        });

        // Brake State
        this.#BrakeWarn = false;
        if (frame.Brake.BRAKE_SENSORLEFTENGAGED || frame.Brake.BRAKE_SENSORRIGHTENGAGED) {
            this.#BrakeWarn = true;
        }

        // Temperature
        this.#TempWarn = false;
        ["Motor_Temperatures.TEMP_PT100_MAX",
            "Inverter.MAX_TEMP",
        ].forEach(path => {
            let prot = mappings.select_mapping(mappings.protocol, path)
            let value = eval("frame. " + path) / eval("mappings.typeset_telemetry_frame.Factor." + path);
            if ((value > prot["max"]) || (value < prot["min"])) {
                this.#TempWarn = true;
            }
        });


        // Inverter voltage
        this.#HVWarn = false;
        [0, 1, 2, 3].forEach(i => {
            if ((frame.Inverter.BOARD_VOLTAGES[i] / mappings.typeset_telemetry_frame.Factor.Inverter.BOARD_VOLTAGES >= 42)) {
                this.#HVWarn = true;
            }
        });

        // Isolation
        if (frame.HV_Batteries.HV_ISOLATION) {
            this.#ISOWarn = false;
        } else {
            this.#ISOWarn = true;
        }

        // Trip
        this.#TripWarn = false;
        let prot = mappings.select_mapping(mappings.protocol, "Motor_Temperatures.TEMP_PTC_MAX")
        if (frame.Motor_Temperatures.TEMP_PTC_MAX / mappings.typeset_telemetry_frame.Factor.Motor_Temperatures.TEMP_PTC_MAX > prot["max"]) {
            this.#TripWarn = true;
        }
    }

    // Pod State Indicator
    #EMGWarn = false
    #LVWarn = false;
    #BrakeWarn = false;
    #TempWarn = false
    #HVWarn = false;
    #ISOWarn = false;
    #TripWarn = false;

    indicator_colors = {
        r: '#FF0033',
        y: '#FFCC33',
        g: '#66FF33',
        b: '#3399CC',
        w: '#DDDDDD',
        gray: '#999999',
        black: '#000000',
    }

    /**
     * Update indicators in pod overview with new data from frame
     * @param {object} frame Parsed jBinary TelemetryFrame
     */
    update_indicators(frame) {

        /**
         * Indicator Icons
         */

        // FPGA Phase (frame.FPGA.FPGA_PHASE)
        // console.log('iref', util.dec2bin(frame.FPGA.FPGA_IREF, 8));
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 2; j++) {
                let inverterId = i;
                switch (inverterId) { // invert inverter mapping
                    case 0: inverterId = 3; break;
                    case 1: inverterId = 0; break;
                    case 2: inverterId = 2; break;
                    case 3: inverterId = 1; break;
                }
                let phaseId = inverterId*2 + j;
                let alphaPhase = (j === 0 ? 'a' : 'b');
                if(frame.FPGA.FPGA_PHASE & (1 << phaseId)) {
                    pod_svg.getElementById('motor.phase.' + i + '.' + alphaPhase + '0').style.opacity = 0;
                    pod_svg.getElementById('motor.phase.' + i + '.' + alphaPhase + '1').style.opacity = 0;
                } else {
                    pod_svg.getElementById('motor.phase.' + i + '.' + alphaPhase + '0').style.opacity = 0.7;
                    pod_svg.getElementById('motor.phase.' + i + '.' + alphaPhase + '1').style.opacity = 0.7;
                }
            }
        }

        // EMG Warning Icon
        if (this.#EMGWarn) {
            pod_svg.getElementById('indicators.emg').style.fill = "red";
            pod_svg.getElementById('indicators.emg').style.filter = "url(#f_indicators)";
            pod_svg.getElementById('indicators.emg.anim').style.fill = "#ffea96";
            pod_svg.getElementById('indicators.emg.anim').style.filter = "url(#f_indicators)";
            pod_svg.getElementById('indicators.emg.animation').beginElement();
        } else {
            pod_svg.getElementById('indicators.emg').style.fill = "#DEDEDE";
            pod_svg.getElementById('indicators.emg').style.filter = "none";
            pod_svg.getElementById('indicators.emg.anim').style.fill = "none";
            pod_svg.getElementById('indicators.emg.anim').style.filter = "none";
            pod_svg.getElementById('indicators.emg.animation').endElement();
        }

        // LV Warning Icon
        if (this.#LVWarn) {
            pod_svg.getElementById('indicators.lv').style.fill = "red";
            pod_svg.getElementById('indicators.lv').style.filter = "url(#f_indicators)";
        } else {
            pod_svg.getElementById('indicators.lv').style.fill = "#DEDEDE";
            pod_svg.getElementById('indicators.lv').style.filter = "none";
        }

        // Brake Warning Icon
        if (this.#BrakeWarn) {
            pod_svg.getElementById('indicators.brake').style.fill = "red";
            pod_svg.getElementById('indicators.brake').style.filter = "url(#f_indicators)";
        } else {
            pod_svg.getElementById('indicators.brake').style.fill = "#DEDEDE";
            pod_svg.getElementById('indicators.brake').style.filter = "none";
        }

        // Temperature Warning Icon
        if (this.#TempWarn) {
            pod_svg.getElementById('indicators.temperature').style.fill = "red";
            pod_svg.getElementById('indicators.temperature').style.filter = "url(#f_indicators)";
        } else {
            pod_svg.getElementById('indicators.temperature').style.fill = "#DEDEDE";
            pod_svg.getElementById('indicators.temperature').style.filter = "none";
        }

        // HV Warning Icon
        if (this.#HVWarn) {
            pod_svg.getElementById('indicators.hv').style.fill = "red";
            pod_svg.getElementById('indicators.hv').style.filter = "url(#f_indicators)";
        } else {
            pod_svg.getElementById('indicators.hv').style.fill = "#DEDEDE";
            pod_svg.getElementById('indicators.hv').style.filter = "none";
        }

        // Isolation Warning Icon
        if (this.#ISOWarn) {
            pod_svg.getElementById('indicators.iso').style.fill = "red";
            pod_svg.getElementById('indicators.iso').style.filter = "url(#f_indicators)";
            pod_svg.getElementById("isolation").style.stroke = this.indicator_colors['r'];
            pod_svg.getElementById("isolation").style.strokeDasharray = 20;
        } else {
            pod_svg.getElementById('indicators.iso').style.fill = "#DEDEDE";
            pod_svg.getElementById('indicators.iso').style.filter = "none";
            pod_svg.getElementById("isolation").style.stroke = this.indicator_colors['g'];
            pod_svg.getElementById("isolation").style.strokeDasharray = 0;
        }

        // Trip Warning Icon
        if (this.#TripWarn) {
            pod_svg.getElementById('indicators.trip').style.fill = "red";
            pod_svg.getElementById('indicators.trip').style.filter = "url(#f_indicators)";
        } else {
            pod_svg.getElementById('indicators.trip').style.fill = "#DEDEDE";
            pod_svg.getElementById('indicators.trip').style.filter = "none";
        }

        /**
         * Colors Indicators
         */

        // Inverter Errors
        let errors = mappings.gatedriver_status;
        let boards = [false, false, false, false];
        errors.forEach(error => {
            if ((1 << error.flag) & frame.Inverter.GD_STATUS) {
                let board = parseInt(error.description.split("_")[1])
                boards[board] = true;
            }
        });

        for (let i = 0; i < 4; ++i) {
            if (boards[i] == true) {
                pod_svg.getElementById('inverter.' + (i + 1) + '.background').style.fill = this.indicator_colors["r"];
            } else {
                pod_svg.getElementById('inverter.' + (i + 1) + '.background').style.fill = this.indicator_colors["g"];
            }
        }

        // HV Battery states
        switch (mappings.select_flag(mappings.bms_state, frame.HV_Right.HV_R_STATE)) {
            case "Charge":
            case "Balancing":
                pod_svg.getElementById('hv.bat_r.background').style.fill = this.indicator_colors["y"];
                break;
            case "Idle":
            case "Precharge":
            case "Ready":
            case "Run":
                pod_svg.getElementById('hv.bat_r.background').style.fill = this.indicator_colors["g"];
                break;
            case "Disconnected":
                pod_svg.getElementById('hv.bat_r.background').style.fill = this.indicator_colors["gray"];
                break;
            case "Emergency":
            default:
                pod_svg.getElementById('hv.bat_r.background').style.fill = this.indicator_colors["r"];
                break;
        }

        switch (mappings.select_flag(mappings.bms_state, frame.HV_Left.HV_L_STATE)) {
            case "Charge":
            case "Balancing":
                pod_svg.getElementById('hv.bat_l.background').style.fill = this.indicator_colors["y"];
                break;
            case "Idle":
            case "Precharge":
            case "Ready":
            case "Run":
                pod_svg.getElementById('hv.bat_l.background').style.fill = this.indicator_colors["g"];
                break;
            case "Disconnected":
                pod_svg.getElementById('hv.bat_l.background').style.fill = this.indicator_colors["gray"];
                break;
            case "Emergency":
            default:
                pod_svg.getElementById('hv.bat_l.background').style.fill = this.indicator_colors["r"];
                break;
        }

        // ICU State
        switch (mappings.select_flag(mappings.icu_state, frame.Inverter.ICUMCUSTATE)) {
            case "Idle":
            case "Setup":
            case "Ready":
            case "Run":
            case "Shutdown":
            case "Reset":
                pod_svg.getElementById('icu.background').style.fill = this.indicator_colors["g"];
                break;
            case "Disconnected":
                pod_svg.getElementById('icu.background').style.fill = this.indicator_colors["gray"];
                break;
            case "Emergency":
            default:
                pod_svg.getElementById('icu.background').style.fill = this.indicator_colors["r"];
                break;
        }
    }
}

function init(eventEmitter) {
    return new Pod_overview(eventEmitter);
}

module.exports = init;
