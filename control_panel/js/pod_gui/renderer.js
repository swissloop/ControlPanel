/**
 * @file      renderer.js
 * @brief     Main renderer for GUI
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
 * @module GUI:Pod
 * @version 3.0.0
 *
 * @listens window~keydown
 *
 * @emits electron:ipcRenderer~startLogging
 * @emits electron:ipcRenderer~stopLogging
 *
 */

const electronLocalShortcut = require('electron-localshortcut');
const { ipcRenderer } = require('electron')
const mainWindow = require('@electron/remote').getCurrentWindow();
const EventEmitter = require('events').EventEmitter;

let eventEmitter = new EventEmitter();
eventEmitter.setMaxListeners(Infinity);

// Initialize & load modules
require('./progress_bar.js')(eventEmitter);
require('./protocol_table.js')(eventEmitter);
require('./error_table.js')(eventEmitter);
require('./hv_bat_tables')(eventEmitter);
require('./pod_control')(eventEmitter);
require('./config_table.js')(eventEmitter);
require('./state_table.js')(eventEmitter);
require('./icu.js')(eventEmitter);
require('./pod_overview.js')(eventEmitter);
require('./testing_area.js')(eventEmitter);

const util = require('../util.js')
const mappings = require('../../config/mappings.js')

const config = require('../../config/config');

ipcRenderer.setMaxListeners(Infinity);

// Log errors to console:
ipcRenderer.on('error',  (_event, args) => {
    console.log(...args)
});

ipcRenderer.on('console_log', (_event, args) => {
    console.log(...args)
});

// MANUAL KEYBOARD CONTROLS
let last_space_timestamp = 0;
electronLocalShortcut.register(mainWindow, 'B', () => {
    // emergency on double press
    if (Date.now() - last_space_timestamp < 1000) {
        ipcRenderer.send('sendCtrlFrame',{"vcu_set_state": 7});
    } else {
        last_space_timestamp = Date.now();
    }
});

let command = 1;
let crawlEnabled = false;

// Prevent from scrolling and emergency on space
mainWindow.webContents.on("before-input-event", function (_event, e) {
    if (e.type === "keyDown") {
        // Forward
        if (e.code === "KeyW" || e.code === "KeyD") {
            command = 2;
        }
        // Backwards
        if (e.code === "KeyS" || e.code === "KeyA") {
            command = 3;
        }
        if ( e.code === "Space") {
            if (Date.now() - last_space_timestamp < 1000) {
                ipcRenderer.send('sendCtrlFrame',{"vcu_set_state": 7});
            } else {
                last_space_timestamp = Date.now();
            }
        }
    }
    if (e.type === "keyUp") {
        if (e.code === "KeyW" || e.code === "KeyS" ) {
            command = 1;
        }
    }
}, true);

document.documentElement.addEventListener('keydown', function (e) {
    if (e.code === "Space") {
        e.preventDefault();
    }
});

// Send direction commands with heartbeat frequency
setInterval( () => {
    if (crawlEnabled) ipcRenderer.send('sendCtrlFrame',{"crawl_cmd": command});
    if (crawlEnabled) console.log(command);
}, config.communication.heartbeat_freq);


const logViewer_button  = $("#logViewer_button");
const logging_button   = $("#logging_button");
const setup_button     = $("#setup_button");
const idle_button      = $("#idle_button");
const run_button       = $("#run_button");
const run_button_modal = $("#run_button_modal");
const emergency_button = $("#emergency_stop_button");

const no_conn_overlay = $('#no_connection_overlay');
const no_conn_music = document.getElementById("no_connection_music");
const conn_music    = document.getElementById("connection_music");
const success_music = document.getElementById("success_music");
const emergency_music = document.getElementById("emergency_music");

