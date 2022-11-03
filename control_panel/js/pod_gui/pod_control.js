/**
 * @file      pod_control.js
 * @brief     Pod control interface
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
const util = require('../util.js')
const { ipcRenderer } = require('electron')

const mappings = require('../../config/mappings.js');

const buttons = {
    bms_balance:      $("#bms_balance"),
    bms_balance_start:$("#bms_balance_start"),
    bms_balance:     $("#bms_balance"),
    bms_restart_left:       $("#bms_restart_left"),
    bms_restart_right:       $("#bms_restart_right"),
    pod_reset:       $("#pod_reset"),
    vcu_reset:       $("#vcu_reset"),
    inverter_adc_calibrate:  $("#inverter_adc_calibrate"),
    inverter_restart:  $("#inverter_restart"),
    inverter_do_foo:  $("#inverter_do_foo"),
    main_brake:      $("#main_brake"),
    main_clear:      $("#main_clear"),
    run_reset:       $("#run_reset"),
    eject:           $("#eject_button")
};

class PodControl {
    /**
     * Constructor
     * @param eventEmitter App-wide command emitter.
     */
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;

        // Add event listeners
        window.addEventListener("load", () => {
            this.add_event_listeners();
        });
    }

    /**
     * Setup listener for new telemetry frame and button clicks
     * @package
     */
    add_event_listeners() {
        buttons["eject"].on("click", () => {
            ipcRenderer.send('sendCtrlFrame',{"sd_card_flush": 1});
        });
        buttons["bms_balance"].on("click", () => {
            $('#balanceModal').modal('hide');
            ipcRenderer.send('sendCtrlFrame',{"bms_balance" : 1});
        });
        buttons["bms_balance"].on("click", () => {
            if (buttons["bms_balance"].html() === "Balance Disable") {
                // Disable Balancing
                ipcRenderer.send('sendCtrlFrame',{"bms_balancing": 1});
            } else {
                // Enable Balancing
                ipcRenderer.send('sendCtrlFrame',{"bms_balancing": 2});
            }
        });
        buttons["bms_restart_left"].on("click", () => {
            ipcRenderer.send('sendCtrlFrame',{"bms_software_reset_left": 1});
        });
        buttons["bms_restart_right"].on("click", () => {
            ipcRenderer.send('sendCtrlFrame',{"bms_software_reset_right": 1});
        });
        buttons["inverter_adc_calibrate"].on("click", () => {
            ipcRenderer.send('sendCtrlFrame',{"inverter_adc_calibrate": 1});
        });
        buttons["inverter_restart"].on("click", () => {
            ipcRenderer.send('sendCtrlFrame',{"inverter_software_reset": 1});
        });
        buttons["inverter_do_foo"].on("click", () => {
            ipcRenderer.send('sendCtrlFrame',{"inverter_do_foo": 1});
        });
        buttons["pod_reset"].on("click", () => {
            ipcRenderer.send('sendCtrlFrame',{"pod_reset_error": 1});
        });
        buttons["vcu_reset"].on("click", () => {
            ipcRenderer.send('sendCtrlFrame',{"vcu_software_reset": 1});
        });
        buttons["main_brake"].on("click", () => {
            if (buttons["main_brake"].html() === "Brake Do Disengage") {
                // Engage Brake
                ipcRenderer.send('sendCtrlFrame',{"brake_engage": 1});
            } else {
                // Disengage Brake
                ipcRenderer.send('sendCtrlFrame',{"brake_engage": 2});
            }
        });
        buttons["run_reset"].on("click", () => {
            ipcRenderer.send('sendCtrlFrame',{"reset_run": 1});
        });

        ipcRenderer.on('telemetryFrame', (_event, frame) =>{
            this.update_control_buttons(frame);
        });
    }

    update_control_buttons(frame) {
        let text = "";

        // Charge
        // let state = util.json_array_select_value(mappings.main_state, frame.State.STATE);
        // if (
        //     state.description === "Idle"
        //     && ! frame.HV_Left.HV_L_ERROR
        //     && ! frame.HV_Right.HV_R_ERROR
        // ) {
        //     buttons["bms_balance_start"].attr("disabled", false)
        // } else {
        //     buttons["bms_balance_start"].attr("disabled", true);
        // }

        // // Balance
        // // if (
        // //     !frame.High_Voltage_Batteries.HV_BAT_ERROR
        // // ){
        // //     buttons["bms_balance"].attr("disabled", false)
        // // } else {
        // //     buttons["bms_balance"].attr("disabled", true)
        // // }
        // if (frame.HV_Left.HV_L_BALANCING || frame.HV_Right.HV_R_BALANCING) {
        //     text = "Balance Disable";
        //     buttons["bms_balance"].addClass("btn-success")
        //     buttons["bms_balance"].removeClass("btn-orange")
        // } else {
        //     text = "Balance Enable";
        //     buttons["bms_balance"].removeClass("btn-success")
        //     buttons["bms_balance"].addClass("btn-orange")
        // }
        // buttons["bms_balance"].html(text);

        // Brake
        let brakes_engaged = frame.Brake.BRAKE_ENGAGE
        if (brakes_engaged === 1) {
            text ="Brake Do Disengage";
            buttons["main_brake"].css("background","grey");
        } else {
            text ="Brake Do Engage";
            buttons["main_brake"].css("background","green");
        }
        buttons["main_brake"].html(text);
    }
}

function init(eventEmitter) {
    return new PodControl(eventEmitter);
}

module.exports = init;