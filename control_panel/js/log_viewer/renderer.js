/**
 * @file      renderer.js
 * @brief     Main renderer for log viewer
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
 * @module LogView:Main
 * @version 3.0.0
 *
 */

const { dialog } = require('@electron/remote')
const mainWindow = require('@electron/remote').getCurrentWindow()

const EventEmitter = require('events').EventEmitter;
let eventEmitter = new EventEmitter();
eventEmitter.setMaxListeners(Infinity);

// Initialize & load modules
let logView_1_config = {
    id: 'logViewChart_1'
}

const btn_open_vcu_log          = $("#btn_open_vcu_log");
const btn_open_controlpanel_log = $("#btn_open_controlpanel_log");
const btn_open_inverter_log     = $("#btn_open_inverter_log");
const btn_close                 = $("#btn_close");
const btn_home                  = $('#btn_home')
const btn_fit_x                  = $('#btn_fit_x')
const btn_fit_y                  = $('#btn_fit_y')

// Initialize & load modules
const logView_1 = require('./logView.js')(eventEmitter, logView_1_config);

btn_open_vcu_log.on("click", () => {
    return;
});

btn_open_controlpanel_log.on("click", () => {
    let file = dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Log', extensions: ['csv'] }]
    }).then (result => {
        logView_1.openLog_ControlPanel(result.filePaths[0]);
    });
});

btn_open_inverter_log.on("click", () => {
    return;
});

btn_home.on("click", () => {
    logView_1.fitAxis({x: true, y:true})
});

btn_fit_x.on("click", () => {
    logView_1.fitAxis({x: true})
});

btn_fit_y.on("click", () => {
    logView_1.fitAxis({y:true})
});

btn_close.on("click", () => {
    mainWindow.hide();
})