// Add event listeners for buttons
logViewer_button.on("click", () => {
    ipcRenderer.send("openLogViewer");
})
logging_button.on("click", () => {
    if (!this.isLogging) {
        ipcRenderer.send("startLogging");
        eventEmitter.emit("startLogging");
        logging_button.html("Stop Local Logging");
        this.isLogging = true;
    } else {
        ipcRenderer.send("stopLogging");
        eventEmitter.emit("stopLogging");
        logging_button.html("Start Local Logging");
        this.isLogging = false;
    }
});
idle_button.on("click", () => {
    ipcRenderer.send('sendCtrlFrame',{"vcu_set_state": 1});
});
setup_button.on("click", () => {
    if (setup_button.html() === "SETUP") {
        ipcRenderer.send('sendCtrlFrame',{"vcu_set_state": 2});
    } else {
        // Go to shutdown if we cancel the setup or go to shutdown after emergency
        ipcRenderer.send('sendCtrlFrame',{"vcu_set_state": 6});
    }

});
run_button.on("click", () => {
    $('#runModal').modal('hide');
    ipcRenderer.send('sendCtrlFrame',{"vcu_set_state": 4});
});
emergency_button.on("click", () => {
    ipcRenderer.send('sendCtrlFrame',{"vcu_set_state": 7});
});
ipcRenderer.on('telemetryFrame', (_event, frame) =>{
    setup_button.text("SETUP");
    switch(frame.State.STATE) {
        // IDLE
        case 1:
            idle_button.attr("disabled", false);
            setup_button.attr("disabled", false);
            run_button.attr("disabled", true);
            run_button_modal.attr("disabled", true);
            emergency_button.attr("disabled", false);
            break;
        // SETUP
        case 2: 
            setup_button.text("CANCEL SETUP");
            idle_button.attr("disabled", true);
            setup_button.attr("disabled", false);
            run_button.attr("disabled", true);
            run_button_modal.attr("disabled", true);
            emergency_button.attr("disabled", false);
            break;
        // READY
        case 3: 
            idle_button.attr("disabled", true);
            setup_button.attr("disabled", false);
            run_button.attr("disabled", false);
            run_button_modal.attr("disabled", false);
            emergency_button.attr("disabled", false);
            break;
        // RUN 
        case 4: 
            idle_button.attr("disabled", true);
            setup_button.attr("disabled", true);
            run_button.attr("disabled", true);
            run_button_modal.attr("disabled", true);
            emergency_button.attr("disabled", false);
            break;
        // BRAKING
        case 5: 
            idle_button.attr("disabled", true);
            setup_button.attr("disabled", true);
            run_button.attr("disabled", true);
            run_button_modal.attr("disabled", true);
            emergency_button.attr("disabled", false);
            break;
        // SHUTDOWN
        case 6: 
            idle_button.attr("disabled", false);
            setup_button.attr("disabled", true);
            run_button.attr("disabled", true);
            run_button_modal.attr("disabled", true);
            emergency_button.attr("disabled", false);
            break;
        // EMERGENCY
        case 7: 
            setup_button.text("SHUTDOWN");
            idle_button.attr("disabled", false);
            setup_button.attr("disabled", false);
            run_button.attr("disabled", true);
            run_button_modal.attr("disabled", true);
            emergency_button.attr("disabled", false);
            break;
        default:
            idle_button.attr("disabled", true);
            setup_button.attr("disabled", true);
            run_button.attr("disabled", true);
            run_button_modal.attr("disabled", true);
            emergency_button.attr("disabled", false);
            break;
    }

    // Handle automatic logging 
    if (config.logging.start_automatic && !this.isLogging)  {
        let main_name = mappings.select_flag(mappings.main_state, frame.State.STATE)
        if (main_name === config.logging.start_state) {
            setTimeout(function(){
                ipcRenderer.send("startLogging");
                eventEmitter.emit("startLogging");
                logging_button.html("Stop Local Logging");
                this.isLogging = true;
            }.bind(this), config.logging.start_delay);
        }
    }

    if (config.logging.stop_automatic && this.isLogging) {
        let main_name = mappings.select_flag(mappings.main_state, frame.State.STATE)
        if (main_name === config.logging.stop_state) {
            setTimeout(function(){
                ipcRenderer.send("stopLogging");
                eventEmitter.emit("stopLogging");
                logging_button.html("Start Local Logging");
                this.isLogging = false;
            }.bind(this), config.logging.stop_delay);
        }
    }
});

// Event emitter for riot-tags
ipcRenderer.on('telemetryFrame', (_event, frame) =>{
    // eventEmitter.emit("CORRAIL_VELOCITY", {value: frame["Corrail"]["CORRAIL_VELOCITY"]/typeset_telemetry_frame.Factor["Corrail"]["CORRAIL_VELOCITY"]*3.6});
    // eventEmitter.emit("CORRAIL_MAX_VELOCITY", {value: frame["Corrail"]["CORRAIL_MAX_VELOCITY"]/typeset_telemetry_frame.Factor["Corrail"]["CORRAIL_MAX_VELOCITY"]*3.6});
    let state = util.json_array_select_value(mappings.main_state,  frame["State"]["STATE"]);
    eventEmitter.emit("mainStatus", state.description);
});

let shutdown_state_transition = false;
let emergency_state_transition = false;
// Overlay
$(document).ready(function() {
    if (config.music.waiting) {
        no_conn_music.play();
        no_conn_music.loop = true;
    }
    ipcRenderer.on('missingHeartbeat', (function () {
        if (no_conn_overlay.css('display') === 'none') {
            if (config.music.waiting) {
                no_conn_music.pause();
                no_conn_music.currentTime = 0
                no_conn_music.play();
            }
            no_conn_overlay.show();
        }
    }));

    // Connection status:
    ipcRenderer.on('heartbeat', (function () {
        if (no_conn_overlay.css('display') !== 'none') {
            if (config.music.waiting) no_conn_music.pause();
            if (config.music.onConnection) {
                conn_music.currentTime = 0
                conn_music.play();
            }
            no_conn_overlay.hide();
        }
    }));

    eventEmitter.on('mainStatus', (function(state) {
        if (state === "Shutdown") {
            if (shutdown_state_transition == false) {
                shutdown_state_transition = true;
                if (config.music.onSuccess) {
                    success_music.currentTime = 0;
                    success_music.play();
                }
            }
        }else if (state === "Emergency") {
            if (emergency_state_transition == false) {
                emergency_state_transition = true;
                if (config.music.onEmergency) {
                    emergency_music.currentTime = 0;
                    emergency_music.play();
                }
            }
        } else {
            shutdown_state_transition = false;
            emergency_state_transition = false;
            if (config.music.onSuccess) success_music.pause();
            if (config.music.onEmergency) emergency_music.pause();
        }
    }));
});


// Mount status display:
riot.mount('status-display', {
    "commandEmitter": eventEmitter,
    "ipcRenderer": ipcRenderer
});